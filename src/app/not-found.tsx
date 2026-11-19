import Link from 'next/link';
import type { CSSProperties } from 'react';
import { doodleArrow, roughCircle } from '@/components/sketch/rough';

export default function NotFound() {
  return (
    <div className="page-top draw-load grid min-h-[60vh] items-center gap-12 md:grid-cols-[minmax(0,1fr)_auto]">
      <div>
        <h1 className="page-title">
          <span className="highlight">404</span>
        </h1>
        <h2 className="mt-6 text-2xl font-bold sm:text-3xl">Page Not Found</h2>
        <p className="mt-3 max-w-md text-[var(--color-ink-soft)]">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-5">
          <Link href="/" className="btn-sticker">
            Go Home
          </Link>
          <Link href="/projects" className="btn-outline">
            View Projects
          </Link>
        </div>
      </div>
      {/* A lost little agent wandering off the page. */}
      <svg className="hidden h-auto w-72 overflow-visible md:block" viewBox="0 0 300 240" aria-hidden="true" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path d={roughCircle(80, 80, 44, 77)} pathLength={1} className="ink-stroke" stroke="var(--color-ink)" strokeWidth={4} style={{ '--i': 1 } as CSSProperties} />
        <path d="M64 74 l10 6 M64 86 l10 -6 M96 74 l-10 6 M96 86 l-10 -6" pathLength={1} className="ink-stroke" stroke="var(--color-ink)" strokeWidth={3.5} style={{ '--i': 3 } as CSSProperties} />
        <path d="M68 104 Q80 96 92 104" pathLength={1} className="ink-stroke" stroke="var(--color-ink)" strokeWidth={3.5} style={{ '--i': 4 } as CSSProperties} />
        <path d={doodleArrow([126, 96], [210, 60], [170, 200], [290, 190], 12)} pathLength={1} className="ink-stroke" stroke="var(--color-pink)" strokeWidth={4} style={{ '--i': 6, '--draw-dur': '1100ms' } as CSSProperties} />
        <text x={92} y={36} fontSize={22} className="ink-label" fill="var(--color-ink)" transform="rotate(5 150 34)" style={{ '--i': 7 } as CSSProperties}>
          hmm, wrong turn
        </text>
      </svg>
    </div>
  );
}
