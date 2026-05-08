"use client";

import { useMemo, useState } from "react";
import { type InterfaceLanguage } from "@/lib/language";
import {
  buildProgrammingQuestion,
  programmingBankPlan,
  type ProgrammingLanguageSlug,
  type ProgrammingQuestion,
} from "@/lib/programming-content";

type QuestionBankPhaseId =
  | "all"
  | "definition"
  | "syntax"
  | "trace"
  | "fill"
  | "debug"
  | "build";

type QuestionBankPhase = {
  id: QuestionBankPhaseId;
  start: number;
  end: number;
  seed: string[];
};

type QuestionBankCopy = {
  eyebrow: string;
  title: string;
  description: string;
  searchLabel: string;
  searchPlaceholder: string;
  results: (count: number) => string;
  noResults: string;
  jump: string;
  current: string;
  phase: string;
  phaseHint: string;
  range: (start: number, end: number) => string;
};

type ProgrammingQuestionBankProps = {
  language: InterfaceLanguage;
  activeLanguage: {
    slug: ProgrammingLanguageSlug;
    title: string;
    shortTitle: string;
    role: string;
  };
  questionIndex: number;
  questionShort: string;
  typeLabels: Record<ProgrammingQuestion["type"], string>;
  getQuestionTitle: (question: ProgrammingQuestion) => string;
  getQuestionPrompt: (question: ProgrammingQuestion) => string;
  onJump: (index: number) => void;
};

const questionBankPhases: QuestionBankPhase[] = [
  { id: "definition", start: 1, end: 400, seed: ["definition", "concept", "print", "value", "program"] },
  { id: "syntax", start: 401, end: 1200, seed: ["syntax", "variable", "function", "collection", "type"] },
  { id: "trace", start: 1201, end: 2000, seed: ["trace", "output", "read", "predict", "choice"] },
  { id: "fill", start: 2001, end: 3000, seed: ["fill", "blank", "keyword", "missing", "line"] },
  { id: "debug", start: 3001, end: 4000, seed: ["debug", "error", "habit", "fix", "review"] },
  { id: "build", start: 4001, end: 5000, seed: ["build", "practical", "task", "code", "project"] },
];

const questionBankPhaseLabels: Partial<Record<InterfaceLanguage, Record<QuestionBankPhaseId, string>>> & {
  en: Record<QuestionBankPhaseId, string>;
  zh: Record<QuestionBankPhaseId, string>;
} = {
  en: {
    all: "All stages",
    definition: "Stage 1 definitions",
    syntax: "Stage 2 syntax",
    trace: "Stage 3 trace output",
    fill: "Stage 4 fill blanks",
    debug: "Stage 5 debug habits",
    build: "Stage 6 build tasks",
  },
  zh: {
    all: "全部阶段",
    definition: "第一阶段 定义入门",
    syntax: "第二阶段 语法骨架",
    trace: "第三阶段 读代码猜输出",
    fill: "第四阶段 填空补全",
    debug: "第五阶段 调试习惯",
    build: "第六阶段 实操任务",
  },
  ja: {
    all: "全ステージ",
    definition: "第1段階 定義",
    syntax: "第2段階 構文",
    trace: "第3段階 出力追跡",
    fill: "第4段階 穴埋め",
    debug: "第5段階 デバッグ",
    build: "第6段階 実践",
  },
  ko: {
    all: "모든 단계",
    definition: "1단계 정의",
    syntax: "2단계 문법",
    trace: "3단계 출력 추적",
    fill: "4단계 빈칸",
    debug: "5단계 디버그",
    build: "6단계 실습",
  },
  es: {
    all: "Todas las fases",
    definition: "Fase 1 definiciones",
    syntax: "Fase 2 sintaxis",
    trace: "Fase 3 salida",
    fill: "Fase 4 huecos",
    debug: "Fase 5 depuracion",
    build: "Fase 6 practica",
  },
  fr: {
    all: "Toutes les etapes",
    definition: "Etape 1 definitions",
    syntax: "Etape 2 syntaxe",
    trace: "Etape 3 sortie",
    fill: "Etape 4 trous",
    debug: "Etape 5 debug",
    build: "Etape 6 pratique",
  },
  de: {
    all: "Alle Phasen",
    definition: "Phase 1 Definitionen",
    syntax: "Phase 2 Syntax",
    trace: "Phase 3 Ausgabe",
    fill: "Phase 4 Luecken",
    debug: "Phase 5 Debug",
    build: "Phase 6 Praxis",
  },
  pt: {
    all: "Todas as fases",
    definition: "Fase 1 definicoes",
    syntax: "Fase 2 sintaxe",
    trace: "Fase 3 saida",
    fill: "Fase 4 lacunas",
    debug: "Fase 5 debug",
    build: "Fase 6 pratica",
  },
  ru: {
    all: "Все этапы",
    definition: "Этап 1 определения",
    syntax: "Этап 2 синтаксис",
    trace: "Этап 3 вывод",
    fill: "Этап 4 пропуски",
    debug: "Этап 5 отладка",
    build: "Этап 6 практика",
  },
  ar: {
    all: "كل المراحل",
    definition: "المرحلة 1 التعريفات",
    syntax: "المرحلة 2 الصياغة",
    trace: "المرحلة 3 تتبع الناتج",
    fill: "المرحلة 4 الفراغات",
    debug: "المرحلة 5 التصحيح",
    build: "المرحلة 6 البناء",
  },
  hi: {
    all: "सभी चरण",
    definition: "चरण 1 परिभाषा",
    syntax: "चरण 2 syntax",
    trace: "चरण 3 output",
    fill: "चरण 4 fill blank",
    debug: "चरण 5 debug",
    build: "चरण 6 practice",
  },
  id: {
    all: "Semua tahap",
    definition: "Tahap 1 definisi",
    syntax: "Tahap 2 sintaks",
    trace: "Tahap 3 output",
    fill: "Tahap 4 isian",
    debug: "Tahap 5 debug",
    build: "Tahap 6 praktik",
  },
  vi: {
    all: "Tat ca giai doan",
    definition: "Giai doan 1 dinh nghia",
    syntax: "Giai doan 2 cu phap",
    trace: "Giai doan 3 dau ra",
    fill: "Giai doan 4 dien cho trong",
    debug: "Giai doan 5 debug",
    build: "Giai doan 6 thuc hanh",
  },
  th: {
    all: "ทุกขั้น",
    definition: "ขั้น 1 นิยาม",
    syntax: "ขั้น 2 syntax",
    trace: "ขั้น 3 output",
    fill: "ขั้น 4 เติมคำ",
    debug: "ขั้น 5 debug",
    build: "ขั้น 6 ฝึกปฏิบัติ",
  },
  tr: {
    all: "Tum asamalar",
    definition: "Asama 1 tanimlar",
    syntax: "Asama 2 soz dizimi",
    trace: "Asama 3 cikti",
    fill: "Asama 4 bosluk",
    debug: "Asama 5 hata ayiklama",
    build: "Asama 6 pratik",
  },
  it: {
    all: "Tutte le fasi",
    definition: "Fase 1 definizioni",
    syntax: "Fase 2 sintassi",
    trace: "Fase 3 output",
    fill: "Fase 4 completamento",
    debug: "Fase 5 debug",
    build: "Fase 6 pratica",
  },
  nl: {
    all: "Alle fasen",
    definition: "Fase 1 definities",
    syntax: "Fase 2 syntaxis",
    trace: "Fase 3 uitvoer",
    fill: "Fase 4 invullen",
    debug: "Fase 5 debug",
    build: "Fase 6 praktijk",
  },
  pl: {
    all: "Wszystkie etapy",
    definition: "Etap 1 definicje",
    syntax: "Etap 2 skladnia",
    trace: "Etap 3 wynik",
    fill: "Etap 4 luki",
    debug: "Etap 5 debug",
    build: "Etap 6 praktyka",
  },
};

const questionBankCopy: Partial<Record<InterfaceLanguage, QuestionBankCopy>> & {
  en: QuestionBankCopy;
  zh: QuestionBankCopy;
} = {
  en: {
    eyebrow: "Question bank",
    title: "Search before practice",
    description: "Pick a stage or search across the open programming bank. Jump straight to the matching drill.",
    searchLabel: "Search programming questions",
    searchPlaceholder: "search return loop vector function output error",
    results: (count) => `${count} matching questions`,
    noResults: "No question matched. Try a shorter keyword or another stage.",
    jump: "Open",
    current: "Current",
    phase: "Stage",
    phaseHint: "Search is open across all generated drills in this language.",
    range: (start, end) => `Q${start}-${end}`,
  },
  zh: {
    eyebrow: "编程题库",
    title: "先搜题 再练习",
    description: "题库按阶段开放，用户可以搜语言、概念、题型、代码关键词，然后直接跳到对应练习。",
    searchLabel: "搜索编程题",
    searchPlaceholder: "搜索 return 循环 vector 函数 输出 报错",
    results: (count) => `${count} 道匹配题`,
    noResults: "没有匹配题，换短一点的关键词或切换阶段。",
    jump: "打开",
    current: "当前",
    phase: "阶段",
    phaseHint: "搜索对当前语言的全部生成练习开放。",
    range: (start, end) => `${start}-${end}题`,
  },
  ja: {
    eyebrow: "問題バンク",
    title: "検索してから練習",
    description: "段階を選ぶか、現在の言語の問題を検索して練習へ移動します。",
    searchLabel: "プログラミング問題を検索",
    searchPlaceholder: "return loop vector function output error",
    results: (count) => `${count} 件`,
    noResults: "一致する問題がありません。短いキーワードを試してください。",
    jump: "開く",
    current: "現在",
    phase: "段階",
    phaseHint: "検索はこの言語の全ドリルに開放されています。",
    range: (start, end) => `Q${start}-${end}`,
  },
  ko: {
    eyebrow: "문제 은행",
    title: "검색하고 연습",
    description: "단계를 고르거나 현재 언어 문제를 검색한 뒤 바로 연습으로 이동합니다.",
    searchLabel: "프로그래밍 문제 검색",
    searchPlaceholder: "return loop vector function output error",
    results: (count) => `${count}개 결과`,
    noResults: "일치하는 문제가 없습니다. 더 짧은 키워드를 입력하세요.",
    jump: "열기",
    current: "현재",
    phase: "단계",
    phaseHint: "검색은 이 언어의 모든 연습에 열려 있습니다.",
    range: (start, end) => `Q${start}-${end}`,
  },
  es: {
    eyebrow: "Banco de preguntas",
    title: "Busca antes de practicar",
    description: "Elige una fase o busca dentro del banco de este lenguaje y salta al ejercicio.",
    searchLabel: "Buscar preguntas de programacion",
    searchPlaceholder: "return loop vector function output error",
    results: (count) => `${count} resultados`,
    noResults: "No hay coincidencias. Prueba una palabra mas corta.",
    jump: "Abrir",
    current: "Actual",
    phase: "Fase",
    phaseHint: "La busqueda esta abierta en todos los ejercicios de este lenguaje.",
    range: (start, end) => `Q${start}-${end}`,
  },
  fr: {
    eyebrow: "Banque de questions",
    title: "Chercher puis pratiquer",
    description: "Choisis une etape ou cherche dans la banque de ce langage puis ouvre l exercice.",
    searchLabel: "Chercher des questions de programmation",
    searchPlaceholder: "return loop vector function output error",
    results: (count) => `${count} resultats`,
    noResults: "Aucun resultat. Essaie un mot plus court.",
    jump: "Ouvrir",
    current: "Actuel",
    phase: "Etape",
    phaseHint: "La recherche couvre tous les exercices de ce langage.",
    range: (start, end) => `Q${start}-${end}`,
  },
  de: {
    eyebrow: "Fragenbank",
    title: "Erst suchen dann ueben",
    description: "Waehle eine Phase oder suche in der Fragenbank dieser Sprache und springe zur Aufgabe.",
    searchLabel: "Programmierfragen suchen",
    searchPlaceholder: "return loop vector function output error",
    results: (count) => `${count} Treffer`,
    noResults: "Keine Treffer. Versuche ein kuerzeres Wort.",
    jump: "Oeffnen",
    current: "Aktuell",
    phase: "Phase",
    phaseHint: "Die Suche ist fuer alle Uebungen dieser Sprache offen.",
    range: (start, end) => `Q${start}-${end}`,
  },
  pt: {
    eyebrow: "Banco de perguntas",
    title: "Pesquise antes de praticar",
    description: "Escolha uma fase ou pesquise no banco deste idioma e abra o exercicio.",
    searchLabel: "Pesquisar perguntas de programacao",
    searchPlaceholder: "return loop vector function output error",
    results: (count) => `${count} resultados`,
    noResults: "Sem resultados. Tente uma palavra menor.",
    jump: "Abrir",
    current: "Atual",
    phase: "Fase",
    phaseHint: "A pesquisa cobre todos os exercicios deste idioma.",
    range: (start, end) => `Q${start}-${end}`,
  },
  ru: {
    eyebrow: "Банк задач",
    title: "Сначала поиск потом практика",
    description: "Выбери этап или найди задачу в банке текущего языка и открой тренировку.",
    searchLabel: "Поиск задач по программированию",
    searchPlaceholder: "return loop vector function output error",
    results: (count) => `${count} результатов`,
    noResults: "Ничего не найдено. Попробуй более короткое слово.",
    jump: "Открыть",
    current: "Текущая",
    phase: "Этап",
    phaseHint: "Поиск открыт по всем упражнениям этого языка.",
    range: (start, end) => `Q${start}-${end}`,
  },
  ar: {
    eyebrow: "بنك الأسئلة",
    title: "ابحث ثم تدرب",
    description: "اختر مرحلة أو ابحث داخل بنك التدريب الحالي ثم افتح السؤال مباشرة.",
    searchLabel: "ابحث في أسئلة البرمجة",
    searchPlaceholder: "return loop vector function output error",
    results: (count) => `${count} سؤال مطابق`,
    noResults: "لا توجد أسئلة مطابقة. جرّب كلمة أقصر أو مرحلة أخرى.",
    jump: "افتح",
    current: "الحالي",
    phase: "مرحلة",
    phaseHint: "البحث مفتوح عبر كل تدريبات هذه اللغة.",
    range: (start, end) => `Q${start}-${end}`,
  },
  hi: {
    eyebrow: "Question bank",
    title: "पहले खोजें फिर अभ्यास करें",
    description: "चरण चुनें या इस भाषा के अभ्यास खोजें और सीधे सवाल खोलें.",
    searchLabel: "Programming questions खोजें",
    searchPlaceholder: "return loop vector function output error",
    results: (count) => `${count} results`,
    noResults: "कोई सवाल नहीं मिला. छोटा keyword आजमाएं.",
    jump: "खोलें",
    current: "वर्तमान",
    phase: "चरण",
    phaseHint: "Search इस भाषा के सभी drills में खुली है.",
    range: (start, end) => `Q${start}-${end}`,
  },
  id: {
    eyebrow: "Bank soal",
    title: "Cari lalu latihan",
    description: "Pilih tahap atau cari soal pada bahasa ini lalu buka latihan.",
    searchLabel: "Cari soal pemrograman",
    searchPlaceholder: "return loop vector function output error",
    results: (count) => `${count} hasil`,
    noResults: "Tidak ada hasil. Coba kata yang lebih pendek.",
    jump: "Buka",
    current: "Saat ini",
    phase: "Tahap",
    phaseHint: "Pencarian terbuka di semua latihan bahasa ini.",
    range: (start, end) => `Q${start}-${end}`,
  },
  vi: {
    eyebrow: "Ngan hang cau hoi",
    title: "Tim truoc khi luyen",
    description: "Chon giai doan hoac tim trong ngan hang cua ngon ngu nay roi mo bai tap.",
    searchLabel: "Tim cau hoi lap trinh",
    searchPlaceholder: "return loop vector function output error",
    results: (count) => `${count} ket qua`,
    noResults: "Khong co ket qua. Thu tu khoa ngan hon.",
    jump: "Mo",
    current: "Hien tai",
    phase: "Giai doan",
    phaseHint: "Tim kiem mo tren moi bai tap cua ngon ngu nay.",
    range: (start, end) => `Q${start}-${end}`,
  },
  th: {
    eyebrow: "คลังคำถาม",
    title: "ค้นหาก่อนฝึก",
    description: "เลือกขั้นหรือค้นหาแบบฝึกของภาษานี้ แล้วเปิดข้อที่ต้องการทันที",
    searchLabel: "ค้นหาคำถามเขียนโปรแกรม",
    searchPlaceholder: "return loop vector function output error",
    results: (count) => `${count} รายการ`,
    noResults: "ไม่พบผลลัพธ์ ลองคำที่สั้นลง",
    jump: "เปิด",
    current: "ปัจจุบัน",
    phase: "ขั้น",
    phaseHint: "ค้นหาได้ในทุกแบบฝึกของภาษานี้",
    range: (start, end) => `Q${start}-${end}`,
  },
  tr: {
    eyebrow: "Soru bankasi",
    title: "Once ara sonra calis",
    description: "Bir asama sec veya bu dilin soru bankasinda ara ve alistirmaya gec.",
    searchLabel: "Programlama sorulari ara",
    searchPlaceholder: "return loop vector function output error",
    results: (count) => `${count} sonuc`,
    noResults: "Sonuc yok. Daha kisa bir kelime dene.",
    jump: "Ac",
    current: "Mevcut",
    phase: "Asama",
    phaseHint: "Arama bu dilin tum alistirmalarinda acik.",
    range: (start, end) => `Q${start}-${end}`,
  },
  it: {
    eyebrow: "Banca domande",
    title: "Cerca prima di esercitarti",
    description: "Scegli una fase o cerca nella banca di questo linguaggio e apri l esercizio.",
    searchLabel: "Cerca domande di programmazione",
    searchPlaceholder: "return loop vector function output error",
    results: (count) => `${count} risultati`,
    noResults: "Nessun risultato. Prova una parola piu breve.",
    jump: "Apri",
    current: "Attuale",
    phase: "Fase",
    phaseHint: "La ricerca copre tutti gli esercizi di questo linguaggio.",
    range: (start, end) => `Q${start}-${end}`,
  },
  nl: {
    eyebrow: "Vragenbank",
    title: "Eerst zoeken dan oefenen",
    description: "Kies een fase of zoek in de bank van deze taal en open de oefening.",
    searchLabel: "Programmeervragen zoeken",
    searchPlaceholder: "return loop vector function output error",
    results: (count) => `${count} resultaten`,
    noResults: "Geen resultaten. Probeer een korter woord.",
    jump: "Open",
    current: "Huidig",
    phase: "Fase",
    phaseHint: "Zoeken staat open voor alle oefeningen van deze taal.",
    range: (start, end) => `Q${start}-${end}`,
  },
  pl: {
    eyebrow: "Bank pytan",
    title: "Najpierw szukaj potem cwicz",
    description: "Wybierz etap lub szukaj w banku tego jezyka i otworz zadanie.",
    searchLabel: "Szukaj pytan programistycznych",
    searchPlaceholder: "return loop vector function output error",
    results: (count) => `${count} wynikow`,
    noResults: "Brak wynikow. Sprobuj krotszego slowa.",
    jump: "Otworz",
    current: "Aktualne",
    phase: "Etap",
    phaseHint: "Wyszukiwanie obejmuje wszystkie cwiczenia tego jezyka.",
    range: (start, end) => `Q${start}-${end}`,
  },
};

function normalize(value: string) {
  return value.trim().replace(/\s+/g, " ").toLowerCase();
}

function getQuestionBankCopy(language: InterfaceLanguage) {
  return questionBankCopy[language] || questionBankCopy.en;
}

function questionBankPhaseLabel(id: QuestionBankPhaseId, language: InterfaceLanguage) {
  return (questionBankPhaseLabels[language] || questionBankPhaseLabels.en)[id];
}

function phaseForQuestionIndex(index: number) {
  return questionBankPhases.find((phase) => index >= phase.start && index <= phase.end) || questionBankPhases[0];
}

export default function ProgrammingQuestionBank({
  language,
  activeLanguage,
  questionIndex,
  questionShort,
  typeLabels,
  getQuestionTitle,
  getQuestionPrompt,
  onJump,
}: ProgrammingQuestionBankProps) {
  const [questionSearch, setQuestionSearch] = useState("");
  const [activePhaseId, setActivePhaseId] = useState<QuestionBankPhaseId>("all");
  const bankCopy = getQuestionBankCopy(language);
  const cleanQuestionSearch = normalize(questionSearch);

  const questionBankMatches = useMemo(() => {
    const selectedPhase = activePhaseId === "all"
      ? null
      : questionBankPhases.find((phase) => phase.id === activePhaseId) || null;
    const start = selectedPhase?.start ?? 1;
    const end = selectedPhase?.end ?? programmingBankPlan.perLanguage;

    return Array.from({ length: end - start + 1 }, (_, index) => start + index)
      .map((number) => {
        const item = buildProgrammingQuestion(activeLanguage.slug, number);
        const itemPhase = phaseForQuestionIndex(item.index);
        const searchable = normalize([
          activeLanguage.slug,
          activeLanguage.title,
          activeLanguage.shortTitle,
          activeLanguage.role,
          item.index,
          item.type,
          typeLabels[item.type],
          questionBankPhaseLabel(itemPhase.id, language),
          ...itemPhase.seed,
          getQuestionTitle(item),
          getQuestionPrompt(item),
          item.prompt,
          item.title,
          item.codeSnippet,
          item.answer,
          item.explanation,
          ...item.requiredKeywords,
        ].join(" "));

        return { item, phase: itemPhase, searchable };
      })
      .filter(({ searchable }) => !cleanQuestionSearch || searchable.includes(cleanQuestionSearch))
      .slice(0, 18);
  }, [
    activeLanguage.role,
    activeLanguage.shortTitle,
    activeLanguage.slug,
    activeLanguage.title,
    activePhaseId,
    cleanQuestionSearch,
    getQuestionPrompt,
    getQuestionTitle,
    language,
    typeLabels,
  ]);

  return (
    <section className="dense-panel programming-bank" aria-label={bankCopy.title}>
      <div className="programming-bank-head">
        <div>
          <p className="eyebrow">{bankCopy.eyebrow}</p>
          <h2>{bankCopy.title}</h2>
          <p>{bankCopy.description}</p>
        </div>
        <strong>{bankCopy.results(questionBankMatches.length)}</strong>
      </div>

      <label className="programming-bank-search">
        <span>{bankCopy.searchLabel}</span>
        <input
          type="search"
          value={questionSearch}
          onChange={(event) => setQuestionSearch(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && questionBankMatches[0]) {
              event.preventDefault();
              onJump(questionBankMatches[0].item.index);
            }

            if (event.key === "Escape" && questionSearch) {
              event.preventDefault();
              setQuestionSearch("");
            }
          }}
          placeholder={bankCopy.searchPlaceholder}
          dir="ltr"
        />
      </label>

      <div className="programming-bank-phases" aria-label={bankCopy.phase}>
        <button
          type="button"
          className={activePhaseId === "all" ? "programming-bank-phase active" : "programming-bank-phase"}
          onClick={() => setActivePhaseId("all")}
        >
          <span>{questionBankPhaseLabel("all", language)}</span>
          <strong>{bankCopy.range(1, programmingBankPlan.perLanguage)}</strong>
        </button>
        {questionBankPhases.map((phase) => (
          <button
            key={phase.id}
            type="button"
            className={activePhaseId === phase.id ? "programming-bank-phase active" : "programming-bank-phase"}
            onClick={() => setActivePhaseId(phase.id)}
          >
            <span>{questionBankPhaseLabel(phase.id, language)}</span>
            <strong>{bankCopy.range(phase.start, phase.end)}</strong>
          </button>
        ))}
      </div>

      <div className="programming-bank-results">
        {questionBankMatches.length > 0 ? questionBankMatches.map(({ item, phase }) => (
          <article key={item.id} className={item.index === questionIndex ? "programming-bank-result current" : "programming-bank-result"}>
            <div className="programming-bank-result-head">
              <span>{questionShort} {item.index}</span>
              <span>{typeLabels[item.type]}</span>
              <span>{questionBankPhaseLabel(phase.id, language)}</span>
            </div>
            <h3>{getQuestionTitle(item)}</h3>
            <p>{getQuestionPrompt(item)}</p>
            <button type="button" className="dense-action" onClick={() => onJump(item.index)}>
              {item.index === questionIndex ? bankCopy.current : bankCopy.jump}
            </button>
          </article>
        )) : (
          <div className="programming-bank-empty">
            <strong>{bankCopy.noResults}</strong>
            <span>{bankCopy.phaseHint}</span>
          </div>
        )}
      </div>
    </section>
  );
}
