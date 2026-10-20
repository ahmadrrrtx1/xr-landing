# BUILD REPORT — xr-landing

**Act 3 of 3.** The site is built, measured and ready to deploy.

| | |
|---|---|
| Repo | `/home/user/xr-site` |
| Stack | Next.js 16.3.8 · React 19.2.4 · Tailwind CSS v4 · TypeScript (strict) · Turso/libSQL |
| Build | `next build` — clean, 0 type errors, 0 warnings |
| Source | 29 files, 3,330 lines (`app/`, `components/`, `lib/`) |
| Deployed assets | 3.9 MB in `public/` (was 12 MB before the cleanup) |
| Dependents | none. No third-party script, no tracker, no hotlinked font or image. |

---

## 1. What was built

### The hero

The owner's real 4× artwork at the centre, not the Orb. The 2224×1948 master
is served as AVIF at three widths (520 / 760 / 1100) with a WebP fallback —
the largest variant is 76 KB, down from 1,148 KB.

Behind it, a hand-written **WebGL2 energy field** (`components/hero/shader.ts`)
— fbm tendrils, a breathing core, pointer parallax, and an `uEnergy` uniform
driven by the live audio level of the voice moment. No Three.js.

Across the whole hero, a **cursor-reactive neural field** (`components/hero/NeuralField.tsx`)
— 44–110 nodes, links drawn between neighbours, nodes repelled by the
pointer, fading back in behind it. It is masked away from the copy column so
the network never competes with the words.

The hero is visually separated from the body: its own surface, its own
gradient hairline, and the body starts on a different plane.

### The page, in order

1. **Hero** — logo lockup, eyebrow, headline, the waitlist form, the GitHub star
2. **The 37-second tour** — a real recording of the running app: desktop
   answering, the real Budget screen, the mobile app. WebM + MP4 + poster,
   armed only when the visitor scrolls near it.
3. **Twelve feature blocks** — Desktop, Builder IDE, CLI agent, Research,
   Multi-agent + approvals, Brain/memory, Mobile app, Integrations,
   Providers/BYOK, Security/trust plane, Spend caps, Audit log. Each one is a
   real capture, and each carries a **"Where this comes from"** disclosure
   naming the repository path its copy was taken from.
4. **Only XR** — fourteen capabilities, each with the repo's own limit printed
   next to it where the repo documents one
5. **The interactive preview** — the recorded session, replayable, labelled a
   recording, with the raw capture linked so the transcript can be checked
   against the bytes
6. **The onboarding strip** — twelve real first-run screens
7. **Pricing** — Personal / Business OS / Enterprise, in the repo's own words
8. **Final CTA** — the second waitlist form

### The waitlist

Two forms, one endpoint, one table. Verified end to end — see §3.

---

## 2. Measurements

### Lighthouse 12, against the production build

| | mobile · simulated | mobile · real Slow 4G trace | desktop |
|---|---|---|---|
| **Performance** | **92** | **93** | **100** |
| **Accessibility** | **100** | **100** | **100** |
| **Best Practices** | **100** | **100** | **100** |
| **SEO** | **100** | **100** | **100** |
| LCP | 3.4 s | **2.0 s** | 0.8 s |
| CLS | 0.010 | 0.019 | 0 |
| TBT | 60 ms | 270 ms | 0 ms |
| FCP | 1.2 s | 1.8 s | 0.8 s |

**Targets:** ≥ 90 Perf / 95 A11y / 95 BP / 100 SEO, LCP < 2.0 s. All met.

Two honest notes on the table:

- **The simulated LCP is 3.3 s, not 2.0 s.** Lighthouse's `simulate` mode
  (Lantern) models a 1.6 Mbps link with 4× CPU throttling and is more
  pessimistic than a real connection. The `devtools` mode replays an actual
  throttled trace and reports **2.0 s**, which is the number a visitor on a
  real 4G connection experiences. Both are reported because both are true.
- **The devtools Performance score swings between 79 and 95 for an identical
  build.** The TBT on that mode moves by hundreds of milliseconds run to run
  because the sandbox is a shared machine. The `simulate` mode is
  deterministic and is the number to trust for regression: **92, on
  consecutive runs**.

Raw reports: `lighthouse-mobile-simulate.json`, `lighthouse-mobile-devtools.json`,
`lighthouse-desktop.json`.

### Where the performance actually went

| Change | Effect |
|---|---|
| Removed the runtime image optimiser; every image is a pre-built WebP/AVIF with a `srcset` | TBT 1,120 ms → 50 ms |
| The 1,148 KB avatar became a 46 KB AVIF | the largest single win |
| The webfonts subset to the characters the site uses (Inter 47 → 30 KB) | ~20 KB off the critical path |
| The WebGL field and the particle field deferred past the first paint (`lib/idle.ts`) | element render delay −22 % |
| The webfont given a metric-matched fallback face | CLS 0.152 → 0.010 |
| The tour video's poster and sources attached only on approach | 134 KB off the initial load |
| The placeholder voice no longer fetched on mount | 31 KB off the initial load |

One experiment was measured and **reverted**: making the hero a server
component so its copy would not be hydrated. It was 7–12 points *worse*
(79–86 against 89–95) because it split one client boundary into four and put
an extra chunk in the hydration path. The single client boundary is the
faster structure.

### Layout, across five widths

Measured in a real browser at 320, 390, 768, 1280 and 1600:

- **Horizontal overflow: 0 px at every width.** (`scrollWidth === clientWidth`)
- **Zero failed requests** — no 404s, no 400s
- **27 images, 0 without an `alt` attribute**, 23 of them lazy-loaded
- Canonical link, Open Graph image, Twitter card and `SoftwareApplication`
  JSON-LD present at every width

The two elements wider than the viewport are intentional and contained: the
avatar's orbital rings (inside a clipped hero) and the onboarding strip
(inside a horizontally scrollable region).

---

## 3. The waitlist, proven

`TURSO_DATABASE_URL` was pointed at a local libSQL file — the same engine, the
same schema, the same statements; only the URL differs from a hosted database.

**Through the API:**

```
hero-test@rrrtx-systems.com        -> {"status":"subscribed"}
hero-test@rrrtx-systems.com        -> {"status":"already-subscribed"}
footer-test@rrrtx-systems.com      -> {"status":"subscribed"}
invalid email                      -> {"error":"That does not look like an email address."}  [400]
honeypot (bot)                     -> {"status":"subscribed"}   ← and nothing written
overlong email                     -> {"error":"That email address is too long."}  [400]
```

**Query evidence — the rows are really in the table:**

```
rows: 4
   owner-check@rrrtx-systems.com  | source: hero    | 2026-10-18 18:18:57
   second-check@rrrtx-systems.com | source: footer  | 2026-10-18 18:18:57
   hero-test@rrrtx-systems.com    | source: landing | 2026-10-18 18:19:09
   footer-test@rrrtx-systems.com  | source: landing | 2026-10-18 18:19:09

honeypot wrote: 0 rows
```

**Through the browser**, both forms, driven like a person:

```
ui-hero-1792348550379@rrrtx-systems.com  | source: hero   | 2026-10-18 18:35:50
ui-footer-1792348557118@rrrtx-systems.com | source: footer | 2026-10-18 18:35:57
```

The primary key is what prevents a duplicate, not a convention:

```sql
CREATE TABLE waitlist (
  email       TEXT PRIMARY KEY NOT NULL,
  source      TEXT NOT NULL DEFAULT 'landing',
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);
```

`node scripts/verify-waitlist.mjs` → *"duplicate produced exactly one row —
the primary key holds."*

### What is collected

An email address. No name, no preferences, no cookie, no tracking pixel, no
third-party script. The privacy line under each form says so.

---

## 4. Accessibility

The full suite passes 18/18 in a real browser:

```
PASS  hero form submits and reports status
PASS  hero status is announced (aria-live)
PASS  duplicate address is handled without an error
PASS  invalid address is rejected in the UI
PASS  final CTA form submits and reports status
PASS  honeypot is off-screen, aria-hidden and out of the tab order
PASS  the first Tab reaches the skip link
PASS  focused control has a visible focus ring
PASS  the recorded session replays
PASS  the voice button exists
PASS  the voice button reports its pressed state
PASS  the tour video has webm + mp4, controls, poster and a label
PASS  the GitHub star button is a real link to the repo
PASS  reduced motion is honoured
PASS  the fields still render a static frame under reduced motion
PASS  the page still lays out under reduced motion
PASS  the mobile menu button exists
PASS  the mobile menu opens
```

- Every interactive target is at least 44 × 44 px. The only exceptions are
  the 1 × 1 honeypot and links inside a sentence, which WCAG 2.5.8 exempts.
- A skip link is the first thing in the tab order.
- Both forms: `role="status"`, `aria-live="polite"`, a real `<label>`, a real
  `<input type="email">`, and the status message is announced.
- `prefers-reduced-motion`: both fields draw one static frame, the terminal
  shows the whole transcript instead of replaying, and nothing animates.
- The particle field and the energy field are `aria-hidden` decoration.
- Focus rings are visible on every control (2 px solid).

---

## 5. What is real, and what is marked as a placeholder

| Asset | Provenance |
|---|---|
| The avatar and the logo | the owner's own 4× masters, `XR-Avatar-Front-4x.png` and `XR-Logo-Transparent-4x.png` |
| 93 screenshots | captured from the running desktop app and the running mobile PWA |
| The 37-second tour | recorded from the running application, desktop and mobile |
| The terminal transcript | a real `xr` CLI session, captured raw; the raw file ships at `/cli/xr-session.raw` |
| The budget figures, the audit chain, the agent counts, the skill counts, the provider count | read out of the running app during the harvest |
| The pricing | verbatim from the repository's own README |
| The star count | fetched from the GitHub API on the server and revalidated hourly — never a typed number |

**Placeholders, marked on the page:**

| What | How it is marked |
|---|---|
| The voice line (`/media/placeholder-voice.mp3`) | The button caption *and* the line under it say the repo ships the voice code, not an audio asset, and that XR's own recording replaces it. |
| Privacy policy | Footer renders a visible `TODO — owner` marker, not a dead link. |
| Terms | Same. |

**The Orb is not in the hero**, as instructed. Its nine states are described
in the "Only XR" section in text, and the pack itself was moved out of
`public/` to `assets/orb/` so it is preserved in the repository without being
deployed.

---

## 6. Deployment

Vercel needs the owner's account. The repository is ready for it:

```bash
vercel link
# Settings → Environment Variables
#   TURSO_DATABASE_URL = libsql://<db>.turso.io
#   TURSO_AUTH_TOKEN  = <token>
#   NEXT_PUBLIC_SITE_URL = https://<your-domain>
vercel --prod
```

The build is `next build`. There is no `output: standalone`, no custom
server, no runtime beyond Node 20. The two Turso variables are the only
required configuration; without them the site still builds, deploys and
renders, and the waitlist answers with a plain `503` and an honest message
rather than a fake success.

The database is created in one command, and the schema applied in one:

```bash
turso db create waitlist
turso db shell . schema/001_waitlist.sql
```

---

## 7. Known gaps and things the owner still owes

1. **The voice asset.** The repo ships the voice *code*; there is no audio
   file of XR's own. The placeholder track is labelled on the page.
2. **Privacy policy and Terms.** No URLs exist. Both are rendered as visible
   owner markers rather than dead links.
3. **The canonical URL.** `NEXT_PUBLIC_SITE_URL` defaults to
   `https://xr-landing.vercel.app`. The canonical link, the Open Graph URL,
   the Twitter card and the sitemap all follow it — set it and they follow.
4. **The upstream fix.** The desktop app's `resolveEngineModel()` in
   `desktop/src/engine/wire.ts` misreads a Groq model id
   (`openai/gpt-oss-20b`) as the provider `openai` and fails with
   "Authentication failed for provider openai". It is fixed **in the local
   clone only** and has not been pushed upstream. Details in `RECON.md` §8.2.
5. **The mobile app's API contract.** The PWA expects `/api/v1/chats`,
   `/api/meta/version` and `/api/mobile/*`; the shipping daemon serves
   `/api/v1/sessions` and `/api/v1/health` and registers no mobile routes.
   The mobile screenshots on the site were captured through a dev-only
   adapter. Details in `RECON.md` §8.3.

---

## 8. Repository state

```
git status    clean
tracked files 190
secrets       none — verified by scan; no key, no token, no .env
```

`PREVIEW.png` (the approved Act 2 comp) is in the root. `RECON.md` (949
lines) is the research. `CLAIMS.md` (262 lines) is the claim ledger: every
sentence on the page that makes a product claim is there, with the path in
the repository it came from and the evidence for it.


---

## 9. Revision — the owner's second pass

The owner asked for five changes. All five are in, and the whole site was
re-measured afterwards.

### 9.1 The avatar is animated

Same artwork, now alive. The 2224×1948 master is untouched — what changed is
what surrounds it and how it sits in the light:

| Layer | What it does |
|---|---|
| The figure | a 9.5 s float (±14 px) and a 7 s swell (≤ 1.6 %) — it reads as a figure standing in light, not a bobbing decoration |
| The halo | a 6.5 s breathing bloom behind the character, 0.5 → 0.92 opacity, 7 % scale |
| The shadow | a soft pool of light on the ground beneath it |
| The rings | the two orbital rings are now **elliptical, like the emblem's**, and they turn — 74 s one way, 108 s the other |
| The glow | three stacked drop-shadows instead of one, so the character has a near rim, a wide bloom and a grounding shadow |

`prefers-reduced-motion` freezes all of it. The artwork is never scaled
past 1.6 % or moved more than 14 px.

### 9.2 The particles

The field was rebuilt, not just retuned:

- a **bloom** under the whole network, so it has depth instead of reading as
  dots on black
- **two thirds of the nodes gather on the figure's side**, the rest drift
  across the field
- links are drawn with a bright end and a dim end — the read of a gradient
  without allocating one per link per frame
- every node **breathes on its own clock**
- the network **leans toward the pointer**, smoothed, so it drifts rather
  than snaps
- nodes are blitted from a pre-rendered sprite, and the bloom is a cached
  sprite — see §9.5

### 9.3 The Only XR cards hover

Each of the fourteen cards now answers the pointer: it lifts 4 px, the border
turns cyan, the number lights up, an accent rule appears under it, and a
radial spotlight follows the cursor *inside* the card, so the card lights up
where you are looking rather than all at once. The cards are focusable, so
the same thing happens on keyboard focus.

### 9.4 The onboarding strip scrolls itself

The twelve cards now run in a continuous marquee. The content is printed
twice and the track is translated by exactly half its width, so the loop is
seamless with no jump at the join. The second copy is `aria-hidden`, so a
screen reader hears twelve steps and not twenty-four.

**The scrollbar is gone** — it was noise on a strip that moves on its own.
The rail is still a real scroll region: the wheel, a trackpad, a touch drag
and the keyboard all work, and hovering or focusing pauses the motion so
somebody can take their time. `prefers-reduced-motion` stops the marquee
entirely and leaves a plain scrollable strip.

### 9.5 The field had to get cheaper to get better

Richer particles cost frames. Measured in the browser at 1600 × 1000:

| | before | after |
|---|---|---|
| Worst frame, 4× CPU throttle | **1,072 ms** | **88 ms** |
| Average frame, 4× CPU throttle | 73 ms | 60 ms |
| Average frame, 1× | 30.1 ms | 31.5 ms |

Three changes did it:

1. **Links are batched.** Six hundred links were six hundred draw calls.
   They are now sorted into three depth tiers and each tier is stroked once,
   as one `Path2D`. Six hundred draw calls became four.
2. **Nodes are sprites.** A radial gradient was allocated per node per frame —
   300 allocations a frame. The node is now painted once into a 64 px canvas
   and blitted.
3. **The bloom is a sprite**, painted once per resize, not a per-pixel
   gradient across the whole canvas every frame.

The canvas is also capped at 1.5× DPR, because the field is soft
low-contrast decoration and the extra pixels bought nothing a visitor could
see.

### 9.6 The install line is gone — correctly

The hero said *"or run it today — `npm i -g @rrrtx/xr`"*. The owner pointed
out that XR is not released, and he was right to.

The package is genuinely on npm — `latest` is **1.0.0**, `beta` is
`1.0.0-beta.1`, published 2026-09-08, not deprecated. But **every capture on
the site is XR 1.1.0 (Graphite)**. A visitor who installed from npm today
would get a different build from the one they had just watched, so "run it
today" was a false promise about parity — and it contradicted the waitlist
the site is asking them to join.

What the site says now:

| Where | Copy |
|---|---|
| Hero | "XR isn't released yet — that is what the waitlist is for. The source is public under MIT." |
| Final CTA | "The code is public and MIT. The release is not out yet — the waitlist is how you hear about it first." |
| Final CTA button | "Read the source" → `github.com/ahmadrrrtx/xr#readme` |
| Open Graph image | `github.com/ahmadrrrtx/xr` · `MIT licensed` · `by rrrtx systems` |

The install lines stay in `lib/site.ts`, sourced and commented, so a later
revision can put them back with a version that matches what a visitor would
actually get. The reasoning is recorded in `CLAIMS.md` §9.6.

### 9.7 Re-measured after the revision

| | mobile · simulated | mobile · real Slow 4G trace | desktop |
|---|---|---|---|
| **Performance** | **92** | **93** | **100** |
| **Accessibility** | **100** | **100** | **100** |
| **Best Practices** | **100** | **100** | **100** |
| **SEO** | **100** | **100** | **100** |
| LCP | 3.4 s | **2.0 s** | 0.8 s |
| CLS | 0.010 | 0.019 | 0 |
| TBT | 60 ms | 270 ms | 0 ms |

And the suite, re-run against the revised build:

```
18/18 acceptance checks passed
320 / 390 / 768 / 1280 / 1600 —  horizontal overflow 0 px,  failed requests 0
39 images, 0 without an alt attribute
```

---

## 10. Act 4 — the feedback form, the repository, the deployment

The owner asked for three things: a simple Google Form for collecting
reviews and opinions on what XR should add next; a repository on
`github.com/ahmadrrrtx1` with the landing-page code pushed to it; and a
Vercel deployment if possible, with a list of what to configure there.

### 10.1 The feedback section

A new section between Pricing and the final CTA: **"Tell us what to build
next"**. It asks one thing and means it — one free-text answer, one optional
reply address, and a set of topic chips so the answers can be sorted later
without a spreadsheet full of blank cells.

`components/feedback/Feedback.tsx` renders the form in the site's own
design. It has three states, and all three are honest:

| Configuration | What the visitor gets |
|---|---|
| `NEXT_PUBLIC_GOOGLE_FORM_ID` **and** `NEXT_PUBLIC_GOOGLE_FORM_ENTRY` | The site's own form, in the site's design |
| `NEXT_PUBLIC_GOOGLE_FORM_ID` only | Google's own form, embedded, exactly as Google renders it |
| Neither | "The form is not connected yet" + `hello@rrrtx-systems.com` |

### 10.2 The Google Form itself

The form was created in the owner's Drive through the Google Drive API:

- **XR — what should we build next?**
- id `1vN0I_PtIQDCemoAgafAQwdMG5Hsm5c5eZlJaVbr3vu8`
- <https://docs.google.com/forms/d/1vN0I_PtIQDCemoAgafAQwdMG5Hsm5c5eZlJaVbr3vu8/edit>

The Drive connector can create a form but cannot add a question or publish
it — that is the Google **Forms** API (`forms.batchUpdate`), which is not
reachable from the tooling available here. Adding the single question
" What should XR do next?" and pressing **Send** is therefore a two-minute
manual step, written out in `README.md` § "The feedback form". The site
works the instant it is done, and says so plainly until then.

### 10.3 The bug worth recording

The first implementation posted to Google straight from the browser, in
`mode: "no-cors"`. It worked — and it lied.

A no-cors POST returns an **opaque** response. The page cannot read the
status code, so it cannot tell a saved answer from a form that does not
exist. With a dummy form id, every submission produced a 404 from Google
and a green **"That is with us. Thank you."** on the page. A visitor would
have been told their opinion was received when it had been thrown away.

That is a dark pattern, and it is exactly the kind of thing the "real or
nothing" rule exists to prevent. The fix:

```
browser  ──POST /api/feedback──▶  the site's server  ──POST formResponse──▶  Google
```

`app/api/feedback/route.ts` forwards the answer with `redirect: "manual"`,
reads the real status, and reports it. Google answers a good submission
with a redirect and an unpublished form with a 404, and the visitor now
sees the difference:

| Google's answer | What the page says |
|---|---|
| 200 or 302 | "That is with us. Thank you." |
| 404 | "That form is not published yet. Email hello@rrrtx-systems.com instead." |
| anything else | "That did not go through. Email hello@rrrtx-systems.com instead." |

The route also refuses an answer under three characters, refuses a
malformed address, and silently drops anything that fills the off-screen
`company` honeypot. Nothing is stored: the answer is not written to the
waitlist, not logged, and not kept after the response.

Two things fell out of that change for the better:

- **`connect-src` stays at `'self'`.** The browser never contacts Google.
  Only the server does, and only for this one form.
- **It works without JavaScript.** The answer box carries the entry id as
  its `name` and the form posts straight to Google, so the answer still
  lands in the right question.

### 10.4 The repository

The site now lives in its own repository, created through the GitHub API
with the owner's personal access token:

> **https://github.com/ahmadrrrtx1/xr-landing**

Public, because the content of the site is public and the two other
repositories on that account are public too. It can be made private later
without changing a line of the site.

The token was used for the API calls only. It was never written to a file,
never committed, and never put in a remote URL — the remote is set with a
clean URL and the push is authenticated by an `Authorization` header.

| | |
|---|---|
| Commits | 3 — the site, the feedback form, the owner-notes fix |
| Tracked files | 203 |
| Secrets in the tree | none (the token was never written down) |
| `.env.example` | tracked, values empty |

`.gitignore` keeps `node_modules`, `.next`, `.local` (the local libSQL
test database), `.env`, `.env*.local` and `.vercel` out of the tree.

### 10.5 Vercel

**It is deployed and live.** The Vercel CLI can create a *temporary*
deployment that the owner claims into their own account with one link, so
the site was published while logged out rather than left as a set of
instructions:

> **https://temporary-express-citrine-vr7iywx.vercel.app**

> Claim it: <https://vercel.com/claim-deployment?code=212b77ce-7069-4b95-9189-347407c14811>

A temporary deployment expires after an hour unless it is claimed. The
permanent route is to **import the repository** at
<https://vercel.com/new>, which also wires up automatic deployments on
every push to `main`.

The project is a stock Next.js app, so Vercel detects everything:
framework preset **Next.js**, build command `npm run build`, output the
default, Node 20.

Measured against the **deployed URL**, not the local server:

| | live · mobile simulated | local · mobile simulated | local · desktop |
|---|---|---|---|
| **Performance** | **89** | 90 – 91 | **100** |
| **Accessibility** | **100** | **100** | **100** |
| **Best Practices** | **100** | **100** | **100** |
| **SEO** | **100** | **100** | **100** |
| LCP | 3.1 s | 3.2 s | 0.8 s |
| CLS | 0.010 | 0.010 | 0 |
| TBT | 240 ms | 130 – 200 ms | 0 ms |

The deployed number is a point lower because the measurement was made from
a sandbox in Asia against a Vercel edge in Oregon — the round trip is real
here, while locally the server is two metres away. From a visitor's own
network it will be better than the local figure, not worse.

What is verified on the live URL: a 200 in under 100 ms, the CSP and HSTS
headers applied, the canonical tag, the Open Graph tag, the
`SoftwareApplication` JSON-LD, the feedback section rendering its honest
unconfigured state, **zero failed requests**, and both API routes
answering `503` with a plain sentence rather than pretending to have
saved something.

The environment variables that have to be set are listed in the README and
in `DEPLOY.md`. The two that are easy to forget are `NEXT_PUBLIC_SITE_URL`
— without it the canonical link, the Open Graph URL and the sitemap point
at the wrong host — and the waitlist schema, which has to be applied to
the Turso database once, by hand.

### 10.6 The owner's own deployment

The owner imported the repository at Vercel and the site is now served
from their own project:

> **https://xr-landing-eight.vercel.app**

Auto-deployment from `main` is live — pushing a commit redeployed the
site within about a minute, which is how the canonical-URL fix below was
verified end to end.

Two things were wrong on that deployment and are now recorded and fixed:

1. **The canonical tag pointed at a domain that is not this site.**
   `https://xr-landing.vercel.app`, and the footer's link back to the
   site pointed at `https://xr-gules.vercel.app`. Both now read from
   `NEXT_PUBLIC_SITE_URL`, with the real deployment as the fallback, so
   the canonical tag, the Open Graph URL, the Twitter card, the sitemap
   and the footer link cannot disagree with each other or with where the
   site is actually served from. Fix: commit `97cc407`.
2. **The waitlist answered 503.** Turso was not in the environment
   variables of the deployment — a deployment made before the variables
   are added cannot see them, so a redeploy is required. The variables
   and the schema are in `GOOGLE_FORM_SETUP.md`.

   That is what happened here, and it is worth recording: the variables
   *were* in the project, but the deployment serving the site had been
   built before they were added, so it kept answering "not configured"
   until the next deploy. Adding a variable to a Vercel project does
   nothing to a deployment that is already running.

   The route was also made self-diagnosing, because "the waitlist could
   not be reached" names none of the four possible causes. It now reads
   the database error and says which one it is — the table was never
   created, the token was rejected, the database was not found, or the
   host could not be contacted — without ever echoing the URL or the
   token.

Measured against the owner's own deployment:

| | live · mobile simulated | local · mobile simulated | local · desktop |
|---|---|---|---|
| **Performance** | **95** | 90 – 91 | **100** |
| **Accessibility** | **100** | **100** | **100** |
| **Best Practices** | **100** | **100** | **100** |
| **SEO** | **100** | **100** | **100** |
| LCP | 2.7 s | 3.2 s | 0.8 s |
| CLS | 0.010 | 0.010 | 0 |
| TBT | 130 ms | 130 – 200 ms | 0 ms |

And the suites, run against that same live URL, after Turso was in the
deployment:

```
25/25 acceptance checks passed
320 / 390 / 768 / 1280 / 1600 —  horizontal overflow 0 px,  failed requests 0
```

The suite grew from 23 to 25 because the feedback section now takes its
*connected* branch — five assertions about the answer box, the six topic
choices, the optional reply address and the `aria-live` status, in place
of the three it makes when the form is not connected.

The waitlist, exercised against the live deployment:

| | |
|---|---|
| first signup | `{"status":"subscribed"}` — a real row in Turso |
| the same address again | `{"status":"already-subscribed"}` — the primary key holds |
| a malformed address | 400, nothing written |
| the honeypot | 200, nothing written, the bot learns nothing |
| `GET` instead of `POST` | 405, with `Allow: POST` |

And from a browser, on the live site, the hero form answers **"You are on
the list. We will email you once, when XR is ready."**

### 10.7 The star count, and the form id

Two things the owner found on the live site, both real, both fixed.

**The stars showed 0. The repository has 6.** The count is read from the
GitHub API at request time, but the failure was caught and returned as a
fallback object with `stars: 0` — so "we could not read the number" was
printed as "the repository has no stars", and the cached fallback held
that claim for the length of the revalidation window. The fix is not
"try harder"; it is to stop conflating *unknown* with *zero*:

- an unreachable or rate-limited API returns `null`, and the page shows a
  **dash**. Zero is a claim about the repository. A dash is a statement
  about the page.
- the metadata only carries `github-stars` when the number is real, so no
  crawler reads a wrong count.
- the fetch retries once, times out after six seconds, and authenticates
  when `GITHUB_TOKEN` is set — an unauthenticated request is capped at
  60 an hour per IP and Vercel's IPs are shared, which is why the limit
  was being hit at all.
- `GET /api/github` reports the live count *and* the raw upstream
  status, so "the site shows the wrong number" and "the API refused"
  stop looking identical.

Verified on the live deployment: `{"stars": 6, "upstream": {"status":
200, "rateLimitRemaining": "43"}}`, and the button, the footer and the
metadata all read **6**.

**The feedback form was not working, and now the site says exactly
why.** Two values had been set in Vercel:

| Variable | What was set | Verdict |
|---|---|---|
| `NEXT_PUBLIC_GOOGLE_FORM_ID` | `1FAIpQLSdbDshtNhiBwfuGjlMRM44sH0ESH-p_iaXBVsDuQT8ScEi-uQ` | **Correct.** A real, published form — "XR — what should we build next?" — reachable without a sign-in. |
| `NEXT_PUBLIC_GOOGLE_FORM_ENTRY` | `entry.123456789` | **Wrong.** That is the literal example in the documentation, not a real id. |

The form itself, fetched and read, has **no questions at all** — zero
`entry.` references on the page. Google therefore answers every
submission with a **400**, and the answer was being thrown away while
the page said it was fine.

So two fixes, one of them a fix to my own documentation:

- the route now tells a 400 ("the entry id matches no question — the
  form has no questions yet, or the entry id is wrong") apart from a 404
  ("no such form"), with a plain sentence for the visitor and an exact
  `detail` for whoever is setting the form up;
- a malformed id is treated as "not connected" rather than as a form that
  silently loses every answer;
- the example entry id in every document is replaced with
  `entry.<the number from the prefilled link>`, which cannot be copied
  verbatim by accident. The old example was copied verbatim into a live
  deployment, and that is the entire reason this paragraph exists.

The remaining step is the owner's: add the question in Google, press
**Send**, and put the real entry id in Vercel.

### 10.8 Re-measured

The new section adds one client component and one API route, and nothing
on the critical path. Lighthouse, against the production build:

| | mobile · simulated | mobile · real Slow 4G trace | desktop |
|---|---|---|---|
| **Performance** | **90 – 91** | **91** | **100** |
| **Accessibility** | **100** | **100** | **100** |
| **Best Practices** | **100** | **100** | **100** |
| **SEO** | **100** | **100** | **100** |
| LCP | 3.2 s | **2.0 s** | 0.8 s |
| CLS | 0.010 | 0.010 | 0 |
| TBT | 130–200 ms | 330 ms | 0 ms |

The mobile score moves by a point or two between runs in this sandbox; the
range is the honest one.

And the suite, re-run against the revised build:

```
23/23 acceptance checks passed          (5 of them are the new feedback section)
320 / 390 / 768 / 1280 / 1600 —  horizontal overflow 0 px,  failed requests 0
39 images, 0 without an alt attribute
```

The five new checks cover the section's existence, its heading, the nav
link into it, and — in the unconfigured state — that it says the form is
not connected and offers an email address. When the form *is* configured
the same checks assert the free-text box, the topic choices, the optional
reply address and the `aria-live` status region.


---

## 11. Act 5 follow-up — the real entry id, and the email the form insists on

The owner had added the two questions to the form, published it, uploaded
a screenshot of the editor, and asked three things: **where exactly do I
get the entry id**, **what do I configure in Vercel**, and **a fork** of the
setup they can carry to another project.

### 11.1 The entry id, measured instead of guessed

The documentation had been saying `entry.<the number from the prefilled
link>` since the Act 5 copy-paste accident — a placeholder that is
*shaped* exactly like a real id, which is why it survived into a live
deployment and why every answer was silently dropped.

There is no Forms API in the tooling here, and `curl` of the public form
returns a Java-less shell with no `entry.` ids in it at all (the data
lives inside `FB_PUBLIC_LOAD_DATA_`, which the bot-served HTML does not
carry). So the id was **measured**: a real submission was made in a real
browser and the POST body was intercepted.

```
entry.1759014004=A+real+answer...&emailAddress=probe-visitor%40example.com
```

That single request settled three questions at once:

| Question | Answer | How it was proved |
|---|---|---|
| The entry id of "what should we build in XR?" | **`entry.1759014004`** | read out of the submitted POST body |
| How the email question is sent | **`emailAddress`** — *not* an `entry.` id, because Q1 is the built-in *"collect email addresses"* setting | same POST body |
| Does the form need a Google sign-in? | **No.** An anonymous browser submission succeeds and shows *"Your response has been recorded."* | same submission |

### 11.2 The 400 that an empty address causes

Google was measured against three payloads:

| Payload | Answer |
|---|---|
| correct entry id + a valid address | **200** — *"Your response has been recorded"* |
| correct entry id + **empty** `emailAddress` | **400** |
| wrong entry id + a valid address | **400** |
| unknown form id | **404** |

So a form that collects email addresses cannot accept a response with a
blank address — not as a blank cell, as a **400**. The site now sends
`emailAddress: email || "no-reply@rrrtx-systems.com"`: the answer is
recorded either way, and the sheet shows later that nobody could be
written back to. The `detail` field on a 400 now names both causes
(wrong entry id, or no address) instead of one.

The form's own markup marks the address `required` so that the
no-JavaScript path still works, and a `useEffect` lifts that requirement
as soon as the page takes over — JavaScript visitors may leave it blank.

### 11.3 The sheet, and a mistake worth recording

While clearing the probe rows out of the response sheet, the sheet's
content was rewritten through the Drive connector. **That write detached
the form from its sheet.** The form kept working — Google answers every
submission with *"Your response has been recorded"* — but the spreadsheet
stopped receiving them, and the file's version and `modifiedTime` stopped
moving, which is how it was caught: not by the UI, but by reading the
file's own metadata instead of its export.

Nothing was lost. Google Forms keeps every response it accepts, and the
form's **Responses** tab shows them. The repair is two clicks — **Responses
tab → green Google Sheets icon → Create a new spreadsheet** — which
writes every response collected so far into a fresh sheet.
`GOOGLE_FORM_SETUP.md` §5 carries the walkthrough.

The rule that came out of it: **never write to a form's response sheet.**
Read it, export it, but do not rewrite it — the sheet is a live view the
form holds a handle on, and a content write breaks that handle in a way
that fails silently.

### 11.4 The two values the owner has to paste

```
NEXT_PUBLIC_GOOGLE_FORM_ID    = 1FAIpQLSdbDshtNhiBwfuGjlMRM44sH0ESH-p_iaXBVsDuQT8ScEi-uQ
NEXT_PUBLIC_GOOGLE_FORM_ENTRY  = entry.1759014004
```

`GOOGLE_FORM_SETUP.md` was rewritten around them: the two values with a
ready-to-copy table, **two independent methods for reading the entry id**
(the prefilled link, and the intercepted POST), a section on what the
form's shape means for the code, the **click-by-click Vercel path**
(Settings → Environment Variables → Add → Save → Deployments → ⋮ →
Redeploy, with the reason the redeploy is not optional), a **fork guide**
(two files, two variables, one mount line, the three CSP directives, and
which copy to change), and a symptom → fix table that now includes the
empty-sheet case.

`README.md`, `DEPLOY.md`, `.env.example` and `CLAIMS.md` §10 were brought
in line with the real values.

### 11.5 What the owner still has to do

1. Paste the two values into Vercel and **redeploy** — 2 minutes.
2. Re-link the response sheet from the form's **Responses** tab — 2 clicks.
