import type { Metadata } from "next";
import { Suspense } from "react";
import { FadeIn } from "@/components/FadeIn";
import { coverKey } from "@/components/InterestPanel";
import { SubTabs } from "@/components/SubTabs";
import { interests } from "@/data/interests";
import { getCover, type CoverInfo } from "@/lib/spotify";

export const metadata: Metadata = {
  title: "Interests",
};

async function Tabs() {
  const covers: Record<string, CoverInfo | null> = {};
  await Promise.all(
    interests
      .flatMap((i) => i.rows ?? [])
      .flatMap((r) => (r.cover ? [r.cover] : []))
      .map(async (c) => {
        covers[coverKey(c)] = await getCover(c.kind, c.spotifyId);
      }),
  );
  return <SubTabs interests={interests} covers={covers} />;
}

export default function InterestsPage() {
  return (
    <div>
      <FadeIn>
        <h1 className="text-3xl font-medium">Interests</h1>
      </FadeIn>
      <FadeIn delay={80}>
        <Suspense fallback={<SubTabs interests={interests} covers={{}} />}>
          <Tabs />
        </Suspense>
      </FadeIn>
    </div>
  );
}
