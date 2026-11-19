import type { CSSProperties } from 'react';
import { SOCIAL_LINKS } from '@/lib/social';

interface SocialLinksProps {
  /** "icons": round sticker buttons (hero). "labeled": icon plus name (footer). */
  variant?: 'icons' | 'labeled';
  className?: string;
}

/** GitHub, LinkedIn and YouTube as hand-drawn stickers that wobble on hover. */
export default function SocialLinks({ variant = 'labeled', className = '' }: SocialLinksProps) {
  return (
    <ul className={`flex flex-wrap items-center gap-3 ${className}`} aria-label="Elsewhere">
      {SOCIAL_LINKS.map((link, index) => (
        <li key={link.id} className="social-item" style={{ '--i': index } as CSSProperties}>
          <a
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className={`social-link is-${link.id} ${variant === 'icons' ? 'is-icon' : ''}`}
            aria-label={variant === 'icons' ? `${link.label} (opens in new tab)` : undefined}
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0" fill="currentColor" aria-hidden="true">
              <path d={link.icon} />
            </svg>
            {variant === 'labeled' && (
              <>
                <span>{link.label}</span>
                <span className="sr-only"> (opens in new tab)</span>
              </>
            )}
          </a>
        </li>
      ))}
    </ul>
  );
}
