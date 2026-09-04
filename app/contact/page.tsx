import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Contact AlloyPress — AI Reviews, Partnerships & Enquiries",
  description:
    "Contact AlloyPress for AI tool reviews, article inclusion, partnerships, editorial enquiries, and other collaboration requests.",
  alternates: {
    canonical: "/contact",
  },
  openGraph: {
    title: "Contact AlloyPress — AI Reviews & Partnerships",
    description:
      "Get in touch with AlloyPress about AI tool reviews, editorial collaborations, partnerships, and enquiries.",
    type: "website",
  },
};

const paths = [
  {
    icon: "▣",
    tag: "PAID COLLABORATION",
    title: "Article Inclusion",
    text: "Get your tool featured in one of our existing listicles or alternatives articles. We test the product, write a dedicated section, and include a link so readers can navigate to your site directly. Position is based on how the tool performs during our evaluation.",
    link: "See how it works",
    href: "#how-we-work",
  },
  {
    icon: "⌕",
    tag: "PAID COLLABORATION",
    title: "Dedicated Review",
    text: "A completely new, standalone article written specifically for your product. We test it hands-on across real workflows, document everything with screenshots, and publish a detailed in-depth review optimised for long-term search visibility.",
    link: "See how it works",
    href: "#how-we-work",
  },
  {
    icon: "◈",
    tag: "PARTNERSHIP",
    title: "Long-Term Partnership",
    text: "For brands and agencies looking to build an ongoing editorial relationship with AlloyPress. This includes early access for feature testing, regular content updates, promotional coverage, and digital marketing support.",
    link: "Start a conversation",
    href: "mailto:contact@alloypress.com?subject=Long-Term%20Partnership",
  },
  {
    icon: "◇",
    tag: "GENERAL",
    title: "General Enquiries",
    text: "For anything else — press mentions, factual corrections on an existing article, product update notifications, or anything that doesn't fit the other categories. Use the email directly and we'll route it to the right person.",
    link: "Send us an email",
    href: "mailto:contact@alloypress.com",
  },
];

const outreach = [
  ["01", "Product name and website URL", "So we can look at the tool before we even reply. Saves a round of back and forth."],
  ["02", "What you are looking for", "Tell us whether you are interested in an article inclusion, a full review, a partnership, or something else."],
  ["03", "Which article or category you have in mind", "If you want to be in one of our existing lists, tell us which one. It helps us check fit immediately."],
  ["04", "How your tool compares to competitors", "Mention which tools you see yourself competing with. This gives us useful context for the evaluation."],
  ["05", "Product access or demo details", "If you have a premium plan or a demo account ready for testing, share it. Makes everything faster."],
  ["06", "Use a business email", "Please reach out from an email address associated with your company or product. It helps us verify quickly."],
];

const expectations = [
  "Response within 1–2 business days",
  "Clear yes or no — no vague replies",
  "Honest feedback if your tool isn't a match",
  "All collaborations go through editorial review",
  "Open to agencies representing brands",
  "Long-term partnership discussions welcome",
];

export default function ContactPage() {
  return (
    <main className="contact-page">
      <style dangerouslySetInnerHTML={{ __html: styles }} />

      <section className="contact-hero">
        <div className="contact-hero-grid" aria-hidden="true" />
        <div className="contact-hero-glow" aria-hidden="true" />

        <div className="contact-container contact-hero-inner">
          <div className="contact-hero-copy">
            <div className="contact-eyebrow contact-eyebrow-light">
              <span />
              GET IN TOUCH
            </div>

            <h1>
              Let's Talk About
              <br />
              What You're <em>Building</em>
            </h1>

            <p>
              Whether you're looking to get your tool reviewed, featured in one
              of our lists, or explore a longer-term partnership — reach out
              and we'll take it from there.
            </p>
          </div>

          <aside className="contact-quick-card">
            <div className="contact-response">
              <span />
              Usually responds within <strong>1 to 2 business days</strong>
            </div>

            <div className="contact-card-divider" />

            <div className="contact-label">CONTACT EMAIL</div>

            <a
              className="contact-email"
              href="mailto:contact@alloypress.com"
            >
              <span>contact@alloypress.com</span>
              <b>→</b>
            </a>

            <div className="contact-meta-grid">
              <div>
                <strong>Editorial</strong>
                <span>All collaborations</span>
              </div>
              <div>
                <strong>AI + SaaS</strong>
                <span>Focus area</span>
              </div>
              <div>
                <strong>1 to 2 days</strong>
                <span>Response time</span>
              </div>
              <div>
                <strong>Global</strong>
                <span>Open to work with</span>
              </div>
            </div>
          </aside>
        </div>

        <div className="contact-hero-bottom">
          <div className="contact-container contact-note">
            <span className="contact-note-icon">⊘</span>
            <p>
              <strong>Quick note:</strong> Generic outreach, link swap requests,
              and unrelated pitches are filtered and ignored. If you have a
              genuine product or collaboration in mind, we'd love to hear from
              you.
            </p>
          </div>
        </div>
      </section>

      <section className="contact-section contact-paths" id="how-we-work">
        <div className="contact-container">
          <header className="contact-section-heading">
            <div>
              <div className="contact-eyebrow">
                <span />
                HOW WE WORK TOGETHER
              </div>
              <h2>Choose the right path for your goal.</h2>
              <p>
                We collaborate in a few specific ways. Read through and pick
                the one that matches what you need — it helps us get back to
                you faster.
              </p>
            </div>
            <span className="contact-index">01 / 03</span>
          </header>

          <div className="contact-path-grid">
            {paths.map((path) => (
              <article className="contact-path-card" key={path.title}>
                <div className="contact-path-top">
                  <span className="contact-path-icon">{path.icon}</span>
                  <span className="contact-path-tag">{path.tag}</span>
                </div>
                <h3>{path.title}</h3>
                <p>{path.text}</p>
                <Link href={path.href}>{path.link} →</Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="contact-section contact-outreach">
        <div className="contact-container">
          <header className="contact-section-heading">
            <div>
              <div className="contact-eyebrow">
                <span />
                MAKE IT EASY FOR US
              </div>
              <h2>What to include when you reach out.</h2>
              <p>
                The more context you give us upfront, the faster we can give
                you a clear answer. Here is what helps.
              </p>
            </div>
            <span className="contact-index">02 / 03</span>
          </header>

          <div className="contact-outreach-layout">
            <div className="contact-outreach-list">
              {outreach.map(([number, title, text]) => (
                <div className="contact-outreach-item" key={number}>
                  <span>{number}</span>
                  <div>
                    <h3>{title}</h3>
                    <p>{text}</p>
                  </div>
                </div>
              ))}
            </div>

            <aside className="contact-expect-card">
              <div className="contact-eyebrow contact-eyebrow-light">
                <span />
                WHAT TO EXPECT
              </div>
              <h3>We keep things straightforward.</h3>
              <p>
                No automated responses, no complex onboarding. When you email
                us, a real person reads it and replies with a clear answer —
                whether that is next steps or a polite pass.
              </p>

              <ul>
                {expectations.map((item) => (
                  <li key={item}>
                    <span>✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </aside>
          </div>
        </div>
      </section>

      <section className="contact-final-cta">
        <div className="contact-final-grid" aria-hidden="true" />
        <div className="contact-final-glow" aria-hidden="true" />

        <div className="contact-container contact-final-inner">
          <div className="contact-eyebrow contact-eyebrow-light">
            <span />
            START A CONVERSATION
          </div>

          <h2>
            Have something useful
            <br />
            to <em>build together?</em>
          </h2>

          <p>
            Tell us what you're working on and what you have in mind. We'll
            review the details and get back to you.
          </p>

          <a
            className="contact-primary-button"
            href="mailto:contact@alloypress.com?subject=AlloyPress%20Enquiry"
          >
            Email AlloyPress <span>↗</span>
          </a>

          <div className="contact-final-email">
            <a href="mailto:contact@alloypress.com">
              contact@alloypress.com
            </a>
            <span>·</span>
            <span>Usually responds within 1–2 business days</span>
          </div>
        </div>
      </section>
    </main>
  );
}

const styles = `
.contact-page {
  --contact-brand: #18b968;
  --contact-brand-bright: #27d97f;
  --contact-ink: #0c141b;
  --contact-muted: #64717a;
  --contact-line: rgba(12,20,27,.10);
  --contact-soft: #f4f7f6;
  --contact-dark: #090e14;
  --contact-dark-card: #111920;
  color: var(--contact-ink);
  background: #fff;
  overflow: hidden;
}

.contact-page *,
.contact-page *::before,
.contact-page *::after {
  box-sizing: border-box;
}

.contact-container {
  width: min(1160px, calc(100% - 40px));
  margin: 0 auto;
}

.contact-hero {
  position: relative;
  min-height: 480px;
  display: flex;
  align-items: center;
  overflow: hidden;
  background:
    radial-gradient(circle at 73% 35%, rgba(24,185,104,.12), transparent 31%),
    #090e14;
  color: #f5faf7;
  isolation: isolate;
}

.contact-hero-grid,
.contact-final-grid {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background-image:
    linear-gradient(rgba(255,255,255,.045) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,.045) 1px, transparent 1px);
  background-size: 52px 52px;
  opacity: .5;
}

.contact-hero-grid::after,
.contact-final-grid::after {
  content: "";
  position: absolute;
  inset: 0;
  background-image: radial-gradient(rgba(39,217,127,.6) .65px, transparent .65px);
  background-size: 13px 13px;
  opacity: .22;
}

.contact-hero-glow {
  position: absolute;
  width: 540px;
  height: 540px;
  right: -120px;
  top: -210px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(24,185,104,.16), transparent 68%);
  pointer-events: none;
}

.contact-hero-inner {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: minmax(0, 1.05fr) 440px;
  align-items: center;
  gap: 72px;
  padding: 70px 0 66px;
}

.contact-eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: var(--contact-brand);
  font: 700 10px/1.2 "DM Mono", monospace;
  letter-spacing: .12em;
  text-transform: uppercase;
}

.contact-eyebrow span {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: currentColor;
  box-shadow: 0 0 0 3px rgba(24,185,104,.10);
}

.contact-eyebrow-light {
  color: #29d97f;
}

.contact-hero-copy h1 {
  max-width: 690px;
  margin: 17px 0 18px;
  color: #f5faf7;
  font: 700 clamp(42px, 5.2vw, 64px)/1.03 "Sora", sans-serif;
  letter-spacing: -.055em;
}

.contact-hero-copy h1 em {
  color: var(--contact-brand-bright);
  font-style: normal;
}

.contact-hero-copy p {
  max-width: 580px;
  margin: 0;
  color: rgba(245,250,247,.60);
  font: 400 16px/1.78 "Lora", serif;
}

.contact-quick-card {
  padding: 23px 23px 21px;
  border: 1px solid rgba(255,255,255,.11);
  border-radius: 12px;
  background: rgba(20,29,36,.90);
  box-shadow: 0 25px 70px rgba(0,0,0,.25);
  backdrop-filter: blur(12px);
}

.contact-response {
  display: flex;
  align-items: center;
  gap: 8px;
  color: rgba(245,250,247,.60);
  font: 600 11px/1.45 "DM Mono", monospace;
}

.contact-response > span {
  width: 6px;
  height: 6px;
  flex: none;
  border-radius: 50%;
  background: var(--contact-brand-bright);
}

.contact-response strong {
  color: var(--contact-brand-bright);
}

.contact-card-divider {
  height: 1px;
  margin: 18px 0;
  background: rgba(255,255,255,.08);
}

.contact-label {
  margin-bottom: 7px;
  color: rgba(245,250,247,.32);
  font: 700 9px/1.2 "DM Mono", monospace;
  letter-spacing: .08em;
}

.contact-email {
  min-height: 43px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 0 13px;
  border: 1px solid rgba(255,255,255,.06);
  border-radius: 7px;
  background: rgba(255,255,255,.045);
  color: #f5faf7;
  text-decoration: none;
  font: 600 11px/1.25 "DM Mono", monospace;
  transition: border-color .2s ease, background .2s ease;
}

.contact-email:hover {
  border-color: rgba(39,217,127,.35);
  background: rgba(24,185,104,.08);
}

.contact-email b {
  color: var(--contact-brand-bright);
}

.contact-meta-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-top: 9px;
}

.contact-meta-grid div {
  min-height: 61px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 10px 11px;
  border: 1px solid rgba(255,255,255,.05);
  border-radius: 7px;
  background: rgba(255,255,255,.045);
}

.contact-meta-grid strong {
  color: rgba(245,250,247,.78);
  font: 700 12px/1.3 "Sora", sans-serif;
}

.contact-meta-grid span {
  margin-top: 4px;
  color: rgba(245,250,247,.32);
  font: 500 9px/1.3 "DM Mono", monospace;
}

.contact-hero-bottom {
  position: absolute;
  z-index: 2;
  right: 0;
  bottom: 0;
  left: 0;
  border-top: 1px solid rgba(255,255,255,.07);
  background: #151c23;
}

.contact-note {
  min-height: 55px;
  display: flex;
  align-items: center;
  gap: 11px;
}

.contact-note-icon {
  width: 23px;
  height: 23px;
  flex: none;
  display: grid;
  place-items: center;
  border-radius: 6px;
  background: rgba(220,75,75,.12);
  color: #ff8a8a;
  font: 700 10px/1.2 "DM Mono", monospace;
}

.contact-note p {
  margin: 0;
  color: rgba(245,250,247,.48);
  font: 400 13px/1.65 "Lora", serif;
}

.contact-note strong {
  color: rgba(245,250,247,.68);
  font-family: "Sora", sans-serif;
}

.contact-section {
  position: relative;
  padding: 72px 0;
}

.contact-section-heading {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 30px;
  margin-bottom: 29px;
}

.contact-section-heading h2 {
  max-width: 800px;
  margin: 11px 0 0;
  color: var(--contact-ink);
  font: 700 clamp(28px, 3.4vw, 40px)/1.08 "Sora", sans-serif;
  letter-spacing: -.05em;
}

.contact-section-heading p {
  max-width: 650px;
  margin: 11px 0 0;
  color: var(--contact-muted);
  font: 400 16px/1.78 "Lora", serif;
}

.contact-index {
  flex: none;
  color: #a3adb2;
  font: 600 10px/1.2 "DM Mono", monospace;
}

.contact-paths {
  background:
    radial-gradient(circle at 92% 12%, rgba(24,185,104,.055), transparent 24%),
    #fff;
}

.contact-path-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.contact-path-card {
  min-height: 225px;
  padding: 22px 23px 20px;
  border: 1px solid var(--contact-line);
  border-radius: 10px;
  background: #fff;
  transition: transform .2s ease, border-color .2s ease, box-shadow .2s ease, background .2s ease;
}

.contact-path-card:hover {
  transform: translateY(-3px);
  border-color: rgba(24,185,104,.30);
  background: #f7fbf9;
  box-shadow: 0 15px 35px rgba(12,20,27,.07);
}

.contact-path-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.contact-path-icon {
  width: 30px;
  height: 30px;
  display: grid;
  place-items: center;
  border: 1px solid rgba(24,185,104,.15);
  border-radius: 7px;
  background: #f3faf6;
  color: var(--contact-brand);
  font: 600 13px/1 "DM Mono", monospace;
}

.contact-path-tag {
  padding: 5px 8px;
  border-radius: 999px;
  background: #f5f7f7;
  color: #7c878d;
  font: 700 8px/1.2 "DM Mono", monospace;
  letter-spacing: .05em;
}

.contact-path-card h3 {
  margin: 16px 0 7px;
  color: var(--contact-ink);
  font: 700 16px/1.35 "Sora", sans-serif;
}

.contact-path-card p {
  max-width: 510px;
  margin: 0;
  color: #66737b;
  font: 400 15px/1.75 "Lora", serif;
}

.contact-path-card a {
  display: inline-block;
  margin-top: 14px;
  color: var(--contact-brand);
  text-decoration: none;
  font: 700 10px/1.2 "DM Mono", monospace;
}

.contact-path-card a:hover {
  color: #07914e;
}

.contact-outreach {
  background: #f5f8f7;
  border-top: 1px solid rgba(12,20,27,.06);
}

.contact-outreach-layout {
  display: grid;
  grid-template-columns: minmax(0, 1.05fr) minmax(350px, .85fr);
  gap: 42px;
  align-items: start;
}

.contact-outreach-list {
  overflow: hidden;
  border: 1px solid var(--contact-line);
  border-radius: 10px;
  background: #fff;
}

.contact-outreach-item {
  display: grid;
  grid-template-columns: 38px 1fr;
  gap: 13px;
  padding: 16px 18px;
  border-bottom: 1px solid var(--contact-line);
}

.contact-outreach-item:last-child {
  border-bottom: 0;
}

.contact-outreach-item > span {
  width: 25px;
  height: 25px;
  display: grid;
  place-items: center;
  border-radius: 6px;
  background: #eff9f4;
  color: var(--contact-brand);
  font: 700 9px/1.2 "DM Mono", monospace;
}

.contact-outreach-item h3 {
  margin: 1px 0 5px;
  color: var(--contact-ink);
  font: 700 14px/1.4 "Sora", sans-serif;
}

.contact-outreach-item p {
  margin: 0;
  color: #738087;
  font: 400 14px/1.7 "Lora", serif;
}

.contact-expect-card {
  padding: 27px 29px;
  border: 1px solid rgba(255,255,255,.08);
  border-radius: 10px;
  background:
    linear-gradient(135deg, rgba(24,185,104,.045), transparent 50%),
    #0d131a;
  color: #f5faf7;
}

.contact-expect-card h3 {
  margin: 13px 0 9px;
  color: #f5faf7;
  font: 700 24px/1.2 "Sora", sans-serif;
  letter-spacing: -.035em;
}

.contact-expect-card > p {
  margin: 0;
  color: rgba(245,250,247,.54);
  font: 400 14px/1.75 "Lora", serif;
}

.contact-expect-card ul {
  display: grid;
  gap: 9px;
  margin: 20px 0 0;
  padding: 0;
  list-style: none;
}

.contact-expect-card li {
  display: flex;
  align-items: flex-start;
  gap: 9px;
  color: rgba(245,250,247,.62);
  font: 500 10px/1.5 "DM Mono", monospace;
}

.contact-expect-card li span {
  color: var(--contact-brand-bright);
  font-weight: 700;
}

.contact-final-cta {
  position: relative;
  min-height: 430px;
  display: flex;
  align-items: center;
  overflow: hidden;
  background: #080d13;
  color: #f5faf7;
  text-align: center;
  isolation: isolate;
}

.contact-final-grid {
  opacity: .4;
}

.contact-final-glow {
  position: absolute;
  width: 620px;
  height: 360px;
  left: 50%;
  bottom: -280px;
  transform: translateX(-50%);
  background: radial-gradient(circle, rgba(24,185,104,.20), transparent 68%);
  pointer-events: none;
}

.contact-final-inner {
  position: relative;
  z-index: 1;
  padding: 75px 0;
}

.contact-final-inner h2 {
  margin: 14px 0 13px;
  color: #f5faf7;
  font: 700 clamp(31px, 4.3vw, 48px)/1.06 "Sora", sans-serif;
  letter-spacing: -.055em;
}

.contact-final-inner h2 em {
  color: var(--contact-brand-bright);
  font-style: normal;
}

.contact-final-inner > p {
  max-width: 550px;
  margin: 0 auto;
  color: rgba(245,250,247,.52);
  font: 400 15px/1.75 "Lora", serif;
}

.contact-primary-button {
  min-height: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 9px;
  margin-top: 25px;
  padding: 0 19px;
  border-radius: 7px;
  background: var(--contact-brand-bright);
  color: #06120b;
  text-decoration: none;
  font: 700 10px/1.2 "DM Mono", monospace;
  transition: transform .2s ease, background .2s ease;
}

.contact-primary-button:hover {
  transform: translateY(-2px);
  background: #35e58c;
}

.contact-final-email {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  margin-top: 20px;
  color: rgba(245,250,247,.29);
  font: 500 9px/1.55 "DM Mono", monospace;
}

.contact-final-email a {
  color: var(--contact-brand-bright);
  text-decoration: none;
}

.contact-final-email a:hover {
  text-decoration: underline;
}

@media (max-width: 950px) {
  .contact-hero-inner {
    grid-template-columns: 1fr;
    gap: 35px;
  }

  .contact-quick-card {
    max-width: 620px;
  }

  .contact-outreach-layout {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 720px) {
  .contact-container {
    width: min(100% - 28px, 620px);
  }

  .contact-hero {
    min-height: auto;
  }

  .contact-hero-inner {
    padding: 62px 0 85px;
  }

  .contact-hero-copy h1 {
    font-size: clamp(37px, 10vw, 50px);
  }

  .contact-hero-copy p {
    font-size: 15px;
  }

  .contact-section {
    padding: 54px 0;
  }

  .contact-section-heading {
    display: block;
    margin-bottom: 23px;
  }

  .contact-section-heading h2 {
    font-size: 28px;
  }

  .contact-index {
    display: block;
    margin-top: 13px;
  }

  .contact-path-grid {
    grid-template-columns: 1fr;
  }

  .contact-path-card {
    min-height: auto;
  }

  .contact-note {
    min-height: 62px;
    padding: 10px 0;
  }

  .contact-note p {
    font-size: 11px;
  }

  .contact-expect-card {
    padding: 25px 22px;
  }

  .contact-final-inner {
    padding: 62px 0;
  }
}

@media (max-width: 480px) {
  .contact-container {
    width: min(100% - 22px, 620px);
  }

  .contact-hero-copy h1 br,
  .contact-final-inner h2 br {
    display: none;
  }

  .contact-quick-card {
    padding: 19px;
  }

  .contact-meta-grid div {
    min-height: 57px;
  }

  .contact-path-card p,
  .contact-outreach-item p {
    font-size: 13px;
  }

  .contact-final-email {
    flex-wrap: wrap;
  }
}

@media (prefers-reduced-motion: reduce) {
  .contact-page *,
  .contact-page *::before,
  .contact-page *::after {
    transition: none !important;
  }
}


/* Readability pass — desktop-first typography */
.contact-page .contact-hero-copy p,
.contact-page .contact-section-heading p,
.contact-page .contact-path-card p,
.contact-page .contact-outreach-item p,
.contact-page .contact-expect-card > p {
  font-size: 15px;
  line-height: 1.78;
}

.contact-page .contact-path-card h3,
.contact-page .contact-outreach-item h3 {
  font-size: 15px;
  line-height: 1.4;
}

.contact-page .contact-note p {
  font-size: 12px;
  line-height: 1.6;
}

.contact-page .contact-response {
  font-size: 11px;
  line-height: 1.5;
}

.contact-page .contact-meta-grid strong {
  font-size: 12px;
  line-height: 1.35;
}

.contact-page .contact-meta-grid span,
.contact-page .contact-path-tag {
  font-size: 9px;
  line-height: 1.35;
}

.contact-page .contact-expect-card li {
  font-size: 11px;
  line-height: 1.55;
}

.contact-page .contact-final-inner > p {
  font-size: 15px;
  line-height: 1.75;
}

.contact-page .contact-final-email {
  font-size: 10px;
  line-height: 1.55;
}

@media (min-width: 951px) {
  .contact-page .contact-path-card {
    min-height: 245px;
    padding: 26px 27px 23px;
  }

  .contact-page .contact-outreach-item {
    padding: 18px 20px;
  }

  .contact-page .contact-section {
    padding-top: 78px;
    padding-bottom: 78px;
  }
}

/* Theme support: follows the same data-theme / dark class conventions
   commonly used by the AlloyPress site shell. */
html[data-theme="dark"] .contact-page,
body.dark .contact-page,
html.dark .contact-page {
  --contact-ink: #f3f8f5;
  --contact-muted: #a0ada7;
  --contact-line: rgba(255,255,255,.10);
  background: #0b1117;
  color: #f3f8f5;
}

html[data-theme="dark"] .contact-paths,
body.dark .contact-paths,
html.dark .contact-paths {
  background:
    radial-gradient(circle at 92% 12%, rgba(24,185,104,.07), transparent 24%),
    #0b1117;
}

html[data-theme="dark"] .contact-outreach,
body.dark .contact-outreach,
html.dark .contact-outreach {
  background: #0f161d;
  border-color: rgba(255,255,255,.07);
}

html[data-theme="dark"] .contact-path-card,
body.dark .contact-path-card,
html.dark .contact-path-card,
html[data-theme="dark"] .contact-outreach-list,
body.dark .contact-outreach-list,
html.dark .contact-outreach-list {
  background: #111920;
  border-color: rgba(255,255,255,.09);
}

html[data-theme="dark"] .contact-path-card:hover,
body.dark .contact-path-card:hover,
html.dark .contact-path-card:hover {
  background: #14201d;
  border-color: rgba(39,217,127,.30);
  box-shadow: 0 15px 35px rgba(0,0,0,.20);
}

html[data-theme="dark"] .contact-path-card h3,
body.dark .contact-path-card h3,
html.dark .contact-path-card h3,
html[data-theme="dark"] .contact-outreach-item h3,
body.dark .contact-outreach-item h3,
html.dark .contact-outreach-item h3 {
  color: #f3f8f5;
}

html[data-theme="dark"] .contact-path-card p,
body.dark .contact-path-card p,
html.dark .contact-path-card p,
html[data-theme="dark"] .contact-outreach-item p,
body.dark .contact-outreach-item p,
html.dark .contact-outreach-item p,
html[data-theme="dark"] .contact-section-heading p,
body.dark .contact-section-heading p,
html.dark .contact-section-heading p {
  color: #aab6b0;
}

html[data-theme="dark"] .contact-path-tag,
body.dark .contact-path-tag,
html.dark .contact-path-tag {
  background: #192229;
  color: #a5b0ab;
}

html[data-theme="dark"] .contact-path-icon,
body.dark .contact-path-icon,
html.dark .contact-path-icon,
html[data-theme="dark"] .contact-outreach-item > span,
body.dark .contact-outreach-item > span,
html.dark .contact-outreach-item > span {
  background: rgba(24,185,104,.10);
  border-color: rgba(24,185,104,.18);
}

html[data-theme="dark"] .contact-outreach-item,
body.dark .contact-outreach-item,
html.dark .contact-outreach-item {
  border-color: rgba(255,255,255,.08);
}

html[data-theme="dark"] .contact-index,
body.dark .contact-index,
html.dark .contact-index {
  color: #7f8c87;
}

html[data-theme="dark"] .contact-section-heading h2,
body.dark .contact-section-heading h2,
html.dark .contact-section-heading h2 {
  color: #f3f8f5;
}
`;
