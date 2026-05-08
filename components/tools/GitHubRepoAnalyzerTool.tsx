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

function findingList(findings: GitHubRepoAnalysis["issueFindings"], language: InterfaceLanguage = "en") {
  const r = getReportCopy(language);
  return findings.length
    ? findings.map((item) => `- ${item.severity} ${item.title}\n  ${r.source}: ${item.source}\n  ${r.evidenceLabel}: ${item.evidence}`).join("\n")
    : `- ${r.noFindings}`;
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
  const t = getAuditCopy(language);
  const r = getReportCopy(language);
  if (error) {
    return `${t.verdict}\n${error}\n\n${t.repoUrl}\n${sampleRepoUrl}`;
  }
  if (!analysis) {
    return `${t.launchReadinessReport}\n${t.reportShapeBody}\n\n${t.repoUrl}\n${sampleRepoUrl}`;
  }

  const view = localizeAnalysisForDisplay(analysis, language);
  const sections = [
    `${t.launchReadinessReport}\n${t.score}: ${view.launchScore.score}/100\n${t.risk}: ${riskLevelLabel(view.launchScore.riskLevel, language)}\n${view.launchScore.summary}`,
    `${r.scorecard}\n${scorecardList(view.scorecard, language)}`,
    `${r.priority}\n${priorityFixList(view.priorityFixes, language)}`,
    `${r.evidence}\n${findingList(view.issueFindings, language)}`,
    `${t.mustFixFirst}\n${numberedList(view.mustFix, r.noAction)}`,
    `${t.repository}\n${view.repository.fullName}\n${view.repository.url}`,
    `${r.overview}\n${bulletList(view.overview, r.noSignal)}`,
    `${r.techStack}\n${bulletList(view.techStack, r.noSignal)}`,
    `${r.howToRun}\n${numberedList(view.howToRun, r.noAction)}`,
    `${r.envChecklist}\n${bulletList(view.envChecklist, r.noSignal)}`,
    `${r.handoff}\n${bulletList(view.fileStructure, r.noSignal)}`,
    `${r.issueLabels}\n${bulletList(view.issueLabelPlan, r.noSignal)}`,
    `${r.securityNotes}\n${bulletList(view.securityNotes, r.noSignal)}`,
    `${r.readmeFixes}\n${bulletList(view.readmeSuggestions, r.noSignal)}`,
    `${r.ciSuggestions}\n${bulletList(view.githubActions, r.noSignal)}`,
    `${r.deploymentChecklist}\n${numberedList(view.deploymentChecklist, r.noAction)}`,
    `${r.prReviewChecklist}\n${numberedList(view.prReviewChecklist, r.noAction)}`,
    `${r.prDescription}\n${view.prDescription}`,
    `${r.releaseChecklist}\n${numberedList(view.releaseChecklist, r.noAction)}`,
    `${r.githubIssues}\n${view.copyableIssues.join("\n\n---\n\n")}`,
    `${r.filesRead}\n${bulletList(view.filesRead, r.noSignal)}`,
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

type ReportCopy = {
  scorecard: string;
  priority: string;
  evidence: string;
  source: string;
  evidenceLabel: string;
  overview: string;
  techStack: string;
  howToRun: string;
  envChecklist: string;
  handoff: string;
  issueLabels: string;
  securityNotes: string;
  readmeFixes: string;
  ciSuggestions: string;
  deploymentChecklist: string;
  prReviewChecklist: string;
  prDescription: string;
  releaseChecklist: string;
  githubIssues: string;
  filesRead: string;
  issuePriority: string;
  issueLabelsText: string;
  whyMatters: string;
  suggestedFix: string;
  doneWhen: string;
  verification: string;
  noFindings: string;
  noSignal: string;
  noAction: string;
  issueTemplateFallback: string;
  prTitle: string;
  today: string;
  beforePublicLaunch: string;
  laterPolish: string;
  cleanVerification: string;
};

const reportCopy: Partial<Record<InterfaceLanguage, ReportCopy>> & { en: ReportCopy; zh: ReportCopy } = {
  en: {
    scorecard: "Scorecard",
    priority: "Fix priority",
    evidence: "Evidence and severity",
    source: "Source",
    evidenceLabel: "Evidence",
    overview: "Overview",
    techStack: "Tech stack",
    howToRun: "How to run",
    envChecklist: "Environment checklist",
    handoff: "Project handoff",
    issueLabels: "Issue label plan",
    securityNotes: "Security notes",
    readmeFixes: "README fixes",
    ciSuggestions: "CI suggestions",
    deploymentChecklist: "Deployment checklist",
    prReviewChecklist: "PR review checklist",
    prDescription: "Copyable PR description",
    releaseChecklist: "Release checklist",
    githubIssues: "Copyable GitHub issues",
    filesRead: "Files read",
    issuePriority: "Priority",
    issueLabelsText: "Labels",
    whyMatters: "Why this matters",
    suggestedFix: "Suggested fix",
    doneWhen: "Done when",
    verification: "Verification",
    noFindings: "No evidence-backed findings detected",
    noSignal: "No signal detected",
    noAction: "No action detected",
    issueTemplateFallback: "No blocking issue template needed from this audit.",
    prTitle: "Launch readiness audit",
    today: "Today",
    beforePublicLaunch: "Before public launch",
    laterPolish: "Later polish",
    cleanVerification: "Clean verification",
  },
  zh: {
    scorecard: "五维评分卡",
    priority: "修复优先级",
    evidence: "证据和严重程度",
    source: "来源",
    evidenceLabel: "证据",
    overview: "概览",
    techStack: "技术栈",
    howToRun: "如何运行",
    envChecklist: "环境变量清单",
    handoff: "项目交接",
    issueLabels: "Issue 标签建议",
    securityNotes: "安全提示",
    readmeFixes: "README 建议",
    ciSuggestions: "CI 建议",
    deploymentChecklist: "部署清单",
    prReviewChecklist: "PR 检查清单",
    prDescription: "可复制 PR 描述",
    releaseChecklist: "发布清单",
    githubIssues: "可复制 GitHub Issues",
    filesRead: "读取文件",
    issuePriority: "优先级",
    issueLabelsText: "标签",
    whyMatters: "为什么重要",
    suggestedFix: "建议修复",
    doneWhen: "完成标准",
    verification: "验证",
    noFindings: "没有检测到带证据的风险项",
    noSignal: "没有检测到信号",
    noAction: "没有检测到行动项",
    issueTemplateFallback: "本次体检不需要创建阻塞 Issue 模板。",
    prTitle: "上线体检",
    today: "今天",
    beforePublicLaunch: "公开上线前",
    laterPolish: "后续打磨",
    cleanVerification: "干净验证",
  },
  ja: {
    scorecard: "スコアカード",
    priority: "修正優先度",
    evidence: "証拠と重要度",
    source: "出典",
    evidenceLabel: "証拠",
    overview: "概要",
    techStack: "技術スタック",
    howToRun: "実行方法",
    envChecklist: "環境変数チェックリスト",
    handoff: "引き継ぎ",
    issueLabels: "Issue ラベル案",
    securityNotes: "セキュリティメモ",
    readmeFixes: "README 修正",
    ciSuggestions: "CI 提案",
    deploymentChecklist: "デプロイチェックリスト",
    prReviewChecklist: "PR レビューリスト",
    prDescription: "コピー用 PR 説明",
    releaseChecklist: "リリースチェックリスト",
    githubIssues: "コピー用 GitHub Issues",
    filesRead: "読み取ったファイル",
    issuePriority: "優先度",
    issueLabelsText: "ラベル",
    whyMatters: "重要な理由",
    suggestedFix: "修正案",
    doneWhen: "完了条件",
    verification: "検証",
    noFindings: "証拠付きの指摘はありません",
    noSignal: "信号なし",
    noAction: "対応なし",
    issueTemplateFallback: "この監査ではブロッカー Issue テンプレートは不要です。",
    prTitle: "公開前診断",
    today: "今日",
    beforePublicLaunch: "公開前",
    laterPolish: "後で磨く",
    cleanVerification: "クリーン検証",
  },
  ar: {
    scorecard: "بطاقة التقييم",
    priority: "أولوية الإصلاح",
    evidence: "الأدلة والشدة",
    source: "المصدر",
    evidenceLabel: "الدليل",
    overview: "نظرة عامة",
    techStack: "التقنيات",
    howToRun: "طريقة التشغيل",
    envChecklist: "قائمة متغيرات البيئة",
    handoff: "تسليم المشروع",
    issueLabels: "خطة تسميات Issues",
    securityNotes: "ملاحظات الأمان",
    readmeFixes: "تحسينات README",
    ciSuggestions: "اقتراحات CI",
    deploymentChecklist: "قائمة النشر",
    prReviewChecklist: "قائمة مراجعة PR",
    prDescription: "وصف PR قابل للنسخ",
    releaseChecklist: "قائمة الإطلاق",
    githubIssues: "GitHub Issues قابلة للنسخ",
    filesRead: "الملفات المقروءة",
    issuePriority: "الأولوية",
    issueLabelsText: "التسميات",
    whyMatters: "لماذا يهم",
    suggestedFix: "الإصلاح المقترح",
    doneWhen: "يكتمل عندما",
    verification: "التحقق",
    noFindings: "لا توجد ملاحظات مدعومة بأدلة",
    noSignal: "لم يتم العثور على إشارة",
    noAction: "لم يتم العثور على إجراء",
    issueTemplateFallback: "لا حاجة لقالب Issue مانع من هذا الفحص.",
    prTitle: "تدقيق جاهزية الإطلاق",
    today: "اليوم",
    beforePublicLaunch: "قبل الإطلاق العام",
    laterPolish: "تحسين لاحق",
    cleanVerification: "تحقق نظيف",
  },
  de: {
    scorecard: "Scorecard",
    priority: "Fix Priorität",
    evidence: "Belege und Schweregrad",
    source: "Quelle",
    evidenceLabel: "Beleg",
    overview: "Überblick",
    techStack: "Technik Stack",
    howToRun: "Ausführen",
    envChecklist: "Umgebungsvariablen Checkliste",
    handoff: "Projekt Übergabe",
    issueLabels: "Issue Label Plan",
    securityNotes: "Sicherheitsnotizen",
    readmeFixes: "README Korrekturen",
    ciSuggestions: "CI Vorschläge",
    deploymentChecklist: "Deployment Checkliste",
    prReviewChecklist: "PR Review Checkliste",
    prDescription: "Kopierbare PR Beschreibung",
    releaseChecklist: "Release Checkliste",
    githubIssues: "Kopierbare GitHub Issues",
    filesRead: "Gelesene Dateien",
    issuePriority: "Priorität",
    issueLabelsText: "Labels",
    whyMatters: "Warum das wichtig ist",
    suggestedFix: "Vorgeschlagener Fix",
    doneWhen: "Fertig wenn",
    verification: "Verifikation",
    noFindings: "Keine belegten Befunde erkannt",
    noSignal: "Kein Signal erkannt",
    noAction: "Keine Aktion erkannt",
    issueTemplateFallback: "Aus dieser Prüfung ist kein Blocker Issue Template nötig.",
    prTitle: "Startprüfung",
    today: "Heute",
    beforePublicLaunch: "Vor der Veröffentlichung",
    laterPolish: "Späterer Feinschliff",
    cleanVerification: "Saubere Verifikation",
  },
  vi: {
    scorecard: "Bảng điểm",
    priority: "Ưu tiên sửa",
    evidence: "Bằng chứng và mức độ",
    source: "Nguồn",
    evidenceLabel: "Bằng chứng",
    overview: "Tổng quan",
    techStack: "Công nghệ",
    howToRun: "Cách chạy",
    envChecklist: "Checklist biến môi trường",
    handoff: "Bàn giao dự án",
    issueLabels: "Kế hoạch nhãn Issue",
    securityNotes: "Ghi chú bảo mật",
    readmeFixes: "Sửa README",
    ciSuggestions: "Gợi ý CI",
    deploymentChecklist: "Checklist deploy",
    prReviewChecklist: "Checklist review PR",
    prDescription: "Mô tả PR có thể copy",
    releaseChecklist: "Checklist release",
    githubIssues: "GitHub Issues có thể copy",
    filesRead: "File đã đọc",
    issuePriority: "Ưu tiên",
    issueLabelsText: "Nhãn",
    whyMatters: "Vì sao quan trọng",
    suggestedFix: "Cách sửa gợi ý",
    doneWhen: "Hoàn thành khi",
    verification: "Xác minh",
    noFindings: "Không có phát hiện có bằng chứng",
    noSignal: "Không phát hiện tín hiệu",
    noAction: "Không phát hiện hành động",
    issueTemplateFallback: "Lần kiểm tra này không cần issue blocker.",
    prTitle: "Kiểm tra sẵn sàng ra mắt",
    today: "Hôm nay",
    beforePublicLaunch: "Trước khi ra mắt công khai",
    laterPolish: "Tối ưu sau",
    cleanVerification: "Xác minh sạch",
  },
  tr: {
    scorecard: "Skor kartı",
    priority: "Düzeltme önceliği",
    evidence: "Kanıt ve önem",
    source: "Kaynak",
    evidenceLabel: "Kanıt",
    overview: "Genel bakış",
    techStack: "Teknoloji yığını",
    howToRun: "Nasıl çalıştırılır",
    envChecklist: "Ortam değişkenleri checklist",
    handoff: "Proje devri",
    issueLabels: "Issue etiket planı",
    securityNotes: "Güvenlik notları",
    readmeFixes: "README düzeltmeleri",
    ciSuggestions: "CI önerileri",
    deploymentChecklist: "Deploy checklist",
    prReviewChecklist: "PR review checklist",
    prDescription: "Kopyalanabilir PR açıklaması",
    releaseChecklist: "Release checklist",
    githubIssues: "Kopyalanabilir GitHub Issues",
    filesRead: "Okunan dosyalar",
    issuePriority: "Öncelik",
    issueLabelsText: "Etiketler",
    whyMatters: "Neden önemli",
    suggestedFix: "Önerilen düzeltme",
    doneWhen: "Bitti sayılır",
    verification: "Doğrulama",
    noFindings: "Kanıta dayalı bulgu yok",
    noSignal: "Sinyal bulunmadı",
    noAction: "Aksiyon bulunmadı",
    issueTemplateFallback: "Bu denetim için blocker issue şablonu gerekmiyor.",
    prTitle: "Yayın hazırlık denetimi",
    today: "Bugün",
    beforePublicLaunch: "Public yayından önce",
    laterPolish: "Sonraki iyileştirme",
    cleanVerification: "Temiz doğrulama",
  },
  nl: {
    scorecard: "Scorekaart",
    priority: "Fix prioriteit",
    evidence: "Bewijs en ernst",
    source: "Bron",
    evidenceLabel: "Bewijs",
    overview: "Overzicht",
    techStack: "Tech stack",
    howToRun: "Zo draai je het",
    envChecklist: "Omgevingsvariabelen checklist",
    handoff: "Project overdracht",
    issueLabels: "Issue label plan",
    securityNotes: "Security notities",
    readmeFixes: "README fixes",
    ciSuggestions: "CI suggesties",
    deploymentChecklist: "Deployment checklist",
    prReviewChecklist: "PR review checklist",
    prDescription: "Kopieerbare PR beschrijving",
    releaseChecklist: "Release checklist",
    githubIssues: "Kopieerbare GitHub issues",
    filesRead: "Gelezen bestanden",
    issuePriority: "Prioriteit",
    issueLabelsText: "Labels",
    whyMatters: "Waarom dit belangrijk is",
    suggestedFix: "Voorgestelde fix",
    doneWhen: "Klaar wanneer",
    verification: "Verificatie",
    noFindings: "Geen bevindingen met bewijs gevonden",
    noSignal: "Geen signaal gevonden",
    noAction: "Geen actie gevonden",
    issueTemplateFallback: "Geen blocker issue template nodig voor deze controle.",
    prTitle: "Publicatie gereedheidscontrole",
    today: "Vandaag",
    beforePublicLaunch: "Voor publieke release",
    laterPolish: "Latere polish",
    cleanVerification: "Schone verificatie",
  },
  pl: {
    scorecard: "Karta wyników",
    priority: "Priorytet napraw",
    evidence: "Dowody i ważność",
    source: "Źródło",
    evidenceLabel: "Dowód",
    overview: "Przegląd",
    techStack: "Stack technologiczny",
    howToRun: "Jak uruchomić",
    envChecklist: "Checklist zmiennych środowiskowych",
    handoff: "Przekazanie projektu",
    issueLabels: "Plan etykiet Issue",
    securityNotes: "Notatki bezpieczeństwa",
    readmeFixes: "Poprawki README",
    ciSuggestions: "Sugestie CI",
    deploymentChecklist: "Checklist deploy",
    prReviewChecklist: "Checklist review PR",
    prDescription: "Opis PR do skopiowania",
    releaseChecklist: "Checklist release",
    githubIssues: "GitHub Issues do skopiowania",
    filesRead: "Przeczytane pliki",
    issuePriority: "Priorytet",
    issueLabelsText: "Etykiety",
    whyMatters: "Dlaczego to ważne",
    suggestedFix: "Sugerowana poprawka",
    doneWhen: "Gotowe gdy",
    verification: "Weryfikacja",
    noFindings: "Brak ustaleń opartych na dowodach",
    noSignal: "Nie wykryto sygnału",
    noAction: "Nie wykryto działania",
    issueTemplateFallback: "Ten audyt nie wymaga blocker issue template.",
    prTitle: "Audyt gotowości publikacji",
    today: "Dzisiaj",
    beforePublicLaunch: "Przed publiczną publikacją",
    laterPolish: "Późniejsze dopracowanie",
    cleanVerification: "Czysta weryfikacja",
  },
  hi: {
    scorecard: "Scorecard",
    priority: "Fix priority",
    evidence: "Evidence और severity",
    source: "Source",
    evidenceLabel: "Evidence",
    overview: "Overview",
    techStack: "Tech stack",
    howToRun: "कैसे चलाएं",
    envChecklist: "Environment checklist",
    handoff: "Project handoff",
    issueLabels: "Issue label plan",
    securityNotes: "Security notes",
    readmeFixes: "README fixes",
    ciSuggestions: "CI suggestions",
    deploymentChecklist: "Deployment checklist",
    prReviewChecklist: "PR review checklist",
    prDescription: "Copyable PR description",
    releaseChecklist: "Release checklist",
    githubIssues: "Copyable GitHub issues",
    filesRead: "Files read",
    issuePriority: "Priority",
    issueLabelsText: "Labels",
    whyMatters: "यह क्यों जरूरी है",
    suggestedFix: "Suggested fix",
    doneWhen: "Done when",
    verification: "Verification",
    noFindings: "Evidence backed findings नहीं मिले",
    noSignal: "Signal नहीं मिला",
    noAction: "Action नहीं मिला",
    issueTemplateFallback: "इस audit से blocking issue template की जरूरत नहीं.",
    prTitle: "Launch readiness audit",
    today: "आज",
    beforePublicLaunch: "Public launch से पहले",
    laterPolish: "बाद में polish",
    cleanVerification: "Clean verification",
  },
};

function getReportCopy(language: InterfaceLanguage) {
  return reportCopy[language] || reportCopy.en;
}

const auditTextTranslations: Partial<Record<InterfaceLanguage, Record<string, string>>> = {
  zh: {
    "Public launch shape is strong. The remaining work is mostly release polish, contributor handoff, and keeping setup steps copy ready.": "公开发布形态已经比较稳，剩下主要是发布细节、贡献者交接和可复制的启动步骤。",
    "Purpose, install, and usage are easy to find.": "用途、安装和使用方式容易找到。",
    "Env expectations should stay explicit for examples and release docs.": "示例和发布文档里要继续明确环境变量要求。",
    "Quality commands should stay visible in pull requests.": "质量检查命令应该在 PR 中保持可见。",
    "Release notes and rollback steps are the remaining launch polish.": "发布说明和回滚步骤是剩余的上线打磨项。",
    "No obvious committed local secrets in the sample report.": "样例报告里没有明显提交到仓库的本地密钥。",
    "Keep the README quick start path under five minutes for a new contributor.": "让新贡献者在五分钟内按 README 完成快速启动。",
    "Make required environment variables explicit in one env example section.": "在一个环境变量示例区域里明确必填变量。",
    "Keep release and PR checklists visible so launch work is not trapped in maintainers' heads.": "把发布和 PR 清单放到可见位置，不要让上线流程只存在维护者脑子里。",
    "Add a recurring release review for docs, examples, and CI drift.": "为文档、示例和 CI 偏移增加定期发布复查。",
    "Repository presents a focused public developer library with active maintenance signals.": "仓库呈现为聚焦的公开开发者库，并有活跃维护信号。",
    "The project has enough public metadata for a launch handoff and contributor review.": "项目有足够公开元数据，适合做上线交接和贡献者审查。",
    "Launch risk is low when docs, env, CI, and release steps stay explicit.": "只要文档、环境变量、CI 和发布步骤保持明确，上线风险较低。",
    "Install dependencies": "安装依赖",
    "Run the development command from package scripts": "运行 package scripts 里的开发命令",
    "Run tests or type checks before a release": "发布前运行测试或类型检查",
    "Package scripts": "Package scripts",
    "GitHub based contribution flow": "基于 GitHub 的贡献流程",
    "README explains the public purpose": "README 说明公开用途",
    "Root config files make project tooling discoverable": "根目录配置文件让工具链可发现",
    "Docs and examples should stay close to the first contributor path": "文档和示例应贴近首次贡献者路径",
    "Do not commit production secrets or tokens.": "不要提交生产密钥或 token。",
    "Keep env examples as placeholders only.": "环境变量示例只保留占位值。",
    "Review dependency updates and public issue reports before release.": "发布前复查依赖更新和公开 issue 报告。",
    "Keep the first screen focused on what the package does and how to start.": "首屏聚焦说明包的作用和启动方式。",
    "Move deeper architecture notes below install and usage examples.": "把更深的架构说明放到安装和使用示例之后。",
    "Add a short release or deployment checklist when the project has a public website.": "如果项目有公开网站，补一份短发布或部署清单。",
    "Keep lint typecheck test and build visible in CI.": "在 CI 中保持 lint、typecheck、test 和 build 可见。",
    "Fail pull requests on broken formatting or type errors.": "格式或类型错误时让 PR 失败。",
    "Cache dependencies only after the install path is stable.": "安装路径稳定后再缓存依赖。",
    "Detected env template keys should be documented with purpose and required status.": "检测到的环境变量模板 key 应标注用途和是否必填。",
    "Production secrets belong in the host environment dashboard.": "生产密钥应放在托管平台环境变量面板里。",
    "Local optional variables should have safe defaults.": "本地可选变量应有安全默认值。",
    "Run lint typecheck tests and build.": "运行 lint、typecheck、tests 和 build。",
    "Confirm production environment variables.": "确认生产环境变量。",
    "Review README quick start and env docs.": "复查 README 快速启动和环境变量文档。",
    "Publish release notes and rollback steps.": "发布 release notes 和回滚步骤。",
    "Does the PR change public setup commands?": "这个 PR 是否改变公开安装或启动命令？",
    "Does the PR require new env variables?": "这个 PR 是否需要新增环境变量？",
    "Are docs examples and tests updated together?": "文档、示例和测试是否一起更新？",
    "Can a new contributor verify the change locally?": "新贡献者能否在本地验证这个变更？",
    "Update the repository files that create this launch risk": "更新造成该上线风险的仓库文件",
    "Document the expected local or production behavior": "记录预期的本地或生产行为",
    "Keep secrets and machine-specific files out of public source control": "不要把密钥和机器相关文件放进公开源码",
    "The launch risk is no longer present in the public repository": "公开仓库中不再存在该上线风险",
    "README, CI, or deployment docs explain how to verify the fix": "README、CI 或部署文档说明如何验证修复",
    "A maintainer can confirm it from a clean checkout": "维护者可以从干净 checkout 中确认修复",
    "Clean working tree and passing CI.": "工作区干净且 CI 通过。",
    "No committed secrets or temporary local files.": "没有提交密钥或临时本地文件。",
    "README quick start still works.": "README 快速启动仍然可用。",
    "Release notes include user visible changes.": "发布说明包含用户可见变更。",
    "Monitoring or rollback path is known before launch.": "上线前明确监控或回滚路径。",
  },
  vi: {
    "Public launch shape is strong. The remaining work is mostly release polish, contributor handoff, and keeping setup steps copy ready.": "Hình thái ra mắt công khai khá vững. Phần còn lại chủ yếu là polish release, bàn giao contributor và giữ bước setup dễ copy.",
    "Purpose, install, and usage are easy to find.": "Mục đích, cài đặt và cách dùng dễ tìm.",
    "Env expectations should stay explicit for examples and release docs.": "Yêu cầu env cần rõ trong ví dụ và tài liệu release.",
    "Quality commands should stay visible in pull requests.": "Lệnh kiểm tra chất lượng nên hiển thị rõ trong pull request.",
    "Release notes and rollback steps are the remaining launch polish.": "Release notes và bước rollback là phần polish còn lại.",
    "No obvious committed local secrets in the sample report.": "Báo cáo mẫu không thấy secret local bị commit rõ ràng.",
    "Keep the README quick start path under five minutes for a new contributor.": "Giữ đường dẫn quick start trong README dưới năm phút cho contributor mới.",
    "Make required environment variables explicit in one env example section.": "Làm rõ biến môi trường bắt buộc trong một phần env example.",
    "Keep release and PR checklists visible so launch work is not trapped in maintainers' heads.": "Giữ checklist release và PR ở nơi dễ thấy để việc ra mắt không nằm trong đầu maintainer.",
    "Add a recurring release review for docs, examples, and CI drift.": "Thêm lịch review release định kỳ cho docs, examples và CI drift.",
    "Repository presents a focused public developer library with active maintenance signals.": "Repo thể hiện một thư viện developer công khai có trọng tâm và tín hiệu bảo trì tốt.",
    "The project has enough public metadata for a launch handoff and contributor review.": "Dự án có đủ metadata công khai cho bàn giao ra mắt và review contributor.",
    "Launch risk is low when docs, env, CI, and release steps stay explicit.": "Rủi ro ra mắt thấp nếu docs, env, CI và bước release luôn rõ ràng.",
    "Install dependencies": "Cài dependencies",
    "Run the development command from package scripts": "Chạy lệnh development từ package scripts",
    "Run tests or type checks before a release": "Chạy test hoặc type check trước release",
    "GitHub based contribution flow": "Luồng đóng góp dựa trên GitHub",
    "README explains the public purpose": "README giải thích mục đích công khai",
    "Root config files make project tooling discoverable": "File config gốc giúp nhận diện tooling",
    "Docs and examples should stay close to the first contributor path": "Docs và examples nên gần với đường đi đầu tiên của contributor",
    "Do not commit production secrets or tokens.": "Không commit production secrets hoặc tokens.",
    "Keep env examples as placeholders only.": "Env examples chỉ nên dùng placeholder.",
    "Review dependency updates and public issue reports before release.": "Review dependency updates và public issue reports trước release.",
    "Keep the first screen focused on what the package does and how to start.": "Giữ màn đầu tập trung vào package làm gì và bắt đầu thế nào.",
    "Move deeper architecture notes below install and usage examples.": "Đưa ghi chú kiến trúc sâu xuống sau install và usage examples.",
    "Add a short release or deployment checklist when the project has a public website.": "Thêm checklist release hoặc deploy ngắn khi dự án có website công khai.",
    "Keep lint typecheck test and build visible in CI.": "Giữ lint typecheck test và build rõ trong CI.",
    "Fail pull requests on broken formatting or type errors.": "Cho PR fail khi format hoặc type lỗi.",
    "Cache dependencies only after the install path is stable.": "Chỉ cache dependencies sau khi đường cài đặt ổn định.",
    "Detected env template keys should be documented with purpose and required status.": "Env template keys phát hiện được cần ghi rõ mục đích và trạng thái bắt buộc.",
    "Production secrets belong in the host environment dashboard.": "Production secrets thuộc dashboard môi trường của host.",
    "Local optional variables should have safe defaults.": "Biến optional local nên có default an toàn.",
    "Update the repository files that create this launch risk": "Cập nhật file trong repo tạo ra rủi ro ra mắt này",
    "Document the expected local or production behavior": "Ghi lại hành vi mong đợi ở local hoặc production",
    "Keep secrets and machine-specific files out of public source control": "Giữ secrets và file theo máy ra khỏi source public",
    "The launch risk is no longer present in the public repository": "Rủi ro ra mắt không còn trong repo công khai",
    "README, CI, or deployment docs explain how to verify the fix": "README, CI hoặc docs deploy giải thích cách xác minh fix",
    "A maintainer can confirm it from a clean checkout": "Maintainer có thể xác nhận từ clean checkout",
  },
  tr: {
    "Public launch shape is strong. The remaining work is mostly release polish, contributor handoff, and keeping setup steps copy ready.": "Public yayın yapısı güçlü. Kalan iş çoğunlukla release polish, contributor handoff ve setup adımlarını kopyalanabilir tutmak.",
    "Purpose, install, and usage are easy to find.": "Amaç, kurulum ve kullanım kolay bulunuyor.",
    "Env expectations should stay explicit for examples and release docs.": "Env beklentileri örneklerde ve release dokümanlarında açık kalmalı.",
    "Quality commands should stay visible in pull requests.": "Kalite komutları pull request içinde görünür kalmalı.",
    "Release notes and rollback steps are the remaining launch polish.": "Release notes ve rollback adımları kalan yayın polish işidir.",
    "No obvious committed local secrets in the sample report.": "Örnek raporda commit edilmiş belirgin local secret görünmüyor.",
    "Keep the README quick start path under five minutes for a new contributor.": "Yeni contributor için README quick start yolunu beş dakikanın altında tut.",
    "Make required environment variables explicit in one env example section.": "Gerekli environment variables bilgisini tek env example bölümünde açık yap.",
    "Keep release and PR checklists visible so launch work is not trapped in maintainers' heads.": "Release ve PR checklist görünür kalsın; yayın işi maintainer hafızasında kalmasın.",
    "Add a recurring release review for docs, examples, and CI drift.": "Docs, examples ve CI drift için tekrar eden release review ekle.",
    "Repository presents a focused public developer library with active maintenance signals.": "Repo odaklı bir public developer library ve aktif bakım sinyalleri gösteriyor.",
    "The project has enough public metadata for a launch handoff and contributor review.": "Proje launch handoff ve contributor review için yeterli public metadata taşıyor.",
    "Launch risk is low when docs, env, CI, and release steps stay explicit.": "Docs, env, CI ve release adımları açık kaldığında yayın riski düşük.",
    "Install dependencies": "Dependencies kur",
    "Run the development command from package scripts": "Package scripts içinden development komutunu çalıştır",
    "Run tests or type checks before a release": "Release öncesi test veya type check çalıştır",
    "GitHub based contribution flow": "GitHub tabanlı contribution flow",
    "README explains the public purpose": "README public amacı açıklıyor",
    "Root config files make project tooling discoverable": "Root config files project tooling bilgisini bulunabilir yapıyor",
    "Docs and examples should stay close to the first contributor path": "Docs ve examples ilk contributor yoluna yakın kalmalı",
    "Do not commit production secrets or tokens.": "Production secrets veya token commit etme.",
    "Keep env examples as placeholders only.": "Env examples sadece placeholder olsun.",
    "Review dependency updates and public issue reports before release.": "Release öncesi dependency updates ve public issue reports review et.",
    "Update the repository files that create this launch risk": "Bu yayın riskini oluşturan repo dosyalarını güncelle",
    "Document the expected local or production behavior": "Beklenen local veya production davranışını dokümante et",
    "Keep secrets and machine-specific files out of public source control": "Secrets ve makineye özel dosyaları public source control dışında tut",
    "The launch risk is no longer present in the public repository": "Yayın riski public repository içinde artık yok",
    "README, CI, or deployment docs explain how to verify the fix": "README, CI veya deployment docs fix doğrulamasını açıklıyor",
    "A maintainer can confirm it from a clean checkout": "Maintainer temiz checkout ile doğrulayabiliyor",
  },
  nl: {
    "Public launch shape is strong. The remaining work is mostly release polish, contributor handoff, and keeping setup steps copy ready.": "De publieke release vorm is sterk. Het resterende werk is vooral release polish, overdracht aan contributors en setup stappen kopieerbaar houden.",
    "Purpose, install, and usage are easy to find.": "Doel, installatie en gebruik zijn makkelijk te vinden.",
    "Env expectations should stay explicit for examples and release docs.": "Env verwachtingen moeten expliciet blijven in voorbeelden en release docs.",
    "Quality commands should stay visible in pull requests.": "Kwaliteitscommando's moeten zichtbaar blijven in pull requests.",
    "Release notes and rollback steps are the remaining launch polish.": "Release notes en rollback stappen zijn de resterende publicatie polish.",
    "No obvious committed local secrets in the sample report.": "Geen duidelijke gecommitte lokale secrets in het voorbeeldrapport.",
    "Keep the README quick start path under five minutes for a new contributor.": "Houd de README quick start onder vijf minuten voor een nieuwe contributor.",
    "Make required environment variables explicit in one env example section.": "Maak verplichte omgevingsvariabelen expliciet in een env voorbeeldsectie.",
    "Keep release and PR checklists visible so launch work is not trapped in maintainers' heads.": "Houd release en PR checklists zichtbaar zodat publicatiewerk niet alleen in hoofden van maintainers zit.",
    "Add a recurring release review for docs, examples, and CI drift.": "Voeg een terugkerende release review toe voor docs, voorbeelden en CI drift.",
    "Repository presents a focused public developer library with active maintenance signals.": "De repo toont een gerichte publieke developer library met actieve onderhoudssignalen.",
    "The project has enough public metadata for a launch handoff and contributor review.": "Het project heeft genoeg publieke metadata voor release overdracht en contributor review.",
    "Launch risk is low when docs, env, CI, and release steps stay explicit.": "Publicatierisico is laag wanneer docs, env, CI en release stappen expliciet blijven.",
    "Install dependencies": "Installeer dependencies",
    "Run the development command from package scripts": "Draai het development commando uit package scripts",
    "Run tests or type checks before a release": "Draai tests of type checks voor release",
    "GitHub based contribution flow": "GitHub gebaseerde contribution flow",
    "README explains the public purpose": "README legt het publieke doel uit",
    "Root config files make project tooling discoverable": "Root config files maken tooling vindbaar",
    "Docs and examples should stay close to the first contributor path": "Docs en voorbeelden moeten dicht bij het eerste contributor pad blijven",
    "Do not commit production secrets or tokens.": "Commit geen production secrets of tokens.",
    "Keep env examples as placeholders only.": "Houd env voorbeelden alleen als placeholders.",
    "Review dependency updates and public issue reports before release.": "Review dependency updates en publieke issue reports voor release.",
    "Update the repository files that create this launch risk": "Werk de repo bestanden bij die dit publicatierisico veroorzaken",
    "Document the expected local or production behavior": "Documenteer het verwachte lokale of production gedrag",
    "Keep secrets and machine-specific files out of public source control": "Houd secrets en machine-specifieke bestanden buiten publieke source control",
    "The launch risk is no longer present in the public repository": "Het publicatierisico staat niet meer in de publieke repository",
    "README, CI, or deployment docs explain how to verify the fix": "README, CI of deployment docs leggen uit hoe je de fix verifieert",
    "A maintainer can confirm it from a clean checkout": "Een maintainer kan dit bevestigen vanaf een clean checkout",
  },
  pl: {
    "Public launch shape is strong. The remaining work is mostly release polish, contributor handoff, and keeping setup steps copy ready.": "Publiczna forma publikacji jest mocna. Pozostała praca to głównie polish release, przekazanie contributorom i utrzymanie kroków setup jako łatwych do kopiowania.",
    "Purpose, install, and usage are easy to find.": "Cel, instalacja i użycie są łatwe do znalezienia.",
    "Env expectations should stay explicit for examples and release docs.": "Wymagania env powinny być jasne w przykładach i dokumentacji release.",
    "Quality commands should stay visible in pull requests.": "Komendy jakości powinny być widoczne w pull requestach.",
    "Release notes and rollback steps are the remaining launch polish.": "Release notes i kroki rollback to pozostałe dopracowanie publikacji.",
    "No obvious committed local secrets in the sample report.": "W raporcie przykładowym nie widać oczywistych commitowanych local secrets.",
    "Keep the README quick start path under five minutes for a new contributor.": "Utrzymaj README quick start poniżej pięciu minut dla nowego contributora.",
    "Make required environment variables explicit in one env example section.": "Opisz wymagane zmienne środowiskowe w jednej sekcji env example.",
    "Keep release and PR checklists visible so launch work is not trapped in maintainers' heads.": "Utrzymaj checklisty release i PR jako widoczne, żeby praca publikacji nie była tylko w głowach maintainerów.",
    "Add a recurring release review for docs, examples, and CI drift.": "Dodaj cykliczny release review dla docs, examples i CI drift.",
    "Repository presents a focused public developer library with active maintenance signals.": "Repo wygląda jak skupiona publiczna biblioteka developerska z aktywnymi sygnałami utrzymania.",
    "The project has enough public metadata for a launch handoff and contributor review.": "Projekt ma dość publicznych metadata do handoffu publikacji i contributor review.",
    "Launch risk is low when docs, env, CI, and release steps stay explicit.": "Ryzyko publikacji jest niskie, gdy docs, env, CI i kroki release są jasne.",
    "Install dependencies": "Zainstaluj dependencies",
    "Run the development command from package scripts": "Uruchom komendę development z package scripts",
    "Run tests or type checks before a release": "Uruchom testy lub type checks przed release",
    "GitHub based contribution flow": "GitHub based contribution flow",
    "README explains the public purpose": "README wyjaśnia publiczny cel",
    "Root config files make project tooling discoverable": "Root config files pomagają odkryć tooling projektu",
    "Docs and examples should stay close to the first contributor path": "Docs i przykłady powinny być blisko ścieżki pierwszego contributora",
    "Do not commit production secrets or tokens.": "Nie commituj production secrets ani tokenów.",
    "Keep env examples as placeholders only.": "Env examples trzymaj tylko jako placeholders.",
    "Review dependency updates and public issue reports before release.": "Przed release sprawdź dependency updates i public issue reports.",
    "Update the repository files that create this launch risk": "Zaktualizuj pliki repo, które tworzą to ryzyko publikacji",
    "Document the expected local or production behavior": "Opisz oczekiwane zachowanie local lub production",
    "Keep secrets and machine-specific files out of public source control": "Trzymaj secrets i pliki maszynowe poza public source control",
    "The launch risk is no longer present in the public repository": "Ryzyko publikacji nie występuje już w publicznym repo",
    "README, CI, or deployment docs explain how to verify the fix": "README, CI lub deployment docs wyjaśniają jak zweryfikować fix",
    "A maintainer can confirm it from a clean checkout": "Maintainer może potwierdzić to z clean checkout",
  },
  hi: {
    "Public launch shape is strong. The remaining work is mostly release polish, contributor handoff, and keeping setup steps copy ready.": "Public launch shape मजबूत है। बाकी काम ज्यादातर release polish, contributor handoff और setup steps को copy ready रखना है.",
    "Purpose, install, and usage are easy to find.": "Purpose, install और usage आसानी से मिलते हैं.",
    "Env expectations should stay explicit for examples and release docs.": "Env expectations examples और release docs में साफ रहने चाहिए.",
    "Quality commands should stay visible in pull requests.": "Quality commands pull requests में visible रहने चाहिए.",
    "Release notes and rollback steps are the remaining launch polish.": "Release notes और rollback steps बाकी launch polish हैं.",
    "No obvious committed local secrets in the sample report.": "Sample report में obvious committed local secrets नहीं दिखे.",
    "Keep the README quick start path under five minutes for a new contributor.": "New contributor के लिए README quick start path पांच मिनट के अंदर रखें.",
    "Make required environment variables explicit in one env example section.": "Required environment variables को एक env example section में साफ लिखें.",
    "Keep release and PR checklists visible so launch work is not trapped in maintainers' heads.": "Release और PR checklists visible रखें ताकि launch work सिर्फ maintainers के दिमाग में न रहे.",
    "Add a recurring release review for docs, examples, and CI drift.": "Docs, examples और CI drift के लिए recurring release review जोड़ें.",
    "Install dependencies": "Dependencies install करें",
    "Run the development command from package scripts": "Package scripts से development command चलाएं",
    "Run tests or type checks before a release": "Release से पहले tests या type checks चलाएं",
    "Do not commit production secrets or tokens.": "Production secrets या tokens commit न करें.",
    "Keep env examples as placeholders only.": "Env examples सिर्फ placeholders रखें.",
    "Update the repository files that create this launch risk": "इस launch risk को बनाने वाली repository files update करें",
    "Document the expected local or production behavior": "Expected local या production behavior document करें",
    "Keep secrets and machine-specific files out of public source control": "Secrets और machine specific files को public source control से बाहर रखें",
    "The launch risk is no longer present in the public repository": "Public repository में यह launch risk अब मौजूद नहीं है",
    "README, CI, or deployment docs explain how to verify the fix": "README, CI या deployment docs बताते हैं कि fix verify कैसे करें",
    "A maintainer can confirm it from a clean checkout": "Maintainer clean checkout से confirm कर सकता है",
  },
};

function localizeAuditText(text: string, language: InterfaceLanguage) {
  if (language === "en") return text;
  const dictionary = auditTextTranslations[language] || {};
  if (dictionary[text]) return dictionary[text];

  let localized = text;
  const replacements: Array<[RegExp, string]> = [];
  if (language === "zh") {
    replacements.push(
      [/^Detected env template keys: /, "检测到环境变量模板 key："],
      [/^Existing workflows found: /, "发现现有 workflow："],
      [/^Deployment signal: /, "部署信号："],
      [/^Risky public files detected: /, "检测到高风险公开文件："],
      [/^Run clean verification: /, "运行干净验证："],
      [/^Confirm deployment target settings for /, "确认部署目标设置："],
    );
  } else if (language === "vi") {
    replacements.push(
      [/^Detected env template keys: /, "Env template keys phát hiện: "],
      [/^Existing workflows found: /, "Workflow hiện có: "],
      [/^Deployment signal: /, "Tín hiệu deploy: "],
      [/^Risky public files detected: /, "File công khai rủi ro: "],
      [/^Run clean verification: /, "Chạy xác minh sạch: "],
      [/^Confirm deployment target settings for /, "Xác nhận cấu hình deploy cho "],
    );
  } else if (language === "tr") {
    replacements.push(
      [/^Detected env template keys: /, "Algılanan env template keyleri: "],
      [/^Existing workflows found: /, "Mevcut workflow bulundu: "],
      [/^Deployment signal: /, "Deploy sinyali: "],
      [/^Risky public files detected: /, "Riskli public dosyalar: "],
      [/^Run clean verification: /, "Temiz doğrulama çalıştır: "],
      [/^Confirm deployment target settings for /, "Deploy target ayarlarını doğrula: "],
    );
  } else if (language === "nl") {
    replacements.push(
      [/^Detected env template keys: /, "Gevonden env template keys: "],
      [/^Existing workflows found: /, "Bestaande workflows gevonden: "],
      [/^Deployment signal: /, "Deployment signaal: "],
      [/^Risky public files detected: /, "Riskante publieke bestanden: "],
      [/^Run clean verification: /, "Draai schone verificatie: "],
      [/^Confirm deployment target settings for /, "Bevestig deployment target settings voor "],
    );
  } else if (language === "pl") {
    replacements.push(
      [/^Detected env template keys: /, "Wykryte env template keys: "],
      [/^Existing workflows found: /, "Znalezione workflow: "],
      [/^Deployment signal: /, "Sygnał deploy: "],
      [/^Risky public files detected: /, "Ryzykowne publiczne pliki: "],
      [/^Run clean verification: /, "Uruchom czystą weryfikację: "],
      [/^Confirm deployment target settings for /, "Potwierdź ustawienia deploy dla "],
    );
  } else if (language === "hi") {
    replacements.push(
      [/^Detected env template keys: /, "Detected env template keys: "],
      [/^Existing workflows found: /, "Existing workflows found: "],
      [/^Deployment signal: /, "Deployment signal: "],
      [/^Risky public files detected: /, "Risky public files detected: "],
      [/^Run clean verification: /, "Clean verification चलाएं: "],
      [/^Confirm deployment target settings for /, "Deployment target settings confirm करें: "],
    );
  }
  for (const [pattern, replacement] of replacements) {
    localized = localized.replace(pattern, replacement);
  }
  return localized;
}

function localizeList(items: string[], language: InterfaceLanguage) {
  return items.map((item) => localizeAuditText(item, language));
}

function localizeScorecard(items: GitHubRepoAnalysis["scorecard"], language: InterfaceLanguage) {
  const labelMap: Partial<Record<InterfaceLanguage, Record<string, string>>> = {
    zh: { Environment: "环境变量", Deploy: "部署", Security: "安全" },
    ja: { Environment: "環境", Deploy: "デプロイ", Security: "セキュリティ" },
    ar: { Environment: "البيئة", Deploy: "النشر", Security: "الأمان" },
    de: { Environment: "Umgebung", Deploy: "Deployment", Security: "Sicherheit" },
    vi: { Environment: "Môi trường", Deploy: "Deploy", Security: "Bảo mật" },
    tr: { Environment: "Ortam", Deploy: "Deploy", Security: "Güvenlik" },
    nl: { Environment: "Omgeving", Deploy: "Deployment", Security: "Security" },
    pl: { Environment: "Środowisko", Deploy: "Deploy", Security: "Bezpieczeństwo" },
    hi: { Environment: "Environment", Deploy: "Deploy", Security: "Security" },
  };
  const labels = labelMap[language] || {};
  return items.map((item) => ({
    ...item,
    label: labels[item.label] || item.label,
    note: localizeAuditText(item.note, language),
  }));
}

function localizeFindings(items: GitHubRepoAnalysis["issueFindings"], language: InterfaceLanguage) {
  return items.map((item) => ({
    ...item,
    title: localizeAuditText(item.title, language),
    source: localizeAuditText(item.source, language),
    evidence: localizeAuditText(item.evidence, language),
  }));
}

function localizedPrDescription(analysis: GitHubRepoAnalysis, language: InterfaceLanguage) {
  const r = getReportCopy(language);
  const t = getAuditCopy(language);
  const today = analysis.priorityFixes.today.length ? analysis.priorityFixes.today : [t.noSameDayBlocker];
  const beforeLaunch = analysis.priorityFixes.beforeLaunch.length ? analysis.priorityFixes.beforeLaunch : [t.noPreLaunch];
  const later = analysis.priorityFixes.later.length ? analysis.priorityFixes.later : [t.laterFallback];
  return `## ${r.prTitle}

${t.score}: ${analysis.launchScore.score}/100
${t.risk}: ${riskLevelLabel(analysis.launchScore.riskLevel, language)}

### ${r.today}
${today.map((item) => `- [ ] ${localizeAuditText(item, language)}`).join("\n")}

### ${r.beforePublicLaunch}
${beforeLaunch.map((item) => `- [ ] ${localizeAuditText(item, language)}`).join("\n")}

### ${r.laterPolish}
${later.map((item) => `- [ ] ${localizeAuditText(item, language)}`).join("\n")}

### ${r.cleanVerification}
\`\`\`bash
npm run lint
npm run build
\`\`\``;
}

function localizedCopyableIssues(analysis: GitHubRepoAnalysis, language: InterfaceLanguage) {
  const r = getReportCopy(language);
  if (!analysis.issueFindings.length) return [r.issueTemplateFallback];
  return analysis.issueFindings.slice(0, 5).map((item, index) => {
    const title = localizeAuditText(item.title, language);
    const priority = item.severity === "P0" ? "P0 release blocker" : index < 2 ? "P1 launch readiness" : "P2 polish";
    return `## ${title}

${r.issuePriority}: ${priority}
${r.issueLabelsText}: launch, docs, quality
${r.source}: ${localizeAuditText(item.source, language)}
${r.evidenceLabel}: ${localizeAuditText(item.evidence, language)}

### ${r.whyMatters}
${localizeAuditText(item.title, language)}

### ${r.suggestedFix}
- ${localizeAuditText("Update the repository files that create this launch risk", language)}
- ${localizeAuditText("Document the expected local or production behavior", language)}
- ${localizeAuditText("Keep secrets and machine-specific files out of public source control", language)}

### ${r.doneWhen}
- [ ] ${localizeAuditText("The launch risk is no longer present in the public repository", language)}
- [ ] ${localizeAuditText("README, CI, or deployment docs explain how to verify the fix", language)}
- [ ] ${localizeAuditText("A maintainer can confirm it from a clean checkout", language)}

### ${r.verification}
\`\`\`bash
npm run lint
npm run build
\`\`\``;
  });
}

function localizeAnalysisForDisplay(analysis: GitHubRepoAnalysis, language: InterfaceLanguage): GitHubRepoAnalysis {
  if (language === "en") return analysis;
  return {
    ...analysis,
    repository: {
      ...analysis.repository,
      description: localizeAuditText(analysis.repository.description, language),
    },
    launchScore: {
      ...analysis.launchScore,
      summary: localizeAuditText(analysis.launchScore.summary, language),
    },
    scorecard: localizeScorecard(analysis.scorecard, language),
    mustFix: localizeList(analysis.mustFix, language),
    issueFindings: localizeFindings(analysis.issueFindings, language),
    priorityFixes: {
      today: localizeList(analysis.priorityFixes.today, language),
      beforeLaunch: localizeList(analysis.priorityFixes.beforeLaunch, language),
      later: localizeList(analysis.priorityFixes.later, language),
    },
    prDescription: localizedPrDescription(analysis, language),
    copyableIssues: localizedCopyableIssues(analysis, language),
    overview: localizeList(analysis.overview, language),
    howToRun: localizeList(analysis.howToRun, language),
    techStack: localizeList(analysis.techStack, language),
    fileStructure: localizeList(analysis.fileStructure, language),
    securityNotes: localizeList(analysis.securityNotes, language),
    readmeSuggestions: localizeList(analysis.readmeSuggestions, language),
    githubActions: localizeList(analysis.githubActions, language),
    envChecklist: localizeList(analysis.envChecklist, language),
    issueLabelPlan: localizeList(analysis.issueLabelPlan, language),
    deploymentChecklist: localizeList(analysis.deploymentChecklist, language),
    prReviewChecklist: localizeList(analysis.prReviewChecklist, language),
    releaseChecklist: localizeList(analysis.releaseChecklist, language),
  };
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
    aiDependencyNone: "لا اعتماد على الذكاء الاصطناعي · القواعد أولا",
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

function auditCopyFromEnglish(overrides: Partial<AuditCopy>): AuditCopy {
  return {
    ...auditCopy.en,
    ...overrides,
    issueCopied: overrides.issueCopied ?? auditCopy.en.issueCopied,
    daysSinceUpdate: overrides.daysSinceUpdate ?? auditCopy.en.daysSinceUpdate,
    monthsSinceUpdate: overrides.monthsSinceUpdate ?? auditCopy.en.monthsSinceUpdate,
    auditComplete: overrides.auditComplete ?? auditCopy.en.auditComplete,
  };
}

const extendedAuditCopy: Partial<Record<InterfaceLanguage, AuditCopy>> = {
  de: auditCopyFromEnglish({
    ready: "Bereit fuer Audit",
    repoUrl: "Repo URL",
    auditBlockers: "Launch Blocker pruefen",
    auditRepo: "Repo auditieren",
    auditingRepo: "Repo wird geprueft",
    previewReport: "Bericht ansehen",
    liveSample: "Live Beispiel",
    resetSample: "Beispiel zuruecksetzen",
    clear: "Leeren",
    verdict: "Urteil",
    conclusion: "Fazit",
    risk: "Risiko",
    nextFix: "Naechster Fix",
    reportShape: "Berichtsform",
    reportShapeTitle: "Score Blocker Issues Checkliste",
    reportShapeBody: "Public Repo einfuegen. Langweilige Launch Arbeit wird zu Aufgaben.",
    engine: "Engine",
    aiDependencyNone: "Keine AI Abhaengigkeit · Regeln zuerst",
    repository: "Repository",
    qualityGates: "Qualitaets Gates",
    doThisFirst: "Das zuerst tun",
    auditMethod: "Audit Methode",
    deterministicRules: "Deterministische Regeln zuerst",
    scope: "Umfang",
    publicRepoOnly: "Nur public repo",
    reads: "Liest",
    readsValue: "README env CI deploy Hinweise",
    score: "Score",
    fixToday: "Heute fixen",
    beforeLaunch: "Vor Launch",
    laterPolish: "Spaeterer Feinschliff",
    shipNext: "Naechster Versand",
    launchReadinessReport: "Launch Readiness Bericht",
    launchScore: "Launch Score",
    mustFixFirst: "Zuerst fixen",
    copy: "Kopieren",
    copied: "Kopiert",
    items: "Elemente",
    drafts: "Entwuerfe",
    steps: "Schritte",
    urlRequired: "Repository URL ist erforderlich",
    readingSignals: "Lese public repo Signale",
    qualityCiFound: "CI Signal gefunden",
    qualityCiMissing: "CI braucht Arbeit",
    qualityEnvFound: "env Vorlage gefunden",
    qualityEnvMissing: "env Vorlage fehlt",
    qualityRunFound: "Run Pfad gefunden",
    qualityRunMissing: "Run Pfad unklar",
    impactPolish: "Launch Feinschliff",
    impactCleanup: "Staging Cleanup",
    impactBlocked: "Launch blockiert",
    riskLow: "Niedrig",
    riskMedium: "Mittel",
    riskHigh: "Hoch",
    statusPass: "Bestanden",
    statusReview: "Pruefen",
    statusMissing: "Fehlt",
    updatedToday: "Heute aktualisiert",
    updatedYesterday: "Gestern aktualisiert",
    daysSinceUpdate: (days) => `${days} Tage seit Update`,
    monthsSinceUpdate: (months) => `${months} Monate seit Update`,
    unknownUpdate: "Unbekannt",
  }),
  pt: auditCopyFromEnglish({
    ready: "Pronto para auditar",
    repoUrl: "URL do repo",
    auditBlockers: "Auditar bloqueios de lancamento",
    auditRepo: "Auditar repo",
    auditingRepo: "Auditando repo",
    previewReport: "Prever relatorio",
    liveSample: "Exemplo real",
    resetSample: "Resetar exemplo",
    clear: "Limpar",
    verdict: "Veredito",
    conclusion: "Conclusao",
    risk: "risco",
    nextFix: "Proxima correcao",
    reportShape: "Formato do relatorio",
    reportShapeTitle: "Score bloqueios issues checklist",
    reportShapeBody: "Cole um repo publico e transforme trabalho chato de lancamento em tarefas.",
    repository: "Repositorio",
    qualityGates: "Portoes de qualidade",
    doThisFirst: "Faca isto primeiro",
    auditMethod: "Metodo de auditoria",
    deterministicRules: "Regras deterministicas primeiro",
    scope: "Escopo",
    publicRepoOnly: "Apenas repo publico",
    reads: "Le",
    readsValue: "README env CI pistas de deploy",
    launchReadinessReport: "Relatorio de prontidao",
    mustFixFirst: "Corrigir primeiro",
    copy: "Copiar",
    copied: "Copiado",
    urlRequired: "URL do repositorio e obrigatoria",
    readingSignals: "Lendo sinais do repo publico",
    riskLow: "Baixo",
    riskMedium: "Medio",
    riskHigh: "Alto",
    statusPass: "Passou",
    statusReview: "Revisar",
    statusMissing: "Faltando",
  }),
  ru: auditCopyFromEnglish({
    ready: "Готово к аудиту",
    repoUrl: "URL repo",
    auditBlockers: "Проверить launch blockers",
    auditRepo: "Аудит repo",
    auditingRepo: "Аудит repo",
    previewReport: "Предпросмотр отчета",
    liveSample: "Live пример",
    resetSample: "Сбросить пример",
    clear: "Очистить",
    verdict: "Вердикт",
    conclusion: "Вывод",
    risk: "риск",
    nextFix: "Следующий fix",
    reportShape: "Форма отчета",
    reportShapeTitle: "Score blockers issues checklist",
    reportShapeBody: "Вставьте public repo и превратите launch работу в задачи.",
    repository: "Репозиторий",
    qualityGates: "Quality gates",
    doThisFirst: "Сначала это",
    auditMethod: "Метод аудита",
    deterministicRules: "Сначала детерминированные правила",
    scope: "Область",
    publicRepoOnly: "Только public repo",
    reads: "Читает",
    readsValue: "README env CI deploy clues",
    launchReadinessReport: "Отчет готовности запуска",
    mustFixFirst: "Сначала исправить",
    copy: "Копировать",
    copied: "Скопировано",
    urlRequired: "Нужен URL репозитория",
    readingSignals: "Читаю сигналы public repo",
    riskLow: "Низкий",
    riskMedium: "Средний",
    riskHigh: "Высокий",
    statusPass: "ОК",
    statusReview: "Проверить",
    statusMissing: "Нет",
  }),
  hi: auditCopyFromEnglish({
    ready: "जांच के लिए तैयार",
    repoUrl: "Repo URL",
    auditBlockers: "Launch blockers जांचें",
    auditRepo: "Repo जांचें",
    auditingRepo: "Repo जांच हो रही है",
    previewReport: "Report preview",
    liveSample: "Live sample",
    resetSample: "Sample reset",
    clear: "साफ करें",
    verdict: "निष्कर्ष",
    conclusion: "निष्कर्ष",
    risk: "जोखिम",
    nextFix: "अगला fix",
    reportShape: "Report shape",
    reportShapeTitle: "Score blockers issues checklist",
    reportShapeBody: "Public repo paste करें और launch work को tasks में बदलें.",
    repository: "Repository",
    doThisFirst: "पहले यह करें",
    auditMethod: "Audit method",
    deterministicRules: "पहले deterministic rules",
    publicRepoOnly: "सिर्फ public repo",
    reads: "पढ़ता है",
    readsValue: "README env CI deploy clues",
    launchReadinessReport: "Launch readiness report",
    mustFixFirst: "पहले fix करें",
    copy: "कॉपी",
    copied: "कॉपी हुआ",
    urlRequired: "Repository URL जरूरी है",
    readingSignals: "Public repo signals पढ़ रहा है",
    riskLow: "कम",
    riskMedium: "मध्यम",
    riskHigh: "उच्च",
    statusPass: "पास",
    statusReview: "जांचें",
    statusMissing: "नहीं मिला",
  }),
  id: auditCopyFromEnglish({
    ready: "Siap audit",
    repoUrl: "URL repo",
    auditBlockers: "Audit blocker rilis",
    auditRepo: "Audit repo",
    auditingRepo: "Mengaudit repo",
    previewReport: "Pratinjau laporan",
    liveSample: "Contoh live",
    resetSample: "Reset contoh",
    clear: "Bersihkan",
    verdict: "Putusan",
    conclusion: "Kesimpulan",
    risk: "risiko",
    nextFix: "Perbaikan berikut",
    reportShape: "Bentuk laporan",
    reportShapeTitle: "Skor blocker issues checklist",
    reportShapeBody: "Tempel repo publik dan ubah pekerjaan rilis menjadi tugas.",
    repository: "Repositori",
    doThisFirst: "Kerjakan ini dulu",
    auditMethod: "Metode audit",
    deterministicRules: "Aturan deterministik dulu",
    publicRepoOnly: "Hanya repo publik",
    reads: "Membaca",
    readsValue: "README env CI petunjuk deploy",
    launchReadinessReport: "Laporan kesiapan rilis",
    mustFixFirst: "Perbaiki dulu",
    copy: "Salin",
    copied: "Disalin",
    urlRequired: "URL repositori wajib",
    readingSignals: "Membaca sinyal repo publik",
    riskLow: "Rendah",
    riskMedium: "Sedang",
    riskHigh: "Tinggi",
    statusPass: "Lulus",
    statusReview: "Tinjau",
    statusMissing: "Hilang",
  }),
  vi: auditCopyFromEnglish({
    ready: "Sẵn sàng kiểm tra",
    repoUrl: "URL repo",
    auditBlockers: "Kiểm tra blocker ra mắt",
    auditRepo: "Kiểm tra repo",
    auditingRepo: "Đang kiểm tra repo",
    previewReport: "Xem trước báo cáo",
    liveSample: "Mẫu live",
    resetSample: "Đặt lại mẫu",
    clear: "Xóa",
    verdict: "Kết luận",
    conclusion: "Kết luận",
    risk: "rủi ro",
    nextFix: "Sửa tiếp",
    reportShape: "Dạng báo cáo",
    reportShapeTitle: "Điểm blocker issues checklist",
    reportShapeBody: "Dán repo công khai và biến việc ra mắt thành task.",
    repository: "Repository",
    doThisFirst: "Làm cái này trước",
    auditMethod: "Cách kiểm tra",
    deterministicRules: "Quy tắc xác định trước",
    publicRepoOnly: "Chỉ repo công khai",
    reads: "Đọc",
    readsValue: "README env CI dấu hiệu deploy",
    launchReadinessReport: "Báo cáo sẵn sàng ra mắt",
    mustFixFirst: "Sửa trước",
    copy: "Sao chép",
    copied: "Đã sao chép",
    urlRequired: "Cần URL repository",
    readingSignals: "Đang đọc tín hiệu repo công khai",
    riskLow: "Thấp",
    riskMedium: "Vừa",
    riskHigh: "Cao",
    statusPass: "Đạt",
    statusReview: "Xem lại",
    statusMissing: "Thiếu",
  }),
  th: auditCopyFromEnglish({
    ready: "พร้อมตรวจ",
    repoUrl: "URL repo",
    auditBlockers: "ตรวจ blocker ก่อนปล่อย",
    auditRepo: "ตรวจ repo",
    auditingRepo: "กำลังตรวจ repo",
    previewReport: "ดูตัวอย่างรายงาน",
    liveSample: "ตัวอย่างจริง",
    resetSample: "รีเซ็ตตัวอย่าง",
    clear: "ล้าง",
    verdict: "สรุป",
    conclusion: "ข้อสรุป",
    risk: "ความเสี่ยง",
    nextFix: "แก้ต่อ",
    reportShape: "รูปแบบรายงาน",
    reportShapeTitle: "คะแนน blocker issues checklist",
    reportShapeBody: "วาง repo สาธารณะ แล้วเปลี่ยนงานปล่อยที่น่าเบื่อเป็น task",
    repository: "Repository",
    doThisFirst: "ทำสิ่งนี้ก่อน",
    auditMethod: "วิธีตรวจ",
    deterministicRules: "ใช้กฎก่อน",
    publicRepoOnly: "เฉพาะ repo สาธารณะ",
    reads: "อ่าน",
    readsValue: "README env CI deploy clues",
    launchReadinessReport: "รายงานความพร้อมปล่อย",
    mustFixFirst: "ต้องแก้ก่อน",
    copy: "คัดลอก",
    copied: "คัดลอกแล้ว",
    urlRequired: "ต้องมี URL repo",
    readingSignals: "กำลังอ่านสัญญาณ repo สาธารณะ",
    riskLow: "ต่ำ",
    riskMedium: "กลาง",
    riskHigh: "สูง",
    statusPass: "ผ่าน",
    statusReview: "ตรวจเพิ่ม",
    statusMissing: "ขาด",
  }),
  tr: auditCopyFromEnglish({
    ready: "Denetime hazır",
    repoUrl: "Repo URL",
    auditBlockers: "Yayın engellerini denetle",
    auditRepo: "Repo denetle",
    auditingRepo: "Repo denetleniyor",
    previewReport: "Rapor önizle",
    liveSample: "Canlı örnek",
    resetSample: "Örneği sıfırla",
    clear: "Temizle",
    verdict: "Karar",
    conclusion: "Sonuç",
    risk: "risk",
    nextFix: "Sıradaki fix",
    reportShape: "Rapor şekli",
    reportShapeTitle: "Skor engeller issues checklist",
    reportShapeBody: "Public repo yapıştır. Sıkıcı yayın işleri task olsun.",
    repository: "Repository",
    doThisFirst: "Önce bunu yap",
    auditMethod: "Denetim yöntemi",
    deterministicRules: "Önce deterministik kurallar",
    publicRepoOnly: "Sadece public repo",
    reads: "Okur",
    readsValue: "README env CI deploy ipuçları",
    launchReadinessReport: "Yayın hazırlık raporu",
    mustFixFirst: "Önce fix",
    copy: "Kopyala",
    copied: "Kopyalandı",
    urlRequired: "Repository URL gerekli",
    readingSignals: "Public repo sinyalleri okunuyor",
    riskLow: "Düşük",
    riskMedium: "Orta",
    riskHigh: "Yüksek",
    statusPass: "Geçti",
    statusReview: "İncele",
    statusMissing: "Eksik",
  }),
  it: auditCopyFromEnglish({
    ready: "Pronto per audit",
    repoUrl: "URL repo",
    auditBlockers: "Audit blocchi lancio",
    auditRepo: "Audita repo",
    auditingRepo: "Audit repo in corso",
    previewReport: "Anteprima report",
    liveSample: "Esempio live",
    resetSample: "Reset esempio",
    clear: "Pulisci",
    verdict: "Verdetto",
    conclusion: "Conclusione",
    risk: "rischio",
    nextFix: "Prossimo fix",
    reportShape: "Forma report",
    reportShapeTitle: "Score blocchi issues checklist",
    reportShapeBody: "Incolla un repo pubblico e trasforma il lavoro di lancio in task.",
    repository: "Repository",
    doThisFirst: "Fai prima questo",
    auditMethod: "Metodo audit",
    deterministicRules: "Prima regole deterministiche",
    publicRepoOnly: "Solo repo pubblico",
    reads: "Legge",
    readsValue: "README env CI indizi deploy",
    launchReadinessReport: "Report prontezza lancio",
    mustFixFirst: "Fix prima",
    copy: "Copia",
    copied: "Copiato",
    urlRequired: "URL repository richiesta",
    readingSignals: "Lettura segnali repo pubblico",
    riskLow: "Basso",
    riskMedium: "Medio",
    riskHigh: "Alto",
    statusPass: "OK",
    statusReview: "Rivedi",
    statusMissing: "Manca",
  }),
  nl: auditCopyFromEnglish({
    ready: "Klaar voor controle",
    repoUrl: "Repo URL",
    auditBlockers: "Controleer publicatie blockers",
    auditRepo: "Controleer repo",
    auditingRepo: "Repo wordt gecontroleerd",
    previewReport: "Rapport bekijken",
    liveSample: "Live voorbeeld",
    resetSample: "Voorbeeld resetten",
    clear: "Leegmaken",
    verdict: "Oordeel",
    conclusion: "Conclusie",
    risk: "risico",
    nextFix: "Volgende fix",
    reportShape: "Rapportvorm",
    reportShapeTitle: "Score blockers issues checklist",
    reportShapeBody: "Plak een publieke repo en zet launch werk om in taken.",
    repository: "Repository",
    doThisFirst: "Doe dit eerst",
    auditMethod: "Controle methode",
    deterministicRules: "Eerst deterministische regels",
    publicRepoOnly: "Alleen publieke repo",
    reads: "Leest",
    readsValue: "README env CI deploy aanwijzingen",
    launchReadinessReport: "Publicatie gereedheidsrapport",
    mustFixFirst: "Eerst fixen",
    copy: "Kopiëren",
    copied: "Gekopieerd",
    urlRequired: "Repository URL is nodig",
    readingSignals: "Publieke repo signalen lezen",
    riskLow: "Laag",
    riskMedium: "Middel",
    riskHigh: "Hoog",
    statusPass: "Geslaagd",
    statusReview: "Controleren",
    statusMissing: "Ontbreekt",
  }),
  pl: auditCopyFromEnglish({
    ready: "Gotowe do audytu",
    repoUrl: "URL repo",
    auditBlockers: "Audytuj blokery publikacji",
    auditRepo: "Audytuj repo",
    auditingRepo: "Audyt repo trwa",
    previewReport: "Podgląd raportu",
    liveSample: "Przykład live",
    resetSample: "Reset przykładu",
    clear: "Wyczyść",
    verdict: "Werdykt",
    conclusion: "Wniosek",
    risk: "ryzyko",
    nextFix: "Następny fix",
    reportShape: "Forma raportu",
    reportShapeTitle: "Wynik blokery issues checklist",
    reportShapeBody: "Wklej publiczne repo i zmień prace launch w zadania.",
    repository: "Repository",
    doThisFirst: "Zrób to najpierw",
    auditMethod: "Metoda audytu",
    deterministicRules: "Najpierw reguły deterministyczne",
    publicRepoOnly: "Tylko publiczne repo",
    reads: "Czyta",
    readsValue: "README env CI deploy wskazówki",
    launchReadinessReport: "Raport gotowości publikacji",
    mustFixFirst: "Najpierw napraw",
    copy: "Kopiuj",
    copied: "Skopiowano",
    urlRequired: "URL repository wymagany",
    readingSignals: "Czytam sygnały public repo",
    riskLow: "Niskie",
    riskMedium: "Średnie",
    riskHigh: "Wysokie",
    statusPass: "OK",
    statusReview: "Sprawdź",
    statusMissing: "Brak",
  }),
};

function getAuditCopy(language: InterfaceLanguage) {
  return extendedAuditCopy[language] || auditCopy[language] || auditCopy.en;
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
  const [runStatus, setRunStatus] = useState("");
  const hasAutoRunRef = useRef(false);

  const output = useMemo(() => formatGitHubRepoOutput(analysis, error, language), [analysis, error, language]);
  const displayAnalysis = useMemo(() => analysis ? localizeAnalysisForDisplay(analysis, language) : null, [analysis, language]);
  const displayedRunStatus = runStatus || t.ready;
  const issueBundle = useMemo(() => displayAnalysis?.copyableIssues.join("\n\n---\n\n") || "", [displayAnalysis]);
  const releaseBundle = useMemo(() => displayAnalysis ? numberedList(displayAnalysis.releaseChecklist) : "", [displayAnalysis]);
  const prDescription = useMemo(() => displayAnalysis?.prDescription || "", [displayAnalysis]);
  const qualityGates = useMemo(() => analysis ? qualityGateLabel(analysis, language) : [], [analysis, language]);
  const shareUrl = useMemo(() => {
    if (!analysis || typeof window === "undefined") return "";
    const hash = encodeSharedAnalysis(analysis);
    return `${window.location.origin}/tools/github-repo-analyzer${window.location.search}#report=${hash}`;
  }, [analysis]);
  const blocks = useMemo<OutputBlock[]>(() => {
    if (!displayAnalysis) return [];
    return [
      { badge: `${displayAnalysis.launchScore.score}`, title: `${riskLevelLabel(displayAnalysis.launchScore.riskLevel, language)} ${t.riskSuffix}`, content: displayAnalysis.launchScore.summary },
      { badge: "01", title: t.mustFixFirst, content: numberedList(displayAnalysis.mustFix) },
      { badge: "02", title: "GitHub Issues", content: displayAnalysis.copyableIssues.join("\n\n---\n\n") },
      { badge: "03", title: t.copyPrDescription.replace(/^Copy\s+/i, "").replace(/^复制\s*/, ""), content: displayAnalysis.prDescription },
      { badge: "04", title: t.copyReleaseChecklist.replace(/^Copy\s+/i, "").replace(/^复制\s*/, ""), content: numberedList(displayAnalysis.releaseChecklist) },
      { badge: "05", title: t.conclusion, content: findingList(displayAnalysis.issueFindings, language) },
      { badge: "06", title: "README", content: bulletList(displayAnalysis.readmeSuggestions) },
    ];
  }, [displayAnalysis, language, t]);

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
      const response = await fetch(`/api/tools/github-repo-analyzer?lang=${encodeURIComponent(language)}`, {
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
  }, [language, loadSamplePreview, t, url]);

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
      outputTitle={displayAnalysis ? `${displayAnalysis.launchScore.score}/100 ${t.launchReadinessReport}` : t.launchReadinessReport}
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
          <button type="button" className="dense-action" onClick={() => { setUrl(sampleRepoUrl); setError(""); setRunStatus(""); }}>
            {t.resetSample}
          </button>
          <button type="button" className="dense-action" onClick={() => { setUrl(""); setAnalysis(null); setError(""); setRunStatus(""); }}>
            {t.clear}
          </button>
        </>
      }
    >
      <p className="eyebrow">{t.repoUrl}</p>
      <h2>{t.auditBlockers}</h2>
      {displayAnalysis ? (
        <section className={`repo-verdict repo-verdict-${riskTone(displayAnalysis.launchScore.riskLevel)}`}>
          <div>
            <p className="eyebrow">{t.verdict}</p>
            <strong>{riskLevelLabel(displayAnalysis.launchScore.riskLevel, language)} {t.risk}</strong>
            <span>{displayAnalysis.launchScore.summary}</span>
          </div>
          <div className="repo-score">
            <strong>{displayAnalysis.launchScore.score}</strong>
            <span>/100</span>
          </div>
          <div className="repo-next-step">
            <p className="eyebrow">{t.nextFix}</p>
            <span>{displayAnalysis.mustFix[0]}</span>
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
      {displayAnalysis && (
        <section className="repo-audit-brief">
          <div>
            <p className="eyebrow">{t.engine}</p>
            <strong>{auditModeLabel(displayAnalysis.auditEngine?.mode, language)}</strong>
            <span>{t.aiDependencyNone}</span>
          </div>
          <div>
            <p className="eyebrow">{t.repository}</p>
            <strong>{displayAnalysis.repository.fullName}</strong>
            <span>{displayAnalysis.repository.language || t.unknown} · {displayAnalysis.repository.license || t.noLicense} · {repoAgeLabel(displayAnalysis.repository.pushedAt, language)}</span>
          </div>
          <div>
            <p className="eyebrow">{t.impact}</p>
            <strong>{impactLabel(displayAnalysis.launchScore.score, language)}</strong>
            <span>{displayAnalysis.mustFix.length} {t.actionItems} · {displayAnalysis.copyableIssues.length} {t.issueDrafts}</span>
          </div>
          <div>
            <p className="eyebrow">{t.qualityGates}</p>
            <strong>{qualityGates[0]}</strong>
            <span>{qualityGates.slice(1).join(" · ")}</span>
          </div>
        </section>
      )}
      {displayAnalysis && (
        <section className="repo-command-board">
          <div className="repo-command-head">
            <div>
              <p className="eyebrow">{t.doThisFirst}</p>
              <h3>{t.turnIntoWork}</h3>
              <span>{actionStatus || t.copyIntoGithub}</span>
            </div>
            <a href={displayAnalysis.repository.url} target="_blank" rel="noreferrer">{t.openRepo}</a>
          </div>
          <div className="repo-command-grid">
            <button type="button" onClick={() => copyAuditText(numberedList(displayAnalysis.mustFix), t.mustFixCopied)}>
              <span>01</span>
              <strong>{t.copy} {t.mustFixFirst}</strong>
              <em>{displayAnalysis.mustFix.length} {t.items}</em>
            </button>
            <button type="button" onClick={() => copyAuditText(issueBundle, t.issuesCopied)}>
              <span>02</span>
              <strong>{t.copyIssues}</strong>
              <em>{displayAnalysis.copyableIssues.length} {t.drafts}</em>
            </button>
            <button type="button" onClick={() => copyAuditText(prDescription, t.prDescriptionCopied)}>
              <span>03</span>
              <strong>{t.copyPrDescription}</strong>
              <em>{t.pasteReady}</em>
            </button>
            <button type="button" onClick={() => copyAuditText(releaseBundle, t.releaseChecklistCopied)}>
              <span>04</span>
              <strong>{t.copyReleaseChecklist}</strong>
              <em>{displayAnalysis.releaseChecklist.length} {t.steps}</em>
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
        <strong>{displayedRunStatus}</strong>
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
        {displayAnalysis && (
          <div className="dense-row">
            <span className="text-sm font-semibold">{t.score}</span>
            <span className="text-xs text-[color:var(--muted)]">{displayAnalysis.launchScore.score}/100 {riskLevelLabel(displayAnalysis.launchScore.riskLevel, language)}</span>
          </div>
        )}
      </div>
      {displayAnalysis && (
        <section className="repo-scorecard-grid">
          {displayAnalysis.scorecard.map((item) => (
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
      {displayAnalysis && (
        <section className="repo-priority-grid">
          <article className="repo-priority-card repo-priority-today">
            <p className="eyebrow">{t.fixToday}</p>
            <ol className="repo-check-list">
              {(displayAnalysis.priorityFixes.today.length ? displayAnalysis.priorityFixes.today : [t.noSameDayBlocker]).map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ol>
          </article>
          <article className="repo-priority-card">
            <p className="eyebrow">{t.beforeLaunch}</p>
            <ol className="repo-check-list">
              {(displayAnalysis.priorityFixes.beforeLaunch.length ? displayAnalysis.priorityFixes.beforeLaunch : [t.noPreLaunch]).map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ol>
          </article>
          <article className="repo-priority-card">
            <p className="eyebrow">{t.laterPolish}</p>
            <ol className="repo-check-list">
              {(displayAnalysis.priorityFixes.later.length ? displayAnalysis.priorityFixes.later : [t.laterFallback]).map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ol>
          </article>
        </section>
      )}
      {displayAnalysis && (
        <section className="repo-evidence-grid">
          {displayAnalysis.issueFindings.slice(0, 4).map((item) => (
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
      {displayAnalysis && (
        <section className="repo-action-panel">
          <div>
            <p className="eyebrow">{t.shipNext}</p>
            <h3>{t.turnReportIntoTasks}</h3>
            <p>{actionStatus || t.actionPanelBody}</p>
          </div>
          <div className="repo-action-list">
            {displayAnalysis.mustFix.slice(0, 3).map((item, index) => (
              <div key={item} className="dense-row">
                <span className="text-sm font-semibold">{String(index + 1).padStart(2, "0")}</span>
                <span className="truncate text-xs text-[color:var(--muted)]">{item}</span>
              </div>
            ))}
          </div>
        </section>
      )}
      {displayAnalysis && (
        <section className="repo-report-board">
          <div className="repo-report-head">
            <div>
              <p className="eyebrow">{t.professionalReport}</p>
              <h3>{t.launchReadinessReport}</h3>
              <span>{displayAnalysis.repository.fullName} · {riskLevelLabel(displayAnalysis.launchScore.riskLevel, language)} {t.risk} · {displayAnalysis.copyableIssues.length} {t.issueDrafts}</span>
            </div>
            <div className="repo-report-score">
              <strong>{displayAnalysis.launchScore.score}</strong>
              <span>{t.launchScore}</span>
            </div>
          </div>

          <div className="repo-report-grid">
            <div className="repo-report-section repo-report-section-primary">
              <div className="repo-report-section-head">
                <p className="eyebrow">{t.mustFixFirst}</p>
                <button type="button" onClick={() => copyAuditText(numberedList(displayAnalysis.mustFix), t.mustFixCopied)}>
                  {t.copy}
                </button>
              </div>
              <ol className="repo-check-list">
                {displayAnalysis.mustFix.map((item) => (
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
              <pre className="repo-pr-description">{displayAnalysis.prDescription}</pre>
            </div>
          </div>

          <div className="repo-issue-grid">
            {displayAnalysis.copyableIssues.slice(0, 3).map((issue, index) => (
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
