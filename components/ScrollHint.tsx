"use client";

import { useEffect, useState } from "react";

/**
 * Down-arrow that stays pinned to the true bottom of the visible screen
 * (not the bottom of the hero section), so it's always visible on the
 * first screen the visitor sees — on any device, including mobile browsers
 * with address bars that show/hide as you scroll. It fades out once the
 * visitor scrolls past roughly the first screen, since its job (hinting
 * that there's more below) is done by then.
 */
export default function ScrollHint({ label }: { label: string }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const onScroll = () => {
      setVisible(window.scrollY < window.innerHeight * 0.5);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <a
      href="#intro"
      aria-label={label}
      className={`fixed z-30 left-1/2 -translate-x-1/2 text-cream/80 hover:text-cream animate-bounce transition-opacity duration-300 ${
        visible ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
      style={{ bottom: "max(1rem, env(safe-area-inset-bottom))" }}
    >
      <svg
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 4v15m0 0-6-6m6 6 6-6"
        />
      </svg>
    </a>
  );
}
