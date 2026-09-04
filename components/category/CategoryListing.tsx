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
                <span>.</span>
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


      <style>{`

        /* =========================================================
           BASE
        ========================================================= */

        .category-page {
          min-height: 100vh;
          background: #f7faf8;
          color: #14202b;
        }


        /* =========================================================
           HERO
        ========================================================= */

        .category-hero {
          position: relative;
          overflow: hidden;

          background:
            linear-gradient(
              135deg,
              #f2f8f5,
              #f8faf9
            );

          border-bottom: 1px solid #d8e2dd;
        }


        .category-hero-grid {
          position: absolute;
          inset: 0;

          pointer-events: none;

          background-image:
            linear-gradient(
              rgba(24,185,104,.045) 1px,
              transparent 1px
            ),
            linear-gradient(
              90deg,
              rgba(24,185,104,.045) 1px,
              transparent 1px
            );

          background-size: 52px 52px;

          mask-image:
            linear-gradient(
              to bottom,
              black,
              transparent
            );
        }


        .category-hero-inner {
          position: relative;
          z-index: 1;

          width: min(
            1180px,
            calc(100% - 48px)
          );

          margin: 0 auto;

          padding: 70px 0 0;
        }


        .category-hero-label {
          display: flex;
          align-items: center;
          gap: 9px;

          margin-bottom: 24px;

          color: #18b968;

          font:
            800 10px/1
            "DM Mono",
            monospace;

          letter-spacing: .15em;
        }


        .category-hero-label span {
          width: 22px;
          height: 2px;

          background: #18b968;
        }


        .category-hero-main {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;

          gap: 40px;

          padding-bottom: 42px;
        }


        .category-hero-main h1 {
          margin: 0;

          color: #111a23;

          font:
            800 clamp(52px, 7vw, 86px)/.95
            "Sora",
            sans-serif;

          letter-spacing: -.065em;
        }


        .category-hero-main h1 span {
          color: #18b968;
        }


        .category-hero-main p {
          max-width: 650px;

          margin: 18px 0 0;

          color: #61716b;

          font:
            400 16px/1.7
            "Lora",
            serif;
        }


        .category-hero-index {
          display: flex;
          flex-direction: column;

          align-items: flex-end;

          padding-bottom: 6px;
        }


        .category-hero-index span {
          margin-bottom: 5px;

          color: #9aa7a1;

          font:
            700 8px/1
            "DM Mono",
            monospace;

          letter-spacing: .13em;
        }


        .category-hero-index strong {
          color: #18b968;

          font:
            700 34px/1
            "DM Mono",
            monospace;
        }


        /* =========================================================
           CATEGORY NAV
        ========================================================= */

        .category-filter {
          display: flex;
          align-items: center;

          gap: 3px;

          border-top: 1px solid #d8e2dd;
        }


        .category-filter-link {
          position: relative;

          display: inline-flex;
          align-items: center;
          gap: 6px;

          min-height: 50px;

          padding: 0 15px;

          color: #69766f;

          text-decoration: none;

          font:
            700 10px/1
            "DM Mono",
            monospace;

          letter-spacing: .04em;

          transition:
            color .2s ease,
            background .2s ease;
        }


        .category-filter-link:hover {
          color: #18b968;
          background: rgba(24,185,104,.04);
        }


        .category-filter-link.active {
          color: #18b968;
          background: rgba(24,185,104,.07);
        }


        .category-filter-link.active::after {
          content: "";

          position: absolute;

          left: 12px;
          right: 12px;
          bottom: 0;

          height: 2px;

          background: #18b968;
        }


        .category-filter-link.active span {
          font-size: 12px;
        }


        /* =========================================================
           CONTENT
        ========================================================= */

        .category-content {
          padding: 58px 0 80px;

          background:
            linear-gradient(
              180deg,
              #f7faf8,
              #ffffff
            );
        }


        .category-content-inner {
          width: min(
            1180px,
            calc(100% - 48px)
          );

          margin: 0 auto;
        }


        /* =========================================================
           SECTION HEADING
        ========================================================= */

        .category-section-heading {
          display: flex;
          align-items: center;
          justify-content: space-between;

          gap: 20px;

          margin-bottom: 20px;
        }


        .category-section-heading > div {
          display: flex;
          align-items: center;
          gap: 12px;
        }


        .section-number {
          color: #18b968;

          font:
            700 9px/1
            "DM Mono",
            monospace;

          letter-spacing: .08em;
        }


        .category-section-heading h2 {
          margin: 0;

          color: #17232d;

          font:
            800 23px/1.2
            "Sora",
            sans-serif;

          letter-spacing: -.03em;
        }


        .section-rule {
          flex: 1;

          height: 1px;

          margin-left: 15px;

          background: #dce4e0;
        }


        .article-count {
          color: #89958f;

          font:
            700 8px/1
            "DM Mono",
            monospace;

          letter-spacing: .1em;
        }


        /* =========================================================
           FEATURED POST
        ========================================================= */

        .featured-post {
          display: grid;

          grid-template-columns:
            minmax(0, 1.12fr)
            minmax(360px, .88fr);

          min-height: 360px;

          overflow: hidden;

          border: 1px solid #ccd8d2;
          border-radius: 14px;

          background: #fff;

          color: inherit;
          text-decoration: none;

          box-shadow:
            0 12px 35px
            rgba(20,40,30,.045);

          transition:
            transform .25s ease,
            border-color .25s ease,
            box-shadow .25s ease;
        }


        .featured-post:hover {
          transform: translateY(-3px);

          border-color: rgba(24,185,104,.4);

          box-shadow:
            0 18px 45px
            rgba(20,40,30,.08);
        }


        .featured-image {
          position: relative;

          min-height: 360px;

          overflow: hidden;

          background: #111916;
        }


        .featured-image img {
          display: block;

          width: 100%;
          height: 100%;

          object-fit: cover;

          transition:
            transform .6s ease;
        }


        .featured-post:hover
        .featured-image img {
          transform: scale(1.035);
        }


        .featured-image-overlay {
          position: absolute;
          inset: 0;

          background:
            linear-gradient(
              135deg,
              rgba(5,15,10,.12),
              transparent 45%,
              rgba(5,15,10,.7)
            );
        }


        .featured-image-label {
          position: absolute;

          left: 18px;
          top: 18px;

          padding: 7px 9px;

          border: 1px solid
            rgba(255,255,255,.18);

          border-radius: 5px;

          background:
            rgba(8,18,13,.68);

          color: #d5eee0;

          backdrop-filter: blur(8px);

          font:
            700 8px/1
            "DM Mono",
            monospace;

          letter-spacing: .11em;
        }


        .featured-image-arrow {
          position: absolute;

          right: 18px;
          bottom: 18px;

          width: 38px;
          height: 38px;

          display: grid;
          place-items: center;

          border: 1px solid
            rgba(255,255,255,.22);

          border-radius: 50%;

          background:
            rgba(8,18,13,.65);

          color: #fff;

          font-size: 16px;

          backdrop-filter: blur(8px);

          transition:
            background .2s ease,
            color .2s ease;
        }


        .featured-post:hover
        .featured-image-arrow {
          background: #18b968;
          color: #fff;
        }


        /* =========================================================
           FEATURED INFO
        ========================================================= */

        .featured-info {
          display: flex;
          flex-direction: column;

          justify-content: center;

          padding: 42px;
        }


        .featured-meta {
          display: flex;
          align-items: center;
          gap: 8px;

          margin-bottom: 18px;

          color: #89958f;

          font:
            700 8px/1
            "DM Mono",
            monospace;

          letter-spacing: .09em;
        }


        .featured-meta i {
          width: 3px;
          height: 3px;

          border-radius: 50%;

          background: #18b968;
        }


        .featured-info h3 {
          margin: 0;

          color: #14202b;

          font:
            800 clamp(27px, 3vw, 39px)/1.13
            "Sora",
            sans-serif;

          letter-spacing: -.045em;
        }


        .featured-info p {
          max-width: 510px;

          margin: 18px 0 0;

          color: #65746d;

          font:
            400 15px/1.75
            "Lora",
            serif;
        }


        .featured-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;

          gap: 20px;

          margin-top: 30px;
          padding-top: 16px;

          border-top: 1px solid #e0e6e3;
        }


        .featured-footer span {
          color: #89958f;

          font:
            600 9px/1.3
            "DM Mono",
            monospace;
        }


        .featured-footer strong {
          color: #18b968;

          font:
            700 10px/1
            "DM Mono",
            monospace;
        }


        /* =========================================================
           LATEST
        ========================================================= */

        .latest-section {
          margin-top: 64px;
        }


        .article-grid {
          display: grid;

          grid-template-columns:
            repeat(3, minmax(0, 1fr));

          gap: 22px;
        }


        .article-card {
          display: flex;
          flex-direction: column;

          overflow: hidden;

          border: 1px solid #d2ddd8;
          border-radius: 12px;

          background: #fff;

          color: inherit;
          text-decoration: none;

          transition:
            transform .22s ease,
            border-color .22s ease,
            box-shadow .22s ease;
        }


        .article-card:hover {
          transform: translateY(-4px);

          border-color: rgba(24,185,104,.38);

          box-shadow:
            0 15px 35px
            rgba(20,40,30,.07);
        }


        .article-card-image {
          position: relative;

          height: 175px;

          overflow: hidden;

          background: #edf2ef;
        }


        .article-card-image img {
          display: block;

          width: 100%;
          height: 100%;

          object-fit: cover;

          transition:
            transform .5s ease;
        }


        .article-card:hover
        .article-card-image img {
          transform: scale(1.035);
        }


        .article-card-number {
          position: absolute;

          left: 12px;
          top: 12px;

          padding: 6px 7px;

          border-radius: 4px;

          background:
            rgba(8,18,13,.72);

          color: #d6eee1;

          font:
            700 8px/1
            "DM Mono",
            monospace;

          backdrop-filter: blur(6px);
        }


        .article-card-arrow {
          position: absolute;

          right: 12px;
          top: 12px;

          width: 30px;
          height: 30px;

          display: grid;
          place-items: center;

          border: 1px solid
            rgba(255,255,255,.2);

          border-radius: 50%;

          background:
            rgba(8,18,13,.58);

          color: #fff;

          font-size: 13px;

          backdrop-filter: blur(6px);
        }


        .article-card-body {
          display: flex;
          flex-direction: column;

          flex: 1;

          padding: 17px;
        }


        .article-card-meta {
          display: flex;
          align-items: center;
          gap: 7px;

          margin-bottom: 12px;

          color: #89958f;

          font:
            700 7px/1
            "DM Mono",
            monospace;

          letter-spacing: .08em;
        }


        .article-card-meta i {
          width: 3px;
          height: 3px;

          border-radius: 50%;

          background: #18b968;
        }


        .article-card-body h3 {
          margin: 0;

          color: #17232d;

          font:
            800 16px/1.3
            "Sora",
            sans-serif;

          letter-spacing: -.025em;
        }


        .article-card-body p {
          margin: 11px 0 0;

          color: #697870;

          font:
            400 13px/1.65
            "Lora",
            serif;
        }


        .article-card-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;

          gap: 10px;

          margin-top: auto;
          padding-top: 17px;

          border-top: 1px solid #e2e8e5;

          margin-top: 22px;
        }


        .article-card-footer span {
          color: #8b9791;

          font:
            600 8px/1.2
            "DM Mono",
            monospace;
        }


        .article-card-footer strong {
          color: #18b968;

          font:
            700 9px/1
            "DM Mono",
            monospace;
        }


        /* =========================================================
           EMPTY
        ========================================================= */

        .empty-state {
          padding: 65px 30px;

          border: 1px solid #d5dfda;
          border-radius: 14px;

          background: #fff;

          text-align: center;
        }


        .empty-state > span {
          color: #18b968;

          font:
            800 9px/1
            "DM Mono",
            monospace;

          letter-spacing: .13em;
        }


        .empty-state h2 {
          margin: 15px 0 8px;

          color: #17232d;

          font:
            800 28px/1.2
            "Sora",
            sans-serif;
        }


        .empty-state p {
          margin: 0;

          color: #718078;

          font:
            400 14px/1.6
            "Lora",
            serif;
        }


        /* =========================================================
           BOTTOM CTA
        ========================================================= */

        .category-bottom-cta {
          display: flex;
          align-items: center;
          justify-content: space-between;

          gap: 35px;

          margin-top: 65px;
          padding: 28px 30px;

          border: 1px solid #cfdad5;
          border-radius: 12px;

          background:
            linear-gradient(
              135deg,
              rgba(24,185,104,.055),
              rgba(255,255,255,.8)
            );
        }


        .category-bottom-cta > div > span {
          color: #18b968;

          font:
            700 8px/1
            "DM Mono",
            monospace;

          letter-spacing: .12em;
        }


        .category-bottom-cta h2 {
          margin: 8px 0 5px;

          color: #17232d;

          font:
            800 22px/1.2
            "Sora",
            sans-serif;

          letter-spacing: -.03em;
        }


        .category-bottom-cta p {
          margin: 0;

          color: #718078;

          font:
            400 12px/1.5
            "Lora",
            serif;
        }


        .category-home-link {
          flex: 0 0 auto;

          display: inline-flex;
          align-items: center;
          gap: 8px;

          min-height: 40px;

          padding: 0 15px;

          border: 1px solid #18b968;
          border-radius: 7px;

          background: #18b968;

          color: #fff;

          text-decoration: none;

          font:
            700 10px/1
            "DM Mono",
            monospace;

          transition: .2s ease;
        }


        .category-home-link:hover {
          background: #119d59;
          border-color: #119d59;

          transform: translateY(-1px);
        }


        /* =========================================================
           DARK MODE
        ========================================================= */

        html[data-theme="dark"] .category-page,
        html.dark .category-page,
        body.dark .category-page {
          background: #0b100e;
          color: #edf5f1;
        }


        html[data-theme="dark"] .category-hero,
        html.dark .category-hero,
        body.dark .category-hero {
          background:
            linear-gradient(
              135deg,
              #0d1612,
              #0b100e
            );

          border-color: #293730;
        }


        html[data-theme="dark"] .category-hero-main h1,
        html.dark .category-hero-main h1,
        body.dark .category-hero-main h1 {
          color: #f1f6f3;
        }


        html[data-theme="dark"] .category-hero-main p,
        html.dark .category-hero-main p,
        body.dark .category-hero-main p {
          color: #9daaa4;
        }


        html[data-theme="dark"] .category-filter,
        html.dark .category-filter,
        body.dark .category-filter {
          border-color: #293730;
        }


        html[data-theme="dark"] .category-filter-link,
        html.dark .category-filter-link,
        body.dark .category-filter-link {
          color: #84928b;
        }


        html[data-theme="dark"] .category-filter-link.active,
        html.dark .category-filter-link.active,
        body.dark .category-filter-link.active {
          background: rgba(24,185,104,.09);
          color: #53d890;
        }


        html[data-theme="dark"] .category-content,
        html.dark .category-content,
        body.dark .category-content {
          background:
            linear-gradient(
              180deg,
              #0b100e,
              #0d1310
            );
        }


        html[data-theme="dark"] .category-section-heading h2,
        html.dark .category-section-heading h2,
        body.dark .category-section-heading h2 {
          color: #edf5f1;
        }


        html[data-theme="dark"] .section-rule,
        html.dark .section-rule,
        body.dark .section-rule {
          background: #293730;
        }


        html[data-theme="dark"] .featured-post,
        html.dark .featured-post,
        body.dark .featured-post {
          background: #101713;
          border-color: #293730;
        }


        html[data-theme="dark"] .featured-info h3,
        html.dark .featured-info h3,
        body.dark .featured-info h3 {
          color: #edf5f1;
        }


        html[data-theme="dark"] .featured-info p,
        html.dark .featured-info p,
        body.dark .featured-info p {
          color: #9daaa4;
        }


        html[data-theme="dark"] .featured-footer,
        html.dark .featured-footer,
        body.dark .featured-footer {
          border-color: #293730;
        }


        html[data-theme="dark"] .article-card,
        html.dark .article-card,
        body.dark .article-card {
          background: #101713;
          border-color: #293730;
        }


        html[data-theme="dark"] .article-card-body h3,
        html.dark .article-card-body h3,
        body.dark .article-card-body h3 {
          color: #edf5f1;
        }


        html[data-theme="dark"] .article-card-body p,
        html.dark .article-card-body p,
        body.dark .article-card-body p {
          color: #9daaa4;
        }


        html[data-theme="dark"] .article-card-footer,
        html.dark .article-card-footer,
        body.dark .article-card-footer {
          border-color: #293730;
        }


        html[data-theme="dark"] .empty-state,
        html.dark .empty-state,
        body.dark .empty-state {
          background: #101713;
          border-color: #293730;
        }


        html[data-theme="dark"] .empty-state h2,
        html.dark .empty-state h2,
        body.dark .empty-state h2 {
          color: #edf5f1;
        }


        html[data-theme="dark"] .empty-state p,
        html.dark .empty-state p,
        body.dark .empty-state p {
          color: #9daaa4;
        }


        html[data-theme="dark"] .category-bottom-cta,
        html.dark .category-bottom-cta,
        body.dark .category-bottom-cta {
          background:
            linear-gradient(
              135deg,
              rgba(24,185,104,.07),
              #101713
            );

          border-color: #293730;
        }


        html[data-theme="dark"] .category-bottom-cta h2,
        html.dark .category-bottom-cta h2,
        body.dark .category-bottom-cta h2 {
          color: #edf5f1;
        }


        html[data-theme="dark"] .category-bottom-cta p,
        html.dark .category-bottom-cta p,
        body.dark .category-bottom-cta p {
          color: #9daaa4;
        }


        /* =========================================================
           TABLET
        ========================================================= */

        @media (max-width: 900px) {

          .category-hero-inner,
          .category-content-inner {
            width:
              min(
                100% - 36px,
                720px
              );
          }


          .category-hero-inner {
            padding-top: 55px;
          }


          .category-hero-main h1 {
            font-size: 62px;
          }


          .featured-post {
            grid-template-columns: 1fr;
          }


          .featured-image {
            min-height: 350px;
          }


          .article-grid {
            grid-template-columns:
              repeat(2, minmax(0, 1fr));
            gap: 18px;
          }

        }


        /* =========================================================
           MOBILE
        ========================================================= */

        @media (max-width: 620px) {

          .category-hero-inner,
          .category-content-inner {
            width:
              min(
                100% - 28px,
                560px
              );
          }


          .category-hero-inner {
            padding-top: 42px;
          }


          .category-hero-main {
            align-items: flex-start;

            padding-bottom: 30px;
          }


          .category-hero-main h1 {
            font-size: 49px;
          }


          .category-hero-main p {
            margin-top: 14px;

            font-size: 14px;
          }


          .category-hero-index {
            display: none;
          }


          .category-filter {
            margin-right: -14px;

            overflow-x: auto;

            scrollbar-width: none;
          }


          .category-filter::-webkit-scrollbar {
            display: none;
          }


          .category-filter-link {
            flex: 0 0 auto;

            min-height: 46px;

            padding: 0 12px;

            font-size: 9px;
          }


          .category-content {
            padding: 42px 0 60px;
          }


          .category-section-heading {
            margin-bottom: 15px;
          }


          .category-section-heading h2 {
            font-size: 20px;
          }


          .article-count {
            display: none;
          }


          .section-rule {
            margin-left: 8px;
          }


          .featured-image {
            min-height: 270px;
          }


          .featured-info {
            padding: 25px 21px;
          }


          .featured-info h3 {
            font-size: 26px;
          }


          .featured-info p {
            font-size: 14px;
          }


          .featured-footer {
            align-items: flex-start;
            flex-direction: column;

            gap: 10px;
          }


          .latest-section {
            margin-top: 48px;
          }


          .article-grid {
            grid-template-columns: 1fr;

            gap: 12px;
          }


          .article-card-image {
            height: 200px;
          }


          .article-card-body {
            padding: 17px;
          }


          .article-card-body h3 {
            font-size: 17px;
          }


          .category-bottom-cta {
            align-items: flex-start;
            flex-direction: column;

            margin-top: 48px;

            padding: 23px 20px;

            gap: 18px;
          }


          .category-home-link {
            width: 100%;
            justify-content: center;
          }

        }


        /* =========================================================
   COMPACT + STRONG ARTICLE CARDS
   ========================================================= */

.article-grid {
  gap: 20px;
}

.article-card {
  background: #ffffff;
  border: 1px solid #bfcfc7;
  border-radius: 12px;
  box-shadow:
    0 4px 14px rgba(20, 40, 30, 0.055);

  transition:
    transform .22s ease,
    border-color .22s ease,
    box-shadow .22s ease;
}

.article-card:hover {
  transform: translateY(-3px);
  border-color: #18b968;

  box-shadow:
    0 10px 26px rgba(20, 40, 30, 0.10);
}


/* KEEP IMAGE SIZE */
.article-card-image {
  height: 205px;
}


/* COMPACT CONTENT */
.article-card-body {
  padding: 15px 17px 14px;
}


/* META */
.article-card-meta {
  margin-bottom: 8px;

  font-size: 7px;
}


/* TITLE — MAX 2 LINES */
.article-card-body h3 {
  margin: 0;

  font:
    800 16px/1.28
    "Sora",
    sans-serif;

  letter-spacing: -.025em;

  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
}


/* DESCRIPTION — MAX 3 LINES */
.article-card-body p {
  margin: 8px 0 0;

  color: #65736d;

  font:
    400 12px/1.55
    "Lora",
    serif;

  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  overflow: hidden;
}


/* FOOTER */
.article-card-footer {
  margin-top: 13px;
  padding-top: 11px;

  border-top: 1px solid #d9e2de;
}

.article-card-footer span {
  font-size: 7px;
}

.article-card-footer strong {
  font-size: 8px;
}


/* =========================================================
   DARK MODE — STRONGER CARDS
   ========================================================= */

html[data-theme="dark"] .article-card,
html.dark .article-card,
body.dark .article-card {
  background: #121a16;
  border-color: #34463d;

  box-shadow:
    0 5px 18px rgba(0, 0, 0, .22);
}

html[data-theme="dark"] .article-card:hover,
html.dark .article-card:hover,
body.dark .article-card:hover {
  border-color: #18b968;

  box-shadow:
    0 12px 28px rgba(0, 0, 0, .32);
}

html[data-theme="dark"] .article-card-body h3,
html.dark .article-card-body h3,
body.dark .article-card-body h3 {
  color: #f1f6f3;
}

html[data-theme="dark"] .article-card-body p,
html.dark .article-card-body p,
body.dark .article-card-body p {
  color: #aab7b0;
}

html[data-theme="dark"] .article-card-footer,
html.dark .article-card-footer,
body.dark .article-card-footer {
  border-color: #304039;
}


/* =========================================================
   MOBILE
   ========================================================= */

@media (max-width: 620px) {

  .article-grid {
    gap: 15px;
  }

  /* image still NOT reduced */
  .article-card-image {
    height: 205px;
  }

  .article-card-body {
    padding: 14px 15px 13px;
  }

  .article-card-body h3 {
    font-size: 16px;
  }

  .article-card-body p {
    font-size: 12px;
    line-height: 1.5;
    -webkit-line-clamp: 3;
  }

  .article-card-footer {
    margin-top: 11px;
    padding-top: 10px;
  }
}

      `}</style>
    </main>
  );
}