import Link from "next/link";
import Image from "next/image";

const navigateLinks = [
  { label: "Home", href: "/" },
  { label: "Blogs", href: "/blogs" },
  { label: "Reviews", href: "/reviews" },
  { label: "News", href: "/news" },
  { label: "Alternatives", href: "/alternatives" },
  { label: "Comparisons", href: "/comparisons" },
];

const resourceLinks = [
  { label: "AI Image Generators", href: "/resources/ai-image-generators" },
  { label: "Best AI Chatbots", href: "/resources/ai-chatbots" },
  { label: "AI Background Removers", href: "/resources/ai-background-removers" },
  { label: "AI Detectors", href: "/resources/ai-detectors" },
  { label: "AI Blog Writers", href: "/resources/ai-blog-writers" },
  {
    label: "AI Logo Generators",
    href: "/resources/ai-logo-generators",
    popular: true,
  },
];

const companyLinks = [
  { label: "About Us", href: "/about" },
  { label: "Contact", href: "/contact" },
  { label: "Submit a Tool", href: "/inclusion" },
  { label: "Advertise", href: "/advertise" },
  // External careers page as requested.
  { label: "Careers", href: "https://nvdigital.in/careers/", external: true },
];

const learnLinks = [
  { label: "What is AI?", href: "/blogs/what-is-ai" },
  { label: "AI Hallucinations", href: "/blogs/ai-hallucinations" },
  { label: "AI vs Humans", href: "/blogs/ai-vs-humans" },
  { label: "AI Writing Prompts", href: "/blogs/ai-writing-prompts" },
  { label: "AI Resume Builders", href: "/blogs/ai-resume-builders" },
];

const popularLinks = [
  {
    category: "LISTICLE",
    label: "Best AI Image Generators",
    href: "/resources/ai-image-generators",
  },
  {
    category: "ALTERNATIVES",
    label: "ChatGPT Alternatives",
    href: "/alternatives/chatgpt",
  },
  {
    category: "REVIEW",
    label: "Reve AI Review",
    href: "/reviews/reve-ai-review",
  },
  {
    category: "EDUCATION",
    label: "AI Hallucinations Explained",
    href: "/blogs/ai-hallucinations",
  },
  {
    category: "COMPARISONS",
    label: "AI Tool Head-to-Heads",
    href: "/comparisons",
  },
];

function SocialIcon({
  children,
  label,
}: {
  children: React.ReactNode;
  label: string;
}) {
  return (
    <a
      href="#"
      className="footer-social"
      aria-label={label}
      rel="nofollow"
    >
      {children}
    </a>
  );
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: {
    label: string;
    href: string;
    popular?: boolean;
    external?: boolean;
  }[];
}) {
  return (
    <div className="footer-column">
      <h3>{title}</h3>

      <nav aria-label={title}>
        <ul>
          {links.map((link) => (
            <li key={link.label}>
              {link.external ? (
                <a
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {link.label}
                  {link.popular && (
                    <span className="footer-popular">Popular</span>
                  )}
                </a>
              ) : (
                <Link href={link.href}>
                  {link.label}
                  {link.popular && (
                    <span className="footer-popular">Popular</span>
                  )}
                </Link>
              )}
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-main">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-brand">
              <Link href="/" className="footer-logo">
                <Image
                  src="/ap-logo.png"
                  alt="AlloyPress"
                  width={150}
                  height={40}
                />
              </Link>

              <p>
                Get actionable AI insights, AI tool reviews and more.
                AlloyPress simplifies AI info for everyone.
              </p>

              <div className="footer-socials">
                <SocialIcon label="YouTube">▶</SocialIcon>
                <SocialIcon label="Threads">◈</SocialIcon>
                <SocialIcon label="Facebook">f</SocialIcon>
                <SocialIcon label="X">𝕏</SocialIcon>
              </div>
            </div>

            <FooterColumn title="Navigate" links={navigateLinks} />

            <FooterColumn title="Top Resources" links={resourceLinks} />

            <FooterColumn
              title="Company"
              links={[
                companyLinks[0],
                companyLinks[1],
                companyLinks[2],
                companyLinks[3],
                {
                  label: "Review Your Tool",
                  href: "/review-tool",
                },
                companyLinks[4],
              ]}
            />

            <FooterColumn title="Learn" links={learnLinks} />
          </div>
        </div>
      </div>

      <div className="footer-popular-section">
        <div className="container">
          <div className="footer-popular-grid">
            {popularLinks.map((item) => (
              <Link
                href={item.href}
                key={item.label}
                className="footer-popular-item"
              >
                <span>{item.category}</span>
                <strong>{item.label}</strong>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="footer-source">
        <div className="container">
          <Link href="/about" className="footer-source-link">
            Set AlloyPress as the preferred source for AI on Google
          </Link>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="container footer-bottom-inner">
          <nav className="footer-legal" aria-label="Legal">
            <Link href="/privacy-policy">Privacy Policy</Link>
            <Link href="/terms">Terms and Conditions</Link>
            <Link href="/do-not-sell">Do Not Sell My Info</Link>
          </nav>

          <p>
            Copyright © {new Date().getFullYear()} AlloyPress. All rights
            reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
