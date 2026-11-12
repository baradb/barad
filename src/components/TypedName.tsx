"use client";

import { useEffect, useState } from "react";

/**
 * Types the name out one character at a time next to a text cursor that blinks
 * on and off like a caret in a document, while typing and after (see .caret in
 * globals.css). The full name is laid out invisibly first so nothing shifts.
 * Reduced motion: shows the whole name at once, no cursor.
 */
export function TypedName({ text }: { text: string }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let n = 0;
    let timer = 0;

    function type() {
      n = reduce ? text.length : n + 1;
      setCount(n);
      // Uneven rhythm reads as a person typing.
      if (n < text.length) timer = window.setTimeout(type, 70 + Math.random() * 90);
    }

    timer = window.setTimeout(type, reduce ? 0 : 350);
    return () => window.clearTimeout(timer);
  }, [text]);

  return (
    <span className="relative inline-block whitespace-nowrap">
      <span className="invisible">{text}</span>
      <span aria-hidden="true" className="absolute top-0 left-0">
        {text.slice(0, count)}
        <span className="caret ml-1 inline-block h-[0.8em] w-[3px] rounded-full bg-accent align-[-0.06em]" />
      </span>
    </span>
  );
}
