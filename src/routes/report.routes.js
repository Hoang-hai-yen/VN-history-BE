const express = require("express");
const ctrl = require("../controllers/report.controller");
const { authenticate, requireAdmin, requireSuperAdmin } = require("../middlewares/auth.middleware");

const router = express.Router();

/**
 * @swagger
 * /reports:
 *   post:
 *     tags: [Reports]
 *     summary: Gửi báo cáo lỗi nội dung (public)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [article_id, error_type, description]
 *             properties:
 *               article_id:       { type: string, format: uuid }
 *               error_type:       { type: string, example: Ngày tháng sai }
 *               severity:         { type: string, enum: [low, medium, high], default: medium }
 *               description:      { type: string }
 *               quoted_text:      { type: string }
 *               suggested_source: { type: string }
 *               reporter_email:   { type: string, format: email }
 *     responses:
 *       201:
 *         description: Đã nhận báo cáo
 *       404:
 *         description: Bài viết không tồn tại
 */
router.post("/", ctrl.create);

/**
 * @swagger
 * /admin/reports:
 *   get:
 *     tags: [Reports]
 *     summary: Danh sách báo cáo (admin)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [new, reviewing, resolved, rejected] }
 *       - in: query
 *         name: severity
 *         schema: { type: string, enum: [low, medium, high] }
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:  { type: array, items: { $ref: '#/components/schemas/Report' } }
 *                 total: { type: integer }
 */
router.get("/admin/reports", authenticate, ctrl.getAll);

/**
 * @swagger
 * /admin/reports/{id}/assign:
 *   patch:
 *     tags: [Reports]
 *     summary: Phân công xử lý báo cáo
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [admin_id]
 *             properties:
 *               admin_id: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Đã phân công
 */
router.patch("/admin/reports/:id/assign", authenticate, requireAdmin, ctrl.assign);

/**
 * @swagger
 * /admin/reports/{id}/resolve:
 *   patch:
 *     tags: [Reports]
 *     summary: Đánh dấu đã xử lý báo cáo
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
 *               admin_note: { type: string }
 *     responses:
 *       200:
 *         description: Đã xử lý
 */
router.patch("/admin/reports/:id/resolve", authenticate, requireAdmin, ctrl.resolve);

/**
 * @swagger
 * /admin/reports/{id}/reject:
 *   patch:
 *     tags: [Reports]
 *     summary: Từ chối báo cáo
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Đã từ chối
 */
router.patch("/admin/reports/:id/reject", authenticate, requireAdmin, ctrl.reject);

/**
 * @swagger
 * /admin/reports/{id}/flag:
 *   patch:
 *     tags: [Reports]
 *     summary: Đánh cờ kiểm tra — cần academic review (UC-A5 BR2)
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
 *               admin_note: { type: string, description: Ghi chú lý do cần kiểm tra }
 *     responses:
 *       200:
 *         description: Đã đánh cờ
 */
router.patch("/admin/reports/:id/flag", authenticate, requireAdmin, ctrl.flag);

module.exports = router;
