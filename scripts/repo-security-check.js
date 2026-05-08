#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("fs");
const path = require("path");

const checks = [];
function read(file) {
  try {
    return fs.readFileSync(file, "utf8");
  } catch {
    return "";
  }
}
function exists(file) {
  return fs.existsSync(file);
}
function pass(name, message) {
  checks.push({ level: "pass", name, message });
}
function fail(name, message) {
  checks.push({ level: "fail", name, message });
}
function warn(name, message) {
  checks.push({ level: "warn", name, message });
}
function has(file, pattern) {
  const text = read(file);
  return typeof pattern === "string" ? text.includes(pattern) : pattern.test(text);
}

console.log("🔐 repository security check\n");

const requiredWorkflows = [
  [".github/workflows/security.yml", ["DATABASE_URL: \"postgresql://", "npm run security:check", "npm run content:check", "npm run security:supply-chain", "npm run security:secrets", "npm run build", "npm run language:smoke"]],
  [".github/workflows/codeql.yml", ["github/codeql-action/init", "security-extended"]],
  [".github/workflows/secret-scan.yml", ["gitleaks/gitleaks-action"]],
  [".github/workflows/npm-audit.yml", ["npm audit --audit-level=high", "npm ci --ignore-scripts"]],
];

for (const [file, markers] of requiredWorkflows) {
  if (!exists(file)) {
    fail(`workflow:${path.basename(file)}`, "missing");
    continue;
  }
  const missing = markers.filter((marker) => !has(file, marker));
  if (missing.length) fail(`workflow:${path.basename(file)}`, `missing markers: ${missing.join(", ")}`);
  else pass(`workflow:${path.basename(file)}`, "present and contains expected security gates");
}

if (has(".github/dependabot.yml", "package-ecosystem: npm") && has(".github/dependabot.yml", "package-ecosystem: github-actions")) {
  pass("dependabot", "npm and GitHub Actions updates enabled");
} else {
  fail("dependabot", "npm/GitHub Actions update config missing");
}

if (has("SECURITY.md", "Reporting a vulnerability") && has("SECURITY.md", "DDoS") && has("SECURITY.md", "Admin 2FA")) {
  pass("security-policy", "security reporting and baseline are documented");
} else {
  fail("security-policy", "SECURITY.md is incomplete");
}

if (has("docs/EDGE_SECURITY.md", "DDoS protection") && has("docs/EDGE_SECURITY.md", "Origin isolation")) {
  pass("edge-security-doc", "edge DDoS/WAF baseline documented");
} else {
  fail("edge-security-doc", "edge DDoS/WAF baseline missing");
}

if (has("docs/SUPPLY_CHAIN_SECURITY.md", "Supply Chain Security") && has("scripts/supply-chain-check.js", "dependency-specs") && has("scripts/secret-pattern-check.js", "secret pattern check")) {
  pass("supply-chain-doc", "supply-chain and local secret checks are documented");
} else {
  fail("supply-chain-doc", "supply-chain baseline is incomplete");
}

const databaseDocs = [
  "SECURITY.md",
  "DEPLOYMENT.md",
  "docs/security/ENTERPRISE_SECURITY_REPORT.md",
  "docs/security/SECURITY_HARDENING_RESPONSE.md",
  "docs/security/EASY_SECURITY_MODE.md",
  "docs/security/NETWORK_SECURITY_REPORT.md",
];
const legacyDatabaseMentions = databaseDocs
  .map((file) => [file, read(file)])
  .filter(([, body]) => /\b(?:MySQL|MariaDB|3306)\b/i.test(body))
  .map(([file]) => file);
if (legacyDatabaseMentions.length) {
  fail("docs:database-stack", `legacy MySQL/MariaDB or 3306 mentions remain: ${legacyDatabaseMentions.join(", ")}`);
} else {
  pass("docs:database-stack", "current security and deployment docs use Postgres wording");
}

const ignore = read(".gitignore") + "\n" + read(".vercelignore");
const ignoreMarkers = [".env", "*.db", "*.sqlite", "node_modules", ".next"];
const missingIgnores = ignoreMarkers.filter((marker) => !ignore.includes(marker));
if (missingIgnores.length) fail("ignore-sensitive", `missing ignore markers: ${missingIgnores.join(", ")}`);
else pass("ignore-sensitive", "local secrets, DB files, build artifacts are ignored");

const suspiciousFiles = [".env", "prisma/dev.db", "dev.db", "prisma/dev.sqlite", "dev.sqlite", ".vercel/project.json"].filter((file) => {
  try {
    require("child_process").execFileSync("git", ["ls-files", "--error-unmatch", file], { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
});
if (suspiciousFiles.length) fail("tracked-local-sensitive", `tracked local-sensitive files: ${suspiciousFiles.join(", ")}`);
else pass("tracked-local-sensitive", "no known local secret/database files are tracked");

const localDatabaseFiles = ["dev.db", "prisma/dev.db", "dev.sqlite", "prisma/dev.sqlite"].filter((file) => exists(file));
if (localDatabaseFiles.length) fail("local-dev-db-present", `remove local DB files before release packaging: ${localDatabaseFiles.join(", ")}`);
else pass("local-dev-db-present", "no legacy local dev database file is present");

if (has("package.json", "security:full") && has("package.json", "security:repo") && has("package.json", "security:supply-chain") && has("package.json", "security:secrets") && has("package.json", "content:check") && has("package.json", "npm run content:check")) {
  pass("package-scripts", "full, repo, content, supply-chain, and secret security scripts are available");
} else {
  warn("package-scripts", "security script wiring should be reviewed");
}

const icons = { pass: "✅", warn: "⚠️", fail: "❌" };
for (const check of checks) console.log(`${icons[check.level]} ${check.name}: ${check.message}`);
const summary = checks.reduce((acc, check) => {
  acc[check.level] = (acc[check.level] || 0) + 1;
  return acc;
}, {});
console.log("\nSummary:", `pass=${summary.pass || 0}`, `warn=${summary.warn || 0}`, `fail=${summary.fail || 0}`);
if (summary.fail) process.exitCode = 1;
