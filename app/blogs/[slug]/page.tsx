import type { Metadata } from "next";
import { cache } from "react";
import BlogPostView from "@/components/blogs/BlogPostView";
import BlogLivePreview from "@/components/blogs/BlogLivePreview";
import { payloadFetch } from "@/lib/payload";
import {
  type Post,
  type PayloadResponse,
} from "@/lib/cms";

// ============================================================
// BREADCRUMB CONSTANTS
// ============================================================

const CATEGORY_SLUG = "blogs";
const CATEGORY_LABEL = "Blogs";

type Params = Promise<{ slug: string }>;

// ============================================================
// POST META TYPES
// ============================================================

type RobotsMeta = {
  index?: boolean;
  follow?: boolean;
  noArchive?: boolean;
  noImageIndex?: boolean;
  noSnippet?: boolean;
};

type OpenGraphMeta = {
  title?: string;
  description?: string;
  image?: unknown;
};

type TwitterMeta = {
  title?: string;
  description?: string;
};

type PostMeta = {
  title?: string;
  description?: string;
  canonicalURL?: string;
  robots?: RobotsMeta;
  image?: unknown;
  openGraph?: OpenGraphMeta;
  twitter?: TwitterMeta;
};

type PostWithMeta = Post & {
  meta?: PostMeta;
};

// ============================================================
// MEDIA TYPES
// ============================================================

type Media = {
  id: number | string;
  url?: string | null;
  filename?: string | null;
  width?: number | null;
  height?: number | null;
  mimeType?: string | null;
  alt?: string | null;
};

type MediaResponse = PayloadResponse<Media>;

// ============================================================
// MEDIA HELPERS
// ============================================================

function mediaUrl(value: unknown): string | null {
  if (
    typeof value === "object" &&
    value !== null &&
    "url" in value
  ) {
    const url = (value as { url?: unknown }).url;

    return typeof url === "string" ? url : null;
  }

  return null;
}

function imageUrl(value: unknown): string | null {
  if (
    typeof value === "object" &&
    value !== null &&
    "url" in value
  ) {
    const url = (value as { url?: unknown }).url;

    return typeof url === "string" ? url : null;
  }

  if (typeof value === "number") {
    const cmsUrl =
      process.env.PAYLOAD_API_URL ||
      "http://localhost:3000/api";

    return `${cmsUrl.replace(/\/api$/, "")}/api/media/${value}`;
  }

  return null;
}

// ============================================================
// HYDRATE NESTED LEXICAL MEDIA
// ============================================================

async function hydrateContentMedia(
  content: unknown,
): Promise<unknown> {
  if (
    typeof content !== "object" ||
    content === null
  ) {
    return content;
  }

  const root = (
    content as {
      root?: {
        children?: unknown[];
      };
    }
  ).root;

  if (!root || !Array.isArray(root.children)) {
    return content;
  }

  const ids = new Set<number>();

  function collect(node: unknown): void {
    if (
      typeof node !== "object" ||
      node === null
    ) {
      return;
    }

    const current = node as {
      type?: unknown;
      value?: unknown;
      fields?: Record<string, unknown>;
      children?: unknown[];
    };

    // Lexical upload node
    if (
      current.type === "upload" &&
      typeof current.value === "number"
    ) {
      ids.add(current.value);
    }

    // Custom blocks
    if (current.type === "block") {
      const fields = current.fields || {};

      if (
        fields.blockType === "videoFile" &&
        typeof fields.video === "number"
      ) {
        ids.add(fields.video);
      }

      if (
        fields.blockType === "audio" &&
        typeof fields.audio === "number"
      ) {
        ids.add(fields.audio);
      }
    }

    // Nested children
    if (Array.isArray(current.children)) {
      current.children.forEach(collect);
    }
  }

  root.children.forEach(collect);

  if (!ids.size) {
    return content;
  }

  // ==========================================================
  // FETCH ALL MEDIA IN ONE REQUEST
  // ==========================================================

  const idList = Array.from(ids).join(",");

  const mediaData = await payloadFetch<MediaResponse>(
    `/media?where[id][in]=${encodeURIComponent(idList)}&limit=${ids.size}&depth=0&select[id]=true&select[url]=true&select[filename]=true&select[width]=true&select[height]=true&select[mimeType]=true&select[alt]=true`,
    {
      next: {
        revalidate: 300,
        tags: Array.from(ids).map((id) => `media:${id}`),
      },
    },
  );

  const mediaMap = new Map<number, Media>();

  for (const media of mediaData?.docs ?? []) {
    const numericId = Number(media.id);

    if (Number.isFinite(numericId)) {
      mediaMap.set(numericId, media);
    }
  }

  // ==========================================================
  // REPLACE MEDIA IDS
  // ==========================================================

  function replace(node: unknown): unknown {
    if (
      typeof node !== "object" ||
      node === null
    ) {
      return node;
    }

    const current = node as Record<string, unknown>;

    const next: Record<string, unknown> = {
      ...current,
    };

    // Lexical upload
    if (
      next.type === "upload" &&
      typeof next.value === "number"
    ) {
      next.value =
        mediaMap.get(next.value) ??
        next.value;
    }

    // Custom blocks
    if (next.type === "block") {
      const fields =
        typeof next.fields === "object" &&
          next.fields !== null
          ? {
            ...(next.fields as Record<string, unknown>),
          }
          : {};

      if (
        fields.blockType === "videoFile" &&
        typeof fields.video === "number"
      ) {
        fields.video =
          mediaMap.get(fields.video) ??
          fields.video;
      }

      if (
        fields.blockType === "audio" &&
        typeof fields.audio === "number"
      ) {
        fields.audio =
          mediaMap.get(fields.audio) ??
          fields.audio;
      }

      next.fields = fields;
    }

    // Nested children
    if (Array.isArray(next.children)) {
      next.children = next.children.map(replace);
    }

    return next;
  }

  return {
    ...(content as Record<string, unknown>),
    root: {
      ...root,
      children: root.children.map(replace),
    },
  };
}

// ============================================================
// GET POST BY SLUG
// ============================================================

const getPost = cache(
  async (
    slug: string,
  ): Promise<PostWithMeta | null> => {
    const params = new URLSearchParams();

    params.set(
      "where[slug][equals]",
      slug,
    );

    params.set(
      "where[_status][equals]",
      "published",
    );

    params.set("limit", "1");
    params.set("depth", "1");

    params.set("select[id]", "true");
    params.set("select[title]", "true");
    params.set("select[slug]", "true");
    params.set("select[content]", "true");
    params.set("select[excerpt]", "true");
    params.set("select[featuredImage]", "true");
    params.set("select[category]", "true");
    params.set("select[tags]", "true");
    params.set("select[publishedAt]", "true");
    params.set("select[updatedAt]", "true");
    params.set("select[legacy]", "true");
    params.set("select[meta]", "true");

    const data =
      await payloadFetch<
        PayloadResponse<PostWithMeta>
      >(
        `/posts?${params.toString()}`,
        {
          next: {
            revalidate: 300,
            tags: [`post:${slug}`],
          },
        },
      );

    const post =
      data?.docs?.[0] ?? null;

    if (!post) {
      return null;
    }

    const hydratedContent =
      await hydrateContentMedia(
        post.content,
      );

    return {
      ...post,
      content:
        hydratedContent as Post["content"],
    };
  },
);

// ============================================================
// GET RELATED POSTS
// ============================================================

async function getRelatedPosts(
  categoryId: string | number,
  currentPostId: string,
): Promise<Post[]> {
  const params = new URLSearchParams();

  params.set(
    "where[_status][equals]",
    "published",
  );

  params.set(
    "where[category][equals]",
    String(categoryId),
  );

  params.set(
    "sort",
    "-publishedAt",
  );

  params.set("limit", "3");

  params.set("depth", "1");

  params.set(
    "select[title]",
    "true",
  );

  params.set(
    "select[slug]",
    "true",
  );

  params.set(
    "select[featuredImage]",
    "true",
  );

  params.set(
    "select[category]",
    "true",
  );

  const data =
    await payloadFetch<
      PayloadResponse<Post>
    >(
      `/posts?${params.toString()}`,
      {
        next: {
          revalidate: 300,
          tags: [
            `category:${String(categoryId)}`,
            "posts",
          ],
        },
      },
    );

  return (data?.docs ?? [])
    .filter(
      (item) =>
        item.id !== currentPostId,
    )
    .filter(
      (item) =>
        !/^Untitled WordPress Post/i.test(
          item.title || "",
        ),
    )
    .slice(0, 3);
}

// ============================================================
// METADATA
// ============================================================

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { slug } = await params;

  const post = await getPost(slug);

  if (!post) {
    return {
      title:
        "Article Not Found | AlloyPress",
    };
  }

  const meta = post.meta ?? {};

  const title =
    meta.title ||
    post.title ||
    "AlloyPress";

  const description =
    meta.description ||
    post.excerpt ||
    "";

  const ogImage =
    mediaUrl(meta.openGraph?.image) ||
    mediaUrl(meta.image) ||
    mediaUrl(post.featuredImage);

  return {
    title,
    description,

    alternates: {
      canonical:
        meta.canonicalURL ||
        `/blogs/${post.slug}`,
    },

    robots: {
      index:
        meta.robots?.index !== false,

      follow:
        meta.robots?.follow !== false,

      noarchive:
        meta.robots?.noArchive === true,

      noimageindex:
        meta.robots?.noImageIndex === true,

      nosnippet:
        meta.robots?.noSnippet === true,
    },

    openGraph: {
      type: "article",

      title:
        meta.openGraph?.title ||
        title,

      description:
        meta.openGraph?.description ||
        description,

      publishedTime:
        post.publishedAt ||
        undefined,

      modifiedTime:
        post.updatedAt ||
        undefined,

      url:
        `/blogs/${post.slug}`,

      images: ogImage
        ? [
          {
            url: ogImage,
            alt:
              post.title ||
              "AlloyPress article",
          },
        ]
        : undefined,
    },

    twitter: {
      card:
        "summary_large_image",

      title:
        meta.twitter?.title ||
        title,

      description:
        meta.twitter?.description ||
        description,

      images: ogImage
        ? [ogImage]
        : undefined,
    },
  };
}

// ============================================================
// PAGE
// ============================================================

export default async function BlogPostPage({
  params,
}: {
  params: Params;
}) {
  const { slug } = await params;

  const post = await getPost(slug);

  // ==========================================================
  // 404
  // ==========================================================

  if (!post) {
    return (
      <BlogLivePreview
        initialData={null}
        related={[]}
        slug={slug}
      />
    );
  }

  // ==========================================================
  // CATEGORY
  // ==========================================================

  const categoryId =
    typeof post.category === "object"
      ? post.category?.id
      : post.category;

  const categoryName =
    typeof post.category === "object" &&
      post.category?.name
      ? post.category.name
      : CATEGORY_LABEL;

  const categorySlugValue =
    typeof post.category === "object" &&
      post.category?.slug
      ? post.category.slug
      : CATEGORY_SLUG;

  // ==========================================================
  // RELATED POSTS
  // ==========================================================

  const related = categoryId
    ? await getRelatedPosts(
      categoryId,
      String(post.id),
    )
    : [];

  // ==========================================================
  // ARTICLE IMAGE
  // ==========================================================

  const articleImage =
    imageUrl(post.featuredImage);

  // ==========================================================
  // JSON-LD
  // ==========================================================

  const jsonLd = {
    "@context": "https://schema.org",

    "@type": "Article",

    headline: post.title,

    description:
      post.meta?.description ||
      post.excerpt ||
      "",

    image: articleImage
      ? [articleImage]
      : undefined,

    datePublished:
      post.publishedAt ||
      undefined,

    dateModified:
      post.updatedAt ||
      post.publishedAt ||
      undefined,

    author: {
      "@type": "Organization",
      name: "AlloyPress",
    },

    publisher: {
      "@type": "Organization",
      name: "AlloyPress",
    },

    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `/blogs/${post.slug}`,
    },
  };

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd),
        }}
      />

      <BlogLivePreview
        initialData={post}
        related={related}
        slug={slug}
      />
    </>
  );
}