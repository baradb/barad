# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Next.js (React) + TypeScript + Tailwind CSS. Hosted on Vercel.

## Users

Barad is a mechanical engineer. Copy, project placeholders and tone should speak to engineering work (design, analysis, builds), not software.


Primary user: visitors to Barad Badri's personal site — recruiters, collaborators, peers, and anyone who followed a link to learn who Barad is, see his projects, and get a sense of his interests. They arrive briefly, scan, and leave with an impression. Secondary user: Barad himself, maintaining and extending the site over time.

## Product Purpose

A personal site and portfolio for Barad Badri, a mechanical engineering student at the University of Waterloo (specializing in computing), not a software developer. It introduces him, shows what he has built, and conveys his interests and personality. Success is a visitor quickly understanding who Barad is, remembering him, and reaching his projects or contact.

## Positioning

A single, cohesive personal presence owned end to end by Barad — not a template or a profile on someone else's platform. Its distinctness comes from craft and personality: a minimal, confident design with small, specific details (the now-playing music corner, per-interest subtabs) that a generic portfolio builder could not reproduce truthfully.

## Operating Context

- Visitors arrive from links (resume, social, referrals) and browse a handful of pages in one short session, on desktop and mobile.
- Navigation: Home/About, Projects, Interests (with per-interest subtabs), and a persistent now-playing music corner widget.
- Barad edits content and ships via Vercel.

## Capabilities and Constraints

- **Home / About:** introduction to Barad Badri.
- **Projects:** a list of work, each with room for photos of the project itself. Real project content is not yet available; built with clearly-marked placeholder entries for Barad to replace later. Do not fabricate project names, links, or claims.
- **Interests:** a page whose interests are organized as subtabs: Music (favorite album and artist with Spotify cover art, genre), Guitar (what's recently learned and liked, one video at the bottom), Cooking, Design (artwork from Photoshop, Procreate and similar).
- **Experience:** dated roles with a link to the resume.
- **Resume:** a `/resume` page showing a PDF Barad supplies at `public/resume.pdf`.
- **Contact:** LinkedIn (linkedin.com/in/baradb); email is added later.
- **Now-playing widget:** a small corner tile showing the track Barad is playing on Spotify right now, read from his Discord status through Lanyard (no API key; needs `DISCORD_USER_ID`). Lanyard has no history, so when nothing is playing it says so. It must degrade gracefully when unset.
- **Constraints:** TypeScript throughout; Tailwind for styling; Vercel deployment (Vercel access to be provided later).

## Brand Commitments

- Name shown on the site: **Barad Badri**.
- No other logos, legal marks, or binding brand assets established yet.

## Evidence on Hand

- Resume PDF at `public/resume.pdf`. Work, education, skills and the three projects on the site come from it; keep them in sync with it.
- Still to come: project photos, guitar songs and videos, music/design interest copy.

- No real project content, testimonials, metrics, or copy provided yet; projects and any interest content start as placeholders Barad will supply. Discord user ID for the now-playing tile and Vercel access to be provided later. Future work must not invent these.

## Product Principles

1. **Brevity over brochure.** A visitor should grasp who Barad is in one short scan; cut anything that does not earn its place.
2. **Personality in specifics.** Memorability comes from a few precise, true details (now-playing music, interest subtabs), not decoration.
3. **Owned and coherent.** One consistent voice and design across every page; nothing that reads as a generic template.
4. **Honest content.** Placeholders stay visibly provisional; no fabricated projects, stats, or claims.
5. **Fast and resilient.** Lightweight pages; integrations (Spotify) degrade gracefully when unavailable.

## Accessibility & Inclusion

No product-specific standard established beyond general good practice: keyboard-navigable, respects `prefers-color-scheme` and `prefers-reduced-motion`, sufficient contrast.
