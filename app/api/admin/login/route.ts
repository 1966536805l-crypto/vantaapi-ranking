import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  generateAdminToken,
  verifyPassword,
  checkLoginAttempts,
  recordLoginAttempt,
} from "@/lib/auth";
import { getRateLimitKey, checkRateLimit } from "@/lib/security";

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
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { message: "用户名和密码不能为空" },
        { status: 400 }
      );
    }

    // 检查登录失败锁定
    const loginCheck = checkLoginAttempts(username);
    if (!loginCheck.allowed) {
      return NextResponse.json(
        {
          message: `登录失败次数过多，请在 ${loginCheck.remainingTime} 秒后重试`,
        },
        { status: 429 }
      );
    }

    // 查找管理员
    const admin = await prisma.admin.findUnique({
      where: { username },
    });

    if (!admin) {
      recordLoginAttempt(username, false);
      return NextResponse.json(
        { message: "用户名或密码错误" },
        { status: 401 }
      );
    }

    // 验证密码
    const isValid = await verifyPassword(password, admin.password);
    if (!isValid) {
      recordLoginAttempt(username, false);
      return NextResponse.json(
        { message: "用户名或密码错误" },
        { status: 401 }
      );
    }

    // 登录成功
    recordLoginAttempt(username, true);
    const token = generateAdminToken(admin.id);

    return NextResponse.json({
      token,
      admin: {
        id: admin.id,
        username: admin.username,
        email: admin.email,
      },
    });
  } catch (error) {
    return NextResponse.json({ message: "登录失败" }, { status: 500 });
  }
}
