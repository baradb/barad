import Image from "next/image";
import { Icon } from "@/components/Icon";
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

/** A video (YouTube or file), or an empty labelled slot when none is set. */
export function VideoSlot({
  youtubeId,
  videoSrc,
  title,
}: {
  youtubeId?: string;
  videoSrc?: string;
  title: string;
}) {
  if (youtubeId) {
    return (
      <div className={`${frame} aspect-video`}>
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${encodeURIComponent(youtubeId)}`}
          title={title}
          loading="lazy"
          allow="accelerometer; encrypted-media; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 size-full border-0"
        />
      </div>
    );
  }
  if (videoSrc) {
    return (
      <div className={`${frame} aspect-video`}>
        <video
          src={videoSrc}
          controls
          preload="metadata"
          aria-label={title}
          className="absolute inset-0 size-full object-cover"
        />
      </div>
    );
  }
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
            <video
              controls
              playsInline
              preload="metadata"
              poster={m.poster}
              aria-label={m.label}
              className="absolute inset-0 size-full object-cover"
            >
              <source src={m.src} type="video/mp4" />
            </video>
          )}
        </div>
      ))}
    </div>
  );
}
