import type { CSSProperties } from 'react';
import DrawOnView from '@/components/sketch/DrawOnView';
import { roughRect, roughLine } from '@/components/sketch/rough';
import CopyEmail from '@/components/CopyEmail';

/** The closing panel: how to reach Sheiphan, with a doodled envelope. */
export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-28">
      <svg className="block h-[6px] w-full" viewBox="0 0 1000 6" preserveAspectRatio="none" aria-hidden="true">
        <path d="M0 3.5 C180 1 420 5 640 3 S880 1.5 1000 3" fill="none" stroke="var(--color-ink)" strokeWidth={2} />
      </svg>
      <DrawOnView className="mx-auto grid max-w-[1440px] gap-10 px-4 pb-10 pt-14 sm:px-8 md:grid-cols-[minmax(0,1fr)_auto] md:items-end lg:px-14">
        <div>
          <h2 className="font-[family-name:var(--font-marker)] text-[clamp(2rem,4vw,3rem)] leading-none">
            <span className="highlight">Contact</span>
          </h2>
          <a
            href="mailto:sheiphanshaijan@gmail.com"
            className="mt-7 inline-block text-[clamp(1.3rem,3vw,2.2rem)] font-bold leading-tight underline decoration-[var(--color-pink)] decoration-[3px] underline-offset-[0.2em] [overflow-wrap:anywhere] hover:decoration-[var(--color-teal)]"
            data-mascot="grin"
            data-perch=""
          >
            sheiphanshaijan@gmail.com
          </a>
          <p className="mt-5">
            <CopyEmail email="sheiphanshaijan@gmail.com" />
          </p>
          <p className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-[var(--color-ink-soft)]">
            <a href="tel:+919370896602" className="text-link">
              +91 9370896602
            </a>
            <span>Bengaluru, India</span>
          </p>
        </div>
        <svg className="hidden h-auto w-44 overflow-visible md:block" viewBox="0 0 120 90" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
          <path d={roughRect(8, 14, 104, 66, 41)} pathLength={1} className="ink-stroke" fill="none" stroke="var(--color-ink)" strokeWidth={3} style={{ '--i': 1 } as CSSProperties} />
          <path d={`${roughLine(8, 16, 60, 54, 42, 2)} ${roughLine(60, 54, 112, 16, 43, 2)}`} pathLength={1} className="ink-stroke" fill="none" stroke="var(--color-pink)" strokeWidth={3.5} style={{ '--i': 3 } as CSSProperties} />
        </svg>
        <p className="text-[0.95rem] text-[var(--color-ink-muted)] md:col-span-2">
          © {currentYear} Sheiphan Joseph. All rights reserved.
        </p>
      </DrawOnView>
    </footer>
  );
}
