import Hero from "@/components/hero/Hero";
import TourVideo from "@/components/tour/TourVideo";
import FeatureBlock from "@/components/features/FeatureBlock";
import OnlyXR from "@/components/onlyxr/OnlyXR";
import TerminalReplay from "@/components/preview/TerminalReplay";
import OnboardingStrip from "@/components/onboarding/OnboardingStrip";
import Pricing from "@/components/pricing/Pricing";
import WaitlistForm from "@/components/waitlist/WaitlistForm";
import GitHubStar from "@/components/site/GitHubStar";
import { features } from "@/lib/features";
import { getRepoFacts } from "@/lib/github";
import { site } from "@/lib/site";

export default async function Page() {
  const repo = await getRepoFacts();

  return (
    <>
      <Hero stars={repo.stars} />

      {/* ── the product tour ───────────────────────────────────── */}
      <section className="border-b border-[var(--color-line-subtle)] bg-ink/30 py-16 sm:py-20">
        <div className="shell">
          <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <p className="eyebrow">37 seconds</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-primary sm:text-4xl sm:leading-[1.12]">
                XR, answering
              </h2>
              <p className="mt-4 text-[15px] leading-[1.7] text-secondary sm:text-base">
                A real recorded run: the desktop app takes a question, answers it with a live
                provider, and the budget screen shows what it cost. Then the mobile app, doing
                the same thing from a phone.
              </p>
            </div>
            <p className="shrink-0 rounded-full border border-[var(--color-line-subtle)] bg-void/50 px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-tertiary">
              Recording of the real app
            </p>
          </div>

          <figure className="shot">
            <TourVideo />
            <figcaption className="border-t border-[var(--color-line-subtle)] px-4 py-3 text-xs leading-relaxed text-tertiary">
              Recorded from the running application. The provider shown was one configured
              machine&apos;s choice — XR is BYOK, so the model is yours, not ours.
            </figcaption>
          </figure>
        </div>
      </section>

      {/* ── the features ───────────────────────────────────────── */}
      <section id="product" className="scroll-mt-24">
        <div className="shell pt-16 sm:pt-20">
          <div className="max-w-2xl">
            <p className="eyebrow">Product</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-primary sm:text-4xl sm:leading-[1.12]">
              One runtime, twelve surfaces
            </h2>
            <p className="mt-4 text-[15px] leading-[1.7] text-secondary sm:text-base">
              Every screen below was captured from the running application. Each block names the
              repository path its copy comes from.
            </p>
          </div>
        </div>

        {features.map((feature, index) => (
          <div key={feature.id} className="shell">
            <FeatureBlock feature={feature} index={index} />
          </div>
        ))}
      </section>

      <OnlyXR />

      {/* ── the interactive preview ─────────────────────────────── */}
      <section
        id="preview"
        className="scroll-mt-24 border-t border-[var(--color-line-subtle)] py-20 sm:py-24"
      >
        <div className="shell grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:items-center lg:gap-16">
          <div>
            <p className="eyebrow">Interactive preview</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-primary sm:text-4xl sm:leading-[1.12]">
              The real transcript, not a mock-up
            </h2>
            <p className="mt-4 text-[15px] leading-[1.7] text-secondary sm:text-base">
              This is a <span className="text-metal">recording</span> of an actual XR session:
              a task given on the command line, the tool call it made, the answer the model
              returned, the audit chain it wrote, the caps it was running under, and the provider
              that served it.
            </p>
            <p className="mt-4 text-[15px] leading-[1.7] text-secondary sm:text-base">
              The raw capture is in the repository, so the transcript can be checked against the
              bytes:
            </p>
            <ul className="mt-5 space-y-2 font-mono text-[12.5px]">
              <li>
                <a
                  href="/cli/xr-session.txt"
                  className="text-accent underline decoration-[var(--color-line-accent)] underline-offset-4"
                >
                  /cli/xr-session.txt
                </a>{" "}
                <span className="text-tertiary">— the cleaned transcript</span>
              </li>
              <li>
                <a
                  href="/cli/xr-session.raw"
                  className="text-accent underline decoration-[var(--color-line-accent)] underline-offset-4"
                >
                  /cli/xr-session.raw
                </a>{" "}
                <span className="text-tertiary">— the raw ANSI capture</span>
              </li>
            </ul>
            <p className="mt-6 text-sm leading-relaxed text-tertiary">
              It is not a live demo and it is not scripted for effect. It is one run, on one
              machine, with one provider configured.
            </p>
          </div>

          <TerminalReplay />
        </div>
      </section>

      <OnboardingStrip />

      <Pricing />

      {/* ── final CTA ───────────────────────────────────────────── */}
      <section
        id="cta"
        className="relative isolate overflow-hidden border-t border-[var(--color-line-subtle)] py-20 sm:py-28"
        style={{
          background:
            "radial-gradient(90% 120% at 50% 120%, rgba(0,229,255,0.14) 0%, transparent 60%)",
        }}
      >
        <div className="shell relative z-10 mx-auto max-w-2xl text-center">
          <p className="eyebrow">Get in</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-primary sm:text-[40px] sm:leading-[1.1]">
            {site.tagline}
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-[15px] leading-[1.7] text-secondary sm:text-base">
            The code is public and MIT. The release is not out yet — the waitlist is how you hear
            about it first. One email, and only that.
          </p>

          <div className="mx-auto mt-9 max-w-xl text-left">
            <WaitlistForm source="footer" idPrefix="footer" />
          </div>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <GitHubStar stars={repo.stars} />
            <a
              href={`${site.repo}#readme`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-11 items-center gap-2 rounded-xl border border-[var(--color-line)] bg-ink/70 px-4 text-sm font-medium text-primary transition hover:border-[var(--color-line-accent)] hover:bg-raised"
            >
              Read the source
              <svg
                aria-hidden="true"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-tertiary"
              >
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
