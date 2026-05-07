#!/usr/bin/env node

/**
 * Lightweight post-deploy smoke check for the public production site.
 * It does not print secrets and does not require admin credentials.
 */

const DEFAULT_BASE_URL = "https://vantaapi.com";
const args = process.argv.slice(2);
const baseArg = args.find((arg) => arg.startsWith("--base="));
const baseUrl = (baseArg ? baseArg.slice("--base=".length) : process.env.SMOKE_BASE_URL || DEFAULT_BASE_URL).replace(/\/+$/, "");
const timeoutMs = Number(process.env.SMOKE_TIMEOUT_MS || 10_000);

let pass = 0;
let warn = 0;
let fail = 0;

function logPass(name, message) {
  pass += 1;
  console.log(`OK ${name}: ${message}`);
}

function logWarn(name, message) {
  warn += 1;
  console.log(`WARN ${name}: ${message}`);
}

function logFail(name, message) {
  fail += 1;
  console.log(`FAIL ${name}: ${message}`);
}

async function fetchWithTimeout(path, options = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(`${baseUrl}${path}`, {
      ...options,
      signal: controller.signal,
      headers: {
        "User-Agent": "JinMingLab-SmokeCheck/1.0",
        ...(options.headers || {}),
      },
    });
  } finally {
    clearTimeout(timeout);
  }
}

async function checkPage(path, mustContain) {
  try {
    const response = await fetchWithTimeout(path);
    const body = await response.text();
    if (!response.ok) return logFail(path, `HTTP ${response.status}`);
    if (mustContain && !body.includes(mustContain)) return logFail(path, `missing text: ${mustContain}`);
    logPass(path, `HTTP ${response.status}`);
  } catch (error) {
    logFail(path, error instanceof Error ? error.message : "request failed");
  }
}

async function checkRobots() {
  try {
    const response = await fetchWithTimeout("/robots.txt");
    const body = await response.text();
    if (!response.ok) return logFail("/robots.txt", `HTTP ${response.status}`);
    if (!body.includes("Sitemap:")) return logFail("/robots.txt", "missing Sitemap directive");
    if (!body.includes("/api/")) return logWarn("/robots.txt", "does not disallow /api/");
    logPass("/robots.txt", "robots file present");
  } catch (error) {
    logFail("/robots.txt", error instanceof Error ? error.message : "request failed");
  }
}

async function checkSitemap() {
  try {
    const response = await fetchWithTimeout("/sitemap.xml");
    const body = await response.text();
    if (!response.ok) return logFail("/sitemap.xml", `HTTP ${response.status}`);
    if (!body.includes("/tools/github-repo-analyzer")) return logFail("/sitemap.xml", "missing GitHub Audit URL");
    logPass("/sitemap.xml", "sitemap includes core audit URL");
  } catch (error) {
    logFail("/sitemap.xml", error instanceof Error ? error.message : "request failed");
  }
}

async function checkAuditApi() {
  try {
    const response = await fetchWithTimeout("/api/tools/github-repo-analyzer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: "https://github.com/vercel/swr" }),
    });
    const body = await response.text();
    if (response.status === 429) return logWarn("audit-api", "rate limited; endpoint is protected");
    if (!response.ok) return logFail("audit-api", `HTTP ${response.status}: ${body.slice(0, 120)}`);
    if (!body.includes("launchScore")) return logFail("audit-api", "response missing launchScore");
    logPass("audit-api", "GitHub audit endpoint returned analysis");
  } catch (error) {
    logFail("audit-api", error instanceof Error ? error.message : "request failed");
  }
}

async function main() {
  console.log(`JinMing Lab production smoke check: ${baseUrl}\n`);
  await checkPage("/", "GitHub Launch Audit");
  await checkPage("/tools/github-repo-analyzer", "GitHub Launch Audit");
  await checkRobots();
  await checkSitemap();
  await checkAuditApi();
  console.log(`\nSummary: pass=${pass} warn=${warn} fail=${fail}`);
  if (fail > 0) process.exit(1);
}

main().catch((error) => {
  logFail("smoke", error instanceof Error ? error.message : "unknown failure");
  console.log(`\nSummary: pass=${pass} warn=${warn} fail=${fail}`);
  process.exit(1);
});
