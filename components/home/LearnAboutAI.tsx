import LearnAboutAICarousel from "./LearnAboutAICarousel";

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

const PAYLOAD_URL =
  process.env.PAYLOAD_API_URL || "http://localhost:3001/api";

async function getLearnPosts(): Promise<Post[]> {
  try {
    /* -------------------------------------------------------
       GET BLOGS CATEGORY
    ------------------------------------------------------- */

    const categoryResponse = await fetch(
      `${PAYLOAD_URL}/categories?where[slug][equals]=blogs&limit=1`,
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

    /* -------------------------------------------------------
       GET LATEST BLOG POSTS
    ------------------------------------------------------- */

    const postsResponse = await fetch(
      `${PAYLOAD_URL}/posts?where[workflowStatus][equals]=published&where[category][equals]=${encodeURIComponent(
        category.id
      )}&sort=-publishedAt&limit=9&depth=1`,
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

    return postsData?.docs || [];
  } catch {
    return [];
  }
}

function getImageUrl(
  featuredImage: Post["featuredImage"]
): string | null {
  if (!featuredImage) {
    return null;
  }

  if (
    typeof featuredImage === "object" &&
    featuredImage.url
  ) {
    return featuredImage.url;
  }

  return null;
}

function formatDate(date?: string | null) {
  if (!date) {
    return "";
  }

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

function getExcerpt(excerpt?: string | null) {
  if (!excerpt) {
    return "";
  }

  const clean = excerpt
    .replace(/<[^>]*>/g, "")
    .replace(/\s+/g, " ")
    .trim();

  if (clean.length <= 115) {
    return clean;
  }

  return `${clean.slice(0, 115)}…`;
}

export default async function LearnAboutAI() {
  const posts = await getLearnPosts();

  if (!posts.length) {
    return null;
  }

  const cards = posts
    .filter((post) => post?.slug && post?.title)
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
      image: getImageUrl(post.featuredImage),
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

        {/* -------------------------------------------------
           HEADER
        ------------------------------------------------- */}

        <div className="learn-ai-header">

          <div className="learn-ai-heading">
            <span
              className="learn-ai-heading-line"
              aria-hidden="true"
            />

            <h2 id="learn-ai-title">
              Learn about AI
            </h2>
          </div>

          <a
            href="/blogs"
            className="learn-ai-view-all"
          >
            View all
            <span aria-hidden="true">→</span>
          </a>

        </div>

        {/* -------------------------------------------------
           CAROUSEL
        ------------------------------------------------- */}

        <LearnAboutAICarousel cards={cards} />

      </div>
    </section>
  );
}