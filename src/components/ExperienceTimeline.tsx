import Link from 'next/link';
import type { CSSProperties } from 'react';
import DrawOnView from '@/components/sketch/DrawOnView';
import TimelineSpine from '@/components/sketch/TimelineSpine';
import { roughCircle } from '@/components/sketch/rough';
import { experience, formatDuration, formatRange, type Role } from '@/lib/experience';

interface ExperienceTimelineProps {
  /** "full" adds highlights, skills and project links; "compact" is the one-line-per-role home version. */
  variant?: 'full' | 'compact';
  headingLevel?: 'h2' | 'h3';
  roles?: Role[];
}

/**
 * The career as a hand-drawn timeline: a marker spine that draws as you
 * scroll, a doodled node per role (the current one pulses), and each entry
 * rising in as it comes into view.
 */
export default function ExperienceTimeline({
  variant = 'full',
  headingLevel = 'h2',
  roles = experience,
}: ExperienceTimelineProps) {
  const Heading = headingLevel;
  const full = variant === 'full';

  return (
    <div className="relative">
      <TimelineSpine className="w-10 md:w-14" />
      <ol className="relative pl-10 md:pl-14">
        {roles.map((role, index) => {
          const current = !role.end;
          const meta = [role.location, role.mode].filter(Boolean).join(' · ');
          return (
            <DrawOnView
              as="li"
              key={`${role.company}-${role.start}`}
              className={`xp-entry group relative ${full ? 'pb-14 pt-8' : 'pb-10 pt-6'}`}
            >
              <span className="xp-node -left-10 w-10 md:-left-14 md:w-14" aria-hidden="true">
                <svg viewBox="0 0 32 32" className="h-8 w-8 overflow-visible">
                  <path
                    d={roughCircle(16, 16, 10.5, index + 7)}
                    pathLength={1}
                    className="ink-stroke"
                    fill="var(--color-paper)"
                    stroke="var(--color-ink)"
                    strokeWidth={2.75}
                    style={{ '--i': 0, '--draw-dur': '520ms' } as CSSProperties}
                  />
                  <circle cx={16} cy={16} r={4.5} fill={current ? 'var(--color-teal)' : 'var(--color-pink)'} className="xp-dot" />
                  {current && <circle cx={16} cy={16} r={10} className="xp-pulse" />}
                </svg>
              </span>

              <div className={`grid gap-2 ${full ? 'md:grid-cols-[13rem_minmax(0,1fr)] md:gap-10' : 'md:grid-cols-[13rem_minmax(0,1fr)] md:gap-8'}`}>
                <div className="xp-reveal" style={{ '--i': 0 } as CSSProperties}>
                  <p className="log-date">
                    <time dateTime={role.start}>{formatRange(role)}</time>
                    <span className="mt-1 block font-[family-name:var(--font-body)] text-[0.95rem] text-[var(--color-ink-muted)]">
                      {formatDuration(role)}
                      {current && <span className="xp-now">now</span>}
                    </span>
                  </p>
                </div>

                <div className="max-w-[70ch]">
                  <div className="xp-reveal" style={{ '--i': 1 } as CSSProperties}>
                    <Heading className="log-title">
                      <span className="title-mark">{role.title}</span>
                    </Heading>
                    <p className="mt-1.5 text-lg font-bold text-[var(--color-ink)]">
                      {role.company}
                      <span className="font-normal text-[var(--color-ink-soft)]"> · {role.employmentType}</span>
                    </p>
                    {full && <p className="mt-0.5 text-[var(--color-ink-muted)]">{meta}</p>}
                  </div>

                  <p className="xp-reveal mt-3 text-[var(--color-ink-soft)]" style={{ '--i': 2 } as CSSProperties}>
                    {role.summary}
                  </p>

                  {full && role.highlights && role.highlights.length > 0 && (
                    <ul className="mt-5 space-y-3" aria-label={`What I did at ${role.company}`}>
                      {role.highlights.map((item, n) => (
                        <li key={n} className="xp-reveal xp-bullet" style={{ '--i': 3 + n } as CSSProperties}>
                          {item}
                        </li>
                      ))}
                    </ul>
                  )}

                  {full && role.skills && role.skills.length > 0 && (
                    <ul
                      className="xp-reveal mt-5 flex flex-wrap gap-2"
                      aria-label="Skills"
                      style={{ '--i': 3 + (role.highlights?.length ?? 0) } as CSSProperties}
                    >
                      {role.skills.map((skill) => (
                        <li key={skill} className="tool-chip">
                          {skill}
                        </li>
                      ))}
                    </ul>
                  )}

                  {full && role.projects && role.projects.length > 0 && (
                    <p
                      className="xp-reveal mt-4 flex flex-wrap gap-x-5 gap-y-1"
                      style={{ '--i': 4 + (role.highlights?.length ?? 0) } as CSSProperties}
                    >
                      <span className="text-[var(--color-ink-muted)]">Projects:</span>
                      {role.projects.map((project) => (
                        <Link key={project.href} href={project.href} className="text-link">
                          {project.label}
                        </Link>
                      ))}
                    </p>
                  )}

                  {full && role.writing && role.writing.length > 0 && (
                    <p
                      className="xp-reveal mt-2 flex flex-wrap gap-x-5 gap-y-1"
                      style={{ '--i': 5 + (role.highlights?.length ?? 0) } as CSSProperties}
                    >
                      <span className="text-[var(--color-ink-muted)]">Writing:</span>
                      {role.writing.map((post) => (
                        <Link key={post.href} href={post.href} className="text-link">
                          {post.label}
                        </Link>
                      ))}
                    </p>
                  )}
                </div>
              </div>
            </DrawOnView>
          );
        })}
      </ol>
    </div>
  );
}
