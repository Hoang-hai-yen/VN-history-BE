const { v4: uuidv4 } = require("uuid");
const db = require("../config/database");

// ── Helpers ──────────────────────────────────────────────────

function paginate(page, limit) {
  const p = Math.max(1, parseInt(page) || 1);
  const l = Math.min(100, Math.max(1, parseInt(limit) || 20));
  return { page: p, limit: l, offset: (p - 1) * l };
}

async function logActivity(adminId, action, targetId, targetTitle, detail, ip) {
  await db.execute(
    "INSERT INTO activity_logs (admin_id, action, target_type, target_id, target_title, detail, ip_address) VALUES (?,?,?,?,?,?,?)",
    [adminId, action, "article", targetId, targetTitle, detail || null, ip || null]
  );
}

// ── Public ────────────────────────────────────────────────────

/**
 * GET /api/articles
 * Public: chỉ trả về published. Admin: có thể lọc theo status.
 */
async function getAll(req, res, next) {
  try {
    const { type, dynasty_id, category_id, is_featured, q, status, year_from, year_to } = req.query;
    const { page, limit, offset } = paginate(req.query.page, req.query.limit);

    // Public route chỉ cho phép xem published
    const effectiveStatus = req.admin ? status || null : "published";

    const conditions = [];
    const params = [];

    if (effectiveStatus) { conditions.push("a.status = ?"); params.push(effectiveStatus); }
    if (type)            { conditions.push("a.type = ?");   params.push(type); }
    if (dynasty_id)      { conditions.push("a.dynasty_id = ?"); params.push(dynasty_id); }
    if (category_id)     { conditions.push("a.category_id = ?"); params.push(category_id); }
    if (is_featured !== undefined) { conditions.push("a.is_featured = ?"); params.push(is_featured === "true" ? 1 : 0); }
    if (year_from)       { conditions.push("a.year_start >= ?"); params.push(parseInt(year_from)); }
    if (year_to)         { conditions.push("a.year_start <= ?"); params.push(parseInt(year_to)); }
    if (q)               { conditions.push("MATCH(a.title, a.summary, a.content) AGAINST(? IN BOOLEAN MODE)"); params.push(`${q}*`); }

    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

    const [countRows] = await db.execute(
      `SELECT COUNT(*) AS total FROM articles a ${where}`,
      params
    );
    const total = countRows[0].total;

    const [rows] = await db.query(
      `SELECT a.id, a.title, a.subtitle, a.slug, a.summary, a.type, a.status,
              a.year_start, a.year_end, a.year_display, a.is_featured, a.published_at,
              d.name AS dynasty_name, d.slug AS dynasty_slug,
              c.name AS category_name, c.slug AS category_slug
       FROM articles a
       LEFT JOIN dynasties  d ON a.dynasty_id  = d.id
       LEFT JOIN categories c ON a.category_id = c.id
       ${where}
       ORDER BY a.year_start ASC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    res.json({
      data: rows,
      pagination: { total, page, limit, total_pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/articles/:slug  (public)
 */
async function getBySlug(req, res, next) {
  try {
    const [rows] = await db.execute(
      `SELECT a.*,
              d.name AS dynasty_name, d.slug AS dynasty_slug,
              c.name AS category_name, c.slug AS category_slug
       FROM articles a
       LEFT JOIN dynasties  d ON a.dynasty_id  = d.id
       LEFT JOIN categories c ON a.category_id = c.id
       WHERE a.slug = ? AND a.status = 'published'`,
      [req.params.slug]
    );
    if (!rows[0]) return res.status(404).json({ message: "Không tìm thấy bài viết." });

    const article = rows[0];

    // Fetch related data in parallel
    const [media, persons, places, sources, related] = await Promise.all([
      db.execute("SELECT * FROM media WHERE article_id = ? ORDER BY sort_order", [article.id]),
      db.execute(
        `SELECT hp.*, ap.role_in_event
         FROM historical_persons hp
         JOIN article_persons ap ON hp.id = ap.person_id
         WHERE ap.article_id = ?`,
        [article.id]
      ),
      db.execute(
        `SELECT p.* FROM places p
         JOIN article_places apl ON p.id = apl.place_id
         WHERE apl.article_id = ?`,
        [article.id]
      ),
      db.execute("SELECT * FROM sources WHERE article_id = ? ORDER BY sort_order", [article.id]),
      db.execute(
        `SELECT a2.id, a2.title, a2.slug, a2.type, a2.year_display, ar.relation_type
         FROM article_related ar
         JOIN articles a2 ON ar.related_id = a2.id
         WHERE ar.article_id = ? AND a2.status = 'published'`,
        [article.id]
      ),
    ]);

    // Increment view count (fire-and-forget)
    db.execute("UPDATE articles SET updated_at = updated_at WHERE id = ?", [article.id]).catch(() => {});

    res.json({
      data: {
        ...article,
        media: media[0],
        persons: persons[0],
        places: places[0],
        sources: sources[0],
        related: related[0],
      },
    });
  } catch (err) {
    next(err);
  }
}

// ── Admin ─────────────────────────────────────────────────────

/**
 * GET /api/admin/articles/:id  (admin — bất kỳ status nào)
 */
async function getById(req, res, next) {
  try {
    const [rows] = await db.execute(
      `SELECT a.*,
              d.name AS dynasty_name, d.slug AS dynasty_slug,
              c.name AS category_name, c.slug AS category_slug
       FROM articles a
       LEFT JOIN dynasties  d ON a.dynasty_id  = d.id
       LEFT JOIN categories c ON a.category_id = c.id
       WHERE a.id = ?`,
      [req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ message: "Không tìm thấy bài viết." });
    res.json({ data: rows[0] });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/admin/articles  — tạo bài (status = draft)
 */
async function create(req, res, next) {
  try {
    const { title, subtitle, slug, summary, content, quote, type,
            year_start, year_end, year_display, dynasty_id, category_id,
            is_featured, allow_comments } = req.body;

    if (!title || !slug || !summary || !content || !type) {
      return res.status(400).json({ message: "Thiếu trường bắt buộc: title, slug, summary, content, type." });
    }

    const id = uuidv4();
    await db.execute(
      `INSERT INTO articles
        (id, title, subtitle, slug, summary, content, quote, type,
         year_start, year_end, year_display, dynasty_id, category_id,
         is_featured, allow_comments, status, created_by)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,'draft',?)`,
      [id, title, subtitle || null, slug, summary, content, quote || null, type,
       year_start || null, year_end || null, year_display || null,
       dynasty_id || null, category_id || null,
       is_featured ? 1 : 0, allow_comments !== false ? 1 : 0,
       req.admin.id]
    );

    await logActivity(req.admin.id, "create_article", id, title, null, req.ip);

    const [rows] = await db.execute("SELECT * FROM articles WHERE id = ?", [id]);
    res.status(201).json({ data: rows[0] });
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/admin/articles/:id  — cập nhật (chỉ draft/rejected)
 */
async function update(req, res, next) {
  try {
    const [rows] = await db.execute("SELECT * FROM articles WHERE id = ?", [req.params.id]);
    const article = rows[0];
    if (!article) return res.status(404).json({ message: "Không tìm thấy bài viết." });
    if (!["draft", "rejected"].includes(article.status)) {
      return res.status(403).json({ message: "Chỉ được sửa bài ở trạng thái draft hoặc rejected." });
    }

    const allowed = ["title","subtitle","slug","summary","content","quote","type",
                     "year_start","year_end","year_display","dynasty_id","category_id",
                     "is_featured","allow_comments"];
    const fields = allowed.filter((k) => req.body[k] !== undefined);
    if (!fields.length) return res.status(400).json({ message: "Không có trường nào để cập nhật." });

    const sets = fields.map((k) => `\`${k}\` = ?`).join(", ");
    const values = fields.map((k) => req.body[k]);

    await db.execute(
      `UPDATE articles SET ${sets}, updated_by = ? WHERE id = ?`,
      [...values, req.admin.id, req.params.id]
    );

    await logActivity(req.admin.id, "update_article", article.id, article.title, null, req.ip);

    const [updated] = await db.execute("SELECT * FROM articles WHERE id = ?", [req.params.id]);
    res.json({ data: updated[0] });
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/admin/articles/:id/submit  — draft → pending
 */
async function submit(req, res, next) {
  try {
    const [rows] = await db.execute("SELECT * FROM articles WHERE id = ?", [req.params.id]);
    const article = rows[0];
    if (!article) return res.status(404).json({ message: "Không tìm thấy bài viết." });
    if (article.status !== "draft") {
      return res.status(400).json({ message: "Chỉ bài viết draft mới có thể gửi duyệt." });
    }

    await db.execute(
      "UPDATE articles SET status = 'pending', updated_by = ? WHERE id = ?",
      [req.admin.id, article.id]
    );
    res.json({ message: "Đã gửi bài chờ duyệt." });
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/admin/articles/:id/publish  — pending → published
 */
async function publish(req, res, next) {
  try {
    const [rows] = await db.execute("SELECT * FROM articles WHERE id = ?", [req.params.id]);
    const article = rows[0];
    if (!article) return res.status(404).json({ message: "Không tìm thấy bài viết." });
    if (article.status !== "pending") {
      return res.status(400).json({ message: "Chỉ bài viết pending mới có thể duyệt đăng." });
    }

    await db.execute(
      "UPDATE articles SET status = 'published', published_by = ?, published_at = NOW() WHERE id = ?",
      [req.admin.id, article.id]
    );

    await logActivity(req.admin.id, "publish_article", article.id, article.title, null, req.ip);
    res.json({ message: "Bài viết đã được xuất bản." });
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/admin/articles/:id/reject  — pending → rejected
 */
async function reject(req, res, next) {
  try {
    const [rows] = await db.execute("SELECT * FROM articles WHERE id = ?", [req.params.id]);
    const article = rows[0];
    if (!article) return res.status(404).json({ message: "Không tìm thấy bài viết." });
    if (article.status !== "pending") {
      return res.status(400).json({ message: "Chỉ bài viết pending mới có thể từ chối." });
    }

    await db.execute(
      "UPDATE articles SET status = 'rejected', rejection_note = ?, updated_by = ? WHERE id = ?",
      [req.body.rejection_note || null, req.admin.id, article.id]
    );

    await logActivity(req.admin.id, "reject_article", article.id, article.title,
      req.body.rejection_note || null, req.ip);
    res.json({ message: "Đã từ chối bài viết." });
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/admin/articles/:id
 */
async function remove(req, res, next) {
  try {
    const [rows] = await db.execute("SELECT id, title FROM articles WHERE id = ?", [req.params.id]);
    if (!rows[0]) return res.status(404).json({ message: "Không tìm thấy bài viết." });

    await db.execute("DELETE FROM articles WHERE id = ?", [req.params.id]);
    await logActivity(req.admin.id, "delete_article", rows[0].id, rows[0].title, null, req.ip);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/admin/dashboard
 */
async function dashboard(req, res, next) {
  try {
    const [stats] = await db.execute("SELECT * FROM dashboard_stats");
    res.json({ data: stats[0] });
  } catch (err) {
    next(err);
  }
}

module.exports = { getAll, getBySlug, getById, create, update, submit, publish, reject, remove, dashboard };
