import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sanitizeInput } from "@/lib/security";

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { rankings: true },
        },
      },
    });
    return NextResponse.json(categories);
  } catch (error) {
    return NextResponse.json(
      { message: "获取分类失败" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const adminToken = process.env.ADMIN_TOKEN;
    const requestToken = request.headers.get("x-admin-token");

    if (!adminToken || requestToken !== adminToken) {
      return NextResponse.json({ message: "无权限" }, { status: 403 });
    }

    const body = await request.json();
    const { name, description, icon } = body;

    if (!name) {
      return NextResponse.json(
        { message: "分类名称不能为空" },
        { status: 400 }
      );
    }

    const sanitizedName = sanitizeInput(name);
    const sanitizedDescription = description ? sanitizeInput(description) : null;
    const sanitizedIcon = icon ? sanitizeInput(icon) : null;

    const category = await prisma.category.create({
      data: {
        name: sanitizedName,
        description: sanitizedDescription,
        icon: sanitizedIcon,
      },
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { message: "创建分类失败" },
      { status: 500 }
    );
  }
}
