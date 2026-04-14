const express = require("express");
const multer = require("multer");
const ctrl = require("../controllers/media.controller");
const { authenticate, requireAdmin } = require("../middlewares/auth.middleware");

const router = express.Router();

// Lưu file trong memory (không ghi disk), tối đa 50 MB
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter(req, file, cb) {
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif", "video/mp4", "video/quicktime"];
    if (allowed.includes(file.mimetype)) return cb(null, true);
    cb(new Error("Định dạng file không được hỗ trợ."));
  },
});

/**
 * @swagger
 * /admin/media/upload:
 *   post:
 *     tags: [Media]
 *     summary: Upload ảnh hoặc video cho bài viết
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [file, article_id]
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *               article_id:
 *                 type: string
 *                 format: uuid
 *               caption:
 *                 type: string
 *               is_cover:
 *                 type: string
 *                 enum: ["0", "1"]
 *     responses:
 *       201:
 *         description: Upload thành công, trả về bản ghi media
 */
router.post("/upload", authenticate, requireAdmin, upload.single("file"), ctrl.upload);

/**
 * @swagger
 * /admin/media/{id}:
 *   delete:
 *     tags: [Media]
 *     summary: Xoá media (DB + Cloudinary)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       204:
 *         description: Đã xoá
 */
router.delete("/:id", authenticate, requireAdmin, ctrl.remove);

module.exports = router;
