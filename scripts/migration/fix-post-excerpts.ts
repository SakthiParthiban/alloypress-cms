import dotenv from 'dotenv'
import fs from 'node:fs'
import path from 'node:path'
import { getPayload } from 'payload'

// ============================================================
// ENV
// ============================================================

dotenv.config({
  path: '.env',
})

const { default: configPromise } = await import(
  '../../src/payload.config'
)

const config = await configPromise

// ============================================================
// LOAD RANKMATH MAPPING
// ============================================================
//
// This file is generated from the old WordPress SQL dump by
// extract_rankmath.py. It maps WordPress post_id -> the real,
// human-written RankMath SEO description, which is what the old
// WordPress site actually displayed as the article excerpt.
//
// Native WP `excerpt.rendered` was empty/auto-generated for most
// posts (hence the migrated "[...]" truncated excerpt bug) — the
// real excerpt only ever lived in postmeta as `rank_math_description`,
// which the REST API never exposes.
// ============================================================

const MAPPING_PATH = path.resolve(
  process.cwd(),
  'scripts/migration/data/rankmath-excerpts.json',
)

function loadMapping(): Record<string, string> {
  if (!fs.existsSync(MAPPING_PATH)) {
    throw new Error(
      `Mapping file not found at ${MAPPING_PATH}. ` +
      'Place rankmath-excerpts.json there (generated from the WP SQL dump) before running this script.',
    )
  }

  const raw = fs.readFileSync(MAPPING_PATH, 'utf8')
  return JSON.parse(raw)
}

// ============================================================
// PAGINATED FIND HELPER (mirrors migratePosts.ts)
// ============================================================

async function fetchAllPosts(payload: any): Promise<any[]> {
  const docs: any[] = []
  let page = 1

  while (true) {
    const result = await payload.find({
      collection: 'posts',
      limit: 200,
      page,
      pagination: true,
      depth: 0,
    })

    docs.push(...(result.docs || []))

    if (!result.hasNextPage) {
      break
    }

    page++
  }

  return docs
}

// ============================================================
// RUN
// ============================================================

async function fixExcerpts() {
  console.log('')
  console.log('========================================')
  console.log(' Fixing Post Excerpts (RankMath source)')
  console.log('========================================')
  console.log('')

  const mapping = loadMapping()
  console.log(`Loaded ${Object.keys(mapping).length} RankMath descriptions from dump.`)

  const payload = await getPayload({ config })

  const posts = await fetchAllPosts(payload)
  console.log(`Found ${posts.length} posts in Payload.`)
  console.log('')

  let updated = 0
  let skippedNoWpId = 0
  let skippedNoMapping = 0
  let skippedAlreadyCorrect = 0
  let failed = 0

  for (const post of posts) {
    const wordpressId = post?.legacy?.wordpressId

    if (!wordpressId) {
      skippedNoWpId++
      continue
    }

    const correctExcerpt = mapping[String(wordpressId)]

    if (!correctExcerpt) {
      skippedNoMapping++
      console.warn(`  ⚠ No RankMath description for WP ID ${wordpressId} (post: "${post.title}")`)
      continue
    }

    if (post.excerpt === correctExcerpt) {
      skippedAlreadyCorrect++
      continue
    }

    try {
      await payload.update({
        collection: 'posts',
        id: Number(post.id),
        data: {
          excerpt: correctExcerpt,
        },
      } as any)

      updated++
      console.log(`  ✓ Updated "${post.title}" (WP ID ${wordpressId})`)
    } catch (error) {
      failed++
      console.error(`  ✗ Failed to update "${post.title}" (WP ID ${wordpressId}):`, error)
    }
  }

  console.log('')
  console.log('========================================')
  console.log(' Excerpt Fix Completed')
  console.log('========================================')
  console.log(`Updated: ${updated}`)
  console.log(`Already correct: ${skippedAlreadyCorrect}`)
  console.log(`Skipped (no legacy.wordpressId): ${skippedNoWpId}`)
  console.log(`Skipped (no RankMath mapping found): ${skippedNoMapping}`)
  console.log(`Failed: ${failed}`)
  console.log('========================================')
  console.log('')

  process.exit(0)
}

fixExcerpts().catch((error) => {
  console.error('')
  console.error('========================================')
  console.error(' Excerpt Fix Failed')
  console.error('========================================')
  console.error(error)
  console.error('')
  process.exit(1)
})