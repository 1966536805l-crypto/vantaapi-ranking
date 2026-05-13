import type { ExamVocabularyWord } from "@/lib/exam-content";

export const UNIFIED_WRONG_WORDS_KEY = "vantaapi-unified-wrong-words";

export type WrongWordSource = "memory" | "typing";

export type UnifiedWrongWord = {
  word: string;
  meaningZh: string;
  meaningEn: string;
  sentence: string;
  source: WrongWordSource;
  sources: WrongWordSource[];
  generated?: boolean;
  wrongCount: number;
  lastWrongAt: string;
};

function readWrongWords() {
  if (typeof window === "undefined") return [] as UnifiedWrongWord[];

  try {
    const raw = window.localStorage.getItem(UNIFIED_WRONG_WORDS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as UnifiedWrongWord[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function recordUnifiedWrongWord(word: ExamVocabularyWord, source: WrongWordSource) {
  if (typeof window === "undefined" || !word.word) return;

  const key = word.word.toLowerCase();
  const now = new Date().toISOString();
  const words = readWrongWords();
  const existing = words.find((item) => item.word.toLowerCase() === key);

  if (existing) {
    existing.meaningZh = existing.meaningZh || word.meaningZh;
    existing.meaningEn = existing.meaningEn || word.meaningEn;
    existing.sentence = existing.sentence || word.sentence;
    existing.generated = existing.generated || word.generated;
    existing.source = source;
    existing.sources = Array.from(new Set([...(existing.sources ?? [existing.source]), source]));
    existing.wrongCount += 1;
    existing.lastWrongAt = now;
  } else {
    words.unshift({
      word: word.word,
      meaningZh: word.meaningZh,
      meaningEn: word.meaningEn,
      sentence: word.sentence,
      source,
      sources: [source],
      generated: word.generated,
      wrongCount: 1,
      lastWrongAt: now,
    });
  }

  window.localStorage.setItem(UNIFIED_WRONG_WORDS_KEY, JSON.stringify(words.slice(0, 500)));
  window.dispatchEvent(new CustomEvent("vantaapi-wrong-words"));
}
