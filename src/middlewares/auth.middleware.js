const jwt = require("jsonwebtoken");

/**
 * Xác thực JWT — gắn req.admin nếu hợp lệ
 */
function authenticate(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Chưa xác thực." });
  }

  const token = header.slice(7);
  try {
    req.admin = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ message: "Token không hợp lệ hoặc đã hết hạn." });
  }
}

/**
 * Chỉ super_admin
 */
function requireSuperAdmin(req, res, next) {
  if (req.admin?.role !== "super_admin") {
    return res.status(403).json({ message: "Chỉ super_admin mới có quyền thực hiện thao tác này." });
  }
  next();
}

/**
 * Yêu cầu role admin hoặc super_admin
 */
function requireAdmin(req, res, next) {
  if (!["admin", "super_admin"].includes(req.admin?.role)) {
    return res.status(403).json({ message: "Yêu cầu quyền admin trở lên." });
  }
  next();
}

module.exports = { authenticate, requireSuperAdmin, requireAdmin };
