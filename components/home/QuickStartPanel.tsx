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

const quickActions: QuickAction[] = [
  {
    id: "quick:search",
    title: "Search",
    label: "Find A Page",
    href: "/search",
    kind: "review",
    body: "Search tools lessons languages wordbook typing and review from one place.",
  },
  {
    id: "quick:today",
    title: "Today Plan",
    label: "Start Today",
    href: "/today",
    kind: "review",
    body: "Open the daily queue for review new words typing reading and questions.",
  },
  {
    id: "quick:wordbook",
    title: "My Wordbook",
    label: "Open Wordbook",
    href: "/english/vocabulary/custom?lang=zh",
    kind: "english",
    body: "Import your own words add tags and train them directly.",
  },
  {
    id: "quick:tool:prompt",
    title: "AI Tool",
    label: "Start AI Tool",
    href: "/tools/prompt-optimizer",
    kind: "tool",
    body: "Turn a rough idea into a copy ready prompt.",
  },
  {
    id: "quick:programming:python",
    title: "Python Drill",
    label: "Start Python Drill",
    href: "/programming/python",
    kind: "programming",
    body: "Answer one zero foundation programming question.",
  },
  {
    id: "quick:english:typing",
    title: "English Typing",
    label: "Start Typing Drill",
    href: "/english/typing?lang=zh",
    kind: "english",
    body: "Listen then type words and sentences until correct.",
  },
  {
    id: "quick:language:japanese",
    title: "Japanese From Zero",
    label: "Start Japanese",
    href: "/languages/japanese",
    kind: "world-language",
    body: "Begin with sound script and first phrases.",
  },
];

function readState() {
  return readLocalProgress();
}

function timeAgo(ts: number) {
  const diff = Date.now() - ts;
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;
  if (diff < minute) return "just now";
  if (diff < hour) return `${Math.max(1, Math.round(diff / minute))} min ago`;
  if (diff < day) return `${Math.max(1, Math.round(diff / hour))} h ago`;
  return `${Math.max(1, Math.round(diff / day))} d ago`;
}

export default function QuickStartPanel() {
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
            <p className="eyebrow">Quick Start</p>
            <h2 className="mt-2 text-2xl font-semibold">Pick one door</h2>
          </div>
          {continueItem ? (
            <Link href={continueItem.href} className="dense-action-primary">
              Continue
            </Link>
          ) : (
            <Link href="/search" className="dense-action-primary">
              Search first
            </Link>
          )}
        </div>

        <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
          {quickActions.map((action) => (
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
            <p className="eyebrow text-slate-400">Local Progress</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">Browser memory</h2>
          </div>
          <span className="rounded-full border border-white/10 px-3 py-1 text-xs font-semibold text-slate-200">
            private
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Stat label="Today" value={String(summary.todayCount)} />
          <Stat label="Streak" value={`${summary.streak}d`} />
          <Stat label="Done" value={String(summary.completed)} />
          <Stat label="Accuracy" value={summary.completed ? `${summary.accuracy}%` : "new"} />
        </div>

        <div className="mt-4 grid gap-2">
          {summary.recents.length > 0 ? (
            summary.recents.slice(0, 4).map((item) => (
              <Link key={`${item.id}-${item.ts}`} href={item.href} className="rounded-[8px] border border-white/10 bg-white/[0.07] p-3 text-white transition hover:border-sky-200/50">
                <div className="flex items-center justify-between gap-3">
                  <span className="truncate text-sm font-semibold">{item.title}</span>
                  <span className="shrink-0 text-xs text-slate-300">{timeAgo(item.ts)}</span>
                </div>
                <p className="mt-1 text-xs text-slate-300">{item.completed ? "completed" : "started"} · {item.kind}</p>
              </Link>
            ))
          ) : (
            <p className="rounded-[8px] border border-white/10 bg-white/[0.07] p-3 text-sm leading-6 text-slate-300">
              Start one task and this panel will remember it on this device.
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
