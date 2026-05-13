"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import AICoachPanel from "@/components/learning/AICoachPanel";
import LearningFullscreenButton from "@/components/learning/LearningFullscreenButton";
import { CUSTOM_WORDBOOK_SLUG, upsertCustomWord } from "@/lib/custom-wordbook";
import type { ExamVocabularyPack, ExamVocabularyWord } from "@/lib/exam-content";
import { getExpandedVocabularyWords } from "@/lib/expanded-vocabulary-bank";
import type { SiteLanguage } from "@/lib/language";
import { recordLocalActivity } from "@/lib/local-progress";
import { speakMemoryPronunciation } from "@/lib/memory-pronunciation";
import { recordUnifiedWrongWord } from "@/lib/unified-wrong-words";

type ReviewRecord = {
  status: "known" | "unknown";
  stage: number;
  ease?: number;
  nextAt: number;
  seen: number;
  correct: number;
  wrong: number;
  updatedAt: number;
};

type ReviewProgress = Record<string, ReviewRecord>;

type SelectedChoice = {
  word: string;
  optionWord: string;
  correct: boolean;
};

type PracticeMode = "choice" | "free" | "spelling";
type DetailMode = "hidden" | "meaning" | "all" | "custom";
type DetailKey = "meaning" | "phonetic" | "roots" | "example";

const reviewIntervals = [
  { labelEn: "5 min", labelZh: "5 分钟", ms: 5 * 60 * 1000 },
  { labelEn: "30 min", labelZh: "30 分钟", ms: 30 * 60 * 1000 },
  { labelEn: "12 h", labelZh: "12 小时", ms: 12 * 60 * 60 * 1000 },
  { labelEn: "1 d", labelZh: "1 天", ms: 24 * 60 * 60 * 1000 },
  { labelEn: "2 d", labelZh: "2 天", ms: 2 * 24 * 60 * 60 * 1000 },
  { labelEn: "4 d", labelZh: "4 天", ms: 4 * 24 * 60 * 60 * 1000 },
  { labelEn: "7 d", labelZh: "7 天", ms: 7 * 24 * 60 * 60 * 1000 },
  { labelEn: "15 d", labelZh: "15 天", ms: 15 * 24 * 60 * 60 * 1000 },
  { labelEn: "30 d", labelZh: "30 天", ms: 30 * 24 * 60 * 60 * 1000 },
];

const REVIEW_SECONDS = 12;

const emptyWord: ExamVocabularyWord = {
  word: "",
  meaningZh: "",
  meaningEn: "",
  collocation: "",
  sentence: "",
  examNote: "",
};

const copy = {
  en: {
    eyebrow: "Vocabulary Trainer",
    title: "Four choice memory drill",
    subtitle: "Choose the meaning mark recognition play pronunciation and let the Ebbinghaus curve schedule review locally in this browser",
    question: "Choose the closest meaning",
    pronunciation: "US Voice",
    audioPolicy: "JinMing Lab Memory Voice prefers US English voices when the browser provides them: normal sound, slow imprint, spelling echo, and final recall. No dictionary audio or third party human recordings are fetched.",
    loadingAudio: "Loading",
    know: "Know",
    unknown: "Do not know",
    unknownReveal: "Meaning revealed. Press 0 again to flip",
    unknownConfirm: "Flip card",
    next: "Next word",
    reset: "Reset pack",
    saveWord: "Save to my wordbook",
    savedWord: "saved to my wordbook",
    stage: "Memory stage",
    due: "Due now",
    newWord: "New word",
    nextReview: "Next review",
    learned: "Known",
    review: "Need review",
    untouched: "New",
    correct: "Correct",
    wrong: "Wrong",
    arranged: "Review scheduled",
    realAudio: "JinMing Lab US Voice",
    fallbackAudio: "JinMing Lab US Voice",
    unsupported: "Audio is not supported in this browser",
    shortcutsTitle: "Shortcuts",
    shortcutChoices: "Choice mode: 1 2 3 4",
    shortcutAudio: "P or Space audio",
    shortcutKnow: "Q know",
    shortcutUnknown: "0 do not know",
    shortcutNext: "Enter next",
    shortcutSpelling: "S spelling",
    shortcutReveal: "W meaning · 2 phonetic · 3 roots · 4 example",
    hotkeysLead: "Fast keys",
    modeTitle: "Practice mode",
    choiceMode: "Four choice",
    freeMode: "Free recall",
    spellingMode: "Typing spelling",
    revealTitle: "Reveal controls",
    hideDetails: "Hide",
    showMeaning: "Meaning",
    showPhonetic: "Phonetic",
    showRoots: "Roots",
    showExample: "Example",
    showAll: "Show all",
    freePrompt: "Look at the word first. Reveal only what you need then mark know or do not know.",
    desktopMobile: "Desktop and mobile friendly",
    spellingPrompt: "Listen and type the English word. Wrong spelling stays on this word and plays audio again.",
    spellingPlaceholder: "Type the word",
    spellingSubmit: "Check spelling",
    spellingCorrect: "Spelling passed",
    spellingWrong: "Wrong spelling. Listen again and type it once more.",
    timerLabel: "12 second limit",
    timeout: "Time out. Counted wrong.",
    timeoutNote: "Answer first within 12 seconds then read the note.",
    sessionComplete: "This set is done for now",
    sessionCompleteBody: "Known words moved into old review and will return only when your personal curve says they are due.",
    nextDue: "Next old-word review",
    personalCurve: "Personal curve",
  },
  zh: {
    eyebrow: "词汇训练",
    title: "单词四选一记忆训练",
    subtitle: "选择释义 判断认识不认识 播放发音 并用艾宾浩斯遗忘曲线在本机安排复习",
    question: "选择最接近的意思",
    pronunciation: "美音发音",
    audioPolicy: "JinMing Lab Memory Voice 会优先调用浏览器里的 en-US 美音 正常音 慢速强化 拼写回声 最后巩固 不抓取第三方词典音频 不使用真人录音素材",
    loadingAudio: "加载中",
    know: "认识",
    unknown: "不认识",
    unknownReveal: "释义已显示 再按 0 翻卡",
    unknownConfirm: "翻卡",
    next: "下一个",
    reset: "重置本包",
    saveWord: "加入我的词书",
    savedWord: "已加入我的词书",
    stage: "记忆阶段",
    due: "现在复习",
    newWord: "新词",
    nextReview: "下次复习",
    learned: "已认识",
    review: "待复习",
    untouched: "新词",
    correct: "答对",
    wrong: "答错",
    arranged: "已安排复习",
    realAudio: "JinMing Lab 美音发音",
    fallbackAudio: "JinMing Lab 美音发音",
    unsupported: "当前浏览器不支持发音",
    shortcutsTitle: "快捷键",
    shortcutChoices: "四选一模式：1 2 3 4",
    shortcutAudio: "P 或空格 发音",
    shortcutKnow: "Q 认识",
    shortcutUnknown: "0 不认识",
    shortcutNext: "Enter 下一个",
    shortcutSpelling: "S 拼写",
    shortcutReveal: "W 释义 · 2 音标 · 3 词根 · 4 例句",
    hotkeysLead: "常用快捷键",
    modeTitle: "背词模式",
    choiceMode: "四选一",
    freeMode: "自由背",
    spellingMode: "打字拼写",
    revealTitle: "显示控制",
    hideDetails: "隐藏",
    showMeaning: "释义",
    showPhonetic: "音标",
    showRoots: "词根",
    showExample: "例句",
    showAll: "全看",
    freePrompt: "先只看单词 需要什么再点开什么 然后标记认识或不认识",
    desktopMobile: "手机电脑双端友好",
    spellingPrompt: "听发音打出英文单词 拼错不过关 并自动再发一次音",
    spellingPlaceholder: "输入英文拼写",
    spellingSubmit: "检查拼写",
    spellingCorrect: "拼写过关",
    spellingWrong: "拼写不对 再听一次继续打",
    timerLabel: "12 秒限时",
    timeout: "超时 已算错",
    timeoutNote: "12 秒内先答 答完再看注释",
    sessionComplete: "这组词本轮背完了",
    sessionCompleteBody: "认识的词已经进入旧词复习区，不会再当新词反复出现；到你的个人遗忘曲线时间才会回来。",
    nextDue: "下次旧词复习",
    personalCurve: "个人曲线",
  },
} as const;

const rootHints = [
  { pattern: /^un/i, label: "un-", zh: "否定 反向", en: "not reverse" },
  { pattern: /^in/i, label: "in-", zh: "进入 内在 或否定", en: "in into or not" },
  { pattern: /^im/i, label: "im-", zh: "否定 或进入", en: "not or into" },
  { pattern: /^pre/i, label: "pre-", zh: "之前 预先", en: "before" },
  { pattern: /^sub/i, label: "sub-", zh: "在下 次级", en: "under below" },
  { pattern: /^con|^com/i, label: "con-/com-", zh: "共同 一起", en: "together" },
  { pattern: /^inter/i, label: "inter-", zh: "之间 相互", en: "between" },
  { pattern: /^trans/i, label: "trans-", zh: "穿过 转变", en: "across change" },
  { pattern: /tion$|sion$/i, label: "-tion/-sion", zh: "名词后缀 行为或结果", en: "noun action or result" },
  { pattern: /ment$/i, label: "-ment", zh: "名词后缀 结果或状态", en: "noun result or state" },
  { pattern: /able$|ible$/i, label: "-able/-ible", zh: "能够 被动可能", en: "able to be" },
  { pattern: /ive$/i, label: "-ive", zh: "形容词后缀 有某种倾向", en: "adjective tendency" },
  { pattern: /ity$/i, label: "-ity", zh: "名词后缀 性质 状态", en: "noun quality" },
];

function storageKey(packSlug: string) {
  return `vantaapi-vocabulary-review-${packSlug}`;
}

function readProgress(packSlug: string): ReviewProgress {
  if (typeof window === "undefined") return {};

  try {
    const raw = window.localStorage.getItem(storageKey(packSlug));
    if (!raw) return {};
    const parsed = JSON.parse(raw) as ReviewProgress;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function persistProgress(packSlug: string, progress: ReviewProgress) {
  try {
    window.localStorage.setItem(storageKey(packSlug), JSON.stringify(progress));
  } catch {
    // Local storage can be blocked in private browser modes.
  }
}

function wordMeaning(word: ExamVocabularyWord, language: SiteLanguage) {
  return language === "zh" ? word.meaningZh : word.meaningEn;
}

function wordNote(word: ExamVocabularyWord, language: SiteLanguage) {
  return language === "zh"
    ? word.examNote
    : `Use ${word.word} with ${word.collocation}. Example ${word.sentence}`;
}

function getRootHints(word: string, language: SiteLanguage) {
  return rootHints
    .filter((item) => item.pattern.test(word))
    .map((item) => `${item.label} ${language === "zh" ? item.zh : item.en}`);
}

function buildChoices(words: ExamVocabularyWord[], index: number, language: SiteLanguage) {
  if (words.length === 0) return [];

  const offsets = [0, 1, 5, 11, 17, 23];
  const picked: ExamVocabularyWord[] = [];

  offsets.forEach((offset) => {
    const candidate = words[(index + offset) % words.length];
    if (!picked.some((item) => item.word === candidate.word)) picked.push(candidate);
  });

  words.forEach((candidate) => {
    if (picked.length < 4 && !picked.some((item) => item.word === candidate.word)) picked.push(candidate);
  });

  const four = picked.slice(0, 4);
  const rotation = index % four.length;
  return [...four.slice(rotation), ...four.slice(0, rotation)].map((word) => ({
    word: word.word,
    meaning: wordMeaning(word, language),
  }));
}

function formatRelativeTime(timestamp: number, language: SiteLanguage) {
  const diff = timestamp - Date.now();
  if (diff <= 0) return copy[language].due;

  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (diff < hour) {
    const value = Math.max(1, Math.round(diff / minute));
    return language === "zh" ? `${value} 分钟后` : `in ${value} min`;
  }

  if (diff < day) {
    const value = Math.max(1, Math.round(diff / hour));
    return language === "zh" ? `${value} 小时后` : `in ${value} h`;
  }

  const value = Math.max(1, Math.round(diff / day));
  return language === "zh" ? `${value} 天后` : `in ${value} d`;
}

function nextRecord(record: ReviewRecord | undefined, knows: boolean) {
  const now = Date.now();
  const stage = knows ? Math.min((record?.stage ?? -1) + 1, reviewIntervals.length - 1) : 0;
  const previousEase = record?.ease ?? 1;
  const ease = knows ? Math.min(previousEase + 0.12, 2.2) : Math.max(previousEase - 0.25, 0.55);
  const wrongCount = (record?.wrong ?? 0) + (knows ? 0 : 1);
  const wrongPressure = knows ? 1 : 1 + Math.min(wrongCount, 8) * 0.45;
  const intervalMs = Math.max(30 * 1000, Math.round((reviewIntervals[stage].ms * ease) / wrongPressure));
  return {
    status: knows ? "known" : "unknown",
    stage,
    ease,
    nextAt: now + intervalMs,
    seen: (record?.seen ?? 0) + 1,
    correct: (record?.correct ?? 0) + (knows ? 1 : 0),
    wrong: (record?.wrong ?? 0) + (knows ? 0 : 1),
    updatedAt: now,
  } satisfies ReviewRecord;
}

function isReviewDue(record: ReviewRecord) {
  return record.nextAt <= Date.now() || record.status === "unknown";
}

function normalizeSpelling(value: string) {
  return value.trim().replace(/\s+/g, " ").toLowerCase();
}

function maskedSpelling(word: string) {
  return word.replace(/[A-Za-z]/g, "•");
}

export default function VocabularyTrainer({
  packSlug,
  words,
  language,
  packMeta,
}: {
  packSlug: string;
  words: ExamVocabularyWord[];
  language: SiteLanguage;
  packMeta?: Pick<ExamVocabularyPack, "slug" | "title" | "shortTitle" | "targetCount" | "level">;
}) {
  const t = copy[language];
  const [isVocabularyReady, setIsVocabularyReady] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState<ReviewProgress>({});
  const [selectedChoice, setSelectedChoice] = useState<SelectedChoice | null>(null);
  const [message, setMessage] = useState("");
  const [audioLoading, setAudioLoading] = useState(false);
  const [practiceMode, setPracticeMode] = useState<PracticeMode>("free");
  const [spellingDraft, setSpellingDraft] = useState("");
  const [timeLeft, setTimeLeft] = useState(REVIEW_SECONDS);
  const [pendingUnknownWord, setPendingUnknownWord] = useState("");
  const [detailMode, setDetailMode] = useState<DetailMode>("hidden");
  const [customDetails, setCustomDetails] = useState<Record<DetailKey, boolean>>({
    meaning: false,
    phonetic: false,
    roots: false,
    example: false,
  });

  useEffect(() => {
    const readyTimer = window.setTimeout(() => setIsVocabularyReady(true), 0);
    const timer = window.setTimeout(() => {
      setProgress(readProgress(packSlug));
    }, 0);

    return () => {
      window.clearTimeout(readyTimer);
      window.clearTimeout(timer);
    };
  }, [packSlug]);

  const trainingWords = useMemo(() => {
    if (!isVocabularyReady || !packMeta) return words;
    return getExpandedVocabularyWords({
      ...packMeta,
      route: `/english/vocabulary/${packMeta.slug}`,
      focus: [],
      priorityWords: words,
    });
  }, [isVocabularyReady, packMeta, words]);

  const sessionWords = useMemo(() => {
    const oldDue = trainingWords.filter((word) => {
      const record = progress[word.word];
      return record && isReviewDue(record);
    });
    const fresh = trainingWords.filter((word) => !progress[word.word]);
    return [...oldDue, ...fresh];
  }, [progress, trainingWords]);
  const nextScheduledWord = useMemo(() => {
    return trainingWords
      .filter((word) => progress[word.word]?.nextAt)
      .sort((left, right) => (progress[left.word]?.nextAt ?? 0) - (progress[right.word]?.nextAt ?? 0))[0];
  }, [progress, trainingWords]);
  const isSessionComplete = trainingWords.length > 0 && sessionWords.length === 0;
  const safeIndex = sessionWords.length > 0 ? currentIndex % sessionWords.length : 0;
  const currentWord = sessionWords[safeIndex] ?? nextScheduledWord ?? trainingWords[0] ?? emptyWord;
  const isCustomPack = packSlug === CUSTOM_WORDBOOK_SLUG;
  const roots = useMemo(() => getRootHints(currentWord.word, language), [currentWord.word, language]);
  const visibleDetails = {
    meaning: detailMode === "meaning" || detailMode === "all" || (detailMode === "custom" && customDetails.meaning),
    phonetic: Boolean(currentWord.phonetic) && (detailMode === "all" || (detailMode === "custom" && customDetails.phonetic)),
    roots: roots.length > 0 && (detailMode === "all" || (detailMode === "custom" && customDetails.roots)),
    example: detailMode === "all" || (detailMode === "custom" && customDetails.example),
  };
  const currentRecord = progress[currentWord.word];
  const activeChoice = selectedChoice?.word === currentWord.word ? selectedChoice : null;
  const isUnknownPreview = pendingUnknownWord === currentWord.word;
  const choiceIndex = Math.max(trainingWords.findIndex((word) => word.word === currentWord.word), 0);
  const choices = useMemo(() => buildChoices(trainingWords, choiceIndex, language), [choiceIndex, language, trainingWords]);
  const coachContext = useMemo(() => ({
    pack: packSlug,
    interfaceLanguage: language,
    word: currentWord.word,
    phonetic: currentWord.phonetic || "",
    meaningZh: currentWord.meaningZh,
    meaningEn: currentWord.meaningEn,
    collocation: currentWord.collocation,
    sentence: currentWord.sentence,
    examNote: currentWord.examNote,
    memoryStage: currentRecord?.stage ?? "new",
  }), [currentRecord?.stage, currentWord.collocation, currentWord.examNote, currentWord.meaningEn, currentWord.meaningZh, currentWord.phonetic, currentWord.sentence, currentWord.word, language, packSlug]);

  const stats = useMemo(() => {
    const records = trainingWords.map((word) => progress[word.word]).filter(Boolean);
    const known = records.filter((record) => record.status === "known").length;
    const due = records.filter((record) => isReviewDue(record)).length;
    return {
      known,
      due,
      untouched: Math.max(trainingWords.length - records.length, 0),
      active: sessionWords.length,
      percent: Math.round((known / Math.max(trainingWords.length, 1)) * 100),
    };
  }, [progress, sessionWords.length, trainingWords]);

  const writeRecord = useCallback((word: ExamVocabularyWord, knows: boolean, customMessage?: string) => {
    const record = nextRecord(progress[word.word], knows);
    const nextProgress = { ...progress, [word.word]: record };
    setProgress(nextProgress);
    persistProgress(packSlug, nextProgress);
    if (!knows) recordUnifiedWrongWord(word, "memory");
    recordLocalActivity({
      id: `english:${packSlug}:${word.word}`,
      title: `${word.word} vocabulary`,
      href: `/english/vocabulary/${packSlug}${language === "zh" ? "?lang=zh" : ""}`,
      kind: "english",
      completed: true,
      correct: knows,
    });
    setMessage(customMessage ?? `${word.word} ${t.arranged} ${formatRelativeTime(record.nextAt, language)}`);
  }, [language, packSlug, progress, t.arranged]);

  const advanceAfterAnswer = useCallback(() => {
    setSelectedChoice(null);
    setPendingUnknownWord("");
    setSpellingDraft("");
    setTimeLeft(REVIEW_SECONDS);
    setCurrentIndex((index) => (index + 1) % Math.max(sessionWords.length, 1));
  }, [sessionWords.length]);

  const pronounce = useCallback(async (options?: { quiet?: boolean }) => {
    if (typeof window === "undefined") return;

    setAudioLoading(true);
    const spoken = await speakMemoryPronunciation({ text: currentWord.word, kind: "word" });
    if (!spoken) {
      if (!options?.quiet) setMessage(t.unsupported);
      setAudioLoading(false);
      return;
    }
    if (!options?.quiet) setMessage(`${currentWord.word} ${t.fallbackAudio}`);
    setAudioLoading(false);
  }, [currentWord.word, t.fallbackAudio, t.unsupported]);

  const toggleDetail = useCallback((key: DetailKey) => {
    setDetailMode("custom");
    setCustomDetails((current) => ({ ...current, [key]: !current[key] }));
  }, []);

  const setPresetDetails = useCallback((mode: DetailMode) => {
    setDetailMode(mode);
    if (mode !== "custom") {
      setCustomDetails({
        meaning: false,
        phonetic: false,
        roots: false,
        example: false,
      });
    }
  }, []);

  const choose = useCallback((optionWord: string) => {
    if (isSessionComplete) return;
    const correct = optionWord === currentWord.word;
    setSelectedChoice({ word: currentWord.word, optionWord, correct });
    writeRecord(currentWord, correct);
    advanceAfterAnswer();
  }, [advanceAfterAnswer, currentWord, isSessionComplete, writeRecord]);

  const markRecognition = useCallback((knows: boolean) => {
    if (isSessionComplete) return;

    if (!knows && pendingUnknownWord !== currentWord.word) {
      setPendingUnknownWord(currentWord.word);
      setPresetDetails("all");
      setTimeLeft(REVIEW_SECONDS);
      setMessage(t.unknownReveal);
      return;
    }

    writeRecord(currentWord, knows);
    advanceAfterAnswer();
  }, [advanceAfterAnswer, currentWord, isSessionComplete, pendingUnknownWord, setPresetDetails, t.unknownReveal, writeRecord]);

  const failByTimeout = useCallback(() => {
    if (practiceMode === "spelling" || isSessionComplete) return;
    setSelectedChoice({ word: currentWord.word, optionWord: "__timeout__", correct: false });
    setPresetDetails("all");
    writeRecord(
      currentWord,
      false,
      `${t.timeout} ${currentWord.word} ${wordMeaning(currentWord, language)}. ${wordNote(currentWord, language)} ${t.timeoutNote}`,
    );
  }, [currentWord, isSessionComplete, language, practiceMode, setPresetDetails, t.timeout, t.timeoutNote, writeRecord]);

  const submitSpelling = useCallback(() => {
    if (isSessionComplete) return;
    const correct = normalizeSpelling(spellingDraft) === normalizeSpelling(currentWord.word);

    if (correct) {
      writeRecord(currentWord, true, `${currentWord.word} ${t.spellingCorrect}`);
      advanceAfterAnswer();
      return;
    }

    const wrongMessage = `${t.spellingWrong} ${maskedSpelling(currentWord.word)}`;
    writeRecord(currentWord, false, wrongMessage);
    setSelectedChoice({ word: currentWord.word, optionWord: "__spelling__", correct: false });
    void pronounce({ quiet: true });
    setMessage(wrongMessage);
  }, [advanceAfterAnswer, currentWord, isSessionComplete, pronounce, spellingDraft, t.spellingCorrect, t.spellingWrong, writeRecord]);

  const goNext = useCallback(() => {
    setCurrentIndex((index) => (index + 1) % Math.max(sessionWords.length, 1));
    setSelectedChoice(null);
    setPendingUnknownWord("");
    setSpellingDraft("");
    setTimeLeft(REVIEW_SECONDS);
    setMessage("");
  }, [sessionWords.length]);

  const saveCurrentWord = useCallback(() => {
    upsertCustomWord(currentWord, {
      tags: [packSlug, "saved"],
      source: `${packSlug} trainer`,
    });
    setMessage(`${currentWord.word} ${t.savedWord}`);
  }, [currentWord, packSlug, t.savedWord]);

  function resetPack() {
    setProgress({});
    setSelectedChoice(null);
    setPendingUnknownWord("");
    setSpellingDraft("");
    setTimeLeft(REVIEW_SECONDS);
    setMessage("");
    window.localStorage.removeItem(storageKey(packSlug));
  }

  useEffect(() => {
    if (practiceMode === "spelling" || activeChoice || isUnknownPreview) {
      const reset = window.setTimeout(() => setTimeLeft(REVIEW_SECONDS), 0);
      return () => window.clearTimeout(reset);
    }

    const deadline = Date.now() + REVIEW_SECONDS * 1000;
    const reset = window.setTimeout(() => setTimeLeft(REVIEW_SECONDS), 0);

    const tick = window.setInterval(() => {
      setTimeLeft(Math.max(0, Math.ceil((deadline - Date.now()) / 1000)));
    }, 200);
    const timeout = window.setTimeout(failByTimeout, REVIEW_SECONDS * 1000);

    return () => {
      window.clearTimeout(reset);
      window.clearInterval(tick);
      window.clearTimeout(timeout);
    };
  }, [activeChoice, currentWord.word, failByTimeout, isUnknownPreview, practiceMode]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      if (target && ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)) return;
      if (event.altKey || event.ctrlKey || event.metaKey) return;
      if (isSessionComplete) return;

      const key = event.key.toLowerCase();
      const choiceIndex = Number(key) - 1;

      if (practiceMode === "choice" && choiceIndex >= 0 && choiceIndex < 4 && choices[choiceIndex]) {
        event.preventDefault();
        choose(choices[choiceIndex].word);
        return;
      }

      if (key === "p" || event.key === " ") {
        event.preventDefault();
        void pronounce();
        return;
      }

      if (key === "s") {
        event.preventDefault();
        setPracticeMode("spelling");
        setSpellingDraft("");
        void pronounce();
        return;
      }

      if (practiceMode !== "spelling" && (key === "q" || key === "k")) {
        event.preventDefault();
        markRecognition(true);
        return;
      }

      if (practiceMode !== "spelling" && (event.key === "0" || key === "u")) {
        event.preventDefault();
        markRecognition(false);
        return;
      }

      if (practiceMode !== "spelling" && practiceMode !== "choice" && key === "w") {
        event.preventDefault();
        toggleDetail("meaning");
        return;
      }

      if (practiceMode !== "spelling" && practiceMode !== "choice" && key === "2") {
        event.preventDefault();
        toggleDetail("phonetic");
        return;
      }

      if (practiceMode !== "spelling" && practiceMode !== "choice" && key === "3") {
        event.preventDefault();
        toggleDetail("roots");
        return;
      }

      if (practiceMode !== "spelling" && practiceMode !== "choice" && key === "4") {
        event.preventDefault();
        toggleDetail("example");
        return;
      }

      if (key === "enter" || key === "arrowright") {
        event.preventDefault();
        goNext();
        return;
      }

      if (key === "m") {
        event.preventDefault();
        toggleDetail("meaning");
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [choices, choose, goNext, isSessionComplete, markRecognition, practiceMode, pronounce, toggleDetail]);

  return (
    <section className="vocab-trainer mt-6">
      <div className="vocab-trainer-main">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="eyebrow">{t.eyebrow}</p>
            <h2 className="mt-2 text-3xl font-semibold">{t.title}</h2>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-[color:var(--muted)]">{t.subtitle}</p>
            <div className="shortcut-strip mt-4" aria-label={t.shortcutsTitle}>
              <span className="shortcut-label">{t.shortcutsTitle}</span>
              <span className="shortcut-key">{t.shortcutChoices}</span>
              <span className="shortcut-key">{t.shortcutAudio}</span>
              <span className="shortcut-key">{t.shortcutKnow}</span>
              <span className="shortcut-key">{t.shortcutUnknown}</span>
              <span className="shortcut-key shortcut-key-strong">{t.shortcutReveal}</span>
              <span className="shortcut-key">{t.shortcutSpelling}</span>
              <span className="shortcut-key">{t.shortcutNext}</span>
              <span className="shortcut-key">{t.desktopMobile}</span>
            </div>
          </div>
          <div className="learning-head-actions">
            <LearningFullscreenButton language={language} />
            <div className="vocab-trainer-score">
              <span>{stats.percent}</span>
              <small>%</small>
            </div>
          </div>
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
          <div className="vocab-practice-surface">
            <div className="vocab-mode-bar" aria-label={t.modeTitle}>
              <span>{t.modeTitle}</span>
              <button
                type="button"
                className={practiceMode === "choice" ? "active" : ""}
                onClick={() => setPracticeMode("choice")}
              >
                {t.choiceMode}
              </button>
              <button
                type="button"
                className={practiceMode === "free" ? "active" : ""}
                onClick={() => setPracticeMode("free")}
              >
                {t.freeMode}
              </button>
              <button
                type="button"
                className={practiceMode === "spelling" ? "active" : ""}
                onClick={() => {
                  setPracticeMode("spelling");
                  setSpellingDraft("");
                  void pronounce();
                }}
              >
                {t.spellingMode}
              </button>
            </div>
            {practiceMode !== "spelling" ? (
              <div className={`vocab-timer ${timeLeft <= 2 ? "urgent" : ""}`} aria-label={t.timerLabel}>
                <span>{t.timerLabel}</span>
                <strong>{timeLeft}s</strong>
                <i style={{ width: `${Math.max(0, Math.min(100, (timeLeft / REVIEW_SECONDS) * 100))}%` }} />
              </div>
            ) : null}
            {practiceMode !== "spelling" ? (
              <div className="vocab-hotkey-panel" aria-label={t.shortcutsTitle}>
                <span>{t.hotkeysLead}</span>
                <kbd>Q</kbd><strong>{t.know}</strong>
                <kbd>0</kbd><strong>{t.unknown}</strong>
                <kbd>W</kbd><strong>{t.showMeaning}</strong>
                <kbd>2</kbd><strong>{t.showPhonetic}</strong>
                <kbd>3</kbd><strong>{t.showRoots}</strong>
                <kbd>4</kbd><strong>{t.showExample}</strong>
              </div>
            ) : null}

            {isSessionComplete ? (
              <div className="vocab-session-complete">
                <p className="eyebrow">{t.personalCurve}</p>
                <h3>{t.sessionComplete}</h3>
                <p>{t.sessionCompleteBody}</p>
                <div>
                  <span>{t.nextDue}</span>
                  <strong>{currentRecord ? formatRelativeTime(currentRecord.nextAt, language) : t.newWord}</strong>
                </div>
              </div>
            ) : (
              <>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="eyebrow">
                  {practiceMode === "choice" ? t.question : practiceMode === "spelling" ? t.spellingMode : t.freeMode}
                </p>
                <h3 className="mt-2 text-3xl font-semibold tracking-normal sm:text-4xl">
                  {practiceMode === "spelling" ? maskedSpelling(currentWord.word) : currentWord.word}
                </h3>
              </div>
              <button type="button" className="vocab-ghost-button" onClick={() => void pronounce()}>
                {audioLoading ? t.loadingAudio : t.pronunciation}
              </button>
            </div>
            <p className="audio-policy-note mt-3">{t.audioPolicy}</p>

            <div className="vocab-reveal-bar" aria-label={t.revealTitle}>
              <span>{t.revealTitle}</span>
              <button type="button" className={detailMode === "hidden" ? "active" : ""} onClick={() => setPresetDetails("hidden")}>{t.hideDetails}</button>
              <button type="button" className={detailMode === "meaning" ? "active" : ""} onClick={() => setPresetDetails("meaning")}>{t.showMeaning}</button>
              <button type="button" className={detailMode === "all" ? "active" : ""} onClick={() => setPresetDetails("all")}>{t.showAll}</button>
              {currentWord.phonetic ? <button type="button" className={visibleDetails.phonetic ? "active" : ""} onClick={() => toggleDetail("phonetic")}>{t.showPhonetic}</button> : null}
              {roots.length > 0 ? <button type="button" className={visibleDetails.roots ? "active" : ""} onClick={() => toggleDetail("roots")}>{t.showRoots}</button> : null}
              <button type="button" className={visibleDetails.example ? "active" : ""} onClick={() => toggleDetail("example")}>{t.showExample}</button>
            </div>

            {(visibleDetails.meaning || visibleDetails.phonetic || visibleDetails.roots || visibleDetails.example) ? (
              <div className="vocab-detail-grid">
                {visibleDetails.meaning ? (
                  <article>
                    <span>{t.showMeaning}</span>
                    <strong>{wordMeaning(currentWord, language)}</strong>
                  </article>
                ) : null}
                {visibleDetails.phonetic ? (
                  <article>
                    <span>{t.showPhonetic}</span>
                    <strong>{currentWord.phonetic}</strong>
                  </article>
                ) : null}
                {visibleDetails.roots ? (
                  <article>
                    <span>{t.showRoots}</span>
                    <strong>{roots.join("  ")}</strong>
                  </article>
                ) : null}
                {visibleDetails.example ? (
                  <article>
                    <span>{t.showExample}</span>
                    <strong>{currentWord.sentence}</strong>
                  </article>
                ) : null}
              </div>
            ) : null}

            {practiceMode === "choice" ? (
              <div className="mt-5 grid gap-2 md:grid-cols-2">
                {choices.map((choice) => {
                  const isCorrectChoice = choice.word === currentWord.word;
                  const isSelected = activeChoice?.optionWord === choice.word;
                  const stateClass = activeChoice
                    ? isCorrectChoice
                      ? "vocab-choice-correct"
                      : isSelected
                        ? "vocab-choice-wrong"
                        : ""
                    : "";

                  return (
                    <button
                      key={choice.word}
                      type="button"
                      className={`vocab-choice-button ${stateClass}`}
                      onClick={() => choose(choice.word)}
                    >
                      {choice.meaning}
                    </button>
                  );
                })}
              </div>
            ) : practiceMode === "spelling" ? (
              <form
                className="vocab-spelling-card"
                onSubmit={(event) => {
                  event.preventDefault();
                  submitSpelling();
                }}
              >
                <p>{t.spellingPrompt}</p>
                <div className="vocab-spelling-row">
                  <input
                    value={spellingDraft}
                    onChange={(event) => setSpellingDraft(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        submitSpelling();
                      }
                    }}
                    autoCapitalize="none"
                    autoComplete="off"
                    autoCorrect="off"
                    spellCheck={false}
                    placeholder={t.spellingPlaceholder}
                  />
                  <button type="submit" className="dense-action-primary">{t.spellingSubmit}</button>
                </div>
              </form>
            ) : (
              <div className="vocab-free-card">
                {t.freePrompt}
              </div>
            )}

            <div className="vocab-action-dock">
              {practiceMode !== "spelling" ? (
                <>
                  <button
                    type="button"
                    className="dense-action-primary"
                    onClick={() => markRecognition(true)}
                  >
                    {t.know} · Q
                  </button>
                  <button
                    type="button"
                    className="dense-action"
                    onClick={() => markRecognition(false)}
                  >
                    {isUnknownPreview ? t.unknownConfirm : t.unknown} · 0
                  </button>
                </>
              ) : null}
              {!isCustomPack ? (
                <button type="button" className="dense-action" onClick={saveCurrentWord}>{t.saveWord}</button>
              ) : null}
              <button type="button" className="dense-action" onClick={goNext}>{t.next}</button>
              <button type="button" className="dense-action" onClick={resetPack}>{t.reset}</button>
            </div>

            {activeChoice ? (
              <p className="mt-4 text-sm font-semibold text-[color:var(--accent-link)]">
                {activeChoice.correct ? t.correct : t.wrong}
              </p>
            ) : null}
            {message ? <p className="mt-2 text-sm text-[color:var(--muted)]">{message}</p> : null}
              </>
            )}
          </div>

          <aside className="vocab-memory-surface">
            <p className="eyebrow">Ebbinghaus</p>
            <h3 className="mt-2 text-xl font-semibold">{t.stage}</h3>
            <p className="mt-2 text-sm leading-6 text-[color:var(--muted)]">
              {currentRecord ? `${t.nextReview} ${formatRelativeTime(currentRecord.nextAt, language)}` : t.newWord}
            </p>
            <div className="mt-4 grid grid-cols-3 gap-2">
              {reviewIntervals.map((interval, index) => (
                <span
                  key={interval.labelEn}
                  className={`memory-step ${currentRecord && index <= currentRecord.stage ? "memory-step-active" : ""} ${currentRecord && isReviewDue(currentRecord) && index === currentRecord.stage ? "memory-step-due" : ""}`}
                >
                  {language === "zh" ? interval.labelZh : interval.labelEn}
                </span>
              ))}
            </div>

            <div className="mt-5 grid gap-2 text-sm">
              <div className="vocab-stat-row"><span>{t.learned}</span><strong>{stats.known}</strong></div>
              <div className="vocab-stat-row"><span>{t.review}</span><strong>{stats.due}</strong></div>
              <div className="vocab-stat-row"><span>{t.untouched}</span><strong>{stats.untouched}</strong></div>
            </div>
            <div className="trainer-meter mt-4">
              <span style={{ width: `${stats.percent}%` }} />
            </div>
          </aside>
        </div>

        <div className="mt-4">
          <AICoachPanel
            mode="english"
            title={language === "zh" ? "英语专属陪练" : "English only companion"}
            subtitle={language === "zh" ? "只围绕当前单词 例句 搭配 考试用法来练" : "Built around this word sentence collocation and exam use"}
            placeholder={language === "zh" ? "让它帮你造句 记忆 翻译 长难句 或考试用法" : "Ask for a memory hook sentence grammar check or exam usage"}
            quickPrompts={language === "zh" ? ["给我记忆钩子", "造 3 个考试句", "讲清搭配", "一分钟小测"] : ["Memory hook", "3 exam sentences", "Explain collocation", "One minute quiz"]}
            context={coachContext}
            language={language}
          />
        </div>
      </div>
    </section>
  );
}
