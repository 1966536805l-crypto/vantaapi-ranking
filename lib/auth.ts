import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { AUTH_COOKIE } from "@/lib/auth-constants";
import { AUTH_SESSION_SECONDS, signAuthToken, verifyAuthToken, type AuthPayload } from "@/lib/auth-token";

export { signAuthToken, type AuthPayload };

type RequireAdminOptions = {
  allowUnverified2FA?: boolean;
};

function admin2FARequired() {
  return process.env.ADMIN_2FA_REQUIRED !== "false";
}

export function setAuthCookie(response: NextResponse, token: string) {
  response.cookies.set(AUTH_COOKIE, token, {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: AUTH_SESSION_SECONDS,
    priority: "high",
  });
}

export function clearAuthCookie(response: NextResponse) {
  response.cookies.set(AUTH_COOKIE, "", {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}

export function readAuthPayload(request: NextRequest): AuthPayload | null {
  const token = request.cookies.get(AUTH_COOKIE)?.value;
  if (!token) return null;
  return verifyAuthToken(token);
}

export async function getCurrentUser(request: NextRequest) {
  const payload = readAuthPayload(request);
  if (!payload) return null;

  const { prisma } = await import("@/lib/prisma");
  return prisma.user.findUnique({
    where: { id: payload.userId },
    select: { id: true, email: true, name: true, role: true, twoFactorEnabled: true, createdAt: true },
  });
}

export async function requireUser(request: NextRequest) {
  const user = await getCurrentUser(request);
  if (!user) {
    return { user: null, response: NextResponse.json({ message: "请先登录" }, { status: 401 }) };
  }
  return { user, response: null };
}

export async function requireAdmin(request: NextRequest, options: RequireAdminOptions = {}) {
  const userResult = await requireUser(request);
  if (userResult.response) return userResult;
  if (userResult.user?.role !== "ADMIN") {
    return { user: null, response: NextResponse.json({ message: "需要管理员权限" }, { status: 403 }) };
  }
  if (admin2FARequired() && !options.allowUnverified2FA && !userResult.user.twoFactorEnabled) {
    return { user: null, response: NextResponse.json({ message: "管理员必须先启用 2FA" }, { status: 403 }) };
  }
  return userResult;
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export function validatePassword(password: string) {
  if (password.length < 12) return { valid: false, message: "密码至少 12 位" };
  if (password.length > 128) return { valid: false, message: "密码不能超过 128 位" };
  if (!/[A-Z]/.test(password)) return { valid: false, message: "密码需要包含大写字母" };
  if (!/[a-z]/.test(password)) return { valid: false, message: "密码需要包含小写字母" };
  if (!/[0-9]/.test(password)) return { valid: false, message: "密码需要包含数字" };
  if (!/[^A-Za-z0-9]/.test(password)) return { valid: false, message: "密码需要包含特殊字符" };
  return { valid: true };
}
