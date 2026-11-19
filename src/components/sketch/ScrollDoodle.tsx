"use client";

import { useRef } from 'react';
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from 'framer-motion';

/**
 * A loop-de-loop marker arrow between the hero and the next section, drawn as
 * you scroll down towards it. Fully drawn under reduced motion.
 */
export default function ScrollDoodle({ className = '' }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 95%', 'end 55%'] });
  const pathLength = useSpring(scrollYProgress, { stiffness: 110, damping: 26, mass: 0.5 });
  // Hide the round-cap dot the line would show before it starts drawing.
  const lineOpacity = useTransform(pathLength, [0, 0.02], [0, 1]);
  // The arrowhead is drawn only once the line has reached it, never floating on its own.
  const headLength = useTransform(pathLength, [0.9, 1], [0, 1]);
  const headOpacity = useTransform(pathLength, [0.9, 0.93], [0, 1]);

  return (
    <div ref={ref} className={`relative w-28 sm:w-36 ${className}`}>
    <svg
      viewBox="0 0 160 220"
      className="block h-auto w-full overflow-visible"
      aria-hidden="true"
      fill="none"
      stroke="var(--color-ink)"
      strokeWidth={3.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <motion.path
        d="M40 6 C30 50 70 70 96 64 C128 56 120 18 92 26 C60 36 66 96 82 130 C92 152 96 176 92 206"
        style={{ pathLength: reduceMotion ? 1 : pathLength, opacity: reduceMotion ? 1 : lineOpacity }}
      />
      <motion.path
        d="M78 192 L92 210 L106 192"
        style={{ pathLength: reduceMotion ? 1 : headLength, opacity: reduceMotion ? 1 : headOpacity }}
      />
    </svg>
    </div>
  );
}
