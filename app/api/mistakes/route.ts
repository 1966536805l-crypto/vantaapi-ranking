import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const MISTAKE_TYPES = [
  "审题错",
  "概念不清",
  "公式乱用",
  "计算粗心",
  "图形没看出来",
  "变量关系没建出来",
  "第一突破口卡住",
  "会方法但表达乱",
] as const;

const createMistakeSchema = z.object({
  userId: z.string().min(1),
  question: z.string().min(1, "题目不能为空"),
  myAnswer: z.string().min(1, "我的答案不能为空"),
  correctAnswer: z.string().min(1, "正确答案不能为空"),
  myProcess: z.string().optional(),
  mistakeType: z.enum(MISTAKE_TYPES),
  correctThinking: z.string().optional(),
  nextReviewAt: z.string().optional(),
});

const updateMistakeSchema = z.object({
  id: z.string().min(1),
  question: z.string().optional(),
  myAnswer: z.string().optional(),
  correctAnswer: z.string().optional(),
  myProcess: z.string().optional(),
  mistakeType: z.enum(MISTAKE_TYPES).optional(),
  correctThinking: z.string().optional(),
  nextReviewAt: z.string().optional(),
});

// 获取错题列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const mistakeType = searchParams.get("mistakeType");

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "缺少 userId 参数" },
        { status: 400 }
      );
    }

    const where: { userId: string; mistakeType?: string } = { userId };
    if (mistakeType) {
      where.mistakeType = mistakeType;
    }

    const mistakes = await prisma.mistake.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    return NextResponse.json({
      success: true,
      data: mistakes,
    });
  } catch (error) {
    console.error("获取错题列表失败:", error);
    return NextResponse.json(
      { success: false, error: "服务器错误" },
      { status: 500 }
    );
  }
}

// 创建错题
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const validation = createMistakeSchema.safeParse(body);
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

    const mistake = await prisma.mistake.create({
      data: {
        userId: data.userId,
        question: data.question,
        myAnswer: data.myAnswer,
        correctAnswer: data.correctAnswer,
        myProcess: data.myProcess || "",
        mistakeType: data.mistakeType,
        correctThinking: data.correctThinking || "",
        nextReviewAt: data.nextReviewAt ? new Date(data.nextReviewAt) : null,
      },
    });

    return NextResponse.json({
      success: true,
      data: mistake,
    });
  } catch (error) {
    console.error("创建错题失败:", error);
    return NextResponse.json(
      { success: false, error: "服务器错误" },
      { status: 500 }
    );
  }
}

// 更新错题
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();

    const validation = updateMistakeSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: validation.error.issues[0].message,
        },
        { status: 400 }
      );
    }

    const { id, ...data } = validation.data;

    const updateData: Record<string, unknown> = {};
    if (data.question !== undefined) updateData.question = data.question;
    if (data.myAnswer !== undefined) updateData.myAnswer = data.myAnswer;
    if (data.correctAnswer !== undefined) updateData.correctAnswer = data.correctAnswer;
    if (data.myProcess !== undefined) updateData.myProcess = data.myProcess;
    if (data.mistakeType !== undefined) updateData.mistakeType = data.mistakeType;
    if (data.correctThinking !== undefined) updateData.correctThinking = data.correctThinking;
    if (data.nextReviewAt !== undefined) {
      updateData.nextReviewAt = data.nextReviewAt ? new Date(data.nextReviewAt) : null;
    }

    const mistake = await prisma.mistake.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      data: mistake,
    });
  } catch (error) {
    console.error("更新错题失败:", error);
    return NextResponse.json(
      { success: false, error: "服务器错误" },
      { status: 500 }
    );
  }
}

// 删除错题
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

    await prisma.mistake.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "删除成功",
    });
  } catch (error) {
    console.error("删除错题失败:", error);
    return NextResponse.json(
      { success: false, error: "服务器错误" },
      { status: 500 }
    );
  }
}
