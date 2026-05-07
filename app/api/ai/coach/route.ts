import { NextRequest } from "next/server";
import { guardedJson, readJsonBody, requireSameOrigin, sanitizeText } from "@/lib/api-guard";
import { askCoach, streamCoach, type CoachMode } from "@/lib/ai-coaches";
import { requireUser } from "@/lib/auth";
import { checkRateLimit, checkRateLimitAsync, getRateLimitKey } from "@/lib/security";

export const dynamic = "force-dynamic";

async function fastRateLimit(key: string, maxRequests: number, windowMs: number) {
  return Promise.race([
    checkRateLimitAsync(key, maxRequests, windowMs),
    new Promise<ReturnType<typeof checkRateLimit>>((resolve) => {
      setTimeout(() => resolve(checkRateLimit(key, maxRequests, windowMs)), 180);
    }),
  ]);
}

export async function POST(request: NextRequest) {
  const originError = requireSameOrigin(request);
  if (originError) return originError;

  const userResult = await requireUser(request);
  if (userResult.response) return userResult.response;

  const ipKey = getRateLimitKey(request);

  const burstLimit = await fastRateLimit(`${ipKey}:ai-coach`, 16, 5 * 60_000);
  if (!burstLimit.allowed) {
    return guardedJson(
      { success: false, error: "Too many requests / 请求过于频繁" },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.max(1, Math.ceil((burstLimit.resetTime - Date.now()) / 1000))),
          "X-RateLimit-Reset": String(Math.ceil(burstLimit.resetTime / 1000)),
        },
      },
    );
  }

  const dailyKey = `ai-coach:user:${userResult.user.id}`;
  const dailyLimit = await fastRateLimit(dailyKey, 80, 24 * 60 * 60_000);
  if (!dailyLimit.allowed) {
    return guardedJson(
      { success: false, message: "今日 AI 助教使用次数已达上限，请明天再试" },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.max(1, Math.ceil((dailyLimit.resetTime - Date.now()) / 1000))),
        },
      },
    );
  }

  const parsedBody = await readJsonBody<Record<string, unknown>>(request, 8 * 1024);
  if (!parsedBody.ok) return parsedBody.response;

  const mode = parsedBody.body.mode === "english" ? "english" : "programming";
  const prompt = sanitizeText(String(parsedBody.body.prompt || ""), 900);
  const language = parsedBody.body.language === "zh" ? "zh" : "en";
  const wantsStream = parsedBody.body.stream === true;

  if (!prompt && !parsedBody.body.context) {
    return guardedJson({ success: false, message: "Missing coach prompt" }, { status: 400 });
  }

  if (wantsStream) {
    const result = await streamCoach({
      mode: mode as CoachMode,
      prompt,
      context: parsedBody.body.context,
      language,
    });

    if (!result.success) {
      return guardedJson(result.fallback);
    }

    return new Response(result.stream, {
      headers: {
        "Cache-Control": "no-store",
        "Content-Type": "text/plain; charset=utf-8",
        "X-Coach-Provider": result.provider,
        "X-Coach-Model": result.model,
      },
    });
  }

  const result = await askCoach({
    mode: mode as CoachMode,
    prompt,
    context: parsedBody.body.context,
    language,
  });

  return guardedJson(result);
}
