# xr-landing — the official landing site for **XR**

> **XR** — a local-first, provider-neutral AI agent runtime. BYOK, spend-capped,
> tamper-evident audit, plugin/MCP extensibility.
> <br />[github.com/ahmadrrrtx/xr](https://github.com/ahmadrrrtx/xr) · MIT

The site has one job: make someone want XR, and get them onto the email
waitlist. The secondary action is starring the GitHub repository.

Everything on the page is real. The screenshots are captures of the running
application, the video is a recording of the running application, the terminal
transcript is a recording of a real `xr` session, and every product claim is
sourced to a path in the repository. The claim ledger is
[`CLAIMS.md`](./CLAIMS.md); the research that produced it is
[`RECON.md`](./RECON.md).

---

## Stack

| | |
|---|---|
| Framework | Next.js 16 (App Router) · React 19 |
| Styling | Tailwind CSS v4 (`@theme` tokens lifted from the app's own `themes.css`) |
| Language | TypeScript, strict |
| Database | Turso / libSQL (`@libsql/client`) — one table, one column that matters |
| Hosting | Vercel |
| 3D | Hand-written WebGL2 + Canvas 2D. No Three.js, no animation library. |

---

## Running it locally

```bash
npm install
cp .env.example .env.local     # then fill in the two Turso values
npm run dev                    # http://localhost:3000
```

Production:

```bash
npm run build
npm start
```

### The environment variables

```bash
# the waitlist — required for the signup to work
TURSO_DATABASE_URL=libsql://your-db-name-your-org.turso.io
TURSO_AUTH_TOKEN=...

# the feedback form — public identifiers, not secrets
NEXT_PUBLIC_GOOGLE_FORM_ID=1vN0I_PtIQDCemoAgafAQwdMG5Hsm5c5eZlJaVbr3vu8
NEXT_PUBLIC_GOOGLE_FORM_ENTRY=entry.123456789
```

The first two are the only ones that are needed for the site to function.
With no Turso configuration the site still builds, renders and deploys; the
waitlist endpoint answers `503` with a plain sentence, and the form shows
that sentence to the visitor. It never pretends to have saved an address
it did not save.

The Google Form variables are described in full in
[The feedback form](#the-feedback-form--tell-us-what-to-build-next) below.

---

## The waitlist

### The schema

[`schema/001_waitlist.sql`](./schema/001_waitlist.sql) — the whole thing:

```sql
CREATE TABLE IF NOT EXISTS waitlist (
  email       TEXT PRIMARY KEY NOT NULL,
  source      TEXT NOT NULL DEFAULT 'landing',
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);
```

The email address is the primary key, so a duplicate cannot exist. The
insert is `ON CONFLICT(email) DO NOTHING`, so a duplicate returns
`already-subscribed` instead of throwing.

### Applying it

```bash
turso db create waitlist
turso db shell . schema/001_waitlist.sql
```

Or, without the CLI:

```bash
npx @libsql/client --url "$TURSO_DATABASE_URL" --token "$TURSO_AUTH_TOKEN" < schema/001_waitlist.sql
```

### Verifying the write path without a hosted database

The endpoint speaks libSQL, so a local libSQL file is a valid target and the
whole path — schema, primary key, conflict handling — can be exercised
offline:

```bash
TURSO_DATABASE_URL="file:./.local/waitlist.db" \
TURSO_AUTH_TOKEN="local-dev" \
npm run build && npm start
```

```bash
node scripts/verify-waitlist.mjs
```

```
# database: file:/home/user/xr-site/.local/waitlist.db
# schema applied
# first insert           -> subscribed
# duplicate insert       -> already-subscribed
# second distinct insert -> subscribed
# rows in table: 2
#   second-check@rrrtx-systems.com  source=footer  at=2026-10-18 18:18:57
#   owner-check@rrrtx-systems.com   source=hero    at=2026-10-18 18:18:57
# RESULT: duplicate produced exactly one row — the primary key holds.
```

### The endpoint

`POST /api/subscribe` — JSON `{ "email": "…", "source": "hero" | "footer" }`

| Case | Status | Body |
|---|---|---|
| New address | `200` | `{"status":"subscribed"}` |
| Already on the list | `200` | `{"status":"already-subscribed"}` |
| Not an email | `400` | `{"error":"That does not look like an email address."}` |
| Over 254 characters | `400` | `{"error":"That email address is too long."}` |
| Honeypot filled | `200` | `{"status":"subscribed"}` — **nothing is written** |
| No database configured | `503` | `{"error":"The waitlist database is not configured yet…"}` |

The honeypot is a field named `company`, positioned off-screen, `aria-hidden`,
and `tabIndex={-1}`. A bot that fills it gets a cheerful success and learns
nothing; the check on the server is what decides whether a row is written, so
a bot that skips the field but still posts is validated like anyone else.

### What is collected

An email address. Nothing else — no name, no preferences, no cookie, no
tracking pixel, no third-party script. The privacy line under each form says
so in plain words.

### Getting the waitlist out

The site never emails anyone and never will. When XR is ready to launch, the
list is exported and handed to a real ESP:

```bash
turso db shell waitlist "SELECT email, source, created_at FROM waitlist ORDER BY created_at" \
  --output csv > waitlist.csv
```

---

## The feedback form — "tell us what to build next"

A section on the page where somebody can say what XR should do next, and
say what they think of it. The answers land in a **Google Form**, so they
land in the owner's own Google Sheet.

The form shell already exists, created in the owner's Drive:

> **XR — what should we build next?**
> <https://docs.google.com/forms/d/1vN0I_PtIQDCemoAgafAQwdMG5Hsm5c5eZlJaVbr3vu8/edit>

### Turning it on — two minutes, once

1. Open the form above and add one question:
   **"What should XR do next?"** (a paragraph question is right).
   Optional: a second short-answer question for the reply address.
2. Click **Send** in the top right and publish it to the web, so the
   form is reachable without a Google login.
3. Click the menu (⋮) → **Get prefilled link**. The link looks like
   `https://docs.google.com/forms/d/e/<FORM_ID>/viewform?entry.123456789`
   — the part after `d/e/` is the **form id**, the `entry.123456789` at
   the end is the **entry id**.
4. Set the environment variables and redeploy:

   | Variable | Value | Effect |
   |---|---|---|
   | `NEXT_PUBLIC_GOOGLE_FORM_ID` | `<FORM_ID>` | **Required.** The site will not pretend to collect anything without it. |
   | `NEXT_PUBLIC_GOOGLE_FORM_ENTRY` | `entry.123456789` | Optional, but it is the nicer version. |

   - With **both** set: the site renders its own form, in the site's own
     design, and posts the answer to Google through the server.
   - With only the **form id** set: Google's own form is embedded in the
     page instead, exactly as Google renders it. Use this if you want
     more than one question.
   - With **neither** set: the section says plainly that the form is not
     connected yet and offers `hello@rrrtx-systems.com` instead. It never
     pretends to have collected something.

   These are public identifiers, not secrets — they appear in the page
   source. There is no API key, no service account and no OAuth in this
   path.

### How the answer travels

```
browser  ──POST /api/feedback──▶  the site's server  ──POST formResponse──▶  Google
```

The browser does **not** talk to Google directly. A cross-origin POST to
Google can only be made in `no-cors` mode, which returns an opaque
response — the page cannot tell "recorded" from "that form does not
exist", and both look the same. A form that says "thank you" for a
message that went nowhere is worse than no form at all. So the answer
goes to `/api/feedback`, the server forwards it, and the visitor is told
the truth either way.

Nothing is stored: the answer is not written to the waitlist, not logged,
and not kept after the response. Google owns the response sheet; the
route only carries the text across.

`app/api/feedback/route.ts` also rejects an answer under 3 characters,
rejects a malformed email, and silently drops anything that fills the
off-screen `company` honeypot.

If JavaScript is off, the form still works: the answer box carries the
entry id as its `name` and the form posts straight to Google.

### The CSP

`next.config.ts` keeps `connect-src` at `'self'` — the page never calls
Google from the browser. `form-action` and `frame-src` name
`https://docs.google.com`, and nothing else is opened to any third party.

---

## Deploying to Vercel

1. `vercel link` (or import the repo at [vercel.com/new](https://vercel.com/new))
2. Add the environment variables under **Settings → Environment Variables**:
   - `TURSO_DATABASE_URL` — `libsql://<your-db>.turso.io`
   - `TURSO_AUTH_TOKEN` — the token Turso gives you
   - `NEXT_PUBLIC_GOOGLE_FORM_ID` — the form id (see above)
   - `NEXT_PUBLIC_GOOGLE_FORM_ENTRY` — the entry id, optional
   - `NEXT_PUBLIC_SITE_URL` — the deployment URL, so the canonical link,
     the Open Graph URL and the sitemap are correct
3. Apply the waitlist schema once against the Turso database:
   `npx @libsql/client schema/001_waitlist.sql` — or paste the file into
   the Turso dashboard.
4. `vercel --prod`

The build is `next build` and the output is the default. There is no
`output: standalone`, no custom server and no runtime dependency beyond
Node 20.

---

## The site map

```
app/
  layout.tsx        metadata, JSON-LD, fonts, nav, footer
  page.tsx          the page, in order
  api/subscribe/    the waitlist endpoint
  api/feedback/     the proxy that forwards an answer to the Google Form
  icon.svg          the favicon, drawn from the official emblem
  robots.ts sitemap.ts not-found.tsx
components/
  hero/             Hero, NeuralField (cursor-reactive), AvatarField (WebGL2),
                    VoiceMoment, shader.ts
  features/         FeatureBlock — one real capture + its sourced copy
  onlyxr/           the shortlist, with the repo's own limits printed on it
  preview/          TerminalReplay — the recorded session, replayable
  onboarding/       OnboardingStrip — twelve real first-run screens
  pricing/          Pricing — the repo's own language
  tour/             TourVideo — the 37-second recording
  site/             Nav, Footer, GitHubStar
  waitlist/         WaitlistForm
  feedback/         Feedback — "tell us what to build next"
lib/
  site.ts features.ts turso.ts github.ts replay.ts idle.ts
public/
  brand/            the owner's logo and avatar, as WebP + AVIF
  screens/          93 real captures, WebP, three widths each
  media/            the tour (mp4 + webm + poster) and the placeholder voice
  cli/              the raw and cleaned XR session transcripts
  fonts/            Inter + JetBrains Mono, subset to the characters used
  og.jpg            the Open Graph image
```

---

## Performance work

The hero's largest contentful paint is the avatar. Getting it under two
seconds on a throttled connection took four specific decisions:

1. **No runtime image optimiser.** Every image is pre-converted to WebP and
   AVIF at three widths and served as a static file with a `srcset`. The
   Next.js optimiser was spending CPU on the same process that was serving
   the page, and it was the single largest source of blocking time.
2. **The 1.1 MB avatar became 38 KB.** The owner's 4× master is 2224×1948;
   at the size it is actually displayed, AVIF at 68% quality is 38 KB.
3. **The webfonts are subset to the characters the site uses** — 47 KB → 30 KB
   for Inter, 39 KB → 34 KB for JetBrains Mono. Run
   `python3 scripts/subset-fonts.py` after a copy change.
4. **The WebGL field and the particle field wait for the first paint.**
   Compiling a shader on the first-paint tick pushed the LCP out by hundreds
   of milliseconds. They now start in the first idle slot after the hero is
   on screen (`lib/idle.ts`).

Measured with Lighthouse 12 against the production build on mobile
(attached as [`lighthouse-mobile-devtools.json`](./lighthouse-mobile-devtools.json)
and [`lighthouse-mobile-simulate.json`](./lighthouse-mobile-simulate.json)):

| | devtools throttling (real Slow 4G trace) | simulated |
|---|---|---|
| Performance | **95** | **91** |
| Accessibility | **100** | **100** |
| Best Practices | **100** | **100** |
| SEO | **100** | **100** |
| LCP | 2.0 s | 3.4 s |
| CLS | 0.019 | 0.010 |
| TBT | 190 ms | 60 ms |

Cumulative layout shift was 0.152 until the webfont was given a
metric-matched fallback face (`size-adjust` + `ascent-override`), so the swap
moves no line.

---

## Accessibility

- Every interactive target is at least 44 × 44 px. The exceptions are the
  1 × 1 honeypot and links inside a sentence, which WCAG 2.5.8 exempts.
- A skip link is the first thing in the tab order.
- Both forms have `role="status"` + `aria-live="polite"`, a visible label and
  a real `<input type="email">`.
- `prefers-reduced-motion` draws a single static frame of both fields and
  shows the full terminal transcript instead of replaying it.
- The particle field and the energy field are `aria-hidden` decoration.
- Focus rings are visible on every control.

---

## Placeholders, honestly marked

| What | Where | Status |
|---|---|---|
| Voice line | `public/media/placeholder-voice.mp3` | **Placeholder.** The repo ships the voice *code*, not an audio asset. The button and the caption both say so. |
| Privacy policy | footer | Owner TODO — rendered as a visible marker, not a dead link. |
| Terms | footer | Owner TODO — same. |

---

## Licence

The site's own code is MIT, matching the project. The artwork, the logo and
the avatar belong to rrrtx systems.
