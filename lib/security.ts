import { NextRequest } from "next/server";
import crypto from "crypto";
import { checkRedisRateLimit } from "@/lib/redis";

const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const MAX_RATE_LIMIT_BUCKETS = 20_000;

function cleanupRateLimits(now: number) {
  if (rateLimitMap.size < MAX_RATE_LIMIT_BUCKETS) return;
  for (const [key, record] of rateLimitMap) {
    if (record.resetTime < now) rateLimitMap.delete(key);
  }
}

export function getRateLimitKey(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  const ip = forwarded?.split(",")[0]?.trim() || realIp || "unknown";
  return crypto.createHash("sha256").update(ip).digest("hex").slice(0, 16);
}

export function checkRateLimit(
  key: string,
  maxRequests: number = 10,
  windowMs: number = 60000
): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  cleanupRateLimits(now);
  const record = rateLimitMap.get(key);

  if (!record || now > record.resetTime) {
    const resetTime = now + windowMs;
    rateLimitMap.set(key, { count: 1, resetTime });
    return { allowed: true, remaining: maxRequests - 1, resetTime };
  }

  if (record.count >= maxRequests) {
    return { allowed: false, remaining: 0, resetTime: record.resetTime };
  }

  record.count++;
  return { allowed: true, remaining: maxRequests - record.count, resetTime: record.resetTime };
}

export async function checkRateLimitAsync(
  key: string,
  maxRequests: number = 10,
  windowMs: number = 60000
): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
  if (process.env.REDIS_URL || process.env.ENABLE_REDIS_RATE_LIMITS === "true") {
    const result = await checkRedisRateLimit(key, maxRequests, windowMs);
    return { allowed: result.allowed, remaining: result.remaining, resetTime: result.resetAt };
  }

  return checkRateLimit(key, maxRequests, windowMs);
}

export function getEmailRateLimitKey(request: NextRequest, email: string): string {
  return `${getRateLimitKey(request)}:${crypto
    .createHash("sha256")
    .update(email.trim().toLowerCase())
    .digest("hex")
    .slice(0, 16)}`;
}

export function sanitizeInput(input: string): string {
  if (typeof input !== "string") return "";
  return input
    .replace(/<[^>]*>/g, "")
    .replace(/[<>'"]/g, "")
    .replace(/javascript:/gi, "")
    .replace(/data:/gi, "")
    .replace(/vbscript:/gi, "")
    .replace(/on\w+\s*=/gi, "")
    .replace(/iframe|script|object|embed|applet|meta|link|style/gi, "")
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
  const received = Buffer.from(signature, "hex");
  const expectedBuffer = Buffer.from(expected, "hex");
  if (received.length !== expectedBuffer.length) return false;
  return crypto.timingSafeEqual(received, expectedBuffer);
}
