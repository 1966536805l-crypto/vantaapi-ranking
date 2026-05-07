import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, setAuthCookie, signAuthToken, validatePassword } from "@/lib/auth";
import { guardedJson, readJsonBody } from "@/lib/api-guard";
import { auditEvent, hashAuditSubject } from "@/lib/audit";
import { validateHumanFormSignals } from "@/lib/bot-protection";
import { checkRateLimitAsync, getRateLimitKey } from "@/lib/security";
import { verifyTurnstileToken } from "@/lib/turnstile";

export async function POST(request: NextRequest) {
  const rateLimit = await checkRateLimitAsync(`register:${getRateLimitKey(request)}`, 5, 60 * 60_000);
  if (!rateLimit.allowed) {
    auditEvent(request, "auth.register", "blocked", { reason: "rate-limit" });
    return NextResponse.json(
      { message: "尝试次数过多，请稍后再试" },
      {
        status: 429,
        headers: {
          "Cache-Control": "no-store",
          "Retry-After": String(Math.ceil((rateLimit.resetTime - Date.now()) / 1000)),
        },
      }
    );
  }

  if (process.env.ENABLE_PUBLIC_REGISTRATION !== "true") {
    auditEvent(request, "auth.register", "blocked", { reason: "public-registration-disabled" });
    return guardedJson({ message: "公开注册暂未开放" }, { status: 403 });
  }

  const parsedBody = await readJsonBody<Record<string, unknown>>(request, 8 * 1024);
  if (!parsedBody.ok) return parsedBody.response;

  const body = parsedBody.body;
  const humanSignals = validateHumanFormSignals(body);
  if (!humanSignals.ok) {
    auditEvent(request, "auth.register", "blocked", { reason: humanSignals.reason });
    return guardedJson({ message: "请求被安全策略拦截" }, { status: 403 });
  }

  const turnstile = await verifyTurnstileToken(request, String(body.turnstileToken || ""));
  if (!turnstile.success) {
    auditEvent(request, "auth.register", "blocked", { reason: turnstile.reason || "turnstile-failed" });
    return guardedJson({ message: "人机验证失败，请刷新后重试" }, { status: 403 });
  }

  const email = String(body?.email || "").trim().toLowerCase();
  const password = String(body?.password || "");
  const name = String(body?.name || "").trim() || null;

  if (!email || !password) return guardedJson({ message: "邮箱和密码不能为空" }, { status: 400 });
  if (!/^\S+@\S+\.\S+$/.test(email)) return guardedJson({ message: "邮箱格式不正确" }, { status: 400 });

  const passwordCheck = validatePassword(password);
  if (!passwordCheck.valid) return guardedJson({ message: passwordCheck.message }, { status: 400 });

  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) {
    auditEvent(request, "auth.register", "failure", { reason: "duplicate-email", emailHash: hashAuditSubject(email) });
    return guardedJson({ message: "该邮箱已注册" }, { status: 409 });
  }

  const user = await prisma.user.create({
    data: { email, name, passwordHash: await hashPassword(password), role: "USER" },
    select: { id: true, email: true, name: true, role: true },
  });

  auditEvent(request, "auth.register", "success", { userId: user.id, role: user.role });
  const response = guardedJson({ user }, { status: 201 });
  setAuthCookie(response, signAuthToken({ userId: user.id, role: user.role }));
  return response;
}
