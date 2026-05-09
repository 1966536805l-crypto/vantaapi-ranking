export const interfaceLanguages = [
  { code: "en", label: "English", nativeName: "English", flag: "🇺🇸", htmlLang: "en-US" },
  { code: "zh", label: "Chinese", nativeName: "中文", flag: "🇨🇳", htmlLang: "zh-CN" },
  { code: "ja", label: "Japanese", nativeName: "日本語", flag: "🇯🇵", htmlLang: "ja-JP" },
  { code: "ko", label: "Korean", nativeName: "한국어", flag: "🇰🇷", htmlLang: "ko-KR" },
  { code: "es", label: "Spanish", nativeName: "Español", flag: "🇪🇸", htmlLang: "es-ES" },
  { code: "fr", label: "French", nativeName: "Français", flag: "🇫🇷", htmlLang: "fr-FR" },
  { code: "de", label: "German", nativeName: "Deutsch", flag: "🇩🇪", htmlLang: "de-DE" },
  { code: "pt", label: "Portuguese", nativeName: "Português", flag: "🇵🇹", htmlLang: "pt-PT" },
  { code: "ru", label: "Russian", nativeName: "Русский", flag: "🇷🇺", htmlLang: "ru-RU" },
  { code: "ar", label: "Arabic", nativeName: "العربية", flag: "🇸🇦", htmlLang: "ar" },
  { code: "hi", label: "Hindi", nativeName: "हिन्दी", flag: "🇮🇳", htmlLang: "hi-IN" },
  { code: "id", label: "Indonesian", nativeName: "Indonesia", flag: "🇮🇩", htmlLang: "id-ID" },
  { code: "vi", label: "Vietnamese", nativeName: "Tiếng Việt", flag: "🇻🇳", htmlLang: "vi-VN" },
  { code: "th", label: "Thai", nativeName: "ไทย", flag: "🇹🇭", htmlLang: "th-TH" },
  { code: "tr", label: "Turkish", nativeName: "Türkçe", flag: "🇹🇷", htmlLang: "tr-TR" },
  { code: "it", label: "Italian", nativeName: "Italiano", flag: "🇮🇹", htmlLang: "it-IT" },
  { code: "nl", label: "Dutch", nativeName: "Nederlands", flag: "🇳🇱", htmlLang: "nl-NL" },
  { code: "pl", label: "Polish", nativeName: "Polski", flag: "🇵🇱", htmlLang: "pl-PL" },
] as const;

export type InterfaceLanguage = (typeof interfaceLanguages)[number]["code"];
export type SiteLanguage = "en" | "zh";

export type PageSearchParams = Record<string, string | string[] | undefined>;

export function isInterfaceLanguage(value: string | undefined | null): value is InterfaceLanguage {
  return interfaceLanguages.some((language) => language.code === value);
}

export function resolveInterfaceLanguage(
  searchParams?: PageSearchParams | null,
  headerLanguage?: string | null
): InterfaceLanguage {
  // Priority 1: URL parameter
  const value = searchParams?.lang;
  const lang = Array.isArray(value) ? value[0] : value;
  if (isInterfaceLanguage(lang)) return lang;

  // Priority 2: Header from middleware (includes cookie + Accept-Language detection)
  if (isInterfaceLanguage(headerLanguage)) return headerLanguage;

  // Priority 3: Default
  return "en";
}

export function resolveLanguage(searchParams?: PageSearchParams | null): SiteLanguage {
  return resolveInterfaceLanguage(searchParams) === "zh" ? "zh" : "en";
}

export function bilingualLanguage(language: InterfaceLanguage | SiteLanguage): SiteLanguage {
  return language === "zh" ? "zh" : "en";
}

export function languageHtmlLang(language: InterfaceLanguage | SiteLanguage) {
  return interfaceLanguages.find((item) => item.code === language)?.htmlLang ?? "en-US";
}

export function localizedHref(href: string, language: InterfaceLanguage | SiteLanguage) {
  const [pathWithQuery, hash = ""] = href.split("#");
  const [path, query = ""] = pathWithQuery.split("?");
  const params = new URLSearchParams(query);

  if (language === "en") {
    params.delete("lang");
  } else {
    params.set("lang", language);
  }

  const nextQuery = params.toString();
  const nextHash = hash ? `#${hash}` : "";
  return `${path}${nextQuery ? `?${nextQuery}` : ""}${nextHash}`;
}

export function localizedLanguageAlternates(path: string) {
  const alternates: Record<string, string> = {
    "x-default": localizedHref(path, "en"),
  };

  for (const language of interfaceLanguages) {
    alternates[language.htmlLang] = localizedHref(path, language.code);
  }

  return alternates;
}

export function resolveSafeNextHref(searchParams: PageSearchParams | undefined, fallback: string) {
  const value = searchParams?.next;
  const nextHref = Array.isArray(value) ? value[0] : value;

  if (!nextHref || !nextHref.startsWith("/") || nextHref.startsWith("//")) {
    return fallback;
  }

  return nextHref;
}
