import Link from "next/link";
import FlagLanguageToggle from "@/components/layout/FlagLanguageToggle";
import { localizedHref, type SiteLanguage } from "@/lib/language";

export type ModuleItem = {
  href: string;
  eyebrow: string;
  title: string;
  description: string;
  points: string[];
  accent?: string;
};

const navCopy = {
  en: {
    brand: "JinMing Lab",
    today: "Today",
    english: "English",
    programming: "Programming",
    cpp: "C++",
    dashboard: "Dashboard",
  },
  zh: {
    brand: "JinMing Lab",
    today: "今日",
    english: "英语",
    programming: "编程",
    cpp: "C++",
    dashboard: "面板",
  },
} as const;

const moduleHubCopy = {
  en: {
    pathOverview: "Path Overview",
    open: "Open",
    back: "Back to learning hub",
    startQuiz: "Start quiz",
  },
  zh: {
    pathOverview: "路径概览",
    open: "打开",
    back: "返回学习中心",
    startQuiz: "开始测验",
  },
} as const;

export function AppleStudyHeader({ language = "en" }: { language?: SiteLanguage } = {}) {
  const copy = navCopy[language];

  return (
    <header className="apple-shell apple-nav px-5 py-3">
      <div className="flex items-center justify-between gap-4">
        <Link href={localizedHref("/", language)} className="flex items-center gap-2 font-semibold">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-slate-950 text-[10px] text-white shadow-sm">JM</span>
          <span>{copy.brand}</span>
        </Link>
        <nav className="flex flex-wrap items-center justify-end gap-2 text-sm">
          <Link className="apple-pill px-3 py-1.5" href={localizedHref("/english", language)}>{copy.english}</Link>
          <Link className="apple-pill px-3 py-1.5" href={localizedHref("/today", language)}>{copy.today}</Link>
          <Link className="apple-pill px-3 py-1.5" href={localizedHref("/programming", language)}>{copy.programming}</Link>
          <Link className="apple-pill px-3 py-1.5" href={localizedHref("/cpp", language)}>{copy.cpp}</Link>
          <Link className="apple-pill px-3 py-1.5" href={localizedHref("/dashboard", language)}>{copy.dashboard}</Link>
          <FlagLanguageToggle key={language} initialLanguage={language} />
        </nav>
      </div>
    </header>
  );
}

export function ModuleHub({
  eyebrow,
  title,
  description,
  modules,
  ctaHref,
  ctaLabel,
  language = "en",
}: {
  eyebrow: string;
  title: string;
  description: string;
  modules: ModuleItem[];
  ctaHref?: string;
  ctaLabel?: string;
  language?: SiteLanguage;
}) {
  const hubCopy = moduleHubCopy[language];

  return (
    <main className="apple-page pb-12 pt-4">
      <AppleStudyHeader language={language} />
      <section className="apple-shell grid gap-4 py-5 lg:grid-cols-[1fr_320px] lg:items-stretch">
        <div className="module-hero px-5 py-6 sm:px-6">
          <p className="eyebrow">{eyebrow}</p>
          <h1 className="apple-display-title mt-3 max-w-4xl text-3xl sm:text-4xl">{title}</h1>
          <p className="apple-display-subtitle mt-3 max-w-2xl text-sm text-[color:var(--muted)]">{description}</p>
          {ctaHref && ctaLabel && (
            <Link href={localizedHref(ctaHref, language)} className="apple-button-primary mt-4 px-4 py-2 text-sm">
              {ctaLabel}
            </Link>
          )}
        </div>

        <aside className="apple-card p-5">
          <p className="eyebrow">{hubCopy.pathOverview}</p>
          <div className="mt-5 space-y-4">
            {modules.map((item, index) => (
              <Link key={item.href} href={localizedHref(item.href, language)} className="flex items-start gap-3 rounded-[8px] border border-transparent p-2 hover:border-[color:var(--hair)] hover:bg-white/70">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-black/10 bg-white text-xs font-semibold text-slate-700">
                  {index + 1}
                </span>
                <div>
                  <p className="font-semibold leading-tight">{item.title}</p>
                  <p className="mt-1 text-xs leading-5 text-[color:var(--muted)]">{item.points.slice(0, 3).join(" ")}</p>
                </div>
              </Link>
            ))}
          </div>
        </aside>
      </section>

      <section className="apple-shell grid gap-3 md:grid-cols-2">
        {modules.map((item, index) => (
          <Link key={item.href} href={localizedHref(item.href, language)} className="apple-card apple-card-hover p-5">
            <div className="flex items-start justify-between gap-4">
              <p className="eyebrow">{String(index + 1).padStart(2, "0")} {item.eyebrow}</p>
              <span className="apple-pill px-3 py-1 text-xs">{hubCopy.open}</span>
            </div>
            <h2 className="mt-4 text-xl font-semibold">{item.title}</h2>
            <p className="mt-3 text-sm leading-6 text-[color:var(--muted)]">{item.description}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {item.points.map((point) => (
                <span key={point} className="rounded-full border border-black/5 bg-white/70 px-3 py-1 text-xs text-slate-600 shadow-sm">
                  {point}
                </span>
              ))}
            </div>
          </Link>
        ))}
      </section>
    </main>
  );
}

export function ModuleDetail({
  eyebrow,
  title,
  description,
  sections,
  practiceHref,
  language = "en",
}: {
  eyebrow: string;
  title: string;
  description: string;
  sections: { title: string; body: string; examples?: string[] }[];
  practiceHref?: string;
  language?: SiteLanguage;
}) {
  const hubCopy = moduleHubCopy[language];

  return (
    <main className="apple-page pb-12 pt-4">
      <AppleStudyHeader language={language} />
      <section className="apple-shell py-5">
        <Link href={localizedHref(eyebrow.toLowerCase().includes("english") ? "/english" : "/cpp", language)} className="link text-sm">{hubCopy.back}</Link>
        <div className="module-hero mt-3 px-5 py-6 sm:px-6">
          <p className="eyebrow">{eyebrow}</p>
          <h1 className="apple-display-title mt-3 text-3xl sm:text-4xl">{title}</h1>
          <p className="apple-display-subtitle mt-3 max-w-2xl text-sm text-[color:var(--muted)]">{description}</p>
          {practiceHref && <Link href={localizedHref(practiceHref, language)} className="apple-button-primary mt-4 px-4 py-2 text-sm">{hubCopy.startQuiz}</Link>}
        </div>

        <div className="mt-5 grid gap-4">
          {sections.map((section) => (
            <article key={section.title} className="apple-card p-5">
              <h2 className="text-2xl font-semibold">{section.title}</h2>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-[color:var(--muted)]">{section.body}</p>
              {section.examples && (
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  {section.examples.map((example) => (
                    <div key={example} className="rounded-[8px] border border-black/5 bg-white/70 p-3 text-sm leading-6 text-slate-700 shadow-sm">
                      {example}
                    </div>
                  ))}
                </div>
              )}
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
