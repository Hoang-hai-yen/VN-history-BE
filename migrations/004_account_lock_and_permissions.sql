-- ============================================================
-- Migration 004: Account locking, login rate limiting,
--                configurable role permissions
-- ============================================================

-- ------------------------------------------------------------
-- Cập nhật admins: thêm trường theo dõi login thất bại + lock
-- SRS BR1: Khoá sau 5 lần sai, mở khoá sau 15 phút
-- SRS UC-A8 BR3: 3 trạng thái active / inactive / locked
-- ------------------------------------------------------------
ALTER TABLE `admins`
  ADD COLUMN IF NOT EXISTS `account_status`
    enum('active','inactive','locked') NOT NULL DEFAULT 'active'
    COMMENT 'active=đang hoạt động | inactive=vô hiệu hoá | locked=bị khoá'
    AFTER `is_active`,
  ADD COLUMN IF NOT EXISTS `failed_login_count` TINYINT UNSIGNED NOT NULL DEFAULT 0
    AFTER `account_status`,
  ADD COLUMN IF NOT EXISTS `locked_until` datetime DEFAULT NULL
    COMMENT 'NULL = không bị khoá tạm thời' AFTER `failed_login_count`;

-- Đồng bộ account_status với is_active hiện có
UPDATE `admins` SET account_status = 'active'   WHERE is_active = 1;
UPDATE `admins` SET account_status = 'inactive' WHERE is_active = 0;

-- ------------------------------------------------------------
-- role_permissions: cho phép Super Admin cấu hình quyền động
-- SRS UC-A9: admin permissions là configurable
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `role_permissions` (
  `id`          INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `role`        enum('admin') NOT NULL DEFAULT 'admin'
    COMMENT 'Chỉ admin role mới cấu hình được; super_admin luôn full quyền',
  `permission`  varchar(100) NOT NULL COMMENT 'key từ danh sách cố định',
  `granted`     tinyint(1)   NOT NULL DEFAULT 1,
  `updated_by`  char(36)     DEFAULT NULL,
  `updated_at`  datetime     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_role_perm` (`role`, `permission`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Quyền cấu hình được cho role admin. Super Admin luôn full quyền.';

-- ------------------------------------------------------------
-- Cập nhật reports.status: thêm 'flagged' (Cờ kiểm tra — UC-A5)
-- ------------------------------------------------------------
ALTER TABLE `reports`
  MODIFY `status` enum('new','reviewing','resolved','rejected','flagged')
    NOT NULL DEFAULT 'new';

-- ------------------------------------------------------------
-- Seed mặc định theo SRS (admin có publish + reject + báo cáo)
INSERT IGNORE INTO `role_permissions` (`role`, `permission`, `granted`) VALUES
  ('admin', 'article.create',        1),
  ('admin', 'article.edit_own',      1),
  ('admin', 'article.submit',        1),
  ('admin', 'article.publish',       1),
  ('admin', 'article.reject',        1),
  ('admin', 'article.edit_any',      0),
  ('admin', 'article.delete',        0),
  ('admin', 'report.view',           1),
  ('admin', 'report.handle',         1),
  ('admin', 'timeline.manage',       1),
  ('admin', 'admin.manage',          0),
  ('admin', 'permissions.manage',    0),
  ('admin', 'logs.view',             0),
  ('admin', 'settings.manage',       0);
