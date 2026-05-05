"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

type ChatMessage = {
  role: "user" | "assistant";
  text: string;
};

export default function AiPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      text: "你好，我是 Immortal 的 AI 助手。",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const message = input.trim();
    if (!message || loading) return;

    setInput("");
    setLoading(true);
    setMessages((current) => [...current, { role: "user", text: message }]);

    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
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
    <main className="min-h-screen bg-[#07070a] text-stone-100">
      <div className="mx-auto flex min-h-screen w-full max-w-5xl flex-col px-5 py-6 sm:px-8">
        <nav className="mb-8 flex items-center justify-between border-b border-white/10 pb-5">
          <Link
            href="/"
            className="flex items-center gap-3 text-stone-200 transition hover:text-lime-200"
          >
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-lime-300 text-sm font-black text-black">
              I
            </span>
            <span className="font-semibold">Immortal</span>
          </Link>
          <Link
            href="/submit"
            className="rounded-lg border border-white/10 px-4 py-2 text-sm text-stone-200 transition hover:border-lime-300/50 hover:text-lime-200"
          >
            提交项目
          </Link>
        </nav>

        <header className="mb-7">
          <p className="mb-3 text-sm font-medium text-lime-200">
            Immortal Assistant
          </p>
          <h1 className="text-4xl font-semibold text-white sm:text-5xl">
            AI 助手
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-stone-400">
            快速提问、整理想法，或者让它帮你判断一个工具是否值得进入榜单。
          </p>
        </header>

        <div className="flex-1 overflow-hidden rounded-lg border border-white/10 bg-white/[0.04] shadow-2xl shadow-black/40">
          <div className="flex h-[66vh] min-h-[520px] flex-col">
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
              <div>
                <p className="font-semibold text-white">Immortal AI</p>
                <p className="mt-1 text-xs text-stone-500">Qwen powered</p>
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
                        ? "bg-lime-300 text-black"
                        : "border border-white/10 bg-black/30 text-stone-100"
                    }`}
                  >
                    {message.text}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="rounded-lg border border-white/10 bg-black/30 px-4 py-3 text-sm text-stone-400">
                    思考中...
                  </div>
                </div>
              )}
            </div>

            <form
              onSubmit={sendMessage}
              className="border-t border-white/10 bg-black/20 p-4"
            >
              <div className="flex flex-col gap-3 sm:flex-row">
                <input
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  maxLength={4000}
                  placeholder="问 AI 一个问题"
                  className="min-w-0 flex-1 rounded-lg border border-white/10 bg-white/[0.06] px-4 py-3 text-white outline-none transition placeholder:text-stone-500 focus:border-lime-300/60"
                />
                <button
                  type="submit"
                  disabled={loading || !input.trim()}
                  className="rounded-lg bg-lime-300 px-6 py-3 font-semibold text-black transition hover:bg-lime-200 disabled:cursor-not-allowed disabled:bg-stone-700 disabled:text-stone-400"
                >
                  发送
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}
