import type { CSSProperties } from 'react';
import DrawOnView from '@/components/sketch/DrawOnView';
import { experience, formatDuration, formatRange } from '@/lib/experience';

export const metadata = {
  title: 'Experience',
  description: 'Professional experience of Sheiphan Joseph: AI and ML engineering roles from 2024 to today',
};

export default function ExperiencePage() {
  return (
    <div className="page-top">
      <header className="draw-load">
        <h1 className="page-title">
          <span className="highlight">Experience</span>
        </h1>
      </header>

      <ol className="mt-8">
        {experience.map((role) => {
          const meta = [role.location, role.mode].filter(Boolean).join(' · ');
          return (
            <DrawOnView
              as="li"
              key={`${role.company}-${role.start}`}
              className="log-entry relative grid gap-2 pb-9 pt-7 md:grid-cols-[13rem_minmax(0,1fr)] md:gap-10"
            >
              <p className="log-date">
                <time dateTime={role.start}>{formatRange(role)}</time>
                <span className="mt-1 block font-[family-name:var(--font-body)] text-[0.95rem] text-[var(--color-ink-muted)]">
                  {formatDuration(role)}
                </span>
              </p>
              <div className="max-w-[68ch]">
                <h2 className="log-title">
                  <span className="title-mark is-on">{role.title}</span>
                </h2>
                <p className="mt-2 text-lg font-bold text-[var(--color-ink)]">
                  {role.company}
                  <span className="font-normal text-[var(--color-ink-soft)]"> · {role.employmentType}</span>
                </p>
                <p className="mt-1 text-[var(--color-ink-soft)]">{meta}</p>
                {role.skills && role.skills.length > 0 && (
                  <ul className="mt-4 flex flex-wrap gap-2" aria-label="Skills">
                    {role.skills.map((skill) => (
                      <li key={skill} className="tool-chip">
                        {skill}
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
        })}
      </ol>
    </div>
  );
}
