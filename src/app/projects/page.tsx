import { getAllProjects } from '@/lib/content';
import ProjectCard from '@/components/ProjectCard';

export const metadata = {
  title: 'Projects',
  description: 'Explore my AI and machine learning projects',
};

export default function ProjectsPage() {
  const projects = getAllProjects();

  return (
    <div className="page-top">
      <header className="draw-load max-w-[68ch]">
        <h1 className="page-title">
          <span className="highlight">Projects</span>
        </h1>
        <p className="mt-6 text-lg text-[var(--color-ink-soft)] sm:text-xl">
          A collection of my work in AI, machine learning, and software engineering.
        </p>
      </header>

      {projects.length === 0 ? (
        <p className="mt-16 text-lg text-[var(--color-ink-soft)]" role="status">
          No projects yet. Check back soon!
        </p>
      ) : (
        <div className="mt-14 grid gap-x-12 gap-y-20 md:grid-cols-2">
          {projects.map((project, index) => (
            <ProjectCard key={project.slug} project={project} index={index} />
          ))}
        </div>
      )}
    </div>
  );
}
