const express = require("express");
const ctrl = require("../controllers/report.controller");
const { authenticate, requireAdmin } = require("../middlewares/auth.middleware");

const router = express.Router();

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
 */
router.get("/", authenticate, ctrl.getAll);

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
router.patch("/:id/assign", authenticate, requireAdmin, ctrl.assign);

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
router.patch("/:id/resolve", authenticate, requireAdmin, ctrl.resolve);

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
router.patch("/:id/reject", authenticate, requireAdmin, ctrl.reject);

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
 *               admin_note: { type: string }
 *     responses:
 *       200:
 *         description: Đã đánh cờ
 */
router.patch("/:id/flag", authenticate, requireAdmin, ctrl.flag);

module.exports = router;
