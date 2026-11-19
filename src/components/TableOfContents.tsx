"use client";

import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react';
import { motion, useReducedMotion, useScroll, useSpring } from 'framer-motion';

interface Heading {
  id: string;
  text: string;
  level: 2 | 3;
}

/** Below this line (px from the top of the viewport) a heading counts as "passed". */
const ACTIVE_LINE = 140;

const useIsoLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

/**
 * "On this page" for a Markdown document. Reads the headings rehype-slug
 * rendered into the article, so the links always match the page. On wide
 * screens it is a sticky rail on the right: an ink line fills as you read,
 * and a highlighter slides to the section you're in. On narrow screens it is
 * a collapsible list above the article.
 */
export default function TableOfContents({ articleId }: { articleId: string }) {
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const articleRef = useRef<HTMLElement | null>(null);
  const reduceMotion = useReducedMotion();

  useIsoLayoutEffect(() => {
    articleRef.current = document.getElementById(articleId);
  }, [articleId]);

  const { scrollYProgress } = useScroll({ target: articleRef, offset: ['start 30%', 'end 85%'] });
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 28, mass: 0.4 });

  useEffect(() => {
    const article = document.getElementById(articleId);
    if (!article) return;
    const found = Array.from(article.querySelectorAll<HTMLHeadingElement>('h2[id], h3[id]'))
      .filter((el) => el.offsetParent !== null)
      .map((el) => ({
        id: el.id,
        text: el.textContent?.trim() ?? '',
        level: (el.tagName === 'H2' ? 2 : 3) as 2 | 3,
      }));
    setHeadings(found);
    if (found.length === 0) return;

    let frame = 0;
    const update = () => {
      frame = 0;
      const line = Math.max(ACTIVE_LINE, window.innerHeight * 0.3);
      let current: string | null = found[0].id;
      for (const heading of found) {
        const el = document.getElementById(heading.id);
        if (el && el.getBoundingClientRect().top <= line) current = heading.id;
        else break;
      }
      // Once the end of the article is on screen, the last section is the one being
      // read, even if its heading never reaches the line.
      if (article.getBoundingClientRect().bottom <= window.innerHeight) {
        current = found[found.length - 1].id;
      }
      setActiveId(current);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [articleId]);

  if (headings.length < 2) return null;

  const list = (variant: 'rail' | 'menu') => (
    <ol className="toc-list">
      {headings.map((heading, index) => {
        const active = heading.id === activeId;
        return (
          <li
            key={heading.id}
            className={`toc-item ${heading.level === 3 ? 'is-sub' : ''}`}
            style={{ '--i': index } as CSSProperties}
          >
            <a
              href={`#${heading.id}`}
              className={`toc-link ${active ? 'is-active' : ''}`}
              aria-current={active ? 'location' : undefined}
            >
              {active && variant === 'rail' && (
                <motion.span
                  layoutId="toc-marker"
                  className="toc-marker"
                  aria-hidden="true"
                  transition={reduceMotion ? { duration: 0 } : { type: 'spring', stiffness: 420, damping: 34 }}
                />
              )}
              <span className="relative">{heading.text}</span>
            </a>
          </li>
        );
      })}
    </ol>
  );

  return (
    <aside className="toc order-first mb-10 xl:order-none xl:mb-0" aria-label="Table of contents">
      <details className="toc-menu xl:hidden">
        <summary>On this page</summary>
        {list('menu')}
      </details>

      <nav className="toc-rail hidden xl:block">
        <p className="toc-title">On this page</p>
        <div className="relative">
          <span className="toc-track" aria-hidden="true" />
          <motion.span
            className="toc-progress"
            aria-hidden="true"
            style={{ scaleY: reduceMotion ? scrollYProgress : progress }}
          />
          {list('rail')}
        </div>
        <a href="#" className="toc-top">
          Back to top ↑
        </a>
      </nav>
    </aside>
  );
}
