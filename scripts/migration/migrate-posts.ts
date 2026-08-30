import dotenv from 'dotenv'
import { JSDOM } from 'jsdom'
import {
  convertHTMLToLexical,
  editorConfigFactory,
} from '@payloadcms/richtext-lexical'
import { getPayload } from 'payload'

// ⬇ NEW — needed so the migration uses the EXACT same editor config
// (Table, TextState colors/backgrounds, custom Link fields, Blocks)
// as your real Posts.ts, instead of Payload's generic defaults.
import { Posts } from '../../src/collections/Posts'

// ============================================================
// ENV
// ============================================================

dotenv.config({
  path: '.env',
})

// Load Payload config only after .env is loaded.
const { default: configPromise } = await import(
  '../../src/payload.config'
)

const config = await configPromise

// ============================================================
// TYPES
// ============================================================

type WPRendered = {
  rendered?: string
  protected?: boolean
}

type WPPost = {
  id: number
  date: string
  modified: string
  slug: string
  status: string
  type: string

  link?: string

  title: WPRendered
  content: WPRendered
  excerpt: WPRendered

  author: number
  featured_media: number

  categories: number[]
  tags: number[]

  sticky?: boolean
  meta?: unknown
}

type MediaMaps = {
  byWordPressId: Map<number, number>
  byOriginalUrl: Map<string, number>
  byPath: Map<string, number>
  byFilename: Map<string, number>
  allPayloadIds: Set<number>
}

type MigrationStats = {
  contentImagesFound: number
  contentImagesMapped: number
  contentImagesUnmapped: number
  contentImagesAutoUploaded: number
  contentAudioAutoUploaded: number
  contentVideoAutoUploaded: number
  uploadNodesNormalized: number
  uploadNodesRejected: number
  invalidLinksFixed: number
  unsupportedElements: number
  // ⬇ NEW
  backgroundColorsSnapped: number
}

// ============================================================
// WORDPRESS API
// ============================================================

const WORDPRESS_API_URL =
  process.env.WORDPRESS_API_URL ||
  'https://staging.alloypress.com/wp-json/wp/v2'

// ============================================================
// TEXT HELPERS
// ============================================================

function cleanText(value: string | undefined): string {
  if (!value) {
    return ''
  }

  return value
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#039;/gi, "'")
    .replace(/&#8211;/gi, '–')
    .replace(/&#8212;/gi, '—')
    .replace(/&#8216;/gi, '‘')
    .replace(/&#8217;/gi, '’')
    .replace(/&#8220;/gi, '“')
    .replace(/&#8221;/gi, '”')
    .replace(/\s+/g, ' ')
    .trim()
}

// ============================================================
// URL NORMALIZATION
// ============================================================

function normalizeUrl(value: string): string {
  try {
    const url = new URL(value)
    url.hash = ''
    return url.toString().replace(/\/$/, '')
  } catch {
    return value.trim().replace(/\/$/, '')
  }
}

function normalizePath(value: string): string | null {
  try {
    return new URL(value).pathname
  } catch {
    return null
  }
}

/**
 * WordPress frequently stores resized images/videos like:
 *   image-1024x683.jpg
 * The original media record may just be: image.jpg
 * This strips the WordPress generated size suffix.
 */
function stripWordPressSizeSuffix(value: string): string {
  return value.replace(/-\d{2,5}x\d{2,5}(?=\.[a-z0-9]+$)/i, '')
}

function normalizeImagePath(value: string): string | null {
  const path = normalizePath(value)
  if (!path) {
    return null
  }
  return stripWordPressSizeSuffix(path)
}

function normalizeFilename(value: string): string {
  const path = normalizeImagePath(value)
  if (!path) {
    return value.split('/').pop()?.split('?')[0]?.toLowerCase() || ''
  }
  return path.split('/').pop()?.toLowerCase() || ''
}

// ============================================================
// FETCH ALL POSTS
// ============================================================

async function fetchAllPosts(): Promise<WPPost[]> {
  const posts: WPPost[] = []
  let page = 1
  const perPage = 100

  while (true) {
    const url = `${WORDPRESS_API_URL}/posts?per_page=${perPage}&page=${page}`
    console.log(`Fetching WordPress posts page ${page}...`)

    const response = await fetch(url)

    if (response.status === 400) {
      break
    }

    if (!response.ok) {
      throw new Error(
        `WordPress API failed: ${response.status} ${response.statusText}`,
      )
    }

    const data = (await response.json()) as WPPost[]

    if (!Array.isArray(data) || data.length === 0) {
      break
    }

    posts.push(...data)

    const totalPages = Number(
      response.headers.get('X-WP-TotalPages') || page,
    )

    if (page >= totalPages) {
      break
    }

    page++
  }

  return posts
}

// ============================================================
// CATEGORY / TAG / USER MAPS
// ============================================================

async function buildCategoryMap(payload: any): Promise<Map<number, number>> {
  const map = new Map<number, number>()

  const result = await payload.find({
    collection: 'categories',
    limit: 1000,
    pagination: false,
    depth: 0,
  })

  for (const category of result.docs) {
    const wordpressId = category.legacy?.wordpressId
    if (typeof wordpressId === 'number') {
      map.set(wordpressId, Number(category.id))
    }
  }

  return map
}

async function buildTagMap(payload: any): Promise<Map<number, number>> {
  const map = new Map<number, number>()

  const result = await payload.find({
    collection: 'tags',
    limit: 1000,
    pagination: false,
    depth: 0,
  })

  for (const tag of result.docs) {
    const wordpressId = tag.legacy?.wordpressId
    if (typeof wordpressId === 'number') {
      map.set(wordpressId, Number(tag.id))
    }
  }

  return map
}

async function buildUserMap(payload: any): Promise<Map<number, number>> {
  const map = new Map<number, number>()

  const result = await payload.find({
    collection: 'users',
    limit: 1000,
    pagination: false,
    depth: 0,
  })

  for (const user of result.docs) {
    const wordpressId = user.legacy?.wordpressId
    if (typeof wordpressId === 'number') {
      map.set(wordpressId, Number(user.id))
    }
  }

  return map
}

// ============================================================
// MEDIA MAP
// ============================================================

async function buildMediaMaps(payload: any): Promise<MediaMaps> {
  const byWordPressId = new Map<number, number>()
  const byOriginalUrl = new Map<string, number>()
  const byPath = new Map<string, number>()
  const byFilename = new Map<string, number>()
  const allPayloadIds = new Set<number>()

  const result = await payload.find({
    collection: 'media',
    limit: 5000,
    pagination: false,
    depth: 0,
  })

  for (const media of result.docs) {
    const payloadId = Number(media.id)

    if (!Number.isFinite(payloadId)) {
      continue
    }

    allPayloadIds.add(payloadId)

    if (typeof media.wordpressId === 'number') {
      byWordPressId.set(media.wordpressId, payloadId)
    }

    if (typeof media.originalUrl === 'string') {
      const normalized = normalizeUrl(media.originalUrl)
      byOriginalUrl.set(normalized, payloadId)

      const path = normalizePath(media.originalUrl)
      if (path) {
        byPath.set(path, payloadId)
        byPath.set(stripWordPressSizeSuffix(path), payloadId)
      }

      const filename = normalizeFilename(media.originalUrl)
      if (filename) {
        byFilename.set(filename, payloadId)
      }
    }

    if (typeof media.filename === 'string') {
      const filename = normalizeFilename(media.filename)
      if (filename) {
        byFilename.set(filename, payloadId)
      }

      const publicURL = process.env.R2_PUBLIC_URL
      if (publicURL) {
        const candidate = `${publicURL.replace(/\/$/, '')}/${media.filename}`
        byOriginalUrl.set(normalizeUrl(candidate), payloadId)
      }
    }
  }

  return { byWordPressId, byOriginalUrl, byPath, byFilename, allPayloadIds }
}

// ============================================================
// FIND MEDIA (local lookup — no network)
// ============================================================

function findMediaId(
  sourceUrl: string,
  mediaMaps: MediaMaps,
): number | undefined {
  if (!sourceUrl) {
    return undefined
  }

  const normalized = normalizeUrl(sourceUrl)

  // 1. Exact URL
  const exact = mediaMaps.byOriginalUrl.get(normalized)
  if (exact) {
    return exact
  }

  // 2. Exact path
  const sourcePath = normalizePath(normalized)
  if (sourcePath) {
    const exactPath = mediaMaps.byPath.get(sourcePath)
    if (exactPath) {
      return exactPath
    }
  }

  // 3. WordPress resized image/video path
  const normalizedImagePath = normalizeImagePath(normalized)
  if (normalizedImagePath) {
    const resizedMatch = mediaMaps.byPath.get(normalizedImagePath)
    if (resizedMatch) {
      return resizedMatch
    }
  }

  // 4. Filename fallback
  const filename = normalizeFilename(normalized)
  if (filename) {
    const filenameMatch = mediaMaps.byFilename.get(filename)
    if (filenameMatch) {
      return filenameMatch
    }
  }

  return undefined
}

// ============================================================
// ON-DEMAND MEDIA UPLOAD
// ============================================================
//
// This is the actual fix for posts whose inline media wasn't in
// the media library yet.
//
// findMediaId() only checks media ALREADY in Payload (populated by
// a separate, earlier media-migration step). If that earlier step
// missed a file (wrong URL, webp edge case, dotted filename, etc),
// findMediaId() correctly returns undefined — but previously the
// post was then hard-failed instead of being recovered.
//
// This function closes that gap: it fetches the file directly from
// the WordPress source URL and uploads it into the Payload `media`
// collection right now, then warms every local lookup cache so any
// later reference to the same URL (same post or a different post)
// reuses this record instead of re-uploading.
//
// Works for images, audio files, and self-hosted video files —
// anything payload.create() with a `file` buffer accepts.
// ============================================================

async function ensureMediaUploaded(
  sourceUrl: string,
  mediaMaps: MediaMaps,
  payload: any,
): Promise<number | undefined> {
  const normalized = normalizeUrl(sourceUrl)

  const already = mediaMaps.byOriginalUrl.get(normalized)
  if (already) {
    return already
  }

  try {
    const response = await fetch(sourceUrl)

    if (!response.ok) {
      console.warn(
        `    ⚠ On-demand fetch failed (${response.status}): ${sourceUrl}`,
      )
      return undefined
    }

    const arrayBuffer = await response.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const filename =
      sourceUrl.split('/').pop()?.split('?')[0] ||
      `migrated-${Date.now()}`

    const mimetype =
      response.headers.get('content-type') ||
      'application/octet-stream'

    const created = await payload.create({
      collection: 'media',
      data: {
        alt: filename,
        originalUrl: sourceUrl,
      },
      file: {
        data: buffer,
        mimetype,
        name: filename,
        size: buffer.length,
      },
    })

    const payloadId = Number(created.id)

    if (!Number.isFinite(payloadId)) {
      console.warn(
        `    ⚠ On-demand upload returned an invalid ID for: ${sourceUrl}`,
      )
      return undefined
    }

    // Warm every cache so future lookups (this post or later posts)
    // hit the map instead of re-uploading the same file again.
    mediaMaps.byOriginalUrl.set(normalized, payloadId)
    mediaMaps.allPayloadIds.add(payloadId)

    const path = normalizePath(sourceUrl)
    if (path) {
      mediaMaps.byPath.set(path, payloadId)
      mediaMaps.byPath.set(stripWordPressSizeSuffix(path), payloadId)
    }

    const fname = normalizeFilename(sourceUrl)
    if (fname) {
      mediaMaps.byFilename.set(fname, payloadId)
    }

    console.log(
      `    ↳ Auto-uploaded missing media: ${filename} → Payload ID ${payloadId}`,
    )

    return payloadId
  } catch (error) {
    console.warn(`    ⚠ On-demand upload threw for ${sourceUrl}:`, error)
    return undefined
  }
}

// ============================================================
// ⬇ NEW — BACKGROUND COLOR SNAPPING
// ============================================================
//
// WordPress content can contain arbitrary inline
// `background-color: #xxxxxx` styles from the Divi editor.
// Your Posts.ts TextStateFeature only recognizes a fixed, named
// set of swatches (see textStateConfig.ts -> backgroundColor).
//
// This snaps any arbitrary WP hex color to the CLOSEST configured
// swatch so the editor can recognize and preserve it. If nothing
// is close enough, the background is simply left as-is in the
// HTML (harmless — the built-in converter will just drop a style
// it doesn't recognize). Text content itself is NEVER removed
// either way.
//
// ⚠ REQUIRES: the backgroundColor swatches below must also exist
// in your textStateConfig.ts and be wired into TextStateFeature in
// Posts.ts. Without that companion change, this block still runs
// safely, it just won't have any swatch to snap onto.
// ============================================================

const BG_SWATCHES: Record<string, string> = {
  '#D9F99D': 'green',
  '#FEF9C3': 'yellow',
  '#DBEAFE': 'blue',
  '#FEE2E2': 'red',
  '#F3F4F6': 'gray',
}

function hexDistance(a: string, b: string): number {
  const pa = a.match(/\w\w/g)?.map((x) => parseInt(x, 16)) || [0, 0, 0]
  const pb = b.match(/\w\w/g)?.map((x) => parseInt(x, 16)) || [0, 0, 0]
  return Math.sqrt(
    (pa[0] - pb[0]) ** 2 + (pa[1] - pb[1]) ** 2 + (pa[2] - pb[2]) ** 2,
  )
}

function rgbToHex(rgb: string): string | null {
  const match = rgb.match(/\d+/g)
  if (!match || match.length < 3) return null
  return (
    '#' +
    match
      .slice(0, 3)
      .map((n) => Number(n).toString(16).padStart(2, '0'))
      .join('')
      .toUpperCase()
  )
}

function snapBackgroundColors(
  document: Document,
  stats: MigrationStats,
): void {
  const bgElements = document.querySelectorAll(
    '[style*="background-color"]',
  )

  for (const el of Array.from(bgElements)) {
    const styleAttr = el.getAttribute('style') || ''
    const match = styleAttr.match(/background-color:\s*([^;]+)/i)

    if (!match) continue

    const raw = match[1].trim()
    const hex = raw.startsWith('#') ? raw.toUpperCase() : rgbToHex(raw)

    if (!hex) continue

    let closestSwatch: string | null = null
    let closestDistance = Infinity

    for (const swatchHex of Object.keys(BG_SWATCHES)) {
      const distance = hexDistance(hex, swatchHex)
      if (distance < closestDistance) {
        closestDistance = distance
        closestSwatch = swatchHex
      }
    }

    // Threshold: only snap if reasonably close (avoid forcing an
    // unrelated color, like a dark text background, onto a bright
    // swatch it has nothing to do with).
    if (closestSwatch && closestDistance < 150) {
      el.setAttribute(
        'style',
        styleAttr.replace(
          /background-color:\s*[^;]+/i,
          `background-color: ${closestSwatch}`,
        ),
      )

      stats.backgroundColorsSnapped++
    }
  }
}

// ============================================================
// PREPARE WORDPRESS HTML
// ============================================================
//
// IMPORTANT:
// - Mapped images/audio/video receive Payload upload attributes.
// - Unmapped media is NEVER removed. We first try to auto-upload it
//   on demand (ensureMediaUploaded). Only if that also fails (e.g.
//   a genuinely dead/404 source URL) does the original element get
//   preserved untouched, and the post fails verification instead of
//   silently losing content.
// ============================================================

async function prepareHTML(
  html: string,
  mediaMaps: MediaMaps,
  stats: MigrationStats,
  payload: any,
): Promise<string> {
  if (!html.trim()) {
    return '<p></p>'
  }

  const JSDOMCtor =
    (JSDOM as any)?.JSDOM ??
    (JSDOM as any)?.default?.JSDOM ??
    JSDOM

  if (typeof JSDOMCtor !== 'function') {
    throw new Error(
      'JSDOM constructor is unavailable. Check the installed jsdom package.',
    )
  }

  const dom = new JSDOMCtor(`<!DOCTYPE html><body>${html}</body>`)
  const document: Document = dom.window.document

  // --------------------------------------------------------------
  // ⬇ NEW — BACKGROUND COLOR (runs before everything else so it
  // doesn't interfere with the image/audio/video/iframe replacement
  // logic below, which operates on different elements entirely).
  // --------------------------------------------------------------

  snapBackgroundColors(document, stats)

  // --------------------------------------------------------------
  // IMAGES
  // --------------------------------------------------------------

  const images = document.querySelectorAll('img')

  for (const image of Array.from(images)) {
    stats.contentImagesFound++

    const src =
      image.getAttribute('src') ||
      image.getAttribute('data-src') ||
      image.getAttribute('data-lazy-src') ||
      image.getAttribute('data-original')

    if (!src) {
      stats.contentImagesUnmapped++
      console.warn(
        '    ⚠ Image has no usable source. Original <img> preserved.',
      )
      continue
    }

    let mediaId = findMediaId(src, mediaMaps)

    if (!mediaId) {
      mediaId = await ensureMediaUploaded(src, mediaMaps, payload)
      if (mediaId) {
        stats.contentImagesAutoUploaded++
      }
    }

    if (!mediaId) {
      stats.contentImagesUnmapped++
      console.warn(
        `    ⚠ Content image not mapped (auto-upload failed too): ${src}`,
      )
      image.setAttribute('data-migration-unmapped-image', 'true')
      continue
    }

    stats.contentImagesMapped++
    image.setAttribute('data-lexical-upload-id', String(mediaId))
    image.setAttribute('data-lexical-upload-relation-to', 'media')
  }

  // --------------------------------------------------------------
  // AUDIO
  // --------------------------------------------------------------
  //
  // Replaced with a unique marker paragraph, converted into the
  // real Payload "audio" block after HTML -> Lexical (see
  // replaceMarkerParagraphs below).
  // --------------------------------------------------------------

  const audioElements = document.querySelectorAll('audio')

  for (const audio of Array.from(audioElements)) {
    const src =
      audio.getAttribute('src') ||
      audio.querySelector('source')?.getAttribute('src')

    if (!src) {
      continue
    }

    let mediaId = findMediaId(src, mediaMaps)

    if (!mediaId) {
      mediaId = await ensureMediaUploaded(src, mediaMaps, payload)
      if (mediaId) {
        stats.contentAudioAutoUploaded++
      }
    }

    if (!mediaId) {
      console.warn(
        `    ⚠ Audio media not mapped (auto-upload failed too): ${src}. Original element preserved.`,
      )
      audio.setAttribute('data-migration-unmapped-audio', 'true')
      continue
    }

    const title =
      audio.getAttribute('title') ||
      audio.querySelector('track')?.getAttribute('label') ||
      ''

    const caption =
      audio.parentElement?.querySelector('figcaption')
        ?.textContent
        ?.trim() || ''

    const marker =
      `__WP_PAYLOAD_AUDIO__${mediaId}__${encodeURIComponent(title)}|${encodeURIComponent(caption)}__`

    const markerElement = document.createElement('p')
    markerElement.setAttribute('data-wp-payload-block', 'audio')
    markerElement.setAttribute('data-wp-payload-media-id', String(mediaId))
    markerElement.setAttribute('data-wp-payload-title', title)
    markerElement.setAttribute('data-wp-payload-caption', caption)
    markerElement.textContent = marker

    audio.replaceWith(markerElement)
  }

  // --------------------------------------------------------------
  // SELF-HOSTED VIDEO (<video> tags — VideoPress/self-hosted mp4,
  // NOT YouTube/Vimeo iframe embeds, which are handled separately
  // below). Same marker-block technique as audio, so it never
  // depends on Lexical's default <img>-only upload converter.
  //
  // ⚠ ASSUMPTION: this emits blockType "videoFile". If your
  // Posts.ts blocks config uses a different blockType name for
  // self-hosted video, rename it in TWO places: here, and in the
  // videoFileMatch regex inside replaceMarkerParagraphs() below.
  // --------------------------------------------------------------

  const videoElements = document.querySelectorAll('video')

  for (const video of Array.from(videoElements)) {
    const src =
      video.getAttribute('src') ||
      video.querySelector('source')?.getAttribute('src')

    if (!src) {
      continue
    }

    let mediaId = findMediaId(src, mediaMaps)

    if (!mediaId) {
      mediaId = await ensureMediaUploaded(src, mediaMaps, payload)
      if (mediaId) {
        stats.contentVideoAutoUploaded++
      }
    }

    if (!mediaId) {
      console.warn(
        `    ⚠ Video media not mapped (auto-upload failed too): ${src}. Original element preserved.`,
      )
      video.setAttribute('data-migration-unmapped-video', 'true')
      continue
    }

    const caption =
      video.parentElement?.querySelector('figcaption')
        ?.textContent
        ?.trim() || ''

    const marker =
      `__WP_PAYLOAD_VIDEOFILE__${mediaId}__${encodeURIComponent(caption)}__`

    const markerElement = document.createElement('p')
    markerElement.setAttribute('data-wp-payload-block', 'videoFile')
    markerElement.setAttribute('data-wp-payload-media-id', String(mediaId))
    markerElement.setAttribute('data-wp-payload-caption', caption)
    markerElement.textContent = marker

    video.replaceWith(markerElement)
  }

  // --------------------------------------------------------------
  // VIDEO / EMBEDS (YouTube, Vimeo, etc via <iframe>)
  // --------------------------------------------------------------

  const iframes = document.querySelectorAll('iframe')

  for (const iframe of Array.from(iframes)) {
    const src =
      iframe.getAttribute('src') || iframe.getAttribute('data-src')

    if (!src) {
      continue
    }

    const provider =
      /youtube(?:-nocookie)?\.com|youtu\.be/i.test(src)
        ? 'youtube'
        : /vimeo\.com/i.test(src)
          ? 'vimeo'
          : 'other'

    const marker = `__WP_PAYLOAD_VIDEO__${encodeURIComponent(src)}|${provider}__`

    const markerElement = document.createElement('p')
    markerElement.setAttribute('data-wp-payload-block', 'videoEmbed')
    markerElement.setAttribute('data-wp-payload-url', src)
    markerElement.setAttribute('data-wp-payload-provider', provider)
    markerElement.textContent = marker

    iframe.replaceWith(markerElement)
  }

  return document.body.innerHTML
}

// ============================================================
// NORMALIZE LEXICAL UPLOAD NODES
// ============================================================
//
// Payload's HTML converter can produce an upload node whose value
// is a string ("393") instead of a number (393). This normalizes
// it, and rejects (instead of silently dropping) any upload node
// that still doesn't resolve to a real Payload media ID after
// normalization — this should now be extremely rare since
// prepareHTML() auto-uploads anything missing before we even get
// here.
// ============================================================

function normalizeLexicalUploadNodes(
  value: any,
  mediaIds: Set<number>,
  stats: MigrationStats,
): any {
  if (value === null || value === undefined) {
    return value
  }

  if (Array.isArray(value)) {
    return value.map((item) =>
      normalizeLexicalUploadNodes(item, mediaIds, stats),
    )
  }

  if (typeof value !== 'object') {
    return value
  }

  const node = { ...value }

  if (node.type === 'upload') {
    const relationTo =
      node.relationTo || node.relationToCollection || 'media'

    if (relationTo !== 'media') {
      return node
    }

    let mediaId: number | undefined

    if (typeof node.value === 'number') {
      mediaId = node.value
    } else if (typeof node.value === 'string') {
      const parsed = Number(node.value)
      if (Number.isFinite(parsed)) {
        mediaId = parsed
      }
    } else if (node.value && typeof node.value === 'object') {
      const parsed = Number(node.value.id)
      if (Number.isFinite(parsed)) {
        mediaId = parsed
      }
    }

    if (!mediaId || !mediaIds.has(mediaId)) {
      stats.uploadNodesRejected++
      throw new Error(
        `Invalid Payload upload node encountered. ` +
        `Media ID "${String(node.value)}" does not exist in media collection. ` +
        `No content was removed. Fix the media mapping and rerun this post.`,
      )
    }

    node.type = 'upload'
    node.relationTo = 'media'
    node.value = mediaId
    node.fields = node.fields ?? {}
    node.format = typeof node.format === 'string' ? node.format : ''
    node.version = typeof node.version === 'number' ? node.version : 3

    stats.uploadNodesNormalized++

    return node
  }

  for (const key of Object.keys(node)) {
    node[key] = normalizeLexicalUploadNodes(node[key], mediaIds, stats)
  }

  return node
}

// ============================================================
// SANITIZE INVALID LINK URLS
// ============================================================
//
// Some WordPress content contains <a> tags whose href is NOT a
// real URL — the anchor's own visible text got pasted into the
// href attribute on the WordPress side. Payload's LinkFeature
// validates the `url` field on "custom" links and rejects those,
// surfacing as a generic ValidationError with no indication of
// which link caused it.
//
// This walks the entire lexical tree, finds every "link" node
// with an invalid `fields.url`, and unwraps it — keeping the
// visible link text as plain text, but removing the broken href
// so the post can save.
// ============================================================

function isValidHttpUrl(value: unknown): boolean {
  if (typeof value !== 'string') {
    return false
  }

  const trimmed = value.trim()

  if (!trimmed) {
    return false
  }

  if (/\s/.test(trimmed)) {
    return false
  }

  if (trimmed.length > 300) {
    return false
  }

  if (trimmed.startsWith('#')) {
    return /^#[a-zA-Z0-9\-_]*$/.test(trimmed)
  }

  if (trimmed.startsWith('/')) {
    return true
  }

  try {
    const url = new URL(trimmed)
    return (
      url.protocol === 'http:' ||
      url.protocol === 'https:' ||
      url.protocol === 'mailto:' ||
      url.protocol === 'tel:'
    )
  } catch {
    return false
  }
}

function sanitizeLinkNodesInChildren(
  children: any[],
  stats: MigrationStats,
): any[] {
  const output: any[] = []

  for (const node of children) {
    if (!node || typeof node !== 'object') {
      output.push(node)
      continue
    }

    let fixedNode = node

    if (Array.isArray(node.children)) {
      fixedNode = {
        ...node,
        children: sanitizeLinkNodesInChildren(node.children, stats),
      }
    }

    if (fixedNode.type === 'link') {
      const linkType = fixedNode.fields?.linkType
      const url = fixedNode.fields?.url

      if (linkType === 'custom' && !isValidHttpUrl(url)) {
        console.warn(
          `    ⚠ Invalid link URL removed (unwrapped to plain text): ${String(
            url,
          ).slice(0, 80)}...`,
        )

        stats.invalidLinksFixed++

        output.push(...(fixedNode.children || []))
        continue
      }
    }

    output.push(fixedNode)
  }

  return output
}

function sanitizeLexicalLinks(lexicalJSON: any, stats: MigrationStats): any {
  if (!lexicalJSON || typeof lexicalJSON !== 'object') {
    return lexicalJSON
  }

  const root = lexicalJSON.root

  if (!root || !Array.isArray(root.children)) {
    return lexicalJSON
  }

  return {
    ...lexicalJSON,
    root: {
      ...root,
      children: sanitizeLinkNodesInChildren(root.children, stats),
    },
  }
}

// ============================================================
// TEXT OF LEXICAL NODE
// ============================================================

function textOfLexicalNode(node: any): string {
  if (!node || typeof node !== 'object') {
    return ''
  }

  if (typeof node.text === 'string') {
    return node.text
  }

  if (Array.isArray(node.children)) {
    return node.children
      .map((child: any) => textOfLexicalNode(child))
      .join('')
  }

  return ''
}

// ============================================================
// REPLACE MARKER PARAGRAPHS WITH REAL BLOCKS
// ============================================================

function replaceMarkerParagraphs(lexicalJSON: any): any {
  const root = lexicalJSON?.root

  if (!root || !Array.isArray(root.children)) {
    return lexicalJSON
  }

  const replaceChildren = (children: any[]): any[] => {
    const output: any[] = []

    for (const node of children) {
      if (
        node &&
        typeof node === 'object' &&
        Array.isArray(node.children)
      ) {
        const replacedChildren = replaceChildren(node.children)
        const cloned = { ...node, children: replacedChildren }
        const text = textOfLexicalNode(cloned)

        // --- AUDIO -------------------------------------------------
        const audioMatch = text.match(
          /^__WP_PAYLOAD_AUDIO__([0-9]+)__([^|]*)\|([^|]*)__$/,
        )

        if (cloned.type === 'paragraph' && audioMatch) {
          output.push({
            type: 'block',
            version: 2,
            fields: {
              blockType: 'audio',
              audio: Number(audioMatch[1]),
              title: decodeURIComponent(audioMatch[2] || ''),
              caption: decodeURIComponent(audioMatch[3] || ''),
            },
          })
          continue
        }

        // --- SELF-HOSTED VIDEO FILE ---------------------------------
        // ⚠ Rename "videoFile" here (and in prepareHTML above) if
        // your Posts.ts blocks config uses a different blockType.
        const videoFileMatch = text.match(
          /^__WP_PAYLOAD_VIDEOFILE__([0-9]+)__([^_]*)__$/,
        )

        if (cloned.type === 'paragraph' && videoFileMatch) {
          output.push({
            type: 'block',
            version: 2,
            fields: {
              blockType: 'videoFile',
              video: Number(videoFileMatch[1]),
              caption: decodeURIComponent(videoFileMatch[2] || ''),
            },
          })
          continue
        }

        // --- VIDEO EMBED (iframe: YouTube/Vimeo/other) --------------
        const videoMatch = text.match(
          /^__WP_PAYLOAD_VIDEO__([^|]+)\|([^|]+)__$/,
        )

        if (cloned.type === 'paragraph' && videoMatch) {
          output.push({
            type: 'block',
            version: 2,
            fields: {
              blockType: 'videoEmbed',
              url: decodeURIComponent(videoMatch[1]),
              provider:
                videoMatch[2] === 'youtube' || videoMatch[2] === 'vimeo'
                  ? videoMatch[2]
                  : 'other',
              caption: '',
            },
          })
          continue
        }

        output.push(cloned)
        continue
      }

      output.push(node)
    }

    return output
  }

  return {
    ...lexicalJSON,
    root: {
      ...root,
      children: replaceChildren(root.children),
    },
  }
}

// ============================================================
// COUNT UPLOAD NODES
// ============================================================

function countUploadNodes(value: any): number {
  if (value === null || value === undefined) {
    return 0
  }

  if (Array.isArray(value)) {
    return value.reduce((total, item) => total + countUploadNodes(item), 0)
  }

  if (typeof value !== 'object') {
    return 0
  }

  let count = value.type === 'upload' ? 1 : 0

  for (const key of Object.keys(value)) {
    count += countUploadNodes(value[key])
  }

  return count
}

// ============================================================
// CONVERT HTML → LEXICAL
// ============================================================

async function convertToLexical(
  html: string,
  editorConfig: any,
  mediaMaps: MediaMaps,
  stats: MigrationStats,
  payload: any,
) {
  // 1. Prepare WordPress HTML, mapping/auto-uploading all media,
  //    snapping background colors to configured swatches.
  const preparedHTML = await prepareHTML(html, mediaMaps, stats, payload)

  // 2. Hard verification EARLY, before spending time on Lexical
  //    conversion. With on-demand auto-upload in place, this should
  //    now only ever fire for a genuinely dead/404 source URL.
  if (stats.contentImagesUnmapped > 0) {
    throw new Error(
      `Content contains ${stats.contentImagesUnmapped} unmapped image(s) ` +
      `that could not be auto-uploaded either (source URL likely dead/404). ` +
      `No image was removed. Check the source URL manually and rerun this post.`,
    )
  }

  // 3. Convert HTML → Lexical.
  let lexicalJSON = convertHTMLToLexical({
    html: preparedHTML,
    editorConfig,
    JSDOM,
  })

  // 4. Fix invalid WordPress links without removing surrounding
  //    article content.
  lexicalJSON = sanitizeLexicalLinks(lexicalJSON, stats)

  // 5. Restore WordPress audio/video/embeds as the exact Payload
  //    custom block types configured in Posts.ts.
  lexicalJSON = replaceMarkerParagraphs(lexicalJSON)

  // 6. Normalize Payload media IDs on any remaining upload nodes
  //    (e.g. from inline images the built-in converter recognized
  //    directly via the data-lexical-upload-id attribute).
  lexicalJSON = normalizeLexicalUploadNodes(
    lexicalJSON,
    mediaMaps.allPayloadIds,
    stats,
  )

  // 7. Final verification: mapped image count must equal actual
  //    upload node count. Fail-fast instead of silently losing
  //    content.
  const uploadNodeCount = countUploadNodes(lexicalJSON)

  console.log(`    ↳ Expected upload nodes: ${stats.contentImagesMapped}`)
  console.log(`    ↳ Actual upload nodes: ${uploadNodeCount}`)

  if (uploadNodeCount !== stats.contentImagesMapped) {
    throw new Error(
      `Content image conversion mismatch. ` +
      `Mapped images: ${stats.contentImagesMapped}, ` +
      `Lexical upload nodes: ${uploadNodeCount}`,
    )
  }

  return lexicalJSON
}

// ============================================================
// FIND EXISTING POST
// ============================================================

async function findExistingPost(payload: any, wordpressId: number) {
  const result = await payload.find({
    collection: 'posts',
    where: {
      'legacy.wordpressId': {
        equals: wordpressId,
      },
    },
    limit: 1,
    depth: 0,
  })

  return result.docs[0] || null
}

// ============================================================
// MIGRATION
// ============================================================

export async function migratePosts() {
  console.log('')
  console.log('========================================')
  console.log(' Starting Post Migration')
  console.log('========================================')
  console.log('')

  const payload = await getPayload({ config })

  const posts = await fetchAllPosts()
  console.log(`Found ${posts.length} WordPress posts`)
  console.log('')

  if (posts.length === 0) {
    console.log('No WordPress posts found.')
    return
  }

  console.log('Loading relationship mappings...')

  const categoryMap = await buildCategoryMap(payload)
  const tagMap = await buildTagMap(payload)
  const userMap = await buildUserMap(payload)
  const mediaMaps = await buildMediaMaps(payload)

  console.log(`Categories mapped: ${categoryMap.size}`)
  console.log(`Tags mapped: ${tagMap.size}`)
  console.log(`Users mapped: ${userMap.size}`)
  console.log(`Media mapped by WordPress ID: ${mediaMaps.byWordPressId.size}`)
  console.log(`Media filename fallbacks: ${mediaMaps.byFilename.size}`)
  console.log('')

  // ⬇ CHANGED — was: editorConfigFactory.default({ config })
  //
  // .default() only loads Payload's generic feature set (no Table,
  // no TextState colors/backgrounds, no your custom Link fields, no
  // Blocks). This resolves the ACTUAL editor config from your real
  // Posts.ts "content" field, so the migration converts HTML using
  // the exact same features your admin panel edits with.
  const contentField = Posts.fields.find(
    (field: any) => field.name === 'content',
  )

  if (!contentField) {
    throw new Error(
      'Could not find the "content" field on the Posts collection. ' +
      'Check that the import path at the top of this file ' +
      '(../../src/collections/Posts) matches your actual file location.',
    )
  }

  const editorConfig = await editorConfigFactory.fromField({
    field: contentField as any,
  })

  let created = 0
  let updated = 0
  let skipped = 0
  let failed = 0

  let totalContentImagesFound = 0
  let totalContentImagesMapped = 0
  let totalContentImagesUnmapped = 0
  let totalContentImagesAutoUploaded = 0
  let totalContentAudioAutoUploaded = 0
  let totalContentVideoAutoUploaded = 0
  let totalUploadNodesNormalized = 0
  let totalUploadNodesRejected = 0
  // ⬇ NEW
  let totalBackgroundColorsSnapped = 0

  for (let index = 0; index < posts.length; index++) {
    const post = posts[index]

    console.log(
      `[${index + 1}/${posts.length}] ${cleanText(post.title?.rendered)}`,
    )

    const stats: MigrationStats = {
      contentImagesFound: 0,
      contentImagesMapped: 0,
      contentImagesUnmapped: 0,
      contentImagesAutoUploaded: 0,
      contentAudioAutoUploaded: 0,
      contentVideoAutoUploaded: 0,
      uploadNodesNormalized: 0,
      uploadNodesRejected: 0,
      invalidLinksFixed: 0,
      unsupportedElements: 0,
      // ⬇ NEW
      backgroundColorsSnapped: 0,
    }

    let content: any = null

    try {
      if (!post.id) {
        console.warn('  ⚠ Missing WordPress post ID. Skipping.')
        skipped++
        continue
      }

      if (!post.slug) {
        console.warn('  ⚠ Missing slug. Skipping.')
        skipped++
        continue
      }

      const wordpressCategoryId = post.categories?.[0]

      if (!wordpressCategoryId) {
        throw new Error('Post has no WordPress category.')
      }

      const payloadCategoryId = categoryMap.get(wordpressCategoryId)

      if (!payloadCategoryId) {
        throw new Error(
          `Category mapping missing. WP category ID: ${wordpressCategoryId}`,
        )
      }

      const payloadAuthorId = userMap.get(post.author)

      if (!payloadAuthorId) {
        throw new Error(`Author mapping missing. WP user ID: ${post.author}`)
      }

      const payloadTagIds: number[] = []

      for (const wordpressTagId of post.tags || []) {
        const payloadTagId = tagMap.get(wordpressTagId)

        if (!payloadTagId) {
          console.warn(`    ⚠ Tag mapping missing: WP ${wordpressTagId}`)
          continue
        }

        payloadTagIds.push(payloadTagId)
      }

      let payloadFeaturedImageId: number | undefined

      if (post.featured_media && post.featured_media > 0) {
        payloadFeaturedImageId = mediaMaps.byWordPressId.get(
          post.featured_media,
        )

        if (
          payloadFeaturedImageId &&
          !mediaMaps.allPayloadIds.has(payloadFeaturedImageId)
        ) {
          throw new Error(
            `Featured image Payload media ID is invalid: ${payloadFeaturedImageId}`,
          )
        }

        if (!payloadFeaturedImageId) {
          console.warn(
            `    ⚠ Featured image mapping missing: WP media ${post.featured_media}`,
          )
        }
      }

      const title = cleanText(post.title?.rendered)

      if (!title) {
        throw new Error('Post title is empty.')
      }

      const excerpt = cleanText(post.excerpt?.rendered)

      const rawContent = post.content?.rendered || '<p></p>'

      content = await convertToLexical(
        rawContent,
        editorConfig,
        mediaMaps,
        stats,
        payload,
      )

      const isPublished = post.status === 'publish'

      let workflowStatus: 'draft' | 'review' | 'published'

      if (post.status === 'publish') {
        workflowStatus = 'published'
      } else if (post.status === 'pending') {
        workflowStatus = 'review'
      } else {
        workflowStatus = 'draft'
      }

      const wpMeta =
        post.meta && typeof post.meta === 'object'
          ? (post.meta as Record<string, any>)
          : {}

      const meta: Record<string, any> = {
        title:
          typeof wpMeta.rank_math_title === 'string'
            ? cleanText(wpMeta.rank_math_title)
            : undefined,

        description:
          typeof wpMeta.rank_math_description === 'string'
            ? cleanText(wpMeta.rank_math_description)
            : undefined,

        focusKeyword:
          typeof wpMeta.rank_math_focus_keyword === 'string'
            ? cleanText(wpMeta.rank_math_focus_keyword)
            : undefined,

        canonicalURL:
          typeof wpMeta.rank_math_canonical_url === 'string'
            ? wpMeta.rank_math_canonical_url.trim()
            : undefined,
      }

      const ogImage =
        typeof wpMeta.rank_math_facebook_image === 'string'
          ? findMediaId(wpMeta.rank_math_facebook_image, mediaMaps)
          : undefined

      const hasOpenGraph =
        wpMeta.rank_math_facebook_title ||
        wpMeta.rank_math_facebook_description ||
        ogImage

      if (hasOpenGraph) {
        meta.openGraph = {
          title:
            typeof wpMeta.rank_math_facebook_title === 'string'
              ? cleanText(wpMeta.rank_math_facebook_title)
              : undefined,

          description:
            typeof wpMeta.rank_math_facebook_description === 'string'
              ? cleanText(wpMeta.rank_math_facebook_description)
              : undefined,

          ...(ogImage ? { image: ogImage } : {}),
        }
      }

      const twitterImage =
        typeof wpMeta.rank_math_twitter_image === 'string'
          ? findMediaId(wpMeta.rank_math_twitter_image, mediaMaps)
          : undefined

      const hasTwitter =
        wpMeta.rank_math_twitter_title ||
        wpMeta.rank_math_twitter_description ||
        twitterImage

      if (hasTwitter) {
        meta.twitter = {
          title:
            typeof wpMeta.rank_math_twitter_title === 'string'
              ? cleanText(wpMeta.rank_math_twitter_title)
              : undefined,

          description:
            typeof wpMeta.rank_math_twitter_description === 'string'
              ? cleanText(wpMeta.rank_math_twitter_description)
              : undefined,

          ...(twitterImage ? { image: twitterImage } : {}),
        }
      }

      // ⬇ NEW — ROBOTS META
      //
      // Matches the exact "robots" / "advancedRobots" group shape
      // registered in payload.config.ts's seoPlugin fields.
      //
      // Rank Math exposes this as either an array
      // ["noindex","nofollow",...] or a comma string, depending on
      // how the site's REST API meta registration was set up.
      // Handled defensively for both shapes. If the key is missing
      // entirely on a given post, this safely falls back to Payload's
      // own defaults (index: true, follow: true, etc) — never throws.
      const rawRobots = wpMeta.rank_math_robots

      const robotsList: string[] = Array.isArray(rawRobots)
        ? rawRobots.map((r: string) => String(r).toLowerCase().trim())
        : typeof rawRobots === 'string'
          ? rawRobots
              .toLowerCase()
              .split(',')
              .map((r) => r.trim())
          : []

      meta.robots = {
        index: !robotsList.includes('noindex'),
        follow: !robotsList.includes('nofollow'),
        noArchive: robotsList.includes('noarchive'),
        noImageIndex: robotsList.includes('noimageindex'),
        noSnippet: robotsList.includes('nosnippet'),
      }

      // Rank Math stores this as a comma string like:
      // "max-snippet:-1,max-video-preview:-1,max-image-preview:large"
      const rawAdvanced =
        typeof wpMeta.rank_math_advanced_robots === 'string'
          ? wpMeta.rank_math_advanced_robots
          : ''

      const advancedPairs: Record<string, string> = Object.fromEntries(
        rawAdvanced
          .split(',')
          .map((pair) => pair.split(':').map((p) => p.trim()))
          .filter((pair) => pair.length === 2) as [string, string][],
      )

      meta.advancedRobots = {
        maxSnippet: Number(advancedPairs['max-snippet']) || -1,

        maxVideoPreview:
          Number(advancedPairs['max-video-preview']) || -1,

        maxImagePreview: ['none', 'standard', 'large'].includes(
          advancedPairs['max-image-preview'],
        )
          ? advancedPairs['max-image-preview']
          : 'large',
      }

      // Payload's generic "Meta Image" field (this was already
      // working — kept exactly as-is).
      meta.image = ogImage || payloadFeaturedImageId

      const data = {
        title,
        slug: post.slug,
        content,
        excerpt,

        meta,

        category: payloadCategoryId,
        tags: payloadTagIds,
        author: payloadAuthorId,

        publishedAt: isPublished ? post.date || undefined : undefined,

        _status: isPublished ? 'published' : 'draft',

        workflowStatus,

        cornerstone: false,

        includeInSitemap: isPublished,

        legacy: {
          wordpressId: post.id,
        },

        ...(payloadFeaturedImageId
          ? { featuredImage: payloadFeaturedImageId }
          : {}),
      } as any

      if (!categoryMap.has(wordpressCategoryId)) {
        throw new Error(
          `Final category verification failed. WP category ID: ${wordpressCategoryId}`,
        )
      }

      if (!userMap.has(post.author)) {
        throw new Error(
          `Final author verification failed. WP user ID: ${post.author}`,
        )
      }

      console.log(`  ↳ Final status: ${post.status} → ${workflowStatus}`)
      console.log(`  ↳ Final publishedAt: ${post.date || 'none'}`)

      const existing = await findExistingPost(payload, post.id)

      if (existing) {
        await payload.update({
          collection: 'posts',
          id: Number(existing.id),
          data,
          draft: !isPublished,
        } as any)

        updated++
        console.log(`  ↳ Updated Payload ID: ${existing.id}`)
      } else {
        const createdPost = await payload.create({
          collection: 'posts',
          data,
          draft: !isPublished,
        } as any)

        created++
        console.log(`  ↳ Created Payload ID: ${createdPost.id}`)
      }

      totalContentImagesFound += stats.contentImagesFound
      totalContentImagesMapped += stats.contentImagesMapped
      totalContentImagesUnmapped += stats.contentImagesUnmapped
      totalContentImagesAutoUploaded += stats.contentImagesAutoUploaded
      totalContentAudioAutoUploaded += stats.contentAudioAutoUploaded
      totalContentVideoAutoUploaded += stats.contentVideoAutoUploaded
      totalUploadNodesNormalized += stats.uploadNodesNormalized
      totalUploadNodesRejected += stats.uploadNodesRejected
      // ⬇ NEW
      totalBackgroundColorsSnapped += stats.backgroundColorsSnapped

      if (stats.contentImagesUnmapped > 0) {
        console.log(`  ⚠ Unmapped inline images: ${stats.contentImagesUnmapped}`)
      }

      if (stats.uploadNodesRejected > 0) {
        console.log(`  ⚠ Invalid upload nodes removed: ${stats.uploadNodesRejected}`)
      }

      if (stats.uploadNodesNormalized > 0) {
        console.log(`  ↳ Upload nodes normalized: ${stats.uploadNodesNormalized}`)
      }

      if (stats.contentImagesAutoUploaded > 0) {
        console.log(`  ↳ Images auto-uploaded on demand: ${stats.contentImagesAutoUploaded}`)
      }

      if (stats.contentAudioAutoUploaded > 0) {
        console.log(`  ↳ Audio auto-uploaded on demand: ${stats.contentAudioAutoUploaded}`)
      }

      if (stats.contentVideoAutoUploaded > 0) {
        console.log(`  ↳ Video auto-uploaded on demand: ${stats.contentVideoAutoUploaded}`)
      }

      // ⬇ NEW
      if (stats.backgroundColorsSnapped > 0) {
        console.log(`  ↳ Background colors snapped to swatches: ${stats.backgroundColorsSnapped}`)
      }

      if (stats.invalidLinksFixed > 0) {
        console.log(`  ⚠ Invalid links unwrapped: ${stats.invalidLinksFixed}`)
      }

      console.log(`  ↳ Category: ${payloadCategoryId}`)
      console.log(`  ↳ Tags: ${payloadTagIds.length}`)
      console.log(`  ↳ Author: ${payloadAuthorId}`)

      if (payloadFeaturedImageId) {
        console.log(`  ↳ Featured Image: ${payloadFeaturedImageId}`)
      }

      console.log(`  ↳ Status: ${post.status} → ${workflowStatus}`)
      console.log('')
    } catch (error) {
      failed++

      console.error(`  ✗ Failed: ${post.slug}`)
      console.error('  FULL PAYLOAD ERROR:')

      if (error instanceof Error) {
        console.error(error.stack)
      } else {
        console.dir(error, { depth: null })
      }

      try {
        const fs = await import('fs')
        fs.writeFileSync(
          `./failed-post-${post.id}-content.json`,
          JSON.stringify(content, null, 2),
        )
        console.error(`  📄 Content dumped to failed-post-${post.id}-content.json`)
      } catch (dumpError) {
        console.error('  Could not dump content:', dumpError)
      }

      console.log('')
      continue
    }
  }

  console.log('')
  console.log('========================================')
  console.log(' Post Migration Completed')
  console.log('========================================')

  console.log(`Total WordPress posts: ${posts.length}`)
  console.log(`Created: ${created}`)
  console.log(`Updated: ${updated}`)
  console.log(`Skipped: ${skipped}`)
  console.log(`Failed: ${failed}`)
  console.log('')

  console.log(`Content images found: ${totalContentImagesFound}`)
  console.log(`Content images mapped: ${totalContentImagesMapped}`)
  console.log(`Content images unmapped: ${totalContentImagesUnmapped}`)
  console.log(`Images auto-uploaded on demand: ${totalContentImagesAutoUploaded}`)
  console.log(`Audio auto-uploaded on demand: ${totalContentAudioAutoUploaded}`)
  console.log(`Video auto-uploaded on demand: ${totalContentVideoAutoUploaded}`)
  console.log(`Upload nodes normalized: ${totalUploadNodesNormalized}`)
  console.log(`Invalid upload nodes rejected: ${totalUploadNodesRejected}`)
  // ⬇ NEW
  console.log(`Background colors snapped to swatches: ${totalBackgroundColorsSnapped}`)
  console.log('')

  if (
    failed === 0 &&
    totalContentImagesMapped === totalUploadNodesNormalized &&
    totalContentImagesUnmapped === 0
  ) {
    console.log('✓ IMAGE MIGRATION VERIFICATION PASSED')
  } else {
    console.log('⚠ IMAGE MIGRATION VERIFICATION REQUIRES REVIEW')
  }

  console.log('========================================')
  console.log('')
}

// ============================================================
// RUN
// ============================================================

migratePosts().catch((error) => {
  console.error('')
  console.error('========================================')
  console.error(' Post Migration Failed')
  console.error('========================================')
  console.error(error)
  console.error('')
  process.exit(1)
})