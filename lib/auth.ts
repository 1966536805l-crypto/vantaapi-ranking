import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_TIME = 15 * 60 * 1000; // 15分钟

// 登录失败记录
const loginAttempts = new Map<string, { count: number; lockUntil: number }>();

export async function verifyAdminToken(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return null;
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET) as { adminId: string };

    const admin = await prisma.admin.findUnique({
      where: { id: decoded.adminId },
      select: { id: true, username: true, email: true },
    });

    return admin;
  } catch (error) {
    return null;
  }
}

export async function verifyUserToken(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return null;
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, username: true },
    });

    return user;
  } catch (error) {
    return null;
  }
}

export function generateAdminToken(adminId: string): string {
  return jwt.sign({ adminId }, JWT_SECRET, { expiresIn: "24h" });
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export function checkLoginAttempts(identifier: string): {
  allowed: boolean;
  remainingTime?: number;
} {
  const now = Date.now();
  const record = loginAttempts.get(identifier);

  if (!record) {
    return { allowed: true };
  }

  if (record.lockUntil > now) {
    return {
      allowed: false,
      remainingTime: Math.ceil((record.lockUntil - now) / 1000),
    };
  }

  if (record.lockUntil <= now && record.count >= MAX_LOGIN_ATTEMPTS) {
    loginAttempts.delete(identifier);
    return { allowed: true };
  }

  return { allowed: true };
}

export function recordLoginAttempt(identifier: string, success: boolean) {
  const now = Date.now();
  const record = loginAttempts.get(identifier);

  if (success) {
    loginAttempts.delete(identifier);
    return;
  }

  if (!record) {
    loginAttempts.set(identifier, { count: 1, lockUntil: 0 });
    return;
  }

  record.count++;

  if (record.count >= MAX_LOGIN_ATTEMPTS) {
    record.lockUntil = now + LOCKOUT_TIME;
  }
}

export function validatePassword(password: string): {
  valid: boolean;
  message?: string;
} {
  if (password.length < 12) {
    return { valid: false, message: "密码长度至少12位" };
  }

  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  const strength = [hasUpperCase, hasLowerCase, hasNumber, hasSpecial].filter(
    Boolean
  ).length;

  if (strength < 3) {
    return {
      valid: false,
      message: "密码必须包含大写字母、小写字母、数字和特殊字符中的至少3种",
    };
  }

  return { valid: true };
}
