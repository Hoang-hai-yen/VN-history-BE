const express = require("express");
const ctrl = require("../controllers/timeline.controller");
const { authenticate } = require("../middlewares/auth.middleware");

const router = express.Router();

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
 */
router.get("/", authenticate, ctrl.getPeriods);

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
 *       404:
 *         description: Không tìm thấy triều đại
 */
router.get("/:dynastyId/events", authenticate, ctrl.getEvents);

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
 *               note:        { type: string }
 *               sort_order:  { type: integer, default: 0 }
 *     responses:
 *       201:
 *         description: Đã thêm vào timeline
 *       409:
 *         description: Bài viết đã tồn tại trong kỳ này
 */
router.post("/:dynastyId/events", authenticate, ctrl.addEvent);

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
router.put("/events/:id", authenticate, ctrl.updateEvent);

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
router.delete("/events/:id", authenticate, ctrl.removeEvent);

module.exports = router;
