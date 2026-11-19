import type { ComponentProps } from 'react';
import { MDXRemote } from 'next-mdx-remote/rsc';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import rehypeSlug from 'rehype-slug';
import CodeBlock from '@/components/CodeBlock';

/**
 * A heading with a link to itself, so a reader can share one section. The "#" is
 * drawn by CSS, which keeps the heading's text (and the table of contents) clean.
 */
function anchored(Tag: 'h2' | 'h3') {
  return function AnchoredHeading({ id, children, ...props }: ComponentProps<'h2'>) {
    return (
      <Tag id={id} {...props}>
        {children}
        {id && <a href={`#${id}`} className="heading-anchor" aria-label="Link to this section" />}
      </Tag>
    );
  };
}

const components = { h2: anchored('h2'), h3: anchored('h3'), pre: CodeBlock };

/** The body of a project or update page, rendered from Markdown. */
export default function MarkdownDoc({ source, id = 'doc' }: { source: string; id?: string }) {
  return (
    <article id={id} className="prose prose-zine prose-base max-w-[72ch] md:prose-lg">
      <MDXRemote
        source={source}
        components={components}
        options={{
          mdxOptions: {
            remarkPlugins: [remarkGfm],
            rehypePlugins: [rehypeSlug, rehypeHighlight],
          },
        }}
      />
    </article>
  );
}
