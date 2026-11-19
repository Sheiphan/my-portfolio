"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import ThemeToggle from "./ThemeToggle";
import FlockToggle from "./FlockToggle";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/experience", label: "Experience" },
  { href: "/projects", label: "Projects" },
  { href: "/updates", label: "Updates" },
];

function Squiggle() {
  return (
    <svg className="squiggle" viewBox="0 0 100 10" preserveAspectRatio="none" aria-hidden="true">
      <path
        d="M2 6 C15 2 25 9 38 5 S62 2 75 6 S92 8 98 4"
        pathLength={1}
        className="ink-stroke"
        fill="none"
        stroke="var(--color-pink)"
        strokeWidth={3}
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function NavBar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname?.startsWith(`${href}/`);

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <header className="site-header sticky top-0 z-50">
      <nav
        className="mx-auto flex h-[68px] max-w-[1440px] items-center gap-4 px-4 sm:px-8 md:h-[76px] lg:px-14"
        aria-label="Main navigation"
      >
        <Link href="/" className="wordmark" onClick={closeMobileMenu}>
          Sheiphan Joseph
        </Link>

        <ul className="ml-auto hidden items-center gap-1 md:flex">
          {LINKS.map((link) => (
            <li key={link.href}>
              <Link href={link.href} className="nav-link" aria-current={isActive(link.href) ? "page" : undefined}>
                {link.label}
                <Squiggle />
              </Link>
            </li>
          ))}
        </ul>

        <div className="ml-auto flex items-center gap-4 md:ml-3">
          <FlockToggle />
          <ThemeToggle />
        </div>

        <button
          type="button"
          className="menu-button md:hidden"
          aria-expanded={mobileMenuOpen}
          aria-controls="mobile-menu"
          onClick={() => setMobileMenuOpen((open) => !open)}
        >
          <span className="sr-only">{mobileMenuOpen ? "Close menu" : "Open menu"}</span>
          <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            {mobileMenuOpen ? (
              <path strokeLinecap="round" strokeWidth={2.5} d="M6 18 18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeWidth={2.5} d="M4 7c5-1 11 1 16 0M4 12.5c6-1 10 1 16-.5M4 18c5-1 11 .5 16 0" />
            )}
          </svg>
        </button>
      </nav>

      <svg className="block h-[6px] w-full" viewBox="0 0 1000 6" preserveAspectRatio="none" aria-hidden="true">
        <path d="M0 3 C200 1 400 5 600 3 S900 1 1000 3.5" fill="none" stroke="var(--color-ink)" strokeWidth={2} />
      </svg>

      {mobileMenuOpen && (
        <div id="mobile-menu" className="mobile-drawer md:hidden">
          <ul className="flex flex-col px-4 py-2 sm:px-8">
            {LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={closeMobileMenu}
                  className="mobile-link"
                  aria-current={isActive(link.href) ? "page" : undefined}
                >
                  {link.label}
                </Link>
              </li>
            ))}
            <li>
              <FlockToggle variant="row" />
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}
