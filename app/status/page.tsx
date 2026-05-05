"use client";

import { useEffect, useState } from "react";
import ConsolePage from "@/components/ConsolePage";

type StatusLog = {
  id: string;
  date: string;
  sleep: number;
  focus: number;
  mood: number;
  note: string;
};

export default function StatusPage() {
  const [logs, setLogs] = useState<StatusLog[]>([]);
  const [draft, setDraft] = useState<Omit<StatusLog, "id">>({
    date: new Date().toISOString().slice(0, 10),
    sleep: 7,
    focus: 60,
    mood: 3,
    note: "",
  });

  useEffect(() => {
    const saved = localStorage.getItem("immortal-status");
    if (saved) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLogs(JSON.parse(saved));
    }
  }, []);

  const saveLogs = (next: StatusLog[]) => {
    setLogs(next);
    localStorage.setItem("immortal-status", JSON.stringify(next));
  };

  const addLog = () => {
    const next = [{ ...draft, id: crypto.randomUUID() }, ...logs].slice(0, 30);
    saveLogs(next);
  };

  return (
    <ConsolePage
      eyebrow="状态记录"
      title="睡眠、专注、情绪趋势。只记录，不诊断。"
      description="这里仅用于个人复盘和趋势观察，不提供医疗、心理诊断或治疗建议。如果你遇到严重不适，请联系专业人士或身边可信任的人。"
    >
      <section className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-lg border border-white/10 bg-white/[0.04] p-5">
          <h2 className="text-xl font-semibold text-white">今日记录</h2>
          <input
            type="date"
            value={draft.date}
            onChange={(event) => setDraft({ ...draft, date: event.target.value })}
            className="mt-4 w-full rounded-lg border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none"
          />
          {[
            ["睡眠小时", "sleep", 0, 12],
            ["专注分钟", "focus", 0, 240],
            ["情绪 1-5", "mood", 1, 5],
          ].map(([label, key, min, max]) => (
            <label key={key as string} className="mt-4 block text-sm text-stone-300">
              <div className="mb-2 flex justify-between">
                <span>{label}</span>
                <span className="text-cyan-100">{draft[key as keyof typeof draft]}</span>
              </div>
              <input
                type="range"
                min={min}
                max={max}
                value={Number(draft[key as keyof typeof draft])}
                onChange={(event) =>
                  setDraft({ ...draft, [key as string]: Number(event.target.value) })
                }
                className="w-full accent-cyan-300"
              />
            </label>
          ))}
          <textarea
            value={draft.note}
            onChange={(event) => setDraft({ ...draft, note: event.target.value })}
            placeholder="今天影响状态的因素"
            rows={3}
            className="mt-4 w-full rounded-lg border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none"
          />
          <button onClick={addLog} className="mt-4 w-full rounded-lg bg-cyan-300 px-5 py-3 font-semibold text-black">
            保存记录
          </button>
        </div>

        <div className="rounded-lg border border-white/10 bg-white/[0.04] p-5">
          <h2 className="text-xl font-semibold text-white">最近趋势</h2>
          <div className="mt-5 space-y-3">
            {logs.map((log) => (
              <div key={log.id} className="rounded-lg border border-white/10 bg-black/20 p-4">
                <div className="mb-3 flex justify-between text-sm">
                  <span className="text-white">{log.date}</span>
                  <span className="text-stone-500">情绪 {log.mood}/5</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs text-stone-400">
                  <span>睡眠 {log.sleep}h</span>
                  <span>专注 {log.focus}m</span>
                  <span>情绪 {log.mood}</span>
                </div>
                {log.note && <p className="mt-3 text-sm text-stone-400">{log.note}</p>}
              </div>
            ))}
            {logs.length === 0 && (
              <div className="rounded-lg border border-dashed border-white/15 py-14 text-center text-stone-500">
                还没有状态记录
              </div>
            )}
          </div>
        </div>
      </section>
    </ConsolePage>
  );
}
