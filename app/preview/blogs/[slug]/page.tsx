import type { Metadata } from "next";

import BlogLivePreview from "@/components/blogs/BlogLivePreview";
import type { Post } from "@/lib/cms";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

type Params = Promise<{
  slug: string;
}>;

type SearchParams = Promise<{
  id?: string;
}>;

const PAYLOAD_URL =
  process.env.NEXT_PUBLIC_PAYLOAD_URL ||
  "http://localhost:3001";

export default async function BlogPreviewPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  const { slug } = await params;
  const { id } = await searchParams;

  if (!id) {
    return <div>Preview document ID missing.</div>;
  }

  const response = await fetch(
    `${PAYLOAD_URL}/api/posts/${encodeURIComponent(id)}?draft=true&depth=1`,
    {
      cache: "no-store",
    },
  );

  if (!response.ok) {
    return <div>Unable to load preview.</div>;
  }

  const post = (await response.json()) as Post;

  return (
    <BlogLivePreview
      initialData={post}
      related={[]}
      slug={slug}
    />
  );
}