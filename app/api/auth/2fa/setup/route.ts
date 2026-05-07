import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { guardedJson, requireCsrf } from "@/lib/api-guard";
import { generate2FAQRCode, generate2FASecret } from "@/lib/twoFactor";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const { user, response } = await requireAdmin(request, { allowUnverified2FA: true });
  if (response) return response;
  const csrfBlocked = requireCsrf(request);
  if (csrfBlocked) return csrfBlocked;

  const generated = generate2FASecret(user!.email);
  if (!generated.otpauthUrl) return guardedJson({ message: "2FA setup failed" }, { status: 500 });
  await prisma.user.update({
    where: { id: user!.id },
    data: { twoFactorSecret: generated.encryptedSecret, twoFactorEnabled: false, twoFactorConfirmedAt: null },
  });

  return guardedJson({
    otpauthUrl: generated.otpauthUrl,
    qrCode: await generate2FAQRCode(generated.otpauthUrl),
    message: "Scan the QR code, then call /api/auth/2fa/verify with a 6 digit code to enable 2FA.",
  });
}
