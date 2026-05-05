import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { analyzeCppError } from "@/lib/ai-client";
import { checkAIRateLimit, incrementAIUsage } from "@/lib/ai-rate-limit";

const analyzeRequestSchema = z.object({
  code: z.string().min(1),
  stdin: z.string().default(""),
  stdout: z.string().default(""),
  stderr: z.string().default(""),
  userId: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const validation = analyzeRequestSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: validation.error.issues[0].message,
        },
        { status: 400 }
      );
    }

    const { code, stdin, stdout, stderr, userId } = validation.data;

    // 检查限流
    const rateLimit = await checkAIRateLimit(userId, false);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: `今日 AI 分析次数已用完，明天 ${rateLimit.resetAt.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })} 重置`,
          remaining: 0,
          limit: rateLimit.limit,
        },
        { status: 429 }
      );
    }

    // 调用 AI 分析
    const aiResponse = await analyzeCppError(code, stdin, stderr, stdout);

    if (!aiResponse.success) {
      return NextResponse.json(
        {
          success: false,
          error: aiResponse.error || "AI 分析失败",
        },
        { status: 500 }
      );
    }

    // 增加使用计数
    await incrementAIUsage(userId, false);

    // 解析 AI 返回的 JSON
    let analysis;
    try {
      analysis = JSON.parse(aiResponse.content || "{}");
    } catch {
      // 如果 AI 没有返回标准 JSON，使用原始内容
      analysis = {
        errorType: "未知错误",
        cause: aiResponse.content || "AI 分析失败",
        hint: "请检查代码",
        nextAction: "修复后重试",
      };
    }

    return NextResponse.json({
      success: true,
      data: analysis,
      remaining: rateLimit.remaining - 1,
      usage: aiResponse.usage,
    });
  } catch (error) {
    console.error("AI 分析错误:", error);
    return NextResponse.json(
      { success: false, error: "服务器错误" },
      { status: 500 }
    );
  }
}
