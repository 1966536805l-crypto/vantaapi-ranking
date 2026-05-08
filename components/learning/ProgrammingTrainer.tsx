"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useMemo, useRef, useState, useEffect } from "react";
import FlagLanguageToggle from "@/components/layout/FlagLanguageToggle";
import AICoachPanel from "@/components/learning/AICoachPanel";
import LearningFullscreenButton from "@/components/learning/LearningFullscreenButton";
import { bilingualLanguage, localizedHref, type InterfaceLanguage } from "@/lib/language";
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

type ProgrammingCopyType = {
  brand: string;
  languages: string;
  queue: string;
  expanding: string;
  zeroBase: string;
  session: string;
  correct: string;
  answered: string;
  workspace: string;
  nextUnsolved: string;
  reset: string;
  resetConfirm: (language: string) => string;
  statusSolved: string;
  statusReview: string;
  statusDraft: string;
  statusNew: string;
  question: string;
  questionPalette: string;
  prev: string;
  next: string;
  submit: string;
  run: string;
  hint: string;
  answer: string;
  correctMessage: string;
  notYetMessage: string;
  wrongNote: string;
  codePlaceholder: string;
  fillPlaceholder: string;
  inspector: string;
  feedback: string;
  typingFirst: string;
  vimReview: string;
  runOutput: string;
  runEmpty: string;
  hints: string;
  hintEmpty: string;
  answerEmpty: string;
  shortcuts: string;
  shortcutItems: string[];
  vimShortcut: string;
  coachTitle: string;
  coachSubtitle: string;
  coachPlaceholder: string;
  coachPrompts: string[];
  reference: string;
  patternsFor: (fileName: string) => string;
  showOutput: string;
  hideOutput: string;
  output: string;
  tracks: {
    choice: { label: string; shortLabel: string };
    fill: { label: string; shortLabel: string };
    practical: { label: string; shortLabel: string };
  };
  roleFallback: (role: string) => string;
};

const baseProgrammingCopy: Record<"en" | "zh", ProgrammingCopyType> = {
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
};

const programmingCopy: Record<InterfaceLanguage, ProgrammingCopyType> = {
  en: baseProgrammingCopy.en,
  zh: baseProgrammingCopy.zh,
  ja: {
    brand: "コード練習",
    languages: "言語",
    queue: "キュー",
    expanding: "拡張中",
    zeroBase: "ゼロベース",
    session: "セッション",
    correct: "正解",
    answered: "回答済み",
    workspace: "ワークスペース",
    nextUnsolved: "次の未解決",
    reset: "リセット",
    resetConfirm: (language: string) => `${language} の練習状態をリセットしますか？`,
    statusSolved: "解決済み",
    statusReview: "復習",
    statusDraft: "下書き",
    statusNew: "新規",
    question: "問題",
    questionPalette: "問題パレット",
    prev: "前へ",
    next: "次へ",
    submit: "提出",
    run: "実行",
    hint: "ヒント",
    answer: "答え",
    correctMessage: "正解",
    notYetMessage: "まだです。ヒントを確認するか答えと比較してください。",
    wrongNote: "ヒントは一度試した後に表示されます。",
    codePlaceholder: "ここにコードを入力",
    fillPlaceholder: "答えを入力",
    inspector: "インスペクター",
    feedback: "フィードバック",
    typingFirst: "タイピング優先",
    vimReview: "Vim 復習",
    runOutput: "実行結果",
    runEmpty: "実行はサンプル出力または必要な部分をチェックします。",
    hints: "ヒント",
    hintEmpty: "まず一度試してください。必要ならヒントを開きます。",
    answerEmpty: "答えは自分の作業と比較したいときに使います。",
    shortcuts: "ショートカット",
    shortcutItems: ["Ctrl Enter 提出", "Alt R 実行", "Alt H ヒント", "Alt A 答え", "Alt 矢印 移動", "1 2 3 4 選択"],
    vimShortcut: "J K 移動",
    coachTitle: "プログラミング コンパニオン",
    coachSubtitle: "一度に一つのヒント。現在の問題、答え、言語コンテキストを読みます。",
    coachPlaceholder: "ヒント、バグチェック、説明、または次のドリルを依頼",
    coachPrompts: ["ヒントを一つ", "概念を説明", "答えをチェック", "小さなドリルを作成"],
    reference: "参考",
    patternsFor: (fileName: string) => `${fileName} のパターン`,
    showOutput: "出力を表示",
    hideOutput: "出力を隠す",
    output: "出力",
    tracks: {
      choice: { label: "選択問題", shortLabel: "選択" },
      fill: { label: "穴埋め", shortLabel: "穴埋め" },
      practical: { label: "実践", shortLabel: "実践" },
    },
    roleFallback: (role: string) => role,
  },
  ko: {
    brand: "코드 연습",
    languages: "언어",
    queue: "큐",
    expanding: "확장 중",
    zeroBase: "제로 베이스",
    session: "세션",
    correct: "정답",
    answered: "답변함",
    workspace: "작업 공간",
    nextUnsolved: "다음 미해결",
    reset: "초기화",
    resetConfirm: (language: string) => `${language} 연습 상태를 초기화하시겠습니까?`,
    statusSolved: "해결됨",
    statusReview: "복습",
    statusDraft: "초안",
    statusNew: "새로운",
    question: "문제",
    questionPalette: "문제 팔레트",
    prev: "이전",
    next: "다음",
    submit: "제출",
    run: "실행",
    hint: "힌트",
    answer: "답",
    correctMessage: "정답",
    notYetMessage: "아직 아닙니다. 힌트를 확인하거나 답과 비교하세요.",
    wrongNote: "힌트는 한 번 시도한 후에 표시됩니다.",
    codePlaceholder: "여기에 코드 입력",
    fillPlaceholder: "답 입력",
    inspector: "검사기",
    feedback: "피드백",
    typingFirst: "타이핑 우선",
    vimReview: "Vim 복습",
    runOutput: "실행 결과",
    runEmpty: "실행은 샘플 출력 또는 필요한 부분을 확인합니다.",
    hints: "힌트",
    hintEmpty: "먼저 한 번 시도하세요. 필요하면 힌트를 엽니다.",
    answerEmpty: "답은 자신의 작업과 비교하고 싶을 때 사용합니다.",
    shortcuts: "단축키",
    shortcutItems: ["Ctrl Enter 제출", "Alt R 실행", "Alt H 힌트", "Alt A 답", "Alt 화살표 이동", "1 2 3 4 선택"],
    vimShortcut: "J K 이동",
    coachTitle: "프로그래밍 동반자",
    coachSubtitle: "한 번에 하나의 힌트. 현재 문제, 답, 언어 컨텍스트를 읽습니다.",
    coachPlaceholder: "힌트, 버그 체크, 설명 또는 다음 드릴 요청",
    coachPrompts: ["힌트 하나", "개념 설명", "답 확인", "작은 드릴 만들기"],
    reference: "참고",
    patternsFor: (fileName: string) => `${fileName} 패턴`,
    showOutput: "출력 표시",
    hideOutput: "출력 숨기기",
    output: "출력",
    tracks: {
      choice: { label: "선택 문제", shortLabel: "선택" },
      fill: { label: "빈칸 채우기", shortLabel: "빈칸" },
      practical: { label: "실습", shortLabel: "실습" },
    },
    roleFallback: (role: string) => role,
  },
  es: {
    brand: "Práctica de código",
    languages: "Lenguajes",
    queue: "Cola",
    expanding: "en expansión",
    zeroBase: "desde cero",
    session: "sesión",
    correct: "correctas",
    answered: "respondidas",
    workspace: "espacio de trabajo",
    nextUnsolved: "siguiente sin resolver",
    reset: "reiniciar",
    resetConfirm: (language: string) => `¿Reiniciar el progreso de ${language}?`,
    statusSolved: "resuelto",
    statusReview: "repasar",
    statusDraft: "borrador",
    statusNew: "nuevo",
    question: "pregunta",
    questionPalette: "paleta de preguntas",
    prev: "anterior",
    next: "siguiente",
    submit: "enviar",
    run: "probar",
    hint: "pista",
    answer: "respuesta",
    correctMessage: "correcto",
    notYetMessage: "todavía no. Prueba una pista o compara con la respuesta.",
    wrongNote: "las pistas se abren después de intentarlo.",
    codePlaceholder: "escribe tu código aquí",
    fillPlaceholder: "escribe la respuesta",
    inspector: "inspector",
    feedback: "retroalimentación",
    typingFirst: "tecleo primero",
    vimReview: "repaso Vim",
    runOutput: "salida de prueba",
    runEmpty: "la prueba revisa la salida de ejemplo o las partes requeridas.",
    hints: "pistas",
    hintEmpty: "intenta una vez. Luego abre una pista si la necesitas.",
    answerEmpty: "usa la respuesta solo para comparar tu trabajo.",
    shortcuts: "atajos",
    shortcutItems: ["Ctrl Enter enviar", "Alt R probar", "Alt H pista", "Alt A respuesta", "Alt flecha mover", "1 2 3 4 elegir"],
    vimShortcut: "J K mover",
    coachTitle: "Compañero de programación",
    coachSubtitle: "Una pista a la vez. Lee la pregunta, tu respuesta y el contexto del lenguaje.",
    coachPlaceholder: "pide una pista, revisión de bug, explicación o siguiente ejercicio",
    coachPrompts: ["Dame una pista", "Explica el concepto", "Revisa mi respuesta", "Crea un mini ejercicio"],
    reference: "referencia",
    patternsFor: (fileName: string) => `patrones para ${fileName}`,
    showOutput: "mostrar salida",
    hideOutput: "ocultar salida",
    output: "salida",
    tracks: {
      choice: { label: "opción múltiple", shortLabel: "opción" },
      fill: { label: "rellenar hueco", shortLabel: "rellenar" },
      practical: { label: "práctica", shortLabel: "práctica" },
    },
    roleFallback: (role: string) => role,
  },
  fr: baseProgrammingCopy.en,
  de: baseProgrammingCopy.en,
  pt: baseProgrammingCopy.en,
  ru: baseProgrammingCopy.en,
  ar: {
    brand: "تدريب البرمجة",
    languages: "اللغات",
    queue: "قائمة التدريب",
    expanding: "يتوسع",
    zeroBase: "من الصفر",
    session: "الجلسة",
    correct: "صحيح",
    answered: "مجابة",
    workspace: "مساحة العمل",
    nextUnsolved: "التالي غير المحلول",
    reset: "إعادة ضبط",
    resetConfirm: (language: string) => `هل تريد إعادة ضبط تدريب ${language}؟`,
    statusSolved: "محلول",
    statusReview: "مراجعة",
    statusDraft: "مسودة",
    statusNew: "جديد",
    question: "السؤال",
    questionPalette: "لوحة الأسئلة",
    prev: "السابق",
    next: "التالي",
    submit: "إرسال",
    run: "اختبار",
    hint: "تلميح",
    answer: "الإجابة",
    correctMessage: "صحيح",
    notYetMessage: "ليس بعد. جرّب تلميحا أو قارن بالإجابة.",
    wrongNote: "تظهر التلميحات بعد محاولة الحل.",
    codePlaceholder: "اكتب الكود هنا",
    fillPlaceholder: "اكتب الإجابة",
    inspector: "الفاحص",
    feedback: "ملاحظات",
    typingFirst: "الكتابة أولا",
    vimReview: "مراجعة Vim",
    runOutput: "نتيجة الاختبار",
    runEmpty: "الاختبار يفحص ناتج المثال أو الأجزاء المطلوبة.",
    hints: "تلميحات",
    hintEmpty: "حاول مرة واحدة. ثم افتح تلميحا عند الحاجة.",
    answerEmpty: "استخدم الإجابة للمقارنة مع عملك فقط.",
    shortcuts: "اختصارات",
    shortcutItems: ["Ctrl Enter إرسال", "Alt R اختبار", "Alt H تلميح", "Alt A إجابة", "Alt سهم للتنقل", "1 2 3 4 اختيار"],
    vimShortcut: "J K تنقل",
    coachTitle: "مساعد البرمجة",
    coachSubtitle: "تلميح واحد في كل مرة. يقرأ السؤال وإجابتك وسياق اللغة.",
    coachPlaceholder: "اطلب تلميحا أو فحص خطأ أو شرحا أو تمرينا جديدا",
    coachPrompts: ["أعطني تلميحا", "اشرح المفهوم", "افحص إجابتي", "اصنع تمرينا صغيرا"],
    reference: "مرجع",
    patternsFor: (fileName: string) => `أنماط ${fileName}`,
    showOutput: "إظهار الناتج",
    hideOutput: "إخفاء الناتج",
    output: "الناتج",
    tracks: {
      choice: { label: "اختيار من متعدد", shortLabel: "اختيار" },
      fill: { label: "ملء الفراغ", shortLabel: "فراغ" },
      practical: { label: "تطبيق عملي", shortLabel: "عملي" },
    },
    roleFallback: (role: string) => role,
  },
  hi: baseProgrammingCopy.en,
  id: baseProgrammingCopy.en,
  vi: baseProgrammingCopy.en,
  th: baseProgrammingCopy.en,
  tr: baseProgrammingCopy.en,
  it: baseProgrammingCopy.en,
  nl: baseProgrammingCopy.en,
  pl: baseProgrammingCopy.en,
};

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

const languageRoleJa: Partial<Record<ProgrammingLanguageSlug, string>> = {
  javascript: "Web アプリ、自動化、API 連携に使う言語",
  typescript: "大きな JavaScript 製品を型で安全にする言語",
  python: "自動化、データ処理、バックエンド API に使う言語",
  cpp: "性能、システム、アルゴリズムを学ぶための言語",
  java: "バックエンド、Android、企業開発で使う言語",
  go: "クラウドサービス、CLI、並行処理に向く言語",
  rust: "安全性と性能を両立するシステム言語",
  sql: "データを検索、集計、更新するための言語",
  "html-css": "Web ページの構造と見た目を作る基礎",
  bash: "ターミナル操作とファイル処理を自動化する言語",
};

const languageRoleEs: Partial<Record<ProgrammingLanguageSlug, string>> = {
  javascript: "lenguaje para apps web, automatización y APIs",
  typescript: "JavaScript con tipos para productos grandes",
  python: "automatización, datos y APIs de backend",
  cpp: "rendimiento, sistemas, memoria y algoritmos",
  java: "backend, Android y desarrollo empresarial",
  go: "servicios cloud, CLI y concurrencia",
  rust: "sistemas seguros con alto rendimiento",
  sql: "consultar, agregar y actualizar datos",
  "html-css": "estructura visual y estilos de páginas web",
  bash: "automatizar terminal, archivos y despliegues",
};

const languageRoleKo: Partial<Record<ProgrammingLanguageSlug, string>> = {
  javascript: "웹 앱 자동화 API 연결에 쓰는 언어",
  typescript: "큰 JavaScript 제품을 타입으로 안전하게 만드는 언어",
  python: "자동화 데이터 처리 백엔드 API에 쓰는 언어",
  cpp: "성능 시스템 메모리 알고리즘을 배우는 언어",
  java: "백엔드 Android 기업 개발에 쓰는 언어",
  go: "클라우드 서비스 CLI 동시성에 적합한 언어",
  rust: "안전성과 성능을 함께 추구하는 시스템 언어",
  sql: "데이터를 조회 집계 업데이트하는 언어",
  "html-css": "웹 페이지 구조와 스타일을 만드는 기초",
  bash: "터미널 파일 배포 작업을 자동화하는 언어",
};

const languageRoleAr: Partial<Record<ProgrammingLanguageSlug, string>> = {
  javascript: "لغة لتطبيقات الويب والأتمتة وربط الواجهات",
  typescript: "JavaScript مع أنواع لبناء منتجات أكبر",
  python: "للأتمتة والبيانات وواجهات backend",
  cpp: "للأداء والأنظمة والذاكرة والخوارزميات",
  java: "للخوادم و Android والتطبيقات المؤسسية",
  go: "لخدمات السحابة وأدوات CLI والتزامن",
  rust: "لغة أنظمة آمنة وعالية الأداء",
  sql: "للبحث في البيانات وتجميعها وتحديثها",
  "html-css": "لبناء هيكل الصفحة وشكلها",
  bash: "لأتمتة الطرفية والملفات والنشر",
};

const languageHabitZh: Partial<Record<ProgrammingLanguageSlug, string>> = {
  javascript: "先用 console.log 和 DevTools 看清值，再抽象",
  typescript: "让类型错误告诉你缺了哪个数据契约",
  python: "每次转换数据后都打印一次数据形状",
  cpp: "编译前先手动跟踪内存、下标和容器状态",
};

const languageHabitJa: Partial<Record<ProgrammingLanguageSlug, string>> = {
  javascript: "抽象化する前に console.log と DevTools で値を確認する",
  typescript: "型エラーから足りないデータ契約を読む",
  python: "データを変換するたびに形を小さく確認する",
  cpp: "コンパイル前にメモリ、添字、コンテナ状態を手で追う",
};

const languageHabitEs: Partial<Record<ProgrammingLanguageSlug, string>> = {
  javascript: "mira valores con console.log y DevTools antes de abstraer",
  typescript: "deja que los tipos indiquen el contrato que falta",
  python: "comprueba la forma de los datos después de cada transformación",
  cpp: "rastrea memoria, índices y contenedores antes de compilar",
};

const languageHabitKo: Partial<Record<ProgrammingLanguageSlug, string>> = {
  javascript: "추상화 전에 console.log 와 DevTools 로 값을 확인합니다",
  typescript: "타입 오류가 알려주는 빠진 데이터 계약을 읽습니다",
  python: "데이터를 변환할 때마다 형태를 작게 확인합니다",
  cpp: "컴파일 전에 메모리 인덱스 컨테이너 상태를 손으로 추적합니다",
};

const languageHabitAr: Partial<Record<ProgrammingLanguageSlug, string>> = {
  javascript: "افحص القيم عبر console.log و DevTools قبل التجريد",
  typescript: "دع أخطاء الأنواع تكشف عقد البيانات الناقص",
  python: "افحص شكل البيانات بعد كل تحويل",
  cpp: "تتبع الذاكرة والفهارس والحاويات قبل التجميع",
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

const methodI18n: Partial<Record<InterfaceLanguage, {
  title: Record<string, string>;
  body: Record<string, string>;
}>> = {
  zh: { title: methodZh, body: methodBodyZh },
  ja: {
    title: {
      "Recall from memory": "記憶から書く",
      "Trace the code": "コードを追跡",
      "Type it yourself": "自分で入力",
      "Mix topics": "トピックを混ぜる",
      "Hints after trying": "試してからヒント",
      "Build small things": "小さく作る",
    },
    body: {
      "Recall from memory": "小さな概念を見たら閉じて自分で再現します",
      "Trace the code": "実行前に変数の変化を一行ずつ追います",
      "Type it yourself": "コピーを減らし一つずつエラーを直します",
      "Mix topics": "構文 データ構造 デバッグ 小作品を交互に練習します",
      "Hints after trying": "先に自分で試しヒントは一つずつ開きます",
      "Build small things": "知識をスクリプト ページ クエリ ツールに変えます",
    },
  },
  ko: {
    title: {
      "Recall from memory": "기억으로 출력",
      "Trace the code": "코드 추적",
      "Type it yourself": "직접 입력",
      "Mix topics": "주제 섞기",
      "Hints after trying": "시도 후 힌트",
      "Build small things": "작게 만들기",
    },
    body: {
      "Recall from memory": "작은 개념을 본 뒤 닫고 직접 다시 써 봅니다",
      "Trace the code": "실행 전에 변수 변화를 한 줄씩 추적합니다",
      "Type it yourself": "복사를 줄이고 작은 오류를 하나씩 고칩니다",
      "Mix topics": "문법 자료구조 디버깅 작은 프로젝트를 번갈아 연습합니다",
      "Hints after trying": "먼저 직접 시도하고 힌트는 하나씩 엽니다",
      "Build small things": "지식을 스크립트 페이지 쿼리 도구로 바꿉니다",
    },
  },
  es: {
    title: {
      "Recall from memory": "recordar de memoria",
      "Trace the code": "seguir el código",
      "Type it yourself": "escribirlo tú",
      "Mix topics": "mezclar temas",
      "Hints after trying": "pistas después de intentar",
      "Build small things": "crear cosas pequeñas",
    },
    body: {
      "Recall from memory": "mira un concepto pequeño y luego recréalo sin mirar",
      "Trace the code": "antes de ejecutar escribe cómo cambian las variables",
      "Type it yourself": "copia menos y corrige un error pequeño cada vez",
      "Mix topics": "alterna sintaxis estructuras depuración y mini proyectos",
      "Hints after trying": "intenta solo y abre una pista cada vez",
      "Build small things": "convierte cada bloque en script página consulta o herramienta",
    },
  },
  ar: {
    title: {
      "Recall from memory": "استدعاء من الذاكرة",
      "Trace the code": "تتبع الكود",
      "Type it yourself": "اكتبه بنفسك",
      "Mix topics": "اخلط المواضيع",
      "Hints after trying": "تلميحات بعد المحاولة",
      "Build small things": "ابن أشياء صغيرة",
    },
    body: {
      "Recall from memory": "اقرأ فكرة صغيرة ثم أغلقها واكتبها من الذاكرة",
      "Trace the code": "قبل التشغيل اكتب كيف تتغير المتغيرات سطرا بسطر",
      "Type it yourself": "قلل النسخ وأصلح خطأ صغيرا كل مرة",
      "Mix topics": "بدل بين القواعد وهياكل البيانات والتصحيح والمشاريع الصغيرة",
      "Hints after trying": "حاول وحدك أولا ثم افتح تلميحا واحدا",
      "Build small things": "حوّل كل فكرة إلى سكربت أو صفحة أو استعلام أو أداة",
    },
  },
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

function runnerText(question: ProgrammingQuestion, answer: string, language: InterfaceLanguage) {
  const sampleLabel = language === "zh" ? "样例" : language === "ja" ? "サンプル" : language === "ko" ? "샘플" : language === "es" ? "Ejemplo" : language === "ar" ? "مثال" : "Sample";
  const outputLabel = language === "zh" ? "输出" : language === "ja" ? "出力" : language === "ko" ? "출력" : language === "es" ? "Salida" : language === "ar" ? "الناتج" : "Output";

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

  if (language === "ja") {
    return [
      "コードチェック",
      `${found.length}/${question.requiredKeywords.length} 個の必須部分を確認`,
      found.length ? `見つかったもの ${found.join(" ")}` : "まだ重要部分は見つかっていません",
      missing.length ? `不足 ${missing.join(" ")}` : `出力 ${question.runOutput}`,
    ].join("\n");
  }

  if (language === "ko") {
    return [
      "코드 검사",
      `${found.length}/${question.requiredKeywords.length} 필수 부분 확인`,
      found.length ? `찾음 ${found.join(" ")}` : "아직 핵심 부분을 찾지 못했습니다",
      missing.length ? `부족 ${missing.join(" ")}` : `출력 ${question.runOutput}`,
    ].join("\n");
  }

  if (language === "es") {
    return [
      "Revisión de código",
      `${found.length}/${question.requiredKeywords.length} partes requeridas encontradas`,
      found.length ? `Encontrado ${found.join(" ")}` : "todavía no se encontró una parte clave",
      missing.length ? `Falta ${missing.join(" ")}` : `Salida ${question.runOutput}`,
    ].join("\n");
  }

  if (language === "ar") {
    return [
      "فحص الكود",
      `${found.length}/${question.requiredKeywords.length} أجزاء مطلوبة موجودة`,
      found.length ? `تم العثور على ${found.join(" ")}` : "لم يتم العثور على الأجزاء المهمة بعد",
      missing.length ? `ينقص ${missing.join(" ")}` : `الناتج ${question.runOutput}`,
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

function questionTitle(question: ProgrammingQuestion, language: InterfaceLanguage, languageTitle: string) {
  if (language === "en") return question.title;
  if (language === "zh") return `${languageTitle} 第 ${question.index} 题`;
  if (language === "ja") return `${languageTitle} 問題 ${question.index}`;
  if (language === "ko") return `${languageTitle} 문제 ${question.index}`;
  if (language === "es") return `${languageTitle} pregunta ${question.index}`;
  if (language === "ar") return `${languageTitle} السؤال ${question.index}`;
  return `${languageTitle} Question ${question.index}`;
}

function questionPrompt(question: ProgrammingQuestion, language: InterfaceLanguage, languageTitle: string) {
  if (language === "en") return question.prompt;

  const firstLine = question.prompt.split("\n")[0] || question.prompt;

  if (language === "zh") {
    if (question.type === "MULTIPLE_CHOICE") {
      return `${languageTitle} 第 ${question.index} 题 选择和 ${getConcept(question)} 最匹配的说法`;
    }
    if (question.type === "FILL_BLANK") {
      return `${firstLine}\n填出这道 ${languageTitle} 题缺失的部分`;
    }
    return `${firstLine}\n先自己写一遍 出错后再开提示或对照答案`;
  }

  if (language === "ja") {
    if (question.type === "MULTIPLE_CHOICE") {
      return `${languageTitle} 問題 ${question.index} ${getConcept(question)} に最も合う説明を選んでください`;
    }
    if (question.type === "FILL_BLANK") {
      return `${firstLine}\n欠けている部分を埋めてください`;
    }
    return `${firstLine}\n自分で書いてみてください`;
  }

  if (language === "ko") {
    if (question.type === "MULTIPLE_CHOICE") {
      return `${languageTitle} 문제 ${question.index} ${getConcept(question)} 와 가장 일치하는 설명을 선택하세요`;
    }
    if (question.type === "FILL_BLANK") {
      return `${firstLine}\n빠진 부분을 채우세요`;
    }
    return `${firstLine}\n직접 작성해 보세요`;
  }

  if (language === "es") {
    if (question.type === "MULTIPLE_CHOICE") {
      return `${languageTitle} pregunta ${question.index}. Elige la explicación que mejor coincide con ${getConcept(question)}`;
    }
    if (question.type === "FILL_BLANK") {
      return `${firstLine}\nCompleta la parte que falta`;
    }
    return `${firstLine}\nEscribe una solución antes de mirar pistas o respuesta`;
  }

  if (language === "ar") {
    if (question.type === "MULTIPLE_CHOICE") {
      return `${languageTitle} السؤال ${question.index}. اختر الوصف الأقرب إلى ${getConcept(question)}`;
    }
    if (question.type === "FILL_BLANK") {
      return `${firstLine}\nاملأ الجزء الناقص`;
    }
    return `${firstLine}\nاكتب حلا أولا ثم افتح التلميحات أو الإجابة`;
  }

  return question.prompt;
}

function questionHints(question: ProgrammingQuestion, activeRole: string, language: InterfaceLanguage) {
  if (language === "en") return question.hints;

  if (language === "zh") {
    return [
      `先看 ${getConcept(question)} 找出缺的那一块`,
      `保持这个练习习惯 ${activeRole}`,
      `大概率需要 ${question.answer.split("\n")[0]} 答案里应该包含 ${question.requiredKeywords.slice(0, 3).join(" ")}`,
    ];
  }

  if (language === "ja") {
    return [
      `${getConcept(question)} を確認して足りない部分を見つけてください`,
      `この練習習慣を続けてください ${activeRole}`,
      `答えには ${question.requiredKeywords.slice(0, 3).join(" ")} が含まれるはずです`,
    ];
  }

  if (language === "ko") {
    return [
      `${getConcept(question)} 를 확인하고 빠진 부분을 찾으세요`,
      `이 연습 습관을 유지하세요 ${activeRole}`,
      `답에는 ${question.requiredKeywords.slice(0, 3).join(" ")} 가 포함되어야 합니다`,
    ];
  }

  if (language === "es") {
    return [
      `mira ${getConcept(question)} y encuentra la pieza que falta`,
      `mantén este hábito de práctica ${activeRole}`,
      `la respuesta debería incluir ${question.requiredKeywords.slice(0, 3).join(" ")}`,
    ];
  }

  if (language === "ar") {
    return [
      `راجع ${getConcept(question)} وابحث عن الجزء الناقص`,
      `حافظ على عادة التدريب هذه ${activeRole}`,
      `غالبا يجب أن تحتوي الإجابة على ${question.requiredKeywords.slice(0, 3).join(" ")}`,
    ];
  }

  return question.hints;
}

function roleForInterface(activeLanguage: ReturnType<typeof getProgrammingLanguage>, language: InterfaceLanguage) {
  if (language === "zh") return languageRoleZh[activeLanguage.slug] ?? activeLanguage.role;
  if (language === "ja") return languageRoleJa[activeLanguage.slug] ?? activeLanguage.role;
  if (language === "ko") return languageRoleKo[activeLanguage.slug] ?? activeLanguage.role;
  if (language === "es") return languageRoleEs[activeLanguage.slug] ?? activeLanguage.role;
  if (language === "ar") return languageRoleAr[activeLanguage.slug] ?? activeLanguage.role;
  return activeLanguage.role;
}

function habitForInterface(activeLanguage: ReturnType<typeof getProgrammingLanguage>, language: InterfaceLanguage) {
  if (language === "zh") return languageHabitZh[activeLanguage.slug] ?? activeLanguage.dailyHabit;
  if (language === "ja") return languageHabitJa[activeLanguage.slug] ?? activeLanguage.dailyHabit;
  if (language === "ko") return languageHabitKo[activeLanguage.slug] ?? activeLanguage.dailyHabit;
  if (language === "es") return languageHabitEs[activeLanguage.slug] ?? activeLanguage.dailyHabit;
  if (language === "ar") return languageHabitAr[activeLanguage.slug] ?? activeLanguage.dailyHabit;
  return activeLanguage.dailyHabit;
}

function definitionCopy(activeLanguage: ReturnType<typeof getProgrammingLanguage>, activeRole: string, language: InterfaceLanguage) {
  const starter = activeLanguage.tutorialSections[0];
  if (language === "zh") {
    return {
      aria: `${activeLanguage.title} 定义`,
      eyebrow: "先定义",
      title: `${activeLanguage.title} 是什么`,
      body: `${activeLanguage.title} 是一门用来写精确指令的编程语言，主要用于${activeRole}。你先不用记一堆术语，只要先理解：程序把输入按步骤变成输出。`,
      runtimeTitle: "最小运行信息",
      fileLabel: "文件",
      runLabel: "运行",
      habitLabel: "习惯",
      habit: habitForInterface(activeLanguage, language),
      starterTitle: "第一段可读代码",
      outputLabel: "输出",
      cards: [
        ["程序", "一组按顺序执行的指令。先读输入，再计算，最后得到输出。"],
        ["值和变量", "值是数据，变量是给数据取的名字。先看名字，再看它保存了什么。"],
        ["函数", "把一件小事封装起来，给输入，拿输出，之后可以反复用。"],
        ["运行环境", `${activeLanguage.runtime} 负责真正执行 ${activeLanguage.fileName} 里的代码。`],
      ],
      starter,
    };
  }

  if (language === "ja") {
    return {
      aria: `${activeLanguage.title} の定義`,
      eyebrow: "まず定義",
      title: `${activeLanguage.title} とは何か`,
      body: `${activeLanguage.title} は、コンピューターに正確な手順を伝えるためのプログラミング言語です。最初は暗記ではなく「入力、手順、出力」の流れだけをつかみます。`,
      runtimeTitle: "最小実行情報",
      fileLabel: "ファイル",
      runLabel: "実行",
      habitLabel: "習慣",
      habit: habitForInterface(activeLanguage, language),
      starterTitle: "最初に読むコード",
      outputLabel: "出力",
      cards: [
        ["プログラム", "順番に実行される命令の集まりです。入力を読み、処理し、出力します。"],
        ["値と変数", "値はデータです。変数はそのデータにつける名前です。"],
        ["関数", "小さな仕事をまとめたものです。入力を受け取り、結果を返します。"],
        ["実行環境", `${activeLanguage.runtime} が ${activeLanguage.fileName} のコードを実行します。`],
      ],
      starter,
    };
  }

  if (language === "ko") {
    return {
      aria: `${activeLanguage.title} 정의`,
      eyebrow: "먼저 정의",
      title: `${activeLanguage.title} 란 무엇인가`,
      body: `${activeLanguage.title} 는 컴퓨터에 정확한 명령을 전달하기 위한 프로그래밍 언어입니다. 처음에는 암기가 아니라 "입력, 처리, 출력"의 흐름만 이해하면 됩니다。`,
      runtimeTitle: "최소 실행 정보",
      fileLabel: "파일",
      runLabel: "실행",
      habitLabel: "습관",
      habit: habitForInterface(activeLanguage, language),
      starterTitle: "첫 번째 코드",
      outputLabel: "출력",
      cards: [
        ["프로그램", "순서대로 실행되는 명령의 집합입니다. 입력을 읽고 처리하여 출력합니다."],
        ["값과 변수", "값은 데이터입니다. 변수는 그 데이터에 붙이는 이름입니다."],
        ["함수", "작은 작업을 묶은 것입니다. 입력을 받아 결과를 반환합니다."],
        ["실행 환경", `${activeLanguage.runtime} 가 ${activeLanguage.fileName} 의 코드를 실행합니다.`],
      ],
      starter,
    };
  }

  if (language === "es") {
    return {
      aria: `definición de ${activeLanguage.title}`,
      eyebrow: "primero la definición",
      title: `qué es ${activeLanguage.title}`,
      body: `${activeLanguage.title} es un lenguaje para escribir instrucciones exactas, usado sobre todo para ${activeRole}. No empieces memorizando términos. Empieza con una idea: la entrada pasa por pasos y se convierte en salida.`,
      runtimeTitle: "datos mínimos para ejecutar",
      fileLabel: "archivo",
      runLabel: "ejecutar",
      habitLabel: "hábito",
      habit: habitForInterface(activeLanguage, language),
      starterTitle: "primer código legible",
      outputLabel: "salida",
      cards: [
        ["programa", "un conjunto ordenado de instrucciones. Lee entrada, sigue reglas y produce salida."],
        ["valor y variable", "un valor es dato. Una variable es el nombre que usas para guardar y reutilizar ese dato."],
        ["función", "una pieza de trabajo con nombre. Recibe entrada, hace una tarea y puede devolver un resultado."],
        ["entorno", `${activeLanguage.runtime} ejecuta el código de ${activeLanguage.fileName}.`],
      ],
      starter,
    };
  }

  if (language === "ar") {
    return {
      aria: `تعريف ${activeLanguage.title}`,
      eyebrow: "التعريف أولا",
      title: `ما هي ${activeLanguage.title}`,
      body: `${activeLanguage.title} لغة لكتابة تعليمات دقيقة، وتستخدم غالبا في ${activeRole}. لا تبدأ بحفظ المصطلحات. ابدأ بفكرة واحدة: مدخلات تمر بخطوات ثم تصبح مخرجات.`,
      runtimeTitle: "أقل معلومات للتشغيل",
      fileLabel: "الملف",
      runLabel: "التشغيل",
      habitLabel: "العادة",
      habit: habitForInterface(activeLanguage, language),
      starterTitle: "أول كود قابل للقراءة",
      outputLabel: "الناتج",
      cards: [
        ["البرنامج", "مجموعة مرتبة من التعليمات. يقرأ المدخلات ويتبع القواعد وينتج المخرجات."],
        ["القيمة والمتغير", "القيمة هي البيانات. المتغير هو اسم تستخدمه لحفظ البيانات وإعادة استخدامها."],
        ["الدالة", "عمل صغير له اسم. يأخذ مدخلات وينفذ مهمة ويمكن أن يرجع نتيجة."],
        ["بيئة التشغيل", `${activeLanguage.runtime} هي البيئة التي تشغل كود ${activeLanguage.fileName}.`],
      ],
      starter,
    };
  }

  return {
    aria: `${activeLanguage.title} definition`,
    eyebrow: "Definition first",
    title: `What ${activeLanguage.title} means`,
    body: `${activeLanguage.title} is a programming language for writing exact instructions, often used for ${activeLanguage.role}. Start with one mental model: input goes through steps and becomes output.`,
    runtimeTitle: "Minimum run facts",
    fileLabel: "File",
    runLabel: "Run",
    habitLabel: "Habit",
    habit: habitForInterface(activeLanguage, language),
    starterTitle: "First readable code",
    outputLabel: "Output",
    cards: [
      ["Program", "An ordered set of instructions. It reads input, follows rules, and produces output."],
      ["Value and variable", "A value is data. A variable is the name you use to hold and reuse that data."],
      ["Function", "A named piece of work. It takes input, does one job, and can return a result."],
      ["Runtime", `${activeLanguage.runtime} is the place that actually runs code from ${activeLanguage.fileName}.`],
    ],
    starter,
  };
}

function interfaceLanguageLabel(language: InterfaceLanguage) {
  if (language === "zh") return "Chinese";
  if (language === "ja") return "Japanese";
  if (language === "ko") return "Korean";
  if (language === "es") return "Spanish";
  if (language === "ar") return "Arabic";
  return "English";
}

function pendingResultLabel(language: InterfaceLanguage) {
  if (language === "zh") return "未提交";
  if (language === "ja") return "未提出";
  if (language === "ko") return "미제출";
  if (language === "es") return "sin enviar";
  if (language === "ar") return "لم يتم الإرسال";
  return "not submitted";
}

function methodTitle(methodTitleValue: string, language: InterfaceLanguage) {
  return methodI18n[language]?.title[methodTitleValue] ?? methodTitleValue;
}

function methodBody(methodTitleValue: string, methodBodyValue: string, language: InterfaceLanguage) {
  return methodI18n[language]?.body[methodTitleValue] ?? methodBodyValue;
}

export default function ProgrammingTrainer({
  initialLanguageSlug = "javascript",
  initialSiteLanguage = "en",
}: {
  initialLanguageSlug?: ProgrammingLanguageSlug;
  initialSiteLanguage?: InterfaceLanguage;
}) {
  const pathname = usePathname();
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
                <h3>{definition.starter.title}</h3>
                <span>{definition.starter.focus}</span>
              </div>
              <pre>{definition.starter.sampleCode}</pre>
              <code>{definition.outputLabel} {definition.starter.sampleOutput}</code>
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
              {zeroBaseSteps[bilingualLanguage(language)].map((step, index) => (
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
                    <span>{typeLabel[bilingualLanguage(language)][question.type]}</span>
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
                  <strong>{methodTitle(method.title, language)}</strong>
                  <span>{methodBody(method.title, method.body, language)}</span>
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
