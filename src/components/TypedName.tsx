"use client";

import { useEffect, useRef, useState } from "react";

/** A short-lived ASCII burst of glyphs shooting out from a point, then fading. */
function asciiBurst(cx: number, cy: number, color: string) {
  const glyphs = "*+x#%@&=o^·:.".split("");
  const layer = document.createElement("div");
  layer.setAttribute("aria-hidden", "true");
  layer.style.cssText =
    "position:fixed;left:0;top:0;width:0;height:0;z-index:40;pointer-events:none;";
  document.body.appendChild(layer);

  const PARTICLES = 90;
  for (let i = 0; i < PARTICLES; i++) {
    const s = document.createElement("span");
    s.textContent = glyphs[(Math.random() * glyphs.length) | 0];
    const size = 8 + Math.random() * 8;
    s.style.cssText = `position:absolute;left:${cx}px;top:${cy}px;color:${color};font:700 ${size}px ui-monospace,Menlo,monospace;will-change:transform,opacity;`;
    layer.appendChild(s);

    const a = Math.random() * Math.PI * 2;
    const d = 140 + Math.random() * 420;
    const dx = Math.cos(a) * d;
    const dy = Math.sin(a) * d;
    const rot = (-1 + Math.random() * 2) * 360;
    s.animate(
      [
        { transform: "translate(-50%,-50%) scale(0.5) rotate(0deg)", opacity: 1, offset: 0 },
        // Stay fully visible for most of the flight, then fade only at the end.
        {
          transform: `translate(calc(-50% + ${dx * 0.7}px), calc(-50% + ${dy * 0.7}px)) scale(1) rotate(${rot * 0.7}deg)`,
          opacity: 1,
          offset: 0.6,
        },
        {
          transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) scale(1) rotate(${rot}deg)`,
          opacity: 0,
          offset: 1,
        },
      ],
      { duration: 650 + Math.random() * 450, easing: "cubic-bezier(0.12, 0.7, 0.2, 1)", fill: "forwards" },
    );
  }
  window.setTimeout(() => layer.remove(), 1300);
}

/**
 * Types the name out one character at a time next to a text cursor that blinks
 * on and off like a caret in a document, while typing and after (see .caret in
 * globals.css). The full name is laid out invisibly first so nothing shifts.
 * Reduced motion: shows the whole name at once, no cursor.
 */
export function TypedName({ text }: { text: string }) {
  const [count, setCount] = useState(0);
  const [hovered, setHovered] = useState<number | null>(null);
  const [blown, setBlown] = useState(false); // during the explosion, hover is suspended
  // One DOM ref per visible letter, so a click can animate each imperatively.
  const letterRefs = useRef<(HTMLSpanElement | null)[]>([]);
  // Rapid-click tracking: counts clicks that land close together in time.
  const clicks = useRef({ n: 0, last: 0 });
  const blownRef = useRef(false);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let n = 0;
    let timer = 0;

    function type() {
      n = reduce ? text.length : n + 1;
      setCount(n);
      // Uneven rhythm reads as a person typing.
      if (n < text.length) timer = window.setTimeout(type, 70 + Math.random() * 90);
      else document.documentElement.dataset.introDone = ""; // see .intro in globals.css
    }

    timer = window.setTimeout(type, reduce ? 0 : 350);
    return () => window.clearTimeout(timer);
  }, [text]);

  function sendWave(origin: number, at: number) {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (blownRef.current) return; // mid-explosion: ignore clicks

    // Count rapid clicks. Spamming ~10 within a short window blows the name apart.
    // `at` is the click event's timeStamp (no impure clock call needed).
    clicks.current.n = at - clicks.current.last < 600 ? clicks.current.n + 1 : 1;
    clicks.current.last = at;
    if (clicks.current.n >= 10) {
      clicks.current.n = 0;
      explode();
      return;
    }

    // Otherwise: hop each letter with a delay set by its distance from the clicked
    // one, so the wave spreads outward. WAAPI means a fresh click just replaces each
    // letter's running hop — no snapping, no remount.
    letterRefs.current.forEach((el, i) => {
      if (!el) return;
      const delay = Math.abs(i - origin) * 45;
      // Start and land at the letter's resting lift (its hover state), so when the
      // hop ends it matches the inline transform exactly — no jump under the mouse.
      const restDist = hovered === null ? 99 : Math.abs(i - hovered);
      const rest = restDist === 0 ? 0.26 : restDist === 1 ? 0.1 : 0;
      el.animate(
        [
          { transform: `translateY(-${rest}em)` },
          { transform: "translateY(-0.34em)", offset: 0.4 },
          { transform: `translateY(-${rest}em)` },
        ],
        { duration: 500, delay, easing: "cubic-bezier(0.34, 1.56, 0.64, 1)" },
      );
    });
  }

  // Blow the letters off and let real-ish physics take over: gravity pulls them
  // down, they bounce off the bottom of the screen (losing energy each time) and
  // roll along it with friction, then after a beat they fly back up into place.
  function explode() {
    blownRef.current = true;
    setBlown(true);
    setHovered(null);

    const els = letterRefs.current.filter(Boolean) as HTMLSpanElement[];
    if (els.length === 0) return;

    // Centre of the name, in viewport space — the blast origin.
    const rects = els.map((el) => el.getBoundingClientRect());
    const cx = rects.reduce((s, r) => s + (r.left + r.right) / 2, 0) / rects.length;
    const cy = rects.reduce((s, r) => s + (r.top + r.bottom) / 2, 0) / rects.length;

    // 1) Fling each letter straight outward from the centre, spinning, then fading.
    const outTransform: string[] = [];
    els.forEach((el, idx) => {
      const r = rects[idx];
      const mx = (r.left + r.right) / 2;
      const my = (r.top + r.bottom) / 2;
      // Direction from centre to this letter (nudged random so stacked letters differ).
      let ang = Math.atan2(my - cy, mx - cx);
      if (!isFinite(ang) || (Math.abs(mx - cx) < 1 && Math.abs(my - cy) < 1)) {
        ang = Math.random() * Math.PI * 2;
      }
      ang += (-0.5 + Math.random()) * 0.6; // a little spread
      const dist = 320 + Math.random() * 260;
      const dx = Math.cos(ang) * dist;
      const dy = Math.sin(ang) * dist;
      const spin = (-1 + Math.random() * 2) * 720;

      const out = `translate(${dx}px, ${dy}px) rotate(${spin}deg) scale(0.4)`;
      outTransform[idx] = out;

      el.animate(
        [
          { transform: "translate(0px,0px) rotate(0deg) scale(1)", opacity: 1 },
          { transform: out, opacity: 0 },
        ],
        { duration: 650, easing: "cubic-bezier(0.15, 0.6, 0.3, 1)", fill: "forwards" },
      );
    });

    // 2) An ASCII burst: short-lived glyphs shooting out from the blast centre.
    const accent =
      getComputedStyle(document.documentElement).getPropertyValue("--accent").trim() ||
      "#5b5bd6";
    asciiBurst(cx, cy, accent);

    // 3) After a beat, fly each letter back in from where it flew out to.
    window.setTimeout(() => {
      els.forEach((el, i) => {
        el.animate(
          [
            { transform: outTransform[i], opacity: 0, offset: 0 },
            { transform: "translate(0px,-24px) rotate(-8deg) scale(1)", opacity: 1, offset: 0.7 },
            { transform: "translate(0px,0px) rotate(0deg) scale(1)", opacity: 1, offset: 1 },
          ],
          {
            duration: 700,
            delay: i * 50, // fly back one after another, left to right
            easing: "cubic-bezier(0.34, 1.56, 0.64, 1)",
            fill: "both",
          },
        );
      });
      // Once the last letter has landed, hand transforms back to React/CSS.
      const settle = (els.length - 1) * 50 + 720;
      window.setTimeout(() => {
        els.forEach((el) => el.getAnimations().forEach((a) => a.cancel()));
        blownRef.current = false;
        setBlown(false);
      }, settle);
    }, 2000);
  }

  return (
    <span className="relative inline-block whitespace-nowrap">
      <span className="invisible">{text}</span>
      <span
        aria-hidden="true"
        className="absolute top-0 left-0"
        onPointerLeave={() => !blown && setHovered(null)}
      >
        {text
          .slice(0, count)
          .split("")
          .map((ch, i) => {
            if (ch === " ") return <span key={i}>&nbsp;</span>;
            // The hovered letter lifts most; its neighbours lift a little, so gliding
            // across reads as a smooth wave following the pointer, not hard on/off.
            const dist = hovered === null ? 99 : Math.abs(i - hovered);
            const lift = dist === 0 ? 0.26 : dist === 1 ? 0.1 : 0;
            return (
              <span
                key={i}
                ref={(el) => {
                  letterRefs.current[i] = el;
                }}
                className="name-letter"
                onPointerEnter={() => !blown && setHovered(i)}
                onClick={(e) => sendWave(i, e.timeStamp)}
                // While blown, WAAPI owns the transform; don't fight it with inline styles.
                style={blown ? undefined : { transform: `translateY(-${lift}em)` }}
              >
                {ch}
              </span>
            );
          })}
        <span className="caret ml-1 inline-block h-[0.8em] w-[3px] rounded-full bg-accent align-[-0.06em]" />
      </span>
    </span>
  );
}
