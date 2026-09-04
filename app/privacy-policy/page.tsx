import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | AlloyPress",
  description:
    "Learn how AlloyPress collects, uses, protects, and retains information, including cookies, analytics, affiliate links, advertising, GDPR and CCPA privacy rights.",
  alternates: {
    canonical: "/privacy-policy",
  },
};

type PrivacySection = {
  number: string;
  title: string;
  paragraphs: string[];
  bullets?: string[];
  footerParagraphs?: string[];
  extraBullets?: string[];
  endingParagraphs?: string[];
};

const privacySections: PrivacySection[] = [
  {
    number: "01",
    title: "Information We Collect",
    paragraphs: [
      "We may collect personal or non-personal information from visitors when they use, interact with, or contact AlloyPress.",
      "The information we may collect includes:",
    ],
    bullets: [
      "Your name",
      "Email address",
      "Contact information",
      "IP address",
      "Browser type",
      "Device information",
      "Pages viewed",
      "Referral information",
      "Communication details",
    ],
  },
  {
    number: "02",
    title: "How We Use Your Information",
    paragraphs: [
      "We may use collected information for purposes such as:",
    ],
    bullets: [
      "Operating and maintaining the website",
      "Improving user experience",
      "Personalized content",
      "Website analytics and usage",
      "Affiliate-related services",
      "Improving website performance",
      "Responding to inquiries",
      "Personalized services",
      "Improving user experience and content",
    ],
  },
  {
    number: "03",
    title: "Cookies & Tracking Technologies",
    paragraphs: [
      "AlloyPress may use cookies and similar technologies to understand how visitors use the website and to improve the user experience.",
      "These technologies may include:",
    ],
    bullets: [
      "Improve website functionality",
      "Analyze visitor behavior",
      "Measure website and advertising performance",
      "Understand website usage",
      "Support affiliate tracking and analytics",
    ],
    footerParagraphs: [
      "Cookies are small data files stored on your browser or device.",
      "You may disable cookies through your browser settings. However, some parts of the website may not function properly if cookies are disabled.",
    ],
  },
  {
    number: "04",
    title: "Affiliate Links & Monetization",
    paragraphs: [
      "Some pages on AlloyPress may contain affiliate links.",
      "If you purchase products or services through affiliate links, we may earn a commission at no additional cost to you.",
      "Affiliate partners may collect certain information when you interact with their links, cookies, or tracking technologies.",
      "These affiliate relationships do not influence our editorial integrity or recommendations.",
    ],
  },
  {
    number: "05",
    title: "Advertising Partners & Third-Party Services",
    paragraphs: [
      "We may work with third-party partners, analytics providers, and advertising services.",
      "These third parties may use technologies such as:",
    ],
    bullets: [
      "Cookies",
      "Web beacons",
      "Pixels",
      "Other similar technologies",
    ],
    footerParagraphs: [
      "to collect information about user activity and interactions.",
      "We may also use third-party services such as:",
    ],
    extraBullets: [
      "Google Analytics",
      "Advertising networks",
      "Affiliate services",
      "Performance tracking tools",
    ],
    endingParagraphs: [
      "These services may collect information directly from your browser or device under their own privacy policies.",
      "We do not control the data practices of third-party services.",
    ],
  },
  {
    number: "06",
    title: "Log Files",
    paragraphs: [
      "Like many websites, AlloyPress may use log files.",
      "These files may include:",
    ],
    bullets: [
      "IP address",
      "Browser type",
      "Internet service provider (ISP)",
      "Date and time stamps",
      "Referring pages",
      "Click data",
    ],
    footerParagraphs: [
      "This information is used for:",
    ],
    extraBullets: [
      "Analyzing trends",
      "Administering the website",
      "Tracking user activity",
      "Improving website performance",
    ],
    endingParagraphs: [
      "The data is generally not used to personally identify individuals.",
    ],
  },
  {
    number: "07",
    title: "Data Retention",
    paragraphs: [
      "We retain collected information only for as long as necessary for the purposes for which it was collected, including:",
    ],
    bullets: [
      "Providing website functionality",
      "Maintaining records",
      "Complying with legal obligations",
      "Resolving disputes",
      "Enforcing applicable policies",
    ],
  },
  {
    number: "08",
    title: "GDPR Data Protection Rights",
    paragraphs: [
      "If you are located in the European Economic Area (EEA), you may have the following rights under applicable data protection laws:",
    ],
    bullets: [
      "Right to access your data",
      "Right to correct inaccurate information",
      "Right to request deletion of your data",
      "Right to restrict processing",
      "Right to object to processing",
      "Right to data portability",
    ],
    footerParagraphs: [
      "To exercise any of these rights, please contact us.",
      "We will respond to privacy-related requests as required by applicable law.",
    ],
  },
  {
    number: "09",
    title: "CCPA & Privacy Rights",
    paragraphs: [
      "Depending on your location, you may have rights regarding:",
    ],
    bullets: [
      "Access to collected data",
      "Deletion requests",
      "Opting out of certain data sharing activities",
    ],
    footerParagraphs: [
      "To make a privacy-related request, please contact us directly.",
    ],
  },
  {
    number: "10",
    title: "Children's Privacy",
    paragraphs: [
      "AlloyPress does not knowingly collect personally identifiable information from children without appropriate consent.",
      "If you believe a child has provided personal information without appropriate permission, please contact us so we can take appropriate action.",
    ],
  },
  {
    number: "11",
    title: "Third-Party Links",
    paragraphs: [
      "Our website may contain links to external websites, tools, or services.",
      "We are not responsible for:",
    ],
    bullets: [
      "The content of third-party websites",
      "Their privacy practices",
      "Their policies or operations",
    ],
    footerParagraphs: [
      "We encourage users to review the privacy policies of any third-party websites they visit.",
    ],
  },
  {
    number: "12",
    title: "Data Security",
    paragraphs: [
      "We implement reasonable technical and organizational measures to protect your information.",
      "However, no method of transmission over the Internet or electronic storage is completely secure, and we cannot guarantee absolute security.",
    ],
  },
  {
    number: "13",
    title: "Changes to This Privacy Policy",
    paragraphs: [
      "We may update this Privacy Policy from time to time.",
      "Any changes will be posted on this page with an updated effective date.",
      "Continued use of the website after changes are posted indicates acceptance of the updated policy.",
    ],
  },
  {
    number: "14",
    title: "Contact Us",
    paragraphs: [
      "If you have any questions about this Privacy Policy or your data, you may contact us.",
    ],
  },
];

export default function PrivacyPolicyPage() {
  return (
    <main className="privacy-page">
      <style dangerouslySetInnerHTML={{ __html: styles }} />

      <section className="privacy-hero">
        <div className="privacy-hero-grid" aria-hidden="true" />
        <div className="privacy-hero-glow" aria-hidden="true" />

        <div className="privacy-container privacy-hero-inner">
          <div className="privacy-kicker">
            <span />
            LEGAL · ALLOYPRESS
          </div>

          <h1>
            Our Privacy
            <br />
            <em>Policy.</em>
          </h1>

          <p>
            A clear explanation of what information we collect, why we use it,
            and the choices available to you.
          </p>

          <div className="privacy-hero-meta">
            <span>DOCUMENT · PRIVACY-01</span>
            <span>LAST UPDATED · MAY 14, 2026</span>
          </div>
        </div>
      </section>

      <section className="privacy-content">
        <div className="privacy-container">
          <div className="privacy-layout">
            <aside className="privacy-sidebar" aria-label="Privacy navigation">
              <div className="sidebar-label">LEGAL DOCUMENTS</div>

              <a className="active" href="#privacy">
                <span>01</span>
                Privacy Policy
              </a>

              <a href="/terms">
                <span>02</span>
                Terms &amp; Conditions
              </a>

              <a href="/do-not-sell">
                <span>03</span>
                Do Not Sell My Info
              </a>

              <div className="sidebar-note">
                <span className="note-dot" />
                Have questions?
                <a href="mailto:contact@alloypress.com">
                  Contact AlloyPress ↗
                </a>
              </div>
            </aside>

            <article id="privacy" className="privacy-document">
              <header className="document-intro">
                <div>
                  <span className="document-label">PRIVACY POLICY</span>
                  <h2>
                    Your privacy matters. Here is how AlloyPress handles
                    information.
                  </h2>
                </div>
                <span className="document-date">MAY 14 · 2026</span>
              </header>

              <div className="document-notice">
                <strong>Last Updated: May 14, 2026</strong>
                <p>
                  At AlloyPress, we respect your privacy and are committed to
                  protecting your personal information.
                </p>
              </div>

              <div className="document-body">
                {privacySections.map((section) => (
                  <section className="privacy-section" key={section.number}>
                    <div className="privacy-index">{section.number}</div>

                    <div className="privacy-copy">
                      <h3>{section.title}</h3>

                      {section.paragraphs.map((paragraph) => (
                        <p key={paragraph}>{paragraph}</p>
                      ))}

                      {section.bullets && (
                        <ul>
                          {section.bullets.map((bullet) => (
                            <li key={bullet}>
                              <span>•</span>
                              {bullet}
                            </li>
                          ))}
                        </ul>
                      )}

                      {"footerParagraphs" in section &&
                        section.footerParagraphs?.map((paragraph) => (
                          <p key={paragraph} className="secondary-paragraph">
                            {paragraph}
                          </p>
                        ))}

                      {"extraBullets" in section &&
                        section.extraBullets && (
                          <ul>
                            {section.extraBullets.map((bullet) => (
                              <li key={bullet}>
                                <span>•</span>
                                {bullet}
                              </li>
                            ))}
                          </ul>
                        )}

                      {"endingParagraphs" in section &&
                        section.endingParagraphs?.map((paragraph) => (
                          <p key={paragraph} className="secondary-paragraph">
                            {paragraph}
                          </p>
                        ))}

                      {section.number === "14" && (
                        <div className="contact-block">
                          <a href="mailto:contact@alloypress.com">
                            contact@alloypress.com ↗
                          </a>
                          <a
                            href="https://alloypress.com"
                            target="_blank"
                            rel="noreferrer"
                          >
                            https://alloypress.com ↗
                          </a>
                        </div>
                      )}
                    </div>
                  </section>
                ))}
              </div>

              <footer className="document-footer">
                <span>END OF DOCUMENT</span>
                <span>ALLOYPRESS · PRIVACY-01</span>
              </footer>
            </article>
          </div>
        </div>
      </section>
    </main>
  );
}

const styles = `
.privacy-page{
  --privacy-green:#18c978;
  --privacy-green-dark:#0da45e;
  --privacy-ink:#091118;
  --privacy-text:#33424a;
  --privacy-muted:#68777f;
  --privacy-line:rgba(9,17,24,.10);
  --privacy-paper:#ffffff;
  --privacy-bg:#f3f6f5;
  background:var(--privacy-bg);
  color:var(--privacy-ink);
}

.privacy-page *{box-sizing:border-box}

.privacy-container{
  width:min(1160px,calc(100% - 48px));
  margin:0 auto;
}

/* HERO */
.privacy-hero{
  position:relative;
  overflow:hidden;
  min-height:410px;
  display:flex;
  align-items:center;
  background:#091016;
  color:#f4f8f6;
  isolation:isolate;
}

.privacy-hero-grid{
  position:absolute;
  inset:0;
  background-image:
    linear-gradient(rgba(255,255,255,.045) 1px,transparent 1px),
    linear-gradient(90deg,rgba(255,255,255,.045) 1px,transparent 1px);
  background-size:56px 56px;
  opacity:.78;
  mask-image:linear-gradient(to bottom,rgba(0,0,0,.95),transparent);
}

.privacy-hero-grid::after{
  content:"";
  position:absolute;
  inset:0;
  background-image:
    radial-gradient(circle at 15% 28%,rgba(24,201,120,.65) 0 1px,transparent 1.5px),
    radial-gradient(circle at 82% 68%,rgba(24,201,120,.5) 0 1px,transparent 1.5px);
  background-size:88px 88px,124px 124px;
  opacity:.55;
}

.privacy-hero-glow{
  position:absolute;
  width:640px;
  height:380px;
  right:-190px;
  top:-135px;
  background:radial-gradient(circle,rgba(24,201,120,.18),transparent 68%);
  filter:blur(10px);
}

.privacy-hero-inner{
  position:relative;
  z-index:2;
  padding:82px 0 76px;
}

.privacy-kicker{
  display:flex;
  align-items:center;
  gap:9px;
  color:var(--privacy-green);
  font:700 10px/1.2 "DM Mono",monospace;
  letter-spacing:.12em;
}

.privacy-kicker span{
  width:6px;
  height:6px;
  flex:0 0 6px;
  border-radius:50%;
  background:var(--privacy-green);
  box-shadow:0 0 0 5px rgba(24,201,120,.08);
}

.privacy-hero h1{
  max-width:800px;
  margin:18px 0 16px;
  color:#f6faf8;
  font:700 clamp(48px,7vw,78px)/.99 "Sora",sans-serif;
  letter-spacing:-.065em;
}

.privacy-hero h1 em{
  color:var(--privacy-green);
  font-style:normal;
}

.privacy-hero p{
  max-width:690px;
  margin:0;
  color:rgba(246,250,248,.72);
  font:400 17px/1.75 "Lora",serif;
}

.privacy-hero-meta{
  display:flex;
  flex-wrap:wrap;
  gap:24px;
  margin-top:28px;
  color:rgba(246,250,248,.42);
  font:600 9px/1.3 "DM Mono",monospace;
  letter-spacing:.08em;
}

/* CONTENT */
.privacy-content{
  padding:72px 0 100px;
  background:
    radial-gradient(circle at 90% 5%,rgba(24,201,120,.08),transparent 26%),
    #f3f6f5;
}

.privacy-layout{
  display:grid;
  grid-template-columns:210px minmax(0,1fr);
  gap:36px;
  align-items:start;
}

.privacy-sidebar{
  position:sticky;
  top:96px;
  padding:20px 18px;
  border:1px solid var(--privacy-line);
  border-radius:10px;
  background:rgba(255,255,255,.78);
  backdrop-filter:blur(12px);
}

.sidebar-label{
  margin-bottom:14px;
  color:#8a969b;
  font:700 9px/1.3 "DM Mono",monospace;
  letter-spacing:.08em;
}

.privacy-sidebar>a{
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

.privacy-sidebar>a span{
  color:#99a4a8;
  font:700 9px/1 "DM Mono",monospace;
}

.privacy-sidebar>a:hover,
.privacy-sidebar>a.active{
  color:var(--privacy-green-dark);
}

.privacy-sidebar>a.active span{
  color:var(--privacy-green);
}

.sidebar-note{
  margin-top:20px;
  padding-top:18px;
  border-top:1px solid var(--privacy-line);
  color:#7a878d;
  font:600 10px/1.55 "DM Mono",monospace;
}

.note-dot{
  display:inline-block;
  width:6px;
  height:6px;
  margin-right:7px;
  border-radius:50%;
  background:var(--privacy-green);
}

.sidebar-note a{
  display:block;
  margin-top:7px;
  color:var(--privacy-green-dark);
  text-decoration:none;
  font-weight:700;
}

/* DOCUMENT */
.privacy-document{
  overflow:hidden;
  border:1px solid rgba(9,17,24,.11);
  border-radius:12px;
  background:var(--privacy-paper);
  box-shadow:0 18px 55px rgba(9,17,24,.055);
}

.document-intro{
  display:flex;
  align-items:flex-end;
  justify-content:space-between;
  gap:30px;
  padding:34px 38px 31px;
  border-bottom:1px solid var(--privacy-line);
  background:
    linear-gradient(135deg,rgba(24,201,120,.045),transparent 40%),
    #fff;
}

.document-label{
  color:var(--privacy-green-dark);
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

.document-notice{
  padding:20px 38px;
  border-bottom:1px solid var(--privacy-line);
  background:rgba(24,201,120,.035);
}

.document-notice strong{
  display:block;
  margin-bottom:7px;
  color:#18262d;
  font:700 12px/1.5 "Sora",sans-serif;
}

.document-notice p{
  max-width:820px;
  margin:0;
  color:#53636a;
  font:400 14px/1.75 "Lora",serif;
}

.privacy-section{
  display:grid;
  grid-template-columns:58px minmax(0,1fr);
  gap:20px;
  padding:34px 38px;
  border-bottom:1px solid var(--privacy-line);
}

.privacy-section:last-child{
  border-bottom:0;
}

.privacy-index{
  padding-top:4px;
  color:var(--privacy-green-dark);
  font:700 10px/1.2 "DM Mono",monospace;
}

.privacy-copy h3{
  margin:0 0 13px;
  color:#0a151c;
  font:700 20px/1.35 "Sora",sans-serif;
  letter-spacing:-.025em;
}

.privacy-copy p{
  max-width:820px;
  margin:0 0 12px;
  color:var(--privacy-text);
  font:400 15.5px/1.82 "Lora",serif;
}

.privacy-copy p:last-of-type{
  margin-bottom:0;
}

.privacy-copy .secondary-paragraph{
  margin-top:15px;
}

.privacy-copy ul{
  display:grid;
  gap:7px;
  max-width:820px;
  margin:14px 0 0;
  padding:0;
  list-style:none;
}

.privacy-copy li{
  position:relative;
  padding-left:22px;
  color:#4d5d64;
  font:600 12px/1.65 "Sora",sans-serif;
}

.privacy-copy li>span{
  position:absolute;
  left:0;
  top:1px;
  color:var(--privacy-green-dark);
  font:700 14px/1 "DM Mono",monospace;
}

.contact-block{
  display:grid;
  gap:8px;
  margin-top:16px;
  padding:14px 16px;
  border-left:3px solid var(--privacy-green);
  border-radius:6px;
  background:rgba(24,201,120,.045);
}

.contact-block a{
  color:var(--privacy-green-dark);
  text-decoration:none;
  font:700 12px/1.55 "DM Mono",monospace;
}

.contact-block a:hover{
  text-decoration:underline;
}

.document-footer{
  display:flex;
  justify-content:space-between;
  gap:20px;
  padding:16px 38px;
  border-top:1px solid var(--privacy-line);
  background:#f8faf9;
  color:#8d999d;
  font:600 8px/1.3 "DM Mono",monospace;
  letter-spacing:.08em;
}

/* DARK THEME */
html[data-theme="dark"] .privacy-page,
html.dark .privacy-page,
body.dark .privacy-page{
  --privacy-bg:#0d141a;
  --privacy-paper:#111a21;
  --privacy-ink:#f2f7f4;
  --privacy-text:#aebbb6;
  --privacy-muted:#899791;
  --privacy-line:rgba(255,255,255,.085);
  background:var(--privacy-bg);
  color:var(--privacy-ink);
}

html[data-theme="dark"] .privacy-content,
html.dark .privacy-content,
body.dark .privacy-content{
  background:
    radial-gradient(circle at 90% 5%,rgba(24,201,120,.07),transparent 26%),
    #0d141a;
}

html[data-theme="dark"] .privacy-sidebar,
html.dark .privacy-sidebar,
body.dark .privacy-sidebar{
  background:rgba(17,26,33,.82);
  border-color:var(--privacy-line);
}

html[data-theme="dark"] .privacy-sidebar>a,
html.dark .privacy-sidebar>a,
body.dark .privacy-sidebar>a{
  color:#9eaca6;
}

html[data-theme="dark"] .privacy-sidebar>a:hover,
html.dark .privacy-sidebar>a:hover,
body.dark .privacy-sidebar>a:hover,
html[data-theme="dark"] .privacy-sidebar>a.active,
html.dark .privacy-sidebar>a.active,
body.dark .privacy-sidebar>a.active{
  color:var(--privacy-green);
}

html[data-theme="dark"] .privacy-document,
html.dark .privacy-document,
body.dark .privacy-document{
  background:var(--privacy-paper);
  border-color:var(--privacy-line);
  box-shadow:0 18px 55px rgba(0,0,0,.18);
}

html[data-theme="dark"] .document-intro,
html.dark .document-intro,
body.dark .document-intro{
  background:
    linear-gradient(135deg,rgba(24,201,120,.055),transparent 42%),
    #111a21;
  border-color:var(--privacy-line);
}

html[data-theme="dark"] .document-intro h2,
html.dark .document-intro h2,
body.dark .document-intro h2{
  color:#f2f7f4;
}

html[data-theme="dark"] .document-notice,
html.dark .document-notice,
body.dark .document-notice{
  background:rgba(24,201,120,.045);
  border-color:var(--privacy-line);
}

html[data-theme="dark"] .document-notice strong,
html.dark .document-notice strong,
body.dark .document-notice strong{
  color:#e9f3ef;
}

html[data-theme="dark"] .document-notice p,
html.dark .document-notice p,
body.dark .document-notice p{
  color:#aebbb6;
}

html[data-theme="dark"] .privacy-section,
html.dark .privacy-section,
body.dark .privacy-section{
  border-color:var(--privacy-line);
}

html[data-theme="dark"] .privacy-copy h3,
html.dark .privacy-copy h3,
body.dark .privacy-copy h3{
  color:#f2f7f4;
}

html[data-theme="dark"] .privacy-copy p,
html.dark .privacy-copy p,
body.dark .privacy-copy p{
  color:#aebbb6;
}

html[data-theme="dark"] .privacy-copy li,
html.dark .privacy-copy li,
body.dark .privacy-copy li{
  color:#b4c0bb;
}

html[data-theme="dark"] .document-footer,
html.dark .document-footer,
body.dark .document-footer{
  background:#0d151b;
  border-color:var(--privacy-line);
}

html[data-theme="dark"] .contact-block,
html.dark .contact-block,
body.dark .contact-block{
  background:rgba(24,201,120,.055);
}

/* TABLET */
@media(max-width:900px){
  .privacy-container{
    width:min(100% - 32px,720px);
  }

  .privacy-hero{
    min-height:360px;
  }

  .privacy-hero-inner{
    padding:68px 0 62px;
  }

  .privacy-layout{
    display:block;
  }

  .privacy-sidebar{
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

  .privacy-sidebar>a{
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
  .privacy-container{
    width:calc(100% - 24px);
  }

  .privacy-hero-inner{
    padding:58px 0 52px;
  }

  .privacy-hero h1{
    margin-top:15px;
    font-size:clamp(42px,14vw,58px);
  }

  .privacy-hero p{
    font-size:15px;
    line-height:1.7;
  }

  .privacy-hero-meta{
    gap:10px 18px;
    margin-top:22px;
  }

  .privacy-content{
    padding:36px 0 60px;
  }

  .privacy-sidebar{
    gap:15px;
    margin-bottom:14px;
  }

  .privacy-document{
    border-radius:9px;
  }

  .document-intro{
    display:block;
    padding:25px 19px 23px;
  }

  .document-intro h2{
    font-size:22px;
  }

  .document-date{
    display:block;
    margin-top:14px;
  }

  .document-notice{
    padding:18px 19px;
  }

  .privacy-section{
    grid-template-columns:31px minmax(0,1fr);
    gap:10px;
    padding:25px 19px;
  }

  .privacy-index{
    font-size:9px;
  }

  .privacy-copy h3{
    margin-bottom:11px;
    font-size:18px;
  }

  .privacy-copy p{
    font-size:14px;
    line-height:1.78;
  }

  .privacy-copy li{
    font-size:11px;
    line-height:1.6;
  }

  .document-footer{
    padding:14px 19px;
    font-size:7px;
  }
}

@media(prefers-reduced-motion:reduce){
  .privacy-page *{
    scroll-behavior:auto!important;
    transition:none!important;
  }
}
`;

