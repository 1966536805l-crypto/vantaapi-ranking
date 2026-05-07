import type { ExamVocabularyPack, ExamVocabularyWord } from "@/lib/exam-content";
import type { SiteLanguage } from "@/lib/language";

type Frame = {
  label: string;
  sentence: string;
  usageZh: string;
};

const packCopy: Record<string, { titleZh: string; shortEn: string; shortZh: string; focusEn: string[]; focusZh: string[] }> = {
  "middle-school-core": {
    titleZh: "初中核心词汇",
    shortEn: "Middle School",
    shortZh: "初中词汇",
    focusEn: ["school life", "basic writing", "reading keywords", "core collocations"],
    focusZh: ["校园生活", "基础写作", "中考阅读", "高频搭配"],
  },
  "high-school-core": {
    titleZh: "高中核心词汇",
    shortEn: "High School",
    shortZh: "高中词汇",
    focusEn: ["advanced reading", "essay writing", "continuation writing", "core collocations"],
    focusZh: ["高中阅读", "议论文写作", "读后续写", "核心搭配"],
  },
  "ielts-5000": {
    titleZh: "雅思 5000 词汇",
    shortEn: "IELTS 5000",
    shortZh: "雅思 5000",
    focusEn: ["topic vocabulary", "academic collocations", "Task 2 writing", "spoken precision"],
    focusZh: ["话题词汇", "学术搭配", "Task 2 写作", "口语精准表达"],
  },
  "toefl-5000": {
    titleZh: "托福 5000 词汇",
    shortEn: "TOEFL 5000",
    shortZh: "托福 5000",
    focusEn: ["lecture verbs", "campus reading", "academic nouns", "evidence and inference"],
    focusZh: ["讲座动词", "校园阅读", "学术名词", "证据与推断"],
  },
  "cet-4-core": {
    titleZh: "大学英语四级核心词汇",
    shortEn: "CET 4",
    shortZh: "四级",
    focusEn: ["core high frequency", "reading keywords", "translation collocations", "listening recognition"],
    focusZh: ["基础高频", "阅读关键词", "翻译搭配", "听力识别"],
  },
  "cet-6-core": {
    titleZh: "大学英语六级进阶词汇",
    shortEn: "CET 6",
    shortZh: "六级",
    focusEn: ["abstract nouns", "argument verbs", "advanced reading", "writing transitions"],
    focusZh: ["抽象名词", "论证动词", "高级阅读", "写作过渡"],
  },
  "postgraduate-core": {
    titleZh: "考研英语核心词汇",
    shortEn: "Postgraduate",
    shortZh: "考研英语",
    focusEn: ["long sentence parsing", "academic argument", "translation chunks", "writing frames"],
    focusZh: ["长难句", "学术论证", "翻译块", "写作框架"],
  },
};

const frameCopy: Record<string, { labelEn: string; usageEn: string }> = {
  观点引入: {
    labelEn: "Claim opening",
    usageEn: "Use at the beginning of an essay to introduce a widely accepted idea",
  },
  让步转折: {
    labelEn: "Concession turn",
    usageEn: "Use when balancing two sides of an IELTS CET6 or postgraduate argument",
  },
  因果分析: {
    labelEn: "Cause analysis",
    usageEn: "Use when explaining social education or technology related causes",
  },
  证据支撑: {
    labelEn: "Evidence support",
    usageEn: "Use in academic writing when evidence needs to carry the point",
  },
  阅读推断: {
    labelEn: "Reading inference",
    usageEn: "Use when explaining implied meaning in reading questions",
  },
  对比总结: {
    labelEn: "Contrast summary",
    usageEn: "Use when summarizing a contrast inside a long sentence or paragraph",
  },
};

export const vocabularyHubCopy = {
  en: {
    eyebrow: "Vocabulary System",
    title: "Exam Vocabulary Hub",
    subtitle: "Middle school high school IELTS 5000 TOEFL 5000 CET 4 CET 6 and postgraduate vocabulary with priority words collocations sentence frames and quiz conversion",
    sentenceEyebrow: "Key Sentences",
    sentenceTitle: "Reusable writing and reading frames",
    quizLabel: "Start quiz",
    logicEyebrow: "Reading Logic",
    logicTitle: "Reading logic words",
  },
  zh: {
    eyebrow: "词汇系统",
    title: "考试词汇中心",
    subtitle: "初中词汇 高中词汇 雅思 5000 托福 5000 四级 六级 考研英语 重点词 搭配 例句 考点 练习全部集中",
    sentenceEyebrow: "重点句式",
    sentenceTitle: "写作阅读高频句式",
    quizLabel: "开始测验",
    logicEyebrow: "阅读逻辑",
    logicTitle: "阅读逻辑词",
  },
} as const;

export const vocabularyPackCopy = {
  en: {
    back: "Back to vocabulary hub",
    subtitle: "A structured word training target with priority words collocations sentence frames and quiz conversion",
    wordsEyebrow: "Priority Words",
    wordsTitle: "High value word cards",
    sentenceEyebrow: "Sentence Bank",
    sentenceTitle: "Key frames",
  },
  zh: {
    back: "返回词汇中心",
    subtitle: "结构化词汇训练目标 包含重点词 搭配 例句 句式和测验转换",
    wordsEyebrow: "重点词",
    wordsTitle: "高频词卡",
    sentenceEyebrow: "句式库",
    sentenceTitle: "核心句式",
  },
} as const;

const readingLogicWords = {
  en: [
    "however / nevertheless",
    "therefore / thus",
    "whereas / while",
    "moreover / furthermore",
    "in contrast",
    "as a result",
    "provided that",
    "rather than",
    "namely / that is",
    "despite / notwithstanding",
    "consequently",
    "in terms of",
  ],
  zh: [
    "however / nevertheless 然而",
    "therefore / thus 因此",
    "whereas / while 对比",
    "moreover / furthermore 此外",
    "in contrast 相比之下",
    "as a result 结果",
    "provided that 如果 只要",
    "rather than 而不是",
    "namely / that is 即 也就是说",
    "despite / notwithstanding 尽管",
    "consequently 因而",
    "in terms of 就某方面而言",
  ],
} as const;

export function getPackDisplayTitle(pack: ExamVocabularyPack, language: SiteLanguage) {
  return language === "zh" ? packCopy[pack.slug]?.titleZh ?? pack.title : pack.title;
}

export function getPackShortTitle(pack: ExamVocabularyPack, language: SiteLanguage) {
  const copy = packCopy[pack.slug];
  if (!copy) return pack.shortTitle;
  return language === "zh" ? copy.shortZh : copy.shortEn;
}

export function getPackFocus(pack: ExamVocabularyPack, language: SiteLanguage) {
  const copy = packCopy[pack.slug];
  if (!copy) return pack.focus;
  return language === "zh" ? copy.focusZh : copy.focusEn;
}

export function getFrameLabel(frame: Frame, language: SiteLanguage) {
  return language === "zh" ? frame.label : frameCopy[frame.label]?.labelEn ?? frame.label;
}

export function getFrameUsage(frame: Frame, language: SiteLanguage) {
  return language === "zh" ? frame.usageZh : frameCopy[frame.label]?.usageEn ?? frame.usageZh;
}

export function getReadingLogicWords(language: SiteLanguage) {
  return readingLogicWords[language];
}

export function getWordMeaning(word: ExamVocabularyWord, language: SiteLanguage) {
  return language === "zh" ? word.meaningZh : word.meaningEn;
}

export function getWordNote(word: ExamVocabularyWord, language: SiteLanguage) {
  return language === "zh" ? word.examNote : `Use with ${word.collocation} in exam writing and reading practice`;
}
