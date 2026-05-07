import Link from "next/link";
import { notFound } from "next/navigation";
import { AppleStudyHeader } from "@/components/learning/ModuleHub";
import VocabularyTrainer from "@/components/learning/VocabularyTrainer";
import { requireChineseForEnglishLearning } from "@/lib/english-content-access";
import { examVocabularyPacks, getVocabularyPack, keySentenceFrames } from "@/lib/exam-content";
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
import { localizedHref, resolveLanguage, type PageSearchParams } from "@/lib/language";

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
  const language = resolveLanguage(searchParams ? await searchParams : undefined);
  requireChineseForEnglishLearning(language);
  const copy = vocabularyPackCopy[language];
  const pack = getVocabularyPack(slug);
  if (!pack) notFound();

  return (
    <main className="apple-page pb-12 pt-4">
      <AppleStudyHeader language={language} />
      <section className="study-fullscreen-shell py-4">
        <Link href={localizedHref("/english/vocabulary", language)} className="link text-sm">{copy.back}</Link>

        <div className="module-hero learning-compact-hero mt-3 px-5 py-5">
          <p className="eyebrow">{pack.level}</p>
          <h1 className="apple-display-title mt-3 max-w-4xl text-3xl sm:text-4xl">{getPackDisplayTitle(pack, language)}</h1>
          <p className="apple-display-subtitle mt-3 max-w-3xl text-sm text-[color:var(--muted)]">
            {pack.targetCount} {copy.subtitle}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {getPackFocus(pack, language).map((item) => (
              <span key={item} className="dense-status">{item}</span>
            ))}
          </div>
        </div>

        <VocabularyTrainer packSlug={pack.slug} words={pack.priorityWords} language={language} />

        <section className="mt-5 grid gap-3 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="dense-panel p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="eyebrow">{copy.wordsEyebrow}</p>
                <h2 className="mt-2 text-2xl font-semibold">{copy.wordsTitle}</h2>
              </div>
              <span className="text-3xl font-semibold">{pack.targetCount}</span>
            </div>
            <div className="mt-4 grid gap-2 md:grid-cols-2">
              {pack.priorityWords.map((item) => (
                <article key={item.word} className="dense-card p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-semibold">{item.word}</h3>
                    </div>
                    <span className="dense-status">{item.collocation}</span>
                  </div>
                  <details className="word-reveal-details mt-3">
                    <summary>{language === "zh" ? "查看释义音标例句" : "Show details"}</summary>
                    <div className="mt-3 grid gap-2">
                      {item.phonetic ? <p className="text-xs text-[color:var(--muted)]">{item.phonetic}</p> : null}
                      <p className="text-sm font-medium">{getWordMeaning(item, language)}</p>
                      <p className="text-sm leading-6">{item.sentence}</p>
                      <p className="rounded-[8px] bg-black/5 px-3 py-2 text-xs leading-5 text-[color:var(--muted)]">
                        {getWordNote(item, language)}
                      </p>
                    </div>
                  </details>
                </article>
              ))}
            </div>
          </div>

          <aside className="dense-panel p-4 sm:p-5">
            <p className="eyebrow">{copy.sentenceEyebrow}</p>
            <h2 className="mt-2 text-2xl font-semibold">{copy.sentenceTitle}</h2>
            <div className="mt-4 grid gap-2">
              {keySentenceFrames.map((frame) => (
                <div key={frame.sentence} className="dense-card p-3 text-sm leading-6">
                  <p className="font-medium">{getFrameLabel(frame, language)}</p>
                  <p className="mt-1">{frame.sentence}</p>
                  <p className="mt-1 text-xs text-[color:var(--muted)]">{getFrameUsage(frame, language)}</p>
                </div>
              ))}
            </div>

            <div className="mt-5">
              <p className="eyebrow">{language === "zh" ? "逻辑词" : "Logic Words"}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {getReadingLogicWords(language).map((word) => <span key={word} className="dense-status">{word}</span>)}
              </div>
            </div>
          </aside>
        </section>
      </section>
    </main>
  );
}
