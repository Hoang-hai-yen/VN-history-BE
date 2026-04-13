const express = require("express");
const ctrl = require("../controllers/admin.controller");
const { authenticate, requireSuperAdmin } = require("../middlewares/auth.middleware");

const router = express.Router();

// Tất cả routes đều yêu cầu authenticate + super_admin
router.use(authenticate, requireSuperAdmin);

/**
 * @swagger
 * /admin/admins:
 *   get:
 *     tags: [Admins]
 *     summary: Danh sách tài khoản admin (super_admin only)
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
 *                   items: { $ref: '#/components/schemas/AdminUser' }
 *                 total: { type: integer }
 *       403:
 *         description: Chỉ super_admin
 */
router.get("/", ctrl.getAll);

/**
 * @swagger
 * /admin/admins/{id}:
 *   get:
 *     tags: [Admins]
 *     summary: Chi tiết tài khoản admin
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data: { $ref: '#/components/schemas/AdminUser' }
 *       404:
 *         description: Không tìm thấy
 */
router.get("/:id", ctrl.getById);

/**
 * @swagger
 * /admin/admins:
 *   post:
 *     tags: [Admins]
 *     summary: Tạo tài khoản admin mới (super_admin only)
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [full_name, email, password]
 *             properties:
 *               full_name: { type: string, example: Nguyễn Văn A }
 *               email:     { type: string, format: email }
 *               password:  { type: string, minLength: 8 }
 *               role:
 *                 type: string
 *                 enum: [super_admin, admin]
 *                 default: admin
 *     responses:
 *       201:
 *         description: Tạo thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data: { $ref: '#/components/schemas/AdminUser' }
 *       409:
 *         description: Email đã tồn tại
 */
router.post("/", ctrl.create);

/**
 * @swagger
 * /admin/admins/{id}:
 *   put:
 *     tags: [Admins]
 *     summary: Cập nhật tài khoản admin
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               full_name:  { type: string }
 *               role:       { type: string, enum: [super_admin, admin] }
 *               is_active:  { type: integer, enum: [0, 1] }
 *               avatar_url: { type: string }
 *               password:   { type: string, description: Đặt mật khẩu mới (tuỳ chọn) }
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 *       404:
 *         description: Không tìm thấy
 */
router.put("/:id", ctrl.update);

/**
 * @swagger
 * /admin/admins/{id}/toggle:
 *   patch:
 *     tags: [Admins]
 *     summary: Kích hoạt / vô hiệu hoá tài khoản
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Đã thay đổi trạng thái
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:   { type: string }
 *                 is_active: { type: integer }
 */
router.patch("/:id/toggle", ctrl.toggleActive);

/**
 * @swagger
 * /admin/admins/{id}:
 *   delete:
 *     tags: [Admins]
 *     summary: Xoá tài khoản admin (super_admin only)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       204:
 *         description: Đã xoá
 *       400:
 *         description: Không thể tự xoá chính mình
 */
router.delete("/:id", ctrl.remove);

module.exports = router;
