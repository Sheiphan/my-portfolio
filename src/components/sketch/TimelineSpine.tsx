"use client";

import { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from 'framer-motion';

/** A gently wobbling vertical line down the middle of a w x h box. */
function spinePath(w: number, h: number): string {
  const x = w / 2;
  const seg = Math.max(1, Math.round(h / 260));
  const step = h / seg;
  let d = `M${x} 0`;
  for (let n = 0; n < seg; n++) {
    const y0 = n * step;
    const sway = n % 2 === 0 ? 5 : -5;
    d += ` C${x - sway} ${(y0 + step * 0.33).toFixed(1)} ${x + sway} ${(y0 + step * 0.66).toFixed(1)} ${x} ${(y0 + step).toFixed(1)}`;
  }
  return d;
}

/**
 * The wobbly marker line down the left of the experience timeline. It draws
 * itself as the timeline scrolls through the viewport; fully drawn under
 * reduced motion. The path is built at the box's real pixel size, so dashes
 * (and with them the drawn length) are never distorted by scaling.
 */
export default function TimelineSpine({ className = '' }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 85%', 'end 70%'] });
  const pathLength = useSpring(scrollYProgress, { stiffness: 90, damping: 24, mass: 0.6 });
  const opacity = useTransform(pathLength, [0, 0.01], [0, 1]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => setSize({ w: el.clientWidth, h: el.clientHeight });
    measure();
    if (typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const d = size && size.h > 0 ? spinePath(size.w, size.h) : null;

  return (
    <div ref={ref} className={`pointer-events-none absolute inset-y-0 left-0 ${className}`} aria-hidden="true">
      {d && size && (
        <svg className="h-full w-full overflow-visible" viewBox={`0 0 ${size.w} ${size.h}`} fill="none">
          {/* A faint pencil guide, so the path ahead is visible before the ink reaches it. */}
          <path d={d} stroke="var(--color-ink-muted)" strokeOpacity={0.35} strokeWidth={1.5} strokeDasharray="2 7" />
          <motion.path
            d={d}
            stroke="var(--color-ink)"
            strokeWidth={3}
            strokeLinecap="round"
            style={{ pathLength: reduceMotion ? 1 : pathLength, opacity: reduceMotion ? 1 : opacity }}
          />
        </svg>
      )}
    </div>
  );
}
