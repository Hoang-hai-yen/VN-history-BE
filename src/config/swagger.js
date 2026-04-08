const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "VN History API",
      version: "1.0.0",
      description:
        "API cho nền tảng Bách Khoa Lịch Sử Việt Nam.\n\n" +
        "**Xác thực:** Các endpoint admin yêu cầu header `Authorization: Bearer <token>`.\n\n" +
        "**Workflow bài viết:** `draft` → `pending` → `published` hoặc `rejected`.",
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
        Article: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            title: { type: "string" },
            subtitle: { type: "string", nullable: true },
            slug: { type: "string" },
            summary: { type: "string" },
            content: { type: "string", description: "Markdown" },
            quote: { type: "string", nullable: true },
            type: { type: "string", enum: ["event", "person", "place", "video", "culture"] },
            status: { type: "string", enum: ["draft", "pending", "published", "rejected"] },
            year_start: { type: "integer", nullable: true },
            year_end: { type: "integer", nullable: true },
            year_display: { type: "string", nullable: true },
            dynasty_id: { type: "string", nullable: true },
            category_id: { type: "string", nullable: true },
            is_featured: { type: "boolean" },
            allow_comments: { type: "boolean" },
            published_at: { type: "string", format: "date-time", nullable: true },
            created_at: { type: "string", format: "date-time" },
            updated_at: { type: "string", format: "date-time" },
          },
        },
        Dynasty: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            name: { type: "string" },
            slug: { type: "string" },
            year_start: { type: "integer" },
            year_end: { type: "integer", nullable: true },
            year_display: { type: "string" },
            description: { type: "string", nullable: true },
            sort_order: { type: "integer" },
          },
        },
        Category: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            name: { type: "string" },
            slug: { type: "string" },
            article_type: {
              type: "string",
              enum: ["event", "person", "place", "video", "culture"],
              nullable: true,
            },
            sort_order: { type: "integer" },
          },
        },
        Report: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            report_code: { type: "string", example: "BC-2026-0001" },
            article_id: { type: "string", format: "uuid" },
            error_type: { type: "string" },
            severity: { type: "string", enum: ["low", "medium", "high"] },
            description: { type: "string" },
            reporter_email: { type: "string", nullable: true },
            status: { type: "string", enum: ["new", "reviewing", "resolved", "rejected"] },
            created_at: { type: "string", format: "date-time" },
          },
        },
        Pagination: {
          type: "object",
          properties: {
            total: { type: "integer" },
            page: { type: "integer" },
            limit: { type: "integer" },
            total_pages: { type: "integer" },
          },
        },
        Error: {
          type: "object",
          properties: {
            message: { type: "string" },
          },
        },
      },
    },
    tags: [
      { name: "Auth", description: "Đăng nhập / đăng xuất admin" },
      { name: "Articles", description: "Bài viết lịch sử (public + admin)" },
      { name: "Dynasties", description: "Triều đại" },
      { name: "Categories", description: "Danh mục bài viết" },
      { name: "Reports", description: "Báo cáo lỗi nội dung" },
    ],
  },
  apis: ["./src/routes/*.js"],
};

module.exports = swaggerJsdoc(options);
