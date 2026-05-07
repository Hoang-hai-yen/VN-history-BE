const express = require("express");
const ctrl = require("../controllers/report.controller");


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

module.exports = router;
