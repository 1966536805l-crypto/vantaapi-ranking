"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useMemo, useRef, useState, useEffect } from "react";
import FlagLanguageToggle from "@/components/layout/FlagLanguageToggle";
import AICoachPanel from "@/components/learning/AICoachPanel";
import LearningFullscreenButton from "@/components/learning/LearningFullscreenButton";
import { localizedHref, type SiteLanguage } from "@/lib/language";
import { recordLocalActivity } from "@/lib/local-progress";
import {
  buildProgrammingQuestion,
  getProgrammingLanguage,
  learningMethodStack,
  programmingBankPlan,
  programmingLanguages,
  type ProgrammingLanguageSlug,
  type ProgrammingQuestion,
} from "@/lib/programming-content";

type ResultState = {
  correct: boolean;
  message: string;
};

type KeyPreset = "typing" | "vim";

type TrackSegment = {
  id: "choice" | "fill" | "practical";
  label: string;
  shortLabel: string;
  start: number;
  end: number;
  count: number;
};

const typeLabel = {
  en: {
    MULTIPLE_CHOICE: "Choice",
    FILL_BLANK: "Fill blank",
    PRACTICAL: "Practical",
  },
  zh: {
    MULTIPLE_CHOICE: "选择",
    FILL_BLANK: "填空",
    PRACTICAL: "实操",
  },
} as const;

const zeroBaseSteps = {
  en: [
    "Read one rule",
    "Predict output",
    "Type from memory",
    "Run checklist",
    "Repeat with one change",
  ],
  zh: [
    "看一条规则",
    "先猜输出",
    "凭记忆敲",
    "跑检查器",
    "改一处重做",
  ],
} as const;

const programmingCopy = {
  en: {
    brand: "Code Practice",
    languages: "Languages",
    queue: "Queue",
    expanding: "Expanding",
    zeroBase: "Zero base path",
    session: "Session",
    correct: "Correct",
    answered: "answered",
    workspace: "Workspace",
    nextUnsolved: "Next unsolved",
    reset: "Reset",
    resetConfirm: (language: string) => `Reset ${language} local practice state?`,
    statusSolved: "solved",
    statusReview: "review",
    statusDraft: "draft",
    statusNew: "new",
    question: "Question",
    questionPalette: "Question palette",
    prev: "Prev",
    next: "Next",
    submit: "Submit",
    run: "Run",
    hint: "Hint",
    answer: "Answer",
    correctMessage: "Correct",
    notYetMessage: "Not yet. Check a hint or compare with the answer.",
    wrongNote: "Hints stay out of the way until you try once.",
    codePlaceholder: "Type your code here",
    fillPlaceholder: "Type the missing answer",
    inspector: "Inspector",
    feedback: "Feedback",
    typingFirst: "Typing first",
    vimReview: "Vim review",
    runOutput: "Run output",
    runEmpty: "Run checks the sample output or required parts.",
    hints: "Hints",
    hintEmpty: "Try once first. Then open a hint if you need one.",
    answerEmpty: "Use Answer when you want to compare your work with a clean version.",
    shortcuts: "Shortcuts",
    shortcutItems: ["Ctrl Enter submit", "Alt R run", "Alt H hint", "Alt A answer", "Alt arrows move", "1 2 3 4 choices"],
    vimShortcut: "J K move",
    coachTitle: "Programming companion",
    coachSubtitle: "One hint at a time. It reads the current question answer and language context.",
    coachPlaceholder: "Ask for a hint bug check explanation or next drill",
    coachPrompts: ["Give one hint", "Explain the concept", "Check my answer", "Make a tiny drill"],
    reference: "Reference",
    patternsFor: (fileName: string) => `Patterns for ${fileName}`,
    showOutput: "Show output",
    hideOutput: "Hide output",
    output: "Output",
    tracks: {
      choice: { label: "Multiple choice", shortLabel: "Choice" },
      fill: { label: "Fill blank", shortLabel: "Fill" },
      practical: { label: "Practical", shortLabel: "Build" },
    },
    roleFallback: (role: string) => role,
  },
  zh: {
    brand: "编程刷题",
    languages: "语言",
    queue: "题型队列",
    expanding: "持续扩充",
    zeroBase: "零基础路径",
    session: "本轮进度",
    correct: "正确",
    answered: "已做",
    workspace: "训练台",
    nextUnsolved: "下一道未做",
    reset: "重置",
    resetConfirm: (language: string) => `重置 ${language} 的本地练习记录吗`,
    statusSolved: "已掌握",
    statusReview: "待复盘",
    statusDraft: "已作答",
    statusNew: "新题",
    question: "题号",
    questionPalette: "题号面板",
    prev: "上一题",
    next: "下一题",
    submit: "提交",
    run: "运行",
    hint: "提示",
    answer: "看答案",
    correctMessage: "答对了",
    notYetMessage: "还差一点 先看一个提示 或直接对照答案",
    wrongNote: "提示会等你先尝试一次后再介入",
    codePlaceholder: "在这里写代码",
    fillPlaceholder: "填入缺失答案",
    inspector: "检查器",
    feedback: "反馈",
    typingFirst: "打字优先",
    vimReview: "Vim 复盘",
    runOutput: "运行反馈",
    runEmpty: "运行会检查样例输出或实操关键词",
    hints: "提示",
    hintEmpty: "先做一次 再一点点打开提示",
    answerEmpty: "想对照标准写法时再点看答案",
    shortcuts: "快捷键",
    shortcutItems: ["Ctrl Enter 提交", "Alt R 运行", "Alt H 提示", "Alt A 答案", "Alt 方向键切题", "1 2 3 4 选项"],
    vimShortcut: "J K 切题",
    coachTitle: "编程陪练",
    coachSubtitle: "只给当前题相关的提示 先帮你想清楚 不直接灌答案",
    coachPlaceholder: "让它给提示 查 bug 讲概念 或出一道小练习",
    coachPrompts: ["给一个提示", "讲清这个概念", "检查我的答案", "出一道小练习"],
    reference: "参考",
    patternsFor: (fileName: string) => `${fileName} 常用模式`,
    showOutput: "显示输出",
    hideOutput: "收起输出",
    output: "输出",
    tracks: {
      choice: { label: "选择题", shortLabel: "选择" },
      fill: { label: "填空题", shortLabel: "填空" },
      practical: { label: "实操题", shortLabel: "实操" },
    },
    roleFallback: (role: string) => role,
  },
} as const;

const languageRoleZh: Partial<Record<ProgrammingLanguageSlug, string>> = {
  javascript: "浏览器应用 自动化 和 API 胶水层",
  typescript: "适合产品级规模的类型化 JavaScript",
  python: "自动化 数据脚本 和后端 API",
  cpp: "高性能 系统 算法 和竞赛",
  java: "后端 Android 企业开发 和类型化面向对象",
  go: "云服务 命令行 并发 和 API",
  rust: "安全系统 高性能 和可靠工具链",
  sql: "数据查询 产品分析 和数据库",
  "html-css": "页面结构 样式 和响应式界面",
  bash: "终端自动化 部署 和文件流程",
  csharp: "dotnet 后端 桌面 游戏 和企业应用",
  php: "Web 后端 CMS 和服务端渲染",
};

const methodZh: Record<string, string> = {
  "Recall from memory": "回忆输出",
  "Trace the code": "手动跟踪",
  "Type it yourself": "亲手敲一遍",
  "Mix topics": "混合练习",
  "Hints after trying": "先做后看提示",
  "Build small things": "做小作品",
};

const methodBodyZh: Record<string, string> = {
  "Recall from memory": "看完一个小点后 合上提示自己写出来",
  "Trace the code": "运行前先逐行写出变量变化",
  "Type it yourself": "少复制 多打字 每次只修一个小错",
  "Mix topics": "语法 数据结构 调试 小项目交替练",
  "Hints after trying": "先独立尝试 再一次只打开一个提示",
  "Build small things": "把每个知识块变成脚本 页面 查询或工具",
};

const trackSegments: TrackSegment[] = [
  {
    id: "choice",
    label: "Multiple choice",
    shortLabel: "Choice",
    start: 1,
    end: programmingBankPlan.multipleChoice,
    count: programmingBankPlan.multipleChoice,
  },
  {
    id: "fill",
    label: "Fill blank",
    shortLabel: "Fill",
    start: programmingBankPlan.multipleChoice + 1,
    end: programmingBankPlan.multipleChoice + programmingBankPlan.fillBlank,
    count: programmingBankPlan.fillBlank,
  },
  {
    id: "practical",
    label: "Practical",
    shortLabel: "Build",
    start: programmingBankPlan.multipleChoice + programmingBankPlan.fillBlank + 1,
    end: programmingBankPlan.perLanguage,
    count: programmingBankPlan.practical,
  },
];

function storageKey(languageSlug: ProgrammingLanguageSlug) {
  return `vantaapi-programming-workbench-${languageSlug}`;
}

function normalize(value: string) {
  return value.trim().replace(/\s+/g, " ").toLowerCase();
}

function isTypingTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  return ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName) || target.isContentEditable;
}

function checkQuestion(question: ProgrammingQuestion, answer: string) {
  const submitted = normalize(answer);
  if (!submitted) return false;

  if (question.type === "PRACTICAL") {
    const raw = answer.toLowerCase();
    return question.requiredKeywords.every((keyword) => raw.includes(keyword.toLowerCase()));
  }

  return submitted === normalize(question.answer);
}

function runnerText(question: ProgrammingQuestion, answer: string, language: SiteLanguage) {
  const sampleLabel = language === "zh" ? "样例" : "Sample";
  const outputLabel = language === "zh" ? "输出" : "Output";

  if (question.type !== "PRACTICAL") {
    return `${sampleLabel}\n${question.codeSnippet}\n\n${outputLabel}\n${question.runOutput}`;
  }

  const raw = answer.trim();
  if (!raw) {
    return `${sampleLabel}\n${question.answer}\n\n${outputLabel}\n${question.runOutput}`;
  }

  const lowered = raw.toLowerCase();
  const found = question.requiredKeywords.filter((keyword) => lowered.includes(keyword.toLowerCase()));
  const missing = question.requiredKeywords.filter((keyword) => !lowered.includes(keyword.toLowerCase()));

  if (language === "zh") {
    return [
      "代码检查",
      `${found.length}/${question.requiredKeywords.length} 个必需部分已出现`,
      found.length ? `已找到 ${found.join(" ")}` : "暂时还没找到关键部分",
      missing.length ? `还缺 ${missing.join(" ")}` : `输出 ${question.runOutput}`,
    ].join("\n");
  }

  return [
    "Code check",
    `${found.length}/${question.requiredKeywords.length} required parts found`,
    found.length ? `Found ${found.join(" ")}` : "Found none yet",
    missing.length ? `Missing ${missing.join(" ")}` : `Output ${question.runOutput}`,
  ].join("\n");
}

function resultClassName(result?: ResultState, hasDraft = false) {
  if (result?.correct) return "solved";
  if (result && !result.correct) return "missed";
  if (hasDraft) return "draft";
  return "";
}

function getConcept(question: ProgrammingQuestion) {
  return question.prompt.match(/matches (.+)\.$/)?.[1] || "current concept";
}

function questionTitle(question: ProgrammingQuestion, language: SiteLanguage, languageTitle: string) {
  if (language === "en") return question.title;
  return `${languageTitle} 第 ${question.index} 题`;
}

function questionPrompt(question: ProgrammingQuestion, language: SiteLanguage, languageTitle: string) {
  if (language === "en") return question.prompt;

  if (question.type === "MULTIPLE_CHOICE") {
    return `${languageTitle} 第 ${question.index} 题 选择和 ${getConcept(question)} 最匹配的说法`;
  }

  if (question.type === "FILL_BLANK") {
    const firstLine = question.prompt.split("\n")[0] || question.prompt;
    return `${firstLine}\n填出这道 ${languageTitle} 题缺失的部分`;
  }

  const firstLine = question.prompt.split("\n")[0] || question.prompt;
  return `${firstLine}\n先自己写一遍 出错后再开提示或对照答案`;
}

function questionHints(question: ProgrammingQuestion, activeRole: string, language: SiteLanguage) {
  if (language === "en") return question.hints;
  return [
    `先看 ${getConcept(question)} 找出缺的那一块`,
    `保持这个练习习惯 ${activeRole}`,
    `大概率需要 ${question.answer.split("\n")[0]} 答案里应该包含 ${question.requiredKeywords.slice(0, 3).join(" ")}`,
  ];
}

export default function ProgrammingTrainer({
  initialLanguageSlug = "javascript",
  initialSiteLanguage = "en",
}: {
  initialLanguageSlug?: ProgrammingLanguageSlug;
  initialSiteLanguage?: SiteLanguage;
}) {
  const pathname = usePathname();
  const [language, setLanguage] = useState<SiteLanguage>(initialSiteLanguage);
  const copy = programmingCopy[language];
  const activeLanguage = useMemo(() => {
    const routeLanguage = programmingLanguages.find((language) => pathname?.endsWith(`/programming/${language.slug}`));
    return getProgrammingLanguage(routeLanguage?.slug || initialLanguageSlug);
  }, [initialLanguageSlug, pathname]);

  const [questionIndex, setQuestionIndex] = useState(1);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const answersRef = useRef<Record<string, string>>({});
  const [results, setResults] = useState<Record<string, ResultState>>({});
  const [hintLevels, setHintLevels] = useState<Record<string, number>>({});
  const [answerReveals, setAnswerReveals] = useState<Record<string, boolean>>({});
  const [runnerOutputs, setRunnerOutputs] = useState<Record<string, string>>({});
  const [sampleRuns, setSampleRuns] = useState<Record<string, boolean>>({});
  const [keyPreset, setKeyPreset] = useState<KeyPreset>("typing");
  const [hydratedLanguage, setHydratedLanguage] = useState<ProgrammingLanguageSlug | null>(null);

  const question = useMemo(
    () => buildProgrammingQuestion(activeLanguage.slug, questionIndex),
    [activeLanguage.slug, questionIndex],
  );
  const answer = answers[question.id] || "";
  const result = results[question.id];
  const resultMessage = result ? (result.correct ? copy.correctMessage : copy.notYetMessage) : "";
  const hintLevel = hintLevels[question.id] || 0;
  const showAnswer = Boolean(answerReveals[question.id]);
  const runnerOutput = runnerOutputs[question.id];
  const activeTrack = trackSegments.find((track) => questionIndex >= track.start && questionIndex <= track.end) || trackSegments[0];
  const activeRole = language === "zh" ? languageRoleZh[activeLanguage.slug] ?? activeLanguage.role : activeLanguage.role;
  const activeHints = questionHints(question, activeRole, language);
  const answeredCount = Object.keys(results).filter((id) => id.startsWith(activeLanguage.slug)).length;
  const correctCount = Object.entries(results).filter(([id, state]) => id.startsWith(activeLanguage.slug) && state.correct).length;
  const correctRate = answeredCount ? Math.round((correctCount / answeredCount) * 100) : 0;
  const progressPercent = Math.round((answeredCount / programmingBankPlan.perLanguage) * 100);
  const paletteStart = Math.max(activeTrack.start, Math.min(activeTrack.end - 11, questionIndex - 5));
  const paletteNumbers = Array.from({ length: Math.min(12, activeTrack.end - activeTrack.start + 1) }, (_, index) => paletteStart + index);
  const practicalKeywordState = question.requiredKeywords.map((keyword) => ({
    keyword,
    found: answer.toLowerCase().includes(keyword.toLowerCase()),
  }));
  const coachContext = useMemo(() => ({
    language: activeLanguage.title,
    languageRole: activeRole,
    interfaceLanguage: language === "zh" ? "Chinese" : "English",
    questionNumber: question.index,
    questionType: question.type,
    prompt: questionPrompt(question, language, activeLanguage.title),
    codeSnippet: question.codeSnippet,
    studentAnswer: answer,
    result: result ? resultMessage : language === "zh" ? "未提交" : "not submitted",
    hintsOpened: hintLevel,
  }), [activeLanguage.title, activeRole, answer, hintLevel, language, question, result, resultMessage]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      try {
        const raw = window.localStorage.getItem(storageKey(activeLanguage.slug));
        if (!raw) {
          answersRef.current = {};
          setAnswers({});
          setResults({});
          setHintLevels({});
          setAnswerReveals({});
          setRunnerOutputs({});
          setQuestionIndex(1);
          setHydratedLanguage(activeLanguage.slug);
          return;
        }

        const stored = JSON.parse(raw) as {
          questionIndex?: number;
          answers?: Record<string, string>;
          results?: Record<string, ResultState>;
          hintLevels?: Record<string, number>;
          answerReveals?: Record<string, boolean>;
        };
        const nextAnswers = stored.answers || {};
        answersRef.current = nextAnswers;
        setAnswers(nextAnswers);
        setResults(stored.results || {});
        setHintLevels(stored.hintLevels || {});
        setAnswerReveals(stored.answerReveals || {});
        setRunnerOutputs({});
        setQuestionIndex(Math.min(programmingBankPlan.perLanguage, Math.max(1, Math.trunc(stored.questionIndex || 1))));
        setHydratedLanguage(activeLanguage.slug);
      } catch {
        answersRef.current = {};
        setAnswers({});
        setResults({});
        setHintLevels({});
        setAnswerReveals({});
        setRunnerOutputs({});
        setQuestionIndex(1);
        setHydratedLanguage(activeLanguage.slug);
      }
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [activeLanguage.slug]);

  useEffect(() => {
    if (hydratedLanguage !== activeLanguage.slug) return;
    try {
      window.localStorage.setItem(storageKey(activeLanguage.slug), JSON.stringify({
        questionIndex,
        answers,
        results,
        hintLevels,
        answerReveals,
      }));
    } catch {
      // Local persistence is best effort.
    }
  }, [activeLanguage.slug, answerReveals, answers, hintLevels, hydratedLanguage, questionIndex, results]);

  const writeAnswer = useCallback((questionId: string, value: string) => {
    const next = { ...answersRef.current, [questionId]: value };
    answersRef.current = next;
    setAnswers(next);
  }, []);

  const setAnswer = useCallback((value: string) => {
    writeAnswer(question.id, value);
  }, [question.id, writeAnswer]);

  const goToQuestion = useCallback((nextIndex: number) => {
    setQuestionIndex(Math.min(programmingBankPlan.perLanguage, Math.max(1, Math.trunc(nextIndex) || 1)));
  }, []);

  const submit = useCallback(() => {
    const correct = checkQuestion(question, answersRef.current[question.id] || "");
    recordLocalActivity({
      id: `programming:${activeLanguage.slug}:${question.id}`,
      title: `${activeLanguage.title} Q${question.index}`,
      href: localizedHref(`/programming/${activeLanguage.slug}`, language),
      kind: "programming",
      completed: true,
      correct,
    });
    setResults((current) => ({
      ...current,
      [question.id]: {
        correct,
        message: correct ? copy.correctMessage : copy.notYetMessage,
      },
    }));
    if (!correct) {
      setHintLevels((current) => ({ ...current, [question.id]: Math.max(current[question.id] || 0, 1) }));
    }
  }, [activeLanguage.slug, activeLanguage.title, copy.correctMessage, copy.notYetMessage, language, question]);

  const runBuiltIn = useCallback(() => {
    setRunnerOutputs((current) => ({
      ...current,
      [question.id]: runnerText(question, answersRef.current[question.id] || "", language),
    }));
  }, [language, question]);

  const revealHint = useCallback(() => {
    setHintLevels((current) => ({
      ...current,
      [question.id]: Math.min(question.hints.length, (current[question.id] || 0) + 1),
    }));
  }, [question]);

  const revealAnswer = useCallback(() => {
    setAnswerReveals((current) => ({ ...current, [question.id]: true }));
  }, [question.id]);

  const selectChoice = useCallback((option: string) => {
    writeAnswer(question.id, option);
  }, [question.id, writeAnswer]);

  const goToNextUnanswered = useCallback(() => {
    for (let offset = 1; offset <= programmingBankPlan.perLanguage; offset += 1) {
      const candidate = ((questionIndex + offset - 1) % programmingBankPlan.perLanguage) + 1;
      const candidateId = `${activeLanguage.slug}-${candidate}`;
      if (!results[candidateId]) {
        goToQuestion(candidate);
        return;
      }
    }
  }, [activeLanguage.slug, goToQuestion, questionIndex, results]);

  const resetSession = useCallback(() => {
    if (!window.confirm(copy.resetConfirm(activeLanguage.title))) return;
    answersRef.current = {};
    setAnswers({});
    setResults({});
    setHintLevels({});
    setAnswerReveals({});
    setRunnerOutputs({});
    setQuestionIndex(1);
    window.localStorage.removeItem(storageKey(activeLanguage.slug));
  }, [activeLanguage.slug, activeLanguage.title, copy]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const typing = isTypingTarget(event.target);
      const key = event.key.toLowerCase();

      if ((event.metaKey || event.ctrlKey) && key === "enter") {
        event.preventDefault();
        submit();
        return;
      }

      if (event.altKey && key === "r") {
        event.preventDefault();
        runBuiltIn();
        return;
      }

      if (event.altKey && key === "h") {
        event.preventDefault();
        revealHint();
        return;
      }

      if (event.altKey && key === "a") {
        event.preventDefault();
        revealAnswer();
        return;
      }

      if (event.altKey && event.key === "ArrowRight") {
        event.preventDefault();
        goToQuestion(questionIndex + 1);
        return;
      }

      if (event.altKey && event.key === "ArrowLeft") {
        event.preventDefault();
        goToQuestion(questionIndex - 1);
        return;
      }

      if (!typing && question.options.length > 0 && /^[1-4]$/.test(key)) {
        const selected = question.options[Number(key) - 1];
        if (selected) selectChoice(selected);
        return;
      }

      if (!typing && keyPreset === "vim" && key === "j") goToQuestion(questionIndex + 1);
      if (!typing && keyPreset === "vim" && key === "k") goToQuestion(questionIndex - 1);
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [goToQuestion, keyPreset, question.options, questionIndex, revealAnswer, revealHint, runBuiltIn, selectChoice, submit]);

  return (
    <main className="apple-page programming-page">
      <div className="programming-workbench">
        <aside className="programming-rail dense-panel">
          <Link href={localizedHref("/", language)} className="tool-brand">
            <span>JM</span>
            <strong>{copy.brand}</strong>
          </Link>

          <div className="programming-rail-section">
            <p className="eyebrow">{copy.languages}</p>
            <nav className="programming-language-list">
              {programmingLanguages.map((item) => (
                <Link
                  key={item.slug}
                  href={localizedHref(`/programming/${item.slug}`, language)}
                  className={item.slug === activeLanguage.slug ? "programming-language active" : "programming-language"}
                >
                  <span>{item.shortTitle}</span>
                  <strong>{item.title}</strong>
                </Link>
              ))}
            </nav>
          </div>

          <div className="programming-rail-section">
            <p className="eyebrow">{copy.queue}</p>
            <div className="programming-track-list">
              {trackSegments.map((track) => (
                <button
                  key={track.id}
                  type="button"
                  className={track.id === activeTrack.id ? "programming-track active" : "programming-track"}
                  onClick={() => goToQuestion(track.start)}
                >
                  <span>{copy.tracks[track.id].shortLabel}</span>
                  <strong>{copy.expanding}</strong>
                </button>
              ))}
            </div>
          </div>

          <div className="programming-rail-section programming-rail-stats">
            <p className="eyebrow">{copy.session}</p>
            <strong>{correctRate}%</strong>
            <span>{correctCount} {copy.correct} · {answeredCount} {copy.answered}</span>
            <div className="programming-progress-bar"><span style={{ width: `${progressPercent}%` }} /></div>
          </div>
        </aside>

        <section className="programming-main">
          <header className="dense-panel programming-topbar">
            <div>
              <p className="eyebrow">{copy.workspace}</p>
              <h1>{activeLanguage.title}</h1>
              <p>{activeRole}</p>
            </div>
            <div className="programming-topbar-actions">
              <LearningFullscreenButton language={language} />
              <button type="button" className="dense-action" onClick={goToNextUnanswered}>{copy.nextUnsolved}</button>
              <button type="button" className="dense-action" onClick={resetSession}>{copy.reset}</button>
              <FlagLanguageToggle initialLanguage={language} onChange={setLanguage} />
            </div>
          </header>

          <section className="dense-panel programming-track-summary" aria-label={copy.queue}>
            {trackSegments.map((track) => (
              <button
                key={track.id}
                type="button"
                className={track.id === activeTrack.id ? "active" : ""}
                onClick={() => goToQuestion(track.start)}
              >
                <span>{copy.tracks[track.id].label}</span>
                <strong>{copy.expanding}</strong>
                <small>{copy.zeroBase}</small>
              </button>
            ))}
          </section>

          <section className="dense-panel programming-zero-path" aria-label={copy.zeroBase}>
            <p className="eyebrow">{copy.zeroBase}</p>
            <div>
              {zeroBaseSteps[language].map((step, index) => (
                <span key={step}>
                  <strong>{index + 1}</strong>
                  {step}
                </span>
              ))}
            </div>
          </section>

          <section id="trainer" className="programming-board-grid">
            <div className="dense-panel programming-question-pane">
              <div className="programming-question-head">
                <div>
                  <p className="eyebrow">{copy.tracks[activeTrack.id].label}</p>
                  <h2>{questionTitle(question, language, activeLanguage.title)}</h2>
                  <div className="programming-meta-line">
                    <span>Q {questionIndex}</span>
                    <span>{typeLabel[language][question.type]}</span>
                    <span>{result ? (result.correct ? copy.statusSolved : copy.statusReview) : answer ? copy.statusDraft : copy.statusNew}</span>
                  </div>
                </div>
                <div className="programming-question-nav">
                  <button type="button" className="dense-action" onClick={() => goToQuestion(questionIndex - 1)}>{copy.prev}</button>
                  <label>
                    <span>{copy.question}</span>
                    <input
                      value={questionIndex}
                      onChange={(event) => goToQuestion(Number(event.target.value))}
                      inputMode="numeric"
                    />
                  </label>
                  <button type="button" className="dense-action" onClick={() => goToQuestion(questionIndex + 1)}>{copy.next}</button>
                </div>
              </div>

              <div className="programming-palette" aria-label={copy.questionPalette}>
                {paletteNumbers.map((number) => {
                  const id = `${activeLanguage.slug}-${number}`;
                  return (
                    <button
                      key={number}
                      type="button"
                      className={`programming-palette-item ${number === questionIndex ? "current" : ""} ${resultClassName(results[id], Boolean(answers[id]))}`}
                      onClick={() => goToQuestion(number)}
                    >
                      {number}
                    </button>
                  );
                })}
              </div>

              <article className="programming-question">
                <p>{questionPrompt(question, language, activeLanguage.title)}</p>
                <pre>{question.codeSnippet}</pre>
              </article>

              <div className="programming-answer-surface">
                {question.options.length > 0 ? (
                  <div className="programming-options">
                    {question.options.map((option, index) => (
                      <button
                        key={option}
                        type="button"
                        className={answer === option ? "programming-option selected" : "programming-option"}
                        onClick={() => selectChoice(option)}
                      >
                        <span>{index + 1}</span>
                        {option}
                      </button>
                    ))}
                  </div>
                ) : (
                  <textarea
                    className="tool-textarea tool-code-input programming-code-editor"
                    value={answer}
                    onChange={(event) => setAnswer(event.target.value)}
                    spellCheck={false}
                    placeholder={question.type === "PRACTICAL" ? copy.codePlaceholder : copy.fillPlaceholder}
                  />
                )}
              </div>

              <div className="programming-command-bar">
                <button className="dense-action-primary" type="button" onClick={submit}>{copy.submit}</button>
                <button className="dense-action" type="button" onClick={runBuiltIn}>{copy.run}</button>
                <button className="dense-action" type="button" onClick={revealHint} disabled={!result || result.correct}>{copy.hint}</button>
                <button className="dense-action" type="button" onClick={revealAnswer}>{copy.answer}</button>
                <button className="dense-action" type="button" onClick={goToNextUnanswered}>{copy.nextUnsolved}</button>
              </div>

              {result && (
                <div className={result.correct ? "programming-result correct" : "programming-result wrong"}>
                  <strong>{resultMessage}</strong>
                  {!result.correct && <span>{copy.wrongNote}</span>}
                </div>
              )}
            </div>

            <aside className="dense-panel programming-inspector">
              <div className="programming-inspector-head">
                <div>
                  <p className="eyebrow">{copy.inspector}</p>
                  <h2>{copy.feedback}</h2>
                </div>
                <select className="tool-input" value={keyPreset} onChange={(event) => setKeyPreset(event.target.value as KeyPreset)}>
                  <option value="typing">{copy.typingFirst}</option>
                  <option value="vim">{copy.vimReview}</option>
                </select>
              </div>

              <section className="programming-inspector-card">
                <h3>{copy.runOutput}</h3>
                {runnerOutput ? <pre>{runnerOutput}</pre> : <p className="programming-muted">{copy.runEmpty}</p>}
                {question.type === "PRACTICAL" && (
                  <div className="programming-keyword-list">
                    {practicalKeywordState.map((item) => (
                      <span key={item.keyword} className={item.found ? "found" : ""}>{item.keyword}</span>
                    ))}
                  </div>
                )}
              </section>

              <section className="programming-inspector-card">
                <h3>{copy.hints}</h3>
                {hintLevel === 0 ? (
                  <p className="programming-muted">{copy.hintEmpty}</p>
                ) : (
                  <ol>
                    {activeHints.slice(0, hintLevel).map((hint) => (
                      <li key={hint}>{hint}</li>
                    ))}
                  </ol>
                )}
              </section>

              <section className="programming-inspector-card">
                <h3>{copy.answer}</h3>
                {showAnswer ? <pre>{question.answer}</pre> : <p className="programming-muted">{copy.answerEmpty}</p>}
                {showAnswer && <p className="programming-muted">{question.explanation}</p>}
              </section>

              <section className="programming-inspector-card">
                <h3>{copy.shortcuts}</h3>
                <div className="programming-shortcuts">
                  {copy.shortcutItems.map((item) => <span key={item}>{item}</span>)}
                  {keyPreset === "vim" && <span>{copy.vimShortcut}</span>}
                </div>
              </section>

              <AICoachPanel
                mode="programming"
                title={copy.coachTitle}
                subtitle={copy.coachSubtitle}
                placeholder={copy.coachPlaceholder}
                quickPrompts={[...copy.coachPrompts]}
                context={coachContext}
                language={language}
              />
            </aside>
          </section>

          <section className="dense-panel programming-reference">
            <div className="programming-reference-head">
              <div>
                <p className="eyebrow">{copy.reference}</p>
                <h2>{copy.patternsFor(activeLanguage.fileName)}</h2>
              </div>
              <div className="programming-runtime-inline">
                <span>{activeLanguage.runtime}</span>
                <code>{activeLanguage.runCommand}</code>
              </div>
            </div>
            <div className="programming-method-grid">
              {learningMethodStack.slice(0, 3).map((method) => (
                <article key={method.title} className="programming-method">
                  <strong>{language === "zh" ? methodZh[method.title] : method.title}</strong>
                  <span>{language === "zh" ? methodBodyZh[method.title] : method.body}</span>
                </article>
              ))}
            </div>
            <div className="programming-tutorial-grid">
              {activeLanguage.tutorialSections.map((section) => (
                <article key={section.title} className="programming-tutorial">
                  <p className="eyebrow">{section.focus}</p>
                  <h3>{section.title}</h3>
                  <pre>{section.sampleCode}</pre>
                  <button
                    type="button"
                    className="dense-action"
                    onClick={() => setSampleRuns((current) => ({ ...current, [section.title]: !current[section.title] }))}
                  >
                    {sampleRuns[section.title] ? copy.hideOutput : copy.showOutput}
                  </button>
                  {sampleRuns[section.title] && <code>{copy.output} {section.sampleOutput}</code>}
                  <ul>
                    {section.rules.map((rule) => (
                      <li key={rule}>{rule}</li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </section>
        </section>
      </div>
    </main>
  );
}
