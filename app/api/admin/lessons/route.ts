import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { validateLessonBody } from "@/lib/admin-validation";
import { readJsonBody, requireCsrf } from "@/lib/api-guard";

function adminError(error: unknown) {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") return NextResponse.json({ message: "该课程下已存在相同 lesson slug" }, { status: 409 });
    if (error.code === "P2003") return NextResponse.json({ message: "所属课程不存在" }, { status: 400 });
  }
  console.error("Admin lesson error", error);
  return NextResponse.json({ message: "知识点保存失败" }, { status: 500 });
}

export async function GET(request: NextRequest) {
  const { response } = await requireAdmin(request);
  if (response) return response;
  const lessons = await prisma.lesson.findMany({
    orderBy: [{ course: { direction: "asc" } }, { sortOrder: "asc" }],
    include: { course: true, questions: { orderBy: { sortOrder: "asc" } } },
  });
  return NextResponse.json({ lessons });
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
  const parsed = validateLessonBody(body as Record<string, unknown>);
  if (!parsed.ok) return NextResponse.json({ message: parsed.message }, { status: parsed.status || 400 });
  const course = await prisma.course.findUnique({ where: { id: parsed.data.courseId }, select: { id: true } });
  if (!course) return NextResponse.json({ message: "所属课程不存在" }, { status: 400 });
  try {
    const lesson = await prisma.lesson.create({ data: parsed.data });
    return NextResponse.json({ lesson }, { status: 201 });
  } catch (error) {
    return adminError(error);
  }
}
