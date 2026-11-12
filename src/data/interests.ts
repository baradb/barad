/**
 * Interests, one subtab each on /interests.
 *
 * - `rows`: label/value rows. A row can hold text, a list of lines, or a Spotify
 *   cover (album or artist art is fetched from Spotify by id; no key needed).
 * - `items`: a plain list.
 * - `pieces`: a gallery of artwork. Add a file in public/art/ and set `image`.
 * - `video`: one video shown at the bottom. Set `youtubeId` (the part after v=) or
 *   `videoSrc` (a file in public/videos/). With neither, an empty slot shows.
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
  tool: string;
  image?: { src: string; alt: string };
};

export type Interest = {
  id: string;
  label: string;
  blurb?: string;
  rows?: Row[];
  items?: string[];
  pieces?: Piece[];
  video?: { title: string; caption?: string; youtubeId?: string; videoSrc?: string };
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
    blurb: "Placeholder. How long you've played and what you're into.",
    rows: [
      {
        label: "Recently learned",
        lines: ["Placeholder song · Artist", "Another placeholder song · Artist"],
      },
      { label: "Like to play", text: "Placeholder. The kind of songs or players you gravitate to." },
      { label: "Working on", text: "Placeholder. What's next on the list." },
    ],
    video: {
      title: "Guitar video",
      caption: "Placeholder. A song you've been playing lately.",
    },
  },
  {
    id: "cooking",
    label: "Cooking",
    blurb: "Placeholder. What you like to cook and eat.",
    items: ["A dish you're good at", "Something you want to learn", "A favorite ingredient"],
  },
  {
    id: "design",
    label: "Design",
    blurb: "Placeholder. Art and designs you've made, mostly in Photoshop and Procreate.",
    pieces: [
      { title: "Piece title", tool: "Photoshop" },
      { title: "Piece title", tool: "Procreate" },
      { title: "Piece title", tool: "Illustrator" },
    ],
  },
];
