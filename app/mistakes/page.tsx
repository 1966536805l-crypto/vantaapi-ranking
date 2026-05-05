"use client";

import { useEffect, useState } from "react";
import ConsolePage from "@/components/ConsolePage";

const MISTAKE_TYPES = [
  "审题错",
  "概念不清",
  "公式乱用",
  "计算粗心",
  "图形没看出来",
  "变量关系没建出来",
  "第一突破口卡住",
  "会方法但表达乱",
] as const;

type MistakeType = typeof MISTAKE_TYPES[number];

type Mistake = {
  id: string;
  userId: string;
  question: string;
  myAnswer: string;
  correctAnswer: string;
  myProcess: string;
  mistakeType: MistakeType;
  correctThinking: string;
  nextReviewAt: string | null;
  createdAt: string;
};

export default function MistakesPage() {
  const [mistakes, setMistakes] = useState<Mistake[]>([]);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState<{
    question: string;
    myAnswer: string;
    correctAnswer: string;
    myProcess: string;
    mistakeType: MistakeType;
    correctThinking: string;
    nextReviewAt: string;
  }>({
    question: "",
    myAnswer: "",
    correctAnswer: "",
    myProcess: "",
    mistakeType: MISTAKE_TYPES[0],
    correctThinking: "",
    nextReviewAt: "",
  });

  const userId = "demo-user"; // TODO: 从认证系统获取

  useEffect(() => {
    loadMistakes();
  }, []);

  const loadMistakes = async () => {
    try {
      const response = await fetch(`/api/mistakes?userId=${userId}`);
      const result = await response.json();
      if (result.success) {
        setMistakes(result.data);
      }
    } catch (error) {
      console.error("加载错题失败:", error);
    } finally {
      setLoading(false);
    }
  };

  const addMistake = async () => {
    if (!draft.question.trim() || !draft.myAnswer.trim() || !draft.correctAnswer.trim()) {
      alert("题目、我的答案、正确答案不能为空");
      return;
    }

    try {
      const response = await fetch("/api/mistakes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          ...draft,
          nextReviewAt: draft.nextReviewAt || undefined,
        }),
      });

      const result = await response.json();
      if (result.success) {
        setMistakes([result.data, ...mistakes]);
        setDraft({
          question: "",
          myAnswer: "",
          correctAnswer: "",
          myProcess: "",
          mistakeType: MISTAKE_TYPES[0],
          correctThinking: "",
          nextReviewAt: "",
        });
      } else {
        alert(result.error || "添加失败");
      }
    } catch (error) {
      console.error("添加错题失败:", error);
      alert("添加失败");
    }
  };

  const deleteMistake = async (id: string) => {
    if (!confirm("确定删除这条错题？")) return;

    try {
      const response = await fetch(`/api/mistakes?id=${id}`, {
        method: "DELETE",
      });

      const result = await response.json();
      if (result.success) {
        setMistakes(mistakes.filter((m) => m.id !== id));
      } else {
        alert(result.error || "删除失败");
      }
    } catch (error) {
      console.error("删除错题失败:", error);
      alert("删除失败");
    }
  };

  if (loading) {
    return (
      <ConsolePage
        eyebrow="错题复盘"
        title="记录错因，比记录分数更有用。"
        description="8类错因标签，帮你找到真正的薄弱点。"
      >
        <div className="py-14 text-center text-slate-500">加载中...</div>
      </ConsolePage>
    );
  }

  return (
    <ConsolePage
      eyebrow="错题复盘"
      title="记录错因，比记录分数更有用。"
      description="8类错因标签，帮你找到真正的薄弱点。"
    >
      <section className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-mono text-sm font-black uppercase tracking-[0.18em] text-slate-950">新增错题</h2>

          <textarea
            value={draft.question}
            onChange={(e) => setDraft({ ...draft, question: e.target.value })}
            rows={3}
            placeholder="题目内容"
            className="mt-4 w-full border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-950 outline-none placeholder:text-slate-400 focus:border-blue-400"
          />

          <textarea
            value={draft.myAnswer}
            onChange={(e) => setDraft({ ...draft, myAnswer: e.target.value })}
            rows={2}
            placeholder="我的答案"
            className="mt-3 w-full border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-950 outline-none placeholder:text-slate-400 focus:border-blue-400"
          />

          <textarea
            value={draft.correctAnswer}
            onChange={(e) => setDraft({ ...draft, correctAnswer: e.target.value })}
            rows={2}
            placeholder="正确答案"
            className="mt-3 w-full border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-950 outline-none placeholder:text-slate-400 focus:border-blue-400"
          />

          <textarea
            value={draft.myProcess}
            onChange={(e) => setDraft({ ...draft, myProcess: e.target.value })}
            rows={2}
            placeholder="我的解题过程（可选）"
            className="mt-3 w-full border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-950 outline-none placeholder:text-slate-400 focus:border-blue-400"
          />

          <select
            value={draft.mistakeType}
            onChange={(e) => setDraft({ ...draft, mistakeType: e.target.value as MistakeType })}
            className="mt-3 w-full border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-950 outline-none focus:border-blue-400"
          >
            {MISTAKE_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>

          <textarea
            value={draft.correctThinking}
            onChange={(e) => setDraft({ ...draft, correctThinking: e.target.value })}
            rows={2}
            placeholder="正确思路（可选）"
            className="mt-3 w-full border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-950 outline-none placeholder:text-slate-400 focus:border-blue-400"
          />

          <input
            type="date"
            value={draft.nextReviewAt}
            onChange={(e) => setDraft({ ...draft, nextReviewAt: e.target.value })}
            className="mt-3 w-full border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-950 outline-none focus:border-blue-400"
            placeholder="下次复习时间（可选）"
          />

          <button
            onClick={addMistake}
            className="mt-4 w-full border border-blue-700 bg-blue-700 px-5 py-3 font-semibold text-white hover:bg-blue-800"
          >
            记录错题
          </button>
        </div>

        <div className="space-y-3">
          {mistakes.map((mistake) => (
            <article
              key={mistake.id}
              className="border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div className="mb-2 flex items-center justify-between gap-3">
                <span className="border border-red-200 bg-red-50 px-3 py-1 text-xs font-semibold text-red-700">
                  {mistake.mistakeType}
                </span>
                <button
                  onClick={() => deleteMistake(mistake.id)}
                  className="text-xs text-slate-400 hover:text-red-600"
                >
                  删除
                </button>
              </div>

              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-semibold text-slate-700">题目：</span>
                  <p className="mt-1 whitespace-pre-wrap text-slate-800">{mistake.question}</p>
                </div>

                <div>
                  <span className="font-semibold text-slate-700">我的答案：</span>
                  <p className="mt-1 whitespace-pre-wrap text-slate-600">{mistake.myAnswer}</p>
                </div>

                <div>
                  <span className="font-semibold text-slate-700">正确答案：</span>
                  <p className="mt-1 whitespace-pre-wrap text-green-700">{mistake.correctAnswer}</p>
                </div>

                {mistake.myProcess && (
                  <div>
                    <span className="font-semibold text-slate-700">我的过程：</span>
                    <p className="mt-1 whitespace-pre-wrap text-slate-600">{mistake.myProcess}</p>
                  </div>
                )}

                {mistake.correctThinking && (
                  <div>
                    <span className="font-semibold text-slate-700">正确思路：</span>
                    <p className="mt-1 whitespace-pre-wrap text-blue-700">{mistake.correctThinking}</p>
                  </div>
                )}

                {mistake.nextReviewAt && (
                  <div className="pt-2 text-xs text-slate-500">
                    下次复习：{new Date(mistake.nextReviewAt).toLocaleDateString()}
                  </div>
                )}

                <div className="pt-2 text-xs text-slate-400">
                  记录时间：{new Date(mistake.createdAt).toLocaleString()}
                </div>
              </div>
            </article>
          ))}

          {mistakes.length === 0 && (
            <div className="border border-dashed border-slate-300 bg-white py-14 text-center text-slate-500">
              还没有错题记录
            </div>
          )}
        </div>
      </section>
    </ConsolePage>
  );
}
