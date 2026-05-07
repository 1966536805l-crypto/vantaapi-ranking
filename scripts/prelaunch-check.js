#!/usr/bin/env node

/**
 * Production launch gate for JinMing Lab.
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
const loadedEnvFiles = [];
const launchActions = [];

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

function action(title, detail) {
  launchActions.push({ title, detail });
}

function loadEnvFile(file) {
  const full = path.join(root, file);
  if (!fs.existsSync(full)) return {};
  loadedEnvFiles.push(file);
  return dotenv.parse(fs.readFileSync(full, "utf8"));
}

const explicitEnvFile = process.env.PRELAUNCH_ENV_FILE;
const ignoreProcessEnv =
  Boolean(explicitEnvFile) && process.env.PRELAUNCH_IGNORE_PROCESS_ENV !== "false";
function mergeNonEmpty(target, source) {
  for (const [key, value] of Object.entries(source)) {
    if (String(value || "").trim() || !(key in target)) target[key] = value;
  }
  return target;
}

const env = {};
if (explicitEnvFile) {
  mergeNonEmpty(env, loadEnvFile(explicitEnvFile));
} else {
  mergeNonEmpty(env, loadEnvFile(".env"));
  mergeNonEmpty(env, loadEnvFile(".env.production"));
  mergeNonEmpty(env, loadEnvFile(".env.vercel.production.local"));
}
if (!ignoreProcessEnv) mergeNonEmpty(env, process.env);

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
  if (looksPlaceholder(value)) {
    bad(`env:${name}`, "missing or still a placeholder");
    action(`Set ${name}`, `Add a real provider value in Vercel Production environment variables. Keep it server-side and never commit it.`);
    return;
  }
  if (value.length < min) return bad(`env:${name}`, `looks too short; expected at least ${min} characters`);
  if (/\s/.test(value)) return bad(`env:${name}`, "must not contain whitespace");
  if (options.prefixes && !options.prefixes.some((prefix) => value.startsWith(prefix))) {
    return caution(`env:${name}`, `token does not use a common prefix (${options.prefixes.join(", ")}); verify provider value manually`);
  }
  ok(`env:${name}`, "configured; value hidden");
}

function checkRecommendedToken(name, options = {}) {
  const value = envValue(name);
  const min = options.min || 20;
  if (looksPlaceholder(value)) {
    action(`Optional: set ${name}`, "Add a GitHub fine-grained read token to raise GitHub API quota for launch audits.");
    return caution(`env:${name}`, "not configured; feature will use a fallback or lower quota");
  }
  if (value.length < min) {
    return caution(`env:${name}`, `looks short; expected at least ${min} characters`);
  }
  if (/\s/.test(value)) {
    return caution(`env:${name}`, "contains whitespace; verify provider value manually");
  }
  if (options.prefixes && !options.prefixes.some((prefix) => value.startsWith(prefix))) {
    return caution(`env:${name}`, `token does not use a common prefix (${options.prefixes.join(", ")}); verify provider value manually`);
  }
  ok(`env:${name}`, "configured; value hidden");
}

function checkDatabasePassword() {
  const value = envValue("DATABASE_URL");
  if (looksPlaceholder(value)) {
    bad("env:DATABASE_URL", "missing or still a placeholder");
    action("Set DATABASE_URL", "Use a production Postgres URL from Neon, Supabase, Vercel Postgres, or another cloud database. Do not use localhost or MySQL for this Prisma schema.");
    return;
  }
  try {
    const parsed = new URL(value);
    if (!["postgres:", "postgresql:"].includes(parsed.protocol)) {
      action("Replace DATABASE_URL", "The current DATABASE_URL is not Postgres. Create or connect a production Postgres database, then set DATABASE_URL in Vercel Production.");
      return bad("env:DATABASE_URL", "must be a valid postgres/postgresql URL");
    }
    if (["127.0.0.1", "localhost"].includes(parsed.hostname)) {
      action("Move database off localhost", "Production deployments cannot use your laptop database. Set DATABASE_URL to a reachable cloud Postgres host.");
      return bad("env:DATABASE_URL", "must use a reachable production database host");
    }
    const password = decodeURIComponent(parsed.password || "");
    if (looksPlaceholder(password) || password.length < 16) {
      action("Rotate database password", "Generate a strong database password in the database provider dashboard and update DATABASE_URL in Vercel.");
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
  checkRecommendedToken("GITHUB_READ_TOKEN", { min: 24, prefixes: ["github_pat_", "ghp_"] });
}

function checkTurnstileConfig() {
  const required = envValue("AUTH_TURNSTILE_REQUIRED") === "true" || envValue("AUTH_TURNSTILE_REQUIRED") !== "false";
  const siteKey = envValue("NEXT_PUBLIC_TURNSTILE_SITE_KEY");
  const secret = envValue("TURNSTILE_SECRET_KEY");
  if (!required) return caution("env:AUTH_TURNSTILE_REQUIRED", "Turnstile is not required; enable it before public launch if auth stays open");
  if (looksPlaceholder(siteKey) || looksPlaceholder(secret)) {
    action("Configure Cloudflare Turnstile", "Create a Turnstile widget in Cloudflare, then set NEXT_PUBLIC_TURNSTILE_SITE_KEY and TURNSTILE_SECRET_KEY in Vercel Production.");
    return bad("env:TURNSTILE", "NEXT_PUBLIC_TURNSTILE_SITE_KEY and TURNSTILE_SECRET_KEY are required when auth Turnstile is enabled");
  }
  ok("env:TURNSTILE", "auth bot protection is configured");
}

function checkHostAllowlist() {
  const value = envValue("APP_ALLOWED_HOSTS");
  if (!value) {
    ok("env:APP_ALLOWED_HOSTS", "using secure built-in production host defaults");
    return;
  }

  const hosts = value.split(",").map((item) => item.trim().toLowerCase()).filter(Boolean);
  if (hosts.some((host) => host === "*" || host.includes(" "))) {
    return bad("env:APP_ALLOWED_HOSTS", "must contain exact hostnames only");
  }
  if (!hosts.includes("vantaapi.com") && !hosts.includes("www.vantaapi.com")) {
    return caution("env:APP_ALLOWED_HOSTS", "does not include vantaapi.com/www.vantaapi.com; verify launch domain");
  }
  ok("env:APP_ALLOWED_HOSTS", "host allowlist is explicit");
}

function checkRedisConfig() {
  const enabled = envValue("ENABLE_REDIS_RATE_LIMITS") === "true" || Boolean(envValue("REDIS_URL"));
  if (!enabled) {
    action("Recommended: set REDIS_URL", "Use Upstash Redis or another managed Redis to make rate limits consistent across serverless instances.");
    caution("env:REDIS_URL", "not configured; in-memory rate limits will work but are weaker on serverless scale");
    return;
  }

  const redisUrl = envValue("REDIS_URL");
  if (!redisUrl) {
    action("Set REDIS_URL", "ENABLE_REDIS_RATE_LIMITS is true, so REDIS_URL must point to a managed Redis instance.");
    return bad("env:REDIS_URL", "ENABLE_REDIS_RATE_LIMITS is true but REDIS_URL is missing");
  }

  try {
    const parsed = new URL(redisUrl);
    if (["127.0.0.1", "localhost"].includes(parsed.hostname)) {
      return bad("env:REDIS_URL", "must not point to localhost in production");
    }
    ok("env:REDIS_URL", "distributed rate limit store is configured");
  } catch {
    bad("env:REDIS_URL", "must be a valid URL when Redis rate limits are enabled");
  }
}

async function checkAdmin2FAState() {
  if (!databaseUrlLooksProductionReady) {
    action("Verify admin 2FA after database is fixed", "After DATABASE_URL points to production Postgres, create or seed an ADMIN user and complete 2FA before public launch.");
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
      action("Create an ADMIN user", "Seed or create one admin account in production, then log in and complete 2FA.");
      bad("db:admin-2fa", "no ADMIN user exists; create one before launch");
      return;
    }

    const unprotected = admins.filter((admin) => !admin.twoFactorEnabled || !admin.twoFactorConfirmedAt);
    if (unprotected.length > 0) {
      action("Complete admin 2FA", "Log in as every admin account and finish 2FA setup before public launch.");
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
          if (/VantaAPI|vantaapi-ranking|Immortal|immortal/.test(body)) {
            publicBrandResidue.push(path.relative(root, full));
          }
        }
      }
    }
  }

  if (publicBrandResidue.length) {
    bad("brand:public-residue", `cleanup needed in ${Array.from(new Set(publicBrandResidue)).slice(0, 12).join(", ")}`);
  } else {
    ok("brand:public-residue", "no VantaAPI/vantaapi-ranking/Immortal residue in app, components, or lib");
  }
}

function checkRetiredPublicSurface() {
  const publicEntryFiles = [
    "app/page.tsx",
    "app/search/page.tsx",
    "app/sitemap.ts",
    "components/ConsoleNav.tsx",
    "components/layout/GlobalSearchLauncher.tsx",
    "lib/site-search.ts",
    "lib/tool-definitions.ts",
  ];
  const retiredRoutes = [
    "/rankings",
    "/ranking",
    "/comments",
    "/comment",
    "/report",
    "/reports",
    "/games",
    "/projects",
    "/questions",
    "/api/rankings",
    "/api/comments",
    "/api/report",
    "/api/reports",
    "/api/ai-review",
    "/api/cpp/run",
  ];
  const exposed = [];
  const wrappers = [`"`, `'`, "`"];

  for (const file of publicEntryFiles) {
    const body = read(file);
    for (const route of retiredRoutes) {
      const linked = wrappers.some((prefix) =>
        [`${prefix}${route}${prefix}`, `${prefix}${route}?`, `${prefix}${route}/`, `${prefix}${route}#`].some((needle) =>
          body.includes(needle),
        ),
      );
      if (linked) exposed.push(`${file} -> ${route}`);
    }
  }

  if (exposed.length) {
    action("Hide retired public entries", "Remove ranking, comments, report, games, projects, questions, AI review, and C++ run links from public navigation, search, sitemap, and tool definitions.");
    bad("surface:retired-routes", `public entry still exposes ${exposed.slice(0, 10).join(", ")}`);
  } else {
    ok("surface:retired-routes", "retired routes are not linked from public homepage/search/nav/sitemap/tool definitions");
  }
}

function checkRetiredApiResponses() {
  const retiredApiFiles = [
    "app/api/categories/route.ts",
    "app/api/comments/route.ts",
    "app/api/rankings/route.ts",
    "app/api/rankings/[id]/route.ts",
    "app/api/rankings/leaderboard/route.ts",
    "app/api/rankings/like/route.ts",
    "app/api/report/route.ts",
    "app/api/reports/route.ts",
    "app/api/ai-review/route.ts",
    "app/api/cpp/run/route.ts",
    "app/api/admin/rankings/route.ts",
    "app/api/admin/rankings/[id]/route.ts",
  ];
  const helper = read("lib/retired-api.ts");
  const helperHasHeaders =
    helper.includes('"Cache-Control": "no-store"') &&
    helper.includes('"X-Robots-Tag": "noindex, nofollow, noarchive"') &&
    helper.includes("status: 410");
  const weak = [];

  for (const file of retiredApiFiles) {
    const body = read(file);
    if (!body) {
      weak.push(`${file} missing`);
      continue;
    }
    const usesHelper = body.includes("retiredApi(") && helperHasHeaders;
    const inlineHardened =
      body.includes("status: 410") &&
      body.includes('"Cache-Control": "no-store"') &&
      body.includes('"X-Robots-Tag": "noindex, nofollow, noarchive"');
    if (!usesHelper && !inlineHardened) weak.push(file);
  }

  if (weak.length) {
    action("Harden retired API responses", "Retired APIs should return 410 with no-store and X-Robots-Tag noindex headers.");
    bad("api:retired-responses", `weak retired API response in ${weak.slice(0, 10).join(", ")}`);
  } else {
    ok("api:retired-responses", "retired APIs return hardened 410 no-store noindex responses");
  }
}

function checkRetiredPageRedirects() {
  const retiredPages = {
    "app/games/page.tsx": ["/", "/tools/github-repo-analyzer"],
    "app/projects/page.tsx": ["/", "/tools/github-repo-analyzer"],
    "app/questions/page.tsx": ["/", "/tools/github-repo-analyzer"],
    "app/report/page.tsx": ["/tools/github-repo-analyzer"],
  };
  const weak = [];

  for (const [file, allowedTargets] of Object.entries(retiredPages)) {
    const body = read(file);
    const redirectsToAllowedTarget = allowedTargets.some((target) => body.includes(`redirect("${target}")`) || body.includes(`redirect('${target}')`));
    if (!redirectsToAllowedTarget) weak.push(file);
  }

  if (weak.length) {
    action("Retarget retired public pages", "Retired public pages should redirect to the homepage or GitHub Launch Audit, not old learning, ranking, project, or account surfaces.");
    bad("pages:retired-redirects", `retired pages need safer redirects in ${weak.join(", ")}`);
  } else {
    ok("pages:retired-redirects", "retired public pages redirect to the focused product surface");
  }
}

function checkFocusedSitemap() {
  const body = read("app/sitemap.ts");
  const requiredRoutes = [
    "/tools",
    "/tools/github-repo-analyzer",
    "/tools/prompt-optimizer",
    "/tools/bug-finder",
    "/tools/api-request-generator",
    "/tools/dev-utilities",
    "/tools/learning-roadmap",
    "/programming",
    "/search",
    "/privacy",
    "/terms",
  ];
  const offFocusRoutes = [
    "/today",
    "/english",
    "/cpp",
    "/learn",
    "/languages",
    "/wrong",
    "/dashboard",
    "/progress",
    "/games",
    "/projects",
    "/questions",
    "/report",
  ];
  const missing = requiredRoutes.filter((route) => !body.includes(`"${route}"`) && !body.includes(`'${route}'`));
  const exposed = offFocusRoutes.filter((route) => body.includes(`"${route}"`) || body.includes(`'${route}'`));

  if (missing.length) {
    bad("seo:sitemap-focus", `missing core routes: ${missing.join(", ")}`);
    return;
  }
  if (exposed.length) {
    action("Focus sitemap", "Keep sitemap focused on GitHub Launch Audit, AI tools, programming route, search, privacy, and terms. Do not include old learning or retired pages.");
    bad("seo:sitemap-focus", `off-focus routes in sitemap: ${exposed.join(", ")}`);
    return;
  }
  ok("seo:sitemap-focus", "sitemap is focused on launch audit and developer tools");
}

async function main() {
  console.log("🚀 JinMing Lab prelaunch gate\n");
  if (loadedEnvFiles.length) console.log(`Loaded env files: ${loadedEnvFiles.join(", ")}\n`);

  checkSecret("JWT_SECRET", { min: 32 });
  checkSecret("CSRF_SECRET", { min: 64, hex: true });
  checkSecret("ENCRYPTION_KEY", { min: 64, hex: true });
  checkDatabasePassword();
  checkHostAllowlist();

  if (envValue("ADMIN_2FA_REQUIRED") === "false") bad("env:ADMIN_2FA_REQUIRED", "must not be false before launch");
  else ok("env:ADMIN_2FA_REQUIRED", "2FA enforcement is enabled or using secure default");

  await checkAdmin2FAState();
  checkTurnstileConfig();
  checkRedisConfig();
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
  checkRetiredPublicSurface();
  checkRetiredApiResponses();
  checkRetiredPageRedirects();
  checkFocusedSitemap();

  console.log(`\nSummary: pass=${pass} warn=${warn} fail=${fail}`);
  if (launchActions.length) {
    console.log("\nNext launch actions:");
    const uniqueActions = [];
    const seen = new Set();
    for (const item of launchActions) {
      const key = `${item.title}:${item.detail}`;
      if (seen.has(key)) continue;
      seen.add(key);
      uniqueActions.push(item);
    }
    uniqueActions.slice(0, 8).forEach((item, index) => {
      console.log(`${index + 1}. ${item.title}`);
      console.log(`   ${item.detail}`);
    });
  }
  if (fail > 0) process.exit(1);
}

main().catch((error) => {
  bad("launch:check", error instanceof Error ? error.message : "unknown failure");
  console.log(`\nSummary: pass=${pass} warn=${warn} fail=${fail}`);
  if (launchActions.length) {
    console.log("\nNext launch actions:");
    launchActions.slice(0, 8).forEach((item, index) => {
      console.log(`${index + 1}. ${item.title}`);
      console.log(`   ${item.detail}`);
    });
  }
  process.exit(1);
});
