import { NextRequest, NextResponse } from "next/server";
import { sanitizeInput } from "@/lib/security";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

type GeminiResponse = {
  candidates?: Array<{
    content?: {
      parts?: Array<{ text?: string }>;
    };
  }>;
  error?: {
    message?: string;
  };
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description } = body;

    if (!title) {
      return NextResponse.json(
        { allowed: false, reason: "标题不能为空" },
        { status: 400 }
      );
    }

    const sanitizedTitle = sanitizeInput(title);
    const sanitizedDescription = description ? sanitizeInput(description) : "";

    const prompt = `你是内容审核AI。请严格审核以下提交内容，检测是否包含：
1. 真人姓名、个人信息
2. 负面评价、攻击性言论
3. 诈骗、虚假信息
4. 色情、低俗内容
5. 赌博相关
6. 盗版、侵权内容

标题：${sanitizedTitle}
描述：${sanitizedDescription}

如果包含以上任何内容，回复 "REJECT: 原因"
如果内容安全，回复 "APPROVE"`;

    if (!GEMINI_API_KEY) {
      return NextResponse.json({ allowed: true, reason: "AI审核未配置" });
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.1, maxOutputTokens: 200 },
        }),
      }
    );

    const data = (await response.json()) as GeminiResponse;
    const result =
      data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";

    if (result.startsWith("REJECT")) {
      const reason = result.replace("REJECT:", "").trim();
      return NextResponse.json({
        allowed: false,
        reason: reason || "内容不符合规范",
      });
    }

    return NextResponse.json({ allowed: true });
  } catch (error) {
    return NextResponse.json({ allowed: true, reason: "AI审核异常，已放行" });
  }
}
