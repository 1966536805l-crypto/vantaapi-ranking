import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { guardedJson, readJsonBody, sanitizeText, requireCsrf } from "@/lib/api-guard";
import { isAnswerCorrect } from "@/lib/learning";

function quizError(error: unknown) {
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2003") {
    return guardedJson({ message: "question not found" }, { status: 404 });
  }
  console.error("Quiz submit error", error);
  return guardedJson({ message: "submit failed" }, { status: 500 });
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
  const answer = sanitizeText(String(body?.answer || ""), 2000);
  const lessonId = String(body?.lessonId || "").trim();
  if (!questionId || questionId.length > 191) return guardedJson({ message: "questionId required" }, { status: 400 });

  const question = await prisma.question.findFirst({
    where: { id: questionId, lesson: { isPublished: true, course: { isPublished: true } } },
    include: { lesson: { select: { id: true } } },
  });
  if (!question) return guardedJson({ message: "question not found" }, { status: 404 });

  const correct = isAnswerCorrect(question.answer, answer);
  try {
    await prisma.questionAttempt.create({ data: { userId: user!.id, questionId, answer, isCorrect: correct } });
    if (!correct) {
      await prisma.wrongQuestion.upsert({
        where: { userId_questionId: { userId: user!.id, questionId } },
        update: { userAnswer: answer },
        create: { userId: user!.id, questionId, userAnswer: answer },
      });
    }
    const progressLessonId = lessonId || question.lesson.id;
    await prisma.userProgress.upsert({
      where: { userId_lessonId: { userId: user!.id, lessonId: progressLessonId } },
      update: { status: "IN_PROGRESS" },
      create: { userId: user!.id, lessonId: progressLessonId, status: "IN_PROGRESS" },
    });
    return guardedJson({ result: { correct, explanation: question.explanation, answer: question.answer } });
  } catch (error) {
    return quizError(error);
  }
}

export async function GET() {
  return NextResponse.json({ message: "Method not allowed" }, { status: 405, headers: { Allow: "POST", "Cache-Control": "no-store" } });
}
