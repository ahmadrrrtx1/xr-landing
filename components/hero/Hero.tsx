"use client";

import dynamic from "next/dynamic";
import { site } from "@/lib/site";
import NeuralField from "./NeuralField";
import VoiceMoment from "./VoiceMoment";
import WaitlistForm from "@/components/waitlist/WaitlistForm";
import GitHubStar from "@/components/site/GitHubStar";

/**
 * The hero is a client component so the WebGL energy field can be
 * code-split with `ssr: false`: the context, the shader and the first
 * frames never happen on the server and never sit on the critical path
 * for the largest contentful paint. Measured: keeping the hero as one
 * client boundary is faster than splitting it into several islands.
 */
const AvatarField = dynamic(() => import("./AvatarField"), {
  ssr: false,
  loading: () => null,
});

export default function Hero({ stars }: { stars: number }) {
  return (
    <section
      id="top"
      className="relative isolate overflow-hidden border-b border-[var(--color-line-subtle)]"
      style={{
        background:
          "radial-gradient(120% 90% at 62% 46%, rgba(0,90,130,0.16) 0%, transparent 62%), linear-gradient(180deg,#040A14 0%,#03070D 74%)",
      }}
    >
      {/* The cursor-reactive field. */}
      <NeuralField
        className="hero-field pointer-events-none absolute inset-0 h-full w-full"
        density={1}
      />

      <div className="shell relative z-10 grid gap-12 py-14 sm:py-20 lg:grid-cols-[minmax(0,1fr)_minmax(0,540px)] lg:items-center lg:gap-8 lg:py-24">
        {/* ── copy ─────────────────────────────────────────────── */}
        <div className="max-w-2xl">
          <picture>
            <source
              type="image/avif"
              srcSet="/brand/xr-lockup-480.avif 480w, /brand/xr-lockup.avif 900w"
            />
            <img
              src="/brand/xr-lockup-480.webp"
              srcSet="/brand/xr-lockup-480.webp 480w, /brand/xr-lockup.webp 900w"
              width={480}
              height={304}
              fetchPriority="high"
              decoding="async"
              alt="XR — The AI Agent You Can Actually Trust"
              className="h-auto w-[210px] sm:w-[240px]"
            />
          </picture>

          <p className="mt-7 inline-flex items-center gap-2.5 rounded-full border border-[var(--color-line-accent)] bg-[rgba(0,229,255,0.07)] px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-[#7fe9f7]">
            <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-accent shadow-[0_0_10px_2px_rgba(0,229,255,0.85)]" />
            Open source · MIT · Runs on your machine
          </p>

          <h1 className="mt-6 text-[34px] font-semibold leading-[1.08] tracking-[-0.03em] text-primary sm:text-[44px] lg:text-[52px]">
            Give it a task. It plans, uses tools, and{" "}
            <span className="text-accent-grad">changes real things</span>.
          </h1>

          <p className="mt-5 max-w-xl text-[15px] leading-[1.65] text-secondary sm:text-[17px]">
            Under a policy gate, your approval, a spend ceiling, and a hash-chained log you can{" "}
            <span className="text-metal">verify offline</span>. Bring your own model key — or run
            it fully local.
          </p>

          <div id="waitlist" className="mt-8 max-w-xl scroll-mt-24">
            <WaitlistForm source="hero" idPrefix="hero" />
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
            <GitHubStar stars={stars} />
            <p className="text-[13px] text-tertiary">
              XR isn&apos;t released yet — that is what the waitlist is for. The source is
              public under MIT.
            </p>
          </div>
        </div>

        {/* ── the avatar ───────────────────────────────────────── */}
        <div className="relative mx-auto w-full max-w-[540px]">
          <div className="relative aspect-square w-full">
            {/* The halo the character stands in. */}
            <div
              aria-hidden="true"
              className="xr-halo pointer-events-none absolute left-1/2 top-1/2 h-[86%] w-[86%] -translate-x-1/2 -translate-y-1/2 rounded-full"
              style={{
                background:
                  "radial-gradient(closest-side, rgba(0,196,255,0.30) 0%, rgba(0,130,190,0.16) 42%, rgba(0,0,0,0) 74%)",
                filter: "blur(22px)",
              }}
            />

            {/* Orbital rings — elliptical, like the emblem's, and they turn. */}
            <div
              aria-hidden="true"
              className="xr-orbit pointer-events-none absolute left-1/2 top-1/2 h-[34%] w-[112%] -translate-x-1/2 -translate-y-1/2"
            >
              <div className="h-full w-full rounded-[50%] border border-[rgba(0,229,255,0.22)]" />
            </div>
            <div
              aria-hidden="true"
              className="xr-orbit-reverse pointer-events-none absolute left-1/2 top-1/2 h-[50%] w-[132%] -translate-x-1/2 -translate-y-1/2"
            >
              <div className="h-full w-full rounded-[50%] border border-dashed border-[rgba(0,229,255,0.13)]" />
            </div>
            <div
              aria-hidden="true"
              className="pointer-events-none absolute left-1/2 top-1/2 aspect-square w-[104%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[rgba(0,229,255,0.10)]"
            />

            {/* The energy field, behind the character. */}
            <AvatarField className="absolute inset-0 h-full w-full" />

            {/* The shadow the character stands in. */}
            <div
              aria-hidden="true"
              className="xr-shadow-pool pointer-events-none absolute bottom-[6%] left-1/2 h-[14%] w-[62%] -translate-x-1/2"
            />

            {/* The owner's avatar — the real 4× master, resampled.
                Same artwork, alive: a slow float and a slow swell. */}
            <div className="xr-avatar-float relative">
              <picture className="xr-avatar-breathe relative block">
                <source
                  type="image/avif"
                  srcSet="/brand/xr-avatar-520.avif 520w, /brand/xr-avatar-760.avif 760w, /brand/xr-avatar-1100.avif 1100w"
                  sizes="(min-width: 1024px) 540px, 90vw"
                />
                <img
                  src="/brand/xr-avatar-760.webp"
                  srcSet="/brand/xr-avatar-520.webp 520w, /brand/xr-avatar-760.webp 760w, /brand/xr-avatar-1100.webp 1100w"
                  sizes="(min-width: 1024px) 540px, 90vw"
                  width={760}
                  height={666}
                  fetchPriority="high"
                  decoding="async"
                  alt="XR — the character: a dark helmeted figure with glowing cyan eyes, energy tendrils rising from a bright core at its chest"
                  className="relative h-auto w-full select-none"
                  style={{
                    filter:
                      "drop-shadow(0 0 34px rgba(0,205,255,0.5)) drop-shadow(0 0 90px rgba(0,150,210,0.34)) drop-shadow(0 34px 70px rgba(0,0,0,0.62))",
                  }}
                />
              </picture>
            </div>
          </div>

          <div className="mt-6 rounded-xl border border-[var(--color-line-subtle)] bg-ink/60 p-4">
            <VoiceMoment />
          </div>
        </div>
      </div>
    </section>
  );
}
