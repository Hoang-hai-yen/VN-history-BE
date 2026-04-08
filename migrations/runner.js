/**
 * Migration runner
 * Run: npm run migrate
 *
 * - Creates `_migrations` table to track applied migrations
 * - Reads all *.sql files in this directory, sorted by name
 * - Skips already-applied migrations
 */

require("dotenv").config();
const fs = require("fs");
const path = require("path");
const mysql = require("mysql2/promise");

const MIGRATIONS_DIR = __dirname;

/**
 * Split SQL file content into individual statements,
 * handling DELIMITER changes (used for triggers/procedures).
 */
function splitSql(content) {
  const statements = [];
  let delimiter = ";";
  let current = "";

  for (const line of content.split("\n")) {
    const trimmedLine = line.trim();

    // Handle DELIMITER command (MySQL CLI syntax, not real SQL)
    const m = trimmedLine.match(/^DELIMITER\s+(\S+)\s*$/i);
    if (m) {
      if (current.trim()) {
        statements.push(current.trim());
        current = "";
      }
      delimiter = m[1];
      continue;
    }

    current += line + "\n";

    // Check if buffer ends with the current delimiter
    const trimmedCurrent = current.trimEnd();
    if (trimmedCurrent.endsWith(delimiter)) {
      const stmt = trimmedCurrent.slice(0, trimmedCurrent.length - delimiter.length).trim();
      if (stmt) statements.push(stmt);
      current = "";
    }
  }

  if (current.trim()) statements.push(current.trim());

  return statements.filter(Boolean);
}

async function run() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || "127.0.0.1",
    port: parseInt(process.env.DB_PORT || "3306"),
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "lsvn",
    charset: "utf8mb4",
  });

  try {
    // Create migrations tracking table
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS _migrations (
        id        INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        name      VARCHAR(255) NOT NULL UNIQUE,
        applied_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // Get already-applied migrations
    const [rows] = await conn.execute("SELECT name FROM _migrations");
    const applied = new Set(rows.map((r) => r.name));

    // Find pending SQL files
    const files = fs
      .readdirSync(MIGRATIONS_DIR)
      .filter((f) => f.endsWith(".sql"))
      .sort();

    if (files.length === 0) {
      console.log("No migration files found.");
      return;
    }

    let ran = 0;
    for (const file of files) {
      if (applied.has(file)) {
        console.log(`  skip  ${file}`);
        continue;
      }

      const content = fs.readFileSync(path.join(MIGRATIONS_DIR, file), "utf8");
      const statements = splitSql(content);
      console.log(`  run   ${file} (${statements.length} statements) ...`);

      for (const stmt of statements) {
        await conn.query(stmt);
      }

      await conn.execute("INSERT INTO _migrations (name) VALUES (?)", [file]);
      console.log(`  done  ${file}`);
      ran++;
    }

    console.log(`\nMigrations complete. ${ran} applied, ${applied.size} already up-to-date.`);
  } finally {
    await conn.end();
  }
}

run().catch((err) => {
  console.error("Migration failed:", err.message);
  process.exit(1);
});
