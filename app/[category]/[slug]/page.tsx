import type { Metadata } from "next";

import { notFound } from "next/navigation";

import BlogPostView from "@/components/blogs/BlogPostView";

import { payloadFetch } from "@/lib/payload";

import type {
  Post,
  PayloadResponse,
} from "@/lib/cms";

// ============================================================
// ALLOWED CATEGORIES
// ============================================================

const ALLOWED_CATEGORIES = new Set([
  "blogs",
  "reviews",
  "news",
  "alternatives",
  "comparisons",
]);

const CATEGORY_LABELS: Record<
  string,
  string
> = {
  blogs: "Blogs",
  reviews: "Reviews",
  news: "News",
  alternatives: "Alternatives",
  comparisons: "Comparisons",
};

// ============================================================
// PARAMS
// ============================================================

type Params = Promise<{
  category: string;
  slug: string;
}>;

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
// MEDIA HELPERS
// ============================================================

function mediaUrl(
  value: unknown,
): string | null {
  if (
    typeof value === "object" &&
    value !== null &&
    "url" in value
  ) {
    const url = (
      value as {
        url?: unknown;
      }
    ).url;

    return typeof url === "string"
      ? url
      : null;
  }

  return null;
}

function imageUrl(
  value: unknown,
): string | null {
  if (
    typeof value === "object" &&
    value !== null &&
    "url" in value
  ) {
    const url = (
      value as {
        url?: unknown;
      }
    ).url;

    return typeof url === "string"
      ? url
      : null;
  }

  if (typeof value === "number") {
    const cmsUrl =
      process.env.PAYLOAD_API_URL ||
      "http://localhost:3000/api";

    return `${cmsUrl.replace(
      /\/api$/,
      "",
    )}/api/media/${value}`;
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

  if (
    !root ||
    !Array.isArray(root.children)
  ) {
    return content;
  }

  const ids = new Set<number>();

  function collect(
    node: unknown,
  ): void {
    if (
      typeof node !== "object" ||
      node === null
    ) {
      return;
    }

    const current = node as {
      type?: unknown;
      value?: unknown;
      fields?: Record<
        string,
        unknown
      >;
      children?: unknown[];
    };

    // --------------------------------------------------------
    // Upload node
    // --------------------------------------------------------

    if (
      current.type === "upload" &&
      typeof current.value === "number"
    ) {
      ids.add(current.value);
    }

    // --------------------------------------------------------
    // Custom media blocks
    // --------------------------------------------------------

    if (current.type === "block") {
      const fields =
        current.fields || {};

      if (
        fields.blockType ===
          "videoFile" &&
        typeof fields.video === "number"
      ) {
        ids.add(fields.video);
      }

      if (
        fields.blockType ===
          "audio" &&
        typeof fields.audio === "number"
      ) {
        ids.add(fields.audio);
      }
    }

    // --------------------------------------------------------
    // Nested children
    // --------------------------------------------------------

    if (
      Array.isArray(
        current.children,
      )
    ) {
      current.children.forEach(
        collect,
      );
    }
  }

  root.children.forEach(collect);

  if (!ids.size) {
    return content;
  }

  // ==========================================================
  // FETCH MEDIA IN PARALLEL
  // ==========================================================

  const entries = await Promise.all(
    Array.from(ids).map(
      async (id) => {
        const data =
          await payloadFetch<unknown>(
            `/media/${id}?depth=1`,
            {
              next: {
                revalidate: 300,
                tags: [`media:${id}`],
              },
            },
          );

        return [id, data] as const;
      },
    ),
  );

  const mediaMap =
    new Map<number, unknown>(
      entries.filter(
        (
          entry,
        ): entry is [
          number,
          unknown,
        ] =>
          entry[1] !== null,
      ),
    );

  // ==========================================================
  // REPLACE MEDIA IDS
  // ==========================================================

  function replace(
    node: unknown,
  ): unknown {
    if (
      typeof node !== "object" ||
      node === null
    ) {
      return node;
    }

    const current =
      node as Record<
        string,
        unknown
      >;

    const next: Record<
      string,
      unknown
    > = {
      ...current,
    };

    // --------------------------------------------------------
    // Upload
    // --------------------------------------------------------

    if (
      next.type === "upload" &&
      typeof next.value === "number"
    ) {
      next.value =
        mediaMap.get(
          next.value,
        ) ?? next.value;
    }

    // --------------------------------------------------------
    // Custom block
    // --------------------------------------------------------

    if (next.type === "block") {
      const fields =
        typeof next.fields ===
          "object" &&
        next.fields !== null
          ? {
              ...(
                next.fields as Record<
                  string,
                  unknown
                >
              ),
            }
          : {};

      if (
        fields.blockType ===
          "videoFile" &&
        typeof fields.video ===
          "number"
      ) {
        fields.video =
          mediaMap.get(
            fields.video,
          ) ?? fields.video;
      }

      if (
        fields.blockType ===
          "audio" &&
        typeof fields.audio ===
          "number"
      ) {
        fields.audio =
          mediaMap.get(
            fields.audio,
          ) ?? fields.audio;
      }

      next.fields = fields;
    }

    // --------------------------------------------------------
    // Children
    // --------------------------------------------------------

    if (
      Array.isArray(
        next.children,
      )
    ) {
      next.children =
        next.children.map(
          replace,
        );
    }

    return next;
  }

  return {
    ...(content as Record<
      string,
      unknown
    >),

    root: {
      ...root,

      children:
        root.children.map(
          replace,
        ),
    },
  };
}

// ============================================================
// GET POST
// ============================================================

async function getPost(
  category: string,
  slug: string,
): Promise<PostWithMeta | null> {
  // ----------------------------------------------------------
  // Validate category
  // ----------------------------------------------------------

  if (
    !ALLOWED_CATEGORIES.has(
      category,
    )
  ) {
    return null;
  }

  const params =
    new URLSearchParams();

  params.set(
    "where[slug][equals]",
    slug,
  );

  params.set(
    "where[_status][equals]",
    "published",
  );

  params.set(
    "limit",
    "1",
  );

  // Keep depth=5 for migrated
  // Lexical/media relationships.
  params.set(
    "depth",
    "5",
  );

  const data =
    await payloadFetch<
      PayloadResponse<PostWithMeta>
    >(
      `/posts?${params.toString()}`,
      {
        next: {
          revalidate: 60,
          tags: [
            `post:${category}:${slug}`,
            `post:${slug}`,
          ],
        },
      },
    );

  const post =
    data?.docs?.[0] ?? null;

  if (!post) {
    return null;
  }

  // ----------------------------------------------------------
  // Verify category
  // ----------------------------------------------------------

  const postCategory =
    typeof post.category ===
    "object"
      ? post.category?.slug
      : null;

  if (
    postCategory !== category
  ) {
    return null;
  }

  // ----------------------------------------------------------
  // Hydrate media
  // ----------------------------------------------------------

  const hydratedContent =
    await hydrateContentMedia(
      post.content,
    );

  return {
    ...post,

    content:
      hydratedContent as Post["content"],
  };
}

// ============================================================
// GET RELATED POSTS
// ============================================================

async function getRelatedPosts(
  categoryId: string | number,
  currentPostId: string,
  category: string,
): Promise<Post[]> {
  const params =
    new URLSearchParams();

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

  params.set(
    "limit",
    "5",
  );

  params.set(
    "depth",
    "2",
  );

  const data =
    await payloadFetch<
      PayloadResponse<Post>
    >(
      `/posts?${params.toString()}`,
      {
        next: {
          revalidate: 120,
          tags: [
            `category:${category}`,
          ],
        },
      },
    );

  return (data?.docs ?? [])
    .filter(
      (item) =>
        item.id !==
        currentPostId,
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
  const {
    category,
    slug,
  } = await params;

  const post =
    await getPost(
      category,
      slug,
    );

  if (!post) {
    return {
      title:
        "Article Not Found | AlloyPress",

      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const meta =
    post.meta ?? {};

  const title =
    meta.title ||
    post.title ||
    "AlloyPress";

  const description =
    meta.description ||
    post.excerpt ||
    "";

  const ogImage =
    mediaUrl(
      meta.openGraph?.image,
    ) ||
    mediaUrl(meta.image) ||
    mediaUrl(
      post.featuredImage,
    );

  const canonical =
    meta.canonicalURL ||
    `/${category}/${post.slug}`;

  return {
    title,

    description,

    alternates: {
      canonical,
    },

    robots: {
      index:
        meta.robots?.index !==
        false,

      follow:
        meta.robots?.follow !==
        false,

      noarchive:
        meta.robots?.noArchive ===
        true,

      noimageindex:
        meta.robots
          ?.noImageIndex ===
        true,

      nosnippet:
        meta.robots?.noSnippet ===
        true,
    },

    openGraph: {
      type: "article",

      title:
        meta.openGraph?.title ||
        title,

      description:
        meta.openGraph
          ?.description ||
        description,

      publishedTime:
        post.publishedAt ||
        undefined,

      modifiedTime:
        post.updatedAt ||
        undefined,

      url: canonical,

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

export default async function CategoryPostPage({
  params,
}: {
  params: Params;
}) {
  const {
    category,
    slug,
  } = await params;

  const post =
    await getPost(
      category,
      slug,
    );

  if (!post) {
    notFound();
  }

  const categoryId =
    typeof post.category ===
    "object"
      ? post.category?.id
      : post.category;

  const related = categoryId
    ? await getRelatedPosts(
        categoryId,
        post.id,
        category,
      )
    : [];

  const articleImage =
    imageUrl(
      post.featuredImage,
    );

  const categoryLabel =
    CATEGORY_LABELS[
      category
    ] || category;

  // ==========================================================
  // JSON-LD
  // ==========================================================

  const jsonLd = {
    "@context":
      "https://schema.org",

    "@type":
      "Article",

    headline:
      post.title,

    description:
      post.meta?.description ||
      post.excerpt ||
      "",

    image:
      articleImage
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
      "@type":
        "Organization",

      name:
        "AlloyPress",
    },

    publisher: {
      "@type":
        "Organization",

      name:
        "AlloyPress",
    },

    mainEntityOfPage: {
      "@type":
        "WebPage",

      "@id":
        `/${category}/${post.slug}`,
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
          __html:
            JSON.stringify(
              jsonLd,
            ),
        }}
      />

      <BlogPostView
        post={post}
        related={related}
        articleImage={
          articleImage
        }
        category={category}
        categoryLabel={
          categoryLabel
        }
      />
    </>
  );
}