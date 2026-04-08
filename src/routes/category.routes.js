const express = require("express");
const { getAll } = require("../controllers/category.controller");

const router = express.Router();

/**
 * @swagger
 * /categories:
 *   get:
 *     tags: [Categories]
 *     summary: Danh sách danh mục
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [event, person, place, video, culture]
 *         description: Lọc theo loại bài viết
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:  { type: array, items: { $ref: '#/components/schemas/Category' } }
 *                 total: { type: integer }
 */
router.get("/", getAll);

module.exports = router;
