import { NextRequest, NextResponse } from "next/server";
import { verifyAdminToken } from "@/lib/auth";
import { generate2FASecret, generate2FAQRCode } from "@/lib/twoFactor";
import { prisma } from "@/lib/prisma";
import { encrypt } from "@/lib/encryption";

export async function POST(request: NextRequest) {
  try {
    const admin = await verifyAdminToken(request);
    if (!admin) {
      return NextResponse.json({ message: "无权限" }, { status: 403 });
    }

    const { secret, otpauthUrl } = generate2FASecret(admin.email);
    const qrCode = await generate2FAQRCode(otpauthUrl!);

    await prisma.user.update({
      where: { id: admin.id },
      data: { twoFactorSecret: encrypt(secret) },
    });

    return NextResponse.json({ qrCode, secret });
  } catch (error) {
    return NextResponse.json(
      { message: "生成2FA失败" },
      { status: 500 }
    );
  }
}
