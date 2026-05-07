import Redis from "ioredis";

let redisClient: Redis | null = null;

function shouldUseRedis() {
  return Boolean(process.env.REDIS_URL || process.env.ENABLE_REDIS_RATE_LIMITS === "true");
}

export function getRedisClient(): Redis | null {
  if (!shouldUseRedis()) return null;
  if (redisClient) return redisClient;

  redisClient = process.env.REDIS_URL
    ? new Redis(process.env.REDIS_URL, {
        maxRetriesPerRequest: 1,
        retryStrategy: (times) => (times > 3 ? null : Math.min(times * 200, 1000)),
      })
    : new Redis({
        host: process.env.REDIS_HOST || "127.0.0.1",
        port: parseInt(process.env.REDIS_PORT || "6379", 10),
        password: process.env.REDIS_PASSWORD || undefined,
        db: 0,
        maxRetriesPerRequest: 1,
        retryStrategy: (times) => (times > 3 ? null : Math.min(times * 200, 1000)),
      });

  redisClient.on("error", (err) => {
    console.error("Redis connection error:", err.message);
  });

  return redisClient;
}

export default getRedisClient;

export async function checkRedisRateLimit(
  key: string,
  maxRequests: number,
  windowMs: number,
): Promise<{ allowed: boolean; remaining: number; resetAt: number; source: "redis" | "disabled" | "fallback" }> {
  const redis = getRedisClient();
  if (!redis) return { allowed: true, remaining: maxRequests, resetAt: Date.now() + windowMs, source: "disabled" };

  try {
    const now = Date.now();
    const windowKey = `ratelimit:${key}:${Math.floor(now / windowMs)}`;
    const count = await redis.incr(windowKey);

    if (count === 1) {
      await redis.pexpire(windowKey, windowMs);
    }

    const ttl = await redis.pttl(windowKey);
    const resetAt = now + Math.max(ttl, 0);

    return {
      allowed: count <= maxRequests,
      remaining: Math.max(0, maxRequests - count),
      resetAt,
      source: "redis",
    };
  } catch (error) {
    console.error("Redis rate limit error:", error instanceof Error ? error.message : error);
    const failClosed = process.env.REDIS_RATE_LIMIT_FAIL_CLOSED === "true" || process.env.NODE_ENV === "production";
    return { allowed: !failClosed, remaining: failClosed ? 0 : maxRequests, resetAt: Date.now() + windowMs, source: "fallback" };
  }
}

export async function logAudit(data: {
  userId?: string;
  action: string;
  resource: string;
  details?: unknown;
  ip?: string;
  userAgent?: string;
}) {
  const redis = getRedisClient();
  if (!redis) return;

  try {
    const auditLog = {
      ...data,
      timestamp: new Date().toISOString(),
      id: `audit:${Date.now()}:${Math.random().toString(36).slice(2)}`,
    };

    await redis.lpush("audit:logs", JSON.stringify(auditLog));
    await redis.ltrim("audit:logs", 0, 9999);

    await redis.setex(`audit:${auditLog.id}`, 86400 * 90, JSON.stringify(auditLog));
  } catch (error) {
    console.error("Audit log error:", error instanceof Error ? error.message : error);
  }
}
