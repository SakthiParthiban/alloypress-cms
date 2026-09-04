export default function PopularResources() {
  return (
    <section className="popular-resources">
      <div className="popular-resources-inner">

        <div className="resources-header">
          <div>
            <div className="resources-eyebrow">
              <span />
              POPULAR RESOURCES
            </div>

            <h2>
              Useful AI resources,
              <br />
              <span>tested and simplified.</span>
            </h2>
          </div>

          <a
            href="/resources"
            className="resources-view-all"
          >
            All resources <span>→</span>
          </a>
        </div>

        <div className="resources-grid">

          <a
            href="/blogs/best-ai-image-generators"
            className="resource-card"
          >
            <div className="resource-card-top">
              <span className="resource-number">
                01
              </span>

              <div className="resource-icon">
                ◈
              </div>
            </div>

            <div className="resource-content">
              <h3>
                Best AI Image Generators
              </h3>

              <p>
                Tested with real prompts to find
                the tools that actually deliver.
              </p>
            </div>

            <div className="resource-footer">
              <span>IMAGE GENERATION</span>
              <b>Read now →</b>
            </div>
          </a>

          <a
            href="/blogs/best-ai-chatbots"
            className="resource-card"
          >
            <div className="resource-card-top">
              <span className="resource-number">
                02
              </span>

              <div className="resource-icon">
                ◉
              </div>
            </div>

            <div className="resource-content">
              <h3>
                Best AI Chatbots
              </h3>

              <p>
                ChatGPT, Claude, Gemini and more
                compared for everyday use.
              </p>
            </div>

            <div className="resource-footer">
              <span>AI ASSISTANTS</span>
              <b>Read now →</b>
            </div>
          </a>

          <a
            href="/blogs/best-ai-detectors"
            className="resource-card"
          >
            <div className="resource-card-top">
              <span className="resource-number">
                03
              </span>

              <div className="resource-icon">
                ⌁
              </div>
            </div>

            <div className="resource-content">
              <h3>
                Best AI Detectors
              </h3>

              <p>
                GPTZero, ZeroGPT and more tested
                for accuracy and reliability.
              </p>
            </div>

            <div className="resource-footer">
              <span>AI DETECTION</span>
              <b>Read now →</b>
            </div>
          </a>

          <a
            href="/blogs/best-ai-background-removers"
            className="resource-card"
          >
            <div className="resource-card-top">
              <span className="resource-number">
                04
              </span>

              <div className="resource-icon">
                ✦
              </div>
            </div>

            <div className="resource-content">
              <h3>
                Best AI Background Removers
              </h3>

              <p>
                Remove backgrounds faster with
                tools we have actually tested.
              </p>
            </div>

            <div className="resource-footer">
              <span>IMAGE TOOLS</span>
              <b>Read now →</b>
            </div>
          </a>

        </div>
      </div>

      <style>{`
        .popular-resources {
          position: relative;
          padding: 78px 0 82px;
          overflow: hidden;
          background:
            linear-gradient(
              180deg,
              rgba(24,185,104,.035),
              transparent 70%
            ),
            var(--background, #f8faf9);
          border-top: 1px solid rgba(20,32,43,.08);
          border-bottom: 1px solid rgba(20,32,43,.08);
        }

        .popular-resources::before {
          content: "";
          position: absolute;
          inset: 0;
          pointer-events: none;
          background-image:
            linear-gradient(
              rgba(24,185,104,.035) 1px,
              transparent 1px
            ),
            linear-gradient(
              90deg,
              rgba(24,185,104,.035) 1px,
              transparent 1px
            );
          background-size: 48px 48px;
          mask-image:
            linear-gradient(
              to bottom,
              black,
              transparent 80%
            );
        }

        .popular-resources-inner {
          position: relative;
          z-index: 1;
          width: min(1180px, calc(100% - 48px));
          margin: 0 auto;
        }

        .resources-header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 30px;
          margin-bottom: 32px;
        }

        .resources-eyebrow {
          display: flex;
          align-items: center;
          gap: 9px;
          margin-bottom: 13px;
          color: #18b968;
          font: 800 10px/1 "DM Mono", monospace;
          letter-spacing: .15em;
        }

        .resources-eyebrow span {
          width: 22px;
          height: 2px;
          background: #18b968;
        }

        .resources-header h2 {
          margin: 0;
          color: #111a23;
          font: 800 clamp(30px, 3.2vw, 44px)/1.08 "Sora", sans-serif;
          letter-spacing: -.045em;
        }

        .resources-header h2 span {
          color: #18b968;
        }

        .resources-view-all {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          min-height: 35px;
          padding: 0 13px;
          border: 1px solid rgba(24,185,104,.22);
          border-radius: 8px;
          background: rgba(24,185,104,.06);
          color: #18a85f;
          text-decoration: none;
          font: 700 10px/1 "DM Mono", monospace;
          white-space: nowrap;
          transition: all .2s ease;
        }

        .resources-view-all:hover {
          background: #18b968;
          border-color: #18b968;
          color: #fff;
          transform: translateY(-1px);
        }

        .resources-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 14px;
        }

        .resource-card {
          position: relative;
          display: flex;
          flex-direction: column;
          min-height: 285px;
          padding: 19px;
          border: 1px solid rgba(20,32,43,.12);
          border-radius: 12px;
          background: rgba(255,255,255,.82);
          color: inherit;
          text-decoration: none;
          overflow: hidden;
          transition:
            transform .25s ease,
            border-color .25s ease,
            box-shadow .25s ease;
        }

        .resource-card::after {
          content: "";
          position: absolute;
          left: 0;
          bottom: 0;
          width: 0;
          height: 2px;
          background: #18b968;
          transition: width .3s ease;
        }

        .resource-card:hover {
          transform: translateY(-5px);
          border-color: rgba(24,185,104,.38);
          box-shadow: 0 18px 42px rgba(20,32,43,.08);
          background: #fff;
        }

        .resource-card:hover::after {
          width: 100%;
        }

        .resource-card-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 30px;
        }

        .resource-number {
          color: #a0aaa7;
          font: 700 10px/1 "DM Mono", monospace;
          letter-spacing: .08em;
        }

        .resource-icon {
          width: 43px;
          height: 43px;
          display: grid;
          place-items: center;
          border: 1px solid rgba(24,185,104,.22);
          border-radius: 9px;
          background: rgba(24,185,104,.07);
          color: #18b968;
          font: 700 21px/1 "Sora", sans-serif;
          transition: transform .25s ease;
        }

        .resource-card:hover .resource-icon {
          transform: rotate(5deg) scale(1.05);
        }

        .resource-content {
          flex: 1;
        }

        .resource-content h3 {
          margin: 0 0 11px;
          color: #15202a;
          font: 800 18px/1.25 "Sora", sans-serif;
          letter-spacing: -.025em;
        }

        .resource-content p {
          max-width: 245px;
          margin: 0;
          color: #65737f;
          font: 400 14px/1.65 "Lora", serif;
        }

        .resource-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          margin-top: 28px;
          padding-top: 14px;
          border-top: 1px solid rgba(20,32,43,.08);
        }

        .resource-footer span {
          color: #9aa5a1;
          font: 700 8px/1 "DM Mono", monospace;
          letter-spacing: .09em;
        }

        .resource-footer b {
          color: #18b968;
          font: 800 10px/1 "DM Mono", monospace;
        }

        /* DARK */

        html[data-theme="dark"] .popular-resources,
        html.dark .popular-resources,
        body.dark .popular-resources {
          background:
            linear-gradient(
              180deg,
              rgba(24,185,104,.045),
              transparent 75%
            ),
            #0b100e;
          border-color: #26332d;
        }

        html[data-theme="dark"] .resources-header h2,
        html.dark .resources-header h2,
        body.dark .resources-header h2 {
          color: #f1f6f3;
        }

        html[data-theme="dark"] .resource-card,
        html.dark .resource-card,
        body.dark .resource-card {
          background: #101713;
          border-color: #293730;
        }

        html[data-theme="dark"] .resource-card:hover,
        html.dark .resource-card:hover,
        body.dark .resource-card:hover {
          background: #131c17;
          border-color: rgba(24,185,104,.42);
          box-shadow: 0 18px 42px rgba(0,0,0,.28);
        }

        html[data-theme="dark"] .resource-content h3,
        html.dark .resource-content h3,
        body.dark .resource-content h3 {
          color: #edf5f1;
        }

        html[data-theme="dark"] .resource-content p,
        html.dark .resource-content p,
        body.dark .resource-content p {
          color: #9eaca5;
        }

        html[data-theme="dark"] .resource-footer,
        html.dark .resource-footer,
        body.dark .resource-footer {
          border-color: #293730;
        }

        html[data-theme="dark"] .resource-number,
        html.dark .resource-number,
        body.dark .resource-number {
          color: #68766f;
        }

        @media (max-width: 950px) {
          .resources-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 620px) {
          .popular-resources {
            padding: 58px 0 62px;
          }

          .popular-resources-inner {
            width: min(100% - 28px, 520px);
          }

          .resources-header {
            align-items: flex-start;
            flex-direction: column;
            gap: 18px;
            margin-bottom: 24px;
          }

          .resources-header h2 {
            font-size: 31px;
          }

          .resources-grid {
            grid-template-columns: 1fr;
            gap: 11px;
          }

          .resource-card {
            min-height: 225px;
            padding: 17px;
          }

          .resource-content h3 {
            font-size: 17px;
          }

          .resource-content p {
            max-width: none;
            font-size: 14px;
          }
        }
      `}</style>
    </section>
  );
}