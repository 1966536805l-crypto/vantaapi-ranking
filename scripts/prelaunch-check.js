#!/usr/bin/env node

/**
 * Production launch gate for VantaAPI.
 * Checks server configuration without printing secret values.
 */

// eslint-disable-next-line @typescript-eslint/no-require-imports
const fs = require("fs");
// eslint-disable-next-line @typescript-eslint/no-require-imports
const path = require("path");
// eslint-disable-next-line @typescript-eslint/no-require-imports
const dotenv = require("dotenv");
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { PrismaClient, UserRole } = require("@prisma/client");

const root = process.cwd();
let pass = 0;
let warn = 0;
let fail = 0;
let databaseUrlLooksProductionReady = false;

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
  return !value || /replace|generate|change-me|example|password|secret|your-|<.*>|xxx|todo/i.test(value);
}

function checkSecret(name, options = {}) {
  const value = envValue(name);
  const min = options.min || 32;
  if (looksPlaceholder(value)) return bad(`env:${name}`, "missing or still a placeholder");
  if (value.length < min) return bad(`env:${name}`, `must be at least ${min} characters`);
  if (options.hex && !/^[a-f0-9]+$/i.test(value)) return bad(`env:${name}`, "must be hex encoded");
  ok(`env:${name}`, "configured with production-shaped value");
}

function checkToken(name, options = {}) {
  const value = envValue(name);
  const min = options.min || 20;
  if (looksPlaceholder(value)) return bad(`env:${name}`, "missing or still a placeholder");
  if (value.length < min) return bad(`env:${name}`, `looks too short; expected at least ${min} characters`);
  if (/\s/.test(value)) return bad(`env:${name}`, "must not contain whitespace");
  if (options.prefixes && !options.prefixes.some((prefix) => value.startsWith(prefix))) {
    return caution(`env:${name}`, `token does not use a common prefix (${options.prefixes.join(", ")}); verify provider value manually`);
  }
  ok(`env:${name}`, "configured; value hidden");
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
      caution("env:DATABASE_URL", "avoid root/admin DB users in production if possible");
    }
    databaseUrlLooksProductionReady = true;
    ok("env:DATABASE_URL", "database password is present and non-placeholder");
  } catch {
    bad("env:DATABASE_URL", "must be a valid postgres/postgresql URL");
  }
}

function includesAny(file, patterns) {
  const body = read(file);
  return patterns.some((pattern) => pattern.test(body));
}

function checkAiProviderConfig() {
  checkToken("AI_API_KEY", { min: 24 });

  const baseUrl = envValue("AI_BASE_URL") || "https://api.deepseek.com/v1";
  try {
    const parsed = new URL(baseUrl);
    if (!["https:", "http:"].includes(parsed.protocol)) {
      bad("env:AI_BASE_URL", "must be an HTTP(S) URL");
    } else if (parsed.protocol !== "https:" && !["127.0.0.1", "localhost"].includes(parsed.hostname)) {
      bad("env:AI_BASE_URL", "must use HTTPS unless it is a local development endpoint");
    } else {
      ok("env:AI_BASE_URL", "configured or using secure default");
    }
  } catch {
    bad("env:AI_BASE_URL", "must be a valid URL when set");
  }

  if (envValue("OLLAMA_ENABLED") === "true") {
    const ollamaUrl = envValue("OLLAMA_BASE_URL") || "http://127.0.0.1:11434";
    try {
      const parsed = new URL(ollamaUrl);
      if (["127.0.0.1", "localhost"].includes(parsed.hostname)) {
        caution("env:OLLAMA_BASE_URL", "local Ollama works only when the app server runs beside Ollama; Vercel cannot reach your laptop");
      } else if (parsed.protocol !== "https:") {
        bad("env:OLLAMA_BASE_URL", "remote Ollama endpoints must use HTTPS and server-side auth");
      } else if (!envValue("OLLAMA_API_KEY")) {
        bad("env:OLLAMA_API_KEY", "remote Ollama endpoints need a server-side auth token");
      } else {
        ok("env:OLLAMA_BASE_URL", "remote fallback is protected");
      }
    } catch {
      bad("env:OLLAMA_BASE_URL", "must be a valid URL when Ollama is enabled");
    }
  } else {
    ok("env:OLLAMA_ENABLED", "disabled unless deliberately deployed beside the app");
  }
}

function checkGitHubToken() {
  checkToken("GITHUB_READ_TOKEN", { min: 24, prefixes: ["github_pat_", "ghp_"] });
}

async function checkAdmin2FAState() {
  if (!databaseUrlLooksProductionReady) {
    bad("db:admin-2fa", "skipped because DATABASE_URL is not production-ready");
    return;
  }

  const prisma = new PrismaClient({ datasources: { db: { url: envValue("DATABASE_URL") } } });
  try {
    const admins = await prisma.user.findMany({
      where: { role: UserRole.ADMIN },
      select: { email: true, twoFactorEnabled: true, twoFactorConfirmedAt: true },
    });

    if (admins.length === 0) {
      bad("db:admin-2fa", "no ADMIN user exists; create one before launch");
      return;
    }

    const unprotected = admins.filter((admin) => !admin.twoFactorEnabled || !admin.twoFactorConfirmedAt);
    if (unprotected.length > 0) {
      bad("db:admin-2fa", `${unprotected.length}/${admins.length} admin account(s) have not completed 2FA`);
      return;
    }

    ok("db:admin-2fa", `${admins.length} admin account(s) have completed 2FA`);
  } catch (error) {
    bad("db:admin-2fa", error instanceof Error ? `database check failed: ${error.message}` : "database check failed");
  } finally {
    await prisma.$disconnect().catch(() => undefined);
  }
}

function checkBrandResidue() {
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
          if (/JinMing|\bJM\b|Immortal|immortal/.test(body)) {
            publicBrandResidue.push(path.relative(root, full));
          }
        }
      }
    }
  }

  if (publicBrandResidue.length) {
    bad("brand:public-residue", `cleanup needed in ${Array.from(new Set(publicBrandResidue)).slice(0, 12).join(", ")}`);
  } else {
    ok("brand:public-residue", "no JinMing/JM/Immortal residue in app, components, or lib");
  }
}

async function main() {
  console.log("🚀 VantaAPI prelaunch gate\n");

  checkSecret("JWT_SECRET", { min: 32 });
  checkSecret("CSRF_SECRET", { min: 64, hex: true });
  checkSecret("ENCRYPTION_KEY", { min: 64, hex: true });
  checkDatabasePassword();

  if (envValue("ADMIN_2FA_REQUIRED") === "false") bad("env:ADMIN_2FA_REQUIRED", "must not be false before launch");
  else ok("env:ADMIN_2FA_REQUIRED", "2FA enforcement is enabled or using secure default");

  await checkAdmin2FAState();
  checkAiProviderConfig();
  checkGitHubToken();

  if (envValue("ENABLE_CPP_RUNNER") === "true") bad("env:ENABLE_CPP_RUNNER", "online C++ execution must remain disabled");
  else ok("env:ENABLE_CPP_RUNNER", "C++ runner is disabled or not explicitly enabled");

  if (includesAny("lib/cpp-runner.ts", [/ENABLE_CPP_RUNNER !== "true"/]) && includesAny(".env.example", [/ENABLE_CPP_RUNNER="false"/])) {
    ok("cpp-runner:default-off", "code and env example keep runner opt-in/off");
  } else {
    bad("cpp-runner:default-off", "runner default-off guard is missing");
  }

  checkBrandResidue();

  console.log(`\nSummary: pass=${pass} warn=${warn} fail=${fail}`);
  if (fail > 0) process.exit(1);
}

main().catch((error) => {
  bad("launch:check", error instanceof Error ? error.message : "unknown failure");
  console.log(`\nSummary: pass=${pass} warn=${warn} fail=${fail}`);
  process.exit(1);
});
