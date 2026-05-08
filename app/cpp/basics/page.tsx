import { ModuleDetail } from "@/components/learning/ModuleHub";
import { resolveInterfaceLanguage, type InterfaceLanguage, type PageSearchParams } from "@/lib/language";

const copy = {
  en: {
    eyebrow: "C++ Basics",
    title: "Syntax And Types",
    description: "Variables input output branches loops and functions with dense code reading practice.",
    sections: [
      { title: "Core scope", body: "int double char string cin cout if else for while and functions.", examples: ["int score = 100;", "cout << 3 + 4;"] },
      { title: "Question types", body: "Multiple choice fill blank code reading and output prediction are supported without online execution." },
    ],
  },
  zh: {
    eyebrow: "C++ 基础",
    title: "语法和类型",
    description: "变量 输入输出 分支 循环 函数 配合密集代码阅读练习",
    sections: [
      { title: "核心范围", body: "int double char string cin cout if else for while 和函数 先把输入 输出 变量变化看清楚", examples: ["int score = 100;", "cout << 3 + 4;"] },
      { title: "题型", body: "支持选择 填空 代码阅读 输出预测 第一版不做在线运行" },
    ],
  },
  ja: {
    eyebrow: "C++ 基礎",
    title: "構文と型",
    description: "変数 入出力 分岐 ループ 関数をコード読解と一緒に練習します",
    sections: [
      { title: "中心範囲", body: "int double char string cin cout if else for while 関数を扱い 入力 出力 値の変化を読みます", examples: ["int score = 100;", "cout << 3 + 4;"] },
      { title: "問題形式", body: "選択 穴埋め コード読解 出力予測を扱います 初版ではオンライン実行を使いません" },
    ],
  },
  ar: {
    eyebrow: "أساسيات C++",
    title: "الصياغة والأنواع",
    description: "متغيرات وإدخال وإخراج وتفرعات وحلقات ودوال مع قراءة كود مكثفة",
    sections: [
      { title: "النطاق الأساسي", body: "int و double و char و string و cin و cout و if else و for while والدوال مع التركيز على تغير القيم", examples: ["int score = 100;", "cout << 3 + 4;"] },
      { title: "أنواع الأسئلة", body: "اختيار وملء فراغ وقراءة كود وتوقع مخرجات بدون تشغيل كود على الإنترنت في النسخة الأولى" },
    ],
  },
};

function copyLanguage(language: InterfaceLanguage) {
  return language === "zh" || language === "ja" || language === "ar" ? language : "en";
}

export default async function Page({ searchParams }: { searchParams?: Promise<PageSearchParams> }) {
  const language = resolveInterfaceLanguage(searchParams ? await searchParams : undefined);
  const pageCopy = copy[copyLanguage(language)];

  return <ModuleDetail {...pageCopy} practiceHref="/cpp/quiz/basics" language={language} />;
}
