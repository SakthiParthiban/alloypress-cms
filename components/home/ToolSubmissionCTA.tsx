export default function ToolSubmissionCTA() {
  return (
    <section className="tool-cta">
      <div className="tool-cta-inner">
        <div className="tool-cta-content">
          <div className="tool-cta-label">
            <span />
            FOR BRANDS AND AGENCIES
          </div>

          <h2>
            Have an AI tool{" "}
            <span>worth covering?</span>
          </h2>

          <p>
            Whether you want your tool featured in one of our listicles,
            reviewed in a standalone article, or are looking for an ongoing
            editorial partnership — reach out and we will take it from there.
          </p>

          <div className="tool-cta-note">
            <i />
            We respond within 1–2 business days.
          </div>
        </div>

        <div className="tool-cta-actions">
          <a href="/submit-tool" className="tool-cta-primary">
            Submit a Tool
            <span>↗</span>
          </a>

          <a href="/inclusion" className="tool-cta-secondary">
            Learn More
            <span>→</span>
          </a>
        </div>
      </div>
    </section>
  );
}