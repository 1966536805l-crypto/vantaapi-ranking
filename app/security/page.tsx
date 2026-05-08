import Link from "next/link";
import type { Metadata } from "next";
import FlagLanguageToggle from "@/components/layout/FlagLanguageToggle";
import { localizedHref, resolveInterfaceLanguage, type InterfaceLanguage, type PageSearchParams } from "@/lib/language";

type SecurityCopy = {
  eyebrow: string;
  title: string;
  intro: string;
  updated: string;
  back: string;
  sections: Array<{ title: string; body: string }>;
  checklistTitle: string;
  checklist: string[];
};

const copy: Record<"en" | "zh", SecurityCopy> = {
  en: {
    eyebrow: "Security and trust",
    title: "How JinMing Lab handles your data",
    intro: "JinMing Lab is built to be useful without asking for private code or unnecessary account data. The launch audit is rules first: it checks public repository signals and turns them into a release checklist.",
    updated: "Last updated · 2026-05-08",
    back: "Back home",
    sections: [
      { title: "Public repositories only", body: "GitHub Launch Audit accepts public https://github.com/owner/repo URLs. Do not submit private repository links, API keys, passwords, customer data, or internal company URLs." },
      { title: "No private code requirement", body: "You can use the main audit and tool pages without granting GitHub OAuth access. The product does not need your private repositories to be useful." },
      { title: "Rules before AI", body: "The core checks are deterministic: README, env examples, CI, deployment, release process, and security signals. AI-style wording is used only to make the report easier to read." },
      { title: "Account safety", body: "When accounts are enabled, passwords are hashed, session cookies are HttpOnly, unsafe writes use CSRF protection, and admin access requires 2FA by default." },
      { title: "Abuse protection", body: "The app uses security headers, host allowlists, rate limits, retired-route blocking, and bot protection. C++ online execution is disabled for public launch." },
      { title: "Data control", body: "If you want account or saved data removed, contact privacy@vantaapi.com. Local browser data can also be cleared from your own browser." },
    ],
    checklistTitle: "Before you submit",
    checklist: [
      "Use a public repository root URL only",
      "Remove secrets from code before putting it on GitHub",
      "Do not paste passwords, tokens, private source, or internal links",
      "Review the generated report before using it for a real release",
    ],
  },
  zh: {
    eyebrow: "安全与信任",
    title: "JinMing Lab 如何处理你的数据",
    intro: "JinMing Lab 的设计目标是：不用提交私有代码，也不用交出不必要的账号数据。上线体检以规则为核心，读取公开仓库信号，然后整理成发布清单。",
    updated: "最后更新 · 2026-05-08",
    back: "返回首页",
    sections: [
      { title: "只支持公开仓库", body: "GitHub 上线体检只接受公开的 https://github.com/owner/repo 地址。不要提交私有仓库链接、API Key、密码、客户数据或公司内部地址。" },
      { title: "不要求私有代码", body: "核心体检和工具页不需要 GitHub OAuth 授权。即使不接入私有仓库，产品也能完成公开仓库上线检查。" },
      { title: "规则优先，不靠 AI 硬猜", body: "核心检查是确定性规则：README、环境变量示例、CI、部署、发布流程和安全信号。AI 风格文案只用于让报告更好读。" },
      { title: "账号安全", body: "启用账号时，密码会哈希保存，Session Cookie 使用 HttpOnly，危险写操作有 CSRF 防护，管理员默认要求 2FA。" },
      { title: "滥用防护", body: "应用启用了安全响应头、Host 白名单、限流、下线入口拦截和机器人防护。公开上线时 C++ 在线运行保持关闭。" },
      { title: "数据控制", body: "如需删除账号或保存数据，可联系 privacy@vantaapi.com。浏览器本地数据也可以由你自己清除。" },
    ],
    checklistTitle: "提交前请确认",
    checklist: [
      "只使用公开仓库根地址",
      "把密钥从代码里移除后再放到 GitHub",
      "不要粘贴密码 token 私有源码或内部链接",
      "真实发布前人工复核生成报告",
    ],
  },
};

function securityCopy(language: InterfaceLanguage) {
  return language === "zh" ? copy.zh : copy.en;
}

export async function generateMetadata({ searchParams }: { searchParams?: Promise<PageSearchParams> }): Promise<Metadata> {
  const language = resolveInterfaceLanguage(searchParams ? await searchParams : undefined);
  const t = securityCopy(language);
  return {
    title: `${t.eyebrow} | JinMing Lab`,
    description: t.intro,
    alternates: {
      canonical: localizedHref("/security", language),
    },
  };
}

export default async function SecurityPage({ searchParams }: { searchParams?: Promise<PageSearchParams> }) {
  const language = resolveInterfaceLanguage(searchParams ? await searchParams : undefined);
  const t = securityCopy(language);

  return (
    <main className="min-h-screen bg-white text-slate-900" dir={language === "ar" ? "rtl" : "ltr"}>
      <div className="mx-auto max-w-4xl px-4 py-7 sm:px-6 sm:py-9">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <Link href={localizedHref("/", language)} className="link text-sm">{t.back}</Link>
          <FlagLanguageToggle initialLanguage={language} />
        </header>

        <p className="eyebrow mt-8">{t.eyebrow}</p>
        <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">{t.title}</h1>
        <p className="mt-5 max-w-3xl text-base font-semibold leading-7 text-slate-600">{t.intro}</p>

        <section className="mt-8 grid gap-3 sm:grid-cols-2">
          {t.sections.map((section) => (
            <article key={section.title} className="rounded-lg border border-slate-200 bg-slate-50 p-5">
              <h2 className="text-lg font-extrabold">{section.title}</h2>
              <p className="mt-2 text-sm font-medium leading-6 text-slate-600">{section.body}</p>
            </article>
          ))}
        </section>

        <section className="mt-5 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-extrabold">{t.checklistTitle}</h2>
          <div className="mt-3 grid gap-2">
            {t.checklist.map((item) => (
              <div key={item} className="flex gap-2 text-sm font-semibold text-slate-700">
                <span aria-hidden="true">✓</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </section>

        <footer className="mt-7 flex flex-wrap gap-3 border-t border-slate-200 pt-5 text-sm font-bold text-slate-600">
          <Link href={localizedHref("/privacy", language)} className="link">Privacy</Link>
          <Link href={localizedHref("/terms", language)} className="link">Terms</Link>
          <span>{t.updated}</span>
        </footer>
      </div>
    </main>
  );
}
