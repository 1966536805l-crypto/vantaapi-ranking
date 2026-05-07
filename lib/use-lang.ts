"use client";

import { useMemo } from "react";

export type Lang = "en" | "zh";

export function useLang(): Lang {
  return useMemo(() => {
    if (typeof window === "undefined") return "en";
    const queryLanguage = new URLSearchParams(window.location.search).get("lang");
    if (queryLanguage === "zh" || queryLanguage === "en") return queryLanguage;
    const localLanguage = window.localStorage.getItem("vantaapi-language");
    if (localLanguage === "zh" || localLanguage === "en") return localLanguage;
    const cookieLanguage = document.cookie
      .split(";")
      .map((item) => item.trim())
      .find((item) => item.startsWith("jinming_language=") || item.startsWith("vantaapi-language="))
      ?.split("=")[1];
    return cookieLanguage === "zh" ? "zh" : "en";
  }, []);
}

export function withLang(href: string, lang: Lang) {
  if (lang !== "zh") return href;
  const separator = href.includes("?") ? "&" : "?";
  return `${href}${separator}lang=zh`;
}
