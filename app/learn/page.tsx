"use client";

import { useEffect, useState } from "react";
import ConsolePage from "@/components/ConsolePage";

type Track = {
  name: string;
  focus: string;
  next: string;
  progress: number;
};

const defaults: Track[] = [
  { name: "数学", focus: "函数、导数、错题复盘", next: "整理 5 道错题", progress: 35 },
  { name: "物理", focus: "力学模型和公式条件", next: "做 20 分钟概念卡片", progress: 20 },
  { name: "英语", focus: "阅读、单词、长难句", next: "背 30 个词并读一篇短文", progress: 45 },
  { name: "编程", focus: "Next.js、数据库、部署", next: "完成控制台本地功能", progress: 60 },
];

export default function LearnPage() {
  const [tracks, setTracks] = useState<Track[]>(defaults);

  useEffect(() => {
    const saved = localStorage.getItem("immortal-learn");
    if (saved) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTracks(JSON.parse(saved));
    }
  }, []);

  const updateTrack = (index: number, patch: Partial<Track>) => {
    const next = tracks.map((track, i) =>
      i === index ? { ...track, ...patch } : track
    );
    setTracks(next);
    localStorage.setItem("immortal-learn", JSON.stringify(next));
  };

  return (
    <ConsolePage
      eyebrow="学习路线"
      title="四条路线，按今天能推进的事来走。"
      description="数学、物理、英语、编程都可以记录当前重点、下一步和进度。所有数据先保存在本机浏览器。"
    >
      <section className="grid gap-4 md:grid-cols-2">
        {tracks.map((track, index) => (
          <article
            key={track.name}
            className="rounded-lg border border-white/10 bg-white/[0.04] p-5"
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-white">{track.name}</h2>
              <span className="text-sm text-cyan-100">{track.progress}%</span>
            </div>
            <label className="text-sm text-stone-400">当前重点</label>
            <textarea
              value={track.focus}
              onChange={(event) => updateTrack(index, { focus: event.target.value })}
              rows={3}
              className="mt-2 w-full rounded-lg border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none focus:border-cyan-300/60"
            />
            <label className="mt-4 block text-sm text-stone-400">下一步</label>
            <input
              value={track.next}
              onChange={(event) => updateTrack(index, { next: event.target.value })}
              className="mt-2 w-full rounded-lg border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none focus:border-cyan-300/60"
            />
            <input
              type="range"
              min="0"
              max="100"
              value={track.progress}
              onChange={(event) =>
                updateTrack(index, { progress: Number(event.target.value) })
              }
              className="mt-5 w-full accent-cyan-300"
            />
          </article>
        ))}
      </section>
    </ConsolePage>
  );
}
