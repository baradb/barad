import Link from "next/link";

export default function NotFound() {
  return (
    <div>
      <h1 className="text-3xl font-medium">Page not found</h1>
      <p className="mt-3 max-w-[52ch] text-base leading-7 text-muted">
        That address doesn&apos;t lead anywhere on this site.
      </p>
      <Link
        href="/"
        className="mt-6 inline-flex min-h-11 items-center rounded-lg bg-accent px-4 text-sm font-medium text-on-accent transition-colors hover:bg-accent-hover"
      >
        Back to the start
      </Link>
    </div>
  );
}
