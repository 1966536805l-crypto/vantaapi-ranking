import { NextRequest, NextResponse } from "next/server";
import { verifyAdminToken } from "@/lib/auth";
import { verify2FAToken } from "@/lib/twoFactor";
import { prisma } from "@/lib/prisma";
import { decrypt } from "@/lib/encryption";
import { logAudit } from "@/lib/redis";

export async function POST(request: NextRequest) {
  try {
    const admin = await verifyAdminToken(request);
    if (!admin) {
      return NextResponse.json({ message: "无权限" }, { status: 403 });
    }

    const body = await request.json();
    const { token } = body;

    if (!admin.twoFactorSecret) {
      return NextResponse.json(
        { message: "未设置2FA" },
        { status: 400 }
      );
    }

    const secret = decrypt(admin.twoFactorSecret);
    const valid = verify2FAToken(secret, token);

    if (!valid) {
      await logAudit({
        userId: admin.id,
        action: "2fa_verify_failed",
        resource: "auth",
        ip: request.headers.get("x-forwarded-for") || "unknown",
      });

      return NextResponse.json(
        { message: "验证码错误" },
        { status: 401 }
      );
    }

    await prisma.user.update({
      where: { id: admin.id },
      data: { twoFactorEnabled: true },
    });

    await logAudit({
      userId: admin.id,
      action: "2fa_enabled",
      resource: "auth",
      ip: request.headers.get("x-forwarded-for") || "unknown",
    });

    return NextResponse.json({ message: "2FA已启用" });
  } catch (error) {
    return NextResponse.json(
      { message: "验证失败" },
      { status: 500 }
    );
  }
}
