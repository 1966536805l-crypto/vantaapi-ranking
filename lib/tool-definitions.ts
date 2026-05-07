export type ToolSlug =
  | "prompt-optimizer"
  | "code-explainer"
  | "bug-finder"
  | "api-request-generator"
  | "dev-utilities"
  | "learning-roadmap";

export type ToolDefinition = {
  slug: ToolSlug;
  code: string;
  title: string;
  shortTitle: string;
  description: string;
  promise: string;
  inputHint: string;
  useCases: string[];
  faq: { question: string; answer: string }[];
};

export const toolDefinitions: ToolDefinition[] = [
  {
    slug: "prompt-optimizer",
    code: "P",
    title: "AI Prompt Optimizer",
    shortTitle: "Prompt",
    description: "Turn a rough request into a structured prompt for coding research or product work",
    promise: "Clear role context tasks output format constraints and acceptance criteria",
    inputHint: "Example Build a landing page for an AI tool site",
    useCases: ["Coding tasks", "Research briefs", "Product specs"],
    faq: [
      { question: "Does it call an AI model", answer: "No. The first version reshapes your request locally into a reusable prompt structure." },
      { question: "What makes a prompt stronger", answer: "A clear role context task list output format constraints and acceptance criteria." },
    ],
  },
  {
    slug: "code-explainer",
    code: "C",
    title: "Code Explainer",
    shortTitle: "Explain",
    description: "Paste code and get purpose key variables risks and learning notes",
    promise: "Readable explanation with bug signals and study takeaways",
    inputHint: "Paste JavaScript Python C++ SQL or HTML",
    useCases: ["Read unfamiliar snippets", "Prepare code reviews", "Learn from examples"],
    faq: [
      { question: "Which languages work best", answer: "JavaScript TypeScript Python C++ SQL and HTML have the strongest local detection rules." },
      { question: "Is this a compiler", answer: "No. It is a fast static reading assistant for explanation risks and learning notes." },
    ],
  },
  {
    slug: "bug-finder",
    code: "B",
    title: "Bug Finder",
    shortTitle: "Bug",
    description: "Paste an error and a code snippet to get likely causes steps and a fix direction",
    promise: "Cause checklist reproduction path and repair template",
    inputHint: "Paste error message plus the smallest related code",
    useCases: ["Runtime errors", "API failures", "TypeScript and dependency issues"],
    faq: [
      { question: "What should I paste", answer: "Paste the exact error message stack trace if available and the smallest related code snippet." },
      { question: "Why keep the code small", answer: "Smaller reproductions make the real failing value and line easier to isolate." },
    ],
  },
  {
    slug: "api-request-generator",
    code: "A",
    title: "API Request Generator",
    shortTitle: "API",
    description: "Generate curl fetch axios and Python requests examples from endpoint headers and body",
    promise: "Ready to copy request snippets for docs testing and debugging",
    inputHint: "Endpoint method headers and JSON body",
    useCases: ["API docs", "Backend testing", "Frontend integration"],
    faq: [
      { question: "Can I use custom headers", answer: "Yes. Enter one header per line using the Name colon Value format." },
      { question: "Does it send the request", answer: "No. It generates snippets only so you can inspect them before running." },
    ],
  },
  {
    slug: "dev-utilities",
    code: "U",
    title: "JSON Regex Timestamp Utilities",
    shortTitle: "Utilities",
    description: "Format JSON test regex convert timestamps and keep common SEO tools in one place",
    promise: "Fast validation conversion and copyable outputs",
    inputHint: "Paste JSON regex text or timestamp",
    useCases: ["Format JSON", "Test regex", "Convert timestamps"],
    faq: [
      { question: "Does invalid JSON get modified", answer: "No. The tool reports the parse error so you can fix the source." },
      { question: "Which timestamp formats work", answer: "Unix seconds milliseconds and date strings supported by the browser date parser." },
    ],
  },
  {
    slug: "learning-roadmap",
    code: "R",
    title: "AI Coding Roadmap",
    shortTitle: "Roadmap",
    description: "Choose a direction and generate a practical 30 day coding plan",
    promise: "Daily tasks weekly milestones and a final project",
    inputHint: "Zero base frontend Python automation or indie hacking",
    useCases: ["Zero base learning", "Frontend practice", "Python automation", "Indie MVP planning"],
    faq: [
      { question: "Is the plan beginner friendly", answer: "Yes. Each route starts with environment syntax reading examples and small builds." },
      { question: "How should I use the plan", answer: "Use it as a daily checklist and keep one small public progress note per day." },
    ],
  },
];

export function getToolDefinition(slug?: string) {
  return toolDefinitions.find((tool) => tool.slug === slug) || toolDefinitions[0];
}
