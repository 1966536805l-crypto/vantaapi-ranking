"use client";

import { useEffect } from "react";
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
    document.cookie = `${name}=${encodeURIComponent(language)}; Path=/; Max-Age=${maxAge}; SameSite=Lax`;
  }
}

function writeLanguagePreference(language: InterfaceLanguage) {
  try {
    window.localStorage.setItem("vantaapi-language", language);
  } catch {
    // Cookies still keep the preference when localStorage is blocked.
  }
  document.documentElement.lang = languageHtmlLang(language);
  document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
  writeLanguageCookie(language);
}

function readStoredLanguage(): InterfaceLanguage | null {
  try {
    const local = window.localStorage.getItem("vantaapi-language");
    if (isInterfaceLanguage(local)) return local;
  } catch {
    // Ignore locked-down storage and fall back to cookies.
  }

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

  useEffect(() => {
    writeLanguagePreference(current);
    onChange?.(current);
  }, [current, onChange]);

  useEffect(() => {
    if (queryLanguage || typeof window === "undefined") return;

    const storedLanguage = readStoredLanguage();
    const preferredLanguage = storedLanguage ?? current;
    if (preferredLanguage === "en") return;

    const url = new URL(window.location.href);
    url.searchParams.set("lang", preferredLanguage);
    window.location.replace(`${url.pathname}${url.search}${url.hash}`);
  }, [current, queryLanguage]);

  function setLanguage(code: InterfaceLanguage) {
    const target = languageHref(code);
    writeLanguagePreference(code);
    onChange?.(code);
    window.location.assign(target);
  }

  function languageHref(code: InterfaceLanguage) {
    const params = new URLSearchParams(searchParams.toString());
    if (code === "en") params.delete("lang");
    else params.set("lang", code);

    const query = params.toString();
    return `${pathname}${query ? `?${query}` : ""}`;
  }

  const activeLanguage = interfaceLanguages.find((language) => language.code === current) ?? interfaceLanguages[0];
  const copy = toggleCopy[current];

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
              aria-checked={language.code === current}
              onClick={(event) => {
                event.preventDefault();
                setLanguage(language.code);
              }}
            >
              <span aria-hidden="true">{language.flag}</span>
              <span>{language.nativeName}</span>
              {language.code === current ? <span className="flag-toggle-check" aria-hidden="true">✓</span> : null}
            </a>
          ))}
        </div>
      </details>
    </div>
  );
}
