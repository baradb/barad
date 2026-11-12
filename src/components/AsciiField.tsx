"use client";

import { useEffect, useRef } from "react";

// Sparse to dense.
const RAMP = " .:-=+*#%@";
const CELL_W = 9;
const CELL_H = 15;
const RADIUS = 90; // the window's radius
const EDGE = 0.4; // fraction of the radius over which the window's edge softens
const IDLE_MS = 1200; // still pointer: start closing the window after this long
const TAU_IN = 70; // ms: how fast the window eases open
const TAU_OUT = 240; // ms: how fast it eases shut

/**
 * A window onto a hidden ASCII background. The pattern is fixed to the page and
 * animates in place; the cursor only reveals the part of it under a soft circle.
 * Moving the pointer moves the window, not the pattern. The window's position is
 * the raw pointer position (no lag); only opening and closing ease.
 */
export function AsciiField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // Fine pointer + hover only: on touch there is no cursor to follow.
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const color = getComputedStyle(document.documentElement)
      .getPropertyValue("--accent")
      .trim();

    let width = 0;
    let height = 0;
    let x = 0;
    let y = 0;
    let lastMove = 0;
    let inside = false;
    let vis = 0; // 0..1, eased toward the target
    let prev = 0;
    let frame = 0;
    let running = false;

    function resize() {
      if (!canvas || !ctx) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.font = `${CELL_H - 3}px ui-monospace, Menlo, monospace`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = color;
    }

    // The hidden background: slow interfering waves, 0..1, indexed by page cell.
    function field(c: number, r: number, t: number) {
      const v =
        Math.sin(c * 0.33 + t * 0.0011) +
        Math.sin(r * 0.4 - t * 0.0014) +
        Math.sin((c + r) * 0.2 + t * 0.0009) +
        Math.sin(Math.hypot(c - 40, r - 18) * 0.28 - t * 0.0017);
      return v / 8 + 0.5;
    }

    // Cheap deterministic hash so each cell flickers on its own schedule.
    function hash(c: number, r: number, step: number) {
      const h =
        Math.imul(c, 73856093) ^ Math.imul(r, 19349663) ^ Math.imul(step, 83492791);
      return (h >>> 0) % 6;
    }

    function draw(now: number) {
      if (!ctx) return;
      ctx.clearRect(0, 0, width, height);
      const eased = vis * vis * (3 - 2 * vis); // smoothstep
      if (eased <= 0.002) return;

      const radius = RADIUS * (0.8 + 0.2 * eased); // opens slightly as it eases in
      const time = still ? 0 : now;
      const step = Math.floor(time / 140);

      const c0 = Math.floor((x - radius) / CELL_W);
      const c1 = Math.ceil((x + radius) / CELL_W);
      const r0 = Math.floor((y - radius) / CELL_H);
      const r1 = Math.ceil((y + radius) / CELL_H);

      for (let r = r0; r <= r1; r++) {
        for (let c = c0; c <= c1; c++) {
          const cx = c * CELL_W + CELL_W / 2;
          const cy = r * CELL_H + CELL_H / 2;
          const d = Math.hypot(cx - x, cy - y) / radius;
          if (d >= 1) continue;

          // Window: fully clear in the middle, softly closing over the edge band.
          const k = Math.min(1, (1 - d) / EDGE);
          const aperture = k * k * (3 - 2 * k);

          const v = Math.min(1, Math.max(0, (field(c, r, time) - 0.22) / 0.62));
          let index = Math.round(v * (RAMP.length - 1));
          if (!still) {
            const flick = hash(c, r, step);
            if (flick === 0) index -= 1;
            else if (flick === 5) index += 1;
          }
          index = Math.min(RAMP.length - 1, index);
          if (index <= 0) continue;

          ctx.globalAlpha = 0.4 * aperture * eased;
          ctx.fillText(RAMP[index], cx, cy);
        }
      }
      ctx.globalAlpha = 1;
    }

    function tick(now: number) {
      const dt = Math.min(now - prev, 64);
      prev = now;
      const target = inside && now - lastMove < IDLE_MS ? 1 : 0;
      const tau = target > vis ? TAU_IN : TAU_OUT;
      vis += (target - vis) * (1 - Math.exp(-dt / tau));
      if (target === 0 && vis < 0.004) vis = 0;

      draw(now);
      if (vis > 0 || target > 0) frame = requestAnimationFrame(tick);
      else running = false; // fully closed: stop the loop until the next move
    }

    function start() {
      if (running) return;
      running = true;
      prev = performance.now();
      frame = requestAnimationFrame(tick);
    }

    function onMove(e: PointerEvent) {
      x = e.clientX;
      y = e.clientY;
      lastMove = performance.now();
      inside = true;
      start();
    }

    function onBlur() {
      inside = false;
    }

    // relatedTarget is null when the pointer leaves the browser window.
    function onOut(e: MouseEvent) {
      if (!e.relatedTarget) inside = false;
    }

    resize();
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("resize", resize);
    document.addEventListener("mouseout", onOut);
    window.addEventListener("blur", onBlur);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("resize", resize);
      document.removeEventListener("mouseout", onOut);
      window.removeEventListener("blur", onBlur);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 h-full w-full"
    />
  );
}
