"use client";

import { useRef, useState } from "react";

/** A fallback for visitors without a mail app: copies the address to the clipboard. */
export default function CopyEmail({ email }: { email: string }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setCopied(false), 2200);
    } catch {
      /* clipboard blocked: the address is still visible and selectable */
    }
  };

  return (
    <>
      <button type="button" className="btn-outline btn-small" onClick={copy}>
        {copied ? "Copied" : "Copy email"}
      </button>
      <span className="sr-only" role="status">
        {copied ? "Email address copied to the clipboard" : ""}
      </span>
    </>
  );
}
