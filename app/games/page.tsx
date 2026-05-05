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
        <div className="rounded-lg border border-white/10 bg-white/[0.04] p-5">
          <h2 className="text-xl font-semibold text-white">Focus Grid</h2>
          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="rounded-lg border border-white/10 bg-black/30 p-4">
              <p className="text-xs text-stone-500">得分</p>
              <p className="mt-1 text-4xl font-bold text-cyan-100">{score}</p>
            </div>
            <div className="rounded-lg border border-white/10 bg-black/30 p-4">
              <p className="text-xs text-stone-500">剩余</p>
              <p className="mt-1 text-4xl font-bold text-lime-100">{timeLeft}s</p>
            </div>
          </div>
          <button
            onClick={start}
            className="mt-5 w-full rounded-lg bg-cyan-300 px-5 py-3 font-semibold text-black"
          >
            {running ? "重新开始" : "开始"}
          </button>
          <p className="mt-4 text-xs leading-6 text-stone-500">
            这个页面只是放松和训练注意力，不记录个人健康信息，也不做任何判断。
          </p>
        </div>

        <div className="rounded-lg border border-white/10 bg-white/[0.04] p-5">
          <div className="grid aspect-square max-h-[640px] grid-cols-4 gap-3">
            {tiles.map((tile) => (
              <button
                key={tile.id}
                onClick={() => hit(tile.id)}
                className={`rounded-lg border transition ${
                  tile.active && running
                    ? "border-cyan-200 bg-cyan-300 shadow-xl shadow-cyan-300/20"
                    : "border-white/10 bg-black/30 hover:border-white/25"
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
