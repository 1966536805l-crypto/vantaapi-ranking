import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getRateLimitKey, checkRateLimit, sanitizeInput } from "@/lib/security";

export async function POST(request: NextRequest) {
  try {
    const rateLimitKey = getRateLimitKey(request);
    const rateLimit = checkRateLimit(rateLimitKey, 3, 300000);

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { message: "投诉过于频繁，请5分钟后再试" },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { type, targetId, reason, description, email } = body;

    if (!type || !targetId || !reason) {
      return NextResponse.json(
        { message: "请填写完整信息" },
        { status: 400 }
      );
    }

    const sanitizedType = sanitizeInput(type);
    const sanitizedTargetId = sanitizeInput(targetId);
    const sanitizedReason = sanitizeInput(reason);
    const sanitizedDescription = description ? sanitizeInput(description) : null;
    const sanitizedEmail = email ? sanitizeInput(email) : null;

    await prisma.report.create({
      data: {
        type: sanitizedType,
        targetId: sanitizedTargetId,
        reason: sanitizedReason,
        description: sanitizedDescription,
        email: sanitizedEmail,
        status: "pending",
      },
    });

    return NextResponse.json({ message: "投诉已提交" }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { message: "提交失败" },
      { status: 500 }
    );
  }
}
