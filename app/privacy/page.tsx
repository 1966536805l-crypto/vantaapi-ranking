import Link from "next/link";

type Lang = "en" | "zh";

const copy = {
  en: {
    back: "← Back Home",
    eyebrow: "Privacy",
    title: "Privacy Policy",
    updated: "Last updated · 2026-05-06",
    sections: [
      ["Data", "The site stores account and learning data only when you choose to save it"],
      ["GitHub Audit", "Repository audit requests should use public GitHub URLs only. The normal audit flow does not require private repository access"],
      ["Sensitive content", "Do not submit API keys, passwords, private source code, customer data or internal company links"],
      ["Use", "Data is used to provide the tools, generate the current report and prevent abuse"],
      ["Security", "The site uses HTTPS, security headers, password hashing where accounts are enabled and restricted database access"],
      ["Control", "You can clear local browser data or contact privacy@vantaapi.com"],
    ],
  },
  zh: {
    back: "← 返回首页",
    eyebrow: "隐私",
    title: "隐私政策",
    updated: "最后更新 · 2026-05-06",
    sections: [
      ["数据", "网站只在你主动保存时记录账号和学习数据"],
      ["GitHub 体检", "仓库体检只应提交公开 GitHub 地址，正常体检流程不需要访问私有仓库"],
      ["敏感内容", "不要提交 API Key、密码、私有源码、客户数据或公司内部链接"],
      ["用途", "数据用于提供工具、生成当前报告，并防止滥用"],
      ["安全", "网站使用 HTTPS、安全响应头；启用账号时使用密码哈希和受限制的数据库访问"],
      ["控制", "你可以清除浏览器本地数据，或联系 privacy@vantaapi.com"],
    ],
  },
};

export default async function PrivacyPage({ searchParams }: { searchParams?: Promise<{ lang?: string }> }) {
  const params = await searchParams;
  const lang: Lang = params?.lang === "zh" ? "zh" : "en";
  const t = copy[lang];

  return <main className="min-h-screen bg-white text-slate-900"><div className="mx-auto max-w-3xl px-4 py-7 sm:px-6 sm:py-9"><Link href={lang === "zh" ? "/?lang=zh" : "/"} className="link text-sm">{t.back}</Link><p className="eyebrow mt-6">{t.eyebrow}</p><h1 className="mt-3 font-serif text-3xl tracking-tight">{t.title}</h1><div className="mt-6 space-y-5">{t.sections.map(([title, body]) => <section key={title} className="border-t border-slate-200 pt-4"><h2 className="text-xl font-semibold">{title}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{body}</p></section>)}</div><p className="mt-6 border-t border-slate-200 pt-4 text-xs text-slate-500">{t.updated}</p></div></main>;
}
