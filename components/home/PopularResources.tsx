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

const RESOURCE_DEFINITIONS = [
  {
    number: "01",
    category: "IMAGE GENERATION",
    keywords: ["image generator", "ai image", "image generation"],
    icon: "◈",
  },
  {
    number: "02",
    category: "AI ASSISTANTS",
    keywords: ["chatbot", "ai chatbot", "ai assistants"],
    icon: "◉",
  },
  {
    number: "03",
    category: "AI DETECTION",
    keywords: ["ai detector", "ai detection", "detector"],
    icon: "⌁",
  },
  {
    number: "04",
    category: "IMAGE TOOLS",
    keywords: ["background remover", "remove background", "background removal"],
    icon: "✦",
  },
];

function getMediaUrl(media: Post["featuredImage"]): string | null {
  if (!media) {
    return null;
  }

  if (typeof media === "object" && media.url) {
    if (media.url.startsWith("http")) {
      return media.url;
    }

    const cmsUrl =
      process.env.PAYLOAD_API_URL ||
      "http://localhost:3001/api";

    return `${cmsUrl.replace(/\/api$/, "")}${media.url}`;
  }

  if (typeof media === "number") {
    const cmsUrl =
      process.env.PAYLOAD_API_URL ||
      "http://localhost:3001/api";

    return `${cmsUrl.replace(/\/api$/, "")}/api/media/${media}`;
  }

  return null;
}

function isValidPost(post: Post): boolean {
  if (!post?.id || !post?.title || !post?.slug || !post?.publishedAt) {
    return false;
  }

  const title = post.title.trim().toLowerCase();

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
    post.category && typeof post.category === "object"
      ? post.category
      : null;

  if (
    category?.slug === "uncategorized" ||
    category?.name?.toLowerCase() === "uncategorized"
  ) {
    return false;
  }

  return true;
}

async function getPublishedPosts(): Promise<Post[]> {
  try {
    const url = new URL(
      `${process.env.PAYLOAD_API_URL || "http://localhost:3001/api"}/posts`
    );

    url.searchParams.set("depth", "1");
    url.searchParams.set("limit", "100");
    url.searchParams.set("sort", "-publishedAt");
    url.searchParams.set(
      "where[workflowStatus][equals]",
      "published"
    );

    const response = await fetch(url.toString(), {
      next: {
        revalidate: 60,
      },
    });

    if (!response.ok) {
      return [];
    }

    const data = await response.json();

    return Array.isArray(data?.docs)
      ? data.docs.filter(isValidPost)
      : [];
  } catch (error) {
    console.error("Popular Resources fetch error:", error);
    return [];
  }
}

function findResourcePost(
  posts: Post[],
  definition: (typeof RESOURCE_DEFINITIONS)[number]
): Post | null {
  return (
    posts.find((post) => {
      const title = post.title?.toLowerCase() || "";

      return definition.keywords.some((keyword) =>
        title.includes(keyword)
      );
    }) || null
  );
}

export default async function PopularResources() {
  const posts = await getPublishedPosts();

  const resources = RESOURCE_DEFINITIONS
    .map((definition) => {
      const post = findResourcePost(posts, definition);

      if (!post) {
        return null;
      }

      return {
        ...definition,
        post,
      };
    })
    .filter(
      (
        resource
      ): resource is NonNullable<typeof resource> => Boolean(resource)
    );

  if (!resources.length) {
    return null;
  }

  return (
    <section
      className="popular-resources"
      aria-labelledby="popular-resources-title"
    >
      <div className="popular-resources-inner">
        <div className="resources-header">
          <h2 id="popular-resources-title">
            Popular Resources
          </h2>

          <Link
            href="/blogs"
            className="resources-view-all"
          >
            View all
            <span aria-hidden="true">→</span>
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
                        typeof resource.post.featuredImage === "object"
                          ? resource.post.featuredImage?.alt ||
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
                  <h3>{resource.post.title}</h3>
                </div>

                <div className="resource-footer">
                  <span>{resource.category}</span>
                  <b>
                    Read now <span aria-hidden="true">→</span>
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
