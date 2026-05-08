import { NextRequest } from "next/server";
import { Difficulty, QuestionType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { publicQuestionSelect } from "@/lib/learning";
import { enforceRateLimitAsync, guardedJson, jsonError } from "@/lib/api-guard";

const MAX_LIMIT = 25;
const DEFAULT_LIMIT = 20;
const LESSON_ID_RE = /^[A-Za-z0-9_-]{8,64}$/;
const ALLOWED_QUERY_KEYS = new Set(["lessonId", "type", "difficulty", "limit"]);

function parseQuestionLimit(rawLimit: string | null) {
  if (!rawLimit) return DEFAULT_LIMIT;
  if (!/^\d{1,3}$/.test(rawLimit)) return null;
  const parsed = Number(rawLimit);
  if (!Number.isInteger(parsed) || parsed < 1) return null;
  return Math.min(parsed, MAX_LIMIT);
}

function parseEnumParam<T extends string>(rawValue: string | null, values: readonly T[]) {
  if (!rawValue) return undefined;
  return (values as readonly string[]).includes(rawValue) ? (rawValue as T) : null;
}

export async function GET(request: NextRequest) {
  const limited = await enforceRateLimitAsync(request, 60, 60_000, "questions:list");
  if (limited) return limited;

  const { searchParams } = new URL(request.url);
  for (const key of searchParams.keys()) {
    if (!ALLOWED_QUERY_KEYS.has(key)) {
      return jsonError("Unsupported query parameter", 400, request);
    }
  }

  const lessonId = searchParams.get("lessonId")?.trim() || "";
  if (!lessonId) {
    return jsonError("lessonId is required", 400, request);
  }
  if (!LESSON_ID_RE.test(lessonId)) {
    return jsonError("Invalid lessonId", 400, request);
  }

  const type = parseEnumParam(searchParams.get("type"), Object.values(QuestionType));
  if (type === null) return jsonError("Invalid question type", 400, request);

  const difficulty = parseEnumParam(searchParams.get("difficulty"), Object.values(Difficulty));
  if (difficulty === null) return jsonError("Invalid difficulty", 400, request);

  const limit = parseQuestionLimit(searchParams.get("limit"));
  if (limit === null) return jsonError("Invalid limit", 400, request);

  try {
    const lesson = await prisma.lesson.findFirst({
      where: {
        id: lessonId,
        isPublished: true,
        course: { isPublished: true },
      },
      select: { id: true },
    });

    if (!lesson) return jsonError("Lesson not found", 404, request);

    const questions = await prisma.question.findMany({
      where: {
        lessonId,
        ...(type ? { type } : {}),
        ...(difficulty ? { difficulty } : {}),
      },
      select: publicQuestionSelect,
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      take: limit,
    });

    return guardedJson({
      success: true,
      data: questions,
      total: questions.length,
      limit,
    });
  } catch (error) {
    console.error("Questions API error:", error);
    return jsonError("Server error / 服务器错误", 500, request);
  }
}
