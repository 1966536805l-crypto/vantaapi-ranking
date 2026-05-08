"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { KeyboardEvent as ReactKeyboardEvent } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { isInterfaceLanguage, localizedHref, type InterfaceLanguage } from "@/lib/language";
import { searchSite, siteSearchItems, type SiteSearchItem } from "@/lib/site-search";

const RECENT_STORAGE_KEY = "vantaapi-search-recents-v1";
const defaultHrefs = [
  "/tools/github-repo-analyzer",
  "/tools",
  "/tools/api-request-generator",
  "/tools/prompt-optimizer",
  "/tools/bug-finder",
  "/tools/dev-utilities",
  "/tools/learning-roadmap",
  "/programming",
  "/programming/python",
];

function targetIsEditable(target: EventTarget | null) {
  const element = target as HTMLElement | null;
  if (!element) return false;
  return Boolean(
    element.closest("input, textarea, select, [contenteditable='true'], [role='textbox']"),
  );
}

function uniqueItems(items: Array<SiteSearchItem | undefined>) {
  const seen = new Set<string>();
  return items.filter((item): item is SiteSearchItem => {
    if (!item || seen.has(item.href)) return false;
    seen.add(item.href);
    return true;
  });
}

function readRecentHrefs() {
  if (typeof window === "undefined") return [] as string[];
  try {
    const parsed = JSON.parse(window.localStorage.getItem(RECENT_STORAGE_KEY) || "[]") as string[];
    return Array.isArray(parsed) ? parsed.filter((href) => typeof href === "string").slice(0, 6) : [];
  } catch {
    return [];
  }
}

function writeRecentHref(href: string) {
  if (typeof window === "undefined") return;
  const next = [href, ...readRecentHrefs().filter((item) => item !== href)].slice(0, 6);
  window.localStorage.setItem(RECENT_STORAGE_KEY, JSON.stringify(next));
}

const launcherCopy: Record<InterfaceLanguage, {
  search: string;
  aria: string;
  close: string;
  placeholder: string;
  quickStart: string;
  results: (count: number) => string;
  help: string;
  open: string;
  noMatch: string;
  noMatchBody: string;
  fullSearch: string;
}> = {
  en: {
    search: "Search",
    aria: "Site search",
    close: "Close search",
    placeholder: "Search GitHub prompt bug api json python",
    quickStart: "Quick start",
    results: (count) => `${count} results`,
    help: "↑ ↓ choose · Enter open · / summon",
    open: "Open",
    noMatch: "No direct match",
    noMatchBody: "Press Enter to open the full search page for this query.",
    fullSearch: "Open full search",
  },
  zh: {
    search: "搜索",
    aria: "站内搜索",
    close: "关闭搜索",
    placeholder: "搜索 GitHub 提示词 Bug API JSON Python",
    quickStart: "快速开始",
    results: (count) => `${count} 个结果`,
    help: "↑ ↓ 选择 · Enter 打开 · / 唤起",
    open: "打开",
    noMatch: "没有直接匹配",
    noMatchBody: "按 Enter 打开完整搜索页。",
    fullSearch: "打开完整搜索",
  },
  ja: {
    search: "検索",
    aria: "サイト検索",
    close: "検索を閉じる",
    placeholder: "GitHub prompt bug api json python を検索",
    quickStart: "クイック開始",
    results: (count) => `${count} 件`,
    help: "↑ ↓ 選択 · Enter 開く · / 呼び出し",
    open: "開く",
    noMatch: "直接一致なし",
    noMatchBody: "Enter で検索ページを開きます。",
    fullSearch: "検索ページを開く",
  },
  ko: {
    search: "검색",
    aria: "사이트 검색",
    close: "검색 닫기",
    placeholder: "GitHub prompt bug api json python 검색",
    quickStart: "빠른 시작",
    results: (count) => `${count}개 결과`,
    help: "↑ ↓ 선택 · Enter 열기 · / 호출",
    open: "열기",
    noMatch: "직접 일치 없음",
    noMatchBody: "Enter 를 누르면 전체 검색을 엽니다.",
    fullSearch: "전체 검색 열기",
  },
  es: {
    search: "Buscar",
    aria: "busqueda del sitio",
    close: "cerrar busqueda",
    placeholder: "buscar GitHub prompt bug api json python",
    quickStart: "inicio rapido",
    results: (count) => `${count} resultados`,
    help: "↑ ↓ elegir · Enter abrir · / llamar",
    open: "Abrir",
    noMatch: "Sin coincidencia directa",
    noMatchBody: "Pulsa Enter para abrir la busqueda completa.",
    fullSearch: "Abrir busqueda completa",
  },
  fr: {
    search: "Rechercher",
    aria: "recherche du site",
    close: "fermer la recherche",
    placeholder: "chercher GitHub prompt bug api json python",
    quickStart: "demarrage rapide",
    results: (count) => `${count} resultats`,
    help: "↑ ↓ choisir · Enter ouvrir · / appeler",
    open: "Ouvrir",
    noMatch: "Aucun resultat direct",
    noMatchBody: "Appuie sur Enter pour ouvrir la recherche complete.",
    fullSearch: "Ouvrir la recherche",
  },
  de: {
    search: "Suchen",
    aria: "Seitensuche",
    close: "Suche schliessen",
    placeholder: "GitHub prompt bug api json python suchen",
    quickStart: "Schnellstart",
    results: (count) => `${count} Ergebnisse`,
    help: "↑ ↓ waehlen · Enter oeffnen · / aufrufen",
    open: "Oeffnen",
    noMatch: "Kein direkter Treffer",
    noMatchBody: "Druecke Enter fuer die vollstaendige Suche.",
    fullSearch: "Vollsuche oeffnen",
  },
  pt: {
    search: "Buscar",
    aria: "busca do site",
    close: "fechar busca",
    placeholder: "buscar GitHub prompt bug api json python",
    quickStart: "inicio rapido",
    results: (count) => `${count} resultados`,
    help: "↑ ↓ escolher · Enter abrir · / chamar",
    open: "Abrir",
    noMatch: "Sem correspondencia direta",
    noMatchBody: "Pressione Enter para abrir a busca completa.",
    fullSearch: "Abrir busca completa",
  },
  ru: {
    search: "Поиск",
    aria: "поиск по сайту",
    close: "закрыть поиск",
    placeholder: "искать GitHub prompt bug api json python",
    quickStart: "быстрый старт",
    results: (count) => `${count} результатов`,
    help: "↑ ↓ выбрать · Enter открыть · / вызвать",
    open: "Открыть",
    noMatch: "Нет прямого совпадения",
    noMatchBody: "Нажми Enter чтобы открыть полный поиск.",
    fullSearch: "Открыть полный поиск",
  },
  ar: {
    search: "بحث",
    aria: "بحث في الموقع",
    close: "إغلاق البحث",
    placeholder: "ابحث عن GitHub أو prompt أو bug أو api أو json أو python",
    quickStart: "بداية سريعة",
    results: (count) => `${count} نتائج`,
    help: "↑ ↓ اختيار · Enter فتح · / استدعاء",
    open: "فتح",
    noMatch: "لا يوجد تطابق مباشر",
    noMatchBody: "اضغط Enter لفتح صفحة البحث الكاملة.",
    fullSearch: "فتح البحث الكامل",
  },
  hi: {
    search: "खोज",
    aria: "site search",
    close: "search बंद करें",
    placeholder: "GitHub prompt bug api json python खोजें",
    quickStart: "quick start",
    results: (count) => `${count} results`,
    help: "↑ ↓ चुनें · Enter खोलें · / बुलाएं",
    open: "खोलें",
    noMatch: "सीधा match नहीं",
    noMatchBody: "पूरी search page खोलने के लिए Enter दबाएं.",
    fullSearch: "पूरी search खोलें",
  },
  id: {
    search: "Cari",
    aria: "pencarian situs",
    close: "tutup pencarian",
    placeholder: "cari GitHub prompt bug api json python",
    quickStart: "mulai cepat",
    results: (count) => `${count} hasil`,
    help: "↑ ↓ pilih · Enter buka · / panggil",
    open: "Buka",
    noMatch: "Tidak ada cocok langsung",
    noMatchBody: "Tekan Enter untuk membuka halaman pencarian penuh.",
    fullSearch: "Buka pencarian penuh",
  },
  vi: {
    search: "Tim",
    aria: "tim kiem trong site",
    close: "dong tim kiem",
    placeholder: "tim GitHub prompt bug api json python",
    quickStart: "bat dau nhanh",
    results: (count) => `${count} ket qua`,
    help: "↑ ↓ chon · Enter mo · / goi",
    open: "Mo",
    noMatch: "Khong co ket qua truc tiep",
    noMatchBody: "Nhan Enter de mo trang tim kiem day du.",
    fullSearch: "Mo tim kiem day du",
  },
  th: {
    search: "ค้นหา",
    aria: "ค้นหาในไซต์",
    close: "ปิดการค้นหา",
    placeholder: "ค้นหา GitHub prompt bug api json python",
    quickStart: "เริ่มเร็ว",
    results: (count) => `${count} ผลลัพธ์`,
    help: "↑ ↓ เลือก · Enter เปิด · / เรียก",
    open: "เปิด",
    noMatch: "ไม่พบตรงๆ",
    noMatchBody: "กด Enter เพื่อเปิดหน้าค้นหาเต็ม.",
    fullSearch: "เปิดการค้นหาเต็ม",
  },
  tr: {
    search: "Ara",
    aria: "site arama",
    close: "aramayi kapat",
    placeholder: "GitHub prompt bug api json python ara",
    quickStart: "hizli basla",
    results: (count) => `${count} sonuc`,
    help: "↑ ↓ sec · Enter ac · / cagir",
    open: "Ac",
    noMatch: "Dogrudan eslesme yok",
    noMatchBody: "Tam arama sayfasini acmak icin Enter a bas.",
    fullSearch: "Tam aramayi ac",
  },
  it: {
    search: "Cerca",
    aria: "ricerca nel sito",
    close: "chiudi ricerca",
    placeholder: "cerca GitHub prompt bug api json python",
    quickStart: "avvio rapido",
    results: (count) => `${count} risultati`,
    help: "↑ ↓ scegli · Enter apri · / richiama",
    open: "Apri",
    noMatch: "Nessuna corrispondenza diretta",
    noMatchBody: "Premi Enter per aprire la ricerca completa.",
    fullSearch: "Apri ricerca completa",
  },
  nl: {
    search: "Zoeken",
    aria: "site zoeken",
    close: "zoeken sluiten",
    placeholder: "zoek GitHub prompt bug api json python",
    quickStart: "snel starten",
    results: (count) => `${count} resultaten`,
    help: "↑ ↓ kies · Enter open · / roep op",
    open: "Open",
    noMatch: "Geen directe match",
    noMatchBody: "Druk Enter om de volledige zoekpagina te openen.",
    fullSearch: "Volledige zoekactie openen",
  },
  pl: {
    search: "Szukaj",
    aria: "wyszukiwanie w witrynie",
    close: "zamknij wyszukiwanie",
    placeholder: "szukaj GitHub prompt bug api json python",
    quickStart: "szybki start",
    results: (count) => `${count} wynikow`,
    help: "↑ ↓ wybierz · Enter otworz · / przywolaj",
    open: "Otworz",
    noMatch: "Brak bezposredniego wyniku",
    noMatchBody: "Nacisnij Enter aby otworzyc pelne wyszukiwanie.",
    fullSearch: "Otworz pelne wyszukiwanie",
  },
};

function currentLanguageFromLocation(): InterfaceLanguage {
  if (typeof window === "undefined") return "en";
  const value = new URL(window.location.href).searchParams.get("lang");
  return isInterfaceLanguage(value) ? value : "en";
}

export default function GlobalSearchLauncher() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [recentHrefs, setRecentHrefs] = useState<string[]>([]);
  const [language, setLanguage] = useState<InterfaceLanguage>("en");
  const copy = launcherCopy[language];

  const defaultItems = useMemo(() => {
    const recentItems = recentHrefs.map((href) => siteSearchItems.find((item) => item.href === href));
    const pinnedItems = defaultHrefs.map((href) => siteSearchItems.find((item) => item.href === href));
    return uniqueItems([...recentItems, ...pinnedItems]).slice(0, 8);
  }, [recentHrefs]);

  const results = useMemo(() => {
    const cleanQuery = query.trim();
    return cleanQuery ? searchSite(cleanQuery, 8) : defaultItems;
  }, [defaultItems, query]);

  const selectedItem = results[Math.min(selectedIndex, Math.max(results.length - 1, 0))];

  const showLauncher = useCallback(() => {
    setLanguage(currentLanguageFromLocation());
    setOpen(true);
    setRecentHrefs(readRecentHrefs());
    window.setTimeout(() => inputRef.current?.focus(), 0);
  }, []);

  const closeLauncher = useCallback(() => {
    setOpen(false);
    setQuery("");
    setSelectedIndex(0);
  }, []);

  const openItem = useCallback((item: SiteSearchItem) => {
    writeRecentHref(item.href);
    closeLauncher();
    router.push(localizedHref(item.href, language));
  }, [closeLauncher, language, router]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => setLanguage(currentLanguageFromLocation()), 0);
    return () => window.clearTimeout(timeoutId);
  }, []);

  useEffect(() => {
    function handleGlobalKeyDown(event: globalThis.KeyboardEvent) {
      if (event.key === "Escape" && open) {
        event.preventDefault();
        closeLauncher();
        return;
      }

      if (targetIsEditable(event.target)) return;

      const isCommandSearch = (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k";
      const isSlashSearch = !event.altKey && !event.metaKey && !event.ctrlKey && event.key === "/";
      if (isCommandSearch || isSlashSearch) {
        event.preventDefault();
        showLauncher();
      }
    }

    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, [closeLauncher, open, showLauncher]);

  function handleInputKeyDown(event: ReactKeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setSelectedIndex((index) => (index + 1) % Math.max(results.length, 1));
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setSelectedIndex((index) => (index - 1 + Math.max(results.length, 1)) % Math.max(results.length, 1));
      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();
      if (selectedItem) {
        openItem(selectedItem);
      } else if (query.trim()) {
        writeRecentHref(`/search?q=${encodeURIComponent(query.trim())}`);
        closeLauncher();
        router.push(localizedHref(`/search?q=${encodeURIComponent(query.trim())}`, language));
      }
    }
  }

  return (
    <>
      <button
        type="button"
        className="global-search-trigger"
        onClick={showLauncher}
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <span>{copy.search}</span>
        <kbd>/</kbd>
      </button>

      {open ? (
        <div className="global-search-overlay" role="dialog" aria-modal="true" aria-label={copy.aria}>
          <button type="button" className="global-search-backdrop" aria-label={copy.close} onClick={closeLauncher} />
          <section className="global-search-panel">
            <div className="global-search-input-wrap">
              <span>JM</span>
              <input
                ref={inputRef}
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setSelectedIndex(0);
                }}
                onKeyDown={handleInputKeyDown}
                placeholder={copy.placeholder}
                autoComplete="off"
                spellCheck={false}
              />
              <kbd>Esc</kbd>
            </div>

            <div className="global-search-help">
              <span>{query ? copy.results(results.length) : copy.quickStart}</span>
              <span>{copy.help}</span>
            </div>

            {results.length > 0 ? (
              <div className="global-search-results">
                {results.map((item, index) => (
                  <button
                    key={`${item.href}-${item.category}`}
                    type="button"
                    className={`global-search-result ${index === selectedIndex ? "global-search-result-active" : ""}`}
                    onMouseEnter={() => setSelectedIndex(index)}
                    onClick={() => openItem(item)}
                  >
                    <span>
                      <strong>{item.title}</strong>
                      <small>{item.category} · {item.description}</small>
                    </span>
                    <em>{copy.open}</em>
                  </button>
                ))}
              </div>
            ) : (
              <div className="global-search-empty">
                <strong>{copy.noMatch}</strong>
                <p>{copy.noMatchBody}</p>
                <Link href={localizedHref(`/search?q=${encodeURIComponent(query.trim())}`, language)} onClick={closeLauncher}>
                  {copy.fullSearch}
                </Link>
              </div>
            )}
          </section>
        </div>
      ) : null}
    </>
  );
}
