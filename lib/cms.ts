// ============================================================
// AlloyPress — CMS Data Layer
// ============================================================

export type Media = {
  id?: string
  url?: string
  alt?: string
  width?: number
  height?: number
  filename?: string
  mimeType?: string
}

export type Author = {
  id?: string
  name?: string
  email?: string
}

export type Category = {
  id?: string
  name?: string
  title?: string
  slug?: string
}

export type Tag = {
  id?: string
  name?: string
  title?: string
  slug?: string
}

// ============================================================
// PAYLOAD / LEXICAL RICH TEXT TYPES
// ============================================================

export type RichTextNode = {
  type?: string
  tag?: string

  /**
   * Lexical text formatting flags:
   *
   * 1  = bold
   * 2  = italic
   * 4  = strikethrough
   * 8  = underline
   * 16 = inline code
   */
  format?: number | string

  text?: string

  /**
   * Used by lists.
   */
  listType?: string

  /**
   * Used by links and custom nodes.
   */
  url?: string

  fields?: Record<string, unknown>

  children?: RichTextNode[]
}

export type RichTextRoot = {
  type?: string
  format?: string
  indent?: number
  version?: number
  children: RichTextNode[]
}

export type RichTextContent = {
  root: RichTextRoot
}

// ============================================================
// POST TYPE
// ============================================================

export type Post = {
  id: string

  title?: string
  slug?: string
  excerpt?: string

  publishedAt?: string
  updatedAt?: string

  // ----------------------------------------------------------
  // Author
  // ----------------------------------------------------------

  author?: Author

  // ----------------------------------------------------------
  // Featured Image
  // ----------------------------------------------------------

  featuredImage?: Media

  // ----------------------------------------------------------
  // Main Lexical Content
  // ----------------------------------------------------------

  content?: RichTextContent

  // ----------------------------------------------------------
  // Category
  // ----------------------------------------------------------

  category?: Category

  // ----------------------------------------------------------
  // Tags
  // ----------------------------------------------------------

  tags?: Tag[]

  // ----------------------------------------------------------
  // Image Position
  // ----------------------------------------------------------

  imagePosition?:
    | 'left'
    | 'right'
    | 'full'

  // ----------------------------------------------------------
  // Workflow
  // ----------------------------------------------------------

  workflowStatus?:
    | 'draft'
    | 'review'
    | 'published'

  // Payload built-in status
  _status?: 'draft' | 'published'

  // ----------------------------------------------------------
  // SEO / Sitemap
  // ----------------------------------------------------------

  cornerstone?: boolean
  includeInSitemap?: boolean

  // ----------------------------------------------------------
  // Redirect
  // ----------------------------------------------------------

  redirectFrom?: string

  // ----------------------------------------------------------
  // Migration / Internal
  // ----------------------------------------------------------

  legacy?: {
    wordpressId?: number
  }
}

// ============================================================
// PAYLOAD API RESPONSE
// ============================================================

export type PayloadResponse<T> = {
  docs?: T[]

  totalDocs?: number
  limit?: number
  totalPages?: number
  page?: number
  pagingCounter?: number

  hasPrevPage?: boolean
  hasNextPage?: boolean

  prevPage?: number | null
  nextPage?: number | null
}

// ============================================================
// CMS URL
// ============================================================

function getCmsUrl(): string {
  return (
    process.env.NEXT_PUBLIC_CMS_URL ||
    'http://localhost:3000'
  )
}

// ============================================================
// GET POST BY SLUG
// ============================================================

export async function getPostBySlug(
  slug: string,
): Promise<Post | null> {
  const cmsUrl = getCmsUrl()

  const url = new URL(
    `${cmsUrl}/api/posts`,
  )

  // Payload slug query
  url.searchParams.set(
    'where[slug][equals]',
    slug,
  )

  // Resolve relationships
  url.searchParams.set(
    'depth',
    '2',
  )

  // Only one post is required
  url.searchParams.set(
    'limit',
    '1',
  )

  try {
    const response = await fetch(
      url.toString(),
      {
        // TEMPORARY DEBUG: bypasses the Next.js data cache entirely so we
        // can rule out stale cached responses while diagnosing the missing
        // image issue. Revert to the `next: { revalidate, tags }` version
        // below once confirmed.
        cache: 'no-store',

        // next: {
        //   revalidate: 60,
        //   tags: [`post:${slug}`],
        // },
      },
    )

    if (!response.ok) {
      console.error(
        `Failed to fetch post: ${response.status} ${response.statusText}`,
      )

      return null
    }

    const data =
      (await response.json()) as PayloadResponse<Post>

    return data.docs?.[0] ?? null
  } catch (error) {
    console.error(
      'Failed to fetch post by slug:',
      error,
    )

    return null
  }
}

// ============================================================
// GET POST BY ID
// ============================================================

export async function getPostById(
  id: string,
): Promise<Post | null> {
  const cmsUrl = getCmsUrl()

  try {
    const response = await fetch(
      `${cmsUrl}/api/posts/${encodeURIComponent(
        id,
      )}?depth=2`,
      {
        // TEMPORARY DEBUG: see note above.
        cache: 'no-store',

        // next: {
        //   revalidate: 60,
        //   tags: [`post:id:${id}`],
        // },
      },
    )

    if (!response.ok) {
      console.error(
        `Failed to fetch post ${id}: ${response.status} ${response.statusText}`,
      )

      return null
    }

    const data =
      (await response.json()) as Post

    return data ?? null
  } catch (error) {
    console.error(
      'Failed to fetch post by ID:',
      error,
    )

    return null
  }
}