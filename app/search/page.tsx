import Link from "next/link";
import type { Metadata } from "next";
import { localizedHref, resolveLanguage, type PageSearchParams } from "@/lib/language";
import { searchSite, siteSearchItems } from "@/lib/site-search";

type SearchPageProps = {
  searchParams?: Promise<PageSearchParams & { q?: string }>;
};

export const metadata: Metadata = {
  title: "开发者工具搜索 - GitHub 上线体检 AI 工具 - JinMing Lab",
  description: "搜索 JinMing Lab 的 GitHub 上线体检、Prompt 优化、Bug 定位、API 请求生成、JSON 正则时间戳工具和编程路线。",
  keywords: ["GitHub 上线体检", "AI 开发者工具", "Prompt 优化", "Bug 定位", "API 请求生成", "编程路线"],
  alternates: {
    canonical: "/search",
  },
  openGraph: {
    title: "开发者工具搜索 - JinMing Lab",
    description: "搜索 GitHub 上线体检、AI 开发者工具、Bug 定位、Prompt 优化和 API 请求生成页面。",
    url: "https://vantaapi.com/search",
    siteName: "JinMing Lab",
    type: "website",
  },
};

const quickSearches = [
  { label: "GitHub Audit", query: "github audit" },
  { label: "Prompt", query: "prompt" },
  { label: "Bug", query: "bug" },
  { label: "API", query: "api" },
  { label: "JSON", query: "json" },
  { label: "Regex", query: "regex" },
  { label: "Roadmap", query: "roadmap" },
  { label: "Python", query: "python" },
];

const priorityHrefs = [
  "/tools/github-repo-analyzer",
  "/tools/prompt-optimizer",
  "/tools/bug-finder",
  "/tools/api-request-generator",
  "/tools/dev-utilities",
  "/tools/learning-roadmap",
  "/programming",
  "/programming/python",
];

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = searchParams ? await searchParams : undefined;
  const language = resolveLanguage(params);
  const rawQuery = Array.isArray(params?.q) ? params?.q[0] : params?.q;
  const query = (rawQuery || "").trim().slice(0, 80);
  const results = searchSite(query);
  const groupedCount = new Map<string, number>();

  for (const item of siteSearchItems) {
    groupedCount.set(item.category, (groupedCount.get(item.category) || 0) + 1);
  }

  const priorityResults = priorityHrefs
    .map((href) => siteSearchItems.find((item) => item.href === href))
    .filter((item): item is (typeof siteSearchItems)[number] => Boolean(item));
  const resultItems = query ? results : priorityResults;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "JinMing Lab",
    url: "https://vantaapi.com",
    potentialAction: {
      "@type": "SearchAction",
      target: "https://vantaapi.com/search?q={search_term_string}",
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <main className="apple-page pb-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <section className="mx-auto min-h-screen w-[min(1180px,calc(100%_-_28px))] py-5">
        <header className="dense-panel flex flex-wrap items-center justify-between gap-3 p-4">
          <Link href={localizedHref("/", language)} className="dense-action">JinMing Lab</Link>
          <div className="flex flex-wrap gap-2">
            <Link href={localizedHref("/tools/github-repo-analyzer", language)} className="dense-action-primary">{language === "zh" ? "上线体检" : "Launch Audit"}</Link>
            <Link href={localizedHref("/tools", language)} className="dense-action">{language === "zh" ? "AI 工具" : "AI Tools"}</Link>
            <Link href={localizedHref("/programming", language)} className="dense-action">{language === "zh" ? "编程路线" : "Coding"}</Link>
          </div>
        </header>

        <section className="mt-3 dense-panel overflow-hidden p-5 sm:p-6">
          <p className="eyebrow">{language === "zh" ? "开发者工具搜索" : "Developer Tool Search"}</p>
          <h1 className="mt-3 max-w-4xl text-3xl font-semibold leading-[1.04] sm:text-4xl">
            {language === "zh" ? "搜索上线体检 AI 工具和编程路线" : "Search launch audits AI tools and coding routes"}
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-[color:var(--muted)]">
            {language === "zh"
              ? "公开入口先聚焦 GitHub 上线体检 Prompt 优化 Bug 定位 API 请求生成 JSON 正则时间戳和编程路线"
              : "Public search is focused on GitHub launch audits prompt tools bug fixing API generation dev utilities and coding routes"}
          </p>

          <form action="/search" className="mt-5 flex flex-col gap-2 rounded-[8px] border border-slate-200 bg-white/85 p-2 sm:flex-row">
            <input type="hidden" name="lang" value={language} />
            <input
              name="q"
              defaultValue={query}
              className="min-h-11 min-w-0 flex-1 rounded-[8px] border border-slate-200 bg-white px-4 text-sm font-semibold outline-none transition focus:border-slate-500"
              placeholder={language === "zh" ? "搜索 GitHub prompt bug api json python" : "Search GitHub prompt bug api json python"}
              autoFocus
            />
            <button className="dense-action-primary px-5 py-2.5" type="submit">
              {language === "zh" ? "搜索" : "Search"}
            </button>
          </form>

          <div className="mt-4 flex flex-wrap gap-2">
            {quickSearches.map((item) => (
              <Link key={item.query} href={localizedHref(`/search?q=${encodeURIComponent(item.query)}`, language)} className="dense-status">
                {item.label}
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-3 grid gap-3 lg:grid-cols-[300px_minmax(0,1fr)]">
          <aside className="dense-panel h-fit p-5">
            <p className="eyebrow">{language === "zh" ? "索引" : "Index"}</p>
            <h2 className="mt-2 text-2xl font-semibold">{siteSearchItems.length} {language === "zh" ? "个公开入口" : "public entries"}</h2>
            <div className="mt-4 grid gap-2">
              {Array.from(groupedCount.entries()).map(([category, count]) => (
                <Link key={category} href={localizedHref(`/search?q=${encodeURIComponent(category)}`, language)} className="dense-row">
                  <span className="text-sm font-semibold">{category}</span>
                  <span className="dense-status">{count}</span>
                </Link>
              ))}
            </div>
            <div className="mt-5 border-t border-slate-200 pt-4">
              <p className="eyebrow">{language === "zh" ? "快速开始" : "Fast Start"}</p>
              <div className="mt-3 grid gap-2">
                <Link href={localizedHref("/tools/github-repo-analyzer", language)} className="dense-action-primary justify-center">{language === "zh" ? "运行 GitHub 上线体检" : "Run GitHub Launch Audit"}</Link>
                <Link href={localizedHref("/tools/prompt-optimizer", language)} className="dense-action justify-center">{language === "zh" ? "优化 Prompt" : "Optimize Prompt"}</Link>
                <Link href={localizedHref("/tools/bug-finder", language)} className="dense-action justify-center">{language === "zh" ? "定位 Bug" : "Find Bug"}</Link>
              </div>
            </div>
          </aside>

          <section className="dense-panel p-5">
            <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="eyebrow">{query ? (language === "zh" ? "结果" : "Results") : (language === "zh" ? "从这里开始" : "Start Here")}</p>
                <h2 className="mt-2 text-2xl font-semibold">
                  {query ? `${results.length} ${language === "zh" ? "个匹配" : "matches for"} ${query}` : (language === "zh" ? "最有用的入口" : "Most useful entries")}
                </h2>
              </div>
              <span className="dense-status">local index</span>
            </div>

            {query && results.length === 0 ? (
              <div className="dense-card p-5">
                <h3 className="text-xl font-semibold">No match yet</h3>
                <p className="mt-3 text-sm leading-6 text-[color:var(--muted)]">
                {language === "zh" ? "试试更短的词 比如 GitHub prompt bug api json python" : "Try shorter words like GitHub prompt bug api json python"}
                </p>
              </div>
            ) : (
              <div className="grid gap-2 md:grid-cols-2">
                {resultItems.map((item) => (
                  <Link key={`${item.category}-${item.href}`} href={localizedHref(item.href, language)} className="dense-card p-4 transition hover:-translate-y-0.5 hover:border-slate-300">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="eyebrow">{item.category}</p>
                        <h3 className="mt-2 truncate text-xl font-semibold">{item.title}</h3>
                      </div>
                      <span className="dense-status">Open</span>
                    </div>
                    <p className="mt-3 line-clamp-2 text-sm leading-6 text-[color:var(--muted)]">{item.description}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {item.tags.slice(0, 3).map((tag) => (
                        <span key={tag} className="dense-status">{tag}</span>
                      ))}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>
        </section>
      </section>
    </main>
  );
}
