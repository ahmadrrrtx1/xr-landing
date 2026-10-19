import { pricing } from "@/lib/features";

/**
 * Pricing, in the repo's own language.
 *
 * Personal is free forever with every local feature. Business is
 * $15/user/month or $144/user/year. Enterprise is quoted per contract
 * with NET 30 terms. No invented quotas, no invented SLA, no
 * "contact sales for everything".
 */
export default function Pricing() {
  const tiers = [
    { ...pricing.personal, featured: false },
    { ...pricing.business, featured: true },
    { ...pricing.enterprise, featured: false },
  ];

  return (
    <section id="pricing" className="scroll-mt-24 border-t border-[var(--color-line-subtle)] py-20 sm:py-24">
      <div className="shell">
        <div className="max-w-2xl">
          <p className="eyebrow">Pricing</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-primary sm:text-4xl sm:leading-[1.12]">
            Free for the person. Priced for the team.
          </h2>
          <p className="mt-4 text-[15px] leading-[1.7] text-secondary sm:text-base">
            No local feature is paywalled, ever. BYOK stays free and direct — the paid tier buys
            the team layer, not the agent.
          </p>
        </div>

        <div className="mt-12 grid gap-5 lg:grid-cols-3">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={`card relative flex flex-col p-6 ${
                tier.featured
                  ? "border-[var(--color-line-accent)] shadow-[0_0_0_1px_rgba(0,229,255,0.28),0_30px_80px_-50px_rgba(0,229,255,0.6)]"
                  : ""
              }`}
            >
              {tier.featured ? (
                <span className="absolute -top-3 left-6 rounded-full border border-[var(--color-line-accent)] bg-ink px-3 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-accent">
                  For teams
                </span>
              ) : null}

              <h3 className="text-lg font-semibold text-primary">{tier.name}</h3>

              <p className="mt-4 flex items-baseline gap-2">
                <span className="text-4xl font-semibold tracking-tight text-primary">
                  {tier.price}
                </span>
                <span className="text-sm text-tertiary">{tier.unit}</span>
              </p>
              {"annual" in tier && tier.annual ? (
                <p className="mt-1 text-sm text-secondary">{tier.annual}</p>
              ) : null}

              <p className="mt-4 text-[14px] leading-[1.65] text-secondary">{tier.summary}</p>

              <ul className="mt-6 flex-1 space-y-2.5">
                {tier.includes.map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-[14px] leading-snug text-secondary">
                    <svg
                      aria-hidden="true"
                      width="15"
                      height="15"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="var(--color-accent)"
                      strokeWidth="2.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="mt-0.5 shrink-0"
                    >
                      <path d="m4 12 5 5L20 6" />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>

              <p className="mt-6 border-t border-[var(--color-line-subtle)] pt-4 text-xs leading-relaxed text-tertiary">
                {tier.footnote}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
