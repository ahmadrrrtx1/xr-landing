# Google Form setup — every value, every click, every step

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
> | The feedback form | **published, two questions, both live.** The only thing missing is two environment variables in Vercel and a redeploy. |
>
> The rest of the site is done and verified — 25/25 acceptance checks pass
> against the live URL.

---

## 1. The two values, ready to copy

These are the only two things you have to set. They are **public
identifiers, not secrets** — they appear in the page source of any site
that embeds the form. There is no API key, no service account and no
OAuth anywhere in this path.

| Name | Value |
|---|---|
| `NEXT_PUBLIC_GOOGLE_FORM_ID` | `1FAIpQLSdbDshtNhiBwfuGjlMRM44sH0ESH-p_iaXBVsDuQT8ScEi-uQ` |
| `NEXT_PUBLIC_GOOGLE_FORM_ENTRY` | `entry.1759014004` |

Copy them as-is. The first one you already had right. The second one is
the real entry id of your question — it was `entry.123456789`, the literal
example from the documentation, which is why Google was answering every
submission with a **400**.

---

## 2. Where those two values come from (so you can check them yourself)

Your form:
**<https://docs.google.com/forms/d/e/1FAIpQLSdbDshtNhiBwfuGjlMRM44sH0ESH-p_iaXBVsDuQT8ScEi-uQ/edit>**

### 2.1 The form id

It is the long string in the form's own address bar, between `d/e/` and
`/viewform`:

```
https://docs.google.com/forms/d/e/1FAIpQLSdbDshtNhiBwfuGjlMRM44sH0ESH-p_iaXBVsDuQT8ScEi-uQ/viewform
                               └── this bit, all of it ──┘
```

### 2.2 The entry id

An entry id is the id Google gives one **question**. Yours is:

```
entry.1759014004
```

There are two ways to read it yourself, and the second one is the one that
cannot lie.

**Method A — the prefilled link (one click)**

1. In the form editor, click the **⋮** (three dots) at the top right,
   next to the **Send** button.
2. Click **Get prefilled link**.
3. A panel opens with a **link that already has your question selected** —
   it ends with `?entry.1759014004`.
4. Copy the part after `?`. That is `entry.1759014004`.
5. Press **Cancel** / close the panel — you do not want a pre-filled form
   floating around.

> If you open the prefilled link and it shows your answer question
> pre-selected, the number at the end is the right one. If it shows a
> different question selected, you picked the wrong question in step 3 —
> pick **"what should we build in XR?"** and read the link again.

**Method B — submit it and read what Google actually received (this is how
it was confirmed here)**

1. Open the form's public link in a browser:
   <https://docs.google.com/forms/d/e/1FAIpQLSdbDshtNhiBwfuGjlMRM44sH0ESH-p_iaXBVsDuQT8ScEi-uQ/viewform>
2. Fill in the email and the answer, press **Submit**.
3. Google shows *"Your response has been recorded."* — that proves the
   whole path works, anonymously, with no sign-in.
4. The submitted data is what the site sends. It has exactly two fields:

   | Field | Value | What it is |
   |---|---|---|
   | `entry.1759014004` | the answer text | your question, *"what should we build in XR?"* |
   | `emailAddress` | the visitor's address | **not** `entry.…` — see below |

---

## 3. Your form has two questions — and only one of them is an entry id

This is the part that trips people up, so it is worth being precise.

Looking at your screenshot, the form has:

| # | Question | How Google sends it |
|---|---|---|
| 1 | **Email** | as `emailAddress` — **not** as an `entry.` id |
| 2 | **what should we build in XR?** | as `entry.1759014004` |

**Question 1 is the built-in "collect email addresses" setting.** It is
not a normal question, so it does not get an `entry.` id — it is posted
under the name `emailAddress`. That is Google's own name for it, and the
site has to use that name or Google rejects the submission.

**This has a consequence worth knowing:** because the form collects
addresses, **Google answers a response with an empty address with a
400** — not with a blank cell. The site therefore behaves like this:

- Visitor leaves the address blank → the site sends
  `emailAddress=no-reply@rrrtx-systems.com` so the answer is still
  recorded. It is filed against a no-reply address on your own domain, so
  it is obvious later that nobody could be written back to.
- Visitor types an address → it is sent as-is and you can reply.

If you would rather every answer carry a real address, turn the reply
field into a required field in the site's code — one line — or switch the
form's email question off entirely in Google (**Settings → Responses →
Collect email addresses → off**), in which case the form stops sending
`emailAddress` and the site stops sending it too.

**Sign-in is not required.** The form can be submitted by somebody who is
not signed in. The *"Sign in to Google to save your progress"* line at the
top of the public form is optional; it does not block a submission.

---

## 4. Vercel — click by click

Two variables, then a redeploy. That is the whole job.

**Open the project**
<https://vercel.com/dashboard> → click **xr-landing-eight** → the
**Settings** tab → **Environment Variables** in the left-hand list.

> If you landed on the Vercel home page, the project is the one called
> **`xr-landing-eight`**. If you do not see it, you are in the wrong
> team/account — check the account switcher in the top-left corner.

**Add the first variable**

1. Click **Add Environment Variable** (or the green **Add** button).
2. **Key**: `NEXT_PUBLIC_GOOGLE_FORM_ID`
3. **Value**: `1FAIpQLSdbDshtNhiBwfuGjlMRM44sH0ESH-p_iaXBVsDuQT8ScEi-uQ`
4. **Environment**: tick **Production** ✅ and **Preview** ✅
   (tick **Development** too if you want it locally).
5. Click **Save**.

**Add the second variable**

1. Click **Add Environment Variable** again.
2. **Key**: `NEXT_PUBLIC_GOOGLE_FORM_ENTRY`
3. **Value**: `entry.1759014004`
4. **Environment**: **Production** ✅ and **Preview** ✅
5. Click **Save**.

**Redeploy — this part is not optional**

Vercel bakes environment variables into the deployment **when it builds**.
A deployment made before you added them keeps answering "not connected"
no matter what the settings page says.

- **Project → Deployments** (the tab at the top of the project)
- The **latest deployment** is the one at the top of the list
- Click the **⋯** (three dots) on the right of that row
- Click **Redeploy**
- Wait for the status to go green — usually **45–90 seconds**

> This is not hypothetical: it is exactly what happened with the Turso
> variables earlier. They were in the project, but the deployment serving
> traffic had been built before they were added, so it kept answering
> "not configured" until the next deploy. If you add a variable and
> nothing changes, look at the **deployment**, not the settings page.

**Proof it took**

```bash
curl -s https://xr-landing-eight.vercel.app/ | grep -c "Tell us what to build next"
```

Open the live site, scroll to the feedback section, and you should see
**the site's own form** — topic chips, the answer box and the optional
reply address — not Google's white form embedded in a frame. If you see
Google's own form, the entry id is missing; if you see *"The form is not
connected yet"*, the form id is missing.

---

## 5. Re-link the response sheet (two clicks in Google)

> **Do this one.** The form itself is working and Google is recording
> every response it receives, but the spreadsheet that used to mirror the
> answers stopped receiving them — a cleanup write to that sheet
> detached the form from it. The responses are still safe inside Google
> Forms; this step puts the sheet back in front of them.

1. Open the form editor:
   <https://docs.google.com/forms/d/e/1FAIpQLSdbDshtNhiBwfuGjlMRM44sH0ESH-p_iaXBVsDuQT8ScEi-uQ/edit>
2. Click the **Responses** tab at the top (next to **Questions**).
   You should see a short list of the responses that have come in.
3. In the toolbar above that list click the **green Google Sheets icon**
   (or the **⋮** menu → **Link to Sheets**).
4. Choose **Create a new spreadsheet**. Google makes a fresh sheet called
   **"XR — what should we build next? (Responses)"** and writes **every
   response collected so far** into it, including the ones the site has
   been sending.
5. That is it. The old, empty sheet can be deleted from Drive — it holds
   nothing but a header row.

> If the **Responses** tab shows the old sheet still linked, remove it
> first: in **Settings → Responses → Link to Sheets**, turn the link off,
> press **Save**, then turn it on again and choose **Create a new
> spreadsheet**.

---

## 6. The files in this repository

| File | What it does |
|---|---|
| `components/feedback/Feedback.tsx` | The section on the page. Renders the form in the site's own design, handles the three states (native form / Google's embedded form / not connected yet), the topic chips, the optional reply address, the `aria-live` status and the honeypot. |
| `app/api/feedback/route.ts` | The server route the browser posts to. It forwards the answer to Google, reads the real status and reports it back. It also rejects answers under 3 characters, rejects a malformed address, drops anything that fills the honeypot, and fills in the no-reply address when the visitor leaves theirs blank. |
| `next.config.ts` | The CSP. `connect-src` stays at `'self'`; `form-action` and `frame-src` name `https://docs.google.com`. |
| `app/page.tsx` | Where the section is placed, and the nav entry that links to it. |
| `lib/site.ts` | The nav list and the site's own address. |
| `.env.example` | The template that lists the variables with the Google Form ones already documented. |
| `DEPLOY.md` | The whole Vercel handover — every setting, every variable, the waitlist schema, custom domains. |
| `schema/001_waitlist.sql` | The waitlist table. Not part of the form, but the other thing that has to be applied by hand. |

None of these are secret. There is no API key, no service account and no
OAuth anywhere in the Google Form path.

---

## 7. Fork it into another project

The whole feature is **two files** plus **two environment variables**. To
put it in a different site:

**1. Copy the two files**

```
components/feedback/Feedback.tsx
app/api/feedback/route.ts
```

Both are plain React/Next — no extra dependencies, no provider, no
package to install.

**2. Mount the section**

```tsx
// app/page.tsx (or any page)
import Feedback from "@/components/feedback/Feedback";

export default function Page() {
  return (
    <>
      {/* … your page … */}
      <Feedback />
    </>
  );
}
```

The section is a plain `<section id="feedback">` with a `scroll-mt-24`
anchor, so a nav link to `#feedback` lands correctly. Add one to
`lib/site.ts` if you want it in the menu.

**3. Set the two environment variables**

```
NEXT_PUBLIC_GOOGLE_FORM_ID=1FAIpQLSdbDshtNhiBwfuGjlMRM44sH0ESH-p_iaXBVsDuQT8ScEi-uQ
NEXT_PUBLIC_GOOGLE_FORM_ENTRY=entry.1759014004
```

**4. Allow Google in the CSP** — if you use a strict `Content-Security-Policy`
(Next.js does not add one by default; `next.config.ts` in this repo
does), you need:

```
form-action 'self' https://docs.google.com;
frame-src   'self' https://docs.google.com;
connect-src 'self';
```

`connect-src` stays at `'self'` on purpose — the browser never talks to
Google directly. It posts to `/api/feedback` on your own origin, and the
server does the talking to Google. That is what lets the page tell the
truth about success instead of getting an opaque response.

**5. Use your own form instead**

Point the two variables at your own form and it works identically — the
form id and the entry id are the only inputs. If your form has more than
one question, set **only** `NEXT_PUBLIC_GOOGLE_FORM_ID` and Google's own
form is embedded instead, exactly as Google renders it.

**6. Check the copy**

`components/feedback/Feedback.tsx` has three lines of owner-specific
copy — the heading, the "the address below is optional" paragraph, and the
Google-owns-the-data note. Change them to match your project. The section
is deliberately honest about what it does: no newsletter, no fake
"you're on the list", no analytics on the answers.

---

## 8. The waitlist schema — the other manual step

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

## 9. Prove it works

Five checks, in this order. The first two need no arguments.

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
  -d '{"answer":"A real answer, long enough to be useful.","area":"Memory & brain","email":"you@example.com"}'
#   -> {"ok":true}                       Google accepted it
#   -> {"ok":false,"error":"That form is not published yet. ...","detail":"..."}  the form id is wrong or the form is not published
#   -> {"ok":false,"error":"The feedback form is not connected yet."}  the env var is missing — redeploy

# 4. the answer is in the sheet
#    open the form -> Responses tab  (or the linked spreadsheet)

# 5. no fake success
curl -s -X POST https://xr-landing-eight.vercel.app/api/feedback \
  -H 'Content-Type: application/json' \
  -d '{"answer":"x"}'
#   -> 400 {"ok":false,"error":"That answer was too short to be useful."}
```

Then open the live site in a browser, type an answer, press **Send it**,
and watch it say *"That is with us. Thank you."* Only then will it say
that — and only because Google confirmed it.

---

## 10. If something is wrong

| What you see | Why | What to do |
|---|---|---|
| "The form is not connected yet" on the page | `NEXT_PUBLIC_GOOGLE_FORM_ID` is not in the deployment | Add it, then **redeploy** — the old deployment cannot see it |
| Google's own white form is embedded | The entry id is missing, so the site cannot render its own form | Set `NEXT_PUBLIC_GOOGLE_FORM_ENTRY` and redeploy |
| "That form is not published yet." | The form id is wrong, or the form was never published with **Send** | Copy the id out of the form's own link again; make sure the form is shared with "anyone with the link" |
| Google returns 200 but the sheet is empty | The entry id does not match your question | Re-copy the prefilled link; the entry id must belong to the *"what should we build in XR?"* question |
| The page says "That did not go through" | The entry id matches no question, **or** the form collects addresses and the submission carried none | Check the exact reason with `curl -s -X POST https://xr-landing-eight.vercel.app/api/feedback -H 'Content-Type: application/json' -d '{"answer":"a long enough test answer"}'` — the `detail` field names the problem exactly |
| Google says "Your response has been recorded" but the sheet stays empty | The form's link to the spreadsheet is off | **Section 5** — re-link it from the **Responses** tab |
| "The waitlist database is not configured yet" | The two Turso variables are missing from the deployment | Add them and redeploy |
| The signup says "could not save" but the page looks fine | The schema was never applied to the Turso database | Run `schema/001_waitlist.sql` against it |
| The canonical tag still points at `xr-landing.vercel.app` | `NEXT_PUBLIC_SITE_URL` is not set, or the deployment predates it | Set it and redeploy |
