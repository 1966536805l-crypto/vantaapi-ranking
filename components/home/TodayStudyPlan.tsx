"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { CUSTOM_WORDBOOK_SLUG, readCustomWords } from "@/lib/custom-wordbook";
import { localizedHref, type InterfaceLanguage } from "@/lib/language";
import {
  localProgressSummary,
  readLocalProgress,
  recordLocalActivity,
  type LocalProgressState,
} from "@/lib/local-progress";

type TodayWord = {
  word: string;
  meaningZh: string;
  collocation: string;
};

type TodayPack = {
  slug: string;
  shortTitle: string;
  level: string;
  route: string;
  words: TodayWord[];
};

type ReadingPack = {
  slug: string;
  title?: string;
  zhTitle: string;
  level: string;
  targetArticles: number;
};

type QuestionPack = {
  slug: string;
  title?: string;
  zhTitle: string;
  level: string;
};

type ReviewRecord = {
  status?: "known" | "unknown";
  stage?: number;
  nextAt?: number;
};

type TodayTaskId = "review" | "typing" | "reading" | "questions";

type TodayCompletionDay = {
  tasks: Partial<Record<TodayTaskId, boolean>>;
  completedAt?: number;
  updatedAt: number;
};

type TodayCompletionState = {
  version: 1;
  byDay: Record<string, TodayCompletionDay>;
};

type TodayStudyPlanProps = {
  initialLanguage: InterfaceLanguage;
  packs: TodayPack[];
  readingPacks: ReadingPack[];
  questionPacks: QuestionPack[];
};

type TodayPlanCopy = {
  customWordbook: string;
  newLabel: string;
  dueNew: string;
  dueNow: string;
  minute: string;
  hour: string;
  day: string;
  heroEyebrow: (date: string) => string;
  doneTitle: string;
  activeTitle: string;
  doneBody: string;
  activeBody: string;
  continuePractice: string;
  oneTapStart: string;
  directTyping: string;
  wrongReview: string;
  progress: string;
  metricDone: string;
  metricStreak: string;
  metricAccuracy: string;
  dailyPunch: string;
  punchTitle: string;
  punchBody: string;
  reviewTitle: string;
  learnNewTitle: string;
  reviewDueBody: (count: number) => string;
  newWordsBody: (packTitle: string) => string;
  startWords: string;
  typingTitle: string;
  typingBody: (index: number, correct: number, wrong: number) => string;
  startTyping: string;
  readingFallback: string;
  readingBody: (chapter: number) => string;
  startReading: string;
  questionsFallback: string;
  questionsBody: string;
  startQuestions: string;
  taskDone: string;
  markDone: string;
  streak: string;
  weekDone: string;
  reviewQueue: string;
  handleFirst: string;
  stage: string;
  strip: string[];
  tomorrowPreview: string;
  tomorrowTitle: string;
  tomorrowBody: string;
  tomorrowCta: string;
  words: string;
  tomorrowDueWords: string;
  tomorrowNewWords: (packTitle: string) => string;
  reading: string;
  tomorrowReadingBody: (chapter: number) => string;
  questions: string;
  tomorrowQuestionsBody: string;
};

const todayPlanCopy: Record<InterfaceLanguage, TodayPlanCopy> = {
  en: {
    customWordbook: "My wordbook",
    newLabel: "new",
    dueNew: "new",
    dueNow: "due now",
    minute: "min",
    hour: "h",
    day: "d",
    heroEyebrow: (date) => `Today ${date}`,
    doneTitle: "Today is complete",
    activeTitle: "Today Plan",
    doneBody: "All 4 actions are done. Come back tomorrow for due words first, then new material.",
    activeBody: "Review first, learn new words, type by sound, then answer questions. This page tells you the next step.",
    continuePractice: "Keep practicing",
    oneTapStart: "Start",
    directTyping: "Typing drill",
    wrongReview: "Wrong bank",
    progress: "Today Progress",
    metricDone: "done",
    metricStreak: "streak",
    metricAccuracy: "acc",
    dailyPunch: "Daily Punch",
    punchTitle: "Today checked off",
    punchBody: "Review, new words, typing, reading and questions are closed for today. Stop here or add more practice.",
    reviewTitle: "Review due words first",
    learnNewTitle: "Learn today's new words",
    reviewDueBody: (count) => `${count} words are due for review`,
    newWordsBody: (packTitle) => `${packTitle} gives you 10 new words today`,
    startWords: "Start words",
    typingTitle: "English dictation typing",
    typingBody: (index, correct, wrong) => `Typing item ${index}. Correct ${correct}. Wrong ${wrong}.`,
    startTyping: "Start typing",
    readingFallback: "Original reading",
    readingBody: (chapter) => `Chapter ${chapter}. Read the main idea first, then mark logic words.`,
    startReading: "Start reading",
    questionsFallback: "Original question bank",
    questionsBody: "Do one page of choice and fill questions. Answer first, then read the explanation.",
    startQuestions: "Start questions",
    taskDone: "Done",
    markDone: "Mark done",
    streak: "Streak",
    weekDone: "done",
    reviewQueue: "Review Queue",
    handleFirst: "Handle these first",
    stage: "stage",
    strip: ["Review first", "Typing must be correct", "Read for the main idea", "Answer before explanation", "4 actions finish today"],
    tomorrowPreview: "Tomorrow Preview",
    tomorrowTitle: "What comes first tomorrow",
    tomorrowBody: "Tomorrow preview only uses local review records and original site content. No login needed.",
    tomorrowCta: "Start here tomorrow",
    words: "Words",
    tomorrowDueWords: "Words due tomorrow",
    tomorrowNewWords: (packTitle) => `${packTitle} new words`,
    reading: "Reading",
    tomorrowReadingBody: (chapter) => `Chapter ${chapter}. Main idea, logic words, output sentence.`,
    questions: "Questions",
    tomorrowQuestionsBody: "Continue one page of choice and fill questions. Answer first, then read the explanation.",
  },
  zh: {
    customWordbook: "我的词书",
    newLabel: "新词",
    dueNew: "新词",
    dueNow: "现在到期",
    minute: "分钟",
    hour: "小时",
    day: "天",
    heroEyebrow: (date) => `今日 ${date}`,
    doneTitle: "今日已完成",
    activeTitle: "今日学习",
    doneBody: "今天 4 个动作已经完成。明天回来先复习到期词，再继续新内容。",
    activeBody: "先复习，再新学，再打字，最后刷题。每天打开这一页就知道下一步做什么。",
    continuePractice: "继续加练",
    oneTapStart: "一键开始",
    directTyping: "直接听写",
    wrongReview: "错题复习",
    progress: "今日进度",
    metricDone: "完成",
    metricStreak: "连续",
    metricAccuracy: "准确",
    dailyPunch: "今日打卡",
    punchTitle: "今日已打卡完成",
    punchBody: "复习、新学、听写、阅读和刷题已经闭环。今天可以收手，也可以继续加练。",
    reviewTitle: "先复习到期单词",
    learnNewTitle: "先学今日新词",
    reviewDueBody: (count) => `${count} 个单词已经到复习时间`,
    newWordsBody: (packTitle) => `${packTitle} 今日 10 个新词`,
    startWords: "开始背词",
    typingTitle: "英文听写打字",
    typingBody: (index, correct, wrong) => `当前打字进度 ${index}，正确 ${correct}，错误 ${wrong}`,
    startTyping: "开始听写",
    readingFallback: "原创阅读",
    readingBody: (chapter) => `今日第 ${chapter} 章，先读主旨，再圈逻辑词`,
    startReading: "开始阅读",
    questionsFallback: "原创题库",
    questionsBody: "做一页选择填空，先答再看解析",
    startQuestions: "开始刷题",
    taskDone: "已完成",
    markDone: "标记完成",
    streak: "连续打卡",
    weekDone: "完成",
    reviewQueue: "复习队列",
    handleFirst: "今天先处理这些",
    stage: "阶段",
    strip: ["复习优先", "听写必须打对", "阅读抓主旨", "先答题再看解析", "4 个动作完成今天"],
    tomorrowPreview: "明日预告",
    tomorrowTitle: "明天回来会先做这些",
    tomorrowBody: "明日预告只来自本机复习记录和站内原创内容，不需要登录。",
    tomorrowCta: "明天继续从这里开始",
    words: "单词",
    tomorrowDueWords: "明日到期词",
    tomorrowNewWords: (packTitle) => `${packTitle} 新词`,
    reading: "阅读",
    tomorrowReadingBody: (chapter) => `第 ${chapter} 章，主旨、逻辑词、输出句`,
    questions: "题目",
    tomorrowQuestionsBody: "继续做一页选择填空，先答再看解析",
  },
  ja: {
    customWordbook: "自分の単語帳",
    newLabel: "新規",
    dueNew: "新規",
    dueNow: "今すぐ復習",
    minute: "分",
    hour: "時間",
    day: "日",
    heroEyebrow: (date) => `今日 ${date}`,
    doneTitle: "今日の学習は完了",
    activeTitle: "今日の学習",
    doneBody: "4つの行動が完了しました。明日は期限切れの単語から始め、そのあと新しい内容へ進みます。",
    activeBody: "復習、新語、音声タイピング、問題演習の順で進めます。このページを開けば次の一歩が分かります。",
    continuePractice: "続けて練習",
    oneTapStart: "開始",
    directTyping: "タイピング",
    wrongReview: "ミス復習",
    progress: "今日の進捗",
    metricDone: "完了",
    metricStreak: "連続",
    metricAccuracy: "正確",
    dailyPunch: "今日のチェック",
    punchTitle: "今日のチェック完了",
    punchBody: "復習、新語、タイピング、読解、問題が完了しました。ここで止めても追加練習しても大丈夫です。",
    reviewTitle: "期限切れ単語を先に復習",
    learnNewTitle: "今日の新語を学ぶ",
    reviewDueBody: (count) => `${count}語が復習期限です`,
    newWordsBody: (packTitle) => `${packTitle} から今日の新語10個`,
    startWords: "単語を開始",
    typingTitle: "英語ディクテーション入力",
    typingBody: (index, correct, wrong) => `入力 ${index}。正解 ${correct}。ミス ${wrong}。`,
    startTyping: "入力を開始",
    readingFallback: "オリジナル読解",
    readingBody: (chapter) => `第${chapter}章。まず主旨を読み、次に論理語をマークします。`,
    startReading: "読解を開始",
    questionsFallback: "オリジナル問題集",
    questionsBody: "選択と穴埋めを1ページ解きます。先に答えてから解説を読みます。",
    startQuestions: "問題を開始",
    taskDone: "完了",
    markDone: "完了にする",
    streak: "連続記録",
    weekDone: "完了",
    reviewQueue: "復習キュー",
    handleFirst: "まずこれを処理",
    stage: "段階",
    strip: ["復習優先", "入力は正確に", "主旨を読む", "解説の前に回答", "4つで今日完了"],
    tomorrowPreview: "明日の予告",
    tomorrowTitle: "明日最初にすること",
    tomorrowBody: "明日の予告はローカル復習記録とサイト内オリジナル内容だけを使います。ログイン不要です。",
    tomorrowCta: "明日はここから開始",
    words: "単語",
    tomorrowDueWords: "明日期限の単語",
    tomorrowNewWords: (packTitle) => `${packTitle} 新語`,
    reading: "読解",
    tomorrowReadingBody: (chapter) => `第${chapter}章。主旨、論理語、出力文。`,
    questions: "問題",
    tomorrowQuestionsBody: "選択と穴埋めを1ページ続けます。先に答えてから解説を読みます。",
  },
  ko: {
    customWordbook: "내 단어장",
    newLabel: "새 단어",
    dueNew: "새 단어",
    dueNow: "지금 복습",
    minute: "분",
    hour: "시간",
    day: "일",
    heroEyebrow: (date) => `오늘 ${date}`,
    doneTitle: "오늘 학습 완료",
    activeTitle: "오늘 학습",
    doneBody: "4가지 활동이 끝났습니다. 내일은 먼저 복습 단어를 처리하고 새 내용으로 이어갑니다.",
    activeBody: "복습, 새 단어, 듣고 타이핑, 문제 풀이 순서로 진행합니다. 이 페이지에서 다음 단계를 바로 볼 수 있습니다.",
    continuePractice: "더 연습하기",
    oneTapStart: "시작",
    directTyping: "타이핑",
    wrongReview: "오답 복습",
    progress: "오늘 진도",
    metricDone: "완료",
    metricStreak: "연속",
    metricAccuracy: "정확도",
    dailyPunch: "오늘 체크",
    punchTitle: "오늘 체크 완료",
    punchBody: "복습, 새 학습, 타이핑, 읽기와 문제 풀이가 닫혔습니다. 여기서 멈추거나 더 연습하세요.",
    reviewTitle: "먼저 복습 단어",
    learnNewTitle: "오늘 새 단어",
    reviewDueBody: (count) => `${count}개 단어가 복습 시간입니다`,
    newWordsBody: (packTitle) => `${packTitle} 오늘 새 단어 10개`,
    startWords: "단어 시작",
    typingTitle: "영어 받아쓰기 타이핑",
    typingBody: (index, correct, wrong) => `타이핑 ${index}. 정답 ${correct}. 오답 ${wrong}.`,
    startTyping: "타이핑 시작",
    readingFallback: "오리지널 읽기",
    readingBody: (chapter) => `${chapter}장. 먼저 중심 생각을 읽고 논리어를 표시하세요.`,
    startReading: "읽기 시작",
    questionsFallback: "오리지널 문제집",
    questionsBody: "선택과 빈칸 문제 한 페이지를 풀고, 답한 뒤 해설을 읽습니다.",
    startQuestions: "문제 시작",
    taskDone: "완료",
    markDone: "완료 표시",
    streak: "연속 기록",
    weekDone: "완료",
    reviewQueue: "복습 큐",
    handleFirst: "먼저 처리할 것",
    stage: "단계",
    strip: ["복습 우선", "타이핑은 정확히", "중심 생각 읽기", "해설 전에 답하기", "4가지로 오늘 완료"],
    tomorrowPreview: "내일 미리보기",
    tomorrowTitle: "내일 먼저 할 일",
    tomorrowBody: "내일 미리보기는 로컬 복습 기록과 사이트 오리지널 콘텐츠만 사용합니다. 로그인은 필요 없습니다.",
    tomorrowCta: "내일 여기서 시작",
    words: "단어",
    tomorrowDueWords: "내일 복습 단어",
    tomorrowNewWords: (packTitle) => `${packTitle} 새 단어`,
    reading: "읽기",
    tomorrowReadingBody: (chapter) => `${chapter}장. 중심 생각, 논리어, 출력 문장.`,
    questions: "문제",
    tomorrowQuestionsBody: "선택과 빈칸 한 페이지를 계속 풀고, 먼저 답한 뒤 해설을 봅니다.",
  },
  es: {
    customWordbook: "Mi vocabulario",
    newLabel: "nuevo",
    dueNew: "nuevo",
    dueNow: "toca ahora",
    minute: "min",
    hour: "h",
    day: "d",
    heroEyebrow: (date) => `Hoy ${date}`,
    doneTitle: "Hoy esta completo",
    activeTitle: "Plan de hoy",
    doneBody: "Las 4 acciones ya estan hechas. Vuelve manana con las palabras vencidas primero y luego material nuevo.",
    activeBody: "Repasa, aprende palabras nuevas, escribe por sonido y responde preguntas. Esta pagina te marca el siguiente paso.",
    continuePractice: "Seguir practicando",
    oneTapStart: "Empezar",
    directTyping: "Dictado",
    wrongReview: "Errores",
    progress: "Progreso de hoy",
    metricDone: "hecho",
    metricStreak: "racha",
    metricAccuracy: "prec",
    dailyPunch: "Chequeo diario",
    punchTitle: "Hoy marcado",
    punchBody: "Repaso, palabras nuevas, dictado, lectura y preguntas quedaron cerrados. Puedes parar o practicar mas.",
    reviewTitle: "Repasa palabras vencidas",
    learnNewTitle: "Aprende palabras nuevas",
    reviewDueBody: (count) => `${count} palabras listas para repasar`,
    newWordsBody: (packTitle) => `${packTitle} trae 10 palabras nuevas hoy`,
    startWords: "Empezar palabras",
    typingTitle: "Dictado en ingles",
    typingBody: (index, correct, wrong) => `Item ${index}. Correctas ${correct}. Errores ${wrong}.`,
    startTyping: "Empezar dictado",
    readingFallback: "Lectura original",
    readingBody: (chapter) => `Capitulo ${chapter}. Lee primero la idea central y marca conectores logicos.`,
    startReading: "Empezar lectura",
    questionsFallback: "Banco original",
    questionsBody: "Haz una pagina de opcion multiple y huecos. Responde primero y luego lee la explicacion.",
    startQuestions: "Empezar preguntas",
    taskDone: "Hecho",
    markDone: "Marcar hecho",
    streak: "Racha",
    weekDone: "hecho",
    reviewQueue: "Cola de repaso",
    handleFirst: "Primero esto",
    stage: "fase",
    strip: ["Repaso primero", "Dictado correcto", "Idea central", "Responder antes de explicar", "4 acciones cierran hoy"],
    tomorrowPreview: "Vista de manana",
    tomorrowTitle: "Lo primero de manana",
    tomorrowBody: "La vista de manana usa solo registros locales y contenido original del sitio. No requiere iniciar sesion.",
    tomorrowCta: "Empezar aqui manana",
    words: "Palabras",
    tomorrowDueWords: "Palabras para manana",
    tomorrowNewWords: (packTitle) => `${packTitle} palabras nuevas`,
    reading: "Lectura",
    tomorrowReadingBody: (chapter) => `Capitulo ${chapter}. Idea central, conectores, frase de salida.`,
    questions: "Preguntas",
    tomorrowQuestionsBody: "Continua una pagina de opcion multiple y huecos. Responde primero y luego revisa.",
  },
  fr: {
    customWordbook: "Mon carnet",
    newLabel: "nouveau",
    dueNew: "nouveau",
    dueNow: "a revoir",
    minute: "min",
    hour: "h",
    day: "j",
    heroEyebrow: (date) => `Aujourd hui ${date}`,
    doneTitle: "La journee est terminee",
    activeTitle: "Plan du jour",
    doneBody: "Les 4 actions sont faites. Revenez demain avec les mots a revoir, puis le nouveau contenu.",
    activeBody: "Revision, nouveaux mots, dictee, puis questions. Cette page donne toujours la prochaine etape.",
    continuePractice: "Continuer",
    oneTapStart: "Commencer",
    directTyping: "Dictee",
    wrongReview: "Erreurs",
    progress: "Progression du jour",
    metricDone: "fait",
    metricStreak: "serie",
    metricAccuracy: "prec",
    dailyPunch: "Point du jour",
    punchTitle: "Journee cochee",
    punchBody: "Revision, nouveaux mots, dictee, lecture et questions sont termines. Vous pouvez arreter ou continuer.",
    reviewTitle: "Reviser les mots dus",
    learnNewTitle: "Apprendre les mots du jour",
    reviewDueBody: (count) => `${count} mots sont a revoir`,
    newWordsBody: (packTitle) => `${packTitle} donne 10 nouveaux mots aujourd hui`,
    startWords: "Mots",
    typingTitle: "Dictee anglaise",
    typingBody: (index, correct, wrong) => `Element ${index}. Correct ${correct}. Erreurs ${wrong}.`,
    startTyping: "Commencer dictee",
    readingFallback: "Lecture originale",
    readingBody: (chapter) => `Chapitre ${chapter}. Lire l idee principale puis marquer les mots logiques.`,
    startReading: "Lire",
    questionsFallback: "Banque originale",
    questionsBody: "Faire une page de choix et de blancs. Repondre avant de lire l explication.",
    startQuestions: "Questions",
    taskDone: "Fait",
    markDone: "Marquer fait",
    streak: "Serie",
    weekDone: "fait",
    reviewQueue: "File de revision",
    handleFirst: "A traiter d abord",
    stage: "etape",
    strip: ["Revision d abord", "Dictee correcte", "Lire l idee", "Repondre avant l explication", "4 actions finissent le jour"],
    tomorrowPreview: "Apercu de demain",
    tomorrowTitle: "Ce qui vient demain",
    tomorrowBody: "L apercu utilise seulement les traces locales et le contenu original du site. Connexion inutile.",
    tomorrowCta: "Reprendre ici demain",
    words: "Mots",
    tomorrowDueWords: "Mots dus demain",
    tomorrowNewWords: (packTitle) => `${packTitle} nouveaux mots`,
    reading: "Lecture",
    tomorrowReadingBody: (chapter) => `Chapitre ${chapter}. Idee principale, mots logiques, phrase de sortie.`,
    questions: "Questions",
    tomorrowQuestionsBody: "Continuer une page de choix et de blancs. Repondre puis lire l explication.",
  },
  de: {
    customWordbook: "Mein Wortbuch",
    newLabel: "neu",
    dueNew: "neu",
    dueNow: "jetzt faellig",
    minute: "min",
    hour: "h",
    day: "T",
    heroEyebrow: (date) => `Heute ${date}`,
    doneTitle: "Heute ist fertig",
    activeTitle: "Plan fuer heute",
    doneBody: "Alle 4 Schritte sind erledigt. Morgen zuerst faellige Woerter, dann neues Material.",
    activeBody: "Erst wiederholen, dann neue Woerter, Hoertippen und Fragen. Diese Seite zeigt den naechsten Schritt.",
    continuePractice: "Weiter ueben",
    oneTapStart: "Start",
    directTyping: "Tippen",
    wrongReview: "Fehler",
    progress: "Fortschritt heute",
    metricDone: "fertig",
    metricStreak: "Serie",
    metricAccuracy: "genau",
    dailyPunch: "Tagescheck",
    punchTitle: "Heute abgehakt",
    punchBody: "Wiederholung, neue Woerter, Tippen, Lesen und Fragen sind erledigt. Stoppen oder weiter ueben.",
    reviewTitle: "Faellige Woerter zuerst",
    learnNewTitle: "Neue Woerter fuer heute",
    reviewDueBody: (count) => `${count} Woerter sind faellig`,
    newWordsBody: (packTitle) => `${packTitle} bringt heute 10 neue Woerter`,
    startWords: "Woerter starten",
    typingTitle: "Englisches Hoertippen",
    typingBody: (index, correct, wrong) => `Eintrag ${index}. Richtig ${correct}. Fehler ${wrong}.`,
    startTyping: "Tippen starten",
    readingFallback: "Originales Lesen",
    readingBody: (chapter) => `Kapitel ${chapter}. Erst Hauptidee lesen, dann Logikwoerter markieren.`,
    startReading: "Lesen starten",
    questionsFallback: "Originale Fragenbank",
    questionsBody: "Eine Seite Auswahl und Luecken. Erst antworten, dann Erklaerung lesen.",
    startQuestions: "Fragen starten",
    taskDone: "Fertig",
    markDone: "Als fertig markieren",
    streak: "Serie",
    weekDone: "fertig",
    reviewQueue: "Wiederholung",
    handleFirst: "Zuerst bearbeiten",
    stage: "Stufe",
    strip: ["Wiederholung zuerst", "Tippen muss korrekt sein", "Hauptidee lesen", "Antwort vor Erklaerung", "4 Schritte beenden heute"],
    tomorrowPreview: "Vorschau morgen",
    tomorrowTitle: "Was morgen zuerst kommt",
    tomorrowBody: "Die Vorschau nutzt nur lokale Wiederholungsdaten und originale Inhalte. Kein Login noetig.",
    tomorrowCta: "Morgen hier starten",
    words: "Woerter",
    tomorrowDueWords: "Morgen faellige Woerter",
    tomorrowNewWords: (packTitle) => `${packTitle} neue Woerter`,
    reading: "Lesen",
    tomorrowReadingBody: (chapter) => `Kapitel ${chapter}. Hauptidee, Logikwoerter, Ausgabesatz.`,
    questions: "Fragen",
    tomorrowQuestionsBody: "Eine Seite Auswahl und Luecken fortsetzen. Erst antworten, dann lesen.",
  },
  pt: {
    customWordbook: "Meu vocabulario",
    newLabel: "novo",
    dueNew: "novo",
    dueNow: "vence agora",
    minute: "min",
    hour: "h",
    day: "d",
    heroEyebrow: (date) => `Hoje ${date}`,
    doneTitle: "Hoje esta completo",
    activeTitle: "Plano de hoje",
    doneBody: "As 4 acoes foram feitas. Amanha comece pelas palavras vencidas e depois siga para conteudo novo.",
    activeBody: "Revise, aprenda novas palavras, digite pelo som e responda perguntas. Esta pagina mostra o proximo passo.",
    continuePractice: "Continuar",
    oneTapStart: "Comecar",
    directTyping: "Digitacao",
    wrongReview: "Erros",
    progress: "Progresso de hoje",
    metricDone: "feito",
    metricStreak: "serie",
    metricAccuracy: "prec",
    dailyPunch: "Check diario",
    punchTitle: "Hoje concluido",
    punchBody: "Revisao, palavras novas, digitacao, leitura e perguntas fecharam o dia. Pare ou pratique mais.",
    reviewTitle: "Revise palavras vencidas",
    learnNewTitle: "Aprenda palavras de hoje",
    reviewDueBody: (count) => `${count} palavras para revisar`,
    newWordsBody: (packTitle) => `${packTitle} traz 10 palavras novas hoje`,
    startWords: "Comecar palavras",
    typingTitle: "Ditado em ingles",
    typingBody: (index, correct, wrong) => `Item ${index}. Certas ${correct}. Erradas ${wrong}.`,
    startTyping: "Comecar ditado",
    readingFallback: "Leitura original",
    readingBody: (chapter) => `Capitulo ${chapter}. Leia a ideia principal e marque conectores logicos.`,
    startReading: "Comecar leitura",
    questionsFallback: "Banco original",
    questionsBody: "Faca uma pagina de escolha e lacunas. Responda antes de ler a explicacao.",
    startQuestions: "Comecar perguntas",
    taskDone: "Feito",
    markDone: "Marcar feito",
    streak: "Sequencia",
    weekDone: "feito",
    reviewQueue: "Fila de revisao",
    handleFirst: "Tratar primeiro",
    stage: "fase",
    strip: ["Revisao primeiro", "Digitacao correta", "Ler ideia principal", "Responder antes da explicacao", "4 acoes fecham hoje"],
    tomorrowPreview: "Previa de amanha",
    tomorrowTitle: "O que vem primeiro amanha",
    tomorrowBody: "A previa usa apenas registros locais e conteudo original do site. Nao precisa login.",
    tomorrowCta: "Comecar aqui amanha",
    words: "Palavras",
    tomorrowDueWords: "Palavras de amanha",
    tomorrowNewWords: (packTitle) => `${packTitle} palavras novas`,
    reading: "Leitura",
    tomorrowReadingBody: (chapter) => `Capitulo ${chapter}. Ideia principal, conectores, frase final.`,
    questions: "Perguntas",
    tomorrowQuestionsBody: "Continue uma pagina de escolha e lacunas. Responda antes de revisar.",
  },
  ru: {
    customWordbook: "Мой словарь",
    newLabel: "новое",
    dueNew: "новое",
    dueNow: "повторить сейчас",
    minute: "мин",
    hour: "ч",
    day: "д",
    heroEyebrow: (date) => `Сегодня ${date}`,
    doneTitle: "Сегодня выполнено",
    activeTitle: "План на сегодня",
    doneBody: "Все 4 действия выполнены. Завтра начните с слов для повторения, затем переходите к новому материалу.",
    activeBody: "Сначала повторение, затем новые слова, набор на слух и вопросы. Эта страница показывает следующий шаг.",
    continuePractice: "Продолжить",
    oneTapStart: "Начать",
    directTyping: "Набор",
    wrongReview: "Ошибки",
    progress: "Прогресс сегодня",
    metricDone: "готово",
    metricStreak: "серия",
    metricAccuracy: "точн",
    dailyPunch: "Отметка дня",
    punchTitle: "Сегодня отмечено",
    punchBody: "Повторение, новые слова, набор, чтение и вопросы закрыты. Можно остановиться или продолжить.",
    reviewTitle: "Сначала слова для повторения",
    learnNewTitle: "Новые слова сегодня",
    reviewDueBody: (count) => `${count} слов пора повторить`,
    newWordsBody: (packTitle) => `${packTitle}: 10 новых слов сегодня`,
    startWords: "Начать слова",
    typingTitle: "Английский диктант",
    typingBody: (index, correct, wrong) => `Задание ${index}. Верно ${correct}. Ошибок ${wrong}.`,
    startTyping: "Начать набор",
    readingFallback: "Оригинальное чтение",
    readingBody: (chapter) => `Глава ${chapter}. Сначала главная мысль, затем логические слова.`,
    startReading: "Начать чтение",
    questionsFallback: "Оригинальные вопросы",
    questionsBody: "Сделайте страницу выбора и пропусков. Сначала ответ, затем объяснение.",
    startQuestions: "Начать вопросы",
    taskDone: "Готово",
    markDone: "Отметить",
    streak: "Серия",
    weekDone: "готово",
    reviewQueue: "Очередь повторения",
    handleFirst: "Сначала это",
    stage: "этап",
    strip: ["Сначала повторение", "Набор без ошибок", "Главная мысль", "Ответ до объяснения", "4 действия завершают день"],
    tomorrowPreview: "Завтра",
    tomorrowTitle: "Что первым завтра",
    tomorrowBody: "Прогноз использует только локальные записи и оригинальный контент сайта. Вход не нужен.",
    tomorrowCta: "Завтра начать здесь",
    words: "Слова",
    tomorrowDueWords: "Слова на завтра",
    tomorrowNewWords: (packTitle) => `${packTitle}: новые слова`,
    reading: "Чтение",
    tomorrowReadingBody: (chapter) => `Глава ${chapter}. Главная мысль, логические слова, итоговое предложение.`,
    questions: "Вопросы",
    tomorrowQuestionsBody: "Продолжите страницу выбора и пропусков. Сначала ответ, затем объяснение.",
  },
  ar: {
    customWordbook: "دفتر كلماتي",
    newLabel: "جديد",
    dueNew: "جديد",
    dueNow: "للمراجعة الآن",
    minute: "د",
    hour: "س",
    day: "ي",
    heroEyebrow: (date) => `اليوم ${date}`,
    doneTitle: "اكتمل تعلم اليوم",
    activeTitle: "خطة اليوم",
    doneBody: "اكتملت الخطوات الأربع. عد غدا وابدأ بالكلمات المستحقة ثم المحتوى الجديد.",
    activeBody: "راجع أولا، ثم تعلم كلمات جديدة، ثم اكتب من الصوت، ثم حل الأسئلة. هذه الصفحة توضح الخطوة التالية.",
    continuePractice: "متابعة التدريب",
    oneTapStart: "ابدأ",
    directTyping: "تدريب الكتابة",
    wrongReview: "مراجعة الأخطاء",
    progress: "تقدم اليوم",
    metricDone: "تم",
    metricStreak: "سلسلة",
    metricAccuracy: "دقة",
    dailyPunch: "إنجاز اليوم",
    punchTitle: "تم تسجيل اليوم",
    punchBody: "اكتملت المراجعة والكلمات الجديدة والكتابة والقراءة والأسئلة. يمكنك التوقف أو متابعة التدريب.",
    reviewTitle: "راجع الكلمات المستحقة أولا",
    learnNewTitle: "تعلم كلمات اليوم الجديدة",
    reviewDueBody: (count) => `${count} كلمة جاهزة للمراجعة`,
    newWordsBody: (packTitle) => `${packTitle} يقدم 10 كلمات جديدة اليوم`,
    startWords: "ابدأ الكلمات",
    typingTitle: "إملاء إنجليزي بالكتابة",
    typingBody: (index, correct, wrong) => `عنصر الكتابة ${index}. صحيح ${correct}. خطأ ${wrong}.`,
    startTyping: "ابدأ الكتابة",
    readingFallback: "قراءة أصلية",
    readingBody: (chapter) => `الفصل ${chapter}. اقرأ الفكرة الرئيسية أولا ثم حدد كلمات المنطق.`,
    startReading: "ابدأ القراءة",
    questionsFallback: "بنك أسئلة أصلي",
    questionsBody: "حل صفحة اختيار وملء فراغ. أجب أولا ثم اقرأ الشرح.",
    startQuestions: "ابدأ الأسئلة",
    taskDone: "تم",
    markDone: "وضع تم",
    streak: "السلسلة",
    weekDone: "تم",
    reviewQueue: "قائمة المراجعة",
    handleFirst: "ابدأ بهذه",
    stage: "مرحلة",
    strip: ["المراجعة أولا", "الكتابة يجب أن تكون صحيحة", "اقرأ الفكرة الرئيسية", "أجب قبل الشرح", "4 خطوات تنهي اليوم"],
    tomorrowPreview: "معاينة الغد",
    tomorrowTitle: "ما الذي يبدأ غدا",
    tomorrowBody: "تعتمد معاينة الغد على سجلات محلية ومحتوى أصلي في الموقع فقط. لا يلزم تسجيل الدخول.",
    tomorrowCta: "ابدأ من هنا غدا",
    words: "كلمات",
    tomorrowDueWords: "كلمات مستحقة غدا",
    tomorrowNewWords: (packTitle) => `${packTitle} كلمات جديدة`,
    reading: "قراءة",
    tomorrowReadingBody: (chapter) => `الفصل ${chapter}. فكرة رئيسية، كلمات منطق، جملة إخراج.`,
    questions: "أسئلة",
    tomorrowQuestionsBody: "تابع صفحة اختيار وملء فراغ. أجب أولا ثم راجع الشرح.",
  },
  hi: {
    customWordbook: "मेरी wordbook",
    newLabel: "नया",
    dueNew: "नया",
    dueNow: "अभी review",
    minute: "मिनट",
    hour: "घं",
    day: "दिन",
    heroEyebrow: (date) => `आज ${date}`,
    doneTitle: "आज पूरा",
    activeTitle: "आज की योजना",
    doneBody: "चारों actions पूरे हो गए. कल पहले due words करो, फिर नया content.",
    activeBody: "पहले review, फिर new words, sound typing, फिर questions. यह page next step दिखाता है.",
    continuePractice: "Practice जारी",
    oneTapStart: "Start",
    directTyping: "Typing",
    wrongReview: "Wrong review",
    progress: "आज की progress",
    metricDone: "done",
    metricStreak: "streak",
    metricAccuracy: "acc",
    dailyPunch: "Daily check",
    punchTitle: "आज checked",
    punchBody: "Review, new words, typing, reading और questions पूरे हैं. रुक सकते हो या और practice कर सकते हो.",
    reviewTitle: "Due words पहले",
    learnNewTitle: "आज के new words",
    reviewDueBody: (count) => `${count} words review के लिए ready हैं`,
    newWordsBody: (packTitle) => `${packTitle} में आज 10 new words`,
    startWords: "Words start",
    typingTitle: "English dictation typing",
    typingBody: (index, correct, wrong) => `Typing ${index}. Correct ${correct}. Wrong ${wrong}.`,
    startTyping: "Typing start",
    readingFallback: "Original reading",
    readingBody: (chapter) => `Chapter ${chapter}. पहले main idea पढ़ो, फिर logic words mark करो.`,
    startReading: "Reading start",
    questionsFallback: "Original question bank",
    questionsBody: "Choice और fill questions की एक page करो. पहले answer, फिर explanation.",
    startQuestions: "Questions start",
    taskDone: "Done",
    markDone: "Mark done",
    streak: "Streak",
    weekDone: "done",
    reviewQueue: "Review queue",
    handleFirst: "पहले यह करो",
    stage: "stage",
    strip: ["Review first", "Typing सही हो", "Main idea पढ़ो", "Explanation से पहले answer", "4 actions से आज पूरा"],
    tomorrowPreview: "कल preview",
    tomorrowTitle: "कल पहले क्या आएगा",
    tomorrowBody: "Preview केवल local records और original site content से बनता है. Login needed नहीं.",
    tomorrowCta: "कल यहां से start",
    words: "Words",
    tomorrowDueWords: "कल due words",
    tomorrowNewWords: (packTitle) => `${packTitle} new words`,
    reading: "Reading",
    tomorrowReadingBody: (chapter) => `Chapter ${chapter}. Main idea, logic words, output sentence.`,
    questions: "Questions",
    tomorrowQuestionsBody: "Choice और fill की एक page जारी रखो. पहले answer, फिर explanation.",
  },
  id: {
    customWordbook: "Buku kata saya",
    newLabel: "baru",
    dueNew: "baru",
    dueNow: "ulangi sekarang",
    minute: "mnt",
    hour: "j",
    day: "h",
    heroEyebrow: (date) => `Hari ini ${date}`,
    doneTitle: "Hari ini selesai",
    activeTitle: "Rencana hari ini",
    doneBody: "Empat aksi sudah selesai. Besok mulai dari kata yang jatuh tempo lalu materi baru.",
    activeBody: "Ulangi, belajar kata baru, ketik dari suara, lalu jawab soal. Halaman ini memberi langkah berikutnya.",
    continuePractice: "Latihan lagi",
    oneTapStart: "Mulai",
    directTyping: "Mengetik",
    wrongReview: "Ulang salah",
    progress: "Progres hari ini",
    metricDone: "selesai",
    metricStreak: "streak",
    metricAccuracy: "akurasi",
    dailyPunch: "Check harian",
    punchTitle: "Hari ini tercatat",
    punchBody: "Ulangan, kata baru, mengetik, membaca dan soal selesai. Berhenti atau lanjut latihan.",
    reviewTitle: "Ulang kata jatuh tempo",
    learnNewTitle: "Kata baru hari ini",
    reviewDueBody: (count) => `${count} kata siap diulang`,
    newWordsBody: (packTitle) => `${packTitle} memberi 10 kata baru hari ini`,
    startWords: "Mulai kata",
    typingTitle: "Dikte bahasa Inggris",
    typingBody: (index, correct, wrong) => `Item ${index}. Benar ${correct}. Salah ${wrong}.`,
    startTyping: "Mulai mengetik",
    readingFallback: "Bacaan original",
    readingBody: (chapter) => `Bab ${chapter}. Baca ide utama lalu tandai kata logika.`,
    startReading: "Mulai baca",
    questionsFallback: "Bank soal original",
    questionsBody: "Kerjakan satu halaman pilihan dan isian. Jawab dulu lalu baca penjelasan.",
    startQuestions: "Mulai soal",
    taskDone: "Selesai",
    markDone: "Tandai selesai",
    streak: "Streak",
    weekDone: "selesai",
    reviewQueue: "Antrian ulang",
    handleFirst: "Kerjakan ini dulu",
    stage: "tahap",
    strip: ["Ulang dulu", "Ketik harus benar", "Baca ide utama", "Jawab sebelum penjelasan", "4 aksi selesai hari ini"],
    tomorrowPreview: "Pratinjau besok",
    tomorrowTitle: "Yang pertama besok",
    tomorrowBody: "Pratinjau hanya memakai catatan lokal dan konten original situs. Tidak perlu login.",
    tomorrowCta: "Mulai di sini besok",
    words: "Kata",
    tomorrowDueWords: "Kata jatuh tempo besok",
    tomorrowNewWords: (packTitle) => `${packTitle} kata baru`,
    reading: "Bacaan",
    tomorrowReadingBody: (chapter) => `Bab ${chapter}. Ide utama, kata logika, kalimat output.`,
    questions: "Soal",
    tomorrowQuestionsBody: "Lanjutkan satu halaman pilihan dan isian. Jawab dulu lalu lihat penjelasan.",
  },
  vi: {
    customWordbook: "So tu cua toi",
    newLabel: "moi",
    dueNew: "moi",
    dueNow: "on ngay",
    minute: "ph",
    hour: "g",
    day: "ng",
    heroEyebrow: (date) => `Hom nay ${date}`,
    doneTitle: "Hom nay da xong",
    activeTitle: "Ke hoach hom nay",
    doneBody: "Da xong 4 hanh dong. Ngay mai bat dau bang tu den han roi hoc noi dung moi.",
    activeBody: "On tap, hoc tu moi, go theo am thanh, roi lam cau hoi. Trang nay cho biet buoc tiep theo.",
    continuePractice: "Luyen tiep",
    oneTapStart: "Bat dau",
    directTyping: "Go chu",
    wrongReview: "On loi sai",
    progress: "Tien do hom nay",
    metricDone: "xong",
    metricStreak: "chuoi",
    metricAccuracy: "dung",
    dailyPunch: "Diem danh ngay",
    punchTitle: "Hom nay da diem danh",
    punchBody: "On tap, tu moi, go chu, doc va cau hoi da khép lai. Co the dung hoac luyen them.",
    reviewTitle: "On tu den han truoc",
    learnNewTitle: "Hoc tu moi hom nay",
    reviewDueBody: (count) => `${count} tu den han on tap`,
    newWordsBody: (packTitle) => `${packTitle} co 10 tu moi hom nay`,
    startWords: "Bat dau tu",
    typingTitle: "Nghe va go tieng Anh",
    typingBody: (index, correct, wrong) => `Muc ${index}. Dung ${correct}. Sai ${wrong}.`,
    startTyping: "Bat dau go",
    readingFallback: "Bai doc goc",
    readingBody: (chapter) => `Chuong ${chapter}. Doc y chinh truoc, roi danh dau tu logic.`,
    startReading: "Bat dau doc",
    questionsFallback: "Ngan hang cau hoi goc",
    questionsBody: "Lam mot trang chon va dien tu. Tra loi truoc, roi xem giai thich.",
    startQuestions: "Bat dau cau hoi",
    taskDone: "Xong",
    markDone: "Danh dau xong",
    streak: "Chuoi",
    weekDone: "xong",
    reviewQueue: "Hang on tap",
    handleFirst: "Lam muc nay truoc",
    stage: "giai doan",
    strip: ["On tap truoc", "Go phai dung", "Doc y chinh", "Tra loi truoc giai thich", "4 hanh dong xong ngay"],
    tomorrowPreview: "Xem truoc ngay mai",
    tomorrowTitle: "Ngay mai lam gi truoc",
    tomorrowBody: "Ban xem truoc chi dung lich su cuc bo va noi dung goc tren site. Khong can dang nhap.",
    tomorrowCta: "Ngay mai bat dau o day",
    words: "Tu",
    tomorrowDueWords: "Tu den han ngay mai",
    tomorrowNewWords: (packTitle) => `${packTitle} tu moi`,
    reading: "Doc",
    tomorrowReadingBody: (chapter) => `Chuong ${chapter}. Y chinh, tu logic, cau output.`,
    questions: "Cau hoi",
    tomorrowQuestionsBody: "Tiep tuc mot trang chon va dien tu. Tra loi truoc roi xem giai thich.",
  },
  th: {
    customWordbook: "สมุดคำของฉัน",
    newLabel: "ใหม่",
    dueNew: "ใหม่",
    dueNow: "ทบทวนตอนนี้",
    minute: "นาที",
    hour: "ชม",
    day: "วัน",
    heroEyebrow: (date) => `วันนี้ ${date}`,
    doneTitle: "วันนี้เสร็จแล้ว",
    activeTitle: "แผนวันนี้",
    doneBody: "ครบ 4 ขั้นตอนแล้ว พรุ่งนี้เริ่มจากคำที่ถึงเวลาทบทวน แล้วค่อยไปเนื้อหาใหม่",
    activeBody: "ทบทวนก่อน เรียนคำใหม่ พิมพ์ตามเสียง แล้วทำคำถาม หน้านี้บอกขั้นตอนถัดไป",
    continuePractice: "ฝึกต่อ",
    oneTapStart: "เริ่ม",
    directTyping: "พิมพ์",
    wrongReview: "ทบทวนผิด",
    progress: "ความคืบหน้าวันนี้",
    metricDone: "เสร็จ",
    metricStreak: "ต่อเนื่อง",
    metricAccuracy: "ถูก",
    dailyPunch: "เช็ควันนี้",
    punchTitle: "บันทึกวันนี้แล้ว",
    punchBody: "ทบทวน คำใหม่ พิมพ์ อ่าน และคำถามครบแล้ว จะหยุดหรือฝึกต่อก็ได้",
    reviewTitle: "ทบทวนคำที่ถึงเวลาก่อน",
    learnNewTitle: "เรียนคำใหม่วันนี้",
    reviewDueBody: (count) => `${count} คำถึงเวลาทบทวน`,
    newWordsBody: (packTitle) => `${packTitle} มีคำใหม่ 10 คำวันนี้`,
    startWords: "เริ่มคำศัพท์",
    typingTitle: "พิมพ์ตามเสียงอังกฤษ",
    typingBody: (index, correct, wrong) => `รายการ ${index} ถูก ${correct} ผิด ${wrong}`,
    startTyping: "เริ่มพิมพ์",
    readingFallback: "บทอ่านต้นฉบับ",
    readingBody: (chapter) => `บทที่ ${chapter} อ่านใจความหลักก่อน แล้วทำเครื่องหมายคำเชื่อมเหตุผล`,
    startReading: "เริ่มอ่าน",
    questionsFallback: "คลังคำถามต้นฉบับ",
    questionsBody: "ทำคำถามเลือกตอบและเติมคำหนึ่งหน้า ตอบก่อนแล้วค่อยอ่านคำอธิบาย",
    startQuestions: "เริ่มคำถาม",
    taskDone: "เสร็จ",
    markDone: "ทำเครื่องหมาย",
    streak: "ต่อเนื่อง",
    weekDone: "เสร็จ",
    reviewQueue: "คิวทบทวน",
    handleFirst: "ทำสิ่งนี้ก่อน",
    stage: "ขั้น",
    strip: ["ทบทวนก่อน", "พิมพ์ต้องถูก", "อ่านใจความหลัก", "ตอบก่อนดูคำอธิบาย", "4 ขั้นตอนจบวันนี้"],
    tomorrowPreview: "พรุ่งนี้",
    tomorrowTitle: "พรุ่งนี้เริ่มอะไร",
    tomorrowBody: "ตัวอย่างพรุ่งนี้ใช้ข้อมูลในเครื่องและเนื้อหาต้นฉบับของเว็บเท่านั้น ไม่ต้องเข้าสู่ระบบ",
    tomorrowCta: "พรุ่งนี้เริ่มที่นี่",
    words: "คำ",
    tomorrowDueWords: "คำที่ถึงเวลาพรุ่งนี้",
    tomorrowNewWords: (packTitle) => `${packTitle} คำใหม่`,
    reading: "อ่าน",
    tomorrowReadingBody: (chapter) => `บทที่ ${chapter} ใจความหลัก คำเชื่อม เหตุผล และประโยคสรุป`,
    questions: "คำถาม",
    tomorrowQuestionsBody: "ทำต่อหนึ่งหน้าของเลือกตอบและเติมคำ ตอบก่อนแล้วดูคำอธิบาย",
  },
  tr: {
    customWordbook: "Kelime defterim",
    newLabel: "yeni",
    dueNew: "yeni",
    dueNow: "simdi tekrar",
    minute: "dk",
    hour: "s",
    day: "g",
    heroEyebrow: (date) => `Bugun ${date}`,
    doneTitle: "Bugun tamam",
    activeTitle: "Bugunun plani",
    doneBody: "4 eylem tamamlandi. Yarin once zamani gelen kelimeler, sonra yeni icerik.",
    activeBody: "Once tekrar, sonra yeni kelime, sesle yazma ve soru. Bu sayfa sonraki adimi gosterir.",
    continuePractice: "Devam et",
    oneTapStart: "Basla",
    directTyping: "Yazma",
    wrongReview: "Hata tekrar",
    progress: "Bugun ilerleme",
    metricDone: "bitti",
    metricStreak: "seri",
    metricAccuracy: "dogru",
    dailyPunch: "Gunluk isaret",
    punchTitle: "Bugun isaretlendi",
    punchBody: "Tekrar, yeni kelime, yazma, okuma ve sorular tamamlandi. Durabilir veya devam edebilirsin.",
    reviewTitle: "Once zamani gelen kelimeler",
    learnNewTitle: "Bugunun yeni kelimeleri",
    reviewDueBody: (count) => `${count} kelime tekrar zamani geldi`,
    newWordsBody: (packTitle) => `${packTitle} bugun 10 yeni kelime verir`,
    startWords: "Kelimeleri baslat",
    typingTitle: "Ingilizce dikte yazma",
    typingBody: (index, correct, wrong) => `Oge ${index}. Dogru ${correct}. Yanlis ${wrong}.`,
    startTyping: "Yazmaya basla",
    readingFallback: "Orijinal okuma",
    readingBody: (chapter) => `Bolum ${chapter}. Once ana fikri oku, sonra mantik kelimelerini isaretle.`,
    startReading: "Okumaya basla",
    questionsFallback: "Orijinal soru bankasi",
    questionsBody: "Bir sayfa secme ve bosluk doldurma yap. Once cevapla, sonra aciklamayi oku.",
    startQuestions: "Sorulara basla",
    taskDone: "Bitti",
    markDone: "Bitti isaretle",
    streak: "Seri",
    weekDone: "bitti",
    reviewQueue: "Tekrar sirasi",
    handleFirst: "Once bunlar",
    stage: "asama",
    strip: ["Tekrar once", "Yazma dogru olmali", "Ana fikri oku", "Aciklamadan once cevap", "4 eylem bugunu bitirir"],
    tomorrowPreview: "Yarin onizleme",
    tomorrowTitle: "Yarin once ne var",
    tomorrowBody: "Onizleme yalniz yerel kayitlari ve site orijinal icerigini kullanir. Giris gerekmez.",
    tomorrowCta: "Yarin buradan basla",
    words: "Kelimeler",
    tomorrowDueWords: "Yarin tekrar kelimeleri",
    tomorrowNewWords: (packTitle) => `${packTitle} yeni kelimeler`,
    reading: "Okuma",
    tomorrowReadingBody: (chapter) => `Bolum ${chapter}. Ana fikir, mantik kelimeleri, cikis cumlesi.`,
    questions: "Sorular",
    tomorrowQuestionsBody: "Bir sayfa secme ve bosluk doldurmaya devam et. Once cevapla, sonra incele.",
  },
  it: {
    customWordbook: "Il mio vocabolario",
    newLabel: "nuovo",
    dueNew: "nuovo",
    dueNow: "da ripassare",
    minute: "min",
    hour: "h",
    day: "g",
    heroEyebrow: (date) => `Oggi ${date}`,
    doneTitle: "Oggi e completo",
    activeTitle: "Piano di oggi",
    doneBody: "Le 4 azioni sono concluse. Domani parti dalle parole in scadenza e poi dal nuovo contenuto.",
    activeBody: "Ripassa, impara parole nuove, scrivi dal suono e rispondi. Questa pagina mostra il passo successivo.",
    continuePractice: "Continua",
    oneTapStart: "Inizia",
    directTyping: "Digitazione",
    wrongReview: "Errori",
    progress: "Progresso di oggi",
    metricDone: "fatto",
    metricStreak: "serie",
    metricAccuracy: "prec",
    dailyPunch: "Check del giorno",
    punchTitle: "Oggi segnato",
    punchBody: "Ripasso, parole nuove, digitazione, lettura e domande sono chiusi. Puoi fermarti o continuare.",
    reviewTitle: "Ripassa prima le parole dovute",
    learnNewTitle: "Parole nuove di oggi",
    reviewDueBody: (count) => `${count} parole da ripassare`,
    newWordsBody: (packTitle) => `${packTitle} offre 10 parole nuove oggi`,
    startWords: "Inizia parole",
    typingTitle: "Dettato inglese",
    typingBody: (index, correct, wrong) => `Elemento ${index}. Corrette ${correct}. Errori ${wrong}.`,
    startTyping: "Inizia dettato",
    readingFallback: "Lettura originale",
    readingBody: (chapter) => `Capitolo ${chapter}. Leggi l idea centrale e marca le parole logiche.`,
    startReading: "Inizia lettura",
    questionsFallback: "Banca domande originale",
    questionsBody: "Fai una pagina di scelta e riempimento. Rispondi prima, poi leggi la spiegazione.",
    startQuestions: "Inizia domande",
    taskDone: "Fatto",
    markDone: "Segna fatto",
    streak: "Serie",
    weekDone: "fatto",
    reviewQueue: "Coda ripasso",
    handleFirst: "Prima questi",
    stage: "fase",
    strip: ["Ripasso prima", "Digitazione corretta", "Leggi l idea", "Rispondi prima della spiegazione", "4 azioni chiudono oggi"],
    tomorrowPreview: "Anteprima domani",
    tomorrowTitle: "Cosa viene prima domani",
    tomorrowBody: "L anteprima usa solo dati locali e contenuti originali del sito. Login non necessario.",
    tomorrowCta: "Domani inizia qui",
    words: "Parole",
    tomorrowDueWords: "Parole per domani",
    tomorrowNewWords: (packTitle) => `${packTitle} parole nuove`,
    reading: "Lettura",
    tomorrowReadingBody: (chapter) => `Capitolo ${chapter}. Idea centrale, parole logiche, frase finale.`,
    questions: "Domande",
    tomorrowQuestionsBody: "Continua una pagina di scelta e riempimento. Rispondi prima, poi controlla.",
  },
  nl: {
    customWordbook: "Mijn woordenboek",
    newLabel: "nieuw",
    dueNew: "nieuw",
    dueNow: "nu herhalen",
    minute: "min",
    hour: "u",
    day: "d",
    heroEyebrow: (date) => `Vandaag ${date}`,
    doneTitle: "Vandaag is klaar",
    activeTitle: "Plan voor vandaag",
    doneBody: "Alle 4 acties zijn gedaan. Morgen eerst woorden die klaarstaan, daarna nieuw materiaal.",
    activeBody: "Herhaal, leer nieuwe woorden, typ op geluid en maak vragen. Deze pagina toont je volgende stap.",
    continuePractice: "Verder oefenen",
    oneTapStart: "Start",
    directTyping: "Typen",
    wrongReview: "Fouten",
    progress: "Voortgang vandaag",
    metricDone: "klaar",
    metricStreak: "reeks",
    metricAccuracy: "acc",
    dailyPunch: "Dagcheck",
    punchTitle: "Vandaag afgevinkt",
    punchBody: "Herhaling, nieuwe woorden, typen, lezen en vragen zijn klaar. Stop hier of oefen door.",
    reviewTitle: "Eerst woorden herhalen",
    learnNewTitle: "Nieuwe woorden van vandaag",
    reviewDueBody: (count) => `${count} woorden klaar voor herhaling`,
    newWordsBody: (packTitle) => `${packTitle} geeft vandaag 10 nieuwe woorden`,
    startWords: "Woorden starten",
    typingTitle: "Engels dictee typen",
    typingBody: (index, correct, wrong) => `Item ${index}. Goed ${correct}. Fout ${wrong}.`,
    startTyping: "Typen starten",
    readingFallback: "Originele lezing",
    readingBody: (chapter) => `Hoofdstuk ${chapter}. Lees eerst de hoofdgedachte en markeer logische woorden.`,
    startReading: "Lezen starten",
    questionsFallback: "Originele vragenbank",
    questionsBody: "Maak een pagina keuze en invullen. Antwoord eerst, lees daarna de uitleg.",
    startQuestions: "Vragen starten",
    taskDone: "Klaar",
    markDone: "Markeer klaar",
    streak: "Reeks",
    weekDone: "klaar",
    reviewQueue: "Herhaalrij",
    handleFirst: "Eerst deze",
    stage: "fase",
    strip: ["Herhaling eerst", "Typen moet juist", "Lees hoofdgedachte", "Antwoord voor uitleg", "4 acties maken vandaag af"],
    tomorrowPreview: "Morgen preview",
    tomorrowTitle: "Wat morgen eerst komt",
    tomorrowBody: "Preview gebruikt alleen lokale gegevens en originele sitecontent. Geen login nodig.",
    tomorrowCta: "Morgen hier starten",
    words: "Woorden",
    tomorrowDueWords: "Woorden voor morgen",
    tomorrowNewWords: (packTitle) => `${packTitle} nieuwe woorden`,
    reading: "Lezen",
    tomorrowReadingBody: (chapter) => `Hoofdstuk ${chapter}. Hoofdgedachte, logische woorden, outputzin.`,
    questions: "Vragen",
    tomorrowQuestionsBody: "Ga door met een pagina keuze en invullen. Antwoord eerst en bekijk dan uitleg.",
  },
  pl: {
    customWordbook: "Moj slownik",
    newLabel: "nowe",
    dueNew: "nowe",
    dueNow: "powtorz teraz",
    minute: "min",
    hour: "h",
    day: "d",
    heroEyebrow: (date) => `Dzisiaj ${date}`,
    doneTitle: "Dzisiaj gotowe",
    activeTitle: "Plan na dzisiaj",
    doneBody: "Wszystkie 4 akcje sa zakonczone. Jutro zacznij od slow do powtorki, potem nowy material.",
    activeBody: "Najpierw powtorka, potem nowe slowa, pisanie ze sluchu i pytania. Ta strona pokazuje kolejny krok.",
    continuePractice: "Cwicz dalej",
    oneTapStart: "Start",
    directTyping: "Pisanie",
    wrongReview: "Bledy",
    progress: "Postep dzisiaj",
    metricDone: "gotowe",
    metricStreak: "seria",
    metricAccuracy: "dokl",
    dailyPunch: "Dzienny check",
    punchTitle: "Dzisiaj odhaczone",
    punchBody: "Powtorka, nowe slowa, pisanie, czytanie i pytania sa zamkniete. Mozesz skonczyc lub cwiczyc dalej.",
    reviewTitle: "Najpierw slowa do powtorki",
    learnNewTitle: "Nowe slowa na dzisiaj",
    reviewDueBody: (count) => `${count} slow do powtorki`,
    newWordsBody: (packTitle) => `${packTitle} daje dzisiaj 10 nowych slow`,
    startWords: "Start slow",
    typingTitle: "Angielskie dyktando",
    typingBody: (index, correct, wrong) => `Element ${index}. Dobrze ${correct}. Bledy ${wrong}.`,
    startTyping: "Start pisania",
    readingFallback: "Oryginalne czytanie",
    readingBody: (chapter) => `Rozdzial ${chapter}. Najpierw glowna mysl, potem slowa logiczne.`,
    startReading: "Start czytania",
    questionsFallback: "Oryginalna baza pytan",
    questionsBody: "Zrob jedna strone wyboru i luk. Najpierw odpowiedz, potem przeczytaj wyjasnienie.",
    startQuestions: "Start pytan",
    taskDone: "Gotowe",
    markDone: "Oznacz gotowe",
    streak: "Seria",
    weekDone: "gotowe",
    reviewQueue: "Kolejka powtorki",
    handleFirst: "Najpierw to",
    stage: "etap",
    strip: ["Powtorka najpierw", "Pisanie bez bledow", "Czytaj glowna mysl", "Odpowiedz przed wyjasnieniem", "4 akcje koncza dzien"],
    tomorrowPreview: "Podglad jutra",
    tomorrowTitle: "Co jutro pierwsze",
    tomorrowBody: "Podglad uzywa tylko lokalnych zapisow i oryginalnych tresci strony. Logowanie niepotrzebne.",
    tomorrowCta: "Jutro zacznij tutaj",
    words: "Slowa",
    tomorrowDueWords: "Slowa na jutro",
    tomorrowNewWords: (packTitle) => `${packTitle} nowe slowa`,
    reading: "Czytanie",
    tomorrowReadingBody: (chapter) => `Rozdzial ${chapter}. Glowna mysl, slowa logiczne, zdanie wyjsciowe.`,
    questions: "Pytania",
    tomorrowQuestionsBody: "Kontynuuj jedna strone wyboru i luk. Najpierw odpowiedz, potem wyjasnienie.",
  },
};

const DAILY_TARGET = 4;
const COMPLETION_STORAGE_KEY = "vantaapi-today-punch-v1";
const todayTaskIds: TodayTaskId[] = ["review", "typing", "reading", "questions"];

function daySeed(date = new Date()) {
  const start = new Date(date.getFullYear(), 0, 0);
  return Math.floor((date.getTime() - start.getTime()) / 86400000);
}

function todayKey(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function readVocabularyProgress(packSlug: string) {
  if (typeof window === "undefined") return {} as Record<string, ReviewRecord>;
  try {
    return JSON.parse(window.localStorage.getItem(`vantaapi-vocabulary-review-${packSlug}`) || "{}") as Record<string, ReviewRecord>;
  } catch {
    return {};
  }
}

function readTypingStats() {
  if (typeof window === "undefined") return { correct: 0, wrong: 0, index: 0 };
  try {
    const parsed = JSON.parse(window.localStorage.getItem("vantaapi-english-typing-v1") || "{}") as Partial<{
      correct: number;
      wrong: number;
      index: number;
    }>;
    return {
      correct: Number(parsed.correct || 0),
      wrong: Number(parsed.wrong || 0),
      index: Number(parsed.index || 0),
    };
  } catch {
    return { correct: 0, wrong: 0, index: 0 };
  }
}

function relativeDue(timestamp: number | undefined, copy: TodayPlanCopy) {
  if (!timestamp) return copy.dueNew;
  const diff = timestamp - Date.now();
  if (diff <= 0) return copy.dueNow;
  const minute = 60000;
  const hour = 60 * minute;
  const day = 24 * hour;
  if (diff < hour) return `${Math.max(1, Math.round(diff / minute))} ${copy.minute}`;
  if (diff < day) return `${Math.max(1, Math.round(diff / hour))} ${copy.hour}`;
  return `${Math.max(1, Math.round(diff / day))} ${copy.day}`;
}

function buildNewWords(pack: TodayPack, seed: number) {
  if (pack.words.length === 0) return [];
  const start = (seed * 3) % pack.words.length;
  return Array.from({ length: Math.min(10, pack.words.length) }, (_, index) => pack.words[(start + index) % pack.words.length]);
}

function emptyCompletionState(): TodayCompletionState {
  return { version: 1, byDay: {} };
}

function readCompletionState() {
  if (typeof window === "undefined") return emptyCompletionState();
  try {
    const parsed = JSON.parse(window.localStorage.getItem(COMPLETION_STORAGE_KEY) || "{}") as Partial<TodayCompletionState>;
    return {
      version: 1,
      byDay: parsed.byDay && typeof parsed.byDay === "object" ? parsed.byDay : {},
    } satisfies TodayCompletionState;
  } catch {
    return emptyCompletionState();
  }
}

function persistCompletionState(state: TodayCompletionState) {
  try {
    window.localStorage.setItem(COMPLETION_STORAGE_KEY, JSON.stringify(state));
    window.dispatchEvent(new CustomEvent("vantaapi-today-punch"));
  } catch {
    // Punch data is local and best effort.
  }
}

function completedCount(day?: TodayCompletionDay) {
  if (!day) return 0;
  return todayTaskIds.filter((taskId) => day.tasks[taskId]).length;
}

function completionStreak(state: TodayCompletionState) {
  let streak = 0;
  const cursor = dateFromToday(0);
  while (completedCount(state.byDay[todayKey(cursor)]) >= DAILY_TARGET) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

function dateFromToday(offset: number) {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + offset);
  return date;
}

function shortDayLabel(date: Date) {
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

function previewVocabularyForDate(packs: TodayPack[], offset: number) {
  const seed = daySeed(dateFromToday(offset));
  const pack = packs[seed % Math.max(packs.length, 1)] || packs[0];
  return {
    pack,
    words: pack ? buildNewWords(pack, seed).slice(0, 4) : [],
  };
}

export default function TodayStudyPlan({ initialLanguage, packs, readingPacks, questionPacks }: TodayStudyPlanProps) {
  const language = initialLanguage;
  const copy = todayPlanCopy[language] || todayPlanCopy.en;
  const [progress, setProgress] = useState<LocalProgressState>(() => readLocalProgress());
  const [version, setVersion] = useState(0);
  const [typingStats, setTypingStats] = useState(() => readTypingStats());
  const [completionState, setCompletionState] = useState<TodayCompletionState>(() => emptyCompletionState());
  const seed = daySeed();
  const summary = useMemo(() => localProgressSummary(progress), [progress]);
  const today = todayKey();
  const todayCompletion = completionState.byDay[today];
  const taskDone = todayCompletion?.tasks || {};
  const finishedTasks = completedCount(todayCompletion);
  const isDayComplete = finishedTasks >= DAILY_TARGET;
  const punchStreak = completionStreak(completionState);
  const customPack = useMemo(() => {
    void version;
    const customWords = readCustomWords();
    if (customWords.length === 0) return null;
    return {
      slug: CUSTOM_WORDBOOK_SLUG,
      shortTitle: copy.customWordbook,
      level: "Custom",
      route: "/english/vocabulary/custom",
      words: customWords.map((word) => ({
        word: word.word,
        meaningZh: word.meaningZh,
        collocation: word.collocation,
      })),
    } satisfies TodayPack;
  }, [copy.customWordbook, version]);
  const allPacks = useMemo(() => (customPack ? [customPack, ...packs] : packs), [customPack, packs]);
  const activePack = allPacks[seed % Math.max(allPacks.length, 1)] || allPacks[0];
  const activeReading = readingPacks[seed % Math.max(readingPacks.length, 1)] || readingPacks[0];
  const activeQuestionPack = questionPacks[seed % Math.max(questionPacks.length, 1)] || questionPacks[0];
  const chapter = activeReading ? (seed % activeReading.targetArticles) + 1 : 1;
  const questionPage = (seed % 25) + 1;

  const vocabQueue = useMemo(() => {
    void version;
    const due: Array<TodayWord & { pack: TodayPack; dueText: string; stage: number }> = [];
    allPacks.forEach((pack) => {
      const records = readVocabularyProgress(pack.slug);
      pack.words.forEach((word) => {
        const record = records[word.word];
        if (record && (record.status === "unknown" || Number(record.nextAt || 0) <= Date.now())) {
          due.push({
            ...word,
            pack,
            dueText: relativeDue(record.nextAt, copy),
            stage: Number(record.stage || 0),
          });
        }
      });
    });
    return due.slice(0, 12);
  }, [allPacks, copy, version]);

  const newWords = useMemo(() => buildNewWords(activePack, seed), [activePack, seed]);
  const completion = Math.min(100, Math.round((finishedTasks / DAILY_TARGET) * 100));
  const firstHref = localizedHref(
    vocabQueue[0]?.pack.route
      ? vocabQueue[0].pack.route
      : activePack
        ? activePack.route
        : "/english/vocabulary",
    language,
  );
  const week = useMemo(() => Array.from({ length: 7 }, (_, index) => {
    const date = dateFromToday(index - 6);
    const key = todayKey(date);
    const day = completionState.byDay[key];
    return {
      key,
      label: shortDayLabel(date),
      done: completedCount(day) >= DAILY_TARGET,
      partial: completedCount(day),
      today: key === today,
    };
  }), [completionState.byDay, today]);
  const tomorrowPreview = useMemo(() => {
    void version;
    const tomorrowEnd = dateFromToday(2).getTime() - 1;
    const due: Array<TodayWord & { pack: TodayPack; dueText: string }> = [];
    allPacks.forEach((pack) => {
      const records = readVocabularyProgress(pack.slug);
      pack.words.forEach((word) => {
        const record = records[word.word];
        if (record && Number(record.nextAt || 0) <= tomorrowEnd) {
          due.push({ ...word, pack, dueText: relativeDue(record.nextAt, copy) });
        }
      });
    });
    const nextWords = previewVocabularyForDate(allPacks, 1);
    const tomorrowSeed = daySeed(dateFromToday(1));
    const tomorrowReading = readingPacks[tomorrowSeed % Math.max(readingPacks.length, 1)] || readingPacks[0];
    const tomorrowQuestionPack = questionPacks[tomorrowSeed % Math.max(questionPacks.length, 1)] || questionPacks[0];
    return {
      due: due.slice(0, 4),
      newPack: nextWords.pack,
      newWords: nextWords.words,
      reading: tomorrowReading,
      readingChapter: tomorrowReading ? (tomorrowSeed % tomorrowReading.targetArticles) + 1 : 1,
      questionPack: tomorrowQuestionPack,
    };
  }, [allPacks, copy, questionPacks, readingPacks, version]);

  useEffect(() => {
    const refresh = () => {
      setProgress(readLocalProgress());
      setTypingStats(readTypingStats());
      setCompletionState(readCompletionState());
      setVersion((value) => value + 1);
    };
    const timer = window.setTimeout(refresh, 0);
    window.addEventListener("storage", refresh);
    window.addEventListener("vantaapi-local-progress", refresh);
    window.addEventListener("vantaapi-today-punch", refresh);
    window.addEventListener("vantaapi-custom-wordbook", refresh);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("storage", refresh);
      window.removeEventListener("vantaapi-local-progress", refresh);
      window.removeEventListener("vantaapi-today-punch", refresh);
      window.removeEventListener("vantaapi-custom-wordbook", refresh);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, []);

  function startTask(id: string, title: string, href: string) {
    recordLocalActivity({
      id: `today:${todayKey()}:${id}`,
      title,
      href,
      kind: "review",
    });
  }

  function completeTask(id: TodayTaskId, title: string, href: string) {
    const current = readCompletionState();
    const key = todayKey();
    const currentDay = current.byDay[key] || { tasks: {}, updatedAt: Date.now() };
    const nextDay = {
      ...currentDay,
      tasks: { ...currentDay.tasks, [id]: true },
      updatedAt: Date.now(),
    } satisfies TodayCompletionDay;
    if (completedCount(nextDay) >= DAILY_TARGET && !nextDay.completedAt) {
      nextDay.completedAt = Date.now();
    }
    const nextState = {
      version: 1,
      byDay: {
        ...current.byDay,
        [key]: nextDay,
      },
    } satisfies TodayCompletionState;
    setCompletionState(nextState);
    persistCompletionState(nextState);
    recordLocalActivity({
      id: `today:${key}:${id}:done`,
      title,
      href,
      kind: "review",
      completed: true,
      correct: true,
    });
  }

  const tasks: Array<{
    id: TodayTaskId;
    eyebrow: string;
    title: string;
    body: string;
    href: string;
    action: string;
  }> = [
    {
      id: "review",
      eyebrow: "01 Review",
      title: vocabQueue.length > 0 ? copy.reviewTitle : copy.learnNewTitle,
      body: vocabQueue.length > 0 ? copy.reviewDueBody(vocabQueue.length) : copy.newWordsBody(activePack?.shortTitle || "Vocabulary"),
      href: firstHref,
      action: copy.startWords,
    },
    {
      id: "typing",
      eyebrow: "02 Typing",
      title: copy.typingTitle,
      body: copy.typingBody(typingStats.index + 1, typingStats.correct, typingStats.wrong),
      href: localizedHref("/english/typing", language),
      action: copy.startTyping,
    },
    {
      id: "reading",
      eyebrow: "03 Reading",
      title: displayPackTitle(activeReading, language, copy.readingFallback),
      body: copy.readingBody(chapter),
      href: localizedHref(activeReading ? `/english/reading/${activeReading.slug}?page=${chapter}` : "/english/reading", language),
      action: copy.startReading,
    },
    {
      id: "questions",
      eyebrow: "04 Questions",
      title: displayPackTitle(activeQuestionPack, language, copy.questionsFallback),
      body: copy.questionsBody,
      href: localizedHref(activeQuestionPack ? `/english/question-bank/${activeQuestionPack.slug}?page=${questionPage}` : "/english/question-bank", language),
      action: copy.startQuestions,
    },
  ];

  return (
    <section className="apple-shell py-5">
      <div className="dense-panel overflow-hidden p-5 sm:p-6">
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-end">
          <div>
            <p className="eyebrow">{copy.heroEyebrow(today)}</p>
            <h1 className="mt-3 max-w-4xl text-3xl font-semibold leading-[1.04] sm:text-4xl">
              {isDayComplete ? copy.doneTitle : copy.activeTitle}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[color:var(--muted)]">
              {isDayComplete ? copy.doneBody : copy.activeBody}
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Link href={firstHref} className="dense-action-primary px-4 py-2.5" onClick={() => startTask("start", "Today learning started", firstHref)}>
                {isDayComplete ? copy.continuePractice : copy.oneTapStart}
              </Link>
              <Link href={localizedHref("/english/typing", language)} className="dense-action px-4 py-2.5">
                {copy.directTyping}
              </Link>
              <Link href={localizedHref("/wrong", language)} className="dense-action px-4 py-2.5">
                {copy.wrongReview}
              </Link>
            </div>
          </div>

          <div className="rounded-[8px] border border-slate-200 bg-white/75 p-4">
            <p className="eyebrow">{copy.progress}</p>
            <div className="mt-3 flex items-end gap-2">
              <span className="text-5xl font-semibold">{completion}</span>
              <span className="pb-2 text-sm font-semibold text-[color:var(--muted)]">%</span>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
              <span className="block h-full rounded-full bg-slate-950" style={{ width: `${completion}%` }} />
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
              <Metric label={copy.metricDone} value={`${finishedTasks}/4`} />
              <Metric label={copy.metricStreak} value={`${punchStreak}${copy.day}`} />
              <Metric label={copy.metricAccuracy} value={summary.completed ? `${summary.accuracy}%` : copy.newLabel} />
            </div>
          </div>
        </div>
      </div>

      {isDayComplete ? (
        <section className="mt-3 rounded-[8px] border border-emerald-200 bg-emerald-50 p-5">
          <p className="eyebrow text-emerald-700">{copy.dailyPunch}</p>
          <div className="mt-2 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-emerald-950">{copy.punchTitle}</h2>
              <p className="mt-2 text-sm leading-6 text-emerald-800">
                {copy.punchBody}
              </p>
            </div>
            <Link href={localizedHref("/english/typing", language)} className="dense-action-primary w-fit">
              {copy.continuePractice}
            </Link>
          </div>
        </section>
      ) : null}

      <section className="mt-3 grid gap-3 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="grid gap-3 md:grid-cols-2">
          {tasks.map((task) => (
            <article key={task.id} className={`dense-card p-4 ${taskDone[task.id] ? "border-emerald-200 bg-emerald-50/70" : ""}`}>
              <p className="eyebrow">{task.eyebrow}</p>
              <div className="mt-2 flex items-start justify-between gap-3">
                <h2 className="text-xl font-semibold">{task.title}</h2>
                {taskDone[task.id] ? (
                  <span className="rounded-full border border-emerald-200 bg-white px-2.5 py-1 text-xs font-semibold text-emerald-700">
                    {copy.taskDone}
                  </span>
                ) : null}
              </div>
              <p className="mt-2 min-h-12 text-sm leading-6 text-[color:var(--muted)]">{task.body}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link href={task.href} className="dense-action-primary" onClick={() => startTask(task.id, task.title, task.href)}>
                  {task.action}
                </Link>
                <button
                  type="button"
                  className={taskDone[task.id] ? "dense-action opacity-70" : "dense-action"}
                  disabled={Boolean(taskDone[task.id])}
                  onClick={() => completeTask(task.id, `${task.title} done`, task.href)}
                >
                  {taskDone[task.id] ? copy.taskDone : copy.markDone}
                </button>
              </div>
            </article>
          ))}
        </div>

        <aside className="dense-panel dense-grid-bg p-5">
          <p className="eyebrow text-slate-400">{copy.streak}</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">7</h2>
          <div className="mt-4 grid grid-cols-7 gap-1.5">
            {week.map((day) => (
              <div
                key={day.key}
                className={`rounded-[8px] border p-2 text-center ${
                  day.done
                    ? "border-emerald-300 bg-emerald-300 text-slate-950"
                    : day.today
                      ? "border-white/35 bg-white/15 text-white"
                      : "border-white/10 bg-white/[0.07] text-slate-300"
                }`}
              >
                <p className="text-[10px] font-semibold">{day.label}</p>
                <p className="mt-1 text-sm font-semibold">{day.done ? copy.weekDone : day.partial ? `${day.partial}/4` : "-"}</p>
              </div>
            ))}
          </div>
          <div className="mt-5 border-t border-white/10 pt-4">
            <p className="eyebrow text-slate-400">{copy.reviewQueue}</p>
            <h3 className="mt-2 text-xl font-semibold text-white">{copy.handleFirst}</h3>
          </div>
          <div className="mt-4 grid gap-2">
            {vocabQueue.length > 0 ? (
              vocabQueue.slice(0, 6).map((word) => (
                <Link key={`${word.pack.slug}-${word.word}`} href={localizedHref(word.pack.route, language)} className="rounded-[8px] border border-white/10 bg-white/[0.07] p-3 text-white transition hover:border-sky-200/50">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold">{word.word}</span>
                    <span className="text-xs text-slate-300">{copy.stage} {word.stage}</span>
                  </div>
                  <p className="mt-1 text-xs leading-5 text-slate-300">{displayWordDetail(word, language, word.dueText)}</p>
                </Link>
              ))
            ) : (
              newWords.slice(0, 6).map((word) => (
                <Link key={`${activePack.slug}-${word.word}`} href={localizedHref(activePack.route, language)} className="rounded-[8px] border border-white/10 bg-white/[0.07] p-3 text-white transition hover:border-sky-200/50">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold">{word.word}</span>
                    <span className="text-xs text-slate-300">{copy.newLabel}</span>
                  </div>
                  <p className="mt-1 text-xs leading-5 text-slate-300">{displayWordDetail(word, language)}</p>
                </Link>
              ))
            )}
          </div>
        </aside>
      </section>

      <section className="today-rule-strip">
        {copy.strip.map((item) => <span key={item}>{item}</span>)}
      </section>

      <section className="mt-3 dense-panel p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="eyebrow">{copy.tomorrowPreview}</p>
            <h2 className="mt-2 text-2xl font-semibold">{copy.tomorrowTitle}</h2>
            <p className="mt-2 text-sm leading-6 text-[color:var(--muted)]">
              {copy.tomorrowBody}
            </p>
          </div>
          <Link href={localizedHref("/today", language)} className="dense-action-primary w-fit">
            {copy.tomorrowCta}
          </Link>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <div className="dense-card p-4">
            <p className="eyebrow">{copy.words}</p>
            <h3 className="mt-2 text-xl font-semibold">
              {tomorrowPreview.due.length > 0
                ? copy.tomorrowDueWords
                : copy.tomorrowNewWords(tomorrowPreview.newPack?.shortTitle || "Vocabulary")}
            </h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {(tomorrowPreview.due.length > 0 ? tomorrowPreview.due : tomorrowPreview.newWords).slice(0, 4).map((word) => (
                <span key={`${word.word}-${word.meaningZh}`} className="dense-status">
                  {word.word}
                </span>
              ))}
            </div>
          </div>
          <div className="dense-card p-4">
            <p className="eyebrow">{copy.reading}</p>
            <h3 className="mt-2 text-xl font-semibold">{displayPackTitle(tomorrowPreview.reading, language, copy.readingFallback)}</h3>
            <p className="mt-2 text-sm leading-6 text-[color:var(--muted)]">{copy.tomorrowReadingBody(tomorrowPreview.readingChapter)}</p>
          </div>
          <div className="dense-card p-4">
            <p className="eyebrow">{copy.questions}</p>
            <h3 className="mt-2 text-xl font-semibold">{displayPackTitle(tomorrowPreview.questionPack, language, copy.questionsFallback)}</h3>
            <p className="mt-2 text-sm leading-6 text-[color:var(--muted)]">{copy.tomorrowQuestionsBody}</p>
          </div>
        </div>
      </section>
    </section>
  );
}

function displayPackTitle(pack: { title?: string; zhTitle?: string } | undefined, language: InterfaceLanguage, fallback: string) {
  if (!pack) return fallback;
  return language === "zh" ? pack.zhTitle || pack.title || fallback : pack.title || pack.zhTitle || fallback;
}

function displayWordDetail(word: TodayWord, language: InterfaceLanguage, suffix?: string) {
  const primary = language === "zh" && word.meaningZh ? word.meaningZh : word.collocation;
  const pieces = [primary, suffix].filter(Boolean);
  return pieces.join(" · ");
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[8px] border border-slate-200 bg-white p-2">
      <p className="text-[10px] font-semibold uppercase tracking-normal text-[color:var(--muted)]">{label}</p>
      <p className="mt-1 font-semibold">{value}</p>
    </div>
  );
}
