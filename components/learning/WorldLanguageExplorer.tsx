"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { localizedHref, type InterfaceLanguage } from "@/lib/language";
import type { WorldLanguage } from "@/lib/world-language-content";

type WorldLanguageExplorerProps = {
  languages: WorldLanguage[];
  families: string[];
  language?: InterfaceLanguage;
};

const prioritySlugs = ["english", "japanese", "korean", "spanish", "french", "arabic", "chinese", "german"];

type ExplorerCopy = {
  eyebrow: string;
  title: string;
  countSuffix: string;
  searchLabel: string;
  placeholder: string;
  familyLabel: string;
  allFamilies: string;
  scriptLabel: string;
  allScripts: string;
  all: string;
  priority: string;
  empty: string;
};

const baseExplorerCopy: Record<"en" | "zh" | "ja" | "ar", ExplorerCopy> = {
  en: {
    eyebrow: "All languages",
    title: "World Language Map",
    countSuffix: "languages",
    searchLabel: "Search language",
    placeholder: "Type English Japanese Arabic Hangul Latin",
    familyLabel: "By family",
    allFamilies: "All families",
    scriptLabel: "By script",
    allScripts: "All writing systems",
    all: "All",
    priority: "Start here",
    empty: "No matching language yet. Try another keyword or clear the filters.",
  },
  zh: {
    eyebrow: "全部语言",
    title: "世界语言地图",
    countSuffix: "门",
    searchLabel: "搜索语言",
    placeholder: "输入 English 日本語 Arabic Hangul Latin",
    familyLabel: "按语系",
    allFamilies: "全部语系",
    scriptLabel: "按文字",
    allScripts: "全部文字系统",
    all: "全部",
    priority: "推荐先学",
    empty: "没找到匹配语言 换一个关键词或清空筛选",
  },
  ja: {
    eyebrow: "すべての言語",
    title: "世界言語マップ",
    countSuffix: "言語",
    searchLabel: "言語を検索",
    placeholder: "English 日本語 Arabic Hangul Latin を入力",
    familyLabel: "語族で絞る",
    allFamilies: "すべての語族",
    scriptLabel: "文字で絞る",
    allScripts: "すべての文字体系",
    all: "すべて",
    priority: "最初のおすすめ",
    empty: "一致する言語がありません。別の語句を試すか、フィルターを解除してください。",
  },
  ar: {
    eyebrow: "كل اللغات",
    title: "خريطة لغات العالم",
    countSuffix: "لغة",
    searchLabel: "ابحث عن لغة",
    placeholder: "اكتب English Japanese Arabic Hangul Latin",
    familyLabel: "حسب العائلة",
    allFamilies: "كل العائلات",
    scriptLabel: "حسب الكتابة",
    allScripts: "كل أنظمة الكتابة",
    all: "الكل",
    priority: "ابدأ من هنا",
    empty: "لا توجد لغة مطابقة. جرب كلمة أخرى أو امسح المرشحات.",
  },
};

const explorerCopy: Record<InterfaceLanguage, ExplorerCopy> = {
  ...baseExplorerCopy,
  ko: { eyebrow: "모든 언어", title: "세계 언어 지도", countSuffix: "언어", searchLabel: "언어 검색", placeholder: "English Japanese Arabic Hangul Latin 입력", familyLabel: "어족", allFamilies: "모든 어족", scriptLabel: "문자", allScripts: "모든 문자 체계", all: "전체", priority: "여기서 시작", empty: "일치하는 언어가 없습니다. 다른 키워드를 시도하세요." },
  es: { eyebrow: "Todos los idiomas", title: "Mapa de idiomas del mundo", countSuffix: "idiomas", searchLabel: "Buscar idioma", placeholder: "Escribe English Japanese Arabic Hangul Latin", familyLabel: "Por familia", allFamilies: "Todas las familias", scriptLabel: "Por escritura", allScripts: "Todos los sistemas", all: "Todo", priority: "Empieza aqui", empty: "No hay idioma coincidente. Prueba otra palabra." },
  fr: { eyebrow: "Toutes les langues", title: "Carte des langues du monde", countSuffix: "langues", searchLabel: "Chercher une langue", placeholder: "Tape English Japanese Arabic Hangul Latin", familyLabel: "Par famille", allFamilies: "Toutes les familles", scriptLabel: "Par ecriture", allScripts: "Tous les systemes", all: "Tout", priority: "Commence ici", empty: "Aucune langue trouvee. Essaie un autre mot." },
  de: { eyebrow: "Alle Sprachen", title: "Weltsprachen Karte", countSuffix: "Sprachen", searchLabel: "Sprache suchen", placeholder: "English Japanese Arabic Hangul Latin eingeben", familyLabel: "Nach Familie", allFamilies: "Alle Familien", scriptLabel: "Nach Schrift", allScripts: "Alle Schriftsysteme", all: "Alle", priority: "Hier starten", empty: "Keine passende Sprache. Versuche ein anderes Wort." },
  pt: { eyebrow: "Todos os idiomas", title: "Mapa de idiomas do mundo", countSuffix: "idiomas", searchLabel: "Buscar idioma", placeholder: "Digite English Japanese Arabic Hangul Latin", familyLabel: "Por familia", allFamilies: "Todas as familias", scriptLabel: "Por escrita", allScripts: "Todos os sistemas", all: "Tudo", priority: "Comece aqui", empty: "Nenhum idioma encontrado. Tente outra palavra." },
  ru: { eyebrow: "Все языки", title: "Карта языков мира", countSuffix: "языков", searchLabel: "Искать язык", placeholder: "Введите English Japanese Arabic Hangul Latin", familyLabel: "По семье", allFamilies: "Все семьи", scriptLabel: "По письменности", allScripts: "Все системы письма", all: "Все", priority: "Начни здесь", empty: "Подходящий язык не найден. Попробуй другое слово." },
  hi: { eyebrow: "सभी भाषाएं", title: "विश्व भाषा मानचित्र", countSuffix: "भाषाएं", searchLabel: "भाषा खोजें", placeholder: "English Japanese Arabic Hangul Latin लिखें", familyLabel: "परिवार से", allFamilies: "सभी परिवार", scriptLabel: "लिपि से", allScripts: "सभी लिपियां", all: "सभी", priority: "यहां शुरू करें", empty: "मिलती भाषा नहीं मिली. दूसरा शब्द आजमाएं." },
  id: { eyebrow: "Semua bahasa", title: "Peta bahasa dunia", countSuffix: "bahasa", searchLabel: "Cari bahasa", placeholder: "Ketik English Japanese Arabic Hangul Latin", familyLabel: "Menurut keluarga", allFamilies: "Semua keluarga", scriptLabel: "Menurut aksara", allScripts: "Semua sistem tulis", all: "Semua", priority: "Mulai di sini", empty: "Tidak ada bahasa cocok. Coba kata lain." },
  vi: { eyebrow: "Tat ca ngon ngu", title: "Ban do ngon ngu the gioi", countSuffix: "ngon ngu", searchLabel: "Tim ngon ngu", placeholder: "Nhap English Japanese Arabic Hangul Latin", familyLabel: "Theo he", allFamilies: "Tat ca he", scriptLabel: "Theo chu viet", allScripts: "Tat ca chu viet", all: "Tat ca", priority: "Bat dau o day", empty: "Chua co ngon ngu phu hop. Thu tu khoa khac." },
  th: { eyebrow: "ทุกภาษา", title: "แผนที่ภาษาทั่วโลก", countSuffix: "ภาษา", searchLabel: "ค้นหาภาษา", placeholder: "พิมพ์ English Japanese Arabic Hangul Latin", familyLabel: "ตามตระกูล", allFamilies: "ทุกตระกูล", scriptLabel: "ตามระบบเขียน", allScripts: "ทุกระบบเขียน", all: "ทั้งหมด", priority: "เริ่มที่นี่", empty: "ไม่พบภาษาที่ตรง ลองคำอื่น" },
  tr: { eyebrow: "Tum diller", title: "Dunya dil haritasi", countSuffix: "dil", searchLabel: "Dil ara", placeholder: "English Japanese Arabic Hangul Latin yaz", familyLabel: "Aileye gore", allFamilies: "Tum aileler", scriptLabel: "Yaziya gore", allScripts: "Tum yazi sistemleri", all: "Tum", priority: "Buradan basla", empty: "Eslesen dil yok. Baska kelime dene." },
  it: { eyebrow: "Tutte le lingue", title: "Mappa lingue del mondo", countSuffix: "lingue", searchLabel: "Cerca lingua", placeholder: "Scrivi English Japanese Arabic Hangul Latin", familyLabel: "Per famiglia", allFamilies: "Tutte le famiglie", scriptLabel: "Per scrittura", allScripts: "Tutti i sistemi", all: "Tutto", priority: "Inizia qui", empty: "Nessuna lingua trovata. Prova un altra parola." },
  nl: { eyebrow: "Alle talen", title: "Wereldtaalkaart", countSuffix: "talen", searchLabel: "Taal zoeken", placeholder: "Typ English Japanese Arabic Hangul Latin", familyLabel: "Op familie", allFamilies: "Alle families", scriptLabel: "Op schrift", allScripts: "Alle schrijfsystemen", all: "Alles", priority: "Start hier", empty: "Geen passende taal. Probeer een ander woord." },
  pl: { eyebrow: "Wszystkie jezyki", title: "Mapa jezykow swiata", countSuffix: "jezykow", searchLabel: "Szukaj jezyka", placeholder: "Wpisz English Japanese Arabic Hangul Latin", familyLabel: "Wedlug rodziny", allFamilies: "Wszystkie rodziny", scriptLabel: "Wedlug pisma", allScripts: "Wszystkie systemy", all: "Wszystko", priority: "Zacznij tutaj", empty: "Brak pasujacego jezyka. Sprobuj innego slowa." },
};

export function WorldLanguageExplorer({ languages, families, language = "en" }: WorldLanguageExplorerProps) {
  const t = explorerCopy[language];
  const [query, setQuery] = useState("");
  const [family, setFamily] = useState("all");
  const [script, setScript] = useState("all");

  const scripts = useMemo(
    () => Array.from(new Set(languages.map((language) => language.script))).sort(),
    [languages],
  );

  const filteredLanguages = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return languages.filter((language) => {
      const matchesQuery = normalizedQuery
        ? [
            language.name,
            language.nativeName,
            language.family,
            language.region,
            language.script,
            language.firstLesson.join(" "),
          ]
            .join(" ")
            .toLowerCase()
            .includes(normalizedQuery)
        : true;
      const matchesFamily = family === "all" || language.family === family;
      const matchesScript = script === "all" || language.script === script;
      return matchesQuery && matchesFamily && matchesScript;
    });
  }, [family, languages, query, script]);

  const priorityLanguages = prioritySlugs
    .map((slug) => languages.find((language) => language.slug === slug))
    .filter((language): language is WorldLanguage => Boolean(language));

  return (
    <section className="mt-3 dense-panel p-5">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow">{t.eyebrow}</p>
          <h2 className="mt-2 text-2xl font-semibold">{t.title}</h2>
        </div>
        <span className="dense-status">
          {filteredLanguages.length} / {languages.length} {t.countSuffix}
        </span>
      </div>

      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div className="grid gap-3">
          <div className="rounded-[8px] border border-slate-200 bg-white/85 p-3">
            <label className="eyebrow" htmlFor="language-search">{t.searchLabel}</label>
            <input
              id="language-search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="mt-2 w-full rounded-[8px] border border-slate-200 bg-white px-3 py-3 text-sm outline-none transition focus:border-slate-400"
              placeholder={t.placeholder}
            />
          </div>

          <div className="grid gap-2 md:grid-cols-2">
            <label className="grid gap-2 rounded-[8px] border border-slate-200 bg-white/85 p-3">
              <span className="eyebrow">{t.familyLabel}</span>
              <select
                value={family}
                onChange={(event) => setFamily(event.target.value)}
                className="rounded-[8px] border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-slate-400"
              >
                <option value="all">{t.allFamilies}</option>
                {families.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-2 rounded-[8px] border border-slate-200 bg-white/85 p-3">
              <span className="eyebrow">{t.scriptLabel}</span>
              <select
                value={script}
                onChange={(event) => setScript(event.target.value)}
                className="rounded-[8px] border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-slate-400"
              >
                <option value="all">{t.allScripts}</option>
                {scripts.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="flex flex-wrap gap-2">
            {["all", "Germanic", "Romance", "Slavic", "Semitic", "Austronesian", "Bantu"].map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setFamily(item)}
                className={item === family ? "dense-action-primary px-3 py-2" : "dense-action px-3 py-2"}
              >
                {item === "all" ? t.all : item}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-[8px] border border-slate-200 bg-white/85 p-3">
          <p className="eyebrow">{t.priority}</p>
          <div className="mt-3 grid gap-2">
            {priorityLanguages.map((item) => (
              <Link key={item.slug} href={localizedHref(`/languages/${item.slug}`, language)} className="dense-row">
                <span className="text-sm font-semibold">{item.nativeName}</span>
                <span className="truncate text-xs text-[color:var(--muted)]">{item.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredLanguages.map((item) => (
          <Link
            key={item.slug}
            href={localizedHref(`/languages/${item.slug}`, language)}
            className="dense-card p-4 transition hover:-translate-y-0.5 hover:border-slate-300"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="eyebrow">{item.family}</p>
                <h3 className="mt-1 truncate text-lg font-semibold">{item.nativeName}</h3>
                <p className="mt-1 truncate text-sm text-[color:var(--muted)]">{item.name}</p>
              </div>
              <span className="dense-status">{item.script}</span>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {item.firstLesson.slice(0, 3).map((lesson) => (
                <span key={lesson} className="dense-status">{lesson}</span>
              ))}
            </div>
          </Link>
        ))}
      </div>

      {filteredLanguages.length === 0 && (
        <div className="mt-4 rounded-[8px] border border-slate-200 bg-white/85 p-5 text-sm text-[color:var(--muted)]">
          {t.empty}
        </div>
      )}
    </section>
  );
}
