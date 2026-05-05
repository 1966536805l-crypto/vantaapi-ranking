#!/usr/bin/env node

/**
 * 生成安全的密钥和 Token
 * 使用方法: node scripts/generate-secrets.js
 */

// eslint-disable-next-line @typescript-eslint/no-require-imports
const crypto = require('crypto');

function generateSecret(length = 64) {
  return crypto.randomBytes(length).toString('base64').slice(0, length);
}

function generateHex(bytes = 32) {
  return crypto.randomBytes(bytes).toString('hex');
}

console.log('🔐 生成安全密钥\n');
console.log('复制以下内容到 .env 文件：\n');
console.log('# 生成时间:', new Date().toISOString());
console.log('# ⚠️  请妥善保管这些密钥，不要提交到 Git\n');

console.log('# JWT 密钥（用于用户认证）');
console.log(`JWT_SECRET="${generateSecret(64)}"`);
console.log('');

console.log('# 加密密钥（用于敏感数据加密）');
console.log(`ENCRYPTION_KEY="${generateHex(32)}"`);
console.log('');

console.log('# 管理员 Token（用于管理员 API）');
console.log(`ADMIN_TOKEN="${generateSecret(48)}"`);
console.log('');

console.log('# Redis 密码');
console.log(`REDIS_PASSWORD="${generateSecret(32)}"`);
console.log('');

console.log('# Session Secret（用于会话管理）');
console.log(`SESSION_SECRET="${generateSecret(64)}"`);
console.log('');

console.log('# CSRF Secret（用于 CSRF 保护）');
console.log(`CSRF_SECRET="${generateHex(32)}"`);
console.log('');

console.log('✅ 密钥生成完成！');
console.log('\n⚠️  安全提示：');
console.log('1. 立即将这些密钥添加到生产环境');
console.log('2. 不要将 .env 文件提交到 Git');
console.log('3. 定期更换密钥（建议每6个月）');
console.log('4. 使用密钥管理服务（如 AWS Secrets Manager）');
