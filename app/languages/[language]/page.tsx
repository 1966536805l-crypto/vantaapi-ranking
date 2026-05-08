import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import FlagLanguageToggle from "@/components/layout/FlagLanguageToggle";
import { WorldLanguageStarterTrainer } from "@/components/learning/WorldLanguageStarterTrainer";
import { localizedHref, localizedLanguageAlternates, resolveInterfaceLanguage, type InterfaceLanguage, type PageSearchParams } from "@/lib/language";
import {
  worldLanguages,
  worldLanguageStarterPlan,
  worldLanguageSurvivalPhrases,
  type SurvivalPhraseKey,
} from "@/lib/world-language-content";

type WorldLanguagePageProps = {
  params: Promise<{ language: string }>;
  searchParams?: Promise<PageSearchParams>;
};

type DetailLanguage = "en" | "zh" | "ja" | "ar";

function detailLanguage(language: InterfaceLanguage): DetailLanguage {
  if (language === "zh" || language === "ja" || language === "ar") return language;
  return "en";
}

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

const detailCopy: Record<DetailLanguage, {
  back: string;
  tools: string;
  programming: string;
  zero: string;
  fromFirst: string;
  heroBody: (script: string) => string;
  firstThree: string;
  cards: (nativeName: string, script: string) => { eyebrow: string; title: string; body: string }[];
  orderEyebrow: string;
  orderTitle: string;
  survivalEyebrow: string;
  survivalTitle: string;
  weekEyebrow: string;
  weekTitle: string;
  zeroStatus: string;
  sameFamilyEyebrow: string;
  sameFamilyTitle: string;
}> = {
  en: {
    back: "Back to languages",
    tools: "AI Tools",
    programming: "Coding Lab",
    zero: "zero foundation",
    fromFirst: "from the first phrase",
    heroBody: (script) => `First lesson from zero. Hear the sound, meet ${script}, then build confidence with three phrases.`,
    firstThree: "First three phrases",
    cards: (nativeName, script) => [
      { eyebrow: "Script", title: script, body: "Learn how it is written, read, and typed before memorizing complex rules." },
      { eyebrow: "Goal", title: "Speak first", body: `Start with the sound, script, and daily phrases of ${nativeName}.` },
      { eyebrow: "Method", title: "Hear See Say Type", body: "Each phrase follows one loop: listen, look, repeat, and type." },
      { eyebrow: "Review", title: "Ten minutes daily", body: "Revive yesterday's three phrases before adding today's content." },
    ],
    orderEyebrow: "Zero foundation order",
    orderTitle: "Every language starts with this order",
    survivalEyebrow: "Survival phrases",
    survivalTitle: "First phrase slots",
    weekEyebrow: "7 day start",
    weekTitle: "The first week aims for steadiness, not volume",
    zeroStatus: "zero foundation",
    sameFamilyEyebrow: "Same family",
    sameFamilyTitle: "Compare nearby languages",
  },
  zh: {
    back: "返回语言列表",
    tools: "AI 工具",
    programming: "编程训练",
    zero: "0 基础",
    fromFirst: "从第一句开始",
    heroBody: (script) => `0 基础第一课 先听声音 再认 ${script} 然后用三句话建立信心`,
    firstThree: "前三句",
    cards: (nativeName, script) => [
      { eyebrow: "文字", title: script, body: "先知道文字怎么写 怎么读 怎么输入 不急着背复杂规则" },
      { eyebrow: "目标", title: "先能开口", body: `先掌握 ${nativeName} 的声音 文字和日常短句` },
      { eyebrow: "方法", title: "听 看 说 打", body: "每句话都按 听一遍 看一遍 跟读一遍 打出来一遍 的顺序练" },
      { eyebrow: "复习", title: "每天十分钟", body: "先把昨天的三句话复活 再加今天的新内容" },
    ],
    orderEyebrow: "0 基础顺序",
    orderTitle: "每门语言都按这个顺序开局",
    survivalEyebrow: "生存短句",
    survivalTitle: "第一批短句位",
    weekEyebrow: "7 天入门",
    weekTitle: "第一周不追求多 只追求稳",
    zeroStatus: "0 基础",
    sameFamilyEyebrow: "同语系",
    sameFamilyTitle: "同语系可以顺手对比",
  },
  ja: {
    back: "言語一覧へ戻る",
    tools: "AI ツール",
    programming: "プログラミング",
    zero: "ゼロ基礎",
    fromFirst: "最初の一文から",
    heroBody: (script) => `ゼロからの第一課です。音を聞き、${script} を見て、三つの文で自信を作ります。`,
    firstThree: "最初の三文",
    cards: (nativeName, script) => [
      { eyebrow: "文字", title: script, body: "複雑な規則を覚える前に、書き方、読み方、入力方法を見ます。" },
      { eyebrow: "目標", title: "まず話す", body: `${nativeName} の音、文字、日常短文から始めます。` },
      { eyebrow: "方法", title: "聞く 見る 言う 打つ", body: "各文を、聞く、見る、まねる、入力する、の順で練習します。" },
      { eyebrow: "復習", title: "毎日十分", body: "昨日の三文を戻してから、今日の内容を足します。" },
    ],
    orderEyebrow: "ゼロ基礎の順序",
    orderTitle: "すべての言語をこの順序で始める",
    survivalEyebrow: "サバイバル短文",
    survivalTitle: "最初の文型スロット",
    weekEyebrow: "7日入門",
    weekTitle: "第一週は量より安定を優先",
    zeroStatus: "ゼロ基礎",
    sameFamilyEyebrow: "同じ語族",
    sameFamilyTitle: "近い言語を比べる",
  },
  ar: {
    back: "العودة إلى قائمة اللغات",
    tools: "أدوات AI",
    programming: "مختبر البرمجة",
    zero: "من الصفر",
    fromFirst: "من أول عبارة",
    heroBody: (script) => `الدرس الأول من الصفر. استمع للصوت، تعرف على ${script}، ثم ابن الثقة بثلاث عبارات.`,
    firstThree: "أول ثلاث عبارات",
    cards: (nativeName, script) => [
      { eyebrow: "الكتابة", title: script, body: "تعرف أولا على طريقة الكتابة والقراءة والإدخال قبل القواعد المعقدة." },
      { eyebrow: "الهدف", title: "تكلم أولا", body: `ابدأ بصوت ${nativeName} وكتابته وعباراته اليومية.` },
      { eyebrow: "الطريقة", title: "اسمع شاهد قل اكتب", body: "كل عبارة تمر بحلقة واحدة: استمع، انظر، ردد، ثم اكتب." },
      { eyebrow: "المراجعة", title: "عشر دقائق يوميا", body: "أعد عبارات الأمس الثلاث قبل إضافة محتوى اليوم." },
    ],
    orderEyebrow: "ترتيب البداية من الصفر",
    orderTitle: "كل لغة تبدأ بهذا الترتيب",
    survivalEyebrow: "عبارات النجاة",
    survivalTitle: "خانات العبارات الأولى",
    weekEyebrow: "بداية 7 أيام",
    weekTitle: "الأسبوع الأول للاستقرار لا للكثرة",
    zeroStatus: "من الصفر",
    sameFamilyEyebrow: "نفس العائلة",
    sameFamilyTitle: "قارن اللغات القريبة",
  },
};

const survivalSlotCopy: Record<DetailLanguage, Record<SurvivalPhraseKey, { label: string; fallback: string }>> = {
  en: {
    greeting: { label: "Greeting", fallback: "Learn a local greeting first" },
    thanks: { label: "Thanks", fallback: "Learn a thank you phrase first" },
    selfIntro: { label: "Self intro", fallback: "Learn I am learning this language" },
    need: { label: "Need", fallback: "Learn I need water or I need help" },
    confusion: { label: "Confusion", fallback: "Learn I do not understand" },
    repeat: { label: "Repeat", fallback: "Learn please say that again" },
    direction: { label: "Direction", fallback: "Learn where is this place" },
    price: { label: "Price", fallback: "Learn how much is it" },
  },
  zh: Object.fromEntries(survivalSlots.map((slot) => [slot.key, { label: slot.zh, fallback: slot.fallback }])) as Record<SurvivalPhraseKey, { label: string; fallback: string }>,
  ja: {
    greeting: { label: "挨拶", fallback: "まず現地の挨拶を学ぶ" },
    thanks: { label: "感謝", fallback: "まずありがとうの文を学ぶ" },
    selfIntro: { label: "自己紹介", fallback: "この言語を学んでいますを学ぶ" },
    need: { label: "必要", fallback: "水がほしい 助けが必要 を学ぶ" },
    confusion: { label: "わからない", fallback: "わかりませんを学ぶ" },
    repeat: { label: "もう一度", fallback: "もう一度言ってくださいを学ぶ" },
    direction: { label: "方向", fallback: "ここはどこですかを学ぶ" },
    price: { label: "値段", fallback: "いくらですかを学ぶ" },
  },
  ar: {
    greeting: { label: "تحية", fallback: "تعلم تحية محلية أولا" },
    thanks: { label: "شكر", fallback: "تعلم عبارة شكر أولا" },
    selfIntro: { label: "تعريف بالنفس", fallback: "تعلم أنا أتعلم هذه اللغة" },
    need: { label: "حاجة", fallback: "تعلم أريد ماء أو أحتاج مساعدة" },
    confusion: { label: "لم أفهم", fallback: "تعلم لم أفهم" },
    repeat: { label: "كرر", fallback: "تعلم من فضلك أعد القول" },
    direction: { label: "اتجاه", fallback: "تعلم أين هذا المكان" },
    price: { label: "السعر", fallback: "تعلم كم السعر" },
  },
};

const weekPlanCopy: Record<DetailLanguage, { day: string; title: string; body: string }[]> = {
  en: [
    { day: "Day 1", title: "Only hear three phrases", body: "Listen ten times and imitate the sound before grammar." },
    { day: "Day 2", title: "Meet the script", body: "Check direction, shapes, and type the three phrases once." },
    { day: "Day 3", title: "Repeat whole phrases", body: "Repeat phrase by phrase and mark sounds that still feel unstable." },
    { day: "Day 4", title: "Swap one word", body: "Keep the pattern and replace only language, place, or object." },
    { day: "Day 5", title: "Dictate short phrases", body: "Listen, hide the text, and type the phrase from memory." },
    { day: "Day 6", title: "Tiny dialogue", body: "Combine greeting, thanks, and one need into a six line dialogue." },
    { day: "Day 7", title: "Review", body: "Keep ten phrases you can really say before moving on." },
  ],
  zh: weekPlan.map((item) => ({ day: item.day, title: item.zh, body: item.body })),
  ja: [
    { day: "1日目", title: "三文だけ聞く", body: "三文を十回聞き、文法より先に音をまねます。" },
    { day: "2日目", title: "文字体系を見る", body: "方向、文字の形を見て、三文を一度入力します。" },
    { day: "3日目", title: "文ごとに復唱", body: "一文ずつまねて、まだ不安定な音を印します。" },
    { day: "4日目", title: "一語だけ入れ替え", body: "文型を保ち、言語名、場所、物だけを替えます。" },
    { day: "5日目", title: "短文ディクテーション", body: "聞いて、文字を隠し、記憶から入力します。" },
    { day: "6日目", title: "小さな会話", body: "挨拶、感謝、必要表現を六行の会話にします。" },
    { day: "7日目", title: "復習", body: "本当に口に出せる十文だけ残して次へ進みます。" },
  ],
  ar: [
    { day: "اليوم 1", title: "اسمع ثلاث عبارات فقط", body: "استمع عشر مرات وقلد الصوت قبل القواعد." },
    { day: "اليوم 2", title: "تعرف على الكتابة", body: "افحص الاتجاه والأشكال واكتب العبارات الثلاث مرة." },
    { day: "اليوم 3", title: "ردد عبارات كاملة", body: "ردد عبارة بعد عبارة وحدد الأصوات غير الثابتة." },
    { day: "اليوم 4", title: "بدل كلمة واحدة", body: "احتفظ بالنمط وبدل اللغة أو المكان أو الشيء فقط." },
    { day: "اليوم 5", title: "إملاء عبارات قصيرة", body: "استمع، أخف النص، واكتب العبارة من الذاكرة." },
    { day: "اليوم 6", title: "حوار صغير", body: "اجمع التحية والشكر وحاجة واحدة في حوار من ستة أسطر." },
    { day: "اليوم 7", title: "مراجعة", body: "اترك عشر عبارات تستطيع قولها فعلا قبل الانتقال." },
  ],
};

const starterStepDetailCopy: Record<DetailLanguage, Record<string, { title: string; body: string }>> = {
  en: {
    sound: { title: "Hear the sound", body: "Start with greeting thanks and self introduction before grammar." },
    script: { title: "Meet the script", body: "For non Latin scripts learn the writing system early." },
    sentence: { title: "Use whole sentences", body: "Put every word inside a sentence instead of memorizing alone." },
    review: { title: "Short frequent review", body: "Ten minutes daily beats one long weekend session." },
  },
  zh: Object.fromEntries(worldLanguageStarterPlan.map((step) => [step.id, { title: step.zh, body: step.bodyZh }])) as Record<string, { title: string; body: string }>,
  ja: {
    sound: { title: "まず音を聞く", body: "文法より先に、挨拶、感謝、自己紹介から始めます。" },
    script: { title: "文字体系を見る", body: "ラテン文字以外では、最初に文字の形と方向を見ます。" },
    sentence: { title: "文で使う", body: "単語だけで覚えず、必ず短い文の中で練習します。" },
    review: { title: "短く頻繁に復習", body: "毎日十分の復習が、週末だけの長時間より安定します。" },
  },
  ar: {
    sound: { title: "اسمع الصوت", body: "ابدأ بالتحية والشكر والتعريف بالنفس قبل القواعد." },
    script: { title: "تعرف على الكتابة", body: "في غير اللاتينية تعلم نظام الكتابة مبكرا." },
    sentence: { title: "استخدم جملا كاملة", body: "ضع كل كلمة داخل جملة بدلا من حفظها وحدها." },
    review: { title: "مراجعة قصيرة متكررة", body: "عشر دقائق يوميا أفضل من جلسة طويلة في نهاية الأسبوع." },
  },
};

function starterStepLabel(step: (typeof worldLanguageStarterPlan)[number], language: DetailLanguage) {
  return starterStepDetailCopy[language][step.id] ?? {
    title: language === "zh" ? step.zh : step.en,
    body: language === "zh" ? step.bodyZh : step.bodyEn,
  };
}

function getLanguage(slug: string) {
  return worldLanguages.find((language) => language.slug === slug);
}

export function generateStaticParams() {
  return worldLanguages.map((language) => ({ language: language.slug }));
}

export async function generateMetadata({ params, searchParams }: WorldLanguagePageProps): Promise<Metadata> {
  const { language } = await params;
  const interfaceLanguage = resolveInterfaceLanguage(searchParams ? await searchParams : undefined);
  const copyLanguage = detailLanguage(interfaceLanguage);
  const copy = detailCopy[copyLanguage];
  const current = getLanguage(language);
  if (!current) {
    return {
      title: "World Language Course - JinMing Lab",
    };
  }

  const path = `/languages/${current.slug}`;
  const canonical = localizedHref(path, interfaceLanguage);
  const title = `${current.name} ${copy.zero} - JinMing Lab`;
  const description = copy.heroBody(current.script);

  return {
    title,
    description,
    alternates: {
      canonical,
      languages: localizedLanguageAlternates(path),
    },
    openGraph: {
      title,
      description,
      url: `https://vantaapi.com${canonical}`,
      siteName: "JinMing Lab",
      type: "website",
    },
  };
}

export default async function WorldLanguageDetailPage({ params, searchParams }: WorldLanguagePageProps) {
  const { language } = await params;
  const interfaceLanguage = resolveInterfaceLanguage(searchParams ? await searchParams : undefined);
  const copyLanguage = detailLanguage(interfaceLanguage);
  const copy = detailCopy[copyLanguage];
  const current = getLanguage(language);
  if (!current) notFound();

  const sameFamily = worldLanguages
    .filter((item) => item.family === current.family && item.slug !== current.slug)
    .slice(0, 8);
  const survivalPhrases = worldLanguageSurvivalPhrases[current.slug];
  const trainerPhrases = survivalSlots.map((slot, index) => ({
    key: slot.key,
    label: survivalSlotCopy[copyLanguage][slot.key].label,
    text: survivalPhrases?.[slot.key] ?? current.firstLesson[index] ?? survivalSlotCopy[copyLanguage][slot.key].fallback,
  }));

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
    <main className="apple-page pb-16" dir={interfaceLanguage === "ar" ? "rtl" : "ltr"} data-interface-language={interfaceLanguage}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <section className="mx-auto min-h-screen w-[min(1280px,calc(100%_-_28px))] py-5">
        <header className="dense-panel flex flex-wrap items-center justify-between gap-3 p-4">
          <Link href={localizedHref("/languages", interfaceLanguage)} className="dense-action">{copy.back}</Link>
          <div className="flex flex-wrap items-center gap-2">
            <Link href={localizedHref("/tools", interfaceLanguage)} className="dense-action">{copy.tools}</Link>
            <Link href={localizedHref("/programming", interfaceLanguage)} className="dense-action">{copy.programming}</Link>
            <FlagLanguageToggle initialLanguage={interfaceLanguage} />
          </div>
        </header>

        <section className="mt-3 dense-panel overflow-hidden p-5 sm:p-6">
          <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px] xl:items-end">
            <div>
              <p className="eyebrow">{current.family} · {current.region}</p>
              <h1 className="mt-3 max-w-5xl text-3xl font-semibold leading-[1.04] sm:text-4xl lg:text-5xl">
                {current.nativeName} {copy.zero}
              </h1>
              <p className="mt-2 text-xl font-semibold">{current.name} · {copy.fromFirst}</p>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-[color:var(--muted)]">
                {copy.heroBody(current.script)}
              </p>
            </div>

            <div className="rounded-[8px] border border-slate-200 bg-white/75 p-4">
              <p className="eyebrow">{copy.firstThree}</p>
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
          {copy.cards(current.nativeName, current.script).map((card) => (
            <article key={card.eyebrow} className="dense-card p-5">
              <p className="eyebrow">{card.eyebrow}</p>
              <h2 className="mt-3 text-xl font-semibold">{card.title}</h2>
              <p className="mt-3 text-sm leading-6 text-[color:var(--muted)]">{card.body}</p>
            </article>
          ))}
        </section>

        <WorldLanguageStarterTrainer
          languageSlug={current.slug}
          nativeName={current.nativeName}
          languageName={current.name}
          phrases={trainerPhrases}
          interfaceLanguage={interfaceLanguage}
        />

        <section className="mt-3 grid gap-3 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <div className="dense-panel dense-grid-bg p-5">
            <p className="eyebrow text-slate-400">{copy.orderEyebrow}</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">{copy.orderTitle}</h2>
            <div className="mt-5 grid gap-2">
              {worldLanguageStarterPlan.map((step, index) => (
                <div key={step.id} className="rounded-[8px] border border-white/10 bg-white/[0.07] p-3">
                  <div className="flex items-start gap-3">
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-[8px] bg-white text-xs font-semibold text-slate-950">
                      {index + 1}
                    </span>
                    <div>
                      <h3 className="font-semibold text-white">{starterStepLabel(step, copyLanguage).title}</h3>
                      <p className="mt-1 text-sm leading-6 text-slate-300">{starterStepLabel(step, copyLanguage).body}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="dense-panel p-5">
            <p className="eyebrow">{copy.survivalEyebrow}</p>
            <h2 className="mt-2 text-2xl font-semibold">{copy.survivalTitle}</h2>
            <div className="mt-5 grid gap-2 sm:grid-cols-2">
              {survivalSlots.map((slot, index) => (
                <article key={slot.key} className="dense-card p-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold">{survivalSlotCopy[copyLanguage][slot.key].label}</p>
                    <span className="dense-status">{String(index + 1).padStart(2, "0")}</span>
                  </div>
                  <h3 className="mt-3 text-lg font-semibold">
                    {survivalPhrases?.[slot.key] ?? current.firstLesson[index] ?? survivalSlotCopy[copyLanguage][slot.key].fallback}
                  </h3>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-3 dense-panel p-5">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="eyebrow">{copy.weekEyebrow}</p>
              <h2 className="mt-2 text-2xl font-semibold">{copy.weekTitle}</h2>
            </div>
            <span className="dense-status">{copy.zeroStatus}</span>
          </div>
          <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-4">
            {weekPlanCopy[copyLanguage].map((item) => (
              <article key={item.day} className="dense-card p-4">
                <p className="eyebrow">{item.day}</p>
                <h3 className="mt-3 text-xl font-semibold">{item.title}</h3>
                <p className="mt-3 text-sm leading-6 text-[color:var(--muted)]">{item.body}</p>
              </article>
            ))}
          </div>
        </section>

        {sameFamily.length > 0 && (
          <section className="mt-3 dense-panel p-5">
            <p className="eyebrow">{copy.sameFamilyEyebrow}</p>
            <h2 className="mt-2 text-2xl font-semibold">{copy.sameFamilyTitle}</h2>
            <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              {sameFamily.map((item) => (
                <Link key={item.slug} href={localizedHref(`/languages/${item.slug}`, interfaceLanguage)} className="dense-row">
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
