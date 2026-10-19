import Link from "next/link";
import { site } from "@/lib/site";

export default function NotFound() {
  return (
    <div className="shell flex min-h-[70vh] flex-col items-center justify-center py-24 text-center">
      <p className="eyebrow">404</p>
      <h1 className="mt-4 text-3xl font-semibold tracking-tight text-primary sm:text-4xl">
        That page does not exist
      </h1>
      <p className="mt-4 max-w-md text-[15px] leading-relaxed text-secondary">
        The links below are the ones that exist. If you followed a link from somewhere else,
        the code is on GitHub.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link
          href="/"
          className="inline-flex h-11 items-center justify-center rounded-xl bg-gradient-to-b from-[var(--color-accent-hover)] to-[var(--color-accent)] px-5 text-sm font-semibold text-[var(--color-accent-contrast)]"
        >
          Back to the top
        </Link>
        <a
          href={site.repo}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-11 items-center justify-center rounded-xl border border-[var(--color-line)] bg-ink/70 px-5 text-sm font-medium text-primary hover:border-[var(--color-line-accent)]"
        >
          GitHub
        </a>
      </div>
    </div>
  );
}
