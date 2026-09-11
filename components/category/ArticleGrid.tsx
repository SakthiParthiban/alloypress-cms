"use client";

import { Children, ReactNode, useState } from "react";

const INITIAL_ITEMS = 6;
const LOAD_MORE_ITEMS = 6;

type ArticleGridProps = {
  children: ReactNode;
};

export default function ArticleGrid({
  children,
}: ArticleGridProps) {
  const [visibleCount, setVisibleCount] =
    useState(INITIAL_ITEMS);

  const articles = Children.toArray(children);

  const visibleArticles = articles.slice(
    0,
    visibleCount
  );

  const hasMore =
    visibleCount < articles.length;

  return (
    <>
      <div className="article-grid">
        {visibleArticles}
      </div>

      {hasMore && (
        <div className="load-more-wrap">
          <button
            type="button"
            className="load-more-button"
            onClick={() =>
              setVisibleCount(
                (current) =>
                  current + LOAD_MORE_ITEMS
              )
            }
          >
            <span>Load More</span>
            <span aria-hidden="true">↓</span>
          </button>
        </div>
      )}
    </>
  );
}