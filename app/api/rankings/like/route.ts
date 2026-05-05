import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyUserToken } from "@/lib/auth";
import { getRateLimitKey, checkRateLimit } from "@/lib/security";
import redis from "@/lib/redis";

export async function POST(request: NextRequest) {
  try {
    const user = await verifyUserToken(request);
    if (!user) {
      return NextResponse.json({ message: "请先登录" }, { status: 401 });
    }

    // 频率限制
    const rateLimitKey = getRateLimitKey(request);
    const rateLimit = checkRateLimit(rateLimitKey, 20, 60000); // 20次/分钟

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { message: "操作过于频繁" },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { rankingId } = body;

    if (!rankingId) {
      return NextResponse.json(
        { message: "rankingId不能为空" },
        { status: 400 }
      );
    }

    const existing = await prisma.like.findUnique({
      where: {
        userId_rankingId: {
          userId: user.id,
          rankingId,
        },
      },
    });

    if (existing) {
      await prisma.like.delete({
        where: { id: existing.id },
      });

      await redis.zincrby("ranking:likes", -1, rankingId);

      return NextResponse.json({ liked: false });
    } else {
      await prisma.like.create({
        data: {
          userId: user.id,
          rankingId,
        },
      });

      await redis.zincrby("ranking:likes", 1, rankingId);

      return NextResponse.json({ liked: true });
    }
  } catch (error) {
    console.error("Like POST error:", error);
    return NextResponse.json({ message: "操作失败" }, { status: 500 });
  }
}
