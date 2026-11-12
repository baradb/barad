import { existsSync } from "node:fs";
import path from "node:path";
import type { Metadata } from "next";
import Image from "next/image";
import { FadeIn } from "@/components/FadeIn";
import { Icon } from "@/components/Icon";
import { site } from "@/data/site";

export const metadata: Metadata = {
  title: "Resume",
};

const inPublic = (url: string) =>
  existsSync(path.join(process.cwd(), "public", url.replace(/^\//, "")));

export default function ResumePage() {
  // Checked on the server so the page can say plainly what is missing.
  const hasPdf = inPublic(site.resume);
  const hasImage = inPublic(site.resumeImage.src);

  return (
    <div>
      <FadeIn>
        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2">
          <h1 className="text-3xl font-medium">Resume</h1>
          {hasPdf && (
            <a
              href={site.resume}
              download="Barad_Badri_Resume.pdf"
              className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-accent px-4 text-sm font-medium text-on-accent transition-[background-color,transform] duration-150 hover:bg-accent-hover active:scale-[0.98]"
            >
              <Icon name="download" />
              Download PDF
            </a>
          )}
        </div>
      </FadeIn>

      <FadeIn delay={80}>
        {hasImage ? (
          <div className="mt-6 overflow-hidden rounded-xl border border-rule bg-white shadow-[0_6px_20px_-8px_var(--shadow)]">
            <Image
              src={site.resumeImage.src}
              width={site.resumeImage.width}
              height={site.resumeImage.height}
              alt="Barad Badri's resume: education at the University of Waterloo, work experience, projects and technical skills. Download the PDF for text you can select."
              sizes="(min-width: 672px) 672px, 100vw"
              priority
              className="h-auto w-full"
            />
          </div>
        ) : hasPdf ? (
          <p className="mt-6 max-w-[52ch] text-base leading-7 text-muted">
            Use the button above to download the resume.
          </p>
        ) : (
          <p className="mt-6 max-w-[52ch] text-base leading-7 text-muted">
            The resume isn&apos;t posted yet.
          </p>
        )}
      </FadeIn>
    </div>
  );
}
