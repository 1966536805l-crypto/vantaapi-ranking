"use client";

import { useState } from "react";
import type { InterfaceLanguage } from "@/lib/language";

type WrongActionLanguage = "en" | "zh" | "ja" | "ar";

function actionLanguage(language: InterfaceLanguage): WrongActionLanguage {
  if (language === "zh" || language === "ja" || language === "ar") return language;
  return "en";
}

const copy: Record<WrongActionLanguage, {
  removed: string;
  removeFailed: string;
  reviewed: string;
  markReviewed: string;
  remove: string;
  reviewHint: string;
}> = {
  en: {
    removed: "Removed from wrong-question review",
    removeFailed: "Remove failed",
    reviewed: "Reviewed this round",
    markReviewed: "Mark reviewed",
    remove: "Remove",
    reviewHint: "Good. Go back to the lesson and solve it once more.",
  },
  zh: {
    removed: "已从错题收藏移除",
    removeFailed: "移除失败",
    reviewed: "本轮已复习",
    markReviewed: "标记本轮复习",
    remove: "移出错题",
    reviewHint: "很好，下一步回知识点重做一次。",
  },
  ja: {
    removed: "復習リストから削除しました",
    removeFailed: "削除に失敗しました",
    reviewed: "この回は復習済み",
    markReviewed: "復習済みにする",
    remove: "削除",
    reviewHint: "よし。次はレッスンに戻ってもう一度解きます。",
  },
  ar: {
    removed: "تمت الإزالة من مراجعة الأخطاء",
    removeFailed: "فشلت الإزالة",
    reviewed: "تمت المراجعة في هذه الجولة",
    markReviewed: "علّم كمراجَع",
    remove: "إزالة",
    reviewHint: "جيد. ارجع إلى الدرس وحلها مرة أخرى.",
  },
};

export default function WrongQuestionActions({
  id,
  language = "en",
}: {
  id: string;
  language?: InterfaceLanguage;
}) {
  const t = copy[actionLanguage(language)];
  const [removed, setRemoved] = useState(false);
  const [reviewed, setReviewed] = useState(false);
  const [message, setMessage] = useState("");

  if (removed) return <p className="mt-4 rounded-[8px] border border-emerald-100 bg-emerald-50 px-3 py-2.5 text-sm text-emerald-700">{t.removed}</p>;

  async function remove() {
    const response = await fetch(`/api/wrong?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    const data = await response.json().catch(() => ({}));
    if (response.ok) {
      setRemoved(true);
      return;
    }
    setMessage(data.message || t.removeFailed);
  }

  return (
    <div className="mt-4 flex flex-wrap items-center gap-3">
      <button
        type="button"
        onClick={() => setReviewed(true)}
        className="apple-button-primary px-3 py-2 text-sm disabled:opacity-60"
        disabled={reviewed}
      >
        {reviewed ? t.reviewed : t.markReviewed}
      </button>
      <button type="button" onClick={remove} className="apple-button-secondary px-3 py-2 text-sm hover:border-red-200 hover:text-red-700">
        {t.remove}
      </button>
      {reviewed && <span className="text-sm text-emerald-700">{t.reviewHint}</span>}
      {message && <span className="text-sm text-red-700">{message}</span>}
    </div>
  );
}
