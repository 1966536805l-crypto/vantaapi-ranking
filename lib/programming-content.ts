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

type LanguageAtom = {
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

export const programmingBankPlan = {
  perLanguage: 5000,
  multipleChoice: 2000,
  fillBlank: 2000,
  practical: 1000,
};

export const learningMethodStack = [
  {
    title: "Recall from memory",
    body: "Read a small point then write it back without looking",
  },
  {
    title: "Trace the code",
    body: "Write variable values line by line before you run the answer",
  },
  {
    title: "Type it yourself",
    body: "Copy less type more and fix one small error at a time",
  },
  {
    title: "Mix topics",
    body: "Move between syntax data structures debugging and tiny projects",
  },
  {
    title: "Hints after trying",
    body: "Try once without help then open one hint at a time",
  },
  {
    title: "Build small things",
    body: "Turn each block into a small script page query or utility",
  },
];

const sharedChoiceDistractors = [
  "memorize random syntax without running anything",
  "skip error messages and guess",
  "rewrite the whole file before isolating the issue",
  "depend on hints before the first attempt",
];

function tutorial(
  title: string,
  focus: string,
  sampleCode: string,
  sampleOutput: string,
  rules: string[],
): ProgrammingTutorialSection {
  return { title, focus, sampleCode, sampleOutput, rules };
}

function atom(
  concept: string,
  choiceAnswer: string,
  fillPrompt: string,
  fillAnswer: string,
  practiceTask: string,
  practiceAnswer: string,
  requiredKeywords: string[],
  runOutput: string,
  explanation: string,
): LanguageAtom {
  return {
    concept,
    choiceAnswer,
    choiceDistractors: sharedChoiceDistractors,
    fillPrompt,
    fillAnswer,
    practiceTask,
    practiceAnswer,
    requiredKeywords,
    runOutput,
    explanation,
  };
}

export const programmingLanguages: ProgrammingLanguage[] = [
  {
    slug: "javascript",
    title: "JavaScript",
    shortTitle: "JS",
    role: "browser apps automation and API glue",
    runtime: "Browser console or Node.js",
    runCommand: "node app.js",
    fileName: "app.js",
    dailyHabit: "Use console.log and DevTools before adding abstractions",
    strengths: ["DOM", "async", "JSON", "APIs", "full stack"],
    tutorialSections: [
      tutorial("Values and variables", "const let string number boolean object array", "const score = 40 + 2;\nconsole.log(score);", "42", ["Prefer const first", "Use let only when the value changes", "Inspect values with console.log"]),
      tutorial("Functions", "input output return reusable actions", "function add(a, b) {\n  return a + b;\n}\nconsole.log(add(2, 3));", "5", ["Name functions with verbs", "Return values instead of printing inside every function", "Keep one function focused"]),
      tutorial("Async APIs", "fetch promise await error handling", "async function load() {\n  return await Promise.resolve(\"ready\");\n}\nload().then(console.log);", "ready", ["Check network errors", "Await the promise before reading data", "Keep API parsing separate"]),
    ],
    atoms: [
      atom("constant variable", "Use const for a value that should not be reassigned", "Complete: ____ total = 42;", "const", "Create a constant named total with value 42 and print it", "const total = 42;\nconsole.log(total);", ["const", "total", "42", "console.log"], "42", "const protects a binding from reassignment and is the safest default"),
      atom("function return", "A function should return the computed value when other code needs it", "Complete: function add(a, b) { ____ a + b; }", "return", "Write a function add that returns the sum of two numbers", "function add(a, b) {\n  return a + b;\n}", ["function", "add", "return"], "5", "return sends a value back to the caller"),
      atom("array mapping", "map creates a new array by transforming each item", "Complete: nums.____(n => n * 2)", "map", "Double an array with map", "const doubled = nums.map((n) => n * 2);", ["map", "=>", "* 2"], "2 4 6", "map is best when every item becomes one new item"),
      atom("async await", "await pauses inside an async function until a promise resolves", "Complete: const data = ____ fetch(url);", "await", "Write an async function that awaits a fetch call", "async function load(url) {\n  const response = await fetch(url);\n  return response.json();\n}", ["async", "await", "fetch"], "resolved response", "await keeps async code readable while still returning a promise"),
    ],
  },
  {
    slug: "typescript",
    title: "TypeScript",
    shortTitle: "TS",
    role: "typed JavaScript for product scale",
    runtime: "TypeScript compiler then Node.js",
    runCommand: "tsc app.ts && node app.js",
    fileName: "app.ts",
    dailyHabit: "Let the type error teach the missing contract",
    strengths: ["types", "interfaces", "React", "APIs", "refactors"],
    tutorialSections: [
      tutorial("Typed values", "string number boolean array object", "const name: string = \"Ada\";\nconsole.log(name);", "Ada", ["Type public data shapes", "Let local inference work", "Fix red squiggles early"]),
      tutorial("Interfaces", "object contracts reusable shapes", "interface User { name: string }\nconst user: User = { name: \"Ada\" };\nconsole.log(user.name);", "Ada", ["Interfaces describe object shape", "Prefer exact fields", "Use readable names"]),
      tutorial("Narrowing", "unknown union guard safe access", "function label(x: string | number) {\n  return typeof x === \"string\" ? x.toUpperCase() : x + 1;\n}", "ADA or number plus one", ["Check before using", "Use typeof and in", "Avoid any when learning"]),
    ],
    atoms: [
      atom("type annotation", "Add a type when a value is part of a contract", "Complete: const age: ____ = 18;", "number", "Create a typed number variable named age", "const age: number = 18;", ["age", "number", "18"], "18", "A type annotation states what values are allowed"),
      atom("interface shape", "interface describes the required fields of an object", "Complete: ____ User { name: string }", "interface", "Define a User interface with name string", "interface User {\n  name: string;\n}", ["interface", "User", "name", "string"], "type ok", "Interfaces make data contracts visible"),
      atom("union narrowing", "Check the actual type before using type specific methods", "Complete: typeof value === ____", "\"string\"", "Narrow a string or number before uppercasing", "if (typeof value === \"string\") {\n  return value.toUpperCase();\n}", ["typeof", "string", "toUpperCase"], "SAFE", "Narrowing turns a broad type into a safe type"),
      atom("generic array", "Array<T> or T[] stores a list of one item type", "Complete: const ids: ____[] = [1, 2, 3];", "number", "Create a typed array of numbers", "const ids: number[] = [1, 2, 3];", ["number", "ids", "[]"], "1 2 3", "Typed arrays prevent mixing unrelated values"),
    ],
  },
  {
    slug: "python",
    title: "Python",
    shortTitle: "Py",
    role: "automation data scripts and backend APIs",
    runtime: "Python 3",
    runCommand: "python app.py",
    fileName: "app.py",
    dailyHabit: "Use a tiny script and print the data shape after every transformation",
    strengths: ["scripts", "data", "APIs", "automation", "backend"],
    tutorialSections: [
      tutorial("Variables", "names lists dictionaries strings", "score = 40 + 2\nprint(score)", "42", ["Indentation matters", "Use descriptive names", "Print intermediate values"]),
      tutorial("Functions", "def parameters return", "def add(a, b):\n    return a + b\nprint(add(2, 3))", "5", ["Use def to name work", "Indent the body", "Return the result"]),
      tutorial("Loops", "for ranges lists dictionaries", "for item in [\"a\", \"b\"]:\n    print(item)", "a\nb", ["Loop over values directly", "Use enumerate when index matters", "Keep loop bodies short"]),
    ],
    atoms: [
      atom("function definition", "Use def to create a reusable function", "Complete: ____ add(a, b):", "def", "Write a function add that returns a plus b", "def add(a, b):\n    return a + b", ["def", "add", "return"], "5", "def starts a function block in Python"),
      atom("list append", "append adds one item to the end of a list", "Complete: items.____(\"task\")", "append", "Create a list and append one task", "items = []\nitems.append(\"task\")", ["items", "append", "task"], "task", "append mutates the list by adding one element"),
      atom("dictionary access", "Use a key to read a value from a dictionary", "Complete: user[____]", "\"name\"", "Read the name field from a user dictionary", "user = {\"name\": \"Ada\"}\nprint(user[\"name\"])", ["user", "name", "print"], "Ada", "Dictionaries map keys to values"),
      atom("for loop", "for repeats work for every item in a sequence", "Complete: ____ item in items:", "for", "Loop over items and print each item", "for item in items:\n    print(item)", ["for", "item", "print"], "each item", "Python loops over iterable values directly"),
    ],
  },
  {
    slug: "cpp",
    title: "C++",
    shortTitle: "C++",
    role: "performance systems algorithms and contests",
    runtime: "C++17 compiler",
    runCommand: "g++ main.cpp -std=c++17 && ./a.out",
    fileName: "main.cpp",
    dailyHabit: "Trace memory values indexes and container state before compiling",
    strengths: ["algorithms", "STL", "memory", "performance", "OOP"],
    tutorialSections: [
      tutorial("Input output", "cin cout headers namespace", "#include <iostream>\nusing namespace std;\nint main() {\n  cout << 42;\n}", "42", ["Include the right headers", "Use cout for output", "Return from main"]),
      tutorial("Types", "int double bool string vector", "int score = 40 + 2;\ncout << score;", "42", ["Choose the right type", "Watch integer division", "Initialize variables"]),
      tutorial("STL", "vector map set queue stack", "vector<int> v = {1, 2, 3};\ncout << v.size();", "3", ["Know the container behavior", "Use size for count", "Trace push pop operations"]),
    ],
    atoms: [
      atom("output stream", "cout prints values to standard output", "Complete: ____ << 42;", "cout", "Print 42 with cout", "cout << 42;", ["cout", "<<", "42"], "42", "cout sends values to the output stream"),
      atom("integer type", "int stores whole numbers", "Complete: ____ count = 3;", "int", "Declare an int count with value 3", "int count = 3;", ["int", "count", "3"], "3", "int is the default whole number type"),
      atom("vector push", "push_back appends an item to a vector", "Complete: v.____(7);", "push_back", "Create a vector and push 7", "vector<int> v;\nv.push_back(7);", ["vector", "push_back", "7"], "7", "vector grows dynamically when pushing items"),
      atom("reference", "A reference is another name for the same value", "Complete: int____ ref = value;", "&", "Create a reference to value and modify it", "int value = 1;\nint& ref = value;\nref = 2;", ["int&", "ref", "value"], "2", "Changing a reference changes the original variable"),
    ],
  },
  {
    slug: "java",
    title: "Java",
    shortTitle: "Java",
    role: "backend Android enterprise and typed OOP",
    runtime: "JDK",
    runCommand: "javac Main.java && java Main",
    fileName: "Main.java",
    dailyHabit: "Keep classes small and read compiler errors from top to bottom",
    strengths: ["OOP", "backend", "Android", "types", "ecosystem"],
    tutorialSections: [
      tutorial("Class entry", "class main method static", "class Main {\n  public static void main(String[] args) {\n    System.out.println(42);\n  }\n}", "42", ["The file starts from a class", "main is the entry point", "System.out.println prints"]),
      tutorial("Types", "int String boolean arrays", "int score = 42;\nSystem.out.println(score);", "42", ["Declare types explicitly", "Use String with capital S", "Initialize before use"]),
      tutorial("Objects", "class fields constructor methods", "class User {\n  String name;\n  User(String name) { this.name = name; }\n}", "object created", ["Constructor initializes fields", "this means current object", "Methods hold behavior"]),
    ],
    atoms: [
      atom("main method", "public static void main is the Java entry point", "Complete: public static void ____(String[] args)", "main", "Write a Java main method that prints 42", "public static void main(String[] args) {\n  System.out.println(42);\n}", ["main", "String", "System.out.println"], "42", "The JVM looks for the main method to start a program"),
      atom("print line", "System.out.println prints a line", "Complete: System.out.____(\"Hi\");", "println", "Print Hi in Java", "System.out.println(\"Hi\");", ["System.out", "println", "Hi"], "Hi", "println prints the value and a newline"),
      atom("class field", "A field stores object state", "Complete: ____ name;", "String", "Create a String field named name", "String name;", ["String", "name"], "field ok", "Fields belong to objects or classes"),
      atom("constructor this", "this.name refers to the current object's field", "Complete: this.____ = name;", "name", "Assign constructor parameter name to field", "this.name = name;", ["this", "name", "="], "assigned", "this disambiguates the field from the parameter"),
    ],
  },
  {
    slug: "go",
    title: "Go",
    shortTitle: "Go",
    role: "cloud services CLIs concurrency and APIs",
    runtime: "Go toolchain",
    runCommand: "go run main.go",
    fileName: "main.go",
    dailyHabit: "Keep errors explicit and handle them immediately",
    strengths: ["APIs", "CLIs", "concurrency", "cloud", "simplicity"],
    tutorialSections: [
      tutorial("Program shape", "package import func main", "package main\nimport \"fmt\"\nfunc main() {\n  fmt.Println(42)\n}", "42", ["Every executable uses package main", "main starts the program", "fmt.Println prints"]),
      tutorial("Variables", "short declaration var slices maps", "score := 42\nfmt.Println(score)", "42", ["Use := inside functions", "Use var for package scope", "Prefer explicit errors"]),
      tutorial("Errors", "return value if err != nil", "value, err := load()\nif err != nil {\n  return err\n}", "error handled", ["Errors are values", "Check err quickly", "Return early"]),
    ],
    atoms: [
      atom("main package", "package main marks an executable program", "Complete: ____ main", "package", "Create the first line of a Go executable", "package main", ["package", "main"], "program package", "Go executables are in package main"),
      atom("print", "fmt.Println prints a line", "Complete: fmt.____(42)", "Println", "Print 42 with fmt.Println", "fmt.Println(42)", ["fmt", "Println", "42"], "42", "fmt.Println is the beginner output tool"),
      atom("short declaration", ":= declares and assigns inside a function", "Complete: score ____ 42", ":=", "Declare score with short declaration", "score := 42", [":=", "score", "42"], "42", "The short declaration keeps local code compact"),
      atom("error check", "if err != nil handles failure explicitly", "Complete: if err ____ nil", "!=", "Write a Go error check", "if err != nil {\n  return err\n}", ["err", "!=", "nil"], "handled", "Go makes error handling visible"),
    ],
  },
  {
    slug: "rust",
    title: "Rust",
    shortTitle: "Rust",
    role: "safe systems performance and reliable tooling",
    runtime: "Cargo or rustc",
    runCommand: "cargo run",
    fileName: "main.rs",
    dailyHabit: "Read ownership errors as design feedback instead of fighting them",
    strengths: ["ownership", "safety", "systems", "WebAssembly", "CLI"],
    tutorialSections: [
      tutorial("Entry", "fn main println macro", "fn main() {\n  println!(\"{}\", 42);\n}", "42", ["main is the entry point", "println! is a macro", "Use braces for blocks"]),
      tutorial("Bindings", "let mut ownership borrowing", "let mut score = 40;\nscore += 2;\nprintln!(\"{}\", score);", "42", ["Bindings are immutable by default", "Use mut only when needed", "Borrow instead of cloning blindly"]),
      tutorial("Result", "match Ok Err question mark", "let value: Result<i32, &str> = Ok(42);", "Ok 42", ["Use Result for recoverable errors", "Handle Err", "Use question mark in functions returning Result"]),
    ],
    atoms: [
      atom("main function", "fn main starts a Rust binary", "Complete: ____ main() {}", "fn", "Write an empty Rust main function", "fn main() {\n}", ["fn", "main"], "runs", "fn defines a function in Rust"),
      atom("println macro", "println! prints formatted output", "Complete: ____!(\"{}\", 42);", "println", "Print 42 in Rust", "println!(\"{}\", 42);", ["println!", "42"], "42", "Macros use exclamation marks in calls"),
      atom("mutable binding", "mut allows a binding to change", "Complete: let ____ score = 1;", "mut", "Create a mutable score and increment it", "let mut score = 1;\nscore += 1;", ["mut", "score", "+="], "2", "Rust bindings are immutable unless marked mut"),
      atom("match result", "match handles each possible enum case", "Complete: ____ value { Ok(x) => x, Err(_) => 0 }", "match", "Match a Result and return a fallback on Err", "match value {\n  Ok(x) => x,\n  Err(_) => 0,\n}", ["match", "Ok", "Err"], "safe value", "match forces explicit handling of cases"),
    ],
  },
  {
    slug: "sql",
    title: "SQL",
    shortTitle: "SQL",
    role: "data querying product analytics and databases",
    runtime: "PostgreSQL compatible SQL",
    runCommand: "psql -f query.sql",
    fileName: "query.sql",
    dailyHabit: "Start with SELECT columns then add WHERE then JOIN then aggregate",
    strengths: ["queries", "analytics", "joins", "aggregation", "databases"],
    tutorialSections: [
      tutorial("Select", "columns table rows", "SELECT name, score FROM users;", "name score rows", ["Select only needed columns", "Read from one table first", "Add limits while exploring"]),
      tutorial("Filter", "where order limit", "SELECT name FROM users WHERE score >= 60;", "passing users", ["WHERE filters rows", "ORDER BY sorts", "LIMIT protects exploration"]),
      tutorial("Group", "count sum avg group by", "SELECT role, COUNT(*) FROM users GROUP BY role;", "counts per role", ["Aggregate after filtering", "Group by non aggregate columns", "Name metrics clearly"]),
    ],
    atoms: [
      atom("select columns", "SELECT chooses columns from a result set", "Complete: ____ name FROM users;", "SELECT", "Select the name column from users", "SELECT name FROM users;", ["SELECT", "name", "FROM"], "name rows", "SELECT defines the output columns"),
      atom("where filter", "WHERE keeps only rows matching a condition", "Complete: SELECT * FROM users ____ active = true;", "WHERE", "Filter active users", "SELECT * FROM users WHERE active = true;", ["WHERE", "active", "true"], "active rows", "WHERE filters before grouping"),
      atom("count aggregate", "COUNT returns how many rows match", "Complete: SELECT ____(*) FROM users;", "COUNT", "Count all users", "SELECT COUNT(*) FROM users;", ["COUNT", "*", "FROM"], "42", "COUNT is the standard row count aggregate"),
      atom("join tables", "JOIN combines rows from related tables", "Complete: users u ____ orders o ON u.id = o.user_id", "JOIN", "Join users with orders", "SELECT u.name, o.total\nFROM users u\nJOIN orders o ON u.id = o.user_id;", ["JOIN", "ON", "user_id"], "joined rows", "JOIN needs a relationship condition"),
    ],
  },
  {
    slug: "html-css",
    title: "HTML CSS",
    shortTitle: "HTML CSS",
    role: "page structure styling responsive UI",
    runtime: "Browser",
    runCommand: "open index.html",
    fileName: "index.html",
    dailyHabit: "Build semantic structure first then spacing then responsive states",
    strengths: ["layout", "forms", "accessibility", "responsive", "visual polish"],
    tutorialSections: [
      tutorial("Semantic HTML", "header main section button input", "<main>\n  <h1>Tools</h1>\n  <button>Run</button>\n</main>", "heading and button rendered", ["Use semantic tags", "Labels belong with inputs", "Buttons are for actions"]),
      tutorial("Layout", "flex grid gap alignment", ".panel {\n  display: grid;\n  gap: 12px;\n}", "grid layout", ["Use gap for spacing", "Define stable widths", "Avoid layout shift"]),
      tutorial("Responsive", "media query clamp minmax", "@media (max-width: 640px) {\n  .grid { grid-template-columns: 1fr; }\n}", "single column", ["Test small screens", "Avoid viewport scaled fonts", "Keep controls reachable"]),
    ],
    atoms: [
      atom("heading structure", "h1 names the main page topic", "Complete: <____>Dashboard</____>", "h1", "Create a main heading for Dashboard", "<h1>Dashboard</h1>", ["h1", "Dashboard"], "heading rendered", "Headings create document structure"),
      atom("button action", "button is the correct element for an action", "Complete: <____>Run</____>", "button", "Create a Run button", "<button>Run</button>", ["button", "Run"], "button rendered", "Use buttons for actions and links for navigation"),
      atom("grid layout", "display grid creates a two dimensional layout", "Complete: display: ____;", "grid", "Create a grid panel with gap", ".panel {\n  display: grid;\n  gap: 12px;\n}", ["display", "grid", "gap"], "grid layout", "Grid is stable for dashboards and card lists"),
      atom("media query", "media queries adapt layout to screen size", "Complete: @____ (max-width: 640px)", "media", "Make a grid single column on mobile", "@media (max-width: 640px) {\n  .grid { grid-template-columns: 1fr; }\n}", ["@media", "max-width", "1fr"], "mobile layout", "Responsive CSS changes layout at chosen breakpoints"),
    ],
  },
  {
    slug: "bash",
    title: "Bash",
    shortTitle: "Bash",
    role: "terminal automation deployment and file workflows",
    runtime: "POSIX shell compatible terminal",
    runCommand: "bash script.sh",
    fileName: "script.sh",
    dailyHabit: "Echo variables and use set flags before touching many files",
    strengths: ["CLI", "files", "deployment", "pipes", "automation"],
    tutorialSections: [
      tutorial("Commands", "pwd ls cd echo", "name=\"Ada\"\necho \"$name\"", "Ada", ["Quote variables", "Start with echo", "Run in a small folder first"]),
      tutorial("Pipes", "grep sort uniq wc", "printf \"a\\na\\nb\\n\" | sort | uniq", "a\nb", ["Pipe output to the next command", "Use rg or grep for search", "Count with wc"]),
      tutorial("Scripts", "shebang variables if loops", "for file in *.txt; do\n  echo \"$file\"\ndone", "file names", ["Use set -e for safer scripts", "Quote paths", "Dry run before deleting"]),
    ],
    atoms: [
      atom("echo output", "echo prints text or variable values", "Complete: ____ \"$name\"", "echo", "Print the name variable", "echo \"$name\"", ["echo", "$name"], "Ada", "echo is the fastest way to inspect script state"),
      atom("variable assignment", "Bash assignment has no spaces around equals", "Complete: name____\"Ada\"", "=", "Assign Ada to name and echo it", "name=\"Ada\"\necho \"$name\"", ["name=", "Ada", "echo"], "Ada", "Spaces around equals break Bash assignment"),
      atom("pipe", "A pipe sends output into the next command", "Complete: cat file.txt ____ sort", "|", "Pipe file contents into sort", "cat file.txt | sort", ["|", "sort"], "sorted lines", "Pipes compose small commands"),
      atom("for loop", "for repeats commands for each item", "Complete: ____ file in *.txt; do", "for", "Loop over txt files and echo each name", "for file in *.txt; do\n  echo \"$file\"\ndone", ["for", "in", "done"], "file names", "Bash loops are useful for file automation"),
    ],
  },
  {
    slug: "csharp",
    title: "C Sharp",
    shortTitle: "C#",
    role: "dotnet backend desktop game and enterprise apps",
    runtime: ".NET SDK",
    runCommand: "dotnet run",
    fileName: "Program.cs",
    dailyHabit: "Use the type system and debugger watch window together",
    strengths: ["dotnet", "APIs", "Unity", "desktop", "typed OOP"],
    tutorialSections: [
      tutorial("Program", "Console WriteLine top level statements", "Console.WriteLine(42);", "42", ["Top level statements keep beginners moving", "Use Console.WriteLine", "Keep namespaces clear"]),
      tutorial("Types", "int string bool List", "int score = 42;\nConsole.WriteLine(score);", "42", ["Use explicit types first", "Learn var after basics", "Prefer readable names"]),
      tutorial("Classes", "class properties methods constructor", "class User {\n  public string Name { get; set; } = \"Ada\";\n}", "object shape", ["Properties expose data", "Methods expose behavior", "Constructors set defaults"]),
    ],
    atoms: [
      atom("console output", "Console.WriteLine prints a line", "Complete: Console.____(42);", "WriteLine", "Print 42 in C Sharp", "Console.WriteLine(42);", ["Console", "WriteLine", "42"], "42", "Console.WriteLine is the common beginner output call"),
      atom("string type", "string stores text", "Complete: ____ name = \"Ada\";", "string", "Create a string name variable", "string name = \"Ada\";", ["string", "name", "Ada"], "Ada", "string is the text type in C Sharp"),
      atom("list add", "Add appends an item to a List", "Complete: items.____(\"task\");", "Add", "Create a List string and add task", "var items = new List<string>();\nitems.Add(\"task\");", ["List", "Add", "task"], "task", "List<T> grows dynamically"),
      atom("property", "A property exposes object data with get set", "Complete: public string Name { get; ____; }", "set", "Create an auto property Name", "public string Name { get; set; }", ["public", "Name", "get", "set"], "property ok", "Auto properties are compact object fields with accessors"),
    ],
  },
  {
    slug: "php",
    title: "PHP",
    shortTitle: "PHP",
    role: "web backends CMS and server rendered pages",
    runtime: "PHP CLI or web server",
    runCommand: "php index.php",
    fileName: "index.php",
    dailyHabit: "Keep input validation close to request handling",
    strengths: ["web", "forms", "CMS", "server rendering", "APIs"],
    tutorialSections: [
      tutorial("Variables", "dollar variables echo arrays", "<?php\n$name = \"Ada\";\necho $name;", "Ada", ["Variables start with dollar sign", "echo outputs text", "End statements with semicolons"]),
      tutorial("Functions", "function parameters return", "function add($a, $b) {\n  return $a + $b;\n}", "sum returned", ["Use function for reusable work", "Validate input", "Return values"]),
      tutorial("Arrays", "indexed associative foreach", "$user = [\"name\" => \"Ada\"];\necho $user[\"name\"];", "Ada", ["Associative arrays use keys", "foreach loops through arrays", "Escape output in HTML"]),
    ],
    atoms: [
      atom("variable", "PHP variables begin with a dollar sign", "Complete: ____name = \"Ada\";", "$", "Create a PHP variable name", "$name = \"Ada\";", ["$name", "Ada"], "Ada", "The dollar sign marks a variable"),
      atom("echo", "echo outputs text", "Complete: ____ $name;", "echo", "Echo the name variable", "echo $name;", ["echo", "$name"], "Ada", "echo writes to the response or CLI output"),
      atom("function", "function defines reusable behavior", "Complete: ____ add($a, $b)", "function", "Write an add function", "function add($a, $b) {\n  return $a + $b;\n}", ["function", "add", "return"], "5", "PHP functions use the function keyword"),
      atom("foreach", "foreach loops through arrays", "Complete: ____ ($items as $item)", "foreach", "Loop through items and echo each one", "foreach ($items as $item) {\n  echo $item;\n}", ["foreach", "$items", "as", "echo"], "items", "foreach is the common array loop"),
    ],
  },
];

type GeneratedProgrammingLanguageTemplate = {
  slug: ProgrammingLanguageSlug;
  title: string;
  shortTitle: string;
  role: string;
  runtime: string;
  runCommand: string;
  fileName: string;
  dailyHabit: string;
  strengths: string[];
  printLine: string;
  variableLine: string;
  functionBlock: string;
  collectionBlock: string;
  collectionName: string;
  printKeyword: string;
  variableKeyword: string;
  functionKeyword: string;
  collectionKeyword: string;
};

function generatedLanguage(template: GeneratedProgrammingLanguageTemplate): ProgrammingLanguage {
  return {
    slug: template.slug,
    title: template.title,
    shortTitle: template.shortTitle,
    role: template.role,
    runtime: template.runtime,
    runCommand: template.runCommand,
    fileName: template.fileName,
    dailyHabit: template.dailyHabit,
    strengths: template.strengths,
    tutorialSections: [
      tutorial(
        "Program output",
        `entry point output syntax ${template.printKeyword}`,
        template.printLine,
        "42",
        ["Run the smallest file first", "Print one known value", "Check the output before adding more code"],
      ),
      tutorial(
        "Values and names",
        `variables assignment types ${template.variableKeyword}`,
        template.variableLine,
        "42",
        ["Give values readable names", "Keep one idea per line while learning", "Trace the value before changing it"],
      ),
      tutorial(
        "Functions and collections",
        `function collection ${template.collectionName}`,
        `${template.functionBlock}\n\n${template.collectionBlock}`,
        "reusable code and stored values",
        ["Keep functions small", "Return useful values", "Use the common collection before reaching for frameworks"],
      ),
    ],
    atoms: [
      atom(
        "printing a value",
        "Use the language's standard print statement to inspect a value",
        `Complete the output keyword for ${template.title}: ____`,
        template.printKeyword,
        `Print the number 42 in ${template.title}`,
        template.printLine,
        [template.printKeyword, "42"],
        "42",
        "A visible output is the fastest way to verify that a tiny program is alive",
      ),
      atom(
        "naming a value",
        "Store a value in a readable name before passing it around",
        `Complete the variable keyword for ${template.title}: ____`,
        template.variableKeyword,
        `Create a value named total with 42 in ${template.title}`,
        template.variableLine,
        [template.variableKeyword, "total", "42"],
        "42",
        "A named value gives later code something stable to read",
      ),
      atom(
        "reusable function",
        "A function should take input and return or produce a focused result",
        `Complete the function keyword for ${template.title}: ____`,
        template.functionKeyword,
        `Write a tiny add function in ${template.title}`,
        template.functionBlock,
        [template.functionKeyword, "add"],
        "5",
        "Functions keep repeated logic in one place and make practice easier to test",
      ),
      atom(
        "basic collection",
        `Use ${template.collectionName} to keep related values together`,
        `Complete the collection keyword for ${template.title}: ____`,
        template.collectionKeyword,
        `Create a small ${template.collectionName} example in ${template.title}`,
        template.collectionBlock,
        [template.collectionKeyword],
        "stored values",
        "Collections let a program handle more than one value without creating unrelated names",
      ),
    ],
  };
}

const globalProgrammingLanguageTemplates: GeneratedProgrammingLanguageTemplate[] = [
  {
    slug: "swift",
    title: "Swift",
    shortTitle: "Swift",
    role: "iOS macOS apps safe systems and modern Apple development",
    runtime: "Swift toolchain",
    runCommand: "swift main.swift",
    fileName: "main.swift",
    dailyHabit: "Use optionals deliberately and keep playground examples small",
    strengths: ["iOS", "macOS", "types", "optionals", "UI"],
    printLine: "print(42)",
    variableLine: "let total = 42\nprint(total)",
    functionBlock: "func add(_ a: Int, _ b: Int) -> Int {\n  return a + b\n}",
    collectionBlock: "let scores = [40, 2]\nprint(scores.count)",
    collectionName: "Array",
    printKeyword: "print",
    variableKeyword: "let",
    functionKeyword: "func",
    collectionKeyword: "Array",
  },
  {
    slug: "kotlin",
    title: "Kotlin",
    shortTitle: "Kotlin",
    role: "Android apps backend services and concise JVM development",
    runtime: "Kotlin compiler",
    runCommand: "kotlinc Main.kt -include-runtime -d app.jar && java -jar app.jar",
    fileName: "Main.kt",
    dailyHabit: "Lean on null safety and small functions before class design",
    strengths: ["Android", "JVM", "null safety", "backend", "coroutines"],
    printLine: "println(42)",
    variableLine: "val total = 42\nprintln(total)",
    functionBlock: "fun add(a: Int, b: Int): Int {\n  return a + b\n}",
    collectionBlock: "val scores = listOf(40, 2)\nprintln(scores.size)",
    collectionName: "List",
    printKeyword: "println",
    variableKeyword: "val",
    functionKeyword: "fun",
    collectionKeyword: "listOf",
  },
  {
    slug: "ruby",
    title: "Ruby",
    shortTitle: "Ruby",
    role: "web apps scripts automation and expressive backend code",
    runtime: "Ruby",
    runCommand: "ruby app.rb",
    fileName: "app.rb",
    dailyHabit: "Read code aloud and prefer clear objects over clever shortcuts",
    strengths: ["Rails", "scripts", "objects", "DSLs", "testing"],
    printLine: "puts 42",
    variableLine: "total = 42\nputs total",
    functionBlock: "def add(a, b)\n  a + b\nend",
    collectionBlock: "scores = [40, 2]\nputs scores.length",
    collectionName: "Array",
    printKeyword: "puts",
    variableKeyword: "=",
    functionKeyword: "def",
    collectionKeyword: "Array",
  },
  {
    slug: "dart",
    title: "Dart",
    shortTitle: "Dart",
    role: "Flutter apps cross platform UI and client logic",
    runtime: "Dart SDK",
    runCommand: "dart run main.dart",
    fileName: "main.dart",
    dailyHabit: "Keep widgets small and test plain Dart logic separately",
    strengths: ["Flutter", "UI", "mobile", "types", "async"],
    printLine: "print(42);",
    variableLine: "final total = 42;\nprint(total);",
    functionBlock: "int add(int a, int b) {\n  return a + b;\n}",
    collectionBlock: "final scores = <int>[40, 2];\nprint(scores.length);",
    collectionName: "List",
    printKeyword: "print",
    variableKeyword: "final",
    functionKeyword: "int",
    collectionKeyword: "List",
  },
  {
    slug: "scala",
    title: "Scala",
    shortTitle: "Scala",
    role: "typed JVM services data systems and functional programming",
    runtime: "Scala CLI or sbt",
    runCommand: "scala Main.scala",
    fileName: "Main.scala",
    dailyHabit: "Start with values and transformations before abstract types",
    strengths: ["JVM", "functional", "data", "types", "Spark"],
    printLine: "println(42)",
    variableLine: "val total = 42\nprintln(total)",
    functionBlock: "def add(a: Int, b: Int): Int = {\n  a + b\n}",
    collectionBlock: "val scores = List(40, 2)\nprintln(scores.size)",
    collectionName: "List",
    printKeyword: "println",
    variableKeyword: "val",
    functionKeyword: "def",
    collectionKeyword: "List",
  },
  {
    slug: "r",
    title: "R",
    shortTitle: "R",
    role: "statistics data analysis visualization and research workflows",
    runtime: "Rscript",
    runCommand: "Rscript analysis.R",
    fileName: "analysis.R",
    dailyHabit: "Inspect each vector or data frame before modeling",
    strengths: ["statistics", "plots", "data frames", "research", "reports"],
    printLine: "print(42)",
    variableLine: "total <- 42\nprint(total)",
    functionBlock: "add <- function(a, b) {\n  a + b\n}",
    collectionBlock: "scores <- c(40, 2)\nprint(length(scores))",
    collectionName: "Vector",
    printKeyword: "print",
    variableKeyword: "<-",
    functionKeyword: "function",
    collectionKeyword: "c",
  },
  {
    slug: "julia",
    title: "Julia",
    shortTitle: "Julia",
    role: "scientific computing numerical modeling and fast data work",
    runtime: "Julia",
    runCommand: "julia main.jl",
    fileName: "main.jl",
    dailyHabit: "Write math clearly first then optimize after measuring",
    strengths: ["science", "math", "performance", "arrays", "simulation"],
    printLine: "println(42)",
    variableLine: "total = 42\nprintln(total)",
    functionBlock: "function add(a, b)\n  return a + b\nend",
    collectionBlock: "scores = [40, 2]\nprintln(length(scores))",
    collectionName: "Array",
    printKeyword: "println",
    variableKeyword: "=",
    functionKeyword: "function",
    collectionKeyword: "Array",
  },
  {
    slug: "matlab",
    title: "MATLAB",
    shortTitle: "MATLAB",
    role: "engineering computation matrices simulation and signal analysis",
    runtime: "MATLAB or Octave",
    runCommand: "octave main.m",
    fileName: "main.m",
    dailyHabit: "Check dimensions before trusting a matrix operation",
    strengths: ["matrices", "engineering", "simulation", "signals", "plots"],
    printLine: "disp(42)",
    variableLine: "total = 42;\ndisp(total)",
    functionBlock: "function y = add(a, b)\n  y = a + b;\nend",
    collectionBlock: "scores = [40, 2];\ndisp(length(scores))",
    collectionName: "Matrix",
    printKeyword: "disp",
    variableKeyword: "=",
    functionKeyword: "function",
    collectionKeyword: "Matrix",
  },
  {
    slug: "lua",
    title: "Lua",
    shortTitle: "Lua",
    role: "game scripting embedded automation and lightweight tools",
    runtime: "Lua",
    runCommand: "lua main.lua",
    fileName: "main.lua",
    dailyHabit: "Keep tables simple and print state often while scripting",
    strengths: ["games", "embedded", "tables", "scripts", "plugins"],
    printLine: "print(42)",
    variableLine: "local total = 42\nprint(total)",
    functionBlock: "function add(a, b)\n  return a + b\nend",
    collectionBlock: "local scores = {40, 2}\nprint(#scores)",
    collectionName: "Table",
    printKeyword: "print",
    variableKeyword: "local",
    functionKeyword: "function",
    collectionKeyword: "Table",
  },
  {
    slug: "perl",
    title: "Perl",
    shortTitle: "Perl",
    role: "text processing system scripts and legacy automation",
    runtime: "Perl",
    runCommand: "perl script.pl",
    fileName: "script.pl",
    dailyHabit: "Use strict warnings and make regex work visible",
    strengths: ["text", "regex", "scripts", "files", "automation"],
    printLine: "print 42;",
    variableLine: "my $total = 42;\nprint $total;",
    functionBlock: "sub add {\n  my ($a, $b) = @_;\n  return $a + $b;\n}",
    collectionBlock: "my @scores = (40, 2);\nprint scalar @scores;",
    collectionName: "Array",
    printKeyword: "print",
    variableKeyword: "my",
    functionKeyword: "sub",
    collectionKeyword: "Array",
  },
  {
    slug: "elixir",
    title: "Elixir",
    shortTitle: "Elixir",
    role: "fault tolerant services real time systems and functional APIs",
    runtime: "Elixir",
    runCommand: "elixir app.exs",
    fileName: "app.exs",
    dailyHabit: "Transform data through pipes and keep pattern matches explicit",
    strengths: ["BEAM", "realtime", "functional", "fault tolerance", "Phoenix"],
    printLine: "IO.puts(42)",
    variableLine: "total = 42\nIO.puts(total)",
    functionBlock: "defmodule MathBox do\n  def add(a, b), do: a + b\nend",
    collectionBlock: "scores = [40, 2]\nIO.puts(length(scores))",
    collectionName: "List",
    printKeyword: "IO.puts",
    variableKeyword: "=",
    functionKeyword: "def",
    collectionKeyword: "List",
  },
  {
    slug: "erlang",
    title: "Erlang",
    shortTitle: "Erlang",
    role: "telecom grade concurrency distributed systems and resilient services",
    runtime: "Erlang shell or escript",
    runCommand: "escript main.erl",
    fileName: "main.erl",
    dailyHabit: "Think in processes messages and explicit pattern matches",
    strengths: ["concurrency", "distributed", "fault tolerance", "telecom", "BEAM"],
    printLine: "io:format(\"~p~n\", [42]).",
    variableLine: "Total = 42,\nio:format(\"~p~n\", [Total]).",
    functionBlock: "add(A, B) ->\n  A + B.",
    collectionBlock: "Scores = [40, 2],\nio:format(\"~p~n\", [length(Scores)]).",
    collectionName: "List",
    printKeyword: "io:format",
    variableKeyword: "=",
    functionKeyword: "->",
    collectionKeyword: "List",
  },
  {
    slug: "haskell",
    title: "Haskell",
    shortTitle: "Haskell",
    role: "pure functional programming type driven design and compilers",
    runtime: "GHC",
    runCommand: "runghc Main.hs",
    fileName: "Main.hs",
    dailyHabit: "Let types describe the program before chasing implementation",
    strengths: ["functional", "types", "parsing", "compilers", "purity"],
    printLine: "print 42",
    variableLine: "let total = 42\nprint total",
    functionBlock: "add :: Int -> Int -> Int\nadd a b = a + b",
    collectionBlock: "let scores = [40, 2]\nprint (length scores)",
    collectionName: "List",
    printKeyword: "print",
    variableKeyword: "let",
    functionKeyword: "=",
    collectionKeyword: "List",
  },
  {
    slug: "clojure",
    title: "Clojure",
    shortTitle: "Clojure",
    role: "Lisp on the JVM data transformation and interactive systems",
    runtime: "Clojure CLI",
    runCommand: "clojure -M main.clj",
    fileName: "main.clj",
    dailyHabit: "Work at the REPL and transform immutable data step by step",
    strengths: ["Lisp", "JVM", "REPL", "data", "functional"],
    printLine: "(println 42)",
    variableLine: "(def total 42)\n(println total)",
    functionBlock: "(defn add [a b]\n  (+ a b))",
    collectionBlock: "(def scores [40 2])\n(println (count scores))",
    collectionName: "Vector",
    printKeyword: "println",
    variableKeyword: "def",
    functionKeyword: "defn",
    collectionKeyword: "Vector",
  },
  {
    slug: "fsharp",
    title: "F Sharp",
    shortTitle: "F#",
    role: "functional dotnet apps data pipelines and domain modeling",
    runtime: ".NET SDK",
    runCommand: "dotnet fsi script.fsx",
    fileName: "script.fsx",
    dailyHabit: "Model data clearly and compose small transformations",
    strengths: ["dotnet", "functional", "data", "types", "domain modeling"],
    printLine: "printfn \"%d\" 42",
    variableLine: "let total = 42\nprintfn \"%d\" total",
    functionBlock: "let add a b =\n  a + b",
    collectionBlock: "let scores = [40; 2]\nprintfn \"%d\" scores.Length",
    collectionName: "List",
    printKeyword: "printfn",
    variableKeyword: "let",
    functionKeyword: "let",
    collectionKeyword: "List",
  },
  {
    slug: "ocaml",
    title: "OCaml",
    shortTitle: "OCaml",
    role: "typed functional programming compilers tools and formal methods",
    runtime: "OCaml",
    runCommand: "ocaml main.ml",
    fileName: "main.ml",
    dailyHabit: "Use pattern matching and keep type signatures readable",
    strengths: ["functional", "types", "compilers", "tools", "pattern matching"],
    printLine: "print_int 42",
    variableLine: "let total = 42\nlet () = print_int total",
    functionBlock: "let add a b =\n  a + b",
    collectionBlock: "let scores = [40; 2]\nlet () = print_int (List.length scores)",
    collectionName: "List",
    printKeyword: "print_int",
    variableKeyword: "let",
    functionKeyword: "let",
    collectionKeyword: "List",
  },
  {
    slug: "c",
    title: "C",
    shortTitle: "C",
    role: "systems programming memory layout embedded code and foundations",
    runtime: "C compiler",
    runCommand: "cc main.c && ./a.out",
    fileName: "main.c",
    dailyHabit: "Trace memory ownership and initialize every value",
    strengths: ["systems", "embedded", "memory", "pointers", "performance"],
    printLine: "printf(\"%d\\n\", 42);",
    variableLine: "int total = 42;\nprintf(\"%d\\n\", total);",
    functionBlock: "int add(int a, int b) {\n  return a + b;\n}",
    collectionBlock: "int scores[] = {40, 2};\nprintf(\"%zu\\n\", sizeof(scores) / sizeof(scores[0]));",
    collectionName: "Array",
    printKeyword: "printf",
    variableKeyword: "int",
    functionKeyword: "int",
    collectionKeyword: "Array",
  },
  {
    slug: "assembly",
    title: "Assembly",
    shortTitle: "ASM",
    role: "machine level thinking registers calling conventions and reverse engineering",
    runtime: "Assembler and linker",
    runCommand: "nasm -f macho64 main.asm && ld main.o",
    fileName: "main.asm",
    dailyHabit: "Track registers one instruction at a time",
    strengths: ["registers", "systems", "security", "reverse engineering", "performance"],
    printLine: "mov rax, 42",
    variableLine: "total dq 42",
    functionBlock: "add:\n  mov rax, rdi\n  add rax, rsi\n  ret",
    collectionBlock: "scores dq 40, 2",
    collectionName: "Memory table",
    printKeyword: "mov",
    variableKeyword: "dq",
    functionKeyword: "ret",
    collectionKeyword: "dq",
  },
  {
    slug: "solidity",
    title: "Solidity",
    shortTitle: "Solidity",
    role: "smart contracts Ethereum security and blockchain applications",
    runtime: "Solidity compiler",
    runCommand: "solc Contract.sol",
    fileName: "Contract.sol",
    dailyHabit: "Think about state changes permissions and gas before writing code",
    strengths: ["smart contracts", "Ethereum", "security", "state", "events"],
    printLine: "uint256 public total = 42;",
    variableLine: "uint256 total = 42;",
    functionBlock: "function add(uint256 a, uint256 b) public pure returns (uint256) {\n  return a + b;\n}",
    collectionBlock: "uint256[] public scores;\nscores.push(42);",
    collectionName: "Array",
    printKeyword: "uint256",
    variableKeyword: "uint256",
    functionKeyword: "function",
    collectionKeyword: "Array",
  },
  {
    slug: "objective-c",
    title: "Objective C",
    shortTitle: "ObjC",
    role: "Apple platform legacy apps runtime messaging and native libraries",
    runtime: "Clang Objective C",
    runCommand: "clang main.m -framework Foundation && ./a.out",
    fileName: "main.m",
    dailyHabit: "Read message sends and keep Foundation examples tiny",
    strengths: ["Apple", "runtime", "messages", "Foundation", "legacy apps"],
    printLine: "NSLog(@\"%d\", 42);",
    variableLine: "int total = 42;\nNSLog(@\"%d\", total);",
    functionBlock: "int add(int a, int b) {\n  return a + b;\n}",
    collectionBlock: "NSArray *scores = @[@40, @2];\nNSLog(@\"%lu\", (unsigned long)scores.count);",
    collectionName: "NSArray",
    printKeyword: "NSLog",
    variableKeyword: "int",
    functionKeyword: "int",
    collectionKeyword: "NSArray",
  },
  {
    slug: "visual-basic",
    title: "Visual Basic",
    shortTitle: "VB",
    role: "dotnet business apps automation and readable event driven code",
    runtime: ".NET SDK",
    runCommand: "dotnet run",
    fileName: "Program.vb",
    dailyHabit: "Name events clearly and keep business rules out of UI handlers",
    strengths: ["dotnet", "desktop", "business apps", "events", "automation"],
    printLine: "Console.WriteLine(42)",
    variableLine: "Dim total As Integer = 42\nConsole.WriteLine(total)",
    functionBlock: "Function Add(a As Integer, b As Integer) As Integer\n  Return a + b\nEnd Function",
    collectionBlock: "Dim scores As Integer() = {40, 2}\nConsole.WriteLine(scores.Length)",
    collectionName: "Array",
    printKeyword: "Console.WriteLine",
    variableKeyword: "Dim",
    functionKeyword: "Function",
    collectionKeyword: "Array",
  },
  {
    slug: "zig",
    title: "Zig",
    shortTitle: "Zig",
    role: "systems programming explicit memory and simple cross compilation",
    runtime: "Zig toolchain",
    runCommand: "zig run main.zig",
    fileName: "main.zig",
    dailyHabit: "Make allocation ownership and error handling explicit from the first file",
    strengths: ["systems", "memory", "cross compile", "errors", "performance"],
    printLine: "std.debug.print(\"{}\\n\", .{42});",
    variableLine: "const total = 42;\nstd.debug.print(\"{}\\n\", .{total});",
    functionBlock: "fn add(a: i32, b: i32) i32 {\n  return a + b;\n}",
    collectionBlock: "const scores = [_]i32{40, 2};\nstd.debug.print(\"{}\\n\", .{scores.len});",
    collectionName: "Array",
    printKeyword: "std.debug.print",
    variableKeyword: "const",
    functionKeyword: "fn",
    collectionKeyword: "Array",
  },
  {
    slug: "nim",
    title: "Nim",
    shortTitle: "Nim",
    role: "compiled scripting systems tools and expressive native programs",
    runtime: "Nim compiler",
    runCommand: "nim c -r main.nim",
    fileName: "main.nim",
    dailyHabit: "Keep indentation clean and start with readable procedures",
    strengths: ["native", "scripts", "macros", "tools", "performance"],
    printLine: "echo 42",
    variableLine: "let total = 42\necho total",
    functionBlock: "proc add(a: int, b: int): int =\n  a + b",
    collectionBlock: "let scores = @[40, 2]\necho scores.len",
    collectionName: "Seq",
    printKeyword: "echo",
    variableKeyword: "let",
    functionKeyword: "proc",
    collectionKeyword: "seq",
  },
  {
    slug: "crystal",
    title: "Crystal",
    shortTitle: "Crystal",
    role: "Ruby like syntax with native speed and typed services",
    runtime: "Crystal compiler",
    runCommand: "crystal run app.cr",
    fileName: "app.cr",
    dailyHabit: "Write readable Ruby-like code and let the compiler expose type gaps",
    strengths: ["native", "web", "types", "services", "syntax"],
    printLine: "puts 42",
    variableLine: "total = 42\nputs total",
    functionBlock: "def add(a : Int32, b : Int32) : Int32\n  a + b\nend",
    collectionBlock: "scores = [40, 2]\nputs scores.size",
    collectionName: "Array",
    printKeyword: "puts",
    variableKeyword: "=",
    functionKeyword: "def",
    collectionKeyword: "Array",
  },
  {
    slug: "groovy",
    title: "Groovy",
    shortTitle: "Groovy",
    role: "JVM scripting Gradle automation and concise backend glue",
    runtime: "Groovy",
    runCommand: "groovy app.groovy",
    fileName: "app.groovy",
    dailyHabit: "Use it to automate JVM work before designing bigger abstractions",
    strengths: ["JVM", "Gradle", "scripts", "testing", "automation"],
    printLine: "println 42",
    variableLine: "def total = 42\nprintln total",
    functionBlock: "def add(a, b) {\n  a + b\n}",
    collectionBlock: "def scores = [40, 2]\nprintln scores.size()",
    collectionName: "List",
    printKeyword: "println",
    variableKeyword: "def",
    functionKeyword: "def",
    collectionKeyword: "List",
  },
  {
    slug: "powershell",
    title: "PowerShell",
    shortTitle: "PS",
    role: "Windows cloud automation DevOps scripts and admin workflows",
    runtime: "PowerShell 7",
    runCommand: "pwsh script.ps1",
    fileName: "script.ps1",
    dailyHabit: "Pipe objects not plain text and verify each command with WhatIf when possible",
    strengths: ["DevOps", "Windows", "cloud", "automation", "objects"],
    printLine: "Write-Output 42",
    variableLine: "$total = 42\nWrite-Output $total",
    functionBlock: "function Add($a, $b) {\n  return $a + $b\n}",
    collectionBlock: "$scores = @(40, 2)\nWrite-Output $scores.Count",
    collectionName: "Array",
    printKeyword: "Write-Output",
    variableKeyword: "$",
    functionKeyword: "function",
    collectionKeyword: "@()",
  },
  {
    slug: "fortran",
    title: "Fortran",
    shortTitle: "Fortran",
    role: "scientific computing numerical simulation and legacy HPC code",
    runtime: "gfortran",
    runCommand: "gfortran main.f90 && ./a.out",
    fileName: "main.f90",
    dailyHabit: "Check array dimensions and numeric precision before optimizing",
    strengths: ["HPC", "science", "arrays", "numerics", "simulation"],
    printLine: "print *, 42",
    variableLine: "integer :: total\ntotal = 42\nprint *, total",
    functionBlock: "integer function add(a, b)\n  integer, intent(in) :: a, b\n  add = a + b\nend function",
    collectionBlock: "integer :: scores(2) = (/40, 2/)\nprint *, size(scores)",
    collectionName: "Array",
    printKeyword: "print",
    variableKeyword: "integer",
    functionKeyword: "function",
    collectionKeyword: "Array",
  },
  {
    slug: "cobol",
    title: "COBOL",
    shortTitle: "COBOL",
    role: "business systems records reports and legacy enterprise maintenance",
    runtime: "GnuCOBOL",
    runCommand: "cobc -x main.cob && ./main",
    fileName: "main.cob",
    dailyHabit: "Read data divisions slowly and keep record layouts explicit",
    strengths: ["enterprise", "records", "reports", "finance", "legacy"],
    printLine: "DISPLAY 42.",
    variableLine: "01 TOTAL PIC 99 VALUE 42.\nDISPLAY TOTAL.",
    functionBlock: "ADD A TO B GIVING RESULT.",
    collectionBlock: "01 SCORES OCCURS 2 TIMES PIC 99.\nDISPLAY SCORES(1).",
    collectionName: "OCCURS",
    printKeyword: "DISPLAY",
    variableKeyword: "PIC",
    functionKeyword: "ADD",
    collectionKeyword: "OCCURS",
  },
  {
    slug: "pascal",
    title: "Pascal",
    shortTitle: "Pascal",
    role: "structured programming education and classic application foundations",
    runtime: "Free Pascal",
    runCommand: "fpc main.pas && ./main",
    fileName: "main.pas",
    dailyHabit: "Write declarations clearly and keep begin end blocks balanced",
    strengths: ["education", "structured", "desktop", "types", "classic"],
    printLine: "writeln(42);",
    variableLine: "var total: integer;\nbegin\n  total := 42;\n  writeln(total);\nend.",
    functionBlock: "function Add(a, b: integer): integer;\nbegin\n  Add := a + b;\nend;",
    collectionBlock: "var scores: array[1..2] of integer;\nbegin\n  writeln(2);\nend.",
    collectionName: "Array",
    printKeyword: "writeln",
    variableKeyword: "var",
    functionKeyword: "function",
    collectionKeyword: "array",
  },
  {
    slug: "prolog",
    title: "Prolog",
    shortTitle: "Prolog",
    role: "logic programming rules search and symbolic reasoning",
    runtime: "SWI-Prolog",
    runCommand: "swipl -q -s main.pl",
    fileName: "main.pl",
    dailyHabit: "Describe facts rules and queries before thinking procedurally",
    strengths: ["logic", "rules", "search", "AI", "constraints"],
    printLine: "writeln(42).",
    variableLine: "total(42).\nshow :- total(X), writeln(X).",
    functionBlock: "add(A, B, R) :- R is A + B.",
    collectionBlock: "scores([40, 2]).\nshow :- scores(S), length(S, N), writeln(N).",
    collectionName: "List",
    printKeyword: "writeln",
    variableKeyword: "fact",
    functionKeyword: ":-",
    collectionKeyword: "List",
  },
  {
    slug: "racket",
    title: "Racket",
    shortTitle: "Racket",
    role: "language design teaching macros and Lisp style tools",
    runtime: "Racket",
    runCommand: "racket main.rkt",
    fileName: "main.rkt",
    dailyHabit: "Use small expressions and test transformations in the REPL",
    strengths: ["Lisp", "macros", "teaching", "language design", "functional"],
    printLine: "(displayln 42)",
    variableLine: "(define total 42)\n(displayln total)",
    functionBlock: "(define (add a b)\n  (+ a b))",
    collectionBlock: "(define scores (list 40 2))\n(displayln (length scores))",
    collectionName: "List",
    printKeyword: "displayln",
    variableKeyword: "define",
    functionKeyword: "define",
    collectionKeyword: "list",
  },
  {
    slug: "scheme",
    title: "Scheme",
    shortTitle: "Scheme",
    role: "minimal Lisp functional foundations and interpreter thinking",
    runtime: "Scheme",
    runCommand: "scheme --script main.scm",
    fileName: "main.scm",
    dailyHabit: "Evaluate one expression at a time and keep parentheses intentional",
    strengths: ["Lisp", "functional", "recursion", "interpreters", "teaching"],
    printLine: "(display 42)",
    variableLine: "(define total 42)\n(display total)",
    functionBlock: "(define (add a b)\n  (+ a b))",
    collectionBlock: "(define scores '(40 2))\n(display (length scores))",
    collectionName: "List",
    printKeyword: "display",
    variableKeyword: "define",
    functionKeyword: "define",
    collectionKeyword: "list",
  },
  {
    slug: "elm",
    title: "Elm",
    shortTitle: "Elm",
    role: "safe frontend architecture typed UI and beginner friendly functional apps",
    runtime: "Elm compiler",
    runCommand: "elm make src/Main.elm",
    fileName: "Main.elm",
    dailyHabit: "Let compiler messages guide every UI state change",
    strengths: ["frontend", "types", "UI", "functional", "architecture"],
    printLine: "text \"42\"",
    variableLine: "total = 42\nview = text (String.fromInt total)",
    functionBlock: "add a b =\n  a + b",
    collectionBlock: "scores = [40, 2]\ncount = List.length scores",
    collectionName: "List",
    printKeyword: "text",
    variableKeyword: "=",
    functionKeyword: "=",
    collectionKeyword: "List",
  },
  {
    slug: "gleam",
    title: "Gleam",
    shortTitle: "Gleam",
    role: "typed BEAM services friendly functional programming and reliable APIs",
    runtime: "Gleam",
    runCommand: "gleam run",
    fileName: "src/main.gleam",
    dailyHabit: "Use pattern matching and simple typed data before processes",
    strengths: ["BEAM", "types", "services", "functional", "reliability"],
    printLine: "io.println(\"42\")",
    variableLine: "let total = 42\nio.println(int.to_string(total))",
    functionBlock: "fn add(a: Int, b: Int) -> Int {\n  a + b\n}",
    collectionBlock: "let scores = [40, 2]\nio.println(int.to_string(list.length(scores)))",
    collectionName: "List",
    printKeyword: "io.println",
    variableKeyword: "let",
    functionKeyword: "fn",
    collectionKeyword: "List",
  },
  {
    slug: "v",
    title: "V",
    shortTitle: "V",
    role: "simple native apps tools and fast compilation experiments",
    runtime: "V compiler",
    runCommand: "v run main.v",
    fileName: "main.v",
    dailyHabit: "Keep code explicit and compile tiny examples often",
    strengths: ["native", "simple", "tools", "performance", "cross platform"],
    printLine: "println(42)",
    variableLine: "total := 42\nprintln(total)",
    functionBlock: "fn add(a int, b int) int {\n  return a + b\n}",
    collectionBlock: "scores := [40, 2]\nprintln(scores.len)",
    collectionName: "Array",
    printKeyword: "println",
    variableKeyword: ":=",
    functionKeyword: "fn",
    collectionKeyword: "Array",
  },
  {
    slug: "d",
    title: "D",
    shortTitle: "D",
    role: "systems programming native tools and C-family productivity",
    runtime: "D compiler",
    runCommand: "dmd main.d && ./main",
    fileName: "main.d",
    dailyHabit: "Use strong types and keep memory choices visible",
    strengths: ["systems", "native", "templates", "performance", "tools"],
    printLine: "writeln(42);",
    variableLine: "int total = 42;\nwriteln(total);",
    functionBlock: "int add(int a, int b) {\n  return a + b;\n}",
    collectionBlock: "int[] scores = [40, 2];\nwriteln(scores.length);",
    collectionName: "Array",
    printKeyword: "writeln",
    variableKeyword: "int",
    functionKeyword: "int",
    collectionKeyword: "Array",
  },
  {
    slug: "common-lisp",
    title: "Common Lisp",
    shortTitle: "Lisp",
    role: "interactive systems macros symbolic computing and long lived tools",
    runtime: "SBCL",
    runCommand: "sbcl --script main.lisp",
    fileName: "main.lisp",
    dailyHabit: "Use the REPL and inspect every data shape before macro work",
    strengths: ["Lisp", "REPL", "macros", "symbols", "systems"],
    printLine: "(print 42)",
    variableLine: "(defparameter *total* 42)\n(print *total*)",
    functionBlock: "(defun add (a b)\n  (+ a b))",
    collectionBlock: "(defparameter *scores* '(40 2))\n(print (length *scores*))",
    collectionName: "List",
    printKeyword: "print",
    variableKeyword: "defparameter",
    functionKeyword: "defun",
    collectionKeyword: "list",
  },
  {
    slug: "smalltalk",
    title: "Smalltalk",
    shortTitle: "Smalltalk",
    role: "object messaging live environments and classic OOP thinking",
    runtime: "Pharo or GNU Smalltalk",
    runCommand: "gst main.st",
    fileName: "main.st",
    dailyHabit: "Think in messages sent to objects and inspect state live",
    strengths: ["OOP", "messages", "live coding", "teaching", "objects"],
    printLine: "42 printNl.",
    variableLine: "| total |\ntotal := 42.\ntotal printNl.",
    functionBlock: "add := [ :a :b | a + b ].",
    collectionBlock: "scores := #(40 2).\nscores size printNl.",
    collectionName: "Array",
    printKeyword: "printNl",
    variableKeyword: ":=",
    functionKeyword: "block",
    collectionKeyword: "Array",
  },
  {
    slug: "abap",
    title: "ABAP",
    shortTitle: "ABAP",
    role: "SAP business logic reports enterprise data and workflow customization",
    runtime: "SAP ABAP",
    runCommand: "Run in SAP ABAP environment",
    fileName: "z_report.abap",
    dailyHabit: "Keep internal tables readable and separate business rules from reports",
    strengths: ["SAP", "enterprise", "reports", "tables", "workflow"],
    printLine: "WRITE: / 42.",
    variableLine: "DATA total TYPE i VALUE 42.\nWRITE: / total.",
    functionBlock: "FORM add USING a TYPE i b TYPE i CHANGING r TYPE i.\n  r = a + b.\nENDFORM.",
    collectionBlock: "DATA scores TYPE STANDARD TABLE OF i.\nAPPEND 40 TO scores.\nAPPEND 2 TO scores.",
    collectionName: "Internal table",
    printKeyword: "WRITE",
    variableKeyword: "DATA",
    functionKeyword: "FORM",
    collectionKeyword: "TABLE",
  },
  {
    slug: "delphi",
    title: "Delphi",
    shortTitle: "Delphi",
    role: "Windows desktop business apps Pascal style OOP and rapid UI tools",
    runtime: "Delphi or Free Pascal",
    runCommand: "Compile in Delphi IDE",
    fileName: "Project.dpr",
    dailyHabit: "Keep form events thin and move logic into testable units",
    strengths: ["desktop", "OOP", "business apps", "Pascal", "UI"],
    printLine: "Writeln(42);",
    variableLine: "var total: Integer;\nbegin\n  total := 42;\n  Writeln(total);\nend.",
    functionBlock: "function Add(a, b: Integer): Integer;\nbegin\n  Result := a + b;\nend;",
    collectionBlock: "var scores: array[0..1] of Integer;\nbegin\n  Writeln(Length(scores));\nend.",
    collectionName: "Array",
    printKeyword: "Writeln",
    variableKeyword: "var",
    functionKeyword: "function",
    collectionKeyword: "array",
  },
  {
    slug: "tcl",
    title: "Tcl",
    shortTitle: "Tcl",
    role: "automation embedded scripting testing and glue around native tools",
    runtime: "Tcl shell",
    runCommand: "tclsh script.tcl",
    fileName: "script.tcl",
    dailyHabit: "Print each substituted value and keep quoting rules visible",
    strengths: ["automation", "testing", "embedded", "scripts", "glue"],
    printLine: "puts 42",
    variableLine: "set total 42\nputs $total",
    functionBlock: "proc add {a b} {\n  return [expr {$a + $b}]\n}",
    collectionBlock: "set scores {40 2}\nputs [llength $scores]",
    collectionName: "List",
    printKeyword: "puts",
    variableKeyword: "set",
    functionKeyword: "proc",
    collectionKeyword: "list",
  },
];

programmingLanguages.push(...globalProgrammingLanguageTemplates.map(generatedLanguage));

export function getProgrammingLanguage(slug?: string) {
  return programmingLanguages.find((language) => language.slug === slug) || programmingLanguages[0];
}

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
