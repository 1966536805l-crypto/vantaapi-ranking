"use client";

import { useState } from "react";
import ConsolePage from "@/components/ConsolePage";
import Link from "next/link";

const DEFAULT_CODE = `#include <bits/stdc++.h>
using namespace std;

int main() {

    return 0;
}`;

type RunResult = {
  success: boolean;
  stdout?: string;
  stderr?: string;
  timeMs?: number;
  error?: string;
};

export default function CppRunnerPage() {
  const [code, setCode] = useState(DEFAULT_CODE);
  const [stdin, setStdin] = useState("");
  const [result, setResult] = useState<RunResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [note, setNote] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleRun = async () => {
    setIsRunning(true);
    setResult(null);

    try {
      const response = await fetch("/api/cpp/run", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code, stdin }),
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({
        success: false,
        error: error instanceof Error ? error.message : "网络错误",
      });
    } finally {
      setIsRunning(false);
    }
  };

  const handleSaveError = async () => {
    if (!result || result.success) {
      alert("只能保存失败的运行记录");
      return;
    }

    setIsSaving(true);

    try {
      const response = await fetch("/api/cpp/errors", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: "demo-user", // 临时使用固定 userId
          code,
          stdin,
          stdout: result.stdout || "",
          stderr: result.stderr || "",
          note,
        }),
      });

      const data = await response.json();
      if (data.success) {
        alert("错误记录已保存");
        setNote("");
      } else {
        alert("保存失败：" + data.error);
      }
    } catch (error) {
      alert("保存失败：网络错误");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAnalyze = async () => {
    if (!result) {
      alert("请先运行代码");
      return;
    }

    try {
      const response = await fetch("/api/cpp/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code,
          stdin,
          stdout: result.stdout || "",
          stderr: result.stderr || "",
        }),
      });

      const data = await response.json();
      if (data.success) {
        const analysis = data.data;
        alert(
          `AI 分析结果：\n\n错误类型：${analysis.errorType}\n原因：${analysis.cause}\n提示：${analysis.hint}\n下一步：${analysis.nextAction}`
        );
      } else {
        alert("分析失败：" + data.error);
      }
    } catch (error) {
      alert("分析失败：网络错误");
    }
  };

  return (
    <ConsolePage
      eyebrow="C++ Runner"
      title="在线 C++ 编译运行"
      description="编写 C++ 代码，一键编译运行。支持标准输入输出，2秒超时限制。"
    >
      <div className="grid gap-4 lg:grid-cols-2">
        {/* 左侧：代码编辑器 */}
        <div className="border border-slate-800 bg-slate-950 p-5 shadow-xl shadow-slate-900/40">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-mono text-sm font-black uppercase tracking-[0.18em] text-slate-100">
              Code Editor
            </h2>
            <span className="border border-blue-500/30 bg-blue-950/50 px-3 py-1 font-mono text-[10px] uppercase text-blue-400">
              C++17
            </span>
          </div>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="h-96 w-full border border-slate-700 bg-slate-900 p-4 font-mono text-sm text-slate-100 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            spellCheck={false}
          />

          <div className="mt-4">
            <label className="mb-2 block font-mono text-xs uppercase tracking-[0.16em] text-slate-400">
              Standard Input (stdin)
            </label>
            <textarea
              value={stdin}
              onChange={(e) => setStdin(e.target.value)}
              className="h-24 w-full border border-slate-700 bg-slate-900 p-4 font-mono text-sm text-slate-100 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              placeholder="输入数据（可选）"
              spellCheck={false}
            />
          </div>

          <button
            onClick={handleRun}
            disabled={isRunning}
            className="mt-4 w-full border border-emerald-600 bg-emerald-600 px-6 py-3 font-mono text-sm font-black uppercase tracking-wider text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isRunning ? "运行中..." : "▶ 运行代码"}
          </button>
        </div>

        {/* 右侧：输出区域 */}
        <div className="border border-slate-800 bg-slate-950 p-5 shadow-xl shadow-slate-900/40">
          <h2 className="mb-4 font-mono text-sm font-black uppercase tracking-[0.18em] text-slate-100">
            Output
          </h2>

          {!result && (
            <div className="flex h-96 items-center justify-center border border-slate-800 bg-slate-900/50 text-slate-500">
              <p className="font-mono text-sm">点击"运行代码"查看结果</p>
            </div>
          )}

          {result && (
            <div className="space-y-4">
              {/* 状态 */}
              <div className="flex items-center gap-3">
                <span
                  className={`h-3 w-3 rounded-full ${
                    result.success ? "bg-emerald-500" : "bg-red-500"
                  }`}
                />
                <span
                  className={`font-mono text-sm font-bold ${
                    result.success ? "text-emerald-400" : "text-red-400"
                  }`}
                >
                  {result.success ? "运行成功" : "运行失败"}
                </span>
                {result.timeMs !== undefined && (
                  <span className="ml-auto font-mono text-xs text-slate-500">
                    {result.timeMs}ms
                  </span>
                )}
              </div>

              {/* 错误信息 */}
              {result.error && (
                <div className="border border-red-900/50 bg-red-950/30 p-4">
                  <p className="mb-2 font-mono text-xs uppercase tracking-wider text-red-400">
                    Error
                  </p>
                  <pre className="font-mono text-sm text-red-300 whitespace-pre-wrap">
                    {result.error}
                  </pre>
                </div>
              )}

              {/* 标准输出 */}
              {result.stdout && (
                <div className="border border-slate-800 bg-slate-900/50 p-4">
                  <p className="mb-2 font-mono text-xs uppercase tracking-wider text-slate-400">
                    Standard Output
                  </p>
                  <pre className="font-mono text-sm text-slate-200 whitespace-pre-wrap">
                    {result.stdout}
                  </pre>
                </div>
              )}

              {/* 标准错误 */}
              {result.stderr && (
                <div className="border border-amber-900/50 bg-amber-950/30 p-4">
                  <p className="mb-2 font-mono text-xs uppercase tracking-wider text-amber-400">
                    Standard Error
                  </p>
                  <pre className="font-mono text-sm text-amber-300 whitespace-pre-wrap">
                    {result.stderr}
                  </pre>
                </div>
              )}

              {/* 运行失败时显示保存和分析按钮 */}
              {!result.success && (
                <div className="space-y-3 border-t border-slate-800 pt-4">
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="添加备注（可选）"
                    className="w-full border border-slate-700 bg-slate-900 p-3 font-mono text-sm text-slate-100 outline-none focus:border-blue-500"
                    rows={2}
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={handleSaveError}
                      disabled={isSaving}
                      className="border border-amber-600 bg-amber-600 px-4 py-2 font-mono text-xs uppercase tracking-wider text-white transition hover:bg-amber-700 disabled:opacity-50"
                    >
                      {isSaving ? "保存中..." : "记录错误"}
                    </button>
                    <button
                      onClick={handleAnalyze}
                      className="border border-blue-600 bg-blue-600 px-4 py-2 font-mono text-xs uppercase tracking-wider text-white transition hover:bg-blue-700"
                    >
                      AI 分析
                    </button>
                  </div>
                  <Link
                    href="/cpp-errors"
                    className="block border border-slate-700 bg-slate-900 px-4 py-2 text-center font-mono text-xs uppercase tracking-wider text-slate-300 transition hover:border-slate-600"
                  >
                    查看错误记录
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 使用说明 */}
      <div className="mt-4 border border-slate-800 bg-slate-950 p-5 shadow-xl shadow-slate-900/40">
        <h3 className="mb-3 font-mono text-sm font-black uppercase tracking-[0.18em] text-slate-100">
          使用说明
        </h3>
        <ul className="space-y-2 text-sm text-slate-400">
          <li className="flex items-start gap-2">
            <span className="text-blue-500">•</span>
            <span>支持 C++17 标准，已包含 bits/stdc++.h</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-500">•</span>
            <span>运行时间限制：2秒</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-500">•</span>
            <span>输出长度限制：10KB</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-amber-500">⚠</span>
            <span>仅用于学习和练习，不支持文件操作和网络访问</span>
          </li>
        </ul>
      </div>
    </ConsolePage>
  );
}
