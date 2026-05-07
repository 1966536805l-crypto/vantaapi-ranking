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
  [".github/workflows/security.yml", ["npm run security:check", "npm run build"]],
  [".github/workflows/codeql.yml", ["github/codeql-action/init", "security-extended"]],
  [".github/workflows/secret-scan.yml", ["gitleaks/gitleaks-action"]],
  [".github/workflows/npm-audit.yml", ["npm audit --audit-level=high"]],
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

const ignore = read(".gitignore") + "\n" + read(".vercelignore");
const ignoreMarkers = [".env", "*.db", "node_modules", ".next"];
const missingIgnores = ignoreMarkers.filter((marker) => !ignore.includes(marker));
if (missingIgnores.length) fail("ignore-sensitive", `missing ignore markers: ${missingIgnores.join(", ")}`);
else pass("ignore-sensitive", "local secrets, DB files, build artifacts are ignored");

const suspiciousFiles = [".env", "prisma/dev.db", "dev.db", ".vercel/project.json"].filter((file) => {
  try {
    require("child_process").execFileSync("git", ["ls-files", "--error-unmatch", file], { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
});
if (suspiciousFiles.length) fail("tracked-local-sensitive", `tracked local-sensitive files: ${suspiciousFiles.join(", ")}`);
else pass("tracked-local-sensitive", "no known local secret/database files are tracked");

if (has("package.json", "security:full") && has("package.json", "security:repo")) {
  pass("package-scripts", "full and repo security scripts are available");
} else {
  warn("package-scripts", "security:repo/security:full script wiring should be reviewed");
}

const icons = { pass: "✅", warn: "⚠️", fail: "❌" };
for (const check of checks) console.log(`${icons[check.level]} ${check.name}: ${check.message}`);
const summary = checks.reduce((acc, check) => {
  acc[check.level] = (acc[check.level] || 0) + 1;
  return acc;
}, {});
console.log("\nSummary:", `pass=${summary.pass || 0}`, `warn=${summary.warn || 0}`, `fail=${summary.fail || 0}`);
if (summary.fail) process.exitCode = 1;
