import type {
  RichTextContent,
  RichTextNode,
} from '@/lib/cms'

export type BlogHeading = {
  id: string
  text: string
  level: number
}

function getNodeText(
  node: RichTextNode,
): string {
  if (node.type === 'text') {
    return node.text || ''
  }

  if (
    !Array.isArray(node.children)
  ) {
    return ''
  }

  return node.children
    .map(getNodeText)
    .join('')
}

function slugify(
  value: string,
): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

export function getBlogHeadings(
  content?: RichTextContent,
): BlogHeading[] {
  if (
    !content?.root ||
    !Array.isArray(
      content.root.children,
    )
  ) {
    return []
  }

  const headings: BlogHeading[] = []
  const usedIds = new Map<
    string,
    number
  >()

  function walk(
    nodes: RichTextNode[],
  ) {
    for (const node of nodes) {
      if (
        node.type === 'heading'
      ) {
        const tag =
          typeof node.tag === 'string'
            ? node.tag
            : ''

        const level =
          Number(
            tag.replace('h', ''),
          ) || 2

        const text =
          getNodeText(node).trim()

        if (text) {
          const baseId =
            slugify(text) ||
            `heading-${headings.length + 1}`

          const count =
            usedIds.get(baseId) || 0

          usedIds.set(
            baseId,
            count + 1,
          )

          const id =
            count === 0
              ? baseId
              : `${baseId}-${count + 1}`

          headings.push({
            id,
            text,
            level,
          })
        }
      }

      if (
        Array.isArray(node.children)
      ) {
        walk(node.children)
      }
    }
  }

  walk(
    content.root.children,
  )

  return headings
}