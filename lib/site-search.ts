import { programmingLanguages } from "@/lib/programming-content";
import { toolDefinitions } from "@/lib/tool-definitions";

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
    description: "One search box for GitHub launch audit AI developer tools coding routes and release checklists",
    tags: ["search", "find", "入口", "搜索", "全站搜索", "找功能", "找页面", "GitHub 上线体检", "AI 工具"],
  },
  {
    title: "AI Tools Hub",
    href: "/tools/github-repo-analyzer",
    category: "AI Tools",
    description: "GitHub launch audit prompt optimizer bug finder API generator JSON regex timestamp and roadmap tools",
    tags: ["tools", "ai tools", "工具站", "github", "上线体检", "发布检查", "提示词", "bug", "api", "json", "regex"],
  },
  {
    title: "Programming Learning Lab",
    href: "/programming",
    category: "Coding Lab",
    description: "Zero foundation programming map for Python JavaScript TypeScript C++ SQL Bash and more",
    tags: ["programming", "coding", "编程", "0基础", "python", "javascript", "cpp", "sql", "bash"],
  },
];

const toolAliases: Record<string, string[]> = {
  "github-repo-analyzer": ["github", "仓库", "开源", "上线体检", "发布检查", "项目交付", "pr checklist", "readme"],
  "prompt-optimizer": ["提示词", "提示词优化", "prompt", "ai 提示"],
  "code-explainer": ["代码解释", "看代码", "讲代码", "源码解释"],
  "bug-finder": ["bug", "报错", "错误定位", "修 bug", "debug"],
  "api-request-generator": ["api", "接口", "curl", "axios", "fetch", "requests"],
  "dev-utilities": ["json", "正则", "regex", "时间戳", "timestamp", "格式化"],
  "learning-roadmap": ["路线", "学习路线", "30 天", "零基础"],
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

const publicProgrammingSlugs = new Set(["python", "javascript", "typescript", "sql", "bash", "cpp"]);

export const siteSearchItems: SiteSearchItem[] = [
  ...staticItems,
  ...toolDefinitions.map((tool) => ({
    title: tool.title,
    href: `/tools/${tool.slug}`,
    category: "AI Tools",
    description: tool.description,
    tags: [tool.shortTitle, tool.promise, ...tool.useCases, tool.slug, ...(toolAliases[tool.slug] || [])],
  })),
  ...programmingLanguages.filter((language) => publicProgrammingSlugs.has(language.slug)).map((language) => ({
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
