import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword, checkLoginAttempts, recordLoginAttempt } from "@/lib/auth";
import { getRateLimitKey, checkRateLimit } from "@/lib/security";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";

export async function POST(request: NextRequest) {
  try {
    // 频率限制
    const rateLimitKey = getRateLimitKey(request);
    const rateLimit = checkRateLimit(rateLimitKey, 5, 300000); // 5次/5分钟

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { message: "请求过于频繁，请稍后再试" },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { message: "邮箱和密码不能为空" },
        { status: 400 }
      );
    }

    // 检查登录失败锁定
    const loginCheck = checkLoginAttempts(email);
    if (!loginCheck.allowed) {
      return NextResponse.json(
        {
          message: `登录失败次数过多，请在 ${loginCheck.remainingTime} 秒后重试`,
        },
        { status: 429 }
      );
    }

    // 查找用户
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      recordLoginAttempt(email, false);
      return NextResponse.json(
        { message: "邮箱或密码错误" },
        { status: 401 }
      );
    }

    // 验证密码
    const isValid = await verifyPassword(password, user.password);
    if (!isValid) {
      recordLoginAttempt(email, false);
      return NextResponse.json(
        { message: "邮箱或密码错误" },
        { status: 401 }
      );
    }

    // 登录成功
    recordLoginAttempt(email, true);
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "7d" });

    return NextResponse.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
      },
    });
  } catch (error) {
    return NextResponse.json({ message: "登录失败" }, { status: 500 });
  }
}
