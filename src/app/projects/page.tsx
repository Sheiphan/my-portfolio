import { getAllProjects } from '@/lib/content';
import ProjectCard from '@/components/ProjectCard';

export const metadata = {
  title: 'Projects',
  description: 'Explore my AI and machine learning projects',
};

export default function ProjectsPage() {
  const projects = getAllProjects();

  return (
    <div className="max-w-6xl mx-auto">
      <header className="mb-8 sm:mb-12">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4">Projects</h1>
        <p className="text-gray-400 text-base sm:text-lg">
          A collection of my work in AI, machine learning, and software engineering.
        </p>
      </header>

      {projects.length === 0 ? (
        <div className="text-center py-12" role="status">
          <p className="text-gray-400 text-base sm:text-lg">No projects yet. Check back soon!</p>
        </div>
      ) : (
        <div 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8"
          role="list"
          aria-label="Projects list"
        >
          {projects.map((project, index) => (
            <div key={project.slug} role="listitem">
              <ProjectCard project={project} index={index} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
