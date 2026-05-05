"use client";

import { FormEvent, useState } from "react";
import ConsolePage from "@/components/ConsolePage";

type ChatMessage = {
  role: "user" | "assistant";
  text: string;
};

const prompts = [
  "按 USACO Bronze 到 Silver 的节奏，帮我排今天 90 分钟训练",
  "我卡在一道图论题，请先给提示，不要直接给完整答案",
  "帮我把这段代码按竞赛调试流程检查边界条件",
  "复盘今天训练：AC 了什么、WA 在哪里、下一场怎么练",
];

const coachModes = [
  { label: "Hint", value: "只给分层提示，不直接剧透完整解法" },
  { label: "Debug", value: "像赛后调试一样检查复杂度、边界和反例" },
  { label: "Plan", value: "生成可执行训练计划，拆成短时段任务" },
  { label: "Review", value: "做赛后复盘，指出下一步训练重点" },
] as const;

export default function AiPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      text: "我是 Immortal 的学习与项目助手。你可以问学习计划、代码建议、错题复盘或项目复盘。",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<(typeof coachModes)[number]["label"]>("Hint");

  const sendMessage = async (event?: FormEvent<HTMLFormElement>, preset?: string) => {
    event?.preventDefault();

    const message = (preset ?? input).trim();
    if (!message || loading) return;

    setInput("");
    setLoading(true);
    setMessages((current) => [...current, { role: "user", text: message }]);

    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: `你是 Immortal 的 USACO 竞赛训练教练。当前模式是 ${mode}：${coachModes.find((item) => item.label === mode)?.value}。回答要像竞赛训练平台的教练：先判断题型/目标，再给步骤、复杂度意识、边界条件或训练安排。围绕学习计划、代码建议、错题复盘、项目复盘回答，不做医疗诊断，不评价他人隐私。用户问题：${message}`,
        }),
      });
      const data = await response.json();

      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          text: response.ok
            ? data.text || "没有收到有效回复。"
            : data.error || "AI 请求失败。",
        },
      ]);
    } catch {
      setMessages((current) => [
        ...current,
        { role: "assistant", text: "网络请求失败，请稍后再试。" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ConsolePage
      eyebrow="AI Coach"
      title="像赛后教练一样拆题、调试、复盘。"
      description="把 AI 助手变成 USACO 训练台：先提示，再推理，再验复杂度，最后把下一次训练安排清楚。状态相关内容只做记录整理，不做医疗判断。"
    >
      <section className="grid gap-4 lg:grid-cols-[360px_minmax(0,1fr)]">
        <aside className="space-y-4">
          <div className="border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/60">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div>
                <p className="font-mono text-xs uppercase tracking-[0.2em] text-blue-700">
                  Judge Panel
                </p>
                <h2 className="mt-2 text-xl font-black text-slate-950">训练模式</h2>
              </div>
              <span className="border border-emerald-200 bg-emerald-50 px-2 py-1 font-mono text-[10px] uppercase text-emerald-700">
                ready
              </span>
            </div>

            <div className="mt-4 flex items-center gap-3">
              <span className="h-8 w-8 rounded-full border border-blue-200 bg-blue-50" />
              <span className="h-0 w-0 border-l-[18px] border-r-[18px] border-b-[30px] border-l-transparent border-r-transparent border-b-blue-600" />
              <span className="h-5 w-5 rounded-full bg-amber-300" />
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2">
              {coachModes.map((item) => (
                <button
                  key={item.label}
                  onClick={() => setMode(item.label)}
                  className={`border px-3 py-3 text-left font-mono text-xs transition ${
                    mode === item.label
                      ? "border-blue-600 bg-blue-600 text-white"
                      : "border-slate-200 bg-slate-50 text-slate-600 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <div className="mt-5 grid gap-2 font-mono text-[11px] uppercase text-slate-500">
              <div className="flex items-center justify-between border border-slate-200 bg-slate-50 px-3 py-2">
                <span>Model</span>
                <span className="text-amber-700">deepseek-v4-flash</span>
              </div>
              <div className="flex items-center justify-between border border-slate-200 bg-slate-50 px-3 py-2">
                <span>Style</span>
                <span className="text-blue-700">USACO</span>
              </div>
              <div className="flex items-center justify-between border border-slate-200 bg-slate-50 px-3 py-2">
                <span>Policy</span>
                <span className="text-emerald-700">private</span>
              </div>
            </div>
          </div>

          <div className="border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              快速提问
            </h2>
            <div className="mt-4 space-y-2">
            {prompts.map((prompt) => (
              <button
                key={prompt}
                onClick={() => sendMessage(undefined, prompt)}
                className="w-full border border-slate-200 bg-slate-50 px-4 py-3 text-left text-sm leading-6 text-slate-700 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
              >
                {prompt}
              </button>
            ))}
            </div>
          </div>
        </aside>

        <div className="overflow-hidden border border-slate-200 bg-white shadow-2xl shadow-slate-200/80">
          <div className="flex h-[72vh] min-h-[560px] flex-col">
            <div className="grid gap-4 border-b border-slate-200 bg-slate-50 px-5 py-4 sm:grid-cols-[1fr_auto] sm:items-center">
              <div>
                <p className="font-mono text-xs uppercase tracking-[0.22em] text-blue-700">
                  Immortal AI Coach
                </p>
                <p className="mt-2 text-lg font-black text-slate-950">Contest Workspace</p>
              </div>
              <div className="flex gap-2 font-mono text-[11px] uppercase">
                <span className="border border-emerald-200 bg-emerald-50 px-3 py-2 text-emerald-700">
                  Online
                </span>
                <span className="border border-amber-200 bg-amber-50 px-3 py-2 text-amber-700">
                  Mode {mode}
                </span>
              </div>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto bg-[linear-gradient(rgba(15,23,42,0.045)_1px,transparent_1px)] bg-[size:100%_40px] p-5">
              {messages.map((message, index) => (
                <div
                  key={`${message.role}-${index}`}
                  className={`flex ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[86%] whitespace-pre-wrap border px-4 py-3 text-sm leading-6 ${
                      message.role === "user"
                        ? "border-blue-600 bg-blue-600 text-white shadow-lg shadow-blue-100"
                        : "border-slate-200 bg-white text-slate-800 shadow-sm"
                    }`}
                  >
                    <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.18em] opacity-70">
                      {message.role === "user" ? "Submission" : "Coach Output"}
                    </p>
                    {message.text}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="border border-slate-200 bg-white px-4 py-3 font-mono text-xs uppercase tracking-[0.18em] text-slate-500 shadow-sm">
                  judging response...
                </div>
              )}
            </div>

            <form onSubmit={(event) => sendMessage(event)} className="border-t border-slate-200 bg-slate-50 p-4">
              <div className="flex flex-col gap-3">
                <textarea
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  maxLength={4000}
                  rows={3}
                  placeholder="贴题目、代码、错题原因或训练目标。比如：这道 DP 为什么会 TLE？"
                  className="min-h-24 w-full resize-none border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-950 outline-none placeholder:text-slate-400 focus:border-blue-400"
                />
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-slate-500">
                    no public ranking / no privacy display / no medical judgment
                  </p>
                  <button
                    type="submit"
                    disabled={loading || !input.trim()}
                    className="border border-blue-700 bg-blue-700 px-6 py-3 font-mono text-xs font-black uppercase tracking-[0.18em] text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-200 disabled:text-slate-400"
                  >
                    Submit
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </section>
    </ConsolePage>
  );
}
