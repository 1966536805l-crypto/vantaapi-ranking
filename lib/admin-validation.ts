import { Difficulty, LearningDirection, QuestionType } from "@prisma/client";

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const directions = new Set<LearningDirection>(["ENGLISH", "CPP"]);
const questionTypes = new Set<QuestionType>(["MULTIPLE_CHOICE", "FILL_BLANK", "CODE_READING"]);
const difficulties = new Set<Difficulty>(["EASY", "MEDIUM", "HARD"]);

type ValidationResult<T> =
  | { ok: true; data: T }
  | { ok: false; message: string; status?: number };

function text(value: unknown) {
  return String(value ?? "").trim();
}

function optionalText(value: unknown) {
  const result = text(value);
  return result.length > 0 ? result : "";
}

function bounded(value: unknown, label: string, min: number, max: number) {
  const result = text(value);
  if (result.length < min) return { ok: false as const, message: `${label}不能为空` };
  if (result.length > max) return { ok: false as const, message: `${label}不能超过 ${max} 个字符` };
  return { ok: true as const, value: result };
}

function sortOrder(value: unknown) {
  const number = Number(value ?? 0);
  if (!Number.isInteger(number) || number < 0 || number > 9999) {
    return { ok: false as const, message: "排序必须是 0-9999 的整数" };
  }
  return { ok: true as const, value: number };
}

function slug(value: unknown) {
  const result = text(value).toLowerCase();
  if (!slugPattern.test(result)) {
    return { ok: false as const, message: "Slug 只能使用小写字母、数字和中横线，例如 cpp-basics" };
  }
  if (result.length > 80) return { ok: false as const, message: "Slug 不能超过 80 个字符" };
  return { ok: true as const, value: result };
}

export function validateCourseBody(body: Record<string, unknown>): ValidationResult<{
  slug: string;
  title: string;
  description: string;
  direction: LearningDirection;
  sortOrder: number;
  isPublished: boolean;
}> {
  const parsedSlug = slug(body.slug);
  if (!parsedSlug.ok) return parsedSlug;
  const title = bounded(body.title, "课程标题", 1, 120);
  if (!title.ok) return title;
  const description = optionalText(body.description);
  if (description.length > 2000) return { ok: false, message: "课程简介不能超过 2000 个字符" };
  const direction = text(body.direction) as LearningDirection;
  if (!directions.has(direction)) return { ok: false, message: "学习方向必须是 ENGLISH 或 CPP" };
  const order = sortOrder(body.sortOrder);
  if (!order.ok) return order;
  return {
    ok: true,
    data: {
      slug: parsedSlug.value,
      title: title.value,
      description,
      direction,
      sortOrder: order.value,
      isPublished: body.isPublished !== false,
    },
  };
}

export function validateLessonBody(body: Record<string, unknown>): ValidationResult<{
  courseId: string;
  slug: string;
  title: string;
  summary: string;
  content: string;
  sortOrder: number;
  isPublished: boolean;
}> {
  const courseId = bounded(body.courseId, "所属课程", 1, 191);
  if (!courseId.ok) return courseId;
  const parsedSlug = slug(body.slug);
  if (!parsedSlug.ok) return parsedSlug;
  const title = bounded(body.title, "知识点标题", 1, 140);
  if (!title.ok) return title;
  const summary = optionalText(body.summary);
  if (summary.length > 1200) return { ok: false, message: "摘要不能超过 1200 个字符" };
  const content = bounded(body.content, "讲解内容", 1, 20000);
  if (!content.ok) return content;
  const order = sortOrder(body.sortOrder);
  if (!order.ok) return order;
  return {
    ok: true,
    data: {
      courseId: courseId.value,
      slug: parsedSlug.value,
      title: title.value,
      summary,
      content: content.value,
      sortOrder: order.value,
      isPublished: body.isPublished !== false,
    },
  };
}

type RawOption = { label?: unknown; content?: unknown; isCorrect?: unknown };

export function validateQuestionBody(body: Record<string, unknown>): ValidationResult<{
  lessonId: string;
  type: QuestionType;
  prompt: string;
  codeSnippet: string | null;
  answer: string;
  explanation: string;
  difficulty: Difficulty;
  sortOrder: number;
  options: { label: string; content: string; isCorrect: boolean; sortOrder: number }[];
}> {
  const lessonId = bounded(body.lessonId, "所属知识点", 1, 191);
  if (!lessonId.ok) return lessonId;
  const type = text(body.type) as QuestionType;
  if (!questionTypes.has(type)) return { ok: false, message: "题型不合法" };
  const prompt = bounded(body.prompt, "题干", 1, 20000);
  if (!prompt.ok) return prompt;
  const codeSnippet = optionalText(body.codeSnippet);
  if (codeSnippet.length > 20000) return { ok: false, message: "代码片段不能超过 20000 个字符" };
  const answer = bounded(body.answer, "正确答案", 1, 2000);
  if (!answer.ok) return answer;
  const explanation = optionalText(body.explanation);
  if (explanation.length > 10000) return { ok: false, message: "解析不能超过 10000 个字符" };
  const difficulty = (text(body.difficulty) || "EASY") as Difficulty;
  if (!difficulties.has(difficulty)) return { ok: false, message: "难度不合法" };
  const order = sortOrder(body.sortOrder);
  if (!order.ok) return order;

  const rawOptions = Array.isArray(body.options) ? (body.options as RawOption[]) : [];
  const options = rawOptions
    .map((option, index) => ({
      label: text(option.label) || String.fromCharCode(65 + index),
      content: text(option.content),
      isCorrect: Boolean(option.isCorrect),
      sortOrder: index,
    }))
    .filter((option) => option.content.length > 0);

  if (options.some((option) => option.content.length > 2000 || option.label.length > 20)) {
    return { ok: false, message: "选项内容或标签过长" };
  }
  if (type === "MULTIPLE_CHOICE") {
    if (options.length < 2) return { ok: false, message: "选择题至少需要 2 个选项" };
    const correctCount = options.filter((option) => option.isCorrect).length;
    if (correctCount !== 1) return { ok: false, message: "选择题必须且只能有 1 个正确选项，请用 * 标记" };
  }

  return {
    ok: true,
    data: {
      lessonId: lessonId.value,
      type,
      prompt: prompt.value,
      codeSnippet: codeSnippet || null,
      answer: answer.value,
      explanation,
      difficulty,
      sortOrder: order.value,
      options,
    },
  };
}
