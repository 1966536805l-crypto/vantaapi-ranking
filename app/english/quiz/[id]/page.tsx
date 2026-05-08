import Link from "next/link";
import { AppleStudyHeader } from "@/components/learning/ModuleHub";
import QuizBlock from "@/components/learning/QuizBlock";
import { requireChineseForEnglishLearning } from "@/lib/english-content-access";
import { examVocabularyPacks } from "@/lib/exam-content";
import { getWordMeaning } from "@/lib/exam-i18n";
import { bilingualLanguage, localizedHref, resolveInterfaceLanguage, type PageSearchParams, type SiteLanguage } from "@/lib/language";

const quizCopy = {
  en: {
    eyebrow: "English Quiz",
    title: "English Quiz",
    subtitle: "Complete a compact exam vocabulary grammar or reading quiz with scoring explanations and wrong question review",
    cta: "Open course path",
  },
  zh: {
    eyebrow: "英语测验",
    title: "英语测验",
    subtitle: "完成词汇语法阅读练习 自动判分 显示解析 并支持错题复习",
    cta: "打开学习路径",
  },
} as const;

function buildBaseQuestions(language: SiteLanguage) {
  if (language === "zh") {
    return [
      {
        id: "fallback-english-quiz-accurate",
        type: "MULTIPLE_CHOICE",
        prompt: "选择 accurate 最接近的中文意思",
        codeSnippet: null,
        difficulty: "EASY",
        answer: "准确的",
        explanation: "accurate 表示准确的 精确的",
        options: [
          { id: "fallback-english-quiz-accurate-a", label: "A", content: "准确的" },
          { id: "fallback-english-quiz-accurate-b", label: "B", content: "很快的" },
          { id: "fallback-english-quiz-accurate-c", label: "C", content: "难以看见的" },
        ],
      },
      {
        id: "fallback-english-quiz-improve",
        type: "FILL_BLANK",
        prompt: "完成句子 Practice can ____ your reading speed",
        codeSnippet: null,
        difficulty: "EASY",
        answer: "improve",
        explanation: "improve 表示提高 改善",
        options: [],
      },
      {
        id: "fallback-english-quiz-studies",
        type: "MULTIPLE_CHOICE",
        prompt: "选择正确句子",
        codeSnippet: null,
        difficulty: "EASY",
        answer: "She studies English every day.",
        explanation: "She 是第三人称单数 所以使用 studies",
        options: [
          { id: "fallback-english-quiz-studies-a", label: "A", content: "She study English every day." },
          { id: "fallback-english-quiz-studies-b", label: "B", content: "She studies English every day." },
          { id: "fallback-english-quiz-studies-c", label: "C", content: "She studying English every day." },
        ],
      },
    ];
  }

  return [
    {
      id: "fallback-english-quiz-accurate",
      type: "MULTIPLE_CHOICE",
      prompt: "Choose the closest meaning of accurate",
      codeSnippet: null,
      difficulty: "EASY",
      answer: "correct and exact",
      explanation: "Accurate means correct and exact",
      options: [
        { id: "fallback-english-quiz-accurate-a", label: "A", content: "correct and exact" },
        { id: "fallback-english-quiz-accurate-b", label: "B", content: "very fast" },
        { id: "fallback-english-quiz-accurate-c", label: "C", content: "hard to see" },
      ],
    },
    {
      id: "fallback-english-quiz-improve",
      type: "FILL_BLANK",
      prompt: "Complete Practice can ____ your reading speed",
      codeSnippet: null,
      difficulty: "EASY",
      answer: "improve",
      explanation: "Improve means make better",
      options: [],
    },
    {
      id: "fallback-english-quiz-studies",
      type: "MULTIPLE_CHOICE",
      prompt: "Choose the correct sentence",
      codeSnippet: null,
      difficulty: "EASY",
      answer: "She studies English every day.",
      explanation: "She is third person singular so use studies",
      options: [
        { id: "fallback-english-quiz-studies-a", label: "A", content: "She study English every day." },
        { id: "fallback-english-quiz-studies-b", label: "B", content: "She studies English every day." },
        { id: "fallback-english-quiz-studies-c", label: "C", content: "She studying English every day." },
      ],
    },
  ];
}

function buildPackQuestions(id: string, language: SiteLanguage) {
  const pack = examVocabularyPacks.find((item) => item.slug === id);
  if (!pack) return buildBaseQuestions(language);
  return pack.priorityWords.map((item, index) => {
    const meaning = getWordMeaning(item, language);
    return {
      id: `fallback-english-${id}-${item.word}`,
      type: "MULTIPLE_CHOICE",
      prompt: language === "zh" ? `选择 ${item.word} 的最佳中文释义` : `Choose the best meaning of ${item.word}`,
      codeSnippet: null,
      difficulty: index > 2 ? "MEDIUM" : "EASY",
      answer: meaning,
      explanation: language === "zh" ? `${item.word} 的意思是 ${meaning} 例句 ${item.sentence}` : `${item.word} means ${meaning} Example ${item.sentence}`,
      options: [
        { id: `fallback-english-${id}-${item.word}-a`, label: "A", content: meaning },
        { id: `fallback-english-${id}-${item.word}-b`, label: "B", content: language === "zh" ? "日常问候" : "a casual greeting" },
        { id: `fallback-english-${id}-${item.word}-c`, label: "C", content: language === "zh" ? "代码里的数字" : "a number used in code" },
      ],
    };
  });
}

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<PageSearchParams>;
}) {
  const { id } = await params;
  const language = resolveInterfaceLanguage(searchParams ? await searchParams : undefined);
  requireChineseForEnglishLearning(language);
  const copyLanguage = bilingualLanguage(language);
  const questions = buildPackQuestions(id, copyLanguage);
  const copy = quizCopy[copyLanguage];

  return (
    <main className="apple-page pb-12 pt-4">
      <AppleStudyHeader language={language} />
      <section className="apple-shell py-7">
        <div className="apple-card soft-gradient p-5">
          <p className="eyebrow">{copy.eyebrow} {id}</p>
          <h1 className="mt-3 font-serif text-4xl">{copy.title}</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[color:var(--muted)]">{copy.subtitle}</p>
          <Link href={localizedHref("/learn/english", language)} className="apple-button-secondary mt-5 px-4 py-2 text-sm">{copy.cta}</Link>
        </div>
        <div className="mt-5">
          <QuizBlock lessonId={`fallback-english-quiz-${id}`} questions={questions} language={copyLanguage} strictChoiceTimer />
        </div>
      </section>
    </main>
  );
}
