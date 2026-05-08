"use client";

import { useMemo } from "react";
import { isInterfaceLanguage, type InterfaceLanguage } from "@/lib/language";

export type Lang = InterfaceLanguage;

export function useLang(): Lang {
  return useMemo(() => {
    if (typeof window === "undefined") return "en";
    const queryLanguage = new URLSearchParams(window.location.search).get("lang");
    if (isInterfaceLanguage(queryLanguage)) return queryLanguage;
    const localLanguage = window.localStorage.getItem("vantaapi-language");
    if (isInterfaceLanguage(localLanguage)) return localLanguage;
    const cookieLanguage = document.cookie
      .split(";")
      .map((item) => item.trim())
      .find((item) => item.startsWith("jinming_language=") || item.startsWith("vantaapi-language="))
      ?.split("=")[1];
    return isInterfaceLanguage(cookieLanguage) ? cookieLanguage : "en";
  }, []);
}

export function withLang(href: string, lang: Lang) {
  if (lang === "en") return href;
  const separator = href.includes("?") ? "&" : "?";
  return `${href}${separator}lang=${encodeURIComponent(lang)}`;
}
