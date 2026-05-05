import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyUserToken } from "@/lib/auth";
import redis from "@/lib/redis";

export async function POST(request: NextRequest) {
  try {
    const user = await verifyUserToken(request);
    if (!user) {
      return NextResponse.json({ message: "请先登录" }, { status: 401 });
    }

    const body = await request.json();
    const { rankingId } = body;

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
    return NextResponse.json({ message: "操作失败" }, { status: 500 });
  }
}
