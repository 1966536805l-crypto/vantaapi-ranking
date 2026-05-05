import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  getRateLimitKey,
  checkRateLimit,
  sanitizeInput,
  validateUrl,
} from "@/lib/security";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get("categoryId");
    const status = searchParams.get("status") || "approved";

    const where: { status: string; categoryId?: string } = { status };
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
    const rateLimitKey = getRateLimitKey(request);
    const rateLimit = checkRateLimit(rateLimitKey, 5, 60000);

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { message: "请求过于频繁，请稍后再试" },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { title, description, imageUrl, categoryId, submittedBy } = body;

    if (!title || !categoryId) {
      return NextResponse.json(
        { message: "标题和分类不能为空" },
        { status: 400 }
      );
    }

    const sanitizedTitle = sanitizeInput(title);
    const sanitizedDescription = description
      ? sanitizeInput(description)
      : null;
    const sanitizedSubmittedBy = submittedBy
      ? sanitizeInput(submittedBy)
      : null;

    if (sanitizedTitle.length < 2 || sanitizedTitle.length > 200) {
      return NextResponse.json(
        { message: "标题长度必须在2-200字符之间" },
        { status: 400 }
      );
    }

    if (imageUrl && !validateUrl(imageUrl)) {
      return NextResponse.json(
        { message: "图片链接格式不正确" },
        { status: 400 }
      );
    }

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
        title: sanitizedTitle,
        description: sanitizedDescription,
        imageUrl: imageUrl || null,
        categoryId,
        submittedBy: sanitizedSubmittedBy,
        status: "approved",
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
