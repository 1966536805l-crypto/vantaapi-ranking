"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ToolLayout, { type OutputBlock } from "@/components/tools/ToolLayout";

type GitHubRepoAnalysis = {
  repository: {
    fullName: string;
    url: string;
    description: string;
    defaultBranch: string;
    stars: number;
    forks: number;
    openIssues: number;
    language: string;
    license: string;
    visibility: string;
    archived: boolean;
    pushedAt: string;
  };
  launchScore: {
    score: number;
    riskLevel: "Low" | "Medium" | "High";
    summary: string;
  };
  scorecard: Array<{
    label: string;
    score: number;
    status: "pass" | "review" | "missing";
    note: string;
  }>;
  mustFix: string[];
  priorityFixes: {
    today: string[];
    beforeLaunch: string[];
    later: string[];
  };
  prDescription: string;
  copyableIssues: string[];
  overview: string[];
  howToRun: string[];
  techStack: string[];
  fileStructure: string[];
  securityNotes: string[];
  readmeSuggestions: string[];
  githubActions: string[];
  envChecklist: string[];
  issueLabelPlan: string[];
  deploymentChecklist: string[];
  prReviewChecklist: string[];
  releaseChecklist: string[];
  filesRead: string[];
};

type GitHubRepoAnalyzerResponse = {
  success: boolean;
  analysis?: GitHubRepoAnalysis;
  message?: string;
  error?: string;
};

const sampleRepoUrl = "https://github.com/vercel/swr";

const sampleGitHubAnalysis: GitHubRepoAnalysis = {
  repository: {
    fullName: "vercel/swr",
    url: sampleRepoUrl,
    description: "React Hooks for data fetching",
    defaultBranch: "main",
    stars: 31000,
    forks: 1200,
    openIssues: 80,
    language: "TypeScript",
    license: "MIT",
    visibility: "public",
    archived: false,
    pushedAt: new Date().toISOString(),
  },
  launchScore: {
    score: 86,
    riskLevel: "Low",
    summary:
      "Public launch shape is strong. The remaining work is mostly release polish, contributor handoff, and keeping setup steps copy ready.",
  },
  scorecard: [
    { label: "README", score: 90, status: "pass", note: "Purpose, install, and usage are easy to find." },
    { label: "Environment", score: 75, status: "review", note: "Env expectations should stay explicit for examples and release docs." },
    { label: "CI", score: 85, status: "pass", note: "Quality commands should stay visible in pull requests." },
    { label: "Deploy", score: 82, status: "pass", note: "Release notes and rollback steps are the remaining launch polish." },
    { label: "Security", score: 88, status: "pass", note: "No obvious committed local secrets in the sample report." },
  ],
  mustFix: [
    "Keep the README quick start path under five minutes for a new contributor.",
    "Make required environment variables explicit in one env example section.",
    "Keep release and PR checklists visible so launch work is not trapped in maintainers' heads.",
  ],
  priorityFixes: {
    today: ["Make required environment variables explicit in one env example section."],
    beforeLaunch: [
      "Keep the README quick start path under five minutes for a new contributor.",
      "Keep release and PR checklists visible so launch work is not trapped in maintainers' heads.",
    ],
    later: ["Add a recurring release review for docs, examples, and CI drift."],
  },
  prDescription: `## Launch readiness audit

Score: 86/100
Risk: Low

### Today
- [ ] Make required environment variables explicit in one env example section.

### Before public launch
- [ ] Keep the README quick start path under five minutes for a new contributor.
- [ ] Keep release and PR checklists visible so launch work is not trapped in maintainers' heads.

### Later polish
- [ ] Add a recurring release review for docs, examples, and CI drift.

### Verification
\`\`\`bash
npm run lint
npm run build
\`\`\``,
  copyableIssues: [
    `## Improve new contributor quick start

Priority: P1
Labels: documentation onboarding

Why this matters
New contributors decide quickly whether a repo feels safe to run. A short install run test path reduces support questions.

Suggested fix
- Keep install run test commands in one README section
- Mention required Node package manager and version
- Add the expected local URL or output

Done when
- A new contributor can run the project without asking for hidden context
- The quick start uses copy ready commands

Verification
- Follow the README from a clean checkout`,
    `## Add explicit environment checklist

Priority: P1
Labels: docs security

Why this matters
Launches slow down when required secrets are hidden in code or deployment dashboards.

Suggested fix
- Add or update .env.example
- Mark required optional and production only variables
- Keep real secrets out of Git

Done when
- Every required runtime variable has a placeholder and short purpose
- Production secrets are configured only in the host dashboard

Verification
- Run the app with only documented variables`,
    `## Publish release readiness checklist

Priority: P2
Labels: release process

Why this matters
A repeatable launch checklist catches README drift, broken CI, stale examples, and missing security notes before users find them.

Suggested fix
- Add a short release checklist to README or docs
- Include build test lint env deployment and rollback checks
- Link to the changelog or release notes path

Done when
- Maintainers can follow one checklist before every public release

Verification
- Use the checklist on the next staging deploy`,
  ],
  overview: [
    "Repository presents a focused public developer library with active maintenance signals.",
    "The project has enough public metadata for a launch handoff and contributor review.",
    "Launch risk is low when docs, env, CI, and release steps stay explicit.",
  ],
  howToRun: ["Install dependencies", "Run the development command from package scripts", "Run tests or type checks before a release"],
  techStack: ["TypeScript", "React", "Package scripts", "GitHub based contribution flow"],
  fileStructure: ["README explains the public purpose", "Root config files make project tooling discoverable", "Docs and examples should stay close to the first contributor path"],
  securityNotes: [
    "Do not commit production secrets or tokens.",
    "Keep env examples as placeholders only.",
    "Review dependency updates and public issue reports before release.",
  ],
  readmeSuggestions: [
    "Keep the first screen focused on what the package does and how to start.",
    "Move deeper architecture notes below install and usage examples.",
    "Add a short release or deployment checklist when the project has a public website.",
  ],
  githubActions: [
    "Keep lint typecheck test and build visible in CI.",
    "Fail pull requests on broken formatting or type errors.",
    "Cache dependencies only after the install path is stable.",
  ],
  envChecklist: [
    "Detected env template keys should be documented with purpose and required status.",
    "Production secrets belong in the host environment dashboard.",
    "Local optional variables should have safe defaults.",
  ],
  issueLabelPlan: ["P0 launch blocker", "P1 release polish", "docs", "security", "good first issue"],
  deploymentChecklist: [
    "Run lint typecheck tests and build.",
    "Confirm production environment variables.",
    "Review README quick start and env docs.",
    "Publish release notes and rollback steps.",
  ],
  prReviewChecklist: [
    "Does the PR change public setup commands?",
    "Does the PR require new env variables?",
    "Are docs examples and tests updated together?",
    "Can a new contributor verify the change locally?",
  ],
  releaseChecklist: [
    "Clean working tree and passing CI.",
    "No committed secrets or temporary local files.",
    "README quick start still works.",
    "Release notes include user visible changes.",
    "Monitoring or rollback path is known before launch.",
  ],
  filesRead: ["README.md", "package.json", ".env.example", ".github/workflows/*", "deployment docs"],
};

function bulletList(items: string[]) {
  return items.length ? items.map((item) => `- ${item}`).join("\n") : "- No signal detected";
}

function numberedList(items: string[]) {
  return items.length ? items.map((item, index) => `${index + 1}. ${item}`).join("\n") : "1. No action detected";
}

function scorecardList(items: GitHubRepoAnalysis["scorecard"], zh: boolean) {
  return items.length
    ? items.map((item) => `- ${item.label}: ${item.score}/100 · ${scorecardStatusLabel(item.status, zh)} · ${item.note}`).join("\n")
    : "- No scorecard detected";
}

function priorityFixList(priorityFixes: GitHubRepoAnalysis["priorityFixes"], zh: boolean) {
  const today = priorityFixes.today.length ? priorityFixes.today : [zh ? "今天没有必须立刻修的阻塞项" : "No same-day blocker detected"];
  const beforeLaunch = priorityFixes.beforeLaunch.length ? priorityFixes.beforeLaunch : [zh ? "上线前暂无额外必修项" : "No additional pre-launch item detected"];
  const later = priorityFixes.later.length ? priorityFixes.later : [zh ? "持续保持 README CI 环境变量和发布说明更新" : "Keep README CI env docs and release notes current"];
  return [
    zh ? "今天必须修" : "Fix today",
    numberedList(today),
    zh ? "上线前修" : "Fix before launch",
    numberedList(beforeLaunch),
    zh ? "后面优化" : "Later polish",
    numberedList(later),
  ].join("\n");
}

function base64UrlEncode(value: string) {
  const bytes = new TextEncoder().encode(value);
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function base64UrlDecode(value: string) {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(value.length / 4) * 4, "=");
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

function isSharedGitHubAnalysis(value: unknown): value is GitHubRepoAnalysis {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<GitHubRepoAnalysis>;
  return Boolean(
    candidate.repository &&
      typeof candidate.repository.fullName === "string" &&
      typeof candidate.repository.url === "string" &&
      candidate.launchScore &&
      typeof candidate.launchScore.score === "number" &&
      Array.isArray(candidate.scorecard) &&
      candidate.priorityFixes &&
      typeof candidate.prDescription === "string" &&
      Array.isArray(candidate.mustFix) &&
      Array.isArray(candidate.releaseChecklist)
  );
}

function encodeSharedAnalysis(analysis: GitHubRepoAnalysis) {
  return base64UrlEncode(JSON.stringify({ version: 1, analysis }));
}

function decodeSharedAnalysis(hash: string) {
  const params = new URLSearchParams(hash.replace(/^#/, ""));
  const packed = params.get("report");
  if (!packed) return null;
  try {
    const parsed = JSON.parse(base64UrlDecode(packed)) as { analysis?: unknown };
    return isSharedGitHubAnalysis(parsed.analysis) ? parsed.analysis : null;
  } catch {
    return null;
  }
}

function riskTone(riskLevel: GitHubRepoAnalysis["launchScore"]["riskLevel"]) {
  if (riskLevel === "Low") return "low";
  if (riskLevel === "Medium") return "medium";
  return "high";
}

function formatGitHubRepoOutput(analysis: GitHubRepoAnalysis | null, error: string, language: "en" | "zh" = "en") {
  const zh = language === "zh";
  if (error) {
    if (zh) {
      return `状态\n${error}\n\n支持输入\n粘贴公开 GitHub 仓库地址，例如 ${sampleRepoUrl}`;
    }
    return `Status\n${error}\n\nSupported input\nPaste a public GitHub repository URL like ${sampleRepoUrl}`;
  }
  if (!analysis) {
    if (zh) {
      return `GitHub 项目体检\n粘贴公开仓库地址。获取评分、阻塞项、GitHub Issue 草稿、README、环境变量、CI、部署、安全和发布清单。\n\n示例\n${sampleRepoUrl}`;
    }
    return `GitHub Launch Audit\nPaste a public repo URL. Get score blockers GitHub issue drafts README env CI deploy security and release checklist.\n\nExample\n${sampleRepoUrl}`;
  }

  const sections = zh
    ? [
        `上线体检\n评分：${analysis.launchScore.score}/100\n风险：${analysis.launchScore.riskLevel}\n${analysis.launchScore.summary}`,
        `五维评分卡\n${scorecardList(analysis.scorecard, true)}`,
        `修复优先级\n${priorityFixList(analysis.priorityFixes, true)}`,
        `上线前必须修\n${numberedList(analysis.mustFix)}`,
        `仓库\n${analysis.repository.fullName}\n${analysis.repository.url}`,
        `概览\n${bulletList(analysis.overview)}`,
        `技术栈\n${bulletList(analysis.techStack)}`,
        `如何运行\n${numberedList(analysis.howToRun)}`,
        `环境变量清单\n${bulletList(analysis.envChecklist)}`,
        `项目交接\n${bulletList(analysis.fileStructure)}`,
        `Issue 标签建议\n${bulletList(analysis.issueLabelPlan)}`,
        `安全提示\n${bulletList(analysis.securityNotes)}`,
        `README 建议\n${bulletList(analysis.readmeSuggestions)}`,
        `CI 建议\n${bulletList(analysis.githubActions)}`,
        `部署清单\n${numberedList(analysis.deploymentChecklist)}`,
        `PR 检查清单\n${numberedList(analysis.prReviewChecklist)}`,
        `可复制 PR 描述\n${analysis.prDescription}`,
        `发布清单\n${numberedList(analysis.releaseChecklist)}`,
        `可复制 GitHub Issues\n${analysis.copyableIssues.join("\n\n---\n\n")}`,
        `读取文件\n${bulletList(analysis.filesRead)}`,
      ]
    : [
        `Launch readiness\nScore: ${analysis.launchScore.score}/100\nRisk: ${analysis.launchScore.riskLevel}\n${analysis.launchScore.summary}`,
        `Five-point scorecard\n${scorecardList(analysis.scorecard, false)}`,
        `Fix priority\n${priorityFixList(analysis.priorityFixes, false)}`,
        `Must fix before launch\n${numberedList(analysis.mustFix)}`,
        `Repository\n${analysis.repository.fullName}\n${analysis.repository.url}`,
        `Overview\n${bulletList(analysis.overview)}`,
        `Tech stack\n${bulletList(analysis.techStack)}`,
        `How to run\n${numberedList(analysis.howToRun)}`,
        `Environment checklist\n${bulletList(analysis.envChecklist)}`,
        `Project handoff\n${bulletList(analysis.fileStructure)}`,
        `Issue label plan\n${bulletList(analysis.issueLabelPlan)}`,
        `Security notes\n${bulletList(analysis.securityNotes)}`,
        `README fixes\n${bulletList(analysis.readmeSuggestions)}`,
        `CI suggestions\n${bulletList(analysis.githubActions)}`,
        `Deployment checklist\n${numberedList(analysis.deploymentChecklist)}`,
        `PR review checklist\n${numberedList(analysis.prReviewChecklist)}`,
        `Copyable PR description\n${analysis.prDescription}`,
        `Release checklist\n${numberedList(analysis.releaseChecklist)}`,
        `Copyable GitHub issues\n${analysis.copyableIssues.join("\n\n---\n\n")}`,
        `Files read\n${bulletList(analysis.filesRead)}`,
      ];

  return sections.join("\n\n");
}

function repoAgeLabel(pushedAt: string) {
  const pushedTime = Date.parse(pushedAt);
  if (!Number.isFinite(pushedTime)) return "Unknown";
  const days = Math.max(0, Math.round((Date.now() - pushedTime) / 86_400_000));
  if (days === 0) return "Updated today";
  if (days === 1) return "Updated yesterday";
  if (days < 30) return `${days} days since update`;
  const months = Math.round(days / 30);
  return `${months} months since update`;
}

function qualityGateLabel(analysis: GitHubRepoAnalysis) {
  const hasCi = analysis.githubActions.some((item) => !/No GitHub Actions/i.test(item));
  const hasEnv = analysis.envChecklist.some((item) => /Detected env template keys/i.test(item));
  const hasRun = analysis.howToRun.some((item) => !/No package scripts/i.test(item));
  return [
    hasCi ? "CI signal found" : "CI needs work",
    hasEnv ? "env template found" : "env template missing",
    hasRun ? "run path found" : "run path unclear",
  ];
}

function impactLabel(score: number) {
  if (score >= 82) return "Launch polish";
  if (score >= 58) return "Staging cleanup";
  return "Launch blocked";
}

function scorecardStatusLabel(status: "pass" | "review" | "missing", zh: boolean) {
  if (status === "pass") return zh ? "通过" : "Pass";
  if (status === "review") return zh ? "待确认" : "Review";
  return zh ? "缺失" : "Missing";
}

function issueTitle(issue: string, index: number) {
  const firstLine = issue.split(/\r?\n/).find((line) => line.trim());
  return firstLine?.replace(/^#+\s*/, "").trim() || `GitHub issue ${index + 1}`;
}

function GitHubRepoAnalyzer({ language = "en", initialRepoUrl }: { language?: "en" | "zh"; initialRepoUrl?: string }) {
  const zh = language === "zh";
  const [url, setUrl] = useState(initialRepoUrl?.trim() || sampleRepoUrl);
  const [analysis, setAnalysis] = useState<GitHubRepoAnalysis | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [shareStatus, setShareStatus] = useState("");
  const [actionStatus, setActionStatus] = useState("");
  const [runStatus, setRunStatus] = useState(zh ? "准备体检" : "Ready to audit");
  const hasAutoRunRef = useRef(false);

  const output = useMemo(() => formatGitHubRepoOutput(analysis, error, language), [analysis, error, language]);
  const issueBundle = useMemo(() => analysis?.copyableIssues.join("\n\n---\n\n") || "", [analysis]);
  const releaseBundle = useMemo(() => analysis ? numberedList(analysis.releaseChecklist) : "", [analysis]);
  const prDescription = useMemo(() => analysis?.prDescription || "", [analysis]);
  const qualityGates = useMemo(() => analysis ? qualityGateLabel(analysis) : [], [analysis]);
  const shareUrl = useMemo(() => {
    if (!analysis || typeof window === "undefined") return "";
    const hash = encodeSharedAnalysis(analysis);
    return `${window.location.origin}/tools/github-repo-analyzer${window.location.search}#report=${hash}`;
  }, [analysis]);
  const blocks = useMemo<OutputBlock[]>(() => {
    if (!analysis) return [];
    return [
      { badge: `${analysis.launchScore.score}`, title: `${analysis.launchScore.riskLevel} risk verdict`, content: analysis.launchScore.summary },
      { badge: "01", title: zh ? "必须修" : "Must fix", content: numberedList(analysis.mustFix) },
      { badge: "02", title: zh ? "GitHub Issues" : "GitHub issues", content: analysis.copyableIssues.join("\n\n---\n\n") },
      { badge: "03", title: zh ? "PR 描述" : "PR description", content: analysis.prDescription },
      { badge: "04", title: zh ? "发布清单" : "Release checklist", content: numberedList(analysis.releaseChecklist) },
      { badge: "05", title: zh ? "环境变量清单" : "Environment checklist", content: bulletList(analysis.envChecklist) },
      { badge: "06", title: zh ? "README 优化" : "README upgrades", content: bulletList(analysis.readmeSuggestions) },
      { badge: "07", title: zh ? "PR 检查清单" : "PR review checklist", content: numberedList(analysis.prReviewChecklist) },
    ];
  }, [analysis, zh]);

  useEffect(() => {
    const shared = decodeSharedAnalysis(window.location.hash);
    if (!shared) return;
    window.setTimeout(() => {
      setAnalysis(shared);
      setUrl(shared.repository.url);
      setError("");
      hasAutoRunRef.current = true;
    }, 0);
  }, []);

  async function copyShareLink() {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setShareStatus(zh ? "分享链接已复制" : "Share link copied");
      window.setTimeout(() => setShareStatus(""), 1400);
    } catch {
      setShareStatus(zh ? "复制失败" : "Copy failed");
      window.setTimeout(() => setShareStatus(""), 1400);
    }
  }

  async function copyAuditText(text: string, successMessage: string) {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setActionStatus(successMessage);
      window.setTimeout(() => setActionStatus(""), 1400);
    } catch {
      setActionStatus(zh ? "复制失败" : "Copy failed");
      window.setTimeout(() => setActionStatus(""), 1400);
    }
  }

  const loadSamplePreview = useCallback((reason = zh ? "已加载本地样例报告" : "Local sample preview loaded") => {
    setUrl(sampleRepoUrl);
    setAnalysis(sampleGitHubAnalysis);
    setError("");
    setRunStatus(reason);
    if (typeof window !== "undefined") {
      window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}`);
    }
  }, [zh]);

  const analyzeRepo = useCallback(async (targetUrl = url) => {
    const trimmed = targetUrl.trim();
    if (!trimmed) {
      setError(zh ? "需要填写仓库地址" : "Repository URL is required");
      setAnalysis(null);
      setRunStatus(zh ? "需要仓库地址" : "URL required");
      return;
    }

    setUrl(trimmed);
    setLoading(true);
    setError("");
    setRunStatus(zh ? "正在读取公开仓库信号" : "Reading public repo signals");
    try {
      const response = await fetch("/api/tools/github-repo-analyzer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: trimmed }),
      });
      const data = (await response.json()) as GitHubRepoAnalyzerResponse;
      if (!response.ok || !data.success || !data.analysis) {
        throw new Error(data.error || data.message || "Could not run repository launch audit");
      }
      setAnalysis(data.analysis);
      setRunStatus(zh ? `体检完成 ${data.analysis.launchScore.score}/100` : `Audit complete ${data.analysis.launchScore.score}/100`);
      window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}`);
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : (zh ? "无法运行项目体检" : "Could not run repository launch audit");
      if (trimmed === sampleRepoUrl) {
        loadSamplePreview(zh ? "真实体检繁忙，已加载样例报告" : "Sample preview loaded because live audit is busy");
        return;
      }
      setAnalysis(null);
      setError(message);
      setRunStatus(message);
    } finally {
      setLoading(false);
    }
  }, [loadSamplePreview, url, zh]);

  function runSampleAudit() {
    loadSamplePreview(zh ? "已加载本地样例报告" : "Local sample preview loaded");
  }

  useEffect(() => {
    if (hasAutoRunRef.current || !initialRepoUrl?.trim()) return;
    hasAutoRunRef.current = true;
    const target = initialRepoUrl.trim();
    const timer = window.setTimeout(() => {
      if (target === sampleRepoUrl) {
        loadSamplePreview(zh ? "已根据首页输入生成样例报告" : "Sample report loaded from homepage input");
        return;
      }
      void analyzeRepo(target);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [analyzeRepo, initialRepoUrl, loadSamplePreview, zh]);

  return (
    <ToolLayout
      output={output}
      outputTitle={analysis ? `${analysis.launchScore.score}/100 ${zh ? "上线体检" : "launch audit"}` : (zh ? "上线体检" : "Launch audit")}
      language={language}
      blocks={blocks}
      actions={
        <>
          <button type="button" className="dense-action-primary" onClick={() => void analyzeRepo()} disabled={loading}>
            {loading ? (zh ? "体检中" : "Auditing repo") : (zh ? "体检仓库" : "Audit repo")}
          </button>
          <button type="button" className="dense-action" onClick={runSampleAudit} disabled={loading}>
            {zh ? "预览报告" : "Preview report"}
          </button>
          <button type="button" className="dense-action" onClick={() => void analyzeRepo(sampleRepoUrl)} disabled={loading}>
            {zh ? "真实样例" : "Live sample"}
          </button>
          {analysis && (
            <>
              <button type="button" className="dense-action" onClick={copyShareLink}>
                {shareStatus || (zh ? "复制分享链接" : "Copy share link")}
              </button>
              <a className="dense-action" href={shareUrl} target="_blank" rel="noreferrer">
                {zh ? "打开分享" : "Open share"}
              </a>
              <button type="button" className="dense-action" onClick={() => copyAuditText(issueBundle, zh ? "Issues 已复制" : "Issues copied")}>
                {zh ? "复制 GitHub Issues" : "Copy GitHub issues"}
              </button>
              <button type="button" className="dense-action" onClick={() => copyAuditText(releaseBundle, zh ? "发布清单已复制" : "Checklist copied")}>
                {zh ? "复制发布清单" : "Copy release checklist"}
              </button>
              <button type="button" className="dense-action" onClick={() => copyAuditText(prDescription, zh ? "PR 描述已复制" : "PR description copied")}>
                {zh ? "复制 PR 描述" : "Copy PR description"}
              </button>
              <a className="dense-action" href={analysis.repository.url} target="_blank" rel="noreferrer">
                {zh ? "打开仓库" : "Open repo"}
              </a>
            </>
          )}
          <button type="button" className="dense-action" onClick={() => { setUrl(sampleRepoUrl); setError(""); }}>
            {zh ? "重置样例" : "Reset sample"}
          </button>
          <button type="button" className="dense-action" onClick={() => { setUrl(""); setAnalysis(null); setError(""); }}>
            {zh ? "清空" : "Clear"}
          </button>
        </>
      }
    >
      <p className="eyebrow">{zh ? "仓库地址" : "Repo URL"}</p>
      <h2>{zh ? "检查上线阻塞项" : "Audit launch blockers"}</h2>
      {analysis ? (
        <section className={`repo-verdict repo-verdict-${riskTone(analysis.launchScore.riskLevel)}`}>
          <div>
            <p className="eyebrow">{zh ? "结论" : "Verdict"}</p>
            <strong>{analysis.launchScore.riskLevel} {zh ? "风险" : "risk"}</strong>
            <span>{analysis.launchScore.summary}</span>
          </div>
          <div className="repo-score">
            <strong>{analysis.launchScore.score}</strong>
            <span>/100</span>
          </div>
          <div className="repo-next-step">
            <p className="eyebrow">{zh ? "下一步修复" : "Next Fix"}</p>
            <span>{analysis.mustFix[0]}</span>
          </div>
        </section>
      ) : (
        <section className="repo-verdict repo-verdict-empty">
          <div>
            <p className="eyebrow">{zh ? "报告结构" : "Report Shape"}</p>
            <strong>{zh ? "评分 阻塞项 Issues 清单" : "Score blockers issues checklist"}</strong>
            <span>{zh ? "粘贴公开仓库，把上线前的繁琐检查变成任务。" : "Paste a public repo. Get the boring launch work turned into tasks."}</span>
          </div>
        </section>
      )}
      {analysis && (
        <section className="repo-audit-brief">
          <div>
            <p className="eyebrow">{zh ? "仓库" : "Repository"}</p>
            <strong>{analysis.repository.fullName}</strong>
            <span>{analysis.repository.language || (zh ? "未知" : "Unknown")} · {analysis.repository.license || (zh ? "无许可证" : "No license")} · {repoAgeLabel(analysis.repository.pushedAt)}</span>
          </div>
          <div>
            <p className="eyebrow">{zh ? "影响" : "Impact"}</p>
            <strong>{impactLabel(analysis.launchScore.score)}</strong>
            <span>{analysis.mustFix.length} {zh ? "个行动项" : "action items"} · {analysis.copyableIssues.length} {zh ? "个 Issue 草稿" : "issue drafts"}</span>
          </div>
          <div>
            <p className="eyebrow">{zh ? "质量门禁" : "Quality Gates"}</p>
            <strong>{qualityGates[0]}</strong>
            <span>{qualityGates.slice(1).join(" · ")}</span>
          </div>
        </section>
      )}
      <section className="repo-flow-strip">
        {["Repo", "README", "env", "CI", "Deploy", "Issues"].map((item, index) => (
          <span key={item} className={loading && index > 0 ? "repo-flow-pending" : ""}>
            {item}
          </span>
        ))}
        <strong>{runStatus}</strong>
      </section>
      <label className="block">
        <span className="tool-label">GitHub URL</span>
        <input
          value={url}
          onChange={(event) => setUrl(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") void analyzeRepo();
          }}
          className="tool-input"
          placeholder={sampleRepoUrl}
        />
      </label>
      <div className="tool-field-grid">
        <div className="dense-row">
          <span className="text-sm font-semibold">Scope</span>
          <span className="text-xs text-[color:var(--muted)]">{zh ? "仅公开仓库" : "Public repo only"}</span>
        </div>
        <div className="dense-row">
          <span className="text-sm font-semibold">Reads</span>
          <span className="text-xs text-[color:var(--muted)]">{zh ? "README 环境变量 CI 部署线索" : "README env CI deploy clues"}</span>
        </div>
        {analysis && (
          <div className="dense-row">
            <span className="text-sm font-semibold">Score</span>
            <span className="text-xs text-[color:var(--muted)]">{analysis.launchScore.score}/100 {analysis.launchScore.riskLevel}</span>
          </div>
        )}
      </div>
      {analysis && (
        <section className="repo-scorecard-grid">
          {analysis.scorecard.map((item) => (
            <article key={item.label} className={`repo-scorecard-item repo-scorecard-${item.status}`}>
              <div>
                <p className="eyebrow">{item.label}</p>
                <strong>{item.score}</strong>
              </div>
              <span>{scorecardStatusLabel(item.status, zh)}</span>
              <p>{item.note}</p>
            </article>
          ))}
        </section>
      )}
      {analysis && (
        <section className="repo-priority-grid">
          <article className="repo-priority-card repo-priority-today">
            <p className="eyebrow">{zh ? "今天必须修" : "Fix today"}</p>
            <ol className="repo-check-list">
              {(analysis.priorityFixes.today.length ? analysis.priorityFixes.today : [zh ? "今天没有必须立刻修的阻塞项" : "No same-day blocker detected"]).map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ol>
          </article>
          <article className="repo-priority-card">
            <p className="eyebrow">{zh ? "上线前修" : "Before launch"}</p>
            <ol className="repo-check-list">
              {(analysis.priorityFixes.beforeLaunch.length ? analysis.priorityFixes.beforeLaunch : [zh ? "上线前暂无额外必修项" : "No additional pre-launch item detected"]).map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ol>
          </article>
          <article className="repo-priority-card">
            <p className="eyebrow">{zh ? "后面优化" : "Later polish"}</p>
            <ol className="repo-check-list">
              {(analysis.priorityFixes.later.length ? analysis.priorityFixes.later : [zh ? "持续保持 README CI 环境变量和发布说明更新" : "Keep README CI env docs and release notes current"]).map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ol>
          </article>
        </section>
      )}
      {analysis && (
        <section className="repo-action-panel">
          <div>
            <p className="eyebrow">{zh ? "下一步" : "Ship Next"}</p>
            <h3>{zh ? "把报告变成任务" : "Turn report into tasks"}</h3>
            <p>{actionStatus || (zh ? "复制 Issue 后可直接贴进 GitHub Issues；复制清单可放到 PR 描述或发布说明里。" : "Copy issues into GitHub Issues. Copy the checklist into a PR description or release note.")}</p>
          </div>
          <div className="repo-action-list">
            {analysis.mustFix.slice(0, 3).map((item, index) => (
              <div key={item} className="dense-row">
                <span className="text-sm font-semibold">{String(index + 1).padStart(2, "0")}</span>
                <span className="truncate text-xs text-[color:var(--muted)]">{item}</span>
              </div>
            ))}
          </div>
        </section>
      )}
      {analysis && (
        <section className="repo-report-board">
          <div className="repo-report-head">
            <div>
              <p className="eyebrow">{zh ? "专业报告" : "Professional Report"}</p>
              <h3>{zh ? "上线体检报告" : "Launch readiness report"}</h3>
              <span>{analysis.repository.fullName} · {analysis.launchScore.riskLevel} {zh ? "风险" : "risk"} · {analysis.copyableIssues.length} {zh ? "个 Issue 草稿" : "issue drafts"}</span>
            </div>
            <div className="repo-report-score">
              <strong>{analysis.launchScore.score}</strong>
              <span>{zh ? "上线评分" : "Launch Score"}</span>
            </div>
          </div>

          <div className="repo-report-grid">
            <div className="repo-report-section repo-report-section-primary">
              <div className="repo-report-section-head">
                <p className="eyebrow">{zh ? "先修这些" : "Must Fix First"}</p>
                <button type="button" onClick={() => copyAuditText(numberedList(analysis.mustFix), zh ? "必须修清单已复制" : "Must fix copied")}>
                  {zh ? "复制" : "Copy"}
                </button>
              </div>
              <ol className="repo-check-list">
                {analysis.mustFix.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ol>
            </div>

            <div className="repo-report-section">
              <div className="repo-report-section-head">
                <p className="eyebrow">{zh ? "PR 描述" : "PR Description"}</p>
                <button type="button" onClick={() => copyAuditText(prDescription, zh ? "PR 描述已复制" : "PR description copied")}>
                  {zh ? "复制" : "Copy"}
                </button>
              </div>
              <pre className="repo-pr-description">{analysis.prDescription}</pre>
            </div>
          </div>

          <div className="repo-issue-grid">
            {analysis.copyableIssues.slice(0, 3).map((issue, index) => (
              <article key={issue} className="repo-issue-card">
                <div>
                  <p className="eyebrow">Issue {String(index + 1).padStart(2, "0")}</p>
                  <h4>{issueTitle(issue, index)}</h4>
                </div>
                <button type="button" onClick={() => copyAuditText(issue, zh ? `Issue ${index + 1} 已复制` : `Issue ${index + 1} copied`)}>
                  {zh ? "复制 Issue" : "Copy Issue"}
                </button>
              </article>
            ))}
          </div>
        </section>
      )}
    </ToolLayout>
  );
}


export default GitHubRepoAnalyzer;
