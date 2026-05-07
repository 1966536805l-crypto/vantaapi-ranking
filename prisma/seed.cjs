/* eslint-disable @typescript-eslint/no-require-imports */
const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const bcrypt = require("bcryptjs");

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL is required");

const createPostgresAdapter = (url) => {
  const databaseUrl = new URL(url);
  if (databaseUrl.protocol !== "postgres:" && databaseUrl.protocol !== "postgresql:") {
    throw new Error("DATABASE_URL must start with postgres:// or postgresql:// for the Postgres production setup");
  }

  return new PrismaPg(url);
};

const prisma = new PrismaClient({ adapter: createPostgresAdapter(connectionString) });

const option = (label, content, isCorrect = false) => ({ label, content, isCorrect });
const choice = (prompt, answer, explanation, options, difficulty = "EASY") => ({ type: "MULTIPLE_CHOICE", prompt, answer, explanation, options, difficulty });
const fill = (prompt, answer, explanation, difficulty = "EASY") => ({ type: "FILL_BLANK", prompt, answer, explanation, difficulty });
const code = (prompt, codeSnippet, answer, explanation, difficulty = "EASY") => ({ type: "CODE_READING", prompt, codeSnippet, answer, explanation, difficulty });
const lesson = (slug, title, summary, content, examples, questions) => ({ slug, title, summary, content, examples, questions });

const examPacks = [
  {
    slug: "ielts-5000",
    title: "IELTS Vocabulary Builder",
    scope: "IELTS academic vocabulary practice",
    level: "Band 6 to 8",
    words: [
      ["allocate", "Governments should allocate more funding to public transport.", "allocate funding"],
      ["sustainable", "A sustainable city reduces waste and protects green space.", "sustainable development"],
      ["detrimental", "Excessive screen time can be detrimental to sleep quality.", "detrimental impact"],
      ["mitigate", "Urban planning can mitigate traffic congestion.", "mitigate risk"],
      ["cohesive", "A cohesive essay links every paragraph to the main argument.", "cohesive response"],
      ["inevitable", "Some job changes are inevitable as technology improves.", "inevitable consequence"],
    ],
  },
  {
    slug: "toefl-5000",
    title: "TOEFL Vocabulary Builder",
    scope: "TOEFL academic vocabulary practice",
    level: "iBT Academic",
    words: [
      ["hypothesis", "The researcher proposed a hypothesis about climate patterns.", "test a hypothesis"],
      ["derive", "The conclusion is derived from several experiments.", "derive evidence"],
      ["phenomenon", "Migration is a phenomenon studied in biology and history.", "natural phenomenon"],
      ["subsequent", "Subsequent studies produced more reliable results.", "subsequent research"],
      ["accumulate", "Sediment can accumulate at the bottom of a lake.", "accumulate data"],
      ["contradict", "The new evidence may contradict the earlier theory.", "contradict a claim"],
    ],
  },
  {
    slug: "cet-4-core",
    title: "CET 4 Core Vocabulary",
    scope: "CET 4 core vocabulary practice",
    level: "College English Band 4",
    words: [
      ["benefit", "Regular reading brings long term benefits to students.", "major benefit"],
      ["afford", "Many students cannot afford expensive software.", "afford to do"],
      ["concern", "Air quality is a major concern in large cities.", "public concern"],
      ["efficient", "An efficient plan saves both time and energy.", "efficient method"],
      ["involve", "The project involves research and presentation.", "involve students"],
      ["maintain", "Learners need to maintain a steady review routine.", "maintain balance"],
    ],
  },
  {
    slug: "cet-6-core",
    title: "CET 6 Advanced Vocabulary",
    scope: "CET 6 advanced vocabulary practice",
    level: "College English Band 6",
    words: [
      ["substantial", "The policy produced substantial improvements in safety.", "substantial change"],
      ["exposure", "More exposure to authentic texts improves reading speed.", "media exposure"],
      ["facilitate", "Clear feedback can facilitate independent learning.", "facilitate growth"],
      ["implement", "The school will implement a new assessment system.", "implement a policy"],
      ["comprehensive", "A comprehensive review covers vocabulary grammar and reading.", "comprehensive plan"],
      ["fluctuate", "Energy prices may fluctuate during winter.", "fluctuate sharply"],
    ],
  },
  {
    slug: "postgraduate-core",
    title: "Postgraduate Entrance Vocabulary",
    scope: "postgraduate entrance vocabulary practice",
    level: "China Postgraduate English",
    words: [
      ["acknowledge", "The author acknowledges the limits of the study.", "acknowledge a problem"],
      ["interpret", "Readers must interpret the sentence in context.", "interpret evidence"],
      ["perspective", "The passage presents a historical perspective on education.", "from a perspective"],
      ["underlying", "The underlying cause is often economic pressure.", "underlying reason"],
      ["whereas", "Some readers focus on details whereas others look for structure.", "whereas clause"],
      ["conventional", "The article challenges conventional views of success.", "conventional wisdom"],
    ],
  },
];

const buildExamVocabularyCourses = () =>
  examPacks.map((pack) => ({
    direction: "ENGLISH",
    slug: pack.slug,
    title: pack.title,
    description: `${pack.level} pack with original priority words, collocations, key sentences and quiz conversion. The library is updated over time.`,
    lessons: [
      lesson(
        `${pack.slug}-priority-words`,
        `${pack.title} Priority Words`,
        `${pack.scope} with high value starting words.`,
        "Start with precision words, collocations and sentences before expanding the list through review and practice.",
        pack.words.map(([word, sentence, collocation]) => [word, sentence, collocation]),
        pack.words.map(([word, sentence, collocation]) =>
          choice(
            `Choose the best exam use of ${word}.`,
            sentence,
            `${word} is useful in the collocation ${collocation}.`,
            [option("A", sentence, true), option("B", `I saw ${word} yesterday.`), option("C", `${word} is only a number.`)],
          ),
        ),
      ),
      lesson(
        `${pack.slug}-key-sentences`,
        `${pack.title} Key Sentences`,
        "Reusable sentence frames for writing reading and translation.",
        "Sentence frames help move words into real output. Memorize the logic then adapt the nouns and verbs.",
        [
          ["evidence frame", "The evidence suggests that this issue should be understood in a wider social context.", "Use this to introduce cautious argument."],
          ["balance frame", "A more balanced approach would take both efficiency and fairness into account.", "Use this for opinion and solution writing."],
          ["contrast frame", "The main contrast lies in the difference between short term convenience and long term value.", "Use this to compare two sides."],
        ],
        [
          fill("Complete: The evidence ____ that this issue needs wider context.", "suggests", "suggests introduces a cautious claim."),
          fill("Complete: A more balanced ____ would consider both sides.", "approach", "approach means method or way."),
          choice("Which word signals contrast?", "whereas", "whereas compares two facts.", [option("A", "whereas", true), option("B", "because"), option("C", "therefore")]),
        ],
      ),
    ],
  }));

const cppMegaCategories = [
  { slug: "syntax-types", title: "Syntax And Types", zh: "语法与类型" },
  { slug: "control-flow", title: "Control Flow", zh: "条件循环与函数" },
  { slug: "arrays-strings", title: "Arrays And Strings", zh: "数组与字符串" },
  { slug: "pointers-references", title: "Pointers And References", zh: "指针与引用" },
  { slug: "oop", title: "Object Oriented Programming", zh: "面向对象" },
  { slug: "stl", title: "STL Containers", zh: "STL 容器" },
  { slug: "algorithms", title: "Algorithms", zh: "基础算法" },
  { slug: "code-reading-output", title: "Code Reading And Output", zh: "代码阅读与输出预测" },
];

const difficultyFor = (n) => (n % 10 === 0 ? "HARD" : n % 3 === 0 || n % 7 === 0 ? "MEDIUM" : "EASY");
const factorial = (n) => (n <= 1 ? 1 : n * factorial(n - 1));
const variant = (n) => ({ n, a: (n % 9) + 1, b: (n % 5) + 2, c: (n % 4) + 1, index: n % 4 });

const buildCppMegaQuestion = (categorySlug, n) => {
  const v = variant(n);
  const pattern = n % 5;
  const difficulty = difficultyFor(n);

  if (categorySlug === "syntax-types") {
    if (pattern === 0) return code("Predict the output. 注意整数除法。", `int x = ${v.a};\nint y = ${v.b};\ncout << x / y;`, String(Math.trunc(v.a / v.b)), "Both operands are int, so C++ keeps the integer part.", difficulty);
    if (pattern === 1) return choice("Which type stores true/false values?", "bool", "bool stores true or false.", [option("A", "int"), option("B", "double"), option("C", "bool", true), option("D", "string")], difficulty);
    if (pattern === 2) return fill(`Complete: ____ score = ${v.a};`, "int", "int stores whole numbers.", difficulty);
    if (pattern === 3) return code("Predict the output. 注意后置自增。", `int x = ${v.a};\ncout << x++;`, String(v.a), "x++ prints the old value first, then increases x.", difficulty);
    return choice("Which operator checks equality in C++?", "==", "== compares two values; = assigns a value.", [option("A", "="), option("B", "==", true), option("C", "!="), option("D", ">=")], difficulty);
  }

  if (categorySlug === "control-flow") {
    if (pattern === 0) return code("How many numbers are printed?", `for (int i = 0; i < ${v.b}; i++) {\n  cout << i;\n}`, String(v.b), "The loop runs for i = 0 through limit - 1.", difficulty);
    if (pattern === 1) return choice("Which keyword skips the current loop iteration?", "continue", "continue jumps to the next iteration.", [option("A", "break"), option("B", "continue", true), option("C", "return"), option("D", "switch")], difficulty);
    if (pattern === 2) return fill("Complete: if (x > 0) { ... } ____ { ... }", "else", "else handles the opposite branch.", difficulty);
    if (pattern === 3) return code("Predict the output of the branch.", `int x = ${v.a};\nif (x % 2 == 0) cout << "even";\nelse cout << "odd";`, v.a % 2 === 0 ? "even" : "odd", "Use x % 2 to test parity.", difficulty);
    return code("What value is returned?", `int f(int x) {\n  if (x > ${v.b}) return x;\n  return x + ${v.c};\n}\ncout << f(${v.a});`, String(v.a > v.b ? v.a : v.a + v.c), "Follow the if condition before reading the return value.", difficulty);
  }

  if (categorySlug === "arrays-strings") {
    if (pattern === 0) return code("Predict the output. 注意数组下标从 0 开始。", `int a[4] = {${v.a}, ${v.a + 1}, ${v.a + 2}, ${v.a + 3}};\ncout << a[${v.index}];`, String(v.a + v.index), "Array index 0 is the first element.", difficulty);
    if (pattern === 1) return choice("Which expression gets the length of string s?", "s.size()", "size() returns the number of characters.", [option("A", "s.length"), option("B", "s.size()", true), option("C", "size.s"), option("D", "len(s)")], difficulty);
    if (pattern === 2) return fill("Complete: string s = \"code\"; cout << s.____();", "size", "s.size() returns string length.", difficulty);
    if (pattern === 3) return code("Predict the output after concatenation.", `string s = "C";\ns += "++";\ncout << s;`, "C++", "The += operator appends to the string.", difficulty);
    return code("What sum is printed?", `int a[3] = {${v.a}, ${v.b}, ${v.c}};\nint sum = 0;\nfor (int x : a) sum += x;\ncout << sum;`, String(v.a + v.b + v.c), "Range-for visits each element once.", difficulty);
  }

  if (categorySlug === "pointers-references") {
    if (pattern === 0) return choice("Which operator gets the address of a variable?", "&", "&x means address of x.", [option("A", "*"), option("B", "&", true), option("C", "->"), option("D", "::")], difficulty);
    if (pattern === 1) return fill("Complete: int* p = &x; cout << ____p;", "*", "*p dereferences the pointer.", difficulty);
    if (pattern === 2) return code("Predict the output after reference modification.", `int x = ${v.a};\nint& r = x;\nr += ${v.b};\ncout << x;`, String(v.a + v.b), "A reference is another name for the same variable.", difficulty);
    if (pattern === 3) return code("Predict the output after pointer assignment.", `int x = ${v.a};\nint* p = &x;\n*p = ${v.b};\ncout << x;`, String(v.b), "Writing through *p changes x.", difficulty);
    return choice("What does int* const p mean at beginner level?", "the pointer cannot point elsewhere", "const after * fixes the pointer itself.", [option("A", "the int is always zero"), option("B", "the pointer cannot point elsewhere", true), option("C", "p is a reference"), option("D", "p stores a string")], difficulty);
  }

  if (categorySlug === "oop") {
    if (pattern === 0) return choice("Which keyword defines a class?", "class", "class defines a user-defined type.", [option("A", "class", true), option("B", "cout"), option("C", "vector"), option("D", "return")], difficulty);
    if (pattern === 1) return fill("Members accessible from outside usually go under ____:", "public", "public members can be accessed outside the class.", difficulty);
    if (pattern === 2) return code("Predict the output from a simple object.", `class Counter {\npublic:\n  int value = ${v.a};\n};\nCounter c;\ncout << c.value;`, String(v.a), "The public member value can be read from c.", difficulty);
    if (pattern === 3) return choice("What is a constructor mainly used for?", "initialize an object", "Constructors set up objects when they are created.", [option("A", "end a loop"), option("B", "initialize an object", true), option("C", "sort a vector"), option("D", "include a header")], difficulty);
    return code("Predict the output after a method call.", `class Box {\npublic:\n  int x = ${v.a};\n  void add() { x += ${v.b}; }\n};\nBox b;\nb.add();\ncout << b.x;`, String(v.a + v.b), "The member function modifies the object's state.", difficulty);
  }

  if (categorySlug === "stl") {
    if (pattern === 0) return choice("Which STL container is a dynamic array?", "vector", "vector supports indexed access and dynamic growth.", [option("A", "vector", true), option("B", "map"), option("C", "set"), option("D", "queue")], difficulty);
    if (pattern === 1) return fill(`Complete: vector<int> v; v.____(${v.a});`, "push_back", "push_back appends an element.", difficulty);
    if (pattern === 2) return code("Predict the output using vector.", `vector<int> v;\nv.push_back(${v.a});\nv.push_back(${v.b});\ncout << v[1];`, String(v.b), "v[1] is the second element.", difficulty);
    if (pattern === 3) return code("Predict the output using set uniqueness.", `set<int> s;\ns.insert(${v.a});\ns.insert(${v.a});\ncout << s.size();`, "1", "set keeps unique values only.", difficulty);
    return code("Predict the queue front after one pop.", `queue<int> q;\nq.push(${v.a});\nq.push(${v.b});\nq.pop();\ncout << q.front();`, String(v.b), "queue is first-in first-out.", difficulty);
  }

  if (categorySlug === "algorithms") {
    if (pattern === 0) return code("Predict the first element after sorting.", `vector<int> v = {${v.b}, ${v.a}, ${v.c}};\nsort(v.begin(), v.end());\ncout << v[0];`, String(Math.min(v.a, v.b, v.c)), "sort arranges values in ascending order by default.", difficulty);
    if (pattern === 1) return choice("Which technique often solves sorted two-end scanning problems?", "two pointers", "Two pointers move from both ends or through a sequence.", [option("A", "two pointers", true), option("B", "private"), option("C", "cout"), option("D", "header guard")], difficulty);
    if (pattern === 2) return fill("Prefix sum query usually computes sum[r] - sum[____].", "l", "A common zero-based pattern uses prefix[r] - prefix[l].", difficulty);
    if (pattern === 3) return code("Predict the linear search index.", `vector<int> v = {${v.a}, ${v.b}, ${v.c}};\nint ans = -1;\nfor (int i = 0; i < 3; i++) if (v[i] == ${v.b}) ans = i;\ncout << ans;`, "1", "The target is at index 1.", difficulty);
    return code("Predict the recursive result.", `int f(int n) {\n  if (n == 0) return 1;\n  return n * f(n - 1);\n}\ncout << f(${Math.min(5, v.c + 1)});`, String(factorial(Math.min(5, v.c + 1))), "This computes factorial recursively.", difficulty);
  }

  if (pattern === 0) return code("Predict the output. Track variable updates carefully.", `int x = ${v.a}, y = ${v.b};\nx += y;\ny = x - y;\ncout << x << " " << y;`, `${v.a + v.b} ${v.a}`, "Update x first, then compute y from the new x.", difficulty);
  if (pattern === 1) return code("Predict the nested-loop count.", `int cnt = 0;\nfor (int i = 0; i < ${v.c}; i++)\n  for (int j = 0; j < ${v.b}; j++) cnt++;\ncout << cnt;`, String(v.c * v.b), "Nested loops multiply the iteration counts.", difficulty);
  if (pattern === 2) return choice("Output prediction题最重要的第一步是什么？", "trace state changes", "Track each variable/container state line by line.", [option("A", "run online compiler"), option("B", "ignore branches"), option("C", "trace state changes", true), option("D", "delete includes")], difficulty);
  if (pattern === 3) return fill("When predicting output, write variable values ____ by line.", "line", "Line-by-line tracing prevents missing updates.", difficulty);
  return code("Predict the function-call output.", `int add(int a, int b) { return a + b; }\ncout << add(${v.a}, ${v.b});`, String(v.a + v.b), "Evaluate function arguments and return value.", difficulty);
};

const buildCppMegaQuestionsForCategory = (categorySlug, count = 125) =>
  Array.from({ length: count }, (_, index) => ({ ...buildCppMegaQuestion(categorySlug, index + 1), sortOrder: index }));

const buildCppMegaCourse = () => ({
  direction: "CPP",
  slug: "cpp-mega-1000",
  title: "C++ 1000 Question Bank",
  description: "Eight categories and one thousand deterministic C++ drills covering syntax, control flow, arrays, pointers, OOP, STL, algorithms, code reading and output prediction.",
  lessons: cppMegaCategories.map((category) =>
    lesson(
      category.slug,
      category.title,
      `${category.zh} · 125 generated C++ drills for dense practice.`,
      `This section contains 125 static C++ drills. It mixes multiple choice, fill blank, code reading and output prediction. It does not run code online.`,
      [[category.zh, `${category.title} contains 125 generated drills.`, "Use short daily sessions and trace code by hand." ]],
      buildCppMegaQuestionsForCategory(category.slug, 125),
    ),
  ),
});

const data = [
  ...buildExamVocabularyCourses(),
  buildCppMegaCourse(),
  {
    direction: "ENGLISH",
    slug: "english-vocabulary",
    title: "English Vocabulary",
    description: "High-frequency words with meaning, example sentences and short quizzes.",
    lessons: [
      lesson("daily-vocabulary", "Daily Vocabulary", "Learn words by meaning and context.", "A useful word is not only a translation. Learn its meaning, part of speech and a sentence where it fits.", [["accurate", "The report is accurate.", "Accurate means correct and exact."]], [
        choice("Choose the closest meaning of accurate.", "correct and exact", "Accurate means correct and exact.", [option("A", "correct and exact", true), option("B", "very fast"), option("C", "hard to see")]),
        fill("Complete: Practice can ____ your reading speed.", "improve", "Improve means make better."),
        choice("Which sentence uses context correctly?", "The word fits the sentence.", "Context is the sentence around a word.", [option("A", "The word fits the sentence.", true), option("B", "The word is always a noun."), option("C", "The word has no meaning.")]),
      ]),
      lesson("word-meaning", "Word Meaning", "Use definition and examples together.", "A definition tells the core meaning. An example shows how people actually use the word.", [["predict", "Clouds can help us predict rain.", "Predict means say what may happen later."]], [
        choice("Choose the closest meaning of predict.", "say what may happen later", "Predict points to the future.", [option("A", "say what may happen later", true), option("B", "write very slowly"), option("C", "forget a fact")]),
        fill("Complete: We can ____ the answer from the clue.", "predict", "The clue helps us predict."),
        choice("What does an example sentence show?", "how a word is used", "Examples show use in context.", [option("A", "how a word is used", true), option("B", "only spelling"), option("C", "only pronunciation")]),
      ]),
      lesson("review-vocabulary", "Vocabulary Review", "Review words through short checks.", "Review means seeing a word again after a short gap, then using it in a new sentence.", [["review", "We review new words every week.", "Review means study again."]], [
        fill("Complete: We ____ new words every week.", "review", "Review means study again."),
        choice("Which is a good review habit?", "use the word in a new sentence", "Using a word helps memory.", [option("A", "use the word in a new sentence", true), option("B", "never read it again"), option("C", "copy it once and stop")]),
        choice("Choose the closest meaning of review.", "study again", "Review means look at something again.", [option("A", "study again", true), option("B", "throw away"), option("C", "run quickly")]),
      ]),
    ],
  },
  {
    direction: "ENGLISH",
    slug: "english-grammar-reading",
    title: "English Grammar And Reading",
    description: "Simple grammar and short reading with automatic quiz feedback.",
    lessons: [
      lesson("simple-present", "Simple Present", "Use present tense for habits and facts.", "For he, she and it, verbs usually add -s in the simple present: she studies, he reads.", [["habit", "She studies English every day.", "Every day signals a habit."]], [
        choice("Choose the correct sentence.", "She studies English every day.", "She is third person singular, so use studies.", [option("A", "She study English every day."), option("B", "She studies English every day.", true), option("C", "She studying English every day.")]),
        fill("He ____ to school every morning.", "goes", "He uses goes in simple present."),
        choice("Which time word often signals a habit?", "every day", "Every day often signals a habit.", [option("A", "every day", true), option("B", "right now"), option("C", "yesterday")]),
      ]),
      lesson("sentence-patterns", "Sentence Patterns", "Understand subject, verb and object.", "A simple English sentence often has subject + verb + object: I read books.", [["pattern", "Students write code.", "Students is the subject, write is the verb, code is the object."]], [
        choice("In 'I read books', what is the verb?", "read", "Read is the action.", [option("A", "I"), option("B", "read", true), option("C", "books")]),
        fill("Complete: Subject + ____ + object.", "verb", "The verb tells the action."),
        choice("Which is a complete simple sentence?", "Students write code.", "It has subject, verb and object.", [option("A", "Students write code.", true), option("B", "Very quickly."), option("C", "The blue book.")]),
      ]),
      lesson("short-reading", "Short Reading", "Find facts and main ideas in short texts.", "Start with short passages. Read the question first, then locate the sentence that answers it.", [["reading", "Mina studies English after dinner. She writes three new words.", "The passage tells Mina's study habit."]], [
        choice("What should you read first in a short quiz?", "the question", "The question tells you what to find.", [option("A", "the question", true), option("B", "the page number"), option("C", "nothing")]),
        fill("Complete: A main idea tells what the text is ____.", "about", "The main idea summarizes the text."),
        choice("What does locate mean in reading?", "find the place", "Locate means find where something is.", [option("A", "find the place", true), option("B", "change the word"), option("C", "ignore the text")]),
      ]),
    ],
  },
  {
    direction: "CPP",
    slug: "cpp-basics",
    title: "C++ Basics",
    description: "Input, output, variables and basic code reading.",
    lessons: [
      lesson("input-output", "Input And Output", "Use cin and cout.", "cin reads input from the user. cout prints output. Most beginner C++ problems begin with these two tools.", [["print", "cout << 3 + 4;", "The expression is evaluated first, then printed."]], [
        choice("Which object prints output in C++?", "cout", "cout prints output.", [option("A", "cin"), option("B", "cout", true), option("C", "int")]),
        code("What is the output?", "cout << 3 + 4;", "7", "3 + 4 equals 7."),
        fill("Complete the output statement: ____ << \"Hi\";", "cout", "cout sends text to the output stream."),
      ]),
      lesson("variables", "Variables", "Store values with types.", "A variable has a type and a name. int stores whole numbers, double stores decimals, string stores text.", [["int", "int score = 100;", "score stores an integer."]], [
        fill("Declare an integer named age: ____ age;", "int", "int is the integer type."),
        code("What value is printed?", "int x = 5;\nx = x + 2;\ncout << x;", "7", "x becomes 7."),
        choice("Which type stores whole numbers?", "int", "int stores whole numbers.", [option("A", "int", true), option("B", "double"), option("C", "string")]),
      ]),
      lesson("control-flow", "Control Flow", "Use if and loops.", "if chooses a branch. for and while repeat code while a condition allows it.", [["loop", "for (int i = 0; i < 3; i++) cout << i;", "The loop prints 0, 1 and 2."]], [
        choice("Which keyword starts a condition branch?", "if", "if checks a condition.", [option("A", "if", true), option("B", "vector"), option("C", "class")]),
        code("How many numbers are printed?", "for (int i = 0; i < 3; i++) cout << i;", "3", "The values are 0, 1 and 2."),
        fill("A ____ loop can repeat code a fixed number of times.", "for", "for loops are common for counted repetition."),
      ]),
    ],
  },
  {
    direction: "CPP",
    slug: "cpp-structures",
    title: "C++ Structures",
    description: "Arrays, strings, OOP and STL containers without online execution.",
    lessons: [
      lesson("arrays-strings", "Arrays And Strings", "Store multiple values.", "Arrays store values by index. string stores text and supports operations like size().", [["array", "int a[3] = {1, 2, 3};", "a[0] is 1."]], [
        choice("What is the first index in a C++ array?", "0", "C++ arrays are zero-indexed.", [option("A", "0", true), option("B", "1"), option("C", "-1")]),
        code("What is printed?", "string s = \"cat\";\ncout << s.size();", "3", "cat has three characters."),
        fill("Complete: a[____] is the first element.", "0", "Index 0 is first."),
      ]),
      lesson("oop-basics", "OOP Basics", "Understand class and public/private.", "A class groups data and functions. public members are accessible outside the class; private members are hidden.", [["class", "class Student { public: int score; };", "score can be accessed outside because it is public."]], [
        choice("Which keyword defines a class?", "class", "class defines a user type.", [option("A", "class", true), option("B", "cout"), option("C", "for")]),
        fill("Members hidden from outside usually use ____.", "private", "private hides implementation details."),
        choice("What is a constructor used for?", "initialize an object", "Constructors set up new objects.", [option("A", "initialize an object", true), option("B", "print output only"), option("C", "end a loop")]),
      ]),
      lesson("stl-basics", "STL Basics", "Use vector, map, set, queue and stack.", "STL containers solve common storage problems. vector is a dynamic array; map stores key-value pairs.", [["vector", "vector<int> nums; nums.push_back(5);", "push_back adds an element."]], [
        choice("Which STL container is a dynamic array?", "vector", "vector grows as needed.", [option("A", "vector", true), option("B", "map"), option("C", "set")]),
        fill("Complete: nums.____(5) adds 5 to a vector.", "push_back", "push_back appends an element."),
        code("What is printed?", "vector<int> v;\nv.push_back(5);\ncout << v[0];", "5", "The first element is 5."),
      ]),
    ],
  },
];

function assertSeedPassword(password, label) {
  if (!password || password.length < 12 || !/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password) || !/[^A-Za-z0-9]/.test(password)) {
    throw new Error(`${label} must be at least 12 chars and include upper/lowercase, number, and symbol`);
  }
}

async function seedOptionalUsers() {
  const adminEmail = (process.env.SEED_ADMIN_EMAIL || "").trim().toLowerCase();
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || "";

  if (adminEmail || adminPassword) {
    if (!adminEmail) throw new Error("SEED_ADMIN_EMAIL is required when SEED_ADMIN_PASSWORD is set");
    assertSeedPassword(adminPassword, "SEED_ADMIN_PASSWORD");
    await prisma.user.upsert({
      where: { email: adminEmail },
      update: {},
      create: { email: adminEmail, name: process.env.SEED_ADMIN_NAME || "Admin", role: "ADMIN", passwordHash: bcrypt.hashSync(adminPassword, 12) },
    });
    console.log(`Seeded admin user: ${adminEmail}`);
  } else {
    console.log("Skipped admin seed: set SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD to create an admin intentionally.");
  }

  if (process.env.SEED_DEMO_USERS === "true") {
    const studentEmail = (process.env.SEED_STUDENT_EMAIL || "student@example.local").trim().toLowerCase();
    const studentPassword = process.env.SEED_STUDENT_PASSWORD || "";
    assertSeedPassword(studentPassword, "SEED_STUDENT_PASSWORD");
    await prisma.user.upsert({
      where: { email: studentEmail },
      update: {},
      create: { email: studentEmail, name: process.env.SEED_STUDENT_NAME || "Student", role: "USER", passwordHash: bcrypt.hashSync(studentPassword, 12) },
    });
    console.log(`Seeded demo student user: ${studentEmail}`);
  }
}

async function main() {
  await seedOptionalUsers();

  for (const [courseIndex, courseData] of data.entries()) {
    const course = await prisma.course.upsert({
      where: { direction_slug: { direction: courseData.direction, slug: courseData.slug } },
      update: { title: courseData.title, description: courseData.description, sortOrder: courseIndex, isPublished: true },
      create: { direction: courseData.direction, slug: courseData.slug, title: courseData.title, description: courseData.description, sortOrder: courseIndex, isPublished: true },
    });

    for (const [lessonIndex, lessonData] of courseData.lessons.entries()) {
      const lesson = await prisma.lesson.upsert({
        where: { courseId_slug: { courseId: course.id, slug: lessonData.slug } },
        update: { title: lessonData.title, summary: lessonData.summary, content: lessonData.content, sortOrder: lessonIndex, isPublished: true },
        create: { courseId: course.id, slug: lessonData.slug, title: lessonData.title, summary: lessonData.summary, content: lessonData.content, sortOrder: lessonIndex, isPublished: true },
      });

      await prisma.example.deleteMany({ where: { lessonId: lesson.id } });
      await prisma.question.deleteMany({ where: { lessonId: lesson.id } });

      if (lessonData.examples.length) {
        await prisma.example.createMany({
          data: lessonData.examples.map((ex, exampleIndex) => ({
            id: `ex_${courseData.slug}_${lessonData.slug}_${exampleIndex}`,
            lessonId: lesson.id,
            title: ex[0],
            content: ex[1],
            explanation: ex[2],
            sortOrder: exampleIndex,
          })),
        });
      }

      if (lessonData.questions.length) {
        const questions = lessonData.questions.map((q, questionIndex) => ({
          id: `q_${courseData.slug}_${lessonData.slug}_${questionIndex}`,
          lessonId: lesson.id,
          type: q.type,
          prompt: q.prompt,
          codeSnippet: q.codeSnippet || null,
          answer: q.answer,
          explanation: q.explanation,
          difficulty: q.difficulty || "EASY",
          sortOrder: questionIndex,
        }));
        const options = lessonData.questions.flatMap((q, questionIndex) =>
          (q.options || []).map((o, optionIndex) => ({
            id: `qo_${courseData.slug}_${lessonData.slug}_${questionIndex}_${optionIndex}`,
            questionId: questions[questionIndex].id,
            label: o.label,
            content: o.content,
            isCorrect: o.isCorrect,
            sortOrder: optionIndex,
          })),
        );

        await prisma.question.createMany({ data: questions });
        if (options.length) await prisma.questionOption.createMany({ data: options });
      }
    }
  }
}

main().then(() => prisma.$disconnect()).catch(async (error) => { console.error(error); await prisma.$disconnect(); process.exit(1); });
