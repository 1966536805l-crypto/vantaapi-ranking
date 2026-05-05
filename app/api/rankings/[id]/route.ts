import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const adminToken = process.env.ADMIN_TOKEN;
    const requestToken = request.headers.get("x-admin-token");

    if (!adminToken || requestToken !== adminToken) {
      return NextResponse.json({ message: "无权限" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const { status, score, votes } = body;

    const updateData: { status?: string; score?: number; votes?: number } = {};
    if (status) updateData.status = status;
    if (score !== undefined) updateData.score = score;
    if (votes !== undefined) updateData.votes = votes;

    const ranking = await prisma.ranking.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(ranking);
  } catch (error) {
    return NextResponse.json(
      { message: "更新排行榜项目失败" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const adminToken = process.env.ADMIN_TOKEN;
    const requestToken = request.headers.get("x-admin-token");

    if (!adminToken || requestToken !== adminToken) {
      return NextResponse.json({ message: "无权限" }, { status: 403 });
    }

    const { id } = await params;

    await prisma.ranking.delete({
      where: { id },
    });

    return NextResponse.json({ message: "删除成功" });
  } catch (error) {
    return NextResponse.json(
      { message: "删除排行榜项目失败" },
      { status: 500 }
    );
  }
}
