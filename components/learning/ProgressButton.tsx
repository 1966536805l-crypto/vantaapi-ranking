"use client";

import { useState } from "react";
import { localizedHref, type InterfaceLanguage } from "@/lib/language";
import { getLearnPageCopy } from "@/lib/study-page-copy";

export default function ProgressButton({
  lessonId,
  initialStatus,
  language = "en",
}: {
  lessonId: string;
  initialStatus?: string;
  language?: InterfaceLanguage;
}) {
  const [status, setStatus] = useState(initialStatus || "NOT_STARTED");
  const [saving, setSaving] = useState(false);
  const copy = getLearnPageCopy(language);
  const statusLabel = status === "COMPLETED" ? copy.completed : status === "IN_PROGRESS" ? copy.start : copy.notCompleted;

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
      window.location.href = localizedHref("/login", language);
      return;
    }
    if (response.ok) setStatus(nextStatus);
  }

  return (
    <div className="apple-card flex flex-wrap items-center gap-3 p-4">
      <span className="rounded-full border border-black/5 bg-white/70 px-3 py-2 font-mono text-xs uppercase tracking-[0.14em] text-[color:var(--muted)]">
        {copy.markStatus}: {statusLabel}
      </span>
      <button
        onClick={() => save("IN_PROGRESS")}
        disabled={saving}
        className="apple-button-secondary px-4 py-2 text-sm disabled:opacity-50"
      >
        {copy.saveProgress}
      </button>
      <button
        onClick={() => save("COMPLETED")}
        disabled={saving}
        className="apple-button-primary px-4 py-2 text-sm disabled:opacity-50"
      >
        {copy.markComplete}
      </button>
    </div>
  );
}
