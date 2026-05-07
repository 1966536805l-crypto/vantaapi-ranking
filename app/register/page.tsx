import { redirect } from "next/navigation";
import { localizedHref, resolveLanguage, type PageSearchParams } from "@/lib/language";

export default async function RegisterPage({ searchParams }: { searchParams?: Promise<PageSearchParams> }) {
  const params = searchParams ? await searchParams : undefined;
  const language = resolveLanguage(params);
  redirect(localizedHref("/login", language));
}
