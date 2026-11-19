"use client";

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

// The diagrams carry ~50 KB of path data, so they live in their own chunk and are
// fetched only on screens that will actually show them.
const SpaceDoodles = dynamic(() => import('./SpaceDoodles'), { ssr: false });

/** Mounts the night-sky diagrams in dark mode on screens wide enough for them. */
export default function SpaceSky() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const wide = window.matchMedia('(min-width: 1760px)');
    const root = document.documentElement;
    const check = () => setShow(wide.matches && root.dataset.theme === 'dark');
    check();
    wide.addEventListener('change', check);
    const themeWatch = new MutationObserver(check);
    themeWatch.observe(root, { attributes: true, attributeFilter: ['data-theme'] });
    return () => {
      wide.removeEventListener('change', check);
      themeWatch.disconnect();
    };
  }, []);

  return show ? <SpaceDoodles /> : null;
}
