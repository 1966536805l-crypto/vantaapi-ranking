#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("fs");

const checks = [];
function read(path) {
  try {
    return fs.readFileSync(path, "utf8");
  } catch {
    return "";
  }
}
function expect(name, condition, detail) {
  checks.push({ name, ok: Boolean(condition), detail });
}
function includes(path, text) {
  return read(path).includes(text);
}
function matches(path, pattern) {
  return pattern.test(read(path));
}

expect("no legacy deployment password", !/VantaAPI2026|INSERT INTO Admin|mysql -u vantaapi -p/.test(read("DEPLOYMENT.md") + read("deploy-baota.sh") + read("SECURITY_REPORT.md")), "legacy fixed DB password/Admin SQL must stay removed");
expect("host allowlist excludes vercel wildcard", !includes("proxy.ts", ".vercel.app"), "production fallback must not allow *.vercel.app");
expect("production CSP removes unsafe-inline scripts", matches("next.config.js", /:\s*`script-src 'self'\$\{hasTurnstile/), "production script-src should be self plus explicit providers only");
expect("production CSP removes unsafe-inline styles", includes("next.config.js", "isDev ? \"style-src 'self' 'unsafe-inline'\" : \"style-src 'self'\""), "production style-src should not include unsafe-inline");
expect("CSRF double-submit token is present", includes("lib/csrf.ts", "x-csrf-token") && includes("lib/csrf.ts", "csrf-signature") && includes("components/security/CsrfBootstrap.tsx", "x-csrf-token"), "unsafe browser writes need csrf token header and signed cookie");
expect("admin APIs require CSRF", matches("app/api/admin/courses/route.ts", /requireCsrf\(request\)/) && matches("app/api/admin/questions/[id]/route.ts", /requireCsrf\(request\)/), "admin mutation routes must call requireCsrf");
expect("learning write APIs require CSRF", matches("app/api/wrong/route.ts", /requireCsrf\(request\)/) && matches("app/api/progress/route.ts", /requireCsrf\(request\)/) && matches("app/api/quiz/submit/route.ts", /requireCsrf\(request\)/), "wrong/progress/quiz writes must call requireCsrf");
expect("admin 2FA setup is enabled", includes("app/api/auth/2fa/setup/route.ts", "generate2FASecret") && includes("app/api/auth/2fa/verify/route.ts", "twoFactorEnabled: true"), "2FA endpoints must not return MVP disabled stubs");
expect("admin login verifies TOTP when enabled", includes("app/api/auth/login/route.ts", "verifyEncrypted2FAToken") && includes("app/api/auth/login/route.ts", "twoFactorEnabled"), "admin login must enforce configured TOTP");
expect("admin backend requires 2FA by default", includes("lib/auth.ts", "allowUnverified2FA") && includes("lib/auth.ts", "管理员必须先启用 2FA") && includes("lib/server-auth.ts", "redirect(\"/admin/security\")"), "unverified admins may only reach setup flow");
expect("2FA setup routes explicitly allow unverified admin", includes("app/api/auth/2fa/setup/route.ts", "allowUnverified2FA: true") && includes("app/api/auth/2fa/verify/route.ts", "allowUnverified2FA: true"), "setup must not deadlock admins before first 2FA enrollment");
expect("Redis rate limits fail closed", includes("lib/redis.ts", "REDIS_RATE_LIMIT_FAIL_CLOSED") && includes(".env.example", "REDIS_RATE_LIMIT_FAIL_CLOSED=\"true\""), "production Redis outage should not silently disable limits");
expect("C++ runner default remains off", includes(".env.example", "ENABLE_CPP_RUNNER") ? !includes(".env.example", "ENABLE_CPP_RUNNER=\"true\"") : includes("DEPLOYMENT.md", "ENABLE_CPP_RUNNER=\"false\""), "runner must stay opt-in and documented off");

const failed = checks.filter((check) => !check.ok);
for (const check of checks) {
  console.log(`${check.ok ? "✅" : "❌"} ${check.name}${check.ok ? "" : `: ${check.detail}`}`);
}
console.log(`\nSecurity regression summary: pass=${checks.length - failed.length} fail=${failed.length}`);
if (failed.length) process.exit(1);
