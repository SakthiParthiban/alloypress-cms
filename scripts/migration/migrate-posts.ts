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
  date?: string
  modified?: string
  slug?: string
  status: string
  type?: string

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

  // Rank Math data may be exposed either inside REST `meta`
  // or as top-level REST fields depending on the WordPress setup.
  rank_math?: Record<string, unknown>
  rank_math_migration?: Record<string, unknown>

  _embedded?: {
    'wp:featuredmedia'?: Array<{
      source_url?: string
    }>
  }
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
  backgroundColorsSnapped: number
  // ⬇ NEW
  styledBoxesFound: number
  styledBoxesConverted: number
  buttonsFound: number
  buttonsConverted: number
  // ⬇ NEW
  widgetsStripped: number
  slugsGeneratedFromTitle: number
  fallbackTitlesGenerated: number
  fallbackCategoriesUsed: number
  fallbackAuthorsUsed: number
  contentConversionFallbacks: number
}

// ============================================================
// WORDPRESS API
// ============================================================

const WORDPRESS_API_URL =
  process.env.WORDPRESS_API_URL ||
  'https://alloypress.com/wp-json/wp/v2'

// ============================================================
// ⬇ NEW — WORDPRESS AUTH (needed to see draft/pending/private posts)
// ============================================================
//
// WordPress REST API only exposes `publish` status content to
// unauthenticated requests. To pull draft/pending/private/future
// posts, we must authenticate using a WordPress Application
// Password (wp-admin → Users → Profile → Application Passwords),
// sent as HTTP Basic Auth.
//
// If WP_USERNAME / WP_APP_PASSWORD are not set in .env, the script
// still runs — but WordPress will silently ignore the `status`
// query param and only return published content.
// ============================================================

function getWordPressAuthHeader(): Record<string, string> {
  const username = process.env.WP_USERNAME?.trim()
  const appPassword = process.env.WP_APP_PASSWORD?.trim()

  if (!username || !appPassword) {
    throw new Error(
      'WP_USERNAME / WP_APP_PASSWORD are required. ' +
      'Complete migration must authenticate with WordPress so publish, ' +
      'draft, pending, private, and future posts are all fetched.',
    )
  }

  const token = Buffer.from(`${username}:${appPassword}`).toString('base64')

  return {
    Authorization: `Basic ${token}`,
  }
}

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
// RANK MATH / PAYLOAD SEO HELPERS
// ============================================================
//
// IMPORTANT:
// - Reads Rank Math values from the WordPress REST response.
// - Supports both `meta.rank_math_*` and top-level `rank_math` /
//   `rank_math_migration` shapes.
// - Does not change the existing content/media migration flow.
// - SEO images reuse the existing Payload media map first and only
//   upload from WordPress when a mapping is genuinely missing.
// ============================================================

type WPRankMath = Record<string, unknown>

type PayloadRobotsMeta = {
  index: boolean
  follow: boolean
  noArchive: boolean
  noImageIndex: boolean
  noSnippet: boolean
}

type PayloadAdvancedRobotsMeta = {
  maxSnippet: number
  maxVideoPreview: number
  maxImagePreview: 'none' | 'standard' | 'large'
}

function getRankMathData(post: WPPost): WPRankMath {
  // Prefer the dedicated top-level Rank Math migration object when
  // WordPress exposes it.
  if (
    post.rank_math_migration &&
    typeof post.rank_math_migration === 'object' &&
    !Array.isArray(post.rank_math_migration)
  ) {
    return post.rank_math_migration
  }

  if (
    post.rank_math &&
    typeof post.rank_math === 'object' &&
    !Array.isArray(post.rank_math)
  ) {
    return post.rank_math
  }

  // Most WordPress REST configurations expose registered Rank Math
  // post meta inside the normal `meta` object.
  if (
    post.meta &&
    typeof post.meta === 'object' &&
    !Array.isArray(post.meta)
  ) {
    return post.meta as WPRankMath
  }

  return {}
}

function getRankMathString(
  rankMath: WPRankMath,
  key: string,
): string | undefined {
  const value = rankMath[key]

  if (typeof value === 'string') {
    const trimmed = value.trim()
    return trimmed || undefined
  }

  if (typeof value === 'number') {
    return String(value)
  }

  if (Array.isArray(value)) {
    const values = value
      .filter(
        (item): item is string | number =>
          typeof item === 'string' || typeof item === 'number',
      )
      .map(String)
      .map((item) => item.trim())
      .filter(Boolean)

    return values.length ? values.join(',') : undefined
  }

  return undefined
}

function getRankMathStringArray(
  rankMath: WPRankMath,
  key: string,
): string[] {
  const value = rankMath[key]

  if (Array.isArray(value)) {
    return value
      .filter(
        (item): item is string | number =>
          typeof item === 'string' || typeof item === 'number',
      )
      .map(String)
      .map((item) => item.trim())
      .filter(Boolean)
  }

  if (typeof value === 'string') {
    return value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)
  }

  return []
}

function parseRankMathRobots(rankMath: WPRankMath): {
  robots: PayloadRobotsMeta
  advancedRobots: PayloadAdvancedRobotsMeta
} {
  const tokens = getRankMathStringArray(
    rankMath,
    'rank_math_robots',
  ).map((value) => value.toLowerCase())

  const has = (value: string) =>
    tokens.includes(value.toLowerCase())

  const getDirective = (name: string): string | undefined => {
    const prefix = `${name}:`
    const token = tokens.find((item) => item.startsWith(prefix))
    return token?.slice(prefix.length).trim()
  }

  const robots: PayloadRobotsMeta = {
    index: !has('noindex'),
    follow: !has('nofollow'),
    noArchive: has('noarchive'),
    noImageIndex: has('noimageindex'),
    noSnippet: has('nosnippet'),
  }

  const advancedRobots: PayloadAdvancedRobotsMeta = {
    maxSnippet: -1,
    maxVideoPreview: -1,
    maxImagePreview: 'large',
  }

  const maxSnippet = getDirective('max-snippet')
  if (maxSnippet !== undefined && Number.isFinite(Number(maxSnippet))) {
    advancedRobots.maxSnippet = Number(maxSnippet)
  }

  const maxVideoPreview = getDirective('max-video-preview')
  if (
    maxVideoPreview !== undefined &&
    Number.isFinite(Number(maxVideoPreview))
  ) {
    advancedRobots.maxVideoPreview = Number(maxVideoPreview)
  }

  const maxImagePreview = getDirective('max-image-preview')

  if (
    maxImagePreview === 'none' ||
    maxImagePreview === 'standard' ||
    maxImagePreview === 'large'
  ) {
    advancedRobots.maxImagePreview = maxImagePreview
  }

  return {
    robots,
    advancedRobots,
  }
}

async function resolveRankMathImageId(
  value: unknown,
  mediaMaps: MediaMaps,
  payload: any,
): Promise<number | undefined> {
  if (typeof value !== 'string' || !value.trim()) {
    return undefined
  }

  const sourceUrl = resolveWordPressAssetUrl(value)

  return (
    findMediaId(sourceUrl, mediaMaps) ||
    (await ensureMediaUploaded(sourceUrl, mediaMaps, payload))
  )
}

// ============================================================
// ⬇ NEW — SLUGIFY (fallback for drafts with an empty post_name)
// ============================================================
//
// WordPress only writes `post_name` (the slug) to the database
// once a draft has been explicitly saved with a permalink. Until
// then, the REST API returns slug: "" even though wp-admin shows a
// live-generated preview slug in the editor UI. Previously this
// caused the whole post (title, content, everything) to be
// silently skipped. Now we derive a slug from the title instead —
// and suffix it with the WordPress post ID to guarantee uniqueness
// against the `slug` unique index on the Posts collection.
// ============================================================

function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 180)
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

function resolveWordPressAssetUrl(value: string): string {
  const raw = value.trim()
  if (!raw) return raw

  try {
    return new URL(raw, WORDPRESS_API_URL.replace(/\/wp-json\/wp\/v2\/?$/, '/')).toString()
  } catch {
    return raw
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
// HTTP RETRY HELPER
// ============================================================

async function fetchWithRetry(
  input: RequestInfo | URL,
  init: RequestInit = {},
  attempts = 3,
): Promise<Response> {
  let lastError: unknown

  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      const response = await fetch(input, init)

      if (response.ok || (response.status >= 400 && response.status < 500)) {
        return response
      }

      lastError = new Error(
        `HTTP ${response.status} ${response.statusText}`,
      )
    } catch (error) {
      lastError = error
    }

    if (attempt < attempts) {
      await new Promise((resolve) => setTimeout(resolve, attempt * 750))
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error('Request failed after retries.')
}

// ============================================================
// FETCH ALL POSTS
// ============================================================
//
// ⬇ CHANGED — now sends the WP auth header and requests every
// status (publish, draft, pending, private, future) instead of
// relying on the unauthenticated default (publish-only).
// ============================================================

async function fetchAllPosts(): Promise<WPPost[]> {
  const posts: WPPost[] = []
  let page = 1
  const perPage = 100

  const authHeaders = getWordPressAuthHeader()

  while (true) {
    const url =
      `${WORDPRESS_API_URL}/posts?per_page=${perPage}&page=${page}` +
      `&status=publish,draft,pending,private,future` +
      `&_embed=wp:featuredmedia`

    console.log(`Fetching WordPress posts page ${page}...`)

    const response = await fetchWithRetry(url, {
      headers: authHeaders,
    })

    if (response.status === 400) {
      break
    }

    if (response.status === 401 || response.status === 403) {
      throw new Error(
        `WordPress API auth failed (${response.status}). ` +
        `Check WP_USERNAME / WP_APP_PASSWORD in .env.`,
      )
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

async function findFirstPayloadId(
  payload: any,
  collection: string,
): Promise<number | undefined> {
  const result = await payload.find({
    collection,
    limit: 1,
    pagination: false,
    depth: 0,
  })

  const id = result.docs?.[0]?.id
  return id !== undefined ? Number(id) : undefined
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

async function getWordPressMediaSourceUrl(
  mediaId: number,
): Promise<string | undefined> {
  try {
    const response = await fetch(
      `${WORDPRESS_API_URL}/media/${mediaId}`,
      {
        headers: getWordPressAuthHeader(),
      },
    )

    if (!response.ok) {
      console.warn(
        `    ⚠ Could not fetch WordPress featured media ${mediaId}: ${response.status}`,
      )
      return undefined
    }

    const media = await response.json()

    return typeof media?.source_url === 'string'
      ? resolveWordPressAssetUrl(media.source_url)
      : undefined
  } catch (error) {
    console.warn(
      `    ⚠ Failed to fetch WordPress featured media ${mediaId}:`,
      error,
    )

    return undefined
  }
}

async function ensureMediaUploaded(
  sourceUrl: string,
  mediaMaps: MediaMaps,
  payload: any,
): Promise<number | undefined> {
  const resolvedSourceUrl = resolveWordPressAssetUrl(sourceUrl)
  const normalized = normalizeUrl(resolvedSourceUrl)

  // Reuse any existing mapping before creating a duplicate media record.
  const already =
    findMediaId(sourceUrl, mediaMaps) ||
    findMediaId(resolvedSourceUrl, mediaMaps)
  if (already) {
    return already
  }

  try {
    const response = await fetchWithRetry(resolvedSourceUrl)

    if (!response.ok) {
      console.warn(
        `    ⚠ On-demand fetch failed (${response.status}): ${resolvedSourceUrl}`,
      )
      return undefined
    }

    const arrayBuffer = await response.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const filename =
      resolvedSourceUrl.split('/').pop()?.split('?')[0] ||
      `migrated-${Date.now()}`

    const mimetype =
      response.headers.get('content-type') ||
      'application/octet-stream'

    const created = await payload.create({
      collection: 'media',
      data: {
        alt: filename,
        originalUrl: resolvedSourceUrl,
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

    mediaMaps.byOriginalUrl.set(normalized, payloadId)
    mediaMaps.allPayloadIds.add(payloadId)

    const path = normalizePath(resolvedSourceUrl)
    if (path) {
      mediaMaps.byPath.set(path, payloadId)
      mediaMaps.byPath.set(stripWordPressSizeSuffix(path), payloadId)
    }

    const fname = normalizeFilename(resolvedSourceUrl)
    if (fname) {
      mediaMaps.byFilename.set(fname, payloadId)
    }

    console.log(
      `    ↳ Auto-uploaded missing media: ${filename} → Payload ID ${payloadId}`,
    )

    return payloadId
  } catch (error) {
    console.warn(`    ⚠ On-demand upload threw for ${resolvedSourceUrl}:`, error)
    return undefined
  }
}

// ============================================================
// SITE-CHROME WIDGET STRIPPING  ⬅ FIX #1 (was called but missing)
// ============================================================
//
// AlloyPress injects site-chrome widgets directly into post content
// (Ask AI boxes, Share widgets, floating banners). These are NOT
// real content — they must be removed before styled-box / button /
// Lexical conversion ever sees the DOM, otherwise they get
// misidentified as styled boxes or buttons and get migrated as if
// they were real post content.
// ============================================================

function stripKnownWidgets(document: Document, stats: MigrationStats): void {
  const selector = [
    '[class*="apAsk-"]',
    '[id*="apAsk-"]',
    '[class*="apShare-"]',
    '[id*="apShare-"]',
    '[class*="sbBanner-"]',
    '[id*="sbBanner-"]',
  ].join(', ')

  const widgets = Array.from(document.querySelectorAll(selector))

  for (const widget of widgets) {
    if (!widget.isConnected) {
      continue
    }

    widget.remove()
    stats.widgetsStripped++
  }
}

// ============================================================
// COLOR SWATCH HELPERS
// ============================================================

const BG_SWATCHES: Record<string, string> = {
  '#D9F99D': 'green',
  '#FEF9C3': 'yellow',
  '#DBEAFE': 'blue',
  '#FEE2E2': 'red',
  '#F3F4F6': 'gray',
}

const BORDER_SWATCHES: Record<string, string> = {
  '#D9F99D': 'green',
  '#FEF9C3': 'yellow',
  '#DBEAFE': 'blue',
  '#FEE2E2': 'red',
  '#F3F4F6': 'gray',
  '#EEEEEE': 'gray',
  '#1DBA6E': 'brand-green',
}

function hexDistance(a: string, b: string): number {
  const pa = a.match(/[0-9A-F]{2}/gi)?.map((x) => parseInt(x, 16)) || [0, 0, 0]
  const pb = b.match(/[0-9A-F]{2}/gi)?.map((x) => parseInt(x, 16)) || [0, 0, 0]

  return Math.sqrt(
    (pa[0] - pb[0]) ** 2 +
    (pa[1] - pb[1]) ** 2 +
    (pa[2] - pb[2]) ** 2,
  )
}

function rgbToHex(rgb: string): string | null {
  const match = rgb.match(/\d+(?:\.\d+)?/g)
  if (!match || match.length < 3) return null

  return (
    '#' +
    match
      .slice(0, 3)
      .map((n) =>
        Math.max(0, Math.min(255, Math.round(Number(n))))
          .toString(16)
          .padStart(2, '0'),
      )
      .join('')
      .toUpperCase()
  )
}

const NAMED_COLORS: Record<string, string> = {
  black: '#000000',
  white: '#FFFFFF',
  red: '#FF0000',
  green: '#008000',
  blue: '#0000FF',
  yellow: '#FFFF00',
  gray: '#808080',
  grey: '#808080',
  orange: '#FFA500',
  purple: '#800080',
}

function toHex(rawColor: string): string | null {
  const trimmed = rawColor.trim()
  if (!trimmed) return null

  if (/^#[0-9a-f]{3}$/i.test(trimmed)) {
    const hex = trimmed.slice(1)
    return `#${hex[0]}${hex[0]}${hex[1]}${hex[1]}${hex[2]}${hex[2]}`.toUpperCase()
  }

  if (/^#[0-9a-f]{6}$/i.test(trimmed)) {
    return trimmed.toUpperCase()
  }

  const rgb = rgbToHex(trimmed)
  if (rgb) return rgb

  return NAMED_COLORS[trimmed.toLowerCase()] || null
}

function nearestSwatch(
  hex: string,
  swatches: Record<string, string>,
  threshold = 150,
): string | null {
  let closestName: string | null = null
  let closestDistance = Infinity

  for (const [swatchHex, name] of Object.entries(swatches)) {
    const distance = hexDistance(hex, swatchHex)
    if (distance < closestDistance) {
      closestDistance = distance
      closestName = name
    }
  }

  return closestDistance < threshold ? closestName : null
}

function extractCssColor(raw: string): string | null {
  const value = raw.trim()
  if (!value) return null

  const hexMatch = value.match(/#[0-9a-f]{3,8}\b/i)
  if (hexMatch) return toHex(hexMatch[0])

  const rgbMatch = value.match(
    /rgba?\(\s*[\d.]+\s*,\s*[\d.]+\s*,\s*[\d.]+(?:\s*,\s*[\d.]+)?\s*\)/i,
  )
  if (rgbMatch) return toHex(rgbMatch[0])

  const namedMatch = value.match(
    /\b(black|white|red|green|blue|yellow|gray|grey|orange|purple)\b/i,
  )

  return namedMatch ? toHex(namedMatch[1]) : null
}

function classSwatchName(
  className: string,
  kind: 'background' | 'border',
): string | undefined {
  const normalized = className.toLowerCase()

  if (
    kind === 'background' &&
    /(?:luminous-vivid-green|vivid-green|green)(?:-background|-background-color)?/.test(
      normalized,
    )
  ) return 'green'

  if (
    kind === 'background' &&
    /(?:luminous-vivid-amber|vivid-amber|yellow)(?:-background|-background-color)?/.test(
      normalized,
    )
  ) return 'yellow'

  if (
    kind === 'background' &&
    /(?:pale-cyan|light-blue|blue)(?:-background|-background-color)?/.test(
      normalized,
    )
  ) return 'blue'

  if (
    kind === 'background' &&
    /(?:pale-pink|light-red|red)(?:-background|-background-color)?/.test(
      normalized,
    )
  ) return 'red'

  if (
    kind === 'background' &&
    /(?:light-gray|light-grey|gray|grey)(?:-background|-background-color)?/.test(
      normalized,
    )
  ) return 'gray'

  if (
    kind === 'border' &&
    /(?:green|vivid-green|luminous-vivid-green)(?:-border|-border-color)?/.test(
      normalized,
    )
  ) return 'brand-green'

  if (
    kind === 'border' &&
    /(?:yellow|amber)(?:-border|-border-color)?/.test(normalized)
  ) return 'yellow'

  if (
    kind === 'border' &&
    /(?:blue|cyan)(?:-border|-border-color)?/.test(normalized)
  ) return 'blue'

  if (
    kind === 'border' &&
    /(?:red|pink)(?:-border|-border-color)?/.test(normalized)
  ) return 'red'

  if (
    kind === 'border' &&
    /(?:gray|grey)(?:-border|-border-color)?/.test(normalized)
  ) return 'gray'

  return undefined
}

function getStyleValue(style: string, property: string): string | null {
  const regex = new RegExp(`${property}\\s*:\\s*([^;]+)`, 'i')
  return style.match(regex)?.[1]?.trim() || null
}

function getBorderColorFromStyle(style: string): string | null {
  const explicit = getStyleValue(style, 'border-color')
  if (explicit) return extractCssColor(explicit)

  const border = getStyleValue(style, 'border')
  if (border) return extractCssColor(border)

  for (const side of ['border-top', 'border-right', 'border-bottom', 'border-left']) {
    const value = getStyleValue(style, side)
    if (value) {
      const color = extractCssColor(value)
      if (color) return color
    }
  }

  return null
}

function hasStyledBoxClass(el: Element): boolean {
  const className = el.getAttribute('class') || ''
  if (!className.trim()) return false

  return /(?:^|\s)(?:wp-block-quote|wp-block-cover|et_pb_blurb|et_pb_call_to_action|et_pb_promo|faq(?:[-_]|$)|faq-item(?:[-_]|$)|callout(?:[-_]|$)|notice(?:[-_]|$)|highlight(?:[-_]|$)|alloy(?:[-_]|$)|(?:info|warning|success|tip|quote)[-_]?box(?:[-_]|$)|card(?:[-_]|$)|content-box(?:[-_]|$)|border(?:ed)?(?:[-_]|$)|has-(?:background|border)(?:[-_]|$))/i.test(
    className,
  )
}

function isLikelyStyledBox(el: Element): boolean {
  const style = el.getAttribute('style') || ''
  const className = el.getAttribute('class') || ''

  const hasInlineBorder =
    /(?:^|;)\s*border(?:-(?:top|right|bottom|left|width|color|style))?\s*:/i.test(
      style,
    )
  const hasInlineBackground =
    /(?:^|;)\s*background(?:-color)?\s*:/i.test(style)

  if (hasInlineBorder || hasInlineBackground) return true
  return hasStyledBoxClass(el)
}

function isMediaFree(el: Element): boolean {
  return !el.querySelector('img, audio, video, iframe')
}

function extractStyledBoxes(
  document: Document,
  stats: MigrationStats,
): void {
  const candidates = Array.from(
    document.querySelectorAll('div, section, blockquote, aside, article'),
  )
    .filter(isLikelyStyledBox)
    .sort((a, b) => {
      const depth = (el: Element): number => {
        let value = 0
        let current: Element | null = el
        while (current?.parentElement) {
          value++
          current = current.parentElement
        }
        return value
      }
      return depth(b) - depth(a)
    })

  for (const el of candidates) {
    if (!el.isConnected) continue
    if (el.closest('[data-wp-payload-block="styledBox"]')) continue

    // If an inner box was already extracted, the current element is usually
    // just a layout wrapper. Do not swallow that converted child.
    if (el.querySelector('[data-wp-payload-block="styledBox"]')) continue

    if (!isMediaFree(el)) continue

    const style = el.getAttribute('style') || ''
    const className = el.getAttribute('class') || ''

    const hasSemanticBoxClass =
      /(?:wp-block-quote|wp-block-cover|et_pb_blurb|et_pb_call_to_action|et_pb_promo|faq(?:[-_]|$)|faq-item(?:[-_]|$)|callout(?:[-_]|$)|notice(?:[-_]|$)|highlight(?:[-_]|$)|alloy(?:[-_]|$)|(?:info|warning|success|tip|quote)[-_]?box(?:[-_]|$)|card(?:[-_]|$)|content-box(?:[-_]|$))/i.test(
        className,
      )

    const hasBorder =
      /(?:^|;)\s*border(?:-(?:top|right|bottom|left|width|color|style))?\s*:/i.test(
        style,
      ) ||
      /(?:has-border|border(?:ed)?|border-color)/i.test(className) ||
      hasSemanticBoxClass

    const hasBackground =
      /(?:^|;)\s*background(?:-color)?\s*:/i.test(style) ||
      /(?:has-background|background-color)/i.test(className) ||
      hasSemanticBoxClass

    if (!hasBorder && !hasBackground) continue

    const headings = el.querySelectorAll('h1, h2, h3, h4, h5, h6')
    const paragraphs = Array.from(el.querySelectorAll('p'))

    if (headings.length > 1) continue

    const headingText = headings[0]?.textContent?.trim() || ''

    let bodyText = paragraphs
      .map((p) => p.textContent?.trim() || '')
      .filter(Boolean)
      .join('\n\n')

    if (!headingText && !bodyText) {
      bodyText = el.textContent?.trim() || ''
    }

    if (!headingText && !bodyText) continue

    stats.styledBoxesFound++

    const bgRaw =
      getStyleValue(style, 'background-color') ||
      getStyleValue(style, 'background')
    const borderRaw = getBorderColorFromStyle(style)

    const bgHex = bgRaw ? extractCssColor(bgRaw) : null
    const borderHex = borderRaw ? extractCssColor(borderRaw) : null

    const backgroundColor =
      (bgHex ? nearestSwatch(bgHex, BG_SWATCHES) : null) ||
      classSwatchName(className, 'background')

    const borderColor =
      (borderHex ? nearestSwatch(borderHex, BORDER_SWATCHES) : null) ||
      classSwatchName(className, 'border')

    const borderWidth =
      getStyleValue(style, 'border-width') ||
      getStyleValue(style, 'border')?.match(
        /^\s*([\d.]+(?:px|rem|em|pt|%))/i,
      )?.[1] ||
      undefined

    const marker =
      `__WP_PAYLOAD_STYLEDBOX__` +
      `${encodeURIComponent(headingText)}|` +
      `${encodeURIComponent(bodyText)}|` +
      `${encodeURIComponent(backgroundColor || '')}|` +
      `${encodeURIComponent(borderColor || '')}|` +
      `${encodeURIComponent(borderWidth || '')}__`

    const markerElement = document.createElement('p')
    markerElement.setAttribute('data-wp-payload-block', 'styledBox')
    markerElement.textContent = marker

    el.replaceWith(markerElement)
    stats.styledBoxesConverted++
  }
}

// ============================================================
// BACKGROUND COLOR SNAPPING  ⬅ FIX #2 (was called but missing)
// ============================================================
//
// Runs AFTER styled boxes are extracted, so it only ever touches
// leftover elements (e.g. inline spans/paragraphs with a raw
// background-color style) that were not swallowed into a styledBox
// block. Snaps arbitrary WP background colors to the nearest
// design-system swatch and records it as a data attribute so the
// Lexical converter / editor config can pick it up, instead of
// carrying arbitrary hex values into the CMS.
// ============================================================

function snapBackgroundColors(
  document: Document,
  stats: MigrationStats,
): void {
  const elements = Array.from(
    document.querySelectorAll('[style*="background"]'),
  )

  for (const el of elements) {
    // Skip anything already converted into a marker block above.
    if (el.closest('[data-wp-payload-block]')) {
      continue
    }

    const style = el.getAttribute('style') || ''

    const raw =
      getStyleValue(style, 'background-color') ||
      getStyleValue(style, 'background')

    if (!raw) {
      continue
    }

    const hex = extractCssColor(raw)
    if (!hex) {
      continue
    }

    const swatch = nearestSwatch(hex, BG_SWATCHES)
    if (!swatch) {
      continue
    }

    // Strip the raw color declaration so it doesn't leak an arbitrary
    // hex value into the Lexical inline styles, then record the
    // resolved swatch name as a data attribute instead.
    const cleanedStyle = style
      .replace(/background-color\s*:[^;]+;?/i, '')
      .replace(/background\s*:[^;]+;?/i, '')
      .trim()

    if (cleanedStyle) {
      el.setAttribute('style', cleanedStyle)
    } else {
      el.removeAttribute('style')
    }

    el.setAttribute('data-background-swatch', swatch)
    stats.backgroundColorsSnapped++
  }
}

// ============================================================
// CTA BUTTON PRESERVATION
// ============================================================
//
// ⬇ CHANGED — broadened the selector to also catch buttons built
// as plain <a> tags styled purely with a "button"/"btn" class
// fragment (e.g. Divi/Elementor custom classes), while still
// explicitly excluding the AlloyPress site-chrome widgets
// (apAsk-*/apShare-*/sbBanner-*) which are stripped earlier by
// stripKnownWidgets() and must never be treated as content CTAs.
// ============================================================

function extractButtons(document: Document, stats: MigrationStats): void {
  const buttonSelector = [
    'a.et_pb_button',
    'a.wp-block-button__link',
    'a.button',
    'a.btn',
    'a[class*="btn-"]',
    'a[class*="-btn"]',
    'a[class*="button-"]',
    'a[class*="-button"]',
  ].join(', ')

  const candidates = Array.from(document.querySelectorAll(buttonSelector))

  for (const anchor of candidates) {
    if (anchor.closest('[data-wp-payload-block]')) {
      continue
    }

    const href = anchor.getAttribute('href') || ''
    const label = anchor.textContent?.trim() || ''

    if (!href || !label) {
      continue
    }

    stats.buttonsFound++

    const marker = `__WP_PAYLOAD_BUTTON__${encodeURIComponent(
      label,
    )}|${encodeURIComponent(href)}__`

    const markerElement = document.createElement('p')
    markerElement.setAttribute('data-wp-payload-block', 'ctaButton')
    markerElement.textContent = marker

    const wrapper = anchor.parentElement
    const wrapperIsButtonOnly =
      !!wrapper &&
      wrapper.children.length === 1 &&
      (wrapper.textContent?.trim() || '') === label

    if (wrapper && wrapperIsButtonOnly) {
      wrapper.replaceWith(markerElement)
    } else {
      anchor.replaceWith(markerElement)
    }

    stats.buttonsConverted++
  }
}

// ============================================================
// PREPARE WORDPRESS HTML
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
  // ⬇ NEW — STRIP SITE-CHROME WIDGETS (runs first, before anything
  // else reads the DOM, so Ask AI / Share / floating-banner markup
  // never reaches the styled-box, button, or Lexical conversion
  // passes).
  // --------------------------------------------------------------

  stripKnownWidgets(document, stats)

  // --------------------------------------------------------------
  // BUTTONS
  // --------------------------------------------------------------

  extractButtons(document, stats)

  // --------------------------------------------------------------
  // STYLED BOXES
  // --------------------------------------------------------------

  // Extract styled boxes BEFORE snapping colors so their original CSS
  // colors are still available to the block converter.
  extractStyledBoxes(document, stats)

  // --------------------------------------------------------------
  // BACKGROUND COLOR
  // --------------------------------------------------------------

  // Only remaining non-box elements are snapped here.
  snapBackgroundColors(document, stats)

  // --------------------------------------------------------------
  // IMAGES
  // --------------------------------------------------------------

  const images = document.querySelectorAll('img')

  for (const image of Array.from(images)) {
    stats.contentImagesFound++

    const rawSrc =
      image.getAttribute('src') ||
      image.getAttribute('data-src') ||
      image.getAttribute('data-lazy-src') ||
      image.getAttribute('data-original') ||
      image.getAttribute('data-original-src') ||
      image.getAttribute('data-url')

    const srcsetCandidate =
      image.getAttribute('srcset')?.split(',')[0]?.trim()?.split(/\s+/)[0] ||
      ''

    const src = resolveWordPressAssetUrl(rawSrc || srcsetCandidate)

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

      const fallback = document.createElement('p')
      const link = document.createElement('a')
      const alt = image.getAttribute('alt')?.trim() || 'Migrated image'
      link.href = src
      link.textContent = `[${alt}]`
      fallback.appendChild(link)
      image.replaceWith(fallback)
      continue
    }

    stats.contentImagesMapped++
    image.setAttribute('data-lexical-upload-id', String(mediaId))
    image.setAttribute('data-lexical-upload-relation-to', 'media')
  }

  // --------------------------------------------------------------
  // AUDIO
  // --------------------------------------------------------------

  const audioElements = document.querySelectorAll('audio')

  for (const audio of Array.from(audioElements)) {
    const rawSrc =
      audio.getAttribute('src') ||
      audio.querySelector('source')?.getAttribute('src')
    const src = rawSrc ? resolveWordPressAssetUrl(rawSrc) : ''

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
  // SELF-HOSTED VIDEO
  // --------------------------------------------------------------

  const videoElements = document.querySelectorAll('video')

  for (const video of Array.from(videoElements)) {
    const rawSrc =
      video.getAttribute('src') ||
      video.querySelector('source')?.getAttribute('src')
    const src = rawSrc ? resolveWordPressAssetUrl(rawSrc) : ''

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
    const rawSrc =
      iframe.getAttribute('src') || iframe.getAttribute('data-src')
    const src = rawSrc ? resolveWordPressAssetUrl(rawSrc) : ''

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

      return {
        type: 'text',
        version: 1,
        text: '[Migrated media unavailable]',
        detail: 0,
        format: 0,
        mode: 'normal',
        style: '',
      }
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

        // --- STYLED BOX (bordered/highlighted callout) --------------
        const styledBoxMatch = text.match(
          /^__WP_PAYLOAD_STYLEDBOX__([^|]*)\|([^|]*)\|([^|]*)\|([^|]*)\|([^|]*)__$/,
        )

        if (cloned.type === 'paragraph' && styledBoxMatch) {
          const backgroundColor = decodeURIComponent(styledBoxMatch[3] || '')
          const borderColor = decodeURIComponent(styledBoxMatch[4] || '')
          const borderWidth = decodeURIComponent(styledBoxMatch[5] || '')

          output.push({
            type: 'block',
            version: 2,
            fields: {
              blockType: 'styledBox',
              heading: decodeURIComponent(styledBoxMatch[1] || ''),
              text: decodeURIComponent(styledBoxMatch[2] || ''),
              ...(backgroundColor ? { backgroundColor } : {}),
              ...(borderColor ? { borderColor } : {}),
              ...(borderWidth ? { borderWidth } : {}),
            },
          })
          continue
        }

        // --- CTA BUTTON -----------------------------------------------
        const buttonMatch = text.match(
          /^__WP_PAYLOAD_BUTTON__([^|]+)\|([^|]+)__$/,
        )

        if (cloned.type === 'paragraph' && buttonMatch) {
          output.push({
            type: 'block',
            version: 2,
            fields: {
              blockType: 'ctaButton',
              label: decodeURIComponent(buttonMatch[1]),
              url: decodeURIComponent(buttonMatch[2]),
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
  const preparedHTML = await prepareHTML(html, mediaMaps, stats, payload)

  if (stats.contentImagesUnmapped > 0) {
    stats.contentConversionFallbacks += stats.contentImagesUnmapped
    console.warn(
      `    ⚠ ${stats.contentImagesUnmapped} image(s) could not be mapped. ` +
      `Source references were preserved as links instead of skipping the post.`,
    )
  }

  let lexicalJSON = convertHTMLToLexical({
    html: preparedHTML,
    editorConfig,
    JSDOM,
  })

  lexicalJSON = sanitizeLexicalLinks(lexicalJSON, stats)

  lexicalJSON = replaceMarkerParagraphs(lexicalJSON)

  lexicalJSON = normalizeLexicalUploadNodes(
    lexicalJSON,
    mediaMaps.allPayloadIds,
    stats,
  )

  const uploadNodeCount = countUploadNodes(lexicalJSON)

  console.log(`    ↳ Expected upload nodes: ${stats.contentImagesMapped}`)
  console.log(`    ↳ Actual upload nodes: ${uploadNodeCount}`)

  if (uploadNodeCount !== stats.contentImagesMapped) {
    stats.contentConversionFallbacks++
    console.warn(
      `    ⚠ Content image conversion count differs: ` +
      `mapped=${stats.contentImagesMapped}, lexical=${uploadNodeCount}. ` +
      `Post will still be migrated; no post-level skip is performed.`,
    )
  }

  return lexicalJSON
}

// ============================================================
// POST SLUG UNIQUENESS
// ============================================================

async function ensureUniquePostSlug(
  payload: any,
  requestedSlug: string,
  wordpressId: number,
): Promise<string> {
  const base = slugify(requestedSlug) || `wordpress-post-${wordpressId}`
  let candidate = base.slice(0, 190)
  let suffix = 2

  while (true) {
    const result = await payload.find({
      collection: 'posts',
      where: {
        slug: {
          equals: candidate,
        },
      },
      limit: 2,
      depth: 0,
    })

    const conflictingPost = result.docs?.find(
      (doc: any) => Number(doc?.legacy?.wordpressId) !== wordpressId,
    )

    if (!conflictingPost) {
      return candidate
    }

    const suffixText = `-${suffix++}`
    candidate = `${base.slice(0, Math.max(1, 190 - suffixText.length))}${suffixText}`
  }
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
  // Posts are never intentionally skipped. A failed create/update is counted
  // separately so the migration attempts every WordPress post.
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
  let totalBackgroundColorsSnapped = 0
  let totalStyledBoxesFound = 0
  let totalStyledBoxesConverted = 0
  let totalButtonsFound = 0
  let totalButtonsConverted = 0
  // ⬇ NEW
  let totalWidgetsStripped = 0
  let totalSlugsGeneratedFromTitle = 0
  let totalFallbackTitlesGenerated = 0
  let totalFallbackCategoriesUsed = 0
  let totalFallbackAuthorsUsed = 0
  let totalContentConversionFallbacks = 0

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
      backgroundColorsSnapped: 0,
      styledBoxesFound: 0,
      styledBoxesConverted: 0,
      buttonsFound: 0,
      buttonsConverted: 0,
      // ⬇ NEW
      widgetsStripped: 0,
      slugsGeneratedFromTitle: 0,
      fallbackTitlesGenerated: 0,
      fallbackCategoriesUsed: 0,
      fallbackAuthorsUsed: 0,
      contentConversionFallbacks: 0,
    }

    let content: any = null

    // ⬅ FIX #3: hoisted OUTSIDE the try block so the catch block below
    // can still reference it in its error log. Previously this was
    // declared with `let` *inside* the try block, which made it
    // block-scoped and inaccessible from the sibling catch block —
    // causing a ReferenceError that masked the real failure reason
    // every time a post failed to migrate.
    let slug = ''

    try {
      // ============================================================
      // IDENTIFIERS / REQUIRED-FIELD FALLBACKS
      // ============================================================

      if (!post.id) {
        throw new Error(
          'WordPress post response has no ID. Cannot create a stable legacy.wordpressId.',
        )
      }

      let title = cleanText(post.title?.rendered)

      // Never skip an empty draft title.
      if (!title) {
        title = `Untitled WordPress Post ${post.id}`
        stats.fallbackTitlesGenerated++
        console.warn(`  ⚠ Missing title — generated: "${title}"`)
      }

      slug = cleanText(post.slug)

      // Never skip an empty draft slug. Generate a deterministic fallback
      // from the title and WP ID, then verify it against Payload's unique
      // slug index before create/update.
      if (!slug) {
        const baseSlug = slugify(title) || `wordpress-post-${post.id}`
        slug = `${baseSlug}-${post.id}`.slice(0, 190)
        stats.slugsGeneratedFromTitle++
        console.warn(`  ⚠ Missing slug — generated: "${slug}"`)
      }

      slug = await ensureUniquePostSlug(payload, slug, post.id)

      // Missing relationship information should not destroy the post.
      // Use an existing Payload relation as a safe fallback when possible.
      const wordpressCategoryId = post.categories?.[0]
      let payloadCategoryId = wordpressCategoryId
        ? categoryMap.get(wordpressCategoryId)
        : undefined

      if (!payloadCategoryId) {
        payloadCategoryId = await findFirstPayloadId(payload, 'categories')

        if (payloadCategoryId) {
          stats.fallbackCategoriesUsed++
          console.warn(
            `  ⚠ Category missing/unmapped — using Payload category ${payloadCategoryId}`,
          )
        } else {
          console.warn(
            '  ⚠ No Payload category exists. Category will be omitted if the Posts schema allows it.',
          )
        }
      }

      let payloadAuthorId = userMap.get(post.author)

      if (!payloadAuthorId) {
        payloadAuthorId = await findFirstPayloadId(payload, 'users')

        if (payloadAuthorId) {
          stats.fallbackAuthorsUsed++
          console.warn(
            `  ⚠ Author missing/unmapped — using Payload user ${payloadAuthorId}`,
          )
        } else {
          console.warn(
            '  ⚠ No Payload user exists. Author will be omitted if the Posts schema allows it.',
          )
        }
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
        // 1. Existing Payload mapping
        payloadFeaturedImageId = mediaMaps.byWordPressId.get(
          post.featured_media,
        )

        // 2. Mapping missing → recover from WordPress
        if (!payloadFeaturedImageId) {
          console.warn(
            `    ⚠ Featured image mapping missing: WP media ${post.featured_media}. Attempting recovery...`,
          )

          const embeddedSourceUrl =
            post._embedded?.['wp:featuredmedia']?.[0]?.source_url

          const sourceUrl =
            typeof embeddedSourceUrl === 'string' && embeddedSourceUrl.trim()
              ? resolveWordPressAssetUrl(embeddedSourceUrl)
              : await getWordPressMediaSourceUrl(post.featured_media)

          if (sourceUrl) {
            payloadFeaturedImageId = await ensureMediaUploaded(
              sourceUrl,
              mediaMaps,
              payload,
            )
          }
        }

        // 3. Never fail the entire post because of featured image
        if (!payloadFeaturedImageId) {
          console.warn(
            `    ⚠ Featured image could not be recovered: WP media ${post.featured_media}. Continuing post migration.`,
          )
        }
      }

      const excerpt = cleanText(post.excerpt?.rendered)

      const rawContent = post.content?.rendered || '<p></p>'

      

      try {
        content = await convertToLexical(
          rawContent,
          editorConfig,
          mediaMaps,
          stats,
          payload,
        )
      } catch (conversionError) {
        stats.contentConversionFallbacks++

        const fallbackText = cleanText(rawContent) || '[No readable content]'

        console.warn(
          '  ⚠ Rich-text conversion failed. Migrating a plain-text fallback instead.',
        )

        content = {
          root: {
            type: 'root',
            version: 1,
            direction: 'ltr',
            format: '',
            indent: 0,
            children: [
              {
                type: 'paragraph',
                version: 1,
                direction: 'ltr',
                format: '',
                indent: 0,
                children: [
                  {
                    type: 'text',
                    version: 1,
                    text: fallbackText,
                    detail: 0,
                    format: 0,
                    mode: 'normal',
                    style: '',
                  },
                ],
              },
            ],
          },
        }

        if (conversionError instanceof Error) {
          console.warn(`    Conversion reason: ${conversionError.message}`)
        }
      }

      // Exact WordPress → Payload workflow mapping:
      // publish  → published / published / WP date
      // future   → draft     / draft     / WP date
      // draft    → draft     / draft     / empty
      // pending  → draft     / review    / empty
      // private  → draft     / draft     / empty
      const isPublished = post.status === 'publish'
      const isScheduled = post.status === 'future'

      let workflowStatus: 'draft' | 'review' | 'published'

      if (isPublished) {
        workflowStatus = 'published'
      } else if (post.status === 'pending') {
        workflowStatus = 'review'
      } else {
        workflowStatus = 'draft'
      }

      const migratedPublishedAt =
        isPublished || isScheduled
          ? post.date || undefined
          : undefined

      // ============================================================
      // RANK MATH SEO → PAYLOAD META
      // ============================================================
      //
      // Existing post/content/media/workflow migration remains unchanged.
      // This block only builds the Posts `meta` object from the original
      // WordPress Rank Math values.
      // ============================================================

      const rankMath = getRankMathData(post)

      const seoTitle =
        getRankMathString(rankMath, 'rank_math_title') || title

      const seoDescription =
        getRankMathString(rankMath, 'rank_math_description') || excerpt

      const focusKeyword =
        getRankMathString(rankMath, 'rank_math_focus_keyword')

      const canonicalURL =
        getRankMathString(rankMath, 'rank_math_canonical_url')

      const breadcrumbTitle =
        getRankMathString(rankMath, 'rank_math_breadcrumb_title')

      const ogTitle =
        getRankMathString(rankMath, 'rank_math_facebook_title') ||
        seoTitle

      const ogDescription =
        getRankMathString(
          rankMath,
          'rank_math_facebook_description',
        ) || seoDescription

      const twitterTitle = getRankMathString(
        rankMath,
        'rank_math_twitter_title',
      )

      const twitterDescription = getRankMathString(
        rankMath,
        'rank_math_twitter_description',
      )

      // ------------------------------------------------------------
      // OPEN GRAPH IMAGE
      // ------------------------------------------------------------
      // Prefer the original WordPress media ID mapping first.
      // If Rank Math only stores the image URL, reuse the existing
      // media URL/path/filename mapping. If still missing, upload it
      // on demand using the existing media upload flow.
      // ------------------------------------------------------------

      let payloadOgImageId: number | undefined

      const wordpressOgImageId = getRankMathString(
        rankMath,
        'rank_math_facebook_image_id',
      )

      if (wordpressOgImageId) {
        const wpMediaId = Number(wordpressOgImageId)

        if (Number.isFinite(wpMediaId)) {
          payloadOgImageId =
            mediaMaps.byWordPressId.get(wpMediaId)
        }
      }

      if (!payloadOgImageId) {
        payloadOgImageId = await resolveRankMathImageId(
          rankMath.rank_math_facebook_image,
          mediaMaps,
          payload,
        )
      }

      // ------------------------------------------------------------
      // TWITTER IMAGE
      // ------------------------------------------------------------

      const payloadTwitterImageId =
        await resolveRankMathImageId(
          rankMath.rank_math_twitter_image,
          mediaMaps,
          payload,
        )

      // ------------------------------------------------------------
      // ROBOTS
      // ------------------------------------------------------------

      const { robots, advancedRobots } =
        parseRankMathRobots(rankMath)

      // ------------------------------------------------------------
      // FINAL PAYLOAD SEO OBJECT
      // ------------------------------------------------------------

      const seoMeta = {
        title: cleanText(seoTitle),

        description: cleanText(seoDescription),

        ...(payloadFeaturedImageId
          ? {
              image: payloadFeaturedImageId,
            }
          : {}),

        ...(focusKeyword
          ? {
              focusKeyword,
            }
          : {}),

        ...(canonicalURL
          ? {
              canonicalURL,
            }
          : {}),

        ...(breadcrumbTitle
          ? {
              breadcrumbTitle: cleanText(breadcrumbTitle),
            }
          : {}),

        robots,

        advancedRobots,

        openGraph: {
          title: cleanText(ogTitle),

          description: cleanText(ogDescription),

          ...(payloadOgImageId
            ? {
                image: payloadOgImageId,
              }
            : payloadFeaturedImageId
              ? {
                  image: payloadFeaturedImageId,
                }
              : {}),
        },

        twitter: {
          ...(twitterTitle
            ? {
                title: cleanText(twitterTitle),
              }
            : {}),

          ...(twitterDescription
            ? {
                description: cleanText(twitterDescription),
              }
            : {}),

          ...(payloadTwitterImageId
            ? {
                image: payloadTwitterImageId,
              }
            : {}),
        },
      } as any

      const data = {
        title,
        slug,
        content,
        excerpt,

        ...(payloadCategoryId ? { category: payloadCategoryId } : {}),
        tags: payloadTagIds,
        ...(payloadAuthorId ? { author: payloadAuthorId } : {}),

        publishedAt: migratedPublishedAt,

        _status: isPublished ? 'published' : 'draft',

        workflowStatus,

        cornerstone: false,

        includeInSitemap: isPublished,

        legacy: {
          wordpressId: post.id,

          // ⬇ NEW — preserves the ORIGINAL WordPress "modified" date
          // for this migrated post, separate from Payload's own
          // updatedAt (which would otherwise just be the migration
          // run's timestamp). Left undefined when WordPress doesn't
          // report a modified date.
          wordpressModifiedAt: post.modified || undefined,
        },

        ...(payloadFeaturedImageId
          ? { featuredImage: payloadFeaturedImageId }
          : {}),

        meta: seoMeta,
      } as any

      if (
        wordpressCategoryId &&
        payloadCategoryId &&
        !categoryMap.has(wordpressCategoryId)
      ) {
        console.warn(
          `  ⚠ Original category mapping missing; fallback category used: ${payloadCategoryId}`,
        )
      }

      if (post.author && payloadAuthorId && !userMap.has(post.author)) {
        console.warn(
          `  ⚠ Original author mapping missing; fallback author used: ${payloadAuthorId}`,
        )
      }

      console.log(`  ↳ Final status: ${post.status} → ${workflowStatus}`)
      console.log(
        `  ↳ Final publishedAt: ${migratedPublishedAt || 'none'}`,
      )

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
      totalBackgroundColorsSnapped += stats.backgroundColorsSnapped
      totalStyledBoxesFound += stats.styledBoxesFound
      totalStyledBoxesConverted += stats.styledBoxesConverted
      totalButtonsFound += stats.buttonsFound
      totalButtonsConverted += stats.buttonsConverted
      // ⬇ NEW
      totalWidgetsStripped += stats.widgetsStripped
      totalSlugsGeneratedFromTitle += stats.slugsGeneratedFromTitle
      totalFallbackTitlesGenerated += stats.fallbackTitlesGenerated
      totalFallbackCategoriesUsed += stats.fallbackCategoriesUsed
      totalFallbackAuthorsUsed += stats.fallbackAuthorsUsed
      totalContentConversionFallbacks += stats.contentConversionFallbacks

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

      if (stats.backgroundColorsSnapped > 0) {
        console.log(`  ↳ Background colors snapped to swatches: ${stats.backgroundColorsSnapped}`)
      }

      if (stats.styledBoxesConverted > 0) {
        console.log(`  ↳ Styled boxes preserved: ${stats.styledBoxesConverted}/${stats.styledBoxesFound}`)
      }

      if (stats.buttonsConverted > 0) {
        console.log(`  ↳ Buttons preserved: ${stats.buttonsConverted}/${stats.buttonsFound}`)
      }

      // ⬇ NEW
      if (stats.widgetsStripped > 0) {
        console.log(`  ↳ Site-chrome widgets stripped (Ask AI / Share / banners): ${stats.widgetsStripped}`)
      }

      if (stats.invalidLinksFixed > 0) {
        console.log(`  ⚠ Invalid links unwrapped: ${stats.invalidLinksFixed}`)
      }

      console.log(`  ↳ Category: ${payloadCategoryId || 'none'}`)
      console.log(`  ↳ Tags: ${payloadTagIds.length}`)
      console.log(`  ↳ Author: ${payloadAuthorId || 'none'}`)

      if (payloadFeaturedImageId) {
        console.log(`  ↳ Featured Image: ${payloadFeaturedImageId}`)
      }

      console.log(
        `  ↳ SEO Title: ${seoMeta.title || 'none'}`,
      )
      console.log(
        `  ↳ SEO Description: ${seoMeta.description ? 'yes' : 'none'}`,
      )
      console.log(
        `  ↳ Canonical URL: ${seoMeta.canonicalURL || 'none'}`,
      )
      console.log(
        `  ↳ Focus Keyword: ${seoMeta.focusKeyword || 'none'}`,
      )
      console.log(
        `  ↳ OG Image: ${payloadOgImageId || payloadFeaturedImageId || 'none'}`,
      )
      console.log(
        `  ↳ Twitter Image: ${payloadTwitterImageId || 'none'}`,
      )

      console.log(`  ↳ Status: ${post.status} → ${workflowStatus}`)
      console.log('')
    } catch (error) {
      failed++

      console.error(`  ✗ Failed: ${slug || post.slug || post.id}`)
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
  console.log(`Attempted: ${created + updated + failed}`)
  console.log('')

  console.log(`Content images found: ${totalContentImagesFound}`)
  console.log(`Content images mapped: ${totalContentImagesMapped}`)
  console.log(`Content images unmapped: ${totalContentImagesUnmapped}`)
  console.log(`Images auto-uploaded on demand: ${totalContentImagesAutoUploaded}`)
  console.log(`Audio auto-uploaded on demand: ${totalContentAudioAutoUploaded}`)
  console.log(`Video auto-uploaded on demand: ${totalContentVideoAutoUploaded}`)
  console.log(`Upload nodes normalized: ${totalUploadNodesNormalized}`)
  console.log(`Invalid upload nodes rejected: ${totalUploadNodesRejected}`)
  console.log(`Background colors snapped to swatches: ${totalBackgroundColorsSnapped}`)
  console.log(`Styled boxes preserved: ${totalStyledBoxesConverted}/${totalStyledBoxesFound}`)
  console.log(`Buttons preserved: ${totalButtonsConverted}/${totalButtonsFound}`)
  // ⬇ NEW
  console.log(`Site-chrome widgets stripped: ${totalWidgetsStripped}`)
  console.log(`Slugs generated from title (empty post_name drafts): ${totalSlugsGeneratedFromTitle}`)
  console.log(`Fallback titles generated: ${totalFallbackTitlesGenerated}`)
  console.log(`Fallback categories used: ${totalFallbackCategoriesUsed}`)
  console.log(`Fallback authors used: ${totalFallbackAuthorsUsed}`)
  console.log(`Content conversion fallbacks: ${totalContentConversionFallbacks}`)

  const sourceFuturePosts = posts.filter((post) => post.status === 'future').length
  console.log(`WordPress future posts detected: ${sourceFuturePosts}`)
  console.log(
    'Future-post mapping: WP future → Payload draft + workflowStatus draft + original publishedAt',
  )
  console.log('')

  if (
    skipped === 0 &&
    failed === 0 &&
    created + updated === posts.length &&
    totalContentImagesUnmapped === 0
  ) {
    console.log('✓ IMAGE MIGRATION VERIFICATION PASSED')
  } else if (failed === 0 && skipped === 0 && created + updated === posts.length) {
    console.log(
      '✓ POST MIGRATION COMPLETED WITH CONTENT FALLBACKS — no post was skipped',
    )
  } else {
    console.log('⚠ MIGRATION REQUIRES REVIEW — one or more posts failed')
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