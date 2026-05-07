import type { Metadata } from "next";
import { AppleStudyHeader } from "@/components/learning/ModuleHub";
import EnglishTypingTrainer, { type EnglishTypingItem } from "@/components/learning/EnglishTypingTrainer";
import { requireChineseForEnglishLearning } from "@/lib/english-content-access";
import { examVocabularyPacks } from "@/lib/exam-content";
import { resolveLanguage, type PageSearchParams } from "@/lib/language";

export const metadata: Metadata = {
  title: "English Typing System - VantaAPI",
  description:
    "Real-time spell-to-pass English typing practice with instant feedback. Words and sentences with VantaAPI Memory Voice, local progress, no login required.",
  alternates: {
    canonical: "/english/typing",
  },
  openGraph: {
    title: "English Typing System - VantaAPI",
    description:
      "Spell-to-pass English typing practice with real-time feedback, words and sentences, local progress, no login required.",
    url: "https://vantaapi.com/english/typing",
    siteName: "VantaAPI",
    type: "website",
  },
};

function buildTypingItems(): EnglishTypingItem[] {
  return examVocabularyPacks.flatMap((pack) =>
    pack.priorityWords.slice(0, 16).flatMap((word) => [
      {
        id: `${pack.slug}-${word.word}-word`,
        type: "word" as const,
        source: pack.shortTitle,
        answer: word.word,
        meaningZh: word.meaningZh,
        noteZh: `${word.collocation}  ${word.examNote}`,
      },
      {
        id: `${pack.slug}-${word.word}-sentence`,
        type: "sentence" as const,
        source: pack.shortTitle,
        answer: word.sentence,
        meaningZh: word.meaningZh,
        noteZh: word.examNote,
      },
    ]),
  );
}

export default async function EnglishTypingPage({
  searchParams,
}: {
  searchParams?: Promise<PageSearchParams>;
}) {
  const language = resolveLanguage(searchParams ? await searchParams : undefined);
  requireChineseForEnglishLearning(language);
  const items = buildTypingItems();

  return (
    <main className="apple-page pb-12 pt-4">
      <AppleStudyHeader language={language} />
      <section className="study-fullscreen-shell py-4">
        <div className="module-hero learning-compact-hero typing-page-hero px-5 py-3">
          <p className="eyebrow">英文拼写训练系统</p>
          <h1 className="apple-display-title mt-1 max-w-4xl text-3xl sm:text-4xl">English Typing System</h1>
        </div>

        <EnglishTypingTrainer items={items} />
      </section>
    </main>
  );
}
