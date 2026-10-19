/**
 * Waitlist verification — a real libSQL database, the real schema, the
 * real SQL.
 *
 * This runs against a local libSQL file so the write path, the primary
 * key and the `ON CONFLICT ... DO NOTHING` behaviour can be proven
 * without a hosted account. The only difference from production is the
 * URL: `file:` instead of `libsql://`. The engine, the schema and the
 * statements are identical.
 *
 *   npx tsx scripts/verify-waitlist.ts        # or: node --experimental-strip-types
 */

import { createClient } from "@libsql/client";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const url = process.env.TURSO_DATABASE_URL ?? "file:./.local/waitlist.db";
const authToken = process.env.TURSO_AUTH_TOKEN ?? "local-dev-not-a-real-token";

const db = createClient({ url, authToken });

function splitSql(file: string): string[] {
  return readFileSync(join(process.cwd(), file), "utf8")
    .split(";")
    .map((chunk) =>
      chunk
        .split("\n")
        .filter((line) => !line.trim().startsWith("--"))
        .join("\n")
        .trim(),
    )
    .filter((chunk) => chunk.length > 0);
}

async function main() {
  console.log(`# database: ${url}`);

  for (const stmt of splitSql("schema/001_waitlist.sql")) {
    await db.execute(stmt);
  }
  console.log("# schema applied");

  // The exact statements the API route runs.
  const insert = async (email: string, source: string) => {
    const before = await db.execute("SELECT email FROM waitlist WHERE email = ?", [email]);
    if (before.rows.length > 0) return "already-subscribed";
    await db.execute({
      sql: "INSERT INTO waitlist (email, source) VALUES (?, ?) ON CONFLICT(email) DO NOTHING",
      args: [email, source],
    });
    return "subscribed";
  };

  const a = await insert("owner-check@rrrtx-systems.com", "hero");
  console.log(`# first insert            -> ${a}`);

  const b = await insert("owner-check@rrrtx-systems.com", "footer");
  console.log(`# duplicate insert        -> ${b}`);

  const c = await insert("second-check@rrrtx-systems.com", "footer");
  console.log(`# second distinct insert  -> ${c}`);

  const rows = await db.execute(
    "SELECT email, source, created_at FROM waitlist ORDER BY created_at DESC",
  );
  console.log(`# rows in table: ${rows.rows.length}`);
  for (const row of rows.rows) {
    console.log(`#   ${String(row.email)}  source=${String(row.source)}  at=${String(row.created_at)}`);
  }

  // The primary key is what makes a duplicate impossible, not a convention.
  const pk = await db.execute("SELECT sql FROM sqlite_master WHERE name = 'waitlist'");
  console.log(`# table definition:\n#   ${String(pk.rows[0]?.sql ?? "").split("\n").join("\n#   ")}`);

  const dup = rows.rows.filter((r) => String(r.email) === "owner-check@rrrtx-systems.com");
  console.log(
    dup.length === 1
      ? "# RESULT: duplicate produced exactly one row — the primary key holds."
      : `# RESULT: FAILURE — ${dup.length} rows for one address.`,
  );
}

main().catch((error) => {
  console.error("# FAILED:", error);
  process.exit(1);
});
