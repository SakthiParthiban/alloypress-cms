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


      <style>{`

        /* =========================================================
           NEWSLETTER
        ========================================================= */

        .newsletter-section {
          position: relative;
          overflow: hidden;

          padding: 64px 0 68px;

          background: #0b1013;

           border: none;
        }


        /* subtle editorial grid */

        .newsletter-section::before {
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

          background-size: 52px 52px;

          mask-image:
            linear-gradient(
              90deg,
              black,
              transparent 90%
            );
        }


        /* green ambient glow */

        .newsletter-section::after {
          content: "";

          position: absolute;

          width: 500px;
          height: 300px;

          right: 2%;
          top: 50%;

          transform: translateY(-50%);

          background:
            radial-gradient(
              ellipse,
              rgba(24,185,104,.075),
              transparent 68%
            );

          pointer-events: none;
        }


        .newsletter-inner {
          position: relative;
          z-index: 1;

          width: min(
            1060px,
            calc(100% - 48px)
          );

          margin: 0 auto;

          display: grid;

          grid-template-columns:
            minmax(0, 1.05fr)
            minmax(390px, .95fr);

          align-items: center;

          gap: 70px;
        }


        /* =========================================================
           LEFT
        ========================================================= */

        .newsletter-content {
          position: relative;
        }


        .newsletter-eyebrow {
          display: flex;
          align-items: center;
          gap: 9px;

          margin-bottom: 14px;

          color: #18c978;

          font:
            800 10px/1
            "DM Mono",
            monospace;

          letter-spacing: .15em;
        }


        .newsletter-eyebrow span {
          width: 22px;
          height: 2px;

          background: #18c978;
        }


        .newsletter-content h2 {
          margin: 0;

          color: #f1f6f3;

          font:
            800 clamp(31px, 3.5vw, 45px)/1.1
            "Sora",
            sans-serif;

          letter-spacing: -.045em;
        }


        .newsletter-content h2 span {
          color: #18c978;
        }


        .newsletter-content p {
          max-width: 560px;

          margin: 18px 0 0;

          color: #8e9c96;

          font:
            400 14px/1.75
            "Lora",
            serif;
        }


        .newsletter-meta {
          display: flex;
          align-items: center;
          gap: 8px;

          margin-top: 17px;

          color: #68766f;

          font:
            700 8px/1
            "DM Mono",
            monospace;

          letter-spacing: .08em;
        }


        .meta-dot {
          width: 5px;
          height: 5px;

          border-radius: 50%;

          background: #18c978;

          box-shadow:
            0 0 0 4px
            rgba(24,201,120,.08);
        }


        .meta-separator {
          color: #3c4943;
        }


        /* =========================================================
           RIGHT FORM
        ========================================================= */

        .newsletter-form-wrap {
          position: relative;
        }


        .newsletter-form {
          display: grid;

          grid-template-columns: minmax(0, 1fr) auto;

          gap: 8px;

          padding: 5px;

          border: 1px solid #293630;
          border-radius: 9px;

          background: #111916;

          box-shadow:
            0 12px 40px rgba(0,0,0,.18);
        }


        .newsletter-form input {
          width: 100%;

          min-width: 0;
          height: 46px;

          padding: 0 14px;

          border: 0;
          outline: 0;

          background: transparent;

          color: #edf5f1;

          font:
            500 13px/1
            "Sora",
            sans-serif;
        }


        .newsletter-form input::placeholder {
          color: #64736b;
        }


        .newsletter-form input:focus {
          color: #fff;
        }


        .newsletter-form button {
          height: 46px;

          display: inline-flex;
          align-items: center;
          justify-content: center;

          gap: 9px;

          padding: 0 18px;

          border: 0;
          border-radius: 7px;

          background: #18b968;
          color: #fff;

          cursor: pointer;

          font:
            700 11px/1
            "Sora",
            sans-serif;

          white-space: nowrap;

          transition:
            background .2s ease,
            transform .2s ease,
            box-shadow .2s ease;
        }


        .newsletter-form button:hover {
          background: #119d59;

          transform: translateY(-1px);

          box-shadow:
            0 7px 18px
            rgba(24,185,104,.18);
        }


        .newsletter-form button span {
          font-size: 14px;
        }


        .newsletter-note {
          margin: 11px 5px 0;

          color: #627069;

          font:
            400 10px/1.5
            "Lora",
            serif;
        }


        .newsletter-trust {
          display: flex;
          align-items: center;
          gap: 8px;

          margin: 19px 5px 0;

          color: #4f5d56;

          font:
            700 7px/1
            "DM Mono",
            monospace;

          letter-spacing: .1em;
        }


        .newsletter-trust i {
          width: 3px;
          height: 3px;

          border-radius: 50%;

          background: #18b968;
          opacity: .7;
        }


        /* =========================================================
           ACCESSIBILITY
        ========================================================= */

        .sr-only {
          position: absolute;

          width: 1px;
          height: 1px;

          padding: 0;
          margin: -1px;

          overflow: hidden;

          clip: rect(0, 0, 0, 0);

          white-space: nowrap;

          border: 0;
        }


        /* =========================================================
           LIGHT THEME
        ========================================================= */

        html[data-theme="light"] .newsletter-section {
          background:
            linear-gradient(
              135deg,
              #f0f6f3,
              #f7faf8
            );

          border-color: none;
        }


        html[data-theme="light"] .newsletter-content h2 {
          color: #14202b;
        }


        html[data-theme="light"] .newsletter-content p {
          color: #61716a;
        }


        html[data-theme="light"] .newsletter-meta {
          color: #78867f;
        }


        html[data-theme="light"] .newsletter-form {
          background: #fff;
          border-color: #cdd9d4;

          box-shadow:
            0 12px 35px
            rgba(20,40,30,.06);
        }


        html[data-theme="light"] .newsletter-form input {
          color: #17221d;
        }


        html[data-theme="light"] .newsletter-form input::placeholder {
          color: #87948e;
        }


        html[data-theme="light"] .newsletter-note {
          color: #718078;
        }


        html[data-theme="light"] .newsletter-trust {
          color: #7d8984;
        }


        /* =========================================================
           MOBILE
        ========================================================= */

        @media (max-width: 850px) {

          .newsletter-inner {
            grid-template-columns: 1fr;

            gap: 30px;
          }

          .newsletter-form-wrap {
            max-width: 620px;
          }
        }


        @media (max-width: 620px) {

          .newsletter-section {
            padding: 52px 0 55px;
          }


          .newsletter-inner {
            width:
              min(
                100% - 28px,
                560px
              );

            gap: 25px;
          }


          .newsletter-content h2 {
            font-size: 31px;
          }


          .newsletter-content p {
            font-size: 14px;
          }


          .newsletter-form {
            grid-template-columns: 1fr;

            padding: 5px;
          }


          .newsletter-form input {
            height: 44px;
          }


          .newsletter-form button {
            width: 100%;
            height: 44px;
          }


          .newsletter-note {
            font-size: 10px;
          }

        }

      `}</style>
    </section>
  );
}