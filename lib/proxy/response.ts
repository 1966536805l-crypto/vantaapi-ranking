import { NextRequest, NextResponse } from "next/server";
import { withBotHeaders, type BotVerdict } from "@/lib/bot-protection";
import { localizedSecurityMessage, securityLanguage, withLanguagePreference } from "@/lib/proxy/language";

export type SecurityMode = "normal" | "elevated" | "emergency";

export function generateNonce(): string {
  return Buffer.from(crypto.getRandomValues(new Uint8Array(16))).toString('base64');
}

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

export function withSecurityHeaders(response: NextResponse, botVerdict?: BotVerdict, nonce?: string) {
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Permitted-Cross-Domain-Policies", "none");
  response.headers.set("X-Download-Options", "noopen");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=(), usb=(), bluetooth=(), accelerometer=(), gyroscope=(), magnetometer=(), serial=(), browsing-topics=()");
  response.headers.set("X-Security-Mode", securityMode());

  // Set CSP with nonce if provided
  if (nonce) {
    const isDev = process.env.NODE_ENV !== "production";
    const hasTurnstile = Boolean(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY);
    const csp = [
      "default-src 'self'",
      isDev
        ? `script-src 'self' 'unsafe-eval' 'unsafe-inline'${hasTurnstile ? " https://challenges.cloudflare.com" : ""}`
        : `script-src 'self' 'nonce-${nonce}'${hasTurnstile ? " https://challenges.cloudflare.com" : ""}`,
      isDev ? "style-src 'self' 'unsafe-inline'" : `style-src 'self' 'nonce-${nonce}'`,
      "img-src 'self' data: blob: https:",
      "font-src 'self' data:",
      `connect-src 'self'${hasTurnstile ? " https://challenges.cloudflare.com" : ""}`,
      "media-src 'self' data: blob:",
      hasTurnstile ? "frame-src https://challenges.cloudflare.com" : "frame-src 'none'",
      "child-src 'none'",
      "worker-src 'self' blob:",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "object-src 'none'",
      "manifest-src 'self'",
      "upgrade-insecure-requests",
    ].join("; ");
    response.headers.set("Content-Security-Policy", csp);
  }

  if (response.headers.get("content-type")?.includes("application/json")) {
    response.headers.set("Cache-Control", "no-store");
    response.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
  }
  return withBotHeaders(response, botVerdict);
}

export function nextWithRequestLanguage(request: NextRequest, botVerdict: BotVerdict) {
  const requestHeaders = new Headers(request.headers);
  // Force English for /english page regardless of cookies or headers
  const pathname = request.nextUrl.pathname;
  const language = pathname === "/english" ? "en" : securityLanguage(request);
  requestHeaders.set("x-jinming-language", language);

  // Generate nonce for CSP
  const nonce = generateNonce();
  requestHeaders.set("x-nonce", nonce);

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
  return withLanguagePreference(withSecurityHeaders(response, botVerdict, nonce), request);
}
