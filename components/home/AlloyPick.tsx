import Image from "next/image";
import Link from "next/link";
import { payloadFetch } from "@/lib/payload";
import FeaturedCarousel from "./FeaturedCarousel";

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

/* =========================================================
   HELPERS
   ========================================================= */

function getMediaUrl(
  media: Post["featuredImage"]
): string | null {
  if (!media || typeof media === "number") {
    return null;
  }

  if (!media.url) {
    return null;
  }

  if (media.url.startsWith("http")) {
    return media.url;
  }

  const cmsUrl =
    process.env.PAYLOAD_API_URL ||
    "http://localhost:3001/api";

  return `${cmsUrl.replace(/\/api$/, "")}${media.url}`;
}

function getCategory(
  category: Post["category"]
): {
  name: string;
  slug: string;
} {
  if (!category || typeof category === "number") {
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
  date?: string | null
): string {
  if (!date) return "";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(parsed);
}

/* =========================================================
   CONTENT FILTER
   ========================================================= */

function isValidPost(post: Post): boolean {
  if (!post.title || !post.slug) {
    return false;
  }

  const title = post.title.trim().toLowerCase();
  const category = getCategory(post.category);

  // Remove migrated WordPress junk.
  if (title.includes("untitled wordpress")) {
    return false;
  }

  // Remove Uncategorized content.
  if (
    category.slug === "uncategorized" ||
    category.name.toLowerCase() === "uncategorized"
  ) {
    return false;
  }

  return true;
}

/* =========================================================
   FETCH PUBLISHED POSTS
   ========================================================= */

async function getPublishedPosts(): Promise<Post[]> {
  try {
    const data =
      await payloadFetch<PayloadResponse>(
        "/posts?where[workflowStatus][equals]=published&sort=-publishedAt&limit=30&depth=1",
        {
          next: {
            revalidate: 60,
          },
        }
      );

    if (!data?.docs) {
      return [];
    }

    return data.docs.filter(isValidPost);
  } catch (error) {
    console.error(
      "Alloy Pick / Trending posts error:",
      error
    );

    return [];
  }
}

/* =========================================================
   ALLOY PICK SELECTION
   ========================================================= */

function selectFeaturedPosts(posts: Post[]): Post[] {
  if (!posts.length) {
    return [];
  }

  // 1. Keep the existing editorial preference:
  //    cornerstone content gets first priority.
  const cornerstone = posts.find(
    (post) => post.cornerstone === true
  );

  // 2. Fill the remaining Featured carousel slots with
  //    the newest valid published posts, without duplicates.
  const ordered = cornerstone
    ? [cornerstone, ...posts.filter((post) => post.id !== cornerstone.id)]
    : posts;

  return ordered.slice(0, 3);
}

/* =========================================================
   COMPONENT
   ========================================================= */

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

  /*
   * FEATURED + RECENTLY PUBLISHED
   *
   * Left:
   *   Three-post automatic Featured carousel.
   *
   * Right:
   *   Existing Recently Published list is preserved.
   */

  const featuredIds = new Set(
    featuredPosts.map((post) => post.id)
  );

  const trendingPosts = posts
    .filter(
      (post) => !featuredIds.has(post.id)
    )
    .slice(0, 5);

  return (
    <section
      className="alloy-trending-section"
      aria-labelledby="alloy-trending-title"
    >
      <div className="container">

        {/* =================================================
            HEADER
        ================================================= */}

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

        {/* =================================================
            ALLOY PICK + TRENDING
        ================================================= */}

        <div className="alloy-trending-grid">

          {/* =================================================
              FEATURED CAROUSEL
              Three featured posts. Recent Posts on the right
              remains a separate, unchanged content list.
          ================================================= */}

          <FeaturedCarousel posts={featuredPosts} />

          {/* =================================================
              TRENDING ARTICLES
              NO IMAGES
          ================================================= */}

          <div className="alloy-trending-posts">
            <div className="alloy-trending-posts-heading">
              <span className="trending-live-dot" />
              <span>
                Recently Published
              </span>
            </div>

            <div className="alloy-trending-list">

              {trendingPosts.map(
                (post, index) => {

                  const category =
                    getCategory(
                      post.category
                    );

                  return (
                    <Link
                      key={post.id}
                      href={`/blogs/${post.slug}`}
                      className="alloy-trending-card"
                      aria-label={`Read ${post.title}`}
                    >

                      <span className="alloy-trending-number">
                        {String(
                          index + 1
                        ).padStart(2, "0")}
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
                              post.publishedAt
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
                }
              )}

            </div>

          </div>

        </div>

      </div>
    </section>
  );
}