import { cppQuestionBank, getCppCategory } from "@/lib/exam-content";

export type CppPracticeQuestion = {
  id: string;
  type: "MULTIPLE_CHOICE" | "FILL_BLANK" | "CODE_READING";
  prompt: string;
  codeSnippet: string | null;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  answer: string;
  explanation: string;
  options: { id: string; label: string; content: string }[];
};

export type CppQuestionType = CppPracticeQuestion["type"];
export type CppQuestionTypeFilter = "ALL" | CppQuestionType;
export type CppQuestionIndexRow = CppPracticeQuestion & {
  categorySlug: string;
  categoryTitle: string;
  categoryZh: string;
  rowNumber: number;
};

export const cppQuestionTypePlan: Array<{ slug: CppQuestionTypeFilter; title: string; zh: string; description: string }> = [
  { slug: "ALL", title: "All Types", zh: "全部题型", description: "选择 填空 代码阅读一起练" },
  { slug: "MULTIPLE_CHOICE", title: "Multiple Choice", zh: "选择题", description: "概念判断 关键语法 容器行为" },
  { slug: "FILL_BLANK", title: "Fill Blank", zh: "填空题", description: "关键字 函数名 运算符和常见写法" },
  { slug: "CODE_READING", title: "Code Reading", zh: "代码阅读", description: "输出预测 状态追踪 循环和函数调用" },
];

const labels = ["A", "B", "C", "D"];

function option(questionId: string, index: number, content: string) {
  return { id: `${questionId}-${labels[index].toLowerCase()}`, label: labels[index], content };
}

function choice(id: string, prompt: string, answer: string, explanation: string, choices: string[], difficulty = difficultyFor(id)): CppPracticeQuestion {
  return {
    id,
    type: "MULTIPLE_CHOICE",
    prompt,
    codeSnippet: null,
    difficulty,
    answer,
    explanation,
    options: choices.map((content, index) => option(id, index, content)),
  };
}

function fill(id: string, prompt: string, answer: string, explanation: string, difficulty = difficultyFor(id)): CppPracticeQuestion {
  return { id, type: "FILL_BLANK", prompt, codeSnippet: null, difficulty, answer, explanation, options: [] };
}

function code(id: string, prompt: string, codeSnippet: string, answer: string, explanation: string, difficulty = difficultyFor(id)): CppPracticeQuestion {
  return { id, type: "CODE_READING", prompt, codeSnippet, difficulty, answer, explanation, options: [] };
}

function numberFromId(id: string) {
  return Number(id.match(/(\d+)$/)?.[1] || 1);
}

function difficultyFor(id: string): "EASY" | "MEDIUM" | "HARD" {
  const n = numberFromId(id);
  if (n % 10 === 0) return "HARD";
  if (n % 3 === 0 || n % 7 === 0) return "MEDIUM";
  return "EASY";
}

function variant(n: number) {
  return {
    n,
    a: (n % 9) + 1,
    b: (n % 5) + 2,
    c: (n % 4) + 1,
    index: n % 4,
  };
}

function buildCategoryQuestion(slug: string, n: number): CppPracticeQuestion {
  const v = variant(n);
  const id = `fallback-cpp-mega-${slug}-${n}`;
  const pattern = n % 5;

  if (slug === "syntax-types") {
    if (pattern === 0) return code(id, "Predict the output. 注意整数除法。", `int x = ${v.a};\nint y = ${v.b};\ncout << x / y;`, String(Math.trunc(v.a / v.b)), "Both operands are int, so C++ keeps the integer part.");
    if (pattern === 1) return choice(id, "Which type stores true/false values?", "bool", "bool stores true or false.", ["int", "double", "bool", "string"]);
    if (pattern === 2) return fill(id, `Complete: ____ score = ${v.a};`, "int", "int stores whole numbers.");
    if (pattern === 3) return code(id, "Predict the output. 注意后置自增。", `int x = ${v.a};\ncout << x++;`, String(v.a), "x++ prints the old value first, then increases x.");
    return choice(id, "Which operator checks equality in C++?", "==", "== compares two values; = assigns a value.", ["=", "==", "!=", ">="]);
  }

  if (slug === "control-flow") {
    if (pattern === 0) return code(id, "How many numbers are printed?", `for (int i = 0; i < ${v.b}; i++) {\n  cout << i;\n}`, String(v.b), "The loop runs for i = 0 through limit - 1.");
    if (pattern === 1) return choice(id, "Which keyword skips the current loop iteration?", "continue", "continue jumps to the next iteration.", ["break", "continue", "return", "switch"]);
    if (pattern === 2) return fill(id, "Complete: if (x > 0) { ... } ____ { ... }", "else", "else handles the opposite branch.");
    if (pattern === 3) return code(id, "Predict the output of the branch.", `int x = ${v.a};\nif (x % 2 == 0) cout << "even";\nelse cout << "odd";`, v.a % 2 === 0 ? "even" : "odd", "Use x % 2 to test parity.");
    return code(id, "What value is returned?", `int f(int x) {\n  if (x > ${v.b}) return x;\n  return x + ${v.c};\n}\ncout << f(${v.a});`, String(v.a > v.b ? v.a : v.a + v.c), "Follow the if condition before reading the return value.");
  }

  if (slug === "arrays-strings") {
    if (pattern === 0) return code(id, "Predict the output. 注意数组下标从 0 开始。", `int a[4] = {${v.a}, ${v.a + 1}, ${v.a + 2}, ${v.a + 3}};\ncout << a[${v.index}];`, String(v.a + v.index), "Array index 0 is the first element.");
    if (pattern === 1) return choice(id, "Which expression gets the length of string s?", "s.size()", "size() returns the number of characters.", ["s.length", "s.size()", "size.s", "len(s)"]);
    if (pattern === 2) return fill(id, "Complete: string s = \"code\"; cout << s.____();", "size", "s.size() returns string length.");
    if (pattern === 3) return code(id, "Predict the output after concatenation.", `string s = "C";\ns += "++";\ncout << s;`, "C++", "The += operator appends to the string.");
    return code(id, "What sum is printed?", `int a[3] = {${v.a}, ${v.b}, ${v.c}};\nint sum = 0;\nfor (int x : a) sum += x;\ncout << sum;`, String(v.a + v.b + v.c), "Range-for visits each element once.");
  }

  if (slug === "pointers-references") {
    if (pattern === 0) return choice(id, "Which operator gets the address of a variable?", "&", "&x means address of x.", ["*", "&", "->", "::"]);
    if (pattern === 1) return fill(id, "Complete: int* p = &x; cout << ____p;", "*", "*p dereferences the pointer.");
    if (pattern === 2) return code(id, "Predict the output after reference modification.", `int x = ${v.a};\nint& r = x;\nr += ${v.b};\ncout << x;`, String(v.a + v.b), "A reference is another name for the same variable.");
    if (pattern === 3) return code(id, "Predict the output after pointer assignment.", `int x = ${v.a};\nint* p = &x;\n*p = ${v.b};\ncout << x;`, String(v.b), "Writing through *p changes x.");
    return choice(id, "What does int* const p mean at beginner level?", "the pointer cannot point elsewhere", "const after * fixes the pointer itself.", ["the int is always zero", "the pointer cannot point elsewhere", "p is a reference", "p stores a string"]);
  }

  if (slug === "oop") {
    if (pattern === 0) return choice(id, "Which keyword defines a class?", "class", "class defines a user-defined type.", ["class", "cout", "vector", "return"]);
    if (pattern === 1) return fill(id, "Members accessible from outside usually go under ____:", "public", "public members can be accessed outside the class.");
    if (pattern === 2) return code(id, "Predict the output from a simple object.", `class Counter {\npublic:\n  int value = ${v.a};\n};\nCounter c;\ncout << c.value;`, String(v.a), "The public member value can be read from c.");
    if (pattern === 3) return choice(id, "What is a constructor mainly used for?", "initialize an object", "Constructors set up objects when they are created.", ["end a loop", "initialize an object", "sort a vector", "include a header"]);
    return code(id, "Predict the output after a method call.", `class Box {\npublic:\n  int x = ${v.a};\n  void add() { x += ${v.b}; }\n};\nBox b;\nb.add();\ncout << b.x;`, String(v.a + v.b), "The member function modifies the object's state.");
  }

  if (slug === "stl") {
    if (pattern === 0) return choice(id, "Which STL container is a dynamic array?", "vector", "vector supports indexed access and dynamic growth.", ["vector", "map", "set", "queue"]);
    if (pattern === 1) return fill(id, `Complete: vector<int> v; v.____(${v.a});`, "push_back", "push_back appends an element.");
    if (pattern === 2) return code(id, "Predict the output using vector.", `vector<int> v;\nv.push_back(${v.a});\nv.push_back(${v.b});\ncout << v[1];`, String(v.b), "v[1] is the second element.");
    if (pattern === 3) return code(id, "Predict the output using set uniqueness.", `set<int> s;\ns.insert(${v.a});\ns.insert(${v.a});\ncout << s.size();`, "1", "set keeps unique values only.");
    return code(id, "Predict the queue front after one pop.", `queue<int> q;\nq.push(${v.a});\nq.push(${v.b});\nq.pop();\ncout << q.front();`, String(v.b), "queue is first-in first-out.");
  }

  if (slug === "algorithms") {
    if (pattern === 0) return code(id, "Predict the first element after sorting.", `vector<int> v = {${v.b}, ${v.a}, ${v.c}};\nsort(v.begin(), v.end());\ncout << v[0];`, String(Math.min(v.a, v.b, v.c)), "sort arranges values in ascending order by default.");
    if (pattern === 1) return choice(id, "Which technique often solves sorted two-end scanning problems?", "two pointers", "Two pointers move from both ends or through a sequence.", ["two pointers", "private", "cout", "header guard"]);
    if (pattern === 2) return fill(id, "Prefix sum query usually computes sum[r] - sum[____].", "l", "A common zero-based pattern uses prefix[r] - prefix[l].");
    if (pattern === 3) return code(id, "Predict the linear search index.", `vector<int> v = {${v.a}, ${v.b}, ${v.c}};\nint ans = -1;\nfor (int i = 0; i < 3; i++) if (v[i] == ${v.b}) ans = i;\ncout << ans;`, "1", "The target is at index 1.");
    return code(id, "Predict the recursive result.", `int f(int n) {\n  if (n == 0) return 1;\n  return n * f(n - 1);\n}\ncout << f(${Math.min(5, v.c + 1)});`, String(factorial(Math.min(5, v.c + 1))), "This computes factorial recursively.");
  }

  if (pattern === 0) return code(id, "Predict the output. Track variable updates carefully.", `int x = ${v.a}, y = ${v.b};\nx += y;\ny = x - y;\ncout << x << " " << y;`, `${v.a + v.b} ${v.a}`, "Update x first, then compute y from the new x.");
  if (pattern === 1) return code(id, "Predict the nested-loop count.", `int cnt = 0;\nfor (int i = 0; i < ${v.c}; i++)\n  for (int j = 0; j < ${v.b}; j++) cnt++;\ncout << cnt;`, String(v.c * v.b), "Nested loops multiply the iteration counts.");
  if (pattern === 2) return choice(id, "Output prediction题最重要的第一步是什么？", "trace state changes", "Track each variable/container state line by line.", ["run online compiler", "ignore branches", "trace state changes", "delete includes"]);
  if (pattern === 3) return fill(id, "When predicting output, write variable values ____ by line.", "line", "Line-by-line tracing prevents missing updates.");
  return code(id, "Predict the function-call output.", `int add(int a, int b) { return a + b; }\ncout << add(${v.a}, ${v.b});`, String(v.a + v.b), "Evaluate function arguments and return value.");
}

function factorial(n: number): number {
  return n <= 1 ? 1 : n * factorial(n - 1);
}

export function buildCppCategoryQuestions(categorySlug: string, page = 1, pageSize = 25) {
  const category = getCppCategory(categorySlug) || cppQuestionBank.categoryPlan[0];
  const start = (Math.max(1, page) - 1) * pageSize + 1;
  const end = Math.min(category.count, start + pageSize - 1);
  return Array.from({ length: Math.max(0, end - start + 1) }, (_, index) => buildCategoryQuestion(category.slug, start + index));
}

export function buildCppMegaQuestions(page = 1, pageSize = 25) {
  const totalPagesPerCategory = Math.ceil(cppQuestionBank.questionsPerCategory / pageSize);
  const safePage = Math.max(1, Math.min(page, cppQuestionBank.categoryPlan.length * totalPagesPerCategory));
  const categoryIndex = Math.floor((safePage - 1) / totalPagesPerCategory);
  const pageInCategory = ((safePage - 1) % totalPagesPerCategory) + 1;
  const category = cppQuestionBank.categoryPlan[categoryIndex] || cppQuestionBank.categoryPlan[0];
  return {
    category,
    page: safePage,
    totalPages: cppQuestionBank.categoryPlan.length * totalPagesPerCategory,
    pageInCategory,
    questions: buildCppCategoryQuestions(category.slug, pageInCategory, pageSize),
  };
}

function normalizeTypeFilter(type?: string): CppQuestionTypeFilter {
  return cppQuestionTypePlan.some((item) => item.slug === type) ? type as CppQuestionTypeFilter : "ALL";
}

function buildFullCategory(categorySlug: string) {
  const category = getCppCategory(categorySlug) || cppQuestionBank.categoryPlan[0];
  const questions = Array.from({ length: category.count }, (_, index) => buildCategoryQuestion(category.slug, index + 1));
  const typeCounts = cppQuestionTypePlan.reduce<Record<CppQuestionTypeFilter, number>>((counts, item) => {
    counts[item.slug] = item.slug === "ALL" ? questions.length : questions.filter((question) => question.type === item.slug).length;
    return counts;
  }, {
    ALL: 0,
    MULTIPLE_CHOICE: 0,
    FILL_BLANK: 0,
    CODE_READING: 0,
  });

  return { category, questions, typeCounts };
}

export function getCppCategoryTypeCounts(categorySlug: string) {
  return buildFullCategory(categorySlug).typeCounts;
}

export function buildCppFilteredMegaQuestions({
  categorySlug,
  type,
  page = 1,
  pageSize = 20,
}: {
  categorySlug?: string;
  type?: string;
  page?: number;
  pageSize?: number;
}) {
  const { category, questions: categoryQuestions, typeCounts } = buildFullCategory(categorySlug || cppQuestionBank.categoryPlan[0].slug);
  const typeFilter = normalizeTypeFilter(type);
  const filteredQuestions = typeFilter === "ALL"
    ? categoryQuestions
    : categoryQuestions.filter((question) => question.type === typeFilter);
  const totalPages = Math.max(1, Math.ceil(filteredQuestions.length / pageSize));
  const safePage = Math.max(1, Math.min(totalPages, Math.trunc(page) || 1));
  const start = (safePage - 1) * pageSize;

  return {
    category,
    type: typeFilter,
    page: safePage,
    pageSize,
    totalPages,
    totalQuestions: filteredQuestions.length,
    categoryTotal: categoryQuestions.length,
    typeCounts,
    questions: filteredQuestions.slice(start, start + pageSize),
  };
}

export function buildAllCppMegaQuestions() {
  return cppQuestionBank.categoryPlan.flatMap((category) =>
    Array.from({ length: category.count }, (_, index) => buildCategoryQuestion(category.slug, index + 1)),
  );
}

export function buildCppQuestionIndex(): CppQuestionIndexRow[] {
  return cppQuestionBank.categoryPlan.flatMap((category) =>
    Array.from({ length: category.count }, (_, index) => ({
      ...buildCategoryQuestion(category.slug, index + 1),
      categorySlug: category.slug,
      categoryTitle: category.title,
      categoryZh: category.zh,
      rowNumber: index + 1,
    })),
  );
}

function matchesQuery(question: CppQuestionIndexRow, query: string) {
  const cleanQuery = query.trim().toLowerCase();
  if (!cleanQuery) return true;
  const haystack = [
    question.id,
    question.prompt,
    question.codeSnippet || "",
    question.difficulty,
    question.type,
    question.categorySlug,
    question.categoryTitle,
    question.categoryZh,
  ].join(" ").toLowerCase();
  return cleanQuery.split(/\s+/).every((term) => haystack.includes(term));
}

export function searchCppQuestionIndex({
  categorySlug,
  type,
  query = "",
  page = 1,
  pageSize = 24,
}: {
  categorySlug?: string;
  type?: string;
  query?: string;
  page?: number;
  pageSize?: number;
}) {
  const typeFilter = normalizeTypeFilter(type);
  const allRows = buildCppQuestionIndex();
  const filteredRows = allRows.filter((question) => {
    if (categorySlug && question.categorySlug !== categorySlug) return false;
    if (typeFilter !== "ALL" && question.type !== typeFilter) return false;
    return matchesQuery(question, query);
  });
  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize));
  const safePage = Math.max(1, Math.min(totalPages, Math.trunc(page) || 1));
  const start = (safePage - 1) * pageSize;

  return {
    rows: filteredRows.slice(start, start + pageSize),
    page: safePage,
    pageSize,
    totalPages,
    totalQuestions: filteredRows.length,
    type: typeFilter,
  };
}
