# Deploying to Vercel — what to set, and where

The site is a stock Next.js 16 app. Vercel detects it on its own; there
is nothing to configure in the build.

---

## 1. The fast way: import the repository

The code is already on GitHub:

> **https://github.com/ahmadrrrtx1/xr-landing**

1. Go to **https://vercel.com/new**
2. Choose **Add new… → Project**, then **Import** the repository
   `ahmadrrrtx1/xr-landing` (connect GitHub first if it is not connected
   yet).
3. On the setup screen, leave almost everything alone:

   | Setting | Value | Note |
   |---|---|---|
   | Project name | `xr-landing` | gives you `xr-landing.vercel.app` |
   | Framework Preset | **Next.js** | detected automatically |
   | Root Directory | *(blank)* | the app is at the root |
   | Build Command | `npm run build` | the default |
   | Output Directory | *(blank)* | Next.js output is the default |
   | Install Command | `npm install` | the default |
   | Node.js Version | **20.x or newer** | Next 16 needs ≥ 20.9 |

4. Press **Deploy**.

That is a working deployment in about a minute. It has no waitlist and no
feedback form yet — that is the next step, and the site is honest about
both in the meantime (the waitlist form says the database is not
configured; the feedback section says the form is not connected).

Every later `git push` to `main` redeploys automatically.

---

## 2. The environment variables

**Project → Settings → Environment Variables.** Add all of these for
**Production** (and **Preview**, if you want previews to work the same):

| Variable | Required | What it is | Where it comes from |
|---|---|---|---|
| `TURSO_DATABASE_URL` | for the waitlist | `libsql://your-db.turso.io` | [turso.tech](https://turso.tech) → create a database → copy the URL |
| `TURSO_AUTH_TOKEN` | for the waitlist | the token for that database | the same page, **Tokens → Create API token** |
| `NEXT_PUBLIC_SITE_URL` | **yes** | the public URL of the site, e.g. `https://xr-landing.vercel.app` | the URL Vercel gives the project |
| `NEXT_PUBLIC_GOOGLE_FORM_ID` | for the feedback form | the id in the form's own link | `1FAIpQLSdbDshtNhiBwfuGjlMRM44sH0ESH-p_iaXBVsDuQT8ScEi-uQ` |
| `NEXT_PUBLIC_GOOGLE_FORM_ENTRY` | for the feedback form | e.g. `entry.1759014004` | `entry.1759014004` |

**`NEXT_PUBLIC_SITE_URL` is the one that bites.** Without it the canonical
link, the Open Graph URL, the Twitter card and the sitemap all point at
`https://xr-landing.vercel.app` — a URL that may not be yours, and a
canonical tag that points somewhere else is worse than no canonical tag.
Set it to the exact URL of the production deployment, with no trailing
slash.

### About the Google Form variables

Both are **public identifiers**, not secrets. They appear in the page
source and there is no key, no service account and no OAuth anywhere in
this path. Setting them in Vercel is the same as setting them in a
`.env.local` file.

If you set only the form id, Google’s own form is embedded in the page.
If you set both, the site renders its own form in its own design. If you
set neither, the section says the form is not connected yet and offers
`hello@rrrtx-systems.com` — it never pretends to have collected
something.

**Set both, then redeploy.** Vercel bakes environment variables into the
deployment when it builds, so a deployment made before the variables were
added keeps answering "not connected" no matter what the settings page
says. **Project → Deployments → ⋮ on the latest deployment → Redeploy.**
The full click-by-click version is in [`GOOGLE_FORM_SETUP.md`](./GOOGLE_FORM_SETUP.md).

---

## 3. The waitlist schema — once, by hand

The table has to exist before the first signup. The file is in the
repository at `schema/001_waitlist.sql`:

```sql
CREATE TABLE IF NOT EXISTS waitlist (
  email       TEXT PRIMARY KEY NOT NULL,
  source      TEXT NOT NULL DEFAULT 'landing',
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);
```

Apply it once, either way:

- **In the Turso dashboard** — open the database → **SQL** → paste the
  file → **Run**. (Simplest.)
- **From your machine** —
  `npx @libsql/client@latest schema/001_waitlist.sql "libsql://your-db.turso.io" --auth-token "$TURSO_AUTH_TOKEN"`

Then sign up from the live page once. It should answer **"You are on the
list."** If it says the database is not configured, the environment
variables have not reached the deployment — check that they are set for
the right environment and redeploy.

---

## 4. The feedback form — one question, then publish

The form already exists, is published, and has two questions — the built-in
email field and **"what should we build in XR?"**:

> **XR — what should we build next?**
> <https://docs.google.com/forms/d/e/1FAIpQLSdbDshtNhiBwfuGjlMRM44sH0ESH-p_iaXBVsDuQT8ScEi-uQ/edit>

1. The **form id** is the part between `d/e/` and `/viewform` in the form’s
   own link:
   `1FAIpQLSdbDshtNhiBwfuGjlMRM44sH0ESH-p_iaXBVsDuQT8ScEi-uQ`
2. The **entry id** is the id of the question. Press the menu (⋯) →
   **Get prefilled link** with that question selected; the link ends with
   `?entry.1759014004`.
3. Put both into the Vercel environment variables and redeploy.

> The email question is the built-in **"collect email addresses"**
> setting, so it is posted as `emailAddress`, not as an `entry.…` id —
> and Google answers a response with an empty address with a **400**.
> The site sends a no-reply address on your domain when the visitor
> leaves the field blank, so the answer is still recorded.

Responses land in the Google Sheet that is attached to the form. If the
sheet ever stops receiving them, re-link it from the form’s
**Responses** tab → green Google Sheets icon → **Create a new
spreadsheet**; the full walkthrough is in
[`GOOGLE_FORM_SETUP.md`](./GOOGLE_FORM_SETUP.md) §5.

---

## 5. A custom domain

**Project → Settings → Domains** → add the domain → point the `A` record
at `76.76.21.21` and the `CNAME` at `cname.vercel-dns.com`. Vercel
issues the certificate.

After the domain is live, change `NEXT_PUBLIC_SITE_URL` to the custom
domain and redeploy, so the canonical tag and the social card point at
the address people actually type.

---

## 6. Redeploying by hand

If you have the Vercel CLI and a token:

```bash
npm i -g vercel
vercel link                 # once — pick the project
vercel env pull .env.local # once — pull the environment variables down
vercel --prod
```

Or from the CLI without linking first, using a token from
**Account Settings → Tokens**:

```bash
vercel --prod --token $VERCEL_TOKEN
```

---

## 7. What is *not* in the deployment, on purpose

- **No secrets in the repository.** The GitHub token that pushed the code
  was never written to a file and never appears in the history. Rotate
  it if it is still around.
- **No third-party trackers.** No analytics, no pixels, no fonts or
  images from anyone else's server. The only third party the site can
  reach is `docs.google.com`, and only for the feedback form.
- **No bulk email.** The waitlist collects an address and nothing else —
  no name, no IP, no user agent. The list is exported and handed to a
  real provider at launch.
