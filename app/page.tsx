import Link from "next/link";
import type { Metadata } from "next";
import { headers } from "next/headers";
import FlagLanguageToggle from "@/components/layout/FlagLanguageToggle";
import { isInterfaceLanguage, localizedHref, localizedLanguageAlternates, type InterfaceLanguage } from "@/lib/language";

type HomeSearchParams = Promise<{ ui?: string | string[]; lang?: string | string[] }>;

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function resolveHomeLanguage(rawLang?: string | string[], rawUi?: string | string[], requestLanguage?: string | null): InterfaceLanguage {
  const lang = firstParam(rawLang);
  if (isInterfaceLanguage(lang)) return lang;
  if (isInterfaceLanguage(requestLanguage)) return requestLanguage;
  return firstParam(rawUi) === "zh" ? "zh" : "en";
}

async function headerLanguage() {
  const requestHeaders = await headers();
  const language = requestHeaders.get("x-jinming-language");
  return isInterfaceLanguage(language) ? language : null;
}

function homeText(language: InterfaceLanguage) {
  if (language === "zh") {
    return {
      eyebrow: "英语背词和单词跟打",
      title: "打开就能练的英语背词和单词跟打工具",
      subtitle: "从今日 50 开始，直接跟打、背词、导入自己的词库。精选词和扩展拼写练习分开，适合每天稳定练英语。",
      today: "开始今日 50",
      memory: "开始背单词",
      custom: "导入我的词库",
      todayBody: "进入单词跟打，默认只练精选已校验词。",
      memoryBody: "用 Q 认识、0 不认识记录你的本机复习进度。",
      customBody: "把自己的单词批量导入到浏览器本机词库。",
      otherTools: "其他工具",
      audit: "GitHub 上线体检",
      cpp: "C++ 练习",
      programming: "编程训练",
      tools: "工具箱",
      security: "安全说明",
      privacy: "隐私",
      terms: "条款",
    };
  }

  return {
    eyebrow: "English vocabulary and word typing",
    title: "打开就能练的英语背词和单词跟打工具",
    subtitle: "Start with Today 50, then type words, review vocabulary, or import your own wordbook. Verified words and generated spelling practice stay separated.",
    today: "Start Today 50",
    memory: "Start Vocabulary Review",
    custom: "Import My Wordbook",
    todayBody: "Open word typing with verified core words first.",
    memoryBody: "Review with Q for known and 0 for unknown, saved locally.",
    customBody: "Bulk import your own words into a local browser wordbook.",
    otherTools: "Other Tools",
    audit: "GitHub Launch Audit",
    cpp: "C++ Practice",
    programming: "Programming",
    tools: "Toolbox",
    security: "Security",
    privacy: "Privacy",
    terms: "Terms",
  };
}

export async function generateMetadata({ searchParams }: { searchParams: HomeSearchParams }): Promise<Metadata> {
  const params = await searchParams;
  const language = resolveHomeLanguage(params?.lang, params?.ui, await headerLanguage());
  const t = homeText(language);

  return {
    title: `${t.title} | JinMing Lab`,
    description: t.subtitle,
    keywords: [
      "英语背单词",
      "单词跟打",
      "英语词库",
      "今日50",
      "English vocabulary",
      "word typing",
      "spaced repetition",
    ],
    alternates: {
      canonical: localizedHref("/", language),
      languages: localizedLanguageAlternates("/"),
    },
    openGraph: {
      title: `${t.title} | JinMing Lab`,
      description: t.subtitle,
      url: "https://vantaapi.com",
      siteName: "JinMing Lab",
      type: "website",
    },
    twitter: {
      card: "summary",
      title: `${t.title} | JinMing Lab`,
      description: t.subtitle,
    },
  };
}

export default async function HomePage({ searchParams }: { searchParams: HomeSearchParams }) {
  const params = await searchParams;
  const language = resolveHomeLanguage(params?.lang, params?.ui, await headerLanguage());
  const isRtl = language === "ar";
  const t = homeText(language);
  const primaryEntries = [
    { href: "/english/word-typing", title: t.today, body: t.todayBody, mark: "50" },
    { href: "/english/memory", title: t.memory, body: t.memoryBody, mark: "Q" },
    { href: "/english/vocabulary/custom", title: t.custom, body: t.customBody, mark: "+" },
  ];
  const otherTools = [
    { href: "/tools/github-repo-analyzer", label: t.audit },
    { href: "/cpp", label: t.cpp },
    { href: "/programming", label: t.programming },
    { href: "/tools", label: t.tools },
  ];

  return (
    <main className="home-audit-page" dir={isRtl ? "rtl" : "ltr"}>
      <header className="home-audit-nav">
        <Link href={localizedHref("/", language)} className="home-audit-brand">
          <span>JM</span>
          <strong>JinMing Lab</strong>
        </Link>
        <nav>
          <Link href={localizedHref("/english/word-typing", language)}>{t.today}</Link>
          <Link href={localizedHref("/english/memory", language)}>{t.memory}</Link>
          <Link href={localizedHref("/english/vocabulary/custom", language)}>{t.custom}</Link>
          <FlagLanguageToggle initialLanguage={language} />
        </nav>
      </header>

      <section className="home-audit-command">
        <div className="home-audit-hero">
          <p className="eyebrow">{t.eyebrow}</p>
          <h1>{t.title}</h1>
          <p>{t.subtitle}</p>
          <div className="home-audit-learning-entry" aria-label="Primary English actions">
            {primaryEntries.map((entry) => (
              <Link key={entry.href} href={localizedHref(entry.href, language)}>
                {entry.title}
              </Link>
            ))}
          </div>
        </div>

        <div className="home-audit-preview" aria-label="English practice entry preview">
          <div className="home-audit-report">
            <div className="home-audit-report-head">
              <div>
                <p className="eyebrow">{language === "zh" ? "首屏入口" : "First screen"}</p>
                <h2>{language === "zh" ? "3 秒内开始练" : "Start in 3 seconds"}</h2>
              </div>
              <strong>50</strong>
            </div>
            <div className="home-audit-evidence-grid">
              {primaryEntries.map((entry) => (
                <Link key={entry.href} href={localizedHref(entry.href, language)}>
                  <article>
                    <div>
                      <span>{entry.mark}</span>
                      <strong>{entry.title}</strong>
                    </div>
                    <p>{entry.body}</p>
                  </article>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <footer className="home-audit-footer" aria-label={t.otherTools}>
        <strong>{t.otherTools}</strong>
        {otherTools.map((tool) => (
          <Link key={tool.href} href={localizedHref(tool.href, language)}>{tool.label}</Link>
        ))}
        <Link href={localizedHref("/security", language)}>{t.security}</Link>
        <Link href={localizedHref("/privacy", language)}>{t.privacy}</Link>
        <Link href={localizedHref("/terms", language)}>{t.terms}</Link>
      </footer>
    </main>
  );
}
