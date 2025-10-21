"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

export default function NavBar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => {
    return pathname === path;
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 bg-neutral-900/95 backdrop-blur-sm border-b border-neutral-800" aria-label="Main navigation">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo/Name */}
          <Link 
            href="/" 
            className="text-xl font-bold text-gray-100 hover:text-blue-400 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-neutral-900 rounded-sm px-1"
            aria-label="Home - Sheiphan Joseph Portfolio"
          >
            Sheiphan Joseph
          </Link>

          {/* Mobile menu button */}
          <button
            type="button"
            className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-300 hover:text-blue-400 hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-400 transition-colors duration-200"
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-menu"
            aria-label="Toggle navigation menu"
            onClick={toggleMobileMenu}
          >
            <span className="sr-only">{mobileMenuOpen ? "Close menu" : "Open menu"}</span>
            {/* Hamburger icon */}
            {!mobileMenuOpen ? (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            ) : (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
          </button>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-6 lg:gap-8">
            <Link
              href="/"
              className={`relative text-sm font-medium transition-colors duration-200 hover:text-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-neutral-900 rounded-sm px-1 ${
                isActive("/") ? "text-blue-400" : "text-gray-300"
              }`}
              aria-current={isActive("/") ? "page" : undefined}
            >
              Home
              {isActive("/") && (
                <span className="absolute -bottom-[21px] left-0 right-0 h-0.5 bg-blue-400" aria-hidden="true" />
              )}
            </Link>
            <Link
              href="/projects"
              className={`relative text-sm font-medium transition-colors duration-200 hover:text-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-neutral-900 rounded-sm px-1 ${
                isActive("/projects") || pathname?.startsWith("/projects/")
                  ? "text-blue-400"
                  : "text-gray-300"
              }`}
              aria-current={isActive("/projects") || pathname?.startsWith("/projects/") ? "page" : undefined}
            >
              Projects
              {(isActive("/projects") || pathname?.startsWith("/projects/")) && (
                <span className="absolute -bottom-[21px] left-0 right-0 h-0.5 bg-blue-400" aria-hidden="true" />
              )}
            </Link>
            <Link
              href="/updates"
              className={`relative text-sm font-medium transition-colors duration-200 hover:text-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-neutral-900 rounded-sm px-1 ${
                isActive("/updates") || pathname?.startsWith("/updates/")
                  ? "text-blue-400"
                  : "text-gray-300"
              }`}
              aria-current={isActive("/updates") || pathname?.startsWith("/updates/") ? "page" : undefined}
            >
              Updates
              {(isActive("/updates") || pathname?.startsWith("/updates/")) && (
                <span className="absolute -bottom-[21px] left-0 right-0 h-0.5 bg-blue-400" aria-hidden="true" />
              )}
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden" id="mobile-menu">
          <div className="px-2 pt-2 pb-3 space-y-1 border-t border-neutral-800 bg-neutral-900">
            <Link
              href="/"
              onClick={closeMobileMenu}
              className={`block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 hover:text-blue-400 hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-400 ${
                isActive("/") ? "text-blue-400 bg-neutral-800" : "text-gray-300"
              }`}
              aria-current={isActive("/") ? "page" : undefined}
            >
              Home
            </Link>
            <Link
              href="/projects"
              onClick={closeMobileMenu}
              className={`block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 hover:text-blue-400 hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-400 ${
                isActive("/projects") || pathname?.startsWith("/projects/")
                  ? "text-blue-400 bg-neutral-800"
                  : "text-gray-300"
              }`}
              aria-current={isActive("/projects") || pathname?.startsWith("/projects/") ? "page" : undefined}
            >
              Projects
            </Link>
            <Link
              href="/updates"
              onClick={closeMobileMenu}
              className={`block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 hover:text-blue-400 hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-400 ${
                isActive("/updates") || pathname?.startsWith("/updates/")
                  ? "text-blue-400 bg-neutral-800"
                  : "text-gray-300"
              }`}
              aria-current={isActive("/updates") || pathname?.startsWith("/updates/") ? "page" : undefined}
            >
              Updates
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
