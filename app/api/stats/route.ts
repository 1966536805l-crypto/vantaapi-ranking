import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { guardedJson } from "@/lib/api-guard";
import { getAIEventSummary } from "@/lib/ai-observability";

export async function GET(request: NextRequest) {
  const { response } = await requireAdmin(request);
  if (response) return response;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [
    users,
    newUsersToday,
    activeProgressUsers,
    activeAttemptUsers,
    courses,
    englishCourses,
    cppCourses,
    lessons,
    questions,
    progress,
    attempts,
    attemptsToday,
    wrongQuestions,
    wrongQuestionsToday,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { createdAt: { gte: today } } }),
    prisma.userProgress.findMany({ where: { updatedAt: { gte: today } }, distinct: ["userId"], select: { userId: true } }),
    prisma.questionAttempt.findMany({ where: { createdAt: { gte: today } }, distinct: ["userId"], select: { userId: true } }),
    prisma.course.count(),
    prisma.course.count({ where: { direction: "ENGLISH" } }),
    prisma.course.count({ where: { direction: "CPP" } }),
    prisma.lesson.count(),
    prisma.question.count(),
    prisma.userProgress.count(),
    prisma.questionAttempt.count(),
    prisma.questionAttempt.count({ where: { createdAt: { gte: today } } }),
    prisma.wrongQuestion.count(),
    prisma.wrongQuestion.count({ where: { createdAt: { gte: today } } }),
  ]);

  const dailyActiveUsers = new Set([...activeProgressUsers, ...activeAttemptUsers].map((item) => item.userId)).size;
  const ai = getAIEventSummary();

  return guardedJson({
    users,
    newUsersToday,
    dailyActiveUsers,
    studyActions: progress + attempts,
    studyActionsToday: attemptsToday,
    aiCalls: ai.total,
    aiSuccess: ai.success,
    aiErrors: ai.error + ai.timeout + ai["rate-limited"],
    aiLastEventAt: ai.lastEventAt,
    courses,
    englishCourses,
    cppCourses,
    lessons,
    questions,
    progress,
    attempts,
    wrongQuestions,
    wrongQuestionsToday,
  });
}

export async function POST() {
  return NextResponse.json({ message: "Method not allowed" }, { status: 405, headers: { Allow: "GET", "Cache-Control": "no-store" } });
}
