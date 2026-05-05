"use client";

import { FormEvent, useState } from "react";
import ConsolePage from "@/components/ConsolePage";

type ChatMessage = {
  role: "user" | "assistant";
  text: string;
};

const prompts = [
  "帮我把今天的学习任务拆成 3 个阶段",
  "根据我的错题原因，生成下次复习计划",
  "帮我检查 Next.js 代码思路，不要直接替我乱改",
  "帮我做一次项目复盘：做完了什么、卡在哪里、下一步是什么",
];

export default function AiPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      text: "我是 Immortal 的学习与项目助手。你可以问学习计划、代码建议、错题复盘或项目复盘。",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

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
          message: `你是个人学习与项目控制台助手。请围绕学习计划、代码建议、错题复盘、项目复盘回答，不做医疗诊断，不评价他人隐私。用户问题：${message}`,
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
      eyebrow="AI 助手"
      title="生成学习计划、代码建议和复盘。"
      description="输入你的问题，AI 会围绕你的学习、项目、错题和复盘给建议。状态相关内容只做记录整理，不做医疗判断。"
    >
      <section className="grid gap-4 lg:grid-cols-[0.75fr_1.25fr]">
        <div className="rounded-lg border border-white/10 bg-white/[0.04] p-5">
          <h2 className="text-xl font-semibold text-white">快速提问</h2>
          <div className="mt-4 space-y-2">
            {prompts.map((prompt) => (
              <button
                key={prompt}
                onClick={() => sendMessage(undefined, prompt)}
                className="w-full rounded-lg border border-white/10 bg-black/20 px-4 py-3 text-left text-sm text-stone-300 transition hover:border-cyan-300/50 hover:text-cyan-100"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-hidden rounded-lg border border-white/10 bg-white/[0.04] shadow-2xl shadow-black/40">
          <div className="flex h-[66vh] min-h-[520px] flex-col">
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
              <div>
                <p className="font-semibold text-white">Immortal AI</p>
                <p className="mt-1 text-xs text-stone-500">学习 / 代码 / 复盘</p>
              </div>
              <span className="rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-semibold text-emerald-200">
                Online
              </span>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto p-5">
              {messages.map((message, index) => (
                <div
                  key={`${message.role}-${index}`}
                  className={`flex ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[82%] whitespace-pre-wrap rounded-lg px-4 py-3 text-sm leading-6 ${
                      message.role === "user"
                        ? "bg-cyan-300 text-black"
                        : "border border-white/10 bg-black/30 text-stone-100"
                    }`}
                  >
                    {message.text}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="rounded-lg border border-white/10 bg-black/30 px-4 py-3 text-sm text-stone-400">
                  生成中...
                </div>
              )}
            </div>

            <form onSubmit={(event) => sendMessage(event)} className="border-t border-white/10 bg-black/20 p-4">
              <div className="flex flex-col gap-3 sm:flex-row">
                <input
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  maxLength={4000}
                  placeholder="输入学习计划、代码建议或复盘问题"
                  className="min-w-0 flex-1 rounded-lg border border-white/10 bg-white/[0.06] px-4 py-3 text-white outline-none placeholder:text-stone-500 focus:border-cyan-300/60"
                />
                <button
                  type="submit"
                  disabled={loading || !input.trim()}
                  className="rounded-lg bg-cyan-300 px-6 py-3 font-semibold text-black transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:bg-stone-700 disabled:text-stone-400"
                >
                  发送
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>
    </ConsolePage>
  );
}
