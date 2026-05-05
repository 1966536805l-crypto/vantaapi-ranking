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
      text: "你好，我是 VantaAPI 的轻量 AI 助手。",
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto flex min-h-screen max-w-4xl flex-col px-4 py-8">
        <div className="mb-6">
          <Link
            href="/"
            className="mb-4 inline-block text-blue-600 hover:text-blue-700 dark:text-blue-400"
          >
            ← 返回首页
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            Gemini AI
          </h1>
        </div>

        <div className="flex-1 overflow-hidden rounded-lg bg-white shadow-lg dark:bg-gray-800">
          <div className="flex h-[65vh] flex-col">
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
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-gray-100"
                    }`}
                  >
                    {message.text}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="rounded-lg bg-gray-100 px-4 py-3 text-sm text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                    思考中...
                  </div>
                </div>
              )}
            </div>

            <form
              onSubmit={sendMessage}
              className="border-t border-gray-200 p-4 dark:border-gray-700"
            >
              <div className="flex gap-3">
                <input
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  maxLength={4000}
                  placeholder="问 Gemini 一个问题"
                  className="min-w-0 flex-1 rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-blue-500 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
                />
                <button
                  type="submit"
                  disabled={loading || !input.trim()}
                  className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
                >
                  发送
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
