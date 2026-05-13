import type { Metadata } from "next";
import { AppleStudyHeader } from "@/components/learning/ModuleHub";
import MemoryWordSystem from "@/components/learning/MemoryWordSystem";
import { requireChineseForEnglishLearning } from "@/lib/english-content-access";
import { examVocabularyPacks } from "@/lib/exam-content";
import { getExpandedVocabularyWords } from "@/lib/expanded-vocabulary-bank";
import { bilingualLanguage, resolveInterfaceLanguage, type PageSearchParams } from "@/lib/language";

export const metadata: Metadata = {
  title: "背单词系统 - JinMing Lab",
  description: "艾宾浩斯遗忘曲线背单词系统，支持 Q 认识、0 不认识、发音、拼写和本机进度保存。",
  alternates: {
    canonical: "/english/memory",
  },
  openGraph: {
    title: "背单词系统 - JinMing Lab",
    description: "选择考试词库，用艾宾浩斯遗忘曲线安排复习。",
    url: "https://vantaapi.com/english/memory",
    siteName: "JinMing Lab",
    type: "website",
  },
};

export default async function EnglishMemoryPage({ searchParams }: { searchParams?: Promise<PageSearchParams> }) {
  const language = resolveInterfaceLanguage(searchParams ? await searchParams : undefined);
  requireChineseForEnglishLearning(language);
  const copyLanguage = bilingualLanguage(language);
  const packs = examVocabularyPacks.map((pack) => ({
    slug: pack.slug,
    title: pack.title,
    shortTitle: pack.shortTitle,
    targetCount: pack.priorityWords.length,
    level: pack.level,
    words: getExpandedVocabularyWords(pack),
  }));

  return (
    <main className="apple-page memory-fullscreen-page pb-12 pt-4">
      <AppleStudyHeader language={language} />
      <section className="apple-shell py-7">
        <MemoryWordSystem packs={packs} language={copyLanguage} />
      </section>
    </main>
  );
}
