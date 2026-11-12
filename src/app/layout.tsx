import type { Metadata, Viewport } from "next";
import { Instrument_Sans } from "next/font/google";
import "./globals.css";
import { AsciiField } from "@/components/AsciiField";
import { Header } from "@/components/Header";
import { NowPlaying } from "@/components/NowPlaying";
import { site } from "@/data/site";

const instrument = Instrument_Sans({
  variable: "--font-instrument",
  subsets: ["latin"],
});


export const viewport: Viewport = {
  viewportFit: "cover",
  themeColor: "#e4e5fb", // keep in sync with --background in globals.css
};

export const metadata: Metadata = {
  title: { default: site.name, template: `%s · ${site.name}` },
  description: `${site.name}: projects and interests.`,
  openGraph: {
    title: site.name,
    description: `${site.name}: projects and interests.`,
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${instrument.variable} h-full`}
    >
      <body className="flex min-h-full flex-col">
        <a
          href="#main"
          className="sr-only rounded-lg bg-accent px-4 py-2 text-sm font-medium text-on-accent focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50"
        >
          Skip to content
        </a>
        <AsciiField />
        <div className="w-full px-6 sm:px-8">
          <div className="mx-auto w-full max-w-2xl">
            <Header />
            <main id="main" className="pb-16 sm:pb-32">{children}</main>
          </div>
        </div>
        <NowPlaying />
      </body>
    </html>
  );
}
