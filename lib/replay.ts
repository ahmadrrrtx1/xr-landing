/**
 * The recorded XR session.
 *
 * This is a REAL capture: the lines below are verbatim stdout from
 * `xr` running against the XR repository with a live provider
 * (Groq, `openai/gpt-oss-20b`). The raw ANSI capture is kept at
 * `public/cli/xr-session.raw` and the cleaned text at
 * `public/cli/xr-session.txt`, so the recording can be checked against
 * the source.
 *
 * It is a recording, and the UI labels it as one.
 */

export type ReplayLine =
  | { kind: "command"; text: string; at: number }
  | { kind: "note"; text: string; at: number }
  | { kind: "thinking"; text: string; at: number }
  | { kind: "tool"; text: string; at: number }
  | { kind: "answer"; text: string; at: number }
  | { kind: "ok"; text: string; at: number }
  | { kind: "dim"; text: string; at: number }
  | { kind: "gap"; at: number };

/** Milliseconds from the start of the replay to each line. */
export const replayLines: ReplayLine[] = [
  { kind: "command", at: 0, text: 'xr "Read the package.json in this repo and tell me what XR is, in two sentences."' },
  {
    kind: "note",
    at: 600,
    text: "› Dry run: workspace writes and shell execution are simulated; model, read and network requests may still run.",
  },
  { kind: "thinking", at: 1500, text: "⠙ Thinking…" },
  { kind: "tool", at: 3200, text: "read package.json" },
  {
    kind: "answer",
    at: 4200,
    text: "XR is a local‑first, provider‑neutral AI agent runtime that lets you run intelligent agents on your own hardware. It supports Bring‑Your‑Own‑Key (BYOK), spend‑capped usage, tamper‑evident audit logs, and extensibility via plugins and a modular component platform.",
  },
  {
    kind: "ok",
    at: 6200,
    text: "✓ dry-run (simulated) · 0 files changed · 0 commands run · 4.3k tok (no price data) / $2 cap",
  },
  { kind: "gap", at: 7000 },

  { kind: "command", at: 7200, text: "xr audit verify" },
  { kind: "dim", at: 7800, text: "  ▀▄▀ █▀█  XR — The AI Agent You Can Actually Trust" },
  { kind: "dim", at: 8100, text: "  █░█ █▀▄  by @rrrtx · local-first · BYOK · spend-capped · secure" },
  { kind: "ok", at: 9000, text: "  ✓ Audit chain intact" },
  { kind: "dim", at: 9400, text: "  260 entries verified · SHA-256 hash chain" },
  {
    kind: "dim",
    at: 10000,
    text: "  › Add --crypto to verify Ed25519 signatures (tamper-RESISTANT), not just the hash chain.",
  },
  { kind: "gap", at: 10600 },

  { kind: "command", at: 10800, text: "xr budget" },
  { kind: "dim", at: 11400, text: "  Monthly cap ...... $20.00" },
  { kind: "dim", at: 11800, text: "  Monthly spend .... $0.0000" },
  { kind: "dim", at: 12200, text: "  Remaining ........ $20.0000" },
  { kind: "dim", at: 12600, text: "  Daily cap ........ $5.00" },
  { kind: "dim", at: 13000, text: "  Daily spend ...... $0.0000" },
  { kind: "dim", at: 13500, text: "  Auto-fallback .... enabled" },
  { kind: "dim", at: 13900, text: "  Warnings ......... enabled" },
  { kind: "gap", at: 14400 },

  { kind: "command", at: 14600, text: "xr providers list" },
  { kind: "dim", at: 15200, text: "Providers" },
  { kind: "dim", at: 15600, text: "  Active: groq (openai/gpt-oss-20b)" },
  { kind: "dim", at: 16000, text: "  Routing: hybrid" },
  { kind: "dim", at: 16600, text: "    ollama       🏠 🆓  no key" },
  { kind: "dim", at: 17000, text: "     Ollama (Local)  [chat, tool-use, json-mode, streaming]" },
  { kind: "dim", at: 17400, text: "    lmstudio     🏠 🆓  no key" },
  { kind: "dim", at: 17800, text: "     LM Studio (Local)  [chat, tool-use, json-mode, streaming]" },
  { kind: "dim", at: 18200, text: "    llamacpp     🏠 🆓  no key" },
  { kind: "dim", at: 18600, text: "     llama.cpp server (Local)  [chat, embeddings, json-mode, streaming]" },
];

export const REPLAY_DURATION = 19200;

export const replayMeta = {
  /** Where the raw capture lives, so the claim is checkable. */
  raw: "/cli/xr-session.raw",
  text: "/cli/xr-session.txt",
  provider: "groq",
  model: "openai/gpt-oss-20b",
  capturedOn: "2026-10-18",
} as const;
