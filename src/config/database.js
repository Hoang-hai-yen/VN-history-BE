const mysql = require("mysql2/promise");

const isLocal = (process.env.DB_HOST || "127.0.0.1") === "127.0.0.1";

const pool = mysql.createPool({
  host: process.env.DB_HOST || "127.0.0.1",
  port: parseInt(process.env.DB_PORT || "3306"),
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "lsvn",
  waitForConnections: true,
  connectionLimit: 10,
  charset: "utf8mb4",
  ...(isLocal ? {} : { ssl: { rejectUnauthorized: true } }),
});

module.exports = pool;
