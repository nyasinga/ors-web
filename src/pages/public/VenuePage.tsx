import {
  Bus,
  Globe2,
  MapPin,
  Shield,
  Users,
  Wifi,
  type LucideIcon,
} from "lucide-react";
import { PageHero } from "../../components/public/PageHero";
import { usePublicEngagement } from "../../hooks/usePublicEngagement";
import { cn } from "../../lib/cn";
import { engagementToPublicVenue } from "../../lib/publicEvent";

const iconMap: Record<string, LucideIcon> = {
  MapPin,
  Users,
  Shield,
  Wifi,
  Bus,
  Globe2,
};

const container =
  "mx-auto box-border w-[min(calc(100%-clamp(28px,5vw,80px)),1440px)] max-w-full max-[1200px]:w-[min(calc(100%-48px),1440px)] max-[640px]:w-[calc(100%-32px)] max-[380px]:!w-[calc(100%-24px)]";

const arrow = "text-[23px] font-normal leading-none";
const btn =
  "inline-flex min-h-[39px] items-center justify-center gap-3 rounded-md border border-[#075fd8] bg-white px-5 text-[13px] font-bold text-[#075fd8] transition-all duration-200 ease-[ease] hover:-translate-y-px hover:bg-[#f3f8ff]";
const aboutP =
  "max-w-[420px] text-[13.5px] leading-[1.28] text-[#344256] max-[960px]:max-w-[700px] max-[640px]:text-xs max-[640px]:leading-[1.34]";

/** Venue — hero, highlights and spaces from the public engagement API. */
export function VenuePage() {
  const { engagement } = usePublicEngagement();
  const venue = engagementToPublicVenue(engagement);

  return (
    <div className="bg-white text-[#101620]">
      <PageHero
        eyebrow="Venue"
        title={
          <>
            {venue.titleLines[0]}
            <br />
            {venue.titleLines[1]}
          </>
        }
        description={venue.description}
        image="/assets/venue-hero.jpg"
        imageAlt={`${venue.name}, ${venue.city}`}
        combinedLocation
      />

      <section className="pb-[17px] pt-[15px] max-[640px]:pb-[15px] max-[640px]:pt-2.5" id="venue">
        <div
          className={cn(
            container,
            "grid min-h-[122px] overflow-hidden rounded-lg border border-[#dce8f3] bg-[linear-gradient(110deg,#f4f9ff,#eef6fd)]",
            venue.highlights.length >= 5
              ? "grid-cols-[repeat(5,1fr)] max-[960px]:grid-cols-[repeat(5,minmax(190px,1fr))]"
              : "grid-cols-[repeat(auto-fit,minmax(180px,1fr))]",
            "max-[960px]:overflow-x-auto max-[960px]:[scrollbar-width:none] max-[960px]:[&::-webkit-scrollbar]:hidden",
            "max-[640px]:min-h-0 max-[640px]:grid-cols-[1fr_1fr] max-[640px]:overflow-visible",
          )}
        >
          {venue.highlights.map((item, index) => {
            const Icon = iconMap[item.icon || ""] || MapPin;
            const filled = item.icon === "MapPin" || item.icon === "Users";
            return (
              <article
                key={item.id || item.title}
                className="flex flex-col justify-center border-[rgba(207,222,236,0.55)] px-[22px] py-4 [&:not(:last-child)]:border-r max-[1200px]:px-[15px] max-[960px]:min-w-[190px] max-[640px]:min-w-0 max-[640px]:border-b max-[640px]:border-r max-[640px]:px-3 max-[640px]:py-[15px] max-[640px]:[&:nth-child(5)]:col-span-full max-[640px]:[&:nth-child(n+3)]:border-b-0"
              >
                <div className="mb-2 h-[39px] w-[39px] text-[#075fd8] max-[640px]:mb-1.5 max-[640px]:h-[34px] max-[640px]:w-[34px] [&_svg]:block [&_svg]:h-[39px] [&_svg]:w-[39px] max-[640px]:[&_svg]:h-[34px] max-[640px]:[&_svg]:w-[34px]">
                  {filled || index === 0 ? (
                    <Icon size={39} strokeWidth={0} fill="currentColor" />
                  ) : (
                    <Icon size={39} strokeWidth={1.7} />
                  )}
                </div>
                <h3 className="mb-1 text-[12.5px] font-extrabold leading-[1.1] text-[#101620] max-[640px]:text-[10.5px]">
                  {item.title}
                </h3>
                <p className="text-[11.5px] leading-[1.3] text-[#45536a] max-[640px]:text-[9.5px] whitespace-pre-line">
                  {item.text}
                </p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="pb-[17px] max-[640px]:pb-[18px]" id="about-venue">
        <div
          className={cn(
            container,
            "grid grid-cols-[35%_65%] items-start gap-0 max-[960px]:grid-cols-1 max-[960px]:gap-[15px]",
          )}
        >
          <div className="pr-[30px] max-[960px]:pr-0">
            <h2 className="mb-[7px] text-[22px] font-black leading-none tracking-[-0.7px] text-[#101620] max-[640px]:text-[23px]">
              About {venue.shortName}
            </h2>
            {venue.aboutParagraphs.map((p) => (
              <p key={p.slice(0, 40)} className={cn(aboutP, "mt-[7px] first:mt-0")}>
                {p}
              </p>
            ))}
            <p className={cn(aboutP, "mt-[7px]")}>
              {venue.datesLabel} · {venue.modeLabel}
            </p>
            {venue.websiteUrl ? (
              <a
                className={cn(btn, "mt-3")}
                href={venue.websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Globe2 size={18} strokeWidth={2} />
                Visit venue website{" "}
                <span className={arrow} aria-hidden>
                  →
                </span>
              </a>
            ) : null}
          </div>

          <div className="relative h-[178px] overflow-hidden rounded-[7px] border border-[#e3e8ee] bg-[#eef2f6] max-[960px]:h-[230px] max-[640px]:h-[205px]">
            <img
              className="block h-full w-full object-cover"
              src="/assets/venue-map.jpg"
              alt={`Map showing ${venue.name}`}
            />
            <a
              className="absolute right-[11px] top-[9px] z-[3] inline-flex h-[34px] items-center gap-2.5 rounded-md border border-[#075fd8] bg-white px-3 text-[11px] font-bold text-[#075fd8]"
              href={venue.mapsUrl}
              target="_blank"
              rel="noreferrer"
            >
              View on Google Maps{" "}
              <span className={arrow} aria-hidden>
                →
              </span>
            </a>
          </div>
        </div>
      </section>

      <section className="pb-[30px]" id="spaces">
        <div className={container}>
          <div className="mb-2 flex items-end justify-between max-[640px]:items-center">
            <div>
              <div className="mb-2 flex h-[5px] w-[89px]" aria-hidden>
                <span className="block h-full w-1/2 bg-[#ed1c24]" />
                <span className="block h-full w-1/2 bg-[#08713f]" />
              </div>
              <h2 className="text-[21px] font-black leading-none text-[#101620] max-[640px]:text-[22px]">
                Venue Spaces
              </h2>
              <p className="mt-[3px] text-[13px] leading-[1.25] text-[#344256] max-[640px]:text-[11.5px]">
                Sessions and networking will use multiple spaces at {venue.shortName} for an
                engaging and seamless experience.
              </p>
            </div>
            <a className="hidden text-xs font-bold text-[#075fd8] max-[640px]:block" href="#spaces">
              See All{" "}
              <span className={arrow} aria-hidden>
                →
              </span>
            </a>
          </div>

          <div className="grid grid-cols-[repeat(4,1fr)] gap-3.5 max-[960px]:grid-cols-[repeat(2,1fr)] max-[640px]:grid-cols-[1fr] max-[640px]:gap-2.5">
            {venue.spaces.map((space) => (
              <article
                key={space.id || space.name}
                className="overflow-hidden rounded-[7px] border border-[#e2e8ee] bg-white max-[640px]:grid max-[640px]:min-h-[94px] max-[640px]:grid-cols-[100px_1fr]"
              >
                <img
                  className="block h-[91px] w-full object-cover max-[640px]:h-full max-[640px]:min-h-[94px] max-[640px]:w-[100px]"
                  src={space.image || "/assets/venue-meeting-rooms.jpg"}
                  alt={space.name}
                />
                <div className="px-3 pb-[11px] pt-2 max-[640px]:px-[11px] max-[640px]:py-2.5">
                  <h3 className="mb-[3px] text-[13px] font-extrabold leading-[1.1] text-[#101620] max-[640px]:text-xs">
                    {space.name}
                  </h3>
                  <p className="min-h-[31px] text-[11px] leading-[1.18] text-[#4d5967] max-[640px]:min-h-0 max-[640px]:text-[10px]">
                    {space.text}
                  </p>
                  {space.capacity ? (
                    <div className="mt-[7px] flex items-center gap-[7px] text-[10.5px] text-[#3e4b60] max-[640px]:mt-[5px] max-[640px]:text-[9.5px] [&_svg]:h-[19px] [&_svg]:w-[19px] [&_svg]:shrink-0 [&_svg]:text-[#075fd8]">
                      <Users size={19} strokeWidth={0} fill="currentColor" />
                      {space.capacity}
                    </div>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
