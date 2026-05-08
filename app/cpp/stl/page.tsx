import { ModuleDetail } from "@/components/learning/ModuleHub";
import { cppDetailCopy } from "@/lib/cpp-detail-copy";
import { resolveInterfaceLanguage, type PageSearchParams } from "@/lib/language";

export default async function Page({ searchParams }: { searchParams?: Promise<PageSearchParams> }) {
  const language = resolveInterfaceLanguage(searchParams ? await searchParams : undefined);
  const pageCopy = cppDetailCopy.stl[language];

  return <ModuleDetail {...pageCopy} practiceHref="/cpp/quiz/stl" language={language} />;
}
