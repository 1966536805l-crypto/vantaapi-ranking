import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { localizedHref, resolveInterfaceLanguage, type PageSearchParams } from "@/lib/language";

export default async function ProjectsPage({ searchParams }: { searchParams?: Promise<PageSearchParams> }) {
  const headersList = await headers();
  const headerLanguage = headersList.get("x-jinming-language");
  const language = resolveInterfaceLanguage(searchParams ? await searchParams : undefined, headerLanguage);
  redirect(localizedHref("/tools/github-repo-analyzer", language));
}
