import dotenv from 'dotenv'
import fs from 'fs/promises'
import path from 'path'
import { createWriteStream } from 'fs'
import { Readable } from 'stream'
import { pipeline } from 'stream/promises'
import { getPayload } from 'payload'

// ==========================================================
// LOAD ENV FIRST
// ==========================================================

dotenv.config({
  path: path.resolve(process.cwd(), '.env'),
})

// ==========================================================
// TYPES
// ==========================================================

type WordPressMedia = {
  id: number
  date?: string
  modified?: string
  slug: string
  type?: string
  media_type?: string
  mime_type?: string
  link?: string

  title?: {
    rendered?: string
  }

  caption?: {
    rendered?: string
  }

  description?: {
    rendered?: string
  }

  alt_text?: string
  source_url?: string

  media_details?: {
    width?: number
    height?: number
    file?: string
    filesize?: number
    sizes?: Record<
      string,
      {
        file?: string
        width?: number
        height?: number
        mime_type?: string
        source_url?: string
      }
    >
  }
}

type FailedMedia = {
  wordpressId: number
  filename: string
  error: string
}

// ==========================================================
// CONFIG
// ==========================================================

const WORDPRESS_API_URL =
  process.env.WORDPRESS_API_URL ||
  'https://staging1.alloypress.com/wp-json/wp/v2'

const PER_PAGE = 100

// Keep this conservative. Increase only after testing.
const CONCURRENCY = Number(process.env.MEDIA_MIGRATION_CONCURRENCY || 5)

const MAX_RETRIES = Number(process.env.MEDIA_MIGRATION_RETRIES || 3)

const REQUEST_TIMEOUT_MS = Number(
  process.env.MEDIA_MIGRATION_TIMEOUT_MS || 60_000,
)

const USER_AGENT = 'AlloyPress-Migration/2.0'

// ==========================================================
// HTML DECODE
// ==========================================================

function decodeHtml(value = ''): string {
  return value
    .replace(/<[^>]*>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .trim()
}

// ==========================================================
// GET FILENAME
// ==========================================================

function getFilenameFromUrl(url: string): string {
  try {
    const parsed = new URL(url)
    const pathname = decodeURIComponent(parsed.pathname)
    const filename = path.basename(pathname)

    if (filename) {
      return filename
    }
  } catch {
    // Ignore invalid URL
  }

  return 'wordpress-media-file'
}

// ==========================================================
// CHECK SUPPORTED MIME TYPE
// ==========================================================

function isSupportedMimeType(mimeType?: string): boolean {
  if (!mimeType) {
    return false
  }

  if (mimeType.startsWith('image/')) {
    return true
  }

  if (mimeType === 'application/pdf') {
    return true
  }

  if (mimeType.startsWith('audio/')) {
    return true
  }

  return false
}

// ==========================================================
// SLEEP
// ==========================================================

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// ==========================================================
// RETRY HELPER
// ==========================================================

async function withRetry<T>(
  operation: () => Promise<T>,
  label: string,
  retries = MAX_RETRIES,
): Promise<T> {
  let lastError: unknown

  for (let attempt = 1; attempt <= retries + 1; attempt++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error

      if (attempt > retries) {
        break
      }

      const delay = Math.min(1_000 * 2 ** (attempt - 1), 8_000)

      console.warn(
        `  ↻ ${label} failed. Retry ${attempt}/${retries} in ${delay}ms...`,
      )

      await sleep(delay)
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error(String(lastError))
}

// ==========================================================
// FETCH ALL WORDPRESS MEDIA
// ==========================================================

async function fetchAllMedia(): Promise<WordPressMedia[]> {
  const media: WordPressMedia[] = []
  let page = 1

  while (true) {
    const url =
      `${WORDPRESS_API_URL}/media` +
      `?per_page=${PER_PAGE}` +
      `&page=${page}` +
      `&orderby=id` +
      `&order=asc`

    console.log(`Fetching WordPress media page ${page}...`)

    const response = await withRetry(
      () =>
        fetch(url, {
          headers: {
            Accept: 'application/json',
            'User-Agent': USER_AGENT,
          },
        }),
      `WordPress media page ${page}`,
    )

    // WordPress returns 400 when page does not exist.
    if (response.status === 400) {
      break
    }

    if (!response.ok) {
      throw new Error(
        `Failed to fetch WordPress media. HTTP ${response.status} ${response.statusText}`,
      )
    }

    const data = (await response.json()) as WordPressMedia[]

    if (!Array.isArray(data) || data.length === 0) {
      break
    }

    media.push(...data)

    const totalPages = Number(
      response.headers.get('X-WP-TotalPages') || page,
    )

    console.log(
      `  ↳ Page ${page}/${totalPages} — ${data.length} media`,
    )

    if (page >= totalPages) {
      break
    }

    page++
  }

  return media
}

// ==========================================================
// STREAM WORDPRESS FILE TO TEMP FILE
// ==========================================================

async function downloadFile(
  url: string,
  destination: string,
): Promise<void> {
  await withRetry(
    async () => {
      const controller = new AbortController()
      const timeout = setTimeout(
        () => controller.abort(),
        REQUEST_TIMEOUT_MS,
      )

      try {
        const response = await fetch(url, {
          headers: {
            Accept: '*/*',
            'User-Agent': USER_AGENT,
          },
          signal: controller.signal,
        })

        if (!response.ok) {
          throw new Error(
            `Failed to download file. HTTP ${response.status} ${response.statusText}`,
          )
        }

        if (!response.body) {
          throw new Error('WordPress response has no readable body')
        }

        await pipeline(
          Readable.fromWeb(response.body as any),
          createWriteStream(destination),
        )
      } finally {
        clearTimeout(timeout)
      }
    },
    `Download ${path.basename(destination)}`,
  )
}

// ==========================================================
// LOAD EXISTING PAYLOAD MEDIA IN ONE QUERY
// ==========================================================
//
// IMPORTANT:
// This checks Media records already present in the NEW DB.
// It does NOT inspect orphaned objects that may already exist
// in R2 without a corresponding Payload Media record.
//
// ==========================================================

async function findExistingMediaIds(
  payload: Awaited<ReturnType<typeof getPayload>>,
  wordpressIds: number[],
): Promise<Set<number>> {
  const existingIds = new Set<number>()

  if (wordpressIds.length === 0) {
    return existingIds
  }

  const result = await payload.find({
    collection: 'media',

    where: {
      wordpressId: {
        in: wordpressIds,
      },
    },

    limit: wordpressIds.length,

    depth: 0,

    overrideAccess: true,
  })

  // Payload's generated Media type may not include custom migration fields
  // in every generated-types state. Read wordpressId defensively.
  for (const doc of result.docs) {
    const wordpressId = (doc as unknown as {
      wordpressId?: unknown
    }).wordpressId

    if (typeof wordpressId === 'number') {
      existingIds.add(wordpressId)
    }
  }

  return existingIds
}

// ==========================================================
// PROCESS ONE MEDIA ITEM
// ==========================================================

async function processMediaItem(params: {
  payload: Awaited<ReturnType<typeof getPayload>>
  item: WordPressMedia
  tempDirectory: string
  position: number
  total: number
}): Promise<'created' | 'failed' | 'unsupported'> {
  const {
    payload,
    item,
    tempDirectory,
    position,
    total,
  } = params

  const wordpressId = item.id
  const sourceUrl = item.source_url
  const mimeType = item.mime_type || ''

  const title = decodeHtml(item.title?.rendered || '')
  const caption = decodeHtml(item.caption?.rendered || '')
  const description = decodeHtml(item.description?.rendered || '')

  const filename = sourceUrl
    ? getFilenameFromUrl(sourceUrl)
    : `wordpress-media-${wordpressId}`

  const prefix = `[${position}/${total}] ${filename}`

  if (!sourceUrl) {
    console.error(`  ✗ ${prefix} — no source_url`)
    return 'failed'
  }

  if (!isSupportedMimeType(mimeType)) {
    console.log(`  ↳ ${prefix} — unsupported MIME: ${mimeType}`)
    return 'unsupported'
  }

  const safeFilename = filename.replace(/[<>:"/\\|?*\x00-\x1F]/g, '_')
  const tempFilePath = path.join(
    tempDirectory,
    `${wordpressId}-${safeFilename}`,
  )

  try {
    console.log(`  → ${prefix} — downloading`)

    await downloadFile(sourceUrl, tempFilePath)

    const alt =
      item.alt_text?.trim() ||
      title ||
      filename

    console.log(`  → ${prefix} — Payload → R2`)

    const created = await withRetry(
      () =>
        payload.create({
          collection: 'media',

          data: {
            wordpressId,
            originalUrl: sourceUrl,
            alt,
            title: title || filename,
            caption: caption || '',
            description: description || '',
          },

          filePath: tempFilePath,

          overrideAccess: true,
        }),
      `Create Payload media ${wordpressId}`,
    )

    console.log(
      `  ✓ ${prefix} — created Payload ID: ${created.id}`,
    )

    return 'created'
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : String(error)

    console.error(`  ✗ ${prefix} — ${message}`)

    return 'failed'
  } finally {
    await fs.rm(tempFilePath, {
      force: true,
    }).catch(() => undefined)
  }
}

// ==========================================================
// CONCURRENCY WORKER
// ==========================================================

async function runWithConcurrency<T>(
  items: T[],
  concurrency: number,
  worker: (item: T, index: number) => Promise<void>,
): Promise<void> {
  let nextIndex = 0

  async function runWorker(): Promise<void> {
    while (true) {
      const index = nextIndex++

      if (index >= items.length) {
        return
      }

      await worker(items[index], index)
    }
  }

  const workerCount = Math.min(
    Math.max(1, concurrency),
    items.length,
  )

  await Promise.all(
    Array.from(
      { length: workerCount },
      () => runWorker(),
    ),
  )
}

// ==========================================================
// MIGRATE MEDIA
// ==========================================================

export async function migrateMedia() {
  console.log('')
  console.log('========================================')
  console.log(' Optimized AlloyPress Media Migration')
  console.log('========================================')
  console.log(`Concurrency: ${CONCURRENCY}`)
  console.log(`Retries: ${MAX_RETRIES}`)
  console.log('')

  // Payload config is dynamically imported AFTER .env.
  const { default: config } = await import(
    '../../src/payload.config'
  )

  const payload = await getPayload({
    config,
  })

  // ========================================================
  // FETCH WORDPRESS MEDIA
  // ========================================================

  const media = await fetchAllMedia()

  console.log('')
  console.log(
    `Found ${media.length} WordPress media files`,
  )
  console.log('')

  if (media.length === 0) {
    console.log('No WordPress media found.')
    return
  }

  // ========================================================
  // FILTER SUPPORTED MEDIA FIRST
  // ========================================================

  const supportedMedia = media.filter(
    (item) =>
      Boolean(item.source_url) &&
      isSupportedMimeType(item.mime_type),
  )

  const unsupportedCount =
    media.length - supportedMedia.length

  // ========================================================
  // ONE DATABASE QUERY FOR EXISTING MEDIA
  // ========================================================

  console.log(
    `Checking ${supportedMedia.length} media records already in Payload...`,
  )

  const existingIds = await findExistingMediaIds(
    payload,
    supportedMedia.map((item) => item.id),
  )

  const pendingMedia = supportedMedia.filter(
    (item) => !existingIds.has(item.id),
  )

  console.log(
    `  ↳ Existing: ${existingIds.size}`,
  )

  console.log(
    `  ↳ Pending migration: ${pendingMedia.length}`,
  )

  console.log(
    `  ↳ Unsupported: ${unsupportedCount}`,
  )

  if (pendingMedia.length === 0) {
    console.log('')
    console.log('Nothing to migrate.')
    return
  }

  // ========================================================
  // TEMP DIRECTORY
  // ========================================================

  const tempDirectory = await fs.mkdtemp(
    path.join(
      process.env.TMPDIR || process.env.TEMP || '/tmp',
      'alloypress-media-',
    ),
  )

  console.log('')
  console.log(
    `Temporary directory: ${tempDirectory}`,
  )
  console.log('')

  // ========================================================
  // COUNTERS
  // ========================================================

  let createdCount = 0
  let failedCount = 0

  const failedMedia: FailedMedia[] = []

  // ========================================================
  // CONCURRENT MIGRATION
  // ========================================================

  await runWithConcurrency(
    pendingMedia,
    CONCURRENCY,
    async (item, index) => {
      const result = await processMediaItem({
        payload,
        item,
        tempDirectory,
        position: index + 1,
        total: pendingMedia.length,
      })

      if (result === 'created') {
        createdCount++
      }

      if (result === 'failed') {
        failedCount++

        failedMedia.push({
          wordpressId: item.id,
          filename: item.source_url
            ? getFilenameFromUrl(item.source_url)
            : `wordpress-media-${item.id}`,
          error: 'Migration failed. See log above.',
        })
      }
    },
  )

  // ========================================================
  // CLEAN TEMP DIRECTORY
  // ========================================================

  await fs.rm(tempDirectory, {
    recursive: true,
    force: true,
  }).catch(() => undefined)

  // ========================================================
  // FINAL SUMMARY
  // ========================================================

  console.log('')
  console.log('========================================')
  console.log(' Media Migration Completed')
  console.log('========================================')

  console.log(
    `Total WordPress media: ${media.length}`,
  )

  console.log(
    `Already existed: ${existingIds.size}`,
  )

  console.log(
    `Created: ${createdCount}`,
  )

  console.log(
    `Unsupported: ${unsupportedCount}`,
  )

  console.log(
    `Failed: ${failedCount}`,
  )

  console.log('========================================')
  console.log('')

  // ========================================================
  // FAILED MEDIA REPORT
  // ========================================================

  if (failedMedia.length > 0) {
    console.log('Failed Media')
    console.log('----------------------------------------')

    for (const failed of failedMedia) {
      console.log(`WP ID: ${failed.wordpressId}`)
      console.log(`Filename: ${failed.filename}`)
      console.log(`Error: ${failed.error}`)
      console.log('')
    }

    console.log('----------------------------------------')
  }
}

// ==========================================================
// RUN MIGRATION
// ==========================================================

migrateMedia().catch((error) => {
  console.error('')
  console.error('========================================')
  console.error(' Media Migration Failed')
  console.error('========================================')
  console.error(error)
  console.error('')

  process.exit(1)
})
