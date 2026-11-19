import Link from 'next/link';
import type { CSSProperties } from 'react';
import type { Update } from '@/lib/content';
import DrawOnView from '@/components/sketch/DrawOnView';

interface UpdateItemProps {
  update: Update;
  index?: number;
  headingLevel?: 'h2' | 'h3';
}

/** One entry in the zine's log: a marker date, the post, a hand-drawn rule beneath. */
export default function UpdateItem({ update, headingLevel = 'h2' }: UpdateItemProps) {
  const Heading = headingLevel;
  const formattedDate = new Date(update.date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <DrawOnView
      as="article"
      redraw
      className="log-entry group relative grid gap-2 pb-9 pt-7 md:grid-cols-[10rem_minmax(0,1fr)] md:gap-10"
    >
      <div>
        <time dateTime={update.date} className="log-date">
          {formattedDate}
        </time>
        <p className="log-read">{update.readingMinutes} min read</p>
      </div>
      <div className="max-w-[68ch]" data-perch="">
        <Heading className="log-title">
          <Link href={`/updates/${update.slug}`} className="stretched-link">
            <span className="title-mark">{update.title}</span>
          </Link>
        </Heading>
        <p className="mt-2 text-[var(--color-ink-soft)]">{update.summary}</p>
        {update.tags && update.tags.length > 0 && (
          <ul className="mt-4 flex flex-wrap gap-2" aria-label="Tags">
            {update.tags.map((tag) => (
              <li key={tag} className="tool-chip">
                {tag}
              </li>
            ))}
          </ul>
        )}
      </div>
      <svg
        className="pointer-events-none absolute bottom-0 left-0 h-2 w-full overflow-visible"
        viewBox="0 0 100 8"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path
          d="M0 4 C20 2.5 40 5.5 60 4 S90 2.8 100 4.4"
          pathLength={1}
          className="ink-stroke"
          fill="none"
          stroke="var(--color-ink)"
          strokeWidth={2}
          strokeLinecap="round"
          style={{ '--i': 0, '--draw-dur': '900ms' } as CSSProperties}
        />
      </svg>
    </DrawOnView>
  );
}
