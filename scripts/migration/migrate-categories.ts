import dotenv from 'dotenv'
import { getPayload } from 'payload'

dotenv.config({
  path: '.env',
})

const { default: config } = await import('../../src/payload.config')
/**
 * WordPress Category
 */
type WordPressCategory = {
  id: number
  count: number
  description: string
  link: string
  name: string
  slug: string
  taxonomy: string
  parent: number
}

/**
 * WordPress API response
 */
const WORDPRESS_API_URL =
  process.env.WORDPRESS_API_URL ||
  'https://staging.alloypress.com/wp-json/wp/v2'

/**
 * Fetch all WordPress categories
 *
 * WordPress REST API is paginated.
 */
async function fetchAllCategories(): Promise<WordPressCategory[]> {
  const categories: WordPressCategory[] = []

  let page = 1
  const perPage = 100

  while (true) {
    const url =
      `${WORDPRESS_API_URL}/categories` +
      `?per_page=${perPage}` +
      `&page=${page}`

    console.log(`Fetching categories page ${page}...`)

    const response = await fetch(url)

    if (response.status === 400) {
      // WordPress returns 400 when requested page does not exist.
      break
    }

    if (!response.ok) {
      throw new Error(
        `Failed to fetch categories. HTTP ${response.status} ${response.statusText}`,
      )
    }

    const data = (await response.json()) as WordPressCategory[]

    if (!Array.isArray(data) || data.length === 0) {
      break
    }

    categories.push(...data)

    const totalPages = Number(
      response.headers.get('X-WP-TotalPages') || page,
    )

    if (page >= totalPages) {
      break
    }

    page++
  }

  return categories
}

/**
 * Main migration
 */
export async function migrateCategories() {
  console.log('')
  console.log('========================================')
  console.log(' Starting Category Migration')
  console.log('========================================')
  console.log('')

  const payload = await getPayload({
    config,
  })

  // ----------------------------------------------------------
  // FETCH WORDPRESS CATEGORIES
  // ----------------------------------------------------------

  const categories = await fetchAllCategories()

  console.log(`Found ${categories.length} WordPress categories`)
  console.log('')

  if (categories.length === 0) {
    console.log('No categories found.')
    return
  }

  // ----------------------------------------------------------
  // SORT
  // ----------------------------------------------------------
  //
  // Parent categories should be processed before child
  // categories where possible.
  //
  // We still do parent assignment in a second pass, so this
  // sorting is mainly for predictable migration logs.
  // ----------------------------------------------------------

  const sortedCategories = [...categories].sort((a, b) => {
    if (a.parent === 0 && b.parent !== 0) {
      return -1
    }

    if (a.parent !== 0 && b.parent === 0) {
      return 1
    }

    return a.id - b.id
  })

  // ----------------------------------------------------------
  // WORDPRESS ID → PAYLOAD ID MAP
  // ----------------------------------------------------------
  //
  // IMPORTANT:
  //
  // Payload document IDs are numbers in our generated types.
  //
  // Therefore:
  //
  // Map<number, number>
  //
  // NOT:
  //
  // Map<number, string>
  //
  // ----------------------------------------------------------

  const wordpressToPayload = new Map<number, number>()

  // ----------------------------------------------------------
  // FIRST PASS
  // CREATE CATEGORIES WITHOUT PARENT
  // ----------------------------------------------------------

  console.log('----------------------------------------')
  console.log(' First Pass: Creating Categories')
  console.log('----------------------------------------')
  console.log('')

  for (const category of sortedCategories) {
    console.log(
      `Creating: ${category.name} (WP ID: ${category.id})`,
    )

    // --------------------------------------------------------
    // CHECK WHETHER CATEGORY ALREADY EXISTS
    // --------------------------------------------------------

    const existing = await payload.find({
      collection: 'categories',
      where: {
        'legacy.wordpressId': {
          equals: category.id,
        },
      },
      limit: 1,
    })

    let payloadCategoryId: number

    // --------------------------------------------------------
    // EXISTING CATEGORY
    // --------------------------------------------------------

    if (existing.docs.length > 0) {
      const existingCategory = existing.docs[0]

      payloadCategoryId = Number(existingCategory.id)

      console.log(
        `  ↳ Already exists. Payload ID: ${payloadCategoryId}`,
      )
    }

    // --------------------------------------------------------
    // CREATE NEW CATEGORY
    // --------------------------------------------------------

    else {
      const created = await payload.create({
        collection: 'categories',

        data: {
          name: category.name,
          slug: category.slug,
          description: category.description || '',

          // Parent is intentionally NOT assigned here.
          // We assign it in the second pass after every
          // category has a Payload ID.

          legacy: {
            wordpressId: category.id,
            wordpressSlug: category.slug,
          },
        },
      })

      payloadCategoryId = Number(created.id)

      console.log(
        `  ↳ Created. Payload ID: ${payloadCategoryId}`,
      )
    }

    // --------------------------------------------------------
    // STORE MAPPING
    // --------------------------------------------------------

    wordpressToPayload.set(
      category.id,
      payloadCategoryId,
    )
  }

  console.log('')
  console.log(
    `Created/found ${wordpressToPayload.size} categories.`,
  )
  console.log('')

  // ----------------------------------------------------------
  // SECOND PASS
  // ASSIGN PARENT RELATIONSHIPS
  // ----------------------------------------------------------

  console.log('----------------------------------------')
  console.log(' Second Pass: Assigning Parent Categories')
  console.log('----------------------------------------')
  console.log('')

  for (const category of sortedCategories) {
    // --------------------------------------------------------
    // ROOT CATEGORY
    // --------------------------------------------------------

    if (!category.parent || category.parent === 0) {
      console.log(
        `${category.name} → Root category`,
      )

      continue
    }

    // --------------------------------------------------------
    // CURRENT PAYLOAD CATEGORY
    // --------------------------------------------------------

    const payloadCategoryId =
      wordpressToPayload.get(category.id)

    if (!payloadCategoryId) {
      console.warn(
        `⚠ Payload category missing: WP ${category.id} (${category.name})`,
      )

      continue
    }

    // --------------------------------------------------------
    // PARENT PAYLOAD CATEGORY
    // --------------------------------------------------------

    const payloadParentId =
      wordpressToPayload.get(category.parent)

    if (!payloadParentId) {
      console.warn(
        `⚠ Parent category missing: ${category.name} → WP parent ${category.parent}`,
      )

      continue
    }

    // --------------------------------------------------------
    // UPDATE PARENT
    // --------------------------------------------------------

    await payload.update({
      collection: 'categories',

      id: payloadCategoryId,

      data: {
        parent: payloadParentId,
      },
    })

    console.log(
      `${category.name} → parent Payload ID ${payloadParentId}`,
    )
  }

  // ----------------------------------------------------------
  // FINAL SUMMARY
  // ----------------------------------------------------------

  console.log('')
  console.log('========================================')
  console.log(' Category Migration Completed')
  console.log('========================================')
  console.log(`Total categories: ${categories.length}`)
  console.log(`Mapped categories: ${wordpressToPayload.size}`)
  console.log('========================================')
  console.log('')
}

/**
 * Run migration directly
 */
migrateCategories()
  .catch((error) => {
    console.error('')
    console.error('========================================')
    console.error(' Category Migration Failed')
    console.error('========================================')
    console.error(error)
    console.error('')

    process.exit(1)
  })