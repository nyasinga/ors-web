import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { PageHero } from "../../components/public/PageHero";
import { PublicEventGate } from "../../components/public/PublicEventGate";
import { SpeakerCardGrid } from "../../components/speakers/SpeakerCard";
import type { SpeakerCategory } from "../../data/publicContent";
import { cn } from "../../lib/cn";
import { engagementToPublicSpeakers } from "../../lib/publicEvent";
import { usePublicEngagement } from "../../hooks/usePublicEngagement";

const filters: { id: "all" | SpeakerCategory; label: string }[] = [
  { id: "all", label: "All Speakers" },
  { id: "keynote", label: "Keynote Speakers" },
  { id: "panelist", label: "Panelists" },
  { id: "moderator", label: "Moderators" },
  { id: "government", label: "Government Representatives" },
];

const container =
  "mx-auto box-border w-[min(calc(100%-clamp(28px,5vw,80px)),1440px)] max-w-full max-[1200px]:w-[min(calc(100%-48px),1440px)] max-[640px]:w-[calc(100%-32px)] max-[380px]:!w-[calc(100%-24px)]";

/** Speakers — content from the public engagement API. */
export function SpeakersPage() {
  const { engagement } = usePublicEngagement();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<(typeof filters)[number]["id"]>("all");

  const speakers = useMemo(() => engagementToPublicSpeakers(engagement), [engagement]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return speakers.filter((s) => {
      const matchFilter = filter === "all" || s.category === filter;
      const haystack = `${s.name} ${s.org} ${s.role} ${s.country}`.toLowerCase();
      return matchFilter && (!q || haystack.includes(q));
    });
  }, [speakers, query, filter]);

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

      <section className="pb-3 pt-[17px] max-[640px]:pt-3" id="speakers">
        <div className={container}>
          <div className="flex items-center gap-2.5 max-[960px]:flex-wrap max-[640px]:grid max-[640px]:grid-cols-[1fr_1fr] max-[640px]:gap-[7px]">
            {filters.map((f, idx) => {
              const count =
                f.id === "all"
                  ? speakers.length
                  : speakers.filter((s) => s.category === f.id).length;
              return (
                <button
                  key={f.id}
                  type="button"
                  className={cn(
                    "min-h-[38px] cursor-pointer whitespace-nowrap rounded-md border px-[17px] text-xs max-[640px]:w-full max-[640px]:whitespace-normal max-[640px]:px-[7px] max-[640px]:text-[10px]",
                    filter === f.id
                      ? "border-[#075fd8] bg-[#075fd8] font-bold text-white"
                      : "border-[#d7e2ef] bg-white font-medium text-[#203250]",
                    idx === 0 && "max-[640px]:col-span-full",
                  )}
                  onClick={() => setFilter(f.id)}
                >
                  {f.label} ({count})
                </button>
              );
            })}
            <label className="ml-auto flex h-[38px] w-[223px] items-center gap-[9px] rounded-md border border-[#d7e2ef] bg-white px-[11px] max-[640px]:col-span-full max-[640px]:m-0 max-[640px]:w-full [&_svg]:h-[18px] [&_svg]:w-[18px] [&_svg]:flex-[0_0_18px] [&_svg]:text-[#42516a]">
              <Search size={18} strokeWidth={2} aria-hidden />
              <span className="sr-only">Search speakers</span>
              <input
                className="w-full border-0 bg-transparent text-[11px] text-[#42516a] outline-none"
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search speakers..."
              />
            </label>
          </div>
        </div>
      </section>

      <section className="pb-[30px]">
        <div className={container}>
          <SpeakerCardGrid
            speakers={filtered}
            columns={4}
            emptyMessage={
              speakers.length
                ? "No speakers match your search."
                : "No speakers have been published for this event yet."
            }
          />
        </div>
      </section>
    </div>
    </PublicEventGate>
  );
}
