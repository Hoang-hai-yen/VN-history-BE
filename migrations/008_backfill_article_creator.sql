-- ============================================================
-- Migration 008: Backfill created_by cho các bài viết hiện có
-- Gán super_admin cho bài nào chưa có người tạo hợp lệ
-- ============================================================

UPDATE `articles`
SET `created_by` = (
  SELECT `id` FROM `admins`
  WHERE `role` = 'super_admin'
  ORDER BY `created_at` ASC
  LIMIT 1
)
WHERE `created_by` IS NULL;
