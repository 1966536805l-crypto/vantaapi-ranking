import { NextRequest } from "next/server";
import { botBlockedResponse, evaluateBotRequest } from "@/lib/bot-protection";
import { localizedSecurityMessage, securityLanguage } from "@/lib/proxy/language";
import { getClientIp, penaltyGuard, rememberPenalty } from "@/lib/proxy/rate-limit";
import { jsonError, nextWithRequestLanguage, withSecurityHeaders, generateNonce } from "@/lib/proxy/response";
import {
  adminApiCookieGuard,
  allowedMethods,
  apiMethodGuard,
  apiRateGuard,
  authRedirectGuard,
  bodySizeGuard,
  contentTypeGuard,
  crossSiteGuard,
  emergencyWriteGuard,
  expensiveApiGuard,
  fingerprintRateGuard,
  globalRateGuard,
  isAllowedHost,
  languageRedirectGuard,
  pageRateGuard,
  queryShapeGuard,
  retiredRouteRedirectGuard,
} from "@/lib/proxy/guards";

export default function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const host = request.headers.get("host");

  if (!isAllowedHost(host)) {
    return jsonError("Host not allowed", 421, {}, request);
  }

  if (!allowedMethods.has(request.method)) {
    return jsonError("Method not allowed", 405, { Allow: Array.from(allowedMethods).join(", ") }, request);
  }

  const botVerdict = evaluateBotRequest(request, pathname);
  if (botVerdict.action === "block" || botVerdict.action === "trap") {
    rememberPenalty(getClientIp(request), botVerdict.reason, botVerdict.action === "trap" ? 3 : 2);
    return withSecurityHeaders(botBlockedResponse(botVerdict, localizedSecurityMessage("Request blocked", botVerdict.action === "trap" ? 404 : 403, securityLanguage(request))), botVerdict);
  }

  const penaltyBlocked = penaltyGuard(request);
  if (penaltyBlocked) return withSecurityHeaders(penaltyBlocked, botVerdict);

  const globalRateBlocked = globalRateGuard(request, botVerdict);
  if (globalRateBlocked) return withSecurityHeaders(globalRateBlocked, botVerdict);

  const fingerprintRateBlocked = fingerprintRateGuard(request, botVerdict);
  if (fingerprintRateBlocked) return withSecurityHeaders(fingerprintRateBlocked, botVerdict);

  const queryBlocked = queryShapeGuard(request);
  if (queryBlocked) return queryBlocked;

  const pageRateBlocked = pageRateGuard(request, pathname, botVerdict);
  if (pageRateBlocked) return pageRateBlocked;

  const retiredRedirect = retiredRouteRedirectGuard(request, pathname);
  if (retiredRedirect) return withSecurityHeaders(retiredRedirect, botVerdict);

  const languageRedirect = languageRedirectGuard(request, pathname);
  if (languageRedirect) return withSecurityHeaders(languageRedirect, botVerdict);

  if (pathname.startsWith("/api/")) {
    if (botVerdict.action === "throttle") {
      rememberPenalty(getClientIp(request), botVerdict.reason, 1);
      return withSecurityHeaders(botBlockedResponse(botVerdict, localizedSecurityMessage("Too many requests", 429, securityLanguage(request))), botVerdict);
    }

    const methodBlocked = apiMethodGuard(request, pathname);
    if (methodBlocked) return methodBlocked;

    const adminCookieBlocked = adminApiCookieGuard(request, pathname);
    if (adminCookieBlocked) return adminCookieBlocked;

    const bodyBlocked = bodySizeGuard(request, pathname);
    if (bodyBlocked) return bodyBlocked;

    const contentTypeBlocked = contentTypeGuard(request, pathname);
    if (contentTypeBlocked) return contentTypeBlocked;

    const crossSiteBlocked = crossSiteGuard(request);
    if (crossSiteBlocked) return crossSiteBlocked;

    const emergencyBlocked = emergencyWriteGuard(request, pathname);
    if (emergencyBlocked) return emergencyBlocked;

    const expensiveApiBlocked = expensiveApiGuard(request, pathname);
    if (expensiveApiBlocked) return expensiveApiBlocked;

    const rateBlocked = apiRateGuard(request, pathname);
    if (rateBlocked) return rateBlocked;
  }

  const authRedirect = authRedirectGuard(request, pathname);
  if (authRedirect) return withSecurityHeaders(authRedirect, botVerdict);

  return nextWithRequestLanguage(request, botVerdict);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)"],
};
