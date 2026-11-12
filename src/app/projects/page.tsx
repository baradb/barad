import type { Metadata } from "next";
import { FadeIn } from "@/components/FadeIn";
import { Icon } from "@/components/Icon";
import { PhotoSlot } from "@/components/Media";
import { current, projects, type Project } from "@/data/projects";

export const metadata: Metadata = {
  title: "Projects",
};

function ProjectList({ items, delay }: { items: Project[]; delay: number }) {
  return (
    <div className="space-y-14">
      {items.map((project, i) => {
        const images = project.images ?? [];
        return (
          <FadeIn key={project.name} delay={delay + Math.min(i, 5) * 60}>
            <article>
              {images.length === 1 ? (
                <PhotoSlot
                  image={images[0]}
                  ratio="aspect-[2/1]"
                  sizes="(min-width: 672px) 672px, 100vw"
                />
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {images.length === 0 ? (
                    <>
                      <PhotoSlot />
                      <PhotoSlot />
                    </>
                  ) : (
                    images.map((image) => <PhotoSlot key={image.src} image={image} />)
                  )}
                </div>
              )}

              <div className="mt-5 flex items-baseline justify-between gap-6">
                <h3 className="text-xl font-medium">{project.name}</h3>
                <span className="shrink-0 text-sm tabular-nums text-faint">
                  {project.period}
                </span>
              </div>
              <p className="mt-2 max-w-[52ch] text-base leading-7 text-foreground">
                {project.description}
              </p>
              {project.tools && project.tools.length > 0 && (
                <p className="mt-2 text-sm text-faint">{project.tools.join(" · ")}</p>
              )}
              {project.highlights && project.highlights.length > 0 && (
                <ul className="mt-4 max-w-[52ch] list-disc space-y-1 pl-5 text-sm leading-6 text-muted marker:text-faint">
                  {project.highlights.map((h) => (
                    <li key={h}>{h}</li>
                  ))}
                </ul>
              )}
              {project.href && (
                <a
                  href={project.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex min-h-11 items-center gap-1.5 text-sm font-medium text-accent underline-offset-4 hover:underline"
                >
                  View project
                  <Icon name="arrow-up-right" />
                  <span className="sr-only">(opens in a new tab)</span>
                </a>
              )}
            </article>
          </FadeIn>
        );
      })}
    </div>
  );
}

export default function ProjectsPage() {
  return (
    <div>
      <FadeIn>
        <h1 className="text-3xl font-medium">Projects</h1>
      </FadeIn>

      <section className="mt-10">
        <h2 className="sr-only">Finished projects</h2>
        <ProjectList items={projects} delay={80} />
      </section>

      {current.length > 0 && (
        <section className="mt-20">
          <FadeIn delay={160}>
            <h2 className="text-3xl font-medium">Currently working on</h2>
          </FadeIn>
          <div className="mt-10">
            <ProjectList items={current} delay={200} />
          </div>
        </section>
      )}
    </div>
  );
}
