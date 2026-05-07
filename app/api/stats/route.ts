import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { guardedJson } from "@/lib/api-guard";

export async function GET(request: NextRequest) {
  const { response } = await requireAdmin(request);
  if (response) return response;

  const [courses, englishCourses, cppCourses, lessons, questions, progress, wrongQuestions] = await Promise.all([
    prisma.course.count(),
    prisma.course.count({ where: { direction: "ENGLISH" } }),
    prisma.course.count({ where: { direction: "CPP" } }),
    prisma.lesson.count(),
    prisma.question.count(),
    prisma.userProgress.count(),
    prisma.wrongQuestion.count(),
  ]);

  return guardedJson({ courses, englishCourses, cppCourses, lessons, questions, progress, wrongQuestions });
}

export async function POST() {
  return NextResponse.json({ message: "Method not allowed" }, { status: 405, headers: { Allow: "GET", "Cache-Control": "no-store" } });
}
