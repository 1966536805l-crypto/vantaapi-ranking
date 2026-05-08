import Link from "next/link";
import { AppleStudyHeader } from "@/components/learning/ModuleHub";
import { bilingualLanguage, localizedHref, resolveInterfaceLanguage, type InterfaceLanguage, type PageSearchParams } from "@/lib/language";
import { programmingLanguages, type ProgrammingLanguage, type ProgrammingLanguageSlug } from "@/lib/programming-content";

export const metadata = {
  title: "Programming Language Learning Lab - JinMing Lab",
  description: "Zero foundation programming paths with beginner concepts tutorials drills hints answers and practice workbenches",
};

const zeroSteps = {
  en: [
    { key: "01", title: "Program", body: "A program is exact instructions that turn input into output.", example: "input → rules → output" },
    { key: "02", title: "Output", body: "Printing a value is the first way to check code is alive.", example: "print 42" },
    { key: "03", title: "Values", body: "Variables give names to numbers, text, booleans, lists, and objects.", example: "total = 42" },
    { key: "04", title: "Flow", body: "Branches choose a path · Loops repeat useful work.", example: "if condition then repeat" },
    { key: "05", title: "Functions", body: "Functions package one job so the same idea can be reused.", example: "add(a, b) → result" },
    { key: "06", title: "Collections", body: "Arrays, lists, maps, and sets store many related values.", example: "scores = [40, 2]" },
  ],
  zh: [
    { key: "01", title: "程序是什么", body: "程序就是一组精确指令 · 把输入按规则变成输出", example: "输入 → 规则 → 输出" },
    { key: "02", title: "先会输出", body: "能打印一个值 · 就能确认代码真的跑起来", example: "print 42" },
    { key: "03", title: "变量和值", body: "变量给数字、文本、布尔、列表、对象取名字", example: "total = 42" },
    { key: "04", title: "流程控制", body: "分支负责选择 · 循环负责重复", example: "if 条件 then 重复" },
    { key: "05", title: "函数", body: "函数把一件事封装起来 · 以后反复使用", example: "add(a, b) → result" },
    { key: "06", title: "集合", body: "数组、列表、字典、集合用来存很多相关值", example: "scores = [40, 2]" },
  ],
} as const;

const groups: Array<{
  key: string;
  title: string;
  zh: string;
  summary: string;
  summaryZh: string;
  slugs: ProgrammingLanguageSlug[];
}> = [
  {
    key: "web",
    title: "Web And Product",
    zh: "网页和产品",
    summary: "Make pages · Tools · APIs · Product interfaces",
    summaryZh: "做网页 · 工具 · API · 产品界面",
    slugs: ["html-css", "javascript", "typescript", "php", "ruby", "elm"],
  },
  {
    key: "backend",
    title: "Backend And Cloud",
    zh: "后端和云服务",
    summary: "Build services · Databases · CLIs · Reliable APIs",
    summaryZh: "做服务 · 数据库 · 命令行 · 稳定 API",
    slugs: ["python", "java", "go", "csharp", "sql", "bash", "groovy", "powershell"],
  },
  {
    key: "mobile",
    title: "Mobile And App",
    zh: "手机和应用",
    summary: "Build iOS · Android · Cross-platform apps",
    summaryZh: "做 iOS · Android · 跨端应用",
    slugs: ["swift", "kotlin", "dart", "objective-c", "visual-basic"],
  },
  {
    key: "systems",
    title: "Systems And Performance",
    zh: "系统和性能",
    summary: "Understand memory · Speed · Compilers · Low-level code",
    summaryZh: "理解内存 · 性能 · 编译器 · 底层代码",
    slugs: ["c", "cpp", "rust", "zig", "nim", "d", "v", "assembly"],
  },
  {
    key: "data",
    title: "Data And Science",
    zh: "数据和科学计算",
    summary: "Analyze data · Model numbers · Research workflows",
    summaryZh: "分析数据 · 建模 · 数值处理 · 研究流程",
    slugs: ["python", "r", "julia", "matlab", "scala", "fortran"],
  },
  {
    key: "functional",
    title: "Functional And Language Design",
    zh: "函数式和语言设计",
    summary: "Learn types · Transformations · Concurrency · Compiler thinking",
    summaryZh: "学习类型 · 转换 · 并发 · 编译器思维",
    slugs: ["haskell", "clojure", "elixir", "erlang", "fsharp", "ocaml", "racket", "scheme", "gleam", "common-lisp", "prolog"],
  },
  {
    key: "scripting",
    title: "Scripting And Automation",
    zh: "脚本和自动化",
    summary: "Automate files · Text · Games · Plugins · Daily workflows",
    summaryZh: "自动化文件 · 文本 · 游戏 · 插件 · 日常流程",
    slugs: ["bash", "python", "lua", "perl", "ruby", "powershell", "tcl"],
  },
  {
    key: "blockchain",
    title: "Contracts And Security",
    zh: "合约和安全",
    summary: "Study state · Permissions · Transactions · Secure code review",
    summaryZh: "学习状态 · 权限 · 交易 · 安全代码审查",
    slugs: ["solidity", "javascript", "typescript", "rust"],
  },
  {
    key: "enterprise",
    title: "Enterprise And Legacy",
    zh: "企业和经典系统",
    summary: "Maintain SAP · Finance · Desktop apps · Classic business systems",
    summaryZh: "维护 SAP · 金融系统 · 桌面应用 · 经典业务代码",
    slugs: ["cobol", "abap", "delphi", "pascal", "visual-basic", "smalltalk", "crystal"],
  },
];

type ProgrammingPageCopy = {
  eyebrow: string;
  title: string;
  subtitle: string;
  startPython: string;
  startJavaScript: string;
  startCpp: string;
  stats: [string, string, string];
  zeroTitle: string;
  zeroEyebrow: string;
  groupsTitle: string;
  groupsEyebrow: string;
  allTitle: string;
  allEyebrow: string;
  open: string;
  drillsEach: string;
  firstChoice: string;
  advanced: string;
};

const baseCopy: Record<"en" | "zh", ProgrammingPageCopy> = {
  en: {
    eyebrow: "Zero Foundation Programming",
    title: "Programming Language Learning Lab",
    subtitle: "Start from shared programming ideas · Choose one language · Practice with structured original drills",
    startPython: "Start Python",
    startJavaScript: "Start JavaScript",
    startCpp: "Start C++",
    stats: ["languages", "practice modes", "zero steps"],
    zeroTitle: "Start From These Six Ideas",
    zeroEyebrow: "Foundation",
    groupsTitle: "Choose A Direction",
    groupsEyebrow: "Language Map",
    allTitle: "Programming Tutorials",
    allEyebrow: "Workbench",
    open: "Open",
    drillsEach: "original practice",
    firstChoice: "Good first language",
    advanced: "Advanced track",
  },
  zh: {
    eyebrow: "0 基础编程",
    title: "编程语言训练实验室",
    subtitle: "先学编程共通思想 · 再选一门语言 · 进入原创练习和项目训练",
    startPython: "从 Python 开始",
    startJavaScript: "从 JavaScript 开始",
    startCpp: "从 C++ 开始",
    stats: ["门语言", "练习模式", "0 基础步骤"],
    zeroTitle: "先学这六件事",
    zeroEyebrow: "基础路线",
    groupsTitle: "按方向选语言",
    groupsEyebrow: "语言地图",
    allTitle: "编程语言教程",
    allEyebrow: "训练台",
    open: "进入",
    drillsEach: "原创练习",
    firstChoice: "适合第一门",
    advanced: "进阶路线",
  },
};

const copy: Record<InterfaceLanguage, ProgrammingPageCopy> = {
  en: baseCopy.en,
  zh: baseCopy.zh,
  ja: {
    eyebrow: "ゼロからのプログラミング",
    title: "プログラミング学習ラボ",
    subtitle: "共通する考え方から始めて、言語を選び、構造化されたオリジナル練習に進みます",
    startPython: "Python から始める",
    startJavaScript: "JavaScript から始める",
    startCpp: "C++ から始める",
    stats: ["言語", "練習モード", "基礎ステップ"],
    zeroTitle: "最初に学ぶ 6 つの考え方",
    zeroEyebrow: "基礎",
    groupsTitle: "方向を選ぶ",
    groupsEyebrow: "言語マップ",
    allTitle: "プログラミング教程",
    allEyebrow: "ワークベンチ",
    open: "開く",
    drillsEach: "オリジナル練習",
    firstChoice: "最初の言語に向く",
    advanced: "発展ルート",
  },
  ko: {
    eyebrow: "제로 베이스 프로그래밍",
    title: "프로그래밍 학습 랩",
    subtitle: "공통 개념부터 시작하고 언어를 선택해 구조화된 오리지널 연습으로 이어갑니다",
    startPython: "Python 시작",
    startJavaScript: "JavaScript 시작",
    startCpp: "C++ 시작",
    stats: ["언어", "연습 모드", "기초 단계"],
    zeroTitle: "먼저 익힐 여섯 가지 개념",
    zeroEyebrow: "기초",
    groupsTitle: "방향 선택",
    groupsEyebrow: "언어 지도",
    allTitle: "프로그래밍 튜토리얼",
    allEyebrow: "워크벤치",
    open: "열기",
    drillsEach: "오리지널 연습",
    firstChoice: "첫 언어 추천",
    advanced: "심화 트랙",
  },
  es: {
    eyebrow: "Programación desde cero",
    title: "Laboratorio de aprendizaje de programación",
    subtitle: "Empieza con ideas comunes, elige un lenguaje y practica con ejercicios originales estructurados",
    startPython: "Empezar Python",
    startJavaScript: "Empezar JavaScript",
    startCpp: "Empezar C++",
    stats: ["lenguajes", "modos de práctica", "pasos base"],
    zeroTitle: "Empieza con estas seis ideas",
    zeroEyebrow: "Base",
    groupsTitle: "Elige una dirección",
    groupsEyebrow: "Mapa de lenguajes",
    allTitle: "Tutoriales de programación",
    allEyebrow: "Workbench",
    open: "Abrir",
    drillsEach: "práctica original",
    firstChoice: "Buen primer lenguaje",
    advanced: "Ruta avanzada",
  },
  fr: {
    eyebrow: "Programmation zéro base",
    title: "Laboratoire d’apprentissage programmation",
    subtitle: "Commencez par les idées communes, choisissez un langage, puis pratiquez avec des exercices originaux",
    startPython: "Commencer Python",
    startJavaScript: "Commencer JavaScript",
    startCpp: "Commencer C++",
    stats: ["langages", "modes de pratique", "étapes zéro"],
    zeroTitle: "Commencer par ces six idées",
    zeroEyebrow: "Fondation",
    groupsTitle: "Choisir une direction",
    groupsEyebrow: "Carte des langages",
    allTitle: "Tutoriels de programmation",
    allEyebrow: "Atelier",
    open: "Ouvrir",
    drillsEach: "pratique originale",
    firstChoice: "Bon premier langage",
    advanced: "Parcours avancé",
  },
  de: {
    eyebrow: "Programmieren ab null",
    title: "Programmier-Lernlabor",
    subtitle: "Mit gemeinsamen Konzepten starten, eine Sprache wählen und mit strukturierten Übungen trainieren",
    startPython: "Python starten",
    startJavaScript: "JavaScript starten",
    startCpp: "C++ starten",
    stats: ["Sprachen", "Übungsmodi", "Grundschritte"],
    zeroTitle: "Mit diesen sechs Ideen starten",
    zeroEyebrow: "Grundlage",
    groupsTitle: "Richtung wählen",
    groupsEyebrow: "Sprachkarte",
    allTitle: "Programmier-Tutorials",
    allEyebrow: "Workbench",
    open: "Öffnen",
    drillsEach: "Originalübungen",
    firstChoice: "Gute erste Sprache",
    advanced: "Fortgeschritten",
  },
  pt: {
    eyebrow: "Programação do zero",
    title: "Laboratório de aprendizagem de programação",
    subtitle: "Comece por ideias comuns, escolha uma linguagem e pratique com exercícios originais",
    startPython: "Começar Python",
    startJavaScript: "Começar JavaScript",
    startCpp: "Começar C++",
    stats: ["linguagens", "modos de prática", "passos base"],
    zeroTitle: "Comece por estas seis ideias",
    zeroEyebrow: "Base",
    groupsTitle: "Escolha uma direção",
    groupsEyebrow: "Mapa de linguagens",
    allTitle: "Tutoriais de programação",
    allEyebrow: "Workbench",
    open: "Abrir",
    drillsEach: "prática original",
    firstChoice: "Boa primeira linguagem",
    advanced: "Trilha avançada",
  },
  ru: {
    eyebrow: "Программирование с нуля",
    title: "Лаборатория изучения программирования",
    subtitle: "Начните с общих идей, выберите язык и тренируйтесь на структурированных оригинальных заданиях",
    startPython: "Начать Python",
    startJavaScript: "Начать JavaScript",
    startCpp: "Начать C++",
    stats: ["языков", "режима практики", "шагов с нуля"],
    zeroTitle: "Начните с этих шести идей",
    zeroEyebrow: "Основа",
    groupsTitle: "Выберите направление",
    groupsEyebrow: "Карта языков",
    allTitle: "Учебники программирования",
    allEyebrow: "Рабочая зона",
    open: "Открыть",
    drillsEach: "оригинальная практика",
    firstChoice: "Хороший первый язык",
    advanced: "Продвинутый трек",
  },
  ar: {
    eyebrow: "برمجة من الصفر",
    title: "مختبر تعلم البرمجة",
    subtitle: "ابدأ بالأفكار المشتركة، اختر لغة، وتدرّب بتمارين أصلية منظمة",
    startPython: "ابدأ Python",
    startJavaScript: "ابدأ JavaScript",
    startCpp: "ابدأ C++",
    stats: ["لغات", "أنماط تدريب", "خطوات أساسية"],
    zeroTitle: "ابدأ بهذه الأفكار الست",
    zeroEyebrow: "الأساس",
    groupsTitle: "اختر المسار",
    groupsEyebrow: "خريطة اللغات",
    allTitle: "دروس البرمجة",
    allEyebrow: "منضدة العمل",
    open: "فتح",
    drillsEach: "تدريب أصلي",
    firstChoice: "لغة أولى جيدة",
    advanced: "مسار متقدم",
  },
  hi: {
    eyebrow: "Zero Foundation Programming",
    title: "Programming Learning Lab",
    subtitle: "Common programming ideas से शुरू करें, एक भाषा चुनें, और structured original drills करें",
    startPython: "Python शुरू करें",
    startJavaScript: "JavaScript शुरू करें",
    startCpp: "C++ शुरू करें",
    stats: ["languages", "practice modes", "zero steps"],
    zeroTitle: "इन छह ideas से शुरू करें",
    zeroEyebrow: "Foundation",
    groupsTitle: "Direction चुनें",
    groupsEyebrow: "Language Map",
    allTitle: "Programming Tutorials",
    allEyebrow: "Workbench",
    open: "Open",
    drillsEach: "original practice",
    firstChoice: "Good first language",
    advanced: "Advanced track",
  },
  id: {
    eyebrow: "Pemrograman dari nol",
    title: "Lab belajar pemrograman",
    subtitle: "Mulai dari ide umum, pilih bahasa, lalu latihan dengan drill original terstruktur",
    startPython: "Mulai Python",
    startJavaScript: "Mulai JavaScript",
    startCpp: "Mulai C++",
    stats: ["bahasa", "mode latihan", "langkah dasar"],
    zeroTitle: "Mulai dari enam ide ini",
    zeroEyebrow: "Dasar",
    groupsTitle: "Pilih arah",
    groupsEyebrow: "Peta bahasa",
    allTitle: "Tutorial pemrograman",
    allEyebrow: "Workbench",
    open: "Buka",
    drillsEach: "latihan original",
    firstChoice: "Bahasa pertama yang bagus",
    advanced: "Track lanjut",
  },
  vi: {
    eyebrow: "Lập trình từ con số 0",
    title: "Phòng lab học lập trình",
    subtitle: "Bắt đầu từ tư duy chung, chọn một ngôn ngữ và luyện với bài tập gốc có cấu trúc",
    startPython: "Bắt đầu Python",
    startJavaScript: "Bắt đầu JavaScript",
    startCpp: "Bắt đầu C++",
    stats: ["ngôn ngữ", "chế độ luyện", "bước nền tảng"],
    zeroTitle: "Bắt đầu với sáu ý tưởng này",
    zeroEyebrow: "Nền tảng",
    groupsTitle: "Chọn hướng học",
    groupsEyebrow: "Bản đồ ngôn ngữ",
    allTitle: "Hướng dẫn lập trình",
    allEyebrow: "Workbench",
    open: "Mở",
    drillsEach: "bài tập gốc",
    firstChoice: "Ngôn ngữ đầu tiên tốt",
    advanced: "Lộ trình nâng cao",
  },
  th: {
    eyebrow: "เขียนโปรแกรมจากศูนย์",
    title: "ห้องเรียนเขียนโปรแกรม",
    subtitle: "เริ่มจากแนวคิดร่วม เลือกภาษา แล้วฝึกด้วยโจทย์ต้นฉบับแบบมีโครงสร้าง",
    startPython: "เริ่ม Python",
    startJavaScript: "เริ่ม JavaScript",
    startCpp: "เริ่ม C++",
    stats: ["ภาษา", "โหมดฝึก", "ขั้นพื้นฐาน"],
    zeroTitle: "เริ่มจาก 6 แนวคิดนี้",
    zeroEyebrow: "พื้นฐาน",
    groupsTitle: "เลือกทิศทาง",
    groupsEyebrow: "แผนที่ภาษา",
    allTitle: "บทเรียนเขียนโปรแกรม",
    allEyebrow: "Workbench",
    open: "เปิด",
    drillsEach: "แบบฝึกต้นฉบับ",
    firstChoice: "เหมาะเป็นภาษาแรก",
    advanced: "เส้นทางขั้นสูง",
  },
  tr: {
    eyebrow: "Sıfırdan programlama",
    title: "Programlama öğrenme laboratuvarı",
    subtitle: "Ortak fikirlerle başla, bir dil seç ve yapılandırılmış özgün alıştırmalarla çalış",
    startPython: "Python başla",
    startJavaScript: "JavaScript başla",
    startCpp: "C++ başla",
    stats: ["dil", "pratik modu", "temel adım"],
    zeroTitle: "Bu altı fikirle başla",
    zeroEyebrow: "Temel",
    groupsTitle: "Yön seç",
    groupsEyebrow: "Dil haritası",
    allTitle: "Programlama dersleri",
    allEyebrow: "Workbench",
    open: "Aç",
    drillsEach: "özgün pratik",
    firstChoice: "İyi ilk dil",
    advanced: "İleri rota",
  },
  it: {
    eyebrow: "Programmazione da zero",
    title: "Laboratorio di apprendimento programmazione",
    subtitle: "Parti dalle idee comuni, scegli una lingua e pratica con esercizi originali strutturati",
    startPython: "Inizia Python",
    startJavaScript: "Inizia JavaScript",
    startCpp: "Inizia C++",
    stats: ["linguaggi", "modalità pratica", "passi base"],
    zeroTitle: "Inizia da queste sei idee",
    zeroEyebrow: "Fondamenta",
    groupsTitle: "Scegli una direzione",
    groupsEyebrow: "Mappa linguaggi",
    allTitle: "Tutorial programmazione",
    allEyebrow: "Workbench",
    open: "Apri",
    drillsEach: "pratica originale",
    firstChoice: "Buon primo linguaggio",
    advanced: "Percorso avanzato",
  },
  nl: {
    eyebrow: "Programmeren vanaf nul",
    title: "Programmeer leerlab",
    subtitle: "Start met gedeelde ideeën, kies een taal en oefen met gestructureerde originele drills",
    startPython: "Start Python",
    startJavaScript: "Start JavaScript",
    startCpp: "Start C++",
    stats: ["talen", "oefenmodi", "nulstappen"],
    zeroTitle: "Begin met deze zes ideeën",
    zeroEyebrow: "Basis",
    groupsTitle: "Kies richting",
    groupsEyebrow: "Taalkaart",
    allTitle: "Programmeer tutorials",
    allEyebrow: "Workbench",
    open: "Open",
    drillsEach: "originele oefening",
    firstChoice: "Goede eerste taal",
    advanced: "Gevorderd pad",
  },
  pl: {
    eyebrow: "Programowanie od zera",
    title: "Laboratorium nauki programowania",
    subtitle: "Zacznij od wspólnych idei, wybierz język i ćwicz na uporządkowanych oryginalnych zadaniach",
    startPython: "Zacznij Python",
    startJavaScript: "Zacznij JavaScript",
    startCpp: "Zacznij C++",
    stats: ["języków", "tryby ćwiczeń", "kroki od zera"],
    zeroTitle: "Zacznij od tych sześciu idei",
    zeroEyebrow: "Podstawy",
    groupsTitle: "Wybierz kierunek",
    groupsEyebrow: "Mapa języków",
    allTitle: "Tutoriale programowania",
    allEyebrow: "Workbench",
    open: "Otwórz",
    drillsEach: "oryginalne ćwiczenia",
    firstChoice: "Dobry pierwszy język",
    advanced: "Ścieżka zaawansowana",
  },
};

const firstLanguageSlugs = new Set<ProgrammingLanguageSlug>(["python", "javascript", "html-css", "sql"]);

function getLanguage(slug: ProgrammingLanguageSlug) {
  return programmingLanguages.find((language) => language.slug === slug);
}

function groupLanguages(slugs: ProgrammingLanguageSlug[]) {
  return slugs.map(getLanguage).filter((language): language is ProgrammingLanguage => Boolean(language));
}

export default async function ProgrammingPage({
  searchParams,
}: {
  searchParams?: Promise<PageSearchParams>;
}) {
  const language = resolveInterfaceLanguage(searchParams ? await searchParams : undefined);
  const foundationLanguage = bilingualLanguage(language);
  const t = copy[language];

  return (
    <main className="apple-page pb-12 pt-4">
      <AppleStudyHeader language={language} />
      <section className="apple-shell py-7">
        <div className="module-hero px-5 py-6">
          <p className="eyebrow">{t.eyebrow}</p>
          <h1 className="apple-display-title mt-3 max-w-4xl text-3xl sm:text-4xl">{t.title}</h1>
          <p className="apple-display-subtitle mt-3 max-w-3xl text-sm text-[color:var(--muted)]">{t.subtitle}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link href={localizedHref("/programming/python", language)} className="apple-button-primary px-4 py-2 text-sm">{t.startPython}</Link>
            <Link href={localizedHref("/programming/javascript", language)} className="apple-button-secondary px-4 py-2 text-sm">{t.startJavaScript}</Link>
            <Link href={localizedHref("/programming/cpp", language)} className="apple-button-secondary px-4 py-2 text-sm">{t.startCpp}</Link>
          </div>
          <div className="mt-4 grid gap-2 sm:grid-cols-3">
            <div className="dense-chip">
              <p className="text-[11px] text-[color:var(--muted)]">{t.stats[0]}</p>
              <p className="mt-1 text-3xl font-semibold">{programmingLanguages.length}</p>
            </div>
            <div className="dense-chip">
              <p className="text-[11px] text-[color:var(--muted)]">{t.stats[1]}</p>
              <p className="mt-1 text-3xl font-semibold">3</p>
            </div>
            <div className="dense-chip">
              <p className="text-[11px] text-[color:var(--muted)]">{t.stats[2]}</p>
              <p className="mt-1 text-3xl font-semibold">{zeroSteps[foundationLanguage].length}</p>
            </div>
          </div>
        </div>

        <section className="mt-6">
          <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="eyebrow">{t.zeroEyebrow}</p>
              <h2 className="mt-2 text-2xl font-semibold">{t.zeroTitle}</h2>
            </div>
            <span className="dense-status">choice · fill blank · build tasks</span>
          </div>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {zeroSteps[foundationLanguage].map((step) => (
              <article key={step.key} className="dense-card p-4">
                <div className="flex items-start justify-between gap-3">
                  <span className="dense-status">{step.key}</span>
                  <code className="rounded-[8px] bg-slate-950 px-2.5 py-1 text-xs text-white">{step.example}</code>
                </div>
                <h3 className="mt-4 text-xl font-semibold">{step.title}</h3>
                <p className="mt-3 text-sm leading-6 text-[color:var(--muted)]">{step.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-6 grid gap-3 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
          <div className="dense-panel dense-grid-bg p-5">
            <p className="eyebrow text-slate-400">{t.groupsEyebrow}</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">{t.groupsTitle}</h2>
            <div className="mt-5 grid gap-2">
              {groups.map((group) => (
                <div key={group.key} className="rounded-[8px] border border-white/10 bg-white/[0.07] p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <h3 className="font-semibold text-white">{language === "zh" ? group.zh : group.title}</h3>
                      <p className="mt-1 text-xs leading-5 text-slate-300">{language === "zh" ? group.summaryZh : group.summary}</p>
                    </div>
                    <span className="rounded-full border border-white/10 px-2.5 py-1 text-xs text-slate-200">{group.slugs.length}</span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {groupLanguages(group.slugs).map((item) => (
                      <Link
                        key={`${group.key}-${item.slug}`}
                        href={localizedHref(`/programming/${item.slug}`, language)}
                        className="rounded-full border border-white/10 bg-white/[0.08] px-3 py-1 text-xs font-semibold text-white hover:border-sky-200/50"
                      >
                        {item.shortTitle}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="dense-panel p-5">
            <p className="eyebrow">{t.allEyebrow}</p>
            <h2 className="mt-2 text-2xl font-semibold">{t.allTitle}</h2>
            <div className="mt-4 grid gap-2 md:grid-cols-2">
              {programmingLanguages.map((item) => (
                <Link key={item.slug} href={localizedHref(`/programming/${item.slug}`, language)} className="dense-card p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="eyebrow">{item.shortTitle}</p>
                      <h3 className="mt-1 truncate text-lg font-semibold">{item.title}</h3>
                    </div>
                    <span className="dense-status">{t.open}</span>
                  </div>
                  <p className="mt-3 line-clamp-2 text-sm leading-6 text-[color:var(--muted)]">{item.role}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="dense-status">{t.drillsEach}</span>
                    <span className="dense-status">{firstLanguageSlugs.has(item.slug) ? t.firstChoice : t.advanced}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}
