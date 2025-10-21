import { Metadata } from 'next';
import Link from 'next/link';
import { MDXRemote } from 'next-mdx-remote/rsc';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { getAllUpdates, getUpdateBySlug } from '@/lib/content';

// Generate static params for all updates
export async function generateStaticParams() {
    const updates = getAllUpdates();

    return updates.map((update) => ({
        slug: update.slug,
    }));
}

// Generate metadata for SEO
export async function generateMetadata({
    params
}: {
    params: Promise<{ slug: string }>
}): Promise<Metadata> {
    const { slug } = await params;
    const update = getUpdateBySlug(slug);

    return {
        title: update.title,
        description: update.summary,
        keywords: update.tags || [],
        authors: [{ name: "AI Engineer" }],
        openGraph: {
            title: update.title,
            description: update.summary,
            type: 'article',
            publishedTime: update.date,
            authors: ["AI Engineer"],
        },
        twitter: {
            card: "summary_large_image",
            title: update.title,
            description: update.summary,
        },
    };
}

export default async function UpdateDetailPage({
    params
}: {
    params: Promise<{ slug: string }>
}) {
    const { slug } = await params;
    const update = getUpdateBySlug(slug);

    // Format date for display
    const formattedDate = new Date(update.date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    return (
        <div className="max-w-4xl mx-auto">
            {/* Back to Updates Link */}
            <Link
                href="/updates"
                className="inline-flex items-center text-gray-400 hover:text-gray-200 transition-colors mb-6 sm:mb-8 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-neutral-900 rounded-md px-2 py-1 -ml-2"
                aria-label="Back to updates list"
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
                Back to Updates
            </Link>

            {/* Post Header */}
            <header className="mb-6 sm:mb-8">
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4 leading-tight">
                    {update.title}
                </h1>

                <div className="flex flex-wrap items-center gap-4 text-sm sm:text-base text-gray-400 mb-4 sm:mb-6">
                    <time dateTime={update.date}>{formattedDate}</time>
                </div>

                {/* Tags */}
                {update.tags && update.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4 sm:mb-6" role="list" aria-label="Tags">
                        {update.tags.map((tag) => (
                            <span
                                key={tag}
                                role="listitem"
                                className="px-2.5 py-1 bg-neutral-800 text-gray-300 rounded-full text-xs sm:text-sm"
                            >
                                {tag}
                            </span>
                        ))}
                    </div>
                )}
            </header>

            {/* Markdown Content */}
            <article className="prose prose-invert prose-sm sm:prose-base md:prose-lg max-w-none">
                <MDXRemote
                    source={update.content}
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
