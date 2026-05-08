"use client";

import { useRef, useState } from "react";
import { bilingualLanguage, type InterfaceLanguage } from "@/lib/language";

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

const coachCopy = {
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
  },
} as const;

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
  if (provider === "gateway") return language === "zh" ? "GLM" : "GLM";
  if (provider === "ollama") return language === "zh" ? "Ollama 本地" : "Ollama local";
  if (provider === "built-in" || provider === "local") return language === "zh" ? "内置教练" : "built in coach";
  return language === "zh" ? "AI 快答" : "fast AI";
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
  const copy = coachCopy[bilingualLanguage(language)];
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
  const copy = coachCopy[bilingualLanguage(language)];

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
      model: language === "zh" ? "极速草稿" : "instant draft",
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
      const response = await fetch("/api/ai/coach", {
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
          model: data.model || (language === "zh" ? "本地兜底" : "local fallback"),
          content: data.content || `${instantContent}\n\n${data.message || copy.unavailable}`,
        });
        setPhase("done");
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      const responseProvider = normalizeProvider(response.headers.get("x-coach-provider"));
      const responseModel = response.headers.get("x-coach-model") || "fast coach";
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
          model: language === "zh" ? "空响应兜底" : "empty fallback",
          content: `${instantContent}\n\n${language === "zh" ? "AI 没有返回有效内容 已保留极速答案" : "AI returned no useful text. Instant answer kept."}`,
        });
      }
      setPhase("done");
    } catch {
      if (requestId !== requestIdRef.current) return;
      setAnswer({
        success: true,
        provider: "local",
        model: language === "zh" ? "超时兜底" : "timeout fallback",
        content: `${instantContent}\n\n${language === "zh" ? "AI 快答超时 已保留极速答案" : "Fast AI timed out. Instant answer kept."}`,
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
