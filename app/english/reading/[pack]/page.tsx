import Link from "next/link";
import { notFound } from "next/navigation";
import { AppleStudyHeader } from "@/components/learning/ModuleHub";
import { requireChineseForEnglishLearning } from "@/lib/english-content-access";
import { buildOriginalArticle, getOriginalReadingPack, originalReadingPacks } from "@/lib/original-english-bank";
import { localizedHref, resolveLanguage, type PageSearchParams } from "@/lib/language";

export function generateStaticParams() {
  return originalReadingPacks.map((pack) => ({ pack: pack.slug }));
}

function toPage(value: string | string[] | undefined) {
  const raw = Array.isArray(value) ? value[0] : value;
  const page = Number(raw || "1");
  return Number.isFinite(page) ? Math.max(1, Math.floor(page)) : 1;
}

export default async function ReadingPackPage({
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
  const pack = getOriginalReadingPack(slug);
  if (!pack) notFound();
  const chapter = Math.min(toPage(query?.page), pack.targetArticles);
  const article = buildOriginalArticle(slug, chapter);
  if (!article) notFound();

  const prev = Math.max(1, chapter - 1);
  const next = Math.min(pack.targetArticles, chapter + 1);

  return (
    <main className="apple-page pb-12 pt-4">
      <AppleStudyHeader language={language} />
      <section className="apple-shell py-7">
        <Link href={localizedHref("/english/reading", language)} className="link text-sm">
          {language === "zh" ? "返回原创文章库" : "Back to article library"}
        </Link>
        <div className="module-hero mt-3 px-5 py-6">
          <p className="eyebrow">{article.level} · Chapter {article.chapter}</p>
          <h1 className="apple-display-title mt-3 max-w-4xl text-4xl">{language === "zh" ? article.subtitleZh : article.title}</h1>
          <p className="apple-display-subtitle mt-3 max-w-3xl text-sm text-[color:var(--muted)]">
            {language === "zh" ? `目标词数 ${article.wordTarget}。原创文章，训练阅读主旨、逻辑关系、词汇输出。不收录官方试卷内容。` : `Target ${article.wordTarget} words. Original passage for main idea logic and vocabulary output. Independent practice not sourced from official papers.`}
          </p>
        </div>

        <article className="dense-panel mt-5 p-5">
          <div className="space-y-4 text-sm leading-7 text-slate-800">
            {article.passage.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          </div>
        </article>

        <section className="mt-5 grid gap-3 lg:grid-cols-2">
          <div className="dense-panel p-5">
            <p className="eyebrow">Vocabulary</p>
            <h2 className="mt-2 text-xl font-semibold">{language === "zh" ? "本章词汇" : "Chapter Vocabulary"}</h2>
            <div className="mt-3 grid gap-2">
              {article.vocabulary.map((item) => (
                <div key={item.word} className="dense-card p-3 text-sm leading-6">
                  <p className="font-semibold">{item.word} · {item.zh}</p>
                  <p className="mt-1 text-[color:var(--muted)]">{item.sentence}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="dense-panel p-5">
            <p className="eyebrow">Tasks</p>
            <h2 className="mt-2 text-xl font-semibold">{language === "zh" ? "读后任务" : "After-reading Tasks"}</h2>
            <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-6 text-[color:var(--muted)]">
              {article.tasks.map((task) => <li key={task}>{task}</li>)}
            </ol>
          </div>
        </section>

        <div className="mt-5 flex flex-wrap justify-between gap-3">
          <Link href={localizedHref(`/english/reading/${pack.slug}?page=${prev}`, language)} className="dense-action-secondary">上一章</Link>
          <Link href={localizedHref(`/english/reading/${pack.slug}?page=${next}`, language)} className="dense-action-primary">下一章</Link>
        </div>
      </section>
    </main>
  );
}
