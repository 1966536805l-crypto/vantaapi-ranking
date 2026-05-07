import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { validateCourseBody } from "@/lib/admin-validation";
import { readJsonBody, requireCsrf } from "@/lib/api-guard";

function adminError(error: unknown) {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") return NextResponse.json({ message: "课程 slug 在该方向下已存在" }, { status: 409 });
    if (error.code === "P2025") return NextResponse.json({ message: "课程不存在" }, { status: 404 });
  }
  console.error("Admin course mutation error", error);
  return NextResponse.json({ message: "课程操作失败" }, { status: 500 });
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { response } = await requireAdmin(request);
  if (response) return response;
  const csrfBlocked = requireCsrf(request);
  if (csrfBlocked) return csrfBlocked;
  const { id } = await params;
  const parsedBody = await readJsonBody<Record<string, unknown>>(request, 64 * 1024);
  if (!parsedBody.ok) return parsedBody.response;
  const body = parsedBody.body;
  if (!body || typeof body !== "object") return NextResponse.json({ message: "请求体不合法" }, { status: 400 });
  const parsed = validateCourseBody(body as Record<string, unknown>);
  if (!parsed.ok) return NextResponse.json({ message: parsed.message }, { status: parsed.status || 400 });
  try {
    const course = await prisma.course.update({ where: { id }, data: parsed.data });
    return NextResponse.json({ course });
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
    await prisma.course.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return adminError(error);
  }
}
