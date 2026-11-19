import ExperienceTimeline from '@/components/ExperienceTimeline';

export const metadata = {
  title: 'Experience',
  description:
    'Professional experience of Sheiphan Joseph: building MCP servers, LLM agents and ML services in production, from 2024 to today.',
};

export default function ExperiencePage() {
  return (
    <div className="page-top">
      <header className="draw-load max-w-[68ch]">
        <h1 className="page-title">
          <span className="highlight">Experience</span>
        </h1>
        <p className="mt-6 text-lg text-[var(--color-ink-soft)] sm:text-xl">
          Where I&apos;ve worked and what I built there, most recent first.
        </p>
      </header>

      <div className="mt-10">
        <ExperienceTimeline variant="full" />
      </div>
    </div>
  );
}
