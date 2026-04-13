const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "VN History API",
      version: "1.1.0",
      description:
        "API cho nền tảng Bách Khoa Lịch Sử Việt Nam.\n\n" +
        "**Xác thực:** Các endpoint admin yêu cầu header `Authorization: Bearer <token>`.\n\n" +
        "**Workflow bài viết:** `draft` → `pending` → `published` hoặc `rejected`.\n\n" +
        "**Phân quyền:** `super_admin` toàn quyền | `admin` viết/xuất bản/báo cáo.\n\n" +
        "**Tài khoản mặc định:** `admin@lsvn.vn` / `Admin@123`",
    },
    servers: [{ url: "/api", description: "API v1" }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        // ── Bài viết ──────────────────────────────────────────
        Article: {
          type: "object",
          properties: {
            id:             { type: "string", format: "uuid" },
            title:          { type: "string" },
            subtitle:       { type: "string", nullable: true },
            slug:           { type: "string" },
            summary:        { type: "string" },
            content:        { type: "string", description: "Markdown" },
            quote:          { type: "string", nullable: true },
            type:           { type: "string", enum: ["event", "person", "place", "video", "culture"] },
            status:         { type: "string", enum: ["draft", "pending", "published", "rejected"] },
            year_start:     { type: "integer", nullable: true },
            year_end:       { type: "integer", nullable: true },
            year_display:   { type: "string", nullable: true },
            dynasty_id:     { type: "string", nullable: true },
            category_id:    { type: "string", nullable: true },
            is_featured:    { type: "boolean" },
            allow_comments: { type: "boolean" },
            rejection_note: { type: "string", nullable: true },
            published_at:   { type: "string", format: "date-time", nullable: true },
            created_at:     { type: "string", format: "date-time" },
            updated_at:     { type: "string", format: "date-time" },
          },
        },
        // ── Triều đại ─────────────────────────────────────────
        Dynasty: {
          type: "object",
          properties: {
            id:           { type: "string", format: "uuid" },
            name:         { type: "string" },
            slug:         { type: "string" },
            year_start:   { type: "integer", description: "Âm = TCN, vd: -2879" },
            year_end:     { type: "integer", nullable: true },
            year_display: { type: "string", example: "2879 TCN – 207 TCN" },
            description:  { type: "string", nullable: true },
            sort_order:   { type: "integer" },
          },
        },
        // ── Danh mục ──────────────────────────────────────────
        Category: {
          type: "object",
          properties: {
            id:           { type: "string", format: "uuid" },
            name:         { type: "string" },
            slug:         { type: "string" },
            article_type: {
              type: "string",
              enum: ["event", "person", "place", "video", "culture"],
              nullable: true,
            },
            sort_order:   { type: "integer" },
          },
        },
        // ── Báo cáo ───────────────────────────────────────────
        Report: {
          type: "object",
          properties: {
            id:             { type: "string", format: "uuid" },
            report_code:    { type: "string", example: "BC-2026-0001" },
            article_id:     { type: "string", format: "uuid" },
            error_type:     { type: "string" },
            severity:       { type: "string", enum: ["low", "medium", "high"] },
            description:    { type: "string" },
            quoted_text:    { type: "string", nullable: true },
            reporter_email: { type: "string", nullable: true },
            status:         { type: "string", enum: ["new", "reviewing", "resolved", "rejected"] },
            admin_note:     { type: "string", nullable: true },
            created_at:     { type: "string", format: "date-time" },
          },
        },
        // ── Admin user ────────────────────────────────────────
        AdminUser: {
          type: "object",
          properties: {
            id:                    { type: "string", format: "uuid" },
            full_name:             { type: "string" },
            email:                 { type: "string", format: "email" },
            role:                  { type: "string", enum: ["super_admin", "admin"] },
            is_active:             { type: "integer", enum: [0, 1] },
            avatar_url:            { type: "string", nullable: true },
            last_login_at:         { type: "string", format: "date-time", nullable: true },
            article_count:         { type: "integer" },
            resolved_report_count: { type: "integer" },
            created_at:            { type: "string", format: "date-time" },
          },
        },
        // ── Activity log ──────────────────────────────────────
        ActivityLog: {
          type: "object",
          properties: {
            id:           { type: "integer" },
            action:       { type: "string", example: "publish_article" },
            target_type:  { type: "string", example: "article" },
            target_id:    { type: "string", nullable: true },
            target_title: { type: "string", nullable: true },
            detail:       { type: "string", nullable: true },
            ip_address:   { type: "string", nullable: true },
            admin_name:   { type: "string" },
            admin_email:  { type: "string" },
            admin_role:   { type: "string" },
            created_at:   { type: "string", format: "date-time" },
          },
        },
        // ── Setting ───────────────────────────────────────────
        Setting: {
          type: "object",
          properties: {
            key:         { type: "string", example: "site_name" },
            value:       { type: "string" },
            description: { type: "string", nullable: true },
            updated_at:  { type: "string", format: "date-time" },
          },
        },
        // ── Timeline ──────────────────────────────────────────
        TimelinePeriod: {
          type: "object",
          properties: {
            id:           { type: "string", format: "uuid" },
            name:         { type: "string" },
            slug:         { type: "string" },
            year_start:   { type: "integer" },
            year_end:     { type: "integer", nullable: true },
            year_display: { type: "string" },
            description:  { type: "string", nullable: true },
            sort_order:   { type: "integer" },
            event_count:  { type: "integer" },
            events: {
              type: "array",
              items: { $ref: "#/components/schemas/TimelineEvent" },
            },
          },
        },
        TimelineEvent: {
          type: "object",
          properties: {
            id:            { type: "string", format: "uuid" },
            dynasty_id:    { type: "string", format: "uuid" },
            article_id:    { type: "string", format: "uuid" },
            note:          { type: "string", nullable: true },
            sort_order:    { type: "integer" },
            title:         { type: "string" },
            slug:          { type: "string" },
            type:          { type: "string" },
            status:        { type: "string" },
            article_year:  { type: "integer", nullable: true },
            year_display:  { type: "string", nullable: true },
            category_name: { type: "string", nullable: true },
            created_at:    { type: "string", format: "date-time" },
          },
        },
        // ── Phân quyền ────────────────────────────────────────
        RoleDefinition: {
          type: "object",
          properties: {
            role:        { type: "string", enum: ["super_admin", "admin"] },
            label:       { type: "string" },
            description: { type: "string" },
            permissions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  key:     { type: "string", example: "article.publish" },
                  label:   { type: "string" },
                  granted: { type: "boolean" },
                },
              },
            },
          },
        },
        // ── Pagination ────────────────────────────────────────
        Pagination: {
          type: "object",
          properties: {
            total:       { type: "integer" },
            page:        { type: "integer" },
            limit:       { type: "integer" },
            total_pages: { type: "integer" },
          },
        },
        // ── Error ─────────────────────────────────────────────
        Error: {
          type: "object",
          properties: {
            message: { type: "string" },
          },
        },
      },
    },
    tags: [
      { name: "Auth",     description: "Đăng nhập / đăng xuất admin" },
      { name: "Articles", description: "Bài viết lịch sử (public + admin)" },
      { name: "Dynasties",description: "Triều đại" },
      { name: "Categories",description: "Danh mục bài viết" },
      { name: "Reports",  description: "Báo cáo lỗi nội dung" },
      { name: "Timeline", description: "Timeline lịch sử theo triều đại" },
      { name: "Admins",   description: "Quản lý tài khoản admin (super_admin only)" },
      { name: "Logs",     description: "Nhật ký hoạt động hệ thống" },
      { name: "Settings",    description: "Cài đặt hệ thống (super_admin only)" },
      { name: "Permissions", description: "Phân quyền theo role" },
    ],
  },
  apis: ["./src/routes/*.js"],
};

module.exports = swaggerJsdoc(options);
