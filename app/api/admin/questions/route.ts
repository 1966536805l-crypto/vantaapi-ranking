import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { validateQuestionBody } from "@/lib/admin-validation";
import { readJsonBody, requireCsrf } from "@/lib/api-guard";

function adminError(error: unknown) {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2003") return NextResponse.json({ message: "所属知识点不存在" }, { status: 400 });
  }
  console.error("Admin question error", error);
  return NextResponse.json({ message: "题目保存失败" }, { status: 500 });
}

export async function GET(request: NextRequest) {
  const { response } = await requireAdmin(request);
  if (response) return response;
  const questions = await prisma.question.findMany({
    orderBy: [{ lesson: { course: { direction: "asc" } } }, { sortOrder: "asc" }],
    include: { lesson: { include: { course: true } }, options: { orderBy: { sortOrder: "asc" } } },
  });
  return NextResponse.json({ questions });
}

export async function POST(request: NextRequest) {
  const { response } = await requireAdmin(request);
  if (response) return response;
  const csrfBlocked = requireCsrf(request);
  if (csrfBlocked) return csrfBlocked;
  const parsedBody = await readJsonBody<Record<string, unknown>>(request, 128 * 1024);
  if (!parsedBody.ok) return parsedBody.response;
  const body = parsedBody.body;
  if (!body || typeof body !== "object") return NextResponse.json({ message: "请求体不合法" }, { status: 400 });
  const parsed = validateQuestionBody(body as Record<string, unknown>);
  if (!parsed.ok) return NextResponse.json({ message: parsed.message }, { status: parsed.status || 400 });
  const lesson = await prisma.lesson.findUnique({ where: { id: parsed.data.lessonId }, select: { id: true } });
  if (!lesson) return NextResponse.json({ message: "所属知识点不存在" }, { status: 400 });
  try {
    const question = await prisma.question.create({
      data: {
        lessonId: parsed.data.lessonId,
        type: parsed.data.type,
        prompt: parsed.data.prompt,
        codeSnippet: parsed.data.codeSnippet,
        answer: parsed.data.answer,
        explanation: parsed.data.explanation,
        difficulty: parsed.data.difficulty,
        sortOrder: parsed.data.sortOrder,
        options: { create: parsed.data.options },
      },
      include: { options: true },
    });
    return NextResponse.json({ question }, { status: 201 });
  } catch (error) {
    return adminError(error);
  }
}
