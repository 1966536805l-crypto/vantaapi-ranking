import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

const CSRF_TOKEN_LENGTH = 32;
const CSRF_TOKEN_COOKIE = "csrf-token";
const CSRF_SIGNATURE_COOKIE = "csrf-signature";
const CSRF_HEADER = "x-csrf-token";
const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

function getCsrfSecret() {
  const secret = process.env.CSRF_SECRET || process.env.JWT_SECRET;
  if (!secret && process.env.NODE_ENV === "production") {
    throw new Error("CSRF_SECRET is required in production");
  }
  return secret || "dev-csrf-secret-change-me";
}

export function generateCsrfToken(): string {
  return crypto.randomBytes(CSRF_TOKEN_LENGTH).toString("hex");
}

export function signCsrfToken(token: string): string {
  return crypto.createHmac("sha256", getCsrfSecret()).update(token).digest("hex");
}

export function verifyCsrfToken(token: string, signature: string): boolean {
  if (!token || !signature) return false;
  const expectedSignature = signCsrfToken(token);
  try {
    const expected = Buffer.from(expectedSignature, "hex");
    const received = Buffer.from(signature, "hex");
    return expected.length === received.length && crypto.timingSafeEqual(received, expected);
  } catch {
    return false;
  }
}

function sameHost(urlValue: string, host: string) {
  try {
    return new URL(urlValue).host.toLowerCase() === host.toLowerCase();
  } catch {
    return false;
  }
}

export function setCsrfCookies(response: NextResponse, token = generateCsrfToken()) {
  const secure = process.env.NODE_ENV === "production";
  response.cookies.set(CSRF_TOKEN_COOKIE, token, {
    httpOnly: false,
    sameSite: "strict",
    secure,
    path: "/",
    maxAge: 60 * 60 * 12,
    priority: "high",
  });
  response.cookies.set(CSRF_SIGNATURE_COOKIE, signCsrfToken(token), {
    httpOnly: true,
    sameSite: "strict",
    secure,
    path: "/",
    maxAge: 60 * 60 * 12,
    priority: "high",
  });
  return token;
}

export function createCsrfResponse() {
  const token = generateCsrfToken();
  const response = NextResponse.json({ csrfToken: token }, { headers: { "Cache-Control": "no-store" } });
  setCsrfCookies(response, token);
  return response;
}

export function validateCsrfRequest(request: NextRequest): boolean {
  if (SAFE_METHODS.has(request.method)) return true;

  const host = request.headers.get("host");
  if (!host) return false;

  const fetchSite = request.headers.get("sec-fetch-site");
  if (fetchSite === "cross-site") return false;

  const origin = request.headers.get("origin");
  const referer = request.headers.get("referer");
  if (origin && !sameHost(origin, host)) return false;
  if (!origin && referer && !sameHost(referer, host)) return false;

  const headerToken = request.headers.get(CSRF_HEADER);
  const cookieToken = request.cookies.get(CSRF_TOKEN_COOKIE)?.value || "";
  const cookieSignature = request.cookies.get(CSRF_SIGNATURE_COOKIE)?.value || "";

  if (!headerToken || !cookieToken || headerToken !== cookieToken || !cookieSignature) return false;
  return verifyCsrfToken(cookieToken, cookieSignature);
}

export function csrfMiddleware(request: NextRequest): { valid: boolean; error?: string } {
  if (validateCsrfRequest(request)) return { valid: true };
  return { valid: false, error: "CSRF validation failed" };
}
