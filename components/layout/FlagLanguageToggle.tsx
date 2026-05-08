"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { interfaceLanguages, isInterfaceLanguage, languageHtmlLang, type InterfaceLanguage } from "@/lib/language";

const languageCookieNames = ["jinming_language", "vantaapi-language"];

const toggleCopy: Record<InterfaceLanguage, { region: string; choose: string }> = {
  en: { region: "Language switcher", choose: "Choose site language" },
  zh: { region: "语言切换器", choose: "选择网站语言" },
  ja: { region: "言語切替", choose: "サイト言語を選択" },
  ko: { region: "언어 전환", choose: "사이트 언어 선택" },
  es: { region: "Selector de idioma", choose: "Elegir idioma del sitio" },
  fr: { region: "Selecteur de langue", choose: "Choisir la langue du site" },
  de: { region: "Sprachwechsel", choose: "Seitensprache waehlen" },
  pt: { region: "Seletor de idioma", choose: "Escolher idioma do site" },
  ru: { region: "Переключатель языка", choose: "Выбрать язык сайта" },
  ar: { region: "مبدل اللغة", choose: "اختر لغة الموقع" },
  hi: { region: "भाषा बदलें", choose: "साइट भाषा चुनें" },
  id: { region: "Pengalih bahasa", choose: "Pilih bahasa situs" },
  vi: { region: "Bo chuyen ngon ngu", choose: "Chon ngon ngu trang" },
  th: { region: "ตัวเลือกภาษา", choose: "เลือกภาษาของไซต์" },
  tr: { region: "Dil degistirici", choose: "Site dilini sec" },
  it: { region: "Selettore lingua", choose: "Scegli lingua del sito" },
  nl: { region: "Taalwisselaar", choose: "Kies sitetaal" },
  pl: { region: "Przelacznik jezyka", choose: "Wybierz jezyk strony" },
};

function writeLanguageCookie(language: InterfaceLanguage) {
  const maxAge = 60 * 60 * 24 * 365;
  for (const name of languageCookieNames) {
    document.cookie = `${name}=${language}; Path=/; Max-Age=${maxAge}; SameSite=Lax`;
  }
}

function writeLanguagePreference(language: InterfaceLanguage) {
  window.localStorage.setItem("vantaapi-language", language);
  writeLanguageCookie(language);
  document.documentElement.lang = languageHtmlLang(language);
  document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
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
  const pathname = usePathname() || "/";
  const searchParams = useSearchParams();
  const queryLanguage = searchParams.get("lang");
  const current = isInterfaceLanguage(queryLanguage) ? queryLanguage : initialLanguage;
  const [pendingLanguage, setPendingLanguage] = useState<InterfaceLanguage | null>(null);

  useEffect(() => {
    writeLanguagePreference(current);
    onChange?.(current);
  }, [current, onChange]);

  useEffect(() => {
    if (queryLanguage || current !== "en" || typeof window === "undefined") return;

    const storedLanguage = readStoredLanguage();
    if (!storedLanguage || storedLanguage === "en") return;

    const url = new URL(window.location.href);
    url.searchParams.set("lang", storedLanguage);
    window.location.replace(url.toString());
  }, [current, queryLanguage]);

  function setLanguage(code: InterfaceLanguage) {
    writeLanguagePreference(code);
    setPendingLanguage(code);
    onChange?.(code);
    const url = new URL(window.location.href);
    if (code === "en") url.searchParams.delete("lang");
    else url.searchParams.set("lang", code);
    window.location.assign(url.toString());
  }

  function languageHref(code: InterfaceLanguage) {
    const params = new URLSearchParams(searchParams.toString());
    if (code === "en") params.delete("lang");
    else params.set("lang", code);

    const query = params.toString();
    return `${pathname}${query ? `?${query}` : ""}`;
  }

  const displayLanguage = pendingLanguage ?? current;
  const activeLanguage = interfaceLanguages.find((language) => language.code === displayLanguage) ?? interfaceLanguages[0];
  const copy = toggleCopy[displayLanguage];

  return (
    <div className="flag-toggle" aria-label={copy.region}>
      <details className="flag-toggle-details">
        <summary className="flag-toggle-summary" aria-label={copy.choose} title={copy.choose}>
          <span aria-hidden="true">{activeLanguage.flag}</span>
          <span>{activeLanguage.nativeName}</span>
        </summary>
        <div className="flag-toggle-menu-list" role="menu" aria-label={copy.choose}>
          {interfaceLanguages.map((language) => (
            <a
              key={language.code}
              className="flag-toggle-option"
              href={languageHref(language.code)}
              role="menuitemradio"
              aria-checked={language.code === displayLanguage}
              onClick={(event) => {
                event.preventDefault();
                setLanguage(language.code);
              }}
            >
              <span aria-hidden="true">{language.flag}</span>
              <span>{language.nativeName}</span>
              {language.code === displayLanguage ? <span className="flag-toggle-check" aria-hidden="true">✓</span> : null}
            </a>
          ))}
        </div>
      </details>
    </div>
  );
}
