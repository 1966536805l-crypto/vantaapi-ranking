"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  localProgressSummary,
  readLocalProgress,
  recordLocalActivity,
  type LocalActivityKind,
  type LocalProgressState,
} from "@/lib/local-progress";

type QuickAction = {
  id: string;
  title: string;
  label: string;
  href: string;
  kind: LocalActivityKind;
  body: string;
};

type QuickCopy = {
  quickStart: string;
  pickDoor: string;
  continue: string;
  searchFirst: string;
  localProgress: string;
  browserMemory: string;
  private: string;
  today: string;
  streak: string;
  done: string;
  accuracy: string;
  new: string;
  empty: string;
  completed: string;
  started: string;
  justNow: string;
  minAgo: string;
  hourAgo: string;
  dayAgo: string;
};

const quickCopy: Record<string, QuickCopy> = {
  english: {
    quickStart: "Quick Start",
    pickDoor: "Pick one door",
    continue: "Continue",
    searchFirst: "Search first",
    localProgress: "Local Progress",
    browserMemory: "Browser memory",
    private: "private",
    today: "Today",
    streak: "Streak",
    done: "Done",
    accuracy: "Accuracy",
    new: "new",
    empty: "Start one task and this panel will remember it on this device.",
    completed: "completed",
    started: "started",
    justNow: "just now",
    minAgo: "min ago",
    hourAgo: "h ago",
    dayAgo: "d ago",
  },
  chinese: {
    quickStart: "快速开始",
    pickDoor: "选一个入口",
    continue: "继续",
    searchFirst: "先搜索",
    localProgress: "本地进度",
    browserMemory: "浏览器记忆",
    private: "私密",
    today: "今日",
    streak: "连续",
    done: "完成",
    accuracy: "正确率",
    new: "新的",
    empty: "开始一个任务后 这里会在本设备记住它",
    completed: "已完成",
    started: "已开始",
    justNow: "刚刚",
    minAgo: "分钟前",
    hourAgo: "小时前",
    dayAgo: "天前",
  },
  japanese: {
    quickStart: "クイック開始",
    pickDoor: "入口を選ぶ",
    continue: "続ける",
    searchFirst: "先に検索",
    localProgress: "ローカル進捗",
    browserMemory: "ブラウザ記録",
    private: "非公開",
    today: "今日",
    streak: "連続",
    done: "完了",
    accuracy: "正答率",
    new: "新規",
    empty: "一つ始めると この端末に記録されます",
    completed: "完了",
    started: "開始",
    justNow: "たった今",
    minAgo: "分前",
    hourAgo: "時間前",
    dayAgo: "日前",
  },
  korean: {
    quickStart: "빠른 시작",
    pickDoor: "입구 선택",
    continue: "계속",
    searchFirst: "먼저 검색",
    localProgress: "로컬 진행",
    browserMemory: "브라우저 기록",
    private: "개인",
    today: "오늘",
    streak: "연속",
    done: "완료",
    accuracy: "정확도",
    new: "새로 시작",
    empty: "작업을 시작하면 이 기기에 기록됩니다",
    completed: "완료",
    started: "시작",
    justNow: "방금",
    minAgo: "분 전",
    hourAgo: "시간 전",
    dayAgo: "일 전",
  },
  spanish: {
    quickStart: "Inicio rápido",
    pickDoor: "Elige una entrada",
    continue: "Continuar",
    searchFirst: "Buscar primero",
    localProgress: "Progreso local",
    browserMemory: "Memoria del navegador",
    private: "privado",
    today: "Hoy",
    streak: "Racha",
    done: "Hecho",
    accuracy: "Precisión",
    new: "nuevo",
    empty: "Empieza una tarea y este panel la recordará en este dispositivo.",
    completed: "completado",
    started: "iniciado",
    justNow: "ahora",
    minAgo: "min",
    hourAgo: "h",
    dayAgo: "d",
  },
  french: {
    quickStart: "Démarrage rapide",
    pickDoor: "Choisir une entrée",
    continue: "Continuer",
    searchFirst: "Chercher d abord",
    localProgress: "Progression locale",
    browserMemory: "Mémoire navigateur",
    private: "privé",
    today: "Aujourd hui",
    streak: "Série",
    done: "Fait",
    accuracy: "Précision",
    new: "nouveau",
    empty: "Commencez une tâche et ce panneau la gardera sur cet appareil.",
    completed: "terminé",
    started: "commencé",
    justNow: "à l instant",
    minAgo: "min",
    hourAgo: "h",
    dayAgo: "j",
  },
};

const quickActions: Record<string, QuickAction[]> = {
  english: [
    { id: "quick:search", title: "Search", label: "Find A Page", href: "/search", kind: "review", body: "Search tools lessons languages wordbook typing and review from one place." },
    { id: "quick:today", title: "Today Plan", label: "Start Today", href: "/today", kind: "review", body: "Open the daily queue for review new words typing reading and questions." },
    { id: "quick:wordbook", title: "My Wordbook", label: "Open Wordbook", href: "/english/vocabulary/custom?lang=zh", kind: "english", body: "Import your own words add tags and train them directly." },
    { id: "quick:tool:prompt", title: "AI Tool", label: "Start AI Tool", href: "/tools/prompt-optimizer", kind: "tool", body: "Turn a rough idea into a copy ready prompt." },
    { id: "quick:programming:python", title: "Python Drill", label: "Start Python Drill", href: "/programming/python", kind: "programming", body: "Answer one zero foundation programming question." },
    { id: "quick:english:typing", title: "English Typing", label: "Start Typing Drill", href: "/english/typing?lang=zh", kind: "english", body: "Listen then type words and sentences until correct." },
    { id: "quick:language:japanese", title: "Japanese From Zero", label: "Start Japanese", href: "/languages/japanese", kind: "world-language", body: "Begin with sound script and first phrases." },
  ],
  chinese: [
    { id: "quick:search", title: "搜索", label: "找页面", href: "/search", kind: "review", body: "从一个入口搜索工具 课程 语言 词书 打字和复习" },
    { id: "quick:today", title: "今日计划", label: "今日开始", href: "/today", kind: "review", body: "打开每日队列 复习 新词 打字 阅读和题目" },
    { id: "quick:wordbook", title: "我的词书", label: "打开词书", href: "/english/vocabulary/custom?lang=zh", kind: "english", body: "导入自己的单词 加标签 直接训练" },
    { id: "quick:tool:prompt", title: "AI 工具", label: "启动工具", href: "/tools/prompt-optimizer", kind: "tool", body: "把粗糙想法改成可直接使用的提示词" },
    { id: "quick:programming:python", title: "Python 练习", label: "开始 Python", href: "/programming/python", kind: "programming", body: "做一道零基础编程题" },
    { id: "quick:english:typing", title: "英语打字", label: "开始打字", href: "/english/typing?lang=zh", kind: "english", body: "听音后输入单词和句子 直到正确" },
    { id: "quick:language:japanese", title: "日语零基础", label: "开始日语", href: "/languages/japanese", kind: "world-language", body: "从声音 文字和第一批短句开始" },
  ],
  japanese: [
    { id: "quick:search", title: "検索", label: "ページを探す", href: "/search", kind: "review", body: "ツール レッスン 言語 単語帳 タイピング 復習を一つの入口から探します" },
    { id: "quick:today", title: "今日の計画", label: "今日から始める", href: "/today", kind: "review", body: "復習 新語 タイピング 読解 問題の毎日キューを開きます" },
    { id: "quick:wordbook", title: "単語帳", label: "単語帳を開く", href: "/english/vocabulary/custom?lang=zh", kind: "english", body: "自分の単語を入れてタグを付けて直接練習します" },
    { id: "quick:tool:prompt", title: "AI ツール", label: "ツールを開始", href: "/tools/prompt-optimizer", kind: "tool", body: "粗い考えをそのまま使えるプロンプトに整えます" },
    { id: "quick:programming:python", title: "Python 演習", label: "Python 開始", href: "/programming/python", kind: "programming", body: "ゼロから解けるプログラミング問題を一つ解きます" },
    { id: "quick:english:typing", title: "英語タイピング", label: "タイピング開始", href: "/english/typing?lang=zh", kind: "english", body: "音を聞いて単語と文を正しく入力します" },
    { id: "quick:language:japanese", title: "日本語ゼロ", label: "日本語開始", href: "/languages/japanese", kind: "world-language", body: "音 文字 最初の短文から始めます" },
  ],
  korean: [
    { id: "quick:search", title: "검색", label: "페이지 찾기", href: "/search", kind: "review", body: "도구 수업 언어 단어장 타이핑 복습을 한 곳에서 찾습니다" },
    { id: "quick:today", title: "오늘 계획", label: "오늘 시작", href: "/today", kind: "review", body: "복습 새 단어 타이핑 읽기 문제의 일일 대기열을 엽니다" },
    { id: "quick:wordbook", title: "내 단어장", label: "단어장 열기", href: "/english/vocabulary/custom?lang=zh", kind: "english", body: "내 단어를 가져오고 태그를 붙여 바로 훈련합니다" },
    { id: "quick:tool:prompt", title: "AI 도구", label: "도구 시작", href: "/tools/prompt-optimizer", kind: "tool", body: "거친 생각을 바로 쓸 수 있는 프롬프트로 다듬습니다" },
    { id: "quick:programming:python", title: "Python 훈련", label: "Python 시작", href: "/programming/python", kind: "programming", body: "제로 베이스 프로그래밍 문제를 하나 풉니다" },
    { id: "quick:english:typing", title: "영어 타이핑", label: "타이핑 시작", href: "/english/typing?lang=zh", kind: "english", body: "소리를 듣고 단어와 문장을 정확히 입력합니다" },
    { id: "quick:language:japanese", title: "일본어 제로", label: "일본어 시작", href: "/languages/japanese", kind: "world-language", body: "소리 문자 첫 문장부터 시작합니다" },
  ],
  spanish: [
    { id: "quick:search", title: "Buscar", label: "Encontrar página", href: "/search", kind: "review", body: "Busca herramientas lecciones idiomas vocabulario typing y repaso desde un lugar." },
    { id: "quick:today", title: "Plan de hoy", label: "Empezar hoy", href: "/today", kind: "review", body: "Abre la cola diaria de repaso palabras typing lectura y preguntas." },
    { id: "quick:wordbook", title: "Mi vocabulario", label: "Abrir vocabulario", href: "/english/vocabulary/custom?lang=zh", kind: "english", body: "Importa tus palabras añade etiquetas y entrena directo." },
    { id: "quick:tool:prompt", title: "Herramienta AI", label: "Iniciar herramienta", href: "/tools/prompt-optimizer", kind: "tool", body: "Convierte una idea rápida en un prompt listo para usar." },
    { id: "quick:programming:python", title: "Práctica Python", label: "Empezar Python", href: "/programming/python", kind: "programming", body: "Resuelve una pregunta de programación desde cero." },
    { id: "quick:english:typing", title: "Typing inglés", label: "Iniciar typing", href: "/english/typing?lang=zh", kind: "english", body: "Escucha y escribe palabras y frases hasta acertar." },
    { id: "quick:language:japanese", title: "Japonés desde cero", label: "Empezar japonés", href: "/languages/japanese", kind: "world-language", body: "Empieza con sonido escritura y primeras frases." },
  ],
  french: [
    { id: "quick:search", title: "Recherche", label: "Trouver une page", href: "/search", kind: "review", body: "Chercher outils leçons langues lexique typing et révision depuis un seul endroit." },
    { id: "quick:today", title: "Plan du jour", label: "Commencer", href: "/today", kind: "review", body: "Ouvrir la file quotidienne révision mots typing lecture et questions." },
    { id: "quick:wordbook", title: "Mon lexique", label: "Ouvrir lexique", href: "/english/vocabulary/custom?lang=zh", kind: "english", body: "Importer vos mots ajouter des tags et entraîner directement." },
    { id: "quick:tool:prompt", title: "Outil IA", label: "Lancer outil", href: "/tools/prompt-optimizer", kind: "tool", body: "Transformer une idée brute en prompt prêt à utiliser." },
    { id: "quick:programming:python", title: "Exercice Python", label: "Commencer Python", href: "/programming/python", kind: "programming", body: "Répondre à une question de programmation depuis zéro." },
    { id: "quick:english:typing", title: "Typing anglais", label: "Lancer typing", href: "/english/typing?lang=zh", kind: "english", body: "Écouter puis taper mots et phrases jusqu à réussir." },
    { id: "quick:language:japanese", title: "Japonais zéro", label: "Commencer japonais", href: "/languages/japanese", kind: "world-language", body: "Commencer avec son écriture et premières phrases." },
  ],
};

function readState() {
  return readLocalProgress();
}

function timeAgo(ts: number, copy: QuickCopy) {
  const diff = Date.now() - ts;
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;
  if (diff < minute) return copy.justNow;
  if (diff < hour) return `${Math.max(1, Math.round(diff / minute))} ${copy.minAgo}`;
  if (diff < day) return `${Math.max(1, Math.round(diff / hour))} ${copy.hourAgo}`;
  return `${Math.max(1, Math.round(diff / day))} ${copy.dayAgo}`;
}

export default function QuickStartPanel({ ui = "english" }: { ui?: string }) {
  const copy = quickCopy[ui] ?? quickCopy.english;
  const actions = quickActions[ui] ?? quickActions.english;
  const focusedActions = actions.filter((action) => action.kind === "tool" || action.kind === "programming" || action.id === "quick:search");
  const [state, setState] = useState<LocalProgressState>(() => readState());
  const summary = useMemo(() => localProgressSummary(state), [state]);
  const continueItem = summary.recents[0];

  useEffect(() => {
    const timer = window.setTimeout(() => setState(readState()), 0);
    const refresh = () => setState(readState());
    window.addEventListener("storage", refresh);
    window.addEventListener("vantaapi-local-progress", refresh);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("storage", refresh);
      window.removeEventListener("vantaapi-local-progress", refresh);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, []);

  function recordStart(action: QuickAction) {
    recordLocalActivity({
      id: action.id,
      title: action.title,
      href: action.href,
      kind: action.kind,
    });
  }

  return (
    <section className="mt-3 grid gap-3 xl:grid-cols-[minmax(0,1.05fr)_minmax(320px,0.95fr)]">
      <div className="dense-panel p-5">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="eyebrow">{copy.quickStart}</p>
            <h2 className="mt-2 text-2xl font-semibold">{copy.pickDoor}</h2>
          </div>
          {continueItem ? (
            <Link href={continueItem.href} className="dense-action-primary">
              {copy.continue}
            </Link>
          ) : (
            <Link href="/search" className="dense-action-primary">
              {copy.searchFirst}
            </Link>
          )}
        </div>

        <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
          {focusedActions.map((action) => (
            <Link
              key={action.id}
              href={action.href}
              className="dense-card p-4 transition hover:-translate-y-0.5 hover:border-slate-300"
              onClick={() => recordStart(action)}
            >
              <p className="eyebrow">{action.title}</p>
              <h3 className="mt-2 text-xl font-semibold">{action.label}</h3>
              <p className="mt-3 text-sm leading-6 text-[color:var(--muted)]">{action.body}</p>
            </Link>
          ))}
        </div>
      </div>

      <aside className="dense-panel dense-grid-bg p-5">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="eyebrow text-slate-400">{copy.localProgress}</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">{copy.browserMemory}</h2>
          </div>
          <span className="rounded-full border border-white/10 px-3 py-1 text-xs font-semibold text-slate-200">
            {copy.private}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Stat label={copy.today} value={String(summary.todayCount)} />
          <Stat label={copy.streak} value={`${summary.streak}d`} />
          <Stat label={copy.done} value={String(summary.completed)} />
          <Stat label={copy.accuracy} value={summary.completed ? `${summary.accuracy}%` : copy.new} />
        </div>

        <div className="mt-4 grid gap-2">
          {summary.recents.length > 0 ? (
            summary.recents.slice(0, 4).map((item) => (
              <Link key={`${item.id}-${item.ts}`} href={item.href} className="rounded-[8px] border border-white/10 bg-white/[0.07] p-3 text-white transition hover:border-sky-200/50">
                <div className="flex items-center justify-between gap-3">
                  <span className="truncate text-sm font-semibold">{item.title}</span>
                  <span className="shrink-0 text-xs text-slate-300">{timeAgo(item.ts, copy)}</span>
                </div>
                <p className="mt-1 text-xs text-slate-300">{item.completed ? copy.completed : copy.started} · {item.kind}</p>
              </Link>
            ))
          ) : (
            <p className="rounded-[8px] border border-white/10 bg-white/[0.07] p-3 text-sm leading-6 text-slate-300">
              {copy.empty}
            </p>
          )}
        </div>
      </aside>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[8px] border border-white/10 bg-white/[0.07] p-3 text-white">
      <p className="text-[11px] font-semibold uppercase tracking-normal text-slate-300">{label}</p>
      <p className="mt-1 text-3xl font-semibold">{value}</p>
    </div>
  );
}
