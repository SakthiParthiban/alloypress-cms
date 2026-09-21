"use client";

import React from "react";
import { useLivePreview } from "@payloadcms/live-preview-react";

import BlogPostView from "@/components/blogs/BlogPostView";
import type { Post } from "@/lib/cms";

const CATEGORY_LABELS: Record<string, string> = {
  blogs: "Blogs",
  reviews: "Reviews",
  news: "News",
  alternatives: "Alternatives",
  comparisons: "Comparisons",
};

type Props = {
  initialData: Post | null;
  related: Post[];
  slug: string;
};

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
      process.env.NEXT_PUBLIC_PAYLOAD_URL ||
      "https://alloypress-cms.vercel.app";

    return `${cmsUrl.replace(/\/$/, "")}/api/media/${value}`;
  }

  return null;
}

export default function BlogLivePreview({
  initialData,
  related,
  slug,
}: Props) {
  const fallbackData = {
    ...(initialData ?? {}),
    slug,
  } as Post;

  const { data } = useLivePreview<Post>({
    serverURL:
      process.env.NEXT_PUBLIC_PAYLOAD_URL ||
      "https://alloypress-cms.vercel.app",

    initialData: fallbackData,

    depth: 1,
  });

  if (!data?.title) {
    return (
      <main
        style={{
          minHeight: "70vh",
          display: "grid",
          placeItems: "center",
          padding: 40,
        }}
      >
        <p>Loading preview...</p>
      </main>
    );
  }

  const category =
    typeof data.category === "object" &&
    data.category?.slug
      ? data.category.slug
      : "blogs";

  const categoryLabel =
    typeof data.category === "object" &&
    data.category?.name
      ? data.category.name
      : CATEGORY_LABELS[category] || "Blogs";

  const articleImage = imageUrl(
    data.featuredImage,
  );

  return (
    <BlogPostView
      post={{
        id: data.id,
        title: data.title,
        excerpt: data.excerpt,
        content: data.content,
        category: data.category,
        featuredImage: data.featuredImage,
        publishedAt: data.publishedAt,
        updatedAt: data.updatedAt,
        legacy: data.legacy,
        tags: data.tags,
      }}
      related={related}
      articleImage={articleImage}
      category={category}
      categoryLabel={categoryLabel}
    />
  );
}