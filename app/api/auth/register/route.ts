import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, validatePassword } from "@/lib/auth";
import { getRateLimitKey, checkRateLimit, sanitizeInput } from "@/lib/security";

export async function POST(request: NextRequest) {
  try {
    // 频率限制
    const rateLimitKey = getRateLimitKey(request);
    const rateLimit = checkRateLimit(rateLimitKey, 3, 3600000); // 3次/小时

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { message: "注册过于频繁，请稍后再试" },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { email, password, username } = body;

    if (!email || !password) {
      return NextResponse.json(
        { message: "邮箱和密码不能为空" },
        { status: 400 }
      );
    }

    // 验证邮箱格式
    const { validateEmail, validateUsername } = await import("@/lib/security");
    if (!validateEmail(email)) {
      return NextResponse.json(
        { message: "邮箱格式不正确" },
        { status: 400 }
      );
    }

    // 验证用户名格式
    if (username && !validateUsername(username)) {
      return NextResponse.json(
        { message: "用户名只能包含字母、数字、下划线和连字符，长度3-30字符" },
        { status: 400 }
      );
    }

    // 验证密码强度
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return NextResponse.json(
        { message: passwordValidation.message },
        { status: 400 }
      );
    }

    // 检查邮箱是否已存在
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "该邮箱已被注册" },
        { status: 409 }
      );
    }

    // 创建用户
    const hashedPassword = await hashPassword(password);
    const sanitizedUsername = username ? sanitizeInput(username) : null;

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        username: sanitizedUsername,
      },
      select: {
        id: true,
        email: true,
        username: true,
        createdAt: true,
      },
    });

    return NextResponse.json(
      {
        message: "注册成功",
        user,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("User register error:", error);
    return NextResponse.json(
      { message: "注册失败" },
      { status: 500 }
    );
  }
}
