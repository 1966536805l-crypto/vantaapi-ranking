"use client";

import { useMemo, useState } from "react";
import VocabularyTrainer from "@/components/learning/VocabularyTrainer";
import type { ExamVocabularyPack, ExamVocabularyWord } from "@/lib/exam-content";
import type { SiteLanguage } from "@/lib/language";

type MemoryPack = Pick<ExamVocabularyPack, "slug" | "title" | "shortTitle" | "targetCount" | "level"> & {
  words: ExamVocabularyWord[];
};

const copy = {
  en: {
    eyebrow: "Memory System",
    title: "Spaced vocabulary review",
    subtitle: "Choose a pack and review with pronunciation, reveal controls, spelling mode, and Ebbinghaus scheduling saved in this browser.",
    choose: "Choose word bank",
    shortcut: "Q know · 0 do not know",
    count: "words",
  },
  zh: {
    eyebrow: "背单词系统",
    title: "艾宾浩斯遗忘曲线背单词",
    subtitle: "选择词库后直接背，支持发音、释义显示、拼写模式、本机保存进度，以及 Q 认识、0 不认识快捷键。",
    choose: "选择词库",
    shortcut: "Q 认识 · 0 不认识",
    count: "词",
  },
} as const;

export default function MemoryWordSystem({
  packs,
  language,
}: {
  packs: MemoryPack[];
  language: SiteLanguage;
}) {
  const t = copy[language];
  const [selectedSlug, setSelectedSlug] = useState(packs[0]?.slug ?? "");
  const selectedPack = useMemo(
    () => packs.find((pack) => pack.slug === selectedSlug) ?? packs[0],
    [packs, selectedSlug],
  );

  if (!selectedPack) return null;

  return (
    <section className="memory-word-system">
      <div className="module-hero px-5 py-6">
        <p className="eyebrow">{t.eyebrow}</p>
        <h1 className="apple-display-title mt-3 max-w-4xl text-3xl sm:text-4xl">{t.title}</h1>
        <p className="apple-display-subtitle mt-3 max-w-3xl text-sm text-[color:var(--muted)]">{t.subtitle}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="dense-status">Ebbinghaus</span>
          <span className="dense-status">{t.shortcut}</span>
          <span className="dense-status">{selectedPack.targetCount.toLocaleString(language === "zh" ? "zh-CN" : "en-US")} {t.count}</span>
        </div>
      </div>

      <section className="dense-panel mt-4 p-4 sm:p-5" aria-label={t.choose}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="eyebrow">{t.choose}</p>
            <h2 className="mt-2 text-2xl font-semibold">{selectedPack.shortTitle}</h2>
          </div>
          <span className="dense-status">{selectedPack.level}</span>
        </div>
        <div className="mt-4 grid gap-2 md:grid-cols-2 xl:grid-cols-3">
          {packs.map((pack) => (
            <button
              key={pack.slug}
              type="button"
              className={`memory-pack-button${pack.slug === selectedPack.slug ? " active" : ""}`}
              onClick={() => setSelectedSlug(pack.slug)}
            >
              <strong>{pack.shortTitle}</strong>
              <span>{pack.level} · {pack.targetCount.toLocaleString(language === "zh" ? "zh-CN" : "en-US")} {t.count}</span>
            </button>
          ))}
        </div>
      </section>

      <VocabularyTrainer
        key={selectedPack.slug}
        packSlug={`memory-${selectedPack.slug}`}
        words={selectedPack.words}
        language={language}
        packMeta={{
          slug: selectedPack.slug,
          title: selectedPack.title,
          shortTitle: selectedPack.shortTitle,
          targetCount: selectedPack.targetCount,
          level: selectedPack.level,
        }}
      />
    </section>
  );
}
