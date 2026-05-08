import { sanitizeText } from "@/lib/api-guard";
import { callAI, streamAI } from "@/lib/ai-client";
import { tripProviderCircuit } from "@/lib/ai-circuit-breaker";
import { recordAIEvent } from "@/lib/ai-observability";
import type { InterfaceLanguage } from "@/lib/language";

export type CoachMode = "english" | "programming";

type CoachInput = {
  mode: CoachMode;
  prompt: string;
  context?: unknown;
  language?: InterfaceLanguage;
};

type CoachResult = {
  success: boolean;
  content: string;
  mode: CoachMode;
  provider: "ai" | "local";
  model: string;
};

const COACH_FIRST_TOKEN_TIMEOUT_MS = 1700;
const COACH_PROVIDER_RESPONSE_TIMEOUT_MS = 1200;

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
- Answer in the requested interfaceLanguage from the user payload. If interfaceLanguage is Chinese, answer mainly in concise Chinese with short English examples.
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
- Answer in the requested interfaceLanguage from the user payload.
- No filler phrases.`;

const interfaceLanguageNames: Record<InterfaceLanguage, { english: string; native: string }> = {
  en: { english: "English", native: "English" },
  zh: { english: "Chinese", native: "中文" },
  ja: { english: "Japanese", native: "日本語" },
  ko: { english: "Korean", native: "한국어" },
  es: { english: "Spanish", native: "Español" },
  fr: { english: "French", native: "Français" },
  de: { english: "German", native: "Deutsch" },
  pt: { english: "Portuguese", native: "Português" },
  ru: { english: "Russian", native: "Русский" },
  ar: { english: "Arabic", native: "العربية" },
  hi: { english: "Hindi", native: "हिन्दी" },
  id: { english: "Indonesian", native: "Bahasa Indonesia" },
  vi: { english: "Vietnamese", native: "Tiếng Việt" },
  th: { english: "Thai", native: "ไทย" },
  tr: { english: "Turkish", native: "Türkçe" },
  it: { english: "Italian", native: "Italiano" },
  nl: { english: "Dutch", native: "Nederlands" },
  pl: { english: "Polish", native: "Polski" },
};

function compactContext(context: unknown) {
  if (!context) return "";
  try {
    return sanitizeText(JSON.stringify(context), 1800);
  } catch {
    return "";
  }
}

function contextRecord(context: unknown): Record<string, unknown> {
  if (context && typeof context === "object" && !Array.isArray(context)) {
    return context as Record<string, unknown>;
  }
  return {};
}

function cleanValue(value: unknown, max = 120) {
  if (typeof value !== "string" && typeof value !== "number") return "";
  return sanitizeText(String(value), max).replace(/\s+/g, " ").trim();
}

function readContextValue(context: unknown, keys: string[], max = 120) {
  const record = contextRecord(context);
  for (const key of keys) {
    const value = cleanValue(record[key], max);
    if (value) return value;
  }
  return "";
}

function firstEnglishWord(...values: string[]) {
  for (const value of values) {
    const match = value.match(/[A-Za-z][A-Za-z'-]{1,}/);
    if (match) return match[0].replace(/^['-]+|['-]+$/g, "");
  }
  return "";
}

function memoryHook(word: string, language: InterfaceLanguage = "en") {
  if (!word) {
    return language === "zh"
      ? "先听音 再拼写 再看释义"
      : language === "ar"
        ? "استمع أولا ثم هجئ ثم افحص المعنى"
        : language === "ja"
          ? "まず聞いて つづりを書き 意味を確認する"
      : "listen first then spell then check the meaning";
  }

  const normalized = word.toLowerCase();
  const splitAt = normalized.length > 6 ? Math.ceil(normalized.length / 2) : Math.min(3, normalized.length);
  const first = normalized.slice(0, splitAt);
  const last = normalized.slice(splitAt);
  const bucket = normalized.split("").reduce((total, char) => total + char.charCodeAt(0), 0) % 3;

  if (language === "zh") {
    if (bucket === 0 && last) return `拆成 ${first} 和 ${last} 先记开头再记结尾`;
    if (bucket === 1) return `把 ${word} 放进一个真实动作 不只背中文`;
    return `先记一个搭配 再用 ${word} 造一句短句`;
  }

  if (language === "ar") {
    if (bucket === 0 && last) return `قسّم ${word} إلى ${first} و ${last} ثم هجئه مرة`;
    if (bucket === 1) return `اربط ${word} بفعل حقيقي لا بترجمة فقط`;
    return `احفظ تركيبا واحدا ثم استخدم ${word} في جملة قصيرة`;
  }

  if (language === "ja") {
    if (bucket === 0 && last) return `${word} を ${first} と ${last} に分けて一度つづる`;
    if (bucket === 1) return `${word} を翻訳だけでなく実際の動作に結びつける`;
    return `コロケーションを一つ覚えて ${word} で短文を作る`;
  }

  if (bucket === 0 && last) return `split ${word} into ${first} and ${last} then spell it once`;
  if (bucket === 1) return `attach ${word} to one real action instead of a translation`;
  return `learn one collocation then use ${word} in a short sentence`;
}

function englishFallback(cleanPrompt: string, context: unknown, language: InterfaceLanguage = "en") {
  const word = readContextValue(context, ["word", "term", "title"], 60) || firstEnglishWord(cleanPrompt);
  const meaning =
    readContextValue(context, language === "zh" ? ["meaningZh", "translation", "meaning", "meaningEn"] : ["meaningEn", "meaning", "meaningZh"], 110);
  const collocation = readContextValue(context, ["collocation", "phrase"], 90);
  const sentence = readContextValue(context, ["sentence", "example"], 130);
  const target = word || (language === "zh" ? "这个词" : "this word");

  if (language === "zh") {
    if (!word && !meaning && !cleanPrompt) {
      return [
        "1. 先给我一个单词或句子",
        "2. 顺序 听音 拼写 释义 例句",
        "3. 5 秒想不出就重听 不硬猜",
        "4. 只看一个记忆点 不一次塞太多",
        "5. 小练习 输入今天最容易忘的词",
      ].join("\n");
    }

    return [
      `1. 先练 ${target} 听一遍再拼一遍`,
      meaning ? `2. 核心意思 ${meaning}` : "2. 先自己说出中文意思 再看答案",
      `3. 记忆钩子 ${memoryHook(target, language)}`,
      collocation || sentence ? `4. 用法 ${collocation || sentence}` : `4. 例句 I can use ${target} in one clear sentence`,
      `5. 小练习 5 秒内拼出 ${target} 错了就重听`,
    ].join("\n");
  }

  if (language === "ar") {
    if (!word && !meaning && !cleanPrompt) {
      return [
        "1. أرسل كلمة أو جملة أولا",
        "2. الترتيب استماع ثم تهجئة ثم معنى ثم مثال",
        "3. إذا تجاوز التذكر 5 ثوان أعد الاستماع",
        "4. استخدم رابط ذاكرة واحد فقط",
        "5. تمرين صغير اكتب أكثر كلمة نسيتها اليوم",
      ].join("\n");
    }

    return [
      `1. تدرب على ${target} استمع مرة ثم هجئ مرة`,
      meaning ? `2. المعنى الأساسي ${meaning}` : "2. قل المعنى قبل النظر إلى الإجابة",
      `3. رابط الذاكرة ${memoryHook(target, language)}`,
      collocation || sentence ? `4. الاستخدام ${collocation || sentence}` : `4. مثال I can use ${target} in one clear sentence`,
      `5. تمرين صغير هجئ ${target} خلال 5 ثوان أو أعد الصوت`,
    ].join("\n");
  }

  if (language === "ja") {
    if (!word && !meaning && !cleanPrompt) {
      return [
        "1. まず単語か文を一つ送ってください",
        "2. 聞く つづる 意味 例文 の順で練習",
        "3. 5 秒以上かかるならもう一度聞く",
        "4. 記憶フックは一つだけ",
        "5. 小練習 今日いちばん忘れやすい単語を入力",
      ].join("\n");
    }

    return [
      `1. ${target} を一度聞いて一度つづる`,
      meaning ? `2. 中心意味 ${meaning}` : "2. 意味を先に言ってから確認",
      `3. 記憶フック ${memoryHook(target, language)}`,
      collocation || sentence ? `4. 使い方 ${collocation || sentence}` : `4. 例文 I can use ${target} in one clear sentence`,
      `5. 小練習 ${target} を 5 秒以内につづる 失敗したら聞き直す`,
    ].join("\n");
  }

  if (!word && !meaning && !cleanPrompt) {
    return [
      "1. Send one word or sentence first",
      "2. Train in this order listen spell meaning example",
      "3. If recall takes over 5 seconds replay it",
      "4. Keep one memory hook only",
      "5. Tiny drill type the word you forget most today",
    ].join("\n");
  }

  return [
    `1. Practice ${target} by listening once and spelling once`,
    meaning ? `2. Core meaning ${meaning}` : "2. Say the meaning before checking it",
    `3. Memory hook ${memoryHook(target, language)}`,
    collocation || sentence ? `4. Usage ${collocation || sentence}` : `4. Example I can use ${target} in one clear sentence`,
    `5. Tiny drill spell ${target} within 5 seconds or replay it`,
  ].join("\n");
}

function programmingNextMove(type: string, prompt: string, language: InterfaceLanguage = "en") {
  const source = `${type} ${prompt}`.toLowerCase();
  if (language === "zh") {
    if (source.includes("bug") || source.includes("error") || source.includes("报错")) return "先锁定报错行 再只改一处";
    if (source.includes("output") || source.includes("输出")) return "先手算每个变量的变化";
    if (source.includes("fill") || source.includes("填空")) return "只看空格前后一行";
    if (source.includes("choice") || source.includes("选择")) return "先排除会改变类型或输出的选项";
    if (source.includes("practical") || source.includes("实操")) return "先写最小可运行骨架";
    return "先把题目压成一个最小例子";
  }

  if (language === "ar") {
    if (source.includes("bug") || source.includes("error")) return "حدد سطر الخطأ ثم غيّر شيئا واحدا";
    if (source.includes("output") || source.includes("الناتج")) return "تتبع كل متغير قبل الاختيار";
    if (source.includes("fill") || source.includes("فراغ")) return "اقرأ السطر قبل الفراغ وبعده فقط";
    if (source.includes("choice") || source.includes("اختيار")) return "استبعد الخيارات التي تغير النوع أو الناتج";
    if (source.includes("practical") || source.includes("عملي")) return "اكتب أصغر هيكل قابل للتشغيل";
    return "اختصر السؤال إلى مثال صغير جدا";
  }

  if (language === "ja") {
    if (source.includes("bug") || source.includes("error")) return "エラー行を特定して一つだけ変える";
    if (source.includes("output") || source.includes("出力")) return "選ぶ前に各変数を追跡する";
    if (source.includes("fill") || source.includes("穴埋め")) return "空欄の前後一行だけを見る";
    if (source.includes("choice") || source.includes("選択")) return "型や出力を変える選択肢を外す";
    if (source.includes("practical") || source.includes("実践")) return "最小の実行可能な骨組みを書く";
    return "問題を一つの小さな例に縮める";
  }

  if (source.includes("bug") || source.includes("error")) return "isolate the error line then change one thing";
  if (source.includes("output")) return "trace each variable before choosing";
  if (source.includes("fill")) return "read only the line before and after the blank";
  if (source.includes("choice")) return "remove options that change the type or output";
  if (source.includes("practical")) return "write the smallest runnable skeleton first";
  return "reduce the question to one tiny example";
}

function programmingFallback(cleanPrompt: string, context: unknown, language: InterfaceLanguage = "en") {
  const topic = readContextValue(context, ["language", "languageRole", "topic", "title"], 80);
  const questionType = readContextValue(context, ["questionType", "type"], 50);
  const questionNumber = readContextValue(context, ["questionNumber", "index"], 20);
  const prompt = readContextValue(context, ["prompt", "question", "lesson"], 150) || cleanPrompt;
  const code = readContextValue(context, ["codeSnippet", "code"], 140);
  const answer = readContextValue(context, ["studentAnswer", "answer"], 90);

  if (language === "zh") {
    return [
      `1. 先看 ${topic || "当前语言"}${questionNumber ? ` 第 ${questionNumber} 题` : ""}${questionType ? ` ${questionType}` : ""}`,
      `2. 下一步 ${programmingNextMove(questionType, prompt, language)}`,
      code ? "3. 关键点 逐行跟踪变量 不要跳读代码" : "3. 关键点 先讲清一个概念 再写代码",
      answer ? `4. 你的答案 ${answer} 先找第一处不确定` : "4. 先写预测 再开提示",
      "5. 小练习 换一组变量名再做一次",
    ].join("\n");
  }

  if (language === "ar") {
    return [
      `1. ركز على ${topic || "اللغة الحالية"}${questionNumber ? ` السؤال ${questionNumber}` : ""}${questionType ? ` ${questionType}` : ""}`,
      `2. الخطوة التالية ${programmingNextMove(questionType, prompt, language)}`,
      code ? "3. الفكرة الأساسية تتبع المتغيرات سطرا بسطر" : "3. الفكرة الأساسية اشرح مفهوما واحدا قبل كتابة الكود",
      answer ? `4. إجابتك ${answer} ابحث عن أول خطوة غير مؤكدة` : "4. توقع أولا ثم افتح تلميحا واحدا",
      "5. تمرين صغير كرر الحل بأسماء متغيرات جديدة",
    ].join("\n");
  }

  if (language === "ja") {
    return [
      `1. ${topic || "現在の言語"}${questionNumber ? ` 問題 ${questionNumber}` : ""}${questionType ? ` ${questionType}` : ""} に集中`,
      `2. 次の一手 ${programmingNextMove(questionType, prompt, language)}`,
      code ? "3. 要点 変数を一行ずつ追跡する" : "3. 要点 コードを書く前に概念を一つ説明する",
      answer ? `4. あなたの答え ${answer} まず不確かな一歩を探す` : "4. 先に予測してからヒントを一つ開く",
      "5. 小練習 変数名を変えてもう一度",
    ].join("\n");
  }

  return [
    `1. Focus on ${topic || "the current language"}${questionNumber ? ` question ${questionNumber}` : ""}${questionType ? ` ${questionType}` : ""}`,
    `2. Next move ${programmingNextMove(questionType, prompt, language)}`,
    code ? "3. Key idea trace variables line by line" : "3. Key idea explain one concept before coding",
    answer ? `4. Your answer ${answer} find the first uncertain step` : "4. Predict first then open one hint",
    "5. Tiny drill repeat it with new variable names",
  ].join("\n");
}

function localCoachFallback(mode: CoachMode, cleanPrompt: string, context: unknown, language: InterfaceLanguage = "en") {
  if (mode === "english") {
    return englishFallback(cleanPrompt, context, language);
  }

  return programmingFallback(cleanPrompt, context, language);
}

function buildCoachPayload(input: CoachInput) {
  const mode: CoachMode = input.mode === "english" ? "english" : "programming";
  const cleanPrompt = sanitizeText(input.prompt, 900);
  const context = compactContext(input.context);
  const system = mode === "english" ? englishCoachPrompt : programmingCoachPrompt;
  const language = input.language || "en";
  const languageName = interfaceLanguageNames[language] || interfaceLanguageNames.en;
  const interfaceLanguage = `${languageName.english} (${languageName.native})`;
  const user = [
    `interfaceLanguage: ${interfaceLanguage}`,
    `Required answer language: ${languageName.native}. If the student asks in another language, still keep the final answer mainly in ${languageName.native}.`,
    "Output contract: final answer only; no analysis section; no reasoning transcript; no markdown table; max 5 short bullets.",
    context ? `Current learning context:\n${context}` : "",
    `Student request:\n${cleanPrompt || "Give one useful next drill for the current context."}`,
  ].filter(Boolean).join("\n\n");

  return { mode, cleanPrompt, system, user };
}

function friendlyGatewayError(error?: string, status?: number, language: InterfaceLanguage = "en") {
  if (status === 429) {
    if (language === "zh") return "GLM 免费模型当前限流，先用内置教练兜底。稍后再问会自动重试。";
    if (language === "ar") return "نموذج GLM المجاني محدود الآن، لذلك استخدمنا المدرب المدمج مؤقتا. سيعاد المحاولة لاحقا تلقائيا.";
    if (language === "ja") return "無料 GLM モデルは現在制限中です。いったん内蔵コーチで回答し、あとで自動的に再試行します。";
    return "The free GLM model is rate limited, so the built-in coach answered first. It will retry automatically later.";
  }
  return error || "AI gateway not available";
}

async function withCoachProviderTimeout<T extends { success: boolean; error?: string }>(
  promise: Promise<T>,
  timeoutError: string,
) {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<T>((resolve) => {
    timeoutId = setTimeout(() => resolve({ success: false, error: timeoutError } as T), COACH_PROVIDER_RESPONSE_TIMEOUT_MS);
  });

  try {
    return await Promise.race([promise, timeout]);
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }
}

export async function askCoach(input: CoachInput): Promise<CoachResult> {
  const { mode, cleanPrompt, system, user } = buildCoachPayload(input);

  const result = await withCoachProviderTimeout(
    callAI(
      [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      {
        temperature: mode === "english" ? 0.25 : 0.18,
        maxTokens: mode === "english" ? 240 : 220,
        gatewayTimeoutMs: 1500,
        ollamaTimeoutMs: 1800,
        fallbackToOllama: false,
      },
    ),
    "AI gateway fast timeout",
  );

  if (!result.success || !result.content) {
    if (result.error === "AI gateway fast timeout") {
      await tripProviderCircuit("gateway", "timeout", "coach fast timeout");
    }
    recordAIEvent({
      provider: "built-in",
      operation: "fallback",
      status: "success",
      model: "built-in-coach",
      durationMs: 0,
      reason: result.error || "empty AI response",
    });
    return {
      success: true,
      content: `${localCoachFallback(mode, cleanPrompt, input.context, input.language)}\n\nAI gateway fallback: ${friendlyGatewayError(result.error, result.status, input.language)}`,
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
    model: result.model || process.env.AI_MODEL || "configured-model",
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

function extractOllamaDelta(payload: unknown) {
  const data = payload as {
    message?: { content?: string };
    response?: string;
  };
  return data.message?.content || data.response || "";
}

export async function streamCoach(input: CoachInput) {
  const { mode, cleanPrompt, system, user } = buildCoachPayload(input);
  const result = await withCoachProviderTimeout(
    streamAI(
      [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      {
        temperature: mode === "english" ? 0.22 : 0.16,
        maxTokens: mode === "english" ? 260 : 240,
        gatewayTimeoutMs: 1500,
        ollamaTimeoutMs: 1800,
        fallbackToOllama: false,
      },
    ),
    "AI gateway fast timeout",
  );

  if (!result.success) {
    if (result.error === "AI gateway fast timeout") {
      await tripProviderCircuit("gateway", "timeout", "coach fast timeout");
    }
    recordAIEvent({
      provider: "built-in",
      operation: "fallback",
      status: "success",
      model: "built-in-coach",
      durationMs: 0,
      reason: result.error,
    });
    return {
      success: false as const,
      fallback: {
        success: true,
        content: `${localCoachFallback(mode, cleanPrompt, input.context, input.language)}\n\nAI gateway fallback: ${friendlyGatewayError(result.error, result.status, input.language)}`,
        mode,
        provider: "local" as const,
        model: "built-in-coach",
      },
    };
  }

  const upstream = result.response.body;
  if (!upstream) {
    recordAIEvent({
      provider: "built-in",
      operation: "fallback",
      status: "success",
      model: "built-in-coach",
      durationMs: 0,
      reason: "missing upstream body",
    });
    return {
      success: false as const,
      fallback: {
        success: true,
        content: localCoachFallback(mode, cleanPrompt, input.context, input.language),
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
      let emitted = false;
      const firstTokenDeadline = Date.now() + COACH_FIRST_TOKEN_TIMEOUT_MS;

      try {
        while (true) {
          const remainingMs = firstTokenDeadline - Date.now();
          if (!emitted && remainingMs <= 0) {
            await reader.cancel().catch(() => undefined);
            await tripProviderCircuit(result.provider, "timeout", "slow first token");
            recordAIEvent({
              provider: "built-in",
              operation: "fallback",
              status: "success",
              model: "built-in-coach",
              durationMs: 0,
              reason: `${result.provider} slow first token`,
            });
            controller.enqueue(
              encoder.encode(
                `${localCoachFallback(mode, cleanPrompt, input.context, input.language)}\n\nAI gateway fallback: ${friendlyGatewayError("slow AI stream", undefined, input.language)}`,
              ),
            );
            emitted = true;
            break;
          }

          const nextChunk = !emitted && remainingMs > 0
            ? await Promise.race([
                reader.read(),
                new Promise<{ timedOut: true }>((resolve) => {
                  setTimeout(() => resolve({ timedOut: true }), remainingMs);
                }),
              ])
            : await reader.read();

          if ("timedOut" in nextChunk) {
            await reader.cancel().catch(() => undefined);
            await tripProviderCircuit(result.provider, "timeout", "slow first token");
            recordAIEvent({
              provider: "built-in",
              operation: "fallback",
              status: "success",
              model: "built-in-coach",
              durationMs: 0,
              reason: `${result.provider} slow first token`,
            });
            controller.enqueue(
              encoder.encode(
                `${localCoachFallback(mode, cleanPrompt, input.context, input.language)}\n\nAI gateway fallback: ${friendlyGatewayError("slow AI stream", undefined, input.language)}`,
              ),
            );
            emitted = true;
            break;
          }

          const { done, value } = nextChunk;
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split(/\r?\n/);
          buffer = lines.pop() || "";

          for (const rawLine of lines) {
            const line = rawLine.trim();
            if (!line) continue;

            try {
              if (result.format === "ollama-jsonl") {
                const delta = extractOllamaDelta(JSON.parse(line));
                if (delta) {
                  emitted = true;
                  controller.enqueue(encoder.encode(delta));
                }
                continue;
              }

              if (!line.startsWith("data:")) continue;
              const data = line.slice(5).trim();
              if (!data || data === "[DONE]") continue;
              const delta = extractDelta(JSON.parse(data));
              if (delta) {
                emitted = true;
                controller.enqueue(encoder.encode(delta));
              }
            } catch {
              // Ignore malformed upstream chunks and keep streaming.
            }
          }
        }
      } catch {
        controller.enqueue(encoder.encode("\n\nAI stream interrupted. Instant answer remains available."));
      } finally {
        if (!emitted) {
          await tripProviderCircuit(result.provider, "error", "empty stream");
          recordAIEvent({
            provider: "built-in",
            operation: "fallback",
            status: "success",
            model: "built-in-coach",
            durationMs: 0,
            reason: `${result.provider} empty stream`,
          });
          controller.enqueue(
            encoder.encode(
              `${localCoachFallback(mode, cleanPrompt, input.context, input.language)}\n\nAI gateway fallback: ${friendlyGatewayError("empty AI stream", undefined, input.language)}`,
            ),
          );
        }
        controller.close();
      }
    },
  });

  return {
    success: true as const,
    stream,
    model: result.model,
    provider: result.provider,
  };
}
