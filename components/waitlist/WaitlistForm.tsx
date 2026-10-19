"use client";

/**
 * WaitlistForm — used twice: in the hero and in the final CTA.
 *
 * It collects exactly one thing: an email address. No name, no
 * preferences, no tracking pixels, no third-party scripts. The hidden
 * `company` field is a honeypot — a bot that fills it gets a cheerful
 * 200 and learns nothing.
 */

import { useId, useState } from "react";

type Status =
  | { kind: "idle" }
  | { kind: "submitting" }
  | { kind: "subscribed" }
  | { kind: "already" }
  | { kind: "error"; message: string };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export default function WaitlistForm({
  source = "hero",
  className = "",
  idPrefix,
}: {
  source?: "hero" | "footer";
  className?: string;
  idPrefix?: string;
}) {
  const generated = useId();
  const prefix = idPrefix ?? `waitlist-${generated}`;
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const honeypot = String(data.get("company") ?? "");

    const trimmed = email.trim().toLowerCase();
    if (!EMAIL_RE.test(trimmed) || trimmed.length > 254) {
      setStatus({ kind: "error", message: "That does not look like an email address." });
      return;
    }

    setStatus({ kind: "submitting" });
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmed, company: honeypot, source }),
      });
      const json = (await res.json().catch(() => ({}))) as {
        status?: string;
        error?: string;
      };

      if (res.ok && json.status === "subscribed") {
        setStatus({ kind: "subscribed" });
        setEmail("");
        form.reset();
      } else if (res.ok && json.status === "already-subscribed") {
        setStatus({ kind: "already" });
        setEmail("");
        form.reset();
      } else {
        setStatus({
          kind: "error",
          message:
            json.error ??
            (res.status === 503
              ? "The waitlist is not reachable yet. Try again in a moment, or star the repo."
              : "Something went wrong. Please try again."),
        });
      }
    } catch {
      setStatus({
        kind: "error",
        message: "Network error. Please try again, or star the repo in the meantime.",
      });
    }
  };

  const busy = status.kind === "submitting";
  const done = status.kind === "subscribed" || status.kind === "already";

  const message = (() => {
    switch (status.kind) {
      case "subscribed":
        return "You are on the list. We will email you once, when XR is ready.";
      case "already":
        return "You are already on the list — no second email, no duplicates.";
      case "error":
        return status.message;
      case "submitting":
        return "Adding you…";
      default:
        return "";
    }
  })();

  return (
    <form onSubmit={submit} className={className} noValidate>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex h-12 flex-1 items-stretch gap-2 rounded-xl border border-[var(--color-line)] bg-ink/80 px-4 focus-within:border-[var(--color-line-accent)]">
          <label htmlFor={`${prefix}-email`} className="sr-only">
            Email address
          </label>
          <input
            id={`${prefix}-email`}
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            required
            maxLength={254}
            placeholder="you@company.com"
            value={email}
            disabled={busy || done}
            onChange={(e) => setEmail(e.target.value)}
            aria-describedby={`${prefix}-note ${prefix}-status`}
            className="my-0 h-full min-w-0 flex-1 self-stretch bg-transparent py-0 text-[15px] text-primary outline-none placeholder:text-tertiary disabled:opacity-60"
          />
        </div>

        {/* Honeypot. Off-screen, aria-hidden, out of the tab order —
            a person never meets it, a bot that fills every field does. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-[-9999px] top-0 h-px w-px overflow-hidden opacity-0"
        >
          <label htmlFor={`${prefix}-company`}>Company</label>
          <input
            id={`${prefix}-company`}
            name="company"
            type="text"
            tabIndex={-1}
            autoComplete="off"
            defaultValue=""
            className="h-px w-px p-0"
          />
        </div>

        <button
          type="submit"
          disabled={busy || done}
          className="inline-flex h-12 items-center justify-center rounded-xl bg-gradient-to-b from-[var(--color-accent-hover)] to-[var(--color-accent)] px-6 text-[15px] font-semibold text-[var(--color-accent-contrast)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {busy ? "Joining…" : done ? "Joined" : "Join the waitlist"}
        </button>
      </div>

      <p
        id={`${prefix}-status`}
        role="status"
        aria-live="polite"
        className={`mt-3 min-h-[1.25rem] text-sm ${
          status.kind === "error"
            ? "text-danger"
            : done
              ? "text-success"
              : "text-tertiary"
        }`}
      >
        {message}
      </p>

      <p id={`${prefix}-note`} className="mt-1 text-xs leading-relaxed text-tertiary">
        One email, stored in the waitlist. No tracking, no newsletter, no resale. Delete it any
        time by replying.
      </p>
    </form>
  );
}
