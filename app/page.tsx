import Link from "next/link";
import type { Metadata } from "next";
import { getServerUser } from "@/lib/server-auth";
import { localizedHref, type SiteLanguage } from "@/lib/language";
import { worldLanguages } from "@/lib/world-language-content";

export const metadata: Metadata = {
  title: "JinMing Lab - GitHub Launch Audit and AI Learning Tools",
  description:
    "JinMing Lab is a focused AI learning tool platform for GitHub launch audits, developer tools, and practical learning roadmaps.",
  keywords: ["GitHub 项目体检", "GitHub Launch Audit", "AI 工具", "Prompt 优化", "发布检查清单", "编程学习路线"],
};

type HomeSearchParams = Promise<{ ui?: string | string[]; lang?: string | string[] }>;

type HomeCopy = {
  version: string;
  versions: string;
  english: string;
  cpp: string;
  today: string;
  dashboard: string;
  tools: string;
  login: string;
  logout: string;
  admin: string;
  eyebrow: string;
  title: string;
  description: string;
  primaryCta: string;
  secondaryCta: string;
  tertiaryCta: string;
  continueCta: string;
  focus: string;
  ready: string;
  pathsTitle: string;
  pathsHeading: string;
  pathsBody: string;
  open: string;
  cards: Array<{
    href: string;
    eyebrow: string;
    title: string;
    body: string;
    points: string[];
  }>;
};

const siteVersionSlugs = ["chinese", "english"];

const homeCopy: Record<string, HomeCopy> = {
  chinese: {
    version: "版本",
    versions: "语言版本",
    english: "学习入口",
    cpp: "编程训练",
    today: "路线",
    dashboard: "控制台",
    tools: "AI 工具",
    login: "登录",
    logout: "退出",
    admin: "后台",
    eyebrow: "GitHub Launch Audit",
    title: "JinMing Lab",
    description:
      "一个更聚焦的 AI 学习工具平台。先把 GitHub 项目上线前最耗时间的 README、环境变量、CI、部署、安全和 Issue 模板一次检查清楚，再保留少量真正实用的 AI 工具和学习路线。",
    primaryCta: "开始项目体检",
    secondaryCta: "打开 AI 工具",
    tertiaryCta: "查看学习路线",
    continueCta: "进入控制台",
    focus: "核心入口",
    ready: "可用",
    pathsTitle: "为什么先做这个",
    pathsHeading: "少而精，比堆功能更容易留下用户",
    pathsBody: "首页只放一个主功能：GitHub Launch Audit。英语、世界语言、打字和更多课程继续保留在二级页面，不抢第一眼。",
    open: "打开",
    cards: [
      {
        href: "/tools/github-repo-analyzer",
        eyebrow: "主功能",
        title: "GitHub 项目体检",
        body: "粘贴公开仓库地址，生成上线评分、风险判断、必修清单、README 建议、环境变量检查和可复制的 GitHub Issue。",
        points: ["README", "env", "CI", "部署", "安全"],
      },
      {
        href: "/tools",
        eyebrow: "辅助",
        title: "AI 工具台",
        body: "保留 Prompt 优化、API 请求生成、JSON 正则时间戳这些高频小工具，去掉不够强的噪音入口。",
        points: ["Prompt", "API", "JSON", "正则"],
      },
      {
        href: "/tools/learning-roadmap",
        eyebrow: "路线",
        title: "学习路线",
        body: "把零基础、前端、Python 自动化和独立开发路线整理成可执行的 30 天计划，适合长期沉淀。",
        points: ["零基础", "前端", "Python", "独立开发"],
      },
    ],
  },
  english: {
    version: "Version",
    versions: "Site Versions",
    english: "Learn",
    cpp: "Coding",
    today: "Roadmap",
    dashboard: "Dashboard",
    tools: "AI Tools",
    login: "Login",
    logout: "Logout",
    admin: "Admin",
    eyebrow: "GitHub Launch Audit",
    title: "JinMing Lab",
    description:
      "A focused AI learning tool platform. Start with the launch work developers lose time on: README gaps, env files, CI signals, deployment steps, security notes, release checklists, and copyable GitHub issues.",
    primaryCta: "Run GitHub Audit",
    secondaryCta: "Open AI Tools",
    tertiaryCta: "View Roadmap",
    continueCta: "Open Dashboard",
    focus: "Core Doors",
    ready: "Ready",
    pathsTitle: "Why this focus",
    pathsHeading: "Fewer features, sharper value",
    pathsBody: "The homepage now has one main product: GitHub Launch Audit. English, world languages, typing, and course modules stay available as secondary pages.",
    open: "Open",
    cards: [
      {
        href: "/tools/github-repo-analyzer",
        eyebrow: "Core",
        title: "GitHub Launch Audit",
        body: "Paste a public repo and get a launch score, risk verdict, must-fix list, README suggestions, env checks, and copyable GitHub issues.",
        points: ["README", "env", "CI", "Deploy", "Security"],
      },
      {
        href: "/tools",
        eyebrow: "Support",
        title: "AI Tools",
        body: "Keep the useful daily tools: prompt optimizer, API request generator, JSON formatter, regex tester, and timestamp converter.",
        points: ["Prompt", "API", "JSON", "Regex"],
      },
      {
        href: "/tools/learning-roadmap",
        eyebrow: "Plan",
        title: "Learning Roadmap",
        body: "Generate a practical 30 day plan for zero base learning, frontend, Python automation, or indie building.",
        points: ["Zero base", "Frontend", "Python", "Indie"],
      },
    ],
  },
};

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function getSelectedUi(rawUi: string | string[] | undefined) {
  const ui = firstParam(rawUi);
  return ui && siteVersionSlugs.includes(ui) ? ui : "chinese";
}

function getSiteLanguage(selectedUi: string, rawLanguage?: string | string[]): SiteLanguage {
  const language = firstParam(rawLanguage);
  if (language === "zh" || language === "en") return language;
  return selectedUi === "chinese" ? "zh" : "en";
}

function homeHref(ui: string) {
  const language = ui === "chinese" ? "zh" : "en";
  return ui === "chinese" ? "/?lang=zh" : `/?ui=${ui}&lang=${language}`;
}

function supportItems(language: SiteLanguage) {
  return [
    { href: localizedHref("/tools/github-repo-analyzer", language), title: "GitHub Audit", meta: language === "zh" ? "主功能" : "Main product" },
    { href: localizedHref("/tools", language), title: language === "zh" ? "AI 工具" : "AI Tools", meta: language === "zh" ? "高频小工具" : "Daily utilities" },
    { href: localizedHref("/tools/learning-roadmap", language), title: language === "zh" ? "学习路线" : "Roadmap", meta: language === "zh" ? "30 天计划" : "30 day plan" },
  ];
}

export default async function HomePage({ searchParams }: { searchParams: HomeSearchParams }) {
  const user = await getServerUser();
  const params = await searchParams;
  const selectedUi = getSelectedUi(params?.ui);
  const siteLanguage = getSiteLanguage(selectedUi, params?.lang);
  const copy = homeCopy[selectedUi] ?? homeCopy.chinese;
  const quickItems = supportItems(siteLanguage);

  return (
    <main className="apple-page home-core-page">
      <div className="study-desk-shell grid min-h-screen grid-cols-[76px_minmax(0,1fr)] gap-3 py-5 sm:grid-cols-[112px_minmax(0,1fr)] lg:grid-cols-[152px_minmax(0,1fr)] lg:gap-4">
        <HomeRail copy={copy} isAdmin={user?.role === "ADMIN"} language={siteLanguage} />

        <section className="min-w-0">
          <TopBar
            copy={copy}
            isAdmin={user?.role === "ADMIN"}
            isSignedIn={Boolean(user)}
            selectedUi={selectedUi}
            language={siteLanguage}
          />

          <section className="mt-3 dense-panel overflow-hidden p-5 sm:p-7">
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-end">
              <div>
                <p className="eyebrow">{copy.eyebrow}</p>
                <h1 className="mt-3 max-w-4xl text-4xl font-semibold leading-[1.02] tracking-normal sm:text-5xl lg:text-6xl">
                  {copy.title}
                </h1>
                <p className="mt-4 max-w-2xl text-sm leading-6 text-[color:var(--muted)]">
                  {copy.description}
                </p>
                <div className="mt-6 flex flex-wrap gap-2">
                  <Link href={localizedHref("/tools/github-repo-analyzer", siteLanguage)} className="dense-action-primary px-4 py-2.5">
                    {copy.primaryCta}
                  </Link>
                  <Link href={localizedHref("/tools", siteLanguage)} className="dense-action px-4 py-2.5">
                    {copy.secondaryCta}
                  </Link>
                  <Link href={localizedHref("/tools/learning-roadmap", siteLanguage)} className="dense-action px-4 py-2.5">
                    {copy.tertiaryCta}
                  </Link>
                  <Link href={localizedHref(user ? "/dashboard" : "/login?next=/dashboard", siteLanguage)} className="dense-action px-4 py-2.5">
                    {copy.continueCta}
                  </Link>
                </div>
              </div>

              <div className="rounded-[8px] border border-slate-200 bg-white/75 p-4">
                <p className="eyebrow">{copy.focus}</p>
                <div className="mt-3 grid gap-2">
                  {[copy.english, copy.cpp, copy.today, copy.dashboard].map((item) => (
                    <span key={item} className="dense-row">
                      <span className="text-sm font-semibold">{item}</span>
                      <span className="text-xs text-[color:var(--muted)]">{copy.ready}</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="mt-3 grid gap-3 lg:grid-cols-3">
            {copy.cards.map((card) => (
              <Link key={card.href} href={localizedHref(card.href, siteLanguage)} className="dense-card p-5 transition hover:-translate-y-0.5 hover:border-slate-300">
                <p className="eyebrow">{card.eyebrow}</p>
                <h2 className="mt-2 text-2xl font-semibold">{card.title}</h2>
                <p className="mt-3 min-h-24 text-sm leading-6 text-[color:var(--muted)]">{card.body}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {card.points.map((point) => (
                    <span key={point} className="dense-status">
                      {point}
                    </span>
                  ))}
                </div>
              </Link>
            ))}
          </section>

          <section className="mt-3 dense-panel p-5">
            <div className="grid gap-4 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:items-center">
              <div>
                <p className="eyebrow">{copy.pathsTitle}</p>
                <h2 className="mt-2 text-2xl font-semibold">{copy.pathsHeading}</h2>
                <p className="mt-3 text-sm leading-6 text-[color:var(--muted)]">{copy.pathsBody}</p>
              </div>
              <div className="grid gap-2 sm:grid-cols-3">
                {quickItems.map((item) => (
                  <Link key={item.href} href={item.href} className="dense-row">
                    <span className="text-sm font-semibold">{item.title}</span>
                    <span className="text-xs text-[color:var(--muted)]">{item.meta}</span>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        </section>
      </div>
    </main>
  );
}

function HomeRail({ copy, isAdmin, language }: { copy: HomeCopy; isAdmin: boolean; language: SiteLanguage }) {
  const items = [
    { href: localizedHref("/tools/github-repo-analyzer", language), code: "G", label: "Audit" },
    { href: localizedHref("/tools", language), code: "T", label: copy.tools },
    { href: localizedHref("/tools/learning-roadmap", language), code: "R", label: copy.today },
    { href: localizedHref("/dashboard", language), code: "D", label: copy.dashboard },
    ...(isAdmin ? [{ href: localizedHref("/admin", language), code: "A", label: copy.admin }] : []),
  ];

  return (
    <aside className="study-rail sticky top-5 flex h-[calc(100vh-40px)] flex-col p-2">
      <Link href={localizedHref("/", language)} className="mb-3 flex items-center gap-2 rounded-[8px] px-2 py-2">
        <span className="grid h-8 w-8 place-items-center rounded-[8px] bg-slate-950 text-[10px] font-semibold text-white">JM</span>
        <span className="hidden text-sm font-semibold leading-tight sm:block">JinMing</span>
      </Link>

      <nav className="grid gap-1">
        {items.map((item) => (
          <Link key={item.href} href={item.href} className="rail-link">
            <span className="grid h-7 w-7 place-items-center rounded-[8px] bg-white/70 text-xs font-semibold text-slate-700">
              {item.code}
            </span>
            <span className="hidden text-xs font-semibold sm:inline lg:text-sm">{item.label}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
}

function TopBar({
  copy,
  isAdmin,
  isSignedIn,
  selectedUi,
  language,
}: {
  copy: HomeCopy;
  isAdmin: boolean;
  isSignedIn: boolean;
  selectedUi: string;
  language: SiteLanguage;
}) {
  return (
    <header className="dense-panel flex flex-wrap items-center justify-between gap-3 px-4 py-3">
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="dense-status">JinMing Lab</span>
        <span className="dense-status">GitHub Audit</span>
        <span className="dense-status">{copy.tools}</span>
        <span className="dense-status">{copy.today}</span>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <SiteVersionMenu copy={copy} selectedUi={selectedUi} />
        <Link href={localizedHref("/tools/github-repo-analyzer", language)} className="dense-action">Audit</Link>
        <Link href={localizedHref("/tools", language)} className="dense-action">{copy.tools}</Link>
        <Link href={localizedHref("/tools/learning-roadmap", language)} className="dense-action">{copy.today}</Link>
        {isAdmin && <Link href={localizedHref("/admin", language)} className="dense-action">{copy.admin}</Link>}
        {isSignedIn ? (
          <form action="/api/auth/logout" method="post">
            <button className="dense-action">{copy.logout}</button>
          </form>
        ) : (
          <Link href={localizedHref("/login", language)} className="dense-action">{copy.login}</Link>
        )}
      </div>
    </header>
  );
}

function SiteVersionMenu({ copy, selectedUi }: { copy: HomeCopy; selectedUi: string }) {
  const selectedLanguage = worldLanguages.find((language) => language.slug === selectedUi) ?? worldLanguages[0];
  const supportedVersions = worldLanguages.filter((language) => siteVersionSlugs.includes(language.slug));

  return (
    <details className="home-language-menu home-version-menu">
      <summary aria-label="Open site language version switcher">
        <span>{copy.version}</span>
        <strong>{selectedLanguage.nativeName}</strong>
      </summary>
      <div className="home-language-popover">
        <div className="home-language-popover-head">
          <span>{copy.versions}</span>
          <Link href={homeHref("chinese")}>中文</Link>
        </div>
        <div className="home-language-featured">
          {supportedVersions.map((language) => (
            <Link key={language.slug} href={homeHref(language.slug)}>
              <span>{language.nativeName}</span>
              <small>{language.name}</small>
            </Link>
          ))}
        </div>
      </div>
    </details>
  );
}
