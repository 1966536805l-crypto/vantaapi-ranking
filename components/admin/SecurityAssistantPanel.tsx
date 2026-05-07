"use client";

import { useState } from "react";

type AssistantResponse = {
  success?: boolean;
  provider?: "gemini" | "configured" | "local";
  model?: string;
  content?: string;
  message?: string;
};

const defaultPrompt =
  "请检查这个 Next.js 学习网站的防爬虫 登录防护 API 限流 管理后台 和 AI 接口滥用风险 只给优先级最高的修复建议";

export default function SecurityAssistantPanel() {
  const [prompt, setPrompt] = useState(defaultPrompt);
  const [answer, setAnswer] = useState<AssistantResponse | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit() {
    setLoading(true);
    setAnswer(null);
    const response = await fetch("/api/admin/security-assistant", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });
    const data = (await response.json().catch(() => ({}))) as AssistantResponse;
    setLoading(false);
    setAnswer(response.ok ? data : { success: false, message: data.message || "Security assistant failed" });
  }

  return (
    <section className="apple-card p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="eyebrow">Security Assistant</p>
          <h2 className="mt-2 text-2xl font-semibold">Admin only AI review</h2>
        </div>
        <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800">
          rate limited
        </span>
      </div>

      <textarea
        value={prompt}
        onChange={(event) => setPrompt(event.target.value)}
        className="mt-4 min-h-32 w-full resize-y rounded-[8px] border border-[color:var(--hair)] bg-white/80 p-3 text-sm leading-6 outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
        maxLength={5000}
      />

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-[color:var(--muted)]">Gemini free tier first existing AI gateway second local rules last</p>
        <button type="button" onClick={submit} disabled={loading || prompt.trim().length < 4} className="apple-button-primary px-5 py-2.5 text-sm disabled:opacity-50">
          {loading ? "Checking" : "Run security review"}
        </button>
      </div>

      {answer && (
        <div className="mt-4 rounded-[8px] border border-[color:var(--hair)] bg-slate-950 p-3 text-sm leading-6 text-slate-100">
          <div className="mb-3 flex flex-wrap items-center gap-2 text-xs text-slate-400">
            <span>{answer.provider || "local"}</span>
            <span>{answer.model || "built-in-rules"}</span>
          </div>
          <pre className="whitespace-pre-wrap font-sans">{answer.content || answer.message || "No answer"}</pre>
        </div>
      )}
    </section>
  );
}
