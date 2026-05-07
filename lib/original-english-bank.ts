export type OriginalReadingPack = {
  slug: string;
  title: string;
  zhTitle: string;
  level: string;
  targetArticles: number;
  exam?: "IELTS" | "TOEFL";
};

export type OriginalArticle = {
  id: string;
  title: string;
  subtitleZh: string;
  level: string;
  chapter: number;
  wordTarget: number;
  passage: string[];
  vocabulary: { word: string; zh: string; sentence: string }[];
  tasks: string[];
};

export type OriginalQuestionPack = {
  slug: string;
  title: string;
  zhTitle: string;
  level: string;
  multipleChoiceCount: number;
  fillBlankCount: number;
  descriptionZh: string;
};

export type OriginalQuizQuestion = {
  id: string;
  type: "MULTIPLE_CHOICE" | "FILL_BLANK";
  prompt: string;
  codeSnippet: null;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  answer: string;
  explanation: string;
  options: { id: string; label: string; content: string }[];
};

export const originalReadingPacks: OriginalReadingPack[] = [
  { slug: "grade-7", title: "Grade 7 Original Reading", zhTitle: "初一原创英语文章", level: "Grade 7", targetArticles: 300 },
  { slug: "grade-8", title: "Grade 8 Original Reading", zhTitle: "初二原创英语文章", level: "Grade 8", targetArticles: 300 },
  { slug: "grade-9", title: "Grade 9 Original Reading", zhTitle: "初三原创英语文章", level: "Grade 9", targetArticles: 300 },
  { slug: "grade-10", title: "Grade 10 Original Reading", zhTitle: "高一原创英语文章", level: "Grade 10", targetArticles: 300 },
  { slug: "grade-11", title: "Grade 11 Original Reading", zhTitle: "高二原创英语文章", level: "Grade 11", targetArticles: 300 },
  { slug: "grade-12", title: "Grade 12 Original Reading", zhTitle: "高三原创英语文章", level: "Grade 12", targetArticles: 300 },
  { slug: "ielts-reading-1000", title: "IELTS Original Reading", zhTitle: "雅思原创阅读", level: "IELTS Band 5.5-8", targetArticles: 1000, exam: "IELTS" },
  { slug: "toefl-reading-1000", title: "TOEFL Original Reading", zhTitle: "托福原创阅读", level: "TOEFL iBT", targetArticles: 1000, exam: "TOEFL" },
];

export const originalQuestionPacks: OriginalQuestionPack[] = [
  { slug: "ielts-original-3000", title: "IELTS Original Bank", zhTitle: "雅思原创题库", level: "IELTS", multipleChoiceCount: 1500, fillBlankCount: 1500, descriptionZh: "雅思方向原创选择和填空题持续扩充。" },
  { slug: "toefl-original-3000", title: "TOEFL Original Bank", zhTitle: "托福原创题库", level: "TOEFL", multipleChoiceCount: 1500, fillBlankCount: 1500, descriptionZh: "托福方向原创选择和填空题持续扩充。" },
  { slug: "grade-7-1000", title: "Grade 7 Original Questions", zhTitle: "初一原创选择填空", level: "Grade 7", multipleChoiceCount: 500, fillBlankCount: 500, descriptionZh: "本年级原创选择和填空混合题持续扩充。" },
  { slug: "grade-8-1000", title: "Grade 8 Original Questions", zhTitle: "初二原创选择填空", level: "Grade 8", multipleChoiceCount: 500, fillBlankCount: 500, descriptionZh: "本年级原创选择和填空混合题持续扩充。" },
  { slug: "grade-9-1000", title: "Grade 9 Original Questions", zhTitle: "初三原创选择填空", level: "Grade 9", multipleChoiceCount: 500, fillBlankCount: 500, descriptionZh: "本年级原创选择和填空混合题持续扩充。" },
  { slug: "grade-10-1000", title: "Grade 10 Original Questions", zhTitle: "高一原创选择填空", level: "Grade 10", multipleChoiceCount: 500, fillBlankCount: 500, descriptionZh: "本年级原创选择和填空混合题持续扩充。" },
  { slug: "grade-11-1000", title: "Grade 11 Original Questions", zhTitle: "高二原创选择填空", level: "Grade 11", multipleChoiceCount: 500, fillBlankCount: 500, descriptionZh: "本年级原创选择和填空混合题持续扩充。" },
  { slug: "grade-12-1000", title: "Grade 12 Original Questions", zhTitle: "高三原创选择填空", level: "Grade 12", multipleChoiceCount: 500, fillBlankCount: 500, descriptionZh: "本年级原创选择和填空混合题持续扩充。" },
];

const themes = ["city gardens", "school clubs", "quiet technology", "healthy routines", "public libraries", "river protection", "space food", "shared bicycles", "music practice", "museum volunteers", "community maps", "smart classrooms"];
const claims = ["small habits can produce visible progress", "evidence is stronger than a quick opinion", "public choices shape private routines", "clear language makes difficult ideas easier", "careful observation often changes a first impression", "technology is useful only when people use it responsibly"];
const verbs = ["observe", "compare", "support", "reduce", "improve", "explain", "protect", "organise", "connect", "evaluate", "predict", "revise"];
const nouns = ["evidence", "routine", "benefit", "challenge", "community", "resource", "pattern", "decision", "impact", "method", "context", "response"];
const transitions = ["however", "therefore", "for example", "as a result", "in contrast", "more importantly", "meanwhile", "in this way"];

function pick<T>(items: T[], index: number) {
  return items[((index % items.length) + items.length) % items.length];
}

function packSeed(slug: string) {
  return slug.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
}

export function getOriginalReadingPack(slug: string) {
  return originalReadingPacks.find((pack) => pack.slug === slug);
}

export function getOriginalQuestionPack(slug: string) {
  return originalQuestionPacks.find((pack) => pack.slug === slug);
}

export function buildOriginalArticle(packSlug: string, chapter: number): OriginalArticle | null {
  const pack = getOriginalReadingPack(packSlug);
  if (!pack || chapter < 1 || chapter > pack.targetArticles) return null;

  const seed = packSeed(packSlug) + chapter;
  const theme = pick(themes, seed);
  const claim = pick(claims, seed * 2);
  const verb = pick(verbs, seed * 3);
  const noun = pick(nouns, seed * 5);
  const transition = pick(transitions, seed * 7);
  const examAngle = pack.exam === "IELTS"
    ? "The passage trains opinion, cause-effect and solution language for IELTS writing and reading."
    : pack.exam === "TOEFL"
      ? "The passage trains lecture-style explanation, evidence tracking and academic vocabulary for TOEFL."
      : "The passage keeps sentences clear while adding one exam-level thinking task.";
  const wordTarget = pack.exam ? 260 + (chapter % 7) * 20 : 150 + (chapter % 6) * 15;

  return {
    id: `${pack.slug}-${chapter}`,
    title: `${pack.level} Chapter ${chapter}: ${theme.replace(/\b\w/g, (letter) => letter.toUpperCase())}`,
    subtitleZh: `${pack.zhTitle} · 第 ${chapter} 章 · 纯原创分级阅读`,
    level: pack.level,
    chapter,
    wordTarget,
    passage: [
      `When students first study ${theme}, they often notice the obvious details and miss the quiet pattern behind them. In one small class project, learners collected notes, compared examples, and tried to ${verb} the most important change. Their first answers were simple, but the discussion became richer when they had to support every idea with evidence.`,
      `The central point is that ${claim}. A learner who reads only for isolated words may finish quickly, ${transition} a learner who follows the logic can explain why each sentence appears where it does. This difference matters because reading exams reward structure, not just memory.`,
      `${examAngle} After reading, students should identify the topic sentence, underline one contrast, and write a short response using the target word ${noun}. The goal is not to copy a model answer; the goal is to build a reliable way of thinking in English.`,
    ],
    vocabulary: [
      { word: verb, zh: "动作/分析动词", sentence: `Students ${verb} details before making a conclusion.` },
      { word: noun, zh: "核心抽象名词", sentence: `The ${noun} helps readers understand the writer's purpose.` },
      { word: transition, zh: "阅读逻辑连接词", sentence: `${transition}, the second paragraph changes the direction of the argument.` },
    ],
    tasks: [
      "找出文章主旨句，并用中文解释它的作用。",
      "圈出一个逻辑连接词，说明前后句关系。",
      `用 ${noun} 写一个 12-18 词英文句子。`,
    ],
  };
}

const grammarTargets = [
  { answer: "although", zh: "尽管", pattern: "Although the plan was simple, it solved the main problem." },
  { answer: "because", zh: "因为", pattern: "The result changed because the evidence was incomplete." },
  { answer: "improve", zh: "提高", pattern: "Daily review can improve reading accuracy." },
  { answer: "evidence", zh: "证据", pattern: "The author uses evidence to support the claim." },
  { answer: "therefore", zh: "因此", pattern: "The data were clear; therefore, the team revised its view." },
  { answer: "significant", zh: "重要的；显著的", pattern: "The change had a significant effect on learning." },
  { answer: "context", zh: "语境", pattern: "The meaning depends on the context of the sentence." },
  { answer: "contrast", zh: "对比", pattern: "The paragraph uses contrast to show two choices." },
];

export function buildOriginalQuestions(packSlug: string, page: number, pageSize = 20): OriginalQuizQuestion[] {
  const pack = getOriginalQuestionPack(packSlug);
  if (!pack) return [];
  const safePage = Math.max(1, Math.floor(page || 1));
  const start = (safePage - 1) * pageSize;
  const total = pack.multipleChoiceCount + pack.fillBlankCount;
  const end = Math.min(start + pageSize, total);

  return Array.from({ length: Math.max(0, end - start) }, (_, offset) => {
    const index = start + offset + 1;
    const target = pick(grammarTargets, packSeed(packSlug) + index);
    const theme = pick(themes, index + packSeed(packSlug));
    const isChoice = index <= pack.multipleChoiceCount;
    const difficulty = index % 9 === 0 ? "HARD" : index % 4 === 0 ? "MEDIUM" : "EASY";

    if (isChoice) {
      const distractors = grammarTargets.filter((item) => item.answer !== target.answer).slice(0, 3);
      const options = [target, ...distractors].map((item, optionIndex) => ({
        id: `fallback-original-${packSlug}-mcq-${index}-${optionIndex}`,
        label: ["A", "B", "C", "D"][optionIndex],
        content: item.answer,
      }));
      const rotated = options.slice(index % 4).concat(options.slice(0, index % 4)).map((option, optionIndex) => ({ ...option, label: ["A", "B", "C", "D"][optionIndex] }));
      return {
        id: `fallback-original-${packSlug}-mcq-${index}`,
        type: "MULTIPLE_CHOICE",
        prompt: `${pack.zhTitle} · 选择题 ${index}\nChoose the best word to complete the sentence.\nThe article about ${theme} is useful ____ it shows how evidence changes a reader's opinion.`,
        codeSnippet: null,
        difficulty,
        answer: target.answer,
        explanation: `正确答案是 ${target.answer}（${target.zh}）。示例：${target.pattern}`,
        options: rotated,
      };
    }

    const fillIndex = index - pack.multipleChoiceCount;
    return {
      id: `fallback-original-${packSlug}-fill-${fillIndex}`,
      type: "FILL_BLANK",
      prompt: `${pack.zhTitle} · 填空题 ${fillIndex}\nComplete the sentence with one word.\nReaders need enough ______ before they accept a claim about ${theme}.`,
      codeSnippet: null,
      difficulty,
      answer: "evidence",
      explanation: "这里需要 evidence，表示支持观点的证据。填空题统一按单词小写判分。",
      options: [],
    };
  });
}

export function getQuestionPackTotal(pack: OriginalQuestionPack) {
  return pack.multipleChoiceCount + pack.fillBlankCount;
}

export const originalContentSummary = {
  readingArticles: originalReadingPacks.reduce((sum, pack) => sum + pack.targetArticles, 0),
  examMultipleChoice: 3000,
  examFillBlank: 3000,
  gradeMixedQuestions: originalQuestionPacks
    .filter((pack) => pack.slug.startsWith("grade-"))
    .reduce((sum, pack) => sum + pack.multipleChoiceCount + pack.fillBlankCount, 0),
};
