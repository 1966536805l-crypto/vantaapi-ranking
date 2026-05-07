import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { guardedJson, readJsonBody, sanitizeText, requireCsrf } from "@/lib/api-guard";

function wrongError(error: unknown) {
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2003") {
    return guardedJson({ message: "question not found" }, { status: 404 });
  }
  console.error("Wrong-book API error", error);
  return guardedJson({ message: "wrong-book operation failed" }, { status: 500 });
}

export async function GET(request: NextRequest) {
  const { user, response } = await requireUser(request);
  if (response) return response;
  const items = await prisma.wrongQuestion.findMany({
    where: { userId: user!.id },
    include: { question: { include: { lesson: { include: { course: true } }, options: true } } },
    orderBy: { createdAt: "desc" },
  });
  return guardedJson({ items });
}

export async function POST(request: NextRequest) {
  const { user, response } = await requireUser(request);
  if (response) return response;
  const csrfBlocked = requireCsrf(request);
  if (csrfBlocked) return csrfBlocked;
  const parsedBody = await readJsonBody<Record<string, unknown>>(request, 16 * 1024);
  if (!parsedBody.ok) return parsedBody.response;
  const body = parsedBody.body;
  const questionId = String(body?.questionId || "").trim();
  if (!questionId || questionId.length > 191) return guardedJson({ message: "questionId required" }, { status: 400 });

  const question = await prisma.question.findFirst({
    where: { id: questionId, lesson: { isPublished: true, course: { isPublished: true } } },
    select: { id: true },
  });
  if (!question) return guardedJson({ message: "question not found" }, { status: 404 });

  const note = body?.note ? sanitizeText(String(body.note), 2000) : null;
  try {
    const item = await prisma.wrongQuestion.upsert({
      where: { userId_questionId: { userId: user!.id, questionId } },
      update: { note },
      create: { userId: user!.id, questionId, note },
    });
    return guardedJson({ item });
  } catch (error) {
    return wrongError(error);
  }
}

export async function DELETE(request: NextRequest) {
  const { user, response } = await requireUser(request);
  if (response) return response;
  const csrfBlocked = requireCsrf(request);
  if (csrfBlocked) return csrfBlocked;
  const id = new URL(request.url).searchParams.get("id")?.trim();
  if (!id || id.length > 191) return guardedJson({ message: "id required" }, { status: 400 });
  await prisma.wrongQuestion.deleteMany({ where: { id, userId: user!.id } });
  return guardedJson({ ok: true });
}

export async function PATCH() {
  return NextResponse.json({ message: "Method not allowed" }, { status: 405, headers: { Allow: "GET, POST, DELETE", "Cache-Control": "no-store" } });
}
