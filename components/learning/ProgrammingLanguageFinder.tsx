"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { localizedHref, type InterfaceLanguage } from "@/lib/language";
import type { ProgrammingLanguageSlug } from "@/lib/programming-content";

export type ProgrammingFinderItem = {
  slug: ProgrammingLanguageSlug;
  title: string;
  shortTitle: string;
  description: string;
  searchText: string;
  isFirstChoice: boolean;
};

type FinderCopy = {
  search: string;
  placeholder: string;
  clear: string;
  noMatch: string;
  count: (visible: number, total: number) => string;
};

const finderCopy: Record<InterfaceLanguage, FinderCopy> = {
  en: {
    search: "Find a language",
    placeholder: "Python JavaScript Rust SQL Bash",
    clear: "Clear",
    noMatch: "No language matched. Try a name like Python, Rust, SQL, or Bash.",
    count: (visible, total) => `${visible} of ${total}`,
  },
  zh: {
    search: "查找语言",
    placeholder: "Python JavaScript Rust SQL Bash",
    clear: "清空",
    noMatch: "没有匹配的语言，可以试试 Python、Rust、SQL 或 Bash。",
    count: (visible, total) => `${visible} / ${total}`,
  },
  ja: {
    search: "言語を探す",
    placeholder: "Python JavaScript Rust SQL Bash",
    clear: "クリア",
    noMatch: "一致する言語がありません。Python、Rust、SQL、Bash などで検索してください。",
    count: (visible, total) => `${visible} / ${total}`,
  },
  ko: {
    search: "언어 찾기",
    placeholder: "Python JavaScript Rust SQL Bash",
    clear: "지우기",
    noMatch: "일치하는 언어가 없습니다. Python, Rust, SQL, Bash 를 검색해 보세요.",
    count: (visible, total) => `${visible} / ${total}`,
  },
  es: {
    search: "Buscar lenguaje",
    placeholder: "Python JavaScript Rust SQL Bash",
    clear: "Limpiar",
    noMatch: "No hay coincidencias. Prueba Python, Rust, SQL o Bash.",
    count: (visible, total) => `${visible} de ${total}`,
  },
  fr: {
    search: "Chercher un langage",
    placeholder: "Python JavaScript Rust SQL Bash",
    clear: "Effacer",
    noMatch: "Aucun langage trouve. Essaie Python, Rust, SQL ou Bash.",
    count: (visible, total) => `${visible} sur ${total}`,
  },
  de: {
    search: "Sprache suchen",
    placeholder: "Python JavaScript Rust SQL Bash",
    clear: "Leeren",
    noMatch: "Keine Sprache gefunden. Suche Python, Rust, SQL oder Bash.",
    count: (visible, total) => `${visible} von ${total}`,
  },
  pt: {
    search: "Buscar linguagem",
    placeholder: "Python JavaScript Rust SQL Bash",
    clear: "Limpar",
    noMatch: "Nenhuma linguagem encontrada. Tente Python, Rust, SQL ou Bash.",
    count: (visible, total) => `${visible} de ${total}`,
  },
  ru: {
    search: "Найти язык",
    placeholder: "Python JavaScript Rust SQL Bash",
    clear: "Очистить",
    noMatch: "Нет совпадений. Попробуй Python, Rust, SQL или Bash.",
    count: (visible, total) => `${visible} из ${total}`,
  },
  ar: {
    search: "ابحث عن لغة",
    placeholder: "Python JavaScript Rust SQL Bash",
    clear: "مسح",
    noMatch: "لا توجد لغة مطابقة. جرّب Python أو Rust أو SQL أو Bash.",
    count: (visible, total) => `${visible} من ${total}`,
  },
  hi: {
    search: "भाषा खोजें",
    placeholder: "Python JavaScript Rust SQL Bash",
    clear: "साफ करें",
    noMatch: "कोई भाषा नहीं मिली. Python, Rust, SQL या Bash आजमाएं.",
    count: (visible, total) => `${visible} / ${total}`,
  },
  id: {
    search: "Cari bahasa",
    placeholder: "Python JavaScript Rust SQL Bash",
    clear: "Hapus",
    noMatch: "Tidak ada bahasa cocok. Coba Python, Rust, SQL, atau Bash.",
    count: (visible, total) => `${visible} dari ${total}`,
  },
  vi: {
    search: "Tim ngon ngu",
    placeholder: "Python JavaScript Rust SQL Bash",
    clear: "Xoa",
    noMatch: "Khong co ngon ngu phu hop. Thu Python, Rust, SQL hoac Bash.",
    count: (visible, total) => `${visible} / ${total}`,
  },
  th: {
    search: "ค้นหาภาษา",
    placeholder: "Python JavaScript Rust SQL Bash",
    clear: "ล้าง",
    noMatch: "ไม่พบภาษา ลอง Python, Rust, SQL หรือ Bash",
    count: (visible, total) => `${visible} / ${total}`,
  },
  tr: {
    search: "Dil ara",
    placeholder: "Python JavaScript Rust SQL Bash",
    clear: "Temizle",
    noMatch: "Dil bulunmadi. Python, Rust, SQL veya Bash dene.",
    count: (visible, total) => `${visible} / ${total}`,
  },
  it: {
    search: "Cerca linguaggio",
    placeholder: "Python JavaScript Rust SQL Bash",
    clear: "Pulisci",
    noMatch: "Nessun linguaggio trovato. Prova Python, Rust, SQL o Bash.",
    count: (visible, total) => `${visible} di ${total}`,
  },
  nl: {
    search: "Taal zoeken",
    placeholder: "Python JavaScript Rust SQL Bash",
    clear: "Wissen",
    noMatch: "Geen taal gevonden. Probeer Python, Rust, SQL of Bash.",
    count: (visible, total) => `${visible} van ${total}`,
  },
  pl: {
    search: "Szukaj jezyka",
    placeholder: "Python JavaScript Rust SQL Bash",
    clear: "Wyczysc",
    noMatch: "Nie znaleziono jezyka. Sprobuj Python, Rust, SQL albo Bash.",
    count: (visible, total) => `${visible} z ${total}`,
  },
};

function normalize(value: string) {
  return value.toLowerCase().replace(/\s+/g, " ").trim();
}

export default function ProgrammingLanguageFinder({
  language,
  items,
  open,
  drillsEach,
  firstChoice,
  advanced,
}: {
  language: InterfaceLanguage;
  items: ProgrammingFinderItem[];
  open: string;
  drillsEach: string;
  firstChoice: string;
  advanced: string;
}) {
  const [query, setQuery] = useState("");
  const t = finderCopy[language];
  const cleanQuery = normalize(query);
  const visibleItems = useMemo(() => {
    if (!cleanQuery) return items;
    return items.filter((item) => normalize(item.searchText).includes(cleanQuery));
  }, [cleanQuery, items]);

  return (
    <div>
      <div className="mt-4 flex flex-wrap items-end justify-between gap-3">
        <label className="min-w-[220px] flex-1">
          <span className="eyebrow">{t.search}</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="tool-input mt-2"
            placeholder={t.placeholder}
            dir="ltr"
          />
        </label>
        <div className="flex items-center gap-2">
          <span className="dense-status">{t.count(visibleItems.length, items.length)}</span>
          {query && (
            <button type="button" className="dense-action" onClick={() => setQuery("")}>
              {t.clear}
            </button>
          )}
        </div>
      </div>

      {visibleItems.length > 0 ? (
        <div className="mt-4 grid gap-2 md:grid-cols-2">
          {visibleItems.map((item) => (
            <Link key={item.slug} href={localizedHref(`/programming/${item.slug}`, language)} className="dense-card p-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="eyebrow">{item.shortTitle}</p>
                  <h3 className="mt-1 truncate text-lg font-semibold">{item.title}</h3>
                </div>
                <span className="dense-status">{open}</span>
              </div>
              <p className="mt-3 line-clamp-2 text-sm leading-6 text-[color:var(--muted)]">{item.description}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="dense-status">{drillsEach}</span>
                <span className="dense-status">{item.isFirstChoice ? firstChoice : advanced}</span>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <p className="mt-4 rounded-[8px] border border-slate-200 bg-white px-3 py-4 text-sm text-[color:var(--muted)]">
          {t.noMatch}
        </p>
      )}
    </div>
  );
}
