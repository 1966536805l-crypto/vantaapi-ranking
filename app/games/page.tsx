"use client";

import { useEffect, useMemo, useState } from "react";
import ConsolePage from "@/components/ConsolePage";

type Tile = {
  id: number;
  active: boolean;
};

export default function GamesPage() {
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [running, setRunning] = useState(false);
  const [active, setActive] = useState(0);

  const tiles = useMemo<Tile[]>(
    () => Array.from({ length: 16 }, (_, id) => ({ id, active: id === active })),
    [active]
  );

  useEffect(() => {
    if (!running) return;
    const timer = window.setTimeout(() => {
      setTimeLeft((current) => {
        if (current <= 1) {
          setRunning(false);
          return 0;
        }
        return current - 1;
      });
    }, 1000);
    return () => window.clearTimeout(timer);
  }, [running, timeLeft]);

  const start = () => {
    setScore(0);
    setTimeLeft(30);
    setActive(5);
    setRunning(true);
  };

  const hit = (id: number) => {
    if (!running || id !== active) return;
    setScore((current) => current + 1);
    setActive((current) => (current * 7 + score + 3) % 16);
  };

  return (
    <ConsolePage
      eyebrow="学习间隙"
      title="30 秒专注反应小游戏。"
      description="点亮哪里点哪里。只在本地运行，不上传数据。玩一轮就回来学习。"
    >
      <section className="grid gap-4 lg:grid-cols-[0.7fr_1.3fr]">
        <div className="border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-mono text-sm font-black uppercase tracking-[0.18em] text-slate-950">Focus Grid</h2>
          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs text-slate-500">得分</p>
              <p className="mt-1 text-4xl font-bold text-blue-700">{score}</p>
            </div>
            <div className="border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs text-slate-500">剩余</p>
              <p className="mt-1 text-4xl font-bold text-amber-600">{timeLeft}s</p>
            </div>
          </div>
          <button
            onClick={start}
            className="mt-5 w-full border border-blue-700 bg-blue-700 px-5 py-3 font-semibold text-white"
          >
            {running ? "重新开始" : "开始"}
          </button>
          <p className="mt-4 text-xs leading-6 text-slate-500">
            这个页面只是放松和训练注意力，不记录个人健康信息，也不做任何判断。
          </p>
        </div>

        <div className="border border-slate-200 bg-white p-5 shadow-sm">
          <div className="grid aspect-square max-h-[640px] grid-cols-4 gap-3">
            {tiles.map((tile) => (
              <button
                key={tile.id}
                onClick={() => hit(tile.id)}
                className={`border transition ${
                  tile.active && running
                    ? "border-blue-600 bg-blue-600 shadow-xl shadow-blue-100"
                    : "border-slate-200 bg-slate-50 hover:border-blue-300"
                }`}
                aria-label={tile.active ? "active tile" : "inactive tile"}
              />
            ))}
          </div>
        </div>
      </section>
    </ConsolePage>
  );
}
