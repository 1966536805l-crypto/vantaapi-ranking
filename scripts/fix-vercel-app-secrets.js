#!/usr/bin/env node

/**
 * Regenerates app-owned production secrets and writes them to Vercel Production.
 * It does not touch provider-owned values such as DATABASE_URL, AI_API_KEY, or Turnstile keys.
 */

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { spawnSync } = require("node:child_process");
// eslint-disable-next-line @typescript-eslint/no-require-imports
const crypto = require("node:crypto");

const secrets = {
  JWT_SECRET: crypto.randomBytes(48).toString("base64url"),
  CSRF_SECRET: crypto.randomBytes(32).toString("hex"),
  ENCRYPTION_KEY: crypto.randomBytes(32).toString("hex"),
};

function run(command, args, input) {
  const printable = [command, ...args].join(" ");
  console.log(`$ ${printable}`);
  const result = spawnSync(command, args, {
    input,
    encoding: "utf8",
    env: { ...process.env, CI: "1" },
    stdio: ["pipe", "inherit", "inherit"],
  });
  if (result.status !== 0) process.exit(result.status || 1);
}

console.log("Regenerating app-owned Vercel Production secrets.");
console.log("Values are sent directly to Vercel and are not printed.\n");

for (const [key, value] of Object.entries(secrets)) {
  run("npx", ["vercel", "env", "rm", key, "production", "--yes"], "");
  run("npx", ["vercel", "env", "add", key, "production"], value);
}

console.log("\nDone. Provider-owned values still need to be filled manually if empty:");
console.log("- DATABASE_URL");
console.log("- AI_API_KEY");
console.log("- NEXT_PUBLIC_TURNSTILE_SITE_KEY");
console.log("- TURNSTILE_SECRET_KEY");
console.log("\nRun: npm run launch:production");
