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

  const scorecards = [
    ["README", "90", zh ? "通过" : "Pass"],
    ["ENV", "75", zh ? "待确认" : "Review"],
    ["CI", "85", zh ? "通过" : "Pass"],
    ["DEPLOY", "82", zh ? "通过" : "Pass"],
    ["SECURITY", "88", zh ? "通过" : "Pass"],
  ];

  const evidenceCards = zh
    ? [
        ["P1", ".env.example", "环境变量需要区分本地 预览 生产"],
        ["P1", "README.md", "快速开始路径需要控制在五分钟内"],
        ["P2", "release docs", "发布清单不应该只存在维护者脑子里"],
      ]
    : [
        ["P1", ".env.example", "Env keys need local preview production separation"],
        ["P1", "README.md", "Quick start should stay under five minutes"],
        ["P2", "release docs", "Release checklist should be visible to maintainers"],
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
          <div className="home-audit-score-strip">
            {scorecards.map(([label, score, status]) => (
              <article key={label}>
                <span>{label}</span>
                <strong>{score}</strong>
                <em>{status}</em>
              </article>
            ))}
          </div>
          <div className="home-audit-evidence-grid">
            {evidenceCards.map(([severity, source, body]) => (
              <article key={`${severity}-${source}`}>
                <div>
                  <span>{severity}</span>
                  <strong>{source}</strong>
                </div>
                <p>{body}</p>
              </article>
            ))}
          </div>
          <div className="home-audit-pr-preview">
            <div>
              <p className="eyebrow">{zh ? "可复制 PR 描述" : "Copy-ready PR description"}</p>
              <h3>{zh ? "把体检结果直接放进开发流程" : "Move the audit directly into the developer workflow"}</h3>
            </div>
            <pre>{`## Launch readiness audit

Score: 86/100
Risk: Low

### Today
- [ ] Document env keys by environment

### Before public launch
- [ ] Keep quick start under five minutes
- [ ] Keep release checklist visible

### Verification
npm run lint
npm run build`}</pre>
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
