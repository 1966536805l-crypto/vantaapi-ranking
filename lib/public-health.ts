export type PublicHealthCheck = {
  name: string;
  status: "operational" | "protected" | "disabled" | "limited";
  detail: string;
};

export type PublicBuildInfo = {
  commit: string;
  branch: string;
  environment: string;
  deployment: string;
  languageBootstrap: "client-component";
};

export type PublicHealthSnapshot = {
  product: "JinMing Lab";
  status: "operational" | "limited";
  generatedAt: string;
  build: PublicBuildInfo;
  checks: PublicHealthCheck[];
};

function enabled(value: string | undefined) {
  return value === "true";
}

function publicValue(value: string | undefined, fallback: string) {
  const clean = value?.trim();
  return clean || fallback;
}

function buildInfo(): PublicBuildInfo {
  const commit = publicValue(process.env.VERCEL_GIT_COMMIT_SHA, process.env.NEXT_PUBLIC_COMMIT_SHA || "local");
  const deploymentUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "local";

  return {
    commit: commit === "local" ? commit : commit.slice(0, 12),
    branch: publicValue(process.env.VERCEL_GIT_COMMIT_REF, "local"),
    environment: publicValue(process.env.VERCEL_ENV || process.env.NODE_ENV, "local"),
    deployment: deploymentUrl,
    languageBootstrap: "client-component",
  };
}

export function getPublicHealthSnapshot(): PublicHealthSnapshot {
  const cppRunnerEnabled = enabled(process.env.ENABLE_CPP_RUNNER);
  const publicRegistrationEnabled = enabled(process.env.ENABLE_PUBLIC_REGISTRATION);
  const turnstileRequired =
    process.env.AUTH_TURNSTILE_REQUIRED === "true" ||
    (process.env.NODE_ENV === "production" && process.env.AUTH_TURNSTILE_REQUIRED !== "false");
  const securityMode = process.env.SECURITY_MODE || "normal";

  const checks: PublicHealthCheck[] = [
    {
      name: "Public app",
      status: "operational",
      detail: "Homepage, GitHub Launch Audit, tools, search, and programming training are available.",
    },
    {
      name: "GitHub Launch Audit",
      status: "operational",
      detail: "Accepts public repository root URLs only and rejects pasted secrets before analysis.",
    },
    {
      name: "AI features",
      status: "protected",
      detail: "AI coach and account-linked AI features require login and rate limits. Core audit checks do not depend on AI quality.",
    },
    {
      name: "Account access",
      status: publicRegistrationEnabled ? "protected" : "disabled",
      detail: publicRegistrationEnabled
        ? "Registration is protected by auth controls and anti-abuse checks."
        : "Public registration is closed during the launch test window.",
    },
    {
      name: "Bot protection",
      status: turnstileRequired ? "protected" : "limited",
      detail: turnstileRequired
        ? "Auth routes require Turnstile when configured and edge bot/rate-limit guards are active."
        : "Edge bot/rate-limit guards are active. Turnstile should be enabled before broad public traffic.",
    },
    {
      name: "C++ runner",
      status: cppRunnerEnabled ? "limited" : "disabled",
      detail: cppRunnerEnabled
        ? "Online code execution is enabled. Verify sandbox isolation before public traffic."
        : "Online C++ execution is intentionally disabled for public launch.",
    },
    {
      name: "Security mode",
      status: securityMode === "normal" ? "operational" : "protected",
      detail: `Current edge security mode is ${securityMode}.`,
    },
  ];

  const limited = checks.some((check) => check.status === "limited");

  return {
    product: "JinMing Lab",
    status: limited ? "limited" : "operational",
    generatedAt: new Date().toISOString(),
    build: buildInfo(),
    checks,
  };
}
