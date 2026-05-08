import type { InterfaceLanguage } from "@/lib/language";
import { getProgrammingLanguage } from "@/lib/programming-content";
import { habitForInterface } from "@/lib/programming-trainer/foundation";

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

export {
  definitionCopy,
  interfaceLanguageLabel,
  pendingResultLabel,
  runtimeLabel,
};
