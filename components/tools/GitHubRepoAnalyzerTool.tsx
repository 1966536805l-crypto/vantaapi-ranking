"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ToolLayout, { type OutputBlock } from "@/components/tools/ToolLayout";
import type { InterfaceLanguage } from "@/lib/language";

type GitHubRepoAnalysis = {
  auditEngine?: {
    mode: "github-api" | "raw-fallback";
    aiDependency: "none";
    ruleVersion: string;
    checks: string[];
  };
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
  issueFindings: Array<{
    title: string;
    severity: "P0" | "P1" | "P2";
    evidence: string;
    source: string;
  }>;
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
  issueFindings: [
    {
      title: "Make required environment variables explicit in one env example section",
      severity: "P1",
      source: ".env.example",
      evidence: "Env expectations exist but need clearer local, preview, and production separation.",
    },
    {
      title: "Keep the README quick start path under five minutes",
      severity: "P1",
      source: "README.md",
      evidence: "README onboarding is the first contributor decision point.",
    },
    {
      title: "Keep release and PR checklists visible",
      severity: "P2",
      source: "README.md and release docs",
      evidence: "Launch process should not depend on private maintainer memory.",
    },
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

function bulletList(items: string[], empty = "No signal detected") {
  return items.length ? items.map((item) => `- ${item}`).join("\n") : `- ${empty}`;
}

function numberedList(items: string[], empty = "No action detected") {
  return items.length ? items.map((item, index) => `${index + 1}. ${item}`).join("\n") : `1. ${empty}`;
}

function scorecardList(items: GitHubRepoAnalysis["scorecard"], languageOrZh: InterfaceLanguage | boolean) {
  const language = typeof languageOrZh === "boolean" ? (languageOrZh ? "zh" : "en") : languageOrZh;
  const t = getAuditCopy(language);
  return items.length
    ? items.map((item) => `- ${item.label}: ${item.score}/100 · ${scorecardStatusLabel(item.status, language)} · ${item.note}`).join("\n")
    : `- ${t.statusMissing}`;
}

function priorityFixList(priorityFixes: GitHubRepoAnalysis["priorityFixes"], languageOrZh: InterfaceLanguage | boolean) {
  const language = typeof languageOrZh === "boolean" ? (languageOrZh ? "zh" : "en") : languageOrZh;
  const t = getAuditCopy(language);
  const today = priorityFixes.today.length ? priorityFixes.today : [t.noSameDayBlocker];
  const beforeLaunch = priorityFixes.beforeLaunch.length ? priorityFixes.beforeLaunch : [t.noPreLaunch];
  const later = priorityFixes.later.length ? priorityFixes.later : [t.laterFallback];
  return [
    t.fixToday,
    numberedList(today),
    t.beforeLaunch,
    numberedList(beforeLaunch),
    t.laterPolish,
    numberedList(later),
  ].join("\n");
}

function findingList(findings: GitHubRepoAnalysis["issueFindings"]) {
  return findings.length
    ? findings.map((item) => `- ${item.severity} ${item.title}\n  Source: ${item.source}\n  Evidence: ${item.evidence}`).join("\n")
    : "- No evidence-backed findings detected";
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
      Array.isArray(candidate.issueFindings) &&
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

function formatGitHubRepoOutput(analysis: GitHubRepoAnalysis | null, error: string, language: InterfaceLanguage = "en") {
  const zh = language === "zh";
  const t = getAuditCopy(language);
  if (error) {
    return `${t.verdict}\n${error}\n\n${t.repoUrl}\n${sampleRepoUrl}`;
  }
  if (!analysis) {
    return `${t.launchReadinessReport}\n${t.reportShapeBody}\n\n${t.repoUrl}\n${sampleRepoUrl}`;
  }

  const sections = zh
    ? [
        `上线体检\n评分：${analysis.launchScore.score}/100\n风险：${analysis.launchScore.riskLevel}\n${analysis.launchScore.summary}`,
        `五维评分卡\n${scorecardList(analysis.scorecard, language)}`,
        `修复优先级\n${priorityFixList(analysis.priorityFixes, language)}`,
        `证据和严重程度\n${findingList(analysis.issueFindings)}`,
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
        `${t.launchReadinessReport}\n${t.score}: ${analysis.launchScore.score}/100\n${t.risk}: ${riskLevelLabel(analysis.launchScore.riskLevel, language)}\n${analysis.launchScore.summary}`,
        `${t.qualityGates}\n${scorecardList(analysis.scorecard, language)}`,
        `${t.shipNext}\n${priorityFixList(analysis.priorityFixes, language)}`,
        `Evidence and severity\n${findingList(analysis.issueFindings)}`,
        `${t.mustFixFirst}\n${numberedList(analysis.mustFix)}`,
        `${t.repository}\n${analysis.repository.fullName}\n${analysis.repository.url}`,
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

function repoAgeLabel(pushedAt: string, language: InterfaceLanguage) {
  const t = getAuditCopy(language);
  const pushedTime = Date.parse(pushedAt);
  if (!Number.isFinite(pushedTime)) return t.unknownUpdate;
  const days = Math.max(0, Math.round((Date.now() - pushedTime) / 86_400_000));
  if (days === 0) return t.updatedToday;
  if (days === 1) return t.updatedYesterday;
  if (days < 30) return t.daysSinceUpdate(days);
  const months = Math.round(days / 30);
  return t.monthsSinceUpdate(months);
}

function qualityGateLabel(analysis: GitHubRepoAnalysis, language: InterfaceLanguage) {
  const t = getAuditCopy(language);
  const hasCi = analysis.githubActions.some((item) => !/No GitHub Actions/i.test(item));
  const hasEnv = analysis.envChecklist.some((item) => /Detected env template keys/i.test(item));
  const hasRun = analysis.howToRun.some((item) => !/No package scripts/i.test(item));
  return [
    hasCi ? t.qualityCiFound : t.qualityCiMissing,
    hasEnv ? t.qualityEnvFound : t.qualityEnvMissing,
    hasRun ? t.qualityRunFound : t.qualityRunMissing,
  ];
}

function impactLabel(score: number, language: InterfaceLanguage) {
  const t = getAuditCopy(language);
  if (score >= 82) return t.impactPolish;
  if (score >= 58) return t.impactCleanup;
  return t.impactBlocked;
}

function riskLevelLabel(riskLevel: GitHubRepoAnalysis["launchScore"]["riskLevel"], language: InterfaceLanguage) {
  const t = getAuditCopy(language);
  if (riskLevel === "Low") return t.riskLow;
  if (riskLevel === "Medium") return t.riskMedium;
  return t.riskHigh;
}

function auditModeLabel(mode: NonNullable<GitHubRepoAnalysis["auditEngine"]>["mode"] | undefined, language: InterfaceLanguage) {
  const t = getAuditCopy(language);
  if (mode === "raw-fallback") return t.auditModeRaw;
  return t.auditModeApi;
}

function scorecardStatusLabel(status: "pass" | "review" | "missing", languageOrZh: InterfaceLanguage | boolean) {
  const language = typeof languageOrZh === "boolean" ? (languageOrZh ? "zh" : "en") : languageOrZh;
  const t = getAuditCopy(language);
  if (status === "pass") return t.statusPass;
  if (status === "review") return t.statusReview;
  return t.statusMissing;
}

type AuditCopy = {
  ready: string;
  repoUrl: string;
  auditBlockers: string;
  auditRepo: string;
  auditingRepo: string;
  previewReport: string;
  liveSample: string;
  copyShareLink: string;
  shareLinkCopied: string;
  openShare: string;
  copyIssues: string;
  issuesCopied: string;
  copyReleaseChecklist: string;
  releaseChecklistCopied: string;
  copyPrDescription: string;
  prDescriptionCopied: string;
  openRepo: string;
  resetSample: string;
  clear: string;
  verdict: string;
  conclusion: string;
  risk: string;
  nextFix: string;
  reportShape: string;
  reportShapeTitle: string;
  reportShapeBody: string;
  engine: string;
  aiDependencyNone: string;
  repository: string;
  unknown: string;
  noLicense: string;
  impact: string;
  actionItems: string;
  issueDrafts: string;
  qualityGates: string;
  doThisFirst: string;
  turnIntoWork: string;
  copyIntoGithub: string;
  repoFlow: string[];
  auditMethod: string;
  deterministicRules: string;
  scope: string;
  publicRepoOnly: string;
  reads: string;
  readsValue: string;
  score: string;
  fixToday: string;
  noSameDayBlocker: string;
  beforeLaunch: string;
  noPreLaunch: string;
  laterPolish: string;
  laterFallback: string;
  shipNext: string;
  turnReportIntoTasks: string;
  actionPanelBody: string;
  professionalReport: string;
  launchReadinessReport: string;
  launchScore: string;
  mustFixFirst: string;
  copy: string;
  copyIssue: string;
  copied: string;
  mustFixCopied: string;
  issueCopied: (index: number) => string;
  pasteReady: string;
  items: string;
  drafts: string;
  steps: string;
  downloaded: string;
  urlRequired: string;
  readingSignals: string;
  auditComplete: (score: number) => string;
  samplePreviewLoaded: string;
  localSampleLoaded: string;
  liveAuditBusy: string;
  homepageSampleLoaded: string;
  copyFailed: string;
  qualityCiFound: string;
  qualityCiMissing: string;
  qualityEnvFound: string;
  qualityEnvMissing: string;
  qualityRunFound: string;
  qualityRunMissing: string;
  impactPolish: string;
  impactCleanup: string;
  impactBlocked: string;
  riskLow: string;
  riskMedium: string;
  riskHigh: string;
  riskSuffix: string;
  auditModeApi: string;
  auditModeRaw: string;
  statusPass: string;
  statusReview: string;
  statusMissing: string;
  updatedToday: string;
  updatedYesterday: string;
  daysSinceUpdate: (days: number) => string;
  monthsSinceUpdate: (months: number) => string;
  unknownUpdate: string;
};

const auditCopy: Partial<Record<InterfaceLanguage, AuditCopy>> & { en: AuditCopy; zh: AuditCopy } = {
  en: {
    ready: "Ready to audit",
    repoUrl: "Repo URL",
    auditBlockers: "Audit launch blockers",
    auditRepo: "Audit repo",
    auditingRepo: "Auditing repo",
    previewReport: "Preview report",
    liveSample: "Live sample",
    copyShareLink: "Copy share link",
    shareLinkCopied: "Share link copied",
    openShare: "Open share",
    copyIssues: "Copy GitHub issues",
    issuesCopied: "Issues copied",
    copyReleaseChecklist: "Copy release checklist",
    releaseChecklistCopied: "Checklist copied",
    copyPrDescription: "Copy PR description",
    prDescriptionCopied: "PR description copied",
    openRepo: "Open repo",
    resetSample: "Reset sample",
    clear: "Clear",
    verdict: "Verdict",
    conclusion: "Conclusion",
    risk: "risk",
    nextFix: "Next Fix",
    reportShape: "Report Shape",
    reportShapeTitle: "Score blockers issues checklist",
    reportShapeBody: "Paste a public repo. Get the boring launch work turned into tasks.",
    engine: "Engine",
    aiDependencyNone: "AI dependency none · rules first",
    repository: "Repository",
    unknown: "Unknown",
    noLicense: "No license",
    impact: "Impact",
    actionItems: "action items",
    issueDrafts: "issue drafts",
    qualityGates: "Quality Gates",
    doThisFirst: "Do this first",
    turnIntoWork: "Turn the audit into GitHub work",
    copyIntoGithub: "Copy straight into GitHub Issues PR descriptions or release notes",
    repoFlow: ["Repo", "README", "env", "CI", "Deploy", "Issues"],
    auditMethod: "Audit method",
    deterministicRules: "Deterministic rules first",
    scope: "Scope",
    publicRepoOnly: "Public repo only",
    reads: "Reads",
    readsValue: "README env CI deploy clues",
    score: "Score",
    fixToday: "Fix today",
    noSameDayBlocker: "No same-day blocker detected",
    beforeLaunch: "Before launch",
    noPreLaunch: "No additional pre-launch item detected",
    laterPolish: "Later polish",
    laterFallback: "Keep README CI env docs and release notes current",
    shipNext: "Ship Next",
    turnReportIntoTasks: "Turn report into tasks",
    actionPanelBody: "Copy issues into GitHub Issues. Copy the checklist into a PR description or release note.",
    professionalReport: "Professional Report",
    launchReadinessReport: "Launch readiness report",
    launchScore: "Launch Score",
    mustFixFirst: "Must Fix First",
    copy: "Copy",
    copyIssue: "Copy Issue",
    copied: "Copied",
    mustFixCopied: "Must fix copied",
    issueCopied: (index) => `Issue ${index} copied`,
    pasteReady: "paste ready",
    items: "items",
    drafts: "drafts",
    steps: "steps",
    downloaded: "Downloaded",
    urlRequired: "Repository URL is required",
    readingSignals: "Reading public repo signals",
    auditComplete: (score) => `Audit complete ${score}/100`,
    samplePreviewLoaded: "Sample preview loaded",
    localSampleLoaded: "Local sample preview loaded",
    liveAuditBusy: "Sample preview loaded because live audit is busy",
    homepageSampleLoaded: "Sample report loaded from homepage input",
    copyFailed: "Copy failed",
    qualityCiFound: "CI signal found",
    qualityCiMissing: "CI needs work",
    qualityEnvFound: "env template found",
    qualityEnvMissing: "env template missing",
    qualityRunFound: "run path found",
    qualityRunMissing: "run path unclear",
    impactPolish: "Launch polish",
    impactCleanup: "Staging cleanup",
    impactBlocked: "Launch blocked",
    riskLow: "Low",
    riskMedium: "Medium",
    riskHigh: "High",
    riskSuffix: "risk",
    auditModeApi: "GitHub API rules",
    auditModeRaw: "Raw file fallback",
    statusPass: "Pass",
    statusReview: "Review",
    statusMissing: "Missing",
    updatedToday: "Updated today",
    updatedYesterday: "Updated yesterday",
    daysSinceUpdate: (days) => `${days} days since update`,
    monthsSinceUpdate: (months) => `${months} months since update`,
    unknownUpdate: "Unknown",
  },
  zh: {
    ready: "准备体检",
    repoUrl: "仓库地址",
    auditBlockers: "检查上线阻塞项",
    auditRepo: "体检仓库",
    auditingRepo: "体检中",
    previewReport: "预览报告",
    liveSample: "真实样例",
    copyShareLink: "复制分享链接",
    shareLinkCopied: "分享链接已复制",
    openShare: "打开分享",
    copyIssues: "复制 GitHub Issues",
    issuesCopied: "Issues 已复制",
    copyReleaseChecklist: "复制发布清单",
    releaseChecklistCopied: "发布清单已复制",
    copyPrDescription: "复制 PR 描述",
    prDescriptionCopied: "PR 描述已复制",
    openRepo: "打开仓库",
    resetSample: "重置样例",
    clear: "清空",
    verdict: "结论",
    conclusion: "结论",
    risk: "风险",
    nextFix: "下一步修复",
    reportShape: "报告结构",
    reportShapeTitle: "评分 阻塞项 Issues 清单",
    reportShapeBody: "粘贴公开仓库，把上线前的繁琐检查变成任务。",
    engine: "引擎",
    aiDependencyNone: "AI 依赖 0 · 规则优先",
    repository: "仓库",
    unknown: "未知",
    noLicense: "无许可证",
    impact: "影响",
    actionItems: "个行动项",
    issueDrafts: "个 Issue 草稿",
    qualityGates: "质量门禁",
    doThisFirst: "先做这些",
    turnIntoWork: "把体检报告变成 GitHub 任务",
    copyIntoGithub: "复制后可以直接贴进 GitHub Issues PR 描述或发布说明",
    repoFlow: ["仓库", "README", "环境变量", "CI", "部署", "Issues"],
    auditMethod: "检查方式",
    deterministicRules: "确定性规则优先",
    scope: "范围",
    publicRepoOnly: "仅公开仓库",
    reads: "读取",
    readsValue: "README 环境变量 CI 部署线索",
    score: "评分",
    fixToday: "今天必须修",
    noSameDayBlocker: "今天没有必须立刻修的阻塞项",
    beforeLaunch: "上线前修",
    noPreLaunch: "上线前暂无额外必修项",
    laterPolish: "后面优化",
    laterFallback: "持续保持 README CI 环境变量和发布说明更新",
    shipNext: "下一步",
    turnReportIntoTasks: "把报告变成任务",
    actionPanelBody: "复制 Issue 后可直接贴进 GitHub Issues；复制清单可放到 PR 描述或发布说明里。",
    professionalReport: "专业报告",
    launchReadinessReport: "上线体检报告",
    launchScore: "上线评分",
    mustFixFirst: "先修这些",
    copy: "复制",
    copyIssue: "复制 Issue",
    copied: "已复制",
    mustFixCopied: "必须修清单已复制",
    issueCopied: (index) => `Issue ${index} 已复制`,
    pasteReady: "可直接粘贴",
    items: "项",
    drafts: "个草稿",
    steps: "步",
    downloaded: "已下载",
    urlRequired: "需要填写仓库地址",
    readingSignals: "正在读取公开仓库信号",
    auditComplete: (score) => `体检完成 ${score}/100`,
    samplePreviewLoaded: "已加载样例报告",
    localSampleLoaded: "已加载本地样例报告",
    liveAuditBusy: "真实体检繁忙，已加载样例报告",
    homepageSampleLoaded: "已根据首页输入生成样例报告",
    copyFailed: "复制失败",
    qualityCiFound: "发现 CI 信号",
    qualityCiMissing: "CI 需要补强",
    qualityEnvFound: "发现环境变量模板",
    qualityEnvMissing: "缺少环境变量模板",
    qualityRunFound: "发现运行路径",
    qualityRunMissing: "运行路径不清楚",
    impactPolish: "上线前精修",
    impactCleanup: "预发布清理",
    impactBlocked: "上线被阻塞",
    riskLow: "低",
    riskMedium: "中",
    riskHigh: "高",
    riskSuffix: "风险",
    auditModeApi: "GitHub API 规则检查",
    auditModeRaw: "原始文件兜底",
    statusPass: "通过",
    statusReview: "待确认",
    statusMissing: "缺失",
    updatedToday: "今天更新",
    updatedYesterday: "昨天更新",
    daysSinceUpdate: (days) => `${days} 天前更新`,
    monthsSinceUpdate: (months) => `${months} 个月前更新`,
    unknownUpdate: "更新时间未知",
  },
  ja: {
    ready: "監査準備完了",
    repoUrl: "リポジトリ URL",
    auditBlockers: "リリース阻害要因を監査",
    auditRepo: "リポジトリを監査",
    auditingRepo: "監査中",
    previewReport: "レポートをプレビュー",
    liveSample: "ライブ例",
    copyShareLink: "共有リンクをコピー",
    shareLinkCopied: "共有リンクをコピーしました",
    openShare: "共有を開く",
    copyIssues: "GitHub Issues をコピー",
    issuesCopied: "Issues をコピーしました",
    copyReleaseChecklist: "リリースチェックリストをコピー",
    releaseChecklistCopied: "チェックリストをコピーしました",
    copyPrDescription: "PR 説明をコピー",
    prDescriptionCopied: "PR 説明をコピーしました",
    openRepo: "リポジトリを開く",
    resetSample: "例をリセット",
    clear: "クリア",
    verdict: "判定",
    conclusion: "結論",
    risk: "リスク",
    nextFix: "次に直すこと",
    reportShape: "レポート構成",
    reportShapeTitle: "スコア ブロッカー Issues チェックリスト",
    reportShapeBody: "公開リポジトリを貼り付けると、公開前の面倒な作業をタスクに変えます。",
    engine: "エンジン",
    aiDependencyNone: "AI 依存なし · ルール優先",
    repository: "リポジトリ",
    unknown: "不明",
    noLicense: "ライセンスなし",
    impact: "影響",
    actionItems: "件のアクション",
    issueDrafts: "件の Issue 下書き",
    qualityGates: "品質ゲート",
    doThisFirst: "まずこれを実行",
    turnIntoWork: "監査を GitHub 作業に変換",
    copyIntoGithub: "GitHub Issues、PR 説明、リリースノートにそのまま貼り付けられます",
    repoFlow: ["Repo", "README", "env", "CI", "Deploy", "Issues"],
    auditMethod: "監査方式",
    deterministicRules: "決定的ルール優先",
    scope: "範囲",
    publicRepoOnly: "公開リポジトリのみ",
    reads: "読み取り",
    readsValue: "README env CI deploy の手がかり",
    score: "スコア",
    fixToday: "今日直す",
    noSameDayBlocker: "今日中のブロッカーは検出されていません",
    beforeLaunch: "公開前に修正",
    noPreLaunch: "公開前の追加必須項目はありません",
    laterPolish: "後で改善",
    laterFallback: "README CI env docs リリースノートを最新に保つ",
    shipNext: "次の出荷作業",
    turnReportIntoTasks: "レポートをタスクに変換",
    actionPanelBody: "Issues を GitHub Issues に、チェックリストを PR 説明やリリースノートに貼り付けます。",
    professionalReport: "専門レポート",
    launchReadinessReport: "リリース準備レポート",
    launchScore: "リリーススコア",
    mustFixFirst: "最初に直す",
    copy: "コピー",
    copyIssue: "Issue をコピー",
    copied: "コピーしました",
    mustFixCopied: "最優先修正リストをコピーしました",
    issueCopied: (index) => `Issue ${index} をコピーしました`,
    pasteReady: "貼り付け可能",
    items: "項目",
    drafts: "下書き",
    steps: "手順",
    downloaded: "ダウンロード完了",
    urlRequired: "リポジトリ URL が必要です",
    readingSignals: "公開リポジトリの信号を読み取り中",
    auditComplete: (score) => `監査完了 ${score}/100`,
    samplePreviewLoaded: "サンプルプレビューを読み込みました",
    localSampleLoaded: "ローカルサンプルを読み込みました",
    liveAuditBusy: "ライブ監査が混雑しているためサンプルを読み込みました",
    homepageSampleLoaded: "ホーム入力からサンプルレポートを読み込みました",
    copyFailed: "コピー失敗",
    qualityCiFound: "CI 信号あり",
    qualityCiMissing: "CI 要改善",
    qualityEnvFound: "env テンプレートあり",
    qualityEnvMissing: "env テンプレートなし",
    qualityRunFound: "実行手順あり",
    qualityRunMissing: "実行手順が不明",
    impactPolish: "公開前の仕上げ",
    impactCleanup: "ステージング整理",
    impactBlocked: "公開ブロック",
    riskLow: "低",
    riskMedium: "中",
    riskHigh: "高",
    riskSuffix: "リスク",
    auditModeApi: "GitHub API ルール",
    auditModeRaw: "Raw ファイル代替",
    statusPass: "通過",
    statusReview: "確認",
    statusMissing: "不足",
    updatedToday: "今日更新",
    updatedYesterday: "昨日更新",
    daysSinceUpdate: (days) => `${days} 日前に更新`,
    monthsSinceUpdate: (months) => `${months} か月前に更新`,
    unknownUpdate: "更新日不明",
  },
  ko: {
    ready: "점검 준비됨",
    repoUrl: "저장소 URL",
    auditBlockers: "출시 차단 항목 점검",
    auditRepo: "저장소 점검",
    auditingRepo: "점검 중",
    previewReport: "보고서 미리보기",
    liveSample: "실제 예시",
    copyShareLink: "공유 링크 복사",
    shareLinkCopied: "공유 링크 복사됨",
    openShare: "공유 열기",
    copyIssues: "GitHub Issues 복사",
    issuesCopied: "Issues 복사됨",
    copyReleaseChecklist: "출시 체크리스트 복사",
    releaseChecklistCopied: "체크리스트 복사됨",
    copyPrDescription: "PR 설명 복사",
    prDescriptionCopied: "PR 설명 복사됨",
    openRepo: "저장소 열기",
    resetSample: "예시 초기화",
    clear: "비우기",
    verdict: "판정",
    conclusion: "결론",
    risk: "위험",
    nextFix: "다음 수정",
    reportShape: "보고서 구조",
    reportShapeTitle: "점수 차단 항목 Issues 체크리스트",
    reportShapeBody: "공개 저장소를 붙여 넣으면 출시 전 잡일을 작업으로 바꿉니다.",
    engine: "엔진",
    aiDependencyNone: "AI 의존 없음 · 규칙 우선",
    repository: "저장소",
    unknown: "알 수 없음",
    noLicense: "라이선스 없음",
    impact: "영향",
    actionItems: "개 작업",
    issueDrafts: "개 Issue 초안",
    qualityGates: "품질 게이트",
    doThisFirst: "먼저 할 일",
    turnIntoWork: "점검을 GitHub 작업으로 전환",
    copyIntoGithub: "GitHub Issues PR 설명 또는 릴리스 노트에 바로 붙여 넣을 수 있습니다",
    repoFlow: ["Repo", "README", "env", "CI", "Deploy", "Issues"],
    auditMethod: "점검 방식",
    deterministicRules: "결정적 규칙 우선",
    scope: "범위",
    publicRepoOnly: "공개 저장소만",
    reads: "읽는 내용",
    readsValue: "README env CI deploy 단서",
    score: "점수",
    fixToday: "오늘 수정",
    noSameDayBlocker: "오늘 바로 고칠 차단 항목 없음",
    beforeLaunch: "출시 전 수정",
    noPreLaunch: "추가 출시 전 필수 항목 없음",
    laterPolish: "나중에 개선",
    laterFallback: "README CI env 문서와 릴리스 노트를 최신으로 유지",
    shipNext: "다음 출시 작업",
    turnReportIntoTasks: "보고서를 작업으로 전환",
    actionPanelBody: "Issues 는 GitHub Issues 에, 체크리스트는 PR 설명이나 릴리스 노트에 붙여 넣으세요.",
    professionalReport: "전문 보고서",
    launchReadinessReport: "출시 준비 보고서",
    launchScore: "출시 점수",
    mustFixFirst: "먼저 수정",
    copy: "복사",
    copyIssue: "Issue 복사",
    copied: "복사됨",
    mustFixCopied: "우선 수정 목록 복사됨",
    issueCopied: (index) => `Issue ${index} 복사됨`,
    pasteReady: "붙여넣기 가능",
    items: "개 항목",
    drafts: "개 초안",
    steps: "단계",
    downloaded: "다운로드됨",
    urlRequired: "저장소 URL이 필요합니다",
    readingSignals: "공개 저장소 신호 읽는 중",
    auditComplete: (score) => `점검 완료 ${score}/100`,
    samplePreviewLoaded: "샘플 미리보기 로드됨",
    localSampleLoaded: "로컬 샘플 보고서 로드됨",
    liveAuditBusy: "실시간 점검이 바빠 샘플 보고서를 로드했습니다",
    homepageSampleLoaded: "홈 입력에서 샘플 보고서를 로드했습니다",
    copyFailed: "복사 실패",
    qualityCiFound: "CI 신호 발견",
    qualityCiMissing: "CI 보강 필요",
    qualityEnvFound: "env 템플릿 발견",
    qualityEnvMissing: "env 템플릿 없음",
    qualityRunFound: "실행 경로 발견",
    qualityRunMissing: "실행 경로 불명확",
    impactPolish: "출시 전 마감",
    impactCleanup: "스테이징 정리",
    impactBlocked: "출시 차단",
    riskLow: "낮음",
    riskMedium: "중간",
    riskHigh: "높음",
    riskSuffix: "위험",
    auditModeApi: "GitHub API 규칙",
    auditModeRaw: "Raw 파일 대체",
    statusPass: "통과",
    statusReview: "검토",
    statusMissing: "누락",
    updatedToday: "오늘 업데이트",
    updatedYesterday: "어제 업데이트",
    daysSinceUpdate: (days) => `${days}일 전 업데이트`,
    monthsSinceUpdate: (months) => `${months}개월 전 업데이트`,
    unknownUpdate: "업데이트 알 수 없음",
  },
  es: {
    ready: "Listo para auditar",
    repoUrl: "URL del repo",
    auditBlockers: "Auditar bloqueos de lanzamiento",
    auditRepo: "Auditar repo",
    auditingRepo: "Auditando repo",
    previewReport: "Vista previa",
    liveSample: "Ejemplo real",
    copyShareLink: "Copiar enlace",
    shareLinkCopied: "Enlace copiado",
    openShare: "Abrir enlace",
    copyIssues: "Copiar GitHub issues",
    issuesCopied: "Issues copiados",
    copyReleaseChecklist: "Copiar checklist",
    releaseChecklistCopied: "Checklist copiado",
    copyPrDescription: "Copiar descripción PR",
    prDescriptionCopied: "Descripción PR copiada",
    openRepo: "Abrir repo",
    resetSample: "Reiniciar ejemplo",
    clear: "Limpiar",
    verdict: "Veredicto",
    conclusion: "Conclusión",
    risk: "riesgo",
    nextFix: "Siguiente arreglo",
    reportShape: "Forma del reporte",
    reportShapeTitle: "Score bloqueos issues checklist",
    reportShapeBody: "Pega un repo público y convierte el trabajo aburrido de lanzamiento en tareas.",
    engine: "Motor",
    aiDependencyNone: "Sin dependencia AI · reglas primero",
    repository: "Repositorio",
    unknown: "Desconocido",
    noLicense: "Sin licencia",
    impact: "Impacto",
    actionItems: "acciones",
    issueDrafts: "borradores de issue",
    qualityGates: "Puertas de calidad",
    doThisFirst: "Haz esto primero",
    turnIntoWork: "Convierte el audit en trabajo GitHub",
    copyIntoGithub: "Copia directo en GitHub Issues descripciones PR o notas de release",
    repoFlow: ["Repo", "README", "env", "CI", "Deploy", "Issues"],
    auditMethod: "Método de audit",
    deterministicRules: "Reglas deterministas primero",
    scope: "Alcance",
    publicRepoOnly: "Solo repos públicos",
    reads: "Lee",
    readsValue: "pistas README env CI deploy",
    score: "Score",
    fixToday: "Corregir hoy",
    noSameDayBlocker: "No hay bloqueo para hoy",
    beforeLaunch: "Antes de lanzar",
    noPreLaunch: "No hay extra obligatorio antes de lanzar",
    laterPolish: "Mejora posterior",
    laterFallback: "Mantén README CI env docs y release notes al día",
    shipNext: "Siguiente envío",
    turnReportIntoTasks: "Convertir reporte en tareas",
    actionPanelBody: "Copia issues a GitHub Issues. Copia checklist a PR o release notes.",
    professionalReport: "Reporte profesional",
    launchReadinessReport: "Reporte de preparación",
    launchScore: "Score de lanzamiento",
    mustFixFirst: "Corregir primero",
    copy: "Copiar",
    copyIssue: "Copiar Issue",
    copied: "Copiado",
    mustFixCopied: "Lista prioritaria copiada",
    issueCopied: (index) => `Issue ${index} copiado`,
    pasteReady: "listo para pegar",
    items: "items",
    drafts: "borradores",
    steps: "pasos",
    downloaded: "Descargado",
    urlRequired: "La URL del repositorio es obligatoria",
    readingSignals: "Leyendo señales públicas del repo",
    auditComplete: (score) => `Audit completo ${score}/100`,
    samplePreviewLoaded: "Vista previa cargada",
    localSampleLoaded: "Ejemplo local cargado",
    liveAuditBusy: "Audit real ocupado. Se cargó ejemplo",
    homepageSampleLoaded: "Reporte de ejemplo cargado desde inicio",
    copyFailed: "No se pudo copiar",
    qualityCiFound: "CI encontrado",
    qualityCiMissing: "CI necesita trabajo",
    qualityEnvFound: "plantilla env encontrada",
    qualityEnvMissing: "falta plantilla env",
    qualityRunFound: "ruta de ejecución encontrada",
    qualityRunMissing: "ruta de ejecución confusa",
    impactPolish: "Pulido de lanzamiento",
    impactCleanup: "Limpieza staging",
    impactBlocked: "Lanzamiento bloqueado",
    riskLow: "Bajo",
    riskMedium: "Medio",
    riskHigh: "Alto",
    riskSuffix: "riesgo",
    auditModeApi: "Reglas GitHub API",
    auditModeRaw: "Fallback de archivos raw",
    statusPass: "Pasa",
    statusReview: "Revisar",
    statusMissing: "Falta",
    updatedToday: "Actualizado hoy",
    updatedYesterday: "Actualizado ayer",
    daysSinceUpdate: (days) => `${days} días desde actualización`,
    monthsSinceUpdate: (months) => `${months} meses desde actualización`,
    unknownUpdate: "Desconocido",
  },
  ar: {
    ready: "جاهز للفحص",
    repoUrl: "رابط المستودع",
    auditBlockers: "فحص عوائق الإطلاق",
    auditRepo: "فحص المستودع",
    auditingRepo: "جار الفحص",
    previewReport: "معاينة التقرير",
    liveSample: "مثال مباشر",
    copyShareLink: "نسخ رابط المشاركة",
    shareLinkCopied: "تم نسخ رابط المشاركة",
    openShare: "فتح المشاركة",
    copyIssues: "نسخ GitHub Issues",
    issuesCopied: "تم نسخ Issues",
    copyReleaseChecklist: "نسخ قائمة الإطلاق",
    releaseChecklistCopied: "تم نسخ القائمة",
    copyPrDescription: "نسخ وصف PR",
    prDescriptionCopied: "تم نسخ وصف PR",
    openRepo: "فتح المستودع",
    resetSample: "إعادة المثال",
    clear: "مسح",
    verdict: "الحكم",
    conclusion: "الخلاصة",
    risk: "مخاطر",
    nextFix: "الإصلاح التالي",
    reportShape: "شكل التقرير",
    reportShapeTitle: "الدرجة العوائق Issues القائمة",
    reportShapeBody: "الصق مستودعا عاما وحوّل أعمال الإطلاق المملة إلى مهام.",
    engine: "المحرك",
    aiDependencyNone: "لا اعتماد على AI · القواعد أولا",
    repository: "المستودع",
    unknown: "غير معروف",
    noLicense: "لا ترخيص",
    impact: "الأثر",
    actionItems: "إجراءات",
    issueDrafts: "مسودات Issue",
    qualityGates: "بوابات الجودة",
    doThisFirst: "ابدأ بهذا",
    turnIntoWork: "حوّل الفحص إلى عمل على GitHub",
    copyIntoGithub: "انسخ مباشرة إلى GitHub Issues أو وصف PR أو ملاحظات الإصدار",
    repoFlow: ["Repo", "README", "env", "CI", "Deploy", "Issues"],
    auditMethod: "طريقة الفحص",
    deterministicRules: "القواعد الحتمية أولا",
    scope: "النطاق",
    publicRepoOnly: "المستودعات العامة فقط",
    reads: "يقرأ",
    readsValue: "إشارات README env CI deploy",
    score: "الدرجة",
    fixToday: "أصلح اليوم",
    noSameDayBlocker: "لا يوجد عائق يجب إصلاحه اليوم",
    beforeLaunch: "قبل الإطلاق",
    noPreLaunch: "لا يوجد بند إضافي قبل الإطلاق",
    laterPolish: "تحسين لاحق",
    laterFallback: "حافظ على README و CI و env docs وملاحظات الإصدار محدثة",
    shipNext: "الخطوة التالية",
    turnReportIntoTasks: "حوّل التقرير إلى مهام",
    actionPanelBody: "انسخ Issues إلى GitHub Issues وانسخ القائمة إلى وصف PR أو ملاحظات الإصدار.",
    professionalReport: "تقرير احترافي",
    launchReadinessReport: "تقرير جاهزية الإطلاق",
    launchScore: "درجة الإطلاق",
    mustFixFirst: "أصلح أولا",
    copy: "نسخ",
    copyIssue: "نسخ Issue",
    copied: "تم النسخ",
    mustFixCopied: "تم نسخ قائمة الإصلاحات الأولى",
    issueCopied: (index) => `تم نسخ Issue ${index}`,
    pasteReady: "جاهز للصق",
    items: "عناصر",
    drafts: "مسودات",
    steps: "خطوات",
    downloaded: "تم التنزيل",
    urlRequired: "رابط المستودع مطلوب",
    readingSignals: "جار قراءة إشارات المستودع العامة",
    auditComplete: (score) => `اكتمل الفحص ${score}/100`,
    samplePreviewLoaded: "تم تحميل معاينة المثال",
    localSampleLoaded: "تم تحميل تقرير المثال المحلي",
    liveAuditBusy: "الفحص المباشر مشغول وتم تحميل مثال",
    homepageSampleLoaded: "تم تحميل تقرير مثال من الصفحة الرئيسية",
    copyFailed: "فشل النسخ",
    qualityCiFound: "تم العثور على CI",
    qualityCiMissing: "CI يحتاج عمل",
    qualityEnvFound: "تم العثور على قالب env",
    qualityEnvMissing: "قالب env مفقود",
    qualityRunFound: "مسار التشغيل موجود",
    qualityRunMissing: "مسار التشغيل غير واضح",
    impactPolish: "تحسين قبل الإطلاق",
    impactCleanup: "تنظيف staging",
    impactBlocked: "الإطلاق محظور",
    riskLow: "منخفض",
    riskMedium: "متوسط",
    riskHigh: "عال",
    riskSuffix: "مخاطر",
    auditModeApi: "قواعد GitHub API",
    auditModeRaw: "بديل ملفات raw",
    statusPass: "ناجح",
    statusReview: "مراجعة",
    statusMissing: "مفقود",
    updatedToday: "تحديث اليوم",
    updatedYesterday: "تحديث أمس",
    daysSinceUpdate: (days) => `منذ ${days} أيام`,
    monthsSinceUpdate: (months) => `منذ ${months} أشهر`,
    unknownUpdate: "غير معروف",
  },
};

function getAuditCopy(language: InterfaceLanguage) {
  return auditCopy[language] || auditCopy.en;
}

function issueTitle(issue: string, index: number) {
  const firstLine = issue.split(/\r?\n/).find((line) => line.trim());
  return firstLine?.replace(/^#+\s*/, "").trim() || `GitHub issue ${index + 1}`;
}

function GitHubRepoAnalyzer({ language = "en", initialRepoUrl }: { language?: InterfaceLanguage; initialRepoUrl?: string }) {
  const t = getAuditCopy(language);
  const [url, setUrl] = useState(initialRepoUrl?.trim() || sampleRepoUrl);
  const [analysis, setAnalysis] = useState<GitHubRepoAnalysis | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [shareStatus, setShareStatus] = useState("");
  const [actionStatus, setActionStatus] = useState("");
  const [runStatus, setRunStatus] = useState(t.ready);
  const hasAutoRunRef = useRef(false);

  const output = useMemo(() => formatGitHubRepoOutput(analysis, error, language), [analysis, error, language]);
  const issueBundle = useMemo(() => analysis?.copyableIssues.join("\n\n---\n\n") || "", [analysis]);
  const releaseBundle = useMemo(() => analysis ? numberedList(analysis.releaseChecklist) : "", [analysis]);
  const prDescription = useMemo(() => analysis?.prDescription || "", [analysis]);
  const qualityGates = useMemo(() => analysis ? qualityGateLabel(analysis, language) : [], [analysis, language]);
  const shareUrl = useMemo(() => {
    if (!analysis || typeof window === "undefined") return "";
    const hash = encodeSharedAnalysis(analysis);
    return `${window.location.origin}/tools/github-repo-analyzer${window.location.search}#report=${hash}`;
  }, [analysis]);
  const blocks = useMemo<OutputBlock[]>(() => {
    if (!analysis) return [];
    return [
      { badge: `${analysis.launchScore.score}`, title: `${riskLevelLabel(analysis.launchScore.riskLevel, language)} ${t.riskSuffix}`, content: analysis.launchScore.summary },
      { badge: "01", title: t.mustFixFirst, content: numberedList(analysis.mustFix) },
      { badge: "02", title: "GitHub Issues", content: analysis.copyableIssues.join("\n\n---\n\n") },
      { badge: "03", title: t.copyPrDescription.replace(/^Copy\s+/i, "").replace(/^复制\s*/, ""), content: analysis.prDescription },
      { badge: "04", title: t.copyReleaseChecklist.replace(/^Copy\s+/i, "").replace(/^复制\s*/, ""), content: numberedList(analysis.releaseChecklist) },
      { badge: "05", title: t.conclusion, content: findingList(analysis.issueFindings) },
      { badge: "06", title: "README", content: bulletList(analysis.readmeSuggestions) },
    ];
  }, [analysis, language, t]);

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
      setShareStatus(t.shareLinkCopied);
      window.setTimeout(() => setShareStatus(""), 1400);
    } catch {
      setShareStatus(t.copyFailed);
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
      setActionStatus(t.copyFailed);
      window.setTimeout(() => setActionStatus(""), 1400);
    }
  }

  const loadSamplePreview = useCallback((reason = t.localSampleLoaded) => {
    setUrl(sampleRepoUrl);
    setAnalysis(sampleGitHubAnalysis);
    setError("");
    setRunStatus(reason);
    if (typeof window !== "undefined") {
      window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}`);
    }
  }, [t.localSampleLoaded]);

  const analyzeRepo = useCallback(async (targetUrl = url) => {
    const trimmed = targetUrl.trim();
    if (!trimmed) {
      setError(t.urlRequired);
      setAnalysis(null);
      setRunStatus(t.urlRequired);
      return;
    }

    setUrl(trimmed);
    setLoading(true);
    setError("");
    setRunStatus(t.readingSignals);
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
      setRunStatus(t.auditComplete(data.analysis.launchScore.score));
      window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}`);
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : t.copyFailed;
      if (trimmed === sampleRepoUrl) {
        loadSamplePreview(t.liveAuditBusy);
        return;
      }
      setAnalysis(null);
      setError(message);
      setRunStatus(message);
    } finally {
      setLoading(false);
    }
  }, [loadSamplePreview, t, url]);

  function runSampleAudit() {
    loadSamplePreview(t.localSampleLoaded);
  }

  useEffect(() => {
    if (hasAutoRunRef.current || !initialRepoUrl?.trim()) return;
    hasAutoRunRef.current = true;
    const target = initialRepoUrl.trim();
    const timer = window.setTimeout(() => {
      if (target === sampleRepoUrl) {
        loadSamplePreview(t.homepageSampleLoaded);
        return;
      }
      void analyzeRepo(target);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [analyzeRepo, initialRepoUrl, loadSamplePreview, t.homepageSampleLoaded]);

  return (
    <ToolLayout
      output={output}
      outputTitle={analysis ? `${analysis.launchScore.score}/100 ${t.launchReadinessReport}` : t.launchReadinessReport}
      language={language}
      blocks={blocks}
      actions={
        <>
          <button type="button" className="dense-action-primary" onClick={() => void analyzeRepo()} disabled={loading}>
            {loading ? t.auditingRepo : t.auditRepo}
          </button>
          <button type="button" className="dense-action" onClick={runSampleAudit} disabled={loading}>
            {t.previewReport}
          </button>
          <button type="button" className="dense-action" onClick={() => void analyzeRepo(sampleRepoUrl)} disabled={loading}>
            {t.liveSample}
          </button>
          {analysis && (
            <>
              <button type="button" className="dense-action" onClick={copyShareLink}>
                {shareStatus || t.copyShareLink}
              </button>
              <a className="dense-action" href={shareUrl} target="_blank" rel="noreferrer">
                {t.openShare}
              </a>
              <button type="button" className="dense-action" onClick={() => copyAuditText(issueBundle, t.issuesCopied)}>
                {t.copyIssues}
              </button>
              <button type="button" className="dense-action" onClick={() => copyAuditText(releaseBundle, t.releaseChecklistCopied)}>
                {t.copyReleaseChecklist}
              </button>
              <button type="button" className="dense-action" onClick={() => copyAuditText(prDescription, t.prDescriptionCopied)}>
                {t.copyPrDescription}
              </button>
              <a className="dense-action" href={analysis.repository.url} target="_blank" rel="noreferrer">
                {t.openRepo}
              </a>
            </>
          )}
          <button type="button" className="dense-action" onClick={() => { setUrl(sampleRepoUrl); setError(""); }}>
            {t.resetSample}
          </button>
          <button type="button" className="dense-action" onClick={() => { setUrl(""); setAnalysis(null); setError(""); }}>
            {t.clear}
          </button>
        </>
      }
    >
      <p className="eyebrow">{t.repoUrl}</p>
      <h2>{t.auditBlockers}</h2>
      {analysis ? (
        <section className={`repo-verdict repo-verdict-${riskTone(analysis.launchScore.riskLevel)}`}>
          <div>
            <p className="eyebrow">{t.verdict}</p>
            <strong>{riskLevelLabel(analysis.launchScore.riskLevel, language)} {t.risk}</strong>
            <span>{analysis.launchScore.summary}</span>
          </div>
          <div className="repo-score">
            <strong>{analysis.launchScore.score}</strong>
            <span>/100</span>
          </div>
          <div className="repo-next-step">
            <p className="eyebrow">{t.nextFix}</p>
            <span>{analysis.mustFix[0]}</span>
          </div>
        </section>
      ) : (
        <section className="repo-verdict repo-verdict-empty">
          <div>
            <p className="eyebrow">{t.reportShape}</p>
            <strong>{t.reportShapeTitle}</strong>
            <span>{t.reportShapeBody}</span>
          </div>
        </section>
      )}
      {analysis && (
        <section className="repo-audit-brief">
          <div>
            <p className="eyebrow">{t.engine}</p>
            <strong>{auditModeLabel(analysis.auditEngine?.mode, language)}</strong>
            <span>{t.aiDependencyNone}</span>
          </div>
          <div>
            <p className="eyebrow">{t.repository}</p>
            <strong>{analysis.repository.fullName}</strong>
            <span>{analysis.repository.language || t.unknown} · {analysis.repository.license || t.noLicense} · {repoAgeLabel(analysis.repository.pushedAt, language)}</span>
          </div>
          <div>
            <p className="eyebrow">{t.impact}</p>
            <strong>{impactLabel(analysis.launchScore.score, language)}</strong>
            <span>{analysis.mustFix.length} {t.actionItems} · {analysis.copyableIssues.length} {t.issueDrafts}</span>
          </div>
          <div>
            <p className="eyebrow">{t.qualityGates}</p>
            <strong>{qualityGates[0]}</strong>
            <span>{qualityGates.slice(1).join(" · ")}</span>
          </div>
        </section>
      )}
      {analysis && (
        <section className="repo-command-board">
          <div className="repo-command-head">
            <div>
              <p className="eyebrow">{t.doThisFirst}</p>
              <h3>{t.turnIntoWork}</h3>
              <span>{actionStatus || t.copyIntoGithub}</span>
            </div>
            <a href={analysis.repository.url} target="_blank" rel="noreferrer">{t.openRepo}</a>
          </div>
          <div className="repo-command-grid">
            <button type="button" onClick={() => copyAuditText(numberedList(analysis.mustFix), t.mustFixCopied)}>
              <span>01</span>
              <strong>{t.copy} {t.mustFixFirst}</strong>
              <em>{analysis.mustFix.length} {t.items}</em>
            </button>
            <button type="button" onClick={() => copyAuditText(issueBundle, t.issuesCopied)}>
              <span>02</span>
              <strong>{t.copyIssues}</strong>
              <em>{analysis.copyableIssues.length} {t.drafts}</em>
            </button>
            <button type="button" onClick={() => copyAuditText(prDescription, t.prDescriptionCopied)}>
              <span>03</span>
              <strong>{t.copyPrDescription}</strong>
              <em>{t.pasteReady}</em>
            </button>
            <button type="button" onClick={() => copyAuditText(releaseBundle, t.releaseChecklistCopied)}>
              <span>04</span>
              <strong>{t.copyReleaseChecklist}</strong>
              <em>{analysis.releaseChecklist.length} {t.steps}</em>
            </button>
          </div>
        </section>
      )}
      <section className="repo-flow-strip">
        {t.repoFlow.map((item, index) => (
          <span key={item} className={loading && index > 0 ? "repo-flow-pending" : ""}>
            {item}
          </span>
        ))}
        <strong>{runStatus}</strong>
      </section>
      <label className="block">
        <span className="tool-label">{t.repoUrl}</span>
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
          <span className="text-sm font-semibold">{t.auditMethod}</span>
          <span className="text-xs text-[color:var(--muted)]">{t.deterministicRules}</span>
        </div>
        <div className="dense-row">
          <span className="text-sm font-semibold">{t.scope}</span>
          <span className="text-xs text-[color:var(--muted)]">{t.publicRepoOnly}</span>
        </div>
        <div className="dense-row">
          <span className="text-sm font-semibold">{t.reads}</span>
          <span className="text-xs text-[color:var(--muted)]">{t.readsValue}</span>
        </div>
        {analysis && (
          <div className="dense-row">
            <span className="text-sm font-semibold">{t.score}</span>
            <span className="text-xs text-[color:var(--muted)]">{analysis.launchScore.score}/100 {riskLevelLabel(analysis.launchScore.riskLevel, language)}</span>
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
              <span>{scorecardStatusLabel(item.status, language)}</span>
              <p>{item.note}</p>
            </article>
          ))}
        </section>
      )}
      {analysis && (
        <section className="repo-priority-grid">
          <article className="repo-priority-card repo-priority-today">
            <p className="eyebrow">{t.fixToday}</p>
            <ol className="repo-check-list">
              {(analysis.priorityFixes.today.length ? analysis.priorityFixes.today : [t.noSameDayBlocker]).map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ol>
          </article>
          <article className="repo-priority-card">
            <p className="eyebrow">{t.beforeLaunch}</p>
            <ol className="repo-check-list">
              {(analysis.priorityFixes.beforeLaunch.length ? analysis.priorityFixes.beforeLaunch : [t.noPreLaunch]).map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ol>
          </article>
          <article className="repo-priority-card">
            <p className="eyebrow">{t.laterPolish}</p>
            <ol className="repo-check-list">
              {(analysis.priorityFixes.later.length ? analysis.priorityFixes.later : [t.laterFallback]).map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ol>
          </article>
        </section>
      )}
      {analysis && (
        <section className="repo-evidence-grid">
          {analysis.issueFindings.slice(0, 4).map((item) => (
            <article key={`${item.severity}-${item.title}`} className={`repo-evidence-card repo-evidence-${item.severity.toLowerCase()}`}>
              <div className="repo-evidence-head">
                <span>{item.severity}</span>
                <strong>{item.source}</strong>
              </div>
              <h3>{item.title}</h3>
              <p>{item.evidence}</p>
            </article>
          ))}
        </section>
      )}
      {analysis && (
        <section className="repo-action-panel">
          <div>
            <p className="eyebrow">{t.shipNext}</p>
            <h3>{t.turnReportIntoTasks}</h3>
            <p>{actionStatus || t.actionPanelBody}</p>
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
              <p className="eyebrow">{t.professionalReport}</p>
              <h3>{t.launchReadinessReport}</h3>
              <span>{analysis.repository.fullName} · {riskLevelLabel(analysis.launchScore.riskLevel, language)} {t.risk} · {analysis.copyableIssues.length} {t.issueDrafts}</span>
            </div>
            <div className="repo-report-score">
              <strong>{analysis.launchScore.score}</strong>
              <span>{t.launchScore}</span>
            </div>
          </div>

          <div className="repo-report-grid">
            <div className="repo-report-section repo-report-section-primary">
              <div className="repo-report-section-head">
                <p className="eyebrow">{t.mustFixFirst}</p>
                <button type="button" onClick={() => copyAuditText(numberedList(analysis.mustFix), t.mustFixCopied)}>
                  {t.copy}
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
                <p className="eyebrow">{t.copyPrDescription.replace(/^Copy\s+/i, "").replace(/^复制\s*/, "")}</p>
                <button type="button" onClick={() => copyAuditText(prDescription, t.prDescriptionCopied)}>
                  {t.copy}
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
                <button type="button" onClick={() => copyAuditText(issue, t.issueCopied(index + 1))}>
                  {t.copyIssue}
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
