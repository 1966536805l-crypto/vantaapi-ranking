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
import {
  cleanCppQuestionText,
  cppQuizDifficultyLabel,
  cppQuizPageCopy,
  cppQuizTypeLabel,
  getCppCategoryFocus,
  getCppCategoryTitle,
  type CppQuizPageCopy,
} from "@/lib/cpp-quiz-i18n";
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

function RowPracticeLink({ copy, language, row }: { copy: CppQuizPageCopy; language: InterfaceLanguage; row: CppQuestionIndexRow }) {
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
  const copy = cppQuizPageCopy[language];
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
  const localizedQuestions = questions.map((question) => ({
    ...question,
    prompt: cleanCppQuestionText(question.prompt, language),
    explanation: question.explanation ? cleanCppQuestionText(question.explanation, language) : question.explanation,
  }));
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
                      {cppQuizTypeLabel[language][item.slug]}
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
                    <p className="eyebrow">{getCppCategoryTitle(language, category.slug, category.title)}</p>
                    <h2 className="mt-2 text-xl font-semibold">{getCppCategoryTitle(language, category.slug, category.title)}</h2>
                    <p className="mt-2 text-sm text-[color:var(--muted)]">{getCppCategoryFocus(language, category.slug, category.focus).slice(0, 4).join(" / ")}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <span className="dense-status">{cppQuizTypeLabel[language].MULTIPLE_CHOICE} {counts.MULTIPLE_CHOICE}</span>
                      <span className="dense-status">{cppQuizTypeLabel[language].FILL_BLANK} {counts.FILL_BLANK}</span>
                      <span className="dense-status">{cppQuizTypeLabel[language].CODE_READING} {counts.CODE_READING}</span>
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
                          <td className="px-4 py-3 font-semibold">{getCppCategoryTitle(language, row.categorySlug, row.categoryTitle)}</td>
                          <td className="px-4 py-3">
                            <span className="dense-status">{cppQuizTypeLabel[language][row.type]}</span>
                          </td>
                          <td className="px-4 py-3">{cppQuizDifficultyLabel[language][row.difficulty]}</td>
                          <td className="px-4 py-3">
                            <p className="font-medium text-slate-900">{cleanCppQuestionText(row.prompt, language)}</p>
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
                  <p className="eyebrow">{copy.activeBank} · {getCppCategoryTitle(language, mega.category.slug, mega.category.title)} · {cppQuizTypeLabel[language][mega.type]}</p>
                  <p className="mt-1 text-lg font-semibold">
                    {copy.page} {mega.page} / {mega.totalPages} · {copy.current} {localizedQuestions.length} {copy.drills}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Link href={buildHref({ language, category: practiceCategory, type: practiceType, page: Math.max(1, mega.page - 1), mode: "practice" })} className="apple-button-secondary px-4 py-2 text-sm">{copy.previous}</Link>
                  <Link href={buildHref({ language, category: practiceCategory, type: practiceType, page: Math.min(mega.totalPages, mega.page + 1), mode: "practice" })} className="apple-button-primary px-4 py-2 text-sm">{copy.next}</Link>
                </div>
              </div>
            )}

            <div className="mt-6">
              <QuizBlock lessonId={`fallback-cpp-quiz-${id}-${mega?.category.slug || "base"}-${mega?.type || "ALL"}-page-${mega?.page || 1}`} questions={localizedQuestions} language={language} />
            </div>
          </>
        )}
      </section>
    </main>
  );
}
