export default function NewsletterSection() {
  return (
    <section className="newsletter-section">
      <div className="newsletter-inner">

        {/* LEFT CONTENT */}
        <div className="newsletter-content">

          <div className="newsletter-eyebrow">
            <span />
            STAY IN THE LOOP
          </div>

          <h2>
            Get the latest AI updates
            <br />
            <span>straight to your inbox.</span>
          </h2>

          <p>
            No spam. No hype. Just the AI news, tool reviews,
            and practical insights that actually matter —
            delivered when something worth reading happens.
          </p>

          <div className="newsletter-meta">
            <span className="meta-dot" />
            Curated by AlloyPress
            <span className="meta-separator">·</span>
            Read when it matters
          </div>

        </div>


        {/* RIGHT FORM */}
        <div className="newsletter-form-wrap">

          <form className="newsletter-form">
            <label
              htmlFor="newsletter-email"
              className="sr-only"
            >
              Your email address
            </label>

            <input
              id="newsletter-email"
              type="email"
              placeholder="Your email address"
              autoComplete="email"
              required
            />

            <button type="button">
              Subscribe
              <span>→</span>
            </button>
          </form>

          <p className="newsletter-note">
            Join readers who stay ahead of AI without the noise.
            Unsubscribe anytime.
          </p>

          <div className="newsletter-trust">
            <span>NO SPAM</span>
            <i />
            <span>NO NOISE</span>
            <i />
            <span>JUST AI</span>
          </div>

        </div>

      </div>
    </section>
  );
}
