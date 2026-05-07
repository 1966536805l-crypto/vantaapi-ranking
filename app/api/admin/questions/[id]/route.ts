import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { validateQuestionBody } from "@/lib/admin-validation";
import { readJsonBody, requireCsrf } from "@/lib/api-guard";

function adminError(error: unknown) {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2025") return NextResponse.json({ message: "题目不存在" }, { status: 404 });
    if (error.code === "P2003") return NextResponse.json({ message: "所属知识点不存在" }, { status: 400 });
  }
  console.error("Admin question mutation error", error);
  return NextResponse.json({ message: "题目操作失败" }, { status: 500 });
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { response } = await requireAdmin(request);
  if (response) return response;
  const csrfBlocked = requireCsrf(request);
  if (csrfBlocked) return csrfBlocked;
  const { id } = await params;
  const parsedBody = await readJsonBody<Record<string, unknown>>(request, 128 * 1024);
  if (!parsedBody.ok) return parsedBody.response;
  const body = parsedBody.body;
  if (!body || typeof body !== "object") return NextResponse.json({ message: "请求体不合法" }, { status: 400 });
  const parsed = validateQuestionBody(body as Record<string, unknown>);
  if (!parsed.ok) return NextResponse.json({ message: parsed.message }, { status: parsed.status || 400 });
  const lesson = await prisma.lesson.findUnique({ where: { id: parsed.data.lessonId }, select: { id: true } });
  if (!lesson) return NextResponse.json({ message: "所属知识点不存在" }, { status: 400 });
  try {
    const question = await prisma.$transaction(async (tx) => {
      await tx.question.update({
        where: { id },
        data: {
          lessonId: parsed.data.lessonId,
          type: parsed.data.type,
          prompt: parsed.data.prompt,
          codeSnippet: parsed.data.codeSnippet,
          answer: parsed.data.answer,
          explanation: parsed.data.explanation,
          difficulty: parsed.data.difficulty,
          sortOrder: parsed.data.sortOrder,
        },
      });
      await tx.questionOption.deleteMany({ where: { questionId: id } });
      if (parsed.data.options.length > 0) {
        await tx.questionOption.createMany({
          data: parsed.data.options.map((option) => ({ ...option, questionId: id })),
        });
      }
      return tx.question.findUnique({ where: { id }, include: { options: { orderBy: { sortOrder: "asc" } } } });
    });
    return NextResponse.json({ question });
  } catch (error) {
    return adminError(error);
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { response } = await requireAdmin(request);
  if (response) return response;
  const csrfBlocked = requireCsrf(request);
  if (csrfBlocked) return csrfBlocked;
  const { id } = await params;
  try {
    await prisma.question.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return adminError(error);
  }
}
