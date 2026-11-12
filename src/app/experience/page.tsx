import type { Metadata } from "next";
import Link from "next/link";
import { FadeIn } from "@/components/FadeIn";
import { Icon } from "@/components/Icon";
import { work } from "@/data/experience";

export const metadata: Metadata = {
  title: "Experience",
};

export default function ExperiencePage() {
  return (
    <div>
      <FadeIn>
        <div className="flex flex-wrap items-baseline justify-between gap-x-6">
          <h1 className="text-3xl font-medium">Experience</h1>
          <Link
            href="/resume"
            className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-accent underline-offset-4 hover:underline"
          >
            <Icon name="file-text" />
            View resume
          </Link>
        </div>
      </FadeIn>

      <ol className="mt-6 divide-y divide-rule border-y border-rule">
        {work.map((entry, i) => (
          <li key={`${entry.org}-${entry.period}`}>
            <FadeIn delay={80 + Math.min(i, 5) * 60}>
              <div className="grid gap-x-8 gap-y-2 py-8 sm:grid-cols-[9rem_1fr]">
                <p className="text-sm tabular-nums text-faint">{entry.period}</p>
                <div>
                  <h2 className="text-lg font-medium">{entry.title}</h2>
                  <p className="text-base text-muted">
                    {entry.org} · {entry.location}
                  </p>
                  {entry.summary && (
                    <p className="mt-3 max-w-[52ch] text-base leading-7 text-foreground">
                      {entry.summary}
                    </p>
                  )}
                  {entry.highlights && entry.highlights.length > 0 && (
                    <ul className="mt-3 max-w-[52ch] list-disc space-y-1 pl-5 text-sm leading-6 text-muted marker:text-faint">
                      {entry.highlights.map((h) => (
                        <li key={h}>{h}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </FadeIn>
          </li>
        ))}
      </ol>
    </div>
  );
}
