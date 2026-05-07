import type { LearningDirection } from "@prisma/client";

type FallbackOption = {
  id: string;
  label: string;
  content: string;
  isCorrect?: boolean;
  sortOrder: number;
};

type FallbackQuestion = {
  id: string;
  type: "MULTIPLE_CHOICE" | "FILL_BLANK" | "CODE_READING";
  prompt: string;
  codeSnippet: string | null;
  answer: string;
  explanation: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  sortOrder: number;
  options: FallbackOption[];
};

type FallbackExample = {
  id: string;
  title: string;
  content: string;
  explanation: string;
  sortOrder: number;
};

type FallbackLesson = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  content: string;
  sortOrder: number;
  progress: { status: string }[];
  examples: FallbackExample[];
  questions: FallbackQuestion[];
};

type FallbackCourse = {
  id: string;
  slug: string;
  title: string;
  description: string;
  direction: LearningDirection;
  sortOrder: number;
  lessons: FallbackLesson[];
};

const option = (
  questionId: string,
  index: number,
  label: string,
  content: string,
  isCorrect = false,
): FallbackOption => ({
  id: `${questionId}-option-${label.toLowerCase()}`,
  label,
  content,
  isCorrect,
  sortOrder: index,
});

const courses: FallbackCourse[] = [
  {
    id: "fallback-english-basics",
    direction: "ENGLISH",
    slug: "english-basics",
    title: "English Basics",
    description: "Vocabulary, grammar and short reading for beginners.",
    sortOrder: 0,
    lessons: [
      {
        id: "fallback-english-daily-vocabulary",
        slug: "daily-vocabulary",
        title: "Daily Vocabulary",
        summary: "Learn words by meaning and context.",
        content:
          "A useful word is not only a translation. Learn its meaning, part of speech and a sentence where it fits.",
        sortOrder: 0,
        progress: [],
        examples: [
          {
            id: "fallback-example-accurate",
            title: "accurate",
            content: "The report is accurate.",
            explanation: "Accurate means correct and exact.",
            sortOrder: 0,
          },
        ],
        questions: [
          {
            id: "fallback-question-accurate",
            type: "MULTIPLE_CHOICE",
            prompt: "Choose the closest meaning of accurate.",
            codeSnippet: null,
            answer: "correct and exact",
            explanation: "Accurate means correct and exact.",
            difficulty: "EASY",
            sortOrder: 0,
            options: [
              option("fallback-question-accurate", 0, "A", "correct and exact", true),
              option("fallback-question-accurate", 1, "B", "very fast"),
              option("fallback-question-accurate", 2, "C", "hard to see"),
            ],
          },
          {
            id: "fallback-question-improve",
            type: "FILL_BLANK",
            prompt: "Complete: Practice can ____ your reading speed.",
            codeSnippet: null,
            answer: "improve",
            explanation: "Improve means make better.",
            difficulty: "EASY",
            sortOrder: 1,
            options: [],
          },
        ],
      },
      {
        id: "fallback-english-simple-present",
        slug: "simple-present",
        title: "Simple Present",
        summary: "Use present tense for habits and facts.",
        content:
          "For he, she and it, verbs usually add -s in the simple present: she studies, he reads.",
        sortOrder: 1,
        progress: [],
        examples: [
          {
            id: "fallback-example-habit",
            title: "habit",
            content: "She studies English every day.",
            explanation: "Every day signals a habit.",
            sortOrder: 0,
          },
        ],
        questions: [
          {
            id: "fallback-question-studies",
            type: "MULTIPLE_CHOICE",
            prompt: "Choose the correct sentence.",
            codeSnippet: null,
            answer: "She studies English every day.",
            explanation: "She is third person singular, so use studies.",
            difficulty: "EASY",
            sortOrder: 0,
            options: [
              option("fallback-question-studies", 0, "A", "She study English every day."),
              option("fallback-question-studies", 1, "B", "She studies English every day.", true),
              option("fallback-question-studies", 2, "C", "She studying English every day."),
            ],
          },
        ],
      },
    ],
  },
  {
    id: "fallback-cpp-basics",
    direction: "CPP",
    slug: "cpp-basics",
    title: "C++ Basics",
    description: "Input, output, variables and basic code reading.",
    sortOrder: 0,
    lessons: [
      {
        id: "fallback-cpp-input-output",
        slug: "input-output",
        title: "Input And Output",
        summary: "Use cin and cout.",
        content:
          "cin reads input from the user. cout prints output. Most beginner C++ problems begin with these two tools.",
        sortOrder: 0,
        progress: [],
        examples: [
          {
            id: "fallback-example-cout",
            title: "print",
            content: "cout << 3 + 4;",
            explanation: "The expression is evaluated first, then printed.",
            sortOrder: 0,
          },
        ],
        questions: [
          {
            id: "fallback-question-cout",
            type: "MULTIPLE_CHOICE",
            prompt: "Which object prints output in C++?",
            codeSnippet: null,
            answer: "cout",
            explanation: "cout prints output.",
            difficulty: "EASY",
            sortOrder: 0,
            options: [
              option("fallback-question-cout", 0, "A", "cin"),
              option("fallback-question-cout", 1, "B", "cout", true),
              option("fallback-question-cout", 2, "C", "int"),
            ],
          },
          {
            id: "fallback-question-cout-output",
            type: "CODE_READING",
            prompt: "What is the output?",
            codeSnippet: "cout << 3 + 4;",
            answer: "7",
            explanation: "3 + 4 equals 7.",
            difficulty: "EASY",
            sortOrder: 1,
            options: [],
          },
        ],
      },
      {
        id: "fallback-cpp-variables",
        slug: "variables",
        title: "Variables",
        summary: "Store values with types.",
        content:
          "A variable has a type and a name. int stores whole numbers, double stores decimals, string stores text.",
        sortOrder: 1,
        progress: [],
        examples: [
          {
            id: "fallback-example-int",
            title: "int",
            content: "int score = 100;",
            explanation: "score stores an integer.",
            sortOrder: 0,
          },
        ],
        questions: [
          {
            id: "fallback-question-int",
            type: "FILL_BLANK",
            prompt: "Declare an integer named age: ____ age;",
            codeSnippet: null,
            answer: "int",
            explanation: "int is the integer type.",
            difficulty: "EASY",
            sortOrder: 0,
            options: [],
          },
        ],
      },
    ],
  },
];

export function getFallbackTrack(direction: LearningDirection) {
  return courses.filter((course) => course.direction === direction);
}

export function getFallbackLesson(
  direction: LearningDirection,
  courseSlug: string,
  lessonSlug: string,
) {
  const course = courses.find(
    (item) => item.direction === direction && item.slug === courseSlug,
  );
  const lesson = course?.lessons.find((item) => item.slug === lessonSlug);
  if (!course || !lesson) return null;

  return {
    ...lesson,
    course: {
      id: course.id,
      slug: course.slug,
      title: course.title,
      direction: course.direction,
    },
  };
}
