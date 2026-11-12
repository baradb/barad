/**
 * Projects, from the resume (public/resume.pdf). Newest first.
 *
 * Photos: put image files in public/projects/ and list them in `images`, e.g.
 *   images: [{ src: "/projects/pinball-1.jpg", alt: "The pinball machine, lit up" }]
 * With no images, the project shows two empty photo slots. `href` is optional; set
 * it only to a real URL.
 */
export type ProjectImage = { src: string; alt: string };

export type Project = {
  name: string;
  period: string;
  description: string;
  tools?: string[];
  highlights?: string[];
  href?: string;
  images?: ProjectImage[];
};

export const projects: Project[] = [
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
  },
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
  },
];

/**
 * Shown under "Currently working on" on /projects. Same shape as above. Delete the
 * array's contents to hide that part of the page.
 */
export const current: Project[] = [
  {
    name: "Project name",
    period: "In progress",
    description: "Placeholder. What you're building right now.",
  },
];
