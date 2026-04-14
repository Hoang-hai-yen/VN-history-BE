-- ============================================================
-- Migration 005: Cập nhật media thật (ảnh Wikipedia + video YouTube)
-- Thay thế URL placeholder bằng ảnh Wikimedia Commons thật
-- Bổ sung ảnh cho các bài chưa có media
-- ============================================================

-- ------------------------------------------------------------
-- Cập nhật 3 ảnh cũ (URL Cloudinary demo → Wikimedia Commons)
-- ------------------------------------------------------------

-- Chiến thắng Bạch Đằng 938
UPDATE `media`
SET
  url         = 'https://upload.wikimedia.org/wikipedia/commons/d/da/Model_of_Battle_in_Bach_Dang_River_in_938_AD_-_DSC05544.JPG',
  caption     = 'Mô hình trận Bạch Đằng năm 938 tại Bảo tàng Lịch sử Quốc gia Việt Nam'
WHERE id = 'm1000001-0000-0000-0000-000000000001';

-- Ngô Quyền
UPDATE `media`
SET
  url     = 'https://upload.wikimedia.org/wikipedia/commons/a/af/T%C6%B0%E1%BB%A3ng_Ng%C3%B4_Quy%E1%BB%81n.jpg',
  caption = 'Tượng Ngô Quyền tại Hải Phòng'
WHERE id = 'm1000001-0000-0000-0000-000000000002';

-- Trần Hưng Đạo
UPDATE `media`
SET
  url     = 'https://upload.wikimedia.org/wikipedia/commons/6/63/Statue_of_Tran_Hung_Dao%2C_Ho_Chi_Minh_City%2C_Vietnam.jpg',
  caption = 'Tượng Trần Hưng Đạo tại TP. Hồ Chí Minh'
WHERE id = 'm1000001-0000-0000-0000-000000000003';

-- Video trận Bạch Đằng (thay rickroll → phim hoạt hình Đại Chiến Bạch Đằng 2012)
UPDATE `media`
SET
  url           = 'https://www.youtube.com/embed/ok_KBwgS9eg',
  thumbnail_url = 'https://img.youtube.com/vi/ok_KBwgS9eg/maxresdefault.jpg',
  caption       = 'Phim hoạt hình Đại Chiến Bạch Đằng — tái hiện trận Bạch Đằng năm 938'
WHERE id = 'm1000001-0000-0000-0000-000000000004';

-- ------------------------------------------------------------
-- Thêm ảnh cho 4 bài chưa có media
-- ------------------------------------------------------------

INSERT IGNORE INTO `media` (id, article_id, media_type, url, thumbnail_url, caption, is_cover, sort_order) VALUES

-- Khởi nghĩa Lam Sơn
('m1000001-0000-0000-0000-000000000005', 'a1000001-0000-0000-0000-000000000002',
 'image',
 'https://upload.wikimedia.org/wikipedia/commons/8/81/Le_Loi_statue.JPG',
 NULL,
 'Tượng Lê Lợi tại Thanh Hoá — người lãnh đạo khởi nghĩa Lam Sơn', 1, 1),

-- Hai Bà Trưng
('m1000001-0000-0000-0000-000000000006', 'a1000001-0000-0000-0000-000000000005',
 'image',
 'https://upload.wikimedia.org/wikipedia/commons/4/44/Hai_ba_trung_Dong_Ho_painting.jpg',
 NULL,
 'Tranh Đông Hồ — Hai Bà Trưng cưỡi voi xuất trận', 1, 1),

-- Cố đô Hoa Lư
('m1000001-0000-0000-0000-000000000007', 'a1000001-0000-0000-0000-000000000006',
 'image',
 'https://upload.wikimedia.org/wikipedia/commons/d/d2/Codohoalu2010k5.jpg',
 NULL,
 'Lễ hội tại Đền vua Đinh Tiên Hoàng, Cố đô Hoa Lư, Ninh Bình', 1, 1),

-- Hoàng thành Thăng Long
('m1000001-0000-0000-0000-000000000008', 'a1000001-0000-0000-0000-000000000007',
 'image',
 'https://upload.wikimedia.org/wikipedia/commons/7/70/Main_Gate_-_Citadel_of_Hanoi.jpg',
 NULL,
 'Đoan Môn — cổng chính phía nam Hoàng thành Thăng Long, Hà Nội', 1, 1);
