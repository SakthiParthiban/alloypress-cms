export type PostSchemaInput = {
  title?: string
  excerpt?: string
  slug?: string
  publishedAt?: string
  updatedAt?: string
  author?: {
    name?: string
  }
  featuredImage?: {
    url?: string
  }
}

export function generatePostSchema(
  post: PostSchemaInput,
  siteUrl: string,
) {
  const url = `${siteUrl}/blogs/${post.slug ?? ''}`

  return {
    '@context': 'https://schema.org',
    '@type': 'Article',

    headline: post.title ?? '',

    description: post.excerpt ?? '',

    url,

    ...(post.publishedAt && {
      datePublished: post.publishedAt,
    }),

    ...(post.updatedAt && {
      dateModified: post.updatedAt,
    }),

    ...(post.author?.name && {
      author: {
        '@type': 'Person',
        name: post.author.name,
      },
    }),

    ...(post.featuredImage?.url && {
      image: [post.featuredImage.url],
    }),
  }
}