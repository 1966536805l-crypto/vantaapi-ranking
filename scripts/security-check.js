#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("fs");
const { execFileSync } = require("child_process");

const checks = [];
function add(level, name, message) {
  checks.push({ level, name, message });
}
function read(path) {
  try { return fs.readFileSync(path, "utf8"); } catch { return ""; }
}
function has(text, pattern) {
  return typeof pattern === "string" ? text.includes(pattern) : pattern.test(text);
}

const pkg = JSON.parse(read("package.json") || "{}");
const scripts = pkg.scripts || {};
const dockerCompose = read("docker-compose.yml");
const envExample = read(".env.example");
const vercelIgnore = read(".vercelignore");
const proxy = [
  "proxy.ts",
  "lib/proxy/guards.ts",
  "lib/proxy/language.ts",
  "lib/proxy/rate-limit.ts",
  "lib/proxy/response.ts",
].map(read).join("\n");
const nextConfig = read("next.config.js");
const deployment = read("DEPLOYMENT.md");
const edgeSecurity = read("docs/EDGE_SECURITY.md");
const githubSecurityWorkflow = read(".github/workflows/security.yml");
const networkHardening = read("docs/NETWORK_HARDENING.md");
const nginxSecurity = read("deploy/nginx/vantaapi-security.conf");

const seed = read("prisma/seed.cjs");
const aiCoach = read("app/api/ai/coach/route.ts");
const turnstile = read("lib/turnstile.ts");
const csrf = read("lib/csrf.ts");
const apiGuard = read("lib/api-guard.ts");
const authLogin = read("app/api/auth/login/route.ts");
const twoFactorSetup = read("app/api/auth/2fa/setup/route.ts");
const serverAuth = read("lib/server-auth.ts");
const redis = read("lib/redis.ts");

console.log("🔎 JinMing Lab security check\n");

for (const [name, command] of Object.entries({ dev: scripts.dev, start: scripts.start, "dev:3001": scripts["dev:3001"], preview: scripts.preview })) {
  if (!command) continue;
  if (command.includes("--hostname 127.0.0.1")) add("pass", `script:${name}`, "binds to localhost");
  else add("warn", `script:${name}`, "does not explicitly bind to 127.0.0.1");
}

if (has(dockerCompose, "127.0.0.1:5432:5432")) add("pass", "docker:postgres", "Postgres is localhost-bound");
else if (has(dockerCompose, "5432:5432")) add("fail", "docker:postgres", "Postgres is exposed beyond localhost");
else add("info", "docker:postgres", "No direct Postgres port mapping found");

if (has(dockerCompose, "${POSTGRES_PASSWORD")) add("pass", "docker:secrets", "database password is required via env");
else add("warn", "docker:secrets", "database password may be hardcoded or not required");

if (has(envExample, 'APP_ALLOWED_HOSTS="vantaapi.com,www.vantaapi.com"')) add("pass", "env:hosts", "production host allowlist is tight");
else add("warn", "env:hosts", "APP_ALLOWED_HOSTS is missing or too broad");

if (has(envExample, 'ENABLE_PUBLIC_REGISTRATION="false"')) add("pass", "env:registration", "public registration defaults off");
else add("warn", "env:registration", "public registration default is not clearly disabled");

if (!has(seed, "Admin123!Mvp") && !has(seed, "admin@vantaapi.local") && has(seed, "SEED_ADMIN_EMAIL")) {
  add("pass", "seed:admin", "no public default admin credential is seeded");
} else {
  add("fail", "seed:admin", "public default admin credentials may still exist");
}

if (has(aiCoach, "requireUser(request)") && has(aiCoach, "ai-coach:user")) {
  add("pass", "ai:coach-auth", "AI coach requires login and has per-user daily limits");
} else {
  add("fail", "ai:coach-auth", "AI coach may be anonymously callable or missing per-user limits");
}

if (has(turnstile, "AUTH_TURNSTILE_REQUIRED") && has(turnstile, "turnstile-not-configured")) {
  add("pass", "auth:turnstile-prod", "production Turnstile can fail closed for auth");
} else {
  add("warn", "auth:turnstile-prod", "Turnstile production fail-closed behavior is not clear");
}

if (
  has(csrf, "x-csrf-token") &&
  has(csrf, "csrf-signature") &&
  (has(apiGuard, "validateCsrfRequest") || has(deployment, "CSRF token"))
) {
  add("pass", "csrf:token", "double-submit CSRF token is wired for unsafe routes");
} else {
  add("fail", "csrf:token", "CSRF token protection is missing or not documented");
}

if (has(authLogin, "verifyEncrypted2FAToken") && has(twoFactorSetup, "generate2FASecret")) {
  add("pass", "admin:2fa", "admin TOTP setup and login verification are present");
} else {
  add("fail", "admin:2fa", "admin 2FA setup or login verification is missing");
}

if (has(serverAuth, "redirect(\"/admin/security\")") && has(envExample, 'ADMIN_2FA_REQUIRED="true"')) {
  add("pass", "admin:2fa-required", "admin pages require 2FA enrollment by default");
} else {
  add("fail", "admin:2fa-required", "admin pages may be reachable without 2FA enrollment");
}

if (has(envExample, 'ENABLE_REDIS_RATE_LIMITS="true"') && has(redis, "REDIS_RATE_LIMIT_FAIL_CLOSED")) {
  add("pass", "ratelimit:redis", "Redis rate limits default on and fail closed in production");
} else {
  add("warn", "ratelimit:redis", "Redis rate limit defaults or fail-closed behavior need review");
}

if (!has(nextConfig, /\?\s*`script-src 'self' 'unsafe-inline'/) && has(nextConfig, "isDev ? \"style-src 'self' 'unsafe-inline'\" : \"style-src 'self'\"")) {
  add("pass", "headers:csp-inline", "production CSP removes unsafe-inline for scripts and styles");
} else {
  add("warn", "headers:csp-inline", "production CSP may still allow unsafe-inline");
}

if (has(vercelIgnore, ".env") && has(vercelIgnore, "*.db") && has(vercelIgnore, "node_modules")) add("pass", "deploy:ignore", "sensitive/local files are ignored for Vercel");
else add("warn", "deploy:ignore", "check .vercelignore for env/db/node_modules exclusions");

if (has(edgeSecurity, "DDoS protection") && has(edgeSecurity, "Origin isolation") && has(edgeSecurity, "Managed Challenge") && has(edgeSecurity, "/api/ai/coach")) {
  add("pass", "edge:ddos-waf", "CDN/WAF DDoS baseline is documented without global user challenges");
} else {
  add("warn", "edge:ddos-waf", "CDN/WAF DDoS baseline is incomplete");
}

if (has(githubSecurityWorkflow, "Security baseline") && has(githubSecurityWorkflow, 'DATABASE_URL: "postgresql://') && has(githubSecurityWorkflow, "npm run security:check") && has(githubSecurityWorkflow, "npm run build") && has(githubSecurityWorkflow, "npm run language:smoke")) {
  add("pass", "ci:security-baseline", "GitHub CI runs security checks, a Postgres-shaped env, production build, and multilingual smoke checks");
} else {
  add("warn", "ci:security-baseline", "GitHub CI security baseline, Postgres env, production build, or multilingual smoke check is missing");
}

if (has(networkHardening, "SECURITY_MODE") && has(nginxSecurity, "limit_req_zone") && has(proxy, "globalRateGuard") && has(proxy, "expensiveApiGuard")) {
  add("pass", "network:adaptive-hardening", "adaptive network hardening, Nginx limits, and app-layer budgets are present");
} else {
  add("warn", "network:adaptive-hardening", "adaptive network hardening baseline is incomplete");
}

for (const [name, pattern] of Object.entries({
  "proxy:host-guard": "APP_ALLOWED_HOSTS",
  "proxy:cross-site": "cross-site",
  "proxy:rate-limit": "Too many requests",
  "proxy:body-limit": "Request body too large",
})) {
  add(has(proxy, pattern) ? "pass" : "fail", name, has(proxy, pattern) ? "present" : "missing");
}

for (const [name, pattern] of Object.entries({
  "headers:csp": "Content-Security-Policy",
  "headers:hsts": "Strict-Transport-Security",
  "headers:frame": "X-Frame-Options",
  "headers:nosniff": "X-Content-Type-Options",
})) {
  add(has(nextConfig, pattern) ? "pass" : "fail", name, has(nextConfig, pattern) ? "present" : "missing");
}

if (has(deployment, "只开放 `80/tcp` 和 `443/tcp`") || has(deployment, "80/tcp") && has(deployment, "443/tcp")) {
  add("pass", "docs:firewall", "production security group guidance is documented");
} else {
  add("warn", "docs:firewall", "production security group guidance is missing");
}

try {
  const firewall = execFileSync("/usr/libexec/ApplicationFirewall/socketfilterfw", ["--getglobalstate"], { encoding: "utf8" });
  add(firewall.includes("enabled") ? "pass" : "warn", "host:firewall", firewall.trim());
  const stealth = execFileSync("/usr/libexec/ApplicationFirewall/socketfilterfw", ["--getstealthmode"], { encoding: "utf8" });
  add(stealth.includes("on") ? "pass" : "warn", "host:stealth", stealth.trim());
} catch (error) {
  add("info", "host:firewall", `host firewall check skipped: ${error.message}`);
}

try {
  const listeners = execFileSync("lsof", ["-nP", "-iTCP", "-sTCP:LISTEN"], { encoding: "utf8" });
  const riskyNext = listeners.split("\n").filter((line) => /node/.test(line) && /TCP \*:3\d{3}/.test(line));
  if (riskyNext.length === 0) add("pass", "host:next-listeners", "no Next.js node listener exposed on *:3xxx");
  else add("warn", "host:next-listeners", riskyNext.join(" | "));

  const lan = listeners.split("\n").filter((line) => /TCP (\*:|192\.168\.)/.test(line));
  if (lan.length === 0) add("pass", "host:lan-listeners", "no LAN/all-interface listeners detected");
  else add("info", "host:lan-listeners", `${lan.length} LAN/all-interface listener(s); review if unexpected`);
} catch (error) {
  add("info", "host:listeners", `listener check skipped: ${error.message}`);
}

const icons = { pass: "✅", info: "ℹ️", warn: "⚠️", fail: "❌" };
for (const check of checks) {
  console.log(`${icons[check.level]} ${check.name}: ${check.message}`);
}

const summary = checks.reduce((acc, check) => {
  acc[check.level] = (acc[check.level] || 0) + 1;
  return acc;
}, {});
console.log("\nSummary:", `pass=${summary.pass || 0}`, `warn=${summary.warn || 0}`, `fail=${summary.fail || 0}`, `info=${summary.info || 0}`);

if (summary.fail) process.exitCode = 1;
