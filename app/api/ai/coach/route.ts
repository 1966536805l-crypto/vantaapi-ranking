import { NextRequest } from "next/server";
import { enforceRateLimitAsync, guardedJson, readJsonBody, requireSameOrigin, sanitizeText } from "@/lib/api-guard";
import { askCoach, streamCoach, type CoachMode } from "@/lib/ai-coaches";
import { getCurrentUser } from "@/lib/auth";
import { checkRateLimitAsync, getRateLimitKey } from "@/lib/security";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const originError = requireSameOrigin(request);
  if (originError) return originError;

  const user = await getCurrentUser(request).catch(() => null);

  const rateLimited = await enforceRateLimitAsync(request, user ? 16 : 8, 5 * 60_000, "ai-coach");
  if (rateLimited) return rateLimited;

  const dailyKey = user ? `ai-coach:user:${user.id}` : `ai-coach:ip:${getRateLimitKey(request)}`;
  const dailyLimit = await checkRateLimitAsync(dailyKey, user ? 80 : 30, 24 * 60 * 60_000);
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
        "X-Coach-Provider": "ai",
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
