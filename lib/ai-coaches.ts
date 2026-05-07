import { sanitizeText } from "@/lib/api-guard";
import { callAI, streamAI } from "@/lib/ai-client";

export type CoachMode = "english" | "programming";

type CoachInput = {
  mode: CoachMode;
  prompt: string;
  context?: unknown;
  language?: "en" | "zh";
};

type CoachResult = {
  success: boolean;
  content: string;
  mode: CoachMode;
  provider: "ai" | "local";
  model: string;
};

const englishCoachPrompt = `You are Vanta English Coach, an AI born only for English learning.
Your only mission is English: vocabulary, pronunciation, collocation, grammar, reading, writing, IELTS, TOEFL, CET4, CET6, and postgraduate English.
If the user asks about unrelated topics, politely redirect the answer back to English learning.
Teach with bilingual precision: explain core ideas in concise Chinese when useful, but always include natural English examples.
Never fetch or quote copyrighted dictionary entries. Do not claim to provide human audio. Do not invent official exam answers.
Output only the final answer. Never show request analysis, chain of thought, hidden reasoning, planning notes, or headings like "analysis".
Fast answer rules:
- Answer in 5 short lines or fewer unless the user asks for detail.
- Give one useful next move first.
- Use bullets not essays.
- End with one tiny drill.
- If interfaceLanguage is Chinese, answer mainly in concise Chinese with short English examples.
- No filler phrases.`;

const programmingCoachPrompt = `You are Vanta Code Coach, an AI built only for programming practice.
Your only mission is programming: code reading, debugging, syntax, algorithms, tooling, API work, and project building.
If the user asks about unrelated topics, redirect to programming practice.
Do not dump full solutions first. Prefer one hint at a time unless the user explicitly asks for the answer.
Never run untrusted code or claim code was executed. Reason statically from the given context.
Output only the final answer. Never show request analysis, chain of thought, hidden reasoning, planning notes, or headings like "analysis".
Fast answer rules:
- Answer in 5 short lines or fewer unless the user asks for detail.
- Start with the likely cause or next action.
- Give one hint before a full answer.
- Keep code snippets tiny.
- If interfaceLanguage is Chinese, answer mainly in concise Chinese.
- No filler phrases.`;

function compactContext(context: unknown) {
  if (!context) return "";
  try {
    return sanitizeText(JSON.stringify(context), 1800);
  } catch {
    return "";
  }
}

function localCoachFallback(mode: CoachMode, cleanPrompt: string, language?: "en" | "zh") {
  if (mode === "english") {
    if (language === "zh") {
      return [
        "1. 先抓一个词 一组搭配 一句例句",
        "2. 记忆点 把单词放进真实场景 不要只背中文",
        "3. 例句 I allocate ten minutes to review",
        "4. 读一遍 再遮住意思自己拼一次",
        `5. 小练习 ${cleanPrompt ? "用这个词造一句自己的句子" : "输入一个词或句子我来拆给你"}`,
      ].join("\n");
    }

    return [
      "1. English upgrade: focus on one word, one collocation, and one sentence at a time.",
      "2. Why it works: exam English rewards precise usage, not isolated translation.",
      "3. Memory hook: connect the word to a scene, then say the example sentence aloud.",
      "4. One minute drill: make one sentence, replace the subject, then replace the verb.",
      `5. Exam note: ${cleanPrompt ? "apply this to IELTS TOEFL CET or postgraduate reading context." : "ask about a word, sentence, grammar point, or reading line."}`,
    ].join("\n");
  }

  if (language === "zh") {
    return [
      "1. 先定位最小问题 不急着改整段代码",
      "2. 下一步 预测一个变量或一行输出",
      "3. 提示 只改一行 保留报错信息",
      "4. 最小修正 写一个能证明思路的小片段",
      "5. 小练习 换一组变量名再做一次",
    ].join("\n");
  }

  return [
    "1. What to notice: isolate the smallest concept before changing code.",
    "2. Next move: predict the output or variable state before checking the answer.",
    "3. Hint: change one line at a time and keep the error message visible.",
    "4. Minimal correction: write the smallest snippet that proves the idea.",
    "5. Tiny drill: solve the same pattern once with different names.",
  ].join("\n");
}

function buildCoachPayload(input: CoachInput) {
  const mode: CoachMode = input.mode === "english" ? "english" : "programming";
  const cleanPrompt = sanitizeText(input.prompt, 900);
  const context = compactContext(input.context);
  const system = mode === "english" ? englishCoachPrompt : programmingCoachPrompt;
  const interfaceLanguage = input.language === "zh" ? "Chinese" : "English";
  const user = [
    `interfaceLanguage: ${interfaceLanguage}`,
    "Output contract: final answer only; no analysis section; no reasoning transcript; no markdown table; max 5 short bullets.",
    context ? `Current learning context:\n${context}` : "",
    `Student request:\n${cleanPrompt || "Give one useful next drill for the current context."}`,
  ].filter(Boolean).join("\n\n");

  return { mode, cleanPrompt, system, user };
}

function friendlyGatewayError(error?: string, status?: number) {
  if (status === 429) {
    return "GLM 免费模型当前限流，先用内置教练兜底。稍后再问会自动重试。";
  }
  return error || "AI gateway not available";
}

export async function askCoach(input: CoachInput): Promise<CoachResult> {
  const { mode, cleanPrompt, system, user } = buildCoachPayload(input);

  const result = await callAI(
    [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
    {
      temperature: mode === "english" ? 0.25 : 0.18,
      maxTokens: mode === "english" ? 240 : 220,
      timeoutMs: 4200,
    },
  );

  if (!result.success || !result.content) {
    return {
      success: true,
      content: `${localCoachFallback(mode, cleanPrompt, input.language)}\n\nAI gateway fallback: ${friendlyGatewayError(result.error, result.status)}`,
      mode,
      provider: "local",
      model: "built-in-coach",
    };
  }

  return {
    success: true,
    content: result.content.trim(),
    mode,
    provider: "ai",
    model: process.env.AI_MODEL || "configured-model",
  };
}

function extractDelta(payload: unknown) {
  const data = payload as {
    choices?: Array<{
      delta?: { content?: string };
      message?: { content?: string };
    }>;
  };
  const choice = data.choices?.[0];
  return choice?.delta?.content || choice?.message?.content || "";
}

export async function streamCoach(input: CoachInput) {
  const { mode, cleanPrompt, system, user } = buildCoachPayload(input);
  const result = await streamAI(
    [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
    {
      temperature: mode === "english" ? 0.22 : 0.16,
      maxTokens: mode === "english" ? 260 : 240,
      timeoutMs: 8000,
    },
  );

  if (!result.success) {
    return {
      success: false as const,
      fallback: {
        success: true,
        content: `${localCoachFallback(mode, cleanPrompt, input.language)}\n\nAI gateway fallback: ${friendlyGatewayError(result.error, result.status)}`,
        mode,
        provider: "local" as const,
        model: "built-in-coach",
      },
    };
  }

  const upstream = result.response.body;
  if (!upstream) {
    return {
      success: false as const,
      fallback: {
        success: true,
        content: localCoachFallback(mode, cleanPrompt, input.language),
        mode,
        provider: "local" as const,
        model: "built-in-coach",
      },
    };
  }

  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const reader = upstream.getReader();
      let buffer = "";

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split(/\r?\n/);
          buffer = lines.pop() || "";

          for (const rawLine of lines) {
            const line = rawLine.trim();
            if (!line || !line.startsWith("data:")) continue;
            const data = line.slice(5).trim();
            if (!data || data === "[DONE]") continue;

            try {
              const delta = extractDelta(JSON.parse(data));
              if (delta) controller.enqueue(encoder.encode(delta));
            } catch {
              // Ignore malformed upstream chunks and keep streaming.
            }
          }
        }
      } catch {
        controller.enqueue(encoder.encode("\n\nAI stream interrupted. Instant answer remains available."));
      } finally {
        controller.close();
      }
    },
  });

  return {
    success: true as const,
    stream,
    model: result.model,
  };
}
