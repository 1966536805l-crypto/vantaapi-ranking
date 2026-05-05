import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  getRateLimitKey,
  checkRateLimit,
  sanitizeInput,
  validateUrl,
} from "@/lib/security";
import { verifyUserToken } from "@/lib/auth";

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
    // 验证用户登录
    const user = await verifyUserToken(request);
    if (!user) {
      return NextResponse.json(
        { message: "请先登录后再提交" },
        { status: 401 }
      );
    }

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

    // AI预审
    const aiReview = await fetch(
      `${request.nextUrl.origin}/api/ai-review`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: sanitizedTitle, description: sanitizedDescription }),
      }
    );

    const aiResult = await aiReview.json();
    if (!aiResult.allowed) {
      return NextResponse.json(
        { message: `内容审核未通过：${aiResult.reason}` },
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
        userId: user.id,
        status: "pending",
      },
    });

    return NextResponse.json(
      { message: "提交成功，等待审核", ranking },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "创建排行榜项目失败" },
      { status: 500 }
    );
  }
}
