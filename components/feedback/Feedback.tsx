"use client";

/**
 * Feedback — "tell us what to build next".
 *
 * The owner asked for a simple Google Form: a place where somebody can
 * say what XR should do next, and what they think of it. The responses
 * land in the owner's own Google Sheet, not in our database, and the
 * site does not read them.
 *
 * There are two ways to connect it, and the site works with either:
 *
 *   1. `NEXT_PUBLIC_GOOGLE_FORM_ID`  +  `NEXT_PUBLIC_GOOGLE_FORM_ENTRY`
 *      The form below is rendered in the site's own design and posts
 *      straight to the Google Form. One Google question, one entry id.
 *
 *   2. `NEXT_PUBLIC_GOOGLE_FORM_ID` on its own
 *      Google's own form is embedded instead, exactly as Google
 *      renders it. Useful when the owner wants more than one question.
 *
 *   Neither set — the section says so honestly and offers email
 *   instead, rather than pretending to collect something.
 *
 * The form id and the entry id are public identifiers. They are not
 * secrets and there is no API key anywhere in this path.
 */

import { useEffect, useRef, useState } from "react";
import { site } from "@/lib/site";

const FORM_ID = process.env.NEXT_PUBLIC_GOOGLE_FORM_ID ?? "";
const ENTRY = process.env.NEXT_PUBLIC_GOOGLE_FORM_ENTRY ?? "";

const AREAS = [
  "Providers & models",
  "The mobile app",
  "Memory & brain",
  "Skills & plugins",
  "The desktop app",
  "Something else",
] as const;

type State =
  | { kind: "idle" }
  | { kind: "sending" }
  | { kind: "sent" }
  | { kind: "failed"; message?: string };

export default function Feedback() {
  const [area, setArea] = useState<string>(AREAS[0]);
  const [text, setText] = useState("");
  const [email, setEmail] = useState("");
  const [state, setState] = useState<State>({ kind: "idle" });
  const honeypot = useRef<HTMLInputElement>(null);

  // With JavaScript the address is optional, because the server fills in
  // a no-reply address when it is left blank. Without JavaScript the
  // browser posts the form to Google directly, and Google rejects a
  // response with no address at all — so the markup marks the field
  // required, and this removes the requirement once we can take over.
  useEffect(() => {
    document.getElementById("feedback-email")?.removeAttribute("required");
  }, []);

  /**
   * A published Google Form id starts with `1` and is a long token; an
   * entry id is `entry.` followed by the question's number. A placeholder
   * value looks real to every layer except the one that has to talk to
   * Google, and Google answers a submission with an entry id that
   * matches no question with a 400 — so a visitor would be thanked for
   * an opinion that went nowhere. A value that does not look real is
   * treated as "not connected", which is the truth.
   */
  const FORM_ID_RE = /^1[A-Za-z0-9_-]{20,}$/;
  const ENTRY_RE = /^entry\.\d{5,}$/;

  const realFormId = FORM_ID_RE.test(FORM_ID);
  const realEntry = ENTRY_RE.test(ENTRY);

  const connected = realFormId && realEntry;
  const embedOnly = realFormId && !realEntry;
  const notConnected = !realFormId;

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!connected) return;
    if (text.trim().length < 3) {
      setState({ kind: "failed" });
      return;
    }
    setState({ kind: "sending" });

    try {
      // The site posts this to its own /api/feedback route, which forwards
      // it to Google and reports back what Google actually said. A
      // cross-origin POST straight to Google can only be made in
      // `no-cors` mode, and an opaque response cannot tell a saved answer
      // from a form that does not exist — so the visitor would be told
      // "thank you" for a message that went nowhere.
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answer: text.trim(),
          email: email.trim(),
          area,
          company: honeypot.current?.value ?? "",
        }),
      });

      const result = (await response.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
        detail?: string;
      };

      if (response.ok && result.ok) {
        setState({ kind: "sent" });
        setText("");
        setEmail("");
      } else {
        setState({ kind: "failed", message: result.error });
      }
    } catch {
      setState({ kind: "failed" });
    }
  };

  return (
    <section
      id="feedback"
      className="scroll-mt-24 border-t border-[var(--color-line-subtle)] py-20 sm:py-24"
    >
      <div className="shell grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-16">
        <div>
          <p className="eyebrow">Your take</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-primary sm:text-4xl sm:leading-[1.12]">
            Tell us what to build next
          </h2>
          <p className="mt-4 text-[15px] leading-[1.7] text-secondary sm:text-base">
            XR is not finished and it will not be finished in a vacuum. If you have been using
            it, or you have been reading it, we want to hear what it is missing — what you
            would put first, and what you would rip out.
          </p>
          <p className="mt-4 text-[15px] leading-[1.7] text-secondary sm:text-base">
            The address below is optional. Leave it and we cannot reply — the answer still
            counts, and it is recorded against a no-reply address so we know not to write
            back. Leave it in and we will, once.
          </p>
          <p className="mt-6 text-[13px] leading-relaxed text-tertiary">
            This form posts straight to a Google Form. Google stores what you type; we do not
            read it, and nothing here is tied to the waitlist.
          </p>
        </div>

        <div className="card p-6 sm:p-7">
          {notConnected ? (
            <div>
              <h3 className="text-lg font-semibold text-primary">
                The form is not connected yet
              </h3>
              <p className="mt-3 text-[14px] leading-relaxed text-secondary">
                It is being set up. Until it is, the fastest way to reach us is email —{" "}
                <a
                  href={`mailto:${site.email}?subject=XR%20—%20what%20to%20build%20next`}
                  className="text-accent underline decoration-[var(--color-line-accent)] underline-offset-4"
                >
                  {site.email}
                </a>
                .
              </p>
              {/* The setup steps are for the owner, not for a visitor, so
                  they only ever appear in a local development build. The
                  instructions live in README.md. */}
              {process.env.NODE_ENV === "development" ? (
                <p className="mt-6 border-t border-[var(--color-line-subtle)] pt-4 text-xs leading-relaxed text-tertiary">
                  <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-accent/80">
                    Owner setup
                  </span>
                  <br />
                  1 — Create a Google Form with one question: &ldquo;What should XR do
                  next?&rdquo;
                  <br />
                  2 — Menu &rsaquo; Get prefilled link, and copy the id out of the URL
                  (it looks like <code className="font-mono">entry.123456789</code> — copy
                  the real one, a made-up number is rejected)
                  <br />
                  3 — Set <code className="font-mono">NEXT_PUBLIC_GOOGLE_FORM_ID</code> and{" "}
                  <code className="font-mono">NEXT_PUBLIC_GOOGLE_FORM_ENTRY</code>
                </p>
              ) : null}
            </div>
          ) : embedOnly ? (
            <div>
              <h3 className="mb-4 text-lg font-semibold text-primary">Tell us what to build next</h3>
              <iframe
                title="XR — what should we build next?"
                src={`https://docs.google.com/forms/d/e/${FORM_ID}/viewform?embedded=true`}
                className="h-[34rem] w-full rounded-lg border border-[var(--color-line-subtle)] bg-white"
                loading="lazy"
              />
            </div>
          ) : (
            /* No-JavaScript fallback: the form posts straight to Google,
               and the answer box carries the entry id as its name, so the
               answer still lands in the right question. With JavaScript on,
               React intercepts the submit and sends area + reply address
               + answer as one composed field. */
            <form
              onSubmit={submit}
              noValidate
              method="post"
              action={`https://docs.google.com/forms/d/e/${FORM_ID}/formResponse`}
            >
              <fieldset>
                <legend className="text-sm font-medium text-primary">
                  What area is this about?
                </legend>
                <div className="mt-3 flex flex-wrap gap-2">
                  {AREAS.map((option, i) => {
                    const id = `feedback-area-${i}`;
                    return (
                      <span key={option} className="relative">
                        {/* the input stays out of the way visually, but it is a
                            real radio: arrow keys move between the options and
                            the label carries the focus ring. */}
                        <input
                          id={id}
                          type="radio"
                          name="area"
                          value={option}
                          checked={area === option}
                          onChange={() => setArea(option)}
                          className="peer sr-only"
                        />
                        <label
                          htmlFor={id}
                          className="block cursor-pointer rounded-full border border-[var(--color-line)] bg-ink/60 px-3 py-2 text-[13px] text-secondary transition hover:border-[var(--color-line-accent)] hover:text-primary peer-checked:border-[var(--color-line-accent)] peer-checked:bg-[rgba(0,229,255,0.1)] peer-checked:text-primary peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[var(--color-accent)]"
                        >
                          {option}
                        </label>
                      </span>
                    );
                  })}
                </div>
              </fieldset>

              <label
                htmlFor="feedback-text"
                className="mt-6 block text-sm font-medium text-primary"
              >
                What should XR do next?
              </label>
              <textarea
                id="feedback-text"
                name={ENTRY}
                value={text}
                onChange={(e) => {
                  setText(e.target.value);
                  if (state.kind === "failed") setState({ kind: "idle" });
                }}
                rows={5}
                required
                maxLength={2000}
                placeholder="More local models. A better memory editor. The thing you had to work around."
                className="mt-2 w-full resize-y rounded-xl border border-[var(--color-line)] bg-ink/80 px-4 py-3 text-[15px] leading-relaxed text-primary outline-none transition placeholder:text-tertiary focus:border-[var(--color-line-accent)]"
              />

              {/* a robot fills this in, a person never sees it */}
              <div aria-hidden="true" className="sr-only">
                <label htmlFor="feedback-company">Company</label>
                <input
                  id="feedback-company"
                  name="company"
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                  ref={honeypot}
                />
              </div>

              <label
                htmlFor="feedback-email"
                className="mt-5 block text-sm font-medium text-primary"
              >
                Email{" "}
                <span className="font-normal text-tertiary">(optional — only if you want a reply)</span>
              </label>
              <input
                id="feedback-email"
                name="emailAddress"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                maxLength={254}
                autoComplete="email"
                required
                placeholder="you@company.com"
                className="mt-2 h-12 w-full rounded-xl border border-[var(--color-line)] bg-ink/80 px-4 text-[15px] text-primary outline-none transition placeholder:text-tertiary focus:border-[var(--color-line-accent)]"
              />

              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
                <button
                  type="submit"
                  disabled={state.kind === "sending"}
                  className="inline-flex h-12 items-center justify-center rounded-xl bg-gradient-to-b from-[var(--color-accent-hover)] to-[var(--color-accent)] px-6 text-[15px] font-semibold text-[var(--color-accent-contrast)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {state.kind === "sending" ? "Sending…" : "Send it"}
                </button>

                <p
                  role="status"
                  aria-live="polite"
                  className={`text-sm ${
                    state.kind === "sent"
                      ? "text-success"
                      : state.kind === "failed"
                        ? "text-danger"
                        : "text-tertiary"
                  }`}
                >
                  {state.kind === "sent"
                    ? "That is with us. Thank you."
                    : state.kind === "failed"
                      ? (state.message ??
                        `That did not go through. Email ${site.email} instead.`)
                      : state.kind === "sending"
                        ? "Sending…"
                        : "One form, one answer. No newsletter."}
                </p>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
