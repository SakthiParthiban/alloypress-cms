import Image from "next/image";
import Link from "next/link";
import { payloadFetch } from "@/lib/payload";

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

  return `http://localhost:3001${media.url}`;
}

function getCategory(
  category: Post["category"]
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

  const title = post.title
    .trim()
    .toLowerCase();

  const category = getCategory(
    post.category
  );

  /*
   * Remove migrated WordPress junk.
   */
  if (
    title.includes("untitled wordpress")
  ) {
    return false;
  }

  /*
   * Remove Uncategorized content.
   */
  if (
    category.slug === "uncategorized" ||
    category.name.toLowerCase() ===
      "uncategorized"
  ) {
    return false;
  }

  return true;
}

/* =========================================================
   FETCH PUBLISHED POSTS
   ========================================================= */

async function getPublishedPosts(): Promise<Post[]> {
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
}

/* =========================================================
   ALLOY PICK SELECTION
   ========================================================= */

function selectAlloyPick(
  posts: Post[]
): Post | null {
  if (!posts.length) {
    return null;
  }

  /*
   * 1. Prefer cornerstone content.
   */
  const cornerstone = posts.find(
    (post) => post.cornerstone === true
  );

  if (cornerstone) {
    return cornerstone;
  }

  /*
   * 2. Otherwise use an older meaningful post.
   *
   * Posts are newest → oldest.
   * Pick from the older portion so Alloy Pick
   * doesn't always duplicate the newest article.
   */
  const olderStart = Math.floor(
    posts.length * 0.45
  );

  return (
    posts[olderStart] ||
    posts[posts.length - 1] ||
    null
  );
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

  const alloyPick =
    selectAlloyPick(posts);

  if (!alloyPick) {
    return null;
  }

  /*
   * Recent posts:
   * newest valid posts excluding Alloy Pick.
   */
  const recentPosts = posts
    .filter(
      (post) =>
        post.id !== alloyPick.id
    )
    .slice(0, 3);

  const pickImage =
    getMediaUrl(
      alloyPick.featuredImage
    );

  const pickCategory =
    getCategory(
      alloyPick.category
    );

  return (
    <section
      className="alloy-pick-section"
      aria-labelledby="alloy-pick-title"
    >
      <div className="container">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="alloy-pick-header">
          <div className="alloy-pick-heading">
            <span
              className="alloy-pick-line"
              aria-hidden="true"
            />

            <h2 id="alloy-pick-title">
              Alloy Pick
            </h2>
          </div>

          <Link
            href="/blogs"
            className="learn-ai-view-all"
          >
            View all
            <span aria-hidden="true">
              →
            </span>
          </Link>
        </div>

        {/* =================================================
            CONTENT
        ================================================= */}

        <div className="alloy-pick-grid">

          {/* =================================================
              FEATURED POST
          ================================================= */}

          <Link
            href={`/blogs/${alloyPick.slug}`}
            className="alloy-featured-card"
            aria-label={`Read ${alloyPick.title}`}
          >
            <div className="alloy-featured-image">

              {pickImage ? (
                <Image
                  src={pickImage}
                  alt={
                    typeof alloyPick.featuredImage ===
                    "object"
                      ? alloyPick.featuredImage?.alt ||
                        alloyPick.title ||
                        "AlloyPress featured article"
                      : alloyPick.title ||
                        "AlloyPress featured article"
                  }
                  fill
                  sizes="(max-width: 900px) 100vw, 60vw"
                  priority
                />
              ) : (
                <div
                  className="alloy-image-placeholder"
                  aria-hidden="true"
                >
                  <div className="alloy-placeholder-grid" />

                  <span>AI</span>
                </div>
              )}
            </div>

            <div className="alloy-featured-content">

              <div className="alloy-post-meta-top">
                <span>
                  {pickCategory.name}
                </span>

                <span aria-hidden="true">
                  •
                </span>

                <span>
                  FEATURED
                </span>
              </div>

              <h3>
                {alloyPick.title}
              </h3>

              {alloyPick.excerpt && (
                <p>
                  {alloyPick.excerpt}
                </p>
              )}

              <div className="alloy-featured-meta">
                <span>
                  AlloyPress Team
                </span>

                <span aria-hidden="true">
                  •
                </span>

                <time
                  dateTime={
                    alloyPick.publishedAt ||
                    undefined
                  }
                >
                  {formatDate(
                    alloyPick.publishedAt
                  )}
                </time>

                <span aria-hidden="true">
                  •
                </span>

                <span>
                  {pickCategory.name}
                </span>
              </div>
            </div>
          </Link>

          {/* =================================================
              RECENT POSTS
          ================================================= */}

          <div className="alloy-recent">

            <div className="alloy-recent-heading">
              <span
                className="alloy-recent-dot"
                aria-hidden="true"
              />

              RECENT POSTS
            </div>

            <div className="alloy-recent-list">

              {recentPosts.map(
                (post) => {
                  const image =
                    getMediaUrl(
                      post.featuredImage
                    );

                  const category =
                    getCategory(
                      post.category
                    );

                  return (
                    <Link
                      key={post.id}
                      href={`/blogs/${post.slug}`}
                      className="alloy-recent-card"
                      aria-label={`Read ${post.title}`}
                    >
                      <div className="alloy-recent-image">

                        {image ? (
                          <Image
                            src={image}
                            alt={
                              typeof post.featuredImage ===
                              "object"
                                ? post.featuredImage?.alt ||
                                  post.title ||
                                  "AlloyPress article"
                                : post.title ||
                                  "AlloyPress article"
                            }
                            fill
                            sizes="72px"
                          />
                        ) : (
                          <div
                            className="alloy-recent-placeholder"
                            aria-hidden="true"
                          >
                            AI
                          </div>
                        )}
                      </div>

                      <div className="alloy-recent-content">

                        <div className="alloy-recent-meta">
                          <span className="alloy-recent-category">
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
                        className="alloy-recent-arrow"
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