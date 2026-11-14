"use client";

import { useEffect, useRef } from "react";

// Head twinkles through the densest glyphs; the tail is drawn from this set,
// flickering per-cell so the streak looks like many ascii bits, not one sliding shape.
const HEAD = "@#%";
const TAILSET = "#%*+=-:.";
const GLOW = "99, 102, 241"; // bluish-purple (indigo), used at low opacity behind the head
const GLOW_RADIUS = 46; // px; soft halo around the moving tip
const TRAIL_LEN = 150; // px; length of the brief purple streak dragged behind the tip
const CELL = 13; // px between glyphs in a trail
const MIN_GAP = 4500; // ms between stars (randomised up to +MAX_EXTRA)
const MAX_EXTRA = 7000;
const SPEED = 0.55; // px per ms

type Star = { x: number; y: number; vx: number; vy: number; born: number; life: number };

/** Occasional ASCII shooting stars streaking diagonally across the page, then fading. */
export function ShootingStars() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const color = getComputedStyle(document.documentElement)
      .getPropertyValue("--accent")
      .trim();

    let width = 0;
    let height = 0;
    const stars: Star[] = [];
    let nextAt = performance.now() + 1500; // first one soon after load
    let frame = 0;

    function resize() {
      if (!canvas || !ctx) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.font = `${CELL}px ui-monospace, Menlo, monospace`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = color;
    }

    function spawn() {
      const dir = Math.random() < 0.5 ? 1 : -1;
      const angle = (Math.random() * 0.25 + 0.2) * Math.PI; // 36deg..81deg below horizontal
      const startX =
        dir === 1 ? Math.random() * width * 0.6 : width * 0.4 + Math.random() * width * 0.6;
      const travel = Math.hypot(width, height);
      stars.push({
        x: startX,
        y: -40,
        vx: dir * Math.cos(angle) * SPEED,
        vy: Math.sin(angle) * SPEED,
        born: performance.now(),
        life: travel / SPEED + 400,
      });
    }

    function draw(now: number) {
      if (!ctx) return;
      ctx.clearRect(0, 0, width, height);

      for (let i = stars.length - 1; i >= 0; i--) {
        const s = stars[i];
        const age = now - s.born;
        const hx = s.x + s.vx * age; // current head position along the path
        const hy = s.y + s.vy * age;

        // Off-screen or lived too long: retire it quietly.
        if (age > s.life || hy > height + 40 || hx < -60 || hx > width + 60) {
          stars.splice(i, 1);
          continue;
        }

        const speed = Math.hypot(s.vx, s.vy);
        const ux = s.vx / speed; // forward unit vector
        const uy = s.vy / speed;
        const px0 = -uy; // perpendicular, for tiny per-cell offset
        const py0 = ux;
        // How far along its path the head has travelled (in px from the start point).
        const headDist = speed * age;

        // Soft bluish-purple glow that wraps the moving tip like fire on a meteor,
        // plus a brief streak dragged behind it. Fades in with the star, then out
        // over its last stretch so nothing pops off.
        if (hx > -GLOW_RADIUS - TRAIL_LEN && hx < width + GLOW_RADIUS + TRAIL_LEN && hy > -GLOW_RADIUS - TRAIL_LEN && hy < height + GLOW_RADIUS + TRAIL_LEN) {
          const fadeIn = Math.min(1, age / 250);
          const fadeOut = Math.min(1, (s.life - age) / 600);
          const env = fadeIn * Math.max(0, fadeOut);
          if (env > 0.01) {
            const ang = Math.atan2(uy, ux);
            ctx.save();
            ctx.translate(hx, hy);
            ctx.rotate(ang); // +x now points along the direction of travel

            // Brief purple trail: a tapering streak that drags backward (−x) from the
            // tip and fades to nothing. Only a short length, so it reads as temporary.
            const trailA = 0.16 * env;
            const tg = ctx.createLinearGradient(0, 0, -TRAIL_LEN, 0);
            tg.addColorStop(0, `rgba(${GLOW}, ${trailA})`);
            tg.addColorStop(0.45, `rgba(${GLOW}, ${trailA * 0.45})`);
            tg.addColorStop(1, `rgba(${GLOW}, 0)`);
            ctx.fillStyle = tg;
            ctx.beginPath();
            ctx.moveTo(4, -7); // slight width at the tip
            ctx.quadraticCurveTo(-TRAIL_LEN * 0.5, -2.5, -TRAIL_LEN, 0); // taper to a point
            ctx.quadraticCurveTo(-TRAIL_LEN * 0.5, 2.5, 4, 7);
            ctx.closePath();
            ctx.fill();

            // Fire cap: a radial glow scaled so it bulges ahead of and across the tip
            // and curves back along the path, instead of a plain circle. Drawn in the
            // rotated frame, then squashed along travel to hug the leading edge.
            const glowA = 0.24 * env;
            ctx.scale(1.35, 0.85); // wider across the path than along it
            ctx.translate(GLOW_RADIUS * 0.12, 0); // nudge the glow to sit just ahead of the tip
            const g = ctx.createRadialGradient(0, 0, 0, 0, 0, GLOW_RADIUS);
            g.addColorStop(0, `rgba(${GLOW}, ${glowA})`);
            g.addColorStop(0.5, `rgba(${GLOW}, ${glowA * 0.4})`);
            g.addColorStop(1, `rgba(${GLOW}, 0)`);
            ctx.fillStyle = g;
            ctx.beginPath();
            ctx.arc(0, 0, GLOW_RADIUS, 0, Math.PI * 2);
            ctx.fill();

            ctx.restore();
            ctx.fillStyle = color; // restore for the glyph fills
          }
        }

        // LED trail: fixed cells sit at every CELL px along the path. A cell lights up
        // the moment the head passes it, then fades on its own over LED_MS — so points
        // blink on and off in place instead of one shape gliding across the screen.
        const LED_MS = 420; // how long a lit cell takes to fade out
        const litCells = Math.ceil((speed * LED_MS) / CELL) + 2;
        const headCell = Math.floor(headDist / CELL);

        for (let c = headCell; c > headCell - litCells; c--) {
          if (c < 0) break;
          const cellDist = c * CELL;
          // When did the head cross this cell, and how long ago?
          const litAt = cellDist / speed; // ms after birth
          const since = age - litAt;
          if (since < 0 || since > LED_MS) continue;

          // Position of this fixed cell in the page (does NOT move with the head).
          const bx = s.x + ux * cellDist;
          const by = s.y + uy * cellDist;
          if (by < -20 || by > height + 20 || bx < -20 || bx > width + 20) continue;

          // Each cell blinks: a few times over its life it flicks between glyphs and
          // can momentarily go dark, like an LED being driven.
          const blink = Math.floor(since / 60); // new blink phase every 60ms
          const seed = ((c * 374761393) ^ (blink * 668265263)) >>> 0;
          if (seed % 4 === 0 && c !== headCell) continue; // dark this blink (not the head)

          const k = since / LED_MS;
          const brightness = (1 - k) * (1 - k); // fade out, brightest right as it lights
          const isHead = c === headCell;
          const glyph = isHead
            ? HEAD[blink % HEAD.length]
            : TAILSET[seed % TAILSET.length];
          const jitter = (((seed >>> 5) % 3) - 1) * 0.5;

          ctx.globalAlpha = Math.min(1, age / 250) * (isHead ? 1 : brightness * 0.85);
          ctx.fillText(glyph, bx + px0 * jitter, by + py0 * jitter);
        }
      }
      ctx.globalAlpha = 1;

      if (now >= nextAt) {
        spawn();
        nextAt = now + MIN_GAP + Math.random() * MAX_EXTRA;
      }
      frame = requestAnimationFrame(draw);
    }

    resize();
    window.addEventListener("resize", resize);
    frame = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
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
