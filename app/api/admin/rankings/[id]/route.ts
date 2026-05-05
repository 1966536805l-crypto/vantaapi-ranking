import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdminToken } from "@/lib/auth";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await verifyAdminToken(request);
    if (!admin) {
      return NextResponse.json({ message: "无权限" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const { action } = body;

    if (!["approve", "reject"].includes(action)) {
      return NextResponse.json(
        { message: "无效的操作" },
        { status: 400 }
      );
    }

    const ranking = await prisma.ranking.update({
      where: { id },
      data: {
        status: action === "approve" ? "approved" : "rejected",
      },
    });

    return NextResponse.json(ranking);
  } catch (error) {
    return NextResponse.json(
      { message: "操作失败" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await verifyAdminToken(request);
    if (!admin) {
      return NextResponse.json({ message: "无权限" }, { status: 403 });
    }

    const { id } = await params;

    await prisma.ranking.delete({
      where: { id },
    });

    return NextResponse.json({ message: "删除成功" });
  } catch (error) {
    return NextResponse.json(
      { message: "删除失败" },
      { status: 500 }
    );
  }
}
