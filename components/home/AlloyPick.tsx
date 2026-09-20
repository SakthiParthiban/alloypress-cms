import Image from "next/image";
import Link from "next/link";
import { cache } from "react";

import { payloadFetch } from "@/lib/payload";

import FeaturedCarousel from "./FeaturedCarousel";

// ============================================================
// CONFIG
// ============================================================

const PAYLOAD_URL =
  process.env.PAYLOAD_API_URL ||
  "http://localhost:3001/api";

const HOME_POST_LIMIT = 12;
const FEATURED_POST_COUNT = 3;
const TRENDING_POST_COUNT = 4;

// ============================================================
// TYPES
// ============================================================

type Media = {
  url?: string | null;
  alt?: string | null;
};

type Category = {
  id: number | string;
  name?: string | null;
  slug?: string | null;
};

type Post = {
  id: number | string;
  title?: string | null;
  slug?: string | null;
  excerpt?: string | null;
  publishedAt?: string | null;
  cornerstone?: boolean | null;
  featuredImage?: Media | number | null;
  category?: Category | number | null;
};

type PayloadResponse = {
  docs?: Post[];
};

// ============================================================
// HELPERS
// ============================================================

function getMediaUrl(
  media: Post["featuredImage"],
): string | null {
  if (!media || typeof media === "number") {
    return null;
  }

  if (
    typeof media.url !== "string" ||
    !media.url
  ) {
    return null;
  }

  if (media.url.startsWith("http")) {
    return media.url;
  }

  const cmsUrl =
    process.env.PAYLOAD_API_URL ||
    "http://localhost:3001/api";

  return `${cmsUrl.replace(
    /\/api$/,
    "",
  )}${media.url}`;
}

function getCategory(
  category: Post["category"],
): {
  name: string;
  slug: string;
} {
  if (
    !category ||
    typeof category === "number"
  ) {
    return {
      name: "AI",
      slug: "ai",
    };
  }

  return {
    name: category.name || "AI",
    slug: category.slug || "ai",
  };
}

function formatDate(
  date?: string | null,
): string {
  if (!date) {
    return "";
  }

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat(
    "en-US",
    {
      month: "short",
      day: "numeric",
      year: "numeric",
    },
  ).format(parsed);
}

// ============================================================
// CONTENT FILTER
// ============================================================

function isValidPost(
  post: Post,
): boolean {
  if (
    !post.title ||
    !post.slug
  ) {
    return false;
  }

  const title =
    post.title.trim().toLowerCase();

  const category =
    getCategory(post.category);

  if (
    title.includes(
      "untitled wordpress",
    )
  ) {
    return false;
  }

  if (
    category.slug ===
      "uncategorized" ||
    category.name.toLowerCase() ===
      "uncategorized"
  ) {
    return false;
  }

  return true;
}

// ============================================================
// FETCH PUBLISHED POSTS
// ============================================================

const getPublishedPosts = cache(
  async (): Promise<Post[]> => {
    try {
      const params =
        new URLSearchParams();

      params.set(
        "where[workflowStatus][equals]",
        "published",
      );

      params.set(
        "sort",
        "-publishedAt",
      );

      params.set(
        "limit",
        String(HOME_POST_LIMIT),
      );

      params.set(
        "depth",
        "1",
      );

      // Only fields required by this
      // homepage section.
      params.set(
        "select[id]",
        "true",
      );

      params.set(
        "select[title]",
        "true",
      );

      params.set(
        "select[slug]",
        "true",
      );

      params.set(
        "select[publishedAt]",
        "true",
      );

      params.set(
        "select[cornerstone]",
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
        await payloadFetch<PayloadResponse>(
          `/posts?${params.toString()}`,
          {
            next: {
              revalidate: 300,
              tags: [
                "home:latest-posts",
                "posts",
              ],
            },
          },
        );

      if (
        !Array.isArray(
          data?.docs,
        )
      ) {
        return [];
      }

      return data.docs.filter(
        isValidPost,
      );
    } catch (error) {
      console.error(
        "Alloy Pick / Trending posts error:",
        error,
      );

      return [];
    }
  },
);

// ============================================================
// ALLOY PICK SELECTION
// ============================================================

function selectFeaturedPosts(
  posts: Post[],
): Post[] {
  if (!posts.length) {
    return [];
  }

  const cornerstone =
    posts.find(
      (post) =>
        post.cornerstone === true,
    );

  const ordered =
    cornerstone
      ? [
          cornerstone,
          ...posts.filter(
            (post) =>
              post.id !==
              cornerstone.id,
          ),
        ]
      : posts;

  return ordered.slice(
    0,
    FEATURED_POST_COUNT,
  );
}

// ============================================================
// COMPONENT
// ============================================================

export default async function AlloyPick() {
  const posts =
    await getPublishedPosts();

  if (!posts.length) {
    return null;
  }

  const featuredPosts =
    selectFeaturedPosts(posts);

  if (!featuredPosts.length) {
    return null;
  }

  const featuredIds =
    new Set(
      featuredPosts.map(
        (post) => post.id,
      ),
    );

  const trendingPosts =
    posts
      .filter(
        (post) =>
          !featuredIds.has(
            post.id,
          ),
      )
      .slice(
        0,
        TRENDING_POST_COUNT,
      );

  return (
    <section
      className="alloy-trending-section"
      aria-labelledby="alloy-trending-title"
    >
      <div className="container">
        <div className="alloy-trending-header">
          <div className="alloy-trending-heading">
            <div>
              <span className="eyebrow">
                TRENDING NOW
              </span>

              <h2 id="alloy-trending-title">
                Featured
              </h2>
            </div>
          </div>
        </div>

        <div className="alloy-trending-grid">
          <FeaturedCarousel
            posts={featuredPosts}
          />

          <div className="alloy-trending-posts">
            <div className="alloy-trending-posts-heading">
              <span className="trending-live-dot" />

              <span>
                Recently Published
              </span>
            </div>

            <div className="alloy-trending-list">
              {trendingPosts.map(
                (
                  post,
                  index,
                ) => {
                  const category =
                    getCategory(
                      post.category,
                    );

                  return (
                    <Link
                      key={post.id}
                      href={`/${category.slug}/${post.slug}`}
                      className="alloy-trending-card"
                      aria-label={`Read ${post.title}`}
                    >
                      <span className="alloy-trending-number">
                        {String(
                          index + 1,
                        ).padStart(
                          2,
                          "0",
                        )}
                      </span>

                      <div className="alloy-trending-content">
                        <div className="alloy-trending-meta">
                          <span>
                            {category.name}
                          </span>

                          <time
                            dateTime={
                              post.publishedAt ||
                              undefined
                            }
                          >
                            {formatDate(
                              post.publishedAt,
                            )}
                          </time>
                        </div>

                        <h3>
                          {post.title}
                        </h3>
                      </div>

                      <span
                        className="alloy-trending-arrow"
                        aria-hidden="true"
                      >
                        ↗
                      </span>
                    </Link>
                  );
                },
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}