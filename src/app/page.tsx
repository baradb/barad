import Link from "next/link";
import { CopyEmail } from "@/components/CopyEmail";
import { FadeIn } from "@/components/FadeIn";
import { Icon } from "@/components/Icon";
import { site } from "@/data/site";

const quietLink =
  "inline-flex min-h-11 items-center gap-2 text-sm font-medium text-muted underline-offset-4 transition-colors hover:text-foreground hover:underline";

export default function Home() {
  return (
    <div>
      <h1 className="sr-only">{site.name}</h1>

      <FadeIn delay={750}>
        <p className="text-2xl leading-tight font-medium text-foreground sm:text-3xl">
          {site.tagline}
        </p>
        <p className="mt-2 text-base leading-6 text-muted">{site.status}</p>
      </FadeIn>

      <FadeIn delay={850}>
        <div className="mt-10 flex flex-wrap items-center gap-x-5 gap-y-1">
          {/* pr is smaller than pl: the trailing arrow's mass sits right, so this centres it optically. */}
          <Link
            href="/projects"
            className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-accent pr-3.5 pl-4 text-sm font-medium text-on-accent transition-[background-color,transform] duration-150 hover:bg-accent-hover active:scale-[0.98]"
          >
            See projects
            <Icon name="arrow-up-right" />
          </Link>
          <Link href="/resume" className={quietLink}>
            <Icon name="file-text" />
            Resume
          </Link>
          <a
            href={site.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className={quietLink}
          >
            <Icon name="linkedin" />
            LinkedIn
            <span className="sr-only">(opens in a new tab)</span>
          </a>
          {site.email && <CopyEmail email={site.email} className={quietLink} />}
        </div>
      </FadeIn>
    </div>
  );
}
