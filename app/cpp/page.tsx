import { ModuleHub } from "@/components/learning/ModuleHub";
import { resolveLanguage, type PageSearchParams, type SiteLanguage } from "@/lib/language";

const modules: Record<SiteLanguage, Parameters<typeof ModuleHub>[0]["modules"]> = {
  en: [
    { href: "/cpp/basics", eyebrow: "Basics", title: "Syntax And Types", description: "Variables · Input/output · Branches · Loops · Functions · Dense code reading practice", points: ["variables", "input output", "branches", "loops", "functions"] },
    { href: "/cpp/oop", eyebrow: "OOP", title: "Object Oriented C++", description: "Class · Public/private · Constructor · Inheritance · Object state", points: ["class", "access", "constructor", "inheritance"] },
    { href: "/cpp/stl", eyebrow: "STL", title: "STL Containers", description: "Vector · Map · Set · Queue · Stack · Common contest-style code reading", points: ["vector", "map", "set", "queue", "stack"] },
    { href: "/cpp/quiz/mega-1000", eyebrow: "Question Bank", title: "C++ Classified Question Bank", description: "Searchable topic table · choice · fill blank · code reading · output prediction · expanding practice bank", points: ["syntax", "control flow", "STL", "algorithms"] },
  ],
  zh: [
    { href: "/cpp/basics", eyebrow: "基础", title: "语法和类型", description: "变量 · 输入输出 · 分支 · 循环 · 函数 · 代码阅读练习", points: ["变量", "输入输出", "分支", "循环", "函数"] },
    { href: "/cpp/oop", eyebrow: "面向对象", title: "C++ 面向对象", description: "Class · Public/private · Constructor · Inheritance · 对象状态", points: ["class", "访问控制", "构造函数", "继承"] },
    { href: "/cpp/stl", eyebrow: "STL", title: "STL 容器", description: "Vector · Map · Set · Queue · Stack · 常见竞赛读代码操作", points: ["vector", "map", "set", "queue", "stack"] },
    { href: "/cpp/quiz/mega-1000", eyebrow: "题库", title: "C++ 分类题库", description: "可搜索题目表 · 选择题 · 填空题 · 代码阅读 · 输出预测 · 题库持续扩充", points: ["语法", "控制流", "STL", "算法"] },
  ],
};

const copy = {
  en: {
    eyebrow: "C++ Learning",
    title: "C++ Training Hub",
    description: "Classified question bank · Code reading · Output prediction · Beginner algorithms · No online compiler in MVP",
    cta: "Open course path",
  },
  zh: {
    eyebrow: "C++ 学习",
    title: "C++ 题库训练中心",
    description: "分类题库 · 代码阅读 · 输出预测 · 基础算法 · MVP 暂不做在线编译器",
    cta: "打开学习路径",
  },
} as const;

export default async function CppHome({ searchParams }: { searchParams?: Promise<PageSearchParams> }) {
  const language = resolveLanguage(searchParams ? await searchParams : undefined);
  const pageCopy = copy[language];

  return (
    <ModuleHub
      eyebrow={pageCopy.eyebrow}
      title={pageCopy.title}
      description={pageCopy.description}
      modules={modules[language]}
      ctaHref="/learn/cpp"
      ctaLabel={pageCopy.cta}
      language={language}
    />
  );
}
