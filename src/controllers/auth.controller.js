const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const db = require("../config/database");

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Vui lòng nhập email và mật khẩu." });
    }

    const [rows] = await db.execute(
      "SELECT id, full_name, email, password_hash, role, is_active FROM admins WHERE email = ?",
      [email]
    );

    const admin = rows[0];
    if (!admin || !admin.is_active) {
      return res.status(401).json({ message: "Email hoặc mật khẩu không đúng." });
    }

    const valid = await bcrypt.compare(password, admin.password_hash);
    if (!valid) {
      return res.status(401).json({ message: "Email hoặc mật khẩu không đúng." });
    }

    const token = jwt.sign(
      { id: admin.id, email: admin.email, role: admin.role, full_name: admin.full_name },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "8h" }
    );

    // Log last login + create session record
    const expiresAt = new Date(Date.now() + 8 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 19)
      .replace("T", " ");
    await Promise.all([
      db.execute("UPDATE admins SET last_login_at = NOW() WHERE id = ?", [admin.id]),
      db.execute(
        "INSERT INTO admin_sessions (id, admin_id, token_hash, ip_address, user_agent, expires_at) VALUES (?,?,?,?,?,?)",
        [uuidv4(), admin.id, token.slice(-40), req.ip, req.headers["user-agent"] || null, expiresAt]
      ),
    ]);

    res.json({
      token,
      admin: { id: admin.id, full_name: admin.full_name, email: admin.email, role: admin.role },
    });
  } catch (err) {
    next(err);
  }
}

async function logout(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;
    if (token) {
      await db.execute("DELETE FROM admin_sessions WHERE token_hash = ?", [token.slice(-40)]);
    }
    res.json({ message: "Đăng xuất thành công." });
  } catch (err) {
    next(err);
  }
}

async function me(req, res) {
  res.json({ data: req.admin });
}

module.exports = { login, logout, me };
