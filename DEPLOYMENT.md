# VantaAPI 部署说明

这份文档只描述当前 Next.js + Prisma + Postgres 生产部署方式。

> 重点：不要使用固定示例密码；当前 Prisma schema 没有 `Admin` 表，管理员是 `User.role = ADMIN`。

---

## 上线结论

- **内测可以上线**：关闭公开注册，开启 Turnstile，保持 C++ runner 关闭。
- **公开上线前**：必须更换强密钥/数据库密码，管理员完成 2FA，运行 `npm run launch:check`、安全检查和生产构建。

---

## 生产环境最低配置

### 必填 `.env`

```env
DATABASE_URL=postgresql://<db_user>:<strong-random-password>@<db_host>:5432/<db_name>?sslmode=require
JWT_SECRET=<generate-a-random-secret-at-least-32-chars>
CSRF_SECRET=<generate-64-hex-chars>
ENCRYPTION_KEY=<generate-64-hex-chars>
AI_API_KEY=<server-side-ai-provider-token>
AI_BASE_URL=https://api.deepseek.com/v1
AI_MODEL=deepseek-chat
GITHUB_READ_TOKEN=<github-read-token>
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
REDIS_RATE_LIMIT_FAIL_CLOSED="true"
ADMIN_2FA_REQUIRED="true"
REDIS_URL="redis://127.0.0.1:6379"
NEXT_PUBLIC_TURNSTILE_SITE_KEY="<your-turnstile-site-key>"
TURNSTILE_SECRET_KEY="<your-turnstile-secret-key>"
```

说明：

- `DATABASE_URL` 必须使用生产 Postgres/Neon 连接串和随机强密码，不要复制任何文档示例密码。
- `JWT_SECRET`、`CSRF_SECRET`、`ENCRYPTION_KEY` 必须在生产环境重新生成；不要沿用 `.env.example` 或旧测试值。
- `AI_API_KEY` 必须是服务器端 AI provider token；不要使用前端/public token。
- `GITHUB_READ_TOKEN` 使用只读最小权限 token，用于 GitHub Repo Analyzer 配额和稳定性。
- `APP_ALLOWED_HOSTS` 生产环境建议只包含正式域名，不要默认放行临时预览域名。
- `ENABLE_CPP_RUNNER` 必须保持 `false`，除非你已经做了 Docker/worker 隔离、禁网络、限 CPU/内存/进程数、只读文件系统和超时强杀。

---

## 部署步骤

### 1. 上传或拉取代码

```bash
cd /www/wwwroot
# 任选一种方式：git clone / git pull / 宝塔文件上传
cd /www/wwwroot/vantaapi
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
pm2 start npm --name "vantaapi" -- start
pm2 save
```

常用命令：

```bash
pm2 logs vantaapi
pm2 restart vantaapi
pm2 stop vantaapi
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
5. 不开放 `3000`、`5432`、Redis、PM2/internal dashboard。

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

详细基线见 `docs/EDGE_SECURITY.md`。生产必须把 DDoS 和大流量 bot 过滤放在 CDN/WAF 层，应用代码只做精准鉴权、CSRF 和限流，避免误伤正常用户。

- SSL/TLS: Full (strict)
- Always Use HTTPS: On
- Automatic HTTPS Rewrites: On
- WAF Managed Rules: On
- OWASP/Core managed rules: 先 log/simulate，确认无误伤后再 block
- Security Level: Medium
- Bot Fight / Managed Challenge: 只针对可疑流量、登录/注册/AI/admin 等高成本入口，不要全站强挑战
- Block probes: `/.env`、`/.git/*`、`/wp-login.php`、`/xmlrpc.php`、`/phpmyadmin/*`
- Origin firewall: 如果自建服务器，源站只允许 CDN/WAF IP 访问 `80/443`，不要公开 `3000`、`5432`、Redis、PM2 dashboard
- Turnstile 接登录/注册，不建议 MVP 阶段给全站页面强上验证码

---

## 部署后验证清单

- [ ] `.env` 没有固定示例密码。
- [ ] `APP_ALLOWED_HOSTS` 只包含正式生产域名。
- [ ] `npm run launch:check` 通过；它会连接生产数据库确认管理员 2FA 状态。
- [ ] 数据库只允许生产应用访问；云防火墙未开放数据库端口到公网。
- [ ] `AI_API_KEY`、`AI_BASE_URL`、`AI_MODEL` 已配置且只存在服务器端。
- [ ] `GITHUB_READ_TOKEN` 已配置为只读最小权限 token。
- [ ] Redis 未暴露公网；如公开上线，已配置 `REDIS_URL` 并开启 `ENABLE_REDIS_RATE_LIMITS=true`。
- [ ] `ENABLE_CPP_RUNNER=false`。
- [ ] 网站使用 HTTPS。
- [ ] `/login`、`/register`（如启用）、`/dashboard` 可正常访问。
- [ ] 管理员账户可登录 `/admin`。
- [ ] 普通用户无法访问 `/admin`。
- [ ] 安全响应头已生效，可用 https://securityheaders.com 检查。

---

## 仍需跟进的上线前安全任务

1. 在生产后台确认所有管理员都已完成 2FA；`npm run launch:check` 会校验数据库状态。
2. 确认 AI provider token 和 GitHub read token 未过期、权限最小化、未暴露到前端。
3. 生产限流接 Redis，不依赖单进程内存 Map。
4. 如未来开放在线 C++ 运行，必须使用隔离 worker，不要在主站机器直接 `spawn("g++")`。

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
