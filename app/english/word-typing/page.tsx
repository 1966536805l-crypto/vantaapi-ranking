import type { Metadata } from "next";
import WordTypingTrainer from "@/components/learning/WordTypingTrainer";
import { requireChineseForEnglishLearning } from "@/lib/english-content-access";
import { examVocabularyPacks } from "@/lib/exam-content";
import { resolveInterfaceLanguage, type PageSearchParams } from "@/lib/language";

export const metadata: Metadata = {
  title: "单词跟打训练 - JinMing Lab",
  description:
    "专注的单词跟打练习，实时反馈，音频发音，提升英语单词拼写速度和准确度。",
  alternates: {
    canonical: "/english/word-typing",
  },
  openGraph: {
    title: "单词跟打训练 - JinMing Lab",
    description:
      "专注的单词跟打练习，实时反馈，音频发音，提升英语单词拼写速度和准确度。",
    url: "https://vantaapi.com/english/word-typing",
    siteName: "JinMing Lab",
    type: "website",
  },
};

export default async function WordTypingPage({
  searchParams,
}: {
  searchParams?: Promise<PageSearchParams>;
}) {
  const language = resolveInterfaceLanguage(searchParams ? await searchParams : undefined);
  requireChineseForEnglishLearning(language);

  // Get all words from all packs
  const allWords = examVocabularyPacks.flatMap((pack) =>
    pack.priorityWords.map((word) => ({
      ...word,
      source: pack.shortTitle,
      level: pack.level,
    }))
  );

  return (
    <main className="word-typing-page">
      <WordTypingTrainer words={allWords} language={language} />
    </main>
  );
}
