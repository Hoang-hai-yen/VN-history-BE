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

    // UC9 BR4: kiểm tra duplicate trong 24 giờ (theo reporter_email hoặc IP)
    const reporterKey = reporter_email || req.ip;
    if (reporterKey) {
      const [dup] = await db.execute(
        `SELECT id FROM reports
         WHERE article_id = ?
           AND (reporter_email = ? OR reporter_email IS NULL)
           AND created_at > DATE_SUB(NOW(), INTERVAL 24 HOUR)
         LIMIT 1`,
        [article_id, reporter_email || null]
      );
      if (dup[0]) {
        return res.status(429).json({
          message: "Bạn đã gửi báo cáo cho bài viết này trong vòng 24 giờ qua.",
        });
      }
    }

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

    // Admin chỉ thấy báo cáo được giao cho mình, super_admin thấy tất cả
    if (req.admin.role === "admin") {
      conditions.push("r.assigned_to = ?");
      params.push(req.admin.id);
    }

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
    await db.execute(
      "INSERT INTO activity_logs (admin_id, action, target_type, target_id, target_title, ip_address) VALUES (?,?,?,?,?,?)",
      [req.admin.id, "assign_report", "report", req.params.id, `Báo cáo #${req.params.id}`, req.ip || null]
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
    await db.execute(
      "INSERT INTO activity_logs (admin_id, action, target_type, target_id, target_title, ip_address) VALUES (?,?,?,?,?,?)",
      [req.admin.id, "resolve_report", "report", req.params.id, `Báo cáo #${req.params.id}`, req.ip || null]
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
    await db.execute(
      "INSERT INTO activity_logs (admin_id, action, target_type, target_id, target_title, ip_address) VALUES (?,?,?,?,?,?)",
      [req.admin.id, "reject_report", "report", req.params.id, `Báo cáo #${req.params.id}`, req.ip || null]
    );
    res.json({ message: "Đã từ chối báo cáo." });
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/admin/reports/:id/flag
 * Cờ kiểm tra — đánh dấu cần academic review (UC-A5 BR2)
 */
async function flag(req, res, next) {
  try {
    const [rows] = await db.execute(
      "SELECT id, status FROM reports WHERE id = ?", [req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ message: "Không tìm thấy báo cáo." });
    if (!["new", "reviewing"].includes(rows[0].status)) {
      return res.status(400).json({ message: "Chỉ báo cáo chưa xử lý mới có thể đánh cờ." });
    }

    await db.execute(
      "UPDATE reports SET status = 'flagged', admin_note = ? WHERE id = ?",
      [req.body.admin_note || null, req.params.id]
    );
    res.json({ message: "Đã đánh cờ kiểm tra báo cáo." });
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/admin/reports/:id/save-note — lưu ghi chú nội bộ
 */
async function saveNote(req, res, next) {
  try {
    await db.execute(
      "UPDATE reports SET admin_note = ? WHERE id = ?",
      [req.body.admin_note || null, req.params.id]
    );
    res.json({ message: "Đã lưu ghi chú." });
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/admin/reports/:id/mark-fixed — admin đánh dấu đã sửa, chờ super admin xác nhận
 */
async function markFixed(req, res, next) {
  try {
    const [rows] = await db.execute("SELECT id, status, assigned_to FROM reports WHERE id = ?", [req.params.id]);
    if (!rows[0]) return res.status(404).json({ message: "Không tìm thấy báo cáo." });
    if (!["reviewing"].includes(rows[0].status)) {
      return res.status(400).json({ message: "Chỉ báo cáo đang xử lý mới có thể đánh dấu đã sửa." });
    }
    // Admin chỉ được mark-fixed báo cáo được giao cho mình
    if (req.admin.role === "admin" && rows[0].assigned_to !== req.admin.id) {
      return res.status(403).json({ message: "Bạn không có quyền thao tác báo cáo này." });
    }
    await db.execute(
      "UPDATE reports SET status = 'fixed', admin_note = ? WHERE id = ?",
      [req.body.admin_note || null, req.params.id]
    );
    await db.execute(
      "INSERT INTO activity_logs (admin_id, action, target_type, target_id, target_title, ip_address) VALUES (?,?,?,?,?,?)",
      [req.admin.id, "mark_fixed_report", "report", req.params.id, `Báo cáo #${req.params.id}`, req.ip || null]
    );
    res.json({ message: "Đã đánh dấu đã sửa xong, chờ super admin xác nhận." });
  } catch (err) {
    next(err);
  }
}

module.exports = { create, getAll, assign, resolve, reject, flag, saveNote, markFixed };
