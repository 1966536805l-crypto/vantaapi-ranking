import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE } from "@/lib/auth-constants";
import { getBotClientIp, type BotVerdict } from "@/lib/bot-protection";
import { readLanguageCookie, preferredLanguageFromHeader, isSupportedSiteLanguage, securityLanguage } from "@/lib/proxy/language";
import { jsonError, securityMode } from "@/lib/proxy/response";
import { getClientIp, rateLimit, rateLimitResponse, stableHash } from "@/lib/proxy/rate-limit";

const protectedPages = ["/dashboard", "/progress", "/wrong", "/admin"];
export const safeMethods = new Set(["GET", "HEAD", "OPTIONS"]);
export const allowedMethods = new Set(["GET", "HEAD", "OPTIONS", "POST", "PUT", "PATCH", "DELETE"]);

const expensiveApiRules = [
  { prefix: "/api/ai/coach", normal: 24, elevated: 12, emergency: 6, windowMs: 60_000 },
  { prefix: "/api/auth/login", normal: 18, elevated: 10, emergency: 6, windowMs: 15 * 60_000 },
  { prefix: "/api/auth/register", normal: 8, elevated: 4, emergency: 2, windowMs: 60 * 60_000 },
  { prefix: "/api/quiz/submit", normal: 80, elevated: 40, emergency: 20, windowMs: 60_000 },
  { prefix: "/api/cpp/run", normal: 30, elevated: 16, emergency: 8, windowMs: 60_000 },
  { prefix: "/api/questions", normal: 90, elevated: 45, emergency: 20, windowMs: 60_000 },
  { prefix: "/api/tools/github-repo-analyzer", normal: 20, elevated: 10, emergency: 4, windowMs: 60_000 },
];

const jsonWriteApiPrefixes = [
  "/api/ai",
  "/api/ai-review",
  "/api/ai/analyze-mistake",
  "/api/auth/login",
  "/api/auth/register",
  "/api/cpp",
  "/api/progress",
  "/api/quiz/submit",
  "/api/report",
  "/api/reports",
  "/api/tools/github-repo-analyzer",
  "/api/wrong",
];

const emergencyWritableApiPrefixes = [
  "/api/auth/login",
  "/api/auth/logout",
  "/api/auth/2fa",
  "/api/csrf",
  "/api/ai/coach",
];

const apiMethodRules = [
  { prefix: "/api/ai/coach", methods: ["POST"] },
  { prefix: "/api/ai/analyze-mistake", methods: ["POST"] },
  { prefix: "/api/ai-review", methods: ["POST"] },
  { prefix: "/api/ai", methods: ["POST"] },
  { prefix: "/api/auth/login", methods: ["POST"] },
  { prefix: "/api/auth/logout", methods: ["POST"] },
  { prefix: "/api/auth/register", methods: ["POST"] },
  { prefix: "/api/auth/me", methods: ["GET", "HEAD"] },
  { prefix: "/api/csrf", methods: ["GET", "HEAD"] },
  { prefix: "/api/cpp/analyze", methods: ["POST"] },
  { prefix: "/api/cpp/run", methods: ["POST"] },
  { prefix: "/api/questions", methods: ["GET", "HEAD"] },
  { prefix: "/api/quiz/submit", methods: ["POST"] },
  { prefix: "/api/rankings/like", methods: ["POST"] },
  { prefix: "/api/report", methods: ["POST"] },
  { prefix: "/api/stats", methods: ["GET", "HEAD"] },
  { prefix: "/api/tools/github-repo-analyzer", methods: ["POST"] },
];

export function languageRedirectGuard(request: NextRequest, pathname: string) {
  if (!safeMethods.has(request.method) || pathname.startsWith("/api/")) return null;
  if (pathname === "/robots.txt" || pathname === "/sitemap.xml") return null;
  if (/\.[A-Za-z0-9]{2,8}$/.test(pathname)) return null;

  const explicitLanguage = request.nextUrl.searchParams.get("lang");
  if (isSupportedSiteLanguage(explicitLanguage)) return null;

  const preferredLanguage = readLanguageCookie(request) || preferredLanguageFromHeader(request);
  if (!preferredLanguage || preferredLanguage === "en") return null;

  const url = request.nextUrl.clone();
  url.searchParams.set("lang", preferredLanguage);
  return NextResponse.redirect(url);
}

export function isAllowedHost(host: string | null) {
  if (!host) return false;
  const normalized = host.toLowerCase();
  const configuredHosts = (process.env.APP_ALLOWED_HOSTS || "")
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);

  if (configuredHosts.length > 0) {
    return configuredHosts.includes(normalized);
  }

  return (
    normalized === "vantaapi.com" ||
    normalized === "www.vantaapi.com" ||
    normalized.startsWith("localhost:") ||
    normalized.startsWith("127.0.0.1:")
  );
}

function isSameHost(urlValue: string, host: string) {
  try {
    return new URL(urlValue).host.toLowerCase() === host.toLowerCase();
  } catch {
    return false;
  }
}

export function crossSiteGuard(request: NextRequest) {
  if (safeMethods.has(request.method)) return null;

  const host = request.headers.get("host");
  if (!host) return jsonError("Missing host", 400, {}, request);

  const origin = request.headers.get("origin");
  const referer = request.headers.get("referer");
  const fetchSite = request.headers.get("sec-fetch-site");

  if (fetchSite === "cross-site") {
    return jsonError("Cross-site request blocked", 403, {}, request);
  }

  if (origin && !isSameHost(origin, host)) {
    return jsonError("Cross-origin request blocked", 403, {}, request);
  }

  if (!origin && referer && !isSameHost(referer, host)) {
    return jsonError("Cross-origin request blocked", 403, {}, request);
  }

  return null;
}

export function bodySizeGuard(request: NextRequest, pathname: string) {
  if (safeMethods.has(request.method)) return null;

  const contentLength = Number(request.headers.get("content-length") || "0");
  if (!Number.isFinite(contentLength)) return jsonError("Invalid content length", 400, {}, request);

  const maxBytes = pathname.startsWith("/api/admin")
    ? 96 * 1024
    : pathname.startsWith("/api/ai")
      ? 12 * 1024
      : pathname.startsWith("/api/auth")
        ? 8 * 1024
        : 48 * 1024;
  if (contentLength > maxBytes) return jsonError("Request body too large", 413, {}, request);

  return null;
}

export function queryShapeGuard(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  if (params.size > 32) return jsonError("Too many query parameters", 400, {}, request);

  for (const [key, value] of params.entries()) {
    if (key.length > 80 || value.length > 900) return jsonError("Query parameter too large", 400, {}, request);
    if (/^(?:redirect|return|next|url|callback|continue)$/i.test(key) && /^https?:\/\//i.test(value)) {
      return jsonError("External redirect blocked", 400, {}, request);
    }
  }

  return null;
}

export function apiMethodGuard(request: NextRequest, pathname: string) {
  if (!pathname.startsWith("/api/")) return null;
  if (request.method === "OPTIONS") return null;

  const rule = apiMethodRules.find((item) => pathname === item.prefix || pathname.startsWith(`${item.prefix}/`));
  if (!rule) return null;
  if (rule.methods.includes(request.method)) return null;

  return jsonError("Method not allowed", 405, { Allow: rule.methods.join(", ") }, request);
}

export function adminApiCookieGuard(request: NextRequest, pathname: string) {
  if (!pathname.startsWith("/api/admin") || pathname === "/api/admin/login") return null;
  if (request.cookies.get(AUTH_COOKIE)?.value) return null;
  return jsonError("Authentication required", 401, {}, request);
}

export function contentTypeGuard(request: NextRequest, pathname: string) {
  if (safeMethods.has(request.method)) return null;
  const expectsJson = jsonWriteApiPrefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
  if (!expectsJson) return null;

  const contentType = request.headers.get("content-type") || "";
  if (!contentType.toLowerCase().includes("application/json")) {
    return jsonError("Content-Type must be application/json", 415, {}, request);
  }

  return null;
}

export function emergencyWriteGuard(request: NextRequest, pathname: string) {
  if (securityMode() !== "emergency" || safeMethods.has(request.method) || !pathname.startsWith("/api/")) return null;
  const allowed = emergencyWritableApiPrefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
  return allowed ? null : jsonError("Temporarily protected", 503, { "Retry-After": "120" }, request);
}

export function globalRateGuard(request: NextRequest, botVerdict: BotVerdict) {
  const mode = securityMode();
  const ip = getClientIp(request);
  const maxRequests = botVerdict.trustedCrawler
    ? mode === "emergency" ? 240 : 600
    : botVerdict.action === "throttle"
      ? mode === "normal" ? 45 : mode === "elevated" ? 25 : 12
      : mode === "normal" ? 360 : mode === "elevated" ? 180 : 72;
  const bucket = rateLimit(`global:${ip}`, maxRequests, 60_000);
  return bucket.allowed ? null : rateLimitResponse(request, bucket, ip, "global-rate-limit");
}

export function fingerprintRateGuard(request: NextRequest, botVerdict: BotVerdict) {
  if (botVerdict.trustedCrawler) return null;

  const mode = securityMode();
  const unsafe = !safeMethods.has(request.method);
  const fingerprint = stableHash([
    request.headers.get("user-agent") || "",
    request.headers.get("accept-language") || "",
    request.headers.get("accept") || "",
    request.headers.get("sec-ch-ua-platform") || "",
  ].join("|"));
  const limit = unsafe
    ? mode === "normal" ? 180 : mode === "elevated" ? 80 : 32
    : mode === "normal" ? 720 : mode === "elevated" ? 320 : 120;
  const bucket = rateLimit(`fingerprint:${fingerprint}:${unsafe ? "write" : "read"}`, limit, 60_000);
  return bucket.allowed ? null : rateLimitResponse(request, bucket, getClientIp(request), "fingerprint-rate-limit");
}

export function expensiveApiGuard(request: NextRequest, pathname: string) {
  if (safeMethods.has(request.method)) return null;

  const mode = securityMode();
  const rule = expensiveApiRules.find((item) => pathname === item.prefix || pathname.startsWith(`${item.prefix}/`));
  if (!rule) return null;

  const ip = getClientIp(request);
  const maxRequests = rule[mode];
  const bucket = rateLimit(`expensive:${rule.prefix}:${ip}`, maxRequests, rule.windowMs);
  return bucket.allowed ? null : rateLimitResponse(request, bucket, ip, "expensive-api-rate-limit");
}

export function apiRateGuard(request: NextRequest, pathname: string) {
  const ip = getClientIp(request);
  const unsafe = !safeMethods.has(request.method);
  const mode = securityMode();
  const windowMs = pathname.startsWith("/api/auth") ? 15 * 60_000 : 60_000;
  const baseLimit = pathname.startsWith("/api/auth/login")
    ? 30
    : pathname.startsWith("/api/auth")
      ? 60
      : unsafe
        ? 120
        : 240;
  const maxRequests = mode === "normal" ? baseLimit : mode === "elevated" ? Math.ceil(baseLimit * 0.55) : Math.ceil(baseLimit * 0.28);
  const bucket = rateLimit(`api:${pathname}:${ip}`, maxRequests, windowMs);

  return bucket.allowed ? null : rateLimitResponse(request, bucket, ip, "api-rate-limit");
}

export function pageRateGuard(request: NextRequest, pathname: string, botVerdict: BotVerdict) {
  if (!safeMethods.has(request.method) || pathname.startsWith("/api/")) return null;

  const ip = getBotClientIp(request);
  const mode = securityMode();
  const baseLimit = botVerdict.trustedCrawler
    ? 600
    : botVerdict.action === "throttle"
      ? 30
      : pathname.startsWith("/programming") || pathname.startsWith("/english/vocabulary")
        ? 160
        : 240;
  const maxRequests = botVerdict.trustedCrawler
    ? mode === "emergency" ? 240 : baseLimit
    : mode === "normal" ? baseLimit : mode === "elevated" ? Math.ceil(baseLimit * 0.55) : Math.ceil(baseLimit * 0.25);
  const bucket = rateLimit(`page:${ip}`, maxRequests, 60_000);

  return bucket.allowed ? null : rateLimitResponse(request, bucket, ip, "page-rate-limit");
}

function retiredRouteTarget(pathname: string) {
  if (pathname === "/games" || pathname.startsWith("/games/")) return "/";
  if (pathname === "/projects" || pathname.startsWith("/projects/")) return "/tools/github-repo-analyzer";
  if (pathname === "/questions" || pathname.startsWith("/questions/")) return "/tools/github-repo-analyzer";
  if (pathname === "/report" || pathname.startsWith("/report/")) return "/tools/github-repo-analyzer";
  return null;
}

export function retiredRouteRedirectGuard(request: NextRequest, pathname: string) {
  if (!safeMethods.has(request.method) || pathname.startsWith("/api/")) return null;
  const target = retiredRouteTarget(pathname);
  if (!target) return null;

  const url = new URL(target, request.url);
  const language = securityLanguage(request);
  if (language !== "en") url.searchParams.set("lang", language);
  return NextResponse.redirect(url);
}

export function authRedirectGuard(request: NextRequest, pathname: string) {
  const needsLogin = protectedPages.some((path) => pathname === path || pathname.startsWith(`${path}/`));
  if (!needsLogin || request.cookies.get(AUTH_COOKIE)?.value) return null;

  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("next", `${pathname}${request.nextUrl.search}`);
  const language = securityLanguage(request);
  if (language !== "en") loginUrl.searchParams.set("lang", language);
  return NextResponse.redirect(loginUrl);
}
