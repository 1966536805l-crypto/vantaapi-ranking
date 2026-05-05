import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdminToken } from "@/lib/auth";

// 获取待审核的内容
export async function GET(request: NextRequest) {
  try {
    const admin = await verifyAdminToken(request);
    if (!admin) {
      return NextResponse.json({ message: "未授权" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "pending";

    const rankings = await prisma.ranking.findMany({
      where: { status },
      include: {
        category: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(rankings);
  } catch (error) {
    return NextResponse.json(
      { message: "获取列表失败" },
      { status: 500 }
    );
  }
}

// 审核内容（批准/拒绝）
export async function PATCH(request: NextRequest) {
  try {
    const admin = await verifyAdminToken(request);
    if (!admin) {
      return NextResponse.json({ message: "未授权" }, { status: 401 });
    }

    const body = await request.json();
    const { id, status } = body;

    if (!id || !["approved", "rejected"].includes(status)) {
      return NextResponse.json(
        { message: "参数错误" },
        { status: 400 }
      );
    }

    const ranking = await prisma.ranking.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json(ranking);
  } catch (error) {
    return NextResponse.json(
      { message: "审核失败" },
      { status: 500 }
    );
  }
}
