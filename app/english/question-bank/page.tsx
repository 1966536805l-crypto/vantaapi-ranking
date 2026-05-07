import Link from "next/link";
import { AppleStudyHeader } from "@/components/learning/ModuleHub";
import { requireChineseForEnglishLearning } from "@/lib/english-content-access";
import { originalQuestionPacks } from "@/lib/original-english-bank";
import { localizedHref, resolveLanguage, type PageSearchParams } from "@/lib/language";

export default async function QuestionBankPage({ searchParams }: { searchParams?: Promise<PageSearchParams> }) {
  const language = resolveLanguage(searchParams ? await searchParams : undefined);
  requireChineseForEnglishLearning(language);

  return (
    <main className="apple-page pb-12 pt-4">
      <AppleStudyHeader language={language} />
      <section className="apple-shell py-7">
        <div className="module-hero px-5 py-6">
          <p className="eyebrow">Original Question Bank</p>
          <h1 className="apple-display-title mt-3 max-w-4xl text-4xl">{language === "zh" ? "原创英语选择填空题库" : "Original English Question Bank"}</h1>
          <p className="apple-display-subtitle mt-3 max-w-3xl text-sm text-[color:var(--muted)]">
            {language === "zh"
              ? "雅思 托福和初高中方向原创选择题 填空题持续扩充。题目由站内规则原创生成，不收录官方试卷内容。"
              : "Original multiple-choice and fill-blank practice for IELTS TOEFL and grade levels. Independent practice not affiliated with exam providers and not sourced from official papers."}
          </p>
        </div>

        <section className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {originalQuestionPacks.map((pack) => (
            <Link key={pack.slug} href={localizedHref(`/english/question-bank/${pack.slug}`, language)} className="dense-card p-4">
              <p className="eyebrow">{pack.level}</p>
              <h2 className="mt-2 text-xl font-semibold">{language === "zh" ? pack.zhTitle : pack.title}</h2>
              <p className="mt-3 text-sm leading-6 text-[color:var(--muted)]">{language === "zh" ? pack.descriptionZh : "Original exam-style multiple choice and fill blank questions"}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="dense-status">{language === "zh" ? "选择题" : "choice"}</span>
                <span className="dense-status">{language === "zh" ? "填空题" : "fill blank"}</span>
                <span className="dense-status">{language === "zh" ? "持续扩充" : "expanding"}</span>
              </div>
            </Link>
          ))}
        </section>
      </section>
    </main>
  );
}
