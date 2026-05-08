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
let requestIndex = 0;

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
  const isApiRequest = path.startsWith("/api/") || !["GET", "HEAD", undefined].includes(options.method);
  requestIndex += 1;
  try {
    return await fetch(`${baseUrl}${path}`, {
      ...options,
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120 Safari/537.36",
        Accept: isApiRequest ? "application/json,*/*;q=0.8" : "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        "X-Forwarded-For": `127.0.3.${requestIndex}`,
        ...(isApiRequest
          ? {
              Origin: baseUrl,
              Referer: `${baseUrl}/tools/github-repo-analyzer`,
              "Sec-Fetch-Mode": "cors",
              "Sec-Fetch-Site": "same-origin",
            }
          : {
              "Sec-Fetch-Mode": "navigate",
              "Sec-Fetch-Dest": "document",
            }),
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
    const requiredDisallows = ["/api/", "/admin/", "/today", "/english", "/cpp", "/learn", "/languages", "/games", "/projects", "/questions", "/report"];
    const missing = requiredDisallows.filter((route) => !body.includes(`Disallow: ${route}`));
    if (missing.length) return logFail("/robots.txt", `missing disallow entries: ${missing.join(", ")}`);
    logPass("/robots.txt", "robots blocks off-focus surfaces");
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
    const urls = Array.from(body.matchAll(/<loc>([^<]+)<\/loc>/g), (match) => {
      try {
        return new URL(match[1]).pathname;
      } catch {
        return match[1];
      }
    });
    const offFocus = ["/today", "/english", "/cpp", "/learn", "/languages", "/wrong", "/dashboard", "/progress", "/games", "/projects", "/questions", "/report"];
    const exposed = offFocus.filter((route) => urls.some((path) => path === route || path.startsWith(`${route}/`)));
    if (exposed.length) return logFail("/sitemap.xml", `off-focus routes exposed: ${exposed.join(", ")}`);
    logPass("/sitemap.xml", "sitemap includes focused URLs and no retired surfaces");
  } catch (error) {
    logFail("/sitemap.xml", error instanceof Error ? error.message : "request failed");
  }
}

async function checkRetiredEndpoint(path, method = "GET") {
  try {
    const isWriteMethod = !["GET", "HEAD"].includes(method);
    const response = await fetchWithTimeout(path, {
      method,
      ...(isWriteMethod
        ? {
            headers: { "Content-Type": "application/json" },
            body: "{}",
          }
        : {}),
    });
    if (response.status !== 410) return logFail(path, `expected 410 retired response, got HTTP ${response.status}`);
    const robotsHeader = response.headers.get("x-robots-tag") || "";
    const cacheHeader = response.headers.get("cache-control") || "";
    if (!/noindex/i.test(robotsHeader) || !/no-store/i.test(cacheHeader)) {
      return logFail(path, "retired response missing noindex or no-store headers");
    }
    logPass(path, "retired endpoint returns hardened 410");
  } catch (error) {
    logFail(path, error instanceof Error ? error.message : "request failed");
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
  await checkPage("/", "JinMing Lab");
  await checkPage("/tools/github-repo-analyzer", "GitHub Launch Audit");
  await checkRobots();
  await checkSitemap();
  await checkRetiredEndpoint("/api/rankings");
  await checkRetiredEndpoint("/api/comments");
  await checkRetiredEndpoint("/api/cpp/run", "POST");
  await checkAuditApi();
  console.log(`\nSummary: pass=${pass} warn=${warn} fail=${fail}`);
  if (fail > 0) process.exit(1);
}

main().catch((error) => {
  logFail("smoke", error instanceof Error ? error.message : "unknown failure");
  console.log(`\nSummary: pass=${pass} warn=${warn} fail=${fail}`);
  process.exit(1);
});
