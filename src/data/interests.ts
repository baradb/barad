import type { Media } from "@/data/media";

/**
 * Interests, one subtab each on /interests.
 *
 * - `blurb`: an opening line.
 * - `rows`: label/value rows. A row can hold text, a list of lines, or a Spotify
 *   cover (album or artist art is fetched from Spotify by id; no key needed).
 * - `pieces`: artwork shown full width, uncropped (files in public/art/).
 * - `video`: one video at the bottom (files in public/videos/); see src/data/media.ts.
 */
export type Cover = {
  kind: "album" | "artist";
  spotifyId: string;
  name: string;
  by?: string;
};

export type Row = {
  label: string;
  text?: string;
  lines?: string[];
  cover?: Cover;
};

export type Piece = {
  title: string;
  tools: string[];
  image?: { src: string; alt: string; width: number; height: number };
};

export type Interest = {
  id: string;
  label: string;
  blurb?: string;
  rows?: Row[];
  pieces?: Piece[];
  video?: { caption?: string; item?: Media };
};

export const interests: Interest[] = [
  {
    id: "music",
    label: "Music",
    rows: [
      {
        label: "Favorite album",
        cover: {
          kind: "album",
          spotifyId: "0nqsPuGO0iEl4MRWwjhWF2",
          name: "Do That Again",
          by: "Malcolm Todd",
        },
      },
      {
        label: "Favorite artist",
        cover: { kind: "artist", spotifyId: "6mx3Y8XNLPaS2pjJbQFq3W", name: "Bunii" },
      },
      { label: "Genre", text: "Indie, shoegaze-type" },
    ],
  },
  {
    id: "guitar",
    label: "Guitar",
    rows: [
      {
        label: "Recently learned",
        lines: ["Wash It Down · Ethos", "Seek and Destroy · Metallica"],
      },
      {
        label: "Like to play",
        text: "Metal songs, midwest emo songs, indie songs. (I know, wide range.)",
      },
      { label: "Working on", text: "Learning the Master of Puppets guitar solo." },
    ],
    video: {
      caption: "All in My Head · Computer",
      item: {
        type: "video",
        src: "/videos/guitar-all-in-my-head.mp4",
        poster: "/videos/guitar-all-in-my-head-poster.jpg",
        label: "Guitar video: All in My Head by Computer",
        width: 640,
        height: 288,
      },
    },
  },
  {
    id: "cooking",
    label: "Cooking",
    blurb: "I LOOOOVEEE COOKING",
    rows: [
      { label: "Dish I'm good at", text: "Marry Me chicken alfredo" },
      { label: "Want to learn", text: "French onion soup" },
      {
        label: "Favorite ingredient",
        text: "Thyme. It makes everything taste so much better.",
      },
    ],
  },
  {
    id: "design",
    label: "Design",
    blurb: "Posters and layouts I've designed in Photoshop and Illustrator.",
    pieces: [
      {
        title: "Playboi Carti poster",
        tools: ["Photoshop", "Illustrator"],
        image: {
          src: "/art/carti-poster.jpg",
          alt: "Magazine spread about Playboi Carti in black, white and red, with grainy photos, a large asterisk and the words I AM MUSIC",
          width: 2000,
          height: 1333,
        },
      },
      {
        title: "Malcolm Todd “Sweet Boy” poster",
        tools: ["Photoshop", "Illustrator"],
        image: {
          src: "/art/malcolm-todd-sweet-boy-poster.jpg",
          alt: "Magazine spread about Malcolm Todd in pink and cream, with stars, cut-out photos and his name set vertically",
          width: 1990,
          height: 1298,
        },
      },
      {
        title: "Dominic Fike poster",
        tools: ["Photoshop", "Illustrator"],
        image: {
          src: "/art/dominic-fike-poster.jpg",
          alt: "Magazine spread about Dominic Fike in mustard yellow and tan, with a cut-out portrait and a large asterisk",
          width: 1988,
          height: 1298,
        },
      },
    ],
  },
];
