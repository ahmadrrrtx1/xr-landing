import { NextResponse } from "next/server";

/**
 * POST /api/feedback
 *
 * A thin proxy to a Google Form. The browser posts the visitor's answer
 * here; this route posts it on to Google's `formResponse` endpoint and
 * reports back what Google actually said.
 *
 * Why not post from the browser? A cross-origin POST to Google can only
 * be made in `no-cors` mode, which returns an opaque response: the page
 * cannot tell a 200 "recorded" from a 404 "that form does not exist", and
 * both look identical. A form that quietly swallows every answer is worse
 * than no form. Going through the server means the visitor is told the
 * truth — "that is with us" only when Google confirmed it.
 *
 * Nothing is stored. The answer is not written to the waitlist, not
 * logged, and not kept after the response. Google owns the response
 * sheet; this route only carries the text across.
 */

export const runtime = "nodejs";

const FORM_ID = process.env.NEXT_PUBLIC_GOOGLE_FORM_ID ?? "";
const ENTRY = process.env.NEXT_PUBLIC_GOOGLE_FORM_ENTRY ?? "";

const MAX_ANSWER = 2000;
const MAX_EMAIL = 254;

type Body = {
  answer?: unknown;
  email?: unknown;
  area?: unknown;
  /** a field only a robot fills in */
  company?: unknown;
};

function text(value: unknown, max: number): string {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, max);
}

export async function POST(request: Request) {
  if (!FORM_ID || !ENTRY) {
    return NextResponse.json(
      { ok: false, error: "The feedback form is not connected yet." },
      { status: 503 },
    );
  }

  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ ok: false, error: "Nothing was sent." }, { status: 400 });
  }

  // The honeypot: a human never sees it, so anything in it is a robot.
  if (text(body.company, 200)) {
    return NextResponse.json({ ok: true });
  }

  const answer = text(body.answer, MAX_ANSWER);
  const email = text(body.email, MAX_EMAIL);
  const area = text(body.area, 200);

  if (answer.length < 3) {
    return NextResponse.json(
      { ok: false, error: "That answer was too short to be useful." },
      { status: 400 },
    );
  }
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json(
      { ok: false, error: "That email address does not look right." },
      { status: 400 },
    );
  }

  const composed = [
    `Area: ${area || "Not given"}`,
    `Reply to: ${email || "(not given)"}`,
    "",
    answer,
  ].join("\n");

  try {
    const response = await fetch(
      `https://docs.google.com/forms/d/e/${FORM_ID}/formResponse`,
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8" },
        body: new URLSearchParams({ [ENTRY]: composed }).toString(),
        // Google answers a good submission with a redirect; following it
        // would hide a 404 behind a 200 "nothing here" page.
        redirect: "manual",
        cache: "no-store",
      },
    );

    const ok = response.status === 200 || response.status === 302;

    if (!ok) {
      return NextResponse.json(
        {
          ok: false,
          error:
            response.status === 404
              ? "That form is not published yet. Email hello@rrrtx-systems.com instead."
              : "That did not go through. Email hello@rrrtx-systems.com instead.",
        },
        { status: 502 },
      );
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { ok: false, error: "That did not go through. Email hello@rrrtx-systems.com instead." },
      { status: 502 },
    );
  }
}
