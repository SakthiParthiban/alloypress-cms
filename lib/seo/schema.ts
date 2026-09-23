import {
  LOGO_ID,
  ORGANIZATION_ID,
  SITE_DESCRIPTION,
  SITE_LOGO_URL,
  SITE_NAME,
  SITE_URL,
  WEBSITE_ID,
} from "./constants";

// ============================================================
// AlloyPress Schema.org builders
// ============================================================
// Keep JSON-LD construction centralized.
// Route files should only provide page/content data.
// ============================================================

export type BreadcrumbItem = {
  name: string;
  url: string;
};

export type ArticleSchemaInput = {
  url: string;
  title: string;
  description?: string | null;
  image?: string | null;
  publishedAt?: string | null;
  modifiedAt?: string | null;
  category?: string | null;
  authorName?: string | null;
  authorUrl?: string | null;
  wordCount?: number | null;
  // Defaults to "BlogPosting" — AlloyPress content is blog-style
  // editorial content, and BlogPosting is the more specific
  // Schema.org subtype of Article for this. Pass "Article"
  // explicitly only for non-blog editorial content.
  type?: "Article" | "BlogPosting";
};

export type ReviewSchemaInput = ArticleSchemaInput & {
  itemReviewed?: {
    type:
      | "SoftwareApplication"
      | "Product"
      | "Organization"
      | "Service"
      | "WebApplication";
    name: string;
    url?: string | null;
  } | null;
  ratingValue?: number | null;
  bestRating?: number | null;
  worstRating?: number | null;
};

export type WebPageSchemaInput = {
  url: string;
  name: string;
  description?: string | null;
  type?:
    | "WebPage"
    | "AboutPage"
    | "ContactPage"
    | "CollectionPage"
    | "ProfilePage";
};

function cleanText(value?: string | null): string | undefined {
  const cleaned = value
    ?.replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/\s+/g, " ")
    .trim();

  return cleaned || undefined;
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

// ============================================================
// ORGANIZATION
// ============================================================

export function createOrganizationSchema() {
  return {
    "@type": "Organization",
    "@id": ORGANIZATION_ID,
    name: SITE_NAME,
    url: SITE_URL,
    logo: {
      "@type": "ImageObject",
      "@id": LOGO_ID,
      url: SITE_LOGO_URL,
      contentUrl: SITE_LOGO_URL,
    },
  };
}

// ============================================================
// WEBSITE
// ============================================================
// Includes a SearchAction so Google can show a sitelinks
// searchbox for the site, since /search?q= already exists.
// ============================================================

export function createWebSiteSchema() {
  return {
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    url: SITE_URL,
    name: SITE_NAME,
    description: SITE_DESCRIPTION,
    publisher: {
      "@id": ORGANIZATION_ID,
    },
    inLanguage: "en-IN",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

// ============================================================
// WEB PAGE / ABOUT / CONTACT / COLLECTION / PROFILE
// ============================================================

export function createWebPageSchema(input: WebPageSchemaInput) {
  return {
    "@type": input.type || "WebPage",
    "@id": `${absoluteUrl(input.url) || SITE_URL}#webpage`,
    url: absoluteUrl(input.url) || SITE_URL,
    name: cleanText(input.name) || SITE_NAME,
    ...(cleanText(input.description)
      ? { description: cleanText(input.description) }
      : {}),
    // NOTE: no `isPartOf: { "@id": WEBSITE_ID }` here on purpose.
    // WebSite schema only exists on the Home page in this
    // architecture, so referencing WEBSITE_ID from any other page
    // is a dangling @id — that entity doesn't exist on the page
    // being validated. Only Home's own schema should point to it.
    publisher: {
      "@id": ORGANIZATION_ID,
    },
    inLanguage: "en-IN",
  };
}

// ============================================================
// COLLECTION PAGE
// ============================================================

export function createCollectionPageSchema(input: WebPageSchemaInput) {
  return createWebPageSchema({
    ...input,
    type: "CollectionPage",
  });
}

// ============================================================
// ARTICLE
// ============================================================
// FIX (2026-09): author now correctly resolves to a Person when
// a real CMS author name is supplied. Previously this always
// emitted "@type": "Organization" even when a real author name
// was passed in, which loses the E-E-A-T signal Google looks for
// on individually-bylined articles.
// ============================================================

export function createArticleSchema(input: ArticleSchemaInput) {
  const articleUrl = absoluteUrl(input.url) || SITE_URL;

  const article: Record<string, unknown> = {
    "@type": input.type || "BlogPosting",
    "@id": `${articleUrl}#article`,
    url: articleUrl,
    headline: cleanText(input.title) || SITE_NAME,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${articleUrl}#webpage`,
    },
    publisher: {
      "@id": ORGANIZATION_ID,
    },
  };

  const description = cleanText(input.description);

  if (description) {
    article.description = description;
  }

  const image = absoluteUrl(input.image);

  if (image) {
    // Article structured data should use a real representative
    // article image. Do not fall back to the site logo here.
    article.image = [image];
  }

  if (input.publishedAt) {
    article.datePublished = input.publishedAt;
  }

  if (input.modifiedAt) {
    article.dateModified = input.modifiedAt;
  }

  if (cleanText(input.category)) {
    article.articleSection = cleanText(input.category);
  }

  if (
    typeof input.wordCount === "number" &&
    Number.isFinite(input.wordCount)
  ) {
    article.wordCount = input.wordCount;
  }

  const realAuthorName = cleanText(input.authorName);

  article.author = realAuthorName
    ? {
        "@type": "Person",
        name: realAuthorName,
        ...(absoluteUrl(input.authorUrl)
          ? { url: absoluteUrl(input.authorUrl) }
          : {}),
      }
    : {
        "@type": "Organization",
        "@id": ORGANIZATION_ID,
        name: SITE_NAME,
      };

  return article;
}

// ============================================================
// REVIEW ARTICLE
// ============================================================
// Emits ["BlogPosting", "Review"] — a review post IS a blog
// post, plus the Review-specific fields (itemReviewed,
// reviewRating). Test in the Rich Results Test
// (search.google.com/test/rich-results); if the star-rating
// snippet doesn't show, fall back to
// createStandaloneReviewSchema() below.
// ============================================================

export function createReviewSchema(input: ReviewSchemaInput) {
  const reviewArticle = createArticleSchema(input);

  const schema = {
    ...reviewArticle,
    "@type": [input.type || "BlogPosting", "Review"],
  } as Record<string, unknown>;

  applyReviewFields(schema, input);

  return schema;
}

// ============================================================
// STANDALONE REVIEW (safer for star-rating rich results)
// ============================================================

export function createStandaloneReviewSchema(input: ReviewSchemaInput) {
  const articleUrl = absoluteUrl(input.url) || SITE_URL;
  const realAuthorName = cleanText(input.authorName);

  const schema: Record<string, unknown> = {
    "@type": "Review",
    "@id": `${articleUrl}#review`,
    url: articleUrl,
    name: cleanText(input.title) || SITE_NAME,
    author: realAuthorName
      ? { "@type": "Person", name: realAuthorName }
      : { "@type": "Organization", "@id": ORGANIZATION_ID, name: SITE_NAME },
  };

  const description = cleanText(input.description);
  if (description) schema.reviewBody = description;

  if (input.publishedAt) schema.datePublished = input.publishedAt;

  applyReviewFields(schema, input);

  return schema;
}

function applyReviewFields(
  schema: Record<string, unknown>,
  input: ReviewSchemaInput,
) {
  if (input.itemReviewed) {
    schema.itemReviewed = {
      "@type": input.itemReviewed.type,
      name: cleanText(input.itemReviewed.name) || "Reviewed item",
      ...(absoluteUrl(input.itemReviewed.url)
        ? { url: absoluteUrl(input.itemReviewed.url) }
        : {}),
    };
  }

  if (
    typeof input.ratingValue === "number" &&
    Number.isFinite(input.ratingValue)
  ) {
    schema.reviewRating = {
      "@type": "Rating",
      ratingValue: input.ratingValue,
      bestRating: input.bestRating ?? 5,
      worstRating: input.worstRating ?? 1,
    };
  }
}

// ============================================================
// BREADCRUMB
// ============================================================

export function createBreadcrumbSchema(items: BreadcrumbItem[]) {
  const listItems = items
    .map((item, index) => {
      const name = cleanText(item.name);
      const url = absoluteUrl(item.url);

      if (!name || !url) {
        return null;
      }

      return {
        "@type": "ListItem",
        position: index + 1,
        name,
        item: url,
      };
    })
    .filter(
      (
        item,
      ): item is {
        "@type": "ListItem";
        position: number;
        name: string;
        item: string;
      } => item !== null,
    );

  return {
    "@type": "BreadcrumbList",
    itemListElement: listItems,
  };
}

// ============================================================
// FAQ PAGE
// ============================================================
// Use only when the FAQ is genuinely visible on the page.
// This is semantic structured data; do not treat it as a
// guaranteed Google FAQ rich-result mechanism (Google restricted
// FAQ rich results to a small set of authoritative sites in 2023).
// ============================================================

export type FAQItem = {
  question: string;
  answer: string;
};

export function createFAQSchema(items: FAQItem[]) {
  return {
    "@type": "FAQPage",
    mainEntity: items
      .map((item) => {
        const question = cleanText(item.question);
        const answer = cleanText(item.answer);

        if (!question || !answer) {
          return null;
        }

        return {
          "@type": "Question",
          name: question,
          acceptedAnswer: {
            "@type": "Answer",
            text: answer,
          },
        };
      })
      .filter(Boolean),
  };
}