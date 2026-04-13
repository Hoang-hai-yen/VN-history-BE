const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const db = require("../config/database");

const MAX_FAILED_ATTEMPTS = 5;
const LOCK_DURATION_MINUTES = 15;

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Vui lòng nhập email và mật khẩu." });
    }

    const [rows] = await db.execute(
      `SELECT id, full_name, email, password_hash, role,
              is_active, account_status, failed_login_count, locked_until
       FROM admins WHERE email = ?`,
      [email]
    );
    const admin = rows[0];

    // Không tiết lộ email có tồn tại hay không (tránh user enumeration)
    if (!admin) {
      return res.status(401).json({ message: "Email hoặc mật khẩu không đúng." });
    }

    // Kiểm tra trạng thái tài khoản
    if (admin.account_status === "inactive" || admin.is_active === 0) {
      return res.status(401).json({ message: "Tài khoản đã bị vô hiệu hoá. Vui lòng liên hệ quản trị viên." });
    }

    if (admin.account_status === "locked") {
      if (admin.locked_until && new Date(admin.locked_until) > new Date()) {
        const remainMin = Math.ceil((new Date(admin.locked_until) - Date.now()) / 60000);
        return res.status(401).json({
          message: `Tài khoản đang bị khoá. Thử lại sau ${remainMin} phút.`,
        });
      }
      // Hết thời gian khoá tạm → mở lại
      await db.execute(
        "UPDATE admins SET account_status='active', failed_login_count=0, locked_until=NULL WHERE id=?",
        [admin.id]
      );
      admin.account_status = "active";
      admin.failed_login_count = 0;
    }

    // Kiểm tra khoá tạm thời (locked_until chưa hết dù status chưa cập nhật)
    if (admin.locked_until && new Date(admin.locked_until) > new Date()) {
      const remainMin = Math.ceil((new Date(admin.locked_until) - Date.now()) / 60000);
      return res.status(401).json({
        message: `Tài khoản tạm thời bị khoá. Thử lại sau ${remainMin} phút.`,
      });
    }

    const valid = await bcrypt.compare(password, admin.password_hash);
    if (!valid) {
      const newFailCount = (admin.failed_login_count || 0) + 1;

      if (newFailCount >= MAX_FAILED_ATTEMPTS) {
        // Khoá tài khoản 15 phút
        const lockedUntil = new Date(Date.now() + LOCK_DURATION_MINUTES * 60 * 1000)
          .toISOString().slice(0, 19).replace("T", " ");
        await db.execute(
          "UPDATE admins SET failed_login_count=?, locked_until=?, account_status='locked' WHERE id=?",
          [newFailCount, lockedUntil, admin.id]
        );
        return res.status(401).json({
          message: `Sai mật khẩu quá ${MAX_FAILED_ATTEMPTS} lần. Tài khoản bị khoá ${LOCK_DURATION_MINUTES} phút.`,
        });
      }

      await db.execute(
        "UPDATE admins SET failed_login_count=? WHERE id=?",
        [newFailCount, admin.id]
      );
      const remaining = MAX_FAILED_ATTEMPTS - newFailCount;
      return res.status(401).json({
        message: `Email hoặc mật khẩu không đúng. Còn ${remaining} lần thử trước khi bị khoá.`,
      });
    }

    // Đăng nhập thành công — reset counter
    const token = jwt.sign(
      { id: admin.id, email: admin.email, role: admin.role, full_name: admin.full_name },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "8h" }
    );

    const expiresAt = new Date(Date.now() + 8 * 60 * 60 * 1000)
      .toISOString().slice(0, 19).replace("T", " ");

    await Promise.all([
      db.execute(
        "UPDATE admins SET last_login_at=NOW(), failed_login_count=0, locked_until=NULL WHERE id=?",
        [admin.id]
      ),
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
