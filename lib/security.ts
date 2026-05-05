import { NextRequest } from "next/server";
import crypto from "crypto";

const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export function getRateLimitKey(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0] : "unknown";
  return crypto.createHash("sha256").update(ip).digest("hex").slice(0, 16);
}

export function checkRateLimit(
  key: string,
  maxRequests: number = 10,
  windowMs: number = 60000
): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const record = rateLimitMap.get(key);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + windowMs });
    return { allowed: true, remaining: maxRequests - 1 };
  }

  if (record.count >= maxRequests) {
    return { allowed: false, remaining: 0 };
  }

  record.count++;
  return { allowed: true, remaining: maxRequests - record.count };
}

export function sanitizeInput(input: string): string {
  if (typeof input !== "string") return "";
  return input
    // 移除所有 HTML 标签
    .replace(/<[^>]*>/g, "")
    // 移除危险字符
    .replace(/[<>'"]/g, "")
    // 移除 javascript: 协议
    .replace(/javascript:/gi, "")
    .replace(/data:/gi, "")
    .replace(/vbscript:/gi, "")
    // 移除事件处理器
    .replace(/on\w+\s*=/gi, "")
    // 移除 iframe、script、object、embed 等标签名
    .replace(/iframe|script|object|embed|applet|meta|link|style/gi, "")
    // 移除 SQL 注入常见字符
    .replace(/[;\\]/g, "")
    .trim()
    .slice(0, 1000);
}

export function validateEmail(email: string): boolean {
  if (typeof email !== "string") return false;
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email) && email.length <= 254;
}

export function validateUsername(username: string): boolean {
  if (typeof username !== "string") return false;
  const usernameRegex = /^[a-zA-Z0-9_-]{3,30}$/;
  return usernameRegex.test(username);
}

export function sanitizeHtml(input: string): string {
  // 更严格的 HTML 清理，用于富文本内容
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "")
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, "")
    .replace(/<embed[^>]*>/gi, "")
    .replace(/<applet[^>]*>/gi, "")
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, "")
    .replace(/on\w+\s*=\s*[^\s>]*/gi, "")
    .replace(/javascript:/gi, "")
    .replace(/data:text\/html/gi, "")
    .trim()
    .slice(0, 5000);
}

export function validateUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return ["http:", "https:"].includes(parsed.protocol);
  } catch {
    return false;
  }
}

export function generateRequestSignature(data: string, secret: string): string {
  return crypto.createHmac("sha256", secret).update(data).digest("hex");
}

export function verifyRequestSignature(
  data: string,
  signature: string,
  secret: string
): boolean {
  const expected = generateRequestSignature(data, secret);
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expected)
  );
}
