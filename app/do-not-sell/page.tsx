import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Do Not Sell or Share My Personal Information | AlloyPress",
  description:
    "Learn how AlloyPress handles personal information and how to submit a request regarding the sale or sharing of personal information.",
  alternates: {
    canonical: "/do-not-sell",
  },
  robots: {
    index: true,
    follow: true,
  },
};

const rights = [
  "Request access to your personal information",
  "Request the deletion of your information",
  "Request information regarding collected data",
  "Opt out of certain tracking technologies through your browser settings",
];

export default function DoNotSellPage() {
  return (
    <>
      <main className="dns-page">
        <section className="dns-hero">
          <div className="dns-grid" aria-hidden="true" />
          <div className="dns-hero-glow" aria-hidden="true" />

          <div className="dns-container dns-hero-inner">
            <div className="dns-eyebrow">
              <span />
              PRIVACY CONTROL
            </div>

            <h1>
              Do Not Sell or Share
              <br />
              <span>My Personal Information</span>
            </h1>

            <p>
              Your privacy matters. Learn what information AlloyPress collects,
              how it may be used, and how you can exercise your privacy rights.
            </p>

            <div className="dns-meta">
              <span>LAST UPDATED</span>
              <strong>May 14, 2026</strong>
            </div>
          </div>
        </section>

        <section className="dns-content">
          <div className="dns-container dns-layout">
            <article className="dns-document">
              <div className="dns-document-head">
                <span className="dns-doc-number">01</span>
                <div>
                  <span className="dns-kicker">YOUR PRIVACY RIGHTS</span>
                  <h2>Do Not Sell or Share My Personal Information</h2>
                </div>
              </div>

              <p>
                At AlloyPress, we respect your privacy and are committed to
                protecting your personal information.
              </p>

              <p>
                Under certain privacy laws, including the California Consumer
                Privacy Act (CCPA) and California Privacy Rights Act (CPRA),
                users may have the right to request that businesses do not sell
                or share their personal information.
              </p>

              <div className="dns-callout">
                <span className="dns-callout-icon">✓</span>
                <div>
                  <strong>AlloyPress does not sell personal information</strong>
                  <p>
                    AlloyPress does not sell personal information to third
                    parties for monetary compensation.
                  </p>
                </div>
              </div>

              <h3>How information may still be collected</h3>

              <p>
                However, some third-party advertising, analytics, affiliate, or
                tracking services used on our website may collect limited
                information through cookies or similar technologies to improve
                user experience, analytics, advertising performance, or
                affiliate tracking.
              </p>

              <h3>Your privacy choices</h3>

              <p>You may:</p>

              <ul className="dns-rights">
                {rights.map((right, index) => (
                  <li key={right}>
                    <span>{String(index + 1).padStart(2, "0")}</span>
                    <p>{right}</p>
                  </li>
                ))}
              </ul>

              <div className="dns-request">
                <span className="dns-kicker">SUBMIT A REQUEST</span>
                <h3>Want to make a privacy-related request?</h3>
                <p>
                  If you would like to submit a privacy-related request,
                  please contact us at:
                </p>

                <a href="mailto:contact@alloypress.com">
                  contact@alloypress.com <span>↗</span>
                </a>

                <p className="dns-small">
                  We may need to verify your identity before processing certain
                  requests.
                </p>
              </div>

              <h3>More information</h3>

              <p>
                For additional details about how we collect, use, and protect
                information, please review our Privacy Policy.
              </p>

              <p>
                Website:{" "}
                <a
                  href="https://alloypress.com"
                  target="_blank"
                  rel="noreferrer"
                >
                  https://alloypress.com
                </a>
              </p>
            </article>

            <aside className="dns-sidebar">
              <div className="dns-side-card dns-side-primary">
                <span className="dns-side-dot" />
                <span className="dns-kicker">NEED HELP?</span>
                <h2>Have a privacy question?</h2>
                <p>
                  If you have a question about your personal information or
                  want to submit a privacy request, contact our team directly.
                </p>
                <a href="mailto:contact@alloypress.com">
                  Contact us <span>↗</span>
                </a>
              </div>

              <div className="dns-side-card dns-side-note">
                <span className="dns-side-index">02 / PRIVACY</span>
                <h3>Keep your request clear</h3>
                <p>
                  Tell us what you are requesting and provide enough
                  information for us to verify and process the request.
                </p>
              </div>

              <div className="dns-side-card dns-side-note">
                <span className="dns-side-index">03 / RESPONSE</span>
                <h3>Identity verification</h3>
                <p>
                  Certain requests may require verification before they can be
                  processed.
                </p>
              </div>
            </aside>
          </div>
        </section>

        <section className="dns-bottom">
          <div className="dns-container dns-bottom-inner">
            <div>
              <span className="dns-kicker">PRIVACY, WITHOUT THE FRICTION</span>
              <h2>Your information should stay under your control.</h2>
            </div>
            <a href="mailto:contact@alloypress.com">
              Contact AlloyPress <span>↗</span>
            </a>
          </div>
        </section>
      </main>

      <style dangerouslySetInnerHTML={{ __html: styles }} />
    </>
  );
}

const styles = `
.dns-page {
  --dns-bg: #f5f8f7;
  --dns-surface: #ffffff;
  --dns-surface-soft: #eef4f2;
  --dns-text: #0b1420;
  --dns-muted: #667484;
  --dns-border: rgba(11,20,32,.11);
  --dns-green: #18b968;
  --dns-green-dark: #07934f;
  --dns-dark: #091018;
  --dns-dark-soft: #111a22;
  color: var(--dns-text);
  background: var(--dns-bg);
  font-family: "Lora", Georgia, serif;
}

.dns-container {
  width: min(1180px, calc(100% - 48px));
  margin-inline: auto;
}

.dns-hero {
  position: relative;
  overflow: hidden;
  min-height: 455px;
  display: flex;
  align-items: center;
  background:
    radial-gradient(circle at 75% 35%, rgba(24,185,104,.15), transparent 28%),
    linear-gradient(135deg, #081018 0%, #0b1219 58%, #091b16 100%);
  color: #f4f8f6;
}

.dns-grid {
  position: absolute;
  inset: 0;
  opacity: .28;
  background-image:
    linear-gradient(rgba(255,255,255,.045) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,.045) 1px, transparent 1px),
    radial-gradient(circle, rgba(24,185,104,.28) 1px, transparent 1px);
  background-size: 72px 72px, 72px 72px, 18px 18px;
  mask-image: linear-gradient(to bottom, black, transparent 92%);
}

.dns-hero-glow {
  position: absolute;
  width: 520px;
  height: 520px;
  right: -170px;
  top: -190px;
  border-radius: 50%;
  background: rgba(24,185,104,.10);
  filter: blur(85px);
}

.dns-hero-inner {
  position: relative;
  z-index: 1;
  padding: 72px 0 68px;
}

.dns-eyebrow,
.dns-kicker {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--dns-green);
  font: 700 11px/1 "DM Mono", monospace;
  letter-spacing: .12em;
  text-transform: uppercase;
}

.dns-eyebrow span,
.dns-side-dot {
  width: 7px;
  height: 7px;
  flex: 0 0 7px;
  border-radius: 50%;
  background: var(--dns-green);
  box-shadow: 0 0 0 4px rgba(24,185,104,.10);
}

.dns-hero h1 {
  max-width: 900px;
  margin: 20px 0 18px;
  color: #f7faf9;
  font: 700 clamp(42px, 5.7vw, 78px)/.98 "Sora", sans-serif;
  letter-spacing: -.055em;
}

.dns-hero h1 span {
  color: #21d57b;
}

.dns-hero > .dns-container > p {
  max-width: 700px;
  margin: 0;
  color: rgba(236,243,240,.78);
  font: 400 17px/1.7 "Lora", Georgia, serif;
}

.dns-meta {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-top: 30px;
  padding-top: 18px;
  border-top: 1px solid rgba(255,255,255,.12);
  width: min(700px, 100%);
}

.dns-meta span {
  color: rgba(255,255,255,.45);
  font: 700 10px/1 "DM Mono", monospace;
  letter-spacing: .12em;
}

.dns-meta strong {
  color: #e9f1ed;
  font: 600 12px/1 "DM Mono", monospace;
}

.dns-content {
  padding: 64px 0 78px;
}

.dns-layout {
  display: grid;
  grid-template-columns: minmax(0, 780px) 310px;
  gap: 52px;
  align-items: start;
}

.dns-document {
  background: var(--dns-surface);
  border: 1px solid var(--dns-border);
  border-radius: 16px;
  padding: clamp(30px, 4vw, 52px);
  box-shadow: 0 18px 50px rgba(10,25,20,.06);
}

.dns-document-head {
  display: flex;
  gap: 18px;
  align-items: flex-start;
  padding-bottom: 28px;
  margin-bottom: 28px;
  border-bottom: 1px solid var(--dns-border);
}

.dns-doc-number {
  display: grid;
  place-items: center;
  width: 38px;
  height: 38px;
  flex: 0 0 38px;
  border-radius: 9px;
  background: rgba(24,185,104,.09);
  color: var(--dns-green-dark);
  font: 700 10px/1 "DM Mono", monospace;
}

.dns-document h2 {
  margin: 8px 0 0;
  font: 700 clamp(25px, 3vw, 36px)/1.15 "Sora", sans-serif;
  letter-spacing: -.035em;
}

.dns-document > p,
.dns-document li p {
  color: var(--dns-muted);
  font: 400 16px/1.82 "Lora", Georgia, serif;
}

.dns-document > p {
  margin: 0 0 22px;
}

.dns-document h3 {
  margin: 34px 0 12px;
  color: var(--dns-text);
  font: 700 20px/1.3 "Sora", sans-serif;
  letter-spacing: -.025em;
}

.dns-callout {
  display: flex;
  gap: 16px;
  margin: 30px 0;
  padding: 20px 22px;
  border: 1px solid rgba(24,185,104,.24);
  border-left: 3px solid var(--dns-green);
  border-radius: 12px;
  background: rgba(24,185,104,.055);
}

.dns-callout-icon {
  display: grid;
  place-items: center;
  width: 30px;
  height: 30px;
  flex: 0 0 30px;
  border-radius: 8px;
  background: rgba(24,185,104,.12);
  color: var(--dns-green-dark);
  font: 700 14px/1 "DM Mono", monospace;
}

.dns-callout strong {
  display: block;
  margin: 2px 0 7px;
  color: var(--dns-text);
  font: 700 15px/1.35 "Sora", sans-serif;
}

.dns-callout p {
  margin: 0;
  color: var(--dns-muted);
  font: 400 14px/1.65 "Lora", Georgia, serif;
}

.dns-rights {
  display: grid;
  gap: 0;
  margin: 16px 0 30px;
  padding: 0;
  list-style: none;
  border: 1px solid var(--dns-border);
  border-radius: 12px;
  overflow: hidden;
}

.dns-rights li {
  display: grid;
  grid-template-columns: 38px 1fr;
  align-items: center;
  gap: 14px;
  padding: 15px 18px;
  border-bottom: 1px solid var(--dns-border);
}

.dns-rights li:last-child {
  border-bottom: 0;
}

.dns-rights li > span {
  display: grid;
  place-items: center;
  width: 30px;
  height: 30px;
  border-radius: 8px;
  background: var(--dns-surface-soft);
  color: var(--dns-green-dark);
  font: 700 9px/1 "DM Mono", monospace;
}

.dns-rights p {
  margin: 0 !important;
  color: var(--dns-text) !important;
  font-family: "Sora", sans-serif !important;
  font-size: 13px !important;
  line-height: 1.5 !important;
  font-weight: 600 !important;
}

.dns-request {
  margin: 38px 0;
  padding: 28px;
  border-radius: 14px;
  background: var(--dns-dark);
  color: #fff;
}

.dns-request .dns-kicker {
  margin-bottom: 10px;
}

.dns-request h3 {
  margin: 0 0 10px;
  color: #f4f8f6;
  font-size: 23px;
}

.dns-request p {
  margin: 0 0 16px;
  color: rgba(232,241,237,.72);
  font: 400 14px/1.7 "Lora", Georgia, serif;
}

.dns-request a,
.dns-document a {
  color: var(--dns-green);
  font-weight: 700;
  text-decoration: none;
}

.dns-request a {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font: 700 13px/1 "DM Mono", monospace;
}

.dns-request .dns-small {
  margin-top: 18px;
  margin-bottom: 0;
  color: rgba(232,241,237,.48);
  font-size: 12px;
}

.dns-sidebar {
  position: sticky;
  top: 92px;
  display: grid;
  gap: 14px;
}

.dns-side-card {
  padding: 24px;
  border: 1px solid var(--dns-border);
  border-radius: 14px;
  background: var(--dns-surface);
}

.dns-side-primary {
  border-color: rgba(24,185,104,.24);
  box-shadow: 0 12px 35px rgba(10,25,20,.05);
}

.dns-side-dot {
  display: inline-block;
  margin-bottom: 17px;
}

.dns-side-card h2 {
  margin: 10px 0 9px;
  color: var(--dns-text);
  font: 700 21px/1.2 "Sora", sans-serif;
  letter-spacing: -.03em;
}

.dns-side-card p {
  margin: 0;
  color: var(--dns-muted);
  font: 400 13px/1.7 "Lora", Georgia, serif;
}

.dns-side-primary > a {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  margin-top: 20px;
  padding: 11px 14px;
  border-radius: 8px;
  background: var(--dns-green);
  color: #07150e;
  font: 700 10px/1 "DM Mono", monospace;
  text-decoration: none;
}

.dns-side-index {
  display: block;
  margin-bottom: 12px;
  color: var(--dns-green-dark);
  font: 700 9px/1 "DM Mono", monospace;
  letter-spacing: .08em;
}

.dns-side-note h3 {
  margin: 0 0 7px;
  font-size: 15px;
}

.dns-bottom {
  position: relative;
  overflow: hidden;
  padding: 52px 0;
  background:
    radial-gradient(circle at 75% 50%, rgba(24,185,104,.12), transparent 30%),
    var(--dns-dark);
  color: #fff;
}

.dns-bottom-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 30px;
}

.dns-bottom h2 {
  max-width: 650px;
  margin: 10px 0 0;
  color: #f5f8f7;
  font: 700 clamp(25px, 3.5vw, 42px)/1.1 "Sora", sans-serif;
  letter-spacing: -.04em;
}

.dns-bottom-inner > a {
  display: inline-flex;
  align-items: center;
  gap: 9px;
  flex: 0 0 auto;
  padding: 14px 18px;
  border-radius: 9px;
  background: var(--dns-green);
  color: #06130c;
  font: 700 10px/1 "DM Mono", monospace;
  text-decoration: none;
  transition: transform .2s ease, background .2s ease;
}

.dns-bottom-inner > a:hover {
  transform: translateY(-2px);
  background: #2ddd85;
}

@media (max-width: 900px) {
  .dns-layout {
    grid-template-columns: 1fr;
  }

  .dns-sidebar {
    position: static;
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .dns-side-primary {
    grid-column: 1 / -1;
  }

  .dns-bottom-inner {
    align-items: flex-start;
    flex-direction: column;
  }
}

@media (max-width: 640px) {
  .dns-container {
    width: min(100% - 28px, 1180px);
  }

  .dns-hero {
    min-height: auto;
  }

  .dns-hero-inner {
    padding: 58px 0 52px;
  }

  .dns-hero h1 {
    font-size: clamp(36px, 11vw, 52px);
    line-height: 1.02;
  }

  .dns-hero > .dns-container > p {
    font-size: 15px;
    line-height: 1.7;
  }

  .dns-content {
    padding: 28px 0 42px;
  }

  .dns-document {
    padding: 24px 20px;
    border-radius: 12px;
  }

  .dns-document-head {
    gap: 12px;
  }

  .dns-document > p,
  .dns-document li p {
    font-size: 15px;
    line-height: 1.78;
  }

  .dns-document h3 {
    font-size: 18px;
    margin-top: 28px;
  }

  .dns-sidebar {
    grid-template-columns: 1fr;
  }

  .dns-side-primary {
    grid-column: auto;
  }

  .dns-rights li {
    grid-template-columns: 32px 1fr;
    padding: 13px 12px;
    gap: 10px;
  }

  .dns-request {
    padding: 22px 18px;
  }

  .dns-bottom {
    padding: 42px 0;
  }
}

[data-theme="dark"] .dns-page {
  --dns-bg: #090f14;
  --dns-surface: #101820;
  --dns-surface-soft: #172229;
  --dns-text: #eef5f2;
  --dns-muted: #aebcb6;
  --dns-border: rgba(255,255,255,.10);
}

[data-theme="dark"] .dns-content {
  background:
    radial-gradient(circle at 15% 15%, rgba(24,185,104,.055), transparent 25%),
    var(--dns-bg);
}

[data-theme="dark"] .dns-document {
  box-shadow: none;
}

[data-theme="dark"] .dns-rights p {
  color: #e8f0ed !important;
}

[data-theme="dark"] .dns-side-card {
  box-shadow: none;
}

@media (prefers-reduced-motion: reduce) {
  .dns-bottom-inner > a {
    transition: none;
  }
}
`;
