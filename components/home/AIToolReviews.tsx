const PAYLOAD_URL =
  process.env.PAYLOAD_API_URL || "http://localhost:3001/api";

export type ReviewPost = {
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

async function getReviewPosts(): Promise<ReviewPost[]> {
  try {
    const categoryResponse = await fetch(
      `${PAYLOAD_URL}/categories?where[slug][equals]=reviews&limit=1`,
      {
        next: {
          revalidate: 60,
        },
      }
    );

    if (!categoryResponse.ok) {
      return [];
    }

    const categoryData = await categoryResponse.json();
    const category = categoryData?.docs?.[0];

    if (!category?.id) {
      return [];
    }

    const postsResponse = await fetch(
      `${PAYLOAD_URL}/posts?where[workflowStatus][equals]=published&where[category][equals]=${encodeURIComponent(
        category.id
      )}&sort=-publishedAt&limit=10&depth=1`,
      {
        next: {
          revalidate: 60,
        },
      }
    );

    if (!postsResponse.ok) {
      return [];
    }

    const postsData = await postsResponse.json();

    const posts = Array.isArray(postsData?.docs)
      ? postsData.docs
      : [];

    return posts
      .filter(
        (post: ReviewPost) =>
          post?.id &&
          post?.title &&
          post?.slug &&
          !/^Untitled WordPress Post/i.test(post.title)
      )
      .slice(0, 4);
  } catch {
    return [];
  }
}

function getImageUrl(
  featuredImage: ReviewPost["featuredImage"]
) {
  if (
    typeof featuredImage === "object" &&
    featuredImage?.url
  ) {
    return featuredImage.url;
  }

  if (typeof featuredImage === "number") {
    return `${PAYLOAD_URL.replace(/\/api$/, "")}/api/media/${featuredImage}`;
  }

  return null;
}

function getAuthor(author: ReviewPost["author"]) {
  if (typeof author === "string") {
    return author;
  }

  if (
    author &&
    typeof author === "object" &&
    "name" in author
  ) {
    return author.name || "";
  }

  return "";
}

function formatDate(date?: string | null) {
  if (!date) return "";

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

export default async function AIToolReviews() {
  const posts = await getReviewPosts();

  if (!posts.length) {
    return null;
  }

  const cards = posts.map((post) => ({
    id: post.id,
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt || "",
    publishedAt: formatDate(post.publishedAt),
    author: getAuthor(post.author),
    image: getImageUrl(post.featuredImage),
    imageAlt:
      typeof post.featuredImage === "object"
        ? post.featuredImage?.alt || post.title
        : post.title,
  }));

  return (
    <section
      className="ai-tool-reviews"
      aria-labelledby="ai-tool-reviews-heading"
    >
      <div className="container">
        <div className="ai-tool-reviews-header">
          <h2 id="ai-tool-reviews-heading">
            AI Tool Reviews
          </h2>

          <a
            href="/reviews"
            className="learn-ai-view-all"
            aria-label="View all AI tool reviews"
          >
            View all
            <span aria-hidden="true">→</span>
          </a>
        </div>

        <div className="ai-tool-reviews-grid">
          {cards.map((card) => (
            <a
              key={card.id}
              href={`/reviews/${card.slug}`}
              className="ai-tool-review-card"
            >
              <div className="ai-tool-review-image">
                {card.image ? (
                  <img
                    src={card.image}
                    alt={card.imageAlt}
                    loading="lazy"
                  />
                ) : (
                  <div className="ai-tool-review-image-placeholder" />
                )}
              </div>

              <div className="ai-tool-review-content">
                <div className="ai-tool-review-meta">
                  <span>AI TOOL REVIEW</span>
                  {card.publishedAt && (
                    <>
                      <span aria-hidden="true">·</span>
                      <time>{card.publishedAt}</time>
                    </>
                  )}
                </div>

                <h3>{card.title}</h3>

                {card.excerpt && (
                  <p>{card.excerpt}</p>
                )}

                <span className="ai-tool-review-read">
                  Read review <span>↗</span>
                </span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}