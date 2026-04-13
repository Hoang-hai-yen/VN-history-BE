const express = require("express");
const db = require("../config/database");
const { authenticate, requireSuperAdmin } = require("../middlewares/auth.middleware");

const router = express.Router();

// Danh sách permission key hợp lệ (cố định bởi hệ thống)
const ALL_PERMISSIONS = [
  { key: "article.create",      label: "Tạo / sửa bài viết của mình" },
  { key: "article.edit_own",    label: "Sửa bài viết của mình" },
  { key: "article.submit",      label: "Gửi bài chờ duyệt" },
  { key: "article.publish",     label: "Duyệt và xuất bản bài" },
  { key: "article.reject",      label: "Từ chối bài viết" },
  { key: "article.edit_any",    label: "Sửa / xoá bài viết của người khác" },
  { key: "article.delete",      label: "Xoá bài viết" },
  { key: "report.view",         label: "Xem báo cáo lỗi" },
  { key: "report.handle",       label: "Xử lý báo cáo lỗi" },
  { key: "timeline.manage",     label: "Quản lý Timeline" },
  { key: "admin.manage",        label: "Quản lý tài khoản admin" },
  { key: "permissions.manage",  label: "Phân quyền" },
  { key: "logs.view",           label: "Xem nhật ký hệ thống" },
  { key: "settings.manage",     label: "Cài đặt hệ thống" },
];

// Super Admin luôn có toàn bộ quyền (không cấu hình được)
const SUPER_ADMIN_PERMISSIONS = ALL_PERMISSIONS.map((p) => ({ ...p, granted: true, configurable: false }));

/**
 * @swagger
 * /admin/permissions:
 *   get:
 *     tags: [Permissions]
 *     summary: Xem phân quyền theo role (super_admin only — UC-A9)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/RoleDefinition' }
 *                 current_role:
 *                   type: string
 */
router.get("/", authenticate, requireSuperAdmin, async (req, res, next) => {
  try {
    const [adminPerms] = await db.execute(
      "SELECT permission, granted FROM role_permissions WHERE role = 'admin'"
    );
    const adminPermMap = {};
    adminPerms.forEach((p) => { adminPermMap[p.permission] = !!p.granted; });

    const adminPermissions = ALL_PERMISSIONS.map((p) => ({
      ...p,
      granted: adminPermMap[p.key] !== undefined ? adminPermMap[p.key] : false,
      configurable: true,
    }));

    res.json({
      data: [
        {
          role: "super_admin",
          label: "Super Admin",
          description: "Toàn quyền — không thể chỉnh sửa.",
          permissions: SUPER_ADMIN_PERMISSIONS,
        },
        {
          role: "admin",
          label: "Admin",
          description: "Quyền do Super Admin cấu hình.",
          permissions: adminPermissions,
        },
      ],
      current_role: req.admin.role,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /admin/permissions:
 *   patch:
 *     tags: [Permissions]
 *     summary: Cập nhật quyền cho role admin (super_admin only — UC-A9)
 *     description: |
 *       Super Admin có thể bật/tắt từng quyền cho role admin.
 *       Super Admin permissions không thể thay đổi.
 *       BR2: admin.manage, permissions.manage, settings.manage mặc định OFF cho admin.
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: "Object key=permission key, value=true/false"
 *             example:
 *               article.publish: true
 *               logs.view: false
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 *       400:
 *         description: Vi phạm ràng buộc tối thiểu (BR2)
 */
router.patch("/", authenticate, requireSuperAdmin, async (req, res, next) => {
  try {
    const updates = req.body;
    const validKeys = new Set(ALL_PERMISSIONS.map((p) => p.key));

    for (const [key, value] of Object.entries(updates)) {
      if (!validKeys.has(key)) {
        return res.status(400).json({ message: `Permission key không hợp lệ: ${key}` });
      }
    }

    // SRS UC-A9 BR2: admin phải giữ tối thiểu article.create và article.edit_own
    const REQUIRED_FOR_ADMIN = ["article.create", "article.edit_own"];
    for (const req_perm of REQUIRED_FOR_ADMIN) {
      if (updates[req_perm] === false) {
        return res.status(400).json({
          message: `Không thể tắt quyền tối thiểu: ${req_perm}`,
        });
      }
    }

    for (const [key, value] of Object.entries(updates)) {
      await db.execute(
        `INSERT INTO role_permissions (role, permission, granted, updated_by)
         VALUES ('admin', ?, ?, ?)
         ON DUPLICATE KEY UPDATE granted = VALUES(granted), updated_by = VALUES(updated_by), updated_at = NOW()`,
        [key, value ? 1 : 0, req.admin.id]
      );
    }

    await db.execute(
      "INSERT INTO activity_logs (admin_id, action, target_type, target_title, detail, ip_address) VALUES (?,?,?,?,?,?)",
      [req.admin.id, "update_permissions", "settings", "Phân quyền",
       JSON.stringify(updates), req.ip || null]
    );

    res.json({ message: "Đã cập nhật phân quyền.", updated: Object.keys(updates).length });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
