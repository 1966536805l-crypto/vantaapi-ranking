import type { MetadataRoute } from "next";

const baseRoutes = [
  "",
  "/today",
  "/tools",
  "/tools/github-repo-analyzer",
  "/tools/prompt-optimizer",
  "/tools/api-request-generator",
  "/programming",
  "/search",
  "/privacy",
  "/terms",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const routes = baseRoutes;

  return routes.map((route) => ({
    url: `https://vantaapi.com${route}`,
    lastModified: now,
    changeFrequency: route ? "weekly" : "daily",
    priority: route ? 0.7 : 1,
  }));
}
