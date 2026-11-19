import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import Doodle from '@/components/sketch/Doodle';
import { doodleForProject } from '@/components/sketch/doodles';
import MarkdownDoc from '@/components/MarkdownDoc';
import TableOfContents from '@/components/TableOfContents';
import { getAllProjects, getProjectBySlug } from '@/lib/content';

// Generate static params for all projects
export async function generateStaticParams() {
    const projects = getAllProjects();

    return projects.map((project) => ({
        slug: project.slug,
    }));
}

// Generate metadata for SEO
export async function generateMetadata({
    params
}: {
    params: Promise<{ slug: string }>
}): Promise<Metadata> {
    const { slug } = await params;
    const project = getProjectBySlug(slug);

    return {
        title: project.title,
        description: project.description,
        keywords: project.tech,
        authors: [{ name: "Sheiphan Joseph" }],
        openGraph: {
            title: project.title,
            description: project.description,
            type: "article",
            publishedTime: project.date,
            authors: ["Sheiphan Joseph"],
            images: project.image ? [
                {
                    url: project.image,
                    width: 1200,
                    height: 630,
                    alt: project.title,
                }
            ] : [],
        },
        twitter: {
            card: "summary_large_image",
            title: project.title,
            description: project.description,
            images: project.image ? [project.image] : [],
        },
    };
}

export default async function ProjectDetailPage({
    params
}: {
    params: Promise<{ slug: string }>
}) {
    const { slug } = await params;
    const project = getProjectBySlug(slug);

    const formattedDate = new Date(project.date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    return (
        <div className="page-top">
            <Link href="/projects" className="back-link">
                <ArrowLeft className="h-5 w-5" aria-hidden="true" />
                Back to Projects
            </Link>

            <header className="mt-8 grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,28rem)] lg:items-center xl:gap-20">
                <div>
                    <h1 className="detail-title">
                        <span className="title-mark is-on">{project.title}</span>
                    </h1>
                    <p className="mt-6 text-[var(--color-ink-muted)]">
                        <time dateTime={project.date}>{formattedDate}</time>
                    </p>
                    <ul className="mt-5 flex flex-wrap gap-2" aria-label="Technologies used">
                        {project.tech.map((tech) => (
                            <li key={tech} className="tool-chip">
                                {tech}
                            </li>
                        ))}
                    </ul>
                    {(project.github || project.demo) && (
                        <nav className="mt-8 flex flex-wrap gap-4" aria-label="Project links">
                            {project.github && (
                                <a href={project.github} target="_blank" rel="noopener noreferrer" className="btn-outline">
                                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                                    </svg>
                                    View on GitHub
                                    <span className="sr-only"> (opens in new tab)</span>
                                </a>
                            )}
                            {project.demo && (
                                <a href={project.demo} target="_blank" rel="noopener noreferrer" className="btn-sticker">
                                    Live Demo
                                    <ExternalLink className="h-5 w-5" aria-hidden="true" />
                                    <span className="sr-only"> (opens in new tab)</span>
                                </a>
                            )}
                        </nav>
                    )}
                </div>
                <figure className="plate-frame" data-perch="">
                    <Doodle kind={doodleForProject(project.slug)} onLoad delay={250} />
                </figure>
            </header>

            <div className="mt-16 flex flex-col lg:mt-24 xl:grid xl:grid-cols-[minmax(0,72ch)_15rem] xl:justify-between xl:gap-16">
                <MarkdownDoc source={project.content} />
                <TableOfContents articleId="doc" />
            </div>
        </div>
    );
}
