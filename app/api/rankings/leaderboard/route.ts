import { NextRequest, NextResponse } from "next/server";
import redis from "@/lib/redis";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "hot";
    const limit = parseInt(searchParams.get("limit") || "20");

    let rankingIds: string[] = [];

    switch (type) {
      case "hot":
        const hotIds = await redis.zrevrange("ranking:likes", 0, limit - 1);
        rankingIds = hotIds;
        break;

      case "trending":
        const now = Date.now();
        const dayAgo = now - 86400000;
        const trendingIds = await redis.zrevrangebyscore(
          "ranking:views:daily",
          now,
          dayAgo,
          "LIMIT",
          0,
          limit
        );
        rankingIds = trendingIds;
        break;

      case "new":
        const newRankings = await prisma.ranking.findMany({
          where: { status: "approved" },
          orderBy: { createdAt: "desc" },
          take: limit,
          select: { id: true },
        });
        rankingIds = newRankings.map((r) => r.id);
        break;
    }

    if (rankingIds.length === 0) {
      return NextResponse.json([]);
    }

    const rankings = await prisma.ranking.findMany({
      where: {
        id: { in: rankingIds },
        status: "approved",
      },
      include: {
        category: true,
        _count: {
          select: { likes: true, comments: true },
        },
      },
    });

    const sortedRankings = rankingIds
      .map((id) => rankings.find((r) => r.id === id))
      .filter(Boolean);

    return NextResponse.json(sortedRankings);
  } catch (error) {
    return NextResponse.json({ message: "获取失败" }, { status: 500 });
  }
}
