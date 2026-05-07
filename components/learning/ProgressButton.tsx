"use client";

import { useState } from "react";

export default function ProgressButton({
  lessonId,
  initialStatus,
}: {
  lessonId: string;
  initialStatus?: string;
}) {
  const [status, setStatus] = useState(initialStatus || "NOT_STARTED");
  const [saving, setSaving] = useState(false);
  const statusLabel = status === "COMPLETED" ? "已完成" : status === "IN_PROGRESS" ? "学习中" : "未开始";

  async function save(nextStatus: "IN_PROGRESS" | "COMPLETED") {
    if (lessonId.startsWith("fallback-")) {
      setStatus(nextStatus);
      return;
    }

    setSaving(true);
    const response = await fetch("/api/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lessonId, status: nextStatus }),
    });
    setSaving(false);
    if (response.status === 401) {
      window.location.href = "/login";
      return;
    }
    if (response.ok) setStatus(nextStatus);
  }

  return (
    <div className="apple-card flex flex-wrap items-center gap-3 p-4">
      <span className="rounded-full border border-black/5 bg-white/70 px-3 py-2 font-mono text-xs uppercase tracking-[0.14em] text-[color:var(--muted)]">
        当前状态：{statusLabel}
      </span>
      <button
        onClick={() => save("IN_PROGRESS")}
        disabled={saving}
        className="apple-button-secondary px-4 py-2 text-sm disabled:opacity-50"
      >
        保存进度
      </button>
      <button
        onClick={() => save("COMPLETED")}
        disabled={saving}
        className="apple-button-primary px-4 py-2 text-sm disabled:opacity-50"
      >
        标记完成
      </button>
    </div>
  );
}
