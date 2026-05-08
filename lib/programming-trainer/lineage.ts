import type { InterfaceLanguage } from "@/lib/language";
import { getProgrammingLanguage, type ProgrammingLanguageSlug } from "@/lib/programming-content";
import type { LineageProfile } from "@/lib/programming-trainer/foundation";

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

export {
  lineageCopy,
  lineageForLanguage,
  localizedLineageFamily,
  localizedLineageUseCase,
  programmingLanguageTitle,
  uniqueLanguageSlugs,
};
