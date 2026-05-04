import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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
    const body = await request.json();
    const { name, description, icon } = body;

    if (!name) {
      return NextResponse.json(
        { message: "分类名称不能为空" },
        { status: 400 }
      );
    }

    const category = await prisma.category.create({
      data: { name, description, icon },
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { message: "创建分类失败" },
      { status: 500 }
    );
  }
}
