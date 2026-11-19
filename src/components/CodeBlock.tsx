"use client";

import { useRef, useState, type ComponentProps } from 'react';

/** A Markdown code block with a copy button in its corner. */
export default function CodeBlock({ children, ...props }: ComponentProps<'pre'>) {
  const pre = useRef<HTMLPreElement>(null);
  const timer = useRef<number | undefined>(undefined);
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    const text = pre.current?.textContent ?? '';
    try {
      await navigator.clipboard.writeText(text.replace(/\n$/, ''));
      setCopied(true);
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard blocked: the code is still selectable */
    }
  };

  return (
    <div className="code-block">
      <pre ref={pre} {...props}>
        {children}
      </pre>
      <button type="button" className="code-copy" onClick={copy} data-copied={copied || undefined}>
        {copied ? 'Copied' : 'Copy'}
      </button>
      <span className="sr-only" role="status">
        {copied ? 'Code copied to the clipboard' : ''}
      </span>
    </div>
  );
}
