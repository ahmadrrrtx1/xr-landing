/**
 * Turso (libSQL) client for the waitlist.
 *
 * The site writes exactly one column of personal data: an email
 * address. There is no name, no IP, no user agent and no analytics
 * anywhere in this file, and none is ever written to the table.
 *
 * `email` is the PRIMARY KEY, so a duplicate signup is a no-op at the
 * database level rather than an application convention.
 */

import { createClient, type Client } from "@libsql/client";

export class TursoNotConfiguredError extends Error {
  constructor() {
    super(
      "The waitlist database is not configured. Set TURSO_DATABASE_URL and TURSO_AUTH_TOKEN.",
    );
    this.name = "TursoNotConfiguredError";
  }
}

let client: Client | null = null;

/** Lazily create the client. Throws if the env vars are missing. */
export function getClient(): Client {
  if (client) return client;
  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;
  if (!url || !authToken) throw new TursoNotConfiguredError();
  client = createClient({ url, authToken });
  return client;
}

export type SubscribeResult = "subscribed" | "already-subscribed";

/**
 * Insert an email. Duplicate-safe by construction: the insert is
 * `ON CONFLICT(email) DO NOTHING`, and we then check whether the row
 * already existed so the API can tell the truth about what happened.
 */
export async function subscribe(email: string, source = "landing"): Promise<SubscribeResult> {
  const db = getClient();

  const existing = await db.execute({
    sql: "SELECT email FROM waitlist WHERE email = ?",
    args: [email],
  });
  if (existing.rows.length > 0) return "already-subscribed";

  await db.execute({
    sql: "INSERT INTO waitlist (email, source) VALUES (?, ?) ON CONFLICT(email) DO NOTHING",
    args: [email, source],
  });

  return "subscribed";
}

/**
 * Read every row. Used by the owner's one-command export path and by
 * the local verification script — never exposed on a public route.
 */
export async function listWaitlist(): Promise<{ email: string; source: string; created_at: string }[]> {
  const db = getClient();
  const res = await db.execute(
    "SELECT email, source, created_at FROM waitlist ORDER BY created_at DESC",
  );
  return res.rows.map((r) => ({
    email: String(r.email),
    source: String(r.source),
    created_at: String(r.created_at),
  }));
}
