import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  worldLanguages,
  worldLanguageStarterPlan,
  worldLanguageSurvivalPhrases,
  type SurvivalPhraseKey,
} from "@/lib/world-language-content";

type WorldLanguagePageProps = {
  params: Promise<{ language: string }>;
};

const survivalSlots = [
  { key: "greeting", zh: "问候", fallback: "先学当地问候句" },
  { key: "thanks", zh: "感谢", fallback: "先学感谢句" },
  { key: "selfIntro", zh: "自我介绍", fallback: "先学我正在学习这门语言" },
  { key: "need", zh: "需求", fallback: "先学我要水或我需要帮助" },
  { key: "confusion", zh: "听不懂", fallback: "先学我没听懂" },
  { key: "repeat", zh: "请重复", fallback: "先学请再说一遍" },
  { key: "direction", zh: "方向", fallback: "先学这里在哪里" },
  { key: "price", zh: "价格", fallback: "先学多少钱" },
] satisfies Array<{ key: SurvivalPhraseKey; zh: string; fallback: string }>;

const weekPlan = [
  { day: "第 1 天", zh: "只听三句话", body: "把前三句听十遍 先模仿声音 暂时不背语法" },
  { day: "第 2 天", zh: "认识文字系统", body: "先看书写方向 字母或字符形状 然后把三句话打一遍" },
  { day: "第 3 天", zh: "整句跟读", body: "一句一句跟读 标记暂时读不稳的声音" },
  { day: "第 4 天", zh: "替换一个词", body: "保留句型 只替换语言名 地点或物品" },
  { day: "第 5 天", zh: "听写短句", body: "先听 再隐藏文字 从记忆里把句子打出来" },
  { day: "第 6 天", zh: "小对话", body: "把问候 感谢 一个需求 拼成六行小对话" },
  { day: "第 7 天", zh: "复盘", body: "只留下十句真正能说出口的句子 进入下一周" },
];

function getLanguage(slug: string) {
  return worldLanguages.find((language) => language.slug === slug);
}

export function generateStaticParams() {
  return worldLanguages.map((language) => ({ language: language.slug }));
}

export async function generateMetadata({ params }: WorldLanguagePageProps): Promise<Metadata> {
  const { language } = await params;
  const current = getLanguage(language);
  if (!current) {
    return {
      title: "World Language Course - JinMing Lab",
    };
  }

  return {
    title: `${current.name} Zero Foundation Course - JinMing Lab`,
    description: `Learn ${current.name} from zero with pronunciation script first phrases sentence slots and a seven day plan.`,
    alternates: {
      canonical: `/languages/${current.slug}`,
    },
    openGraph: {
      title: `${current.name} Zero Foundation Course - JinMing Lab`,
      description: `Start ${current.name} from zero with sound script first phrases and daily review.`,
      url: `https://vantaapi.com/languages/${current.slug}`,
      siteName: "JinMing Lab",
      type: "website",
    },
  };
}

export default async function WorldLanguageDetailPage({ params }: WorldLanguagePageProps) {
  const { language } = await params;
  const current = getLanguage(language);
  if (!current) notFound();

  const sameFamily = worldLanguages
    .filter((item) => item.family === current.family && item.slug !== current.slug)
    .slice(0, 8);
  const survivalPhrases = worldLanguageSurvivalPhrases[current.slug];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: `${current.name} Zero Foundation Course`,
    description: `A zero foundation ${current.name} course for ${current.starterGoal}.`,
    provider: {
      "@type": "Organization",
      name: "JinMing Lab",
      url: "https://vantaapi.com",
    },
    inLanguage: current.name,
    url: `https://vantaapi.com/languages/${current.slug}`,
    educationalLevel: "Beginner",
  };

  return (
    <main className="apple-page pb-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <section className="mx-auto min-h-screen w-[min(1280px,calc(100%_-_28px))] py-5">
        <header className="dense-panel flex flex-wrap items-center justify-between gap-3 p-4">
          <Link href="/languages" className="dense-action">返回语言列表</Link>
          <div className="flex flex-wrap gap-2">
            <Link href="/tools" className="dense-action">AI 工具</Link>
            <Link href="/programming" className="dense-action">编程训练</Link>
          </div>
        </header>

        <section className="mt-3 dense-panel overflow-hidden p-5 sm:p-6">
          <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px] xl:items-end">
            <div>
              <p className="eyebrow">{current.family} · {current.region}</p>
              <h1 className="mt-3 max-w-5xl text-3xl font-semibold leading-[1.04] sm:text-4xl lg:text-5xl">
                {current.nativeName} 0 基础
              </h1>
              <p className="mt-2 text-xl font-semibold">{current.name} · 从第一句开始</p>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-[color:var(--muted)]">
                0 基础第一课 先听声音 再认 {current.script} 然后用三句话建立信心
              </p>
            </div>

            <div className="rounded-[8px] border border-slate-200 bg-white/75 p-4">
              <p className="eyebrow">前三句</p>
              <div className="mt-3 grid gap-2">
                {current.firstLesson.map((phrase, index) => (
                  <div key={phrase} className="dense-row">
                    <span className="text-sm font-semibold">{String(index + 1).padStart(2, "0")}</span>
                    <span className="truncate text-sm text-[color:var(--muted)]">{phrase}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mt-3 grid gap-3 lg:grid-cols-4">
          <article className="dense-card p-5">
            <p className="eyebrow">文字</p>
            <h2 className="mt-3 text-xl font-semibold">{current.script}</h2>
            <p className="mt-3 text-sm leading-6 text-[color:var(--muted)]">
              先知道文字怎么写 怎么读 怎么输入 不急着背复杂规则
            </p>
          </article>
          <article className="dense-card p-5">
            <p className="eyebrow">目标</p>
            <h2 className="mt-3 text-xl font-semibold">先能开口</h2>
            <p className="mt-3 text-sm leading-6 text-[color:var(--muted)]">
              先掌握 {current.nativeName} 的声音 文字和日常短句
            </p>
          </article>
          <article className="dense-card p-5">
            <p className="eyebrow">方法</p>
            <h2 className="mt-3 text-xl font-semibold">听 看 说 打</h2>
            <p className="mt-3 text-sm leading-6 text-[color:var(--muted)]">
              每句话都按 听一遍 看一遍 跟读一遍 打出来一遍 的顺序练
            </p>
          </article>
          <article className="dense-card p-5">
            <p className="eyebrow">复习</p>
            <h2 className="mt-3 text-xl font-semibold">每天十分钟</h2>
            <p className="mt-3 text-sm leading-6 text-[color:var(--muted)]">
              先把昨天的三句话复活 再加今天的新内容
            </p>
          </article>
        </section>

        <section className="mt-3 grid gap-3 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <div className="dense-panel dense-grid-bg p-5">
            <p className="eyebrow text-slate-400">0 基础顺序</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">每门语言都按这个顺序开局</h2>
            <div className="mt-5 grid gap-2">
              {worldLanguageStarterPlan.map((step, index) => (
                <div key={step.id} className="rounded-[8px] border border-white/10 bg-white/[0.07] p-3">
                  <div className="flex items-start gap-3">
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-[8px] bg-white text-xs font-semibold text-slate-950">
                      {index + 1}
                    </span>
                    <div>
                      <h3 className="font-semibold text-white">{step.zh}</h3>
                      <p className="mt-1 text-sm leading-6 text-slate-300">{step.bodyZh}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="dense-panel p-5">
            <p className="eyebrow">生存短句</p>
            <h2 className="mt-2 text-2xl font-semibold">第一批短句位</h2>
            <div className="mt-5 grid gap-2 sm:grid-cols-2">
              {survivalSlots.map((slot, index) => (
                <article key={slot.key} className="dense-card p-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold">{slot.zh}</p>
                    <span className="dense-status">{String(index + 1).padStart(2, "0")}</span>
                  </div>
                  <h3 className="mt-3 text-lg font-semibold">
                    {survivalPhrases?.[slot.key] ?? current.firstLesson[index] ?? slot.fallback}
                  </h3>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-3 dense-panel p-5">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="eyebrow">7 天入门</p>
              <h2 className="mt-2 text-2xl font-semibold">第一周不追求多 只追求稳</h2>
            </div>
            <span className="dense-status">0 基础</span>
          </div>
          <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-4">
            {weekPlan.map((item) => (
              <article key={item.day} className="dense-card p-4">
                <p className="eyebrow">{item.day}</p>
                <h3 className="mt-3 text-xl font-semibold">{item.zh}</h3>
                <p className="mt-3 text-sm leading-6 text-[color:var(--muted)]">{item.body}</p>
              </article>
            ))}
          </div>
        </section>

        {sameFamily.length > 0 && (
          <section className="mt-3 dense-panel p-5">
            <p className="eyebrow">同语系</p>
            <h2 className="mt-2 text-2xl font-semibold">同语系可以顺手对比</h2>
            <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              {sameFamily.map((item) => (
                <Link key={item.slug} href={`/languages/${item.slug}`} className="dense-row">
                  <span className="text-sm font-semibold">{item.name}</span>
                  <span className="truncate text-xs text-[color:var(--muted)]">{item.nativeName}</span>
                </Link>
              ))}
            </div>
          </section>
        )}
      </section>
    </main>
  );
}
