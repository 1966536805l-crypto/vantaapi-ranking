import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/english/word-typing"],
      disallow: [
        "/api/",
        "/admin/",
        "/dashboard",
        "/progress",
        "/wrong",
        "/today",
        "/english",
        "/cpp",
        "/learn",
        "/languages",
        "/mistakes",
        "/status",
        "/login",
        "/register",
        "/games",
        "/projects",
        "/questions",
        "/report",
        "/__crawler-trap",
        "/api/__crawler-trap",
      ],
    },
    sitemap: "https://vantaapi.com/sitemap.xml",
  };
}
