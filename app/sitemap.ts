import type { MetadataRoute } from "next";
import { payloadFetch } from "@/lib/payload";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://alloypress-web.vercel.app";

const ALLOWED_CATEGORIES = new Set([
  "blogs",
  "reviews",
  "news",
  "alternatives",
  "comparisons",
]);

const STATIC_PAGES = [
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

type Category = {
  id: number | string;
  name?: string | null;
  slug?: string | null;
  updatedAt?: string | null;
};

type Post = {
  slug?: string | null;
  category?: Category | number | null;
  publishedAt?: string | null;
  updatedAt?: string | null;
  includeInSitemap?: boolean | null;
  _status?: "draft" | "published" | null;

  legacy?: {
    wordpressId?: number | string | null;
    wordpressModifiedAt?: string | null;
  } | null;
};

type Page = {
  slug?: string | null;
  status?: "draft" | "published" | null;
  updatedAt?: string | null;
};

type PayloadResponse<T> = {
  docs?: T[];
};

function url(path: string) {
  return `${SITE_URL.replace(/\/$/, "")}${path}`;
}

/**
 * Determine the "last modified" date to report in the sitemap.
 *
 * IMPORTANT: `updatedAt` is Payload's own tracked field — it changes every
 * time someone actually edits and saves the post in the CMS (e.g. Sep 12
 * edit). `legacy.wordpressModifiedAt` is a one-time historical snapshot
 * captured during the WordPress -> Payload migration and never changes
 * again after that, even if the post is edited many times afterwards.
 *
 * So `updatedAt` must be checked FIRST (it reflects real, ongoing edits).
 * `legacy.wordpressModifiedAt` is only used as a fallback for the rare
 * case where `updatedAt` is somehow missing.
 */
function postLastModified(post: Post) {
  return (
    post.updatedAt ||
    post.legacy?.wordpressModifiedAt ||
    post.publishedAt ||
    undefined
  );
}

async function getPosts(): Promise<Post[]> {
  try {
    const data = await payloadFetch<PayloadResponse<Post>>(
      "/posts?where[_status][equals]=published&limit=1000&depth=1&select[slug]=true&select[category]=true&select[publishedAt]=true&select[updatedAt]=true&select[includeInSitemap]=true&select[legacy.wordpressModifiedAt]=true",
      {
        cache: "no-store",
      }
    );

    return (data?.docs || []).filter(
      (post) =>
        Boolean(post.slug) &&
        post._status !== "draft" &&
        post.includeInSitemap !== false &&
        typeof post.category === "object" &&
        post.category !== null &&
        typeof post.category.slug === "string" &&
        ALLOWED_CATEGORIES.has(post.category.slug)
    );
  } catch (error) {
    console.error("Sitemap posts error:", error);
    return [];
  }
}

async function getPages(): Promise<Page[]> {
  try {
    const data = await payloadFetch<PayloadResponse<Page>>(
      "/pages?where[status][equals]=published&limit=1000&select[slug]=true&select[status]=true&select[updatedAt]=true",
      {
        cache: "no-store",
      }
    );

    return (data?.docs || []).filter(
      (page) => Boolean(page.slug) && page.status === "published"
    );
  } catch (error) {
    console.error("Sitemap pages error:", error);
    return [];
  }
}

async function getCategories(): Promise<Category[]> {
  try {
    const data = await payloadFetch<PayloadResponse<Category>>(
      "/categories?limit=1000&select[name]=true&select[slug]=true&select[updatedAt]=true",
      {
        cache: "no-store",
      }
    );

    return (data?.docs || []).filter(
      (category) =>
        typeof category.slug === "string" &&
        ALLOWED_CATEGORIES.has(category.slug)
    );
  } catch (error) {
    console.error("Sitemap categories error:", error);
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [posts, pages, categories] = await Promise.all([
    getPosts(),
    getPages(),
    getCategories(),
  ]);

  const entries = new Map<string, MetadataRoute.Sitemap[number]>();

  for (const path of STATIC_PAGES) {
    entries.set(path, {
      url: url(path),
    });
  }

  for (const page of pages) {
    if (!page.slug) continue;

    const path =
      page.slug === "home" || page.slug === "/" ? "/" : `/${page.slug}`;

    entries.set(path, {
      url: url(path),
      ...(page.updatedAt
        ? {
            lastModified: page.updatedAt,
          }
        : {}),
    });
  }

  for (const category of categories) {
    if (!category.slug) continue;

    const path = `/${category.slug}`;

    entries.set(path, {
      url: url(path),
      ...(category.updatedAt
        ? {
            lastModified: category.updatedAt,
          }
        : {}),
    });
  }

  for (const post of posts) {
    if (!post.slug || !post.category) continue;

    const categorySlug =
      typeof post.category === "object"
        ? post.category.slug
        : undefined;

    if (!categorySlug || !ALLOWED_CATEGORIES.has(categorySlug)) {
      continue;
    }

    const path = `/${categorySlug}/${post.slug}`;
    const lastModified = postLastModified(post);

    entries.set(path, {
      url: url(path),
      ...(lastModified
        ? {
            lastModified,
          }
        : {}),
    });
  }

  return Array.from(entries.values());
}