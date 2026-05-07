import SmartAuthForm from "@/components/auth/SmartAuthForm";
import { localizedHref, resolveLanguage, resolveSafeNextHref, type PageSearchParams } from "@/lib/language";

export default async function RegisterPage({ searchParams }: { searchParams?: Promise<PageSearchParams> }) {
  const params = searchParams ? await searchParams : undefined;
  const language = resolveLanguage(params);
  const nextHref = resolveSafeNextHref(params, localizedHref("/dashboard", language));

  return <SmartAuthForm language={language} nextHref={nextHref} allowRegister initialMode="register" />;
}
