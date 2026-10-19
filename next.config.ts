import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";

/**
 * Security headers for every response.
 *
 * The CSP keeps Next's own runtime working — the framework ships an inline
 * bootstrap script and inline <style> tags — so `script-src` / `style-src`
 * allow `'unsafe-inline'` on `'self'` only, and `'unsafe-eval'` exists
 * solely outside production (the dev bundler needs it).
 *
 * `img-src` permits `https:` because the waitlist page may be screenshotted
 * with operator-supplied artwork, and `media-src` allows `blob:` so the
 * recorded product tour can stream from a blob URL. Nothing is widened
 * beyond what the page actually loads.
 *
 * `docs.google.com` is the one third party the page can reach, and only
 * for the "what should we build next" feedback form. The browser posts
 * the answer to this site's own `/api/feedback` route — `connect-src`
 * stays at `'self'`, so the page never talks to Google directly — and the
 * server forwards it. `form-action` covers the no-JavaScript fallback
 * that posts straight to Google, and `frame-src` lets Google's own form
 * be embedded when the site is given a form id without an entry id. It is
 * the same host for both, and nothing else is opened.
 */
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
  },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      `script-src 'self' 'unsafe-inline'${isProd ? "" : " 'unsafe-eval'"}`,
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https:",
      "font-src 'self' data:",
      "media-src 'self' blob:",
      "connect-src 'self'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self' https://docs.google.com",
      "frame-src 'self' https://docs.google.com",
      "frame-ancestors 'none'",
    ].join("; "),
  },
  ...(isProd
    ? [
        {
          key: "Strict-Transport-Security",
          value: "max-age=63072000; includeSubDomains; preload",
        },
      ]
    : []),
];

const nextConfig: NextConfig = {
  productionBrowserSourceMaps: false,
  reactStrictMode: true,
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
  async redirects() {
    return [];
  },
};

export default nextConfig;
