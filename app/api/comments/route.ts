import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyUserToken } from "@/lib/auth";
import { sanitizeInput } from "@/lib/security";
import { logAudit } from "@/lib/redis";

export async function POST(request: NextRequest) {
  try {
    const user = await verifyUserToken(request);
    if (!user) {
      return NextResponse.json({ message: "请先登录" }, { status: 401 });
    }

    const body = await request.json();
    const { rankingId, content, parentId } = body;

    if (!content || !rankingId) {
      return NextResponse.json(
        { message: "内容不能为空" },
        { status: 400 }
      );
    }

    const sanitizedContent = sanitizeInput(content);

    if (sanitizedContent.length < 2 || sanitizedContent.length > 500) {
      return NextResponse.json(
        { message: "评论长度必须在2-500字符之间" },
        { status: 400 }
      );
    }

    const comment = await prisma.comment.create({
      data: {
        content: sanitizedContent,
        userId: user.id,
        rankingId,
        parentId: parentId || null,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    await logAudit({
      userId: user.id,
      action: "comment_created",
      resource: "comment",
      details: { rankingId, commentId: comment.id },
      ip: request.headers.get("x-forwarded-for") || "unknown",
    });

    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: "评论失败" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const rankingId = searchParams.get("rankingId");

    if (!rankingId) {
      return NextResponse.json(
        { message: "rankingId不能为空" },
        { status: 400 }
      );
    }

    const comments = await prisma.comment.findMany({
      where: {
        rankingId,
        parentId: null,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        replies: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(comments);
  } catch (error) {
    return NextResponse.json({ message: "获取评论失败" }, { status: 500 });
  }
}
