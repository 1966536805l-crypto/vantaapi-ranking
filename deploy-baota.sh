#!/usr/bin/env bash
# VantaAPI MVP deployment helper for BaoTa / Linux servers.
# Safe defaults: no hard-coded database password, no legacy Admin table SQL.

set -euo pipefail

APP_NAME="vantaapi-ranking"
DEFAULT_ALLOWED_HOSTS="vantaapi.com,www.vantaapi.com"

echo "=== VantaAPI MVP 安全部署脚本（宝塔版） ==="
echo "本脚本会读取/生成 .env，并通过 prisma seed 按需创建 User(role=ADMIN)。"
echo "不会写入固定数据库密码，也不会操作旧 Admin 表。"
echo ""

require_command() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "错误：未找到命令 $1，请先安装后重试。" >&2
    exit 1
  fi
}

escape_sed_replacement() {
  printf '%s' "$1" | sed -e 's/[\\&]/\\&/g'
}

set_env_var() {
  local key="$1"
  local value="$2"
  local escaped
  escaped=$(escape_sed_replacement "$value")

  if [ -f .env ] && grep -q "^${key}=" .env; then
    sed -i.bak "s|^${key}=.*|${key}=\"${escaped}\"|" .env
  else
    printf '%s="%s"\n' "$key" "$value" >> .env
  fi
}

read_secret() {
  local prompt="$1"
  local var
  read -r -s -p "$prompt" var
  echo "" >&2
  printf '%s' "$var"
}

validate_strong_password() {
  local password="$1"
  if [ ${#password} -lt 12 ] || \
     ! [[ "$password" =~ [A-Z] ]] || \
     ! [[ "$password" =~ [a-z] ]] || \
     ! [[ "$password" =~ [0-9] ]] || \
     ! [[ "$password" =~ [^A-Za-z0-9] ]]; then
    echo "错误：密码至少 12 位，并包含大小写字母、数字和特殊字符。" >&2
    exit 1
  fi
}

echo "【步骤 1】确认项目路径"
read -r -p "请输入项目完整路径（例如 /www/wwwroot/vantaapi-ranking）: " PROJECT_PATH

if [ ! -d "$PROJECT_PATH" ]; then
  echo "错误：目录不存在，请先上传或 git clone 项目代码。" >&2
  exit 1
fi

cd "$PROJECT_PATH"
echo "✓ 已进入项目目录: $PROJECT_PATH"
echo ""

echo "【步骤 2】检查运行环境"
require_command node
require_command npm
require_command openssl
node -v
npm -v
echo "✓ Node.js 环境正常"
echo ""

echo "【步骤 3】配置 .env"
if [ ! -f .env ]; then
  touch .env
  chmod 600 .env || true
fi

if ! grep -q '^DATABASE_URL=' .env; then
  echo "请输入生产数据库连接，不要使用示例密码。"
  echo "格式示例：mysql://db_user:强随机密码@127.0.0.1:3306/vantaapi"
  DATABASE_URL=$(read_secret "DATABASE_URL: ")
  if ! [[ "$DATABASE_URL" =~ ^(mysql|mariadb):// ]]; then
    echo "错误：DATABASE_URL 必须以 mysql:// 或 mariadb:// 开头。" >&2
    exit 1
  fi
  set_env_var DATABASE_URL "$DATABASE_URL"
else
  echo "✓ 检测到现有 DATABASE_URL，将沿用 .env 中的配置。"
fi

if ! grep -q '^JWT_SECRET=' .env; then
  JWT_SECRET=$(openssl rand -base64 48 | tr -d '\n')
  set_env_var JWT_SECRET "$JWT_SECRET"
  echo "✓ 已生成随机 JWT_SECRET"
else
  echo "✓ 检测到现有 JWT_SECRET，将沿用 .env 中的配置。"
fi

set_env_var NODE_ENV production
set_env_var NEXT_TELEMETRY_DISABLED 1
set_env_var ENABLE_PUBLIC_REGISTRATION false
set_env_var AUTH_TURNSTILE_REQUIRED true
set_env_var ENABLE_CPP_RUNNER false
set_env_var ENABLE_REDIS_RATE_LIMITS "${ENABLE_REDIS_RATE_LIMITS:-true}"

if ! grep -q '^APP_ALLOWED_HOSTS=' .env; then
  read -r -p "请输入生产允许访问的域名（默认: ${DEFAULT_ALLOWED_HOSTS}）: " APP_ALLOWED_HOSTS
  APP_ALLOWED_HOSTS=${APP_ALLOWED_HOSTS:-$DEFAULT_ALLOWED_HOSTS}
  set_env_var APP_ALLOWED_HOSTS "$APP_ALLOWED_HOSTS"
fi

echo "✓ .env 已更新。请确认 REDIS_URL、Turnstile key 等生产变量也已按需配置。"
echo ""

echo "【步骤 4】安装依赖"
if [ -f package-lock.json ]; then
  npm ci
else
  npm install
fi
echo "✓ 依赖安装完成"
echo ""

echo "【步骤 5】数据库迁移与 Prisma Client"
npx prisma migrate deploy
npx prisma generate
echo "✓ 数据库迁移完成"
echo ""

echo "【步骤 6】可选：创建/确认管理员账户（User.role=ADMIN）"
read -r -p "是否现在通过 SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD 创建管理员？(y/N): " CREATE_ADMIN
if [[ "${CREATE_ADMIN}" =~ ^[Yy]$ ]]; then
  read -r -p "管理员邮箱: " SEED_ADMIN_EMAIL
  SEED_ADMIN_PASSWORD=$(read_secret "管理员密码（至少12位，含大小写/数字/特殊字符）: ")
  validate_strong_password "$SEED_ADMIN_PASSWORD"

  set_env_var SEED_ADMIN_EMAIL "$SEED_ADMIN_EMAIL"
  set_env_var SEED_ADMIN_PASSWORD "$SEED_ADMIN_PASSWORD"
  npm run db:seed
  echo "✓ 管理员 seed 已执行。管理员保存在 User 表，role=ADMIN。"
  echo "安全提醒：部署完成后建议从 .env 移除 SEED_ADMIN_PASSWORD，避免长期保存明文初始密码。"
else
  echo "跳过管理员创建。之后可手动设置 SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD 后执行：npm run db:seed"
fi
echo ""

echo "【步骤 7】构建生产版本"
npm run build
echo "✓ 项目构建完成"
echo ""

echo "【步骤 8】配置 PM2"
if ! command -v pm2 >/dev/null 2>&1; then
  echo "PM2 未安装，正在安装..."
  npm install -g pm2
fi

pm2 delete "$APP_NAME" 2>/dev/null || true
pm2 start npm --name "$APP_NAME" -- start
pm2 save
pm2 startup || true
echo "✓ PM2 配置完成"
echo ""

echo "【步骤 9】Nginx / 宝塔反向代理提示"
echo "- 反向代理目标：http://127.0.0.1:3000"
echo "- 只开放 80/443；不要开放 3000、3306、Redis、PM2 面板。"
echo "- 生产建议 APP_ALLOWED_HOSTS 只写正式域名，不包含临时预览域名。"
echo ""

echo "=========================================="
echo "✓ 部署完成"
echo "=========================================="
echo "下一步："
echo "1. 检查 /login、/dashboard、/admin 是否正常。"
echo "2. 查看日志：pm2 logs $APP_NAME"
echo "3. 检查安全响应头：https://securityheaders.com"
echo "4. 确认 ENABLE_CPP_RUNNER=false，公开上线前不要在主站启用 C++ runner。"
