"use client";

import React from "react";

import {
  useLivePreview,
} from "@payloadcms/live-preview-react";

import BlogPostView from "@/components/blogs/BlogPostView";
import type { Post } from "@/lib/cms";

const PAYLOAD_URL =
  "https://alloypress-cms.vercel.app";

type Props = {
  initialData: Post;
  related: Post[];
  slug: string;
};

function imageUrl(
  value: unknown,
): string | null {
  if (
    typeof value === "object" &&
    value !== null &&
    "url" in value
  ) {
    const url =
      (value as {
        url?: unknown;
      }).url;

    return typeof url === "string"
      ? url
      : null;
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
  const { data } =
    useLivePreview<Post>({
      initialData,
      serverURL: PAYLOAD_URL,
      depth: 1,
    });

  const post = data;

  const category =
    typeof post.category === "object" &&
    post.category !== null &&
    "slug" in post.category &&
    typeof post.category.slug === "string"
      ? post.category.slug
      : "";

  const categoryLabel =
    typeof post.category === "object" &&
    post.category !== null &&
    "name" in post.category &&
    typeof post.category.name === "string"
      ? post.category.name
      : category;

  const articleImage =
    imageUrl(
      post.featuredImage,
    );

  return (
    <BlogPostView
      post={{
        id: post.id,
        title:
          post.title ||
          "Live Preview",

        excerpt:
          post.excerpt ||
          "",

        content:
          post.content,

        category:
          post.category,

        featuredImage:
          post.featuredImage,

        publishedAt:
          post.publishedAt,

        updatedAt:
          post.updatedAt,

        legacy:
          post.legacy,

        tags:
          post.tags,
      }}
      related={related}
      articleImage={
        articleImage
      }
      category={category}
      categoryLabel={
        categoryLabel
      }
    />
  );
}