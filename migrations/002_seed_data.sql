-- ============================================================
-- Migration 002: Dữ liệu mẫu
-- Bao gồm: cập nhật mật khẩu admin, bài viết mẫu thực tế
-- Mật khẩu mặc định: Admin@123
-- ============================================================

-- ------------------------------------------------------------
-- Cập nhật mật khẩu super_admin (bcrypt của "Admin@123")
-- ------------------------------------------------------------
UPDATE `admins`
SET `password_hash` = '$2b$12$bqRcd/EA1fp2KiYkszEdu.Sr1IeA0IMxGiFi8GKhdklgczRjcM7Oi'
WHERE `email` = 'admin@lsvn.vn';

-- ------------------------------------------------------------
-- Bài viết mẫu — Sự kiện lịch sử (type = event)
-- ------------------------------------------------------------

INSERT IGNORE INTO `articles`
  (id, title, subtitle, slug, summary, content, quote, type, status,
   year_start, year_end, year_display, dynasty_id, category_id,
   is_featured, allow_comments, created_by, published_by, published_at)
VALUES
(
  'a1000001-0000-0000-0000-000000000001',
  'Chiến thắng Bạch Đằng năm 938',
  'Trận đánh kết thúc 1000 năm Bắc thuộc',
  'chien-thang-bach-dang-938',
  'Trận Bạch Đằng năm 938 do Ngô Quyền chỉ huy đã đánh bại quân Nam Hán, chấm dứt hơn một nghìn năm đô hộ của phương Bắc và mở ra kỷ nguyên độc lập lâu dài cho dân tộc Việt.',
  '## Bối cảnh lịch sử

Sau hơn một nghìn năm bị phương Bắc đô hộ (từ năm 111 TCN), đất Việt liên tục nổi dậy đấu tranh giành độc lập. Đầu thế kỷ X, nhân lúc nhà Đường suy yếu và sụp đổ, Khúc Thừa Dụ đã giành quyền tự chủ (905). Tuy nhiên, năm 930, quân Nam Hán tái chiếm Giao Châu và bắt Khúc Thừa Mỹ về nước.

## Ngô Quyền chuẩn bị kháng chiến

Ngô Quyền (898–944), con rể của Dương Đình Nghệ — người từng đánh đuổi quân Nam Hán năm 931 — sau khi trả thù cho nhạc phụ bị Kiều Công Tiễn sát hại, đã tập hợp lực lượng, chuẩn bị đối phó với cuộc xâm lăng của Nam Hán.

Ông cho đóng cọc gỗ đầu nhọn bịt sắt xuống lòng sông Bạch Đằng (nay thuộc Quảng Ninh – Hải Phòng), tính toán theo con nước triều để dụ thuyền giặc vào bãi cọc.

## Diễn biến trận đánh

Tháng 11 năm 938, thủy quân Nam Hán do Lưu Hoằng Tháo chỉ huy tiến vào cửa sông Bạch Đằng. Quân Ngô Quyền dùng thuyền nhỏ nhử địch vào sâu trong sông, đúng lúc thủy triều xuống. Bãi cọc nhô lên, thuyền chiến Nam Hán lớn và nặng bị mắc cọc, vỡ tan. Lưu Hoằng Tháo tử trận, toàn bộ thủy quân địch bị tiêu diệt.

## Ý nghĩa lịch sử

Chiến thắng Bạch Đằng năm 938 là một trong những chiến công vĩ đại nhất trong lịch sử chống ngoại xâm của dân tộc Việt Nam. Ngô Quyền xưng vương, đặt kinh đô ở Cổ Loa, mở ra nền độc lập tự chủ kéo dài suốt nghìn năm tiếp theo.',
  'Với trận Bạch Đằng, Ngô Quyền đã vĩnh viễn chấm dứt ách đô hộ phương Bắc, trả lại nền độc lập cho dân tộc Việt.',
  'event', 'published',
  938, 938, '938',
  '1d5e6f78-2a88-11f1-b385-c01850fc14e5', -- Bắc thuộc
  '1d61f941-2a88-11f1-b385-c01850fc14e5', -- Kháng chiến
  1, 1,
  '1d655491-2a88-11f1-b385-c01850fc14e5',
  '1d655491-2a88-11f1-b385-c01850fc14e5',
  '2026-03-28 16:25:52'
),
(
  'a1000001-0000-0000-0000-000000000002',
  'Khởi nghĩa Lam Sơn (1418–1427)',
  'Mười năm kháng chiến chống quân Minh',
  'khoi-nghia-lam-son',
  'Cuộc khởi nghĩa Lam Sơn do Lê Lợi lãnh đạo từ năm 1418 đến 1427 đã đánh đuổi quân Minh ra khỏi đất Việt sau hơn 20 năm đô hộ, lập nên triều Lê sơ lừng lẫy trong lịch sử.',
  '## Hoàn cảnh lịch sử

Năm 1407, nhà Minh (Trung Quốc) xâm lược và thôn tính nước Đại Ngu, đổi thành quận Giao Chỉ. Suốt hơn 20 năm đô hộ, nhân dân Việt bị áp bức nặng nề: tô thuế cao, lao dịch khổ sai, bắt dân học chữ Hán và phong tục Hán.

## Lê Lợi khởi binh

Năm 1418, Lê Lợi — một hào trưởng đất Lam Sơn (nay thuộc Thanh Hoá) — tập hợp các nghĩa sĩ yêu nước, phất cờ khởi nghĩa. Giai đoạn đầu (1418–1423) nghĩa quân gặp nhiều khó khăn, phải lui về núi rừng Chí Linh ba lần.

## Giai đoạn phản công

Từ 1424 trở đi, nhờ mưu lược của Nguyễn Trãi và các tướng lĩnh tài ba, nghĩa quân chuyển sang phản công. Năm 1426, Lê Lợi tiến quân ra Bắc, vây hãm Đông Quan (Hà Nội). Năm 1427, sau trận Chi Lăng – Xương Giang, chủ tướng Minh là Liễu Thăng tử trận, quân Minh hoàn toàn thất bại và phải rút lui.

## Bình Ngô đại cáo

Sau chiến thắng, Nguyễn Trãi soạn *Bình Ngô đại cáo* (1428) — bản tuyên ngôn độc lập bất hủ của dân tộc — khẳng định chủ quyền và nền văn hiến lâu đời của nước Đại Việt. Lê Lợi lên ngôi, tức Lê Thái Tổ, lập triều Lê sơ.',
  'Như nước Đại Việt ta từ trước, vốn xưng nền văn hiến đã lâu. — Bình Ngô đại cáo, Nguyễn Trãi',
  'event', 'published',
  1418, 1427, '1418–1427',
  '1d5e768a-2a88-11f1-b385-c01850fc14e5', -- Nhà Lê sơ
  '1d61f941-2a88-11f1-b385-c01850fc14e5', -- Kháng chiến
  1, 1,
  '1d655491-2a88-11f1-b385-c01850fc14e5',
  '1d655491-2a88-11f1-b385-c01850fc14e5',
  '2026-03-28 16:25:52'
);

-- ------------------------------------------------------------
-- Bài viết mẫu — Nhân vật lịch sử (type = person)
-- ------------------------------------------------------------

INSERT IGNORE INTO `articles`
  (id, title, subtitle, slug, summary, content, type, status,
   year_start, year_end, year_display, dynasty_id, category_id,
   is_featured, allow_comments, created_by, published_by, published_at)
VALUES
(
  'a1000001-0000-0000-0000-000000000003',
  'Ngô Quyền',
  'Người khai sinh nền độc lập dân tộc',
  'ngo-quyen',
  'Ngô Quyền (898–944) là vị anh hùng dân tộc, người đã lãnh đạo trận Bạch Đằng năm 938 đánh bại quân Nam Hán, chấm dứt hơn một nghìn năm Bắc thuộc và khai mở kỷ nguyên độc lập cho dân tộc Việt.',
  '## Thân thế

Ngô Quyền sinh năm 898 tại Đường Lâm (nay thuộc thị xã Sơn Tây, Hà Nội), trong một gia đình hào trưởng có thế lực. Ông có tướng mạo khôi ngô, sức khoẻ phi thường và sớm bộc lộ tài năng quân sự xuất chúng.

## Theo phò Dương Đình Nghệ

Thuở trẻ, Ngô Quyền theo phục vụ Dương Đình Nghệ — người đã khởi nghĩa đánh đuổi quân Nam Hán năm 931, giành lại quyền tự chủ cho đất Việt. Ông được Dương Đình Nghệ tin tưởng, gả con gái và giao trấn thủ Ái Châu (Thanh Hoá).

## Dẹp nội loạn, đánh Nam Hán

Năm 937, Dương Đình Nghệ bị Kiều Công Tiễn — một nha tướng phản bội — sát hại. Ngô Quyền lập tức kéo quân về Giao Châu hỏi tội. Kiều Công Tiễn cầu cứu Nam Hán, vua Nam Hán sai con là Lưu Hoằng Tháo thống lĩnh thuỷ quân sang tiếp ứng.

Ngô Quyền cho đóng cọc trên sông Bạch Đằng và nhử quân Nam Hán vào trận địa lúc thuỷ triều xuống. Thuyền chiến địch mắc cọc, vỡ tan. Lưu Hoằng Tháo tử trận, toàn quân Nam Hán bị tiêu diệt.

## Xưng vương, định đô

Sau chiến thắng Bạch Đằng, Ngô Quyền xưng vương (939), đặt kinh đô ở Cổ Loa, thiết lập triều nghi phẩm phục, đặt nền móng cho nhà nước phong kiến độc lập đầu tiên của người Việt.

Ông mất năm 944, hưởng thọ 47 tuổi, để lại sự nghiệp vĩ đại là nền độc lập của dân tộc.',
  'person', 'published',
  898, 944, '898–944',
  '1d5e74c0-2a88-11f1-b385-c01850fc14e5', -- Nhà Ngô
  '1d6205aa-2a88-11f1-b385-c01850fc14e5', -- Anh hùng dân tộc
  1, 1,
  '1d655491-2a88-11f1-b385-c01850fc14e5',
  '1d655491-2a88-11f1-b385-c01850fc14e5',
  '2026-03-28 16:25:52'
),
(
  'a1000001-0000-0000-0000-000000000004',
  'Trần Hưng Đạo',
  'Quốc công Tiết chế — ba lần đánh tan quân Mông Nguyên',
  'tran-hung-dao',
  'Trần Hưng Đạo (1228–1300), tên thật là Trần Quốc Tuấn, là Quốc công Tiết chế của nhà Trần, người đã ba lần lãnh đạo quân dân Đại Việt đánh thắng đế quốc Mông Nguyên hùng mạnh nhất thế giới thời bấy giờ.',
  '## Thân thế và xuất thân

Trần Quốc Tuấn sinh khoảng năm 1228, là con trai của An Sinh Vương Trần Liễu — anh ruột vua Trần Thái Tông. Ông được học tập từ nhỏ, tinh thông binh pháp, văn chương và là một vị tướng toàn tài.

## Ba lần kháng Mông Nguyên

**Lần thứ nhất (1258):** Quân Mông Cổ tiến vào Thăng Long, vua tôi nhà Trần tạm lui. Sau đó phản công, quân Mông Cổ phải rút lui.

**Lần thứ hai (1285):** Đây là cuộc xâm lăng lớn nhất với 50 vạn quân do Thoát Hoan chỉ huy. Trần Hưng Đạo áp dụng chiến thuật "vườn không nhà trống", rút lui chiến lược rồi phản công. Quân giặc bị tiêu diệt tại Hàm Tử, Chương Dương, Tây Kết.

**Lần thứ ba (1288):** Trận Bạch Đằng huyền thoại, Trần Hưng Đạo tái dụng kế cọc gỗ của Ngô Quyền, đánh tan toàn bộ thuỷ quân Mông Nguyên. Ô Mã Nhi bị bắt sống, Thoát Hoan phải chui vào ống đồng chạy về nước.

## Hịch tướng sĩ và tư tưởng quân sự

Trước cuộc xâm lăng lần hai, ông viết *Hịch tướng sĩ* — áng văn bất hủ — khích lệ tinh thần chiến đấu toàn quân. Tác phẩm *Binh thư yếu lược* của ông là kho tàng lý luận quân sự quý báu.

## Được thần thánh hoá

Sau khi mất (1300), Trần Hưng Đạo được nhân dân thờ phụng khắp nơi, tôn là "Đức Thánh Trần". Ông được UNESCO vinh danh là một trong những vị tướng kiệt xuất của lịch sử thế giới.',
  'person', 'published',
  1228, 1300, '1228–1300',
  '1d5e7624-2a88-11f1-b385-c01850fc14e5', -- Nhà Trần
  '1d620637-2a88-11f1-b385-c01850fc14e5', -- Tướng lĩnh
  1, 1,
  '1d655491-2a88-11f1-b385-c01850fc14e5',
  '1d655491-2a88-11f1-b385-c01850fc14e5',
  '2026-03-28 16:25:52'
),
(
  'a1000001-0000-0000-0000-000000000005',
  'Hai Bà Trưng',
  'Hai nữ anh hùng đầu tiên trong lịch sử dân tộc',
  'hai-ba-trung',
  'Trưng Trắc và Trưng Nhị là hai chị em nữ anh hùng đã phất cờ khởi nghĩa năm 40, đánh đuổi Thái thú Tô Định, lập nên nhà nước độc lập đầu tiên kéo dài 3 năm (40–43 sau Công nguyên).',
  '## Hoàn cảnh đất nước

Dưới ách đô hộ của nhà Hán, dân Việt chịu sưu thuế nặng nề, bị áp bức và đồng hoá. Thi Sách — chồng của Trưng Trắc và là một hào trưởng yêu nước — bị Thái thú Tô Định giết hại vì mưu đồ chống lại ách đô hộ.

## Khởi nghĩa năm 40

Năm 40 sau Công nguyên, Trưng Trắc cùng em gái Trưng Nhị phất cờ khởi nghĩa tại Hát Môn (nay thuộc Hà Nội). Nghĩa quân nhanh chóng thu hút hàng chục tướng lĩnh, nhiều người cũng là phụ nữ như Bát Nàn, Lê Chân, Thiều Hoa...

Chỉ trong thời gian ngắn, nghĩa quân đã đánh chiếm 65 thành trì, đuổi Tô Định về nước. Trưng Trắc xưng vương, đóng đô ở Mê Linh, miễn thuế cho dân hai năm.

## Thất bại và hy sinh

Năm 42, nhà Hán sai Mã Viện — danh tướng lừng lẫy — đem đại quân sang tái chiếm. Sau nhiều trận đánh anh dũng, nghĩa quân thất thế. Năm 43, Hai Bà Trưng tuẫn tiết trên sông Hát Giang để giữ tròn khí tiết.

## Di sản

Dù chỉ tồn tại 3 năm, nhà nước của Hai Bà Trưng là biểu tượng bất diệt về tinh thần yêu nước và vai trò người phụ nữ Việt trong lịch sử dựng nước và giữ nước.',
  'person', 'published',
  14, 43, '14–43',
  '1d5e6f78-2a88-11f1-b385-c01850fc14e5', -- Bắc thuộc
  '1d6206bb-2a88-11f1-b385-c01850fc14e5', -- Nữ tướng
  1, 1,
  '1d655491-2a88-11f1-b385-c01850fc14e5',
  '1d655491-2a88-11f1-b385-c01850fc14e5',
  '2026-03-28 16:25:52'
);

-- ------------------------------------------------------------
-- Bài viết mẫu — Địa danh / Di tích (type = place)
-- subtitle dùng để lưu tỉnh/thành (hiển thị badge trên card)
-- ------------------------------------------------------------

INSERT IGNORE INTO `articles`
  (id, title, subtitle, slug, summary, content, type, status,
   year_start, year_display, dynasty_id, category_id,
   is_featured, allow_comments, created_by, published_by, published_at)
VALUES
(
  'a1000001-0000-0000-0000-000000000006',
  'Cố đô Hoa Lư',
  'Ninh Bình',
  'co-do-hoa-lu',
  'Hoa Lư là kinh đô của nhà nước Đại Cồ Việt dưới triều Đinh và Tiền Lê (968–1010), nằm tại tỉnh Ninh Bình ngày nay. Đây là Di sản Văn hoá Thế giới được UNESCO công nhận năm 2014.',
  '## Lịch sử hình thành

Sau khi thống nhất 12 sứ quân (968), Đinh Tiên Hoàng chọn Hoa Lư — vùng núi non hiểm trở — làm kinh đô, đặt quốc hiệu là Đại Cồ Việt. Địa thế núi đá vôi bao quanh tạo thành tường thành thiên nhiên vững chắc.

## Thời kỳ hoàng kim

Kinh đô Hoa Lư tồn tại dưới hai triều Đinh (968–980) và Tiền Lê (980–1009). Lê Hoàn (Lê Đại Hành) đã chỉ huy trận chiến chống Tống xâm lược thành công năm 981 từ kinh đô này.

Năm 1010, Lý Công Uẩn dời đô ra Thăng Long, Hoa Lư trở thành cố đô.

## Di tích hiện còn

Ngày nay, quần thể di tích Hoa Lư bao gồm:
- **Đền vua Đinh Tiên Hoàng** — thờ người sáng lập Đại Cồ Việt
- **Đền vua Lê Đại Hành** — thờ người đánh thắng quân Tống
- Thành Hoa Lư với hệ thống tường thành bằng đất và đá

## Di sản UNESCO

Năm 2014, Quần thể danh thắng Tràng An — bao gồm cố đô Hoa Lư — được UNESCO công nhận là Di sản Văn hoá và Thiên nhiên Thế giới, danh hiệu kép đầu tiên tại Việt Nam và Đông Nam Á.',
  'place', 'published',
  968, '968–1010',
  '1d5e754e-2a88-11f1-b385-c01850fc14e5', -- Nhà Đinh
  '1d620700-2a88-11f1-b385-c01850fc14e5', -- Di sản văn hoá
  1, 1,
  '1d655491-2a88-11f1-b385-c01850fc14e5',
  '1d655491-2a88-11f1-b385-c01850fc14e5',
  '2026-03-28 16:25:52'
),
(
  'a1000001-0000-0000-0000-000000000007',
  'Hoàng thành Thăng Long',
  'Hà Nội',
  'hoang-thanh-thang-long',
  'Hoàng thành Thăng Long là quần thể di tích kiến trúc của các triều đại phong kiến Việt Nam trong hơn 13 thế kỷ tại Hà Nội, được UNESCO công nhận là Di sản Văn hoá Thế giới năm 2010.',
  '## Lịch sử xây dựng

Năm 1010, Lý Công Uẩn ban *Chiếu dời đô*, chuyển kinh đô từ Hoa Lư ra thành Đại La, đổi tên là Thăng Long. Hoàng thành được xây dựng từ đây, qua các triều Lý, Trần, Lê, Mạc và Nguyễn liên tục mở rộng và tu bổ.

## Các triều đại và công trình

- **Nhà Lý (1010–1225):** Xây dựng nền móng ban đầu, Điện Kính Thiên, Cột Cờ
- **Nhà Trần (1225–1400):** Mở rộng, đặt tên các khu vực chính
- **Nhà Lê sơ (1428–1527):** Tái thiết sau chiến tranh, xây Điện Kính Thiên hoàng tráng
- **Nhà Nguyễn (1802–1945):** Dời đô vào Huế nhưng vẫn duy trì Hành cung Hà Nội

## Phát lộ khảo cổ

Năm 2003, trong quá trình xây dựng Nhà Quốc hội, các nhà khảo cổ phát lộ khu di tích khảo cổ 18 Hoàng Diệu với hàng triệu hiện vật qua nhiều lớp văn hoá chồng xếp từ thế kỷ VII đến XIX.

## Di sản UNESCO

Năm 2010, Khu trung tâm Hoàng thành Thăng Long được UNESCO công nhận là Di sản Văn hoá Thế giới, ghi nhận giá trị nổi bật toàn cầu về lịch sử, văn hoá và kiến trúc.',
  'place', 'published',
  1010, '1010–nay',
  '1d5e75f3-2a88-11f1-b385-c01850fc14e5', -- Nhà Lý
  '1d620700-2a88-11f1-b385-c01850fc14e5', -- Di sản văn hoá
  0, 1,
  '1d655491-2a88-11f1-b385-c01850fc14e5',
  '1d655491-2a88-11f1-b385-c01850fc14e5',
  '2026-03-28 16:25:52'
);

-- ------------------------------------------------------------
-- Bài viết mẫu — Video (type = video)
-- ------------------------------------------------------------

INSERT IGNORE INTO `articles`
  (id, title, subtitle, slug, summary, content, type, status,
   year_start, year_display, dynasty_id, category_id,
   is_featured, allow_comments, created_by, published_by, published_at)
VALUES
(
  'a1000001-0000-0000-0000-000000000008',
  'Trận Bạch Đằng 938 — Phục dựng lịch sử',
  NULL,
  'video-tran-bach-dang-938',
  'Video phục dựng trận chiến Bạch Đằng năm 938, mô phỏng chiến thuật đóng cọc thiên tài của Ngô Quyền và diễn biến tiêu diệt thuỷ quân Nam Hán.',
  '## Giới thiệu video

Video này tái hiện lại trận Bạch Đằng năm 938 thông qua đồ hoạ máy tính và tư liệu lịch sử. Nội dung được tư vấn bởi các nhà sử học và khảo cổ học hàng đầu Việt Nam.

## Nội dung chính

- Bối cảnh lịch sử trước trận đánh
- Chiến thuật bố trí bãi cọc của Ngô Quyền
- Diễn biến trận chiến theo con nước triều
- Ý nghĩa lịch sử sau chiến thắng',
  'video', 'published',
  938, '938',
  '1d5e74c0-2a88-11f1-b385-c01850fc14e5', -- Nhà Ngô
  '1d61f941-2a88-11f1-b385-c01850fc14e5', -- Kháng chiến
  1, 1,
  '1d655491-2a88-11f1-b385-c01850fc14e5',
  '1d655491-2a88-11f1-b385-c01850fc14e5',
  '2026-03-28 16:25:52'
);

-- ------------------------------------------------------------
-- Media mẫu (YouTube embed + Cloudinary)
-- ------------------------------------------------------------

INSERT IGNORE INTO `media` (id, article_id, media_type, url, thumbnail_url, caption, is_cover, sort_order) VALUES
-- Ảnh bìa bài Chiến thắng Bạch Đằng
('m1000001-0000-0000-0000-000000000001', 'a1000001-0000-0000-0000-000000000001',
 'image',
 'https://res.cloudinary.com/demo/image/upload/v1/lsvn/bach-dang-938.jpg',
 NULL,
 'Tranh vẽ trận Bạch Đằng năm 938', 1, 1),

-- Ảnh bìa bài Ngô Quyền
('m1000001-0000-0000-0000-000000000002', 'a1000001-0000-0000-0000-000000000003',
 'image',
 'https://res.cloudinary.com/demo/image/upload/v1/lsvn/ngo-quyen.jpg',
 NULL,
 'Tượng Ngô Quyền tại đền thờ Đường Lâm', 1, 1),

-- Ảnh bìa Trần Hưng Đạo
('m1000001-0000-0000-0000-000000000003', 'a1000001-0000-0000-0000-000000000004',
 'image',
 'https://res.cloudinary.com/demo/image/upload/v1/lsvn/tran-hung-dao.jpg',
 NULL,
 'Tượng Trần Hưng Đạo tại TP. Hồ Chí Minh', 1, 1),

-- Video YouTube cho bài video
('m1000001-0000-0000-0000-000000000004', 'a1000001-0000-0000-0000-000000000008',
 'video',
 'https://www.youtube.com/embed/dQw4w9WgXcQ',
 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
 'Video phục dựng trận Bạch Đằng 938', 1, 1);

-- ------------------------------------------------------------
-- Nguồn tham khảo mẫu
-- ------------------------------------------------------------

INSERT IGNORE INTO `sources` (id, article_id, title, author, year, publisher, sort_order) VALUES
('s1000001-0000-0000-0000-000000000001', 'a1000001-0000-0000-0000-000000000001',
 'Đại Việt sử ký toàn thư', 'Ngô Sĩ Liên', '1479', 'NXB Khoa học Xã hội', 1),

('s1000001-0000-0000-0000-000000000002', 'a1000001-0000-0000-0000-000000000001',
 'Lịch sử Việt Nam — Tập 1', 'Nhiều tác giả', '2017', 'NXB Khoa học Xã hội', 2),

('s1000001-0000-0000-0000-000000000003', 'a1000001-0000-0000-0000-000000000002',
 'Bình Ngô đại cáo', 'Nguyễn Trãi', '1428', NULL, 1),

('s1000001-0000-0000-0000-000000000004', 'a1000001-0000-0000-0000-000000000004',
 'Hịch tướng sĩ', 'Trần Hưng Đạo', '1285', NULL, 1);
