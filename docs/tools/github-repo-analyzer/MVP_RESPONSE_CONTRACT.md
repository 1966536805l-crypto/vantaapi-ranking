# GitHub Repo Analyzer MVP Response Contract

This contract keeps the first version easy for backend and frontend teams to integrate.

## Current MVP shape

The backend may return simple arrays for fast rendering:

```ts
type GitHubRepoAnalysis = {
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
  scorecard: Array<{
    label: string;
    score: number;
    status: "pass" | "review" | "missing";
    note: string;
  }>;
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
```

## Section mapping

Frontend section | MVP field | Notes
--- | --- | ---
Project Overview | `overview` | Include one-sentence project summary and maturity estimate.
Launch Scorecard | `scorecard` | Five compact scores for README, environment, CI, deploy, and security.
Evidence Findings | `issueFindings` | Each core issue includes severity, evidence, and source file or metadata.
Fix Priority | `priorityFixes` | Split work into today, before launch, and later polish.
PR Description | `prDescription` | Copy-ready pull request body for maintainers.
How to Run | `howToRun` | Safe commands only.
Tech Stack | `techStack` | Include evidence when short enough.
File Structure | `fileStructure` | Root-level structure summary.
Security Notes | `securityNotes` | Include risk level, evidence, and recommendation.
README Suggestions | `readmeSuggestions` | Missing docs and improvements.
GitHub Actions Suggestions | `githubActions` | CI/security automation recommendations.
Deployment Checklist | `deploymentChecklist` | Release readiness checklist.
PR Review Checklist | `prReviewChecklist` | Merge review checklist.
Files Read | `filesRead` | Transparency/debugging.

## Required security checklist coverage

The MVP can include security checklist items inside `securityNotes` until a dedicated `securityChecklist` field is added.

Minimum coverage:

- auth for private/admin routes
- input validation for APIs
- rate limits for login/write/AI/expensive APIs
- CSRF for cookie-auth write routes
- restricted CORS
- security headers
- secrets stored outside Git
- dependency audit
- no untrusted code execution without sandbox

## Upgrade path

A future v2 response can move from simple string arrays to structured findings:

```ts
type Finding = {
  title: string;
  detail: string;
  evidence?: string;
  confidence?: number;
};

type RiskFinding = Finding & {
  severity: "high" | "medium" | "low" | "info";
  recommendation: string;
};
```

Do not block the MVP on the v2 shape.
