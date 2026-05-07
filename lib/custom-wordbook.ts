import type { ExamVocabularyWord } from "@/lib/exam-content";

export const CUSTOM_WORDBOOK_SLUG = "custom-wordbook";
export const CUSTOM_WORDBOOK_STORAGE_KEY = "immortal-custom-wordbook-v1";

export type CustomVocabularyWord = ExamVocabularyWord & {
  tags: string[];
  source: string;
  createdAt: number;
  updatedAt: number;
};

function clean(value: string, fallback = "") {
  return value.trim().replace(/\s+/g, " ") || fallback;
}

export function normalizeTags(value: string | string[] | undefined, fallback = "my words") {
  const raw = Array.isArray(value) ? value.join(",") : value || "";
  const tags = raw
    .split(/[,\s，;；|/]+/)
    .map((tag) => tag.trim().toLowerCase())
    .filter(Boolean);
  const unique = Array.from(new Set(tags));
  return unique.length > 0 ? unique.slice(0, 8) : [fallback];
}

export function makeCustomWord(input: {
  word: string;
  phonetic?: string;
  meaningZh?: string;
  meaningEn?: string;
  collocation?: string;
  sentence?: string;
  examNote?: string;
  tags?: string[] | string;
  source?: string;
  createdAt?: number;
  updatedAt?: number;
}): CustomVocabularyWord | null {
  const word = clean(input.word);
  if (!word) return null;

  const meaningZh = clean(input.meaningZh || "", input.meaningEn || "自定义释义");
  const meaningEn = clean(input.meaningEn || "", input.meaningZh || "custom meaning");
  const now = Date.now();

  return {
    word,
    phonetic: clean(input.phonetic || ""),
    meaningZh,
    meaningEn,
    collocation: clean(input.collocation || "", "custom word"),
    sentence: clean(input.sentence || "", `I want to use ${word} correctly.`),
    examNote: clean(input.examNote || "", "来自我的词书 可用于个人复习和四选一训练"),
    tags: normalizeTags(input.tags, "my words"),
    source: clean(input.source || "", "manual"),
    createdAt: Number(input.createdAt || now),
    updatedAt: Number(input.updatedAt || now),
  };
}

export function readCustomWords() {
  if (typeof window === "undefined") return [] as CustomVocabularyWord[];

  try {
    const raw = window.localStorage.getItem(CUSTOM_WORDBOOK_STORAGE_KEY);
    if (!raw) return [] as CustomVocabularyWord[];
    const parsed = JSON.parse(raw) as CustomVocabularyWord[];
    if (!Array.isArray(parsed)) return [] as CustomVocabularyWord[];
    return parsed
      .map((word) => makeCustomWord(word))
      .filter((word): word is CustomVocabularyWord => Boolean(word));
  } catch {
    return [] as CustomVocabularyWord[];
  }
}

export function writeCustomWords(words: CustomVocabularyWord[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(CUSTOM_WORDBOOK_STORAGE_KEY, JSON.stringify(words));
  window.dispatchEvent(new CustomEvent("jinming-custom-wordbook"));
}

export function upsertCustomWord(word: ExamVocabularyWord, options?: { tags?: string[] | string; source?: string }) {
  const current = readCustomWords();
  const oldWord = current.find((item) => item.word.toLowerCase() === word.word.toLowerCase());
  const normalized = makeCustomWord({
    ...word,
    tags: options?.tags || oldWord?.tags || "saved",
    source: options?.source || oldWord?.source || "saved from trainer",
    createdAt: oldWord?.createdAt,
  });
  if (!normalized) return [] as CustomVocabularyWord[];

  const next = [
    normalized,
    ...current.filter((item) => item.word.toLowerCase() !== normalized.word.toLowerCase()),
  ];
  writeCustomWords(next);
  return next;
}
