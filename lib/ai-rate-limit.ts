/**
 * AI 调用限流机制
 * 使用 Redis 存储每日调用次数
 */

import { getRedisClient } from "./redis";

const DAILY_LIMIT_NORMAL = 30; // 普通用户每天30次
const DAILY_LIMIT_ADMIN = 300; // 管理员每天300次

type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  limit: number;
  resetAt: Date;
};

/**
 * 检查用户是否可以调用 AI
 */
export async function checkAIRateLimit(
  userId: string,
  isAdmin: boolean = false
): Promise<RateLimitResult> {
  const limit = isAdmin ? DAILY_LIMIT_ADMIN : DAILY_LIMIT_NORMAL;
  const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
  const key = `ai:rate_limit:${userId}:${today}`;

  try {
    const redis = getRedisClient();
    if (!redis) {
      return { allowed: true, remaining: limit, limit, resetAt: new Date() };
    }

    // 获取当前计数
    const currentCount = await redis.get(key);
    const count = currentCount ? parseInt(currentCount, 10) : 0;

    // 计算重置时间（明天0点）
    const resetAt = new Date();
    resetAt.setDate(resetAt.getDate() + 1);
    resetAt.setHours(0, 0, 0, 0);

    if (count >= limit) {
      return {
        allowed: false,
        remaining: 0,
        limit,
        resetAt,
      };
    }

    return {
      allowed: true,
      remaining: limit - count,
      limit,
      resetAt,
    };
  } catch (error) {
    console.error("检查 AI 限流失败:", error);
    // Redis 失败时允许调用，避免阻塞用户
    return {
      allowed: true,
      remaining: limit,
      limit,
      resetAt: new Date(),
    };
  }
}

/**
 * 增加用户的 AI 调用计数
 */
export async function incrementAIUsage(
  userId: string,
  isAdmin: boolean = false
): Promise<void> {
  void isAdmin;
  const today = new Date().toISOString().split("T")[0];
  const key = `ai:rate_limit:${userId}:${today}`;

  try {
    const redis = getRedisClient();
    if (!redis) return;

    const count = await redis.incr(key);

    // 第一次调用时设置过期时间（48小时，留一些余量）
    if (count === 1) {
      await redis.expire(key, 48 * 60 * 60);
    }
  } catch (error) {
    console.error("增加 AI 使用计数失败:", error);
    // 失败不影响主流程
  }
}

/**
 * 获取用户今日剩余调用次数
 */
export async function getAIRemainingCalls(
  userId: string,
  isAdmin: boolean = false
): Promise<number> {
  const limit = isAdmin ? DAILY_LIMIT_ADMIN : DAILY_LIMIT_NORMAL;
  const today = new Date().toISOString().split("T")[0];
  const key = `ai:rate_limit:${userId}:${today}`;

  try {
    const redis = getRedisClient();
    if (!redis) return limit;

    const currentCount = await redis.get(key);
    const count = currentCount ? parseInt(currentCount, 10) : 0;
    return Math.max(0, limit - count);
  } catch (error) {
    console.error("获取 AI 剩余次数失败:", error);
    return limit;
  }
}
