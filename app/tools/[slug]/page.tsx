import type { Metadata } from "next";
import ToolWorkbench from "@/components/tools/ToolWorkbench";
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

export async function generateMetadata({ params }: ToolRouteProps): Promise<Metadata> {
  const { slug } = await params;
  const tool = getToolDefinition(slug);
  return {
    title: tool.slug === "github-repo-analyzer"
      ? "GitHub Launch Audit - Repo Readiness Report | JinMing Lab"
      : `${tool.title} - JinMing Lab`,
    description: tool.slug === "github-repo-analyzer"
      ? "Generate a rules-first launch-readiness report for a public GitHub repository with scorecard, blockers, evidence, GitHub issue drafts, PR description, and release checklist."
      : `${tool.description}. ${tool.promise}.`,
    keywords: toolKeywords(tool),
    alternates: {
      canonical: `/tools/${tool.slug}`,
    },
    openGraph: {
      title: tool.slug === "github-repo-analyzer" ? "GitHub Launch Audit - JinMing Lab" : `${tool.title} - JinMing Lab`,
      description: tool.slug === "github-repo-analyzer"
        ? "Audit a public GitHub repository with deterministic checks for README, env, CI, deploy, security, issues, PR copy, and release checklist."
        : `${tool.description}. ${tool.promise}.`,
      url: toolUrl(tool),
      siteName: "JinMing Lab",
      type: "website",
    },
    twitter: {
      card: "summary",
      title: tool.slug === "github-repo-analyzer" ? "GitHub Launch Audit - JinMing Lab" : `${tool.title} - JinMing Lab`,
      description: tool.slug === "github-repo-analyzer"
        ? "Paste a GitHub repo and get rules-first launch checks with evidence, blockers, and PR-ready output."
        : `${tool.description}. ${tool.promise}.`,
    },
  };
}

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function ToolPage({ params, searchParams }: ToolRouteProps) {
  const { slug } = await params;
  const query = searchParams ? await searchParams : {};
  const initialLanguage = firstParam(query.lang) === "zh" ? "zh" : "en";
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
