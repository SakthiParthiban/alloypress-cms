import type { Metadata } from "next";
import { Inter } from "next/font/google";

import "./globals.css";

import "@/components/css-style/navbar.css";
import "@/components/css-style/hero.css";
import "@/components/css-style/latest.css";
import "@/components/css-style/category.css";
import "@/components/css-style/alloy-pick.css";
import "@/components/css-style/learn-ai.css";
import "@/components/css-style/recent-ai-news.css";
import "@/components/css-style/ai-tool-reviews.css";
import "@/components/css-style/footer.css";
import "@/components/css-style/popular.css";
import "@/components/css-style/news-letter.css";
import "@/components/css-style/tool-submit.css";
import "@/components/css-style/testing-partner.css";
import EmailCtaModal from "@/components/ui/EmailCtaModal";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ThemeScript from "@/components/ThemeScript";

// ------------------------------------------------------------
// NEW: centralized SEO constants + site-wide JSON-LD builders
// ------------------------------------------------------------
import { SITE_URL } from "@/lib/seo/constants";
import {
  createOrganizationSchema,
  createWebSiteSchema,
} from "@/lib/seo/schema";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),

  title: {
    default: "AlloyPress — AI Info Simplified For Everyone",
    template: "%s | AlloyPress",
  },

  description:
    "Honest AI tool reviews, comparisons, alternatives, news, and practical guides based on real-world testing.",

  applicationName: "AlloyPress",

  robots: {
    index: true,
    follow: true,
  },
};

// ------------------------------------------------------------
// Site-wide JSON-LD graph: rendered once, on every page, so
// Google always sees the same Organization + WebSite entities.
// Individual pages/articles add their own JSON-LD on top of
// this (Article, WebPage, BreadcrumbList, etc.) and link back
// to these via @id references — see lib/seo/schema.ts.
// ------------------------------------------------------------
const siteJsonLd = {
  "@context": "https://schema.org",
  "@graph": [createOrganizationSchema(), createWebSiteSchema()],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <body>
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(siteJsonLd),
          }}
        />

        <ThemeScript />

        <Navbar />

        <main>{children}</main>

        <Footer />
        <EmailCtaModal />
      </body>
    </html>
  );
}