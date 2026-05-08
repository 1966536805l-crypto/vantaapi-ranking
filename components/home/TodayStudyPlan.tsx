"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { CUSTOM_WORDBOOK_SLUG, readCustomWords } from "@/lib/custom-wordbook";
import { localizedHref, type InterfaceLanguage } from "@/lib/language";
import {
  localProgressSummary,
  readLocalProgress,
  recordLocalActivity,
  type LocalProgressState,
} from "@/lib/local-progress";

type TodayWord = {
  word: string;
  meaningZh: string;
  collocation: string;
};

type TodayPack = {
  slug: string;
  shortTitle: string;
  level: string;
  route: string;
  words: TodayWord[];
};

type ReadingPack = {
  slug: string;
  zhTitle: string;
  level: string;
  targetArticles: number;
};

type QuestionPack = {
  slug: string;
  zhTitle: string;
  level: string;
};

type ReviewRecord = {
  status?: "known" | "unknown";
  stage?: number;
  nextAt?: number;
};

type TodayTaskId = "review" | "typing" | "reading" | "questions";

type TodayCompletionDay = {
  tasks: Partial<Record<TodayTaskId, boolean>>;
  completedAt?: number;
  updatedAt: number;
};

type TodayCompletionState = {
  version: 1;
  byDay: Record<string, TodayCompletionDay>;
};

type TodayStudyPlanProps = {
  initialLanguage: InterfaceLanguage;
  packs: TodayPack[];
  readingPacks: ReadingPack[];
  questionPacks: QuestionPack[];
};

const DAILY_TARGET = 4;
const COMPLETION_STORAGE_KEY = "vantaapi-today-punch-v1";
const todayTaskIds: TodayTaskId[] = ["review", "typing", "reading", "questions"];

function daySeed(date = new Date()) {
  const start = new Date(date.getFullYear(), 0, 0);
  return Math.floor((date.getTime() - start.getTime()) / 86400000);
}

function todayKey(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function readVocabularyProgress(packSlug: string) {
  if (typeof window === "undefined") return {} as Record<string, ReviewRecord>;
  try {
    return JSON.parse(window.localStorage.getItem(`vantaapi-vocabulary-review-${packSlug}`) || "{}") as Record<string, ReviewRecord>;
  } catch {
    return {};
  }
}

function readTypingStats() {
  if (typeof window === "undefined") return { correct: 0, wrong: 0, index: 0 };
  try {
    const parsed = JSON.parse(window.localStorage.getItem("vantaapi-english-typing-v1") || "{}") as Partial<{
      correct: number;
      wrong: number;
      index: number;
    }>;
    return {
      correct: Number(parsed.correct || 0),
      wrong: Number(parsed.wrong || 0),
      index: Number(parsed.index || 0),
    };
  } catch {
    return { correct: 0, wrong: 0, index: 0 };
  }
}

function relativeDue(timestamp?: number) {
  if (!timestamp) return "new";
  const diff = timestamp - Date.now();
  if (diff <= 0) return "due now";
  const minute = 60000;
  const hour = 60 * minute;
  const day = 24 * hour;
  if (diff < hour) return `${Math.max(1, Math.round(diff / minute))} min`;
  if (diff < day) return `${Math.max(1, Math.round(diff / hour))} h`;
  return `${Math.max(1, Math.round(diff / day))} d`;
}

function buildNewWords(pack: TodayPack, seed: number) {
  if (pack.words.length === 0) return [];
  const start = (seed * 3) % pack.words.length;
  return Array.from({ length: Math.min(10, pack.words.length) }, (_, index) => pack.words[(start + index) % pack.words.length]);
}

function emptyCompletionState(): TodayCompletionState {
  return { version: 1, byDay: {} };
}

function readCompletionState() {
  if (typeof window === "undefined") return emptyCompletionState();
  try {
    const parsed = JSON.parse(window.localStorage.getItem(COMPLETION_STORAGE_KEY) || "{}") as Partial<TodayCompletionState>;
    return {
      version: 1,
      byDay: parsed.byDay && typeof parsed.byDay === "object" ? parsed.byDay : {},
    } satisfies TodayCompletionState;
  } catch {
    return emptyCompletionState();
  }
}

function persistCompletionState(state: TodayCompletionState) {
  try {
    window.localStorage.setItem(COMPLETION_STORAGE_KEY, JSON.stringify(state));
    window.dispatchEvent(new CustomEvent("vantaapi-today-punch"));
  } catch {
    // Punch data is local and best effort.
  }
}

function completedCount(day?: TodayCompletionDay) {
  if (!day) return 0;
  return todayTaskIds.filter((taskId) => day.tasks[taskId]).length;
}

function completionStreak(state: TodayCompletionState) {
  let streak = 0;
  const cursor = dateFromToday(0);
  while (completedCount(state.byDay[todayKey(cursor)]) >= DAILY_TARGET) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

function dateFromToday(offset: number) {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + offset);
  return date;
}

function shortDayLabel(date: Date) {
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

function previewVocabularyForDate(packs: TodayPack[], offset: number) {
  const seed = daySeed(dateFromToday(offset));
  const pack = packs[seed % Math.max(packs.length, 1)] || packs[0];
  return {
    pack,
    words: pack ? buildNewWords(pack, seed).slice(0, 4) : [],
  };
}

export default function TodayStudyPlan({ initialLanguage, packs, readingPacks, questionPacks }: TodayStudyPlanProps) {
  const language = initialLanguage;
  const [progress, setProgress] = useState<LocalProgressState>(() => readLocalProgress());
  const [version, setVersion] = useState(0);
  const [typingStats, setTypingStats] = useState(() => readTypingStats());
  const [completionState, setCompletionState] = useState<TodayCompletionState>(() => emptyCompletionState());
  const seed = daySeed();
  const summary = useMemo(() => localProgressSummary(progress), [progress]);
  const today = todayKey();
  const todayCompletion = completionState.byDay[today];
  const taskDone = todayCompletion?.tasks || {};
  const finishedTasks = completedCount(todayCompletion);
  const isDayComplete = finishedTasks >= DAILY_TARGET;
  const punchStreak = completionStreak(completionState);
  const customPack = useMemo(() => {
    void version;
    const customWords = readCustomWords();
    if (customWords.length === 0) return null;
    return {
      slug: CUSTOM_WORDBOOK_SLUG,
      shortTitle: "我的词书",
      level: "Custom",
      route: "/english/vocabulary/custom",
      words: customWords.map((word) => ({
        word: word.word,
        meaningZh: word.meaningZh,
        collocation: word.collocation,
      })),
    } satisfies TodayPack;
  }, [version]);
  const allPacks = useMemo(() => (customPack ? [customPack, ...packs] : packs), [customPack, packs]);
  const activePack = allPacks[seed % Math.max(allPacks.length, 1)] || allPacks[0];
  const activeReading = readingPacks[seed % Math.max(readingPacks.length, 1)] || readingPacks[0];
  const activeQuestionPack = questionPacks[seed % Math.max(questionPacks.length, 1)] || questionPacks[0];
  const chapter = activeReading ? (seed % activeReading.targetArticles) + 1 : 1;
  const questionPage = (seed % 25) + 1;

  const vocabQueue = useMemo(() => {
    void version;
    const due: Array<TodayWord & { pack: TodayPack; dueText: string; stage: number }> = [];
    allPacks.forEach((pack) => {
      const records = readVocabularyProgress(pack.slug);
      pack.words.forEach((word) => {
        const record = records[word.word];
        if (record && (record.status === "unknown" || Number(record.nextAt || 0) <= Date.now())) {
          due.push({
            ...word,
            pack,
            dueText: relativeDue(record.nextAt),
            stage: Number(record.stage || 0),
          });
        }
      });
    });
    return due.slice(0, 12);
  }, [allPacks, version]);

  const newWords = useMemo(() => buildNewWords(activePack, seed), [activePack, seed]);
  const completion = Math.min(100, Math.round((finishedTasks / DAILY_TARGET) * 100));
  const firstHref = localizedHref(
    vocabQueue[0]?.pack.route
      ? vocabQueue[0].pack.route
      : activePack
        ? activePack.route
        : "/english/vocabulary",
    language,
  );
  const week = useMemo(() => Array.from({ length: 7 }, (_, index) => {
    const date = dateFromToday(index - 6);
    const key = todayKey(date);
    const day = completionState.byDay[key];
    return {
      key,
      label: shortDayLabel(date),
      done: completedCount(day) >= DAILY_TARGET,
      partial: completedCount(day),
      today: key === today,
    };
  }), [completionState.byDay, today]);
  const tomorrowPreview = useMemo(() => {
    void version;
    const tomorrowEnd = dateFromToday(2).getTime() - 1;
    const due: Array<TodayWord & { pack: TodayPack; dueText: string }> = [];
    allPacks.forEach((pack) => {
      const records = readVocabularyProgress(pack.slug);
      pack.words.forEach((word) => {
        const record = records[word.word];
        if (record && Number(record.nextAt || 0) <= tomorrowEnd) {
          due.push({ ...word, pack, dueText: relativeDue(record.nextAt) });
        }
      });
    });
    const nextWords = previewVocabularyForDate(allPacks, 1);
    const tomorrowSeed = daySeed(dateFromToday(1));
    const tomorrowReading = readingPacks[tomorrowSeed % Math.max(readingPacks.length, 1)] || readingPacks[0];
    const tomorrowQuestionPack = questionPacks[tomorrowSeed % Math.max(questionPacks.length, 1)] || questionPacks[0];
    return {
      due: due.slice(0, 4),
      newPack: nextWords.pack,
      newWords: nextWords.words,
      reading: tomorrowReading,
      readingChapter: tomorrowReading ? (tomorrowSeed % tomorrowReading.targetArticles) + 1 : 1,
      questionPack: tomorrowQuestionPack,
    };
  }, [allPacks, questionPacks, readingPacks, version]);

  useEffect(() => {
    const refresh = () => {
      setProgress(readLocalProgress());
      setTypingStats(readTypingStats());
      setCompletionState(readCompletionState());
      setVersion((value) => value + 1);
    };
    const timer = window.setTimeout(refresh, 0);
    window.addEventListener("storage", refresh);
    window.addEventListener("vantaapi-local-progress", refresh);
    window.addEventListener("vantaapi-today-punch", refresh);
    window.addEventListener("vantaapi-custom-wordbook", refresh);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("storage", refresh);
      window.removeEventListener("vantaapi-local-progress", refresh);
      window.removeEventListener("vantaapi-today-punch", refresh);
      window.removeEventListener("vantaapi-custom-wordbook", refresh);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, []);

  function startTask(id: string, title: string, href: string) {
    recordLocalActivity({
      id: `today:${todayKey()}:${id}`,
      title,
      href,
      kind: "review",
    });
  }

  function completeTask(id: TodayTaskId, title: string, href: string) {
    const current = readCompletionState();
    const key = todayKey();
    const currentDay = current.byDay[key] || { tasks: {}, updatedAt: Date.now() };
    const nextDay = {
      ...currentDay,
      tasks: { ...currentDay.tasks, [id]: true },
      updatedAt: Date.now(),
    } satisfies TodayCompletionDay;
    if (completedCount(nextDay) >= DAILY_TARGET && !nextDay.completedAt) {
      nextDay.completedAt = Date.now();
    }
    const nextState = {
      version: 1,
      byDay: {
        ...current.byDay,
        [key]: nextDay,
      },
    } satisfies TodayCompletionState;
    setCompletionState(nextState);
    persistCompletionState(nextState);
    recordLocalActivity({
      id: `today:${key}:${id}:done`,
      title,
      href,
      kind: "review",
      completed: true,
      correct: true,
    });
  }

  const tasks: Array<{
    id: TodayTaskId;
    eyebrow: string;
    title: string;
    body: string;
    href: string;
    action: string;
  }> = [
    {
      id: "review",
      eyebrow: "01 Review",
      title: vocabQueue.length > 0 ? "先复习到期单词" : "先学今日新词",
      body: vocabQueue.length > 0 ? `${vocabQueue.length} 个单词已经到复习时间` : `${activePack?.shortTitle || "Vocabulary"} 今日 10 个新词`,
      href: firstHref,
      action: "开始背词",
    },
    {
      id: "typing",
      eyebrow: "02 Typing",
      title: "英文听写打字",
      body: `当前打字进度 ${typingStats.index + 1} 正确 ${typingStats.correct} 错误 ${typingStats.wrong}`,
      href: localizedHref("/english/typing", language),
      action: "开始听写",
    },
    {
      id: "reading",
      eyebrow: "03 Reading",
      title: activeReading?.zhTitle || "原创阅读",
      body: `今日第 ${chapter} 章 先读主旨 再圈逻辑词`,
      href: localizedHref(activeReading ? `/english/reading/${activeReading.slug}?page=${chapter}` : "/english/reading", language),
      action: "开始阅读",
    },
    {
      id: "questions",
      eyebrow: "04 Questions",
      title: activeQuestionPack?.zhTitle || "原创题库",
      body: "做一页选择填空 5 秒内先答 再看解析",
      href: localizedHref(activeQuestionPack ? `/english/question-bank/${activeQuestionPack.slug}?page=${questionPage}` : "/english/question-bank", language),
      action: "开始刷题",
    },
  ];

  return (
    <section className="apple-shell py-5">
      <div className="dense-panel overflow-hidden p-5 sm:p-6">
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-end">
          <div>
            <p className="eyebrow">Today {today}</p>
            <h1 className="mt-3 max-w-4xl text-3xl font-semibold leading-[1.04] sm:text-4xl">
              {isDayComplete ? "今日已完成" : "今日学习"}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[color:var(--muted)]">
              {isDayComplete
                ? "今天 4 个动作已经完成。明天回来先复习到期词，再继续新内容。"
                : "先复习 再新学 再打字 最后刷题。每天打开这一页就够了。"}
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Link href={firstHref} className="dense-action-primary px-4 py-2.5" onClick={() => startTask("start", "Today learning started", firstHref)}>
                {isDayComplete ? "继续加练" : "一键开始"}
              </Link>
              <Link href={localizedHref("/english/typing", language)} className="dense-action px-4 py-2.5">
                直接听写
              </Link>
              <Link href={localizedHref("/wrong", language)} className="dense-action px-4 py-2.5">
                错题复习
              </Link>
            </div>
          </div>

          <div className="rounded-[8px] border border-slate-200 bg-white/75 p-4">
            <p className="eyebrow">Today Progress</p>
            <div className="mt-3 flex items-end gap-2">
              <span className="text-5xl font-semibold">{completion}</span>
              <span className="pb-2 text-sm font-semibold text-[color:var(--muted)]">%</span>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
              <span className="block h-full rounded-full bg-slate-950" style={{ width: `${completion}%` }} />
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
              <Metric label="done" value={`${finishedTasks}/4`} />
              <Metric label="streak" value={`${punchStreak}d`} />
              <Metric label="acc" value={summary.completed ? `${summary.accuracy}%` : "new"} />
            </div>
          </div>
        </div>
      </div>

      {isDayComplete ? (
        <section className="mt-3 rounded-[8px] border border-emerald-200 bg-emerald-50 p-5">
          <p className="eyebrow text-emerald-700">Daily Punch</p>
          <div className="mt-2 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-emerald-950">今日已打卡完成</h2>
              <p className="mt-2 text-sm leading-6 text-emerald-800">
                复习 新学 听写 阅读/刷题已经闭环。今天可以收手，也可以继续加练。
              </p>
            </div>
            <Link href={localizedHref("/english/typing", language)} className="dense-action-primary w-fit">
              继续加练
            </Link>
          </div>
        </section>
      ) : null}

      <section className="mt-3 grid gap-3 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="grid gap-3 md:grid-cols-2">
          {tasks.map((task) => (
            <article key={task.id} className={`dense-card p-4 ${taskDone[task.id] ? "border-emerald-200 bg-emerald-50/70" : ""}`}>
              <p className="eyebrow">{task.eyebrow}</p>
              <div className="mt-2 flex items-start justify-between gap-3">
                <h2 className="text-xl font-semibold">{task.title}</h2>
                {taskDone[task.id] ? (
                  <span className="rounded-full border border-emerald-200 bg-white px-2.5 py-1 text-xs font-semibold text-emerald-700">
                    已完成
                  </span>
                ) : null}
              </div>
              <p className="mt-2 min-h-12 text-sm leading-6 text-[color:var(--muted)]">{task.body}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link href={task.href} className="dense-action-primary" onClick={() => startTask(task.id, task.title, task.href)}>
                  {task.action}
                </Link>
                <button
                  type="button"
                  className={taskDone[task.id] ? "dense-action opacity-70" : "dense-action"}
                  disabled={Boolean(taskDone[task.id])}
                  onClick={() => completeTask(task.id, `${task.title} done`, task.href)}
                >
                  {taskDone[task.id] ? "已完成" : "标记完成"}
                </button>
              </div>
            </article>
          ))}
        </div>

        <aside className="dense-panel dense-grid-bg p-5">
          <p className="eyebrow text-slate-400">Streak</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">7 天打卡格</h2>
          <div className="mt-4 grid grid-cols-7 gap-1.5">
            {week.map((day) => (
              <div
                key={day.key}
                className={`rounded-[8px] border p-2 text-center ${
                  day.done
                    ? "border-emerald-300 bg-emerald-300 text-slate-950"
                    : day.today
                      ? "border-white/35 bg-white/15 text-white"
                      : "border-white/10 bg-white/[0.07] text-slate-300"
                }`}
              >
                <p className="text-[10px] font-semibold">{day.label}</p>
                <p className="mt-1 text-sm font-semibold">{day.done ? "done" : day.partial ? `${day.partial}/4` : "-"}</p>
              </div>
            ))}
          </div>
          <div className="mt-5 border-t border-white/10 pt-4">
            <p className="eyebrow text-slate-400">Review Queue</p>
            <h3 className="mt-2 text-xl font-semibold text-white">今天先处理这些</h3>
          </div>
          <div className="mt-4 grid gap-2">
            {vocabQueue.length > 0 ? (
              vocabQueue.slice(0, 6).map((word) => (
                <Link key={`${word.pack.slug}-${word.word}`} href={localizedHref(word.pack.route, language)} className="rounded-[8px] border border-white/10 bg-white/[0.07] p-3 text-white transition hover:border-sky-200/50">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold">{word.word}</span>
                    <span className="text-xs text-slate-300">stage {word.stage}</span>
                  </div>
                  <p className="mt-1 text-xs leading-5 text-slate-300">{word.meaningZh} · {word.dueText}</p>
                </Link>
              ))
            ) : (
              newWords.slice(0, 6).map((word) => (
                <Link key={`${activePack.slug}-${word.word}`} href={localizedHref(activePack.route, language)} className="rounded-[8px] border border-white/10 bg-white/[0.07] p-3 text-white transition hover:border-sky-200/50">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold">{word.word}</span>
                    <span className="text-xs text-slate-300">new</span>
                  </div>
                  <p className="mt-1 text-xs leading-5 text-slate-300">{word.meaningZh} · {word.collocation}</p>
                </Link>
              ))
            )}
          </div>
        </aside>
      </section>

      <section className="today-rule-strip">
        <span>复习优先</span>
        <span>听写强制打对</span>
        <span>阅读抓主旨</span>
        <span>刷题先答后看解析</span>
        <span>4 个动作完成今天</span>
      </section>

      <section className="mt-3 dense-panel p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="eyebrow">Tomorrow Preview</p>
            <h2 className="mt-2 text-2xl font-semibold">明天回来会先做这些</h2>
            <p className="mt-2 text-sm leading-6 text-[color:var(--muted)]">
              明日预告只来自本机复习记录和站内原创内容，不需要登录。
            </p>
          </div>
          <Link href={localizedHref("/today", language)} className="dense-action-primary w-fit">
            明天继续从这里开始
          </Link>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <div className="dense-card p-4">
            <p className="eyebrow">Words</p>
            <h3 className="mt-2 text-xl font-semibold">
              {tomorrowPreview.due.length > 0 ? "明日到期词" : `${tomorrowPreview.newPack?.shortTitle || "Vocabulary"} 新词`}
            </h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {(tomorrowPreview.due.length > 0 ? tomorrowPreview.due : tomorrowPreview.newWords).slice(0, 4).map((word) => (
                <span key={`${word.word}-${word.meaningZh}`} className="dense-status">
                  {word.word}
                </span>
              ))}
            </div>
          </div>
          <div className="dense-card p-4">
            <p className="eyebrow">Reading</p>
            <h3 className="mt-2 text-xl font-semibold">{tomorrowPreview.reading?.zhTitle || "原创阅读"}</h3>
            <p className="mt-2 text-sm leading-6 text-[color:var(--muted)]">第 {tomorrowPreview.readingChapter} 章 主旨 逻辑词 输出句</p>
          </div>
          <div className="dense-card p-4">
            <p className="eyebrow">Questions</p>
            <h3 className="mt-2 text-xl font-semibold">{tomorrowPreview.questionPack?.zhTitle || "原创题库"}</h3>
            <p className="mt-2 text-sm leading-6 text-[color:var(--muted)]">继续做一页选择填空 先答再看解析</p>
          </div>
        </div>
      </section>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[8px] border border-slate-200 bg-white p-2">
      <p className="text-[10px] font-semibold uppercase tracking-normal text-[color:var(--muted)]">{label}</p>
      <p className="mt-1 font-semibold">{value}</p>
    </div>
  );
}
