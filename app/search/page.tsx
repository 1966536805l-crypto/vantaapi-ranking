import Link from "next/link";
import type { Metadata } from "next";
import FlagLanguageToggle from "@/components/layout/FlagLanguageToggle";
import { localizedHref, localizedLanguageAlternates, resolveInterfaceLanguage, type InterfaceLanguage, type PageSearchParams } from "@/lib/language";
import { searchSite, siteSearchItems, type SiteSearchItem } from "@/lib/site-search";

type SearchPageProps = {
  searchParams?: Promise<PageSearchParams & { q?: string }>;
};

const quickSearches = [
  { label: "GitHub Audit", query: "github audit" },
  { label: "Prompt", query: "prompt" },
  { label: "Bug", query: "bug" },
  { label: "API", query: "api" },
  { label: "JSON", query: "json" },
  { label: "Regex", query: "regex" },
  { label: "Roadmap", query: "roadmap" },
  { label: "Python", query: "python" },
];

const priorityHrefs = [
  "/tools/github-repo-analyzer",
  "/tools/prompt-optimizer",
  "/tools/bug-finder",
  "/tools/api-request-generator",
  "/tools/dev-utilities",
  "/tools/learning-roadmap",
  "/programming",
  "/programming/python",
];

type SearchCopy = {
  launchAudit: string;
  tools: string;
  coding: string;
  eyebrow: string;
  title: string;
  body: string;
  placeholder: string;
  search: string;
  index: string;
  entries: string;
  fastStart: string;
  runAudit: string;
  optimizePrompt: string;
  findBug: string;
  results: string;
  startHere: string;
  matchesFor: string;
  usefulEntries: string;
  localIndex: string;
  noMatch: string;
  noMatchBody: string;
  open: string;
  categories: Record<string, string>;
};

const searchCopy: Partial<Record<InterfaceLanguage, SearchCopy>> & { en: SearchCopy; zh: SearchCopy } = {
  en: {
    launchAudit: "Launch Audit",
    tools: "AI Tools",
    coding: "Coding",
    eyebrow: "Developer Tool Search",
    title: "Search launch audits AI tools and coding routes",
    body: "Public search is focused on GitHub launch audits prompt tools bug fixing API generation dev utilities and coding routes",
    placeholder: "Search GitHub prompt bug api json python",
    search: "Search",
    index: "Index",
    entries: "public entries",
    fastStart: "Fast Start",
    runAudit: "Run GitHub Launch Audit",
    optimizePrompt: "Optimize Prompt",
    findBug: "Find Bug",
    results: "Results",
    startHere: "Start Here",
    matchesFor: "matches for",
    usefulEntries: "Most useful entries",
    localIndex: "local index",
    noMatch: "No match yet",
    noMatchBody: "Try shorter words like GitHub prompt bug api json python",
    open: "Open",
    categories: { Start: "Start", "AI Tools": "AI Tools", "Coding Lab": "Coding Lab" },
  },
  zh: {
    launchAudit: "上线体检",
    tools: "AI 工具",
    coding: "编程路线",
    eyebrow: "开发者工具搜索",
    title: "搜索上线体检 AI 工具和编程路线",
    body: "公开入口先聚焦 GitHub 上线体检 Prompt 优化 Bug 定位 API 请求生成 JSON 正则时间戳和编程路线",
    placeholder: "搜索 GitHub prompt bug api json python",
    search: "搜索",
    index: "索引",
    entries: "个公开入口",
    fastStart: "快速开始",
    runAudit: "运行 GitHub 上线体检",
    optimizePrompt: "优化 Prompt",
    findBug: "定位 Bug",
    results: "结果",
    startHere: "从这里开始",
    matchesFor: "个匹配",
    usefulEntries: "最有用的入口",
    localIndex: "本地索引",
    noMatch: "还没有匹配",
    noMatchBody: "试试更短的词 比如 GitHub prompt bug api json python",
    open: "打开",
    categories: { Start: "开始", "AI Tools": "AI 工具", "Coding Lab": "编程实验室" },
  },
  ja: {
    launchAudit: "公開前診断",
    tools: "AI ツール",
    coding: "プログラミング",
    eyebrow: "開発者ツール検索",
    title: "公開前診断 AI ツール プログラミングを検索",
    body: "GitHub 公開前診断、Prompt 最適化、Bug 調査、API 生成、開発ユーティリティ、プログラミング導線に絞った検索です。",
    placeholder: "GitHub prompt bug api json python を検索",
    search: "検索",
    index: "索引",
    entries: "公開入口",
    fastStart: "すぐ始める",
    runAudit: "GitHub 診断を実行",
    optimizePrompt: "Prompt を最適化",
    findBug: "Bug を探す",
    results: "結果",
    startHere: "ここから開始",
    matchesFor: "件一致",
    usefulEntries: "便利な入口",
    localIndex: "ローカル索引",
    noMatch: "まだ一致なし",
    noMatchBody: "GitHub prompt bug api json python など短い語で検索してください",
    open: "開く",
    categories: { Start: "開始", "AI Tools": "AI ツール", "Coding Lab": "プログラミング" },
  },
  ko: {
    launchAudit: "출시 점검",
    tools: "AI 도구",
    coding: "코딩",
    eyebrow: "개발자 도구 검색",
    title: "출시 점검 AI 도구와 코딩 경로 검색",
    body: "GitHub 출시 점검, Prompt 최적화, Bug 찾기, API 생성, 개발 유틸리티와 코딩 경로에 집중합니다.",
    placeholder: "GitHub prompt bug api json python 검색",
    search: "검색",
    index: "색인",
    entries: "공개 항목",
    fastStart: "빠른 시작",
    runAudit: "GitHub 출시 점검 실행",
    optimizePrompt: "Prompt 최적화",
    findBug: "Bug 찾기",
    results: "결과",
    startHere: "여기서 시작",
    matchesFor: "개 일치",
    usefulEntries: "가장 유용한 항목",
    localIndex: "로컬 색인",
    noMatch: "아직 일치 항목 없음",
    noMatchBody: "GitHub prompt bug api json python 처럼 짧게 검색해 보세요",
    open: "열기",
    categories: { Start: "시작", "AI Tools": "AI 도구", "Coding Lab": "코딩 랩" },
  },
  es: {
    launchAudit: "Auditoría",
    tools: "Herramientas AI",
    coding: "Programación",
    eyebrow: "Búsqueda de herramientas",
    title: "Busca auditorías herramientas AI y rutas de programación",
    body: "La búsqueda pública se centra en auditorías GitHub, prompts, bugs, API, utilidades dev y rutas de programación.",
    placeholder: "Buscar GitHub prompt bug api json python",
    search: "Buscar",
    index: "Índice",
    entries: "entradas públicas",
    fastStart: "Inicio rápido",
    runAudit: "Ejecutar auditoría GitHub",
    optimizePrompt: "Optimizar Prompt",
    findBug: "Encontrar Bug",
    results: "Resultados",
    startHere: "Empieza aquí",
    matchesFor: "coincidencias para",
    usefulEntries: "Entradas más útiles",
    localIndex: "índice local",
    noMatch: "Aún no hay coincidencias",
    noMatchBody: "Prueba palabras más cortas como GitHub prompt bug api json python",
    open: "Abrir",
    categories: { Start: "Inicio", "AI Tools": "Herramientas AI", "Coding Lab": "Programación" },
  },
  fr: {
    launchAudit: "Audit lancement",
    tools: "Outils AI",
    coding: "Programmation",
    eyebrow: "Recherche outils développeur",
    title: "Rechercher audits outils AI et parcours de code",
    body: "Recherche centrée sur audit GitHub, prompts, bugs, API, utilitaires dev et parcours de programmation.",
    placeholder: "Rechercher GitHub prompt bug api json python",
    search: "Rechercher",
    index: "Index",
    entries: "entrées publiques",
    fastStart: "Démarrage rapide",
    runAudit: "Lancer audit GitHub",
    optimizePrompt: "Optimiser Prompt",
    findBug: "Trouver Bug",
    results: "Résultats",
    startHere: "Commencer ici",
    matchesFor: "résultats pour",
    usefulEntries: "Entrées utiles",
    localIndex: "index local",
    noMatch: "Aucun résultat",
    noMatchBody: "Essayez des mots courts comme GitHub prompt bug api json python",
    open: "Ouvrir",
    categories: { Start: "Début", "AI Tools": "Outils AI", "Coding Lab": "Programmation" },
  },
  de: {
    launchAudit: "Startprüfung",
    tools: "KI Werkzeuge",
    coding: "Programmieren",
    eyebrow: "Entwickler Tool Suche",
    title: "Startprüfungen KI Werkzeuge und Programmierwege suchen",
    body: "Suche für GitHub Launch Audit, Prompt, Bug, API, Dev Utilities und Programmierwege.",
    placeholder: "GitHub prompt bug api json python suchen",
    search: "Suchen",
    index: "Index",
    entries: "öffentliche Einträge",
    fastStart: "Schnellstart",
    runAudit: "GitHub Prüfung starten",
    optimizePrompt: "Prompt optimieren",
    findBug: "Bug finden",
    results: "Ergebnisse",
    startHere: "Hier starten",
    matchesFor: "Treffer für",
    usefulEntries: "Nützliche Einstiege",
    localIndex: "lokaler Index",
    noMatch: "Noch kein Treffer",
    noMatchBody: "Versuche kürzere Wörter wie GitHub prompt bug api json python",
    open: "Öffnen",
    categories: { Start: "Start", "AI Tools": "KI Werkzeuge", "Coding Lab": "Programmierlabor" },
  },
  pt: {
    launchAudit: "Auditoria",
    tools: "Ferramentas AI",
    coding: "Programação",
    eyebrow: "Busca de ferramentas",
    title: "Buscar auditorias ferramentas AI e rotas de programação",
    body: "Busca focada em auditoria GitHub, prompts, bugs, API, utilitários dev e rotas de programação.",
    placeholder: "Buscar GitHub prompt bug api json python",
    search: "Buscar",
    index: "Índice",
    entries: "entradas públicas",
    fastStart: "Início rápido",
    runAudit: "Rodar auditoria GitHub",
    optimizePrompt: "Otimizar Prompt",
    findBug: "Encontrar Bug",
    results: "Resultados",
    startHere: "Comece aqui",
    matchesFor: "resultados para",
    usefulEntries: "Entradas úteis",
    localIndex: "índice local",
    noMatch: "Nenhum resultado ainda",
    noMatchBody: "Tente palavras curtas como GitHub prompt bug api json python",
    open: "Abrir",
    categories: { Start: "Início", "AI Tools": "Ferramentas AI", "Coding Lab": "Programação" },
  },
  ru: {
    launchAudit: "Аудит запуска",
    tools: "AI инструменты",
    coding: "Программирование",
    eyebrow: "Поиск инструментов",
    title: "Поиск аудита AI инструментов и маршрутов кода",
    body: "Поиск по GitHub аудиту, Prompt, Bug, API, dev утилитам и маршрутам программирования.",
    placeholder: "Искать GitHub prompt bug api json python",
    search: "Искать",
    index: "Индекс",
    entries: "публичных входов",
    fastStart: "Быстрый старт",
    runAudit: "Запустить GitHub аудит",
    optimizePrompt: "Оптимизировать Prompt",
    findBug: "Найти Bug",
    results: "Результаты",
    startHere: "Начать здесь",
    matchesFor: "совпадений для",
    usefulEntries: "Полезные входы",
    localIndex: "локальный индекс",
    noMatch: "Совпадений пока нет",
    noMatchBody: "Попробуйте короткие слова GitHub prompt bug api json python",
    open: "Открыть",
    categories: { Start: "Старт", "AI Tools": "AI инструменты", "Coding Lab": "Кодинг" },
  },
  ar: {
    launchAudit: "تدقيق الإطلاق",
    tools: "أدوات الذكاء الاصطناعي",
    coding: "البرمجة",
    eyebrow: "بحث أدوات المطور",
    title: "ابحث في تدقيق الإطلاق وأدوات الذكاء الاصطناعي ومسارات البرمجة",
    body: "يركز البحث العام على تدقيق GitHub وPrompt وBug وAPI وأدوات المطور ومسارات البرمجة.",
    placeholder: "ابحث GitHub prompt bug api json python",
    search: "بحث",
    index: "الفهرس",
    entries: "مدخلات عامة",
    fastStart: "بدء سريع",
    runAudit: "تشغيل تدقيق GitHub",
    optimizePrompt: "تحسين Prompt",
    findBug: "العثور على Bug",
    results: "النتائج",
    startHere: "ابدأ هنا",
    matchesFor: "نتائج لـ",
    usefulEntries: "أهم المداخل",
    localIndex: "فهرس محلي",
    noMatch: "لا توجد نتائج بعد",
    noMatchBody: "جرب كلمات أقصر مثل GitHub prompt bug api json python",
    open: "فتح",
    categories: { Start: "البداية", "AI Tools": "أدوات الذكاء الاصطناعي", "Coding Lab": "مختبر البرمجة" },
  },
  hi: {
    launchAudit: "लॉन्च ऑडिट",
    tools: "AI उपकरण",
    coding: "प्रोग्रामिंग",
    eyebrow: "डेवलपर टूल खोज",
    title: "लॉन्च ऑडिट AI उपकरण और कोडिंग रास्ते खोजें",
    body: "GitHub audit, Prompt, Bug, API, dev utilities और programming routes पर केंद्रित खोज।",
    placeholder: "GitHub prompt bug api json python खोजें",
    search: "खोजें",
    index: "इंडेक्स",
    entries: "सार्वजनिक प्रवेश",
    fastStart: "तेज शुरुआत",
    runAudit: "GitHub audit चलाएं",
    optimizePrompt: "Prompt सुधारें",
    findBug: "Bug खोजें",
    results: "नतीजे",
    startHere: "यहां शुरू करें",
    matchesFor: "के परिणाम",
    usefulEntries: "सबसे उपयोगी प्रवेश",
    localIndex: "स्थानीय सूचकांक",
    noMatch: "अभी match नहीं",
    noMatchBody: "GitHub prompt bug api json python जैसे छोटे शब्द आजमाएं",
    open: "खोलें",
    categories: { Start: "शुरुआत", "AI Tools": "AI उपकरण", "Coding Lab": "कोडिंग लैब" },
  },
  id: {
    launchAudit: "Audit Rilis",
    tools: "Alat AI",
    coding: "Pemrograman",
    eyebrow: "Pencarian alat developer",
    title: "Cari audit rilis alat AI dan rute coding",
    body: "Pencarian fokus pada audit GitHub, prompt, bug, API, utilitas dev dan rute pemrograman.",
    placeholder: "Cari GitHub prompt bug api json python",
    search: "Cari",
    index: "Indeks",
    entries: "entri publik",
    fastStart: "Mulai cepat",
    runAudit: "Jalankan audit GitHub",
    optimizePrompt: "Optimalkan Prompt",
    findBug: "Cari Bug",
    results: "Hasil",
    startHere: "Mulai di sini",
    matchesFor: "hasil untuk",
    usefulEntries: "Entri paling berguna",
    localIndex: "indeks lokal",
    noMatch: "Belum ada hasil",
    noMatchBody: "Coba kata pendek seperti GitHub prompt bug api json python",
    open: "Buka",
    categories: { Start: "Mulai", "AI Tools": "Alat AI", "Coding Lab": "Lab Coding" },
  },
  vi: {
    launchAudit: "Kiểm tra ra mắt",
    tools: "Công cụ AI",
    coding: "Lập trình",
    eyebrow: "Tìm công cụ developer",
    title: "Tìm audit công cụ AI và lộ trình lập trình",
    body: "Tìm trong GitHub audit, prompt, bug, API, tiện ích dev và lộ trình lập trình.",
    placeholder: "Tìm GitHub prompt bug api json python",
    search: "Tìm",
    index: "Chỉ mục",
    entries: "mục công khai",
    fastStart: "Bắt đầu nhanh",
    runAudit: "Chạy GitHub audit",
    optimizePrompt: "Tối ưu Prompt",
    findBug: "Tìm Bug",
    results: "Kết quả",
    startHere: "Bắt đầu tại đây",
    matchesFor: "kết quả cho",
    usefulEntries: "Mục hữu ích nhất",
    localIndex: "chỉ mục local",
    noMatch: "Chưa có kết quả",
    noMatchBody: "Thử từ ngắn như GitHub prompt bug api json python",
    open: "Mở",
    categories: { Start: "Bắt đầu", "AI Tools": "Công cụ AI", "Coding Lab": "Lập trình" },
  },
  th: {
    launchAudit: "ตรวจปล่อยงาน",
    tools: "เครื่องมือ AI",
    coding: "เขียนโปรแกรม",
    eyebrow: "ค้นหาเครื่องมือนักพัฒนา",
    title: "ค้นหา audit เครื่องมือ AI และเส้นทางโค้ด",
    body: "ค้นหา GitHub audit, prompt, bug, API, dev utilities และเส้นทางเขียนโปรแกรม",
    placeholder: "ค้นหา GitHub prompt bug api json python",
    search: "ค้นหา",
    index: "ดัชนี",
    entries: "รายการสาธารณะ",
    fastStart: "เริ่มเร็ว",
    runAudit: "รัน GitHub audit",
    optimizePrompt: "ปรับ Prompt",
    findBug: "หา Bug",
    results: "ผลลัพธ์",
    startHere: "เริ่มที่นี่",
    matchesFor: "ผลลัพธ์สำหรับ",
    usefulEntries: "ทางเข้าที่มีประโยชน์",
    localIndex: "ดัชนี local",
    noMatch: "ยังไม่พบ",
    noMatchBody: "ลองคำสั้น เช่น GitHub prompt bug api json python",
    open: "เปิด",
    categories: { Start: "เริ่ม", "AI Tools": "เครื่องมือ AI", "Coding Lab": "แล็บเขียนโค้ด" },
  },
  tr: {
    launchAudit: "Yayın denetimi",
    tools: "AI araçları",
    coding: "Programlama",
    eyebrow: "Geliştirici araç arama",
    title: "Yayın denetimi AI araçları ve kod yolları ara",
    body: "GitHub audit, prompt, bug, API, geliştirici araçları ve programlama yollarına odaklı arama.",
    placeholder: "GitHub prompt bug api json python ara",
    search: "Ara",
    index: "Dizin",
    entries: "açık giriş",
    fastStart: "Hızlı başla",
    runAudit: "GitHub audit çalıştır",
    optimizePrompt: "Prompt iyileştir",
    findBug: "Bug bul",
    results: "Sonuçlar",
    startHere: "Buradan başla",
    matchesFor: "sonuç",
    usefulEntries: "En yararlı girişler",
    localIndex: "yerel dizin",
    noMatch: "Henüz eşleşme yok",
    noMatchBody: "GitHub prompt bug api json python gibi kısa kelimeler deneyin",
    open: "Aç",
    categories: { Start: "Başlangıç", "AI Tools": "AI araçları", "Coding Lab": "Kod Lab" },
  },
  it: {
    launchAudit: "Audit lancio",
    tools: "Strumenti AI",
    coding: "Programmazione",
    eyebrow: "Ricerca strumenti developer",
    title: "Cerca audit strumenti AI e percorsi codice",
    body: "Ricerca focalizzata su audit GitHub, prompt, bug, API, utility dev e percorsi di programmazione.",
    placeholder: "Cerca GitHub prompt bug api json python",
    search: "Cerca",
    index: "Indice",
    entries: "voci pubbliche",
    fastStart: "Avvio rapido",
    runAudit: "Esegui audit GitHub",
    optimizePrompt: "Ottimizza Prompt",
    findBug: "Trova Bug",
    results: "Risultati",
    startHere: "Inizia qui",
    matchesFor: "risultati per",
    usefulEntries: "Voci più utili",
    localIndex: "indice locale",
    noMatch: "Nessun risultato",
    noMatchBody: "Prova parole brevi come GitHub prompt bug api json python",
    open: "Apri",
    categories: { Start: "Inizio", "AI Tools": "Strumenti AI", "Coding Lab": "Programmazione" },
  },
  nl: {
    launchAudit: "Publicatiecontrole",
    tools: "AI gereedschap",
    coding: "Programmeren",
    eyebrow: "Developer tool zoeken",
    title: "Zoek publicatiecontroles AI gereedschap en programmeerroutes",
    body: "Zoeken in GitHub audits, prompts, bugs, API, dev utilities en programmeerroutes.",
    placeholder: "Zoek GitHub prompt bug api json python",
    search: "Zoeken",
    index: "Index",
    entries: "publieke ingangen",
    fastStart: "Snel starten",
    runAudit: "GitHub controle starten",
    optimizePrompt: "Prompt verbeteren",
    findBug: "Bug vinden",
    results: "Resultaten",
    startHere: "Begin hier",
    matchesFor: "resultaten voor",
    usefulEntries: "Nuttige ingangen",
    localIndex: "lokale index",
    noMatch: "Nog geen match",
    noMatchBody: "Probeer korte woorden zoals GitHub prompt bug api json python",
    open: "Open",
    categories: { Start: "Start", "AI Tools": "AI gereedschap", "Coding Lab": "Programmeerlab" },
  },
  pl: {
    launchAudit: "Audyt publikacji",
    tools: "Narzędzia AI",
    coding: "Programowanie",
    eyebrow: "Wyszukiwarka narzędzi",
    title: "Szukaj audytów narzędzi AI i ścieżek kodu",
    body: "Wyszukiwanie skupia się na GitHub audit, prompt, bug, API, dev utilities i ścieżkach programowania.",
    placeholder: "Szukaj GitHub prompt bug api json python",
    search: "Szukaj",
    index: "Indeks",
    entries: "publicznych wejść",
    fastStart: "Szybki start",
    runAudit: "Uruchom GitHub audit",
    optimizePrompt: "Ulepsz Prompt",
    findBug: "Znajdź Bug",
    results: "Wyniki",
    startHere: "Zacznij tutaj",
    matchesFor: "wyników dla",
    usefulEntries: "Najbardziej przydatne wejścia",
    localIndex: "lokalny indeks",
    noMatch: "Brak wyników",
    noMatchBody: "Spróbuj krótkich słów jak GitHub prompt bug api json python",
    open: "Otwórz",
    categories: { Start: "Start", "AI Tools": "Narzędzia AI", "Coding Lab": "Programowanie" },
  },
};

function getSearchCopy(language: InterfaceLanguage) {
  return searchCopy[language] || searchCopy.en;
}

export async function generateMetadata({ searchParams }: SearchPageProps): Promise<Metadata> {
  const params = searchParams ? await searchParams : undefined;
  const language = resolveInterfaceLanguage(params);
  const copy = getSearchCopy(language);
  return {
    title: `${copy.title} - JinMing Lab`,
    description: copy.body,
    keywords: ["GitHub launch audit", "AI developer tools", "Prompt", "Bug", "API", "coding roadmap"],
    alternates: {
      canonical: localizedHref("/search", language),
      languages: localizedLanguageAlternates("/search"),
    },
    openGraph: {
      title: `${copy.title} - JinMing Lab`,
      description: copy.body,
      url: "https://vantaapi.com/search",
      siteName: "JinMing Lab",
      type: "website",
    },
  };
}

type SearchResultDisplayCopy = {
  staticItems: Record<string, { title: string; description: string; tags: string[] }>;
  toolTitles: Record<string, string>;
  toolDescriptions: Record<string, string>;
  programmingTitle: (name: string) => string;
  programmingDescription: (name: string) => string;
  programmingTag: string;
};

const searchResultDisplayCopy: Record<InterfaceLanguage, SearchResultDisplayCopy> = {
  en: {
    staticItems: {
      "/search": { title: "Site Search", description: "Find tools routes and launch checklists from one box", tags: ["search", "index"] },
      "/tools/github-repo-analyzer": { title: "GitHub Launch Audit", description: "Paste a public repo and get blockers score and a fix checklist", tags: ["GitHub", "launch"] },
      "/programming": { title: "Programming Learning Lab", description: "Zero foundation routes for languages used by real developers", tags: ["coding", "zero base"] },
    },
    toolTitles: {
      "github-repo-analyzer": "GitHub Launch Audit",
      "prompt-optimizer": "AI Prompt Optimizer",
      "code-explainer": "Code Explainer",
      "bug-finder": "Bug Finder",
      "api-request-generator": "API Request Generator",
      "dev-utilities": "JSON Regex Timestamp Utilities",
      "learning-roadmap": "AI Coding Roadmap",
    },
    toolDescriptions: {
      "github-repo-analyzer": "Audit public repositories for release blockers and readiness",
      "prompt-optimizer": "Turn rough requests into clearer AI prompts",
      "code-explainer": "Read code faster with purpose risks and learning notes",
      "bug-finder": "Turn errors and snippets into a debug path",
      "api-request-generator": "Generate curl fetch axios and Python requests examples",
      "dev-utilities": "Format JSON test regex and convert timestamps",
      "learning-roadmap": "Build a practical programming plan from zero",
    },
    programmingTitle: (name) => `${name} Learning Lab`,
    programmingDescription: (name) => `Definitions syntax drills and practice path for ${name}`,
    programmingTag: "practice",
  },
  zh: {
    staticItems: {
      "/search": { title: "站内搜索", description: "一个入口搜索工具 路线和上线检查清单", tags: ["搜索", "索引"] },
      "/tools/github-repo-analyzer": { title: "GitHub 上线体检", description: "粘贴公开仓库 生成阻塞项 评分和修复清单", tags: ["GitHub", "上线"] },
      "/programming": { title: "编程学习实验室", description: "面向零基础的真实开发语言学习路径", tags: ["编程", "零基础"] },
    },
    toolTitles: {
      "github-repo-analyzer": "GitHub 上线体检",
      "prompt-optimizer": "AI 提示词优化器",
      "code-explainer": "代码解释器",
      "bug-finder": "Bug 定位助手",
      "api-request-generator": "API 请求生成器",
      "dev-utilities": "JSON 正则 时间戳工具",
      "learning-roadmap": "AI 编程路线",
    },
    toolDescriptions: {
      "github-repo-analyzer": "检查公开仓库的上线阻塞项和发布准备度",
      "prompt-optimizer": "把粗糙需求改成更清晰的 AI 提示词",
      "code-explainer": "快速看懂代码作用 风险和学习要点",
      "bug-finder": "把报错和片段整理成排查路径",
      "api-request-generator": "生成 curl fetch axios 和 Python requests 示例",
      "dev-utilities": "格式化 JSON 测试正则 转换时间戳",
      "learning-roadmap": "从零生成可执行的编程学习路线",
    },
    programmingTitle: (name) => `${name} 学习实验室`,
    programmingDescription: (name) => `${name} 的定义 语法训练和练习路径`,
    programmingTag: "练习",
  },
  ja: {
    staticItems: {
      "/search": { title: "サイト検索", description: "ツール ルート 公開前チェックを一つの検索で探す", tags: ["検索", "索引"] },
      "/tools/github-repo-analyzer": { title: "GitHub 公開前監査", description: "公開リポジトリから課題 スコア 修正チェックを作成", tags: ["GitHub", "公開"] },
      "/programming": { title: "プログラミング学習ラボ", description: "ゼロから実務言語を学ぶためのルート", tags: ["練習", "基礎"] },
    },
    toolTitles: {
      "github-repo-analyzer": "GitHub 公開前監査",
      "prompt-optimizer": "AI プロンプト最適化",
      "code-explainer": "コード解説",
      "bug-finder": "バグ発見",
      "api-request-generator": "API リクエスト生成",
      "dev-utilities": "JSON 正規表現 時刻ツール",
      "learning-roadmap": "AI コーディングロードマップ",
    },
    toolDescriptions: {
      "github-repo-analyzer": "公開リポジトリの公開準備と阻害要因を確認",
      "prompt-optimizer": "粗い依頼を明確な AI プロンプトに整える",
      "code-explainer": "コードの目的 リスク 学習ポイントを素早く読む",
      "bug-finder": "エラーとコードから調査手順を作る",
      "api-request-generator": "curl fetch axios Python requests の例を生成",
      "dev-utilities": "JSON 整形 正規表現テスト タイムスタンプ変換",
      "learning-roadmap": "ゼロから実行できる学習計画を作る",
    },
    programmingTitle: (name) => `${name} 学習ラボ`,
    programmingDescription: (name) => `${name} の定義 文法練習 実践ルート`,
    programmingTag: "練習",
  },
  ko: {
    staticItems: {
      "/search": { title: "사이트 검색", description: "도구 경로 출시 체크리스트를 한 번에 찾기", tags: ["검색", "색인"] },
      "/tools/github-repo-analyzer": { title: "GitHub 출시 점검", description: "공개 저장소로 차단 이슈 점수 수정 목록 생성", tags: ["GitHub", "출시"] },
      "/programming": { title: "프로그래밍 학습 랩", description: "초보자를 위한 실제 개발 언어 학습 경로", tags: ["연습", "기초"] },
    },
    toolTitles: {
      "github-repo-analyzer": "GitHub 출시 점검",
      "prompt-optimizer": "AI 프롬프트 최적화",
      "code-explainer": "코드 설명",
      "bug-finder": "버그 찾기",
      "api-request-generator": "API 요청 생성기",
      "dev-utilities": "JSON 정규식 시간 도구",
      "learning-roadmap": "AI 코딩 로드맵",
    },
    toolDescriptions: {
      "github-repo-analyzer": "공개 저장소의 출시 준비도와 차단 요소 확인",
      "prompt-optimizer": "거친 요청을 명확한 AI 프롬프트로 정리",
      "code-explainer": "코드 목적 위험 학습 포인트를 빠르게 읽기",
      "bug-finder": "오류와 코드로 디버그 경로 만들기",
      "api-request-generator": "curl fetch axios Python requests 예제 생성",
      "dev-utilities": "JSON 포맷 정규식 테스트 타임스탬프 변환",
      "learning-roadmap": "실행 가능한 코딩 학습 계획 만들기",
    },
    programmingTitle: (name) => `${name} 학습 랩`,
    programmingDescription: (name) => `${name} 정의 문법 훈련 실습 경로`,
    programmingTag: "연습",
  },
  es: {
    staticItems: {
      "/search": { title: "Busqueda del sitio", description: "Encuentra herramientas rutas y checklists desde una caja", tags: ["buscar", "indice"] },
      "/tools/github-repo-analyzer": { title: "Auditoria de lanzamiento GitHub", description: "Pega un repo publico y recibe bloqueos puntuacion y checklist", tags: ["GitHub", "lanzamiento"] },
      "/programming": { title: "Laboratorio de programacion", description: "Rutas desde cero para lenguajes usados por desarrolladores", tags: ["practica", "desde cero"] },
    },
    toolTitles: {
      "github-repo-analyzer": "Auditoria de lanzamiento GitHub",
      "prompt-optimizer": "Optimizador de prompts AI",
      "code-explainer": "Explicador de codigo",
      "bug-finder": "Detector de bugs",
      "api-request-generator": "Generador de solicitudes API",
      "dev-utilities": "Utilidades JSON Regex Tiempo",
      "learning-roadmap": "Ruta de programacion AI",
    },
    toolDescriptions: {
      "github-repo-analyzer": "Revisa repos publicos para bloqueos y preparacion de lanzamiento",
      "prompt-optimizer": "Convierte peticiones vagas en prompts claros",
      "code-explainer": "Lee codigo con proposito riesgos y notas",
      "bug-finder": "Convierte errores y snippets en pasos de depuracion",
      "api-request-generator": "Genera ejemplos curl fetch axios y Python requests",
      "dev-utilities": "Formatea JSON prueba regex y convierte timestamps",
      "learning-roadmap": "Crea un plan practico para aprender a programar",
    },
    programmingTitle: (name) => `Laboratorio de ${name}`,
    programmingDescription: (name) => `Definiciones sintaxis ejercicios y ruta practica para ${name}`,
    programmingTag: "practica",
  },
  fr: {
    staticItems: {
      "/search": { title: "Recherche du site", description: "Trouver outils parcours et checklists en un seul champ", tags: ["recherche", "index"] },
      "/tools/github-repo-analyzer": { title: "Audit de lancement GitHub", description: "Coller un repo public et obtenir blocages score et checklist", tags: ["GitHub", "lancement"] },
      "/programming": { title: "Lab d apprentissage code", description: "Parcours debutant pour les langages de developpeurs", tags: ["pratique", "debutant"] },
    },
    toolTitles: {
      "github-repo-analyzer": "Audit de lancement GitHub",
      "prompt-optimizer": "Optimiseur de prompts AI",
      "code-explainer": "Explication de code",
      "bug-finder": "Detecteur de bugs",
      "api-request-generator": "Generateur de requetes API",
      "dev-utilities": "Outils JSON Regex Temps",
      "learning-roadmap": "Roadmap de code AI",
    },
    toolDescriptions: {
      "github-repo-analyzer": "Verifier les repos publics avant lancement",
      "prompt-optimizer": "Transformer une demande vague en prompt clair",
      "code-explainer": "Lire le code avec but risques et notes",
      "bug-finder": "Transformer erreurs et snippets en plan de debug",
      "api-request-generator": "Generer curl fetch axios et Python requests",
      "dev-utilities": "Formater JSON tester regex convertir dates",
      "learning-roadmap": "Creer un plan pratique pour apprendre le code",
    },
    programmingTitle: (name) => `Lab ${name}`,
    programmingDescription: (name) => `Definitions syntaxe exercices et parcours pratique pour ${name}`,
    programmingTag: "pratique",
  },
  de: {
    staticItems: {
      "/search": { title: "Seitensuche", description: "Werkzeuge Lernwege und Launch Checklisten in einem Feld finden", tags: ["Suche", "Index"] },
      "/tools/github-repo-analyzer": { title: "GitHub Launch Audit", description: "Oeffentliches Repo einfuegen und Blocker Score Checkliste erhalten", tags: ["GitHub", "Launch"] },
      "/programming": { title: "Programmier Lernlabor", description: "Einsteigerpfade fuer echte Entwicklersprachen", tags: ["Praxis", "Basis"] },
    },
    toolTitles: {
      "github-repo-analyzer": "GitHub Launch Audit",
      "prompt-optimizer": "AI Prompt Optimierer",
      "code-explainer": "Code Erklaerer",
      "bug-finder": "Bug Finder",
      "api-request-generator": "API Request Generator",
      "dev-utilities": "JSON Regex Zeit Werkzeuge",
      "learning-roadmap": "AI Coding Roadmap",
    },
    toolDescriptions: {
      "github-repo-analyzer": "Oeffentliche Repos auf Launch Blocker pruefen",
      "prompt-optimizer": "Grobe Anfragen in klare AI Prompts verwandeln",
      "code-explainer": "Code mit Zweck Risiken und Notizen lesen",
      "bug-finder": "Fehler und Snippets in Debug Schritte verwandeln",
      "api-request-generator": "curl fetch axios und Python requests erzeugen",
      "dev-utilities": "JSON formatieren Regex testen Zeitstempel wandeln",
      "learning-roadmap": "Praktischen Programmierplan ab null bauen",
    },
    programmingTitle: (name) => `${name} Lernlabor`,
    programmingDescription: (name) => `Definitionen Syntax Uebungen und Praxisroute fuer ${name}`,
    programmingTag: "Praxis",
  },
  pt: {
    staticItems: {
      "/search": { title: "Busca do site", description: "Encontre ferramentas rotas e checklists em uma caixa", tags: ["busca", "indice"] },
      "/tools/github-repo-analyzer": { title: "Auditoria GitHub", description: "Cole um repo publico e receba bloqueios pontuacao e checklist", tags: ["GitHub", "lancamento"] },
      "/programming": { title: "Laboratorio de programacao", description: "Rotas do zero para linguagens usadas por devs", tags: ["pratica", "zero"] },
    },
    toolTitles: {
      "github-repo-analyzer": "Auditoria GitHub",
      "prompt-optimizer": "Otimizador de prompt AI",
      "code-explainer": "Explicador de codigo",
      "bug-finder": "Detector de bugs",
      "api-request-generator": "Gerador de requisicoes API",
      "dev-utilities": "Utilitarios JSON Regex Tempo",
      "learning-roadmap": "Roteiro de codigo AI",
    },
    toolDescriptions: {
      "github-repo-analyzer": "Audite repos publicos para bloqueios de lancamento",
      "prompt-optimizer": "Transforme pedidos vagos em prompts claros",
      "code-explainer": "Leia codigo com objetivo riscos e notas",
      "bug-finder": "Transforme erros e snippets em passos de debug",
      "api-request-generator": "Gere exemplos curl fetch axios e Python requests",
      "dev-utilities": "Formate JSON teste regex converta timestamps",
      "learning-roadmap": "Crie um plano pratico para aprender programacao",
    },
    programmingTitle: (name) => `Laboratorio de ${name}`,
    programmingDescription: (name) => `Definicoes sintaxe exercicios e rota pratica para ${name}`,
    programmingTag: "pratica",
  },
  ru: {
    staticItems: {
      "/search": { title: "Поиск по сайту", description: "Инструменты маршруты и чеклисты запуска в одном поиске", tags: ["поиск", "индекс"] },
      "/tools/github-repo-analyzer": { title: "Аудит запуска GitHub", description: "Вставь публичный repo и получи блокеры оценку и чеклист", tags: ["GitHub", "запуск"] },
      "/programming": { title: "Лаборатория программирования", description: "Маршруты с нуля для языков разработчиков", tags: ["практика", "с нуля"] },
    },
    toolTitles: {
      "github-repo-analyzer": "Аудит запуска GitHub",
      "prompt-optimizer": "AI оптимизатор prompt",
      "code-explainer": "Объяснение кода",
      "bug-finder": "Поиск bugs",
      "api-request-generator": "Генератор API запросов",
      "dev-utilities": "JSON Regex время",
      "learning-roadmap": "AI roadmap кода",
    },
    toolDescriptions: {
      "github-repo-analyzer": "Проверяет публичные repo перед запуском",
      "prompt-optimizer": "Делает грубую задачу ясным AI prompt",
      "code-explainer": "Быстро читает смысл риски и заметки кода",
      "bug-finder": "Делает из ошибки путь отладки",
      "api-request-generator": "Создает curl fetch axios и Python requests",
      "dev-utilities": "Форматирует JSON тестирует regex переводит время",
      "learning-roadmap": "Создает практичный план обучения коду",
    },
    programmingTitle: (name) => `Лаборатория ${name}`,
    programmingDescription: (name) => `Определения синтаксис упражнения и практика для ${name}`,
    programmingTag: "практика",
  },
  ar: {
    staticItems: {
      "/search": { title: "بحث الموقع", description: "ابحث عن الأدوات والمسارات وقوائم الإطلاق من مكان واحد", tags: ["بحث", "فهرس"] },
      "/tools/github-repo-analyzer": { title: "فحص إطلاق GitHub", description: "الصق مستودعا عاما لتحصل على العوائق والنتيجة وقائمة الإصلاح", tags: ["GitHub", "إطلاق"] },
      "/programming": { title: "مختبر تعلم البرمجة", description: "مسارات من الصفر للغات التي يستخدمها المطورون", tags: ["تدريب", "من الصفر"] },
    },
    toolTitles: {
      "github-repo-analyzer": "فحص إطلاق GitHub",
      "prompt-optimizer": "محسن Prompt بالذكاء الاصطناعي",
      "code-explainer": "شارح الكود",
      "bug-finder": "محدد الأخطاء",
      "api-request-generator": "منشئ طلبات API",
      "dev-utilities": "أدوات JSON و Regex والوقت",
      "learning-roadmap": "خطة تعلم البرمجة بالذكاء الاصطناعي",
    },
    toolDescriptions: {
      "github-repo-analyzer": "يفحص المستودعات العامة قبل الإطلاق ويكشف العوائق",
      "prompt-optimizer": "يحول الطلب الخام إلى Prompt أوضح",
      "code-explainer": "يشرح الهدف والمخاطر وملاحظات التعلم في الكود",
      "bug-finder": "يحول الخطأ والمقطع إلى خطوات تصحيح",
      "api-request-generator": "ينشئ أمثلة curl و fetch و axios و Python requests",
      "dev-utilities": "ينسق JSON ويختبر Regex ويحول الطوابع الزمنية",
      "learning-roadmap": "يبني خطة عملية لتعلم البرمجة من الصفر",
    },
    programmingTitle: (name) => `مختبر ${name}`,
    programmingDescription: (name) => `تعريفات وقواعد وتدريب عملي لتعلم ${name}`,
    programmingTag: "تدريب",
  },
  hi: {
    staticItems: {
      "/search": { title: "site search", description: "tools routes aur launch checklist ek jagah search karein", tags: ["खोज", "index"] },
      "/tools/github-repo-analyzer": { title: "GitHub launch audit", description: "public repo paste karke blockers score aur checklist paayein", tags: ["GitHub", "launch"] },
      "/programming": { title: "programming learning lab", description: "zero base se developer languages seekhne ke routes", tags: ["practice", "zero"] },
    },
    toolTitles: {
      "github-repo-analyzer": "GitHub launch audit",
      "prompt-optimizer": "AI prompt optimizer",
      "code-explainer": "code explainer",
      "bug-finder": "bug finder",
      "api-request-generator": "API request generator",
      "dev-utilities": "JSON regex time tools",
      "learning-roadmap": "AI coding roadmap",
    },
    toolDescriptions: {
      "github-repo-analyzer": "public repos ko launch blockers ke liye check karein",
      "prompt-optimizer": "rough request ko clear AI prompt banayein",
      "code-explainer": "code ka purpose risk aur notes jaldi samjhein",
      "bug-finder": "error aur snippet se debug steps banayein",
      "api-request-generator": "curl fetch axios aur Python requests examples banayein",
      "dev-utilities": "JSON format regex test timestamp convert",
      "learning-roadmap": "zero se practical coding plan banayein",
    },
    programmingTitle: (name) => `${name} learning lab`,
    programmingDescription: (name) => `${name} ke definitions syntax drills aur practice route`,
    programmingTag: "practice",
  },
  id: {
    staticItems: {
      "/search": { title: "Pencarian situs", description: "Cari alat rute dan checklist rilis dari satu kotak", tags: ["cari", "indeks"] },
      "/tools/github-repo-analyzer": { title: "Audit rilis GitHub", description: "Tempel repo publik untuk blocker skor dan checklist", tags: ["GitHub", "rilis"] },
      "/programming": { title: "Lab belajar programming", description: "Rute nol dasar untuk bahasa developer", tags: ["praktik", "nol dasar"] },
    },
    toolTitles: {
      "github-repo-analyzer": "Audit rilis GitHub",
      "prompt-optimizer": "Optimasi prompt AI",
      "code-explainer": "Penjelas kode",
      "bug-finder": "Pencari bug",
      "api-request-generator": "Generator request API",
      "dev-utilities": "Alat JSON Regex Waktu",
      "learning-roadmap": "Roadmap coding AI",
    },
    toolDescriptions: {
      "github-repo-analyzer": "Audit repo publik untuk kesiapan rilis",
      "prompt-optimizer": "Ubah permintaan kasar menjadi prompt jelas",
      "code-explainer": "Baca kode dengan tujuan risiko dan catatan",
      "bug-finder": "Ubah error dan snippet menjadi langkah debug",
      "api-request-generator": "Buat contoh curl fetch axios dan Python requests",
      "dev-utilities": "Format JSON uji regex konversi timestamp",
      "learning-roadmap": "Buat rencana coding praktis dari nol",
    },
    programmingTitle: (name) => `Lab ${name}`,
    programmingDescription: (name) => `Definisi sintaks latihan dan rute praktik untuk ${name}`,
    programmingTag: "praktik",
  },
  vi: {
    staticItems: {
      "/search": { title: "Tim kiem site", description: "Tim cong cu lo trinh va checklist phat hanh trong mot o", tags: ["tim", "chi muc"] },
      "/tools/github-repo-analyzer": { title: "Kiem tra ra mat GitHub", description: "Dan repo cong khai de co diem blocker va checklist", tags: ["GitHub", "ra mat"] },
      "/programming": { title: "Lab hoc lap trinh", description: "Lo trinh tu con so 0 cho ngon ngu developer", tags: ["thuc hanh", "co ban"] },
    },
    toolTitles: {
      "github-repo-analyzer": "Kiem tra ra mat GitHub",
      "prompt-optimizer": "Toi uu prompt AI",
      "code-explainer": "Giai thich code",
      "bug-finder": "Tim bug",
      "api-request-generator": "Tao request API",
      "dev-utilities": "Cong cu JSON Regex Thoi gian",
      "learning-roadmap": "Lo trinh code AI",
    },
    toolDescriptions: {
      "github-repo-analyzer": "Kiem tra repo cong khai truoc khi ra mat",
      "prompt-optimizer": "Bien yeu cau tho thanh prompt ro rang",
      "code-explainer": "Doc code voi muc dich rui ro va ghi chu",
      "bug-finder": "Bien loi va snippet thanh buoc debug",
      "api-request-generator": "Tao curl fetch axios va Python requests",
      "dev-utilities": "Format JSON test regex doi timestamp",
      "learning-roadmap": "Tao ke hoach hoc code tu so 0",
    },
    programmingTitle: (name) => `Lab ${name}`,
    programmingDescription: (name) => `Dinh nghia cu phap bai tap va lo trinh cho ${name}`,
    programmingTag: "thuc hanh",
  },
  th: {
    staticItems: {
      "/search": { title: "ค้นหาในไซต์", description: "ค้นหาเครื่องมือ เส้นทาง และ checklist เปิดตัวในช่องเดียว", tags: ["ค้นหา", "ดัชนี"] },
      "/tools/github-repo-analyzer": { title: "ตรวจเปิดตัว GitHub", description: "วาง repo สาธารณะเพื่อดู blocker score และ checklist", tags: ["GitHub", "เปิดตัว"] },
      "/programming": { title: "แล็บเรียนเขียนโปรแกรม", description: "เส้นทางจากศูนย์สำหรับภาษา developer", tags: ["ฝึก", "พื้นฐาน"] },
    },
    toolTitles: {
      "github-repo-analyzer": "ตรวจเปิดตัว GitHub",
      "prompt-optimizer": "ปรับ Prompt AI",
      "code-explainer": "อธิบายโค้ด",
      "bug-finder": "ค้นหา bug",
      "api-request-generator": "สร้าง request API",
      "dev-utilities": "เครื่องมือ JSON Regex เวลา",
      "learning-roadmap": "Roadmap เขียนโค้ด AI",
    },
    toolDescriptions: {
      "github-repo-analyzer": "ตรวจ repo สาธารณะก่อนเปิดตัว",
      "prompt-optimizer": "เปลี่ยนคำขอคร่าวๆ ให้เป็น prompt ชัดเจน",
      "code-explainer": "อ่านโค้ดพร้อมเป้าหมาย ความเสี่ยง และโน้ต",
      "bug-finder": "เปลี่ยน error และ snippet เป็นขั้นตอน debug",
      "api-request-generator": "สร้างตัวอย่าง curl fetch axios และ Python requests",
      "dev-utilities": "จัด JSON ทดสอบ regex แปลง timestamp",
      "learning-roadmap": "สร้างแผนเรียนโค้ดจากศูนย์",
    },
    programmingTitle: (name) => `แล็บ ${name}`,
    programmingDescription: (name) => `นิยาม syntax แบบฝึก และเส้นทางฝึกสำหรับ ${name}`,
    programmingTag: "ฝึก",
  },
  tr: {
    staticItems: {
      "/search": { title: "Site arama", description: "Araclari rotalari ve launch checklistleri tek kutuda bul", tags: ["arama", "dizin"] },
      "/tools/github-repo-analyzer": { title: "GitHub launch denetimi", description: "Public repo yapistir blocker skor ve checklist al", tags: ["GitHub", "launch"] },
      "/programming": { title: "Programlama ogrenme lab", description: "Sifirdan developer dilleri icin rotalar", tags: ["pratik", "sifir"] },
    },
    toolTitles: {
      "github-repo-analyzer": "GitHub launch denetimi",
      "prompt-optimizer": "AI prompt iyilestirici",
      "code-explainer": "Kod aciklayici",
      "bug-finder": "Bug bulucu",
      "api-request-generator": "API request olusturucu",
      "dev-utilities": "JSON Regex Zaman araclari",
      "learning-roadmap": "AI kod roadmap",
    },
    toolDescriptions: {
      "github-repo-analyzer": "Public repolari launch blocker icin denetler",
      "prompt-optimizer": "Kaba istegi net AI prompt haline getirir",
      "code-explainer": "Kodu amac risk ve notlarla okur",
      "bug-finder": "Hata ve snippetten debug adimlari cikarir",
      "api-request-generator": "curl fetch axios ve Python requests uretir",
      "dev-utilities": "JSON formatlar regex test eder timestamp cevirir",
      "learning-roadmap": "Sifirdan pratik kod plani olusturur",
    },
    programmingTitle: (name) => `${name} lab`,
    programmingDescription: (name) => `${name} icin tanimlar soz dizimi alistirma ve rota`,
    programmingTag: "pratik",
  },
  it: {
    staticItems: {
      "/search": { title: "Ricerca sito", description: "Trova strumenti percorsi e checklist di lancio in una sola casella", tags: ["cerca", "indice"] },
      "/tools/github-repo-analyzer": { title: "Audit lancio GitHub", description: "Incolla un repo pubblico e ottieni blocchi score e checklist", tags: ["GitHub", "lancio"] },
      "/programming": { title: "Lab di programmazione", description: "Percorsi da zero per linguaggi usati dai developer", tags: ["pratica", "base"] },
    },
    toolTitles: {
      "github-repo-analyzer": "Audit lancio GitHub",
      "prompt-optimizer": "Ottimizzatore prompt AI",
      "code-explainer": "Spiegatore codice",
      "bug-finder": "Trova bug",
      "api-request-generator": "Generatore richieste API",
      "dev-utilities": "Strumenti JSON Regex Tempo",
      "learning-roadmap": "Roadmap codice AI",
    },
    toolDescriptions: {
      "github-repo-analyzer": "Controlla repo pubblici prima del lancio",
      "prompt-optimizer": "Trasforma richieste grezze in prompt chiari",
      "code-explainer": "Legge codice con scopo rischi e note",
      "bug-finder": "Trasforma errori e snippet in passi debug",
      "api-request-generator": "Genera curl fetch axios e Python requests",
      "dev-utilities": "Formatta JSON prova regex converte timestamp",
      "learning-roadmap": "Crea un piano pratico per imparare codice",
    },
    programmingTitle: (name) => `Lab ${name}`,
    programmingDescription: (name) => `Definizioni sintassi esercizi e percorso pratico per ${name}`,
    programmingTag: "pratica",
  },
  nl: {
    staticItems: {
      "/search": { title: "Site zoeken", description: "Vind tools routes en launch checklists vanuit een zoekvak", tags: ["zoeken", "index"] },
      "/tools/github-repo-analyzer": { title: "GitHub launch audit", description: "Plak een publiek repo en krijg blockers score en checklist", tags: ["GitHub", "launch"] },
      "/programming": { title: "Programmeer leerlab", description: "Nul basis routes voor talen van developers", tags: ["praktijk", "basis"] },
    },
    toolTitles: {
      "github-repo-analyzer": "GitHub launch audit",
      "prompt-optimizer": "AI prompt optimizer",
      "code-explainer": "Code uitlegger",
      "bug-finder": "Bug finder",
      "api-request-generator": "API request generator",
      "dev-utilities": "JSON Regex Tijd tools",
      "learning-roadmap": "AI coding roadmap",
    },
    toolDescriptions: {
      "github-repo-analyzer": "Controleer publieke repos op launch blockers",
      "prompt-optimizer": "Maak ruwe verzoeken heldere AI prompts",
      "code-explainer": "Lees code met doel risico en notities",
      "bug-finder": "Maak debug stappen uit errors en snippets",
      "api-request-generator": "Genereer curl fetch axios en Python requests",
      "dev-utilities": "Format JSON test regex converteer timestamps",
      "learning-roadmap": "Maak een praktisch code leerplan vanaf nul",
    },
    programmingTitle: (name) => `${name} leerlab`,
    programmingDescription: (name) => `Definities syntax oefeningen en praktijkroute voor ${name}`,
    programmingTag: "praktijk",
  },
  pl: {
    staticItems: {
      "/search": { title: "Wyszukiwanie", description: "Znajdz narzedzia sciezki i checklisty launch w jednym polu", tags: ["szukaj", "indeks"] },
      "/tools/github-repo-analyzer": { title: "Audyt launch GitHub", description: "Wklej publiczne repo aby dostac blokery score i checklist", tags: ["GitHub", "launch"] },
      "/programming": { title: "Lab nauki programowania", description: "Sciezki od zera dla jezykow developerow", tags: ["praktyka", "od zera"] },
    },
    toolTitles: {
      "github-repo-analyzer": "Audyt launch GitHub",
      "prompt-optimizer": "Optymalizator prompt AI",
      "code-explainer": "Wyjasniacz kodu",
      "bug-finder": "Wyszukiwacz bugow",
      "api-request-generator": "Generator requestow API",
      "dev-utilities": "Narzędzia JSON Regex Czas",
      "learning-roadmap": "Roadmap kodowania AI",
    },
    toolDescriptions: {
      "github-repo-analyzer": "Sprawdza publiczne repo przed launch",
      "prompt-optimizer": "Zmienia surowe prosby w jasne prompty",
      "code-explainer": "Czyta kod z celem ryzykiem i notatkami",
      "bug-finder": "Z errorow i snippetow robi kroki debug",
      "api-request-generator": "Generuje curl fetch axios i Python requests",
      "dev-utilities": "Formatuje JSON testuje regex konwertuje czas",
      "learning-roadmap": "Tworzy praktyczny plan nauki kodu od zera",
    },
    programmingTitle: (name) => `Lab ${name}`,
    programmingDescription: (name) => `Definicje skladnia cwiczenia i trasa praktyki dla ${name}`,
    programmingTag: "praktyka",
  },
};

function programmingNameFromTitle(title: string) {
  return title.replace(/\s+Learning Lab$/i, "");
}

function displaySearchItem(item: SiteSearchItem, language: InterfaceLanguage, copy: SearchCopy) {
  const resultCopy = searchResultDisplayCopy[language];
  const category = copy.categories[item.category] || item.category;
  const staticItem = resultCopy.staticItems[item.href];
  if (staticItem) {
    return { ...staticItem, category };
  }

  const toolSlug = item.href.match(/^\/tools\/([^/?#]+)/)?.[1];
  if (toolSlug && resultCopy.toolTitles[toolSlug]) {
    return {
      title: resultCopy.toolTitles[toolSlug],
      category,
      description: resultCopy.toolDescriptions[toolSlug],
      tags: [category, resultCopy.toolTitles[toolSlug].split(" ")[0], copy.open],
    };
  }

  const programmingSlug = item.href.match(/^\/programming\/([^/?#]+)/)?.[1];
  if (programmingSlug) {
    const name = programmingNameFromTitle(item.title);
    return {
      title: resultCopy.programmingTitle(name),
      category,
      description: resultCopy.programmingDescription(name),
      tags: [category, name, resultCopy.programmingTag],
    };
  }

  return {
    title: item.title,
    category,
    description: item.description,
    tags: [category],
  };
}

function displayQuickSearchLabel(query: string, fallback: string, language: InterfaceLanguage, copy: SearchCopy) {
  if (query === "github audit") return copy.launchAudit;
  if (query === "prompt") return copy.optimizePrompt;
  if (query === "bug") return copy.findBug;
  if (query === "roadmap") return searchResultDisplayCopy[language].toolTitles["learning-roadmap"];
  return fallback;
}

function normalizeSearchText(value: string) {
  return value
    .normalize("NFKC")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function scoreSearchField(text: string, query: string, terms: string[], weight: number) {
  const normalized = normalizeSearchText(text);
  if (!normalized) return 0;

  let score = 0;
  if (normalized === query) score += weight * 5;
  if (normalized.startsWith(query)) score += weight * 3;
  if (normalized.includes(query)) score += weight * 2;

  for (const term of terms) {
    if (term.length >= 2 && normalized.includes(term)) {
      score += weight;
    }
  }

  return score;
}

function searchLocalizedSite(query: string, language: InterfaceLanguage, copy: SearchCopy, limit = 36) {
  const normalizedQuery = normalizeSearchText(query);
  if (!normalizedQuery) return [];

  const terms = normalizedQuery.split(" ").filter(Boolean);

  return siteSearchItems
    .map((item) => {
      const displayItem = displaySearchItem(item, language, copy);
      const fields = [
        { text: displayItem.title, weight: 12 },
        { text: displayItem.category, weight: 9 },
        { text: displayItem.description, weight: 6 },
        { text: displayItem.tags.join(" "), weight: 5 },
        { text: item.title, weight: 8 },
        { text: item.category, weight: 6 },
        { text: item.description, weight: 4 },
        { text: item.tags.join(" "), weight: 4 },
        { text: item.href, weight: 3 },
      ];

      const score = fields.reduce(
        (sum, field) => sum + scoreSearchField(field.text, normalizedQuery, terms, field.weight),
        0,
      );

      return { item, score };
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || a.item.title.localeCompare(b.item.title))
    .slice(0, limit)
    .map((entry) => entry.item);
}

function mergeSearchResults(primary: SiteSearchItem[], fallback: SiteSearchItem[], limit = 36) {
  const seen = new Set<string>();
  const merged: SiteSearchItem[] = [];

  for (const item of [...primary, ...fallback]) {
    if (seen.has(item.href)) continue;
    seen.add(item.href);
    merged.push(item);
    if (merged.length >= limit) break;
  }

  return merged;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = searchParams ? await searchParams : undefined;
  const language = resolveInterfaceLanguage(params);
  const copy = getSearchCopy(language);
  const isRtl = language === "ar";
  const rawQuery = Array.isArray(params?.q) ? params?.q[0] : params?.q;
  const query = (rawQuery || "").trim().slice(0, 80);
  const results = query
    ? mergeSearchResults(searchLocalizedSite(query, language, copy), searchSite(query))
    : [];
  const groupedCount = new Map<string, number>();

  for (const item of siteSearchItems) {
    groupedCount.set(item.category, (groupedCount.get(item.category) || 0) + 1);
  }

  const priorityResults = priorityHrefs
    .map((href) => siteSearchItems.find((item) => item.href === href))
    .filter((item): item is (typeof siteSearchItems)[number] => Boolean(item));
  const resultItems = query ? results : priorityResults;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "JinMing Lab",
    url: "https://vantaapi.com",
    potentialAction: {
      "@type": "SearchAction",
      target: "https://vantaapi.com/search?q={search_term_string}",
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <main className="apple-page pb-16" dir={isRtl ? "rtl" : "ltr"}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <section className="mx-auto min-h-screen w-[min(1180px,calc(100%_-_28px))] py-5">
        <header className="dense-panel flex flex-wrap items-center justify-between gap-3 p-4">
          <Link href={localizedHref("/", language)} className="dense-action">JinMing Lab</Link>
          <div className="flex flex-wrap gap-2">
            <Link href={localizedHref("/tools/github-repo-analyzer", language)} className="dense-action-primary">{copy.launchAudit}</Link>
            <Link href={localizedHref("/tools", language)} className="dense-action">{copy.tools}</Link>
            <Link href={localizedHref("/programming", language)} className="dense-action">{copy.coding}</Link>
            <FlagLanguageToggle initialLanguage={language} />
          </div>
        </header>

        <section className="mt-3 dense-panel overflow-hidden p-5 sm:p-6">
          <p className="eyebrow">{copy.eyebrow}</p>
          <h1 className="mt-3 max-w-4xl text-3xl font-semibold leading-[1.04] sm:text-4xl">
            {copy.title}
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-[color:var(--muted)]">
            {copy.body}
          </p>

          <form action="/search" className="mt-5 flex flex-col gap-2 rounded-[8px] border border-slate-200 bg-white/85 p-2 sm:flex-row">
            <input type="hidden" name="lang" value={language} />
            <input
              name="q"
              defaultValue={query}
              className="min-h-11 min-w-0 flex-1 rounded-[8px] border border-slate-200 bg-white px-4 text-sm font-semibold outline-none transition focus:border-slate-500"
              placeholder={copy.placeholder}
              autoFocus
            />
            <button className="dense-action-primary px-5 py-2.5" type="submit">
              {copy.search}
            </button>
          </form>

          <div className="mt-4 flex flex-wrap gap-2">
            {quickSearches.map((item) => (
              <Link key={item.query} href={localizedHref(`/search?q=${encodeURIComponent(item.query)}`, language)} className="dense-status">
                {displayQuickSearchLabel(item.query, item.label, language, copy)}
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-3 grid gap-3 lg:grid-cols-[300px_minmax(0,1fr)]">
          <aside className="dense-panel h-fit p-5">
            <p className="eyebrow">{copy.index}</p>
            <h2 className="mt-2 text-2xl font-semibold">{siteSearchItems.length} {copy.entries}</h2>
            <div className="mt-4 grid gap-2">
              {Array.from(groupedCount.entries()).map(([category, count]) => {
                const categoryLabel = copy.categories[category] || category;
                return (
                  <Link key={category} href={localizedHref(`/search?q=${encodeURIComponent(categoryLabel)}`, language)} className="dense-row">
                    <span className="text-sm font-semibold">{categoryLabel}</span>
                    <span className="dense-status">{count}</span>
                  </Link>
                );
              })}
            </div>
            <div className="mt-5 border-t border-slate-200 pt-4">
              <p className="eyebrow">{copy.fastStart}</p>
              <div className="mt-3 grid gap-2">
                <Link href={localizedHref("/tools/github-repo-analyzer", language)} className="dense-action-primary justify-center">{copy.runAudit}</Link>
                <Link href={localizedHref("/tools/prompt-optimizer", language)} className="dense-action justify-center">{copy.optimizePrompt}</Link>
                <Link href={localizedHref("/tools/bug-finder", language)} className="dense-action justify-center">{copy.findBug}</Link>
              </div>
            </div>
          </aside>

          <section className="dense-panel p-5">
            <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="eyebrow">{query ? copy.results : copy.startHere}</p>
                <h2 className="mt-2 text-2xl font-semibold">
                  {query ? `${results.length} ${copy.matchesFor} ${query}` : copy.usefulEntries}
                </h2>
              </div>
              <span className="dense-status">{copy.localIndex}</span>
            </div>

            {query && results.length === 0 ? (
              <div className="dense-card p-5">
                <h3 className="text-xl font-semibold">{copy.noMatch}</h3>
                <p className="mt-3 text-sm leading-6 text-[color:var(--muted)]">
                  {copy.noMatchBody}
                </p>
              </div>
            ) : (
              <div className="grid gap-2 md:grid-cols-2">
                {resultItems.map((item) => {
                  const displayItem = displaySearchItem(item, language, copy);
                  return (
                    <Link key={`${item.category}-${item.href}`} href={localizedHref(item.href, language)} className="dense-card p-4 transition hover:-translate-y-0.5 hover:border-slate-300">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="eyebrow">{displayItem.category}</p>
                          <h3 className="mt-2 truncate text-xl font-semibold">{displayItem.title}</h3>
                        </div>
                        <span className="dense-status">{copy.open}</span>
                      </div>
                      <p className="mt-3 line-clamp-2 text-sm leading-6 text-[color:var(--muted)]">{displayItem.description}</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {displayItem.tags.map((tag) => (
                          <span key={tag} className="dense-status">{tag}</span>
                        ))}
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </section>
        </section>
      </section>
    </main>
  );
}
