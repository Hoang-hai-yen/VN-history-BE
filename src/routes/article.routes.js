const express = require("express");
const ctrl = require("../controllers/article.controller");

const router = express.Router();

// ── Public ────────────────────────────────────────────────────

/**
 * @swagger
 * /articles:
 *   get:
 *     tags: [Articles]
 *     summary: Danh sách bài viết đã xuất bản (public)
 *     parameters:
 *       - in: query
 *         name: type
 *         schema: { type: string, enum: [event, person, place, video, culture] }
 *       - in: query
 *         name: dynasty_id
 *         schema: { type: string }
 *       - in: query
 *         name: category_id
 *         schema: { type: string }
 *       - in: query
 *         name: is_featured
 *         schema: { type: boolean }
 *       - in: query
 *         name: year_from
 *         schema: { type: integer }
 *         description: "Lọc từ năm (âm = TCN, vd: -2879)"
 *       - in: query
 *         name: year_to
 *         schema: { type: integer }
 *         description: "Lọc đến năm"
 *       - in: query
 *         name: q
 *         schema: { type: string }
 *         description: Tìm kiếm full-text
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
 *                 data:       { type: array, items: { $ref: '#/components/schemas/Article' } }
 *                 pagination: { $ref: '#/components/schemas/Pagination' }
 */
router.get("/", ctrl.getAll);

/**
 * @swagger
 * /articles/{slug}:
 *   get:
 *     tags: [Articles]
 *     summary: Chi tiết bài viết theo slug (public)
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: OK — bao gồm media, persons, places, sources, related
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data: { $ref: '#/components/schemas/Article' }
 *       404:
 *         description: Không tìm thấy
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.get("/:slug", ctrl.getBySlug);

module.exports = router;
