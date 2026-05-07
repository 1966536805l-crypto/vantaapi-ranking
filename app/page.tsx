import Link from "next/link";
import type { Metadata } from "next";
import RepoAuditForm from "@/components/home/RepoAuditForm";
import { localizedHref, type SiteLanguage } from "@/lib/language";

export const metadata: Metadata = {
  title: "JinMing Lab - GitHub Launch Readiness Audit",
  description:
    "Paste a GitHub repository and get a launch-readiness audit with score, blockers, GitHub issues, and a fix checklist.",
  keywords: ["GitHub launch audit", "GitHub 项目体检", "launch readiness", "release checklist", "GitHub issue template"],
};

type HomeSearchParams = Promise<{ ui?: string | string[]; lang?: string | string[] }>;

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function resolveHomeLanguage(rawLang?: string | string[], rawUi?: string | string[]): SiteLanguage {
  const lang = firstParam(rawLang);
  if (lang === "zh" || lang === "en") return lang;
  return firstParam(rawUi) === "english" ? "en" : "zh";
}

export default async function HomePage({ searchParams }: { searchParams: HomeSearchParams }) {
  const params = await searchParams;
  const language = resolveHomeLanguage(params?.lang, params?.ui);
  const zh = language === "zh";

  const resultCards = zh
    ? [
        ["Score", "上线评分", "快速判断仓库是否适合公开发布"],
        ["Blockers", "阻塞项", "优先列出必须先修的问题"],
        ["Fix Checklist", "修复清单", "生成 README 环境变量 CI 部署和安全检查"],
      ]
    : [
        ["Score", "Launch score", "See whether the repo is ready to publish"],
        ["Blockers", "Must-fix blockers", "Know what has to be fixed first"],
        ["Fix Checklist", "Fix checklist", "Get README env CI deploy and security steps"],
      ];

  return (
    <main className="home-audit-page">
      <header className="home-audit-nav">
        <Link href={localizedHref("/", language)} className="home-audit-brand">
          <span>JM</span>
          <strong>JinMing Lab</strong>
        </Link>
        <nav>
          <Link href={localizedHref("/tools/github-repo-analyzer", language)}>{zh ? "项目体检" : "Audit"}</Link>
          <Link href={localizedHref("/tools", language)}>{zh ? "工具" : "Tools"}</Link>
          <Link href={zh ? "/?ui=english&lang=en" : "/?lang=zh"}>{zh ? "English" : "中文"}</Link>
        </nav>
      </header>

      <section className="home-audit-hero">
        <p className="eyebrow">GitHub Launch Audit</p>
        <h1>{zh ? "粘贴 GitHub 仓库，一键生成上线前检查报告。" : "Paste a GitHub repo. Get a launch-readiness audit in 30 seconds."}</h1>
        <p>
          {zh
            ? "JinMing Lab 专注帮开发者检查公开仓库的 README、环境变量、CI、部署、安全提示、Issue 草稿和发布清单。"
            : "JinMing Lab checks README gaps, env files, CI signals, deployment clues, security notes, issue drafts, and release checklists."}
        </p>
        <RepoAuditForm language={language} />
      </section>

      <section className="home-audit-preview" aria-label={zh ? "报告预览" : "Report preview"}>
        <div className="home-audit-report">
          <div className="home-audit-report-head">
            <div>
              <p className="eyebrow">{zh ? "示例报告" : "Sample report"}</p>
              <h2>vercel/swr</h2>
            </div>
            <strong>86</strong>
          </div>
          <div className="home-audit-report-grid">
            {resultCards.map(([code, title, body]) => (
              <article key={code}>
                <span>{code}</span>
                <h3>{title}</h3>
                <p>{body}</p>
              </article>
            ))}
          </div>
          <div className="home-audit-fix-list">
            <p className="eyebrow">{zh ? "输出内容" : "Output"}</p>
            <ul>
              <li>{zh ? "可复制 GitHub Issue 草稿" : "Copyable GitHub issue drafts"}</li>
              <li>{zh ? "上线前必须修清单" : "Must-fix launch blockers"}</li>
              <li>{zh ? "发布检查清单" : "Release checklist"}</li>
            </ul>
          </div>
        </div>
      </section>

      <footer className="home-audit-footer">
        <Link href={localizedHref("/tools", language)}>{zh ? "查看其他 AI 工具" : "View other AI tools"}</Link>
        <Link href={localizedHref("/tools/learning-roadmap", language)}>{zh ? "学习路线放在二级入口" : "Learning roadmap stays secondary"}</Link>
      </footer>
    </main>
  );
}
