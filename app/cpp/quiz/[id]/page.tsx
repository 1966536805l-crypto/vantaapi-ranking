import Link from "next/link";
import { AppleStudyHeader } from "@/components/learning/ModuleHub";
import QuizBlock from "@/components/learning/QuizBlock";
import {
  buildCppFilteredMegaQuestions,
  cppQuestionTypePlan,
  getCppCategoryTypeCounts,
  searchCppQuestionIndex,
  type CppQuestionIndexRow,
  type CppQuestionTypeFilter,
} from "@/lib/cpp-bank";
import { cppQuestionBank, getCppCategory } from "@/lib/exam-content";
import { localizedHref, resolveInterfaceLanguage, type InterfaceLanguage, type PageSearchParams } from "@/lib/language";

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

type CppQuizLanguage = "en" | "zh" | "ja" | "ar";

function cppQuizLanguage(language: InterfaceLanguage): CppQuizLanguage {
  if (language === "zh" || language === "ja" || language === "ar") return language;
  return "en";
}

const typeLabel: Record<CppQuizLanguage, Record<CppQuestionTypeFilter, string>> = {
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
  ja: {
    ALL: "すべて",
    MULTIPLE_CHOICE: "選択",
    FILL_BLANK: "穴埋め",
    CODE_READING: "コード読解",
  },
  ar: {
    ALL: "الكل",
    MULTIPLE_CHOICE: "اختيار",
    FILL_BLANK: "فراغ",
    CODE_READING: "قراءة كود",
  },
};

const difficultyLabel: Record<CppQuizLanguage, Record<string, string>> = {
  en: {
    EASY: "Easy",
    MEDIUM: "Medium",
    HARD: "Hard",
  },
  zh: {
    EASY: "基础",
    MEDIUM: "进阶",
    HARD: "挑战",
  },
  ja: {
    EASY: "基礎",
    MEDIUM: "発展",
    HARD: "挑戦",
  },
  ar: {
    EASY: "سهل",
    MEDIUM: "متوسط",
    HARD: "صعب",
  },
};

const pageCopy: Record<CppQuizLanguage, {
  eyebrow: string;
  title: string;
  description: string;
  course: string;
  back: string;
  search: string;
  searchPlaceholder: string;
  allTopics: string;
  topicClassify: string;
  topicHeading: string;
  typeClassify: string;
  tableTitle: string;
  tableMeta: string;
  startSelected: string;
  practiceThis: string;
  preview: string;
  category: string;
  type: string;
  difficulty: string;
  question: string;
  empty: string;
  previous: string;
  next: string;
  practiceTitle: string;
  exitPractice: string;
  activeBank: string;
  page: string;
  current: string;
  drills: string;
}> = {
  en: {
    eyebrow: "C++ Questions",
    title: "C++ Question Search",
    description: "Search first choose a topic and question type then start practice. The bank is classified and keeps expanding. No online compiler is enabled here.",
    course: "Open course path",
    back: "Back to C++ hub",
    search: "Search",
    searchPlaceholder: "Search loop vector pointer class output",
    allTopics: "All topics",
    topicClassify: "Topic categories",
    topicHeading: "Choose a topic then inspect the table",
    typeClassify: "Question types",
    tableTitle: "Question table",
    tableMeta: "Matching questions",
    startSelected: "Practice selected set",
    practiceThis: "Practice this type",
    preview: "Preview",
    category: "Category",
    type: "Type",
    difficulty: "Difficulty",
    question: "Question",
    empty: "No question matched yet. Try a shorter keyword or reset the filters.",
    previous: "Previous",
    next: "Next",
    practiceTitle: "Practice mode",
    exitPractice: "Back to question table",
    activeBank: "Current set",
    page: "Page",
    current: "Current",
    drills: "drills",
  },
  zh: {
    eyebrow: "C++ 题目",
    title: "C++ 题目搜索",
    description: "先搜索 再选知识模块和题型 最后进入练习。题库已经分类并持续扩充，这里不打开在线编译运行。",
    course: "打开课程路径",
    back: "返回 C++ 首页",
    search: "搜索",
    searchPlaceholder: "搜索 循环 vector 指针 class 输出",
    allTopics: "全部模块",
    topicClassify: "知识模块",
    topicHeading: "先选模块 再看题目表",
    typeClassify: "题型分类",
    tableTitle: "题目表",
    tableMeta: "匹配题目",
    startSelected: "练习当前筛选",
    practiceThis: "练这一类",
    preview: "预览",
    category: "模块",
    type: "题型",
    difficulty: "难度",
    question: "题目",
    empty: "还没有匹配题目。换一个更短的关键词，或者重置分类。",
    previous: "上一页",
    next: "下一页",
    practiceTitle: "练习模式",
    exitPractice: "回到题目表",
    activeBank: "当前题组",
    page: "第",
    current: "当前",
    drills: "题",
  },
  ja: {
    eyebrow: "C++ 問題",
    title: "C++ 問題検索",
    description: "検索してからトピックと問題形式を選び 練習を開始します 分類済み問題庫で オンライン実行は使いません",
    course: "コースパスを開く",
    back: "C++ ハブへ戻る",
    search: "検索",
    searchPlaceholder: "loop vector pointer class output を検索",
    allTopics: "すべてのトピック",
    topicClassify: "トピック分類",
    topicHeading: "トピックを選び 問題表を確認",
    typeClassify: "問題形式",
    tableTitle: "問題表",
    tableMeta: "一致した問題",
    startSelected: "現在の条件で練習",
    practiceThis: "この形式を練習",
    preview: "プレビュー",
    category: "カテゴリ",
    type: "形式",
    difficulty: "難度",
    question: "問題",
    empty: "一致する問題がありません 短いキーワードにするかフィルターをリセットしてください",
    previous: "前へ",
    next: "次へ",
    practiceTitle: "練習モード",
    exitPractice: "問題表へ戻る",
    activeBank: "現在のセット",
    page: "ページ",
    current: "現在",
    drills: "問",
  },
  ar: {
    eyebrow: "أسئلة C++",
    title: "بحث أسئلة C++",
    description: "ابحث أولا ثم اختر الموضوع ونوع السؤال وابدأ التدريب البنك مصنف ويتوسع ولا يوجد تشغيل كود هنا",
    course: "افتح مسار الدورة",
    back: "العودة إلى مركز C++",
    search: "بحث",
    searchPlaceholder: "ابحث loop vector pointer class output",
    allTopics: "كل المواضيع",
    topicClassify: "تصنيف المواضيع",
    topicHeading: "اختر موضوعا ثم افحص جدول الأسئلة",
    typeClassify: "أنواع الأسئلة",
    tableTitle: "جدول الأسئلة",
    tableMeta: "أسئلة مطابقة",
    startSelected: "تدرب على المجموعة المحددة",
    practiceThis: "تدرب على هذا النوع",
    preview: "معاينة",
    category: "الفئة",
    type: "النوع",
    difficulty: "الصعوبة",
    question: "السؤال",
    empty: "لا توجد أسئلة مطابقة جرب كلمة أقصر أو أعد ضبط الفلاتر",
    previous: "السابق",
    next: "التالي",
    practiceTitle: "وضع التدريب",
    exitPractice: "العودة إلى جدول الأسئلة",
    activeBank: "المجموعة الحالية",
    page: "صفحة",
    current: "الحالي",
    drills: "تدريبات",
  },
};

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function normalizedType(type: string | undefined): CppQuestionTypeFilter {
  return cppQuestionTypePlan.some((item) => item.slug === type) ? type as CppQuestionTypeFilter : "ALL";
}

function buildHref({
  language,
  category,
  type,
  q,
  page = 1,
  mode,
}: {
  language: InterfaceLanguage;
  category?: string;
  type?: CppQuestionTypeFilter;
  q?: string;
  page?: number;
  mode?: "practice";
}) {
  const params = new URLSearchParams();
  if (category) params.set("category", category);
  if (type && type !== "ALL") params.set("type", type);
  if (q) params.set("q", q);
  if (page > 1) params.set("page", String(page));
  if (mode) params.set("mode", mode);
  const suffix = params.toString();
  return localizedHref(`/cpp/quiz/mega-1000${suffix ? `?${params.toString()}` : ""}`, language);
}

function RowPracticeLink({ copy, language, row }: { copy: (typeof pageCopy)[CppQuizLanguage]; language: InterfaceLanguage; row: CppQuestionIndexRow }) {
  return (
    <Link
      href={buildHref({ language, category: row.categorySlug, type: row.type, mode: "practice" })}
      className="dense-action justify-center"
    >
      {copy.practiceThis}
    </Link>
  );
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
  const language = resolveInterfaceLanguage(query);
  const copyLanguage = cppQuizLanguage(language);
  const copy = pageCopy[copyLanguage];
  const page = Math.max(Number(firstParam(query.page) || 1) || 1, 1);
  const selectedCategory = firstParam(query.category);
  const selectedType = normalizedType(firstParam(query.type));
  const search = (firstParam(query.q) || "").trim().slice(0, 80);
  const mode = firstParam(query.mode);
  const isMega = id === "mega-1000";
  const safeCategory = selectedCategory && getCppCategory(selectedCategory) ? selectedCategory : undefined;

  const table = isMega
    ? searchCppQuestionIndex({ categorySlug: safeCategory, type: selectedType, query: search, page, pageSize: 24 })
    : { rows: [], page: 1, pageSize: 24, totalPages: 1, totalQuestions: 0, type: "ALL" as CppQuestionTypeFilter };

  const practiceCategory = safeCategory || table.rows[0]?.categorySlug || cppQuestionBank.categoryPlan[0].slug;
  const practiceType = selectedType;
  const practicePage = Math.max(1, page);
  const mega = isMega
    ? buildCppFilteredMegaQuestions({ categorySlug: practiceCategory, type: practiceType, page: practicePage, pageSize: 20 })
    : null;
  const questions = mega?.questions || baseQuestions;
  const showPractice = mode === "practice";

  return (
    <main className="apple-page pb-12 pt-4">
      <AppleStudyHeader language={language} />
      <section className="apple-shell py-7">
        <div className="apple-card soft-gradient p-5">
          <p className="eyebrow">{copy.eyebrow}</p>
          <h1 className="mt-3 font-serif text-4xl">{showPractice ? copy.practiceTitle : copy.title}</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[color:var(--muted)]">
            {copy.description}
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Link href={localizedHref("/learn/cpp", language)} className="apple-button-secondary px-4 py-2 text-sm">{copy.course}</Link>
            <Link href={localizedHref("/cpp", language)} className="apple-button-primary px-4 py-2 text-sm">{copy.back}</Link>
            {showPractice && (
              <Link href={buildHref({ language, category: safeCategory, type: selectedType, q: search, page })} className="apple-button-secondary px-4 py-2 text-sm">
                {copy.exitPractice}
              </Link>
            )}
          </div>
        </div>

        {!showPractice && isMega && (
          <>
            <section className="mt-5 grid gap-3 lg:grid-cols-[minmax(0,1fr)_320px]">
              <form action="/cpp/quiz/mega-1000" className="dense-panel p-4">
                {language !== "en" && <input type="hidden" name="lang" value={language} />}
                {safeCategory && <input type="hidden" name="category" value={safeCategory} />}
                {selectedType !== "ALL" && <input type="hidden" name="type" value={selectedType} />}
                <p className="eyebrow">{copy.search}</p>
                <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                  <input
                    name="q"
                    defaultValue={search}
                    className="min-h-11 min-w-0 flex-1 rounded-[8px] border border-slate-200 bg-white px-4 text-sm font-semibold outline-none transition focus:border-slate-500"
                    placeholder={copy.searchPlaceholder}
                  />
                  <button className="dense-action-primary px-5 py-2.5" type="submit">
                    {copy.search}
                  </button>
                </div>
              </form>

              <div className="dense-panel p-4">
                <p className="eyebrow">{copy.preview}</p>
                <h2 className="mt-2 text-xl font-semibold">
                  {copy.tableMeta}
                </h2>
                <Link
                  href={buildHref({ language, category: practiceCategory, type: selectedType, q: search, page: 1, mode: "practice" })}
                  className="mt-4 dense-action-primary justify-center"
                >
                  {copy.startSelected}
                </Link>
              </div>
            </section>

            <div className="mt-5 flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="eyebrow">{copy.topicClassify}</p>
                <h2 className="mt-2 text-xl font-semibold">{copy.topicHeading}</h2>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link
                  href={buildHref({ language, type: selectedType, q: search })}
                  className={!safeCategory ? "apple-button-primary px-4 py-2 text-sm" : "apple-button-secondary px-4 py-2 text-sm"}
                >
                  {copy.allTopics}
                </Link>
                {cppQuestionTypePlan.map((item) => {
                  const active = item.slug === selectedType;
                  return (
                    <Link
                      key={item.slug}
                      href={buildHref({ language, category: safeCategory, type: item.slug, q: search })}
                      className={active ? "apple-button-primary px-4 py-2 text-sm" : "apple-button-secondary px-4 py-2 text-sm"}
                    >
                      {typeLabel[copyLanguage][item.slug]}
                    </Link>
                  );
                })}
              </div>
            </div>

            <section className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              {cppQuestionBank.categoryPlan.map((category) => {
                const counts = getCppCategoryTypeCounts(category.slug);
                const active = category.slug === safeCategory;
                return (
                  <Link
                    key={category.slug}
                    href={buildHref({ language, category: category.slug, type: selectedType, q: search })}
                    className={`apple-card p-4 ${active ? "ring-2 ring-[color:var(--accent)]" : "apple-card-hover"}`}
                  >
                    <p className="eyebrow">{copyLanguage === "zh" ? category.zh : category.title}</p>
                    <h2 className="mt-2 text-xl font-semibold">{copyLanguage === "zh" ? category.zh : category.title}</h2>
                    <p className="mt-2 text-sm text-[color:var(--muted)]">{category.focus.slice(0, 4).join(" / ")}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <span className="dense-status">{typeLabel[copyLanguage].MULTIPLE_CHOICE} {counts.MULTIPLE_CHOICE}</span>
                      <span className="dense-status">{typeLabel[copyLanguage].FILL_BLANK} {counts.FILL_BLANK}</span>
                      <span className="dense-status">{typeLabel[copyLanguage].CODE_READING} {counts.CODE_READING}</span>
                    </div>
                  </Link>
                );
              })}
            </section>

            <section className="mt-6 dense-panel overflow-hidden p-0">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 p-4">
                <div>
                  <p className="eyebrow">{copy.tableTitle}</p>
                  <h2 className="mt-2 text-2xl font-semibold">
                    {copy.tableMeta}
                  </h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Link href={buildHref({ language, category: safeCategory, type: selectedType, q: search, page: Math.max(1, table.page - 1) })} className="dense-action">{copy.previous}</Link>
                  <Link href={buildHref({ language, category: safeCategory, type: selectedType, q: search, page: Math.min(table.totalPages, table.page + 1) })} className="dense-action-primary">{copy.next}</Link>
                </div>
              </div>

              {table.rows.length === 0 ? (
                <div className="p-5">
                  <p className="text-sm leading-6 text-[color:var(--muted)]">{copy.empty}</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[860px] border-collapse text-left text-sm">
                    <thead className="bg-slate-50 text-xs uppercase tracking-normal text-[color:var(--muted)]">
                      <tr>
                        <th className="px-4 py-3">{copy.category}</th>
                        <th className="px-4 py-3">{copy.type}</th>
                        <th className="px-4 py-3">{copy.difficulty}</th>
                        <th className="px-4 py-3">{copy.question}</th>
                        <th className="px-4 py-3"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {table.rows.map((row) => (
                        <tr key={row.id} className="border-t border-slate-100 align-top">
                          <td className="px-4 py-3 font-semibold">{copyLanguage === "zh" ? row.categoryZh : row.categoryTitle}</td>
                          <td className="px-4 py-3">
                            <span className="dense-status">{typeLabel[copyLanguage][row.type]}</span>
                          </td>
                          <td className="px-4 py-3">{difficultyLabel[copyLanguage][row.difficulty]}</td>
                          <td className="px-4 py-3">
                            <p className="font-medium text-slate-900">{row.prompt}</p>
                            {row.codeSnippet && (
                              <pre className="mt-2 max-w-xl overflow-x-auto rounded-[8px] bg-slate-950 p-3 text-xs leading-5 text-slate-100">{row.codeSnippet}</pre>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <RowPracticeLink copy={copy} language={language} row={row} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </>
        )}

        {showPractice && (
          <>
            {isMega && mega && (
              <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-[8px] border border-black/5 bg-white/75 p-4 shadow-sm">
                <div>
                  <p className="eyebrow">{copy.activeBank} · {copyLanguage === "zh" ? mega.category.zh : mega.category.title} · {typeLabel[copyLanguage][mega.type]}</p>
                  <p className="mt-1 text-lg font-semibold">
                    {copy.page} {mega.page} / {mega.totalPages} · {copy.current} {questions.length} {copy.drills}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Link href={buildHref({ language, category: practiceCategory, type: practiceType, page: Math.max(1, mega.page - 1), mode: "practice" })} className="apple-button-secondary px-4 py-2 text-sm">{copy.previous}</Link>
                  <Link href={buildHref({ language, category: practiceCategory, type: practiceType, page: Math.min(mega.totalPages, mega.page + 1), mode: "practice" })} className="apple-button-primary px-4 py-2 text-sm">{copy.next}</Link>
                </div>
              </div>
            )}

            <div className="mt-6">
              <QuizBlock lessonId={`fallback-cpp-quiz-${id}-${mega?.category.slug || "base"}-${mega?.type || "ALL"}-page-${mega?.page || 1}`} questions={questions} language={language} />
            </div>
          </>
        )}
      </section>
    </main>
  );
}
