"use client";

import { useMemo, useState } from "react";
import VocabularyTrainer from "@/components/learning/VocabularyTrainer";
import type { ExamVocabularyPack, ExamVocabularyWord } from "@/lib/exam-content";
import type { SiteLanguage } from "@/lib/language";

type MemoryPack = Pick<ExamVocabularyPack, "slug" | "title" | "shortTitle" | "targetCount" | "level"> & {
  words: ExamVocabularyWord[];
};

const copy = {
  en: {
    eyebrow: "Memory System",
    title: "Spaced vocabulary review",
    subtitle: "Choose a pack and review with pronunciation, reveal controls, spelling mode, and Ebbinghaus scheduling saved in this browser.",
    choose: "Choose word bank",
    selectWords: "Choose words",
    search: "Search word meaning example",
    selected: "selected",
    useAll: "Using full bank",
    selectVisible: "Select visible",
    randomCount: "Random count",
    randomPick: "Random pick",
    clearSelection: "Clear selection",
    shortcut: "Q know · 0 do not know",
    count: "words",
  },
  zh: {
    eyebrow: "背单词系统",
    title: "艾宾浩斯遗忘曲线背单词",
    subtitle: "选择词库后直接背，支持发音、释义显示、拼写模式、本机保存进度，以及 Q 认识、0 不认识快捷键。",
    choose: "选择词库",
    selectWords: "自己选择要背的词",
    search: "搜索 单词 释义 例句",
    selected: "已选择",
    useAll: "当前使用整个词库",
    selectVisible: "选择当前结果",
    randomCount: "随机数量",
    randomPick: "随机抽取",
    clearSelection: "清空选择",
    shortcut: "Q 认识 · 0 不认识",
    count: "词",
  },
} as const;

function wordMatches(word: ExamVocabularyWord, query: string) {
  const clean = query.trim().toLowerCase();
  if (!clean) return true;
  return [
    word.word,
    word.meaningZh,
    word.meaningEn,
    word.collocation,
    word.sentence,
    word.examNote,
  ].join(" ").toLowerCase().includes(clean);
}

export default function MemoryWordSystem({
  packs,
  language,
}: {
  packs: MemoryPack[];
  language: SiteLanguage;
}) {
  const t = copy[language];
  const [selectedSlug, setSelectedSlug] = useState(packs[0]?.slug ?? "");
  const [search, setSearch] = useState("");
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [randomCount, setRandomCount] = useState("20");
  const selectedPack = useMemo(
    () => packs.find((pack) => pack.slug === selectedSlug) ?? packs[0],
    [packs, selectedSlug],
  );
  const selectedWordSet = useMemo(() => new Set(selectedWords), [selectedWords]);
  const filteredWords = useMemo(
    () => selectedPack.words.filter((word) => wordMatches(word, search)).slice(0, 120),
    [search, selectedPack.words],
  );
  const activeWords = useMemo(() => {
    if (selectedWords.length === 0) return selectedPack.words;
    const selected = selectedPack.words.filter((word) => selectedWordSet.has(word.word.toLowerCase()));
    return selected.length > 0 ? selected : selectedPack.words;
  }, [selectedPack.words, selectedWordSet, selectedWords.length]);
  const selectedSignature = selectedWords.length ? selectedWords.slice().sort().join("|") : "all";
  const randomPick = () => {
    const count = Math.max(1, Math.min(Number.parseInt(randomCount, 10) || 1, filteredWords.length || selectedPack.words.length));
    const source = (filteredWords.length > 0 ? filteredWords : selectedPack.words).map((word) => word.word.toLowerCase());
    const shuffled = [...source].sort(() => Math.random() - 0.5);
    setSelectedWords(Array.from(new Set(shuffled.slice(0, count))));
  };

  if (!selectedPack) return null;

  return (
    <section className="memory-word-system">
      <div className="module-hero px-5 py-6">
        <p className="eyebrow">{t.eyebrow}</p>
        <h1 className="apple-display-title mt-3 max-w-4xl text-3xl sm:text-4xl">{t.title}</h1>
        <p className="apple-display-subtitle mt-3 max-w-3xl text-sm text-[color:var(--muted)]">{t.subtitle}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="dense-status">Ebbinghaus</span>
          <span className="dense-status">{t.shortcut}</span>
          <span className="dense-status">{selectedPack.targetCount.toLocaleString(language === "zh" ? "zh-CN" : "en-US")} {t.count}</span>
        </div>
      </div>

      <section className="dense-panel mt-4 p-4 sm:p-5" aria-label={t.choose}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="eyebrow">{t.choose}</p>
            <h2 className="mt-2 text-2xl font-semibold">{selectedPack.shortTitle}</h2>
          </div>
          <span className="dense-status">{selectedPack.level}</span>
        </div>
        <div className="mt-4 grid gap-2 md:grid-cols-2 xl:grid-cols-3">
          {packs.map((pack) => (
            <button
              key={pack.slug}
              type="button"
              className={`memory-pack-button${pack.slug === selectedPack.slug ? " active" : ""}`}
              onClick={() => {
                setSelectedSlug(pack.slug);
                setSelectedWords([]);
                setSearch("");
              }}
            >
              <strong>{pack.shortTitle}</strong>
              <span>{pack.level} · {pack.targetCount.toLocaleString(language === "zh" ? "zh-CN" : "en-US")} {t.count}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="memory-word-picker dense-panel p-4 sm:p-5" aria-label={t.selectWords}>
        <div className="memory-picker-head">
          <div>
            <p className="eyebrow">{t.selectWords}</p>
            <h2>{selectedWords.length > 0 ? `${selectedWords.length} ${t.selected}` : t.useAll}</h2>
          </div>
          <div className="memory-picker-actions">
            <label className="memory-random-control">
              <span>{t.randomCount}</span>
              <input
                type="number"
                min={1}
                max={Math.max(filteredWords.length, selectedPack.words.length, 1)}
                value={randomCount}
                onChange={(event) => setRandomCount(event.target.value)}
              />
            </label>
            <button type="button" onClick={randomPick}>{t.randomPick}</button>
            <button
              type="button"
              onClick={() => {
                const visibleKeys = filteredWords.map((word) => word.word.toLowerCase());
                setSelectedWords((current) => Array.from(new Set([...current, ...visibleKeys])));
              }}
            >
              {t.selectVisible}
            </button>
            <button type="button" onClick={() => setSelectedWords([])}>{t.clearSelection}</button>
          </div>
        </div>
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder={t.search}
          className="memory-word-search"
        />
        <div className="memory-word-list">
          {filteredWords.map((word) => {
            const key = word.word.toLowerCase();
            const checked = selectedWordSet.has(key);
            return (
              <label key={word.word} className={checked ? "active" : ""}>
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={(event) => {
                    setSelectedWords((current) => {
                      if (event.target.checked) return Array.from(new Set([...current, key]));
                      return current.filter((item) => item !== key);
                    });
                  }}
                />
                <strong>{word.word}</strong>
                <span>{language === "zh" ? word.meaningZh : word.meaningEn}</span>
              </label>
            );
          })}
        </div>
      </section>

      <VocabularyTrainer
        key={`${selectedPack.slug}:${selectedSignature}`}
        packSlug={`memory-${selectedPack.slug}`}
        words={activeWords}
        language={language}
      />
    </section>
  );
}
