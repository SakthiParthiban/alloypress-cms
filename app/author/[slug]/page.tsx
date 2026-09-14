import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { payloadFetch } from "@/lib/payload";

const PAYLOAD_URL =
  process.env.PAYLOAD_API_URL?.replace(/\/$/, "") ||
  "http://localhost:3001/api";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  "http://localhost:3000";

const AUTHOR = {
  name: "AlloyPress Team",
  slug: "alloypress-team",
  role: "AI Research & Editorial Team",
  bio: "We test AI tools, compare alternatives, verify claims, and turn fast-moving AI updates into practical information people can actually use.",
  shortBio:
    "Independent AI reviews, comparisons, tutorials, and news — tested and written for real people.",
  location: "Independent AI publication",
  joined: "Publishing since 2024",
};

type Post = {
  id: string | number;
  title: string;
  slug: string;
  excerpt?: string | null;
  publishedAt?: string | null;
  author?: string | { name?: string | null } | null;
  category?: string | { name?: string; slug?: string } | null;
  featuredImage?: string | number | { url?: string | null; alt?: string | null } | null;
};

async function getAuthorPosts(): Promise<Post[]> {
  try {
    const data = await payloadFetch<{ docs?: Post[] }>(
      "/posts?where[workflowStatus][equals]=published&sort=-publishedAt&limit=18&depth=1",
      {
        next: {
          revalidate: 60,
          tags: ["author:alloypress-team"],
        },
      },
    );

    const posts = Array.isArray(data?.docs) ? data.docs : [];

    return posts
      .filter((post: Post) => {
        const author =
          typeof post.author === "string"
            ? post.author
            : post.author?.name || "";

        return author.toLowerCase().includes("alloypress");
      })
      .filter(
        (post: Post) =>
          post.title &&
          post.slug &&
          !/^untitled wordpress post/i.test(post.title),
      )
      .slice(0, 9);
  } catch {
    return [];
  }
}

function getImageUrl(post: Post) {
  const image = post.featuredImage;

  if (!image) return null;

  if (typeof image === "object" && image?.url) {
    return image.url.startsWith("http")
      ? image.url
      : `${PAYLOAD_URL.replace(/\/api$/, "")}${image.url}`;
  }

  if (typeof image === "number") {
    return `${PAYLOAD_URL}/media/${image}`;
  }

  return null;
}

function getCategory(post: Post) {
  if (typeof post.category === "object" && post.category) {
    return {
      name: post.category.name || "AI",
      slug: post.category.slug || "blogs",
    };
  }

  return {
    name: typeof post.category === "string" ? post.category : "AI",
    slug: "blogs",
  };
}

function formatDate(value?: string | null) {
  if (!value) return "Recently";

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

export async function generateMetadata(): Promise<Metadata> {
  const title = `${AUTHOR.name} — AI Research & Editorial Team | AlloyPress`;
  const description =
    "Meet the AlloyPress Team — the researchers and editors testing AI tools, comparing alternatives, and explaining AI with practical, reader-first standards.";

  return {
    title,
    description,
    alternates: {
      canonical: `${SITE_URL}/author/${AUTHOR.slug}`,
    },
    openGraph: {
      title,
      description,
      type: "profile",
      url: `${SITE_URL}/author/${AUTHOR.slug}`,
      siteName: "AlloyPress",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function AuthorPage() {
  const posts = await getAuthorPosts();
  const featured = posts[0] ?? null;
  const remaining = posts.slice(1);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: AUTHOR.name,
    url: `${SITE_URL}/author/${AUTHOR.slug}`,
    jobTitle: AUTHOR.role,
    description: AUTHOR.bio,
    worksFor: {
      "@type": "Organization",
      name: "AlloyPress",
      url: SITE_URL,
    },
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: styles }} />

      <main className="author-page">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />

        {/* HERO */}
        <section className="author-hero">
          <div className="author-hero-grid" aria-hidden="true" />
          <div className="author-hero-dots" aria-hidden="true" />
          <div className="author-signal author-signal-one" aria-hidden="true" />
          <div className="author-signal author-signal-two" aria-hidden="true" />

          <div className="author-container author-hero-inner">
            <div className="author-hero-copy">
              <div className="eyebrow eyebrow-light">
                <span className="eyebrow-dot" />
                AUTHOR / ALLOYPRESS
              </div>

              <h1>
                We test AI tools
                <br />
                <span>before we write</span>
                <br />
                about any of them.
              </h1>

              <p className="author-hero-description">
                Independent AI research, hands-on testing, and practical
                editorial work designed to make fast-moving AI easier to
                understand and use.
              </p>

              <div className="author-tags">
                <span>REAL TESTS</span>
                <span>HONEST REVIEWS</span>
                <span>AI RESEARCH</span>
                <span>PRACTICAL GUIDES</span>
              </div>
            </div>

            <aside className="author-profile-card">
              <div className="profile-card-pattern" aria-hidden="true" />
              <div className="profile-mark">A</div>

              <div className="profile-card-kicker">AUTHOR PROFILE</div>
              <h2>{AUTHOR.name}</h2>
              <p>{AUTHOR.role}</p>

              <div className="profile-divider" />

              <div className="profile-meta">
                <span>FOCUS</span>
                <strong>AI TOOLS + EDUCATION</strong>
              </div>
              <div className="profile-meta">
                <span>METHOD</span>
                <strong>TEST · VERIFY · EXPLAIN</strong>
              </div>
              <div className="profile-meta">
                <span>PUBLICATION</span>
                <strong>ALLOYPRESS</strong>
              </div>

              <div className="profile-mini-grid">
                <div>
                  <b>01</b>
                  <span>Tested</span>
                </div>
                <div>
                  <b>02</b>
                  <span>Compared</span>
                </div>
                <div>
                  <b>03</b>
                  <span>Explained</span>
                </div>
                <div>
                  <b>04</b>
                  <span>Updated</span>
                </div>
              </div>
            </aside>
          </div>
        </section>

        {/* QUICK FACTS */}
        <section className="author-facts">
          <div className="author-container facts-grid">
            <div className="fact">
              <span>01</span>
              <strong>Hands-on</strong>
              <small>AI tool testing</small>
            </div>
            <div className="fact">
              <span>02</span>
              <strong>Reader-first</strong>
              <small>Clear practical writing</small>
            </div>
            <div className="fact">
              <span>03</span>
              <strong>Evidence-led</strong>
              <small>Claims checked before publishing</small>
            </div>
            <div className="fact">
              <span>04</span>
              <strong>Current</strong>
              <small>Content kept useful over time</small>
            </div>
          </div>
        </section>

        {/* ABOUT */}
        <section className="author-section author-about">
          <div className="section-texture" aria-hidden="true" />
          <div className="author-container">
            <div className="section-heading compact-heading">
              <div>
                <div className="eyebrow">
                  <span className="eyebrow-dot" />
                  WHO WE ARE
                </div>
                <h2>AlloyPress started — and who we actually are</h2>
              </div>
              <span className="section-index">01 / 05</span>
            </div>

            <div className="about-layout">
              <div className="about-lead">
                <p>
                  AlloyPress is built around a simple editorial idea: AI
                  coverage should help people make better decisions, not add
                  more noise.
                </p>
                <p>
                  Our team researches tools, runs practical tests, compares
                  competing products, and translates technical changes into
                  clear guidance. When something is useful, we explain why.
                  When it is not, we say that too.
                </p>
              </div>

              <div className="about-detail">
                <p>
                  We cover the parts of AI that matter after the headline:
                  what a tool actually does, where it fits, what it costs,
                  what its limitations are, and who should use it.
                </p>

                <div className="quote-strip">
                  <span>EDITORIAL PRINCIPLE</span>
                  <strong>Useful information over impressive-sounding claims.</strong>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* EXPERTISE */}
        <section className="author-section author-expertise">
          <div className="author-container">
            <div className="section-heading">
              <div>
                <div className="eyebrow">
                  <span className="eyebrow-dot" />
                  AREAS OF COVERAGE
                </div>
                <h2>Our areas of editorial expertise</h2>
                <p>
                  Focused coverage across the AI categories readers use most.
                </p>
              </div>
              <span className="section-index">02 / 05</span>
            </div>

            <div className="expertise-grid">
              {[
                ["01", "AI Tool Reviews", "Hands-on testing, features, pricing, strengths and limitations."],
                ["02", "AI Comparisons", "Side-by-side analysis when choosing between similar tools."],
                ["03", "AI Alternatives", "Useful alternatives when the obvious option is not the right fit."],
                ["04", "AI News", "Important launches, updates, model changes and industry shifts."],
                ["05", "Guides & Tutorials", "Step-by-step explanations that help readers get results."],
                ["06", "AI Education", "Plain-language explanations of concepts, products and workflows."],
              ].map(([number, title, text]) => (
                <article className="expertise-card" key={number}>
                  <span className="card-number">{number}</span>
                  <span className="card-marker">+</span>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ / QUESTIONS */}
        <section className="author-section author-faq">
          <div className="section-texture" aria-hidden="true" />
          <div className="author-container">
            <div className="section-heading">
              <div>
                <div className="eyebrow">
                  <span className="eyebrow-dot" />
                  BEFORE YOU READ
                </div>
                <h2>A few questions people ask</h2>
                <p>
                  The editorial approach behind our reviews, guides, and
                  recommendations.
                </p>
              </div>
              <span className="section-index">03 / 05</span>
            </div>

            <div className="faq-list">
              {[
                [
                  "Do you actually test every product you review?",
                  "Our reviews are built around hands-on evaluation whenever access allows. We test the workflows and features that matter to the use case instead of relying only on product pages or launch claims.",
                ],
                [
                  "Are your recommendations paid for?",
                  "Editorial decisions are not based on whether a product is popular or promoted. We focus on usefulness, real-world performance, limitations, and fit for the reader.",
                ],
                [
                  "How do you compare AI tools?",
                  "We compare tools against the same practical criteria wherever possible: output quality, usability, features, speed, pricing, limitations, and the audience each product serves best.",
                ],
                [
                  "Do you update older articles?",
                  "Yes. AI changes quickly, so useful evergreen pages should not be treated as finished forever. Important changes to products, pricing, capabilities, or recommendations are reviewed and updated when needed.",
                ],
                [
                  "Why should I trust an AlloyPress recommendation?",
                  "Because the goal is not to recommend the most tools. It is to reduce the number of tools you need to consider and give you enough context to make a confident decision.",
                ],
              ].map(([question, answer], index) => (
                <details className="faq-item" key={question}>
                  <summary>
                    <span className="faq-number">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="faq-question">{question}</span>
                    <span className="faq-symbol" aria-hidden="true">+</span>
                  </summary>
                  <div className="faq-answer">
                    <p>{answer}</p>
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* PROCESS */}
        <section className="author-section author-process">
          <div className="process-glow" aria-hidden="true" />
          <div className="author-container">
            <div className="section-heading section-heading-dark">
              <div>
                <div className="eyebrow eyebrow-light">
                  <span className="eyebrow-dot" />
                  TESTING AND RESEARCH
                </div>
                <h2>Our testing process, step by step</h2>
                <p>
                  A repeatable process keeps the work practical, transparent,
                  and useful across different AI categories.
                </p>
              </div>
              <span className="section-index">04 / 05</span>
            </div>

            <div className="process-list">
              {[
                ["01", "We start with a real use case", "We define what the reader needs the tool to accomplish before evaluating features."],
                ["02", "We run a practical workflow", "We use the product for the task it claims to solve instead of judging it from marketing copy."],
                ["03", "We document quality with original evidence", "Where useful, we record outputs, limitations, workflow friction, pricing and other observable details."],
                ["04", "We check the facts before publishing", "Product claims, features, pricing and important context are checked against reliable sources and the product itself."],
                ["05", "We write for the decision, not the hype", "The final article explains who the tool is for, where it works, where it falls short, and what alternatives deserve attention."],
                ["06", "We revisit when things change", "Important changes can trigger updates so older pages remain useful rather than quietly becoming outdated."],
              ].map(([number, title, text]) => (
                <article className="process-row" key={number}>
                  <span className="process-number">{number}</span>
                  <div>
                    <h3>{title}</h3>
                    <p>{text}</p>
                  </div>
                  <span className="process-arrow">↗</span>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* WHAT WE DO / DON'T */}
        <section className="author-section author-standards">
          <div className="author-container">
            <div className="section-heading">
              <div>
                <div className="eyebrow">
                  <span className="eyebrow-dot" />
                  EDITORIAL VALUES
                </div>
                <h2>What we do — and what we don&apos;t</h2>
                <p>Simple rules keep our coverage useful and grounded.</p>
              </div>
              <span className="section-index">05 / 05</span>
            </div>

            <div className="standards-grid">
              <article className="standard-card positive">
                <span className="standard-icon">+</span>
                <div>
                  <h3>We test before we recommend</h3>
                  <p>Practical evaluation comes before a strong recommendation.</p>
                </div>
              </article>
              <article className="standard-card negative">
                <span className="standard-icon">×</span>
                <div>
                  <h3>We don&apos;t publish hype as evidence</h3>
                  <p>Marketing language alone is not enough to support a claim.</p>
                </div>
              </article>
              <article className="standard-card positive">
                <span className="standard-icon">+</span>
                <div>
                  <h3>We explain limitations</h3>
                  <p>A useful review includes the reasons a product may not be right for you.</p>
                </div>
              </article>
              <article className="standard-card negative">
                <span className="standard-icon">×</span>
                <div>
                  <h3>We don&apos;t pretend every tool is for everyone</h3>
                  <p>Audience fit matters as much as feature count.</p>
                </div>
              </article>
              <article className="standard-card positive">
                <span className="standard-icon">+</span>
                <div>
                  <h3>We keep important pages current</h3>
                  <p>AI changes fast, so useful coverage needs maintenance.</p>
                </div>
              </article>
              <article className="standard-card negative">
                <span className="standard-icon">×</span>
                <div>
                  <h3>We don&apos;t bury the answer</h3>
                  <p>Readers should not have to fight through filler to reach the useful part.</p>
                </div>
              </article>
            </div>
          </div>
        </section>

        {/* ARTICLES */}
        <section className="author-section author-articles">
          <div className="author-container">
            <div className="section-heading articles-heading">
              <div>
                <div className="eyebrow">
                  <span className="eyebrow-dot" />
                  LATEST WORK
                </div>
                <h2>Articles published by the AlloyPress Team</h2>
              </div>
              <Link className="view-all" href="/blogs">
                View all <span>→</span>
              </Link>
            </div>

            {featured ? (
              <div className="articles-layout">
                <Link
                  href={`/blog/${featured.slug}`}
                  className="featured-article"
                >
                  <div className="featured-image">
                    {getImageUrl(featured) ? (
                      <Image
                        src={getImageUrl(featured)!}
                        alt={
                          typeof featured.featuredImage === "object" &&
                            featured.featuredImage?.alt
                            ? featured.featuredImage.alt
                            : featured.title
                        }
                        fill
                        sizes="(max-width: 900px) 100vw, 58vw"
                      />
                    ) : (
                      <div className="image-fallback">
                        <span>ALLOYPRESS</span>
                      </div>
                    )}
                    <span className="featured-badge">FEATURED WORK</span>
                  </div>

                  <div className="featured-copy">
                    <div className="article-meta">
                      <span>{getCategory(featured).name}</span>
                      <span>{formatDate(featured.publishedAt)}</span>
                    </div>
                    <h3>{featured.title}</h3>
                    <p>
                      {featured.excerpt ||
                        "Practical AI research, testing, and analysis from the AlloyPress Team."}
                    </p>
                    <span className="read-link">Read article ↗</span>
                  </div>
                </Link>

                <div className="article-list">
                  {remaining.slice(0, 4).map((post, index) => {
                    const category = getCategory(post);

                    return (
                      <Link
                        href={`/blog/${post.slug}`}
                        className="article-row"
                        key={post.id}
                      >
                        <div className="article-row-image">
                          {getImageUrl(post) ? (
                            <Image
                              src={getImageUrl(post)!}
                              alt={
                                typeof post.featuredImage === "object" &&
                                  post.featuredImage?.alt
                                  ? post.featuredImage.alt
                                  : post.title
                              }
                              fill
                              sizes="96px"
                            />
                          ) : (
                            <span>{String(index + 1).padStart(2, "0")}</span>
                          )}
                        </div>

                        <div className="article-row-copy">
                          <div className="article-meta">
                            <span>{category.name}</span>
                            <span>{formatDate(post.publishedAt)}</span>
                          </div>
                          <h3>{post.title}</h3>
                        </div>

                        <span className="article-row-arrow">↗</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="empty-articles">
                <span>ALLOYPRESS / ARTICLES</span>
                <h3>Our latest work will appear here.</h3>
                <p>
                  Published articles from the AlloyPress Team are connected
                  directly to this author page.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* CTA */}
        <section className="author-cta">
          <div className="cta-grid" aria-hidden="true" />
          <div className="cta-glow" aria-hidden="true" />
          <div className="author-container cta-inner">
            <div>
              <div className="eyebrow eyebrow-light">
                <span className="eyebrow-dot" />
                KEEP EXPLORING
              </div>
              <h2>
                Better AI decisions
                <br />
                start with <span>better context.</span>
              </h2>
            </div>

            <div className="cta-actions">
              <Link href="/blogs" className="cta-primary">
                Explore articles <span>→</span>
              </Link>
              <Link href="/reviews" className="cta-secondary">
                Browse reviews
              </Link>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}

const styles = `
:root {
  --author-brand: #18b968;
  --author-brand-bright: #22d17b;
  --author-ink: #10151b;
  --author-muted: #69737d;
  --author-line: rgba(16, 21, 27, .10);
  --author-soft: #f5f7f7;
  --author-dark: #0b1016;
  --author-dark-card: #121a21;
  --author-dark-line: rgba(255,255,255,.09);
}

.author-page {
  color: var(--author-ink);
  background: #fff;
  overflow: hidden;
}

.author-container {
  width: min(1160px, calc(100% - 40px));
  margin: 0 auto;
}

.eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: var(--author-brand);
  font: 700 10px/1 "DM Mono", monospace;
  letter-spacing: .12em;
  text-transform: uppercase;
}

.eyebrow-light {
  color: #22d17b;
}

.eyebrow-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: currentColor;
  box-shadow: 0 0 0 3px rgba(24,185,104,.10);
}

.author-hero {
  position: relative;
  min-height: 570px;
  display: flex;
  align-items: center;
  background:
    linear-gradient(135deg, rgba(24,185,104,.035), transparent 42%),
    #0b1016;
  color: #f4f8f6;
  isolation: isolate;
}

.author-hero-grid {
  position: absolute;
  inset: 0;
  z-index: -3;
  opacity: .45;
  background-image:
    linear-gradient(rgba(255,255,255,.055) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,.055) 1px, transparent 1px);
  background-size: 72px 72px;
  mask-image: linear-gradient(90deg, black, transparent 82%);
}

.author-hero-dots {
  position: absolute;
  inset: 0;
  z-index: -2;
  opacity: .28;
  background-image: radial-gradient(rgba(39,215,126,.55) .8px, transparent .8px);
  background-size: 14px 14px;
  mask-image: linear-gradient(90deg, black 0 55%, transparent 88%);
}

.author-hero::after {
  content: "";
  position: absolute;
  width: 560px;
  height: 560px;
  right: -180px;
  top: -170px;
  z-index: -2;
  background: radial-gradient(circle, rgba(24,185,104,.16), transparent 67%);
  pointer-events: none;
}

.author-signal {
  position: absolute;
  width: 90px;
  height: 1px;
  background: rgba(34,209,123,.35);
  transform: rotate(-28deg);
  right: 8%;
  top: 20%;
  opacity: .65;
}

.author-signal::after {
  content: "";
  position: absolute;
  right: 0;
  top: -2px;
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #22d17b;
}

.author-signal-two {
  width: 150px;
  right: 20%;
  top: auto;
  bottom: 16%;
  transform: rotate(-28deg);
  opacity: .32;
}

.author-signal-two::after {
  opacity: .7;
}

.author-hero-inner {
  display: grid;
  grid-template-columns: minmax(0, 1.08fr) minmax(340px, .72fr);
  gap: 70px;
  align-items: center;
  padding: 74px 0;
}

.author-hero-copy h1 {
  max-width: 700px;
  margin: 18px 0 20px;
  color: #f4f8f6;
  font-family: "Sora", sans-serif;
  font-size: clamp(42px, 5vw, 68px);
  font-weight: 700;
  line-height: .99;
  letter-spacing: -.055em;
}

.author-hero-copy h1 span {
  color: #20cc74;
}

.author-hero-description {
  max-width: 650px;
  margin: 0;
  color: rgba(244,248,246,.66);
  font: 400 15px/1.75 "Lora", serif;
}

.author-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
  margin-top: 24px;
}

.author-tags span {
  padding: 8px 10px;
  border: 1px solid rgba(255,255,255,.10);
  border-radius: 7px;
  background: rgba(255,255,255,.035);
  color: rgba(244,248,246,.58);
  font: 600 8px/1 "DM Mono", monospace;
  letter-spacing: .04em;
}

.author-profile-card {
  position: relative;
  overflow: hidden;
  padding: 25px;
  border: 1px solid rgba(255,255,255,.08);
  border-radius: 12px;
  background: linear-gradient(145deg, #121b22, #10171e);
  box-shadow: 0 24px 70px rgba(0,0,0,.24);
}

.profile-card-pattern {
  position: absolute;
  inset: 0;
  opacity: .45;
  background:
    linear-gradient(135deg, transparent 0 49%, rgba(34,209,123,.08) 50%, transparent 51%),
    repeating-linear-gradient(90deg, transparent 0 34px, rgba(255,255,255,.035) 35px, transparent 36px);
  pointer-events: none;
}

.profile-mark {
  position: relative;
  width: 44px;
  height: 44px;
  display: grid;
  place-items: center;
  margin-bottom: 22px;
  border-radius: 8px;
  background: #18b968;
  color: #fff;
  font: 700 17px/1 "Sora", sans-serif;
}

.profile-card-kicker,
.profile-meta span {
  color: #5ed995;
  font: 700 8px/1.2 "DM Mono", monospace;
  letter-spacing: .09em;
  text-transform: uppercase;
}

.author-profile-card h2 {
  position: relative;
  margin: 8px 0 4px;
  color: #f4f8f6;
  font: 700 23px/1.1 "Sora", sans-serif;
  letter-spacing: -.035em;
}

.author-profile-card > p {
  position: relative;
  margin: 0;
  color: rgba(244,248,246,.5);
  font: 400 11px/1.5 "DM Mono", monospace;
}

.profile-divider {
  height: 1px;
  margin: 21px 0 17px;
  background: rgba(255,255,255,.08);
}

.profile-meta {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  padding: 9px 0;
  border-bottom: 1px solid rgba(255,255,255,.055);
}

.profile-meta strong {
  color: rgba(244,248,246,.66);
  font: 600 8px/1.3 "DM Mono", monospace;
  text-align: right;
}

.profile-mini-grid {
  position: relative;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 6px;
  margin-top: 18px;
}

.profile-mini-grid div {
  padding: 11px 8px;
  border: 1px solid rgba(255,255,255,.06);
  border-radius: 6px;
  background: rgba(255,255,255,.025);
}

.profile-mini-grid b,
.profile-mini-grid span {
  display: block;
}

.profile-mini-grid b {
  color: #22d17b;
  font: 700 10px/1 "DM Mono", monospace;
}

.profile-mini-grid span {
  margin-top: 6px;
  color: rgba(244,248,246,.45);
  font: 500 7px/1 "DM Mono", monospace;
}

.author-facts {
  border-bottom: 1px solid var(--author-line);
  background: #fff;
}

.facts-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
}

.fact {
  position: relative;
  min-height: 96px;
  display: grid;
  grid-template-columns: 30px 1fr;
  grid-template-rows: auto auto;
  align-content: center;
  padding: 17px 22px;
  border-right: 1px solid var(--author-line);
}

.fact:first-child {
  border-left: 1px solid var(--author-line);
}

.fact span {
  grid-row: 1 / 3;
  color: #a2abb1;
  font: 700 8px/1 "DM Mono", monospace;
}

.fact strong {
  color: var(--author-ink);
  font: 700 12px/1.2 "Sora", sans-serif;
}

.fact small {
  margin-top: 5px;
  color: #8a949c;
  font: 400 8px/1.3 "DM Mono", monospace;
}

.author-section {
  position: relative;
  padding: 54px 0;
}

.author-about {
  background: #fff;
}

.section-texture {
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: .55;
  background-image:
    radial-gradient(rgba(24,185,104,.15) .7px, transparent .7px),
    linear-gradient(90deg, transparent 0 49.8%, rgba(16,21,27,.045) 50%, transparent 50.2%);
  background-size: 14px 14px, 100% 100%;
  mask-image: linear-gradient(90deg, black, transparent 72%);
}

.section-heading {
  position: relative;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 30px;
  margin-bottom: 28px;
}

.section-heading h2 {
  max-width: 760px;
  margin: 10px 0 0;
  color: var(--author-ink);
  font: 700 clamp(25px, 3vw, 34px)/1.08 "Sora", sans-serif;
  letter-spacing: -.045em;
}

.section-heading p {
  max-width: 620px;
  margin: 9px 0 0;
  color: var(--author-muted);
  font: 400 12px/1.6 "Lora", serif;
}

.section-index {
  flex: none;
  color: #a2abb1;
  font: 600 9px/1 "DM Mono", monospace;
  letter-spacing: .05em;
}

.about-layout {
  display: grid;
  grid-template-columns: 1.1fr .9fr;
  gap: 60px;
}

.about-lead {
  padding-right: 35px;
  border-right: 1px solid var(--author-line);
}

.about-lead p,
.about-detail > p {
  margin: 0 0 17px;
  color: #667078;
  font: 400 13px/1.8 "Lora", serif;
}

.about-lead p:first-child {
  color: var(--author-ink);
  font-size: 16px;
  line-height: 1.65;
}

.quote-strip {
  margin-top: 26px;
  padding: 16px 18px;
  border: 1px solid rgba(24,185,104,.14);
  border-left: 2px solid var(--author-brand);
  border-radius: 7px;
  background: rgba(24,185,104,.035);
}

.quote-strip span {
  display: block;
  margin-bottom: 7px;
  color: var(--author-brand);
  font: 700 8px/1 "DM Mono", monospace;
  letter-spacing: .08em;
}

.quote-strip strong {
  color: #3e474e;
  font: 600 11px/1.55 "Sora", sans-serif;
}

.author-expertise {
  background:
    linear-gradient(180deg, #fff 0%, #f8faf9 100%);
}

.expertise-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.expertise-card {
  position: relative;
  min-height: 126px;
  padding: 17px 18px;
  overflow: hidden;
  border: 1px solid var(--author-line);
  border-radius: 8px;
  background: linear-gradient(145deg, #ffffff, #f4f7f5);
  transition: transform .22s ease, border-color .22s ease, box-shadow .22s ease;
}

.expertise-card:hover {
  transform: translateY(-3px);
  border-color: rgba(24,185,104,.32);
  box-shadow: 0 14px 35px rgba(16,21,27,.07);
}

.expertise-card::before {
  content: "";
  position: absolute;
  top: 0;
  left: 18px;
  right: 18px;
  height: 1px;
  background: linear-gradient(90deg, rgba(24,185,104,.55), transparent 75%);
  opacity: .55;
}

.card-number {
  color: #a5adb2;
  font: 700 8px/1 "DM Mono", monospace;
}

.card-marker {
  position: absolute;
  top: 17px;
  right: 18px;
  color: var(--author-brand);
  font: 400 18px/1 "DM Mono", monospace;
}

.expertise-card h3 {
  margin: 22px 0 7px;
  color: var(--author-ink);
  font: 700 13px/1.35 "Sora", sans-serif;
}

.expertise-card p {
  margin: 0;
  color: #69747c;
  font: 400 11px/1.6 "Lora", serif;
}

.author-faq {
  background: #f5f7f7;
  border-top: 1px solid rgba(16,21,27,.04);
  border-bottom: 1px solid rgba(16,21,27,.04);
}

.faq-list {
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(16,21,27,.10);
  border-radius: 10px;
  background: #eef2f0;
  box-shadow: 0 12px 32px rgba(16,21,27,.045);
}

.faq-item {
  display: block;
  margin: 0;
  border: 0;
  border-bottom: 1px solid rgba(16,21,27,.09);
  background: #ffffff;
}

.faq-item:last-child {
  border-bottom: 0;
}

.faq-item summary {
  display: grid;
  grid-template-columns: 38px 1fr 22px;
  gap: 16px;
  align-items: center;
  min-height: 68px;
  padding: 15px 20px;
  cursor: pointer;
  list-style: none;
  user-select: none;
  transition: background .2s ease;
}

.faq-item summary::-webkit-details-marker {
  display: none;
}

.faq-item summary:hover {
  background: #f4f8f6;
}

.faq-item[open] summary {
  background: #f0f7f3;
}

.faq-number {
  color: var(--author-brand);
  font: 700 10px/1.4 "DM Mono", monospace;
}

.faq-question {
  color: var(--author-ink);
  font: 700 13px/1.4 "Sora", sans-serif;
  letter-spacing: -.015em;
}

.faq-symbol {
  width: 24px;
  height: 24px;
  display: grid;
  place-items: center;
  border: 1px solid rgba(24,185,104,.18);
  border-radius: 6px;
  background: rgba(24,185,104,.055);
  color: var(--author-brand);
  font: 500 16px/1 "DM Mono", monospace;
  transition: transform .2s ease, background .2s ease;
}

.faq-item[open] .faq-symbol {
  transform: rotate(45deg);
  background: rgba(24,185,104,.10);
}

.faq-answer {
  padding: 0 58px 17px 74px;
}

.faq-answer p {
  max-width: 900px;
  margin: 0;
  color: #66727a;
  font: 400 12px/1.7 "Lora", serif;
}



.author-process {
  color: #f4f8f6;
  background: #0b1016;
  isolation: isolate;
}

.author-process::before {
  content: "";
  position: absolute;
  inset: 0;
  z-index: -2;
  opacity: .36;
  background-image:
    linear-gradient(rgba(255,255,255,.055) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,.055) 1px, transparent 1px);
  background-size: 44px 44px;
  mask-image: linear-gradient(90deg, black, transparent 88%);
}

.author-process::after {
  content: "";
  position: absolute;
  inset: 0;
  z-index: -2;
  opacity: .22;
  background-image: radial-gradient(rgba(34,209,123,.55) .65px, transparent .65px);
  background-size: 13px 13px;
  mask-image: linear-gradient(90deg, black 0 70%, transparent);
}

.process-glow {
  position: absolute;
  width: 520px;
  height: 520px;
  right: -230px;
  top: 0;
  background: radial-gradient(circle, rgba(24,185,104,.13), transparent 68%);
  z-index: -1;
}

.section-heading-dark h2 {
  color: #f4f8f6;
}

.section-heading-dark p {
  color: rgba(244,248,246,.52);
}

.process-list {
  border: 1px solid var(--author-dark-line);
  border-radius: 8px;
  overflow: hidden;
  background: rgba(255,255,255,.025);
}

.process-row {
  display: grid;
  grid-template-columns: 44px 1fr 25px;
  gap: 18px;
  align-items: center;
  padding: 17px 20px;
  border-bottom: 1px solid rgba(255,255,255,.07);
  transition: background .2s ease;
}

.process-row:last-child {
  border-bottom: 0;
}

.process-row:hover {
  background: rgba(24,185,104,.055);
}

.process-number {
  color: #20cc74;
  font: 700 9px/1 "DM Mono", monospace;
}

.process-row h3 {
  margin: 0;
  color: #edf4f1;
  font: 700 12px/1.35 "Sora", sans-serif;
}

.process-row p {
  margin: 5px 0 0;
  color: rgba(237,244,241,.43);
  font: 400 10px/1.6 "Lora", serif;
}

.process-arrow {
  color: rgba(34,209,123,.7);
  font: 400 13px/1 "DM Mono", monospace;
}

.author-standards {
  background: #fff;
}

.standards-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.standard-card {
  display: grid;
  grid-template-columns: 34px 1fr;
  gap: 14px;
  padding: 17px 18px;
  border: 1px solid var(--author-line);
  border-radius: 8px;
  background: #f8faf9;
}

.standard-icon {
  width: 26px;
  height: 26px;
  display: grid;
  place-items: center;
  border-radius: 6px;
  font: 600 13px/1 "DM Mono", monospace;
}

.standard-card.positive .standard-icon {
  color: var(--author-brand);
  background: rgba(24,185,104,.07);
}

.standard-card.negative .standard-icon {
  color: #d78383;
  background: rgba(211,111,111,.07);
}

.standard-card h3 {
  margin: 1px 0 5px;
  color: var(--author-ink);
  font: 700 12px/1.4 "Sora", sans-serif;
}

.standard-card p {
  margin: 0;
  color: #69747c;
  font: 400 10px/1.6 "Lora", serif;
}

.expertise-card:nth-child(2),
.expertise-card:nth-child(5) {
  background: #edf7f1;
  border-color: rgba(24,185,104,.16);
}

.standard-card:nth-child(odd) {
  background: #f4f8f6;
}

.standard-card:nth-child(even) {
  background: #fbf8f8;
}

.author-articles {
  background: #f6f8f8;
  border-top: 1px solid rgba(16,21,27,.05);
}

.articles-heading {
  align-items: center;
}

.view-all {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  min-height: 34px;
  padding: 0 12px;
  border: 1px solid rgba(24,185,104,.18);
  border-radius: 8px;
  background: rgba(24,185,104,.07);
  color: var(--author-brand);
  font: 600 10px/1 "DM Mono", monospace;
  text-decoration: none;
  transition: all .22s ease;
}

.view-all:hover {
  color: #fff;
  background: var(--author-brand);
  border-color: var(--author-brand);
  transform: translateY(-1px);
}

.articles-layout {
  display: grid;
  grid-template-columns: 1.08fr .92fr;
  gap: 16px;
}

.featured-article {
  overflow: hidden;
  display: block;
  border: 1px solid var(--author-line);
  border-radius: 10px;
  background: #fff;
  text-decoration: none;
  transition: transform .25s ease, box-shadow .25s ease;
}

.featured-article:hover {
  transform: translateY(-3px);
  box-shadow: 0 18px 45px rgba(16,21,27,.08);
}

.featured-image {
  position: relative;
  aspect-ratio: 16 / 8.7;
  overflow: hidden;
  background: #e9eeec;
}

.featured-image img {
  object-fit: cover;
  transition: transform .45s ease;
}

.featured-article:hover .featured-image img {
  transform: scale(1.035);
}

.image-fallback {
  width: 100%;
  height: 100%;
  display: grid;
  place-items: center;
  background:
    linear-gradient(135deg, rgba(24,185,104,.16), transparent),
    #121a20;
  color: #20cc74;
  font: 700 11px/1 "DM Mono", monospace;
  letter-spacing: .1em;
}

.featured-badge {
  position: absolute;
  left: 14px;
  bottom: 14px;
  padding: 7px 9px;
  border: 1px solid rgba(255,255,255,.12);
  border-radius: 6px;
  background: rgba(11,16,22,.78);
  backdrop-filter: blur(8px);
  color: #63df98;
  font: 700 8px/1 "DM Mono", monospace;
}

.featured-copy {
  padding: 20px 21px 22px;
}

.article-meta {
  display: flex;
  align-items: center;
  gap: 9px;
  color: #8b959c;
  font: 600 8px/1 "DM Mono", monospace;
  text-transform: uppercase;
}

.article-meta span:first-child {
  color: var(--author-brand);
}

.featured-copy h3 {
  margin: 12px 0 8px;
  color: var(--author-ink);
  font: 700 20px/1.2 "Sora", sans-serif;
  letter-spacing: -.035em;
}

.featured-copy p {
  margin: 0;
  color: #7b858c;
  font: 400 11px/1.65 "Lora", serif;
}

.read-link {
  display: inline-block;
  margin-top: 17px;
  color: var(--author-brand);
  font: 700 9px/1 "DM Mono", monospace;
}

.article-list {
  display: grid;
  gap: 8px;
  align-content: start;
}

.article-row {
  min-height: 106px;
  display: grid;
  grid-template-columns: 88px 1fr 16px;
  gap: 12px;
  align-items: center;
  padding: 8px;
  border: 1px solid var(--author-line);
  border-radius: 8px;
  background: #fff;
  text-decoration: none;
  transition: transform .2s ease, border-color .2s ease;
}

.article-row:hover {
  transform: translateX(3px);
  border-color: rgba(24,185,104,.28);
}

.article-row-image {
  position: relative;
  overflow: hidden;
  width: 88px;
  height: 88px;
  border-radius: 6px;
  background: #edf2ef;
}

.article-row-image img {
  object-fit: cover;
}

.article-row-image > span {
  width: 100%;
  height: 100%;
  display: grid;
  place-items: center;
  color: var(--author-brand);
  background: #e9f3ed;
  font: 700 12px/1 "DM Mono", monospace;
}

.article-row-copy h3 {
  margin: 7px 0 0;
  color: var(--author-ink);
  font: 700 10px/1.38 "Sora", sans-serif;
}

.article-row-arrow {
  color: #9aa3a8;
  font: 400 13px/1 "DM Mono", monospace;
}

.empty-articles {
  padding: 35px;
  border: 1px dashed rgba(16,21,27,.14);
  border-radius: 8px;
  background: #fff;
}

.empty-articles > span {
  color: var(--author-brand);
  font: 700 8px/1 "DM Mono", monospace;
}

.empty-articles h3 {
  margin: 10px 0 5px;
  font: 700 18px/1.2 "Sora", sans-serif;
}

.empty-articles p {
  margin: 0;
  color: #7b858c;
  font: 400 11px/1.55 "Lora", serif;
}

.author-cta {
  position: relative;
  overflow: hidden;
  background: #0b1016;
  color: #f4f8f6;
  isolation: isolate;
}

.cta-grid {
  position: absolute;
  inset: 0;
  z-index: -2;
  opacity: .32;
  background-image:
    linear-gradient(rgba(255,255,255,.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,.05) 1px, transparent 1px);
  background-size: 52px 52px;
}

.cta-grid::after {
  content: "01   /   CONTEXT      02   /   TESTING      03   /   CLARITY";
  position: absolute;
  top: 26px;
  right: 30px;
  color: rgba(34,209,123,.32);
  font: 700 8px/1 "DM Mono", monospace;
  letter-spacing: .08em;
}

.cta-glow {
  position: absolute;
  width: 540px;
  height: 540px;
  left: -230px;
  bottom: -300px;
  z-index: -1;
  background: radial-gradient(circle, rgba(24,185,104,.14), transparent 67%);
}

.cta-inner {
  min-height: 300px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 40px;
  padding: 60px 0;
}

.cta-inner h2 {
  margin: 14px 0 0;
  color: #f4f8f6;
  font: 700 clamp(30px, 4vw, 46px)/1.04 "Sora", sans-serif;
  letter-spacing: -.05em;
}

.cta-inner h2 span {
  color: #20cc74;
}

.cta-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 9px;
}

.cta-primary,
.cta-secondary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 42px;
  padding: 0 15px;
  border-radius: 7px;
  text-decoration: none;
  font: 700 9px/1 "DM Mono", monospace;
  transition: all .2s ease;
}

.cta-primary {
  color: #07100b;
  background: #20cc74;
}

.cta-primary:hover {
  background: #32df85;
  transform: translateY(-2px);
}

.cta-secondary {
  border: 1px solid rgba(255,255,255,.13);
  color: rgba(244,248,246,.75);
  background: rgba(255,255,255,.03);
}

.cta-secondary:hover {
  border-color: rgba(34,209,123,.45);
  color: #22d17b;
}

@media (max-width: 950px) {
  .author-hero-inner {
    grid-template-columns: 1fr;
    gap: 35px;
  }

  .author-profile-card {
    max-width: 600px;
  }

  .about-layout {
    grid-template-columns: 1fr;
    gap: 28px;
  }

  .about-lead {
    padding-right: 0;
    border-right: 0;
  }

  .articles-layout {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 760px) {
  .author-container {
    width: min(100% - 28px, 620px);
  }

  .author-hero {
    min-height: auto;
  }

  .author-hero-inner {
    padding: 54px 0;
  }

  .author-hero-copy h1 {
    font-size: clamp(37px, 11vw, 52px);
  }

  .author-hero-description {
    font-size: 13px;
  }

  .facts-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .fact {
    min-height: 84px;
    padding: 13px 15px;
  }

  .fact:nth-child(2) {
    border-right: 0;
  }

  .fact:nth-child(3) {
    border-left: 1px solid var(--author-line);
    border-top: 1px solid var(--author-line);
  }

  .fact:nth-child(4) {
    border-top: 1px solid var(--author-line);
  }

  .author-section {
    padding: 44px 0;
  }

  .section-heading {
    align-items: flex-start;
    flex-direction: column;
    gap: 10px;
    margin-bottom: 21px;
  }

  .section-index {
    order: -1;
  }

  .section-heading h2 {
    font-size: 25px;
  }

  .expertise-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .expertise-card {
    min-height: 122px;
    padding: 15px;
  }

  .faq-item summary {
    grid-template-columns: 28px 1fr 22px;
    gap: 10px;
    min-height: 62px;
    padding: 13px 14px;
  }

  .faq-question {
    font-size: 12px;
  }

  .faq-answer {
    padding: 0 48px 15px 52px;
  }

  .faq-answer p {
    font-size: 11px;
  }

  .process-row {
    grid-template-columns: 31px 1fr 18px;
    gap: 10px;
    padding: 15px;
  }

  .standards-grid {
    grid-template-columns: 1fr;
  }

  .cta-inner {
    min-height: auto;
    align-items: flex-start;
    flex-direction: column;
    padding: 48px 0;
  }
}

@media (max-width: 520px) {
  .author-container {
    width: min(100% - 22px, 620px);
  }

  .author-tags span {
    font-size: 7px;
    padding: 7px 8px;
  }

  .profile-mini-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .expertise-grid {
    grid-template-columns: 1fr;
  }

  .expertise-card {
    min-height: 116px;
  }

  .faq-item p {
    font-size: 9px;
  }

  .article-row {
    grid-template-columns: 72px 1fr 12px;
    min-height: 88px;
  }

  .article-row-image {
    width: 72px;
    height: 72px;
  }

  .featured-copy h3 {
    font-size: 17px;
  }

  .cta-actions {
    width: 100%;
  }

  .cta-primary,
  .cta-secondary {
    flex: 1;
  }
}

@media (prefers-reduced-motion: reduce) {
  .expertise-card,
  .featured-article,
  .featured-image img,
  .article-row,
  .view-all,
  .cta-primary {
    transition: none;
  }
}

/* =========================================================
   ALLOYPRESS THEME OVERRIDES
   The global Navbar owns the theme switch. These selectors
   make the Author page follow the same document theme.
   Supports data-theme, .dark and dark body fallbacks.
   ========================================================= */

html[data-theme="dark"] .author-page,
html.dark .author-page,
body.dark .author-page {
  --author-ink: #f2f7f4;
  --author-muted: #9aa7a1;
  --author-line: rgba(255,255,255,.09);
  --author-soft: #11181d;
  --author-dark: #080d12;
  --author-dark-card: #10171d;
  --author-dark-line: rgba(255,255,255,.10);
  color: var(--author-ink);
  background: #0b1015;
}

html[data-theme="dark"] .author-page .author-facts,
html.dark .author-page .author-facts,
body.dark .author-page .author-facts {
  background: #0d1318;
  border-color: rgba(255,255,255,.08);
}

html[data-theme="dark"] .author-page .fact,
html.dark .author-page .fact,
body.dark .author-page .fact {
  border-color: rgba(255,255,255,.08);
}

html[data-theme="dark"] .author-page .fact strong,
html.dark .author-page .fact strong,
body.dark .author-page .fact strong {
  color: #edf5f1;
}

html[data-theme="dark"] .author-page .fact span,
html.dark .author-page .fact span,
body.dark .author-page .fact span {
  color: #68756f;
}

html[data-theme="dark"] .author-page .fact small,
html.dark .author-page .fact small,
body.dark .author-page .fact small {
  color: #87948d;
}

html[data-theme="dark"] .author-page .author-about,
html.dark .author-page .author-about,
body.dark .author-page .author-about {
  background: #0f151a;
}

html[data-theme="dark"] .author-page .author-expertise,
html.dark .author-page .author-expertise,
body.dark .author-page .author-expertise {
  background: linear-gradient(180deg, #0f151a 0%, #11191f 100%);
}

html[data-theme="dark"] .author-page .author-faq,
html.dark .author-page .author-faq,
body.dark .author-page .author-faq {
  background: #0b1116;
  border-color: rgba(255,255,255,.07);
}

html[data-theme="dark"] .author-page .author-standards,
html.dark .author-page .author-standards,
body.dark .author-page .author-standards {
  background: #0f151a;
}

html[data-theme="dark"] .author-page .author-articles,
html.dark .author-page .author-articles,
body.dark .author-page .author-articles {
  background: #0b1116;
  border-color: rgba(255,255,255,.07);
}

html[data-theme="dark"] .author-page .section-heading h2,
html.dark .author-page .section-heading h2,
body.dark .author-page .section-heading h2 {
  color: #f0f6f3;
}

html[data-theme="dark"] .author-page .section-heading p,
html.dark .author-page .section-heading p,
body.dark .author-page .section-heading p {
  color: #89968f;
}

html[data-theme="dark"] .author-page .section-index,
html.dark .author-page .section-index,
body.dark .author-page .section-index {
  color: #64716b;
}

html[data-theme="dark"] .author-page .section-texture,
html.dark .author-page .section-texture,
body.dark .author-page .section-texture {
  opacity: .42;
  background-image:
    radial-gradient(rgba(34,209,123,.22) .7px, transparent .7px),
    linear-gradient(90deg, transparent 0 49.8%, rgba(255,255,255,.035) 50%, transparent 50.2%);
}

html[data-theme="dark"] .author-page .about-lead,
html.dark .author-page .about-lead,
body.dark .author-page .about-lead {
  border-color: rgba(255,255,255,.09);
}

html[data-theme="dark"] .author-page .about-lead p,
html[data-theme="dark"] .author-page .about-detail > p,
html.dark .author-page .about-lead p,
html.dark .author-page .about-detail > p,
body.dark .author-page .about-lead p,
body.dark .author-page .about-detail > p {
  color: #9aa6a0;
}

html[data-theme="dark"] .author-page .about-lead p:first-child,
html.dark .author-page .about-lead p:first-child,
body.dark .author-page .about-lead p:first-child {
  color: #e7efeb;
}

html[data-theme="dark"] .author-page .quote-strip,
html.dark .author-page .quote-strip,
body.dark .author-page .quote-strip {
  border-color: rgba(34,209,123,.18);
  background: rgba(24,185,104,.055);
}

html[data-theme="dark"] .author-page .quote-strip strong,
html.dark .author-page .quote-strip strong,
body.dark .author-page .quote-strip strong {
  color: #d8e4de;
}

/* Expertise cards: darker surfaces + readable contrast */
html[data-theme="dark"] .author-page .expertise-card,
html.dark .author-page .expertise-card,
body.dark .author-page .expertise-card {
  background: linear-gradient(145deg, #151d23, #11181e);
  border-color: rgba(255,255,255,.09);
  box-shadow: inset 0 1px 0 rgba(255,255,255,.025);
}

html[data-theme="dark"] .author-page .expertise-card:nth-child(2),
html[data-theme="dark"] .author-page .expertise-card:nth-child(5),
html.dark .author-page .expertise-card:nth-child(2),
html.dark .author-page .expertise-card:nth-child(5),
body.dark .author-page .expertise-card:nth-child(2),
body.dark .author-page .expertise-card:nth-child(5) {
  background: linear-gradient(145deg, #10231b, #111c19);
  border-color: rgba(34,209,123,.20);
}

html[data-theme="dark"] .author-page .card-number,
html.dark .author-page .card-number,
body.dark .author-page .card-number {
  color: #69766f;
}

html[data-theme="dark"] .author-page .expertise-card h3,
html.dark .author-page .expertise-card h3,
body.dark .author-page .expertise-card h3 {
  color: #eef5f1;
}

html[data-theme="dark"] .author-page .expertise-card p,
html.dark .author-page .expertise-card p,
body.dark .author-page .expertise-card p {
  color: #9aa6a0;
}

/* FAQ becomes clearly interactive in dark mode */
html[data-theme="dark"] .author-page .faq-list,
html.dark .author-page .faq-list,
body.dark .author-page .faq-list {
  background: #10171d;
  border-color: rgba(255,255,255,.10);
  box-shadow: 0 18px 45px rgba(0,0,0,.18);
}

html[data-theme="dark"] .author-page .faq-item,
html.dark .author-page .faq-item,
body.dark .author-page .faq-item {
  background: #11181e;
  border-color: rgba(255,255,255,.075);
}

html[data-theme="dark"] .author-page .faq-item summary:hover,
html.dark .author-page .faq-item summary:hover,
body.dark .author-page .faq-item summary:hover {
  background: #151f24;
}

html[data-theme="dark"] .author-page .faq-item[open] summary,
html.dark .author-page .faq-item[open] summary,
body.dark .author-page .faq-item[open] summary {
  background: #12231b;
}

html[data-theme="dark"] .author-page .faq-question,
html.dark .author-page .faq-question,
body.dark .author-page .faq-question {
  color: #edf5f1;
}

html[data-theme="dark"] .author-page .faq-answer p,
html.dark .author-page .faq-answer p,
body.dark .author-page .faq-answer p {
  color: #9aa7a0;
}

/* Standards cards */
html[data-theme="dark"] .author-page .standard-card,
html.dark .author-page .standard-card,
body.dark .author-page .standard-card {
  background: #151c22;
  border-color: rgba(255,255,255,.09);
}

html[data-theme="dark"] .author-page .standard-card:nth-child(odd),
html.dark .author-page .standard-card:nth-child(odd),
body.dark .author-page .standard-card:nth-child(odd) {
  background: #12201a;
}

html[data-theme="dark"] .author-page .standard-card:nth-child(even),
html.dark .author-page .standard-card:nth-child(even),
body.dark .author-page .standard-card:nth-child(even) {
  background: #19171a;
}

html[data-theme="dark"] .author-page .standard-card h3,
html.dark .author-page .standard-card h3,
body.dark .author-page .standard-card h3 {
  color: #edf5f1;
}

html[data-theme="dark"] .author-page .standard-card p,
html.dark .author-page .standard-card p,
body.dark .author-page .standard-card p {
  color: #9aa6a0;
}

/* Article section */
html[data-theme="dark"] .author-page .featured-article,
html.dark .author-page .featured-article,
body.dark .author-page .featured-article,
html[data-theme="dark"] .author-page .article-row,
html.dark .author-page .article-row,
body.dark .author-page .article-row,
html[data-theme="dark"] .author-page .empty-articles,
html.dark .author-page .empty-articles,
body.dark .author-page .empty-articles {
  background: #131a20;
  border-color: rgba(255,255,255,.09);
}

html[data-theme="dark"] .author-page .featured-copy h3,
html.dark .author-page .featured-copy h3,
body.dark .author-page .featured-copy h3,
html[data-theme="dark"] .author-page .article-row-copy h3,
html.dark .author-page .article-row-copy h3,
body.dark .author-page .article-row-copy h3 {
  color: #edf5f1;
}

html[data-theme="dark"] .author-page .featured-copy p,
html.dark .author-page .featured-copy p,
body.dark .author-page .featured-copy p,
html[data-theme="dark"] .author-page .empty-articles p,
html.dark .author-page .empty-articles p,
body.dark .author-page .empty-articles p {
  color: #98a59e;
}

html[data-theme="dark"] .author-page .article-row:hover,
html.dark .author-page .article-row:hover,
body.dark .author-page .article-row:hover {
  border-color: rgba(34,209,123,.28);
  background: #17211f;
}

html[data-theme="dark"] .author-page .article-row-image,
html.dark .author-page .article-row-image,
body.dark .author-page .article-row-image {
  background: #0d1519;
}

html[data-theme="dark"] .author-page .article-row-image > span,
html.dark .author-page .article-row-image > span,
body.dark .author-page .article-row-image > span {
  background: #10231b;
}

/* Stronger desktop information density */
@media (min-width: 1100px) {
  .author-container {
    width: min(1240px, calc(100% - 64px));
  }

  .author-section {
    padding-top: 58px;
    padding-bottom: 58px;
  }

  .author-hero-inner {
    grid-template-columns: minmax(0, 1.15fr) minmax(390px, .65fr);
    gap: 82px;
    padding-top: 70px;
    padding-bottom: 70px;
  }

  .expertise-grid {
    gap: 12px;
  }

  .expertise-card {
    min-height: 132px;
    padding: 19px 20px;
  }

  .faq-item summary {
    min-height: 70px;
  }

  .process-row {
    min-height: 76px;
  }

  .standard-card {
    min-height: 82px;
    align-items: center;
  }
}

/* Prevent fixed/sticky global navigation from visually sitting
   on top of the first author content on desktop. */
@media (min-width: 761px) {
  .author-hero-inner {
    scroll-margin-top: 90px;
  }
}

`;

