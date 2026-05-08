import { NextRequest, NextResponse } from "next/server";
import { withBotHeaders, type BotVerdict } from "@/lib/bot-protection";
import { localizedSecurityMessage, securityLanguage, withLanguagePreference } from "@/lib/proxy/language";

export type SecurityMode = "normal" | "elevated" | "emergency";

export function securityMode(): SecurityMode {
  const value = (process.env.SECURITY_MODE || process.env.DDOS_MODE || "normal").toLowerCase();
  if (value === "emergency" || value === "lockdown") return "emergency";
  if (value === "elevated" || value === "attack") return "elevated";
  return "normal";
}

export function jsonError(message: string, status: number, extraHeaders: Record<string, string> = {}, request?: NextRequest) {
  const response = NextResponse.json({ message: request ? localizedSecurityMessage(message, status, securityLanguage(request)) : message }, { status });
  for (const [key, value] of Object.entries(extraHeaders)) response.headers.set(key, value);
  return withSecurityHeaders(response);
}

export function withSecurityHeaders(response: NextResponse, botVerdict?: BotVerdict) {
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

export function nextWithRequestLanguage(request: NextRequest, botVerdict: BotVerdict) {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-jinming-language", securityLanguage(request));
  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
  return withLanguagePreference(withSecurityHeaders(response, botVerdict), request);
}
