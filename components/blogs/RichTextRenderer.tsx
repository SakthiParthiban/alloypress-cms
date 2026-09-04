import type { CSSProperties, ReactNode } from 'react'

import type {
  RichTextContent,
  RichTextNode,
} from '@/lib/cms'

type RichTextRendererProps = {
  content: RichTextContent
}

/**
 * AlloyPress Rich Text Renderer
 *
 * This renderer is intentionally aligned with the Posts collection:
 *
 * - Payload Lexical default nodes
 * - TextStateFeature:
 *   color / backgroundColor / fontFamily / fontSize / textStyle / decoration
 * - LinkFeature
 * - UploadFeature -> media
 * - CodeBlock
 * - videoEmbed
 * - videoFile
 * - audio
 * - styledBox
 * - ctaButton
 * - EXPERIMENTAL_TableFeature
 *
 * The migration script converts WordPress special elements into the
 * Payload block shapes used below. In particular, migrated styled boxes,
 * CTA buttons, audio, self-hosted video and embeds become block nodes.
 */

/* ============================================================
   GENERIC HELPERS
   ============================================================ */

type AnyRecord = Record<string, any>

const isRecord = (value: unknown): value is AnyRecord =>
  !!value && typeof value === 'object'

const asString = (
  value: unknown,
  fallback = '',
): string =>
  typeof value === 'string' ? value : fallback

const asNumber = (
  value: unknown,
  fallback = 0,
): number =>
  typeof value === 'number' && Number.isFinite(value)
    ? value
    : fallback

function getNodeRecord(node: RichTextNode): AnyRecord {
  return node as AnyRecord
}

/* ============================================================
   TEXT EXTRACTION
   ============================================================ */

function getText(node: RichTextNode | AnyRecord): string {
  if (!isRecord(node)) {
    return ''
  }

  if (node.type === 'text') {
    return asString(node.text)
  }

  if (Array.isArray(node.children)) {
    return node.children
      .map((child: AnyRecord) => getText(child))
      .join('')
  }

  if (typeof node.text === 'string') {
    return node.text
  }

  return ''
}

/* ============================================================
   SLUG / ANCHOR
   ============================================================ */

function slugify(value: string): string {
  const slug = value
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}\s-]/gu, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')

  return slug || 'section'
}

function createHeadingId(
  text: string,
  key: string,
): string {
  return `${slugify(text)}-${key.replace(/[^\w-]/g, '-')}`
}

/* ============================================================
   COLOR HELPERS
   ============================================================ */

/**
 * Posts.ts deliberately snaps migrated WordPress background colors to
 * these named values. Keep the renderer in sync with those values.
 */
const COLOR_MAP: Record<string, string> = {
  green: '#e8f7ef',
  yellow: '#fff5d6',
  blue: '#eaf3ff',
  red: '#fff0ef',
  gray: '#f3f4f6',
  'brand-green': '#1dba6e',

  // Common text-state names / aliases.
  black: '#111827',
  white: '#ffffff',
  dark: '#111827',
  grey: '#6b7280',
  transparent: 'transparent',
}

const TEXT_COLOR_MAP: Record<string, string> = {
  green: '#15803d',
  'brand-green': '#1dba6e',
  yellow: '#a16207',
  blue: '#2563eb',
  red: '#dc2626',
  gray: '#6b7280',
  grey: '#6b7280',
  black: '#111827',
  white: '#ffffff',
}

function resolveColor(
  value: unknown,
  fallback?: string,
): string | undefined {
  if (typeof value !== 'string' || !value.trim()) {
    return fallback
  }

  const normalized = value.trim().toLowerCase()

  return (
    COLOR_MAP[normalized] ||
    TEXT_COLOR_MAP[normalized] ||
    value.trim()
  )
}

function resolveTextColor(
  value: unknown,
): string | undefined {
  if (typeof value !== 'string' || !value.trim()) {
    return undefined
  }

  const normalized = value.trim().toLowerCase()

  return (
    TEXT_COLOR_MAP[normalized] ||
    value.trim()
  )
}

function resolveBackgroundColor(
  value: unknown,
): string | undefined {
  if (typeof value !== 'string' || !value.trim()) {
    return undefined
  }

  const normalized = value.trim().toLowerCase()

  return (
    COLOR_MAP[normalized] ||
    value.trim()
  )
}

/* ============================================================
   TEXT STATE
   ============================================================ */

function getTextStateStyle(
  node: AnyRecord,
): CSSProperties {
  const style: CSSProperties = {}

  /*
   * TextStateFeature data can differ slightly between serialized editor
   * versions. We therefore support both direct properties and common
   * nested state representations without changing the stored content.
   */
  const state = isRecord(node.$)
    ? node.$
    : isRecord(node.state)
      ? node.state
      : {}

  const textColor =
    node.color ??
    node.textColor ??
    state.color ??
    state.textColor

  const backgroundColor =
    node.backgroundColor ??
    state.backgroundColor

  const fontFamily =
    node.fontFamily ??
    state.fontFamily

  const fontSize =
    node.fontSize ??
    state.fontSize

  const textStyle =
    node.textStyle ??
    state.textStyle

  const decoration =
    node.decoration ??
    state.decoration

  const resolvedTextColor =
    resolveTextColor(textColor)

  const resolvedBackground =
    resolveBackgroundColor(backgroundColor)

  if (resolvedTextColor) {
    style.color = resolvedTextColor
  }

  if (resolvedBackground) {
    style.backgroundColor = resolvedBackground
  }

  if (typeof fontFamily === 'string' && fontFamily.trim()) {
    style.fontFamily = fontFamily.trim()
  }

  if (
    typeof fontSize === 'string' ||
    typeof fontSize === 'number'
  ) {
    style.fontSize =
      typeof fontSize === 'number'
        ? `${fontSize}px`
        : fontSize
  }

  /*
   * These values intentionally accept both the named values from the
   * configured TextStateFeature and CSS-like values in case an older
   * migrated document contains the latter.
   */
  if (typeof textStyle === 'string') {
    switch (textStyle.toLowerCase()) {
      case 'bold':
        style.fontWeight = 700
        break
      case 'italic':
        style.fontStyle = 'italic'
        break
      case 'normal':
        style.fontWeight = 400
        break
    }
  }

  if (typeof decoration === 'string') {
    switch (decoration.toLowerCase()) {
      case 'underline':
        style.textDecoration = 'underline'
        break
      case 'line-through':
      case 'strikethrough':
      case 'strike':
        style.textDecoration = 'line-through'
        break
      case 'none':
        style.textDecoration = 'none'
        break
    }
  }

  /*
   * Some Lexical versions serialize custom inline state into node.style.
   * Preserve safe CSS declarations only when it is already represented
   * as a normal string. We do not use dangerouslySetInnerHTML.
   */
  if (typeof node.style === 'string' && node.style.trim()) {
    const declarations = node.style
      .split(';')
      .map((part: string) => part.trim())
      .filter(Boolean)

    for (const declaration of declarations) {
      const separator = declaration.indexOf(':')

      if (separator === -1) {
        continue
      }

      const property = declaration
        .slice(0, separator)
        .trim()

      const value = declaration
        .slice(separator + 1)
        .trim()

      if (!property || !value) {
        continue
      }

      /*
       * Only allow visual text properties. This prevents arbitrary CSS
       * from turning migrated content into a layout/security problem.
       */
      const allowedProperties = new Set([
        'color',
        'background-color',
        'font-family',
        'font-size',
        'font-weight',
        'font-style',
        'text-decoration',
        'letter-spacing',
        'line-height',
      ])

      if (!allowedProperties.has(property)) {
        continue
      }

      ;(style as AnyRecord)[property] = value
    }
  }

  return style
}

/* ============================================================
   CHILDREN
   ============================================================ */

function renderChildren(
  children?: RichTextNode[],
): ReactNode {
  if (!Array.isArray(children)) {
    return null
  }

  return children.map(
    (child, index) =>
      renderNode(
        child,
        `${child.type || 'node'}-${index}`,
      ),
  )
}

/* ============================================================
   TEXT NODE
   ============================================================ */

function renderText(
  node: RichTextNode,
  key: string,
): ReactNode {
  const record = getNodeRecord(node)

  let content: ReactNode =
    asString(record.text)

  const format =
    typeof record.format === 'number'
      ? record.format
      : Number(record.format || 0)

  // Lexical format bit flags.
  if (format & 1) {
    content = <strong>{content}</strong>
  }

  if (format & 2) {
    content = <em>{content}</em>
  }

  if (format & 4) {
    content = <s>{content}</s>
  }

  if (format & 8) {
    content = <u>{content}</u>
  }

  if (format & 16) {
    content = (
      <code className="blog-inline-code">
        {content}
      </code>
    )
  }

  if (format & 32) {
    content = (
      <sub>{content}</sub>
    )
  }

  if (format & 64) {
    content = (
      <sup>{content}</sup>
    )
  }

  const style =
    getTextStateStyle(record)

  return (
    <span
      key={key}
      style={style}
      className={
        Object.keys(style).length
          ? 'blog-text-state'
          : undefined
      }
    >
      {content}
    </span>
  )
}

/* ============================================================
   LINK
   ============================================================ */

function renderLink(
  node: RichTextNode,
  key: string,
): ReactNode {
  const record = getNodeRecord(node)
  const fields = isRecord(record.fields)
    ? record.fields
    : {}

  const href =
    asString(record.url) ||
    asString(fields.url) ||
    '#'

  const external =
    /^https?:\/\//i.test(href)

  const nofollow =
    Boolean(fields.nofollow)

  const sponsored =
    Boolean(fields.sponsored)

  const noopener =
    Boolean(fields.noopener) ||
    external

  const noreferrer =
    Boolean(fields.noreferrer) ||
    external

  const relParts: string[] = []

  if (nofollow) {
    relParts.push('nofollow')
  }

  if (sponsored) {
    relParts.push('sponsored')
  }

  if (noopener) {
    relParts.push('noopener')
  }

  if (noreferrer) {
    relParts.push('noreferrer')
  }

  return (
    <a
      key={key}
      href={href}
      className="blog-link"
      {...(external
        ? {
            target: '_blank',
          }
        : {})}
      {...(relParts.length
        ? {
            rel: Array.from(
              new Set(relParts),
            ).join(' '),
          }
        : {})}
    >
      {renderChildren(record.children)}
    </a>
  )
}

/* ============================================================
   UPLOAD / IMAGE
   ============================================================ */

function getUploadDocument(
  node: AnyRecord,
): AnyRecord | null {
  const value = node.value

  if (isRecord(value)) {
    return value
  }

  if (isRecord(node.fields?.media)) {
    return node.fields.media
  }

  if (isRecord(node.media)) {
    return node.media
  }

  return null
}

function getMediaUrl(
  media: AnyRecord | null,
): string {
  if (!media) {
    return ''
  }

  return (
    asString(media.url) ||
    asString(media.src) ||
    asString(media.filename)
  )
}

function renderUpload(
  node: RichTextNode,
  key: string,
): ReactNode {
  const record = getNodeRecord(node)
  const media = getUploadDocument(record)
  const src = getMediaUrl(media)

  const alt =
    asString(media?.alt) ||
    asString(record.alt) ||
    'AlloyPress article image'

  const width =
    asNumber(media?.width, 0)

  const height =
    asNumber(media?.height, 0)

  const caption =
    asString(
      record.fields?.caption,
    ) ||
    asString(media?.caption)

  /*
   * A valid Payload upload relationship is an ID when serialized and a
   * populated media object when fetched with depth. Rendering requires
   * the populated URL. We show a non-breaking editorial placeholder
   * instead of throwing when a media relation cannot be resolved.
   */
  if (!src) {
    return (
      <figure
        key={key}
        className="blog-media blog-media--unavailable"
      >
        <div
          className="blog-media-placeholder"
          role="img"
          aria-label="Article media unavailable"
        >
          Article image unavailable
        </div>
        {caption ? (
          <figcaption>{caption}</figcaption>
        ) : null}
      </figure>
    )
  }

  const imageStyle: CSSProperties = {
    width: '100%',
    height: 'auto',
  }

  if (width > 0) {
    imageStyle.maxWidth = `${width}px`
  }

  return (
    <figure
      key={key}
      className="blog-media"
    >
      <img
        src={src}
        alt={alt}
        width={width || undefined}
        height={height || undefined}
        loading="lazy"
        decoding="async"
        style={imageStyle}
      />

      {caption ? (
        <figcaption>
          {caption}
        </figcaption>
      ) : null}
    </figure>
  )
}

/* ============================================================
   TABLE
   ============================================================ */

function renderTableCell(
  node: AnyRecord,
  key: string,
): ReactNode {
  const isHeader =
    node.type === 'tablecellheader' ||
    node.headerState === 1 ||
    node.headerState === true ||
    node.header === true

  const tag = isHeader ? 'th' : 'td'

  const colSpan =
    Number.isFinite(Number(node.colSpan)) &&
    Number(node.colSpan) > 1
      ? Number(node.colSpan)
      : undefined

  const rowSpan =
    Number.isFinite(Number(node.rowSpan)) &&
    Number(node.rowSpan) > 1
      ? Number(node.rowSpan)
      : undefined

  const style: CSSProperties = {}

  if (typeof node.width === 'number') {
    style.width = `${node.width}px`
  }

  if (
    typeof node.backgroundColor === 'string'
  ) {
    const background =
      resolveBackgroundColor(
        node.backgroundColor,
      )

    if (background) {
      style.backgroundColor = background
    }
  }

  if (
    typeof node.verticalAlign === 'string'
  ) {
    style.verticalAlign =
      node.verticalAlign
  }

  const children =
    renderChildren(node.children)

  if (tag === 'th') {
    return (
      <th
        key={key}
        colSpan={colSpan}
        rowSpan={rowSpan}
        style={style}
        scope="col"
      >
        {children}
      </th>
    )
  }

  return (
    <td
      key={key}
      colSpan={colSpan}
      rowSpan={rowSpan}
      style={style}
    >
      {children}
    </td>
  )
}

function renderTableRow(
  node: AnyRecord,
  key: string,
): ReactNode {
  return (
    <tr key={key}>
      {Array.isArray(node.children)
        ? node.children.map(
            (
              child: AnyRecord,
              index: number,
            ) =>
              renderTableCell(
                child,
                `${key}-cell-${index}`,
              ),
          )
        : null}
    </tr>
  )
}

function renderTable(
  node: RichTextNode,
  key: string,
): ReactNode {
  const record = getNodeRecord(node)

  return (
    <div
      key={key}
      className="blog-table-wrap"
    >
      <table className="blog-table">
        <tbody>
          {Array.isArray(record.children)
            ? record.children.map(
                (
                  child: AnyRecord,
                  index: number,
                ) =>
                  child.type ===
                    'tablerow' ||
                  child.type ===
                    'tableRow'
                    ? renderTableRow(
                        child,
                        `${key}-row-${index}`,
                      )
                    : renderTableRow(
                        child,
                        `${key}-row-${index}`,
                      ),
              )
            : null}
        </tbody>
      </table>
    </div>
  )
}

/* ============================================================
   CODE BLOCK
   ============================================================ */

function renderCodeBlock(
  node: RichTextNode,
  key: string,
): ReactNode {
  const record = getNodeRecord(node)

  const fields =
    isRecord(record.fields)
      ? record.fields
      : record

  const code =
    asString(fields.code) ||
    getText(record)

  const language =
    asString(fields.language) ||
    asString(fields.lang) ||
    'plaintext'

  const languageLabel =
    language === 'plaintext'
      ? ''
      : language

  return (
    <div
      key={key}
      className="blog-code-block"
    >
      {languageLabel ? (
        <div className="blog-code-language">
          {languageLabel}
        </div>
      ) : null}

      <pre>
        <code className={`language-${language}`}>
          {code}
        </code>
      </pre>
    </div>
  )
}

/* ============================================================
   VIDEO / EMBED
   ============================================================ */

function getEmbedUrl(
  url: string,
  provider: string,
): string {
  if (!url) {
    return ''
  }

  try {
    const parsed = new URL(url)

    if (
      provider === 'youtube' ||
      /youtube\.com|youtu\.be/i.test(
        parsed.hostname,
      )
    ) {
      let videoId = ''

      if (
        parsed.hostname.includes('youtu.be')
      ) {
        videoId =
          parsed.pathname
            .replace(/^\/+/, '')
            .split('/')[0]
      } else {
        videoId =
          parsed.searchParams.get('v') || ''

        if (!videoId) {
          const match =
            parsed.pathname.match(
              /\/(?:embed|shorts)\/([^/?]+)/i,
            )

          videoId =
            match?.[1] || ''
        }
      }

      if (videoId) {
        return `https://www.youtube.com/embed/${encodeURIComponent(
          videoId,
        )}`
      }
    }

    if (
      provider === 'vimeo' ||
      /vimeo\.com/i.test(
        parsed.hostname,
      )
    ) {
      const match =
        parsed.pathname.match(
          /\/(\d+)/,
        )

      if (match?.[1]) {
        return `https://player.vimeo.com/video/${match[1]}`
      }
    }

    return url
  } catch {
    return url
  }
}

function renderVideoEmbed(
  node: RichTextNode,
  key: string,
): ReactNode {
  const record = getNodeRecord(node)

  const fields =
    isRecord(record.fields)
      ? record.fields
      : record

  const url =
    asString(fields.url)

  const provider =
    asString(fields.provider) ||
    'other'

  const caption =
    asString(fields.caption)

  if (!url) {
    return null
  }

  const embedUrl =
    getEmbedUrl(url, provider)

  return (
    <figure
      key={key}
      className="blog-video"
    >
      <div className="blog-video-frame">
        <iframe
          src={embedUrl}
          title={
            caption ||
            'Embedded article video'
          }
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>

      {caption ? (
        <figcaption>
          {caption}
        </figcaption>
      ) : null}
    </figure>
  )
}

/* ============================================================
   SELF-HOSTED VIDEO
   ============================================================ */

function renderVideoFile(
  node: RichTextNode,
  key: string,
): ReactNode {
  const record = getNodeRecord(node)

  const fields =
    isRecord(record.fields)
      ? record.fields
      : record

  const videoValue =
    fields.video

  const media =
    isRecord(videoValue)
      ? videoValue
      : null

  const src =
    getMediaUrl(media)

  const caption =
    asString(fields.caption)

  if (!src) {
    return (
      <figure
        key={key}
        className="blog-video blog-video--unavailable"
      >
        <div className="blog-media-placeholder">
          Video unavailable
        </div>

        {caption ? (
          <figcaption>
            {caption}
          </figcaption>
        ) : null}
      </figure>
    )
  }

  return (
    <figure
      key={key}
      className="blog-video"
    >
      <div className="blog-video-frame">
        <video
          controls
          preload="metadata"
          playsInline
          src={src}
        >
          Your browser does not support
          the video element.
        </video>
      </div>

      {caption ? (
        <figcaption>
          {caption}
        </figcaption>
      ) : null}
    </figure>
  )
}

/* ============================================================
   AUDIO
   ============================================================ */

function renderAudio(
  node: RichTextNode,
  key: string,
): ReactNode {
  const record = getNodeRecord(node)

  const fields =
    isRecord(record.fields)
      ? record.fields
      : record

  const audioValue =
    fields.audio

  const media =
    isRecord(audioValue)
      ? audioValue
      : null

  const src =
    getMediaUrl(media)

  const title =
    asString(fields.title)

  const caption =
    asString(fields.caption)

  if (!src) {
    return (
      <figure
        key={key}
        className="blog-audio blog-audio--unavailable"
      >
        <div className="blog-media-placeholder">
          Audio unavailable
        </div>

        {caption ? (
          <figcaption>
            {caption}
          </figcaption>
        ) : null}
      </figure>
    )
  }

  return (
    <figure
      key={key}
      className="blog-audio"
    >
      {title ? (
        <div className="blog-audio-title">
          {title}
        </div>
      ) : null}

      <audio
        controls
        preload="metadata"
        src={src}
      >
        Your browser does not support
        the audio element.
      </audio>

      {caption ? (
        <figcaption>
          {caption}
        </figcaption>
      ) : null}
    </figure>
  )
}

/* ============================================================
   STYLED BOX
   ============================================================ */

function getBorderColor(
  value: unknown,
): string {
  const normalized =
    typeof value === 'string'
      ? value.toLowerCase()
      : ''

  if (
    normalized === 'brand-green'
  ) {
    return '#1dba6e'
  }

  return (
    resolveColor(value) ||
    '#d1d5db'
  )
}

function renderStyledBox(
  node: RichTextNode,
  key: string,
): ReactNode {
  const record = getNodeRecord(node)

  const fields =
    isRecord(record.fields)
      ? record.fields
      : record

  const heading =
    asString(fields.heading)

  const text =
    asString(fields.text)

  const backgroundColor =
    resolveBackgroundColor(
      fields.backgroundColor,
    ) ||
    '#f3f4f6'

  const borderColor =
    getBorderColor(
      fields.borderColor,
    )

  const borderWidth =
    asString(
      fields.borderWidth,
      '1px',
    )

  const style: CSSProperties = {
    backgroundColor,
    borderColor,
    borderWidth,
    borderStyle: 'solid',
  }

  return (
    <aside
      key={key}
      className="blog-styled-box"
      style={style}
    >
      {heading ? (
        <div className="blog-styled-box-heading">
          {heading}
        </div>
      ) : null}

      {text ? (
        <div className="blog-styled-box-text">
          {text}
        </div>
      ) : null}
    </aside>
  )
}

/* ============================================================
   CTA BUTTON
   ============================================================ */

function renderCtaButton(
  node: RichTextNode,
  key: string,
): ReactNode {
  const record = getNodeRecord(node)

  const fields =
    isRecord(record.fields)
      ? record.fields
      : record

  const label =
    asString(fields.label) ||
    'Learn more'

  const url =
    asString(fields.url) ||
    '#'

  const external =
    /^https?:\/\//i.test(url)

  return (
    <div
      key={key}
      className="blog-cta"
    >
      <a
        href={url}
        className="blog-cta-button"
        {...(external
          ? {
              target: '_blank',
              rel: 'noopener noreferrer',
            }
          : {})}
      >
        {label}
        <span
          aria-hidden="true"
          className="blog-cta-arrow"
        >
          →
        </span>
      </a>
    </div>
  )
}

/* ============================================================
   BLOCK NODE
   ============================================================ */

function renderBlock(
  node: RichTextNode,
  key: string,
): ReactNode {
  const record = getNodeRecord(node)

  const fields =
    isRecord(record.fields)
      ? record.fields
      : {}

  const blockType =
    asString(
      fields.blockType,
    ) ||
    asString(
      record.blockType,
    )

  switch (blockType) {
    case 'styledBox':
      return renderStyledBox(
        node,
        key,
      )

    case 'ctaButton':
      return renderCtaButton(
        node,
        key,
      )

    case 'videoEmbed':
      return renderVideoEmbed(
        node,
        key,
      )

    case 'videoFile':
      return renderVideoFile(
        node,
        key,
      )

    case 'audio':
      return renderAudio(
        node,
        key,
      )

    case 'code':
    case 'codeBlock':
      return renderCodeBlock(
        node,
        key,
      )

    default:
      /*
       * Some Payload versions keep a block's inner Lexical children
       * alongside the fields. Do not silently lose those children.
       */
      if (
        Array.isArray(record.children)
      ) {
        return (
          <div
            key={key}
            className="blog-unknown-block"
          >
            {renderChildren(
              record.children,
            )}
          </div>
        )
      }

      return null
  }
}

/* ============================================================
   HEADING
   ============================================================ */

function renderHeading(
  node: RichTextNode,
  key: string,
): ReactNode {
  const record = getNodeRecord(node)

  const text =
    getText(node).trim()

  const id =
    createHeadingId(
      text,
      key,
    )

  const children =
    renderChildren(
      record.children,
    )

  switch (record.tag) {
    case 'h1':
      return (
        <h1 key={key} id={id}>
          {children}
        </h1>
      )

    case 'h3':
      return (
        <h3 key={key} id={id}>
          {children}
        </h3>
      )

    case 'h4':
      return (
        <h4 key={key} id={id}>
          {children}
        </h4>
      )

    case 'h5':
      return (
        <h5 key={key} id={id}>
          {children}
        </h5>
      )

    case 'h6':
      return (
        <h6 key={key} id={id}>
          {children}
        </h6>
      )

    case 'h2':
    default:
      return (
        <h2 key={key} id={id}>
          {children}
        </h2>
      )
  }
}

/* ============================================================
   LIST
   ============================================================ */

function renderList(
  node: RichTextNode,
  key: string,
): ReactNode {
  const record = getNodeRecord(node)

  const ordered =
    record.listType === 'number' ||
    record.listType === 'ordered' ||
    record.listType === 'ol'

  if (ordered) {
    return (
      <ol key={key}>
        {renderChildren(
          record.children,
        )}
      </ol>
    )
  }

  return (
    <ul key={key}>
      {renderChildren(
        record.children,
      )}
    </ul>
  )
}

/* ============================================================
   PARAGRAPH
   ============================================================

   Lexical/Payload frequently serializes a standalone image, table, or
   custom block as the sole child of a "paragraph" node (this is normal
   editor behavior, not malformed data). If we always wrap paragraph
   children in <p>, block-level output like <figure>, <div>, <table>, or
   <aside> ends up nested inside a <p>, which is invalid HTML and causes
   React hydration mismatches.

   This helper detects block-level children and keeps them out of any
   <p> wrapper: a paragraph made up entirely of block-level nodes renders
   as a <div>, and mixed content is split into inline <p> runs with
   block-level nodes rendered as siblings in between.
   ============================================================ */

function isBlockLevelNode(
  node: RichTextNode,
): boolean {
  const record = getNodeRecord(node)

  return (
    record.type === 'upload' ||
    record.type === 'image' ||
    record.type === 'block' ||
    record.type === 'table' ||
    record.type === 'horizontalrule' ||
    record.type === 'horizontalRule' ||
    record.type === 'hr'
  )
}

function renderParagraph(
  children: RichTextNode[] | undefined,
  key: string,
): ReactNode {
  const list = Array.isArray(children)
    ? children
    : []

  if (list.length === 0) {
    return <p key={key} />
  }

  // Common case: a paragraph whose only content is an image/table/block.
  // Skip the <p> wrapper entirely.
  if (list.every(isBlockLevelNode)) {
    return (
      <div
        key={key}
        className="blog-paragraph-block"
      >
        {list.map((child, index) =>
          renderNode(
            child,
            `${key}-${child.type || 'node'}-${index}`,
          ),
        )}
      </div>
    )
  }

  // Mixed content: group consecutive inline nodes into <p> runs, and
  // render block-level nodes as siblings in between, never inside a <p>.
  const segments: ReactNode[] = []
  let inlineRun: RichTextNode[] = []
  let runIndex = 0

  const flushInline = () => {
    if (inlineRun.length === 0) {
      return
    }

    segments.push(
      <p key={`${key}-p-${runIndex}`}>
        {inlineRun.map((child, index) =>
          renderNode(
            child,
            `${key}-p-${runIndex}-${child.type || 'node'}-${index}`,
          ),
        )}
      </p>,
    )

    runIndex += 1
    inlineRun = []
  }

  list.forEach((child, index) => {
    if (isBlockLevelNode(child)) {
      flushInline()
      segments.push(
        renderNode(
          child,
          `${key}-block-${child.type || 'node'}-${index}`,
        ),
      )
    } else {
      inlineRun.push(child)
    }
  })

  flushInline()

  return (
    <div
      key={key}
      className="blog-paragraph-group"
    >
      {segments}
    </div>
  )
}

/* ============================================================
   NODE
   ============================================================ */

function renderNode(
  node: RichTextNode,
  key: string,
): ReactNode {
  const record = getNodeRecord(node)

  switch (record.type) {
    case 'text':
      return renderText(
        node,
        key,
      )

    case 'paragraph':
      return renderParagraph(
        record.children,
        key,
      )

    case 'heading':
      return renderHeading(
        node,
        key,
      )

    case 'list':
      return renderList(
        node,
        key,
      )

    case 'listitem':
    case 'list-item':
      return (
        <li key={key}>
          {renderChildren(
            record.children,
          )}
        </li>
      )

    case 'quote':
    case 'blockquote':
      return (
        <blockquote key={key}>
          {renderChildren(
            record.children,
          )}
        </blockquote>
      )

    case 'horizontalrule':
    case 'horizontalRule':
    case 'hr':
      return <hr key={key} />

    case 'linebreak':
    case 'lineBreak':
      return <br key={key} />

    case 'link':
      return renderLink(
        node,
        key,
      )

    case 'upload':
      return renderUpload(
        node,
        key,
      )

    case 'table':
      return renderTable(
        node,
        key,
      )

    case 'tablerow':
    case 'tableRow':
      return renderTableRow(
        record,
        key,
      )

    case 'tablecell':
    case 'tableCell':
    case 'tablecellheader':
    case 'tableCellHeader':
      return renderTableCell(
        record,
        key,
      )

    case 'code':
      return renderCodeBlock(
        node,
        key,
      )

    case 'block':
      return renderBlock(
        node,
        key,
      )

    /*
     * Defensive support for a few serialized variants that can appear
     * after editor upgrades or older migrations.
     */
    case 'image':
      return renderUpload(
        {
          ...node,
          type: 'upload',
        } as RichTextNode,
        key,
      )

    case 'videoEmbed':
      return renderVideoEmbed(
        node,
        key,
      )

    case 'videoFile':
      return renderVideoFile(
        node,
        key,
      )

    case 'audio':
      return renderAudio(
        node,
        key,
      )

    case 'styledBox':
      return renderStyledBox(
        node,
        key,
      )

    case 'ctaButton':
      return renderCtaButton(
        node,
        key,
      )

    default:
      /*
       * Never discard unknown nested content. If a future Payload
       * feature introduces another node type, its children still
       * remain visible instead of making the article disappear.
       */
      if (
        Array.isArray(record.children)
      ) {
        return (
          <div
            key={key}
            className="blog-rich-text-unknown"
          >
            {renderChildren(
              record.children,
            )}
          </div>
        )
      }

      if (
        typeof record.text === 'string'
      ) {
        return renderText(
          node,
          key,
        )
      }

      return null
  }
}

/* ============================================================
   MAIN
   ============================================================ */

export default function RichTextRenderer({
  content,
}: RichTextRendererProps) {
  if (
    !content ||
    !content.root ||
    !Array.isArray(
      content.root.children,
    )
  ) {
    return null
  }

  return (
    <div className="blog-rich-text">
      {renderChildren(
        content.root.children,
      )}
    </div>
  )
}