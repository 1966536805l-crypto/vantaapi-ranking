const fs = require("node:fs");
const path = require("node:path");

const root = process.cwd();
const requiredFiles = [
  "docs/tools/github-repo-analyzer/ANALYSIS_RULES.md",
  "docs/tools/github-repo-analyzer/MVP_RESPONSE_CONTRACT.md",
  "docs/tools/github-repo-analyzer/OUTPUT_TEMPLATE.md",
  "docs/tools/github-repo-analyzer/SAFE_COMMAND_POLICY.md",
  "templates/github-repo-analyzer/output-schema.json",
  "templates/github-repo-analyzer/prompt-template.md",
  "templates/github-repo-analyzer/risk-rules.json",
  "templates/github-repo-analyzer/checklist-seed.json",
];

const requiredPhrases = [
  "public GitHub repositories only",
  "Do not ask for or require",
  "Project Overview",
  "How to Run",
  "Tech Stack",
  "Security Notes",
  "Deployment Checklist",
  "PR Review Checklist",
];

let fail = 0;
function pass(message) {
  console.log(`✅ ${message}`);
}
function bad(message) {
  fail += 1;
  console.error(`❌ ${message}`);
}

console.log("🔎 GitHub Repo Analyzer template check\n");

for (const file of requiredFiles) {
  const fullPath = path.join(root, file);
  if (!fs.existsSync(fullPath)) {
    bad(`${file}: missing`);
    continue;
  }
  pass(`${file}: present`);

  if (file.endsWith(".json")) {
    try {
      JSON.parse(fs.readFileSync(fullPath, "utf8"));
      pass(`${file}: valid JSON`);
    } catch (error) {
      bad(`${file}: invalid JSON (${error.message})`);
    }
  }
}

const rulesPath = path.join(root, "docs/tools/github-repo-analyzer/ANALYSIS_RULES.md");
if (fs.existsSync(rulesPath)) {
  const rules = fs.readFileSync(rulesPath, "utf8");
  for (const phrase of requiredPhrases) {
    if (rules.includes(phrase)) pass(`rules mention: ${phrase}`);
    else bad(`rules missing phrase: ${phrase}`);
  }
}

const safePolicy = fs.existsSync(path.join(root, "docs/tools/github-repo-analyzer/SAFE_COMMAND_POLICY.md"))
  ? fs.readFileSync(path.join(root, "docs/tools/github-repo-analyzer/SAFE_COMMAND_POLICY.md"), "utf8")
  : "";
for (const phrase of ["curl ... | sh", "sudo", "rm -rf", "cat .env"]) {
  if (safePolicy.includes(phrase)) pass(`safe policy blocks: ${phrase}`);
  else bad(`safe policy missing block: ${phrase}`);
}

if (fail > 0) {
  console.error(`\nSummary: fail=${fail}`);
  process.exit(1);
}

console.log("\nSummary: pass");
