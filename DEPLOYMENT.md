# VantaAPI MVP 安全部署说明

这份文档只描述当前 Next.js + Prisma + MySQL/MariaDB MVP 的部署方式。

> 重点：不要使用固定示例密码；当前 Prisma schema 没有 `Admin` 表，管理员是 `User.role = ADMIN`。

---

## 上线结论

- **内测可以上线**：建议关闭公开注册，开启 Turnstile，保持 C++ runner 关闭。
- **公开上线前**：建议补齐 Redis 限流、管理员 2FA、CSRF token，以及 CSP nonce/hash。

---

## 生产环境最低配置

### 必填 `.env`

```env
DATABASE_URL="mysql://<db_user>:<strong-random-password>@127.0.0.1:3306/<db_name>"
JWT_SECRET="<generate-a-random-secret-at-least-32-chars>"
NODE_ENV="production"
NEXT_TELEMETRY_DISABLED="1"
APP_ALLOWED_HOSTS="vantaapi.com,www.vantaapi.com"
```

生成随机 secret 示例：

```bash
openssl rand -base64 48
```

### 强烈建议的生产安全开关

```env
ENABLE_PUBLIC_REGISTRATION="false"
AUTH_TURNSTILE_REQUIRED="true"
ENABLE_CPP_RUNNER="false"
ENABLE_REDIS_RATE_LIMITS="true"
REDIS_URL="redis://127.0.0.1:6379"
NEXT_PUBLIC_TURNSTILE_SITE_KEY="<your-turnstile-site-key>"
TURNSTILE_SECRET_KEY="<your-turnstile-secret-key>"
```

说明：

- `DATABASE_URL` 必须使用生产随机强密码，不要复制任何文档示例密码。
- `APP_ALLOWED_HOSTS` 生产环境建议只包含正式域名，不要默认放行临时预览域名。
- `ENABLE_CPP_RUNNER` 必须保持 `false`，除非你已经做了 Docker/worker 隔离、禁网络、限 CPU/内存/进程数、只读文件系统和超时强杀。

---

## 部署步骤

### 1. 上传或拉取代码

```bash
cd /www/wwwroot
# 任选一种方式：git clone / git pull / 宝塔文件上传
cd /www/wwwroot/vantaapi-ranking
```

### 2. 安装依赖

```bash
npm ci
# 如果没有 package-lock.json，则使用：npm install
```

### 3. 配置 `.env`

```bash
nano .env
chmod 600 .env
```

按上面的 `.env` 模板填写生产变量。

### 4. 数据库迁移

```bash
npx prisma migrate deploy
npx prisma generate
```

### 5. 创建管理员账户

当前没有 `Admin` 表。管理员账户通过 `User` 表创建，`role` 为 `ADMIN`。

推荐方式：使用现有 seed 脚本，并只在需要创建管理员时设置 seed 环境变量。

```bash
SEED_ADMIN_EMAIL="admin@example.com" \
SEED_ADMIN_PASSWORD="Use-A-Strong-Random-Password-123!" \
SEED_ADMIN_NAME="Admin" \
npm run db:seed
```

密码要求：至少 12 位，包含大小写字母、数字和特殊字符。

安全建议：管理员创建完成后，不要把 `SEED_ADMIN_PASSWORD` 长期保存在服务器 `.env` 里。

### 6. 构建并启动

```bash
npm run build
pm2 start npm --name "vantaapi-ranking" -- start
pm2 save
```

常用命令：

```bash
pm2 logs vantaapi-ranking
pm2 restart vantaapi-ranking
pm2 stop vantaapi-ranking
```

---

## 宝塔一键辅助脚本

仓库内的 `deploy-baota.sh` 已改为安全版：

- 不包含固定数据库密码。
- 不向旧 `Admin` 表插入数据。
- 读取/生成 `.env`。
- 可选使用 `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` 执行 `npm run db:seed` 创建 `User.role=ADMIN` 管理员。

使用方式：

```bash
chmod +x deploy-baota.sh
./deploy-baota.sh
```

---

## Nginx / 宝塔反向代理建议

宝塔面板：

1. 网站 -> 添加站点 -> 填写正式域名。
2. SSL -> Let's Encrypt -> 申请证书。
3. 反向代理目标：`http://127.0.0.1:3000`。
4. 云服务器安全组只开放 `80/tcp` 和 `443/tcp`。
5. 不开放 `3000`、`3306`、Redis、PM2/internal dashboard。

Nginx 示例：

```nginx
server {
    listen 80;
    server_name vantaapi.com www.vantaapi.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name vantaapi.com www.vantaapi.com;

    # ssl_certificate     /path/to/fullchain.pem;
    # ssl_certificate_key /path/to/privkey.pem;

    client_max_body_size 128k;
    server_tokens off;

    add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    location ~ /(?:\.git|\.env|node_modules|package-lock\.json|prisma/dev\.db) {
        deny all;
        return 404;
    }

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## Cloudflare/CDN 建议

- SSL/TLS: Full (strict)
- Always Use HTTPS: On
- Automatic HTTPS Rewrites: On
- WAF Managed Rules: On
- Security Level: Medium
- Bot Fight Mode: On（如果误伤正常用户就关）
- Turnstile 接登录/注册，不建议 MVP 阶段给全站页面强上验证码

---

## 部署后验证清单

- [ ] `.env` 没有固定示例密码。
- [ ] `APP_ALLOWED_HOSTS` 只包含正式生产域名。
- [ ] 数据库只监听/只允许内网访问，云防火墙未开放 3306。
- [ ] Redis 未暴露公网；如公开上线，已配置 `REDIS_URL` 并开启 `ENABLE_REDIS_RATE_LIMITS=true`。
- [ ] `ENABLE_CPP_RUNNER=false`。
- [ ] 网站使用 HTTPS。
- [ ] `/login`、`/register`（如启用）、`/dashboard` 可正常访问。
- [ ] 管理员账户可登录 `/admin`。
- [ ] 普通用户无法访问 `/admin`。
- [ ] 安全响应头已生效，可用 https://securityheaders.com 检查。

---

## 仍需跟进的上线前安全任务

1. 后台和关键写接口接入真正 CSRF token：`/api/admin/*`、`/api/wrong`、`/api/progress`、`/api/quiz/submit`。
2. 启用管理员 2FA，至少先做 admin-only 2FA。
3. 生产限流接 Redis，不依赖单进程内存 Map。
4. CSP 从 `'unsafe-inline'` 逐步迁移到 nonce/hash。
5. 如未来开放在线 C++ 运行，必须使用隔离 worker，不要在主站机器直接 `spawn("g++")`。

---

## 维护建议

```bash
npm run security:check
npm run typecheck
npm run lint
npm audit --audit-level=high
```

数据库备份示例：

```bash
mysqldump -u <db_user> -p <db_name> > backup_$(date +%Y%m%d).sql
```
