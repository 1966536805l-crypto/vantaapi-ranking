import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { setAuthCookie, signAuthToken, verifyPassword } from "@/lib/auth";
import { guardedJson, readJsonBody } from "@/lib/api-guard";
import { auditEvent, hashAuditSubject } from "@/lib/audit";
import { validateHumanFormSignals } from "@/lib/bot-protection";
import { checkRateLimitAsync, getEmailRateLimitKey, getRateLimitKey } from "@/lib/security";
import { verifyTurnstileToken } from "@/lib/turnstile";
import { verifyEncrypted2FAToken } from "@/lib/twoFactor";

function rateLimitResponse(retryAfterSeconds: number) {
  return NextResponse.json(
    { message: "尝试次数过多，请稍后再试" },
    {
      status: 429,
      headers: {
        "Cache-Control": "no-store",
        "Retry-After": String(retryAfterSeconds),
      },
    }
  );
}

export async function POST(request: NextRequest) {
  const ipLimit = await checkRateLimitAsync(`login:ip:${getRateLimitKey(request)}`, 30, 15 * 60_000);
  if (!ipLimit.allowed) {
    auditEvent(request, "auth.login", "blocked", { reason: "ip-rate-limit" });
    return rateLimitResponse(Math.ceil((ipLimit.resetTime - Date.now()) / 1000));
  }

  const parsedBody = await readJsonBody<Record<string, unknown>>(request, 8 * 1024);
  if (!parsedBody.ok) return parsedBody.response;

  const body = parsedBody.body;
  const humanSignals = validateHumanFormSignals(body);
  if (!humanSignals.ok) {
    auditEvent(request, "auth.login", "blocked", { reason: humanSignals.reason });
    return guardedJson({ message: "请求被安全策略拦截" }, { status: 403 });
  }

  const turnstile = await verifyTurnstileToken(request, String(body.turnstileToken || ""));
  if (!turnstile.success) {
    auditEvent(request, "auth.login", "blocked", { reason: turnstile.reason || "turnstile-failed" });
    return guardedJson({ message: "人机验证失败，请刷新后重试" }, { status: 403 });
  }

  const email = String(body?.email || "").trim().toLowerCase();
  const password = String(body?.password || "");

  if (!email || !password) return guardedJson({ message: "邮箱和密码不能为空" }, { status: 400 });

  const emailLimit = await checkRateLimitAsync(`login:email:${getEmailRateLimitKey(request, email)}`, 8, 15 * 60_000);
  if (!emailLimit.allowed) {
    auditEvent(request, "auth.login", "blocked", { reason: "email-rate-limit", emailHash: hashAuditSubject(email) });
    return rateLimitResponse(Math.ceil((emailLimit.resetTime - Date.now()) / 1000));
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    auditEvent(request, "auth.login", "failure", { emailHash: hashAuditSubject(email) });
    return guardedJson({ message: "邮箱或密码错误" }, { status: 401 });
  }

  if (user.role === "ADMIN" && user.twoFactorEnabled) {
    const twoFactorCode = String(body?.twoFactorCode || body?.totp || "").trim();
    if (!verifyEncrypted2FAToken(user.twoFactorSecret, twoFactorCode)) {
      auditEvent(request, "auth.login", "failure", { userId: user.id, reason: "bad-2fa" });
      return guardedJson({ message: "2FA 验证码不正确" }, { status: 401 });
    }
  }

  auditEvent(request, "auth.login", "success", { userId: user.id, role: user.role, twoFactorEnabled: user.twoFactorEnabled });
  const response = guardedJson({ user: { id: user.id, email: user.email, name: user.name, role: user.role, twoFactorEnabled: user.twoFactorEnabled } });
  setAuthCookie(response, signAuthToken({ userId: user.id, role: user.role }));
  return response;
}
