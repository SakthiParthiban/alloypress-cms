import dotenv from 'dotenv'
import fs from 'fs/promises'
import os from 'os'
import path from 'path'
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

// ==========================================================
// CONFIG
// ==========================================================

const WORDPRESS_API_URL =
  process.env.WORDPRESS_API_URL ||
  'https://staging1.alloypress.com/wp-json/wp/v2'

const PER_PAGE = 100

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

    const pathname = decodeURIComponent(
      parsed.pathname,
    )

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

function isSupportedMimeType(
  mimeType?: string,
): boolean {
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
// FETCH ALL WORDPRESS MEDIA
// ==========================================================

async function fetchAllMedia(): Promise<
  WordPressMedia[]
> {
  const media: WordPressMedia[] = []

  let page = 1

  while (true) {
    const url =
      `${WORDPRESS_API_URL}/media` +
      `?per_page=${PER_PAGE}` +
      `&page=${page}` +
      `&orderby=id` +
      `&order=asc`

    console.log(
      `Fetching WordPress media page ${page}...`,
    )

    const response = await fetch(url, {
      headers: {
        Accept: 'application/json',
        'User-Agent': 'AlloyPress-Migration/1.0',
      },
    })

    // WordPress returns 400 when page does not exist.
    if (response.status === 400) {
      break
    }

    if (!response.ok) {
      throw new Error(
        `Failed to fetch WordPress media. ` +
          `HTTP ${response.status} ${response.statusText}`,
      )
    }

    const data =
      (await response.json()) as WordPressMedia[]

    if (!Array.isArray(data) || data.length === 0) {
      break
    }

    media.push(...data)

    const totalPages = Number(
      response.headers.get('X-WP-TotalPages') ||
        page,
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
// DOWNLOAD WORDPRESS FILE
// ==========================================================

async function downloadFile(
  url: string,
  destination: string,
): Promise<void> {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'AlloyPress-Migration/1.0',
    },
  })

  if (!response.ok) {
    throw new Error(
      `Failed to download file. ` +
        `HTTP ${response.status} ${response.statusText}`,
    )
  }

  const arrayBuffer =
    await response.arrayBuffer()

  await fs.writeFile(
    destination,
    Buffer.from(arrayBuffer),
  )
}

// ==========================================================
// CHECK EXISTING PAYLOAD MEDIA
// ==========================================================

async function findExistingMedia(
  payload: Awaited<
    ReturnType<typeof getPayload>
  >,
  wordpressId: number,
) {
  const result = await payload.find({
    collection: 'media',

    where: {
      wordpressId: {
        equals: wordpressId,
      },
    },

    limit: 1,

    depth: 0,

    overrideAccess: true,
  })

  return result.docs[0] || null
}

// ==========================================================
// MIGRATE MEDIA
// ==========================================================

export async function migrateMedia() {
  console.log('')
  console.log('========================================')
  console.log(' Starting Media Migration')
  console.log('========================================')
  console.log('')

  // ========================================================
  // IMPORTANT
  // ========================================================
  //
  // Payload config is dynamically imported AFTER .env
  // has been loaded.
  //
  // This prevents:
  //
  // "missing secret key"
  //
  // ========================================================

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
  // TEMP DIRECTORY
  // ========================================================

  const tempDirectory =
    await fs.mkdtemp(
      path.join(
        os.tmpdir(),
        'alloypress-tmp-',
      ),
    )

  console.log(
    `Temporary directory: ${tempDirectory}`,
  )

  console.log('')

  // ========================================================
  // MIGRATION COUNTERS
  // ========================================================

  let createdCount = 0
  let skippedCount = 0
  let unsupportedCount = 0
  let failedCount = 0

  const failedMedia: Array<{
    wordpressId: number
    filename: string
    error: string
  }> = []

  // ========================================================
  // PROCESS MEDIA ONE BY ONE
  // ========================================================

  for (
    let index = 0;
    index < media.length;
    index++
  ) {
    const item = media[index]

    const wordpressId = item.id

    const sourceUrl = item.source_url

    const mimeType = item.mime_type || ''

    const title = decodeHtml(
      item.title?.rendered || '',
    )

    const caption = decodeHtml(
      item.caption?.rendered || '',
    )

    const description = decodeHtml(
      item.description?.rendered || '',
    )

    const filename = sourceUrl
      ? getFilenameFromUrl(sourceUrl)
      : `wordpress-media-${wordpressId}`

    console.log(
      `[${index + 1}/${media.length}] ${filename}`,
    )

    console.log(
      `  ↳ WordPress ID: ${wordpressId}`,
    )

    console.log(
      `  ↳ MIME type: ${mimeType || 'unknown'}`,
    )

    // ======================================================
    // SOURCE URL CHECK
    // ======================================================

    if (!sourceUrl) {
      failedCount++

      const error =
        'WordPress media has no source_url'

      failedMedia.push({
        wordpressId,
        filename,
        error,
      })

      console.error(
        `  ✗ ${error}`,
      )

      console.log('')

      continue
    }

    // ======================================================
    // MIME TYPE CHECK
    // ======================================================

    if (!isSupportedMimeType(mimeType)) {
      unsupportedCount++

      console.log(
        `  ↳ Skipped unsupported MIME type: ${mimeType}`,
      )

      console.log('')

      continue
    }

    // ======================================================
    // CHECK EXISTING MEDIA
    // ======================================================

    try {
      const existing =
        await findExistingMedia(
          payload,
          wordpressId,
        )

      if (existing) {
        skippedCount++

        console.log(
          `  ↳ Already exists. Payload ID: ${existing.id}`,
        )

        console.log('')

        continue
      }
    } catch (error) {
      failedCount++

      const errorMessage =
        error instanceof Error
          ? error.message
          : String(error)

      failedMedia.push({
        wordpressId,
        filename,
        error: errorMessage,
      })

      console.error(
        `  ✗ Existing-media check failed: ${errorMessage}`,
      )

      console.log('')

      continue
    }

    // ======================================================
    // TEMP FILE PATH
    // ======================================================

    const tempFilePath = path.join(
      tempDirectory,
      `${wordpressId}-${filename}`,
    )

    try {
      // ====================================================
      // DOWNLOAD
      // ====================================================

      console.log(
        '  ↳ Downloading original file...',
      )

      await downloadFile(
        sourceUrl,
        tempFilePath,
      )

      // ====================================================
      // ALT TEXT
      // ====================================================

      const alt =
        item.alt_text?.trim() ||
        title ||
        filename

      // ====================================================
      // CREATE PAYLOAD MEDIA
      // ====================================================

      console.log(
        '  ↳ Uploading through Payload → R2...',
      )

      const created =
        await payload.create({
          collection: 'media',

          data: {
            wordpressId,

            originalUrl: sourceUrl,

            alt,

            title: title || filename,

            caption: caption || '',

            description:
              description || '',
          },

          filePath: tempFilePath,

          overrideAccess: true,
        })

      createdCount++

      console.log(
        `  ✓ Created Payload media ID: ${created.id}`,
      )

      console.log(
        `  ✓ Stored filename: ${created.filename}`,
      )

      // ====================================================
      // CLEAN TEMP FILE
      // ====================================================

      await fs.rm(
        tempFilePath,
        {
          force: true,
        },
      )

      console.log('')
    } catch (error) {
      failedCount++

      const errorMessage =
        error instanceof Error
          ? error.message
          : String(error)

      failedMedia.push({
        wordpressId,
        filename,
        error: errorMessage,
      })

      console.error(
        `  ✗ Migration failed: ${errorMessage}`,
      )

      // ====================================================
      // CLEAN TEMP FILE AFTER FAILURE
      // ====================================================

      try {
        await fs.rm(
          tempFilePath,
          {
            force: true,
          },
        )
      } catch {
        // Ignore cleanup errors
      }

      console.log('')
    }
  }

  // ========================================================
  // CLEAN TEMP DIRECTORY
  // ========================================================

  try {
    await fs.rm(
      tempDirectory,
      {
        recursive: true,
        force: true,
      },
    )
  } catch {
    // Ignore cleanup errors
  }

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
    `Created: ${createdCount}`,
  )

  console.log(
    `Skipped / already exists: ${skippedCount}`,
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
    console.log(
      'Failed Media',
    )

    console.log(
      '----------------------------------------',
    )

    for (const failed of failedMedia) {
      console.log(
        `WP ID: ${failed.wordpressId}`,
      )

      console.log(
        `Filename: ${failed.filename}`,
      )

      console.log(
        `Error: ${failed.error}`,
      )

      console.log('')
    }

    console.log(
      '----------------------------------------',
    )
  }
}

// ==========================================================
// RUN MIGRATION
// ==========================================================

migrateMedia()
  .catch((error) => {
    console.error('')
    console.error('========================================')
    console.error(' Media Migration Failed')
    console.error('========================================')
    console.error(error)
    console.error('')

    process.exit(1)
  })