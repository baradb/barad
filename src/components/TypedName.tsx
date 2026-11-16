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
  // Click wave: origin letter + a key that restarts the staggered animation.
  const [wave, setWave] = useState<{ origin: number; key: number } | null>(null);
  const waveKey = useRef(0);

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
    const key = ++waveKey.current; // bump so the staggered animation restarts
    setWave({ origin, key });
    // Clear once the furthest letter has finished, so hover lift works again.
    const span = Math.max(origin, text.length - 1 - origin);
    window.setTimeout(() => {
      setWave((cur) => (cur && cur.key === key ? null : cur));
    }, span * 45 + 550);
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
            // On click, each letter hops in turn, staggered by its distance from the
            // clicked one, so the wave spreads out from where you clicked.
            const waveDelay = wave ? Math.abs(i - wave.origin) * 45 : 0;
            return (
              <span
                key={`${i}-${wave?.key ?? 0}`}
                className={`name-letter${wave ? " name-wave" : ""}`}
                onPointerEnter={() => setHovered(i)}
                onClick={() => sendWave(i)}
                style={{
                  transform: `translateY(-${lift}em)`,
                  animationDelay: `${waveDelay}ms`,
                }}
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
