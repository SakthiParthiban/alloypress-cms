import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About AlloyPress",
  description:
    "Learn how AlloyPress tests, reviews, compares, and explains AI tools with practical, reader-first editorial standards.",
  alternates: {
    canonical: "/about",
  },
};

const principles = [
  {
    number: "01",
    label: "TEST",
    title: "We test before we write",
    text: "Every tool we cover is approached with real hands-on testing whenever practical, so recommendations are based on actual use rather than surface-level research.",
  },
  {
    number: "02",
    label: "HONEST",
    title: "We call it as we see it",
    text: "If a tool has limitations, we say so. If something works exceptionally well, we explain why. Nothing has to look perfect.",
  },
  {
    number: "03",
    label: "CURRENT",
    title: "We keep things updated",
    text: "AI changes quickly. Models, features, pricing, and capabilities evolve constantly, so useful information has to evolve too.",
  },
  {
    number: "04",
    label: "HUMAN",
    title: "We write for people",
    text: "Clear answers, practical context, and useful recommendations come before unnecessary jargon, filler, or algorithm-first writing.",
  },
];

const contentTypes = [
  ["01", "AI Tool Reviews", "Hands-on evaluations of features, workflow, pricing, strengths, limitations, and real-world usefulness.", "REVIEWS"],
  ["02", "AI Guides & Tutorials", "Practical explanations that help readers understand and use AI without unnecessary complexity.", "BLOGS"],
  ["03", "AI Alternatives", "Useful alternatives when the obvious choice is not the right fit for a reader.", "ALTERNATIVES"],
  ["04", "AI Comparisons", "Side-by-side analysis designed to make choosing between AI tools easier.", "COMPARISONS"],
  ["05", "AI News & Updates", "Important launches, product changes, announcements, and developments across AI.", "NEWS"],
  ["06", "AI Education", "Clear explanations of AI concepts, trends, terminology, and technologies.", "LEARN"],
];

const standards = [
  ["01", "Testing", "Real hands-on testing", "When we review a product, we aim to use it ourselves and evaluate it in practical scenarios."],
  ["02", "Integrity", "Paid or organic, same standard", "Commercial relationships should never change the standard used to evaluate a product."],
  ["03", "Honesty", "Limitations are included", "Readers deserve to know what may not work before they make a decision."],
  ["04", "Accuracy", "Updated when things change", "Important information should be reviewed and refreshed when meaningful product changes happen."],
  ["05", "Independence", "No backdoor rankings", "Editorial decisions should be based on usefulness and evidence, not placement payments."],
  ["06", "Readers", "Written for humans", "Useful context and practical answers come before unnecessary optimization or filler."],
];

const audiences = [
  ["⌘", "Developers", "Coding assistants, automation tools, APIs, and practical AI workflows."],
  ["✦", "Content creators", "Writing, design, marketing, video, and creative AI workflows."],
  ["◈", "Business owners", "AI tools that can improve productivity and everyday operations."],
  ["○", "Everyday users", "People who want useful AI without the technical overload."],
];

const styles = `
/* =========================================================
   ALLOYPRESS — ABOUT PAGE
   Editorial + AI Intelligence texture system
   No random circles / no orbit decorations
   ========================================================= */

.about-page {
  --about-max: 1180px;
  position: relative;
  overflow: hidden;
  background: var(--background);
  color: var(--foreground);
}

.about-container {
  position: relative;
  z-index: 3;
  width: min(calc(100% - 48px), var(--about-max));
  margin-inline: auto;
}

/* =========================================================
   SHARED TYPE
   ========================================================= */

.about-kicker {
  display: inline-flex;
  align-items: center;
  gap: 9px;
  margin: 0 0 15px;
  color: var(--brand);
  font: 600 9px/1 "DM Mono", monospace;
  letter-spacing: .16em;
  text-transform: uppercase;
}

.about-kicker::before {
  content: "";
  width: 5px;
  height: 5px;
  flex: 0 0 5px;
  border-radius: 50%;
  background: var(--brand);
  box-shadow:
    0 0 0 4px rgba(24,185,104,.07),
    0 0 15px rgba(24,185,104,.55);
}

.about-title {
  margin: 0;
  font: 700 clamp(38px, 5.2vw, 64px)/.98 "Sora", sans-serif;
  letter-spacing: -.065em;
}

.about-title span,
.about-accent {
  color: var(--brand);
}

/* =========================================================
   HERO
   ========================================================= */

.about-hero {
  position: relative;
  isolation: isolate;
  overflow: hidden;
  min-height: 555px;
  padding: 88px 0 74px;
  background: #090e13;
  color: #f4f8f6;
}

/* Fine dots + larger editorial grid */
.about-hero::before {
  content: "";
  position: absolute;
  inset: 0;
  z-index: -4;
  background-image:
    radial-gradient(
      circle at 1px 1px,
      rgba(255,255,255,.105) 1px,
      transparent 1.35px
    ),
    linear-gradient(
      rgba(24,185,104,.07) 1px,
      transparent 1px
    ),
    linear-gradient(
      90deg,
      rgba(24,185,104,.07) 1px,
      transparent 1px
    );
  background-size:
    22px 22px,
    72px 72px,
    72px 72px;
  opacity: .9;
  pointer-events: none;
}

/* Right-side green ambient glow */
.about-hero::after {
  content: "";
  position: absolute;
  width: 760px;
  height: 560px;
  right: -210px;
  top: -235px;
  z-index: -3;
  background:
    radial-gradient(
      ellipse at center,
      rgba(24,185,104,.18) 0%,
      rgba(24,185,104,.085) 32%,
      transparent 72%
    );
  filter: blur(7px);
  pointer-events: none;
}

/* Dedicated technical layer */
.about-hero-tech {
  position: absolute;
  inset: 0;
  z-index: -1;
  pointer-events: none;
  overflow: hidden;
}

/* 3 thin diagonal technical lines */
.about-hero-tech::before,
.about-hero-tech::after {
  content: "";
  position: absolute;
  height: 1px;
  transform-origin: left center;
}

.about-hero-tech::before {
  width: 610px;
  left: 5%;
  top: 31%;
  transform: rotate(-8deg);
  background: linear-gradient(
    90deg,
    transparent,
    rgba(24,185,104,.38) 30%,
    rgba(255,255,255,.12) 70%,
    transparent
  );
}

.about-hero-tech::after {
  width: 480px;
  right: -35px;
  top: 67%;
  transform: rotate(-10deg);
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255,255,255,.10),
    rgba(24,185,104,.28),
    transparent
  );
}

.about-hero-line {
  position: absolute;
  width: 350px;
  height: 1px;
  left: 28%;
  top: 76%;
  transform: rotate(-7deg);
  background: linear-gradient(
    90deg,
    transparent,
    rgba(24,185,104,.24),
    transparent
  );
}

.about-hero-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.35fr) minmax(320px, .65fr);
  gap: 70px;
  align-items: end;
}

.about-hero-copy {
  position: relative;
  max-width: 790px;
}

/* Tiny data markers */
.about-data-marker {
  position: absolute;
  color: rgba(255,255,255,.18);
  font: 500 8px "DM Mono", monospace;
  letter-spacing: .1em;
}

.about-data-marker::after {
  content: "";
  display: inline-block;
  width: 18px;
  height: 1px;
  margin-left: 7px;
  vertical-align: middle;
  background: rgba(24,185,104,.28);
}

.about-data-marker-01 {
  left: -5px;
  top: -34px;
}

.about-data-marker-02 {
  right: 9%;
  top: 24px;
}

.about-data-marker-03 {
  right: 22%;
  bottom: -34px;
}

.about-signal-point {
  position: absolute;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: #18c978;
  box-shadow: 0 0 13px rgba(24,185,104,.8);
}

.about-signal-point-1 {
  left: 48%;
  top: 30%;
}

.about-signal-point-2 {
  right: 16%;
  top: 44%;
}

.about-signal-point-3 {
  left: 67%;
  bottom: 16%;
}

.about-hero .about-title {
  color: #f4f8f6 !important;
}

.about-hero .about-title span {
  color: #18c978 !important;
}

.about-hero .about-kicker {
  color: #18c978 !important;
}

.about-hero-description {
  max-width: 660px;
  margin: 26px 0 0;
  color: #a0aca8 !important;
  font: 400 14px/1.75 "Lora", serif;
}

/* =========================================================
   HERO SIGNAL CARD
   ========================================================= */

.about-signal {
  position: relative;
  padding: 24px;
  overflow: hidden;
  border: 1px solid rgba(255,255,255,.11);
  border-radius: 16px;
  background:
    linear-gradient(
      145deg,
      rgba(255,255,255,.065),
      rgba(255,255,255,.018)
    );
  box-shadow:
    0 25px 70px rgba(0,0,0,.24),
    inset 0 1px 0 rgba(255,255,255,.025);
}

/* Card backside technical line pattern */
.about-signal::before {
  content: "";
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(
      90deg,
      transparent 0 18%,
      rgba(24,185,104,.075) 18.2%,
      transparent 18.5% 52%,
      rgba(255,255,255,.045) 52.2%,
      transparent 52.5% 78%,
      rgba(24,185,104,.055) 78.2%,
      transparent 78.5%
    ),
    linear-gradient(
      rgba(255,255,255,.045) 1px,
      transparent 1px
    ),
    linear-gradient(
      90deg,
      rgba(255,255,255,.035) 1px,
      transparent 1px
    );
  background-size:
    100% 100%,
    100% 36px,
    44px 100%;
  opacity: .78;
  pointer-events: none;
}

/* Card mini data graph */
.about-signal::after {
  content: "";
  position: absolute;
  right: 18px;
  bottom: 18px;
  width: 115px;
  height: 52px;
  opacity: .8;
  background:
    linear-gradient(
      155deg,
      transparent 0 22%,
      rgba(24,185,104,.34) 22.4% 23%,
      transparent 23.4% 42%,
      rgba(24,185,104,.22) 42.4% 43%,
      transparent 43.4% 64%,
      rgba(24,185,104,.36) 64.4% 65%,
      transparent 65.4%
    ),
    repeating-linear-gradient(
      0deg,
      transparent 0 11px,
      rgba(255,255,255,.055) 11px 12px
    );
  pointer-events: none;
}

.about-signal-label {
  position: relative;
  z-index: 2;
  margin-bottom: 18px;
  color: #18c978;
  font: 600 8px "DM Mono", monospace;
  letter-spacing: .14em;
  text-transform: uppercase;
}

.about-signal-label::after {
  content: "AP / 03";
  float: right;
  color: rgba(255,255,255,.18);
  font: 500 7px "DM Mono", monospace;
  letter-spacing: .1em;
}

.about-signal-row {
  position: relative;
  z-index: 2;
  display: grid;
  grid-template-columns: 28px 1fr;
  gap: 12px;
  padding: 15px 0;
  border-top: 1px solid rgba(255,255,255,.08);
}

.about-signal-row:first-of-type {
  border-top: 0;
}

.about-signal-number {
  color: #18c978;
  font: 500 8px "DM Mono", monospace;
}

.about-signal strong {
  display: block;
  color: #edf3f0;
  font: 600 11px "Sora", sans-serif;
}

.about-signal p {
  margin: 5px 0 0;
  color: #7d8985;
  font: 400 10px/1.55 "Lora", serif;
}

/* =========================================================
   STATS
   ========================================================= */

.about-stats {
  position: relative;
  overflow: hidden;
  border-bottom: 1px solid var(--border);
  background:
    radial-gradient(
      circle at 1px 1px,
      rgba(24,185,104,.10) 1px,
      transparent 1.2px
    ),
    color-mix(in srgb, var(--foreground) 3%, var(--background));
  background-size: 24px 24px, auto;
}

.about-stats::after {
  content: "";
  position: absolute;
  left: 4%;
  right: 4%;
  bottom: 0;
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(24,185,104,.18),
    transparent
  );
}

.about-stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
}

.about-stat {
  position: relative;
  min-height: 105px;
  padding: 22px 24px;
  border-right: 1px solid var(--border);
}

.about-stat::before {
  content: "";
  position: absolute;
  top: 16px;
  right: 15px;
  width: 16px;
  height: 1px;
  background: rgba(24,185,104,.35);
}

.about-stat:first-child {
  border-left: 1px solid var(--border);
}

.about-stat strong {
  display: block;
  color: var(--foreground);
  font: 700 24px/1 "Sora", sans-serif;
  letter-spacing: -.05em;
}

.about-stat span {
  display: block;
  max-width: 165px;
  margin-top: 9px;
  color: var(--muted);
  font: 500 7px/1.55 "DM Mono", monospace;
  letter-spacing: .04em;
  text-transform: uppercase;
}

/* =========================================================
   WHITE SECTIONS
   ========================================================= */

.about-section {
  position: relative;
  isolation: isolate;
  overflow: hidden;
  padding: 78px 0;
}

/* Visible fine dot texture */
.about-section::before {
  content: "";
  position: absolute;
  inset: 0;
  z-index: -2;
  background-image:
    radial-gradient(
      circle at 1px 1px,
      rgba(24,185,104,.14) 1px,
      transparent 1.35px
    );
  background-size: 23px 23px;
  opacity: .72;
  pointer-events: none;
}

/* Editorial horizontal rule */
.about-section::after {
  content: "";
  position: absolute;
  left: 4%;
  right: 4%;
  top: 34px;
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(24,185,104,.15) 15%,
    rgba(25,40,50,.075) 50%,
    rgba(24,185,104,.15) 85%,
    transparent
  );
  pointer-events: none;
}

.about-section-head {
  position: relative;
  display: grid;
  grid-template-columns: minmax(260px, .8fr) minmax(0, 1.2fr);
  gap: 70px;
  align-items: end;
  margin-bottom: 34px;
}

.about-section-head::after {
  content: "01";
  position: absolute;
  right: 0;
  bottom: -3px;
  color: rgba(24,185,104,.13);
  font: 600 8px "DM Mono", monospace;
  letter-spacing: .12em;
}

.about-section-head h2 {
  margin: 0;
  color: var(--foreground);
  font: 700 clamp(30px, 4.2vw, 50px)/1.03 "Sora", sans-serif;
  letter-spacing: -.055em;
}

.about-section-head p {
  max-width: 610px;
  margin: 0;
  color: var(--muted);
  font: 400 13px/1.75 "Lora", serif;
}

/* =========================================================
   MISSION CARDS
   ========================================================= */

.about-principles {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
}

.about-principle {
  position: relative;
  min-height: 205px;
  padding: 22px;
  overflow: hidden;
  border: 1px solid var(--card-border);
  border-radius: 14px;
  background: var(--card-background);
  transition:
    transform .28s ease,
    border-color .28s ease,
    box-shadow .28s ease;
}

/* Corner technical ticks */
.about-principle::before {
  content: "";
  position: absolute;
  top: 14px;
  right: 14px;
  width: 38px;
  height: 24px;
  background:
    linear-gradient(
      90deg,
      transparent 0 65%,
      rgba(24,185,104,.20) 65% 67%,
      transparent 67%
    ),
    linear-gradient(
      rgba(24,185,104,.20) 1px,
      transparent 1px
    );
  background-size: 100% 100%, 100% 8px;
}

.about-principle::after {
  content: attr(data-number);
  position: absolute;
  right: 14px;
  top: 40px;
  color: color-mix(in srgb, var(--foreground) 6%, transparent);
  font: 700 52px "Sora", sans-serif;
  letter-spacing: -.08em;
}

.about-principle:hover {
  transform: translateY(-6px);
  border-color: rgba(24,185,104,.32);
  box-shadow: var(--card-shadow-hover);
}

.about-card-meta {
  position: relative;
  z-index: 2;
  color: var(--brand);
  font: 600 8px "DM Mono", monospace;
  letter-spacing: .12em;
}

.about-principle h3 {
  position: relative;
  z-index: 2;
  margin: 54px 0 0;
  font: 600 14px/1.25 "Sora", sans-serif;
  letter-spacing: -.025em;
}

.about-principle p {
  position: relative;
  z-index: 2;
  margin: 9px 0 0;
  color: var(--muted);
  font: 400 11px/1.65 "Lora", serif;
}

/* =========================================================
   CONTENT LIST
   ========================================================= */

.about-content-section {
  padding-top: 45px;
}

.about-content-list {
  position: relative;
  overflow: hidden;
  border: 1px solid var(--card-border);
  border-radius: 16px;
  background:
    linear-gradient(
      90deg,
      rgba(24,185,104,.025),
      transparent 25%,
      transparent 75%,
      rgba(24,185,104,.025)
    ),
    var(--card-background);
}

/* Editorial vertical axis */
.about-content-list::before {
  content: "";
  position: absolute;
  top: 0;
  bottom: 0;
  left: 55px;
  width: 1px;
  background: rgba(24,185,104,.10);
}

.about-content-row {
  position: relative;
  display: grid;
  grid-template-columns: 55px minmax(0, 1fr) auto 26px;
  gap: 20px;
  align-items: center;
  min-height: 82px;
  padding: 13px 20px;
  border-bottom: 1px solid var(--border);
  transition:
    background .22s ease,
    padding .22s ease;
}

.about-content-row:last-child {
  border-bottom: 0;
}

.about-content-row::after {
  content: "";
  position: absolute;
  right: 52px;
  top: 50%;
  width: 20px;
  height: 1px;
  background: rgba(24,185,104,.10);
}

.about-content-row:hover {
  padding-left: 25px;
  background: rgba(24,185,104,.045);
}

.about-content-number {
  color: var(--brand);
  font: 500 9px "DM Mono", monospace;
}

.about-content-main h3 {
  margin: 0;
  font: 600 13px "Sora", sans-serif;
}

.about-content-main p {
  max-width: 680px;
  margin: 5px 0 0;
  color: var(--muted);
  font: 400 10px/1.5 "Lora", serif;
}

.about-content-tag {
  padding: 5px 9px;
  border: 1px solid var(--border);
  border-radius: 999px;
  color: var(--muted);
  font: 500 7px "DM Mono", monospace;
  letter-spacing: .06em;
}

.about-content-arrow {
  color: var(--brand);
  font: 500 13px "DM Mono", monospace;
  opacity: .5;
  transition: transform .22s ease, opacity .22s ease;
}

.about-content-row:hover .about-content-arrow {
  transform: translateX(4px);
  opacity: 1;
}

/* =========================================================
   DARK EDITORIAL STANDARDS
   ========================================================= */

.about-standards {
  position: relative;
  isolation: isolate;
  overflow: hidden;
  padding: 82px 0;
  background: #090e13;
  color: #f4f8f6;
}

/* Dark micro-grid + dots */
.about-standards::before {
  content: "";
  position: absolute;
  inset: 0;
  z-index: -3;
  background-image:
    radial-gradient(
      circle at 1px 1px,
      rgba(255,255,255,.075) 1px,
      transparent 1.25px
    ),
    linear-gradient(
      rgba(24,185,104,.055) 1px,
      transparent 1px
    ),
    linear-gradient(
      90deg,
      rgba(24,185,104,.055) 1px,
      transparent 1px
    );
  background-size:
    20px 20px,
    64px 64px,
    64px 64px;
  opacity: .9;
}

/* Glow + technical diagonal */
.about-standards::after {
  content: "";
  position: absolute;
  width: 760px;
  height: 440px;
  right: -210px;
  top: -150px;
  z-index: -2;
  background:
    linear-gradient(
      156deg,
      transparent 45%,
      rgba(24,185,104,.13) 45.2%,
      transparent 45.55%
    ),
    radial-gradient(
      ellipse at center,
      rgba(24,185,104,.15),
      transparent 68%
    );
  pointer-events: none;
}

.about-standards .about-section-head h2 {
  color: #f4f8f6;
}

.about-standards .about-section-head p {
  color: #7c8884;
}

.about-standards .about-section-head::after {
  content: "02 / TRUST";
  color: rgba(24,185,104,.28);
}

.about-standards-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.about-standard {
  position: relative;
  min-height: 165px;
  padding: 21px;
  overflow: hidden;
  border: 1px solid rgba(255,255,255,.09);
  border-radius: 13px;
  background:
    linear-gradient(
      135deg,
      rgba(255,255,255,.045),
      rgba(255,255,255,.018)
    );
  transition:
    transform .28s ease,
    background .28s ease,
    border-color .28s ease;
}

/* Technical bottom line */
.about-standard::before {
  content: "";
  position: absolute;
  right: -15px;
  bottom: 20px;
  width: 105px;
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(24,185,104,.38),
    transparent
  );
  transform: rotate(-10deg);
}

/* Small corner marker */
.about-standard::after {
  content: "+";
  position: absolute;
  right: 17px;
  top: 15px;
  color: rgba(24,185,104,.35);
  font: 500 10px "DM Mono", monospace;
}

.about-standard:hover {
  transform: translateY(-5px);
  border-color: rgba(24,185,104,.30);
  background: rgba(24,185,104,.055);
}

.about-standard-meta {
  color: #18c978;
  font: 500 8px "DM Mono", monospace;
  letter-spacing: .1em;
  text-transform: uppercase;
}

.about-standard h3 {
  margin: 28px 0 0;
  color: #e8eeeb;
  font: 600 13px "Sora", sans-serif;
}

.about-standard p {
  margin: 7px 0 0;
  color: #747f7b;
  font: 400 10px/1.6 "Lora", serif;
}

/* =========================================================
   AUDIENCE
   ========================================================= */

.about-audience {
  padding-bottom: 82px;
}

.about-audience .about-section-head::after {
  content: "03 / READERS";
}

.about-audience-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
}

.about-audience-card {
  position: relative;
  min-height: 155px;
  padding: 20px;
  overflow: hidden;
  border: 1px solid var(--card-border);
  border-radius: 13px;
  background: var(--card-background);
  transition:
    transform .28s ease,
    border-color .28s ease,
    box-shadow .28s ease;
}

.about-audience-card::before {
  content: "";
  position: absolute;
  right: 16px;
  top: 17px;
  width: 42px;
  height: 18px;
  background:
    linear-gradient(
      90deg,
      transparent 0 20%,
      rgba(24,185,104,.18) 20% 23%,
      transparent 23% 46%,
      rgba(24,185,104,.12) 46% 49%,
      transparent 49% 72%,
      rgba(24,185,104,.18) 72% 75%,
      transparent 75%
    );
}

.about-audience-card::after {
  content: "";
  position: absolute;
  left: 20px;
  right: 20px;
  bottom: 14px;
  height: 1px;
  background: linear-gradient(
    90deg,
    rgba(24,185,104,.15),
    transparent 70%
  );
}

.about-audience-card:hover {
  transform: translateY(-5px);
  border-color: rgba(24,185,104,.28);
  box-shadow: var(--card-shadow-hover);
}

.about-audience-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 31px;
  height: 31px;
  margin-bottom: 25px;
  border: 1px solid rgba(24,185,104,.20);
  border-radius: 9px;
  background: rgba(24,185,104,.075);
  color: var(--brand);
  font: 600 14px "Sora", sans-serif;
}

.about-audience-card h3 {
  margin: 0;
  font: 600 13px "Sora", sans-serif;
}

.about-audience-card p {
  margin: 6px 0 0;
  color: var(--muted);
  font: 400 10px/1.6 "Lora", serif;
}

/* =========================================================
   CTA
   ========================================================= */

.about-cta {
  position: relative;
  isolation: isolate;
  overflow: hidden;
  padding: 82px 0 88px;
  background: #090e13;
  color: #f4f8f6;
  text-align: center;
  border-top: 1px solid rgba(255,255,255,.07);
}

/* Visible dark grid */
.about-cta::before {
  content: "";
  position: absolute;
  inset: 0;
  z-index: -3;
  background-image:
    radial-gradient(
      circle at 1px 1px,
      rgba(255,255,255,.07) 1px,
      transparent 1.25px
    ),
    linear-gradient(
      rgba(24,185,104,.05) 1px,
      transparent 1px
    ),
    linear-gradient(
      90deg,
      rgba(24,185,104,.05) 1px,
      transparent 1px
    );
  background-size:
    22px 22px,
    70px 70px,
    70px 70px;
  opacity: .85;
}

/* CTA glow + diagonal */
.about-cta::after {
  content: "";
  position: absolute;
  width: 760px;
  height: 420px;
  left: 50%;
  top: -150px;
  transform: translateX(-50%);
  z-index: -2;
  background:
    linear-gradient(
      160deg,
      transparent 44%,
      rgba(24,185,104,.10) 44.2%,
      transparent 44.6%
    ),
    radial-gradient(
      ellipse,
      rgba(24,185,104,.16),
      transparent 68%
    );
  pointer-events: none;
}

.about-cta-inner {
  position: relative;
  z-index: 3;
}

.about-cta-inner::before,
.about-cta-inner::after {
  content: "01";
  position: absolute;
  color: rgba(24,185,104,.18);
  font: 500 7px "DM Mono", monospace;
  letter-spacing: .12em;
}

.about-cta-inner::before {
  left: 0;
  top: 5px;
}

.about-cta-inner::after {
  right: 0;
  top: 5px;
  content: "AP / CONTACT";
}

.about-cta .about-kicker {
  justify-content: center;
}

.about-cta h2 {
  margin: 0;
  color: #f4f8f6 !important;
  font: 700 clamp(32px, 4.5vw, 54px)/1.03 "Sora", sans-serif;
  letter-spacing: -.055em;
}

.about-cta h2 .about-accent {
  color: #18c978 !important;
}

.about-cta p {
  max-width: 520px;
  margin: 15px auto 0;
  color: #a4afab;
  font: 400 13px/1.7 "Lora", serif;
}

.about-cta-actions {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-top: 25px;
}

.about-button {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 46px;
  padding: 0 19px;
  border-radius: 9px;
  text-decoration: none;
  font: 600 11px "Sora", sans-serif;
  transition:
    transform .22s ease,
    background .22s ease,
    border-color .22s ease;
}

.about-button:hover {
  transform: translateY(-2px);
}

.about-button-primary {
  background: var(--brand);
  color: #06110b;
}

.about-button-primary:hover {
  background: #20c977;
}

.about-button-secondary {
  border: 1px solid rgba(255,255,255,.12);
  background: rgba(255,255,255,.035);
  color: #cbd3d0;
}

.about-button-secondary:hover {
  border-color: rgba(24,185,104,.3);
}

/* =========================================================
   MOBILE
   ========================================================= */

@media (max-width: 980px) {
  .about-hero-grid {
    grid-template-columns: 1fr;
    gap: 38px;
  }

  .about-signal {
    max-width: 620px;
  }

  .about-principles {
    grid-template-columns: repeat(2, 1fr);
  }

  .about-audience-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .about-section-head {
    grid-template-columns: 1fr;
    gap: 14px;
  }

  .about-section-head::after {
    display: none;
  }

  .about-hero-tech::before {
    width: 430px;
  }

  .about-hero-tech::after {
    width: 360px;
  }
}

@media (max-width: 760px) {
  .about-container {
    width: min(calc(100% - 32px), var(--about-max));
  }

  .about-hero {
    min-height: auto;
    padding: 65px 0 58px;
  }

  .about-title {
    font-size: clamp(38px, 11vw, 56px);
  }

  .about-hero-description {
    font-size: 13px;
  }

  .about-data-marker-02,
  .about-data-marker-03,
  .about-signal-point-2 {
    display: none;
  }

  .about-hero-tech::before {
    width: 310px;
    left: -20px;
    top: 27%;
  }

  .about-hero-tech::after {
    width: 280px;
    right: -70px;
    top: 72%;
  }

  .about-hero-line {
    width: 230px;
    left: 10%;
  }

  .about-signal {
    padding: 20px;
  }

  .about-stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .about-stat {
    min-height: 96px;
    padding: 19px 17px;
  }

  .about-stat:nth-child(2) {
    border-right: 0;
  }

  .about-stat:nth-child(3) {
    border-left: 1px solid var(--border);
  }

  .about-stat strong {
    font-size: 20px;
  }

  .about-section {
    padding: 62px 0;
  }

  .about-section::after {
    left: 16px;
    right: 16px;
  }

  .about-principles,
  .about-standards-grid,
  .about-audience-grid {
    grid-template-columns: 1fr;
  }

  .about-principle {
    min-height: 190px;
  }

  .about-content-row {
    grid-template-columns: 38px minmax(0, 1fr) 20px;
    gap: 12px;
  }

  .about-content-tag {
    display: none;
  }

  .about-content-list::before {
    left: 38px;
  }

  .about-content-row::after {
    display: none;
  }

  .about-standards {
    padding: 68px 0;
  }

  .about-cta {
    padding: 68px 0 74px;
  }

  .about-cta-inner::before,
  .about-cta-inner::after {
    display: none;
  }

  .about-cta-actions {
    flex-direction: column;
    align-items: stretch;
    max-width: 280px;
    margin-inline: auto;
  }

  .about-button {
    justify-content: center;
  }
}

@media (prefers-reduced-motion: reduce) {
  .about-principle,
  .about-standard,
  .about-audience-card,
  .about-content-row,
  .about-button {
    transition: none;
  }
}
`;

export default function AboutPage() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: styles }} />

      <main className="about-page">
        {/* =====================================================
            HERO
            ===================================================== */}
        <section className="about-hero">
          <div className="about-hero-tech" aria-hidden="true">
            <span className="about-hero-line" />
            <span className="about-data-marker about-data-marker-01">01</span>
            <span className="about-data-marker about-data-marker-02">02</span>
            <span className="about-data-marker about-data-marker-03">03</span>
            <span className="about-signal-point about-signal-point-1" />
            <span className="about-signal-point about-signal-point-2" />
            <span className="about-signal-point about-signal-point-3" />
          </div>

          <div className="about-container about-hero-grid">
            <div className="about-hero-copy">
              <div className="about-kicker">Who we are</div>

              <h1 className="about-title">
                The AI publication that
                <br />
                actually <span>tests</span> before
                <br />
                it tells you.
              </h1>

              <p className="about-hero-description">
                AlloyPress is an independent AI editorial publication covering
                AI tools, SaaS products, automation software, and the news
                shaping how people use them. We research, test where possible,
                explain what matters, and make AI easier to understand.
              </p>
            </div>

            <aside
              className="about-signal"
              aria-label="AlloyPress editorial approach"
            >
              <div className="about-signal-label">
                The AlloyPress standard
              </div>

              <div className="about-signal-row">
                <span className="about-signal-number">01</span>
                <div>
                  <strong>Alloy</strong>
                  <p>
                    A stronger mix of ideas, evidence, testing, and context.
                  </p>
                </div>
              </div>

              <div className="about-signal-row">
                <span className="about-signal-number">02</span>
                <div>
                  <strong>Press</strong>
                  <p>
                    Information shared clearly, honestly, and with useful
                    context.
                  </p>
                </div>
              </div>

              <div className="about-signal-row">
                <span className="about-signal-number">03</span>
                <div>
                  <strong>Together</strong>
                  <p>
                    A practical editorial foundation for making AI less
                    intimidating.
                  </p>
                </div>
              </div>
            </aside>
          </div>
        </section>

        {/* =====================================================
            STATS
            ===================================================== */}
        <section className="about-stats" aria-label="AlloyPress highlights">
          <div className="about-container about-stats-grid">
            <div className="about-stat">
              <strong>3.5M+</strong>
              <span>Impressions in the last 90 days</span>
            </div>

            <div className="about-stat">
              <strong>50+</strong>
              <span>AI tools tested and published</span>
            </div>

            <div className="about-stat">
              <strong>Page 1</strong>
              <span>Google rankings across AI categories</span>
            </div>

            <div className="about-stat">
              <strong>AI-cited</strong>
              <span>Content appearing in AI search experiences</span>
            </div>
          </div>
        </section>

        {/* =====================================================
            MISSION
            ===================================================== */}
        <section className="about-section">
          <div className="about-container">
            <div className="about-section-head">
              <div>
                <div className="about-kicker">Our mission</div>
                <h2>
                  AI info simplified
                  <br />
                  <span className="about-accent">for everyone.</span>
                </h2>
              </div>
            </div>

            <div className="about-principles">
              {principles.map((item) => (
                <article
                  className="about-principle"
                  data-number={item.number}
                  key={item.number}
                >
                  <div className="about-card-meta">
                    {item.number} · {item.label}
                  </div>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* =====================================================
            WHAT WE PUBLISH
            ===================================================== */}
        <section className="about-section about-content-section">
          <div className="about-container">
            <div className="about-section-head">
              <div>
                <div className="about-kicker">What we publish</div>
                <h2>
                  Six types of content,
                  <br />
                  <span className="about-accent">one standard.</span>
                </h2>
              </div>
            </div>

            <div className="about-content-list">
              {contentTypes.map(([number, title, text, tag]) => (
                <article className="about-content-row" key={number}>
                  <div className="about-content-number">{number}</div>

                  <div className="about-content-main">
                    <h3>{title}</h3>
                    <p>{text}</p>
                  </div>

                  <span className="about-content-tag">{tag}</span>
                  <span className="about-content-arrow" aria-hidden="true">
                    ↗
                  </span>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* =====================================================
            EDITORIAL STANDARDS
            ===================================================== */}
        <section className="about-standards">
          <div className="about-container">
            <div className="about-section-head">
              <div>
                <div className="about-kicker">Editorial standards</div>
                <h2>
                  How we
                  <br />
                  <span className="about-accent">maintain trust.</span>
                </h2>
              </div>
            </div>

            <div className="about-standards-grid">
              {standards.map(([number, label, title, text]) => (
                <article className="about-standard" key={number}>
                  <div className="about-standard-meta">
                    {number} · {label}
                  </div>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* =====================================================
            AUDIENCE
            ===================================================== */}
        <section className="about-section about-audience">
          <div className="about-container">
            <div className="about-section-head">
              <div>
                <div className="about-kicker">Our audience</div>
                <h2>
                  Who reads
                  <br />
                  <span className="about-accent">AlloyPress?</span>
                </h2>
              </div>
            </div>

            <div className="about-audience-grid">
              {audiences.map(([icon, title, text]) => (
                <article className="about-audience-card" key={title}>
                  <div className="about-audience-icon" aria-hidden="true">
                    {icon}
                  </div>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* =====================================================
            CTA
            ===================================================== */}
        <section className="about-cta">
          <div className="about-container about-cta-inner">
            <div className="about-kicker">Work with us</div>

            <h2>
              Have an AI tool worth
              <br />
              <span className="about-accent">covering?</span>
            </h2>

            <p>
              Built something in AI or SaaS and think it belongs on AlloyPress?
              Send it our way. We are always interested in useful products worth
              putting through their paces.
            </p>

            <div className="about-cta-actions">
              <Link
                href="/contact-us"
                className="about-button about-button-primary"
              >
                Submit a Tool <span aria-hidden="true">↗</span>
              </Link>

              <Link
                href="/contact-us"
                className="about-button about-button-secondary"
              >
                Get in Touch
              </Link>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
