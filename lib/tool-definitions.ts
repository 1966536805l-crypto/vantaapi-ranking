export type ToolSlug =
  | "github-repo-analyzer"
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
  whatItDoes: string[];
  audience: string[];
  inputExample: string;
  outputExample: string;
  limitations: string[];
  faq: { question: string; answer: string }[];
};

export const toolDefinitions: ToolDefinition[] = [
  {
    slug: "github-repo-analyzer",
    code: "G",
    title: "GitHub Launch Pack",
    shortTitle: "Launch",
    description: "Turn a public GitHub repository into a launch and contribution package without reading code line by line",
    promise: "Run commands environment checklist README gaps CI checks deployment checklist issue labels and PR review checklist",
    inputHint: "Paste a public GitHub repository URL such as https://github.com/vercel/next.js",
    useCases: ["Prepare an open source contribution", "Create a repo handoff", "Check launch readiness"],
    whatItDoes: ["Reads public repo metadata and selected root setup files", "Extracts commands environment signals CI presence and deployment clues", "Builds a copyable launch pack so you do not spend an hour making the checklist manually"],
    audience: ["Open source contributors", "Solo builders preparing a release", "Developers joining an unfamiliar repo"],
    inputExample: "https://github.com/vercel/swr",
    outputExample: "Setup commands env checklist README fixes CI/deploy checklist issue labels and PR review checklist",
    limitations: ["Public repositories only", "Does not execute or deeply analyze source code", "Private repo support needs scoped auth and audit controls first"],
    faq: [
      { question: "Does it need a GitHub token", answer: "No. The first version only reads public repository metadata and selected public files." },
      { question: "Why is this different from asking AI to read code", answer: "It focuses on the boring release work developers actually lose time on setup commands env files CI deployment README gaps and PR checklists." },
    ],
  },
  {
    slug: "prompt-optimizer",
    code: "P",
    title: "AI Prompt Optimizer",
    shortTitle: "Prompt",
    description: "Turn a rough request into a structured prompt for coding research or product work",
    promise: "Clear role context tasks output format constraints and acceptance criteria",
    inputHint: "Example Build a landing page for an AI tool site",
    useCases: ["Coding tasks", "Research briefs", "Product specs"],
    whatItDoes: ["Converts a rough request into a structured prompt", "Adds role context task list output format and constraints", "Creates acceptance criteria so the answer is easier to verify"],
    audience: ["People writing with AI every day", "Developers turning vague ideas into build tasks", "Students making study or research prompts"],
    inputExample: "Build a dashboard for tracking daily Python practice",
    outputExample: "Role goal context tasks output format constraints and acceptance criteria ready to paste into an AI chat",
    limitations: ["Local template based output only", "It does not guarantee model quality", "Sensitive or private context should be removed before sharing with third party AI tools"],
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
    whatItDoes: ["Detects the likely language", "Explains purpose key names risks and learning notes", "Highlights common static bug patterns"],
    audience: ["Beginners reading code they did not write", "Reviewers who need a quick first pass", "Teachers turning snippets into notes"],
    inputExample: "async function loadUser(id) { const res = await fetch('/api/users/' + id); return (await res.json()).user.name; }",
    outputExample: "Purpose key variables potential bugs and learning notes with copyable sections",
    limitations: ["Static reading only", "Does not run compile or typecheck code", "Complex projects still need real tests and runtime logs"],
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
    whatItDoes: ["Classifies likely causes from error text and code", "Gives a short reproduction and debug checklist", "Creates a repair template to start from"],
    audience: ["Learners stuck on the first stack trace", "Frontend developers debugging API failures", "Teams writing incident notes"],
    inputExample: "TypeError Cannot read properties of undefined reading name plus the failing function",
    outputExample: "Severity likely cause debug steps repair template and verification checklist",
    limitations: ["Needs the exact error text to be useful", "Cannot see server logs unless you paste them", "The repair template is a starting point not a guaranteed patch"],
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
    whatItDoes: ["Turns one request shape into curl fetch axios and Python examples", "Normalizes headers and JSON body", "Keeps snippets inspectable before you run them"],
    audience: ["API documentation writers", "Frontend developers wiring an endpoint", "Backend developers sharing test requests"],
    inputExample: "POST https://api.example.com/v1/users with Authorization and JSON body",
    outputExample: "curl fetch axios and Python requests snippets using the same method headers and body",
    limitations: ["Does not send the request", "Invalid JSON is preserved for you to fix", "Generated examples still need real endpoint auth and environment values"],
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
    whatItDoes: ["Formats JSON and creates a minified version", "Runs browser regex matches against sample text", "Converts seconds milliseconds and date strings"],
    audience: ["Developers debugging payloads", "SEO and data workers checking structured data", "Anyone converting logs and timestamps"],
    inputExample: "{\"name\":\"VantaAPI\",\"ok\":true} plus a regex or timestamp",
    outputExample: "JSON status formatted JSON minified JSON regex matches ISO local Unix and millisecond time",
    limitations: ["Regex uses browser JavaScript behavior", "Date strings depend on browser parsing rules", "Large payloads should still be checked in dedicated tooling"],
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
    whatItDoes: ["Builds a 30 day plan by direction", "Breaks work into daily tasks weekly milestones and a final project", "Keeps the route practical instead of course-like"],
    audience: ["Zero base learners", "Career switchers choosing a first direction", "Builders who need a month of structured momentum"],
    inputExample: "Choose Frontend or Python automation",
    outputExample: "Daily plan weekly milestones stack final project and daily rhythm",
    limitations: ["It is a planning tool not a live tutor", "The plan should be adapted to your available time", "It does not replace building and reviewing real projects"],
    faq: [
      { question: "Is the plan beginner friendly", answer: "Yes. Each route starts with environment syntax reading examples and small builds." },
      { question: "How should I use the plan", answer: "Use it as a daily checklist and keep one small public progress note per day." },
    ],
  },
];

export function getToolDefinition(slug?: string) {
  return toolDefinitions.find((tool) => tool.slug === slug) || toolDefinitions[0];
}
