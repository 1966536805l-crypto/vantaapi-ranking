import type { Metadata } from "next";
import ToolWorkbench from "@/components/tools/ToolWorkbench";
import { getToolDefinition, toolDefinitions, type ToolDefinition } from "@/lib/tool-definitions";

type ToolRouteProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return toolDefinitions.map((tool) => ({ slug: tool.slug }));
}

function toolUrl(tool: ToolDefinition) {
  return `https://vantaapi.com/tools/${tool.slug}`;
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
    title: `${tool.title} - JinMing Lab`,
    description: `${tool.description}. ${tool.promise}.`,
    alternates: {
      canonical: `/tools/${tool.slug}`,
    },
    openGraph: {
      title: `${tool.title} - JinMing Lab`,
      description: `${tool.description}. ${tool.promise}.`,
      url: toolUrl(tool),
      siteName: "JinMing Lab",
      type: "website",
    },
    twitter: {
      card: "summary",
      title: `${tool.title} - JinMing Lab`,
      description: `${tool.description}. ${tool.promise}.`,
    },
  };
}

export default async function ToolPage({ params }: ToolRouteProps) {
  const { slug } = await params;
  const tool = getToolDefinition(slug);
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(toolJsonLd(tool)) }}
      />
      <ToolWorkbench initialSlug={tool.slug} />
    </>
  );
}
