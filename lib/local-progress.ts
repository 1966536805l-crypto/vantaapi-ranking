export type LocalActivityKind = "tool" | "programming" | "english" | "world-language" | "review";

export type LocalActivityEvent = {
  id: string;
  title: string;
  href: string;
  kind: LocalActivityKind;
  completed?: boolean;
  correct?: boolean;
  ts?: number;
};

export type LocalProgressState = {
  version: 1;
  totals: {
    actions: number;
    completed: number;
    correct: number;
    wrong: number;
  };
  dayCounts: Record<string, number>;
  recents: Required<LocalActivityEvent>[];
  updatedAt: number;
};

const STORAGE_KEY = "vantaapi-local-progress-v1";
const MAX_RECENTS = 16;

const emptyState: LocalProgressState = {
  version: 1,
  totals: {
    actions: 0,
    completed: 0,
    correct: 0,
    wrong: 0,
  },
  dayCounts: {},
  recents: [],
  updatedAt: 0,
};

function isBrowser() {
  return typeof window !== "undefined";
}

function todayKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function normalizeState(value: unknown): LocalProgressState {
  if (!value || typeof value !== "object") return emptyState;
  const candidate = value as Partial<LocalProgressState>;
  return {
    version: 1,
    totals: {
      actions: Math.max(0, Number(candidate.totals?.actions || 0)),
      completed: Math.max(0, Number(candidate.totals?.completed || 0)),
      correct: Math.max(0, Number(candidate.totals?.correct || 0)),
      wrong: Math.max(0, Number(candidate.totals?.wrong || 0)),
    },
    dayCounts: candidate.dayCounts && typeof candidate.dayCounts === "object" ? candidate.dayCounts : {},
    recents: Array.isArray(candidate.recents) ? candidate.recents.slice(0, MAX_RECENTS) as Required<LocalActivityEvent>[] : [],
    updatedAt: Number(candidate.updatedAt || 0),
  };
}

export function readLocalProgress(): LocalProgressState {
  if (!isBrowser()) return emptyState;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyState;
    return normalizeState(JSON.parse(raw));
  } catch {
    return emptyState;
  }
}

function persistLocalProgress(state: LocalProgressState) {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    window.dispatchEvent(new CustomEvent("vantaapi-local-progress"));
  } catch {
    // Local progress is best effort in private or locked down browsers.
  }
}

export function recordLocalActivity(event: LocalActivityEvent) {
  if (!isBrowser()) return;
  const state = readLocalProgress();
  const ts = event.ts || Date.now();
  const day = todayKey(new Date(ts));
  const normalized: Required<LocalActivityEvent> = {
    id: event.id,
    title: event.title,
    href: event.href,
    kind: event.kind,
    completed: Boolean(event.completed),
    correct: Boolean(event.correct),
    ts,
  };

  const recents = [
    normalized,
    ...state.recents.filter((item) => item.id !== normalized.id),
  ].slice(0, MAX_RECENTS);

  persistLocalProgress({
    version: 1,
    totals: {
      actions: state.totals.actions + 1,
      completed: state.totals.completed + (normalized.completed ? 1 : 0),
      correct: state.totals.correct + (normalized.completed && normalized.correct ? 1 : 0),
      wrong: state.totals.wrong + (normalized.completed && !normalized.correct ? 1 : 0),
    },
    dayCounts: {
      ...state.dayCounts,
      [day]: (state.dayCounts[day] || 0) + 1,
    },
    recents,
    updatedAt: ts,
  });
}

export function localProgressSummary(state: LocalProgressState) {
  const today = todayKey();
  const days = Object.keys(state.dayCounts).filter((day) => state.dayCounts[day] > 0).sort();
  let streak = 0;
  const cursor = new Date();

  while (state.dayCounts[todayKey(cursor)] > 0) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return {
    today,
    todayCount: state.dayCounts[today] || 0,
    streak,
    activeDays: days.length,
    totalActions: state.totals.actions,
    completed: state.totals.completed,
    correct: state.totals.correct,
    wrong: state.totals.wrong,
    accuracy: state.totals.completed ? Math.round((state.totals.correct / state.totals.completed) * 100) : 0,
    recents: state.recents,
  };
}
