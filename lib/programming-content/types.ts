export type ProgrammingLanguageSlug =
  | "javascript"
  | "typescript"
  | "python"
  | "cpp"
  | "java"
  | "go"
  | "rust"
  | "sql"
  | "html-css"
  | "bash"
  | "csharp"
  | "php"
  | "swift"
  | "kotlin"
  | "ruby"
  | "dart"
  | "scala"
  | "r"
  | "julia"
  | "matlab"
  | "lua"
  | "perl"
  | "elixir"
  | "erlang"
  | "haskell"
  | "clojure"
  | "fsharp"
  | "ocaml"
  | "c"
  | "assembly"
  | "solidity"
  | "objective-c"
  | "visual-basic"
  | "zig"
  | "nim"
  | "crystal"
  | "groovy"
  | "powershell"
  | "fortran"
  | "cobol"
  | "pascal"
  | "prolog"
  | "racket"
  | "scheme"
  | "elm"
  | "gleam"
  | "v"
  | "d"
  | "common-lisp"
  | "smalltalk"
  | "abap"
  | "delphi"
  | "tcl";

export type ProgrammingQuestionType = "MULTIPLE_CHOICE" | "FILL_BLANK" | "PRACTICAL";

export type ProgrammingTutorialSection = {
  title: string;
  focus: string;
  rules: string[];
  sampleCode: string;
  sampleOutput: string;
};

export type LanguageAtom = {
  concept: string;
  choiceAnswer: string;
  choiceDistractors: string[];
  fillPrompt: string;
  fillAnswer: string;
  practiceTask: string;
  practiceAnswer: string;
  requiredKeywords: string[];
  runOutput: string;
  explanation: string;
};

export type ProgrammingLanguage = {
  slug: ProgrammingLanguageSlug;
  title: string;
  shortTitle: string;
  role: string;
  runtime: string;
  runCommand: string;
  fileName: string;
  dailyHabit: string;
  strengths: string[];
  tutorialSections: ProgrammingTutorialSection[];
  atoms: LanguageAtom[];
};

export type ProgrammingQuestion = {
  id: string;
  index: number;
  type: ProgrammingQuestionType;
  title: string;
  prompt: string;
  codeSnippet: string;
  options: string[];
  answer: string;
  explanation: string;
  hints: string[];
  runOutput: string;
  requiredKeywords: string[];
};
