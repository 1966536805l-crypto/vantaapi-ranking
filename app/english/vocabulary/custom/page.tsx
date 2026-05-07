import Link from "next/link";
import { AppleStudyHeader } from "@/components/learning/ModuleHub";
import CustomWordbook from "@/components/learning/CustomWordbook";
import { requireChineseForEnglishLearning } from "@/lib/english-content-access";
import { localizedHref, resolveLanguage, type PageSearchParams } from "@/lib/language";

export default async function CustomVocabularyPage({
  searchParams,
}: {
  searchParams?: Promise<PageSearchParams>;
}) {
  const language = resolveLanguage(searchParams ? await searchParams : undefined);
  requireChineseForEnglishLearning(language);

  return (
    <main className="apple-page pb-16 pt-4">
      <AppleStudyHeader language={language} />
      <section className="apple-shell py-10">
        <Link href={localizedHref("/english/vocabulary", language)} className="link text-sm">
          {language === "zh" ? "返回词汇中心" : "Back to vocabulary hub"}
        </Link>
        <CustomWordbook language={language} />
      </section>
    </main>
  );
}
