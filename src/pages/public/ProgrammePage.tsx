import { useMemo } from "react";
import { PageHero } from "../../components/public/PageHero";
import { PublicEventGate } from "../../components/public/PublicEventGate";
import { ProgrammeSchedule } from "../../components/programme/ProgrammeSchedule";
import { engagementToPublicProgramme } from "../../lib/publicEvent";
import { usePublicEngagement } from "../../hooks/usePublicEngagement";

/** Programme — content from the public engagement API. */
export function ProgrammePage() {
  const { engagement } = usePublicEngagement();
  const programme = useMemo(() => engagementToPublicProgramme(engagement), [engagement]);
  const eventName = engagement?.engagementName?.trim() || "Event";

  return (
    <PublicEventGate>
      <div className="bg-white text-[#101827]">
        <PageHero
          title="Programme"
          subtitle={eventName}
          image="/assets/about-hero.png"
          imageAlt={`${eventName} programme`}
        />
        <ProgrammeSchedule programme={programme} />
      </div>
    </PublicEventGate>
  );
}
