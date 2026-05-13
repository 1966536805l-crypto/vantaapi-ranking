#!/usr/bin/env node

/**
 * Rate-limit-aware post-deploy smoke check for the public production site.
 * It does not print secrets and does not require admin credentials.
 */

const DEFAULT_BASE_URL = "https://vantaapi.com";
const args = process.argv.slice(2);
const baseArg = args.find((arg) => arg.startsWith("--base="));
const baseUrl = (baseArg ? baseArg.slice("--base=".length) : process.env.SMOKE_BASE_URL || DEFAULT_BASE_URL).replace(/\/+$/, "");
const timeoutMs = Number(process.env.SMOKE_TIMEOUT_MS || 10_000);
const strictRateLimit = args.includes("--strict-rate-limit") || process.env.SMOKE_STRICT_RATE_LIMIT === "true";
const isPublicProduction = /^https:\/\/(?:www\.)?vantaapi\.com$/i.test(baseUrl);
const requestDelayMs = Number(process.env.SMOKE_REQUEST_DELAY_MS || (isPublicProduction ? 1500 : 0));
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

function sleep(ms) {
  return ms > 0 ? new Promise((resolve) => setTimeout(resolve, ms)) : Promise.resolve();
}

function isRateLimited(response) {
  return response.status === 429;
}

function handleRateLimit(name, response) {
  const retryAfter = response.headers.get("retry-after");
  const suffix = retryAfter ? `retry after ${retryAfter}s` : "edge protection is active";
  if (strictRateLimit) {
    logFail(name, `HTTP 429; ${suffix}`);
  } else {
    logWarn(name, `rate limited; ${suffix}`);
  }
  return true;
}

async function fetchWithTimeout(path, options = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  const isApiRequest = path.startsWith("/api/") || !["GET", "HEAD", undefined].includes(options.method);
  requestIndex += 1;
  if (requestIndex > 1) await sleep(requestDelayMs);
  try {
    return await fetch(`${baseUrl}${path}`, {
      ...options,
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120 Safari/537.36",
        Accept: isApiRequest ? "application/json,*/*;q=0.8" : "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        ...(isApiRequest
          ? {
              Origin: baseUrl,
              Referer: `${baseUrl}/tools/github-repo-analyzer`,
              "Sec-Fetch-Mode": "cors",
              "Sec-Fetch-Site": "same-origin",
            }
          : {
              "Upgrade-Insecure-Requests": "1",
              "Sec-Fetch-Mode": "navigate",
              "Sec-Fetch-Dest": "document",
              "Sec-Fetch-Site": "none",
              "Sec-Fetch-User": "?1",
            }),
        ...(options.headers || {}),
      },
    });
  } finally {
    clearTimeout(timeout);
  }
}

async function checkSecurityHeaders(path) {
  try {
    const response = await fetchWithTimeout(path);
    if (isRateLimited(response)) return handleRateLimit(`${path}:security-headers`, response);
    const requiredHeaders = {
      "x-content-type-options": /nosniff/i,
      "x-frame-options": /deny/i,
      "referrer-policy": /strict-origin-when-cross-origin/i,
      "x-security-mode": /^(normal|elevated|emergency)$/i,
    };
    const missing = Object.entries(requiredHeaders).filter(([header, pattern]) => !pattern.test(response.headers.get(header) || ""));
    if (missing.length) return logFail(`${path}:security-headers`, `missing ${missing.map(([header]) => header).join(", ")}`);
    logPass(`${path}:security-headers`, "core edge security headers are present");
  } catch (error) {
    logFail(`${path}:security-headers`, error instanceof Error ? error.message : "request failed");
  }
}

async function checkPage(path, mustContain) {
  try {
    const response = await fetchWithTimeout(path);
    if (isRateLimited(response)) return handleRateLimit(path, response);
    const body = await response.text();
    if (!response.ok) return logFail(path, `HTTP ${response.status}`);
    if (mustContain && !body.includes(mustContain)) return logFail(path, `missing text: ${mustContain}`);
    logPass(path, `HTTP ${response.status}`);
  } catch (error) {
    logFail(path, error instanceof Error ? error.message : "request failed");
  }
}

async function checkLocalizedPage(path, mustContain) {
  try {
    const response = await fetchWithTimeout(path, {
      headers: {
        Cookie: "jinming_language=zh; vantaapi-language=zh",
      },
    });
    if (isRateLimited(response)) return handleRateLimit(`${path}:i18n`, response);
    const body = await response.text();
    if (!response.ok) return logFail(`${path}:i18n`, `HTTP ${response.status}`);
    if (!body.includes(mustContain)) return logFail(`${path}:i18n`, `missing localized text: ${mustContain}`);
    logPass(`${path}:i18n`, "explicit lang renders localized copy");
  } catch (error) {
    logFail(`${path}:i18n`, error instanceof Error ? error.message : "request failed");
  }
}

async function checkRedirect(path, expectedPathname) {
  try {
    const response = await fetchWithTimeout(path, { redirect: "manual" });
    if (isRateLimited(response)) return handleRateLimit(path, response);
    const location = response.headers.get("location") || "";
    const locationPath = location
      ? new URL(location, baseUrl).pathname
      : "";
    if (![301, 302, 303, 307, 308].includes(response.status)) {
      return logFail(path, `expected redirect to ${expectedPathname}, got HTTP ${response.status}`);
    }
    if (locationPath !== expectedPathname) {
      return logFail(path, `expected redirect to ${expectedPathname}, got ${location || "empty location"}`);
    }
    logPass(path, `redirects to ${expectedPathname}`);
  } catch (error) {
    logFail(path, error instanceof Error ? error.message : "request failed");
  }
}

async function checkRobots() {
  try {
    const response = await fetchWithTimeout("/robots.txt");
    if (isRateLimited(response)) return handleRateLimit("/robots.txt", response);
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
    if (isRateLimited(response)) return handleRateLimit("/sitemap.xml", response);
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
    if (isRateLimited(response)) return handleRateLimit(path, response);
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

async function checkQuestionsApiScope() {
  try {
    const response = await fetchWithTimeout("/api/questions?lang=ar");
    const body = await response.text();
    if (isRateLimited(response)) return handleRateLimit("questions-api", response);
    if (response.status !== 400) return logFail("questions-api", `expected scoped 400 without lessonId, got HTTP ${response.status}`);
    if (/\"answer\"|passwordHash|explanation/i.test(body)) return logFail("questions-api", "public error response exposed sensitive fields");
    logPass("questions-api", "requires lessonId and does not expose answer fields");
  } catch (error) {
    logFail("questions-api", error instanceof Error ? error.message : "request failed");
  }
}

async function checkAiCoachRequiresLogin() {
  try {
    const response = await fetchWithTimeout("/api/ai/coach?lang=zh", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mode: "programming", prompt: "ping" }),
    });
    const body = await response.text();
    if (isRateLimited(response)) return handleRateLimit("ai-coach-auth", response);
    if (response.status !== 401) return logFail("ai-coach-auth", `expected 401 without login, got HTTP ${response.status}: ${body.slice(0, 120)}`);
    logPass("ai-coach-auth", "AI coach requires login");
  } catch (error) {
    logFail("ai-coach-auth", error instanceof Error ? error.message : "request failed");
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
    if (isRateLimited(response)) return handleRateLimit("audit-api", response);
    if (!response.ok) return logFail("audit-api", `HTTP ${response.status}: ${body.slice(0, 120)}`);
    if (!body.includes("launchScore")) return logFail("audit-api", "response missing launchScore");
    logPass("audit-api", "GitHub audit endpoint returned analysis");
  } catch (error) {
    logFail("audit-api", error instanceof Error ? error.message : "request failed");
  }
}

async function checkAuditRejectsSensitiveInput() {
  try {
    const fakeToken = `ghp_${"1".repeat(36)}`;
    const response = await fetchWithTimeout("/api/tools/github-repo-analyzer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: `https://github.com/vercel/swr?token=${fakeToken}` }),
    });
    const body = await response.text();
    if (isRateLimited(response)) return handleRateLimit("audit-sensitive-input", response);
    if (response.status !== 400) return logFail("audit-sensitive-input", `expected 400 for sensitive input, got HTTP ${response.status}`);
    if (body.includes(fakeToken)) return logFail("audit-sensitive-input", "error response echoed the submitted token");
    logPass("audit-sensitive-input", "rejects sensitive pasted repository input without echoing it");
  } catch (error) {
    logFail("audit-sensitive-input", error instanceof Error ? error.message : "request failed");
  }
}

async function checkHealthApi() {
  try {
    const response = await fetchWithTimeout("/api/health");
    const body = await response.text();
    if (isRateLimited(response)) return handleRateLimit("health-api", response);
    if (!response.ok) return logFail("health-api", `HTTP ${response.status}: ${body.slice(0, 120)}`);
    let snapshot;
    try {
      snapshot = JSON.parse(body);
    } catch {
      return logFail("health-api", "response is not valid JSON");
    }
    if (snapshot?.product !== "JinMing Lab" || !Array.isArray(snapshot?.checks)) {
      return logFail("health-api", "response missing public health snapshot");
    }
    if (snapshot?.build?.languageBootstrap !== "client-component" || !snapshot?.build?.commit) {
      return logFail("health-api", "response missing safe build identity");
    }
    logPass("health-api", "public health snapshot and safe build identity returned without secrets");
  } catch (error) {
    logFail("health-api", error instanceof Error ? error.message : "request failed");
  }
}

async function main() {
  console.log(`JinMing Lab production smoke check: ${baseUrl}\n`);
  await checkPage("/", "JinMing Lab");
  await checkSecurityHeaders("/");
  await checkLocalizedPage("/?lang=ja", "リポジトリを貼るだけで");
  await checkLocalizedPage("/?lang=fr", "Collez un repo");
  await checkLocalizedPage("/?lang=ar", "ألصق المستودع");
  await checkPage("/tools/github-repo-analyzer", "GitHub Launch Audit");
  await checkPage("/security", "How JinMing Lab handles your data");
  await checkPage("/status", "JinMing Lab service status");
  await checkRedirect("/games?lang=ja", "/");
  await checkRedirect("/projects?lang=ja", "/tools/github-repo-analyzer");
  await checkRedirect("/questions?lang=ja", "/tools/github-repo-analyzer");
  await checkRedirect("/report?lang=ja", "/tools/github-repo-analyzer");
  await checkRobots();
  await checkSitemap();
  await checkRetiredEndpoint("/api/rankings");
  await checkRetiredEndpoint("/api/comments");
  await checkRetiredEndpoint("/api/cpp/errors");
  await checkRetiredEndpoint("/api/cpp/run", "POST");
  await checkQuestionsApiScope();
  await checkAiCoachRequiresLogin();
  await checkAuditApi();
  await checkAuditRejectsSensitiveInput();
  await checkHealthApi();
  console.log(`\nSummary: pass=${pass} warn=${warn} fail=${fail}`);
  if (fail > 0) process.exit(1);
}

main().catch((error) => {
  logFail("smoke", error instanceof Error ? error.message : "unknown failure");
  console.log(`\nSummary: pass=${pass} warn=${warn} fail=${fail}`);
  process.exit(1);
});
