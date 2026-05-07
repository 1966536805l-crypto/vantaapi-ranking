import Link from "next/link";
import { AppleStudyHeader } from "@/components/learning/ModuleHub";
import { requireChineseForEnglishLearning } from "@/lib/english-content-access";
import { originalContentSummary, originalReadingPacks } from "@/lib/original-english-bank";
import { localizedHref, resolveLanguage, type PageSearchParams } from "@/lib/language";

export default async function Page({ searchParams }: { searchParams?: Promise<PageSearchParams> }) {
  const language = resolveLanguage(searchParams ? await searchParams : undefined);
  requireChineseForEnglishLearning(language);

  return (
    <main className="apple-page pb-12 pt-4">
      <AppleStudyHeader language={language} />
      <section className="apple-shell py-7">
        <div className="module-hero px-5 py-6">
          <p className="eyebrow">Original English Reading</p>
          <h1 className="apple-display-title mt-3 max-w-4xl text-4xl">
            {language === "zh" ? "原创英语文章库" : "Original English Article Library"}
          </h1>
          <p className="apple-display-subtitle mt-3 max-w-3xl text-sm text-[color:var(--muted)]">
            {language === "zh"
              ? `初一到高三每个年级 300 章，雅思 1000 篇，托福 1000 篇。当前规划共 ${originalContentSummary.readingArticles} 篇，全部由站内原创生成，不搬运外部文章，不收录官方试卷内容。`
              : `${originalContentSummary.readingArticles} internally generated original passages across grades IELTS and TOEFL. Independent practice not affiliated with exam providers and not sourced from official papers.`}
          </p>
        </div>

        <section className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {originalReadingPacks.map((pack) => (
            <Link key={pack.slug} href={localizedHref(`/english/reading/${pack.slug}`, language)} className="dense-card p-4">
              <p className="eyebrow">{pack.level}</p>
              <h2 className="mt-2 text-xl font-semibold">{language === "zh" ? pack.zhTitle : pack.title}</h2>
              <p className="mt-3 text-sm leading-6 text-[color:var(--muted)]">
                {language === "zh" ? "分级原创短文 主旨 逻辑词 词汇任务 写作输出" : "Original passages with main idea logic vocabulary and writing tasks"}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="dense-status">{pack.targetArticles} chapters</span>
                <span className="dense-status">original</span>
                <span className="dense-status">exam-ready</span>
              </div>
            </Link>
          ))}
        </section>
      </section>
    </main>
  );
}
