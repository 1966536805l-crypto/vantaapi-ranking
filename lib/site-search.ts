import { examVocabularyPacks } from "@/lib/exam-content";
import { originalQuestionPacks, originalReadingPacks } from "@/lib/original-english-bank";
import { programmingLanguages } from "@/lib/programming-content";
import { toolDefinitions } from "@/lib/tool-definitions";
import { worldLanguages } from "@/lib/world-language-content";

export type SiteSearchItem = {
  title: string;
  href: string;
  category: string;
  description: string;
  tags: string[];
};

const staticItems: SiteSearchItem[] = [
  {
    title: "Site Search",
    href: "/search",
    category: "Start",
    description: "One search box for tools coding English world languages review and wordbook pages",
    tags: ["search", "find", "入口", "搜索", "全站搜索", "找功能", "找页面"],
  },
  {
    title: "Today Learning Plan",
    href: "/today",
    category: "Review",
    description: "Daily learning queue for vocabulary review typing reading and question practice",
    tags: ["today", "daily", "streak", "review", "今日", "每日学习", "学习计划", "复习队列"],
  },
  {
    title: "My Wordbook",
    href: "/english/vocabulary/custom?lang=zh",
    category: "English",
    description: "Custom wordbook with bulk import tags JSON backup four choice typing audio and Ebbinghaus review",
    tags: ["wordbook", "custom vocabulary", "my words", "我的词书", "自定义词书", "批量导入", "标签", "艾宾浩斯"],
  },
  {
    title: "English Typing System",
    href: "/english/typing?lang=zh",
    category: "English",
    description: "Listen and type English words and original sentences until correct",
    tags: ["typing", "dictation", "spelling", "听写", "打字", "英文打字", "英语打字", "盲打"],
  },
  {
    title: "English Vocabulary",
    href: "/english/vocabulary?lang=zh",
    category: "English",
    description: "Vocabulary packs spelling drills four choice review and daily memory practice",
    tags: ["ielts", "toefl", "cet", "wordbook", "spelling", "英语", "单词", "背单词"],
  },
  {
    title: "English Grammar",
    href: "/english/grammar?lang=zh",
    category: "English",
    description: "Compact grammar notes examples choice drills and review flow",
    tags: ["grammar", "语法", "例句", "判断题", "选择题"],
  },
  {
    title: "English Reading",
    href: "/english/reading?lang=zh",
    category: "English",
    description: "Original reading chapters with questions answers and explanations",
    tags: ["reading", "articles", "原创文章", "阅读"],
  },
  {
    title: "English Original Question Bank",
    href: "/english/question-bank?lang=zh",
    category: "English",
    description: "Original English choice and fill blank question banks for grade IELTS and TOEFL practice",
    tags: ["question bank", "quiz", "原创题库", "选择题", "填空题", "雅思", "托福", "初中", "高中"],
  },
  {
    title: "AI Tools Hub",
    href: "/tools",
    category: "AI Tools",
    description: "Prompt optimizer code explainer bug finder API generator JSON regex timestamp and roadmap tools",
    tags: ["tools", "ai tools", "工具站", "提示词", "代码解释", "bug", "api", "json", "regex"],
  },
  {
    title: "Programming Learning Lab",
    href: "/programming",
    category: "Coding Lab",
    description: "Zero foundation programming map for Python JavaScript TypeScript C++ SQL Bash and more",
    tags: ["programming", "coding", "编程", "0基础", "python", "javascript", "cpp", "sql", "bash"],
  },
  {
    title: "World Languages Hub",
    href: "/languages",
    category: "World Languages",
    description: "World language zero foundation paths for sound script first phrases and daily review",
    tags: ["languages", "world languages", "语言学习", "世界语言", "日语", "西班牙语", "法语", "韩语"],
  },
  {
    title: "C++ Mega Quiz",
    href: "/cpp/quiz/mega-1000",
    category: "C++",
    description: "C++ choice fill blank code reading and output prediction practice",
    tags: ["cpp", "c++", "quiz", "stl", "algorithm", "题库", "选择", "填空", "代码阅读"],
  },
  {
    title: "C++ Basics",
    href: "/cpp/basics",
    category: "C++",
    description: "Variables input output conditions loops functions and first syntax lessons",
    tags: ["cpp", "c++", "basics", "syntax", "基础语法", "变量", "循环", "函数"],
  },
  {
    title: "C++ OOP",
    href: "/cpp/oop",
    category: "C++",
    description: "Class public private constructors inheritance and object oriented basics",
    tags: ["cpp", "c++", "oop", "class", "继承", "面向对象"],
  },
  {
    title: "C++ STL",
    href: "/cpp/stl",
    category: "C++",
    description: "Vector map set queue stack and common standard library patterns",
    tags: ["cpp", "c++", "stl", "vector", "map", "set", "queue", "stack"],
  },
  {
    title: "C++ Algorithms",
    href: "/cpp/algorithms",
    category: "C++",
    description: "Basic algorithm ideas and code reading drills for beginner C++ learners",
    tags: ["cpp", "c++", "algorithm", "算法", "排序", "搜索"],
  },
  {
    title: "Wrong Question Review",
    href: "/wrong",
    category: "Review",
    description: "Saved mistakes review and retry area",
    tags: ["wrong", "mistakes", "错题", "复习"],
  },
  {
    title: "Dashboard",
    href: "/dashboard",
    category: "Account",
    description: "Learning progress saved modules and user workspace",
    tags: ["progress", "dashboard", "学习面板"],
  },
];

const toolAliases: Record<string, string[]> = {
  "prompt-optimizer": ["提示词", "提示词优化", "prompt", "ai 提示"],
  "code-explainer": ["代码解释", "看代码", "讲代码", "源码解释"],
  "bug-finder": ["bug", "报错", "错误定位", "修 bug", "debug"],
  "api-request-generator": ["api", "接口", "curl", "axios", "fetch", "requests"],
  "dev-utilities": ["json", "正则", "regex", "时间戳", "timestamp", "格式化"],
  "learning-roadmap": ["路线", "学习路线", "30 天", "零基础"],
};

const worldLanguageAliases: Record<string, string[]> = {
  english: ["英语", "英文", "背单词", "单词"],
  japanese: ["日语", "日本语", "五十音", "假名"],
  korean: ["韩语", "韩国语", "韩文"],
  chinese: ["中文", "汉语", "普通话"],
  spanish: ["西班牙语", "西语"],
  french: ["法语"],
  german: ["德语"],
  italian: ["意大利语"],
  portuguese: ["葡萄牙语"],
  russian: ["俄语"],
  arabic: ["阿拉伯语"],
  thai: ["泰语"],
};

const programmingAliases: Record<string, string[]> = {
  python: ["python", "py", "自动化", "爬虫", "数据"],
  javascript: ["javascript", "js", "前端", "网页脚本"],
  typescript: ["typescript", "ts", "类型", "react"],
  cpp: ["c++", "cpp", "算法", "竞赛"],
  "html-css": ["html", "css", "网页", "样式"],
  sql: ["sql", "数据库", "查询"],
  bash: ["bash", "shell", "终端", "命令行"],
};

export const siteSearchItems: SiteSearchItem[] = [
  ...staticItems,
  ...toolDefinitions.map((tool) => ({
    title: tool.title,
    href: `/tools/${tool.slug}`,
    category: "AI Tools",
    description: tool.description,
    tags: [tool.shortTitle, tool.promise, ...tool.useCases, tool.slug, ...(toolAliases[tool.slug] || [])],
  })),
  ...examVocabularyPacks.map((pack) => ({
    title: `${pack.shortTitle} Vocabulary`,
    href: `${pack.route}?lang=zh`,
    category: "English",
    description: `${pack.level} vocabulary training with four choice spelling pronunciation and local review`,
    tags: [
      pack.title,
      pack.shortTitle,
      pack.level,
      ...pack.focus,
      ...pack.priorityWords.map((word) => word.word),
      "词汇",
      "背单词",
      "四选一",
      "拼写",
    ],
  })),
  ...originalReadingPacks.map((pack) => ({
    title: pack.zhTitle,
    href: `/english/reading/${pack.slug}?lang=zh`,
    category: "English Reading",
    description: `${pack.title} original reading path with vocabulary logic tasks and explanations`,
    tags: [pack.title, pack.zhTitle, pack.level, pack.exam || "", "reading", "原创阅读", "文章", "阅读"],
  })),
  ...originalQuestionPacks.map((pack) => ({
    title: pack.zhTitle,
    href: `/english/question-bank/${pack.slug}?lang=zh`,
    category: "English Questions",
    description: `${pack.title} ${pack.multipleChoiceCount} choice ${pack.fillBlankCount} fill blank original questions`,
    tags: [pack.title, pack.zhTitle, pack.level, "choice", "fill blank", "原创题库", "选择题", "填空题"],
  })),
  ...worldLanguages.map((language) => ({
    title: `${language.name} From Zero`,
    href: `/languages/${language.slug}`,
    category: "World Languages",
    description: `${language.nativeName} ${language.family} ${language.script} zero foundation path for ${language.starterGoal}`,
    tags: [language.name, language.nativeName, language.family, language.region, language.script, ...language.firstLesson, ...(worldLanguageAliases[language.slug] || [])],
  })),
  ...programmingLanguages.map((language) => ({
    title: `${language.title} Learning Lab`,
    href: `/programming/${language.slug}`,
    category: "Coding Lab",
    description: `${language.role} ${language.runtime} ${language.dailyHabit}`,
    tags: [language.shortTitle, language.title, language.runCommand, language.fileName, ...language.strengths, ...(programmingAliases[language.slug] || [])],
  })),
];

function normalize(value: string) {
  return value.toLowerCase().replace(/\s+/g, " ").trim();
}

function scoreItem(item: SiteSearchItem, query: string) {
  const title = normalize(item.title);
  const category = normalize(item.category);
  const description = normalize(item.description);
  const tags = normalize(item.tags.join(" "));
  const haystack = `${title} ${category} ${description} ${tags}`;
  const terms = normalize(query).split(" ").filter(Boolean);

  if (terms.length === 0) return 0;

  return terms.reduce((score, term) => {
    if (title === term) return score + 120;
    if (title.includes(term)) return score + 70;
    if (category.includes(term)) return score + 42;
    if (tags.includes(term)) return score + 30;
    if (description.includes(term)) return score + 18;
    if (haystack.includes(term)) return score + 8;
    return score;
  }, 0);
}

export function searchSite(query: string, limit = 36) {
  const cleanQuery = query.trim().slice(0, 80);
  if (!cleanQuery) return [];

  return siteSearchItems
    .map((item) => ({ item, score: scoreItem(item, cleanQuery) }))
    .filter((result) => result.score > 0)
    .sort((a, b) => b.score - a.score || a.item.title.localeCompare(b.item.title))
    .slice(0, limit)
    .map((result) => result.item);
}
