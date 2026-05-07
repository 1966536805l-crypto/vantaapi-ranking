import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { guardedJson, readJsonBody, requireCsrf } from "@/lib/api-guard";

function progressError(error: unknown) {
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2003") {
    return guardedJson({ message: "lesson not found" }, { status: 404 });
  }
  console.error("Progress API error", error);
  return guardedJson({ message: "progress update failed" }, { status: 500 });
}

export async function GET(request: NextRequest) {
  const { user, response } = await requireUser(request);
  if (response) return response;
  const progress = await prisma.userProgress.findMany({
    where: { userId: user!.id },
    include: { lesson: { include: { course: true } } },
    orderBy: { updatedAt: "desc" },
  });
  return guardedJson({ progress });
}

export async function POST(request: NextRequest) {
  const { user, response } = await requireUser(request);
  if (response) return response;
  const csrfBlocked = requireCsrf(request);
  if (csrfBlocked) return csrfBlocked;
  const parsedBody = await readJsonBody<Record<string, unknown>>(request, 8 * 1024);
  if (!parsedBody.ok) return parsedBody.response;
  const body = parsedBody.body;
  const lessonId = String(body?.lessonId || "").trim();
  const status = body?.status === "COMPLETED" ? "COMPLETED" : "IN_PROGRESS";
  if (!lessonId || lessonId.length > 191) return guardedJson({ message: "lessonId required" }, { status: 400 });

  const lesson = await prisma.lesson.findFirst({
    where: { id: lessonId, isPublished: true, course: { isPublished: true } },
    select: { id: true },
  });
  if (!lesson) return guardedJson({ message: "lesson not found" }, { status: 404 });

  try {
    const progress = await prisma.userProgress.upsert({
      where: { userId_lessonId: { userId: user!.id, lessonId } },
      update: { status, completedAt: status === "COMPLETED" ? new Date() : null },
      create: { userId: user!.id, lessonId, status, completedAt: status === "COMPLETED" ? new Date() : null },
    });
    return guardedJson({ progress });
  } catch (error) {
    return progressError(error);
  }
}

export async function DELETE() {
  return NextResponse.json({ message: "Method not allowed" }, { status: 405, headers: { Allow: "GET, POST", "Cache-Control": "no-store" } });
}
