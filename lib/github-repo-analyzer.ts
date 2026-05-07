export type GitHubRepoInput = {
  url: string;
};

export type GitHubRepoAnalysis = {
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

const REQUEST_TIMEOUT_MS = 5000;
const RAW_FILE_TIMEOUT_MS = 4500;
const ANALYSIS_CACHE_TTL_MS = 10 * 60_000;
const ANALYSIS_CACHE_MAX = 40;
const MAX_FILE_BYTES = 180_000;
const OWNER_REPO_RE = /^[A-Za-z0-9_.-]+$/;
const analysisCache = new Map<string, CachedAnalysis>();

const candidateFiles = [
  "README.md",
  "README",
  "package.json",
  "pnpm-lock.yaml",
  "yarn.lock",
  "package-lock.json",
  "bun.lockb",
  "tsconfig.json",
  "next.config.ts",
  "next.config.js",
  "vite.config.ts",
  "vite.config.js",
  "Dockerfile",
  "docker-compose.yml",
  ".env.example",
  "prisma/schema.prisma",
  "pyproject.toml",
  "requirements.txt",
  "go.mod",
  "Cargo.toml",
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

  let parsed: URL;
  try {
    parsed = new URL(rawUrl.trim());
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
  if (files.has("bun.lockb")) return "bun";
  if (files.has("package-lock.json")) return "npm-ci";
  return "npm";
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
  if (files.has("Dockerfile") || files.has("docker-compose.yml")) stack.add("Docker");
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
  for (const script of ["dev", "start", "build", "test", "lint"]) {
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
  if (readme && !/env|environment|\.env/.test(text) && files.has(".env.example")) notes.push("Mention required environment variables and link to .env.example.");
  if (readme && !/deploy|vercel|docker|production/.test(text)) notes.push("Add deployment notes for the target platform.");
  if (readme && !/test|lint|quality/.test(text)) notes.push("Add quality commands such as test lint typecheck or build.");
  if (notes.length === 0) notes.push("README covers the core setup signals. Keep it current with scripts and env changes.");
  return notes;
}

function securityNotes(meta: GitHubRepoMeta, files: Map<string, string | null>, packageJson: ReturnType<typeof parsePackageJson>, workflows: string[]) {
  const notes: string[] = [];
  const scripts = packageJson?.scripts ?? {};
  if (meta.archived) notes.push("Repository is archived. Treat dependencies and setup guidance as potentially stale.");
  if (!files.has(".env.example")) notes.push("No .env.example found. Add a sanitized env template before onboarding contributors.");
  if (!scripts.test && !scripts.lint) notes.push("No test or lint script detected. Add at least one automated quality gate.");
  if (workflows.length === 0) notes.push("No GitHub Actions workflow detected. Add CI for install build lint and tests.");
  if (!meta.license) notes.push("No license detected. Clarify usage rights before reuse.");
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
  const envExample = files.get(".env.example");
  if (!envExample) {
    return [
      "Add .env.example before accepting outside contributors.",
      "List required keys optional keys and production-only keys separately.",
      "Keep real secrets only in the hosting provider or local untracked files.",
    ];
  }

  const keys = Array.from(envExample.matchAll(/^([A-Z0-9_]+)=/gm)).map((match) => match[1]);
  if (keys.length === 0) {
    return [
      ".env.example exists but no uppercase KEY= entries were detected.",
      "Rewrite it as copyable placeholders without real values.",
    ];
  }

  return [
    `Detected env template keys: ${keys.slice(0, 12).join(", ")}${keys.length > 12 ? "..." : ""}`,
    "Mark which keys are required for local dev, preview, and production.",
    "Confirm no template value is a real token password or private URL.",
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
  packageJson,
  workflows,
  readme,
  riskyFiles,
}: {
  files: Map<string, string | null>;
  packageJson: ReturnType<typeof parsePackageJson>;
  workflows: string[];
  readme: string | null;
  riskyFiles: string[];
}) {
  const scripts = packageJson?.scripts ?? {};
  const readmeText = readme?.toLowerCase() ?? "";
  const readmeSignals = [
    Boolean(readme),
    /install|setup|getting started|quick start/.test(readmeText),
    /deploy|vercel|docker|production/.test(readmeText),
    /test|lint|quality|build/.test(readmeText),
  ].filter(Boolean).length;
  const envSignals = [files.has(".env.example"), Boolean(files.get(".env.example")?.match(/^([A-Z0-9_]+)=/gm))].filter(Boolean).length;
  const ciSignals = [workflows.length > 0, Boolean(scripts.lint), Boolean(scripts.test), Boolean(scripts.build)].filter(Boolean).length;
  const deploySignals = [
    Boolean(scripts.build),
    Boolean(scripts.start || scripts.dev),
    files.has("Dockerfile") || files.has("docker-compose.yml") || /deploy|vercel|docker|production/.test(readmeText),
  ].filter(Boolean).length;
  const securitySignals = [
    riskyFiles.length === 0,
    files.has(".env.example"),
    workflows.length > 0,
    Boolean(scripts.lint || scripts.test),
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
      files.has(".env.example") ? "Env template exists. Required and production-only keys still need review." : "Add a sanitized .env.example."
    ),
    scorecardItem(
      "CI",
      Math.round((ciSignals / 4) * 100),
      workflows.length ? "Workflow signal found. Confirm build lint and tests run on PRs." : "No GitHub Actions workflow found."
    ),
    scorecardItem(
      "Deploy",
      Math.round((deploySignals / 3) * 100),
      "Checks build/start commands and deployment notes."
    ),
    scorecardItem(
      "Security",
      Math.round((securitySignals / 4) * 100),
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
}) {
  const scripts = packageJson?.scripts ?? {};
  const blockers: string[] = [];
  const warnings: string[] = [];

  if (meta.archived) blockers.push("Repository is archived. Do not launch from it without a maintenance decision.");
  if (riskyFiles.length) blockers.push(`Remove public sensitive or temporary files: ${riskyFiles.join(", ")}.`);
  if (!readme) blockers.push("Add a README before launch so visitors understand purpose setup and status.");
  if (!files.has(".env.example")) blockers.push("Add a sanitized .env.example with required production and local variables.");

  if (readme && !/install|setup|getting started|quick start/i.test(readme)) warnings.push("README needs a clear setup or quick start section.");
  if (readme && !/deploy|vercel|docker|production/i.test(readme)) warnings.push("README needs deployment and rollback notes.");
  if (!scripts.build) warnings.push("No build script detected. Add or document the production build command.");
  if (!scripts.test && !scripts.lint) warnings.push("No test or lint script detected. Add at least one quality gate.");
  if (workflows.length === 0) warnings.push("No GitHub Actions workflow detected. Add CI for install build lint and tests.");
  if (!meta.license) warnings.push("No license detected. Clarify usage rights before public release.");

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
  riskyFiles = [],
  extraOverview = [],
}: {
  owner: string;
  repo: string;
  meta: GitHubRepoMeta;
  files: Map<string, string | null>;
  workflows: string[];
  fileStructure: string[];
  riskyFiles?: string[];
  extraOverview?: string[];
}) {
  const readme = files.get("README.md") ?? files.get("README") ?? null;
  const packageJson = parsePackageJson(files.get("package.json") ?? null);
  const packageManager = detectPackageManager(files, packageJson);
  const stack = detectStack(files, packageJson, meta.language);
  const commands = runCommands(packageManager, packageJson);
  const audit = launchAuditSummary({ meta, files, packageJson, workflows, readme, riskyFiles });
  const scorecard = launchScorecard({ files, packageJson, workflows, readme, riskyFiles });
  const releaseChecklist = [
    "Fix every item in Must fix before public launch.",
    "Run install build lint and tests in a clean clone.",
    "Confirm production env variables are set in the hosting platform and absent from Git.",
    "Check robots sitemap metadata privacy terms and status pages.",
    "Deploy to staging and click the main user paths on desktop and mobile.",
    "Prepare rollback steps owner contact and health check URL.",
  ];

  return {
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
    priorityFixes: audit.priorityFixes,
    prDescription: audit.prDescription,
    copyableIssues: audit.copyableIssues,
    overview: [
      ...extraOverview,
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
      "Run install build lint and tests in a clean environment.",
      "Check production secrets are not committed and have least privilege.",
      "Confirm framework output and start command match the hosting platform.",
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
