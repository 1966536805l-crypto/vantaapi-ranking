import { NextRequest } from "next/server";
import { guardedJson, localizedApiMessage, readJsonBody, requireSameOrigin, sanitizeText } from "@/lib/api-guard";
import { askCoach, streamCoach, type CoachMode } from "@/lib/ai-coaches";
import { requireUser } from "@/lib/auth";
import { isInterfaceLanguage } from "@/lib/language";
import { checkRateLimit, checkRateLimitAsync, getRateLimitKey } from "@/lib/security";

export const dynamic = "force-dynamic";
const AI_COACH_BURST_LIMIT = 16;
const AI_COACH_DAILY_LIMIT = 80;

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

  const burstLimit = await fastRateLimit(`${ipKey}:ai-coach`, AI_COACH_BURST_LIMIT, 5 * 60_000);
  if (!burstLimit.allowed) {
    const message = localizedApiMessage("Too many requests", 429, request);
    return guardedJson(
      { success: false, message, error: message },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.max(1, Math.ceil((burstLimit.resetTime - Date.now()) / 1000))),
          "X-RateLimit-Reset": String(Math.ceil(burstLimit.resetTime / 1000)),
          "X-AI-Burst-Limit": String(AI_COACH_BURST_LIMIT),
        },
      },
    );
  }

  const dailyKey = `ai-coach:user:${userResult.user.id}`;
  const dailyLimit = await fastRateLimit(dailyKey, AI_COACH_DAILY_LIMIT, 24 * 60 * 60_000);
  if (!dailyLimit.allowed) {
    const message = localizedApiMessage("Too many requests", 429, request);
    return guardedJson(
      { success: false, message, error: message },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.max(1, Math.ceil((dailyLimit.resetTime - Date.now()) / 1000))),
          "X-AI-Daily-Limit": String(AI_COACH_DAILY_LIMIT),
        },
      },
    );
  }

  const parsedBody = await readJsonBody<Record<string, unknown>>(request, 8 * 1024);
  if (!parsedBody.ok) return parsedBody.response;

  const mode = parsedBody.body.mode === "english" ? "english" : "programming";
  const prompt = sanitizeText(String(parsedBody.body.prompt || ""), 900);
  const rawLanguage = typeof parsedBody.body.language === "string" ? parsedBody.body.language : undefined;
  const language = isInterfaceLanguage(rawLanguage) ? rawLanguage : "en";
  const wantsStream = parsedBody.body.stream === true;

  if (!prompt && !parsedBody.body.context) {
    const message = localizedApiMessage("Missing coach prompt", 400, language);
    return guardedJson({ success: false, message, error: message }, { status: 400 });
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
        "X-AI-Daily-Limit": String(AI_COACH_DAILY_LIMIT),
      },
    });
  }

  const result = await askCoach({
    mode: mode as CoachMode,
    prompt,
    context: parsedBody.body.context,
    language,
  });

  return guardedJson(result, { headers: { "X-AI-Daily-Limit": String(AI_COACH_DAILY_LIMIT) } });
}
