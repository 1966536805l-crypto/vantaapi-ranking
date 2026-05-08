import Link from "next/link";
import type { Metadata } from "next";
import FlagLanguageToggle from "@/components/layout/FlagLanguageToggle";
import { localizedHref, resolveInterfaceLanguage, type InterfaceLanguage, type PageSearchParams } from "@/lib/language";
import { searchSite, siteSearchItems } from "@/lib/site-search";

type SearchPageProps = {
  searchParams?: Promise<PageSearchParams & { q?: string }>;
};

export const metadata: Metadata = {
  title: "开发者工具搜索 - GitHub 上线体检 AI 工具 - JinMing Lab",
  description: "搜索 JinMing Lab 的 GitHub 上线体检、Prompt 优化、Bug 定位、API 请求生成、JSON 正则时间戳工具和编程路线。",
  keywords: ["GitHub 上线体检", "AI 开发者工具", "Prompt 优化", "Bug 定位", "API 请求生成", "编程路线"],
  alternates: {
    canonical: "/search",
  },
  openGraph: {
    title: "开发者工具搜索 - JinMing Lab",
    description: "搜索 GitHub 上线体检、AI 开发者工具、Bug 定位、Prompt 优化和 API 请求生成页面。",
    url: "https://vantaapi.com/search",
    siteName: "JinMing Lab",
    type: "website",
  },
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
    title: "Busca auditorías AI tools y rutas de programación",
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
    title: "Rechercher audits AI tools et parcours de code",
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
    launchAudit: "Launch Audit",
    tools: "AI Tools",
    coding: "Programmieren",
    eyebrow: "Entwickler Tool Suche",
    title: "Launch Audits AI Tools und Coding Wege suchen",
    body: "Suche für GitHub Launch Audit, Prompt, Bug, API, Dev Utilities und Programmierwege.",
    placeholder: "GitHub prompt bug api json python suchen",
    search: "Suchen",
    index: "Index",
    entries: "öffentliche Einträge",
    fastStart: "Schnellstart",
    runAudit: "GitHub Audit starten",
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
    categories: { Start: "Start", "AI Tools": "AI Tools", "Coding Lab": "Coding Lab" },
  },
  pt: {
    launchAudit: "Auditoria",
    tools: "Ferramentas AI",
    coding: "Programação",
    eyebrow: "Busca de ferramentas",
    title: "Buscar auditorias AI tools e rotas de programação",
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
    tools: "أدوات AI",
    coding: "البرمجة",
    eyebrow: "بحث أدوات المطور",
    title: "ابحث في تدقيق الإطلاق وأدوات AI ومسارات البرمجة",
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
    categories: { Start: "البداية", "AI Tools": "أدوات AI", "Coding Lab": "مختبر البرمجة" },
  },
  hi: {
    launchAudit: "लॉन्च ऑडिट",
    tools: "AI टूल्स",
    coding: "प्रोग्रामिंग",
    eyebrow: "डेवलपर टूल खोज",
    title: "लॉन्च ऑडिट AI टूल्स और कोडिंग रास्ते खोजें",
    body: "GitHub audit, Prompt, Bug, API, dev utilities और programming routes पर केंद्रित खोज।",
    placeholder: "GitHub prompt bug api json python खोजें",
    search: "खोजें",
    index: "इंडेक्स",
    entries: "public entries",
    fastStart: "तेज शुरुआत",
    runAudit: "GitHub audit चलाएं",
    optimizePrompt: "Prompt सुधारें",
    findBug: "Bug खोजें",
    results: "नतीजे",
    startHere: "यहां शुरू करें",
    matchesFor: "matches for",
    usefulEntries: "सबसे उपयोगी entries",
    localIndex: "local index",
    noMatch: "अभी match नहीं",
    noMatchBody: "GitHub prompt bug api json python जैसे छोटे शब्द आजमाएं",
    open: "खोलें",
    categories: { Start: "शुरुआत", "AI Tools": "AI टूल्स", "Coding Lab": "कोडिंग लैब" },
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
    categories: { Start: "เริ่ม", "AI Tools": "เครื่องมือ AI", "Coding Lab": "Coding Lab" },
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
    launchAudit: "Launch audit",
    tools: "AI tools",
    coding: "Programmeren",
    eyebrow: "Developer tool zoeken",
    title: "Zoek audits AI tools en coding routes",
    body: "Zoeken in GitHub audits, prompts, bugs, API, dev utilities en programmeerroutes.",
    placeholder: "Zoek GitHub prompt bug api json python",
    search: "Zoeken",
    index: "Index",
    entries: "publieke ingangen",
    fastStart: "Snel starten",
    runAudit: "GitHub audit starten",
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
    categories: { Start: "Start", "AI Tools": "AI tools", "Coding Lab": "Coding Lab" },
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

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = searchParams ? await searchParams : undefined;
  const language = resolveInterfaceLanguage(params);
  const copy = getSearchCopy(language);
  const isRtl = language === "ar";
  const rawQuery = Array.isArray(params?.q) ? params?.q[0] : params?.q;
  const query = (rawQuery || "").trim().slice(0, 80);
  const results = searchSite(query);
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
                {item.label}
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-3 grid gap-3 lg:grid-cols-[300px_minmax(0,1fr)]">
          <aside className="dense-panel h-fit p-5">
            <p className="eyebrow">{copy.index}</p>
            <h2 className="mt-2 text-2xl font-semibold">{siteSearchItems.length} {copy.entries}</h2>
            <div className="mt-4 grid gap-2">
              {Array.from(groupedCount.entries()).map(([category, count]) => (
                <Link key={category} href={localizedHref(`/search?q=${encodeURIComponent(category)}`, language)} className="dense-row">
                  <span className="text-sm font-semibold">{copy.categories[category] || category}</span>
                  <span className="dense-status">{count}</span>
                </Link>
              ))}
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
                {resultItems.map((item) => (
                  <Link key={`${item.category}-${item.href}`} href={localizedHref(item.href, language)} className="dense-card p-4 transition hover:-translate-y-0.5 hover:border-slate-300">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="eyebrow">{item.category}</p>
                        <h3 className="mt-2 truncate text-xl font-semibold">{item.title}</h3>
                      </div>
                      <span className="dense-status">{copy.open}</span>
                    </div>
                    <p className="mt-3 line-clamp-2 text-sm leading-6 text-[color:var(--muted)]">{item.description}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {item.tags.slice(0, 3).map((tag) => (
                        <span key={tag} className="dense-status">{tag}</span>
                      ))}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>
        </section>
      </section>
    </main>
  );
}
