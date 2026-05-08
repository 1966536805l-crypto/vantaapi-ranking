import { ModuleHub } from "@/components/learning/ModuleHub";
import { bilingualLanguage, resolveInterfaceLanguage, type PageSearchParams, type SiteLanguage } from "@/lib/language";

const modules: Record<SiteLanguage, Parameters<typeof ModuleHub>[0]["modules"]> = {
  en: [
    { href: "/cpp", eyebrow: "C++", title: "C++ Core Track", description: "The English interface keeps the learning entry focused on C++ and code practice", points: ["syntax", "OOP", "STL", "classified bank"] },
    { href: "/programming/cpp", eyebrow: "Workbench", title: "C++ Practice Workbench", description: "Original programming drills keep expanding with choice fill blank practical tasks hints answers and shortcuts", points: ["choice", "fill blank", "build"] },
    { href: "/programming", eyebrow: "Languages", title: "Programming Language Studio", description: "A broad language tutorial desk written in English for programming learners", points: ["tutorials", "examples", "drills", "keyboard"] },
  ],
  zh: [
    { href: "/today", eyebrow: "今日", title: "今日学习", description: "复习 新词 打字 阅读 刷题集中在一页 打开就知道下一步做什么", points: ["每日队列", "打卡", "本地进度", "不用登录"] },
    { href: "/english/vocabulary/custom", eyebrow: "我的词书", title: "自定义词书", description: "自己导入单词 标签分组 搜索筛选 JSON 备份 并直接进入背词训练", points: ["批量导入", "标签", "四选一", "艾宾浩斯"] },
    { href: "/english/typing", eyebrow: "打字", title: "英文听写打字", description: "听音后输入英文 单词和句子都必须打对才过关 错了自动重听", points: ["听音打字", "错了重听", "本地进度", "不用登录"] },
    { href: "/english/vocabulary", eyebrow: "词汇", title: "考试词汇", description: "初中 高中 雅思 托福 四级 六级 考研词汇 重点词和句式持续扩充", points: ["初中词汇", "高中词汇", "雅思托福", "四六级考研"] },
    { href: "/english/grammar", eyebrow: "语法", title: "语法系统", description: "短规则 例句 判断题 选择题 组合成可持续练习", points: ["规则", "例句", "判断", "选择"] },
    { href: "/english/reading", eyebrow: "阅读", title: "原创文章库", description: "初中 高中 雅思 托福方向原创阅读持续扩充 不收录官方试卷内容", points: ["原创文章", "分级阅读", "雅思托福"] },
    { href: "/english/question-bank", eyebrow: "题库", title: "原创选择填空题库", description: "雅思 托福和各年级选择填空题持续扩充 全部站内原创", points: ["选择题", "填空题", "原创题库"] },
    { href: "/english/quiz/basic", eyebrow: "测验", title: "英语测验", description: "自动判分 答案解析 错题收藏 复习闭环", points: ["自动判分", "错题本", "复习"] },
  ],
};

const copy = {
  en: {
    eyebrow: "Code Learning",
    title: "Programming Training Hub",
    description: "English learning content is available in the Chinese interface. The English interface focuses on C++ and programming practice.",
    cta: "Open C++ path",
  },
  zh: {
    eyebrow: "英语学习",
    title: "英语训练中心",
    description: "考试词汇 语法 阅读 测验 进度追踪和复习闭环集中在一条路径里",
    cta: "打开学习路径",
  },
} as const;

export default async function EnglishHome({ searchParams }: { searchParams?: Promise<PageSearchParams> }) {
  const language = resolveInterfaceLanguage(searchParams ? await searchParams : undefined);
  const copyLanguage = bilingualLanguage(language);
  const pageCopy = copy[copyLanguage];

  return (
    <ModuleHub
      eyebrow={pageCopy.eyebrow}
      title={pageCopy.title}
      description={pageCopy.description}
      modules={modules[copyLanguage]}
      ctaHref={copyLanguage === "zh" ? "/learn/english" : "/cpp"}
      ctaLabel={pageCopy.cta}
      language={language}
    />
  );
}
