#!/usr/bin/env node

/**
 * Production launch gate for VantaAPI.
 * It checks only safe metadata and environment variable shape; it never prints secret values.
 */

// eslint-disable-next-line @typescript-eslint/no-require-imports
const fs = require("fs");
// eslint-disable-next-line @typescript-eslint/no-require-imports
const path = require("path");
// eslint-disable-next-line @typescript-eslint/no-require-imports
const dotenv = require("dotenv");

const root = process.cwd();
let pass = 0;
let warn = 0;
let fail = 0;

function read(file) {
  try {
    return fs.readFileSync(path.join(root, file), "utf8");
  } catch {
    return "";
  }
}

function ok(name, message = "") {
  pass += 1;
  console.log(`✅ ${name}${message ? `: ${message}` : ""}`);
}

function caution(name, message) {
  warn += 1;
  console.log(`⚠️ ${name}: ${message}`);
}

function bad(name, message) {
  fail += 1;
  console.log(`❌ ${name}: ${message}`);
}

function loadEnvFile(file) {
  const full = path.join(root, file);
  if (!fs.existsSync(full)) return {};
  return dotenv.parse(fs.readFileSync(full, "utf8"));
}

const env = {
  ...loadEnvFile(".env"),
  ...loadEnvFile(".env.production"),
  ...process.env,
};

function envValue(name) {
  return String(env[name] || "").trim();
}

function looksPlaceholder(value) {
  return !value || /replace|generate|change-me|example|password|secret|your-|<.*>/i.test(value);
}

function checkSecret(name, options = {}) {
  const value = envValue(name);
  const min = options.min || 32;
  if (looksPlaceholder(value)) return bad(`env:${name}`, "missing or still a placeholder");
  if (value.length < min) return bad(`env:${name}`, `must be at least ${min} characters`);
  if (options.hex && !/^[a-f0-9]+$/i.test(value)) return bad(`env:${name}`, "must be hex encoded");
  ok(`env:${name}`, "configured with production-shaped value");
}

function checkDatabasePassword() {
  const value = envValue("DATABASE_URL");
  if (looksPlaceholder(value)) return bad("env:DATABASE_URL", "missing or still a placeholder");
  try {
    const parsed = new URL(value);
    if (!["postgres:", "postgresql:"].includes(parsed.protocol)) {
      return bad("env:DATABASE_URL", "must be a valid postgres/postgresql URL");
    }
    if (["127.0.0.1", "localhost"].includes(parsed.hostname)) {
      return bad("env:DATABASE_URL", "must use a reachable production database host");
    }
    const password = decodeURIComponent(parsed.password || "");
    if (looksPlaceholder(password) || password.length < 16) {
      return bad("env:DATABASE_URL", "database password must be strong and not a placeholder");
    }
    if (["root", "admin"].includes(parsed.username.toLowerCase())) {
      return caution("env:DATABASE_URL", "avoid root/admin DB users in production if possible");
    }
    ok("env:DATABASE_URL", "database password is present and non-placeholder");
  } catch {
    bad("env:DATABASE_URL", "must be a valid postgres/postgresql URL");
  }
}

function includesAny(file, patterns) {
  const body = read(file);
  return patterns.some((pattern) => pattern.test(body));
}

console.log("🚀 VantaAPI prelaunch gate\n");

checkSecret("JWT_SECRET", { min: 32 });
checkSecret("CSRF_SECRET", { min: 64, hex: true });
checkSecret("ENCRYPTION_KEY", { min: 64, hex: true });
checkDatabasePassword();

if (envValue("ADMIN_2FA_REQUIRED") === "false") bad("env:ADMIN_2FA_REQUIRED", "must not be false before launch");
else ok("env:ADMIN_2FA_REQUIRED", "2FA enforcement is enabled or using secure default");

if (envValue("ENABLE_CPP_RUNNER") === "true") bad("env:ENABLE_CPP_RUNNER", "online C++ execution must remain disabled");
else ok("env:ENABLE_CPP_RUNNER", "C++ runner is disabled or not explicitly enabled");

if (includesAny("lib/cpp-runner.ts", [/ENABLE_CPP_RUNNER !== "true"/]) && includesAny(".env.example", [/ENABLE_CPP_RUNNER="false"/])) {
  ok("cpp-runner:default-off", "code and env example keep runner opt-in/off");
} else {
  bad("cpp-runner:default-off", "runner default-off guard is missing");
}

const publicBrandResidue = [];
for (const base of ["app", "components", "lib"]) {
  const dir = path.join(root, base);
  if (!fs.existsSync(dir)) continue;
  const stack = [dir];
  while (stack.length) {
    const current = stack.pop();
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) stack.push(full);
      else if (/\.(ts|tsx|css|md)$/.test(entry.name)) {
        const body = fs.readFileSync(full, "utf8");
        if (/JinMing|JinMing Lab|\bJM\b|immortal/.test(body)) {
          publicBrandResidue.push(path.relative(root, full));
        }
      }
    }
  }
}

if (publicBrandResidue.length) {
  bad("brand:public-residue", `cleanup needed in ${Array.from(new Set(publicBrandResidue)).slice(0, 12).join(", ")}`);
} else {
  ok("brand:public-residue", "no JinMing/JM/immortal residue in app, components, or lib");
}

console.log(`\nSummary: pass=${pass} warn=${warn} fail=${fail}`);
if (fail > 0) process.exit(1);
