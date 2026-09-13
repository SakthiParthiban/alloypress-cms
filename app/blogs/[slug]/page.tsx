import type { Metadata } from "next";
import BlogPostView from "@/components/blogs/BlogPostView";

const PAYLOAD_URL =
  process.env.PAYLOAD_API_URL?.replace(/\/$/, "") ||
  "http://localhost:3000/api";

// Breadcrumb constants — this route only ever serves the "blogs" category,
// so these are fixed rather than derived from post data.
const CATEGORY_SLUG = "blogs";
const CATEGORY_LABEL = "Blogs";

type Params = Promise<{ slug: string }>;

async function fetchJSON(url: string, revalidate = 60) {
  const res = await fetch(url, { next: { revalidate } });
  if (!res.ok) return null;
  return res.json();
}

function mediaUrl(value: any) {
  if (!value) return null;
  if (typeof value === "object" && value.url) return value.url;
  return null;
}

function imageUrl(value: any) {
  if (!value) return null;
  if (typeof value === "object" && value.url) return value.url;
  if (typeof value === "number") {
    return `${PAYLOAD_URL}/media/${value}`;
  }
  return null;
}

/**
 * Payload depth normally populates media relations. Migrated content can
 * still contain numeric media IDs inside nested Lexical blocks, so hydrate
 * those IDs once on the server before the client renderer sees the post.
 */
async function hydrateContentMedia(content: any) {
  const root = content?.root;
  if (!root?.children) return content;

  const ids = new Set<number>();

  function collect(node: any) {
    if (!node || typeof node !== "object") return;

    if (node.type === "upload" && typeof node.value === "number") {
      ids.add(node.value);
    }

    if (node.type === "block") {
      const fields = node.fields || {};
      if (fields.blockType === "videoFile" && typeof fields.video === "number") {
        ids.add(fields.video);
      }
      if (fields.blockType === "audio" && typeof fields.audio === "number") {
        ids.add(fields.audio);
      }
    }

    if (Array.isArray(node.children)) {
      node.children.forEach(collect);
    }
  }

  root.children.forEach(collect);

  if (!ids.size) return content;

  const entries = await Promise.all(
    Array.from(ids).map(async (id) => {
      const data = await fetchJSON(`${PAYLOAD_URL}/media/${id}?depth=1`, 300);
      return [id, data] as const;
    })
  );

  const mediaMap = new Map<number, any>(entries.filter(([, value]) => value));

  function replace(node: any): any {
    if (!node || typeof node !== "object") return node;

    const next = { ...node };

    if (next.type === "upload" && typeof next.value === "number") {
      next.value = mediaMap.get(next.value) || next.value;
    }

    if (next.type === "block") {
      const fields = { ...(next.fields || {}) };

      if (fields.blockType === "videoFile" && typeof fields.video === "number") {
        fields.video = mediaMap.get(fields.video) || fields.video;
      }

      if (fields.blockType === "audio" && typeof fields.audio === "number") {
        fields.audio = mediaMap.get(fields.audio) || fields.audio;
      }

      next.fields = fields;
    }

    if (Array.isArray(next.children)) {
      next.children = next.children.map(replace);
    }

    return next;
  }

  return {
    ...content,
    root: {
      ...root,
      children: root.children.map(replace),
    },
  };
}

async function getPost(slug: string) {
  const url =
    `${PAYLOAD_URL}/posts` +
    `?where[slug][equals]=${encodeURIComponent(slug)}` +
    `&where[_status][equals]=published` +
    `&limit=1&depth=5`;

  const data = await fetchJSON(url, 60);
  const post = data?.docs?.[0] ?? null;

  if (!post) return null;

  return {
    ...post,
    content: await hydrateContentMedia(post.content),
  };
}

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) {
    return { title: "Article Not Found | AlloyPress" };
  }

  const meta = post.meta ?? {};
  const title = meta.title || post.title;
  const description = meta.description || post.excerpt || "";
  const ogImage =
    mediaUrl(meta.openGraph?.image) ||
    mediaUrl(meta.image) ||
    mediaUrl(post.featuredImage);

  return {
    title,
    description,
    alternates: {
      canonical: meta.canonicalURL || `/blogs/${post.slug}`,
    },
    robots: {
      index: meta.robots?.index !== false,
      follow: meta.robots?.follow !== false,
      noarchive: meta.robots?.noArchive === true,
      noimageindex: meta.robots?.noImageIndex === true,
      nosnippet: meta.robots?.noSnippet === true,
    },
    openGraph: {
      type: "article",
      title: meta.openGraph?.title || title,
      description: meta.openGraph?.description || description,
      publishedTime: post.publishedAt || undefined,
      modifiedTime: post.updatedAt || undefined,
      url: `/blogs/${post.slug}`,
      images: ogImage ? [{ url: ogImage, alt: post.title }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: meta.twitter?.title || title,
      description: meta.twitter?.description || description,
      images: ogImage ? [ogImage] : undefined,
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Params;
}) {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) {
    return (
      <main style={{ minHeight: "70vh", display: "grid", placeItems: "center", padding: 40 }}>
        <div>
          <p style={{ color: "#18b968", fontWeight: 700 }}>404 · ARTICLE NOT FOUND</p>
          <h1>We couldn't find this article.</h1>
          <a href="/blogs">← Back to Blogs</a>
        </div>
      </main>
    );
  }

  const categoryId =
    typeof post.category === "object" ? post.category?.id : post.category;

  const categoryName =
    typeof post.category === "object" && post.category?.name
      ? post.category.name
      : CATEGORY_LABEL;

  const categorySlugValue =
    typeof post.category === "object" && post.category?.slug
      ? post.category.slug
      : CATEGORY_SLUG;

  const relatedPromise = categoryId
    ? fetchJSON(
      `${PAYLOAD_URL}/posts?where[_status][equals]=published&where[category][equals]=${categoryId}&sort=-publishedAt&limit=5&depth=2`,
      120
    )
    : Promise.resolve(null);

  const [relatedData] = await Promise.all([relatedPromise]);

  const related = (relatedData?.docs || [])
    .filter((item: any) => item.id !== post.id)
    .filter((item: any) => !/^Untitled WordPress Post/i.test(item.title || ""))
    .slice(0, 3);

  const articleImage = imageUrl(post.featuredImage);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.meta?.description || post.excerpt || "",
    image: articleImage ? [articleImage] : undefined,
    datePublished: post.publishedAt || undefined,
    dateModified: post.updatedAt || post.publishedAt || undefined,
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

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <BlogPostView
        post={post}
        related={related}
        articleImage={articleImage}
        category={categorySlugValue}
        categoryLabel={categoryName}
      />
    </>
  );
}