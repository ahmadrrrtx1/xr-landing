/**
 * Live GitHub repository facts.
 *
 * The star count is fetched from the GitHub API at request time and
 * revalidated hourly. It is never hard-coded, because a hard-coded
 * count is a lie the moment it is written down.
 */

export const REPO = "ahmadrrrtx/xr";

export type RepoFacts = {
  stars: number;
  forks: number;
  openIssues: number;
  license: string;
  description: string;
};

/** Fallback shown if GitHub is unreachable. Never invents a number. */
const unavailable: RepoFacts = {
  stars: 0,
  forks: 0,
  openIssues: 0,
  license: "MIT",
  description: "",
};

export async function getRepoFacts(): Promise<RepoFacts> {
  try {
    const res = await fetch(`https://api.github.com/repos/${REPO}`, {
      headers: {
        Accept: "application/vnd.github+json",
        "User-Agent": "xr-landing",
      },
      next: { revalidate: 3600 },
    });
    if (!res.ok) return unavailable;
    const json = (await res.json()) as {
      stargazers_count?: number;
      forks_count?: number;
      open_issues_count?: number;
      license?: { spdx_id?: string } | null;
      description?: string;
    };
    return {
      stars: json.stargazers_count ?? 0,
      forks: json.forks_count ?? 0,
      openIssues: json.open_issues_count ?? 0,
      license: json.license?.spdx_id ?? "MIT",
      description: json.description ?? "",
    };
  } catch {
    return unavailable;
  }
}
