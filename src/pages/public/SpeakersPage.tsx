import { useMemo } from "react";
import { PageHero } from "../../components/public/PageHero";
import { PublicEventGate } from "../../components/public/PublicEventGate";
import { SpeakersDirectory } from "../../components/speakers/SpeakersDirectory";
import { engagementToPublicSpeakers } from "../../lib/publicEvent";
import { usePublicEngagement } from "../../hooks/usePublicEngagement";

const container =
  "mx-auto box-border w-[min(calc(100%-clamp(28px,5vw,80px)),1440px)] max-w-full max-[1200px]:w-[min(calc(100%-48px),1440px)] max-[640px]:w-[calc(100%-32px)] max-[380px]:!w-[calc(100%-24px)]";

/** Speakers — content from the public engagement API. */
export function SpeakersPage() {
  const { engagement } = usePublicEngagement();
  const speakers = useMemo(() => engagementToPublicSpeakers(engagement), [engagement]);
  const eventName = engagement?.engagementName?.trim() || "Event";

  return (
    <PublicEventGate>
      <div className="bg-white text-[#101620]">
        <PageHero
          title="Speakers"
          subtitle={eventName}
          image="/assets/speakers-hero.jpg"
          imageAlt={`${eventName} speakers`}
        />
        <div id="speakers">
          <SpeakersDirectory speakers={speakers} containerClassName={container} columns={4} />
        </div>
      </div>
    </PublicEventGate>
  );
}
