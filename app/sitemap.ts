import type { MetadataRoute } from "next";
import { interfaceLanguages, localizedHref } from "@/lib/language";
import { programmingLanguages } from "@/lib/programming-content";
import { toolDefinitions, type ToolSlug } from "@/lib/tool-definitions";

const siteUrl = "https://vantaapi.com";
const publicToolSlugs = new Set<ToolSlug>([
  "github-repo-analyzer",
  "prompt-optimizer",
  "bug-finder",
  "api-request-generator",
  "dev-utilities",
  "learning-roadmap",
]);

const multilingualBaseRoutes = [
  "",
  "/tools",
  "/programming",
  "/search",
];

const legalRoutes = [
  "/security",
  "/privacy",
  "/terms",
];

function sitemapLastModified() {
  const value = process.env.SITEMAP_LASTMOD || process.env.NEXT_PUBLIC_BUILD_TIME || "2026-05-08T00:00:00.000Z";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? new Date("2026-05-08T00:00:00.000Z") : date;
}

function absoluteUrl(path: string) {
  return `${siteUrl}${path}`;
}

function languageAlternates(path: string) {
  const languages: Record<string, string> = {
    "x-default": absoluteUrl(localizedHref(path, "en")),
  };

  for (const language of interfaceLanguages) {
    languages[language.htmlLang] = absoluteUrl(localizedHref(path, language.code));
  }

  return languages;
}

function routeEntry(route: string, now: Date, multilingual = true): MetadataRoute.Sitemap[number] {
  const path = route || "/";
  const entry: MetadataRoute.Sitemap[number] = {
    url: absoluteUrl(route),
    lastModified: now,
    changeFrequency: route ? "weekly" : "daily",
    priority: route ? 0.7 : 1,
  };

  if (multilingual) {
    entry.alternates = {
      languages: languageAlternates(path),
    };
  }

  return entry;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const now = sitemapLastModified();
  const toolRoutes = toolDefinitions
    .filter((tool) => publicToolSlugs.has(tool.slug))
    .map((tool) => `/tools/${tool.slug}`);
  const programmingRoutes = programmingLanguages.map((language) => `/programming/${language.slug}`);
  const multilingualRoutes = [...multilingualBaseRoutes, ...toolRoutes, ...programmingRoutes];

  return [
    ...multilingualRoutes.map((route) => routeEntry(route, now)),
    ...legalRoutes.map((route) => routeEntry(route, now, false)),
  ];
}
