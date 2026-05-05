import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const DEFAULT_MODEL = "gemini-2.5-flash-lite";

type GeminiPart = {
  text?: string;
};

type GeminiResponse = {
  candidates?: Array<{
    content?: {
      parts?: GeminiPart[];
    };
  }>;
  error?: {
    message?: string;
  };
};

export async function POST(request: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL || DEFAULT_MODEL;

  if (!apiKey) {
    return NextResponse.json(
      { error: "GEMINI_API_KEY is not configured" },
      { status: 500 }
    );
  }

  const body = await request.json().catch(() => null);
  const message = typeof body?.message === "string" ? body.message.trim() : "";

  if (!message) {
    return NextResponse.json({ error: "Message is required" }, { status: 400 });
  }

  if (message.length > 4000) {
    return NextResponse.json(
      { error: "Message is too long" },
      { status: 400 }
    );
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
      model
    )}:generateContent?key=${encodeURIComponent(apiKey)}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        systemInstruction: {
          parts: [
            {
              text:
                "你是 VantaAPI 网站里的轻量 AI 助手。回答要简洁、直接、中文优先；如果不确定，就说明不确定。",
            },
          ],
        },
        contents: [
          {
            role: "user",
            parts: [{ text: message }],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1024,
        },
      }),
    }
  );

  const data = (await response.json().catch(() => ({}))) as GeminiResponse;

  if (!response.ok) {
    return NextResponse.json(
      { error: data.error?.message || "Gemini request failed" },
      { status: response.status }
    );
  }

  const text =
    data.candidates?.[0]?.content?.parts
      ?.map((part) => part.text)
      .filter(Boolean)
      .join("\n")
      .trim() || "";

  return NextResponse.json({ text, model });
}
