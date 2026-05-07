import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { worldLanguages, worldLanguageStarterPlan } from "@/lib/world-language-content";

type WorldLanguagePageProps = {
  params: Promise<{ language: string }>;
};

const survivalSlots = [
  { title: "Greeting", zh: "问候", pattern: "Hello" },
  { title: "Thanks", zh: "感谢", pattern: "Thank you" },
  { title: "Self Intro", zh: "自我介绍", pattern: "I am learning this language" },
  { title: "Need", zh: "需求", pattern: "I want water" },
  { title: "Confusion", zh: "听不懂", pattern: "I do not understand" },
  { title: "Repeat", zh: "请重复", pattern: "Please say it again" },
  { title: "Direction", zh: "方向", pattern: "Where is this place" },
  { title: "Price", zh: "价格", pattern: "How much is it" },
];

const weekPlan = [
  { day: "Day 1", zh: "只听三句话", body: "Hear the first three phrases ten times and copy the sound without reading grammar." },
  { day: "Day 2", zh: "认识文字系统", body: "Learn script direction letters or character shapes and type the three phrases once." },
  { day: "Day 3", zh: "整句跟读", body: "Read phrase by phrase and mark the sound you cannot pronounce yet." },
  { day: "Day 4", zh: "替换一个词", body: "Keep the sentence frame and replace one word such as language name place or object." },
  { day: "Day 5", zh: "听写短句", body: "Listen hide the text and type the phrase from memory." },
  { day: "Day 6", zh: "小对话", body: "Combine greeting thanks and one need into a six line mini dialogue." },
  { day: "Day 7", zh: "复盘", body: "Review what felt hard and keep only ten reliable phrases for the next week." },
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
      title: "World Language Course - VantaAPI",
    };
  }

  return {
    title: `${current.name} Zero Foundation Course - VantaAPI`,
    description: `Learn ${current.name} from zero with pronunciation script first phrases sentence slots and a seven day plan.`,
    alternates: {
      canonical: `/languages/${current.slug}`,
    },
    openGraph: {
      title: `${current.name} Zero Foundation Course - VantaAPI`,
      description: `Start ${current.name} from zero with sound script first phrases and daily review.`,
      url: `https://vantaapi.com/languages/${current.slug}`,
      siteName: "VantaAPI",
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

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: `${current.name} Zero Foundation Course`,
    description: `A zero foundation ${current.name} course for ${current.starterGoal}.`,
    provider: {
      "@type": "Organization",
      name: "VantaAPI",
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
          <Link href="/languages" className="dense-action">Back to Languages</Link>
          <div className="flex flex-wrap gap-2">
            <Link href="/tools" className="dense-action">AI Tools</Link>
            <Link href="/programming" className="dense-action">Coding Lab</Link>
          </div>
        </header>

        <section className="mt-3 dense-panel overflow-hidden p-5 sm:p-6">
          <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px] xl:items-end">
            <div>
              <p className="eyebrow">{current.family} · {current.region}</p>
              <h1 className="mt-3 max-w-5xl text-3xl font-semibold leading-[1.04] sm:text-4xl lg:text-5xl">
                {current.name} From Zero
              </h1>
              <p className="mt-2 text-xl font-semibold">{current.nativeName}</p>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-[color:var(--muted)]">
                0 基础第一课 先听声音 再认 {current.script} 然后用三句话建立信心
              </p>
            </div>

            <div className="rounded-[8px] border border-slate-200 bg-white/75 p-4">
              <p className="eyebrow">First Three Phrases</p>
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
            <p className="eyebrow">Script</p>
            <h2 className="mt-3 text-xl font-semibold">{current.script}</h2>
            <p className="mt-3 text-sm leading-6 text-[color:var(--muted)]">
              先知道文字怎么写 怎么读 怎么输入 不急着背复杂规则
            </p>
          </article>
          <article className="dense-card p-5">
            <p className="eyebrow">Goal</p>
            <h2 className="mt-3 text-xl font-semibold">Starter Use</h2>
            <p className="mt-3 text-sm leading-6 text-[color:var(--muted)]">{current.starterGoal}</p>
          </article>
          <article className="dense-card p-5">
            <p className="eyebrow">Method</p>
            <h2 className="mt-3 text-xl font-semibold">Hear Read Say Type</h2>
            <p className="mt-3 text-sm leading-6 text-[color:var(--muted)]">
              每句话都按 听一遍 看一遍 跟读一遍 打出来一遍 的顺序练
            </p>
          </article>
          <article className="dense-card p-5">
            <p className="eyebrow">Review</p>
            <h2 className="mt-3 text-xl font-semibold">Ten Minutes Daily</h2>
            <p className="mt-3 text-sm leading-6 text-[color:var(--muted)]">
              先把昨天的三句话复活 再加今天的新内容
            </p>
          </article>
        </section>

        <section className="mt-3 grid gap-3 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <div className="dense-panel dense-grid-bg p-5">
            <p className="eyebrow text-slate-400">Zero Foundation Order</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">每门语言都按这个顺序开局</h2>
            <div className="mt-5 grid gap-2">
              {worldLanguageStarterPlan.map((step, index) => (
                <div key={step.id} className="rounded-[8px] border border-white/10 bg-white/[0.07] p-3">
                  <div className="flex items-start gap-3">
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-[8px] bg-white text-xs font-semibold text-slate-950">
                      {index + 1}
                    </span>
                    <div>
                      <h3 className="font-semibold text-white">{step.zh} · {step.en}</h3>
                      <p className="mt-1 text-sm leading-6 text-slate-300">{step.bodyZh}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="dense-panel p-5">
            <p className="eyebrow">Survival Slots</p>
            <h2 className="mt-2 text-2xl font-semibold">第一批短句位</h2>
            <div className="mt-5 grid gap-2 sm:grid-cols-2">
              {survivalSlots.map((slot, index) => (
                <article key={slot.title} className="dense-card p-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold">{slot.zh}</p>
                    <span className="dense-status">{String(index + 1).padStart(2, "0")}</span>
                  </div>
                  <h3 className="mt-3 text-lg font-semibold">{slot.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-[color:var(--muted)]">{slot.pattern}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-3 dense-panel p-5">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="eyebrow">7 Day Starter</p>
              <h2 className="mt-2 text-2xl font-semibold">第一周不追求多 只追求稳</h2>
            </div>
            <span className="dense-status">0 foundation</span>
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
            <p className="eyebrow">Same Family</p>
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
