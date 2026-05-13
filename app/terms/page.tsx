import Link from "next/link";
import type { Metadata } from "next";
import { headers } from "next/headers";
import FlagLanguageToggle from "@/components/layout/FlagLanguageToggle";
import { localizedHref, resolveInterfaceLanguage, type InterfaceLanguage, type PageSearchParams } from "@/lib/language";

type LegalCopy = {
  back: string;
  eyebrow: string;
  title: string;
  updated: string;
  sections: Array<[string, string]>;
};

const copy: Record<"en" | "zh", LegalCopy> = {
  en: {
    back: "Back home",
    eyebrow: "Terms",
    title: "Terms of Service",
    updated: "Last updated · 2026-05-13",
    sections: [
      ["Scope", "JinMing Lab provides GitHub launch audits, AI-assisted developer tools, programming practice, and learning utilities."],
      ["Responsibility", "Use the tools lawfully and do not submit harmful, abusive, infringing, or misleading content."],
      ["Sensitive data", "Do not submit secrets, passwords, private repositories, private source code, customer data, or internal company links."],
      ["AI output", "Generated reports and AI-assisted text are for reference. Review them before using them for a real release or decision."],
      ["Availability", "Features may be rate limited, protected, changed, or retired to keep the public service stable and safe."],
      ["Privacy", "Information is handled according to the privacy policy."],
    ],
  },
  zh: {
    back: "返回首页",
    eyebrow: "条款",
    title: "服务条款",
    updated: "最后更新 · 2026-05-13",
    sections: [
      ["范围", "JinMing Lab 提供 GitHub 上线体检、AI 辅助开发者工具、编程练习和学习工具。"],
      ["责任", "请合法使用工具，不要提交有害、滥用、侵权或误导性内容。"],
      ["敏感数据", "不要提交密钥、密码、私有仓库、私有源码、客户数据或公司内部链接。"],
      ["AI 输出", "生成报告和 AI 辅助文本仅供参考，真实发布或重要决策前请人工复核。"],
      ["可用性", "为了保持公开服务稳定和安全，部分功能可能被限流、保护、调整或下线。"],
      ["隐私", "信息按隐私政策处理。"],
    ],
  },
};

function termsCopy(language: InterfaceLanguage) {
  return language === "zh" ? copy.zh : copy.en;
}

export async function generateMetadata({ searchParams }: { searchParams?: Promise<PageSearchParams> }): Promise<Metadata> {
  const headersList = await headers();
  const language = resolveInterfaceLanguage(searchParams ? await searchParams : undefined, headersList.get("x-jinming-language"));
  const t = termsCopy(language);
  return {
    title: `${t.title} | JinMing Lab`,
    description: t.sections.map((section) => section[1]).join(" ").slice(0, 155),
    alternates: {
      canonical: localizedHref("/terms", language),
    },
  };
}

export default async function TermsPage({ searchParams }: { searchParams?: Promise<PageSearchParams> }) {
  const headersList = await headers();
  const language = resolveInterfaceLanguage(searchParams ? await searchParams : undefined, headersList.get("x-jinming-language"));
  const t = termsCopy(language);

  return (
    <main className="min-h-screen bg-white text-slate-900" dir={language === "ar" ? "rtl" : "ltr"}>
      <div className="mx-auto max-w-3xl px-4 py-7 sm:px-6 sm:py-9">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <Link href={localizedHref("/", language)} className="link text-sm">{t.back}</Link>
          <FlagLanguageToggle initialLanguage={language} />
        </header>
        <p className="eyebrow mt-6">{t.eyebrow}</p>
        <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">{t.title}</h1>
        <div className="mt-6 space-y-5">
          {t.sections.map(([title, body]) => (
            <section key={title} className="border-t border-slate-200 pt-4">
              <h2 className="text-xl font-extrabold">{title}</h2>
              <p className="mt-2 text-sm font-medium leading-6 text-slate-700">{body}</p>
            </section>
          ))}
        </div>
        <footer className="mt-6 flex flex-wrap gap-3 border-t border-slate-200 pt-4 text-xs font-bold text-slate-500">
          <span>{t.updated}</span>
          <Link href={localizedHref("/security", language)} className="link">Security</Link>
          <Link href={localizedHref("/privacy", language)} className="link">Privacy</Link>
        </footer>
      </div>
    </main>
  );
}
