import { ModuleDetail } from "@/components/learning/ModuleHub";
import { resolveInterfaceLanguage, type InterfaceLanguage, type PageSearchParams } from "@/lib/language";

const copy = {
  en: {
    eyebrow: "C++ Algorithms",
    title: "Algorithm Basics",
    description: "Simulation arrays strings searching counting and output prediction.",
    sections: [
      { title: "MVP scope", body: "Loop simulation array traversal string processing simple search and counting." },
      { title: "Later scope", body: "Online execution judging leaderboards submissions and solution discussions can be added after the MVP is stable." },
    ],
  },
  zh: {
    eyebrow: "C++ 算法",
    title: "基础算法",
    description: "模拟 数组 字符串 搜索 计数和输出预测",
    sections: [
      { title: "第一版范围", body: "循环模拟 数组遍历 字符串处理 简单搜索 计数和输出预测 先把读题和读代码做稳" },
      { title: "后续范围", body: "在线运行 自动判题 排行榜 提交记录和题解区等到 MVP 稳定后再加" },
    ],
  },
  ja: {
    eyebrow: "C++ アルゴリズム",
    title: "基礎アルゴリズム",
    description: "シミュレーション 配列 文字列 探索 カウント 出力予測",
    sections: [
      { title: "初版の範囲", body: "ループシミュレーション 配列走査 文字列処理 簡単な探索 カウント 出力予測を扱います" },
      { title: "後で追加する範囲", body: "オンライン実行 自動採点 ランキング 提出履歴 解説エリアは MVP 安定後に追加できます" },
    ],
  },
  ar: {
    eyebrow: "خوارزميات C++",
    title: "أساسيات الخوارزميات",
    description: "محاكاة ومصفوفات وسلاسل وبحث وعد وتوقع مخرجات",
    sections: [
      { title: "نطاق النسخة الأولى", body: "محاكاة الحلقات ومرور المصفوفات ومعالجة السلاسل والبحث البسيط والعد وتوقع المخرجات" },
      { title: "نطاق لاحق", body: "تشغيل الكود والتحكيم الآلي والترتيب وسجل الإرسال والشروحات يمكن إضافتها بعد استقرار MVP" },
    ],
  },
};

function copyLanguage(language: InterfaceLanguage) {
  return language === "zh" || language === "ja" || language === "ar" ? language : "en";
}

export default async function Page({ searchParams }: { searchParams?: Promise<PageSearchParams> }) {
  const language = resolveInterfaceLanguage(searchParams ? await searchParams : undefined);
  const pageCopy = copy[copyLanguage(language)];

  return <ModuleDetail {...pageCopy} practiceHref="/cpp/quiz/algorithms" language={language} />;
}
