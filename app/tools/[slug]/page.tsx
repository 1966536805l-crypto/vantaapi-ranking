import type { Metadata } from "next";
import ToolWorkbench from "@/components/tools/ToolWorkbench";
import { resolveInterfaceLanguage, type InterfaceLanguage } from "@/lib/language";
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

function toolJsonLd(tool: ToolDefinition) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        name: tool.title,
        url: toolUrl(tool),
        applicationCategory: "DeveloperApplication",
        operatingSystem: "Web",
        description: `${tool.description}. ${tool.promise}.`,
        featureList: tool.useCases,
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
  const auditMeta = auditRouteMeta[language];
  const title = tool.slug === "github-repo-analyzer"
    ? auditMeta.title
    : `${tool.title} - JinMing Lab`;
  const description = tool.slug === "github-repo-analyzer"
    ? auditMeta.description
    : `${tool.description}. ${tool.promise}.`;

  return {
    title,
    description,
    keywords: toolKeywords(tool),
    alternates: {
      canonical: `/tools/${tool.slug}`,
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(toolJsonLd(tool)) }}
      />
      <ToolWorkbench initialSlug={tool.slug} initialLanguage={initialLanguage} initialRepoUrl={initialRepoUrl} />
    </>
  );
}
