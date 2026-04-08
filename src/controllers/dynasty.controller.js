const db = require("../config/database");

async function getAll(req, res, next) {
  try {
    const [rows] = await db.execute(
      "SELECT * FROM dynasties ORDER BY sort_order ASC"
    );
    res.json({ data: rows, total: rows.length });
  } catch (err) {
    next(err);
  }
}

async function getBySlug(req, res, next) {
  try {
    const [rows] = await db.execute(
      "SELECT * FROM dynasties WHERE slug = ?",
      [req.params.slug]
    );
    if (!rows[0]) return res.status(404).json({ message: "Không tìm thấy triều đại." });
    res.json({ data: rows[0] });
  } catch (err) {
    next(err);
  }
}

module.exports = { getAll, getBySlug };
