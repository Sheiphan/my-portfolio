"use client";

import { useEffect, useRef, useState, type ReactNode } from 'react';

type DrawState = 'drawn' | 'pending' | 'on';

interface DrawOnViewProps {
  children: ReactNode;
  className?: string;
  /** Redraw the strokes inside when the pointer enters. */
  redraw?: boolean;
  as?: 'div' | 'article' | 'section' | 'li' | 'header';
}

/**
 * Draws the marker strokes inside when they scroll into view. Without
 * JavaScript, or with reduced motion, everything simply stays drawn.
 */
export default function DrawOnView({ children, className = '', redraw = false, as: Tag = 'div' }: DrawOnViewProps) {
  const ref = useRef<HTMLElement | null>(null);
  const [state, setState] = useState<DrawState>('drawn');

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    // Already on screen at mount: keep it drawn rather than flashing it away.
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) return;

    setState('pending');
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setState('on');
          io.disconnect();
        }
      },
      { rootMargin: '0px 0px -12% 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const handleEnter = () => {
    if (!redraw || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    setState('pending');
    requestAnimationFrame(() => requestAnimationFrame(() => setState('on')));
  };

  return (
    <Tag
      ref={ref as never}
      data-draw={state}
      className={className}
      onPointerEnter={redraw ? handleEnter : undefined}
    >
      {children}
    </Tag>
  );
}
