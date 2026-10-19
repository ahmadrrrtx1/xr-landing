# Google Form setup — every file, every value, every step

This is the whole kit for the "tell us what to build next" form: the form
itself, the two values you need from it, the files in this repository that
make it work, the environment variables to paste into Vercel, and how to
prove it works afterwards.

> **Where things stand right now**
>
> | | |
> |---|---|
> | The site | **https://xr-landing-eight.vercel.app** — live |
> | The waitlist | **working.** It writes real rows to Turso. |
> | The feedback form | **not connected yet.** Two values are missing, and they can only come from the published form. |
>
> Everything in this document is about those last two values. The rest of
> the site is done and verified — 23/23 acceptance checks pass against the
> live URL.

---

## 1. The form — it already exists

It was created in your Google Drive through the Drive API:

| | |
|---|---|
| Name | **XR — what should we build next?** |
| Edit it | <https://docs.google.com/forms/d/1vN0I_PtIQDCemoAgafAQwdMG5Hsm5c5eZlJaVbr3vu8/edit> |
| Drive file id | `1vN0I_PtIQDCemoAgafAQwdMG5Hsm5c5eZlJaVbr3vu8` |
| Description | "Feedback form for the XR landing site: *What should XR do next?* Responses are collected here." |
| Current state | **no questions, not published** — the two steps below are still to do |

> The Drive file id and the *published* form id are usually the same
> string, but do not assume it. Take both values from the form's own link
> after you have published it.

---

## 2. Two steps in Google, then two values

### Step 1 — add the question

Open the form. Click the **＋** next to "Question 1" and type:

```
What should XR do next?
```

- **Type:** Paragraph (or Short answer — both work)
- **Required:** on

Optionally add a second question, short answer, not required:

```
Your email (only if you want a reply)
```

### Step 2 — publish it

Click **Send** in the top right. Choose the share setting, and make sure
**"Anyone with the link"** is on, or that *"Anyone in <your domain>"* is
on and you are happy with that. The form has to be reachable by somebody
who is not signed in, or a visitor will get a sign-in wall instead of your
form.

### Step 3 — copy the two values

Click the menu (⋮) next to the Send button → **Get prefilled link**. You
get a link that looks like this:

```
https://docs.google.com/forms/d/e/1FAIpQLSc_EXAMPLE_REAL_ID/viewform?entry.123456789
                               └── FORM ID ──┘             └── ENTRY ID ──┘
```

- **`NEXT_PUBLIC_GOOGLE_FORM_ID`** = the part between `d/e/` and `/viewform`
- **`NEXT_PUBLIC_GOOGLE_FORM_ENTRY`** = the `entry.123456789` at the end

The entry id is the id of your *first question*. If you added the email
question first and the "what should we build next" question second, use
the id belonging to the paragraph question — it is the one whose id ends
up in the prefilled link when that question is selected.

---

## 3. The five environment variables for Vercel

**Project → Settings → Environment Variables → Add.** Set them for
**Production** (and **Preview**, if you want previews to work).

| Name | Value | Notes |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | `https://xr-landing-eight.vercel.app` | **Set this one.** It drives the canonical tag, the Open Graph URL, the Twitter card, the sitemap and the footer's link back to the site. |
| `TURSO_DATABASE_URL` | `libsql://<your-db>.turso.io` | **Already set — working.** From Turso → your database → the URL at the top. |
| `TURSO_AUTH_TOKEN` | *(the token Turso gave you)* | **Already set — working.** Turso → **Tokens → Create API Token**. |
| `NEXT_PUBLIC_GOOGLE_FORM_ID` | `<FORM ID from step 3>` | A public identifier. Not a secret. |
| `NEXT_PUBLIC_GOOGLE_FORM_ENTRY` | `entry.123456789` | A public identifier. Not a secret. |

**Then redeploy.** Vercel bakes environment variables into the deployment
when it builds, so a deployment made before you added them will keep
answering "not configured" no matter what you do to the settings page.
**Project → Deployments → ⋯ → Redeploy**, or push a commit.

This is not hypothetical — it is exactly what happened with Turso. The
variables were in the project, but the deployment that was serving had
been built before they were added, so it kept answering "not configured"
until the next deploy. If you add a variable and nothing changes, check
the deployment, not the settings page.

None of these five values is a credential for a service that can charge
you money, send email, or read your database. The only one that grants
access to anything is the Turso token, and it only writes to the one
waitlist table.

---

## 4. The files in this repository

| File | What it does |
|---|---|
| `components/feedback/Feedback.tsx` | The section on the page. Renders the form in the site's own design, handles the three states (native form / Google's embedded form / not connected yet), the topic chips, the optional reply address, the `aria-live` status and the honeypot. |
| `app/api/feedback/route.ts` | The server route the browser posts to. It forwards the answer to Google, reads the real status and reports it back. It also rejects answers under 3 characters, rejects a malformed address, and drops anything that fills the honeypot. |
| `next.config.ts` | The CSP. `connect-src` stays at `'self'`; `form-action` and `frame-src` name `https://docs.google.com`. |
| `app/page.tsx` | Where the section is placed, and the nav entry that links to it. |
| `lib/site.ts` | The nav list and the site's own address. |
| `.env.example` | The template that lists the five variables with the Google Form ones already documented. |
| `DEPLOY.md` | The whole Vercel handover — every setting, every variable, the waitlist schema, custom domains. |
| `schema/001_waitlist.sql` | The waitlist table. Not part of the form, but the other thing that has to be applied by hand. |

None of these are secret. There is no API key, no service account and no
OAuth anywhere in the Google Form path.

---

## 5. The waitlist schema — the other manual step

The waitlist table has to exist before the first signup. In the **Turso
dashboard**: open the database → **SQL** → paste the file → **Run**.

```sql
CREATE TABLE IF NOT EXISTS waitlist (
  email       TEXT PRIMARY KEY NOT NULL,
  source      TEXT NOT NULL DEFAULT 'landing',
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);
```

Or from a terminal:

```bash
npx @libsql/client@latest schema/001_waitlist.sql "libsql://your-db.turso.io" --auth-token "$TURSO_AUTH_TOKEN"
```

---

## 6. Prove it works

Four checks, in this order. The first two need no arguments.

```bash
# 1. the page is up and the feedback section is no longer saying "not connected"
curl -s https://xr-landing-eight.vercel.app/ | grep -o "Tell us what to build next"

# 2. the waitlist is connected (200, not 503)
curl -s -X POST https://xr-landing-eight.vercel.app/api/subscribe \
  -H 'Content-Type: application/json' \
  -d '{"email":"yourname@rrrtx-systems.com","source":"footer"}'
#   -> {"status":"subscribed"}         first time
#   -> {"status":"already-subscribed"}  the second time (the primary key holds)

# 3. the feedback route reaches Google
curl -s -X POST https://xr-landing-eight.vercel.app/api/feedback \
  -H 'Content-Type: application/json' \
  -d '{"answer":"A real answer, long enough to be useful.","area":"Memory & brain"}'
#   -> {"ok":true}                       Google accepted it
#   -> {"ok":false,"error":"That form is not published yet. ..."}   the form id is wrong or the form is not published
#   -> {"ok":false,"error":"The feedback form is not connected yet."}  the env var is missing — redeploy

# 4. the answer is in the sheet
#    open the form -> Responses tab
```

Then open the live site in a browser, type an answer, press **Send it**,
and watch it say *"That is with us. Thank you."* Only then will it say
that — and only because Google confirmed it.

---

## 7. If something is wrong

| What you see | Why | What to do |
|---|---|---|
| "The form is not connected yet" on the page | `NEXT_PUBLIC_GOOGLE_FORM_ID` is not in the deployment | Add it, then **redeploy** — the old deployment cannot see it |
| "That form is not published yet." | The form id is wrong, or the form was never published with **Send** | Copy the id out of the form's own link again; make sure the form is shared with "anyone with the link" |
| Google returns 200 but the sheet is empty | The entry id does not match your question | Re-copy the prefilled link; the entry id must belong to the paragraph question |
| "The waitlist database is not configured yet" | The two Turso variables are missing from the deployment | Add them and redeploy |
| The signup says "could not save" but the page looks fine | The schema was never applied to the Turso database | Run `schema/001_waitlist.sql` against it |
| The canonical tag still points at `xr-landing.vercel.app` | `NEXT_PUBLIC_SITE_URL` is not set, or the deployment predates it | Set it and redeploy |
| The form is embedded but looks out of place | You set only the form id, so Google renders its own form | Also set `NEXT_PUBLIC_GOOGLE_FORM_ENTRY` and the site renders its own form in the site's design instead |
