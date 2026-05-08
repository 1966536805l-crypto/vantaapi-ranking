import Link from "next/link";
import type { Metadata } from "next";
import RepoAuditForm from "@/components/home/RepoAuditForm";
import { localizedHref, type SiteLanguage } from "@/lib/language";

export const metadata: Metadata = {
  title: "GitHub Launch Audit - Repo Readiness Checker | JinMing Lab",
  description:
    "Paste a public GitHub repository and get a rules-first launch-readiness audit with scorecard, blockers, evidence, GitHub issue drafts, PR description, and release checklist.",
  keywords: ["GitHub launch audit", "repo readiness checker", "deterministic checks", "release checklist", "GitHub issue template", "PR description generator", "GitHub 项目体检"],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "GitHub Launch Audit - JinMing Lab",
    description:
      "Rules-first launch checks for README, env, CI, deploy, security, issue drafts, PR description, and release checklist.",
    url: "https://vantaapi.com",
    siteName: "JinMing Lab",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "GitHub Launch Audit - JinMing Lab",
    description:
      "Paste a GitHub repo and get rules-first launch checks with evidence, blockers, and PR-ready output.",
  },
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
          <Link href={localizedHref("/tools/github-repo-analyzer", language)}>{zh ? "上线体检" : "Audit"}</Link>
          <Link href={localizedHref("/tools", language)}>{zh ? "工具" : "Tools"}</Link>
          <Link href={zh ? "/?ui=english&lang=en" : "/?lang=zh"}>{zh ? "English" : "中文"}</Link>
        </nav>
      </header>

      <section className="home-audit-command">
        <div className="home-audit-hero">
          <p className="eyebrow">{zh ? "GitHub 上线体检" : "GitHub Launch Audit"}</p>
          <h1>{zh ? "粘贴仓库，拿到上线前检查报告。" : "Paste a repo. Get the launch blockers."}</h1>
          <p>
            {zh
              ? "先用确定性规则检查 README、环境变量、CI、部署和安全提示，再整理成 Issue 草稿、PR 描述和发布清单。"
              : "Deterministic checks first: README, env files, CI, deploy, and security signals. Then package the result into issue drafts, PR copy, and a release checklist."}
          </p>
          <RepoAuditForm language={language} />
          <div className="home-audit-outcomes" aria-label={zh ? "核心结果" : "Core outcomes"}>
            {(zh
              ? ["上线评分", "阻塞项", "Issue 草稿", "PR 描述"]
              : ["Rules-first score", "Blockers", "Issue drafts", "PR description"]
            ).map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
        </div>

        <div className="home-audit-preview" aria-label={zh ? "报告预览" : "Report preview"}>
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
                <h3>{zh ? "把体检结果直接放进开发流程" : "Move the audit into the developer workflow"}</h3>
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
        </div>
      </section>

      <footer className="home-audit-footer">
        <Link href={localizedHref("/tools", language)}>{zh ? "查看其他 AI 工具" : "View other AI tools"}</Link>
        <Link href={localizedHref("/tools/learning-roadmap", language)}>{zh ? "学习路线放在二级入口" : "Learning roadmap stays secondary"}</Link>
      </footer>
    </main>
  );
}
