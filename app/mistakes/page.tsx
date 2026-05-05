"use client";

import { useEffect, useState } from "react";
import ConsolePage from "@/components/ConsolePage";

type Mistake = {
  id: string;
  subject: string;
  question: string;
  reason: string;
  reviewAt: string;
};

export default function MistakesPage() {
  const [mistakes, setMistakes] = useState<Mistake[]>([]);
  const [draft, setDraft] = useState<Omit<Mistake, "id">>({
    subject: "数学",
    question: "",
    reason: "",
    reviewAt: new Date().toISOString().slice(0, 10),
  });

  useEffect(() => {
    const saved = localStorage.getItem("immortal-mistakes");
    if (saved) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setMistakes(JSON.parse(saved));
    }
  }, []);

  const saveMistakes = (next: Mistake[]) => {
    setMistakes(next);
    localStorage.setItem("immortal-mistakes", JSON.stringify(next));
  };

  const addMistake = () => {
    if (!draft.question.trim()) return;
    saveMistakes([{ ...draft, id: crypto.randomUUID() }, ...mistakes]);
    setDraft({ ...draft, question: "", reason: "" });
  };

  return (
    <ConsolePage
      eyebrow="错题复盘"
      title="记录错因，比记录分数更有用。"
      description="题目、错误原因、下次复习时间都存在本地。这里不做公开对比，只帮助你下一次少踩同一个坑。"
    >
      <section className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-lg border border-white/10 bg-white/[0.04] p-5">
          <h2 className="text-xl font-semibold text-white">新增错题</h2>
          <select
            value={draft.subject}
            onChange={(event) => setDraft({ ...draft, subject: event.target.value })}
            className="mt-4 w-full rounded-lg border border-white/10 bg-[#101318] px-4 py-3 text-sm text-white outline-none"
          >
            <option>数学</option>
            <option>物理</option>
            <option>英语</option>
            <option>编程</option>
          </select>
          <textarea
            value={draft.question}
            onChange={(event) => setDraft({ ...draft, question: event.target.value })}
            rows={4}
            placeholder="题目或题目链接"
            className="mt-3 w-full rounded-lg border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none focus:border-cyan-300/60"
          />
          <textarea
            value={draft.reason}
            onChange={(event) => setDraft({ ...draft, reason: event.target.value })}
            rows={3}
            placeholder="错误原因：概念不清、审题、计算、代码思路..."
            className="mt-3 w-full rounded-lg border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none focus:border-cyan-300/60"
          />
          <input
            type="date"
            value={draft.reviewAt}
            onChange={(event) => setDraft({ ...draft, reviewAt: event.target.value })}
            className="mt-3 w-full rounded-lg border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none"
          />
          <button
            onClick={addMistake}
            className="mt-4 w-full rounded-lg bg-cyan-300 px-5 py-3 font-semibold text-black"
          >
            记录
          </button>
        </div>

        <div className="space-y-3">
          {mistakes.map((mistake) => (
            <article
              key={mistake.id}
              className="rounded-lg border border-white/10 bg-white/[0.04] p-4"
            >
              <div className="mb-2 flex items-center justify-between gap-3">
                <span className="rounded-full bg-cyan-300/10 px-3 py-1 text-xs text-cyan-100">
                  {mistake.subject}
                </span>
                <span className="text-xs text-stone-500">
                  下次复习：{mistake.reviewAt}
                </span>
              </div>
              <p className="whitespace-pre-wrap text-sm leading-6 text-white">{mistake.question}</p>
              {mistake.reason && (
                <p className="mt-3 whitespace-pre-wrap border-t border-white/10 pt-3 text-sm leading-6 text-stone-400">
                  {mistake.reason}
                </p>
              )}
            </article>
          ))}
          {mistakes.length === 0 && (
            <div className="rounded-lg border border-dashed border-white/15 py-14 text-center text-stone-500">
              还没有错题记录
            </div>
          )}
        </div>
      </section>
    </ConsolePage>
  );
}
