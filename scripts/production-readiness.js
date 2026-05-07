#!/usr/bin/env node

/**
 * 生产环境就绪检查和配置助手
 * 帮助快速识别和修复 vantaapi.com 部署前的配置问题
 */

// eslint-disable-next-line @typescript-eslint/no-require-imports
const fs = require("fs");
// eslint-disable-next-line @typescript-eslint/no-require-imports
const path = require("path");
// eslint-disable-next-line @typescript-eslint/no-require-imports
const dotenv = require("dotenv");

const root = process.cwd();

function loadEnvFile(file) {
  const full = path.join(root, file);
  if (!fs.existsSync(full)) return {};
  return dotenv.parse(fs.readFileSync(full, "utf8"));
}

const env = {
  ...loadEnvFile(".env"),
  ...loadEnvFile(".env.production"),
  ...process.env,
};

function envValue(name) {
  return String(env[name] || "").trim();
}

console.log("🚀 vantaapi.com 生产环境就绪检查\n");
console.log("=" .repeat(60));

// 关键配置检查
const checks = {
  critical: [],
  recommended: [],
  optional: [],
};

// 1. 数据库检查
console.log("\n📊 数据库配置");
console.log("-".repeat(60));
const dbUrl = envValue("DATABASE_URL");
if (!dbUrl) {
  checks.critical.push("DATABASE_URL 未设置");
  console.log("❌ DATABASE_URL: 未配置");
} else if (dbUrl.startsWith("mysql://")) {
  checks.critical.push("DATABASE_URL 使用了 MySQL，但项目需要 PostgreSQL");
  console.log("❌ DATABASE_URL: 使用了 MySQL（需要 PostgreSQL）");
  console.log("   当前: mysql://...");
  console.log("   需要: postgresql://...");
} else if (dbUrl.includes("localhost") || dbUrl.includes("127.0.0.1")) {
  checks.critical.push("DATABASE_URL 指向本地数据库，生产环境不可用");
  console.log("❌ DATABASE_URL: 指向本地数据库");
  console.log("   建议: 使用 Vercel Neon Postgres 或其他云数据库");
} else if (dbUrl.startsWith("postgresql://") || dbUrl.startsWith("postgres://")) {
  console.log("✅ DATABASE_URL: PostgreSQL 配置正确");
  if (!dbUrl.includes("sslmode=require")) {
    checks.recommended.push("DATABASE_URL 建议添加 ?sslmode=require");
    console.log("⚠️  建议添加 SSL 模式: ?sslmode=require");
  }
} else {
  checks.critical.push("DATABASE_URL 格式不正确");
  console.log("❌ DATABASE_URL: 格式不正确");
}

// 2. 安全密钥检查
console.log("\n🔐 安全密钥");
console.log("-".repeat(60));
const jwtSecret = envValue("JWT_SECRET");
const csrfSecret = envValue("CSRF_SECRET");
const encryptionKey = envValue("ENCRYPTION_KEY");

if (!jwtSecret || jwtSecret.length < 32) {
  checks.critical.push("JWT_SECRET 未设置或太短");
  console.log("❌ JWT_SECRET: 未配置或太短（需要至少 32 字符）");
} else {
  console.log("✅ JWT_SECRET: 已配置");
}

if (!csrfSecret || csrfSecret.length < 64) {
  checks.critical.push("CSRF_SECRET 未设置或太短");
  console.log("❌ CSRF_SECRET: 未配置或太短（需要至少 64 字符）");
} else if (!/^[a-f0-9]+$/i.test(csrfSecret)) {
  checks.critical.push("CSRF_SECRET 必须是十六进制格式");
  console.log("❌ CSRF_SECRET: 必须是十六进制格式");
} else {
  console.log("✅ CSRF_SECRET: 已配置");
}

if (!encryptionKey || encryptionKey.length < 64) {
  checks.critical.push("ENCRYPTION_KEY 未设置或太短（2FA 需要）");
  console.log("❌ ENCRYPTION_KEY: 未配置或太短（2FA 加密需要）");
} else if (!/^[a-f0-9]+$/i.test(encryptionKey)) {
  checks.critical.push("ENCRYPTION_KEY 必须是十六进制格式");
  console.log("❌ ENCRYPTION_KEY: 必须是十六进制格式");
} else {
  console.log("✅ ENCRYPTION_KEY: 已配置");
}

// 3. Turnstile Bot 保护
console.log("\n🤖 Turnstile Bot 保护");
console.log("-".repeat(60));
const turnstileSiteKey = envValue("NEXT_PUBLIC_TURNSTILE_SITE_KEY");
const turnstileSecret = envValue("TURNSTILE_SECRET_KEY");

if (!turnstileSiteKey || !turnstileSecret) {
  checks.critical.push("Turnstile 未配置（登录/注册无保护）");
  console.log("❌ Turnstile: 未配置");
  console.log("   影响: 登录和注册页面没有机器人保护");
  console.log("   配置: https://dash.cloudflare.com/ → Turnstile");
} else {
  console.log("✅ NEXT_PUBLIC_TURNSTILE_SITE_KEY: 已配置");
  console.log("✅ TURNSTILE_SECRET_KEY: 已配置");
}

// 4. 主机名保护
console.log("\n🌐 主机名保护");
console.log("-".repeat(60));
const allowedHosts = envValue("APP_ALLOWED_HOSTS");
if (!allowedHosts) {
  checks.critical.push("APP_ALLOWED_HOSTS 未设置（Host header 攻击风险）");
  console.log("❌ APP_ALLOWED_HOSTS: 未配置");
  console.log("   需要: vantaapi.com,www.vantaapi.com");
} else if (!allowedHosts.includes("vantaapi.com")) {
  checks.critical.push("APP_ALLOWED_HOSTS 未包含 vantaapi.com");
  console.log("❌ APP_ALLOWED_HOSTS: 未包含 vantaapi.com");
} else {
  console.log("✅ APP_ALLOWED_HOSTS: 已配置");
  console.log(`   值: ${allowedHosts}`);
}

// 5. 2FA 和安全设置
console.log("\n🔒 2FA 和安全设置");
console.log("-".repeat(60));
const admin2faRequired = envValue("ADMIN_2FA_REQUIRED");
const enableCppRunner = envValue("ENABLE_CPP_RUNNER");

if (admin2faRequired === "false") {
  checks.critical.push("ADMIN_2FA_REQUIRED 被禁用（安全风险）");
  console.log("❌ ADMIN_2FA_REQUIRED: 已禁用（必须启用）");
} else {
  console.log("✅ ADMIN_2FA_REQUIRED: 已启用或使用默认值");
}

if (enableCppRunner === "true") {
  checks.critical.push("ENABLE_CPP_RUNNER 被启用（安全风险）");
  console.log("❌ ENABLE_CPP_RUNNER: 已启用（必须禁用）");
} else {
  console.log("✅ ENABLE_CPP_RUNNER: 已禁用或使用默认值");
}

// 6. Redis 配置
console.log("\n🔴 Redis 配置");
console.log("-".repeat(60));
const redisUrl = envValue("REDIS_URL");
const enableRedis = envValue("ENABLE_REDIS_RATE_LIMITS");

if (enableRedis === "true" && !redisUrl) {
  checks.recommended.push("启用了 Redis 但未配置 REDIS_URL");
  console.log("⚠️  ENABLE_REDIS_RATE_LIMITS: true");
  console.log("⚠️  REDIS_URL: 未配置");
  console.log("   建议: 使用 Upstash Redis 或设置 ENABLE_REDIS_RATE_LIMITS=false");
} else if (enableRedis === "false") {
  console.log("ℹ️  Redis: 已禁用（使用内存限流）");
} else if (redisUrl) {
  if (redisUrl.includes("localhost") || redisUrl.includes("127.0.0.1")) {
    checks.recommended.push("REDIS_URL 指向本地，生产环境不可用");
    console.log("⚠️  REDIS_URL: 指向本地（生产环境不可用）");
  } else {
    console.log("✅ REDIS_URL: 已配置");
  }
}

// 7. AI 功能（可选）
console.log("\n🤖 AI 功能（可选）");
console.log("-".repeat(60));
const aiApiKey = envValue("AI_API_KEY");
if (!aiApiKey) {
  console.log("ℹ️  AI_API_KEY: 未配置（AI 功能将不可用）");
  checks.optional.push("AI 功能未配置");
} else {
  console.log("✅ AI_API_KEY: 已配置");
}

// 8. GitHub Token（可选）
console.log("\n🐙 GitHub Token（可选）");
console.log("-".repeat(60));
const githubToken = envValue("GITHUB_READ_TOKEN");
if (!githubToken) {
  console.log("ℹ️  GITHUB_READ_TOKEN: 未配置（仓库分析功能受限）");
  checks.optional.push("GitHub 仓库分析功能未配置");
} else {
  console.log("✅ GITHUB_READ_TOKEN: 已配置");
}

// 9. 管理员初始化
console.log("\n👤 管理员账号初始化");
console.log("-".repeat(60));
const seedAdminEmail = envValue("SEED_ADMIN_EMAIL");
const seedAdminPassword = envValue("SEED_ADMIN_PASSWORD");

if (!seedAdminEmail || !seedAdminPassword) {
  checks.recommended.push("未配置管理员初始化（首次登录需要手动创建）");
  console.log("⚠️  SEED_ADMIN_EMAIL/PASSWORD: 未配置");
  console.log("   建议: 配置后运行 npm run db:seed 创建管理员");
} else {
  console.log("✅ 管理员初始化: 已配置");
  if (seedAdminPassword.length < 16) {
    checks.recommended.push("管理员密码太短（建议至少 16 位）");
    console.log("⚠️  密码长度: 建议至少 16 位");
  }
}

// 总结
console.log("\n" + "=".repeat(60));
console.log("📋 检查总结");
console.log("=".repeat(60));

if (checks.critical.length > 0) {
  console.log("\n🔴 关键问题（必须修复）:");
  checks.critical.forEach((issue, i) => {
    console.log(`  ${i + 1}. ${issue}`);
  });
}

if (checks.recommended.length > 0) {
  console.log("\n⚠️  推荐修复:");
  checks.recommended.forEach((issue, i) => {
    console.log(`  ${i + 1}. ${issue}`);
  });
}

if (checks.optional.length > 0) {
  console.log("\nℹ️  可选配置:");
  checks.optional.forEach((issue, i) => {
    console.log(`  ${i + 1}. ${issue}`);
  });
}

console.log("\n" + "=".repeat(60));
console.log("📚 详细文档:");
console.log("  - 配置清单: PRODUCTION_SETUP_CHECKLIST.md");
console.log("  - 部署指南: VERCEL_DEPLOYMENT_GUIDE.md");
console.log("\n🔧 快速命令:");
console.log("  - 生成新密钥: node scripts/generate-secrets.js");
console.log("  - 运行发布检查: npm run launch:check");
console.log("  - 完整安全检查: npm run security:full");
console.log("=".repeat(60));

if (checks.critical.length > 0) {
  console.log("\n❌ 发现 " + checks.critical.length + " 个关键问题，请修复后再部署");
  process.exit(1);
} else if (checks.recommended.length > 0) {
  console.log("\n⚠️  发现 " + checks.recommended.length + " 个推荐修复项");
  console.log("可以部署，但建议先修复这些问题");
  process.exit(0);
} else {
  console.log("\n✅ 所有关键配置检查通过！可以部署到生产环境");
  process.exit(0);
}
