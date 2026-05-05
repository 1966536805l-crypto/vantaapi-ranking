import { NextRequest } from "next/server";
import crypto from "crypto";

const SESSION_SECRET = process.env.SESSION_SECRET || "change-this-session-secret";

export interface Session {
  id: string;
  userId: string;
  deviceInfo: {
    userAgent: string;
    ip: string;
    deviceId: string;
  };
  createdAt: number;
  lastActivity: number;
  expiresAt: number;
}

/**
 * 生成设备指纹
 */
export function generateDeviceFingerprint(request: NextRequest): string {
  const userAgent = request.headers.get("user-agent") || "";
  const acceptLanguage = request.headers.get("accept-language") || "";
  const acceptEncoding = request.headers.get("accept-encoding") || "";

  const fingerprint = `${userAgent}|${acceptLanguage}|${acceptEncoding}`;

  return crypto
    .createHash("sha256")
    .update(fingerprint)
    .digest("hex")
    .slice(0, 16);
}

/**
 * 获取客户端 IP
 */
export function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");

  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }

  if (realIp) {
    return realIp;
  }

  return "unknown";
}

/**
 * 创建会话
 */
export function createSession(
  userId: string,
  request: NextRequest,
  expiresInMs: number = 7 * 24 * 60 * 60 * 1000 // 7天
): Session {
  const now = Date.now();
  const sessionId = crypto.randomBytes(32).toString("hex");

  return {
    id: sessionId,
    userId,
    deviceInfo: {
      userAgent: request.headers.get("user-agent") || "unknown",
      ip: getClientIp(request),
      deviceId: generateDeviceFingerprint(request),
    },
    createdAt: now,
    lastActivity: now,
    expiresAt: now + expiresInMs,
  };
}

/**
 * 验证会话是否有效
 */
export function isSessionValid(session: Session): boolean {
  const now = Date.now();

  // 检查是否过期
  if (session.expiresAt < now) {
    return false;
  }

  // 检查最后活动时间（超过30分钟无活动则失效）
  const inactiveTime = now - session.lastActivity;
  const maxInactiveTime = 30 * 60 * 1000; // 30分钟

  if (inactiveTime > maxInactiveTime) {
    return false;
  }

  return true;
}

/**
 * 更新会话活动时间
 */
export function updateSessionActivity(session: Session): Session {
  return {
    ...session,
    lastActivity: Date.now(),
  };
}

/**
 * 验证设备指纹
 */
export function verifyDeviceFingerprint(
  session: Session,
  request: NextRequest
): boolean {
  const currentFingerprint = generateDeviceFingerprint(request);
  return session.deviceInfo.deviceId === currentFingerprint;
}

/**
 * 签名会话数据
 */
export function signSession(session: Session): string {
  const data = JSON.stringify(session);
  return crypto
    .createHmac("sha256", SESSION_SECRET)
    .update(data)
    .digest("hex");
}

/**
 * 验证会话签名
 */
export function verifySessionSignature(
  session: Session,
  signature: string
): boolean {
  const expectedSignature = signSession(session);

  try {
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  } catch {
    return false;
  }
}
