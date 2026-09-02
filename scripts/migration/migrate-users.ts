import dotenv from 'dotenv'
import crypto from 'crypto'
import { getPayload } from 'payload'

// ============================================================
// ENV
// ============================================================

dotenv.config({
  path: '.env',
})

// IMPORTANT:
// Load Payload config only after .env is loaded.
const { default: config } = await import('../../src/payload.config.js')

// ============================================================
// TYPES
// ============================================================

type WordPressUser = {
  id: number
  name: string
  url: string
  description: string
  link: string
  slug: string
  avatar_urls?: {
    24?: string
    48?: string
    96?: string
  }
  meta?: Record<string, unknown>
  _links?: Record<string, unknown>
}

// ============================================================
// CONFIG
// ============================================================

const WORDPRESS_API_URL =
  process.env.WORDPRESS_API_URL ||
  'https://staging1.alloypress.com/wp-json/wp/v2'

const USERS_ENDPOINT = `${WORDPRESS_API_URL}/users`

// ============================================================
// FETCH ALL WORDPRESS USERS
// ============================================================

async function fetchAllUsers(): Promise<WordPressUser[]> {
  const users: WordPressUser[] = []

  let page = 1
  const perPage = 100

  while (true) {
    const url =
      `${USERS_ENDPOINT}` +
      `?per_page=${perPage}` +
      `&page=${page}`

    console.log(`Fetching WordPress users page ${page}...`)

    const response = await fetch(url)

    // WordPress returns 400 when requested page
    // does not exist.
    if (response.status === 400) {
      break
    }

    if (!response.ok) {
      throw new Error(
        `Failed to fetch WordPress users. ` +
          `HTTP ${response.status} ${response.statusText}`,
      )
    }

    const data = (await response.json()) as WordPressUser[]

    if (!Array.isArray(data) || data.length === 0) {
      break
    }

    users.push(...data)

    const totalPages = Number(
      response.headers.get('X-WP-TotalPages') || page,
    )

    if (page >= totalPages) {
      break
    }

    page++
  }

  return users
}

// ============================================================
// GENERATE MIGRATION PASSWORD
// ============================================================
//
// WordPress REST API does NOT expose the original password.
// Therefore we generate a temporary password.
//
// This password should NOT be considered the user's final
// login password.
//

function generateMigrationPassword(): string {
  return crypto.randomBytes(24).toString('base64url')
}

// ============================================================
// NORMALIZE USERNAME
// ============================================================

function normalizeUsername(
  user: WordPressUser,
): string {
  const username = user.slug?.trim()

  if (username) {
    return username
  }

  return `wp-user-${user.id}`
}

// ============================================================
// MAIN MIGRATION
// ============================================================

export async function migrateUsers(): Promise<void> {
  console.log('')
  console.log('========================================')
  console.log(' Starting User Migration')
  console.log('========================================')
  console.log('')

  // ==========================================================
  // INITIALIZE PAYLOAD
  // ==========================================================

  const payload = await getPayload({
    config,
  })

  // ==========================================================
  // FETCH WORDPRESS USERS
  // ==========================================================

  const users = await fetchAllUsers()

  console.log('')
  console.log(`Found ${users.length} WordPress users`)
  console.log('')

  if (users.length === 0) {
    console.log('No WordPress users found.')
    return
  }

  // ==========================================================
  // COUNTERS
  // ==========================================================

  let created = 0
  let updated = 0
  let skipped = 0
  let failed = 0

  // ==========================================================
  // WORDPRESS ID → PAYLOAD ID MAP
  // ==========================================================

  const wordpressToPayload = new Map<number, number>()

  // ==========================================================
  // MIGRATE USERS ONE BY ONE
  // ==========================================================

  for (let index = 0; index < users.length; index++) {
    const user = users[index]

    console.log(
      `[${index + 1}/${users.length}] ` +
        `${user.name} (WP ID: ${user.id})`,
    )

    try {
      // ======================================================
      // CHECK EXISTING USER BY WORDPRESS ID
      // ======================================================

      const existingByWordPressId = await payload.find({
        collection: 'users',

        where: {
          'legacy.wordpressId': {
            equals: user.id,
          },
        },

        limit: 1,
      })

      // ======================================================
      // EXISTING USER
      // ======================================================

      if (existingByWordPressId.docs.length > 0) {
        const existingUser = existingByWordPressId.docs[0]

        const payloadUserId = Number(existingUser.id)

        wordpressToPayload.set(
          user.id,
          payloadUserId,
        )

        console.log(
          `  ↳ Already exists. Payload ID: ${payloadUserId}`,
        )

        skipped++

        continue
      }

      // ======================================================
      // CHECK EXISTING USER BY EMAIL
      // ======================================================
      //
      // WordPress users endpoint response does not provide
      // email because of WordPress privacy restrictions.
      //
      // Therefore we do NOT try to match by email here.
      //

      // ======================================================
      // USERNAME
      // ======================================================

      const username = normalizeUsername(user)

      // ======================================================
      // EMAIL
      // ======================================================
      //
      // WordPress public users API does not provide email.
      //
      // Payload auth requires an email.
      //
      // Therefore we create a migration-only email.
      //
      // This prevents us from inventing or exposing a real
      // WordPress email address.
      //

      const email =
        `wp-${user.id}-${username
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')}` +
        `@migration.alloypress.local`

      // ======================================================
      // PASSWORD
      // ======================================================

      const password =
        process.env.MIGRATION_DEFAULT_PASSWORD ||
        generateMigrationPassword()

      // ======================================================
      // CREATE PAYLOAD USER
      // ======================================================

      const createdUser = await payload.create({
        collection: 'users',

        data: {
          email,
          password,

          displayName: user.name || username,

          username,

          website: user.url || '',

          bio: user.description || '',

          // WordPress API response supplied to us does not
          // contain the original role.
          //
          // Keep a safe default.
          role: 'viewer',

          legacy: {
            wordpressId: user.id,

            wordpressUsername: username,

            wordpressRole: 'not-provided-by-wordpress-api',
          },
        },

        draft: false,
      })

      const payloadUserId = Number(createdUser.id)

      wordpressToPayload.set(
        user.id,
        payloadUserId,
      )

      created++

      console.log(
        `  ↳ Created Payload user ID: ${payloadUserId}`,
      )

      console.log(
        `  ↳ Username: ${username}`,
      )

      console.log(
        `  ↳ Migration email: ${email}`,
      )
    } catch (error) {
      failed++

      console.error(
        `  ✗ Failed: ${user.name}`,
      )

      console.error(
        `    WP User ID: ${user.id}`,
      )

      console.error(
        `    Error: ${
          error instanceof Error
            ? error.message
            : String(error)
        }`,
      )
    }
  }

  // ==========================================================
  // FINAL SUMMARY
  // ==========================================================

  console.log('')
  console.log('========================================')
  console.log(' User Migration Completed')
  console.log('========================================')
  console.log(`Total WordPress users: ${users.length}`)
  console.log(`Created: ${created}`)
  console.log(`Skipped / already exists: ${skipped}`)
  console.log(`Updated: ${updated}`)
  console.log(`Failed: ${failed}`)
  console.log(
    `Mapped users: ${wordpressToPayload.size}`,
  )
  console.log('========================================')
  console.log('')
}

// ============================================================
// RUN MIGRATION
// ============================================================

migrateUsers()
  .catch((error) => {
    console.error('')
    console.error('========================================')
    console.error(' User Migration Failed')
    console.error('========================================')
    console.error(error)
    console.error('')

    process.exit(1)
  })