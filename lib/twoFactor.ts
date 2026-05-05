import speakeasy from "speakeasy";
import QRCode from "qrcode";

export function generate2FASecret(email: string) {
  const secret = speakeasy.generateSecret({
    name: `Immortal (${email})`,
    issuer: "Immortal",
  });

  return {
    secret: secret.base32,
    otpauthUrl: secret.otpauth_url,
  };
}

export async function generate2FAQRCode(otpauthUrl: string): Promise<string> {
  return await QRCode.toDataURL(otpauthUrl);
}

export function verify2FAToken(secret: string, token: string): boolean {
  return speakeasy.totp.verify({
    secret,
    encoding: "base32",
    token,
    window: 2,
  });
}
