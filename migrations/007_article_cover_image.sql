-- ============================================================
-- Migration 007: Thêm cover_image_url vào articles
-- Dùng cho card list — không cần join media khi lấy danh sách
-- ============================================================

ALTER TABLE `articles`
  ADD COLUMN `cover_image_url` TEXT DEFAULT NULL
    COMMENT 'URL ảnh bìa — dùng cho card list, sync từ media.is_cover'
    AFTER `quote`;

-- Backfill từ media (lấy ảnh is_cover = 1 đầu tiên của mỗi bài)
UPDATE `articles` a
INNER JOIN `media` m
  ON m.article_id = a.id
  AND m.is_cover = 1
  AND m.media_type = 'image'
SET a.cover_image_url = m.url
WHERE a.cover_image_url IS NULL;
