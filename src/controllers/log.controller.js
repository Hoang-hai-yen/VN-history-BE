const db = require("../config/database");

function paginate(page, limit) {
  const p = Math.max(1, parseInt(page) || 1);
  const l = Math.min(100, Math.max(1, parseInt(limit) || 20));
  return { page: p, limit: l, offset: (p - 1) * l };
}

/**
 * GET /api/admin/logs
 * Nhật ký hoạt động — append-only, không sửa/xoá
 */
async function getAll(req, res, next) {
  try {
    const { admin_id, action, target_type, date_from, date_to } = req.query;
    const { page, limit, offset } = paginate(req.query.page, req.query.limit);

    const conditions = [];
    const params = [];

    if (admin_id)   { conditions.push("l.admin_id = ?");    params.push(admin_id); }
    if (action)     { conditions.push("l.action = ?");      params.push(action); }
    if (target_type){ conditions.push("l.target_type = ?"); params.push(target_type); }
    if (date_from)  { conditions.push("DATE(l.created_at) >= ?"); params.push(date_from); }
    if (date_to)    { conditions.push("DATE(l.created_at) <= ?"); params.push(date_to); }

    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

    const [countRows] = await db.execute(
      `SELECT COUNT(*) AS total FROM activity_logs l ${where}`,
      params
    );
    const total = countRows[0].total;

    const [rows] = await db.query(
      `SELECT
         l.id, l.action, l.target_type, l.target_id, l.target_title,
         l.detail, l.ip_address, l.created_at,
         a.full_name AS admin_name, a.email AS admin_email, a.role AS admin_role
       FROM activity_logs l
       LEFT JOIN admins a ON l.admin_id = a.id
       ${where}
       ORDER BY l.created_at DESC
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
 * GET /api/admin/logs/actions
 * Trả về danh sách action types đã có (dùng cho dropdown lọc)
 */
async function getActionTypes(req, res, next) {
  try {
    const [rows] = await db.execute(
      "SELECT DISTINCT action FROM activity_logs ORDER BY action ASC"
    );
    res.json({ data: rows.map((r) => r.action) });
  } catch (err) {
    next(err);
  }
}

module.exports = { getAll, getActionTypes };
