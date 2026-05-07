import { NextRequest } from "next/server";
import { enforceRateLimitAsync, guardedJson, jsonError, readJsonBody } from "@/lib/api-guard";
import { analyzeGitHubRepository, GitHubRepoAnalyzerError } from "@/lib/github-repo-analyzer";

type GitHubRepoAnalyzerBody = {
  url?: unknown;
};

export async function POST(request: NextRequest) {
  const limited = await enforceRateLimitAsync(request, 10, 5 * 60_000, "tool:github-repo-analyzer");
  if (limited) return limited;

  const parsed = await readJsonBody<GitHubRepoAnalyzerBody>(request, 8 * 1024);
  if (!parsed.ok) return parsed.response;

  if (typeof parsed.body.url !== "string") {
    return jsonError("Repository URL is required", 400);
  }

  try {
    const analysis = await analyzeGitHubRepository({ url: parsed.body.url });
    return guardedJson({ success: true, analysis });
  } catch (error) {
    if (error instanceof GitHubRepoAnalyzerError) {
      return jsonError(error.message, error.status);
    }
    return jsonError("Could not run repository launch audit", 500);
  }
}
