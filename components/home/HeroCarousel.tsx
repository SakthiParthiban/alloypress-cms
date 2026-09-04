"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

type HeroCarouselPost = {
  id: number | string;
  title: string;
  slug: string;
  publishedAt?: string | null;
  imageUrl: string | null;
  imageAlt: string;
  imageWidth: number;
  imageHeight: number;
  formattedDate: string;
};

type Props = {
  posts: HeroCarouselPost[];
};

export default function HeroCarousel({ posts }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);

  const total = posts.length;

  useEffect(() => {
    if (total <= 1) return;

    const interval = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % total);
    }, 5000);

    return () => window.clearInterval(interval);
  }, [total]);

  if (!total) return null;

  return (
    <div
      className="hero-carousel"
      aria-roledescription="carousel"
      aria-label="Featured AlloyPress articles"
    >
      <div className="hero-carousel-stage">
        <div className="hero-carousel-viewport">
          <div
            className="hero-carousel-track"
            style={{
              transform: `translate3d(-${activeIndex * 100}%, 0, 0)`,
            }}
          >
            {posts.map((post, index) => (
              <article
                key={post.id}
                className="hero-carousel-slide"
                aria-hidden={index !== activeIndex}
                aria-roledescription="slide"
                aria-label={`${index + 1} of ${total}`}
              >
                <Link
                  href={`/blogs/${post.slug}`}
                  className="featured-card"
                  tabIndex={index === activeIndex ? 0 : -1}
                >
                  {post.imageUrl && (
                    <div className="featured-card-image">
                      <Image
                        src={post.imageUrl}
                        alt={post.imageAlt}
                        width={post.imageWidth}
                        height={post.imageHeight}
                        preload={index === 0}
                        loading={index === 0 ? "eager" : "lazy"}
                        sizes="(max-width: 900px) 100vw, (max-width: 1200px) 48vw, 560px"
                        className="featured-image"
                      />
                    </div>
                  )}

                  <div className="featured-card-body">
                    <h2>{post.title}</h2>

                    {post.formattedDate && (
                      <time
                        dateTime={post.publishedAt || undefined}
                        className="featured-card-date"
                      >
                        Published {post.formattedDate}
                      </time>
                    )}
                  </div>
                </Link>
              </article>
            ))}
          </div>
        </div>
      </div>

      {total > 1 && (
        <div
          className="hero-carousel-dots"
          role="tablist"
          aria-label="Featured article navigation"
        >
          {posts.map((post, index) => (
            <button
              key={post.id}
              type="button"
              className={`hero-carousel-dot ${
                index === activeIndex ? "is-active" : ""
              }`}
              onClick={() => setActiveIndex(index)}
              role="tab"
              aria-selected={index === activeIndex}
              aria-label={`Show featured article ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}