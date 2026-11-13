import Link from "next/link";
import { CopyEmail } from "@/components/CopyEmail";
import { FadeIn } from "@/components/FadeIn";
import { Icon } from "@/components/Icon";
import { current } from "@/data/projects";
import { site } from "@/data/site";

const quietLink =
  "group inline-flex min-h-11 items-center gap-2 rounded-lg text-sm font-medium text-muted transition-colors hover:text-foreground focus-visible:text-foreground";

// The label slides open on hover or keyboard focus; collapsed to just the icon otherwise.
const slideLabel =
  "max-w-0 overflow-hidden whitespace-nowrap opacity-0 transition-[max-width,opacity] duration-300 ease-out group-hover:max-w-[12rem] group-hover:opacity-100 group-focus-visible:max-w-[12rem] group-focus-visible:opacity-100 motion-reduce:transition-none";

export default function Home() {
  const now = current[0];

  return (
    <div>
      <h1 className="sr-only">{site.name}</h1>

      <FadeIn delay={750} intro>
        <p className="text-2xl leading-tight font-medium text-foreground sm:text-3xl">
          {site.tagline}
        </p>
        <p className="mt-2 text-base leading-6 text-muted">{site.status}</p>
      </FadeIn>

      <FadeIn delay={850} intro>
        <div className="mt-10 flex flex-wrap items-center gap-x-5 gap-y-1">
          {/* pr is smaller than pl: the trailing arrow's mass sits right, so this centres it optically. */}
          <Link
            href="/projects"
            className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-accent pr-3.5 pl-4 text-sm font-medium text-on-accent transition-[background-color,transform] duration-150 hover:bg-accent-hover active:scale-[0.98]"
          >
            See projects
            <Icon name="arrow-up-right" />
          </Link>
          <Link href="/resume" className={quietLink} aria-label="Resume">
            <Icon name="file-text" />
            <span className={slideLabel}>Resume</span>
          </Link>
          <a
            href={site.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className={quietLink}
            aria-label="LinkedIn (opens in a new tab)"
          >
            <Icon name="linkedin" />
            <span className={slideLabel}>LinkedIn</span>
          </a>
          <a
            href={site.discord}
            target="_blank"
            rel="noopener noreferrer"
            className={quietLink}
            aria-label="Discord (opens in a new tab)"
          >
            <Icon name="discord" />
            <span className={slideLabel}>Discord</span>
          </a>
          {site.email && (
            <CopyEmail email={site.email} className={quietLink} labelClassName={slideLabel} />
          )}
        </div>
      </FadeIn>

      {now && (
        <FadeIn delay={950} intro>
          <Link href="/projects" className="group mt-12 block max-w-[52ch] rounded-lg py-1">
            <p className="text-base leading-6">
              <span className="text-faint">currently working on</span>{" "}
              <span className="font-medium text-foreground underline-offset-4 group-hover:underline">
                {now.name}
              </span>
              <Icon
                name="arrow-up-right"
                className="ml-1 inline text-faint transition-colors group-hover:text-accent"
              />
            </p>
            <p className="mt-1 text-sm leading-6 text-muted">{now.description}</p>
          </Link>
        </FadeIn>
      )}
    </div>
  );
}
