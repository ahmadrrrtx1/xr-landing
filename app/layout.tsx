import type { Metadata, Viewport } from "next";
import "./globals.css";
import { site } from "@/lib/site";
import { getRepoFacts } from "@/lib/github";
import Nav from "@/components/site/Nav";
import Footer from "@/components/site/Footer";

export async function generateMetadata(): Promise<Metadata> {
  const repo = await getRepoFacts();
  const title = `${site.name} — ${site.tagline}`;
  const description = site.description;
  const canonical = site.url;

  return {
    metadataBase: new URL(site.url),
    title: {
      default: title,
      template: `%s — ${site.name}`,
    },
    description,
    applicationName: site.name,
    authors: [{ name: site.company, url: site.agency }],
    creator: site.company,
    publisher: site.company,
    keywords: [
      "AI agent",
      "local-first AI",
      "BYOK",
      "self-hosted AI agent",
      "spend caps",
      "audit log",
      "open source AI agent",
      "XR",
    ],
    alternates: { canonical },
    openGraph: {
      type: "website",
      url: canonical,
      siteName: site.name,
      title,
      description,
      locale: "en_US",
      images: [
        {
          url: "/og.jpg",
          width: 1200,
          height: 630,
          alt: `${site.name} — ${site.tagline}. The XR character above a terminal running a real XR session.`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/og.jpg"],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, "max-image-preview": "large" },
    },
    icons: {
      icon: [{ url: "/brand/xr-mark.webp", type: "image/webp" }],
      apple: [{ url: "/apple-touch-icon.png" }],
    },
    manifest: "/manifest.webmanifest",
    other: {
      // Only when we actually know the number. A wrong number in the
      // metadata is a wrong number in every crawler that reads it.
      ...(repo.stars === null ? {} : { "github-stars": String(repo.stars) }),
    },
  };
}

export const viewport: Viewport = {
  themeColor: "#03070D",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link
          rel="preload"
          href="/fonts/inter-latin-wght-normal.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          as="image"
          type="image/avif"
          imageSrcSet="/brand/xr-avatar-520.avif 520w, /brand/xr-avatar-760.avif 760w, /brand/xr-avatar-1100.avif 1100w"
          imageSizes="(min-width: 1024px) 540px, 90vw"
          fetchPriority="high"
        />
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              name: site.name,
              applicationCategory: "DeveloperApplication",
              applicationSubCategory: "AI agent runtime",
              operatingSystem: "Linux, macOS, Windows, Android (Termux)",
              description: site.description,
              url: site.url,
              softwareVersion: site.version,
              license: "https://opensource.org/licenses/MIT",
              author: { "@type": "Organization", name: site.company, url: site.agency },
              codeRepository: site.repo,
              downloadUrl: site.npm,
              offers: [
                {
                  "@type": "Offer",
                  name: "Personal",
                  price: "0",
                  priceCurrency: "USD",
                  description: pricingPersonalDescription,
                },
                {
                  "@type": "Offer",
                  name: "Business OS",
                  price: "15",
                  priceCurrency: "USD",
                  description:
                    "$15 per user per month, or $144 per user per year. Adds team members and roles, shared team workspaces, SSO admin, pooled managed models, team memory sync, audit log with signed CSV export, an admin console and cloud relay.",
                },
              ],
            }),
          }}
        />
      </head>
      <body className="min-h-screen bg-void text-primary antialiased">
        <a
          href="#main"
          className="sr-only-focusable absolute left-4 top-4 z-[100] rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-[var(--color-accent-contrast)]"
        >
          Skip to content
        </a>
        <SiteChrome />
        <main id="main">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}

const pricingPersonalDescription =
  "Free forever. Every local feature, no seat or time limit, no watermark, no nagging, no telemetry.";

async function SiteChrome() {
  const repo = await getRepoFacts();
  return <Nav stars={repo.stars} />;
}

async function SiteFooter() {
  const repo = await getRepoFacts();
  return <Footer stars={repo.stars} />;
}
