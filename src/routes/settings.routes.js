const express = require("express");
const ctrl = require("../controllers/settings.controller");
const { authenticate, requireSuperAdmin } = require("../middlewares/auth.middleware");

const router = express.Router();

/**
 * @swagger
 * /admin/settings:
 *   get:
 *     tags: [Settings]
 *     summary: Lấy tất cả cài đặt hệ thống (admin)
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
 *                   items: { $ref: '#/components/schemas/Setting' }
 *                 asObject:
 *                   type: object
 *                   description: Settings dưới dạng key-value object
 */
router.get("/", authenticate, ctrl.getAll);

/**
 * @swagger
 * /admin/settings:
 *   patch:
 *     tags: [Settings]
 *     summary: Cập nhật cài đặt hệ thống (super_admin only)
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: Object với key là tên setting, value là giá trị mới
 *             example:
 *               site_name: "Lịch Sử Việt Nam"
 *               allow_comments: "true"
 *               notify_on_report: "false"
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/Setting' }
 *       400:
 *         description: Key không hợp lệ
 */
router.patch("/", authenticate, requireSuperAdmin, ctrl.update);

module.exports = router;
