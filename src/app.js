require("dotenv").config();
const express = require("express");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./config/swagger");
const routes = require("./routes");
const { notFound, errorHandler } = require("./middlewares/error.middleware");

const app = express();
const PORT = process.env.PORT || 3000;

// ── Middleware ────────────────────────────────────────────────
app.use(cors({ origin: process.env.CORS_ORIGIN || "http://localhost:5173" }));
app.use(express.json());

// ── Swagger UI ────────────────────────────────────────────────
app.use(
  "/api/docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    customSiteTitle: "VN History API Docs",
    swaggerOptions: { persistAuthorization: true },
  })
);

// ── API Routes ────────────────────────────────────────────────
app.use("/api", routes);

// ── Health check ──────────────────────────────────────────────
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ── Error handling ────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`VN History API  →  http://localhost:${PORT}/api`);
  console.log(`Swagger Docs    →  http://localhost:${PORT}/api/docs`);
});
