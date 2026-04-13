const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require("uuid");
const db = require("../config/database");

async function logActivity(adminId, action, targetId, targetTitle, detail, ip) {
  await db.execute(
    "INSERT INTO activity_logs (admin_id, action, target_type, target_id, target_title, detail, ip_address) VALUES (?,?,?,?,?,?,?)",
    [adminId, action, "admin", targetId, targetTitle, detail || null, ip || null]
  );
}

/**
 * GET /api/admin/admins
 * Danh sách admin kèm thống kê bài viết & báo cáo đã xử lý
 */
async function getAll(req, res, next) {
  try {
    const [rows] = await db.execute(
      `SELECT
         a.id, a.full_name, a.email, a.role, a.is_active,
         a.avatar_url, a.last_login_at, a.created_at,
         COUNT(DISTINCT art.id)                                    AS article_count,
         COUNT(DISTINCT r.id)                                      AS resolved_report_count
       FROM admins a
       LEFT JOIN articles art ON art.created_by = a.id
       LEFT JOIN reports  r   ON r.resolved_by  = a.id
       GROUP BY a.id
       ORDER BY a.created_at DESC`
    );
    res.json({ data: rows, total: rows.length });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/admin/admins/:id
 */
async function getById(req, res, next) {
  try {
    const [rows] = await db.execute(
      `SELECT
         a.id, a.full_name, a.email, a.role, a.is_active,
         a.avatar_url, a.last_login_at, a.created_at, a.updated_at,
         cb.full_name AS created_by_name
       FROM admins a
       LEFT JOIN admins cb ON a.created_by = cb.id
       WHERE a.id = ?`,
      [req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ message: "Không tìm thấy admin." });
    res.json({ data: rows[0] });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/admin/admins  — super_admin only
 */
async function create(req, res, next) {
  try {
    const { full_name, email, password, role } = req.body;
    if (!full_name || !email || !password) {
      return res.status(400).json({ message: "Thiếu trường bắt buộc: full_name, email, password." });
    }

    const [existing] = await db.execute("SELECT id FROM admins WHERE email = ?", [email]);
    if (existing[0]) return res.status(409).json({ message: "Email đã tồn tại." });

    const id = uuidv4();
    const hash = await bcrypt.hash(password, 12);
    const adminRole = role === "super_admin" ? "super_admin" : "admin";

    await db.execute(
      "INSERT INTO admins (id, full_name, email, password_hash, role, is_active, created_by) VALUES (?,?,?,?,?,1,?)",
      [id, full_name, email, hash, adminRole, req.admin.id]
    );

    await logActivity(req.admin.id, "create_admin", id, full_name, `role=${adminRole}`, req.ip);

    const [created] = await db.execute(
      "SELECT id, full_name, email, role, is_active, created_at FROM admins WHERE id = ?",
      [id]
    );
    res.status(201).json({ data: created[0] });
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/admin/admins/:id  — super_admin only
 * Cập nhật thông tin / role / trạng thái
 */
async function update(req, res, next) {
  try {
    const [rows] = await db.execute("SELECT id, full_name FROM admins WHERE id = ?", [req.params.id]);
    if (!rows[0]) return res.status(404).json({ message: "Không tìm thấy admin." });

    // Không cho phép super_admin tự thu hồi quyền của mình
    if (req.params.id === req.admin.id && req.body.role && req.body.role !== "super_admin") {
      return res.status(400).json({ message: "Không thể thay đổi role của chính mình." });
    }

    const allowed = ["full_name", "role", "is_active", "avatar_url"];
    const fields = allowed.filter((k) => req.body[k] !== undefined);

    if (req.body.password) {
      const hash = await bcrypt.hash(req.body.password, 12);
      fields.push("password_hash");
      req.body.password_hash = hash;
    }

    if (!fields.length) return res.status(400).json({ message: "Không có trường nào để cập nhật." });

    const sets = fields.map((k) => `\`${k}\` = ?`).join(", ");
    const values = fields.map((k) => req.body[k]);

    await db.execute(
      `UPDATE admins SET ${sets}, updated_at = NOW() WHERE id = ?`,
      [...values, req.params.id]
    );

    await logActivity(req.admin.id, "update_admin", rows[0].id, rows[0].full_name,
      fields.filter(f => f !== 'password_hash').join(","), req.ip);

    const [updated] = await db.execute(
      "SELECT id, full_name, email, role, is_active, avatar_url, last_login_at, updated_at FROM admins WHERE id = ?",
      [req.params.id]
    );
    res.json({ data: updated[0] });
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/admin/admins/:id/toggle  — kích hoạt / vô hiệu hoá
 */
async function toggleActive(req, res, next) {
  try {
    if (req.params.id === req.admin.id) {
      return res.status(400).json({ message: "Không thể vô hiệu hoá tài khoản của chính mình." });
    }

    const [rows] = await db.execute("SELECT id, full_name, is_active FROM admins WHERE id = ?", [req.params.id]);
    if (!rows[0]) return res.status(404).json({ message: "Không tìm thấy admin." });

    const newState = rows[0].is_active ? 0 : 1;
    await db.execute("UPDATE admins SET is_active = ?, updated_at = NOW() WHERE id = ?", [newState, req.params.id]);

    await logActivity(req.admin.id, newState ? "activate_admin" : "deactivate_admin",
      rows[0].id, rows[0].full_name, null, req.ip);

    res.json({ message: newState ? "Đã kích hoạt tài khoản." : "Đã vô hiệu hoá tài khoản.", is_active: newState });
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/admin/admins/:id  — super_admin only, không tự xoá mình
 */
async function remove(req, res, next) {
  try {
    if (req.params.id === req.admin.id) {
      return res.status(400).json({ message: "Không thể xoá tài khoản của chính mình." });
    }

    const [rows] = await db.execute("SELECT id, full_name FROM admins WHERE id = ?", [req.params.id]);
    if (!rows[0]) return res.status(404).json({ message: "Không tìm thấy admin." });

    await db.execute("DELETE FROM admins WHERE id = ?", [req.params.id]);
    await logActivity(req.admin.id, "delete_admin", rows[0].id, rows[0].full_name, null, req.ip);

    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = { getAll, getById, create, update, toggleActive, remove };
