import type { ReactNode } from "react";

// One icon set: 24px grid, 1.5 stroke, round caps (Lucide-style paths).
const icons = {
  "arrow-up-right": <path d="M7 17 17 7M8 7h9v9" />,
  mail: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </>
  ),
  music: (
    <>
      <path d="M9 18V5l12-2v13" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="18" cy="16" r="3" />
    </>
  ),
  linkedin: (
    <>
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect width="4" height="12" x="2" y="9" />
      <circle cx="4" cy="4" r="2" />
    </>
  ),
  "file-text": (
    <>
      <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
      <path d="M14 2v4a2 2 0 0 0 2 2h4M10 9H8M16 13H8M16 17H8" />
    </>
  ),
  image: (
    <>
      <rect width="18" height="18" x="3" y="3" rx="2" />
      <circle cx="9" cy="9" r="2" />
      <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
    </>
  ),
  video: (
    <>
      <path d="m16 13 5.223 3.482a.5.5 0 0 0 .777-.416V7.87a.5.5 0 0 0-.752-.432L16 10.5" />
      <rect x="2" y="6" width="14" height="12" rx="2" />
    </>
  ),
  check: <path d="M20 6 9 17l-5-5" />,
  discord: (
    <path d="M18.9 5.6A16.3 16.3 0 0 0 14.8 4.3a11.4 11.4 0 0 0-.5 1.1 15 15 0 0 0-4.5 0 11 11 0 0 0-.5-1.1 16.3 16.3 0 0 0-4.1 1.3C2.7 9.4 2 13.1 2.3 16.8a16.4 16.4 0 0 0 5 2.5 12 12 0 0 0 1-1.7 10.6 10.6 0 0 1-1.7-.8l.4-.3a11.7 11.7 0 0 0 10 0l.4.3a10.6 10.6 0 0 1-1.7.8 12 12 0 0 0 1 1.7 16.3 16.3 0 0 0 5-2.5c.4-4.3-.6-8-2.6-11.2ZM9.3 14.6c-1 0-1.8-.9-1.8-2s.8-2 1.8-2 1.8.9 1.8 2-.8 2-1.8 2Zm5.4 0c-1 0-1.8-.9-1.8-2s.8-2 1.8-2 1.8.9 1.8 2-.8 2-1.8 2Z" />
  ),
  download: (
    <>
      <path d="M12 15V3M7 10l5 5 5-5" />
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    </>
  ),
} satisfies Record<string, ReactNode>;

// These glyphs are solid shapes, drawn with fill instead of the default stroke.
const filled = new Set<keyof typeof icons>(["discord"]);

export function Icon({
  name,
  size = 16,
  className,
}: {
  name: keyof typeof icons;
  size?: number;
  className?: string;
}) {
  const solid = filled.has(name);
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={solid ? "currentColor" : "none"}
      stroke={solid ? "none" : "currentColor"}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      {icons[name]}
    </svg>
  );
}
