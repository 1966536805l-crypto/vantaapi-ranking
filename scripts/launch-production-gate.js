#!/usr/bin/env node

/**
 * Runs the production launch gate in the same order a human should use:
 * 1. Verify Vercel Production variables exist.
 * 2. Pull Vercel Production env into an ignored local file.
 * 3. Validate the pulled values without printing secrets.
 */

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { execFileSync, spawnSync } = require("node:child_process");
// eslint-disable-next-line @typescript-eslint/no-require-imports
const fs = require("node:fs");
// eslint-disable-next-line @typescript-eslint/no-require-imports
const path = require("node:path");
// eslint-disable-next-line @typescript-eslint/no-require-imports
const dotenv = require("dotenv");

const root = process.cwd();
const envFile = ".env.vercel.production.local";
const envPath = path.join(root, envFile);
const appOwnedSecrets = new Set(["JWT_SECRET", "CSRF_SECRET", "ENCRYPTION_KEY"]);

function run(command, args, options = {}) {
  console.log(`\n$ ${[command, ...args].join(" ")}`);
  const result = spawnSync(command, args, {
    cwd: root,
    env: { ...process.env, CI: "1", ...options.env },
    stdio: "inherit",
    shell: false,
  });
  if (result.status !== 0) process.exit(result.status || 1);
}

function vercelIsAvailable() {
  try {
    execFileSync("npx", ["vercel", "--version"], {
      cwd: root,
      env: { ...process.env, CI: "1" },
      stdio: ["ignore", "ignore", "ignore"],
    });
    return true;
  } catch {
    return false;
  }
}

function validatePulledEnvFile() {
  const requiredNonEmpty = [
    "DATABASE_URL",
    "JWT_SECRET",
    "CSRF_SECRET",
    "ENCRYPTION_KEY",
    "AI_API_KEY",
    "NEXT_PUBLIC_TURNSTILE_SITE_KEY",
    "TURNSTILE_SECRET_KEY",
  ];
  const parsed = dotenv.parse(fs.readFileSync(envPath, "utf8"));
  const empty = requiredNonEmpty.filter((name) => !String(parsed[name] || "").trim());
  if (empty.length === 0) return;

  console.error("\nPulled Vercel Production env contains empty required values:");
  for (const name of empty) console.error(`- ${name}`);
  console.error("\nFix in Vercel Project Settings -> Environment Variables:");
  console.error("1. Delete each empty variable above, or edit it in the Vercel dashboard.");
  console.error("2. Re-enter the real value for the Production scope.");
  console.error("3. Rerun: npm run launch:production");
  console.error("\nCLI cleanup commands:");
  for (const name of empty) console.error(`vercel env rm ${name} production`);
  const generated = empty.filter((name) => appOwnedSecrets.has(name));
  const provider = empty.filter((name) => !appOwnedSecrets.has(name));
  if (generated.length) {
    console.error("\nGenerate replacement values for these app-owned secrets:");
    console.error(`- ${generated.join(", ")}`);
    console.error("Run: npm run launch:secrets");
  }
  if (provider.length) {
    console.error("\nProvider values you must copy from external dashboards:");
    for (const name of provider) {
      const hint =
        name === "DATABASE_URL"
          ? "managed Postgres provider"
          : name === "AI_API_KEY"
            ? "AI provider"
            : "Cloudflare Turnstile";
      console.error(`- ${name}: ${hint}`);
    }
  }
  console.error("\nThe variable names exist, but empty values are not launch-ready.");
  process.exit(1);
}

console.log("JinMing Lab production launch gate");
console.log("Secrets are never printed. Pulled env is written only to an ignored local .env file.");

if (!vercelIsAvailable()) {
  console.error("Vercel CLI is unavailable. Install or authenticate it, then rerun npm run launch:production.");
  process.exit(1);
}

run("npm", ["run", "launch:vercel"]);

if (fs.existsSync(envPath)) {
  fs.copyFileSync(envPath, `${envPath}.backup`);
  console.log(`\nExisting ${envFile} backed up to ${envFile}.backup`);
}

run("npx", ["vercel", "env", "pull", envFile, "--environment=production"]);
validatePulledEnvFile();
run("npm", ["run", "launch:check"], {
  env: {
    PRELAUNCH_ENV_FILE: envFile,
    PRELAUNCH_IGNORE_PROCESS_ENV: "true",
  },
});

console.log("\nProduction launch gate passed. Next step: npm run build, then deploy.");
