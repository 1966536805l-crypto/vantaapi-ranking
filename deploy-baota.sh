#!/bin/bash
# VantaAPI 安全加固部署脚本 - 宝塔面板版本
# 使用方法：在宝塔终端逐步执行以下命令

echo "=== VantaAPI 安全加固部署脚本 ==="
echo ""

# ============================================
# 第一步：确认项目路径和上传代码
# ============================================
echo "【步骤 1】确认项目路径"
echo "请先确认你的项目路径，例如："
echo "  /www/wwwroot/vantaapi-ranking"
echo ""
echo "如果项目还没上传到服务器，请先通过以下方式之一上传："
echo "  1. 宝塔面板 -> 文件 -> 上传"
echo "  2. Git: git clone <你的仓库地址>"
echo "  3. FTP/SFTP 上传"
echo ""
read -p "请输入项目完整路径: " PROJECT_PATH

if [ ! -d "$PROJECT_PATH" ]; then
    echo "错误：目录不存在，请先上传项目代码"
    exit 1
fi

cd "$PROJECT_PATH" || exit 1
echo "✓ 已进入项目目录: $PROJECT_PATH"
echo ""

# ============================================
# 第二步：检查 Node.js 环境
# ============================================
echo "【步骤 2】检查 Node.js 环境"
node -v
npm -v

if [ $? -ne 0 ]; then
    echo "错误：Node.js 未安装，请在宝塔面板安装 Node.js"
    echo "路径：软件商店 -> 运行环境 -> Node 版本管理器"
    exit 1
fi
echo "✓ Node.js 环境正常"
echo ""

# ============================================
# 第三步：配置环境变量
# ============================================
echo "【步骤 3】配置环境变量"
echo "正在生成 .env 文件..."

# 生成随机 JWT Secret
JWT_SECRET=$(openssl rand -base64 48 | tr -d '\n')

cat > .env << EOF
DATABASE_URL="mysql://vantaapi:VantaAPI2026!Secure@127.0.0.1:3306/vantaapi"
JWT_SECRET="$JWT_SECRET"
NODE_ENV="production"
EOF

echo "✓ .env 文件已创建"
echo "✓ JWT_SECRET 已自动生成"
echo ""

# ============================================
# 第四步：安装依赖
# ============================================
echo "【步骤 4】安装项目依赖"
echo "这可能需要几分钟..."
npm install --production

if [ $? -ne 0 ]; then
    echo "错误：依赖安装失败"
    exit 1
fi
echo "✓ 依赖安装完成"
echo ""

# ============================================
# 第五步：数据库迁移
# ============================================
echo "【步骤 5】执行数据库迁移"
echo "正在创建新表（User, Report）..."

npx prisma migrate deploy

if [ $? -ne 0 ]; then
    echo "警告：数据库迁移失败，可能需要手动执行"
    echo "请检查数据库连接是否正常"
    read -p "是否继续？(y/n) " CONTINUE
    if [ "$CONTINUE" != "y" ]; then
        exit 1
    fi
fi

npx prisma generate
echo "✓ 数据库迁移完成"
echo ""

# ============================================
# 第六步：创建管理员账户
# ============================================
echo "【步骤 6】创建管理员账户"
read -p "请输入管理员用户名 (默认: admin): " ADMIN_USERNAME
ADMIN_USERNAME=${ADMIN_USERNAME:-admin}

read -sp "请输入管理员密码 (至少12位): " ADMIN_PASSWORD
echo ""

if [ ${#ADMIN_PASSWORD} -lt 12 ]; then
    echo "错误：密码长度必须至少12位"
    exit 1
fi

read -p "请输入管理员邮箱: " ADMIN_EMAIL

# 使用 Node.js 生成 bcrypt hash
HASHED_PASSWORD=$(node -e "
const bcrypt = require('bcryptjs');
bcrypt.hash('$ADMIN_PASSWORD', 12, (err, hash) => {
    if (err) {
        console.error('密码加密失败');
        process.exit(1);
    }
    console.log(hash);
});
")

# 插入管理员账户
mysql -u vantaapi -p'VantaAPI2026!Secure' vantaapi << EOSQL
INSERT INTO Admin (id, username, password, email, createdAt, updatedAt)
VALUES (
    UUID(),
    '$ADMIN_USERNAME',
    '$HASHED_PASSWORD',
    '$ADMIN_EMAIL',
    NOW(),
    NOW()
)
ON DUPLICATE KEY UPDATE
    password = '$HASHED_PASSWORD',
    email = '$ADMIN_EMAIL',
    updatedAt = NOW();
EOSQL

if [ $? -eq 0 ]; then
    echo "✓ 管理员账户创建成功"
else
    echo "警告：管理员账户创建失败，可能需要手动创建"
fi
echo ""

# ============================================
# 第七步：构建项目
# ============================================
echo "【步骤 7】构建生产版本"
npm run build

if [ $? -ne 0 ]; then
    echo "错误：项目构建失败"
    exit 1
fi
echo "✓ 项目构建完成"
echo ""

# ============================================
# 第八步：配置 PM2
# ============================================
echo "【步骤 8】配置 PM2 进程管理"

# 检查 PM2 是否安装
if ! command -v pm2 &> /dev/null; then
    echo "PM2 未安装，正在安装..."
    npm install -g pm2
fi

# 停止旧进程（如果存在）
pm2 delete vantaapi-ranking 2>/dev/null || true

# 启动新进程
pm2 start npm --name "vantaapi-ranking" -- start
pm2 save
pm2 startup

echo "✓ PM2 配置完成"
echo ""

# ============================================
# 第九步：配置 Nginx（如果需要）
# ============================================
echo "【步骤 9】Nginx 配置"
echo "如果你使用 Nginx 反向代理，请在宝塔面板配置："
echo ""
echo "1. 网站 -> 添加站点 -> 填写域名"
echo "2. 设置 -> 反向代理 -> 添加反向代理"
echo "   代理名称: vantaapi"
echo "   目标URL: http://127.0.0.1:3000"
echo "   发送域名: \$host"
echo ""
echo "3. SSL -> Let's Encrypt -> 申请证书"
echo ""

# ============================================
# 完成
# ============================================
echo "=========================================="
echo "✓ 部署完成！"
echo "=========================================="
echo ""
echo "管理员信息："
echo "  用户名: $ADMIN_USERNAME"
echo "  邮箱: $ADMIN_EMAIL"
echo "  密码: (你刚才输入的密码)"
echo ""
echo "JWT Secret: $JWT_SECRET"
echo "(已保存在 .env 文件中)"
echo ""
echo "下一步："
echo "1. 访问你的网站测试功能"
echo "2. 使用管理员账户登录后台"
echo "3. 检查安全响应头: https://securityheaders.com"
echo "4. 配置 HTTPS（强烈推荐）"
echo ""
echo "常用命令："
echo "  查看日志: pm2 logs vantaapi-ranking"
echo "  重启服务: pm2 restart vantaapi-ranking"
echo "  停止服务: pm2 stop vantaapi-ranking"
echo ""
