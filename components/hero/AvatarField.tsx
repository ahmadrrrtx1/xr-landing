"use client";

/**
 * AvatarField — the WebGL2 energy field that surrounds the avatar.
 *
 * The avatar itself is the owner's real 4× artwork (a PNG), not
 * geometry: the product's own Orb is an authored WebP, and so is the
 * character. The shader is the atmosphere around it.
 *
 * The field listens for two things:
 *  - `xr:energy` — a custom window event carrying the live audio level
 *    from the voice moment (0..1);
 *  - pointer movement — for the parallax lean.
 *
 * If WebGL2 is unavailable, or the visitor prefers reduced motion, the
 * field renders a single static frame and the avatar still carries the
 * hero on its own.
 *
 * The whole thing — the context, the shader compile, the first frames —
 * is deferred until after the hero has painted (see `lib/idle.ts`).
 * Compiling a shader on the first-paint tick pushes the largest
 * contentful paint out by hundreds of milliseconds on a throttled
 * connection, and nothing about the field needs to exist before the
 * visitor can see the page.
 */

import { useEffect, useRef } from "react";
import { afterFirstPaint } from "@/lib/idle";
import { FRAG, VERT } from "./shader";

export default function AvatarField({ className = "" }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const energyRef = useRef(0);
  const pointerRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let teardown: (() => void) | null = null;

    const boot = () => {
      const gl = canvas.getContext("webgl2", {
        alpha: true,
        antialias: false,
        premultipliedAlpha: false,
        powerPreference: "low-power",
      });
      if (!gl) return;

      const compile = (type: number, src: string) => {
        const sh = gl.createShader(type);
        if (!sh) return null;
        gl.shaderSource(sh, src);
        gl.compileShader(sh);
        if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
          gl.deleteShader(sh);
          return null;
        }
        return sh;
      };

      const vs = compile(gl.VERTEX_SHADER, VERT);
      const fs = compile(gl.FRAGMENT_SHADER, FRAG);
      if (!vs || !fs) return;

      const program = gl.createProgram();
      if (!program) return;
      gl.attachShader(program, vs);
      gl.attachShader(program, fs);
      gl.linkProgram(program);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;
      gl.useProgram(program);

      const vao = gl.createVertexArray();
      gl.bindVertexArray(vao);

      const uTime = gl.getUniformLocation(program, "uTime");
      const uEnergy = gl.getUniformLocation(program, "uEnergy");
      const uPointerX = gl.getUniformLocation(program, "uPointerX");
      const uPointerY = gl.getUniformLocation(program, "uPointerY");
      const uAspect = gl.getUniformLocation(program, "uAspect");
      const uDpr = gl.getUniformLocation(program, "uDpr");

      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      let raf = 0;
      let running = false;
      let visible = true;
      let pageVisible = true;
      let width = 0;
      let height = 0;
      const started = performance.now();

      const resize = () => {
        const rect = canvas.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) return;
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        width = rect.width;
        height = rect.height;
        canvas.width = Math.round(width * dpr);
        canvas.height = Math.round(height * dpr);
        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.uniform1f(uDpr, dpr);
        gl.uniform1f(uAspect, width / Math.max(height, 1));
      };

      const render = () => {
        const t = (performance.now() - started) / 1000;
        gl.uniform1f(uTime, t);
        gl.uniform1f(uEnergy, energyRef.current);
        gl.uniform1f(uPointerX, pointerRef.current.x);
        gl.uniform1f(uPointerY, pointerRef.current.y);
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
      };

      const loop = () => {
        render();
        raf = requestAnimationFrame(loop);
      };
      const startLoop = () => {
        if (running || !visible || !pageVisible) return;
        running = true;
        raf = requestAnimationFrame(loop);
      };
      const stopLoop = () => {
        if (!running) return;
        running = false;
        cancelAnimationFrame(raf);
      };

      const onEnergy = (event: Event) => {
        const detail = (event as CustomEvent<{ value?: number }>).detail;
        const value = typeof detail?.value === "number" ? detail.value : 0;
        energyRef.current = Math.min(1, Math.max(0, value));
      };
      const onPointer = (event: PointerEvent) => {
        const rect = canvas.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) return;
        pointerRef.current.x = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
        pointerRef.current.y = -(((event.clientY - rect.top) / rect.height - 0.5) * 2);
      };

      resize();
      render();

      if (!reduce) startLoop();

      const ro = new ResizeObserver(() => {
        resize();
        render();
      });
      ro.observe(canvas);

      const io = new IntersectionObserver(
        (entries) => {
          visible = entries[0]?.isIntersecting ?? true;
          if (visible) startLoop();
          else stopLoop();
        },
        { threshold: 0 },
      );
      io.observe(canvas);

      const onVisibility = () => {
        pageVisible = document.visibilityState === "visible";
        if (pageVisible) startLoop();
        else stopLoop();
      };
      document.addEventListener("visibilitychange", onVisibility);
      window.addEventListener("xr:energy", onEnergy);
      window.addEventListener("pointermove", onPointer, { passive: true });

      teardown = () => {
        stopLoop();
        ro.disconnect();
        io.disconnect();
        document.removeEventListener("visibilitychange", onVisibility);
        window.removeEventListener("xr:energy", onEnergy);
        window.removeEventListener("pointermove", onPointer);
        gl.deleteProgram(program);
        gl.deleteShader(vs);
        gl.deleteShader(fs);
        gl.deleteVertexArray(vao);
      };
    };

    const disarm = afterFirstPaint(boot);

    return () => {
      disarm();
      teardown?.();
    };
  }, []);

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />;
}
