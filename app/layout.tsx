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

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ThemeScript from "@/components/ThemeScript";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://alloypress.com"),

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={inter.variable}
    >
      <body>
        <ThemeScript />

        <Navbar />

        <main>{children}</main>

        <Footer />
      </body>
    </html>
  );
}