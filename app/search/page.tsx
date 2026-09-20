import Link from "next/link";
import { cache } from "react";
import { payloadFetch } from "@/lib/payload";
import "./search.css";

type SearchParams = Promise<{
  q?: string;
}>;

type Category = {
  id: number | string;
  slug?: string | null;
  name?: string | null;
};

type Post = {
  id: number | string;
  title?: string | null;
  slug?: string | null;
  excerpt?: string | null;
  publishedAt?: string | null;
  category?: Category | number | string | null;
};

type PayloadResponse<T> = {
  docs?: T[];
};

const ALLOWED_CATEGORIES = new Set([
  "blogs",
  "reviews",
  "news",
  "alternatives",
  "comparisons",
]);

const SUGGESTED_SEARCHES = [
  "Best AI Image Generators",
  "Grok AI Review",
  "Best AI Website Builders",
  "AI Video Generators",
  "ChatGPT Alternatives",
  "Cursor AI Review",
  "AI SEO Tools",
  "Google AI Mode",
];

function cleanText(value?: string | null) {
  return value?.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim() || "";
}

function getCategory(post: Post): Category | null {
  return typeof post.category === "object" && post.category
    ? post.category
    : null;
}

function isValidPost(post: Post) {
  const category = getCategory(post);

  return Boolean(
    post.id &&
      post.slug &&
      post.title &&
      category?.slug &&
      ALLOWED_CATEGORIES.has(category.slug),
  );
}

const MAX_SEARCH_RESULTS = 20;
const MAX_QUERY_LENGTH = 100;

async function searchPosts(query: string): Promise<Post[]> {
  const normalizedQuery = query.trim().slice(
    0,
    MAX_QUERY_LENGTH,
  );

  if (!normalizedQuery) {
    return [];
  }

  try {
    const params = new URLSearchParams();

    params.set("q", normalizedQuery);
    params.set("limit", String(MAX_SEARCH_RESULTS));

    const data = await payloadFetch<PayloadResponse<Post>>(
      `/posts/search?${params.toString()}`,
      {
        next: {
          revalidate: 300,
          tags: ["search", "posts"],
        },
      },
    );

    return (data?.docs || []).filter(isValidPost);
  } catch (error) {
    console.error(
      "[AlloyPress Search] Search request failed:",
      error,
    );

    return [];
  }
}

const getSuggestedPosts = cache(
  async (): Promise<Post[]> => {
    try {
      const data =
        await payloadFetch<PayloadResponse<Post>>(
          "/posts" +
            "?where[workflowStatus][equals]=published" +
            "&limit=8" +
            "&depth=1" +
            "&sort=-publishedAt" +
            "&select[id]=true" +
            "&select[title]=true" +
            "&select[slug]=true" +
            "&select[excerpt]=true" +
            "&select[publishedAt]=true" +
            "&select[category]=true",
          {
            next: {
              revalidate: 300,
              tags: ["posts"],
            },
          },
        );

      return (data?.docs || [])
        .filter(isValidPost)
        .slice(0, 6);
    } catch (error) {
      console.error(
        "[AlloyPress Search] Suggested posts failed:",
        error,
      );

      return [];
    }
  },
);

function formatDate(value?: string | null) {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { q = "" } = await searchParams;

  const query = q
    .trim()
    .slice(0, MAX_QUERY_LENGTH);

  /*
   * Important network optimisation:
   *
   * Search mode:
   *   -> fetch search results only
   *
   * Empty mode:
   *   -> fetch latest content only
   *
   * We no longer run both requests on every page visit.
   */

  const [results, suggestedPosts] =
    await Promise.all([
      query
        ? searchPosts(query)
        : Promise.resolve([]),
      query
        ? Promise.resolve([])
        : getSuggestedPosts(),
    ]);

  return (
    <main className="search-page">
      <section className="search-page-inner">
        <header className="search-page-header">
          <span className="search-page-eyebrow">
            ALLOYPRESS SEARCH
          </span>

          <h1>Search AlloyPress</h1>

          <p>
            Find articles, reviews, news, alternatives, and
            comparisons.
          </p>
        </header>

        <form
          className="search-page-form"
          method="GET"
          action="/search"
        >
          <div className="search-page-input-wrap">
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>

            <input
              type="search"
              name="q"
              defaultValue={query}
              placeholder="Search AI tools, reviews, news..."
              aria-label="Search AlloyPress"
              autoComplete="off"
              enterKeyHint="search"
              spellCheck={false}
            />

            <button type="submit">
              Search
            </button>
          </div>
        </form>

        {!query ? (
          <section className="search-discovery">
            <div className="search-discovery-header">
              <span className="search-section-label">
                EXPLORE ALLOYPRESS
              </span>

              <h2>What are you looking for?</h2>

              <p>
                Start with a popular topic or explore our latest
                AI content.
              </p>
            </div>

            <div className="search-suggestions">
              {SUGGESTED_SEARCHES.map(
                (suggestion) => (
                  <Link
                    key={suggestion}
                    href={`/search?q=${encodeURIComponent(
                      suggestion,
                    )}`}
                    className="search-suggestion"
                  >
                    <span>{suggestion}</span>
                    <span aria-hidden="true">
                      →
                    </span>
                  </Link>
                ),
              )}
            </div>

            {suggestedPosts.length > 0 && (
              <div className="search-suggested-posts">
                <div className="search-subsection-heading">
                  <span>Latest content</span>

                  <Link href="/blogs">
                    View all
                    <span aria-hidden="true">
                      →
                    </span>
                  </Link>
                </div>

                <div className="search-suggested-grid">
                  {suggestedPosts
                    .slice(0, 6)
                    .map((post) => {
                      const category =
                        getCategory(post);

                      if (
                        !category?.slug ||
                        !post.slug
                      ) {
                        return null;
                      }

                      return (
                        <Link
                          key={post.id}
                          href={`/${category.slug}/${post.slug}`}
                          className="search-suggested-card"
                        >
                          <div className="search-suggested-meta">
                            <span>
                              {category.name ||
                                category.slug}
                            </span>

                            {post.publishedAt && (
                              <span>
                                {formatDate(
                                  post.publishedAt,
                                )}
                              </span>
                            )}
                          </div>

                          <h3>{post.title}</h3>

                          {post.excerpt && (
                            <p>
                              {cleanText(
                                post.excerpt,
                              ).slice(0, 120)}
                              {cleanText(
                                post.excerpt,
                              ).length > 120
                                ? "..."
                                : ""}
                            </p>
                          )}

                          <span className="search-read-link">
                            Read article
                            <span aria-hidden="true">
                              →
                            </span>
                          </span>
                        </Link>
                      );
                    })}
                </div>
              </div>
            )}
          </section>
        ) : (
          <section className="search-results">
            <div className="search-results-heading">
              <span>
                {results.length} result
                {results.length === 1
                  ? ""
                  : "s"}
              </span>

              <strong>
                for “{query}”
              </strong>
            </div>

            {results.length > 0 ? (
              <div className="search-results-list">
                {results.map((post) => {
                  const category =
                    getCategory(post);

                  if (
                    !category?.slug ||
                    !post.slug
                  ) {
                    return null;
                  }

                  return (
                    <Link
                      key={post.id}
                      href={`/${category.slug}/${post.slug}`}
                      className="search-result-card"
                    >
                      <div className="search-result-meta">
                        <span>
                          {category.name ||
                            category.slug}
                        </span>

                        {post.publishedAt && (
                          <span>
                            ·{" "}
                            {formatDate(
                              post.publishedAt,
                            )}
                          </span>
                        )}
                      </div>

                      <h2>{post.title}</h2>

                      {post.excerpt && (
                        <p>
                          {cleanText(
                            post.excerpt,
                          )}
                        </p>
                      )}

                      <span className="search-result-link">
                        Read article
                        <span aria-hidden="true">
                          →
                        </span>
                      </span>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="search-no-results">
                <div className="search-no-results-icon">
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  >
                    <circle
                      cx="11"
                      cy="11"
                      r="7"
                    />
                    <path d="m20 20-4-4" />
                  </svg>
                </div>

                <h2>
                  No results found for “{query}”
                </h2>

                <p>
                  We couldn't find a direct match.
                  Try another keyword or explore
                  one of the topics below.
                </p>
              </div>
            )}

            <section className="search-more">
              <div className="search-more-header">
                <span className="search-section-label">
                  TRY THESE
                </span>

                <h2>
                  Explore related topics
                </h2>
              </div>

              <div className="search-suggestions">
                {SUGGESTED_SEARCHES.map(
                  (suggestion) => (
                    <Link
                      key={suggestion}
                      href={`/search?q=${encodeURIComponent(
                        suggestion,
                      )}`}
                      className="search-suggestion"
                    >
                      <span>{suggestion}</span>
                      <span aria-hidden="true">
                        →
                      </span>
                    </Link>
                  ),
                )}
              </div>
            </section>
          </section>
        )}
      </section>
    </main>
  );
}