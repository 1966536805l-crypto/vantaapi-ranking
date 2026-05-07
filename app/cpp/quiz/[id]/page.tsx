import Link from "next/link";
import { AppleStudyHeader } from "@/components/learning/ModuleHub";
import QuizBlock from "@/components/learning/QuizBlock";
import {
  buildCppFilteredMegaQuestions,
  cppQuestionTypePlan,
  getCppCategoryTypeCounts,
  type CppQuestionTypeFilter,
} from "@/lib/cpp-bank";
import { cppQuestionBank } from "@/lib/exam-content";
import { localizedHref, resolveLanguage, type PageSearchParams, type SiteLanguage } from "@/lib/language";

const baseQuestions = [
  {
    id: "fallback-cpp-quiz-cout",
    type: "MULTIPLE_CHOICE",
    prompt: "Which object prints output in C++?",
    codeSnippet: null,
    difficulty: "EASY",
    answer: "cout",
    explanation: "cout prints output.",
    options: [
      { id: "fallback-cpp-quiz-cout-a", label: "A", content: "cin" },
      { id: "fallback-cpp-quiz-cout-b", label: "B", content: "cout" },
      { id: "fallback-cpp-quiz-cout-c", label: "C", content: "int" },
    ],
  },
  {
    id: "fallback-cpp-quiz-output",
    type: "CODE_READING",
    prompt: "What is the output?",
    codeSnippet: "cout << 3 + 4;",
    difficulty: "EASY",
    answer: "7",
    explanation: "3 + 4 equals 7.",
    options: [],
  },
  {
    id: "fallback-cpp-quiz-int",
    type: "FILL_BLANK",
    prompt: "Declare an integer named age: ____ age;",
    codeSnippet: null,
    difficulty: "EASY",
    answer: "int",
    explanation: "int is the integer type.",
    options: [],
  },
];

const typeLabel: Record<SiteLanguage, Record<CppQuestionTypeFilter, string>> = {
  en: {
    ALL: "All",
    MULTIPLE_CHOICE: "Choice",
    FILL_BLANK: "Fill",
    CODE_READING: "Code reading",
  },
  zh: {
    ALL: "全部",
    MULTIPLE_CHOICE: "选择题",
    FILL_BLANK: "填空题",
    CODE_READING: "代码阅读",
  },
};

const pageCopy = {
  en: {
    eyebrow: "C++ Quiz",
    title: "C++ Classified Question Bank",
    description: "1000 static drills grouped by topic and type. No online compiler in this bank. Train concepts fill blanks code reading and output prediction first.",
    course: "Open course path",
    back: "Back to C++ hub",
    topicClassify: "Topic Categories",
    typeClassify: "Question Types",
    activeBank: "Current Set",
    current: "Current",
    page: "Page",
    drills: "drills",
    typeTotal: "type total",
    typeDistribution: "Type distribution",
    difficultyDistribution: "Difficulty distribution",
    previous: "Previous",
    next: "Next",
  },
  zh: {
    eyebrow: "C++ 测验",
    title: "C++ 分类题库",
    description: "1000 道静态练习已经按知识模块和题型分类。不做在线编译运行，先把概念 判断 填空 代码阅读 输出预测练扎实。",
    course: "打开课程路径",
    back: "返回 C++ 首页",
    topicClassify: "知识模块分类",
    typeClassify: "题型分类",
    activeBank: "当前题组",
    current: "当前",
    page: "第",
    drills: "题",
    typeTotal: "本题型总量",
    typeDistribution: "题型分布",
    difficultyDistribution: "难度分布",
    previous: "上一页",
    next: "下一页",
  },
} as const;

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<PageSearchParams>;
}) {
  const { id } = await params;
  const query = await searchParams;
  const language = resolveLanguage(query);
  const copy = pageCopy[language];
  const page = firstParam(query.page);
  const category = firstParam(query.category);
  const type = firstParam(query.type);
  const isMega = id === "mega-1000";
  const currentPage = Math.max(Number(page || 1) || 1, 1);
  const mega = isMega ? buildCppFilteredMegaQuestions({ categorySlug: category, type, page: currentPage, pageSize: 20 }) : null;
  const questions = mega?.questions || baseQuestions;
  const hrefFor = (next: { category?: string; type?: CppQuestionTypeFilter; page?: number }) => {
    const params = new URLSearchParams();
    params.set("category", next.category || mega?.category.slug || cppQuestionBank.categoryPlan[0].slug);
    params.set("type", next.type || mega?.type || "ALL");
    params.set("page", String(next.page || 1));
    return localizedHref(`/cpp/quiz/mega-1000?${params.toString()}`, language);
  };

  return (
    <main className="apple-page pb-12 pt-4">
      <AppleStudyHeader language={language} />
      <section className="apple-shell py-7">
        <div className="apple-card soft-gradient p-5">
          <p className="eyebrow">{copy.eyebrow} {id}</p>
          <h1 className="mt-3 font-serif text-4xl">{copy.title}</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[color:var(--muted)]">
            {copy.description}
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Link href={localizedHref("/learn/cpp", language)} className="apple-button-secondary px-4 py-2 text-sm">{copy.course}</Link>
            <Link href={localizedHref("/cpp", language)} className="apple-button-primary px-4 py-2 text-sm">{copy.back}</Link>
          </div>
        </div>

        {isMega && mega && (
          <>
            <div className="mt-5 flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="eyebrow">{copy.topicClassify}</p>
                <h2 className="mt-2 text-xl font-semibold">{language === "zh" ? "先选知识模块 再选题型" : "Choose a topic then a question type"}</h2>
              </div>
              <div className="flex flex-wrap gap-2">
                {cppQuestionTypePlan.map((item) => {
                  const active = item.slug === mega.type;
                  return (
                    <Link
                      key={item.slug}
                      href={hrefFor({ type: item.slug, page: 1 })}
                      className={active ? "apple-button-primary px-4 py-2 text-sm" : "apple-button-secondary px-4 py-2 text-sm"}
                    >
                      {typeLabel[language][item.slug]} {mega.typeCounts[item.slug]}
                    </Link>
                  );
                })}
              </div>
            </div>

            <section className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              {cppQuestionBank.categoryPlan.map((category, index) => {
                const counts = getCppCategoryTypeCounts(category.slug);
                const active = category.slug === mega.category.slug;
                return (
                  <Link key={category.slug} href={hrefFor({ category: category.slug, page: 1 })} className={`apple-card p-4 ${active ? "ring-2 ring-[color:var(--accent)]" : "apple-card-hover"}`}>
                    <p className="eyebrow">{String(index + 1).padStart(2, "0")} · {category.zh}</p>
                    <h2 className="mt-2 text-xl font-semibold">{category.title}</h2>
                    <p className="mt-2 text-sm text-[color:var(--muted)]">{category.count} drills · {category.focus.slice(0, 3).join(" / ")}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <span className="dense-status">{typeLabel[language].MULTIPLE_CHOICE} {counts.MULTIPLE_CHOICE}</span>
                      <span className="dense-status">{typeLabel[language].FILL_BLANK} {counts.FILL_BLANK}</span>
                      <span className="dense-status">{typeLabel[language].CODE_READING} {counts.CODE_READING}</span>
                    </div>
                  </Link>
                );
              })}
            </section>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-[8px] border border-black/5 bg-white/75 p-4 shadow-sm">
              <div>
                <p className="eyebrow">{copy.activeBank} · {mega.category.zh} · {typeLabel[language][mega.type]}</p>
                <p className="mt-1 text-lg font-semibold">
                  {copy.page} {mega.page} / {mega.totalPages} · {copy.current} {questions.length} {copy.drills} / {copy.typeTotal} {mega.totalQuestions}
                </p>
                <p className="mt-1 text-xs text-[color:var(--muted)]">
                  {copy.typeDistribution} {typeLabel[language].MULTIPLE_CHOICE} {mega.typeCounts.MULTIPLE_CHOICE} · {typeLabel[language].FILL_BLANK} {mega.typeCounts.FILL_BLANK} · {typeLabel[language].CODE_READING} {mega.typeCounts.CODE_READING}
                </p>
                <p className="mt-1 text-xs text-[color:var(--muted)]">{copy.difficultyDistribution} {cppQuestionBank.difficultyMix.join(" · ")}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link href={hrefFor({ page: Math.max(1, mega.page - 1) })} className="apple-button-secondary px-4 py-2 text-sm">{copy.previous}</Link>
                <Link href={hrefFor({ page: Math.min(mega.totalPages, mega.page + 1) })} className="apple-button-primary px-4 py-2 text-sm">{copy.next}</Link>
              </div>
            </div>
          </>
        )}

        <div className="mt-6">
          <QuizBlock lessonId={`fallback-cpp-quiz-${id}-${mega?.category.slug || "base"}-${mega?.type || "ALL"}-page-${mega?.page || 1}`} questions={questions} language={language} />
        </div>
      </section>
    </main>
  );
}
