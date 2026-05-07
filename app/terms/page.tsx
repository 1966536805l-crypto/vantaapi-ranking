import Link from "next/link";

type Lang = "en" | "zh";

const copy = {
  en: {
    back: "← Back Home",
    eyebrow: "Terms",
    title: "Terms of Service",
    updated: "Last updated · 2026-05-06",
    sections: [
      ["Scope", "VantaAPI provides AI tools coding practice and learning utilities"],
      ["Responsibility", "Use the tools lawfully and do not submit harmful or infringing content"],
      ["Content", "Unsafe, illegal or abusive content may be removed"],
      ["Privacy", "Information is handled according to the privacy policy"],
    ],
  },
  zh: {
    back: "← 返回首页",
    eyebrow: "条款",
    title: "服务条款",
    updated: "最后更新 · 2026-05-06",
    sections: [
      ["范围", "VantaAPI 提供 AI 工具、编程练习和学习工具"],
      ["责任", "请合法使用工具，不要提交有害或侵权内容"],
      ["内容", "不安全、违法或滥用性质的内容可能会被移除"],
      ["隐私", "信息按隐私政策处理"],
    ],
  },
};

export default async function TermsPage({ searchParams }: { searchParams?: Promise<{ lang?: string }> }) {
  const params = await searchParams;
  const lang: Lang = params?.lang === "zh" ? "zh" : "en";
  const t = copy[lang];

  return <main className="min-h-screen bg-white text-slate-900"><div className="mx-auto max-w-3xl px-4 py-7 sm:px-6 sm:py-9"><Link href={lang === "zh" ? "/?lang=zh" : "/"} className="link text-sm">{t.back}</Link><p className="eyebrow mt-6">{t.eyebrow}</p><h1 className="mt-3 font-serif text-3xl tracking-tight">{t.title}</h1><div className="mt-6 space-y-5">{t.sections.map(([title, body]) => <section key={title} className="border-t border-slate-200 pt-4"><h2 className="text-xl font-semibold">{title}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{body}</p></section>)}</div><p className="mt-6 border-t border-slate-200 pt-4 text-xs text-slate-500">{t.updated}</p></div></main>;
}
