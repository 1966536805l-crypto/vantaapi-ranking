import type { Metadata } from "next";
import { ModuleHub, type ModuleItem } from "@/components/learning/ModuleHub";
import {
  localizedHref,
  localizedLanguageAlternates,
  resolveInterfaceLanguage,
  type InterfaceLanguage,
  type PageSearchParams,
} from "@/lib/language";

type CppHomeCopy = {
  eyebrow: string;
  title: string;
  description: string;
  cta: string;
  modules: ModuleItem[];
};

const cppHomeCopy: Record<InterfaceLanguage, CppHomeCopy> = {
  en: {
    eyebrow: "C++ Learning",
    title: "C++ Training Hub",
    description: "Classified question sets, code reading, output prediction and beginner algorithms without online execution.",
    cta: "Open C++ path",
    modules: [
      { href: "/cpp/basics", eyebrow: "Basics", title: "Syntax And Types", description: "Variables, input output, branches, loops, functions and dense code reading practice.", points: ["variables", "input output", "branches", "loops", "functions"] },
      { href: "/cpp/oop", eyebrow: "OOP", title: "Object Oriented C++", description: "Class, public private, constructors, inheritance and object state.", points: ["class", "access", "constructor", "inheritance"] },
      { href: "/cpp/stl", eyebrow: "STL", title: "STL Containers", description: "Vector, map, set, queue, stack and common contest style code reading.", points: ["vector", "map", "set", "queue", "stack"] },
      { href: "/cpp/quiz/mega-1000", eyebrow: "Question Bank", title: "C++ Classified Question Bank", description: "Searchable topic table with choice, fill blank, code reading and output prediction.", points: ["syntax", "control flow", "STL", "algorithms"] },
    ],
  },
  zh: {
    eyebrow: "C++ 学习",
    title: "C++ 题库训练中心",
    description: "分类题库 代码阅读 输出预测 基础算法 先不做在线编译器",
    cta: "打开 C++ 路径",
    modules: [
      { href: "/cpp/basics", eyebrow: "基础", title: "语法和类型", description: "变量 输入输出 分支 循环 函数和密集代码阅读练习", points: ["变量", "输入输出", "分支", "循环", "函数"] },
      { href: "/cpp/oop", eyebrow: "面向对象", title: "C++ 面向对象", description: "Class public private constructor inheritance 和对象状态", points: ["class", "访问控制", "构造函数", "继承"] },
      { href: "/cpp/stl", eyebrow: "STL", title: "STL 容器", description: "Vector map set queue stack 和常见竞赛读代码操作", points: ["vector", "map", "set", "queue", "stack"] },
      { href: "/cpp/quiz/mega-1000", eyebrow: "题库", title: "C++ 分类题库", description: "可搜索题目表 选择题 填空题 代码阅读 输出预测 题库持续扩充", points: ["语法", "控制流", "STL", "算法"] },
    ],
  },
  ja: {
    eyebrow: "C++ 学習",
    title: "C++ トレーニングハブ",
    description: "分類問題 コード読解 出力予測 初級アルゴリズムをオンライン実行なしで練習します",
    cta: "C++ パスを開く",
    modules: [
      { href: "/cpp/basics", eyebrow: "基礎", title: "構文と型", description: "変数 入出力 分岐 ループ 関数とコード読解を練習します", points: ["変数", "入出力", "分岐", "ループ", "関数"] },
      { href: "/cpp/oop", eyebrow: "OOP", title: "C++ オブジェクト指向", description: "class public private constructor inheritance とオブジェクト状態を学びます", points: ["class", "アクセス", "コンストラクタ", "継承"] },
      { href: "/cpp/stl", eyebrow: "STL", title: "STL コンテナ", description: "vector map set queue stack とよくあるコード読解を扱います", points: ["vector", "map", "set", "queue", "stack"] },
      { href: "/cpp/quiz/mega-1000", eyebrow: "問題庫", title: "C++ 分類問題庫", description: "検索できる問題表で選択 穴埋め コード読解 出力予測を練習します", points: ["構文", "制御", "STL", "アルゴリズム"] },
    ],
  },
  ko: {
    eyebrow: "C++ 학습",
    title: "C++ 훈련 허브",
    description: "분류 문제 코드 읽기 출력 예측 기초 알고리즘을 온라인 실행 없이 연습합니다",
    cta: "C++ 경로 열기",
    modules: [
      { href: "/cpp/basics", eyebrow: "기초", title: "문법과 타입", description: "변수 입출력 조건 반복 함수와 코드 읽기 연습", points: ["변수", "입출력", "조건", "반복", "함수"] },
      { href: "/cpp/oop", eyebrow: "OOP", title: "C++ 객체 지향", description: "class public private constructor inheritance 와 객체 상태", points: ["class", "접근", "생성자", "상속"] },
      { href: "/cpp/stl", eyebrow: "STL", title: "STL 컨테이너", description: "vector map set queue stack 과 자주 나오는 코드 읽기", points: ["vector", "map", "set", "queue", "stack"] },
      { href: "/cpp/quiz/mega-1000", eyebrow: "문제 은행", title: "C++ 분류 문제 은행", description: "검색 가능한 문제표에서 선택 빈칸 코드 읽기 출력 예측을 연습합니다", points: ["문법", "제어 흐름", "STL", "알고리즘"] },
    ],
  },
  es: {
    eyebrow: "Aprendizaje C++",
    title: "Centro de entrenamiento C++",
    description: "Banco clasificado, lectura de codigo, prediccion de salida y algoritmos iniciales sin ejecucion en linea.",
    cta: "Abrir ruta C++",
    modules: [
      { href: "/cpp/basics", eyebrow: "Base", title: "Sintaxis y tipos", description: "Variables, entrada salida, ramas, bucles, funciones y lectura de codigo.", points: ["variables", "entrada salida", "ramas", "bucles", "funciones"] },
      { href: "/cpp/oop", eyebrow: "OOP", title: "C++ orientado a objetos", description: "Class, public private, constructores, herencia y estado de objetos.", points: ["class", "acceso", "constructor", "herencia"] },
      { href: "/cpp/stl", eyebrow: "STL", title: "Contenedores STL", description: "Vector, map, set, queue, stack y lectura de codigo comun.", points: ["vector", "map", "set", "queue", "stack"] },
      { href: "/cpp/quiz/mega-1000", eyebrow: "Preguntas", title: "Banco de preguntas C++", description: "Tabla buscable con opcion multiple, espacios, lectura de codigo y prediccion.", points: ["sintaxis", "control", "STL", "algoritmos"] },
    ],
  },
  fr: {
    eyebrow: "Apprentissage C++",
    title: "Centre d entrainement C++",
    description: "Questions classees, lecture de code, prediction de sortie et algorithmes debutants sans execution en ligne.",
    cta: "Ouvrir le parcours C++",
    modules: [
      { href: "/cpp/basics", eyebrow: "Bases", title: "Syntaxe et types", description: "Variables, entree sortie, conditions, boucles, fonctions et lecture de code.", points: ["variables", "entree sortie", "conditions", "boucles", "fonctions"] },
      { href: "/cpp/oop", eyebrow: "OOP", title: "C++ oriente objet", description: "Class, public private, constructeurs, heritage et etat d objet.", points: ["class", "acces", "constructeur", "heritage"] },
      { href: "/cpp/stl", eyebrow: "STL", title: "Conteneurs STL", description: "Vector, map, set, queue, stack et lecture de code courante.", points: ["vector", "map", "set", "queue", "stack"] },
      { href: "/cpp/quiz/mega-1000", eyebrow: "Questions", title: "Banque de questions C++", description: "Table recherchable avec choix, trous, lecture de code et prediction de sortie.", points: ["syntaxe", "controle", "STL", "algorithmes"] },
    ],
  },
  de: {
    eyebrow: "C++ Lernen",
    title: "C++ Trainingszentrum",
    description: "Klassifizierte Fragen, Code lesen, Ausgabe vorhersagen und Einsteigeralgorithmen ohne Online Ausfuehrung.",
    cta: "C++ Pfad oeffnen",
    modules: [
      { href: "/cpp/basics", eyebrow: "Grundlagen", title: "Syntax und Typen", description: "Variablen, Eingabe Ausgabe, Verzweigungen, Schleifen, Funktionen und Code lesen.", points: ["Variablen", "Eingabe Ausgabe", "Verzweigungen", "Schleifen", "Funktionen"] },
      { href: "/cpp/oop", eyebrow: "OOP", title: "Objektorientiertes C++", description: "Class, public private, Konstruktoren, Vererbung und Objektzustand.", points: ["class", "Zugriff", "Konstruktor", "Vererbung"] },
      { href: "/cpp/stl", eyebrow: "STL", title: "STL Container", description: "Vector, map, set, queue, stack und haeufiges Code Lesen.", points: ["vector", "map", "set", "queue", "stack"] },
      { href: "/cpp/quiz/mega-1000", eyebrow: "Fragenbank", title: "C++ Fragenbank", description: "Durchsuchbare Tabelle mit Auswahl, Luecken, Code Lesen und Ausgabevorhersage.", points: ["Syntax", "Kontrolle", "STL", "Algorithmen"] },
    ],
  },
  pt: {
    eyebrow: "Aprender C++",
    title: "Centro de treino C++",
    description: "Banco classificado, leitura de codigo, previsao de saida e algoritmos iniciais sem execucao online.",
    cta: "Abrir trilha C++",
    modules: [
      { href: "/cpp/basics", eyebrow: "Base", title: "Sintaxe e tipos", description: "Variaveis, entrada saida, decisoes, lacos, funcoes e leitura de codigo.", points: ["variaveis", "entrada saida", "decisoes", "lacos", "funcoes"] },
      { href: "/cpp/oop", eyebrow: "OOP", title: "C++ orientado a objetos", description: "Class, public private, construtores, heranca e estado de objeto.", points: ["class", "acesso", "construtor", "heranca"] },
      { href: "/cpp/stl", eyebrow: "STL", title: "Containers STL", description: "Vector, map, set, queue, stack e leitura de codigo comum.", points: ["vector", "map", "set", "queue", "stack"] },
      { href: "/cpp/quiz/mega-1000", eyebrow: "Questoes", title: "Banco de questoes C++", description: "Tabela pesquisavel com escolha, lacunas, leitura de codigo e previsao.", points: ["sintaxe", "controle", "STL", "algoritmos"] },
    ],
  },
  ru: {
    eyebrow: "Изучение C++",
    title: "Тренировочный центр C++",
    description: "Классифицированные вопросы, чтение кода, прогноз вывода и базовые алгоритмы без онлайн запуска.",
    cta: "Открыть путь C++",
    modules: [
      { href: "/cpp/basics", eyebrow: "Основы", title: "Синтаксис и типы", description: "Переменные, ввод вывод, ветвления, циклы, функции и чтение кода.", points: ["переменные", "ввод вывод", "ветвления", "циклы", "функции"] },
      { href: "/cpp/oop", eyebrow: "OOP", title: "Объектный C++", description: "Class, public private, конструкторы, наследование и состояние объекта.", points: ["class", "доступ", "конструктор", "наследование"] },
      { href: "/cpp/stl", eyebrow: "STL", title: "Контейнеры STL", description: "Vector, map, set, queue, stack и типичное чтение кода.", points: ["vector", "map", "set", "queue", "stack"] },
      { href: "/cpp/quiz/mega-1000", eyebrow: "Банк вопросов", title: "Банк вопросов C++", description: "Поисковая таблица с выбором, пропусками, чтением кода и прогнозом вывода.", points: ["синтаксис", "контроль", "STL", "алгоритмы"] },
    ],
  },
  ar: {
    eyebrow: "تعلم C++",
    title: "مركز تدريب C++",
    description: "بنك أسئلة مصنف وقراءة كود وتوقع مخرجات وخوارزميات للمبتدئين بدون تشغيل كود على الإنترنت",
    cta: "افتح مسار C++",
    modules: [
      { href: "/cpp/basics", eyebrow: "الأساسيات", title: "الصياغة والأنواع", description: "متغيرات وإدخال وإخراج وتفرعات وحلقات ودوال مع قراءة كود مكثفة", points: ["متغيرات", "إدخال", "تفرعات", "حلقات", "دوال"] },
      { href: "/cpp/oop", eyebrow: "OOP", title: "البرمجة الكائنية في C++", description: "class و public private و constructor و inheritance وحالة الكائن", points: ["class", "access", "constructor", "inheritance"] },
      { href: "/cpp/stl", eyebrow: "STL", title: "حاويات STL", description: "vector و map و set و queue و stack وقراءة كود شائعة", points: ["vector", "map", "set", "queue", "stack"] },
      { href: "/cpp/quiz/mega-1000", eyebrow: "بنك الأسئلة", title: "بنك أسئلة C++ مصنف", description: "جدول أسئلة قابل للبحث مع اختيار وملء فراغ وقراءة كود وتوقع مخرجات", points: ["صياغة", "تحكم", "STL", "خوارزميات"] },
    ],
  },
  hi: {
    eyebrow: "C++ सीखना",
    title: "C++ अभ्यास केंद्र",
    description: "वर्गीकृत प्रश्न, कोड पढ़ना, आउटपुट अनुमान और शुरुआती एल्गोरिदम बिना ऑनलाइन रन के.",
    cta: "C++ पथ खोलें",
    modules: [
      { href: "/cpp/basics", eyebrow: "आधार", title: "सिंटैक्स और टाइप", description: "वेरिएबल, इनपुट आउटपुट, शाखाएं, लूप, फंक्शन और कोड रीडिंग.", points: ["वेरिएबल", "इनपुट आउटपुट", "शाखाएं", "लूप", "फंक्शन"] },
      { href: "/cpp/oop", eyebrow: "OOP", title: "ऑब्जेक्ट ओरिएंटेड C++", description: "Class, public private, constructor, inheritance और object state.", points: ["class", "access", "constructor", "inheritance"] },
      { href: "/cpp/stl", eyebrow: "STL", title: "STL कंटेनर", description: "Vector, map, set, queue, stack और आम कोड रीडिंग.", points: ["vector", "map", "set", "queue", "stack"] },
      { href: "/cpp/quiz/mega-1000", eyebrow: "प्रश्न बैंक", title: "C++ वर्गीकृत प्रश्न बैंक", description: "खोज योग्य तालिका में choice, fill blank, code reading और output prediction.", points: ["syntax", "control", "STL", "algorithms"] },
    ],
  },
  id: {
    eyebrow: "Belajar C++",
    title: "Pusat latihan C++",
    description: "Bank soal terklasifikasi, baca kode, prediksi keluaran dan algoritma dasar tanpa eksekusi online.",
    cta: "Buka jalur C++",
    modules: [
      { href: "/cpp/basics", eyebrow: "Dasar", title: "Sintaks dan tipe", description: "Variabel, input output, cabang, loop, fungsi dan latihan baca kode.", points: ["variabel", "input output", "cabang", "loop", "fungsi"] },
      { href: "/cpp/oop", eyebrow: "OOP", title: "C++ berorientasi objek", description: "Class, public private, konstruktor, pewarisan dan status objek.", points: ["class", "akses", "konstruktor", "pewarisan"] },
      { href: "/cpp/stl", eyebrow: "STL", title: "Container STL", description: "Vector, map, set, queue, stack dan baca kode umum.", points: ["vector", "map", "set", "queue", "stack"] },
      { href: "/cpp/quiz/mega-1000", eyebrow: "Bank soal", title: "Bank soal C++", description: "Tabel dapat dicari dengan pilihan, isian, baca kode dan prediksi keluaran.", points: ["sintaks", "kontrol", "STL", "algoritma"] },
    ],
  },
  vi: {
    eyebrow: "Hoc C++",
    title: "Trung tam luyen C++",
    description: "Ngan hang cau hoi phan loai, doc ma, doan dau ra va thuat toan co ban khong chay online.",
    cta: "Mo lo trinh C++",
    modules: [
      { href: "/cpp/basics", eyebrow: "Co ban", title: "Cu phap va kieu", description: "Bien, nhap xuat, nhanh, vong lap, ham va luyen doc ma.", points: ["bien", "nhap xuat", "nhanh", "vong lap", "ham"] },
      { href: "/cpp/oop", eyebrow: "OOP", title: "C++ huong doi tuong", description: "Class, public private, constructor, inheritance va trang thai object.", points: ["class", "access", "constructor", "inheritance"] },
      { href: "/cpp/stl", eyebrow: "STL", title: "Container STL", description: "Vector, map, set, queue, stack va doc ma thuong gap.", points: ["vector", "map", "set", "queue", "stack"] },
      { href: "/cpp/quiz/mega-1000", eyebrow: "Cau hoi", title: "Ngan hang cau hoi C++", description: "Bang cau hoi tim kiem voi lua chon, dien khuyet, doc ma va doan dau ra.", points: ["cu phap", "dieu khien", "STL", "thuat toan"] },
    ],
  },
  th: {
    eyebrow: "เรียน C++",
    title: "ศูนย์ฝึก C++",
    description: "คลังคำถามแยกหมวด อ่านโค้ด ทำนายผลลัพธ์ และอัลกอริทึมพื้นฐานโดยไม่รันออนไลน์",
    cta: "เปิดเส้นทาง C++",
    modules: [
      { href: "/cpp/basics", eyebrow: "พื้นฐาน", title: "ไวยากรณ์และชนิด", description: "ตัวแปร อินพุตเอาต์พุต เงื่อนไข ลูป ฟังก์ชัน และอ่านโค้ด", points: ["ตัวแปร", "อินพุต", "เงื่อนไข", "ลูป", "ฟังก์ชัน"] },
      { href: "/cpp/oop", eyebrow: "OOP", title: "C++ เชิงวัตถุ", description: "Class public private constructor inheritance และสถานะของวัตถุ", points: ["class", "access", "constructor", "inheritance"] },
      { href: "/cpp/stl", eyebrow: "STL", title: "คอนเทนเนอร์ STL", description: "Vector map set queue stack และอ่านโค้ดที่พบบ่อย", points: ["vector", "map", "set", "queue", "stack"] },
      { href: "/cpp/quiz/mega-1000", eyebrow: "คลังคำถาม", title: "คลังคำถาม C++", description: "ตารางค้นหาได้พร้อมตัวเลือก เติมคำ อ่านโค้ด และทำนายผลลัพธ์", points: ["syntax", "control", "STL", "algorithm"] },
    ],
  },
  tr: {
    eyebrow: "C++ ogrenme",
    title: "C++ egitim merkezi",
    description: "Siniflandirilmis soru bankasi, kod okuma, cikti tahmini ve baslangic algoritmalari online calistirma olmadan.",
    cta: "C++ yolunu ac",
    modules: [
      { href: "/cpp/basics", eyebrow: "Temel", title: "Sozdizimi ve tipler", description: "Degiskenler, girdi cikti, kosullar, donguler, fonksiyonlar ve kod okuma.", points: ["degisken", "girdi cikti", "kosul", "dongu", "fonksiyon"] },
      { href: "/cpp/oop", eyebrow: "OOP", title: "Nesne yonelimli C++", description: "Class, public private, constructor, inheritance ve nesne durumu.", points: ["class", "access", "constructor", "inheritance"] },
      { href: "/cpp/stl", eyebrow: "STL", title: "STL container", description: "Vector, map, set, queue, stack ve yaygin kod okuma.", points: ["vector", "map", "set", "queue", "stack"] },
      { href: "/cpp/quiz/mega-1000", eyebrow: "Soru bankasi", title: "C++ soru bankasi", description: "Secim, bosluk, kod okuma ve cikti tahmini icin aranabilir tablo.", points: ["syntax", "kontrol", "STL", "algoritma"] },
    ],
  },
  it: {
    eyebrow: "Studio C++",
    title: "Centro pratica C++",
    description: "Domande classificate, lettura codice, previsione output e algoritmi base senza esecuzione online.",
    cta: "Apri percorso C++",
    modules: [
      { href: "/cpp/basics", eyebrow: "Base", title: "Sintassi e tipi", description: "Variabili, input output, rami, cicli, funzioni e lettura codice.", points: ["variabili", "input output", "rami", "cicli", "funzioni"] },
      { href: "/cpp/oop", eyebrow: "OOP", title: "C++ a oggetti", description: "Class, public private, costruttori, ereditarieta e stato oggetto.", points: ["class", "accesso", "costruttore", "ereditarieta"] },
      { href: "/cpp/stl", eyebrow: "STL", title: "Container STL", description: "Vector, map, set, queue, stack e lettura codice comune.", points: ["vector", "map", "set", "queue", "stack"] },
      { href: "/cpp/quiz/mega-1000", eyebrow: "Domande", title: "Banca domande C++", description: "Tabella cercabile con scelta, completamento, lettura codice e previsione.", points: ["sintassi", "controllo", "STL", "algoritmi"] },
    ],
  },
  nl: {
    eyebrow: "C++ leren",
    title: "C++ trainingshub",
    description: "Geklasseerde vragen, code lezen, uitvoer voorspellen en basisalgoritmen zonder online uitvoering.",
    cta: "Open C++ pad",
    modules: [
      { href: "/cpp/basics", eyebrow: "Basis", title: "Syntaxis en typen", description: "Variabelen, input output, takken, lussen, functies en code lezen.", points: ["variabelen", "input output", "takken", "lussen", "functies"] },
      { href: "/cpp/oop", eyebrow: "OOP", title: "Objectgericht C++", description: "Class, public private, constructors, inheritance en objectstatus.", points: ["class", "toegang", "constructor", "inheritance"] },
      { href: "/cpp/stl", eyebrow: "STL", title: "STL containers", description: "Vector, map, set, queue, stack en veelvoorkomende code lezen.", points: ["vector", "map", "set", "queue", "stack"] },
      { href: "/cpp/quiz/mega-1000", eyebrow: "Vragenbank", title: "C++ vragenbank", description: "Doorzoekbare tabel met keuze, invullen, code lezen en uitvoer voorspellen.", points: ["syntaxis", "controle", "STL", "algoritmen"] },
    ],
  },
  pl: {
    eyebrow: "Nauka C++",
    title: "Centrum treningu C++",
    description: "Klasyfikowane pytania, czytanie kodu, przewidywanie wyjscia i podstawowe algorytmy bez uruchamiania online.",
    cta: "Otworz sciezke C++",
    modules: [
      { href: "/cpp/basics", eyebrow: "Podstawy", title: "Skladnia i typy", description: "Zmienne, wejscie wyjscie, warunki, petle, funkcje i czytanie kodu.", points: ["zmienne", "wejscie wyjscie", "warunki", "petle", "funkcje"] },
      { href: "/cpp/oop", eyebrow: "OOP", title: "C++ obiektowy", description: "Class, public private, konstruktory, dziedziczenie i stan obiektu.", points: ["class", "dostep", "konstruktor", "dziedziczenie"] },
      { href: "/cpp/stl", eyebrow: "STL", title: "Kontenery STL", description: "Vector, map, set, queue, stack i typowe czytanie kodu.", points: ["vector", "map", "set", "queue", "stack"] },
      { href: "/cpp/quiz/mega-1000", eyebrow: "Pytania", title: "Bank pytan C++", description: "Tabela do wyszukiwania z wyborem, lukami, czytaniem kodu i przewidywaniem.", points: ["skladnia", "kontrola", "STL", "algorytmy"] },
    ],
  },
};

export async function generateMetadata({
  searchParams,
}: {
  searchParams?: Promise<PageSearchParams>;
}): Promise<Metadata> {
  const language = resolveInterfaceLanguage(searchParams ? await searchParams : undefined);
  const pageCopy = cppHomeCopy[language];
  const canonical = localizedHref("/cpp", language);

  return {
    title: `${pageCopy.title} - JinMing Lab`,
    description: pageCopy.description,
    alternates: {
      canonical,
      languages: localizedLanguageAlternates("/cpp"),
    },
    openGraph: {
      title: `${pageCopy.title} - JinMing Lab`,
      description: pageCopy.description,
      url: `https://vantaapi.com${canonical}`,
      siteName: "JinMing Lab",
      type: "website",
    },
  };
}

export default async function CppHome({ searchParams }: { searchParams?: Promise<PageSearchParams> }) {
  const language = resolveInterfaceLanguage(searchParams ? await searchParams : undefined);
  const pageCopy = cppHomeCopy[language];

  return (
    <ModuleHub
      eyebrow={pageCopy.eyebrow}
      title={pageCopy.title}
      description={pageCopy.description}
      modules={pageCopy.modules}
      ctaHref="/learn/cpp"
      ctaLabel={pageCopy.cta}
      language={language}
    />
  );
}
