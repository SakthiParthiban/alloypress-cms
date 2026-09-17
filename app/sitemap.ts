import type { MetadataRoute } from "next";

import { payloadFetch } from "@/lib/payload";
import type { PayloadResponse, Post } from "@/lib/cms";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://alloypress.com";

const STATIC_ROUTES = [
  "/",
  "/blogs",
  "/reviews",
  "/news",
  "/alternatives",
  "/comparisons",
  "/about",
  "/contact",
  "/inclusion",
  "/review-tool",
  "/privacy-policy",
  "/terms",
  "/do-not-sell",
];

const ALLOWED_CATEGORIES = new Set([
  "blogs",
  "reviews",
  "news",
  "alternatives",
  "comparisons",
]);

type SitemapPost = Post & {
  category?: {
    id?: string | number;
    name?: string | null;
    slug?: string | null;
  } | number | null;
};

async function getPublishedPosts(): Promise<SitemapPost[]> {
  const params = new URLSearchParams();

  params.set("where[_status][equals]", "published");
  params.set("limit", "1000");
  params.set("depth", "1");

  const data = await payloadFetch<
    PayloadResponse<SitemapPost>
  >(`/posts?${params.toString()}`, {
    next: {
      revalidate: 60,
      tags: ["sitemap", "posts"],
    },
  });

  return data?.docs ?? [];
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticUrls: MetadataRoute.Sitemap = STATIC_ROUTES.map(
    (route) => ({
      url: `${SITE_URL}${route}`,
      lastModified: now,
    }),
  );

  let posts: SitemapPost[] = [];

  try {
    posts = await getPublishedPosts();
  } catch (error) {
    console.error(
      "[sitemap] Failed to fetch posts:",
      error,
    );
  }

  const postUrls: MetadataRoute.Sitemap = posts
    .filter((post) => {
      if (!post.slug) return false;

      if (
        !post.category ||
        typeof post.category === "number"
      ) {
        return false;
      }

      return Boolean(
        post.category.slug &&
          ALLOWED_CATEGORIES.has(
            post.category.slug,
          ),
      );
    })
    .map((post) => {
      const category = post.category as {
        slug?: string | null;
      };

      return {
        url: `${SITE_URL}/${category.slug}/${post.slug}`,
        lastModified:
          post.updatedAt ||
          post.publishedAt ||
          now,
      };
    });

  return [
    ...staticUrls,
    ...postUrls,
  ];
}