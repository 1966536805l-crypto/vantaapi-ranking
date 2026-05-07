#!/usr/bin/env node

/**
 * Minimal production backup helper.
 * It never prints the database password. Run on a machine that has `mysqldump`.
 */

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { spawnSync } = require("node:child_process");
// eslint-disable-next-line @typescript-eslint/no-require-imports
const fs = require("node:fs");
// eslint-disable-next-line @typescript-eslint/no-require-imports
const path = require("node:path");
// eslint-disable-next-line @typescript-eslint/no-require-imports
const dotenv = require("dotenv");

const root = process.cwd();
const envPath = path.join(root, ".env");
if (fs.existsSync(envPath)) dotenv.config({ path: envPath });

const rawUrl = process.env.DATABASE_URL;
if (!rawUrl) {
  console.error("DATABASE_URL is missing.");
  process.exit(1);
}

let parsed;
try {
  parsed = new URL(rawUrl);
} catch {
  console.error("DATABASE_URL must be a valid mysql or mariadb URL.");
  process.exit(1);
}

if (!["mysql:", "mariadb:"].includes(parsed.protocol)) {
  console.error("Only mysql and mariadb backups are supported by this helper.");
  process.exit(1);
}

const database = parsed.pathname.replace(/^\//, "");
if (!database) {
  console.error("DATABASE_URL must include a database name.");
  process.exit(1);
}

const backupDir = process.env.BACKUP_DIR || path.join(root, "backups");
fs.mkdirSync(backupDir, { recursive: true });

const stamp = new Date().toISOString().replace(/[:.]/g, "-");
const outputFile = path.join(backupDir, `${database}-${stamp}.sql`);
const port = parsed.port || "3306";

const result = spawnSync(
  "mysqldump",
  [
    "--single-transaction",
    "--quick",
    "--set-gtid-purged=OFF",
    "-h",
    parsed.hostname,
    "-P",
    port,
    "-u",
    decodeURIComponent(parsed.username),
    `--password=${decodeURIComponent(parsed.password)}`,
    database,
  ],
  { encoding: "utf8", maxBuffer: 1024 * 1024 * 64 },
);

if (result.error) {
  console.error(`mysqldump failed to start: ${result.error.message}`);
  process.exit(1);
}

if (result.status !== 0) {
  console.error("mysqldump failed. Check database host, user permissions, and network access.");
  console.error(String(result.stderr || "").replace(/--password=\S+/g, "--password=[redacted]").slice(0, 1000));
  process.exit(result.status || 1);
}

fs.writeFileSync(outputFile, result.stdout);
console.log(`Backup written: ${outputFile}`);
