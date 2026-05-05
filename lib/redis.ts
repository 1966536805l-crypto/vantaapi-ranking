import Redis from "ioredis";

const redis = new Redis({
  host: process.env.REDIS_HOST || "127.0.0.1",
  port: parseInt(process.env.REDIS_PORT || "6379"),
  password: process.env.REDIS_PASSWORD,
  db: 0,
  retryStrategy: (times) => {
    if (times > 3) return null;
    return Math.min(times * 200, 1000);
  },
});

redis.on("error", (err) => {
  console.error("Redis connection error:", err);
});

export default redis;

export async function checkRedisRateLimit(
  key: string,
  maxRequests: number,
  windowMs: number
): Promise<{ allowed: boolean; remaining: number; resetAt: number }> {
  try {
    const now = Date.now();
    const windowKey = `ratelimit:${key}:${Math.floor(now / windowMs)}`;

    const count = await redis.incr(windowKey);

    if (count === 1) {
      await redis.pexpire(windowKey, windowMs);
    }

    const ttl = await redis.pttl(windowKey);
    const resetAt = now + ttl;

    return {
      allowed: count <= maxRequests,
      remaining: Math.max(0, maxRequests - count),
      resetAt,
    };
  } catch (error) {
    console.error("Redis rate limit error:", error);
    return { allowed: true, remaining: maxRequests, resetAt: Date.now() };
  }
}

export async function logAudit(data: {
  userId?: string;
  action: string;
  resource: string;
  details?: any;
  ip?: string;
  userAgent?: string;
}) {
  try {
    const auditLog = {
      ...data,
      timestamp: new Date().toISOString(),
      id: `audit:${Date.now()}:${Math.random().toString(36).slice(2)}`,
    };

    await redis.lpush("audit:logs", JSON.stringify(auditLog));
    await redis.ltrim("audit:logs", 0, 9999);

    await redis.setex(
      `audit:${auditLog.id}`,
      86400 * 90,
      JSON.stringify(auditLog)
    );
  } catch (error) {
    console.error("Audit log error:", error);
  }
}
