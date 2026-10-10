import {
  Bus,
  Globe2,
  MapPin,
  Shield,
  Users,
  Wifi,
} from "lucide-react";
import { PageHero } from "../../components/public/PageHero";
import { cn } from "../../lib/cn";

const benefits = [
  {
    icon: MapPin,
    filled: true,
    title: "Central Location",
    text: (
      <>
        In the heart of
        <br />
        Nairobi CBD
      </>
    ),
  },
  {
    icon: Users,
    title: "World-Class Facilities",
    text: (
      <>
        Modern conference
        <br />
        and exhibition spaces
      </>
    ),
  },
  {
    icon: Shield,
    title: "Secure & Accessible",
    text: (
      <>
        High security and
        <br />
        easy access
      </>
    ),
  },
  {
    icon: Wifi,
    title: "Modern Amenities",
    text: (
      <>
        High-speed internet
        <br />
        and full support services
      </>
    ),
  },
  {
    icon: Bus,
    title: "Convenient Access",
    text: (
      <>
        Close to major hotels
        <br />
        and transport links
      </>
    ),
  },
] as const;

const spaces = [
  {
    name: "Plenary Hall",
    text: "Main hall for opening, closing and high-level plenary sessions.",
    capacity: "Capacity: 1,000+ delegates",
    image: "/assets/venue-plenary-hall.jpg",
    alt: "KICC Plenary Hall",
  },
  {
    name: "Breakout Rooms",
    text: "Parallel thematic sessions and workshops.",
    capacity: "Capacity: 100 – 300 delegates",
    image: "/assets/venue-breakout-rooms.jpg",
    alt: "KICC Breakout Rooms",
  },
  {
    name: "Exhibition Area",
    text: "Showcase innovations, solutions and services.",
    capacity: "Capacity: 50+ exhibitors",
    image: "/assets/venue-exhibition-area.jpg",
    alt: "KICC Exhibition Area",
  },
  {
    name: "Meeting Rooms",
    text: "Bilateral meetings and side events.",
    capacity: "Capacity: 20 – 50 delegates",
    image: "/assets/venue-meeting-rooms.jpg",
    alt: "KICC Meeting Rooms",
  },
] as const;

const container =
  "mx-auto box-border w-[min(calc(100%-clamp(28px,5vw,80px)),1440px)] max-w-full max-[1200px]:w-[min(calc(100%-48px),1440px)] max-[640px]:w-[calc(100%-32px)] max-[380px]:!w-[calc(100%-24px)]";

const arrow = "text-[23px] font-normal leading-none";
const btn =
  "inline-flex min-h-[39px] items-center justify-center gap-3 rounded-md border border-[#075fd8] bg-white px-5 text-[13px] font-bold text-[#075fd8] transition-all duration-200 ease-[ease] hover:-translate-y-px hover:bg-[#f3f8ff]";
const aboutP =
  "max-w-[420px] text-[13.5px] leading-[1.28] text-[#344256] max-[960px]:max-w-[700px] max-[640px]:text-xs max-[640px]:leading-[1.34]";

/** Venue — Tailwind port of isippe3-venue-pure-html-responsive */
export function VenuePage() {
  return (
    <div className="bg-white text-[#101620]">

      <PageHero
        eyebrow="Venue"
        title={
          <>
            PrideInn Flamingo
            <br />
            Mombasa, Kenya
          </>
        }
        description="ISIPPE 2026 will be held at PrideInn Flamingo Beach Resort & Spa in Mombasa, Kenya, offering a scenic beachfront setting for the International Symposium on Intellectual Property Protection and Enforcement."
        image="/assets/venue-hero.jpg"
        imageAlt="PrideInn Flamingo Beach Resort & Spa in Mombasa, Kenya"
        combinedLocation
      />

      <section className="pb-[17px] pt-[15px] max-[640px]:pb-[15px] max-[640px]:pt-2.5" id="venue">
        <div
          className={cn(
            container,
            "grid min-h-[122px] grid-cols-[repeat(5,1fr)] overflow-hidden rounded-lg border border-[#dce8f3] bg-[linear-gradient(110deg,#f4f9ff,#eef6fd)]",
            "max-[960px]:grid-cols-[repeat(5,minmax(190px,1fr))] max-[960px]:overflow-x-auto max-[960px]:[scrollbar-width:none] max-[960px]:[&::-webkit-scrollbar]:hidden",
            "max-[640px]:min-h-0 max-[640px]:grid-cols-[1fr_1fr] max-[640px]:overflow-visible",
          )}
        >
          {benefits.map((item) => (
            <article
              key={item.title}
              className="flex flex-col justify-center border-[rgba(207,222,236,0.55)] px-[22px] py-4 [&:not(:last-child)]:border-r max-[1200px]:px-[15px] max-[960px]:min-w-[190px] max-[640px]:min-w-0 max-[640px]:border-b max-[640px]:border-r max-[640px]:px-3 max-[640px]:py-[15px] max-[640px]:[&:nth-child(5)]:col-span-full max-[640px]:[&:nth-child(n+3)]:border-b-0"
            >
              <div className="mb-2 h-[39px] w-[39px] text-[#075fd8] max-[640px]:mb-1.5 max-[640px]:h-[34px] max-[640px]:w-[34px] [&_svg]:block [&_svg]:h-[39px] [&_svg]:w-[39px] max-[640px]:[&_svg]:h-[34px] max-[640px]:[&_svg]:w-[34px]">
                {"filled" in item && item.filled ? (
                  <item.icon size={39} strokeWidth={0} fill="currentColor" />
                ) : (
                  <item.icon size={39} strokeWidth={1.7} />
                )}
              </div>
              <h3 className="mb-1 text-[12.5px] font-extrabold leading-[1.1] text-[#101620] max-[640px]:text-[10.5px]">
                {item.title}
              </h3>
              <p className="text-[11.5px] leading-[1.3] text-[#45536a] max-[640px]:text-[9.5px]">
                {item.text}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="pb-[17px] max-[640px]:pb-[18px]" id="about-kicc">
        <div
          className={cn(
            container,
            "grid grid-cols-[35%_65%] items-start gap-0 max-[960px]:grid-cols-1 max-[960px]:gap-[15px]",
          )}
        >

          <div className="pr-[30px] max-[960px]:pr-0">
            <h2 className="mb-[7px] text-[22px] font-black leading-none tracking-[-0.7px] text-[#101620] max-[640px]:text-[23px]">
              About PrideInn Flamingo
            </h2>
            <p className={aboutP}>
              PrideInn Flamingo Beach Resort & Spa, located along the beautiful
              shores of Shanzu in Mombasa, Kenya, offers a scenic coastal setting
              for conferences, professional gatherings and international delegates.
            </p>
            <p className={cn(aboutP, "mt-[7px]")}>
              With its beachfront location, resort facilities and welcoming
              atmosphere, PrideInn Flamingo provides an inspiring venue for ISIPPE
              2026 — the International Symposium on Intellectual Property Protection
              and Enforcement.
            </p>
            <a
              className={cn(btn, "mt-3")}
              href="https://www.prideinn.co.ke/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Globe2 size={18} strokeWidth={2} />
              Visit PrideInn Website{" "}
              <span className={arrow} aria-hidden>
                →
              </span>
            </a>
          </div>

          <div className="relative h-[178px] overflow-hidden rounded-[7px] border border-[#e3e8ee] bg-[#eef2f6] max-[960px]:h-[230px] max-[640px]:h-[205px]">
            <img className="block h-full w-full object-cover" src="/assets/venue-map.jpg" alt="Map showing KICC in Nairobi" />
            <a
              className="absolute right-[11px] top-[9px] z-[3] inline-flex h-[34px] items-center gap-2.5 rounded-md border border-[#075fd8] bg-white px-3 text-[11px] font-bold text-[#075fd8]"
              href="https://maps.google.com/?q=PrideInn+Flamingo+Beach+Resort+%26+Spa+Mombasa+Kenya" 
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
                ISIPPE-3 will utilise multiple spaces at KICC to deliver an engaging and seamless
                experience.
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
            {spaces.map((space) => (
              <article
                key={space.name}
                className="overflow-hidden rounded-[7px] border border-[#e2e8ee] bg-white max-[640px]:grid max-[640px]:min-h-[94px] max-[640px]:grid-cols-[100px_1fr]"
              >
                <img
                  className="block h-[91px] w-full object-cover max-[640px]:h-full max-[640px]:min-h-[94px] max-[640px]:w-[100px]"
                  src={space.image}
                  alt={space.alt}
                />
                <div className="px-3 pb-[11px] pt-2 max-[640px]:px-[11px] max-[640px]:py-2.5">
                  <h3 className="mb-[3px] text-[13px] font-extrabold leading-[1.1] text-[#101620] max-[640px]:text-xs">
                    {space.name}
                  </h3>
                  <p className="min-h-[31px] text-[11px] leading-[1.18] text-[#4d5967] max-[640px]:min-h-0 max-[640px]:text-[10px]">
                    {space.text}
                  </p>
                  <div className="mt-[7px] flex items-center gap-[7px] text-[10.5px] text-[#3e4b60] max-[640px]:mt-[5px] max-[640px]:text-[9.5px] [&_svg]:h-[19px] [&_svg]:w-[19px] [&_svg]:shrink-0 [&_svg]:text-[#075fd8]">
                    <Users size={19} strokeWidth={0} fill="currentColor" />
                    {space.capacity}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
