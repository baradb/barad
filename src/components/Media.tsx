import Image from "next/image";
import { Icon } from "@/components/Icon";
import { VideoPlayer } from "@/components/VideoPlayer";
import type { Media } from "@/data/media";

const frame = "relative overflow-hidden rounded-xl bg-surface";

/** A photo, or an empty labelled slot when no file has been added yet. */
export function PhotoSlot({
  image,
  ratio = "aspect-video",
  sizes = "(min-width: 672px) 336px, 100vw",
  label = "Photo",
}: {
  image?: { src: string; alt: string };
  ratio?: string;
  sizes?: string;
  label?: string;
}) {
  if (image) {
    return (
      <div className={`${frame} ${ratio}`}>
        <Image src={image.src} alt={image.alt} fill sizes={sizes} className="object-cover" />
      </div>
    );
  }
  return (
    <div
      className={`${frame} ${ratio} flex flex-col items-center justify-center gap-2 border border-dashed border-rule text-muted`}
    >
      <Icon name="image" size={20} />
      <span className="text-sm">{label}</span>
    </div>
  );
}

/** An empty labelled slot for a video that has not been added yet. */
export function VideoSlot() {
  return (
    <div
      className={`${frame} aspect-video flex flex-col items-center justify-center gap-2 border border-dashed border-rule text-muted`}
    >
      <Icon name="video" size={20} />
      <span className="text-sm">Video</span>
    </div>
  );
}

const ROW_HEIGHT = 300; // px: the height a row of media aims for by default
const ROW_GAP = 12; // px: matches gap-3

/**
 * Photos and videos side by side, never cropped. Each item is as wide as its shape
 * needs (flex-grow = aspect ratio), so they all end up the same height. The row is
 * capped so a lone portrait photo stays small instead of filling the column.
 */
export function MediaRow({ items, height = ROW_HEIGHT }: { items: Media[]; height?: number }) {
  const ratios = items.map((m) => m.width / m.height);
  const maxWidth = ratios.reduce((a, b) => a + b, 0) * height + (items.length - 1) * ROW_GAP;

  return (
    <div className="flex items-start gap-3" style={{ maxWidth }}>
      {items.map((m, i) => (
        <div
          key={m.src}
          className="relative min-w-0 overflow-hidden rounded-xl bg-surface"
          style={{ flex: `${ratios[i] * 1000} 1 0%`, aspectRatio: ratios[i] }}
        >
          {m.type === "image" ? (
            <Image
              src={m.src}
              alt={m.alt}
              fill
              sizes="(min-width: 720px) 400px, 70vw"
              className="object-cover"
            />
          ) : (
            <VideoPlayer src={m.src} poster={m.poster} label={m.label} />
          )}
        </div>
      ))}
    </div>
  );
}
