# CLAIMS.md — claim → repo-path ledger

**Internal, not shipped to production.** Every piece of copy on the landing page must be
traceable to a row in this file. If a claim is not here, it does not go on the page.
Format: `claim` → the exact source that proves it → how the site words it.

Last updated: 2026-10-18 · upstream `ahmadrrrtx/xr` @ `main` · v1.1.0 (Graphite)

---

## Brand / identity

| Claim on the site | Source |
|---|---|
| "The AI Agent You Can Actually Trust" | Tagline baked into the logo — `website/public/xr-wordmark.png`, drawn from `assets/v2/masters/png4x/XR-Logo-Transparent-4x.png`; also the CLI banner |
| Emblem = stylised X + tilted orbital ring + glowing cyan core | `desktop/src/components/brand/Logo.tsx` |
| XR Native is the default theme | `desktop/src/styles/themes.css` → `html[data-theme='xr-native']` |
| Accent `#00E5FF`, void `#03070D`, ink `#0A0F1A` | `desktop/src/styles/themes.css` (xr-native block); documented in `docs/THEME-SYSTEM.md` |

## Hero / positioning

| Claim | Source |
|---|---|
| "An AI agent runtime you can actually audit." | `README.md` L9 (the repo's own subtitle) |
| "Give it a task. It plans, uses tools, and changes real things on your machine — under a policy gate, your approval, a spend ceiling, and a hash-chained log you can verify offline." | `README.md` L11–12 |
| BYOK — no API key or cloud account ships with XR | `README.md` L55 (What XR is, in plain language) |
| "One SQLite database, no telemetry, no mandatory network." | `README.md` L57 |
| "Ten local model runtimes are first-class." | `README.md` L86; 10 local ids counted in `src/providers/presets.ts` |
| "26 built-in provider presets — 16 hosted and 10 local" | `README.md` L85; **26 ids verified mechanically** in `src/providers/presets.ts` |
| 5 native adapters: Anthropic, Google, Mistral, Cohere, AWS Bedrock | `README.md` L300 |
| Switching models = preflight → canary → swap → verify, auto-rollback | `README.md` L327 |
| BYOK is free and direct — XR neither proxies nor meters your key | `README.md` § Pricing, rule 2 |
| No telemetry, including in crash recovery | `README.md` § The desktop shell |

## Trust plane / XR Shield

| Claim | Source |
|---|---|
| XR Shield = 7 components, every consequential action passes through them | `src/xr-shield/index.ts` (`XR_SHIELD_COMPONENTS`), README § XR Shield |
| The 7 names + questions + "can refuse?" | `src/xr-shield/index.ts` lines 163–217 |
| "The docs cannot drift from the code" (build fails if a module disappears) | `test/architecture/xr-shield-facade.test.ts`; `README.md` § XR Shield |
| Tool output is untrusted **data**, never instructions | `README.md` § Security; `src/core/agent.ts`; `src/security/tool-output.ts` |
| XR enforces **in-process policy, not kernel/VM isolation** | `README.md` § "Honesty box"; `docs/security/KNOWN_LIMITATIONS.md` |
| Prompt injection handled structurally, not by prompt instruction | `src/security/tool-output.ts`; `src/security/exec-integrity.ts` |
| Denied permissions always win; undeterminable authority ⇒ must not run | `docs/CAPABILITIES.md` § "Declared vs effective authority" |
| Not certified SOC 2 / ISO 27001 / HIPAA / PCI-DSS / FedRAMP | `README.md` § "What XR is — and what it is not" |
| Not a sandbox, not a substitute for human review | same |
| Not certified / not finished — known-limitations register is a release artifact | `README.md`; `docs/release/1.0.0/known-limitations.md` |

## Approvals

| Claim | Source |
|---|---|
| Every edit and every shell command goes through an approval | `cli/README.md` § Approvals |
| Keymap `[y/n/a/d/v]` (edit) and `[y/n/a/d/k]` (command) | `cli/README.md` § Approvals (table) |
| Reads (`read_file`, `list_dir`, `search_code`) never ask | `cli/README.md` § Approvals |
| Dangerous commands always ask, even under `--approve-all`; config allow rules cannot override | `cli/README.md` § "Dangerous commands always ask" |
| Approval requests with a missing/non-string/blank `cmd` **fail closed** | `docs/cli/CODING_CONTRACTS.md` § "Shell approval identity" |
| Explicit deny rules outrank auto-approval | same |
| A pending approval is denied fail-closed before a run is cancelled | `README.md` § "What happens to one task" |

## Spend caps

| Claim | Source |
|---|---|
| USD + token ceilings checked **during** the loop | `README.md` § trust-plane diagram; `src/cost/governor.ts` |
| "The USD value is not an absolute billing guarantee" — a response can overshoot; unknown pricing cannot enforce a USD cap | `README.md` § "What XR is, in plain language"; `docs/cli/CODING_CONTRACTS.md` § "Task limits" |
| `--budget 0.25 --max-tokens 12000`; invalid values are rejected, not discarded | `docs/cli/CODING_CONTRACTS.md` § Task limits |
| Limits are per engine task/turn, not a session-wide allowance | same |
| "Spend caps are code, not suggestions." | The Budget screen's own copy — `desktop/src/screens/Budget/` (captured fresh) |

## Audit log

| Claim | Source |
|---|---|
| Every event is SHA-256-linked into a local chain | `README.md` § "What XR is, in plain language"; `src/state/workspace-store.ts` |
| `xr audit verify` verifies offline | `README.md` § audit chain; `src/security/audit-verify.ts` |
| Output observed live: "✓ Audit chain intact · 2 entries verified · SHA-256 hash chain" | Captured this session — `public/cli/audit.txt` |
| `--crypto` verifies Ed25519 signatures (tamper-**resistant**, not just tamper-evident) | Observed live in `xr audit verify` output; `src/security/audit-signer.ts` |
| Refused actions are recorded too (blocked / denied / over budget) | `README.md` § "What happens to one task" |

## Builder IDE

| Claim | Source |
|---|---|
| "Ask for a change and XR answers with a diff you can review hunk by hunk. Nothing is written until you apply it." | `desktop/src/screens/Builder/components/ChatPane.tsx` (captured fresh, verbatim) |
| Dev server command is **detected**, not assumed | `desktop/src/screens/Builder/components/PreviewPane.tsx` (captured fresh: "detected: bun run dev") |
| File reads are capped at 512 KB and a path escape is refused | `src/daemon/routes/builder.routes.ts` (header comment + handler) |
| Editor, file tree, terminal, preview, minimap, quick-open, diff cards | `desktop/src/screens/Builder/components/` (9 files) |

## CLI

| Claim | Source |
|---|---|
| `xr "task"`, `xr -p "…"` (read-only), `xr shell`, `xr serve`, `xr doctor` | `cli/README.md` |
| `--dry-run` simulates writes and shell; the writer checks `dryRun` **after** approval, **before** writing | `docs/cli/CODING_CONTRACTS.md` § Dry-run |
| `--dry-run` is not "no I/O" and not free inference | same (stated explicitly) |
| `xr --resume` is **rejected**, not silently ignored | `docs/cli/CODING_CONTRACTS.md` § "Explicitly unsupported coding-entry options" |
| `xr doctor --json` → redacted config, `summary.runnable`, secrets never printed | `README.md` § Scripting & exit codes; observed live |
| Exit codes 0/1/2/3/4/5/130 | `README.md` § Scripting; `docs/guides/cli-compat.md` |
| `xr doctor` never prints `ok` for a system that cannot work | `README.md` § "2. First run" |

## Research

| Claim | Source |
|---|---|
| Offline by default; `--allow-public-web` is an explicit opt-in | `README.md` § "Memory, research, voice, computer control"; `src/research/` |
| Results carry source provenance | same |
| A real run: 4 searches → 7 sources → 18 evidence blocks, 14 verified → ⚠ 1 contradiction detected | `test/desktop/fixtures/research/quick-run.jsonl` (82 real events) |
| Depth / scope / strategy / iterations / token budget are all user-set | `desktop/src/screens/Research/ResearchScreen.tsx` (captured fresh) |

## Memory / Brain

| Claim | Source |
|---|---|
| Consent-first capture — only what you ask it to remember | `README.md` § Memory; `src/context/` |
| Explainable retrieval — `xr memory recall "…"` shows match % and why | `README.md` § Memory |
| TTL/expiry via `xr memory prune` | same |

## Multi-agent

| Claim | Source |
|---|---|
| 15 prebuilt specialist agents | `desktop/src/screens/Agents/AgentsScreen.tsx` (captured fresh — 15 cards) |
| Every surface funnels into **one call** — no side door | `README.md` § "How XR works" |
| No bypass around the runner | `README.md` § Design principles #2 |
| Run ends `success`, `failed` or `cancelled` — **never a fake completion** | `README.md` § "What happens to one task" |

## Mobile companion

| Claim | Source |
|---|---|
| `xr serve --lan` is opt-in; loopback stays the default | `README.md` § "The mobile companion" |
| Self-signed P-256 cert; phone shows the SHA-256 fingerprint to compare, then pins it | same; `docs/mobile/SECURITY.md` |
| A changed certificate is a **stop screen, not a retry button** | same |
| Mobile is refused at `/files`, `/terminal`, `/git`, `/mcp` (403) | `README.md` § "A companion, not a console" |
| Pairing = single-use 6-digit code, 10-minute window, rate-limited per source | same |
| Web Push sealed twice: RFC 8291 **and** AES-GCM under a phone-only key; TTL 10 min | same; `docs/mobile/PWA.md` |
| Cached chats/approvals/budget render offline; sends wait in an outbox | `README.md` § "Honest offline" |
| No app store, no relay, no third party | `README.md` § "The mobile companion" |
| The mobile routes are **not yet wired into the shipping daemon** | `README.md` § "Verification status" — **verified in-sandbox** (B2) |

## Integrations / remotes

| Claim | Source |
|---|---|
| Telegram, Discord, WhatsApp remotes | `src/telegram/` (11 files), `src/discord/` (11), `src/whatsapp/` (12) |
| "An MCP server gets no more privilege than a bundled tool" | `README.md` § Capabilities |
| 167 capabilities discoverable | Observed live: `xr capabilities list` → `Capabilities (167)`; `public/cli/capabilities.txt` |
| 65 bundled skills; 54 with `xr-skill.json`, 11 legacy markdown | Counted from `skills/` (65 dirs) and observed live in `xr skills list`; `public/cli/skills.txt` |

## Pricing (Free vs Business OS)

| Claim | Source |
|---|---|
| "XR Personal is free, forever, with every feature in this repository included." | `README.md` § Pricing |
| Every local feature is free, permanently — "no paywall, by test" | `README.md` § Pricing; enforced by `test/cloud/license.test.ts` |
| Business = **$15 per user per month**, or **$144 per user per year** ($12/mo equivalent) | `README.md` § Pricing |
| Business includes: team members/roles/invitations, shared team workspaces, SSO admin (OIDC + SAML 2.0), pooled managed models, team memory sync, audit log + signed CSV export, admin console, cloud relay | `README.md` § Pricing table |
| Pooled managed models carry a **$20/user/month included quota by default** | `README.md` § Pricing table |
| 30-day trial, no card, up to 5 seats | `README.md` § Pricing |
| Enterprise quoted per contract, NET 30, no self-serve checkout, **no support SLA on any tier** | `README.md` § Pricing |
| Cancelling leaves every local install untouched; hosted data exportable for 30 days | `README.md` § Pricing |
| Exactly 8 hosted services are gated — `BUSINESS_FEATURES` | `src/cloud/license.ts` |
| No local feature is paywalled, ever — a test fails the build if one is | `README.md` § Pricing rule 1; `test/cloud/license.test.ts` |

## Supply chain / quality

| Claim | Source |
|---|---|
| Every release is cosign-signed, SLSA3-provenanced, published to npm with provenance | `README.md` § "Supply chain" |
| 4,427 pass / 19 skip / 0 fail across 408 files (measured 2026-10-17, bun 1.4.3, `a6f7f67`) | `README.md` § "How XR proves itself"; `docs/release/TEST-BASELINE.json` |
| `claim-lint` fails the build on prohibited/supervised terms | `README.md` § "How XR proves itself"; `scripts/claim-lint.ts` |
| Every `Article N` cited anywhere must exist in the Constitution | `README.md` § "How XR proves itself"; `docs/CONSTITUTION.md` |
| A 172,000-LOC ceiling on the whole tree is CI-enforced | `README.md` § Repository structure; `scripts/` size-gate |
| Provider count is deliberately **not** a quality score | `README.md` § Providers ("Provider count is not a measure of product quality") |

## Performance

| Claim | Source |
|---|---|
| `--version`/`--help` warm p95 < 150 ms (measured 39.8 / 40.5 ms) | `README.md` § Performance; `docs/perf/PERF-BUDGETS.md` |
| `doctor` measured 586 ms p95 | same |
| dashboard first render 12.1 ms | same |
| retrieval @100k items 24–29 ms | same |
| Fast path performs **zero synchronous FS/process I/O** (lint-enforced) | `README.md` § Performance; § Design principles #5 |

## Install

| Claim | Source |
|---|---|
| npm `npm i -g @rrrtx/xr` | `README.md` § Install |
| Binary via `install.sh` / `install.ps1` | same |
| Homebrew `brew install ahmadrrrtx/tap/xr` | same |
| Linux · macOS · Windows · Termux | `README.md` badges; `docs/release/SUPPORT_MATRIX.md` |

## Numbers that are live-fetched (never hard-coded)

| Item | Source |
|---|---|
| GitHub star / fork / issue count | GitHub API `api.github.com/repos/ahmadrrrtx/xr` — fetched at build/runtime, never a literal |
| Version + codename | `release.manifest.json` (single source of truth, CI-enforced) |

---

## Not-allowed copy (for the record)

These must never appear on the landing page, because the repo does not support them:

- "SOC 2 certified" / "HIPAA compliant" / "ISO 27001" / "PCI-DSS" / "FedRAMP" — *not certified*
- "Sandboxed" / "isolated" — *in-process policy, not kernel or VM isolation*
- "Unlimited" spend / "guaranteed cap" — *the governor can overshoot; unknown pricing cannot cap*
- "Complete" / "finished" / "production-ready" — *the known-limitations register is a first-class artifact*
- Any agent count, benchmark number, user count, or testimonial not present in this file
- "Live demo" / "try it now" for the interactive preview — it is a **recording**
- Any invented price, seat count, quota or SLA not in § Pricing


---

# 8. ACT 2 — NEW VERIFIED CLAIMS (live provider, Act 2 media)

Every row below was produced by a **running** XR against a live provider, and is reproducible
from the artifacts named in the `Evidence` column. Nothing here is a re-worded README.

| # | Claim the site may make | Evidence (real, reproducible) |
|---|---|---|
| 1 | XR answered a real task in this session, live | `public/cli/xr-session.txt` — `read package.json` → *"XR is a local-first, provider-neutral AI agent runtime that lets you run intelligent agents on your own hardware. It supports Bring-Your-Own-Key (BYOK), spend-capped usage, tamper-evident audit logs, and extensibility via plugins and a modular component platform."* → `✓ dry-run (simulated) · 0 files changed · 0 commands run · 4.3k tok (no price data) / $2 cap` |
| 2 | The audit log is a verifiable hash chain | same recording — `✓ Audit chain intact · 260 entries verified · SHA-256 hash chain`; `xr audit verify` also offers `--crypto` for Ed25519 |
| 3 | Spend ceilings are enforced by the product, not by us | same recording — `xr budget` → `Monthly cap $20.00 / Daily cap $5.00 / Per-task hard cap`; and a deliberately small `--budget` run returned the engine's own `✕ budget limit reached` |
| 4 | The desktop app reports real per-request cost | `public/screens/desktop-chat-1600.webp` — `openai/gpt-oss-20b · 4,871 tok · $0.0254 · 0.7s to first token`, header `$3.15 left` |
| 5 | The mobile app talks to your own daemon | `public/screens/mobile-conversation-900.webp` — real `list_dir` → completed, `read_file` → completed, then the real model answer, under `Connected to XR on your WiFi` |
| 6 | XR is provider-neutral and BYOK | `xr providers list` → `Active: groq (openai/gpt-oss-20b) · Routing: hybrid` + 26 provider presets (10 local); `providers test` → `groq ✓ HTTP 200` |
| 7 | The mobile app is the same product, not a demo | `public/screens/mobile-settings-900.webp` — `XR 1.1.0 (Graphite)`, the 5 official themes, `Spent today $0 of $5 daily cap`, `This month $0 / $20` (caps set through the daemon's own `POST /api/budget/set`) |
| 8 | The product tour is a recording of the real app | `public/media/xr-tour.mp4` (37s, 1280×800, H.264) — real answer, real Budget screen (`$1.35 / $5.00 cap`, `279.9K tokens`), real mobile app |

## 8.1 Copy locked for Act 3 (verbatim, sourced)

| On-page string | Exact source |
|---|---|
| H1 — "Give it a task. It plans, uses tools, and changes real things on your machine." | `README.md` line 6 (verbatim) |
| Sub — "Under a policy gate, your approval, a spend ceiling, and a hash-chained log you can verify offline." | `README.md` line 6–7 (verbatim) |
| Tagline — "The AI Agent You Can Actually Trust" | the uploaded logo lockup, and `website/src/lib/site.ts` `tagline` |
| One-liner — "a local-first, provider-neutral AI agent runtime. BYOK, spend-capped, tamper-evident audit, plugin/MCP extensibility." | `README.md` line 40 (verbatim) |
| Eyebrow — "Open source · MIT · Runs on your machine" | `LICENSE` (MIT) + `README.md` |
| Install — `npm i @rrrtx/xr` | `README.md` § Install — **recorded but not shown on the page** (see §9.6) |
| Version — "1.1.0 (Graphite)" | `release.manifest.json` via `GET /api/v1/health` |

## 8.2 Still-not-allowed copy (added after Act 2)

- Any claim that the **shipping daemon serves the mobile PWA's contract** — it does not
  (see `RECON.md` §8.3). The site may show the mobile app's real screens; it may not say
  the mobile app works out of the box against `v1.1.0`.
- "Unlimited" or "free forever" for **hosted** usage — the repo's free tier is about
  *features*, not about someone else's inference bill. `BYOK stays free and direct` and
  `No local feature is paywalled, ever` are the allowed forms.
- Any Groq/OpenAI/Anthropic model name on the landing page as *the* model. The provider is
  BYOK and user-chosen; the screenshots showing `groq` / `openai/gpt-oss-20b` are captures of
  one configured machine, and the copy must not imply a default.
- Any throughput, latency or uptime number. The only latencies we have are our own captures
  (`0.7s to first token` on one request) — not a product guarantee, and not publishable.

---

# 9. Act 3 — the shipped site

The site is built. This section records what the page actually says, where each
statement came from, and what was deliberately left out.

## 9.1 Every product claim on the page, and its evidence

| On-page claim | Where it appears | Source of truth | Evidence shipped with the site |
|---|---|---|---|
| "Give it a task. It plans, uses tools, and changes real things." | hero H1 | `README.md` line 6 (verbatim) | — |
| "Under a policy gate, your approval, a spend ceiling, and a hash-chained log you can verify offline." | hero sub | `README.md` line 6–7 (verbatim) | — |
| "Open source · MIT · Runs on your machine" | hero eyebrow | `LICENSE` (MIT) + `README.md` | — |
| "XR is a unified skill runtime that orchestrates reusable expertise across multiple domains." | desktop capture | the live model answer | `public/screens/desktop-chat-*.webp` |
| Spend caps are real and enforced | Spend-caps block | `xr` output: `Monthly cap $20.00 / Daily cap $5.00 / Remaining $20.0000`; mobile: `Spent today $0 of $5 daily cap` | `public/cli/xr-session.txt`, `public/screens/budget-*.webp`, `public/screens/mobile-settings-*.webp` |
| The audit chain is tamper-evident and verifiable offline | Audit-log block | `✓ Audit chain intact · 260 entries verified · SHA-256 hash chain` | `public/cli/xr-session.txt` |
| The same runtime answers from a phone | Mobile block | the mobile PWA running the same daemon | `public/screens/mobile-conversation-*.webp` |
| Research finds contradictions and says so | Research block | the repo's own replay fixture: `⚠ 1 contradiction(s) detected` | `test/desktop/fixtures/research/quick-run.jsonl` in the XR repo |
| Five first-class themes ship in the product | Only XR #14 | `desktop/src/styles/themes.css` — Native, Graphite, Midnight, Paper, Arctic | the site's own token table in `app/globals.css` is lifted from it |
| "No local feature is paywalled, ever" / "BYOK stays free and direct" | pricing | README § Pricing (verbatim) | — |
| Business OS is $15/user/month or $144/user/year | pricing | README § Pricing (verbatim) | — |
| 30-day trial, up to 5 seats, no card | pricing footnote | README § Pricing (verbatim) | — |
| Enterprise is quoted per contract, NET 30, no self-serve checkout, no support SLA | pricing | README § Pricing (verbatim) | — |
| 14 listed providers, 10 local | Providers block | `xr providers list` | `public/cli/providers.txt` |
| 167 capabilities | Providers block | `xr capabilities` | `public/cli/capabilities.txt` |
| 12+ integrations | Integrations block | the running app's Integrations screen | `public/screens/integrations-*.webp` |
| 15 agents, 7 skills, 6 workspace templates | Multi-agent block | the running app's Agents screen | `public/screens/agents-*.webp` |
| The Builder IDE ships inside the product | Builder block | `desktop/src/screens/Builder/` | `public/screens/builder-*.webp` |
| 10-step onboarding that tells you what it downloads | onboarding strip | the running app's first-run flow | `public/screens/onb-*.webp` (12 captures) |
| The transcript is a real session | interactive preview | the raw TTY capture | `public/cli/xr-session.raw` + `.txt` |
| The tour is a recording of the running app | tour | the screen recording | `public/media/xr-tour.{mp4,webm}` + poster |

## 9.2 On-page numbers, and where each one was read from

| Number shown | Read from |
|---|---|
| `$1.35` spent, `$5.00` cap, `279.9K` tokens | the desktop app's Budget screen, during the harvest |
| `$0.03`–`$0.09` spent today, `$2.29`–`$2.33` projected | the same screen, different moments |
| `9 checks`, `35.0%` capacity, `3 skills` | the desktop app's Shield screen |
| `260 entries verified` | the CLI's own audit verification line |
| `15 agents`, `12+ integrations`, `7 skills`, `6 templates` | the running desktop app |
| `v1.1.0 (Graphite)` | the app's own version string |
| `6 stars` | the GitHub API, fetched server-side, revalidated hourly |

## 9.3 What the site does NOT say, and why

| Not said | Why |
|---|---|
| Any model name as *the* model | BYOK — the provider is the visitor's choice. The captures show one configured machine; the copy does not imply a default. |
| Any latency, throughput or uptime figure | The only latency we measured was `0.7s to first token` on one request. That is our observation, not a product guarantee. |
| "The mobile app works out of the box against v1.1.0" | The shipping daemon does not serve the PWA's API contract (`RECON.md` §8.3). The site shows the real mobile screens; it does not claim the integration ships working. |
| "Unlimited" or "free forever" for hosted use | The free tier is about features, not about someone else's inference bill. |
| A user count, a download count, a testimonial, a logo wall | None exist. Nothing on the page is a number nobody measured. |
| A countdown to a launch date | No launch date has been set. |
| "Subscribe" or "Get early access" | There is no product to buy yet. The CTA is a waitlist, and the privacy line says exactly what happens to the address. |
| A privacy policy or terms link | No URLs exist. Both are rendered as visible owner-TODO markers, not dead links. |

## 9.4 Placeholders that are marked on the page

| Placeholder | Where | How it is marked |
|---|---|---|
| The voice line | hero, "Hear XR" | The button caption and the sentence under it both say the repo ships the voice *code*, not an audio asset, and that XR's own recording replaces it. |
| Privacy policy | footer | A visible `TODO — owner` marker. |
| Terms | footer | A visible `TODO — owner` marker. |

## 9.5 Claims that were measured during the build

| Claim | Measurement | Where |
|---|---|---|
| The waitlist writes real rows | 9 rows written and read back from libSQL, through the API and through the browser | `BUILD_REPORT.md` §3 |
| A duplicate cannot exist | `email` is the primary key; `ON CONFLICT(email) DO NOTHING` | `schema/001_waitlist.sql` |
| The honeypot writes nothing | a honeypot submission produced **0** rows | `BUILD_REPORT.md` §3 |
| No horizontal overflow | 0 px at 320 / 390 / 768 / 1280 / 1600 | `BUILD_REPORT.md` §2 |
| Every image has alt text | 27 images, 0 without | `BUILD_REPORT.md` §2 |
| The live star count is live | fetched server-side, revalidated hourly; no typed number, no third-party iframe | `lib/github.ts` |


## 9.6 The install line: recorded, and deliberately not shown

The README documents `npm i -g @rrrtx/xr` as a supported channel, and the
package is genuinely published — `latest` is **1.0.0**, `beta` is
`1.0.0-beta.1**, published 2026-09-08, and it is not deprecated.

It is still not on the landing page, for three reasons:

1. **The owner says XR is not released.** The waitlist is the call to
   action; telling a visitor to "run it today" contradicts it.
2. **The published version is not the version on the page.** Every capture
   in the site is XR **1.1.0 (Graphite)** — the repo's current version. A
   visitor who installed from npm today would get **1.0.0**, a different
   build from the one they just watched. "Run it today" would be a false
   promise about parity.
3. The repo's own `docs/release/SUPPORT_MATRIX.md` records that the npm
   channel publishes the *stable line*; pre-releases go to the `beta`
   dist-tag and never move `latest`.

What the page says instead:

| Where | Copy |
|---|---|
| Hero | "XR isn't released yet — that is what the waitlist is for. The source is public under MIT." |
| Final CTA | "The code is public and MIT. The release is not out yet — the waitlist is how you hear about it first." |
| Final CTA button | "Read the source" → `github.com/ahmadrrrtx/xr#readme` |

The install lines stay in `lib/site.ts`, sourced and commented, so a later
revision can put them back with a version that matches what a visitor would
actually get. The Open Graph image's footer was changed for the same
reason — it used to print `npm i -g @rrrtx/xr`.

**Not said anywhere on the site:** that XR is released, that a visitor can
install it today, that the published artifact matches the screenshots, or
that a download count exists.

---

## 10. The feedback form — "tell us what to build next"

Added in Act 4 at the owner's request: "a simple google form for collecting
people review and like there opinion what qwe should add".

### What the page says

| Where | Copy | Why it is true |
|---|---|---|
| Section eyebrow | "Your take" | — |
| Heading | "Tell us what to build next" | The form has exactly one free-text answer. |
| Body | "XR is not finished and it will not be finished in a vacuum." | The repo is public under MIT and unreleased — see §9.6. |
| Body | "The address below is optional. Leave it and we cannot reply; leave it in and we will, once." | The reply address is a single optional field. Nothing is mailed automatically; there is no ESP on this path. |
| Privacy line | "This form posts straight to a Google Form. Google stores what you type; we do not read it, and nothing here is tied to the waitlist." | True: the answer goes to the owner's Google Sheet and is never written to the waitlist table. |
| Idle status | "One form, one answer. No newsletter." | There is no mailing list on this path. |
| Success | "That is with us. Thank you." | Only shown after Google confirmed the response. |
| Failure | Whatever Google said, or "That did not go through. Email hello@rrrtx-systems.com instead." | The server forwards the answer and reports Google's actual answer. |

### What the page does **not** say

- It does not say a response was recorded unless Google's server confirmed it.
- It does not say the form is connected when it is not — the unconfigured
  state says "The form is not connected yet" in plain words, and offers
  `hello@rrrtx-systems.com`.
- It does not claim the feedback is anonymous, private, or deleted. It says
  exactly what happens: Google stores it, we do not read it, and it is not
  tied to the waitlist.
- It does not offer a newsletter, a list, or a drip campaign.

### The one honest line that needed care

The first implementation posted straight to Google from the browser with
`mode: "no-cors"`. That mode returns an opaque response, so the page could
not tell "recorded" from "that form does not exist" — every answer, including
the ones Google threw away, produced a green "That is with us. Thank you."
That is a dark pattern: a form that lies about what it collected.

The fix is `app/api/feedback/route.ts`: the browser posts to the site's own
route, the server forwards to Google with `redirect: "manual"`, and the
route reports the real status. A 404 from Google — which is exactly what an
unpublished or wrong form id returns — now produces a visible failure and
an email address, not a false thank-you.

### The Google Form itself

The owner published their own form, with two questions:

- Name: **XR — what should we build next?**
- Form id: `1FAIpQLSdbDshtNhiBwfuGjlMRM44sH0ESH-p_iaXBVsDuQT8ScEi-uQ`
- <https://docs.google.com/forms/d/e/1FAIpQLSdbDshtNhiBwfuGjlMRM44sH0ESH-p_iaXBVsDuQT8ScEi-uQ/edit>
- Q1 **Email** — the built-in *"collect email addresses"* setting
- Q2 **"what should we build in XR?"** — entry id `entry.1759014004`

The Forms API is not reachable from the tooling available here (the Drive
connector exposes no `forms.batchUpdate`), so the questions were added and
the form published by hand. The **entry id was measured, not guessed**: a
real submission was intercepted and the POST body read, which gave
`entry.1759014004` and the `emailAddress` field.

### What that shape means for the code

| Form feature | How Google receives it | What the site sends |
|---|---|---|
| Built-in email collection | `emailAddress` (never `entry.…`) | the visitor's address, or `no-reply@rrrtx-systems.com` when it is blank |
| The question | `entry.1759014004` | `Area: <topic>\n\n<the answer>` |
| Sign-in | not required — an anonymous submission succeeds | nothing to send |

Google answers a response with an **empty** `emailAddress` with a **400**,
not with a blank cell. That is why the site fills in a no-reply address
rather than sending an empty field: the answer is recorded either way, and
the sheet makes it obvious afterwards that nobody could be written back to.

The two ids are public identifiers. They appear in the page source. There
is no API key, no service account and no OAuth anywhere in this path.

| State | What the visitor sees |
|---|---|
| Form id + entry id set | The site's own form, in the site's design, posting through the server |
| Form id only | Google's own form, embedded, exactly as Google renders it |
| Neither | "The form is not connected yet" + `hello@rrrtx-systems.com` |
| Google returns 404 | "That form is not published yet. Email hello@rrrtx-systems.com instead." |
| Google returns 400 | "That did not go through. Email hello@rrrtx-systems.com instead." — and the `detail` field names the two real causes: an entry id that matches no question, or a form that collects addresses and was sent none |

### The response sheet

Responses are mirrored into the form's own Google Sheet, **"XR — what
should we build next? (Responses)"**. The sheet is not read by the site and
is not tied to the waitlist; it belongs to the owner.

> **Recorded, not hidden.** During the Act 5 cleanup a test row was removed
> from that sheet with a direct content write. That write detached the
> form from the sheet: the form kept recording every response (Google
> answers "Your response has been recorded"), but the sheet stopped
> receiving them. Nothing was lost — Google Forms keeps every response and
> the **Responses** tab shows them — and the fix is two clicks:
> **form → Responses tab → green Google Sheets icon → Create a new
> spreadsheet**, which writes every response collected so far into a fresh
> sheet. `GOOGLE_FORM_SETUP.md` §5 has the walkthrough. The site itself was
> never at fault: its POST reaches Google and Google confirms it.
