import crypto from "crypto";

const DEFAULT_ENCRYPTION_KEY = "default-key-change-in-production-32bytes";
const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;
const SALT_LENGTH = 32;

/**
 * 确保密钥长度为32字节
 */
function getEncryptionKey(): Buffer {
  const configuredKey = process.env.ENCRYPTION_KEY;

  if (
    process.env.NODE_ENV === "production" &&
    (!configuredKey || configuredKey.length < 32)
  ) {
    throw new Error("ENCRYPTION_KEY is required in production");
  }

  const encryptionKey = configuredKey || DEFAULT_ENCRYPTION_KEY;

  if (/^[0-9a-fA-F]{64}$/.test(encryptionKey)) {
    return Buffer.from(encryptionKey, "hex");
  }

  return crypto.scryptSync(encryptionKey, "salt", 32);
}

/**
 * AES-256-GCM 加密
 */
export function encrypt(text: string): string {
  try {
    const iv = crypto.randomBytes(IV_LENGTH);
    const key = getEncryptionKey();
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

    let encrypted = cipher.update(text, "utf8", "hex");
    encrypted += cipher.final("hex");

    const authTag = cipher.getAuthTag();

    return `${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted}`;
  } catch {
    throw new Error("Encryption failed");
  }
}

/**
 * AES-256-GCM 解密
 */
export function decrypt(encryptedData: string): string {
  try {
    const parts = encryptedData.split(":");
    if (parts.length !== 3) {
      throw new Error("Invalid encrypted data format");
    }

    const iv = Buffer.from(parts[0], "hex");
    const authTag = Buffer.from(parts[1], "hex");
    if (authTag.length !== AUTH_TAG_LENGTH) {
      throw new Error("Invalid auth tag length");
    }
    const encrypted = parts[2];

    const key = getEncryptionKey();
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encrypted, "hex", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
  } catch {
    throw new Error("Decryption failed");
  }
}

/**
 * 哈希敏感数据（不可逆）
 */
export function hashSensitiveData(data: string): string {
  return crypto.createHash("sha256").update(data).digest("hex");
}

/**
 * 带盐值的哈希（用于密码等）
 */
export function hashWithSalt(data: string): string {
  const salt = crypto.randomBytes(SALT_LENGTH).toString("hex");
  const hash = crypto
    .pbkdf2Sync(data, salt, 100000, 64, "sha512")
    .toString("hex");
  return `${salt}:${hash}`;
}

/**
 * 验证带盐值的哈希
 */
export function verifyHashWithSalt(data: string, hashedData: string): boolean {
  try {
    const [salt, hash] = hashedData.split(":");
    const verifyHash = crypto
      .pbkdf2Sync(data, salt, 100000, 64, "sha512")
      .toString("hex");
    return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(verifyHash));
  } catch {
    return false;
  }
}

/**
 * 邮箱脱敏
 */
export function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!local || !domain) return "***@***";

  if (local.length <= 2) {
    return `${local[0]}***@${domain}`;
  }

  const visibleChars = Math.min(2, Math.floor(local.length / 3));
  const masked = local.slice(0, visibleChars) + "***" + local.slice(-1);
  return `${masked}@${domain}`;
}

/**
 * 手机号脱敏
 */
export function maskPhone(phone: string): string {
  if (phone.length < 7) return "***";
  return phone.slice(0, 3) + "****" + phone.slice(-4);
}

/**
 * IP 地址脱敏
 */
export function maskIp(ip: string): string {
  const parts = ip.split(".");
  if (parts.length !== 4) return "***";
  return `${parts[0]}.${parts[1]}.*.*`;
}

/**
 * 姓名脱敏
 */
export function maskName(name: string): string {
  if (name.length <= 1) return "*";
  if (name.length === 2) return name[0] + "*";
  return name[0] + "*".repeat(name.length - 2) + name.slice(-1);
}

/**
 * 身份证号脱敏
 */
export function maskIdCard(idCard: string): string {
  if (idCard.length < 8) return "***";
  return idCard.slice(0, 4) + "**********" + idCard.slice(-4);
}

/**
 * 银行卡号脱敏
 */
export function maskBankCard(cardNumber: string): string {
  if (cardNumber.length < 8) return "***";
  return cardNumber.slice(0, 4) + " **** **** " + cardNumber.slice(-4);
}

/**
 * 通用脱敏（保留前后各n个字符）
 */
export function maskGeneric(text: string, keepStart = 2, keepEnd = 2): string {
  if (text.length <= keepStart + keepEnd) {
    return "*".repeat(text.length);
  }
  const masked = "*".repeat(text.length - keepStart - keepEnd);
  return text.slice(0, keepStart) + masked + text.slice(-keepEnd);
}

/**
 * 加密敏感字段（用于数据库存储）
 */
export function encryptSensitiveFields<T extends Record<string, unknown>>(
  data: T,
  fields: (keyof T)[]
): T {
  const result: Record<string, unknown> = { ...data };
  for (const field of fields) {
    const key = String(field);
    if (result[key] && typeof result[key] === "string") {
      result[key] = encrypt(result[key] as string);
    }
  }
  return result as T;
}

/**
 * 解密敏感字段
 */
export function decryptSensitiveFields<T extends Record<string, unknown>>(
  data: T,
  fields: (keyof T)[]
): T {
  const result: Record<string, unknown> = { ...data };
  for (const field of fields) {
    const key = String(field);
    if (result[key] && typeof result[key] === "string") {
      try {
        result[key] = decrypt(result[key] as string);
      } catch {
        result[key] = null;
      }
    }
  }
  return result as T;
}
