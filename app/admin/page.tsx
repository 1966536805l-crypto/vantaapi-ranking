"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

interface Ranking {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  score: number;
  votes: number;
  status: string;
  categoryId: string;
  category: {
    name: string;
  };
  createdAt: string;
}

export default function AdminPage() {
  const [rankings, setRankings] = useState<Ranking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("pending");

  const fetchRankings = useCallback(async () => {
    try {
      const status = filter === "all" ? "" : filter;
      const response = await fetch(`/api/rankings?status=${status}`);
      const data = await response.json();
      setRankings(data);
    } catch {
      alert("获取数据失败");
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchRankings();
  }, [fetchRankings]);

  const handleStatusChange = async (id: string, status: string) => {
    try {
      const response = await fetch(`/api/rankings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        fetchRankings();
      } else {
        alert("操作失败");
      }
    } catch {
      alert("操作失败");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("确定要删除这个项目吗？")) return;

    try {
      const response = await fetch(`/api/rankings/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchRankings();
      } else {
        alert("删除失败");
      }
    } catch {
      alert("删除失败");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-16">
        <div className="mb-8">
          <Link
            href="/"
            className="text-blue-600 hover:text-blue-700 dark:text-blue-400 mb-4 inline-block"
          >
            ← 返回首页
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            管理后台
          </h1>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
          <div className="flex gap-4 mb-6">
            <button
              onClick={() => setFilter("all")}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                filter === "all"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
              }`}
            >
              全部
            </button>
            <button
              onClick={() => setFilter("pending")}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                filter === "pending"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
              }`}
            >
              待审核
            </button>
            <button
              onClick={() => setFilter("approved")}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                filter === "approved"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
              }`}
            >
              已通过
            </button>
            <button
              onClick={() => setFilter("rejected")}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                filter === "rejected"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
              }`}
            >
              已拒绝
            </button>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-600 dark:text-gray-400">加载中...</p>
            </div>
          ) : rankings.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 dark:text-gray-400">暂无数据</p>
            </div>
          ) : (
            <div className="space-y-4">
              {rankings.map((ranking) => (
                <div
                  key={ranking.id}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                >
                  <div className="flex items-start gap-4">
                    {ranking.imageUrl && (
                      <img
                        src={ranking.imageUrl}
                        alt={ranking.title}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                    )}
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                        {ranking.title}
                      </h3>
                      {ranking.description && (
                        <p className="text-gray-600 dark:text-gray-300 mb-2">
                          {ranking.description}
                        </p>
                      )}
                      <div className="flex gap-4 text-sm text-gray-500 dark:text-gray-400">
                        <span>分类: {ranking.category.name}</span>
                        <span>评分: {ranking.score}</span>
                        <span>投票: {ranking.votes}</span>
                        <span>状态: {ranking.status}</span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      {ranking.status === "pending" && (
                        <>
                          <button
                            onClick={() => handleStatusChange(ranking.id, "approved")}
                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
                          >
                            通过
                          </button>
                          <button
                            onClick={() => handleStatusChange(ranking.id, "rejected")}
                            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
                          >
                            拒绝
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => handleDelete(ranking.id)}
                        className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
                      >
                        删除
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
