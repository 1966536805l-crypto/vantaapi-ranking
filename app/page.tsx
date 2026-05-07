import Link from "next/link";
import type { Metadata } from "next";
import { getServerUser } from "@/lib/server-auth";
import { localizedHref, type SiteLanguage } from "@/lib/language";
import { worldLanguages } from "@/lib/world-language-content";

export const metadata: Metadata = {
  title: "VantaAPI - English and C++ Learning MVP",
  description:
    "VantaAPI is a focused English and C++ learning site with lessons, quizzes, progress tracking, wrong-question review, and practical AI tools.",
  keywords: ["英语学习", "C++ 学习", "错题复习", "学习进度", "AI 工具", "编程训练"],
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
    english: "英语学习",
    cpp: "C++ 学习",
    today: "今日计划",
    dashboard: "继续学习",
    tools: "AI 工具",
    login: "登录",
    logout: "退出",
    admin: "后台",
    eyebrow: "英语 + C++ 学习 MVP",
    title: "VantaAPI",
    description:
      "一个先把英语学习和 C++ 入门做扎实的网站：课程路径、练习测验、学习进度、错题复习和少量实用 AI 工具都围绕“下一步该学什么”展开。",
    primaryCta: "开始英语",
    secondaryCta: "开始 C++",
    tertiaryCta: "今日计划",
    continueCta: "继续学习",
    focus: "核心路径",
    ready: "可用",
    pathsTitle: "MVP 学习路径",
    pathsHeading: "先学、再练、最后复盘",
    pathsBody: "首页只保留最重要的入口。GitHub 上线体检和 Prompt 工具继续保留，但降级为辅助工具，不抢学习主线。",
    open: "打开",
    cards: [
      {
        href: "/english",
        eyebrow: "路径 01",
        title: "英语学习",
        body: "从词汇、语法、阅读和打字听写开始。每次练习都尽量短，方便每天持续推进。",
        points: ["词汇", "语法", "阅读", "打字"],
      },
      {
        href: "/cpp",
        eyebrow: "路径 02",
        title: "C++ 入门",
        body: "不开放在线执行，先用语法、代码阅读、输出预测和基础算法题建立安全的学习闭环。",
        points: ["语法", "STL", "读代码", "算法"],
      },
      {
        href: "/wrong",
        eyebrow: "复盘",
        title: "错题复习",
        body: "把测验中的错误沉淀下来，回到错题本重做、理解原因，再进入下一轮学习。",
        points: ["错题", "复习", "进度"],
      },
    ],
  },
  english: {
    version: "Version",
    versions: "Site Versions",
    english: "English",
    cpp: "C++",
    today: "Today",
    dashboard: "Continue",
    tools: "AI Tools",
    login: "Login",
    logout: "Logout",
    admin: "Admin",
    eyebrow: "English + C++ Learning MVP",
    title: "VantaAPI",
    description:
      "A focused learning site for English and beginner C++: course paths, quizzes, progress tracking, wrong-question review, and a few practical AI tools built around the next step to learn.",
    primaryCta: "Start English",
    secondaryCta: "Start C++",
    tertiaryCta: "Today Plan",
    continueCta: "Continue Learning",
    focus: "Core Paths",
    ready: "Ready",
    pathsTitle: "MVP learning paths",
    pathsHeading: "Learn, practice, then review",
    pathsBody: "The homepage now keeps the important learning doors first. GitHub launch audit and prompt tools remain available as supporting tools, not the main product story.",
    open: "Open",
    cards: [
      {
        href: "/english",
        eyebrow: "Path 01",
        title: "English Learning",
        body: "Start with vocabulary, grammar, reading, and typing practice. Each session stays short enough for daily progress.",
        points: ["Vocabulary", "Grammar", "Reading", "Typing"],
      },
      {
        href: "/cpp",
        eyebrow: "Path 02",
        title: "C++ Basics",
        body: "No online execution in the MVP. Build confidence through syntax, code reading, output prediction, STL, and beginner algorithms.",
        points: ["Syntax", "STL", "Code reading", "Algorithms"],
      },
      {
        href: "/wrong",
        eyebrow: "Review",
        title: "Wrong-question Review",
        body: "Turn quiz mistakes into a review loop: retry, understand the reason, and move into the next learning session.",
        points: ["Mistakes", "Review", "Progress"],
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
    { href: localizedHref("/today", language), title: language === "zh" ? "今日计划" : "Today Plan", meta: language === "zh" ? "每天入口" : "Daily entry" },
    { href: localizedHref("/progress", language), title: language === "zh" ? "学习进度" : "Progress", meta: language === "zh" ? "查看完成度" : "Completion" },
    { href: localizedHref("/tools/github-repo-analyzer", language), title: "GitHub Audit", meta: language === "zh" ? "辅助工具" : "Support tool" },
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
                  <Link href={localizedHref("/english", siteLanguage)} className="dense-action-primary px-4 py-2.5">
                    {copy.primaryCta}
                  </Link>
                  <Link href={localizedHref("/cpp", siteLanguage)} className="dense-action px-4 py-2.5">
                    {copy.secondaryCta}
                  </Link>
                  <Link href={localizedHref("/today", siteLanguage)} className="dense-action px-4 py-2.5">
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
    { href: localizedHref("/english", language), code: "E", label: copy.english },
    { href: localizedHref("/cpp", language), code: "C", label: copy.cpp },
    { href: localizedHref("/today", language), code: "T", label: copy.today },
    { href: localizedHref("/dashboard", language), code: "D", label: copy.dashboard },
    ...(isAdmin ? [{ href: localizedHref("/admin", language), code: "A", label: copy.admin }] : []),
  ];

  return (
    <aside className="study-rail sticky top-5 flex h-[calc(100vh-40px)] flex-col p-2">
      <Link href={localizedHref("/", language)} className="mb-3 flex items-center gap-2 rounded-[8px] px-2 py-2">
        <span className="grid h-8 w-8 place-items-center rounded-[8px] bg-slate-950 text-[10px] font-semibold text-white">VA</span>
        <span className="hidden text-sm font-semibold leading-tight sm:block">VantaAPI</span>
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
        <span className="dense-status">VantaAPI</span>
        <span className="dense-status">{copy.english}</span>
        <span className="dense-status">{copy.cpp}</span>
        <span className="dense-status">{copy.today}</span>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <SiteVersionMenu copy={copy} selectedUi={selectedUi} />
        <Link href={localizedHref("/english", language)} className="dense-action">{copy.english}</Link>
        <Link href={localizedHref("/cpp", language)} className="dense-action">{copy.cpp}</Link>
        <Link href={localizedHref("/today", language)} className="dense-action">{copy.today}</Link>
        <Link href={localizedHref("/tools", language)} className="dense-action">{copy.tools}</Link>
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
