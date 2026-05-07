import Link from "next/link";
import type { Metadata } from "next";
import { searchSite, siteSearchItems } from "@/lib/site-search";

type SearchPageProps = {
  searchParams?: Promise<{ q?: string }>;
};

export const metadata: Metadata = {
  title: "AI 学习工具搜索 - 英语 编程 AI 工具 - JinMing Lab",
  description: "搜索 JinMing Lab 的英语学习、编程训练、AI Coach、代码解释、Bug 定位、Prompt 优化和错题复盘页面。",
  keywords: ["AI 学习工具", "英语学习", "编程学习", "AI Coach", "代码解释", "Prompt 优化"],
  alternates: {
    canonical: "/search",
  },
  openGraph: {
    title: "AI 学习工具搜索 - JinMing Lab",
    description: "搜索英语学习、编程训练、AI Coach、代码解释、Bug 定位和 Prompt 优化页面。",
    url: "https://vantaapi.com/search",
    siteName: "JinMing Lab",
    type: "website",
  },
};

const quickSearches = [
  { label: "我的词书", query: "我的词书" },
  { label: "英文打字", query: "英文打字" },
  { label: "Prompt", query: "prompt" },
  { label: "Bug", query: "bug" },
  { label: "Python", query: "python" },
  { label: "C++", query: "c++" },
  { label: "AI Coach", query: "AI Coach" },
  { label: "Regex", query: "regex" },
];

const priorityHrefs = [
  "/today",
  "/english/vocabulary/custom?lang=zh",
  "/english/typing?lang=zh",
  "/english?lang=zh",
  "/tools",
  "/programming",
  "/tools/prompt-optimizer",
  "/tools/code-explainer",
  "/tools/bug-finder",
  "/programming/python",
  "/english/question-bank?lang=zh",
];

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = searchParams ? await searchParams : undefined;
  const query = (params?.q || "").trim().slice(0, 80);
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
          <Link href="/" className="dense-action">JinMing Lab</Link>
          <div className="flex flex-wrap gap-2">
            <Link href="/today" className="dense-action-primary">Today</Link>
            <Link href="/english/vocabulary/custom?lang=zh" className="dense-action">Wordbook</Link>
            <Link href="/english?lang=zh" className="dense-action">English</Link>
            <Link href="/programming" className="dense-action">Coding</Link>
            <Link href="/tools" className="dense-action">AI Tools</Link>
          </div>
        </header>

        <section className="mt-3 dense-panel overflow-hidden p-5 sm:p-6">
          <p className="eyebrow">Command Search</p>
          <h1 className="mt-3 max-w-4xl text-3xl font-semibold leading-[1.04] sm:text-4xl">
            Search once then start
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-[color:var(--muted)]">
            英语学习 编程训练 AI 工具 今日学习 我的词书和错题复盘都放在一个入口里 搜到就能直接开始
          </p>

          <form action="/search" className="mt-5 flex flex-col gap-2 rounded-[8px] border border-slate-200 bg-white/85 p-2 sm:flex-row">
            <input
              name="q"
              defaultValue={query}
              className="min-h-11 min-w-0 flex-1 rounded-[8px] border border-slate-200 bg-white px-4 text-sm font-semibold outline-none transition focus:border-slate-500"
              placeholder="搜索 英语 AI Coach 代码解释 prompt bug python 错题"
              autoFocus
            />
            <button className="dense-action-primary px-5 py-2.5" type="submit">
              Search
            </button>
          </form>

          <div className="mt-4 flex flex-wrap gap-2">
            {quickSearches.map((item) => (
              <Link key={item.query} href={`/search?q=${encodeURIComponent(item.query)}`} className="dense-status">
                {item.label}
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-3 grid gap-3 lg:grid-cols-[300px_minmax(0,1fr)]">
          <aside className="dense-panel h-fit p-5">
            <p className="eyebrow">Index</p>
            <h2 className="mt-2 text-2xl font-semibold">{siteSearchItems.length} pages</h2>
            <div className="mt-4 grid gap-2">
              {Array.from(groupedCount.entries()).map(([category, count]) => (
                <Link key={category} href={`/search?q=${encodeURIComponent(category)}`} className="dense-row">
                  <span className="text-sm font-semibold">{category}</span>
                  <span className="dense-status">{count}</span>
                </Link>
              ))}
            </div>
            <div className="mt-5 border-t border-slate-200 pt-4">
              <p className="eyebrow">Fast Start</p>
              <div className="mt-3 grid gap-2">
                <Link href="/today" className="dense-action-primary justify-center">今日学习</Link>
                <Link href="/english/vocabulary/custom?lang=zh" className="dense-action justify-center">我的词书</Link>
                <Link href="/english/typing?lang=zh" className="dense-action justify-center">英文打字</Link>
              </div>
            </div>
          </aside>

          <section className="dense-panel p-5">
            <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="eyebrow">{query ? "Results" : "Start Here"}</p>
                <h2 className="mt-2 text-2xl font-semibold">
                  {query ? `${results.length} matches for ${query}` : "Most useful entries"}
                </h2>
              </div>
              <span className="dense-status">local index</span>
            </div>

            {query && results.length === 0 ? (
              <div className="dense-card p-5">
                <h3 className="text-xl font-semibold">No match yet</h3>
                <p className="mt-3 text-sm leading-6 text-[color:var(--muted)]">
                  试试更短的词 比如 英语 打字 prompt python bug 代码解释 错题
                </p>
              </div>
            ) : (
              <div className="grid gap-2 md:grid-cols-2">
                {resultItems.map((item) => (
                  <Link key={`${item.category}-${item.href}`} href={item.href} className="dense-card p-4 transition hover:-translate-y-0.5 hover:border-slate-300">
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
