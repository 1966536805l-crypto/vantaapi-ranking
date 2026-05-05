"use client";

import { useEffect, useState } from "react";
import ConsolePage from "@/components/ConsolePage";

type Question = {
  id: string;
  content: string;
  answer: string;
  explanation: string | null;
  difficulty: string;
  subject: string;
  topic: string | null;
  type: string;
  createdAt: string;
};

export default function QuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    difficulty: "",
    topic: "",
    type: "",
  });
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);

  useEffect(() => {
    fetchQuestions();
  }, [filters]);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.difficulty) params.append("difficulty", filters.difficulty);
      if (filters.topic) params.append("topic", filters.topic);
      if (filters.type) params.append("type", filters.type);

      const response = await fetch(`/api/questions?${params.toString()}`);
      const result = await response.json();

      if (result.success) {
        setQuestions(result.data);
      }
    } catch (error) {
      console.error("获取题库失败:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <ConsolePage
        eyebrow="数学题库"
        title="30道精选高中数学题"
        description="函数、三角、立体几何、解析几何、数列等核心知识点。"
      >
        <div className="py-14 text-center text-slate-500">加载中...</div>
      </ConsolePage>
    );
  }

  return (
    <ConsolePage
      eyebrow="数学题库"
      title="30道精选高中数学题"
      description="函数、三角、立体几何、解析几何、数列等核心知识点。"
    >
      <div className="mb-6 flex flex-wrap gap-3">
        <select
          value={filters.difficulty}
          onChange={(e) => setFilters({ ...filters, difficulty: e.target.value })}
          className="border border-slate-200 bg-white px-4 py-2 text-sm text-slate-950 outline-none focus:border-blue-400"
        >
          <option value="">全部难度</option>
          <option value="简单">简单</option>
          <option value="中等">中等</option>
          <option value="困难">困难</option>
        </select>

        <select
          value={filters.topic}
          onChange={(e) => setFilters({ ...filters, topic: e.target.value })}
          className="border border-slate-200 bg-white px-4 py-2 text-sm text-slate-950 outline-none focus:border-blue-400"
        >
          <option value="">全部知识点</option>
          <option value="函数">函数</option>
          <option value="三角函数">三角函数</option>
          <option value="立体几何">立体几何</option>
          <option value="解析几何">解析几何</option>
          <option value="数列">数列</option>
          <option value="向量">向量</option>
          <option value="排列组合">排列组合</option>
          <option value="二项式定理">二项式定理</option>
          <option value="复数">复数</option>
          <option value="导数">导数</option>
        </select>

        <select
          value={filters.type}
          onChange={(e) => setFilters({ ...filters, type: e.target.value })}
          className="border border-slate-200 bg-white px-4 py-2 text-sm text-slate-950 outline-none focus:border-blue-400"
        >
          <option value="">全部题型</option>
          <option value="选择题">选择题</option>
          <option value="填空题">填空题</option>
          <option value="解答题">解答题</option>
        </select>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {questions.map((q) => (
          <article
            key={q.id}
            className="cursor-pointer border border-slate-200 bg-white p-4 shadow-sm transition-all hover:border-blue-400 hover:shadow-md"
            onClick={() => setSelectedQuestion(q)}
          >
            <div className="mb-3 flex items-center gap-2">
              <span
                className={`border px-2 py-1 text-xs font-semibold ${
                  q.difficulty === "简单"
                    ? "border-green-200 bg-green-50 text-green-700"
                    : q.difficulty === "中等"
                    ? "border-yellow-200 bg-yellow-50 text-yellow-700"
                    : "border-red-200 bg-red-50 text-red-700"
                }`}
              >
                {q.difficulty}
              </span>
              <span className="border border-blue-200 bg-blue-50 px-2 py-1 text-xs text-blue-700">
                {q.topic || q.subject}
              </span>
              <span className="text-xs text-slate-500">{q.type}</span>
            </div>

            <p className="text-sm leading-relaxed text-slate-800">{q.content}</p>
          </article>
        ))}
      </div>

      {questions.length === 0 && (
        <div className="border border-dashed border-slate-300 bg-white py-14 text-center text-slate-500">
          没有找到符合条件的题目
        </div>
      )}

      {selectedQuestion && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setSelectedQuestion(null)}
        >
          <div
            className="max-h-[80vh] w-full max-w-2xl overflow-y-auto border border-slate-200 bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  className={`border px-2 py-1 text-xs font-semibold ${
                    selectedQuestion.difficulty === "简单"
                      ? "border-green-200 bg-green-50 text-green-700"
                      : selectedQuestion.difficulty === "中等"
                      ? "border-yellow-200 bg-yellow-50 text-yellow-700"
                      : "border-red-200 bg-red-50 text-red-700"
                  }`}
                >
                  {selectedQuestion.difficulty}
                </span>
                <span className="border border-blue-200 bg-blue-50 px-2 py-1 text-xs text-blue-700">
                  {selectedQuestion.topic || selectedQuestion.subject}
                </span>
                <span className="text-xs text-slate-500">{selectedQuestion.type}</span>
              </div>
              <button
                onClick={() => setSelectedQuestion(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="mb-2 font-semibold text-slate-700">题目</h3>
                <p className="whitespace-pre-wrap text-slate-800">{selectedQuestion.content}</p>
              </div>

              <div>
                <h3 className="mb-2 font-semibold text-slate-700">答案</h3>
                <p className="whitespace-pre-wrap text-green-700">{selectedQuestion.answer}</p>
              </div>

              {selectedQuestion.explanation && (
                <div>
                  <h3 className="mb-2 font-semibold text-slate-700">解析</h3>
                  <p className="whitespace-pre-wrap text-slate-600">
                    {selectedQuestion.explanation}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </ConsolePage>
  );
}
