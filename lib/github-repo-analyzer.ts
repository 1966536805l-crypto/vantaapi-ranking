import { Buffer } from "node:buffer";

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
  overview: string[];
  howToRun: string[];
  techStack: string[];
  fileStructure: string[];
  securityNotes: string[];
  readmeSuggestions: string[];
  githubActions: string[];
  deploymentChecklist: string[];
  prReviewChecklist: string[];
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

const REQUEST_TIMEOUT_MS = 7000;
const MAX_FILE_BYTES = 180_000;
const OWNER_REPO_RE = /^[A-Za-z0-9_.-]+$/;

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

function githubHeaders() {
  const token = process.env.GITHUB_READ_TOKEN || "";
  return {
    Accept: "application/vnd.github+json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    "User-Agent": "VantaAPI-Repo-Analyzer",
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
    const data = await fetchGitHubJson<GitHubContentItem | GitHubContentItem[]>(
      `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/contents/${encodeURIComponent(path).replace(/%2F/g, "/")}?ref=${encodeURIComponent(branch)}`
    );
    if (Array.isArray(data) || data.type !== "file" || !data.content || data.encoding !== "base64") return null;
    if ((data.size ?? 0) > MAX_FILE_BYTES) return null;
    return Buffer.from(data.content, "base64").toString("utf8").slice(0, MAX_FILE_BYTES);
  } catch {
    return null;
  }
}

async function readWorkflowNames(owner: string, repo: string, branch: string) {
  try {
    const data = await fetchGitHubJson<GitHubContentItem[]>(
      `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/contents/.github/workflows?ref=${encodeURIComponent(branch)}`
    );
    return Array.isArray(data)
      ? data.filter((item) => item.type === "file").map((item) => item.name).slice(0, 8)
      : [];
  } catch {
    return [];
  }
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

export async function analyzeGitHubRepository(input: GitHubRepoInput): Promise<GitHubRepoAnalysis> {
  const { owner, repo } = parseGitHubRepoUrl(input.url);
  const meta = await fetchGitHubJson<GitHubRepoMeta>(
    `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`
  );
  const rootItems = await fetchGitHubJson<GitHubContentItem[]>(
    `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/contents?ref=${encodeURIComponent(meta.default_branch)}`
  );

  const files = new Map<string, string | null>();
  await Promise.all(
    candidateFiles.map(async (path) => {
      if (path === ".github/workflows") return;
      const content = await readRepoFile(owner, repo, path, meta.default_branch);
      if (content !== null) files.set(path, content);
    })
  );
  const workflows = await readWorkflowNames(owner, repo, meta.default_branch);
  const readme = files.get("README.md") ?? files.get("README") ?? null;
  const packageJson = parsePackageJson(files.get("package.json") ?? null);
  const packageManager = detectPackageManager(files, packageJson);
  const stack = detectStack(files, packageJson, meta.language);
  const commands = runCommands(packageManager, packageJson);
  const fileStructure = rootStructure(rootItems);

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
    overview: [
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
    filesRead: Array.from(files.keys()).concat(workflows.length ? [".github/workflows"] : []),
  };
}
