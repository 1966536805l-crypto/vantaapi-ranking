import type {
  ProgrammingLanguageSlug,
  ProgrammingQuestion,
  ProgrammingQuestionType,
} from "@/lib/programming-content/types";
import { getProgrammingLanguage, programmingBankPlan } from "@/lib/programming-content/languages";

export function getProgrammingQuestionType(index: number): ProgrammingQuestionType {
  if (index <= programmingBankPlan.multipleChoice) return "MULTIPLE_CHOICE";
  if (index <= programmingBankPlan.multipleChoice + programmingBankPlan.fillBlank) return "FILL_BLANK";
  return "PRACTICAL";
}

function rotate<T>(items: T[], offset: number) {
  return items.map((_, index) => items[(index + offset) % items.length]);
}

function normalizeIndex(index: number) {
  if (!Number.isFinite(index)) return 1;
  return Math.min(programmingBankPlan.perLanguage, Math.max(1, Math.trunc(index)));
}

export function buildProgrammingQuestion(languageSlug: ProgrammingLanguageSlug, rawIndex: number): ProgrammingQuestion {
  const language = getProgrammingLanguage(languageSlug);
  const index = normalizeIndex(rawIndex);
  const type = getProgrammingQuestionType(index);
  const atomIndex = (index - 1) % language.atoms.length;
  const variant = Math.floor((index - 1) / language.atoms.length) + 1;
  const selected = language.atoms[atomIndex];
  const codeNumber = (variant % 9) + 1;
  const title = `${language.title} practice ${index}`;
  const hints = [
    `Look at ${selected.concept} first and find the missing piece`,
    `Check this habit ${language.dailyHabit}`,
    `You probably need ${selected.fillAnswer}. The answer should include ${selected.requiredKeywords.slice(0, 3).join(" ")}`,
  ];

  if (type === "MULTIPLE_CHOICE") {
    const options = rotate(
      [selected.choiceAnswer, ...selected.choiceDistractors.slice(0, 3)],
      variant % 4,
    );
    return {
      id: `${language.slug}-${index}`,
      index,
      type,
      title,
      prompt: `${language.title} question ${index}. Choose the statement that matches ${selected.concept}.`,
      codeSnippet: selected.practiceAnswer.replace(/42/g, String(40 + codeNumber)),
      options,
      answer: selected.choiceAnswer,
      explanation: selected.explanation,
      hints,
      runOutput: selected.runOutput.replace(/42/g, String(40 + codeNumber)),
      requiredKeywords: selected.requiredKeywords,
    };
  }

  if (type === "FILL_BLANK") {
    return {
      id: `${language.slug}-${index}`,
      index,
      type,
      title,
      prompt: `${selected.fillPrompt}\nFill the blank for ${language.title} question ${index}.`,
      codeSnippet: selected.practiceAnswer.replace(selected.fillAnswer, "____"),
      options: [],
      answer: selected.fillAnswer,
      explanation: selected.explanation,
      hints,
      runOutput: selected.runOutput,
      requiredKeywords: selected.requiredKeywords,
    };
  }

  return {
    id: `${language.slug}-${index}`,
    index,
    type,
    title,
    prompt: `${selected.practiceTask}\nTry it once first. If it misses, open a hint or compare with the answer.`,
    codeSnippet: selected.practiceAnswer,
    options: [],
    answer: selected.practiceAnswer,
    explanation: selected.explanation,
    hints,
    runOutput: selected.runOutput,
    requiredKeywords: selected.requiredKeywords,
  };
}
