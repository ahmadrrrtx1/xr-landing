"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { nav, site } from "@/lib/site";
import GitHubStar from "./GitHubStar";

export default function Nav({ stars }: { stars: number }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header
      className={`sticky top-0 z-50 border-b transition-colors duration-200 ${
        scrolled
          ? "border-[var(--color-line-subtle)] bg-[rgba(3,7,13,0.86)] backdrop-blur-xl"
          : "border-transparent bg-transparent"
      }`}
    >
      <div className="shell flex h-16 items-center gap-3">
        <Link
          href="#top"
          className="flex min-h-11 shrink-0 items-center gap-2.5 rounded-lg py-1 pr-1"
          aria-label={`${site.name} — home`}
        >
          <img
            src="/brand/xr-mark.webp"
            alt=""
            width={36}
            height={24}
            className="h-6 w-auto"
            loading="eager"
          />
          <span className="font-mono text-sm font-semibold tracking-[0.18em] text-primary">
            XR
          </span>
        </Link>

        <nav aria-label="Primary" className="ml-4 hidden items-center gap-1 md:flex">
          {nav.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="inline-flex min-h-11 items-center rounded-lg px-3 py-2 text-sm text-secondary transition hover:bg-raised hover:text-primary"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex-1" />

        <div className="hidden items-center gap-2 md:flex">
          <GitHubStar stars={stars} />
          <a
            href="#waitlist"
            className="inline-flex h-11 items-center rounded-xl bg-gradient-to-b from-[var(--color-accent-hover)] to-[var(--color-accent)] px-4 text-sm font-semibold text-[var(--color-accent-contrast)] transition hover:brightness-110"
          >
            Join the waitlist
          </a>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="mobile-nav"
          className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-[var(--color-line)] text-primary md:hidden"
        >
          <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
          <svg
            aria-hidden="true"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          >
            {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
          </svg>
        </button>
      </div>

      {open ? (
        <div
          id="mobile-nav"
          className="border-t border-[var(--color-line-subtle)] bg-[rgba(3,7,13,0.97)] backdrop-blur-xl md:hidden"
        >
          <nav aria-label="Primary mobile" className="shell flex flex-col gap-1 py-4">
            {nav.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="flex min-h-11 items-center rounded-lg px-3 py-2 text-[15px] text-secondary hover:bg-raised hover:text-primary"
              >
                {item.label}
              </a>
            ))}
            <div className="mt-3 flex flex-col gap-2">
              <GitHubStar stars={stars} className="w-full justify-center" />
              <a
                href="#waitlist"
                onClick={() => setOpen(false)}
                className="inline-flex min-h-11 items-center justify-center rounded-xl bg-gradient-to-b from-[var(--color-accent-hover)] to-[var(--color-accent)] px-4 text-sm font-semibold text-[var(--color-accent-contrast)]"
              >
                Join the waitlist
              </a>
            </div>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
