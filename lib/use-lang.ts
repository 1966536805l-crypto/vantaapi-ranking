"use client";

import { useMemo } from "react";

export type Lang = "en" | "zh";

export function useLang(): Lang {
  return useMemo(() => {
    if (typeof window === "undefined") return "en";
    return new URLSearchParams(window.location.search).get("lang") === "zh" ? "zh" : "en";
  }, []);
}

export function withLang(href: string, lang: Lang) {
  if (lang !== "zh") return href;
  const separator = href.includes("?") ? "&" : "?";
  return `${href}${separator}lang=zh`;
}
