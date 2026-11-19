import Link from 'next/link';
import type { Project } from '@/lib/content';
import Doodle from '@/components/sketch/Doodle';
import { doodleForProject } from '@/components/sketch/doodles';
import DrawOnView from '@/components/sketch/DrawOnView';

interface ProjectCardProps {
  project: Project;
  index?: number;
  headingLevel?: 'h2' | 'h3';
}

/**
 * A project page from the zine: its own doodled architecture in a hand-drawn
 * frame, then the facts. The whole plate opens the project; the title is the
 * link's accessible name. Hovering redraws the doodle and lands a few agents
 * on the frame.
 */
export default function ProjectCard({ project, index = 0, headingLevel = 'h2' }: ProjectCardProps) {
  const Heading = headingLevel;
  const date = new Date(project.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long' });

  return (
    <DrawOnView as="article" redraw className="plate group relative">
      <div className="plate-frame" data-perch="">
        <Doodle kind={doodleForProject(project.slug)} seed={index + 2} className="mx-auto max-w-[440px]" />
      </div>
      <div className="mt-6 px-1">
        <Heading className="plate-title">
          <Link href={`/projects/${project.slug}`} className="stretched-link">
            <span className="title-mark">{project.title}</span>
          </Link>
        </Heading>
        <p className="mt-1.5 text-[0.95rem] text-[var(--color-ink-muted)]">
          <time dateTime={project.date}>{date}</time>
        </p>
        <p className="mt-3 line-clamp-3 text-[var(--color-ink-soft)]">{project.description}</p>
        <ul className="mt-4 flex flex-wrap gap-2" aria-label="Technologies used">
          {project.tech.map((tech) => (
            <li key={tech} className="tool-chip">
              {tech}
            </li>
          ))}
        </ul>
      </div>
    </DrawOnView>
  );
}
