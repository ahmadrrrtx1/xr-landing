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

/**
 * What a real form id and a real entry id look like.
 *
 * A published Google Form id starts with `1` and is a long token; an
 * entry id is `entry.` followed by the question's number. These patterns
 * exist because a placeholder — `entry.<the number from the prefilled link>` is the one that ended
 * up in the documentation and then in a live deployment — looks exactly
 * like a real value to every layer except the one that has to talk to
 * Google. Google answers a submission with an entry id that matches no
 * question with a 400, and a visitor would be told their opinion was
 * lost. The site now refuses to pretend: a value that does not look
 * real is reported as not configured.
 */
const FORM_ID_RE = /^1[A-Za-z0-9_-]{20,}$/;
const ENTRY_RE = /^entry\.\d{5,}$/;

/** The address recorded when a visitor leaves the reply field empty. */
export const NO_REPLY_ADDRESS = "no-reply@rrrtx-systems.com";

export const idsLookReal = (formId: string, entry: string) =>
  FORM_ID_RE.test(formId) && ENTRY_RE.test(entry);

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

  if (!idsLookReal(FORM_ID, ENTRY)) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "The form id or the entry id in the environment is not a real one. Copy both from the form's own prefilled link.",
      },
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

  const composed = [`Area: ${area || "Not given"}`, "", answer].join("\n");

  // The form collects email addresses, so Google wants one on every
  // response: an empty `emailAddress` is a 400, not a blank cell. When
  // the visitor leaves the address blank the answer is still recorded,
  // against a no-reply address on the owner's own domain that says
  // plainly that nobody is going to be able to answer it.
  const payload: Record<string, string> = {
    [ENTRY]: composed,
    emailAddress: email || NO_REPLY_ADDRESS,
  };

  try {
    const response = await fetch(
      `https://docs.google.com/forms/d/e/${FORM_ID}/formResponse`,
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8" },
        body: new URLSearchParams(payload).toString(),
        // Google answers a good submission with a redirect; following it
        // would hide a 404 behind a 200 "nothing here" page.
        redirect: "manual",
        cache: "no-store",
      },
    );

    const ok = response.status === 200 || response.status === 302;

    if (!ok) {
      // Google answers a submission whose entry id matches no question
      // with a 400, and a form that does not exist with a 404. Those are
      // two different problems and the owner needs to know which one it
      // is. The visitor gets a plain sentence; the `detail` field is
      // there for whoever is setting the form up.
      const friendly =
        response.status === 400
          ? "That did not go through. Email hello@rrrtx-systems.com instead."
          : response.status === 404
            ? "That form is not published yet. Email hello@rrrtx-systems.com instead."
            : "That did not go through. Email hello@rrrtx-systems.com instead.";

      const detail =
        response.status === 400
          ? `Google rejected the submission with a 400. Two things can cause that: the entry id "${ENTRY}" does not match any question in form ${FORM_ID} (either the form has no questions yet, or NEXT_PUBLIC_GOOGLE_FORM_ENTRY is the wrong id — copy the real one from the form's prefilled link), or the form collects email addresses and the submission carried none.`
          : response.status === 404
            ? `Google has no form ${FORM_ID}. The form id is wrong, or the form has not been published with Send.`
            : `Google responded ${response.status}.`;

      return NextResponse.json(
        { ok: false, error: friendly, detail },
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
