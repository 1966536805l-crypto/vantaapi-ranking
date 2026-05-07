import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/"],
      disallow: [
        "/api/",
        "/admin/",
        "/dashboard",
        "/progress",
        "/wrong",
        "/login",
        "/register",
        "/__crawler-trap",
        "/api/__crawler-trap",
      ],
    },
    sitemap: "https://vantaapi.com/sitemap.xml",
  };
}
