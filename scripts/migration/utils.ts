import config from '../../src/payload.config'
import { getPayload } from 'payload'

const WORDPRESS_URL = process.env.WORDPRESS_URL

if (!WORDPRESS_URL) {
  throw new Error('WORDPRESS_URL is not configured')
}

let payloadInstance: Awaited<ReturnType<typeof getPayload>> | null = null

export async function getPayloadClient() {
  if (!payloadInstance) {
    payloadInstance = await getPayload({
      config,
    })
  }

  return payloadInstance
}

export async function fetchWordPress<T>(
  endpoint: string,
): Promise<T> {
  const url = `${WORDPRESS_URL}${endpoint}`

  console.log(`GET ${url}`)

  const response = await fetch(url)

  if (!response.ok) {
    const body = await response.text()

    throw new Error(
      `WordPress API failed: ${response.status} ${url}\n${body}`,
    )
  }

  return response.json() as Promise<T>
}

export async function fetchAllWordPress<T>(
  endpoint: string,
): Promise<T[]> {
  const perPage = 100
  let page = 1
  const results: T[] = []

  while (true) {
    const separator = endpoint.includes('?') ? '&' : '?'

    const url =
      `${WORDPRESS_URL}${endpoint}` +
      `${separator}per_page=${perPage}&page=${page}`

    console.log(`GET ${url}`)

    const response = await fetch(url)

    if (response.status === 400 && page > 1) {
      break
    }

    if (!response.ok) {
      const body = await response.text()

      throw new Error(
        `WordPress API failed: ${response.status} ${url}\n${body}`,
      )
    }

    const data = (await response.json()) as T[]

    results.push(...data)

    const totalPages = Number(
      response.headers.get('X-WP-TotalPages') || 1,
    )

    console.log(
      `  Page ${page}/${totalPages} → ${data.length} records`,
    )

    if (page >= totalPages) {
      break
    }

    page++
  }

  return results
}