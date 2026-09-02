import dotenv from 'dotenv'
import { JSDOM } from 'jsdom'
import {
  convertHTMLToLexical,
  editorConfigFactory,
} from '@payloadcms/richtext-lexical'
import { getPayload } from 'payload'

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

type WPPage = {
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
  uploadNodesNormalized: number
  uploadNodesRejected: number
  invalidLinksFixed: number
}

// ============================================================
// WORDPRESS API
// ============================================================

const WORDPRESS_API_URL =
  process.env.WORDPRESS_API_URL ||
  'https://staging1.alloypress.com/wp-json/wp/v2'

// ============================================================
// ⬇ NEW — WORDPRESS AUTH (needed to see draft/pending/private pages)
// ============================================================
//
// WordPress REST API only exposes `publish` status content to
// unauthenticated requests. To pull draft/pending/private/future
// pages, we must authenticate using a WordPress Application
// Password (wp-admin → Users → Profile → Application Passwords),
// sent as HTTP Basic Auth.
//
// If WP_USERNAME / WP_APP_PASSWORD are not set in .env, the script
// still runs — but WordPress will silently ignore the `status`
// query param and only return published content.
// ============================================================

function getWordPressAuthHeader(): Record<string, string> {
  const username = process.env.WP_USERNAME
  const appPassword = process.env.WP_APP_PASSWORD

  if (!username || !appPassword) {
    console.warn(
      '  ⚠ WP_USERNAME / WP_APP_PASSWORD not set in .env — ' +
        'only PUBLISHED pages will be fetched. Draft/pending/private ' +
        'pages will be skipped.',
    )
    return {}
  }

  const token = Buffer.from(`${username}:${appPassword}`).toString(
    'base64',
  )

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
// FETCH ALL WORDPRESS PAGES
// ============================================================
//
// ⬇ CHANGED — now sends the WP auth header and requests every
// status (publish, draft, pending, private, future) instead of
// relying on the unauthenticated default (publish-only).
// ============================================================

async function fetchAllPages(): Promise<WPPage[]> {
  const pages: WPPage[] = []

  let page = 1
  const perPage = 100

  const authHeaders = getWordPressAuthHeader()

  while (true) {
    const url =
      `${WORDPRESS_API_URL}/pages` +
      `?per_page=${perPage}&page=${page}` +
      `&status=publish,draft,pending,private,future`

    console.log(`Fetching WordPress pages page ${page}...`)

    const response = await fetch(url, {
      headers: authHeaders,
    })

    // WordPress returns 400 when page number exceeds available pages.
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

    const data = (await response.json()) as WPPage[]

    if (!Array.isArray(data) || data.length === 0) {
      break
    }

    pages.push(...data)

    const totalPages = Number(
      response.headers.get('X-WP-TotalPages') || page,
    )

    if (page >= totalPages) {
      break
    }

    page++
  }

  return pages
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

    // Your media migration stores WP ID at top level.
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

  return {
    byWordPressId,
    byOriginalUrl,
    byPath,
    byFilename,
    allPayloadIds,
  }
}

// ============================================================
// FIND MEDIA
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

  // 3. WordPress resized image
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
    console.log(`    ↳ Auto-uploading missing media: ${sourceUrl}`)

    const response = await fetch(sourceUrl)

    if (!response.ok) {
      console.warn(
        `    ⚠ Media fetch failed (${response.status}): ${sourceUrl}`,
      )

      return undefined
    }

    const arrayBuffer = await response.arrayBuffer()

    const buffer = Buffer.from(arrayBuffer)

    const filename =
      sourceUrl.split('/').pop()?.split('?')[0] || `migrated-${Date.now()}`

    const mimetype =
      response.headers.get('content-type') || 'application/octet-stream'

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
      console.warn(`    ⚠ Invalid media ID returned: ${sourceUrl}`)

      return undefined
    }

    // Warm caches
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

    console.log(`    ↳ Auto-uploaded: ${filename} → Payload ID ${payloadId}`)

    return payloadId
  } catch (error) {
    console.warn(`    ⚠ On-demand media upload failed: ${sourceUrl}`, error)

    return undefined
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
    (JSDOM as any)?.JSDOM ?? (JSDOM as any)?.default?.JSDOM ?? JSDOM

  if (typeof JSDOMCtor !== 'function') {
    throw new Error('JSDOM constructor is unavailable.')
  }

  const dom = new JSDOMCtor(`<!DOCTYPE html><body>${html}</body>`)

  const document: Document = dom.window.document

  // ==========================================================
  // IMAGES
  // ==========================================================

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

      console.warn('    ⚠ Image has no usable source.')

      continue
    }

    let mediaId = findMediaId(src, mediaMaps)

    // Auto-upload if missing
    if (!mediaId) {
      mediaId = await ensureMediaUploaded(src, mediaMaps, payload)

      if (mediaId) {
        stats.contentImagesAutoUploaded++
      }
    }

    if (!mediaId) {
      stats.contentImagesUnmapped++

      console.warn(`    ⚠ Image could not be mapped: ${src}`)

      image.setAttribute('data-migration-unmapped-image', 'true')

      continue
    }

    stats.contentImagesMapped++

    image.setAttribute('data-lexical-upload-id', String(mediaId))

    image.setAttribute('data-lexical-upload-relation-to', 'media')
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
    const relationTo = node.relationTo || node.relationToCollection || 'media'

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
        `Invalid Payload upload node. Media ID "${String(
          node.value,
        )}" does not exist in media collection.`,
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
// INVALID LINK VALIDATION
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
          `    ⚠ Invalid link removed: ${String(url).slice(0, 80)}...`,
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

  // Fail if an image could not be recovered.
  if (stats.contentImagesUnmapped > 0) {
    throw new Error(
      `Content contains ${stats.contentImagesUnmapped} unmapped image(s). ` +
        `No image was removed. Check the source URL.`,
    )
  }

  let lexicalJSON = convertHTMLToLexical({
    html: preparedHTML,
    editorConfig,
    JSDOM,
  })

  // Fix invalid links
  lexicalJSON = sanitizeLexicalLinks(lexicalJSON, stats)

  // Normalize upload nodes
  lexicalJSON = normalizeLexicalUploadNodes(
    lexicalJSON,
    mediaMaps.allPayloadIds,
    stats,
  )

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
// FIND EXISTING PAGE
// ============================================================

async function findExistingPage(payload: any, wordpressId: number) {
  const result = await payload.find({
    collection: 'pages',

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
// MIGRATE PAGES
// ============================================================

export async function migratePages() {
  console.log('')
  console.log('========================================')
  console.log(' Starting Page Migration')
  console.log('========================================')
  console.log('')

  const payload = await getPayload({
    config,
  })

  // ----------------------------------------------------------
  // FETCH WORDPRESS PAGES
  // ----------------------------------------------------------

  const pages = await fetchAllPages()

  console.log(`Found ${pages.length} WordPress pages`)

  console.log('')

  if (pages.length === 0) {
    console.log('No WordPress pages found.')

    return
  }

  // ----------------------------------------------------------
  // MEDIA MAP
  // ----------------------------------------------------------

  console.log('Loading media mappings...')

  const mediaMaps = await buildMediaMaps(payload)

  console.log(`Media mapped by WordPress ID: ${mediaMaps.byWordPressId.size}`)

  console.log(`Media filename fallbacks: ${mediaMaps.byFilename.size}`)

  console.log('')

  // ----------------------------------------------------------
  // LEXICAL CONFIG
  // ----------------------------------------------------------

  const editorConfig = await editorConfigFactory.default({
    config,
  })

  // ----------------------------------------------------------
  // COUNTERS
  // ----------------------------------------------------------

  let created = 0
  let updated = 0
  let skipped = 0
  let failed = 0

  let totalImagesFound = 0
  let totalImagesMapped = 0
  let totalImagesUnmapped = 0
  let totalImagesAutoUploaded = 0
  let totalUploadNodesNormalized = 0
  let totalUploadNodesRejected = 0
  let totalInvalidLinksFixed = 0

  // ----------------------------------------------------------
  // PAGE LOOP
  // ----------------------------------------------------------

  for (let index = 0; index < pages.length; index++) {
    const page = pages[index]

    console.log(
      `[${index + 1}/${pages.length}] ${cleanText(page.title?.rendered)}`,
    )

    const stats: MigrationStats = {
      contentImagesFound: 0,
      contentImagesMapped: 0,
      contentImagesUnmapped: 0,
      contentImagesAutoUploaded: 0,
      uploadNodesNormalized: 0,
      uploadNodesRejected: 0,
      invalidLinksFixed: 0,
    }

    let content: any = null

    try {
      // ------------------------------------------------------
      // BASIC VALIDATION
      // ------------------------------------------------------

      if (!page.id) {
        console.warn('  ⚠ Missing WordPress page ID. Skipping.')

        skipped++
        continue
      }

      if (!page.slug) {
        console.warn('  ⚠ Missing page slug. Skipping.')

        skipped++
        continue
      }

      // ------------------------------------------------------
      // TITLE
      // ------------------------------------------------------

      const title = cleanText(page.title?.rendered)

      if (!title) {
        throw new Error('Page title is empty.')
      }

      // ------------------------------------------------------
      // EXCERPT
      // ------------------------------------------------------

      const excerpt = cleanText(page.excerpt?.rendered)

      // ------------------------------------------------------
      // CONTENT
      // ------------------------------------------------------

      const rawContent = page.content?.rendered || '<p></p>'

      content = await convertToLexical(
        rawContent,
        editorConfig,
        mediaMaps,
        stats,
        payload,
      )

      // ------------------------------------------------------
      // FEATURED IMAGE
      // ------------------------------------------------------

      let featuredImageId: number | undefined

      if (page.featured_media && page.featured_media > 0) {
        featuredImageId = mediaMaps.byWordPressId.get(page.featured_media)

        if (
          featuredImageId &&
          !mediaMaps.allPayloadIds.has(featuredImageId)
        ) {
          throw new Error(
            `Featured image Payload media ID is invalid: ${featuredImageId}`,
          )
        }

        if (!featuredImageId) {
          console.warn(
            `    ⚠ Featured image mapping missing: WP media ${page.featured_media}`,
          )
        }
      }

      // ------------------------------------------------------
      // STATUS
      // ------------------------------------------------------
      //
      // ⬇ NOTE — WordPress "private" and "future" pages are also
      // pulled in now (see fetchAllPages), and are mapped to
      // Payload "draft" here since only publish/draft exist on the
      // Payload side. Adjust this if your Pages collection has a
      // dedicated status for them.
      // ------------------------------------------------------

      const isPublished = page.status === 'publish'

      const status: 'draft' | 'published' = isPublished
        ? 'published'
        : 'draft'

      // ------------------------------------------------------
      // WORDPRESS META / SEO
      // ------------------------------------------------------

      const wpMeta =
        page.meta && typeof page.meta === 'object'
          ? (page.meta as Record<string, any>)
          : {}

      const seoTitle =
        typeof wpMeta.rank_math_title === 'string'
          ? cleanText(wpMeta.rank_math_title)
          : undefined

      const seoDescription =
        typeof wpMeta.rank_math_description === 'string'
          ? cleanText(wpMeta.rank_math_description)
          : undefined

      const canonicalURL =
        typeof wpMeta.rank_math_canonical_url === 'string'
          ? wpMeta.rank_math_canonical_url.trim()
          : undefined

      // ------------------------------------------------------
      // OPEN GRAPH IMAGE
      // ------------------------------------------------------

      let openGraphImageId: number | undefined

      if (typeof wpMeta.rank_math_facebook_image === 'string') {
        openGraphImageId = findMediaId(
          wpMeta.rank_math_facebook_image,
          mediaMaps,
        )

        // Try on-demand upload if missing.
        if (!openGraphImageId) {
          openGraphImageId = await ensureMediaUploaded(
            wpMeta.rank_math_facebook_image,
            mediaMaps,
            payload,
          )
        }
      }

      // ------------------------------------------------------
      // SEO OBJECT
      // ------------------------------------------------------

      const hasSEO =
        seoTitle || seoDescription || canonicalURL || openGraphImageId

      const seo = hasSEO
        ? {
            ...(seoTitle ? { title: seoTitle } : {}),

            ...(seoDescription ? { description: seoDescription } : {}),

            ...(canonicalURL ? { canonicalURL } : {}),

            ...(openGraphImageId
              ? { openGraphImage: openGraphImageId }
              : {}),
          }
        : undefined

      // ------------------------------------------------------
      // FINAL PAYLOAD DATA
      // ------------------------------------------------------

      const data: Record<string, any> = {
        title,

        slug: page.slug,

        content,

        excerpt,

        status,

        legacy: {
          wordpressId: page.id,

          wordpressSlug: page.slug,

          wordpressAuthorId: page.author,
        },

        ...(featuredImageId ? { featuredImage: featuredImageId } : {}),

        ...(seo ? { seo } : {}),
      }

      // ------------------------------------------------------
      // LOG
      // ------------------------------------------------------

      console.log(`  ↳ WordPress ID: ${page.id}`)

      console.log(`  ↳ Slug: ${page.slug}`)

      console.log(`  ↳ Status: ${page.status} → ${status}`)

      console.log(`  ↳ Content images: ${stats.contentImagesMapped}`)

      if (featuredImageId) {
        console.log(`  ↳ Featured Image: ${featuredImageId}`)
      }

      if (seo) {
        console.log('  ↳ SEO: migrated')
      }

      // ------------------------------------------------------
      // FIND EXISTING
      // ------------------------------------------------------

      const existing = await findExistingPage(payload, page.id)

      // ------------------------------------------------------
      // UPDATE
      // ------------------------------------------------------

      if (existing) {
        await payload.update({
          collection: 'pages',

          id: Number(existing.id),

          data,

          draft: !isPublished,
        } as any)

        updated++

        console.log(`  ↳ Updated Payload Page ID: ${existing.id}`)
      }

      // ------------------------------------------------------
      // CREATE
      // ------------------------------------------------------
      else {
        const createdPage = await payload.create({
          collection: 'pages',

          data,

          draft: !isPublished,
        } as any)

        created++

        console.log(`  ↳ Created Payload Page ID: ${createdPage.id}`)
      }

      // ------------------------------------------------------
      // STATS
      // ------------------------------------------------------

      totalImagesFound += stats.contentImagesFound

      totalImagesMapped += stats.contentImagesMapped

      totalImagesUnmapped += stats.contentImagesUnmapped

      totalImagesAutoUploaded += stats.contentImagesAutoUploaded

      totalUploadNodesNormalized += stats.uploadNodesNormalized

      totalUploadNodesRejected += stats.uploadNodesRejected

      totalInvalidLinksFixed += stats.invalidLinksFixed

      if (stats.contentImagesAutoUploaded > 0) {
        console.log(
          `  ↳ Images auto-uploaded: ${stats.contentImagesAutoUploaded}`,
        )
      }

      if (stats.invalidLinksFixed > 0) {
        console.log(`  ↳ Invalid links fixed: ${stats.invalidLinksFixed}`)
      }

      console.log('')
    } catch (error) {
      failed++

      console.error(`  ✗ Failed: ${page.slug}`)

      console.error('  FULL PAYLOAD ERROR:')

      if (error instanceof Error) {
        console.error(error.stack)
      } else {
        console.dir(error, {
          depth: null,
        })
      }

      // ------------------------------------------------------
      // DUMP FAILED CONTENT
      // ------------------------------------------------------

      try {
        const fs = await import('fs')

        fs.writeFileSync(
          `./failed-page-${page.id}-content.json`,
          JSON.stringify(content, null, 2),
        )

        console.error(
          `  📄 Content dumped to failed-page-${page.id}-content.json`,
        )
      } catch (dumpError) {
        console.error('  Could not dump content:', dumpError)
      }

      console.log('')

      continue
    }
  }

  // ==========================================================
  // FINAL SUMMARY
  // ==========================================================

  console.log('')

  console.log('========================================')

  console.log(' Page Migration Completed')

  console.log('========================================')

  console.log('')

  console.log(`Total WordPress pages: ${pages.length}`)

  console.log(`Created: ${created}`)

  console.log(`Updated: ${updated}`)

  console.log(`Skipped: ${skipped}`)

  console.log(`Failed: ${failed}`)

  console.log('')

  console.log(`Content images found: ${totalImagesFound}`)

  console.log(`Content images mapped: ${totalImagesMapped}`)

  console.log(`Content images unmapped: ${totalImagesUnmapped}`)

  console.log(`Images auto-uploaded: ${totalImagesAutoUploaded}`)

  console.log(`Upload nodes normalized: ${totalUploadNodesNormalized}`)

  console.log(`Invalid upload nodes rejected: ${totalUploadNodesRejected}`)

  console.log(`Invalid links fixed: ${totalInvalidLinksFixed}`)

  console.log('')

  // ==========================================================
  // VERIFICATION
  // ==========================================================

  if (
    failed === 0 &&
    totalImagesUnmapped === 0 &&
    totalImagesMapped === totalUploadNodesNormalized
  ) {
    console.log('✓ PAGE MIGRATION VERIFICATION PASSED')
  } else {
    console.log('⚠ PAGE MIGRATION VERIFICATION REQUIRES REVIEW')
  }

  console.log('========================================')

  console.log('')
}

// ============================================================
// RUN
// ============================================================

migratePages().catch((error) => {
  console.error('')

  console.error('========================================')

  console.error(' Page Migration Failed')

  console.error('========================================')

  console.error(error)

  console.error('')

  process.exit(1)
})