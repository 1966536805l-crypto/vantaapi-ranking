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
            className="border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-slate-950">{track.name}</h2>
              <span className="font-mono text-sm text-blue-700">{track.progress}%</span>
            </div>
            <label className="text-sm text-slate-600">当前重点</label>
            <textarea
              value={track.focus}
              onChange={(event) => updateTrack(index, { focus: event.target.value })}
              rows={3}
              className="mt-2 w-full border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-950 outline-none focus:border-blue-400"
            />
            <label className="mt-4 block text-sm text-slate-600">下一步</label>
            <input
              value={track.next}
              onChange={(event) => updateTrack(index, { next: event.target.value })}
              className="mt-2 w-full border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-950 outline-none focus:border-blue-400"
            />
            <input
              type="range"
              min="0"
              max="100"
              value={track.progress}
              onChange={(event) =>
                updateTrack(index, { progress: Number(event.target.value) })
              }
              className="mt-5 w-full accent-blue-600"
            />
          </article>
        ))}
      </section>
    </ConsolePage>
  );
}
