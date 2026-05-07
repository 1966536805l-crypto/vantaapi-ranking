import type { MetadataRoute } from "next";
import { programmingLanguages } from "@/lib/programming-content";
import { toolDefinitions } from "@/lib/tool-definitions";
import { worldLanguages } from "@/lib/world-language-content";

const baseRoutes = [
  "",
  "/english",
  "/english/typing",
  "/english/vocabulary",
  "/english/grammar",
  "/english/reading",
  "/cpp",
  "/cpp/basics",
  "/cpp/oop",
  "/cpp/stl",
  "/cpp/algorithms",
  "/languages",
  "/programming",
  "/search",
  "/today",
  "/tools",
  "/privacy",
  "/terms",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const routes = [
    ...baseRoutes,
    ...toolDefinitions.map((tool) => `/tools/${tool.slug}`),
    ...worldLanguages.map((language) => `/languages/${language.slug}`),
    ...programmingLanguages.map((language) => `/programming/${language.slug}`),
  ];

  return routes.map((route) => ({
    url: `https://vantaapi.com${route}`,
    lastModified: now,
    changeFrequency: route ? "weekly" : "daily",
    priority: route ? 0.7 : 1,
  }));
}
