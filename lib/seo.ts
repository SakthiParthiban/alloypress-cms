import type { Metadata } from "next";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  "https://alloypress-web.vercel.app";

function normalizePath(pathname: string) {
  if (!pathname) return "/";
  if (pathname === "/") return "/";
  return pathname.startsWith("/")
    ? pathname
    : `/${pathname}`;
}

export function canonicalUrl(pathname: string) {
  return new URL(
    normalizePath(pathname),
    `${SITE_URL}/`,
  ).toString();
}

export function createPageMetadata(
  pathname: string,
  metadata: Pick<
    Metadata,
    "title" | "description"
  >,
): Metadata {
  return {
    ...metadata,
    alternates: {
      canonical: canonicalUrl(pathname),
    },
  };
}