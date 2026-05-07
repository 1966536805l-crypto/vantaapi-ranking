"use client";

import { useRef, useState } from "react";

type CoachMode = "english" | "programming";
type CoachEngine = "local" | "ai";

type CoachResponse = {
  success?: boolean;
  content?: string;
  provider?: "ai" | "local";
  model?: string;
  message?: string;
};

type CoachPhase = "idle" | "instant" | "streaming" | "done";

type AICoachPanelProps = {
  mode: CoachMode;
  title: string;
  subtitle: string;
  placeholder: string;
  quickPrompts: string[];
  context: unknown;
  language?: "en" | "zh";
};

const coachCopy = {
  en: {
    codeEyebrow: "Code AI",
    englishEyebrow: "English AI",
    ask: "Ask coach",
    thinking: "Fast answer",
    instantDraft: "instant draft",
    streaming: "streaming",
    fallbackStatus: "rate limited",
    unavailable: "Coach unavailable",
    noAnswer: "No answer",
    local: "Instant",
    ai: "Fast AI",
  },
  zh: {
    codeEyebrow: "编程 AI",
    englishEyebrow: "英语 AI",
    ask: "问教练",
    thinking: "快答中",
    instantDraft: "极速草稿",
    streaming: "流式输出",
    fallbackStatus: "可能限流",
    unavailable: "教练暂时不可用",
    noAnswer: "暂时没有回答",
    local: "本地极速",
    ai: "AI 快答",
  },
} as const;

function summarizeContext(context: unknown) {
  if (!context) return "";
  try {
    return JSON.stringify(context).slice(0, 260);
  } catch {
    return "";
  }
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
  language: "en" | "zh";
}) {
  const contextLine = summarizeContext(context);

  if (language === "zh") {
    if (mode === "english") {
      return [
        `先做这一小步 ${prompt}`,
        "只抓 1 个词或 1 个句型",
        "听一遍 合上释义 打一遍",
        "5 秒想不出就重听 不要硬猜",
        contextLine ? `当前材料 ${contextLine}` : "下一题 做对就过 做错只看一个提示",
      ].join("\n");
    }

    return [
      `先查这一步 ${prompt}`,
      "先预测输出 再提交",
      "错了只开一个提示",
      "实操题先补最小可运行片段",
      contextLine ? `当前上下文 ${contextLine}` : "不要先看完整答案",
    ].join("\n");
  }

  if (mode === "english") {
    return [
      `Next move ${prompt}`,
      "Train one word or one sentence pattern",
      "Listen once hide the meaning then type",
      "If recall takes over 5 seconds replay audio",
      contextLine ? `Context ${contextLine}` : "Correct moves on wrong gets one hint",
    ].join("\n");
  }

  return [
    `Next check ${prompt}`,
    "Predict the output before submitting",
    "Open one hint only after trying",
    "For practical tasks write the smallest runnable piece",
    contextLine ? `Context ${contextLine}` : "Do not read the full answer first",
  ].join("\n");
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
  const copy = coachCopy[language];

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
    const timeoutId = window.setTimeout(() => controller.abort(), 10000);

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
      let streamed = "";
      setPhase("streaming");
      setAnswer({
        success: true,
        provider: "ai",
        model: response.headers.get("x-coach-model") || "fast coach",
        content: "",
      });

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        streamed += decoder.decode(value, { stream: true });
        if (requestId !== requestIdRef.current) return;
        setAnswer({
          success: true,
          provider: "ai",
          model: response.headers.get("x-coach-model") || "fast coach",
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
        <span>
          {phase === "streaming"
            ? copy.streaming
            : phase === "instant"
              ? copy.instantDraft
              : answer?.provider
                ? `${answer.provider} ${answer.model || ""}`
                : engine === "local" ? copy.local : copy.fallbackStatus}
        </span>
      </div>

      {answer && (
        <div className="ai-coach-answer">
          <pre>{answer.content || answer.message || copy.noAnswer}</pre>
        </div>
      )}
    </section>
  );
}
