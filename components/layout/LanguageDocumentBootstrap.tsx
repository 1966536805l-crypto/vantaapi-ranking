const languageHtmlLang: Record<string, string> = {
  en: "en-US",
  zh: "zh-CN",
  ja: "ja-JP",
  ko: "ko-KR",
  es: "es-ES",
  fr: "fr-FR",
  de: "de-DE",
  pt: "pt-PT",
  ru: "ru-RU",
  ar: "ar",
  hi: "hi-IN",
  id: "id-ID",
  vi: "vi-VN",
  th: "th-TH",
  tr: "tr-TR",
  it: "it-IT",
  nl: "nl-NL",
  pl: "pl-PL",
};

export default function LanguageDocumentBootstrap() {
  const script = `
(() => {
  const htmlLang = ${JSON.stringify(languageHtmlLang)};
  const supported = new Set(Object.keys(htmlLang));
  const cookieNames = ["jinming_language", "vantaapi-language"];
  const readCookie = () => {
    const parts = document.cookie.split(";").map((item) => item.trim());
    for (const name of cookieNames) {
      const found = parts.find((item) => item.startsWith(name + "="));
      const value = found ? decodeURIComponent(found.split("=")[1] || "") : "";
      if (supported.has(value)) return value;
    }
    return "";
  };
  const url = new URL(window.location.href);
  const query = url.searchParams.get("lang") || "";
  const stored = window.localStorage.getItem("vantaapi-language") || "";
  const browser = (navigator.language || "").toLowerCase().split("-")[0];
  const language = supported.has(query) ? query : supported.has(stored) ? stored : readCookie() || (supported.has(browser) ? browser : "en");
  document.documentElement.lang = htmlLang[language] || "en-US";
  document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
  window.localStorage.setItem("vantaapi-language", language);
  if (!query && language !== "en") {
    url.searchParams.set("lang", language);
    window.location.replace(url.pathname + url.search + url.hash);
    return;
  }
  if (supported.has(query)) {
    const maxAge = 60 * 60 * 24 * 365;
    for (const name of cookieNames) {
      document.cookie = name + "=" + encodeURIComponent(language) + "; Path=/; Max-Age=" + maxAge + "; SameSite=Lax";
    }
  }
})();`;

  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
