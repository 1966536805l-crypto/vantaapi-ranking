import Link from "next/link";
import { notFound } from "next/navigation";
import { AppleStudyHeader } from "@/components/learning/ModuleHub";
import VocabularyTrainer from "@/components/learning/VocabularyTrainer";
import { requireChineseForEnglishLearning } from "@/lib/english-content-access";
import { examVocabularyPacks, getVocabularyPack, keySentenceFrames } from "@/lib/exam-content";
import { getExpandedVocabularyWords } from "@/lib/expanded-vocabulary-bank";
import {
  getFrameLabel,
  getFrameUsage,
  getPackDisplayTitle,
  getPackFocus,
  getReadingLogicWords,
  getWordMeaning,
  getWordNote,
  vocabularyPackCopy,
} from "@/lib/exam-i18n";
import { bilingualLanguage, localizedHref, resolveInterfaceLanguage, type PageSearchParams } from "@/lib/language";

export function generateStaticParams() {
  return examVocabularyPacks.map((pack) => ({ pack: pack.slug }));
}

export default async function VocabularyPackPage({
  params,
  searchParams,
}: {
  params: Promise<{ pack: string }>;
  searchParams?: Promise<PageSearchParams>;
}) {
  const { pack: slug } = await params;
  const language = resolveInterfaceLanguage(searchParams ? await searchParams : undefined);
  requireChineseForEnglishLearning(language);
  const copyLanguage = bilingualLanguage(language);
  const copy = vocabularyPackCopy[copyLanguage];
  const pack = getVocabularyPack(slug);
  if (!pack) notFound();
  const expandedWords = getExpandedVocabularyWords(pack);
  const previewWords = expandedWords.slice(0, 40);

  return (
    <main className="apple-page pb-12 pt-4">
      <AppleStudyHeader language={language} />
      <section className="study-fullscreen-shell py-4">
        <Link href={localizedHref("/english/vocabulary", language)} className="link text-sm">{copy.back}</Link>

        <div className="module-hero learning-compact-hero mt-3 px-5 py-5">
          <p className="eyebrow">{pack.level}</p>
          <h1 className="apple-display-title mt-3 max-w-4xl text-3xl sm:text-4xl">{getPackDisplayTitle(pack, copyLanguage)}</h1>
          <p className="apple-display-subtitle mt-3 max-w-3xl text-sm text-[color:var(--muted)]">
            {copy.subtitle}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {getPackFocus(pack, copyLanguage).map((item) => (
              <span key={item} className="dense-status">{item}</span>
            ))}
          </div>
        </div>

        <VocabularyTrainer
          packSlug={pack.slug}
          words={pack.priorityWords}
          language={copyLanguage}
          packMeta={{
            slug: pack.slug,
            title: pack.title,
            shortTitle: pack.shortTitle,
            targetCount: pack.targetCount,
            level: pack.level,
          }}
        />

        <section className="mt-5 grid gap-3 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="dense-panel p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="eyebrow">{copy.wordsEyebrow}</p>
                <h2 className="mt-2 text-2xl font-semibold">{copy.wordsTitle}</h2>
              </div>
                <span className="dense-status">{expandedWords.length.toLocaleString("zh-CN")} 词 · 预览 {previewWords.length}</span>
            </div>
            <div className="mt-4 grid gap-2 md:grid-cols-2">
              {previewWords.map((item) => (
                <article key={item.word} className="dense-card p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-semibold">{item.word}</h3>
                    </div>
                    <span className="dense-status">{item.collocation}</span>
                  </div>
                  <details className="word-reveal-details mt-3">
                    <summary>{copyLanguage === "zh" ? "查看释义音标例句" : "Show details"}</summary>
                    <div className="mt-3 grid gap-2">
                      {item.phonetic ? <p className="text-xs text-[color:var(--muted)]">{item.phonetic}</p> : null}
                      <p className="text-sm font-medium">{getWordMeaning(item, copyLanguage)}</p>
                      <p className="text-sm leading-6">{item.sentence}</p>
                      <p className="rounded-[8px] bg-black/5 px-3 py-2 text-xs leading-5 text-[color:var(--muted)]">
                        {getWordNote(item, copyLanguage)}
                      </p>
                    </div>
                  </details>
                </article>
              ))}
            </div>
            {expandedWords.length > previewWords.length ? (
              <p className="mt-4 rounded-[8px] bg-black/5 px-3 py-2 text-sm text-[color:var(--muted)]">
                当前页展示前 {previewWords.length} 个词，顶部训练器和单词跟打使用完整 {expandedWords.length.toLocaleString("zh-CN")} 词库。
              </p>
            ) : null}
          </div>

          <aside className="dense-panel p-4 sm:p-5">
            <p className="eyebrow">{copy.sentenceEyebrow}</p>
            <h2 className="mt-2 text-2xl font-semibold">{copy.sentenceTitle}</h2>
            <div className="mt-4 grid gap-2">
              {keySentenceFrames.map((frame) => (
                <div key={frame.sentence} className="dense-card p-3 text-sm leading-6">
                  <p className="font-medium">{getFrameLabel(frame, copyLanguage)}</p>
                  <p className="mt-1">{frame.sentence}</p>
                  <p className="mt-1 text-xs text-[color:var(--muted)]">{getFrameUsage(frame, copyLanguage)}</p>
                </div>
              ))}
            </div>

            <div className="mt-5">
              <p className="eyebrow">{copyLanguage === "zh" ? "逻辑词" : "Logic Words"}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {getReadingLogicWords(copyLanguage).map((word) => <span key={word} className="dense-status">{word}</span>)}
              </div>
            </div>
          </aside>
        </section>
      </section>
    </main>
  );
}
