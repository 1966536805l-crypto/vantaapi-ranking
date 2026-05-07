"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { SiteLanguage } from "@/lib/language";

const languages = [
  { code: "zh", flag: "🇨🇳", label: "Chinese" },
  { code: "en", flag: "🇺🇸", label: "English" },
] as const;

const languageCookieNames = ["jinming_language", "vantaapi-language"];

function writeLanguageCookie(language: SiteLanguage) {
  const maxAge = 60 * 60 * 24 * 365;
  for (const name of languageCookieNames) {
    document.cookie = `${name}=${language}; Path=/; Max-Age=${maxAge}; SameSite=Lax`;
  }
}

function readStoredLanguage(): SiteLanguage | null {
  const local = window.localStorage.getItem("vantaapi-language");
  if (local === "zh" || local === "en") return local;

  const cookie = document.cookie
    .split(";")
    .map((item) => item.trim())
    .find((item) => languageCookieNames.some((name) => item.startsWith(`${name}=`)));
  const value = cookie?.split("=")[1];
  return value === "zh" || value === "en" ? value : null;
}

export default function FlagLanguageToggle({
  initialLanguage = "en",
  onChange,
}: {
  initialLanguage?: SiteLanguage;
  onChange?: (language: SiteLanguage) => void;
}) {
  const router = useRouter();
  const [current, setCurrent] = useState<SiteLanguage>(() => {
    if (typeof window === "undefined") return initialLanguage;
    const url = new URL(window.location.href);
    const queryLanguage = url.searchParams.get("lang");
    const storedLanguage = readStoredLanguage();
    return queryLanguage === "zh" || queryLanguage === "en"
      ? queryLanguage
      : storedLanguage ?? initialLanguage;
  });

  useEffect(() => {
    document.documentElement.lang = current === "zh" ? "zh-CN" : "en-US";
    window.localStorage.setItem("vantaapi-language", current);
    writeLanguageCookie(current);
    onChange?.(current);

    const url = new URL(window.location.href);
    const queryLanguage = url.searchParams.get("lang");
    if (!queryLanguage && current === "zh") {
      url.searchParams.set("lang", "zh");
      router.replace(`${url.pathname}${url.search}${url.hash}`, { scroll: false });
    }
  }, [current, onChange, router]);

  function setLanguage(code: SiteLanguage) {
    setCurrent(code);
    onChange?.(code);
    const url = new URL(window.location.href);
    if (code === "zh") url.searchParams.set("lang", "zh");
    else url.searchParams.set("lang", "en");
    router.replace(`${url.pathname}${url.search}${url.hash}`, { scroll: false });
  }

  const activeLanguage = languages.find((language) => language.code === current) ?? languages[1];
  const nextLanguage = current === "zh" ? languages[1] : languages[0];

  return (
    <div className="flag-toggle" aria-label="Language switcher">
      <button
        type="button"
        className="flag-toggle-button flag-toggle-active"
        aria-label={`Switch to ${nextLanguage.label}`}
        title={`Switch to ${nextLanguage.label}`}
        onClick={() => setLanguage(nextLanguage.code)}
      >
        <span aria-hidden="true">{activeLanguage.flag}</span>
      </button>
    </div>
  );
}
