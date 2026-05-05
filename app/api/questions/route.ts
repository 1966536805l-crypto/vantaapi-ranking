import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const querySchema = z.object({
  difficulty: z.string().optional(),
  subject: z.string().optional(),
  topic: z.string().optional(),
  type: z.string().optional(),
  limit: z.string().optional(),
  offset: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const params = {
      difficulty: searchParams.get("difficulty") || undefined,
      subject: searchParams.get("subject") || undefined,
      topic: searchParams.get("topic") || undefined,
      type: searchParams.get("type") || undefined,
      limit: searchParams.get("limit") || undefined,
      offset: searchParams.get("offset") || undefined,
    };

    const validation = querySchema.safeParse(params);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { difficulty, subject, topic, type, limit, offset } =
      validation.data;

    const where: any = {};
    if (difficulty) where.difficulty = difficulty;
    if (subject) where.subject = subject;
    if (topic) where.topic = topic;
    if (type) where.type = type;

    const [questions, total] = await Promise.all([
      prisma.question.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: limit ? parseInt(limit) : 20,
        skip: offset ? parseInt(offset) : 0,
      }),
      prisma.question.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: questions,
      total,
    });
  } catch (error) {
    console.error("获取题库错误:", error);
    return NextResponse.json(
      { success: false, error: "服务器错误" },
      { status: 500 }
    );
  }
}
