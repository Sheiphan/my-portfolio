import { Metadata } from 'next';
import Link from 'next/link';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { ArrowLeft } from 'lucide-react';
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

    const formattedDate = new Date(update.date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    return (
        <div className="page-top">
            <Link href="/updates" className="back-link">
                <ArrowLeft className="h-5 w-5" aria-hidden="true" />
                Back to Updates
            </Link>

            <header className="mt-8 max-w-[56rem]">
                <h1 className="detail-title">
                    <span className="title-mark is-on">{update.title}</span>
                </h1>
                <p className="mt-6 text-[var(--color-ink-muted)]">
                    <time dateTime={update.date}>{formattedDate}</time>
                </p>
                {update.tags && update.tags.length > 0 && (
                    <ul className="mt-5 flex flex-wrap gap-2" aria-label="Tags">
                        {update.tags.map((tag) => (
                            <li key={tag} className="tool-chip">
                                {tag}
                            </li>
                        ))}
                    </ul>
                )}
            </header>

            <article className="prose prose-zine prose-base mt-14 max-w-[72ch] md:prose-lg lg:mt-20">
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
