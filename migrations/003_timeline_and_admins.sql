-- ============================================================
-- Migration 003: Timeline events + admin role enum mở rộng
-- ============================================================

-- ------------------------------------------------------------
-- timeline_events: gắn bài viết vào triều đại cho trang Timeline
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `timeline_events` (
  `id`         char(36)  NOT NULL DEFAULT (UUID()),
  `dynasty_id` char(36)  NOT NULL COMMENT 'Kỳ/triều đại trong timeline',
  `article_id` char(36)  NOT NULL COMMENT 'Bài viết sự kiện',
  `note`       text      DEFAULT NULL COMMENT 'Ghi chú riêng trong context timeline',
  `sort_order` int(11)   NOT NULL DEFAULT 0,
  `created_by` char(36)  NOT NULL,
  `created_at` datetime  NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime  NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_timeline_event` (`dynasty_id`, `article_id`),
  KEY `idx_tl_dynasty`  (`dynasty_id`),
  KEY `idx_tl_article`  (`article_id`),
  KEY `idx_tl_order`    (`dynasty_id`, `sort_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Sự kiện theo timeline — một bài viết có thể xuất hiện trong nhiều kỳ';

-- Seed: thêm sẵn các bài viết mẫu vào timeline
INSERT IGNORE INTO `timeline_events`
  (dynasty_id, article_id, note, sort_order, created_by)
SELECT
  a.dynasty_id,
  a.id,
  NULL,
  a.year_start,
  a.created_by
FROM articles a
WHERE a.dynasty_id IS NOT NULL
  AND a.status = 'published';

-- (Không thay đổi role enum — chỉ 2 role: super_admin, admin)

-- ------------------------------------------------------------
-- Cập nhật dashboard_stats view: thêm total_dynasties
-- ------------------------------------------------------------
CREATE OR REPLACE VIEW `dashboard_stats` AS
SELECT
  (SELECT COUNT(*) FROM articles  WHERE status = 'published')                                AS total_published,
  (SELECT COUNT(*) FROM articles  WHERE status = 'pending')                                  AS total_pending,
  (SELECT COUNT(*) FROM articles  WHERE status = 'draft')                                    AS total_draft,
  (SELECT COUNT(*) FROM articles  WHERE status = 'rejected')                                 AS total_rejected,
  (SELECT COUNT(*) FROM reports   WHERE status = 'new')                                      AS reports_new,
  (SELECT COUNT(*) FROM reports   WHERE status = 'reviewing')                                AS reports_reviewing,
  (SELECT COUNT(*) FROM articles  WHERE status = 'published' AND DATE(published_at) = CURDATE()) AS published_today,
  (SELECT COUNT(*) FROM admins    WHERE is_active = 1)                                       AS active_admins,
  (SELECT COUNT(*) FROM dynasties)                                                            AS total_dynasties;
