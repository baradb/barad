/** Work experience, from the resume (public/resume.pdf), in the order shown on the site. */
export type Entry = {
  title: string;
  org: string;
  location: string;
  period: string;
  summary?: string;
  highlights?: string[];
};

export const work: Entry[] = [
  {
    title: "Architectural Assistant",
    org: "ArchiFad Architecture and Interior Design",
    location: "Aurora, ON",
    period: "Jan 2025 – Jun 2025",
    highlights: [
      "Created mechanical designs and floor plans in AutoCAD, SOLIDWORKS and Fusion 360",
      "Researched the materials, components and tools needed to prototype designs",
      "Communicated with clients to make sure designs met their expectations",
    ],
  },
  {
    title: "Chef",
    org: "Shoeless Joes",
    location: "Richmond Hill, ON",
    period: "Apr 2026 – Sep 2026",
    highlights: [
      "Worked alongside a kitchen brigade to create dishes and keep food quality high for customers",
      "Prepared, handled and stored food",
    ],
  },
];
