import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import MarkdownDoc from '@/components/MarkdownDoc';
import TableOfContents from '@/components/TableOfContents';
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
        authors: [{ name: "Sheiphan Joseph" }],
        openGraph: {
            title: update.title,
            description: update.summary,
            type: 'article',
            publishedTime: update.date,
            authors: ["Sheiphan Joseph"],
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
    // Updates are sorted newest first.
    const all = getAllUpdates();
    const at = all.findIndex((u) => u.slug === slug);
    const newer = at > 0 ? all[at - 1] : undefined;
    const older = at >= 0 ? all[at + 1] : undefined;

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
                    <span aria-hidden="true"> · </span>
                    {update.readingMinutes} min read
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

            <div className="mt-14 flex flex-col lg:mt-20 xl:grid xl:grid-cols-[minmax(0,72ch)_15rem] xl:justify-between xl:gap-16">
                <MarkdownDoc source={update.content} />
                <TableOfContents articleId="doc" />
            </div>

            {(older || newer) && (
                <nav aria-label="More updates" className="post-nav mt-20 max-w-[72ch]">
                    {older ? (
                        <Link href={`/updates/${older.slug}`} className="post-nav-link" rel="prev">
                            <span className="post-nav-dir">
                                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                                Older post
                            </span>
                            <span className="post-nav-title">{older.title}</span>
                        </Link>
                    ) : <span />}
                    {newer && (
                        <Link href={`/updates/${newer.slug}`} className="post-nav-link is-next" rel="next">
                            <span className="post-nav-dir">
                                Newer post
                                <ArrowRight className="h-4 w-4" aria-hidden="true" />
                            </span>
                            <span className="post-nav-title">{newer.title}</span>
                        </Link>
                    )}
                </nav>
            )}
        </div>
    );
}
