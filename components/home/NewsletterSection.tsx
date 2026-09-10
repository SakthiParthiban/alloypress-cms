export default function NewsletterSection() {
  return (
    <section className="newsletter-section">
      <div className="newsletter-inner">

        {/* LEFT CONTENT */}
        <div className="newsletter-content">

          <div className="newsletter-eyebrow">
            EVERY FRIDAY MORNING
          </div>

          <h2>
            The AI tools worth your
            <br />
            attention, tested and
            <br />
            curated.
          </h2>

          <p>
            One email a week. No filler, no hype. Just the
            <br />
            tools we’ve actually tested, the updates worth
            <br />
            knowing, and the occasional deal worth taking.
          </p>

          <div className="newsletter-benefits">
            <div className="newsletter-benefit">
              <span className="benefit-check">✓</span>
              <strong>No spam</strong>
            </div>

            <span className="benefit-divider">|</span>

            <div className="newsletter-benefit">
              <span className="benefit-check">✓</span>
              <strong>Unsubscribe anytime</strong>
            </div>
          </div>

          <div className="newsletter-meta">
            Curated by AlloyPress
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

            <button type="submit">
              Join Free
            </button>
          </form>

          <p className="newsletter-note">
            Join readers who stay ahead of AI without the noise.
          </p>

        </div>

      </div>
    </section>
  );
}