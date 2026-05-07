"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { WorldLanguage } from "@/lib/world-language-content";

type WorldLanguageExplorerProps = {
  languages: WorldLanguage[];
  families: string[];
};

const prioritySlugs = ["english", "japanese", "korean", "spanish", "french", "arabic", "chinese", "german"];

export function WorldLanguageExplorer({ languages, families }: WorldLanguageExplorerProps) {
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
          <p className="eyebrow">全部语言</p>
          <h2 className="mt-2 text-2xl font-semibold">世界语言地图</h2>
        </div>
        <span className="dense-status">
          {filteredLanguages.length} / {languages.length} 门
        </span>
      </div>

      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div className="grid gap-3">
          <div className="rounded-[8px] border border-slate-200 bg-white/85 p-3">
            <label className="eyebrow" htmlFor="language-search">搜索语言</label>
            <input
              id="language-search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="mt-2 w-full rounded-[8px] border border-slate-200 bg-white px-3 py-3 text-sm outline-none transition focus:border-slate-400"
              placeholder="输入 English 日本語 Arabic Hangul Latin"
            />
          </div>

          <div className="grid gap-2 md:grid-cols-2">
            <label className="grid gap-2 rounded-[8px] border border-slate-200 bg-white/85 p-3">
              <span className="eyebrow">按语系</span>
              <select
                value={family}
                onChange={(event) => setFamily(event.target.value)}
                className="rounded-[8px] border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-slate-400"
              >
                <option value="all">全部语系</option>
                {families.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-2 rounded-[8px] border border-slate-200 bg-white/85 p-3">
              <span className="eyebrow">按文字</span>
              <select
                value={script}
                onChange={(event) => setScript(event.target.value)}
                className="rounded-[8px] border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-slate-400"
              >
                <option value="all">全部文字系统</option>
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
                {item === "all" ? "全部" : item}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-[8px] border border-slate-200 bg-white/85 p-3">
          <p className="eyebrow">推荐先学</p>
          <div className="mt-3 grid gap-2">
            {priorityLanguages.map((language) => (
              <Link key={language.slug} href={`/languages/${language.slug}`} className="dense-row">
                <span className="text-sm font-semibold">{language.nativeName}</span>
                <span className="truncate text-xs text-[color:var(--muted)]">{language.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredLanguages.map((language) => (
          <Link
            key={language.slug}
            href={`/languages/${language.slug}`}
            className="dense-card p-4 transition hover:-translate-y-0.5 hover:border-slate-300"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="eyebrow">{language.family}</p>
                <h3 className="mt-1 truncate text-lg font-semibold">{language.nativeName}</h3>
                <p className="mt-1 truncate text-sm text-[color:var(--muted)]">{language.name}</p>
              </div>
              <span className="dense-status">{language.script}</span>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {language.firstLesson.slice(0, 3).map((item) => (
                <span key={item} className="dense-status">{item}</span>
              ))}
            </div>
          </Link>
        ))}
      </div>

      {filteredLanguages.length === 0 && (
        <div className="mt-4 rounded-[8px] border border-slate-200 bg-white/85 p-5 text-sm text-[color:var(--muted)]">
          没找到匹配语言 换一个关键词或清空筛选
        </div>
      )}
    </section>
  );
}
