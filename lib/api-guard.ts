import { NextRequest, NextResponse } from "next/server";
import { validateCsrfRequest } from "@/lib/csrf";
import { checkRateLimit, checkRateLimitAsync, getRateLimitKey } from "@/lib/security";

export function jsonError(message: string, status = 400) {
  return NextResponse.json(
    { success: false, message, error: message },
    {
      status,
      headers: {
        "Cache-Control": "no-store",
      },
    }
  );
}

export function guardedJson<T>(data: T, init?: ResponseInit) {
  return NextResponse.json(data, {
    ...init,
    headers: {
      "Cache-Control": "no-store",
      ...(init?.headers ?? {}),
    },
  });
}

export async function readJsonBody<T = unknown>(
  request: NextRequest,
  maxBytes = 64 * 1024
): Promise<{ ok: true; body: T } | { ok: false; response: NextResponse }> {
  const contentType = request.headers.get("content-type") || "";
  if (!contentType.toLowerCase().includes("application/json")) {
    return { ok: false, response: jsonError("Content-Type must be application/json", 415) };
  }

  const contentLength = Number(request.headers.get("content-length") || "0");
  if (contentLength > maxBytes) {
    return { ok: false, response: jsonError("Request body too large", 413) };
  }

  try {
    const body = (await request.json()) as T;
    return { ok: true, body };
  } catch {
    return { ok: false, response: jsonError("Invalid JSON body", 400) };
  }
}

export function enforceRateLimit(
  request: NextRequest,
  maxRequests = 30,
  windowMs = 60_000,
  keySuffix = ""
): NextResponse | null {
  const key = `${getRateLimitKey(request)}:${keySuffix}`;
  const result = checkRateLimit(key, maxRequests, windowMs);

  if (result.allowed) return null;

  return NextResponse.json(
    { success: false, error: "Too many requests / 请求过于频繁" },
    {
      status: 429,
      headers: {
        "Retry-After": String(Math.ceil(windowMs / 1000)),
        "X-RateLimit-Reset": String(Math.ceil(result.resetTime / 1000)),
        "Cache-Control": "no-store",
      },
    }
  );
}

export function requireSameOrigin(request: NextRequest): NextResponse | null {
  if (["GET", "HEAD", "OPTIONS"].includes(request.method)) return null;

  const host = request.headers.get("host");
  const origin = request.headers.get("origin");
  const referer = request.headers.get("referer");

  try {
    if (origin && new URL(origin).host !== host) {
      return jsonError("Cross-origin request blocked", 403);
    }
    if (!origin && referer && new URL(referer).host !== host) {
      return jsonError("Cross-origin request blocked", 403);
    }
  } catch {
    return jsonError("Invalid origin", 403);
  }

  return null;
}

export function requireCsrf(request: NextRequest): NextResponse | null {
  if (validateCsrfRequest(request)) return null;
  return jsonError("CSRF validation failed", 403);
}

export async function enforceRateLimitAsync(
  request: NextRequest,
  maxRequests = 30,
  windowMs = 60_000,
  keySuffix = ""
): Promise<NextResponse | null> {
  const key = `${getRateLimitKey(request)}:${keySuffix}`;
  const result = await checkRateLimitAsync(key, maxRequests, windowMs);

  if (result.allowed) return null;

  return NextResponse.json(
    { success: false, error: "Too many requests / 请求过于频繁" },
    {
      status: 429,
      headers: {
        "Retry-After": String(Math.max(1, Math.ceil((result.resetTime - Date.now()) / 1000))),
        "X-RateLimit-Reset": String(Math.ceil(result.resetTime / 1000)),
        "Cache-Control": "no-store",
      },
    }
  );
}

export function sanitizeText(value: string, maxLength = 4000): string {
  return value
    .replace(/[\u0000-\u001f\u007f]/g, "")
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<iframe\b[^>]*>[\s\S]*?<\/iframe>/gi, "")
    .trim()
    .slice(0, maxLength);
}
