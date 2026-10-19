"use client";

/**
 * The replay control for the recorded session.
 *
 * The transcript itself is server-rendered static markup (see
 * `TerminalReplay.tsx`) — it is the largest block of text on the page
 * and there is no reason for the browser to re-render it. This island
 * only drives it: it hides the lines it has not reached yet and shows
 * them again as the session plays.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { REPLAY_DURATION, replayLines } from "@/lib/replay";

const LINES_ID = "xr-terminal-lines";

export default function ReplayControls() {
  const [shown, setShown] = useState(replayLines.length);
  const [playing, setPlaying] = useState(false);
  const [finished, setFinished] = useState(true);
  const timerRef = useRef<number | null>(null);
  const reduce = useRef(false);

  useEffect(() => {
    reduce.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  /** Show exactly the first `count` lines of the transcript. */
  const paint = useCallback((count: number) => {
    setShown(count);
    const host = document.getElementById(LINES_ID);
    if (!host) return;
    const rows = host.querySelectorAll<HTMLElement>("[data-line]");
    rows.forEach((row) => {
      const index = Number(row.dataset.line ?? "0");
      row.style.display = index < count ? "" : "none";
    });
  }, []);

  const stop = useCallback(() => {
    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = null;
    setPlaying(false);
  }, []);

  const play = useCallback(() => {
    if (reduce.current) return;
    stop();
    setFinished(false);
    paint(0);
    setPlaying(true);
    let i = 0;
    let clock = 0;
    const step = () => {
      if (i >= replayLines.length) {
        setPlaying(false);
        setFinished(true);
        return;
      }
      const line = replayLines[i];
      const delay = Math.max(120, (i === 0 ? 0 : line.at - clock));
      clock = line.at;
      timerRef.current = window.setTimeout(() => {
        paint(i + 1);
        i += 1;
        step();
      }, delay);
    };
    step();
  }, [paint, stop]);

  useEffect(() => stop, [stop]);

  const progress = finished
    ? 100
    : Math.min(100, (shown / replayLines.length) * 100);

  return (
    <div className="flex flex-col gap-3 border-t border-[var(--color-line-subtle)] bg-raised/30 px-4 py-3 sm:flex-row sm:items-center">
      <button
        type="button"
        onClick={play}
        disabled={reduce.current}
        className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-[var(--color-line)] bg-ink/80 px-4 text-sm font-medium text-primary transition hover:border-[var(--color-line-accent)] disabled:opacity-60"
      >
        <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          {finished ? (
            <path d="M12 5V1L7 6l5 5V7a6 6 0 1 1-6 6H4a8 8 0 1 0 8-8Z" />
          ) : (
            <path d="M8 5v14l11-7z" />
          )}
        </svg>
        {finished ? "Replay the session" : "Play the session"}
      </button>

      <div
        className="h-1 flex-1 overflow-hidden rounded-full bg-[var(--color-line-subtle)]"
        role="presentation"
      >
        <div
          className="h-full rounded-full bg-[var(--color-accent)] transition-[width] duration-150"
          style={{ width: `${progress}%` }}
        />
      </div>

      <p className="font-mono text-[11px] text-tertiary">
        {reduce.current
          ? "reduced motion — full transcript shown"
          : finished
            ? "done"
            : "playing"}
      </p>

      <span className="sr-only" aria-live="polite">
        {playing
          ? "Replaying the recorded XR session"
          : finished
            ? "The recorded XR session is shown in full above"
            : ""}
      </span>

      <span className="sr-only">{Math.round(REPLAY_DURATION / 1000)} second recording</span>
    </div>
  );
}
