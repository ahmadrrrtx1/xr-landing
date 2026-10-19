/**
 * Live GitHub repository facts.
 *
 * The star count is fetched from the GitHub API on the server and
 * revalidated hourly. It is never hard-coded, because a hard-coded
 * count is a lie the moment it is written down.
 *
 * And it is never *zero* when the number is merely unknown. "0 stars"
 * is a statement about the repository, and it is false. When the API
 * cannot be reached the count comes back as `null` and the page shows a
 * dash instead of a number it cannot stand behind.
 *
 * Unauthenticated GitHub API calls are limited to 60 an hour per IP, and
 * Vercel's build and function IPs are shared and heavily used, so the
 * limit is routinely exhausted without a token. Set `GITHUB_TOKEN` in
 * the environment and the same request is authenticated, which raises
 * the limit to 5,000 an hour. A classic token with no scopes is enough
 * for a public repository.
 */

export const REPO = "ahmadrrrtx/xr";

export type RepoFacts = {
  /** `null` means "not known" — never "0". */
  stars: number | null;
  forks: number | null;
  openIssues: number | null;
  license: string;
  description: string;
};

const TIMEOUT_MS = 6000;

async function fetchRepo(): Promise<{ json: Record<string, unknown>; status: number }> {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "User-Agent": "xr-landing",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  const token = process.env.GITHUB_TOKEN;
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`https://api.github.com/repos/${REPO}`, {
    headers,
    next: { revalidate: 3600 },
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });

  if (!res.ok) {
    const error = new Error(`GitHub responded ${res.status}`);
    (error as Error & { status?: number }).status = res.status;
    throw error;
  }

  return { json: (await res.json()) as Record<string, unknown>, status: res.status };
}

export async function getRepoFacts(): Promise<RepoFacts> {
  // One retry. GitHub rate limits are per-IP and per-minute, so a
  // request that has just been refused is often fine a moment later.
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const { json } = await fetchRepo();
      const license = json.license as { spdx_id?: string } | null | undefined;
      return {
        stars: typeof json.stargazers_count === "number" ? json.stargazers_count : null,
        forks: typeof json.forks_count === "number" ? json.forks_count : null,
        openIssues:
          typeof json.open_issues_count === "number" ? json.open_issues_count : null,
        license: license?.spdx_id ?? "MIT",
        description: typeof json.description === "string" ? json.description : "",
      };
    } catch {
      if (attempt === 0) await new Promise((r) => setTimeout(r, 400));
    }
  }

  // Unknown is not zero. Say so.
  return {
    stars: null,
    forks: null,
    openIssues: null,
    license: "MIT",
    description: "",
  };
}
