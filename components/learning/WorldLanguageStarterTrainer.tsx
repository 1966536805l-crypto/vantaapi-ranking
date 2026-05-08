"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import type { InterfaceLanguage } from "@/lib/language";
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
  interfaceLanguage?: InterfaceLanguage;
};

type TrainerLanguage = "en" | "zh" | "ja" | "ar";

function trainerLanguage(language: InterfaceLanguage): TrainerLanguage {
  if (language === "zh" || language === "ja" || language === "ar") return language;
  return "en";
}

const trainerCopy: Record<TrainerLanguage, {
  initialMessage: string;
  unsupported: string;
  noVoice: string;
  nextMessage: string;
  passMessage: string;
  retryMessage: string;
  switchedMessage: string;
  eyebrow: string;
  title: (nativeName: string) => string;
  stats: (correct: number, wrong: number) => string;
  hidden: string;
  pronounce: string;
  typeLabel: string;
  placeholder: string;
  check: string;
  slow: string;
  hideShadow: string;
  showShadow: string;
  hideAnswer: string;
  showAnswer: string;
  next: string;
  shortcuts: string;
  shadow: string;
  shadowBody: string;
}> = {
  en: {
    initialMessage: "Listen first then use the shadow and type the full phrase",
    unsupported: "This browser does not support speech. Keep practicing with spelling.",
    noVoice: "No system voice for this language. Use spelling practice first.",
    nextMessage: "Next phrase. Listen once first.",
    passMessage: "Passed. Moving to the next phrase.",
    retryMessage: "Almost. Listen again slowly.",
    switchedMessage: "Phrase switched.",
    eyebrow: "First lesson trainer",
    title: (nativeName) => `${nativeName} listening and spelling`,
    stats: (correct, wrong) => `Correct ${correct} Wrong ${wrong}`,
    hidden: "Listen first. No answer yet.",
    pronounce: "Pronounce",
    typeLabel: "Type this phrase",
    placeholder: "Listen then type the complete phrase",
    check: "Check",
    slow: "Slow",
    hideShadow: "Hide shadow",
    showShadow: "Show shadow",
    hideAnswer: "Hide answer",
    showAnswer: "Show answer",
    next: "Next phrase",
    shortcuts: "Shortcuts",
    shadow: "Shadow",
    shadowBody: "Read the outline first, then type the full phrase.",
  },
  zh: {
    initialMessage: "先听 再看影子 最后打出来",
    unsupported: "当前浏览器不支持发音 继续看句子练拼写",
    noVoice: "系统没有这门语言的语音包 先用拼写练习",
    nextMessage: "下一句 先听一遍",
    passMessage: "通过 自动下一句",
    retryMessage: "还差一点 慢速再听一遍",
    switchedMessage: "已切换短句",
    eyebrow: "第一课训练器",
    title: (nativeName) => `${nativeName} 听音拼写`,
    stats: (correct, wrong) => `对 ${correct} 错 ${wrong}`,
    hidden: "先听 不看答案",
    pronounce: "发音",
    typeLabel: "打出这句",
    placeholder: "听音后输入完整短句",
    check: "检查",
    slow: "慢速",
    hideShadow: "隐藏影子",
    showShadow: "显示影子",
    hideAnswer: "收起答案",
    showAnswer: "看答案",
    next: "下一句",
    shortcuts: "快捷键",
    shadow: "影子",
    shadowBody: "先看轮廓 再打完整句",
  },
  ja: {
    initialMessage: "まず聞き、影を見て、最後に全文を入力します",
    unsupported: "このブラウザーは発音に対応していません。綴り練習を続けてください。",
    noVoice: "この言語のシステム音声がありません。先に綴りで練習します。",
    nextMessage: "次の文です。まず一度聞きます。",
    passMessage: "通過しました。次の文へ進みます。",
    retryMessage: "あと少しです。ゆっくりもう一度聞きます。",
    switchedMessage: "文を切り替えました。",
    eyebrow: "第一課トレーナー",
    title: (nativeName) => `${nativeName} 聞き取りと綴り`,
    stats: (correct, wrong) => `正解 ${correct} ミス ${wrong}`,
    hidden: "まず聞く 答えはまだ見ない",
    pronounce: "発音",
    typeLabel: "この文を入力",
    placeholder: "聞いてから全文を入力",
    check: "確認",
    slow: "ゆっくり",
    hideShadow: "影を隠す",
    showShadow: "影を表示",
    hideAnswer: "答えを隠す",
    showAnswer: "答えを見る",
    next: "次の文",
    shortcuts: "ショートカット",
    shadow: "影",
    shadowBody: "輪郭を見てから全文を入力します。",
  },
  ar: {
    initialMessage: "استمع أولا ثم استخدم الظل واكتب العبارة كاملة",
    unsupported: "المتصفح لا يدعم النطق. تابع التدريب على الكتابة.",
    noVoice: "لا توجد حزمة صوت لهذه اللغة في النظام. تدرب على الكتابة أولا.",
    nextMessage: "العبارة التالية. استمع مرة أولا.",
    passMessage: "نجحت. الانتقال إلى العبارة التالية.",
    retryMessage: "اقتربت. استمع ببطء مرة أخرى.",
    switchedMessage: "تم تبديل العبارة.",
    eyebrow: "مدرب الدرس الأول",
    title: (nativeName) => `استماع وكتابة ${nativeName}`,
    stats: (correct, wrong) => `صحيح ${correct} خطأ ${wrong}`,
    hidden: "استمع أولا دون رؤية الإجابة",
    pronounce: "النطق",
    typeLabel: "اكتب هذه العبارة",
    placeholder: "استمع ثم اكتب العبارة كاملة",
    check: "تحقق",
    slow: "بطيء",
    hideShadow: "إخفاء الظل",
    showShadow: "إظهار الظل",
    hideAnswer: "إخفاء الإجابة",
    showAnswer: "عرض الإجابة",
    next: "العبارة التالية",
    shortcuts: "اختصارات",
    shadow: "الظل",
    shadowBody: "اقرأ الشكل أولا ثم اكتب العبارة كاملة.",
  },
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
  interfaceLanguage = "en",
}: WorldLanguageStarterTrainerProps) {
  const copy = trainerCopy[trainerLanguage(interfaceLanguage)];
  const [index, setIndex] = useState(0);
  const [draft, setDraft] = useState("");
  const [showHint, setShowHint] = useState(true);
  const [showAnswer, setShowAnswer] = useState(false);
  const [message, setMessage] = useState(copy.initialMessage);
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
      setMessage(copy.unsupported);
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
    utterance.onerror = () => setMessage(copy.noVoice);
    window.speechSynthesis.speak(utterance);
  }, [copy.noVoice, copy.unsupported, current.text, speechLang]);

  const next = useCallback(() => {
    setIndex((value) => (value + 1) % phrases.length);
    setDraft("");
    setShowAnswer(false);
    setShowHint(true);
    setMessage(copy.nextMessage);
    window.setTimeout(() => inputRef.current?.focus(), 0);
  }, [copy.nextMessage, phrases.length]);

  const check = useCallback(() => {
    if (isCorrect) {
      setStats((value) => ({ ...value, correct: value.correct + 1 }));
      setMessage(copy.passMessage);
      window.setTimeout(next, 420);
      return;
    }

    setStats((value) => ({ ...value, wrong: value.wrong + 1 }));
    setMessage(copy.retryMessage);
    setShowHint(true);
    speak(current.text, true);
    window.setTimeout(() => inputRef.current?.focus(), 0);
  }, [copy.passMessage, copy.retryMessage, current.text, isCorrect, next, speak]);

  return (
    <section className="mt-3 dense-panel p-5">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow">{copy.eyebrow}</p>
          <h2 className="mt-2 text-2xl font-semibold">{copy.title(nativeName)}</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="dense-status">{languageName}</span>
          <span className="dense-status">{speechLang}</span>
          <span className="dense-status">{copy.stats(stats.correct, stats.wrong)}</span>
        </div>
      </div>

      <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="rounded-[8px] border border-slate-200 bg-white/85 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="eyebrow">{String((index % phrases.length) + 1).padStart(2, "0")} / {phrases.length}</p>
              <h3 className="mt-2 text-3xl font-semibold leading-tight sm:text-4xl">
                {showAnswer ? current.text : showHint ? maskPhrase(current.text) : copy.hidden}
              </h3>
              <p className="mt-2 text-sm text-[color:var(--muted)]">{current.label}</p>
            </div>
            <button type="button" className="dense-action-primary px-4 py-2.5" onClick={() => speak()}>
              {copy.pronounce}
            </button>
          </div>

          <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-100">
            <div className="h-full rounded-full bg-slate-950 transition-all" style={{ width: `${progress}%` }} />
          </div>

          <label className="mt-5 grid gap-2">
            <span className="eyebrow">{copy.typeLabel}</span>
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
              placeholder={copy.placeholder}
              autoComplete="off"
              spellCheck={false}
            />
          </label>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button type="button" className="dense-action-primary px-4 py-2.5" onClick={check}>
              {copy.check}
            </button>
            <button type="button" className="dense-action px-4 py-2.5" onClick={() => speak(current.text, true)}>
              {copy.slow}
            </button>
            <button type="button" className="dense-action px-4 py-2.5" onClick={() => setShowHint((value) => !value)}>
              {showHint ? copy.hideShadow : copy.showShadow}
            </button>
            <button type="button" className="dense-action px-4 py-2.5" onClick={() => setShowAnswer((value) => !value)}>
              {showAnswer ? copy.hideAnswer : copy.showAnswer}
            </button>
            <button type="button" className="dense-action px-4 py-2.5" onClick={next}>
              {copy.next}
            </button>
          </div>
          <p className="mt-3 text-sm text-[color:var(--muted)]">{message}</p>
        </div>

        <div className="rounded-[8px] border border-slate-200 bg-white/85 p-4">
          <p className="eyebrow">{copy.shortcuts}</p>
          <div className="mt-3 grid gap-2 text-sm text-[color:var(--muted)]">
            <div className="dense-row"><span>Enter</span><span>{copy.check}</span></div>
            <div className="dense-row"><span>Ctrl P</span><span>{copy.pronounce}</span></div>
            <div className="dense-row"><span>{copy.shadow}</span><span>{copy.shadowBody}</span></div>
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
                  setMessage(copy.switchedMessage);
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
