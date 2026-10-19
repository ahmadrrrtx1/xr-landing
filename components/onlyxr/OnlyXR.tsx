"use client";

import { useCallback } from "react";
import { onlyXr } from "@/lib/features";

/**
 * "Only XR" — the shortlist of capabilities the repo does that a
 * comparable local agent runner does not.
 *
 * Where the repo itself sets a limit, the limit is printed next to the
 * claim. That asymmetry is the point: the section earns trust by
 * refusing to hide the catch.
 *
 * The cards answer the pointer. The spotlight is a radial gradient
 * that follows the cursor inside each card, so the card lights up
 * where you are looking at it rather than all at once.
 */
export default function OnlyXR() {
  const track = useCallback((event: React.PointerEvent<HTMLLIElement>) => {
    const el = event.currentTarget;
    const rect = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${event.clientX - rect.left}px`);
    el.style.setProperty("--my", `${event.clientY - rect.top}px`);
  }, []);

  return (
    <section
      id="only-xr"
      className="scroll-mt-24 border-t border-[var(--color-line-subtle)] py-20 sm:py-24"
    >
      <div className="shell">
        <div className="max-w-2xl">
          <p className="eyebrow">Only XR</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-primary sm:text-4xl sm:leading-[1.12]">
            The things XR does that other local agent runners do not
          </h2>
          <p className="mt-4 text-[15px] leading-[1.7] text-secondary sm:text-base">
            Every item here is a feature in the repository, not a roadmap item. Where the repo
            itself documents a limit, the limit is printed with the claim.
          </p>
        </div>

        <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {onlyXr.map((item, i) => (
            <li
              key={item.title}
              onPointerMove={track}
              tabIndex={0}
              className="only-card card group relative overflow-hidden p-5 focus-visible:border-[var(--color-line-accent)]"
            >
              {/* The spotlight that follows the pointer. */}
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-within:opacity-100"
                style={{
                  background:
                    "radial-gradient(280px circle at var(--mx, 50%) var(--my, 50%), rgba(0,229,255,0.13), transparent 68%)",
                }}
              />

              <span
                aria-hidden="true"
                className="only-num relative font-mono text-[11px] tabular-nums text-accent/70"
              >
                {String(i + 1).padStart(2, "0")}
              </span>

              <span
                aria-hidden="true"
                className="only-rule relative mt-2 block h-px w-8 bg-[var(--color-line)]"
              />

              <h3 className="only-title relative mt-3 text-[15px] font-semibold leading-snug text-primary">
                {item.title}
              </h3>
              <p className="relative mt-2 text-[13.5px] leading-[1.65] text-secondary">
                {item.body}
              </p>
              {item.caveat ? (
                <p className="relative mt-3 inline-flex items-start gap-2 rounded-md border border-[var(--color-line-subtle)] bg-void/60 px-2.5 py-1.5 text-[12px] leading-snug text-tertiary">
                  <span
                    aria-hidden="true"
                    className="mt-1 block h-1 w-1 shrink-0 rounded-full bg-warning"
                  />
                  {item.caveat}
                </p>
              ) : null}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
