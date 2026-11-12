"use client";

import {
  createContext,
  use,
  useLayoutEffect,
  useRef,
  useState,
  type ComponentProps,
  type PointerEvent,
  type ReactNode,
} from "react";

type TabsContextValue = {
  register: (index: number, el: HTMLElement | null) => void;
  hover: (index: number | null) => void;
};

const TabsContext = createContext<TabsContextValue>({
  register() {},
  hover() {},
});

/**
 * Wraps a row of tabs with one shared underline. The underline jumps to whichever
 * tab is hovered (quiet color) and returns to the selected tab (accent) when the
 * pointer leaves. Position is set imperatively, so hovering never re-renders the page.
 * Tabs inside use <TabLabel> for their text and `useTabHover(index)` on the control.
 */
export function TabGroup({
  selected,
  className = "",
  children,
  ...props
}: ComponentProps<"div"> & { selected: number; children: ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const indicatorRef = useRef<HTMLSpanElement>(null);
  const labelRefs = useRef<(HTMLElement | null)[]>([]);
  const placed = useRef(false);
  const [hover, setHover] = useState<number | null>(null);
  const target = hover ?? selected;

  // Latest placement routine, shared by the effect below and the resize observer.
  const place = useRef<(animate: boolean) => void>(() => {});

  // Move the underline when the target (hovered or selected tab) changes: animated.
  useLayoutEffect(() => {
    place.current = (animate) => {
      const container = containerRef.current;
      const indicator = indicatorRef.current;
      const label = labelRefs.current[target];
      if (!container || !indicator || !label) return;
      const c = container.getBoundingClientRect();
      const l = label.getBoundingClientRect();
      if (!animate) indicator.style.transition = "none";
      indicator.style.transform = `translate(${l.left - c.left}px, ${l.bottom - c.top}px)`;
      indicator.style.width = `${l.width}px`;
      indicator.style.backgroundColor =
        target === selected ? "var(--accent)" : "var(--faint)";
      if (!animate) {
        void indicator.offsetWidth; // flush, then hand transitions back to CSS
        indicator.style.transition = "";
      }
    };

    place.current(placed.current);
    if (!placed.current) {
      placed.current = true;
      if (indicatorRef.current) indicatorRef.current.style.opacity = "1";
      if (containerRef.current) containerRef.current.dataset.ready = ""; // hides the server-rendered fallback
    }
  }, [target, selected]);

  // Re-place without animating when fonts load or the layout resizes. Created once:
  // a new observer fires immediately on observe(), which would cancel every slide.
  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const observer = new ResizeObserver(() => place.current(false));
    observer.observe(container);
    labelRefs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const context: TabsContextValue = {
    register: (index, el) => {
      labelRefs.current[index] = el;
    },
    hover: setHover,
  };

  return (
    <TabsContext value={context}>
      <div
        ref={containerRef}
        onPointerLeave={() => setHover(null)}
        className={`group/tabs relative ${className}`}
        {...props}
      >
        {children}
        <span
          ref={indicatorRef}
          aria-hidden="true"
          className="pointer-events-none absolute top-0 left-0 h-0.5 w-0 rounded-full bg-accent opacity-0 transition-[transform,width,background-color] duration-300 [transition-timing-function:var(--ease-out)] motion-reduce:transition-none"
        />
      </div>
    </TabsContext>
  );
}

/** The tab's text. The shared underline is measured from this element. */
export function TabLabel({
  index,
  selected,
  children,
}: {
  index: number;
  selected: boolean;
  children: ReactNode;
}) {
  const { register } = use(TabsContext);
  return (
    <span
      ref={(el) => register(index, el)}
      className={`relative py-1 transition-colors duration-150 ${
        selected ? "text-foreground" : "text-faint group-hover:text-foreground"
      }`}
    >
      {children}
      {/* Server-rendered underline, shown only until the shared one mounts. */}
      {selected && (
        <span
          aria-hidden="true"
          className="absolute inset-x-0 -bottom-0.5 h-0.5 rounded-full bg-accent group-data-[ready]/tabs:hidden"
        />
      )}
    </span>
  );
}

/** Spread onto each tab control so hovering it sends the underline there. */
export function useTabHover(index: number) {
  const { hover } = use(TabsContext);
  return {
    onPointerEnter: (e: PointerEvent) => {
      if (e.pointerType === "mouse") hover(index);
    },
  };
}
