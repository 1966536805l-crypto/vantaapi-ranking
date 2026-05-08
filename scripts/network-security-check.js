#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("fs");

const checks = [];
const read = (path) => {
  try { return fs.readFileSync(path, "utf8"); } catch { return ""; }
};
const has = (text, pattern) => typeof pattern === "string" ? text.includes(pattern) : pattern.test(text);
const add = (level, name, message) => checks.push({ level, name, message });

const proxy = [
  "proxy.ts",
  "lib/proxy/guards.ts",
  "lib/proxy/language.ts",
  "lib/proxy/rate-limit.ts",
  "lib/proxy/response.ts",
].map(read).join("\n");
const bot = read("lib/bot-protection.ts");
const env = read(".env.example");
const nginx = read("deploy/nginx/vantaapi-security.conf");
const nginxHeaders = read("deploy/nginx/vantaapi-proxy-headers.conf");
const docs = read("docs/NETWORK_HARDENING.md") + "\n" + read("docs/EDGE_SECURITY.md");

console.log("🛡️ vantaapi network security check\n");

if (has(env, "SECURITY_MODE=\"normal\"") && has(proxy, "SECURITY_MODE") && has(proxy, "emergency")) {
  add("pass", "mode:runtime", "normal/elevated/emergency security modes are wired");
} else add("fail", "mode:runtime", "runtime security mode is missing");

for (const [name, pattern] of Object.entries({
  "proxy:global-rate": "globalRateGuard",
  "proxy:expensive-api": "expensiveApiGuard",
  "proxy:host-guard": "isAllowedHost",
  "proxy:method-guard": "allowedMethods",
  "proxy:body-limit": "bodySizeGuard",
  "proxy:cross-site": "crossSiteGuard",
  "proxy:security-header": "X-Security-Mode",
  "proxy:fingerprint-rate": "fingerprintRateGuard",
  "proxy:content-type": "contentTypeGuard",
  "proxy:query-shape": "queryShapeGuard",
  "proxy:emergency-write": "emergencyWriteGuard",
})) {
  add(has(proxy, pattern) ? "pass" : "fail", name, has(proxy, pattern) ? "present" : "missing");
}

for (const [name, pattern] of Object.entries({
  "bot:sensitive-probes": "sensitivePathPattern",
  "bot:traversal": "traversalPattern",
  "bot:injection": "injectionProbePattern",
  "bot:metadata-probe": "cloudMetadataPattern",
  "bot:encoded-probe": "encodedProbePattern",
  "bot:trap": "trapPaths",
  "bot:trusted-crawlers": "trustedCrawlerPattern",
})) {
  add(has(bot, pattern) ? "pass" : "fail", name, has(bot, pattern) ? "present" : "missing");
}

for (const [name, pattern] of Object.entries({
  "nginx:limit-zones": "limit_req_zone",
  "nginx:conn-limit": "limit_conn_zone",
  "nginx:hidden-probes": /\.git|\.env|wp-login|xmlrpc|phpmyadmin/,
  "nginx:api-limits": "location ^~ /api/",
  "nginx:ai-limit": "location = /api/ai/coach",
  "nginx:localhost-upstream": "proxy_pass http://127.0.0.1:3000",
  "nginx:small-body": "client_max_body_size 128k",
})) {
  add(has(nginx, pattern) ? "pass" : "fail", name, has(nginx, pattern) ? "present" : "missing");
}

if (has(nginxHeaders, "X-Forwarded-Proto") && has(nginxHeaders, "X-Real-IP") && has(nginxHeaders, "Host $host")) {
  add("pass", "nginx:proxy-headers", "forwarded headers template present");
} else add("fail", "nginx:proxy-headers", "forwarded headers template incomplete");

if (has(docs, "Origin exposure rules") && has(docs, "SECURITY_MODE") && has(docs, "CDN/WAF")) {
  add("pass", "docs:network-hardening", "network hardening and DDoS posture documented");
} else add("fail", "docs:network-hardening", "network hardening docs incomplete");

const icons = { pass: "✅", warn: "⚠️", fail: "❌" };
for (const check of checks) console.log(`${icons[check.level]} ${check.name}: ${check.message}`);
const summary = checks.reduce((acc, check) => {
  acc[check.level] = (acc[check.level] || 0) + 1;
  return acc;
}, {});
console.log("\nSummary:", `pass=${summary.pass || 0}`, `warn=${summary.warn || 0}`, `fail=${summary.fail || 0}`);
if (summary.fail) process.exitCode = 1;
