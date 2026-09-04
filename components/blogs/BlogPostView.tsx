"use client";

import { useMemo, useState, type CSSProperties } from "react";

type Props = {
  post: any;
  related: any[];
  articleImage: string | null;
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
    return value;
  }

  return null;
}

function mediaUrl(value: any): string | null {
  const media = getMedia(value);

  if (!media) return null;

  return media.url || media.src || media.filename || null;
}

/*
 * IMPORTANT:
 *
 * Lexical paragraphs normally contain inline content:
 *
 *   <p>text</p>
 *
 * But migrated WordPress content can contain block content inside a
 * paragraph node:
 *
 *   paragraph
 *      └── upload
 *             └── figure
 *
 * That would produce:
 *
 *   <p><figure>...</figure></p>
 *
 * which is invalid HTML and causes React hydration errors.
 *
 * Any node listed here must NEVER be wrapped by a paragraph.
 */
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
function hasVisibleText(node: any): boolean {
  if (!node) return false;

  if (typeof node.text === "string" && node.text.trim()) {
    return true;
  }

  if (Array.isArray(node.children)) {
    return node.children.some(hasVisibleText);
  }

  if (typeof node.fields?.text === "string" && node.fields.text.trim()) {
    return true;
  }

  return false;
}

function collectHeadings(
  nodes: any[] = []
): { id: string; text: string; level: number }[] {
  const result: { id: string; text: string; level: number }[] = [];

  function walk(items: any[]): void {
    items.forEach((node) => {
      if (node?.type === "heading") {
        const text = textFromNodes(node.children || []).trim();

        if (text) {
          result.push({
            id: `${slugify(text)}-${result.length}`,
            text,
            level:
              node.tag === "h3"
                ? 3
                : node.tag === "h4"
                  ? 4
                  : 2,
          });
        }
      }

      if (Array.isArray(node?.children)) {
        walk(node.children);
      }
    });
  }

  walk(nodes);

  return result;
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

    const state = node.$ || node.state || {};

    const style: CSSProperties = {};

    if (
      node.color ||
      node.textColor ||
      state.color ||
      state.textColor
    ) {
      style.color =
        node.color ||
        node.textColor ||
        state.color ||
        state.textColor;
    }

    if (
      node.backgroundColor ||
      state.backgroundColor
    ) {
      style.backgroundColor =
        node.backgroundColor ||
        state.backgroundColor;
    }

    if (node.fontSize || state.fontSize) {
      const size = node.fontSize || state.fontSize;

      style.fontSize =
        typeof size === "number"
          ? `${size}px`
          : size;
    }

    if (node.fontFamily || state.fontFamily) {
      style.fontFamily =
        node.fontFamily || state.fontFamily;
    }

    return (
      <span style={style}>
        {content}
      </span>
    );
  }

  return null;
}

/* -------------------------------------------------------------------------- */
/* Main Lexical renderer                                                      */
/* -------------------------------------------------------------------------- */

function RenderNode({
  node,
  index,
}: {
  node: any;
  index: number;
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

    /*
     * CRITICAL FIX
     *
     * If a paragraph contains a block node such as:
     *
     * paragraph
     *   └── upload
     *        └── figure
     *
     * DO NOT return:
     *
     * <p>
     *   <RenderNode upload />
     * </p>
     *
     * because upload returns <figure>.
     *
     * Instead return the children directly.
     */
    if (paragraphContainsBlockNode(children)) {
      return (
        <>
          {children.map((child: any, i: number) => (
            <RenderNode
              key={`${index}-${i}`}
              node={child}
              index={i}
            />
          ))}
        </>
      );
    }

    const format = node.format;

    return (
      <p
        className="post-p"
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

    const id = `${slugify(text)}-${index}`;

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

    /*
     * Hide old WordPress-generated TOC lists.
     */
    const isToc =
      items.length > 0 &&
      items.every((item: any) => {
        const link = (
          item?.children || []
        ).find(
          (x: any) => x?.type === "link"
        );

        const href =
          link?.fields?.url ||
          link?.url ||
          "";

        return href.startsWith("#");
      });

    if (isToc) {
      return null;
    }

    return (
      <Tag className="post-list">
        {items.map(
          (item: any, i: number) => (
            <li key={i}>
              {(item.children || []).map(
                (child: any, j: number) => (
                  <RenderNode
                    key={j}
                    node={child}
                    index={j}
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
        node.media
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
    return (
      <div className="table-scroll">
        <table className="post-table">
          <tbody>
            {(node.children || []).map(
              (row: any, r: number) => (
                <tr key={r}>
                  {(row.children || []).map(
                    (cell: any, c: number) => {
                      const Cell =
                        cell.headerState
                          ? "th"
                          : "td";

                      return (
                        <Cell
                          key={c}
                          className={
                            cell.headerState
                              ? "table-head"
                              : undefined
                          }
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
            />
          )
        )}
      </>
    );
  }

  return null;
}

/* -------------------------------------------------------------------------- */
/* Article renderer                                                           */
/* -------------------------------------------------------------------------- */

function ArticleRenderer({
  content,
}: {
  content: any;
}) {
  const children =
    content?.root?.children || [];

  return (
    <div className="post-content">
      {children.map(
        (node: any, i: number) => (
          <RenderNode
            key={i}
            node={node}
            index={i}
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
}: Props) {
  const [aiOpen, setAiOpen] =
    useState(false);

  const [copied, setCopied] =
    useState(false);

  const nodes =
    post?.content?.root?.children || [];

  const headings = useMemo(
    () => collectHeadings(nodes),
    [nodes]
  );

  const summary = useMemo(
    () =>
      extractSummary(
        nodes,
        post?.excerpt || ""
      ),
    [nodes, post?.excerpt]
  );

  const category =
    typeof post?.category === "object"
      ? post.category?.name ||
        "Article"
      : "Article";

  const date = post?.publishedAt
    ? new Date(
        post.publishedAt
      ).toLocaleDateString(
        "en-US",
        {
          month: "short",
          day: "numeric",
          year: "numeric",
        }
      )
    : "";

  async function sharePost() {
    const url =
      window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({
          title:
            post?.title ||
            "AlloyPress",
          text:
            post?.excerpt ||
            post?.title ||
            "",
          url,
        });

        return;
      } catch {
        /*
         * User cancelled native share.
         * Do nothing.
         */
      }
    }

    try {
      await navigator.clipboard.writeText(
        url
      );

      setCopied(true);

      window.setTimeout(
        () => setCopied(false),
        1800
      );
    } catch {
      setCopied(false);
    }
  }

  return (
    <>
      <style>{`
        .single-post{
          --green:#18b968;
          --green-dark:#087a45;
          --ink:#14202b;
          --muted:#647384;
          --line:#dfe7e3;
          --soft:#f3f7f5;
          --paper:#fff;
          min-height:100vh;
          background:var(--paper);
          color:var(--ink);
        }

        .single-post *{
          box-sizing:border-box;
        }

        .post-shell{
          width:min(1320px,calc(100% - 48px));
          margin:0 auto;
        }

        .post-hero{
          padding:54px 0 42px;
          border-bottom:1px solid var(--line);
        }

        .post-kicker{
          display:flex;
          align-items:center;
          gap:9px;
          margin:0 0 17px;
          color:var(--green);
          font:800 11px/1 "DM Mono",monospace;
          letter-spacing:.14em;
          text-transform:uppercase;
        }

        .post-kicker i{
          width:7px;
          height:7px;
          flex:0 0 7px;
          border-radius:50%;
          background:var(--green);
          box-shadow:0 0 0 5px rgba(24,185,104,.10);
        }

        .post-title{
          max-width:980px;
          margin:0;
          font:800 clamp(42px,5.2vw,74px)/.99 "Sora",sans-serif;
          letter-spacing:-.055em;
        }

        .post-excerpt{
          max-width:850px;
          margin:20px 0 22px;
          color:#536274;
          font:400 19px/1.65 "Lora",serif;
        }

        .post-meta-row{
          display:flex;
          align-items:center;
          justify-content:space-between;
          gap:20px;
          flex-wrap:wrap;
        }

        .post-byline{
          display:flex;
          align-items:center;
          gap:10px;
          color:#657383;
          font:600 11px/1.4 "DM Mono",monospace;
        }

        .author-dot{
          width:32px;
          height:32px;
          display:grid;
          place-items:center;
          border-radius:50%;
          background:#111a21;
          color:#fff;
          font:800 9px "Sora",sans-serif;
        }

        .share-btn{
          border:1px solid var(--line);
          background:#fff;
          color:#17202b;
          border-radius:9px;
          padding:10px 14px;
          font:800 10px "DM Mono",monospace;
          cursor:pointer;
        }

        .share-btn:hover{
          border-color:var(--green);
          color:var(--green);
        }

        .hero-image{
          margin:32px 0 0;
          border:1px solid var(--line);
          border-radius:15px;
          overflow:hidden;
          background:#eef3f0;
        }

        .hero-image img{
          display:block;
          width:100%;
          height:auto;
          max-height:680px;
          object-fit:cover;
        }

        .post-layout{
          display:grid;
          grid-template-columns:220px minmax(0,720px) 240px;
          gap:54px;
          align-items:start;
          padding:48px 0 80px;
        }

        .toc,
        .working{
          position:sticky;
          top:94px;
        }

        .toc{
          min-width:0;
        }

        .side-label{
          margin-bottom:14px;
          color:var(--green);
          font:800 10px/1 "DM Mono",monospace;
          letter-spacing:.13em;
          text-transform:uppercase;
        }

        .toc-list{
          max-height:calc(100vh - 125px);
          overflow:auto;
          border-left:1px solid var(--line);
          padding-left:13px;
          scrollbar-width:thin;
        }

        .toc-link{
          display:block;
          padding:6px 0;
          color:#667486;
          text-decoration:none;
          font:700 10.5px/1.45 "DM Mono",monospace;
        }

        .toc-link:hover{
          color:var(--green);
        }

        .toc-link.sub{
          padding-left:10px;
          color:#8a95a2;
          font-weight:600;
        }

        .summary-box{
          margin:0 0 26px;
          padding:18px 19px;
          border:1px solid rgba(24,185,104,.24);
          border-radius:12px;
          background:linear-gradient(
            135deg,
            rgba(24,185,104,.11),
            rgba(24,185,104,.035)
          );
        }

        .summary-box h3{
          margin:0 0 8px;
          color:var(--green-dark);
          font:800 11px "DM Mono",monospace;
          letter-spacing:.08em;
        }

        .summary-box p{
          margin:0;
          color:#455568;
          font:400 14px/1.65 "Lora",serif;
        }

        .working-card{
          border:1px solid var(--line);
          border-radius:13px;
          padding:18px;
          background:var(--soft);
        }

        .working-card h3{
          margin:0 0 13px;
          font:800 14px/1.3 "Sora",sans-serif;
        }

        .trust-item{
          display:flex;
          gap:8px;
          margin:10px 0;
          color:#536273;
          font:700 10.5px/1.5 "DM Mono",monospace;
        }

        .trust-item b{
          color:var(--green);
        }

        .post-content{
          color:#293746;
          font:400 17px/1.82 "Lora",serif;
          overflow-wrap:anywhere;
        }

        .post-content .post-p{
          margin:0 0 23px;
        }

        .post-content .post-p:empty{
          display:none;
        }

        .post-content .post-p strong{
          font-weight:700;
        }

        .post-link{
          color:#0b9855;
          text-decoration:underline;
          text-decoration-color:rgba(11,152,85,.35);
          text-underline-offset:3px;
        }

        .post-h2{
          margin:48px 0 15px;
          color:#111a23;
          font:800 30px/1.17 "Sora",sans-serif;
          letter-spacing:-.035em;
          scroll-margin-top:105px;
        }

        .post-h3{
          margin:35px 0 12px;
          color:#111a23;
          font:800 21px/1.25 "Sora",sans-serif;
          letter-spacing:-.025em;
          scroll-margin-top:105px;
        }

        .post-h4,
        .post-h5,
        .post-h6{
          margin:28px 0 10px;
          color:#18232d;
          font:800 18px/1.3 "Sora",sans-serif;
        }

        .post-list{
          margin:0 0 25px;
          padding-left:25px;
        }

        .post-list li{
          margin:7px 0;
          padding-left:5px;
        }

        /*
         * Block elements are now safely outside paragraph wrappers.
         */
        .post-figure{
          display:block;
          width:100%;
          margin:30px 0 34px;
        }

        .post-image-frame{
          width:100%;
          overflow:hidden;
          border:1px solid var(--line);
          border-radius:11px;
          background:#f1f4f3;
        }

        .post-figure img{
          display:block;
          width:100%;
          height:auto;
          max-width:100%;
        }

        .post-figure figcaption,
        .post-video figcaption,
        .post-audio figcaption{
          display:block;
          margin-top:8px;
          color:#7b8794;
          font:500 10px/1.45 "DM Mono",monospace;
        }

        .styled-box{
          margin:30px 0;
          padding:18px 20px;
          border:1px solid #c5ead5;
          border-radius:11px;
          background:#eaf8f0;
        }

        .styled-box-label{
          margin-bottom:8px;
          color:#078b4e;
          font:800 11px/1.3 "DM Mono",monospace;
          text-transform:uppercase;
          letter-spacing:.06em;
        }

        .styled-box-body{
          white-space:pre-line;
          color:#405264;
          font:400 14px/1.7 "Lora",serif;
        }

        .cta-wrap{
          margin:28px 0;
        }

        .article-cta{
          display:inline-flex;
          align-items:center;
          text-decoration:none!important;
          background:var(--green);
          color:#fff!important;
          border-radius:8px;
          padding:11px 15px;
          font:800 11px "DM Mono",monospace;
        }

        .post-quote{
          margin:30px 0;
          padding:17px 20px;
          border-left:3px solid var(--green);
          background:var(--soft);
          border-radius:0 9px 9px 0;
        }

        .post-rule{
          border:0;
          border-top:1px solid var(--line);
          margin:36px 0;
        }

        .post-code{
          margin:28px 0;
          overflow:auto;
          border-radius:10px;
          background:#111820;
          color:#e9f3ed;
        }

        .post-code pre{
          margin:0;
          padding:18px;
          font:500 12px/1.65 "DM Mono",monospace;
        }

        .inline-code{
          padding:2px 5px;
          border-radius:5px;
          background:var(--soft);
          font:600 .9em "DM Mono",monospace;
        }

        .table-scroll{
          width:100%;
          overflow-x:auto;
          margin:30px 0;
          border:1px solid var(--line);
          border-radius:10px;
        }

        .post-table{
          width:100%;
          min-width:560px;
          border-collapse:collapse;
          font:500 12px/1.55 "DM Mono",monospace;
        }

        .post-table th,
        .post-table td{
          padding:11px 12px;
          border-right:1px solid var(--line);
          border-bottom:1px solid var(--line);
          text-align:left;
          vertical-align:top;
        }

        .post-table th:last-child,
        .post-table td:last-child{
          border-right:0;
        }

        .post-table tr:last-child td{
          border-bottom:0;
        }

        .post-table .table-head{
          background:#edf7f1;
          color:#0b8c50;
          font-weight:800;
        }

        /*
         * Images inside table cells should not inherit huge paragraph
         * spacing.
         */
        .post-table .post-p{
          margin:0 0 8px;
        }

        .post-table .post-figure{
          margin:8px 0;
        }

        .post-table .post-video,
        .post-table .post-audio{
          margin:8px 0;
        }

        .post-video,
        .post-audio{
          margin:32px 0 36px;
        }

        .post-video-frame{
          position:relative;
          width:100%;
          aspect-ratio:16/9;
          overflow:hidden;
          border:1px solid var(--line);
          border-radius:12px;
          background:#0e151a;
        }

        .post-video-frame iframe,
        .post-video-frame video{
          display:block;
          width:100%;
          height:100%;
          border:0;
          object-fit:contain;
          background:#0b1014;
        }

        .post-audio{
          padding:17px;
          border:1px solid var(--line);
          border-radius:11px;
          background:var(--soft);
        }

        .post-audio-title{
          margin-bottom:10px;
          font:800 13px "Sora",sans-serif;
        }

        .post-audio audio{
          width:100%;
        }

        .unknown-block{
          margin:20px 0;
        }

        .article-end{
          margin-top:50px;
          padding-top:25px;
          border-top:1px solid var(--line);
        }

        .tag-row{
          display:flex;
          flex-wrap:wrap;
          gap:7px;
        }

        .tag{
          padding:6px 9px;
          border:1px solid var(--line);
          border-radius:6px;
          background:var(--soft);
          color:#617083;
          font:600 10px "DM Mono",monospace;
        }

        .related{
          padding:55px 0 80px;
          border-top:1px solid var(--line);
        }

        .section-head{
          display:flex;
          align-items:end;
          justify-content:space-between;
          margin-bottom:20px;
        }

        .section-head h2{
          margin:0;
          font:800 29px "Sora",sans-serif;
          letter-spacing:-.035em;
        }

        .related-grid{
          display:grid;
          grid-template-columns:repeat(3,1fr);
          gap:16px;
        }

        .related-card{
          display:block;
          padding:17px;
          border:1px solid var(--line);
          border-radius:12px;
          background:#fff;
          text-decoration:none;
          transition:.2s ease;
        }

        .related-card:hover{
          border-color:rgba(24,185,104,.4);
          transform:translateY(-2px);
        }

        .related-cat{
          color:var(--green);
          font:800 9px "DM Mono",monospace;
          text-transform:uppercase;
        }

        .related-card h3{
          margin:9px 0 8px;
          color:#17202b;
          font:800 16px/1.3 "Sora",sans-serif;
        }

        .related-card p{
          margin:0;
          color:#748091;
          font:400 12px/1.55 "Lora",serif;
        }

        .ai-fab{
          position:fixed;
          right:22px;
          bottom:22px;
          z-index:40;
          border:0;
          border-radius:999px;
          background:#10171e;
          color:#fff;
          padding:12px 16px;
          box-shadow:0 12px 35px rgba(0,0,0,.18);
          font:800 10px "DM Mono",monospace;
          cursor:pointer;
        }

        .ai-fab span{
          color:#18c978;
        }

        .ai-panel{
          position:fixed;
          right:22px;
          bottom:72px;
          width:min(370px,calc(100vw - 32px));
          z-index:39;
          padding:18px;
          border:1px solid rgba(255,255,255,.12);
          border-radius:15px;
          background:#10171e;
          color:#fff;
          box-shadow:0 18px 55px rgba(0,0,0,.25);
        }

        .ai-panel h3{
          margin:0 0 7px;
          font:800 15px "Sora",sans-serif;
        }

        .ai-panel p{
          margin:0;
          color:#aab6bf;
          font:400 12px/1.6 "Lora",serif;
        }

        .ai-panel .ai-answer{
          margin-top:13px;
          padding:12px;
          border:1px solid rgba(24,185,104,.18);
          border-radius:9px;
          background:rgba(24,185,104,.09);
          color:#dce9e2;
          font:400 12px/1.55 "Lora",serif;
        }

        .ai-close{
          float:right;
          border:0;
          background:none;
          color:#9ba7b3;
          cursor:pointer;
          font-size:20px;
        }

        /* ---------------------------------------------------------------- */
        /* Dark theme                                                       */
        /* ---------------------------------------------------------------- */

        html[data-theme="dark"] .single-post,
        html.dark .single-post,
        body.dark .single-post{
          --ink:#f1f6f3;
          --muted:#9eaca6;
          --line:#27342e;
          --soft:#111a16;
          --paper:#0b100e;
          background:var(--paper);
          color:var(--ink);
        }

        html[data-theme="dark"] .post-excerpt,
        html.dark .post-excerpt,
        body.dark .post-excerpt{
          color:#aebbb4;
        }

        html[data-theme="dark"] .post-byline,
        html.dark .post-byline,
        body.dark .post-byline{
          color:#9ca9a3;
        }

        html[data-theme="dark"] .share-btn,
        html.dark .share-btn,
        body.dark .share-btn{
          background:#101713;
          color:#e9f0ec;
          border-color:#2b3932;
        }

        html[data-theme="dark"] .post-content,
        html.dark .post-content,
        body.dark .post-content{
          color:#d2ddd7;
        }

        html[data-theme="dark"] .post-h2,
        html[data-theme="dark"] .post-h3,
        html[data-theme="dark"] .post-h4,
        html[data-theme="dark"] .post-h5,
        html[data-theme="dark"] .post-h6,
        html.dark .post-h2,
        html.dark .post-h3,
        html.dark .post-h4,
        html.dark .post-h5,
        html.dark .post-h6,
        body.dark .post-h2,
        body.dark .post-h3,
        body.dark .post-h4,
        body.dark .post-h5,
        body.dark .post-h6{
          color:#f1f6f3;
        }

        html[data-theme="dark"] .summary-box,
        html.dark .summary-box,
        body.dark .summary-box{
          background:rgba(24,185,104,.08);
        }

        html[data-theme="dark"] .summary-box p,
        html.dark .summary-box p,
        body.dark .summary-box p{
          color:#bac8c1;
        }

        html[data-theme="dark"] .working-card,
        html.dark .working-card,
        body.dark .working-card{
          background:#101713;
        }

        html[data-theme="dark"] .trust-item,
        html.dark .trust-item,
        body.dark .trust-item{
          color:#aebbb4;
        }

        html[data-theme="dark"] .post-image-frame,
        html.dark .post-image-frame,
        body.dark .post-image-frame{
          background:#121a17;
        }

        html[data-theme="dark"] .styled-box,
        html.dark .styled-box,
        body.dark .styled-box{
          background:#102019;
          border-color:#1d4b35;
        }

        html[data-theme="dark"] .styled-box-body,
        html.dark .styled-box-body,
        body.dark .styled-box-body{
          color:#c2cec7;
        }

        html[data-theme="dark"] .post-quote,
        html.dark .post-quote,
        body.dark .post-quote{
          background:#101713;
        }

        html[data-theme="dark"] .post-table .table-head,
        html.dark .post-table .table-head,
        body.dark .post-table .table-head{
          background:#15221b;
          color:#62d99a;
        }

        html[data-theme="dark"] .related-card,
        html.dark .related-card,
        body.dark .related-card{
          background:#101713;
        }

        html[data-theme="dark"] .related-card h3,
        html.dark .related-card h3,
        body.dark .related-card h3{
          color:#edf4f0;
        }

        html[data-theme="dark"] .related-card p,
        html.dark .related-card p,
        body.dark .related-card p{
          color:#9ca9a3;
        }

        html[data-theme="dark"] .tag,
        html.dark .tag,
        body.dark .tag{
          background:#101713;
          color:#aebbb4;
        }

        html[data-theme="dark"] .toc-link,
        html.dark .toc-link,
        body.dark .toc-link{
          color:#a5b1aa;
        }

        html[data-theme="dark"] .toc-link.sub,
        html.dark .toc-link.sub,
        body.dark .toc-link.sub{
          color:#7f8d86;
        }

        html[data-theme="dark"] .post-figure figcaption,
        html.dark .post-figure figcaption,
        body.dark .post-figure figcaption{
          color:#8d9b94;
        }

        /* ---------------------------------------------------------------- */
        /* Responsive                                                       */
        /* ---------------------------------------------------------------- */

        @media(max-width:1160px){
          .post-layout{
            grid-template-columns:190px minmax(0,1fr);
            gap:35px;
          }

          .working{
            display:none;
          }
        }

        @media(max-width:760px){
          .post-shell{
            width:min(100% - 28px,720px);
          }

          .post-hero{
            padding:36px 0 28px;
          }

          .post-title{
            font-size:42px;
          }

          .post-excerpt{
            font-size:16px;
          }

          .post-layout{
            display:block;
            padding:30px 0 58px;
          }

          .toc{
            position:static;
            margin-bottom:28px;
            padding:15px;
            border:1px solid var(--line);
            border-radius:10px;
            background:var(--soft);
          }

          .toc-list{
            max-height:220px;
          }

          .post-content{
            font-size:16px;
            line-height:1.78;
          }

          .post-h2{
            font-size:27px;
            margin-top:40px;
          }

          .post-h3{
            font-size:20px;
          }

          .related-grid{
            grid-template-columns:1fr;
          }

          .hero-image{
            margin-top:24px;
          }

          .ai-fab{
            right:14px;
            bottom:14px;
          }

          .ai-panel{
            right:14px;
            bottom:64px;
          }
        }
      `}</style>

      <main className="single-post">
        {/* ---------------------------------------------------------------- */}
        {/* Hero                                                             */}
        {/* ---------------------------------------------------------------- */}

        <header className="post-hero">
          <div className="post-shell">
            <div className="post-kicker">
              <i />
              {category} · AlloyPress Review
            </div>

            <h1 className="post-title">
              {post?.title}
            </h1>

            {post?.excerpt ? (
              <p className="post-excerpt">
                {post.excerpt}
              </p>
            ) : null}

            <div className="post-meta-row">
              <div className="post-byline">
                <span className="author-dot">
                  AP
                </span>

                <span>
                  AlloyPress Editorial Team
                </span>

                {date ? (
                  <span>
                    · {date}
                  </span>
                ) : null}
              </div>

              <button
                type="button"
                className="share-btn"
                onClick={sharePost}
              >
                {copied
                  ? "LINK COPIED ✓"
                  : "SHARE ↗"}
              </button>
            </div>

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
        </header>

        {/* ---------------------------------------------------------------- */}
        {/* Main article layout                                              */}
        {/* ---------------------------------------------------------------- */}

        <div className="post-shell">
          <div className="post-layout">

            {/* Left TOC */}
            <aside
              className="toc"
              aria-label="Table of contents"
            >
              <div className="side-label">
                On this page
              </div>

              <nav className="toc-list">
                {headings.map(
                  (item, i) => (
                    <a
                      key={`${item.id}-${i}`}
                      href={`#${item.id}`}
                      className={`toc-link ${
                        item.level === 3
                          ? "sub"
                          : ""
                      }`}
                    >
                      {String(i + 1).padStart(
                        2,
                        "0"
                      )}{" "}
                      · {item.text}
                    </a>
                  )
                )}
              </nav>
            </aside>

            {/* Article */}
            <article>
              <div className="summary-box">
                <h3>
                  ALLOYPRESS AI SUMMARY
                </h3>

                <p>
                  {summary}
                </p>
              </div>

              <ArticleRenderer
                content={post?.content}
              />

              <div className="article-end">
                <div className="side-label">
                  Article tags
                </div>

                <div className="tag-row">
                  {(post?.tags || [])
                    .slice(0, 8)
                    .map(
                      (
                        tag: any,
                        i: number
                      ) => (
                        <span
                          className="tag"
                          key={i}
                        >
                          {typeof tag ===
                          "string"
                            ? tag
                            : tag?.name ||
                              tag?.slug ||
                              "AI"}
                        </span>
                      )
                    )}
                </div>
              </div>
            </article>

            {/* Right trust card */}
            <aside className="working">
              <div className="side-label">
                Working with AlloyPress
              </div>

              <div className="working-card">
                <h3>
                  Why trust this article?
                </h3>

                <div className="trust-item">
                  <b>✓</b>
                  <span>
                    Hands-on testing where
                    applicable
                  </span>
                </div>

                <div className="trust-item">
                  <b>✓</b>
                  <span>
                    Independent editorial
                    evaluation
                  </span>
                </div>

                <div className="trust-item">
                  <b>✓</b>
                  <span>
                    Practical pros, cons and
                    use cases
                  </span>
                </div>

                <div className="trust-item">
                  <b>✓</b>
                  <span>
                    Content updated when
                    information changes
                  </span>
                </div>
              </div>
            </aside>
          </div>
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* Related articles                                                 */}
        {/* ---------------------------------------------------------------- */}

        {related?.length ? (
          <section className="related">
            <div className="post-shell">
              <div className="section-head">
                <div>
                  <div className="side-label">
                    Keep exploring
                  </div>

                  <h2>
                    Related articles
                  </h2>
                </div>

                <a
                  href="/blogs"
                  className="toc-link"
                >
                  View all →
                </a>
              </div>

              <div className="related-grid">
                {related.map(
                  (item: any) => (
                    <a
                      className="related-card"
                      href={`/blogs/${item.slug}`}
                      key={item.id}
                    >
                      <div className="related-cat">
                        {typeof item.category ===
                        "object"
                          ? item.category?.name
                          : category}
                      </div>

                      <h3>
                        {item.title}
                      </h3>

                      {item.excerpt ? (
                        <p>
                          {item.excerpt.slice(
                            0,
                            150
                          )}
                          …
                        </p>
                      ) : null}
                    </a>
                  )
                )}
              </div>
            </div>
          </section>
        ) : null}

        {/* ---------------------------------------------------------------- */}
        {/* Ask Alloy AI                                                     */}
        {/* ---------------------------------------------------------------- */}

        {aiOpen ? (
          <div
            className="ai-panel"
            role="dialog"
            aria-label="Ask Alloy AI"
          >
            <button
              type="button"
              className="ai-close"
              aria-label="Close"
              onClick={() =>
                setAiOpen(false)
              }
            >
              ×
            </button>

            <h3>
              Ask Alloy AI
            </h3>

            <p>
              Quick article assistant. The
              full AI Q&A backend can be
              connected next.
            </p>

            <div className="ai-answer">
              <strong>
                Quick take:
              </strong>{" "}
              {summary}
            </div>
          </div>
        ) : null}

        <button
          type="button"
          className="ai-fab"
          onClick={() =>
            setAiOpen((value) => !value)
          }
          aria-label="Ask Alloy AI"
        >
          ✦{" "}
          <span>
            Ask Alloy AI
          </span>
        </button>
      </main>
    </>
  );
}