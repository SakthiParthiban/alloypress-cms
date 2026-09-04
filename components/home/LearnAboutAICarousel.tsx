"use client";

import Image from "next/image";
import Link from "next/link";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import type { PointerEvent } from "react";

type LearnCard = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  date: string;
  author: string;
  image: string | null;
  category: string;
};

type Props = {
  cards: LearnCard[];
};

const AUTO_PLAY_DELAY = 4500;

export default function LearnAboutAICarousel({
  cards,
}: Props) {
  const trackRef =
    useRef<HTMLDivElement>(null);

  const autoPlayRef =
    useRef<ReturnType<typeof setInterval> | null>(
      null
    );

  const resumeTimerRef =
    useRef<ReturnType<typeof setTimeout> | null>(
      null
    );

  const isDraggingRef =
    useRef(false);

  const dragStartXRef =
    useRef(0);

  const dragStartScrollRef =
    useRef(0);

  const [activeIndex, setActiveIndex] =
    useState(0);

  const [isReady, setIsReady] =
    useState(false);

  /*
   * -------------------------------------------------------
   * IMPORTANT
   *
   * We render:
   *
   * 1 2 3 4
   * 1 2 3 4
   * 1 2 3 4
   *
   * and keep the user in the middle copy.
   *
   * This makes forward + backward looping possible.
   * -------------------------------------------------------
   */

  const loopCards = [
    ...cards,
    ...cards,
    ...cards,
  ];

  /*
   * -------------------------------------------------------
   * GET CARD STEP
   * -------------------------------------------------------
   */

  const getCardStep =
    useCallback(() => {
      const track =
        trackRef.current;

      if (!track) {
        return 0;
      }

      const card =
        track.querySelector<HTMLElement>(
          ".learn-ai-card"
        );

      if (!card) {
        return 0;
      }

      const styles =
        window.getComputedStyle(track);

      const gap =
        parseFloat(styles.columnGap) ||
        parseFloat(styles.gap) ||
        0;

      return card.offsetWidth + gap;
    }, []);

  /*
   * -------------------------------------------------------
   * GET ORIGINAL LOOP WIDTH
   * -------------------------------------------------------
   */

  const getLoopWidth =
    useCallback(() => {
      const step =
        getCardStep();

      return step * cards.length;
    }, [
      cards.length,
      getCardStep,
    ]);

  /*
   * -------------------------------------------------------
   * GET REAL INDEX
   * -------------------------------------------------------
   */

  const updateActiveIndex =
    useCallback(() => {
      const track =
        trackRef.current;

      const step =
        getCardStep();

      if (
        !track ||
        !step ||
        !cards.length
      ) {
        return;
      }

      const loopWidth =
        getLoopWidth();

      /*
       * Current position relative
       * to the middle copy.
       */
      const relativePosition =
        track.scrollLeft -
        loopWidth;

      const rawIndex =
        Math.round(
          relativePosition /
            step
        );

      const realIndex =
        ((rawIndex %
          cards.length) +
          cards.length) %
        cards.length;

      setActiveIndex(
        realIndex
      );
    }, [
      cards.length,
      getCardStep,
      getLoopWidth,
    ]);

  /*
   * -------------------------------------------------------
   * NORMALIZE INFINITE POSITION
   * -------------------------------------------------------
   */

  const normalizeLoop =
    useCallback(() => {
      const track =
        trackRef.current;

      if (!track || !cards.length) {
        return;
      }

      const loopWidth =
        getLoopWidth();

      if (!loopWidth) {
        return;
      }

      /*
       * Middle copy starts at:
       *
       * 1 × loopWidth
       *
       * If we reach:
       *
       * 2 × loopWidth
       *
       * move silently back by
       * one loop.
       */

      if (
        track.scrollLeft >=
        loopWidth * 2
      ) {
        track.scrollLeft =
          track.scrollLeft -
          loopWidth;
      }

      /*
       * Backward loop.
       *
       * If user reaches the first
       * copy, move to the middle.
       */

      if (
        track.scrollLeft <= 0
      ) {
        track.scrollLeft =
          track.scrollLeft +
          loopWidth;
      }

      updateActiveIndex();
    }, [
      cards.length,
      getLoopWidth,
      updateActiveIndex,
    ]);

  /*
   * -------------------------------------------------------
   * INITIALIZE MIDDLE COPY
   * -------------------------------------------------------
   */

  const initializeCarousel =
    useCallback(() => {
      const track =
        trackRef.current;

      if (!track || !cards.length) {
        return;
      }

      const loopWidth =
        getLoopWidth();

      if (!loopWidth) {
        return;
      }

      /*
       * Start from the middle copy.
       */

      track.scrollLeft =
        loopWidth;

      setActiveIndex(0);

      setIsReady(true);
    }, [
      cards.length,
      getLoopWidth,
    ]);

  /*
   * -------------------------------------------------------
   * SCROLL TO REAL CARD
   * -------------------------------------------------------
   */

  const scrollToCard =
    useCallback(
      (
        index: number,
        smooth = true
      ) => {
        const track =
          trackRef.current;

        if (
          !track ||
          !cards.length
        ) {
          return;
        }

        const step =
          getCardStep();

        const loopWidth =
          getLoopWidth();

        if (
          !step ||
          !loopWidth
        ) {
          return;
        }

        /*
         * Always target the
         * middle copy.
         */

        const safeIndex =
          ((index %
            cards.length) +
            cards.length) %
          cards.length;

        const target =
          loopWidth +
          safeIndex * step;

        track.scrollTo({
          left: target,
          behavior: smooth
            ? "smooth"
            : "auto",
        });

        setActiveIndex(
          safeIndex
        );
      },
      [
        cards.length,
        getCardStep,
        getLoopWidth,
      ]
    );

  /*
   * -------------------------------------------------------
   * MOVE ONE CARD FORWARD
   * -------------------------------------------------------
   */

  const nextCard =
    useCallback(() => {
      const track =
        trackRef.current;

      const step =
        getCardStep();

      if (
        !track ||
        !step
      ) {
        return;
      }

      track.scrollBy({
        left: step,
        behavior: "smooth",
      });
    }, [getCardStep]);

  /*
   * -------------------------------------------------------
   * MOVE ONE CARD BACKWARD
   * -------------------------------------------------------
   */

  const previousCard =
    useCallback(() => {
      const track =
        trackRef.current;

      const step =
        getCardStep();

      if (
        !track ||
        !step
      ) {
        return;
      }

      track.scrollBy({
        left: -step,
        behavior: "smooth",
      });
    }, [getCardStep]);

  /*
   * -------------------------------------------------------
   * PAUSE AUTOPLAY
   * -------------------------------------------------------
   */

  const pauseAutoPlay =
    useCallback(() => {
      if (
        autoPlayRef.current
      ) {
        clearInterval(
          autoPlayRef.current
        );

        autoPlayRef.current =
          null;
      }
    }, []);

  /*
   * -------------------------------------------------------
   * RESUME AUTOPLAY
   * -------------------------------------------------------
   */

  const resumeAutoPlay =
    useCallback(() => {
      if (
        resumeTimerRef.current
      ) {
        clearTimeout(
          resumeTimerRef.current
        );
      }

      resumeTimerRef.current =
        setTimeout(() => {
          startAutoPlay();
        }, 1800);
    }, []);

  /*
   * -------------------------------------------------------
   * START AUTOPLAY
   * -------------------------------------------------------
   */

  const startAutoPlay =
    useCallback(() => {
      if (
        cards.length <= 1
      ) {
        return;
      }

      if (
        autoPlayRef.current
      ) {
        clearInterval(
          autoPlayRef.current
        );
      }

      autoPlayRef.current =
        setInterval(() => {
          if (
            isDraggingRef.current
          ) {
            return;
          }

          nextCard();
        }, AUTO_PLAY_DELAY);
    }, [
      cards.length,
      nextCard,
    ]);

  /*
   * -------------------------------------------------------
   * INITIAL SETUP
   * -------------------------------------------------------
   */

  useEffect(() => {
    if (!cards.length) {
      return;
    }

    const timer =
      window.setTimeout(() => {
        initializeCarousel();
        startAutoPlay();
      }, 80);

    return () => {
      window.clearTimeout(
        timer
      );

      pauseAutoPlay();

      if (
        resumeTimerRef.current
      ) {
        clearTimeout(
          resumeTimerRef.current
        );
      }
    };
  }, [
    cards.length,
    initializeCarousel,
    startAutoPlay,
    pauseAutoPlay,
  ]);

  /*
   * -------------------------------------------------------
   * RESIZE
   * -------------------------------------------------------
   */

  useEffect(() => {
    const handleResize =
      () => {
        if (!isReady) {
          return;
        }

        initializeCarousel();
      };

    window.addEventListener(
      "resize",
      handleResize
    );

    return () => {
      window.removeEventListener(
        "resize",
        handleResize
      );
    };
  }, [
    initializeCarousel,
    isReady,
  ]);

  /*
   * -------------------------------------------------------
   * POINTER DOWN
   * -------------------------------------------------------
   */

  const handlePointerDown =
    (
      event: PointerEvent<HTMLDivElement>
    ) => {
      const track =
        trackRef.current;

      if (!track) {
        return;
      }

      isDraggingRef.current =
        true;

      dragStartXRef.current =
        event.clientX;

      dragStartScrollRef.current =
        track.scrollLeft;

      pauseAutoPlay();

      track.setPointerCapture(
        event.pointerId
      );
    };

  /*
   * -------------------------------------------------------
   * POINTER MOVE
   * -------------------------------------------------------
   */

  const handlePointerMove =
    (
      event: PointerEvent<HTMLDivElement>
    ) => {
      const track =
        trackRef.current;

      if (
        !track ||
        !isDraggingRef.current
      ) {
        return;
      }

      const distance =
        event.clientX -
        dragStartXRef.current;

      track.scrollLeft =
        dragStartScrollRef.current -
        distance;
    };

  /*
   * -------------------------------------------------------
   * POINTER UP
   * -------------------------------------------------------
   */

  const handlePointerUp =
    () => {
      const track =
        trackRef.current;

      isDraggingRef.current =
        false;

      if (track) {
        const step =
          getCardStep();

        if (step) {
          const nearestIndex =
            Math.round(
              track.scrollLeft /
                step
            );

          track.scrollTo({
            left:
              nearestIndex *
              step,
            behavior: "smooth",
          });
        }
      }

      updateActiveIndex();

      resumeAutoPlay();
    };

  /*
   * -------------------------------------------------------
   * SCROLL
   * -------------------------------------------------------
   */

  const handleScroll =
    () => {
      if (
        isDraggingRef.current
      ) {
        return;
      }

      normalizeLoop();
    };

  /*
   * -------------------------------------------------------
   * EMPTY STATE
   * -------------------------------------------------------
   */

  if (!cards.length) {
    return null;
  }

  return (
    <div className="learn-ai-carousel">

      {/* =================================================
          TRACK
      ================================================= */}

      <div
        ref={trackRef}
        className="learn-ai-track"
        data-ready={isReady}
        onPointerDown={
          handlePointerDown
        }
        onPointerMove={
          handlePointerMove
        }
        onPointerUp={
          handlePointerUp
        }
        onPointerCancel={
          handlePointerUp
        }
        onMouseEnter={
          pauseAutoPlay
        }
        onMouseLeave={
          resumeAutoPlay
        }
        onScroll={
          handleScroll
        }
      >

        {loopCards.map(
          (card, index) => (
            <article
              key={`${card.id}-${index}`}
              className="learn-ai-card"
            >
              <Link
                href={`/blogs/${card.slug}`}
                className="learn-ai-card-link"
                draggable={false}
              >

                {/* IMAGE */}

                <div className="learn-ai-image">

                  {card.image ? (
                    <Image
                      src={card.image}
                      alt={card.title}
                      fill
                      sizes="
                        (max-width: 650px) 88vw,
                        (max-width: 1050px) 47vw,
                        33vw
                      "
                      className="learn-ai-image-inner"
                      draggable={false}
                    />
                  ) : (
                    <div
                      className="learn-ai-image-fallback"
                      aria-hidden="true"
                    >
                      <span>AI</span>
                    </div>
                  )}

                  <div
                    className="learn-ai-image-overlay"
                    aria-hidden="true"
                  />

                  <span className="learn-ai-image-label">
                    {card.category}
                  </span>

                </div>

                {/* CONTENT */}

                <div className="learn-ai-card-content">

                  <div className="learn-ai-meta">

                    <span>
                      {card.category}
                    </span>

                    {card.date && (
                      <>
                        <i aria-hidden="true" />

                        <span>
                          {card.date}
                        </span>
                      </>
                    )}

                  </div>

                  <h3>
                    {card.title}
                  </h3>

                  {card.excerpt && (
                    <p>
                      {card.excerpt}
                    </p>
                  )}

                  <div className="learn-ai-card-footer">

                    <span>
                      {card.author}
                    </span>

                    <span
                      className="learn-ai-card-arrow"
                      aria-hidden="true"
                    >
                      ↗
                    </span>

                  </div>

                </div>

              </Link>
            </article>
          )
        )}

      </div>

      {/* =================================================
          DOTS
      ================================================= */}

      {cards.length > 1 && (
        <div
          className="learn-ai-pagination"
          aria-label="Learn about AI carousel navigation"
        >

          {cards.map(
            (card, index) => (
              <button
                key={card.id}
                type="button"
                className={`learn-ai-dot ${
                  activeIndex === index
                    ? "is-active"
                    : ""
                }`}
                aria-label={`Go to ${card.title}`}
                aria-current={
                  activeIndex === index
                    ? "true"
                    : undefined
                }
                onClick={() => {
                  pauseAutoPlay();

                  scrollToCard(
                    index,
                    true
                  );

                  resumeAutoPlay();
                }}
              />
            )
          )}

        </div>
      )}

    </div>
  );
}