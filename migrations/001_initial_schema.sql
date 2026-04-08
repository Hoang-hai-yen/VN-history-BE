-- ============================================================
-- Migration 001: Initial schema for lsvn database
-- Safe to run on existing DB (IF NOT EXISTS everywhere)
-- ============================================================

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";

-- ------------------------------------------------------------
-- admins
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `admins` (
  `id`             char(36)      NOT NULL DEFAULT (UUID()),
  `full_name`      varchar(150)  NOT NULL,
  `email`          varchar(255)  NOT NULL,
  `password_hash`  varchar(255)  NOT NULL,
  `role`           enum('super_admin','admin') NOT NULL DEFAULT 'admin',
  `is_active`      tinyint(1)    NOT NULL DEFAULT 1,
  `avatar_url`     text          DEFAULT NULL,
  `last_login_at`  datetime      DEFAULT NULL,
  `created_at`     datetime      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`     datetime      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `created_by`     char(36)      DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_admins_email` (`email`),
  KEY `idx_admins_role`   (`role`),
  KEY `idx_admins_active` (`is_active`),
  KEY `fk_admins_created_by` (`created_by`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Tài khoản quản trị. super_admin: toàn quyền | admin: viết/sửa/xuất bản/xử lý báo cáo';

-- Seed super_admin nếu chưa có
INSERT IGNORE INTO `admins` (`id`, `full_name`, `email`, `password_hash`, `role`, `is_active`, `created_at`, `updated_at`)
VALUES ('1d655491-2a88-11f1-b385-c01850fc14e5', 'Nguyễn Minh', 'admin@lsvn.vn',
        '$2b$12$PLACEHOLDER_REPLACE_BEFORE_DEPLOY', 'super_admin', 1,
        '2026-03-28 16:25:52', '2026-03-28 16:25:52');

-- ------------------------------------------------------------
-- admin_sessions
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `admin_sessions` (
  `id`          char(36)     NOT NULL DEFAULT (UUID()),
  `admin_id`    char(36)     NOT NULL,
  `token_hash`  varchar(255) NOT NULL,
  `ip_address`  varchar(45)  DEFAULT NULL,
  `user_agent`  text         DEFAULT NULL,
  `expires_at`  datetime     NOT NULL,
  `created_at`  datetime     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_sessions_token` (`token_hash`),
  KEY `idx_sessions_admin`   (`admin_id`),
  KEY `idx_sessions_expires` (`expires_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- dynasties
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `dynasties` (
  `id`           char(36)    NOT NULL DEFAULT (UUID()),
  `name`         varchar(100) NOT NULL,
  `slug`         varchar(120) NOT NULL,
  `year_start`   int(11)      NOT NULL COMMENT 'Âm = TCN, vd: -2879',
  `year_end`     int(11)      DEFAULT NULL COMMENT 'NULL nếu chưa kết thúc',
  `year_display` varchar(50)  NOT NULL COMMENT 'vd: 2879 TCN – 207 TCN',
  `description`  text         DEFAULT NULL,
  `sort_order`   int(11)      NOT NULL DEFAULT 0,
  `created_at`   datetime     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_dynasties_slug` (`slug`),
  KEY `idx_dynasties_order` (`sort_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT IGNORE INTO `dynasties` (`id`, `name`, `slug`, `year_start`, `year_end`, `year_display`, `sort_order`, `created_at`) VALUES
('1d5e6952-2a88-11f1-b385-c01850fc14e5', 'Văn Lang – Âu Lạc', 'van-lang-au-lac', -2879, -207, '2879 TCN – 207 TCN', 1,  '2026-03-28 16:25:52'),
('1d5e6f78-2a88-11f1-b385-c01850fc14e5', 'Bắc thuộc',         'bac-thuoc',       -111,  938,  '111 TCN – 938',      2,  '2026-03-28 16:25:52'),
('1d5e74c0-2a88-11f1-b385-c01850fc14e5', 'Nhà Ngô',           'nha-ngo',          939,  965,  '939 – 965',          3,  '2026-03-28 16:25:52'),
('1d5e754e-2a88-11f1-b385-c01850fc14e5', 'Nhà Đinh',          'nha-dinh',         968,  980,  '968 – 980',          4,  '2026-03-28 16:25:52'),
('1d5e75b1-2a88-11f1-b385-c01850fc14e5', 'Tiền Lê',           'tien-le',          980,  1009, '980 – 1009',         5,  '2026-03-28 16:25:52'),
('1d5e75f3-2a88-11f1-b385-c01850fc14e5', 'Nhà Lý',            'nha-ly',           1009, 1225, '1009 – 1225',        6,  '2026-03-28 16:25:52'),
('1d5e7624-2a88-11f1-b385-c01850fc14e5', 'Nhà Trần',          'nha-tran',         1225, 1400, '1225 – 1400',        7,  '2026-03-28 16:25:52'),
('1d5e7655-2a88-11f1-b385-c01850fc14e5', 'Nhà Hồ',            'nha-ho',           1400, 1407, '1400 – 1407',        8,  '2026-03-28 16:25:52'),
('1d5e768a-2a88-11f1-b385-c01850fc14e5', 'Nhà Lê sơ',         'nha-le-so',        1428, 1527, '1428 – 1527',        9,  '2026-03-28 16:25:52'),
('1d5e76b9-2a88-11f1-b385-c01850fc14e5', 'Nhà Mạc',           'nha-mac',          1527, 1592, '1527 – 1592',        10, '2026-03-28 16:25:52'),
('1d5e76e9-2a88-11f1-b385-c01850fc14e5', 'Lê Trung Hưng',     'le-trung-hung',    1533, 1789, '1533 – 1789',        11, '2026-03-28 16:25:52'),
('1d5e7718-2a88-11f1-b385-c01850fc14e5', 'Nhà Tây Sơn',       'nha-tay-son',      1778, 1802, '1778 – 1802',        12, '2026-03-28 16:25:52'),
('1d5e7746-2a88-11f1-b385-c01850fc14e5', 'Nhà Nguyễn',        'nha-nguyen',       1802, 1945, '1802 – 1945',        13, '2026-03-28 16:25:52'),
('1d5e7777-2a88-11f1-b385-c01850fc14e5', 'Hiện đại',          'hien-dai',         1945, NULL, '1945 – nay',         14, '2026-03-28 16:25:52');

-- ------------------------------------------------------------
-- categories
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `categories` (
  `id`           char(36)    NOT NULL DEFAULT (UUID()),
  `name`         varchar(100) NOT NULL,
  `slug`         varchar(120) NOT NULL,
  `article_type` enum('event','person','place','video','culture') DEFAULT NULL COMMENT 'NULL = áp dụng cho tất cả loại bài',
  `sort_order`   int(11)      NOT NULL DEFAULT 0,
  `created_at`   datetime     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_categories_slug` (`slug`),
  KEY `idx_categories_type` (`article_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT IGNORE INTO `categories` (`id`, `name`, `slug`, `article_type`, `sort_order`, `created_at`) VALUES
('1d61f941-2a88-11f1-b385-c01850fc14e5', 'Kháng chiến',        'khang-chien',    'event',  1, '2026-03-28 16:25:52'),
('1d6203bc-2a88-11f1-b385-c01850fc14e5', 'Chính trị',          'chinh-tri',      'event',  2, '2026-03-28 16:25:52'),
('1d620472-2a88-11f1-b385-c01850fc14e5', 'Văn hoá',            'van-hoa',        'event',  3, '2026-03-28 16:25:52'),
('1d6204c7-2a88-11f1-b385-c01850fc14e5', 'Ngoại giao',         'ngoai-giao',     'event',  4, '2026-03-28 16:25:52'),
('1d620511-2a88-11f1-b385-c01850fc14e5', 'Kinh tế',            'kinh-te',        'event',  5, '2026-03-28 16:25:52'),
('1d62055e-2a88-11f1-b385-c01850fc14e5', 'Khoa học – Kỹ thuật','khoa-hoc',       'event',  6, '2026-03-28 16:25:52'),
('1d6205aa-2a88-11f1-b385-c01850fc14e5', 'Anh hùng dân tộc',  'anh-hung',       'person', 1, '2026-03-28 16:25:52'),
('1d6205eb-2a88-11f1-b385-c01850fc14e5', 'Vua – Hoàng đế',    'vua',            'person', 2, '2026-03-28 16:25:52'),
('1d620637-2a88-11f1-b385-c01850fc14e5', 'Tướng lĩnh',         'tuong-linh',     'person', 3, '2026-03-28 16:25:52'),
('1d620679-2a88-11f1-b385-c01850fc14e5', 'Nhà tư tưởng',       'nha-tu-tuong',   'person', 4, '2026-03-28 16:25:52'),
('1d6206bb-2a88-11f1-b385-c01850fc14e5', 'Nữ tướng',           'nu-tuong',       'person', 5, '2026-03-28 16:25:52'),
('1d620700-2a88-11f1-b385-c01850fc14e5', 'Di sản văn hoá',     'di-san-van-hoa', 'place',  1, '2026-03-28 16:25:52'),
('1d620744-2a88-11f1-b385-c01850fc14e5', 'Di sản thiên nhiên', 'di-san-thien-nhien','place',2,'2026-03-28 16:25:52'),
('1d62078f-2a88-11f1-b385-c01850fc14e5', 'Di tích lịch sử',   'di-tich-lich-su','place',  3, '2026-03-28 16:25:52');

-- ------------------------------------------------------------
-- articles
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `articles` (
  `id`             char(36)     NOT NULL DEFAULT (UUID()),
  `title`          varchar(300) NOT NULL,
  `subtitle`       varchar(300) DEFAULT NULL,
  `slug`           varchar(350) NOT NULL,
  `summary`        text         NOT NULL COMMENT '1–2 câu tóm tắt',
  `content`        longtext     NOT NULL COMMENT 'Nội dung chính (Markdown)',
  `quote`          text         DEFAULT NULL COMMENT 'Trích dẫn nổi bật',
  `type`           enum('event','person','place','video','culture') NOT NULL,
  `status`         enum('draft','pending','published','rejected') NOT NULL DEFAULT 'draft',
  `year_start`     int(11)      DEFAULT NULL COMMENT 'Âm = TCN',
  `year_end`       int(11)      DEFAULT NULL,
  `year_display`   varchar(50)  DEFAULT NULL COMMENT 'vd: 938 hoặc 1418–1427',
  `dynasty_id`     char(36)     DEFAULT NULL,
  `category_id`    char(36)     DEFAULT NULL,
  `is_featured`    tinyint(1)   NOT NULL DEFAULT 0,
  `allow_comments` tinyint(1)   NOT NULL DEFAULT 1,
  `rejection_note` text         DEFAULT NULL,
  `created_by`     char(36)     NOT NULL,
  `updated_by`     char(36)     DEFAULT NULL,
  `published_by`   char(36)     DEFAULT NULL,
  `published_at`   datetime     DEFAULT NULL,
  `created_at`     datetime     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`     datetime     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_articles_slug` (`slug`),
  KEY `idx_articles_status`       (`status`),
  KEY `idx_articles_type`         (`type`),
  KEY `idx_articles_status_type`  (`status`, `type`),
  KEY `idx_articles_dynasty_year` (`dynasty_id`, `year_start`),
  KEY `idx_articles_year_start`   (`year_start`),
  KEY `idx_articles_featured`     (`is_featured`),
  KEY `idx_articles_published_at` (`published_at`),
  KEY `idx_articles_created_by`   (`created_by`, `status`),
  KEY `fk_articles_category`      (`category_id`),
  KEY `fk_articles_updated_by`    (`updated_by`),
  KEY `fk_articles_pub_by`        (`published_by`),
  FULLTEXT KEY `ft_articles_search` (`title`, `summary`, `content`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Bảng trung tâm. Metadata quyết định bài xuất hiện ở trang nào trên frontend.';

-- ------------------------------------------------------------
-- article_revisions
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `article_revisions` (
  `id`          char(36)     NOT NULL DEFAULT (UUID()),
  `article_id`  char(36)     NOT NULL,
  `admin_id`    char(36)     NOT NULL,
  `version`     int(11)      NOT NULL COMMENT 'Auto-increment per article',
  `title`       varchar(300) NOT NULL,
  `content`     longtext     NOT NULL,
  `summary`     text         NOT NULL,
  `change_note` text         DEFAULT NULL,
  `created_at`  datetime     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_revisions_article` (`article_id`, `version`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- article_persons  (junction)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `article_persons` (
  `article_id`    char(36)     NOT NULL,
  `person_id`     char(36)     NOT NULL,
  `role_in_event` varchar(100) DEFAULT NULL COMMENT 'vd: Chỉ huy, Nhân vật chính',
  PRIMARY KEY (`article_id`, `person_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- article_places  (junction)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `article_places` (
  `article_id` char(36) NOT NULL,
  `place_id`   char(36) NOT NULL,
  PRIMARY KEY (`article_id`, `place_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- article_related
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `article_related` (
  `article_id`    char(36)    NOT NULL,
  `related_id`    char(36)    NOT NULL,
  `relation_type` varchar(50) NOT NULL DEFAULT 'see_also' COMMENT 'see_also | video | same_dynasty | same_person',
  PRIMARY KEY (`article_id`, `related_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- historical_persons
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `historical_persons` (
  `id`           char(36)     NOT NULL DEFAULT (UUID()),
  `article_id`   char(36)     NOT NULL,
  `full_name`    varchar(200) NOT NULL,
  `birth_year`   int(11)      DEFAULT NULL COMMENT 'Âm = TCN',
  `death_year`   int(11)      DEFAULT NULL,
  `life_display` varchar(50)  DEFAULT NULL COMMENT 'vd: 1380 – 1442',
  `title`        varchar(150) DEFAULT NULL COMMENT 'vd: Nhà tư tưởng, Tướng lĩnh',
  `dynasty_id`   char(36)     DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_persons_article` (`article_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- places
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `places` (
  `id`           char(36)     NOT NULL DEFAULT (UUID()),
  `article_id`   char(36)     NOT NULL,
  `place_name`   varchar(200) NOT NULL,
  `province`     varchar(100) DEFAULT NULL,
  `place_type`   varchar(50)  DEFAULT NULL,
  `latitude`     decimal(9,6) DEFAULT NULL,
  `longitude`    decimal(9,6) DEFAULT NULL,
  `unesco_status` tinyint(1)  NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `idx_places_article` (`article_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- media
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `media` (
  `id`            char(36)   NOT NULL DEFAULT (UUID()),
  `article_id`    char(36)   NOT NULL,
  `media_type`    enum('image','video','audio') NOT NULL,
  `url`           text       NOT NULL,
  `thumbnail_url` text       DEFAULT NULL,
  `caption`       text       DEFAULT NULL,
  `duration_sec`  int(11)    DEFAULT NULL COMMENT 'Chỉ dùng cho video/audio',
  `is_cover`      tinyint(1) NOT NULL DEFAULT 0,
  `sort_order`    int(11)    NOT NULL DEFAULT 0,
  `created_at`    datetime   NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_media_article` (`article_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- sources
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `sources` (
  `id`         char(36)     NOT NULL DEFAULT (UUID()),
  `article_id` char(36)     NOT NULL,
  `title`      varchar(300) NOT NULL,
  `author`     varchar(200) DEFAULT NULL,
  `year`       varchar(20)  DEFAULT NULL,
  `publisher`  varchar(200) DEFAULT NULL,
  `url`        text         DEFAULT NULL,
  `sort_order` int(11)      NOT NULL DEFAULT 0,
  `created_at` datetime     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_sources_article` (`article_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- reports
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `reports` (
  `id`               char(36)    NOT NULL DEFAULT (UUID()),
  `report_code`      varchar(20) DEFAULT NULL COMMENT 'Sinh tự động bằng trigger: BC-YYYY-XXXX',
  `article_id`       char(36)    NOT NULL,
  `error_type`       varchar(100) NOT NULL,
  `severity`         enum('low','medium','high') NOT NULL DEFAULT 'medium',
  `quoted_text`      text        DEFAULT NULL,
  `description`      text        NOT NULL,
  `suggested_source` text        DEFAULT NULL,
  `reporter_email`   varchar(255) DEFAULT NULL,
  `status`           enum('new','reviewing','resolved','rejected') NOT NULL DEFAULT 'new',
  `assigned_to`      char(36)    DEFAULT NULL,
  `admin_note`       text        DEFAULT NULL,
  `resolved_at`      datetime    DEFAULT NULL,
  `resolved_by`      char(36)    DEFAULT NULL,
  `created_at`       datetime    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_reports_article`  (`article_id`),
  KEY `idx_reports_status`   (`status`),
  KEY `idx_reports_severity` (`severity`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Báo cáo lỗi nội dung.';

-- ------------------------------------------------------------
-- settings
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `settings` (
  `key`        varchar(100) NOT NULL,
  `value`      text         NOT NULL,
  `description` varchar(300) DEFAULT NULL,
  `updated_at` datetime     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `updated_by` char(36)     DEFAULT NULL,
  PRIMARY KEY (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Chỉ super_admin được sửa.';

INSERT IGNORE INTO `settings` (`key`, `value`, `description`) VALUES
('site_name',        'Lịch Sử Việt Nam — Bách Khoa Toàn Thư', 'Tên website'),
('site_description', 'Sứ mệnh của chúng tôi là gìn giữ và truyền tải những giá trị lịch sử cao quý của dân tộc Việt Nam.', 'Mô tả'),
('site_email',       'admin@lsvn.vn',  'Email nhận thông báo'),
('articles_per_page','20',             'Số bài mỗi trang'),
('allow_comments',   'true',           'Cho phép bình luận mặc định'),
('notify_on_report', 'true',           'Gửi email khi có báo cáo mới');

-- ------------------------------------------------------------
-- activity_logs
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `activity_logs` (
  `id`           bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `admin_id`     char(36)     NOT NULL,
  `action`       varchar(50)  NOT NULL,
  `target_type`  varchar(50)  DEFAULT NULL,
  `target_id`    char(36)     DEFAULT NULL,
  `target_title` varchar(300) DEFAULT NULL COMMENT 'Snapshot tên tại thời điểm hành động',
  `detail`       text         DEFAULT NULL,
  `ip_address`   varchar(45)  DEFAULT NULL,
  `created_at`   datetime     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_logs_admin_time` (`admin_id`, `created_at`),
  KEY `idx_logs_action`     (`action`, `created_at`),
  KEY `idx_logs_target`     (`target_type`, `target_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Append-only. Không UPDATE, không DELETE.';

-- ------------------------------------------------------------
-- Triggers
-- ------------------------------------------------------------

DROP TRIGGER IF EXISTS `trg_article_snapshot`;
DELIMITER $$
CREATE TRIGGER `trg_article_snapshot`
AFTER UPDATE ON `articles`
FOR EACH ROW
BEGIN
  IF OLD.content <> NEW.content
  OR OLD.title   <> NEW.title
  OR OLD.summary <> NEW.summary THEN
    INSERT INTO article_revisions (id, article_id, admin_id, version, title, content, summary)
    VALUES (UUID(), NEW.id, NEW.updated_by, 0, NEW.title, NEW.content, NEW.summary);
  END IF;
END$$
DELIMITER ;

DROP TRIGGER IF EXISTS `trg_revision_version`;
DELIMITER $$
CREATE TRIGGER `trg_revision_version`
BEFORE INSERT ON `article_revisions`
FOR EACH ROW
BEGIN
  DECLARE max_ver INT DEFAULT 0;
  SELECT COALESCE(MAX(version), 0) INTO max_ver
  FROM article_revisions WHERE article_id = NEW.article_id;
  SET NEW.version = max_ver + 1;
END$$
DELIMITER ;

DROP TRIGGER IF EXISTS `trg_report_code`;
DELIMITER $$
CREATE TRIGGER `trg_report_code`
BEFORE INSERT ON `reports`
FOR EACH ROW
BEGIN
  DECLARE next_num INT;
  IF NEW.report_code IS NULL THEN
    SELECT COUNT(*) + 1 INTO next_num FROM reports
    WHERE YEAR(created_at) = YEAR(NOW());
    SET NEW.report_code = CONCAT('BC-', YEAR(NOW()), '-', LPAD(next_num, 4, '0'));
  END IF;
END$$
DELIMITER ;

-- ------------------------------------------------------------
-- Views
-- ------------------------------------------------------------

CREATE OR REPLACE VIEW `published_articles` AS
SELECT
  a.id, a.title, a.subtitle, a.slug, a.summary, a.type,
  a.year_start, a.year_end, a.year_display,
  a.is_featured, a.published_at,
  d.name  AS dynasty_name,  d.slug AS dynasty_slug,
  c.name  AS category_name, c.slug AS category_slug,
  adm.full_name AS created_by_name
FROM articles a
LEFT JOIN dynasties  d   ON a.dynasty_id  = d.id
LEFT JOIN categories c   ON a.category_id = c.id
LEFT JOIN admins     adm ON a.created_by  = adm.id
WHERE a.status = 'published'
ORDER BY a.year_start ASC;

CREATE OR REPLACE VIEW `open_reports` AS
SELECT
  r.id, r.report_code, r.error_type, r.severity,
  r.status, r.created_at,
  a.title AS article_title, a.slug AS article_slug, a.type AS article_type,
  adm.full_name AS assigned_to_name
FROM reports r
JOIN  articles a   ON r.article_id  = a.id
LEFT JOIN admins adm ON r.assigned_to = adm.id
WHERE r.status IN ('new', 'reviewing')
ORDER BY
  CASE r.severity WHEN 'high' THEN 1 WHEN 'medium' THEN 2 ELSE 3 END,
  r.created_at ASC;

CREATE OR REPLACE VIEW `dashboard_stats` AS
SELECT
  (SELECT COUNT(*) FROM articles  WHERE status = 'published')                                AS total_published,
  (SELECT COUNT(*) FROM articles  WHERE status = 'pending')                                  AS total_pending,
  (SELECT COUNT(*) FROM articles  WHERE status = 'draft')                                    AS total_draft,
  (SELECT COUNT(*) FROM reports   WHERE status = 'new')                                      AS reports_new,
  (SELECT COUNT(*) FROM reports   WHERE status = 'reviewing')                                AS reports_reviewing,
  (SELECT COUNT(*) FROM articles  WHERE status = 'published' AND DATE(published_at) = CURDATE()) AS published_today,
  (SELECT COUNT(*) FROM admins    WHERE is_active = 1)                                       AS active_admins;
