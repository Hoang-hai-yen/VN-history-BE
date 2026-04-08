const db = require("../config/database");

async function getAll(req, res, next) {
  try {
    const { type } = req.query;
    let sql = "SELECT * FROM categories";
    const params = [];
    if (type) {
      sql += " WHERE article_type = ? OR article_type IS NULL";
      params.push(type);
    }
    sql += " ORDER BY article_type ASC, sort_order ASC";

    const [rows] = await db.execute(sql, params);
    res.json({ data: rows, total: rows.length });
  } catch (err) {
    next(err);
  }
}

module.exports = { getAll };
