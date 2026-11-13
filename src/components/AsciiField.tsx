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

// Click ripple: a thin ring of the same pattern travels out from the click and fades.
const RIPPLE_MS = 750; // how long one ripple lives
const RIPPLE_MAX = 240; // px the ring travels
const RIPPLE_BAND = 26; // px thickness of the glowing ring

/**
 * A window onto a hidden ASCII background. The pattern is fixed to the page and
 * animates in place; the cursor only reveals the part of it under a soft circle.
 * Moving the pointer moves the window, not the pattern. The window's position is
 * the raw pointer position (no lag); only opening and closing ease.
 */
export function AsciiField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
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
    // Live click ripples: each reveals a travelling ring of the pattern, then dies.
    const ripples: { x: number; y: number; start: number }[] = [];

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

    // The glyph index for a page cell at a moment, or 0 for blank. Shared by window + ripple.
    function glyphAt(c: number, r: number, time: number) {
      const v = Math.min(1, Math.max(0, (field(c, r, time) - 0.22) / 0.62));
      let index = Math.round(v * (RAMP.length - 1));
      if (!still) {
        const flick = hash(c, r, step(time));
        if (flick === 0) index -= 1;
        else if (flick === 5) index += 1;
      }
      return Math.min(RAMP.length - 1, Math.max(0, index));
    }

    const step = (time: number) => Math.floor(time / 140);

    function draw(now: number) {
      if (!ctx) return;
      ctx.clearRect(0, 0, width, height);
      drawWindow(now);
      drawRipples(now);
    }

    function drawWindow(now: number) {
      if (!ctx) return;
      const eased = vis * vis * (3 - 2 * vis); // smoothstep
      if (eased <= 0.002) return;

      const radius = RADIUS * (0.8 + 0.2 * eased); // opens slightly as it eases in
      const time = still ? 0 : now;

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

          const index = glyphAt(c, r, time);
          if (index <= 0) continue;

          ctx.globalAlpha = 0.4 * aperture * eased;
          ctx.fillText(RAMP[index], cx, cy);
        }
      }
      ctx.globalAlpha = 1;
    }

    // Each ripple reveals a thin ring of the same pattern, expanding and fading out.
    function drawRipples(now: number) {
      if (!ctx || ripples.length === 0) return;
      const time = still ? 0 : now;

      for (let i = ripples.length - 1; i >= 0; i--) {
        const rp = ripples[i];
        const age = (now - rp.start) / RIPPLE_MS;
        if (age >= 1) {
          ripples.splice(i, 1);
          continue;
        }
        const ease = 1 - (1 - age) * (1 - age); // ease-out: fast then settling
        const ringR = ease * RIPPLE_MAX;
        const fade = 1 - age; // whole ring dims as it travels
        const reach = ringR + RIPPLE_BAND;

        const c0 = Math.floor((rp.x - reach) / CELL_W);
        const c1 = Math.ceil((rp.x + reach) / CELL_W);
        const r0 = Math.floor((rp.y - reach) / CELL_H);
        const r1 = Math.ceil((rp.y + reach) / CELL_H);

        for (let r = r0; r <= r1; r++) {
          for (let c = c0; c <= c1; c++) {
            const cx = c * CELL_W + CELL_W / 2;
            const cy = r * CELL_H + CELL_H / 2;
            const dist = Math.hypot(cx - rp.x, cy - rp.y);
            // Only the thin band around the current radius lights up.
            const band = 1 - Math.abs(dist - ringR) / RIPPLE_BAND;
            if (band <= 0) continue;

            const index = glyphAt(c, r, time);
            if (index <= 0) continue;

            ctx.globalAlpha = 0.4 * band * fade;
            ctx.fillText(RAMP[index], cx, cy);
          }
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
      // Keep going while the window is open or any ripple is still alive.
      if (vis > 0 || target > 0 || ripples.length > 0) frame = requestAnimationFrame(tick);
      else running = false;
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

    function onClick(e: MouseEvent) {
      if (still) return; // no ripple under reduced motion
      ripples.push({ x: e.clientX, y: e.clientY, start: performance.now() });
      if (ripples.length > 6) ripples.shift(); // cap concurrent ripples
      start();
    }

    // relatedTarget is null when the pointer leaves the browser window.
    function onOut(e: MouseEvent) {
      if (!e.relatedTarget) inside = false;
    }

    resize();
    window.addEventListener("resize", resize);
    // The ripple works for any pointer, including touch.
    window.addEventListener("pointerdown", onClick, { passive: true });
    // The cursor window is hover + fine-pointer only.
    const hoverCapable = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (hoverCapable) {
      window.addEventListener("pointermove", onMove, { passive: true });
      document.addEventListener("mouseout", onOut);
      window.addEventListener("blur", onBlur);
    }

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointerdown", onClick);
      window.removeEventListener("pointermove", onMove);
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
