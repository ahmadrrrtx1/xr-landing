/**
 * Run `fn` once the browser has painted, and the main thread is idle.
 *
 * The hero has two live layers — a WebGL energy field and a canvas of
 * particles. Both are worth doing and neither is worth doing before
 * the hero has been painted: compiling a shader and seeding a few
 * hundred nodes on the same tick as first paint pushes the largest
 * contentful paint out by hundreds of milliseconds on a throttled
 * connection.
 *
 * So: two frames (one paint has happened), then the first idle slot.
 * Everything still happens; it just happens after the page is on
 * screen.
 */

type IdleWindow = Window & {
  requestIdleCallback?: (cb: () => void, options?: { timeout: number }) => number;
  cancelIdleCallback?: (id: number) => void;
};

export function afterFirstPaint(fn: () => void, timeout = 2000): () => void {
  if (typeof window === "undefined") return () => {};

  let cancelled = false;
  let idleId: number | undefined;
  let timerId: number | undefined;
  let frameId = 0;

  const w = window as IdleWindow;

  const begin = () => {
    if (cancelled) return;
    if (w.requestIdleCallback) {
      idleId = w.requestIdleCallback(() => {
        if (!cancelled) fn();
      }, { timeout });
    } else {
      timerId = window.setTimeout(() => {
        if (!cancelled) fn();
      }, 260);
    }
  };

  const raf = window.requestAnimationFrame(() => {
    frameId = window.requestAnimationFrame(begin);
  });

  return () => {
    cancelled = true;
    window.cancelAnimationFrame(frameId);
    if (idleId !== undefined) w.cancelIdleCallback?.(idleId);
    if (timerId !== undefined) window.clearTimeout(timerId);
  };
}
