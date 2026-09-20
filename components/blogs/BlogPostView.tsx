"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  Check,
  Copy,
  FileText,
  Link2,
  ChevronDown,
  Share2,
  Sparkles,
  Send,
  X as LucideX,
} from "lucide-react";

import {
  FaWhatsapp,
  FaLinkedinIn,
  FaXTwitter,
  FaRedditAlien,
  FaPinterestP,
} from "react-icons/fa6";

import "./BlogPostView.css";
type Props = {
  post: any;
  related: any[];
  articleImage: string | null;
  category?: string;
  categoryLabel?: string;
};

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function textFromNodes(nodes: any[] = []): string {
  return nodes
    .map((node) => {
      if (node?.text) return node.text;
      if (node?.children) return textFromNodes(node.children);
      if (node?.fields?.text) return node.fields.text;
      return "";
    })
    .join("");
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 80);
}

function getMedia(value: any): any | null {
  if (!value) return null;

  if (typeof value === "object") {
    if (value.media && typeof value.media === "object") return value.media;
    if (value.value && typeof value.value === "object") return value.value;
    return value;
  }

  return null;
}

function mediaUrl(value: any): string | null {
  const media = getMedia(value);

  if (!media) return null;

  return (
    media.url ||
    media.src ||
    media.publicUrl ||
    media.path ||
    media.filename ||
    media.fields?.url ||
    null
  );
}
const BLOCK_NODE_TYPES = new Set([
  "upload",
  "image",
  "block",
  "quote",
  "blockquote",
  "table",
  "list",
  "listitem",
  "list-item",
  "code",
  "codeBlock",
  "horizontalrule",
  "horizontalRule",
  "hr",
  "video",
  "videoEmbed",
  "videoFile",
  "audio",
]);

function isBlockNode(node: any): boolean {
  if (!node) return false;

  if (BLOCK_NODE_TYPES.has(node.type)) {
    return true;
  }

  /*
   * Some custom migrated blocks may be represented as a generic node
   * containing fields.blockType.
   */
  if (node.fields?.blockType) {
    return true;
  }

  return false;
}

function paragraphContainsBlockNode(children: any[]): boolean {
  return children.some((child) => isBlockNode(child));
}

/*
 * Returns true when the node contains no visible text and is therefore
 * probably an empty migration/editor artefact.
 */
function buildHeadingIndex(
  nodes: any[] = []
): {
  headings: { id: string; text: string; level: 2 }[];
  idsByNode: Map<any, string>;
} {
  const headings: { id: string; text: string; level: 2 }[] = [];
  const idsByNode = new Map<any, string>();
  const usedIds = new Set<string>();

  function walk(items: any[]): void {
    items.forEach((node) => {
      if (!node || typeof node !== "object") return;

      if (node.type === "heading") {
        const rawTag = node.tag || "h2";
        const tag =
          ["h1", "h2", "h3", "h4", "h5", "h6"].includes(rawTag)
            ? rawTag
            : "h2";

        const text = textFromNodes(node.children || []).trim();

        if (text) {
          const baseId = slugify(text) || "section";
          let id = baseId;
          let suffix = 2;

          while (usedIds.has(id)) {
            id = `${baseId}-${suffix}`;
            suffix += 1;
          }

          usedIds.add(id);
          idsByNode.set(node, id);

          // Keep the generated TOC clean: migrated WordPress posts often
          // contain a literal "Table of Contents" H2 that is only an editor
          // artefact. The real TOC is rendered by this page.
          const isGeneratedTocHeading = /^(table\s+of\s+contents|contents)$/i.test(
            text.replace(/[:：]/g, "").trim()
          );

          if (tag === "h2" && !isGeneratedTocHeading) {
            headings.push({
              id,
              text,
              level: 2,
            });
          }
        }
      }

      if (Array.isArray(node.children)) {
        walk(node.children);
      }
    });
  }

  walk(nodes);

  return { headings, idsByNode };
}

function extractSummary(
  nodes: any[] = [],
  excerpt = ""
): string {
  for (const node of nodes) {
    if (
      node?.type === "block" &&
      node?.fields?.blockType === "styledBox"
    ) {
      const heading = node.fields.heading || "";

      if (/t[lI];?dr/i.test(heading)) {
        return node.fields.text || excerpt;
      }
    }

    if (Array.isArray(node?.children)) {
      const found = extractSummary(node.children, "");

      if (found) {
        return found;
      }
    }
  }

  return excerpt || "A practical AlloyPress breakdown of this article.";
}

function cleanEditorialText(value: unknown): string {
  if (typeof value !== "string") return "";

  let text = value
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&hellip;/gi, "…")
    .replace(/\s+/g, " ")
    .trim();

  // Remove migrated WordPress/AI-toolbar UI that was accidentally saved
  // inside the excerpt. Preserve the real TL;DR content that follows it.
  text = text.replace(
    /Ask AI which software may suit your team[\s\S]*?(?=TL;DR\s*:|$)/i,
    ""
  );

  text = text.replace(
    /📋\s*Copied!.*?(?:Copy again\s*[✕×x]?|$)/i,
    ""
  );

  text = text.replace(/^TL;DR\s*:\s*/i, "");
  text = text.replace(/\s*\[…\]\s*$/, "");
  text = text.replace(/\s*\[\.\.\.\]\s*$/, "");
  text = text.replace(/…\s*$/, "");
  text = text.replace(/^[-–—•\s]+/, "");
  text = text.replace(/\s+/g, " ").trim();

  return text;
}

/* -------------------------------------------------------------------------- */
/* Inline renderer                                                            */
/* -------------------------------------------------------------------------- */

function InlineText({ node }: { node: any }) {
  if (!node) return null;

  if (node.type === "link") {
    const url = node.fields?.url || node.url || "#";

    const internal =
      url.startsWith("/") ||
      url.includes("staging1.alloypress.com/blogs/") ||
      url.includes("alloypress.com/blogs/");

    let href = url;

    try {
      if (
        url.includes("staging1.alloypress.com/blogs/") ||
        url.includes("alloypress.com/blogs/")
      ) {
        href = new URL(url).pathname;
      }
    } catch {
      // Keep original URL if parsing fails.
    }

    return (
      <a
        href={href}
        target={internal ? undefined : "_blank"}
        rel={internal ? undefined : "noopener noreferrer"}
        className="post-link"
      >
        {(node.children || []).map((child: any, i: number) => (
          <InlineText key={i} node={child} />
        ))}
      </a>
    );
  }

  if (node.type === "text") {
    const value = node.text || "";
    const format = Number(node.format || 0);

    let content: any = value;

    if (format & 1) {
      content = <strong>{content}</strong>;
    }

    if (format & 2) {
      content = <em>{content}</em>;
    }

    if (format & 4) {
      content = <s>{content}</s>;
    }

    if (format & 8) {
      content = <u>{content}</u>;
    }

    if (format & 16) {
      content = (
        <code className="inline-code">
          {content}
        </code>
      );
    }

    if (format & 32) {
      content = <sub>{content}</sub>;
    }

    if (format & 64) {
      content = <sup>{content}</sup>;
    }
    return <span>{content}</span>;
  }

  return null;
}

/* -------------------------------------------------------------------------- */
/* Main Lexical renderer                                                      */
/* -------------------------------------------------------------------------- */

function isInlineArticleTocList(node: any): boolean {
  if (!node || node.type !== "list") return false;

  const items = Array.isArray(node.children) ? node.children : [];
  if (!items.length) return false;

  let linkedItems = 0;
  let totalItems = 0;

  for (const item of items) {
    if (!item || !Array.isArray(item.children)) continue;
    totalItems += 1;

    const hasInternalAnchor = item.children.some((child: any) => {
      const href = child?.fields?.url || child?.url || "";
      return child?.type === "link" && typeof href === "string" && href.startsWith("#");
    });

    if (hasInternalAnchor) linkedItems += 1;
  }

  return totalItems > 0 && linkedItems === totalItems;
}

function RenderNode({
  node,
  index,
  headingIds,
}: {
  node: any;
  index: number;
  headingIds?: Map<any, string>;
}) {
  if (!node) return null;

  const type = node.type;

  /* ---------------------------------------------------------------------- */
  /* Inline nodes                                                            */
  /* ---------------------------------------------------------------------- */

  if (type === "text" || type === "link") {
    return <InlineText node={node} />;
  }

  /* ---------------------------------------------------------------------- */
  /* Paragraph                                                               */
  /* ---------------------------------------------------------------------- */

  if (type === "paragraph") {
    const children = Array.isArray(node.children)
      ? node.children
      : [];

    const text = textFromNodes(children).trim();

    /*
     * Empty paragraphs and migration artefacts.
     */
    if (!text && !children.some(isBlockNode)) {
      return null;
    }

    if (/^📋\s*Copied!/i.test(text)) {
      return null;
    }

    if (/^Table of Contents/i.test(text)) {
      return null;
    }

    if (paragraphContainsBlockNode(children)) {
      return (
        <>
          {children.map((child: any, i: number) => (
            <RenderNode
              key={`${index}-${i}`}
              node={child}
              index={i}
              headingIds={headingIds}
            />
          ))}
        </>
      );
    }

    const format = node.format;
    const isFaqQuestion = node.__faqQuestion === true;

    return (
      <p
        className={`post-p${isFaqQuestion ? " post-faq-question" : ""}`}
        style={
          format && format !== ""
            ? { textAlign: format as any }
            : undefined
        }
      >
        {children.map((child: any, i: number) => (
          <RenderNode
            key={`${index}-${i}`}
            node={child}
            index={i}
            headingIds={headingIds}
          />
        ))}
      </p>
    );
  }

  /* ---------------------------------------------------------------------- */
  /* Heading                                                                 */
  /* ---------------------------------------------------------------------- */

  if (type === "heading") {
    const text = textFromNodes(
      node.children || []
    ).trim();

    if (!text) return null;

    const id =
      headingIds?.get(node) ||
      slugify(text) ||
      "section";

    const tag =
      ["h1", "h2", "h3", "h4", "h5", "h6"].includes(
        node.tag
      )
        ? node.tag
        : "h2";

    /*
     * The article title is already the page H1.
     * Migrated content H1s become H2s.
     */
    const Tag = tag === "h1" ? "h2" : tag;

    return (
      <Tag
        id={id}
        className={`post-${Tag}`}
      >
        {(node.children || []).map(
          (child: any, i: number) => (
            <RenderNode
              key={i}
              node={child}
              index={i}
              headingIds={headingIds}
            />
          )
        )}
      </Tag>
    );
  }

  /* ---------------------------------------------------------------------- */
  /* Lists                                                                   */
  /* ---------------------------------------------------------------------- */

  if (type === "list") {
    const Tag =
      node.listType === "number" ||
        node.tag === "ol"
        ? "ol"
        : "ul";

    const items = node.children || [];

    const isToc = isInlineArticleTocList(node);

    return (
      <Tag className={`post-list${isToc ? " post-inline-toc" : ""}`}>
        {items.map(
          (item: any, i: number) => (
            <li key={i}>
              {(item.children || []).map(
                (child: any, j: number) => (
                  <RenderNode
                    key={j}
                    node={child}
                    index={j}
                    headingIds={headingIds}
                  />
                )
              )}
            </li>
          )
        )}
      </Tag>
    );
  }

  if (
    type === "listitem" ||
    type === "list-item"
  ) {
    return (
      <li>
        {(node.children || []).map(
          (child: any, i: number) => (
            <RenderNode
              key={i}
              node={child}
              index={i}
              headingIds={headingIds}
            />
          )
        )}
      </li>
    );
  }

  /* ---------------------------------------------------------------------- */
  /* Images / uploads                                                        */
  /* ---------------------------------------------------------------------- */

  if (
    type === "upload" ||
    type === "image"
  ) {
    const media = getMedia(
      node.value ||
      node.fields?.media ||
      node.fields?.value ||
      node.media ||
      node.fields?.image ||
      node.image
    );

    const url = mediaUrl(media);

    if (!url) return null;

    return (
      <figure className="post-figure">
        <div className="post-image-frame">
          <img
            src={url}
            alt={
              media?.alt ||
              media?.title ||
              "AlloyPress article image"
            }
            width={media?.width || undefined}
            height={media?.height || undefined}
            loading="lazy"
            decoding="async"
          />
        </div>

        {media?.caption ? (
          <figcaption>
            {media.caption}
          </figcaption>
        ) : null}
      </figure>
    );
  }

  /* ---------------------------------------------------------------------- */
  /* Quote                                                                   */
  /* ---------------------------------------------------------------------- */

  if (
    type === "quote" ||
    type === "blockquote"
  ) {
    return (
      <blockquote className="post-quote">
        {(node.children || []).map(
          (child: any, i: number) => (
            <RenderNode
              key={i}
              node={child}
              index={i}
              headingIds={headingIds}
            />
          )
        )}
      </blockquote>
    );
  }

  /* ---------------------------------------------------------------------- */
  /* Code                                                                    */
  /* ---------------------------------------------------------------------- */

  if (
    type === "code" ||
    type === "codeBlock"
  ) {
    const fields = node.fields || node;

    const code =
      fields.code ||
      textFromNodes(node.children || []);

    return (
      <div className="post-code">
        <pre>
          <code>{code}</code>
        </pre>
      </div>
    );
  }

  /* ---------------------------------------------------------------------- */
  /* Table                                                                   */
  /* ---------------------------------------------------------------------- */

  if (type === "table") {
    const rows = Array.isArray(node.children) ? node.children : [];
    const columnCount = rows.reduce(
      (max: number, row: any) =>
        Math.max(max, Array.isArray(row?.children) ? row.children.length : 0),
      0
    );

    return (
      <div className="table-scroll">
        <table className="post-table">
          {columnCount > 0 ? (
            <colgroup>
              <col className="table-label-col" />
              {Array.from({ length: Math.max(columnCount - 1, 0) }).map((_, i) => (
                <col key={i} />
              ))}
            </colgroup>
          ) : null}
          <tbody>
            {rows.map(
              (row: any, r: number) => (
                <tr key={r}>
                  {(row.children || []).map(
                    (cell: any, c: number) => {
                      const Cell =
                        cell.headerState || r === 0
                          ? "th"
                          : "td";

                      return (
                        <Cell
                          key={c}
                          className={`${cell.headerState ? "table-head" : ""}${c === 0 ? " table-label-cell" : ""}`.trim()}
                        >
                          {(cell.children || []).map(
                            (
                              child: any,
                              i: number
                            ) => (
                              <RenderNode
                                key={i}
                                node={child}
                                index={i}
                                headingIds={headingIds}
                              />
                            )
                          )}
                        </Cell>
                      );
                    }
                  )}
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>
    );
  }

  /* ---------------------------------------------------------------------- */
  /* Horizontal rule                                                         */
  /* ---------------------------------------------------------------------- */

  if (
    type === "horizontalrule" ||
    type === "horizontalRule" ||
    type === "hr"
  ) {
    return (
      <hr className="post-rule" />
    );
  }

  /* ---------------------------------------------------------------------- */
  /* Line break                                                              */
  /* ---------------------------------------------------------------------- */

  if (
    type === "linebreak" ||
    type === "lineBreak"
  ) {
    return <br />;
  }

  /* ---------------------------------------------------------------------- */
  /* Custom blocks                                                           */
  /* ---------------------------------------------------------------------- */

  if (type === "block") {
    const fields = node.fields || {};
    const blockType =
      fields.blockType ||
      node.blockType;

    /* Styled box */
    if (blockType === "styledBox") {
      const heading =
        fields.heading || "";

      const body =
        fields.text || "";

      return (
        <aside className="styled-box">
          {heading ? (
            <div className="styled-box-label">
              {heading}
            </div>
          ) : null}

          {body ? (
            <div className="styled-box-body">
              {body}
            </div>
          ) : null}
        </aside>
      );
    }

    /* CTA */
    if (blockType === "ctaButton") {
      const href =
        fields.url || "#";

      const external =
        /^https?:\/\//i.test(href);

      return (
        <div className="cta-wrap">
          <a
            href={href}
            className="article-cta"
            target={
              external
                ? "_blank"
                : undefined
            }
            rel={
              external
                ? "noopener noreferrer"
                : undefined
            }
          >
            {fields.label ||
              "Try this tool →"}
          </a>
        </div>
      );
    }

    /* YouTube / video embed */
    if (
      blockType === "videoEmbed"
    ) {
      const url =
        fields.url || "";

      if (!url) return null;

      return (
        <figure className="post-video">
          <div className="post-video-frame">
            <iframe
              src={url}
              title={
                fields.caption ||
                "AlloyPress article video"
              }
              loading="lazy"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>

          {fields.caption ? (
            <figcaption>
              {fields.caption}
            </figcaption>
          ) : null}
        </figure>
      );
    }

    /* Uploaded video */
    if (
      blockType === "videoFile"
    ) {
      const media = getMedia(
        fields.video
      );

      const url =
        mediaUrl(media);

      if (!url) return null;

      return (
        <figure className="post-video">
          <div className="post-video-frame">
            <video
              controls
              preload="metadata"
              playsInline
              src={url}
            >
              Your browser does not support
              the video element.
            </video>
          </div>

          {fields.caption ? (
            <figcaption>
              {fields.caption}
            </figcaption>
          ) : null}
        </figure>
      );
    }

    /* Audio */
    if (blockType === "audio") {
      const media = getMedia(
        fields.audio
      );

      const url =
        mediaUrl(media);

      if (!url) return null;

      return (
        <figure className="post-audio">
          {fields.title ? (
            <div className="post-audio-title">
              {fields.title}
            </div>
          ) : null}

          <audio
            controls
            preload="metadata"
            src={url}
          >
            Your browser does not support
            the audio element.
          </audio>

          {fields.caption ? (
            <figcaption>
              {fields.caption}
            </figcaption>
          ) : null}
        </figure>
      );
    }

    /*
     * Future/custom blocks:
     * keep their children instead of silently
     * deleting article content.
     */
    if (Array.isArray(node.children)) {
      return (
        <div className="unknown-block">
          {node.children.map(
            (child: any, i: number) => (
              <RenderNode
                key={i}
                node={child}
                index={i}
                headingIds={headingIds}
              />
            )
          )}
        </div>
      );
    }

    return null;
  }

  /* ---------------------------------------------------------------------- */
  /* Generic children                                                        */
  /* ---------------------------------------------------------------------- */

  if (Array.isArray(node.children)) {
    return (
      <>
        {node.children.map(
          (child: any, i: number) => (
            <RenderNode
              key={i}
              node={child}
              index={i}
              headingIds={headingIds}
            />
          )
        )}
      </>
    );
  }

  return null;
}


function normalizeArticleContent(nodes: any[] = []): any[] {
  const normalized: any[] = [];
  let inFaqSection = false;

  nodes.forEach((node: any) => {
    if (!node || typeof node !== "object") return;

    if (
      node.type === "paragraph" &&
      (!Array.isArray(node.children) || node.children.length === 0)
    ) {
      return;
    }

    if (node.type === "paragraph") {
      const inlineChildren: any[] = [];
      const paragraphText = textFromNodes(node.children || []).trim();
      const faqQuestion = inFaqSection && /\?\s*$/.test(paragraphText);

      (node.children || []).forEach((child: any) => {
        if (isBlockNode(child)) {
          if (inlineChildren.length) {
            normalized.push({
              ...node,
              ...(faqQuestion ? { __faqQuestion: true } : {}),
              children: [...inlineChildren],
            });
            inlineChildren.length = 0;
          }

          normalized.push(child);
        } else {
          inlineChildren.push(child);
        }
      });

      if (inlineChildren.length) {
        normalized.push({
          ...node,
          ...(faqQuestion ? { __faqQuestion: true } : {}),
          children: inlineChildren,
        });
      }

      return;
    }

    if (node.type === "heading") {
      const headingText = textFromNodes(node.children || []).trim();
      const headingTag = node.tag || "h2";

      if (/^h[1-6]$/i.test(headingTag)) {
        if (/frequently asked questions|^faq$/i.test(headingText)) {
          inFaqSection = true;
        } else if (headingTag.toLowerCase() === "h2") {
          inFaqSection = false;
        }
      }
    }

    if (Array.isArray(node.children)) {
      normalized.push({
        ...node,
        children: node.children.filter(
          (child: any) => child && typeof child === "object"
        ),
      });
      return;
    }

    normalized.push(node);
  });

  return normalized;
}

/* -------------------------------------------------------------------------- */
/* Article renderer                                                           */
/* -------------------------------------------------------------------------- */

function ArticleRenderer({
  content,
  headingIds,
}: {
  content: any;
  headingIds: Map<any, string>;
}) {
  const children = normalizeArticleContent(
    content?.root?.children || []
  );
  return (
    <div className="post-content">
      {children.map(
        (node: any, i: number) => (
          <RenderNode
            key={i}
            node={node}
            index={i}
            headingIds={headingIds}
          />
        )
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Page                                                                       */
/* -------------------------------------------------------------------------- */

export default function BlogPostView({
  post,
  related,
  articleImage,
  category = "blogs",
  categoryLabel = "Blogs"
}: Props) {
  const [aiOpen, setAiOpen] =
    useState(false);

  const [shareOpen, setShareOpen] =
    useState(false);

  const [copied, setCopied] =
    useState(false);

  const [articleUrl, setArticleUrl] =
    useState("");

  const [tocOpen, setTocOpen] = useState(false);
  const [desktopTocOpen, setDesktopTocOpen] = useState(true);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    setArticleUrl(window.location.href);
  }, []);

  useEffect(() => {
    if (!shareOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setShareOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [shareOpen]);

  useEffect(() => {
    if (!tocOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setTocOpen(false);
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [tocOpen]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 821px)");

    const updateViewport = () => {
      setIsDesktop(mediaQuery.matches);
    };

    updateViewport();
    mediaQuery.addEventListener("change", updateViewport);

    return () => {
      mediaQuery.removeEventListener("change", updateViewport);
    };
  }, []);

  const nodes =
    post?.content?.root?.children || [];

  const headingIndex = useMemo(
    () => buildHeadingIndex(nodes),
    [nodes]
  );

  const headings = headingIndex.headings;
  const headingIds = headingIndex.idsByNode;

  const excerpt = useMemo(
    () => cleanEditorialText(post?.excerpt),
    [post?.excerpt]
  );

  const summary = useMemo(
    () =>
      cleanEditorialText(
        extractSummary(nodes, excerpt)
      ),
    [nodes, excerpt]
  );

  const categoryName =
    typeof post?.category === "object"
      ? post.category?.name ||
      "Article"
      : "Article";

  const date = post?.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
    : "";

  const rawUpdatedAt =
    post?.legacy?.wordpressModifiedAt || post?.updatedAt;

  const updatedDate = rawUpdatedAt
    ? new Date(rawUpdatedAt).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
    : "";

  // Only show "Updated" if it's meaningfully after publish (avoid showing
  // "Updated" for the same-day migration/save that created the post).
  const showUpdatedDate =
    Boolean(post?.publishedAt) &&
    Boolean(rawUpdatedAt) &&
    new Date(rawUpdatedAt).getTime() -
    new Date(post.publishedAt).getTime() >
    24 * 60 * 60 * 1000;

  function openShareWindow(url: string) {
    const shareWindow = window.open(
      url,
      "alloypress-share",
      "noopener,noreferrer,width=720,height=640,resizable=yes,scrollbars=yes"
    );

    if (shareWindow) {
      shareWindow.opener = null;
    }

    setShareOpen(false);
  }

  async function copyArticleLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
      setShareOpen(false);
    } catch {
      setCopied(false);
    }
  }

  function shareOnWhatsApp() {
    const url = `https://wa.me/?text=${encodeURIComponent(
      window.location.href
    )}`;

    openShareWindow(url);
  }

  function shareOnLinkedIn() {
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
      window.location.href
    )}`;

    openShareWindow(url);
  }

  function shareOnX() {
    const url = `https://twitter.com/intent/tweet?url=${encodeURIComponent(
      window.location.href
    )}`;

    openShareWindow(url);
  }

  function shareOnReddit() {
    const url = `https://www.reddit.com/submit?url=${encodeURIComponent(
      window.location.href
    )}`;

    openShareWindow(url);
  }

  function shareOnPinterest() {
    const url = `https://www.pinterest.com/pin/create/button/?url=${encodeURIComponent(
      window.location.href
    )}`;

    openShareWindow(url);
  }

  function toggleToc() {
    if (window.matchMedia("(min-width: 821px)").matches) {
      setDesktopTocOpen((value) => !value);
      return;
    }

    setTocOpen((value) => !value);
  }

  function handleTocKeyDown(
    event: React.KeyboardEvent<HTMLButtonElement>
  ) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      toggleToc();
    }
  }

  return (
    <>

      <main className="single-post">
        {/* ---------------------------------------------------------------- */}
        {/* Editorial hero                                                   */}
        {/* ---------------------------------------------------------------- */}
        <nav className="post-breadcrumb" aria-label="Breadcrumb">
          <a href="/">Home</a>
          <span className="post-breadcrumb-sep">/</span>
          <a href={`/${category}`}>{categoryLabel}</a>
          <span className="post-breadcrumb-sep">/</span>
          <span className="post-breadcrumb-current">{post?.title}</span>
        </nav>
        <header className="post-hero">
          <div className="post-shell">
            <div className="post-hero-inner">
              <div className="post-kicker">
                <i />
                {categoryName} · AlloyPress
              </div>

              <h1 className="post-title">
                {post?.title}
              </h1>

              {excerpt ? (
                <p className="post-excerpt">
                  {excerpt}
                </p>
              ) : null}

              <div className="post-byline">
                <Link
                  href="/author/alloypress-team"
                  className="post-author-link"
                >
                  <span className="author-dot">
                    <Image
                      src="/ap-icon.png"
                      alt="AlloyPress"
                      width={32}
                      height={32}
                    />
                  </span>

                  <span>By AlloyPress Team</span>
                </Link>
              </div>

              {/* Date */}
              <div className="post-date-row">
                {showUpdatedDate ? (
                  <span>Updated at : {updatedDate}</span>
                ) : date ? (
                  <span>Published at : {date}</span>
                ) : null}
              </div>

              {/* Featured image */}
              {articleImage ? (
                <figure className="hero-image">
                  <img
                    src={articleImage}
                    alt={
                      post?.featuredImage?.alt ||
                      post?.title ||
                      "AlloyPress article image"
                    }
                  />
                </figure>
              ) : null}
            </div>
          </div>
        </header>

        {/* ---------------------------------------------------------------- */}
        {/* Main three-column reading workspace                               */}
        {/* ---------------------------------------------------------------- */}

        <div className="post-shell">
          <div className="post-layout">
            {tocOpen ? (
              <div
                className="mobile-toc-backdrop"
                role="presentation"
                onMouseDown={(event) => {
                  if (event.currentTarget === event.target) {
                    setTocOpen(false);
                  }
                }}
              >
                <div
                  id="mobile-article-toc"
                  className="mobile-toc-sheet"
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby="mobile-toc-title"
                >
                  <div className="mobile-toc-header">
                    <div>
                      <div className="mobile-toc-kicker">Article navigation</div>
                      <h2 id="mobile-toc-title">Table of Contents</h2>
                    </div>

                    <button
                      type="button"
                      className="mobile-toc-close"
                      aria-label="Close table of contents"
                      onClick={() => setTocOpen(false)}
                    >
                      <LucideX aria-hidden="true" />
                    </button>
                  </div>

                  {headings.length ? (
                    <nav
                      className="mobile-toc-list"
                      aria-label="Article sections"
                    >
                      {headings.map((item, i) => (
                        <a
                          key={`${item.id}-${i}`}
                          href={`#${item.id}`}
                          className="mobile-toc-link"
                          onClick={() => setTocOpen(false)}
                        >
                          <span className="mobile-toc-number">
                            {String(i + 1).padStart(2, "0")}
                          </span>

                          <span className="mobile-toc-text">
                            {item.text}
                          </span>
                        </a>
                      ))}
                    </nav>
                  ) : (
                    <div className="mobile-toc-empty">
                      Article sections will appear here.
                    </div>
                  )}
                </div>
              </div>
            ) : null}
            {/* Left: compact sticky TOC */}
            <aside
              className={`toc${tocOpen ? " mobile-open" : ""
                }${desktopTocOpen ? "" : " desktop-toc-collapsed"
                }`}
              data-open={tocOpen}
              aria-label="Table of contents"
            >
              <div className="toc-card">
                <button
                  type="button"
                  className="toc-header"
                  aria-expanded={isDesktop ? desktopTocOpen : tocOpen}
                  aria-controls="article-toc-list"
                  onClick={toggleToc}
                  onKeyDown={handleTocKeyDown}
                >
                  <span>Table of Contents</span>
                  <ChevronDown
                    aria-hidden="true"
                    className={
                      (isDesktop ? desktopTocOpen : tocOpen)
                        ? "toc-chevron-open"
                        : ""
                    }
                  />
                </button>

                {headings.length ? (
                  <nav
                    id="article-toc-list"
                    className="toc-list"
                    aria-label="Article sections"
                  >
                    {headings.map((item, i) => (
                      <a
                        key={`${item.id}-${i}`}
                        href={`#${item.id}`}
                        className="toc-link"
                        onClick={() => {
                          if (!isDesktop) {
                            setTocOpen(false);
                          }
                        }}
                      >
                        <span className="toc-bullet" aria-hidden="true">•</span>
                        <span>{item.text}</span>
                      </a>
                    ))}
                  </nav>
                ) : (
                  <div className="toc-empty">Article sections will appear here.</div>
                )}
              </div>
            </aside>
            {/* Center: article */}
            <article className="article-column">
              <div className="summary-box">
                <h3>ALLOYPRESS AI SUMMARY</h3>
                <p>{summary}</p>
              </div>

              <ArticleRenderer
                content={post?.content}
                headingIds={headingIds}
              />

              <div className="article-end">
                <div className="side-label">Article tags</div>

                <div className="tag-row">
                  {(post?.tags || [])
                    .slice(0, 8)
                    .map((tag: any, i: number) => (
                      <span className="tag" key={i}>
                        {typeof tag === "string"
                          ? tag
                          : tag?.name ||
                          tag?.slug ||
                          "AI"}
                      </span>
                    ))}
                </div>
              </div>
            </article>

            {/* Right: trust / share / AI tools */}
            <aside
              className="article-sidebar"
              aria-label="Article tools"
            >

              <div className="sidebar-card">
                <div className="side-label">Share article</div>

                <button
                  type="button"
                  className="share-trigger"
                  aria-haspopup="dialog"
                  aria-expanded={shareOpen}
                  onClick={() => setShareOpen(true)}
                >
                  <span className="share-trigger-label">
                    <Share2 aria-hidden="true" />
                    Share
                  </span>
                </button>
              </div>

              <div className="sidebar-card ai-tools-card">
                <div className="side-label">AI tools</div>

                <div className="ai-options">
                  <button
                    type="button"
                    className="ai-option"
                    onClick={() => setAiOpen(true)}
                  >
                    <span>Ask AI</span>
                    <Sparkles aria-hidden="true" />
                  </button>
                </div>
              </div>
              <div className="sidebar-card mobile-toc-card">
                <div className="side-label">Article navigation</div>

                <button
                  type="button"
                  className="mobile-toc-trigger"
                  aria-haspopup="dialog"
                  aria-expanded={tocOpen}
                  aria-controls="mobile-article-toc"
                  onClick={() => setTocOpen(true)}
                >
                  <span className="mobile-toc-trigger-label">
                    <FileText aria-hidden="true" />
                    <span>TOC</span>
                  </span>
                </button>
              </div>
            </aside>
          </div>
        </div >

        {/* ---------------------------------------------------------------- */}
        {/* Related articles                                                 */}
        {/* ---------------------------------------------------------------- */}

        {
          related?.length ? (
            <section className="related">
              <div className="post-shell">
                <div className="section-head">
                  <div>
                    <div className="side-label">Keep exploring</div>
                    <h2>Related articles</h2>
                  </div>

                  <a
                    href={`/${category}`}
                    className="related-view-all"
                  >
                    View all →
                  </a>
                </div>

                <div className="related-grid">
                  {related.map((item: any) => {
                    const relatedImage =
                      mediaUrl(item.featuredImage);

                    return (
                      <a
                        className="related-card"
                        href={`/${typeof item.category === "object" ? item.category?.slug || category : category}/${item.slug}`}
                        key={item.id}
                      >
                        {relatedImage ? (
                          <div className="related-image">
                            <img
                              src={relatedImage}
                              alt={item.title || "Related article"}
                              loading="lazy"
                              decoding="async"
                            />
                          </div>
                        ) : null}

                        <div className="related-body">
                          <div className="related-cat">
                            {typeof item.category === "object"
                              ? item.category?.name || category
                              : category}
                          </div>

                          <h3>{item.title}</h3>
                        </div>
                      </a>
                    );
                  })}
                </div>
              </div>
            </section>
          ) : null
        }

        {/* ---------------------------------------------------------------- */}
        {/* Desktop AI launcher                                               */}
        {/* ---------------------------------------------------------------- */}

        {isDesktop ? (
          <button
            type="button"
            className="desktop-ai-fab"
            aria-label={
              aiOpen
                ? "Close Alloy AI assistant"
                : "Open Alloy AI assistant"
            }
            aria-haspopup="dialog"
            aria-expanded={aiOpen}
            aria-controls="alloy-ai-panel"
            onClick={() => setAiOpen((open) => !open)}
          >
            <Sparkles aria-hidden="true" />
            <span className="desktop-ai-fab-label">
              Ask AI
            </span>
          </button>
        ) : null}

        {/* ---------------------------------------------------------------- */}
        {/* Share dialog                                                     */}
        {/* ---------------------------------------------------------------- */}

        {
          shareOpen ? (
            <div
              className="share-modal-backdrop"
              role="presentation"
              onMouseDown={(event) => {
                if (event.currentTarget === event.target) {
                  setShareOpen(false);
                }
              }}
            >
              <div
                className="share-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="share-modal-title"
              >
                <div className="share-modal-header">
                  <div>
                    <div className="share-modal-kicker">AlloyPress</div>
                    <h3 id="share-modal-title">Share this article</h3>
                  </div>

                  <button
                    type="button"
                    className="share-modal-close"
                    aria-label="Close share dialog"
                    onClick={() => setShareOpen(false)}
                  >
                    <LucideX aria-hidden="true" />
                  </button>
                </div>

                <div className="share-modal-options">

                  {/* WhatsApp */}
                  <button
                    type="button"
                    className="share-option share-option-primary"
                    onClick={shareOnWhatsApp}
                  >
                    <FaWhatsapp aria-hidden="true" />
                    <span>WhatsApp</span>
                  </button>

                  {/* LinkedIn */}
                  <button
                    type="button"
                    className="share-option"
                    onClick={shareOnLinkedIn}
                  >
                    <FaLinkedinIn aria-hidden="true" />
                    <span>LinkedIn</span>
                  </button>

                  {/* X */}
                  <button
                    type="button"
                    className="share-option"
                    onClick={shareOnX}
                  >
                    <FaXTwitter aria-hidden="true" />
                    <span>Share on X</span>
                  </button>

                  {/* Reddit */}
                  <button
                    type="button"
                    className="share-option"
                    onClick={shareOnReddit}
                  >
                    <FaRedditAlien aria-hidden="true" />
                    <span>Reddit</span>
                  </button>

                  {/* Pinterest */}
                  <button
                    type="button"
                    className="share-option"
                    onClick={shareOnPinterest}
                  >
                    <FaPinterestP aria-hidden="true" />
                    <span>Pinterest</span>
                  </button>

                  {/* Copy link */}
                  <button
                    type="button"
                    className="share-option"
                    onClick={copyArticleLink}
                  >
                    {copied ? (
                      <Check aria-hidden="true" />
                    ) : (
                      <Copy aria-hidden="true" />
                    )}

                    <span>
                      {copied ? "Link copied" : "Copy link"}
                    </span>
                  </button>

                </div>
                <div className="share-modal-url">
                  <Link2 aria-hidden="true" />
                  <span title={articleUrl}>{articleUrl || "Article link"}</span>
                </div>
              </div>
            </div>
          ) : null
        }

        {/* ---------------------------------------------------------------- */}
        {/* AI dialog                                                         */}
        {/* ---------------------------------------------------------------- */}

        {
          aiOpen ? (
            <div
              id="alloy-ai-panel"
              className="ai-panel"
              role="dialog"
              aria-modal="false"
              aria-labelledby="alloy-ai-title"
            >
              {/* Header */}
              <div className="ai-panel-header">
                <div className="ai-panel-heading">
                  <div className="ai-panel-icon" aria-hidden="true">
                    <Sparkles />
                  </div>

                  <div>
                    <h3 id="alloy-ai-title">Ask AI</h3>
                    <span>Article assistant</span>
                  </div>
                </div>

                <button
                  type="button"
                  className="ai-close"
                  aria-label="Close Alloy AI assistant"
                  onClick={() => setAiOpen(false)}
                >
                  <LucideX aria-hidden="true" />
                </button>
              </div>

              {/* Intro */}
              <div className="ai-intro">
                <p>
                  Ask questions about this article and get quick,
                  easy-to-understand answers.
                </p>
              </div>

              {/* Quick take */}
              <div className="ai-answer">
                <div className="ai-answer-label">
                  <Sparkles aria-hidden="true" />
                  <span>Quick take</span>
                </div>

                <p>{summary}</p>
              </div>

              {/* Suggested questions */}
              <div className="ai-suggestions">
                <div className="ai-section-label">
                  Try asking
                </div>

                <button type="button" className="ai-suggestion">
                  What are the key takeaways?
                </button>

                <button type="button" className="ai-suggestion">
                  Which option is best?
                </button>

                <button type="button" className="ai-suggestion">
                  Give me a short summary
                </button>

                <button type="button" className="ai-suggestion">
                  Who should use this?
                </button>
              </div>

              {/* Question input */}
              <div className="ai-input-wrap">
                <input
                  type="text"
                  className="ai-input"
                  placeholder="Ask about this article..."
                  aria-label="Ask about this article"
                  disabled
                />

                <button
                  type="button"
                  className="ai-send"
                  aria-label="Send question"
                  disabled
                >
                  <Send aria-hidden="true" />
                </button>
              </div>

              {/* Temporary status until API is connected */}
              <div className="ai-powered-note">
                <span className="ai-status-dot" />
                AI answers will be connected here.
              </div>
            </div>
          ) : null
        }
      </main >
    </>
  );
}
