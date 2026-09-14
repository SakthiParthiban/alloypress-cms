import Image from "next/image";
import Link from "next/link";
import { payloadFetch } from "@/lib/payload";

const PAYLOAD_URL =
  process.env.PAYLOAD_API_URL || "http://localhost:3001/api";

type NewsPost = {
  id: number | string;
  title: string;
  slug: string;
  excerpt?: string | null;
  publishedAt?: string | null;
  author?: string | { name?: string } | null;
  featuredImage?:
  | {
    url?: string | null;
    alt?: string | null;
  }
  | number
  | null;
};

async function getRecentAINews(): Promise<NewsPost[]> {
  try {
    /* -------------------------------------------------------
       GET NEWS CATEGORY
    ------------------------------------------------------- */

    const categoryData = await payloadFetch<{
      docs?: Array<{
        id: number | string;
      }>;
    }>(
      "/categories?where[slug][equals]=news&limit=1",
      {
        next: {
          revalidate: 60,
          tags: ["category:news"],
        },
      }
    );
    const category = categoryData?.docs?.[0];

    if (!category?.id) {
      return [];
    }

    /* -------------------------------------------------------
       GET LATEST PUBLISHED NEWS POSTS
    ------------------------------------------------------- */

    const postsData = await payloadFetch<{
      docs?: NewsPost[];
    }>(
      `/posts?where[workflowStatus][equals]=published&where[category][equals]=${encodeURIComponent(
        category.id
      )}&sort=-publishedAt&limit=8&depth=1`,
      {
        next: {
          revalidate: 60,
          tags: ["home:latest-news"],
        },
      }
    );

    const posts = Array.isArray(postsData?.docs)
      ? postsData.docs
      : [];

    /* -------------------------------------------------------
       REMOVE INVALID / PLACEHOLDER POSTS
    ------------------------------------------------------- */

    return posts
      .filter(
        (post: NewsPost) =>
          post?.id &&
          post?.title &&
          post?.slug &&
          post?.publishedAt &&
          !/^Untitled WordPress Post/i.test(post.title) &&
          !/dummy/i.test(post.title) &&
          !/test post/i.test(post.title) &&
          !/sample post/i.test(post.title) &&
          !/lorem ipsum/i.test(post.title)
      )
      .slice(0, 5);
  } catch {
    return [];
  }
}

function getImageUrl(
  featuredImage: NewsPost["featuredImage"]
): string | null {
  if (
    typeof featuredImage === "object" &&
    featuredImage !== null &&
    featuredImage.url
  ) {
    return featuredImage.url;
  }

  if (typeof featuredImage === "number") {
    return `${PAYLOAD_URL.replace(
      /\/api$/,
      ""
    )}/api/media/${featuredImage}`;
  }

  return null;
}

function formatDate(date?: string | null) {
  if (!date) {
    return "";
  }

  try {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(new Date(date));
  } catch {
    return "";
  }
}

export default async function RecentAINews() {
  const posts = await getRecentAINews();

  if (!posts.length) {
    return null;
  }

  /* Latest News post */
  const featured = posts[0];

  /* Remaining latest News posts */
  const supportingPosts = posts.slice(1);

  const featuredImage = getImageUrl(
    featured.featuredImage
  );

  return (
    <section
      className="recent-ai-news"
      aria-labelledby="recent-ai-news-heading"
    >
      <div
        className="recent-ai-news-bg"
        aria-hidden="true"
      >
        <span className="news-grid" />
        <span className="news-line news-line-one" />
        <span className="news-line news-line-two" />
      </div>

      <div className="container recent-ai-news-inner">
        <div className="recent-ai-news-header">
          <div>
            <h2 id="recent-ai-news-heading">
              AI News
            </h2>
          </div>

          {/* NEWS CATEGORY LISTING */}
          <Link
            href="/news"
            className="recent-ai-news-view-all"
            aria-label="View all AI news"
          >
            View all
            <span aria-hidden="true">→</span>
          </Link>
        </div>

        <div className="recent-ai-news-layout">

          {/* =================================================
              FEATURED — LATEST NEWS
          ================================================= */}

          <article className="recent-news-featured">
            <Link
              href={`/news/${featured.slug}`}
              className="recent-news-featured-link"
              aria-label={`Read ${featured.title}`}
            >
              <div className="recent-news-featured-image">
                {featuredImage ? (
                  <Image
                    src={featuredImage}
                    alt={
                      typeof featured.featuredImage ===
                        "object" &&
                        featured.featuredImage !== null
                        ? featured.featuredImage.alt ||
                        featured.title
                        : featured.title
                    }
                    fill
                    sizes="(max-width: 900px) 100vw, 58vw"
                    priority
                  />
                ) : (
                  <div
                    className="recent-news-image-placeholder"
                    aria-hidden="true"
                  />
                )}

                <span
                  className="recent-news-image-overlay"
                  aria-hidden="true"
                />

                <span className="recent-news-badge">
                  Latest
                </span>
              </div>

              <div className="recent-news-featured-content">
                <div className="recent-news-meta">
                  <span>AI NEWS</span>

                  <span aria-hidden="true">
                    •
                  </span>

                  <time
                    dateTime={
                      featured.publishedAt || undefined
                    }
                  >
                    {formatDate(
                      featured.publishedAt
                    )}
                  </time>
                </div>

                <h3>{featured.title}</h3>

                {featured.excerpt && (
                  <p>{featured.excerpt}</p>
                )}

                <span className="recent-news-read">
                  Read story
                  <span aria-hidden="true">
                    ↗
                  </span>
                </span>
              </div>
            </Link>
          </article>

          {/* =================================================
              SUPPORTING — OTHER LATEST NEWS
          ================================================= */}

          <div className="recent-news-list">
            {supportingPosts.map((post) => {
              const image = getImageUrl(
                post.featuredImage
              );

              return (
                <article
                  className="recent-news-item"
                  key={post.id}
                >
                  <Link
                    href={`/news/${post.slug}`}
                    className="recent-news-item-link"
                    aria-label={`Read ${post.title}`}
                  >
                    <div className="recent-news-item-image">
                      {image ? (
                        <Image
                          src={image}
                          alt={
                            typeof post.featuredImage ===
                              "object" &&
                              post.featuredImage !== null
                              ? post.featuredImage.alt ||
                              post.title
                              : post.title
                          }
                          fill
                          sizes="96px"
                        />
                      ) : (
                        <div
                          className="recent-news-thumb-placeholder"
                          aria-hidden="true"
                        />
                      )}
                    </div>

                    <div className="recent-news-item-content">
                      <div className="recent-news-item-meta">
                        <span>AI NEWS</span>

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

                      <h3>{post.title}</h3>
                    </div>

                    <span
                      className="recent-news-arrow"
                      aria-hidden="true"
                    >
                      →
                    </span>
                  </Link>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}