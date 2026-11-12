import { existsSync } from "node:fs";
import path from "node:path";
import type { Metadata } from "next";
import { FadeIn } from "@/components/FadeIn";
import { Icon } from "@/components/Icon";
import { site } from "@/data/site";

export const metadata: Metadata = {
  title: "Resume",
};

export default function ResumePage() {
  // Checked on the server so the page can say plainly when no PDF has been added.
  const available = existsSync(
    path.join(process.cwd(), "public", site.resume.replace(/^\//, "")),
  );

  return (
    <div>
      <FadeIn>
        <div className="flex flex-wrap items-baseline justify-between gap-x-6">
          <h1 className="text-3xl font-medium">Resume</h1>
          {available && (
            <a
              href={site.resume}
              download="Barad_Badri_Resume.pdf"
              className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-accent underline-offset-4 hover:underline"
            >
              <Icon name="download" />
              Download PDF
            </a>
          )}
        </div>
      </FadeIn>

      <FadeIn delay={80}>
        {available ? (
          <object
            data={`${site.resume}#view=FitH`}
            type="application/pdf"
            aria-label="Resume PDF"
            className="mt-4 h-[75vh] w-full rounded-xl border border-rule bg-surface"
          >
            <p className="p-6 text-base text-muted">
              Your browser can&apos;t show the PDF here.{" "}
              <a href={site.resume} className="text-accent underline underline-offset-4">
                Open it directly
              </a>
              .
            </p>
          </object>
        ) : (
          <p className="mt-6 max-w-[52ch] text-base leading-7 text-muted">
            The resume isn&apos;t posted yet.
          </p>
        )}
      </FadeIn>
    </div>
  );
}
