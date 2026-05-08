"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useMemo, useRef, useState, useEffect } from "react";
import FlagLanguageToggle from "@/components/layout/FlagLanguageToggle";
import AICoachPanel from "@/components/learning/AICoachPanel";
import LearningFullscreenButton from "@/components/learning/LearningFullscreenButton";
import ProgrammingQuestionBank from "@/components/learning/ProgrammingQuestionBank";
import { localizedHref, type InterfaceLanguage } from "@/lib/language";
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

import {
  checkQuestion,
  definitionCopy,
  habitForInterface,
  interfaceLanguageLabel,
  isTypingTarget,
  lineageCopy,
  lineageForLanguage,
  localizedLineageFamily,
  localizedLineageUseCase,
  methodBody,
  methodTitle,
  normalize,
  optionLabel,
  pendingResultLabel,
  programmingCopy,
  programmingLanguageTitle,
  programmingRailSearchCopy,
  questionExplanation,
  questionHints,
  questionPrompt,
  questionTitle,
  resultClassName,
  roleForInterface,
  runnerText,
  runtimeLabel,
  storageKey,
  trackSegments,
  tutorialFocusText,
  tutorialText,
  typeLabel,
  uniqueLanguageSlugs,
  zeroBaseSteps,
  type KeyPreset,
  type ResultState,
} from "@/lib/programming-trainer-client";

export default function ProgrammingTrainer({
  initialLanguageSlug = "javascript",
  initialSiteLanguage = "en",
}: {
  initialLanguageSlug?: ProgrammingLanguageSlug;
  initialSiteLanguage?: InterfaceLanguage;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [language, setLanguage] = useState<InterfaceLanguage>(initialSiteLanguage);
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
  const [languageFilter, setLanguageFilter] = useState("");

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
  const activeRole = useMemo(() => roleForInterface(activeLanguage, language), [activeLanguage, language]);
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
  const definition = definitionCopy(activeLanguage, activeRole, language);
  const lineage = useMemo(() => lineageForLanguage(activeLanguage), [activeLanguage]);
  const lineageFamily = localizedLineageFamily(lineage.family, language);
  const lineageUseCase = localizedLineageUseCase(lineage.useCase, activeRole, language);
  const lineageUi = lineageCopy[language];
  const zeroSteps = zeroBaseSteps[language] || zeroBaseSteps.en;
  const isRtl = language === "ar";
  const railSearch = programmingRailSearchCopy[language];
  const cleanLanguageFilter = normalize(languageFilter);
  const railLanguages = useMemo(() => {
    if (!cleanLanguageFilter) return programmingLanguages;

    return programmingLanguages.filter((item) => {
      const localizedRole = roleForInterface(item, language);
      const localizedHabit = habitForInterface(item, language);
      const localizedRuntime = runtimeLabel(item.runtime, language);
      const searchable = normalize([
        item.slug,
        item.title,
        item.shortTitle,
        item.role,
        localizedRole,
        item.runtime,
        localizedRuntime,
        item.fileName,
        item.runCommand,
        item.dailyHabit,
        localizedHabit,
        ...item.strengths,
      ].join(" "));

      return searchable.includes(cleanLanguageFilter);
    });
  }, [cleanLanguageFilter, language]);
  const openFirstRailMatch = useCallback(() => {
    if (!cleanLanguageFilter) return;
    const [firstMatch] = railLanguages;
    if (!firstMatch) return;
    router.push(localizedHref(`/programming/${firstMatch.slug}`, language));
  }, [cleanLanguageFilter, language, railLanguages, router]);
  const coachContext = useMemo(() => ({
    language: activeLanguage.title,
    languageRole: activeRole,
    interfaceLanguage: interfaceLanguageLabel(language),
    questionNumber: question.index,
    questionType: question.type,
    prompt: questionPrompt(question, language, activeLanguage.title),
    codeSnippet: question.codeSnippet,
    studentAnswer: answer,
    result: result ? resultMessage : pendingResultLabel(language),
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

  const jumpToQuestion = useCallback((nextIndex: number) => {
    goToQuestion(nextIndex);
    window.setTimeout(() => {
      document.getElementById("trainer")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 0);
  }, [goToQuestion]);

  const getBankQuestionTitle = useCallback((item: ProgrammingQuestion) => (
    questionTitle(item, language, activeLanguage.title)
  ), [activeLanguage.title, language]);

  const getBankQuestionPrompt = useCallback((item: ProgrammingQuestion) => (
    questionPrompt(item, language, activeLanguage.title)
  ), [activeLanguage.title, language]);

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
    <main className="apple-page programming-page" dir={isRtl ? "rtl" : "ltr"} data-interface-language={language}>
      <div className="programming-workbench">
        <aside className="programming-rail dense-panel">
          <Link href={localizedHref("/", language)} className="tool-brand">
            <span>JM</span>
            <strong>{copy.brand}</strong>
          </Link>

          <div className="programming-rail-section">
            <p className="eyebrow">{copy.languages}</p>
            <input
              className="tool-input mt-2"
              type="search"
              value={languageFilter}
              onChange={(event) => setLanguageFilter(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  openFirstRailMatch();
                }

                if (event.key === "Escape" && languageFilter) {
                  event.preventDefault();
                  setLanguageFilter("");
                }
              }}
              placeholder={railSearch.placeholder}
              aria-label={railSearch.label}
              title={railSearch.shortcut}
              dir="ltr"
            />
            <div className="mt-2 flex items-center justify-between gap-2">
              <span className="dense-status">{railSearch.count(railLanguages.length, programmingLanguages.length)}</span>
              {languageFilter ? (
                <button type="button" className="dense-action" onClick={() => setLanguageFilter("")}>
                  {railSearch.clear}
                </button>
              ) : null}
            </div>
            <nav className="programming-language-list" aria-label={railSearch.label}>
              {railLanguages.map((item) => (
                <Link
                  key={item.slug}
                  href={localizedHref(`/programming/${item.slug}`, language)}
                  className={item.slug === activeLanguage.slug ? "programming-language active" : "programming-language"}
                >
                  <span>{item.shortTitle}</span>
                  <div className="programming-language-label">
                    <strong>{item.title}</strong>
                    <small>{roleForInterface(item, language)}</small>
                  </div>
                </Link>
              ))}
            </nav>
            {railLanguages.length === 0 ? (
              <p className="programming-muted mt-2">{railSearch.noMatch}</p>
            ) : null}
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

          <section className="dense-panel programming-definition" aria-label={definition.aria}>
            <div className="programming-definition-head">
              <div>
                <p className="eyebrow">{definition.eyebrow}</p>
                <h2>{definition.title}</h2>
                <p>{definition.body}</p>
              </div>
              <div className="programming-definition-runtime">
                <strong>{definition.runtimeTitle}</strong>
                <span>{definition.fileLabel} <code>{activeLanguage.fileName}</code></span>
                <span>{definition.runLabel} <code>{activeLanguage.runCommand}</code></span>
                <span>{definition.habitLabel} {definition.habit}</span>
              </div>
            </div>
            <div className="programming-definition-grid">
              {definition.cards.map(([title, body]) => (
                <article key={title}>
                  <strong>{title}</strong>
                  <p>{body}</p>
                </article>
              ))}
            </div>
            <div className="programming-definition-starter">
              <div>
                <p className="eyebrow">{definition.starterTitle}</p>
                <h3>{tutorialText(definition.starter.title, language)}</h3>
                <span>{tutorialFocusText(definition.starter.focus, language)}</span>
              </div>
              <pre>{definition.starter.sampleCode}</pre>
              <code>{definition.outputLabel} {definition.starter.sampleOutput}</code>
            </div>
          </section>

          <section className="dense-panel programming-lineage" aria-label={lineageUi.title(activeLanguage.title)}>
            <div className="programming-lineage-head">
              <div>
                <p className="eyebrow">{lineageUi.eyebrow}</p>
                <h2>{lineageUi.title(activeLanguage.title)}</h2>
              </div>
              <p>{lineageUi.body(activeLanguage.title)}</p>
            </div>

            <div className="programming-lineage-map">
              <article>
                <span>{lineageUi.roots}</span>
                <div>
                  {lineage.roots.map((root) => <em key={root}>{root}</em>)}
                </div>
              </article>
              <article className="current">
                <span>{lineageUi.current}</span>
                <strong>{activeLanguage.title}</strong>
                <small>{lineageFamily}</small>
              </article>
              <article>
                <span>{lineageUi.relatives}</span>
                <div>
                  {uniqueLanguageSlugs(lineage.relatives, activeLanguage.slug, 5).map((slug) => (
                    <Link key={slug} href={localizedHref(`/programming/${slug}`, language)}>
                      {programmingLanguageTitle(slug)}
                    </Link>
                  ))}
                </div>
              </article>
            </div>

            <div className="programming-lineage-cards">
              <article>
                <span>{lineageUi.family}</span>
                <strong>{lineageFamily}</strong>
              </article>
              <article>
                <span>{lineageUi.useCase}</span>
                <p>{lineageUseCase}</p>
              </article>
              <article>
                <span>{lineageUi.next}</span>
                <div>
                  {uniqueLanguageSlugs(lineage.next, activeLanguage.slug, 4).map((slug) => (
                    <Link key={slug} href={localizedHref(`/programming/${slug}`, language)}>
                      {programmingLanguageTitle(slug)}
                    </Link>
                  ))}
                </div>
              </article>
            </div>
          </section>

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
              {zeroSteps.map((step, index) => (
                <span key={step}>
                  <strong>{index + 1}</strong>
                  {step}
                </span>
              ))}
            </div>
          </section>

          <ProgrammingQuestionBank
            language={language}
            activeLanguage={activeLanguage}
            questionIndex={questionIndex}
            questionShort={copy.questionShort}
            typeLabels={typeLabel[language]}
            getQuestionTitle={getBankQuestionTitle}
            getQuestionPrompt={getBankQuestionPrompt}
            onJump={jumpToQuestion}
          />

          <section id="trainer" className="programming-board-grid">
            <div className="dense-panel programming-question-pane">
              <div className="programming-question-head">
                <div>
                  <p className="eyebrow">{copy.tracks[activeTrack.id].label}</p>
                  <h2>{questionTitle(question, language, activeLanguage.title)}</h2>
                  <div className="programming-meta-line">
                    <span>{copy.questionShort} {questionIndex}</span>
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
                        {optionLabel(option, language)}
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
                {showAnswer && <p className="programming-muted">{questionExplanation(question, language, activeLanguage.title)}</p>}
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
                <span>{runtimeLabel(activeLanguage.runtime, language)}</span>
                <code>{activeLanguage.runCommand}</code>
              </div>
            </div>
            <div className="programming-method-grid">
              {learningMethodStack.slice(0, 3).map((method) => (
                <article key={method.title} className="programming-method">
                  <strong>{methodTitle(method.title, language)}</strong>
                  <span>{methodBody(method.title, method.body, language)}</span>
                </article>
              ))}
            </div>
            <div className="programming-tutorial-grid">
              {activeLanguage.tutorialSections.map((section) => (
                <article key={section.title} className="programming-tutorial">
                  <p className="eyebrow">{tutorialFocusText(section.focus, language)}</p>
                  <h3>{tutorialText(section.title, language)}</h3>
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
                      <li key={rule}>{tutorialText(rule, language)}</li>
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
