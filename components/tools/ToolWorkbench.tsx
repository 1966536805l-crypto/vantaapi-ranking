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

function toolExamples(tool: ToolDefinition) {
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
      title: `${tool.shortTitle} example`,
      input: tool.inputExample,
      output: tool.outputExample,
    },
  ];
}

function ToolSeoPanel({ tool, language = "en" }: { tool: ToolDefinition; language?: InterfaceLanguage }) {
  const t = getWorkbenchCopy(language);
  const examples = toolExamples(tool);

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
