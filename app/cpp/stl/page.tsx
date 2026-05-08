import { ModuleDetail } from "@/components/learning/ModuleHub";
import { resolveInterfaceLanguage, type InterfaceLanguage, type PageSearchParams } from "@/lib/language";

const copy = {
  en: {
    eyebrow: "C++ STL",
    title: "STL Containers",
    description: "vector map set queue stack and common operations.",
    sections: [
      { title: "Containers", body: "vector map set queue and stack cover most beginner storage patterns.", examples: ["vector<int> a; a.push_back(1);", "map<string, int> count;"] },
      { title: "Practice", body: "Choose the right container read short snippets and predict output." },
    ],
  },
  zh: {
    eyebrow: "C++ STL",
    title: "STL 容器",
    description: "vector map set queue stack 以及常见操作",
    sections: [
      { title: "容器", body: "vector map set queue stack 覆盖多数初学者常见存储场景 先学什么时候用 再学怎么读代码", examples: ["vector<int> a; a.push_back(1);", "map<string, int> count;"] },
      { title: "练习", body: "选择合适容器 阅读短代码片段 并预测输出结果" },
    ],
  },
  ja: {
    eyebrow: "C++ STL",
    title: "STL コンテナ",
    description: "vector map set queue stack とよく使う操作を学びます",
    sections: [
      { title: "コンテナ", body: "vector map set queue stack は初級の保存パターンの多くをカバーします 使いどころとコード読解を一緒に練習します", examples: ["vector<int> a; a.push_back(1);", "map<string, int> count;"] },
      { title: "練習", body: "適切なコンテナを選び 短いコードを読み 出力を予測します" },
    ],
  },
  ar: {
    eyebrow: "C++ STL",
    title: "حاويات STL",
    description: "vector و map و set و queue و stack والعمليات الشائعة",
    sections: [
      { title: "الحاويات", body: "vector و map و set و queue و stack تغطي معظم أنماط التخزين للمبتدئين", examples: ["vector<int> a; a.push_back(1);", "map<string, int> count;"] },
      { title: "التدريب", body: "اختر الحاوية المناسبة واقرأ مقاطع قصيرة وتوقع المخرجات" },
    ],
  },
};

function copyLanguage(language: InterfaceLanguage) {
  return language === "zh" || language === "ja" || language === "ar" ? language : "en";
}

export default async function Page({ searchParams }: { searchParams?: Promise<PageSearchParams> }) {
  const language = resolveInterfaceLanguage(searchParams ? await searchParams : undefined);
  const pageCopy = copy[copyLanguage(language)];

  return <ModuleDetail {...pageCopy} practiceHref="/cpp/quiz/stl" language={language} />;
}
