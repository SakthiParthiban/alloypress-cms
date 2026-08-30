import dotenv from 'dotenv'
import { getPayload } from 'payload'

dotenv.config({
  path: '.env',
})

const { default: config } = await import('../../src/payload.config')

type WordPressTag = {
  id: number
  count: number
  description: string
  link: string
  name: string
  slug: string
  taxonomy: string
}

const WORDPRESS_API_URL =
  process.env.WORDPRESS_API_URL ||
  'https://staging.alloypress.com/wp-json/wp/v2'

async function fetchAllTags(): Promise<WordPressTag[]> {
  const tags: WordPressTag[] = []

  let page = 1
  const perPage = 100

  while (true) {
    const url =
      `${WORDPRESS_API_URL}/tags` +
      `?per_page=${perPage}` +
      `&page=${page}`

    console.log(`Fetching tags page ${page}...`)

    const response = await fetch(url)

    if (response.status === 400) {
      break
    }

    if (!response.ok) {
      throw new Error(
        `Failed to fetch tags. HTTP ${response.status} ${response.statusText}`,
      )
    }

    const data = (await response.json()) as WordPressTag[]

    if (!Array.isArray(data) || data.length === 0) {
      break
    }

    tags.push(...data)

    const totalPages = Number(
      response.headers.get('X-WP-TotalPages') || page,
    )

    if (page >= totalPages) {
      break
    }

    page++
  }

  return tags
}

export async function migrateTags() {
  console.log('')
  console.log('========================================')
  console.log(' Starting Tag Migration')
  console.log('========================================')
  console.log('')

  const payload = await getPayload({
    config,
  })

  // ----------------------------------------------------------
  // FETCH WORDPRESS TAGS
  // ----------------------------------------------------------

  const tags = await fetchAllTags()

  console.log(`Found ${tags.length} WordPress tags`)
  console.log('')

  if (tags.length === 0) {
    console.log('No tags found.')
    return
  }

  // ----------------------------------------------------------
  // WORDPRESS ID → PAYLOAD ID MAP
  // ----------------------------------------------------------

  const wordpressToPayload = new Map<number, number>()

  // ----------------------------------------------------------
  // MIGRATE TAGS
  // ----------------------------------------------------------

  console.log('----------------------------------------')
  console.log(' Migrating Tags')
  console.log('----------------------------------------')
  console.log('')

  for (const tag of tags) {
    console.log(
      `Processing: ${tag.name} (WP ID: ${tag.id})`,
    )

    // --------------------------------------------------------
    // CHECK EXISTING TAG
    // --------------------------------------------------------

    const existing = await payload.find({
      collection: 'tags',
      where: {
        'legacy.wordpressId': {
          equals: tag.id,
        },
      },
      limit: 1,
    })

    let payloadTagId: number

    // --------------------------------------------------------
    // EXISTING TAG
    // --------------------------------------------------------

    if (existing.docs.length > 0) {
      const existingTag = existing.docs[0]

      payloadTagId = Number(existingTag.id)

      console.log(
        `  ↳ Already exists. Payload ID: ${payloadTagId}`,
      )
    }

    // --------------------------------------------------------
    // CREATE TAG
    // --------------------------------------------------------

    else {
      const created = await payload.create({
        collection: 'tags',

        data: {
          name: tag.name,
          slug: tag.slug,
          description: tag.description || '',

          legacy: {
            wordpressId: tag.id,
          },
        },
      })

      payloadTagId = Number(created.id)

      console.log(
        `  ↳ Created. Payload ID: ${payloadTagId}`,
      )
    }

    // --------------------------------------------------------
    // STORE WORDPRESS → PAYLOAD MAPPING
    // --------------------------------------------------------

    wordpressToPayload.set(
      tag.id,
      payloadTagId,
    )
  }

  // ----------------------------------------------------------
  // FINAL SUMMARY
  // ----------------------------------------------------------

  console.log('')
  console.log('========================================')
  console.log(' Tag Migration Completed')
  console.log('========================================')
  console.log(`Total tags: ${tags.length}`)
  console.log(`Mapped tags: ${wordpressToPayload.size}`)
  console.log('========================================')
  console.log('')
}

// ------------------------------------------------------------
// RUN MIGRATION
// ------------------------------------------------------------

migrateTags()
  .catch((error) => {
    console.error('')
    console.error('========================================')
    console.error(' Tag Migration Failed')
    console.error('========================================')
    console.error(error)
    console.error('')

    process.exit(1)
  })