import type { InterfaceLanguage } from "@/lib/language";
import type { ProgrammingLanguageSlug, ProgrammingQuestion } from "@/lib/programming-content";
import type { ResultState } from "@/lib/programming-trainer/foundation";

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
    "type annotation": "型注釈",
    "interface shape": "interface の形",
    "union narrowing": "型の絞り込み",
    "generic array": "型付き配列",
    "function definition": "関数定義",
    "list append": "リストへの追加",
    "dictionary access": "辞書アクセス",
    "for loop": "for ループ",
    "output stream": "出力ストリーム",
    "integer type": "整数型",
    "vector push": "vector への追加",
    "reference": "参照",
    "main method": "Java の main メソッド",
    "print line": "行の出力",
    "class field": "class のフィールド",
    "constructor this": "constructor の this",
    "main package": "main パッケージ",
    "print": "出力",
    "short declaration": "短い宣言",
    "error check": "エラーチェック",
    "main function": "main 関数",
    "println macro": "println! マクロ",
    "mutable binding": "変更可能な束縛",
    "match result": "Result の match",
    "select columns": "列の選択",
    "where filter": "WHERE フィルター",
    "count aggregate": "COUNT 集計",
    "join tables": "テーブル結合",
    "heading structure": "見出し構造",
    "button action": "button の操作",
    "grid layout": "grid レイアウト",
    "media query": "media query",
    "echo output": "echo 出力",
    "variable assignment": "変数代入",
    "pipe": "パイプ",
    "console output": "Console 出力",
    "string type": "文字列型",
    "list add": "List への追加",
    "property": "プロパティ",
    "variable": "変数",
    "echo": "echo",
    "function": "関数",
    "foreach": "foreach ループ",
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
    "type annotation": "تعليق النوع",
    "interface shape": "شكل الواجهة",
    "union narrowing": "تضييق النوع",
    "generic array": "مصفوفة بنوع محدد",
    "function definition": "تعريف الدالة",
    "list append": "إضافة إلى القائمة",
    "dictionary access": "قراءة القاموس",
    "for loop": "حلقة for",
    "output stream": "مجرى الإخراج",
    "integer type": "نوع العدد الصحيح",
    "vector push": "إضافة إلى vector",
    "reference": "مرجع",
    "main method": "دالة main في Java",
    "print line": "طباعة سطر",
    "class field": "حقل داخل class",
    "constructor this": "this داخل constructor",
    "main package": "حزمة main",
    "printing a value": "طباعة قيمة",
    "print": "طباعة",
    "short declaration": "تصريح مختصر",
    "error check": "فحص الخطأ",
    "naming a value": "تسمية قيمة",
    "reusable function": "دالة قابلة لإعادة الاستخدام",
    "basic collection": "مجموعة أساسية",
    "main function": "الدالة الرئيسية",
    "println macro": "ماكرو println",
    "mutable binding": "ربط قابل للتغيير",
    "match result": "مطابقة Result",
    "select columns": "اختيار الأعمدة",
    "where filter": "فلتر WHERE",
    "count aggregate": "تجميع COUNT",
    "join tables": "ربط الجداول",
    "heading structure": "بنية العناوين",
    "button action": "زر الإجراء",
    "grid layout": "تخطيط grid",
    "media query": "استعلام media",
    "echo output": "إخراج echo",
    "variable assignment": "إسناد المتغير",
    "pipe": "أنبوب الأوامر",
    "console output": "إخراج Console",
    "string type": "نوع النص",
    "list add": "إضافة إلى List",
    "property": "خاصية",
    "variable": "متغير",
    "echo": "echo",
    "function": "دالة",
    "foreach": "حلقة foreach",
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
    "Add a type when a value is part of a contract": "値が契約の一部なら型を付ける",
    "interface describes the required fields of an object": "interface はオブジェクトに必要なフィールドを表す",
    "Check the actual type before using type specific methods": "型専用メソッドを使う前に実際の型を確認する",
    "Array<T> or T[] stores a list of one item type": "Array<T> や T[] は同じ型の一覧を保存する",
    "Use def to create a reusable function": "def で再利用できる関数を作る",
    "append adds one item to the end of a list": "append はリストの末尾に要素を追加する",
    "Use a key to read a value from a dictionary": "辞書から値を読むにはキーを使う",
    "for repeats work for every item in a sequence": "for は並びの各要素に同じ処理を繰り返す",
    "cout prints values to standard output": "cout は標準出力に値を出す",
    "int stores whole numbers": "int は整数を保存する",
    "push_back appends an item to a vector": "push_back は vector に要素を追加する",
    "A reference is another name for the same value": "参照は同じ値に付ける別名",
    "public static void main is the Java entry point": "public static void main は Java の入口",
    "System.out.println prints a line": "System.out.println は一行を出力する",
    "A field stores object state": "フィールドはオブジェクトの状態を保存する",
    "this.name refers to the current object's field": "this.name は現在のオブジェクトのフィールドを指す",
    "package main marks an executable program": "package main は実行可能な Go プログラムを示す",
    "fmt.Println prints a line": "fmt.Println は一行を出力する",
    ":= declares and assigns inside a function": ":= は関数内で宣言と代入を同時に行う",
    "if err != nil handles failure explicitly": "if err != nil で失敗を明示的に処理する",
    "fn main starts a Rust binary": "fn main は Rust バイナリの入口になる",
    "println! prints formatted output": "println! は整形した出力を表示する",
    "mut allows a binding to change": "mut は束縛の変更を許可する",
    "match handles each possible enum case": "match は enum の各ケースを明示的に処理する",
    "SELECT chooses columns from a result set": "SELECT は結果に出す列を選ぶ",
    "WHERE keeps only rows matching a condition": "WHERE は条件に合う行だけを残す",
    "COUNT returns how many rows match": "COUNT は一致する行数を返す",
    "JOIN combines rows from related tables": "JOIN は関連するテーブルの行を結合する",
    "h1 names the main page topic": "h1 はページの主題を示す",
    "button is the correct element for an action": "操作には button 要素を使う",
    "display grid creates a two dimensional layout": "display grid は二次元レイアウトを作る",
    "media queries adapt layout to screen size": "media query は画面サイズに合わせて配置を変える",
    "echo prints text or variable values": "echo は文字列や変数の値を出力する",
    "Bash assignment has no spaces around equals": "Bash の代入では = の前後に空白を入れない",
    "A pipe sends output into the next command": "パイプは出力を次のコマンドへ渡す",
    "for repeats commands for each item": "for は各項目に対してコマンドを繰り返す",
    "Console.WriteLine prints a line": "Console.WriteLine は一行を出力する",
    "string stores text": "string は文字列を保存する",
    "Add appends an item to a List": "Add は List に要素を追加する",
    "A property exposes object data with get set": "property は get set でオブジェクトのデータを公開する",
    "PHP variables begin with a dollar sign": "PHP の変数はドル記号で始まる",
    "echo outputs text": "echo は文字列を出力する",
    "function defines reusable behavior": "function は再利用できる処理を定義する",
    "foreach loops through arrays": "foreach は配列の要素を順に処理する",
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
    "Add a type when a value is part of a contract": "أضف نوعا عندما تكون القيمة جزءا من عقد واضح",
    "interface describes the required fields of an object": "interface تصف الحقول المطلوبة في الكائن",
    "Check the actual type before using type specific methods": "افحص النوع الفعلي قبل استخدام دوال خاصة به",
    "Array<T> or T[] stores a list of one item type": "Array<T> أو T[] تحفظ قائمة من نوع واحد",
    "Use def to create a reusable function": "استخدم def لإنشاء دالة قابلة لإعادة الاستخدام",
    "append adds one item to the end of a list": "append تضيف عنصرا إلى نهاية القائمة",
    "Use a key to read a value from a dictionary": "استخدم المفتاح لقراءة قيمة من القاموس",
    "for repeats work for every item in a sequence": "for تكرر العمل لكل عنصر في التسلسل",
    "cout prints values to standard output": "cout تطبع القيم إلى الإخراج القياسي",
    "int stores whole numbers": "int يحفظ الأعداد الصحيحة",
    "push_back appends an item to a vector": "push_back تضيف عنصرا إلى vector",
    "A reference is another name for the same value": "المرجع اسم آخر للقيمة نفسها",
    "public static void main is the Java entry point": "public static void main هي نقطة دخول Java",
    "System.out.println prints a line": "System.out.println تطبع سطرا",
    "A field stores object state": "الحقل يحفظ حالة الكائن",
    "this.name refers to the current object's field": "this.name يشير إلى حقل الكائن الحالي",
    "package main marks an executable program": "package main تحدد برنامجا قابلا للتشغيل",
    "fmt.Println prints a line": "fmt.Println تطبع سطرا",
    ":= declares and assigns inside a function": ":= يصرح ويسند داخل الدالة",
    "if err != nil handles failure explicitly": "if err != nil تعالج الفشل بوضوح",
    "fn main starts a Rust binary": "fn main هي نقطة بدء برنامج Rust",
    "println! prints formatted output": "println! تطبع ناتجا منسقا",
    "mut allows a binding to change": "mut تسمح بتغيير الربط",
    "match handles each possible enum case": "match تعالج كل حالة ممكنة من enum",
    "SELECT chooses columns from a result set": "SELECT تختار الأعمدة من نتيجة الاستعلام",
    "WHERE keeps only rows matching a condition": "WHERE تبقي الصفوف التي تطابق الشرط فقط",
    "COUNT returns how many rows match": "COUNT ترجع عدد الصفوف المطابقة",
    "JOIN combines rows from related tables": "JOIN تجمع صفوفا من جداول مرتبطة",
    "h1 names the main page topic": "h1 يسمي موضوع الصفحة الرئيسي",
    "button is the correct element for an action": "button هو العنصر الصحيح للإجراء",
    "display grid creates a two dimensional layout": "display grid ينشئ تخطيطا ثنائي الاتجاه",
    "media queries adapt layout to screen size": "media queries تكيف التخطيط مع حجم الشاشة",
    "echo prints text or variable values": "echo تطبع النص أو قيم المتغيرات",
    "Bash assignment has no spaces around equals": "إسناد Bash لا يحتوي مسافات حول علامة =",
    "A pipe sends output into the next command": "الأنبوب يرسل الإخراج إلى الأمر التالي",
    "for repeats commands for each item": "for تكرر الأوامر لكل عنصر",
    "Console.WriteLine prints a line": "Console.WriteLine تطبع سطرا",
    "string stores text": "string يحفظ النص",
    "Add appends an item to a List": "Add تضيف عنصرا إلى List",
    "A property exposes object data with get set": "property تعرض بيانات الكائن عبر get و set",
    "PHP variables begin with a dollar sign": "متغيرات PHP تبدأ بعلامة الدولار",
    "echo outputs text": "echo يخرج النص",
    "function defines reusable behavior": "function تعرف سلوكا قابلا لإعادة الاستخدام",
    "foreach loops through arrays": "foreach تمر على عناصر المصفوفات",
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

export {
  checkQuestion,
  isTypingTarget,
  normalize,
  optionLabel,
  questionExplanation,
  questionHints,
  questionPrompt,
  questionTitle,
  resultClassName,
  runnerText,
  storageKey,
};
