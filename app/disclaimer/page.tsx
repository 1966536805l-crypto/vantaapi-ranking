import Link from "next/link";

type Lang = "en" | "zh";

const copy = {
  en: {
    back: "← Back Home",
    eyebrow: "Legal",
    title: "Disclaimer",
    sections: [
      ["Role", "JinMing Lab provides AI tools coding practice and learning utilities"],
      ["Content", "User-submitted content remains the responsibility of the submitter"],
      ["Availability", "The service may change, break or become unavailable"],
      ["Advice", "AI and status features are for study review, not professional advice"],
    ],
  },
  zh: {
    back: "← 返回首页",
    eyebrow: "说明",
    title: "免责声明",
    sections: [
      ["角色", "JinMing Lab 提供 AI 工具、编程练习和学习工具"],
      ["内容", "用户提交的内容由提交者自行负责"],
      ["可用性", "服务可能调整、中断或不可用"],
      ["建议", "AI 和状态功能用于学习复盘，不构成专业建议"],
    ],
  },
};

export default async function DisclaimerPage({ searchParams }: { searchParams?: Promise<{ lang?: string }> }) {
  const params = await searchParams;
  const lang: Lang = params?.lang === "zh" ? "zh" : "en";
  const t = copy[lang];

  return <main className="min-h-screen bg-white text-slate-900"><div className="mx-auto max-w-3xl px-4 py-7 sm:px-6 sm:py-9"><Link href={lang === "zh" ? "/?lang=zh" : "/"} className="link text-sm">{t.back}</Link><p className="eyebrow mt-6">{t.eyebrow}</p><h1 className="mt-3 font-serif text-3xl tracking-tight">{t.title}</h1><div className="mt-6 space-y-5">{t.sections.map(([title, body]) => <section key={title} className="border-t border-slate-200 pt-4"><h2 className="text-xl font-semibold">{title}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{body}</p></section>)}</div></div></main>;
}
