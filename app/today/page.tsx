import type { Metadata } from "next";
import TodayStudyPlan from "@/components/home/TodayStudyPlan";
import { AppleStudyHeader } from "@/components/learning/ModuleHub";
import { examVocabularyPacks } from "@/lib/exam-content";
import { originalQuestionPacks, originalReadingPacks } from "@/lib/original-english-bank";

export const metadata: Metadata = {
  title: "Today Learning Plan - JinMing Lab",
  description:
    "Daily English and C++ review queue for lessons vocabulary typing reading questions streaks and progress.",
  alternates: {
    canonical: "/today",
  },
  openGraph: {
    title: "Today Learning Plan - JinMing Lab",
    description:
      "Open one page to see today's vocabulary review typing drill reading task and question bank.",
    url: "https://vantaapi.com/today",
    siteName: "JinMing Lab",
    type: "website",
  },
};

export default function TodayPage() {
  const packs = examVocabularyPacks.map((pack) => ({
    slug: pack.slug,
    shortTitle: pack.shortTitle,
    level: pack.level,
    route: pack.route,
    words: pack.priorityWords.map((word) => ({
      word: word.word,
      meaningZh: word.meaningZh,
      collocation: word.collocation,
    })),
  }));

  return (
    <main className="apple-page pb-12 pt-4">
      <AppleStudyHeader language="zh" />
      <TodayStudyPlan
        packs={packs}
        readingPacks={originalReadingPacks}
        questionPacks={originalQuestionPacks.map((pack) => ({
          slug: pack.slug,
          zhTitle: pack.zhTitle,
          level: pack.level,
        }))}
      />
    </main>
  );
}
