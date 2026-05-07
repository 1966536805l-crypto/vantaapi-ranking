#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("fs");

const checks = [];
const add = (level, name, message) => checks.push({ level, name, message });
const read = (file) => {
  try { return fs.readFileSync(file, "utf8"); } catch { return ""; }
};
const json = (file) => JSON.parse(read(file) || "{}");

console.log("📦 supply-chain security check\n");

const pkg = json("package.json");
const lock = json("package-lock.json");
const npmrc = read(".npmrc");
const workflows = [".github/workflows/security.yml", ".github/workflows/npm-audit.yml"].map(read).join("\n");

if (lock.lockfileVersion && lock.packages && lock.packages["" ]?.dependencies) {
  add("pass", "lockfile", "package-lock.json is present and npm lockfile v2/v3 style");
} else add("fail", "lockfile", "package-lock.json is missing or malformed");

const root = lock.packages?.[""] || {};
const rootDeps = { ...(root.dependencies || {}), ...(root.devDependencies || {}) };
const pkgDeps = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) };
const missingFromLock = Object.keys(pkgDeps).filter((name) => !rootDeps[name]);
if (missingFromLock.length) add("fail", "lockfile:sync", `dependencies missing from lock root: ${missingFromLock.join(", ")}`);
else add("pass", "lockfile:sync", "package dependencies are represented in lockfile root");

const allDeps = Object.entries(pkgDeps);
const riskySpec = allDeps.filter(([, version]) => /(?:^git\+|^git:|^http:|github:|file:|link:|workspace:|\*)/i.test(String(version)));
if (riskySpec.length) add("fail", "dependency-specs", `risky dependency spec(s): ${riskySpec.map(([name, version]) => `${name}@${version}`).join(", ")}`);
else add("pass", "dependency-specs", "no git/http/file/link/star dependency specs in package.json");

const scripts = pkg.scripts || {};
const lifecycleScripts = ["preinstall", "install", "postinstall", "prepublish", "prepare"].filter((name) => scripts[name]);
if (lifecycleScripts.length) add("warn", "lifecycle-scripts", `root lifecycle scripts present: ${lifecycleScripts.join(", ")}`);
else add("pass", "lifecycle-scripts", "no root install/publish lifecycle scripts");

if (pkg.overrides && pkg.overrides.postcss && pkg.overrides["@hono/node-server"]) add("pass", "overrides", "security overrides are pinned");
else add("warn", "overrides", "expected security overrides should be reviewed");

if (npmrc.includes("save-exact=true") && npmrc.includes("package-lock=true") && npmrc.includes("audit=true")) {
  add("pass", "npmrc", "npm saves exact versions, keeps lockfile, and audits by default");
} else add("warn", "npmrc", ".npmrc supply-chain defaults incomplete");

if (workflows.includes("npm ci --ignore-scripts") && workflows.includes("npm audit --audit-level=high")) {
  add("pass", "ci:install", "CI uses locked install and high-severity audit gate");
} else add("warn", "ci:install", "CI install/audit hardening should be reviewed");

const icons = { pass: "✅", warn: "⚠️", fail: "❌" };
for (const check of checks) console.log(`${icons[check.level]} ${check.name}: ${check.message}`);
const summary = checks.reduce((acc, check) => {
  acc[check.level] = (acc[check.level] || 0) + 1;
  return acc;
}, {});
console.log("\nSummary:", `pass=${summary.pass || 0}`, `warn=${summary.warn || 0}`, `fail=${summary.fail || 0}`);
if (summary.fail) process.exitCode = 1;
