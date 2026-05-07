"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { SiteLanguage } from "@/lib/language";

const languages = [
  { code: "zh", flag: "🇨🇳", label: "Chinese" },
  { code: "en", flag: "🇺🇸", label: "English" },
] as const;

export default function FlagLanguageToggle({
  initialLanguage = "en",
  onChange,
}: {
  initialLanguage?: SiteLanguage;
  onChange?: (language: SiteLanguage) => void;
}) {
  const router = useRouter();
  const [current, setCurrent] = useState<SiteLanguage>(initialLanguage);

  useEffect(() => {
    document.documentElement.lang = current === "zh" ? "zh-CN" : "en-US";
    window.localStorage.setItem("immortal-language", current);
  }, [current]);

  function setLanguage(code: SiteLanguage) {
    setCurrent(code);
    onChange?.(code);
    const url = new URL(window.location.href);
    if (code === "zh") url.searchParams.set("lang", "zh");
    else url.searchParams.delete("lang");
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
