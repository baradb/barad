import { Icon } from "@/components/Icon";
import Image from "next/image";
import { MediaRow, PhotoSlot, VideoSlot } from "@/components/Media";
import type { CoverInfo } from "@/lib/spotify";
import type { Cover, Interest } from "@/data/interests";

export const coverKey = (c: Cover) => `${c.kind}:${c.spotifyId}`;

/** An album cover or artist photo from Spotify, linking back to it. */
function CoverLink({ cover, info }: { cover: Cover; info: CoverInfo | null | undefined }) {
  const shape = cover.kind === "artist" ? "rounded-full" : "rounded-xl";
  const alt =
    cover.kind === "album"
      ? `Cover art for ${cover.name} by ${cover.by}`
      : `Photo of ${cover.name}`;

  const art = info ? (
    // Plain <img>: a 96px thumbnail from Spotify's CDN; no image-optimizer config needed.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={info.image}
      alt={alt}
      width={96}
      height={96}
      loading="lazy"
      className={`size-24 shrink-0 object-cover ${shape}`}
    />
  ) : (
    <span
      className={`flex size-24 shrink-0 items-center justify-center border border-dashed border-rule bg-surface text-muted ${shape}`}
    >
      <Icon name="image" size={20} />
    </span>
  );

  const text = (
    <span className="min-w-0">
      <span className="flex items-center gap-1.5 text-lg font-medium group-hover:underline">
        {cover.name}
        {info && (
          <Icon
            name="arrow-up-right"
            className="text-faint transition-colors group-hover:text-accent"
          />
        )}
      </span>
      {cover.by && <span className="block text-base text-muted">{cover.by}</span>}
    </span>
  );

  if (!info) {
    return (
      <div className="flex items-center gap-4">
        {art}
        {text}
      </div>
    );
  }
  return (
    <a
      href={info.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex w-fit items-center gap-4 rounded-xl"
    >
      {art}
      {text}
      <span className="sr-only">(opens Spotify in a new tab)</span>
    </a>
  );
}

export function InterestPanel({
  interest,
  covers,
}: {
  interest: Interest;
  covers: Record<string, CoverInfo | null>;
}) {
  return (
    <>
      {interest.blurb && (
        <p className="max-w-[52ch] text-base leading-7 text-foreground">{interest.blurb}</p>
      )}

      {interest.rows && interest.rows.length > 0 && (
        <dl className={`${interest.blurb ? "mt-6" : ""} divide-y divide-rule border-y border-rule`}>
          {interest.rows.map((row) => (
            <div
              key={row.label}
              className="grid gap-x-8 gap-y-3 py-6 sm:grid-cols-[9rem_1fr]"
            >
              <dt className="text-sm text-faint">{row.label}</dt>
              <dd className="min-w-0">
                {row.cover && (
                  <CoverLink cover={row.cover} info={covers[coverKey(row.cover)]} />
                )}
                {row.text && (
                  <p className="max-w-[52ch] text-base leading-7 text-foreground">{row.text}</p>
                )}
                {row.lines && (
                  <ul className="space-y-1 text-base leading-7 text-foreground">
                    {row.lines.map((line) => (
                      <li key={line}>{line}</li>
                    ))}
                  </ul>
                )}
              </dd>
            </div>
          ))}
        </dl>
      )}

      {interest.pieces && interest.pieces.length > 0 && (
        <ul className={`${interest.blurb ? "mt-8" : ""} space-y-12`}>
          {interest.pieces.map((piece) => (
            <li key={piece.title}>
              {piece.image ? (
                <Image
                  src={piece.image.src}
                  alt={piece.image.alt}
                  width={piece.image.width}
                  height={piece.image.height}
                  sizes="(min-width: 720px) 672px, 100vw"
                  className="h-auto w-full rounded-xl border border-rule"
                />
              ) : (
                <PhotoSlot ratio="aspect-[3/2]" label="Artwork" />
              )}
              <p className="mt-4 text-lg font-medium">{piece.title}</p>
              <p className="text-sm text-faint">{piece.tools.join(" · ")}</p>
            </li>
          ))}
        </ul>
      )}

      {interest.video && (
        <figure className="mt-10">
          {interest.video.item ? (
            <MediaRow items={[interest.video.item]} />
          ) : (
            <VideoSlot />
          )}
          {interest.video.caption && (
            <figcaption className="mt-3 max-w-[52ch] text-sm leading-6 text-muted">
              {interest.video.caption}
            </figcaption>
          )}
        </figure>
      )}
    </>
  );
}
