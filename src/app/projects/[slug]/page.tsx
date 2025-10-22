import { Metadata } from 'next';
import Link from 'next/link';
import { MDXRemote } from 'next-mdx-remote/rsc';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
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
        authors: [{ name: "AI Engineer" }],
        openGraph: {
            title: project.title,
            description: project.description,
            type: "article",
            publishedTime: project.date,
            authors: ["AI Engineer"],
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

    // Format date for display
    const formattedDate = new Date(project.date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    return (
        <div className="max-w-4xl mx-auto">
            {/* Back to Projects Link */}
            <Link
                href="/projects"
                className="inline-flex items-center text-gray-400 hover:text-gray-200 transition-colors mb-6 sm:mb-8 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-neutral-900 rounded-md px-2 py-1 -ml-2"
                aria-label="Back to projects list"
            >
                <svg
                    className="w-4 h-4 sm:w-5 sm:h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 19l-7-7 7-7"
                    />
                </svg>
                Back to Projects
            </Link>

            {/* Project Header */}
            <header className="mb-6 sm:mb-8">
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4 leading-tight">
                    {project.title}
                </h1>

                <div className="flex flex-wrap items-center gap-4 text-sm sm:text-base text-gray-400 mb-4 sm:mb-6">
                    <time dateTime={project.date}>{formattedDate}</time>
                </div>

                {/* Tech Tags */}
                <div className="flex flex-wrap gap-2 mb-4 sm:mb-6" role="list" aria-label="Technologies used">
                    {project.tech.map((tech) => (
                        <span
                            key={tech}
                            role="listitem"
                            className="px-2.5 py-1 bg-neutral-800 text-gray-300 rounded-full text-xs sm:text-sm"
                        >
                            {tech}
                        </span>
                    ))}
                </div>

                {/* Links */}
                {(project.github || project.demo) && (
                    <nav className="flex flex-wrap gap-3 sm:gap-4" aria-label="Project links">
                        {project.github && (
                            <a
                                href={project.github}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center px-3 sm:px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-gray-200 rounded-lg transition-colors text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-neutral-900"
                                aria-label="View project on GitHub (opens in new tab)"
                            >
                                <svg
                                    className="w-4 h-4 sm:w-5 sm:h-5 mr-2"
                                    fill="currentColor"
                                    viewBox="0 0 24 24"
                                    aria-hidden="true"
                                >
                                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                                </svg>
                                <span className="hidden sm:inline">View on GitHub</span>
                                <span className="sm:hidden">GitHub</span>
                            </a>
                        )}
                        {project.demo && (
                            <a
                                href={project.demo}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center px-3 sm:px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-neutral-900"
                                aria-label="View live demo (opens in new tab)"
                            >
                                <svg
                                    className="w-4 h-4 sm:w-5 sm:h-5 mr-2"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    aria-hidden="true"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                    />
                                </svg>
                                Live Demo
                            </a>
                        )}
                    </nav>
                )}
            </header>

            {/* Markdown Content */}
            <article className="prose prose-invert prose-sm sm:prose-base md:prose-lg max-w-none">
                <MDXRemote
                    source={project.content}
                    options={{
                        mdxOptions: {
                            remarkPlugins: [remarkGfm],
                            rehypePlugins: [rehypeHighlight],
                        },
                    }}
                />
            </article>
        </div>
    );
}
