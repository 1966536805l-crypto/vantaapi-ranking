"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useMemo, useRef, useState, useEffect } from "react";
import FlagLanguageToggle from "@/components/layout/FlagLanguageToggle";
import AICoachPanel from "@/components/learning/AICoachPanel";
import LearningFullscreenButton from "@/components/learning/LearningFullscreenButton";
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

type LineageProfile = {
  family: string;
  roots: string[];
  relatives: ProgrammingLanguageSlug[];
  next: ProgrammingLanguageSlug[];
  useCase: string;
};

const typeLabel: Record<InterfaceLanguage, Record<ProgrammingQuestion["type"], string>> = {
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
  ja: {
    MULTIPLE_CHOICE: "選択",
    FILL_BLANK: "穴埋め",
    PRACTICAL: "実践",
  },
  ko: {
    MULTIPLE_CHOICE: "선택",
    FILL_BLANK: "빈칸",
    PRACTICAL: "실습",
  },
  es: {
    MULTIPLE_CHOICE: "opción",
    FILL_BLANK: "rellenar",
    PRACTICAL: "práctica",
  },
  fr: {
    MULTIPLE_CHOICE: "Choix",
    FILL_BLANK: "Texte manquant",
    PRACTICAL: "Pratique",
  },
  de: {
    MULTIPLE_CHOICE: "Auswahl",
    FILL_BLANK: "Luecke",
    PRACTICAL: "Praxis",
  },
  pt: {
    MULTIPLE_CHOICE: "Escolha",
    FILL_BLANK: "Lacuna",
    PRACTICAL: "Pratica",
  },
  ru: {
    MULTIPLE_CHOICE: "Выбор",
    FILL_BLANK: "Пропуск",
    PRACTICAL: "Практика",
  },
  ar: {
    MULTIPLE_CHOICE: "اختيار",
    FILL_BLANK: "فراغ",
    PRACTICAL: "عملي",
  },
  hi: {
    MULTIPLE_CHOICE: "विकल्प",
    FILL_BLANK: "रिक्त",
    PRACTICAL: "अभ्यास",
  },
  id: {
    MULTIPLE_CHOICE: "Pilihan",
    FILL_BLANK: "Isian",
    PRACTICAL: "Praktik",
  },
  vi: {
    MULTIPLE_CHOICE: "Lua chon",
    FILL_BLANK: "Dien cho trong",
    PRACTICAL: "Thuc hanh",
  },
  th: {
    MULTIPLE_CHOICE: "ตัวเลือก",
    FILL_BLANK: "เติมคำ",
    PRACTICAL: "ฝึกปฏิบัติ",
  },
  tr: {
    MULTIPLE_CHOICE: "Secim",
    FILL_BLANK: "Bosluk",
    PRACTICAL: "Pratik",
  },
  it: {
    MULTIPLE_CHOICE: "Scelta",
    FILL_BLANK: "Completa",
    PRACTICAL: "Pratica",
  },
  nl: {
    MULTIPLE_CHOICE: "Keuze",
    FILL_BLANK: "Invullen",
    PRACTICAL: "Praktijk",
  },
  pl: {
    MULTIPLE_CHOICE: "Wybor",
    FILL_BLANK: "Luka",
    PRACTICAL: "Praktyka",
  },
};

const zeroBaseSteps: Partial<Record<InterfaceLanguage, string[]>> & { en: string[]; zh: string[] } = {
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
  ja: [
    "規則を一つ読む",
    "出力を予測",
    "記憶で入力",
    "チェックを実行",
    "一つ変えて反復",
  ],
  ko: [
    "규칙 하나 읽기",
    "출력 예측",
    "기억으로 입력",
    "검사 실행",
    "하나 바꿔 반복",
  ],
  es: [
    "lee una regla",
    "predice la salida",
    "escribe de memoria",
    "ejecuta revisión",
    "repite con un cambio",
  ],
  fr: [
    "lire une regle",
    "prevoir la sortie",
    "taper de memoire",
    "lancer la verification",
    "recommencer avec un changement",
  ],
  de: [
    "eine Regel lesen",
    "Ausgabe vorhersagen",
    "aus dem Gedaechtnis tippen",
    "Pruefung ausfuehren",
    "mit einer Aenderung wiederholen",
  ],
  pt: [
    "ler uma regra",
    "prever a saida",
    "digitar de memoria",
    "rodar a verificacao",
    "repetir com uma mudanca",
  ],
  ru: [
    "прочитать одно правило",
    "предсказать вывод",
    "набрать по памяти",
    "запустить проверку",
    "повторить с одним изменением",
  ],
  ar: [
    "اقرأ قاعدة واحدة",
    "توقع الناتج",
    "اكتب من الذاكرة",
    "شغل الفحص",
    "كرر مع تغيير واحد",
  ],
  hi: [
    "एक नियम पढ़ें",
    "आउटपुट सोचें",
    "याद से टाइप करें",
    "जांच चलाएं",
    "एक बदलाव के साथ दोहराएं",
  ],
  id: [
    "baca satu aturan",
    "tebak keluaran",
    "ketik dari ingatan",
    "jalankan cek",
    "ulang dengan satu perubahan",
  ],
  vi: [
    "doc mot quy tac",
    "doan dau ra",
    "go bang tri nho",
    "chay kiem tra",
    "lap lai voi mot thay doi",
  ],
  th: [
    "อ่านกฎหนึ่งข้อ",
    "ทายผลลัพธ์",
    "พิมพ์จากความจำ",
    "รันการตรวจ",
    "ทำซ้ำโดยเปลี่ยนหนึ่งจุด",
  ],
  tr: [
    "bir kural oku",
    "ciktisini tahmin et",
    "hafizadan yaz",
    "kontrolu calistir",
    "bir degisiklikle tekrarla",
  ],
  it: [
    "leggi una regola",
    "prevedi l output",
    "scrivi a memoria",
    "esegui il controllo",
    "ripeti con una modifica",
  ],
  nl: [
    "lees een regel",
    "voorspel uitvoer",
    "typ uit geheugen",
    "draai controle",
    "herhaal met een wijziging",
  ],
  pl: [
    "przeczytaj jedna zasade",
    "przewidz wynik",
    "pisz z pamieci",
    "uruchom sprawdzanie",
    "powtorz z jedna zmiana",
  ],
};

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

type ProgrammingRailSearchCopy = {
  label: string;
  placeholder: string;
  clear: string;
  noMatch: string;
  shortcut: string;
  count: (visible: number, total: number) => string;
};

const programmingRailSearchCopy: Record<InterfaceLanguage, ProgrammingRailSearchCopy> = {
  en: {
    label: "Find a language",
    placeholder: "Python JavaScript Rust SQL Bash",
    clear: "Clear",
    noMatch: "No matching language yet.",
    shortcut: "Enter opens the first match. Escape clears the search.",
    count: (visible, total) => `${visible} of ${total}`,
  },
  zh: {
    label: "搜索语言",
    placeholder: "Python JavaScript Rust SQL Bash",
    clear: "清空",
    noMatch: "暂时没有匹配的语言",
    shortcut: "Enter 打开第一个结果，Esc 清空搜索",
    count: (visible, total) => `${visible} / ${total}`,
  },
  ja: {
    label: "言語を探す",
    placeholder: "Python JavaScript Rust SQL Bash",
    clear: "クリア",
    noMatch: "一致する言語はまだありません。",
    shortcut: "Enter で最初の結果を開き、Esc でクリアします。",
    count: (visible, total) => `${visible} / ${total}`,
  },
  ko: {
    label: "언어 찾기",
    placeholder: "Python JavaScript Rust SQL Bash",
    clear: "지우기",
    noMatch: "일치하는 언어가 아직 없습니다.",
    shortcut: "Enter 는 첫 결과를 열고 Esc 는 검색을 지웁니다.",
    count: (visible, total) => `${visible} / ${total}`,
  },
  es: {
    label: "Buscar lenguaje",
    placeholder: "Python JavaScript Rust SQL Bash",
    clear: "Limpiar",
    noMatch: "No hay lenguajes coincidentes.",
    shortcut: "Enter abre el primer resultado. Escape limpia la busqueda.",
    count: (visible, total) => `${visible} de ${total}`,
  },
  fr: {
    label: "Trouver un langage",
    placeholder: "Python JavaScript Rust SQL Bash",
    clear: "Effacer",
    noMatch: "Aucun langage correspondant.",
    shortcut: "Enter ouvre le premier resultat. Escape efface la recherche.",
    count: (visible, total) => `${visible} sur ${total}`,
  },
  de: {
    label: "Sprache suchen",
    placeholder: "Python JavaScript Rust SQL Bash",
    clear: "Zuruecksetzen",
    noMatch: "Noch keine passende Sprache.",
    shortcut: "Enter oeffnet den ersten Treffer. Escape leert die Suche.",
    count: (visible, total) => `${visible} von ${total}`,
  },
  pt: {
    label: "Encontrar linguagem",
    placeholder: "Python JavaScript Rust SQL Bash",
    clear: "Limpar",
    noMatch: "Nenhuma linguagem encontrada.",
    shortcut: "Enter abre o primeiro resultado. Escape limpa a busca.",
    count: (visible, total) => `${visible} de ${total}`,
  },
  ru: {
    label: "Найти язык",
    placeholder: "Python JavaScript Rust SQL Bash",
    clear: "Сбросить",
    noMatch: "Подходящий язык пока не найден.",
    shortcut: "Enter открывает первый результат. Escape очищает поиск.",
    count: (visible, total) => `${visible} из ${total}`,
  },
  ar: {
    label: "ابحث عن لغة",
    placeholder: "Python JavaScript Rust SQL Bash",
    clear: "مسح",
    noMatch: "لا توجد لغة مطابقة بعد.",
    shortcut: "Enter يفتح أول نتيجة. Escape يمسح البحث.",
    count: (visible, total) => `${visible} من ${total}`,
  },
  hi: {
    label: "भाषा खोजें",
    placeholder: "Python JavaScript Rust SQL Bash",
    clear: "साफ करें",
    noMatch: "अभी कोई मेल खाती भाषा नहीं है।",
    shortcut: "Enter पहला परिणाम खोलता है. Escape search साफ करता है.",
    count: (visible, total) => `${visible} / ${total}`,
  },
  id: {
    label: "Cari bahasa",
    placeholder: "Python JavaScript Rust SQL Bash",
    clear: "Bersihkan",
    noMatch: "Belum ada bahasa yang cocok.",
    shortcut: "Enter membuka hasil pertama. Escape membersihkan pencarian.",
    count: (visible, total) => `${visible} dari ${total}`,
  },
  vi: {
    label: "Tim ngon ngu",
    placeholder: "Python JavaScript Rust SQL Bash",
    clear: "Xoa",
    noMatch: "Chua co ngon ngu phu hop.",
    shortcut: "Enter mo ket qua dau tien. Escape xoa tim kiem.",
    count: (visible, total) => `${visible} / ${total}`,
  },
  th: {
    label: "ค้นหาภาษา",
    placeholder: "Python JavaScript Rust SQL Bash",
    clear: "ล้าง",
    noMatch: "ยังไม่มีภาษาที่ตรงกัน",
    shortcut: "Enter เปิดผลลัพธ์แรก Escape ล้างการค้นหา",
    count: (visible, total) => `${visible} / ${total}`,
  },
  tr: {
    label: "Dil bul",
    placeholder: "Python JavaScript Rust SQL Bash",
    clear: "Temizle",
    noMatch: "Henuz eslesen dil yok.",
    shortcut: "Enter ilk sonucu acar. Escape aramayi temizler.",
    count: (visible, total) => `${visible} / ${total}`,
  },
  it: {
    label: "Trova linguaggio",
    placeholder: "Python JavaScript Rust SQL Bash",
    clear: "Pulisci",
    noMatch: "Nessun linguaggio corrispondente.",
    shortcut: "Enter apre il primo risultato. Escape pulisce la ricerca.",
    count: (visible, total) => `${visible} di ${total}`,
  },
  nl: {
    label: "Taal zoeken",
    placeholder: "Python JavaScript Rust SQL Bash",
    clear: "Wissen",
    noMatch: "Nog geen passende taal.",
    shortcut: "Enter opent het eerste resultaat. Escape wist de zoekopdracht.",
    count: (visible, total) => `${visible} van ${total}`,
  },
  pl: {
    label: "Znajdz jezyk",
    placeholder: "Python JavaScript Rust SQL Bash",
    clear: "Wyczysc",
    noMatch: "Brak pasujacego jezyka.",
    shortcut: "Enter otwiera pierwszy wynik. Escape czysci wyszukiwanie.",
    count: (visible, total) => `${visible} z ${total}`,
  },
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

function programmingCopyFromEnglish(overrides: Partial<ProgrammingCopyType>): ProgrammingCopyType {
  return {
    ...baseProgrammingCopy.en,
    ...overrides,
    tracks: {
      choice: overrides.tracks?.choice ?? baseProgrammingCopy.en.tracks.choice,
      fill: overrides.tracks?.fill ?? baseProgrammingCopy.en.tracks.fill,
      practical: overrides.tracks?.practical ?? baseProgrammingCopy.en.tracks.practical,
    },
  };
}

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
  fr: programmingCopyFromEnglish({
    brand: "Pratique de code",
    languages: "Langages",
    queue: "File",
    expanding: "en expansion",
    zeroBase: "parcours debutant",
    session: "session",
    correct: "correct",
    answered: "repondu",
    workspace: "atelier",
    nextUnsolved: "suivant non resolu",
    reset: "reinitialiser",
    resetConfirm: (language: string) => `Reinitialiser la progression locale de ${language} ?`,
    statusSolved: "resolu",
    statusReview: "a revoir",
    statusDraft: "brouillon",
    statusNew: "nouveau",
    question: "question",
    questionPalette: "palette de questions",
    prev: "precedent",
    next: "suivant",
    submit: "valider",
    run: "tester",
    hint: "indice",
    answer: "reponse",
    correctMessage: "correct",
    notYetMessage: "pas encore. Ouvre un indice ou compare avec la reponse.",
    wrongNote: "les indices restent caches jusqu a ton premier essai.",
    codePlaceholder: "ecris ton code ici",
    fillPlaceholder: "ecris la reponse manquante",
    inspector: "inspecteur",
    feedback: "retour",
    typingFirst: "frappe d abord",
    vimReview: "revision Vim",
    runOutput: "sortie du test",
    runEmpty: "le test verifie la sortie exemple ou les elements requis.",
    hints: "indices",
    hintEmpty: "essaie une fois. Puis ouvre un indice si besoin.",
    answerEmpty: "utilise la reponse seulement pour comparer ton travail.",
    shortcuts: "raccourcis",
    shortcutItems: ["Ctrl Enter valider", "Alt R tester", "Alt H indice", "Alt A reponse", "Alt fleches naviguer", "1 2 3 4 choix"],
    vimShortcut: "J K naviguer",
    coachTitle: "compagnon de programmation",
    coachSubtitle: "un indice a la fois. Il lit la question, ta reponse et le contexte du langage.",
    coachPlaceholder: "demande un indice, une verification de bug, une explication ou un exercice",
    coachPrompts: ["donne un indice", "explique le concept", "verifie ma reponse", "cree un mini exercice"],
    reference: "reference",
    patternsFor: (fileName: string) => `modeles pour ${fileName}`,
    showOutput: "voir la sortie",
    hideOutput: "cacher la sortie",
    output: "sortie",
    tracks: {
      choice: { label: "choix multiple", shortLabel: "choix" },
      fill: { label: "texte manquant", shortLabel: "trou" },
      practical: { label: "pratique", shortLabel: "code" },
    },
  }),
  de: programmingCopyFromEnglish({
    brand: "Code Praxis",
    languages: "Sprachen",
    queue: "Aufgaben",
    expanding: "wachsend",
    zeroBase: "Start bei null",
    session: "Sitzung",
    correct: "richtig",
    answered: "beantwortet",
    workspace: "Arbeitsbereich",
    nextUnsolved: "naechste offene",
    reset: "zuruecksetzen",
    resetConfirm: (language: string) => `Lokalen Uebungsstand fuer ${language} zuruecksetzen?`,
    statusSolved: "geloest",
    statusReview: "pruefen",
    statusDraft: "entwurf",
    statusNew: "neu",
    question: "frage",
    questionPalette: "fragenpalette",
    prev: "zurueck",
    next: "weiter",
    submit: "absenden",
    run: "testen",
    hint: "hinweis",
    answer: "antwort",
    correctMessage: "richtig",
    notYetMessage: "noch nicht. Nimm einen Hinweis oder vergleiche mit der Antwort.",
    wrongNote: "Hinweise erscheinen erst nach einem eigenen Versuch.",
    codePlaceholder: "schreibe deinen Code hier",
    fillPlaceholder: "fehlende Antwort eingeben",
    inspector: "pruefer",
    feedback: "feedback",
    typingFirst: "tippen zuerst",
    vimReview: "Vim review",
    runOutput: "testausgabe",
    runEmpty: "der Test prueft Beispielausgabe oder benoetigte Teile.",
    hints: "hinweise",
    hintEmpty: "versuche es einmal. Oeffne dann bei Bedarf einen Hinweis.",
    answerEmpty: "nutze die Antwort nur zum Vergleichen.",
    shortcuts: "tastenkombinationen",
    shortcutItems: ["Ctrl Enter absenden", "Alt R testen", "Alt H hinweis", "Alt A antwort", "Alt pfeile wechseln", "1 2 3 4 auswahl"],
    vimShortcut: "J K wechseln",
    coachTitle: "Programmier Begleiter",
    coachSubtitle: "ein Hinweis nach dem anderen. Er liest Frage, Antwort und Sprachkontext.",
    coachPlaceholder: "frage nach Hinweis, Bugcheck, Erklaerung oder Miniuebung",
    coachPrompts: ["gib einen Hinweis", "erklaere das Konzept", "pruefe meine Antwort", "erstelle eine Miniuebung"],
    reference: "referenz",
    patternsFor: (fileName: string) => `muster fuer ${fileName}`,
    showOutput: "ausgabe zeigen",
    hideOutput: "ausgabe verbergen",
    output: "ausgabe",
    tracks: {
      choice: { label: "multiple choice", shortLabel: "wahl" },
      fill: { label: "luecke fuellen", shortLabel: "luecke" },
      practical: { label: "praxis", shortLabel: "code" },
    },
  }),
  pt: programmingCopyFromEnglish({
    brand: "Pratica de codigo",
    languages: "Linguagens",
    queue: "Fila",
    expanding: "em expansao",
    zeroBase: "do zero",
    session: "sessao",
    correct: "correto",
    answered: "respondidas",
    workspace: "bancada",
    nextUnsolved: "proxima aberta",
    reset: "reiniciar",
    resetConfirm: (language: string) => `Reiniciar o treino local de ${language}?`,
    statusSolved: "resolvido",
    statusReview: "revisar",
    statusDraft: "rascunho",
    statusNew: "novo",
    question: "questao",
    questionPalette: "painel de questoes",
    prev: "anterior",
    next: "proxima",
    submit: "enviar",
    run: "testar",
    hint: "dica",
    answer: "resposta",
    correctMessage: "correto",
    notYetMessage: "ainda nao. Veja uma dica ou compare com a resposta.",
    wrongNote: "as dicas aparecem depois da primeira tentativa.",
    codePlaceholder: "digite seu codigo aqui",
    fillPlaceholder: "digite a resposta",
    inspector: "inspetor",
    feedback: "retorno",
    typingFirst: "digitar primeiro",
    vimReview: "revisao Vim",
    runOutput: "saida do teste",
    runEmpty: "o teste verifica a saida exemplo ou as partes exigidas.",
    hints: "dicas",
    hintEmpty: "tente uma vez. Depois abra uma dica se precisar.",
    answerEmpty: "use a resposta apenas para comparar seu trabalho.",
    shortcuts: "atalhos",
    shortcutItems: ["Ctrl Enter enviar", "Alt R testar", "Alt H dica", "Alt A resposta", "Alt setas mover", "1 2 3 4 opcoes"],
    vimShortcut: "J K mover",
    coachTitle: "companheiro de programacao",
    coachSubtitle: "uma dica por vez. Ele le a questao, sua resposta e o contexto.",
    coachPlaceholder: "peca dica, revisao de bug, explicacao ou novo exercicio",
    coachPrompts: ["me de uma dica", "explique o conceito", "verifique minha resposta", "crie um mini exercicio"],
    reference: "referencia",
    patternsFor: (fileName: string) => `padroes para ${fileName}`,
    showOutput: "mostrar saida",
    hideOutput: "ocultar saida",
    output: "saida",
    tracks: {
      choice: { label: "multipla escolha", shortLabel: "escolha" },
      fill: { label: "preencher lacuna", shortLabel: "lacuna" },
      practical: { label: "pratica", shortLabel: "codigo" },
    },
  }),
  ru: programmingCopyFromEnglish({
    brand: "Практика кода",
    languages: "Языки",
    queue: "Очередь",
    expanding: "пополняется",
    zeroBase: "с нуля",
    session: "сессия",
    correct: "верно",
    answered: "отвечено",
    workspace: "рабочая зона",
    nextUnsolved: "следующая открытая",
    reset: "сброс",
    resetConfirm: (language: string) => `Сбросить локальную практику ${language}?`,
    statusSolved: "решено",
    statusReview: "повторить",
    statusDraft: "черновик",
    statusNew: "новый",
    question: "вопрос",
    questionPalette: "панель вопросов",
    prev: "назад",
    next: "вперед",
    submit: "проверить",
    run: "тест",
    hint: "подсказка",
    answer: "ответ",
    correctMessage: "верно",
    notYetMessage: "пока нет. Открой подсказку или сравни с ответом.",
    wrongNote: "подсказки появляются после первой попытки.",
    codePlaceholder: "пиши код здесь",
    fillPlaceholder: "введи ответ",
    inspector: "проверка",
    feedback: "обратная связь",
    typingFirst: "сначала печатай",
    vimReview: "Vim повтор",
    runOutput: "результат теста",
    runEmpty: "тест проверяет пример вывода или нужные части.",
    hints: "подсказки",
    hintEmpty: "сначала попробуй. Затем открой подсказку.",
    answerEmpty: "ответ нужен только для сравнения с твоей работой.",
    shortcuts: "горячие клавиши",
    shortcutItems: ["Ctrl Enter проверить", "Alt R тест", "Alt H подсказка", "Alt A ответ", "Alt стрелки переход", "1 2 3 4 выбор"],
    vimShortcut: "J K переход",
    coachTitle: "помощник по коду",
    coachSubtitle: "одна подсказка за раз. Он читает вопрос, твой ответ и контекст языка.",
    coachPlaceholder: "попроси подсказку, проверку бага, объяснение или упражнение",
    coachPrompts: ["дай подсказку", "объясни концепт", "проверь ответ", "сделай мини упражнение"],
    reference: "справка",
    patternsFor: (fileName: string) => `шаблоны для ${fileName}`,
    showOutput: "показать вывод",
    hideOutput: "скрыть вывод",
    output: "вывод",
    tracks: {
      choice: { label: "выбор ответа", shortLabel: "выбор" },
      fill: { label: "заполнить пропуск", shortLabel: "пропуск" },
      practical: { label: "практика", shortLabel: "код" },
    },
  }),
  ar: {
    brand: "تدريب البرمجة",
    languages: "اللغات",
    queue: "قائمة التدريب",
    expanding: "قيد التوسيع",
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
  hi: programmingCopyFromEnglish({
    brand: "कोड अभ्यास",
    languages: "भाषाएं",
    queue: "अभ्यास सूची",
    expanding: "बढ़ रहा है",
    zeroBase: "शून्य से",
    session: "सत्र",
    correct: "सही",
    answered: "उत्तर",
    workspace: "वर्कस्पेस",
    nextUnsolved: "अगला बाकी",
    reset: "रीसेट",
    resetConfirm: (language: string) => `${language} का स्थानीय अभ्यास रीसेट करें?`,
    statusSolved: "हल",
    statusReview: "दोहराएं",
    statusDraft: "मसौदा",
    statusNew: "नया",
    question: "प्रश्न",
    questionPalette: "प्रश्न पैनल",
    prev: "पिछला",
    next: "अगला",
    submit: "जांचें",
    run: "चलाएं",
    hint: "संकेत",
    answer: "उत्तर",
    correctMessage: "सही",
    notYetMessage: "अभी नहीं. संकेत खोलें या उत्तर से मिलाएं.",
    wrongNote: "संकेत पहली कोशिश के बाद खुलते हैं.",
    codePlaceholder: "यहां कोड लिखें",
    fillPlaceholder: "उत्तर लिखें",
    inspector: "जांच",
    feedback: "प्रतिक्रिया",
    typingFirst: "पहले टाइप",
    vimReview: "Vim दोहराव",
    runOutput: "चलाने का परिणाम",
    runEmpty: "जांच sample output या जरूरी हिस्से देखती है.",
    hints: "संकेत",
    hintEmpty: "पहले खुद कोशिश करें. फिर संकेत खोलें.",
    answerEmpty: "उत्तर सिर्फ तुलना के लिए खोलें.",
    shortcuts: "शॉर्टकट",
    shortcutItems: ["Ctrl Enter जांच", "Alt R चलाएं", "Alt H संकेत", "Alt A उत्तर", "Alt arrows बदलें", "1 2 3 4 विकल्प"],
    vimShortcut: "J K बदलें",
    coachTitle: "प्रोग्रामिंग साथी",
    coachSubtitle: "एक बार में एक संकेत. यह प्रश्न, आपका उत्तर और भाषा संदर्भ पढ़ता है.",
    coachPlaceholder: "संकेत, bug check, समझाना या नया अभ्यास मांगें",
    coachPrompts: ["एक संकेत दें", "concept समझाएं", "मेरा उत्तर जांचें", "छोटा अभ्यास बनाएं"],
    reference: "संदर्भ",
    patternsFor: (fileName: string) => `${fileName} के pattern`,
    showOutput: "output दिखाएं",
    hideOutput: "output छिपाएं",
    output: "output",
    tracks: {
      choice: { label: "बहुविकल्प", shortLabel: "विकल्प" },
      fill: { label: "रिक्त भरें", shortLabel: "रिक्त" },
      practical: { label: "व्यावहारिक", shortLabel: "कोड" },
    },
  }),
  id: programmingCopyFromEnglish({
    brand: "Latihan kode",
    languages: "Bahasa",
    queue: "Antrian",
    expanding: "terus bertambah",
    zeroBase: "mulai dari nol",
    session: "sesi",
    correct: "benar",
    answered: "dijawab",
    workspace: "ruang kerja",
    nextUnsolved: "berikutnya",
    reset: "reset",
    resetConfirm: (language: string) => `Reset latihan lokal ${language}?`,
    statusSolved: "selesai",
    statusReview: "ulang",
    statusDraft: "draf",
    statusNew: "baru",
    question: "soal",
    questionPalette: "panel soal",
    prev: "sebelum",
    next: "lanjut",
    submit: "cek",
    run: "uji",
    hint: "petunjuk",
    answer: "jawaban",
    correctMessage: "benar",
    notYetMessage: "belum. Buka petunjuk atau bandingkan dengan jawaban.",
    wrongNote: "petunjuk muncul setelah kamu mencoba.",
    codePlaceholder: "tulis kode di sini",
    fillPlaceholder: "tulis jawaban",
    inspector: "pemeriksa",
    feedback: "umpan balik",
    typingFirst: "ketik dulu",
    vimReview: "review Vim",
    runOutput: "hasil uji",
    runEmpty: "uji memeriksa output contoh atau bagian wajib.",
    hints: "petunjuk",
    hintEmpty: "coba sekali dulu. Lalu buka petunjuk.",
    answerEmpty: "gunakan jawaban hanya untuk membandingkan pekerjaanmu.",
    shortcuts: "pintasan",
    shortcutItems: ["Ctrl Enter cek", "Alt R uji", "Alt H petunjuk", "Alt A jawaban", "Alt panah pindah", "1 2 3 4 pilihan"],
    vimShortcut: "J K pindah",
    coachTitle: "teman pemrograman",
    coachSubtitle: "satu petunjuk tiap kali. Ia membaca soal, jawabanmu, dan konteks bahasa.",
    coachPlaceholder: "minta petunjuk, cek bug, penjelasan, atau latihan kecil",
    coachPrompts: ["beri satu petunjuk", "jelaskan konsep", "cek jawaban saya", "buat latihan kecil"],
    reference: "referensi",
    patternsFor: (fileName: string) => `pola untuk ${fileName}`,
    showOutput: "tampilkan output",
    hideOutput: "sembunyikan output",
    output: "output",
    tracks: {
      choice: { label: "pilihan ganda", shortLabel: "pilihan" },
      fill: { label: "isi kosong", shortLabel: "isian" },
      practical: { label: "praktik", shortLabel: "kode" },
    },
  }),
  vi: programmingCopyFromEnglish({
    brand: "Luyen code",
    languages: "Ngon ngu",
    queue: "Hang bai",
    expanding: "dang mo rong",
    zeroBase: "tu con so 0",
    session: "phien hoc",
    correct: "dung",
    answered: "da lam",
    workspace: "ban luyen",
    nextUnsolved: "bai chua lam",
    reset: "dat lai",
    resetConfirm: (language: string) => `Dat lai tien do ${language}?`,
    statusSolved: "da giai",
    statusReview: "on lai",
    statusDraft: "nhap",
    statusNew: "moi",
    question: "cau",
    questionPalette: "bang cau hoi",
    prev: "truoc",
    next: "tiep",
    submit: "kiem tra",
    run: "thu chay",
    hint: "goi y",
    answer: "dap an",
    correctMessage: "dung",
    notYetMessage: "chua dung. Mo goi y hoac so voi dap an.",
    wrongNote: "goi y chi hien sau khi ban thu lam.",
    codePlaceholder: "viet code o day",
    fillPlaceholder: "nhap dap an",
    inspector: "kiem tra",
    feedback: "phan hoi",
    typingFirst: "go truoc",
    vimReview: "on Vim",
    runOutput: "ket qua chay",
    runEmpty: "thu chay kiem tra output mau hoac phan bat buoc.",
    hints: "goi y",
    hintEmpty: "hay thu mot lan. Sau do mo goi y neu can.",
    answerEmpty: "chi xem dap an khi muon doi chieu.",
    shortcuts: "phim tat",
    shortcutItems: ["Ctrl Enter kiem tra", "Alt R chay", "Alt H goi y", "Alt A dap an", "Alt mui ten doi bai", "1 2 3 4 chon"],
    vimShortcut: "J K doi bai",
    coachTitle: "tro ly lap trinh",
    coachSubtitle: "moi lan mot goi y. Doc cau hoi, dap an cua ban va ngu canh ngon ngu.",
    coachPlaceholder: "xin goi y, kiem bug, giai thich hoac bai tap nho",
    coachPrompts: ["cho mot goi y", "giai thich khai niem", "kiem tra dap an", "tao bai tap nho"],
    reference: "tham khao",
    patternsFor: (fileName: string) => `mau cho ${fileName}`,
    showOutput: "hien output",
    hideOutput: "an output",
    output: "output",
    tracks: {
      choice: { label: "trac nghiem", shortLabel: "chon" },
      fill: { label: "dien khuyet", shortLabel: "dien" },
      practical: { label: "thuc hanh", shortLabel: "code" },
    },
  }),
  th: programmingCopyFromEnglish({
    brand: "ฝึกเขียนโค้ด",
    languages: "ภาษา",
    queue: "คิวฝึก",
    expanding: "กำลังเพิ่ม",
    zeroBase: "เริ่มจากศูนย์",
    session: "เซสชัน",
    correct: "ถูก",
    answered: "ตอบแล้ว",
    workspace: "พื้นที่ฝึก",
    nextUnsolved: "ข้อถัดไป",
    reset: "รีเซ็ต",
    resetConfirm: (language: string) => `รีเซ็ตการฝึก ${language} หรือไม่`,
    statusSolved: "ผ่านแล้ว",
    statusReview: "ทบทวน",
    statusDraft: "ร่าง",
    statusNew: "ใหม่",
    question: "ข้อ",
    questionPalette: "แผงข้อ",
    prev: "ก่อนหน้า",
    next: "ถัดไป",
    submit: "ตรวจ",
    run: "ทดสอบ",
    hint: "คำใบ้",
    answer: "คำตอบ",
    correctMessage: "ถูกต้อง",
    notYetMessage: "ยังไม่ใช่ เปิดคำใบ้หรือเทียบกับคำตอบ",
    wrongNote: "คำใบ้จะเปิดหลังจากลองทำก่อน",
    codePlaceholder: "เขียนโค้ดที่นี่",
    fillPlaceholder: "พิมพ์คำตอบ",
    inspector: "ตัวตรวจ",
    feedback: "ผลตอบกลับ",
    typingFirst: "พิมพ์ก่อน",
    vimReview: "ทบทวน Vim",
    runOutput: "ผลทดสอบ",
    runEmpty: "การทดสอบจะดู output ตัวอย่างหรือส่วนที่ต้องมี",
    hints: "คำใบ้",
    hintEmpty: "ลองทำหนึ่งครั้งก่อน แล้วค่อยเปิดคำใบ้",
    answerEmpty: "เปิดคำตอบเมื่ออยากเทียบงานของคุณ",
    shortcuts: "ปุ่มลัด",
    shortcutItems: ["Ctrl Enter ตรวจ", "Alt R ทดสอบ", "Alt H คำใบ้", "Alt A คำตอบ", "Alt ลูกศร เปลี่ยนข้อ", "1 2 3 4 ตัวเลือก"],
    vimShortcut: "J K เปลี่ยนข้อ",
    coachTitle: "ผู้ช่วยเขียนโปรแกรม",
    coachSubtitle: "ให้คำใบ้ทีละข้อ อ่านโจทย์ คำตอบ และบริบทภาษา",
    coachPlaceholder: "ขอคำใบ้ ตรวจ bug อธิบาย หรือสร้างแบบฝึก",
    coachPrompts: ["ให้คำใบ้หนึ่งข้อ", "อธิบายแนวคิด", "ตรวจคำตอบ", "สร้างแบบฝึกสั้น"],
    reference: "อ้างอิง",
    patternsFor: (fileName: string) => `รูปแบบของ ${fileName}`,
    showOutput: "แสดง output",
    hideOutput: "ซ่อน output",
    output: "output",
    tracks: {
      choice: { label: "ปรนัย", shortLabel: "เลือก" },
      fill: { label: "เติมคำ", shortLabel: "เติม" },
      practical: { label: "ปฏิบัติ", shortLabel: "โค้ด" },
    },
  }),
  tr: programmingCopyFromEnglish({
    brand: "Kod Pratigi",
    languages: "Diller",
    queue: "Sira",
    expanding: "genisliyor",
    zeroBase: "sifirdan",
    session: "oturum",
    correct: "dogru",
    answered: "cevaplandi",
    workspace: "calisma alani",
    nextUnsolved: "siradaki bos",
    reset: "sifirla",
    resetConfirm: (language: string) => `${language} yerel pratik durumunu sifirla?`,
    statusSolved: "cozuldu",
    statusReview: "tekrar",
    statusDraft: "taslak",
    statusNew: "yeni",
    question: "soru",
    questionPalette: "soru paneli",
    prev: "onceki",
    next: "sonraki",
    submit: "kontrol",
    run: "test",
    hint: "ipucu",
    answer: "cevap",
    correctMessage: "dogru",
    notYetMessage: "henuz degil. Ipucu ac veya cevapla karsilastir.",
    wrongNote: "ipuclari ilk denemeden sonra gelir.",
    codePlaceholder: "kodunu buraya yaz",
    fillPlaceholder: "cevabi yaz",
    inspector: "denetleyici",
    feedback: "geri bildirim",
    typingFirst: "once yaz",
    vimReview: "Vim tekrar",
    runOutput: "test sonucu",
    runEmpty: "test ornek ciktiyi veya gerekli parcalari kontrol eder.",
    hints: "ipuclari",
    hintEmpty: "once bir kez dene. Gerekirse ipucu ac.",
    answerEmpty: "cevabi sadece karsilastirmak icin kullan.",
    shortcuts: "kisayollar",
    shortcutItems: ["Ctrl Enter kontrol", "Alt R test", "Alt H ipucu", "Alt A cevap", "Alt oklar gec", "1 2 3 4 secim"],
    vimShortcut: "J K gec",
    coachTitle: "programlama yardimcisi",
    coachSubtitle: "her seferinde bir ipucu. Soruyu, cevabini ve dil baglamini okur.",
    coachPlaceholder: "ipucu, hata kontrolu, aciklama veya yeni alistirma iste",
    coachPrompts: ["bir ipucu ver", "kavrami acikla", "cevabimi kontrol et", "mini alistirma yap"],
    reference: "referans",
    patternsFor: (fileName: string) => `${fileName} kaliplari`,
    showOutput: "ciktiyi goster",
    hideOutput: "ciktiyi gizle",
    output: "cikti",
    tracks: {
      choice: { label: "coktan secmeli", shortLabel: "secim" },
      fill: { label: "bosluk doldur", shortLabel: "bosluk" },
      practical: { label: "pratik", shortLabel: "kod" },
    },
  }),
  it: programmingCopyFromEnglish({
    brand: "Pratica codice",
    languages: "Linguaggi",
    queue: "Coda",
    expanding: "in crescita",
    zeroBase: "da zero",
    session: "sessione",
    correct: "corretto",
    answered: "risposte",
    workspace: "laboratorio",
    nextUnsolved: "prossima aperta",
    reset: "reset",
    resetConfirm: (language: string) => `Azzerare la pratica locale di ${language}?`,
    statusSolved: "risolto",
    statusReview: "ripasso",
    statusDraft: "bozza",
    statusNew: "nuovo",
    question: "domanda",
    questionPalette: "pannello domande",
    prev: "precedente",
    next: "successiva",
    submit: "controlla",
    run: "testa",
    hint: "indizio",
    answer: "risposta",
    correctMessage: "corretto",
    notYetMessage: "non ancora. Apri un indizio o confronta con la risposta.",
    wrongNote: "gli indizi restano nascosti finche provi una volta.",
    codePlaceholder: "scrivi il codice qui",
    fillPlaceholder: "scrivi la risposta",
    inspector: "ispettore",
    feedback: "feedback",
    typingFirst: "scrivi prima",
    vimReview: "ripasso Vim",
    runOutput: "output test",
    runEmpty: "il test controlla output esempio o parti richieste.",
    hints: "indizi",
    hintEmpty: "prova una volta. Poi apri un indizio.",
    answerEmpty: "usa la risposta solo per confrontare il tuo lavoro.",
    shortcuts: "scorciatoie",
    shortcutItems: ["Ctrl Enter controlla", "Alt R testa", "Alt H indizio", "Alt A risposta", "Alt frecce cambia", "1 2 3 4 scelta"],
    vimShortcut: "J K cambia",
    coachTitle: "compagno di programmazione",
    coachSubtitle: "un indizio alla volta. Legge domanda, risposta e contesto.",
    coachPlaceholder: "chiedi indizio, controllo bug, spiegazione o esercizio",
    coachPrompts: ["dammi un indizio", "spiega il concetto", "controlla la risposta", "crea un esercizio"],
    reference: "riferimento",
    patternsFor: (fileName: string) => `schemi per ${fileName}`,
    showOutput: "mostra output",
    hideOutput: "nascondi output",
    output: "output",
    tracks: {
      choice: { label: "scelta multipla", shortLabel: "scelta" },
      fill: { label: "riempi spazio", shortLabel: "spazio" },
      practical: { label: "pratica", shortLabel: "codice" },
    },
  }),
  nl: programmingCopyFromEnglish({
    brand: "Code oefenen",
    languages: "Talen",
    queue: "Rij",
    expanding: "groeit",
    zeroBase: "vanaf nul",
    session: "sessie",
    correct: "goed",
    answered: "beantwoord",
    workspace: "werkplek",
    nextUnsolved: "volgende open",
    reset: "reset",
    resetConfirm: (language: string) => `Lokale oefenstand voor ${language} resetten?`,
    statusSolved: "opgelost",
    statusReview: "herhalen",
    statusDraft: "concept",
    statusNew: "nieuw",
    question: "vraag",
    questionPalette: "vragenpaneel",
    prev: "vorige",
    next: "volgende",
    submit: "controleer",
    run: "test",
    hint: "hint",
    answer: "antwoord",
    correctMessage: "goed",
    notYetMessage: "nog niet. Open een hint of vergelijk met het antwoord.",
    wrongNote: "hints verschijnen pas na je eerste poging.",
    codePlaceholder: "schrijf je code hier",
    fillPlaceholder: "typ het antwoord",
    inspector: "controle",
    feedback: "feedback",
    typingFirst: "eerst typen",
    vimReview: "Vim herhaling",
    runOutput: "testuitvoer",
    runEmpty: "de test controleert voorbeeldoutput of vereiste delen.",
    hints: "hints",
    hintEmpty: "probeer eerst een keer. Open daarna een hint.",
    answerEmpty: "gebruik het antwoord alleen om te vergelijken.",
    shortcuts: "sneltoetsen",
    shortcutItems: ["Ctrl Enter controleer", "Alt R test", "Alt H hint", "Alt A antwoord", "Alt pijlen wissel", "1 2 3 4 keuze"],
    vimShortcut: "J K wissel",
    coachTitle: "programmeer maatje",
    coachSubtitle: "een hint per keer. Leest vraag, jouw antwoord en taalcontext.",
    coachPlaceholder: "vraag hint, bugcheck, uitleg of nieuwe oefening",
    coachPrompts: ["geef een hint", "leg het concept uit", "controleer mijn antwoord", "maak een mini oefening"],
    reference: "referentie",
    patternsFor: (fileName: string) => `patronen voor ${fileName}`,
    showOutput: "toon output",
    hideOutput: "verberg output",
    output: "output",
    tracks: {
      choice: { label: "meerkeuze", shortLabel: "keuze" },
      fill: { label: "gat invullen", shortLabel: "invullen" },
      practical: { label: "praktijk", shortLabel: "code" },
    },
  }),
  pl: programmingCopyFromEnglish({
    brand: "Praktyka kodu",
    languages: "Jezyki",
    queue: "Kolejka",
    expanding: "rosnie",
    zeroBase: "od zera",
    session: "sesja",
    correct: "dobrze",
    answered: "odpowiedziano",
    workspace: "warsztat",
    nextUnsolved: "nastepne otwarte",
    reset: "reset",
    resetConfirm: (language: string) => `Zresetowac lokalna praktyke ${language}?`,
    statusSolved: "rozwiazane",
    statusReview: "powtorka",
    statusDraft: "szkic",
    statusNew: "nowe",
    question: "pytanie",
    questionPalette: "panel pytan",
    prev: "wstecz",
    next: "dalej",
    submit: "sprawdz",
    run: "test",
    hint: "podpowiedz",
    answer: "odpowiedz",
    correctMessage: "dobrze",
    notYetMessage: "jeszcze nie. Otworz podpowiedz albo porownaj z odpowiedzia.",
    wrongNote: "podpowiedzi pojawiaja sie po pierwszej probie.",
    codePlaceholder: "napisz kod tutaj",
    fillPlaceholder: "wpisz odpowiedz",
    inspector: "inspektor",
    feedback: "informacja",
    typingFirst: "najpierw pisz",
    vimReview: "powtorka Vim",
    runOutput: "wynik testu",
    runEmpty: "test sprawdza output przykladu lub wymagane czesci.",
    hints: "podpowiedzi",
    hintEmpty: "najpierw sproboj. Potem otworz podpowiedz.",
    answerEmpty: "uzyj odpowiedzi tylko do porownania pracy.",
    shortcuts: "skroty",
    shortcutItems: ["Ctrl Enter sprawdz", "Alt R test", "Alt H podpowiedz", "Alt A odpowiedz", "Alt strzalki zmien", "1 2 3 4 wybor"],
    vimShortcut: "J K zmien",
    coachTitle: "towarzysz programowania",
    coachSubtitle: "jedna podpowiedz naraz. Czyta pytanie, odpowiedz i kontekst.",
    coachPlaceholder: "popros o podpowiedz, bugcheck, wyjasnienie lub cwiczenie",
    coachPrompts: ["daj podpowiedz", "wyjasnij koncept", "sprawdz odpowiedz", "stworz mini cwiczenie"],
    reference: "referencja",
    patternsFor: (fileName: string) => `wzorce dla ${fileName}`,
    showOutput: "pokaz output",
    hideOutput: "ukryj output",
    output: "output",
    tracks: {
      choice: { label: "wybor wielokrotny", shortLabel: "wybor" },
      fill: { label: "uzupelnij luke", shortLabel: "luka" },
      practical: { label: "praktyka", shortLabel: "kod" },
    },
  }),
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
  javascript: "تطبيقات الويب والأتمتة وربط الواجهات",
  typescript: "منتجات JavaScript أكبر مع عقود أنواع واضحة",
  python: "الأتمتة والبيانات وواجهات backend",
  cpp: "الأداء والأنظمة والذاكرة والخوارزميات",
  java: "الخوادم و Android والتطبيقات المؤسسية",
  go: "خدمات السحابة وأدوات CLI والتزامن",
  rust: "لغة أنظمة آمنة وعالية الأداء",
  sql: "البحث في البيانات وتجميعها وتحديثها",
  "html-css": "بناء هيكل الصفحة وشكلها",
  bash: "أتمتة الطرفية والملفات والنشر",
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

function genericRoleForInterface(activeLanguage: ReturnType<typeof getProgrammingLanguage>, language: InterfaceLanguage) {
  const title = activeLanguage.title;
  const roles: Partial<Record<InterfaceLanguage, string>> = {
    zh: `从零学习 ${title} 的核心语法 运行方式 和基础实战`,
    ja: `${title} をゼロから学ぶための基本構文、実行、実践`,
    ko: `${title} 를 처음부터 배우기 위한 기본 문법 실행 실습`,
    es: `ruta practica para aprender ${title} desde cero`,
    fr: `parcours pratique pour apprendre ${title} depuis zero`,
    de: `praktischer Lernpfad fuer ${title} von null an`,
    pt: `trilha pratica para aprender ${title} do zero`,
    ru: `практический путь для изучения ${title} с нуля`,
    ar: `مسار عملي لتعلم ${title} من الصفر`,
    hi: `${title} को शून्य से सीखने का व्यावहारिक रास्ता`,
    id: `jalur praktis untuk belajar ${title} dari nol`,
    vi: `lo trinh thuc hanh de hoc ${title} tu con so 0`,
    th: `เส้นทางฝึก ${title} ตั้งแต่ศูนย์`,
    tr: `${title} icin sifirdan pratik ogrenme yolu`,
    it: `percorso pratico per imparare ${title} da zero`,
    nl: `praktisch leerpad om ${title} vanaf nul te leren`,
    pl: `praktyczna sciezka nauki ${title} od zera`,
  };
  return roles[language] ?? activeLanguage.role;
}

function genericHabitForInterface(activeLanguage: ReturnType<typeof getProgrammingLanguage>, language: InterfaceLanguage) {
  const title = activeLanguage.title;
  const habits: Partial<Record<InterfaceLanguage, string>> = {
    zh: `每学一个 ${title} 小语法 立刻写一个最小例子并运行`,
    ja: `${title} の小さな構文を一つ学んだら、すぐ最小例を入力して実行する`,
    ko: `${title} 작은 문법 하나를 배우면 바로 최소 예제를 입력하고 실행합니다`,
    es: `aprende una pieza pequena de ${title}, escribe un ejemplo minimo y ejecútalo`,
    fr: `apprends une petite piece de ${title}, tape un exemple minimal et execute-le`,
    de: `lerne ein kleines ${title} Stueck, tippe ein Minimalbeispiel und fuehre es aus`,
    pt: `aprenda uma parte pequena de ${title}, digite um exemplo minimo e execute`,
    ru: `изучи маленькую часть ${title}, набери минимальный пример и запусти`,
    ar: `تعلم جزءا صغيرا من ${title} ثم اكتب مثالا صغيرا وشغله`,
    hi: `${title} का छोटा हिस्सा सीखें, minimal example टाइप करें और चलाएं`,
    id: `pelajari satu bagian kecil ${title}, ketik contoh minimal, lalu jalankan`,
    vi: `hoc mot phan nho cua ${title}, go vi du toi thieu roi chay`,
    th: `เรียน ${title} ทีละส่วนเล็ก แล้วพิมพ์ตัวอย่างสั้นและรัน`,
    tr: `${title} icin kucuk bir parca ogren, minimal ornek yaz ve calistir`,
    it: `impara un piccolo pezzo di ${title}, scrivi un esempio minimo ed eseguilo`,
    nl: `leer een klein deel van ${title}, typ een minimaal voorbeeld en voer het uit`,
    pl: `poznaj maly fragment ${title}, wpisz minimalny przyklad i uruchom go`,
  };
  return habits[language] ?? activeLanguage.dailyHabit;
}

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

function lineageProfile(
  family: string,
  roots: string[],
  relatives: ProgrammingLanguageSlug[],
  next: ProgrammingLanguageSlug[],
  useCase: string,
): LineageProfile {
  return { family, roots, relatives, next, useCase };
}

const lineageProfiles: Partial<Record<ProgrammingLanguageSlug, LineageProfile>> = {
  javascript: lineageProfile("Web scripting family", ["C", "Java", "Scheme", "Self"], ["typescript", "dart", "lua", "php"], ["typescript", "python", "go"], "front end behavior, Node.js scripts, API glue, and quick product experiments"),
  typescript: lineageProfile("Typed JavaScript family", ["JavaScript", "Java", "C#"], ["javascript", "csharp", "kotlin", "scala"], ["javascript", "go", "rust"], "large JavaScript products where refactors and API contracts matter"),
  python: lineageProfile("Readable scripting family", ["ABC", "C", "Unix tools"], ["ruby", "lua", "julia", "r"], ["sql", "bash", "go"], "automation, data work, backend APIs, and beginner friendly problem solving"),
  cpp: lineageProfile("C systems family", ["C", "Simula", "Algol"], ["c", "rust", "java", "csharp"], ["c", "rust", "go"], "performance, memory, algorithms, engines, and systems foundations"),
  java: lineageProfile("Managed OOP family", ["C++", "Smalltalk", "C"], ["kotlin", "csharp", "scala", "groovy"], ["kotlin", "go", "sql"], "backend services, Android history, enterprise systems, and typed object design"),
  go: lineageProfile("Modern systems service family", ["C", "Pascal", "CSP"], ["rust", "java", "zig", "nim"], ["sql", "bash", "rust"], "cloud services, command line tools, networking, and concurrent backends"),
  rust: lineageProfile("Safe systems family", ["C++", "ML", "Haskell"], ["c", "cpp", "zig", "haskell"], ["go", "zig", "assembly"], "safe high performance tools, systems code, CLIs, and reliability focused backends"),
  sql: lineageProfile("Relational data family", ["relational algebra", "SEQUEL"], ["r", "python", "julia", "matlab"], ["python", "go", "bash"], "querying, joining, grouping, and protecting production data"),
  "html-css": lineageProfile("Web document family", ["SGML", "HTML", "CSS cascade"], ["javascript", "php", "dart"], ["javascript", "typescript", "php"], "page structure, responsive layout, forms, and visual interfaces"),
  bash: lineageProfile("Unix shell family", ["sh", "Unix", "awk"], ["powershell", "perl", "tcl", "python"], ["python", "go", "powershell"], "terminal automation, deployment scripts, and file workflows"),
  csharp: lineageProfile("Managed OOP family", ["C++", "Java", "Delphi"], ["java", "kotlin", "typescript", "fsharp"], ["sql", "typescript", "go"], "dotnet services, desktop software, enterprise tools, and game development"),
  php: lineageProfile("Server web scripting family", ["C", "Perl", "CGI"], ["ruby", "javascript", "python"], ["sql", "javascript", "typescript"], "server rendered websites, CMS work, forms, and practical web backends"),
  swift: lineageProfile("Apple systems family", ["Objective-C", "Rust", "Haskell"], ["objective-c", "kotlin", "dart", "rust"], ["kotlin", "typescript", "sql"], "iOS, macOS, Apple apps, and modern client architecture"),
  kotlin: lineageProfile("Modern JVM family", ["Java", "Scala", "Groovy"], ["java", "scala", "swift", "csharp"], ["java", "go", "sql"], "Android apps, JVM backends, and concise typed product code"),
  ruby: lineageProfile("Expressive scripting family", ["Smalltalk", "Perl", "Lisp"], ["python", "php", "crystal", "lua"], ["javascript", "sql", "python"], "developer friendly web apps, scripts, and readable domain code"),
  dart: lineageProfile("Client app family", ["Java", "JavaScript", "C#"], ["javascript", "typescript", "swift", "kotlin"], ["typescript", "swift", "kotlin"], "Flutter apps, client state, and cross platform UI"),
  scala: lineageProfile("JVM functional OOP family", ["Java", "Haskell", "ML"], ["java", "kotlin", "fsharp", "haskell"], ["java", "sql", "go"], "typed backends, data pipelines, and functional object modeling"),
  r: lineageProfile("Statistical computing family", ["S", "Scheme", "Fortran"], ["python", "julia", "matlab", "sql"], ["python", "sql", "julia"], "statistics, charts, research analysis, and data exploration"),
  julia: lineageProfile("Scientific computing family", ["Lisp", "Fortran", "Python", "R"], ["python", "r", "matlab", "fortran"], ["python", "sql", "rust"], "numerical computing, research scripts, and fast scientific code"),
  matlab: lineageProfile("Matrix computing family", ["Fortran", "Linear algebra systems"], ["julia", "r", "python", "fortran"], ["python", "julia", "sql"], "engineering calculations, matrices, signal work, and lab scripts"),
  lua: lineageProfile("Embedded scripting family", ["C", "Scheme", "Modula"], ["javascript", "python", "ruby"], ["c", "javascript", "python"], "game scripting, embedded configuration, and small extension languages"),
  perl: lineageProfile("Text automation family", ["C", "sed", "awk", "shell"], ["bash", "php", "ruby", "python"], ["python", "bash", "go"], "text processing, legacy automation, and system glue"),
  elixir: lineageProfile("BEAM functional family", ["Erlang", "Ruby", "Prolog"], ["erlang", "ruby", "clojure", "gleam"], ["erlang", "go", "sql"], "fault tolerant web systems, realtime services, and concurrent processes"),
  erlang: lineageProfile("BEAM concurrent family", ["Prolog", "functional programming"], ["elixir", "gleam", "prolog", "haskell"], ["elixir", "go", "rust"], "telecom style reliability, actors, and distributed systems"),
  haskell: lineageProfile("Pure functional family", ["ML", "Miranda", "Lambda calculus"], ["ocaml", "fsharp", "elm", "clojure"], ["rust", "scala", "ocaml"], "type systems, pure functions, parsers, and deep programming theory"),
  clojure: lineageProfile("Lisp on JVM family", ["Lisp", "Scheme", "Java"], ["common-lisp", "scheme", "racket", "java"], ["java", "scala", "haskell"], "data oriented programs, immutable workflows, and JVM functional code"),
  fsharp: lineageProfile("ML on dotnet family", ["OCaml", "C#", "ML"], ["ocaml", "csharp", "haskell", "scala"], ["csharp", "haskell", "ocaml"], "functional dotnet apps, data transforms, and typed domain logic"),
  ocaml: lineageProfile("ML functional family", ["ML", "Caml", "Lambda calculus"], ["fsharp", "haskell", "elm", "scala"], ["haskell", "rust", "fsharp"], "compilers, theorem tools, and precise functional programs"),
  c: lineageProfile("Systems root family", ["B", "BCPL", "Algol"], ["cpp", "objective-c", "zig", "rust"], ["cpp", "rust", "assembly"], "memory, operating systems, embedded code, and the roots of many languages"),
  assembly: lineageProfile("Machine level family", ["machine code", "CPU instruction sets"], ["c", "zig", "rust"], ["c", "cpp", "rust"], "CPU instructions, low level debugging, and understanding what code becomes"),
  solidity: lineageProfile("Smart contract family", ["JavaScript", "C++", "Ethereum EVM"], ["javascript", "typescript", "rust"], ["javascript", "typescript", "go"], "smart contracts, blockchain state, and security sensitive transactions"),
  "objective-c": lineageProfile("Apple C object family", ["C", "Smalltalk"], ["swift", "c", "cpp"], ["swift", "c", "cpp"], "legacy Apple apps, Objective-C runtime, and bridging old iOS code"),
  "visual-basic": lineageProfile("BASIC application family", ["BASIC", "COM", "Windows"], ["csharp", "delphi", "pascal"], ["csharp", "sql", "typescript"], "Windows business tools, forms, and legacy automation"),
  zig: lineageProfile("Modern C replacement family", ["C", "LLVM", "systems programming"], ["c", "rust", "nim", "d"], ["c", "rust", "assembly"], "explicit systems code, cross compilation, and low level tooling"),
  nim: lineageProfile("Compiled scripting family", ["Python", "Pascal", "Modula"], ["zig", "crystal", "d", "python"], ["python", "zig", "rust"], "fast tools with readable syntax and systems reach"),
  crystal: lineageProfile("Compiled Ruby family", ["Ruby", "LLVM", "C"], ["ruby", "nim", "go"], ["ruby", "go", "sql"], "Ruby like syntax with compiled performance for services and tools"),
  groovy: lineageProfile("Dynamic JVM family", ["Java", "Python", "Ruby"], ["java", "kotlin", "scala"], ["java", "kotlin", "sql"], "JVM scripting, build automation, and legacy Gradle style code"),
  powershell: lineageProfile("Windows shell family", ["shell", ".NET", "C#"], ["bash", "csharp", "python"], ["bash", "python", "csharp"], "Windows automation, cloud admin tasks, and command pipelines"),
  fortran: lineageProfile("Scientific legacy family", ["mathematical notation", "early compilers"], ["matlab", "julia", "c"], ["python", "julia", "c"], "numerical computing, HPC, and long lived scientific code"),
  cobol: lineageProfile("Business legacy family", ["FLOW-MATIC", "English-like business code"], ["abap", "visual-basic", "pascal"], ["sql", "java", "python"], "banking systems, records, reports, and legacy business logic"),
  pascal: lineageProfile("Teaching structured family", ["Algol", "Niklaus Wirth languages"], ["delphi", "visual-basic", "c"], ["c", "java", "delphi"], "structured programming, teaching, and older application code"),
  prolog: lineageProfile("Logic programming family", ["formal logic", "AI research"], ["erlang", "haskell", "racket"], ["haskell", "erlang", "python"], "facts, rules, search, and logic based reasoning"),
  racket: lineageProfile("Scheme teaching family", ["Scheme", "Lisp"], ["scheme", "common-lisp", "clojure"], ["scheme", "haskell", "python"], "language design, teaching, and small precise experiments"),
  scheme: lineageProfile("Minimal Lisp family", ["Lisp", "Lambda calculus"], ["racket", "common-lisp", "clojure"], ["racket", "haskell", "javascript"], "recursion, interpreters, and core programming ideas"),
  elm: lineageProfile("Functional UI family", ["Haskell", "ML", "FRP"], ["haskell", "ocaml", "typescript"], ["typescript", "haskell", "rust"], "safe front end architecture and beginner friendly functional UI"),
  gleam: lineageProfile("Typed BEAM family", ["Erlang", "Elixir", "ML"], ["erlang", "elixir", "fsharp"], ["elixir", "go", "rust"], "typed concurrent services on the BEAM runtime"),
  v: lineageProfile("Simple compiled family", ["Go", "C", "Oberon"], ["go", "zig", "nim"], ["go", "zig", "rust"], "small compiled tools, simple syntax, and fast iteration"),
  d: lineageProfile("C++ successor family", ["C++", "C", "Java"], ["cpp", "zig", "nim"], ["cpp", "rust", "zig"], "systems code with high level features and compiled performance"),
  "common-lisp": lineageProfile("Classic Lisp family", ["Lisp", "Maclisp", "Scheme"], ["scheme", "racket", "clojure"], ["scheme", "clojure", "haskell"], "macros, symbolic programs, and interactive language design"),
  smalltalk: lineageProfile("Object message family", ["Simula", "Lisp"], ["ruby", "objective-c", "java"], ["ruby", "java", "swift"], "objects, messages, live environments, and OOP foundations"),
  abap: lineageProfile("Enterprise business family", ["COBOL", "SQL", "SAP systems"], ["cobol", "sql", "java"], ["sql", "java", "python"], "SAP business processes, records, and enterprise reports"),
  delphi: lineageProfile("Object Pascal family", ["Pascal", "Smalltalk", "Windows"], ["pascal", "visual-basic", "csharp"], ["csharp", "sql", "typescript"], "desktop apps, forms, and legacy business tools"),
  tcl: lineageProfile("Command language family", ["shell", "Lisp", "C"], ["bash", "perl", "lua"], ["python", "bash", "go"], "embedded commands, automation, and older tool scripting"),
};

const lineageFallback = lineageProfile(
  "Programming language family",
  ["mathematics", "computer architecture", "software practice"],
  ["python", "javascript", "c"],
  ["python", "javascript", "sql"],
  "learning core programming ideas and comparing styles across languages",
);

const lineageCopy: Record<InterfaceLanguage, {
  eyebrow: string;
  title: (language: string) => string;
  body: (language: string) => string;
  roots: string;
  current: string;
  relatives: string;
  family: string;
  useCase: string;
  next: string;
}> = {
  en: {
    eyebrow: "Language lineage",
    title: (language) => `${language} family tree`,
    body: (language) => `See where ${language} comes from, which languages feel close, and what to learn next.`,
    roots: "roots",
    current: "current",
    relatives: "relatives",
    family: "family",
    useCase: "best used for",
    next: "learn next",
  },
  zh: {
    eyebrow: "语言族谱",
    title: (language) => `${language} 的族谱`,
    body: (language) => `先看清 ${language} 从哪里来 和哪些语言接近 再决定下一步怎么学`,
    roots: "来源",
    current: "当前",
    relatives: "近亲",
    family: "所属家族",
    useCase: "适合场景",
    next: "下一步",
  },
  ja: {
    eyebrow: "言語の系譜",
    title: (language) => `${language} の系譜`,
    body: (language) => `${language} の出自、近い言語、次に学ぶ候補を一目で確認します。`,
    roots: "起源",
    current: "現在",
    relatives: "近い言語",
    family: "ファミリー",
    useCase: "向いている用途",
    next: "次に学ぶ",
  },
  ko: {
    eyebrow: "언어 계보",
    title: (language) => `${language} 계보`,
    body: (language) => `${language} 의 뿌리, 가까운 언어, 다음 학습 방향을 한눈에 봅니다.`,
    roots: "뿌리",
    current: "현재",
    relatives: "가까운 언어",
    family: "계열",
    useCase: "잘 맞는 용도",
    next: "다음 학습",
  },
  es: {
    eyebrow: "linaje del lenguaje",
    title: (language) => `arbol de ${language}`,
    body: (language) => `mira de donde viene ${language}, que lenguajes se parecen y que aprender despues.`,
    roots: "raices",
    current: "actual",
    relatives: "relacionados",
    family: "familia",
    useCase: "mejor para",
    next: "siguiente",
  },
  fr: {
    eyebrow: "lignee du langage",
    title: (language) => `arbre de ${language}`,
    body: (language) => `vois d ou vient ${language}, quels langages sont proches, et quoi apprendre ensuite.`,
    roots: "racines",
    current: "actuel",
    relatives: "proches",
    family: "famille",
    useCase: "utile pour",
    next: "ensuite",
  },
  de: {
    eyebrow: "Sprachlinie",
    title: (language) => `${language} Stammbaum`,
    body: (language) => `sieh woher ${language} kommt, welche Sprachen nah sind und was danach passt.`,
    roots: "wurzeln",
    current: "aktuell",
    relatives: "verwandt",
    family: "familie",
    useCase: "gut fuer",
    next: "danach",
  },
  pt: {
    eyebrow: "linhagem da linguagem",
    title: (language) => `arvore de ${language}`,
    body: (language) => `veja de onde ${language} vem, linguagens proximas e o que estudar depois.`,
    roots: "raizes",
    current: "atual",
    relatives: "parentes",
    family: "familia",
    useCase: "melhor para",
    next: "proximo",
  },
  ru: {
    eyebrow: "родословная языка",
    title: (language) => `родословная ${language}`,
    body: (language) => `посмотри откуда пришел ${language}, какие языки рядом и что учить дальше.`,
    roots: "корни",
    current: "сейчас",
    relatives: "родственные",
    family: "семья",
    useCase: "лучше для",
    next: "дальше",
  },
  ar: {
    eyebrow: "نسب اللغة",
    title: (language) => `شجرة ${language}`,
    body: (language) => `اعرف من أين جاءت ${language} وما اللغات القريبة وما الخطوة التالية.`,
    roots: "الجذور",
    current: "الحالية",
    relatives: "لغات قريبة",
    family: "العائلة",
    useCase: "أفضل استخدام",
    next: "التالي",
  },
  hi: {
    eyebrow: "भाषा वंश",
    title: (language) => `${language} का परिवार`,
    body: (language) => `${language} कहां से आया, कौन सी भाषाएं करीब हैं, और आगे क्या सीखना है.`,
    roots: "जड़ें",
    current: "वर्तमान",
    relatives: "करीबी",
    family: "परिवार",
    useCase: "किसके लिए",
    next: "आगे",
  },
  id: {
    eyebrow: "silsilah bahasa",
    title: (language) => `pohon ${language}`,
    body: (language) => `lihat asal ${language}, bahasa yang dekat, dan langkah belajar berikutnya.`,
    roots: "akar",
    current: "sekarang",
    relatives: "kerabat",
    family: "keluarga",
    useCase: "cocok untuk",
    next: "lanjut",
  },
  vi: {
    eyebrow: "pha he ngon ngu",
    title: (language) => `cay pha he ${language}`,
    body: (language) => `xem ${language} den tu dau, gan voi ngon ngu nao, va nen hoc gi tiep.`,
    roots: "goc",
    current: "hien tai",
    relatives: "gan nhau",
    family: "ho ngon ngu",
    useCase: "phu hop cho",
    next: "hoc tiep",
  },
  th: {
    eyebrow: "ตระกูลภาษา",
    title: (language) => `ผังตระกูล ${language}`,
    body: (language) => `ดูว่า ${language} มาจากไหน ใกล้กับภาษาใด และควรเรียนอะไรต่อ`,
    roots: "ราก",
    current: "ปัจจุบัน",
    relatives: "ใกล้เคียง",
    family: "ตระกูล",
    useCase: "เหมาะกับ",
    next: "ถัดไป",
  },
  tr: {
    eyebrow: "dil soyu",
    title: (language) => `${language} aile agaci`,
    body: (language) => `${language} nereden gelir, hangi diller yakindir ve sonra ne ogrenilir.`,
    roots: "kokler",
    current: "simdi",
    relatives: "yakinlar",
    family: "aile",
    useCase: "en iyi alan",
    next: "sonraki",
  },
  it: {
    eyebrow: "genealogia del linguaggio",
    title: (language) => `albero di ${language}`,
    body: (language) => `vedi da dove viene ${language}, quali linguaggi sono vicini e cosa studiare dopo.`,
    roots: "radici",
    current: "attuale",
    relatives: "vicini",
    family: "famiglia",
    useCase: "utile per",
    next: "dopo",
  },
  nl: {
    eyebrow: "taal stamboom",
    title: (language) => `${language} stamboom`,
    body: (language) => `zie waar ${language} vandaan komt, welke talen dichtbij zijn en wat daarna past.`,
    roots: "wortels",
    current: "nu",
    relatives: "verwant",
    family: "familie",
    useCase: "goed voor",
    next: "hierna",
  },
  pl: {
    eyebrow: "rodowod jezyka",
    title: (language) => `drzewo ${language}`,
    body: (language) => `zobacz skad pochodzi ${language}, jakie jezyki sa blisko i co dalej.`,
    roots: "korzenie",
    current: "teraz",
    relatives: "pokrewne",
    family: "rodzina",
    useCase: "najlepsze do",
    next: "dalej",
  },
};

function lineageForLanguage(activeLanguage: ReturnType<typeof getProgrammingLanguage>) {
  return lineageProfiles[activeLanguage.slug] ?? lineageFallback;
}

function programmingLanguageTitle(slug: ProgrammingLanguageSlug) {
  return getProgrammingLanguage(slug).title;
}

type LineageFamilyKind =
  | "web"
  | "systems"
  | "data"
  | "automation"
  | "functional"
  | "object"
  | "scripting"
  | "business"
  | "blockchain"
  | "general";

const lineageFamilyLabels: Record<InterfaceLanguage, Record<LineageFamilyKind, string>> = {
  en: {
    web: "Web and interface language family",
    systems: "Systems programming language family",
    data: "Data and scientific computing family",
    automation: "Automation and command language family",
    functional: "Functional and logic language family",
    object: "Object oriented language family",
    scripting: "Scripting language family",
    business: "Business and teaching language family",
    blockchain: "Smart contract language family",
    general: "Programming language family",
  },
  zh: {
    web: "Web 和界面语言家族",
    systems: "系统编程语言家族",
    data: "数据和科学计算语言家族",
    automation: "自动化和命令语言家族",
    functional: "函数式和逻辑语言家族",
    object: "面向对象语言家族",
    scripting: "脚本语言家族",
    business: "商业和教学语言家族",
    blockchain: "智能合约语言家族",
    general: "编程语言家族",
  },
  ja: {
    web: "Web と UI の言語ファミリー",
    systems: "システムプログラミング言語ファミリー",
    data: "データと科学計算の言語ファミリー",
    automation: "自動化とコマンド言語ファミリー",
    functional: "関数型と論理型の言語ファミリー",
    object: "オブジェクト指向言語ファミリー",
    scripting: "スクリプト言語ファミリー",
    business: "業務と教育向け言語ファミリー",
    blockchain: "スマートコントラクト言語ファミリー",
    general: "プログラミング言語ファミリー",
  },
  ko: {
    web: "웹과 UI 언어 계열",
    systems: "시스템 프로그래밍 언어 계열",
    data: "데이터와 과학 계산 언어 계열",
    automation: "자동화와 명령 언어 계열",
    functional: "함수형과 논리형 언어 계열",
    object: "객체 지향 언어 계열",
    scripting: "스크립트 언어 계열",
    business: "업무와 교육 언어 계열",
    blockchain: "스마트 계약 언어 계열",
    general: "프로그래밍 언어 계열",
  },
  es: {
    web: "familia de lenguajes web e interfaz",
    systems: "familia de programacion de sistemas",
    data: "familia de datos y computacion cientifica",
    automation: "familia de automatizacion y comandos",
    functional: "familia funcional y logica",
    object: "familia orientada a objetos",
    scripting: "familia de scripting",
    business: "familia empresarial y de enseñanza",
    blockchain: "familia de contratos inteligentes",
    general: "familia de lenguajes de programacion",
  },
  fr: {
    web: "famille web et interface",
    systems: "famille programmation systeme",
    data: "famille donnees et calcul scientifique",
    automation: "famille automatisation et commandes",
    functional: "famille fonctionnelle et logique",
    object: "famille orientee objet",
    scripting: "famille scripting",
    business: "famille metier et enseignement",
    blockchain: "famille contrats intelligents",
    general: "famille de langages de programmation",
  },
  de: {
    web: "Web und UI Sprachfamilie",
    systems: "Systemprogrammierung Sprachfamilie",
    data: "Daten und wissenschaftliches Rechnen",
    automation: "Automatisierung und Kommando Sprachfamilie",
    functional: "funktionale und logische Sprachfamilie",
    object: "objektorientierte Sprachfamilie",
    scripting: "Skriptsprachen Familie",
    business: "Business und Lehrsprachen Familie",
    blockchain: "Smart Contract Sprachfamilie",
    general: "Programmiersprachen Familie",
  },
  pt: {
    web: "familia de linguagens web e interface",
    systems: "familia de programacao de sistemas",
    data: "familia de dados e computacao cientifica",
    automation: "familia de automacao e comandos",
    functional: "familia funcional e logica",
    object: "familia orientada a objetos",
    scripting: "familia de scripting",
    business: "familia de negocio e ensino",
    blockchain: "familia de contratos inteligentes",
    general: "familia de linguagens de programacao",
  },
  ru: {
    web: "семья языков для web и интерфейсов",
    systems: "семья системного программирования",
    data: "семья данных и научных вычислений",
    automation: "семья автоматизации и команд",
    functional: "функциональная и логическая семья",
    object: "объектно ориентированная семья",
    scripting: "семья скриптовых языков",
    business: "семья бизнес и учебных языков",
    blockchain: "семья смарт контрактов",
    general: "семья языков программирования",
  },
  ar: {
    web: "عائلة لغات الويب والواجهات",
    systems: "عائلة لغات برمجة الأنظمة",
    data: "عائلة لغات البيانات والحوسبة العلمية",
    automation: "عائلة لغات الأتمتة والأوامر",
    functional: "عائلة لغات الدوال والمنطق",
    object: "عائلة لغات البرمجة الكائنية",
    scripting: "عائلة لغات السكربت",
    business: "عائلة لغات الأعمال والتعليم",
    blockchain: "عائلة لغات العقود الذكية",
    general: "عائلة لغات البرمجة",
  },
  hi: {
    web: "web और interface भाषा परिवार",
    systems: "systems programming भाषा परिवार",
    data: "data और scientific computing भाषा परिवार",
    automation: "automation और command भाषा परिवार",
    functional: "functional और logic भाषा परिवार",
    object: "object oriented भाषा परिवार",
    scripting: "scripting भाषा परिवार",
    business: "business और teaching भाषा परिवार",
    blockchain: "smart contract भाषा परिवार",
    general: "programming भाषा परिवार",
  },
  id: {
    web: "keluarga bahasa web dan antarmuka",
    systems: "keluarga bahasa pemrograman sistem",
    data: "keluarga data dan komputasi ilmiah",
    automation: "keluarga otomasi dan command",
    functional: "keluarga fungsional dan logika",
    object: "keluarga berorientasi objek",
    scripting: "keluarga scripting",
    business: "keluarga bisnis dan pengajaran",
    blockchain: "keluarga smart contract",
    general: "keluarga bahasa pemrograman",
  },
  vi: {
    web: "ho ngon ngu web va giao dien",
    systems: "ho ngon ngu lap trinh he thong",
    data: "ho du lieu va tinh toan khoa hoc",
    automation: "ho tu dong hoa va lenh",
    functional: "ho ham va logic",
    object: "ho huong doi tuong",
    scripting: "ho ngon ngu script",
    business: "ho nghiep vu va giang day",
    blockchain: "ho hop dong thong minh",
    general: "ho ngon ngu lap trinh",
  },
  th: {
    web: "ตระกูลภาษา web และ interface",
    systems: "ตระกูลภาษา programming ระบบ",
    data: "ตระกูลข้อมูลและคำนวณวิทยาศาสตร์",
    automation: "ตระกูล automation และ command",
    functional: "ตระกูล functional และ logic",
    object: "ตระกูล object oriented",
    scripting: "ตระกูล scripting",
    business: "ตระกูลธุรกิจและการสอน",
    blockchain: "ตระกูล smart contract",
    general: "ตระกูลภาษา programming",
  },
  tr: {
    web: "web ve arayuz dil ailesi",
    systems: "sistem programlama dil ailesi",
    data: "veri ve bilimsel hesaplama ailesi",
    automation: "otomasyon ve komut dil ailesi",
    functional: "fonksiyonel ve mantik dil ailesi",
    object: "nesne yonelimli dil ailesi",
    scripting: "script dil ailesi",
    business: "is ve ogretim dil ailesi",
    blockchain: "akilli sozlesme dil ailesi",
    general: "programlama dili ailesi",
  },
  it: {
    web: "famiglia web e interfacce",
    systems: "famiglia programmazione di sistema",
    data: "famiglia dati e calcolo scientifico",
    automation: "famiglia automazione e comandi",
    functional: "famiglia funzionale e logica",
    object: "famiglia orientata agli oggetti",
    scripting: "famiglia scripting",
    business: "famiglia business e didattica",
    blockchain: "famiglia smart contract",
    general: "famiglia dei linguaggi di programmazione",
  },
  nl: {
    web: "web en interface taalfamilie",
    systems: "systeemprogrammering taalfamilie",
    data: "data en wetenschappelijk rekenen",
    automation: "automatisering en command taalfamilie",
    functional: "functionele en logische taalfamilie",
    object: "objectgeorienteerde taalfamilie",
    scripting: "scripting taalfamilie",
    business: "business en onderwijs taalfamilie",
    blockchain: "smart contract taalfamilie",
    general: "programmeer taalfamilie",
  },
  pl: {
    web: "rodzina jezykow web i interfejsow",
    systems: "rodzina programowania systemowego",
    data: "rodzina danych i obliczen naukowych",
    automation: "rodzina automatyzacji i komend",
    functional: "rodzina funkcyjna i logiczna",
    object: "rodzina obiektowa",
    scripting: "rodzina skryptowa",
    business: "rodzina biznesowa i edukacyjna",
    blockchain: "rodzina smart kontraktow",
    general: "rodzina jezykow programowania",
  },
};

const lineageUseCasePrefix: Record<InterfaceLanguage, string> = {
  en: "Best used for",
  zh: "适合",
  ja: "向いている用途",
  ko: "잘 맞는 용도",
  es: "mejor para",
  fr: "utile pour",
  de: "gut fuer",
  pt: "melhor para",
  ru: "лучше для",
  ar: "مناسب لـ",
  hi: "इसके लिए उपयोगी",
  id: "cocok untuk",
  vi: "phu hop cho",
  th: "เหมาะกับ",
  tr: "en iyi alan",
  it: "utile per",
  nl: "goed voor",
  pl: "najlepsze do",
};

function lineageFamilyKind(family: string): LineageFamilyKind {
  const value = family.toLowerCase();
  if (value.includes("smart contract")) return "blockchain";
  if (value.includes("web") || value.includes("javascript") || value.includes("client app") || value.includes("ui")) return "web";
  if (value.includes("system") || value.includes("machine") || value.includes("c replacement") || value.includes("c++")) return "systems";
  if (value.includes("data") || value.includes("scientific") || value.includes("statistical") || value.includes("matrix") || value.includes("relational")) return "data";
  if (value.includes("shell") || value.includes("command") || value.includes("automation") || value.includes("text")) return "automation";
  if (value.includes("functional") || value.includes("logic") || value.includes("lisp") || value.includes("ml") || value.includes("beam") || value.includes("scheme")) return "functional";
  if (value.includes("oop") || value.includes("object") || value.includes("jvm")) return "object";
  if (value.includes("scripting") || value.includes("script") || value.includes("ruby") || value.includes("dynamic") || value.includes("readable")) return "scripting";
  if (value.includes("business") || value.includes("teaching") || value.includes("basic") || value.includes("legacy")) return "business";
  return "general";
}

function localizedLineageFamily(family: string, language: InterfaceLanguage) {
  if (language === "en") return family;
  return lineageFamilyLabels[language][lineageFamilyKind(family)];
}

function localizedLineageUseCase(useCase: string, activeRole: string, language: InterfaceLanguage) {
  if (language === "en") return useCase;
  if (language === "ar") return `يستخدم في ${activeRole}`;
  return `${lineageUseCasePrefix[language]} ${activeRole}`;
}

function uniqueLanguageSlugs(slugs: ProgrammingLanguageSlug[], activeSlug: ProgrammingLanguageSlug, limit: number) {
  return Array.from(new Set(slugs.filter((slug) => slug !== activeSlug))).slice(0, limit);
}

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
  const copy = questionUiCopy[language];

  if (question.type !== "PRACTICAL") {
    return `${copy.sample}\n${question.codeSnippet}\n\n${copy.output}\n${question.runOutput}`;
  }

  const raw = answer.trim();
  if (!raw) {
    return `${copy.sample}\n${question.answer}\n\n${copy.output}\n${question.runOutput}`;
  }

  const lowered = raw.toLowerCase();
  const found = question.requiredKeywords.filter((keyword) => lowered.includes(keyword.toLowerCase()));
  const missing = question.requiredKeywords.filter((keyword) => !lowered.includes(keyword.toLowerCase()));

  return [
    copy.codeCheck,
    copy.requiredFound(found.length, question.requiredKeywords.length),
    found.length ? copy.foundLabel(found.join(" ")) : copy.foundNone,
    missing.length ? copy.missingLabel(missing.join(" ")) : `${copy.output} ${question.runOutput}`,
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

const conceptI18n: Partial<Record<InterfaceLanguage, Record<string, string>>> = {
  zh: {
    "current concept": "当前知识点",
    "constant variable": "常量变量",
    "function return": "函数返回值",
    "array mapping": "数组映射",
    "async await": "异步等待",
    "printing a value": "输出一个值",
    "naming a value": "给值命名",
    "reusable function": "可复用函数",
    "basic collection": "基础集合",
  },
  ja: {
    "current concept": "現在の概念",
    "constant variable": "定数変数",
    "function return": "関数の戻り値",
    "array mapping": "配列の map",
    "async await": "async await",
    "printing a value": "値の出力",
    "naming a value": "値に名前を付ける",
    "reusable function": "再利用できる関数",
    "basic collection": "基本コレクション",
  },
  ko: {
    "current concept": "현재 개념",
    "constant variable": "상수 변수",
    "function return": "함수 반환",
    "array mapping": "배열 매핑",
    "async await": "async await",
    "printing a value": "값 출력",
    "naming a value": "값 이름 붙이기",
    "reusable function": "재사용 함수",
    "basic collection": "기본 컬렉션",
  },
  es: {
    "current concept": "concepto actual",
    "constant variable": "variable constante",
    "function return": "retorno de funcion",
    "array mapping": "map de arreglo",
    "async await": "async await",
    "printing a value": "imprimir un valor",
    "naming a value": "nombrar un valor",
    "reusable function": "funcion reutilizable",
    "basic collection": "coleccion basica",
  },
  ar: {
    "current concept": "المفهوم الحالي",
    "constant variable": "المتغير الثابت",
    "function return": "إرجاع الدالة",
    "array mapping": "تحويل المصفوفة",
    "async await": "async await",
    "printing a value": "طباعة قيمة",
    "naming a value": "تسمية قيمة",
    "reusable function": "دالة قابلة لإعادة الاستخدام",
    "basic collection": "مجموعة أساسية",
  },
};

const compactConceptI18n: Partial<Record<InterfaceLanguage, Record<string, string>>> = {
  fr: {
    "current concept": "concept actuel",
    "constant variable": "variable constante",
    "function return": "retour de fonction",
    "array mapping": "transformation de tableau",
    "async await": "async await",
    "printing a value": "afficher une valeur",
    "naming a value": "nommer une valeur",
    "reusable function": "fonction reutilisable",
    "basic collection": "collection de base",
  },
  de: {
    "current concept": "aktuelles konzept",
    "constant variable": "konstante variable",
    "function return": "funktionsrueckgabe",
    "array mapping": "array transformation",
    "async await": "async await",
    "printing a value": "wert ausgeben",
    "naming a value": "wert benennen",
    "reusable function": "wiederverwendbare funktion",
    "basic collection": "basissammlung",
  },
  pt: {
    "current concept": "conceito atual",
    "constant variable": "variavel constante",
    "function return": "retorno de funcao",
    "array mapping": "transformacao de array",
    "async await": "async await",
    "printing a value": "imprimir um valor",
    "naming a value": "nomear um valor",
    "reusable function": "funcao reutilizavel",
    "basic collection": "colecao basica",
  },
  ru: {
    "current concept": "текущая тема",
    "constant variable": "константная переменная",
    "function return": "возврат функции",
    "array mapping": "преобразование массива",
    "async await": "async await",
    "printing a value": "вывод значения",
    "naming a value": "именование значения",
    "reusable function": "переиспользуемая функция",
    "basic collection": "базовая коллекция",
  },
  hi: {
    "current concept": "मौजूदा concept",
    "constant variable": "constant variable",
    "function return": "function return",
    "array mapping": "array mapping",
    "async await": "async await",
    "printing a value": "value print करना",
    "naming a value": "value को नाम देना",
    "reusable function": "दोबारा इस्तेमाल होने वाला function",
    "basic collection": "basic collection",
  },
  id: {
    "current concept": "konsep saat ini",
    "constant variable": "variabel konstan",
    "function return": "nilai balik fungsi",
    "array mapping": "pemetaan array",
    "async await": "async await",
    "printing a value": "mencetak nilai",
    "naming a value": "memberi nama nilai",
    "reusable function": "fungsi yang bisa dipakai ulang",
    "basic collection": "koleksi dasar",
  },
  vi: {
    "current concept": "khai niem hien tai",
    "constant variable": "bien hang",
    "function return": "gia tri tra ve cua ham",
    "array mapping": "bien doi mang",
    "async await": "async await",
    "printing a value": "in mot gia tri",
    "naming a value": "dat ten cho gia tri",
    "reusable function": "ham tai su dung",
    "basic collection": "tap hop co ban",
  },
  th: {
    "current concept": "แนวคิดปัจจุบัน",
    "constant variable": "ตัวแปรค่าคงที่",
    "function return": "ค่าที่ function คืนกลับ",
    "array mapping": "การแปลง array",
    "async await": "async await",
    "printing a value": "พิมพ์ค่าออกมา",
    "naming a value": "ตั้งชื่อให้ค่า",
    "reusable function": "function ที่ใช้ซ้ำได้",
    "basic collection": "collection พื้นฐาน",
  },
  tr: {
    "current concept": "guncel kavram",
    "constant variable": "sabit degisken",
    "function return": "fonksiyon return",
    "array mapping": "array donusumu",
    "async await": "async await",
    "printing a value": "deger yazdirma",
    "naming a value": "degeri adlandirma",
    "reusable function": "yeniden kullanilabilir fonksiyon",
    "basic collection": "temel koleksiyon",
  },
  it: {
    "current concept": "concetto attuale",
    "constant variable": "variabile costante",
    "function return": "ritorno della funzione",
    "array mapping": "mappatura array",
    "async await": "async await",
    "printing a value": "stampare un valore",
    "naming a value": "nominare un valore",
    "reusable function": "funzione riutilizzabile",
    "basic collection": "collezione base",
  },
  nl: {
    "current concept": "huidig concept",
    "constant variable": "constante variabele",
    "function return": "functie return",
    "array mapping": "array mapping",
    "async await": "async await",
    "printing a value": "een waarde printen",
    "naming a value": "een waarde benoemen",
    "reusable function": "herbruikbare functie",
    "basic collection": "basiscollectie",
  },
  pl: {
    "current concept": "aktualny koncept",
    "constant variable": "stala zmienna",
    "function return": "zwrot funkcji",
    "array mapping": "mapowanie tablicy",
    "async await": "async await",
    "printing a value": "wypisanie wartosci",
    "naming a value": "nazwanie wartosci",
    "reusable function": "funkcja wielokrotnego uzycia",
    "basic collection": "podstawowa kolekcja",
  },
};

function conceptLabel(question: ProgrammingQuestion, language: InterfaceLanguage) {
  const concept = getConcept(question);
  return conceptI18n[language]?.[concept] ?? compactConceptI18n[language]?.[concept] ?? concept;
}

function questionTitle(question: ProgrammingQuestion, language: InterfaceLanguage, languageTitle: string) {
  if (language === "en") return question.title;
  return questionUiCopy[language].title(languageTitle, question.index);
}

function questionPrompt(question: ProgrammingQuestion, language: InterfaceLanguage, languageTitle: string) {
  if (language === "en") return question.prompt;
  const copy = questionUiCopy[language];
  if (question.type === "MULTIPLE_CHOICE") return copy.choicePrompt(languageTitle, question.index, conceptLabel(question, language));
  if (question.type === "FILL_BLANK") return copy.fillPrompt(languageTitle);
  return copy.practicalPrompt(languageTitle);
}

function questionHints(question: ProgrammingQuestion, activeRole: string, language: InterfaceLanguage) {
  if (language === "en") return question.hints;
  return questionUiCopy[language].hints(
    conceptLabel(question, language),
    activeRole,
    question.requiredKeywords.slice(0, 3).join(" "),
  );
}

type QuestionExplanationCopy = {
  choice: (concept: string) => string;
  fill: (concept: string, answer: string) => string;
  practical: (languageTitle: string, keywords: string) => string;
};

const questionExplanationCopy: Record<InterfaceLanguage, QuestionExplanationCopy> = {
  en: {
    choice: (concept) => `The correct choice matches ${concept} and avoids guessing before running the code.`,
    fill: (_concept, answer) => `The missing part is ${answer}. Put it back and read the line from left to right.`,
    practical: (languageTitle, keywords) => `A working ${languageTitle} answer should include the required parts ${keywords}.`,
  },
  zh: {
    choice: (concept) => `正确选项对应 ${concept}，不要靠猜语法，要看它是否能解释代码行为。`,
    fill: (_concept, answer) => `缺失部分是 ${answer}。把它放回代码里，再从左到右读一遍这一行。`,
    practical: (languageTitle, keywords) => `${languageTitle} 实操答案要先满足这些关键部分 ${keywords}，再考虑写得漂亮。`,
  },
  ja: {
    choice: (concept) => `正しい選択肢は ${concept} に合っています。構文を暗記するより、コードの動きを説明できるかを見ます。`,
    fill: (_concept, answer) => `空欄に入るのは ${answer} です。戻したあと、その行を左から右へ読み直してください。`,
    practical: (languageTitle, keywords) => `${languageTitle} の実践回答では、まず ${keywords} を含めることを確認します。`,
  },
  ko: {
    choice: (concept) => `정답은 ${concept} 와 맞습니다. 문법을 외우기보다 코드 동작을 설명할 수 있는지 확인하세요.`,
    fill: (_concept, answer) => `빈칸은 ${answer} 입니다. 다시 넣고 그 줄을 왼쪽에서 오른쪽으로 읽어 보세요.`,
    practical: (languageTitle, keywords) => `${languageTitle} 실습 답안은 먼저 ${keywords} 를 포함해야 합니다.`,
  },
  es: {
    choice: (concept) => `La opción correcta encaja con ${concept}. No memorices al azar, comprueba si explica el comportamiento del código.`,
    fill: (_concept, answer) => `La parte que falta es ${answer}. Vuelve a ponerla y lee la línea de izquierda a derecha.`,
    practical: (languageTitle, keywords) => `Una solución de ${languageTitle} debe incluir primero estas partes clave ${keywords}.`,
  },
  fr: {
    choice: (concept) => `Le bon choix correspond a ${concept}. Ne devine pas la syntaxe, verifie si elle explique le comportement du code.`,
    fill: (_concept, answer) => `La partie manquante est ${answer}. Remets-la puis relis la ligne de gauche a droite.`,
    practical: (languageTitle, keywords) => `Une reponse ${languageTitle} doit d abord contenir ces elements ${keywords}.`,
  },
  de: {
    choice: (concept) => `Die richtige Auswahl passt zu ${concept}. Rate keine Syntax, sondern pruefe ob sie das Codeverhalten erklaert.`,
    fill: (_concept, answer) => `Der fehlende Teil ist ${answer}. Setze ihn ein und lies die Zeile von links nach rechts.`,
    practical: (languageTitle, keywords) => `Eine ${languageTitle} Loesung sollte zuerst diese Teile enthalten ${keywords}.`,
  },
  pt: {
    choice: (concept) => `A opcao correta combina com ${concept}. Nao chute sintaxe, veja se ela explica o comportamento do codigo.`,
    fill: (_concept, answer) => `A parte que falta e ${answer}. Recoloque e leia a linha da esquerda para a direita.`,
    practical: (languageTitle, keywords) => `Uma solucao em ${languageTitle} deve incluir primeiro estas partes ${keywords}.`,
  },
  ru: {
    choice: (concept) => `Правильный вариант соответствует теме ${concept}. Не угадывай синтаксис, проверь объясняет ли он поведение кода.`,
    fill: (_concept, answer) => `Пропущенная часть это ${answer}. Верни ее и прочитай строку слева направо.`,
    practical: (languageTitle, keywords) => `Решение на ${languageTitle} сначала должно содержать эти части ${keywords}.`,
  },
  ar: {
    choice: (concept) => `الخيار الصحيح يطابق ${concept}. لا تحفظ الصياغة عشوائيا، بل تأكد أنه يشرح سلوك الكود.`,
    fill: (_concept, answer) => `الجزء الناقص هو ${answer}. أعده إلى السطر ثم اقرأ السطر من البداية إلى النهاية.`,
    practical: (languageTitle, keywords) => `إجابة ${languageTitle} العملية يجب أن تحتوي أولا على هذه الأجزاء ${keywords}.`,
  },
  hi: {
    choice: (concept) => `सही विकल्प ${concept} से मेल खाता है. Syntax guess मत करें, देखें कि यह code behavior समझाता है या नहीं.`,
    fill: (_concept, answer) => `Missing part ${answer} है. इसे वापस रखें और line को शुरू से अंत तक पढ़ें.`,
    practical: (languageTitle, keywords) => `${languageTitle} solution में पहले ये required parts होने चाहिए ${keywords}.`,
  },
  id: {
    choice: (concept) => `Pilihan benar cocok dengan ${concept}. Jangan menebak sintaks, cek apakah ia menjelaskan perilaku kode.`,
    fill: (_concept, answer) => `Bagian yang hilang adalah ${answer}. Masukkan kembali lalu baca barisnya dari awal sampai akhir.`,
    practical: (languageTitle, keywords) => `Jawaban ${languageTitle} harus memuat bagian wajib ini lebih dulu ${keywords}.`,
  },
  vi: {
    choice: (concept) => `Lua chon dung khop voi ${concept}. Dung doan cu phap, hay xem no giai thich duoc hanh vi code khong.`,
    fill: (_concept, answer) => `Phan bi thieu la ${answer}. Dat lai vao dong roi doc tu trai sang phai.`,
    practical: (languageTitle, keywords) => `Loi giai ${languageTitle} truoc het can co cac phan ${keywords}.`,
  },
  th: {
    choice: (concept) => `ตัวเลือกที่ถูกต้องตรงกับ ${concept} อย่าเดา syntax ให้ดูว่ามันอธิบายพฤติกรรมของโค้ดได้หรือไม่`,
    fill: (_concept, answer) => `ส่วนที่หายไปคือ ${answer} ใส่กลับเข้าไปแล้วอ่านบรรทัดนั้นตั้งแต่ต้นจนจบ`,
    practical: (languageTitle, keywords) => `คำตอบ ${languageTitle} ควรมีส่วนสำคัญเหล่านี้ก่อน ${keywords}`,
  },
  tr: {
    choice: (concept) => `Dogru secenek ${concept} ile eslesir. Syntax tahmin etme, kod davranisini aciklayip aciklamadigina bak.`,
    fill: (_concept, answer) => `Eksik parca ${answer}. Onu geri koy ve satiri bastan sona oku.`,
    practical: (languageTitle, keywords) => `${languageTitle} cozumu once bu gerekli parcalari icermeli ${keywords}.`,
  },
  it: {
    choice: (concept) => `La scelta corretta corrisponde a ${concept}. Non indovinare la sintassi, verifica se spiega il comportamento del codice.`,
    fill: (_concept, answer) => `La parte mancante e ${answer}. Rimettila e rileggi la riga da sinistra a destra.`,
    practical: (languageTitle, keywords) => `Una soluzione ${languageTitle} deve prima contenere queste parti ${keywords}.`,
  },
  nl: {
    choice: (concept) => `De juiste keuze past bij ${concept}. Raad geen syntax, maar kijk of die het codegedrag verklaart.`,
    fill: (_concept, answer) => `Het ontbrekende deel is ${answer}. Zet het terug en lees de regel van begin tot eind.`,
    practical: (languageTitle, keywords) => `Een ${languageTitle} antwoord moet eerst deze verplichte delen bevatten ${keywords}.`,
  },
  pl: {
    choice: (concept) => `Poprawna opcja pasuje do ${concept}. Nie zgaduj skladni, sprawdz czy wyjasnia zachowanie kodu.`,
    fill: (_concept, answer) => `Brakujaca czesc to ${answer}. Wstaw ja z powrotem i przeczytaj linie od poczatku do konca.`,
    practical: (languageTitle, keywords) => `Rozwiazanie ${languageTitle} powinno najpierw zawierac te czesci ${keywords}.`,
  },
};

function questionExplanation(question: ProgrammingQuestion, language: InterfaceLanguage, languageTitle: string) {
  if (language === "en") return question.explanation;
  const copy = questionExplanationCopy[language];
  const concept = conceptLabel(question, language);
  const answerHead = question.answer.split(/\r?\n/)[0];
  const keywords = question.requiredKeywords.slice(0, 3).join(" ");
  if (question.type === "MULTIPLE_CHOICE") return copy.choice(concept);
  if (question.type === "FILL_BLANK") return copy.fill(concept, answerHead);
  return copy.practical(languageTitle, keywords);
}

function roleForInterface(activeLanguage: ReturnType<typeof getProgrammingLanguage>, language: InterfaceLanguage) {
  if (language === "zh") return languageRoleZh[activeLanguage.slug] ?? genericRoleForInterface(activeLanguage, language);
  if (language === "ja") return languageRoleJa[activeLanguage.slug] ?? genericRoleForInterface(activeLanguage, language);
  if (language === "ko") return languageRoleKo[activeLanguage.slug] ?? genericRoleForInterface(activeLanguage, language);
  if (language === "es") return languageRoleEs[activeLanguage.slug] ?? genericRoleForInterface(activeLanguage, language);
  if (language === "ar") return languageRoleAr[activeLanguage.slug] ?? genericRoleForInterface(activeLanguage, language);
  return genericRoleForInterface(activeLanguage, language);
}

function habitForInterface(activeLanguage: ReturnType<typeof getProgrammingLanguage>, language: InterfaceLanguage) {
  if (language === "zh") return languageHabitZh[activeLanguage.slug] ?? genericHabitForInterface(activeLanguage, language);
  if (language === "ja") return languageHabitJa[activeLanguage.slug] ?? genericHabitForInterface(activeLanguage, language);
  if (language === "ko") return languageHabitKo[activeLanguage.slug] ?? genericHabitForInterface(activeLanguage, language);
  if (language === "es") return languageHabitEs[activeLanguage.slug] ?? genericHabitForInterface(activeLanguage, language);
  if (language === "ar") return languageHabitAr[activeLanguage.slug] ?? genericHabitForInterface(activeLanguage, language);
  return genericHabitForInterface(activeLanguage, language);
}

const genericDefinitionI18n: Partial<Record<InterfaceLanguage, {
  aria: (title: string) => string;
  eyebrow: string;
  title: (title: string) => string;
  body: (title: string, role: string) => string;
  runtimeTitle: string;
  fileLabel: string;
  runLabel: string;
  habitLabel: string;
  starterTitle: string;
  outputLabel: string;
  cards: (runtime: string, fileName: string) => [string, string][];
}>> = {
  fr: {
    aria: (title) => `definition de ${title}`,
    eyebrow: "definition d abord",
    title: (title) => `ce que signifie ${title}`,
    body: (title, role) => `${title} sert a ecrire des instructions precises. Ici tu l abordes comme ${role}. Commence par une idee simple: des entrees passent par des etapes et deviennent une sortie.`,
    runtimeTitle: "infos minimales",
    fileLabel: "fichier",
    runLabel: "executer",
    habitLabel: "habitude",
    starterTitle: "premier code lisible",
    outputLabel: "sortie",
    cards: (runtime, fileName) => [
      ["programme", "une suite d instructions executees dans un ordre clair."],
      ["valeur et variable", "une valeur est une donnee. Une variable est le nom qui la garde."],
      ["fonction", "un petit travail nomme qui recoit une entree et produit un resultat."],
      ["environnement", `${runtime} execute le code de ${fileName}.`],
    ],
  },
  de: {
    aria: (title) => `${title} definition`,
    eyebrow: "erst definieren",
    title: (title) => `was ${title} bedeutet`,
    body: (title, role) => `${title} schreibt genaue Anweisungen. Hier lernst du es als ${role}. Starte mit einem Modell: Eingabe geht durch Schritte und wird Ausgabe.`,
    runtimeTitle: "minimale Laufdaten",
    fileLabel: "datei",
    runLabel: "starten",
    habitLabel: "gewohnheit",
    starterTitle: "erster lesbarer Code",
    outputLabel: "ausgabe",
    cards: (runtime, fileName) => [
      ["programm", "eine geordnete Folge von Anweisungen."],
      ["wert und variable", "ein Wert ist Dateninhalt. Eine Variable ist sein Name."],
      ["funktion", "ein benannter kleiner Arbeitsschritt mit Eingabe und Ergebnis."],
      ["laufzeit", `${runtime} fuehrt Code aus ${fileName} aus.`],
    ],
  },
  pt: {
    aria: (title) => `definicao de ${title}`,
    eyebrow: "definicao primeiro",
    title: (title) => `o que ${title} significa`,
    body: (title, role) => `${title} escreve instrucoes precisas. Aqui voce aprende como ${role}. Comece com uma ideia: entrada passa por passos e vira saida.`,
    runtimeTitle: "dados minimos",
    fileLabel: "arquivo",
    runLabel: "rodar",
    habitLabel: "habito",
    starterTitle: "primeiro codigo legivel",
    outputLabel: "saida",
    cards: (runtime, fileName) => [
      ["programa", "uma sequencia ordenada de instrucoes."],
      ["valor e variavel", "valor e dado. variavel e o nome que guarda esse dado."],
      ["funcao", "um trabalho pequeno com nome, entrada e resultado."],
      ["ambiente", `${runtime} executa o codigo de ${fileName}.`],
    ],
  },
  ru: {
    aria: (title) => `определение ${title}`,
    eyebrow: "сначала определение",
    title: (title) => `что такое ${title}`,
    body: (title, role) => `${title} нужен для точных инструкций. Здесь это ${role}. Начинай с модели: вход проходит шаги и становится выходом.`,
    runtimeTitle: "минимум для запуска",
    fileLabel: "файл",
    runLabel: "запуск",
    habitLabel: "привычка",
    starterTitle: "первый читаемый код",
    outputLabel: "вывод",
    cards: (runtime, fileName) => [
      ["программа", "упорядоченный набор инструкций."],
      ["значение и переменная", "значение это данные. переменная это имя для этих данных."],
      ["функция", "маленькая именованная работа с входом и результатом."],
      ["среда", `${runtime} запускает код из ${fileName}.`],
    ],
  },
  hi: {
    aria: (title) => `${title} की परिभाषा`,
    eyebrow: "पहले परिभाषा",
    title: (title) => `${title} क्या है`,
    body: (title, role) => `${title} सटीक निर्देश लिखने की भाषा है. यहां इसे ${role} की तरह सीखें. मूल बात: input कदमों से गुजरकर output बनता है.`,
    runtimeTitle: "चलाने की न्यूनतम जानकारी",
    fileLabel: "फाइल",
    runLabel: "चलाएं",
    habitLabel: "आदत",
    starterTitle: "पहला पढ़ने योग्य कोड",
    outputLabel: "आउटपुट",
    cards: (runtime, fileName) => [
      ["प्रोग्राम", "क्रम से चलने वाले निर्देशों का समूह."],
      ["value और variable", "value data है. variable उस data का नाम है."],
      ["function", "नाम वाला छोटा काम जो input लेकर result देता है."],
      ["runtime", `${runtime} ${fileName} का code चलाता है.`],
    ],
  },
  id: {
    aria: (title) => `definisi ${title}`,
    eyebrow: "definisi dulu",
    title: (title) => `apa itu ${title}`,
    body: (title, role) => `${title} dipakai untuk menulis instruksi tepat. Di sini kamu memakainya sebagai ${role}. Model awalnya sederhana: input melewati langkah lalu menjadi output.`,
    runtimeTitle: "fakta minimum",
    fileLabel: "file",
    runLabel: "jalankan",
    habitLabel: "kebiasaan",
    starterTitle: "kode pertama yang mudah dibaca",
    outputLabel: "output",
    cards: (runtime, fileName) => [
      ["program", "urutan instruksi yang dijalankan dengan jelas."],
      ["nilai dan variabel", "nilai adalah data. variabel adalah nama untuk menyimpan data."],
      ["fungsi", "pekerjaan kecil bernama yang menerima input dan menghasilkan hasil."],
      ["runtime", `${runtime} menjalankan kode dari ${fileName}.`],
    ],
  },
  vi: {
    aria: (title) => `dinh nghia ${title}`,
    eyebrow: "dinh nghia truoc",
    title: (title) => `${title} la gi`,
    body: (title, role) => `${title} dung de viet chi dan chinh xac. O day ban hoc theo ${role}. Hay bat dau voi mot mo hinh: dau vao qua cac buoc roi thanh dau ra.`,
    runtimeTitle: "thong tin chay toi thieu",
    fileLabel: "tep",
    runLabel: "chay",
    habitLabel: "thoi quen",
    starterTitle: "doan code dau tien",
    outputLabel: "dau ra",
    cards: (runtime, fileName) => [
      ["chuong trinh", "tap hop lenh duoc chay theo thu tu."],
      ["gia tri va bien", "gia tri la du lieu. bien la ten de giu du lieu."],
      ["ham", "mot viec nho co ten, nhan dau vao va tao ket qua."],
      ["moi truong", `${runtime} chay code trong ${fileName}.`],
    ],
  },
  th: {
    aria: (title) => `นิยาม ${title}`,
    eyebrow: "นิยามก่อน",
    title: (title) => `${title} คืออะไร`,
    body: (title, role) => `${title} ใช้เขียนคำสั่งที่ชัดเจน ที่นี่เรียนเป็น ${role} เริ่มจากภาพเดียว input ผ่านขั้นตอนแล้วกลายเป็น output`,
    runtimeTitle: "ข้อมูลรันขั้นต่ำ",
    fileLabel: "ไฟล์",
    runLabel: "รัน",
    habitLabel: "นิสัย",
    starterTitle: "โค้ดแรกที่อ่านง่าย",
    outputLabel: "ผลลัพธ์",
    cards: (runtime, fileName) => [
      ["โปรแกรม", "ชุดคำสั่งที่ทำงานตามลำดับ"],
      ["ค่าและตัวแปร", "ค่าคือข้อมูล ตัวแปรคือชื่อที่เก็บข้อมูล"],
      ["ฟังก์ชัน", "งานย่อยที่มีชื่อ รับ input และสร้างผลลัพธ์"],
      ["runtime", `${runtime} รันโค้ดจาก ${fileName}`],
    ],
  },
  tr: {
    aria: (title) => `${title} tanimi`,
    eyebrow: "once tanim",
    title: (title) => `${title} nedir`,
    body: (title, role) => `${title} kesin talimatlar yazmak icindir. Burada onu ${role} olarak ogreniyorsun. Baslangic modeli: girdi adimlardan gecer ve cikti olur.`,
    runtimeTitle: "minimum calisma bilgisi",
    fileLabel: "dosya",
    runLabel: "calistir",
    habitLabel: "aliskanlik",
    starterTitle: "ilk okunur kod",
    outputLabel: "cikti",
    cards: (runtime, fileName) => [
      ["program", "sirayla calisan talimatlar toplami."],
      ["deger ve degisken", "deger veridir. degisken bu veriyi tutan isimdir."],
      ["fonksiyon", "girdi alip sonuc ureten isimli kucuk is."],
      ["runtime", `${runtime} ${fileName} icindeki kodu calistirir.`],
    ],
  },
  it: {
    aria: (title) => `definizione di ${title}`,
    eyebrow: "prima la definizione",
    title: (title) => `che cosa significa ${title}`,
    body: (title, role) => `${title} serve a scrivere istruzioni precise. Qui lo impari come ${role}. Parti da un modello: input, passaggi, output.`,
    runtimeTitle: "dati minimi di esecuzione",
    fileLabel: "file",
    runLabel: "esegui",
    habitLabel: "abitudine",
    starterTitle: "primo codice leggibile",
    outputLabel: "output",
    cards: (runtime, fileName) => [
      ["programma", "una sequenza ordinata di istruzioni."],
      ["valore e variabile", "un valore e un dato. una variabile e il nome che lo conserva."],
      ["funzione", "un piccolo lavoro con nome, input e risultato."],
      ["runtime", `${runtime} esegue il codice in ${fileName}.`],
    ],
  },
  nl: {
    aria: (title) => `${title} definitie`,
    eyebrow: "eerst definitie",
    title: (title) => `wat ${title} betekent`,
    body: (title, role) => `${title} schrijft precieze instructies. Hier leer je het als ${role}. Begin met een model: input gaat door stappen en wordt output.`,
    runtimeTitle: "minimale run info",
    fileLabel: "bestand",
    runLabel: "run",
    habitLabel: "gewoonte",
    starterTitle: "eerste leesbare code",
    outputLabel: "output",
    cards: (runtime, fileName) => [
      ["programma", "een geordende reeks instructies."],
      ["waarde en variabele", "een waarde is data. een variabele is de naam voor die data."],
      ["functie", "een klein benoemd werk met input en resultaat."],
      ["runtime", `${runtime} voert code uit ${fileName} uit.`],
    ],
  },
  pl: {
    aria: (title) => `definicja ${title}`,
    eyebrow: "najpierw definicja",
    title: (title) => `co oznacza ${title}`,
    body: (title, role) => `${title} sluzy do pisania precyzyjnych instrukcji. Tutaj uczysz sie go jako ${role}. Model startowy: wejscie przechodzi przez kroki i staje sie wyjsciem.`,
    runtimeTitle: "minimum uruchomienia",
    fileLabel: "plik",
    runLabel: "uruchom",
    habitLabel: "nawyk",
    starterTitle: "pierwszy czytelny kod",
    outputLabel: "wyjscie",
    cards: (runtime, fileName) => [
      ["program", "uporzadkowany zestaw instrukcji."],
      ["wartosc i zmienna", "wartosc to dane. zmienna to nazwa, ktora je przechowuje."],
      ["funkcja", "male nazwane zadanie z wejsciem i wynikiem."],
      ["runtime", `${runtime} uruchamia kod z ${fileName}.`],
    ],
  },
};

const runtimeLabelCopy: Partial<Record<InterfaceLanguage, Record<string, string>>> = {
  zh: {
    "Browser console or Node.js": "浏览器控制台或 Node.js",
    Browser: "浏览器",
    "POSIX shell compatible terminal": "兼容 POSIX 的终端",
    "PostgreSQL compatible SQL": "兼容 PostgreSQL 的 SQL 环境",
    "PHP CLI or web server": "PHP 命令行或 Web 服务器",
    "Swift toolchain": "Swift 工具链",
    "Kotlin compiler": "Kotlin 编译器",
    "C compiler": "C 编译器",
    "Solidity compiler": "Solidity 编译器",
    "Zig toolchain": "Zig 工具链",
    "Nim compiler": "Nim 编译器",
    "Crystal compiler": "Crystal 编译器",
    "V compiler": "V 编译器",
    "D compiler": "D 编译器",
  },
  ja: {
    "Browser console or Node.js": "ブラウザーコンソールまたは Node.js",
    Browser: "ブラウザー",
    "POSIX shell compatible terminal": "POSIX 互換ターミナル",
    "PostgreSQL compatible SQL": "PostgreSQL 互換 SQL 環境",
  },
  ko: {
    "Browser console or Node.js": "브라우저 콘솔 또는 Node.js",
    Browser: "브라우저",
    "POSIX shell compatible terminal": "POSIX 호환 터미널",
    "PostgreSQL compatible SQL": "PostgreSQL 호환 SQL 환경",
  },
  es: {
    "Browser console or Node.js": "consola del navegador o Node.js",
    Browser: "navegador",
    "POSIX shell compatible terminal": "terminal compatible con POSIX",
    "PostgreSQL compatible SQL": "entorno SQL compatible con PostgreSQL",
  },
  ar: {
    "Browser console or Node.js": "وحدة تحكم المتصفح أو Node.js",
    Browser: "المتصفح",
    "POSIX shell compatible terminal": "طرفية متوافقة مع POSIX",
    "PostgreSQL compatible SQL": "بيئة SQL متوافقة مع PostgreSQL",
    "PHP CLI or web server": "سطر أوامر PHP أو خادم ويب",
    "Swift toolchain": "أدوات Swift",
    "Kotlin compiler": "مترجم Kotlin",
    "Scala CLI or sbt": "Scala CLI أو sbt",
    "MATLAB or Octave": "MATLAB أو Octave",
    "Erlang shell or escript": "صدفة Erlang أو escript",
    "Clojure CLI": "سطر أوامر Clojure",
    "C compiler": "مترجم C",
    "Assembler and linker": "المجمع والرابط",
    "Solidity compiler": "مترجم Solidity",
    "Clang Objective C": "Clang للغة Objective C",
    "Zig toolchain": "أدوات Zig",
    "Nim compiler": "مترجم Nim",
    "Crystal compiler": "مترجم Crystal",
    "PowerShell 7": "PowerShell 7",
    "Free Pascal": "Free Pascal",
    "SWI-Prolog": "SWI-Prolog",
    "Elm compiler": "مترجم Elm",
    "V compiler": "مترجم V",
    "D compiler": "مترجم D",
    "Pharo or GNU Smalltalk": "Pharo أو GNU Smalltalk",
    "SAP ABAP": "بيئة SAP ABAP",
    "Delphi or Free Pascal": "Delphi أو Free Pascal",
    "Tcl shell": "صدفة Tcl",
  },
};

function runtimeLabel(runtime: string, language: InterfaceLanguage) {
  return runtimeLabelCopy[language]?.[runtime] || runtime;
}

function definitionCopy(activeLanguage: ReturnType<typeof getProgrammingLanguage>, activeRole: string, language: InterfaceLanguage) {
  const starter = activeLanguage.tutorialSections[0];
  const runtime = runtimeLabel(activeLanguage.runtime, language);
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
        ["运行环境", `${runtime} 负责真正执行 ${activeLanguage.fileName} 里的代码。`],
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
        ["実行環境", `${runtime} が ${activeLanguage.fileName} のコードを実行します。`],
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
        ["실행 환경", `${runtime} 가 ${activeLanguage.fileName} 의 코드를 실행합니다.`],
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
        ["entorno", `${runtime} ejecuta el código de ${activeLanguage.fileName}.`],
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
        ["بيئة التشغيل", `${runtime} هي البيئة التي تشغل كود ${activeLanguage.fileName}.`],
      ],
      starter,
    };
  }

  const genericDefinition = genericDefinitionI18n[language];
  if (genericDefinition) {
    return {
      aria: genericDefinition.aria(activeLanguage.title),
      eyebrow: genericDefinition.eyebrow,
      title: genericDefinition.title(activeLanguage.title),
      body: genericDefinition.body(activeLanguage.title, activeRole),
      runtimeTitle: genericDefinition.runtimeTitle,
      fileLabel: genericDefinition.fileLabel,
      runLabel: genericDefinition.runLabel,
      habitLabel: genericDefinition.habitLabel,
      habit: habitForInterface(activeLanguage, language),
      starterTitle: genericDefinition.starterTitle,
      outputLabel: genericDefinition.outputLabel,
      cards: genericDefinition.cards(runtime, activeLanguage.fileName),
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
      ["Runtime", `${runtime} is the place that actually runs code from ${activeLanguage.fileName}.`],
    ],
    starter,
  };
}

function interfaceLanguageLabel(language: InterfaceLanguage) {
  if (language === "zh") return "Chinese";
  if (language === "ja") return "Japanese";
  if (language === "ko") return "Korean";
  if (language === "es") return "Spanish";
  if (language === "fr") return "French";
  if (language === "de") return "German";
  if (language === "pt") return "Portuguese";
  if (language === "ru") return "Russian";
  if (language === "ar") return "Arabic";
  if (language === "hi") return "Hindi";
  if (language === "id") return "Indonesian";
  if (language === "vi") return "Vietnamese";
  if (language === "th") return "Thai";
  if (language === "tr") return "Turkish";
  if (language === "it") return "Italian";
  if (language === "nl") return "Dutch";
  if (language === "pl") return "Polish";
  return "English";
}

function pendingResultLabel(language: InterfaceLanguage) {
  if (language === "zh") return "未提交";
  if (language === "ja") return "未提出";
  if (language === "ko") return "미제출";
  if (language === "es") return "sin enviar";
  if (language === "fr") return "non envoye";
  if (language === "de") return "nicht gesendet";
  if (language === "pt") return "nao enviado";
  if (language === "ru") return "не отправлено";
  if (language === "ar") return "لم يتم الإرسال";
  if (language === "hi") return "जमा नहीं";
  if (language === "id") return "belum dikirim";
  if (language === "vi") return "chua nop";
  if (language === "th") return "ยังไม่ส่ง";
  if (language === "tr") return "gonderilmedi";
  if (language === "it") return "non inviato";
  if (language === "nl") return "niet verzonden";
  if (language === "pl") return "nie wyslano";
  return "not submitted";
}

type QuestionUiCopy = {
  sample: string;
  output: string;
  codeCheck: string;
  foundNone: string;
  foundLabel: (items: string) => string;
  missingLabel: (items: string) => string;
  requiredFound: (found: number, total: number) => string;
  title: (languageTitle: string, index: number) => string;
  choicePrompt: (languageTitle: string, index: number, concept: string) => string;
  fillPrompt: (languageTitle: string) => string;
  practicalPrompt: (languageTitle: string) => string;
  hints: (concept: string, activeRole: string, keywords: string) => string[];
};

const englishQuestionUiCopy: QuestionUiCopy = {
  sample: "Sample",
  output: "Output",
  codeCheck: "Code check",
  foundNone: "Found none yet",
  foundLabel: (items) => `Found ${items}`,
  missingLabel: (items) => `Missing ${items}`,
  requiredFound: (found, total) => `${found}/${total} required parts found`,
  title: (_languageTitle, index) => `Question ${index}`,
  choicePrompt: (languageTitle, index, concept) => `${languageTitle} question ${index}. Choose the statement that best matches ${concept}.`,
  fillPrompt: (languageTitle) => `Look at the blank in the ${languageTitle} code and type the missing part.`,
  practicalPrompt: (languageTitle) => `Write a small ${languageTitle} solution first. Open hints only after trying.`,
  hints: (concept, activeRole, keywords) => [
    `Find the missing part around ${concept}.`,
    `Keep the practice habit for ${activeRole}.`,
    `The answer should usually include ${keywords}.`,
  ],
};

function questionUiFromEnglish(overrides: Partial<QuestionUiCopy>): QuestionUiCopy {
  return {
    ...englishQuestionUiCopy,
    ...overrides,
  };
}

const questionUiCopy: Record<InterfaceLanguage, QuestionUiCopy> = {
  en: englishQuestionUiCopy,
  zh: {
    sample: "样例",
    output: "输出",
    codeCheck: "代码检查",
    foundNone: "暂时还没找到关键部分",
    foundLabel: (items) => `已找到 ${items}`,
    missingLabel: (items) => `还缺 ${items}`,
    requiredFound: (found, total) => `${found}/${total} 个必需部分已出现`,
    title: (languageTitle, index) => `${languageTitle} 第 ${index} 题`,
    choicePrompt: (languageTitle, index, concept) => `${languageTitle} 第 ${index} 题 选择和 ${concept} 最匹配的说法`,
    fillPrompt: (languageTitle) => `看代码里的空白处 填出这道 ${languageTitle} 题缺失的部分`,
    practicalPrompt: (languageTitle) => `先自己写一遍 ${languageTitle} 小练习 出错后再开提示或对照答案`,
    hints: (concept, activeRole, keywords) => [
      `先看 ${concept} 找出缺的那一块`,
      `保持这个练习习惯 ${activeRole}`,
      `答案里通常应该包含 ${keywords}`,
    ],
  },
  ja: {
    sample: "サンプル",
    output: "出力",
    codeCheck: "コードチェック",
    foundNone: "まだ重要部分は見つかっていません",
    foundLabel: (items) => `見つかったもの ${items}`,
    missingLabel: (items) => `不足 ${items}`,
    requiredFound: (found, total) => `${found}/${total} 個の必須部分を確認`,
    title: (languageTitle, index) => `${languageTitle} 問題 ${index}`,
    choicePrompt: (languageTitle, index, concept) => `${languageTitle} 問題 ${index} ${concept} に最も合う説明を選んでください`,
    fillPrompt: () => "コードの空欄を見て 欠けている部分を埋めてください",
    practicalPrompt: (languageTitle) => `${languageTitle} の小さな練習をまず自分で書いてみてください`,
    hints: (concept, activeRole, keywords) => [
      `${concept} を確認して足りない部分を見つけてください`,
      `この練習習慣を続けてください ${activeRole}`,
      `答えには ${keywords} が含まれるはずです`,
    ],
  },
  ko: {
    sample: "샘플",
    output: "출력",
    codeCheck: "코드 검사",
    foundNone: "아직 핵심 부분을 찾지 못했습니다",
    foundLabel: (items) => `찾음 ${items}`,
    missingLabel: (items) => `부족 ${items}`,
    requiredFound: (found, total) => `${found}/${total} 필수 부분 확인`,
    title: (languageTitle, index) => `${languageTitle} 문제 ${index}`,
    choicePrompt: (languageTitle, index, concept) => `${languageTitle} 문제 ${index} ${concept} 와 가장 일치하는 설명을 선택하세요`,
    fillPrompt: () => "코드의 빈칸을 보고 빠진 부분을 채우세요",
    practicalPrompt: (languageTitle) => `${languageTitle} 작은 연습을 먼저 직접 작성해 보세요`,
    hints: (concept, activeRole, keywords) => [
      `${concept} 를 확인하고 빠진 부분을 찾으세요`,
      `이 연습 습관을 유지하세요 ${activeRole}`,
      `답에는 ${keywords} 가 포함되어야 합니다`,
    ],
  },
  es: {
    sample: "Ejemplo",
    output: "Salida",
    codeCheck: "Revisión de código",
    foundNone: "todavía no se encontró una parte clave",
    foundLabel: (items) => `Encontrado ${items}`,
    missingLabel: (items) => `Falta ${items}`,
    requiredFound: (found, total) => `${found}/${total} partes requeridas encontradas`,
    title: (languageTitle, index) => `${languageTitle} pregunta ${index}`,
    choicePrompt: (languageTitle, index, concept) => `${languageTitle} pregunta ${index}. Elige la explicacion que mejor coincide con ${concept}`,
    fillPrompt: () => "Mira el espacio en blanco del codigo y completa la parte que falta",
    practicalPrompt: (languageTitle) => `Escribe una solucion pequeña de ${languageTitle} antes de mirar pistas o respuesta`,
    hints: (concept, activeRole, keywords) => [
      `revisa ${concept} y busca la parte faltante`,
      `mantén este hábito de práctica ${activeRole}`,
      `la respuesta debería incluir ${keywords}`,
    ],
  },
  fr: questionUiFromEnglish({
    sample: "Exemple",
    output: "Sortie",
    codeCheck: "Verification du code",
    foundNone: "aucune partie cle trouvee pour l instant",
    foundLabel: (items) => `Trouve ${items}`,
    missingLabel: (items) => `Manque ${items}`,
    requiredFound: (found, total) => `${found}/${total} parties requises trouvees`,
    title: (languageTitle, index) => `${languageTitle} question ${index}`,
    choicePrompt: (languageTitle, index, concept) => `${languageTitle} question ${index}. Choisis l explication qui correspond le mieux a ${concept}.`,
    fillPrompt: (languageTitle) => `Regarde le blanc dans le code ${languageTitle} et tape la partie manquante.`,
    practicalPrompt: (languageTitle) => `Ecris d abord une petite solution en ${languageTitle}, puis ouvre les indices.`,
    hints: (concept, activeRole, keywords) => [
      `repere la partie manquante autour de ${concept}`,
      `garde cette habitude de pratique ${activeRole}`,
      `la reponse doit souvent contenir ${keywords}`,
    ],
  }),
  de: questionUiFromEnglish({
    sample: "Beispiel",
    output: "Ausgabe",
    codeCheck: "Codepruefung",
    foundNone: "noch kein wichtiger Teil gefunden",
    foundLabel: (items) => `Gefunden ${items}`,
    missingLabel: (items) => `Fehlt ${items}`,
    requiredFound: (found, total) => `${found}/${total} benoetigte Teile gefunden`,
    title: (languageTitle, index) => `${languageTitle} Frage ${index}`,
    choicePrompt: (languageTitle, index, concept) => `${languageTitle} Frage ${index}. Waehle die Aussage, die am besten zu ${concept} passt.`,
    fillPrompt: (languageTitle) => `Sieh dir die Luecke im ${languageTitle} Code an und gib den fehlenden Teil ein.`,
    practicalPrompt: (languageTitle) => `Schreibe zuerst eine kleine ${languageTitle} Loesung. Oeffne Hinweise erst danach.`,
    hints: (concept, activeRole, keywords) => [
      `suche den fehlenden Teil rund um ${concept}`,
      `halte diese Uebungsgewohnheit fuer ${activeRole}`,
      `die Antwort sollte meist ${keywords} enthalten`,
    ],
  }),
  pt: questionUiFromEnglish({
    sample: "Exemplo",
    output: "Saida",
    codeCheck: "Verificacao de codigo",
    foundNone: "nenhuma parte chave encontrada ainda",
    foundLabel: (items) => `Encontrado ${items}`,
    missingLabel: (items) => `Falta ${items}`,
    requiredFound: (found, total) => `${found}/${total} partes obrigatorias encontradas`,
    title: (languageTitle, index) => `${languageTitle} questao ${index}`,
    choicePrompt: (languageTitle, index, concept) => `${languageTitle} questao ${index}. Escolha a frase que melhor combina com ${concept}.`,
    fillPrompt: (languageTitle) => `Veja o espaco vazio no codigo ${languageTitle} e digite a parte que falta.`,
    practicalPrompt: (languageTitle) => `Escreva primeiro uma pequena solucao em ${languageTitle}. Abra dicas depois.`,
    hints: (concept, activeRole, keywords) => [
      `encontre a parte faltando em ${concept}`,
      `mantenha este habito de treino ${activeRole}`,
      `a resposta geralmente deve conter ${keywords}`,
    ],
  }),
  ru: questionUiFromEnglish({
    sample: "Пример",
    output: "Вывод",
    codeCheck: "Проверка кода",
    foundNone: "ключевые части пока не найдены",
    foundLabel: (items) => `Найдено ${items}`,
    missingLabel: (items) => `Не хватает ${items}`,
    requiredFound: (found, total) => `${found}/${total} обязательных частей найдено`,
    title: (languageTitle, index) => `${languageTitle} вопрос ${index}`,
    choicePrompt: (languageTitle, index, concept) => `${languageTitle} вопрос ${index}. Выбери утверждение, которое лучше всего описывает ${concept}.`,
    fillPrompt: (languageTitle) => `Посмотри на пропуск в коде ${languageTitle} и введи недостающую часть.`,
    practicalPrompt: (languageTitle) => `Сначала напиши маленькое решение на ${languageTitle}. Подсказки открывай после попытки.`,
    hints: (concept, activeRole, keywords) => [
      `найди недостающую часть рядом с ${concept}`,
      `сохраняй эту привычку практики ${activeRole}`,
      `ответ обычно должен содержать ${keywords}`,
    ],
  }),
  ar: {
    sample: "مثال",
    output: "الناتج",
    codeCheck: "فحص الكود",
    foundNone: "لم يتم العثور على الأجزاء المهمة بعد",
    foundLabel: (items) => `تم العثور على ${items}`,
    missingLabel: (items) => `ينقص ${items}`,
    requiredFound: (found, total) => `${found}/${total} أجزاء مطلوبة موجودة`,
    title: (languageTitle, index) => `${languageTitle} السؤال ${index}`,
    choicePrompt: (languageTitle, index, concept) => `${languageTitle} السؤال ${index}. اختر الوصف الأقرب إلى ${concept}`,
    fillPrompt: () => "انظر إلى الفراغ داخل الكود ثم املأ الجزء الناقص",
    practicalPrompt: (languageTitle) => `اكتب حلا صغيرا في ${languageTitle} أولا ثم افتح التلميحات أو الإجابة`,
    hints: (concept, activeRole, keywords) => [
      `راجع ${concept} وابحث عن الجزء الناقص`,
      `حافظ على عادة التدريب هذه ${activeRole}`,
      `غالبا يجب أن تحتوي الإجابة على ${keywords}`,
    ],
  },
  hi: questionUiFromEnglish({
    sample: "नमूना",
    output: "आउटपुट",
    codeCheck: "कोड जांच",
    foundNone: "अभी कोई जरूरी हिस्सा नहीं मिला",
    foundLabel: (items) => `मिला ${items}`,
    missingLabel: (items) => `कम है ${items}`,
    requiredFound: (found, total) => `${found}/${total} जरूरी हिस्से मिले`,
    title: (languageTitle, index) => `${languageTitle} प्रश्न ${index}`,
    choicePrompt: (languageTitle, index, concept) => `${languageTitle} प्रश्न ${index}. ${concept} से सबसे मिलती बात चुनें.`,
    fillPrompt: (languageTitle) => `${languageTitle} code के खाली स्थान को देखें और missing part लिखें.`,
    practicalPrompt: (languageTitle) => `पहले ${languageTitle} में छोटा solution लिखें. फिर hints खोलें.`,
    hints: (concept, activeRole, keywords) => [
      `${concept} के आसपास missing part खोजें`,
      `${activeRole} के लिए यह practice habit रखें`,
      `answer में आमतौर पर ${keywords} होना चाहिए`,
    ],
  }),
  id: questionUiFromEnglish({
    sample: "Contoh",
    output: "Output",
    codeCheck: "Cek kode",
    foundNone: "belum ada bagian penting yang ditemukan",
    foundLabel: (items) => `Ditemukan ${items}`,
    missingLabel: (items) => `Kurang ${items}`,
    requiredFound: (found, total) => `${found}/${total} bagian wajib ditemukan`,
    title: (languageTitle, index) => `${languageTitle} soal ${index}`,
    choicePrompt: (languageTitle, index, concept) => `${languageTitle} soal ${index}. Pilih pernyataan yang paling cocok dengan ${concept}.`,
    fillPrompt: (languageTitle) => `Lihat bagian kosong pada kode ${languageTitle} dan isi bagian yang hilang.`,
    practicalPrompt: (languageTitle) => `Tulis solusi kecil ${languageTitle} dulu. Buka petunjuk setelah mencoba.`,
    hints: (concept, activeRole, keywords) => [
      `cari bagian yang hilang di sekitar ${concept}`,
      `pertahankan kebiasaan latihan untuk ${activeRole}`,
      `jawaban biasanya perlu memuat ${keywords}`,
    ],
  }),
  vi: questionUiFromEnglish({
    sample: "Vi du",
    output: "Dau ra",
    codeCheck: "Kiem tra code",
    foundNone: "chua thay phan quan trong",
    foundLabel: (items) => `Da thay ${items}`,
    missingLabel: (items) => `Con thieu ${items}`,
    requiredFound: (found, total) => `${found}/${total} phan bat buoc da co`,
    title: (languageTitle, index) => `${languageTitle} cau ${index}`,
    choicePrompt: (languageTitle, index, concept) => `${languageTitle} cau ${index}. Chon mo ta phu hop nhat voi ${concept}.`,
    fillPrompt: (languageTitle) => `Nhin vao cho trong trong code ${languageTitle} va dien phan bi thieu.`,
    practicalPrompt: (languageTitle) => `Hay tu viet mot loi giai ${languageTitle} nho truoc, sau do mo goi y.`,
    hints: (concept, activeRole, keywords) => [
      `tim phan bi thieu quanh ${concept}`,
      `giu thoi quen luyen tap nay cho ${activeRole}`,
      `dap an thuong can co ${keywords}`,
    ],
  }),
  th: questionUiFromEnglish({
    sample: "ตัวอย่าง",
    output: "ผลลัพธ์",
    codeCheck: "ตรวจโค้ด",
    foundNone: "ยังไม่พบส่วนสำคัญ",
    foundLabel: (items) => `พบ ${items}`,
    missingLabel: (items) => `ยังขาด ${items}`,
    requiredFound: (found, total) => `พบส่วนที่ต้องมี ${found}/${total}`,
    title: (languageTitle, index) => `${languageTitle} ข้อ ${index}`,
    choicePrompt: (languageTitle, index, concept) => `${languageTitle} ข้อ ${index} เลือกคำอธิบายที่ตรงกับ ${concept} ที่สุด`,
    fillPrompt: (languageTitle) => `ดูช่องว่างในโค้ด ${languageTitle} แล้วเติมส่วนที่ขาด`,
    practicalPrompt: (languageTitle) => `เขียนคำตอบ ${languageTitle} สั้นๆ ก่อน แล้วค่อยเปิดคำใบ้`,
    hints: (concept, activeRole, keywords) => [
      `หาส่วนที่ขาดใกล้กับ ${concept}`,
      `รักษานิสัยฝึกสำหรับ ${activeRole}`,
      `คำตอบมักต้องมี ${keywords}`,
    ],
  }),
  tr: questionUiFromEnglish({
    sample: "Ornek",
    output: "Cikti",
    codeCheck: "Kod kontrolu",
    foundNone: "henuz ana parca bulunmadi",
    foundLabel: (items) => `Bulundu ${items}`,
    missingLabel: (items) => `Eksik ${items}`,
    requiredFound: (found, total) => `${found}/${total} gerekli parca bulundu`,
    title: (languageTitle, index) => `${languageTitle} soru ${index}`,
    choicePrompt: (languageTitle, index, concept) => `${languageTitle} soru ${index}. ${concept} icin en uygun ifadeyi sec.`,
    fillPrompt: (languageTitle) => `${languageTitle} kodundaki bosluga bak ve eksik parcayi yaz.`,
    practicalPrompt: (languageTitle) => `Once kucuk bir ${languageTitle} cozumu yaz. Sonra ipucu ac.`,
    hints: (concept, activeRole, keywords) => [
      `${concept} etrafinda eksik parcayi bul`,
      `${activeRole} icin bu pratik aliskanligini koru`,
      `cevap genelde ${keywords} icermeli`,
    ],
  }),
  it: questionUiFromEnglish({
    sample: "Esempio",
    output: "Output",
    codeCheck: "Controllo codice",
    foundNone: "nessuna parte chiave trovata",
    foundLabel: (items) => `Trovato ${items}`,
    missingLabel: (items) => `Manca ${items}`,
    requiredFound: (found, total) => `${found}/${total} parti richieste trovate`,
    title: (languageTitle, index) => `${languageTitle} domanda ${index}`,
    choicePrompt: (languageTitle, index, concept) => `${languageTitle} domanda ${index}. Scegli la frase che corrisponde meglio a ${concept}.`,
    fillPrompt: (languageTitle) => `Guarda il vuoto nel codice ${languageTitle} e scrivi la parte mancante.`,
    practicalPrompt: (languageTitle) => `Scrivi prima una piccola soluzione in ${languageTitle}. Poi apri gli indizi.`,
    hints: (concept, activeRole, keywords) => [
      `trova la parte mancante vicino a ${concept}`,
      `mantieni questa abitudine di pratica per ${activeRole}`,
      `la risposta di solito deve contenere ${keywords}`,
    ],
  }),
  nl: questionUiFromEnglish({
    sample: "Voorbeeld",
    output: "Output",
    codeCheck: "Codecontrole",
    foundNone: "nog geen belangrijk deel gevonden",
    foundLabel: (items) => `Gevonden ${items}`,
    missingLabel: (items) => `Mist ${items}`,
    requiredFound: (found, total) => `${found}/${total} vereiste delen gevonden`,
    title: (languageTitle, index) => `${languageTitle} vraag ${index}`,
    choicePrompt: (languageTitle, index, concept) => `${languageTitle} vraag ${index}. Kies de uitspraak die het best past bij ${concept}.`,
    fillPrompt: (languageTitle) => `Bekijk de lege plek in de ${languageTitle} code en typ het ontbrekende deel.`,
    practicalPrompt: (languageTitle) => `Schrijf eerst een kleine ${languageTitle} oplossing. Open daarna hints.`,
    hints: (concept, activeRole, keywords) => [
      `zoek het ontbrekende deel rond ${concept}`,
      `houd deze oefengewoonte voor ${activeRole}`,
      `het antwoord bevat meestal ${keywords}`,
    ],
  }),
  pl: questionUiFromEnglish({
    sample: "Przyklad",
    output: "Wyjscie",
    codeCheck: "Kontrola kodu",
    foundNone: "nie znaleziono jeszcze kluczowej czesci",
    foundLabel: (items) => `Znaleziono ${items}`,
    missingLabel: (items) => `Brakuje ${items}`,
    requiredFound: (found, total) => `${found}/${total} wymaganych czesci znaleziono`,
    title: (languageTitle, index) => `${languageTitle} pytanie ${index}`,
    choicePrompt: (languageTitle, index, concept) => `${languageTitle} pytanie ${index}. Wybierz zdanie najlepiej pasujace do ${concept}.`,
    fillPrompt: (languageTitle) => `Sprawdz luke w kodzie ${languageTitle} i wpisz brakujaca czesc.`,
    practicalPrompt: (languageTitle) => `Najpierw napisz male rozwiazanie w ${languageTitle}. Potem otworz podpowiedzi.`,
    hints: (concept, activeRole, keywords) => [
      `znajdz brakujaca czesc wokol ${concept}`,
      `utrzymaj ten nawyk cwiczen dla ${activeRole}`,
      `odpowiedz zwykle powinna zawierac ${keywords}`,
    ],
  }),
};

const compactMethodI18n: Partial<Record<InterfaceLanguage, {
  title: Record<string, string>;
  body: Record<string, string>;
}>> = {
  fr: {
    title: {
      "Recall from memory": "rappel de memoire",
      "Trace the code": "suivre le code",
      "Type it yourself": "taper soi meme",
      "Mix topics": "melanger les sujets",
      "Hints after trying": "indices apres essai",
      "Build small things": "construire petit",
    },
    body: {
      "Recall from memory": "lis un point puis recris le sans regarder",
      "Trace the code": "note les valeurs ligne par ligne avant d executer",
      "Type it yourself": "copie moins tape plus et corrige un petit bug",
      "Mix topics": "alterne syntaxe donnees debug et mini projets",
      "Hints after trying": "essaie seul puis ouvre un indice",
      "Build small things": "transforme chaque bloc en script page requete ou outil",
    },
  },
  de: {
    title: {
      "Recall from memory": "aus dem gedaechtnis",
      "Trace the code": "code verfolgen",
      "Type it yourself": "selbst tippen",
      "Mix topics": "themen mischen",
      "Hints after trying": "hinweise nach versuch",
      "Build small things": "klein bauen",
    },
    body: {
      "Recall from memory": "lies einen punkt und schreibe ihn ohne blick zurueck",
      "Trace the code": "notiere variablenwerte vor dem ausfuehren",
      "Type it yourself": "weniger kopieren mehr tippen und kleine fehler reparieren",
      "Mix topics": "wechsel zwischen syntax datenstrukturen debugging und mini projekten",
      "Hints after trying": "versuche allein und oeffne dann einen hinweis",
      "Build small things": "mache aus jedem block ein script eine seite eine abfrage oder ein tool",
    },
  },
  pt: {
    title: {
      "Recall from memory": "lembrar de memoria",
      "Trace the code": "rastrear o codigo",
      "Type it yourself": "digitar voce mesmo",
      "Mix topics": "misturar topicos",
      "Hints after trying": "dicas depois de tentar",
      "Build small things": "criar coisas pequenas",
    },
    body: {
      "Recall from memory": "leia um ponto pequeno e reescreva sem olhar",
      "Trace the code": "anote valores linha por linha antes de rodar",
      "Type it yourself": "copie menos digite mais e corrija um erro pequeno",
      "Mix topics": "alterne sintaxe dados debug e mini projetos",
      "Hints after trying": "tente sozinho e abra uma dica",
      "Build small things": "transforme cada bloco em script pagina consulta ou ferramenta",
    },
  },
  ru: {
    title: {
      "Recall from memory": "вспомнить по памяти",
      "Trace the code": "проследить код",
      "Type it yourself": "набрать самому",
      "Mix topics": "смешивать темы",
      "Hints after trying": "подсказки после попытки",
      "Build small things": "строить малое",
    },
    body: {
      "Recall from memory": "прочитай маленький пункт и воспроизведи без подсказки",
      "Trace the code": "запиши значения переменных перед запуском",
      "Type it yourself": "меньше копируй больше набирай и чини по одному багу",
      "Mix topics": "чередуй синтаксис данные отладку и мини проекты",
      "Hints after trying": "сначала попробуй сам потом открой одну подсказку",
      "Build small things": "превращай каждый блок в скрипт страницу запрос или инструмент",
    },
  },
  hi: {
    title: {
      "Recall from memory": "याद से दोहराएं",
      "Trace the code": "code trace करें",
      "Type it yourself": "खुद type करें",
      "Mix topics": "topics मिलाएं",
      "Hints after trying": "कोशिश के बाद hint",
      "Build small things": "छोटी चीजें बनाएं",
    },
    body: {
      "Recall from memory": "छोटा point पढ़कर बिना देखे फिर लिखें",
      "Trace the code": "run से पहले variable values line by line लिखें",
      "Type it yourself": "कम copy करें ज्यादा type करें और एक छोटा error ठीक करें",
      "Mix topics": "syntax data structure debugging और mini project बदलते रहें",
      "Hints after trying": "पहले खुद कोशिश करें फिर एक hint खोलें",
      "Build small things": "हर block को script page query या tool बनाएं",
    },
  },
  id: {
    title: {
      "Recall from memory": "ingat dari memori",
      "Trace the code": "telusuri kode",
      "Type it yourself": "ketik sendiri",
      "Mix topics": "campur topik",
      "Hints after trying": "petunjuk setelah mencoba",
      "Build small things": "buat hal kecil",
    },
    body: {
      "Recall from memory": "baca satu poin lalu tulis ulang tanpa melihat",
      "Trace the code": "catat nilai variabel sebelum menjalankan",
      "Type it yourself": "kurangi salin lebih banyak mengetik dan perbaiki satu error",
      "Mix topics": "ganti antara sintaks data debugging dan mini proyek",
      "Hints after trying": "coba sendiri dulu lalu buka satu petunjuk",
      "Build small things": "ubah tiap blok jadi script halaman query atau alat",
    },
  },
  vi: {
    title: {
      "Recall from memory": "nho lai",
      "Trace the code": "lan theo code",
      "Type it yourself": "tu go",
      "Mix topics": "tron chu de",
      "Hints after trying": "goi y sau khi thu",
      "Build small things": "lam thu nho",
    },
    body: {
      "Recall from memory": "doc mot y nho roi viet lai ma khong nhin",
      "Trace the code": "ghi gia tri bien tung dong truoc khi chay",
      "Type it yourself": "it copy hon go nhieu hon va sua mot loi nho",
      "Mix topics": "doi qua lai giua cu phap du lieu debug va du an nho",
      "Hints after trying": "tu thu truoc roi mo mot goi y",
      "Build small things": "bien moi khoi thanh script trang truy van hoac cong cu",
    },
  },
  th: {
    title: {
      "Recall from memory": "ทวนจากความจำ",
      "Trace the code": "ไล่โค้ด",
      "Type it yourself": "พิมพ์เอง",
      "Mix topics": "สลับหัวข้อ",
      "Hints after trying": "ลองก่อนค่อยใบ้",
      "Build small things": "สร้างชิ้นเล็ก",
    },
    body: {
      "Recall from memory": "อ่านจุดเล็กแล้วเขียนใหม่โดยไม่ดู",
      "Trace the code": "เขียนค่าตัวแปรทีละบรรทัดก่อนรัน",
      "Type it yourself": "คัดลอกให้น้อย พิมพ์ให้มาก แล้วแก้ error ทีละจุด",
      "Mix topics": "สลับ syntax data debug และโปรเจกต์เล็ก",
      "Hints after trying": "ลองเองก่อนแล้วค่อยเปิดคำใบ้หนึ่งข้อ",
      "Build small things": "เปลี่ยนแต่ละบทเป็น script page query หรือ tool",
    },
  },
  tr: {
    title: {
      "Recall from memory": "hafizadan cagir",
      "Trace the code": "kodu izle",
      "Type it yourself": "kendin yaz",
      "Mix topics": "konulari karistir",
      "Hints after trying": "denemeden sonra ipucu",
      "Build small things": "kucuk seyler yap",
    },
    body: {
      "Recall from memory": "kucuk bir noktayi oku sonra bakmadan yaz",
      "Trace the code": "calistirmadan once degiskenleri satir satir izle",
      "Type it yourself": "daha az kopyala daha cok yaz ve bir hatayi duzelt",
      "Mix topics": "syntax veri debug ve mini projeler arasinda gec",
      "Hints after trying": "once kendin dene sonra bir ipucu ac",
      "Build small things": "her bloku script sayfa sorgu veya araca cevir",
    },
  },
  it: {
    title: {
      "Recall from memory": "ricorda a memoria",
      "Trace the code": "traccia il codice",
      "Type it yourself": "scrivi tu",
      "Mix topics": "mescola temi",
      "Hints after trying": "indizi dopo il tentativo",
      "Build small things": "costruisci piccolo",
    },
    body: {
      "Recall from memory": "leggi un punto piccolo e riscrivilo senza guardare",
      "Trace the code": "segui i valori riga per riga prima di eseguire",
      "Type it yourself": "copia meno scrivi di piu e correggi un errore",
      "Mix topics": "alterna sintassi dati debug e mini progetti",
      "Hints after trying": "prova da solo poi apri un indizio",
      "Build small things": "trasforma ogni blocco in script pagina query o tool",
    },
  },
  nl: {
    title: {
      "Recall from memory": "uit geheugen",
      "Trace the code": "code volgen",
      "Type it yourself": "zelf typen",
      "Mix topics": "onderwerpen mengen",
      "Hints after trying": "hints na poging",
      "Build small things": "klein bouwen",
    },
    body: {
      "Recall from memory": "lees een klein punt en schrijf het terug zonder te kijken",
      "Trace the code": "noteer waarden regel voor regel voor je runt",
      "Type it yourself": "kopieer minder typ meer en repareer een kleine fout",
      "Mix topics": "wissel syntax data debug en mini projecten af",
      "Hints after trying": "probeer eerst zelf en open dan een hint",
      "Build small things": "maak van elk blok een script pagina query of tool",
    },
  },
  pl: {
    title: {
      "Recall from memory": "przywolaj z pamieci",
      "Trace the code": "sledz kod",
      "Type it yourself": "wpisz sam",
      "Mix topics": "mieszaj tematy",
      "Hints after trying": "podpowiedz po probie",
      "Build small things": "buduj male rzeczy",
    },
    body: {
      "Recall from memory": "przeczytaj maly punkt i odtworz bez patrzenia",
      "Trace the code": "zapisz wartosci zmiennych przed uruchomieniem",
      "Type it yourself": "mniej kopiuj wiecej pisz i popraw jeden maly blad",
      "Mix topics": "zmieniaj skladnie dane debug i mini projekty",
      "Hints after trying": "najpierw sprobuj sam potem otworz jedna podpowiedz",
      "Build small things": "zamien kazdy blok w skrypt strone zapytanie lub narzedzie",
    },
  },
};

function methodTitle(methodTitleValue: string, language: InterfaceLanguage) {
  return methodI18n[language]?.title[methodTitleValue] ?? compactMethodI18n[language]?.title[methodTitleValue] ?? methodTitleValue;
}

function methodBody(methodTitleValue: string, methodBodyValue: string, language: InterfaceLanguage) {
  return methodI18n[language]?.body[methodTitleValue] ?? compactMethodI18n[language]?.body[methodTitleValue] ?? methodBodyValue;
}

const optionI18n: Partial<Record<InterfaceLanguage, Record<string, string>>> = {
  zh: {
    "memorize random syntax without running anything": "死记随机语法 不运行不验证",
    "skip error messages and guess": "跳过报错直接猜",
    "rewrite the whole file before isolating the issue": "没定位问题就重写整个文件",
    "depend on hints before the first attempt": "第一次尝试前就依赖提示",
    "Use const for a value that should not be reassigned": "不会重新赋值的数据优先用 const",
    "A function should return the computed value when other code needs it": "其他代码要使用结果时 函数应该 return 计算值",
    "map creates a new array by transforming each item": "map 会把每一项转换成一个新数组",
    "await pauses inside an async function until a promise resolves": "await 会在 async 函数中等待 Promise 完成",
    "Use the language's standard print statement to inspect a value": "用这门语言的标准输出语句检查一个值",
    "Store a value in a readable name before passing it around": "先把值存进可读的名字 再传给其他代码",
    "A function should take input and return or produce a focused result": "函数应该接收输入 并返回或产生一个明确结果",
  },
  ja: {
    "memorize random syntax without running anything": "実行せずにランダムな構文を暗記する",
    "skip error messages and guess": "エラーを読まずに推測する",
    "rewrite the whole file before isolating the issue": "原因を切り分ける前に全体を書き直す",
    "depend on hints before the first attempt": "最初の試行前からヒントに頼る",
    "Use const for a value that should not be reassigned": "再代入しない値には const を使う",
    "A function should return the computed value when other code needs it": "他のコードが結果を使うなら関数は値を return する",
    "map creates a new array by transforming each item": "map は各要素を変換して新しい配列を作る",
    "await pauses inside an async function until a promise resolves": "await は async 関数内で Promise の完了を待つ",
    "Use the language's standard print statement to inspect a value": "標準の出力文で値を確認する",
    "Store a value in a readable name before passing it around": "値を読みやすい名前に保存してから渡す",
    "A function should take input and return or produce a focused result": "関数は入力を受け取り明確な結果を返す",
  },
  ko: {
    "memorize random syntax without running anything": "실행하지 않고 무작위 문법을 외운다",
    "skip error messages and guess": "오류 메시지를 건너뛰고 추측한다",
    "rewrite the whole file before isolating the issue": "문제를 분리하기 전에 파일 전체를 다시 쓴다",
    "depend on hints before the first attempt": "첫 시도 전에 힌트에 의존한다",
    "Use const for a value that should not be reassigned": "다시 할당하지 않을 값은 const 를 사용한다",
    "A function should return the computed value when other code needs it": "다른 코드가 결과를 써야 하면 함수는 값을 return 해야 한다",
    "map creates a new array by transforming each item": "map 은 각 항목을 변환해 새 배열을 만든다",
    "await pauses inside an async function until a promise resolves": "await 는 async 함수 안에서 Promise 완료를 기다린다",
    "Use the language's standard print statement to inspect a value": "표준 출력문으로 값을 확인한다",
    "Store a value in a readable name before passing it around": "값을 읽기 쉬운 이름에 저장한 뒤 전달한다",
    "A function should take input and return or produce a focused result": "함수는 입력을 받고 명확한 결과를 반환하거나 만들어야 한다",
  },
  es: {
    "memorize random syntax without running anything": "memorizar sintaxis al azar sin ejecutar nada",
    "skip error messages and guess": "saltar errores y adivinar",
    "rewrite the whole file before isolating the issue": "reescribir todo antes de aislar el problema",
    "depend on hints before the first attempt": "depender de pistas antes del primer intento",
    "Use const for a value that should not be reassigned": "usa const para un valor que no debe reasignarse",
    "A function should return the computed value when other code needs it": "si otro codigo necesita el resultado la funcion debe retornarlo",
    "map creates a new array by transforming each item": "map crea un arreglo nuevo transformando cada elemento",
    "await pauses inside an async function until a promise resolves": "await espera una promesa dentro de una funcion async",
    "Use the language's standard print statement to inspect a value": "usa la salida estandar del lenguaje para inspeccionar un valor",
    "Store a value in a readable name before passing it around": "guarda el valor en un nombre legible antes de pasarlo",
    "A function should take input and return or produce a focused result": "una funcion toma entrada y devuelve o produce un resultado claro",
  },
  ar: {
    "memorize random syntax without running anything": "حفظ صياغة عشوائية من غير تشغيل",
    "skip error messages and guess": "تجاهل رسائل الخطأ والتخمين",
    "rewrite the whole file before isolating the issue": "إعادة كتابة الملف كله قبل عزل المشكلة",
    "depend on hints before the first attempt": "الاعتماد على التلميحات قبل أول محاولة",
    "Use const for a value that should not be reassigned": "استخدم const للقيمة التي لن يعاد تعيينها",
    "A function should return the computed value when other code needs it": "إذا احتاج كود آخر للنتيجة فيجب أن ترجع الدالة القيمة",
    "map creates a new array by transforming each item": "map تنشئ مصفوفة جديدة بتحويل كل عنصر",
    "await pauses inside an async function until a promise resolves": "await ينتظر اكتمال Promise داخل دالة async",
    "Use the language's standard print statement to inspect a value": "استخدم أمر الطباعة القياسي في اللغة لفحص القيمة",
    "Store a value in a readable name before passing it around": "احفظ القيمة باسم واضح قبل تمريرها",
    "A function should take input and return or produce a focused result": "الدالة تستقبل مدخلات وترجع أو تنتج نتيجة واضحة",
  },
};

type OptionUiCopy = {
  memorize: string;
  skipErrors: string;
  rewriteWholeFile: string;
  hintsFirst: string;
  constValue: string;
  functionReturn: string;
  arrayMap: string;
  asyncAwait: string;
  printValue: string;
  nameValue: string;
  focusedFunction: string;
  collection: (collection: string) => string;
};

const optionUiCopy: Partial<Record<InterfaceLanguage, OptionUiCopy>> = {
  fr: {
    memorize: "memoriser une syntaxe au hasard sans rien executer",
    skipErrors: "ignorer les erreurs et deviner",
    rewriteWholeFile: "reecrire tout le fichier avant d isoler le probleme",
    hintsFirst: "dependre des indices avant le premier essai",
    constValue: "utilise const pour une valeur qui ne doit pas etre reassignee",
    functionReturn: "une fonction doit retourner la valeur calculee si un autre code en a besoin",
    arrayMap: "map cree un nouveau tableau en transformant chaque element",
    asyncAwait: "await attend une promesse dans une fonction async",
    printValue: "utilise l instruction d affichage standard du langage pour inspecter une valeur",
    nameValue: "range une valeur dans un nom lisible avant de la passer ailleurs",
    focusedFunction: "une fonction doit prendre une entree et produire un resultat precis",
    collection: (collection) => `utilise ${collection} pour garder des valeurs liees ensemble`,
  },
  de: {
    memorize: "zufaellige Syntax auswendig lernen ohne etwas auszufuehren",
    skipErrors: "fehlermeldungen ueberspringen und raten",
    rewriteWholeFile: "die ganze datei neu schreiben bevor das problem isoliert ist",
    hintsFirst: "vor dem ersten versuch von hinweisen abhaengen",
    constValue: "nutze const fuer einen wert der nicht neu zugewiesen werden soll",
    functionReturn: "eine funktion sollte den berechneten wert zurueckgeben wenn anderer code ihn braucht",
    arrayMap: "map erstellt ein neues array indem jedes element transformiert wird",
    asyncAwait: "await wartet in einer async funktion bis ein promise fertig ist",
    printValue: "nutze die standardausgabe der sprache um einen wert zu pruefen",
    nameValue: "speichere einen wert in einem lesbaren namen bevor du ihn weitergibst",
    focusedFunction: "eine funktion sollte eingabe nehmen und ein klares ergebnis liefern",
    collection: (collection) => `nutze ${collection} um zusammengehoerige werte zu halten`,
  },
  pt: {
    memorize: "memorizar sintaxe aleatoria sem executar nada",
    skipErrors: "ignorar mensagens de erro e chutar",
    rewriteWholeFile: "reescrever o arquivo inteiro antes de isolar o problema",
    hintsFirst: "depender de dicas antes da primeira tentativa",
    constValue: "use const para um valor que nao deve ser reatribuido",
    functionReturn: "uma funcao deve retornar o valor calculado quando outro codigo precisa dele",
    arrayMap: "map cria um novo array transformando cada item",
    asyncAwait: "await pausa dentro de uma funcao async ate a promise resolver",
    printValue: "use a instrucao padrao de saida da linguagem para inspecionar um valor",
    nameValue: "guarde um valor em um nome legivel antes de passa-lo adiante",
    focusedFunction: "uma funcao deve receber entrada e produzir um resultado focado",
    collection: (collection) => `use ${collection} para manter valores relacionados juntos`,
  },
  ru: {
    memorize: "заучивать случайный синтаксис без запуска",
    skipErrors: "пропускать ошибки и угадывать",
    rewriteWholeFile: "переписывать весь файл до изоляции проблемы",
    hintsFirst: "зависеть от подсказок до первой попытки",
    constValue: "используй const для значения которое не должно переназначаться",
    functionReturn: "функция должна возвращать вычисленное значение если оно нужно другому коду",
    arrayMap: "map создает новый массив преобразуя каждый элемент",
    asyncAwait: "await ждет promise внутри async функции",
    printValue: "используй стандартный вывод языка чтобы проверить значение",
    nameValue: "сохрани значение в понятном имени перед передачей дальше",
    focusedFunction: "функция должна принимать вход и давать сфокусированный результат",
    collection: (collection) => `используй ${collection} чтобы держать связанные значения вместе`,
  },
  hi: {
    memorize: "बिना चलाए random syntax याद करना",
    skipErrors: "error message छोड़कर guess करना",
    rewriteWholeFile: "problem अलग करने से पहले पूरी file फिर लिखना",
    hintsFirst: "पहली कोशिश से पहले hints पर निर्भर होना",
    constValue: "जिस value को दोबारा assign नहीं करना है उसके लिए const इस्तेमाल करें",
    functionReturn: "जब दूसरे code को result चाहिए तो function को value return करनी चाहिए",
    arrayMap: "map हर item को बदलकर नया array बनाता है",
    asyncAwait: "await async function में promise resolve होने तक रुकता है",
    printValue: "value देखने के लिए भाषा का standard print statement इस्तेमाल करें",
    nameValue: "value आगे भेजने से पहले readable name में रखें",
    focusedFunction: "function input लेकर focused result देना चाहिए",
    collection: (collection) => `related values साथ रखने के लिए ${collection} इस्तेमाल करें`,
  },
  id: {
    memorize: "menghafal sintaks acak tanpa menjalankan apa pun",
    skipErrors: "melewati pesan error lalu menebak",
    rewriteWholeFile: "menulis ulang seluruh file sebelum mengisolasi masalah",
    hintsFirst: "bergantung pada petunjuk sebelum mencoba pertama kali",
    constValue: "gunakan const untuk nilai yang tidak boleh diubah ulang",
    functionReturn: "fungsi harus mengembalikan nilai hasil hitung saat kode lain membutuhkannya",
    arrayMap: "map membuat array baru dengan mengubah setiap item",
    asyncAwait: "await menunggu promise selesai di dalam fungsi async",
    printValue: "gunakan perintah cetak standar bahasa untuk memeriksa nilai",
    nameValue: "simpan nilai dalam nama yang mudah dibaca sebelum diteruskan",
    focusedFunction: "fungsi menerima input dan menghasilkan hasil yang fokus",
    collection: (collection) => `gunakan ${collection} untuk menyimpan nilai yang berhubungan`,
  },
  vi: {
    memorize: "hoc thuoc cu phap ngau nhien ma khong chay",
    skipErrors: "bo qua thong bao loi va doan",
    rewriteWholeFile: "viet lai ca file truoc khi tach van de",
    hintsFirst: "phu thuoc goi y truoc lan thu dau",
    constValue: "dung const cho gia tri khong nen gan lai",
    functionReturn: "ham nen tra ve gia tri tinh duoc khi code khac can",
    arrayMap: "map tao mang moi bang cach bien doi tung phan tu",
    asyncAwait: "await dung trong ham async de cho promise hoan tat",
    printValue: "dung lenh in chuan cua ngon ngu de xem gia tri",
    nameValue: "luu gia tri vao ten de doc truoc khi truyen di",
    focusedFunction: "ham nen nhan dau vao va tao ket qua ro rang",
    collection: (collection) => `dung ${collection} de giu cac gia tri lien quan`,
  },
  th: {
    memorize: "จำ syntax แบบสุ่มโดยไม่รันอะไรเลย",
    skipErrors: "ข้ามข้อความ error แล้วเดา",
    rewriteWholeFile: "เขียนทั้งไฟล์ใหม่ก่อนแยกปัญหา",
    hintsFirst: "พึ่งคำใบ้ก่อนลองครั้งแรก",
    constValue: "ใช้ const กับค่าที่ไม่ควรถูกกำหนดใหม่",
    functionReturn: "function ควร return ค่าที่คำนวณเมื่อ code อื่นต้องใช้",
    arrayMap: "map สร้าง array ใหม่โดยแปลงแต่ละ item",
    asyncAwait: "await รอ promise ใน async function",
    printValue: "ใช้คำสั่ง print มาตรฐานของภาษาเพื่อตรวจค่า",
    nameValue: "เก็บค่าในชื่อที่อ่านง่ายก่อนส่งต่อ",
    focusedFunction: "function ควรรับ input และสร้างผลลัพธ์ที่ชัดเจน",
    collection: (collection) => `ใช้ ${collection} เพื่อเก็บค่าที่เกี่ยวข้องกัน`,
  },
  tr: {
    memorize: "hic calistirmadan rastgele syntax ezberlemek",
    skipErrors: "hata mesajlarini atlayip tahmin etmek",
    rewriteWholeFile: "sorunu izole etmeden tum dosyayi yeniden yazmak",
    hintsFirst: "ilk denemeden once ipuclarina baglanmak",
    constValue: "yeniden atanmayacak deger icin const kullan",
    functionReturn: "baska kod ihtiyac duyuyorsa fonksiyon hesaplanan degeri return etmeli",
    arrayMap: "map her elemani donusturerek yeni bir array olusturur",
    asyncAwait: "await async fonksiyon icinde promise cozulene kadar bekler",
    printValue: "bir degeri incelemek icin dilin standart yazdirma komutunu kullan",
    nameValue: "degeri aktarmadan once okunur bir isimde sakla",
    focusedFunction: "fonksiyon girdi alip odakli bir sonuc uretmeli",
    collection: (collection) => `ilgili degerleri birlikte tutmak icin ${collection} kullan`,
  },
  it: {
    memorize: "memorizzare sintassi casuale senza eseguire nulla",
    skipErrors: "saltare i messaggi di errore e tirare a indovinare",
    rewriteWholeFile: "riscrivere tutto il file prima di isolare il problema",
    hintsFirst: "dipendere dagli indizi prima del primo tentativo",
    constValue: "usa const per un valore che non deve essere riassegnato",
    functionReturn: "una funzione deve restituire il valore calcolato se altro codice ne ha bisogno",
    arrayMap: "map crea un nuovo array trasformando ogni elemento",
    asyncAwait: "await attende una promise dentro una funzione async",
    printValue: "usa l istruzione di stampa standard del linguaggio per controllare un valore",
    nameValue: "salva un valore in un nome leggibile prima di passarlo",
    focusedFunction: "una funzione deve prendere input e produrre un risultato mirato",
    collection: (collection) => `usa ${collection} per tenere insieme valori collegati`,
  },
  nl: {
    memorize: "willekeurige syntax onthouden zonder iets uit te voeren",
    skipErrors: "foutmeldingen overslaan en gokken",
    rewriteWholeFile: "het hele bestand herschrijven voordat het probleem is geisoleerd",
    hintsFirst: "op hints leunen voor de eerste poging",
    constValue: "gebruik const voor een waarde die niet opnieuw toegewezen moet worden",
    functionReturn: "een functie moet de berekende waarde teruggeven als andere code die nodig heeft",
    arrayMap: "map maakt een nieuwe array door elk item te transformeren",
    asyncAwait: "await wacht binnen een async functie tot een promise klaar is",
    printValue: "gebruik de standaard print opdracht van de taal om een waarde te bekijken",
    nameValue: "sla een waarde op in een leesbare naam voordat je hem doorgeeft",
    focusedFunction: "een functie moet input nemen en een gericht resultaat maken",
    collection: (collection) => `gebruik ${collection} om verwante waarden samen te houden`,
  },
  pl: {
    memorize: "zapamietywac losowa skladnie bez uruchamiania",
    skipErrors: "pomijac komunikaty bledow i zgadywac",
    rewriteWholeFile: "przepisywac caly plik przed odizolowaniem problemu",
    hintsFirst: "polegac na podpowiedziach przed pierwsza proba",
    constValue: "uzyj const dla wartosci ktora nie powinna byc przypisana ponownie",
    functionReturn: "funkcja powinna zwrocic obliczona wartosc gdy inny kod jej potrzebuje",
    arrayMap: "map tworzy nowa tablice przeksztalcajac kazdy element",
    asyncAwait: "await czeka w funkcji async az promise sie zakonczy",
    printValue: "uzyj standardowego wypisywania jezyka aby sprawdzic wartosc",
    nameValue: "zapisz wartosc pod czytelna nazwa zanim ja przekazesz",
    focusedFunction: "funkcja powinna przyjac wejscie i dac skupiony wynik",
    collection: (collection) => `uzyj ${collection} aby trzymac powiazane wartosci razem`,
  },
};

function optionLabel(option: string, language: InterfaceLanguage) {
  const direct = optionI18n[language]?.[option];
  if (direct) return direct;

  const copy = optionUiCopy[language];
  if (copy) {
    if (option === "memorize random syntax without running anything") return copy.memorize;
    if (option === "skip error messages and guess") return copy.skipErrors;
    if (option === "rewrite the whole file before isolating the issue") return copy.rewriteWholeFile;
    if (option === "depend on hints before the first attempt") return copy.hintsFirst;
    if (option === "Use const for a value that should not be reassigned") return copy.constValue;
    if (option === "A function should return the computed value when other code needs it") return copy.functionReturn;
    if (option === "map creates a new array by transforming each item") return copy.arrayMap;
    if (option === "await pauses inside an async function until a promise resolves") return copy.asyncAwait;
    if (option === "Use the language's standard print statement to inspect a value") return copy.printValue;
    if (option === "Store a value in a readable name before passing it around") return copy.nameValue;
    if (option === "A function should take input and return or produce a focused result") return copy.focusedFunction;
  }

  const collectionMatch = option.match(/^Use (.+) to keep related values together$/);
  if (collectionMatch) {
    const collection = collectionMatch[1];
    if (language === "zh") return `使用 ${collection} 保存相关的值`;
    if (language === "ja") return `${collection} で関連する値をまとめる`;
    if (language === "ko") return `${collection} 로 관련 값을 묶는다`;
    if (language === "es") return `usa ${collection} para mantener valores relacionados`;
    if (language === "ar") return `استخدم ${collection} لحفظ القيم المرتبطة معا`;
    if (copy) return copy.collection(collection);
  }

  return option;
}

const tutorialI18n: Partial<Record<InterfaceLanguage, Record<string, string>>> = {
  zh: {
    "Values and variables": "值和变量",
    "Functions": "函数",
    "Async APIs": "异步接口",
    "Program output": "程序输出",
    "Values and names": "值和命名",
    "Functions and collections": "函数和集合",
    "Prefer const first": "优先用 const",
    "Use let only when the value changes": "只有值会变化时才用 let",
    "Inspect values with console.log": "用 console.log 检查值",
    "Name functions with verbs": "函数名用动词",
    "Return values instead of printing inside every function": "优先 return 结果 不要每个函数都打印",
    "Keep one function focused": "一个函数只做一件事",
    "Check network errors": "检查网络错误",
    "Await the promise before reading data": "读取数据前先 await Promise",
    "Keep API parsing separate": "把接口解析单独放清楚",
    "Run the smallest file first": "先跑最小文件",
    "Print one known value": "先打印一个确定值",
    "Check the output before adding more code": "加代码前先看输出",
    "Give values readable names": "给值起可读名字",
    "Keep one idea per line while learning": "学习时一行只放一个想法",
    "Trace the value before changing it": "改值前先追踪它",
    "Keep functions small": "函数保持小",
    "Return useful values": "返回有用的值",
    "Use the common collection before reaching for frameworks": "先用常见集合 不急着上框架",
  },
  ja: {
    "Values and variables": "値と変数",
    "Functions": "関数",
    "Async APIs": "非同期 API",
    "Program output": "プログラム出力",
    "Values and names": "値と名前",
    "Functions and collections": "関数とコレクション",
    "Prefer const first": "まず const を使う",
    "Use let only when the value changes": "値が変わる時だけ let を使う",
    "Inspect values with console.log": "console.log で値を確認する",
    "Name functions with verbs": "関数名は動詞で始める",
    "Return values instead of printing inside every function": "各関数で出力せず値を返す",
    "Keep one function focused": "一つの関数は一つの役割にする",
    "Check network errors": "ネットワークエラーを確認する",
    "Await the promise before reading data": "データを読む前に Promise を待つ",
    "Keep API parsing separate": "API 解析を分ける",
  },
  ko: {
    "Values and variables": "값과 변수",
    "Functions": "함수",
    "Async APIs": "비동기 API",
    "Program output": "프로그램 출력",
    "Values and names": "값과 이름",
    "Functions and collections": "함수와 컬렉션",
    "Prefer const first": "먼저 const 를 사용",
    "Use let only when the value changes": "값이 바뀔 때만 let 사용",
    "Inspect values with console.log": "console.log 로 값 확인",
    "Name functions with verbs": "함수 이름은 동사로",
    "Return values instead of printing inside every function": "모든 함수에서 출력하지 말고 값을 반환",
    "Keep one function focused": "함수 하나는 한 가지 일만",
  },
  es: {
    "Values and variables": "valores y variables",
    "Functions": "funciones",
    "Async APIs": "API asincronas",
    "Program output": "salida del programa",
    "Values and names": "valores y nombres",
    "Functions and collections": "funciones y colecciones",
    "Prefer const first": "prefiere const primero",
    "Use let only when the value changes": "usa let solo si el valor cambia",
    "Inspect values with console.log": "inspecciona valores con console.log",
    "Name functions with verbs": "nombra funciones con verbos",
    "Return values instead of printing inside every function": "devuelve valores en vez de imprimir dentro de cada funcion",
    "Keep one function focused": "mantén cada funcion enfocada",
  },
  ar: {
    "Values and variables": "القيم والمتغيرات",
    "Functions": "الدوال",
    "Async APIs": "واجهات غير متزامنة",
    "Program output": "ناتج البرنامج",
    "Values and names": "القيم والأسماء",
    "Functions and collections": "الدوال والمجموعات",
    "Prefer const first": "ابدأ ب const",
    "Use let only when the value changes": "استخدم let فقط عندما تتغير القيمة",
    "Inspect values with console.log": "افحص القيم باستخدام console.log",
    "Name functions with verbs": "سم الدوال بأفعال واضحة",
    "Return values instead of printing inside every function": "ارجع القيم بدل الطباعة داخل كل دالة",
    "Keep one function focused": "اجعل كل دالة مركزة على مهمة واحدة",
    "Check network errors": "افحص أخطاء الشبكة",
    "Await the promise before reading data": "انتظر Promise قبل قراءة البيانات",
    "Keep API parsing separate": "افصل تحليل API عن باقي الكود",
    "Run the smallest file first": "شغل أصغر ملف أولا",
    "Print one known value": "اطبع قيمة معروفة واحدة",
    "Check the output before adding more code": "افحص الناتج قبل إضافة كود أكثر",
    "Give values readable names": "أعط القيم أسماء واضحة",
    "Keep one idea per line while learning": "اجعل كل سطر يحمل فكرة واحدة أثناء التعلم",
    "Trace the value before changing it": "تتبع القيمة قبل تغييرها",
    "Keep functions small": "اجعل الدوال صغيرة",
    "Return useful values": "ارجع قيما مفيدة",
    "Use the common collection before reaching for frameworks": "استخدم المجموعة الشائعة قبل اللجوء إلى الأطر",
  },
};

const compactTutorialI18n: Partial<Record<InterfaceLanguage, Record<string, string>>> = {
  fr: {
    "Values and variables": "valeurs et variables",
    "Functions": "fonctions",
    "Async APIs": "API asynchrones",
    "Program output": "sortie du programme",
    "Values and names": "valeurs et noms",
    "Functions and collections": "fonctions et collections",
    "Prefer const first": "prefere const d abord",
    "Use let only when the value changes": "utilise let seulement quand la valeur change",
    "Inspect values with console.log": "inspecte les valeurs avec console.log",
    "Name functions with verbs": "nomme les fonctions avec des verbes",
    "Return values instead of printing inside every function": "retourne les valeurs au lieu de tout afficher",
    "Keep one function focused": "garde chaque fonction concentree",
  },
  de: {
    "Values and variables": "werte und variablen",
    "Functions": "funktionen",
    "Async APIs": "asynchrone APIs",
    "Program output": "programmausgabe",
    "Values and names": "werte und namen",
    "Functions and collections": "funktionen und sammlungen",
    "Prefer const first": "bevorzuge zuerst const",
    "Use let only when the value changes": "nutze let nur wenn sich der wert aendert",
    "Inspect values with console.log": "pruefe werte mit console.log",
    "Name functions with verbs": "benenne funktionen mit verben",
    "Return values instead of printing inside every function": "gib werte zurueck statt in jeder funktion zu drucken",
    "Keep one function focused": "halte jede funktion fokussiert",
  },
  pt: {
    "Values and variables": "valores e variaveis",
    "Functions": "funcoes",
    "Async APIs": "APIs assincronas",
    "Program output": "saida do programa",
    "Values and names": "valores e nomes",
    "Functions and collections": "funcoes e colecoes",
    "Prefer const first": "prefira const primeiro",
    "Use let only when the value changes": "use let apenas quando o valor muda",
    "Inspect values with console.log": "inspecione valores com console.log",
    "Name functions with verbs": "nomeie funcoes com verbos",
    "Return values instead of printing inside every function": "retorne valores em vez de imprimir em toda funcao",
    "Keep one function focused": "mantenha cada funcao focada",
  },
  ru: {
    "Values and variables": "значения и переменные",
    "Functions": "функции",
    "Async APIs": "асинхронные API",
    "Program output": "вывод программы",
    "Values and names": "значения и имена",
    "Functions and collections": "функции и коллекции",
    "Prefer const first": "сначала предпочитай const",
    "Use let only when the value changes": "используй let только когда значение меняется",
    "Inspect values with console.log": "проверяй значения через console.log",
    "Name functions with verbs": "называй функции глаголами",
    "Return values instead of printing inside every function": "возвращай значения вместо печати внутри каждой функции",
    "Keep one function focused": "держи одну функцию сфокусированной",
  },
  hi: {
    "Values and variables": "values और variables",
    "Functions": "functions",
    "Async APIs": "async APIs",
    "Program output": "program output",
    "Values and names": "values और names",
    "Functions and collections": "functions और collections",
    "Prefer const first": "पहले const चुनें",
    "Use let only when the value changes": "let तभी इस्तेमाल करें जब value बदले",
    "Inspect values with console.log": "console.log से value देखें",
    "Name functions with verbs": "function names में verbs रखें",
    "Return values instead of printing inside every function": "हर function में print करने के बजाय value return करें",
    "Keep one function focused": "एक function को एक काम पर रखें",
  },
  id: {
    "Values and variables": "nilai dan variabel",
    "Functions": "fungsi",
    "Async APIs": "API async",
    "Program output": "output program",
    "Values and names": "nilai dan nama",
    "Functions and collections": "fungsi dan koleksi",
    "Prefer const first": "utamakan const",
    "Use let only when the value changes": "pakai let hanya saat nilai berubah",
    "Inspect values with console.log": "periksa nilai dengan console.log",
    "Name functions with verbs": "beri nama fungsi dengan kata kerja",
    "Return values instead of printing inside every function": "kembalikan nilai daripada selalu mencetak",
    "Keep one function focused": "jaga fungsi tetap fokus",
  },
  vi: {
    "Values and variables": "gia tri va bien",
    "Functions": "ham",
    "Async APIs": "API bat dong bo",
    "Program output": "dau ra chuong trinh",
    "Values and names": "gia tri va ten",
    "Functions and collections": "ham va tap hop",
    "Prefer const first": "uu tien const truoc",
    "Use let only when the value changes": "chi dung let khi gia tri thay doi",
    "Inspect values with console.log": "kiem tra gia tri bang console.log",
    "Name functions with verbs": "dat ten ham bang dong tu",
    "Return values instead of printing inside every function": "tra ve gia tri thay vi in trong moi ham",
    "Keep one function focused": "giu moi ham tap trung mot viec",
  },
  th: {
    "Values and variables": "ค่าและตัวแปร",
    "Functions": "ฟังก์ชัน",
    "Async APIs": "API แบบ async",
    "Program output": "ผลลัพธ์ของโปรแกรม",
    "Values and names": "ค่าและชื่อ",
    "Functions and collections": "ฟังก์ชันและ collection",
    "Prefer const first": "เริ่มด้วย const ก่อน",
    "Use let only when the value changes": "ใช้ let เมื่อค่าต้องเปลี่ยนเท่านั้น",
    "Inspect values with console.log": "ตรวจค่าด้วย console.log",
    "Name functions with verbs": "ตั้งชื่อ function ด้วยคำกริยา",
    "Return values instead of printing inside every function": "return ค่าแทนการ print ในทุก function",
    "Keep one function focused": "ให้ function หนึ่งทำงานเดียว",
  },
  tr: {
    "Values and variables": "degerler ve degiskenler",
    "Functions": "fonksiyonlar",
    "Async APIs": "async APIler",
    "Program output": "program ciktisi",
    "Values and names": "degerler ve isimler",
    "Functions and collections": "fonksiyonlar ve koleksiyonlar",
    "Prefer const first": "once const tercih et",
    "Use let only when the value changes": "let sadece deger degisince kullan",
    "Inspect values with console.log": "degerleri console.log ile incele",
    "Name functions with verbs": "fonksiyonlari fiillerle adlandir",
    "Return values instead of printing inside every function": "her fonksiyonda yazdirmak yerine deger return et",
    "Keep one function focused": "bir fonksiyonu tek ise odakla",
  },
  it: {
    "Values and variables": "valori e variabili",
    "Functions": "funzioni",
    "Async APIs": "API asincrone",
    "Program output": "output del programma",
    "Values and names": "valori e nomi",
    "Functions and collections": "funzioni e collezioni",
    "Prefer const first": "preferisci const prima",
    "Use let only when the value changes": "usa let solo quando il valore cambia",
    "Inspect values with console.log": "controlla i valori con console.log",
    "Name functions with verbs": "nomina le funzioni con verbi",
    "Return values instead of printing inside every function": "restituisci valori invece di stampare in ogni funzione",
    "Keep one function focused": "mantieni ogni funzione focalizzata",
  },
  nl: {
    "Values and variables": "waarden en variabelen",
    "Functions": "functies",
    "Async APIs": "async APIs",
    "Program output": "programma output",
    "Values and names": "waarden en namen",
    "Functions and collections": "functies en collecties",
    "Prefer const first": "kies eerst const",
    "Use let only when the value changes": "gebruik let alleen als de waarde verandert",
    "Inspect values with console.log": "bekijk waarden met console.log",
    "Name functions with verbs": "geef functies werkwoordnamen",
    "Return values instead of printing inside every function": "return waarden in plaats van printen in elke functie",
    "Keep one function focused": "houd een functie gefocust",
  },
  pl: {
    "Values and variables": "wartosci i zmienne",
    "Functions": "funkcje",
    "Async APIs": "asynchroniczne API",
    "Program output": "wyjscie programu",
    "Values and names": "wartosci i nazwy",
    "Functions and collections": "funkcje i kolekcje",
    "Prefer const first": "najpierw wybieraj const",
    "Use let only when the value changes": "uzywaj let tylko gdy wartosc sie zmienia",
    "Inspect values with console.log": "sprawdzaj wartosci przez console.log",
    "Name functions with verbs": "nazywaj funkcje czasownikami",
    "Return values instead of printing inside every function": "zwracaj wartosci zamiast drukowac w kazdej funkcji",
    "Keep one function focused": "utrzymaj jedna funkcje skupiona",
  },
};

function tutorialText(text: string, language: InterfaceLanguage) {
  return tutorialI18n[language]?.[text] ?? compactTutorialI18n[language]?.[text] ?? text;
}

const tutorialFocusI18n: Partial<Record<InterfaceLanguage, Record<string, string>>> = {
  zh: {
    "const let string number boolean object array": "常量 变量 字符串 数字 布尔 对象 数组",
    "input output return reusable actions": "输入 输出 return 可复用动作",
    "fetch promise await error handling": "fetch Promise await 错误处理",
  },
  ja: {
    "const let string number boolean object array": "値 変数 文字列 数値 真偽値 オブジェクト 配列",
    "input output return reusable actions": "入力 出力 return 再利用できる処理",
    "fetch promise await error handling": "fetch Promise await エラー処理",
  },
  ko: {
    "const let string number boolean object array": "값 변수 문자열 숫자 불리언 객체 배열",
    "input output return reusable actions": "입력 출력 return 재사용 동작",
    "fetch promise await error handling": "fetch Promise await 오류 처리",
  },
  es: {
    "const let string number boolean object array": "valores variables texto números booleanos objetos arreglos",
    "input output return reusable actions": "entrada salida return acciones reutilizables",
    "fetch promise await error handling": "fetch Promise await manejo de errores",
  },
  fr: {
    "const let string number boolean object array": "valeurs variables texte nombres booleens objets tableaux",
    "input output return reusable actions": "entree sortie return actions reutilisables",
    "fetch promise await error handling": "fetch Promise await gestion des erreurs",
  },
  de: {
    "const let string number boolean object array": "werte variablen text zahlen booleans objekte arrays",
    "input output return reusable actions": "eingabe ausgabe return wiederverwendbare aktionen",
    "fetch promise await error handling": "fetch Promise await fehlerbehandlung",
  },
  pt: {
    "const let string number boolean object array": "valores variaveis texto numeros booleanos objetos arrays",
    "input output return reusable actions": "entrada saida return acoes reutilizaveis",
    "fetch promise await error handling": "fetch Promise await tratamento de erros",
  },
  ru: {
    "const let string number boolean object array": "значения переменные строки числа boolean объекты массивы",
    "input output return reusable actions": "вход выход return переиспользуемые действия",
    "fetch promise await error handling": "fetch Promise await обработка ошибок",
  },
  ar: {
    "const let string number boolean object array": "القيم والمتغيرات والنصوص والأرقام والقوائم والكائنات",
    "input output return reusable actions": "مدخلات مخرجات return وأفعال قابلة لإعادة الاستخدام",
    "fetch promise await error handling": "fetch و Promise و await ومعالجة الأخطاء",
  },
  hi: {
    "const let string number boolean object array": "मान variable string number boolean object array",
    "input output return reusable actions": "इनपुट आउटपुट return दोबारा इस्तेमाल होने वाले काम",
    "fetch promise await error handling": "fetch Promise await और error handling",
  },
  id: {
    "const let string number boolean object array": "nilai variabel teks angka boolean objek array",
    "input output return reusable actions": "input output return aksi yang bisa dipakai ulang",
    "fetch promise await error handling": "fetch Promise await penanganan error",
  },
  vi: {
    "const let string number boolean object array": "gia tri bien chuoi so boolean doi tuong mang",
    "input output return reusable actions": "dau vao dau ra return hanh dong dung lai",
    "fetch promise await error handling": "fetch Promise await xu ly loi",
  },
  th: {
    "const let string number boolean object array": "ค่า ตัวแปร ข้อความ ตัวเลข boolean object array",
    "input output return reusable actions": "input output return งานที่ใช้ซ้ำได้",
    "fetch promise await error handling": "fetch Promise await การจัดการ error",
  },
  tr: {
    "const let string number boolean object array": "degerler degiskenler metin sayilar boolean nesneler diziler",
    "input output return reusable actions": "girdi cikti return yeniden kullanilabilir eylemler",
    "fetch promise await error handling": "fetch Promise await hata yonetimi",
  },
  it: {
    "const let string number boolean object array": "valori variabili testo numeri boolean oggetti array",
    "input output return reusable actions": "input output return azioni riutilizzabili",
    "fetch promise await error handling": "fetch Promise await gestione errori",
  },
  nl: {
    "const let string number boolean object array": "waarden variabelen tekst getallen boolean objecten arrays",
    "input output return reusable actions": "input output return herbruikbare acties",
    "fetch promise await error handling": "fetch Promise await foutafhandeling",
  },
  pl: {
    "const let string number boolean object array": "wartosci zmienne tekst liczby boolean obiekty tablice",
    "input output return reusable actions": "wejscie wyjscie return akcje wielokrotnego uzycia",
    "fetch promise await error handling": "fetch Promise await obsluga bledow",
  },
};

function tutorialFocusText(text: string, language: InterfaceLanguage) {
  return tutorialFocusI18n[language]?.[text] ?? text;
}

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
      const searchable = normalize([
        item.slug,
        item.title,
        item.shortTitle,
        item.role,
        item.runtime,
        item.fileName,
        item.runCommand,
        ...item.strengths,
      ].join(" "));

      return searchable.includes(cleanLanguageFilter);
    });
  }, [cleanLanguageFilter]);
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
                  <strong>{item.title}</strong>
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
