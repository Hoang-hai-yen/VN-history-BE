const db = require("../config/database");

/**
 * GET /api/admin/settings
 * Trả về tất cả settings dưới dạng object key-value
 */
async function getAll(req, res, next) {
  try {
    const [rows] = await db.execute(
      "SELECT `key`, value, description, updated_at FROM settings ORDER BY `key` ASC"
    );

    // Chuyển mảng thành object cho tiện sử dụng ở FE
    const asObject = {};
    rows.forEach((r) => { asObject[r.key] = r; });

    res.json({ data: rows, asObject });
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/admin/settings
 * Cập nhật một hoặc nhiều settings — super_admin only
 * Body: { site_name: "...", allow_comments: "true", ... }
 */
async function update(req, res, next) {
  try {
    const entries = Object.entries(req.body).filter(([, v]) => v !== undefined && v !== null);
    if (!entries.length) return res.status(400).json({ message: "Không có giá trị nào để cập nhật." });

    // Lấy danh sách key hợp lệ
    const [validKeys] = await db.execute("SELECT `key` FROM settings");
    const allowedKeys = new Set(validKeys.map((r) => r.key));

    const invalid = entries.filter(([k]) => !allowedKeys.has(k)).map(([k]) => k);
    if (invalid.length) {
      return res.status(400).json({ message: `Key không hợp lệ: ${invalid.join(", ")}.` });
    }

    for (const [key, value] of entries) {
      await db.execute(
        "UPDATE settings SET value = ?, updated_by = ? WHERE `key` = ?",
        [String(value), req.admin.id, key]
      );
    }

    await db.execute(
      "INSERT INTO activity_logs (admin_id, action, target_type, target_id, target_title, detail, ip_address) VALUES (?,?,?,?,?,?,?)",
      [req.admin.id, "update_settings", "settings", null,
       "Settings", entries.map(([k]) => k).join(", "), req.ip || null]
    );

    const [updated] = await db.execute(
      "SELECT `key`, value, description, updated_at FROM settings ORDER BY `key` ASC"
    );
    res.json({ data: updated });
  } catch (err) {
    next(err);
  }
}

module.exports = { getAll, update };
