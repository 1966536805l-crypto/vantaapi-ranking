import { NextRequest } from "next/server";
import { getBotClientIp } from "@/lib/bot-protection";
import { jsonError, securityMode } from "@/lib/proxy/response";

const rateBuckets = new Map<string, { count: number; resetTime: number }>();
const penaltyBuckets = new Map<string, { blockedUntil: number; level: number; resetTime: number; reason: string }>();

export function getClientIp(request: NextRequest) {
  return getBotClientIp(request);
}

export function stableHash(value: string) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(36);
}

export function rateLimit(key: string, maxRequests: number, windowMs: number) {
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

function cleanupPenalties(now: number) {
  if (penaltyBuckets.size < 10_000) return;
  for (const [key, penalty] of penaltyBuckets) {
    if (penalty.resetTime < now && penalty.blockedUntil < now) penaltyBuckets.delete(key);
  }
}

export function rememberPenalty(ip: string, reason: string, severity = 1) {
  const now = Date.now();
  cleanupPenalties(now);
  const current = penaltyBuckets.get(ip);
  const mode = securityMode();
  const baseMs = mode === "normal" ? 30_000 : mode === "elevated" ? 90_000 : 180_000;

  if (!current || current.resetTime < now) {
    const level = severity;
    const blockedUntil = now + Math.min(baseMs * level, 15 * 60_000);
    penaltyBuckets.set(ip, { blockedUntil, level, resetTime: now + 30 * 60_000, reason });
    return { blockedUntil, level, reason };
  }

  current.level = Math.min(current.level + severity, 8);
  current.blockedUntil = now + Math.min(baseMs * current.level, 15 * 60_000);
  current.resetTime = now + 30 * 60_000;
  current.reason = reason;
  return current;
}

export function penaltyGuard(request: NextRequest) {
  const ip = getClientIp(request);
  const penalty = penaltyBuckets.get(ip);
  if (!penalty) return null;

  const now = Date.now();
  if (penalty.blockedUntil <= now) return null;

  return jsonError("Temporarily rate limited", 429, {
    "Retry-After": String(Math.max(1, Math.ceil((penalty.blockedUntil - now) / 1000))),
    "X-Abuse-Protection": "penalty-box",
  }, request);
}

export function rateLimitResponse(request: NextRequest, bucket: { resetTime: number }, ip?: string, reason = "rate-limit") {
  const penalty = ip ? rememberPenalty(ip, reason) : null;
  const resetTime = penalty ? Math.max(bucket.resetTime, penalty.blockedUntil) : bucket.resetTime;
  const retryAfter = Math.max(1, Math.ceil((bucket.resetTime - Date.now()) / 1000));
  return jsonError("Too many requests", 429, {
    "Retry-After": String(penalty ? Math.max(retryAfter, Math.ceil((resetTime - Date.now()) / 1000)) : retryAfter),
    "X-RateLimit-Reset": String(Math.ceil(resetTime / 1000)),
    ...(penalty ? { "X-Abuse-Protection": "penalty-box" } : {}),
  }, request);
}
