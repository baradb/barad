/**
 * A photo or video shown on the site. Give the real pixel size so layouts can reserve
 * the right space without cropping. Videos should be H.264 MP4 (phone HEVC .mov files
 * don't play in every browser), and every file should have location/EXIF data stripped,
 * since the repo is public.
 */
export type Media =
  | { type: "image"; src: string; alt: string; width: number; height: number }
  | { type: "video"; src: string; poster: string; label: string; width: number; height: number };
