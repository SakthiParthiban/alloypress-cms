import type { MetadataRoute } from "next";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  "https://alloypress-web.vercel.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
          "/_next/",
        ],
        disallow: [
          "/api/",
          "/admin/",
          
          "/*?*preview=*",
          "/*?*_status=draft",
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}