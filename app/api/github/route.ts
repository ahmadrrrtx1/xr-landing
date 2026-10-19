import { NextResponse } from "next/server";
import { getRepoFacts, REPO } from "@/lib/github";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/github
 *
 * The live star count, and — when something is wrong — the reason.
 *
 * This exists because "the site shows 0 stars" and "the API is rate
 * limited" look identical from the outside. This route says which one
 * it is, so the problem can be fixed instead of guessed at.
 *
 * It returns public repository data. Nothing about the visitor is
 * collected and nothing is stored.
 */
export async function GET() {
  const facts = await getRepoFacts();

  // The raw upstream answer, so the reason is visible rather than inferred.
  let upstream: { status: number; rateLimitRemaining: string | null; message: string | null } = {
    status: 0,
    rateLimitRemaining: null,
    message: null,
  };

  try {
    const headers: Record<string, string> = {
      Accept: "application/vnd.github+json",
      "User-Agent": "xr-landing",
      "X-GitHub-Api-Version": "2022-11-28",
    };
    const token = process.env.GITHUB_TOKEN;
    if (token) headers.Authorization = `Bearer ${token}`;

    const res = await fetch(`https://api.github.com/repos/${REPO}`, {
      headers,
      cache: "no-store",
      signal: AbortSignal.timeout(6000),
    });
    upstream = {
      status: res.status,
      rateLimitRemaining: res.headers.get("x-ratelimit-remaining"),
      message: res.ok ? null : await res.text().then((t) => t.slice(0, 200)),
    };
  } catch (error) {
    upstream.message = error instanceof Error ? error.message : String(error);
  }

  return NextResponse.json(
    {
      repo: REPO,
      stars: facts.stars,
      forks: facts.forks,
      openIssues: facts.openIssues,
      license: facts.license,
      authenticated: Boolean(process.env.GITHUB_TOKEN),
      upstream,
      explanation:
        facts.stars === null
          ? "The star count could not be read. The site shows a dash rather than a number it cannot stand behind. Set GITHUB_TOKEN in the environment to lift the unauthenticated rate limit."
          : "The star count is live and correct.",
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
