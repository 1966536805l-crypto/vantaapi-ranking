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
    eyebrow: "Privacy",
    title: "Privacy Policy",
    updated: "Last updated · 2026-05-13",
    sections: [
      ["Data", "JinMing Lab stores account or learning data only when you choose to create an account or save progress."],
      ["GitHub Audit", "Repository audit requests should use public GitHub root URLs only. The normal audit flow does not require private repository access."],
      ["Sensitive content", "Do not submit API keys, passwords, private source code, customer data, or internal company links."],
      ["Use", "Data is used to provide the tools, generate the current report, keep progress when enabled, and prevent abuse."],
      ["Security", "The site uses HTTPS, security headers, rate limits, bot protection, password hashing when accounts are enabled, and restricted database access."],
      ["Control", "You can clear local browser data yourself or contact privacy@vantaapi.com for account or saved-data removal requests."],
    ],
  },
  zh: {
    back: "返回首页",
    eyebrow: "隐私",
    title: "隐私政策",
    updated: "最后更新 · 2026-05-13",
    sections: [
      ["数据", "JinMing Lab 只在你创建账号或主动保存进度时记录账号或学习数据。"],
      ["GitHub 体检", "仓库体检只应提交公开 GitHub 仓库根地址，正常体检流程不需要访问私有仓库。"],
      ["敏感内容", "不要提交 API Key、密码、私有源码、客户数据或公司内部链接。"],
      ["用途", "数据用于提供工具、生成当前报告、在启用时保存进度，并防止滥用。"],
      ["安全", "网站使用 HTTPS、安全响应头、限流、机器人防护；启用账号时使用密码哈希和受限制的数据库访问。"],
      ["控制", "你可以自行清除浏览器本地数据，或联系 privacy@vantaapi.com 申请删除账号或已保存数据。"],
    ],
  },
};

function privacyCopy(language: InterfaceLanguage) {
  return language === "zh" ? copy.zh : copy.en;
}

export async function generateMetadata({ searchParams }: { searchParams?: Promise<PageSearchParams> }): Promise<Metadata> {
  const headersList = await headers();
  const language = resolveInterfaceLanguage(searchParams ? await searchParams : undefined, headersList.get("x-jinming-language"));
  const t = privacyCopy(language);
  return {
    title: `${t.title} | JinMing Lab`,
    description: t.sections.map((section) => section[1]).join(" ").slice(0, 155),
    alternates: {
      canonical: localizedHref("/privacy", language),
    },
  };
}

export default async function PrivacyPage({ searchParams }: { searchParams?: Promise<PageSearchParams> }) {
  const headersList = await headers();
  const language = resolveInterfaceLanguage(searchParams ? await searchParams : undefined, headersList.get("x-jinming-language"));
  const t = privacyCopy(language);

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
          <Link href={localizedHref("/terms", language)} className="link">Terms</Link>
        </footer>
      </div>
    </main>
  );
}
