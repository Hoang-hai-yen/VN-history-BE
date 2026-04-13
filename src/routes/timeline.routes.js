const express = require("express");
const ctrl = require("../controllers/timeline.controller");
const { authenticate } = require("../middlewares/auth.middleware");

const router = express.Router();

// ── Public ────────────────────────────────────────────────────

/**
 * @swagger
 * /timeline:
 *   get:
 *     tags: [Timeline]
 *     summary: Timeline công khai — triều đại + sự kiện đã xuất bản
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
 *                   items: { $ref: '#/components/schemas/TimelinePeriod' }
 */
router.get("/", ctrl.getPublic);

// ── Admin ─────────────────────────────────────────────────────

/**
 * @swagger
 * /admin/timeline:
 *   get:
 *     tags: [Timeline]
 *     summary: Danh sách kỳ/triều đại kèm số lượng sự kiện (admin)
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
 *                   items: { $ref: '#/components/schemas/TimelinePeriod' }
 *                 total: { type: integer }
 */
router.get("/admin", authenticate, ctrl.getPeriods);

/**
 * @swagger
 * /admin/timeline/{dynastyId}/events:
 *   get:
 *     tags: [Timeline]
 *     summary: Danh sách sự kiện trong một kỳ/triều đại (admin)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: dynastyId
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
 *                 dynasty:
 *                   type: object
 *                   properties:
 *                     id:   { type: string }
 *                     name: { type: string }
 *                 data:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/TimelineEvent' }
 *                 total: { type: integer }
 *       404:
 *         description: Không tìm thấy triều đại
 */
router.get("/admin/:dynastyId/events", authenticate, ctrl.getEvents);

/**
 * @swagger
 * /admin/timeline/{dynastyId}/events:
 *   post:
 *     tags: [Timeline]
 *     summary: Thêm bài viết vào timeline của một kỳ
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: dynastyId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [article_id]
 *             properties:
 *               article_id:  { type: string, format: uuid }
 *               note:        { type: string, description: Ghi chú trong context timeline }
 *               sort_order:  { type: integer, default: 0 }
 *     responses:
 *       201:
 *         description: Đã thêm vào timeline
 *       409:
 *         description: Bài viết đã tồn tại trong kỳ này
 */
router.post("/admin/:dynastyId/events", authenticate, ctrl.addEvent);

/**
 * @swagger
 * /admin/timeline/events/{id}:
 *   put:
 *     tags: [Timeline]
 *     summary: Cập nhật ghi chú / thứ tự sắp xếp trong timeline
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *         description: ID của timeline_event
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               note:       { type: string }
 *               sort_order: { type: integer }
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 *       404:
 *         description: Không tìm thấy
 */
router.put("/admin/events/:id", authenticate, ctrl.updateEvent);

/**
 * @swagger
 * /admin/timeline/events/{id}:
 *   delete:
 *     tags: [Timeline]
 *     summary: Xoá sự kiện khỏi timeline (bài viết không bị xoá)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       204:
 *         description: Đã xoá
 *       404:
 *         description: Không tìm thấy
 */
router.delete("/admin/events/:id", authenticate, ctrl.removeEvent);

module.exports = router;
