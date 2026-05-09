import { headers } from "next/headers";
import SmartAuthForm from "@/components/auth/SmartAuthForm";
import { localizedHref, resolveInterfaceLanguage, resolveSafeNextHref, type PageSearchParams } from "@/lib/language";

export default async function LoginPage({ searchParams }: { searchParams?: Promise<PageSearchParams> }) {
  const params = searchParams ? await searchParams : undefined;
  const headersList = await headers();
  const headerLanguage = headersList.get("x-jinming-language");
  const language = resolveInterfaceLanguage(params, headerLanguage);
  const nextHref = resolveSafeNextHref(params, localizedHref("/dashboard", language));
  return <SmartAuthForm language={language} nextHref={nextHref} allowRegister initialMode="login" />;
}
