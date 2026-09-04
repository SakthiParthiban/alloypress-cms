import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "AI Tool Reviews — Tested Before We Recommend | AlloyPress",
  description:
    "Request an AlloyPress AI tool review. We test real workflows, verify claims, explain limitations, and publish practical, reader-first reviews.",
  alternates: {
    canonical: "/reviews",
  },
};

const coverage = [
  "AI writing & content tools",
  "AI image & video generators",
  "AI coding assistants",
  "Website & design tools",
  "Automation & workflow tools",
  "AI productivity software",
  "SaaS business tools",
  "AI research & search tools",
  "Creator & marketing tools",
];

const included = [
  [
    "01",
    "Full product walkthrough",
    "We cover what the tool is, what it does, and who it is actually for — without letting marketing copy lead the review.",
  ],
  [
    "02",
    "Hands-on workflow testing",
    "We use the tool across real-world tasks and document the experience, including things that work and things that don't.",
  ],
  [
    "03",
    "Output quality analysis",
    "We test practical outputs, compare results, and explain what readers can realistically expect from the product.",
  ],
  [
    "04",
    "Screenshots & visual walkthroughs",
    "Where useful, the review includes original screenshots from our testing so readers can understand the workflow before trying it.",
  ],
  [
    "05",
    "Strengths and honest limitations",
    "We explain what works well and what doesn't. Both sides matter when readers are deciding whether a product is worth their time.",
  ],
  [
    "06",
    "Pricing breakdown & free-plan reality",
    "We explain what users actually get at each relevant pricing level, not just what the pricing page promises.",
  ],
  [
    "07",
    "Competitor context",
    "We position the tool honestly within its category so readers understand how it compares with alternatives they may also consider.",
  ],
  [
    "08",
    "SEO optimisation and long-term publishing",
    "Every review is structured for discoverability and maintained when important product details, pricing, or capabilities change.",
  ],
];

const process = [
  [
    "01",
    "Submit your review request",
    "Send us your product name, website, category, and any details relevant to testing. A business email is preferred so we can verify the request.",
  ],
  [
    "02",
    "We review fit and get back to you",
    "We check whether the tool is relevant to our audience and editorial direction. We don't review everything — that's what keeps the coverage useful.",
  ],
  [
    "03",
    "Access and testing",
    "We collect what we need to get started — product access, any premium tier needed for thorough testing, brand assets, and key context.",
  ],
  [
    "04",
    "Testing and writing",
    "Our editorial team tests the tool across different use cases and workflows, then writes the review using specific, observable evidence.",
  ],
  [
    "05",
    "Published and promoted",
    "The review goes live SEO-optimised and formatted for discoverability. We handle promotion and keep the article updated as your product evolves.",
  ],
];

const standards = [
  "Misleading claims or exaggerated product descriptions",
  "AI-generated filler content without real testing behind it",
  "Guaranteed positive ratings or unsupported limitations",
  "Backlink-only requests disguised as editorial coverage",
  "Products outside our editorial scope, including harmful or misleading tools",
];

export default function ReviewsPage() {
  return (
    <><style dangerouslySetInnerHTML={{ __html: styles }} /><main className="review-page">
      {/* HERO */}
      <section className="review-hero">
        <div className="review-hero-grid" aria-hidden="true" />
        <div className="review-hero-glow" aria-hidden="true" />
        <div className="review-hero-line review-hero-line-one" aria-hidden="true" />
        <div className="review-hero-line review-hero-line-two" aria-hidden="true" />

        <div className="review-container review-hero-inner">
          <div className="review-eyebrow">
            <span />
            EDITORIAL REVIEW PROGRAMME
          </div>

          <h1>
            Your AI Tool, Reviewed by
            <br />
            People Who <em>Actually Use It.</em>
          </h1>

          <p className="review-hero-copy">
            We don't rewrite your marketing page and call it a review. We test
            your tool on real workflows, push its limits, and write exactly what
            we find.
          </p>

          <div className="review-hero-actions">
            <a className="review-primary" href="#request">
              Request a Review <span>↗</span>
            </a>
            <Link className="review-secondary" href="/blogs">
              See our articles
            </Link>
          </div>

          <div className="review-hero-note">
            We review AI tools, SaaS products, automation tools, and business
            software.
          </div>
        </div>
      </section>

      {/* TRUST STRIP */}
      <section className="review-trust" aria-label="Review principles">
        <div className="review-container review-trust-inner">
          <span className="review-trust-label">FEATURED TOOL REVIEWS</span>
          <div className="review-trust-items">
            <span><b>✦</b> Real testing</span>
            <span><b>✓</b> Original evidence</span>
            <span><b>▣</b> Clear comparisons</span>
            <span><b>◈</b> Reader-first</span>
            <span><b>↗</b> Search-ready</span>
          </div>
        </div>
      </section>

      {/* WHY IT MATTERS */}
      <section className="review-section review-why">
        <div className="review-container">
          <div className="review-heading">
            <div>
              <div className="review-eyebrow review-eyebrow-light">
                <span />
                WHY IT MATTERS
              </div>
              <h2>
                There are a lot of AI tool reviews out there.
                <br />
                Most of them aren't reviews.
              </h2>
              <p>
                The internet is full of posts that read like product brochures
                than honest evaluations. We built AlloyPress to do the opposite:
                every tool gets tested hands-on, not summarised from a feature page.
              </p>
            </div>
            <span className="review-index">01 / 05</span>
          </div>

          <div className="why-grid">
            <article className="why-card why-card-featured">
              <span className="why-icon">↯</span>
              <h3>What we actually do</h3>
              <p>
                We sign up, use the tool across real tasks, run practical
                workflows, and document what happens. Then we write about what
                we found.
              </p>
            </article>

            <article className="why-card">
              <span className="why-icon">▱</span>
              <h3>Real search and AI visibility</h3>
              <p>
                Our reviews are built for readers arriving from search and
                AI-assisted discovery. Useful information comes before sales
                language.
              </p>
            </article>

            <article className="why-card">
              <span className="why-icon">△</span>
              <h3>Built to be useful, not promotional</h3>
              <p>
                We cover strengths, limitations, pricing realities, and who the
                tool is genuinely best for. Readers should understand the fit.
              </p>
            </article>

            <article className="why-card">
              <span className="why-icon">◫</span>
              <h3>We update as products evolve</h3>
              <p>
                Products change. When important features, pricing, or capabilities
                move, useful coverage should not quietly become outdated.
              </p>
            </article>
          </div>
        </div>
      </section>

      {/* COVERAGE */}
      <section className="review-section review-coverage">
        <div className="review-container">
          <div className="review-heading">
            <div>
              <div className="review-eyebrow">
                <span />
                OUR COVERAGE AREAS
              </div>
              <h2>We cover the tools people are actively searching for.</h2>
              <p>
                AlloyPress focuses on AI and SaaS products used by founders,
                creators, marketers, developers, and everyday users looking for
                tools that actually work.
              </p>
            </div>
            <span className="review-index">02 / 05</span>
          </div>

          <div className="coverage-tags">
            {coverage.map((item, index) => (
              <span key={item}>
                <i>{String(index + 1).padStart(2, "0")}</i>
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* WHAT IS INCLUDED */}
      <section className="review-section review-included">
        <div className="review-container">
          <div className="review-heading">
            <div>
              <div className="review-eyebrow">
                <span />
                WHAT'S INCLUDED
              </div>
              <h2>A review that covers the whole picture.</h2>
              <p>
                Depending on the tool and category, here's what goes into a
                typical AlloyPress editorial review.
              </p>
            </div>
            <span className="review-index">03 / 05</span>
          </div>

          <div className="included-grid">
            {included.map(([number, title, text]) => (
              <article className="included-item" key={number}>
                <span className="included-number">{number}</span>
                <div>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* PROCESS */}
      <section className="review-section review-process">
        <div className="review-container">
          <div className="review-heading">
            <div>
              <div className="review-eyebrow">
                <span />
                HOW IT WORKS
              </div>
              <h2>Simple process, no back and forth.</h2>
              <p>
                We keep the process straightforward so you spend less time on
                admin and more time seeing results.
              </p>
            </div>
            <span className="review-index">04 / 05</span>
          </div>

          <div className="process-list">
            {process.map(([number, title, text]) => (
              <article className="process-item" key={number}>
                <span className="process-step">{number}</span>
                <div className="process-content">
                  <h3>{title}</h3>
                  <p>{text}</p>
                </div>
                <span className="process-arrow">↗</span>
              </article>
            ))}
          </div>

          <div className="process-note">
            <span>ⓘ</span>
            <p>
              <strong>Timeline: 14 to 21 working days</strong>
              <br />
              Once collaboration is confirmed, product access and all required
              details are received, most reviews are published within 14–21
              working days. Complex tools may take a little longer and we will
              let you know upfront.
            </p>
          </div>
        </div>
      </section>

      {/* STANDARDS */}
      <section className="review-standards">
        <div className="review-standards-grid" aria-hidden="true" />
        <div className="review-container">
          <div className="standards-card">
            <div className="review-eyebrow review-eyebrow-light">
              <span />
              EDITORIAL STANDARDS
            </div>

            <h2>
              Payment funds the work.
              <br />
              It doesn't change what we write.
            </h2>

            <p className="standards-lead">
              The cost of a review covers editorial work — research, hands-on
              testing, writing, editing, SEO, hosting, and ongoing maintenance.
              What it does not cover is guaranteed positive outcome, exaggerated
              claims, or a piece that reads like it was written by marketing.
            </p>

            <div className="standards-list">
              {standards.map((item) => (
                <div key={item}>
                  <span>×</span>
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="review-cta" id="request">
        <div className="review-cta-grid" aria-hidden="true" />
        <div className="review-cta-glow" aria-hidden="true" />

        <div className="review-container review-cta-inner">
          <div className="review-eyebrow review-eyebrow-light">
            <span />
            GET STARTED
          </div>

          <h2>
            Ready to get your tool in front of
            <br />
            the <em>right readers?</em>
          </h2>

          <p>
            Send us the basics and we'll take it from there. Most requests get
            a response within 1–2 business days.
          </p>

          <a
            className="review-primary review-primary-large"
            href="mailto:contact@alloypress.com?subject=AI%20Tool%20Review%20Request"
          >
            Submit a Review Request <span>↗</span>
          </a>

          <div className="review-cta-note">
            Email us at{" "}
            <a href="mailto:contact@alloypress.com">
              contact@alloypress.com
            </a>{" "}
            with your product name, website, URL, category, and any relevant
            testing details.
          </div>
        </div>
      </section>
    </main></>
  );
}

const styles = `
.review-page {
  --review-brand: #18b968;
  --review-brand-bright: #24d47e;
  --review-ink: #0d151b;
  --review-muted: #68747d;
  --review-soft: #f5f8f7;
  --review-line: rgba(13,21,27,.10);
  --review-dark: #0a0f15;
  --review-dark-card: #111a21;
  color: var(--review-ink);
  background: #fff;
  overflow: hidden;
}

.review-page *,
.review-page *::before,
.review-page *::after {
  box-sizing: border-box;
}

.review-container {
  width: min(1160px, calc(100% - 40px));
  margin: 0 auto;
}

.review-hero {
  position: relative;
  min-height: 520px;
  display: flex;
  align-items: center;
  overflow: hidden;
  background:
    radial-gradient(circle at 72% 10%, rgba(24,185,104,.13), transparent 30%),
    linear-gradient(180deg, #090e14, #0b1118);
  color: #f5faf7;
  isolation: isolate;
}

.review-hero-grid,
.review-cta-grid,
.review-standards-grid {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background-image:
    linear-gradient(rgba(255,255,255,.045) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,.045) 1px, transparent 1px);
  background-size: 52px 52px;
  opacity: .45;
}

.review-hero-grid::after {
  content: "";
  position: absolute;
  inset: 0;
  background-image: radial-gradient(rgba(35,211,124,.55) .7px, transparent .7px);
  background-size: 13px 13px;
  opacity: .25;
  mask-image: linear-gradient(90deg, black, transparent 80%);
}

.review-hero-glow {
  position: absolute;
  width: 580px;
  height: 580px;
  right: -230px;
  top: -260px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(24,185,104,.18), transparent 68%);
  pointer-events: none;
}

.review-hero-line {
  position: absolute;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(34,209,123,.45), transparent);
  transform: rotate(-24deg);
  pointer-events: none;
}

.review-hero-line-one {
  width: 270px;
  right: 8%;
  top: 28%;
}

.review-hero-line-two {
  width: 180px;
  right: 20%;
  bottom: 19%;
  opacity: .4;
}

.review-hero-inner {
  position: relative;
  z-index: 1;
  padding: 82px 0 72px;
  text-align: center;
}

.review-eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: var(--review-brand);
  font: 700 9px/1 "DM Mono", monospace;
  letter-spacing: .12em;
  text-transform: uppercase;
}

.review-eyebrow span {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: currentColor;
  box-shadow: 0 0 0 3px rgba(24,185,104,.10);
}

.review-eyebrow-light {
  color: #29d77f;
}

.review-hero h1 {
  max-width: 900px;
  margin: 18px auto 18px;
  color: #f5faf7;
  font: 700 clamp(38px, 5.4vw, 66px)/1.02 "Sora", sans-serif;
  letter-spacing: -.055em;
}

.review-hero h1 em {
  color: var(--review-brand-bright);
  font-style: italic;
}

.review-hero-copy {
  max-width: 570px;
  margin: 0 auto;
  color: rgba(245,250,247,.62);
  font: 400 13px/1.75 "Lora", serif;
}

.review-hero-actions {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 9px;
  margin-top: 26px;
}

.review-primary,
.review-secondary {
  min-height: 40px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 0 16px;
  border-radius: 7px;
  text-decoration: none;
  font: 700 9px/1 "DM Mono", monospace;
  transition: transform .2s ease, background .2s ease, border-color .2s ease;
}

.review-primary {
  color: #06110b;
  background: var(--review-brand-bright);
}

.review-primary:hover {
  background: #35e58c;
  transform: translateY(-2px);
}

.review-secondary {
  border: 1px solid rgba(255,255,255,.13);
  color: rgba(245,250,247,.72);
  background: rgba(255,255,255,.035);
}

.review-secondary:hover {
  border-color: rgba(35,211,124,.42);
  color: #29d77f;
  transform: translateY(-2px);
}

.review-hero-note {
  margin-top: 18px;
  color: rgba(245,250,247,.32);
  font: 400 8px/1.5 "DM Mono", monospace;
}

.review-trust {
  border-bottom: 1px solid rgba(255,255,255,.07);
  background: #151c23;
  color: rgba(245,250,247,.56);
}

.review-trust-inner {
  min-height: 58px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 25px;
}

.review-trust-label {
  color: rgba(245,250,247,.32);
  font: 700 7px/1 "DM Mono", monospace;
  letter-spacing: .12em;
}

.review-trust-items {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 20px;
  font: 500 8px/1 "DM Mono", monospace;
}

.review-trust-items span {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.review-trust-items b {
  color: var(--review-brand-bright);
  font-weight: 700;
}

.review-section {
  position: relative;
  padding: 70px 0;
}

.review-heading {
  position: relative;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 30px;
  margin-bottom: 30px;
}

.review-heading h2 {
  max-width: 820px;
  margin: 11px 0 0;
  color: var(--review-ink);
  font: 700 clamp(27px, 3.2vw, 39px)/1.08 "Sora", sans-serif;
  letter-spacing: -.048em;
}

.review-heading p {
  max-width: 680px;
  margin: 11px 0 0;
  color: var(--review-muted);
  font: 400 12px/1.72 "Lora", serif;
}

.review-index {
  flex: none;
  color: #a0a9af;
  font: 600 9px/1 "DM Mono", monospace;
}

.review-eyebrow-light {
  color: #28d87e;
}

.review-why {
  background:
    radial-gradient(circle at 92% 8%, rgba(24,185,104,.055), transparent 24%),
    #fff;
}

.review-why::after {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  background-image: radial-gradient(rgba(24,185,104,.10) .7px, transparent .7px);
  background-size: 15px 15px;
  opacity: .35;
  mask-image: linear-gradient(90deg, black, transparent 70%);
}

.why-grid {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  border: 1px solid var(--review-line);
  border-radius: 10px;
  overflow: hidden;
  background: #f0f4f2;
}

.why-card {
  min-height: 158px;
  padding: 22px 24px;
  border-right: 1px solid var(--review-line);
  border-bottom: 1px solid var(--review-line);
  background: #fff;
  transition: background .2s ease, transform .2s ease;
}

.why-card:nth-child(2n) {
  border-right: 0;
}

.why-card:nth-child(3),
.why-card:nth-child(4) {
  border-bottom: 0;
}

.why-card:hover {
  background: #f5faf7;
}

.why-card-featured {
  background: #0c1218;
  color: #fff;
}

.why-card-featured:hover {
  background: #101920;
}

.why-icon {
  display: inline-grid;
  place-items: center;
  width: 25px;
  height: 25px;
  margin-bottom: 13px;
  border-radius: 6px;
  color: var(--review-brand);
  background: rgba(24,185,104,.08);
  font: 500 13px/1 "DM Mono", monospace;
}

.why-card-featured .why-icon {
  color: #24d47e;
  background: rgba(36,212,126,.09);
}

.why-card h3 {
  margin: 0 0 7px;
  color: var(--review-ink);
  font: 700 12px/1.35 "Sora", sans-serif;
}

.why-card-featured h3 {
  color: #f5faf7;
}

.why-card p {
  max-width: 440px;
  margin: 0;
  color: #69747b;
  font: 400 10px/1.7 "Lora", serif;
}

.why-card-featured p {
  color: rgba(245,250,247,.55);
}

.review-coverage {
  background: #f6f8f8;
  border-top: 1px solid rgba(13,21,27,.05);
  border-bottom: 1px solid rgba(13,21,27,.05);
}

.coverage-tags {
  position: relative;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  max-width: 900px;
}

.coverage-tags span {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 8px 10px;
  border: 1px solid rgba(13,21,27,.09);
  border-radius: 6px;
  background: rgba(255,255,255,.78);
  color: #4e5a62;
  font: 600 8px/1 "DM Mono", monospace;
  transition: transform .2s ease, border-color .2s ease, color .2s ease;
}

.coverage-tags span:hover {
  transform: translateY(-2px);
  border-color: rgba(24,185,104,.30);
  color: var(--review-brand);
}

.coverage-tags i {
  color: var(--review-brand);
  font-style: normal;
  font-size: 7px;
}

.review-included {
  background: #fff;
}

.included-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  border-top: 1px solid var(--review-line);
}

.included-item {
  display: grid;
  grid-template-columns: 30px 1fr;
  gap: 15px;
  padding: 19px 18px 19px 0;
  border-bottom: 1px solid var(--review-line);
}

.included-item:nth-child(odd) {
  padding-right: 28px;
  border-right: 1px solid var(--review-line);
}

.included-item:nth-child(even) {
  padding-left: 28px;
}

.included-number {
  color: var(--review-brand);
  font: 700 8px/1 "DM Mono", monospace;
  padding-top: 3px;
}

.included-item h3 {
  margin: 0 0 5px;
  color: var(--review-ink);
  font: 700 12px/1.35 "Sora", sans-serif;
}

.included-item p {
  margin: 0;
  color: #707b82;
  font: 400 10px/1.65 "Lora", serif;
}

.review-process {
  background:
    linear-gradient(180deg, #f7f9f8 0%, #eef3f1 100%);
}

.process-list {
  position: relative;
  border: 1px solid var(--review-line);
  border-radius: 10px;
  overflow: hidden;
  background: #fff;
}

.process-item {
  display: grid;
  grid-template-columns: 42px 1fr 24px;
  gap: 18px;
  align-items: center;
  padding: 17px 20px;
  border-bottom: 1px solid var(--review-line);
  transition: background .2s ease;
}

.process-item:last-child {
  border-bottom: 0;
}

.process-item:hover {
  background: #f5faf7;
}

.process-step {
  width: 28px;
  height: 28px;
  display: grid;
  place-items: center;
  border: 1px solid rgba(24,185,104,.18);
  border-radius: 50%;
  color: var(--review-brand);
  background: #f4faf7;
  font: 700 8px/1 "DM Mono", monospace;
}

.process-content h3 {
  margin: 0;
  color: var(--review-ink);
  font: 700 11px/1.35 "Sora", sans-serif;
}

.process-content p {
  max-width: 850px;
  margin: 5px 0 0;
  color: #748087;
  font: 400 10px/1.65 "Lora", serif;
}

.process-arrow {
  color: var(--review-brand);
  font: 400 13px/1 "DM Mono", monospace;
}

.process-note {
  display: grid;
  grid-template-columns: 25px 1fr;
  gap: 12px;
  margin-top: 14px;
  padding: 15px 17px;
  border: 1px solid rgba(24,185,104,.13);
  border-radius: 7px;
  background: rgba(24,185,104,.07);
}

.process-note > span {
  color: var(--review-brand);
  font: 700 12px/1 "DM Mono", monospace;
}

.process-note p {
  margin: 0;
  color: #66736d;
  font: 400 9px/1.65 "Lora", serif;
}

.process-note strong {
  color: #293a32;
  font-family: "Sora", sans-serif;
}

.review-standards {
  position: relative;
  padding: 76px 0;
  overflow: hidden;
  background: #0a0f15;
  color: #f5faf7;
  isolation: isolate;
}

.review-standards-grid {
  z-index: -2;
  opacity: .38;
}

.review-standards-grid::after {
  content: "";
  position: absolute;
  inset: 0;
  background-image: radial-gradient(rgba(36,212,126,.6) .65px, transparent .65px);
  background-size: 13px 13px;
  opacity: .25;
}

.review-standards .review-container {
  position: relative;
  z-index: 1;
}

.standards-card {
  max-width: 850px;
  margin: 0 auto;
  padding: 38px 42px;
  border: 1px solid rgba(255,255,255,.09);
  border-radius: 10px;
  background:
    linear-gradient(135deg, rgba(24,185,104,.035), transparent 45%),
    #10171e;
  box-shadow: 0 28px 80px rgba(0,0,0,.24);
}

.standards-card h2 {
  margin: 13px 0 15px;
  color: #f5faf7;
  font: 700 clamp(25px, 3.2vw, 38px)/1.08 "Sora", sans-serif;
  letter-spacing: -.045em;
}

.standards-lead {
  max-width: 720px;
  margin: 0;
  color: rgba(245,250,247,.56);
  font: 400 11px/1.75 "Lora", serif;
}

.standards-list {
  display: grid;
  gap: 7px;
  margin-top: 22px;
}

.standards-list div {
  display: flex;
  align-items: center;
  gap: 9px;
  color: rgba(245,250,247,.50);
  font: 500 9px/1.45 "DM Mono", monospace;
}

.standards-list span {
  color: #d98383;
  font-size: 13px;
}

.review-cta {
  position: relative;
  min-height: 390px;
  display: flex;
  align-items: center;
  overflow: hidden;
  background: #080d13;
  color: #f5faf7;
  isolation: isolate;
  text-align: center;
}

.review-cta-grid {
  opacity: .30;
  background-size: 52px 52px;
}

.review-cta-glow {
  position: absolute;
  width: 520px;
  height: 520px;
  left: 50%;
  bottom: -400px;
  transform: translateX(-50%);
  background: radial-gradient(circle, rgba(24,185,104,.18), transparent 67%);
  pointer-events: none;
}

.review-cta-inner {
  position: relative;
  z-index: 1;
  padding: 72px 0;
}

.review-cta h2 {
  margin: 13px 0 12px;
  color: #f5faf7;
  font: 700 clamp(28px, 4vw, 46px)/1.06 "Sora", sans-serif;
  letter-spacing: -.05em;
}

.review-cta h2 em {
  color: #25d67c;
  font-style: normal;
}

.review-cta p {
  max-width: 500px;
  margin: 0 auto;
  color: rgba(245,250,247,.52);
  font: 400 11px/1.7 "Lora", serif;
}

.review-primary-large {
  margin-top: 24px;
  min-height: 43px;
  padding: 0 19px;
}

.review-cta-note {
  max-width: 650px;
  margin: 20px auto 0;
  color: rgba(245,250,247,.30);
  font: 400 8px/1.65 "DM Mono", monospace;
}

.review-cta-note a {
  color: #28d77f;
  text-decoration: none;
}

.review-cta-note a:hover {
  text-decoration: underline;
}

@media (max-width: 900px) {
  .review-hero-inner {
    padding: 72px 0 64px;
  }

  .review-heading {
    align-items: flex-start;
  }

  .why-grid,
  .included-grid {
    grid-template-columns: 1fr;
  }

  .why-card,
  .why-card:nth-child(3),
  .why-card:nth-child(4),
  .why-card:nth-child(2n) {
    border-right: 0;
    border-bottom: 1px solid var(--review-line);
  }

  .why-card:last-child {
    border-bottom: 0;
  }

  .included-item:nth-child(odd),
  .included-item:nth-child(even) {
    padding: 18px 0;
    border-right: 0;
  }

  .included-item:last-child {
    border-bottom: 0;
  }
}

@media (max-width: 700px) {
  .review-container {
    width: min(100% - 28px, 620px);
  }

  .review-hero {
    min-height: auto;
  }

  .review-hero-inner {
    padding: 62px 0 55px;
  }

  .review-hero h1 {
    font-size: clamp(34px, 10vw, 48px);
  }

  .review-hero-copy {
    font-size: 12px;
  }

  .review-trust-inner {
    min-height: auto;
    align-items: flex-start;
    flex-direction: column;
    padding: 14px 0;
  }

  .review-trust-items {
    justify-content: flex-start;
    gap: 10px 15px;
  }

  .review-section,
  .review-standards {
    padding: 52px 0;
  }

  .review-heading {
    display: block;
    margin-bottom: 23px;
  }

  .review-index {
    display: block;
    margin-top: 14px;
  }

  .review-heading h2 {
    font-size: 27px;
  }

  .why-card {
    min-height: auto;
    padding: 20px;
  }

  .coverage-tags span {
    font-size: 7px;
  }

  .process-item {
    grid-template-columns: 32px 1fr 15px;
    gap: 12px;
    padding: 16px 14px;
  }

  .process-content p {
    font-size: 9px;
  }

  .standards-card {
    padding: 28px 22px;
  }

  .review-cta-inner {
    padding: 58px 0;
  }
}

@media (max-width: 480px) {
  .review-container {
    width: min(100% - 22px, 620px);
  }

  .review-hero h1 br,
  .review-cta h2 br {
    display: none;
  }

  .review-hero-actions {
    flex-direction: column;
    align-items: stretch;
  }

  .review-primary,
  .review-secondary {
    width: 100%;
  }

  .review-trust-items span:nth-child(n+4) {
    display: none;
  }

  .coverage-tags {
    gap: 6px;
  }

  .coverage-tags span {
    padding: 7px 8px;
  }

  .standards-card h2 {
    font-size: 27px;
  }

  .standards-list div {
    align-items: flex-start;
  }
}

@media (prefers-reduced-motion: reduce) {
  .review-page *,
  .review-page *::before,
  .review-page *::after {
    scroll-behavior: auto !important;
    transition: none !important;
  }
}

/* =========================================================
   ALLOY PRESS READABILITY + THEME SYSTEM
   Appended intentionally so page-level theme tokens win over
   older fixed light values.
   ========================================================= */

.review-page {
  --rp-bg: #ffffff;
  --rp-surface: #ffffff;
  --rp-surface-2: #f4f7f6;
  --rp-surface-3: #eef3f1;
  --rp-text: #0b1117;
  --rp-text-2: #344149;
  --rp-muted: #66737b;
  --rp-border: rgba(11,17,23,.11);
  --rp-border-strong: rgba(11,17,23,.16);
  --rp-code: #4f5e67;
  background: var(--rp-bg);
  color: var(--rp-text);
}

/* Dark mode works with the common theme patterns used by the
   AlloyPress navbar: html data-theme, html/body .dark, or any
   ancestor carrying data-theme="dark". */
html[data-theme="dark"] .review-page,
html.dark .review-page,
body.dark .review-page,
[data-theme="dark"] .review-page {
  --rp-bg: #090e14;
  --rp-surface: #0f161d;
  --rp-surface-2: #111a21;
  --rp-surface-3: #151f27;
  --rp-text: #f2f7f4;
  --rp-text-2: #c2ccc8;
  --rp-muted: #95a19f;
  --rp-border: rgba(255,255,255,.10);
  --rp-border-strong: rgba(255,255,255,.16);
  --rp-code: #aebbb7;
  background: var(--rp-bg);
  color: var(--rp-text);
}

/* ---------- Readable typography ---------- */
.review-section p,
.review-why p,
.review-coverage p,
.review-included p,
.review-process p {
  font-size: 15px;
  line-height: 1.72;
}

.review-heading p {
  max-width: 760px;
  font-size: 15px;
  line-height: 1.72;
}

.review-heading h2 {
  font-size: clamp(34px, 4vw, 50px);
  line-height: 1.08;
  max-width: 900px;
}

.why-card h3,
.included-item h3,
.process-content h3 {
  font-size: 15px;
  line-height: 1.4;
}

.why-card p,
.included-item p,
.process-content p {
  font-size: 14px;
  line-height: 1.7;
}

.review-eyebrow {
  font-size: 10px;
  letter-spacing: .14em;
}

.review-index {
  font-size: 10px;
}

.coverage-tags span {
  font-size: 10px;
  line-height: 1.35;
}

.coverage-tags i {
  font-size: 9px;
}

.process-note p {
  font-size: 13px;
  line-height: 1.65;
}

.standards-lead {
  font-size: 14px;
  line-height: 1.75;
}

.standards-list div {
  font-size: 11px;
  line-height: 1.55;
}

.review-hero-copy {
  font-size: 15px;
  line-height: 1.75;
}

.review-hero-note {
  font-size: 9px;
}

.review-trust-items {
  font-size: 9px;
}

/* ---------- Less empty space / stronger desktop density ---------- */
.review-section {
  padding: 62px 0;
}

.review-heading {
  margin-bottom: 26px;
}

.review-why .review-container,
.review-coverage .review-container,
.review-included .review-container,
.review-process .review-container {
  max-width: 1160px;
}

.why-grid {
  background: var(--rp-border);
  gap: 1px;
  border: 1px solid var(--rp-border);
}

.why-card {
  min-height: 175px;
  padding: 26px 27px;
}

.included-grid {
  border-top: 1px solid var(--rp-border);
}

.included-item {
  padding-top: 23px;
  padding-bottom: 23px;
  border-color: var(--rp-border);
}

.process-list {
  background: var(--rp-surface);
  border-color: var(--rp-border);
}

.process-item {
  padding: 20px 22px;
  border-color: var(--rp-border);
}

.coverage-tags {
  max-width: 1020px;
  gap: 9px;
}

.coverage-tags span {
  padding: 9px 12px;
}

/* ---------- Light mode cards ---------- */
.review-why {
  background:
    radial-gradient(circle at 92% 8%, rgba(24,185,104,.055), transparent 24%),
    var(--rp-bg);
}

.review-coverage {
  background: var(--rp-surface-2);
  border-color: var(--rp-border);
}

.review-included {
  background: var(--rp-bg);
}

.review-process {
  background: var(--rp-surface-2);
}

.why-card,
.process-list {
  background: var(--rp-surface);
}

.why-card:hover,
.process-item:hover {
  background: var(--rp-surface-3);
}

.coverage-tags span {
  background: var(--rp-surface);
  border-color: var(--rp-border);
  color: var(--rp-text-2);
}

.included-item h3,
.process-content h3,
.why-card h3,
.review-heading h2 {
  color: var(--rp-text);
}

.why-card p,
.included-item p,
.process-content p,
.review-heading p {
  color: var(--rp-muted);
}

.process-step {
  background: color-mix(in srgb, var(--review-brand) 8%, var(--rp-surface));
}

/* ---------- Dark mode: every content section ---------- */
html[data-theme="dark"] .review-page .review-why,
html.dark .review-page .review-why,
body.dark .review-page .review-why,
[data-theme="dark"] .review-page .review-why,
html[data-theme="dark"] .review-page .review-coverage,
html.dark .review-page .review-coverage,
body.dark .review-page .review-coverage,
[data-theme="dark"] .review-page .review-coverage,
html[data-theme="dark"] .review-page .review-included,
html.dark .review-page .review-included,
body.dark .review-page .review-included,
[data-theme="dark"] .review-page .review-included,
html[data-theme="dark"] .review-page .review-process,
html.dark .review-page .review-process,
body.dark .review-page .review-process,
[data-theme="dark"] .review-page .review-process {
  background: var(--rp-bg);
  border-color: var(--rp-border);
}

html[data-theme="dark"] .review-page .review-coverage,
html.dark .review-page .review-coverage,
body.dark .review-page .review-coverage,
[data-theme="dark"] .review-page .review-coverage,
html[data-theme="dark"] .review-page .review-process,
html.dark .review-page .review-process,
body.dark .review-page .review-process,
[data-theme="dark"] .review-page .review-process {
  background:
    radial-gradient(circle at 85% 5%, rgba(24,185,104,.07), transparent 25%),
    var(--rp-surface-2);
}

html[data-theme="dark"] .review-page .why-grid,
html.dark .review-page .why-grid,
body.dark .review-page .why-grid,
[data-theme="dark"] .review-page .why-grid {
  background: var(--rp-border);
  border-color: var(--rp-border);
}

html[data-theme="dark"] .review-page .why-card,
html.dark .review-page .why-card,
body.dark .review-page .why-card,
[data-theme="dark"] .review-page .why-card,
html[data-theme="dark"] .review-page .process-list,
html.dark .review-page .process-list,
body.dark .review-page .process-list,
[data-theme="dark"] .review-page .process-list {
  background: var(--rp-surface);
  border-color: var(--rp-border);
}

html[data-theme="dark"] .review-page .why-card:hover,
html.dark .review-page .why-card:hover,
body.dark .review-page .why-card:hover,
[data-theme="dark"] .review-page .why-card:hover,
html[data-theme="dark"] .review-page .process-item:hover,
html.dark .review-page .process-item:hover,
body.dark .review-page .process-item:hover,
[data-theme="dark"] .review-page .process-item:hover {
  background: #17222a;
}

html[data-theme="dark"] .review-page .included-grid,
html.dark .review-page .included-grid,
body.dark .review-page .included-grid,
[data-theme="dark"] .review-page .included-grid,
html[data-theme="dark"] .review-page .included-item,
html.dark .review-page .included-item,
body.dark .review-page .included-item,
[data-theme="dark"] .review-page .included-item {
  border-color: var(--rp-border);
}

html[data-theme="dark"] .review-page .coverage-tags span,
html.dark .review-page .coverage-tags span,
body.dark .review-page .coverage-tags span,
[data-theme="dark"] .review-page .coverage-tags span {
  background: var(--rp-surface);
  border-color: var(--rp-border);
  color: var(--rp-text-2);
}

html[data-theme="dark"] .review-page .review-heading h2,
html.dark .review-page .review-heading h2,
body.dark .review-page .review-heading h2,
[data-theme="dark"] .review-page .review-heading h2,
html[data-theme="dark"] .review-page .why-card h3,
html.dark .review-page .why-card h3,
body.dark .review-page .why-card h3,
[data-theme="dark"] .review-page .why-card h3,
html[data-theme="dark"] .review-page .included-item h3,
html.dark .review-page .included-item h3,
body.dark .review-page .included-item h3,
[data-theme="dark"] .review-page .included-item h3,
html[data-theme="dark"] .review-page .process-content h3,
html.dark .review-page .process-content h3,
body.dark .review-page .process-content h3,
[data-theme="dark"] .review-page .process-content h3 {
  color: var(--rp-text);
}

html[data-theme="dark"] .review-page .review-heading p,
html.dark .review-page .review-heading p,
body.dark .review-page .review-heading p,
[data-theme="dark"] .review-page .review-heading p,
html[data-theme="dark"] .review-page .why-card p,
html.dark .review-page .why-card p,
body.dark .review-page .why-card p,
[data-theme="dark"] .review-page .why-card p,
html[data-theme="dark"] .review-page .included-item p,
html.dark .review-page .included-item p,
body.dark .review-page .included-item p,
[data-theme="dark"] .review-page .included-item p,
html[data-theme="dark"] .review-page .process-content p,
html.dark .review-page .process-content p,
body.dark .review-page .process-content p,
[data-theme="dark"] .review-page .process-content p {
  color: var(--rp-muted);
}

html[data-theme="dark"] .review-page .process-step,
html.dark .review-page .process-step,
body.dark .review-page .process-step,
[data-theme="dark"] .review-page .process-step {
  background: rgba(24,185,104,.08);
  border-color: rgba(24,185,104,.22);
}

html[data-theme="dark"] .review-page .process-note,
html.dark .review-page .process-note,
body.dark .review-page .process-note,
[data-theme="dark"] .review-page .process-note {
  background: rgba(24,185,104,.09);
  border-color: rgba(24,185,104,.18);
}

html[data-theme="dark"] .review-page .process-note p,
html.dark .review-page .process-note p,
body.dark .review-page .process-note p,
[data-theme="dark"] .review-page .process-note p {
  color: #a9b7b2;
}

html[data-theme="dark"] .review-page .process-note strong,
html.dark .review-page .process-note strong,
body.dark .review-page .process-note strong,
[data-theme="dark"] .review-page .process-note strong {
  color: #dce8e3;
}

/* ---------- Make dark section consistent with the same system ---------- */
.review-standards {
  padding: 70px 0;
}

.review-cta {
  min-height: 420px;
}

.standards-card {
  max-width: 920px;
}

@media (max-width: 900px) {
  .review-heading h2 {
    font-size: clamp(31px, 5vw, 42px);
  }

  .review-section {
    padding: 56px 0;
  }
}

@media (max-width: 700px) {
  .review-section,
  .review-standards {
    padding: 48px 0;
  }

  .review-heading h2 {
    font-size: 29px;
  }

  .review-heading p,
  .review-section p {
    font-size: 14px;
  }

  .why-card p,
  .included-item p,
  .process-content p {
    font-size: 13px;
  }

  .review-hero-copy {
    font-size: 14px;
  }

  .coverage-tags span {
    font-size: 9px;
  }
}

`;

export function ReviewPageStyles() {
  return <style dangerouslySetInnerHTML={{ __html: styles }} />;
}
