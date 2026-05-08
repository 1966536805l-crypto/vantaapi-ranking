import Link from "next/link";
import type { Metadata } from "next";
import FlagLanguageToggle from "@/components/layout/FlagLanguageToggle";
import { WorldLanguageExplorer } from "@/components/learning/WorldLanguageExplorer";
import { localizedHref, resolveInterfaceLanguage, type InterfaceLanguage, type PageSearchParams } from "@/lib/language";
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

type LanguagesPageLanguage = "en" | "zh" | "ja" | "ar";

function languagesPageLanguage(language: InterfaceLanguage): LanguagesPageLanguage {
  if (language === "zh" || language === "ja" || language === "ar") return language;
  return "en";
}

const pageCopy: Record<LanguagesPageLanguage, {
  navWorld: string;
  navTools: string;
  navProgramming: string;
  eyebrow: string;
  title: string;
  body: string;
  english: string;
  japanese: string;
  spanish: string;
  orderLabel: string;
  zeroRules: { eyebrow: string; title: string; body: string }[];
  recommendedEyebrow: string;
  recommendedTitle: string;
  languageCount: (count: number) => string;
  familiesEyebrow: string;
  familiesTitle: string;
  familyCount: (count: number) => string;
  cardBody: (nativeName: string) => string;
}> = {
  en: {
    navWorld: "World languages",
    navTools: "AI Tools",
    navProgramming: "Coding Lab",
    eyebrow: "World languages from zero",
    title: "Start any world language from zero",
    body: "Begin with sound, script, first phrases, sentence swaps, and daily review so every language has a practical first step.",
    english: "Learn English",
    japanese: "Learn Japanese",
    spanish: "Learn Spanish",
    orderLabel: "Zero foundation order",
    zeroRules: [
      { eyebrow: "Hear first", title: "Sound before tables", body: "Start with greetings thanks and self introduction before grammar tables." },
      { eyebrow: "Read early", title: "Notice the script", body: "In week one, learn shapes, sounds, direction, and input habits for new scripts." },
      { eyebrow: "Swap sentences", title: "Practice whole phrases", body: "Use I am learning, I need water, and I do not understand, then replace one slot at a time." },
      { eyebrow: "Short review", title: "Ten minutes daily", body: "A short daily loop is steadier than one long session. Revive yesterday before adding today." },
    ],
    recommendedEyebrow: "Recommended",
    recommendedTitle: "Start with common languages",
    languageCount: (count) => `${count} languages`,
    familiesEyebrow: "Families",
    familiesTitle: "Find by language family",
    familyCount: (count) => `${count} languages`,
    cardBody: (nativeName) => `Start ${nativeName} with sound, script, and first phrases.`,
  },
  zh: {
    navWorld: "世界语言",
    navTools: "AI 工具",
    navProgramming: "编程训练",
    eyebrow: "世界语言 0 基础",
    title: "世界语言从 0 开始",
    body: "从发音开始 再到文字系统 第一批短句 句型替换 每日复习 让任何语言都能从 0 开始学",
    english: "学英语",
    japanese: "学日本語",
    spanish: "学Español",
    orderLabel: "0 基础顺序",
    zeroRules: [
      { eyebrow: "先听声音", title: "声音先行", body: "不要一上来背语法表 先把问候 感谢 自我介绍听到节奏熟悉" },
      { eyebrow: "早认文字", title: "文字早认", body: "遇到新文字系统 第一周就认识字形 声音 方向和输入习惯" },
      { eyebrow: "整句替换", title: "整句替换", body: "先练我正在学 我要水 我没听懂 这类高频句 再一次替换一个位置" },
      { eyebrow: "短频复习", title: "短频复习", body: "每天十分钟比一次学很久更稳 每次先复活昨天 再加新句子" },
    ],
    recommendedEyebrow: "推荐入口",
    recommendedTitle: "先从常用语言开始",
    languageCount: (count) => `${count} 门语言`,
    familiesEyebrow: "语系",
    familiesTitle: "按语系找入口",
    familyCount: (count) => `${count} 门语言`,
    cardBody: (nativeName) => `从声音 文字 第一批短句开始 建立 ${nativeName} 的入门手感`,
  },
  ja: {
    navWorld: "世界の言語",
    navTools: "AI ツール",
    navProgramming: "プログラミング",
    eyebrow: "世界の言語 ゼロ基礎",
    title: "どの言語もゼロから始める",
    body: "音、文字、最初の短文、文型の入れ替え、毎日の復習から始めるので、どの言語にも最初の一歩があります。",
    english: "英語を学ぶ",
    japanese: "日本語を学ぶ",
    spanish: "スペイン語を学ぶ",
    orderLabel: "ゼロ基礎の順序",
    zeroRules: [
      { eyebrow: "まず音", title: "音から入る", body: "文法表より先に、挨拶、感謝、自己紹介のリズムに慣れます。" },
      { eyebrow: "早く文字", title: "文字を早めに見る", body: "新しい文字体系では、最初の週に形、音、方向、入力の癖をつかみます。" },
      { eyebrow: "文で交換", title: "丸ごと短文を使う", body: "学んでいます、水がほしい、わかりません、のような文を一か所ずつ入れ替えます。" },
      { eyebrow: "短く復習", title: "毎日十分", body: "長時間を一回より、短い毎日の復習が安定します。昨日を戻してから今日を足します。" },
    ],
    recommendedEyebrow: "おすすめ",
    recommendedTitle: "よく使う言語から始める",
    languageCount: (count) => `${count} 言語`,
    familiesEyebrow: "語族",
    familiesTitle: "語族から探す",
    familyCount: (count) => `${count} 言語`,
    cardBody: (nativeName) => `${nativeName} を音、文字、最初の短文から始めます。`,
  },
  ar: {
    navWorld: "لغات العالم",
    navTools: "أدوات AI",
    navProgramming: "مختبر البرمجة",
    eyebrow: "لغات العالم من الصفر",
    title: "ابدأ أي لغة عالمية من الصفر",
    body: "ابدأ بالصوت ثم الكتابة ثم العبارات الأولى وتبديل الجمل والمراجعة اليومية حتى تكون لكل لغة خطوة واضحة.",
    english: "تعلم الإنجليزية",
    japanese: "تعلم اليابانية",
    spanish: "تعلم الإسبانية",
    orderLabel: "ترتيب البداية من الصفر",
    zeroRules: [
      { eyebrow: "الصوت أولا", title: "ابدأ بالسماع", body: "لا تبدأ بجداول القواعد. تعود أولا على التحية والشكر والتعريف بالنفس." },
      { eyebrow: "الكتابة مبكرا", title: "تعرف على الحروف", body: "في الأسبوع الأول افهم شكل الكتابة وصوتها واتجاهها وطريقة إدخالها." },
      { eyebrow: "بدل الجمل", title: "تدرب بعبارات كاملة", body: "تدرب على أنا أتعلم، أريد ماء، لم أفهم، ثم بدل جزءا واحدا في كل مرة." },
      { eyebrow: "مراجعة قصيرة", title: "عشر دقائق يوميا", body: "مراجعة قصيرة يومية أفضل من جلسة طويلة متقطعة. أعد أمس ثم أضف اليوم." },
    ],
    recommendedEyebrow: "مداخل مقترحة",
    recommendedTitle: "ابدأ باللغات الأكثر استخداما",
    languageCount: (count) => `${count} لغة`,
    familiesEyebrow: "العائلات",
    familiesTitle: "ابحث حسب عائلة اللغة",
    familyCount: (count) => `${count} لغة`,
    cardBody: (nativeName) => `ابدأ ${nativeName} بالصوت والكتابة والعبارات الأولى.`,
  },
};

const starterStepCopy: Record<LanguagesPageLanguage, Record<string, { title: string; body: string }>> = {
  en: {
    sound: { title: "Hear the sound", body: "Start with greetings thanks and self introduction before grammar." },
    script: { title: "Meet the script", body: "For non Latin scripts learn shapes sounds and direction early." },
    sentence: { title: "Use whole sentences", body: "Put every word inside a sentence instead of memorizing alone." },
    review: { title: "Short frequent review", body: "Ten minutes daily beats one long weekend session." },
  },
  zh: {
    sound: { title: "先听音", body: "先掌握问候 感谢 自我介绍 三句话 不急着背语法" },
    script: { title: "再认字", body: "拉丁字母以外的语言先认字母或文字系统" },
    sentence: { title: "整句输入", body: "每个词都放到一句话里练 不孤立背词" },
    review: { title: "短频复习", body: "每天 10 分钟比周末一次 2 小时更稳" },
  },
  ja: {
    sound: { title: "まず音を聞く", body: "文法より先に、挨拶、感謝、自己紹介の三文を覚えます。" },
    script: { title: "次に文字を見る", body: "ラテン文字以外では、文字の形、音、方向を早めにつかみます。" },
    sentence: { title: "文で入力する", body: "単語だけでなく、必ず短い文の中で練習します。" },
    review: { title: "短く何度も復習", body: "週末二時間より、毎日十分の方が安定します。" },
  },
  ar: {
    sound: { title: "اسمع أولا", body: "ابدأ بثلاث جمل للتحية والشكر والتعريف بالنفس قبل القواعد." },
    script: { title: "تعرف على الكتابة", body: "في اللغات غير اللاتينية تعلم شكل الحروف وصوتها واتجاهها مبكرا." },
    sentence: { title: "استخدم جملا كاملة", body: "ضع كل كلمة داخل جملة قصيرة بدلا من حفظها وحدها." },
    review: { title: "مراجعة قصيرة متكررة", body: "عشر دقائق يوميا أفضل من ساعتين في نهاية الأسبوع." },
  },
};

function starterStepText(step: (typeof worldLanguageStarterPlan)[number], language: LanguagesPageLanguage) {
  return starterStepCopy[language][step.id] ?? {
    title: language === "zh" ? step.zh : step.en,
    body: language === "zh" ? step.bodyZh : step.bodyEn,
  };
}

export default async function WorldLanguagesPage({ searchParams }: { searchParams?: Promise<PageSearchParams> }) {
  const language = resolveInterfaceLanguage(searchParams ? await searchParams : undefined);
  const copyLanguage = languagesPageLanguage(language);
  const copy = pageCopy[copyLanguage];

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
    <main className="apple-page pb-16" dir={language === "ar" ? "rtl" : "ltr"} data-interface-language={language}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <section className="mx-auto grid min-h-screen w-[min(1480px,calc(100%_-_28px))] gap-3 py-5 lg:grid-cols-[220px_minmax(0,1fr)]">
        <aside className="dense-panel sticky top-5 h-fit p-3">
          <Link href={localizedHref("/", language)} className="mb-3 flex items-center gap-2 rounded-[8px] p-2 font-semibold">
            <span className="grid h-8 w-8 place-items-center rounded-[8px] bg-slate-950 text-[10px] text-white">JM</span>
            <span>JinMing Lab</span>
          </Link>
          <nav className="grid gap-1 text-sm">
            <Link href={localizedHref("/languages", language)} className="rail-link rail-link-active">
              <span>W</span>
              <strong>{copy.navWorld}</strong>
            </Link>
            <Link href={localizedHref("/tools", language)} className="rail-link">
              <span>T</span>
              <strong>{copy.navTools}</strong>
            </Link>
            <Link href={localizedHref("/programming", language)} className="rail-link">
              <span>C</span>
              <strong>{copy.navProgramming}</strong>
            </Link>
          </nav>
          <div className="mt-3">
            <FlagLanguageToggle initialLanguage={language} />
          </div>
        </aside>

        <section className="min-w-0">
          <section className="dense-panel overflow-hidden p-5 sm:p-6">
            <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_380px] xl:items-end">
              <div>
                <p className="eyebrow">{copy.eyebrow}</p>
                <h1 className="mt-3 max-w-5xl text-3xl font-semibold leading-[1.04] sm:text-4xl lg:text-5xl">
                  {copy.title}
                </h1>
                <p className="mt-3 max-w-3xl text-sm leading-6 text-[color:var(--muted)]">
                  {copy.body}
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                  <Link href={localizedHref("/languages/english", language)} className="dense-action-primary px-4 py-2.5">
                    {copy.english}
                  </Link>
                  <Link href={localizedHref("/languages/japanese", language)} className="dense-action px-4 py-2.5">
                    {copy.japanese}
                  </Link>
                  <Link href={localizedHref("/languages/spanish", language)} className="dense-action px-4 py-2.5">
                    {copy.spanish}
                  </Link>
                </div>
              </div>

              <div className="rounded-[8px] border border-slate-200 bg-white/75 p-4">
                <p className="eyebrow">{copy.orderLabel}</p>
                <div className="mt-3 grid gap-2">
                  {worldLanguageStarterPlan.map((step) => (
                    <div key={step.id} className="dense-row">
                      <span className="text-sm font-semibold">{starterStepText(step, copyLanguage).title}</span>
                      <span className="truncate text-xs text-[color:var(--muted)]">{starterStepText(step, copyLanguage).body}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="mt-3 grid gap-3 lg:grid-cols-4">
            {copy.zeroRules.map((rule) => (
              <article key={rule.title} className="dense-card p-5">
                <p className="eyebrow">{rule.eyebrow}</p>
                <h2 className="mt-3 text-xl font-semibold">{rule.title}</h2>
                <p className="mt-3 text-sm leading-6 text-[color:var(--muted)]">{rule.body}</p>
              </article>
            ))}
          </section>

          <section className="mt-3 grid gap-3 xl:grid-cols-[minmax(0,1.08fr)_minmax(320px,0.92fr)]">
            <div className="dense-panel p-5">
              <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
                <div>
                  <p className="eyebrow">{copy.recommendedEyebrow}</p>
                  <h2 className="mt-2 text-2xl font-semibold">{copy.recommendedTitle}</h2>
                </div>
                <span className="dense-status">{copy.languageCount(worldLanguages.length)}</span>
              </div>
              <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                {featuredLanguages.map((item) => (
                  <LanguageCard key={item.slug} language={item} interfaceLanguage={language} copy={copy} />
                ))}
              </div>
            </div>

            <div className="dense-panel dense-grid-bg p-5">
              <p className="eyebrow text-slate-400">{copy.familiesEyebrow}</p>
              <h2 className="mt-2 text-2xl font-semibold text-white">{copy.familiesTitle}</h2>
              <div className="mt-5 grid gap-2 sm:grid-cols-2">
                {worldLanguageFamilies.map((family) => {
                  const count = worldLanguages.filter((language) => language.family === family).length;
                  return (
                    <div key={family} className="rounded-[8px] border border-white/10 bg-white/[0.07] p-3">
                      <p className="font-semibold text-white">{family}</p>
                      <p className="mt-1 text-xs text-slate-300">{copy.familyCount(count)}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          <WorldLanguageExplorer languages={worldLanguages} families={worldLanguageFamilies} language={language} />
        </section>
      </section>
    </main>
  );
}

function LanguageCard({
  language,
  interfaceLanguage,
  copy,
  compact = false,
}: {
  language: (typeof worldLanguages)[number];
  interfaceLanguage: InterfaceLanguage;
  copy: (typeof pageCopy)[LanguagesPageLanguage];
  compact?: boolean;
}) {
  return (
    <Link href={localizedHref(`/languages/${language.slug}`, interfaceLanguage)} className="dense-card p-4 transition hover:-translate-y-0.5 hover:border-slate-300">
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
          {copy.cardBody(language.nativeName)}
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
