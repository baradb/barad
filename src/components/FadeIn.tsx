import type { CSSProperties, ReactNode } from "react";

/**
 * One-shot entrance (see .rise in globals.css; off under reduced motion).
 * `intro`: the home page's delay, which waits for the typed name. It only applies on
 * the first visit; once typing has finished (see TypedName) it collapses to zero so
 * coming back to About is as quick as any other tab.
 */
export function FadeIn({
  children,
  delay = 0,
  intro = false,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  intro?: boolean;
  className?: string;
}) {
  const style = (
    intro ? { "--intro-delay": `${delay}ms` } : { animationDelay: `${delay}ms` }
  ) as CSSProperties;
  return (
    <div className={`rise ${intro ? "intro" : ""} ${className}`} style={style}>
      {children}
    </div>
  );
}
