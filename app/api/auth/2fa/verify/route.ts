import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { guardedJson, readJsonBody, requireCsrf } from "@/lib/api-guard";
import { verifyEncrypted2FAToken } from "@/lib/twoFactor";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const { user, response } = await requireAdmin(request, { allowUnverified2FA: true });
  if (response) return response;
  const csrfBlocked = requireCsrf(request);
  if (csrfBlocked) return csrfBlocked;

  const parsedBody = await readJsonBody<Record<string, unknown>>(request, 4 * 1024);
  if (!parsedBody.ok) return parsedBody.response;
  const token = String(parsedBody.body?.token || parsedBody.body?.code || "").trim();

  const dbUser = await prisma.user.findUnique({ where: { id: user!.id }, select: { twoFactorSecret: true } });
  if (!dbUser?.twoFactorSecret) return guardedJson({ message: "请先初始化 2FA" }, { status: 400 });
  if (!verifyEncrypted2FAToken(dbUser.twoFactorSecret, token)) return guardedJson({ message: "2FA 验证码不正确" }, { status: 400 });

  await prisma.user.update({
    where: { id: user!.id },
    data: { twoFactorEnabled: true, twoFactorConfirmedAt: new Date() },
  });

  return guardedJson({ ok: true, message: "2FA 已启用" });
}
