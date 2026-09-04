import Image from "next/image";
import Link from "next/link";

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
        const categoryResponse = await fetch(
            `${PAYLOAD_URL}/categories?where[slug][equals]=news&limit=1`,
            {
                next: { revalidate: 60 },
            }
        );

        if (!categoryResponse.ok) return [];

        const categoryData = await categoryResponse.json();
        const category = categoryData?.docs?.[0];

        if (!category?.id) return [];

        const postsResponse = await fetch(
            `${PAYLOAD_URL}/posts?where[workflowStatus][equals]=published&where[category][equals]=${encodeURIComponent(
                category.id
            )}&sort=-publishedAt&limit=8&depth=1`,
            {
                next: { revalidate: 60 },
            }
        );

        if (!postsResponse.ok) return [];

        const postsData = await postsResponse.json();

        const posts = Array.isArray(postsData?.docs)
            ? postsData.docs
            : [];

        // Avoid unwanted migrated placeholder posts.
        return posts
            .filter(
                (post: NewsPost) =>
                    post?.title &&
                    post?.slug &&
                    !/^Untitled WordPress Post/i.test(post.title)
            )
            .slice(0, 5);
    } catch {
        return [];
    }
}

function getImageUrl(featuredImage: NewsPost["featuredImage"]) {
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

    return null;
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

function getAuthor(author: NewsPost["author"]) {
    if (typeof author === "string") return author;

    if (
        author &&
        typeof author === "object" &&
        "name" in author
    ) {
        return author.name || "";
    }

    return "";
}

export default async function RecentAINews() {
    const posts = await getRecentAINews();

    if (!posts.length) return null;

    const featured = posts[0];
    const supportingPosts = posts.slice(1);

    const featuredImage = getImageUrl(
        featured.featuredImage
    );

    return (
        <section
            className="recent-ai-news"
            aria-labelledby="recent-ai-news-heading"
        >
            <div className="recent-ai-news-bg" aria-hidden="true">
                <span className="news-grid" />
                <span className="news-line news-line-one" />
                <span className="news-line news-line-two" />
            </div>

            <div className="container recent-ai-news-inner">
                <div className="recent-ai-news-header">
                    <div>
                    <h2 id="recent-ai-news-heading">
                        Recent AI News
                    </h2>
                </div>

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
                {/* Featured news */}
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
                                        typeof featured.featuredImage === "object"
                                            ? featured.featuredImage?.alt ||
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

                            <span className="recent-news-image-overlay" />
                            <span className="recent-news-badge">
                                Latest
                            </span>
                        </div>

                        <div className="recent-news-featured-content">
                            <div className="recent-news-meta">
                                <span>AI NEWS</span>
                                <span aria-hidden="true">•</span>
                                <time dateTime={featured.publishedAt || undefined}>
                                    {formatDate(featured.publishedAt)}
                                </time>
                            </div>

                            <h3>{featured.title}</h3>

                            {featured.excerpt && (
                                <p>{featured.excerpt}</p>
                            )}

                            <span className="recent-news-read">
                                Read story
                                <span aria-hidden="true">↗</span>
                            </span>
                        </div>
                    </Link>
                </article>

                {/* Supporting news */}
                <div className="recent-news-list">
                    {supportingPosts.map((post) => {
                        const image = getImageUrl(post.featuredImage);

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
                                                        "object"
                                                        ? post.featuredImage?.alt ||
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
                                                    post.publishedAt || undefined
                                                }
                                            >
                                                {formatDate(post.publishedAt)}
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
    </section >
  );
}