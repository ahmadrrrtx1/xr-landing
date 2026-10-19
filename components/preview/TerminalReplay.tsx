/**
 * TerminalReplay — the honest interactive preview.
 *
 * It plays a REAL recorded XR session: the lines are verbatim stdout
 * from `xr` running against the XR repository with a live provider.
 * The raw capture ships at `public/cli/xr-session.raw` so the claim
 * can be checked.
 *
 * It is labelled a recording. It is not a live demo and does not
 * pretend to be one.
 *
 * The transcript is static server-rendered markup — it is the largest
 * block of text on the page and there is no reason for the browser to
 * re-render it. `ReplayControls` is the only client code here, and it
 * drives the transcript by hiding the lines it has not reached.
 */

import { replayLines, type ReplayLine } from "@/lib/replay";
import ReplayControls from "./ReplayControls";

const LINE_TONE: Record<ReplayLine["kind"], string> = {
  command: "text-accent",
  note: "text-tertiary",
  thinking: "text-secondary",
  tool: "text-metal",
  answer: "text-primary",
  ok: "text-success",
  dim: "text-tertiary",
  gap: "",
};

export default function TerminalReplay() {
  return (
    <div className="card overflow-hidden">
      {/* Window chrome */}
      <div className="flex items-center gap-2 border-b border-[var(--color-line-subtle)] bg-raised/60 px-4 py-2.5">
        <span aria-hidden="true" className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#2a3547]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#2a3547]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#2a3547]" />
        </span>
        <span className="ml-2 font-mono text-xs text-tertiary">xr — recorded session</span>
        <span className="ml-auto inline-flex items-center gap-2 rounded-full border border-[var(--color-line)] px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-tertiary">
          <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-danger" />
          recording
        </span>
      </div>

      {/* The transcript — static, server-rendered, in full. */}
      <div
        id="xr-terminal-lines"
        className="max-h-[26rem] overflow-y-auto bg-[#05090f] px-4 py-4 font-mono text-[12.5px] leading-[1.75] sm:text-[13px]"
      >
        {replayLines.map((line, index) => {
          if (line.kind === "gap") {
            return <div key={`gap-${index}`} className="h-3" />;
          }
          return (
            <div
              key={`${line.kind}-${index}`}
              data-line={index}
              className={`${LINE_TONE[line.kind]} ${
                line.kind === "command" ? "font-medium" : ""
              } whitespace-pre-wrap break-words`}
            >
              {line.kind === "command" ? (
                <>
                  <span className="text-accent">$ </span>
                  {line.text}
                </>
              ) : line.kind === "answer" ? (
                <span className="text-primary">{line.text}</span>
              ) : (
                line.text
              )}
            </div>
          );
        })}
      </div>

      <ReplayControls />
    </div>
  );
}
