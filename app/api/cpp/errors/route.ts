import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createErrorSchema = z.object({
  userId: z.string().min(1),
  code: z.string().min(1),
  stdin: z.string().default(""),
  stdout: z.string().optional(),
  stderr: z.string().optional(),
  note: z.string().optional(),
});

// 获取错误记录列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "缺少 userId 参数" },
        { status: 400 }
      );
    }

    const errors = await prisma.cppError.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return NextResponse.json({
      success: true,
      data: errors,
    });
  } catch (error) {
    console.error("获取错误记录失败:", error);
    return NextResponse.json(
      { success: false, error: "服务器错误" },
      { status: 500 }
    );
  }
}

// 创建错误记录
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const validation = createErrorSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: validation.error.issues[0].message,
        },
        { status: 400 }
      );
    }

    const data = validation.data;

    const cppError = await prisma.cppError.create({
      data: {
        userId: data.userId,
        code: data.code,
        stdin: data.stdin,
        stdout: data.stdout || "",
        stderr: data.stderr || "",
        note: data.note || "",
      },
    });

    return NextResponse.json({
      success: true,
      data: cppError,
    });
  } catch (error) {
    console.error("创建错误记录失败:", error);
    return NextResponse.json(
      { success: false, error: "服务器错误" },
      { status: 500 }
    );
  }
}

// 删除错误记录
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "缺少 id 参数" },
        { status: 400 }
      );
    }

    await prisma.cppError.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "删除成功",
    });
  } catch (error) {
    console.error("删除错误记录失败:", error);
    return NextResponse.json(
      { success: false, error: "服务器错误" },
      { status: 500 }
    );
  }
}
