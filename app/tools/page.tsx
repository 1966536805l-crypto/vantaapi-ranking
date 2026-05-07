import type { Metadata } from "next";
import ToolWorkbench from "@/components/tools/ToolWorkbench";
import { toolDefinitions } from "@/lib/tool-definitions";

export const metadata: Metadata = {
  title: "GitHub Launch Audit Tools - JinMing Lab",
  description:
    "Start with a GitHub launch-readiness audit, then use focused developer utilities for prompts, API requests, JSON, regex, timestamps, and coding roadmaps.",
  alternates: {
    canonical: "/tools",
  },
  openGraph: {
    title: "GitHub Launch Audit Tools - JinMing Lab",
    description:
      "GitHub launch audit prompt optimizer bug finder API request generator JSON regex timestamp utilities and coding roadmap tools.",
    url: "https://vantaapi.com/tools",
    siteName: "JinMing Lab",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "GitHub Launch Audit and AI Tools - JinMing Lab",
    description:
      "GitHub launch audit prompt optimizer bug finder API request generator JSON regex timestamp utilities and coding roadmap tools.",
  },
};

export default function ToolsPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "JinMing Lab AI Tools",
    itemListElement: toolDefinitions.map((tool, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: tool.title,
      url: `https://vantaapi.com/tools/${tool.slug}`,
      description: tool.description,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ToolWorkbench initialSlug="github-repo-analyzer" />
    </>
  );
}
