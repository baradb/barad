"use client";

import { useRef, useState } from "react";
import { InterestPanel } from "@/components/InterestPanel";
import { TabGroup, TabLabel, useTabHover } from "@/components/tabs";
import type { Interest } from "@/data/interests";
import type { CoverInfo } from "@/lib/spotify";

function TabButton({
  interest,
  index,
  selected,
  onSelect,
  buttonRef,
}: {
  interest: Interest;
  index: number;
  selected: boolean;
  onSelect: () => void;
  buttonRef: (el: HTMLButtonElement | null) => void;
}) {
  const hover = useTabHover(index);
  return (
    <button
      ref={buttonRef}
      role="tab"
      id={`tab-${interest.id}`}
      aria-selected={selected}
      aria-controls="interests-panel"
      tabIndex={selected ? 0 : -1}
      onClick={onSelect}
      {...hover}
      className="group inline-flex min-h-11 cursor-pointer items-center rounded-lg px-3"
    >
      <TabLabel index={index} selected={selected}>
        {interest.label}
      </TabLabel>
    </button>
  );
}

export function SubTabs({
  interests,
  covers,
}: {
  interests: Interest[];
  covers: Record<string, CoverInfo | null>;
}) {
  const [active, setActive] = useState(0);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Arrow keys move between tabs (roving focus); Home/End jump to the ends.
  function onKeyDown(e: React.KeyboardEvent) {
    const last = interests.length - 1;
    let next: number;
    if (e.key === "ArrowRight") next = active === last ? 0 : active + 1;
    else if (e.key === "ArrowLeft") next = active === 0 ? last : active - 1;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = last;
    else return;
    e.preventDefault();
    setActive(next);
    tabRefs.current[next]?.focus();
  }

  const current = interests[active];

  return (
    <div className="mt-6">
      <TabGroup
        selected={active}
        role="tablist"
        aria-label="Interests"
        onKeyDown={onKeyDown}
        className="-ml-3 flex w-fit flex-wrap text-sm font-medium"
      >
        {interests.map((interest, i) => (
          <TabButton
            key={interest.id}
            interest={interest}
            index={i}
            selected={i === active}
            onSelect={() => setActive(i)}
            buttonRef={(el) => {
              tabRefs.current[i] = el;
            }}
          />
        ))}
      </TabGroup>

      <div
        role="tabpanel"
        id="interests-panel"
        aria-labelledby={`tab-${current.id}`}
        tabIndex={0}
        key={current.id}
        className="panel-in mt-6 rounded-lg"
      >
        <InterestPanel interest={current} covers={covers} />
      </div>
    </div>
  );
}
