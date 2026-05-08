"use client";

import { useCallback, useEffect, useState } from "react";
import { localizedHref, type InterfaceLanguage, type SiteLanguage } from "@/lib/language";

type QuizLanguage = SiteLanguage | "ja" | "ar";

function quizLanguage(language: InterfaceLanguage | SiteLanguage): QuizLanguage {
  if (language === "zh" || language === "ja" || language === "ar") return language;
  return "en";
}

const typeLabel: Record<QuizLanguage, Record<string, string>> = {
  en: {
    MULTIPLE_CHOICE: "Multiple choice",
    FILL_BLANK: "Fill blank",
    CODE_READING: "Code reading",
  },
  zh: {
    MULTIPLE_CHOICE: "选择题",
    FILL_BLANK: "填空题",
    CODE_READING: "代码阅读",
  },
  ja: {
    MULTIPLE_CHOICE: "選択問題",
    FILL_BLANK: "穴埋め",
    CODE_READING: "コード読解",
  },
  ar: {
    MULTIPLE_CHOICE: "اختيار من متعدد",
    FILL_BLANK: "ملء الفراغ",
    CODE_READING: "قراءة كود",
  },
};

const copy: Record<QuizLanguage, {
  score: string;
  completed: string;
  correct: string;
  exercise: string;
  placeholder: string;
  submit: string;
  saveWrong: string;
  localWrong: string;
  saved: string;
  saveFailed: string;
  submitFailed: string;
  correctResult: string;
  incorrectLocal: string;
  incorrectSaved: string;
  correctAnswer: string;
  timerLabel: string;
  timeoutResult: string;
  locked: string;
}> = {
  en: {
    score: "Score",
    completed: "Completed",
    correct: "Correct",
    exercise: "Exercise",
    placeholder: "Enter answer",
    submit: "Submit",
    saveWrong: "Save wrong item",
    localWrong: "Database backed course questions can be saved to the wrong bank",
    saved: "Saved to wrong bank",
    saveFailed: "Save failed",
    submitFailed: "Submit failed",
    correctResult: "Correct",
    incorrectLocal: "Incorrect local practice is not saved",
    incorrectSaved: "Incorrect saved to wrong bank",
    correctAnswer: "Correct answer",
    timerLabel: "5 second choice limit",
    timeoutResult: "Timed out and counted wrong",
    locked: "Finish the current timed question first",
  },
  zh: {
    score: "得分",
    completed: "已完成",
    correct: "正确",
    exercise: "练习",
    placeholder: "输入答案",
    submit: "提交",
    saveWrong: "保存错题",
    localWrong: "数据库课程题可以保存到错题本",
    saved: "已保存到错题本",
    saveFailed: "保存失败",
    submitFailed: "提交失败",
    correctResult: "正确",
    incorrectLocal: "本地练习错误不会保存",
    incorrectSaved: "错误已保存到错题本",
    correctAnswer: "正确答案",
    timerLabel: "选择题 5 秒限时",
    timeoutResult: "超时 已算错",
    locked: "先完成当前限时题",
  },
  ja: {
    score: "スコア",
    completed: "完了",
    correct: "正解",
    exercise: "練習",
    placeholder: "答えを入力",
    submit: "送信",
    saveWrong: "間違いに保存",
    localWrong: "データベース付き問題は復習ノートに保存できます",
    saved: "復習ノートに保存しました",
    saveFailed: "保存に失敗しました",
    submitFailed: "送信に失敗しました",
    correctResult: "正解",
    incorrectLocal: "ローカル練習の間違いは保存されません",
    incorrectSaved: "間違いを復習ノートに保存しました",
    correctAnswer: "正解",
    timerLabel: "選択問題 5 秒制限",
    timeoutResult: "時間切れ 不正解",
    locked: "現在の時間制限問題を先に完了してください",
  },
  ar: {
    score: "النتيجة",
    completed: "مكتمل",
    correct: "صحيح",
    exercise: "تدريب",
    placeholder: "أدخل الإجابة",
    submit: "إرسال",
    saveWrong: "حفظ في دفتر الأخطاء",
    localWrong: "يمكن حفظ أسئلة الدورة المدعومة بقاعدة بيانات في دفتر الأخطاء",
    saved: "تم الحفظ في دفتر الأخطاء",
    saveFailed: "فشل الحفظ",
    submitFailed: "فشل الإرسال",
    correctResult: "صحيح",
    incorrectLocal: "خطأ التدريب المحلي لا يتم حفظه",
    incorrectSaved: "تم حفظ الخطأ في دفتر الأخطاء",
    correctAnswer: "الإجابة الصحيحة",
    timerLabel: "اختيار خلال 5 ثوان",
    timeoutResult: "انتهى الوقت واحتسب خطأ",
    locked: "أكمل السؤال المحدد بالوقت أولا",
  },
};

type Option = { id: string; label: string; content: string };
type Question = {
  id: string;
  type: string;
  prompt: string;
  codeSnippet: string | null;
  difficulty: string;
  answer?: string;
  explanation?: string;
  options: Option[];
};

export default function QuizBlock({
  questions,
  lessonId,
  language = "en",
  strictChoiceTimer = false,
}: {
  questions: Question[];
  lessonId: string;
  language?: InterfaceLanguage | SiteLanguage;
  strictChoiceTimer?: boolean;
}) {
  const uiLanguage = quizLanguage(language);
  const t = copy[uiLanguage];
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [results, setResults] = useState<Record<string, { correct: boolean; explanation: string; answer: string }>>({});
  const [message, setMessage] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(5);
  const answered = Object.keys(results).length;
  const correct = Object.values(results).filter((result) => result.correct).length;
  const score = answered ? Math.round((correct / questions.length) * 100) : 0;
  const activeQuestion = questions[activeIndex];

  const moveToNextQuestion = useCallback((questionId: string) => {
    const index = questions.findIndex((question) => question.id === questionId);
    if (index >= 0) setActiveIndex((current) => Math.max(current, Math.min(index + 1, questions.length - 1)));
  }, [questions]);

  async function submit(questionId: string, answerOverride?: string) {
    const localQuestion = questions.find((question) => question.id === questionId);
    const submittedAnswer = answerOverride ?? (answers[questionId] || "");
    if (localQuestion?.id.startsWith("fallback-") && localQuestion.answer) {
      const actual = submittedAnswer.trim().replace(/\s+/g, " ").toLowerCase();
      const expected = localQuestion.answer.trim().replace(/\s+/g, " ").toLowerCase();
      setResults((current) => ({
        ...current,
        [questionId]: {
          correct: actual === expected,
          explanation: localQuestion.explanation || "",
          answer: localQuestion.answer || "",
        },
      }));
      moveToNextQuestion(questionId);
      return;
    }

    setSaving(true);
    const response = await fetch("/api/quiz/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ questionId, answer: submittedAnswer, lessonId }),
    });
    const data = await response.json().catch(() => ({}));
    setSaving(false);
    if (response.status === 401) return window.location.assign(localizedHref("/login", language));
    if (data.result) {
      setResults((current) => ({ ...current, [questionId]: data.result }));
      moveToNextQuestion(questionId);
    }
    if (!response.ok) setMessage((current) => ({ ...current, [questionId]: data.message || t.submitFailed }));
  }

  async function saveWrong(questionId: string) {
    if (questionId.startsWith("fallback-")) {
      setMessage((current) => ({
        ...current,
        [questionId]: t.localWrong,
      }));
      return;
    }

    const response = await fetch("/api/wrong", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ questionId, note: "Saved manually" }),
    });
    if (response.status === 401) return window.location.assign(localizedHref("/login", language));
    setMessage((current) => ({ ...current, [questionId]: response.ok ? t.saved : t.saveFailed }));
  }

  useEffect(() => {
    if (!strictChoiceTimer || !activeQuestion || activeQuestion.options.length === 0 || results[activeQuestion.id]) {
      const reset = window.setTimeout(() => setTimeLeft(5), 0);
      return () => window.clearTimeout(reset);
    }

    const deadline = Date.now() + 5000;
    const reset = window.setTimeout(() => setTimeLeft(5), 0);
    const tick = window.setInterval(() => {
      setTimeLeft(Math.max(0, Math.ceil((deadline - Date.now()) / 1000)));
    }, 200);
    const timeout = window.setTimeout(() => {
      setResults((current) => {
        if (current[activeQuestion.id]) return current;
        return {
          ...current,
          [activeQuestion.id]: {
            correct: false,
            explanation: `${t.timeoutResult}. ${activeQuestion.explanation || ""}`,
            answer: activeQuestion.answer || "",
          },
        };
      });
      setMessage((current) => ({ ...current, [activeQuestion.id]: t.timeoutResult }));
      moveToNextQuestion(activeQuestion.id);
    }, 5000);

    return () => {
      window.clearTimeout(reset);
      window.clearInterval(tick);
      window.clearTimeout(timeout);
    };
  }, [activeQuestion, moveToNextQuestion, results, strictChoiceTimer, t.timeoutResult]);

  return (
    <div className="space-y-4">
      {answered > 0 && (
        <div className="border border-blue-100 bg-blue-50 p-4 text-sm text-blue-800">
          {t.score} {score}  {t.completed} {answered}/{questions.length}  {t.correct} {correct}
        </div>
      )}
      {questions.map((q, index) => {
        const result = results[q.id];
        const isActive = !strictChoiceTimer || index === activeIndex;
        const locked = strictChoiceTimer && !isActive && !result;
        const choiceTimed = strictChoiceTimer && isActive && q.options.length > 0 && !result;

        return (
        <article key={q.id} className={`border border-slate-200 bg-white p-5 ${locked ? "opacity-55" : ""}`}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="eyebrow">{t.exercise} {index + 1}  {typeLabel[uiLanguage][q.type] || q.type}</p>
            {choiceTimed ? (
              <div className={`vocab-timer min-w-[180px] ${timeLeft <= 2 ? "urgent" : ""}`} aria-label={t.timerLabel}>
                <span>{t.timerLabel}</span>
                <strong>{timeLeft}s</strong>
                <i style={{ width: `${Math.max(0, Math.min(100, (timeLeft / 5) * 100))}%` }} />
              </div>
            ) : locked ? (
              <span className="dense-status">{t.locked}</span>
            ) : null}
          </div>
          <p className="mt-3 whitespace-pre-wrap leading-7">{q.prompt}</p>
          {q.codeSnippet && <pre className="mt-3 overflow-x-auto bg-slate-950 p-4 text-sm text-white">{q.codeSnippet}</pre>}

          {q.options.length > 0 ? (
            <div className="mt-4 grid gap-2">
              {q.options.map((option) => (
                <label key={option.id} className="flex gap-3 border border-slate-200 bg-slate-50 p-3">
                  <input
                    type="radio"
                    name={q.id}
                    value={option.content}
                    disabled={!isActive || Boolean(result)}
                    onChange={() => {
                      setAnswers({ ...answers, [q.id]: option.content });
                      if (strictChoiceTimer) void submit(q.id, option.content);
                    }}
                  />
                  <span>{option.label}. {option.content}</span>
                </label>
              ))}
            </div>
          ) : (
            <input
              value={answers[q.id] || ""}
              disabled={!isActive || Boolean(result)}
              onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}
              placeholder={t.placeholder}
              className="mt-4 w-full border border-slate-200 px-4 py-3 outline-none focus:border-[color:var(--accent)] disabled:opacity-60"
            />
          )}

          <div className="mt-4 flex flex-wrap gap-2">
            <button disabled={saving || !isActive || Boolean(result) || (strictChoiceTimer && q.options.length > 0)} onClick={() => submit(q.id)} className="border border-[color:var(--accent)] bg-[color:var(--accent)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">{t.submit}</button>
            <button onClick={() => saveWrong(q.id)} className="border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 hover:border-slate-500">{t.saveWrong}</button>
          </div>

          {message[q.id] && <p className="mt-3 text-sm text-[color:var(--accent-link)]">{message[q.id]}</p>}
          {result && (
            <div className={`mt-4 border p-4 text-sm ${result.correct ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-red-200 bg-red-50 text-red-800"}`}>
              <p className="font-semibold">{result.correct ? t.correctResult : q.id.startsWith("fallback-") ? t.incorrectLocal : t.incorrectSaved}</p>
              <p className="mt-2">{t.correctAnswer} {result.answer}</p>
              <p className="mt-2">{result.explanation}</p>
            </div>
          )}
        </article>
        );
      })}
    </div>
  );
}
