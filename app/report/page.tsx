"use client";

import Link from "next/link";
import { useState } from "react";
import { useLang, withLang } from "@/lib/use-lang";

const reportTypes = {
  en: ["Illegal Content", "Copyright", "False Information", "Adult or Harmful", "Fraud", "Other"],
  zh: ["违法内容", "版权", "虚假信息", "成人或有害内容", "欺诈", "其他"],
};

const copy = {
  en: { back: "← Back Home", submitted: "Report Submitted", thanks: "Thank you", review: "We will review it", report: "Report", title: "Report Content", type: "Type *", contentId: "Content ID *", target: "Target content ID", reason: "Reason *", shortReason: "Short reason", details: "Details *", describe: "Describe the issue", email: "Email", submitFailed: "Submit failed", submitting: "Submitting", submit: "Submit" },
  zh: { back: "← 返回首页", submitted: "举报已提交", thanks: "谢谢", review: "我们会进行审核", report: "举报", title: "举报内容", type: "类型 *", contentId: "内容 ID *", target: "目标内容 ID", reason: "原因 *", shortReason: "简短原因", details: "详细说明 *", describe: "描述问题", email: "邮箱", submitFailed: "提交失败", submitting: "提交中", submit: "提交" },
};

export default function ReportPage() {
  const lang = useLang();
  const t = copy[lang];
  const types = reportTypes[lang];
  const [formData, setFormData] = useState({ type: types[0], targetId: "", reason: "", description: "", email: "" });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const response = await fetch("/api/reports", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(formData) });
      if (response.ok) setSubmitted(true);
      else {
        const error = await response.json().catch(() => ({}));
        alert(error.message || error.error || t.submitFailed);
      }
    } catch {
      alert(t.submitFailed);
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return <main className="min-h-screen bg-white text-slate-900"><div className="mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center px-4 py-7 text-center sm:px-6 sm:py-9"><p className="eyebrow">{t.submitted}</p><h1 className="mt-3 font-serif text-3xl tracking-tight">{t.thanks}</h1><p className="mt-3 text-sm leading-6 text-slate-600">{t.review}</p><Link href={withLang("/", lang)} className="mt-5 inline-flex border border-[color:var(--accent)] bg-[color:var(--accent)] px-4 py-2.5 text-sm font-semibold text-white">{t.back.replace("← ", "")}</Link></div></main>;
  }

  return (
    <main className="min-h-screen bg-white text-slate-900">
      <div className="mx-auto max-w-2xl px-4 py-7 sm:px-6 sm:py-9">
        <Link href={withLang("/", lang)} className="link text-sm">{t.back}</Link>
        <p className="eyebrow mt-6">{t.report}</p>
        <h1 className="mt-3 font-serif text-3xl tracking-tight">{t.title}</h1>
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <label className="block"><span className="eyebrow">{t.type}</span><select required value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} className="mt-2 w-full border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-[color:var(--accent)]">{types.map((type) => <option key={type}>{type}</option>)}</select></label>
          <label className="block"><span className="eyebrow">{t.contentId}</span><input required value={formData.targetId} onChange={(e) => setFormData({ ...formData, targetId: e.target.value })} className="mt-2 w-full border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-[color:var(--accent)]" placeholder={t.target} /></label>
          <label className="block"><span className="eyebrow">{t.reason}</span><input required value={formData.reason} onChange={(e) => setFormData({ ...formData, reason: e.target.value })} className="mt-2 w-full border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-[color:var(--accent)]" placeholder={t.shortReason} /></label>
          <label className="block"><span className="eyebrow">{t.details}</span><textarea required value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={6} className="mt-2 w-full border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-[color:var(--accent)]" placeholder={t.describe} /></label>
          <label className="block"><span className="eyebrow">{t.email}</span><input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="mt-2 w-full border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-[color:var(--accent)]" placeholder="your@email.com" /></label>
          <button type="submit" disabled={submitting} className="w-full border border-[color:var(--accent)] bg-[color:var(--accent)] px-6 py-3 font-semibold text-white transition hover:bg-[color:var(--accent-strong)] disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-200 disabled:text-slate-500">{submitting ? t.submitting : t.submit}</button>
        </form>
      </div>
    </main>
  );
}
