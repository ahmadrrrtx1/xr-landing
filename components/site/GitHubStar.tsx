import Link from "next/link";
import { site } from "@/lib/site";

/**
 * A live GitHub star button.
 *
 * The count is fetched from the GitHub API on the server and
 * revalidated hourly, so it is never a number someone typed. We do not
 * embed the third-party `gh-buttons` iframe: it is a third-party script
 * on a page that promises no third-party trackers.
 *
 * When the count is not known — the API is rate-limited, unreachable,
 * or the token has expired — the button shows a dash. It does not show
 * "0". A repository with six stars is not a repository with zero stars,
 * and a page that says otherwise is simply wrong.
 */
export default function GitHubStar({
  stars,
  className = "",
  variant = "default",
}: {
  stars: number | null;
  className?: string;
  variant?: "default" | "quiet";
}) {
  const base =
    "inline-flex h-11 shrink-0 items-center gap-2 whitespace-nowrap rounded-xl border border-[var(--color-line)] bg-ink/70 px-4 text-sm font-medium text-primary transition hover:border-[var(--color-line-accent)] hover:bg-raised";
  return (
    <Link
      href={site.repo}
      target="_blank"
      rel="noopener noreferrer"
      className={`${variant === "quiet" ? base : base} ${className}`}
      aria-label={
        stars === null
          ? `Star ${site.name} on GitHub`
          : `Star ${site.name} on GitHub — ${stars} ${stars === 1 ? "star" : "stars"}`
      }
    >
      <svg
        aria-hidden="true"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="text-accent"
      >
        <path d="M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.56v-2.2c-3.2.7-3.88-1.37-3.88-1.37-.53-1.34-1.29-1.7-1.29-1.7-1.05-.72.08-.71.08-.71 1.16.08 1.77 1.2 1.77 1.2 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.7 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.8 0c2.2-1.5 3.17-1.18 3.17-1.18.63 1.59.23 2.76.12 3.05.74.81 1.18 1.84 1.18 3.1 0 4.43-2.69 5.4-5.25 5.69.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5Z" />
      </svg>
      <span>Star on GitHub</span>
      <span className="tabular-nums text-tertiary" aria-hidden="true">
        {stars === null ? "—" : stars}
      </span>
    </Link>
  );
}
