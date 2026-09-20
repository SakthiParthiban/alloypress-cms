"use client";

import { useEffect, useState } from "react";

const EMAIL =
  process.env.NEXT_PUBLIC_CONTACT_EMAIL || "hello@alloypress.com";

export default function EmailCtaModal() {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      const target = event.target as HTMLElement | null;

      const trigger = target?.closest(
        "[data-email-cta]",
      );

      if (!trigger) return;

      event.preventDefault();

      setCopied(false);
      setOpen(true);
    }

    document.addEventListener(
      "click",
      handleClick,
    );

    return () => {
      document.removeEventListener(
        "click",
        handleClick,
      );
    };
  }, []);

  useEffect(() => {
    if (!open) return;

    function handleKeyDown(
      event: KeyboardEvent,
    ) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener(
      "keydown",
      handleKeyDown,
    );

    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener(
        "keydown",
        handleKeyDown,
      );

      document.body.style.overflow = "";
    };
  }, [open]);

  async function copyEmail() {
    try {
      await navigator.clipboard.writeText(
        EMAIL,
      );

      setCopied(true);

      window.setTimeout(() => {
        setCopied(false);
      }, 1800);
    } catch {
      setCopied(false);
    }
  }

  if (!open) return null;

  return (
    <div
      className="email-cta-overlay"
      onClick={() => setOpen(false)}
    >
      <div
        className="email-cta-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="email-cta-title"
        onClick={(event) =>
          event.stopPropagation()
        }
      >
        <button
          type="button"
          className="email-cta-close"
          onClick={() => setOpen(false)}
          aria-label="Close"
        >
          ×
        </button>

        <div className="email-cta-icon">
          @
        </div>

        <span className="email-cta-label">
          GET IN TOUCH
        </span>

        <h2 id="email-cta-title">
          Let&apos;s work together
        </h2>

        <p>
          For reviews, partnerships,
          collaborations and business
          enquiries, contact the AlloyPress
          Team.
        </p>

        <div className="email-cta-address">
          {EMAIL}
        </div>

        <button
          type="button"
          className="email-cta-copy"
          onClick={copyEmail}
        >
          {copied
            ? "✓ Email Copied"
            : "Copy Email"}
        </button>

        <button
          type="button"
          className="email-cta-mail"
          onClick={() => {
            window.location.href = `mailto:${EMAIL}`;
          }}
        >
          Open Email App
        </button>
      </div>
    </div>
  );
}