'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { playNaturalVoice } from '@/lib/natural-voice';
import type { ExamVocabularyPack, ExamVocabularyWord } from '@/lib/exam-content';
import { getExpandedVocabularyWords } from '@/lib/expanded-vocabulary-bank';
import { localizedHref, type InterfaceLanguage } from '@/lib/language';
import {
  makeCustomWord,
  readCustomWords,
  writeCustomWords,
  type CustomVocabularyWord,
} from '@/lib/custom-wordbook';
import { readUnifiedWrongWords, recordUnifiedWrongWord, type UnifiedWrongWord } from '@/lib/unified-wrong-words';

type WordWithMeta = ExamVocabularyWord & {
  source: string;
  level: string;
};

export type WordTypingPack = {
  slug: string;
  title: string;
  shortTitle: string;
  targetCount: number;
  level: string;
  words: WordWithMeta[];
};

type WordResult = {
  word: string;
  correct: boolean;
  timeSpent: number;
};

type ProgressTheme = "blue" | "mint" | "rose" | "ink";

type SavedWordProgress = {
  currentIndex: number;
  results: WordResult[];
  theme: ProgressTheme;
  savedAt: string;
};

type CustomDraft = {
  word: string;
  meaning: string;
  sentence: string;
  tags: string;
};

const ALL_PACK_SLUG = "all-exam-words";
const CUSTOM_PACK_SLUG = "custom-wordbook";
const VIBRATION_SETTING_KEY = "word-typing-vibration-enabled";
const TODAY_WORD_COUNT = 50;
const DEFAULT_PACK_SLUGS = ["daily-english-core", "middle-school-core"] as const;

const progressThemes: { id: ProgressTheme; label: string }[] = [
  { id: "blue", label: "蓝" },
  { id: "mint", label: "绿" },
  { id: "rose", label: "粉" },
  { id: "ink", label: "黑" },
];

const initialCustomDraft: CustomDraft = {
  word: "",
  meaning: "",
  sentence: "",
  tags: "",
};

function customToTypingWord(word: CustomVocabularyWord): WordWithMeta {
  return {
    ...word,
    source: "自制词库",
    level: word.tags.slice(0, 2).join(" / ") || "Custom",
  };
}

function makePackForExpansion(pack: WordTypingPack): ExamVocabularyPack {
  return {
    slug: pack.slug,
    title: pack.title,
    shortTitle: pack.shortTitle,
    targetCount: pack.targetCount,
    level: pack.level,
    route: `/english/vocabulary/${pack.slug}`,
    focus: [],
    priorityWords: pack.words,
  };
}

function withPackMeta(words: ExamVocabularyWord[], pack: WordTypingPack): WordWithMeta[] {
  return words.map((word) => ({
    ...word,
    source: word.generated ? "扩展拼写练习" : pack.shortTitle,
    level: word.generated ? "Generated" : pack.level,
  }));
}

function getDefaultTypingPackSlug(packs: WordTypingPack[]) {
  return DEFAULT_PACK_SLUGS.find((slug) => packs.some((pack) => pack.slug === slug)) ?? packs[0]?.slug ?? CUSTOM_PACK_SLUG;
}

function getPackOptionMeta(pack: WordTypingPack) {
  if (pack.slug === CUSTOM_PACK_SLUG) return `Custom · ${pack.words.length.toLocaleString("zh-CN")} 词`;
  if (pack.slug === ALL_PACK_SLUG) return `All · 精选 ${pack.targetCount.toLocaleString("zh-CN")} 词`;
  return `${pack.level} · 精选 ${pack.words.length.toLocaleString("zh-CN")} 词 · 可选扩展拼写词`;
}

function parseBulkWords(text: string) {
  return text
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [word, meaning, sentence, tags] = line.split(/[,\t，|]/).map((item) => item.trim());
      return makeCustomWord({
        word: word || "",
        meaningZh: meaning || "",
        meaningEn: meaning || "",
        sentence: sentence || "",
        tags: tags || "自制",
        source: "word typing",
      });
    })
    .filter((word): word is CustomVocabularyWord => Boolean(word));
}

export default function WordTypingTrainer({
  packs,
  language,
}: {
  packs: WordTypingPack[];
  language: InterfaceLanguage;
}) {
  const defaultPackSlug = getDefaultTypingPackSlug(packs);
  const [selectedPackSlug, setSelectedPackSlug] = useState(defaultPackSlug);
  const [isTodayPractice, setIsTodayPractice] = useState(true);
  const [includeGeneratedWords, setIncludeGeneratedWords] = useState(false);
  const [customWords, setCustomWords] = useState<CustomVocabularyWord[]>([]);
  const [customDraft, setCustomDraft] = useState<CustomDraft>(initialCustomDraft);
  const [customBulkText, setCustomBulkText] = useState("");
  const [customMessage, setCustomMessage] = useState("自制词库保存在当前浏览器");
  const [startDraft, setStartDraft] = useState("1");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [input, setInput] = useState('');
  const [results, setResults] = useState<WordResult[]>([]);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [showMeaning, setShowMeaning] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [errorShake, setErrorShake] = useState(false);
  const [successPulse, setSuccessPulse] = useState(false);
  const [isVibrationEnabled, setIsVibrationEnabled] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [progressTheme, setProgressTheme] = useState<ProgressTheme>("blue");
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState("自动保存开启");
  const [hydratedKey, setHydratedKey] = useState("");
  const [isVocabularyReady, setIsVocabularyReady] = useState(false);
  const [wrongWordsPreview, setWrongWordsPreview] = useState<UnifiedWrongWord[]>([]);
  const trainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const typingWrongSavedRef = useRef<Set<string>>(new Set());

  const customTypingWords = useMemo(() => customWords.map(customToTypingWord), [customWords]);
  const verifiedPackCount = useMemo(() => packs.reduce((sum, pack) => sum + pack.words.length, 0), [packs]);
  const packOptions = useMemo<WordTypingPack[]>(() => [
    {
      slug: ALL_PACK_SLUG,
      title: "全部精选已校验词",
      shortTitle: "全部精选",
      targetCount: verifiedPackCount,
      level: "All",
      words: [],
    },
    ...packs,
    {
      slug: CUSTOM_PACK_SLUG,
      title: "我的自制题库",
      shortTitle: "自制词库",
      targetCount: customTypingWords.length,
      level: "Custom",
      words: customTypingWords,
    },
  ], [customTypingWords, packs, verifiedPackCount]);

  const selectedPack = packOptions.find((pack) => pack.slug === selectedPackSlug) || packOptions[0];
  const verifiedPracticeWords = useMemo(() => {
    if (selectedPack.slug === ALL_PACK_SLUG) return packs.flatMap((pack) => pack.words);
    return selectedPack.words.filter((word) => !word.generated);
  }, [packs, selectedPack]);
  const fullPracticeWords = useMemo(() => {
    if (!isVocabularyReady) {
      if (selectedPack.slug === ALL_PACK_SLUG) return packs.flatMap((pack) => pack.words);
      return selectedPack.words;
    }
    if (selectedPack.slug === CUSTOM_PACK_SLUG) return selectedPack.words;
    if (!includeGeneratedWords) return verifiedPracticeWords;
    if (selectedPack.slug === ALL_PACK_SLUG) {
      const seen = new Set<string>();
      return packs.flatMap((pack) => withPackMeta(getExpandedVocabularyWords(makePackForExpansion(pack)), pack)).filter((word) => {
        const key = word.word.toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
    }
    return withPackMeta(getExpandedVocabularyWords(makePackForExpansion(selectedPack)), selectedPack);
  }, [includeGeneratedWords, isVocabularyReady, packs, selectedPack, verifiedPracticeWords]);
  const words = useMemo(
    () => isTodayPractice ? verifiedPracticeWords.slice(0, TODAY_WORD_COUNT) : fullPracticeWords,
    [fullPracticeWords, isTodayPractice, verifiedPracticeWords],
  );
  const currentWord = words[currentIndex];
  const progress = words.length > 0 ? ((currentIndex + 1) / words.length) * 100 : 0;
  const correctCount = results.filter((r) => r.correct).length;
  const accuracy = results.length > 0 ? (correctCount / results.length) * 100 : 0;
  const sessionModeKey = isTodayPractice ? "today-50" : includeGeneratedWords ? "with-generated" : "verified";
  const storageKey = `word-typing-progress:${selectedPack.slug}:${sessionModeKey}:${words.length}:${words[0]?.word ?? "start"}:${words[words.length - 1]?.word ?? "end"}`;
  const savedTimeLabel = savedAt ? new Date(savedAt).toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" }) : "尚未保存";
  const isFocusActive = isFullscreen || isFocusMode;
  const activePackTitle = isTodayPractice ? "今日练 50 个" : selectedPack.title;
  const activePackShortTitle = isTodayPractice ? "今日 50" : selectedPack.shortTitle;
  const isTodayShortOfVerifiedWords = isTodayPractice && verifiedPracticeWords.length < TODAY_WORD_COUNT;
  const generatedModeLabel = includeGeneratedWords ? "包含扩展拼写词" : "只练精选词";

  const resetSession = useCallback((message = "自动保存开启") => {
    setCurrentIndex(0);
    setInput('');
    setResults([]);
    setStartTime(null);
    setShowMeaning(false);
    setIsComplete(false);
    setSavedAt(null);
    setSaveMessage(message);
    typingWrongSavedRef.current.clear();
  }, []);

  const persistProgress = useCallback((message = "已保存") => {
    if (typeof window === "undefined" || !words.length) return;
    const nextSavedAt = new Date().toISOString();
    const payload: SavedWordProgress = {
      currentIndex,
      results,
      theme: progressTheme,
      savedAt: nextSavedAt,
    };
    window.localStorage.setItem(storageKey, JSON.stringify(payload));
    setSavedAt(nextSavedAt);
    setSaveMessage(message);
  }, [currentIndex, progressTheme, results, storageKey, words.length]);

  const playPronunciation = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (currentWord) {
      playNaturalVoice(currentWord.word).then((audio) => {
        audioRef.current = audio;
      });
    }
  }, [currentWord]);

  const triggerVibration = useCallback((pattern: VibratePattern = 35) => {
    if (!isVibrationEnabled || typeof navigator === "undefined" || !navigator.vibrate) return;
    navigator.vibrate(pattern);
  }, [isVibrationEnabled]);

  const recordTypingWrong = useCallback((word: WordWithMeta) => {
    const key = word.word.toLowerCase();
    if (typingWrongSavedRef.current.has(key)) return;
    typingWrongSavedRef.current.add(key);
    recordUnifiedWrongWord(word, "typing");
    setWrongWordsPreview(readUnifiedWrongWords());
  }, []);

  useEffect(() => {
    const readyTimer = window.setTimeout(() => setIsVocabularyReady(true), 0);
    const syncCustomWords = () => setCustomWords(readCustomWords());
    syncCustomWords();
    window.addEventListener("storage", syncCustomWords);
    window.addEventListener("vantaapi-custom-wordbook", syncCustomWords);
    return () => {
      window.clearTimeout(readyTimer);
      window.removeEventListener("storage", syncCustomWords);
      window.removeEventListener("vantaapi-custom-wordbook", syncCustomWords);
    };
  }, []);

  useEffect(() => {
    const syncWrongWords = () => setWrongWordsPreview(readUnifiedWrongWords());
    syncWrongWords();
    window.addEventListener("storage", syncWrongWords);
    window.addEventListener("vantaapi-wrong-words", syncWrongWords);
    return () => {
      window.removeEventListener("storage", syncWrongWords);
      window.removeEventListener("vantaapi-wrong-words", syncWrongWords);
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const timer = window.setTimeout(() => {
      setIsVibrationEnabled(window.localStorage.getItem(VIBRATION_SETTING_KEY) !== "off");
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(VIBRATION_SETTING_KEY, isVibrationEnabled ? "on" : "off");
  }, [isVibrationEnabled]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const timer = window.setTimeout(() => {
      resetSession("自动保存开启");
      setHydratedKey("");

      const raw = window.localStorage.getItem(storageKey);
      if (!raw || !words.length) {
        setHydratedKey(storageKey);
        return;
      }

      try {
        const saved = JSON.parse(raw) as Partial<SavedWordProgress>;
        const savedIndex = Number(saved.currentIndex);
        const savedResults = Array.isArray(saved.results) ? saved.results : [];
        const nextResults = savedResults.filter((item): item is WordResult =>
          typeof item?.word === "string" &&
          typeof item.correct === "boolean" &&
          typeof item.timeSpent === "number"
        );
        const nextTheme = progressThemes.some((theme) => theme.id === saved.theme) ? saved.theme as ProgressTheme : "blue";
        const nextSavedAt = typeof saved.savedAt === "string" ? saved.savedAt : null;

        if (Number.isInteger(savedIndex) && savedIndex >= 0 && savedIndex < words.length) {
          setCurrentIndex(savedIndex);
          setResults(nextResults);
          setProgressTheme(nextTheme);
          setSavedAt(nextSavedAt);
          setSaveMessage("已恢复上次进度");
        }
      } catch {
        window.localStorage.removeItem(storageKey);
      } finally {
        setHydratedKey(storageKey);
      }
    }, 0);

    return () => window.clearTimeout(timer);
  }, [resetSession, storageKey, words.length]);

  useEffect(() => {
    if (hydratedKey !== storageKey || typeof window === "undefined" || !words.length) return;
    const timer = window.setTimeout(() => persistProgress("自动保存"), 250);
    return () => window.clearTimeout(timer);
  }, [hydratedKey, persistProgress, storageKey, words.length]);

  useEffect(() => {
    inputRef.current?.focus();
  }, [currentIndex, selectedPackSlug]);

  useEffect(() => {
    if (currentWord) {
      playPronunciation();
    }
  }, [currentWord, playPronunciation]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      const ownsFullscreen = document.fullscreenElement === trainerRef.current;
      setIsFullscreen(ownsFullscreen);
      setIsFocusMode(ownsFullscreen);
      window.setTimeout(() => inputRef.current?.focus(), 50);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const toggleFullscreen = async () => {
    if (isFocusActive) {
      setIsFocusMode(false);
      if (document.fullscreenElement) {
        try {
          await document.exitFullscreen();
        } catch {
          // The fallback focus mode still exits even when the browser blocks native fullscreen.
        }
      }
      window.setTimeout(() => inputRef.current?.focus(), 50);
      return;
    }

    setIsFocusMode(true);
    try {
      if (trainerRef.current?.requestFullscreen) {
        await trainerRef.current.requestFullscreen();
      }
    } catch {
      // Some embedded browsers block native fullscreen; the focus-mode layout still applies.
    } finally {
      window.setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  const selectPack = (slug: string) => {
    setSelectedPackSlug(slug);
    setIsTodayPractice(false);
    setStartDraft("1");
    setCustomMessage(slug === CUSTOM_PACK_SLUG ? "已切换到自制词库" : "自制词库保存在当前浏览器");
  };

  const startTodayPractice = () => {
    setSelectedPackSlug(defaultPackSlug);
    setIsTodayPractice(true);
    setStartDraft("1");
    resetSession("今日 50 个已准备好");
  };

  const toggleGeneratedWords = () => {
    setIncludeGeneratedWords((current) => !current);
    setIsTodayPractice(false);
    setStartDraft("1");
    resetSession(includeGeneratedWords ? "已切换为只练精选词" : "已包含扩展拼写词");
  };

  const jumpToWord = () => {
    if (!words.length) return;
    const requested = Number.parseInt(startDraft, 10);
    const nextIndex = Number.isFinite(requested)
      ? Math.min(Math.max(requested, 1), words.length) - 1
      : 0;
    setCurrentIndex(nextIndex);
    setInput('');
    setResults([]);
    setStartTime(null);
    setShowMeaning(false);
    setIsComplete(false);
    setSavedAt(null);
    setSaveMessage(`从第 ${nextIndex + 1} 个开始`);
    setStartDraft(String(nextIndex + 1));
  };

  const handleInput = (value: string) => {
    if (!currentWord) return;
    if (!startTime) {
      setStartTime(Date.now());
    }

    setInput(value);

    const targetWord = currentWord.word.toLowerCase();
    const inputLower = value.toLowerCase();

    if (inputLower === targetWord) {
      const timeSpent = startTime ? Date.now() - startTime : 0;
      setResults([...results, { word: currentWord.word, correct: true, timeSpent }]);
      triggerVibration(18);

      setSuccessPulse(true);
      setTimeout(() => setSuccessPulse(false), 500);

      setTimeout(() => {
        if (currentIndex < words.length - 1) {
          setCurrentIndex(currentIndex + 1);
          setInput('');
          setStartTime(null);
          setShowMeaning(false);
        } else {
          setIsComplete(true);
        }
      }, 300);
    } else if (!targetWord.startsWith(inputLower) && value.length > 0) {
      recordTypingWrong(currentWord);
      triggerVibration([35, 25, 35]);
      setErrorShake(true);
      setTimeout(() => setErrorShake(false), 500);
    }
  };

  const skipWord = () => {
    if (!currentWord) return;
    const timeSpent = startTime ? Date.now() - startTime : 0;
    recordTypingWrong(currentWord);
    setResults([...results, { word: currentWord.word, correct: false, timeSpent }]);

    if (currentIndex < words.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setInput('');
      setStartTime(null);
      setShowMeaning(false);
    } else {
      setIsComplete(true);
    }
  };

  const restart = () => {
    resetSession("重新开始");
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(storageKey);
    }
  };

  const clearSavedProgress = () => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(storageKey);
    }
    resetSession("进度已清空");
  };

  const addCustomWord = () => {
    const nextWord = makeCustomWord({
      word: customDraft.word,
      meaningZh: customDraft.meaning,
      meaningEn: customDraft.meaning,
      sentence: customDraft.sentence,
      tags: customDraft.tags || "自制",
      source: "word typing",
    });
    if (!nextWord) {
      setCustomMessage("先写英文单词，再添加");
      return;
    }

    const nextWords = [
      nextWord,
      ...customWords.filter((item) => item.word.toLowerCase() !== nextWord.word.toLowerCase()),
    ];
    writeCustomWords(nextWords);
    setCustomWords(nextWords);
    setCustomDraft(initialCustomDraft);
    setStartDraft("1");
    setSelectedPackSlug(CUSTOM_PACK_SLUG);
    setCustomMessage(`已加入 ${nextWord.word}`);
  };

  const importCustomWords = () => {
    const imported = parseBulkWords(customBulkText);
    if (!imported.length) {
      setCustomMessage("批量导入格式：单词, 释义, 例句, 标签");
      return;
    }

    const importedKeys = new Set(imported.map((item) => item.word.toLowerCase()));
    const nextWords = [
      ...imported,
      ...customWords.filter((item) => !importedKeys.has(item.word.toLowerCase())),
    ];
    writeCustomWords(nextWords);
    setCustomWords(nextWords);
    setCustomBulkText("");
    setStartDraft("1");
    setSelectedPackSlug(CUSTOM_PACK_SLUG);
    setCustomMessage(`已导入 ${imported.length} 个单词，共 ${nextWords.length} 个`);
  };

  const clearCustomWords = () => {
    writeCustomWords([]);
    setCustomWords([]);
    setCustomMessage("自制词库已清空");
  };

  if (isComplete) {
    const totalTime = results.reduce((sum, r) => sum + r.timeSpent, 0);
    const avgTime = results.length > 0 ? totalTime / results.length : 0;

    return (
      <div className="word-typing-complete">
        <div className="complete-card">
          <h1>训练完成</h1>
          <p className="complete-pack-name">{activePackShortTitle}</p>
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-value">{results.length}</div>
              <div className="stat-label">总单词数</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{correctCount}</div>
              <div className="stat-label">正确数</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{accuracy.toFixed(1)}%</div>
              <div className="stat-label">准确率</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{(avgTime / 1000).toFixed(1)}s</div>
              <div className="stat-label">平均用时</div>
            </div>
          </div>
          <button onClick={restart} className="restart-btn">
            重新开始
          </button>
        </div>
      </div>
    );
  }

  return (
    <div ref={trainerRef} className={`word-typing-trainer${isFocusActive ? " is-focus-fullscreen" : ""}`}>
      <aside className="typing-side-nav" aria-label="单词训练导航">
        <div className="typing-brand-mark">JinMing</div>
        <nav>
          <a href="#word-practice">单词</a>
          <a href="#word-bank">词库</a>
          <a href="#custom-wordbook">自制</a>
          <a href="#wrong-word-entry">错词</a>
          <a href="#word-guide">帮助</a>
          <Link href={localizedHref("/english", language)}>返回列表</Link>
        </nav>
        <button type="button" onClick={toggleFullscreen}>
          {isFocusActive ? "退出" : "全屏"}
        </button>
      </aside>
      <div className="typing-shell">
        <div className="typing-topbar">
          <div>
            <p className="typing-eyebrow">单词跟打</p>
            <h1>{isFocusActive ? `${activePackShortTitle} 专注跟打` : "全屏单词跟打"}</h1>
          </div>
          <Link href={localizedHref("/english", language)} className="typing-back-link">
            返回英语列表
          </Link>
          <button type="button" onClick={startTodayPractice} className="typing-back-link">
            今日练 50 个
          </button>
          <div className="typing-session-summary" aria-label="当前训练信息">
            <span>{activePackShortTitle}</span>
            <strong>{words.length ? currentIndex + 1 : 0} / {words.length.toLocaleString("zh-CN")}</strong>
          </div>
          <button
            onClick={toggleFullscreen}
            className="fullscreen-toggle-btn"
            aria-label={isFocusActive ? "退出全屏" : "进入全屏"}
          >
            {isFocusActive ? '退出全屏' : '专注全屏'}
          </button>
        </div>

        <div className={`progress-panel theme-${progressTheme}`} aria-label={`进度 ${words.length ? currentIndex + 1 : 0} / ${words.length}`}>
          <div className="progress-copy">
            <span>{words.length ? currentIndex + 1 : 0}</span>
            <small>/ {words.length}</small>
          </div>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <div className="progress-percent">{progress.toFixed(0)}%</div>
        </div>
        {isTodayShortOfVerifiedWords ? (
          <p className="rounded-[8px] bg-black/5 px-3 py-2 text-sm text-[color:var(--muted)]">
            当前精选词不足 50，只练精选已校验词，不自动混入扩展拼写词。
          </p>
        ) : null}

        <div className="progress-personalize" aria-label="进度保存和样式">
          <div className="save-state">
            <span>{saveMessage}</span>
            <strong>{savedTimeLabel}</strong>
          </div>
          <div className="theme-picker" aria-label="进度条主题">
            {progressThemes.map((theme) => (
              <button
                key={theme.id}
                type="button"
                className={`theme-dot theme-${theme.id}${progressTheme === theme.id ? ' active' : ''}`}
                onClick={() => setProgressTheme(theme.id)}
                aria-label={`${theme.label}色进度条`}
                title={`${theme.label}色进度条`}
              >
                {theme.label}
              </button>
            ))}
          </div>
          <div className="save-actions">
            <label className="vibration-toggle">
              <input
                type="checkbox"
                checked={isVibrationEnabled}
                onChange={(event) => setIsVibrationEnabled(event.target.checked)}
              />
              震动
            </label>
            <button type="button" onClick={() => persistProgress("手动保存")} className="mini-action">
              保存
            </button>
            <button type="button" onClick={clearSavedProgress} className="mini-action">
              清空
            </button>
          </div>
        </div>

        {currentWord ? (
          <div id="word-practice" className={`word-card ${errorShake ? 'shake' : ''} ${successPulse ? 'success' : ''}`}>
            <div className="word-card-header">
              <div className="word-meta">
                <span className="word-source">{currentWord.generated ? "扩展拼写练习" : currentWord.source}</span>
                <span className="word-level">{currentWord.generated ? "非人工校验释义" : currentWord.level}</span>
              </div>
              <button onClick={playPronunciation} className="pronunciation-chip">
                发音
              </button>
            </div>

            <div className="word-display">
              <div className="word-text">{currentWord.word}</div>
              {currentWord.phonetic && (
                <div className="word-phonetic">{currentWord.phonetic}</div>
              )}
            </div>

            <div className="word-meaning">
              <div>
                <span className="field-label">释义</span>
                <p className="meaning-zh">{currentWord.meaningZh}</p>
                <p className="meaning-en">{currentWord.meaningEn}</p>
              </div>
              <div>
                <span className="field-label">例句</span>
                <p className="example-sentence">{currentWord.sentence}</p>
              </div>
              {currentWord.collocation && (
                <div>
                  <span className="field-label">搭配</span>
                  <p className="collocation">{currentWord.collocation}</p>
                </div>
              )}
            </div>

            <div className="input-container">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => handleInput(e.target.value)}
                className="word-input"
                placeholder="在这里输入上面的单词"
                autoComplete="off"
                spellCheck={false}
              />
              <div className="input-hint" aria-live="polite">
                {currentWord.word.split('').map((char, i) => {
                  const inputChar = input[i]?.toLowerCase();
                  const targetChar = char.toLowerCase();

                  if (i < input.length) {
                    return (
                      <span
                        key={i}
                        className={inputChar === targetChar ? 'correct' : 'incorrect'}
                      >
                        {char}
                      </span>
                    );
                  }
                  return (
                    <span key={i} className="pending">
                      {char}
                    </span>
                  );
                })}
              </div>
            </div>

            <div className="action-buttons">
              <button onClick={playPronunciation} className="action-btn pronunciation-btn">
                再听一遍
              </button>
              <button onClick={() => setShowMeaning(!showMeaning)} className="action-btn hint-btn">
                {showMeaning ? '收起笔记' : '考试笔记'}
              </button>
              <button onClick={skipWord} className="action-btn skip-btn">
                跳过
              </button>
            </div>

            {showMeaning && (
              <div className="exam-note">
                <span className="field-label">考试笔记</span>
                <p>{currentWord.examNote}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="custom-empty-state">
            <h2>自制词库还是空的</h2>
            <p>先在上面添加单词，或者批量导入几行，再点“练自制词库”。</p>
          </div>
        )}

        <div className="stats-bar">
          <div className="stat">
            <span className="stat-label">准确率</span>
            <span className="stat-value">{accuracy.toFixed(0)}%</span>
          </div>
          <div className="stat">
            <span className="stat-label">已完成</span>
            <span className="stat-value">{results.length}</span>
          </div>
          <div className="stat">
            <span className="stat-label">正确</span>
            <span className="stat-value correct-count">{correctCount}</span>
          </div>
        </div>

        <div className="typing-manage-grid">
          <section id="word-bank" className="word-bank-panel" aria-label="选择词库">
            <div className="word-bank-head">
              <div>
                <p className="typing-eyebrow">选择词库</p>
                <h2>{activePackTitle}</h2>
              </div>
              <span>{isTodayPractice ? "今日 50" : `${words.length} 词`}</span>
            </div>
            {selectedPack.slug !== CUSTOM_PACK_SLUG ? (
              <div className="save-actions" aria-label="词库范围">
                <button type="button" onClick={toggleGeneratedWords} className="mini-action">
                  {includeGeneratedWords ? "只练精选词" : "包含扩展拼写词"}
                </button>
                <span>{isTodayPractice ? "今日 50 始终只用精选词" : generatedModeLabel}</span>
              </div>
            ) : null}
            <div className="word-bank-grid">
              {packOptions.map((pack) => (
                <button
                  key={pack.slug}
                  type="button"
                  className={`word-bank-option${selectedPackSlug === pack.slug ? " active" : ""}`}
                  onClick={() => selectPack(pack.slug)}
                >
                  <strong>{pack.shortTitle}</strong>
                  <small>{getPackOptionMeta(pack)}</small>
                </button>
              ))}
            </div>
          </section>

          <section className="word-start-panel" aria-label="选择开始位置">
            <div>
              <p className="typing-eyebrow">开始位置</p>
              <h2>从指定单词开始</h2>
            </div>
            <div className="word-start-controls">
              <label>
                第
                <input
                  type="number"
                  min={1}
                  max={Math.max(words.length, 1)}
                  value={startDraft}
                  onChange={(event) => setStartDraft(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") jumpToWord();
                  }}
                />
                个
              </label>
              <button type="button" onClick={jumpToWord}>开始</button>
              <span>当前 {words.length ? currentIndex + 1 : 0} / {words.length.toLocaleString("zh-CN")}</span>
            </div>
          </section>
        </div>

        <section id="word-guide" className="word-typing-guide" aria-label="使用说明">
          <div>
            <strong>使用说明</strong>
            <span>先选官方或自制词库，听发音、看例句，在输入框完整打出英文；每个词库的进度都会自动保存。</span>
          </div>
          <div>
            <strong>自制题库</strong>
            <span>单个添加或不限行批量导入都可以，格式为“单词, 释义, 例句, 标签”，数据只保存在你的浏览器。</span>
          </div>
        </section>

        <section id="wrong-word-entry" className="word-typing-guide" aria-label="本机错词记录">
          <div>
            <strong>本机错词记录</strong>
            <span>
              {wrongWordsPreview.length > 0
                ? `已保存 ${wrongWordsPreview.length} 个错词，数据只在当前浏览器。`
                : "还没有错词；背词或跟打出错后会出现在这里。"}
            </span>
          </div>
          <div>
            <strong>最近错词</strong>
            <span>
              {wrongWordsPreview.length > 0
                ? wrongWordsPreview.slice(0, 8).map((item) => item.word).join(" · ")
                : "暂无"}
            </span>
          </div>
        </section>

        <section id="custom-wordbook" className="custom-word-bank" aria-label="自制题库">
          <div className="custom-word-bank-head">
            <div>
              <p className="typing-eyebrow">自制题库</p>
              <h2>添加自己的单词</h2>
            </div>
            <span>{customMessage}</span>
          </div>
          <div className="custom-word-bank-grid">
            <input
              value={customDraft.word}
              onChange={(event) => setCustomDraft((draft) => ({ ...draft, word: event.target.value }))}
              placeholder="英文单词"
            />
            <input
              value={customDraft.meaning}
              onChange={(event) => setCustomDraft((draft) => ({ ...draft, meaning: event.target.value }))}
              placeholder="中文释义"
            />
            <input
              value={customDraft.sentence}
              onChange={(event) => setCustomDraft((draft) => ({ ...draft, sentence: event.target.value }))}
              placeholder="例句，可不填"
            />
            <input
              value={customDraft.tags}
              onChange={(event) => setCustomDraft((draft) => ({ ...draft, tags: event.target.value }))}
              placeholder="标签，如 考研/高中"
            />
          </div>
          <textarea
            value={customBulkText}
            onChange={(event) => setCustomBulkText(event.target.value)}
            placeholder={"不限行批量导入：每行一个\nabandon, 放弃, Do not abandon your plan., 四级\nhypothesis, 假设, The researcher proposed a hypothesis., TOEFL"}
          />
          <div className="custom-word-bank-actions">
            <button type="button" onClick={addCustomWord}>添加单词</button>
            <button type="button" onClick={importCustomWords}>批量导入</button>
            <button type="button" onClick={() => selectPack(CUSTOM_PACK_SLUG)}>练自制词库</button>
            {customWords.length > 0 && (
              <button type="button" onClick={clearCustomWords} className="quiet-action">清空自制词库</button>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
