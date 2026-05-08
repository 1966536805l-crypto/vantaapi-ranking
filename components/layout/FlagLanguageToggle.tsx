"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
    writeLanguagePreference(current);
    onChange?.(current);

    const url = new URL(window.location.href);
    const queryLanguage = url.searchParams.get("lang");
    if (!queryLanguage && current !== "en") {
      url.searchParams.set("lang", current);
      router.replace(`${url.pathname}${url.search}${url.hash}`, { scroll: false });
    }
  }, [current, onChange, router]);

  function setLanguage(code: InterfaceLanguage) {
    writeLanguagePreference(code);
    setCurrent(code);
    onChange?.(code);
    const url = new URL(window.location.href);
    if (code === "en") url.searchParams.delete("lang");
    else url.searchParams.set("lang", code);
    router.replace(`${url.pathname}${url.search}${url.hash}`, { scroll: false });
  }

  const activeLanguage = interfaceLanguages.find((language) => language.code === current) ?? interfaceLanguages[0];
  const copy = toggleCopy[current];

  return (
    <div className="flag-toggle" aria-label={copy.region}>
      <label className="flag-toggle-label">
        <span aria-hidden="true">{activeLanguage.flag}</span>
        <span>{activeLanguage.nativeName}</span>
      </label>
      <select
        className="flag-toggle-select"
        value={current}
        aria-label={copy.choose}
        title={copy.choose}
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
