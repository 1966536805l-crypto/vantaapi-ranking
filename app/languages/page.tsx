import Link from "next/link";
import type { Metadata } from "next";
import {
  worldLanguageFamilies,
  worldLanguages,
  worldLanguageStarterPlan,
} from "@/lib/world-language-content";

export const metadata: Metadata = {
  title: "World Languages Zero Foundation - JinMing Lab",
  description:
    "A zero foundation world language learning hub for pronunciation script first phrases sentence patterns and daily review.",
  alternates: {
    canonical: "/languages",
  },
  openGraph: {
    title: "World Languages Zero Foundation - JinMing Lab",
    description:
      "Start human languages from zero with sound script first phrases sentence patterns and daily review.",
    url: "https://vantaapi.com/languages",
    siteName: "JinMing Lab",
    type: "website",
  },
};

const featuredSlugs = [
  "english",
  "spanish",
  "french",
  "japanese",
  "korean",
  "chinese",
  "arabic",
  "german",
  "russian",
  "portuguese",
  "italian",
  "thai",
];

const featuredLanguages = featuredSlugs
  .map((slug) => worldLanguages.find((language) => language.slug === slug))
  .filter((language): language is (typeof worldLanguages)[number] => Boolean(language));

const zeroRules = [
  {
    title: "声音先行",
    zh: "先听声音",
    body: "不要一上来背语法表 先把问候 感谢 自我介绍听到节奏熟悉",
  },
  {
    title: "文字早认",
    zh: "早认文字",
    body: "遇到新文字系统 第一周就认识字形 声音 方向和输入习惯",
  },
  {
    title: "整句替换",
    zh: "整句替换",
    body: "先练我正在学 我要水 我没听懂 这类高频句 再一次替换一个位置",
  },
  {
    title: "短频复习",
    zh: "短频复习",
    body: "每天十分钟比一次学很久更稳 每次先复活昨天 再加新句子",
  },
];

export default function WorldLanguagesPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "JinMing Lab World Languages",
    itemListElement: worldLanguages.map((language, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: language.name,
      url: `https://vantaapi.com/languages/${language.slug}`,
      description: `${language.name} zero foundation course for ${language.starterGoal}`,
    })),
  };

  return (
    <main className="apple-page pb-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <section className="mx-auto grid min-h-screen w-[min(1480px,calc(100%_-_28px))] gap-3 py-5 lg:grid-cols-[220px_minmax(0,1fr)]">
        <aside className="dense-panel sticky top-5 h-fit p-3">
          <Link href="/" className="mb-3 flex items-center gap-2 rounded-[8px] p-2 font-semibold">
            <span className="grid h-8 w-8 place-items-center rounded-[8px] bg-slate-950 text-[10px] text-white">JM</span>
            <span>JinMing Lab</span>
          </Link>
          <nav className="grid gap-1 text-sm">
            <Link href="/languages" className="rail-link rail-link-active">
              <span>W</span>
              <strong>World Languages</strong>
            </Link>
            <Link href="/tools" className="rail-link">
              <span>T</span>
              <strong>AI Tools</strong>
            </Link>
            <Link href="/programming" className="rail-link">
              <span>C</span>
              <strong>Coding Lab</strong>
            </Link>
          </nav>
        </aside>

        <section className="min-w-0">
          <section className="dense-panel overflow-hidden p-5 sm:p-6">
            <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_380px] xl:items-end">
              <div>
                <p className="eyebrow">世界语言 0 基础</p>
                <h1 className="mt-3 max-w-5xl text-3xl font-semibold leading-[1.04] sm:text-4xl lg:text-5xl">
                  World Languages Zero Foundation
                </h1>
                <p className="mt-3 max-w-3xl text-sm leading-6 text-[color:var(--muted)]">
                  从发音开始 再到文字系统 第一批短句 句型替换 每日复习 让任何语言都能从 0 开始学
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                  <Link href="/languages/english" className="dense-action-primary px-4 py-2.5">
                    学英语
                  </Link>
                  <Link href="/languages/japanese" className="dense-action px-4 py-2.5">
                    学日本語
                  </Link>
                  <Link href="/languages/spanish" className="dense-action px-4 py-2.5">
                    学Español
                  </Link>
                </div>
              </div>

              <div className="rounded-[8px] border border-slate-200 bg-white/75 p-4">
                <p className="eyebrow">0 基础顺序</p>
                <div className="mt-3 grid gap-2">
                  {worldLanguageStarterPlan.map((step) => (
                    <div key={step.id} className="dense-row">
                      <span className="text-sm font-semibold">{step.zh}</span>
                      <span className="truncate text-xs text-[color:var(--muted)]">{step.bodyZh}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="mt-3 grid gap-3 lg:grid-cols-4">
            {zeroRules.map((rule) => (
              <article key={rule.title} className="dense-card p-5">
                <p className="eyebrow">{rule.zh}</p>
                <h2 className="mt-3 text-xl font-semibold">{rule.title}</h2>
                <p className="mt-3 text-sm leading-6 text-[color:var(--muted)]">{rule.body}</p>
              </article>
            ))}
          </section>

          <section className="mt-3 grid gap-3 xl:grid-cols-[minmax(0,1.08fr)_minmax(320px,0.92fr)]">
            <div className="dense-panel p-5">
              <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
                <div>
                  <p className="eyebrow">推荐入口</p>
                  <h2 className="mt-2 text-2xl font-semibold">先从常用语言开始</h2>
                </div>
                <span className="dense-status">{worldLanguages.length} 门语言</span>
              </div>
              <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                {featuredLanguages.map((language) => (
                  <LanguageCard key={language.slug} language={language} />
                ))}
              </div>
            </div>

            <div className="dense-panel dense-grid-bg p-5">
              <p className="eyebrow text-slate-400">语系</p>
              <h2 className="mt-2 text-2xl font-semibold text-white">按语系找入口</h2>
              <div className="mt-5 grid gap-2 sm:grid-cols-2">
                {worldLanguageFamilies.map((family) => {
                  const count = worldLanguages.filter((language) => language.family === family).length;
                  return (
                    <div key={family} className="rounded-[8px] border border-white/10 bg-white/[0.07] p-3">
                      <p className="font-semibold text-white">{family}</p>
                      <p className="mt-1 text-xs text-slate-300">{count} 门语言</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          <section className="mt-3 dense-panel p-5">
            <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="eyebrow">全部语言</p>
                <h2 className="mt-2 text-2xl font-semibold">世界语言地图</h2>
              </div>
              <span className="dense-status">0 基础课程</span>
            </div>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {worldLanguages.map((language) => (
                <LanguageCard key={language.slug} language={language} compact />
              ))}
            </div>
          </section>
        </section>
      </section>
    </main>
  );
}

function LanguageCard({
  language,
  compact = false,
}: {
  language: (typeof worldLanguages)[number];
  compact?: boolean;
}) {
  return (
    <Link href={`/languages/${language.slug}`} className="dense-card p-4 transition hover:-translate-y-0.5 hover:border-slate-300">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="eyebrow">{language.family}</p>
          <h3 className="mt-1 truncate text-lg font-semibold">{language.name}</h3>
          <p className="mt-1 truncate text-sm text-[color:var(--muted)]">{language.nativeName}</p>
        </div>
        <span className="dense-status">{language.script}</span>
      </div>
      {!compact && (
        <p className="mt-3 line-clamp-2 text-sm leading-6 text-[color:var(--muted)]">
          从声音 文字 第一批短句开始 建立 {language.nativeName} 的入门手感
        </p>
      )}
      <div className="mt-3 flex flex-wrap gap-2">
        {language.firstLesson.slice(0, compact ? 2 : 3).map((item) => (
          <span key={item} className="dense-status">{item}</span>
        ))}
      </div>
    </Link>
  );
}
