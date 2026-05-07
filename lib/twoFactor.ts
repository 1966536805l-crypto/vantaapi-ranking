import speakeasy from "speakeasy";
import QRCode from "qrcode";
import { decrypt, encrypt } from "@/lib/encryption";

export function generate2FASecret(email: string) {
  const secret = speakeasy.generateSecret({
    name: `JinMing Lab (${email})`,
    issuer: "JinMing Lab",
  });

  return {
    secret: secret.base32,
    encryptedSecret: encrypt(secret.base32),
    otpauthUrl: secret.otpauth_url,
  };
}

export async function generate2FAQRCode(otpauthUrl: string): Promise<string> {
  return QRCode.toDataURL(otpauthUrl);
}

export function verify2FAToken(secret: string, token: string): boolean {
  if (!/^\d{6}$/.test(token)) return false;
  return speakeasy.totp.verify({
    secret,
    encoding: "base32",
    token,
    window: 1,
  });
}

export function verifyEncrypted2FAToken(encryptedSecret: string | null | undefined, token: string): boolean {
  if (!encryptedSecret) return false;
  try {
    return verify2FAToken(decrypt(encryptedSecret), token);
  } catch {
    return false;
  }
}
