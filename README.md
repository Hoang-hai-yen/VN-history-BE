# Lịch Sử Việt Nam — Backend API

REST API cho nền tảng bách khoa lịch sử Việt Nam. Xây dựng bằng Node.js + Express + MySQL.

## Yêu cầu

- Node.js >= 18
- MySQL >= 8 hoặc MariaDB >= 10.6

## Cài đặt

```bash
# 1. Cài dependencies
npm install

# 2. Tạo file môi trường
cp .env.example .env
# Mở .env và điền thông tin database

# 3. Tạo database
mysql -u root -p -e "CREATE DATABASE lsvn CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# 4. Chạy migration (tạo bảng + dữ liệu mẫu)
npm run migrate

# 5. Khởi động server
npm run dev
```

## Biến môi trường

Tạo file `.env` từ `.env.example`:

| Biến | Mô tả | Mặc định |
|------|-------|----------|
| `PORT` | Cổng server | `3000` |
| `DB_HOST` | Host MySQL | `127.0.0.1` |
| `DB_PORT` | Cổng MySQL | `3306` |
| `DB_USER` | Username MySQL | `root` |
| `DB_PASSWORD` | Password MySQL | _(trống)_ |
| `DB_NAME` | Tên database | `lsvn` |
| `JWT_SECRET` | Secret key JWT | _(bắt buộc)_ |
| `JWT_EXPIRES_IN` | Thời hạn token | `8h` |
| `CORS_ORIGIN` | Origin cho CORS | `http://localhost:5173` |

## Tài khoản mặc định

Sau khi chạy migration, có sẵn 1 tài khoản **super_admin**:

| Field | Giá trị |
|-------|---------|
| Email | `admin@lsvn.vn` |
| Mật khẩu | `Admin@123` |

> **Lưu ý:** Đổi mật khẩu ngay sau khi deploy lên production.

## Scripts

```bash
npm run dev      # Chạy dev với nodemon (auto-reload)
npm start        # Chạy production
npm run migrate  # Chạy migration
```

## API

Base URL: `http://localhost:3000/api`

Swagger docs: `http://localhost:3000/api/docs`

### Public endpoints

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/articles` | Danh sách bài viết (filter: type, dynasty_id, category_id, is_featured, year_from, year_to, q) |
| GET | `/articles/:slug` | Chi tiết bài viết (kèm media, persons, places, sources, related) |
| GET | `/dynasties` | Danh sách triều đại |
| GET | `/dynasties/:slug` | Chi tiết triều đại |
| GET | `/categories` | Danh sách danh mục (filter: type) |
| POST | `/reports` | Gửi báo cáo lỗi nội dung |

### Admin endpoints (yêu cầu JWT)

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| POST | `/auth/login` | Đăng nhập |
| POST | `/auth/logout` | Đăng xuất |
| GET | `/auth/me` | Thông tin admin hiện tại |
| GET | `/admin/dashboard` | Thống kê tổng quan |
| GET | `/admin/articles` | Danh sách bài (mọi trạng thái) |
| POST | `/admin/articles` | Tạo bài mới (status: draft) |
| PUT | `/admin/articles/:id` | Cập nhật bài (chỉ draft/rejected) |
| PATCH | `/admin/articles/:id/submit` | Gửi duyệt (draft → pending) |
| PATCH | `/admin/articles/:id/publish` | Xuất bản (pending → published) |
| PATCH | `/admin/articles/:id/reject` | Từ chối (pending → rejected) |
| DELETE | `/admin/articles/:id` | Xoá bài viết |
| GET | `/admin/reports` | Danh sách báo cáo |
| PATCH | `/admin/reports/:id/assign` | Phân công xử lý |
| PATCH | `/admin/reports/:id/resolve` | Đánh dấu đã xử lý |
| PATCH | `/admin/reports/:id/reject` | Từ chối báo cáo |

### Quy trình duyệt bài

```
draft → (submit) → pending → (publish) → published
                           → (reject)  → rejected → (update) → draft
```

### Ví dụ query

```bash
# Nhân vật nổi bật (trang chủ)
GET /api/articles?type=person&is_featured=true

# Sự kiện theo triều đại
GET /api/articles?type=event&dynasty_id=<id>

# Dòng thời gian (lọc theo khoảng năm, âm = TCN)
GET /api/articles?type=event&year_from=-2879&year_to=938

# Video theo danh mục
GET /api/articles?type=video&category_id=<id>

# Tìm kiếm full-text
GET /api/articles?q=Bạch+Đằng
```

## Media

- **Hình ảnh**: lưu URL Cloudinary vào `media.url`
- **Video**: lưu URL YouTube vào `media.url`, thumbnail vào `media.thumbnail_url`

## Cấu trúc thư mục

```
src/
├── app.js               # Entry point
├── config/
│   ├── database.js      # MySQL connection pool
│   └── swagger.js       # Swagger/OpenAPI config
├── controllers/         # Business logic
├── middlewares/         # Auth, error handling
└── routes/              # API routes + Swagger JSDoc
migrations/
├── runner.js            # Migration runner
├── 001_initial_schema.sql
└── 002_seed_data.sql    # Dữ liệu mẫu
```
