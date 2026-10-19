import { NextResponse } from "next/server";
import { TursoNotConfiguredError, subscribe } from "@/lib/turso";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/subscribe
 *
 * Body: `{ email: string, company?: string, source?: string }`
 *
 * 200 { status: "subscribed" }           — a new row was written
 * 200 { status: "already-subscribed" }   — that email was already on the list
 * 400 { error: string }                  — the email failed validation
 * 503 { error: string }                  — the database is not configured
 *
 * `email` is the PRIMARY KEY in Turso and the insert is
 * `ON CONFLICT(email) DO NOTHING`, so a duplicate can never create a
 * second row — that is a database guarantee, not a convention.
 *
 * The `company` field is a honeypot. When it is filled we return the
 * same 200 a real subscriber gets, but write nothing: the bot learns
 * nothing about whether it was filtered.
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const MAX_EMAIL = 254;

export async function POST(request: Request) {
  let payload: { email?: unknown; company?: unknown; source?: unknown };

  try {
    payload = (await request.json()) as typeof payload;
  } catch {
    return NextResponse.json({ error: "Expected a JSON body." }, { status: 400 });
  }

  // Honeypot — pretend success, write nothing.
  if (typeof payload.company === "string" && payload.company.trim() !== "") {
    return NextResponse.json({ status: "subscribed" }, { status: 200 });
  }

  if (typeof payload.email !== "string") {
    return NextResponse.json({ error: "An email address is required." }, { status: 400 });
  }

  const email = payload.email.trim().toLowerCase();

  if (email.length === 0) {
    return NextResponse.json({ error: "An email address is required." }, { status: 400 });
  }
  if (email.length > MAX_EMAIL) {
    return NextResponse.json({ error: "That email address is too long." }, { status: 400 });
  }
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json(
      { error: "That does not look like an email address." },
      { status: 400 },
    );
  }

  const source = typeof payload.source === "string" ? payload.source.slice(0, 32) : "landing";

  try {
    const result = await subscribe(email, source);
    return NextResponse.json({ status: result }, { status: 200 });
  } catch (error) {
    if (error instanceof TursoNotConfiguredError) {
      return NextResponse.json(
        {
          error:
            "The waitlist database is not configured yet. Set TURSO_DATABASE_URL and TURSO_AUTH_TOKEN, then apply schema/001_waitlist.sql.",
        },
        { status: 503 },
      );
    }
    return NextResponse.json(
      { error: "The waitlist could not be reached. Please try again shortly." },
      { status: 503 },
    );
  }
}

/** Anything other than POST is a mistake; say so plainly. */
export async function GET() {
  return NextResponse.json(
    { error: "Use POST with { email } to join the waitlist." },
    { status: 405, headers: { Allow: "POST" } },
  );
}
