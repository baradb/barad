/**
 * Projects, newest first. `current` is shown first on /projects under "Currently
 * working on" (and is peeked at on the About page); `projects` are the finished ones.
 *
 * Media: files live in public/projects/. Each project lists its photos and videos in
 * `media` (see src/data/media.ts for the shape and the rules), and the page lays them
 * out in one row at a shared height, uncropped. With no media, two empty photo slots show.
 */
import type { Media } from "@/data/media";

export type Project = {
  name: string;
  period: string;
  description: string;
  tools?: string[];
  highlights?: string[];
  href?: string;
  media?: Media[];
};

export const current: Project[] = [
  {
    name: "Autonomous Underwater Robot",
    period: "In progress",
    description:
      "As part of the Waterloo Underwater Technology Team, we're creating an autonomous underwater robot to compete in the MATE ROV competition.",
    media: [
      {
        type: "image",
        src: "/projects/wutt-clamp.jpg",
        alt: "A black 3D-printed clamp around a clear acrylic tube on a wooden workbench",
        width: 1200,
        height: 1600,
      },
      {
        type: "video",
        src: "/projects/wutt-video.mp4",
        poster: "/projects/wutt-video-poster.jpg",
        label: "Video of the underwater robot build in the workshop",
        width: 568,
        height: 320,
      },
    ],
  },
];

export const projects: Project[] = [
  {
    name: "Pinball Machine",
    period: "Dec 2025 – Jan 2026",
    description:
      "A fully functioning pinball machine with poppers, electronic obstacles and a working point system.",
    tools: ["AutoCAD", "SOLIDWORKS", "TinkerCAD"],
    highlights: [
      "Programmed an Arduino to drive solenoids, conductors and other components",
      "Built the frame and parts from scrap wood, scrap metal and 3D printing",
      "LEDs react to the ball's movement through the Arduino",
    ],
    media: [
      {
        type: "image",
        src: "/projects/pinball.jpg",
        alt: "The pinball machine in the dark, lit by rainbow LEDs, with solenoids, bumpers and flippers on the playfield",
        width: 1200,
        height: 1600,
      },
      {
        type: "video",
        src: "/projects/pinball-video.mp4",
        poster: "/projects/pinball-video-poster.jpg",
        label: "Video of the pinball machine prototype",
        width: 640,
        height: 488,
      },
    ],
  },
  {
    name: "High School Yearbook",
    period: "Sep 2025 – Jun 2026",
    description:
      "Led a team of 30 to create a yearbook that captures our school spirit.",
    tools: ["Photoshop", "Friesens CONNECTME"],
    highlights: [
      "Managed a $30,000 budget: labour allocation, financial planning and project execution alongside Friesens",
      "Delegated tasks across the team to meet deadlines",
    ],
    media: [
      {
        type: "image",
        src: "/projects/yearbook.jpg",
        alt: "The 2025–26 yearbook cover, titled Spiral Staircase, in orange, white and grey on charcoal",
        width: 1200,
        height: 1600,
      },
    ],
  },
];
