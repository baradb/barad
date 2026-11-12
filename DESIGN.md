# Design

<!-- impeccable:design -->

## Visual World

A calm, light personal site on a pastel periwinkle ground (a blue leaning purple),
set in deep indigo ink. Two borrowed signatures carry the personality: a handwritten-style
name that types itself out with a blinking cursor on load (from vnguyen.org) and an ASCII background revealed
through a window at the cursor (from triho.dev). Everything else stays quiet.

Mode: **Experience / Read**. The visitor is getting to know one person in a few short
pages; the interface recedes.

## Layout

- One centered column, `max-w-2xl`, `px-6 sm:px-8`.
- Header on every page: the name, then a four-link nav (About, Experience, Projects, Interests). `/resume` counts as Experience. Active page is underlined
  in the accent, not distinguished by color alone.
- Now-playing tile fixed bottom-right.
- Group with spacing; hairline rules only between list rows.

## Color

Single light theme. Tokens live in `src/app/globals.css`.

| Token | Value | Use |
|---|---|---|
| background | `oklch(0.928 0.03 283.7)` (#e4e5fb) | page |
| surface | `oklch(0.965 0.016 286.1)` | now-playing tile |
| track | `oklch(0.885 0.044 282.6)` | hover and skeleton fills |
| rule | `oklch(0.838 0.056 282.9)` | hairlines |
| foreground | `oklch(0.257 0.073 282.2)` | primary text |
| muted | `oklch(0.415 0.089 283.5)` | secondary text |
| faint | `oklch(0.503 0.083 284.7)` | tertiary text (4.8:1 on background) |
| accent | `oklch(0.502 0.208 277.7)` | primary action, active tab, ASCII glyphs |

## Typography

- **Name and everything else:** Instrument Sans. The name is set large at weight 600 with tight tracking (-0.035em); there is no separate display face.
- No monospace; the ASCII field draws its own glyphs.
- Headings balanced, body 52ch or narrower, years in tabular numerals.

## Motion

One authored moment: the name types itself out with a text cursor that
blinks hard on and off like a document caret, while typing and after (about 1.2s of typing,
uneven rhythm). The bio and actions rise in behind it.
Tabs (nav and Interests) share one underline that jumps to the hovered tab in a quiet
color and back to the selected tab in the accent (fast exponential ease-out, no bounce).
The ASCII background is fixed to the page and animates in place (drifting waves plus
per-glyph flicker). The cursor is a soft-edged window onto it: moving the pointer moves
the window, not the pattern. The window opens and closes with a slight ease. Reduced
motion: name appears at once, no cursor, the background holds still.

## Components

- `Header`: typed name + nav. `TypedName` types it; `TabGroup`/`TabLabel` (in `tabs.tsx`) provide the shared jumping tab underline.
- `AsciiField`: fixed canvas holding a page-anchored ASCII pattern (glyph ramp ` .:-=+*#%@` from
  slow interfering waves). A 90px soft-edged window at the pointer reveals it, with no position
  lag. Hidden until the first pointer move, closes after 1.2s idle or when the pointer leaves
  the window, stops its render loop when closed, skipped on touch devices.
- `Icon`: one set, 24px grid, 1.5 stroke.
- `SubTabs`: Interests tabs, arrow-key navigable.
- `NowPlaying`: a 320px-wide tile labelled "What I'm listening to", with the album cover (music icon if missing), title and artist. It is sized to its content with even 8px padding: 74px tall, or 98px when the song has start/end times and a progress row (elapsed time, bar, total) is shown. The browser counts the seconds itself and asks again shortly after a song ends. Loading and "Nothing right now" states use the compact 74px shape.

## Content surfaces

- **Projects:** "Currently working on" first, then "Finished projects". Section headings are 24px with a hairline rule under them; project names are 18px, so the two levels read apart. Each project's photos and videos sit in one uncropped row at a shared height (about 300px; a lone portrait photo stays small), described in `media` in `src/data/projects.ts`. With no media, two empty photo slots show. Videos are H.264 MP4 with a poster frame; all files in `public/projects/` have location/EXIF data stripped because the repo is public.
- **Interests:** tabs Music, Guitar, Cooking, Design, as label/value rows (not cards). Music shows the favorite album cover (rounded square) and artist photo (circle), fetched from Spotify's public oEmbed and linking back to Spotify, plus a genre line. Guitar is written rows first (recently learned, like to play, working on) with a single video at the bottom and a caption. Cooking opens with one loud line, then rows. Design shows each poster full width and uncropped, with its title and tools underneath. Videos are H.264 MP4 in `public/videos/`, artwork in `public/art/`; all stripped of location/EXIF because the repo is public.
- **Experience:** dated roles, newest first, with a link to the resume.
- **Resume:** `/resume` shows `public/resume.png` (a picture of the PDF, regenerate it when the PDF changes) with a filled "Download PDF" button for `public/resume.pdf`; says plainly when files are missing.
- Contact links: Resume, LinkedIn, and Email (a button: click copies the address, the text reads "Copied" for ~2s).

## Entrance timing

The About page waits for the typed name only on the first visit (`.intro` delays in
`globals.css`). `TypedName` sets `data-intro-done` on `<html>` when typing ends, after which
returning to About appears as quickly as any other tab. About also shows a small
"currently working on" line linking to Projects, taken from `current` in `src/data/projects.ts`.

## Scrollbar

The page scrollbar is hidden (`scrollbar-width: none` plus the WebKit rule on `html`).
Wheel, touch and keyboard scrolling still work; there is just no visible bar or reserved gutter.

## Video player

All videos use `VideoPlayer` (`src/components/VideoPlayer.tsx`), never the browser's own controls:
a 64px play button centred on the video (a flat circle, no gradient or tint over the footage) and a
thin progress bar along the bottom. Clicking anywhere plays or pauses; while playing, the button hides
and reappears as a pause button on hover or keyboard focus. The bar can be clicked, dragged, or stepped
with the arrow keys (5s), Home and End. There is deliberately no fullscreen, picture-in-picture, volume,
speed or menu. Starting one video pauses any other.
