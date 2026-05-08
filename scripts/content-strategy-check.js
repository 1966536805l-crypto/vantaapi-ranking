#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("fs");
const path = require("path");

const root = process.cwd();
const requiredFiles = [
  "docs/content/CONTENT_REDUCTION_GUIDE.md",
  "docs/content/CONTENT_HANDOFF.md",
  "docs/content/TOOL_PAGE_TEMPLATE.md",
];

const requiredPhrases = [
  "Use **JinMing Lab** as the public product brand.",
  "AI tools",
  "Programming practice",
  "Learning roadmaps",
  "Hide unfinished entries before public launch",
  "Avoid large exact claims",
  "Language consistency",
  "Tool page content standard",
];

let failures = 0;
function ok(message) {
  console.log(`✅ ${message}`);
}
function fail(message) {
  failures += 1;
  console.error(`❌ ${message}`);
}
function read(file) {
  try {
    return fs.readFileSync(path.join(root, file), "utf8");
  } catch {
    return "";
  }
}

console.log("🔎 content strategy check\n");

for (const file of requiredFiles) {
  if (fs.existsSync(path.join(root, file))) ok(`${file}: present`);
  else fail(`${file}: missing`);
}

const guide = read("docs/content/CONTENT_REDUCTION_GUIDE.md");
for (const phrase of requiredPhrases) {
  if (guide.includes(phrase)) ok(`guide includes: ${phrase}`);
  else fail(`guide missing: ${phrase}`);
}

const forbiddenPublicBrandExamples = ["VantaAPI", "immortal", "vantaapi-ranking"];
for (const phrase of forbiddenPublicBrandExamples) {
  if (guide.includes(`Avoid in public UI`) && guide.includes(phrase)) ok(`guide documents deprecated brand: ${phrase}`);
  else fail(`guide does not document deprecated brand: ${phrase}`);
}

const publicBrandFiles = [
  "README.md",
  "SECURITY.md",
  "DEPLOYMENT.md",
  "app/page.tsx",
  "app/layout.tsx",
  "app/robots.ts",
  "app/sitemap.ts",
  "app/search/page.tsx",
  "components/layout/GlobalSearchLauncher.tsx",
  "lib/site-search.ts",
  "lib/tool-definitions.ts",
];
const deprecatedBrandPattern = /\bVantaAPI\b|Immortal|vantaapi-ranking/;
const deprecatedBrandFiles = publicBrandFiles.filter((file) => deprecatedBrandPattern.test(read(file)));
if (deprecatedBrandFiles.length) {
  fail(`public brand residue: ${deprecatedBrandFiles.join(", ")}`);
} else {
  ok("public brand surfaces use JinMing Lab wording");
}

const publicPromiseFiles = [
  "app/page.tsx",
  "app/search/page.tsx",
  "components/layout/GlobalSearchLauncher.tsx",
  "lib/site-search.ts",
  "lib/tool-definitions.ts",
];
const exaggeratedClaimPattern = /IELTS 5000|TOEFL 5000|26000|60000|every language has 5000|5000 questions|每门语言\s*5000|5000\s*题/i;
const exaggeratedClaimFiles = publicPromiseFiles.filter((file) => exaggeratedClaimPattern.test(read(file)));
if (exaggeratedClaimFiles.length) {
  fail(`public exaggerated exact claims: ${exaggeratedClaimFiles.join(", ")}`);
} else {
  ok("public positioning avoids large exact content claims");
}

if (failures > 0) {
  console.error(`\nSummary: fail=${failures}`);
  process.exit(1);
}

console.log("\nSummary: pass");
