'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { playNaturalVoice } from '@/lib/natural-voice';
import type { ExamVocabularyWord } from '@/lib/exam-content';

type WordWithMeta = ExamVocabularyWord & {
  source: string;
  level: string;
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

const progressThemes: { id: ProgressTheme; label: string }[] = [
  { id: "blue", label: "蓝" },
  { id: "mint", label: "绿" },
  { id: "rose", label: "粉" },
  { id: "ink", label: "黑" },
];

export default function WordTypingTrainer({
  words,
}: {
  words: WordWithMeta[];
  language: string;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [input, setInput] = useState('');
  const [results, setResults] = useState<WordResult[]>([]);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [showMeaning, setShowMeaning] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [errorShake, setErrorShake] = useState(false);
  const [successPulse, setSuccessPulse] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [progressTheme, setProgressTheme] = useState<ProgressTheme>("blue");
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState("自动保存开启");
  const inputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const restoredRef = useRef(false);

  const currentWord = words[currentIndex];
  const progress = ((currentIndex + 1) / words.length) * 100;
  const correctCount = results.filter((r) => r.correct).length;
  const accuracy = results.length > 0 ? (correctCount / results.length) * 100 : 0;
  const storageKey = `word-typing-progress:${words.length}:${words[0]?.word ?? "start"}:${words[words.length - 1]?.word ?? "end"}`;
  const savedTimeLabel = savedAt ? new Date(savedAt).toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" }) : "尚未保存";

  const persistProgress = useCallback((message = "已保存") => {
    if (typeof window === "undefined") return;
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
  }, [currentIndex, progressTheme, results, storageKey]);

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

  useEffect(() => {
    inputRef.current?.focus();
  }, [currentIndex]);

  useEffect(() => {
    if (typeof window === "undefined" || restoredRef.current) return;
    restoredRef.current = true;

    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return;

    try {
      const saved = JSON.parse(raw) as Partial<SavedWordProgress>;
      const savedIndex = Number(saved.currentIndex);
      const savedResults = Array.isArray(saved.results) ? saved.results : [];
      if (Number.isInteger(savedIndex) && savedIndex >= 0 && savedIndex < words.length) {
        const nextResults = savedResults.filter((item): item is WordResult =>
          typeof item?.word === "string" &&
          typeof item.correct === "boolean" &&
          typeof item.timeSpent === "number"
        );
        const nextTheme = progressThemes.some((theme) => theme.id === saved.theme) ? saved.theme as ProgressTheme : "blue";
        const nextSavedAt = typeof saved.savedAt === "string" ? saved.savedAt : null;

        window.setTimeout(() => {
          setCurrentIndex(savedIndex);
          setResults(nextResults);
          setProgressTheme(nextTheme);
          setSavedAt(nextSavedAt);
          setSaveMessage("已恢复上次进度");
        }, 0);
      }
    } catch {
      window.localStorage.removeItem(storageKey);
    }
  }, [storageKey, words.length]);

  useEffect(() => {
    if (!restoredRef.current || typeof window === "undefined") return;
    const timer = window.setTimeout(() => persistProgress("自动保存"), 250);
    return () => window.clearTimeout(timer);
  }, [persistProgress]);

  useEffect(() => {
    if (currentWord) {
      playPronunciation();
    }
  }, [currentWord, playPronunciation]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const toggleFullscreen = async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else {
        await document.documentElement.requestFullscreen();
      }
    } catch (error) {
      console.error('Fullscreen error:', error);
    }
  };

  const handleInput = (value: string) => {
    if (!startTime) {
      setStartTime(Date.now());
    }

    setInput(value);

    const targetWord = currentWord.word.toLowerCase();
    const inputLower = value.toLowerCase();

    if (inputLower === targetWord) {
      const timeSpent = startTime ? Date.now() - startTime : 0;
      setResults([...results, { word: currentWord.word, correct: true, timeSpent }]);

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
      setErrorShake(true);
      setTimeout(() => setErrorShake(false), 500);
    }
  };

  const skipWord = () => {
    const timeSpent = startTime ? Date.now() - startTime : 0;
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
    setCurrentIndex(0);
    setInput('');
    setResults([]);
    setStartTime(null);
    setShowMeaning(false);
    setIsComplete(false);
    setSavedAt(null);
    setSaveMessage("重新开始");
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(storageKey);
    }
  };

  const clearSavedProgress = () => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(storageKey);
    }
    setCurrentIndex(0);
    setInput('');
    setResults([]);
    setStartTime(null);
    setShowMeaning(false);
    setIsComplete(false);
    setSavedAt(null);
    setSaveMessage("进度已清空");
  };

  if (isComplete) {
    const totalTime = results.reduce((sum, r) => sum + r.timeSpent, 0);
    const avgTime = totalTime / results.length;

    return (
      <div className="word-typing-complete">
        <div className="complete-card">
          <h1>训练完成</h1>
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
    <div className="word-typing-trainer">
      <div className="typing-shell">
        <div className="typing-topbar">
          <div>
            <p className="typing-eyebrow">单词跟打</p>
            <h1>看词、听音、跟打</h1>
          </div>
          <button
            onClick={toggleFullscreen}
            className="fullscreen-toggle-btn"
            aria-label={isFullscreen ? "退出全屏" : "进入全屏"}
          >
            {isFullscreen ? '退出全屏' : '全屏'}
          </button>
        </div>

        <div className={`progress-panel theme-${progressTheme}`} aria-label={`进度 ${currentIndex + 1} / ${words.length}`}>
          <div className="progress-copy">
            <span>{currentIndex + 1}</span>
            <small>/ {words.length}</small>
          </div>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <div className="progress-percent">{progress.toFixed(0)}%</div>
        </div>

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
            <button type="button" onClick={() => persistProgress("手动保存")} className="mini-action">
              保存
            </button>
            <button type="button" onClick={clearSavedProgress} className="mini-action">
              清空
            </button>
          </div>
        </div>

        <div className={`word-card ${errorShake ? 'shake' : ''} ${successPulse ? 'success' : ''}`}>
          <div className="word-card-header">
            <div className="word-meta">
              <span className="word-source">{currentWord.source}</span>
              <span className="word-level">{currentWord.level}</span>
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
      </div>
    </div>
  );
}
