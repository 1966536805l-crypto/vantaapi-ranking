"use client";

import { useState } from "react";

export default function WrongQuestionActions({ id }: { id: string }) {
  const [removed, setRemoved] = useState(false);
  const [message, setMessage] = useState("");

  if (removed) return <p className="mt-4 rounded-[8px] border border-emerald-100 bg-emerald-50 px-3 py-2.5 text-sm text-emerald-700">已从错题收藏移除</p>;

  async function remove() {
    const response = await fetch(`/api/wrong?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    const data = await response.json().catch(() => ({}));
    if (response.ok) {
      setRemoved(true);
      return;
    }
    setMessage(data.message || "移除失败");
  }

  return (
    <div className="mt-4 flex flex-wrap items-center gap-3">
      <button onClick={remove} className="apple-button-secondary px-3 py-2 text-sm hover:border-red-200 hover:text-red-700">
        移出错题
      </button>
      {message && <span className="text-sm text-red-700">{message}</span>}
    </div>
  );
}
