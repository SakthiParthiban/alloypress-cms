import "./CategoryListing.css";

import Link from "next/link";

type CategoryListingProps = {
  slug: string;
  title: string;
  description: string;
};

type Media = {
  id?: number;
  url?: string | null;
  alt?: string | null;
  width?: number;
  height?: number;
};

type Category = {
  id: number;
  name: string;
  slug: string;
};

type Post = {
  id: number;
  title?: string | null;
  slug?: string | null;
  excerpt?: string | null;
  publishedAt?: string | null;
  featuredImage?: number | Media | null;
  category?: number | Category | null;
  author?: {
    name?: string | null;
  } | number | null;
  workflowStatus?: string | null;
};

type PayloadResponse<T> = {
  docs?: T[];
  totalDocs?: number;
};

const PAYLOAD_URL =
  process.env.PAYLOAD_API_URL?.replace(/\/$/, "") ||
  "http://localhost:3000/api";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  "http://localhost:3001";

const NAV_CATEGORIES = [
  {
    label: "Blogs",
    slug: "blogs",
  },
  {
    label: "Reviews",
    slug: "reviews",
  },
  {
    label: "News",
    slug: "news",
  },
  {
    label: "Alternatives",
    slug: "alternatives",
  },
  {
    label: "Comparisons",
    slug: "comparisons",
  },
];

const FALLBACK_IMAGES = [
  "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=1400&q=80",
  "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=1400&q=80",
  "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=1400&q=80",
];

function getImageUrl(
  featuredImage: Post["featuredImage"],
  index = 0
) {
  if (
    typeof featuredImage === "object" &&
    featuredImage?.url
  ) {
    return featuredImage.url;
  }

  if (typeof featuredImage === "number") {
    return `${PAYLOAD_URL.replace(
      /\/api$/,
      ""
    )}/api/media/${featuredImage}`;
  }

  return FALLBACK_IMAGES[index % FALLBACK_IMAGES.length];
}

function cleanTitle(title?: string | null) {
  if (!title) return "Untitled article";

  return title
    .replace(/^Untitled WordPress Post\s*[-:|]?\s*/i, "")
    .trim();
}

function isUsefulPost(post: Post) {
  const title = cleanTitle(post.title);

  if (!title) return false;

  if (/^Untitled WordPress Post/i.test(title)) {
    return false;
  }

  if (title.length < 5) {
    return false;
  }

  return true;
}

function formatDate(date?: string | null) {
  if (!date) return "Recently";

  try {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      year: "numeric",
    }).format(new Date(date));
  } catch {
    return "Recently";
  }
}

function getExcerpt(post: Post) {
  if (post.excerpt?.trim()) {
    return post.excerpt.trim();
  }

  return "Practical insights, testing, and analysis from AlloyPress.";
}

function getAuthor(post: Post) {
  if (
    typeof post.author === "object" &&
    post.author?.name
  ) {
    return post.author.name;
  }

  return "AlloyPress Team";
}

async function getCategoryPosts(slug: string) {
  try {
    const categoryResponse = await fetch(
      `${PAYLOAD_URL}/categories?where[slug][equals]=${encodeURIComponent(
        slug
      )}&limit=1`,
      {
        next: {
          revalidate: 60,
        },
      }
    );

    if (!categoryResponse.ok) {
      return {
        category: null,
        posts: [],
      };
    }

    const categoryData =
      (await categoryResponse.json()) as PayloadResponse<Category>;

    const category = categoryData.docs?.[0];

    if (!category) {
      return {
        category: null,
        posts: [],
      };
    }

    const postsResponse = await fetch(
      `${PAYLOAD_URL}/posts?where[workflowStatus][equals]=published&where[category][equals]=${category.id}&sort=-publishedAt&limit=13&depth=1`,
      {
        next: {
          revalidate: 60,
        },
      }
    );

    if (!postsResponse.ok) {
      return {
        category,
        posts: [],
      };
    }

    const postsData =
      (await postsResponse.json()) as PayloadResponse<Post>;

    const posts = (postsData.docs || [])
      .filter(isUsefulPost)
      .slice(0, 13);

    return {
      category,
      posts,
    };
  } catch {
    return {
      category: null,
      posts: [],
    };
  }
}

export default async function CategoryListing({
  slug,
  title,
  description,
}: CategoryListingProps) {
  const { posts } = await getCategoryPosts(slug);

  const featuredPost = posts[0] || null;
  const remainingPosts = posts.slice(1);

  return (
    <main className="category-page">

      {/* =========================================================
          HERO
      ========================================================= */}

      <section className="category-hero">
        <div className="category-hero-grid" />

        <div className="category-hero-inner">

          <div className="category-hero-label">
            <span />
            ALLOYPRESS / {slug.toUpperCase()}
          </div>

          <div className="category-hero-main">

            <div>
              <h1>
                {title}
              </h1>

              <p>
                {description}
              </p>
            </div>

            <div className="category-hero-index">
              <span>SECTION</span>
              <strong>
                {String(
                  NAV_CATEGORIES.findIndex(
                    (item) => item.slug === slug
                  ) + 1
                ).padStart(2, "0")}
              </strong>
            </div>

          </div>

          {/* CATEGORY NAV */}

          <nav
            className="category-filter"
            aria-label="Article categories"
          >
            {NAV_CATEGORIES.map((item) => (
              <Link
                key={item.slug}
                href={`/${item.slug}`}
                className={
                  item.slug === slug
                    ? "category-filter-link active"
                    : "category-filter-link"
                }
              >
                {item.label}
                {item.slug === slug && (
                  <span>•</span>
                )}
              </Link>
            ))}
          </nav>

        </div>
      </section>


      {/* =========================================================
          CONTENT
      ========================================================= */}

      <section className="category-content">
        <div className="category-content-inner">

          {/* =====================================================
              FEATURED
          ===================================================== */}

          {featuredPost ? (
            <>
              <div className="category-section-heading">
                <div>
                  <span className="section-number">
                    01
                  </span>

                  <h2>
                    Featured
                  </h2>
                </div>

                <span className="section-rule" />
              </div>

              <Link
                href={`/${slug}/${featuredPost.slug}`}
                className="featured-post"
              >

                <div className="featured-image">
                  <img
                    src={getImageUrl(
                      featuredPost.featuredImage,
                      0
                    )}
                    alt={
                      typeof featuredPost.featuredImage ===
                        "object" &&
                        featuredPost.featuredImage?.alt
                        ? featuredPost.featuredImage.alt
                        : cleanTitle(featuredPost.title)
                    }
                    loading="eager"
                    decoding="async"
                  />

                  <div className="featured-image-overlay" />

                  <span className="featured-image-label">
                    {title.toUpperCase()}
                  </span>

                  <span className="featured-image-arrow">
                    ↗
                  </span>
                </div>

                <div className="featured-info">

                  <div className="featured-meta">
                    <span>
                      FEATURED ARTICLE
                    </span>

                    <i />

                    <span>
                      {formatDate(
                        featuredPost.publishedAt
                      )}
                    </span>
                  </div>

                  <h3>
                    {cleanTitle(
                      featuredPost.title
                    )}
                  </h3>

                  <p>
                    {getExcerpt(featuredPost)}
                  </p>

                  <div className="featured-footer">

                    <span>
                      By {getAuthor(featuredPost)}
                    </span>

                    <strong>
                      Read article →
                    </strong>

                  </div>

                </div>

              </Link>
            </>
          ) : (
            <div className="empty-state">
              <span>NO ARTICLES YET</span>
              <h2>
                New {title.toLowerCase()} content
                is on the way.
              </h2>
              <p>
                Check back soon for new AlloyPress
                articles and insights.
              </p>
            </div>
          )}


          {/* =====================================================
              LATEST ARTICLES
          ===================================================== */}

          {remainingPosts.length > 0 && (
            <section className="latest-section">

              <div className="category-section-heading">
                <div>
                  <span className="section-number">
                    02
                  </span>

                  <h2>
                    Latest {title}
                  </h2>
                </div>

                <span className="article-count">
                  {remainingPosts.length} ARTICLES
                </span>
              </div>


              <div className="article-grid">

                {remainingPosts.map(
                  (post, index) => (
                    <Link
                      key={post.id}
                      href={`/${slug}/${post.slug}`}
                      className="article-card"
                    >

                      <div className="article-card-image">

                        <img
                          src={getImageUrl(
                            post.featuredImage,
                            index + 1
                          )}
                          alt={
                            typeof post.featuredImage ===
                              "object" &&
                              post.featuredImage?.alt
                              ? post.featuredImage.alt
                              : cleanTitle(post.title)
                          }
                          loading="lazy"
                          decoding="async"
                        />

                        <span className="article-card-number">
                          {String(index + 1).padStart(
                            2,
                            "0"
                          )}
                        </span>

                        <span className="article-card-arrow">
                          ↗
                        </span>

                      </div>


                      <div className="article-card-body">

                        <div className="article-card-meta">
                          <span>
                            {title.toUpperCase()}
                          </span>

                          <i />

                          <span>
                            {formatDate(
                              post.publishedAt
                            )}
                          </span>
                        </div>

                        <h3>
                          {cleanTitle(
                            post.title
                          )}
                        </h3>

                        <p>
                          {getExcerpt(post)}
                        </p>

                        <div className="article-card-footer">
                          <span>
                            {getAuthor(post)}
                          </span>

                          <strong>
                            Read →
                          </strong>
                        </div>

                      </div>

                    </Link>
                  )
                )}

              </div>

            </section>
          )}


          {/* =====================================================
              BOTTOM CTA
          ===================================================== */}

          <div className="category-bottom-cta">

            <div>
              <span>
                ALLOYPRESS / EDITORIAL
              </span>

              <h2>
                Looking for something
                specific?
              </h2>

              <p>
                Explore our reviews, comparisons,
                alternatives, and practical AI guides.
              </p>
            </div>

            <Link
              href="/"
              className="category-home-link"
            >
              Explore AlloyPress
              <span>→</span>
            </Link>

          </div>

        </div>
      </section>
    </main>
  );
}

