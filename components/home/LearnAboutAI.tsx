import Image from "next/image";
import Link from "next/link";

type Media = {
  id: number | string;
  url?: string | null;
  alt?: string | null;
};

type Category = {
  id: number | string;
  name: string;
  slug: string;
};

type Post = {
  id: number | string;
  title: string;
  slug: string;
  excerpt?: string | null;
  publishedAt?: string | null;
  author?: {
    name?: string | null;
  } | null;
  category?: Category | number | string | null;
  featuredImage?: Media | number | string | null;
};

type CategoryResponse = {
  docs?: Category[];
};

type PostsResponse = {
  docs?: Post[];
};

const PAYLOAD_URL =
  process.env.PAYLOAD_API_URL ||
  "http://localhost:3001/api";

/* =========================================================
   FETCH LATEST BLOGS
========================================================= */

async function getLearnPosts(): Promise<Post[]> {
  try {
    /*
     * First resolve the Blogs category.
     * Payload slug for the Blogs category is "blogs".
     */
    const categoryResponse = await fetch(
      `${PAYLOAD_URL}/categories?where[slug][equals]=blogs&limit=1`,
      {
        next: {
          revalidate: 60,
        },
      }
    );

    if (!categoryResponse.ok) {
      console.error(
        "AI Informative Blogs: Failed to fetch Blogs category."
      );

      return [];
    }

    const categoryData =
      (await categoryResponse.json()) as CategoryResponse;

    const blogsCategory = categoryData?.docs?.[0];

    if (!blogsCategory?.id) {
      console.error(
        "AI Informative Blogs: Blogs category not found."
      );

      return [];
    }

    /*
     * Fetch only published posts belonging to Blogs.
     *
     * Fetch more than 4 so invalid/placeholder posts can
     * be filtered before taking the final 4.
     */
    const postsResponse = await fetch(
      `${PAYLOAD_URL}/posts?where[workflowStatus][equals]=published&where[category][equals]=${encodeURIComponent(
        String(blogsCategory.id)
      )}&sort=-publishedAt&limit=12&depth=1`,
      {
        next: {
          revalidate: 60,
        },
      }
    );

    if (!postsResponse.ok) {
      console.error(
        "AI Informative Blogs: Failed to fetch published Blogs posts."
      );

      return [];
    }

    const postsData =
      (await postsResponse.json()) as PostsResponse;

    if (!Array.isArray(postsData?.docs)) {
      return [];
    }

    /*
     * Validate posts and return the latest 4 valid posts.
     */
    return postsData.docs
      .filter((post) => {
        if (
          !post?.id ||
          !post?.title?.trim() ||
          !post?.slug?.trim() ||
          !post?.publishedAt
        ) {
          return false;
        }

        const title = post.title
          .trim()
          .toLowerCase();

        if (
          title.includes("untitled wordpress") ||
          title.includes("dummy") ||
          title.includes("test post") ||
          title.includes("sample post") ||
          title.includes("lorem ipsum")
        ) {
          return false;
        }

        return true;
      })
      .slice(0, 4);
  } catch (error) {
    console.error(
      "AI Informative Blogs fetch error:",
      error
    );

    return [];
  }
}

/* =========================================================
   IMAGE URL
========================================================= */

function getImageUrl(
  featuredImage: Post["featuredImage"]
): string | null {
  if (
    typeof featuredImage === "object" &&
    featuredImage !== null &&
    featuredImage.url
  ) {
    const imageUrl = featuredImage.url;

    if (imageUrl.startsWith("http")) {
      return imageUrl;
    }

    const cmsUrl =
      process.env.PAYLOAD_API_URL ||
      "http://localhost:3001/api";

    return `${cmsUrl.replace(
      /\/api$/,
      ""
    )}${imageUrl}`;
  }

  if (typeof featuredImage === "number") {
    const cmsUrl =
      process.env.PAYLOAD_API_URL ||
      "http://localhost:3001/api";

    return `${cmsUrl.replace(
      /\/api$/,
      ""
    )}/api/media/${featuredImage}`;
  }

  return null;
}

/* =========================================================
   DATE
========================================================= */

function formatDate(
  date?: string | null
): string {
  if (!date) {
    return "";
  }

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(parsedDate);
}

/* =========================================================
   EXCERPT
========================================================= */

function getExcerpt(
  excerpt?: string | null
): string {
  if (!excerpt) {
    return "";
  }

  const clean = excerpt
    .replace(/<[^>]*>/g, "")
    .replace(/\s+/g, " ")
    .trim();

  if (!clean) {
    return "";
  }

  if (clean.length <= 115) {
    return clean;
  }

  return `${clean.slice(0, 115)}…`;
}

/* =========================================================
   COMPONENT
========================================================= */

export default async function LearnAboutAI() {
  const posts = await getLearnPosts();

  if (!posts.length) {
    return null;
  }

  /*
   * Convert Payload posts into the card data required
   * by the existing Learn About AI card styling.
   */
  const cards = posts
    .filter(
      (post) =>
        post?.id &&
        post?.slug &&
        post?.title
    )
    .slice(0, 4)
    .map((post) => ({
      id: String(post.id),
      title: post.title,
      slug: post.slug,
      excerpt: getExcerpt(post.excerpt),
      date: formatDate(post.publishedAt),

      author:
        typeof post.author === "object" &&
        post.author?.name
          ? post.author.name
          : "AlloyPress Team",

      image: getImageUrl(
        post.featuredImage
      ),

      imageAlt:
        typeof post.featuredImage === "object" &&
        post.featuredImage?.alt
          ? post.featuredImage.alt
          : post.title,

      category:
        typeof post.category === "object" &&
        post.category?.name
          ? post.category.name
          : "Learn",
    }));

  if (!cards.length) {
    return null;
  }

  return (
    <section
      className="learn-ai-section"
      aria-labelledby="learn-ai-title"
    >
      <div className="container">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="learn-ai-header">
          <div className="learn-ai-heading">
            <span
              className="learn-ai-heading-line"
              aria-hidden="true"
            />

            <h2 id="learn-ai-title">
              AI informative blogs
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
            2 × 2 CARD GRID

            No carousel.
            No duplicated cards.
            No pagination.
        ================================================= */}

        <div className="learn-ai-track">
          {cards.map((card) => (
            <article
              key={card.id}
              className="learn-ai-card"
            >
              <Link
                href={`/blogs/${card.slug}`}
                className="learn-ai-card-link"
                aria-label={`Read ${card.title}`}
              >

                {/* IMAGE */}

                <div className="learn-ai-image">
                  {card.image ? (
                    <Image
                      src={card.image}
                      alt={card.imageAlt}
                      fill
                      className="learn-ai-image-inner"
                      sizes="(max-width: 700px) 100vw, 50vw"
                    />
                  ) : (
                    <div
                      className="learn-ai-image-fallback"
                      aria-hidden="true"
                    >
                      <span>AI</span>
                    </div>
                  )}

                  <div
                    className="learn-ai-image-overlay"
                    aria-hidden="true"
                  />
                </div>

                {/* CONTENT */}

                <div className="learn-ai-card-content">

                  <div className="learn-ai-meta">
                    <span>
                      {card.category}
                    </span>

                    {card.date && (
                      <>
                        <i aria-hidden="true" />

                        <time>
                          {card.date}
                        </time>
                      </>
                    )}
                  </div>

                  <h3>
                    {card.title}
                  </h3>

                  {card.excerpt && (
                    <p>
                      {card.excerpt}
                    </p>
                  )}

                  {/* FOOTER */}

                  <div className="learn-ai-card-footer">
                    <span>
                      {card.author}
                    </span>

                    <span
                      className="learn-ai-card-arrow"
                      aria-hidden="true"
                    >
                      ↗
                    </span>
                  </div>

                </div>
              </Link>
            </article>
          ))}
        </div>

      </div>
    </section>
  );
}