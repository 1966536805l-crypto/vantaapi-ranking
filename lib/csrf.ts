import { NextRequest } from "next/server";
import crypto from "crypto";

const CSRF_SECRET = process.env.CSRF_SECRET || "change-this-csrf-secret-in-production";
const CSRF_TOKEN_LENGTH = 32;

/**
 * 生成 CSRF Token
 */
export function generateCsrfToken(): string {
  return crypto.randomBytes(CSRF_TOKEN_LENGTH).toString("hex");
}

/**
 * 创建 CSRF Token 签名
 */
export function signCsrfToken(token: string): string {
  return crypto
    .createHmac("sha256", CSRF_SECRET)
    .update(token)
    .digest("hex");
}

/**
 * 验证 CSRF Token
 */
export function verifyCsrfToken(token: string, signature: string): boolean {
  if (!token || !signature) {
    return false;
  }

  const expectedSignature = signCsrfToken(token);

  try {
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  } catch {
    return false;
  }
}

/**
 * 从请求中提取 CSRF Token
 */
export function extractCsrfToken(request: NextRequest): {
  token: string | null;
  signature: string | null;
} {
  // 优先从 Header 获取
  const headerToken = request.headers.get("x-csrf-token");
  const headerSignature = request.headers.get("x-csrf-signature");

  if (headerToken && headerSignature) {
    return { token: headerToken, signature: headerSignature };
  }

  // 从 Cookie 获取
  const cookieToken = request.cookies.get("csrf-token")?.value || null;
  const cookieSignature = request.cookies.get("csrf-signature")?.value || null;

  return { token: cookieToken, signature: cookieSignature };
}

/**
 * 验证请求的 CSRF Token
 */
export function validateCsrfRequest(request: NextRequest): boolean {
  // GET、HEAD、OPTIONS 请求不需要 CSRF 验证
  if (["GET", "HEAD", "OPTIONS"].includes(request.method)) {
    return true;
  }

  // 验证 Origin/Referer
  const origin = request.headers.get("origin");
  const referer = request.headers.get("referer");
  const host = request.headers.get("host");

  // 如果有 Origin，验证是否匹配
  if (origin) {
    const originHost = new URL(origin).host;
    if (originHost !== host) {
      return false;
    }
  }

  // 如果有 Referer，验证是否匹配
  if (referer) {
    const refererHost = new URL(referer).host;
    if (refererHost !== host) {
      return false;
    }
  }

  // 验证 CSRF Token
  const { token, signature } = extractCsrfToken(request);

  if (!token || !signature) {
    return false;
  }

  return verifyCsrfToken(token, signature);
}

/**
 * CSRF 中间件
 */
export function csrfMiddleware(request: NextRequest): {
  valid: boolean;
  error?: string;
} {
  const isValid = validateCsrfRequest(request);

  if (!isValid) {
    return {
      valid: false,
      error: "CSRF validation failed",
    };
  }

  return { valid: true };
}
