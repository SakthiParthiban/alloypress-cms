import type { Metadata } from "next";

import {
  DEFAULT_OG_IMAGE_URL,
  SITE_NAME,
  SITE_URL,
} from "./constants";

// ============================================================
// AlloyPress Dynamic Metadata Builder
// ============================================================
// Purpose:
// - Build metadata from live CMS content.
// - Keep canonical / Open Graph / Twitter / robots consistent.
// - Apply sensible fallbacks when optional SEO fields are empty.
// - Keep route files focused on fetching content, not SEO logic.
// ============================================================

export type SeoRobotsInput = {
  index?: boolean;
  follow?: boolean;
  noArchive?: boolean;
  noImageIndex?: boolean;
  noSnippet?: boolean;
};

export type BuildArticleMetadataInput = {
  title?: string | null;
  description?: string | null;
  canonicalPath?: string | null;
  canonicalUrl?: string | null;
  imageUrl?: string | null;
  imageAlt?: string | null;
  publishedTime?: string | null;
  modifiedTime?: string | null;
  robots?: SeoRobotsInput | null;

  openGraph?: {
    title?: string | null;
    description?: string | null;
    imageUrl?: string | null;
  } | null;

  twitter?: {
    title?: string | null;
    description?: string | null;
    imageUrl?: string | null;
  } | null;
};

// ------------------------------------------------------------
// Helpers
// ------------------------------------------------------------

function cleanText(value?: string | null): string {
  if (!value) return "";

  return value
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/\s+/g, " ")
    .trim();
}

function absoluteUrl(value?: string | null): string | undefined {
  const input = value?.trim();

  if (!input) return undefined;

  try {
    return new URL(input, `${SITE_URL}/`).toString();
  } catch {
    return undefined;
  }
}

function buildCanonical(input: BuildArticleMetadataInput): string {
  const cmsCanonical = absoluteUrl(input.canonicalUrl);

  if (cmsCanonical) {
    return cmsCanonical;
  }

  const path = input.canonicalPath?.trim();

  if (!path) {
    return SITE_URL;
  }

  return absoluteUrl(path) || SITE_URL;
}

function buildRobots(input?: SeoRobotsInput | null): Metadata["robots"] {
  return {
    index: input?.index !== false,
    follow: input?.follow !== false,
    noarchive: input?.noArchive === true,
    noimageindex: input?.noImageIndex === true,
    nosnippet: input?.noSnippet === true,
  };
}

// ------------------------------------------------------------
// Main builder
// ------------------------------------------------------------

export type BuildPageMetadataInput = {
  title?: string | null;
  description?: string | null;

  canonicalPath?: string | null;
  canonicalUrl?: string | null;

  imageUrl?: string | null;
  imageAlt?: string | null;

  robots?: SeoRobotsInput | null;

  openGraph?: {
    title?: string | null;
    description?: string | null;
    imageUrl?: string | null;
  } | null;

  twitter?: {
    title?: string | null;
    description?: string | null;
    imageUrl?: string | null;
  } | null;
};

export function buildPageMetadata(
  input: BuildPageMetadataInput,
): Metadata {
  const title =
    cleanText(input.title) || SITE_NAME;

  const description = cleanText(
    input.description,
  );

  const canonical = buildCanonical({
    ...input,
    title,
    description,
  });

  const primaryImage =
    absoluteUrl(input.imageUrl) ||
    DEFAULT_OG_IMAGE_URL;

  const ogImage =
    absoluteUrl(input.openGraph?.imageUrl) ||
    primaryImage;

  const twitterImage =
    absoluteUrl(input.twitter?.imageUrl) ||
    ogImage;

  return {
    title,

    ...(description
      ? { description }
      : {}),

    alternates: {
      canonical,
    },

    robots: buildRobots(input.robots),

    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      locale: "en_IN",
      title:
        cleanText(
          input.openGraph?.title,
        ) || title,

      ...(cleanText(
        input.openGraph?.description,
      )
        ? {
            description: cleanText(
              input.openGraph?.description,
            ),
          }
        : {
            ...(description
              ? { description }
              : {}),
          }),

      url: canonical,

      images: [
        {
          url: ogImage,
          alt:
            cleanText(input.imageAlt) ||
            title,
        },
      ],
    },

    twitter: {
      card: "summary_large_image",

      title:
        cleanText(
          input.twitter?.title,
        ) || title,

      ...(cleanText(
        input.twitter?.description,
      )
        ? {
            description: cleanText(
              input.twitter?.description,
            ),
          }
        : {
            ...(description
              ? { description }
              : {}),
          }),

      images: [twitterImage],
    },
  };
}

export function buildArticleMetadata(
  input: BuildArticleMetadataInput,
): Metadata {
  const title =
    cleanText(input.title) || SITE_NAME;

  const description = cleanText(
    input.description,
  );

  const canonical = buildCanonical(input);

  const primaryImage =
    absoluteUrl(input.imageUrl) ||
    DEFAULT_OG_IMAGE_URL;

  const ogImage =
    absoluteUrl(input.openGraph?.imageUrl) ||
    primaryImage;

  const twitterImage =
    absoluteUrl(input.twitter?.imageUrl) ||
    ogImage;

  const ogTitle =
    cleanText(input.openGraph?.title) ||
    title;

  const ogDescription =
    cleanText(input.openGraph?.description) ||
    description;

  const twitterTitle =
    cleanText(input.twitter?.title) ||
    title;

  const twitterDescription =
    cleanText(input.twitter?.description) ||
    description;

  const imageAlt =
    cleanText(input.imageAlt) ||
    title;

  return {
    title,

    ...(description
      ? { description }
      : {}),

    alternates: {
      canonical,
    },

    robots: buildRobots(input.robots),

    openGraph: {
      type: "article",
      siteName: SITE_NAME,
      locale: "en_IN",
      title: ogTitle,
      ...(ogDescription
        ? { description: ogDescription }
        : {}),
      url: canonical,
      ...(input.publishedTime
        ? { publishedTime: input.publishedTime }
        : {}),
      ...(input.modifiedTime
        ? { modifiedTime: input.modifiedTime }
        : {}),
      images: [
        {
          url: ogImage,
          alt: imageAlt,
        },
      ],
    },

    twitter: {
      card: "summary_large_image",
      title: twitterTitle,
      ...(twitterDescription
        ? { description: twitterDescription }
        : {}),
      images: [twitterImage],
    },
  };
}