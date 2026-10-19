/**
 * The feature blocks.
 *
 * Every entry pairs a REAL capture (in `public/screens/`, shot from the
 * running app) with copy that is sourced from the XR repo. The
 * `claim` field names the repo path the copy came from — the same
 * discipline as `CLAIMS.md`, kept next to the data so the two cannot
 * drift apart.
 */

export type Feature = {
  id: string;
  title: string;
  lead: string;
  body: string;
  /** Real capture, in `public/screens/`. */
  shot?: {
    base: string;
    /** Widths that exist on disk. */
    widths: number[];
    alt: string;
    /** Optional caption rendered over the frame. */
    caption?: string;
  };
  /** The repo path the copy above is taken from. */
  claim: string;
  /** Small list of real facts shown as chips. */
  facts?: string[];
  /** Rendered as a terminal card instead of a screenshot. */
  terminal?: string;
};

export const features: Feature[] = [
  {
    id: "desktop",
    title: "Desktop",
    lead: "A real work surface, not a chat window with a sidebar.",
    body: "XR's desktop app is the primary surface: the agent plans, calls tools, and every step is inspectable. The header shows the live model, the spend you have left, and the audit surface — all in one strip.",
    shot: {
      base: "/screens/desktop-chat",
      widths: [560, 900, 1600],
      alt: "The XR desktop app answering a question, showing the model name openai/gpt-oss-20b, the token count 4,871 tok, the cost $0.0254 and the time to first token 0.7s.",
      caption: "XR desktop · a real answer",
    },
    claim: "desktop/src/screens/Chat/ — README.md § How it works",
    facts: ["Streaming answers", "Ask · Agent · Plan modes", "Per-request token + cost"],
  },
  {
    id: "builder",
    title: "Builder IDE",
    lead: "Ship the agent you actually want.",
    body: "The Builder is a workspace IDE: a project tree, a file tree, a source panel, an open-files server and a run panel. You can edit the agent's own configuration and run it without leaving the app.",
    shot: {
      base: "/screens/builder",
      widths: [560, 900, 1600],
      alt: "The XR Builder IDE open on a project, with a file tree on the left, a source panel in the middle and a run panel on the right.",
      caption: "Builder IDE",
    },
    claim: "desktop/src/screens/Builder/ — src/daemon/routes/builder.routes.ts",
    facts: ["Project + file trees", "Open-files server", "Run panel"],
  },
  {
    id: "cli",
    title: "CLI agent",
    lead: "The engine runs without a dashboard.",
    body: "XR is headless-first. The CLI is the same runtime the desktop app talks to, so a task that worked in the app works in a pipeline, a script or a cron job.",
    terminal: "cli",
    claim: "src/cli/coder/index.ts — README.md § Quick start",
    facts: ["--budget", "--dry-run", "--max-tokens"],
  },
  {
    id: "research",
    title: "Research",
    lead: "Sources, evidence, and the contradictions left in.",
    body: "Research runs are recorded as events: every search, every source, every evidence block, and a flag when two sources disagree. A recorded run in the repo's own fixtures contains a real HTTP 503 and still produced 18 evidence blocks.",
    shot: {
      base: "/screens/research",
      widths: [560, 900, 1600],
      alt: "The XR research screen with a source list on the left and a run log on the right.",
      caption: "Research",
    },
    claim: "test/desktop/fixtures/research/quick-run.jsonl — desktop/src/screens/Research/",
    facts: ["4 searches · 7 sources", "18 evidence blocks", "Contradictions flagged"],
  },
  {
    id: "agents",
    title: "Multi-agent + approvals",
    lead: "Agents that ask before they act.",
    body: "XR ships agent definitions you can compose — supervisor, coordinator, planner, researcher, reviewer, builder, auditor, memory manager and more. Anything risky is raised as an approval instead of being executed quietly.",
    shot: {
      base: "/screens/agents",
      widths: [560, 900, 1600],
      alt: "The XR agents screen showing a grid of agent cards including Supervisor, Coordinator, Planner, Researcher, Reviewer, Builder and Auditor.",
      caption: "Multi-agent",
    },
    claim: "desktop/src/screens/Agents/ — src/daemon/routes/approvals.routes.ts",
    facts: ["15 agents in the app", "Durable approval store", "Decide from any surface"],
  },
  {
    id: "brain",
    title: "Brain & memory",
    lead: "A memory that belongs to the machine.",
    body: "The Brain is XR's context and memory layer: durable notes, retrieved context, and a memory manager agent that can keep things tidy. It is stored locally, beside the rest of your workspace.",
    shot: {
      base: "/screens/brain",
      widths: [560, 900, 1600],
      alt: "The XR Brain screen showing context and memory panels.",
      caption: "Brain · memory",
    },
    claim: "desktop/src/screens/Brain/ — desktop/src/screens/Memory/ — src/daemon/routes/memory.routes.ts",
    facts: ["Local storage", "Retrieved context", "Memory manager agent"],
  },
  {
    id: "mobile",
    title: "Mobile app",
    lead: "Your agent, on the phone that's already in your pocket.",
    body: "The XR mobile app is a PWA that talks to your own daemon over your network: start a task, read the answer, see what is waiting for your approval, and watch the spend cap — all from the phone. Shown here are real screens captured from the running app.",
    shot: {
      base: "/screens/mobile-chat-list",
      widths: [560, 900],
      alt: "The XR mobile app chat list on a phone, showing real sessions and a real answer preview.",
      caption: "Mobile app",
    },
    claim: "mobile/src/ — mobile/src/api/client.ts — src/daemon/routes/",
    facts: ["Real chat + tool trace", "Approvals", "Budget · themes · model"],
  },
  {
    id: "integrations",
    title: "Integrations",
    lead: "Everything already wired, nothing to install twice.",
    body: "XR ships integrations for the tools you already use, plus MCP support so you can bring any MCP server, and a plugin system for the rest.",
    shot: {
      base: "/screens/integrations",
      widths: [560, 900, 1600],
      alt: "The XR integrations screen showing a grid of connected integrations and MCP servers.",
      caption: "Integrations",
    },
    claim: "desktop/src/screens/Integrations/ — src/daemon/routes/mcp.routes.ts",
    facts: ["12+ integrations", "MCP servers", "Plugin API v2"],
  },
  {
    id: "providers",
    title: "Providers & BYOK",
    lead: "Your key, your model, your bill.",
    body: "XR is provider-neutral. Bring your own key for any hosted provider, or run a model entirely on your own hardware — Ollama, LM Studio, llama.cpp, Jan, LocalAI, vLLM, SGLang and more. The routing surface shows exactly which provider and model will serve a request.",
    shot: {
      base: "/screens/dashboard",
      widths: [560, 900, 1600],
      alt: "The XR dashboard showing the selected provider, the active model and the local runtime status.",
      caption: "Providers · BYOK",
    },
    claim: "src/daemon/routes/providers.routes.ts — src/engine/providers.ts — src/daemon/routes/contract*.ts",
    facts: ["26 provider presets", "10 local runtimes", "Hybrid routing"],
  },
  {
    id: "security",
    title: "Security & the trust plane",
    lead: "Policy in the process, decisions on the record.",
    body: "XR's trust plane is in-process policy — a gate that every tool call passes through, not a kernel or VM sandbox. It ships alongside the Shield surface and the approval store, so you can see exactly what was allowed and what was not.",
    shot: {
      base: "/screens/shield",
      widths: [560, 900, 1600],
      alt: "The XR Shield screen showing the trust checks, capacity and the active skills.",
      caption: "Trust plane",
    },
    claim: "src/daemon/routes/shield.routes.ts — desktop/src/screens/Shield/ — README.md § Security",
    facts: ["9 checks in the app", "35.0% capacity", "3 skills active"],
  },
  {
    id: "spend",
    title: "Spend caps",
    lead: "A ceiling the agent cannot argue with.",
    body: "Caps are set in the product, not in our marketing copy: a per-task ceiling, a daily cap and a monthly cap, with a governor that stops the run when the next step would cross the line. A deliberately small budget produces a real stop.",
    shot: {
      base: "/screens/budget",
      widths: [560, 900, 1600],
      alt: "The XR budget screen showing $1.35 left of a $5.00 cap, $0.03 spent today, $2.33 projected and 279.9K tokens, with a spend chart and a per-model breakdown.",
      caption: "Spend caps",
    },
    claim: "src/daemon/routes/budget.routes.ts — src/config/config.ts (budget.perTaskUsd)",
    facts: ["Per-task · daily · monthly", "Governor stops the run", "Per-model breakdown"],
  },
  {
    id: "audit",
    title: "Audit log",
    lead: "A hash chain you can verify offline.",
    body: "Every meaningful action lands in an append-only log. `xr audit verify` re-walks the SHA-256 hash chain and tells you whether it is intact — and `--crypto` adds Ed25519 signatures for tamper-resistance, not just tamper-evidence.",
    shot: {
      base: "/screens/runs",
      widths: [560, 900, 1600],
      alt: "The XR runs screen listing recorded runs and their audit entries.",
      caption: "Audit log",
    },
    claim: "src/cli/ — `xr audit verify` — README.md § Supply chain",
    facts: ["SHA-256 hash chain", "Ed25519 with --crypto", "Signed CSV export (Business)"],
  },
];

/**
 * "Only XR" — the shortlist of capabilities the repo does that comparable
 * local agent runners do not. Each entry is paired with its caveat; the
 * site shows the caveat next to the claim rather than hiding it.
 */
export const onlyXr: { title: string; body: string; caveat?: string }[] = [
  {
    title: "A hash-chained audit log you can verify offline",
    body: "Not a log file you scroll — a chain you re-walk with a command and get a verdict. `--crypto` upgrades it to Ed25519 signatures.",
  },
  {
    title: "Spend caps enforced by a governor, not by a policy document",
    body: "Per-task, daily and monthly ceilings, and the run stops when the next step would cross the line.",
  },
  {
    title: "Provider-neutral BYOK across 26 presets and 10 local runtimes",
    body: "Hosted keys and local runtimes behind one routing surface, with hybrid routing between them.",
  },
  {
    title: "A plugin API and MCP on the same runtime",
    body: "Extend the agent without forking it — plugins, MCP servers and a documented plugin API version.",
  },
  {
    title: "Durable approvals that any surface can decide",
    body: "An approval raised by a CLI run can be decided from the desktop app or the daemon.",
  },
  {
    title: "A Builder IDE that ships inside the product",
    body: "Author the agent, its files and its run configuration without leaving the app.",
  },
  {
    title: "A mobile app that talks to your own daemon",
    body: "Same runtime, your network, your hardware — start a task from the phone.",
  },
  {
    title: "A voice surface with an Orb that actually has states",
    body: "Nine real states, each an authored 48-frame loop — not a spinner that pulses.",
  },
  {
    title: "A Brain that lives beside the workspace",
    body: "Local context and memory, with a memory manager agent that keeps it usable.",
  },
  {
    title: "A known-limitations register as a first-class artifact",
    body: "The repo documents what XR is not as carefully as what it is.",
    caveat: "In-process policy — not kernel or VM isolation.",
  },
  {
    title: "Research that reports its own contradictions",
    body: "Evidence blocks are counted and verified, and disagreeing sources are flagged instead of smoothed over.",
  },
  {
    title: "A CLI that is the engine, not a wrapper",
    body: "The dashboard is optional; the engine runs headless and says so in its own UI.",
  },
  {
    title: "A dependency supply chain that is signed and verified",
    body: "Release provenance is checked in CI, not asserted in a README.",
  },
  {
    title: "Five first-class themes in the product",
    body: "XR Native, Graphite, Midnight, Paper and Arctic — the same tokens this site is built from.",
  },
];

/**
 * Pricing, in the repo's own language. Personal is free forever with
 * every local feature; Business is the paid tier; Enterprise is quoted.
 * No invented numbers, no invented quotas.
 */
export const pricing = {
  personal: {
    name: "Personal",
    price: "Free",
    unit: "forever",
    summary: "Every local feature. No seat limit, no time limit, no watermark, no nags, no telemetry.",
    includes: [
      "Every local feature, no seat or time limit",
      "No watermark, no nagging, no telemetry",
      "BYOK — your key, your model, your bill",
      "Spend caps, audit chain and approvals",
      "Desktop, CLI, Builder and the mobile app",
    ],
    footnote: "No local feature is paywalled, ever.",
  },
  business: {
    name: "Business OS",
    price: "$15",
    unit: "per user / month",
    annual: "$144 per user / year — $12 per month equivalent",
    summary:
      "Everything in Personal, plus the parts a team needs to share: seats and roles, shared workspaces, SSO, pooled managed models, team memory and an admin console.",
    includes: [
      "Team members and roles",
      "Shared team workspaces",
      "SSO admin — OIDC and SAML 2.0",
      "Pooled managed models, $20 per user / month included quota by default",
      "Team memory sync",
      "Audit log with signed CSV export",
      "Admin console and cloud relay",
    ],
    footnote: "30-day trial, up to 5 seats, no card required.",
  },
  enterprise: {
    name: "Enterprise",
    price: "Quoted",
    unit: "per contract, NET 30",
    summary:
      "Contracted deployments. No self-serve checkout, and no support SLA is implied by the absence of one.",
    includes: ["Per-contract pricing", "NET 30 terms", "No self-serve checkout"],
    footnote: "No support SLA is offered at this tier.",
  },
} as const;
