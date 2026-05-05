import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getRateLimitKey, checkRateLimit, sanitizeInput } from "@/lib/security";

// 扩展 Prisma schema 需要添加 Report 模型
// 这里先用简单的实现，后续需要更新 schema

export async function POST(request: NextRequest) {
  try {
    // 频率限制：每个 IP 每小时最多 3 次举报
    const rateLimitKey = getRateLimitKey(request);
    const rateLimit = checkRateLimit(rateLimitKey, 3, 3600000);

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { message: "举报过于频繁，请稍后再试" },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { type, targetId, reason, email, description } = body;

    // 验证必填字段
    if (!type || !targetId || !reason) {
      return NextResponse.json(
        { message: "举报类型、目标ID和原因不能为空" },
        { status: 400 }
      );
    }

    // 验证举报类型
    const validTypes = ["ranking", "spam", "illegal", "copyright", "other"];
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { message: "无效的举报类型" },
        { status: 400 }
      );
    }

    const sanitizedReason = sanitizeInput(reason);
    const sanitizedDescription = description ? sanitizeInput(description) : null;
    const sanitizedEmail = email ? sanitizeInput(email) : null;

    // 验证邮箱格式
    const { validateEmail } = await import("@/lib/security");
    if (sanitizedEmail && !validateEmail(sanitizedEmail)) {
      return NextResponse.json(
        { message: "邮箱格式不正确" },
        { status: 400 }
      );
    }

    // 获取 IP 地址
    const ipAddress = request.headers.get("x-forwarded-for")?.split(",")[0] ||
                      request.headers.get("x-real-ip") ||
                      "unknown";

    // 保存到数据库
    const report = await prisma.report.create({
      data: {
        type,
        targetId,
        reason: sanitizedReason,
        description: sanitizedDescription,
        email: sanitizedEmail,
        ipAddress,
        status: "pending",
      },
    });

    return NextResponse.json(
      {
        message: "举报已提交，我们将在24小时内处理",
        reportId: report.id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Report POST error:", error);
    return NextResponse.json(
      { message: "提交举报失败" },
      { status: 500 }
    );
  }
}
