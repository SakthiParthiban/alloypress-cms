const trimTrailingSlashes = (value: string) =>
  value.replace(/\/+$/, "");

// ------------------------------------------------------------
// Site identity
// ------------------------------------------------------------

export const SITE_URL = trimTrailingSlashes(
  process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    "https://alloypress.com",
);

export const SITE_NAME = "AlloyPress";

export const SITE_DESCRIPTION =
  "Practical AI guides, tutorials, explainers, reviews and useful knowledge from AlloyPress.";

export const SITE_LOCALE = "en_IN";

export const SITE_LANGUAGE = "en";

// ------------------------------------------------------------
// Shared Schema.org entity IDs
// ------------------------------------------------------------
// Re-use these IDs across all JSON-LD graphs so Google can
// understand that the same Organization/Site entities are being
// referenced throughout the website.
// ------------------------------------------------------------

export const ORGANIZATION_ID = `${SITE_URL}/#organization`;

export const WEBSITE_ID = `${SITE_URL}/#website`;

export const LOGO_ID = `${SITE_URL}/#logo`;

// ------------------------------------------------------------
// Image configuration
// ------------------------------------------------------------
// These should point to real public URLs on alloypress.com.
// Environment variables let production/staging use different
// assets without changing source code.
// ------------------------------------------------------------

export const SITE_LOGO_URL =
  process.env.NEXT_PUBLIC_SITE_LOGO_URL?.trim() ||
  `${SITE_URL}/ap-logo.png`;

export const DEFAULT_OG_IMAGE_URL =
  process.env.NEXT_PUBLIC_DEFAULT_OG_IMAGE_URL?.trim() ||
  `${SITE_URL}/ap-icon.png`;

// ------------------------------------------------------------
// Content categories
// ------------------------------------------------------------
// These match the dynamic article route:
// /[category]/[slug]
// ------------------------------------------------------------

export const ARTICLE_CATEGORIES = [
  "blogs",
  "reviews",
  "news",
  "alternatives",
  "comparisons",
] as const;

export type ArticleCategory =
  (typeof ARTICLE_CATEGORIES)[number];

export const CATEGORY_LABELS: Record<
  ArticleCategory,
  string
> = {
  blogs: "Blogs",
  reviews: "Reviews",
  news: "News",
  alternatives: "Alternatives",
  comparisons: "Comparisons",
};

export const isArticleCategory = (
  value: string,
): value is ArticleCategory =>
  ARTICLE_CATEGORIES.includes(
    value as ArticleCategory,
  );

// ------------------------------------------------------------
// Category listing URLs
// ------------------------------------------------------------

export const CATEGORY_PATHS = {
  blogs: "/blogs",
  reviews: "/reviews",
  news: "/news",
  alternatives: "/alternatives",
  comparisons: "/comparisons",
} as const;