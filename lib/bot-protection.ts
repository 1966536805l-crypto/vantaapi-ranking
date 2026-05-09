import { NextRequest, NextResponse } from "next/server";

export type BotVerdict = {
  action: "allow" | "block" | "throttle" | "trap";
  reason: string;
  score: number;
  trustedCrawler: boolean;
};

const trapHits = new Map<string, number>();
const violationBuckets = new Map<string, { score: number; resetTime: number }>();

const trustedCrawlerPattern =
  /\b(googlebot|bingbot|duckduckbot|slurp|baiduspider|yandexbot|sogou|bytespider|applebot|facebookexternalhit|twitterbot|linkedinbot)\b/i;

const badCrawlerPattern =
  /\b(curl|wget|python-requests|python-urllib|aiohttp|httpclient|okhttp|go-http-client|java\/|scrapy|spider|crawler|headless|phantomjs|puppeteer|playwright|selenium|zgrab|masscan|sqlmap|nikto|acunetix|nmap|libwww-perl)\b/i;

const suspiciousExtensions =
  /\.(php|asp|aspx|jsp|cgi|env|ini|log|bak|old|sql|sqlite|db|yml|yaml|toml|lock)(?:$|\?)/i;

const sensitivePathPattern =
  /(?:^|\/)(wp-admin|wp-login|xmlrpc\.php|phpmyadmin|adminer|\.git|\.svn|\.hg|\.env|composer\.json|package-lock\.json|vendor|node_modules|cgi-bin|boaform|actuator|server-status|config\.json)(?:\/|$)/i;

const traversalPattern = /(?:%2e%2e|\.\.|%00|%5c|\\|\/\/{2,})/i;
const injectionProbePattern = /\b(?:union\s+select|select\s+.+\s+from|sleep\s*\(|benchmark\s*\(|<script|onerror\s*=|javascript:|base64_decode|cmd=|exec=)\b/i;
const cloudMetadataPattern = /(?:169\.254\.169\.254|metadata\.google\.internal|latest\/meta-data|computeMetadata)/i;
const encodedProbePattern = /(?:%3cscript|%27%20or%20|%22%20or%20|%252e%252e|%2fetc%2fpasswd|%3bcat%20)/i;

const trapPaths = new Set([
  "/__crawler-trap",
  "/api/__crawler-trap",
  "/wp-login.php",
  "/xmlrpc.php",
  "/.env",
]);

function now() {
  return Date.now();
}

function stableHash(value: string) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(36);
}

export function getBotClientIp(request: NextRequest) {
  const cfIp = request.headers.get("cf-connecting-ip");
  if (cfIp) return cfIp.trim();

  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || "unknown";

  const vercelForwarded = request.headers.get("x-vercel-forwarded-for");
  if (vercelForwarded) return vercelForwarded.split(",")[0]?.trim() || "unknown";

  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp.trim();

  const fallback = [
    request.headers.get("host") || "",
    request.headers.get("user-agent") || "",
    request.headers.get("accept-language") || "",
  ].join("|");
  return `fingerprint:${stableHash(fallback)}`;
}

function cleanupMaps(currentTime: number) {
  if (trapHits.size > 20_000) {
    for (const [key, expiresAt] of trapHits) {
      if (expiresAt < currentTime) trapHits.delete(key);
    }
  }

  if (violationBuckets.size > 20_000) {
    for (const [key, record] of violationBuckets) {
      if (record.resetTime < currentTime) violationBuckets.delete(key);
    }
  }
}

function rememberViolation(ip: string, score: number, windowMs = 10 * 60_000) {
  const currentTime = now();
  cleanupMaps(currentTime);
  const current = violationBuckets.get(ip);

  if (!current || current.resetTime < currentTime) {
    violationBuckets.set(ip, { score, resetTime: currentTime + windowMs });
    return score;
  }

  current.score += score;
  return current.score;
}

export function evaluateBotRequest(request: NextRequest, pathname: string): BotVerdict {
  const currentTime = now();
  cleanupMaps(currentTime);

  const ip = getBotClientIp(request);
  const userAgent = request.headers.get("user-agent") || "";
  const accept = request.headers.get("accept") || "";
  const acceptLanguage = request.headers.get("accept-language") || "";
  const secFetchMode = request.headers.get("sec-fetch-mode") || "";
  const secFetchDest = request.headers.get("sec-fetch-dest") || "";
  const nextRouter = request.headers.get("next-router-prefetch") || request.headers.get("next-url");
  const purpose = request.headers.get("purpose") || "";
  const trustedCrawler = trustedCrawlerPattern.test(userAgent);
  const isApi = pathname.startsWith("/api/");
  const isUnsafe = !["GET", "HEAD", "OPTIONS"].includes(request.method);

  // Allow Next.js client-side navigation and prefetch requests
  const isNextJsNavigation = nextRouter || purpose === "prefetch" || secFetchDest === "empty";
  if (isNextJsNavigation && !isApi && !isUnsafe) {
    return { action: "allow", reason: "nextjs-navigation", score: 0, trustedCrawler: false };
  }

  if (trapHits.get(ip) && trapHits.get(ip)! > currentTime) {
    return { action: "block", reason: "bot-trap-ip", score: 10, trustedCrawler };
  }

  if (trapPaths.has(pathname)) {
    trapHits.set(ip, currentTime + 24 * 60 * 60_000);
    return { action: "trap", reason: "crawler-trap", score: 10, trustedCrawler };
  }

  if (sensitivePathPattern.test(pathname) || suspiciousExtensions.test(pathname)) {
    trapHits.set(ip, currentTime + 60 * 60_000);
    return { action: "block", reason: "sensitive-probe", score: 10, trustedCrawler };
  }

  const rawUrl = `${pathname}?${request.nextUrl.searchParams.toString()}`;
  if (traversalPattern.test(rawUrl)) {
    trapHits.set(ip, currentTime + 60 * 60_000);
    return { action: "block", reason: "path-traversal-probe", score: 10, trustedCrawler };
  }

  if (pathname.length > 180 || request.nextUrl.search.length > 1800) {
    const rollingScore = rememberViolation(ip, 4);
    return rollingScore >= 9
      ? { action: "block", reason: "oversized-url", score: rollingScore, trustedCrawler }
      : { action: "throttle", reason: "oversized-url", score: rollingScore, trustedCrawler };
  }

  if (injectionProbePattern.test(rawUrl)) {
    const rollingScore = rememberViolation(ip, 6);
    return rollingScore >= 9
      ? { action: "block", reason: "injection-probe", score: rollingScore, trustedCrawler }
      : { action: "throttle", reason: "injection-probe", score: rollingScore, trustedCrawler };
  }

  if (cloudMetadataPattern.test(rawUrl) || encodedProbePattern.test(rawUrl)) {
    trapHits.set(ip, currentTime + 6 * 60 * 60_000);
    return { action: "block", reason: "high-risk-probe", score: 10, trustedCrawler };
  }

  if (trustedCrawler && !isApi && !isUnsafe) {
    return { action: "allow", reason: "trusted-crawler-readonly", score: 0, trustedCrawler };
  }

  let score = 0;
  const reasons: string[] = [];

  if (!userAgent || userAgent.length < 8) {
    score += 3;
    reasons.push("missing-user-agent");
  }

  if (badCrawlerPattern.test(userAgent)) {
    score += 5;
    reasons.push("automation-user-agent");
  }

  if (isApi && trustedCrawler) {
    score += 4;
    reasons.push("crawler-api-access");
  }

  if (!acceptLanguage && !trustedCrawler) {
    score += 1;
    reasons.push("missing-language");
  }

  if (accept === "*/*" && !trustedCrawler && !isApi) {
    score += 1;
    reasons.push("generic-accept");
  }

  if (!secFetchMode && !secFetchDest && !trustedCrawler && !isApi) {
    score += 1;
    reasons.push("missing-fetch-metadata");
  }

  if (isUnsafe && !request.headers.get("origin") && !request.headers.get("referer")) {
    score += 2;
    reasons.push("unsafe-without-origin");
  }

  if (isUnsafe && request.headers.get("content-length") === "0") {
    score += 1;
    reasons.push("empty-unsafe-body");
  }

  if (score === 0) return { action: "allow", reason: "normal", score, trustedCrawler };

  const rollingScore = rememberViolation(ip, score);
  if (score >= 7 || rollingScore >= 12) {
    return { action: "block", reason: reasons.join(","), score: rollingScore, trustedCrawler };
  }

  if (score >= 5 || rollingScore >= 8) {
    return { action: "throttle", reason: reasons.join(","), score: rollingScore, trustedCrawler };
  }

  return { action: "allow", reason: reasons.join(","), score: rollingScore, trustedCrawler };
}

export function botBlockedResponse(verdict: BotVerdict, message?: string) {
  const status = verdict.action === "trap" ? 404 : verdict.action === "throttle" ? 429 : 403;
  const response = NextResponse.json(
    { message: message || (status === 429 ? "Too many requests" : "Request blocked") },
    { status },
  );
  response.headers.set("Cache-Control", "no-store");
  response.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
  response.headers.set("X-Bot-Protection", "active");
  if (status === 429) response.headers.set("Retry-After", "60");
  return response;
}

export function withBotHeaders(response: NextResponse, verdict?: BotVerdict) {
  response.headers.set("X-Bot-Protection", "active");
  if (verdict?.trustedCrawler) response.headers.set("X-Verified-Crawler-Class", "known-readonly");
  return response;
}

export function validateHumanFormSignals(body: Record<string, unknown>) {
  const honeypot = String(body.website || body.company || body.url || "").trim();
  if (honeypot) return { ok: false, reason: "honeypot-filled" };

  const startedAt = Number(body.formStartedAt || 0);
  if (Number.isFinite(startedAt) && startedAt > 0) {
    const ageMs = Date.now() - startedAt;
    if (ageMs < 650) return { ok: false, reason: "form-submitted-too-fast" };
    if (ageMs > 12 * 60 * 60_000 || ageMs < -10_000) {
      return { ok: false, reason: "form-timestamp-invalid" };
    }
  }

  return { ok: true, reason: "ok" };
}
