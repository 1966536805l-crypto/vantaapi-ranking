#!/usr/bin/env node

/**
 * Generates launch-ready secret values for JinMing Lab.
 * It only prints values to stdout; it never writes .env files or calls providers.
 */

// eslint-disable-next-line @typescript-eslint/no-require-imports
const crypto = require("node:crypto");

function base64Secret(bytes = 48) {
  return crypto.randomBytes(bytes).toString("base64url");
}

function hexSecret(bytes = 32) {
  return crypto.randomBytes(bytes).toString("hex");
}

function printEnvBlock(values) {
  console.log("# Paste these into Vercel Production environment variables.");
  console.log("# Do not commit them. Rotate immediately if they are exposed.\n");
  for (const [key, value] of Object.entries(values)) {
    console.log(`${key}="${value}"`);
  }
}

function printVercelCommands(values) {
  console.log("\n# Vercel CLI helper commands");
  console.log("# These commands prompt Vercel to store each value in the Production scope.\n");
  for (const [key, value] of Object.entries(values)) {
    console.log(`printf '%s' '${value}' | vercel env add ${key} production`);
  }
}

const values = {
  JWT_SECRET: base64Secret(48),
  CSRF_SECRET: hexSecret(32),
  ENCRYPTION_KEY: hexSecret(32),
};

console.log("JinMing Lab production secret generator\n");
printEnvBlock(values);
printVercelCommands(values);
console.log("\nStill required from providers:");
console.log("- DATABASE_URL from managed Postgres");
console.log("- AI_API_KEY from your AI provider");
console.log("- NEXT_PUBLIC_TURNSTILE_SITE_KEY and TURNSTILE_SECRET_KEY from Cloudflare Turnstile");
console.log("\nAfter setting values, run: npm run launch:production");
