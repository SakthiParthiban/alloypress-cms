import Link from "next/link";

type Category = {
  id: string;
  title?: string;
  name?: string;
  slug?: string;
};

type Post = {
  id: string;
  title: string;
  slug: string;
  publishedAt?: string;
  category?: Category | string | null;
};

type PayloadResponse = {
  docs: Post[];
};

async function getTrendingPosts(): Promise<Post[]> {
  const cmsUrl = process.env.PAYLOAD_API_URL;

  if (!cmsUrl) {
    console.error("PAYLOAD_CMS_URL is not configured");
    return [];
  }

  try {
    const url = new URL("/api/posts", cmsUrl);

    url.searchParams.set(
      "where[_status][equals]",
      "published",
    );

    url.searchParams.set("sort", "-publishedAt");
    url.searchParams.set("limit", "12");
    url.searchParams.set("depth", "1");

    const response = await fetch(url.toString(), {
      next: {
        revalidate: 300,
      },
    });

    if (!response.ok) {
      console.error(
        `Failed to fetch trending posts: ${response.status}`,
      );

      return [];
    }

    const data = (await response.json()) as PayloadResponse;

    return data.docs ?? [];
  } catch (error) {
    console.error("Trending posts error:", error);
    return [];
  }
}

function getCategoryName(
  category: Post["category"],
) {
  if (!category) return "AI";

  if (typeof category === "string") {
    return category;
  }

  return category.title || category.name || "AI";
}

export default async function Trending() {
  const posts = await getTrendingPosts();

  if (!posts.length) {
    return null;
  }

  /*
   * Duplicate the list so the marquee can loop
   * continuously without a visible jump.
   */
  const marqueePosts = [...posts, ...posts];

  return (
    <section className="trending-ticker">
      <div className="trending-ticker-label">
        <span className="trending-live-dot" />
        <span>TRENDING NOW</span>
      </div>

      <div className="trending-ticker-window">
        <div className="trending-ticker-track">
          {marqueePosts.map((post, index) => (
            <Link
              key={`${post.id}-${index}`}
              href={`/blogs/${post.slug}`}
              className="trending-ticker-item"
            >
              <span className="trending-ticker-arrow">
                ↗
              </span>

              <span className="trending-ticker-category">
                {getCategoryName(post.category)}
              </span>

              <span className="trending-ticker-title">
                {post.title}
              </span>

              <span className="trending-ticker-separator">
                •
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}