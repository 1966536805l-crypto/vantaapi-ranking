"use client";

import { useState } from "react";

export default function LessonProgressButton({ lessonId }: { lessonId: string }) {
  const [message, setMessage] = useState("");

  async function complete() {
    const response = await fetch("/api/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lessonId, status: "COMPLETED", score: 100 }),
    });
    const data = await response.json().catch(() => ({}));
    setMessage(response.ok ? "Progress saved" : data.message || "Please login first");
  }

  return (
    <div className="mt-6 border border-slate-200 bg-slate-50 p-4">
      <button
        onClick={complete}
        className="border border-blue-700 bg-blue-700 px-4 py-2 text-sm font-semibold text-white"
      >
        Mark lesson completed
      </button>
      {message && <p className="mt-2 text-sm text-slate-600">{message}</p>}
    </div>
  );
}
