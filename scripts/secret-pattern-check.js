#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports */
const { execFileSync, execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

// Check if .git directory exists
let tracked;
try {
  if (fs.existsSync(path.join(process.cwd(), ".git"))) {
    // Use git ls-files if in a git repository
    tracked = execFileSync("git", ["ls-files"], { encoding: "utf8" })
      .split("\n")
      .filter(Boolean);
  } else {
    // Fallback to find command if not in a git repository
    const findOutput = execSync(
      'find . -type f ! -path "*/node_modules/*" ! -path "*/.next/*" ! -path "*/.git/*" ! -path "*/.vercel/*"',
      { encoding: "utf8", cwd: process.cwd() }
    );
    tracked = findOutput
      .split("\n")
      .filter(Boolean)
      .map((file) => file.replace(/^\.\//, "")); // Remove leading ./
  }
} catch (error) {
  console.error("❌ Failed to list files:", error.message);
  process.exit(1);
}

tracked = tracked
  .filter((file) => !file.startsWith("package-lock.json"))
  .filter((file) => !file.endsWith(".png") && !file.endsWith(".jpg") && !file.endsWith(".jpeg") && !file.endsWith(".gif") && !file.endsWith(".ico"));

const patterns = [
  { name: "private-key", regex: /-----BEGIN (?:RSA |EC |OPENSSH |DSA |)?PRIVATE KEY-----/ },
  { name: "github-token", regex: /gh[pousr]_[A-Za-z0-9_]{30,}/ },
  { name: "openai-key", regex: /sk-[A-Za-z0-9_-]{32,}/ },
  { name: "jwt-like", regex: /eyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}/ },
  { name: "aws-access-key", regex: /AKIA[0-9A-Z]{16}/ },
  { name: "hardcoded-db-url", regex: /(?:mysql|postgresql?):\/\/[^\s"'<>]+:[^\s"'<>]+@[^\s"'<>]+/i },
  { name: "hardcoded-secret-assignment", regex: /(?:JWT_SECRET|CSRF_SECRET|ENCRYPTION_KEY|API_KEY|SECRET_KEY)\s*=\s*["'][^"']{20,}["']/i },
];

const allowedFragments = [
  "replace-with",
  "replac…",
  "<strong-random-password>",
  "<generated>",
  "<generate-a-random",
  "ci-only-",
  "your-",
  "example.com",
  "127.0.0.1",
  "process.env",
  "${",
  "localhost",
  "username:password",
  "user:password",
  "generate-with-",
  "generate-64-hex",
  "generate-a-new-random",
  "你的_",
  "<db_user>",
  "<db_password>",
  "<db_host>",
  "<db_name>",
];

const findings = [];
for (const file of tracked) {
  let text;
  try {
    const stat = fs.statSync(file);
    if (stat.size > 512 * 1024) continue;
    text = fs.readFileSync(file, "utf8");
  } catch {
    continue;
  }

  const lines = text.split(/\r?\n/);
  lines.forEach((line, index) => {
    if (allowedFragments.some((fragment) => line.includes(fragment))) return;
    for (const pattern of patterns) {
      if (pattern.regex.test(line)) {
        findings.push({ file, line: index + 1, type: pattern.name });
      }
    }
  });
}

console.log("🔎 secret pattern check\n");
if (findings.length === 0) {
  console.log("✅ no obvious committed secret patterns found");
  process.exit(0);
}

for (const finding of findings) {
  console.log(`❌ ${finding.type}: ${finding.file}:${finding.line}`);
}
console.log(`\nFound ${findings.length} potential secret(s). Remove or explicitly review before pushing.`);
process.exit(1);
