import type { ReactNode } from "react";

/** One-shot entrance (see .rise in globals.css; off under reduced motion). */
export function FadeIn({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <div className={`rise ${className}`} style={{ animationDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}
