"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import type { SurvivalPhraseKey } from "@/lib/world-language-content";

type Phrase = {
  key: SurvivalPhraseKey;
  label: string;
  text: string;
};

type WorldLanguageStarterTrainerProps = {
  languageSlug: string;
  nativeName: string;
  languageName: string;
  phrases: Phrase[];
};

const speechLangBySlug: Record<string, string> = {
  amharic: "am-ET",
  arabic: "ar-SA",
  bengali: "bn-BD",
  chinese: "zh-CN",
  czech: "cs-CZ",
  danish: "da-DK",
  dutch: "nl-NL",
  english: "en-US",
  finnish: "fi-FI",
  french: "fr-FR",
  german: "de-DE",
  greek: "el-GR",
  hebrew: "he-IL",
  hindi: "hi-IN",
  hungarian: "hu-HU",
  indonesian: "id-ID",
  italian: "it-IT",
  japanese: "ja-JP",
  korean: "ko-KR",
  malay: "ms-MY",
  norwegian: "nb-NO",
  persian: "fa-IR",
  polish: "pl-PL",
  portuguese: "pt-BR",
  romanian: "ro-RO",
  russian: "ru-RU",
  spanish: "es-ES",
  swahili: "sw-KE",
  swedish: "sv-SE",
  tagalog: "fil-PH",
  tamil: "ta-IN",
  telugu: "te-IN",
  thai: "th-TH",
  turkish: "tr-TR",
  ukrainian: "uk-UA",
  urdu: "ur-PK",
  vietnamese: "vi-VN",
  welsh: "cy-GB",
};

function normalizeAnswer(value: string) {
  return value
    .normalize("NFKC")
    .replace(/[。！？،؟؛,.!?;:]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLocaleLowerCase();
}

function maskPhrase(value: string) {
  return Array.from(value).map((character) => {
    if (/\s/.test(character)) return " ";
    return character.match(/[A-Za-z0-9]/) ? "·" : "＿";
  }).join("");
}

function getVoice(lang: string) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return undefined;
  const voices = window.speechSynthesis.getVoices();
  const base = lang.split("-")[0]?.toLowerCase();
  return (
    voices.find((voice) => voice.lang.toLowerCase() === lang.toLowerCase() && voice.localService) ||
    voices.find((voice) => voice.lang.toLowerCase() === lang.toLowerCase()) ||
    voices.find((voice) => voice.lang.toLowerCase().startsWith(`${base}-`))
  );
}

export function WorldLanguageStarterTrainer({
  languageSlug,
  nativeName,
  languageName,
  phrases,
}: WorldLanguageStarterTrainerProps) {
  const [index, setIndex] = useState(0);
  const [draft, setDraft] = useState("");
  const [showHint, setShowHint] = useState(true);
  const [showAnswer, setShowAnswer] = useState(false);
  const [message, setMessage] = useState("先听 再看影子 最后打出来");
  const [stats, setStats] = useState({ correct: 0, wrong: 0 });
  const inputRef = useRef<HTMLInputElement>(null);

  const current = phrases[index % phrases.length];
  const speechLang = speechLangBySlug[languageSlug] || "en-US";
  const progress = useMemo(() => {
    return phrases.length ? Math.round(((index % phrases.length) / phrases.length) * 100) : 0;
  }, [index, phrases.length]);
  const isCorrect = normalizeAnswer(draft) === normalizeAnswer(current.text);

  const speak = useCallback((text = current.text, slow = false) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window) || !text) {
      setMessage("当前浏览器不支持发音 继续看句子练拼写");
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = speechLang;
    utterance.rate = slow ? 0.68 : 0.88;
    utterance.pitch = 1;
    utterance.volume = 1;
    const voice = getVoice(speechLang);
    if (voice) utterance.voice = voice;
    utterance.onerror = () => setMessage("系统没有这门语言的语音包 先用拼写练习");
    window.speechSynthesis.speak(utterance);
  }, [current.text, speechLang]);

  const next = useCallback(() => {
    setIndex((value) => (value + 1) % phrases.length);
    setDraft("");
    setShowAnswer(false);
    setShowHint(true);
    setMessage("下一句 先听一遍");
    window.setTimeout(() => inputRef.current?.focus(), 0);
  }, [phrases.length]);

  const check = useCallback(() => {
    if (isCorrect) {
      setStats((value) => ({ ...value, correct: value.correct + 1 }));
      setMessage("通过 自动下一句");
      window.setTimeout(next, 420);
      return;
    }

    setStats((value) => ({ ...value, wrong: value.wrong + 1 }));
    setMessage("还差一点 慢速再听一遍");
    setShowHint(true);
    speak(current.text, true);
    window.setTimeout(() => inputRef.current?.focus(), 0);
  }, [current.text, isCorrect, next, speak]);

  return (
    <section className="mt-3 dense-panel p-5">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow">第一课训练器</p>
          <h2 className="mt-2 text-2xl font-semibold">{nativeName} 听音拼写</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="dense-status">{languageName}</span>
          <span className="dense-status">{speechLang}</span>
          <span className="dense-status">对 {stats.correct} 错 {stats.wrong}</span>
        </div>
      </div>

      <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="rounded-[8px] border border-slate-200 bg-white/85 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="eyebrow">{String((index % phrases.length) + 1).padStart(2, "0")} / {phrases.length}</p>
              <h3 className="mt-2 text-3xl font-semibold leading-tight sm:text-4xl">
                {showAnswer ? current.text : showHint ? maskPhrase(current.text) : "先听 不看答案"}
              </h3>
              <p className="mt-2 text-sm text-[color:var(--muted)]">{current.label}</p>
            </div>
            <button type="button" className="dense-action-primary px-4 py-2.5" onClick={() => speak()}>
              发音
            </button>
          </div>

          <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-100">
            <div className="h-full rounded-full bg-slate-950 transition-all" style={{ width: `${progress}%` }} />
          </div>

          <label className="mt-5 grid gap-2">
            <span className="eyebrow">打出这句</span>
            <input
              ref={inputRef}
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") check();
                if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "p") {
                  event.preventDefault();
                  speak();
                }
              }}
              className={`w-full rounded-[8px] border bg-white px-3 py-3 text-lg outline-none transition ${
                draft && isCorrect ? "border-emerald-400" : draft ? "border-slate-300" : "border-slate-200"
              }`}
              placeholder="听音后输入完整短句"
              autoComplete="off"
              spellCheck={false}
            />
          </label>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button type="button" className="dense-action-primary px-4 py-2.5" onClick={check}>
              检查
            </button>
            <button type="button" className="dense-action px-4 py-2.5" onClick={() => speak(current.text, true)}>
              慢速
            </button>
            <button type="button" className="dense-action px-4 py-2.5" onClick={() => setShowHint((value) => !value)}>
              {showHint ? "隐藏影子" : "显示影子"}
            </button>
            <button type="button" className="dense-action px-4 py-2.5" onClick={() => setShowAnswer((value) => !value)}>
              {showAnswer ? "收起答案" : "看答案"}
            </button>
            <button type="button" className="dense-action px-4 py-2.5" onClick={next}>
              下一句
            </button>
          </div>
          <p className="mt-3 text-sm text-[color:var(--muted)]">{message}</p>
        </div>

        <div className="rounded-[8px] border border-slate-200 bg-white/85 p-4">
          <p className="eyebrow">快捷键</p>
          <div className="mt-3 grid gap-2 text-sm text-[color:var(--muted)]">
            <div className="dense-row"><span>Enter</span><span>检查</span></div>
            <div className="dense-row"><span>Ctrl P</span><span>发音</span></div>
            <div className="dense-row"><span>影子</span><span>先看轮廓 再打完整句</span></div>
          </div>
          <div className="mt-4 grid gap-2">
            {phrases.map((phrase, phraseIndex) => (
              <button
                key={phrase.key}
                type="button"
                onClick={() => {
                  setIndex(phraseIndex);
                  setDraft("");
                  setShowAnswer(false);
                  setMessage("已切换短句");
                }}
                className={phraseIndex === index ? "dense-action-primary justify-between" : "dense-action justify-between"}
              >
                <span>{phrase.label}</span>
                <span>{String(phraseIndex + 1).padStart(2, "0")}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
