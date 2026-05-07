"use client";

import { useState } from "react";

type Option = {
  id: string;
  content: string;
};

type Question = {
  id: string;
  type: string;
  prompt: string;
  codeSnippet: string | null;
  difficulty: string;
  options: Option[];
};

type Result = {
  isCorrect: boolean;
  correctAnswer: string;
  explanation: string;
  addedToWrongBook: boolean;
};

const typeText: Record<string, string> = {
  MULTIPLE_CHOICE: "选择题",
  FILL_BLANK: "填空题",
  CODE_READING: "代码阅读题",
};

export default function QuizPanel({ questions }: { questions: Question[] }) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [results, setResults] = useState<Record<string, Result>>({});
  const [loadingId, setLoadingId] = useState<string | null>(null);

  async function submit(question: Question) {
    setLoadingId(question.id);
    const response = await fetch("/api/quiz/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        questionId: question.id,
        answer: answers[question.id] || "",
      }),
    });

    const data = await response.json().catch(() => ({}));
    setLoadingId(null);

    if (!response.ok) {
      setResults((current) => ({
        ...current,
        [question.id]: {
          isCorrect: false,
          correctAnswer: "",
          explanation: data.message || "提交失败，请先登录。",
          addedToWrongBook: false,
        },
      }));
      return;
    }

    setResults((current) => ({ ...current, [question.id]: data }));
  }

  return (
    <div className="space-y-4">
      {questions.map((question, index) => {
        const result = results[question.id];
        const isChoice = question.options.length > 0;

        return (
          <article key={question.id} className="apple-card p-4 sm:p-5">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className="eyebrow">Question {index + 1}</span>
              <span className="rounded-full border border-black/5 bg-white/70 px-2.5 py-1 text-xs text-[color:var(--muted)]">
                {typeText[question.type] || question.type}
              </span>
              <span className="rounded-full border border-black/5 bg-white/70 px-2.5 py-1 text-xs text-[color:var(--muted)]">
                {question.difficulty}
              </span>
            </div>
            <p className="whitespace-pre-wrap text-sm leading-6 text-slate-800">
              {question.prompt}
            </p>
            {question.codeSnippet && (
              <pre className="mt-3 overflow-auto rounded-[8px] bg-slate-950 p-3 text-sm text-slate-100 shadow-inner">
                <code>{question.codeSnippet}</code>
              </pre>
            )}

            <div className="mt-3 space-y-2">
              {isChoice ? (
                question.options.map((option) => (
                  <label
                    key={option.id}
                    className="flex cursor-pointer items-start gap-3 rounded-[8px] border border-black/5 bg-white/65 px-3 py-2.5 text-sm text-slate-700 hover:border-blue-200 hover:bg-white"
                  >
                    <input
                      type="radio"
                      name={question.id}
                      value={option.content}
                      className="mt-1 accent-blue-700"
                      onChange={(event) =>
                        setAnswers((current) => ({
                          ...current,
                          [question.id]: event.target.value,
                        }))
                      }
                    />
                    <span>{option.content}</span>
                  </label>
                ))
              ) : (
                <textarea
                  value={answers[question.id] || ""}
                  onChange={(event) =>
                    setAnswers((current) => ({
                      ...current,
                      [question.id]: event.target.value,
                    }))
                  }
                  rows={3}
                  className="w-full rounded-[8px] border border-black/10 bg-white/70 px-3 py-2.5 text-sm outline-none focus:border-[color:var(--accent)]"
                  placeholder="输入你的答案"
                />
              )}
            </div>

            <button
              onClick={() => submit(question)}
              disabled={loadingId === question.id}
              className="apple-button-primary mt-4 px-4 py-2 text-sm disabled:opacity-50"
            >
              {loadingId === question.id ? "检查中..." : "提交答案"}
            </button>

            {result && (
              <div
                className={`mt-4 rounded-[8px] border p-3 text-sm ${
                  result.isCorrect
                    ? "border-emerald-100 bg-emerald-50 text-emerald-900"
                    : "border-amber-100 bg-amber-50 text-amber-900"
                }`}
              >
                <p className="font-semibold">
                  {result.isCorrect ? "回答正确" : "还不对"}
                  {result.addedToWrongBook ? " · 已加入错题本" : ""}
                </p>
                {result.correctAnswer && (
                  <p className="mt-2">正确答案：{result.correctAnswer}</p>
                )}
                <p className="mt-2 whitespace-pre-wrap">{result.explanation}</p>
              </div>
            )}
          </article>
        );
      })}
    </div>
  );
}
