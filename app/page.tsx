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
  topPriority: string;
};

const defaultState: DashboardState = {
  goal: "完成 2 小时数学复盘，修复 VantaAPI 一个页面问题",
  focus: "先学习，再项目，晚上做错题回顾",
  project: "VantaAPI 个人控制台改版",
  learnMath: 35,
  learnPhysics: 20,
  learnEnglish: 45,
  learnCode: 60,
  topPriority: "数学：因式分解 - 提公因式法还不熟练",
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

  const recentActivities = [
    { type: "cpp", title: "C++ 运行错误", time: "2小时前", status: "待分析" },
    { type: "mistake", title: "因式分解错题", time: "昨天", status: "已记录" },
    { type: "project", title: "控制台改版", time: "3天前", status: "进行中" },
  ];

  return (
    <ConsolePage
      eyebrow="Dashboard"
      title="把每天当成一场训练赛。"
      description="这里是你的个人学习控制台：只记录自己的目标、进度、错题和项目，不展示他人信息，不做公开对比。"
    >
      <section className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="border border-slate-800 bg-slate-950 p-5 shadow-xl shadow-slate-900/40">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-mono text-sm font-black uppercase tracking-[0.18em] text-slate-100">
              Today Contest
            </h2>
            <span className="border border-emerald-500/30 bg-emerald-950/50 px-3 py-1 font-mono text-[11px] uppercase text-emerald-400">
              local only
            </span>
          </div>
          <div className="mb-4 flex items-center gap-3">
            <span className="h-6 w-6 rounded-full bg-blue-500/20 ring-1 ring-blue-400/50" />
            <span className="h-0 w-0 border-l-[14px] border-r-[14px] border-b-[24px] border-l-transparent border-r-transparent border-b-blue-500" />
            <span className="h-4 w-4 rounded-full bg-amber-400" />
          </div>
          <textarea
            value={state.goal}
            onChange={(event) => updateState("goal", event.target.value)}
            rows={4}
            className="w-full border border-slate-700 bg-slate-900 px-4 py-3 text-sm leading-6 text-slate-100 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
          <label className="mt-4 block font-mono text-xs uppercase tracking-[0.16em] text-slate-400">
            Strategy
          </label>
          <input
            value={state.focus}
            onChange={(event) => updateState("focus", event.target.value)}
            className="mt-2 w-full border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-slate-100 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div className="border border-slate-800 bg-slate-950 p-5 shadow-xl shadow-slate-900/40">
          <h2 className="font-mono text-sm font-black uppercase tracking-[0.18em] text-slate-100">
            Active Build
          </h2>
          <input
            value={state.project}
            onChange={(event) => updateState("project", event.target.value)}
            className="mt-4 w-full border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-slate-100 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
          <div className="mt-5 grid grid-cols-2 gap-3">
            <Link className="border border-blue-600 bg-blue-600 px-4 py-3 text-center font-mono text-xs font-black uppercase tracking-[0.16em] text-white transition hover:bg-blue-700" href="/projects">
              Build
            </Link>
            <Link className="border border-slate-700 bg-slate-900 px-4 py-3 text-center font-mono text-xs font-black uppercase tracking-[0.16em] text-slate-300 transition hover:border-slate-600 hover:bg-slate-800" href="/ai">
              AI Coach
            </Link>
          </div>
        </div>
      </section>

      {/* 今日最该解决的问题 */}
      <section className="mt-4 border border-red-900/50 bg-gradient-to-br from-red-950/80 to-slate-950 p-5 shadow-xl shadow-red-900/20">
        <div className="mb-4 flex items-center gap-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-red-500/20 ring-2 ring-red-500/50">
            <span className="text-lg">⚠️</span>
          </span>
          <h2 className="font-mono text-sm font-black uppercase tracking-[0.18em] text-red-400">
            Top Priority
          </h2>
        </div>
        <textarea
          value={state.topPriority}
          onChange={(event) => updateState("topPriority", event.target.value)}
          rows={2}
          className="w-full border border-red-900/50 bg-slate-900/80 px-4 py-3 text-sm leading-6 text-slate-100 outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
          placeholder="今天最该解决的问题..."
        />
        <div className="mt-3 flex gap-2">
          <Link href="/mistakes" className="border border-red-600 bg-red-600 px-4 py-2 font-mono text-xs uppercase tracking-wider text-white transition hover:bg-red-700">
            查看错题本
          </Link>
          <Link href="/cpp" className="border border-slate-700 bg-slate-900 px-4 py-2 font-mono text-xs uppercase tracking-wider text-slate-300 transition hover:border-slate-600">
            C++ 训练
          </Link>
        </div>
      </section>

      {/* 最近记录 */}
      <section className="mt-4 border border-slate-800 bg-slate-950 p-5 shadow-xl shadow-slate-900/40">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-mono text-sm font-black uppercase tracking-[0.18em] text-slate-100">
            Recent Activity
          </h2>
          <span className="font-mono text-xs uppercase tracking-[0.14em] text-slate-500">
            Last 7 days
          </span>
        </div>
        <div className="space-y-3">
          {recentActivities.map((activity, index) => (
            <div key={index} className="flex items-center justify-between border border-slate-800 bg-slate-900/50 p-4">
              <div className="flex items-center gap-3">
                <span className={`h-2 w-2 rounded-full ${
                  activity.type === "cpp" ? "bg-blue-500" :
                  activity.type === "mistake" ? "bg-amber-500" :
                  "bg-emerald-500"
                }`} />
                <div>
                  <p className="text-sm text-slate-200">{activity.title}</p>
                  <p className="mt-1 font-mono text-xs text-slate-500">{activity.time}</p>
                </div>
              </div>
              <span className={`border px-3 py-1 font-mono text-[10px] uppercase tracking-wider ${
                activity.status === "待分析" ? "border-amber-700 bg-amber-950/50 text-amber-400" :
                activity.status === "已记录" ? "border-blue-700 bg-blue-950/50 text-blue-400" :
                "border-emerald-700 bg-emerald-950/50 text-emerald-400"
              }`}>
                {activity.status}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-4 border border-slate-800 bg-slate-950 p-5 shadow-xl shadow-slate-900/40">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-mono text-sm font-black uppercase tracking-[0.18em] text-slate-100">
            Division Progress
          </h2>
          <Link href="/learn" className="font-mono text-xs uppercase tracking-[0.14em] text-blue-400 hover:text-blue-300">
            edit route
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {progress.map(([label, value]) => (
            <div key={label} className="border border-slate-800 bg-slate-900/50 p-4">
              <div className="mb-3 flex justify-between text-sm">
                <span className="text-slate-300">{label}</span>
                <span className="font-mono text-blue-400">{value}%</span>
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
                className="w-full accent-blue-500"
              />
              <div className="mt-3 h-2 bg-slate-800">
                <div
                  className="h-2 bg-gradient-to-r from-blue-600 via-sky-400 to-amber-400"
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
