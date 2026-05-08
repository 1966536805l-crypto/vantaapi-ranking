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
      "github-repo-analyzer": { title: "Prüfung", body: "Prüft README env CI Deploy Sicherheit und Release Blocker" },
      "bug-finder": { title: "Debug", body: "Macht aus Fehlern Ursachen Schritte Fixes und Verifikation" },
      "api-request-generator": { title: "API", body: "Erzeugt curl fetch axios und Python requests Beispiele" },
      "dev-utilities": { title: "Werkzeuge", body: "Prüft JSON Regex Zeitstempel und kopiert saubere Ergebnisse" },
      "learning-roadmap": { title: "Route", body: "Plant die nächsten 30 Tage nach dem ersten Release" },
    },
    pt: {
      "github-repo-analyzer": { title: "Auditoria", body: "Verifica README env CI deploy segurança e bloqueios de lançamento" },
      "bug-finder": { title: "Debug", body: "Transforma erros em causas passos correção e verificação" },
      "api-request-generator": { title: "API", body: "Gera exemplos curl fetch axios e Python requests" },
      "dev-utilities": { title: "Utilitários", body: "Valida JSON regex timestamps e copia resultados limpos" },
      "learning-roadmap": { title: "Roteiro", body: "Planeja os próximos 30 dias após o primeiro lançamento" },
    },
    ru: {
      "github-repo-analyzer": { title: "Аудит", body: "Проверяет README env CI деплой безопасность и launch blockers" },
      "bug-finder": { title: "Отладка", body: "Превращает ошибки в причины шаги исправления и проверку" },
      "api-request-generator": { title: "API", body: "Генерирует curl fetch axios и Python requests примеры" },
      "dev-utilities": { title: "Утилиты", body: "Проверяет JSON regex timestamps и копирует чистый результат" },
      "learning-roadmap": { title: "План", body: "Планирует 30 дней после первого запуска" },
    },
    hi: {
      "github-repo-analyzer": { title: "जांच", body: "README env CI deploy security और launch blockers जांचता है" },
      "bug-finder": { title: "Debug", body: "Errors को कारण steps fix और verification में बदलता है" },
      "api-request-generator": { title: "API", body: "curl fetch axios और Python requests examples बनाता है" },
      "dev-utilities": { title: "उपकरण", body: "JSON regex timestamp जांचता है और clean output देता है" },
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
      "github-repo-analyzer": { title: "Kiểm tra", body: "Kiểm tra README env CI deploy bảo mật và blocker ra mắt" },
      "bug-finder": { title: "Debug", body: "Biến lỗi thành nguyên nhân bước sửa và kiểm chứng" },
      "api-request-generator": { title: "API", body: "Tạo ví dụ curl fetch axios và Python requests" },
      "dev-utilities": { title: "Tiện ích", body: "Kiểm tra JSON regex timestamp và copy kết quả sạch" },
      "learning-roadmap": { title: "Lộ trình", body: "Lập kế hoạch 30 ngày sau lần ra mắt đầu" },
    },
    th: {
      "github-repo-analyzer": { title: "ตรวจ", body: "ตรวจ README env CI deploy ความปลอดภัย และ blocker ก่อนปล่อย" },
      "bug-finder": { title: "ดีบัก", body: "เปลี่ยน error เป็นสาเหตุ ขั้นตอน วิธีแก้ และการตรวจสอบ" },
      "api-request-generator": { title: "API", body: "สร้างตัวอย่าง curl fetch axios และ Python requests" },
      "dev-utilities": { title: "เครื่องมือ", body: "ตรวจ JSON regex timestamp และคัดลอกผลลัพธ์สะอาด" },
      "learning-roadmap": { title: "แผน", body: "วางแผน 30 วันหลังการปล่อยครั้งแรก" },
    },
    tr: {
      "github-repo-analyzer": { title: "Denetim", body: "README env CI deploy güvenlik ve yayın engellerini kontrol eder" },
      "bug-finder": { title: "Debug", body: "Hataları neden adım çözüm ve doğrulamaya çevirir" },
      "api-request-generator": { title: "API", body: "curl fetch axios ve Python requests örnekleri üretir" },
      "dev-utilities": { title: "Araçlar", body: "JSON regex timestamp kontrol eder ve temiz sonuç kopyalar" },
      "learning-roadmap": { title: "Rota", body: "İlk yayından sonraki 30 günü planlar" },
    },
    it: {
      "github-repo-analyzer": { title: "Audit", body: "Controlla README env CI deploy sicurezza e blocchi di lancio" },
      "bug-finder": { title: "Debug", body: "Trasforma errori in cause passaggi correzioni e verifica" },
      "api-request-generator": { title: "API", body: "Genera esempi curl fetch axios e Python requests" },
      "dev-utilities": { title: "Utility", body: "Controlla JSON regex timestamp e copia output puliti" },
      "learning-roadmap": { title: "Percorso", body: "Pianifica i 30 giorni dopo il primo lancio" },
    },
    nl: {
      "github-repo-analyzer": { title: "Controle", body: "Controleert README env CI deploy security en publicatie blockers" },
      "bug-finder": { title: "Debug", body: "Zet fouten om in oorzaak stappen fix en controle" },
      "api-request-generator": { title: "API", body: "Maakt curl fetch axios en Python requests voorbeelden" },
      "dev-utilities": { title: "Tools", body: "Controleert JSON regex timestamps en kopieert schone output" },
      "learning-roadmap": { title: "Route", body: "Plant de 30 dagen na de eerste publicatie" },
    },
    pl: {
      "github-repo-analyzer": { title: "Audyt", body: "Sprawdza README env CI deploy bezpieczeństwo i blokery publikacji" },
      "bug-finder": { title: "Debug", body: "Zmienia błędy w przyczyny kroki naprawy i weryfikację" },
      "api-request-generator": { title: "API", body: "Tworzy przykłady curl fetch axios i Python requests" },
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
    heroEyebrow: "أدوات الذكاء الاصطناعي للمطورين",
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
    navKicker: "Startablauf",
    heroEyebrow: "KI Werkzeuge für Entwickler",
    proof: ["Schnell", "Kopierbar", "Ohne Login"],
    inputPattern: "Eingabeformat",
    localFirst: "Lokal zuerst",
    privateDefault: "Standardmäßig privat",
    launchFlowLabel: "Start Workflow",
    recommendedOrder: "Empfohlene Reihenfolge",
    workflowTitle: "Von der Repo Prüfung zu Release Aufgaben",
    startWithAudit: "Mit Prüfung starten",
    whatItDoes: "Was es macht",
    workflow: (shortTitle) => `${shortTitle} Workflow`,
    goodFor: "Geeignet für",
    who: "Wer sollte es nutzen",
    examples: "Beispiele",
    inputOutput: "Eingabe und Ausgabe",
    input: "Eingabe:",
    output: "Ausgabe:",
    faqLimits: "FAQ und Grenzen",
    beforeUse: "Vor der Nutzung",
    usageLimits: "Nutzungsgrenzen",
    helperLine: "Gebaut für schnelle kopierbare Arbeit",
  },
  pt: {
    navKicker: "Fluxo de lançamento",
    heroEyebrow: "Ferramentas AI para devs",
    proof: ["Rápido", "Copiável", "Sem login"],
    inputPattern: "Padrão de entrada",
    localFirst: "Local primeiro",
    privateDefault: "Privado por padrão",
    launchFlowLabel: "Fluxo de lançamento",
    recommendedOrder: "Ordem recomendada",
    workflowTitle: "Da auditoria do repo para tarefas de release",
    startWithAudit: "Começar pela auditoria",
    whatItDoes: "O que faz",
    workflow: (shortTitle) => `fluxo de ${shortTitle}`,
    goodFor: "Bom para",
    who: "Quem deve usar",
    examples: "Exemplos",
    inputOutput: "Entrada e saída",
    input: "Entrada:",
    output: "Saída:",
    faqLimits: "FAQ e limites",
    beforeUse: "Antes de usar",
    usageLimits: "Limites de uso",
    helperLine: "Feito para copiar e agir rápido",
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
    navKicker: "लॉन्च क्रम",
    heroEyebrow: "डेवलपर के लिए AI उपकरण",
    proof: ["तेज", "कॉपी योग्य", "लॉगिन नहीं"],
    inputPattern: "इनपुट तरीका",
    localFirst: "पहले स्थानीय",
    privateDefault: "डिफॉल्ट निजी",
    launchFlowLabel: "लॉन्च कार्यप्रवाह",
    recommendedOrder: "सुझाया क्रम",
    workflowTitle: "Repo जांच से रिलीज़ कार्यों तक",
    startWithAudit: "जांच से शुरू करें",
    whatItDoes: "क्या करता है",
    workflow: (shortTitle) => `${shortTitle} कार्यप्रवाह`,
    goodFor: "किसके लिए",
    who: "कौन इस्तेमाल करे",
    examples: "उदाहरण",
    inputOutput: "इनपुट और आउटपुट",
    input: "इनपुट:",
    output: "आउटपुट:",
    faqLimits: "FAQ और सीमाएं",
    beforeUse: "इस्तेमाल से पहले",
    usageLimits: "सीमाएं",
    helperLine: "तेज और कॉपी योग्य काम के लिए",
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
    navKicker: "Quy trình ra mắt",
    heroEyebrow: "Công cụ AI cho lập trình viên",
    proof: ["Nhanh", "Dễ sao chép", "Không cần đăng nhập"],
    inputPattern: "Kiểu nhập",
    localFirst: "Ưu tiên cục bộ",
    privateDefault: "Mặc định riêng tư",
    launchFlowLabel: "Luồng ra mắt",
    recommendedOrder: "Thứ tự gợi ý",
    workflowTitle: "Từ kiểm tra repo đến việc release",
    startWithAudit: "Bắt đầu bằng kiểm tra",
    whatItDoes: "Công cụ làm gì",
    workflow: (shortTitle) => `luồng ${shortTitle}`,
    goodFor: "Phù hợp với",
    who: "Ai nên dùng",
    examples: "Ví dụ",
    inputOutput: "Đầu vào và đầu ra",
    input: "Đầu vào:",
    output: "Đầu ra:",
    faqLimits: "FAQ và giới hạn",
    beforeUse: "Trước khi dùng",
    usageLimits: "Giới hạn sử dụng",
    helperLine: "Tối ưu cho công việc nhanh và dễ sao chép",
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
    navKicker: "Yayın akışı",
    heroEyebrow: "Geliştiriciler için AI araçları",
    proof: ["Hızlı", "Kopyalanabilir", "Giriş gerekmez"],
    inputPattern: "Girdi formatı",
    localFirst: "Önce yerel",
    privateDefault: "Varsayılan olarak özel",
    launchFlowLabel: "Yayın iş akışı",
    recommendedOrder: "Önerilen sıra",
    workflowTitle: "Repo denetiminden release işlerine",
    startWithAudit: "Denetimle başla",
    whatItDoes: "Ne yapar",
    workflow: (shortTitle) => `${shortTitle} iş akışı`,
    goodFor: "Kimler için",
    who: "Kim kullanmalı",
    examples: "Örnekler",
    inputOutput: "Girdi ve çıktı",
    input: "Girdi:",
    output: "Çıktı:",
    faqLimits: "FAQ ve sınırlar",
    beforeUse: "Kullanmadan önce",
    usageLimits: "Kullanım sınırları",
    helperLine: "Hızlı ve kopyalanabilir iş için",
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
    startWithAudit: "Inizia dall'audit",
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
    navKicker: "Publicatiestroom",
    heroEyebrow: "AI gereedschap voor ontwikkelaars",
    proof: ["Snel", "Kopieerbaar", "Geen login"],
    inputPattern: "Invoerpatroon",
    localFirst: "Lokaal eerst",
    privateDefault: "Standaard privé",
    launchFlowLabel: "Publicatie workflow",
    recommendedOrder: "Aanbevolen volgorde",
    workflowTitle: "Van repo controle naar release taken",
    startWithAudit: "Start met controle",
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
    heroEyebrow: "Narzędzia AI dla programistów",
    proof: ["Szybko", "Do skopiowania", "Bez logowania"],
    inputPattern: "Format wejścia",
    localFirst: "Najpierw lokalnie",
    privateDefault: "Domyślnie prywatnie",
    launchFlowLabel: "Workflow publikacji",
    recommendedOrder: "Zalecana kolejność",
    workflowTitle: "Od audytu repo do zadań release",
    startWithAudit: "Zacznij od audytu",
    whatItDoes: "Co robi",
    workflow: (shortTitle) => `workflow ${shortTitle}`,
    goodFor: "Dobre dla",
    who: "Kto powinien używać",
    examples: "Przykłady",
    inputOutput: "Wejście i wyjście",
    input: "Wejście:",
    output: "Wyjście:",
    faqLimits: "FAQ i ograniczenia",
    beforeUse: "Przed użyciem",
    usageLimits: "Ograniczenia użycia",
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
    limitations: ["يدعم المستودعات العامة فقط", "لا يشغل الكود ولا يحلل المصدر بعمق", "الفحص الأساسي لا يعتمد على ذكاء اصطناعي قوي", "المستودعات الخاصة تحتاج صلاحيات وضوابط تدقيق"],
    faq: [
      { question: "هل يحتاج GitHub token", answer: "لا. النسخة الأولى تقرأ بيانات عامة وملفات عامة مختارة فقط." },
      { question: "هل يعمل إذا كان الذكاء الاصطناعي ضعيفا", answer: "نعم. القلب هو فحص قواعد README و env و CI والنشر والأمان وقائمة الإطلاق." },
      { question: "ما الفرق عن جعل الذكاء الاصطناعي يقرأ الكود", answer: "هذه الأداة تركز على أعمال الإطلاق المملة: README و env والملفات المؤقتة و CI والنشر والأمان وقائمة PR." },
    ],
  },
  de: {
    title: "GitHub Startprüfung",
    shortTitle: "Prüfung",
    description: "Macht aus einem öffentlichen GitHub Repo einen regelbasierten Bereitschaftsbericht",
    promise: "Regeln Score Blocker Issues README env CI Deploy Sicherheit Release Checkliste",
    inputHint: "Öffentliche Repo URL einfügen, zum Beispiel https://github.com/vercel/next.js",
    useCases: ["Vor der Veröffentlichung prüfen", "Öffentliches Release vorbereiten", "Repo Übergabe"],
    whatItDoes: ["Liest öffentliche Repo Daten und Root Config Dateien", "Prüft zuerst mit deterministischen Regeln", "Trennt Release Blocker von Feinschliff", "Erzeugt GitHub Issue Entwürfe und Release Checklisten"],
    audience: ["Open Source Maintainer", "Indie Entwickler vor Release", "Entwickler in fremden Repos"],
    outputExample: "Launch Score Blocker GitHub Issues README env CI Deploy Sicherheit und Release Checkliste",
    limitations: ["Nur öffentliche Repos", "Führt keinen Code aus und analysiert Source nicht tief", "Der Kern hängt nicht von starker KI ab", "Private Repos brauchen Auth und Audit Kontrolle"],
    faq: [
      { question: "Braucht es einen GitHub token", answer: "Nein. Die erste Version liest nur öffentliche Repo Daten und ausgewählte öffentliche Dateien." },
      { question: "Funktioniert es ohne starke KI", answer: "Ja. Der Kern sind Regeln für README env CI Deploy Sicherheit und Release Checkliste." },
      { question: "Warum nicht einfach KI den Code lesen lassen", answer: "Dieses Tool bearbeitet langsame Release Aufgaben: README env temporäre Dateien CI Deploy Sicherheit und PR Checkliste." },
    ],
  },
  pt: {
    title: "Auditoria de lançamento GitHub",
    shortTitle: "Auditoria",
    description: "Transforma um repo público do GitHub em um relatório de prontidão baseado em regras",
    promise: "Regras score bloqueios issues README env CI deploy segurança checklist",
    inputHint: "Cole uma URL pública de repo, por exemplo https://github.com/vercel/next.js",
    useCases: ["Auditar antes de lançar", "Preparar release público", "Entregar um repo"],
    whatItDoes: ["Lê metadados públicos e arquivos de configuração raiz", "Usa regras determinísticas antes de redigir", "Separa bloqueios de lançamento de melhorias", "Cria rascunhos de GitHub Issues e checklist de release"],
    audience: ["Mantenedores open source", "Indie builders antes do release", "Devs entrando em repo desconhecido"],
    outputExample: "Score de lançamento bloqueios issues README env CI deploy segurança e checklist",
    limitations: ["Somente repos públicos", "Não executa código nem faz análise profunda de fonte", "O núcleo não depende de AI forte", "Repos privados precisam de auth e controles de auditoria"],
    faq: [
      { question: "Precisa de GitHub token", answer: "Não. A primeira versão lê apenas metadados públicos e arquivos públicos selecionados." },
      { question: "Funciona se o AI não for forte", answer: "Sim. O produto central é de regras: README env CI deploy segurança e checklist de release." },
      { question: "Por que não pedir ao AI para ler código", answer: "Isto resolve tarefas lentas sem bom substituto: README env arquivos temporários CI deploy segurança e checklist de PR." },
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
    title: "GitHub लॉन्च जांच",
    shortTitle: "जांच",
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
    title: "Kiểm tra ra mắt GitHub",
    shortTitle: "Kiểm tra",
    description: "Biến repo GitHub công khai thành báo cáo sẵn sàng ra mắt dựa trên quy tắc",
    promise: "Quy tắc điểm blocker issues README env CI deploy bảo mật checklist",
    inputHint: "Dán URL repo công khai, ví dụ https://github.com/vercel/next.js",
    useCases: ["Kiểm tra trước khi ra mắt", "Chuẩn bị release công khai", "Bàn giao repo"],
    whatItDoes: ["Đọc metadata công khai và file cấu hình gốc", "Chạy quy tắc xác định trước khi viết báo cáo", "Tách blocker ra mắt và việc polish", "Tạo GitHub Issue draft và checklist release"],
    audience: ["Maintainer open source", "Indie developer truoc release", "Developer vao repo la"],
    outputExample: "Điểm ra mắt blocker GitHub Issues README env CI deploy bảo mật và checklist release",
    limitations: ["Chỉ hỗ trợ repo công khai", "Không chạy code hoặc phân tích source sâu", "Core check không phụ thuộc AI mạnh", "Repo riêng cần auth và audit controls"],
    faq: [
      { question: "Cần GitHub token không", answer: "Không. Bản đầu chỉ đọc repo data công khai và một số file công khai." },
      { question: "AI không mạnh có dùng được không", answer: "Có. Cốt lõi là rule check cho README env CI deploy bảo mật và checklist release." },
      { question: "Khác gì với bảo AI đọc code", answer: "Nó tập trung vào việc mất thời gian trước release: README env temporary files CI deploy security và PR checklist." },
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
    title: "GitHub yayın denetimi",
    shortTitle: "Denetim",
    description: "Public GitHub repo yu kurallara dayalı launch readiness raporuna çevirir",
    promise: "Kurallar skor engeller issues README env CI deploy güvenlik checklist",
    inputHint: "Public repo URL yapıştır, örnek https://github.com/vercel/next.js",
    useCases: ["Yayından önce denetim", "Public release hazırlığı", "Repo handoff"],
    whatItDoes: ["Public repo metadata ve root config dosyalarını okur", "Önce deterministik kurallarla kontrol eder", "Launch engellerini polish işlerinden ayırır", "GitHub Issue taslakları ve release checklist üretir"],
    audience: ["Open source maintainers", "Release oncesi indie developer", "Bilinmeyen repo ya giren developer"],
    outputExample: "Launch score blockers GitHub Issues README env CI deploy security ve release checklist",
    limitations: ["Sadece public repos", "Code çalıştırmaz ve source u derin analiz etmez", "Core check güçlü AI a bağlı değil", "Private repos auth ve audit control ister"],
    faq: [
      { question: "GitHub token gerekir mi", answer: "Hayır. İlk sürüm yalnız public repo bilgisi ve seçili public dosyaları okur." },
      { question: "AI güçlü değilse çalışır mı", answer: "Evet. Ana iş README env CI deploy security ve release checklist için rule check." },
      { question: "AI a kod okutmak yerine neden bu", answer: "Bu araç launch öncesi zaman alan işlere odaklanır: README env temporary files CI deploy security ve PR checklist." },
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
      { question: "Funziona se AI non è forte", answer: "Sì. Il core è rule check per README env CI deploy sicurezza e checklist release." },
      { question: "Perche non far leggere codice ad AI", answer: "Questo risolve lavori lenti prima del lancio: README env temporary files CI deploy security e PR checklist." },
    ],
  },
  nl: {
    title: "GitHub publicatiecontrole",
    shortTitle: "Controle",
    description: "Maakt van een publieke GitHub repo een rule first gereedheidsrapport",
    promise: "Regels score blockers issues README env CI deploy security release checklist",
    inputHint: "Plak een publieke repo URL bijvoorbeeld https://github.com/vercel/next.js",
    useCases: ["Controle voor publicatie", "Publieke release voorbereiden", "Repo overdracht"],
    whatItDoes: ["Leest publieke repo metadata en root config files", "Controleert eerst met deterministische regels", "Splitst publicatie blockers van polish", "Maakt GitHub Issue concepten en release checklist"],
    audience: ["Open source maintainers", "Indie developers voor release", "Developers in een onbekende repo"],
    outputExample: "Launch score blockers GitHub Issues README env CI deploy security en release checklist",
    limitations: ["Alleen publieke repos", "Voert geen code uit en doet geen diepe source analyse", "Core check hangt niet af van sterke AI", "Private repos vereisen auth en audit controls"],
    faq: [
      { question: "Is GitHub token nodig", answer: "Nee. De eerste versie leest alleen publieke repo data en geselecteerde publieke bestanden." },
      { question: "Werkt dit als AI niet sterk is", answer: "Ja. De kern is rule check voor README env CI deploy security en release checklist." },
      { question: "Waarom niet AI de code laten lezen", answer: "Dit richt zich op trage launch taken: README env tijdelijke files CI deploy security en PR checklist." },
    ],
  },
  pl: {
    title: "GitHub audyt publikacji",
    shortTitle: "Audyt",
    description: "Zmienia publiczne GitHub repo w raport gotowości publikacji oparty na regułach",
    promise: "Reguły wynik blokery issues README env CI deploy bezpieczeństwo checklist",
    inputHint: "Wklej publiczny URL repo np https://github.com/vercel/next.js",
    useCases: ["Audyt przed publikacją", "Przygotowanie publicznego release", "Przekazanie repo"],
    whatItDoes: ["Czyta publiczne metadata repo i root config files", "Najpierw sprawdza deterministycznymi regułami", "Oddziela launch blockers od polish", "Tworzy GitHub Issue drafts i release checklist"],
    audience: ["Open source maintainers", "Indie developers przed release", "Developerzy w nieznanym repo"],
    outputExample: "Launch score blockers GitHub Issues README env CI deploy security i release checklist",
    limitations: ["Tylko publiczne repos", "Nie uruchamia kodu i nie robi głębokiej analizy source", "Core check nie zależy od silnego AI", "Private repos wymagają auth i audit controls"],
    faq: [
      { question: "Czy potrzeba GitHub token", answer: "Nie. Pierwsza wersja czyta tylko publiczne dane repo i wybrane publiczne pliki." },
      { question: "Czy działa gdy AI nie jest mocne", answer: "Tak. Rdzeń to rule check dla README env CI deploy security i release checklist." },
      { question: "Czemu nie dać AI czytać kodu", answer: "To narzędzie skupia się na powolnych zadaniach przed publikacją: README env temporary files CI deploy security i PR checklist." },
    ],
  },
};

const toolShellTranslations: Partial<Record<InterfaceLanguage, Partial<Record<ToolSlug, Partial<ToolDefinition>>>>> = {
  zh: {
    "prompt-optimizer": {
      title: "AI 提示词优化器",
      shortTitle: "提示词",
      description: "把粗糙需求整理成适合写代码 查资料 做产品的结构化 Prompt",
      promise: "角色 背景 任务 输出格式 约束 验收标准 一次整理好",
      inputHint: "输入一个模糊需求 例如 帮我做一个 AI 工具站首页",
    },
    "code-explainer": {
      title: "代码解释器",
      shortTitle: "代码",
      description: "粘贴代码后快速看到作用 变量 风险和学习笔记",
      promise: "静态阅读 关键变量 潜在 bug 学习要点",
      inputHint: "粘贴 JavaScript Python C++ SQL 或 HTML 片段",
    },
    "bug-finder": {
      title: "Bug 定位助手",
      shortTitle: "Bug",
      description: "把报错和最小代码片段整理成原因 排查步骤和修复方向",
      promise: "原因清单 复现路径 修复模板 验证步骤",
      inputHint: "粘贴完整报错和最相关的一小段代码",
    },
    "api-request-generator": {
      title: "API 请求生成器",
      shortTitle: "API",
      description: "用接口地址 Header Body 生成 curl fetch axios 和 Python requests 示例",
      promise: "同一请求形态 多语言示例 可复制 可检查",
      inputHint: "输入接口地址 请求方法 Header 和 JSON Body",
    },
    "dev-utilities": {
      title: "JSON 正则 时间戳工具",
      shortTitle: "工具",
      description: "把常用 JSON 格式化 正则测试 时间戳转换放到一个开发工具面板",
      promise: "本地验证 快速转换 干净输出",
      inputHint: "粘贴 JSON 正则文本或时间戳",
    },
    "learning-roadmap": {
      title: "AI 编程学习路线",
      shortTitle: "路线",
      description: "选择方向后生成 30 天可执行的编程学习计划",
      promise: "每日任务 每周里程碑 最终项目 练习节奏",
      inputHint: "选择零基础 前端 Python 自动化或独立开发方向",
    },
  },
  ja: {
    "prompt-optimizer": { title: "AI プロンプト最適化", shortTitle: "Prompt", description: "曖昧な依頼をコード 調査 プロダクト作業向けの構造化 Prompt に整えます", promise: "役割 背景 タスク 出力形式 制約 完了条件", inputHint: "例 AI ツールサイトのトップページを作りたい" },
    "code-explainer": { title: "コード解説", shortTitle: "解説", description: "コードの目的 重要な名前 リスク 学習メモを素早く読みます", promise: "静的読解 重要変数 バグの兆候 学習メモ", inputHint: "JavaScript Python C++ SQL HTML のコードを貼り付けます" },
    "bug-finder": { title: "Bug 調査", shortTitle: "Bug", description: "エラーと小さなコード片から原因 手順 修正方向を作ります", promise: "原因候補 再現手順 修正テンプレート 検証", inputHint: "正確なエラーと関連コードだけを貼り付けます" },
    "api-request-generator": { title: "API リクエスト生成", shortTitle: "API", description: "endpoint header body から curl fetch axios Python requests を生成します", promise: "同じリクエスト形状を複数形式でコピー可能", inputHint: "URL method headers JSON body を入力します" },
    "dev-utilities": { title: "JSON Regex 時刻ツール", shortTitle: "ツール", description: "JSON 整形 正規表現テスト タイムスタンプ変換を一つにまとめます", promise: "ローカル検証 変換 コピー可能な出力", inputHint: "JSON 正規表現 テキスト タイムスタンプを貼り付けます" },
    "learning-roadmap": { title: "AI コーディングロードマップ", shortTitle: "計画", description: "方向を選び 30 日の実行しやすい学習計画を作ります", promise: "毎日の作業 週ごとの目標 最終プロジェクト", inputHint: "初心者 フロントエンド Python 自動化 個人開発を選びます" },
  },
  ko: {
    "prompt-optimizer": { title: "AI 프롬프트 최적화", shortTitle: "Prompt", description: "거친 요청을 코딩 조사 제품 작업용 구조화 Prompt 로 정리합니다", promise: "역할 배경 작업 출력 형식 제약 완료 기준", inputHint: "예 AI 도구 사이트 첫 화면 만들기" },
    "code-explainer": { title: "코드 설명", shortTitle: "설명", description: "코드 목적 주요 이름 위험 학습 메모를 빠르게 읽습니다", promise: "정적 읽기 주요 변수 버그 신호 학습 메모", inputHint: "JavaScript Python C++ SQL HTML 코드를 붙여 넣으세요" },
    "bug-finder": { title: "Bug 찾기", shortTitle: "Bug", description: "오류와 작은 코드 조각을 원인 단계 수정 방향으로 정리합니다", promise: "원인 목록 재현 경로 수정 템플릿 검증", inputHint: "정확한 오류와 관련 코드만 붙여 넣으세요" },
    "api-request-generator": { title: "API 요청 생성기", shortTitle: "API", description: "endpoint header body 로 curl fetch axios Python requests 를 생성합니다", promise: "같은 요청을 여러 형식으로 복사 가능", inputHint: "URL method headers JSON body 를 입력하세요" },
    "dev-utilities": { title: "JSON Regex 시간 도구", shortTitle: "도구", description: "JSON 포맷 Regex 테스트 타임스탬프 변환을 한곳에 모읍니다", promise: "로컬 검증 빠른 변환 복사 가능한 출력", inputHint: "JSON Regex 텍스트 또는 타임스탬프를 붙여 넣으세요" },
    "learning-roadmap": { title: "AI 코딩 로드맵", shortTitle: "로드맵", description: "방향을 선택해 30일 실행 가능한 코딩 계획을 만듭니다", promise: "일일 과제 주간 목표 최종 프로젝트", inputHint: "초보 프론트엔드 Python 자동화 개인 개발 중 선택하세요" },
  },
  es: {
    "prompt-optimizer": { title: "Optimizador de Prompt AI", shortTitle: "Prompt", description: "Convierte una idea vaga en un Prompt estructurado para codigo investigacion o producto", promise: "Rol contexto tareas formato restricciones criterios de aceptacion", inputHint: "Ejemplo crear la home de un sitio de herramientas AI" },
    "code-explainer": { title: "Explicador de codigo", shortTitle: "Codigo", description: "Pega codigo y recibe proposito variables riesgos y notas de aprendizaje", promise: "Lectura estatica variables clave posibles bugs notas", inputHint: "Pega JavaScript Python C++ SQL o HTML" },
    "bug-finder": { title: "Detector de Bug", shortTitle: "Bug", description: "Convierte errores y snippets en causas pasos y direccion de arreglo", promise: "Causas reproduccion plantilla de arreglo verificacion", inputHint: "Pega el error exacto y el codigo minimo relacionado" },
    "api-request-generator": { title: "Generador de requests API", shortTitle: "API", description: "Genera curl fetch axios y Python requests desde endpoint headers y body", promise: "Misma request en varios formatos lista para copiar", inputHint: "Introduce URL metodo headers y JSON body" },
    "dev-utilities": { title: "Utilidades JSON Regex Tiempo", shortTitle: "Utils", description: "Formatea JSON prueba regex convierte timestamps y copia salidas limpias", promise: "Validacion local conversion rapida salidas copiables", inputHint: "Pega JSON regex texto o timestamp" },
    "learning-roadmap": { title: "Ruta AI de programacion", shortTitle: "Ruta", description: "Elige una direccion y crea un plan practico de 30 dias", promise: "Tareas diarias hitos semanales proyecto final", inputHint: "Elige cero frontend Python automatizacion o indie" },
  },
  fr: {
    "prompt-optimizer": { title: "Optimiseur de Prompt AI", shortTitle: "Prompt", description: "Transforme une demande vague en Prompt structure pour code recherche ou produit", promise: "Role contexte taches format contraintes criteres", inputHint: "Exemple creer la page d accueil d un outil AI" },
    "code-explainer": { title: "Explication de code", shortTitle: "Code", description: "Collez du code et obtenez but variables risques et notes", promise: "Lecture statique variables bugs possibles notes", inputHint: "Collez JavaScript Python C++ SQL ou HTML" },
    "bug-finder": { title: "Detecteur de Bug", shortTitle: "Bug", description: "Transforme erreurs et snippets en causes et etapes de correction", promise: "Causes reproduction modele de correction verification", inputHint: "Collez l erreur exacte et le code minimal lie" },
    "api-request-generator": { title: "Generateur API", shortTitle: "API", description: "Genere curl fetch axios et Python requests depuis endpoint headers body", promise: "Meme requete en plusieurs formats copiables", inputHint: "Entrez URL methode headers et JSON body" },
    "dev-utilities": { title: "Outils JSON Regex Temps", shortTitle: "Outils", description: "Formate JSON teste regex convertit timestamps et copie les resultats", promise: "Validation locale conversion rapide sorties propres", inputHint: "Collez JSON regex texte ou timestamp" },
    "learning-roadmap": { title: "Roadmap AI de code", shortTitle: "Route", description: "Choisissez une direction et creez un plan pratique de 30 jours", promise: "Taches quotidiennes jalons projet final", inputHint: "Choisissez debutant frontend Python automatisation ou indie" },
  },
  de: {
    "prompt-optimizer": { title: "KI Prompt Optimierer", shortTitle: "Prompt", description: "Macht aus einer groben Idee einen strukturierten Prompt für Code Research oder Produktarbeit", promise: "Rolle Kontext Aufgaben Ausgabeformat Grenzen Akzeptanzkriterien", inputHint: "Beispiel Startseite für eine KI Tool Site bauen" },
    "code-explainer": { title: "Code Erklärer", shortTitle: "Code", description: "Fügt Code ein und zeigt Zweck Variablen Risiken und Lernnotizen", promise: "Statische Analyse Schlüsselnamen Bug Signale Lernnotizen", inputHint: "JavaScript Python C++ SQL oder HTML einfügen" },
    "bug-finder": { title: "Bug Finder", shortTitle: "Bug", description: "Macht aus Fehlern und Snippets Ursachen Schritte und Fix Richtung", promise: "Ursachen Reproduktion Fix Vorlage Verifikation", inputHint: "Exakte Fehlermeldung und kleinsten passenden Code einfuegen" },
    "api-request-generator": { title: "API Request Generator", shortTitle: "API", description: "Erzeugt curl fetch axios und Python requests aus Endpoint Headers und Body", promise: "Eine Request Form in mehreren kopierbaren Varianten", inputHint: "URL Methode Headers und JSON Body eingeben" },
    "dev-utilities": { title: "JSON Regex Zeit Werkzeuge", shortTitle: "Tools", description: "Formatiert JSON testet Regex wandelt Zeitstempel und kopiert saubere Ergebnisse", promise: "Lokale Validierung schnelle Umwandlung kopierbare Ausgabe", inputHint: "JSON Regex Text oder Zeitstempel einfügen" },
    "learning-roadmap": { title: "KI Coding Roadmap", shortTitle: "Route", description: "Wählt eine Richtung und erstellt einen praktischen 30 Tage Plan", promise: "Tägliche Aufgaben Wochenziele Abschlussprojekt", inputHint: "Zero Base Frontend Python Automation oder Indie wählen" },
  },
  pt: {
    "prompt-optimizer": { title: "Otimizador de Prompt AI", shortTitle: "Prompt", description: "Transforma pedido bruto em Prompt estruturado para codigo pesquisa ou produto", promise: "Papel contexto tarefas formato restricoes criterios", inputHint: "Exemplo criar home de um site de ferramentas AI" },
    "code-explainer": { title: "Explicador de codigo", shortTitle: "Codigo", description: "Cole codigo e receba objetivo variaveis riscos e notas", promise: "Leitura estatica variaveis bugs possiveis notas", inputHint: "Cole JavaScript Python C++ SQL ou HTML" },
    "bug-finder": { title: "Detector de Bug", shortTitle: "Bug", description: "Transforma erro e snippet em causas passos e correcao", promise: "Causas reproducao modelo de correcao verificacao", inputHint: "Cole o erro exato e o menor codigo relacionado" },
    "api-request-generator": { title: "Gerador de request API", shortTitle: "API", description: "Gera curl fetch axios e Python requests de endpoint headers e body", promise: "Uma request em varios formatos copiaveis", inputHint: "Informe URL metodo headers e JSON body" },
    "dev-utilities": { title: "Utilitarios JSON Regex Tempo", shortTitle: "Utils", description: "Formata JSON testa regex converte timestamps e copia saidas limpas", promise: "Validacao local conversao rapida saidas copiaveis", inputHint: "Cole JSON regex texto ou timestamp" },
    "learning-roadmap": { title: "Roteiro AI de codigo", shortTitle: "Roteiro", description: "Escolha uma direcao e gere um plano pratico de 30 dias", promise: "Tarefas diarias marcos semanais projeto final", inputHint: "Escolha zero frontend Python automacao ou indie" },
  },
  ru: {
    "prompt-optimizer": { title: "AI оптимизатор Prompt", shortTitle: "Prompt", description: "Делает из сырой идеи структурированный Prompt для кода исследования или продукта", promise: "Роль контекст задачи формат ограничения критерии", inputHint: "Например создать главную страницу AI tool сайта" },
    "code-explainer": { title: "Объяснение кода", shortTitle: "Код", description: "Вставьте код и получите цель переменные риски и заметки", promise: "Статическое чтение ключевые имена bug сигналы заметки", inputHint: "Вставьте JavaScript Python C++ SQL или HTML" },
    "bug-finder": { title: "Поиск Bug", shortTitle: "Bug", description: "Превращает ошибку и snippet в причины шаги и fix direction", promise: "Причины воспроизведение шаблон fix проверка", inputHint: "Вставьте точную ошибку и минимальный связанный код" },
    "api-request-generator": { title: "Генератор API requests", shortTitle: "API", description: "Создает curl fetch axios и Python requests из endpoint headers body", promise: "Один request в нескольких копируемых форматах", inputHint: "Введите URL method headers и JSON body" },
    "dev-utilities": { title: "JSON Regex Время", shortTitle: "Tools", description: "Форматирует JSON тестирует Regex переводит timestamps", promise: "Локальная проверка быстрая конвертация чистый вывод", inputHint: "Вставьте JSON regex текст или timestamp" },
    "learning-roadmap": { title: "AI roadmap программирования", shortTitle: "План", description: "Выберите направление и получите практичный 30 дневный план", promise: "Ежедневные задачи недельные цели финальный проект", inputHint: "Выберите zero frontend Python automation или indie" },
  },
  ar: {
    "prompt-optimizer": { title: "محسن Prompt بالذكاء الاصطناعي", shortTitle: "Prompt", description: "يحول الطلب الخام إلى Prompt منظم للكود أو البحث أو المنتج", promise: "دور سياق مهام صيغة إخراج قيود ومعايير قبول", inputHint: "مثال ابن صفحة رئيسية لموقع أدوات ذكاء اصطناعي" },
    "code-explainer": { title: "شارح الكود", shortTitle: "كود", description: "الصق الكود لتحصل على الهدف والمتغيرات والمخاطر وملاحظات التعلم", promise: "قراءة ثابتة أسماء مهمة إشارات Bug ملاحظات تعلم", inputHint: "الصق JavaScript أو Python أو C++ أو SQL أو HTML" },
    "bug-finder": { title: "محدد الأخطاء", shortTitle: "Bug", description: "يحول الخطأ والمقطع الصغير إلى أسباب وخطوات واتجاه إصلاح", promise: "أسباب إعادة إنتاج قالب إصلاح وخطوات تحقق", inputHint: "الصق نص الخطأ الكامل وأصغر كود متعلق به" },
    "api-request-generator": { title: "منشئ طلبات API", shortTitle: "API", description: "ينشئ curl و fetch و axios و Python requests من endpoint و headers و body", promise: "طلب واحد بعدة صيغ قابلة للنسخ", inputHint: "أدخل URL و method و headers و JSON body" },
    "dev-utilities": { title: "أدوات JSON و Regex والوقت", shortTitle: "أدوات", description: "ينسق JSON ويختبر Regex ويحول الطوابع الزمنية في لوحة واحدة", promise: "تحقق محلي تحويل سريع ومخرجات نظيفة", inputHint: "الصق JSON أو Regex أو نصا أو timestamp" },
    "learning-roadmap": { title: "خطة تعلم البرمجة بالذكاء الاصطناعي", shortTitle: "خطة", description: "اختر اتجاها واحصل على خطة عملية لمدة 30 يوما", promise: "مهام يومية محطات أسبوعية ومشروع نهائي", inputHint: "اختر مبتدئ أو frontend أو Python أو automation أو indie" },
  },
  hi: {
    "prompt-optimizer": { title: "AI Prompt सुधारक", shortTitle: "Prompt", description: "कच्ची मांग को coding, research या product के लिए structured Prompt में बदलता है", promise: "Role context tasks output format constraints acceptance criteria", inputHint: "उदाहरण AI tool site का homepage बनाना" },
    "code-explainer": { title: "Code समझाने वाला", shortTitle: "Code", description: "Code paste करके purpose, variables, risks और notes पाएं", promise: "Static reading key names bug signals learning notes", inputHint: "JavaScript Python C++ SQL या HTML paste करें" },
    "bug-finder": { title: "Bug खोजक", shortTitle: "Bug", description: "Error और snippet को causes, steps और fix direction में बदलता है", promise: "Causes reproduction fix template verification", inputHint: "Exact error और सबसे छोटा related code paste करें" },
    "api-request-generator": { title: "API Request बनाने वाला", shortTitle: "API", description: "Endpoint, headers और body से curl, fetch, axios, Python requests बनाता है", promise: "एक request shape कई copy ready formats में", inputHint: "URL method headers और JSON body input करें" },
    "dev-utilities": { title: "JSON Regex Time उपकरण", shortTitle: "Tools", description: "JSON format, regex test और timestamp convert एक panel में", promise: "Local validation fast conversion clean output", inputHint: "JSON regex text या timestamp paste करें" },
    "learning-roadmap": { title: "AI Coding Roadmap", shortTitle: "Roadmap", description: "Direction चुनकर 30 day practical coding plan बनाएं", promise: "Daily tasks weekly milestones final project", inputHint: "Zero base frontend Python automation या indie चुनें" },
  },
  id: {
    "prompt-optimizer": { title: "Optimasi Prompt AI", shortTitle: "Prompt", description: "Ubah permintaan kasar menjadi Prompt terstruktur untuk kode riset atau produk", promise: "Peran konteks tugas format batasan kriteria selesai", inputHint: "Contoh buat homepage situs alat AI" },
    "code-explainer": { title: "Penjelas kode", shortTitle: "Kode", description: "Tempel kode untuk melihat tujuan variabel risiko dan catatan belajar", promise: "Baca statis nama penting sinyal bug catatan belajar", inputHint: "Tempel JavaScript Python C++ SQL atau HTML" },
    "bug-finder": { title: "Pencari Bug", shortTitle: "Bug", description: "Ubah error dan snippet menjadi sebab langkah dan arah perbaikan", promise: "Daftar sebab reproduksi template fix verifikasi", inputHint: "Tempel error tepat dan kode kecil terkait" },
    "api-request-generator": { title: "Generator request API", shortTitle: "API", description: "Buat curl fetch axios dan Python requests dari endpoint headers body", promise: "Satu bentuk request dalam format siap salin", inputHint: "Masukkan URL method headers dan JSON body" },
    "dev-utilities": { title: "Alat JSON Regex Waktu", shortTitle: "Alat", description: "Format JSON uji Regex ubah timestamp dalam satu panel", promise: "Validasi lokal konversi cepat output bersih", inputHint: "Tempel JSON regex teks atau timestamp" },
    "learning-roadmap": { title: "Roadmap coding AI", shortTitle: "Roadmap", description: "Pilih arah dan buat rencana coding praktis 30 hari", promise: "Tugas harian milestone mingguan proyek akhir", inputHint: "Pilih nol dasar frontend Python automation atau indie" },
  },
  vi: {
    "prompt-optimizer": { title: "Tối ưu Prompt AI", shortTitle: "Prompt", description: "Biến yêu cầu thô thành Prompt có cấu trúc cho code, research hoặc product", promise: "Vai trò ngữ cảnh nhiệm vụ format giới hạn tiêu chí", inputHint: "Ví dụ tạo homepage cho site công cụ AI" },
    "code-explainer": { title: "Giải thích code", shortTitle: "Code", description: "Dán code để xem mục đích, biến chính, rủi ro và ghi chú học", promise: "Đọc tĩnh tên chính dấu hiệu bug ghi chú học", inputHint: "Dán JavaScript Python C++ SQL hoặc HTML" },
    "bug-finder": { title: "Tìm Bug", shortTitle: "Bug", description: "Biến lỗi và snippet thành nguyên nhân, bước và hướng sửa", promise: "Nguyên nhân tái hiện template fix xác minh", inputHint: "Dán lỗi chính xác và đoạn code nhỏ liên quan" },
    "api-request-generator": { title: "Tạo request API", shortTitle: "API", description: "Tạo curl, fetch, axios và Python requests từ endpoint, headers, body", promise: "Một request thành nhiều format dễ copy", inputHint: "Nhập URL method headers và JSON body" },
    "dev-utilities": { title: "Công cụ JSON Regex Thời gian", shortTitle: "Công cụ", description: "Format JSON, test Regex, đổi timestamp trong một panel", promise: "Kiểm tra cục bộ đổi nhanh output sạch", inputHint: "Dán JSON regex text hoặc timestamp" },
    "learning-roadmap": { title: "Lộ trình code AI", shortTitle: "Lộ trình", description: "Chọn hướng và tạo kế hoạch code 30 ngày", promise: "Nhiệm vụ hằng ngày mốc hằng tuần project cuối", inputHint: "Chọn zero base frontend Python automation hoặc indie" },
  },
  th: {
    "prompt-optimizer": { title: "ปรับ Prompt AI", shortTitle: "Prompt", description: "เปลี่ยนคำขอคร่าวๆ เป็น Prompt มีโครงสำหรับ code research หรือ product", promise: "บทบาท context งาน format ข้อจำกัด เกณฑ์ผ่าน", inputHint: "เช่น สร้างหน้าแรกของเว็บเครื่องมือ AI" },
    "code-explainer": { title: "อธิบายโค้ด", shortTitle: "โค้ด", description: "วางโค้ดเพื่อดูเป้าหมาย ตัวแปร ความเสี่ยง และโน้ตเรียน", promise: "อ่านแบบ static ชื่อสำคัญ สัญญาณ bug โน้ตเรียน", inputHint: "วาง JavaScript Python C++ SQL หรือ HTML" },
    "bug-finder": { title: "ค้นหา Bug", shortTitle: "Bug", description: "เปลี่ยน error และ snippet เป็นสาเหตุ ขั้นตอน และแนวทางแก้", promise: "สาเหตุ reproduce template fix ตรวจสอบ", inputHint: "วาง error จริงและโค้ดส่วนเล็กที่เกี่ยวข้อง" },
    "api-request-generator": { title: "สร้าง request API", shortTitle: "API", description: "สร้าง curl fetch axios และ Python requests จาก endpoint headers body", promise: "request เดียวเป็นหลายรูปแบบพร้อมคัดลอก", inputHint: "ใส่ URL method headers และ JSON body" },
    "dev-utilities": { title: "เครื่องมือ JSON Regex เวลา", shortTitle: "เครื่องมือ", description: "จัด JSON ทดสอบ Regex แปลง timestamp ใน panel เดียว", promise: "ตรวจ local แปลงเร็ว output สะอาด", inputHint: "วาง JSON regex text หรือ timestamp" },
    "learning-roadmap": { title: "Roadmap coding AI", shortTitle: "Roadmap", description: "เลือกทางแล้วสร้างแผนเขียนโค้ด 30 วัน", promise: "งานรายวัน milestone รายสัปดาห์ project สุดท้าย", inputHint: "เลือก zero base frontend Python automation หรือ indie" },
  },
  tr: {
    "prompt-optimizer": { title: "AI Prompt iyileştirici", shortTitle: "Prompt", description: "Kaba isteği kod, research veya ürün işi için yapılı Prompt a çevirir", promise: "Rol bağlam görevler format sınırlar kabul kriterleri", inputHint: "Örnek AI araç sitesi ana sayfası yap" },
    "code-explainer": { title: "Kod açıklayıcı", shortTitle: "Kod", description: "Kod yapıştır, amaç, değişken, risk ve öğrenme notları al", promise: "Statik okuma ana isimler bug sinyalleri notlar", inputHint: "JavaScript Python C++ SQL veya HTML yapıştır" },
    "bug-finder": { title: "Bug bulucu", shortTitle: "Bug", description: "Hata ve snippet i neden, adım ve fix yönüne çevirir", promise: "Nedenler tekrar üretme fix şablonu doğrulama", inputHint: "Tam hata ve ilgili en küçük kodu yapıştır" },
    "api-request-generator": { title: "API request oluşturucu", shortTitle: "API", description: "Endpoint, headers, body den curl, fetch, axios, Python requests üretir", promise: "Tek request şekli çoklu kopyalanabilir format", inputHint: "URL method headers ve JSON body gir" },
    "dev-utilities": { title: "JSON Regex Zaman araçları", shortTitle: "Araç", description: "JSON formatlar Regex test eder timestamp çevirir", promise: "Yerel doğrulama hızlı dönüşüm temiz çıktı", inputHint: "JSON regex text veya timestamp yapıştır" },
    "learning-roadmap": { title: "AI kod roadmap", shortTitle: "Roadmap", description: "Yön seç ve 30 günlük pratik kod planı oluştur", promise: "Günlük görevler haftalık hedefler final proje", inputHint: "Zero base frontend Python automation veya indie seç" },
  },
  it: {
    "prompt-optimizer": { title: "Ottimizzatore Prompt AI", shortTitle: "Prompt", description: "Trasforma una richiesta grezza in Prompt strutturato per codice ricerca o prodotto", promise: "Ruolo contesto task formato limiti criteri", inputHint: "Esempio crea homepage per un sito di strumenti AI" },
    "code-explainer": { title: "Spiegatore codice", shortTitle: "Codice", description: "Incolla codice e ottieni scopo variabili rischi e note", promise: "Lettura statica nomi chiave segnali bug note", inputHint: "Incolla JavaScript Python C++ SQL o HTML" },
    "bug-finder": { title: "Trova Bug", shortTitle: "Bug", description: "Trasforma errore e snippet in cause passi e direzione fix", promise: "Cause riproduzione template fix verifica", inputHint: "Incolla errore esatto e codice minimo collegato" },
    "api-request-generator": { title: "Generatore request API", shortTitle: "API", description: "Genera curl fetch axios e Python requests da endpoint headers body", promise: "Una request in piu formati copiabili", inputHint: "Inserisci URL method headers e JSON body" },
    "dev-utilities": { title: "Strumenti JSON Regex Tempo", shortTitle: "Tools", description: "Formatta JSON testa Regex converte timestamp in un panel", promise: "Validazione locale conversione rapida output pulito", inputHint: "Incolla JSON regex testo o timestamp" },
    "learning-roadmap": { title: "Roadmap codice AI", shortTitle: "Roadmap", description: "Scegli una direzione e crea un piano pratico di 30 giorni", promise: "Task giornalieri milestone settimanali progetto finale", inputHint: "Scegli zero frontend Python automation o indie" },
  },
  nl: {
    "prompt-optimizer": { title: "AI prompt optimizer", shortTitle: "Prompt", description: "Zet een ruwe vraag om in een gestructureerde prompt voor code research of productwerk", promise: "Rol context taken output format grenzen acceptatiecriteria", inputHint: "Voorbeeld bouw de homepage van een AI tools site" },
    "code-explainer": { title: "Code uitlegger", shortTitle: "Code", description: "Plak code en krijg doel variabelen risico en leernotities", promise: "Statisch lezen kernnamen bug signalen notities", inputHint: "Plak JavaScript Python C++ SQL of HTML" },
    "bug-finder": { title: "Bug finder", shortTitle: "Bug", description: "Maakt van error en snippet oorzaken stappen en fix richting", promise: "Oorzaken reproductie fix template verificatie", inputHint: "Plak exacte error en kleinste gerelateerde code" },
    "api-request-generator": { title: "API request generator", shortTitle: "API", description: "Genereert curl fetch axios en Python requests uit endpoint headers body", promise: "Een request vorm in meerdere kopieerbare formats", inputHint: "Voer URL method headers en JSON body in" },
    "dev-utilities": { title: "JSON Regex Tijd gereedschap", shortTitle: "Tools", description: "Format JSON test Regex converteer timestamps in een paneel", promise: "Lokale validatie snelle conversie schone output", inputHint: "Plak JSON regex tekst of timestamp" },
    "learning-roadmap": { title: "AI coding roadmap", shortTitle: "Roadmap", description: "Kies richting en maak een praktisch 30 dagen codeplan", promise: "Dagelijkse taken wekelijkse mijlpalen eindproject", inputHint: "Kies zero base frontend Python automation of indie" },
  },
  pl: {
    "prompt-optimizer": { title: "Optymalizator Prompt AI", shortTitle: "Prompt", description: "Zmienia surową prośbę w strukturalny Prompt do kodu researchu lub produktu", promise: "Rola kontekst zadania format ograniczenia kryteria", inputHint: "Przykład zbuduj homepage strony narzędzi AI" },
    "code-explainer": { title: "Wyjaśniacz kodu", shortTitle: "Kod", description: "Wklej kod i zobacz cel zmienne ryzyka oraz notatki", promise: "Statyczne czytanie nazwy sygnały bug notatki", inputHint: "Wklej JavaScript Python C++ SQL lub HTML" },
    "bug-finder": { title: "Wyszukiwacz Bugów", shortTitle: "Bug", description: "Zmienia error i snippet w przyczyny kroki i kierunek fix", promise: "Przyczyny reprodukcja szablon fix weryfikacja", inputHint: "Wklej dokładny błąd i najmniejszy powiązany kod" },
    "api-request-generator": { title: "Generator requestów API", shortTitle: "API", description: "Generuje curl fetch axios i Python requests z endpoint headers body", promise: "Jeden request w kilku formatach do kopiowania", inputHint: "Podaj URL method headers i JSON body" },
    "dev-utilities": { title: "Narzędzia JSON Regex Czas", shortTitle: "Tools", description: "Formatuje JSON testuje Regex konwertuje timestamps w jednym panelu", promise: "Lokalna walidacja szybka konwersja czysty output", inputHint: "Wklej JSON regex text albo timestamp" },
    "learning-roadmap": { title: "AI roadmap kodowania", shortTitle: "Roadmap", description: "Wybierz kierunek i utwórz praktyczny plan 30 dni", promise: "Codzienne zadania tygodniowe cele finalny projekt", inputHint: "Wybierz zero frontend Python automation albo indie" },
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
  const translatedShell = toolShellTranslations[language]?.[tool.slug] || {};
  if (tool.slug === "github-repo-analyzer") {
    return { ...tool, ...auditTranslations[language], inputExample: tool.inputExample };
  }

  return { ...tool, ...translatedShell };
}

type ToolFormCopy = {
  loadSample: string;
  clear: string;
  input: string;
  roughRequest: string;
  promptPlaceholder: string;
  useCase: string;
  coding: string;
  research: string;
  product: string;
  template: string;
  context: string;
  optimizedPrompt: string;
  pasteCode: string;
  codeExplanation: string;
  jsSample: string;
  pythonSample: string;
  bugDiagnosis: string;
  typeErrorSample: string;
  apiSample: string;
  errorAndCode: string;
  errorMessage: string;
  codeSnippet: string;
  requestSnippets: string;
  getPreset: string;
  postPreset: string;
  clearBody: string;
  apiDetails: string;
  method: string;
  endpoint: string;
  headersOnePerLine: string;
  jsonBody: string;
  utilityResult: string;
  jsonRegexTimestamp: string;
  json: string;
  regex: string;
  flags: string;
  timestampOrDate: string;
  jsonSample: string;
  currentTime: string;
  plan30: string;
  chooseDirection: string;
};

const toolFormCopy = {
  en: {
    loadSample: "Load sample",
    clear: "Clear",
    input: "Input",
    roughRequest: "Rough request",
    promptPlaceholder: "Describe what you want AI to do",
    useCase: "Use case",
    coding: "Coding",
    research: "Research",
    product: "Product",
    template: "Template",
    context: "Context",
    optimizedPrompt: "Optimized prompt",
    pasteCode: "Paste code",
    codeExplanation: "Code explanation",
    jsSample: "JS sample",
    pythonSample: "Python sample",
    bugDiagnosis: "Bug diagnosis",
    typeErrorSample: "TypeError sample",
    apiSample: "API sample",
    errorAndCode: "Error and code",
    errorMessage: "Error message",
    codeSnippet: "Code snippet",
    requestSnippets: "Request snippets",
    getPreset: "GET preset",
    postPreset: "POST preset",
    clearBody: "Clear body",
    apiDetails: "API details",
    method: "Method",
    endpoint: "Endpoint",
    headersOnePerLine: "Headers one per line",
    jsonBody: "JSON body",
    utilityResult: "Utility result",
    jsonRegexTimestamp: "JSON Regex Timestamp",
    json: "JSON",
    regex: "Regex",
    flags: "Flags",
    timestampOrDate: "Timestamp or date",
    jsonSample: "JSON sample",
    currentTime: "Current time",
    plan30: "30 day plan",
    chooseDirection: "Choose direction",
  },
  zh: {
    loadSample: "载入示例",
    clear: "清空",
    input: "输入",
    roughRequest: "原始需求",
    promptPlaceholder: "描述你希望 AI 完成什么",
    useCase: "使用场景",
    coding: "写代码",
    research: "查资料",
    product: "做产品",
    template: "模板",
    context: "背景",
    optimizedPrompt: "优化后的提示词",
    pasteCode: "粘贴代码",
    codeExplanation: "代码解释",
    jsSample: "JS 示例",
    pythonSample: "Python 示例",
    bugDiagnosis: "Bug 诊断",
    typeErrorSample: "TypeError 示例",
    apiSample: "API 示例",
    errorAndCode: "报错和代码",
    errorMessage: "错误信息",
    codeSnippet: "代码片段",
    requestSnippets: "请求示例",
    getPreset: "GET 预设",
    postPreset: "POST 预设",
    clearBody: "清空 Body",
    apiDetails: "API 详情",
    method: "方法",
    endpoint: "接口地址",
    headersOnePerLine: "Header 每行一个",
    jsonBody: "JSON Body",
    utilityResult: "工具结果",
    jsonRegexTimestamp: "JSON 正则 时间戳",
    json: "JSON",
    regex: "正则",
    flags: "标记",
    timestampOrDate: "时间戳或日期",
    jsonSample: "JSON 示例",
    currentTime: "当前时间",
    plan30: "30 天计划",
    chooseDirection: "选择方向",
  },
  ja: {
    loadSample: "例を読み込む",
    clear: "クリア",
    input: "入力",
    roughRequest: "元の依頼",
    promptPlaceholder: "AI にしてほしいことを書いてください",
    useCase: "用途",
    coding: "コード",
    research: "調査",
    product: "プロダクト",
    template: "テンプレート",
    context: "文脈",
    optimizedPrompt: "最適化したプロンプト",
    pasteCode: "コードを貼る",
    codeExplanation: "コード解説",
    jsSample: "JS 例",
    pythonSample: "Python 例",
    bugDiagnosis: "バグ診断",
    typeErrorSample: "TypeError 例",
    apiSample: "API 例",
    errorAndCode: "エラーとコード",
    errorMessage: "エラーメッセージ",
    codeSnippet: "コード片",
    requestSnippets: "リクエスト例",
    getPreset: "GET プリセット",
    postPreset: "POST プリセット",
    clearBody: "Body クリア",
    apiDetails: "API 詳細",
    method: "メソッド",
    endpoint: "エンドポイント",
    headersOnePerLine: "Header を一行ずつ",
    jsonBody: "JSON Body",
    utilityResult: "ツール結果",
    jsonRegexTimestamp: "JSON Regex Timestamp",
    json: "JSON",
    regex: "Regex",
    flags: "Flags",
    timestampOrDate: "timestamp または日付",
    jsonSample: "JSON 例",
    currentTime: "現在時刻",
    plan30: "30 日計画",
    chooseDirection: "方向を選ぶ",
  },
  ar: {
    loadSample: "تحميل مثال",
    clear: "مسح",
    input: "الإدخال",
    roughRequest: "الطلب الخام",
    promptPlaceholder: "اكتب ما تريد من الذكاء الاصطناعي أن يفعله",
    useCase: "الاستخدام",
    coding: "برمجة",
    research: "بحث",
    product: "منتج",
    template: "القالب",
    context: "السياق",
    optimizedPrompt: "Prompt محسّن",
    pasteCode: "الصق الكود",
    codeExplanation: "شرح الكود",
    jsSample: "مثال JS",
    pythonSample: "مثال Python",
    bugDiagnosis: "تشخيص الخطأ",
    typeErrorSample: "مثال TypeError",
    apiSample: "مثال API",
    errorAndCode: "الخطأ والكود",
    errorMessage: "رسالة الخطأ",
    codeSnippet: "مقتطف الكود",
    requestSnippets: "أمثلة الطلب",
    getPreset: "إعداد GET",
    postPreset: "إعداد POST",
    clearBody: "مسح Body",
    apiDetails: "تفاصيل API",
    method: "الطريقة",
    endpoint: "Endpoint",
    headersOnePerLine: "Headers سطر لكل واحد",
    jsonBody: "JSON Body",
    utilityResult: "نتيجة الأداة",
    jsonRegexTimestamp: "JSON و Regex و Timestamp",
    json: "JSON",
    regex: "Regex",
    flags: "Flags",
    timestampOrDate: "Timestamp أو تاريخ",
    jsonSample: "مثال JSON",
    currentTime: "الوقت الحالي",
    plan30: "خطة 30 يوما",
    chooseDirection: "اختر الاتجاه",
  },
} satisfies Partial<Record<InterfaceLanguage, ToolFormCopy>>;

function getToolFormCopy(language: InterfaceLanguage) {
  return toolFormCopy[language as keyof typeof toolFormCopy] || toolFormCopy.en;
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
            {active === "prompt-optimizer" && <PromptOptimizer language={language} />}
            {active === "code-explainer" && <CodeExplainer language={language} />}
            {active === "bug-finder" && <BugFinder language={language} />}
            {active === "api-request-generator" && <ApiRequestGenerator language={language} />}
            {active === "dev-utilities" && <DevUtilities language={language} />}
            {active === "learning-roadmap" && <LearningRoadmap language={language} />}
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

function PromptOptimizer({ language }: { language: InterfaceLanguage }) {
  const f = getToolFormCopy(language);
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
      outputTitle={f.optimizedPrompt}
      language={language}
      blocks={promptBlocks}
      actions={
        <>
          <button type="button" className="dense-action" onClick={() => { setGoal(sampleGoal); setContext(sampleContext); setMode("coding"); }}>
            {f.loadSample}
          </button>
          <button type="button" className="dense-action" onClick={() => { setGoal(""); setContext(""); }}>
            {f.clear}
          </button>
        </>
      }
    >
      <p className="eyebrow">{f.input}</p>
      <h2>{f.roughRequest}</h2>
      <textarea value={goal} onChange={(event) => setGoal(event.target.value)} className="tool-textarea" placeholder={f.promptPlaceholder} />
      <div className="tool-field-grid">
        <label>
          <span>{f.useCase}</span>
          <select value={mode} onChange={(event) => setMode(event.target.value)} className="tool-input">
            <option value="coding">{f.coding}</option>
            <option value="research">{f.research}</option>
            <option value="product">{f.product}</option>
          </select>
        </label>
        <label>
          <span>{f.template}</span>
          <select value={templateKey} onChange={(event) => setTemplateKey(event.target.value as PromptTemplateKey)} className="tool-input">
            {Object.entries(promptTemplates).map(([key, template]) => (
              <option key={key} value={key}>{template.label}</option>
            ))}
          </select>
        </label>
      </div>
      <label className="block">
        <span className="tool-label">{f.context}</span>
        <textarea value={context} onChange={(event) => setContext(event.target.value)} className="tool-textarea tool-textarea-small" />
      </label>
    </ToolLayout>
  );
}

function CodeExplainer({ language }: { language: InterfaceLanguage }) {
  const f = getToolFormCopy(language);
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
      outputTitle={f.codeExplanation}
      language={language}
      blocks={explainBlocks}
      actions={
        <>
          <button type="button" className="dense-action" onClick={() => setCode(sampleCode)}>
            {f.jsSample}
          </button>
          <button type="button" className="dense-action" onClick={() => setCode(samplePython)}>
            {f.pythonSample}
          </button>
          <button type="button" className="dense-action" onClick={() => setCode("")}>
            {f.clear}
          </button>
        </>
      }
    >
      <p className="eyebrow">{f.input}</p>
      <h2>{f.pasteCode}</h2>
      <textarea value={code} onChange={(event) => setCode(event.target.value)} className="tool-textarea tool-code-input" spellCheck={false} />
    </ToolLayout>
  );
}

function BugFinder({ language }: { language: InterfaceLanguage }) {
  const f = getToolFormCopy(language);
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
      outputTitle={f.bugDiagnosis}
      language={language}
      blocks={bugBlocks}
      actions={
        <>
          <button type="button" className="dense-action" onClick={() => { setError(sampleBug); setCode(sampleCode); }}>
            {f.typeErrorSample}
          </button>
          <button type="button" className="dense-action" onClick={() => { setError(sampleApiBug); setCode(sampleApiBug); }}>
            {f.apiSample}
          </button>
          <button type="button" className="dense-action" onClick={() => { setError(""); setCode(""); }}>
            {f.clear}
          </button>
        </>
      }
    >
      <p className="eyebrow">{f.input}</p>
      <h2>{f.errorAndCode}</h2>
      <label className="block">
        <span className="tool-label">{f.errorMessage}</span>
        <textarea value={error} onChange={(event) => setError(event.target.value)} className="tool-textarea tool-textarea-small" />
      </label>
      <label className="block">
        <span className="tool-label">{f.codeSnippet}</span>
        <textarea value={code} onChange={(event) => setCode(event.target.value)} className="tool-textarea tool-code-input" spellCheck={false} />
      </label>
    </ToolLayout>
  );
}

function ApiRequestGenerator({ language }: { language: InterfaceLanguage }) {
  const f = getToolFormCopy(language);
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
      outputTitle={f.requestSnippets}
      language={language}
      blocks={requestBlocks}
      actions={
        <>
          <button type="button" className="dense-action" onClick={() => { setMethod("GET"); setUrl("https://api.example.com/v1/projects"); setHeaders("Authorization: Bearer YOUR_TOKEN"); setBody(""); }}>
            {f.getPreset}
          </button>
          <button type="button" className="dense-action" onClick={() => { setMethod("POST"); setUrl("https://api.example.com/v1/users"); setHeaders("Authorization: Bearer YOUR_TOKEN\nContent-Type: application/json"); setBody('{"name":"JinMing Lab","role":"developer"}'); }}>
            {f.postPreset}
          </button>
          <button type="button" className="dense-action" onClick={() => { setHeaders(""); setBody(""); }}>
            {f.clearBody}
          </button>
        </>
      }
    >
      <p className="eyebrow">{f.input}</p>
      <h2>{f.apiDetails}</h2>
      <div className="tool-field-grid">
        <label>
          <span>{f.method}</span>
          <select value={method} onChange={(event) => setMethod(event.target.value as ApiMethod)} className="tool-input">
            {["GET", "POST", "PUT", "PATCH", "DELETE"].map((item) => <option key={item}>{item}</option>)}
          </select>
        </label>
        <label>
          <span>{f.endpoint}</span>
          <input value={url} onChange={(event) => setUrl(event.target.value)} className="tool-input" />
        </label>
      </div>
      <label className="block">
        <span className="tool-label">{f.headersOnePerLine}</span>
        <textarea value={headers} onChange={(event) => setHeaders(event.target.value)} className="tool-textarea tool-textarea-small" />
      </label>
      <label className="block">
        <span className="tool-label">{f.jsonBody}</span>
        <textarea value={body} onChange={(event) => setBody(event.target.value)} className="tool-textarea tool-textarea-small" spellCheck={false} />
      </label>
    </ToolLayout>
  );
}

function DevUtilities({ language }: { language: InterfaceLanguage }) {
  const f = getToolFormCopy(language);
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
      outputTitle={f.utilityResult}
      language={language}
      blocks={utilityBlocks}
      actions={
        <>
          <button type="button" className="dense-action" onClick={() => setJson('{"name":"JinMing Lab","tools":["json","regex","timestamp"],"ok":true}')}>
            {f.jsonSample}
          </button>
          <button type="button" className="dense-action" onClick={() => setTimestamp(String(Date.now()))}>
            {f.currentTime}
          </button>
          <button type="button" className="dense-action" onClick={() => { setJson(""); setRegexText(""); setTimestamp(""); }}>
            {f.clear}
          </button>
        </>
      }
    >
      <p className="eyebrow">{f.input}</p>
      <h2>{f.jsonRegexTimestamp}</h2>
      <label className="block">
        <span className="tool-label">{f.json}</span>
        <textarea value={json} onChange={(event) => setJson(event.target.value)} className="tool-textarea tool-textarea-small" spellCheck={false} />
      </label>
      <div className="tool-field-grid">
        <label>
          <span>{f.regex}</span>
          <input value={pattern} onChange={(event) => setPattern(event.target.value)} className="tool-input" />
        </label>
        <label>
          <span>{f.flags}</span>
          <input value={flags} onChange={(event) => setFlags(event.target.value)} className="tool-input" />
        </label>
      </div>
      <textarea value={regexText} onChange={(event) => setRegexText(event.target.value)} className="tool-textarea tool-textarea-small" />
      <label className="block">
        <span className="tool-label">{f.timestampOrDate}</span>
        <input value={timestamp} onChange={(event) => setTimestamp(event.target.value)} className="tool-input" />
      </label>
    </ToolLayout>
  );
}

function LearningRoadmap({ language }: { language: InterfaceLanguage }) {
  const f = getToolFormCopy(language);
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
    <ToolLayout output={output} outputTitle={f.plan30} blocks={roadmapBlocks} language={language}>
      <p className="eyebrow">{f.input}</p>
      <h2>{f.chooseDirection}</h2>
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
