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

const nextActions = [];

const variableNotes = {
  DATABASE_URL: "Provider-owned. Copy from managed Postgres. Must be a real Postgres URL, not localhost.",
  JWT_SECRET: "App-owned. Generate with npm run launch:secrets or rotate with npm run launch:fix-secrets -- --apply.",
  CSRF_SECRET: "App-owned hex secret. Generate with npm run launch:secrets.",
  ENCRYPTION_KEY: "App-owned hex secret for 2FA encryption. Generate with npm run launch:secrets.",
  AI_API_KEY: "Provider-owned. Copy from the AI provider dashboard. Server-side only.",
  NEXT_PUBLIC_TURNSTILE_SITE_KEY: "Provider-owned. Copy from Cloudflare Turnstile. This one is public.",
  TURNSTILE_SECRET_KEY: "Provider-owned. Copy from Cloudflare Turnstile. Server-side only.",
  GITHUB_READ_TOKEN: "Recommended. Raises GitHub API quota for launch audits.",
  REDIS_URL: "Recommended. Use managed Redis such as Upstash for serverless-wide rate limits.",
};

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

function action(title, detail) {
  nextActions.push({ title, detail });
}

function parseEnvRows(output) {
  const rows = new Map();
  for (const line of output.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || /^name\s+/i.test(trimmed) || /^-+$/.test(trimmed)) continue;
    const match = trimmed.match(/^([A-Z0-9_]+)\s+\S+\s+(.+?)\s+\d/);
    if (!match) continue;
    rows.set(match[1], {
      raw: trimmed,
      environments: match[2].split(",").map((item) => item.trim().toLowerCase()).filter(Boolean),
    });
  }
  return rows;
}

function hasProduction(rows, name) {
  return rows.get(name)?.environments.includes("production") ?? false;
}

function printGroup(title, names, rows, level) {
  console.log(`\n${title}`);
  for (const name of names) {
    const row = rows.get(name);
    const found = Boolean(row);
    const production = hasProduction(rows, name);
    const icon = production ? "OK" : level === "warn" ? "WARN" : "FAIL";
    const status = production ? "configured for Production" : found ? `configured for ${row.environments.join(", ")} but missing Production` : "missing";
    console.log(`${icon} ${name}: ${status}`);
    if (!production && variableNotes[name]) console.log(`   ${variableNotes[name]}`);
    if (!production && level !== "warn") {
      action(`Set ${name} in Vercel Production`, `${variableNotes[name] || "Add the real value in Vercel Production."} Command: vercel env add ${name} production`);
    }
    if (!production && level === "warn") {
      action(`Recommended: set ${name} in Vercel Production`, `${variableNotes[name] || "Add when ready."} Command: vercel env add ${name} production`);
    }
  }
}

const output = runVercelEnvList();
const rows = parseEnvRows(output);
const missingCritical = critical.filter((name) => !hasProduction(rows, name));
const missingProvider = providerRequired.filter((name) => !hasProduction(rows, name));
const missingRecommended = recommended.filter((name) => !hasProduction(rows, name));

console.log("Vercel production env presence check");
console.log("This only checks names and Production scope. It cannot verify encrypted values are non-empty.");
console.log("Run npm run launch:production after this to pull and validate values without printing secrets.");
printGroup("Critical", critical, rows, "fail");
printGroup("Provider security", providerRequired, rows, "fail");
printGroup("Recommended", recommended, rows, "warn");

console.log(`\nSummary: critical_missing=${missingCritical.length} provider_missing=${missingProvider.length} recommended_missing=${missingRecommended.length}`);

if (nextActions.length) {
  console.log("\nNext Vercel actions:");
  const seen = new Set();
  nextActions
    .filter((item) => {
      const key = `${item.title}:${item.detail}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, 12)
    .forEach((item, index) => {
      console.log(`${index + 1}. ${item.title}`);
      console.log(`   ${item.detail}`);
    });
}

if (missingCritical.length || missingProvider.length) {
  process.exit(1);
}

console.log("\nPresence check passed. Next step:");
console.log("npm run launch:production");
