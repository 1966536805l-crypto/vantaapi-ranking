"use client";

import Link from "next/link";
import { useState } from "react";

export default function ReportPage() {
  const [formData, setFormData] = useState({
    type: "违法内容",
    targetId: "",
    reason: "",
    description: "",
    email: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSubmitted(true);
      } else {
        const error = await response.json();
        alert(`提交失败：${error.message}`);
      }
    } catch {
      alert("提交失败，请重试");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-[#07070a] via-[#0a0a0f] to-[#0d0a08] text-stone-100">
        <div className="mx-auto flex min-h-screen w-full max-w-2xl flex-col items-center justify-center px-5 py-6 sm:px-8">
          <div className="rounded-xl border border-lime-300/30 bg-gradient-to-br from-white/[0.04] to-white/[0.02] p-8 text-center backdrop-blur-sm">
            <div className="mb-4 text-6xl">✓</div>
            <h2 className="mb-3 text-2xl font-bold text-lime-200">投诉已提交</h2>
            <p className="mb-6 text-stone-400">我们会尽快处理您的投诉，感谢您的反馈。</p>
            <Link href="/" className="rounded-lg bg-lime-300 px-6 py-3 font-semibold text-black transition hover:bg-lime-200">
              返回首页
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#07070a] via-[#0a0a0f] to-[#0d0a08] text-stone-100">
      <div className="mx-auto min-h-screen w-full max-w-2xl px-5 py-6 sm:px-8">
        <nav className="mb-10 flex items-center justify-between border-b border-white/10 pb-5">
          <Link href="/" className="flex items-center gap-3 text-stone-200 transition hover:text-lime-200">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-lime-300 text-sm font-black text-black">I</span>
            <span className="font-semibold">返回首页</span>
          </Link>
        </nav>

        <div className="rounded-xl border border-white/10 bg-gradient-to-br from-white/[0.04] to-white/[0.02] p-6 backdrop-blur-sm sm:p-8">
          <h1 className="mb-6 text-3xl font-bold text-white">投诉举报</h1>

          <div className="mb-6 rounded-lg border border-yellow-500/20 bg-yellow-900/10 p-4 text-sm text-stone-300">
            <p className="font-semibold text-yellow-200">投诉须知</p>
            <ul className="ml-4 mt-2 list-disc space-y-1">
              <li>请提供详细的投诉信息和证据</li>
              <li>我们会在收到投诉后尽快处理</li>
              <li>恶意投诉将被记录并可能被追究责任</li>
            </ul>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-stone-300">投诉类型 *</label>
              <select
                required
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full rounded-lg border border-white/10 bg-[#111115] px-4 py-3 text-white outline-none transition focus:border-lime-300/60"
              >
                <option>违法内容</option>
                <option>侵权内容</option>
                <option>虚假信息</option>
                <option>色情低俗</option>
                <option>诈骗信息</option>
                <option>其他</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-stone-300">内容ID *</label>
              <input
                type="text"
                required
                value={formData.targetId}
                onChange={(e) => setFormData({ ...formData, targetId: e.target.value })}
                className="w-full rounded-lg border border-white/10 bg-white/[0.06] px-4 py-3 text-white outline-none transition placeholder:text-stone-500 focus:border-lime-300/60"
                placeholder="要投诉的内容ID"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-stone-300">投诉原因 *</label>
              <input
                type="text"
                required
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                className="w-full rounded-lg border border-white/10 bg-white/[0.06] px-4 py-3 text-white outline-none transition placeholder:text-stone-500 focus:border-lime-300/60"
                placeholder="简要说明投诉原因"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-stone-300">详细说明 *</label>
              <textarea
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={6}
                className="w-full rounded-lg border border-white/10 bg-white/[0.06] px-4 py-3 text-white outline-none transition placeholder:text-stone-500 focus:border-lime-300/60"
                placeholder="请详细描述投诉内容和理由"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-stone-300">联系邮箱（选填）</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full rounded-lg border border-white/10 bg-white/[0.06] px-4 py-3 text-white outline-none transition placeholder:text-stone-500 focus:border-lime-300/60"
                placeholder="your@email.com"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-lg bg-lime-300 px-6 py-3 font-semibold text-black transition hover:bg-lime-200 disabled:cursor-not-allowed disabled:bg-stone-700 disabled:text-stone-400"
            >
              {submitting ? "提交中..." : "提交投诉"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
