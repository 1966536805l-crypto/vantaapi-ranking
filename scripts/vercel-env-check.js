#!/usr/bin/env node

/**
 * Checks Vercel production environment variable presence without printing values.
 */

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { execFileSync } = require("node:child_process");

const critical = [
  "DATABASE_URL",
  "JWT_SECRET",
  "CSRF_SECRET",
  "ENCRYPTION_KEY",
  "ADMIN_2FA_REQUIRED",
  "ENABLE_CPP_RUNNER",
  "AI_API_KEY",
  "AI_BASE_URL",
  "AI_MODEL",
  "APP_ALLOWED_HOSTS",
  "ENABLE_PUBLIC_REGISTRATION",
  "SECURITY_MODE",
  "AUTH_SESSION_SECONDS",
  "ENABLE_REDIS_RATE_LIMITS",
  "AUTH_TURNSTILE_REQUIRED",
];

const providerRequired = [
  "NEXT_PUBLIC_TURNSTILE_SITE_KEY",
  "TURNSTILE_SECRET_KEY",
];

const recommended = [
  "GITHUB_READ_TOKEN",
  "REDIS_URL",
];

function runVercelEnvList() {
  try {
    const stdout = execFileSync("npx", ["vercel", "env", "ls"], {
      cwd: process.cwd(),
      encoding: "utf8",
      env: { ...process.env, CI: "1" },
      stdio: ["ignore", "pipe", "pipe"],
    });
    return stdout;
  } catch (error) {
    const stderr = error?.stderr?.toString?.() || "";
    console.error("Could not read Vercel environment list.");
    if (stderr) console.error(stderr.trim());
    process.exit(1);
  }
}

function hasName(output, name) {
  return new RegExp(`^\\s*${name}\\s`, "m").test(output);
}

function printGroup(title, names, output, level) {
  console.log(`\n${title}`);
  for (const name of names) {
    const found = hasName(output, name);
    const icon = found ? "OK" : level === "warn" ? "WARN" : "FAIL";
    console.log(`${icon} ${name}: ${found ? "configured" : "missing"}`);
  }
}

const output = runVercelEnvList();
const missingCritical = critical.filter((name) => !hasName(output, name));
const missingProvider = providerRequired.filter((name) => !hasName(output, name));
const missingRecommended = recommended.filter((name) => !hasName(output, name));

console.log("Vercel production env presence check");
printGroup("Critical", critical, output, "fail");
printGroup("Provider security", providerRequired, output, "fail");
printGroup("Recommended", recommended, output, "warn");

console.log(`\nSummary: critical_missing=${missingCritical.length} provider_missing=${missingProvider.length} recommended_missing=${missingRecommended.length}`);

if (missingCritical.length || missingProvider.length) {
  process.exit(1);
}
