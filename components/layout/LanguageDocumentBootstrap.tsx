"use client";

import { useEffect } from "react";

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
  useEffect(() => {
    const supported = new Set(Object.keys(languageHtmlLang));
    const cookieNames = ["jinming_language", "vantaapi-language"];
    const readStorage = () => {
      try {
        return window.localStorage.getItem("vantaapi-language") || "";
      } catch {
        return "";
      }
    };
    const writeStorage = (language: string) => {
      try {
        window.localStorage.setItem("vantaapi-language", language);
      } catch {
        // Some locked-down browsers disable localStorage. Cookies still keep the preference.
      }
    };
    const readCookie = () => {
      const parts = document.cookie.split(";").map((item) => item.trim());
      for (const name of cookieNames) {
        const found = parts.find((item) => item.startsWith(`${name}=`));
        const value = found ? decodeURIComponent(found.split("=")[1] || "") : "";
        if (supported.has(value)) return value;
      }
      return "";
    };
    const writeCookies = (language: string) => {
      const maxAge = 60 * 60 * 24 * 365;
      for (const name of cookieNames) {
        document.cookie = `${name}=${encodeURIComponent(language)}; Path=/; Max-Age=${maxAge}; SameSite=Lax`;
      }
    };

    const url = new URL(window.location.href);
    const query = url.searchParams.get("lang") || "";
    const stored = readStorage();
    const cookie = readCookie();
    const browser = (navigator.language || "").toLowerCase().split("-")[0];
    const language = supported.has(query)
      ? query
      : supported.has(stored)
        ? stored
        : cookie || (supported.has(browser) ? browser : "en");

    document.documentElement.lang = languageHtmlLang[language] || "en-US";
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
    writeStorage(language);

    if (!query && language !== "en") {
      url.searchParams.set("lang", language);
      window.location.replace(url.pathname + url.search + url.hash);
      return;
    }

    if (supported.has(query)) writeCookies(language);
  }, []);

  return null;
}
