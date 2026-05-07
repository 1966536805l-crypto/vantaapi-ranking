"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { KeyboardEvent as ReactKeyboardEvent } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { searchSite, siteSearchItems, type SiteSearchItem } from "@/lib/site-search";

const RECENT_STORAGE_KEY = "vantaapi-search-recents-v1";
const defaultHrefs = [
  "/today",
  "/english/vocabulary/custom?lang=zh",
  "/english/typing?lang=zh",
  "/tools",
  "/programming",
  "/languages",
  "/tools/prompt-optimizer",
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

export default function GlobalSearchLauncher() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [recentHrefs, setRecentHrefs] = useState<string[]>([]);

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
    router.push(item.href);
  }, [closeLauncher, router]);

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
        router.push(`/search?q=${encodeURIComponent(query.trim())}`);
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
        <span>Search</span>
        <kbd>/</kbd>
      </button>

      {open ? (
        <div className="global-search-overlay" role="dialog" aria-modal="true" aria-label="Site search">
          <button type="button" className="global-search-backdrop" aria-label="Close search" onClick={closeLauncher} />
          <section className="global-search-panel">
            <div className="global-search-input-wrap">
              <span>VA</span>
              <input
                ref={inputRef}
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setSelectedIndex(0);
                }}
                onKeyDown={handleInputKeyDown}
                placeholder="Search wordbook typing prompt python IELTS bug"
                autoComplete="off"
                spellCheck={false}
              />
              <kbd>Esc</kbd>
            </div>

            <div className="global-search-help">
              <span>{query ? `${results.length} results` : "Quick start"}</span>
              <span>↑ ↓ choose · Enter open · / summon</span>
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
                    <em>Open</em>
                  </button>
                ))}
              </div>
            ) : (
              <div className="global-search-empty">
                <strong>No direct match</strong>
                <p>Press Enter to open the full search page for this query.</p>
                <Link href={`/search?q=${encodeURIComponent(query.trim())}`} onClick={closeLauncher}>
                  Open full search
                </Link>
              </div>
            )}
          </section>
        </div>
      ) : null}
    </>
  );
}
