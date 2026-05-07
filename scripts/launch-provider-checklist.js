#!/usr/bin/env node

/**
 * Prints the provider-owned launch variables that must be copied from external dashboards.
 * This script never prints or stores secret values.
 */

const providers = [
  {
    name: "DATABASE_URL",
    source: "Managed Postgres",
    examples: ["Neon", "Supabase", "Vercel Postgres", "Railway Postgres"],
    shape: "postgresql://USER:PASSWORD@HOST:5432/DB?sslmode=require",
    vercel: "vercel env add DATABASE_URL production",
    note: "Must be Postgres. Do not use MySQL, SQLite, localhost, or a laptop database.",
  },
  {
    name: "AI_API_KEY",
    source: "AI provider dashboard",
    examples: ["DeepSeek", "Zhipu GLM", "OpenAI-compatible provider"],
    shape: "provider server-side API key",
    vercel: "vercel env add AI_API_KEY production",
    note: "Server-side only. Never use a browser/public key here.",
  },
  {
    name: "NEXT_PUBLIC_TURNSTILE_SITE_KEY",
    source: "Cloudflare Turnstile",
    examples: ["Cloudflare Dashboard -> Turnstile -> Widget"],
    shape: "public site key",
    vercel: "vercel env add NEXT_PUBLIC_TURNSTILE_SITE_KEY production",
    note: "This one is intentionally public and used by the login/register page.",
  },
  {
    name: "TURNSTILE_SECRET_KEY",
    source: "Cloudflare Turnstile",
    examples: ["Cloudflare Dashboard -> Turnstile -> Widget"],
    shape: "server secret key",
    vercel: "vercel env add TURNSTILE_SECRET_KEY production",
    note: "Server-side only. Keep it private.",
  },
  {
    name: "REDIS_URL",
    source: "Managed Redis",
    examples: ["Upstash Redis", "Vercel Marketplace Redis"],
    shape: "rediss://... or provider connection URL",
    vercel: "vercel env add REDIS_URL production",
    note: "Recommended for consistent rate limits across serverless instances.",
  },
  {
    name: "GITHUB_READ_TOKEN",
    source: "GitHub fine-grained token",
    examples: ["GitHub Settings -> Developer settings -> Fine-grained tokens"],
    shape: "github_pat_... with read-only public repository metadata scope",
    vercel: "vercel env add GITHUB_READ_TOKEN production",
    note: "Recommended to raise GitHub API quota for Launch Audit. Keep read-only.",
  },
];

console.log("JinMing Lab provider-owned launch variables\n");
console.log("These values must come from external dashboards. This script does not generate or upload them.");
console.log("Required values must be set before public launch. Recommended values improve reliability.\n");

for (const item of providers) {
  console.log(`${item.name}`);
  console.log(`  Source: ${item.source}`);
  console.log(`  Examples: ${item.examples.join(", ")}`);
  console.log(`  Expected shape: ${item.shape}`);
  console.log(`  Add to Vercel: ${item.vercel}`);
  console.log(`  Note: ${item.note}\n`);
}

console.log("After filling provider values, run:");
console.log("npm run launch:production");
