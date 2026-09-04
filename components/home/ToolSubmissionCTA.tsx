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
          <a
            href="/submit-tool"
            className="tool-cta-primary"
          >
            Submit a Tool
            <span>↗</span>
          </a>

          <a
            href="/inclusion"
            className="tool-cta-secondary"
          >
            Learn More
            <span>→</span>
          </a>
        </div>

      </div>

      <style>{`
        .tool-cta {
          padding: 42px 0;
          background: #f5f8f7;
          border-top: 1px solid #dbe3df;
          border-bottom: 1px solid #dbe3df;
        }

        .tool-cta-inner {
          width: min(1060px, calc(100% - 48px));
          min-height: 190px;
          margin: 0 auto;
          padding: 30px 40px;

          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 45px;

          border: 1px solid #ccd8d2;
          border-radius: 14px;

          background: #ffffff;
        }

        .tool-cta-content {
          min-width: 0;
        }

        .tool-cta-label {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 9px;

          color: #18b968;

          font:
            800 9px/1
            "DM Mono",
            monospace;

          letter-spacing: .14em;
        }

        .tool-cta-label span {
          width: 18px;
          height: 2px;
          background: #18b968;
        }

        .tool-cta h2 {
          margin: 0 0 9px;

          color: #14202b;

          font:
            800 28px/1.15
            "Sora",
            sans-serif;

          letter-spacing: -.035em;
        }

        .tool-cta h2 span {
          color: #18b968;
        }

        .tool-cta p {
          max-width: 650px;
          margin: 0;

          color: #64727d;

          font:
            400 13px/1.65
            "Lora",
            serif;
        }

        .tool-cta-note {
          display: flex;
          align-items: center;
          gap: 7px;
          margin-top: 10px;

          color: #78857f;

          font:
            600 9px/1.3
            "DM Mono",
            monospace;
        }

        .tool-cta-note i {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: #18b968;
          box-shadow: 0 0 0 4px rgba(24,185,104,.09);
        }

        .tool-cta-actions {
          flex: 0 0 157px;

          display: flex;
          flex-direction: column;
          gap: 9px;
        }

        .tool-cta-primary,
        .tool-cta-secondary {
          min-height: 41px;

          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;

          padding: 0 15px;

          border-radius: 7px;

          text-decoration: none;

          font:
            800 12px/1
            "DM Mono",
            monospace;

          transition: .2s ease;
        }

        .tool-cta-primary {
          background: #18b968;
          border: 1px solid #18b968;
          color: #fff;
        }

        .tool-cta-primary:hover {
          background: #119d59;
          border-color: #119d59;
          transform: translateY(-1px);
        }

        .tool-cta-primary span {
          font-size: 12px;
        }

        .tool-cta-secondary {
          background: #fff;
          border: 1px solid #ccd8d2;
          color: #27342e;
        }

        .tool-cta-secondary:hover {
          border-color: #18b968;
          color: #18b968;
        }

        .tool-cta-secondary span {
          color: #18b968;
          font-size: 12px;
        }

        /* DARK */

        html[data-theme="dark"] .tool-cta,
        html.dark .tool-cta,
        body.dark .tool-cta {
          background: #0b100e;
          border-color: #26332d;
        }

        html[data-theme="dark"] .tool-cta-inner,
        html.dark .tool-cta-inner,
        body.dark .tool-cta-inner {
          background: #101713;
          border-color: #293730;
        }

        html[data-theme="dark"] .tool-cta h2,
        html.dark .tool-cta h2,
        body.dark .tool-cta h2 {
          color: #f1f6f3;
        }

        html[data-theme="dark"] .tool-cta p,
        html.dark .tool-cta p,
        body.dark .tool-cta p {
          color: #9daaa4;
        }

        html[data-theme="dark"] .tool-cta-note,
        html.dark .tool-cta-note,
        body.dark .tool-cta-note {
          color: #7f8d86;
        }

        html[data-theme="dark"] .tool-cta-secondary,
        html.dark .tool-cta-secondary,
        body.dark .tool-cta-secondary {
          background: #111a16;
          border-color: #304039;
          color: #e2ebe6;
        }

        html[data-theme="dark"] .tool-cta-secondary:hover,
        html.dark .tool-cta-secondary:hover,
        body.dark .tool-cta-secondary:hover {
          border-color: #18b968;
          color: #53d890;
        }

        @media (max-width: 720px) {
          .tool-cta {
            padding: 28px 0;
          }

          .tool-cta-inner {
            width: min(100% - 28px, 560px);
            padding: 25px 22px;

            flex-direction: column;
            align-items: stretch;
            gap: 22px;
          }

          .tool-cta h2 {
            font-size: 25px;
          }

          .tool-cta p {
            font-size: 13px;
          }

          .tool-cta-actions {
            flex: none;
            width: 100%;
          }

          .tool-cta-primary,
          .tool-cta-secondary {
            width: 100%;
          }
        }
      `}</style>
    </section>
  );
}