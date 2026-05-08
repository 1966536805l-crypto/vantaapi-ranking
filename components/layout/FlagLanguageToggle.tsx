"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { interfaceLanguages, isInterfaceLanguage, languageHtmlLang, type InterfaceLanguage } from "@/lib/language";

const languageCookieNames = ["jinming_language", "vantaapi-language"];

function writeLanguageCookie(language: InterfaceLanguage) {
  const maxAge = 60 * 60 * 24 * 365;
  for (const name of languageCookieNames) {
    document.cookie = `${name}=${language}; Path=/; Max-Age=${maxAge}; SameSite=Lax`;
  }
}

function readStoredLanguage(): InterfaceLanguage | null {
  const local = window.localStorage.getItem("vantaapi-language");
  if (isInterfaceLanguage(local)) return local;

  const cookie = document.cookie
    .split(";")
    .map((item) => item.trim())
    .find((item) => languageCookieNames.some((name) => item.startsWith(`${name}=`)));
  const value = cookie?.split("=")[1];
  return isInterfaceLanguage(value) ? value : null;
}

export default function FlagLanguageToggle({
  initialLanguage = "en",
  onChange,
}: {
  initialLanguage?: InterfaceLanguage;
  onChange?: (language: InterfaceLanguage) => void;
}) {
  const router = useRouter();
  const [current, setCurrent] = useState<InterfaceLanguage>(() => {
    if (typeof window === "undefined") return initialLanguage;
    const url = new URL(window.location.href);
    const queryLanguage = url.searchParams.get("lang");
    const storedLanguage = readStoredLanguage();
    return isInterfaceLanguage(queryLanguage)
      ? queryLanguage
      : storedLanguage ?? initialLanguage;
  });

  useEffect(() => {
    document.documentElement.lang = languageHtmlLang(current);
    document.documentElement.dir = current === "ar" ? "rtl" : "ltr";
    window.localStorage.setItem("vantaapi-language", current);
    writeLanguageCookie(current);
    onChange?.(current);

    const url = new URL(window.location.href);
    const queryLanguage = url.searchParams.get("lang");
    if (!queryLanguage && current !== "en") {
      url.searchParams.set("lang", current);
      router.replace(`${url.pathname}${url.search}${url.hash}`, { scroll: false });
    }
  }, [current, onChange, router]);

  function setLanguage(code: InterfaceLanguage) {
    setCurrent(code);
    onChange?.(code);
    const url = new URL(window.location.href);
    if (code === "en") url.searchParams.delete("lang");
    else url.searchParams.set("lang", code);
    router.replace(`${url.pathname}${url.search}${url.hash}`, { scroll: false });
  }

  const activeLanguage = interfaceLanguages.find((language) => language.code === current) ?? interfaceLanguages[0];

  return (
    <div className="flag-toggle" aria-label="Language switcher">
      <label className="flag-toggle-label">
        <span aria-hidden="true">{activeLanguage.flag}</span>
        <span>{activeLanguage.nativeName}</span>
      </label>
      <select
        className="flag-toggle-select"
        value={current}
        aria-label="Choose site language"
        title="Choose site language"
        onChange={(event) => {
          const next = event.target.value;
          if (isInterfaceLanguage(next)) setLanguage(next);
        }}
      >
        {interfaceLanguages.map((language) => (
          <option key={language.code} value={language.code}>
            {language.flag} {language.nativeName}
          </option>
        ))}
      </select>
    </div>
  );
}
