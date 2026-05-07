import type { Metadata } from "next";
import ToolWorkbench from "@/components/tools/ToolWorkbench";
import { toolDefinitions } from "@/lib/tool-definitions";

export const metadata: Metadata = {
  title: "AI Tools - VantaAPI",
  description:
    "GitHub launch pack prompt optimizer bug finder API request generator JSON regex timestamp utilities and coding roadmap tools.",
  alternates: {
    canonical: "/tools",
  },
  openGraph: {
    title: "AI Tools - VantaAPI",
    description:
      "GitHub launch pack prompt optimizer bug finder API request generator JSON regex timestamp utilities and coding roadmap tools.",
    url: "https://vantaapi.com/tools",
    siteName: "VantaAPI",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "AI Tools - VantaAPI",
    description:
      "GitHub launch pack prompt optimizer bug finder API request generator JSON regex timestamp utilities and coding roadmap tools.",
  },
};

export default function ToolsPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "VantaAPI AI Tools",
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
      <ToolWorkbench initialSlug="prompt-optimizer" />
    </>
  );
}
