"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import ConsolePage from "@/components/ConsolePage";

type DashboardState = {
  goal: string;
  focus: string;
  project: string;
  learnMath: number;
  learnPhysics: number;
  learnEnglish: number;
  learnCode: number;
};

const defaultState: DashboardState = {
  goal: "完成 2 小时数学复盘，修复 VantaAPI 一个页面问题",
  focus: "先学习，再项目，晚上做错题回顾",
  project: "VantaAPI 个人控制台改版",
  learnMath: 35,
  learnPhysics: 20,
  learnEnglish: 45,
  learnCode: 60,
};

export default function Home() {
  const [state, setState] = useState<DashboardState>(defaultState);

  useEffect(() => {
    const saved = localStorage.getItem("immortal-dashboard");
    if (saved) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setState({ ...defaultState, ...JSON.parse(saved) });
    }
  }, []);

  const updateState = <K extends keyof DashboardState>(
    key: K,
    value: DashboardState[K]
  ) => {
    const next = { ...state, [key]: value };
    setState(next);
    localStorage.setItem("immortal-dashboard", JSON.stringify(next));
  };

  const progress = [
    ["数学", state.learnMath],
    ["物理", state.learnPhysics],
    ["英语", state.learnEnglish],
    ["编程", state.learnCode],
  ] as const;

  return (
    <ConsolePage
      eyebrow="今日控制台"
      title="学习、项目、状态都收进一个屏幕。"
      description="这里是你的个人学习与项目控制台，只记录你自己的目标、进度和复盘，不展示他人信息，不做公开对比。"
    >
      <section className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-lg border border-white/10 bg-white/[0.04] p-5 shadow-2xl shadow-black/30">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">今日目标</h2>
            <span className="rounded-full bg-cyan-300/10 px-3 py-1 text-xs text-cyan-100">
              local only
            </span>
          </div>
          <textarea
            value={state.goal}
            onChange={(event) => updateState("goal", event.target.value)}
            rows={4}
            className="w-full rounded-lg border border-white/10 bg-black/30 px-4 py-3 text-sm leading-6 text-white outline-none focus:border-cyan-300/60"
          />
          <label className="mt-4 block text-sm text-stone-400">今日策略</label>
          <input
            value={state.focus}
            onChange={(event) => updateState("focus", event.target.value)}
            className="mt-2 w-full rounded-lg border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none focus:border-cyan-300/60"
          />
        </div>

        <div className="rounded-lg border border-white/10 bg-white/[0.04] p-5">
          <h2 className="text-xl font-semibold text-white">正在做的项目</h2>
          <input
            value={state.project}
            onChange={(event) => updateState("project", event.target.value)}
            className="mt-4 w-full rounded-lg border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none focus:border-cyan-300/60"
          />
          <div className="mt-5 grid grid-cols-2 gap-3">
            <Link className="rounded-lg bg-cyan-300 px-4 py-3 text-center font-semibold text-black" href="/projects">
              看项目
            </Link>
            <Link className="rounded-lg border border-white/10 px-4 py-3 text-center font-semibold text-stone-200" href="/ai">
              问 AI
            </Link>
          </div>
        </div>
      </section>

      <section className="mt-4 rounded-lg border border-white/10 bg-white/[0.04] p-5">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">学习进度</h2>
          <Link href="/learn" className="text-sm text-cyan-200 hover:text-cyan-100">
            编辑路线
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {progress.map(([label, value]) => (
            <div key={label} className="rounded-lg border border-white/10 bg-black/20 p-4">
              <div className="mb-3 flex justify-between text-sm">
                <span className="text-stone-300">{label}</span>
                <span className="text-cyan-100">{value}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={value}
                onChange={(event) =>
                  updateState(
                    `learn${label === "数学" ? "Math" : label === "物理" ? "Physics" : label === "英语" ? "English" : "Code"}` as keyof DashboardState,
                    Number(event.target.value) as never
                  )
                }
                className="w-full accent-cyan-300"
              />
              <div className="mt-3 h-2 rounded-full bg-white/10">
                <div
                  className="h-2 rounded-full bg-gradient-to-r from-cyan-300 to-lime-300"
                  style={{ width: `${value}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>
    </ConsolePage>
  );
}
