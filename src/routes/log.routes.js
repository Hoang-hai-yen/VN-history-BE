const express = require("express");
const ctrl = require("../controllers/log.controller");
const { authenticate, requireSuperAdmin } = require("../middlewares/auth.middleware");

const router = express.Router();

// SRS UC-A10: Actor = Super Admin only
router.use(authenticate, requireSuperAdmin);

/**
 * @swagger
 * /admin/logs:
 *   get:
 *     tags: [Logs]
 *     summary: Nhật ký hoạt động (admin)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: admin_id
 *         schema: { type: string, format: uuid }
 *         description: Lọc theo admin
 *       - in: query
 *         name: action
 *         schema: { type: string }
 *         description: "Ví dụ: create_article, publish_article, delete_admin"
 *       - in: query
 *         name: target_type
 *         schema: { type: string, enum: [article, admin, report, settings] }
 *       - in: query
 *         name: date_from
 *         schema: { type: string, format: date }
 *         description: "Từ ngày (YYYY-MM-DD)"
 *       - in: query
 *         name: date_to
 *         schema: { type: string, format: date }
 *         description: "Đến ngày (YYYY-MM-DD)"
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20, maximum: 100 }
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
 *                   items: { $ref: '#/components/schemas/ActivityLog' }
 *                 pagination: { $ref: '#/components/schemas/Pagination' }
 */
router.get("/", ctrl.getAll);

/**
 * @swagger
 * /admin/logs/actions:
 *   get:
 *     tags: [Logs]
 *     summary: Danh sách loại hành động đã có (dùng cho filter)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data: { type: array, items: { type: string } }
 */
router.get("/actions", ctrl.getActionTypes);

module.exports = router;
