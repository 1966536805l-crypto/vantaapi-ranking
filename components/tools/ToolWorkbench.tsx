"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { recordLocalActivity } from "@/lib/local-progress";
import { toolDefinitions, type ToolDefinition, type ToolSlug } from "@/lib/tool-definitions";

type ApiMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
type RoadmapTrack = "zero" | "frontend" | "python" | "automation" | "indie";
type PromptTemplateKey = "builder" | "repo" | "code-coach" | "english-coach" | "api-docs";
type OutputBlock = {
  title: string;
  badge: string;
  content: string;
};

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
  mustFix: string[];
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
  mustFix: [
    "Keep the README quick start path under five minutes for a new contributor.",
    "Make required environment variables explicit in one env example section.",
    "Keep release and PR checklists visible so launch work is not trapped in maintainers' heads.",
  ],
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

const sampleCode = `async function loadUser(id) {
  const res = await fetch("/api/users/" + id);
  const data = await res.json();
  return data.user.name;
}`;

const sampleBug = `TypeError: Cannot read properties of undefined reading name

async function loadUser(id) {
  const data = await fetchUser(id);
  return data.user.name;
}`;

const samplePython = `def total_prices(items):
    total = 0
    for item in items:
        total += item["price"]
    return total

print(total_prices([{"price": 12}, {"price": 30}]))`;

const sampleApiBug = `401 Unauthorized

const response = await fetch("https://api.example.com/v1/users", {
  headers: {
    Authorization: token
  }
});`;

const roadmapTracks: Record<RoadmapTrack, { label: string; goal: string; stack: string[]; project: string }> = {
  zero: {
    label: "Zero base",
    goal: "Build programming confidence from syntax to small web tools",
    stack: ["HTML", "CSS", "JavaScript", "Git", "Browser DevTools"],
    project: "Personal tool landing page with one working calculator",
  },
  frontend: {
    label: "Frontend",
    goal: "Ship responsive React pages and reusable product components",
    stack: ["TypeScript", "React", "Next.js", "Tailwind", "API integration"],
    project: "Dashboard with filters forms charts and saved local state",
  },
  python: {
    label: "Python",
    goal: "Use Python for scripts data processing APIs and automation",
    stack: ["Python", "venv", "requests", "pandas", "FastAPI"],
    project: "Data cleaning API with CSV import and report export",
  },
  automation: {
    label: "Automation",
    goal: "Automate repeated browser file and API workflows safely",
    stack: ["Python", "Playwright", "cron", "webhooks", "logging"],
    project: "Daily website checker that sends a structured report",
  },
  indie: {
    label: "Indie developer",
    goal: "Find a narrow problem build a usable MVP and prepare launch",
    stack: ["Next.js", "Prisma", "Auth", "Payments later", "Analytics"],
    project: "One paid-tool style MVP with onboarding and retention loop",
  },
};

const promptTemplates: Record<PromptTemplateKey, { label: string; role: string; tasks: string; constraints: string; acceptance: string }> = {
  builder: {
    label: "Product builder",
    role: "You are a senior full stack product engineer",
    tasks: `1. Clarify the smallest shippable version
2. Design the route data and component structure
3. Implement with existing project patterns
4. Add focused tests or manual verification
5. Explain exactly how to run it`,
    constraints: `- Keep the MVP sharp
- Prefer existing stack and local helpers
- Avoid inflated marketing copy
- Ship something usable before adding breadth`,
    acceptance: `- The feature works from the first screen
- Empty error loading and mobile states are handled
- The user can verify it with one command or URL`,
  },
  repo: {
    label: "GitHub repo audit",
    role: "You are a pragmatic open source maintainer",
    tasks: `1. Read README package scripts config and CI
2. Identify how to install run test and deploy
3. List security and license risks
4. Suggest the first contribution path
5. Produce a PR checklist`,
    constraints: `- Do not invent files that are not present
- Separate facts from assumptions
- Prioritize contributor onboarding
- Keep commands copy ready`,
    acceptance: `- A new developer knows how to start
- Release blockers are visible
- The PR checklist catches docs tests and security risks`,
  },
  "code-coach": {
    label: "Programming coach",
    role: "You are a programming coach for zero base learners",
    tasks: `1. Explain the current concept in one small idea
2. Give one hint before the answer
3. Ask the learner to predict output or fill the blank
4. Show the answer only when requested
5. End with one tiny variation drill`,
    constraints: `- No long lectures
- No full solution first
- Use the learner's current code
- Keep examples runnable and short`,
    acceptance: `- The learner can do the next step alone
- The answer teaches debugging not memorization
- The final drill changes one thing only`,
  },
  "english-coach": {
    label: "English memory coach",
    role: "You are an English coach built only for vocabulary spelling and exam reading",
    tasks: `1. Give the core meaning
2. Add one natural phrase
3. Add one original sentence
4. Create a memory hook
5. Test spelling recall within 5 seconds`,
    constraints: `- Use original examples only
- Do not quote copyrighted dictionary entries
- Do not claim human audio
- Keep Chinese explanations concise when needed`,
    acceptance: `- The learner can spell the word
- The learner sees one usage pattern
- The drill is short enough to repeat daily`,
  },
  "api-docs": {
    label: "API docs",
    role: "You are a developer documentation writer",
    tasks: `1. State what the endpoint does
2. Document method headers body and response
3. Generate curl fetch axios and Python examples
4. Add error cases
5. Add a minimal test checklist`,
    constraints: `- Use concrete placeholders
- Never hide auth requirements
- Keep examples copy ready
- Mark destructive requests clearly`,
    acceptance: `- A developer can call the API without asking follow up questions
- Errors and auth are documented
- Examples match the same request shape`,
  },
};

function detectLanguage(code: string) {
  const source = code.trim();
  if (!source) return "Unknown";
  if (/#include|std::|cout|cin|int\s+main/.test(source)) return "C++";
  if (/def\s+\w+\(|import\s+\w+|print\(|self\./.test(source)) return "Python";
  if (/SELECT|INSERT|UPDATE|DELETE|FROM\s+\w+/i.test(source)) return "SQL";
  if (/<[a-z][\s\S]*>/i.test(source)) return "HTML";
  if (/function\s+\w+|const\s+\w+|let\s+\w+|=>|await\s+|React|useState/.test(source)) return "JavaScript TypeScript";
  return "General code";
}

function extractVariables(code: string) {
  const matches = [
    ...code.matchAll(/\b(?:const|let|var)\s+([A-Za-z_$][\w$]*)/g),
    ...code.matchAll(/\bfunction\s+([A-Za-z_$][\w$]*)/g),
    ...code.matchAll(/\bclass\s+([A-Za-z_$][\w$]*)/g),
    ...code.matchAll(/\bdef\s+([A-Za-z_]\w*)/g),
    ...code.matchAll(/\b(?:int|long|double|float|string|auto|bool)\s+([A-Za-z_]\w*)/g),
  ];
  return Array.from(new Set(matches.map((match) => match[1]))).slice(0, 10);
}

function lines(text: string) {
  return text.trim() ? text.trim().split(/\r?\n/).length : 0;
}

function normalizeJson(value: string) {
  try {
    const parsed = JSON.parse(value);
    return {
      ok: true,
      pretty: JSON.stringify(parsed, null, 2),
      minified: JSON.stringify(parsed),
      message: "Valid JSON",
    };
  } catch (error) {
    return {
      ok: false,
      pretty: "",
      minified: "",
      message: error instanceof Error ? error.message : "Invalid JSON",
    };
  }
}

function parseHeaders(input: string) {
  const headers: Record<string, string> = {};
  for (const line of input.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const colonIndex = trimmed.indexOf(":");
    if (colonIndex === -1) continue;
    const key = trimmed.slice(0, colonIndex).trim();
    const value = trimmed.slice(colonIndex + 1).trim();
    if (key) headers[key] = value;
  }
  return headers;
}

function stringifyHeaders(headers: Record<string, string>, indent = 2) {
  const entries = Object.entries(headers);
  if (entries.length === 0) return "{}";
  const space = " ".repeat(indent);
  return `{\n${entries.map(([key, value]) => `${space}"${key}": "${value.replace(/"/g, '\\"')}"`).join(",\n")}\n}`;
}

function safeJsonBody(raw: string) {
  if (!raw.trim()) return "";
  try {
    return JSON.stringify(JSON.parse(raw), null, 2);
  } catch {
    return raw.trim();
  }
}

function useCopy() {
  const [copied, setCopied] = useState("");
  async function copy(text: string, key: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      window.setTimeout(() => setCopied(""), 1200);
    } catch {
      setCopied("");
    }
  }
  return { copied, copy };
}

function fileSafeName(value: string) {
  const normalized = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return normalized || "vantaapi-lab-output";
}

function downloadTextFile(text: string, title: string) {
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${fileSafeName(title)}.txt`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function bulletList(items: string[]) {
  return items.length ? items.map((item) => `- ${item}`).join("\n") : "- No signal detected";
}

function numberedList(items: string[]) {
  return items.length ? items.map((item, index) => `${index + 1}. ${item}`).join("\n") : "1. No action detected";
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

function formatGitHubRepoOutput(analysis: GitHubRepoAnalysis | null, error: string) {
  if (error) {
    return `Status\n${error}\n\nSupported input\nPaste a public GitHub repository URL like ${sampleRepoUrl}`;
  }
  if (!analysis) {
    return `GitHub Launch Audit\nPaste a public GitHub repository URL and get the slow prelaunch checks in one place README gaps environment clues temporary files CI deployment signals SEO basics security notes and release steps.\n\nExample\n${sampleRepoUrl}`;
  }

  return [
    `Launch readiness\nScore: ${analysis.launchScore.score}/100\nRisk: ${analysis.launchScore.riskLevel}\n${analysis.launchScore.summary}`,
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
    `Release checklist\n${numberedList(analysis.releaseChecklist)}`,
    `Copyable GitHub issues\n${analysis.copyableIssues.join("\n\n---\n\n")}`,
    `Files read\n${bulletList(analysis.filesRead)}`,
  ].join("\n\n");
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

function issueTitle(issue: string, index: number) {
  const firstLine = issue.split(/\r?\n/).find((line) => line.trim());
  return firstLine?.replace(/^#+\s*/, "").trim() || `GitHub issue ${index + 1}`;
}

export default function ToolWorkbench({ initialSlug = "prompt-optimizer" }: { initialSlug?: ToolSlug }) {
  const pathname = usePathname();
  const active = useMemo<ToolSlug>(() => {
    const routeTool = toolDefinitions.find((tool) => pathname?.endsWith(`/tools/${tool.slug}`));
    return routeTool?.slug || initialSlug;
  }, [initialSlug, pathname]);

  const activeTool = toolDefinitions.find((tool) => tool.slug === active) || toolDefinitions[0];

  useEffect(() => {
    recordLocalActivity({
      id: `tool:${active}`,
      title: activeTool.title,
      href: `/tools/${active}`,
      kind: "tool",
    });
  }, [active, activeTool.title]);

  return (
    <main className="apple-page">
      <div className="tool-shell">
        <aside className="tool-rail dense-panel">
          <Link href="/" className="tool-brand">
            <span>JM</span>
            <strong>JinMing Lab</strong>
          </Link>
          <nav className="tool-nav">
            {toolDefinitions.map((tool) => (
              <Link
                key={tool.slug}
                href={`/tools/${tool.slug}`}
                className={tool.slug === active ? "tool-nav-link tool-nav-link-active" : "tool-nav-link"}
              >
                <span>{tool.code}</span>
                <strong>{tool.shortTitle}</strong>
              </Link>
            ))}
          </nav>
        </aside>

        <section className="min-w-0">
          <div className="dense-panel tool-hero">
            <div>
              <p className="eyebrow">AI Developer Tools</p>
              <h1>{activeTool.title}</h1>
              <p>{activeTool.description}</p>
            </div>
            <div className="tool-proof-grid">
              <span>Fast</span>
              <span>Copyable</span>
              <span>No login required</span>
            </div>
          </div>

          <div className="tool-command-strip dense-panel">
            <div>
              <p className="eyebrow">Input Pattern</p>
              <strong>{activeTool.inputHint}</strong>
            </div>
            <div className="tool-command-tags">
              <span>{activeTool.promise}</span>
              <span>Local first</span>
              <span>Private by default</span>
            </div>
          </div>

          <div className="mt-3">
            {active === "github-repo-analyzer" && <GitHubRepoAnalyzer />}
            {active === "prompt-optimizer" && <PromptOptimizer />}
            {active === "code-explainer" && <CodeExplainer />}
            {active === "bug-finder" && <BugFinder />}
            {active === "api-request-generator" && <ApiRequestGenerator />}
            {active === "dev-utilities" && <DevUtilities />}
            {active === "learning-roadmap" && <LearningRoadmap />}
          </div>

          <ToolSeoPanel tool={activeTool} />
        </section>
      </div>
    </main>
  );
}

function GitHubRepoAnalyzer() {
  const [url, setUrl] = useState(sampleRepoUrl);
  const [analysis, setAnalysis] = useState<GitHubRepoAnalysis | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [shareStatus, setShareStatus] = useState("");
  const [actionStatus, setActionStatus] = useState("");
  const [runStatus, setRunStatus] = useState("Ready to audit");

  const output = useMemo(() => formatGitHubRepoOutput(analysis, error), [analysis, error]);
  const issueBundle = useMemo(() => analysis?.copyableIssues.join("\n\n---\n\n") || "", [analysis]);
  const releaseBundle = useMemo(() => analysis ? numberedList(analysis.releaseChecklist) : "", [analysis]);
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
      { badge: "01", title: "Must fix", content: numberedList(analysis.mustFix) },
      { badge: "02", title: "GitHub issues", content: analysis.copyableIssues.join("\n\n---\n\n") },
      { badge: "03", title: "Release checklist", content: numberedList(analysis.releaseChecklist) },
      { badge: "04", title: "Environment checklist", content: bulletList(analysis.envChecklist) },
      { badge: "05", title: "README upgrades", content: bulletList(analysis.readmeSuggestions) },
      { badge: "06", title: "PR review checklist", content: numberedList(analysis.prReviewChecklist) },
    ];
  }, [analysis]);

  useEffect(() => {
    const shared = decodeSharedAnalysis(window.location.hash);
    if (!shared) return;
    window.setTimeout(() => {
      setAnalysis(shared);
      setUrl(shared.repository.url);
      setError("");
    }, 0);
  }, []);

  async function copyShareLink() {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setShareStatus("Share link copied");
      window.setTimeout(() => setShareStatus(""), 1400);
    } catch {
      setShareStatus("Copy failed");
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
      setActionStatus("Copy failed");
      window.setTimeout(() => setActionStatus(""), 1400);
    }
  }

  function loadSamplePreview(reason = "Local sample preview loaded") {
    setUrl(sampleRepoUrl);
    setAnalysis(sampleGitHubAnalysis);
    setError("");
    setRunStatus(reason);
    if (typeof window !== "undefined") {
      window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}`);
    }
  }

  async function analyzeRepo(targetUrl = url) {
    const trimmed = targetUrl.trim();
    if (!trimmed) {
      setError("Repository URL is required");
      setAnalysis(null);
      setRunStatus("URL required");
      return;
    }

    setUrl(trimmed);
    setLoading(true);
    setError("");
    setRunStatus("Reading public repo signals");
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
      setRunStatus(`Audit complete ${data.analysis.launchScore.score}/100`);
      window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}`);
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "Could not run repository launch audit";
      if (trimmed === sampleRepoUrl) {
        loadSamplePreview("Sample preview loaded because live audit is busy");
        return;
      }
      setAnalysis(null);
      setError(message);
      setRunStatus(message);
    } finally {
      setLoading(false);
    }
  }

  function runSampleAudit() {
    loadSamplePreview("Local sample preview loaded");
  }

  return (
    <ToolLayout
      output={output}
      outputTitle={analysis ? `${analysis.launchScore.score}/100 launch audit` : "Launch audit"}
      blocks={blocks}
      actions={
        <>
          <button type="button" className="dense-action-primary" onClick={() => void analyzeRepo()} disabled={loading}>
            {loading ? "Auditing repo" : "Run launch audit"}
          </button>
          <button type="button" className="dense-action" onClick={runSampleAudit} disabled={loading}>
            Try sample audit
          </button>
          <button type="button" className="dense-action" onClick={() => void analyzeRepo(sampleRepoUrl)} disabled={loading}>
            Run live sample
          </button>
          {analysis && (
            <>
              <button type="button" className="dense-action" onClick={copyShareLink}>
                {shareStatus || "Copy share link"}
              </button>
              <a className="dense-action" href={shareUrl} target="_blank" rel="noreferrer">
                Open share
              </a>
              <button type="button" className="dense-action" onClick={() => copyAuditText(issueBundle, "Issues copied")}>
                Copy issues
              </button>
              <button type="button" className="dense-action" onClick={() => copyAuditText(releaseBundle, "Checklist copied")}>
                Copy checklist
              </button>
              <a className="dense-action" href={analysis.repository.url} target="_blank" rel="noreferrer">
                Open repo
              </a>
            </>
          )}
          <button type="button" className="dense-action" onClick={() => { setUrl(sampleRepoUrl); setError(""); }}>
            Load sample
          </button>
          <button type="button" className="dense-action" onClick={() => { setUrl(""); setAnalysis(null); setError(""); }}>
            Clear
          </button>
        </>
      }
    >
      <p className="eyebrow">Input</p>
      <h2>Public repository launch audit</h2>
      {analysis ? (
        <section className={`repo-verdict repo-verdict-${riskTone(analysis.launchScore.riskLevel)}`}>
          <div>
            <p className="eyebrow">Verdict</p>
            <strong>{analysis.launchScore.riskLevel} risk</strong>
            <span>{analysis.launchScore.summary}</span>
          </div>
          <div className="repo-score">
            <strong>{analysis.launchScore.score}</strong>
            <span>/100</span>
          </div>
          <div className="repo-next-step">
            <p className="eyebrow">Next Fix</p>
            <span>{analysis.mustFix[0]}</span>
          </div>
        </section>
      ) : (
        <section className="repo-verdict repo-verdict-empty">
          <div>
            <p className="eyebrow">Report Shape</p>
            <strong>Score risk blockers issues</strong>
            <span>Paste a public repo and get a launch verdict, must-fix list, GitHub issue drafts, and release checklist.</span>
          </div>
        </section>
      )}
      {analysis && (
        <section className="repo-audit-brief">
          <div>
            <p className="eyebrow">Repository</p>
            <strong>{analysis.repository.fullName}</strong>
            <span>{analysis.repository.language || "Unknown"} · {analysis.repository.license || "No license"} · {repoAgeLabel(analysis.repository.pushedAt)}</span>
          </div>
          <div>
            <p className="eyebrow">Impact</p>
            <strong>{impactLabel(analysis.launchScore.score)}</strong>
            <span>{analysis.mustFix.length} action items · {analysis.copyableIssues.length} issue drafts</span>
          </div>
          <div>
            <p className="eyebrow">Quality Gates</p>
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
          <span className="text-xs text-[color:var(--muted)]">Public repo launch readiness only</span>
        </div>
        <div className="dense-row">
          <span className="text-sm font-semibold">Reads</span>
          <span className="text-xs text-[color:var(--muted)]">README package env CI deploy clues</span>
        </div>
        {analysis && (
          <div className="dense-row">
            <span className="text-sm font-semibold">Score</span>
            <span className="text-xs text-[color:var(--muted)]">{analysis.launchScore.score}/100 {analysis.launchScore.riskLevel}</span>
          </div>
        )}
      </div>
      {analysis && (
        <section className="repo-action-panel">
          <div>
            <p className="eyebrow">Ship Next</p>
            <h3>把报告变成任务</h3>
            <p>{actionStatus || "复制 Issue 后可直接贴进 GitHub Issues；复制 checklist 可放到 PR 描述或发布说明里。"}</p>
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
              <p className="eyebrow">Professional Report</p>
              <h3>Launch readiness report</h3>
              <span>{analysis.repository.fullName} · {analysis.launchScore.riskLevel} risk · {analysis.copyableIssues.length} issue drafts</span>
            </div>
            <div className="repo-report-score">
              <strong>{analysis.launchScore.score}</strong>
              <span>Launch Score</span>
            </div>
          </div>

          <div className="repo-report-grid">
            <div className="repo-report-section repo-report-section-primary">
              <div className="repo-report-section-head">
                <p className="eyebrow">Must Fix First</p>
                <button type="button" onClick={() => copyAuditText(numberedList(analysis.mustFix), "Must fix copied")}>
                  Copy
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
                <p className="eyebrow">Release Checklist</p>
                <button type="button" onClick={() => copyAuditText(releaseBundle, "Release checklist copied")}>
                  Copy
                </button>
              </div>
              <ol className="repo-check-list">
                {analysis.releaseChecklist.slice(0, 6).map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ol>
            </div>
          </div>

          <div className="repo-issue-grid">
            {analysis.copyableIssues.slice(0, 3).map((issue, index) => (
              <article key={issue} className="repo-issue-card">
                <div>
                  <p className="eyebrow">Issue {String(index + 1).padStart(2, "0")}</p>
                  <h4>{issueTitle(issue, index)}</h4>
                </div>
                <button type="button" onClick={() => copyAuditText(issue, `Issue ${index + 1} copied`)}>
                  Copy Issue
                </button>
              </article>
            ))}
          </div>
        </section>
      )}
    </ToolLayout>
  );
}


function toolExamples(tool: ToolDefinition) {
  if (tool.slug === "prompt-optimizer") {
    return [
      {
        title: "Writing prompt optimization",
        input: "Write a product intro for a new AI tool.",
        output: "Audience, tone, structure, proof points, limits, and acceptance criteria before drafting.",
      },
      {
        title: "Code generation prompt optimization",
        input: "Build a settings page in Next.js.",
        output: "Route, components, state, validation, error states, styling constraints, and verification commands.",
      },
      {
        title: "Learning plan prompt optimization",
        input: "Help me learn Python in 30 days.",
        output: "Weekly goals, daily exercises, review checkpoints, final project, and measurable completion criteria.",
      },
    ];
  }

  return [
    {
      title: `${tool.shortTitle} example`,
      input: tool.inputExample,
      output: tool.outputExample,
    },
  ];
}

function ToolSeoPanel({ tool }: { tool: ToolDefinition }) {
  const examples = toolExamples(tool);

  return (
    <section className="mt-3 grid gap-3 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
      <div className="dense-panel p-5">
        <p className="eyebrow">What It Does</p>
        <h2 className="mt-2 text-2xl font-semibold">{tool.shortTitle} workflow</h2>
        <div className="mt-4 grid gap-2">
          {tool.whatItDoes.map((item) => (
            <div key={item} className="dense-row">
              <span className="text-sm font-semibold">{item}</span>
              <span className="text-xs text-[color:var(--muted)]">Built for fast copyable work</span>
            </div>
          ))}
        </div>
      </div>

      <div className="dense-panel p-5">
        <p className="eyebrow">Good For</p>
        <h2 className="mt-2 text-2xl font-semibold">Who should use it</h2>
        <div className="mt-4 grid gap-2 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
          {tool.audience.map((item) => (
            <div key={item} className="rounded-[8px] border border-slate-200 bg-white/70 p-3 text-sm font-semibold">
              {item}
            </div>
          ))}
        </div>
      </div>

      <div className="dense-panel p-5">
        <p className="eyebrow">Examples</p>
        <h2 className="mt-2 text-2xl font-semibold">Input and output</h2>
        <div className="mt-4 grid gap-3">
          {examples.map((example) => (
            <article key={example.title} className="rounded-[8px] border border-slate-200 bg-white/75 p-3">
              <p className="eyebrow">{example.title}</p>
              <p className="mt-2 text-sm leading-6 text-slate-800"><strong>Input:</strong> {example.input}</p>
              <p className="mt-2 text-sm leading-6 text-[color:var(--muted)]"><strong>Output:</strong> {example.output}</p>
            </article>
          ))}
        </div>
      </div>

      <div className="dense-panel p-5">
        <p className="eyebrow">FAQ And Limits</p>
        <h2 className="mt-2 text-2xl font-semibold">Before you use it</h2>
        <div className="mt-4 grid gap-2">
          {tool.faq.map((item) => (
            <details key={item.question} className="rounded-[8px] border border-slate-200 bg-white/70 p-3">
              <summary className="cursor-pointer text-sm font-semibold">{item.question}</summary>
              <p className="mt-2 text-sm leading-6 text-[color:var(--muted)]">{item.answer}</p>
            </details>
          ))}
          <div className="rounded-[8px] border border-slate-200 bg-white/70 p-3">
            <p className="text-sm font-semibold">Usage limits</p>
            <ul className="mt-2 space-y-1 text-sm leading-6 text-[color:var(--muted)]">
              {tool.limitations.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

function ToolLayout({
  children,
  output,
  outputTitle = "Output",
  actions,
  blocks,
}: {
  children: React.ReactNode;
  output: string;
  outputTitle?: string;
  actions?: React.ReactNode;
  blocks?: OutputBlock[];
}) {
  const { copied, copy } = useCopy();
  const [downloaded, setDownloaded] = useState(false);
  const outputLines = output.trim() ? output.trim().split(/\r?\n/).length : 0;
  const outputCharacters = output.length;

  function downloadOutput() {
    downloadTextFile(output, outputTitle);
    setDownloaded(true);
    window.setTimeout(() => setDownloaded(false), 1200);
  }

  return (
    <div className="tool-workgrid">
      <section className="dense-panel tool-panel">
        {children}
        {actions && <div className="tool-action-row">{actions}</div>}
      </section>
      <section className="dense-panel tool-output">
        <div className="tool-output-head">
          <div>
            <p className="eyebrow">Generated</p>
            <h2>{outputTitle}</h2>
          </div>
          <div className="tool-output-actions">
            <span>{outputLines} lines</span>
            <span>{outputCharacters} chars</span>
            <button type="button" className="dense-action" onClick={() => copy(output, "main")}>
              {copied === "main" ? "Copied" : "Copy"}
            </button>
            <button type="button" className="dense-action" onClick={downloadOutput}>
              {downloaded ? "Downloaded" : "Download"}
            </button>
          </div>
        </div>
        <pre>{output}</pre>
        {blocks && blocks.length > 0 && (
          <div className="tool-block-grid">
            {blocks.map((block) => (
              <article key={block.title} className="tool-copy-block">
                <div className="tool-copy-block-head">
                  <span>{block.badge}</span>
                  <strong>{block.title}</strong>
                  <button type="button" onClick={() => copy(block.content, block.title)}>
                    {copied === block.title ? "Copied" : "Copy"}
                  </button>
                </div>
                <p>{block.content}</p>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function PromptOptimizer() {
  const sampleGoal = "Build an AI tool website with six practical developer tools";
  const sampleContext = "Target users are beginners and indie developers. The page should be dense, useful and production ready.";
  const [goal, setGoal] = useState(sampleGoal);
  const [mode, setMode] = useState("coding");
  const [context, setContext] = useState(sampleContext);
  const [templateKey, setTemplateKey] = useState<PromptTemplateKey>("builder");

  const promptBlocks = useMemo<OutputBlock[]>(() => {
    const template = promptTemplates[templateKey];
    const role =
      template?.role ||
      (mode === "research"
        ? "You are a senior research analyst"
        : mode === "product"
          ? "You are a senior product manager and UX writer"
          : "You are a senior full stack engineer");
    const cleanGoal = goal.trim() || "Describe the goal here";
    const cleanContext = context.trim() || "Add audience product constraints current stack and examples here";

    return [
      { badge: "01", title: "Role", content: role },
      { badge: "02", title: "Goal", content: cleanGoal },
      { badge: "03", title: "Context", content: cleanContext },
      {
        badge: "04",
        title: "Tasks",
        content: template?.tasks || `1. Restate the objective in one sentence
2. Ask only the critical missing questions
3. Propose a practical implementation plan
4. Produce the final answer or code in a copy ready format
5. Call out risks edge cases and test steps`,
      },
      {
        badge: "05",
        title: "Output Format",
        content: `- Summary
- Assumptions
- Plan
- Deliverable
- Verification`,
      },
      {
        badge: "06",
        title: "Constraints",
        content: template?.constraints || `- Prefer simple maintainable choices
- Avoid vague advice
- Make the result usable immediately
- Include filenames commands or examples when relevant`,
      },
      {
        badge: "07",
        title: "Acceptance Criteria",
        content: template?.acceptance || `- The answer solves the actual user goal
- The next action is obvious
- The output can be pasted into a real workflow`,
      },
    ];
  }, [context, goal, mode, templateKey]);

  const output = useMemo(
    () => promptBlocks.map((block) => `${block.title}\n${block.content}`).join("\n\n"),
    [promptBlocks]
  );

  return (
    <ToolLayout
      output={output}
      outputTitle="Optimized prompt"
      blocks={promptBlocks}
      actions={
        <>
          <button type="button" className="dense-action" onClick={() => { setGoal(sampleGoal); setContext(sampleContext); setMode("coding"); }}>
            Load sample
          </button>
          <button type="button" className="dense-action" onClick={() => { setGoal(""); setContext(""); }}>
            Clear
          </button>
        </>
      }
    >
      <p className="eyebrow">Input</p>
      <h2>Rough request</h2>
      <textarea value={goal} onChange={(event) => setGoal(event.target.value)} className="tool-textarea" placeholder="Describe what you want AI to do" />
      <div className="tool-field-grid">
        <label>
          <span>Use case</span>
          <select value={mode} onChange={(event) => setMode(event.target.value)} className="tool-input">
            <option value="coding">Coding</option>
            <option value="research">Research</option>
            <option value="product">Product</option>
          </select>
        </label>
        <label>
          <span>Template</span>
          <select value={templateKey} onChange={(event) => setTemplateKey(event.target.value as PromptTemplateKey)} className="tool-input">
            {Object.entries(promptTemplates).map(([key, template]) => (
              <option key={key} value={key}>{template.label}</option>
            ))}
          </select>
        </label>
      </div>
      <label className="block">
        <span className="tool-label">Context</span>
        <textarea value={context} onChange={(event) => setContext(event.target.value)} className="tool-textarea tool-textarea-small" />
      </label>
    </ToolLayout>
  );
}

function CodeExplainer() {
  const [code, setCode] = useState(sampleCode);
  const explainBlocks = useMemo<OutputBlock[]>(() => {
    const language = detectLanguage(code);
    const variables = extractVariables(code);
    const risks = [
      code.includes("fetch(") && !code.includes("response.ok") ? "Network response is used without checking response.ok" : "",
      /JSON\.parse|\.json\(\)/.test(code) && !/try|catch/.test(code) ? "JSON parsing has no error handling path" : "",
      /\.\w+\.\w+/.test(code) ? "Nested property access may fail when an object is undefined" : "",
      /password|secret|token|apiKey/i.test(code) ? "Sensitive value appears in code and should be moved to environment variables" : "",
    ].filter(Boolean);

    const notes = [
      `Detected language ${language}`,
      `Approximate size ${lines(code)} lines`,
      variables.length ? `Key names ${variables.join(", ")}` : "No obvious variable declarations found",
    ];

    return [
      {
        badge: "01",
        title: "Code purpose",
        content: [
        language === "JavaScript TypeScript" && code.includes("fetch(")
          ? "This code performs an asynchronous HTTP request and returns data from the response"
          : "This code defines logic that should be read from input setup to output or return value",
        code.includes("return") ? "The final returned value is the main result of the function" : "Look for side effects such as printing mutation or network calls",
        ].map((item) => `- ${item}`).join("\n"),
      },
      {
        badge: "02",
        title: "Key variables and functions",
        content: (variables.length ? variables.map((item) => `${item} is a named value function or class used by the snippet`) : ["No named variables detected"]).map((item) => `- ${item}`).join("\n"),
      },
      {
        badge: "03",
        title: "Potential bugs",
        content: (risks.length ? risks : ["No obvious bug pattern found from static heuristics"]).map((item) => `- ${item}`).join("\n"),
      },
      {
        badge: "04",
        title: "Learning notes",
        content: notes.map((item) => `- ${item}`).join("\n"),
      },
    ];
  }, [code]);
  const output = useMemo(
    () => explainBlocks.map((block) => `${block.title}\n${block.content}`).join("\n\n"),
    [explainBlocks]
  );

  return (
    <ToolLayout
      output={output}
      outputTitle="Code explanation"
      blocks={explainBlocks}
      actions={
        <>
          <button type="button" className="dense-action" onClick={() => setCode(sampleCode)}>
            JS sample
          </button>
          <button type="button" className="dense-action" onClick={() => setCode(samplePython)}>
            Python sample
          </button>
          <button type="button" className="dense-action" onClick={() => setCode("")}>
            Clear
          </button>
        </>
      }
    >
      <p className="eyebrow">Input</p>
      <h2>Paste code</h2>
      <textarea value={code} onChange={(event) => setCode(event.target.value)} className="tool-textarea tool-code-input" spellCheck={false} />
    </ToolLayout>
  );
}

function BugFinder() {
  const [error, setError] = useState(sampleBug);
  const [code, setCode] = useState(sampleCode);
  const bugBlocks = useMemo<OutputBlock[]>(() => {
    const combined = `${error}\n${code}`;
    const causes = [
      /undefined|null|Cannot read/i.test(combined) ? "A value is undefined or null before property access" : "",
      /404/.test(combined) ? "The requested endpoint or route is missing" : "",
      /401|403/.test(combined) ? "Authentication permission or same origin policy is blocking the request" : "",
      /500|Prisma|database|SQL/i.test(combined) ? "Server side database or API logic may be failing" : "",
      /CORS|origin/i.test(combined) ? "Cross origin request policy is rejecting the browser request" : "",
      /module not found|Cannot find module/i.test(combined) ? "A dependency import path or package installation is missing" : "",
      /Type '.+' is not assignable|ts\(/i.test(combined) ? "TypeScript types do not match the value being passed" : "",
    ].filter(Boolean);
    const firstCause = causes[0] || "The error needs a smaller reproduction but the failure is probably near the first stack trace line";
    const severity = /401|403|password|secret|token|apiKey/i.test(combined)
      ? "High because auth or sensitive data may be involved"
      : /500|database|Prisma|SQL/i.test(combined)
        ? "Medium because server or data logic may be failing"
        : "Normal debugging risk";
    const repairTemplate = code.includes(".user.name")
      ? `const userName = data?.user?.name;
if (!userName) {
  throw new Error("User name is missing from API response");
}
return userName;`
      : /401|403/i.test(combined)
        ? `const response = await fetch(url, {
  headers: {
    Authorization: \`Bearer \${token}\`
  }
});

if (!response.ok) {
  throw new Error(\`Request failed \${response.status}\`);
}`
        : `if (!value) {
  throw new Error("Expected value is missing");
}

// Then continue with the normal logic`;

    return [
      { badge: "01", title: "Severity", content: severity },
      { badge: "02", title: "Most likely cause", content: firstCause },
      {
        badge: "03",
        title: "Debug steps",
        content: `1. Reproduce with the smallest input that still fails
2. Log the value immediately before the failing line
3. Check network status response body and server logs
4. Add guards for missing data before using nested fields
5. Write one regression test or manual checklist after fixing`,
      },
      { badge: "04", title: "Repair template", content: repairTemplate },
      {
        badge: "05",
        title: "What to verify",
        content: `- The same input no longer fails
- Missing data produces a clear error
- The fix does not hide a real server or auth issue`,
      },
    ];
  }, [code, error]);
  const output = useMemo(
    () => bugBlocks.map((block) => `${block.title}\n${block.content}`).join("\n\n"),
    [bugBlocks]
  );

  return (
    <ToolLayout
      output={output}
      outputTitle="Bug diagnosis"
      blocks={bugBlocks}
      actions={
        <>
          <button type="button" className="dense-action" onClick={() => { setError(sampleBug); setCode(sampleCode); }}>
            TypeError sample
          </button>
          <button type="button" className="dense-action" onClick={() => { setError(sampleApiBug); setCode(sampleApiBug); }}>
            API sample
          </button>
          <button type="button" className="dense-action" onClick={() => { setError(""); setCode(""); }}>
            Clear
          </button>
        </>
      }
    >
      <p className="eyebrow">Input</p>
      <h2>Error and code</h2>
      <label className="block">
        <span className="tool-label">Error message</span>
        <textarea value={error} onChange={(event) => setError(event.target.value)} className="tool-textarea tool-textarea-small" />
      </label>
      <label className="block">
        <span className="tool-label">Code snippet</span>
        <textarea value={code} onChange={(event) => setCode(event.target.value)} className="tool-textarea tool-code-input" spellCheck={false} />
      </label>
    </ToolLayout>
  );
}

function ApiRequestGenerator() {
  const [url, setUrl] = useState("https://api.example.com/v1/users");
  const [method, setMethod] = useState<ApiMethod>("POST");
  const [headers, setHeaders] = useState("Authorization: Bearer YOUR_TOKEN\nContent-Type: application/json");
  const [body, setBody] = useState('{"name":"JinMing Lab","role":"developer"}');
  const requestBlocks = useMemo<OutputBlock[]>(() => {
    const parsedHeaders = parseHeaders(headers);
    const prettyBody = safeJsonBody(body);
    const hasBody = !["GET", "DELETE"].includes(method) && prettyBody.length > 0;
    const headerFlags = Object.entries(parsedHeaders).map(([key, value]) => `  -H '${key}: ${value}'`).join(" \\\n");
    const curlBody = hasBody ? ` \\\n  -d '${prettyBody.replace(/'/g, "'\\''")}'` : "";
    const headersObject = stringifyHeaders(parsedHeaders, 4);
    const bodyLine = hasBody ? `,\n  body: JSON.stringify(${prettyBody})` : "";
    const axiosBody = hasBody ? `,\n  ${prettyBody}` : "";
    const pythonBody = hasBody ? `,\n    json=${prettyBody.replace(/\n/g, "\n    ")}` : "";

    return [
      {
        badge: "01",
        title: "curl",
        content: `curl -X ${method} '${url}'${headerFlags ? ` \\\n${headerFlags}` : ""}${curlBody}`,
      },
      {
        badge: "02",
        title: "fetch",
        content: `const response = await fetch("${url}", {
  method: "${method}",
  headers: ${headersObject}${bodyLine}
});
const data = await response.json();`,
      },
      {
        badge: "03",
        title: "axios",
        content: `const response = await axios.${method.toLowerCase()}("${url}"${axiosBody}, {
  headers: ${headersObject}
});`,
      },
      {
        badge: "04",
        title: "Python requests",
        content: `import requests

response = requests.${method.toLowerCase()}(
    "${url}",
    headers=${JSON.stringify(parsedHeaders, null, 4).replace(/\n/g, "\n    ")}${pythonBody}
)
print(response.status_code)
print(response.json())`,
      },
    ];
  }, [body, headers, method, url]);
  const output = useMemo(
    () => requestBlocks.map((block) => `${block.title}\n${block.content}`).join("\n\n"),
    [requestBlocks]
  );

  return (
    <ToolLayout
      output={output}
      outputTitle="Request snippets"
      blocks={requestBlocks}
      actions={
        <>
          <button type="button" className="dense-action" onClick={() => { setMethod("GET"); setUrl("https://api.example.com/v1/projects"); setHeaders("Authorization: Bearer YOUR_TOKEN"); setBody(""); }}>
            GET preset
          </button>
          <button type="button" className="dense-action" onClick={() => { setMethod("POST"); setUrl("https://api.example.com/v1/users"); setHeaders("Authorization: Bearer YOUR_TOKEN\nContent-Type: application/json"); setBody('{"name":"JinMing Lab","role":"developer"}'); }}>
            POST preset
          </button>
          <button type="button" className="dense-action" onClick={() => { setHeaders(""); setBody(""); }}>
            Clear body
          </button>
        </>
      }
    >
      <p className="eyebrow">Input</p>
      <h2>API details</h2>
      <div className="tool-field-grid">
        <label>
          <span>Method</span>
          <select value={method} onChange={(event) => setMethod(event.target.value as ApiMethod)} className="tool-input">
            {["GET", "POST", "PUT", "PATCH", "DELETE"].map((item) => <option key={item}>{item}</option>)}
          </select>
        </label>
        <label>
          <span>Endpoint</span>
          <input value={url} onChange={(event) => setUrl(event.target.value)} className="tool-input" />
        </label>
      </div>
      <label className="block">
        <span className="tool-label">Headers one per line</span>
        <textarea value={headers} onChange={(event) => setHeaders(event.target.value)} className="tool-textarea tool-textarea-small" />
      </label>
      <label className="block">
        <span className="tool-label">JSON body</span>
        <textarea value={body} onChange={(event) => setBody(event.target.value)} className="tool-textarea tool-textarea-small" spellCheck={false} />
      </label>
    </ToolLayout>
  );
}

function DevUtilities() {
  const [json, setJson] = useState('{"name":"JinMing Lab","tools":["json","regex","timestamp"],"ok":true}');
  const [pattern, setPattern] = useState("\\b[A-Z][A-Za-z]+\\b");
  const [flags, setFlags] = useState("g");
  const [regexText, setRegexText] = useState("JinMing Lab builds JSON Regex Timestamp Tools");
  const [timestamp, setTimestamp] = useState("1700000000000");

  const utilityBlocks = useMemo<OutputBlock[]>(() => {
    const jsonResult = normalizeJson(json);
    let regexResult = "";
    try {
      const normalizedFlags = flags.includes("g") ? flags : `${flags}g`;
      const regex = new RegExp(pattern, normalizedFlags);
      const matches = Array.from(regexText.matchAll(regex)).map((match) => match[0]);
      regexResult = matches.length ? matches.join("\n") : "No matches";
    } catch (error) {
      regexResult = error instanceof Error ? error.message : "Invalid regex";
    }

    const numeric = Number(timestamp.trim());
    const date = Number.isFinite(numeric)
      ? new Date(String(Math.trunc(numeric)).length === 10 ? numeric * 1000 : numeric)
      : new Date(timestamp.trim());

    return [
      { badge: "01", title: "JSON status", content: jsonResult.message },
      { badge: "02", title: "Formatted JSON", content: jsonResult.ok ? jsonResult.pretty : "Fix JSON before formatting" },
      { badge: "03", title: "Minified JSON", content: jsonResult.ok ? jsonResult.minified : "Unavailable" },
      { badge: "04", title: "Regex matches", content: regexResult },
      {
        badge: "05",
        title: "Timestamp",
        content: `Input ${timestamp}
ISO ${Number.isNaN(date.getTime()) ? "Invalid date" : date.toISOString()}
Local ${Number.isNaN(date.getTime()) ? "Invalid date" : date.toLocaleString()}
Unix seconds ${Number.isNaN(date.getTime()) ? "Invalid date" : Math.floor(date.getTime() / 1000)}
Milliseconds ${Number.isNaN(date.getTime()) ? "Invalid date" : date.getTime()}`,
      },
    ];
  }, [flags, json, pattern, regexText, timestamp]);
  const output = useMemo(
    () => utilityBlocks.map((block) => `${block.title}\n${block.content}`).join("\n\n"),
    [utilityBlocks]
  );

  return (
    <ToolLayout
      output={output}
      outputTitle="Utility result"
      blocks={utilityBlocks}
      actions={
        <>
          <button type="button" className="dense-action" onClick={() => setJson('{"name":"JinMing Lab","tools":["json","regex","timestamp"],"ok":true}')}>
            JSON sample
          </button>
          <button type="button" className="dense-action" onClick={() => setTimestamp(String(Date.now()))}>
            Current time
          </button>
          <button type="button" className="dense-action" onClick={() => { setJson(""); setRegexText(""); setTimestamp(""); }}>
            Clear
          </button>
        </>
      }
    >
      <p className="eyebrow">Input</p>
      <h2>JSON Regex Timestamp</h2>
      <label className="block">
        <span className="tool-label">JSON</span>
        <textarea value={json} onChange={(event) => setJson(event.target.value)} className="tool-textarea tool-textarea-small" spellCheck={false} />
      </label>
      <div className="tool-field-grid">
        <label>
          <span>Regex</span>
          <input value={pattern} onChange={(event) => setPattern(event.target.value)} className="tool-input" />
        </label>
        <label>
          <span>Flags</span>
          <input value={flags} onChange={(event) => setFlags(event.target.value)} className="tool-input" />
        </label>
      </div>
      <textarea value={regexText} onChange={(event) => setRegexText(event.target.value)} className="tool-textarea tool-textarea-small" />
      <label className="block">
        <span className="tool-label">Timestamp or date</span>
        <input value={timestamp} onChange={(event) => setTimestamp(event.target.value)} className="tool-input" />
      </label>
    </ToolLayout>
  );
}

function LearningRoadmap() {
  const [track, setTrack] = useState<RoadmapTrack>("frontend");
  const data = roadmapTracks[track];
  const roadmapBlocks = useMemo<OutputBlock[]>(() => {
    const days = Array.from({ length: 30 }, (_, index) => {
      const day = index + 1;
      const week = Math.ceil(day / 7);
      const focus =
        week === 1
          ? "foundation syntax environment and reading examples"
          : week === 2
            ? "small components scripts and API practice"
            : week === 3
              ? "project building debugging and refactor"
              : "ship polish deploy and review";
      return `Day ${day} ${focus}`;
    });

    return [
      { badge: "01", title: `${data.label} goal`, content: data.goal },
      { badge: "02", title: "Stack", content: data.stack.join("\n") },
      { badge: "03", title: "Daily plan", content: days.map((item) => `- ${item}`).join("\n") },
      {
        badge: "04",
        title: "Weekly milestones",
        content: `- Week 1 finish environment setup and 10 small exercises
- Week 2 build 3 practical mini tools
- Week 3 build the final project core flow
- Week 4 polish deploy document and collect feedback`,
      },
      { badge: "05", title: "Final project", content: data.project },
      {
        badge: "06",
        title: "Daily rhythm",
        content: `- 30 minutes learn
- 60 minutes build
- 20 minutes debug notes
- 10 minutes publish a tiny progress log`,
      },
    ];
  }, [data]);
  const output = useMemo(
    () => roadmapBlocks.map((block) => `${block.title}\n${block.content}`).join("\n\n"),
    [roadmapBlocks]
  );

  return (
    <ToolLayout output={output} outputTitle="30 day plan" blocks={roadmapBlocks}>
      <p className="eyebrow">Input</p>
      <h2>Choose direction</h2>
      <div className="tool-choice-grid">
        {Object.entries(roadmapTracks).map(([key, item]) => (
          <button
            key={key}
            type="button"
            onClick={() => setTrack(key as RoadmapTrack)}
            className={track === key ? "tool-choice tool-choice-active" : "tool-choice"}
          >
            <strong>{item.label}</strong>
            <span>{item.goal}</span>
          </button>
        ))}
      </div>
    </ToolLayout>
  );
}
