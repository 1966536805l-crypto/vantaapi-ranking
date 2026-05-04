import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get("categoryId");
    const status = searchParams.get("status") || "approved";

    const where: Prisma.RankingWhereInput = { status };
    if (categoryId) {
      where.categoryId = categoryId;
    }

    const rankings = await prisma.ranking.findMany({
      where,
      include: {
        category: true,
      },
      orderBy: { score: "desc" },
    });

    return NextResponse.json(rankings);
  } catch (error) {
    return NextResponse.json(
      { message: "获取排行榜失败" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, imageUrl, categoryId, submittedBy } = body;

    if (!title || !categoryId) {
      return NextResponse.json(
        { message: "标题和分类不能为空" },
        { status: 400 }
      );
    }

    // 验证分类是否存在
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      return NextResponse.json(
        { message: "分类不存在" },
        { status: 404 }
      );
    }

    const ranking = await prisma.ranking.create({
      data: {
        title,
        description,
        imageUrl,
        categoryId,
        submittedBy,
        status: "pending",
      },
    });

    return NextResponse.json(ranking, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { message: "创建排行榜项目失败" },
      { status: 500 }
    );
  }
}
