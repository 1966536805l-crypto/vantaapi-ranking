import Link from "next/link";
import { notFound } from "next/navigation";
import { AppleStudyHeader } from "@/components/learning/ModuleHub";
import QuizBlock from "@/components/learning/QuizBlock";
import { requireChineseForEnglishLearning } from "@/lib/english-content-access";
import { buildOriginalQuestions, getOriginalQuestionPack, getQuestionPackTotal, originalQuestionPacks } from "@/lib/original-english-bank";
import { localizedHref, resolveLanguage, type PageSearchParams } from "@/lib/language";

const PAGE_SIZE = 20;

export function generateStaticParams() {
  return originalQuestionPacks.map((pack) => ({ pack: pack.slug }));
}

function toPage(value: string | string[] | undefined) {
  const raw = Array.isArray(value) ? value[0] : value;
  const page = Number(raw || "1");
  return Number.isFinite(page) ? Math.max(1, Math.floor(page)) : 1;
}

export default async function OriginalQuestionPackPage({
  params,
  searchParams,
}: {
  params: Promise<{ pack: string }>;
  searchParams?: Promise<PageSearchParams>;
}) {
  const { pack: slug } = await params;
  const query = searchParams ? await searchParams : undefined;
  const language = resolveLanguage(query);
  requireChineseForEnglishLearning(language);
  const pack = getOriginalQuestionPack(slug);
  if (!pack) notFound();

  const total = getQuestionPackTotal(pack);
  const maxPage = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const page = Math.min(toPage(query?.page), maxPage);
  const questions = buildOriginalQuestions(slug, page, PAGE_SIZE);
  const prev = Math.max(1, page - 1);
  const next = Math.min(maxPage, page + 1);

  return (
    <main className="apple-page pb-12 pt-4">
      <AppleStudyHeader language={language} />
      <section className="apple-shell py-7">
        <Link href={localizedHref("/english/question-bank", language)} className="link text-sm">
          {language === "zh" ? "返回原创题库" : "Back to question bank"}
        </Link>
        <div className="module-hero mt-3 px-5 py-6">
          <p className="eyebrow">{pack.level} · Page {page}/{maxPage}</p>
          <h1 className="apple-display-title mt-3 max-w-4xl text-4xl">{language === "zh" ? pack.zhTitle : pack.title}</h1>
          <p className="apple-display-subtitle mt-3 max-w-3xl text-sm text-[color:var(--muted)]">
            {language === "zh" ? `${pack.descriptionZh} 当前每页 ${PAGE_SIZE} 题，支持即时判分。独立原创模拟，不收录官方试卷内容。` : `Page ${page} of original local practice with instant checking. Independent practice not sourced from official papers.`}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="dense-status">{language === "zh" ? "选择题" : "choice"}</span>
            <span className="dense-status">{language === "zh" ? "填空题" : "fill blank"}</span>
            <span className="dense-status">{language === "zh" ? "持续扩充" : "expanding"}</span>
          </div>
        </div>

        <div className="mt-5">
          <QuizBlock lessonId={`fallback-original-${pack.slug}`} questions={questions} language={language} strictChoiceTimer />
        </div>

        <div className="mt-5 flex flex-wrap justify-between gap-3">
          <Link href={localizedHref(`/english/question-bank/${pack.slug}?page=${prev}`, language)} className="dense-action-secondary">上一页</Link>
          <Link href={localizedHref(`/english/question-bank/${pack.slug}?page=${next}`, language)} className="dense-action-primary">下一页</Link>
        </div>
      </section>
    </main>
  );
}
