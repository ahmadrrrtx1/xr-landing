# RECON.md — XR Landing Site V2

**Act 1 deliverable.** Reconnaissance of the real `ahmadrrrtx/xr` repo, the official brand pack,
and every surface that could be run in the sandbox. Nothing in this document is inferred from
marketing copy alone — every claim carries the repo path that proves it, and every asset is
either **captured fresh** in this session or **reused from the repo's own** `previews/` archive.

- **Recon date:** 2026-10-18
- **Upstream:** `github.com/ahmadrrrtx/xr` @ `main` (clone depth 1, `pushed_at 2026-10-18T16:50:42Z`)
- **Upstream version:** `1.1.0 (Graphite)` · MIT · npm `@rrrtx/xr`
- **Live GitHub:** 6 stars · 1 fork · 2 open issues (fetched from the GitHub API this session)
- **Site repo created for this build:** `/home/user/xr-site` (standalone, so the existing
  `website/` marketing site in the upstream repo is not clobbered)

---

## 0. TL;DR for the owner

1. **The orb is not a shader.** It is a delivered **Orb v2 animation pack** — 9 pre-rendered
   48-frame WebP loops (glass nebula sphere, dual electron rings, layered core) plus 9 poster
   stills and 4 idle recolours. The repo says *used directly as delivered — never redrawn*
   (`desktop/src/components/brand/VoiceOrb.tsx`). **We use the real asset. We do not fake it.**
   The WebGL layer goes *around* it (an audio-reactive energy field), never *instead of* it.
2. **All 15 orb files in the repo are byte-identical to the official Drive manifest** — verified
   by sha256 this session (`assets/v2/MANIFEST.json`). That is our proof of authenticity.
3. **We ran the real product.** The Tauri desktop app's Vite frontend, the XR engine daemon, the
   mobile PWA and the `xr` CLI all ran in the sandbox. **35+ screens captured fresh, 0 errors.**
4. **There is a full design system in the repo** — 5 themes, ~20 tokens each, documented in
   `docs/THEME-SYSTEM.md` and `desktop/src/styles/themes.css`. The landing site inherits it
   rather than inventing a new look.
5. **Three things are BLOCKED** and are marked as such: no provider key (so no *live* XR answer),
   no mobile pairing route in the shipping daemon, no MP4 encoder in the sandbox. Workarounds
   are honest, not fake — details in §4.
6. **Star count is 6.** Real. The site will show the live number, and the copy will lean into
   "early and founder-built" rather than pretending to be a household name.

---

## 1. COMPLETE FEATURE MAP

Every surface below was located in the repo. Bullets are what the code actually does;
the path is the proof.

### 1.1 Desktop shell — Tauri v2 + React 18 + Tailwind v4
`desktop/`, `desktop/src/screens/`, `desktop/src-tauri/`

- **The engine runs as a supervised sidecar on loopback; the window is just another client.**
  The UI only ever speaks to `/api/v1` relative URLs; in dev Vite injects the bearer server-side
  so the token never reaches the browser bundle (`desktop/vite.config.ts` → `apiProxy()`).
- **Always-alive tray.** Closing the window hides it; the tray keeps the engine, global
  shortcuts and the approvals badge alive. The menu carries Open XR, New Chat, Toggle HUD,
  listening/paused state, pending-approval count and today's spend, each drawn in the
  platform's own idiom (macOS template icons, Windows 16–32px `.ico`, AppIndicator PNGs).
  *Proof:* `README.md` § "The desktop shell", `desktop/src-tauri/`.
- **Global shortcuts that are honest about failure.** Chords fall back when the OS already owns
  them; a chord that cannot work (Wayland with no capture tool) *says so* instead of doing
  nothing. *Proof:* `desktop/src/screens/Settings/tabs/ShortcutsTab.tsx`.
- **Crash recovery that tells the truth.** An interrupted session is detected by a marker file,
  not a guess; cut-off runs are marked `killed`, never "completed". *Proof:* `README.md`
  § "Crash recovery that tells you the truth".
- **Signed auto-update** — Stable/Beta/Nightly, Ed25519-verified payloads, background download.
  A build with no release key *refuses* to update rather than updating unverified.
- **Windows gets MSIX + toast activation, Linux gets Flatpak + desktop entry, macOS gets the
  full HIG application menu.**
- **Native polish per platform is honest about what was never run on real hardware** —
  `docs/release/DESKTOP-SUPPORT-MATRIX.md`.

### 1.2 Builder IDE — editor, file tree, terminal, live preview, AI chat
`desktop/src/screens/Builder/` (9 components)

- **Three panes, one workspace:** `FileTree.tsx`, `CodeEditor.tsx` (CodeMirror 6),
  `TerminalPane.tsx`, `PreviewPane.tsx`, plus `Minimap.tsx`, `QuickOpen.tsx`, `DiffCard.tsx`.
- **"Ask for a change and XR answers with a diff you can review hunk by hunk. Nothing is
  written until you apply it."** — the AI chat pane produces a reviewable diff, never a
  silent write. *Proof:* `desktop/src/screens/Builder/components/ChatPane.tsx`, `DiffCard.tsx`.
- **Dev server is detected, not assumed.** The empty state reads
  *"Start the dev server to preview your app."* and detects the actual command
  (`detected: bun run dev · bun run dev`). *Proof:* `desktop/src/screens/Builder/components/PreviewPane.tsx`.
- **Editor state is cached and restored** (`editorStateCache.ts`), with `Wrap · Minimap · Auto-save`
  toggles and a live git branch + dirty indicator (`U` badges on untracked paths).
- **Builder is backed by real project routes**, not a mock: `GET/POST /api/builder/projects`,
  `GET /api/builder/projects/{id}/file` with a 512 KB cap and a path-escape guard that answers
  `{"error":"path escapes the project root"}`. *Proof:* `src/daemon/routes/builder.routes.ts`.

### 1.3 `xr` — the CLI coding agent
`cli/README.md`, `src/cli/`, `src/commands/`, `docs/cli/CODING_CONTRACTS.md`

- **Six verbs, one engine:** `xr` (REPL), `xr "fix the failing test"` (one-shot),
  `xr -p "explain src/cli"` (read-only answer, no edits, no commands), `cat log.txt | xr "why?"`
  (stdin becomes context), `xr shell` (fullscreen Shell/TUI), `xr run/ask/serve/doctor`.
- **Every edit and every shell command goes through an approval**, with a real keymap:
  `[y/n/a/d/v]` for edits, `[y/n/a/d/k]` for commands — `y` allow once, `n` refuse (the model
  is told and can try another way), `a` allow this kind for the session, `d` show the full
  diff/command first, `v` open the proposed file in `$VISUAL` and apply *your* version,
  `k` stop the turn. *Proof:* `cli/README.md` § Approvals.
- **Reads never ask.** `read_file`, `list_dir`, `search_code` are silent.
- **Dangerous commands always ask** — in every mode, including `--approve-all`; config allow
  rules cannot override them. *Proof:* `cli/README.md` § "Dangerous commands always ask".
- **`--dry-run` simulates writes and shell** — the file writer checks `dryRun` *after* approval
  and *before* writing; JSONL turn summaries carry `dry_run: true` with no claimed changed files.
  It is explicitly **not** a sandbox and **not** free inference, and the docs say so.
- **Task limits are real:** `--budget 0.25 --max-tokens 12000` reach the engine; zero, negative,
  non-finite or fractional-token values are *rejected*, not silently discarded.
- **Honest about the limit:** "The USD value is not an absolute billing guarantee" — a response
  can overshoot, and unknown model prices cannot establish a USD bound. The site will say this too.
- **`xr doctor --json` is the machine-readable entrypoint** — redacted config, provider
  readiness, a `summary.runnable` verdict; secrets are never printed, only presence. It exits
  non-zero when XR cannot actually work and never prints `ok` for a broken system.
- **Documented exit codes:** `0` ok · `1` runtime · `2` usage · `3` network · `4` denied ·
  `5` not found · `130` interrupted. *Proof:* `docs/guides/cli-compat.md`.

### 1.4 Research — plan, search, fetch, extract, check, synthesise
`src/research/` (26 files), `desktop/src/screens/Research/`

- **Offline by default.** `xr research deep --allow-public-web` is an explicit opt-in, with
  egress rules and per-run budgets. *Proof:* `src/research/`, `README.md` § Capabilities.
- **Every answer carries source provenance**, and the run emits a *contradiction* report, not
  just a summary. A recorded run in the repo shows the full arc:
  `planning → 4 searches → ranked 7 sources → fetch (incl. one real HTTP 503) →
  18 evidence blocks, 14 verified → ⚠ 1 contradiction detected → done`.
  *Proof:* `test/desktop/fixtures/research/quick-run.jsonl` (82 real events).
- **The UI exposes the whole research contract**: question, depth (Deep Research / Quick /
  Standard), scope (Web / Local files / Connected apps / All sources), strategy (Auto), search
  iterations, include/exclude topics, no-mic, web access, model, token budget, and a Sources
  panel with Web / X / YouTube tabs. *Proof:* `desktop/src/screens/Research/ResearchScreen.tsx`
  — captured fresh.

### 1.5 Multi-agent + workflows + approvals
`src/agents/`, `src/services/multi-agent-orchestration.ts`, `desktop/src/screens/Agents/`,
`src/control/`

- **15 prebuilt specialist agents ship in the box** — Supervisor/Coordinator, Planner,
  Researcher, Builder/Developer, Reviewer, Artifact Verifier, Executor, Synthesizer,
  Memory Manager, Reviewer/Ideator Generator, Security Checker, Full Stack Developer,
  Frontend Agent, Backend Agent. Each carries its own model, temperature and tool badges.
  *Proof:* `desktop/src/screens/Agents/AgentsScreen.tsx` — captured fresh.
- **Agents are not a separate runtime.** Every surface funnels into one call
  (`AgentService.execute(request)`), so policy, approvals, budget, cancellation and audit are
  properties of the *pipeline* and an interface cannot skip them. *Proof:* `README.md`
  § "How XR works".
- **Approvals are durable and fail-closed.** A pending approval is a durable record with a TTL
  and a default-deny posture; a missing, non-string or blank approval request fails closed.
  *Proof:* `src/control/approval-store.ts`, `docs/cli/CODING_CONTRACTS.md` § "Shell approval identity".
- **Canonical `cmd` only.** The production shell schema is `{ "cmd": "..." }`; policy matching,
  dangerous-command review, previews and summaries never use an obsolete `command` field —
  there is no decoy field to confuse the guard.

### 1.6 Brain / memory — the control centre
`src/context/`, `desktop/src/screens/Brain/`, `desktop/src/screens/Memory/`

- **Consent-first capture.** XR stores only what you ask it to remember; entries are
  categorised and scoped, with TTL/expiry via `xr memory prune`.
- **Explainable retrieval.** `xr memory recall "…"` shows the **match % and why it matched**.
  *Proof:* `README.md` § "Memory, research, voice, computer control".
- **The Brain screen is a run history, not a dashboard mock** — every row is a real run with
  its model, token count, cost and a "Open in XR" link. *Proof:* captured fresh.
- **Memory screen exposes the whole contract:** 0 entries / 0 pinned / 0 sessions / 0 skills /
  0 unverified facts, search, category, scope, expiry, and a live "no memories yet" state.

### 1.7 Mobile companion — PWA on your own LAN
`mobile/`, `docs/mobile/PWA.md`, `docs/mobile/SECURITY.md`

- **No app store, no relay, no third party.** `xr serve --lan` binds the daemon to your LAN
  (opt-in; loopback stays the default); Settings → Mobile shows a QR and a 6-digit code and the
  phone installs XR as a PWA. *Proof:* `README.md` § "The mobile companion".
- **TLS pinned on first use.** The daemon mints a self-signed P-256 certificate; the phone
  shows the SHA-256 fingerprint for you to compare against the desktop, then pins it. A
  certificate that changes later is a **stop screen, not a retry button**.
- **A companion, not a console.** Mobile sessions are refused at `/files`, `/terminal`, `/git`
  and `/mcp` (403); pairing is a single-use 6-digit code inside a 10-minute window,
  rate-limited per source.
- **Push the push service cannot read.** Web Push with the payload sealed twice — RFC 8291
  *and* an AES-GCM layer under a key only the paired phone holds. TTL 10 minutes.
- **Honest offline.** Cached chats, approvals and budget render with no connection; sends wait
  in an outbox and drain in order. Off WiFi it says so instead of spinning.
- **Honest about wiring.** The README states the PWA, LAN/TLS/pairing and Web Push modules and
  their suites landed, but wiring those routes into the shipping daemon's route table is the
  remaining integration step. *We verified this in the sandbox — see §4.2.*

### 1.8 Integrations & bot remotes
`src/integrations/`, `src/plugins/`, `src/mcp/`, `src/telegram/`, `src/discord/`, `src/whatsapp/`, `src/bots/`

- **A real integration catalogue is shipped and rendered** — Airtable, Linear, GitHub, Google
  Calendar, Google Drive, GitLab, Notion, Slack, Telegram, WhatsApp, Outlook Calendar,
  Confluence, Docker, Activepieces, Cal.com, Coolify, Dropbox, ERPNext… each with a connect /
  connect-with-token / configure CTA. *Proof:* captured fresh from the live app.
- **Telegram, Discord and WhatsApp** reach your phone through *their* servers; the mobile
  companion never leaves your network. *Proof:* `src/telegram/`, `src/discord/`, `src/whatsapp/`.
- **MCP servers get no more privilege than a bundled tool.** MCP, skills, plugins and templates
  are all reachable identically from every surface and all four are governed by the same trust
  plane. *Proof:* `README.md` § Capabilities.

### 1.9 Providers / BYOK — 26 presets, 10 of them local
`src/providers/presets.ts`, `src/providers/registry.ts`

- **26 built-in presets: 16 hosted + 10 local.** Counted mechanically from `PRESETS` in
  `src/providers/presets.ts` (verified this session: 26 ids). Local runtimes are first-class:
  Ollama, LM Studio, llama.cpp, Jan, LocalAI, vLLM, GPT4All, KoboldCPP,
  Text-Generation-WebUI, SGLang.
- **5 hosted providers use dedicated native adapters** (Anthropic, Google, Mistral, Cohere,
  AWS Bedrock); everything else speaks the OpenAI-compatible protocol through one transport,
  and a custom preset can point at *any* OpenAI-compatible base URL.
- **Switching models is a state machine, not a hope:** preflight → canary → swap → verify, with
  automatic rollback if the new model cannot be reached.
- **BYOK is free and direct.** Your key goes from your machine to the provider; XR neither
  proxies nor meters it. An org can *choose* to disable BYOK for its members — the only way
  managed models become mandatory.
- **Keys are masked into the OS keychain**, else an AES-256-GCM sealed file, auto-migrating
  plaintext, and redacted from all status output. *Proof:* `src/config/config.ts`.

### 1.10 XR Shield — the trust plane (7 components, one import)
`src/xr-shield/index.ts`, `test/architecture/xr-shield-facade.test.ts`

The seven components every consequential action passes through — enumerable in one import so it
can be audited as a unit. **The build fails if a listed module stops existing**, so the docs
cannot drift from the code.

| # | Component | Path | Question it answers | Can refuse? |
|---|---|---|---|---|
| 1 | Capability policy | `src/capabilities/policy.ts` | Is this capability permitted for this workspace and mode? | ✅ |
| 2 | Action guard | `src/security/guard.ts` | Is the action dangerous once fully decoded and canonicalized? | ✅ |
| 3 | Trust lattice + placement | `src/runtime/trust/` | What risk tier is this, and where may it run? | ✅ |
| 4 | Consent / approvals | `src/control/approval-store.ts` | Has a human approved this action? | ✅ |
| 5 | Network egress | `src/security/egress-proxy.ts` | Is this destination allowed? | ✅ |
| 6 | Execution + output integrity | `src/security/exec-integrity.ts` | Is the binary allowlisted? Is tool output framed as data before re-entering the prompt? Are secrets brokered? | ✅ |
| 7 | Signed audit evidence | `src/security/audit-signer.ts` | Can this be proven afterwards, and would tampering show? | ➖ records |

- **Prompt injection is handled structurally:** tool output is treated as untrusted **data**,
  never as instructions. *Proof:* `src/core/agent.ts`, `src/security/tool-output.ts`.
- **The honest box:** XR enforces **in-process policy, not kernel/VM isolation** — a guard rail,
  not a confinement boundary. The gaps are written down in
  `docs/security/KNOWN_LIMITATIONS.md`, not hidden. *The landing site will repeat this.*

### 1.11 Spend caps & the budget governor
`src/cost/governor.ts`, `desktop/src/screens/Budget/`

- **USD + token ceilings per task, checked before *and* during steps** — not after the fact.
- **The live Budget screen** shows cap, spend today, per-model spend, projection, token burn
  and a real spend chart, plus spend settings with a per-task default cap, per-model caps and
  daily/weekly/monthly limits. *Proof:* captured fresh — the screen itself says
  *"Spend caps are code, not suggestions."*
- **Honest about the ceiling:** a response can exceed the requested limit and unknown pricing
  cannot enforce a USD cap at all. *Proof:* `README.md`, `docs/cli/CODING_CONTRACTS.md`.

### 1.12 Verifiable audit log
`src/state/workspace-store.ts`, `src/security/audit-signer.ts`, `src/security/audit-verify.ts`

- **Every event is SHA-256-linked into a local chain** you can verify offline with one command.
  Verified live in this session: `xr audit verify` → `✓ Audit chain intact · 2 entries verified
  · SHA-256 hash chain`, and it offers `--crypto` for Ed25519 signature verification
  (tamper-*resistant*, not just tamper-*evident*).
- **Refused actions are recorded too** — the chain captures `blocked / denied / over budget`,
  not just successes.
- **Exports are signed** (CSV) in the hosted tier; the local chain needs no server.

### 1.13 Skills, plugins, MCP, templates
`skills/` (65 on disk), `src/skills/`, `src/plugins/`, `src/mcp/`, `src/templates/`

- **65 bundled skills** (counted mechanically from `skills/`), of which 54 ship an
  `xr-skill.json` manifest and 11 are legacy markdown. Verified live: `xr skills list` →
  *"Loaded skill records (80) · bundled on disk: 65 bundled (54 with an xr-skill.json manifest,
  11 legacy markdown)"*, every record `enabled healthy`.
- **Skills are prompt/professional capability packs** with real names and real scopes:
  academic_research, api_design, architecture_reviewer, brand_designer, code_auditor,
  competitive_intelligence, content_creator, copywriter, crm_assistant, customer_support,
  daily_brief, db_migrate… each tagged (`#research #citations #methodology`).
- **167 capabilities are discoverable** — `xr capabilities list` → `Capabilities (167)`,
  spanning `artifact:`, `integration:`, `tool:`, `plugin:`, `skill:`, `mcp:`, `provider:`,
  `workflow:` — each with a trust tier (`tier0`–`tier2`) and a verification state.
- **Declared authority ≠ effective authority.** Effective authority is the *intersection* of
  declaration ∩ publisher policy ∩ workspace policy ∩ user grant ∩ agent/task grant ∩
  trust/placement limits **− denied permissions**. Denied permissions always win, and if XR
  cannot determine effective authority the capability must not run. *Proof:* `docs/CAPABILITIES.md`.

### 1.14 Themes — 5 canonical themes, live preview
`docs/THEME-SYSTEM.md`, `desktop/src/styles/themes.css`

**This is the landing site's design system, for free.** XR Native, Graphite, Midnight, Paper,
Arctic — same spacing, radii, typography scale, icon set and motion; only colour tokens and
shadow strategy change.

| Token | XR Native | Graphite | Midnight | Paper | Arctic |
|---|---|---|---|---|---|
| `--bg-void` | `#03070D` | `#E9EDF4` | `#0D1422` | `#EDE6D9` | `#FFFFFF` |
| `--bg-ink` | `#0A0F1A` | `#FAFBFD` | `#131C2E` | `#F5F0E8` | `#F8FAFC` |
| `--bg-raised` | `#121826` | `#FFFFFF` | `#1A2744` | `#FAF7F2` | `#F1F5F9` |
| `--accent` | `#00E5FF` | `#4A7A90` | `#3B82F6` | `#2A7A6F` | `#06B6D4` |
| `--accent-hover` | `#33EBFF` | `#45768E` | `#60A5FA` | `#379487` | `#0891B2` |
| `--accent-glow` | `rgba(0,229,255,.45)` | `rgba(74,122,144,.16)` | `rgba(59,130,246,.22)` | transparent | transparent |
| `--text-primary` | `#F0F4F8` | `#1A1D23` | `#E2E8F0` | `#2B2318` | `#0F172A` |
| `--text-secondary` | `#9AA8BA` | `#4A5572` | `#94A3B8` | `#5C4F3D` | `#475569` |
| `--metal` | `#B7C2CF` | `#8894AD` | `#94A3B8` | `#8A7C66` | `#64748B` |
| `--success` | `#34D399` | `#3E7A4F` | `#10B981` | `#4F8A5C` | `#059669` |
| `--warning` | `#FBBF24` | `#96690A` | `#F59E0B` | `#B8862E` | `#D97706` |
| `--danger` | `#F87171` | `#B6454F` | `#EF4444` | `#B2504A` | `#DC2626` |
| `--wait` | `#A78BFA` | `#6B6596` | `#8B5CF6` | `#7B6BA8` | `#7C3AED` |

Design principles the site inherits verbatim: *contrast first* (WCAG 2.1 AA on every theme),
*one accent per theme, always in the XR family*, *glow is a tool, not a default*, *metal/silver
neutral*, *theme switching is instant with no flash*, *all themes feel like XR*.

### 1.15 Voice
`src/voice/` (18 files), `desktop/src/screens/Voice/`, `mobile/src/components/Orb.tsx`

- **Optional and local-first.** STT, TTS, VAD, wake word, endpointing, transcript — all present.
- **Voice triggers capabilities through the same governed pipeline — approvals still apply.**
  A voice command is not a bypass.
- **The Voice screen** detects the mic model, the selected input, the TTS engine, voice, wake
  word, and a "Test microphone" action, with a live orb. *Proof:* captured fresh.

### 1.16 Packaging, supply chain, install
`packaging/`, `install.sh`, `install.ps1`, `.github/workflows/`

- **Four install channels:** npm (`@rrrtx/xr`), a binary via `install.sh` / `install.ps1`,
  Homebrew (`ahmadrrrtx/tap/xr`), and per-platform packaging (winget/scoop/Flatpak/MSIX).
- **Every release is cosign-signed, SLSA3-provenanced and published to npm with a provenance
  attestation.** CI runs osv-scanner, bun audit, gitleaks, a licence scan, SBOM drift checks,
  `--ignore-scripts` hygiene and a container scan.

### 1.17 Performance — budgets, not boasts
`docs/perf/PERF-BUDGETS.md`, `docs/perf/baseline-1.0.0-source.json`

| Surface | Budget | Measured (1.0.0 baseline) |
|---|---|---|
| `--version` / `--help` warm p95 | < 150 ms | 39.8 / 40.5 ms |
| `--version` / `--help` cold p95 | < 300 ms | 40.8 / 42.5 ms |
| `doctor` | < 1 s (gate ceiling 2500 ms) | 586 ms p95 |
| route decision | < 20 ms | sub-ms |
| dashboard first render | < 1 s | 12.1 ms |
| retrieval @100k items | gate ceiling 250 ms | 24–29 ms |

**The fast path performs zero synchronous FS/process I/O** (lint-enforced) and every command
boots only the subsystems it needs. Verified live in this session: `xr --version` returned
`v1.1.0 (Graphite)` essentially instantly.

---

## 2. "FEATURES ONLY XR HAS" — the persuasion core

My honest take. Each of these is **structurally** hard to copy, not a feature checkbox. For each
one I state the claim *and* the thing that would make it a lie.

**1. The refusal plane is a named, enumerable, test-enforced boundary.**
Most agents "have approvals" as a prompt or a setting. XR has *XR Shield* — seven components,
one import, and a CI test (`test/architecture/xr-shield-facade.test.ts`) that **fails the build
if a listed module stops existing**. The docs physically cannot drift from the code.
*Why it's rare:* enforcement you can't enumerate is enforcement nobody audits.
*What would make it a lie:* a shield component that can be bypassed by a surface. XR's answer is
the "no bypass around the runner" rule — every surface funnels into one call.

**2. The audit log is verifiable offline, and it records the refusals too.**
`xr audit verify` → `✓ Audit chain intact · SHA-256 hash chain`, no server, no account. Most
agent products log to their own cloud, where "tamper-evident" is a vendor promise. XR's is a
file you hold. **And the chain captures what XR *refused* to do**, not only what it did.
*Why it's rare:* the refusals are the interesting half of the log, and almost nobody records them.
*What would make it a lie:* if the chain were written by the same component that could lie.
XR separates the signer (`src/security/audit-signer.ts`) and the verifier.

**3. The budget cap is enforced mid-loop, and XR tells you the cap is not a guarantee.**
USD **and** token ceilings are checked before and during steps — and the docs state plainly that
a response can overshoot and that unknown model pricing cannot enforce a USD bound at all.
*Why it's rare:* a tool that admits its own limit is more trustworthy than one that promises.
Most competitors quietly imply the cap is hard.
*What would make it a lie:* if the cap were checked only at the end. It is checked in
`src/cost/governor.ts` inside the step loop.

**4. "No local feature is paywalled, ever" is enforced by a test, not by copy.**
`test/cloud/license.test.ts` **fails the build** if a local capability appears in the licence's
feature list. The entire gated set is eight *hosted* services, enumerated in
`BUSINESS_FEATURES` (`src/cloud/license.ts`). *Why it's rare:* almost every open-core agent
monetises something that runs on your machine.
*What would make it a lie:* if a hosted service were secretly load-bearing for a local feature.

**5. The product's own README is linted for overclaims.**
`bun run claim-lint` fails the build on prohibited/supervised terms, and every `Article N` cited
anywhere in `src/`, `test/`, `scripts/` or `.github/` must exist in `docs/CONSTITUTION.md`.
**The marketing copy is generated by the same enforcement machinery as the code.** *Why it's
rare:* the landing site can repeat the README's claims because CI refuses unsourced ones.
*What would make it a lie:* if claim-lint only ran on the marketing repo. It runs on the source.

**6. Model output is treated as data, structurally — not by a prompt instruction.**
Tool output is framed as untrusted data before it re-enters the prompt
(`src/security/tool-output.ts`). Most prompt-injection defence is a paragraph in a system
prompt asking the model to be careful. *Why it's rare:* structure beats instruction.
*What would make it a lie:* if any path re-injected tool output raw. The architecture test
pins allowed dependency directions.

**7. Effective authority is an intersection, and denied permissions always win.**
A capability's authority is not what it declares. It is
`declaration ∩ publisher ∩ workspace ∩ user grant ∩ agent grant ∩ trust placement − denied`,
and **if XR cannot determine effective authority, the capability must not run at all.**
*Why it's rare:* the industry default is "declared permissions" with a warning.
*What would make it a lie:* a fallback that runs on uncertainty. XR's rule is the opposite.

**8. Ten local model runtimes are first-class, and provider count is deliberately not scored.**
Ollama, LM Studio, llama.cpp, Jan, LocalAI, vLLM, GPT4All, KoboldCPP, Text-Generation-WebUI,
SGLang — all reachable through one transport. And the README says outright:
*"Provider count is not a measure of product quality and is deliberately not scored by
`xr evaluate`."* *Why it's rare:* honesty about your own vanity metric.
*What would make it a lie:* if local runtimes were second-class in the routing. They are not —
`health()` probes and failover treat them identically.

**9. A research run reports its own contradictions.**
The recorded run shows `⚠ 1 contradiction(s) detected` and an evidence ledger of
`18 block(s), 14 verified`. A tool that surfaces where its sources disagree is more useful
than one that averages them into a smooth paragraph. *Why it's rare:* most research tools
present a confident synthesis and hide the disagreement.
*What would make it a lie:* if contradictions were computed but not surfaced. They are.

**10. Outcomes are honest — `success`, `failed`, or `cancelled`, never a fake completion.**
Cancellation is cooperative and real; `Ctrl+C`/`Esc` stop the current run and a pending
approval is **denied fail-closed first**; `xr run` maps the first `SIGINT` to exit `130`.
*Why it's rare:* "it says it finished" is the single most common lie in agent software.
*What would make it a lie:* if cancellation were advisory. The state machine has a cancel check
at step ⓪ and again at step ③.

**11. "You are the operator" is a first-run gate, not a settings toggle.**
The onboarding wizard's *second* step states three promises — Local-first, Private by default,
You are the operator — and **the Continue button is gated on an unchecked box.** You cannot skip
it. *Why it's rare:* consent architecture as the first screen the user ever sees.
*What would make it a lie:* if the checkbox were decorative. It gates the button.

**12. The mobile companion has no third party in the path at all.**
No app store, no relay, no push service that can read the payload (RFC 8291 *and* an AES-GCM
layer under a key only the paired phone holds), and a certificate change is a **stop screen,
not a retry button**. *Why it's rare:* most "mobile companion" features route through the
vendor's cloud.
*What would make it a lie:* if the LAN mode were the default. It is opt-in — loopback stays default.

**13. The extension surface is uniformly governed.**
An MCP server gets **no more privilege than a bundled tool.** Skills, plugins, MCP and
templates are reachable identically from every surface and all four pass through the same
trust plane. *Why it's rare:* MCP is usually a privileged side-door.
*What would make it a lie:* if a capability type bypassed the plane. The architecture gates
pin the allowed dependency directions.

**14. The self-imposed limits are published.**
`docs/security/KNOWN_LIMITATIONS.md` is a first-class release artifact, the README states XR
is *not* SOC 2 / ISO 27001 / HIPAA / PCI-DSS / FedRAMP certified, *not* a sandbox, and *not*
finished — and a 172,000-LOC ceiling on the whole tree is CI-enforced so the code that was
deleted cannot quietly grow back.
*Why it's rare:* published limitations are a trust instrument, not a weakness.
*What would make it a lie:* if the limitations page were stale. It is a release artifact.

---

## 3. OFFICIAL ASSETS INVENTORY

### 3.1 The brand pack (Google Drive — the owner's folder)

`10lLJpgJz1uQzxI0oMGx_N-V7E0rXSx7L` — *"XR — Scalable Masters (Faithful Vector Reconstruction)"*,
5 SVG masters + SVGZ web copies + 4× PNG exports + originals + a verification folder.

| File | Canvas | SVG | SVGZ | SSIM vs original |
|---|---|---|---|---|
| `XR-Logo-Original-Background.svg` | 474×374 | 7.98 MB | 646 KB | 1.000000 |
| `XR-Logo-Transparent.svg` | 474×374 | 2.88 MB | 245 KB | 1.000000 |
| `XR-Avatar-Front.svg` | 556×487 | 10.19 MB | 959 KB | 0.999999 |
| `XR-Avatar-Side-1.svg` | 295×271 | 3.56 MB | 328 KB | 0.999999 |
| `XR-Avatar-Side-2.svg` | 526×433 | 7.60 MB | 662 KB | 0.999999 |

The pack's own README is explicit that these are **faithful reconstructions, not simplified
logos** — dense vector gradients, not a handful of hand-drawn paths, so an individual letterform
cannot be re-shaped; and that they must **not** be used as a 16–32 px favicon because they turn
to mush at tiny sizes. It recommends the SVGZ copies for the web.

**Drive access status:** the files are **not** link-shared (direct `curl` returns Drive's HTML
interstitial — confirmed for 5 different IDs this session). The repo documents the same
limitation in `scripts/fetch-v2-assets.sh`, which lists every Drive file ID and states the
files were staged in the agent environment via the Drive connector.

**What we use and why** — the repo already ships the *web-optimised derivatives* of this exact
pack, produced by `website/scripts/generate-brand-assets.py` from the staged v2 pack, and
**that script is the provenance chain**: it copies the favicon/apple-touch/icon/emblem rasters
straight out of `assets/v2/`, then crops/resizes the 4× masters into `xr-wordmark.png`,
`xr-avatar-front.webp` and composes the 1200×630 OG image on XR navy. We vendored those
derivatives into the site repo:

| Site asset | Source | Size |
|---|---|---|
| `public/brand/xr-emblem.png` | `XR-Emblem-512.png` (verbatim copy) | 512×512, 92 KB |
| `public/brand/xr-wordmark.png` | `XR-Logo-Transparent-4x.png` → 640 wide | 640×505, 150 KB |
| `public/brand/xr-avatar-front.webp` | `XR-Avatar-Front-4x.png` → 512 wide | 512×448, 68 KB |
| `public/brand/xr-avatar.png` | `assets/avatar.png` (repo root) | 512×448, 224 KB |
| `public/brand/xr-logo.png` | `assets/logo.png` (repo root) | 512×404, 104 KB |
| `public/brand/icon.svg` | `XR-Favicon.svg` → coordinate-precision pass | 171 KB |
| `public/brand/icon-micro.svg` | `XR-Favicon-Micro.svg` | 112 KB |

**The identity as it actually appears (from the live app's own SVG, `desktop/src/components/brand/Logo.tsx`):**
a stylised **X** built from four blades, wrapped by a **tilted orbital ring**, over a glowing
**cyan core** — with the wordmark `XR` and the tagline **"The AI Agent You Can Actually Trust"**.
The same tagline is the CLI banner (`src/commands/*`) and the repo description.

### 3.2 The Orb — the hero centrepiece

**This is the important one, and the answer is not what the brief assumed.**

The orb is **not** a WebGL/shader sphere. It is a **delivered animation pack** — "Orb v2" —
rendered as 48-frame loops. The repo's own rule, in `desktop/src/components/brand/VoiceOrb.tsx`:

> *"Used directly as delivered — never redrawn."*

| | |
|---|---|
| States | 9 canonical: `idle`, `listening`, `thinking`, `speaking`, `waiting-approval`, `approved`, `denied`, `error`, `sleeping` (`desktop/src/components/brand/types.ts` → `AVATAR_STATES`) |
| Animated | `desktop/src/assets/orb/orb-<state>.webp` — 280×280 RGBA animated WebP, 9 files, 2.1 MB total |
| Poster stills | `desktop/src/assets/orb/poster/orb-<state>.png` — 560×560 RGBA |
| Idle recolours | `desktop/src/assets/orb/themes/orb-idle-{nebula,solar,emerald,crimson}.webp` (560×560 stills + webp) |
| Design | glass nebula sphere · dual electron rings (one tilted bright, one cyan) · layered cyan core |
| Honesty rules | ≤64 px renders the **poster still**, never the animation. `prefers-reduced-motion` always renders the poster still. Idle themes recolour the idle loop only; every other state keeps the canonical cyan pack. |

**Authenticity — verified this session, not assumed.** The repo's committed orb files were
sha256-compared against the official `assets/v2/MANIFEST.json` (generated from the Drive pack):
**15 / 15 exact matches, 0 mismatches, 0 missing** — 9 animated WebPs, 2 poster PNGs and
4 theme WebPs.

**Orb behaviour we can faithfully reproduce on the landing site** (`desktop/src/lib/orbCore.ts`):

- `VOICE_TO_ORB` maps the 12 voice-session states onto the 9 orb states
  (idle→idle, listening/interrupted→listening, thinking/planning/working/tool→thinking,
  speaking→speaking, approval→waiting-approval, error→error, success→idle).
- Glow is **full on the three dark themes, dimmed to 0.6 on the two light ones** — the orb keeps
  its signature black+cyan look on *every* theme and only the halo intensity adapts.
- `error` is a **finite 2.5 s flash** that lands back on idle.
- `sleeping` after **30 minutes** without interaction or state change.
- A single click plays a **2 s listening preview**; a double-click under 400 ms focuses the
  main window; a press that moves >4 px becomes a native window drag.
- The window is **fully transparent — the SVG paints everything.**

**Design decision for the site:** the hero uses the **real animated orb WebP** as the centrepiece,
sitting inside a **WebGL energy field** (a shader-driven halo/particulate atmosphere) that is
audio-reactive to the voice line and responds to pointer parallax. The shader is *around* the
orb, never *instead of* it. We never redraw the orb, and we never substitute a generic glow
ball. Under `prefers-reduced-motion` the orb renders the **poster still** and the shader
disables.

### 3.3 Everything else in the brand world

- `website/public/og.png` — 1200×630 OG composite, composed by the repo's own script on XR navy
  (lockup left, avatar right).
- `website/public/manifest.webmanifest`, `favicon.ico`, `icon-192/512`, `icon-maskable-512`,
  `apple-touch-icon.png` — the official **Icon Family v2** (App Icon, Favicon, Favicon Micro,
  Tray, Emblem, Avatar Icon, Mono White/Black).
- `assets/logo.png`, `assets/avatar.png` — the repo-root rasters the daemon dashboard reads.
- `scripts/v2-app-icon-ids.txt` + the Drive `App-Icons` folder — **104 app-icon SVGs** that the
  app renders with `currentColor`. Not needed for the landing site, listed here for completeness.

---

## 4. FRESH MEDIA HARVEST — the log

### 4.1 What actually ran in the sandbox

| Surface | Command | Result |
|---|---|---|
| XR desktop app (Vite multi-page) | `bun run dev` in `desktop/` | ✅ **Ran.** 15 routes captured, 0 page errors |
| XR engine daemon | `bun run desktop/scripts/dev-engine.ts` | ✅ **Ran** on `127.0.0.1:3141`, token-authed |
| Mobile companion PWA | `bun run dev` in `mobile/` | ✅ **Ran** on `127.0.0.1:5180` |
| `xr` CLI | `bun run src/index.ts …` | ✅ **Ran** — version, doctor --json, providers list, capabilities list, skills list, audit verify |
| Toolchain | Playwright + Chromium 156 + ffmpeg (Playwright build) | ✅ Installed this session |

### 4.2 What was captured FRESH (35+ screens, all this session)

**Desktop app — every route, with live engine data** (`/home/user/harvest/app-*.png`):
`chat` · `brain` · `builder` (IDE, XR repo open, README.md in the editor) · `research` ·
`agents` · `skills` · `shield` · `runs` (Control Room) · `memory` · `budget` ·
`integrations` · `voice` · `settings` · `workspaces` · `brand-gallery` (dev-only) ·
`dashboard` + `daemon-chat` (the `xr serve` "XR Control" console) · `mobile-pairing`.

**Onboarding — all 10 steps walked and captured** (`onb-01…onb-12`):
1. Welcome to XR · 2. Three promises, before we begin · 3. Checking your system… ·
4. Pick a brain · 5. Downloading qwen2.5-coder-7b · 6. Set your microphone · 7. Choose a voice ·
8. Make it yours · 9. Connect your world (later) · 10. "Hey, I'm XR." · 11. Chat · 12. Voice.

**The orb** — `fresh-orb.png` is the **live app's own orb window** (`/orb.html`) rendering the
real pack, captured from the running desktop build.

**Video** — `xr-app-tour.webm`: a **37 s screen recording of the real running app**
(chat+orb → brain → research → agents → shield → budget → back to chat) at 1280×800 VP9,
**694 KB**, with a PNG poster. Recorded with Playwright's video capture against the live dev
server — every frame is the real product.

**CLI transcripts** — five **real, offline, deterministic** command outputs saved as text:
`version` (`v1.1.0 (Graphite)`), `providers` (26 presets), `capabilities` (167),
`skills` (80 records / 65 bundled), `audit` (`✓ Audit chain intact`).

### 4.3 What was REUSED from the repo's own `previews/` archive (and labelled as such)

Only for surfaces that genuinely could not be produced live in the sandbox:

- **Mobile chat / approvals / settings screens** — the real mobile PWA ran, but every route
  lands on the *pairing* screen (see §4.4). `previews/implementation/phase-28/` holds real
  captures of the mobile chat list, conversation, voice orb, approvals, approval detail,
  settings, pairing confirmation, desktop pairing QR and the push lock screen.
- These will be labelled **"from the XR mobile app"** in the UI, and the *fresh* pairing screen
  is the one used for the mobile section's hero.

### 4.4 BLOCKED — and what was tried (nothing faked)

| # | Blocked | What was tried | How the site handles it |
|---|---|---|---|
| **B1** | **A live XR *answer*.** No provider API key and no local model in the sandbox (Ollama port 11434 closed; `xr providers list` shows ollama configured but unreachable). | Started the engine, ran the CLI, tried Ollama. The app renders fine but any task needing a model stalls. | The interactive preview replays **genuine recorded output** — the real CLI transcripts above and the real 82-event research run — explicitly labelled *"recorded session"*. It is **never** presented as a live AI. The owner can swap in a real recording from their own machine (see §6). |
| **B2** | **Paired mobile screens.** `POST /api/mobile/pair-qr` → `{"error":"not found"}`. | Called the pairing endpoints directly with the operator token. The routes are **not in the shipping daemon's route table** — which the README itself states as the remaining integration step. | The real pairing screen is used (fresh). Other mobile screens come from the repo's real `phase-28` captures, labelled. |
| **B3** | **MP4 video.** The sandbox ffmpeg (Playwright build) ships **VP9/VP8 only** — no `libx264`, no `mjpeg`. | Checked `-encoders` and `-formats`: `matroska,webm` muxers and `libvpx-vp9` only. `apt-get install ffmpeg` failed (no repo access). | Ship **VP9 WebM** (694 KB, plays in Chrome/Edge/Firefox/Safari 16+) + a PNG poster. Adding an MP4 rendition is a 30-second `ffmpeg -i in.webm -c:v libx264 out.mp4` on any normal machine — listed in §6. |
| **B4** | **Drive bulk pull.** The brand files are not link-shared; `curl` returns Drive's HTML interstitial for every ID tried. | 5 direct-download attempts across two folders. | Used the repo's own Drive-derived derivatives (provenance: `website/scripts/generate-brand-assets.py`) plus the repo-committed orb files, **all sha256-verified against `assets/v2/MANIFEST.json`**. |
| **B5** | **Live GitHub star count beyond what the API returns.** | GitHub API returns 6 stars, 1 fork. | The site shows the **live** count via the API, and the copy positions XR as early-stage and founder-built. No invented traction. |

---

## 5. SITE PLAN

### 5.1 Section map

| # | Section | What it contains | Real assets used |
|---|---|---|---|
| 0 | **Nav** | Wordmark emblem, GitHub star button (live count), "Join the waitlist" | `xr-emblem.png`, GitHub API |
| 1 | **Hero** | The **real animated orb** in a WebGL energy field, audio-reactive to the voice line, pointer parallax. Headline: *"The AI agent you can actually audit."* (the repo's own README line). Sub: BYOK · local-first · spend-capped · hash-chained log you can verify offline. **Waitlist form #1.** | `orb-idle.webp` + `orb-*.webp` states, `orb-poster` for reduced-motion, `xr-emblem` |
| 2 | **The voice moment** | "Hey, I'm XR — I'll be available for you soon." with the orb reacting in real time to the audio (Web Audio analyser → shader). | `placeholder-voice` mp3 (see §6) |
| 3 | **One task, end to end** | The real execution-fabric diagram redrawn as the repo's own mermaid: one call → Execution Fabric → agent loop → trust plane → SQLite → audit. Shows *where the refusals happen*. | `README.md` § How it works |
| 4 | **Feature grid** | 12 cards, each a real screen + a verified claim: Desktop · Builder IDE · CLI agent · Research · Multi-agent + approvals · Brain/memory · Mobile app · Integrations · Providers/BYOK · Security/trust plane · Spend caps · Audit log | 19 fresh app captures |
| 5 | **"Only XR"** | The 14 shortlist items from §2, as the persuasion core. Each one states the claim *and* the caveat — which is what makes it credible. | — |
| 6 | **Interactive preview — "Watch a real XR run"** | A real terminal that plays a **recorded XR session**: the ASCII banner, then `xr audit verify` → `✓ Audit chain intact`, then `xr capabilities list` → 167, then `xr skills list` → 80 records, then the **82-event research run** replayed as a live log (planning → 4 searches → 7 sources → 18 evidence blocks, 14 verified → ⚠ 1 contradiction). Labelled "recorded session — not a live AI". | `public/cli/*.txt`, `quick-run.jsonl` |
| 7 | **Onboarding strip** | The real first-run sequence, step by step, as a horizontal filmstrip: Welcome → 3 promises → system check → pick a brain → mic → voice → preferences → integrations → "Hey, I'm XR." | 12 fresh onboarding captures |
| 8 | **Mobile companion** | The real pairing screen + the real mobile captures; the TLS-pinning and sealed-push details. | fresh pairing screen + `phase-28` captures |
| 9 | **Free vs Business OS** | The repo's **actual** pricing language, verbatim in substance: Personal is free forever with every local feature; Business is **$15/user/month** or **$144/user/year** ($12/mo equivalent) and buys team members/roles, shared team workspaces, SSO admin, pooled managed models ($20/user/month included quota by default), team memory sync, audit log + signed CSV export, admin console, cloud relay. 30-day trial, up to 5 seats, no card. Enterprise quoted per contract, NET 30, no self-serve checkout, no support SLA. **No invented numbers.** | `README.md` § Pricing, `src/cloud/license.ts` |
| 10 | **Final CTA** | Waitlist form #2 + GitHub star + install line `npm i -g @rrrtx/xr` | — |
| 11 | **Footer** | © rrrtx systems · agency link → **rrrtx-systems.com** · GitHub · npm · hello@rrrtx-systems.com · privacy/terms (owner-TODOs marked) | — |

### 5.2 Stack — and why

**Next.js 16 (App Router) + React 19 + Tailwind CSS v4 + TypeScript, deployed to Vercel.**

The decision is forced by the target, and it happens to be ideal. The upstream repo already ships a
`website/` on Next 16 + React 19 + Tailwind 4 with a `vercel.json`, a CSP/security-header
middleware and a `next.config.ts` whose `allowedDevOrigins` already whitelists the sandbox
preview hosts. **Matching the upstream stack means the marketing site and the product share one
toolchain, one design language and one reviewer** — the landing site can import the repo's own
theme tokens rather than re-declaring them, and the owner can move code between them without a
rewrite.

**Tailwind v4 with the repo's theme tokens as CSS variables.** The 5-theme token table in §1.14
becomes the site's `@theme` block. One accent per theme, contrast-first, glow-as-a-tool — the
site inherits XR's own design rules instead of imposing a new brand on it.

**Turso (libSQL) for the waitlist** — the owner's locked decision. The serverless-friendly
embedded-replica model fits a Vercel function perfectly, and the schema is a single table with
`email` as the primary key, which makes duplicate handling a database-level guarantee rather
than an application convention.

**No 3D framework.** Three.js would add ~150 KB to the critical path for a shader we can write
in ~120 lines of raw WebGL2 — a full-screen quad, a fragment shader, a `uniform` for the audio
analyser. The orb itself is a WebP, not geometry. This is how we get LCP < 2.0 s on 4G *and*
keep the "real orb" promise.

**No client-side state library, no carousel library, no icon font.** The interactive preview is
a small deterministic player over a pre-baked JSON event log; icons are inline SVG.

### 5.3 Vercel architecture

```
xr-site/                          Next.js 16 App Router (TypeScript, Tailwind v4)
├─ app/
│  ├─ layout.tsx                  metadata, OG/Twitter, JSON-LD, fonts, skip-link
│  ├─ page.tsx                    the landing page (all 12 sections, one route)
│  ├─ api/subscribe/route.ts      POST → Turso (Node runtime, edge-compatible)
│  ├─ robots.ts  sitemap.ts  not-found.tsx
│  └─ opengraph-image.tsx         generated 1200×630 from the emblem + orb
├─ components/
│  ├─ orb/OrbStage.tsx            real WebP orb + WebGL2 energy field + audio reactivity
│  ├─ orb/shader.ts               GLSL fragment shader (raw WebGL2, no deps)
│  ├─ voice/VoiceLine.tsx         Web Audio analyser → orb/shader uniforms
│  ├─ session/TerminalReplay.tsx  plays the recorded XR session
│  ├─ research/ResearchReplay.tsx plays the 82-event research run
│  ├─ onboarding/OnboardingStrip.tsx
│  ├─ features/FeatureGrid.tsx    12 real-screen cards
│  ├─ onlyxr/OnlyXR.tsx           the 14-item shortlist
│  └─ waitlist/WaitlistForm.tsx   used twice (hero + final CTA)
├─ lib/
│  ├─ turso.ts                    client + schema bootstrap
│  ├─ claims.ts                   every copy claim → its repo path (single source)
│  ├─ site.ts                     identity, nav, links
│  └─ features.ts                 the 12 feature cards, each with its capture + claim
├─ public/
│  ├─ brand/  orb/  screens/  media/  cli/        ← ALL assets in-repo
│  ├─ icon.svg  favicon.ico  manifest.webmanifest
├─ schema/001_waitlist.sql        the Turso schema
├─ .env.example                   TURSO_DATABASE_URL, TURSO_AUTH_TOKEN
└─ README.md                      one-command schema export + import
```

**`/api/subscribe` contract** (`app/api/subscribe/route.ts`, Node runtime):

- `POST { email }` only — **email is the only field collected. No name, no tracking, no IP logging.**
- **Validation:** RFC-ish shape check, length cap, lowercase + trim, reject obvious junk.
- **Honeypot:** a hidden `company` field (and a timing check) — bots that fill it get a *200 OK*
  with no write, so they learn nothing.
- **Duplicate-safe:** `email` is the **primary key**; the insert is
  `INSERT … ON CONFLICT(email) DO NOTHING` — a duplicate is a no-op, not an error, and never a
  double row. The API returns `200 { status: "already-subscribed" }`.
- **Success/error states:** `200 { status: "subscribed" }` · `200 { status: "already-subscribed" }` ·
  `400 { error }` · `503 { error }` — and the form has an `aria-live` region announcing each.
- **Privacy line at the form:** "One email, stored in the waitlist. No tracking, no newsletter.
  Delete it any time by replying." + a link to the owner's privacy page (TODO if it doesn't exist).
- **Never bulk-email from the site.** The owner exports the table and imports it to a real ESP
  at launch. This is documented in the README, not just implied.

**Turso schema** (`schema/001_waitlist.sql`):

```sql
CREATE TABLE IF NOT EXISTS waitlist (
  email       TEXT PRIMARY KEY NOT NULL,
  source      TEXT NOT NULL DEFAULT 'landing',
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS waitlist_created_at ON waitlist(created_at);
```

**One-command export for the owner (documented in the site README):**

```bash
turso db shell . schema/001_waitlist.sql        # create
turso db export waitlist --output waitlist.csv  # export for the ESP
```

**Env:** `TURSO_DATABASE_URL` + `TURSO_AUTH_TOKEN` are **Vercel environment variables only** —
never committed. `.env.example` ships the shape with empty values. The API route returns a
`503` with a clear message if the env is missing, so a misconfigured deploy fails loudly instead
of silently dropping signups.

### 5.4 Design direction

- **Dark by default, XR Native.** `--bg-void #03070D` → `--bg-ink #0A0F1A` → `--bg-raised #121826`,
  accent `#00E5FF`, glow `rgba(0,229,255,.45)`. The page should feel like the app's own
  deep-space chrome, not a generic dark SaaS page.
- **The product leaked onto the web.** Sections are separated by the app's own rhythm: a 1px
  `rgba(183,194,207,.08)` hairline, generous void, and the accent used *sparingly* — glow is a
  tool, not a default. The hero is a void with the orb floating in it.
- **Type:** a system stack (no webfont download) at a tight scale, with the app's own feel:
  tight tracking on headings, `text-secondary` for meta, `text-tertiary` for captions.
- **Motion:** short, purposeful, and fully disabled under `prefers-reduced-motion` — the orb
  falls back to the poster still, the shader stops, the terminal replay shows the full log at once.
- **Honesty as a design material.** Where the product has limits (in-process policy, not a
  sandbox; the USD cap is not a guarantee; mobile pairing routes not yet wired), the site says so
  in the same visual language as the features. That asymmetry is the design.

---

## 6. ASSET REQUESTS FOR THE OWNER

Specific, one per line, with why each one matters and what it replaces:

1. **A real voice recording of the line** — *"Hey, I'm XR. I'll be available for you soon."*
   in XR's chosen voice, as a clean WAV/MP3. Replaces the **clearly-marked `placeholder-voice`**
   track. *(The repo has **no** bundled voice audio — `src/voice/` ships the TTS/STT code but no
   audio assets, verified this session. The placeholder is labelled in the UI and in the build
   report.)*
2. **The Drive `XR-Avatar-Animations-V2` folder** (`1Vz-9iqQm2cnTgz2L1pPmVMPJPokNyrT-`) and
   **`Orb-V2 + App Icons`** (`1C5Ic8DCH7_Th4zNITObuW0mTnlhX2cwG`) link-shared with
   "anyone with the link", so `scripts/fetch-v2-assets.sh` can run outside this sandbox. We
   already have byte-verified copies of the orb — this is about reproducibility for you.
3. **A simplified small-size icon family** (16/32 px) derived from the emblem. The pack's own
   README warns the detailed masters "will turn to mush at tiny sizes" and explicitly says the
   next step should be a simplified XR icon family. We ship the official `icon-micro.svg` as the
   favicon meanwhile.
4. **A real 30–45 s screen recording of XR answering a task** on your machine, with a provider
   key. It drops straight into the interactive preview and replaces the recorded transcripts
   with a live-feeling run. (This is the only way to close BLOCKED **B1** honestly.)
5. **The real mobile chat/approval screens** from a paired phone, if the mobile daemon routes
   have been wired since — otherwise we use the repo's `phase-28` captures, labelled.
6. **A privacy policy URL and a terms URL** for the real site (or confirmation that
   `rrrtx-systems.com` hosts them), plus the **imprint/company address** for the footer. The
   footer will otherwise carry an explicit owner-TODO, never a fake link.
7. **Confirmation of the waitlist ESP** (Brevo / ConvertKit / Resend / plain CSV) so the export
   path in the README matches what you'll actually use at launch.
8. **Your approval of the headline and sub-headline** — the plan uses the repo's own README line
   (*"An AI agent runtime you can actually audit."*) as the hero headline, and the tagline
   baked into the logo (*"The AI Agent You Can Actually Trust"*) as the closing beat.

---

## 7. WHAT I DID NOT DO (and why)

- **I did not redraw the orb.** The brief suggested a WebGL/shader recreation; the repo forbids
  it and owns a better asset. We use the real thing and put the shader *around* it.
- **I did not fake a live AI.** With no provider key, any "XR answering" demo would be a
  fabrication. The interactive preview is explicitly a **recording**.
- **I did not invent traction.** 6 stars is the real number. The site will show it live.
- **I did not build the site yet.** Act 2 is the design preview; no application code until you
  approve it. The only things written so far are the site repo skeleton, the vendored assets and
  this document.
- **I did not touch the upstream repo.** `/home/user/xr` has the dev-server `node_modules` from
  running the app, plus my seeded local workspace; the site lives in its own repo at
  `/home/user/xr-site`.

---

*End of RECON.md § 1–7 (Act 1). Act 2 findings and the design preview follow below.*


---
---

# 8. ACT 2 — LIVE PROVIDER, REAL ANSWERS, AND THE DESIGN PREVIEW

> Act 1 mapped the product from the repo. Act 2 turned the product **on** against a live
> provider, harvested the media that Act 1 could not produce without one, and produced the
> single high-fidelity preview image (`PREVIEW.png`) for approval.

## 8.1 The provider is live (Groq)

The owner supplied a Groq key. It is sealed in XR's own vault — never in this repo.

| Item | Value |
|---|---|
| Key storage | `~/.xr/secrets/` + `~/.xr/.env` (`XRG1.…`, AES-256-GCM, mode 0600) |
| Active provider | `groq` / `openai/gpt-oss-20b` |
| `xr providers test` | `groq ✓ models endpoint OK (HTTP 200) (76ms)` |
| Model catalog on this key | 11 models (`openai/gpt-oss-120b`, `openai/gpt-oss-20b`, `qwen/qwen3.8-27b`, `allam-2-7b`, `whisper-large-v3`, `whisper-large-v3-turbo`, `openai/gpt-oss-safeguard-20b`, `meta-llama/llama-prompt-guard-2-{22m,86m}`, `canopylabs/orpheus-*`) |
| **Not available** | `llama-3.3-70b-versatile` — the preset default; Groq does not serve it |

**Rate-limit ceiling (measured, not documented).** Groq's free tier exposes
`x-ratelimit-limit-tokens: 8000` per model per minute (`x-ratelimit-reset-tokens: ~52s`).
This is a *shared* 8k-token/minute bucket per model id, and it is the single hardest
constraint on capturing real agentic footage:

| Attempt | Tokens | Outcome |
|---|---|---|
| Read `README.md` (13.4k tok) | 8.0k | ✕ rate limited on the very first tool result |
| Read `package.json` (1.6k tok), `--max-tokens 6000` | 4.3k | ✓ **completed** — real tool calls + real answer |
| Desktop app chat, no tool call | 4,871 tok | ✓ **completed** — real answer in the real app |
| Desktop app chat + one tool call | ~10k across 2 requests | ✕ rate limited on the 2nd request |

**Consequence for the site:** the *interactive preview* is a recording, and the recording was
cut from runs that genuinely completed. Nothing in the preview is staged, retouched or
reconstructed.

## 8.2 A real bug found in the XR desktop app (and fixed locally)

`desktop/src/engine/wire.ts` → `resolveEngineModel()` parsed any `provider/model` id by
splitting on the first `/` and checking the left half against a list of known engine
provider ids. But **hosted model ids carry a *vendor* namespace, not a provider**:

- `openai/gpt-oss-20b` is served by **Groq**. The old code read `openai/` as the provider and
  shipped `provider: "openai"`, so the daemon correctly answered
  `Authentication failed for provider openai: check API key`.
- The same trap applies to `qwen/qwen3.8-27b` (Groq) and `meta-llama/llama-prompt-guard-2-*`.

**Fix applied locally** (registry-first, engine-fallback):

```ts
if (slash > 0 && ENGINE_PROVIDERS.has(trimmed.slice(0, slash))) {
  const prefix = trimmed.slice(0, slash);
  const rest = trimmed.slice(slash + 1);
  const full = modelInfo(trimmed);
  if (full.provider !== 'other') return { provider: full.provider, model: trimmed };
  const byRest = modelInfo(rest);
  if (byRest.provider === prefix) return { provider: prefix, model: rest };
  return { model: trimmed };      // unknown → let the engine's own routing decide
}
```

`anthropic/claude-sonnet-4.5` still resolves to `{provider:'anthropic', model:'claude-sonnet-4.5'}`;
`openai/gpt-oss-20b` now ships untouched and the engine routes it to Groq.
**This change is in the working clone only — it is not part of the site repo. It belongs
upstream.**

## 8.3 The mobile PWA targets a contract the shipping daemon does not serve

The PWA in `mobile/` is written against a **newer daemon contract** than the daemon in this
repo implements. Verified by reading the route table and by driving the real app:

| PWA calls | Shipping daemon | Status |
|---|---|---|
| `GET /api/meta/version` | `GET /api/v1/health` | **envelope differs** — `{version:{…}}` vs `{version:"…"}` |
| `GET /api/v1/chats` | `GET /api/v1/sessions` | **envelope differs** — `{sessions:[…]}` vs `{chats:[…]}` |
| `GET /api/v1/chats/{id}` | `GET /api/v1/sessions/{id}` | **envelope differs** — `{session,steps,audit}` vs `{messages:[…]}` |
| `POST /api/v1/chats` | — | **no such route** (404) |
| `GET /api/mobile/cert-fingerprint` | — | **not registered** → `{"error":"not found"}` |
| `POST /api/mobile/pair-qr` | — | **not registered** → `{"error":"not found"}` |
| `GET /api/v1/approvals` | `GET /api/v1/approvals` | ✓ but `{pending:[]}` vs `{approvals:[]}` |
| `GET /api/v1/budget` | `GET /api/v1/budget` | ✓ but `{config,persisted,usage,burn,byModel,…}` vs 5 flat fields |
| `GET /api/v1/models` | `GET /api/v1/models` | ✓ but no `models[]` array |

`src/daemon/routes/mobile-pairing.ts` exists but is **not registered** in the router, so the
pairing flow cannot complete against this daemon at all — the PWA cannot obtain its session
cookie by the intended route.

**How the mobile screenshots were captured honestly.** A **dev-only adapter**
(`mobile/src/api/dev-adapter.ts`, plus a bearer-injecting Vite proxy) normalises the
*shipping* daemon's real responses into the shapes the PWA expects. Every value in every
mobile screenshot is a real daemon response — the adapter only renames fields. **Both
patches are dev-only capture seams and are reverted before any commit; the site must not
ship a claim that the shipping daemon serves the PWA's contract.**

## 8.4 Media harvested with the provider live

| Asset | Path | What is real about it |
|---|---|---|
| CLI session recording | `public/cli/xr-session.txt` (+ `.raw` ANSI) | real TTY: spinner frames, `read package.json`, the model's real 2-sentence answer, `✓ dry-run … 4.3k tok / $2 cap`, `✓ Audit chain intact · 260 entries verified · SHA-256 hash chain`, `Monthly cap $20.00 / Daily cap $5.00`, `Active: groq (openai/gpt-oss-20b) · Routing: hybrid` |
| Desktop chat with a real answer | `public/screens/desktop-chat-{900,1600}.webp` | the real desktop app, real Groq answer, real `openai/gpt-oss-20b · 4,871 tok · $0.0254 · 0.7s to first token` |
| Mobile chat list | `public/screens/mobile-chat-list-{560,900}.webp` | real PWA against the live daemon, real session titles + real answer previews |
| Mobile conversation | `public/screens/mobile-conversation-{560,900}.webp` | real PWA, real tool trace (`list_dir` → completed, `read_file` → completed) + the real model answer |
| Mobile voice / approvals / settings | `public/screens/mobile-{voice,approvals,settings}-{560,900}.webp` | real PWA; Settings shows `XR 1.1.0 (Graphite)`, the 5 official themes, `Spent today $0 of $5 daily cap`, `This month $0 / $20` |
| Product tour | `public/media/xr-tour.{mp4,webm}` + `xr-tour-poster.png` | **37s, 1280×800** — real desktop app answering (thinking → real answer), the real Budget screen (`$1.35 / $5.00 cap`, `279.9K tokens`, by-model breakdown, spend chart), then the real mobile app |
| Brand masters | `public/brand/xr-avatar.png`, `xr-logo.png`, `xr-mark.png`, `xr-lockup.png` | the owner's uploaded 4× PNGs, resampled and cropped only — no redraw |

**Honest placeholders still in the repo (Act 3 must replace or remove):**
`public/media/placeholder-voice.mp3` — a real TTS clip recorded in Act 1, clearly named, used
only until the owner's own XR voice line is supplied.

## 8.5 The design preview — `PREVIEW.png`

`PREVIEW.png` is a **3200×2000** render of the intended landing hero, produced by
screenshotting `preview/comp.html` (the design source, kept in-repo for reproducibility).

**Design rationale**

1. **The owner's avatar is the hero, not the orb.** The uploaded 4× avatar — helmeted sphere,
   glowing cyan eyes, energy tendrils rising from a bright core — is the one piece of
   art in the kit that is unmistakably a *character*. It carries the hero at 648px on a
   cyan halo, framed by two orbital rings so the composition echoes the emblem without
   borrowing the orb. The orb pack stays where it belongs: inside the product.
2. **The official lockup, not a re-set wordmark.** The nav uses a cropped emblem
   (`xr-mark.png`); the hero uses the full uploaded lockup at 210px so the real tagline
   ("The AI Agent You Can Actually Trust") is on screen in the owner's own typography. The
   H1 is therefore *not* a paraphrase of the tagline — it is the README's own sentence,
   "Give it a task. It plans, uses tools, and changes real things on your machine."
3. **Waitlist is above the fold, in the hero, and it is the only loud thing on the page.**
   A single email field + one filled cyan button, with the privacy line directly beneath it
   ("Email only. We use it to tell you when XR is ready — nothing else"). Nothing is
   pre-ticked, there is no second competing CTA, and the GitHub star is the *secondary*
   action, sitting below the form as a quiet pill.
4. **Real screenshots, in real brand colours, as the scroll cue.** The bottom band holds
   three genuine captures — Multi-agent, Builder IDE and the mobile app in a real phone
   frame — each captioned in the product's own mono type. The page reads as a long scroll
   continuing below the fold rather than a poster.
5. **Dark brand system, exact tokens.** `#03070D` void, `#0A0F1A` ink, `#00E5FF` accent,
   `rgba(0,229,255,0.45)` glow, `#F0F4F8`/`#9AA8BA`/`#7D8CA3` text, `#B7C2CF` metal — the
   values lifted from `desktop/src/styles/themes.css`, with Inter and JetBrains Mono served
   from the repo's own `woff2` files. No hotlinked fonts, no trackers, no stock imagery.

## 8.6 Still outstanding (Act 3)

- `PREVIEW.png` is a **design comp**, not the site. No application code has been written.
- The mobile PWA ↔ daemon contract gap (§8.3) needs an owner decision: upgrade the daemon
  to the mobile contract, or point the PWA at the shipping one.
- The `resolveEngineModel` fix (§8.2) should go upstream.
- The voice line is still a marked placeholder.
