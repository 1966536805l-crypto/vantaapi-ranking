import { ModuleDetail } from "@/components/learning/ModuleHub";
import { resolveInterfaceLanguage, type InterfaceLanguage, type PageSearchParams } from "@/lib/language";

const copy = {
  en: {
    eyebrow: "C++ OOP",
    title: "Object Oriented C++",
    description: "class object public private constructors members and inheritance.",
    sections: [
      { title: "Core concepts", body: "A class groups state and behavior. Access control decides what outside code can touch." },
      { title: "Practice goal", body: "Read class definitions predict object state and understand constructor order." },
    ],
  },
  zh: {
    eyebrow: "C++ 面向对象",
    title: "对象 类和访问控制",
    description: "class object public private constructor member inheritance 按读代码方式学习",
    sections: [
      { title: "核心概念", body: "class 把状态和行为放在一起 public private 决定外部代码能不能访问成员" },
      { title: "练习目标", body: "读懂类定义 判断对象状态 理解构造顺序和成员调用" },
    ],
  },
  ja: {
    eyebrow: "C++ OOP",
    title: "オブジェクト指向 C++",
    description: "class object public private constructor member inheritance をコード読解で学びます",
    sections: [
      { title: "中心概念", body: "class は状態と動作をまとめます public private は外部コードから触れる範囲を決めます" },
      { title: "練習目標", body: "クラス定義を読み オブジェクト状態とコンストラクタ順序を予測します" },
    ],
  },
  ar: {
    eyebrow: "كائنية C++",
    title: "البرمجة الكائنية في C++",
    description: "class و object و public private و constructor و members و inheritance",
    sections: [
      { title: "المفاهيم الأساسية", body: "class يجمع الحالة والسلوك و public private يحددان ما يمكن للكود الخارجي الوصول إليه" },
      { title: "هدف التدريب", body: "اقرأ تعريفات class وتوقع حالة object وافهم ترتيب constructor" },
    ],
  },
};

function copyLanguage(language: InterfaceLanguage) {
  return language === "zh" || language === "ja" || language === "ar" ? language : "en";
}

export default async function Page({ searchParams }: { searchParams?: Promise<PageSearchParams> }) {
  const language = resolveInterfaceLanguage(searchParams ? await searchParams : undefined);
  const pageCopy = copy[copyLanguage(language)];

  return <ModuleDetail {...pageCopy} practiceHref="/cpp/quiz/oop" language={language} />;
}
