const { v4: uuidv4 } = require("uuid");
const streamifier = require("streamifier");
const cloudinary = require("../config/cloudinary");
const db = require("../config/database");

/**
 * POST /api/admin/media/upload
 * Upload 1 file (image/video) lên Cloudinary, lưu vào bảng media.
 * Body (multipart/form-data):
 *   - file        : file cần upload (bắt buộc)
 *   - article_id  : UUID bài viết (bắt buộc)
 *   - caption     : mô tả (tuỳ chọn)
 *   - is_cover    : "1" / "0" (tuỳ chọn, mặc định 0)
 */
async function upload(req, res, next) {
  try {
    const { article_id, caption, is_cover } = req.body;

    if (!req.file) return res.status(400).json({ message: "Chưa chọn file." });
    if (!article_id) return res.status(400).json({ message: "Thiếu article_id." });

    // Kiểm tra bài viết tồn tại
    const [rows] = await db.execute("SELECT id FROM articles WHERE id = ?", [article_id]);
    if (!rows[0]) return res.status(404).json({ message: "Không tìm thấy bài viết." });

    // Xác định resource_type
    const isVideo = req.file.mimetype.startsWith("video/");
    const resourceType = isVideo ? "video" : "image";

    // Upload lên Cloudinary qua stream (không lưu file tạm)
    const cloudResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: `lsvn/${article_id}`,
          resource_type: resourceType,
          allowed_formats: ["jpg", "jpeg", "png", "webp", "gif", "mp4", "mov"],
          transformation: resourceType === "image"
            ? [{ quality: "auto", fetch_format: "auto" }]
            : undefined,
        },
        (err, result) => (err ? reject(err) : resolve(result))
      );
      streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
    });

    // Thumbnail cho video = ảnh preview Cloudinary
    const thumbnailUrl = isVideo
      ? cloudinary.url(cloudResult.public_id, {
          resource_type: "video",
          format: "jpg",
          transformation: [{ width: 640, crop: "scale" }],
        })
      : null;

    // Tính sort_order tiếp theo
    const [[{ maxOrder }]] = await db.execute(
      "SELECT COALESCE(MAX(sort_order), 0) AS maxOrder FROM media WHERE article_id = ?",
      [article_id]
    );

    const id = uuidv4();
    await db.execute(
      `INSERT INTO media
         (id, article_id, media_type, url, thumbnail_url, caption, is_cover, sort_order)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        article_id,
        resourceType,
        cloudResult.secure_url,
        thumbnailUrl,
        caption || null,
        is_cover === "1" ? 1 : 0,
        maxOrder + 1,
      ]
    );

    const [[media]] = await db.execute("SELECT * FROM media WHERE id = ?", [id]);
    res.status(201).json(media);
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/admin/media/:id
 * Xoá media khỏi DB và Cloudinary.
 */
async function remove(req, res, next) {
  try {
    const [rows] = await db.execute("SELECT * FROM media WHERE id = ?", [req.params.id]);
    const media = rows[0];
    if (!media) return res.status(404).json({ message: "Không tìm thấy media." });

    // Xoá trên Cloudinary nếu là URL Cloudinary
    if (media.url.includes("cloudinary.com")) {
      // Lấy public_id từ URL: phần path sau /upload/[version/]
      const match = media.url.match(/\/upload\/(?:v\d+\/)?(.+)\.[^.]+$/);
      if (match) {
        await cloudinary.uploader.destroy(match[1], {
          resource_type: media.media_type === "video" ? "video" : "image",
        });
      }
    }

    await db.execute("DELETE FROM media WHERE id = ?", [req.params.id]);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
}

module.exports = { upload, remove };
