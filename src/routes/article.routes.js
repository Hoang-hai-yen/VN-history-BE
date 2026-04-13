const express = require("express");
const ctrl = require("../controllers/article.controller");
const { authenticate, requireAdmin, requireSuperAdmin } = require("../middlewares/auth.middleware");

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

// ── Admin ─────────────────────────────────────────────────────

/**
 * @swagger
 * /admin/dashboard:
 *   get:
 *     tags: [Articles]
 *     summary: Thống kê dashboard (admin)
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
 *                   type: object
 *                   properties:
 *                     total_published: { type: integer }
 *                     total_pending:   { type: integer }
 *                     total_draft:     { type: integer }
 *                     reports_new:     { type: integer }
 *                     published_today: { type: integer }
 *                     active_admins:   { type: integer }
 */
router.get("/admin/dashboard", authenticate, ctrl.dashboard);

/**
 * @swagger
 * /admin/articles:
 *   get:
 *     tags: [Articles]
 *     summary: Danh sách bài viết (admin — lọc theo mọi status)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [draft, pending, published, rejected] }
 *       - in: query
 *         name: type
 *         schema: { type: string, enum: [event, person, place, video, culture] }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *     responses:
 *       200:
 *         description: OK
 */
router.get("/admin/articles", authenticate, ctrl.getAll);

/**
 * @swagger
 * /admin/articles/{id}:
 *   get:
 *     tags: [Articles]
 *     summary: Chi tiết bài viết theo ID (admin)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: OK
 *       404:
 *         description: Không tìm thấy
 */
router.get("/admin/articles/:id", authenticate, ctrl.getById);

/**
 * @swagger
 * /admin/articles:
 *   post:
 *     tags: [Articles]
 *     summary: Tạo bài viết mới (status = draft)
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, slug, summary, content, type]
 *             properties:
 *               title:        { type: string }
 *               subtitle:     { type: string }
 *               slug:         { type: string }
 *               summary:      { type: string }
 *               content:      { type: string, description: Markdown }
 *               quote:        { type: string }
 *               type:         { type: string, enum: [event, person, place, video, culture] }
 *               year_start:   { type: integer }
 *               year_end:     { type: integer }
 *               year_display: { type: string }
 *               dynasty_id:   { type: string }
 *               category_id:  { type: string }
 *               is_featured:  { type: boolean }
 *     responses:
 *       201:
 *         description: Tạo thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data: { $ref: '#/components/schemas/Article' }
 */
router.post("/admin/articles", authenticate, ctrl.create);

/**
 * @swagger
 * /admin/articles/{id}:
 *   put:
 *     tags: [Articles]
 *     summary: Cập nhật bài viết (chỉ khi status là draft/rejected)
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
 *             properties:
 *               title:   { type: string }
 *               content: { type: string }
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 *       403:
 *         description: Không được phép (bài không ở trạng thái draft/rejected)
 */
router.put("/admin/articles/:id", authenticate, ctrl.update);

/**
 * @swagger
 * /admin/articles/{id}/submit:
 *   patch:
 *     tags: [Articles]
 *     summary: "Gửi duyệt: draft → pending"
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Đã gửi chờ duyệt
 */
router.patch("/admin/articles/:id/submit", authenticate, ctrl.submit);

/**
 * @swagger
 * /admin/articles/{id}/publish:
 *   patch:
 *     tags: [Articles]
 *     summary: "Duyệt đăng: pending → published"
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Đã xuất bản
 */
router.patch("/admin/articles/:id/publish", authenticate, requireAdmin, ctrl.publish);

/**
 * @swagger
 * /admin/articles/{id}/reject:
 *   patch:
 *     tags: [Articles]
 *     summary: "Từ chối: pending → rejected"
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
 *               rejection_note: { type: string, description: Lý do từ chối }
 *     responses:
 *       200:
 *         description: Đã từ chối
 */
router.patch("/admin/articles/:id/reject", authenticate, requireAdmin, ctrl.reject);

/**
 * @swagger
 * /admin/articles/{id}:
 *   delete:
 *     tags: [Articles]
 *     summary: Xoá bài viết (super_admin only — SRS Section 3.1)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       204:
 *         description: Đã xoá
 *       403:
 *         description: Chỉ super_admin mới có quyền xoá
 */
router.delete("/admin/articles/:id", authenticate, requireSuperAdmin, ctrl.remove);

/**
 * @swagger
 * /admin/articles/{id}/return:
 *   patch:
 *     tags: [Articles]
 *     summary: "Trả bài về admin (pending → pending, kèm ghi chú) — super_admin only"
 *     description: UC-A6 BR3 — Super Admin có thể trả bài chờ xuất bản về cho admin kèm ghi chú.
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
 *             required: [return_note]
 *             properties:
 *               return_note: { type: string, description: Lý do trả lại }
 *     responses:
 *       200:
 *         description: Đã trả bài về admin
 */
router.patch("/admin/articles/:id/return", authenticate, requireSuperAdmin, ctrl.returnToPending);

/**
 * @swagger
 * /admin/articles/bulk-publish:
 *   post:
 *     tags: [Articles]
 *     summary: Duyệt tất cả bài đang pending (super_admin only — UC-A6 BR2)
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               ids:
 *                 type: array
 *                 items: { type: string, format: uuid }
 *                 description: "Danh sách ID cụ thể (bỏ trống = duyệt tất cả pending)"
 *     responses:
 *       200:
 *         description: Đã xuất bản hàng loạt
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 published_count: { type: integer }
 *                 message: { type: string }
 */
router.post("/admin/articles/bulk-publish", authenticate, requireSuperAdmin, ctrl.bulkPublish);

module.exports = router;
