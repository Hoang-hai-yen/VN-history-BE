const { v4: uuidv4 } = require("uuid");
const db = require("../config/database");

// ── Public ────────────────────────────────────────────────────

/**
 * GET /api/timeline
 * Public: trả về tất cả triều đại kèm danh sách bài published
 */
async function getPublic(req, res, next) {
  try {
    // Lấy tất cả triều đại
    const [dynasties] = await db.execute(
      "SELECT id, name, slug, year_start, year_end, year_display, description, sort_order FROM dynasties ORDER BY sort_order ASC"
    );

    // Lấy tất cả timeline_events + thông tin bài published
    const [events] = await db.execute(
      `SELECT
         te.id, te.dynasty_id, te.note, te.sort_order,
         a.id          AS article_id,
         a.title, a.slug, a.type, a.year_start AS article_year,
         a.year_display, a.summary, a.status,
         c.name AS category_name
       FROM timeline_events te
       JOIN  articles   a ON te.article_id  = a.id
       LEFT JOIN categories c ON a.category_id = c.id
       WHERE a.status = 'published'
       ORDER BY te.dynasty_id, te.sort_order ASC, a.year_start ASC`
    );

    // Group events by dynasty_id
    const eventsByDynasty = {};
    events.forEach((e) => {
      if (!eventsByDynasty[e.dynasty_id]) eventsByDynasty[e.dynasty_id] = [];
      eventsByDynasty[e.dynasty_id].push(e);
    });

    const result = dynasties.map((d) => ({
      ...d,
      events: eventsByDynasty[d.id] || [],
    }));

    res.json({ data: result });
  } catch (err) {
    next(err);
  }
}

// ── Admin ─────────────────────────────────────────────────────

/**
 * GET /api/admin/timeline
 * Admin: danh sách kỳ/triều đại kèm tổng số sự kiện
 */
async function getPeriods(req, res, next) {
  try {
    const [rows] = await db.execute(
      `SELECT
         d.id, d.name, d.slug, d.year_start, d.year_end, d.year_display,
         d.description, d.sort_order,
         COUNT(te.id) AS event_count
       FROM dynasties d
       LEFT JOIN timeline_events te ON te.dynasty_id = d.id
       GROUP BY d.id
       ORDER BY d.sort_order ASC`
    );
    res.json({ data: rows, total: rows.length });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/admin/timeline/:dynastyId/events
 * Admin: danh sách sự kiện trong một kỳ (bao gồm mọi status)
 */
async function getEvents(req, res, next) {
  try {
    const { dynastyId } = req.params;

    const [dynasty] = await db.execute("SELECT id, name FROM dynasties WHERE id = ?", [dynastyId]);
    if (!dynasty[0]) return res.status(404).json({ message: "Không tìm thấy triều đại." });

    const [rows] = await db.execute(
      `SELECT
         te.id, te.note, te.sort_order, te.created_at,
         a.id          AS article_id,
         a.title, a.slug, a.type, a.status,
         a.year_start  AS article_year,
         a.year_display,
         c.name        AS category_name,
         adm.full_name AS created_by_name
       FROM timeline_events te
       JOIN  articles   a   ON te.article_id  = a.id
       LEFT JOIN categories c   ON a.category_id  = c.id
       LEFT JOIN admins     adm ON a.created_by    = adm.id
       WHERE te.dynasty_id = ?
       ORDER BY te.sort_order ASC, a.year_start ASC`,
      [dynastyId]
    );

    res.json({ dynasty: dynasty[0], data: rows, total: rows.length });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/admin/timeline/:dynastyId/events
 * Thêm bài viết vào timeline của một kỳ
 */
async function addEvent(req, res, next) {
  try {
    const { dynastyId } = req.params;
    const { article_id, note, sort_order } = req.body;

    if (!article_id) return res.status(400).json({ message: "Thiếu article_id." });

    const [dynasty] = await db.execute("SELECT id FROM dynasties WHERE id = ?", [dynastyId]);
    if (!dynasty[0]) return res.status(404).json({ message: "Không tìm thấy triều đại." });

    const [article] = await db.execute("SELECT id, title FROM articles WHERE id = ?", [article_id]);
    if (!article[0]) return res.status(404).json({ message: "Không tìm thấy bài viết." });

    const id = uuidv4();
    await db.execute(
      "INSERT INTO timeline_events (id, dynasty_id, article_id, note, sort_order, created_by) VALUES (?,?,?,?,?,?)",
      [id, dynastyId, article_id, note || null, sort_order ?? 0, req.admin.id]
    );

    await db.execute(
      "INSERT INTO activity_logs (admin_id, action, target_type, target_id, target_title, detail, ip_address) VALUES (?,?,?,?,?,?,?)",
      [req.admin.id, "add_timeline_event", "article", article[0].id, article[0].title, `dynasty_id=${dynastyId}`, req.ip || null]
    );

    const [created] = await db.execute("SELECT * FROM timeline_events WHERE id = ?", [id]);
    res.status(201).json({ data: created[0] });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ message: "Bài viết đã có trong timeline của triều đại này." });
    }
    next(err);
  }
}

/**
 * PUT /api/admin/timeline/events/:id
 * Cập nhật note / sort_order
 */
async function updateEvent(req, res, next) {
  try {
    const [rows] = await db.execute("SELECT id FROM timeline_events WHERE id = ?", [req.params.id]);
    if (!rows[0]) return res.status(404).json({ message: "Không tìm thấy sự kiện trong timeline." });

    const { note, sort_order } = req.body;
    await db.execute(
      "UPDATE timeline_events SET note = ?, sort_order = ?, updated_at = NOW() WHERE id = ?",
      [note ?? null, sort_order ?? 0, req.params.id]
    );

    const [updated] = await db.execute("SELECT * FROM timeline_events WHERE id = ?", [req.params.id]);
    res.json({ data: updated[0] });
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/admin/timeline/events/:id
 * Xoá sự kiện khỏi timeline (không xoá bài viết)
 */
async function removeEvent(req, res, next) {
  try {
    const [rows] = await db.execute("SELECT id FROM timeline_events WHERE id = ?", [req.params.id]);
    if (!rows[0]) return res.status(404).json({ message: "Không tìm thấy sự kiện trong timeline." });

    await db.execute("DELETE FROM timeline_events WHERE id = ?", [req.params.id]);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = { getPublic, getPeriods, getEvents, addEvent, updateEvent, removeEvent };
