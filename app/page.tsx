import Link from "next/link";
import type { Metadata } from "next";
import QuickStartPanel from "@/components/home/QuickStartPanel";
import { getServerUser } from "@/lib/server-auth";
import { programmingLanguages } from "@/lib/programming-content";
import { toolDefinitions } from "@/lib/tool-definitions";
import {
  worldLanguageFamilies,
  worldLanguages,
  worldLanguageStarterPlan,
} from "@/lib/world-language-content";

export const metadata: Metadata = {
  title: "VantaAPI - AI Tools & Coding Lab",
  description:
    "An AI tools and coding training platform for beginners and indie developers. Improve your learning and development efficiency with clearer prompts, faster code understanding, and systematic practice paths.",
};

const railItems = [
  { href: "/", code: "VA", label: "Home" },
  { href: "/tools", code: "T", label: "Tools" },
  { href: "/programming", code: "C", label: "Coding" },
  { href: "/tools/learning-roadmap", code: "R", label: "Roadmap" },
  { href: "/search", code: "S", label: "Search" },
];

type HomeSearchParams = Promise<{ ui?: string | string[] }>;

type HomeCopy = {
  versionLabel: string;
  statusSearch: string;
  statusTools: string;
  statusLanguages: string;
  statusCoding: string;
  statusRoadmaps: string;
  navSearch: string;
  navTools: string;
  navLanguages: string;
  navCoding: string;
  navRoadmap: string;
  navLogin: string;
  navLogout: string;
  heroEyebrow: string;
  heroText: string;
  search: string;
  startToday: string;
  aiTools: string;
  myWordbook: string;
  coding: string;
  languages: string;
  searchPlaceholder: string;
  focus: string;
  ready: string;
  globalSetup: string;
  allLanguageHome: string;
  paths: string;
  families: string;
  openMap: string;
  familyTitle: string;
  all: string;
  worldLanguages: string;
  chooseAnyPath: string;
  viewPaths: string;
};

const homeCopy: Record<string, HomeCopy> = {
  english: {
    versionLabel: "English",
    statusSearch: "Search",
    statusTools: "AI Tools",
    statusLanguages: "World Languages",
    statusCoding: "Coding Lab",
    statusRoadmaps: "Learning Roadmap",
    navSearch: "Search",
    navTools: "AI Tools",
    navLanguages: "Languages",
    navCoding: "Coding Lab",
    navRoadmap: "Roadmap",
    navLogin: "Login",
    navLogout: "Logout",
    heroEyebrow: "AI Tools & Coding Lab",
    heroText: "An AI tools and coding training platform for beginners and indie developers. Improve your learning and development efficiency with clearer prompts, faster code understanding, and systematic practice paths.",
    search: "Search",
    startToday: "Start Learning",
    aiTools: "AI Tools",
    myWordbook: "My Wordbook",
    coding: "Coding Lab",
    languages: "Languages",
    searchPlaceholder: "Search tools, coding, prompts, Python, regex",
    focus: "Focus",
    ready: "Ready",
    globalSetup: "Global Language Setup",
    allLanguageHome: "All language home",
    paths: "paths",
    families: "families",
    openMap: "Open map",
    familyTitle: "Families",
    all: "All",
    worldLanguages: "World Languages",
    chooseAnyPath: "Choose any path",
    viewPaths: "View paths",
  },
  chinese: {
    versionLabel: "中文",
    statusSearch: "搜索",
    statusTools: "AI 工具",
    statusLanguages: "世界语言",
    statusCoding: "编程实验室",
    statusRoadmaps: "学习路线",
    navSearch: "搜索",
    navTools: "AI 工具",
    navLanguages: "语言",
    navCoding: "编程实验室",
    navRoadmap: "学习路线",
    navLogin: "登录",
    navLogout: "退出",
    heroEyebrow: "AI 工具与编程实验室",
    heroText: "一个面向零基础学习者和独立开发者的 AI 工具与编程训练平台。用更清晰的提示词、更快的代码理解、更系统的练习路线，提升你的学习和开发效率。",
    search: "搜索",
    startToday: "开始学习",
    aiTools: "AI 工具",
    myWordbook: "我的词书",
    coding: "编程实验室",
    languages: "语言",
    searchPlaceholder: "搜索工具 编程练习 提示词 Python 正则",
    focus: "核心功能",
    ready: "就绪",
    globalSetup: "全语言设置",
    allLanguageHome: "全语言首页",
    paths: "条路径",
    families: "个语系",
    openMap: "打开地图",
    familyTitle: "语系",
    all: "全部",
    worldLanguages: "世界语言",
    chooseAnyPath: "选择任意路径",
    viewPaths: "查看路径",
  },
  japanese: {
    versionLabel: "日本語",
    statusSearch: "検索",
    statusTools: "AI ツール",
    statusLanguages: "世界の言語",
    statusCoding: "コード演習",
    statusRoadmaps: "ロードマップ",
    navSearch: "検索",
    navTools: "ツール",
    navLanguages: "言語",
    navCoding: "コード",
    navRoadmap: "ロードマップ",
    navLogin: "ログイン",
    navLogout: "ログアウト",
    heroEyebrow: "AI ツール & コードラボ",
    heroText: "初心者と個人開発者向けの AI ツールとコード練習プラットフォームです。より明確なプロンプト、速いコード理解、体系的な練習ルートで学習と開発を進めます。",
    search: "検索",
    startToday: "今日から",
    aiTools: "AI ツール",
    myWordbook: "単語帳",
    coding: "コード",
    languages: "言語",
    searchPlaceholder: "ツール コード プロンプト Python 正規表現",
    focus: "集中",
    ready: "準備完了",
    globalSetup: "全言語設定",
    allLanguageHome: "全言語ホーム",
    paths: "パス",
    families: "語族",
    openMap: "地図を開く",
    familyTitle: "語族",
    all: "すべて",
    worldLanguages: "世界の言語",
    chooseAnyPath: "好きなパスを選択",
    viewPaths: "パスを見る",
  },
  korean: {
    versionLabel: "한국어",
    statusSearch: "검색",
    statusTools: "AI 도구",
    statusLanguages: "세계 언어",
    statusCoding: "코딩 랩",
    statusRoadmaps: "로드맵",
    navSearch: "검색",
    navTools: "도구",
    navLanguages: "언어",
    navCoding: "코딩",
    navRoadmap: "로드맵",
    navLogin: "로그인",
    navLogout: "로그아웃",
    heroEyebrow: "AI 도구 & 코딩 랩",
    heroText: "초보 학습자와 독립 개발자를 위한 AI 도구 및 코딩 훈련 플랫폼입니다. 더 명확한 프롬프트, 빠른 코드 이해, 체계적인 연습 경로로 학습과 개발 효율을 높입니다.",
    search: "검색",
    startToday: "오늘 시작",
    aiTools: "AI 도구",
    myWordbook: "내 단어장",
    coding: "코딩",
    languages: "언어",
    searchPlaceholder: "도구 코딩 프롬프트 Python 정규식",
    focus: "집중",
    ready: "준비",
    globalSetup: "전 언어 설정",
    allLanguageHome: "전 언어 홈",
    paths: "경로",
    families: "어족",
    openMap: "지도 열기",
    familyTitle: "어족",
    all: "전체",
    worldLanguages: "세계 언어",
    chooseAnyPath: "경로 선택",
    viewPaths: "경로 보기",
  },
  spanish: {
    versionLabel: "Español",
    statusSearch: "Buscar",
    statusTools: "Herramientas AI",
    statusLanguages: "Idiomas",
    statusCoding: "Código",
    statusRoadmaps: "Rutas",
    navSearch: "Buscar",
    navTools: "Herramientas",
    navLanguages: "Idiomas",
    navCoding: "Código",
    navRoadmap: "Ruta",
    navLogin: "Entrar",
    navLogout: "Salir",
    heroEyebrow: "Herramientas AI & Laboratorio de código",
    heroText: "Una plataforma de herramientas AI y práctica de código para principiantes y desarrolladores independientes. Mejora cómo aprendes y construyes con prompts más claros, lectura de código más rápida y rutas prácticas.",
    search: "Buscar",
    startToday: "Empezar hoy",
    aiTools: "Herramientas AI",
    myWordbook: "Mi vocabulario",
    coding: "Código",
    languages: "Idiomas",
    searchPlaceholder: "Buscar herramientas código prompts Python regex",
    focus: "Enfoque",
    ready: "Listo",
    globalSetup: "Configuración global de idiomas",
    allLanguageHome: "Inicio de todos los idiomas",
    paths: "rutas",
    families: "familias",
    openMap: "Abrir mapa",
    familyTitle: "Familias",
    all: "Todo",
    worldLanguages: "Idiomas del mundo",
    chooseAnyPath: "Elige una ruta",
    viewPaths: "Ver rutas",
  },
  french: {
    versionLabel: "Français",
    statusSearch: "Recherche",
    statusTools: "Outils IA",
    statusLanguages: "Langues",
    statusCoding: "Code",
    statusRoadmaps: "Parcours",
    navSearch: "Recherche",
    navTools: "Outils",
    navLanguages: "Langues",
    navCoding: "Code",
    navRoadmap: "Parcours",
    navLogin: "Connexion",
    navLogout: "Sortir",
    heroEyebrow: "Outils IA & Laboratoire code",
    heroText: "Une plateforme d outils IA et de pratique du code pour débutants et développeurs indépendants. Apprenez et construisez avec des prompts plus clairs, une lecture de code plus rapide et des parcours structurés.",
    search: "Recherche",
    startToday: "Commencer",
    aiTools: "Outils IA",
    myWordbook: "Mon lexique",
    coding: "Code",
    languages: "Langues",
    searchPlaceholder: "Chercher outils code prompts Python regex",
    focus: "Focus",
    ready: "Prêt",
    globalSetup: "Configuration langues",
    allLanguageHome: "Accueil toutes langues",
    paths: "parcours",
    families: "familles",
    openMap: "Ouvrir carte",
    familyTitle: "Familles",
    all: "Tout",
    worldLanguages: "Langues du monde",
    chooseAnyPath: "Choisir un parcours",
    viewPaths: "Voir parcours",
  },
};

const siteVersionSlugs = ["chinese", "english", "japanese", "korean", "spanish", "french"];

function getHomeCopy(ui: string | undefined) {
  return homeCopy[ui ?? ""] ?? homeCopy.english;
}

function getSelectedUi(rawUi: string | string[] | undefined) {
  const ui = Array.isArray(rawUi) ? rawUi[0] : rawUi;
  return ui && siteVersionSlugs.includes(ui) ? ui : "english";
}

function homeHref(ui: string) {
  return ui === "english" ? "/" : `/?ui=${ui}`;
}

const sectionCopy = {
  english: {
    englishTraining: "English training",
    aiToolsTitle: "AI Tools",
    aiToolsHeading: "Six practical tools",
    viewAll: "View all",
    codingLabTitle: "Coding Lab",
    codingHeading: "Start with one language",
    directTitle: "Direct Links",
    directHeading: "Frequently used study doors",
    dashboard: "Dashboard",
    signIn: "Sign in",
  },
  chinese: {
    englishTraining: "英语训练",
    aiToolsTitle: "AI 工具",
    aiToolsHeading: "六个实用工具",
    viewAll: "查看全部",
    codingLabTitle: "编程实验室",
    codingHeading: "从一门语言开始",
    directTitle: "直达入口",
    directHeading: "常用学习入口",
    dashboard: "学习面板",
    signIn: "登录",
  },
  japanese: {
    englishTraining: "英語トレーニング",
    aiToolsTitle: "AI ツール",
    aiToolsHeading: "6 つの実用ツール",
    viewAll: "すべて見る",
    codingLabTitle: "コードラボ",
    codingHeading: "一つの言語から始める",
    directTitle: "ショートカット",
    directHeading: "よく使う学習入口",
    dashboard: "ダッシュボード",
    signIn: "ログイン",
  },
  korean: {
    englishTraining: "영어 훈련",
    aiToolsTitle: "AI 도구",
    aiToolsHeading: "실용 도구 6개",
    viewAll: "전체 보기",
    codingLabTitle: "코딩 랩",
    codingHeading: "한 언어부터 시작",
    directTitle: "바로가기",
    directHeading: "자주 쓰는 학습 입구",
    dashboard: "대시보드",
    signIn: "로그인",
  },
  spanish: {
    englishTraining: "Entrenamiento de inglés",
    aiToolsTitle: "Herramientas AI",
    aiToolsHeading: "Seis herramientas prácticas",
    viewAll: "Ver todo",
    codingLabTitle: "Laboratorio de código",
    codingHeading: "Empieza con un lenguaje",
    directTitle: "Accesos directos",
    directHeading: "Entradas de estudio frecuentes",
    dashboard: "Panel",
    signIn: "Entrar",
  },
  french: {
    englishTraining: "Entraînement anglais",
    aiToolsTitle: "Outils IA",
    aiToolsHeading: "Six outils pratiques",
    viewAll: "Tout voir",
    codingLabTitle: "Laboratoire code",
    codingHeading: "Commencer par un langage",
    directTitle: "Accès directs",
    directHeading: "Entrées d étude fréquentes",
    dashboard: "Tableau",
    signIn: "Connexion",
  },
} satisfies Record<string, Record<string, string>>;

type ProductCard = {
  title: string;
  href: string;
  eyebrow: string;
  body: string;
  points: string[];
};

const productCards: Record<string, ProductCard[]> = {
  english: [
  {
    title: "Roadmap",
    href: "/tools/learning-roadmap",
    eyebrow: "Plan",
    body: "Generate a practical 30 day path for zero base frontend Python automation or indie MVP work.",
    points: ["30 days", "Milestones", "Project"],
  },
  {
    title: "AI Tools",
    href: "/tools",
    eyebrow: "Core",
    body: "Prompt polish code explanation bug diagnosis API requests and developer utilities.",
    points: ["Prompt", "Code", "Bug"],
  },
  {
    title: "Coding",
    href: "/programming",
    eyebrow: "Practice",
    body: "Zero foundation programming paths with tutorials drills hints and answers.",
    points: ["Python", "JavaScript", "C++"],
  },
  {
    title: "English",
    href: "/english?lang=zh",
    eyebrow: "Training",
    body: "Vocabulary typing reading grammar question bank and personal wordbook.",
    points: ["Typing", "Wordbook", "Review"],
  },
  {
    title: "World Languages",
    href: "/languages",
    eyebrow: "Zero",
    body: "Sound script first phrases sentence slots and daily review for world languages.",
    points: ["Sound", "Script", "Review"],
  },
  ],
  chinese: [
    { title: "学习路线", href: "/tools/learning-roadmap", eyebrow: "计划", body: "为零基础 前端 Python 自动化 独立开发生成可执行的 30 天路线", points: ["30 天", "里程碑", "小项目"] },
    { title: "AI 工具", href: "/tools", eyebrow: "核心", body: "提示词优化 代码解释 Bug 定位 API 请求和开发工具", points: ["提示词", "代码", "Bug"] },
    { title: "编程", href: "/programming", eyebrow: "练习", body: "零基础编程路径 教程 练习 提示和答案", points: ["Python", "JavaScript", "C++"] },
    { title: "英语", href: "/english?lang=zh", eyebrow: "训练", body: "词汇 打字 阅读 语法 题库和个人词书", points: ["打字", "词书", "复习"] },
    { title: "世界语言", href: "/languages", eyebrow: "零基础", body: "先听音 再认字 用短句和复习建立语言入口", points: ["听音", "文字", "复习"] },
  ],
  japanese: [
    { title: "ロードマップ", href: "/tools/learning-roadmap", eyebrow: "計画", body: "ゼロベース フロントエンド Python 自動化 個人開発の 30 日計画", points: ["30日", "節目", "小项目"] },
    { title: "AI ツール", href: "/tools", eyebrow: "中核", body: "プロンプト改善 コード説明 バグ分析 API 生成と開発ツール", points: ["Prompt", "Code", "Bug"] },
    { title: "コード", href: "/programming", eyebrow: "演習", body: "ゼロから学ぶプログラミングの道筋と演習", points: ["Python", "JavaScript", "C++"] },
    { title: "英語", href: "/english?lang=zh", eyebrow: "訓練", body: "語彙 タイピング 読解 文法 問題集と単語帳", points: ["Typing", "単語帳", "復習"] },
    { title: "世界の言語", href: "/languages", eyebrow: "ゼロ", body: "音 文字 文型 復習から言語を始めます", points: ["音", "文字", "復習"] },
  ],
  korean: [
    { title: "로드맵", href: "/tools/learning-roadmap", eyebrow: "계획", body: "제로 베이스 프론트엔드 Python 자동화 독립 개발 30일 경로", points: ["30일", "마일스톤", "작은 프로젝트"] },
    { title: "AI 도구", href: "/tools", eyebrow: "핵심", body: "프롬프트 개선 코드 설명 버그 분석 API 요청 도구", points: ["Prompt", "Code", "Bug"] },
    { title: "코딩", href: "/programming", eyebrow: "연습", body: "제로 베이스 코딩 경로 튜토리얼 훈련 힌트 답안", points: ["Python", "JavaScript", "C++"] },
    { title: "영어", href: "/english?lang=zh", eyebrow: "훈련", body: "어휘 타이핑 읽기 문법 문제은행 개인 단어장", points: ["Typing", "단어장", "복습"] },
    { title: "세계 언어", href: "/languages", eyebrow: "제로", body: "소리 문자 문장 복습으로 언어를 시작합니다", points: ["소리", "문자", "복습"] },
  ],
  spanish: [
    { title: "Ruta", href: "/tools/learning-roadmap", eyebrow: "Plan", body: "Crea una ruta de 30 días para base cero frontend Python automatización o MVP", points: ["30 días", "Hitos", "Proyecto"] },
    { title: "Herramientas AI", href: "/tools", eyebrow: "Núcleo", body: "Prompt código bugs API y utilidades de desarrollo", points: ["Prompt", "Código", "Bug"] },
    { title: "Código", href: "/programming", eyebrow: "Práctica", body: "Rutas de programación desde cero con ejercicios y pistas", points: ["Python", "JavaScript", "C++"] },
    { title: "Inglés", href: "/english?lang=zh", eyebrow: "Entreno", body: "Vocabulario typing lectura gramática preguntas y lexicon personal", points: ["Typing", "Lexicon", "Repaso"] },
    { title: "Idiomas", href: "/languages", eyebrow: "Cero", body: "Sonido escritura frases y repaso para empezar idiomas", points: ["Sonido", "Escritura", "Repaso"] },
  ],
  french: [
    { title: "Parcours", href: "/tools/learning-roadmap", eyebrow: "Plan", body: "Créer un plan de 30 jours pour débutant frontend Python automatisation ou MVP", points: ["30 jours", "Étapes", "Projet"] },
    { title: "Outils IA", href: "/tools", eyebrow: "Noyau", body: "Prompt code bug API et outils de développement", points: ["Prompt", "Code", "Bug"] },
    { title: "Code", href: "/programming", eyebrow: "Pratique", body: "Parcours programmation depuis zéro avec exercices et indices", points: ["Python", "JavaScript", "C++"] },
    { title: "Anglais", href: "/english?lang=zh", eyebrow: "Entraînement", body: "Vocabulaire typing lecture grammaire questions et lexique", points: ["Typing", "Lexique", "Révision"] },
    { title: "Langues", href: "/languages", eyebrow: "Zéro", body: "Son écriture phrases et révision pour commencer les langues", points: ["Son", "Écriture", "Révision"] },
  ],
};

function getSectionCopy(ui: string) {
  return sectionCopy[ui as keyof typeof sectionCopy] ?? sectionCopy.english;
}

function getProductCards(ui: string) {
  return productCards[ui as keyof typeof productCards] ?? productCards.english;
}

const featuredCodingSlugs = ["python", "javascript", "typescript", "cpp", "sql", "bash"];
const featuredCodingTracks = programmingLanguages.filter((language) =>
  featuredCodingSlugs.includes(language.slug)
);

const homeWorldSlugs = [
  "english",
  "chinese",
  "japanese",
  "korean",
  "spanish",
  "french",
  "arabic",
  "german",
  "russian",
  "portuguese",
  "thai",
  "vietnamese",
];
const homeWorldTracks = worldLanguages.filter((language) => homeWorldSlugs.includes(language.slug));
const homeWorldFamilies = worldLanguageFamilies.map((family) => ({
  family,
  count: worldLanguages.filter((language) => language.family === family).length,
}));

const quietLinks = {
  english: [
    { href: "/english/vocabulary/custom?lang=zh", label: "My Wordbook", meta: "Import tag train" },
    { href: "/english/typing?lang=zh", label: "English Typing", meta: "Listen type retry" },
    { href: "/english/question-bank?lang=zh", label: "English Questions", meta: "Choice fill blank" },
    { href: "/cpp/quiz/mega-1000", label: "C++ Bank", meta: "Classified drills" },
    { href: "/wrong", label: "Review", meta: "Saved mistakes" },
    { href: "/dashboard", label: "Dashboard", meta: "Progress panel" },
  ],
  chinese: [
    { href: "/english/vocabulary/custom?lang=zh", label: "我的词书", meta: "导入 标记 训练" },
    { href: "/english/typing?lang=zh", label: "英语打字", meta: "听音 输入 重试" },
    { href: "/english/question-bank?lang=zh", label: "英语题库", meta: "选择 填空" },
    { href: "/cpp/quiz/mega-1000", label: "C++ 题库", meta: "分类训练" },
    { href: "/wrong", label: "复习", meta: "保存错题" },
    { href: "/dashboard", label: "学习面板", meta: "进度面板" },
  ],
  japanese: [
    { href: "/english/vocabulary/custom?lang=zh", label: "単語帳", meta: "取込 タグ 練習" },
    { href: "/english/typing?lang=zh", label: "英語タイピング", meta: "聞く 入力 やり直し" },
    { href: "/english/question-bank?lang=zh", label: "英語問題", meta: "選択 穴埋め" },
    { href: "/cpp/quiz/mega-1000", label: "C++ 問題集", meta: "分類演習" },
    { href: "/wrong", label: "復習", meta: "保存ミス" },
    { href: "/dashboard", label: "ダッシュボード", meta: "進捗パネル" },
  ],
  korean: [
    { href: "/english/vocabulary/custom?lang=zh", label: "내 단어장", meta: "가져오기 태그 훈련" },
    { href: "/english/typing?lang=zh", label: "영어 타이핑", meta: "듣기 입력 재시도" },
    { href: "/english/question-bank?lang=zh", label: "영어 문제", meta: "선택 빈칸" },
    { href: "/cpp/quiz/mega-1000", label: "C++ 문제은행", meta: "분류 훈련" },
    { href: "/wrong", label: "복습", meta: "오답 저장" },
    { href: "/dashboard", label: "대시보드", meta: "진행 패널" },
  ],
  spanish: [
    { href: "/english/vocabulary/custom?lang=zh", label: "Mi vocabulario", meta: "Importar etiquetar entrenar" },
    { href: "/english/typing?lang=zh", label: "Typing inglés", meta: "Escuchar escribir repetir" },
    { href: "/english/question-bank?lang=zh", label: "Preguntas inglés", meta: "Opción huecos" },
    { href: "/cpp/quiz/mega-1000", label: "Banco C++", meta: "Práctica clasificada" },
    { href: "/wrong", label: "Repaso", meta: "Errores guardados" },
    { href: "/dashboard", label: "Panel", meta: "Progreso" },
  ],
  french: [
    { href: "/english/vocabulary/custom?lang=zh", label: "Mon lexique", meta: "Importer tag entraîner" },
    { href: "/english/typing?lang=zh", label: "Typing anglais", meta: "Écouter taper refaire" },
    { href: "/english/question-bank?lang=zh", label: "Questions anglais", meta: "Choix trous" },
    { href: "/cpp/quiz/mega-1000", label: "Banque C++", meta: "Exercices classés" },
    { href: "/wrong", label: "Révision", meta: "Erreurs sauvées" },
    { href: "/dashboard", label: "Tableau", meta: "Progression" },
  ],
};

function getQuietLinks(ui: string) {
  return quietLinks[ui as keyof typeof quietLinks] ?? quietLinks.english;
}

const starterPlanCopy = {
  english: [
    ["Hear the sound", "Start with greeting thanks and self introduction before grammar"],
    ["Meet the script", "For non Latin scripts learn the writing system early"],
    ["Use whole sentences", "Put every word inside a sentence instead of memorizing alone"],
    ["Short frequent review", "Ten minutes daily beats one long weekend session"],
  ],
  chinese: [
    ["先听音", "先掌握问候 感谢 自我介绍 不急着背语法"],
    ["再认字", "非拉丁文字先认字母或文字系统"],
    ["整句输入", "每个词都放进句子里练 不孤立背词"],
    ["短频复习", "每天 10 分钟比周末一次更稳"],
  ],
  japanese: [
    ["まず音を聞く", "挨拶 感謝 自己紹介から始めて文法を急ぎません"],
    ["文字を見る", "ラテン文字以外は早めに文字体系を覚えます"],
    ["文で使う", "単語だけでなく文の中で練習します"],
    ["短く復習", "毎日 10 分の方が長い一回より安定します"],
  ],
  korean: [
    ["먼저 소리", "인사 감사 자기소개부터 시작하고 문법은 서두르지 않습니다"],
    ["문자 익히기", "라틴 문자가 아니면 문자 체계를 먼저 익힙니다"],
    ["문장으로 사용", "단어만 외우지 말고 문장 안에서 연습합니다"],
    ["짧게 자주 복습", "매일 10분이 긴 한 번보다 안정적입니다"],
  ],
  spanish: [
    ["Escuchar primero", "Empieza con saludo gracias y presentación antes de gramática"],
    ["Ver la escritura", "En alfabetos no latinos aprende pronto el sistema de escritura"],
    ["Usar frases", "Practica cada palabra dentro de una frase"],
    ["Repaso corto", "Diez minutos diarios sostienen mejor el hábito"],
  ],
  french: [
    ["Écouter d abord", "Commencer par saluer remercier et se présenter avant la grammaire"],
    ["Voir l écriture", "Pour les écritures non latines apprendre tôt le système"],
    ["Utiliser des phrases", "Mettre chaque mot dans une phrase plutôt que seul"],
    ["Réviser court", "Dix minutes par jour tiennent mieux qu une longue séance"],
  ],
};

function getStarterPlan(ui: string) {
  return starterPlanCopy[ui as keyof typeof starterPlanCopy] ?? starterPlanCopy.english;
}

export default async function HomePage({ searchParams }: { searchParams: HomeSearchParams }) {
  const user = await getServerUser();
  const params = await searchParams;
  const selectedUi = getSelectedUi(params?.ui);
  const copy = getHomeCopy(selectedUi);
  const sections = getSectionCopy(selectedUi);
  const cards = getProductCards(selectedUi);
  const focusedCards = cards.filter((card) => !card.href.startsWith("/english") && !card.href.startsWith("/languages"));
  const directLinks = getQuietLinks(selectedUi);
  const starterPlan = getStarterPlan(selectedUi);
  const showSecondaryLanguageSection = false;

  return (
    <main className="apple-page">
      <div className="study-desk-shell grid min-h-screen grid-cols-[76px_minmax(0,1fr)] gap-3 py-5 sm:grid-cols-[112px_minmax(0,1fr)] lg:grid-cols-[152px_minmax(0,1fr)] lg:gap-4">
        <HomeRail isAdmin={user?.role === "ADMIN"} />

        <section className="min-w-0">
          <TopBar
            copy={copy}
            isAdmin={user?.role === "ADMIN"}
            isSignedIn={Boolean(user)}
            selectedUi={selectedUi}
          />

          <section className="mt-3 dense-panel overflow-hidden p-5 sm:p-6">
            <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-end">
              <div>
                <p className="eyebrow">{copy.heroEyebrow}</p>
                <h1 className="mt-3 max-w-4xl text-3xl font-semibold leading-[1.04] tracking-normal sm:text-4xl lg:text-5xl">
                  VantaAPI
                </h1>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-[color:var(--muted)]">
                  {copy.heroText}
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                  <Link href="/tools" className="dense-action-primary px-4 py-2.5">
                    {copy.aiTools}
                  </Link>
                  <Link href="/programming" className="dense-action px-4 py-2.5">
                    {copy.coding}
                  </Link>
                  <Link href="/tools/learning-roadmap" className="dense-action px-4 py-2.5">
                    {copy.navRoadmap}
                  </Link>
                </div>
                <form action="/search" className="mt-4 flex max-w-2xl flex-col gap-2 rounded-[8px] border border-slate-200 bg-white/80 p-2 sm:flex-row">
                  <input
                    name="q"
                    className="min-h-11 min-w-0 flex-1 rounded-[8px] border border-slate-200 bg-white px-4 text-sm font-semibold outline-none transition focus:border-slate-500"
                    placeholder={copy.searchPlaceholder}
                  />
                  <button className="dense-action-primary px-5 py-2.5" type="submit">
                    {copy.search}
                  </button>
                </form>
              </div>

              <div className="rounded-[8px] border border-slate-200 bg-white/75 p-4">
                <p className="eyebrow">{copy.focus}</p>
                <div className="mt-3 grid gap-2">
                  {[
                    copy.aiTools,
                    copy.statusCoding,
                    copy.statusRoadmaps,
                  ].map((item) => (
                    <span key={item} className="dense-row">
                      <span className="text-sm font-semibold">{item}</span>
                      <span className="text-xs text-[color:var(--muted)]">{copy.ready}</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <QuickStartPanel ui={selectedUi} />

          <section className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {focusedCards.map((card) => (
              <Link key={card.href} href={card.href} className="dense-card p-4 transition hover:-translate-y-0.5 hover:border-slate-300">
                <p className="eyebrow">{card.eyebrow}</p>
                <h2 className="mt-2 text-xl font-semibold">{card.title}</h2>
                <p className="mt-2 min-h-16 text-sm leading-6 text-[color:var(--muted)]">{card.body}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {card.points.map((point) => (
                    <span key={point} className="dense-status">
                      {point}
                    </span>
                  ))}
                </div>
              </Link>
            ))}
          </section>

          {showSecondaryLanguageSection && <section className="mt-3 dense-panel p-5">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="eyebrow">{copy.globalSetup}</p>
                <h2 className="mt-2 text-2xl font-semibold">{copy.allLanguageHome}</h2>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="dense-status">{worldLanguages.length} {copy.paths}</span>
                <span className="dense-status">{worldLanguageFamilies.length} {copy.families}</span>
                <Link href="/languages" className="dense-action-primary">
                  {copy.openMap}
                </Link>
              </div>
            </div>

            <div className="mt-4 grid gap-3 xl:grid-cols-[minmax(260px,0.85fr)_minmax(0,1.3fr)_minmax(240px,0.7fr)]">
              <div className="grid gap-2">
                {starterPlan.map((step, index) => (
                  <Link
                    key={worldLanguageStarterPlan[index]?.id ?? index}
                    href="/languages"
                    className="dense-row items-start gap-3 p-3"
                  >
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-[8px] bg-slate-950 text-xs font-semibold text-white">
                      {index + 1}
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold">{step[0]}</span>
                      <span className="mt-1 block text-xs leading-5 text-[color:var(--muted)]">
                        {step[1]}
                      </span>
                    </span>
                  </Link>
                ))}
              </div>

              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {homeWorldTracks.map((language) => (
                  <Link key={language.slug} href={`/languages/${language.slug}`} className="dense-mini">
                    <span className="flex items-center justify-between gap-2">
                      <span className="truncate font-semibold">{language.name}</span>
                      <span className="shrink-0 text-[10px] uppercase tracking-normal text-[color:var(--muted)]">
                        {language.script}
                      </span>
                    </span>
                    <span className="truncate text-[color:var(--muted)]">{language.nativeName}</span>
                  </Link>
                ))}
              </div>

              <div className="rounded-[8px] border border-slate-200 bg-white/75 p-3">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <p className="eyebrow">{copy.familyTitle}</p>
                  <Link href="/languages" className="text-xs font-semibold text-slate-700">
                    {copy.all}
                  </Link>
                </div>
                <div className="grid gap-2">
                  {homeWorldFamilies.slice(0, 8).map((item) => (
                    <Link key={item.family} href="/languages" className="dense-row">
                      <span className="truncate text-sm font-semibold">{item.family}</span>
                      <span className="text-xs text-[color:var(--muted)]">{item.count}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </section>}

          <section className="mt-3 grid gap-3 xl:grid-cols-[minmax(0,1fr)_minmax(320px,0.9fr)]">
            <div className="dense-panel p-5">
              <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
                <div>
                  <p className="eyebrow">{sections.aiToolsTitle}</p>
                  <h2 className="mt-2 text-2xl font-semibold">{sections.aiToolsHeading}</h2>
                </div>
                <Link href="/tools" className="dense-action-primary">
                  {sections.viewAll}
                </Link>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                {toolDefinitions.map((tool) => (
                  <Link key={tool.slug} href={`/tools/${tool.slug}`} className="dense-mini">
                    <span className="font-semibold">{tool.title}</span>
                    <span className="truncate text-[color:var(--muted)]">{tool.description}</span>
                  </Link>
                ))}
              </div>
            </div>

            <div className="dense-panel dense-grid-bg p-5">
              <div className="mb-4">
                <p className="eyebrow text-slate-400">{sections.codingLabTitle}</p>
                <h2 className="mt-2 text-2xl font-semibold text-white">{sections.codingHeading}</h2>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                {featuredCodingTracks.map((language) => (
                  <Link
                    key={language.slug}
                    href={`/programming/${language.slug}`}
                    className="rounded-[8px] border border-white/10 bg-white/[0.07] p-3 text-white transition hover:border-sky-200/50"
                  >
                    <p className="text-sm font-semibold">{language.shortTitle}</p>
                    <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-300">{language.role}</p>
                  </Link>
                ))}
              </div>
            </div>
          </section>

          <section className="mt-3 dense-panel p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="eyebrow">{sections.directTitle}</p>
                <h2 className="mt-2 text-xl font-semibold">{sections.directHeading}</h2>
              </div>
              {user ? (
                <Link href="/dashboard" className="dense-action">
                  {sections.dashboard}
                </Link>
              ) : (
                <Link href="/login" className="dense-action">
                  {sections.signIn}
                </Link>
              )}
            </div>
            <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {directLinks.map((item) => (
                <Link key={item.href} href={item.href} className="dense-row">
                  <span className="text-sm font-semibold">{item.label}</span>
                  <span className="truncate text-xs text-[color:var(--muted)]">{item.meta}</span>
                </Link>
              ))}
            </div>
          </section>
        </section>
      </div>
    </main>
  );
}

function HomeRail({ isAdmin }: { isAdmin: boolean }) {
  const items = isAdmin ? [...railItems, { href: "/admin", code: "A", label: "Admin" }] : railItems;

  return (
    <aside className="study-rail sticky top-5 flex h-[calc(100vh-40px)] flex-col p-2">
      <Link href="/" className="mb-3 flex items-center gap-2 rounded-[8px] px-2 py-2">
        <span className="grid h-8 w-8 place-items-center rounded-[8px] bg-slate-950 text-[10px] font-semibold text-white">VA</span>
        <span className="hidden text-sm font-semibold leading-tight sm:block">VantaAPI</span>
      </Link>

      <nav className="grid gap-1">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`rail-link ${item.href === "/" ? "rail-link-active" : ""}`}
          >
            <span className="grid h-7 w-7 place-items-center rounded-[8px] bg-white/70 text-xs font-semibold text-slate-700">
              {item.code}
            </span>
            <span className="hidden text-xs font-semibold sm:inline lg:text-sm">{item.label}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
}

function TopBar({
  copy,
  isAdmin,
  isSignedIn,
  selectedUi,
}: {
  copy: HomeCopy;
  isAdmin: boolean;
  isSignedIn: boolean;
  selectedUi: string;
}) {
  return (
    <header className="dense-panel flex flex-wrap items-center justify-between gap-3 px-4 py-3">
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="dense-status">VantaAPI</span>
        <span className="dense-status">{copy.statusSearch}</span>
        <span className="dense-status">{copy.statusTools}</span>
        <span className="dense-status">{copy.statusCoding}</span>
        <span className="dense-status">{copy.statusRoadmaps}</span>
        {isAdmin && <span className="dense-status">Admin</span>}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <SiteVersionMenu selectedUi={selectedUi} />
        <Link href="/search" className="dense-action-primary">{copy.navSearch}</Link>
        <Link href="/tools" className="dense-action">{copy.navTools}</Link>
        <Link href="/programming" className="dense-action">{copy.navCoding}</Link>
        <Link href="/tools/learning-roadmap" className="dense-action">{copy.navRoadmap}</Link>
        {isSignedIn ? (
          <form action="/api/auth/logout" method="post">
            <button className="dense-action">{copy.navLogout}</button>
          </form>
        ) : (
          <Link href="/login" className="dense-action">{copy.navLogin}</Link>
        )}
      </div>
    </header>
  );
}

function SiteVersionMenu({ selectedUi }: { selectedUi: string }) {
  const selectedLanguage = worldLanguages.find((language) => language.slug === selectedUi) ?? worldLanguages[0];
  const supportedVersions = worldLanguages.filter((language) => siteVersionSlugs.includes(language.slug));

  return (
    <details className="home-language-menu home-version-menu">
      <summary aria-label="Open site language version switcher">
        <span>Version</span>
        <strong>{selectedLanguage.nativeName}</strong>
      </summary>
      <div className="home-language-popover">
        <div className="home-language-popover-head">
          <span>Site Versions</span>
          <Link href={homeHref("chinese")}>中文</Link>
        </div>
        <div className="home-language-featured">
          {supportedVersions.map((language) => (
            <Link key={language.slug} href={homeHref(language.slug)}>
              <span>{language.nativeName}</span>
              <small>{language.name}</small>
            </Link>
          ))}
        </div>
      </div>
    </details>
  );
}
