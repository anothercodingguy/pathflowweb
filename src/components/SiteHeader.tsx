"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, ExternalLink, Menu, X } from "lucide-react";

/*
  Site header.

  Desktop (lg, 1024px and up): logo, section links, GitHub icon, primary CTA.
  Phone and tablet: logo, primary CTA, and a menu button that opens the section
  links. (The full link row does not fit below 1024px.)

  The phone menu is a "disclosure": a button with aria-expanded that shows or
  hides a <nav>. That is the right pattern for a list of links (role="menu" is
  for application menus). Esc closes it and returns focus to the button.
*/

const GITHUB_URL = "https://github.com/anothercodingguy/pathflow";

const NAV_LINKS = [
  { href: "#product", label: "Product" },
  { href: "#screenshots", label: "Screenshots" },
  { href: "#how-it-works", label: "How it works" },
  { href: "#capabilities", label: "Capabilities" },
  { href: "#why-pathflow", label: "Comparison" },
  { href: "#pricing", label: "Pricing" },
];

export default function SiteHeader({ appUrl }: { appUrl: string }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  // Show the hairline under the header once the page has moved.
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 8);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // While the phone menu is open: Esc closes it, and so does growing the window to desktop width.
  useEffect(() => {
    if (!menuOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        menuButtonRef.current?.focus();
      }
    };
    const desktop = window.matchMedia("(min-width: 1024px)");
    const handleResize = () => {
      if (desktop.matches) setMenuOpen(false);
    };

    document.addEventListener("keydown", handleKeyDown);
    desktop.addEventListener("change", handleResize);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      desktop.removeEventListener("change", handleResize);
    };
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);

  return (
    <header
      className={`fixed top-0 left-0 w-full z-50 border-b transition-colors duration-200 ${
        menuOpen
          ? "bg-background border-black/[0.06] shadow-lg"
          : scrolled
            ? "glass-nav border-black/[0.06]"
            : "bg-transparent border-transparent"
      }`}
    >
      <div className="bw-container flex h-16 items-center justify-between gap-3">
        {/* Brand Logo */}
        <Link href="/" className="flex shrink-0 items-center gap-2.5 rounded-md">
          <span className="font-extrabold tracking-tight text-text-1 text-lg uppercase font-sans flex items-center gap-0.5">
            PATH<span className="text-accent">FLOW</span>
          </span>
          <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-surface-2 text-text-2 border border-border">
            v1.0
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <nav aria-label="Primary" className="hidden lg:flex items-center gap-6 xl:gap-7 text-sm font-medium text-text-2">
          {NAV_LINKS.map((link) => (
            <a key={link.href} href={link.href} className="rounded-sm hover:text-text-1 transition-colors">
              {link.label}
            </a>
          ))}
          <a
            href={`${GITHUB_URL}#readme`}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-sm hover:text-text-1 transition-colors"
          >
            Docs
          </a>
        </nav>

        <div className="flex shrink-0 items-center gap-1.5 lg:gap-3">
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub Repository"
            className="hidden lg:inline-flex text-text-2 hover:text-text-1 transition-colors p-2 rounded-lg hover:bg-black/5"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor" aria-hidden="true">
              <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
            </svg>
          </a>

          {/* Primary CTA: visible at every width */}
          <a href={appUrl} className="btn-primary py-2 px-3.5 text-xs font-semibold tracking-wide whitespace-nowrap">
            Open PathFlow <ArrowRight className="h-3.5 w-3.5 ml-0.5" />
          </a>

          {/* Phone menu button */}
          <button
            ref={menuButtonRef}
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            className="lg:hidden inline-flex h-11 w-11 items-center justify-center rounded-lg text-text-1 hover:bg-black/5"
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Phone navigation panel */}
      <nav
        id="mobile-nav"
        aria-label="Primary"
        hidden={!menuOpen}
        className="lg:hidden border-t border-border max-h-[calc(100dvh-4rem)] overflow-y-auto"
      >
        <ul className="bw-container py-2 text-[15px] font-medium text-text-1">
          {NAV_LINKS.map((link) => (
            <li key={link.href} className="border-b border-border-subtle">
              <a href={link.href} onClick={closeMenu} className="flex min-h-11 items-center rounded-sm hover:text-accent transition-colors">
                {link.label}
              </a>
            </li>
          ))}
          <li className="border-b border-border-subtle">
            <a
              href={`${GITHUB_URL}#readme`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={closeMenu}
              className="flex min-h-11 items-center rounded-sm hover:text-accent transition-colors"
            >
              Documentation
            </a>
          </li>
          <li>
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={closeMenu}
              className="flex min-h-11 items-center justify-between rounded-sm text-text-2 hover:text-accent transition-colors"
            >
              <span>GitHub Repository</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </li>
        </ul>
      </nav>
    </header>
  );
}
