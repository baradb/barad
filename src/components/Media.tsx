import Image from "next/image";
import { Icon } from "@/components/Icon";

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
