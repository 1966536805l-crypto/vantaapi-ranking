"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import FlagLanguageToggle from "@/components/layout/FlagLanguageToggle";
import GitHubRepoAnalyzer from "@/components/tools/GitHubRepoAnalyzerTool";
import ToolLayout, { type OutputBlock } from "@/components/tools/ToolLayout";
import { recordLocalActivity } from "@/lib/local-progress";
import { localizedHref, type InterfaceLanguage } from "@/lib/language";
import { toolDefinitions, type ToolDefinition, type ToolSlug } from "@/lib/tool-definitions";

type ApiMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
type RoadmapTrack = "zero" | "frontend" | "python" | "automation" | "indie";
type PromptTemplateKey = "builder" | "repo" | "code-coach" | "english-coach" | "api-docs";

const sampleCode = `async function loadUser(id) {
  const res = await fetch("/api/users/" + id);
  const data = await res.json();
  return data.user.name;
}`;

const sampleBug = `TypeError: Cannot read properties of undefined reading name

async function loadUser(id) {
  const data = await fetchUser(id);
  return data.user.name;
}`;

const samplePython = `def total_prices(items):
    total = 0
    for item in items:
        total += item["price"]
    return total

print(total_prices([{"price": 12}, {"price": 30}]))`;

const sampleApiBug = `401 Unauthorized

const response = await fetch("https://api.example.com/v1/users", {
  headers: {
    Authorization: token
  }
});`;

const roadmapTracks: Record<RoadmapTrack, { label: string; goal: string; stack: string[]; project: string }> = {
  zero: {
    label: "Zero base",
    goal: "Build programming confidence from syntax to small web tools",
    stack: ["HTML", "CSS", "JavaScript", "Git", "Browser DevTools"],
    project: "Personal tool landing page with one working calculator",
  },
  frontend: {
    label: "Frontend",
    goal: "Ship responsive React pages and reusable product components",
    stack: ["TypeScript", "React", "Next.js", "Tailwind", "API integration"],
    project: "Dashboard with filters forms charts and saved local state",
  },
  python: {
    label: "Python",
    goal: "Use Python for scripts data processing APIs and automation",
    stack: ["Python", "venv", "requests", "pandas", "FastAPI"],
    project: "Data cleaning API with CSV import and report export",
  },
  automation: {
    label: "Automation",
    goal: "Automate repeated browser file and API workflows safely",
    stack: ["Python", "Playwright", "cron", "webhooks", "logging"],
    project: "Daily website checker that sends a structured report",
  },
  indie: {
    label: "Indie developer",
    goal: "Find a narrow problem build a usable MVP and prepare launch",
    stack: ["Next.js", "Prisma", "Auth", "Payments later", "Analytics"],
    project: "One paid-tool style MVP with onboarding and retention loop",
  },
};

const promptTemplates: Record<PromptTemplateKey, { label: string; role: string; tasks: string; constraints: string; acceptance: string }> = {
  builder: {
    label: "Product builder",
    role: "You are a senior full stack product engineer",
    tasks: `1. Clarify the smallest shippable version
2. Design the route data and component structure
3. Implement with existing project patterns
4. Add focused tests or manual verification
5. Explain exactly how to run it`,
    constraints: `- Keep the MVP sharp
- Prefer existing stack and local helpers
- Avoid inflated marketing copy
- Ship something usable before adding breadth`,
    acceptance: `- The feature works from the first screen
- Empty error loading and mobile states are handled
- The user can verify it with one command or URL`,
  },
  repo: {
    label: "GitHub repo audit",
    role: "You are a pragmatic open source maintainer",
    tasks: `1. Read README package scripts config and CI
2. Identify how to install run test and deploy
3. List security and license risks
4. Suggest the first contribution path
5. Produce a PR checklist`,
    constraints: `- Do not invent files that are not present
- Separate facts from assumptions
- Prioritize contributor onboarding
- Keep commands copy ready`,
    acceptance: `- A new developer knows how to start
- Release blockers are visible
- The PR checklist catches docs tests and security risks`,
  },
  "code-coach": {
    label: "Programming coach",
    role: "You are a programming coach for zero base learners",
    tasks: `1. Explain the current concept in one small idea
2. Give one hint before the answer
3. Ask the learner to predict output or fill the blank
4. Show the answer only when requested
5. End with one tiny variation drill`,
    constraints: `- No long lectures
- No full solution first
- Use the learner's current code
- Keep examples runnable and short`,
    acceptance: `- The learner can do the next step alone
- The answer teaches debugging not memorization
- The final drill changes one thing only`,
  },
  "english-coach": {
    label: "English memory coach",
    role: "You are an English coach built only for vocabulary spelling and exam reading",
    tasks: `1. Give the core meaning
2. Add one natural phrase
3. Add one original sentence
4. Create a memory hook
5. Test spelling recall within 5 seconds`,
    constraints: `- Use original examples only
- Do not quote copyrighted dictionary entries
- Do not claim human audio
- Keep Chinese explanations concise when needed`,
    acceptance: `- The learner can spell the word
- The learner sees one usage pattern
- The drill is short enough to repeat daily`,
  },
  "api-docs": {
    label: "API docs",
    role: "You are a developer documentation writer",
    tasks: `1. State what the endpoint does
2. Document method headers body and response
3. Generate curl fetch axios and Python examples
4. Add error cases
5. Add a minimal test checklist`,
    constraints: `- Use concrete placeholders
- Never hide auth requirements
- Keep examples copy ready
- Mark destructive requests clearly`,
    acceptance: `- A developer can call the API without asking follow up questions
- Errors and auth are documented
- Examples match the same request shape`,
  },
};

const launchWorkflow = [
  {
    step: "01",
    tool: "github-repo-analyzer" as ToolSlug,
    title: "Audit",
    titleZh: "上线体检",
    body: "Find README env CI deploy security and release blockers.",
    bodyZh: "检查 README 环境变量 CI 部署 安全和发布阻塞项",
  },
  {
    step: "02",
    tool: "bug-finder" as ToolSlug,
    title: "Debug",
    titleZh: "定位 Bug",
    body: "Turn errors into causes steps repair notes and verification.",
    bodyZh: "把报错整理成原因 步骤 修复方向和验证清单",
  },
  {
    step: "03",
    tool: "api-request-generator" as ToolSlug,
    title: "API",
    titleZh: "接口示例",
    body: "Generate curl fetch axios and Python requests snippets.",
    bodyZh: "生成 curl fetch axios 和 Python requests 示例",
  },
  {
    step: "04",
    tool: "dev-utilities" as ToolSlug,
    title: "Utilities",
    titleZh: "开发工具",
    body: "Check JSON regex timestamps and copy clean outputs.",
    bodyZh: "检查 JSON 正则 时间戳并复制干净结果",
  },
  {
    step: "05",
    tool: "learning-roadmap" as ToolSlug,
    title: "Roadmap",
    titleZh: "路线",
    body: "Plan the next 30 days after the first launch.",
    bodyZh: "上线后规划接下来 30 天的学习和开发路线",
  },
];

function launchWorkflowCopy(item: (typeof launchWorkflow)[number], language: InterfaceLanguage) {
  if (language === "zh") return { title: item.titleZh, body: item.bodyZh };
  const localized: Partial<Record<InterfaceLanguage, Partial<Record<ToolSlug, { title: string; body: string }>>>> = {
    ja: {
      "github-repo-analyzer": { title: "監査", body: "README env CI デプロイ セキュリティの阻害要因を確認します" },
      "bug-finder": { title: "デバッグ", body: "エラーを原因 手順 修正メモ 検証に分けます" },
      "api-request-generator": { title: "API", body: "curl fetch axios Python requests の例を生成します" },
      "dev-utilities": { title: "ユーティリティ", body: "JSON 正規表現 タイムスタンプを確認します" },
      "learning-roadmap": { title: "ロードマップ", body: "リリース後 30 日の学習と開発を計画します" },
    },
    ko: {
      "github-repo-analyzer": { title: "점검", body: "README env CI 배포 보안 출시 차단 항목을 확인합니다" },
      "bug-finder": { title: "디버그", body: "오류를 원인 단계 수정 메모 검증으로 정리합니다" },
      "api-request-generator": { title: "API", body: "curl fetch axios Python requests 예시를 생성합니다" },
      "dev-utilities": { title: "유틸리티", body: "JSON 정규식 타임스탬프를 확인합니다" },
      "learning-roadmap": { title: "로드맵", body: "첫 출시 후 30일 학습과 개발을 계획합니다" },
    },
    es: {
      "github-repo-analyzer": { title: "Audit", body: "Revisa README env CI deploy seguridad y bloqueos de release" },
      "bug-finder": { title: "Debug", body: "Convierte errores en causas pasos arreglo y verificación" },
      "api-request-generator": { title: "API", body: "Genera ejemplos curl fetch axios y Python requests" },
      "dev-utilities": { title: "Utilidades", body: "Valida JSON regex timestamps y copia resultados limpios" },
      "learning-roadmap": { title: "Ruta", body: "Planifica los próximos 30 días después del primer lanzamiento" },
    },
    ar: {
      "github-repo-analyzer": { title: "فحص", body: "يفحص README و env و CI والنشر والأمان وعوائق الإطلاق" },
      "bug-finder": { title: "تصحيح", body: "يحوّل الأخطاء إلى أسباب وخطوات وإصلاحات وتحقق" },
      "api-request-generator": { title: "API", body: "ينشئ أمثلة curl و fetch و axios و Python requests" },
      "dev-utilities": { title: "أدوات", body: "يفحص JSON و regex والطوابع الزمنية وينسخ نتائج نظيفة" },
      "learning-roadmap": { title: "مسار", body: "يخطط للأيام الثلاثين بعد أول إطلاق" },
    },
    de: {
      "github-repo-analyzer": { title: "Audit", body: "Prueft README env CI Deploy Sicherheit und Launch Blocker" },
      "bug-finder": { title: "Debug", body: "Macht aus Fehlern Ursachen Schritte Fixes und Verifikation" },
      "api-request-generator": { title: "API", body: "Erzeugt curl fetch axios und Python requests Beispiele" },
      "dev-utilities": { title: "Werkzeuge", body: "Prueft JSON Regex Zeitstempel und kopiert saubere Ergebnisse" },
      "learning-roadmap": { title: "Route", body: "Plant die naechsten 30 Tage nach dem ersten Launch" },
    },
    pt: {
      "github-repo-analyzer": { title: "Auditoria", body: "Verifica README env CI deploy seguranca e bloqueios de lancamento" },
      "bug-finder": { title: "Debug", body: "Transforma erros em causas passos correcao e verificacao" },
      "api-request-generator": { title: "API", body: "Gera exemplos curl fetch axios e Python requests" },
      "dev-utilities": { title: "Utilitarios", body: "Valida JSON regex timestamps e copia resultados limpos" },
      "learning-roadmap": { title: "Roteiro", body: "Planeja os proximos 30 dias apos o primeiro lancamento" },
    },
    ru: {
      "github-repo-analyzer": { title: "Аудит", body: "Проверяет README env CI деплой безопасность и launch blockers" },
      "bug-finder": { title: "Отладка", body: "Превращает ошибки в причины шаги исправления и проверку" },
      "api-request-generator": { title: "API", body: "Генерирует curl fetch axios и Python requests примеры" },
      "dev-utilities": { title: "Утилиты", body: "Проверяет JSON regex timestamps и копирует чистый результат" },
      "learning-roadmap": { title: "План", body: "Планирует 30 дней после первого запуска" },
    },
    hi: {
      "github-repo-analyzer": { title: "ऑडिट", body: "README env CI deploy security और launch blockers जांचता है" },
      "bug-finder": { title: "Debug", body: "Errors को कारण steps fix और verification में बदलता है" },
      "api-request-generator": { title: "API", body: "curl fetch axios और Python requests examples बनाता है" },
      "dev-utilities": { title: "Tools", body: "JSON regex timestamp जांचता है और clean output देता है" },
      "learning-roadmap": { title: "Roadmap", body: "पहले launch के बाद अगले 30 दिन plan करता है" },
    },
    id: {
      "github-repo-analyzer": { title: "Audit", body: "Memeriksa README env CI deploy keamanan dan blocker rilis" },
      "bug-finder": { title: "Debug", body: "Mengubah error menjadi penyebab langkah perbaikan dan verifikasi" },
      "api-request-generator": { title: "API", body: "Membuat contoh curl fetch axios dan Python requests" },
      "dev-utilities": { title: "Utilitas", body: "Memeriksa JSON regex timestamp dan menyalin hasil bersih" },
      "learning-roadmap": { title: "Rencana", body: "Merencanakan 30 hari setelah rilis pertama" },
    },
    vi: {
      "github-repo-analyzer": { title: "Kiem tra", body: "Kiem tra README env CI deploy bao mat va blocker ra mat" },
      "bug-finder": { title: "Debug", body: "Bien loi thanh nguyen nhan buoc sua va kiem chung" },
      "api-request-generator": { title: "API", body: "Tao vi du curl fetch axios va Python requests" },
      "dev-utilities": { title: "Tien ich", body: "Kiem tra JSON regex timestamp va copy ket qua sach" },
      "learning-roadmap": { title: "Lo trinh", body: "Lap ke hoach 30 ngay sau lan ra mat dau" },
    },
    th: {
      "github-repo-analyzer": { title: "ตรวจ", body: "ตรวจ README env CI deploy ความปลอดภัย และ blocker ก่อนปล่อย" },
      "bug-finder": { title: "ดีบัก", body: "เปลี่ยน error เป็นสาเหตุ ขั้นตอน วิธีแก้ และการตรวจสอบ" },
      "api-request-generator": { title: "API", body: "สร้างตัวอย่าง curl fetch axios และ Python requests" },
      "dev-utilities": { title: "เครื่องมือ", body: "ตรวจ JSON regex timestamp และคัดลอกผลลัพธ์สะอาด" },
      "learning-roadmap": { title: "แผน", body: "วางแผน 30 วันหลังการปล่อยครั้งแรก" },
    },
    tr: {
      "github-repo-analyzer": { title: "Denetim", body: "README env CI deploy guvenlik ve yayin engellerini kontrol eder" },
      "bug-finder": { title: "Debug", body: "Hatalari neden adim cozum ve dogrulamaya cevirir" },
      "api-request-generator": { title: "API", body: "curl fetch axios ve Python requests ornekleri uretir" },
      "dev-utilities": { title: "Araclar", body: "JSON regex timestamp kontrol eder ve temiz sonuc kopyalar" },
      "learning-roadmap": { title: "Rota", body: "Ilk yayindan sonraki 30 gunu planlar" },
    },
    it: {
      "github-repo-analyzer": { title: "Audit", body: "Controlla README env CI deploy sicurezza e blocchi di lancio" },
      "bug-finder": { title: "Debug", body: "Trasforma errori in cause passaggi correzioni e verifica" },
      "api-request-generator": { title: "API", body: "Genera esempi curl fetch axios e Python requests" },
      "dev-utilities": { title: "Utility", body: "Controlla JSON regex timestamp e copia output puliti" },
      "learning-roadmap": { title: "Percorso", body: "Pianifica i 30 giorni dopo il primo lancio" },
    },
    nl: {
      "github-repo-analyzer": { title: "Audit", body: "Controleert README env CI deploy security en launch blockers" },
      "bug-finder": { title: "Debug", body: "Zet fouten om in oorzaak stappen fix en controle" },
      "api-request-generator": { title: "API", body: "Maakt curl fetch axios en Python requests voorbeelden" },
      "dev-utilities": { title: "Tools", body: "Controleert JSON regex timestamps en kopieert schone output" },
      "learning-roadmap": { title: "Route", body: "Plant de 30 dagen na de eerste launch" },
    },
    pl: {
      "github-repo-analyzer": { title: "Audyt", body: "Sprawdza README env CI deploy bezpieczenstwo i blokery publikacji" },
      "bug-finder": { title: "Debug", body: "Zmienia bledy w przyczyny kroki naprawy i weryfikacje" },
      "api-request-generator": { title: "API", body: "Tworzy przyklady curl fetch axios i Python requests" },
      "dev-utilities": { title: "Narzędzia", body: "Sprawdza JSON regex timestamps i kopiuje czysty wynik" },
      "learning-roadmap": { title: "Plan", body: "Planuje 30 dni po pierwszej publikacji" },
    },
  };
  return localized[language]?.[item.tool] || { title: item.title, body: item.body };
}

type WorkbenchCopy = {
  navKicker: string;
  heroEyebrow: string;
  proof: [string, string, string];
  inputPattern: string;
  localFirst: string;
  privateDefault: string;
  launchFlowLabel: string;
  recommendedOrder: string;
  workflowTitle: string;
  startWithAudit: string;
  whatItDoes: string;
  workflow: (shortTitle: string) => string;
  goodFor: string;
  who: string;
  examples: string;
  inputOutput: string;
  input: string;
  output: string;
  faqLimits: string;
  beforeUse: string;
  usageLimits: string;
  helperLine: string;
};

const workbenchCopy: Partial<Record<InterfaceLanguage, WorkbenchCopy>> & { en: WorkbenchCopy; zh: WorkbenchCopy } = {
  en: {
    navKicker: "Launch flow",
    heroEyebrow: "AI Developer Tools",
    proof: ["Fast", "Copyable", "No login required"],
    inputPattern: "Input Pattern",
    localFirst: "Local first",
    privateDefault: "Private by default",
    launchFlowLabel: "Launch workflow",
    recommendedOrder: "Recommended order",
    workflowTitle: "From repo audit to release tasks",
    startWithAudit: "Start with audit",
    whatItDoes: "What It Does",
    workflow: (shortTitle) => `${shortTitle} workflow`,
    goodFor: "Good For",
    who: "Who should use it",
    examples: "Examples",
    inputOutput: "Input and output",
    input: "Input:",
    output: "Output:",
    faqLimits: "FAQ And Limits",
    beforeUse: "Before you use it",
    usageLimits: "Usage limits",
    helperLine: "Built for fast copyable work",
  },
  zh: {
    navKicker: "上线流程",
    heroEyebrow: "AI 开发者工具",
    proof: ["快速", "可复制", "无需登录"],
    inputPattern: "输入方式",
    localFirst: "本地优先",
    privateDefault: "默认隐私",
    launchFlowLabel: "上线工作流",
    recommendedOrder: "推荐顺序",
    workflowTitle: "从仓库体检到发布任务",
    startWithAudit: "先跑体检",
    whatItDoes: "能做什么",
    workflow: (shortTitle) => `${shortTitle} 工作流`,
    goodFor: "适合谁",
    who: "谁最适合用",
    examples: "示例",
    inputOutput: "输入和输出",
    input: "输入：",
    output: "输出：",
    faqLimits: "常见问题和限制",
    beforeUse: "使用前知道这些",
    usageLimits: "使用限制",
    helperLine: "适合快速复制和执行",
  },
  ja: {
    navKicker: "リリース手順",
    heroEyebrow: "AI 開発ツール",
    proof: ["高速", "コピー可能", "ログイン不要"],
    inputPattern: "入力形式",
    localFirst: "ローカル優先",
    privateDefault: "既定でプライベート",
    launchFlowLabel: "リリースワークフロー",
    recommendedOrder: "推奨順序",
    workflowTitle: "リポジトリ監査からリリース作業へ",
    startWithAudit: "監査から始める",
    whatItDoes: "できること",
    workflow: (shortTitle) => `${shortTitle} ワークフロー`,
    goodFor: "向いている人",
    who: "誰が使うべきか",
    examples: "例",
    inputOutput: "入力と出力",
    input: "入力：",
    output: "出力：",
    faqLimits: "FAQ と制限",
    beforeUse: "使う前に",
    usageLimits: "利用制限",
    helperLine: "すぐコピーして実行しやすい形式",
  },
  ko: {
    navKicker: "출시 흐름",
    heroEyebrow: "AI 개발자 도구",
    proof: ["빠름", "복사 가능", "로그인 불필요"],
    inputPattern: "입력 방식",
    localFirst: "로컬 우선",
    privateDefault: "기본 비공개",
    launchFlowLabel: "출시 워크플로",
    recommendedOrder: "추천 순서",
    workflowTitle: "저장소 점검에서 출시 작업까지",
    startWithAudit: "점검부터 시작",
    whatItDoes: "무엇을 하는가",
    workflow: (shortTitle) => `${shortTitle} 워크플로`,
    goodFor: "적합한 사용자",
    who: "누가 쓰면 좋은가",
    examples: "예시",
    inputOutput: "입력과 출력",
    input: "입력:",
    output: "출력:",
    faqLimits: "FAQ 및 제한",
    beforeUse: "사용 전 확인",
    usageLimits: "사용 제한",
    helperLine: "빠르게 복사해 실행하기 좋습니다",
  },
  es: {
    navKicker: "Flujo de lanzamiento",
    heroEyebrow: "Herramientas AI para devs",
    proof: ["Rápido", "Copiable", "Sin iniciar sesión"],
    inputPattern: "Patrón de entrada",
    localFirst: "Local primero",
    privateDefault: "Privado por defecto",
    launchFlowLabel: "Flujo de lanzamiento",
    recommendedOrder: "Orden recomendado",
    workflowTitle: "Del audit del repo a tareas de release",
    startWithAudit: "Empezar con audit",
    whatItDoes: "Qué hace",
    workflow: (shortTitle) => `flujo de ${shortTitle}`,
    goodFor: "Ideal para",
    who: "Quién debería usarlo",
    examples: "Ejemplos",
    inputOutput: "Entrada y salida",
    input: "Entrada:",
    output: "Salida:",
    faqLimits: "FAQ y límites",
    beforeUse: "Antes de usar",
    usageLimits: "Límites de uso",
    helperLine: "Pensado para copiar y actuar rápido",
  },
  ar: {
    navKicker: "مسار الإطلاق",
    heroEyebrow: "أدوات AI للمطورين",
    proof: ["سريع", "قابل للنسخ", "لا يحتاج تسجيل دخول"],
    inputPattern: "طريقة الإدخال",
    localFirst: "محلي أولا",
    privateDefault: "خاص افتراضيا",
    launchFlowLabel: "سير عمل الإطلاق",
    recommendedOrder: "الترتيب المقترح",
    workflowTitle: "من فحص المستودع إلى مهام الإطلاق",
    startWithAudit: "ابدأ بالفحص",
    whatItDoes: "ماذا يفعل",
    workflow: (shortTitle) => `سير عمل ${shortTitle}`,
    goodFor: "مناسب لـ",
    who: "من يستفيد منه",
    examples: "أمثلة",
    inputOutput: "الإدخال والإخراج",
    input: "الإدخال:",
    output: "الإخراج:",
    faqLimits: "أسئلة وحدود",
    beforeUse: "قبل الاستخدام",
    usageLimits: "حدود الاستخدام",
    helperLine: "مصمم لنسخ العمل وتنفيذه بسرعة",
  },
  de: {
    navKicker: "Launch Flow",
    heroEyebrow: "AI Entwicklerwerkzeuge",
    proof: ["Schnell", "Kopierbar", "Ohne Login"],
    inputPattern: "Eingabeformat",
    localFirst: "Lokal zuerst",
    privateDefault: "Standardmaessig privat",
    launchFlowLabel: "Launch Workflow",
    recommendedOrder: "Empfohlene Reihenfolge",
    workflowTitle: "Vom Repo Audit zu Release Aufgaben",
    startWithAudit: "Mit Audit starten",
    whatItDoes: "Was es macht",
    workflow: (shortTitle) => `${shortTitle} Workflow`,
    goodFor: "Geeignet fuer",
    who: "Wer sollte es nutzen",
    examples: "Beispiele",
    inputOutput: "Eingabe und Ausgabe",
    input: "Eingabe:",
    output: "Ausgabe:",
    faqLimits: "FAQ und Grenzen",
    beforeUse: "Vor der Nutzung",
    usageLimits: "Nutzungsgrenzen",
    helperLine: "Gebaut fuer schnelle kopierbare Arbeit",
  },
  pt: {
    navKicker: "Fluxo de lancamento",
    heroEyebrow: "Ferramentas AI para devs",
    proof: ["Rapido", "Copiavel", "Sem login"],
    inputPattern: "Padrao de entrada",
    localFirst: "Local primeiro",
    privateDefault: "Privado por padrao",
    launchFlowLabel: "Fluxo de lancamento",
    recommendedOrder: "Ordem recomendada",
    workflowTitle: "Da auditoria do repo para tarefas de release",
    startWithAudit: "Comecar pela auditoria",
    whatItDoes: "O que faz",
    workflow: (shortTitle) => `fluxo de ${shortTitle}`,
    goodFor: "Bom para",
    who: "Quem deve usar",
    examples: "Exemplos",
    inputOutput: "Entrada e saida",
    input: "Entrada:",
    output: "Saida:",
    faqLimits: "FAQ e limites",
    beforeUse: "Antes de usar",
    usageLimits: "Limites de uso",
    helperLine: "Feito para copiar e agir rapido",
  },
  ru: {
    navKicker: "Поток запуска",
    heroEyebrow: "AI инструменты разработчика",
    proof: ["Быстро", "Можно копировать", "Без логина"],
    inputPattern: "Формат ввода",
    localFirst: "Сначала локально",
    privateDefault: "Приватно по умолчанию",
    launchFlowLabel: "Launch workflow",
    recommendedOrder: "Рекомендуемый порядок",
    workflowTitle: "От аудита repo к задачам релиза",
    startWithAudit: "Начать с аудита",
    whatItDoes: "Что делает",
    workflow: (shortTitle) => `${shortTitle} workflow`,
    goodFor: "Подходит для",
    who: "Кому полезно",
    examples: "Примеры",
    inputOutput: "Ввод и вывод",
    input: "Ввод:",
    output: "Вывод:",
    faqLimits: "FAQ и ограничения",
    beforeUse: "Перед использованием",
    usageLimits: "Ограничения",
    helperLine: "Сделано для быстрой копируемой работы",
  },
  hi: {
    navKicker: "लॉन्च फ्लो",
    heroEyebrow: "AI डेवलपर टूल्स",
    proof: ["तेज", "कॉपी योग्य", "लॉगिन नहीं"],
    inputPattern: "इनपुट तरीका",
    localFirst: "पहले local",
    privateDefault: "डिफॉल्ट निजी",
    launchFlowLabel: "लॉन्च workflow",
    recommendedOrder: "सुझाया क्रम",
    workflowTitle: "Repo audit से release tasks तक",
    startWithAudit: "Audit से शुरू करें",
    whatItDoes: "क्या करता है",
    workflow: (shortTitle) => `${shortTitle} workflow`,
    goodFor: "किसके लिए",
    who: "कौन इस्तेमाल करे",
    examples: "उदाहरण",
    inputOutput: "Input और output",
    input: "Input:",
    output: "Output:",
    faqLimits: "FAQ और सीमाएं",
    beforeUse: "इस्तेमाल से पहले",
    usageLimits: "सीमाएं",
    helperLine: "तेज copyable काम के लिए",
  },
  id: {
    navKicker: "Alur rilis",
    heroEyebrow: "Alat AI developer",
    proof: ["Cepat", "Bisa disalin", "Tanpa login"],
    inputPattern: "Pola input",
    localFirst: "Lokal dulu",
    privateDefault: "Privat secara default",
    launchFlowLabel: "Workflow rilis",
    recommendedOrder: "Urutan disarankan",
    workflowTitle: "Dari audit repo ke tugas rilis",
    startWithAudit: "Mulai dengan audit",
    whatItDoes: "Apa yang dilakukan",
    workflow: (shortTitle) => `workflow ${shortTitle}`,
    goodFor: "Cocok untuk",
    who: "Siapa yang memakai",
    examples: "Contoh",
    inputOutput: "Input dan output",
    input: "Input:",
    output: "Output:",
    faqLimits: "FAQ dan batasan",
    beforeUse: "Sebelum memakai",
    usageLimits: "Batas penggunaan",
    helperLine: "Dibuat untuk kerja cepat yang bisa disalin",
  },
  vi: {
    navKicker: "Quy trinh ra mat",
    heroEyebrow: "Cong cu AI cho developer",
    proof: ["Nhanh", "De copy", "Khong can dang nhap"],
    inputPattern: "Kieu nhap",
    localFirst: "Local truoc",
    privateDefault: "Mac dinh rieng tu",
    launchFlowLabel: "Workflow ra mat",
    recommendedOrder: "Thu tu goi y",
    workflowTitle: "Tu audit repo den viec release",
    startWithAudit: "Bat dau bang audit",
    whatItDoes: "Cong cu lam gi",
    workflow: (shortTitle) => `workflow ${shortTitle}`,
    goodFor: "Phu hop voi",
    who: "Ai nen dung",
    examples: "Vi du",
    inputOutput: "Dau vao va dau ra",
    input: "Dau vao:",
    output: "Dau ra:",
    faqLimits: "FAQ va gioi han",
    beforeUse: "Truoc khi dung",
    usageLimits: "Gioi han su dung",
    helperLine: "Lam cho cong viec nhanh va de copy",
  },
  th: {
    navKicker: "ลำดับปล่อยงาน",
    heroEyebrow: "เครื่องมือ AI สำหรับนักพัฒนา",
    proof: ["เร็ว", "คัดลอกได้", "ไม่ต้องล็อกอิน"],
    inputPattern: "รูปแบบ input",
    localFirst: "เริ่มจาก local",
    privateDefault: "เป็นส่วนตัวโดยค่าเริ่มต้น",
    launchFlowLabel: "workflow ปล่อยงาน",
    recommendedOrder: "ลำดับที่แนะนำ",
    workflowTitle: "จาก audit repo ไปสู่ task release",
    startWithAudit: "เริ่มด้วย audit",
    whatItDoes: "ทำอะไรได้",
    workflow: (shortTitle) => `workflow ${shortTitle}`,
    goodFor: "เหมาะกับ",
    who: "ใครควรใช้",
    examples: "ตัวอย่าง",
    inputOutput: "Input และ output",
    input: "Input:",
    output: "Output:",
    faqLimits: "FAQ และข้อจำกัด",
    beforeUse: "ก่อนใช้",
    usageLimits: "ข้อจำกัดการใช้",
    helperLine: "ทำมาเพื่อคัดลอกและลงมือเร็ว",
  },
  tr: {
    navKicker: "Yayin akisi",
    heroEyebrow: "AI gelistirici araclari",
    proof: ["Hizli", "Kopyalanabilir", "Login yok"],
    inputPattern: "Girdi formati",
    localFirst: "Once local",
    privateDefault: "Varsayilan ozel",
    launchFlowLabel: "Yayin workflow",
    recommendedOrder: "Onerilen sira",
    workflowTitle: "Repo denetiminden release islerine",
    startWithAudit: "Denetimle basla",
    whatItDoes: "Ne yapar",
    workflow: (shortTitle) => `${shortTitle} workflow`,
    goodFor: "Kimler icin",
    who: "Kim kullanmali",
    examples: "Ornekler",
    inputOutput: "Girdi ve cikti",
    input: "Girdi:",
    output: "Cikti:",
    faqLimits: "FAQ ve sinirlar",
    beforeUse: "Kullanmadan once",
    usageLimits: "Kullanim sinirlari",
    helperLine: "Hizli kopyalanabilir is icin",
  },
  it: {
    navKicker: "Flusso lancio",
    heroEyebrow: "Strumenti AI per developer",
    proof: ["Veloce", "Copiabile", "Senza login"],
    inputPattern: "Schema input",
    localFirst: "Prima locale",
    privateDefault: "Privato di default",
    launchFlowLabel: "Workflow lancio",
    recommendedOrder: "Ordine consigliato",
    workflowTitle: "Da audit repo a task release",
    startWithAudit: "Inizia dall audit",
    whatItDoes: "Cosa fa",
    workflow: (shortTitle) => `workflow ${shortTitle}`,
    goodFor: "Ideale per",
    who: "Chi dovrebbe usarlo",
    examples: "Esempi",
    inputOutput: "Input e output",
    input: "Input:",
    output: "Output:",
    faqLimits: "FAQ e limiti",
    beforeUse: "Prima di usarlo",
    usageLimits: "Limiti d uso",
    helperLine: "Pensato per lavoro veloce e copiabile",
  },
  nl: {
    navKicker: "Launch flow",
    heroEyebrow: "AI developer tools",
    proof: ["Snel", "Kopieerbaar", "Geen login"],
    inputPattern: "Input patroon",
    localFirst: "Lokaal eerst",
    privateDefault: "Prive standaard",
    launchFlowLabel: "Launch workflow",
    recommendedOrder: "Aanbevolen volgorde",
    workflowTitle: "Van repo audit naar release taken",
    startWithAudit: "Start met audit",
    whatItDoes: "Wat het doet",
    workflow: (shortTitle) => `${shortTitle} workflow`,
    goodFor: "Goed voor",
    who: "Wie moet dit gebruiken",
    examples: "Voorbeelden",
    inputOutput: "Input en output",
    input: "Input:",
    output: "Output:",
    faqLimits: "FAQ en grenzen",
    beforeUse: "Voor gebruik",
    usageLimits: "Gebruikslimieten",
    helperLine: "Gebouwd voor snel kopieerbaar werk",
  },
  pl: {
    navKicker: "Proces publikacji",
    heroEyebrow: "AI narzędzia dla developerow",
    proof: ["Szybko", "Do skopiowania", "Bez logowania"],
    inputPattern: "Format wejscia",
    localFirst: "Najpierw lokalnie",
    privateDefault: "Domyslnie prywatnie",
    launchFlowLabel: "Workflow publikacji",
    recommendedOrder: "Zalecana kolejnosc",
    workflowTitle: "Od audytu repo do zadan release",
    startWithAudit: "Zacznij od audytu",
    whatItDoes: "Co robi",
    workflow: (shortTitle) => `workflow ${shortTitle}`,
    goodFor: "Dobre dla",
    who: "Kto powinien uzywac",
    examples: "Przyklady",
    inputOutput: "Wejscie i wyjscie",
    input: "Wejscie:",
    output: "Wyjscie:",
    faqLimits: "FAQ i ograniczenia",
    beforeUse: "Przed uzyciem",
    usageLimits: "Ograniczenia uzycia",
    helperLine: "Stworzone do szybkiej kopiowalnej pracy",
  },
};

function getWorkbenchCopy(language: InterfaceLanguage) {
  return workbenchCopy[language]?.navKicker ? workbenchCopy[language] : workbenchCopy.en;
}

const auditTranslations: Partial<Record<InterfaceLanguage, Partial<ToolDefinition>>> = {
  zh: {
    title: "GitHub 项目体检",
    shortTitle: "体检",
    description: "把公开 GitHub 仓库变成规则优先的上线体检报告",
    promise: "确定性检查 评分 阻塞项 Issue 草稿 发布清单 README 环境变量 CI 部署 安全",
    inputHint: "粘贴公开仓库地址，例如 https://github.com/vercel/next.js",
    useCases: ["上线前体检", "准备公开发布", "项目交接"],
    whatItDoes: ["读取公开仓库信息和根目录配置文件", "先用确定性规则检查，再做报告整理", "把上线阻塞项和优化项分开", "生成 GitHub Issue 草稿和发布检查清单"],
    audience: ["开源项目维护者", "准备上线的独立开发者", "接手陌生仓库的程序员"],
    outputExample: "规则优先的上线评分、阻塞项、GitHub Issue 草稿、README、环境变量、CI、部署、安全和发布清单",
    limitations: ["仅支持公开仓库", "不会执行代码或深度分析源码", "核心检查不依赖强 AI", "私有仓库需要先做授权和审计控制"],
    faq: [
      { question: "需要 GitHub token 吗", answer: "不需要。第一版只读取公开仓库信息和公开配置文件。" },
      { question: "AI 不强可以用吗", answer: "可以。核心是确定性规则检查：README、环境变量、CI、部署、安全和发布清单。AI 只负责把报告整理得更好读。" },
      { question: "为什么不直接让 AI 看代码", answer: "这里专门处理上线前最耗时间的杂事：README、环境变量、临时文件、CI、部署、安全提示和 PR 清单。" },
    ],
  },
  ja: {
    title: "GitHub リリース監査",
    shortTitle: "監査",
    description: "公開 GitHub リポジトリをリリース準備レポートに変換します",
    promise: "ルール検査 スコア ブロッカー Issue 下書き README 環境変数 CI デプロイ セキュリティ",
    inputHint: "公開リポジトリ URL を貼り付けます 例 https://github.com/vercel/next.js",
    useCases: ["公開前の確認", "リリース準備", "リポジトリ引き継ぎ"],
    whatItDoes: ["公開メタデータとルート設定ファイルを読む", "AI 風の文章より先に決定的ルールで確認する", "リリース阻害要因と磨き込みを分ける", "GitHub Issue 下書きとリリースチェックリストを作る"],
    audience: ["OSS メンテナー", "公開前の個人開発者", "知らないリポジトリに参加する開発者"],
    outputExample: "リリーススコア ブロッカー Issue 下書き README env CI デプロイ セキュリティ チェックリスト",
    limitations: ["公開リポジトリのみ", "コード実行や深いソース解析はしません", "中心機能は強い AI に依存しません", "プライベートリポジトリは認可と監査制御が必要です"],
    faq: [
      { question: "GitHub token は必要ですか", answer: "不要です。初版は公開リポジトリ情報と公開設定ファイルだけを読みます。" },
      { question: "強い AI がなくても使えますか", answer: "使えます。中心は README env CI デプロイ セキュリティ リリース手順のルール検査です。" },
      { question: "AI にコードを読ませるだけと何が違いますか", answer: "README 不備 env 一時ファイル CI デプロイ セキュリティ PR チェックなど公開前の面倒な作業に絞っています。" },
    ],
  },
  ko: {
    title: "GitHub 출시 점검",
    shortTitle: "점검",
    description: "공개 GitHub 저장소를 규칙 우선 출시 준비 보고서로 바꿉니다",
    promise: "규칙 검사 점수 차단 항목 Issue 초안 README 환경변수 CI 배포 보안",
    inputHint: "공개 저장소 URL을 붙여 넣으세요 예 https://github.com/vercel/next.js",
    useCases: ["출시 전 점검", "공개 릴리스 준비", "저장소 인수인계"],
    whatItDoes: ["공개 저장소 메타데이터와 루트 설정 파일을 읽습니다", "AI 문장보다 먼저 결정적 규칙으로 확인합니다", "출시 차단 항목과 개선 항목을 분리합니다", "GitHub Issue 초안과 출시 체크리스트를 만듭니다"],
    audience: ["오픈소스 메인테이너", "출시 준비 중인 개인 개발자", "낯선 저장소에 합류한 개발자"],
    outputExample: "출시 점수 차단 항목 GitHub Issue 초안 README env CI 배포 보안 출시 체크리스트",
    limitations: ["공개 저장소만 지원", "코드를 실행하거나 깊게 분석하지 않습니다", "핵심 검사는 강한 AI에 의존하지 않습니다", "비공개 저장소는 권한과 감사 제어가 먼저 필요합니다"],
    faq: [
      { question: "GitHub token 이 필요한가요", answer: "필요 없습니다. 첫 버전은 공개 저장소 정보와 공개 설정 파일만 읽습니다." },
      { question: "AI 가 약해도 쓸 수 있나요", answer: "가능합니다. 핵심은 README 환경변수 CI 배포 보안 출시 체크리스트의 규칙 기반 검사입니다." },
      { question: "AI 에게 코드를 읽히는 것과 다른 점은요", answer: "README env 임시 파일 CI 배포 보안 PR 체크리스트처럼 출시 전에 시간을 잡아먹는 일을 처리합니다." },
    ],
  },
  es: {
    title: "Audit de lanzamiento GitHub",
    shortTitle: "Audit",
    description: "Convierte un repo público de GitHub en un reporte de preparación para lanzar",
    promise: "Reglas score bloqueos issues README env CI deploy seguridad checklist",
    inputHint: "Pega una URL pública de repo por ejemplo https://github.com/vercel/next.js",
    useCases: ["Auditar antes de lanzar", "Preparar release público", "Entregar un repo"],
    whatItDoes: ["Lee metadata pública y archivos raíz de configuración", "Usa reglas deterministas antes de redactar", "Separa bloqueos de lanzamiento de mejoras", "Crea borradores de GitHub Issues y checklist de release"],
    audience: ["Mantenedores open source", "Indie builders antes del release", "Devs entrando a un repo desconocido"],
    outputExample: "Score de lanzamiento bloqueos issues README env CI deploy seguridad y checklist de release",
    limitations: ["Solo repos públicos", "No ejecuta ni analiza a fondo el código fuente", "El núcleo no depende de un AI fuerte", "Repos privados necesitan auth y controles de auditoría"],
    faq: [
      { question: "Necesita GitHub token", answer: "No. La primera versión solo lee metadata pública y archivos públicos seleccionados." },
      { question: "Funciona si el AI no es fuerte", answer: "Sí. El producto central es de reglas: README env CI deploy seguridad y release checklist." },
      { question: "Por qué no pedirle a AI que lea código", answer: "Esto ataca tareas lentas sin buen reemplazo: README env archivos temporales CI deploy seguridad y PR checklist." },
    ],
  },
  ar: {
    title: "فحص إطلاق GitHub",
    shortTitle: "فحص",
    description: "حوّل مستودع GitHub عاما إلى تقرير جاهزية للإطلاق يعتمد على القواعد",
    promise: "قواعد درجة عوائق Issues README env CI نشر أمان قائمة إطلاق",
    inputHint: "الصق رابط مستودع عام مثل https://github.com/vercel/next.js",
    useCases: ["فحص قبل الإطلاق", "تحضير إصدار عام", "تسليم مستودع"],
    whatItDoes: ["يقرأ بيانات المستودع العامة وملفات الإعداد الجذرية", "يفحص بقواعد حتمية قبل أي صياغة", "يفصل عوائق الإطلاق عن التحسينات", "ينشئ مسودات GitHub Issues وقائمة إطلاق"],
    audience: ["مشرفو المشاريع المفتوحة", "مطورو المنتجات قبل الإطلاق", "مطورو يدخلون مستودعا غير مألوف"],
    outputExample: "درجة الإطلاق العوائق مسودات Issues README env CI نشر أمان وقائمة إطلاق",
    limitations: ["يدعم المستودعات العامة فقط", "لا يشغل الكود ولا يحلل المصدر بعمق", "الفحص الأساسي لا يعتمد على AI قوي", "المستودعات الخاصة تحتاج صلاحيات وضوابط تدقيق"],
    faq: [
      { question: "هل يحتاج GitHub token", answer: "لا. النسخة الأولى تقرأ بيانات عامة وملفات عامة مختارة فقط." },
      { question: "هل يعمل إذا كان AI ضعيفا", answer: "نعم. القلب هو فحص قواعد README و env و CI والنشر والأمان وقائمة الإطلاق." },
      { question: "ما الفرق عن جعل AI يقرأ الكود", answer: "هذه الأداة تركز على أعمال الإطلاق المملة: README و env والملفات المؤقتة و CI والنشر والأمان وقائمة PR." },
    ],
  },
  de: {
    title: "GitHub Launch Audit",
    shortTitle: "Audit",
    description: "Macht aus einem oeffentlichen GitHub Repo einen regelbasierten Launch Readiness Bericht",
    promise: "Regeln Score Blocker Issues README env CI Deploy Sicherheit Release Checkliste",
    inputHint: "Oeffentliche Repo URL einfuegen zum Beispiel https://github.com/vercel/next.js",
    useCases: ["Vor dem Launch pruefen", "Oeffentliches Release vorbereiten", "Repo Uebergabe"],
    whatItDoes: ["Liest oeffentliche Repo Daten und Root Config Dateien", "Prueft zuerst mit deterministischen Regeln", "Trennt Launch Blocker von Feinschliff", "Erzeugt GitHub Issue Entwuerfe und Release Checklisten"],
    audience: ["Open Source Maintainer", "Indie Entwickler vor Release", "Entwickler in fremden Repos"],
    outputExample: "Launch Score Blocker GitHub Issues README env CI Deploy Sicherheit und Release Checkliste",
    limitations: ["Nur oeffentliche Repos", "Fuehrt keinen Code aus und analysiert Source nicht tief", "Der Kern haengt nicht von starkem AI ab", "Private Repos brauchen Auth und Audit Kontrolle"],
    faq: [
      { question: "Braucht es einen GitHub token", answer: "Nein. Die erste Version liest nur oeffentliche Repo Daten und ausgewaehlte oeffentliche Dateien." },
      { question: "Funktioniert es ohne starkes AI", answer: "Ja. Der Kern sind Regeln fuer README env CI Deploy Sicherheit und Release Checkliste." },
      { question: "Warum nicht einfach AI den Code lesen lassen", answer: "Dieses Tool bearbeitet die langsamen Launch Aufgaben: README env temporaere Dateien CI Deploy Sicherheit und PR Checkliste." },
    ],
  },
  pt: {
    title: "Auditoria de lançamento GitHub",
    shortTitle: "Auditoria",
    description: "Transforma um repo publico do GitHub em um relatorio de prontidao baseado em regras",
    promise: "Regras score bloqueios issues README env CI deploy seguranca checklist",
    inputHint: "Cole uma URL publica de repo por exemplo https://github.com/vercel/next.js",
    useCases: ["Auditar antes de lancar", "Preparar release publico", "Entregar um repo"],
    whatItDoes: ["Le metadados publicos e arquivos de configuracao raiz", "Usa regras deterministicas antes de redigir", "Separa bloqueios de lancamento de melhorias", "Cria rascunhos de GitHub Issues e checklist de release"],
    audience: ["Mantenedores open source", "Indie builders antes do release", "Devs entrando em repo desconhecido"],
    outputExample: "Score de lancamento bloqueios issues README env CI deploy seguranca e checklist",
    limitations: ["Somente repos publicos", "Nao executa codigo nem faz analise profunda de fonte", "O nucleo nao depende de AI forte", "Repos privados precisam de auth e controles de auditoria"],
    faq: [
      { question: "Precisa de GitHub token", answer: "Nao. A primeira versao le apenas metadados publicos e arquivos publicos selecionados." },
      { question: "Funciona se o AI nao for forte", answer: "Sim. O produto central e de regras: README env CI deploy seguranca e checklist de release." },
      { question: "Por que nao pedir ao AI para ler codigo", answer: "Isto resolve tarefas lentas sem bom substituto: README env arquivos temporarios CI deploy seguranca e checklist de PR." },
    ],
  },
  ru: {
    title: "GitHub аудит запуска",
    shortTitle: "Аудит",
    description: "Превращает публичный GitHub repo в отчет готовности к запуску по правилам",
    promise: "Правила оценка блокеры issues README env CI деплой безопасность checklist",
    inputHint: "Вставьте публичный URL repo например https://github.com/vercel/next.js",
    useCases: ["Проверка перед запуском", "Подготовка публичного релиза", "Передача repo"],
    whatItDoes: ["Читает публичные metadata и корневые config файлы", "Сначала проверяет детерминированными правилами", "Отделяет blockers от polish задач", "Создает черновики GitHub Issues и release checklist"],
    audience: ["Open source maintainers", "Indie developers перед release", "Разработчики в незнакомом repo"],
    outputExample: "Launch score blockers GitHub Issues README env CI deploy security release checklist",
    limitations: ["Только публичные repos", "Не запускает код и не делает глубокий source analysis", "Основная проверка не зависит от сильного AI", "Private repos требуют auth и audit controls"],
    faq: [
      { question: "Нужен GitHub token", answer: "Нет. Первая версия читает только публичные repo данные и выбранные публичные файлы." },
      { question: "Работает если AI слабый", answer: "Да. Основа это правила для README env CI deploy security и release checklist." },
      { question: "Почему не дать AI просто читать код", answer: "Инструмент закрывает медленные launch задачи: README env temporary files CI deploy security и PR checklist." },
    ],
  },
  hi: {
    title: "GitHub लॉन्च ऑडिट",
    shortTitle: "ऑडिट",
    description: "Public GitHub repo को rules first launch readiness report में बदलता है",
    promise: "Rules score blockers issues README env CI deploy security release checklist",
    inputHint: "Public repo URL पेस्ट करें जैसे https://github.com/vercel/next.js",
    useCases: ["Launch से पहले जांच", "Public release तैयारी", "Repo handoff"],
    whatItDoes: ["Public repo metadata और root config files पढ़ता है", "AI writing से पहले deterministic rules चलाता है", "Launch blockers और polish tasks अलग करता है", "GitHub Issue drafts और release checklist बनाता है"],
    audience: ["Open source maintainers", "Release से पहले indie developers", "Unknown repo में आए programmers"],
    outputExample: "Launch score blockers GitHub Issues README env CI deploy security और release checklist",
    limitations: ["सिर्फ public repos", "Code run नहीं करता और source deep analysis नहीं करता", "Core check strong AI पर निर्भर नहीं", "Private repos के लिए auth और audit controls चाहिए"],
    faq: [
      { question: "GitHub token चाहिए", answer: "नहीं। पहली version सिर्फ public repo data और selected public files पढ़ती है." },
      { question: "AI कमजोर हो तो चलेगा", answer: "हां। Core काम rules based है: README env CI deploy security और release checklist." },
      { question: "AI से code पढ़वाने से अलग क्या है", answer: "यह launch से पहले के time consuming काम संभालता है: README env temporary files CI deploy security और PR checklist." },
    ],
  },
  id: {
    title: "Audit rilis GitHub",
    shortTitle: "Audit",
    description: "Mengubah repo GitHub publik menjadi laporan kesiapan rilis berbasis aturan",
    promise: "Aturan skor blocker issues README env CI deploy keamanan checklist rilis",
    inputHint: "Tempel URL repo publik seperti https://github.com/vercel/next.js",
    useCases: ["Audit sebelum rilis", "Menyiapkan release publik", "Handoff repo"],
    whatItDoes: ["Membaca metadata publik dan file konfigurasi root", "Memeriksa dengan aturan deterministik terlebih dulu", "Memisahkan blocker rilis dari polish", "Membuat draft GitHub Issues dan checklist rilis"],
    audience: ["Maintainer open source", "Indie developer sebelum release", "Developer yang masuk repo asing"],
    outputExample: "Skor rilis blocker GitHub Issues README env CI deploy keamanan dan checklist rilis",
    limitations: ["Hanya repo publik", "Tidak menjalankan kode atau analisis source mendalam", "Pemeriksaan inti tidak bergantung AI kuat", "Repo privat butuh auth dan kontrol audit"],
    faq: [
      { question: "Perlu GitHub token", answer: "Tidak. Versi pertama hanya membaca data repo publik dan file publik terpilih." },
      { question: "Bisa jika AI tidak kuat", answer: "Bisa. Intinya adalah aturan untuk README env CI deploy keamanan dan checklist rilis." },
      { question: "Mengapa bukan menyuruh AI membaca kode", answer: "Ini fokus pada pekerjaan rilis yang memakan waktu: README env file sementara CI deploy keamanan dan PR checklist." },
    ],
  },
  vi: {
    title: "Kiem tra ra mat GitHub",
    shortTitle: "Kiem tra",
    description: "Bien repo GitHub cong khai thanh bao cao san sang ra mat dua tren quy tac",
    promise: "Quy tac diem blocker issues README env CI deploy bao mat checklist",
    inputHint: "Dan URL repo cong khai vi du https://github.com/vercel/next.js",
    useCases: ["Kiem tra truoc khi ra mat", "Chuan bi release cong khai", "Ban giao repo"],
    whatItDoes: ["Doc metadata cong khai va file cau hinh goc", "Chay quy tac xac dinh truoc khi viet bao cao", "Tach blocker ra mat va viec polish", "Tao GitHub Issue draft va checklist release"],
    audience: ["Maintainer open source", "Indie developer truoc release", "Developer vao repo la"],
    outputExample: "Diem ra mat blocker GitHub Issues README env CI deploy bao mat va checklist release",
    limitations: ["Chi ho tro repo cong khai", "Khong chay code hoac phan tich source sau", "Core check khong phu thuoc AI manh", "Repo rieng can auth va audit controls"],
    faq: [
      { question: "Can GitHub token khong", answer: "Khong. Ban dau chi doc repo data cong khai va mot so file cong khai." },
      { question: "AI khong manh co dung duoc khong", answer: "Co. Cot loi la rule check cho README env CI deploy bao mat va checklist release." },
      { question: "Khac gi voi bao AI doc code", answer: "No tap trung vao viec mat thoi gian truoc release: README env temporary files CI deploy security va PR checklist." },
    ],
  },
  th: {
    title: "ตรวจความพร้อม GitHub ก่อนปล่อย",
    shortTitle: "ตรวจ",
    description: "เปลี่ยน repo GitHub สาธารณะเป็นรายงานความพร้อมปล่อยงานแบบอิงกฎ",
    promise: "กฎ คะแนน blocker issues README env CI deploy security release checklist",
    inputHint: "วาง URL repo สาธารณะ เช่น https://github.com/vercel/next.js",
    useCases: ["ตรวจก่อนปล่อย", "เตรียม release สาธารณะ", "ส่งต่องาน repo"],
    whatItDoes: ["อ่าน metadata สาธารณะและ root config files", "ตรวจด้วยกฎก่อนเขียนรายงาน", "แยก blocker กับงาน polish", "สร้าง GitHub Issue draft และ release checklist"],
    audience: ["ผู้ดูแล open source", "indie developer ก่อน release", "developer ที่เข้ามาใน repo ใหม่"],
    outputExample: "คะแนน release blocker GitHub Issues README env CI deploy security และ release checklist",
    limitations: ["รองรับเฉพาะ repo สาธารณะ", "ไม่รัน code และไม่วิเคราะห์ source ลึก", "core check ไม่พึ่ง AI แรง", "repo ส่วนตัวต้องมี auth และ audit controls"],
    faq: [
      { question: "ต้องใช้ GitHub token ไหม", answer: "ไม่ต้อง เวอร์ชันแรกอ่านเฉพาะข้อมูล public repo และไฟล์สาธารณะที่เลือกไว้" },
      { question: "AI ไม่แรงใช้ได้ไหม", answer: "ได้ เพราะหัวใจคือ rule check สำหรับ README env CI deploy security และ release checklist" },
      { question: "ต่างจากให้ AI อ่าน code อย่างไร", answer: "เครื่องมือนี้เน้นงานก่อนปล่อยที่เสียเวลา เช่น README env temporary files CI deploy security และ PR checklist" },
    ],
  },
  tr: {
    title: "GitHub yayin denetimi",
    shortTitle: "Denetim",
    description: "Public GitHub repo yu kurallara dayali launch readiness raporuna cevirir",
    promise: "Kurallar skor engeller issues README env CI deploy guvenlik checklist",
    inputHint: "Public repo URL yapistir ornek https://github.com/vercel/next.js",
    useCases: ["Yayindan once denetim", "Public release hazirligi", "Repo handoff"],
    whatItDoes: ["Public repo metadata ve root config dosyalarini okur", "Once deterministik kurallarla kontrol eder", "Launch engellerini polish islerinden ayirir", "GitHub Issue taslaklari ve release checklist uretir"],
    audience: ["Open source maintainers", "Release oncesi indie developer", "Bilinmeyen repo ya giren developer"],
    outputExample: "Launch score blockers GitHub Issues README env CI deploy security ve release checklist",
    limitations: ["Sadece public repos", "Code calistirmaz ve source u derin analiz etmez", "Core check guclu AI a bagli degil", "Private repos auth ve audit control ister"],
    faq: [
      { question: "GitHub token gerekir mi", answer: "Hayir. Ilk surum yalniz public repo bilgisi ve secili public dosyalari okur." },
      { question: "AI guclu degilse calisir mi", answer: "Evet. Ana is README env CI deploy security ve release checklist icin rule check." },
      { question: "AI a kod okutmak yerine neden bu", answer: "Bu arac launch oncesi zaman alan islere odaklanir: README env temporary files CI deploy security ve PR checklist." },
    ],
  },
  it: {
    title: "Audit lancio GitHub",
    shortTitle: "Audit",
    description: "Trasforma un repo GitHub pubblico in un report di prontezza lancio basato su regole",
    promise: "Regole punteggio blocchi issues README env CI deploy sicurezza checklist",
    inputHint: "Incolla URL repo pubblico per esempio https://github.com/vercel/next.js",
    useCases: ["Audit prima del lancio", "Preparare release pubblico", "Passaggio repo"],
    whatItDoes: ["Legge metadata pubblici e file config root", "Controlla con regole deterministiche prima della scrittura", "Separa blocchi di lancio da polish", "Crea bozze GitHub Issues e checklist release"],
    audience: ["Maintainer open source", "Indie developer prima del release", "Developer che entrano in repo sconosciuti"],
    outputExample: "Score lancio blocchi GitHub Issues README env CI deploy sicurezza e checklist release",
    limitations: ["Solo repo pubblici", "Non esegue codice e non fa analisi source profonda", "Il core non dipende da AI forte", "Repo privati richiedono auth e controlli audit"],
    faq: [
      { question: "Serve GitHub token", answer: "No. La prima versione legge solo dati pubblici del repo e file pubblici selezionati." },
      { question: "Funziona se AI non e forte", answer: "Si. Il core e rule check per README env CI deploy sicurezza e checklist release." },
      { question: "Perche non far leggere codice ad AI", answer: "Questo risolve lavori lenti prima del lancio: README env temporary files CI deploy security e PR checklist." },
    ],
  },
  nl: {
    title: "GitHub launch audit",
    shortTitle: "Audit",
    description: "Maakt van een publieke GitHub repo een rule first launch readiness rapport",
    promise: "Regels score blockers issues README env CI deploy security release checklist",
    inputHint: "Plak een publieke repo URL bijvoorbeeld https://github.com/vercel/next.js",
    useCases: ["Audit voor launch", "Publieke release voorbereiden", "Repo overdracht"],
    whatItDoes: ["Leest publieke repo metadata en root config files", "Controleert eerst met deterministische regels", "Splitst launch blockers van polish", "Maakt GitHub Issue drafts en release checklist"],
    audience: ["Open source maintainers", "Indie developers voor release", "Developers in een onbekende repo"],
    outputExample: "Launch score blockers GitHub Issues README env CI deploy security en release checklist",
    limitations: ["Alleen publieke repos", "Voert geen code uit en doet geen diepe source analyse", "Core check hangt niet af van sterke AI", "Private repos vereisen auth en audit controls"],
    faq: [
      { question: "Is GitHub token nodig", answer: "Nee. De eerste versie leest alleen publieke repo data en geselecteerde publieke files." },
      { question: "Werkt dit als AI niet sterk is", answer: "Ja. De kern is rule check voor README env CI deploy security en release checklist." },
      { question: "Waarom niet AI de code laten lezen", answer: "Dit richt zich op trage launch taken: README env tijdelijke files CI deploy security en PR checklist." },
    ],
  },
  pl: {
    title: "GitHub audyt publikacji",
    shortTitle: "Audyt",
    description: "Zmienia publiczne GitHub repo w raport gotowosci publikacji oparty na regułach",
    promise: "Reguly wynik blokery issues README env CI deploy bezpieczenstwo checklist",
    inputHint: "Wklej publiczny URL repo np https://github.com/vercel/next.js",
    useCases: ["Audyt przed publikacja", "Przygotowanie publicznego release", "Przekazanie repo"],
    whatItDoes: ["Czyta publiczne metadata repo i root config files", "Najpierw sprawdza deterministycznymi regulami", "Oddziela launch blockers od polish", "Tworzy GitHub Issue drafts i release checklist"],
    audience: ["Open source maintainers", "Indie developers przed release", "Developerzy w nieznanym repo"],
    outputExample: "Launch score blockers GitHub Issues README env CI deploy security i release checklist",
    limitations: ["Tylko publiczne repos", "Nie uruchamia kodu i nie robi glebokiej analizy source", "Core check nie zalezy od silnego AI", "Private repos wymagaja auth i audit controls"],
    faq: [
      { question: "Czy potrzeba GitHub token", answer: "Nie. Pierwsza wersja czyta tylko publiczne dane repo i wybrane publiczne pliki." },
      { question: "Czy dziala gdy AI nie jest mocne", answer: "Tak. Rdzen to rule check dla README env CI deploy security i release checklist." },
      { question: "Czemu nie dac AI czytac kodu", answer: "To narzedzie skupia sie na powolnych zadaniach przed publikacja: README env temporary files CI deploy security i PR checklist." },
    ],
  },
};

function detectLanguage(code: string) {
  const source = code.trim();
  if (!source) return "Unknown";
  if (/#include|std::|cout|cin|int\s+main/.test(source)) return "C++";
  if (/def\s+\w+\(|import\s+\w+|print\(|self\./.test(source)) return "Python";
  if (/SELECT|INSERT|UPDATE|DELETE|FROM\s+\w+/i.test(source)) return "SQL";
  if (/<[a-z][\s\S]*>/i.test(source)) return "HTML";
  if (/function\s+\w+|const\s+\w+|let\s+\w+|=>|await\s+|React|useState/.test(source)) return "JavaScript TypeScript";
  return "General code";
}

function extractVariables(code: string) {
  const matches = [
    ...code.matchAll(/\b(?:const|let|var)\s+([A-Za-z_$][\w$]*)/g),
    ...code.matchAll(/\bfunction\s+([A-Za-z_$][\w$]*)/g),
    ...code.matchAll(/\bclass\s+([A-Za-z_$][\w$]*)/g),
    ...code.matchAll(/\bdef\s+([A-Za-z_]\w*)/g),
    ...code.matchAll(/\b(?:int|long|double|float|string|auto|bool)\s+([A-Za-z_]\w*)/g),
  ];
  return Array.from(new Set(matches.map((match) => match[1]))).slice(0, 10);
}

function lines(text: string) {
  return text.trim() ? text.trim().split(/\r?\n/).length : 0;
}

function normalizeJson(value: string) {
  try {
    const parsed = JSON.parse(value);
    return {
      ok: true,
      pretty: JSON.stringify(parsed, null, 2),
      minified: JSON.stringify(parsed),
      message: "Valid JSON",
    };
  } catch (error) {
    return {
      ok: false,
      pretty: "",
      minified: "",
      message: error instanceof Error ? error.message : "Invalid JSON",
    };
  }
}

function parseHeaders(input: string) {
  const headers: Record<string, string> = {};
  for (const line of input.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const colonIndex = trimmed.indexOf(":");
    if (colonIndex === -1) continue;
    const key = trimmed.slice(0, colonIndex).trim();
    const value = trimmed.slice(colonIndex + 1).trim();
    if (key) headers[key] = value;
  }
  return headers;
}

function stringifyHeaders(headers: Record<string, string>, indent = 2) {
  const entries = Object.entries(headers);
  if (entries.length === 0) return "{}";
  const space = " ".repeat(indent);
  return `{\n${entries.map(([key, value]) => `${space}"${key}": "${value.replace(/"/g, '\\"')}"`).join(",\n")}\n}`;
}

function safeJsonBody(raw: string) {
  if (!raw.trim()) return "";
  try {
    return JSON.stringify(JSON.parse(raw), null, 2);
  } catch {
    return raw.trim();
  }
}

function toolHref(slug: ToolSlug, language: InterfaceLanguage) {
  return localizedHref(`/tools/${slug}`, language);
}

function toolDisplay(tool: ToolDefinition, language: InterfaceLanguage) {
  if (tool.slug === "github-repo-analyzer") {
    return { ...tool, ...auditTranslations[language], inputExample: tool.inputExample };
  }

  if (language !== "zh") return tool;
  const shortTitles: Partial<Record<ToolSlug, string>> = {
    "prompt-optimizer": "提示词",
    "code-explainer": "代码笔记",
    "bug-finder": "Bug",
    "api-request-generator": "API",
    "dev-utilities": "工具",
    "learning-roadmap": "路线",
  };

  return {
    ...tool,
    shortTitle: shortTitles[tool.slug] || tool.shortTitle,
  };
}

export default function ToolWorkbench({
  initialSlug = "prompt-optimizer",
  initialLanguage = "en",
  initialRepoUrl,
}: {
  initialSlug?: ToolSlug;
  initialLanguage?: InterfaceLanguage;
  initialRepoUrl?: string;
}) {
  const pathname = usePathname();
  const language = initialLanguage;
  const t = getWorkbenchCopy(language);
  const active = useMemo<ToolSlug>(() => {
    const routeTool = toolDefinitions.find((tool) => pathname?.endsWith(`/tools/${tool.slug}`));
    return routeTool?.slug || initialSlug;
  }, [initialSlug, pathname]);

  const activeTool = toolDefinitions.find((tool) => tool.slug === active) || toolDefinitions[0];
  const activeToolDisplay = toolDisplay(activeTool, language);

  useEffect(() => {
    recordLocalActivity({
      id: `tool:${active}`,
      title: activeToolDisplay.title,
      href: toolHref(active, language),
      kind: "tool",
    });
  }, [active, activeToolDisplay.title, language]);

  return (
    <main className="apple-page">
      <div className="tool-shell">
        <aside className="tool-rail dense-panel">
          <Link href={localizedHref("/", language)} className="tool-brand">
            <span>JM</span>
            <strong>JinMing Lab</strong>
          </Link>
          <FlagLanguageToggle initialLanguage={language} />
          <nav className="tool-nav">
            <p className="tool-nav-kicker">{t.navKicker}</p>
            {toolDefinitions.map((tool) => {
              const display = toolDisplay(tool, language);
              return (
              <Link
                key={tool.slug}
                href={toolHref(tool.slug, language)}
                className={tool.slug === active ? "tool-nav-link tool-nav-link-active" : "tool-nav-link"}
              >
                <span>{tool.code}</span>
                <strong>{display.shortTitle}</strong>
              </Link>
              );
            })}
          </nav>
        </aside>

        <section className="min-w-0">
          <div className="dense-panel tool-hero">
            <div>
              <p className="eyebrow">{t.heroEyebrow}</p>
              <h1>{activeToolDisplay.title}</h1>
              <p>{activeToolDisplay.description}</p>
            </div>
            <div className="tool-proof-grid">
              {t.proof.map((item) => <span key={item}>{item}</span>)}
            </div>
          </div>

          <div className="tool-command-strip dense-panel">
            <div>
              <p className="eyebrow">{t.inputPattern}</p>
              <strong>{activeToolDisplay.inputHint}</strong>
            </div>
            <div className="tool-command-tags">
              <span>{activeToolDisplay.promise}</span>
              <span>{t.localFirst}</span>
              <span>{t.privateDefault}</span>
            </div>
          </div>

          {active === "github-repo-analyzer" && (
            <section className="tool-launch-flow dense-panel" aria-label={t.launchFlowLabel}>
              <div className="tool-launch-flow-head">
                <div>
                  <p className="eyebrow">{t.recommendedOrder}</p>
                  <h2>{t.workflowTitle}</h2>
                </div>
                <Link href={toolHref("github-repo-analyzer", language)}>{t.startWithAudit}</Link>
              </div>
              <div className="tool-launch-flow-grid">
                {launchWorkflow.map((item) => {
                  const copy = launchWorkflowCopy(item, language);
                  return (
                    <Link
                      key={item.tool}
                      href={toolHref(item.tool, language)}
                      className={item.tool === active ? "tool-launch-card tool-launch-card-active" : "tool-launch-card"}
                    >
                      <span>{item.step}</span>
                      <strong>{copy.title}</strong>
                      <p>{copy.body}</p>
                    </Link>
                  );
                })}
              </div>
            </section>
          )}

          <div className="mt-3">
            {active === "github-repo-analyzer" && <GitHubRepoAnalyzer language={language} initialRepoUrl={initialRepoUrl} />}
            {active === "prompt-optimizer" && <PromptOptimizer />}
            {active === "code-explainer" && <CodeExplainer />}
            {active === "bug-finder" && <BugFinder />}
            {active === "api-request-generator" && <ApiRequestGenerator />}
            {active === "dev-utilities" && <DevUtilities />}
            {active === "learning-roadmap" && <LearningRoadmap />}
          </div>

          <ToolSeoPanel tool={activeToolDisplay} language={language} />
        </section>
      </div>
    </main>
  );
}

const exampleWord: Record<InterfaceLanguage, string> = {
  en: "example",
  zh: "示例",
  ja: "例",
  ko: "예시",
  es: "ejemplo",
  fr: "exemple",
  de: "Beispiel",
  pt: "exemplo",
  ru: "пример",
  ar: "مثال",
  hi: "उदाहरण",
  id: "contoh",
  vi: "vi du",
  th: "ตัวอย่าง",
  tr: "ornek",
  it: "esempio",
  nl: "voorbeeld",
  pl: "przyklad",
};

function toolExamples(tool: ToolDefinition, language: InterfaceLanguage) {
  if (tool.slug === "prompt-optimizer") {
    return [
      {
        title: "Writing prompt optimization",
        input: "Write a product intro for a new AI tool.",
        output: "Audience, tone, structure, proof points, limits, and acceptance criteria before drafting.",
      },
      {
        title: "Code generation prompt optimization",
        input: "Build a settings page in Next.js.",
        output: "Route, components, state, validation, error states, styling constraints, and verification commands.",
      },
      {
        title: "Learning plan prompt optimization",
        input: "Help me learn Python in 30 days.",
        output: "Weekly goals, daily exercises, review checkpoints, final project, and measurable completion criteria.",
      },
    ];
  }

  return [
    {
      title: `${tool.shortTitle} ${exampleWord[language]}`,
      input: tool.inputExample,
      output: tool.outputExample,
    },
  ];
}

function ToolSeoPanel({ tool, language = "en" }: { tool: ToolDefinition; language?: InterfaceLanguage }) {
  const t = getWorkbenchCopy(language);
  const examples = toolExamples(tool, language);

  return (
    <section className="mt-3 grid gap-3 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
      <div className="dense-panel p-5">
        <p className="eyebrow">{t.whatItDoes}</p>
        <h2 className="mt-2 text-2xl font-semibold">{t.workflow(tool.shortTitle)}</h2>
        <div className="mt-4 grid gap-2">
          {tool.whatItDoes.map((item) => (
            <div key={item} className="dense-row">
              <span className="text-sm font-semibold">{item}</span>
              <span className="text-xs text-[color:var(--muted)]">{t.helperLine}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="dense-panel p-5">
        <p className="eyebrow">{t.goodFor}</p>
        <h2 className="mt-2 text-2xl font-semibold">{t.who}</h2>
        <div className="mt-4 grid gap-2 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
          {tool.audience.map((item) => (
            <div key={item} className="rounded-[8px] border border-slate-200 bg-white/70 p-3 text-sm font-semibold">
              {item}
            </div>
          ))}
        </div>
      </div>

      <div className="dense-panel p-5">
        <p className="eyebrow">{t.examples}</p>
        <h2 className="mt-2 text-2xl font-semibold">{t.inputOutput}</h2>
        <div className="mt-4 grid gap-3">
          {examples.map((example) => (
            <article key={example.title} className="rounded-[8px] border border-slate-200 bg-white/75 p-3">
              <p className="eyebrow">{example.title}</p>
              <p className="mt-2 text-sm leading-6 text-slate-800"><strong>{t.input}</strong> {example.input}</p>
              <p className="mt-2 text-sm leading-6 text-[color:var(--muted)]"><strong>{t.output}</strong> {example.output}</p>
            </article>
          ))}
        </div>
      </div>

      <div className="dense-panel p-5">
        <p className="eyebrow">{t.faqLimits}</p>
        <h2 className="mt-2 text-2xl font-semibold">{t.beforeUse}</h2>
        <div className="mt-4 grid gap-2">
          {tool.faq.map((item) => (
            <details key={item.question} className="rounded-[8px] border border-slate-200 bg-white/70 p-3">
              <summary className="cursor-pointer text-sm font-semibold">{item.question}</summary>
              <p className="mt-2 text-sm leading-6 text-[color:var(--muted)]">{item.answer}</p>
            </details>
          ))}
          <div className="rounded-[8px] border border-slate-200 bg-white/70 p-3">
            <p className="text-sm font-semibold">{t.usageLimits}</p>
            <ul className="mt-2 space-y-1 text-sm leading-6 text-[color:var(--muted)]">
              {tool.limitations.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

function PromptOptimizer() {
  const sampleGoal = "Build an AI tool website with six practical developer tools";
  const sampleContext = "Target users are beginners and indie developers. The page should be dense, useful and production ready.";
  const [goal, setGoal] = useState(sampleGoal);
  const [mode, setMode] = useState("coding");
  const [context, setContext] = useState(sampleContext);
  const [templateKey, setTemplateKey] = useState<PromptTemplateKey>("builder");

  const promptBlocks = useMemo<OutputBlock[]>(() => {
    const template = promptTemplates[templateKey];
    const role =
      template?.role ||
      (mode === "research"
        ? "You are a senior research analyst"
        : mode === "product"
          ? "You are a senior product manager and UX writer"
          : "You are a senior full stack engineer");
    const cleanGoal = goal.trim() || "Describe the goal here";
    const cleanContext = context.trim() || "Add audience product constraints current stack and examples here";

    return [
      { badge: "01", title: "Role", content: role },
      { badge: "02", title: "Goal", content: cleanGoal },
      { badge: "03", title: "Context", content: cleanContext },
      {
        badge: "04",
        title: "Tasks",
        content: template?.tasks || `1. Restate the objective in one sentence
2. Ask only the critical missing questions
3. Propose a practical implementation plan
4. Produce the final answer or code in a copy ready format
5. Call out risks edge cases and test steps`,
      },
      {
        badge: "05",
        title: "Output Format",
        content: `- Summary
- Assumptions
- Plan
- Deliverable
- Verification`,
      },
      {
        badge: "06",
        title: "Constraints",
        content: template?.constraints || `- Prefer simple maintainable choices
- Avoid vague advice
- Make the result usable immediately
- Include filenames commands or examples when relevant`,
      },
      {
        badge: "07",
        title: "Acceptance Criteria",
        content: template?.acceptance || `- The answer solves the actual user goal
- The next action is obvious
- The output can be pasted into a real workflow`,
      },
    ];
  }, [context, goal, mode, templateKey]);

  const output = useMemo(
    () => promptBlocks.map((block) => `${block.title}\n${block.content}`).join("\n\n"),
    [promptBlocks]
  );

  return (
    <ToolLayout
      output={output}
      outputTitle="Optimized prompt"
      blocks={promptBlocks}
      actions={
        <>
          <button type="button" className="dense-action" onClick={() => { setGoal(sampleGoal); setContext(sampleContext); setMode("coding"); }}>
            Load sample
          </button>
          <button type="button" className="dense-action" onClick={() => { setGoal(""); setContext(""); }}>
            Clear
          </button>
        </>
      }
    >
      <p className="eyebrow">Input</p>
      <h2>Rough request</h2>
      <textarea value={goal} onChange={(event) => setGoal(event.target.value)} className="tool-textarea" placeholder="Describe what you want AI to do" />
      <div className="tool-field-grid">
        <label>
          <span>Use case</span>
          <select value={mode} onChange={(event) => setMode(event.target.value)} className="tool-input">
            <option value="coding">Coding</option>
            <option value="research">Research</option>
            <option value="product">Product</option>
          </select>
        </label>
        <label>
          <span>Template</span>
          <select value={templateKey} onChange={(event) => setTemplateKey(event.target.value as PromptTemplateKey)} className="tool-input">
            {Object.entries(promptTemplates).map(([key, template]) => (
              <option key={key} value={key}>{template.label}</option>
            ))}
          </select>
        </label>
      </div>
      <label className="block">
        <span className="tool-label">Context</span>
        <textarea value={context} onChange={(event) => setContext(event.target.value)} className="tool-textarea tool-textarea-small" />
      </label>
    </ToolLayout>
  );
}

function CodeExplainer() {
  const [code, setCode] = useState(sampleCode);
  const explainBlocks = useMemo<OutputBlock[]>(() => {
    const language = detectLanguage(code);
    const variables = extractVariables(code);
    const risks = [
      code.includes("fetch(") && !code.includes("response.ok") ? "Network response is used without checking response.ok" : "",
      /JSON\.parse|\.json\(\)/.test(code) && !/try|catch/.test(code) ? "JSON parsing has no error handling path" : "",
      /\.\w+\.\w+/.test(code) ? "Nested property access may fail when an object is undefined" : "",
      /password|secret|token|apiKey/i.test(code) ? "Sensitive value appears in code and should be moved to environment variables" : "",
    ].filter(Boolean);

    const notes = [
      `Detected language ${language}`,
      `Approximate size ${lines(code)} lines`,
      variables.length ? `Key names ${variables.join(", ")}` : "No obvious variable declarations found",
    ];

    return [
      {
        badge: "01",
        title: "Code purpose",
        content: [
        language === "JavaScript TypeScript" && code.includes("fetch(")
          ? "This code performs an asynchronous HTTP request and returns data from the response"
          : "This code defines logic that should be read from input setup to output or return value",
        code.includes("return") ? "The final returned value is the main result of the function" : "Look for side effects such as printing mutation or network calls",
        ].map((item) => `- ${item}`).join("\n"),
      },
      {
        badge: "02",
        title: "Key variables and functions",
        content: (variables.length ? variables.map((item) => `${item} is a named value function or class used by the snippet`) : ["No named variables detected"]).map((item) => `- ${item}`).join("\n"),
      },
      {
        badge: "03",
        title: "Potential bugs",
        content: (risks.length ? risks : ["No obvious bug pattern found from static heuristics"]).map((item) => `- ${item}`).join("\n"),
      },
      {
        badge: "04",
        title: "Learning notes",
        content: notes.map((item) => `- ${item}`).join("\n"),
      },
    ];
  }, [code]);
  const output = useMemo(
    () => explainBlocks.map((block) => `${block.title}\n${block.content}`).join("\n\n"),
    [explainBlocks]
  );

  return (
    <ToolLayout
      output={output}
      outputTitle="Code explanation"
      blocks={explainBlocks}
      actions={
        <>
          <button type="button" className="dense-action" onClick={() => setCode(sampleCode)}>
            JS sample
          </button>
          <button type="button" className="dense-action" onClick={() => setCode(samplePython)}>
            Python sample
          </button>
          <button type="button" className="dense-action" onClick={() => setCode("")}>
            Clear
          </button>
        </>
      }
    >
      <p className="eyebrow">Input</p>
      <h2>Paste code</h2>
      <textarea value={code} onChange={(event) => setCode(event.target.value)} className="tool-textarea tool-code-input" spellCheck={false} />
    </ToolLayout>
  );
}

function BugFinder() {
  const [error, setError] = useState(sampleBug);
  const [code, setCode] = useState(sampleCode);
  const bugBlocks = useMemo<OutputBlock[]>(() => {
    const combined = `${error}\n${code}`;
    const causes = [
      /undefined|null|Cannot read/i.test(combined) ? "A value is undefined or null before property access" : "",
      /404/.test(combined) ? "The requested endpoint or route is missing" : "",
      /401|403/.test(combined) ? "Authentication permission or same origin policy is blocking the request" : "",
      /500|Prisma|database|SQL/i.test(combined) ? "Server side database or API logic may be failing" : "",
      /CORS|origin/i.test(combined) ? "Cross origin request policy is rejecting the browser request" : "",
      /module not found|Cannot find module/i.test(combined) ? "A dependency import path or package installation is missing" : "",
      /Type '.+' is not assignable|ts\(/i.test(combined) ? "TypeScript types do not match the value being passed" : "",
    ].filter(Boolean);
    const firstCause = causes[0] || "The error needs a smaller reproduction but the failure is probably near the first stack trace line";
    const severity = /401|403|password|secret|token|apiKey/i.test(combined)
      ? "High because auth or sensitive data may be involved"
      : /500|database|Prisma|SQL/i.test(combined)
        ? "Medium because server or data logic may be failing"
        : "Normal debugging risk";
    const repairTemplate = code.includes(".user.name")
      ? `const userName = data?.user?.name;
if (!userName) {
  throw new Error("User name is missing from API response");
}
return userName;`
      : /401|403/i.test(combined)
        ? `const response = await fetch(url, {
  headers: {
    Authorization: \`Bearer \${token}\`
  }
});

if (!response.ok) {
  throw new Error(\`Request failed \${response.status}\`);
}`
        : `if (!value) {
  throw new Error("Expected value is missing");
}

// Then continue with the normal logic`;

    return [
      { badge: "01", title: "Severity", content: severity },
      { badge: "02", title: "Most likely cause", content: firstCause },
      {
        badge: "03",
        title: "Debug steps",
        content: `1. Reproduce with the smallest input that still fails
2. Log the value immediately before the failing line
3. Check network status response body and server logs
4. Add guards for missing data before using nested fields
5. Write one regression test or manual checklist after fixing`,
      },
      { badge: "04", title: "Repair template", content: repairTemplate },
      {
        badge: "05",
        title: "What to verify",
        content: `- The same input no longer fails
- Missing data produces a clear error
- The fix does not hide a real server or auth issue`,
      },
    ];
  }, [code, error]);
  const output = useMemo(
    () => bugBlocks.map((block) => `${block.title}\n${block.content}`).join("\n\n"),
    [bugBlocks]
  );

  return (
    <ToolLayout
      output={output}
      outputTitle="Bug diagnosis"
      blocks={bugBlocks}
      actions={
        <>
          <button type="button" className="dense-action" onClick={() => { setError(sampleBug); setCode(sampleCode); }}>
            TypeError sample
          </button>
          <button type="button" className="dense-action" onClick={() => { setError(sampleApiBug); setCode(sampleApiBug); }}>
            API sample
          </button>
          <button type="button" className="dense-action" onClick={() => { setError(""); setCode(""); }}>
            Clear
          </button>
        </>
      }
    >
      <p className="eyebrow">Input</p>
      <h2>Error and code</h2>
      <label className="block">
        <span className="tool-label">Error message</span>
        <textarea value={error} onChange={(event) => setError(event.target.value)} className="tool-textarea tool-textarea-small" />
      </label>
      <label className="block">
        <span className="tool-label">Code snippet</span>
        <textarea value={code} onChange={(event) => setCode(event.target.value)} className="tool-textarea tool-code-input" spellCheck={false} />
      </label>
    </ToolLayout>
  );
}

function ApiRequestGenerator() {
  const [url, setUrl] = useState("https://api.example.com/v1/users");
  const [method, setMethod] = useState<ApiMethod>("POST");
  const [headers, setHeaders] = useState("Authorization: Bearer YOUR_TOKEN\nContent-Type: application/json");
  const [body, setBody] = useState('{"name":"JinMing Lab","role":"developer"}');
  const requestBlocks = useMemo<OutputBlock[]>(() => {
    const parsedHeaders = parseHeaders(headers);
    const prettyBody = safeJsonBody(body);
    const hasBody = !["GET", "DELETE"].includes(method) && prettyBody.length > 0;
    const headerFlags = Object.entries(parsedHeaders).map(([key, value]) => `  -H '${key}: ${value}'`).join(" \\\n");
    const curlBody = hasBody ? ` \\\n  -d '${prettyBody.replace(/'/g, "'\\''")}'` : "";
    const headersObject = stringifyHeaders(parsedHeaders, 4);
    const bodyLine = hasBody ? `,\n  body: JSON.stringify(${prettyBody})` : "";
    const axiosBody = hasBody ? `,\n  ${prettyBody}` : "";
    const pythonBody = hasBody ? `,\n    json=${prettyBody.replace(/\n/g, "\n    ")}` : "";

    return [
      {
        badge: "01",
        title: "curl",
        content: `curl -X ${method} '${url}'${headerFlags ? ` \\\n${headerFlags}` : ""}${curlBody}`,
      },
      {
        badge: "02",
        title: "fetch",
        content: `const response = await fetch("${url}", {
  method: "${method}",
  headers: ${headersObject}${bodyLine}
});
const data = await response.json();`,
      },
      {
        badge: "03",
        title: "axios",
        content: `const response = await axios.${method.toLowerCase()}("${url}"${axiosBody}, {
  headers: ${headersObject}
});`,
      },
      {
        badge: "04",
        title: "Python requests",
        content: `import requests

response = requests.${method.toLowerCase()}(
    "${url}",
    headers=${JSON.stringify(parsedHeaders, null, 4).replace(/\n/g, "\n    ")}${pythonBody}
)
print(response.status_code)
print(response.json())`,
      },
    ];
  }, [body, headers, method, url]);
  const output = useMemo(
    () => requestBlocks.map((block) => `${block.title}\n${block.content}`).join("\n\n"),
    [requestBlocks]
  );

  return (
    <ToolLayout
      output={output}
      outputTitle="Request snippets"
      blocks={requestBlocks}
      actions={
        <>
          <button type="button" className="dense-action" onClick={() => { setMethod("GET"); setUrl("https://api.example.com/v1/projects"); setHeaders("Authorization: Bearer YOUR_TOKEN"); setBody(""); }}>
            GET preset
          </button>
          <button type="button" className="dense-action" onClick={() => { setMethod("POST"); setUrl("https://api.example.com/v1/users"); setHeaders("Authorization: Bearer YOUR_TOKEN\nContent-Type: application/json"); setBody('{"name":"JinMing Lab","role":"developer"}'); }}>
            POST preset
          </button>
          <button type="button" className="dense-action" onClick={() => { setHeaders(""); setBody(""); }}>
            Clear body
          </button>
        </>
      }
    >
      <p className="eyebrow">Input</p>
      <h2>API details</h2>
      <div className="tool-field-grid">
        <label>
          <span>Method</span>
          <select value={method} onChange={(event) => setMethod(event.target.value as ApiMethod)} className="tool-input">
            {["GET", "POST", "PUT", "PATCH", "DELETE"].map((item) => <option key={item}>{item}</option>)}
          </select>
        </label>
        <label>
          <span>Endpoint</span>
          <input value={url} onChange={(event) => setUrl(event.target.value)} className="tool-input" />
        </label>
      </div>
      <label className="block">
        <span className="tool-label">Headers one per line</span>
        <textarea value={headers} onChange={(event) => setHeaders(event.target.value)} className="tool-textarea tool-textarea-small" />
      </label>
      <label className="block">
        <span className="tool-label">JSON body</span>
        <textarea value={body} onChange={(event) => setBody(event.target.value)} className="tool-textarea tool-textarea-small" spellCheck={false} />
      </label>
    </ToolLayout>
  );
}

function DevUtilities() {
  const [json, setJson] = useState('{"name":"JinMing Lab","tools":["json","regex","timestamp"],"ok":true}');
  const [pattern, setPattern] = useState("\\b[A-Z][A-Za-z]+\\b");
  const [flags, setFlags] = useState("g");
  const [regexText, setRegexText] = useState("JinMing Lab builds JSON Regex Timestamp Tools");
  const [timestamp, setTimestamp] = useState("1700000000000");

  const utilityBlocks = useMemo<OutputBlock[]>(() => {
    const jsonResult = normalizeJson(json);
    let regexResult = "";
    try {
      const normalizedFlags = flags.includes("g") ? flags : `${flags}g`;
      const regex = new RegExp(pattern, normalizedFlags);
      const matches = Array.from(regexText.matchAll(regex)).map((match) => match[0]);
      regexResult = matches.length ? matches.join("\n") : "No matches";
    } catch (error) {
      regexResult = error instanceof Error ? error.message : "Invalid regex";
    }

    const numeric = Number(timestamp.trim());
    const date = Number.isFinite(numeric)
      ? new Date(String(Math.trunc(numeric)).length === 10 ? numeric * 1000 : numeric)
      : new Date(timestamp.trim());

    return [
      { badge: "01", title: "JSON status", content: jsonResult.message },
      { badge: "02", title: "Formatted JSON", content: jsonResult.ok ? jsonResult.pretty : "Fix JSON before formatting" },
      { badge: "03", title: "Minified JSON", content: jsonResult.ok ? jsonResult.minified : "Unavailable" },
      { badge: "04", title: "Regex matches", content: regexResult },
      {
        badge: "05",
        title: "Timestamp",
        content: `Input ${timestamp}
ISO ${Number.isNaN(date.getTime()) ? "Invalid date" : date.toISOString()}
Local ${Number.isNaN(date.getTime()) ? "Invalid date" : date.toLocaleString()}
Unix seconds ${Number.isNaN(date.getTime()) ? "Invalid date" : Math.floor(date.getTime() / 1000)}
Milliseconds ${Number.isNaN(date.getTime()) ? "Invalid date" : date.getTime()}`,
      },
    ];
  }, [flags, json, pattern, regexText, timestamp]);
  const output = useMemo(
    () => utilityBlocks.map((block) => `${block.title}\n${block.content}`).join("\n\n"),
    [utilityBlocks]
  );

  return (
    <ToolLayout
      output={output}
      outputTitle="Utility result"
      blocks={utilityBlocks}
      actions={
        <>
          <button type="button" className="dense-action" onClick={() => setJson('{"name":"JinMing Lab","tools":["json","regex","timestamp"],"ok":true}')}>
            JSON sample
          </button>
          <button type="button" className="dense-action" onClick={() => setTimestamp(String(Date.now()))}>
            Current time
          </button>
          <button type="button" className="dense-action" onClick={() => { setJson(""); setRegexText(""); setTimestamp(""); }}>
            Clear
          </button>
        </>
      }
    >
      <p className="eyebrow">Input</p>
      <h2>JSON Regex Timestamp</h2>
      <label className="block">
        <span className="tool-label">JSON</span>
        <textarea value={json} onChange={(event) => setJson(event.target.value)} className="tool-textarea tool-textarea-small" spellCheck={false} />
      </label>
      <div className="tool-field-grid">
        <label>
          <span>Regex</span>
          <input value={pattern} onChange={(event) => setPattern(event.target.value)} className="tool-input" />
        </label>
        <label>
          <span>Flags</span>
          <input value={flags} onChange={(event) => setFlags(event.target.value)} className="tool-input" />
        </label>
      </div>
      <textarea value={regexText} onChange={(event) => setRegexText(event.target.value)} className="tool-textarea tool-textarea-small" />
      <label className="block">
        <span className="tool-label">Timestamp or date</span>
        <input value={timestamp} onChange={(event) => setTimestamp(event.target.value)} className="tool-input" />
      </label>
    </ToolLayout>
  );
}

function LearningRoadmap() {
  const [track, setTrack] = useState<RoadmapTrack>("frontend");
  const data = roadmapTracks[track];
  const roadmapBlocks = useMemo<OutputBlock[]>(() => {
    const days = Array.from({ length: 30 }, (_, index) => {
      const day = index + 1;
      const week = Math.ceil(day / 7);
      const focus =
        week === 1
          ? "foundation syntax environment and reading examples"
          : week === 2
            ? "small components scripts and API practice"
            : week === 3
              ? "project building debugging and refactor"
              : "ship polish deploy and review";
      return `Day ${day} ${focus}`;
    });

    return [
      { badge: "01", title: `${data.label} goal`, content: data.goal },
      { badge: "02", title: "Stack", content: data.stack.join("\n") },
      { badge: "03", title: "Daily plan", content: days.map((item) => `- ${item}`).join("\n") },
      {
        badge: "04",
        title: "Weekly milestones",
        content: `- Week 1 finish environment setup and 10 small exercises
- Week 2 build 3 practical mini tools
- Week 3 build the final project core flow
- Week 4 polish deploy document and collect feedback`,
      },
      { badge: "05", title: "Final project", content: data.project },
      {
        badge: "06",
        title: "Daily rhythm",
        content: `- 30 minutes learn
- 60 minutes build
- 20 minutes debug notes
- 10 minutes publish a tiny progress log`,
      },
    ];
  }, [data]);
  const output = useMemo(
    () => roadmapBlocks.map((block) => `${block.title}\n${block.content}`).join("\n\n"),
    [roadmapBlocks]
  );

  return (
    <ToolLayout output={output} outputTitle="30 day plan" blocks={roadmapBlocks}>
      <p className="eyebrow">Input</p>
      <h2>Choose direction</h2>
      <div className="tool-choice-grid">
        {Object.entries(roadmapTracks).map(([key, item]) => (
          <button
            key={key}
            type="button"
            onClick={() => setTrack(key as RoadmapTrack)}
            className={track === key ? "tool-choice tool-choice-active" : "tool-choice"}
          >
            <strong>{item.label}</strong>
            <span>{item.goal}</span>
          </button>
        ))}
      </div>
    </ToolLayout>
  );
}
