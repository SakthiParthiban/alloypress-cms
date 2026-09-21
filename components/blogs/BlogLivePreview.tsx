"use client";

import React from "react";
import { useLivePreview } from "@payloadcms/live-preview-react";

import BlogPostView from "@/components/blogs/BlogPostView";
import type { Post } from "@/lib/cms";

const PAYLOAD_URL = "https://alloypress-cms.vercel.app";

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
    return `${PAYLOAD_URL}/api/media/${value}`;
  }

  return null;
}

export default function BlogLivePreview({
  initialData,
  related,
  slug,
}: Props) {
  // Always provide a non-null initialData object to useLivePreview.
  const previewInitialData = (
    initialData ?? {
      id: "preview",
      title: "",
      slug,
      excerpt: "",
      content: null,
      category: null,
      featuredImage: null,
      publishedAt: null,
      updatedAt: null,
      legacy: {},
      tags: [],
      author: null,
    }
  ) as Post;

  const { data } = useLivePreview<Post>({
    serverURL: PAYLOAD_URL,
    initialData: previewInitialData,
    depth: 1,
  });

  // data will contain the latest Payload live-preview state.
  const post = data ?? previewInitialData;

  const category =
    typeof post.category === "object" &&
    post.category?.slug
      ? post.category.slug
      : "blogs";

  const categoryLabel =
    typeof post.category === "object" &&
    post.category?.name
      ? post.category.name
      : "Blogs";

  const articleImage = imageUrl(
    post.featuredImage,
  );

  return (
    <BlogPostView
      post={{
        id: post.id,
        title: post.title || "Live Preview",
        excerpt: post.excerpt || "",
        content: post.content,
        category: post.category,
        featuredImage: post.featuredImage,
        publishedAt: post.publishedAt,
        updatedAt: post.updatedAt,
        legacy: post.legacy,
        tags: post.tags,
      }}
      related={related}
      articleImage={articleImage}
      category={category}
      categoryLabel={categoryLabel}
    />
  );
}