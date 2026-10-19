"use client";

/**
 * NeuralField — a cursor-reactive particle field for the hero.
 *
 * Nodes drift in the void and link to each other when they are close.
 * When the pointer enters the field, the nodes nearest the cursor
 * brighten, link directly to it, and are pushed gently aside — the
 * field reacts to the visitor instead of looping on its own.
 *
 * Performance rules (all of them non-negotiable on a phone):
 *  - the canvas is sized to its box and the device pixel ratio is
 *    capped at 2;
 *  - the render loop stops entirely when the field scrolls out of
 *    view or the tab is hidden;
 *  - `prefers-reduced-motion` draws exactly one static frame.
 */

import { useEffect, useRef } from "react";
import { afterFirstPaint } from "@/lib/idle";

type Node = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  seed: number;
  /** 0..1 — how much this node breathes. */
  pulse: number;
  /** 0..1 — where this node sits in the cool→bright colour ramp. */
  tone: number;
};

const LINK_DIST = 138;
const LINK_DIST_ACTIVE = 196;
const CURSOR_DIST = 196;

export default function NeuralField({
  className = "",
  density = 1,
}: {
  className?: string;
  density?: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let width = 0;
    let height = 0;
    let dpr = 1;
    let nodes: Node[] = [];
    let raf = 0;
    let running = false;
    let visible = true;
    let pageVisible = true;
    let armed = false;
    let disarm: () => void = () => {};
    let time = 0;

    // A node is drawn thousands of times a second. Allocating a radial
    // gradient for each one is what turned this field into the
    // bottleneck, so the node is rendered once into a sprite and then
    // blitted.
    const sprite = document.createElement("canvas");
    const SPRITE = 64;
    sprite.width = SPRITE;
    sprite.height = SPRITE;
    const sctx = sprite.getContext("2d");
    if (sctx) {
      const sg = sctx.createRadialGradient(
        SPRITE / 2,
        SPRITE / 2,
        0,
        SPRITE / 2,
        SPRITE / 2,
        SPRITE / 2,
      );
      sg.addColorStop(0, "rgba(255,255,255,1)");
      sg.addColorStop(0.16, "rgba(226,252,255,0.95)");
      sg.addColorStop(0.4, "rgba(86,224,255,0.4)");
      sg.addColorStop(0.72, "rgba(0,205,255,0.12)");
      sg.addColorStop(1, "rgba(0,190,240,0)");
      sctx.fillStyle = sg;
      sctx.fillRect(0, 0, SPRITE, SPRITE);
    }

    // The bloom is a radial gradient over a large area. Evaluating it
    // per pixel, every frame, was the last thing the field could not
    // afford, so it is painted once into a small canvas and blitted.
    let bloomSprite: HTMLCanvasElement | null = null;
    const paintBloom = () => {
      const size = 256;
      const c = document.createElement("canvas");
      c.width = size;
      c.height = size;
      const bctx = c.getContext("2d");
      if (!bctx) return;
      const g = bctx.createRadialGradient(
        size / 2,
        size / 2,
        0,
        size / 2,
        size / 2,
        size / 2,
      );
      g.addColorStop(0, "rgba(0,150,205,0.15)");
      g.addColorStop(0.45, "rgba(0,90,150,0.06)");
      g.addColorStop(1, "rgba(0,0,0,0)");
      bctx.fillStyle = g;
      bctx.fillRect(0, 0, size, size);
      bloomSprite = c;
    };

    const pointer = { x: -9999, y: -9999, active: false };
    // The whole network leans a few pixels toward the pointer. It is
    // smoothed, so it drifts rather than snaps.
    const lean = { x: 0, y: 0, tx: 0, ty: 0 };

    const seed = () => {
      const count = Math.round(
        Math.min(104, Math.max(48, (width * height) / 15000)) * density,
      );
      nodes = Array.from({ length: count }, () => {
        // Two thirds of the network gathers in the right half, where
        // the character is; the rest drifts across the whole field.
        const clustered = Math.random() < 0.62;
        const x = clustered
          ? width * (0.5 + Math.random() * 0.52)
          : Math.random() * width;
        const y = clustered
          ? height * (0.06 + Math.random() * 0.88)
          : Math.random() * height;
        const tone = clustered
          ? 0.45 + Math.random() * 0.55
          : Math.random() * 0.5;
        return {
          x: Math.min(width, x),
          y,
          vx: (Math.random() - 0.5) * 0.2,
          vy: (Math.random() - 0.5) * 0.2,
          r: 0.7 + tone * 1.9,
          seed: Math.random(),
          pulse: 0.4 + Math.random() * 1.6,
          tone,
        };
      });
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      // The field is soft, low-contrast decoration. Rendering it above
      // 1.5x buys nothing a visitor can see and costs a lot of pixels
      // on a phone.
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      paintBloom();
      seed();
    };

    const draw = () => {
      // Ease the lean toward its target.
      lean.x += (lean.tx - lean.x) * 0.045;
      lean.y += (lean.ty - lean.y) * 0.045;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);
      ctx.translate(lean.x, lean.y);
      time += 0.016;

      // ── the bloom ────────────────────────────────────────────
      // A wide, soft wash under the whole network, so the field has
      // depth instead of reading as dots on black.
      if (bloomSprite) {
        const bloomR = Math.max(width, height) * 0.5;
        const bloomX = width * 0.66;
        const bloomY = height * 0.5;
        ctx.drawImage(
          bloomSprite,
          bloomX - bloomR,
          bloomY - bloomR,
          bloomR * 2,
          bloomR * 2,
        );
      }

      // ── links between neighbours ─────────────────────────────
      // Each link is a gradient, bright at the brighter end and
      // fading to nothing at the other, so the network reads as
      // something with direction rather than a mesh of hairlines.
      // Every link is drawn, but a link is not a draw call. The links
      // are sorted into three depth tiers and each tier is stroked
      // once, as one path. Stroking six hundred links individually
      // cost more than the rest of the page put together.
      ctx.lineCap = "round";
      ctx.strokeStyle = "rgb(0,196,240)";
      const tiers = [new Path2D(), new Path2D(), new Path2D()];
      const bright = new Path2D();
      let drawn = 0;

      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];
        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d2 = dx * dx + dy * dy;
          if (d2 > LINK_DIST_ACTIVE * LINK_DIST_ACTIVE) continue;
          const d = Math.sqrt(d2);
          const max = pointer.active ? LINK_DIST_ACTIVE : LINK_DIST;
          if (d > max) continue;

          const fall = 1 - d / max;
          if (fall * fall < 0.03) continue;
          if (drawn++ > 720) break;

          const tier = fall > 0.62 ? 2 : fall > 0.3 ? 1 : 0;
          const path = tiers[tier];
          path.moveTo(a.x, a.y);
          path.lineTo(b.x, b.y);

          // The brighter end of the link, drawn a second time in the
          // bright path — the read of a gradient without allocating
          // one per link per frame.
          const from = a.tone >= b.tone ? a : b;
          const to = a.tone >= b.tone ? b : a;
          bright.moveTo(from.x, from.y);
          bright.lineTo(
            from.x + (to.x - from.x) * 0.4,
            from.y + (to.y - from.y) * 0.4,
          );
        }
        if (drawn > 720) break;
      }

      const tierAlpha = [0.1, 0.2, 0.32];
      const tierWidth = [0.55, 0.8, 1.1];
      for (let t = 0; t < 3; t++) {
        ctx.globalAlpha = tierAlpha[t];
        ctx.lineWidth = tierWidth[t];
        ctx.stroke(tiers[t]);
      }
      ctx.globalAlpha = 0.34;
      ctx.lineWidth = 1;
      ctx.stroke(bright);
      ctx.globalAlpha = 1;

      // ── links to the cursor ──────────────────────────────────
      if (pointer.active) {
        const web = new Path2D();
        for (const n of nodes) {
          const dx = n.x - pointer.x;
          const dy = n.y - pointer.y;
          const d = Math.hypot(dx, dy);
          if (d > CURSOR_DIST) continue;
          web.moveTo(n.x, n.y);
          web.lineTo(pointer.x, pointer.y);
        }
        ctx.globalAlpha = 0.5;
        ctx.strokeStyle = "rgb(150,244,255)";
        ctx.lineWidth = 0.9;
        ctx.stroke(web);
        ctx.globalAlpha = 1;
      }

      // ── nodes ────────────────────────────────────────────────
      for (const n of nodes) {
        const dx = n.x - pointer.x;
        const dy = n.y - pointer.y;
        const d = Math.hypot(dx, dy);
        let boost = 0;
        let pushX = 0;
        let pushY = 0;
        if (pointer.active && d < CURSOR_DIST && d > 0.01) {
          boost = 1 - d / CURSOR_DIST;
          const force = boost * 2.6;
          pushX = (dx / d) * force;
          pushY = (dy / d) * force;
        }

        // Every node breathes on its own clock.
        const breath = 0.72 + Math.sin(time * n.pulse + n.seed * 6.28) * 0.28;
        const radius = n.r * breath * (1 + boost * 0.7);
        const alpha = (0.34 + n.tone * 0.4 + boost * 0.5) * (0.75 + breath * 0.25);

        // The halo and the core, in one blit of the sprite.
        const size = (10 + radius * 3.2 + boost * 7) * 2;
        ctx.globalAlpha = Math.min(1, alpha * 0.92);
        ctx.drawImage(sprite, n.x - size / 2, n.y - size / 2, size, size);
        ctx.globalAlpha = 1;

        // A hard bright point at the very centre.
        ctx.fillStyle = `rgba(240,253,255,${Math.min(1, alpha + 0.45).toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(n.x, n.y, Math.max(radius * 0.5, 0.5), 0, Math.PI * 2);
        ctx.fill();

        n.x += n.vx + pushX;
        n.y += n.vy + pushY;

        if (n.x < -20) n.x = width + 20;
        if (n.x > width + 20) n.x = -20;
        if (n.y < -20) n.y = height + 20;
        if (n.y > height + 20) n.y = -20;
      }
    };

    const loop = () => {
      draw();
      raf = requestAnimationFrame(loop);
    };

    const start = () => {
      if (running || !visible || !pageVisible) return;
      running = true;
      raf = requestAnimationFrame(loop);
    };
    const stop = () => {
      if (!running) return;
      running = false;
      cancelAnimationFrame(raf);
    };

    const onPointerMove = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointer.x = event.clientX - rect.left;
      pointer.y = event.clientY - rect.top;
      pointer.active = true;
      // The whole network leans a few pixels toward the pointer.
      lean.tx = (pointer.x / Math.max(rect.width, 1) - 0.5) * 26;
      lean.ty = (pointer.y / Math.max(rect.height, 1) - 0.5) * 18;
    };
    const onPointerLeave = () => {
      pointer.active = false;
      pointer.x = -9999;
      pointer.y = -9999;
      lean.tx = 0;
      lean.ty = 0;
    };

    resize();

    if (reduce) {
      draw();
    } else {
      // Armed only after the hero has painted — see lib/idle.ts.
      armed = true;
      disarm = afterFirstPaint(() => {
        if (visible && pageVisible) start();
      });
    }

    const ro = new ResizeObserver(() => {
      resize();
      if (reduce) draw();
    });
    ro.observe(canvas);

    const io = new IntersectionObserver(
      (entries) => {
        visible = entries[0]?.isIntersecting ?? true;
        if (visible && armed) start();
        else stop();
      },
      { threshold: 0 },
    );
    io.observe(canvas);

    const onVisibility = () => {
      pageVisible = document.visibilityState === "visible";
      if (pageVisible && armed) start();
      else stop();
    };
    document.addEventListener("visibilitychange", onVisibility);

    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerleave", onPointerLeave);

    return () => {
      stop();
      disarm();
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerleave", onPointerLeave);
    };
  }, [density]);

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />;
}
