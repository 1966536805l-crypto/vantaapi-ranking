"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ConsolePage from "@/components/ConsolePage";

const MISTAKE_TYPES = [
  "审题错",
  "概念不清",
  "公式乱用",
  "计算粗心",
  "图形没看出来",
  "变量关系没建出来",
  "第一突破口卡住",
  "会方法但表达乱",
] as const;

type MistakeType = typeof MISTAKE_TYPES[number];

export default function NewMistakePage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<{
    question: string;
    myAnswer: string;
    correctAnswer: string;
    myProcess: string;
    mistakeType: MistakeType;
    correctThinking: string;
    nextReviewAt: string;
  }>({
    question: "",
    myAnswer: "",
    correctAnswer: "",
    myProcess: "",
    mistakeType: MISTAKE_TYPES[0],
    correctThinking: "",
    nextReviewAt: "",
  });

  const userId = "demo-user"; // TODO: 从认证系统获取

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.question.trim() || !form.myAnswer.trim() || !form.correctAnswer.trim()) {
      alert("题目、我的答案、正确答案不能为空");
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch("/api/mistakes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          ...form,
          nextReviewAt: form.nextReviewAt || undefined,
        }),
      });

      const result = await response.json();

      if (result.success) {
        router.push("/mistakes");
      } else {
        alert(result.error || "添加失败");
        setSubmitting(false);
      }
    } catch (error) {
      console.error("添加错题失败:", error);
      alert("添加失败");
      setSubmitting(false);
    }
  };

  return (
    <ConsolePage
      eyebrow="新增错题"
      title="记录这道题的错因"
      description="填写完整信息，帮助你下次避免同样的错误。"
    >
      <form onSubmit={handleSubmit} className="mx-auto max-w-2xl">
        <div className="space-y-4 border border-slate-200 bg-white p-6 shadow-sm">
          <div>
            <label className="block text-sm font-semibold text-slate-700">
              题目内容 <span className="text-red-600">*</span>
            </label>
            <textarea
              value={form.question}
              onChange={(e) => setForm({ ...form, question: e.target.value })}
              rows={4}
              required
              className="mt-2 w-full border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-950 outline-none placeholder:text-slate-400 focus:border-blue-400"
              placeholder="输入题目内容或题目链接"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700">
              我的答案 <span className="text-red-600">*</span>
            </label>
            <textarea
              value={form.myAnswer}
              onChange={(e) => setForm({ ...form, myAnswer: e.target.value })}
              rows={3}
              required
              className="mt-2 w-full border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-950 outline-none placeholder:text-slate-400 focus:border-blue-400"
              placeholder="你写的答案"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700">
              正确答案 <span className="text-red-600">*</span>
            </label>
            <textarea
              value={form.correctAnswer}
              onChange={(e) => setForm({ ...form, correctAnswer: e.target.value })}
              rows={3}
              required
              className="mt-2 w-full border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-950 outline-none placeholder:text-slate-400 focus:border-blue-400"
              placeholder="标准答案或正确解法"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700">我的解题过程</label>
            <textarea
              value={form.myProcess}
              onChange={(e) => setForm({ ...form, myProcess: e.target.value })}
              rows={3}
              className="mt-2 w-full border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-950 outline-none placeholder:text-slate-400 focus:border-blue-400"
              placeholder="你是怎么做的（可选）"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700">
              错误类型 <span className="text-red-600">*</span>
            </label>
            <select
              value={form.mistakeType}
              onChange={(e) => setForm({ ...form, mistakeType: e.target.value as MistakeType })}
              required
              className="mt-2 w-full border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-950 outline-none focus:border-blue-400"
            >
              {MISTAKE_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700">正确思路</label>
            <textarea
              value={form.correctThinking}
              onChange={(e) => setForm({ ...form, correctThinking: e.target.value })}
              rows={3}
              className="mt-2 w-full border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-950 outline-none placeholder:text-slate-400 focus:border-blue-400"
              placeholder="应该怎么想（可选）"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700">下次复习时间</label>
            <input
              type="date"
              value={form.nextReviewAt}
              onChange={(e) => setForm({ ...form, nextReviewAt: e.target.value })}
              className="mt-2 w-full border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-950 outline-none focus:border-blue-400"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 border border-slate-300 bg-white px-5 py-3 font-semibold text-slate-700 hover:bg-slate-50"
              disabled={submitting}
            >
              取消
            </button>
            <button
              type="submit"
              className="flex-1 border border-blue-700 bg-blue-700 px-5 py-3 font-semibold text-white hover:bg-blue-800 disabled:opacity-50"
              disabled={submitting}
            >
              {submitting ? "提交中..." : "记录错题"}
            </button>
          </div>
        </div>
      </form>
    </ConsolePage>
  );
}
