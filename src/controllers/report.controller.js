const db = require("../config/database");

/**
 * POST /api/reports  — public: gửi báo cáo lỗi
 */
async function create(req, res, next) {
  try {
    const { article_id, error_type, severity, description, quoted_text, suggested_source, reporter_email } = req.body;
    if (!article_id || !error_type || !description) {
      return res.status(400).json({ message: "Thiếu trường bắt buộc: article_id, error_type, description." });
    }

    // Verify article exists
    const [articles] = await db.execute("SELECT id FROM articles WHERE id = ? AND status = 'published'", [article_id]);
    if (!articles[0]) return res.status(404).json({ message: "Bài viết không tồn tại." });

    await db.execute(
      `INSERT INTO reports (article_id, error_type, severity, description, quoted_text, suggested_source, reporter_email)
       VALUES (?,?,?,?,?,?,?)`,
      [article_id, error_type, severity || "medium", description,
       quoted_text || null, suggested_source || null, reporter_email || null]
    );

    res.status(201).json({ message: "Báo cáo đã được gửi. Cảm ơn bạn!" });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/admin/reports  — admin: danh sách báo cáo
 */
async function getAll(req, res, next) {
  try {
    const { status, severity } = req.query;
    const conditions = [];
    const params = [];

    if (status)   { conditions.push("r.status = ?");   params.push(status); }
    if (severity) { conditions.push("r.severity = ?"); params.push(severity); }

    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

    const [rows] = await db.execute(
      `SELECT r.*, a.title AS article_title, a.slug AS article_slug
       FROM reports r
       JOIN articles a ON r.article_id = a.id
       ${where}
       ORDER BY
         CASE r.severity WHEN 'high' THEN 1 WHEN 'medium' THEN 2 ELSE 3 END,
         r.created_at DESC`,
      params
    );

    res.json({ data: rows, total: rows.length });
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/admin/reports/:id/assign
 */
async function assign(req, res, next) {
  try {
    const { admin_id } = req.body;
    await db.execute(
      "UPDATE reports SET assigned_to = ?, status = 'reviewing' WHERE id = ?",
      [admin_id, req.params.id]
    );
    res.json({ message: "Đã phân công báo cáo." });
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/admin/reports/:id/resolve
 */
async function resolve(req, res, next) {
  try {
    await db.execute(
      "UPDATE reports SET status = 'resolved', resolved_by = ?, resolved_at = NOW(), admin_note = ? WHERE id = ?",
      [req.admin.id, req.body.admin_note || null, req.params.id]
    );
    res.json({ message: "Đã xử lý báo cáo." });
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/admin/reports/:id/reject
 */
async function reject(req, res, next) {
  try {
    await db.execute(
      "UPDATE reports SET status = 'rejected', admin_note = ? WHERE id = ?",
      [req.body.admin_note || null, req.params.id]
    );
    res.json({ message: "Đã từ chối báo cáo." });
  } catch (err) {
    next(err);
  }
}

module.exports = { create, getAll, assign, resolve, reject };
