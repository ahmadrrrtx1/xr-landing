/**
 * Site identity, navigation and outbound links.
 *
 * Every value here is either a fact in the XR repo or a fact about
 * rrrtx systems. Nothing is a placeholder except the two owner-TODOs
 * marked below, which are surfaced in the footer as such.
 */

export const site = {
  name: "XR",
  company: "rrrtx systems",
  /** The tagline baked into the official logo lockup. */
  tagline: "The AI Agent You Can Actually Trust",
  /** Verbatim from README.md line 40. */
  oneLiner:
    "A local-first, provider-neutral AI agent runtime. BYOK, spend-capped, tamper-evident audit, plugin/MCP extensibility.",
  description:
    "XR is a local-first, provider-neutral AI agent runtime. Give it a task: it plans, uses tools and changes real things on your machine — under a policy gate, your approval, a spend ceiling and a hash-chained log you can verify offline.",

  // The site's own address. NEXT_PUBLIC_SITE_URL is the single source of
  // truth — it drives the canonical tag, the Open Graph URL, the Twitter
  // card, the sitemap and the footer's link back to the site, so they
  // can never disagree with each other or with where the site is
  // actually served from.
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://xr-landing-eight.vercel.app",
  repo: "https://github.com/ahmadrrrtx/xr",
  npm: "https://www.npmjs.com/package/@rrrtx/xr",
  homepage: process.env.NEXT_PUBLIC_SITE_URL ?? "https://xr-landing-eight.vercel.app",

  agency: "https://rrrtx-systems.com",
  email: "hello@rrrtx-systems.com",

  version: "1.1.0",
  codename: "Graphite",
  license: "MIT",
} as const;

/**
 * Owner-TODOs. These are links we do not have yet; the footer renders
 * them as visible "TODO" markers rather than dead links.
 */
export const ownerTodos = {
  privacy: null as string | null,
  terms: null as string | null,
} as const;

export const nav = [
  { label: "Product", href: "#product" },
  { label: "Only XR", href: "#only-xr" },
  { label: "Preview", href: "#preview" },
  { label: "Pricing", href: "#pricing" },
  { label: "Feedback", href: "#feedback" },
  { label: "Docs", href: "https://github.com/ahmadrrrtx/xr#readme", external: true },
] as const;

/**
 * The install channels, verbatim from the README.
 *
 * These are deliberately NOT shown on the landing page right now. XR is
 * not released: the published npm artifact is 1.0.0 while the app the
 * site shows is 1.1.0 (Graphite), and the waitlist is the call to
 * action. They are kept here, sourced, so a later revision can put
 * them back with a version that matches what a visitor would get.
 */
export const install = {
  npm: "npm i -g @rrrtx/xr",
  local: "npm i @rrrtx/xr",
  github: "git clone https://github.com/ahmadrrrtx/xr",
} as const;

export const platformBadges = [
  "Linux",
  "macOS",
  "Windows",
  "Termux",
] as const;
