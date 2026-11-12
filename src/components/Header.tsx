"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { TabGroup, TabLabel, useTabHover } from "@/components/tabs";
import { TypedName } from "@/components/TypedName";
import { site } from "@/data/site";

const links = [
  { href: "/", label: "About", also: [] as string[] },
  { href: "/experience", label: "Experience", also: ["/resume"] },
  { href: "/projects", label: "Projects", also: [] as string[] },
  { href: "/interests", label: "Interests", also: [] as string[] },
];

function NavLink({
  href,
  label,
  index,
  active,
}: {
  href: string;
  label: string;
  index: number;
  active: boolean;
}) {
  const hover = useTabHover(index);
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      {...hover}
      className="group inline-flex min-h-11 items-center rounded-lg px-3"
    >
      <TabLabel index={index} selected={active}>
        {label}
      </TabLabel>
    </Link>
  );
}

/** The name (types itself on first load) plus the site nav. */
export function Header() {
  const pathname = usePathname();
  // -1 (no tab) on pages outside the nav, such as the 404 page.
  const selected = links.findIndex((l) =>
    l.href === "/"
      ? pathname === "/"
      : [l.href, ...l.also].some((h) => pathname.startsWith(h)),
  );

  return (
    <header className="pt-10 pb-12 sm:pt-14">
      <Link
        href="/"
        aria-label={`${site.name}, home`}
        className="inline-block rounded-lg"
      >
        <span className="block text-[2.5rem] leading-[1.1] font-medium tracking-[-0.02em] sm:text-7xl sm:tracking-[-0.03em]">
          <TypedName text={site.name} />
        </span>
      </Link>

      <nav aria-label="Primary" className="mt-3">
        <TabGroup selected={selected} className="-ml-3 flex w-fit flex-wrap text-sm font-medium">
          {links.map((link, i) => (
            <NavLink
              key={link.href}
              href={link.href}
              label={link.label}
              index={i}
              active={i === selected}
            />
          ))}
        </TabGroup>
      </nav>
    </header>
  );
}
