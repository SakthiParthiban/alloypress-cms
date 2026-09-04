"use client";

import Image from "next/image";
import Link from "next/link";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

type ReviewCard = {
  id: number | string;
  title: string;
  slug: string;
  excerpt: string;
  publishedAt: string;
  author: string;
  image: string | null;
  imageAlt: string;
};

type Props = {
  cards: ReviewCard[];
};

const AUTO_PLAY_DELAY = 4500;

export default function AIToolReviewsCarousel({
  cards,
}: Props) {
  const trackRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<
    typeof setInterval
  > | null>(null);

  const [activeIndex, setActiveIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const dragStartX = useRef(0);
  const dragStartScroll = useRef(0);

  const total = cards.length;

  const scrollToCard = useCallback(
    (index: number, smooth = true) => {
      const track = trackRef.current;

      if (!track || !total) return;

      const firstCard = track.querySelector(
        ".ai-review-card"
      ) as HTMLElement | null;

      if (!firstCard) return;

      const gap = 16;

      const cardWidth =
        firstCard.getBoundingClientRect().width;

      track.scrollTo({
        left: (cardWidth + gap) * index,
        behavior: smooth ? "smooth" : "auto",
      });
    },
    [total]
  );

  const startAutoPlay = useCallback(() => {
    if (timerRef.current || total <= 1) return;

    timerRef.current = setInterval(() => {
      setActiveIndex((current) => {
        const next =
          current + 1 >= total ? 0 : current + 1;

        scrollToCard(next);

        return next;
      });
    }, AUTO_PLAY_DELAY);
  }, [scrollToCard, total]);

  const stopAutoPlay = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const restartAutoPlay = useCallback(() => {
    stopAutoPlay();

    window.setTimeout(() => {
      startAutoPlay();
    }, 1500);
  }, [startAutoPlay, stopAutoPlay]);

  useEffect(() => {
    startAutoPlay();

    return () => {
      stopAutoPlay();
    };
  }, [startAutoPlay, stopAutoPlay]);

  const handleScroll = () => {
    const track = trackRef.current;

    if (!track) return;

    const firstCard = track.querySelector(
      ".ai-review-card"
    ) as HTMLElement | null;

    if (!firstCard) return;

    const cardWidth =
      firstCard.getBoundingClientRect().width + 16;

    const index = Math.round(
      track.scrollLeft / cardWidth
    );

    if (index >= 0 && index < total) {
      setActiveIndex(index);
    }
  };

  const handlePointerDown = (
    event: React.PointerEvent<HTMLDivElement>
  ) => {
    const track = trackRef.current;

    if (!track) return;

    setIsDragging(true);
    stopAutoPlay();

    dragStartX.current = event.clientX;
    dragStartScroll.current = track.scrollLeft;

    track.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (
    event: React.PointerEvent<HTMLDivElement>
  ) => {
    if (!isDragging) return;

    const track = trackRef.current;

    if (!track) return;

    const distance =
      event.clientX - dragStartX.current;

    track.scrollLeft =
      dragStartScroll.current - distance;
  };

  const handlePointerUp = () => {
    setIsDragging(false);

    restartAutoPlay();
  };

  const handlePointerCancel = () => {
    setIsDragging(false);

    restartAutoPlay();
  };

  const handleDotClick = (index: number) => {
    scrollToCard(index);

    setActiveIndex(index);

    restartAutoPlay();
  };

  return (
    <div className="ai-reviews-carousel">
      <div
        ref={trackRef}
        className={`ai-reviews-track ${
          isDragging ? "is-dragging" : ""
        }`}
        onScroll={handleScroll}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
      >
        {cards.map((card, index) => (
          <article
            className="ai-review-card"
            key={card.id}
          >
            <Link
              href={`/reviews/${card.slug}`}
              className="ai-review-card-link"
              aria-label={`Read review: ${card.title}`}
            >
              <div className="ai-review-image">
                {card.image ? (
                  <Image
                    src={card.image}
                    alt={card.imageAlt}
                    fill
                    sizes="(max-width: 700px) 88vw, (max-width: 1000px) 47vw, 31vw"
                    loading={index < 3 ? "eager" : "lazy"}
                  />
                ) : (
                  <div
                    className="ai-review-image-placeholder"
                    aria-hidden="true"
                  />
                )}
              </div>

              <div className="ai-review-content">
                <div className="ai-review-meta">
                  <span>REVIEWS</span>

                  {card.publishedAt && (
                    <time>{card.publishedAt}</time>
                  )}
                </div>

                <h3>{card.title}</h3>

                {card.excerpt && (
                  <p>{card.excerpt}</p>
                )}

                <div className="ai-review-footer">
                  <span>
                    {card.author || "AlloyPress Team"}
                  </span>

                  <span
                    className="ai-review-arrow"
                    aria-hidden="true"
                  >
                    →
                  </span>
                </div>
              </div>
            </Link>
          </article>
        ))}
      </div>

      {total > 1 && (
        <div
          className="ai-reviews-dots"
          aria-label="Review carousel navigation"
        >
          {cards.map((card, index) => (
            <button
              key={card.id}
              type="button"
              className={`ai-review-dot ${
                activeIndex === index
                  ? "is-active"
                  : ""
              }`}
              aria-label={`Go to review ${index + 1}`}
              aria-current={
                activeIndex === index
                  ? "true"
                  : undefined
              }
              onClick={() => handleDotClick(index)}
            />
          ))}
        </div>
      )}
    </div>
  );
}