import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE } from "@/lib/auth-constants";
import { botBlockedResponse, evaluateBotRequest, getBotClientIp, withBotHeaders, type BotVerdict } from "@/lib/bot-protection";

const protectedPages = ["/dashboard", "/progress", "/wrong", "/admin"];
const safeMethods = new Set(["GET", "HEAD", "OPTIONS"]);
const allowedMethods = new Set(["GET", "HEAD", "OPTIONS", "POST", "PUT", "PATCH", "DELETE"]);
const rateBuckets = new Map<string, { count: number; resetTime: number }>();
type SecurityMode = "normal" | "elevated" | "emergency";

const expensiveApiRules = [
  { prefix: "/api/ai/coach", normal: 24, elevated: 12, emergency: 6, windowMs: 60_000 },
  { prefix: "/api/auth/login", normal: 18, elevated: 10, emergency: 6, windowMs: 15 * 60_000 },
  { prefix: "/api/auth/register", normal: 8, elevated: 4, emergency: 2, windowMs: 60 * 60_000 },
  { prefix: "/api/quiz/submit", normal: 80, elevated: 40, emergency: 20, windowMs: 60_000 },
  { prefix: "/api/cpp/run", normal: 30, elevated: 16, emergency: 8, windowMs: 60_000 },
];

function getClientIp(request: NextRequest) {
  return getBotClientIp(request);
}

function securityMode(): SecurityMode {
  const value = (process.env.SECURITY_MODE || process.env.DDOS_MODE || "normal").toLowerCase();
  if (value === "emergency" || value === "lockdown") return "emergency";
  if (value === "elevated" || value === "attack") return "elevated";
  return "normal";
}

function rateLimit(key: string, maxRequests: number, windowMs: number) {
  const now = Date.now();
  const current = rateBuckets.get(key);

  if (rateBuckets.size > 10_000) {
    for (const [bucketKey, bucket] of rateBuckets) {
      if (bucket.resetTime < now) rateBuckets.delete(bucketKey);
    }
  }

  if (!current || current.resetTime < now) {
    const resetTime = now + windowMs;
    rateBuckets.set(key, { count: 1, resetTime });
    return { allowed: true, remaining: maxRequests - 1, resetTime };
  }

  if (current.count >= maxRequests) {
    return { allowed: false, remaining: 0, resetTime: current.resetTime };
  }

  current.count += 1;
  return { allowed: true, remaining: maxRequests - current.count, resetTime: current.resetTime };
}

function jsonError(message: string, status: number, extraHeaders: Record<string, string> = {}) {
  const response = NextResponse.json({ message }, { status });
  for (const [key, value] of Object.entries(extraHeaders)) response.headers.set(key, value);
  return withSecurityHeaders(response);
}

function rateLimitResponse(bucket: { resetTime: number }) {
  const retryAfter = Math.max(1, Math.ceil((bucket.resetTime - Date.now()) / 1000));
  return jsonError("Too many requests", 429, {
    "Retry-After": String(retryAfter),
    "X-RateLimit-Reset": String(Math.ceil(bucket.resetTime / 1000)),
  });
}

function withSecurityHeaders(response: NextResponse, botVerdict?: BotVerdict) {
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Permitted-Cross-Domain-Policies", "none");
  response.headers.set("X-Download-Options", "noopen");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=(), usb=(), bluetooth=(), accelerometer=(), gyroscope=(), magnetometer=(), serial=(), browsing-topics=()");
  response.headers.set("X-Security-Mode", securityMode());
  if (response.headers.get("content-type")?.includes("application/json")) {
    response.headers.set("Cache-Control", "no-store");
    response.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
  }
  return withBotHeaders(response, botVerdict);
}

function isAllowedHost(host: string | null) {
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

function crossSiteGuard(request: NextRequest) {
  if (safeMethods.has(request.method)) return null;

  const host = request.headers.get("host");
  if (!host) return jsonError("Missing host", 400);

  const origin = request.headers.get("origin");
  const referer = request.headers.get("referer");
  const fetchSite = request.headers.get("sec-fetch-site");

  if (fetchSite === "cross-site") {
    return jsonError("Cross-site request blocked", 403);
  }

  if (origin && !isSameHost(origin, host)) {
    return jsonError("Cross-origin request blocked", 403);
  }

  if (!origin && referer && !isSameHost(referer, host)) {
    return jsonError("Cross-origin request blocked", 403);
  }

  return null;
}

function bodySizeGuard(request: NextRequest, pathname: string) {
  if (safeMethods.has(request.method)) return null;

  const contentLength = Number(request.headers.get("content-length") || "0");
  if (!Number.isFinite(contentLength)) return jsonError("Invalid content length", 400);

  const maxBytes = pathname.startsWith("/api/admin") ? 128 * 1024 : 64 * 1024;
  if (contentLength > maxBytes) return jsonError("Request body too large", 413);

  return null;
}

function globalRateGuard(request: NextRequest, botVerdict: BotVerdict) {
  const mode = securityMode();
  const ip = getClientIp(request);
  const maxRequests = botVerdict.trustedCrawler
    ? mode === "emergency" ? 240 : 600
    : botVerdict.action === "throttle"
      ? mode === "normal" ? 45 : mode === "elevated" ? 25 : 12
      : mode === "normal" ? 360 : mode === "elevated" ? 180 : 72;
  const bucket = rateLimit(`global:${ip}`, maxRequests, 60_000);
  return bucket.allowed ? null : rateLimitResponse(bucket);
}

function expensiveApiGuard(request: NextRequest, pathname: string) {
  if (safeMethods.has(request.method)) return null;

  const mode = securityMode();
  const rule = expensiveApiRules.find((item) => pathname === item.prefix || pathname.startsWith(`${item.prefix}/`));
  if (!rule) return null;

  const ip = getClientIp(request);
  const maxRequests = rule[mode];
  const bucket = rateLimit(`expensive:${rule.prefix}:${ip}`, maxRequests, rule.windowMs);
  return bucket.allowed ? null : rateLimitResponse(bucket);
}

function apiRateGuard(request: NextRequest, pathname: string) {
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

  return bucket.allowed ? null : rateLimitResponse(bucket);
}

function pageRateGuard(request: NextRequest, pathname: string, botVerdict: BotVerdict) {
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

  return bucket.allowed ? null : rateLimitResponse(bucket);
}

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const host = request.headers.get("host");

  if (!isAllowedHost(host)) {
    return jsonError("Host not allowed", 421);
  }

  if (!allowedMethods.has(request.method)) {
    return jsonError("Method not allowed", 405, { Allow: Array.from(allowedMethods).join(", ") });
  }

  const botVerdict = evaluateBotRequest(request, pathname);
  if (botVerdict.action === "block" || botVerdict.action === "trap") {
    return withSecurityHeaders(botBlockedResponse(botVerdict), botVerdict);
  }

  const globalRateBlocked = globalRateGuard(request, botVerdict);
  if (globalRateBlocked) return withSecurityHeaders(globalRateBlocked, botVerdict);

  const pageRateBlocked = pageRateGuard(request, pathname, botVerdict);
  if (pageRateBlocked) return pageRateBlocked;

  if (pathname.startsWith("/api/")) {
    if (botVerdict.action === "throttle") {
      return withSecurityHeaders(botBlockedResponse(botVerdict), botVerdict);
    }

    const bodyBlocked = bodySizeGuard(request, pathname);
    if (bodyBlocked) return bodyBlocked;

    const crossSiteBlocked = crossSiteGuard(request);
    if (crossSiteBlocked) return crossSiteBlocked;

    const expensiveApiBlocked = expensiveApiGuard(request, pathname);
    if (expensiveApiBlocked) return expensiveApiBlocked;

    const rateBlocked = apiRateGuard(request, pathname);
    if (rateBlocked) return rateBlocked;
  }

  const needsLogin = protectedPages.some((path) => pathname === path || pathname.startsWith(`${path}/`));
  if (needsLogin && !request.cookies.get(AUTH_COOKIE)?.value) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return withSecurityHeaders(NextResponse.redirect(loginUrl), botVerdict);
  }

  return withSecurityHeaders(NextResponse.next(), botVerdict);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)"],
};
