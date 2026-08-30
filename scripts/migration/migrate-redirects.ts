import dotenv from 'dotenv'
import fs from 'fs'
import { getPayload } from 'payload'

dotenv.config({
  path: '.env',
})

// ============================================================
// PAYLOAD CONFIG
// ============================================================

const { default: configPromise } = await import(
  '../../src/payload.config'
)

const config = await configPromise

// ============================================================
// TYPES
// ============================================================

type RankMathSource = {
  pattern?: string
  comparison?: string
  ignore?: string
}

type RankMathRedirect = {
  id: number
  sources: RankMathSource[]
  url_to: string
  header_code: number
  status: string
  created?: string
  updated?: string
}

// ============================================================
// CONFIG
// ============================================================

const REDIRECTS_FILE =
  process.env.REDIRECTS_FILE ||
  './rankmath-redirects.json'

// ============================================================
// NORMALIZE SOURCE
// ============================================================

function normalizeSource(value: string): string {
  let source = value.trim()

  if (!source) {
    return ''
  }

  // If source is a full URL,
  // convert it to pathname.
  try {
    const url = new URL(source)

    source =
      url.pathname +
      url.search
  } catch {
    // Already a relative path.
  }

  // Remove leading slashes.
  source = source.replace(/^\/+/, '')

  return `/${source}`
}

// ============================================================
// NORMALIZE DESTINATION
// ============================================================

function normalizeDestination(value: string): string {
  const destination = value.trim()

  if (!destination) {
    return '/'
  }

  // Keep absolute URLs.
  try {
    const url = new URL(destination)

    return url.toString()
  } catch {
    // Relative destination.
    if (destination.startsWith('/')) {
      return destination
    }

    return `/${destination}`
  }
}

// ============================================================
// LOAD JSON
// ============================================================

function loadRedirects(): RankMathRedirect[] {
  if (!fs.existsSync(REDIRECTS_FILE)) {
    throw new Error(
      `Redirect file not found: ${REDIRECTS_FILE}`,
    )
  }

  const raw = fs.readFileSync(
    REDIRECTS_FILE,
    'utf8',
  )

  let parsed: unknown

  try {
    parsed = JSON.parse(raw)
  } catch {
    throw new Error(
      `Invalid JSON file: ${REDIRECTS_FILE}`,
    )
  }

  // ----------------------------------------------------------
  // Support:
  //
  // {
  //   "success": true,
  //   "count": 120,
  //   "redirects": [...]
  // }
  // ----------------------------------------------------------

  if (
    typeof parsed === 'object' &&
    parsed !== null &&
    'redirects' in parsed
  ) {
    const data = parsed as {
      redirects?: unknown
    }

    if (Array.isArray(data.redirects)) {
      return data.redirects as RankMathRedirect[]
    }
  }

  // ----------------------------------------------------------
  // Also support direct array
  // ----------------------------------------------------------

  if (Array.isArray(parsed)) {
    return parsed as RankMathRedirect[]
  }

  throw new Error(
    'Invalid Rank Math redirect JSON structure.',
  )
}

// ============================================================
// FIND EXISTING REDIRECT
// ============================================================

async function findExistingRedirect(
  payload: any,
  from: string,
) {
  const result =
    await payload.find({
      collection: 'redirects',

      where: {
        from: {
          equals: from,
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

async function migrateRedirects() {
  console.log('')

  console.log(
    '========================================',
  )

  console.log(
    ' Starting Rank Math Redirect Migration',
  )

  console.log(
    '========================================',
  )

  console.log('')

  const payload =
    await getPayload({
      config,
    })

  const redirects =
    loadRedirects()

  console.log(
    `Found ${redirects.length} active Rank Math redirects`,
  )

  console.log('')

  let created = 0
  let updated = 0
  let skipped = 0
  let failed = 0
  let sourceCount = 0

  // ==========================================================
  // REDIRECT LOOP
  // ==========================================================

  for (
    let index = 0;
    index < redirects.length;
    index++
  ) {
    const redirect =
      redirects[index]

    console.log(
      `[${index + 1}/${redirects.length}] WP Redirect ID: ${redirect.id}`,
    )

    try {
      // ------------------------------------------------------
      // VALIDATION
      // ------------------------------------------------------

      if (!redirect.id) {
        console.warn(
          '  ⚠ Missing Rank Math ID. Skipping.',
        )

        skipped++
        continue
      }

      if (
        !Array.isArray(
          redirect.sources,
        ) ||
        redirect.sources.length === 0
      ) {
        console.warn(
          '  ⚠ Missing sources. Skipping.',
        )

        skipped++
        continue
      }

      if (!redirect.url_to) {
        console.warn(
          '  ⚠ Missing destination. Skipping.',
        )

        skipped++
        continue
      }

      // ------------------------------------------------------
      // 301 CHECK
      // ------------------------------------------------------

      if (
        Number(
          redirect.header_code,
        ) !== 301
      ) {
        console.warn(
          `  ⚠ Not a 301 redirect. Skipping.`,
        )

        skipped++
        continue
      }

      // ------------------------------------------------------
      // DESTINATION
      // ------------------------------------------------------

      const destination =
        normalizeDestination(
          redirect.url_to,
        )

      // ------------------------------------------------------
      // PROCESS EACH SOURCE
      // ------------------------------------------------------

      for (
        const source of redirect.sources
      ) {
        // ----------------------------------------------------
        // IGNORE
        // ----------------------------------------------------

        if (source.ignore) {
          console.log(
            `  ↳ Ignored source: ${source.pattern}`,
          )

          skipped++
          continue
        }

        // ----------------------------------------------------
        // SOURCE VALIDATION
        // ----------------------------------------------------

        if (!source.pattern) {
          console.warn(
            '  ⚠ Source pattern is empty. Skipping.',
          )

          skipped++
          continue
        }

        // ----------------------------------------------------
        // NORMALIZE SOURCE
        // ----------------------------------------------------

        const from =
          normalizeSource(
            source.pattern,
          )

        if (!from) {
          console.warn(
            '  ⚠ Empty source after normalization. Skipping.',
          )

          skipped++
          continue
        }

        sourceCount++

        console.log(
          `  ↳ From: ${from}`,
        )

        console.log(
          `  ↳ To:   ${destination}`,
        )

        console.log(
          `  ↳ Type: 301`,
        )

        // ----------------------------------------------------
        // COMPARISON
        // ----------------------------------------------------

        if (
          source.comparison &&
          source.comparison !== 'exact'
        ) {
          console.warn(
            `  ⚠ Rank Math comparison: ${source.comparison}`,
          )

          console.warn(
            '    Payload stores "from" as a normal path.',
          )
        }

        // ----------------------------------------------------
        // PAYLOAD DATA
        // ----------------------------------------------------

        const data = {
          from,

          to: {
            type: 'custom' as const,
            url: destination,
          },

          type: '301' as const,
        }

        // ----------------------------------------------------
        // DUPLICATE CHECK
        // ----------------------------------------------------

        const existing =
          await findExistingRedirect(
            payload,
            from,
          )

        // ----------------------------------------------------
        // UPDATE
        // ----------------------------------------------------

        if (existing) {
          await payload.update({
            collection: 'redirects',

            id: Number(
              existing.id,
            ),

            data,
          })

          updated++

          console.log(
            `  ↳ Updated Payload Redirect ID: ${existing.id}`,
          )
        }

        // ----------------------------------------------------
        // CREATE
        // ----------------------------------------------------

        else {
          const createdRedirect =
            await payload.create({
              collection: 'redirects',

              data,
            })

          created++

          console.log(
            `  ↳ Created Payload Redirect ID: ${createdRedirect.id}`,
          )
        }
      }

      console.log('')

    } catch (error) {
      failed++

      console.error(
        `  ✗ Failed WP Redirect ID: ${redirect.id}`,
      )

      if (error instanceof Error) {
        console.error(
          error.message,
        )

        console.error(
          error.stack,
        )
      } else {
        console.dir(
          error,
          {
            depth: null,
          },
        )
      }

      console.log('')
    }
  }

  // ==========================================================
  // SUMMARY
  // ==========================================================

  console.log('')

  console.log(
    '========================================',
  )

  console.log(
    ' Redirect Migration Completed',
  )

  console.log(
    '========================================',
  )

  console.log(
    `Rank Math redirects : ${redirects.length}`,
  )

  console.log(
    `Sources processed   : ${sourceCount}`,
  )

  console.log(
    `Created             : ${created}`,
  )

  console.log(
    `Updated             : ${updated}`,
  )

  console.log(
    `Skipped             : ${skipped}`,
  )

  console.log(
    `Failed              : ${failed}`,
  )

  console.log(
    '========================================',
  )

  console.log('')

  if (failed === 0) {
    console.log(
      '✓ REDIRECT MIGRATION FINISHED',
    )
  } else {
    console.log(
      '⚠ MIGRATION FINISHED WITH FAILURES',
    )
  }

  console.log('')
}

// ============================================================
// RUN
// ============================================================

migrateRedirects().catch(
  (error) => {
    console.error('')

    console.error(
      '========================================',
    )

    console.error(
      ' Redirect Migration Failed',
    )

    console.error(
      '========================================',
    )

    console.error(error)

    console.error('')

    process.exit(1)
  },
)