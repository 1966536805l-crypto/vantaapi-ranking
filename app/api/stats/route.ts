import { NextRequest, NextResponse } from "next/server";
import redis from "@/lib/redis";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get("days") || "7");

    const stats = {
      totalProjects: 0,
      totalViews: 0,
      totalLikes: 0,
      totalComments: 0,
      categoryStats: [] as any[],
      dailyTrend: [] as any[],
    };

    const projectCount = await redis.get("stats:projects:total");
    stats.totalProjects = parseInt(projectCount || "0");

    const viewsCount = await redis.get("stats:views:total");
    stats.totalViews = parseInt(viewsCount || "0");

    const likesCount = await redis.zcard("ranking:likes");
    stats.totalLikes = likesCount;

    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateKey = date.toISOString().split("T")[0];

      const views = await redis.get(`stats:views:${dateKey}`);
      const likes = await redis.get(`stats:likes:${dateKey}`);

      stats.dailyTrend.unshift({
        date: dateKey,
        views: parseInt(views || "0"),
        likes: parseInt(likes || "0"),
      });
    }

    return NextResponse.json(stats);
  } catch (error) {
    return NextResponse.json({ message: "获取统计失败" }, { status: 500 });
  }
}
