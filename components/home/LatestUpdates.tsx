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
  publishedAt?: string | null;
  featuredImage?: Media | number | null;
  category?: Category | number | null;
};

type PayloadResponse = {
  docs?: Post[];
};

function getMediaUrl(media: Post["featuredImage"]): string | null {
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

function formatDate(date?: string | null): string {
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

function isValidPost(post: Post): boolean {
  if (!post.title || !post.slug) {
    return false;
  }

  const title = post.title.trim().toLowerCase();
  const category = getCategory(post.category);

  if (title.includes("untitled wordpress")) {
    return false;
  }

  if (
    category.slug === "uncategorized" ||
    category.name.toLowerCase() === "uncategorized"
  ) {
    return false;
  }

  return true;
}

async function getLatestPosts(): Promise<Post[]> {
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

    return data.docs
      .filter(isValidPost)
      .slice(0, 4);
  } catch (error) {
    console.error(
      "Latest Updates fetch error:",
      error
    );

    return [];
  }
}

export default async function LatestUpdates() {
  const posts = await getLatestPosts();

  if (!posts.length) {
    return null;
  }

  return (
    <section
      className="latest-updates-section"
      aria-labelledby="latest-updates-title"
    >
      <div className="container">
        <div className="latest-updates-header">
          <h2 id="latest-updates-title">
            Latest Updates
          </h2>

          <Link
            href="/blogs"
            className="latest-updates-view-all"
          >
            <span>View all</span>
            <span aria-hidden="true">→</span>
          </Link>
        </div>

        <div className="latest-updates-list">
          {posts.map((post, index) => {
            const image = getMediaUrl(
              post.featuredImage
            );

            const category = getCategory(
              post.category
            );

            return (
              <Link
                key={post.id}
                href={`/blogs/${post.slug}`}
                className="latest-update-item"
                aria-label={`Read ${post.title}`}
              >
                <span className="latest-update-number">
                  {String(index + 1).padStart(2, "0")}
                </span>

                <div className="latest-update-content">
                  <div className="latest-update-meta">
                    <span>{category.name}</span>

                    <time
                      dateTime={
                        post.publishedAt || undefined
                      }
                    >
                      {formatDate(
                        post.publishedAt
                      )}
                    </time>
                  </div>

                  <h3>{post.title}</h3>

                  <span className="latest-update-read">
                    Read story
                    <span aria-hidden="true">
                      →
                    </span>
                  </span>
                </div>

                <div className="latest-update-image">
                  {image ? (
                    <Image
                      src={image}
                      alt={
                        typeof post.featuredImage ===
                        "object"
                          ? post.featuredImage?.alt ||
                            post.title ||
                            "Latest AI update"
                          : post.title ||
                            "Latest AI update"
                      }
                      fill
                      sizes="(max-width: 700px) 100vw, 240px"
                    />
                  ) : (
                    <div
                      className="latest-update-placeholder"
                      aria-hidden="true"
                    >
                      AI
                    </div>
                  )}
                </div>

                <span
                  className="latest-update-arrow"
                  aria-hidden="true"
                >
                  ↗
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
