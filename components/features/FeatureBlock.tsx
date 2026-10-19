import type { Feature } from "@/lib/features";

/**
 * One feature block: a real capture, the sourced copy, the real facts,
 * and — in a disclosure — the repo path the copy came from.
 */

function Shot({ feature }: { feature: Feature }) {
  const { shot } = feature;
  if (!shot) return null;
  const portrait = shot.widths[0] < 900 && /mobile/.test(shot.base);

  if (portrait) {
    return (
      <div className="flex justify-center">
        <figure className="shot w-[220px] shrink-0 rounded-[1.75rem] border-[5px] border-[#1a2333] p-0">
          <img
            src={`${shot.base}-900.webp`}
            srcSet={`${shot.base}-560.webp 560w, ${shot.base}-900.webp 900w`}
            sizes="220px"
            width={900}
            height={1400}
            alt={shot.alt}
            loading="lazy"
            decoding="async"
            className="h-auto w-full"
          />
        </figure>
      </div>
    );
  }

  return (
    <figure className="shot">
      <img
        src={`${shot.base}-900.webp`}
        srcSet={`${shot.base}-560.webp 560w, ${shot.base}-900.webp 900w, ${shot.base}-1600.webp 1600w`}
        sizes="(min-width: 1280px) 620px, (min-width: 768px) 50vw, 100vw"
        width={1600}
        height={1000}
        alt={shot.alt}
        loading="lazy"
        decoding="async"
        className="h-auto w-full"
      />
      {shot.caption ? (
        <figcaption className="absolute bottom-3 left-3 inline-flex items-center gap-2 rounded-lg border border-[var(--color-line-subtle)] bg-[rgba(3,7,13,0.86)] px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-secondary backdrop-blur">
          <span aria-hidden="true" className="h-1 w-1 rounded-full bg-accent" />
          {shot.caption}
        </figcaption>
      ) : null}
    </figure>
  );
}

export default function FeatureBlock({
  feature,
  index,
}: {
  feature: Feature;
  index: number;
}) {
  const flipped = index % 2 === 1;

  return (
    <article
      id={feature.id}
      className="scroll-mt-24 border-t border-[var(--color-line-subtle)] py-16 sm:py-20"
    >
      <div
        className={`grid items-center gap-10 lg:grid-cols-2 lg:gap-16 ${
          flipped ? "lg:[&>*:first-child]:order-2" : ""
        }`}
      >
        <div>
          <p className="eyebrow">
            {String(index + 1).padStart(2, "0")} — {feature.title}
          </p>
          <h3 className="mt-3 text-2xl font-semibold tracking-tight text-primary sm:text-[28px] sm:leading-[1.2]">
            {feature.lead}
          </h3>
          <p className="mt-4 text-[15px] leading-[1.7] text-secondary sm:text-base">
            {feature.body}
          </p>

          {feature.facts?.length ? (
            <ul className="mt-6 flex flex-wrap gap-2">
              {feature.facts.map((fact) => (
                <li
                  key={fact}
                  className="rounded-full border border-[var(--color-line-subtle)] bg-ink/60 px-3 py-1.5 text-xs text-secondary"
                >
                  {fact}
                </li>
              ))}
            </ul>
          ) : null}

          {feature.terminal === "cli" ? (
            <p className="mt-6 font-mono text-xs text-tertiary">
              <span className="text-accent">$</span> xr &quot;your task&quot; --budget 2.00
              --max-tokens 8000
            </p>
          ) : null}

          <details className="group mt-7 inline-block">
            <summary className="inline-flex min-h-11 cursor-pointer list-none items-center text-xs text-tertiary underline decoration-[var(--color-line)] underline-offset-4 transition hover:text-secondary">
              Where this comes from
            </summary>
            <p className="mt-2 max-w-md font-mono text-[11px] leading-relaxed text-tertiary">
              {feature.claim}
            </p>
          </details>
        </div>

        <div className={feature.terminal === "cli" ? "lg:pl-4" : "relative"}>
          <Shot feature={feature} />
        </div>
      </div>
    </article>
  );
}
