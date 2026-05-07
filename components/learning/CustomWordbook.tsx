"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import VocabularyTrainer from "@/components/learning/VocabularyTrainer";
import {
  CUSTOM_WORDBOOK_SLUG,
  makeCustomWord,
  normalizeTags,
  readCustomWords,
  writeCustomWords,
  type CustomVocabularyWord,
} from "@/lib/custom-wordbook";
import type { ExamVocabularyWord } from "@/lib/exam-content";
import type { SiteLanguage } from "@/lib/language";

type WordForm = {
  word: string;
  phonetic: string;
  meaningZh: string;
  meaningEn: string;
  collocation: string;
  sentence: string;
  examNote: string;
  tags: string;
  source: string;
};

const emptyForm: WordForm = {
  word: "",
  phonetic: "",
  meaningZh: "",
  meaningEn: "",
  collocation: "",
  sentence: "",
  examNote: "",
  tags: "my words",
  source: "manual",
};

const copy = {
  en: {
    eyebrow: "My Wordbook",
    title: "A personal wordbook that can actually train",
    subtitle: "Import words, group them by tags, search them, back them up, and train the exact set you care about. Everything stays in this browser.",
    addTitle: "Add one word",
    word: "Word",
    phonetic: "Phonetic optional",
    meaningZh: "Chinese meaning",
    meaningEn: "English meaning",
    collocation: "Collocation",
    tags: "Tags",
    source: "Source",
    sentence: "Example sentence",
    note: "Memory note",
    save: "Save word",
    clear: "Clear form",
    importTitle: "One click import",
    importHelp: "One line per word. Supported: word, meaning, sentence, tags. You can also paste the backup JSON here.",
    importPlaceholder: "abandon, 放弃, He abandoned the old plan, exam writing\ncohesive | 连贯的 | a cohesive essay | ielts writing",
    importButton: "Import",
    libraryTitle: "Wordbook",
    empty: "Add at least one word to start your own trainer.",
    start: "Train selected words",
    delete: "Delete",
    edit: "Edit",
    clearAll: "Clear wordbook",
    clearConfirm: "Clear all words in this custom wordbook?",
    exportTitle: "Backup JSON",
    exportHelp: "Keep this JSON to move your wordbook to another browser.",
    search: "Search word meaning tag",
    allTags: "All",
    total: "words",
    groups: "groups",
    saved: "saved locally",
    imported: "imported",
    duplicate: "updated",
    filtered: "selected",
    noMatch: "No words match this filter.",
    quickTags: ["exam", "writing", "reading", "wrong", "daily"],
  },
  zh: {
    eyebrow: "我的词书",
    title: "一本真正能训练的个人单词本",
    subtitle: "支持批量导入 标签分组 搜索筛选 JSON 备份 并能直接进入四选一 拼写 发音 艾宾浩斯复习 数据只保存在当前浏览器",
    addTitle: "添加单词",
    word: "单词",
    phonetic: "音标 可选",
    meaningZh: "中文释义",
    meaningEn: "英文释义",
    collocation: "搭配",
    tags: "标签",
    source: "来源",
    sentence: "例句",
    note: "记忆备注",
    save: "保存单词",
    clear: "清空表单",
    importTitle: "一键导入词表",
    importHelp: "一行一个词 支持 单词 释义 例句 标签 也可以直接粘贴备份 JSON",
    importPlaceholder: "abandon, 放弃, He abandoned the old plan, 考试 写作\ncohesive | 连贯的 | a cohesive essay | 雅思 写作",
    importButton: "导入",
    libraryTitle: "词书管理",
    empty: "先添加至少一个单词 就能开始训练自己的词书",
    start: "训练当前筛选",
    delete: "删除",
    edit: "编辑",
    clearAll: "清空词书",
    clearConfirm: "确定清空我的词书里所有单词吗",
    exportTitle: "备份 JSON",
    exportHelp: "换浏览器或备份时 保留这份 JSON 即可恢复",
    search: "搜索 单词 释义 标签",
    allTags: "全部",
    total: "个词",
    groups: "个分组",
    saved: "已保存到本机",
    imported: "已导入",
    duplicate: "已更新",
    filtered: "当前筛选",
    noMatch: "当前筛选下没有单词",
    quickTags: ["考试", "写作", "阅读", "错词", "每日"],
  },
} as const;

function splitImportLine(line: string) {
  const parts = line
    .split(/\s*[,;\t|，；]\s*/)
    .map((item) => item.trim())
    .filter(Boolean);

  if (parts.length >= 2) return parts;

  const fallback = line.trim().split(/\s+/);
  if (fallback.length <= 1) return [line.trim()];
  return [fallback[0], fallback.slice(1).join(" ")];
}

function wordFromLine(line: string, language: SiteLanguage, defaultTags: string) {
  const [word = "", meaning = "", sentence = "", tags = "", phonetic = ""] = splitImportLine(line);
  return makeCustomWord({
    word,
    phonetic,
    meaningZh: language === "zh" ? meaning : "",
    meaningEn: language === "en" ? meaning : "",
    sentence,
    tags: tags || defaultTags,
    source: "bulk import",
    collocation: tags || defaultTags,
    examNote: language === "zh" ? "批量导入词汇" : "Bulk imported word",
  });
}

function parseBulkWords(text: string, language: SiteLanguage, defaultTags: string) {
  const trimmed = text.trim();
  if (!trimmed) return [];

  if (trimmed.startsWith("[")) {
    try {
      const parsed = JSON.parse(trimmed) as ExamVocabularyWord[];
      if (Array.isArray(parsed)) {
        return parsed
          .map((word) => makeCustomWord({ ...word, tags: "tags" in word ? (word as CustomVocabularyWord).tags : defaultTags, source: "json import" }))
          .filter((word): word is CustomVocabularyWord => Boolean(word));
      }
    } catch {
      return [];
    }
  }

  return trimmed
    .split(/\r?\n/)
    .map((line) => wordFromLine(line, language, defaultTags))
    .filter((word): word is CustomVocabularyWord => Boolean(word));
}

function wordMatches(word: CustomVocabularyWord, query: string) {
  const cleanQuery = query.trim().toLowerCase();
  if (!cleanQuery) return true;
  const haystack = [
    word.word,
    word.meaningZh,
    word.meaningEn,
    word.collocation,
    word.sentence,
    word.examNote,
    word.source,
    ...word.tags,
  ].join(" ").toLowerCase();
  return haystack.includes(cleanQuery);
}

function uniqueTags(words: CustomVocabularyWord[]) {
  return Array.from(new Set(words.flatMap((word) => word.tags))).sort((a, b) => a.localeCompare(b));
}

function formFromWord(word: CustomVocabularyWord): WordForm {
  return {
    word: word.word,
    phonetic: word.phonetic || "",
    meaningZh: word.meaningZh,
    meaningEn: word.meaningEn,
    collocation: word.collocation,
    sentence: word.sentence,
    examNote: word.examNote,
    tags: word.tags.join(" "),
    source: word.source,
  };
}

export default function CustomWordbook({ language }: { language: SiteLanguage }) {
  const t = copy[language];
  const [words, setWords] = useState<CustomVocabularyWord[]>([]);
  const [form, setForm] = useState<WordForm>(emptyForm);
  const [bulkText, setBulkText] = useState("");
  const [bulkTags, setBulkTags] = useState(language === "zh" ? "每日" : "daily");
  const [message, setMessage] = useState("");
  const [selectedTag, setSelectedTag] = useState("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const refresh = () => setWords(readCustomWords());
    const timeoutId = window.setTimeout(refresh, 0);
    window.addEventListener("storage", refresh);
    window.addEventListener("jinming-custom-wordbook", refresh);
    return () => {
      window.clearTimeout(timeoutId);
      window.removeEventListener("storage", refresh);
      window.removeEventListener("jinming-custom-wordbook", refresh);
    };
  }, []);

  const tags = useMemo(() => uniqueTags(words), [words]);
  const filteredWords = useMemo(() => {
    return words.filter((word) => {
      const tagOk = selectedTag === "all" || word.tags.includes(selectedTag);
      return tagOk && wordMatches(word, search);
    });
  }, [search, selectedTag, words]);
  const trainerWords = filteredWords.length > 0 ? filteredWords : words;
  const backupJson = useMemo(() => JSON.stringify(words, null, 2), [words]);
  const wordsWithSentences = words.filter((word) => word.sentence).length;

  const saveWords = useCallback((nextWords: CustomVocabularyWord[]) => {
    setWords(nextWords);
    writeCustomWords(nextWords);
  }, []);

  const saveFormWord = useCallback(() => {
    const nextWord = makeCustomWord({
      ...form,
      tags: normalizeTags(form.tags, "my words"),
      source: form.source || "manual",
    });
    if (!nextWord) return;

    const existed = words.some((word) => word.word.toLowerCase() === nextWord.word.toLowerCase());
    const oldWord = words.find((word) => word.word.toLowerCase() === nextWord.word.toLowerCase());
    const mergedWord = oldWord ? { ...nextWord, createdAt: oldWord.createdAt } : nextWord;
    const nextWords = [
      mergedWord,
      ...words.filter((word) => word.word.toLowerCase() !== nextWord.word.toLowerCase()),
    ];

    saveWords(nextWords);
    setForm(emptyForm);
    setSelectedTag(mergedWord.tags[0] || "all");
    setMessage(`${nextWord.word} ${existed ? t.duplicate : t.saved}`);
  }, [form, saveWords, t.duplicate, t.saved, words]);

  const importBulk = useCallback(() => {
    const imported = parseBulkWords(bulkText, language, bulkTags);
    if (imported.length === 0) return;

    const importedKeys = new Set(imported.map((word) => word.word.toLowerCase()));
    const existingByKey = new Map(words.map((word) => [word.word.toLowerCase(), word]));
    const mergedImported = imported.map((word) => {
      const oldWord = existingByKey.get(word.word.toLowerCase());
      return oldWord ? { ...word, createdAt: oldWord.createdAt } : word;
    });
    const nextWords = [
      ...mergedImported,
      ...words.filter((word) => !importedKeys.has(word.word.toLowerCase())),
    ];

    saveWords(nextWords);
    setBulkText("");
    setSelectedTag(normalizeTags(bulkTags)[0] || "all");
    setMessage(`${t.imported} ${imported.length} ${t.total}`);
  }, [bulkTags, bulkText, language, saveWords, t.imported, t.total, words]);

  const deleteWord = useCallback((target: string) => {
    saveWords(words.filter((word) => word.word !== target));
    setMessage("");
  }, [saveWords, words]);

  const clearAllWords = useCallback(() => {
    if (!window.confirm(t.clearConfirm)) return;
    saveWords([]);
    setMessage("");
    setSelectedTag("all");
    setSearch("");
  }, [saveWords, t.clearConfirm]);

  const editWord = useCallback((word: CustomVocabularyWord) => {
    setForm(formFromWord(word));
    setMessage("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <section className="custom-wordbook">
      <div className="custom-wordbook-hero dense-panel">
        <div>
          <p className="eyebrow">{t.eyebrow}</p>
          <h2>{t.title}</h2>
          <p>{t.subtitle}</p>
        </div>
        <strong>{words.length} <span>{t.total}</span></strong>
      </div>

      <section className="custom-wordbook-stats">
        <StatCard label={t.total} value={String(words.length)} />
        <StatCard label={t.groups} value={String(tags.length)} />
        <StatCard label={t.filtered} value={String(filteredWords.length)} />
        <StatCard label="sentences" value={String(wordsWithSentences)} />
      </section>

      <div className="custom-wordbook-grid">
        <section className="dense-panel custom-wordbook-form">
          <div>
            <p className="eyebrow">{t.addTitle}</p>
          </div>
          <label className="tool-label">
            {t.word}
            <input className="tool-input" value={form.word} onChange={(event) => setForm((current) => ({ ...current, word: event.target.value }))} />
          </label>
          <label className="tool-label">
            {t.phonetic}
            <input className="tool-input" value={form.phonetic} onChange={(event) => setForm((current) => ({ ...current, phonetic: event.target.value }))} />
          </label>
          <div className="custom-wordbook-two">
            <label className="tool-label">
              {t.meaningZh}
              <input className="tool-input" value={form.meaningZh} onChange={(event) => setForm((current) => ({ ...current, meaningZh: event.target.value }))} />
            </label>
            <label className="tool-label">
              {t.meaningEn}
              <input className="tool-input" value={form.meaningEn} onChange={(event) => setForm((current) => ({ ...current, meaningEn: event.target.value }))} />
            </label>
          </div>
          <div className="custom-wordbook-two">
            <label className="tool-label">
              {t.tags}
              <input className="tool-input" value={form.tags} onChange={(event) => setForm((current) => ({ ...current, tags: event.target.value }))} />
            </label>
            <label className="tool-label">
              {t.source}
              <input className="tool-input" value={form.source} onChange={(event) => setForm((current) => ({ ...current, source: event.target.value }))} />
            </label>
          </div>
          <div className="custom-wordbook-quick-tags">
            {t.quickTags.map((tag) => (
              <button key={tag} type="button" onClick={() => setForm((current) => ({ ...current, tags: `${current.tags} ${tag}`.trim() }))}>
                {tag}
              </button>
            ))}
          </div>
          <label className="tool-label">
            {t.collocation}
            <input className="tool-input" value={form.collocation} onChange={(event) => setForm((current) => ({ ...current, collocation: event.target.value }))} />
          </label>
          <label className="tool-label">
            {t.sentence}
            <textarea className="tool-textarea tool-textarea-small" value={form.sentence} onChange={(event) => setForm((current) => ({ ...current, sentence: event.target.value }))} />
          </label>
          <label className="tool-label">
            {t.note}
            <input className="tool-input" value={form.examNote} onChange={(event) => setForm((current) => ({ ...current, examNote: event.target.value }))} />
          </label>
          <div className="custom-wordbook-actions">
            <button type="button" className="dense-action-primary" onClick={saveFormWord}>{t.save}</button>
            <button type="button" className="dense-action" onClick={() => setForm(emptyForm)}>{t.clear}</button>
          </div>
          {message ? <p className="custom-wordbook-message">{message}</p> : null}
        </section>

        <aside className="dense-panel custom-wordbook-import">
          <p className="eyebrow">{t.importTitle}</p>
          <h3>{t.importTitle}</h3>
          <p>{t.importHelp}</p>
          <label className="tool-label">
            {t.tags}
            <input className="tool-input" value={bulkTags} onChange={(event) => setBulkTags(event.target.value)} />
          </label>
          <textarea
            className="tool-textarea"
            value={bulkText}
            onChange={(event) => setBulkText(event.target.value)}
            placeholder={t.importPlaceholder}
          />
          <button type="button" className="dense-action-primary" onClick={importBulk}>{t.importButton}</button>
        </aside>
      </div>

      <section className="dense-panel custom-wordbook-library">
        <div className="custom-wordbook-section-head">
          <div>
            <p className="eyebrow">{t.libraryTitle}</p>
            <h3>{words.length > 0 ? t.start : t.empty}</h3>
          </div>
          {words.length > 0 ? <button type="button" className="dense-action" onClick={clearAllWords}>{t.clearAll}</button> : null}
        </div>

        {words.length > 0 ? (
          <>
            <div className="custom-wordbook-filters">
              <input
                className="tool-input"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={t.search}
              />
              <div className="custom-wordbook-tags">
                <button type="button" className={selectedTag === "all" ? "active" : ""} onClick={() => setSelectedTag("all")}>
                  {t.allTags}
                </button>
                {tags.map((tag) => (
                  <button key={tag} type="button" className={selectedTag === tag ? "active" : ""} onClick={() => setSelectedTag(tag)}>
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {filteredWords.length > 0 ? (
              <div className="custom-wordbook-list">
                {filteredWords.map((word) => (
                  <article key={word.word} className="dense-card custom-wordbook-card">
                    <div>
                      <strong>{word.word}</strong>
                      {word.phonetic ? <span>{word.phonetic}</span> : null}
                    </div>
                    <p>{language === "zh" ? word.meaningZh : word.meaningEn}</p>
                    <small>{word.sentence}</small>
                    <div className="custom-wordbook-tag-row">
                      {word.tags.map((tag) => <span key={tag}>{tag}</span>)}
                    </div>
                    <div className="custom-wordbook-card-actions">
                      <button type="button" className="dense-action" onClick={() => editWord(word)}>{t.edit}</button>
                      <button type="button" className="dense-action" onClick={() => deleteWord(word.word)}>{t.delete}</button>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <p className="custom-wordbook-empty">{t.noMatch}</p>
            )}
          </>
        ) : null}
      </section>

      {trainerWords.length > 0 ? (
        <VocabularyTrainer key={`${selectedTag}:${search}:${trainerWords.map((word) => word.word).join("|")}`} packSlug={CUSTOM_WORDBOOK_SLUG} words={trainerWords} language={language} />
      ) : null}

      {words.length > 0 ? (
        <section className="dense-panel custom-wordbook-backup">
          <p className="eyebrow">{t.exportTitle}</p>
          <h3>{t.exportTitle}</h3>
          <p>{t.exportHelp}</p>
          <textarea className="tool-textarea tool-code-input" value={backupJson} readOnly />
        </section>
      ) : null}
    </section>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="dense-card custom-wordbook-stat">
      <p>{label}</p>
      <strong>{value}</strong>
    </div>
  );
}
