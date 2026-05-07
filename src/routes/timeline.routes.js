const express = require("express");
const ctrl = require("../controllers/timeline.controller");

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

module.exports = router;
