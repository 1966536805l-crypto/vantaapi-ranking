import type { Metadata } from "next";
import EnglishTypingTrainer, { type EnglishTypingItem } from "@/components/learning/EnglishTypingTrainer";
import { requireChineseForEnglishLearning } from "@/lib/english-content-access";
import { examVocabularyPacks } from "@/lib/exam-content";
import { resolveInterfaceLanguage, type PageSearchParams } from "@/lib/language";

export const metadata: Metadata = {
  title: "English Typing System - JinMing Lab",
  description:
    "Real-time spell-to-pass English typing practice with instant feedback. Words and sentences with JinMing Lab Memory Voice, local progress, no login required.",
  alternates: {
    canonical: "/english/typing",
  },
  openGraph: {
    title: "English Typing System - JinMing Lab",
    description:
      "Spell-to-pass English typing practice with real-time feedback, words and sentences, local progress, no login required.",
    url: "https://vantaapi.com/english/typing",
    siteName: "JinMing Lab",
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
  const language = resolveInterfaceLanguage(searchParams ? await searchParams : undefined);
  requireChineseForEnglishLearning(language);
  const items = buildTypingItems();

  return (
    <main className="typing-fullscreen-page">
      <section className="study-fullscreen-shell">
        <EnglishTypingTrainer items={items} />
      </section>
    </main>
  );
}
