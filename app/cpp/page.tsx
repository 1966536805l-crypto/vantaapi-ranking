import { ModuleHub, type ModuleItem } from "@/components/learning/ModuleHub";
import { resolveInterfaceLanguage, type InterfaceLanguage, type PageSearchParams } from "@/lib/language";

type CppHomeCopy = {
  eyebrow: string;
  title: string;
  description: string;
  cta: string;
  modules: ModuleItem[];
};

const cppHomeCopy: Record<"en" | "zh" | "ja" | "ar", CppHomeCopy> = {
  en: {
    eyebrow: "C++ Learning",
    title: "C++ Training Hub",
    description: "Classified question bank, code reading, output prediction and beginner algorithms without online execution in the MVP.",
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
    description: "分类题库 代码阅读 输出预测 基础算法 MVP 暂不做在线编译器",
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
  ar: {
    eyebrow: "تعلم C++",
    title: "مركز تدريب C++",
    description: "بنك أسئلة مصنف وقراءة كود وتوقع مخرجات وخوارزميات للمبتدئين بدون تشغيل كود على الإنترنت في MVP",
    cta: "افتح مسار C++",
    modules: [
      { href: "/cpp/basics", eyebrow: "الأساسيات", title: "الصياغة والأنواع", description: "متغيرات وإدخال وإخراج وتفرعات وحلقات ودوال مع قراءة كود مكثفة", points: ["متغيرات", "إدخال", "تفرعات", "حلقات", "دوال"] },
      { href: "/cpp/oop", eyebrow: "OOP", title: "البرمجة الكائنية في C++", description: "class و public private و constructor و inheritance وحالة الكائن", points: ["class", "access", "constructor", "inheritance"] },
      { href: "/cpp/stl", eyebrow: "STL", title: "حاويات STL", description: "vector و map و set و queue و stack وقراءة كود شائعة", points: ["vector", "map", "set", "queue", "stack"] },
      { href: "/cpp/quiz/mega-1000", eyebrow: "بنك الأسئلة", title: "بنك أسئلة C++ مصنف", description: "جدول أسئلة قابل للبحث مع اختيار وملء فراغ وقراءة كود وتوقع مخرجات", points: ["صياغة", "تحكم", "STL", "خوارزميات"] },
    ],
  },
};

function homeLanguage(language: InterfaceLanguage) {
  return language === "zh" || language === "ja" || language === "ar" ? language : "en";
}

export default async function CppHome({ searchParams }: { searchParams?: Promise<PageSearchParams> }) {
  const language = resolveInterfaceLanguage(searchParams ? await searchParams : undefined);
  const pageCopy = cppHomeCopy[homeLanguage(language)];

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
