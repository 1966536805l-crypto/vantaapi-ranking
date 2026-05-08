import type { Metadata } from "next";
import ToolWorkbench from "@/components/tools/ToolWorkbench";
import { localizedHref, localizedLanguageAlternates, resolveInterfaceLanguage, type InterfaceLanguage } from "@/lib/language";
import { getToolDefinition, toolDefinitions, type ToolDefinition } from "@/lib/tool-definitions";

type ToolRouteProps = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ lang?: string | string[]; repo?: string | string[] }>;
};

export function generateStaticParams() {
  return toolDefinitions.map((tool) => ({ slug: tool.slug }));
}

function toolUrl(tool: ToolDefinition) {
  return `https://vantaapi.com/tools/${tool.slug}`;
}

function toolKeywords(tool: ToolDefinition) {
  const launchAuditKeywords =
    tool.slug === "github-repo-analyzer"
      ? [
          "GitHub Launch Audit",
          "GitHub 项目体检",
          "README check",
          "env example",
          "CI check",
          "deployment checklist",
          "security checklist",
          "release checklist",
          "GitHub issue template",
          "repo handoff checklist",
        ]
      : [];

  return Array.from(
    new Set([
      "JinMing Lab",
      tool.title,
      tool.shortTitle,
      ...tool.useCases,
      ...tool.whatItDoes,
      ...tool.audience,
      ...launchAuditKeywords,
    ])
  );
}

const auditRouteMeta: Record<InterfaceLanguage, { title: string; description: string }> = {
  en: {
    title: "GitHub Launch Audit - Repo Readiness Report | JinMing Lab",
    description: "Generate a rules-first launch-readiness report for a public GitHub repository with scorecard, blockers, evidence, GitHub issue drafts, PR description, and release checklist.",
  },
  zh: {
    title: "GitHub 上线体检 - 仓库发布检查报告 | JinMing Lab",
    description: "为公开 GitHub 仓库生成规则优先的上线体检报告，包含评分、阻塞项、证据、Issue 草稿、PR 描述和发布清单。",
  },
  ja: {
    title: "GitHub 公開前診断 - リポジトリ準備レポート | JinMing Lab",
    description: "公開 GitHub リポジトリのスコア、ブロッカー、証拠、Issue 下書き、PR 説明、リリースチェックリストを生成します。",
  },
  ko: {
    title: "GitHub 출시 점검 - 저장소 준비 보고서 | JinMing Lab",
    description: "공개 GitHub 저장소의 점수, 차단 항목, 근거, Issue 초안, PR 설명, 릴리스 체크리스트를 생성합니다.",
  },
  es: {
    title: "Audit GitHub - Reporte de preparacion | JinMing Lab",
    description: "Genera un reporte rules first para un repo publico con score bloqueos evidencia issues PR y checklist de release.",
  },
  fr: {
    title: "Audit GitHub - Rapport avant lancement | JinMing Lab",
    description: "Generez un rapport rules first pour repo public avec score blocages preuves issues PR et checklist release.",
  },
  de: {
    title: "GitHub Launch Audit - Repo Readiness Bericht | JinMing Lab",
    description: "Erzeuge einen regelbasierten Bericht fuer ein oeffentliches GitHub Repo mit Score Blockern Evidence Issues PR Text und Release Checkliste.",
  },
  pt: {
    title: "Auditoria GitHub - Relatorio de prontidao | JinMing Lab",
    description: "Gere um relatorio rules first para repo publico com score bloqueios evidencias issues PR e checklist de release.",
  },
  ru: {
    title: "GitHub аудит - отчет готовности repo | JinMing Lab",
    description: "Создайте rule first отчет для публичного GitHub repo с оценкой блокерами evidence issues PR и release checklist.",
  },
  ar: {
    title: "تدقيق GitHub - تقرير جاهزية المستودع | JinMing Lab",
    description: "أنشئ تقرير جاهزية يعتمد على القواعد لمستودع GitHub عام مع نتيجة وعوائق وأدلة ومسودات Issues ووصف PR وقائمة إطلاق.",
  },
  hi: {
    title: "GitHub लॉन्च ऑडिट - Repo readiness report | JinMing Lab",
    description: "Public GitHub repo के लिए score blockers evidence issues PR description और release checklist वाला rules first report बनाएं.",
  },
  id: {
    title: "Audit GitHub - Laporan kesiapan repo | JinMing Lab",
    description: "Buat laporan rules first untuk repo publik dengan skor blocker bukti issue PR dan checklist rilis.",
  },
  vi: {
    title: "Kiem tra GitHub - Bao cao san sang repo | JinMing Lab",
    description: "Tao bao cao rules first cho repo cong khai voi diem blocker bang chung issue PR va checklist release.",
  },
  th: {
    title: "ตรวจ GitHub - รายงานความพร้อม repo | JinMing Lab",
    description: "สร้างรายงาน rules first สำหรับ repo สาธารณะ พร้อมคะแนน blocker หลักฐาน issue PR และ release checklist",
  },
  tr: {
    title: "GitHub yayin denetimi - Repo hazirlik raporu | JinMing Lab",
    description: "Public GitHub repo icin skor engeller kanit issues PR ve release checklist iceren rule first rapor olustur.",
  },
  it: {
    title: "Audit GitHub - Report prontezza repo | JinMing Lab",
    description: "Genera un report rules first per repo pubblico con score blocchi evidenze issue PR e checklist release.",
  },
  nl: {
    title: "GitHub launch audit - Repo readiness report | JinMing Lab",
    description: "Maak een rule first rapport voor publieke GitHub repo met score blockers bewijs issues PR en release checklist.",
  },
  pl: {
    title: "GitHub audyt - raport gotowosci repo | JinMing Lab",
    description: "Utworz rule first raport dla publicznego GitHub repo z wynikiem blokerami evidence issues PR i release checklist.",
  },
};

type RouteToolTranslation = Partial<Pick<ToolDefinition, "title" | "shortTitle" | "description" | "promise" | "inputHint">>;

const routeToolTranslations: Partial<Record<InterfaceLanguage, Partial<Record<ToolDefinition["slug"], RouteToolTranslation>>>> = {
  zh: {
    "prompt-optimizer": {
      title: "AI 提示词优化器",
      shortTitle: "提示词",
      description: "把粗略需求整理成适合写代码 查资料 做产品的结构化提示词",
      promise: "角色 背景 任务 输出格式 约束 验收标准",
    },
    "code-explainer": {
      title: "代码解释器",
      shortTitle: "代码",
      description: "粘贴代码后获得作用 关键变量 风险和学习笔记",
      promise: "快速读懂代码并看见常见问题",
    },
    "bug-finder": {
      title: "Bug 定位助手",
      shortTitle: "Bug",
      description: "把报错和代码片段整理成原因 排查步骤和修复方向",
      promise: "原因清单 复现路径 修复模板 验证步骤",
    },
    "api-request-generator": {
      title: "API 请求生成器",
      shortTitle: "API",
      description: "根据接口地址 Header 和 Body 生成 curl fetch axios Python requests 示例",
      promise: "一份请求生成多种可复制格式",
    },
    "dev-utilities": {
      title: "JSON 正则 时间戳工具",
      shortTitle: "工具箱",
      description: "格式化 JSON 测试正则 转换时间戳",
      promise: "本地校验 快速转换 输出清晰",
    },
    "learning-roadmap": {
      title: "AI 编程学习路线",
      shortTitle: "路线",
      description: "选择方向后生成可执行的 30 天编程学习计划",
      promise: "每日任务 每周节点 最终项目",
    },
  },
  ja: {
    "prompt-optimizer": {
      title: "AI プロンプト最適化",
      shortTitle: "プロンプト",
      description: "粗い依頼をコード 調査 プロダクト向けの構造化プロンプトに整えます",
      promise: "役割 文脈 タスク 出力形式 制約 完了条件",
    },
    "code-explainer": {
      title: "コード解説",
      shortTitle: "コード",
      description: "コードを貼ると目的 主要変数 リスク 学習メモを整理します",
      promise: "読みやすい説明とバグの手がかり",
    },
    "bug-finder": {
      title: "バグ診断",
      shortTitle: "バグ",
      description: "エラーとコード片から原因 手順 修正方向を整理します",
      promise: "原因 再現 修正テンプレート 検証",
    },
    "api-request-generator": {
      title: "API リクエスト生成",
      shortTitle: "API",
      description: "endpoint headers body から curl fetch axios Python requests を生成します",
      promise: "同じリクエストを複数形式でコピー",
    },
    "dev-utilities": {
      title: "JSON 正規表現 時刻ツール",
      shortTitle: "ツール",
      description: "JSON 整形 Regex テスト timestamp 変換を一つにまとめます",
      promise: "ローカル検証 高速変換 コピーしやすい出力",
    },
    "learning-roadmap": {
      title: "AI コーディングロードマップ",
      shortTitle: "ロードマップ",
      description: "方向を選んで実用的な 30 日学習計画を作ります",
      promise: "日次タスク 週次マイルストーン 最終プロジェクト",
    },
  },
  ar: {
    "prompt-optimizer": {
      title: "محسن Prompt بالذكاء الاصطناعي",
      shortTitle: "Prompt",
      description: "يحول الطلب الخام إلى Prompt منظم للكود أو البحث أو عمل المنتج",
      promise: "دور وسياق ومهام وتنسيق إخراج وقيود ومعايير قبول",
    },
    "code-explainer": {
      title: "شارح الكود",
      shortTitle: "الكود",
      description: "الصق الكود لتحصل على الهدف والمتغيرات المهمة والمخاطر وملاحظات التعلم",
      promise: "شرح سريع مع إشارات أخطاء ونقاط تعلم",
    },
    "bug-finder": {
      title: "محدد الأخطاء",
      shortTitle: "Bug",
      description: "حوّل رسالة الخطأ ومقتطف الكود إلى أسباب وخطوات واتجاه إصلاح",
      promise: "قائمة أسباب ومسار إعادة إنتاج وقالب إصلاح",
    },
    "api-request-generator": {
      title: "مولد طلبات API",
      shortTitle: "API",
      description: "أنشئ أمثلة curl و fetch و axios و Python requests من endpoint و headers و body",
      promise: "طلب واحد بصيغ متعددة قابلة للنسخ",
    },
    "dev-utilities": {
      title: "أدوات JSON و Regex والوقت",
      shortTitle: "أدوات",
      description: "نسق JSON واختبر Regex وحول timestamp في لوحة واحدة",
      promise: "تحقق محلي وتحويل سريع ومخرجات واضحة",
    },
    "learning-roadmap": {
      title: "خطة تعلم البرمجة بالذكاء الاصطناعي",
      shortTitle: "خطة",
      description: "اختر اتجاها واحصل على خطة برمجة عملية لمدة 30 يوما",
      promise: "مهام يومية ومحطات أسبوعية ومشروع نهائي",
    },
  },
  de: {
    "prompt-optimizer": {
      title: "AI Prompt Optimizer",
      shortTitle: "Prompt",
      description: "Formt eine grobe Anfrage in einen strukturierten Prompt fuer Code Recherche oder Produktarbeit",
      promise: "Rolle Kontext Aufgaben Ausgabeformat Grenzen Akzeptanzkriterien",
    },
  },
};

function localizedRouteTool(tool: ToolDefinition, language: InterfaceLanguage) {
  if (tool.slug === "github-repo-analyzer") {
    const audit = auditRouteMeta[language];
    return {
      ...tool,
      title: audit.title.replace(" | JinMing Lab", ""),
      description: audit.description,
      promise: audit.description,
    };
  }

  return { ...tool, ...routeToolTranslations[language]?.[tool.slug] };
}

function toolJsonLd(tool: ToolDefinition, language: InterfaceLanguage) {
  const localizedTool = localizedRouteTool(tool, language);

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        name: localizedTool.title,
        url: toolUrl(tool),
        applicationCategory: "DeveloperApplication",
        operatingSystem: "Web",
        description: `${localizedTool.description}. ${localizedTool.promise}.`,
        featureList: localizedTool.useCases,
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
        },
        publisher: {
          "@type": "Organization",
          name: "JinMing Lab",
          url: "https://vantaapi.com",
        },
      },
      {
        "@type": "FAQPage",
        mainEntity: tool.faq.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: item.answer,
          },
        })),
      },
    ],
  };
}

export async function generateMetadata({ params, searchParams }: ToolRouteProps): Promise<Metadata> {
  const { slug } = await params;
  const query = searchParams ? await searchParams : {};
  const language = resolveInterfaceLanguage(query);
  const tool = getToolDefinition(slug);
  const localizedTool = localizedRouteTool(tool, language);
  const auditMeta = auditRouteMeta[language];
  const title = tool.slug === "github-repo-analyzer"
    ? auditMeta.title
    : `${localizedTool.title} - JinMing Lab`;
  const description = tool.slug === "github-repo-analyzer"
    ? auditMeta.description
    : `${localizedTool.description}. ${localizedTool.promise}.`;

  return {
    title,
    description,
    keywords: toolKeywords(localizedTool),
    alternates: {
      canonical: localizedHref(`/tools/${tool.slug}`, language),
      languages: localizedLanguageAlternates(`/tools/${tool.slug}`),
    },
    openGraph: {
      title,
      description,
      url: toolUrl(tool),
      siteName: "JinMing Lab",
      type: "website",
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
  };
}

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function ToolPage({ params, searchParams }: ToolRouteProps) {
  const { slug } = await params;
  const query = searchParams ? await searchParams : {};
  const initialLanguage = resolveInterfaceLanguage(query);
  const initialRepoUrl = firstParam(query.repo);
  const tool = getToolDefinition(slug);
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(toolJsonLd(tool, initialLanguage)) }}
      />
      <ToolWorkbench initialSlug={tool.slug} initialLanguage={initialLanguage} initialRepoUrl={initialRepoUrl} />
    </>
  );
}
