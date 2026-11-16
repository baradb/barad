"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Types the name out one character at a time next to a text cursor that blinks
 * on and off like a caret in a document, while typing and after (see .caret in
 * globals.css). The full name is laid out invisibly first so nothing shifts.
 * Reduced motion: shows the whole name at once, no cursor.
 */
export function TypedName({ text }: { text: string }) {
  const [count, setCount] = useState(0);
  const [hovered, setHovered] = useState<number | null>(null);
  // One DOM ref per visible letter, so a click can animate each imperatively.
  const letterRefs = useRef<(HTMLSpanElement | null)[]>([]);

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

  function sendWave(origin: number) {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // Hop each letter with a delay set by its distance from the clicked one, so the
    // wave spreads outward. Driving it with the Web Animations API means a fresh
    // click just replaces each letter's running hop — no snapping, no remount.
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

  return (
    <span className="relative inline-block whitespace-nowrap">
      <span className="invisible">{text}</span>
      <span
        aria-hidden="true"
        className="absolute top-0 left-0"
        onPointerLeave={() => setHovered(null)}
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
                onPointerEnter={() => setHovered(i)}
                onClick={() => sendWave(i)}
                style={{ transform: `translateY(-${lift}em)` }}
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
