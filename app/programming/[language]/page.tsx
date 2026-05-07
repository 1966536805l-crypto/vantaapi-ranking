import { notFound } from "next/navigation";
import ProgrammingTrainer from "@/components/learning/ProgrammingTrainer";
import { resolveLanguage, type PageSearchParams } from "@/lib/language";
import { getProgrammingLanguage, programmingLanguages } from "@/lib/programming-content";

type ProgrammingLanguagePageProps = {
  params: Promise<{ language: string }>;
  searchParams?: Promise<PageSearchParams>;
};

export function generateStaticParams() {
  return programmingLanguages.map((language) => ({ language: language.slug }));
}

export async function generateMetadata({ params }: ProgrammingLanguagePageProps) {
  const { language } = await params;
  const current = programmingLanguages.find((item) => item.slug === language);
  if (!current) {
    return {
      title: "Code Practice - JinMing Lab",
    };
  }
  return {
    title: `${current.title} Coding Practice - JinMing Lab`,
    description: `${current.title} tutorials original exercises runnable examples hints answers and keyboard shortcuts`,
  };
}

export default async function ProgrammingLanguagePage({ params, searchParams }: ProgrammingLanguagePageProps) {
  const { language } = await params;
  const current = programmingLanguages.find((item) => item.slug === language);
  if (!current) notFound();
  const siteLanguage = resolveLanguage(searchParams ? await searchParams : undefined);

  return <ProgrammingTrainer initialLanguageSlug={getProgrammingLanguage(language).slug} initialSiteLanguage={siteLanguage} />;
}
