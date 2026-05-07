"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import LearningFullscreenButton from "@/components/learning/LearningFullscreenButton";
import { recordLocalActivity } from "@/lib/local-progress";
import { speakMemoryPronunciation } from "@/lib/memory-pronunciation";

export type EnglishTypingItem = {
  id: string;
  type: "word" | "sentence";
  source: string;
  answer: string;
  meaningZh: string;
  noteZh: string;
};

type Mode = "mixed" | "word" | "sentence";

const storageKey = "vantaapi-english-typing-v1";

function normalize(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s']/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function maskAnswer(answer: string) {
  return answer.replace(/[A-Za-z]/g, "•");
}

function readStats() {
  if (typeof window === "undefined") return { correct: 0, wrong: 0, index: 0 };
  try {
    const parsed = JSON.parse(window.localStorage.getItem(storageKey) || "{}") as {
      correct?: number;
      wrong?: number;
      index?: number;
    };
    return {
      correct: Math.max(0, Number(parsed.correct || 0)),
      wrong: Math.max(0, Number(parsed.wrong || 0)),
      index: Math.max(0, Number(parsed.index || 0)),
    };
  } catch {
    return { correct: 0, wrong: 0, index: 0 };
  }
}

function saveStats(stats: { correct: number; wrong: number; index: number }) {
  try {
    window.localStorage.setItem(storageKey, JSON.stringify(stats));
  } catch {
    // Best effort only.
  }
}

export default function EnglishTypingTrainer({ items }: { items: EnglishTypingItem[] }) {
  const [mode, setMode] = useState<Mode>("mixed");
  const [index, setIndex] = useState(0);
  const [draft, setDraft] = useState("");
  const [message, setMessage] = useState("听音打字 拼对才能过关");
  const [showAnswer, setShowAnswer] = useState(false);
  const [focusMode, setFocusMode] = useState(true);
  const [stats, setStats] = useState({ correct: 0, wrong: 0, index: 0 });
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [questionElapsedSeconds, setQuestionElapsedSeconds] = useState(0);
  const [timeoutIds, setTimeoutIds] = useState<Record<string, boolean>>({});
  const inputRef = useRef<HTMLInputElement>(null);
  const lastErrorRef = useRef("");
  const autoSubmittedRef = useRef("");

  const activeItems = useMemo(() => {
    if (mode === "mixed") return items;
    return items.filter((item) => item.type === mode);
  }, [items, mode]);

  const safeItems = activeItems.length > 0 ? activeItems : items;
  const activeIndex = safeItems.length ? index % safeItems.length : 0;
  const current = safeItems[activeIndex];
  const attempts = stats.correct + stats.wrong;
  const accuracy = attempts ? Math.round((stats.correct / attempts) * 100) : 0;
  const elapsedMinutes = Math.max(elapsedSeconds / 60, 0.1);
  const typedWords = draft.trim() ? draft.trim().split(/\s+/).length : 0;
  const wpm = Math.round(typedWords / elapsedMinutes);
  const remaining = Math.max(safeItems.length - activeIndex - 1, 0);
  const modeLabel = mode === "mixed" ? "混合" : mode === "word" ? "单词" : "句子";
  const normalizedDraft = normalize(draft);
  const normalizedAnswer = normalize(current?.answer || "");
  const characterProgress = current ? Math.min(100, Math.round((draft.length / Math.max(current.answer.length, 1)) * 100)) : 0;
  const recallSeconds = Math.max(0, 5 - questionElapsedSeconds);
  const strictTimeoutActive = !draft.trim() && recallSeconds === 0 && !timeoutIds[current?.id || ""];

  const speak = useCallback((text = current?.answer) => {
    if (!text) return;
    void speakMemoryPronunciation({ text, kind: current?.type === "sentence" ? "sentence" : "word" });
  }, [current.answer, current.type]);

  const persist = useCallback((nextStats: { correct: number; wrong: number; index: number }) => {
    setStats(nextStats);
    saveStats(nextStats);
  }, []);

  const next = useCallback(() => {
    const nextIndex = safeItems.length ? (activeIndex + 1) % safeItems.length : 0;
    const latestStats = readStats();
    setIndex(nextIndex);
    setDraft("");
    setShowAnswer(false);
    setQuestionElapsedSeconds(0);
    lastErrorRef.current = "";
    autoSubmittedRef.current = "";
    setMessage("听音打字 拼对才能过关");
    persist({ ...latestStats, index: nextIndex });
    window.setTimeout(() => inputRef.current?.focus(), 0);
  }, [activeIndex, persist, safeItems.length]);

  const getInputClass = useCallback(() => {
    if (!draft || !current) return "";
    const normalized = normalize(draft);
    const target = normalize(current.answer);

    if (normalized === target) return "typing-input-perfect";
    if (target.startsWith(normalized)) return "typing-input-valid";
    return "typing-input-error";
  }, [draft, current]);

  const check = useCallback(() => {
    if (!current) return;
    const correct = normalize(draft) === normalize(current.answer);
    const nextStats = {
      correct: stats.correct + (correct ? 1 : 0),
      wrong: stats.wrong + (correct ? 0 : 1),
      index: activeIndex,
    };
    persist(nextStats);

    recordLocalActivity({
      id: `english-typing:${current.id}:${Date.now()}`,
      title: current.type === "word" ? `Typing ${current.answer}` : "Typing sentence",
      href: "/english/typing?lang=zh",
      kind: "english",
      completed: true,
      correct,
    });

    if (correct) {
      setMessage("✓ 通过 自动下一题");
      window.setTimeout(next, 520);
      return;
    }

    setMessage("✗ 拼写错误 再听一遍 必须打对才能过关");
    setShowAnswer(false);
    speak(current.answer);
    window.setTimeout(() => inputRef.current?.focus(), 0);
  }, [activeIndex, current, draft, next, persist, speak, stats.correct, stats.wrong]);

  useEffect(() => {
    if (!current || !draft) return;
    if (normalizedDraft === normalizedAnswer && autoSubmittedRef.current !== current.id) {
      autoSubmittedRef.current = current.id;
      const timer = window.setTimeout(check, 180);
      return () => window.clearTimeout(timer);
    }

    if (!normalizedAnswer.startsWith(normalizedDraft) && lastErrorRef.current !== draft) {
      lastErrorRef.current = draft;
      setMessage("这一处不对 重新听音再改");
      speak(current.answer);
    }
  }, [check, current, draft, normalizedAnswer, normalizedDraft, speak]);

  useEffect(() => {
    if (!current || draft.trim() || timeoutIds[current.id]) return;
    const timer = window.setTimeout(() => {
      setTimeoutIds((ids) => ({ ...ids, [current.id]: true }));
      const latestStats = readStats();
      const nextStats = { ...latestStats, wrong: latestStats.wrong + 1 };
      persist(nextStats);
      setMessage("5 秒未回忆出来 已记为待复习 先重听");
      speak(current.answer);
      window.setTimeout(() => inputRef.current?.focus(), 0);
    }, 5000);
    return () => window.clearTimeout(timer);
  }, [current, draft, persist, speak, timeoutIds]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const saved = readStats();
      setStats(saved);
      setIndex(saved.index);
      inputRef.current?.focus();
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDraft("");
      setShowAnswer(false);
      setMessage("已切换题型 听音拼写");
      setIndex(0);
      setQuestionElapsedSeconds(0);
      autoSubmittedRef.current = "";
      inputRef.current?.focus();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [mode]);

  useEffect(() => {
    const started = Date.now();
    const timer = window.setInterval(() => {
      setElapsedSeconds(Math.round((Date.now() - started) / 1000));
    }, 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setQuestionElapsedSeconds((seconds) => seconds + 1);
    }, 1000);
    return () => window.clearInterval(timer);
  }, [current.id]);

  if (!current) {
    return null;
  }

  return (
    <section className={focusMode ? "typing-lab typing-lab-focus mt-4" : "typing-lab mt-4"}>
      <div className="typing-lab-main dense-panel">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="eyebrow">English Typing System</p>
            <h2 className="mt-2 text-3xl font-semibold">听音拼写 拼对过关</h2>
            <div className="typing-compact-meta mt-3">
              <span>{modeLabel}</span>
              <span>{current.source}</span>
              <span>{activeIndex + 1} / {safeItems.length}</span>
              <span>剩余 {remaining}</span>
              <span>5 秒 {strictTimeoutActive ? "待复习" : `${recallSeconds}s`}</span>
              <span><kbd>Enter</kbd> 检查</span>
              <span><kbd>Ctrl P</kbd> 发音</span>
              <span><kbd>Esc</kbd> 退出全屏</span>
            </div>
          </div>
          <div className="learning-head-actions">
            <LearningFullscreenButton language="zh" />
            <button type="button" className="dense-action" onClick={() => setFocusMode((value) => !value)}>
              {focusMode ? "标准" : "沉浸"}
            </button>
            <div className="typing-score">
              <span>{accuracy}</span>
              <small>%</small>
            </div>
          </div>
        </div>

        <div className="typing-mode-bar mt-4" aria-label="typing mode">
          {(["mixed", "word", "sentence"] as Mode[]).map((item) => (
            <button key={item} type="button" className={mode === item ? "active" : ""} onClick={() => setMode(item)}>
              {item === "mixed" ? "混合" : item === "word" ? "单词" : "句子"}
            </button>
          ))}
          <button type="button" onClick={() => speak()}>
            发音
          </button>
          <button type="button" onClick={() => setShowAnswer((value) => !value)}>
            {showAnswer ? "隐藏" : "答案"}
          </button>
          <button type="button" className={focusMode ? "active" : ""} onClick={() => setFocusMode((value) => !value)}>
            沉浸
          </button>
        </div>

        <div className="typing-board mt-4">
          <aside className="typing-side">
            <div className="typing-side-head">
              <div>
                <p className="eyebrow">{current.source}</p>
                <h3>{current.type === "word" ? "单词听写" : "句子听写"}</h3>
              </div>
              <span>{current.type === "word" ? "Word" : "Sentence"}</span>
            </div>
            <p>{current.meaningZh}</p>
            <div className="typing-mask">{showAnswer ? current.answer : maskAnswer(current.answer)}</div>
            <div className="typing-progress">
              <span style={{ width: `${characterProgress}%` }} />
            </div>
            <p className="typing-note">{current.noteZh}</p>
          </aside>

          <div className="typing-work">
            <label>
              <span>输入英文 · 实时验证</span>
              <input
                ref={inputRef}
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    check();
                  }
                  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "p") {
                    event.preventDefault();
                    speak();
                  }
                  if (event.key === "Escape") {
                    event.preventDefault();
                    if (document.fullscreenElement) {
                      void document.exitFullscreen();
                    }
                  }
                }}
                autoCapitalize="none"
                autoComplete="off"
                autoCorrect="off"
                spellCheck={false}
                placeholder={current.type === "word" ? "type the word" : "type the sentence"}
                className={getInputClass()}
              />
            </label>

            <div className="typing-command-row">
              <button type="button" className="dense-action-primary" onClick={check}>
                检查 <kbd>Enter</kbd>
              </button>
              <button type="button" className="dense-action" onClick={() => speak()}>
                发音 <kbd>Ctrl P</kbd>
              </button>
              <button type="button" className="dense-action" onClick={() => setShowAnswer((value) => !value)}>
                {showAnswer ? "隐藏" : "答案"}
              </button>
              <button type="button" className="dense-action" onClick={next}>
                跳过
              </button>
            </div>

            <p className="typing-message">{message}</p>

            <div className="typing-stats">
              <span>✓ {stats.correct}</span>
              <span>✗ {stats.wrong}</span>
              <span>{accuracy}% 准确率</span>
              <span>{wpm} WPM</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
