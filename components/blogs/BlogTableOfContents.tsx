'use client'

import { useState } from 'react'

export type BlogHeading = {
  id: string
  text: string
  level: number
}

type BlogTableOfContentsProps = {
  items: BlogHeading[]
}

export default function BlogTableOfContents({
  items,
}: BlogTableOfContentsProps) {
  const [open, setOpen] =
    useState(true)

  if (!items.length) {
    return null
  }

  return (
    <aside className="blog-toc">
      <div className="blog-toc-inner">

        <button
          type="button"
          className="blog-toc-heading"
          onClick={() =>
            setOpen((value) => !value)
          }
          aria-expanded={open}
        >
          <span>
            Table of Contents
          </span>

          <span
            className={
              open
                ? 'blog-toc-icon is-open'
                : 'blog-toc-icon'
            }
          >
            +
          </span>
        </button>

        {open && (
          <nav
            aria-label="Table of contents"
            className="blog-toc-list"
          >
            {items.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className={
                  item.level > 2
                    ? 'blog-toc-child'
                    : ''
                }
              >
                {item.text}
              </a>
            ))}
          </nav>
        )}
      </div>
    </aside>
  )
}