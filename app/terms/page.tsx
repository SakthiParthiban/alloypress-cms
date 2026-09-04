import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms and Conditions | AlloyPress",
  description:
    "Read the Terms and Conditions governing use of AlloyPress, editorial coverage, sponsored content, payments, affiliate relationships, intellectual property, privacy, and website use.",
  alternates: {
    canonical: "/terms",
  },
};

type TermsSection = {
  number: string;
  title: string;
  paragraphs: string[];
  bullets?: string[];
};

const termsSections: TermsSection[] = [
  {
    number: "01",
    title: "Use of Website",
    paragraphs: [
      "These Terms and Conditions govern your use of the AlloyPress website and its content, services, and features.",
      "By accessing or using AlloyPress, you agree to use the website responsibly and in accordance with these terms.",
      "You must not use the website in a way that is unlawful, abusive, misleading, or intended to interfere with the normal operation of the service.",
    ],
    bullets: [
      "Use the website only for lawful purposes.",
      "Do not attempt to gain unauthorized access to website systems or data.",
      "Do not copy, scrape, reproduce, or redistribute substantial website content without permission.",
    ],
  },
  {
    number: "02",
    title: "Editorial Independence",
    paragraphs: [
      "AlloyPress maintains editorial independence across its reviews, comparisons, alternatives, news, guides, and educational coverage.",
      "Our editorial decisions are based on usefulness, testing, research, relevance, and the needs of our readers.",
      "A commercial relationship does not guarantee a positive review, rating, ranking, inclusion, or recommendation.",
    ],
    bullets: [
      "Editorial conclusions are not guaranteed by payment.",
      "Sponsored relationships do not automatically determine editorial outcomes.",
      "Reviews and recommendations may include both strengths and limitations.",
    ],
  },
  {
    number: "03",
    title: "Sponsored Content, Paid Placements & Services",
    paragraphs: [
      "AlloyPress may offer sponsored content, paid placements, advertising opportunities, article inclusion, reviews, or related services.",
      "Commercial services are separate from editorial judgment. Payment for a service does not mean that AlloyPress will publish a guaranteed positive result.",
      "Where applicable, sponsored or commercial relationships may be identified clearly so readers can understand the nature of the relationship.",
    ],
    bullets: [
      "Paid placements are subject to editorial and website requirements.",
      "We may decline products, services, or requests that do not fit our coverage.",
      "Commercial arrangements do not require us to make unsupported claims.",
    ],
  },
  {
    number: "04",
    title: "Content, Updates & Modifications",
    paragraphs: [
      "AlloyPress publishes information about AI tools, software, products, services, companies, and related topics.",
      "Information can change over time. Product features, pricing, availability, policies, and performance may change after an article is published.",
      "We may update, revise, replace, or remove content when information changes or when editorial improvements are appropriate.",
    ],
    bullets: [
      "Content may be corrected or updated.",
      "Older articles may not reflect current product features or pricing.",
      "AlloyPress may change website features, layouts, or services without prior notice.",
    ],
  },
  {
    number: "05",
    title: "Payments & Refunds",
    paragraphs: [
      "Where AlloyPress provides paid services, applicable pricing and payment terms will be communicated for the relevant service.",
      "Payment covers the agreed service or editorial work. It does not purchase a particular opinion, rating, ranking, or editorial conclusion.",
      "Any refund or cancellation terms applicable to a particular service will be communicated with that service.",
    ],
    bullets: [
      "Payments do not guarantee positive editorial coverage.",
      "Payments do not guarantee publication where editorial requirements are not met.",
      "Service-specific refund terms may apply.",
    ],
  },
  {
    number: "06",
    title: "Affiliate Disclosure",
    paragraphs: [
      "Some AlloyPress pages may contain affiliate links. When a reader purchases a product or service through a qualifying affiliate link, AlloyPress may receive a commission.",
      "Affiliate relationships help support the publication and do not necessarily increase the price paid by the reader.",
      "Affiliate relationships do not determine our editorial opinions or recommendations.",
    ],
    bullets: [
      "Affiliate links may be used on reviews, lists, comparisons, or resource pages.",
      "The presence of an affiliate relationship does not guarantee a positive recommendation.",
      "Readers should review the provider's own terms before purchasing.",
    ],
  },
  {
    number: "07",
    title: "Intellectual Property",
    paragraphs: [
      "AlloyPress branding, original articles, written material, design elements, graphics, and other original website materials are protected by applicable intellectual-property laws.",
      "You may view and use the website for personal and legitimate informational purposes.",
      "You may not reproduce, republish, sell, distribute, or commercially exploit substantial portions of AlloyPress content without appropriate permission, except where permitted by law.",
    ],
    bullets: [
      "AlloyPress name and branding.",
      "Original editorial content and written material.",
      "Original graphics, layouts, and website assets.",
    ],
  },
  {
    number: "08",
    title: "User Conduct",
    paragraphs: [
      "You agree not to misuse AlloyPress or use the website in a way that could harm the website, its users, its systems, or its reputation.",
      "You are responsible for information and material you submit to AlloyPress.",
    ],
    bullets: [
      "Do not submit unlawful, fraudulent, abusive, or misleading material.",
      "Do not interfere with website security or functionality.",
      "Do not attempt to impersonate another person or organization.",
      "Do not use automated methods to abuse or overload the website.",
    ],
  },
  {
    number: "09",
    title: "Third-Party Websites & Services",
    paragraphs: [
      "AlloyPress may contain links to third-party websites, products, tools, platforms, advertisers, affiliate services, or other external resources.",
      "We do not control third-party websites and are not responsible for their content, availability, security, privacy practices, or business practices.",
      "Your use of a third-party website or service is subject to that provider's own terms and policies.",
    ],
    bullets: [
      "Third-party availability may change without notice.",
      "Third-party pricing and features may change.",
      "Review the relevant provider's terms and privacy policy before using its service.",
    ],
  },
  {
    number: "10",
    title: "Disclaimer of Warranties",
    paragraphs: [
      "AlloyPress content is provided for general informational and editorial purposes.",
      "Although we aim to publish useful and accurate information, we do not guarantee that every article, recommendation, product detail, price, feature, or claim will always be complete, current, uninterrupted, or error-free.",
      "AI products and services can change rapidly, and readers should verify important information directly with the relevant provider.",
    ],
    bullets: [
      "No guarantee of uninterrupted website availability.",
      "No guarantee that third-party product information will remain unchanged.",
      "No guarantee that a product will meet a particular user's individual requirements.",
    ],
  },
  {
    number: "11",
    title: "Limitation of Liability",
    paragraphs: [
      "To the extent permitted by applicable law, AlloyPress will not be responsible for indirect, incidental, special, consequential, or similar losses arising from use of the website or reliance on its content.",
      "Nothing in these terms is intended to exclude or limit liability that cannot legally be excluded or limited.",
      "Users are responsible for evaluating whether a product, service, or recommendation is suitable for their own circumstances.",
    ],
  },
  {
    number: "12",
    title: "Privacy",
    paragraphs: [
      "Your use of AlloyPress is also subject to our Privacy Policy.",
      "The Privacy Policy explains how information may be collected, used, retained, protected, and shared through the website and related services.",
    ],
    bullets: [
      "Review our Privacy Policy for information about data practices.",
      "You may also review our Do Not Sell My Personal Information page for applicable privacy choices.",
    ],
  },
  {
    number: "13",
    title: "Changes to These Terms",
    paragraphs: [
      "AlloyPress may update these Terms and Conditions from time to time to reflect changes to the website, services, business practices, or applicable requirements.",
      "When changes are made, the updated version will be posted on this page.",
      "Your continued use of the website after updated terms are posted indicates your acceptance of the revised terms to the extent permitted by law.",
    ],
  },
  {
    number: "14",
    title: "Governing Law",
    paragraphs: [
      "These Terms and Conditions are subject to applicable laws and legal requirements relevant to AlloyPress and its operations.",
      "Any dispute will be handled in accordance with applicable law and the appropriate jurisdiction.",
    ],
  },
  {
    number: "15",
    title: "Contact Information",
    paragraphs: [
      "If you have questions about these Terms and Conditions, our editorial policies, commercial services, or use of the AlloyPress website, please contact us.",
    ],
  },
];

export default function TermsPage() {
  return (
    <main className="terms-page">
      <style dangerouslySetInnerHTML={{ __html: styles }} />

      <section className="terms-hero">
        <div className="terms-hero-grid" aria-hidden="true" />
        <div className="terms-hero-glow" aria-hidden="true" />

        <div className="terms-container terms-hero-inner">
          <div className="terms-kicker">
            <span />
            LEGAL · ALLOYPRESS
          </div>

          <h1>
            Terms &amp;
            <br />
            <em>Conditions.</em>
          </h1>

          <p>
            The rules that apply when you use AlloyPress, read our coverage,
            or work with us.
          </p>

          <div className="terms-hero-meta">
            <span>DOCUMENT · TERMS-01</span>
            <span>LAST UPDATED · 2026</span>
          </div>
        </div>
      </section>

      <section className="terms-content">
        <div className="terms-container">
          <div className="terms-layout">
            <aside className="terms-sidebar" aria-label="Legal navigation">
              <div className="sidebar-label">LEGAL DOCUMENTS</div>

              <a className="active" href="#terms">
                <span>01</span>
                Terms &amp; Conditions
              </a>

              <a href="/privacy-policy">
                <span>02</span>
                Privacy Policy
              </a>

              <a href="/do-not-sell">
                <span>03</span>
                Do Not Sell My Info
              </a>

              <div className="sidebar-note">
                <span className="note-dot" />
                Questions?
                <a href="mailto:contact@alloypress.com">
                  Contact AlloyPress ↗
                </a>
              </div>
            </aside>

            <article id="terms" className="terms-document">
              <header className="document-intro">
                <div>
                  <span className="document-label">TERMS AND CONDITIONS</span>
                  <h2>Terms that keep the publication straightforward.</h2>
                </div>
                <span className="document-date">MAY · 2026</span>
              </header>

              <div className="document-body">
                {termsSections.map((section) => (
                  <section className="term-section" key={section.number}>
                    <div className="term-index">{section.number}</div>

                    <div className="term-copy">
                      <h3>{section.title}</h3>

                      {section.paragraphs.map((paragraph) => (
                        <p key={paragraph}>{paragraph}</p>
                      ))}

                      {section.bullets && section.bullets.length > 0 && (
                        <ul>
                          {section.bullets.map((bullet) => (
                            <li key={bullet}>
                              <span>+</span>
                              {bullet}
                            </li>
                          ))}
                        </ul>
                      )}

                      {section.title === "Contact Information" && (
                        <a
                          className="terms-contact-link"
                          href="mailto:contact@alloypress.com"
                        >
                          contact@alloypress.com ↗
                        </a>
                      )}
                    </div>
                  </section>
                ))}
              </div>

              <footer className="document-footer">
                <span>END OF DOCUMENT</span>
                <span>ALLOYPRESS · TERMS-01</span>
              </footer>
            </article>
          </div>
        </div>
      </section>
    </main>
  );
}

const styles = `
.terms-page{
  --terms-green:#18c978;
  --terms-green-dark:#0da45e;
  --terms-ink:#091118;
  --terms-text:#33424a;
  --terms-muted:#68777f;
  --terms-line:rgba(9,17,24,.10);
  --terms-paper:#ffffff;
  --terms-bg:#f3f6f5;
  background:var(--terms-bg);
  color:var(--terms-ink);
}

.terms-page *{box-sizing:border-box}

.terms-container{
  width:min(1160px,calc(100% - 48px));
  margin:0 auto;
}

/* HERO */
.terms-hero{
  position:relative;
  overflow:hidden;
  min-height:410px;
  display:flex;
  align-items:center;
  background:#091016;
  color:#f4f8f6;
  isolation:isolate;
}

.terms-hero-grid{
  position:absolute;
  inset:0;
  opacity:.75;
  background-image:
    linear-gradient(rgba(255,255,255,.045) 1px,transparent 1px),
    linear-gradient(90deg,rgba(255,255,255,.045) 1px,transparent 1px);
  background-size:56px 56px;
  mask-image:linear-gradient(to bottom,rgba(0,0,0,.9),transparent);
}

.terms-hero-grid::after{
  content:"";
  position:absolute;
  inset:0;
  background-image:
    radial-gradient(circle at 15% 28%,rgba(24,201,120,.65) 0 1px,transparent 1.5px),
    radial-gradient(circle at 82% 68%,rgba(24,201,120,.5) 0 1px,transparent 1.5px);
  background-size:88px 88px,124px 124px;
  opacity:.55;
}

.terms-hero-glow{
  position:absolute;
  width:620px;
  height:360px;
  right:-180px;
  top:-130px;
  background:radial-gradient(circle,rgba(24,201,120,.17),transparent 68%);
  filter:blur(10px);
}

.terms-hero-inner{
  position:relative;
  z-index:2;
  padding:82px 0 76px;
}

.terms-kicker{
  display:flex;
  align-items:center;
  gap:9px;
  color:var(--terms-green);
  font:700 10px/1.2 "DM Mono",monospace;
  letter-spacing:.12em;
}

.terms-kicker span{
  width:6px;
  height:6px;
  flex:0 0 6px;
  border-radius:50%;
  background:var(--terms-green);
  box-shadow:0 0 0 5px rgba(24,201,120,.08);
}

.terms-hero h1{
  max-width:800px;
  margin:18px 0 16px;
  color:#f6faf8;
  font:700 clamp(48px,7vw,78px)/.99 "Sora",sans-serif;
  letter-spacing:-.065em;
}

.terms-hero h1 em{
  color:var(--terms-green);
  font-style:normal;
}

.terms-hero p{
  max-width:690px;
  margin:0;
  color:rgba(246,250,248,.68);
  font:400 17px/1.75 "Lora",serif;
}

.terms-hero-meta{
  display:flex;
  flex-wrap:wrap;
  gap:24px;
  margin-top:28px;
  color:rgba(246,250,248,.38);
  font:600 9px/1.3 "DM Mono",monospace;
  letter-spacing:.08em;
}

/* CONTENT */
.terms-content{
  padding:72px 0 100px;
  background:
    linear-gradient(rgba(255,255,255,.6),rgba(255,255,255,.6)),
    radial-gradient(circle at 90% 5%,rgba(24,201,120,.08),transparent 26%);
}

.terms-layout{
  display:grid;
  grid-template-columns:210px minmax(0,1fr);
  gap:36px;
  align-items:start;
}

.terms-sidebar{
  position:sticky;
  top:96px;
  padding:20px 18px;
  border:1px solid var(--terms-line);
  border-radius:10px;
  background:rgba(255,255,255,.72);
  backdrop-filter:blur(12px);
}

.sidebar-label{
  margin-bottom:14px;
  color:#8a969b;
  font:700 9px/1.3 "DM Mono",monospace;
  letter-spacing:.08em;
}

.terms-sidebar>a{
  display:grid;
  grid-template-columns:27px 1fr;
  gap:8px;
  align-items:center;
  padding:9px 0;
  color:#617078;
  text-decoration:none;
  font:600 11px/1.45 "Sora",sans-serif;
  transition:color .2s ease;
}

.terms-sidebar>a span{
  color:#99a4a8;
  font:700 9px/1 "DM Mono",monospace;
}

.terms-sidebar>a:hover,
.terms-sidebar>a.active{
  color:var(--terms-green-dark);
}

.terms-sidebar>a.active span{
  color:var(--terms-green);
}

.sidebar-note{
  margin-top:20px;
  padding-top:18px;
  border-top:1px solid var(--terms-line);
  color:#7a878d;
  font:600 10px/1.55 "DM Mono",monospace;
}

.note-dot{
  display:inline-block;
  width:6px;
  height:6px;
  margin-right:7px;
  border-radius:50%;
  background:var(--terms-green);
}

.sidebar-note a{
  display:block;
  margin-top:7px;
  color:var(--terms-green-dark);
  text-decoration:none;
  font-weight:700;
}

/* DOCUMENT */
.terms-document{
  overflow:hidden;
  border:1px solid rgba(9,17,24,.11);
  border-radius:12px;
  background:var(--terms-paper);
  box-shadow:0 18px 55px rgba(9,17,24,.055);
}

.document-intro{
  display:flex;
  align-items:flex-end;
  justify-content:space-between;
  gap:30px;
  padding:34px 38px 31px;
  border-bottom:1px solid var(--terms-line);
  background:
    linear-gradient(135deg,rgba(24,201,120,.045),transparent 40%),
    #fff;
}

.document-label{
  color:var(--terms-green-dark);
  font:700 9px/1.3 "DM Mono",monospace;
  letter-spacing:.1em;
}

.document-intro h2{
  max-width:720px;
  margin:10px 0 0;
  color:#0b151c;
  font:700 clamp(24px,3vw,32px)/1.2 "Sora",sans-serif;
  letter-spacing:-.035em;
}

.document-date{
  flex:0 0 auto;
  color:#8c989c;
  font:600 9px/1.3 "DM Mono",monospace;
}

.term-section{
  display:grid;
  grid-template-columns:58px minmax(0,1fr);
  gap:20px;
  padding:34px 38px;
  border-bottom:1px solid var(--terms-line);
}

.term-section:last-child{
  border-bottom:0;
}

.term-index{
  display:flex;
  align-items:flex-start;
  justify-content:flex-start;
  padding-top:4px;
  color:var(--terms-green-dark);
  font:700 10px/1.2 "DM Mono",monospace;
}

.term-copy h3{
  margin:0 0 13px;
  color:#0a151c;
  font:700 20px/1.35 "Sora",sans-serif;
  letter-spacing:-.025em;
}

.term-copy p{
  max-width:820px;
  margin:0 0 12px;
  color:var(--terms-text);
  font:400 15.5px/1.82 "Lora",serif;
}

.term-copy p:last-of-type{
  margin-bottom:0;
}

.term-copy ul{
  display:grid;
  gap:8px;
  max-width:820px;
  margin:18px 0 0;
  padding:0;
  list-style:none;
}

.term-copy li{
  position:relative;
  padding:11px 13px 11px 35px;
  border:1px solid rgba(24,201,120,.13);
  border-radius:7px;
  background:rgba(24,201,120,.035);
  color:#4d5d64;
  font:600 11.5px/1.55 "Sora",sans-serif;
}

.term-copy li>span{
  position:absolute;
  left:13px;
  top:12px;
  color:var(--terms-green-dark);
  font:700 12px/1 "DM Mono",monospace;
}

.terms-contact-link{
  display:inline-flex;
  margin-top:17px;
  color:var(--terms-green-dark);
  text-decoration:none;
  font:700 12px/1.5 "DM Mono",monospace;
}

.terms-contact-link:hover{
  text-decoration:underline;
}

.document-footer{
  display:flex;
  justify-content:space-between;
  gap:20px;
  padding:16px 38px;
  border-top:1px solid var(--terms-line);
  background:#f8faf9;
  color:#8d999d;
  font:600 8px/1.3 "DM Mono",monospace;
  letter-spacing:.08em;
}

/* DARK THEME */
html[data-theme="dark"] .terms-page,
html.dark .terms-page,
body.dark .terms-page{
  --terms-bg:#0d141a;
  --terms-paper:#111a21;
  --terms-ink:#f2f7f4;
  --terms-text:#aebbb6;
  --terms-muted:#899791;
  --terms-line:rgba(255,255,255,.085);
  background:var(--terms-bg);
  color:var(--terms-ink);
}

html[data-theme="dark"] .terms-content,
html.dark .terms-content,
body.dark .terms-content{
  background:
    radial-gradient(circle at 90% 5%,rgba(24,201,120,.07),transparent 26%),
    #0d141a;
}

html[data-theme="dark"] .terms-sidebar,
html.dark .terms-sidebar,
body.dark .terms-sidebar{
  background:rgba(17,26,33,.82);
  border-color:var(--terms-line);
}

html[data-theme="dark"] .terms-sidebar>a,
html.dark .terms-sidebar>a,
body.dark .terms-sidebar>a{
  color:#9eaca6;
}

html[data-theme="dark"] .terms-sidebar>a:hover,
html.dark .terms-sidebar>a:hover,
body.dark .terms-sidebar>a:hover,
html[data-theme="dark"] .terms-sidebar>a.active,
html.dark .terms-sidebar>a.active,
body.dark .terms-sidebar>a.active{
  color:var(--terms-green);
}

html[data-theme="dark"] .terms-document,
html.dark .terms-document,
body.dark .terms-document{
  background:var(--terms-paper);
  border-color:var(--terms-line);
  box-shadow:0 18px 55px rgba(0,0,0,.18);
}

html[data-theme="dark"] .document-intro,
html.dark .document-intro,
body.dark .document-intro{
  background:
    linear-gradient(135deg,rgba(24,201,120,.055),transparent 42%),
    #111a21;
  border-color:var(--terms-line);
}

html[data-theme="dark"] .document-intro h2,
html.dark .document-intro h2,
body.dark .document-intro h2{
  color:#f2f7f4;
}

html[data-theme="dark"] .term-section,
html.dark .term-section,
body.dark .term-section{
  border-color:var(--terms-line);
}

html[data-theme="dark"] .term-copy h3,
html.dark .term-copy h3,
body.dark .term-copy h3{
  color:#f2f7f4;
}

html[data-theme="dark"] .term-copy p,
html.dark .term-copy p,
body.dark .term-copy p{
  color:#aebbb6;
}

html[data-theme="dark"] .term-copy li,
html.dark .term-copy li,
body.dark .term-copy li{
  color:#b4c0bb;
  background:rgba(24,201,120,.045);
  border-color:rgba(24,201,120,.14);
}

html[data-theme="dark"] .document-footer,
html.dark .document-footer,
body.dark .document-footer{
  background:#0d151b;
  border-color:var(--terms-line);
}

/* TABLET */
@media(max-width:900px){
  .terms-container{
    width:min(100% - 32px,720px);
  }

  .terms-hero{
    min-height:360px;
  }

  .terms-hero-inner{
    padding:68px 0 62px;
  }

  .terms-layout{
    display:block;
  }

  .terms-sidebar{
    position:static;
    display:flex;
    align-items:center;
    gap:18px;
    overflow-x:auto;
    margin-bottom:20px;
    padding:13px 15px;
    white-space:nowrap;
  }

  .sidebar-label{
    flex:0 0 auto;
    margin:0;
  }

  .terms-sidebar>a{
    display:flex;
    gap:7px;
    flex:0 0 auto;
    padding:0;
  }

  .sidebar-note{
    display:none;
  }
}

/* MOBILE */
@media(max-width:620px){
  .terms-container{
    width:calc(100% - 24px);
  }

  .terms-hero{
    min-height:0;
  }

  .terms-hero-inner{
    padding:58px 0 52px;
  }

  .terms-hero h1{
    margin-top:15px;
    font-size:clamp(42px,14vw,58px);
  }

  .terms-hero p{
    font-size:15px;
    line-height:1.7;
  }

  .terms-hero-meta{
    gap:10px 18px;
    margin-top:22px;
  }

  .terms-content{
    padding:36px 0 60px;
  }

  .terms-sidebar{
    gap:15px;
    margin-bottom:14px;
  }

  .terms-document{
    border-radius:9px;
  }

  .document-intro{
    display:block;
    padding:25px 19px 23px;
  }

  .document-intro h2{
    font-size:23px;
  }

  .document-date{
    display:block;
    margin-top:14px;
  }

  .term-section{
    grid-template-columns:31px minmax(0,1fr);
    gap:10px;
    padding:25px 19px;
  }

  .term-index{
    font-size:9px;
  }

  .term-copy h3{
    margin-bottom:11px;
    font-size:18px;
  }

  .term-copy p{
    font-size:14px;
    line-height:1.78;
  }

  .term-copy li{
    font-size:11px;
    line-height:1.55;
  }

  .document-footer{
    padding:14px 19px;
    font-size:7px;
  }
}

@media(prefers-reduced-motion:reduce){
  .terms-page *{
    scroll-behavior:auto!important;
    transition:none!important;
  }
}
`;
