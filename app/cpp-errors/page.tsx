import { redirect } from "next/navigation";
import { localizedHref, resolveInterfaceLanguage, type PageSearchParams } from "@/lib/language";

export default async function CppErrorsPage({ searchParams }: { searchParams?: Promise<PageSearchParams> }) {
  const language = resolveInterfaceLanguage(searchParams ? await searchParams : undefined);
  redirect(localizedHref("/learn/cpp", language));
}
