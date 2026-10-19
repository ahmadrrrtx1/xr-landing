import Link from "next/link";
import { ownerTodos, site } from "@/lib/site";

/**
 * The footer.
 *
 * Two links are marked as owner-TODOs rather than pointing at pages
 * that do not exist: the privacy policy and the terms. Both are shown
 * as visible markers so nobody mistakes a missing page for a legal
 * document.
 */
export default function Footer({ stars }: { stars: number }) {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-[var(--color-line-subtle)] bg-ink/40">
      <div className="shell py-14">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-2.5">
              <img src="/brand/xr-mark.webp" alt="" width={32} height={22} className="h-5 w-auto" />
              <span className="font-mono text-sm font-semibold tracking-[0.18em] text-primary">
                XR
              </span>
            </div>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-secondary">
              {site.oneLiner}
            </p>
            <p className="mt-4 text-xs text-tertiary">
              {site.version} ({site.codename}) · {site.license} · by {site.company}
            </p>
          </div>

          <nav aria-label="Product">
            <h2 className="eyebrow">Product</h2>
            <ul className="mt-3 space-y-1">
              {[
                { label: "Features", href: "#product" },
                { label: "Only XR", href: "#only-xr" },
                { label: "Interactive preview", href: "#preview" },
                { label: "Pricing", href: "#pricing" },
                { label: "Get started", href: "#get-started" },
              ].map((l) => (
                <li key={l.href}>
                  <a
                    href={l.href}
                    className="inline-flex min-h-11 items-center text-sm text-secondary hover:text-primary"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Code">
            <h2 className="eyebrow">Code</h2>
            <ul className="mt-3 space-y-1">
              <li>
                <a
                  href={site.repo}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-11 items-center text-sm text-secondary hover:text-primary"
                >
                  GitHub — {stars} stars
                </a>
              </li>
              <li>
                <a
                  href={site.npm}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-11 items-center text-sm text-secondary hover:text-primary"
                >
                  npm — @rrrtx/xr
                </a>
              </li>
              <li>
                <a
                  href={site.homepage}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-11 items-center text-sm text-secondary hover:text-primary"
                >
                  Product site
                </a>
              </li>
            </ul>
          </nav>

          <nav aria-label="Company">
            <h2 className="eyebrow">Company</h2>
            <ul className="mt-3 space-y-1">
              <li>
                <a
                  href={site.agency}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-11 items-center text-sm text-secondary hover:text-primary"
                >
                  rrrtx systems
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${site.email}`}
                  className="inline-flex min-h-11 items-center text-sm text-secondary hover:text-primary"
                >
                  {site.email}
                </a>
              </li>
              <li>
                <span className="inline-flex min-h-11 items-center gap-2 text-sm text-tertiary">
                  Privacy
                  <span className="rounded border border-[var(--color-line)] px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider">
                    owner TODO
                  </span>
                </span>
              </li>
              <li>
                <span className="inline-flex min-h-11 items-center gap-2 text-sm text-tertiary">
                  Terms
                  <span className="rounded border border-[var(--color-line)] px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider">
                    owner TODO
                  </span>
                </span>
              </li>
            </ul>
          </nav>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-[var(--color-line-subtle)] pt-6 text-xs text-tertiary sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {site.company}. XR is open source under the {site.license} licence.
          </p>
          <p>
            A product of{" "}
            <a
              href={site.agency}
              target="_blank"
              rel="noopener noreferrer"
              className="text-secondary underline decoration-[var(--color-line)] underline-offset-4 hover:text-primary"
            >
              rrrtx systems
            </a>
            .
          </p>
        </div>
      </div>
    </footer>
  );
}
