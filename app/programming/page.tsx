import Link from "next/link";
import { AppleStudyHeader } from "@/components/learning/ModuleHub";
import { localizedHref, resolveLanguage, type PageSearchParams } from "@/lib/language";
import { programmingLanguages, type ProgrammingLanguage, type ProgrammingLanguageSlug } from "@/lib/programming-content";

export const metadata = {
  title: "Programming Language Learning Lab - JinMing Lab",
  description: "Zero foundation programming paths with beginner concepts tutorials drills hints answers and practice workbenches",
};

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
    slugs: ["html-css", "javascript", "typescript", "php", "ruby"],
  },
  {
    key: "backend",
    title: "Backend And Cloud",
    zh: "后端和云服务",
    summary: "Build services · Databases · CLIs · Reliable APIs",
    summaryZh: "做服务 · 数据库 · 命令行 · 稳定 API",
    slugs: ["python", "java", "go", "csharp", "sql", "bash"],
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
    slugs: ["c", "cpp", "rust", "assembly"],
  },
  {
    key: "data",
    title: "Data And Science",
    zh: "数据和科学计算",
    summary: "Analyze data · Model numbers · Research workflows",
    summaryZh: "分析数据 · 建模 · 数值处理 · 研究流程",
    slugs: ["python", "r", "julia", "matlab", "scala"],
  },
  {
    key: "functional",
    title: "Functional And Language Design",
    zh: "函数式和语言设计",
    summary: "Learn types · Transformations · Concurrency · Compiler thinking",
    summaryZh: "学习类型 · 转换 · 并发 · 编译器思维",
    slugs: ["haskell", "clojure", "elixir", "erlang", "fsharp", "ocaml"],
  },
  {
    key: "scripting",
    title: "Scripting And Automation",
    zh: "脚本和自动化",
    summary: "Automate files · Text · Games · Plugins · Daily workflows",
    summaryZh: "自动化文件 · 文本 · 游戏 · 插件 · 日常流程",
    slugs: ["bash", "python", "lua", "perl", "ruby"],
  },
  {
    key: "blockchain",
    title: "Contracts And Security",
    zh: "合约和安全",
    summary: "Study state · Permissions · Transactions · Secure code review",
    summaryZh: "学习状态 · 权限 · 交易 · 安全代码审查",
    slugs: ["solidity", "javascript", "typescript", "rust"],
  },
];

const copy = {
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
} as const;

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
  const language = resolveLanguage(searchParams ? await searchParams : undefined);
  const t = copy[language];

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
              <p className="mt-1 text-3xl font-semibold">{zeroSteps[language].length}</p>
            </div>
          </div>
        </div>

        <section className="mt-6">
          <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="eyebrow">{t.zeroEyebrow}</p>
              <h2 className="mt-2 text-2xl font-semibold">{t.zeroTitle}</h2>
            </div>
            <span className="dense-status">choice · fill blank · build tasks</span>
          </div>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {zeroSteps[language].map((step) => (
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
              {groups.map((group) => (
                <div key={group.key} className="rounded-[8px] border border-white/10 bg-white/[0.07] p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <h3 className="font-semibold text-white">{language === "zh" ? group.zh : group.title}</h3>
                      <p className="mt-1 text-xs leading-5 text-slate-300">{language === "zh" ? group.summaryZh : group.summary}</p>
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
              ))}
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
                  <p className="mt-3 line-clamp-2 text-sm leading-6 text-[color:var(--muted)]">{item.role}</p>
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
