"use client";

import { useRef, useState } from "react";
import type { InterfaceLanguage } from "@/lib/language";

type CoachMode = "english" | "programming";
type CoachEngine = "local" | "ai";
type CoachProvider = "ai" | "local" | "gateway" | "ollama" | "built-in";

type CoachResponse = {
  success?: boolean;
  content?: string;
  provider?: CoachProvider;
  model?: string;
  message?: string;
};

type CoachPhase = "idle" | "instant" | "checking" | "streaming" | "done";

type AICoachPanelProps = {
  mode: CoachMode;
  title: string;
  subtitle: string;
  placeholder: string;
  quickPrompts: string[];
  context: unknown;
  language?: InterfaceLanguage;
};

type CoachCopy = {
  codeEyebrow: string;
  englishEyebrow: string;
  ask: string;
  thinking: string;
  instantDraft: string;
  checking: string;
  streaming: string;
  fallbackStatus: string;
  unavailable: string;
  noAnswer: string;
  local: string;
  ai: string;
  provider: string;
  draftStep: string;
  checkStep: string;
  finalStep: string;
  ready: string;
  fallback: string;
  cooldown: string;
  aiEmpty: string;
  aiTimeout: string;
};

const coachCopy: Partial<Record<InterfaceLanguage, CoachCopy>> & { en: CoachCopy; zh: CoachCopy } = {
  en: {
    codeEyebrow: "Code AI",
    englishEyebrow: "English AI",
    ask: "Ask coach",
    thinking: "Fast answer",
    instantDraft: "instant draft",
    checking: "model check",
    streaming: "streaming",
    fallbackStatus: "rate limited",
    unavailable: "Coach unavailable",
    noAnswer: "No answer",
    local: "Instant",
    ai: "Fast AI",
    provider: "Provider",
    draftStep: "Draft",
    checkStep: "Check",
    finalStep: "Final",
    ready: "Ready",
    fallback: "Fallback active",
    cooldown: "Provider cooling down",
    aiEmpty: "AI returned no useful text. Instant answer kept.",
    aiTimeout: "Fast AI timed out. Instant answer kept.",
  },
  zh: {
    codeEyebrow: "编程 AI",
    englishEyebrow: "英语 AI",
    ask: "问教练",
    thinking: "快答中",
    instantDraft: "极速草稿",
    checking: "检查模型",
    streaming: "流式输出",
    fallbackStatus: "可能限流",
    unavailable: "教练暂时不可用",
    noAnswer: "暂时没有回答",
    local: "本地极速",
    ai: "AI 快答",
    provider: "当前引擎",
    draftStep: "草稿",
    checkStep: "检查",
    finalStep: "答案",
    ready: "待命",
    fallback: "兜底已接管",
    cooldown: "模型冷却中",
    aiEmpty: "AI 没有返回有效内容 已保留极速答案",
    aiTimeout: "AI 快答超时 已保留极速答案",
  },
  ja: {
    codeEyebrow: "コード AI",
    englishEyebrow: "英語 AI",
    ask: "コーチに聞く",
    thinking: "高速回答",
    instantDraft: "即時下書き",
    checking: "モデル確認",
    streaming: "出力中",
    fallbackStatus: "制限中",
    unavailable: "コーチは一時利用不可",
    noAnswer: "回答なし",
    local: "即時",
    ai: "高速 AI",
    provider: "提供元",
    draftStep: "下書き",
    checkStep: "確認",
    finalStep: "回答",
    ready: "待機中",
    fallback: "代替回答中",
    cooldown: "提供元クールダウン中",
    aiEmpty: "AI から有効な内容が返らなかったため即時回答を残しました。",
    aiTimeout: "高速 AI がタイムアウトしたため即時回答を残しました。",
  },
  ko: {
    codeEyebrow: "코드 AI",
    englishEyebrow: "영어 AI",
    ask: "코치에게 묻기",
    thinking: "빠른 답변",
    instantDraft: "즉시 초안",
    checking: "모델 확인",
    streaming: "출력 중",
    fallbackStatus: "제한됨",
    unavailable: "코치를 사용할 수 없음",
    noAnswer: "답변 없음",
    local: "즉시",
    ai: "빠른 AI",
    provider: "제공자",
    draftStep: "초안",
    checkStep: "확인",
    finalStep: "답변",
    ready: "대기",
    fallback: "대체 답변 사용",
    cooldown: "제공자 대기 중",
    aiEmpty: "AI 가 유효한 내용을 반환하지 않아 즉시 답변을 유지했습니다.",
    aiTimeout: "빠른 AI 시간이 초과되어 즉시 답변을 유지했습니다.",
  },
  es: {
    codeEyebrow: "AI de código",
    englishEyebrow: "AI de inglés",
    ask: "Preguntar al coach",
    thinking: "Respuesta rápida",
    instantDraft: "borrador instantáneo",
    checking: "revisión del modelo",
    streaming: "generando",
    fallbackStatus: "limitado",
    unavailable: "Coach no disponible",
    noAnswer: "Sin respuesta",
    local: "Instantáneo",
    ai: "AI rápida",
    provider: "Proveedor",
    draftStep: "Borrador",
    checkStep: "Revisión",
    finalStep: "Final",
    ready: "Listo",
    fallback: "Fallback activo",
    cooldown: "Proveedor en pausa",
    aiEmpty: "La AI no devolvió contenido útil. Se mantuvo la respuesta instantánea.",
    aiTimeout: "La AI rápida tardó demasiado. Se mantuvo la respuesta instantánea.",
  },
  ar: {
    codeEyebrow: "AI للكود",
    englishEyebrow: "AI للإنجليزية",
    ask: "اسأل المدرب",
    thinking: "إجابة سريعة",
    instantDraft: "مسودة فورية",
    checking: "فحص النموذج",
    streaming: "جار الإرسال",
    fallbackStatus: "محدود",
    unavailable: "المدرب غير متاح",
    noAnswer: "لا توجد إجابة",
    local: "فوري",
    ai: "AI سريع",
    provider: "المزود",
    draftStep: "مسودة",
    checkStep: "فحص",
    finalStep: "نهائي",
    ready: "جاهز",
    fallback: "تم تفعيل البديل",
    cooldown: "المزود في فترة تهدئة",
    aiEmpty: "لم يرجع AI محتوى مفيدا لذلك بقيت الإجابة الفورية.",
    aiTimeout: "انتهت مهلة AI السريع لذلك بقيت الإجابة الفورية.",
  },
};

function getCoachCopy(language: InterfaceLanguage) {
  return coachCopy[language] || coachCopy.en;
}

function contextRecord(context: unknown): Record<string, unknown> {
  if (context && typeof context === "object" && !Array.isArray(context)) {
    return context as Record<string, unknown>;
  }
  return {};
}

function cleanValue(value: unknown, max = 120) {
  if (typeof value !== "string" && typeof value !== "number") return "";
  return String(value).replace(/\s+/g, " ").trim().slice(0, max);
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

function memoryHook(word: string, language: InterfaceLanguage) {
  if (!word) return language === "zh" ? "先听音 再拼写 再看释义" : "listen first then spell then check the meaning";

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

  if (bucket === 0 && last) return `split ${word} into ${first} and ${last} then spell it once`;
  if (bucket === 1) return `attach ${word} to one real action instead of a translation`;
  return `learn one collocation then use ${word} in a short sentence`;
}

function englishInstantAnswer(prompt: string, context: unknown, language: InterfaceLanguage) {
  const word = readContextValue(context, ["word", "term", "title"], 60) || firstEnglishWord(prompt);
  const meaning =
    readContextValue(context, language === "zh" ? ["meaningZh", "translation", "meaning", "meaningEn"] : ["meaningEn", "meaning", "meaningZh"], 110);
  const collocation = readContextValue(context, ["collocation", "phrase"], 90);
  const sentence = readContextValue(context, ["sentence", "example"], 130);
  const target = word || (language === "zh" ? "这个词" : "this word");

  if (language === "zh") {
    return [
      `先练 ${target} 听一遍再拼一遍`,
      meaning ? `核心意思 ${meaning}` : "先自己说出中文意思 再看答案",
      `记忆钩子 ${memoryHook(target, language)}`,
      collocation || sentence ? `用法 ${collocation || sentence}` : `例句 I can use ${target} in one clear sentence`,
      `5 秒内拼出 ${target} 错了就重听`,
    ].join("\n");
  }

  return [
    `Practice ${target} by listening once and spelling once`,
    meaning ? `Core meaning ${meaning}` : "Say the meaning before checking it",
    `Memory hook ${memoryHook(target, language)}`,
    collocation || sentence ? `Usage ${collocation || sentence}` : `Example I can use ${target} in one clear sentence`,
    `Spell ${target} within 5 seconds or replay it`,
  ].join("\n");
}

function programmingNextMove(type: string, prompt: string, language: InterfaceLanguage) {
  const source = `${type} ${prompt}`.toLowerCase();
  if (language === "zh") {
    if (source.includes("bug") || source.includes("error") || source.includes("报错")) return "先锁定报错行 再只改一处";
    if (source.includes("output") || source.includes("输出")) return "先手算每个变量的变化";
    if (source.includes("fill") || source.includes("填空")) return "只看空格前后一行";
    if (source.includes("choice") || source.includes("选择")) return "先排除会改变类型或输出的选项";
    if (source.includes("practical") || source.includes("实操")) return "先写最小可运行骨架";
    return "先把题目压成一个最小例子";
  }

  if (language === "ja") {
    if (source.includes("bug") || source.includes("error")) return "エラー行を特定して一つだけ変える";
    if (source.includes("output") || source.includes("出力")) return "選ぶ前に各変数を追跡する";
    if (source.includes("fill") || source.includes("穴埋め")) return "空欄の前後一行だけを見る";
    if (source.includes("choice") || source.includes("選択")) return "型や出力を変える選択肢を外す";
    if (source.includes("practical") || source.includes("実践")) return "最小の実行可能な骨組みを書く";
    return "問題を一つの小さな例に縮める";
  }

  if (language === "ko") {
    if (source.includes("bug") || source.includes("error")) return "오류 줄을 찾고 하나만 바꿉니다";
    if (source.includes("output") || source.includes("출력")) return "선택 전에 각 변수를 추적합니다";
    if (source.includes("fill") || source.includes("빈칸")) return "빈칸 앞뒤 한 줄만 봅니다";
    if (source.includes("choice") || source.includes("선택")) return "타입이나 출력을 바꾸는 선택지를 제거합니다";
    if (source.includes("practical") || source.includes("실습")) return "가장 작은 실행 가능한 뼈대를 씁니다";
    return "문제를 작은 예시 하나로 줄입니다";
  }

  if (language === "es") {
    if (source.includes("bug") || source.includes("error")) return "aísla la línea del error y cambia una sola cosa";
    if (source.includes("output") || source.includes("salida")) return "traza cada variable antes de elegir";
    if (source.includes("fill") || source.includes("rellenar")) return "lee solo la línea antes y después del hueco";
    if (source.includes("choice") || source.includes("opción")) return "descarta opciones que cambian tipo o salida";
    if (source.includes("practical") || source.includes("práctica")) return "escribe el esqueleto ejecutable más pequeño";
    return "reduce la pregunta a un ejemplo mínimo";
  }

  if (language === "ar") {
    if (source.includes("bug") || source.includes("error")) return "حدد سطر الخطأ ثم غيّر شيئا واحدا";
    if (source.includes("output") || source.includes("الناتج")) return "تتبع كل متغير قبل الاختيار";
    if (source.includes("fill") || source.includes("فراغ")) return "اقرأ السطر قبل الفراغ وبعده فقط";
    if (source.includes("choice") || source.includes("اختيار")) return "استبعد الخيارات التي تغير النوع أو الناتج";
    if (source.includes("practical") || source.includes("عملي")) return "اكتب أصغر هيكل قابل للتشغيل";
    return "اختصر السؤال إلى مثال صغير جدا";
  }

  if (source.includes("bug") || source.includes("error")) return "isolate the error line then change one thing";
  if (source.includes("output")) return "trace each variable before choosing";
  if (source.includes("fill")) return "read only the line before and after the blank";
  if (source.includes("choice")) return "remove options that change the type or output";
  if (source.includes("practical")) return "write the smallest runnable skeleton first";
  return "reduce the question to one tiny example";
}

function programmingInstantAnswer(promptText: string, context: unknown, language: InterfaceLanguage) {
  const topic = readContextValue(context, ["language", "languageRole", "topic", "title"], 80);
  const questionType = readContextValue(context, ["questionType", "type"], 50);
  const questionNumber = readContextValue(context, ["questionNumber", "index"], 20);
  const prompt = readContextValue(context, ["prompt", "question", "lesson"], 150) || promptText;
  const code = readContextValue(context, ["codeSnippet", "code"], 140);
  const answer = readContextValue(context, ["studentAnswer", "answer"], 90);

  if (language === "zh") {
    return [
      `先看 ${topic || "当前语言"}${questionNumber ? ` 第 ${questionNumber} 题` : ""}${questionType ? ` ${questionType}` : ""}`,
      `下一步 ${programmingNextMove(questionType, prompt, language)}`,
      code ? "关键点 逐行跟踪变量 不要跳读代码" : "关键点 先讲清一个概念 再写代码",
      answer ? `你的答案 ${answer} 先找第一处不确定` : "先写预测 再开提示",
      "小练习 换一组变量名再做一次",
    ].join("\n");
  }

  if (language === "ja") {
    return [
      `${topic || "現在の言語"}${questionNumber ? ` 問題 ${questionNumber}` : ""}${questionType ? ` ${questionType}` : ""} に集中`,
      `次の一手 ${programmingNextMove(questionType, prompt, language)}`,
      code ? "要点 変数を一行ずつ追跡する" : "要点 コードを書く前に概念を一つだけ説明する",
      answer ? `あなたの答え ${answer} まず不確かな一歩を探す` : "先に予測してからヒントを一つ開く",
      "小練習 変数名を変えてもう一度",
    ].join("\n");
  }

  if (language === "ko") {
    return [
      `${topic || "현재 언어"}${questionNumber ? ` ${questionNumber}번 문제` : ""}${questionType ? ` ${questionType}` : ""} 에 집중`,
      `다음 행동 ${programmingNextMove(questionType, prompt, language)}`,
      code ? "핵심 변수 변화를 한 줄씩 추적합니다" : "핵심 코딩 전에 개념 하나를 설명합니다",
      answer ? `내 답 ${answer} 먼저 불확실한 부분 하나를 찾습니다` : "먼저 예측하고 힌트 하나를 엽니다",
      "작은 연습 변수 이름을 바꿔 다시 해 봅니다",
    ].join("\n");
  }

  if (language === "es") {
    return [
      `enfócate en ${topic || "el lenguaje actual"}${questionNumber ? ` pregunta ${questionNumber}` : ""}${questionType ? ` ${questionType}` : ""}`,
      `siguiente paso ${programmingNextMove(questionType, prompt, language)}`,
      code ? "idea clave traza variables línea por línea" : "idea clave explica un concepto antes de programar",
      answer ? `tu respuesta ${answer} busca el primer paso dudoso` : "predice primero y abre una pista",
      "mini ejercicio repite con nuevos nombres de variables",
    ].join("\n");
  }

  if (language === "ar") {
    return [
      `ركز على ${topic || "اللغة الحالية"}${questionNumber ? ` السؤال ${questionNumber}` : ""}${questionType ? ` ${questionType}` : ""}`,
      `الخطوة التالية ${programmingNextMove(questionType, prompt, language)}`,
      code ? "الفكرة الأساسية تتبع المتغيرات سطرا بسطر" : "الفكرة الأساسية اشرح مفهوما واحدا قبل كتابة الكود",
      answer ? `إجابتك ${answer} ابحث عن أول خطوة غير مؤكدة` : "توقع أولا ثم افتح تلميحا واحدا",
      "تمرين صغير كرر الحل بأسماء متغيرات جديدة",
    ].join("\n");
  }

  return [
    `Focus on ${topic || "the current language"}${questionNumber ? ` question ${questionNumber}` : ""}${questionType ? ` ${questionType}` : ""}`,
    `Next move ${programmingNextMove(questionType, prompt, language)}`,
    code ? "Key idea trace variables line by line" : "Key idea explain one concept before coding",
    answer ? `Your answer ${answer} find the first uncertain step` : "Predict first then open one hint",
    "Tiny drill repeat it with new variable names",
  ].join("\n");
}

function localCoachAnswer({
  mode,
  prompt,
  context,
  language,
}: {
  mode: CoachMode;
  prompt: string;
  context: unknown;
  language: InterfaceLanguage;
}) {
  return mode === "english"
    ? englishInstantAnswer(prompt, context, language)
    : programmingInstantAnswer(prompt, context, language);
}

function normalizeProvider(value: string | null): CoachProvider {
  if (value === "gateway" || value === "ollama" || value === "built-in" || value === "local" || value === "ai") {
    return value;
  }
  return "ai";
}

function providerName(provider: CoachProvider | undefined, language: InterfaceLanguage) {
  const copy = getCoachCopy(language);
  if (provider === "gateway") return "GLM";
  if (provider === "ollama") {
    if (language === "zh") return "Ollama 本地";
    if (language === "ja") return "Ollama ローカル";
    if (language === "ko") return "Ollama 로컬";
    if (language === "es") return "Ollama local";
    if (language === "ar") return "Ollama محلي";
    return "Ollama local";
  }
  if (provider === "built-in" || provider === "local") return copy.local;
  return copy.ai;
}

function isFallbackAnswer(answer: CoachResponse | null) {
  const text = `${answer?.content || ""}\n${answer?.message || ""}\n${answer?.model || ""}`.toLowerCase();
  return answer?.provider === "local" || text.includes("fallback") || text.includes("兜底") || text.includes("限流") || text.includes("冷却");
}

function phaseText({
  phase,
  answer,
  engine,
  language,
}: {
  phase: CoachPhase;
  answer: CoachResponse | null;
  engine: CoachEngine;
  language: InterfaceLanguage;
}) {
  const copy = getCoachCopy(language);
  if (engine === "local") return copy.local;
  if (phase === "instant") return copy.instantDraft;
  if (phase === "checking") return copy.checking;
  if (phase === "streaming") return copy.streaming;
  if (isFallbackAnswer(answer)) return copy.fallback;
  if (phase === "done" && answer?.provider) return `${providerName(answer.provider, language)} ${answer.model || ""}`.trim();
  return copy.ready;
}

export default function AICoachPanel({
  mode,
  title,
  subtitle,
  placeholder,
  quickPrompts,
  context,
  language = "en",
}: AICoachPanelProps) {
  const [prompt, setPrompt] = useState("");
  const [answer, setAnswer] = useState<CoachResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [engine, setEngine] = useState<CoachEngine>("ai");
  const [phase, setPhase] = useState<CoachPhase>("idle");
  const requestIdRef = useRef(0);
  const copy = getCoachCopy(language);

  async function ask(nextPrompt = prompt) {
    const cleanPrompt = nextPrompt.trim();
    if (!cleanPrompt) return;
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;
    const instantContent = localCoachAnswer({ mode, prompt: cleanPrompt, context, language });

    setPrompt(cleanPrompt);
    setLoading(true);
    setPhase("instant");
    setAnswer({
      success: true,
      provider: "local",
      model: copy.instantDraft,
      content: instantContent,
    });

    if (engine === "local") {
      setLoading(false);
      setPhase("done");
      return;
    }

    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 3600);
    setPhase("checking");

    try {
      const response = await fetch(`/api/ai/coach?lang=${encodeURIComponent(language)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode, prompt: cleanPrompt, context, language, stream: true }),
        signal: controller.signal,
      });

      if (requestId !== requestIdRef.current) return;

      const contentType = response.headers.get("content-type") || "";
      if (!response.ok || contentType.includes("application/json") || !response.body) {
        const data = (await response.json().catch(() => ({}))) as CoachResponse;
        setAnswer({
          success: true,
          provider: data.provider || "local",
          model: data.model || copy.fallback,
          content: data.content || `${instantContent}\n\n${data.message || copy.unavailable}`,
        });
        setPhase("done");
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      const responseProvider = normalizeProvider(response.headers.get("x-coach-provider"));
      const responseModel = response.headers.get("x-coach-model") || copy.ai;
      let streamed = "";
      setPhase("streaming");
      setAnswer({
        success: true,
        provider: responseProvider,
        model: responseModel,
        content: "",
      });

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        streamed += decoder.decode(value, { stream: true });
        if (requestId !== requestIdRef.current) return;
        setAnswer({
          success: true,
          provider: responseProvider,
          model: responseModel,
          content: streamed,
        });
      }

      if (!streamed.trim()) {
        setAnswer({
          success: true,
          provider: "local",
          model: copy.fallback,
          content: `${instantContent}\n\n${copy.aiEmpty}`,
        });
      }
      setPhase("done");
    } catch {
      if (requestId !== requestIdRef.current) return;
      setAnswer({
        success: true,
        provider: "local",
        model: copy.fallback,
        content: `${instantContent}\n\n${copy.aiTimeout}`,
      });
      setPhase("done");
    } finally {
      window.clearTimeout(timeoutId);
      if (requestId === requestIdRef.current) setLoading(false);
    }
  }

  const statusLabel = phaseText({ phase, answer, engine, language });
  const activeProvider = providerName(answer?.provider || (engine === "local" ? "local" : "ai"), language);
  const fallbackActive = isFallbackAnswer(answer);
  const hasAnswer = Boolean(answer);

  return (
    <section className={`ai-coach-panel ai-coach-${mode}`}>
      <div className="ai-coach-head">
        <div>
          <p className="eyebrow">{mode === "english" ? copy.englishEyebrow : copy.codeEyebrow}</p>
          <h3>{title}</h3>
        </div>
        <span>{mode === "english" ? "EN" : "</>"}</span>
      </div>
      <p className="ai-coach-subtitle">{subtitle}</p>

      <div className="ai-coach-meta">
        <span>{copy.provider} {activeProvider}</span>
        <span>{statusLabel}</span>
        {fallbackActive && <span className="ai-coach-meta-warn">{copy.cooldown}</span>}
      </div>

      <div className="mb-3 flex flex-wrap gap-2">
        <button
          type="button"
          className={engine === "local" ? "dense-action-primary" : "dense-action"}
          onClick={() => setEngine("local")}
        >
          {copy.local}
        </button>
        <button
          type="button"
          className={engine === "ai" ? "dense-action-primary" : "dense-action"}
          onClick={() => setEngine("ai")}
        >
          {copy.ai}
        </button>
      </div>

      <div className="ai-coach-quick">
        {quickPrompts.map((item) => (
          <button key={item} type="button" onClick={() => void ask(item)}>
            {item}
          </button>
        ))}
      </div>

      <textarea
        value={prompt}
        onChange={(event) => setPrompt(event.target.value)}
        onKeyDown={(event) => {
          if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
            event.preventDefault();
            void ask();
          }
        }}
        className="ai-coach-input"
        placeholder={placeholder}
        maxLength={900}
      />

      <div className="ai-coach-actions">
        <button type="button" className="dense-action-primary" onClick={() => void ask()} disabled={loading || prompt.trim().length === 0}>
          {loading ? copy.thinking : copy.ask}
        </button>
        <span>{statusLabel}</span>
      </div>

      {hasAnswer && (
        <div className="ai-coach-answer">
          <div className="ai-coach-progress" aria-label={statusLabel}>
            {[
              { key: "instant", label: copy.draftStep },
              { key: "checking", label: copy.checkStep },
              { key: "done", label: copy.finalStep },
            ].map((step, index) => {
              const done =
                phase === "done" ||
                (step.key === "instant" && phase !== "idle") ||
                (step.key === "checking" && (phase === "checking" || phase === "streaming")) ||
                (step.key === "done" && phase === "streaming");
              const active =
                (step.key === "instant" && phase === "instant") ||
                (step.key === "checking" && phase === "checking") ||
                (step.key === "done" && (phase === "streaming" || phase === "done"));

              return (
                <div key={step.key} className={`ai-coach-step ${done ? "is-done" : ""} ${active ? "is-active" : ""}`}>
                  <span>{index + 1}</span>
                  {step.label}
                </div>
              );
            })}
          </div>
          <div className="ai-coach-answer-meta">
            <span>{activeProvider}</span>
            {answer?.model && <span>{answer.model}</span>}
            {fallbackActive && <span>{copy.fallback}</span>}
          </div>
          <pre>{answer?.content || answer?.message || copy.noAnswer}</pre>
        </div>
      )}
    </section>
  );
}
