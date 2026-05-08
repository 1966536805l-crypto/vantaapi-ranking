"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { KeyboardEvent as ReactKeyboardEvent } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { isInterfaceLanguage, localizedHref, type InterfaceLanguage } from "@/lib/language";
import { searchSite, siteSearchItems, type SiteSearchItem } from "@/lib/site-search";

const RECENT_STORAGE_KEY = "vantaapi-search-recents-v1";
const defaultHrefs = [
  "/tools/github-repo-analyzer",
  "/tools",
  "/tools/api-request-generator",
  "/tools/prompt-optimizer",
  "/tools/bug-finder",
  "/tools/dev-utilities",
  "/tools/learning-roadmap",
  "/programming",
  "/programming/python",
];

function targetIsEditable(target: EventTarget | null) {
  const element = target as HTMLElement | null;
  if (!element) return false;
  return Boolean(
    element.closest("input, textarea, select, [contenteditable='true'], [role='textbox']"),
  );
}

function uniqueItems(items: Array<SiteSearchItem | undefined>) {
  const seen = new Set<string>();
  return items.filter((item): item is SiteSearchItem => {
    if (!item || seen.has(item.href)) return false;
    seen.add(item.href);
    return true;
  });
}

function readRecentHrefs() {
  if (typeof window === "undefined") return [] as string[];
  try {
    const parsed = JSON.parse(window.localStorage.getItem(RECENT_STORAGE_KEY) || "[]") as string[];
    return Array.isArray(parsed) ? parsed.filter((href) => typeof href === "string").slice(0, 6) : [];
  } catch {
    return [];
  }
}

function writeRecentHref(href: string) {
  if (typeof window === "undefined") return;
  const next = [href, ...readRecentHrefs().filter((item) => item !== href)].slice(0, 6);
  window.localStorage.setItem(RECENT_STORAGE_KEY, JSON.stringify(next));
}

const launcherCopy: Record<InterfaceLanguage, {
  search: string;
  aria: string;
  close: string;
  placeholder: string;
  quickStart: string;
  results: (count: number) => string;
  help: string;
  open: string;
  noMatch: string;
  noMatchBody: string;
  fullSearch: string;
}> = {
  en: {
    search: "Search",
    aria: "Site search",
    close: "Close search",
    placeholder: "Search GitHub prompt bug api json python",
    quickStart: "Quick start",
    results: (count) => `${count} results`,
    help: "↑ ↓ choose · Enter open · / summon",
    open: "Open",
    noMatch: "No direct match",
    noMatchBody: "Press Enter to open the full search page for this query.",
    fullSearch: "Open full search",
  },
  zh: {
    search: "搜索",
    aria: "站内搜索",
    close: "关闭搜索",
    placeholder: "搜索 GitHub 提示词 Bug API JSON Python",
    quickStart: "快速开始",
    results: (count) => `${count} 个结果`,
    help: "↑ ↓ 选择 · Enter 打开 · / 唤起",
    open: "打开",
    noMatch: "没有直接匹配",
    noMatchBody: "按 Enter 打开完整搜索页。",
    fullSearch: "打开完整搜索",
  },
  ja: {
    search: "検索",
    aria: "サイト検索",
    close: "検索を閉じる",
    placeholder: "GitHub prompt bug api json python を検索",
    quickStart: "クイック開始",
    results: (count) => `${count} 件`,
    help: "↑ ↓ 選択 · Enter 開く · / 呼び出し",
    open: "開く",
    noMatch: "直接一致なし",
    noMatchBody: "Enter で検索ページを開きます。",
    fullSearch: "検索ページを開く",
  },
  ko: {
    search: "검색",
    aria: "사이트 검색",
    close: "검색 닫기",
    placeholder: "GitHub prompt bug api json python 검색",
    quickStart: "빠른 시작",
    results: (count) => `${count}개 결과`,
    help: "↑ ↓ 선택 · Enter 열기 · / 호출",
    open: "열기",
    noMatch: "직접 일치 없음",
    noMatchBody: "Enter 를 누르면 전체 검색을 엽니다.",
    fullSearch: "전체 검색 열기",
  },
  es: {
    search: "Buscar",
    aria: "busqueda del sitio",
    close: "cerrar busqueda",
    placeholder: "buscar GitHub prompt bug api json python",
    quickStart: "inicio rapido",
    results: (count) => `${count} resultados`,
    help: "↑ ↓ elegir · Enter abrir · / llamar",
    open: "Abrir",
    noMatch: "Sin coincidencia directa",
    noMatchBody: "Pulsa Enter para abrir la busqueda completa.",
    fullSearch: "Abrir busqueda completa",
  },
  fr: {
    search: "Rechercher",
    aria: "recherche du site",
    close: "fermer la recherche",
    placeholder: "chercher GitHub prompt bug api json python",
    quickStart: "demarrage rapide",
    results: (count) => `${count} resultats`,
    help: "↑ ↓ choisir · Enter ouvrir · / appeler",
    open: "Ouvrir",
    noMatch: "Aucun resultat direct",
    noMatchBody: "Appuie sur Enter pour ouvrir la recherche complete.",
    fullSearch: "Ouvrir la recherche",
  },
  de: {
    search: "Suchen",
    aria: "Seitensuche",
    close: "Suche schliessen",
    placeholder: "GitHub prompt bug api json python suchen",
    quickStart: "Schnellstart",
    results: (count) => `${count} Ergebnisse`,
    help: "↑ ↓ waehlen · Enter oeffnen · / aufrufen",
    open: "Oeffnen",
    noMatch: "Kein direkter Treffer",
    noMatchBody: "Druecke Enter fuer die vollstaendige Suche.",
    fullSearch: "Vollsuche oeffnen",
  },
  pt: {
    search: "Buscar",
    aria: "busca do site",
    close: "fechar busca",
    placeholder: "buscar GitHub prompt bug api json python",
    quickStart: "inicio rapido",
    results: (count) => `${count} resultados`,
    help: "↑ ↓ escolher · Enter abrir · / chamar",
    open: "Abrir",
    noMatch: "Sem correspondencia direta",
    noMatchBody: "Pressione Enter para abrir a busca completa.",
    fullSearch: "Abrir busca completa",
  },
  ru: {
    search: "Поиск",
    aria: "поиск по сайту",
    close: "закрыть поиск",
    placeholder: "искать GitHub prompt bug api json python",
    quickStart: "быстрый старт",
    results: (count) => `${count} результатов`,
    help: "↑ ↓ выбрать · Enter открыть · / вызвать",
    open: "Открыть",
    noMatch: "Нет прямого совпадения",
    noMatchBody: "Нажми Enter чтобы открыть полный поиск.",
    fullSearch: "Открыть полный поиск",
  },
  ar: {
    search: "بحث",
    aria: "بحث في الموقع",
    close: "إغلاق البحث",
    placeholder: "ابحث عن GitHub أو prompt أو bug أو api أو json أو python",
    quickStart: "بداية سريعة",
    results: (count) => `${count} نتائج`,
    help: "↑ ↓ اختيار · Enter فتح · / استدعاء",
    open: "فتح",
    noMatch: "لا يوجد تطابق مباشر",
    noMatchBody: "اضغط Enter لفتح صفحة البحث الكاملة.",
    fullSearch: "فتح البحث الكامل",
  },
  hi: {
    search: "खोज",
    aria: "site search",
    close: "search बंद करें",
    placeholder: "GitHub prompt bug api json python खोजें",
    quickStart: "quick start",
    results: (count) => `${count} results`,
    help: "↑ ↓ चुनें · Enter खोलें · / बुलाएं",
    open: "खोलें",
    noMatch: "सीधा match नहीं",
    noMatchBody: "पूरी search page खोलने के लिए Enter दबाएं.",
    fullSearch: "पूरी search खोलें",
  },
  id: {
    search: "Cari",
    aria: "pencarian situs",
    close: "tutup pencarian",
    placeholder: "cari GitHub prompt bug api json python",
    quickStart: "mulai cepat",
    results: (count) => `${count} hasil`,
    help: "↑ ↓ pilih · Enter buka · / panggil",
    open: "Buka",
    noMatch: "Tidak ada cocok langsung",
    noMatchBody: "Tekan Enter untuk membuka halaman pencarian penuh.",
    fullSearch: "Buka pencarian penuh",
  },
  vi: {
    search: "Tim",
    aria: "tim kiem trong site",
    close: "dong tim kiem",
    placeholder: "tim GitHub prompt bug api json python",
    quickStart: "bat dau nhanh",
    results: (count) => `${count} ket qua`,
    help: "↑ ↓ chon · Enter mo · / goi",
    open: "Mo",
    noMatch: "Khong co ket qua truc tiep",
    noMatchBody: "Nhan Enter de mo trang tim kiem day du.",
    fullSearch: "Mo tim kiem day du",
  },
  th: {
    search: "ค้นหา",
    aria: "ค้นหาในไซต์",
    close: "ปิดการค้นหา",
    placeholder: "ค้นหา GitHub prompt bug api json python",
    quickStart: "เริ่มเร็ว",
    results: (count) => `${count} ผลลัพธ์`,
    help: "↑ ↓ เลือก · Enter เปิด · / เรียก",
    open: "เปิด",
    noMatch: "ไม่พบตรงๆ",
    noMatchBody: "กด Enter เพื่อเปิดหน้าค้นหาเต็ม.",
    fullSearch: "เปิดการค้นหาเต็ม",
  },
  tr: {
    search: "Ara",
    aria: "site arama",
    close: "aramayi kapat",
    placeholder: "GitHub prompt bug api json python ara",
    quickStart: "hizli basla",
    results: (count) => `${count} sonuc`,
    help: "↑ ↓ sec · Enter ac · / cagir",
    open: "Ac",
    noMatch: "Dogrudan eslesme yok",
    noMatchBody: "Tam arama sayfasini acmak icin Enter a bas.",
    fullSearch: "Tam aramayi ac",
  },
  it: {
    search: "Cerca",
    aria: "ricerca nel sito",
    close: "chiudi ricerca",
    placeholder: "cerca GitHub prompt bug api json python",
    quickStart: "avvio rapido",
    results: (count) => `${count} risultati`,
    help: "↑ ↓ scegli · Enter apri · / richiama",
    open: "Apri",
    noMatch: "Nessuna corrispondenza diretta",
    noMatchBody: "Premi Enter per aprire la ricerca completa.",
    fullSearch: "Apri ricerca completa",
  },
  nl: {
    search: "Zoeken",
    aria: "site zoeken",
    close: "zoeken sluiten",
    placeholder: "zoek GitHub prompt bug api json python",
    quickStart: "snel starten",
    results: (count) => `${count} resultaten`,
    help: "↑ ↓ kies · Enter open · / roep op",
    open: "Open",
    noMatch: "Geen directe match",
    noMatchBody: "Druk Enter om de volledige zoekpagina te openen.",
    fullSearch: "Volledige zoekactie openen",
  },
  pl: {
    search: "Szukaj",
    aria: "wyszukiwanie w witrynie",
    close: "zamknij wyszukiwanie",
    placeholder: "szukaj GitHub prompt bug api json python",
    quickStart: "szybki start",
    results: (count) => `${count} wynikow`,
    help: "↑ ↓ wybierz · Enter otworz · / przywolaj",
    open: "Otworz",
    noMatch: "Brak bezposredniego wyniku",
    noMatchBody: "Nacisnij Enter aby otworzyc pelne wyszukiwanie.",
    fullSearch: "Otworz pelne wyszukiwanie",
  },
};

type DisplaySearchCopy = {
  categories: {
    start: string;
    tools: string;
    coding: string;
  };
  staticItems: Record<string, { title: string; description: string }>;
  toolTitles: Record<string, string>;
  toolDescriptions: Record<string, string>;
  programmingLanguageTitle: (name: string) => string;
  programmingLanguageDescription: (name: string) => string;
};

const searchResultCopy: Record<InterfaceLanguage, DisplaySearchCopy> = {
  en: {
    categories: { start: "Start", tools: "AI Tools", coding: "Coding Lab" },
    staticItems: {
      "/search": { title: "Site Search", description: "Find tools lessons routes and launch checklists from one box" },
      "/tools/github-repo-analyzer": { title: "GitHub Launch Audit", description: "Paste a public repo and get blockers score and a fix checklist" },
      "/programming": { title: "Programming Learning Lab", description: "Zero foundation routes for languages used by real developers" },
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
      "github-repo-analyzer": "Audit public repositories for release blockers and launch readiness",
      "prompt-optimizer": "Turn rough requests into clearer AI prompts",
      "code-explainer": "Read code faster with purpose risks and learning notes",
      "bug-finder": "Turn errors and snippets into a debug path",
      "api-request-generator": "Generate curl fetch axios and Python requests examples",
      "dev-utilities": "Format JSON test regex and convert timestamps",
      "learning-roadmap": "Build a practical programming plan from zero",
    },
    programmingLanguageTitle: (name) => `${name} Learning Lab`,
    programmingLanguageDescription: (name) => `Definitions syntax drills and practice path for ${name}`,
  },
  zh: {
    categories: { start: "入口", tools: "AI 工具", coding: "编程实验室" },
    staticItems: {
      "/search": { title: "站内搜索", description: "一个入口搜索工具 课程 路线和上线检查清单" },
      "/tools/github-repo-analyzer": { title: "GitHub 上线体检", description: "粘贴公开仓库 生成阻塞项 评分和修复清单" },
      "/programming": { title: "编程学习实验室", description: "面向零基础的真实开发语言学习路径" },
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
    programmingLanguageTitle: (name) => `${name} 学习实验室`,
    programmingLanguageDescription: (name) => `${name} 的定义 语法训练和练习路径`,
  },
  ja: {
    categories: { start: "入口", tools: "AI ツール", coding: "プログラミング" },
    staticItems: {
      "/search": { title: "サイト検索", description: "ツール レッスン ルート 公開前チェックを一つの検索で探す" },
      "/tools/github-repo-analyzer": { title: "GitHub 公開前監査", description: "公開リポジトリから課題 スコア 修正チェックを作成" },
      "/programming": { title: "プログラミング学習ラボ", description: "ゼロから実務言語を学ぶためのルート" },
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
    programmingLanguageTitle: (name) => `${name} 学習ラボ`,
    programmingLanguageDescription: (name) => `${name} の定義 文法練習 実践ルート`,
  },
  ko: {
    categories: { start: "시작", tools: "AI 도구", coding: "코딩 랩" },
    staticItems: {
      "/search": { title: "사이트 검색", description: "도구 수업 경로 출시 체크리스트를 한 번에 찾기" },
      "/tools/github-repo-analyzer": { title: "GitHub 출시 점검", description: "공개 저장소로 차단 이슈 점수 수정 목록 생성" },
      "/programming": { title: "프로그래밍 학습 랩", description: "초보자를 위한 실제 개발 언어 학습 경로" },
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
    programmingLanguageTitle: (name) => `${name} 학습 랩`,
    programmingLanguageDescription: (name) => `${name} 정의 문법 훈련 실습 경로`,
  },
  es: {
    categories: { start: "Inicio", tools: "Herramientas AI", coding: "Laboratorio de codigo" },
    staticItems: {
      "/search": { title: "Busqueda del sitio", description: "Encuentra herramientas rutas y listas de lanzamiento desde una caja" },
      "/tools/github-repo-analyzer": { title: "Auditoria de lanzamiento GitHub", description: "Pega un repo publico y recibe bloqueos puntuacion y checklist" },
      "/programming": { title: "Laboratorio de programacion", description: "Rutas desde cero para lenguajes usados por desarrolladores" },
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
    programmingLanguageTitle: (name) => `Laboratorio de ${name}`,
    programmingLanguageDescription: (name) => `Definiciones sintaxis ejercicios y ruta practica para ${name}`,
  },
  fr: {
    categories: { start: "Depart", tools: "Outils AI", coding: "Lab de code" },
    staticItems: {
      "/search": { title: "Recherche du site", description: "Trouver outils parcours et checklists de lancement en un seul champ" },
      "/tools/github-repo-analyzer": { title: "Audit de lancement GitHub", description: "Coller un repo public et obtenir blocages score et checklist" },
      "/programming": { title: "Lab d apprentissage code", description: "Parcours debutant pour les langages de developpeurs" },
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
    programmingLanguageTitle: (name) => `Lab ${name}`,
    programmingLanguageDescription: (name) => `Definitions syntaxe exercices et parcours pratique pour ${name}`,
  },
  de: {
    categories: { start: "Start", tools: "AI Werkzeuge", coding: "Coding Lab" },
    staticItems: {
      "/search": { title: "Seitensuche", description: "Werkzeuge Lernwege und Launch Checklisten in einem Feld finden" },
      "/tools/github-repo-analyzer": { title: "GitHub Launch Audit", description: "Oeffentliches Repo einfuegen und Blocker Score Checkliste erhalten" },
      "/programming": { title: "Programmier Lernlabor", description: "Einsteigerpfade fuer echte Entwicklersprachen" },
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
    programmingLanguageTitle: (name) => `${name} Lernlabor`,
    programmingLanguageDescription: (name) => `Definitionen Syntax Uebungen und Praxisroute fuer ${name}`,
  },
  pt: {
    categories: { start: "Inicio", tools: "Ferramentas AI", coding: "Laboratorio de codigo" },
    staticItems: {
      "/search": { title: "Busca do site", description: "Encontre ferramentas rotas e checklists de lancamento em uma caixa" },
      "/tools/github-repo-analyzer": { title: "Auditoria GitHub", description: "Cole um repo publico e receba bloqueios pontuacao e checklist" },
      "/programming": { title: "Laboratorio de programacao", description: "Rotas do zero para linguagens usadas por devs" },
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
    programmingLanguageTitle: (name) => `Laboratorio de ${name}`,
    programmingLanguageDescription: (name) => `Definicoes sintaxe exercicios e rota pratica para ${name}`,
  },
  ru: {
    categories: { start: "Старт", tools: "AI инструменты", coding: "Лаборатория кода" },
    staticItems: {
      "/search": { title: "Поиск по сайту", description: "Инструменты маршруты и чеклисты запуска в одном поиске" },
      "/tools/github-repo-analyzer": { title: "Аудит запуска GitHub", description: "Вставь публичный repo и получи блокеры оценку и чеклист" },
      "/programming": { title: "Лаборатория программирования", description: "Маршруты с нуля для языков разработчиков" },
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
    programmingLanguageTitle: (name) => `Лаборатория ${name}`,
    programmingLanguageDescription: (name) => `Определения синтаксис упражнения и практика для ${name}`,
  },
  ar: {
    categories: { start: "البداية", tools: "أدوات AI", coding: "مختبر البرمجة" },
    staticItems: {
      "/search": { title: "بحث الموقع", description: "ابحث عن الأدوات والمسارات وقوائم الإطلاق من مكان واحد" },
      "/tools/github-repo-analyzer": { title: "فحص إطلاق GitHub", description: "الصق مستودعا عاما لتحصل على العوائق والنتيجة وقائمة الإصلاح" },
      "/programming": { title: "مختبر تعلم البرمجة", description: "مسارات من الصفر للغات التي يستخدمها المطورون" },
    },
    toolTitles: {
      "github-repo-analyzer": "فحص إطلاق GitHub",
      "prompt-optimizer": "محسن Prompt بالذكاء الاصطناعي",
      "code-explainer": "شارح الكود",
      "bug-finder": "محدد الأخطاء",
      "api-request-generator": "منشئ طلبات API",
      "dev-utilities": "أدوات JSON و Regex والوقت",
      "learning-roadmap": "خطة تعلم البرمجة AI",
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
    programmingLanguageTitle: (name) => `مختبر ${name}`,
    programmingLanguageDescription: (name) => `تعريفات وقواعد وتدريب عملي لتعلم ${name}`,
  },
  hi: {
    categories: { start: "शुरुआत", tools: "AI tools", coding: "coding lab" },
    staticItems: {
      "/search": { title: "site search", description: "tools routes aur launch checklist ek jagah search karein" },
      "/tools/github-repo-analyzer": { title: "GitHub launch audit", description: "public repo paste karke blockers score aur checklist paayein" },
      "/programming": { title: "programming learning lab", description: "zero base se developer languages seekhne ke routes" },
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
    programmingLanguageTitle: (name) => `${name} learning lab`,
    programmingLanguageDescription: (name) => `${name} ke definitions syntax drills aur practice route`,
  },
  id: {
    categories: { start: "Mulai", tools: "Alat AI", coding: "Lab coding" },
    staticItems: {
      "/search": { title: "Pencarian situs", description: "Cari alat rute dan checklist rilis dari satu kotak" },
      "/tools/github-repo-analyzer": { title: "Audit rilis GitHub", description: "Tempel repo publik untuk blocker skor dan checklist" },
      "/programming": { title: "Lab belajar programming", description: "Rute nol dasar untuk bahasa developer" },
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
    programmingLanguageTitle: (name) => `Lab ${name}`,
    programmingLanguageDescription: (name) => `Definisi sintaks latihan dan rute praktik untuk ${name}`,
  },
  vi: {
    categories: { start: "Bat dau", tools: "Cong cu AI", coding: "Phong lab code" },
    staticItems: {
      "/search": { title: "Tim kiem site", description: "Tim cong cu lo trinh va checklist phat hanh trong mot o" },
      "/tools/github-repo-analyzer": { title: "Kiem tra ra mat GitHub", description: "Dan repo cong khai de co diem blocker va checklist" },
      "/programming": { title: "Lab hoc lap trinh", description: "Lo trinh tu con so 0 cho ngon ngu developer" },
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
    programmingLanguageTitle: (name) => `Lab ${name}`,
    programmingLanguageDescription: (name) => `Dinh nghia cu phap bai tap va lo trinh cho ${name}`,
  },
  th: {
    categories: { start: "เริ่ม", tools: "เครื่องมือ AI", coding: "แล็บโค้ด" },
    staticItems: {
      "/search": { title: "ค้นหาในไซต์", description: "ค้นหาเครื่องมือ เส้นทาง และ checklist เปิดตัวในช่องเดียว" },
      "/tools/github-repo-analyzer": { title: "ตรวจเปิดตัว GitHub", description: "วาง repo สาธารณะเพื่อดู blocker score และ checklist" },
      "/programming": { title: "แล็บเรียนเขียนโปรแกรม", description: "เส้นทางจากศูนย์สำหรับภาษา developer" },
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
    programmingLanguageTitle: (name) => `แล็บ ${name}`,
    programmingLanguageDescription: (name) => `นิยาม syntax แบบฝึก และเส้นทางฝึกสำหรับ ${name}`,
  },
  tr: {
    categories: { start: "Baslangic", tools: "AI araclari", coding: "Kod lab" },
    staticItems: {
      "/search": { title: "Site arama", description: "Araclari rotalari ve launch checklistleri tek kutuda bul" },
      "/tools/github-repo-analyzer": { title: "GitHub launch denetimi", description: "Public repo yapistir blocker skor ve checklist al" },
      "/programming": { title: "Programlama ogrenme lab", description: "Sifirdan developer dilleri icin rotalar" },
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
    programmingLanguageTitle: (name) => `${name} lab`,
    programmingLanguageDescription: (name) => `${name} icin tanimlar soz dizimi alistirma ve rota`,
  },
  it: {
    categories: { start: "Avvio", tools: "Strumenti AI", coding: "Lab codice" },
    staticItems: {
      "/search": { title: "Ricerca sito", description: "Trova strumenti percorsi e checklist di lancio in una sola casella" },
      "/tools/github-repo-analyzer": { title: "Audit lancio GitHub", description: "Incolla un repo pubblico e ottieni blocchi score e checklist" },
      "/programming": { title: "Lab di programmazione", description: "Percorsi da zero per linguaggi usati dai developer" },
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
    programmingLanguageTitle: (name) => `Lab ${name}`,
    programmingLanguageDescription: (name) => `Definizioni sintassi esercizi e percorso pratico per ${name}`,
  },
  nl: {
    categories: { start: "Start", tools: "AI tools", coding: "Code lab" },
    staticItems: {
      "/search": { title: "Site zoeken", description: "Vind tools routes en launch checklists vanuit een zoekvak" },
      "/tools/github-repo-analyzer": { title: "GitHub launch audit", description: "Plak een publiek repo en krijg blockers score en checklist" },
      "/programming": { title: "Programmeer leerlab", description: "Nul basis routes voor talen van developers" },
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
    programmingLanguageTitle: (name) => `${name} leerlab`,
    programmingLanguageDescription: (name) => `Definities syntax oefeningen en praktijkroute voor ${name}`,
  },
  pl: {
    categories: { start: "Start", tools: "Narzędzia AI", coding: "Lab kodu" },
    staticItems: {
      "/search": { title: "Wyszukiwanie", description: "Znajdz narzedzia sciezki i checklisty launch w jednym polu" },
      "/tools/github-repo-analyzer": { title: "Audyt launch GitHub", description: "Wklej publiczne repo aby dostac blokery score i checklist" },
      "/programming": { title: "Lab nauki programowania", description: "Sciezki od zera dla jezykow developerow" },
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
    programmingLanguageTitle: (name) => `Lab ${name}`,
    programmingLanguageDescription: (name) => `Definicje skladnia cwiczenia i trasa praktyki dla ${name}`,
  },
};

function programmingNameFromTitle(title: string) {
  return title.replace(/\s+Learning Lab$/i, "");
}

function localizedSearchItem(item: SiteSearchItem, language: InterfaceLanguage) {
  const copy = searchResultCopy[language];
  const staticItem = copy.staticItems[item.href];
  if (staticItem) {
    return {
      title: staticItem.title,
      category: item.category === "Coding Lab" ? copy.categories.coding : item.category === "AI Tools" ? copy.categories.tools : copy.categories.start,
      description: staticItem.description,
    };
  }

  const toolSlug = item.href.match(/^\/tools\/([^/?#]+)/)?.[1];
  if (toolSlug && copy.toolTitles[toolSlug]) {
    return {
      title: copy.toolTitles[toolSlug],
      category: copy.categories.tools,
      description: copy.toolDescriptions[toolSlug],
    };
  }

  const programmingSlug = item.href.match(/^\/programming\/([^/?#]+)/)?.[1];
  if (programmingSlug) {
    const name = programmingNameFromTitle(item.title);
    return {
      title: copy.programmingLanguageTitle(name),
      category: copy.categories.coding,
      description: copy.programmingLanguageDescription(name),
    };
  }

  return {
    title: item.title,
    category: item.category === "Coding Lab" ? copy.categories.coding : item.category === "AI Tools" ? copy.categories.tools : item.category,
    description: item.description,
  };
}

function currentLanguageFromLocation(): InterfaceLanguage {
  if (typeof window === "undefined") return "en";
  const value = new URL(window.location.href).searchParams.get("lang");
  return isInterfaceLanguage(value) ? value : "en";
}

export default function GlobalSearchLauncher() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [recentHrefs, setRecentHrefs] = useState<string[]>([]);
  const [language, setLanguage] = useState<InterfaceLanguage>("en");
  const copy = launcherCopy[language];

  const defaultItems = useMemo(() => {
    const recentItems = recentHrefs.map((href) => siteSearchItems.find((item) => item.href === href));
    const pinnedItems = defaultHrefs.map((href) => siteSearchItems.find((item) => item.href === href));
    return uniqueItems([...recentItems, ...pinnedItems]).slice(0, 8);
  }, [recentHrefs]);

  const results = useMemo(() => {
    const cleanQuery = query.trim();
    return cleanQuery ? searchSite(cleanQuery, 8) : defaultItems;
  }, [defaultItems, query]);

  const selectedItem = results[Math.min(selectedIndex, Math.max(results.length - 1, 0))];

  const showLauncher = useCallback(() => {
    setLanguage(currentLanguageFromLocation());
    setOpen(true);
    setRecentHrefs(readRecentHrefs());
    window.setTimeout(() => inputRef.current?.focus(), 0);
  }, []);

  const closeLauncher = useCallback(() => {
    setOpen(false);
    setQuery("");
    setSelectedIndex(0);
  }, []);

  const openItem = useCallback((item: SiteSearchItem) => {
    writeRecentHref(item.href);
    closeLauncher();
    router.push(localizedHref(item.href, language));
  }, [closeLauncher, language, router]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => setLanguage(currentLanguageFromLocation()), 0);
    return () => window.clearTimeout(timeoutId);
  }, []);

  useEffect(() => {
    function handleGlobalKeyDown(event: globalThis.KeyboardEvent) {
      if (event.key === "Escape" && open) {
        event.preventDefault();
        closeLauncher();
        return;
      }

      if (targetIsEditable(event.target)) return;

      const isCommandSearch = (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k";
      const isSlashSearch = !event.altKey && !event.metaKey && !event.ctrlKey && event.key === "/";
      if (isCommandSearch || isSlashSearch) {
        event.preventDefault();
        showLauncher();
      }
    }

    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, [closeLauncher, open, showLauncher]);

  function handleInputKeyDown(event: ReactKeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setSelectedIndex((index) => (index + 1) % Math.max(results.length, 1));
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setSelectedIndex((index) => (index - 1 + Math.max(results.length, 1)) % Math.max(results.length, 1));
      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();
      if (selectedItem) {
        openItem(selectedItem);
      } else if (query.trim()) {
        writeRecentHref(`/search?q=${encodeURIComponent(query.trim())}`);
        closeLauncher();
        router.push(localizedHref(`/search?q=${encodeURIComponent(query.trim())}`, language));
      }
    }
  }

  return (
    <>
      <button
        type="button"
        className="global-search-trigger"
        onClick={showLauncher}
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <span>{copy.search}</span>
        <kbd>/</kbd>
      </button>

      {open ? (
        <div className="global-search-overlay" role="dialog" aria-modal="true" aria-label={copy.aria}>
          <button type="button" className="global-search-backdrop" aria-label={copy.close} onClick={closeLauncher} />
          <section className="global-search-panel">
            <div className="global-search-input-wrap">
              <span>JM</span>
              <input
                ref={inputRef}
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setSelectedIndex(0);
                }}
                onKeyDown={handleInputKeyDown}
                placeholder={copy.placeholder}
                autoComplete="off"
                spellCheck={false}
              />
              <kbd>Esc</kbd>
            </div>

            <div className="global-search-help">
              <span>{query ? copy.results(results.length) : copy.quickStart}</span>
              <span>{copy.help}</span>
            </div>

            {results.length > 0 ? (
              <div className="global-search-results">
                {results.map((item, index) => {
                  const displayItem = localizedSearchItem(item, language);
                  return (
                    <button
                      key={`${item.href}-${item.category}`}
                      type="button"
                      className={`global-search-result ${index === selectedIndex ? "global-search-result-active" : ""}`}
                      onMouseEnter={() => setSelectedIndex(index)}
                      onClick={() => openItem(item)}
                    >
                      <span>
                        <strong>{displayItem.title}</strong>
                        <small>{displayItem.category} · {displayItem.description}</small>
                      </span>
                      <em>{copy.open}</em>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="global-search-empty">
                <strong>{copy.noMatch}</strong>
                <p>{copy.noMatchBody}</p>
                <Link href={localizedHref(`/search?q=${encodeURIComponent(query.trim())}`, language)} onClick={closeLauncher}>
                  {copy.fullSearch}
                </Link>
              </div>
            )}
          </section>
        </div>
      ) : null}
    </>
  );
}
