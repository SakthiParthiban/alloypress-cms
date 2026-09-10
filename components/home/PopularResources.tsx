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

type CategoryResponse = {
  docs?: Category[];
};

const RESOURCE_DEFINITIONS = [
  {
    number: "01",
    category: "ALTERNATIVES",
    keywords: [],
    icon: "◈",
  },
  {
    number: "02",
    category: "ALTERNATIVES",
    keywords: [],
    icon: "◉",
  },
  {
    number: "03",
    category: "ALTERNATIVES",
    keywords: [],
    icon: "⌁",
  },
  {
    number: "04",
    category: "ALTERNATIVES",
    keywords: [],
    icon: "✦",
  },
];

function getMediaUrl(
  media: Post["featuredImage"]
): string | null {
  if (!media) {
    return null;
  }

  if (
    typeof media === "object" &&
    media.url
  ) {
    if (media.url.startsWith("http")) {
      return media.url;
    }

    const cmsUrl =
      process.env.PAYLOAD_API_URL ||
      "http://localhost:3001/api";

    return `${cmsUrl.replace(
      /\/api$/,
      ""
    )}${media.url}`;
  }

  if (typeof media === "number") {
    const cmsUrl =
      process.env.PAYLOAD_API_URL ||
      "http://localhost:3001/api";

    return `${cmsUrl.replace(
      /\/api$/,
      ""
    )}/api/media/${media}`;
  }

  return null;
}

function isValidPost(post: Post): boolean {
  if (
    !post?.id ||
    !post?.title ||
    !post?.slug ||
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

  const category =
    post.category &&
    typeof post.category === "object"
      ? post.category
      : null;

  if (
    category?.slug === "uncategorized" ||
    category?.name?.toLowerCase() ===
      "uncategorized"
  ) {
    return false;
  }

  return true;
}

async function getLatestPosts(): Promise<Post[]> {
  try {
    /*
     * Step 1:
     * Get the Alternatives category.
     *
     * We intentionally resolve the category first instead of
     * relying on category names returned inside individual posts.
     */
    const categoryData =
      await payloadFetch<CategoryResponse>(
        "/categories?where[slug][equals]=alternatives&limit=1",
        {
          next: {
            revalidate: 60,
          },
        }
      );

    const alternativesCategory =
      categoryData?.docs?.[0];

    if (!alternativesCategory?.id) {
      console.error(
        "Popular Resources: Alternatives category not found."
      );

      return [];
    }

    /*
     * Step 2:
     * Fetch ONLY published posts belonging to
     * the Alternatives category.
     *
     * - sort=-publishedAt => newest first
     * - limit=30 => enough candidates after filtering
     * - depth=1 => featuredImage/category populated
     */
    const postsData =
      await payloadFetch<PayloadResponse>(
        `/posts?where[workflowStatus][equals]=published&where[category][equals]=${encodeURIComponent(
          String(alternativesCategory.id)
        )}&sort=-publishedAt&limit=30&depth=1`,
        {
          next: {
            revalidate: 60,
          },
        }
      );

    if (!postsData?.docs) {
      return [];
    }

    /*
     * Step 3:
     * Keep valid published Alternatives posts
     * and take the latest 4.
     */
    return postsData.docs
      .filter(isValidPost)
      .slice(0, 4);
  } catch (error) {
    console.error(
      "Popular Resources fetch error:",
      error
    );

    return [];
  }
}

export default async function PopularResources() {
  const posts = await getLatestPosts();

  if (!posts.length) {
    return null;
  }

  /*
   * Use the latest Alternatives posts directly.
   * No keyword matching is required anymore.
   */
  const resources = posts.map(
    (post, index) => {
      const definition =
        RESOURCE_DEFINITIONS[index];

      return {
        ...definition,
        post,
      };
    }
  );

  return (
    <section
      className="popular-resources"
      aria-labelledby="popular-resources-title"
    >
      <div className="popular-resources-inner">
        <div className="resources-header">
          <h2 id="popular-resources-title">
            TOP AI tools alternatives
          </h2>

          <Link
            href="/alternatives"
            className="resources-view-all"
          >
            View all
            <span aria-hidden="true">
              →
            </span>
          </Link>
        </div>

        <div className="resources-grid">
          {resources.map((resource) => {
            const image = getMediaUrl(
              resource.post.featuredImage
            );

            return (
              <Link
                key={resource.post.id}
                href={`/blogs/${resource.post.slug}`}
                className="resource-card"
              >
                {image ? (
                  <div className="resource-image">
                    <Image
                      src={image}
                      alt={
                        typeof resource.post
                          .featuredImage ===
                        "object"
                          ? resource.post
                              .featuredImage
                              ?.alt ||
                            resource.post.title ||
                            "Popular AI resource"
                          : resource.post.title ||
                            "Popular AI resource"
                      }
                      fill
                      sizes="(max-width: 620px) 100vw, (max-width: 950px) 50vw, 25vw"
                    />
                  </div>
                ) : null}

                <div className="resource-card-top">
                  <span className="resource-number">
                    {resource.number}
                  </span>

                  <span className="resource-icon">
                    {resource.icon}
                  </span>
                </div>

                <div className="resource-content">
                  <h3>
                    {resource.post.title}
                  </h3>
                </div>

                <div className="resource-footer">
                  <span>
                    {resource.category}
                  </span>

                  <b>
                    Read now{" "}
                    <span aria-hidden="true">
                      →
                    </span>
                  </b>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}