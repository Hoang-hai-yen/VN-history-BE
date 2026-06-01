-- Migration 009: Thêm chuyên mục cho loại bài Văn hóa

INSERT IGNORE INTO `categories` (`id`, `name`, `slug`, `article_type`, `sort_order`, `created_at`) VALUES
(UUID(), 'Ẩm thực',        'am-thuc',       'culture', 1, NOW()),
(UUID(), 'Trang phục',     'trang-phuc',    'culture', 2, NOW()),
(UUID(), 'Lễ hội',         'le-hoi',        'culture', 3, NOW()),
(UUID(), 'Nghệ thuật',     'nghe-thuat',    'culture', 4, NOW()),
(UUID(), 'Kiến trúc',      'kien-truc',     'culture', 5, NOW()),
(UUID(), 'Tín ngưỡng',     'tin-nguong',    'culture', 6, NOW()),
(UUID(), 'Ngôn ngữ – Chữ viết', 'ngon-ngu', 'culture', 7, NOW()),
(UUID(), 'Phong tục tập quán', 'phong-tuc', 'culture', 8, NOW());
