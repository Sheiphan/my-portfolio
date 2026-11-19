"use client";

import type { ReactNode } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';

/** Moves its children up by `distance` px over the first 4000px of scroll: slow drift reads as far away. */
export default function Drift({ distance, className, children }: { distance: number; className?: string; children: ReactNode }) {
  const reduceMotion = useReducedMotion();
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 4000], [0, -distance]);
  return (
    <motion.div className={className} style={{ y: reduceMotion ? 0 : y }}>
      {children}
    </motion.div>
  );
}
