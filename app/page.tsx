import Link from "next/link";
import type { Metadata } from "next";
import QuickStartPanel from "@/components/home/QuickStartPanel";
import { getServerUser } from "@/lib/server-auth";
import { programmingLanguages } from "@/lib/programming-content";
import { toolDefinitions } from "@/lib/tool-definitions";
import { worldLanguages } from "@/lib/world-language-content";

export const metadata: Metadata = {
  title: "JinMing Lab - AI Tools Coding Lab and World Languages",
  description:
    "A clean AI tools programming practice and world language learning platform for prompts code debugging roadmaps and zero foundation language paths.",
};

const railItems = [
  { href: "/", code: "JM", label: "Home" },
  { href: "/today", code: "TD", label: "Today" },
  { href: "/search", code: "S", label: "Search" },
  { href: "/tools", code: "T", label: "Tools" },
  { href: "/languages", code: "W", label: "Languages" },
  { href: "/programming", code: "C", label: "Coding" },
  { href: "/tools/learning-roadmap", code: "R", label: "Roadmap" },
  { href: "/dashboard", code: "D", label: "Dashboard" },
];

const heroPills = [
  "Search first",
  "Today plan",
  "AI tools",
  "Coding lab",
  "English training",
  "World languages",
];

const productCards = [
  {
    title: "Today",
    href: "/today",
    eyebrow: "Start",
    body: "Daily review new words typing reading and questions in one short queue.",
    points: ["One page", "Local streak", "No login"],
  },
  {
    title: "AI Tools",
    href: "/tools",
    eyebrow: "Core",
    body: "Prompt polish code explanation bug diagnosis API requests and developer utilities.",
    points: ["Prompt", "Code", "Bug"],
  },
  {
    title: "Coding",
    href: "/programming",
    eyebrow: "Practice",
    body: "Zero foundation programming paths with tutorials drills hints and answers.",
    points: ["Python", "JavaScript", "C++"],
  },
  {
    title: "English",
    href: "/english?lang=zh",
    eyebrow: "Training",
    body: "Vocabulary typing reading grammar question bank and personal wordbook.",
    points: ["Typing", "Wordbook", "Review"],
  },
  {
    title: "World Languages",
    href: "/languages",
    eyebrow: "Zero",
    body: "Sound script first phrases sentence slots and daily review for world languages.",
    points: ["Sound", "Script", "Review"],
  },
];

const featuredCodingSlugs = ["python", "javascript", "typescript", "cpp", "sql", "bash"];
const featuredCodingTracks = programmingLanguages.filter((language) =>
  featuredCodingSlugs.includes(language.slug)
);

const featuredWorldSlugs = ["english", "japanese", "spanish", "french", "korean", "arabic"];
const featuredWorldTracks = worldLanguages.filter((language) =>
  featuredWorldSlugs.includes(language.slug)
);

const quietLinks = [
  { href: "/english/vocabulary/custom?lang=zh", label: "My Wordbook", meta: "Import tag train" },
  { href: "/english/typing?lang=zh", label: "English Typing", meta: "Listen type retry" },
  { href: "/english/question-bank?lang=zh", label: "English Questions", meta: "Choice fill blank" },
  { href: "/cpp/quiz/mega-1000", label: "C++ Bank", meta: "Classified drills" },
  { href: "/wrong", label: "Review", meta: "Saved mistakes" },
  { href: "/dashboard", label: "Dashboard", meta: "Progress panel" },
];

export default async function HomePage() {
  const user = await getServerUser();

  return (
    <main className="apple-page">
      <div className="study-desk-shell grid min-h-screen grid-cols-[76px_minmax(0,1fr)] gap-3 py-5 sm:grid-cols-[112px_minmax(0,1fr)] lg:grid-cols-[152px_minmax(0,1fr)] lg:gap-4">
        <HomeRail isAdmin={user?.role === "ADMIN"} />

        <section className="min-w-0">
          <TopBar isAdmin={user?.role === "ADMIN"} isSignedIn={Boolean(user)} />

          <section className="mt-3 dense-panel overflow-hidden p-5 sm:p-6">
            <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-end">
              <div>
                <p className="eyebrow">AI Tools Coding Lab World Languages</p>
                <h1 className="mt-3 max-w-4xl text-3xl font-semibold leading-[1.04] tracking-normal sm:text-4xl lg:text-5xl">
                  JinMing Lab
                </h1>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-[color:var(--muted)]">
                  Search first then start the exact tool lesson drill or review page you need.
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                  <Link href="/search" className="dense-action-primary px-4 py-2.5">
                    Search
                  </Link>
                  <Link href="/today" className="dense-action px-4 py-2.5">
                    Start Today
                  </Link>
                  <Link href="/tools" className="dense-action px-4 py-2.5">
                    AI Tools
                  </Link>
                  <Link href="/english/vocabulary/custom?lang=zh" className="dense-action px-4 py-2.5">
                    My Wordbook
                  </Link>
                  <Link href="/programming" className="dense-action px-4 py-2.5">
                    Coding
                  </Link>
                </div>
                <form action="/search" className="mt-4 flex max-w-2xl flex-col gap-2 rounded-[8px] border border-slate-200 bg-white/80 p-2 sm:flex-row">
                  <input
                    name="q"
                    className="min-h-11 min-w-0 flex-1 rounded-[8px] border border-slate-200 bg-white px-4 text-sm font-semibold outline-none transition focus:border-slate-500"
                    placeholder="Search wordbook typing prompt python IELTS regex"
                  />
                  <button className="dense-action-primary px-5 py-2.5" type="submit">
                    Search
                  </button>
                </form>
              </div>

              <div className="rounded-[8px] border border-slate-200 bg-white/75 p-4">
                <p className="eyebrow">Focus</p>
                <div className="mt-3 grid gap-2">
                  {heroPills.map((item) => (
                    <span key={item} className="dense-row">
                      <span className="text-sm font-semibold">{item}</span>
                      <span className="text-xs text-[color:var(--muted)]">Ready</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <QuickStartPanel />

          <section className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
            {productCards.map((card) => (
              <Link key={card.href} href={card.href} className="dense-card p-4 transition hover:-translate-y-0.5 hover:border-slate-300">
                <p className="eyebrow">{card.eyebrow}</p>
                <h2 className="mt-2 text-xl font-semibold">{card.title}</h2>
                <p className="mt-2 min-h-16 text-sm leading-6 text-[color:var(--muted)]">{card.body}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {card.points.map((point) => (
                    <span key={point} className="dense-status">
                      {point}
                    </span>
                  ))}
                </div>
              </Link>
            ))}
          </section>

          <section className="mt-3 grid gap-3 xl:grid-cols-[minmax(0,1fr)_minmax(320px,0.9fr)_minmax(320px,0.9fr)]">
            <div className="dense-panel p-5">
              <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
                <div>
                  <p className="eyebrow">AI Tools</p>
                  <h2 className="mt-2 text-2xl font-semibold">Six practical tools</h2>
                </div>
                <Link href="/tools" className="dense-action-primary">
                  View all
                </Link>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                {toolDefinitions.map((tool) => (
                  <Link key={tool.slug} href={`/tools/${tool.slug}`} className="dense-mini">
                    <span className="font-semibold">{tool.title}</span>
                    <span className="truncate text-[color:var(--muted)]">{tool.description}</span>
                  </Link>
                ))}
              </div>
            </div>

            <div className="dense-panel p-5">
              <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
                <div>
                  <p className="eyebrow">World Languages</p>
                  <h2 className="mt-2 text-2xl font-semibold">Start from zero</h2>
                </div>
                <Link href="/languages" className="dense-action-primary">
                  View paths
                </Link>
              </div>
              <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
                {featuredWorldTracks.map((language) => (
                  <Link key={language.slug} href={`/languages/${language.slug}`} className="dense-mini">
                    <span className="font-semibold">{language.name}</span>
                    <span className="truncate text-[color:var(--muted)]">{language.nativeName} · {language.script}</span>
                  </Link>
                ))}
              </div>
            </div>

            <div className="dense-panel dense-grid-bg p-5">
              <div className="mb-4">
                <p className="eyebrow text-slate-400">Coding Lab</p>
                <h2 className="mt-2 text-2xl font-semibold text-white">Start with one language</h2>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                {featuredCodingTracks.map((language) => (
                  <Link
                    key={language.slug}
                    href={`/programming/${language.slug}`}
                    className="rounded-[8px] border border-white/10 bg-white/[0.07] p-3 text-white transition hover:border-sky-200/50"
                  >
                    <p className="text-sm font-semibold">{language.shortTitle}</p>
                    <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-300">{language.role}</p>
                  </Link>
                ))}
              </div>
            </div>
          </section>

          <section className="mt-3 dense-panel p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="eyebrow">Direct Links</p>
                <h2 className="mt-2 text-xl font-semibold">Frequently used study doors</h2>
              </div>
              {user ? (
                <Link href="/dashboard" className="dense-action">
                  Dashboard
                </Link>
              ) : (
                <Link href="/login" className="dense-action">
                  Sign in
                </Link>
              )}
            </div>
            <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {quietLinks.map((item) => (
                <Link key={item.href} href={item.href} className="dense-row">
                  <span className="text-sm font-semibold">{item.label}</span>
                  <span className="truncate text-xs text-[color:var(--muted)]">{item.meta}</span>
                </Link>
              ))}
            </div>
          </section>
        </section>
      </div>
    </main>
  );
}

function HomeRail({ isAdmin }: { isAdmin: boolean }) {
  const items = isAdmin ? [...railItems, { href: "/admin", code: "A", label: "Admin" }] : railItems;

  return (
    <aside className="study-rail sticky top-5 flex h-[calc(100vh-40px)] flex-col p-2">
      <Link href="/" className="mb-3 flex items-center gap-2 rounded-[8px] px-2 py-2">
        <span className="grid h-8 w-8 place-items-center rounded-[8px] bg-slate-950 text-[10px] font-semibold text-white">JM</span>
        <span className="hidden text-sm font-semibold leading-tight sm:block">JinMing Lab</span>
      </Link>

      <nav className="grid gap-1">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`rail-link ${item.href === "/" ? "rail-link-active" : ""}`}
          >
            <span className="grid h-7 w-7 place-items-center rounded-[8px] bg-white/70 text-xs font-semibold text-slate-700">
              {item.code}
            </span>
            <span className="hidden text-xs font-semibold sm:inline lg:text-sm">{item.label}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
}

function TopBar({ isAdmin, isSignedIn }: { isAdmin: boolean; isSignedIn: boolean }) {
  return (
    <header className="dense-panel flex flex-wrap items-center justify-between gap-3 px-4 py-3">
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="dense-status">JinMing Lab</span>
        <span className="dense-status">Search</span>
        <span className="dense-status">AI tools</span>
        <span className="dense-status">World languages</span>
        <span className="dense-status">Coding lab</span>
        <span className="dense-status">Roadmaps</span>
        {isAdmin && <span className="dense-status">Admin</span>}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Link href="/search" className="dense-action-primary">Search</Link>
        <Link href="/tools" className="dense-action">Tools</Link>
        <WorldLanguageMenu />
        <Link href="/languages" className="dense-action">Languages</Link>
        <Link href="/programming" className="dense-action">Coding</Link>
        <Link href="/tools/learning-roadmap" className="dense-action">Roadmap</Link>
        {isSignedIn ? (
          <form action="/api/auth/logout" method="post">
            <button className="dense-action">Logout</button>
          </form>
        ) : (
          <Link href="/login" className="dense-action">Login</Link>
        )}
      </div>
    </header>
  );
}

function WorldLanguageMenu() {
  const featured = ["english", "chinese", "japanese", "korean", "spanish", "french", "arabic", "german"];
  const featuredLanguages = worldLanguages.filter((language) => featured.includes(language.slug));
  const restLanguages = worldLanguages.filter((language) => !featured.includes(language.slug));

  return (
    <details className="home-language-menu">
      <summary aria-label="Open global language switcher">
        <span>Global</span>
        <strong>{worldLanguages.length}</strong>
      </summary>
      <div className="home-language-popover">
        <div className="home-language-popover-head">
          <span>World Languages</span>
          <Link href="/languages">All paths</Link>
        </div>
        <div className="home-language-featured">
          {featuredLanguages.map((language) => (
            <Link key={language.slug} href={`/languages/${language.slug}`}>
              <span>{language.name}</span>
              <small>{language.nativeName}</small>
            </Link>
          ))}
        </div>
        <div className="home-language-scroll">
          {restLanguages.map((language) => (
            <Link key={language.slug} href={`/languages/${language.slug}`}>
              <span>{language.name}</span>
              <small>{language.nativeName}</small>
            </Link>
          ))}
        </div>
      </div>
    </details>
  );
}
