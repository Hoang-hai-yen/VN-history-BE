const express = require("express");
const { getAll, getBySlug } = require("../controllers/dynasty.controller");

const router = express.Router();

/**
 * @swagger
 * /dynasties:
 *   get:
 *     tags: [Dynasties]
 *     summary: Danh sách tất cả triều đại
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:  { type: array, items: { $ref: '#/components/schemas/Dynasty' } }
 *                 total: { type: integer }
 */
router.get("/", getAll);

/**
 * @swagger
 * /dynasties/{slug}:
 *   get:
 *     tags: [Dynasties]
 *     summary: Chi tiết triều đại theo slug
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema: { type: string }
 *         example: nha-tran
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data: { $ref: '#/components/schemas/Dynasty' }
 *       404:
 *         description: Không tìm thấy
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.get("/:slug", getBySlug);

module.exports = router;
