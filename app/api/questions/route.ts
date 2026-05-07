import { NextRequest, NextResponse } from "next/server";
import { Difficulty, QuestionType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { publicQuestionSelect } from "@/lib/learning";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const lessonId = searchParams.get("lessonId") || undefined;
    const type = searchParams.get("type") as QuestionType | null;
    const difficulty = searchParams.get("difficulty") as Difficulty | null;
    const limit = Number(searchParams.get("limit") || 20);

    const questions = await prisma.question.findMany({
      where: {
        lessonId,
        ...(type && Object.values(QuestionType).includes(type) ? { type } : {}),
        ...(difficulty && Object.values(Difficulty).includes(difficulty)
          ? { difficulty }
          : {}),
      },
      select: publicQuestionSelect,
      orderBy: { createdAt: "desc" },
      take: Number.isFinite(limit) ? Math.min(limit, 50) : 20,
    });

    return NextResponse.json({
      success: true,
      data: questions,
      total: questions.length,
    });
  } catch (error) {
    console.error("Questions API error:", error);
    return NextResponse.json(
      { success: false, error: "Server error / 服务器错误" },
      { status: 500 }
    );
  }
}
