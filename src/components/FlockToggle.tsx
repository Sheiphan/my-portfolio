"use client";

import { useEffect, useState } from "react";

const KEY = "flock";

/** Hides or shows the ambient flock (WCAG 2.2.2: moving content needs a way to stop it). */
export default function FlockToggle({ variant = "icon" }: { variant?: "icon" | "row" }) {
  const [off, setOff] = useState(false);

  // The inline script in <head> has already set data-flock; read it back after mount.
  useEffect(() => {
    setOff(document.documentElement.dataset.flock === "off");
  }, []);

  const toggle = () => {
    const next = !off;
    setOff(next);
    const root = document.documentElement;
    if (next) root.dataset.flock = "off";
    else delete root.dataset.flock;
    try {
      localStorage.setItem(KEY, next ? "off" : "on");
    } catch {
      /* storage unavailable: the choice lasts for this page view */
    }
    window.dispatchEvent(new Event("flock:toggle"));
  };

  const label = off ? "Show the birds" : "Hide the birds";

  if (variant === "row") {
    return (
      <button type="button" className="mobile-link w-full text-left" onClick={toggle} aria-pressed={off}>
        {label}
      </button>
    );
  }

  return (
    <button type="button" className="theme-toggle flock-toggle hidden sm:inline-grid" onClick={toggle} aria-pressed={off} aria-label={label} title={label}>
      <svg className="icon-on" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M2.5 9.5c3-2.8 6-2.2 9.5 1.5 3.5-3.7 6.5-4.3 9.5-1.5" />
        <path d="M6.5 16.5c2-1.6 3.8-1.2 5.5 1 1.7-2.2 3.5-2.6 5.5-1" />
      </svg>
      <svg className="icon-off" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M2.5 9.5c3-2.8 6-2.2 9.5 1.5 3.5-3.7 6.5-4.3 9.5-1.5" opacity="0.45" />
        <path d="M6.5 16.5c2-1.6 3.8-1.2 5.5 1 1.7-2.2 3.5-2.6 5.5-1" opacity="0.45" />
        <path d="M4 4l16 16" />
      </svg>
    </button>
  );
}
