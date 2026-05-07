import { sanitizeText } from "@/lib/api-guard";
import { callAI } from "@/lib/ai-client";

type SecurityAssistantResult = {
  provider: "gemini" | "configured" | "local";
  model: string;
  content: string;
};

const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

const systemPrompt = `You are a concise web security assistant for a Next.js learning website.
Focus on anti-crawling, abuse prevention, authentication, rate limits, bot signals, and safe deployment.
Never ask for secrets. Never output exploit payloads. Give prioritized, practical fixes in Chinese.`;

function localSecurityAdvice(input: string): string {
  const lower = input.toLowerCase();
  const notes = [
    "优先级 1：保护登录、注册、AI、提交类接口。继续保留 IP 限流、邮箱限流、同源校验和请求体大小限制。",
    "优先级 2：爬虫防护不要只靠 User Agent。要组合判断异常路径、请求频率、缺失浏览器头、蜜罐命中和 API 访问行为。",
    "优先级 3：公开页面允许正常搜索引擎抓取，/api、/admin、/dashboard、/wrong 一律 noindex 并加强限流。",
    "优先级 4：生产环境建议接 Cloudflare Turnstile。免费计划适合大多数生产应用，登录失败多或异常 IP 触发时再挑战。",
  ];

  if (lower.includes("login") || input.includes("登录")) {
    notes.unshift("登录防护：失败次数要按 IP 和邮箱双维度限制；失败响应不要暴露账号是否存在。");
  }
  if (lower.includes("crawler") || input.includes("爬")) {
    notes.unshift("防爬建议：对 wp-login、.env、phpmyadmin、xmlrpc 等探测路径直接拉入短期黑名单。");
  }
  if (lower.includes("ai") || input.includes("AI")) {
    notes.push("AI 接口必须 admin-only 或强登录，避免被当成免费代理刷额度。");
  }

  return notes.map((item, index) => `${index + 1}. ${item}`).join("\n");
}

export async function askSecurityAssistant(input: string): Promise<SecurityAssistantResult> {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY || "";
  const cleanInput = sanitizeText(input, 5000);

  if (!apiKey && process.env.AI_API_KEY) {
    const result = await callAI(
      [
        { role: "system", content: systemPrompt },
        { role: "user", content: cleanInput },
      ],
      { temperature: 0.2, maxTokens: 900 },
    );

    if (result.success && result.content) {
      return {
        provider: "configured",
        model: process.env.AI_MODEL || "configured-model",
        content: result.content.trim(),
      };
    }

    return {
      provider: "local",
      model: "built-in-rules",
      content: `${localSecurityAdvice(cleanInput)}\n\nAI 网关暂时不可用：${result.error || "request failed"}`,
    };
  }

  if (!apiKey) {
    return {
      provider: "local",
      model: "built-in-rules",
      content: localSecurityAdvice(cleanInput),
    };
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(GEMINI_MODEL)}:generateContent?key=${encodeURIComponent(apiKey)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemPrompt }] },
          contents: [{ role: "user", parts: [{ text: cleanInput }] }],
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 900,
          },
        }),
        signal: AbortSignal.timeout(12_000),
      },
    );

    const data = await response.json().catch(() => null) as {
      candidates?: { content?: { parts?: { text?: string }[] } }[];
      error?: { message?: string };
    } | null;

    const content = data?.candidates?.[0]?.content?.parts
      ?.map((part) => part.text || "")
      .join("")
      .trim();

    if (!response.ok || !content) {
      return {
        provider: "local",
        model: "built-in-rules",
        content: `${localSecurityAdvice(cleanInput)}\n\nAI 暂时不可用：${data?.error?.message || `HTTP ${response.status}`}`,
      };
    }

    return {
      provider: "gemini",
      model: GEMINI_MODEL,
      content,
    };
  } catch (error) {
    return {
      provider: "local",
      model: "built-in-rules",
      content: `${localSecurityAdvice(cleanInput)}\n\nAI 暂时不可用：${error instanceof Error ? error.message : "request failed"}`,
    };
  }
}
