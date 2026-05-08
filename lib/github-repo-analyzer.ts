export type GitHubRepoInput = {
  url: string;
};

export type GitHubRepoAnalysis = {
  auditEngine: {
    mode: "github-api" | "raw-fallback";
    aiDependency: "none";
    ruleVersion: string;
    checks: string[];
  };
  repository: {
    owner: string;
    name: string;
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

type GitHubRepoMeta = {
  full_name: string;
  html_url: string;
  description: string | null;
  default_branch: string;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  language: string | null;
  license: { spdx_id?: string; name?: string } | null;
  visibility?: string;
  archived: boolean;
  pushed_at: string;
};

type GitHubContentItem = {
  name: string;
  path: string;
  type: "file" | "dir" | string;
  size?: number;
  content?: string;
  encoding?: string;
};

type GitHubTreeItem = {
  path: string;
  type: "blob" | "tree" | string;
  size?: number;
};

type GitHubTreeResponse = {
  tree: GitHubTreeItem[];
  truncated?: boolean;
};

type CachedAnalysis = {
  expiresAt: number;
  value: GitHubRepoAnalysis;
};

type LaunchAuditSummary = Pick<GitHubRepoAnalysis, "launchScore" | "mustFix" | "issueFindings" | "priorityFixes" | "prDescription" | "copyableIssues">;

const REQUEST_TIMEOUT_MS = 5000;
const RAW_FILE_TIMEOUT_MS = 4500;
const ANALYSIS_CACHE_TTL_MS = 10 * 60_000;
const ANALYSIS_CACHE_MAX = 40;
const MAX_FILE_BYTES = 180_000;
const OWNER_REPO_RE = /^[A-Za-z0-9_.-]+$/;
const SENSITIVE_REPO_INPUT_RE =
  /(?:-----BEGIN [A-Z ]*PRIVATE KEY-----|DATABASE_URL\s*=|(?:api[_-]?key|secret|token|password|passwd|pwd)\s*[:=]|(?:ghp|gho|ghu|ghs|ghr|github_pat)_[A-Za-z0-9_]{20,}|sk-[A-Za-z0-9_-]{20,})/i;
const RULE_VERSION = "rules-first-2026-05";
const RULE_CHECKS = [
  "README quick start",
  "environment template",
  "package manager lockfile",
  "CI workflow",
  "build and quality scripts",
  "deployment config and notes",
  "security and risky files",
  "security policy and dependency signals",
  "license signal",
  "release checklist",
];
const analysisCache = new Map<string, CachedAnalysis>();

const candidateFiles = [
  "README.md",
  "README",
  "README.rst",
  "README.txt",
  "LICENSE",
  "LICENSE.md",
  "SECURITY.md",
  "CONTRIBUTING.md",
  "CHANGELOG.md",
  "package.json",
  "pnpm-lock.yaml",
  "yarn.lock",
  "package-lock.json",
  "bun.lockb",
  "bun.lock",
  ".nvmrc",
  ".node-version",
  "turbo.json",
  "tsconfig.json",
  "next.config.ts",
  "next.config.js",
  "next.config.mjs",
  "vite.config.ts",
  "vite.config.js",
  "eslint.config.js",
  "eslint.config.mjs",
  ".eslintrc.json",
  "jest.config.js",
  "jest.config.ts",
  "vitest.config.ts",
  "playwright.config.ts",
  "Dockerfile",
  "docker-compose.yml",
  "docker-compose.yaml",
  "vercel.json",
  "netlify.toml",
  "render.yaml",
  "fly.toml",
  "railway.json",
  "wrangler.toml",
  ".env.example",
  ".env.sample",
  ".env.template",
  "prisma/schema.prisma",
  "pyproject.toml",
  "requirements.txt",
  "go.mod",
  "go.sum",
  "Cargo.toml",
  "Cargo.lock",
  ".github/dependabot.yml",
  ".github/dependabot.yaml",
  ".github/CODEOWNERS",
  ".github/workflows",
];

export class GitHubRepoAnalyzerError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

export function parseGitHubRepoUrl(rawUrl: string) {
  if (typeof rawUrl !== "string" || rawUrl.length > 300) {
    throw new GitHubRepoAnalyzerError("Repository URL is required", 400);
  }

  const trimmed = rawUrl.trim();
  if (SENSITIVE_REPO_INPUT_RE.test(trimmed)) {
    throw new GitHubRepoAnalyzerError("Do not submit API keys passwords private source or internal links. Use only the public repository root URL.", 400);
  }

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    throw new GitHubRepoAnalyzerError("Enter a valid GitHub repository URL", 400);
  }

  const host = parsed.hostname.toLowerCase();
  if (parsed.username || parsed.password || parsed.protocol !== "https:" || host !== "github.com") {
    throw new GitHubRepoAnalyzerError("Only public https://github.com/owner/repo URLs are supported", 400);
  }

  if (parsed.search || parsed.hash) {
    throw new GitHubRepoAnalyzerError("Use the repository root URL without query strings or fragments", 400);
  }

  const parts = parsed.pathname.split("/").filter(Boolean);
  const [owner, rawRepo] = parts;
  const repo = rawRepo?.replace(/\.git$/i, "");
  if (parts.length !== 2 || !owner || !repo || !OWNER_REPO_RE.test(owner) || !OWNER_REPO_RE.test(repo)) {
    throw new GitHubRepoAnalyzerError("URL must look like https://github.com/owner/repo", 400);
  }

  return { owner, repo };
}

function githubApiUrl(path: string) {
  return `https://api.github.com${path}`;
}

function rawGitHubUrl(owner: string, repo: string, branch: string, path: string) {
  const encodedPath = path.split("/").map(encodeURIComponent).join("/");
  return `https://raw.githubusercontent.com/${owner}/${repo}/${encodeURIComponent(branch)}/${encodedPath}`;
}

function githubHeaders() {
  const token = process.env.GITHUB_READ_TOKEN || "";
  return {
    Accept: "application/vnd.github+json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    "User-Agent": "JinMingLab-Repo-Analyzer",
    "X-GitHub-Api-Version": "2022-11-28",
  };
}

async function fetchGitHubJson<T>(path: string): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const response = await fetch(githubApiUrl(path), {
      headers: githubHeaders(),
      signal: controller.signal,
    });

    if (response.status === 404) throw new GitHubRepoAnalyzerError("Repository or file not found", 404);
    if (response.status === 403 || response.status === 429) {
      throw new GitHubRepoAnalyzerError("GitHub public API rate limit reached. Try again later.", 429);
    }
    if (!response.ok) throw new GitHubRepoAnalyzerError(`GitHub API returned ${response.status}`, 502);

    return (await response.json()) as T;
  } catch (error) {
    if (error instanceof GitHubRepoAnalyzerError) throw error;
    if (error instanceof Error && error.name === "AbortError") {
      throw new GitHubRepoAnalyzerError("GitHub request timed out", 504);
    }
    throw new GitHubRepoAnalyzerError("Could not reach GitHub", 502);
  } finally {
    clearTimeout(timeout);
  }
}

async function readRepoFile(owner: string, repo: string, path: string, branch: string) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), RAW_FILE_TIMEOUT_MS);
    try {
      const response = await fetch(rawGitHubUrl(owner, repo, branch, path), {
        headers: { Accept: "text/plain", "User-Agent": "JinMingLab-Repo-Analyzer" },
        signal: controller.signal,
      });
      if (!response.ok) return null;
      return (await response.text()).slice(0, MAX_FILE_BYTES);
    } finally {
      clearTimeout(timeout);
    }
  } catch {
    return null;
  }
}

function readWorkflowNames(tree: GitHubTreeItem[]) {
  return tree
    .filter((item) => item.type === "blob" && item.path.startsWith(".github/workflows/"))
    .map((item) => item.path.split("/").pop())
    .filter((name): name is string => Boolean(name))
    .slice(0, 8);
}

function rootStructureFromTree(tree: GitHubTreeItem[]) {
  const rootItems: GitHubContentItem[] = tree
    .filter((item) => !item.path.includes("/"))
    .map((item) => ({
      name: item.path,
      path: item.path,
      type: item.type === "tree" ? "dir" : "file",
      size: item.size,
    }));
  return rootStructure(rootItems);
}

function fallbackFileStructure(files: Map<string, string | null>) {
  const entries = new Set<string>();
  for (const path of files.keys()) {
    const [root] = path.split("/");
    entries.add(path.includes("/") ? `dir ${root}` : `file ${path}`);
  }
  return Array.from(entries).slice(0, 32);
}

function cacheKey(owner: string, repo: string) {
  return `${owner.toLowerCase()}/${repo.toLowerCase()}`;
}

function getCachedAnalysis(key: string) {
  const cached = analysisCache.get(key);
  if (!cached) return null;
  if (cached.expiresAt <= Date.now()) {
    analysisCache.delete(key);
    return null;
  }
  return cached.value;
}

function setCachedAnalysis(key: string, value: GitHubRepoAnalysis) {
  if (analysisCache.size >= ANALYSIS_CACHE_MAX) {
    const oldestKey = analysisCache.keys().next().value;
    if (oldestKey) analysisCache.delete(oldestKey);
  }
  analysisCache.set(key, { expiresAt: Date.now() + ANALYSIS_CACHE_TTL_MS, value });
}

function parsePackageJson(raw: string | null) {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as {
      scripts?: Record<string, string>;
      dependencies?: Record<string, string>;
      devDependencies?: Record<string, string>;
      packageManager?: string;
      engines?: Record<string, string>;
    };
  } catch {
    return null;
  }
}

function detectPackageManager(files: Map<string, string | null>, packageJson: ReturnType<typeof parsePackageJson>) {
  if (packageJson?.packageManager?.startsWith("pnpm")) return "pnpm";
  if (packageJson?.packageManager?.startsWith("yarn")) return "yarn";
  if (packageJson?.packageManager?.startsWith("bun")) return "bun";
  if (files.has("pnpm-lock.yaml")) return "pnpm";
  if (files.has("yarn.lock")) return "yarn";
  if (files.has("bun.lockb") || files.has("bun.lock")) return "bun";
  if (files.has("package-lock.json")) return "npm-ci";
  return "npm";
}

function hasAnyFile(files: Map<string, string | null>, paths: string[]) {
  return paths.some((path) => files.has(path));
}

function hasLockfile(files: Map<string, string | null>) {
  return hasAnyFile(files, ["pnpm-lock.yaml", "yarn.lock", "package-lock.json", "bun.lockb", "bun.lock", "go.sum", "Cargo.lock"]);
}

function envExamplePath(files: Map<string, string | null>) {
  return [".env.example", ".env.sample", ".env.template"].find((path) => files.has(path));
}

function deploymentTargets(files: Map<string, string | null>, readme: string | null) {
  const text = readme?.toLowerCase() ?? "";
  const targets: string[] = [];
  if (files.has("vercel.json") || /vercel/.test(text)) targets.push("Vercel");
  if (files.has("netlify.toml") || /netlify/.test(text)) targets.push("Netlify");
  if (files.has("render.yaml") || /render\.com|render deploy/.test(text)) targets.push("Render");
  if (files.has("fly.toml") || /fly\.io/.test(text)) targets.push("Fly.io");
  if (files.has("railway.json") || /railway/.test(text)) targets.push("Railway");
  if (files.has("wrangler.toml") || /cloudflare|workers/.test(text)) targets.push("Cloudflare");
  if (files.has("Dockerfile") || files.has("docker-compose.yml") || files.has("docker-compose.yaml") || /docker/.test(text)) targets.push("Docker");
  if (/deploy|production|rollback/.test(text)) targets.push("README deploy notes");
  return Array.from(new Set(targets));
}

function qualityScriptCount(packageJson: ReturnType<typeof parsePackageJson>) {
  const scripts = packageJson?.scripts ?? {};
  return ["lint", "test", "typecheck", "check", "build", "format"].filter((script) => Boolean(scripts[script])).length;
}

function dependencyNames(packageJson: ReturnType<typeof parsePackageJson>) {
  return new Set([
    ...Object.keys(packageJson?.dependencies ?? {}),
    ...Object.keys(packageJson?.devDependencies ?? {}),
  ]);
}

function detectStack(files: Map<string, string | null>, packageJson: ReturnType<typeof parsePackageJson>, repoLanguage: string | null) {
  const deps = dependencyNames(packageJson);
  const stack = new Set<string>();
  if (repoLanguage) stack.add(repoLanguage);
  if (packageJson) stack.add("Node.js");
  if (files.has("tsconfig.json") || deps.has("typescript")) stack.add("TypeScript");
  if (deps.has("next")) stack.add("Next.js");
  if (deps.has("react")) stack.add("React");
  if (deps.has("vue")) stack.add("Vue");
  if (deps.has("vite")) stack.add("Vite");
  if (deps.has("tailwindcss")) stack.add("Tailwind CSS");
  if (deps.has("@prisma/client") || files.has("prisma/schema.prisma")) stack.add("Prisma");
  if (files.has("Dockerfile") || files.has("docker-compose.yml") || files.has("docker-compose.yaml")) stack.add("Docker");
  if (files.has("vercel.json")) stack.add("Vercel");
  if (files.has("netlify.toml")) stack.add("Netlify");
  if (files.has("wrangler.toml")) stack.add("Cloudflare Workers");
  if (files.has("pyproject.toml") || files.has("requirements.txt")) stack.add("Python");
  if (files.has("go.mod")) stack.add("Go");
  if (files.has("Cargo.toml")) stack.add("Rust");
  return Array.from(stack).slice(0, 14);
}

function runCommands(packageManager: string, packageJson: ReturnType<typeof parsePackageJson>) {
  if (!packageJson) return ["No package.json found. Read README before choosing install or run commands."];
  const scripts = packageJson.scripts ?? {};
  const install = packageManager === "yarn" ? "yarn install" : packageManager === "pnpm" ? "pnpm install" : packageManager === "bun" ? "bun install" : packageManager === "npm-ci" ? "npm ci" : "npm install";
  const run = (script: string) => {
    if (packageManager === "yarn") return `yarn ${script}`;
    if (packageManager === "pnpm") return `pnpm ${script}`;
    if (packageManager === "bun") return `bun run ${script}`;
    return `npm run ${script}`;
  };
  const commands = [install];
  for (const script of ["dev", "start", "build", "test", "lint", "typecheck", "check"]) {
    if (scripts[script]) commands.push(run(script));
  }
  if (commands.length === 1) commands.push("No common scripts found. Inspect package.json scripts before running.");
  return commands;
}

function rootStructure(rootItems: GitHubContentItem[]) {
  return rootItems
    .slice()
    .sort((a, b) => (a.type === b.type ? a.name.localeCompare(b.name) : a.type === "dir" ? -1 : 1))
    .slice(0, 32)
    .map((item) => `${item.type === "dir" ? "dir " : "file"} ${item.path}`);
}

function readmeQuality(readme: string | null, files: Map<string, string | null>) {
  const notes: string[] = [];
  const text = readme?.toLowerCase() ?? "";
  if (!readme) notes.push("Add a README with project purpose setup commands environment variables and screenshots.");
  if (readme && !/install|setup|getting started|quick start/.test(text)) notes.push("Add a clear setup section with install and run commands.");
  if (readme && !/env|environment|\.env/.test(text) && envExamplePath(files)) notes.push("Mention required environment variables and link to the env template.");
  if (readme && !/deploy|vercel|docker|production/.test(text)) notes.push("Add deployment notes for the target platform.");
  if (readme && !/test|lint|quality/.test(text)) notes.push("Add quality commands such as test lint typecheck or build.");
  if (readme && !/screenshot|demo|preview|example/.test(text)) notes.push("Add a short demo screenshot or example output so visitors understand the product quickly.");
  if (readme && !files.has("CONTRIBUTING.md") && !/contribut/.test(text)) notes.push("Add contribution guidance or a short maintainer handoff section.");
  if (notes.length === 0) notes.push("README covers the core setup signals. Keep it current with scripts and env changes.");
  return notes;
}

function securityNotes(meta: GitHubRepoMeta, files: Map<string, string | null>, packageJson: ReturnType<typeof parsePackageJson>, workflows: string[]) {
  const notes: string[] = [];
  const scripts = packageJson?.scripts ?? {};
  if (meta.archived) notes.push("Repository is archived. Treat dependencies and setup guidance as potentially stale.");
  if (!envExamplePath(files)) notes.push("No env template found. Add a sanitized env template before onboarding contributors.");
  if (!scripts.test && !scripts.lint) notes.push("No test or lint script detected. Add at least one automated quality gate.");
  if (workflows.length === 0) notes.push("No GitHub Actions workflow detected. Add CI for install build lint and tests.");
  if (!meta.license) notes.push("No license detected. Clarify usage rights before reuse.");
  if (!files.has("SECURITY.md")) notes.push("No SECURITY.md detected. Add a short vulnerability reporting path before public launch.");
  if (!hasAnyFile(files, [".github/dependabot.yml", ".github/dependabot.yaml"])) notes.push("No Dependabot config detected. Consider dependency update automation for public repos.");
  if (files.has("Dockerfile")) notes.push("Dockerfile exists. Review base image pinning non root user and copied secrets.");
  if (files.has("package.json")) notes.push("Run dependency audit before release and pin production critical packages.");
  return notes.slice(0, 8);
}

function githubActionsSuggestions(packageJson: ReturnType<typeof parsePackageJson>, workflows: string[]) {
  const scripts = packageJson?.scripts ?? {};
  const suggestions = workflows.length ? [`Existing workflows found: ${workflows.join(", ")}`] : ["Add .github/workflows/ci.yml for pull requests."];
  if (scripts.lint) suggestions.push("Run lint in CI.");
  if (scripts.test) suggestions.push("Run tests in CI.");
  if (scripts.build) suggestions.push("Run build in CI before deploy.");
  suggestions.push("Add secret scanning and dependency review in repository security settings.");
  return suggestions;
}

function environmentChecklist(files: Map<string, string | null>) {
  const envPath = envExamplePath(files);
  const envExample = envPath ? files.get(envPath) : null;
  if (!envExample) {
    return [
      "Add .env.example or .env.sample before accepting outside contributors.",
      "List required keys optional keys and production-only keys separately.",
      "Keep real secrets only in the hosting provider or local untracked files.",
    ];
  }

  const keys = Array.from(envExample.matchAll(/^([A-Z0-9_]+)=/gm)).map((match) => match[1]);
  const suspiciousValues = envExample
    .split(/\r?\n/)
    .filter((line) => /^[A-Z0-9_]+=.+/.test(line))
    .filter((line) => {
      const value = line.split("=").slice(1).join("=").trim().replace(/^["']|["']$/g, "");
      return value.length > 12 && !/^(changeme|change-me|example|placeholder|your_|<|xxx|todo|null|false|true|0)$/i.test(value);
    })
    .slice(0, 5);
  if (keys.length === 0) {
    return [
      `${envPath} exists but no uppercase KEY= entries were detected.`,
      "Rewrite it as copyable placeholders without real values.",
    ];
  }

  return [
    `Detected env template keys: ${keys.slice(0, 12).join(", ")}${keys.length > 12 ? "..." : ""}`,
    "Mark which keys are required for local dev, preview, and production.",
    suspiciousValues.length
      ? `Review suspicious non-placeholder env values: ${suspiciousValues.map((line) => line.split("=")[0]).join(", ")}`
      : "Template values look placeholder-like from the sampled lines.",
  ];
}

function scorecardItem(label: string, score: number, note: string) {
  return {
    label,
    score,
    status: score >= 80 ? "pass" as const : score >= 45 ? "review" as const : "missing" as const,
    note,
  };
}

function launchScorecard({
  files,
  meta,
  packageJson,
  workflows,
  readme,
  riskyFiles,
}: {
  files: Map<string, string | null>;
  meta: GitHubRepoMeta;
  packageJson: ReturnType<typeof parsePackageJson>;
  workflows: string[];
  readme: string | null;
  riskyFiles: string[];
}) {
  const scripts = packageJson?.scripts ?? {};
  const readmeText = readme?.toLowerCase() ?? "";
  const targets = deploymentTargets(files, readme);
  const readmeSignals = [
    Boolean(readme),
    /install|setup|getting started|quick start/.test(readmeText),
    /deploy|vercel|docker|production/.test(readmeText),
    /test|lint|quality|build/.test(readmeText),
  ].filter(Boolean).length;
  const envPath = envExamplePath(files);
  const envSignals = [Boolean(envPath), Boolean(envPath && files.get(envPath)?.match(/^([A-Z0-9_]+)=/gm))].filter(Boolean).length;
  const ciSignals = [workflows.length > 0, qualityScriptCount(packageJson) >= 2, Boolean(scripts.build), hasLockfile(files)].filter(Boolean).length;
  const deploySignals = [
    Boolean(scripts.build),
    Boolean(scripts.start || scripts.dev),
    targets.length > 0,
  ].filter(Boolean).length;
  const securitySignals = [
    riskyFiles.length === 0,
    Boolean(envPath),
    workflows.length > 0,
    Boolean(scripts.lint || scripts.test),
    Boolean(meta.license),
    files.has("SECURITY.md") || hasAnyFile(files, [".github/dependabot.yml", ".github/dependabot.yaml"]),
  ].filter(Boolean).length;

  return [
    scorecardItem(
      "README",
      Math.round((readmeSignals / 4) * 100),
      readme ? "Purpose and onboarding signals were checked." : "README is missing."
    ),
    scorecardItem(
      "Environment",
      Math.round((envSignals / 2) * 100),
      envPath ? `${envPath} exists. Required and production-only keys still need review.` : "Add a sanitized .env.example."
    ),
    scorecardItem(
      "CI",
      Math.round((ciSignals / 4) * 100),
      workflows.length ? "Workflow signal found. Confirm build lint tests and lockfile install run on PRs." : "No GitHub Actions workflow found."
    ),
    scorecardItem(
      "Deploy",
      Math.round((deploySignals / 3) * 100),
      targets.length ? `Deployment signal: ${targets.slice(0, 3).join(", ")}.` : "Checks build/start commands and deployment notes."
    ),
    scorecardItem(
      "Security",
      Math.round((securitySignals / 6) * 100),
      riskyFiles.length ? `Risky public files detected: ${riskyFiles.join(", ")}.` : "No obvious secret or local database files detected in public tree."
    ),
  ];
}

function issueLabelPlan(stack: string[], workflows: string[]) {
  const labels = [
    "good first issue",
    "docs",
    "bug",
    "security",
    "release-blocker",
    "needs reproduction",
    "launch-readiness",
  ];
  if (stack.some((item) => /next|react|vue|vite|frontend/i.test(item))) labels.push("frontend");
  if (stack.some((item) => /node|go|rust|python|backend|prisma/i.test(item))) labels.push("backend");
  if (workflows.length) labels.push("ci");
  return labels.map((label) => `Create label: ${label}`);
}

function riskyPublicFiles(tree: GitHubTreeItem[]) {
  return tree
    .filter((item) => item.type === "blob")
    .map((item) => item.path)
    .filter((path) =>
      /(^|\/)(\.env|\.env\.local|\.env\.production|dev\.db|database\.sqlite|\.DS_Store|id_rsa|.*\.pem|.*\.key)$/i.test(path)
    )
    .slice(0, 12);
}

function findingEvidence(item: string, files: Map<string, string | null>, workflows: string[], riskyFiles: string[]) {
  if (/archived/i.test(item)) return { source: "GitHub repository metadata", evidence: "Repository archived flag is enabled." };
  if (/sensitive|temporary files/i.test(item)) return { source: "GitHub repository tree", evidence: riskyFiles.join(", ") };
  if (/README/i.test(item)) return { source: files.has("README.md") || files.has("README") ? "README" : "Repository root", evidence: files.has("README.md") || files.has("README") ? "README exists but lacks this launch signal." : "No README file was read from the root." };
  if (/\.env|environment|env/i.test(item)) {
    const path = envExamplePath(files);
    return { source: path || ".env.example", evidence: path ? `${path} exists and needs clearer production/local key guidance.` : "No env template file was read from the root." };
  }
  if (/lockfile|repeatable/i.test(item)) return { source: "package manager lockfile", evidence: hasLockfile(files) ? "A lockfile was detected." : "No npm pnpm yarn bun go or cargo lockfile was read." };
  if (/build script/i.test(item)) return { source: "package.json", evidence: "package.json scripts.build was not detected." };
  if (/test|lint|quality|typecheck|format/i.test(item)) return { source: "package.json", evidence: "package.json quality scripts are incomplete." };
  if (/GitHub Actions|workflow|CI/i.test(item)) return { source: ".github/workflows", evidence: workflows.length ? `Detected workflows: ${workflows.join(", ")}` : "No workflow files were detected." };
  if (/license/i.test(item)) return { source: "GitHub repository metadata", evidence: "GitHub API did not return a license signal." };
  if (/SECURITY|vulnerability/i.test(item)) return { source: "SECURITY.md", evidence: files.has("SECURITY.md") ? "SECURITY.md exists." : "SECURITY.md was not read from the root." };
  if (/changelog|release notes/i.test(item)) return { source: "CHANGELOG.md or README", evidence: files.has("CHANGELOG.md") ? "CHANGELOG.md exists." : "No changelog or release notes signal was read." };
  if (/deploy|rollback|production/i.test(item)) return { source: "README and deployment files", evidence: "Deployment or rollback wording was not detected in the files read." };
  return { source: "Repository files read", evidence: "Derived from public repository metadata and root configuration files." };
}

function launchAuditSummary({
  meta,
  files,
  packageJson,
  workflows,
  readme,
  riskyFiles,
}: {
  meta: GitHubRepoMeta;
  files: Map<string, string | null>;
  packageJson: ReturnType<typeof parsePackageJson>;
  workflows: string[];
  readme: string | null;
  riskyFiles: string[];
}): LaunchAuditSummary {
  const scripts = packageJson?.scripts ?? {};
  const blockers: string[] = [];
  const warnings: string[] = [];
  const envPath = envExamplePath(files);
  const targets = deploymentTargets(files, readme);

  if (meta.archived) blockers.push("Repository is archived. Do not launch from it without a maintenance decision.");
  if (riskyFiles.length) blockers.push(`Remove public sensitive or temporary files: ${riskyFiles.join(", ")}.`);
  if (!readme) blockers.push("Add a README before launch so visitors understand purpose setup and status.");
  if (!envPath) blockers.push("Add a sanitized .env.example with required production and local variables.");

  if (readme && !/install|setup|getting started|quick start/i.test(readme)) warnings.push("README needs a clear setup or quick start section.");
  if (readme && targets.length === 0) warnings.push("README needs deployment target and rollback notes.");
  if (packageJson && !hasLockfile(files)) warnings.push("No package lockfile detected. Commit a lockfile so clean installs are repeatable.");
  if (!scripts.build) warnings.push("No build script detected. Add or document the production build command.");
  if (qualityScriptCount(packageJson) < 2) warnings.push("Quality gates are thin. Add at least two of lint test typecheck build or format.");
  if (workflows.length === 0) warnings.push("No GitHub Actions workflow detected. Add CI for install build lint and tests.");
  if (!meta.license) warnings.push("No license detected. Clarify usage rights before public release.");
  if (!files.has("SECURITY.md")) warnings.push("No SECURITY.md detected. Add a short vulnerability reporting path.");
  if (!files.has("CHANGELOG.md") && readme && !/changelog|release note/i.test(readme)) warnings.push("No changelog or release notes signal detected.");

  const score = Math.max(0, Math.min(100, 100 - blockers.length * 18 - warnings.length * 7));
  const riskLevel: GitHubRepoAnalysis["launchScore"]["riskLevel"] =
    score >= 82 ? "Low" : score >= 58 ? "Medium" : "High";
  const summary =
    riskLevel === "Low"
      ? "Looks close to public launch. Fix small documentation and verification gaps before announcing."
      : riskLevel === "Medium"
        ? "Usable for staging, but public launch needs the listed blockers and quality signals fixed first."
        : "Not ready for public launch. Resolve the blockers before sharing broadly.";

  const mustFix = [
    ...blockers,
    ...warnings.slice(0, Math.max(0, 6 - blockers.length)),
  ];
  const issueFindings: GitHubRepoAnalysis["issueFindings"] = mustFix.map((item, index) => {
    const evidence = findingEvidence(item, files, workflows, riskyFiles);
    return {
      title: item.replace(/\.$/, ""),
      severity: blockers.includes(item) ? "P0" as const : index < 2 ? "P1" as const : "P2" as const,
      ...evidence,
    };
  });
  const priorityFixes = {
    today: blockers.length ? blockers : warnings.slice(0, 1),
    beforeLaunch: blockers.length ? warnings.slice(0, 3) : warnings.slice(1, 4),
    later: warnings.slice(blockers.length ? 3 : 4),
  };

  const copyableIssues = mustFix.slice(0, 5).map((item, index) => {
    const title = item.replace(/\.$/, "");
    const priority = blockers.includes(item) ? "P0 release blocker" : index < 2 ? "P1 launch readiness" : "P2 polish";
    const labels = blockers.includes(item)
      ? "release-blocker, launch, security"
      : /readme|setup|deploy/i.test(item)
        ? "docs, launch"
        : /test|lint|ci|workflow/i.test(item)
          ? "ci, quality, launch"
          : "launch, cleanup";

    return `## ${title}

Priority: ${priority}
Labels: ${labels}
Evidence: ${findingEvidence(item, files, workflows, riskyFiles).source} — ${findingEvidence(item, files, workflows, riskyFiles).evidence}

### Why this matters
${item}

### Suggested fix
- Update the repository files that create this launch risk
- Document the expected local or production behavior
- Keep secrets and machine-specific files out of public source control

### Done when
- [ ] The launch risk is no longer present in the public repository
- [ ] README, CI, or deployment docs explain how to verify the fix
- [ ] A maintainer can confirm it from a clean checkout

### Verification
\`\`\`bash
npm run lint
npm run build
\`\`\``;
  });

  const visibleMustFix = mustFix.length ? mustFix : ["No launch blockers detected from the public files read."];
  const prDescription = `## Launch readiness audit

Score: ${score}/100
Risk: ${riskLevel}

### Today
${priorityFixes.today.length ? priorityFixes.today.map((item) => `- [ ] ${item}`).join("\n") : "- [x] No same-day blocker detected"}

### Before public launch
${priorityFixes.beforeLaunch.length ? priorityFixes.beforeLaunch.map((item) => `- [ ] ${item}`).join("\n") : "- [x] No required pre-launch item detected"}

### Later polish
${priorityFixes.later.length ? priorityFixes.later.map((item) => `- [ ] ${item}`).join("\n") : "- [ ] Keep README, CI, env docs, and release notes current"}

### Verification
\`\`\`bash
npm run lint
npm run build
\`\`\``;

  return {
    launchScore: { score, riskLevel, summary },
    mustFix: visibleMustFix,
    issueFindings: issueFindings.length ? issueFindings : [{
      title: "No launch blockers detected from the public files read",
      severity: "P2",
      source: "Repository files read",
      evidence: "README, package metadata, env template, workflow, deployment, and risky file checks did not produce a blocker.",
    }],
    priorityFixes,
    prDescription,
    copyableIssues: copyableIssues.length ? copyableIssues : ["No blocking issue template needed from this audit."],
  };
}

function buildAnalysis({
  owner,
  repo,
  meta,
  files,
  workflows,
  fileStructure,
  mode,
  riskyFiles = [],
  extraOverview = [],
}: {
  owner: string;
  repo: string;
  meta: GitHubRepoMeta;
  files: Map<string, string | null>;
  workflows: string[];
  fileStructure: string[];
  mode: GitHubRepoAnalysis["auditEngine"]["mode"];
  riskyFiles?: string[];
  extraOverview?: string[];
}): GitHubRepoAnalysis {
  const readme = files.get("README.md") ?? files.get("README") ?? null;
  const packageJson = parsePackageJson(files.get("package.json") ?? null);
  const packageManager = detectPackageManager(files, packageJson);
  const stack = detectStack(files, packageJson, meta.language);
  const commands = runCommands(packageManager, packageJson);
  const audit = launchAuditSummary({ meta, files, packageJson, workflows, readme, riskyFiles });
  const scorecard = launchScorecard({ files, meta, packageJson, workflows, readme, riskyFiles });
  const targets = deploymentTargets(files, readme);
  const releaseChecklist = [
    "Fix every item in Must fix before public launch.",
    `Run clean verification: ${commands.slice(0, 5).join(" && ")}.`,
    "Confirm production env variables are set in the hosting platform and absent from Git.",
    targets.length ? `Confirm deployment target settings for ${targets.slice(0, 4).join(", ")}.` : "Document the deployment target and start command before public launch.",
    "Check robots sitemap metadata privacy terms and status pages.",
    "Deploy to staging and click the main user paths on desktop and mobile.",
    "Prepare rollback steps owner contact and health check URL.",
  ];

  return {
    auditEngine: {
      mode,
      aiDependency: "none",
      ruleVersion: RULE_VERSION,
      checks: RULE_CHECKS,
    },
    repository: {
      owner,
      name: repo,
      fullName: meta.full_name,
      url: meta.html_url,
      description: meta.description ?? "No repository description",
      defaultBranch: meta.default_branch,
      stars: meta.stargazers_count,
      forks: meta.forks_count,
      openIssues: meta.open_issues_count,
      language: meta.language ?? "Unknown",
      license: meta.license?.spdx_id || meta.license?.name || "Not detected",
      visibility: meta.visibility ?? "public",
      archived: meta.archived,
      pushedAt: meta.pushed_at,
    },
    launchScore: audit.launchScore,
    scorecard,
    mustFix: audit.mustFix,
    issueFindings: audit.issueFindings,
    priorityFixes: audit.priorityFixes,
    prDescription: audit.prDescription,
    copyableIssues: audit.copyableIssues,
    overview: [
      ...extraOverview,
      `Audit engine: deterministic ${RULE_VERSION}. AI dependency: none.`,
      meta.description ?? "No description was provided by the repository.",
      `Primary language signal: ${meta.language ?? "unknown"}.`,
      `Default branch: ${meta.default_branch}. Recent push: ${meta.pushed_at}.`,
      `Stars ${meta.stargazers_count}, forks ${meta.forks_count}, open issues ${meta.open_issues_count}.`,
    ],
    howToRun: commands,
    techStack: stack.length ? stack : ["No obvious stack detected from root files."],
    fileStructure,
    securityNotes: securityNotes(meta, files, packageJson, workflows),
    readmeSuggestions: readmeQuality(readme, files),
    githubActions: githubActionsSuggestions(packageJson, workflows),
    envChecklist: environmentChecklist(files),
    issueLabelPlan: issueLabelPlan(stack, workflows),
    deploymentChecklist: [
      "Confirm required environment variables are documented and set in the deployment platform.",
      `Run clean verification: ${commands.slice(0, 5).join(" && ")}.`,
      "Check production secrets are not committed and have least privilege.",
      targets.length ? `Confirm ${targets.slice(0, 4).join(", ")} settings match the repository scripts.` : "Document the hosting target, framework output, and start command.",
      "Add rollback notes and health check URLs before public launch.",
    ],
    prReviewChecklist: [
      "Does the PR explain the user visible change and risk area?",
      "Are setup scripts env variables and docs still accurate?",
      "Do changed files include tests or a clear manual verification note?",
      "Are security sensitive files auth routes API handlers and config reviewed carefully?",
      "Does CI pass before merge?",
    ],
    releaseChecklist,
    filesRead: Array.from(files.keys()).concat(workflows.length ? [".github/workflows"] : []),
  };
}

async function analyzeWithGitHubApi(owner: string, repo: string) {
  const meta = await fetchGitHubJson<GitHubRepoMeta>(
    `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`
  );
  const treeResponse = await fetchGitHubJson<GitHubTreeResponse>(
    `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/git/trees/${encodeURIComponent(meta.default_branch)}?recursive=1`
  );
  const tree = Array.isArray(treeResponse.tree) ? treeResponse.tree : [];
  const availableFiles = new Map(
    tree.filter((item) => item.type === "blob" && (item.size ?? 0) <= MAX_FILE_BYTES).map((item) => [item.path, item])
  );

  const files = new Map<string, string | null>();
  await Promise.all(
    candidateFiles.map(async (path) => {
      if (path === ".github/workflows") return;
      if (!availableFiles.has(path)) return;
      const content = await readRepoFile(owner, repo, path, meta.default_branch);
      if (content !== null) files.set(path, content);
    })
  );

  return buildAnalysis({
    owner,
    repo,
    meta,
    files,
    workflows: readWorkflowNames(tree),
    fileStructure: rootStructureFromTree(tree),
    mode: "github-api",
    riskyFiles: riskyPublicFiles(tree),
  });
}

async function analyzeWithRawFallback(owner: string, repo: string) {
  const files = new Map<string, string | null>();
  await Promise.all(
    candidateFiles.map(async (path) => {
      if (path === ".github/workflows") return;
      const content = await readRepoFile(owner, repo, path, "HEAD");
      if (content !== null) files.set(path, content);
    })
  );

  const meta: GitHubRepoMeta = {
    full_name: `${owner}/${repo}`,
    html_url: `https://github.com/${owner}/${repo}`,
    description: "Public repository launch audit generated from raw public files.",
    default_branch: "HEAD",
    stargazers_count: 0,
    forks_count: 0,
    open_issues_count: 0,
    language: null,
    license: null,
    visibility: "public",
    archived: false,
    pushed_at: "unknown",
  };

  return buildAnalysis({
    owner,
    repo,
    meta,
    files,
    workflows: [],
    fileStructure: fallbackFileStructure(files),
    mode: "raw-fallback",
    extraOverview: [
      "Fast fallback mode: GitHub API metadata was unavailable, so this audit was built from public raw files only.",
    ],
  });
}

function canUseRawFallback(error: GitHubRepoAnalyzerError) {
  return error.status === 429 || error.status === 502 || error.status === 504;
}

export async function analyzeGitHubRepository(input: GitHubRepoInput): Promise<GitHubRepoAnalysis> {
  const { owner, repo } = parseGitHubRepoUrl(input.url);
  const key = cacheKey(owner, repo);
  const cached = getCachedAnalysis(key);
  if (cached) return cached;

  let analysis: GitHubRepoAnalysis;
  try {
    analysis = await analyzeWithGitHubApi(owner, repo);
  } catch (error) {
    if (!(error instanceof GitHubRepoAnalyzerError) || !canUseRawFallback(error)) throw error;
    analysis = await analyzeWithRawFallback(owner, repo);
  }

  setCachedAnalysis(key, analysis);
  return analysis;
}
