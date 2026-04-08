const express = require("express");
const { login, logout, me } = require("../controllers/auth.controller");
const { authenticate } = require("../middlewares/auth.middleware");

const router = express.Router();

/**
 * @swagger
 * /auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Đăng nhập admin
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:    { type: string, example: admin@lsvn.vn }
 *               password: { type: string, example: "secret123" }
 *     responses:
 *       200:
 *         description: Đăng nhập thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token: { type: string }
 *                 admin:
 *                   type: object
 *                   properties:
 *                     id:        { type: string }
 *                     full_name: { type: string }
 *                     email:     { type: string }
 *                     role:      { type: string }
 *       401:
 *         description: Sai email hoặc mật khẩu
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.post("/login", login);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     tags: [Auth]
 *     summary: Đăng xuất
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Đăng xuất thành công
 */
router.post("/logout", authenticate, logout);

/**
 * @swagger
 * /auth/me:
 *   get:
 *     tags: [Auth]
 *     summary: Thông tin admin đang đăng nhập
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Thông tin admin
 */
router.get("/me", authenticate, me);

module.exports = router;
