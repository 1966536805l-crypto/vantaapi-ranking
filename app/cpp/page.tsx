import { ModuleHub } from "@/components/learning/ModuleHub";
import { cppQuestionBank } from "@/lib/exam-content";
import { resolveLanguage, type PageSearchParams, type SiteLanguage } from "@/lib/language";

const modules: Record<SiteLanguage, Parameters<typeof ModuleHub>[0]["modules"]> = {
  en: [
    { href: "/cpp/basics", eyebrow: "Basics", title: "Syntax And Types", description: "Variables input output branches loops and functions with dense code reading practice", points: ["variables", "input output", "branches", "loops", "functions"] },
    { href: "/cpp/oop", eyebrow: "OOP", title: "Object Oriented C++", description: "class public private constructor inheritance and object state", points: ["class", "access", "constructor", "inheritance"] },
    { href: "/cpp/stl", eyebrow: "STL", title: "STL Containers", description: "vector map set queue stack and common contest style code reading operations", points: ["vector", "map", "set", "queue", "stack"] },
    { href: "/cpp/quiz/mega-1000", eyebrow: "Mega Bank", title: cppQuestionBank.title, description: "8 categories 125 questions each covering syntax control flow arrays strings pointers references OOP STL algorithms and output prediction", points: cppQuestionBank.categoryPlan.map((item) => item.title) },
  ],
  zh: [
    { href: "/cpp/basics", eyebrow: "基础", title: "语法和类型", description: "变量 输入输出 分支 循环 函数 配合代码阅读练习", points: ["变量", "输入输出", "分支", "循环", "函数"] },
    { href: "/cpp/oop", eyebrow: "面向对象", title: "C++ 面向对象", description: "class public private constructor inheritance 和对象状态", points: ["class", "访问控制", "构造函数", "继承"] },
    { href: "/cpp/stl", eyebrow: "STL", title: "STL 容器", description: "vector map set queue stack 和常见竞赛读代码操作", points: ["vector", "map", "set", "queue", "stack"] },
    { href: "/cpp/quiz/mega-1000", eyebrow: "千题库", title: "C++ 1000 题库", description: "8 个分类 每类 125 题 覆盖语法 控制流 数组字符串 指针引用 OOP STL 算法 输出预测", points: cppQuestionBank.categoryPlan.map((item) => item.zh) },
  ],
};

const copy = {
  en: {
    eyebrow: "C++ Learning",
    title: "C++ Training Hub",
    description: "The MVP does not use an online compiler yet The first release focuses on a 1000 question bank code reading output prediction and beginner algorithms",
    cta: "Open course path",
  },
  zh: {
    eyebrow: "C++ 学习",
    title: "C++ 题库训练中心",
    description: "MVP 暂不做在线编译器 第一版重点是 1000 道静态题库 代码阅读 输出预测和基础算法",
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
