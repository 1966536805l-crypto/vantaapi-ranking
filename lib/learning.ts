import { Difficulty, LearningDirection, QuestionType } from "@prisma/client";

export const directions = ["english", "cpp"] as const;
export type DirectionParam = (typeof directions)[number];

export const publicQuestionSelect = {
  id: true,
  type: true,
  prompt: true,
  codeSnippet: true,
  difficulty: true,
  sortOrder: true,
  options: { select: { id: true, label: true, content: true, sortOrder: true }, orderBy: { sortOrder: "asc" as const } },
};

export function toLearningDirection(direction: string): LearningDirection | null {
  if (direction === "english") return "ENGLISH";
  if (direction === "cpp") return "CPP";
  return null;
}

export function toDirectionParam(direction: LearningDirection): DirectionParam {
  return direction === "ENGLISH" ? "english" : "cpp";
}

export function normalizeAnswer(value: unknown) {
  return String(value ?? "").trim().replace(/\s+/g, " ").toLowerCase();
}

export function isAnswerCorrect(expected: string, submitted: unknown) {
  return normalizeAnswer(expected) === normalizeAnswer(submitted);
}

export function labelQuestionType(type: QuestionType) {
  const labels: Record<QuestionType, string> = {
    MULTIPLE_CHOICE: "Multiple choice",
    FILL_BLANK: "Fill blank",
    CODE_READING: "Code reading",
  };
  return labels[type];
}

export function labelDifficulty(difficulty: Difficulty) {
  const labels: Record<Difficulty, string> = { EASY: "Easy", MEDIUM: "Medium", HARD: "Hard" };
  return labels[difficulty];
}
