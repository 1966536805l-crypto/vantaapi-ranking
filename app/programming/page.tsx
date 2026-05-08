import Link from "next/link";
import type { Metadata } from "next";
import { AppleStudyHeader } from "@/components/learning/ModuleHub";
import { localizedHref, resolveInterfaceLanguage, type InterfaceLanguage, type PageSearchParams } from "@/lib/language";
import { programmingLanguages, type ProgrammingLanguage, type ProgrammingLanguageSlug } from "@/lib/programming-content";

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

type ZeroStep = {
  key: string;
  title: string;
  body: string;
  example: string;
};

const localizedZeroSteps: Partial<Record<InterfaceLanguage, readonly ZeroStep[]>> = {
  ...zeroSteps,
  ja: [
    { key: "01", title: "プログラム", body: "入力を規則で処理し、出力に変える正確な指示です。", example: "input → rules → output" },
    { key: "02", title: "出力", body: "値を表示できれば、コードが動いていることを確認できます。", example: "print 42" },
    { key: "03", title: "値と変数", body: "変数は数値、文字列、真偽値、リスト、オブジェクトに名前を付けます。", example: "total = 42" },
    { key: "04", title: "流れ", body: "分岐は道を選び、ループは役に立つ作業を繰り返します。", example: "if condition then repeat" },
    { key: "05", title: "関数", body: "関数は一つの仕事に名前を付け、同じ考えを再利用します。", example: "add(a, b) → result" },
    { key: "06", title: "コレクション", body: "配列、リスト、マップ、セットは関連する値をまとめます。", example: "scores = [40, 2]" },
  ],
  ko: [
    { key: "01", title: "프로그램", body: "입력을 규칙으로 처리해 출력으로 바꾸는 정확한 명령입니다.", example: "input → rules → output" },
    { key: "02", title: "출력", body: "값을 출력하면 코드가 실제로 실행되는지 확인할 수 있습니다.", example: "print 42" },
    { key: "03", title: "값과 변수", body: "변수는 숫자, 문자열, 불리언, 리스트, 객체에 이름을 붙입니다.", example: "total = 42" },
    { key: "04", title: "흐름", body: "분기는 길을 고르고 반복문은 필요한 일을 반복합니다.", example: "if condition then repeat" },
    { key: "05", title: "함수", body: "함수는 한 가지 일을 묶어 같은 아이디어를 다시 쓰게 합니다.", example: "add(a, b) → result" },
    { key: "06", title: "컬렉션", body: "배열, 리스트, 맵, 세트는 관련 값을 여러 개 저장합니다.", example: "scores = [40, 2]" },
  ],
  es: [
    { key: "01", title: "Programa", body: "Instrucciones exactas que convierten entrada en salida.", example: "input → rules → output" },
    { key: "02", title: "Salida", body: "Imprimir un valor confirma que el código está vivo.", example: "print 42" },
    { key: "03", title: "Valores", body: "Las variables dan nombre a números, texto, booleanos, listas y objetos.", example: "total = 42" },
    { key: "04", title: "Flujo", body: "Las ramas eligen un camino y los bucles repiten trabajo útil.", example: "if condition then repeat" },
    { key: "05", title: "Funciones", body: "Una función empaqueta una tarea para reutilizar la idea.", example: "add(a, b) → result" },
    { key: "06", title: "Colecciones", body: "Arrays, listas, mapas y sets guardan muchos valores relacionados.", example: "scores = [40, 2]" },
  ],
  fr: [
    { key: "01", title: "Programme", body: "Des instructions exactes transforment une entree en sortie.", example: "input → rules → output" },
    { key: "02", title: "Sortie", body: "Afficher une valeur confirme que le code fonctionne.", example: "print 42" },
    { key: "03", title: "Valeurs", body: "Les variables nomment nombres, texte, booleens, listes et objets.", example: "total = 42" },
    { key: "04", title: "Flux", body: "Les conditions choisissent un chemin et les boucles repetent un travail utile.", example: "if condition then repeat" },
    { key: "05", title: "Fonctions", body: "Une fonction regroupe une tache pour reutiliser une idee.", example: "add(a, b) → result" },
    { key: "06", title: "Collections", body: "Tableaux, listes, maps et sets stockent plusieurs valeurs liees.", example: "scores = [40, 2]" },
  ],
  de: [
    { key: "01", title: "Programm", body: "Exakte Anweisungen verwandeln Eingabe nach Regeln in Ausgabe.", example: "input → rules → output" },
    { key: "02", title: "Ausgabe", body: "Ein Wert auf dem Bildschirm zeigt, dass Code wirklich laeuft.", example: "print 42" },
    { key: "03", title: "Werte", body: "Variablen geben Zahlen, Text, Booleans, Listen und Objekten Namen.", example: "total = 42" },
    { key: "04", title: "Ablauf", body: "Bedingungen waehlen Wege, Schleifen wiederholen nuetzliche Arbeit.", example: "if condition then repeat" },
    { key: "05", title: "Funktionen", body: "Funktionen packen eine Aufgabe so, dass du sie wiederverwenden kannst.", example: "add(a, b) → result" },
    { key: "06", title: "Sammlungen", body: "Arrays, Listen, Maps und Sets speichern zusammenhaengende Werte.", example: "scores = [40, 2]" },
  ],
  pt: [
    { key: "01", title: "Programa", body: "Instrucoes exatas transformam entrada em saida.", example: "input → rules → output" },
    { key: "02", title: "Saida", body: "Imprimir um valor confirma que o codigo esta rodando.", example: "print 42" },
    { key: "03", title: "Valores", body: "Variaveis dao nome a numeros, texto, booleanos, listas e objetos.", example: "total = 42" },
    { key: "04", title: "Fluxo", body: "Condicoes escolhem caminhos e loops repetem trabalho util.", example: "if condition then repeat" },
    { key: "05", title: "Funcoes", body: "Funcoes empacotam uma tarefa para reutilizar a ideia.", example: "add(a, b) → result" },
    { key: "06", title: "Colecoes", body: "Arrays, listas, maps e sets guardam valores relacionados.", example: "scores = [40, 2]" },
  ],
  ru: [
    { key: "01", title: "Программа", body: "Точные инструкции превращают входные данные в результат.", example: "input → rules → output" },
    { key: "02", title: "Вывод", body: "Печать значения показывает, что код действительно работает.", example: "print 42" },
    { key: "03", title: "Значения", body: "Переменные дают имена числам, строкам, boolean, спискам и объектам.", example: "total = 42" },
    { key: "04", title: "Поток", body: "Условия выбирают путь, циклы повторяют полезную работу.", example: "if condition then repeat" },
    { key: "05", title: "Функции", body: "Функция упаковывает одну задачу и позволяет повторно использовать идею.", example: "add(a, b) → result" },
    { key: "06", title: "Коллекции", body: "Массивы, списки, maps и sets хранят связанные значения.", example: "scores = [40, 2]" },
  ],
  ar: [
    { key: "01", title: "البرنامج", body: "تعليمات دقيقة تحول المدخلات إلى مخرجات عبر قواعد واضحة.", example: "input → rules → output" },
    { key: "02", title: "الإخراج", body: "طباعة قيمة هي أول طريقة للتأكد من أن الكود يعمل.", example: "print 42" },
    { key: "03", title: "القيم", body: "المتغيرات تعطي أسماء للأرقام والنصوص والقوائم والكائنات.", example: "total = 42" },
    { key: "04", title: "تدفق التنفيذ", body: "الشروط تختار مسارا والحلقات تكرر عملا مفيدا.", example: "if condition then repeat" },
    { key: "05", title: "الدوال", body: "الدالة تجمع مهمة واحدة حتى تعيد استخدام الفكرة.", example: "add(a, b) → result" },
    { key: "06", title: "المجموعات", body: "المصفوفات والقوائم والخرائط والمجموعات تخزن قيما مترابطة.", example: "scores = [40, 2]" },
  ],
  hi: [
    { key: "01", title: "Program", body: "Exact instructions input ko rules se output me badalte hain.", example: "input → rules → output" },
    { key: "02", title: "Output", body: "Value print karna code ke chalne ka pehla proof hai.", example: "print 42" },
    { key: "03", title: "Values", body: "Variables numbers, text, boolean, lists aur objects ko naam dete hain.", example: "total = 42" },
    { key: "04", title: "Flow", body: "Branches path chunti hain aur loops useful work repeat karte hain.", example: "if condition then repeat" },
    { key: "05", title: "Functions", body: "Function ek chhote kaam ko pack karta hai taki idea repeat ho sake.", example: "add(a, b) → result" },
    { key: "06", title: "Collections", body: "Arrays, lists, maps aur sets related values store karte hain.", example: "scores = [40, 2]" },
  ],
  id: [
    { key: "01", title: "Program", body: "Instruksi tepat mengubah input menjadi output lewat aturan.", example: "input → rules → output" },
    { key: "02", title: "Output", body: "Mencetak nilai adalah cara pertama memastikan kode hidup.", example: "print 42" },
    { key: "03", title: "Nilai", body: "Variabel memberi nama untuk angka teks boolean list dan object.", example: "total = 42" },
    { key: "04", title: "Alur", body: "Cabang memilih jalan dan loop mengulang kerja berguna.", example: "if condition then repeat" },
    { key: "05", title: "Fungsi", body: "Fungsi membungkus satu tugas agar idenya bisa dipakai ulang.", example: "add(a, b) → result" },
    { key: "06", title: "Koleksi", body: "Array list map dan set menyimpan nilai yang saling terkait.", example: "scores = [40, 2]" },
  ],
  vi: [
    { key: "01", title: "Chuong trinh", body: "Lenh chinh xac bien dau vao thanh dau ra qua quy tac.", example: "input → rules → output" },
    { key: "02", title: "Dau ra", body: "In mot gia tri la cach dau tien de biet code dang chay.", example: "print 42" },
    { key: "03", title: "Gia tri", body: "Bien dat ten cho so, chuoi, boolean, list va object.", example: "total = 42" },
    { key: "04", title: "Luong chay", body: "Nhanh chon duong, vong lap lap lai cong viec huu ich.", example: "if condition then repeat" },
    { key: "05", title: "Ham", body: "Ham dong goi mot viec nho de dung lai y tuong.", example: "add(a, b) → result" },
    { key: "06", title: "Bo suu tap", body: "Array, list, map va set luu nhieu gia tri lien quan.", example: "scores = [40, 2]" },
  ],
  th: [
    { key: "01", title: "โปรแกรม", body: "คำสั่งที่ชัดเจนเปลี่ยน input เป็น output ผ่านกฎ", example: "input → rules → output" },
    { key: "02", title: "ผลลัพธ์", body: "การพิมพ์ค่าเป็นวิธีแรกที่รู้ว่าโค้ดทำงาน", example: "print 42" },
    { key: "03", title: "ค่า", body: "ตัวแปรตั้งชื่อให้ตัวเลข ข้อความ boolean list และ object", example: "total = 42" },
    { key: "04", title: "ลำดับงาน", body: "เงื่อนไขเลือกทาง และ loop ทำงานที่มีประโยชน์ซ้ำ", example: "if condition then repeat" },
    { key: "05", title: "ฟังก์ชัน", body: "ฟังก์ชันรวมงานหนึ่งอย่างเพื่อใช้แนวคิดซ้ำได้", example: "add(a, b) → result" },
    { key: "06", title: "ชุดข้อมูล", body: "array list map และ set เก็บค่าหลายค่าที่เกี่ยวข้องกัน", example: "scores = [40, 2]" },
  ],
  tr: [
    { key: "01", title: "Program", body: "Kesin talimatlar girdiyi kurallarla ciktiya cevirir.", example: "input → rules → output" },
    { key: "02", title: "Cikti", body: "Bir degeri yazdirmak kodun calistigini gosterir.", example: "print 42" },
    { key: "03", title: "Degerler", body: "Degiskenler sayi, metin, boolean, liste ve nesnelere isim verir.", example: "total = 42" },
    { key: "04", title: "Akis", body: "Kosullar yol secer, donguler faydali isi tekrarlar.", example: "if condition then repeat" },
    { key: "05", title: "Fonksiyonlar", body: "Fonksiyon bir isi paketler ve fikri tekrar kullanir.", example: "add(a, b) → result" },
    { key: "06", title: "Koleksiyonlar", body: "Array, list, map ve set ilgili degerleri saklar.", example: "scores = [40, 2]" },
  ],
  it: [
    { key: "01", title: "Programma", body: "Istruzioni precise trasformano input in output con regole.", example: "input → rules → output" },
    { key: "02", title: "Output", body: "Stampare un valore conferma che il codice e vivo.", example: "print 42" },
    { key: "03", title: "Valori", body: "Le variabili danno nomi a numeri, testo, boolean, liste e oggetti.", example: "total = 42" },
    { key: "04", title: "Flusso", body: "Le condizioni scelgono una strada e i cicli ripetono lavoro utile.", example: "if condition then repeat" },
    { key: "05", title: "Funzioni", body: "Una funzione impacchetta un compito per riusare l idea.", example: "add(a, b) → result" },
    { key: "06", title: "Collezioni", body: "Array, liste, map e set salvano valori collegati.", example: "scores = [40, 2]" },
  ],
  nl: [
    { key: "01", title: "Programma", body: "Exacte instructies veranderen input via regels in output.", example: "input → rules → output" },
    { key: "02", title: "Uitvoer", body: "Een waarde tonen bevestigt dat code echt draait.", example: "print 42" },
    { key: "03", title: "Waarden", body: "Variabelen geven namen aan getallen, tekst, boolean, lijsten en objecten.", example: "total = 42" },
    { key: "04", title: "Stroom", body: "Branches kiezen een pad en loops herhalen nuttig werk.", example: "if condition then repeat" },
    { key: "05", title: "Functies", body: "Een functie verpakt een taak zodat je het idee opnieuw gebruikt.", example: "add(a, b) → result" },
    { key: "06", title: "Collecties", body: "Arrays, lists, maps en sets bewaren verwante waarden.", example: "scores = [40, 2]" },
  ],
  pl: [
    { key: "01", title: "Program", body: "Dokladne instrukcje zmieniaja wejscie w wynik wedlug zasad.", example: "input → rules → output" },
    { key: "02", title: "Wyjscie", body: "Wypisanie wartosci pokazuje, ze kod naprawde dziala.", example: "print 42" },
    { key: "03", title: "Wartosci", body: "Zmienne nadaja nazwy liczbom, tekstom, boolean, listom i obiektom.", example: "total = 42" },
    { key: "04", title: "Przeplyw", body: "Warunki wybieraja sciezke, petle powtarzaja przydatna prace.", example: "if condition then repeat" },
    { key: "05", title: "Funkcje", body: "Funkcja pakuje jedno zadanie, aby ponownie uzyc idei.", example: "add(a, b) → result" },
    { key: "06", title: "Kolekcje", body: "Arrays, lists, maps i sets przechowuja powiazane wartosci.", example: "scores = [40, 2]" },
  ],
};

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

type GroupDisplay = { title: string; summary: string };

const groupDisplayCopy: Partial<Record<InterfaceLanguage, Record<string, GroupDisplay>>> = {
  ja: {
    web: { title: "Web とプロダクト", summary: "ページ · ツール · API · プロダクト UI" },
    backend: { title: "バックエンドとクラウド", summary: "サービス · データベース · CLI · 安定した API" },
    mobile: { title: "モバイルとアプリ", summary: "iOS · Android · クロスプラットフォーム" },
    systems: { title: "システムと性能", summary: "メモリ · 速度 · コンパイラ · 低レイヤー" },
    data: { title: "データと科学計算", summary: "分析 · 数値処理 · 研究ワークフロー" },
    functional: { title: "関数型と言語設計", summary: "型 · 変換 · 並行処理 · コンパイラ思考" },
    scripting: { title: "スクリプトと自動化", summary: "ファイル · テキスト · プラグイン · 日常作業" },
    blockchain: { title: "コントラクトとセキュリティ", summary: "状態 · 権限 · 取引 · 安全なレビュー" },
    enterprise: { title: "企業とレガシー", summary: "SAP · 金融 · デスクトップ · 業務システム" },
  },
  ko: {
    web: { title: "웹과 제품", summary: "페이지 · 도구 · API · 제품 UI" },
    backend: { title: "백엔드와 클라우드", summary: "서비스 · 데이터베이스 · CLI · 안정 API" },
    mobile: { title: "모바일과 앱", summary: "iOS · Android · 크로스 플랫폼" },
    systems: { title: "시스템과 성능", summary: "메모리 · 속도 · 컴파일러 · 저수준 코드" },
    data: { title: "데이터와 과학 계산", summary: "분석 · 수치 모델 · 연구 흐름" },
    functional: { title: "함수형과 언어 설계", summary: "타입 · 변환 · 동시성 · 컴파일러 사고" },
    scripting: { title: "스크립트와 자동화", summary: "파일 · 텍스트 · 플러그인 · 일상 자동화" },
    blockchain: { title: "컨트랙트와 보안", summary: "상태 · 권한 · 거래 · 안전 리뷰" },
    enterprise: { title: "기업과 레거시", summary: "SAP · 금융 · 데스크톱 · 비즈니스 시스템" },
  },
  es: {
    web: { title: "Web y producto", summary: "Paginas · herramientas · API · interfaces" },
    backend: { title: "Backend y nube", summary: "Servicios · bases de datos · CLI · API fiables" },
    mobile: { title: "Movil y apps", summary: "iOS · Android · apps multiplataforma" },
    systems: { title: "Sistemas y rendimiento", summary: "Memoria · velocidad · compiladores · bajo nivel" },
    data: { title: "Datos y ciencia", summary: "Analisis · numeros · flujos de investigacion" },
    functional: { title: "Funcional y diseno de lenguajes", summary: "Tipos · transformaciones · concurrencia" },
    scripting: { title: "Scripts y automatizacion", summary: "Archivos · texto · plugins · flujos diarios" },
    blockchain: { title: "Contratos y seguridad", summary: "Estado · permisos · transacciones · revision segura" },
    enterprise: { title: "Empresa y legado", summary: "SAP · finanzas · escritorio · sistemas clasicos" },
  },
  fr: {
    web: { title: "Web et produit", summary: "Pages · outils · API · interfaces produit" },
    backend: { title: "Backend et cloud", summary: "Services · bases de donnees · CLI · API fiables" },
    mobile: { title: "Mobile et app", summary: "iOS · Android · apps multiplateformes" },
    systems: { title: "Systemes et performance", summary: "Memoire · vitesse · compilateurs · bas niveau" },
    data: { title: "Donnees et science", summary: "Analyse · calcul · recherche" },
    functional: { title: "Fonctionnel et design de langage", summary: "Types · transformations · concurrence" },
    scripting: { title: "Scripts et automatisation", summary: "Fichiers · texte · plugins · routines" },
    blockchain: { title: "Contrats et securite", summary: "Etat · permissions · transactions · revue sure" },
    enterprise: { title: "Entreprise et legacy", summary: "SAP · finance · desktop · systemes classiques" },
  },
  de: {
    web: { title: "Web und Produkt", summary: "Seiten · Werkzeuge · APIs · Produktoberflaechen" },
    backend: { title: "Backend und Cloud", summary: "Services · Datenbanken · CLIs · stabile APIs" },
    mobile: { title: "Mobile und App", summary: "iOS · Android · plattformuebergreifend" },
    systems: { title: "Systeme und Performance", summary: "Speicher · Tempo · Compiler · Low Level" },
    data: { title: "Daten und Wissenschaft", summary: "Analyse · Zahlen · Research Workflows" },
    functional: { title: "Funktional und Sprachdesign", summary: "Typen · Transformation · Nebenlaeufigkeit" },
    scripting: { title: "Scripting und Automatisierung", summary: "Dateien · Text · Plugins · Alltag" },
    blockchain: { title: "Contracts und Sicherheit", summary: "State · Rechte · Transaktionen · sichere Reviews" },
    enterprise: { title: "Enterprise und Legacy", summary: "SAP · Finance · Desktop · klassische Systeme" },
  },
  ru: {
    web: { title: "Web и продукт", summary: "Страницы · инструменты · API · интерфейсы" },
    backend: { title: "Backend и cloud", summary: "Сервисы · базы данных · CLI · надежные API" },
    mobile: { title: "Mobile и apps", summary: "iOS · Android · кроссплатформа" },
    systems: { title: "Системы и производительность", summary: "Память · скорость · компиляторы · low level" },
    data: { title: "Данные и наука", summary: "Анализ · числа · исследовательские процессы" },
    functional: { title: "Функциональный стиль и языки", summary: "Типы · преобразования · конкуррентность" },
    scripting: { title: "Скрипты и автоматизация", summary: "Файлы · текст · плагины · ежедневные задачи" },
    blockchain: { title: "Контракты и безопасность", summary: "Состояние · права · транзакции · secure review" },
    enterprise: { title: "Enterprise и legacy", summary: "SAP · финансы · desktop · классические системы" },
  },
  ar: {
    web: { title: "الويب والمنتجات", summary: "صفحات · أدوات · API · واجهات منتجات" },
    backend: { title: "الخلفية والسحابة", summary: "خدمات · قواعد بيانات · CLI · API موثوقة" },
    mobile: { title: "الجوال والتطبيقات", summary: "iOS · Android · تطبيقات متعددة المنصات" },
    systems: { title: "الأنظمة والأداء", summary: "ذاكرة · سرعة · مترجمات · كود منخفض المستوى" },
    data: { title: "البيانات والحوسبة العلمية", summary: "تحليل · أرقام · نماذج · سير عمل بحثي" },
    functional: { title: "الدوال وتصميم اللغات", summary: "أنواع · تحويلات · تزامن · تفكير المترجم" },
    scripting: { title: "السكربتات والأتمتة", summary: "ملفات · نصوص · إضافات · أعمال يومية" },
    blockchain: { title: "العقود والأمان", summary: "حالة · صلاحيات · معاملات · مراجعة آمنة" },
    enterprise: { title: "المؤسسات والأنظمة القديمة", summary: "SAP · مالية · تطبيقات مكتبية · أنظمة أعمال" },
  },
  pt: {
    web: { title: "Web e produto", summary: "Paginas · ferramentas · APIs · interfaces" },
    backend: { title: "Backend e nuvem", summary: "Servicos · bancos · CLIs · APIs confiaveis" },
    mobile: { title: "Mobile e app", summary: "iOS · Android · apps multiplataforma" },
    systems: { title: "Sistemas e desempenho", summary: "Memoria · velocidade · compiladores · baixo nivel" },
    data: { title: "Dados e ciencia", summary: "Analise · numeros · pesquisa" },
    functional: { title: "Funcional e design de linguagem", summary: "Tipos · transformacoes · concorrencia" },
    scripting: { title: "Scripts e automacao", summary: "Arquivos · texto · plugins · rotinas" },
    blockchain: { title: "Contratos e seguranca", summary: "Estado · permissoes · transacoes · revisao segura" },
    enterprise: { title: "Empresa e legado", summary: "SAP · financeiro · desktop · sistemas classicos" },
  },
  id: {
    web: { title: "Web dan produk", summary: "Halaman · alat · API · antarmuka produk" },
    backend: { title: "Backend dan cloud", summary: "Layanan · database · CLI · API andal" },
    mobile: { title: "Mobile dan app", summary: "iOS · Android · aplikasi lintas platform" },
    systems: { title: "Sistem dan performa", summary: "Memori · kecepatan · compiler · low level" },
    data: { title: "Data dan sains", summary: "Analisis · angka · alur riset" },
    functional: { title: "Fungsional dan desain bahasa", summary: "Tipe · transformasi · konkurensi" },
    scripting: { title: "Skrip dan otomasi", summary: "File · teks · plugin · alur harian" },
    blockchain: { title: "Kontrak dan keamanan", summary: "State · izin · transaksi · review aman" },
    enterprise: { title: "Enterprise dan legacy", summary: "SAP · finansial · desktop · sistem klasik" },
  },
  hi: {
    web: { title: "वेब और उत्पाद", summary: "पेज · टूल · API · उत्पाद इंटरफेस" },
    backend: { title: "बैकएंड और क्लाउड", summary: "सेवाएं · डेटाबेस · CLI · भरोसेमंद API" },
    mobile: { title: "मोबाइल और ऐप", summary: "iOS · Android · क्रॉस प्लेटफॉर्म ऐप" },
    systems: { title: "सिस्टम और प्रदर्शन", summary: "मेमोरी · गति · कंपाइलर · लो लेवल कोड" },
    data: { title: "डेटा और विज्ञान", summary: "विश्लेषण · संख्याएं · शोध वर्कफ्लो" },
    functional: { title: "फंक्शनल और भाषा डिजाइन", summary: "टाइप · रूपांतरण · concurrency" },
    scripting: { title: "स्क्रिप्ट और ऑटोमेशन", summary: "फाइल · टेक्स्ट · प्लगइन · रोजमर्रा काम" },
    blockchain: { title: "कॉन्ट्रैक्ट और सुरक्षा", summary: "स्टेट · अनुमति · लेनदेन · सुरक्षित समीक्षा" },
    enterprise: { title: "एंटरप्राइज और legacy", summary: "SAP · वित्त · डेस्कटॉप · बिजनेस सिस्टम" },
  },
  vi: {
    web: { title: "Web va san pham", summary: "Trang · cong cu · API · giao dien san pham" },
    backend: { title: "Backend va cloud", summary: "Dich vu · co so du lieu · CLI · API on dinh" },
    mobile: { title: "Mobile va ung dung", summary: "iOS · Android · ung dung da nen tang" },
    systems: { title: "He thong va hieu nang", summary: "Bo nho · toc do · compiler · low level" },
    data: { title: "Du lieu va khoa hoc", summary: "Phan tich · so lieu · quy trinh nghien cuu" },
    functional: { title: "Ham va thiet ke ngon ngu", summary: "Kieu · bien doi · dong thoi" },
    scripting: { title: "Script va tu dong hoa", summary: "Tep · van ban · plugin · cong viec hang ngay" },
    blockchain: { title: "Hop dong va bao mat", summary: "Trang thai · quyen · giao dich · review an toan" },
    enterprise: { title: "Doanh nghiep va he cu", summary: "SAP · tai chinh · desktop · he thong nghiep vu" },
  },
  th: {
    web: { title: "เว็บและผลิตภัณฑ์", summary: "หน้า · เครื่องมือ · API · หน้าจอผลิตภัณฑ์" },
    backend: { title: "แบ็กเอนด์และคลาวด์", summary: "บริการ · ฐานข้อมูล · CLI · API ที่เชื่อถือได้" },
    mobile: { title: "มือถือและแอป", summary: "iOS · Android · แอปข้ามแพลตฟอร์ม" },
    systems: { title: "ระบบและประสิทธิภาพ", summary: "หน่วยความจำ · ความเร็ว · คอมไพเลอร์ · low level" },
    data: { title: "ข้อมูลและวิทยาศาสตร์", summary: "วิเคราะห์ · ตัวเลข · เวิร์กโฟลว์วิจัย" },
    functional: { title: "ฟังก์ชันและการออกแบบภาษา", summary: "ชนิดข้อมูล · การแปลง · concurrency" },
    scripting: { title: "สคริปต์และอัตโนมัติ", summary: "ไฟล์ · ข้อความ · ปลั๊กอิน · งานประจำวัน" },
    blockchain: { title: "สัญญาและความปลอดภัย", summary: "สถานะ · สิทธิ์ · ธุรกรรม · ตรวจสอบอย่างปลอดภัย" },
    enterprise: { title: "องค์กรและระบบเดิม", summary: "SAP · การเงิน · เดสก์ท็อป · ระบบธุรกิจ" },
  },
  tr: {
    web: { title: "Web ve urun", summary: "Sayfalar · araclar · API · urun arayuzleri" },
    backend: { title: "Backend ve bulut", summary: "Servisler · veritabani · CLI · guvenilir API" },
    mobile: { title: "Mobil ve uygulama", summary: "iOS · Android · cok platformlu uygulama" },
    systems: { title: "Sistemler ve performans", summary: "Bellek · hiz · derleyici · low level" },
    data: { title: "Veri ve bilim", summary: "Analiz · sayilar · arastirma akisleri" },
    functional: { title: "Fonksiyonel ve dil tasarimi", summary: "Tipler · donusumler · eszamanlilik" },
    scripting: { title: "Script ve otomasyon", summary: "Dosya · metin · eklenti · gunluk isler" },
    blockchain: { title: "Kontrat ve guvenlik", summary: "Durum · izin · islem · guvenli inceleme" },
    enterprise: { title: "Kurumsal ve legacy", summary: "SAP · finans · masaustu · is sistemleri" },
  },
  it: {
    web: { title: "Web e prodotto", summary: "Pagine · strumenti · API · interfacce prodotto" },
    backend: { title: "Backend e cloud", summary: "Servizi · database · CLI · API affidabili" },
    mobile: { title: "Mobile e app", summary: "iOS · Android · app multipiattaforma" },
    systems: { title: "Sistemi e prestazioni", summary: "Memoria · velocita · compilatori · basso livello" },
    data: { title: "Dati e scienza", summary: "Analisi · numeri · flussi di ricerca" },
    functional: { title: "Funzionale e design dei linguaggi", summary: "Tipi · trasformazioni · concorrenza" },
    scripting: { title: "Script e automazione", summary: "File · testo · plugin · routine" },
    blockchain: { title: "Contratti e sicurezza", summary: "Stato · permessi · transazioni · revisione sicura" },
    enterprise: { title: "Enterprise e legacy", summary: "SAP · finanza · desktop · sistemi classici" },
  },
  nl: {
    web: { title: "Web en product", summary: "Pagina's · tools · API · productinterfaces" },
    backend: { title: "Backend en cloud", summary: "Services · databases · CLI · betrouwbare API" },
    mobile: { title: "Mobiel en apps", summary: "iOS · Android · cross platform apps" },
    systems: { title: "Systemen en performance", summary: "Geheugen · snelheid · compilers · low level" },
    data: { title: "Data en wetenschap", summary: "Analyse · cijfers · onderzoeksflows" },
    functional: { title: "Functioneel en taalontwerp", summary: "Types · transformaties · concurrency" },
    scripting: { title: "Scripts en automatisering", summary: "Bestanden · tekst · plugins · dagelijkse taken" },
    blockchain: { title: "Contracten en veiligheid", summary: "State · rechten · transacties · veilige review" },
    enterprise: { title: "Enterprise en legacy", summary: "SAP · finance · desktop · klassieke systemen" },
  },
  pl: {
    web: { title: "Web i produkt", summary: "Strony · narzedzia · API · interfejsy produktu" },
    backend: { title: "Backend i chmura", summary: "Uslugi · bazy danych · CLI · stabilne API" },
    mobile: { title: "Mobile i aplikacje", summary: "iOS · Android · aplikacje wieloplatformowe" },
    systems: { title: "Systemy i wydajnosc", summary: "Pamiec · szybkosc · kompilatory · low level" },
    data: { title: "Dane i nauka", summary: "Analiza · liczby · procesy badawcze" },
    functional: { title: "Funkcyjne i projektowanie jezykow", summary: "Typy · transformacje · wspolbieznosc" },
    scripting: { title: "Skrypty i automatyzacja", summary: "Pliki · tekst · wtyczki · codzienne zadania" },
    blockchain: { title: "Kontrakty i bezpieczenstwo", summary: "Stan · uprawnienia · transakcje · bezpieczny review" },
    enterprise: { title: "Enterprise i legacy", summary: "SAP · finanse · desktop · systemy biznesowe" },
  },
};

function getGroupDisplay(group: (typeof groups)[number], language: InterfaceLanguage): GroupDisplay {
  if (language === "zh") return { title: group.zh, summary: group.summaryZh };
  return groupDisplayCopy[language]?.[group.key] || { title: group.title, summary: group.summary };
}

const programmingCardDescription: Record<InterfaceLanguage, (name: string, fallback: string) => string> = {
  en: (_name, fallback) => fallback,
  zh: (name) => `${name} 的定义、语法、例子和训练题，适合从零开始逐步练。`,
  ja: (name) => `${name} の定義、文法、例、練習をゼロから順に学べます。`,
  ko: (name) => `${name} 정의, 문법, 예제, 연습을 처음부터 차례로 익힙니다.`,
  es: (name) => `Definiciones, sintaxis, ejemplos y práctica para aprender ${name} desde cero.`,
  fr: (name) => `Definitions, syntaxe, exemples et pratique pour apprendre ${name} depuis zero.`,
  de: (name) => `Definitionen, Syntax, Beispiele und Uebungen, um ${name} ab null zu lernen.`,
  pt: (name) => `Definicoes, sintaxe, exemplos e pratica para aprender ${name} do zero.`,
  ru: (name) => `Определения, синтаксис, примеры и практика для изучения ${name} с нуля.`,
  ar: (name) => `تعريفات وقواعد وأمثلة وتمارين لتعلم ${name} من الصفر خطوة بخطوة.`,
  hi: (name) => `${name} ke definitions, syntax, examples aur practice zero se seekhne ke liye.`,
  id: (name) => `Definisi, sintaks, contoh, dan latihan untuk belajar ${name} dari nol.`,
  vi: (name) => `Dinh nghia, cu phap, vi du va bai tap de hoc ${name} tu con so 0.`,
  th: (name) => `นิยาม syntax ตัวอย่าง และแบบฝึกสำหรับเรียน ${name} จากศูนย์`,
  tr: (name) => `${name} icin tanimlar, soz dizimi, ornekler ve sifirdan pratik.`,
  it: (name) => `Definizioni, sintassi, esempi e pratica per imparare ${name} da zero.`,
  nl: (name) => `Definities, syntax, voorbeelden en oefeningen om ${name} vanaf nul te leren.`,
  pl: (name) => `Definicje, skladnia, przyklady i cwiczenia do nauki ${name} od zera.`,
};

const practiceModeLabel: Record<InterfaceLanguage, string> = {
  en: "choice · fill blank · build tasks",
  zh: "选择 · 填空 · 实操任务",
  ja: "選択 · 穴埋め · 実践課題",
  ko: "선택 · 빈칸 · 실습 과제",
  es: "opcion · rellenar · tareas",
  fr: "choix · texte manquant · taches",
  de: "Auswahl · Luecke · Aufgaben",
  pt: "escolha · lacuna · tarefas",
  ru: "выбор · пропуски · практика",
  ar: "اختيار · فراغ · مهام عملية",
  hi: "choice · fill blank · build tasks",
  id: "pilihan · isian · tugas praktik",
  vi: "lua chon · dien cho trong · bai thuc hanh",
  th: "ตัวเลือก · เติมคำ · งานปฏิบัติ",
  tr: "secim · bosluk · pratik gorev",
  it: "scelta · completa · compiti",
  nl: "keuze · invullen · taken",
  pl: "wybor · luka · zadania",
};

export async function generateMetadata({
  searchParams,
}: {
  searchParams?: Promise<PageSearchParams>;
}): Promise<Metadata> {
  const language = resolveInterfaceLanguage(searchParams ? await searchParams : undefined);
  const t = copy[language];
  return {
    title: `${t.title} - JinMing Lab`,
    description: t.subtitle,
  };
}

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
  const t = copy[language];
  const zeroStepList = localizedZeroSteps[language] || zeroSteps.en;

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
              <p className="mt-1 text-3xl font-semibold">{zeroStepList.length}</p>
            </div>
          </div>
        </div>

        <section className="mt-6">
          <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="eyebrow">{t.zeroEyebrow}</p>
              <h2 className="mt-2 text-2xl font-semibold">{t.zeroTitle}</h2>
            </div>
            <span className="dense-status">{practiceModeLabel[language]}</span>
          </div>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {zeroStepList.map((step) => (
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
              {groups.map((group) => {
                const groupDisplay = getGroupDisplay(group, language);
                return (
                  <div key={group.key} className="rounded-[8px] border border-white/10 bg-white/[0.07] p-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <h3 className="font-semibold text-white">{groupDisplay.title}</h3>
                        <p className="mt-1 text-xs leading-5 text-slate-300">{groupDisplay.summary}</p>
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
                );
              })}
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
                  <p className="mt-3 line-clamp-2 text-sm leading-6 text-[color:var(--muted)]">
                    {programmingCardDescription[language](item.title, item.role)}
                  </p>
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
