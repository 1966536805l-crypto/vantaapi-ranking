import Link from "next/link";
import type { Metadata } from "next";
import { headers } from "next/headers";
import FlagLanguageToggle from "@/components/layout/FlagLanguageToggle";
import { localizedHref, resolveInterfaceLanguage, type InterfaceLanguage, type PageSearchParams } from "@/lib/language";
import { getPublicHealthSnapshot, type PublicHealthCheck } from "@/lib/public-health";

export const dynamic = "force-dynamic";

type StatusCopy = {
  back: string;
  eyebrow: string;
  title: string;
  intro: string;
  snapshot: string;
  updated: string;
  build: string;
  commit: string;
  branch: string;
  environment: string;
  deployment: string;
  languageBootstrap: string;
  statusLabels: Record<PublicHealthCheck["status"], string>;
  links: { home: string; security: string; audit: string };
};

const copy: Record<"en" | "zh", StatusCopy> = {
  en: {
    back: "Back home",
    eyebrow: "Live status",
    title: "JinMing Lab service status",
    intro: "A public, secret-free view of the current launch readiness surface. It does not expose keys, database values, user data, or private system logs.",
    snapshot: "Current snapshot",
    updated: "Generated",
    build: "Build identity",
    commit: "Commit",
    branch: "Branch",
    environment: "Environment",
    deployment: "Deployment",
    languageBootstrap: "Language bootstrap",
    statusLabels: {
      operational: "Operational",
      protected: "Protected",
      disabled: "Disabled by design",
      limited: "Limited",
    },
    links: {
      home: "Home",
      security: "Security",
      audit: "Run GitHub Audit",
    },
  },
  zh: {
    back: "返回首页",
    eyebrow: "实时状态",
    title: "JinMing Lab 服务状态",
    intro: "这是一个公开、无密钥的上线状态页。它不会展示密钥、数据库值、用户数据或私有系统日志。",
    snapshot: "当前快照",
    updated: "生成时间",
    build: "构建版本",
    commit: "提交",
    branch: "分支",
    environment: "环境",
    deployment: "部署",
    languageBootstrap: "语言启动",
    statusLabels: {
      operational: "正常",
      protected: "受保护",
      disabled: "按设计关闭",
      limited: "受限",
    },
    links: {
      home: "首页",
      security: "安全说明",
      audit: "运行 GitHub 体检",
    },
  },
};

function statusCopy(language: InterfaceLanguage) {
  return language === "zh" ? copy.zh : copy.en;
}

export async function generateMetadata({ searchParams }: { searchParams?: Promise<PageSearchParams> }): Promise<Metadata> {
  const headersList = await headers();
  const headerLanguage = headersList.get("x-jinming-language");
  const language = resolveInterfaceLanguage(searchParams ? await searchParams : undefined, headerLanguage);
  const t = statusCopy(language);
  return {
    title: `${t.title} | JinMing Lab`,
    description: t.intro,
    alternates: {
      canonical: localizedHref("/status", language),
    },
    robots: {
      index: false,
      follow: false,
    },
  };
}

function statusTone(status: PublicHealthCheck["status"]) {
  if (status === "operational") return "border-emerald-200 bg-emerald-50 text-emerald-700";
  if (status === "protected") return "border-blue-200 bg-blue-50 text-blue-700";
  if (status === "limited") return "border-amber-200 bg-amber-50 text-amber-700";
  return "border-slate-200 bg-slate-100 text-slate-700";
}

export default async function StatusPage({ searchParams }: { searchParams?: Promise<PageSearchParams> }) {
  const headersList = await headers();
  const headerLanguage = headersList.get("x-jinming-language");
  const language = resolveInterfaceLanguage(searchParams ? await searchParams : undefined, headerLanguage);
  const t = statusCopy(language);
  const health = getPublicHealthSnapshot();
  const date = new Intl.DateTimeFormat(language === "zh" ? "zh-CN" : "en-US", {
    dateStyle: "medium",
    timeStyle: "medium",
    timeZone: "UTC",
  }).format(new Date(health.generatedAt));

  return (
    <main className="min-h-screen bg-white text-slate-900" dir={language === "ar" ? "rtl" : "ltr"}>
      <div className="mx-auto max-w-5xl px-4 py-7 sm:px-6 sm:py-9">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <Link href={localizedHref("/", language)} className="link text-sm">{t.back}</Link>
          <FlagLanguageToggle initialLanguage={language} />
        </header>

        <section className="mt-8">
          <p className="eyebrow">{t.eyebrow}</p>
          <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">{t.title}</h1>
          <p className="mt-5 max-w-3xl text-base font-semibold leading-7 text-slate-600">{t.intro}</p>
        </section>

        <section className="mt-8 rounded-lg border border-slate-200 bg-slate-50 p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-600">{t.snapshot}</p>
              <h2 className="mt-2 text-2xl font-black">{health.product}</h2>
            </div>
            <span className={`rounded-full border px-3 py-1 text-sm font-black ${statusTone(health.status === "operational" ? "operational" : "limited")}`}>
              {health.status === "operational" ? t.statusLabels.operational : t.statusLabels.limited}
            </span>
          </div>
          <p className="mt-3 text-sm font-semibold text-slate-600">{t.updated}: {date} UTC</p>
        </section>

        <section className="mt-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-600">{t.build}</p>
          <div className="mt-4 grid gap-3 text-sm font-semibold text-slate-600 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <span className="block text-xs font-black uppercase text-slate-400">{t.commit}</span>
              <code className="mt-1 block break-all rounded-md bg-slate-100 px-2 py-1 text-slate-800">{health.build.commit}</code>
            </div>
            <div>
              <span className="block text-xs font-black uppercase text-slate-400">{t.branch}</span>
              <code className="mt-1 block break-all rounded-md bg-slate-100 px-2 py-1 text-slate-800">{health.build.branch}</code>
            </div>
            <div>
              <span className="block text-xs font-black uppercase text-slate-400">{t.environment}</span>
              <code className="mt-1 block break-all rounded-md bg-slate-100 px-2 py-1 text-slate-800">{health.build.environment}</code>
            </div>
            <div className="sm:col-span-2">
              <span className="block text-xs font-black uppercase text-slate-400">{t.deployment}</span>
              <code className="mt-1 block break-all rounded-md bg-slate-100 px-2 py-1 text-slate-800">{health.build.deployment}</code>
            </div>
            <div>
              <span className="block text-xs font-black uppercase text-slate-400">{t.languageBootstrap}</span>
              <code className="mt-1 block break-all rounded-md bg-slate-100 px-2 py-1 text-slate-800">{health.build.languageBootstrap}</code>
            </div>
          </div>
        </section>

        <section className="mt-4 grid gap-3 sm:grid-cols-2">
          {health.checks.map((check) => (
            <article key={check.name} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-lg font-extrabold">{check.name}</h2>
                <span className={`rounded-full border px-2.5 py-1 text-xs font-black ${statusTone(check.status)}`}>
                  {t.statusLabels[check.status]}
                </span>
              </div>
              <p className="mt-3 text-sm font-medium leading-6 text-slate-600">{check.detail}</p>
            </article>
          ))}
        </section>

        <footer className="mt-7 flex flex-wrap gap-3 border-t border-slate-200 pt-5 text-sm font-bold text-slate-600">
          <Link href={localizedHref("/", language)} className="link">{t.links.home}</Link>
          <Link href={localizedHref("/security", language)} className="link">{t.links.security}</Link>
          <Link href={localizedHref("/tools/github-repo-analyzer", language)} className="link">{t.links.audit}</Link>
        </footer>
      </div>
    </main>
  );
}
