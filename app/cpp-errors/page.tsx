"use client";

import { useEffect, useState } from "react";
import ConsolePage from "@/components/ConsolePage";
import Link from "next/link";

type CppError = {
  id: string;
  code: string;
  stdin: string;
  stdout: string | null;
  stderr: string | null;
  note: string | null;
  aiAnalysis: string | null;
  createdAt: string;
};

export default function CppErrorsPage() {
  const [errors, setErrors] = useState<CppError[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 临时使用固定 userId，后续接入真实用户系统
    const userId = "demo-user";

    fetch(`/api/cpp/errors?userId=${userId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setErrors(data.data);
        }
      })
      .catch((error) => {
        console.error("加载错误记录失败:", error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("确定要删除这条记录吗？")) return;

    try {
      const response = await fetch(`/api/cpp/errors?id=${id}`, {
        method: "DELETE",
      });

      const data = await response.json();
      if (data.success) {
        setErrors(errors.filter((e) => e.id !== id));
      } else {
        alert("删除失败：" + data.error);
      }
    } catch (error) {
      alert("删除失败：网络错误");
    }
  };

  return (
    <ConsolePage
      eyebrow="C++ Errors"
      title="C++ 错误记录"
      description="记录和分析你的 C++ 编译运行错误，帮助你快速定位问题。"
    >
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-mono text-sm font-black uppercase tracking-[0.18em] text-slate-100">
          错误记录列表
        </h2>
        <Link
          href="/cpp"
          className="border border-blue-600 bg-blue-600 px-4 py-2 font-mono text-xs uppercase tracking-wider text-white transition hover:bg-blue-700"
        >
          返回 C++ 运行
        </Link>
      </div>

      {loading && (
        <div className="border border-slate-800 bg-slate-950 p-8 text-center shadow-xl shadow-slate-900/40">
          <p className="font-mono text-sm text-slate-400">加载中...</p>
        </div>
      )}

      {!loading && errors.length === 0 && (
        <div className="border border-slate-800 bg-slate-950 p-8 text-center shadow-xl shadow-slate-900/40">
          <p className="font-mono text-sm text-slate-400">暂无错误记录</p>
          <Link
            href="/cpp"
            className="mt-4 inline-block border border-blue-600 bg-blue-600 px-6 py-2 font-mono text-xs uppercase tracking-wider text-white transition hover:bg-blue-700"
          >
            开始编写代码
          </Link>
        </div>
      )}

      {!loading && errors.length > 0 && (
        <div className="space-y-4">
          {errors.map((error) => (
            <div
              key={error.id}
              className="border border-slate-800 bg-slate-950 p-5 shadow-xl shadow-slate-900/40"
            >
              <div className="mb-3 flex items-center justify-between">
                <span className="font-mono text-xs text-slate-500">
                  {new Date(error.createdAt).toLocaleString("zh-CN")}
                </span>
                <button
                  onClick={() => handleDelete(error.id)}
                  className="border border-red-700 bg-red-900/50 px-3 py-1 font-mono text-xs uppercase text-red-400 transition hover:bg-red-900"
                >
                  删除
                </button>
              </div>

              {error.note && (
                <div className="mb-3 border-l-4 border-amber-500 bg-amber-950/30 p-3">
                  <p className="text-sm text-amber-200">{error.note}</p>
                </div>
              )}

              <details className="group">
                <summary className="cursor-pointer font-mono text-sm text-blue-400 hover:text-blue-300">
                  查看代码和错误信息 ▼
                </summary>
                <div className="mt-3 space-y-3">
                  <div className="border border-slate-800 bg-slate-900/50 p-4">
                    <p className="mb-2 font-mono text-xs uppercase tracking-wider text-slate-400">
                      代码
                    </p>
                    <pre className="overflow-x-auto font-mono text-xs text-slate-200">
                      {error.code}
                    </pre>
                  </div>

                  {error.stderr && (
                    <div className="border border-red-900/50 bg-red-950/30 p-4">
                      <p className="mb-2 font-mono text-xs uppercase tracking-wider text-red-400">
                        错误信息
                      </p>
                      <pre className="overflow-x-auto font-mono text-xs text-red-300 whitespace-pre-wrap">
                        {error.stderr}
                      </pre>
                    </div>
                  )}

                  {error.aiAnalysis && (
                    <div className="border border-blue-900/50 bg-blue-950/30 p-4">
                      <p className="mb-2 font-mono text-xs uppercase tracking-wider text-blue-400">
                        AI 分析
                      </p>
                      <p className="text-sm text-blue-200">{error.aiAnalysis}</p>
                    </div>
                  )}
                </div>
              </details>
            </div>
          ))}
        </div>
      )}
    </ConsolePage>
  );
}
