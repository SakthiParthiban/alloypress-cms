import Link from "next/link";
import Image from "next/image";
import {
  FaYoutube,
  FaInstagram,
  FaFacebookF,
  FaXTwitter,
} from "react-icons/fa6";

const navigateLinks = [
  { label: "Home", href: "/" },
  { label: "Blogs", href: "/blogs" },
  { label: "Reviews", href: "/reviews" },
  { label: "News", href: "/news" },
  { label: "Alternatives", href: "/alternatives" },
  { label: "Comparisons", href: "/comparisons" },
];

const resourceLinks = [
  { label: "AI Image Generators", href: "/blogs/best-ai-image-generator" },
  { label: "AI Website Builders", href: "/blogs/best-ai-website-builders" },
  {
    label: "AI Background Removers",
    href: "/blogs/best-ai-background-remover-tools",
  },
  { label: "AI Voice Generators", href: "/blogs/best-ai-voice-generators" },
  { label: "AI Blog Writers", href: "/blogs/best-ai-blog-writing-tools" },
  {
    label: "AI Logo Generators",
    href: "/blogs/best-ai-logo-generators",
    popular: true,
  },
];

const companyLinks = [
  { label: "About Us", href: "/about" },
  { label: "Contact", href: "/contact" },
  { label: "Submit a Tool", href: "/inclusion" },
  {
    label: "Careers",
    href: "https://nvdigital.in/careers/",
    external: true,
  },
];

const learnLinks = [
  { label: "What is AI?", href: "/blogs/artificial-intelligence" },
  { label: "AI Hallucinations", href: "/blogs/ai-hallucinations-explained" },
  { label: "AI vs Humans", href: "/blogs/ai-vs-human-intelligence" },
  { label: "AI Writing Prompts", href: "/blogs/ai-writing-prompts-for-every-task" },
  { label: "AI Resume Builders", href: "/blogs/list-of-top-ai-resume-builders" },
];

const popularLinks = [
  {
    category: "LISTICLE",
    label: "AI Video Generators",
    href: "/blogs/best-ai-video-generators",
  },
  {
    category: "ALTERNATIVES",
    label: "ChatGPT Alternatives",
    href: "/alternatives/chatgpt",
  },
  {
    category: "REVIEW",
    label: "Cursor AI Review",
    href: "/reviews/cursor-ai",
  },
  {
    category: "EDUCATION",
    label: "Google AI Mode Explained",
    href: "/blogs/google-ai-mode-explained",
  },
  {
    category: "COMPARISONS",
    label: "Invideo vs Synthesia",
    href: "comparisons/invideo-vs-synthesia",
  },
];

function SocialIcon({
  children,
  label,
  href = "#",
}: {
  children: React.ReactNode;
  label: string;
  href?: string;
}) {
  return (
    <a
      href={href}
      className="footer-social"
      aria-label={label}
      rel={href === "#" ? "nofollow" : "noopener noreferrer"}
      target={href === "#" ? undefined : "_blank"}
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
                Honest AI tool reviewes, comparisons and alternatives-based on hands on testing.
              </p>

              <div className="footer-socials">
                <SocialIcon
                  label="YouTube"
                  href="https://www.youtube.com/@AlloyPress"
                >
                  <FaYoutube aria-hidden="true" />
                </SocialIcon>

                <SocialIcon
                  label="Instagram"
                  href="https://www.instagram.com/alloypressdotcom/"
                >
                  <FaInstagram aria-hidden="true" />
                </SocialIcon>

                <SocialIcon
                  label="X"
                  href="https://x.com/AlloyPress"
                >
                  <FaXTwitter aria-hidden="true" />
                </SocialIcon>
              </div>
            </div>

            <FooterColumn
              title="Navigate"
              links={navigateLinks}
            />

            <FooterColumn
              title="Top Resources"
              links={resourceLinks}
            />

            <FooterColumn
              title="Company"
              links={[
                companyLinks[0],
                companyLinks[1],
                companyLinks[2],
                {
                  label: "Review Your Tool",
                  href: "/review-tool",
                },
                companyLinks[3],
              ]}
            />

            <FooterColumn
              title="Learn"
              links={learnLinks}
            />
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
          <Link
            href="/about"
            className="footer-source-link"
          >
            Set AlloyPress as the preferred source for AI on Google
          </Link>
        </div>
      </div>

      <div
        className="footer-brand-wordmark"
        aria-hidden="true"
      >
        ALLOYPRESS
      </div>

      <div className="footer-bottom">
        <div className="container footer-bottom-inner">
          <nav
            className="footer-legal"
            aria-label="Legal"
          >
            <Link href="/privacy-policy">
              Privacy Policy
            </Link>

            <Link href="/terms">
              Terms and Conditions
            </Link>

            <Link href="/do-not-sell">
              Do Not Sell My Info
            </Link>
          </nav>

          <p>
            Copyright © {new Date().getFullYear()} AlloyPress.
            All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}