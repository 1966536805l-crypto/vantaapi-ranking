# 安全加固部署说明

## 已完成的安全措施

### 1. ✅ 数据库内网访问
- `.env` 已更新为 `127.0.0.1`（需要在服务器上部署后生效）
- **重要**：确保云服务器防火墙已关闭 3306 端口

### 2. ✅ 内容审核机制
- 用户提交的内容默认状态为 `pending`（待审核）
- 只有 `approved` 状态的内容才会在前端展示
- 管理员审核接口：`/api/admin/rankings`

### 3. ✅ XSS 防护
- 增强的 `sanitizeInput()` 函数，过滤所有危险标签和属性
- 移除 `<script>`, `<iframe>`, `<object>`, `<embed>` 等标签
- 移除所有事件处理器（`onclick`, `onerror` 等）
- 移除危险协议（`javascript:`, `data:`, `vbscript:`）
- URL 验证只允许 `http://` 和 `https://`

### 4. ✅ 安全响应头
- `X-Frame-Options: DENY` - 防止点击劫持
- `X-Content-Type-Options: nosniff` - 防止 MIME 类型嗅探
- `X-XSS-Protection: 1; mode=block` - 启用浏览器 XSS 过滤
- `Strict-Transport-Security` - 强制 HTTPS（HSTS）
- `Content-Security-Policy` - 完整的 CSP 策略
- `Permissions-Policy` - 禁用不必要的浏览器功能

### 5. ✅ 用户认证系统
- 用户注册接口：`/api/auth/register`
- 用户登录接口：`/api/auth/login`
- 投稿必须登录（JWT token 验证）
- 密码强度验证（至少12位，包含大小写、数字、特殊字符）
- 密码使用 bcrypt 加密（12轮）

### 6. ✅ 频率限制（Rate Limiting）
- 投稿接口：5次/分钟
- 登录接口：5次/5分钟
- 注册接口：3次/小时
- 举报接口：3次/小时
- 登录失败5次后锁定15分钟

### 7. ✅ 管理员后台安全
- 强密码策略（12位以上，复杂度要求）
- 登录失败锁定机制
- JWT token 认证（24小时过期）
- 管理员登录接口：`/api/admin/login`
- 管理员审核接口：`/api/admin/rankings`

### 8. ✅ 举报功能
- 举报接口：`/api/report`
- 支持多种举报类型：ranking, spam, illegal, copyright, other
- 记录举报者 IP 和邮箱（可选）
- 承诺24小时内处理

### 9. ✅ 隐私政策
- 隐私政策页面：`/privacy`
- 详细说明数据收集、使用、保存、删除方式
- 联系邮箱：privacy@vantaapi.com

---

## 🚀 部署步骤

### 在服务器上执行以下操作：

#### 1. 上传代码到服务器
```bash
# 使用 git 或 scp 上传代码
git pull origin main
# 或
scp -r ./vantaapi-ranking user@server:/path/to/project
```

#### 2. 安装依赖
```bash
cd /path/to/vantaapi-ranking
npm install
```

#### 3. 配置环境变量
```bash
# 编辑 .env 文件
nano .env
```

确保包含以下内容：
```env
DATABASE_URL="mysql://vantaapi:VantaAPI2026!Secure@127.0.0.1:3306/vantaapi"
JWT_SECRET="VantaAPI-JWT-Secret-2026-Change-This-In-Production-Min-32-Chars"
NODE_ENV="production"
```

**重要**：请修改 `JWT_SECRET` 为一个随机的强密码（至少32位）

#### 4. 运行数据库迁移
```bash
npx prisma migrate deploy
# 或者如果是开发环境
npx prisma migrate dev
```

#### 5. 生成 Prisma Client
```bash
npx prisma generate
```

#### 6. 创建管理员账户
```bash
# 使用 Prisma Studio 或直接插入数据库
npx prisma studio
# 或使用 SQL
```

创建管理员的 SQL（密码需要先用 bcrypt 加密）：
```sql
-- 注意：这里的密码是 "AdminPassword123!" 的 bcrypt hash
INSERT INTO Admin (id, username, password, email, createdAt, updatedAt)
VALUES (
  'admin001',
  'admin',
  '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYIeWEgKK3q',
  'admin@vantaapi.com',
  NOW(),
  NOW()
);
```

**重要**：请使用强密码并通过 bcrypt 加密后再插入！

#### 7. 构建项目
```bash
npm run build
```

#### 8. 启动服务
```bash
# 使用 PM2（推荐）
pm2 start npm --name "vantaapi-ranking" -- start
pm2 save

# 或直接启动
npm start
```

#### 9. 配置 Nginx 反向代理（如果使用）
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;
    }
}
```

#### 10. 配置 HTTPS（强烈推荐）
```bash
# 使用 Let's Encrypt
certbot --nginx -d your-domain.com
```

---

## 📋 验证清单

部署完成后，请验证以下项目：

- [ ] 数据库只能从 127.0.0.1 访问
- [ ] 云防火墙已关闭 3306 端口
- [ ] 网站使用 HTTPS
- [ ] 用户注册功能正常
- [ ] 用户登录功能正常
- [ ] 未登录用户无法提交内容
- [ ] 提交的内容默认为待审核状态
- [ ] 管理员可以登录后台
- [ ] 管理员可以审核内容
- [ ] 举报功能正常
- [ ] 隐私政策页面可访问
- [ ] 安全响应头已生效（使用 https://securityheaders.com 检查）

---

## 🔐 安全建议

1. **定期更新依赖**
   ```bash
   npm audit
   npm update
   ```

2. **监控日志**
   - 定期检查异常登录尝试
   - 监控举报记录
   - 关注频繁的 429 错误（可能是攻击）

3. **备份数据库**
   ```bash
   # 每天自动备份
   mysqldump -u vantaapi -p vantaapi > backup_$(date +%Y%m%d).sql
   ```

4. **修改默认密码**
   - 修改 JWT_SECRET
   - 修改管理员密码
   - 修改数据库密码（如果使用默认密码）

5. **启用 2FA（未来改进）**
   - 考虑为管理员账户添加两步验证

---

## 📞 联系方式

如有问题，请联系：
- 技术支持：support@vantaapi.com
- 隐私问题：privacy@vantaapi.com
- 举报邮箱：report@vantaapi.com

---

## 📝 数据库迁移文件

新增的数据库表：

1. **User** - 普通用户表
   - id, email, password, username, createdAt, updatedAt

2. **Report** - 举报记录表
   - id, type, targetId, reason, description, email, status, ipAddress, createdAt, updatedAt

3. **Ranking** 表更新
   - 新增 `userId` 字段（关联用户）
   - `status` 默认值改为 `pending`

---

生成时间：2026-05-05
