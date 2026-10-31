import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  AlertTriangle,
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Globe2,
  HeartPulse,
  Mail,
  MapPin,
  Phone,
  Plane,
  ShieldCheck,
  Ticket,
  Users,
} from "lucide-react";
import { PageHero } from "../../components/public/PageHero";
import { PublicEventGate } from "../../components/public/PublicEventGate";
import { cn } from "../../lib/cn";
import { usePublicEngagement } from "../../hooks/usePublicEngagement";

const tabs = [
  { id: "venue", label: "Venue", target: "venue" },
  { id: "accommodation", label: "Accommodation", target: "accommodation" },
  { id: "travel", label: "Travel Information", target: "travel" },
  { id: "health", label: "Health Advisory", target: "health" },
  { id: "registration", label: "Registration", target: "registration" },
  { id: "mombasa", label: "Discover Mombasa", target: "mombasa" },
] as const;

const container =
  "mx-auto box-border w-[min(calc(100%-clamp(28px,5vw,80px)),1440px)] max-w-full max-[1200px]:w-[min(calc(100%-48px),1440px)] max-[640px]:w-[calc(100%-32px)] max-[380px]:!w-[calc(100%-24px)]";

const sectionTitle =
  "mb-2 text-[28px] font-black tracking-[-.6px] text-[#10236f] max-[760px]:text-[24px]";
const sectionIntro =
  "mb-5 max-w-4xl text-[13px] leading-[1.6] text-[#52617c] max-[760px]:mb-4 max-[760px]:text-[12px]";
const card =
  "min-w-0 rounded-[8px] border border-[#e0e8f2] bg-white p-4 shadow-[0_2px_10px_rgba(16,35,111,0.035)] max-[640px]:p-3.5";
const mutedCard =
  "min-w-0 rounded-[8px] border border-[#dce7f4] bg-[#f5f9ff] p-4 max-[640px]:p-3.5";
const label =
  "text-[10px] font-extrabold uppercase tracking-[.09em] text-[#075fd8]";
const bodyText = "break-words text-[12px] leading-[1.6] text-[#53617a] max-[640px]:text-[11.5px]";
const linkClass =
  "font-bold text-[#075fd8] underline decoration-[#075fd8]/30 underline-offset-2 hover:decoration-[#075fd8]";

type Hotel = {
  name: string;
  proximity: string;
  contacts: string[];
  email?: string;
  website?: string;
  notes: string;
  rate?: string;
  featured?: boolean;
};

const hotels: Hotel[] = [
  {
    name: "Mombasa Continental Resort",
    proximity: "Serena Road, near Serena Hotel, Shanzu Beach. On site — symposium venue.",
    contacts: ["+254 703 076 000", "+254 734 433 433", "WhatsApp: +254 111 362 206"],
    email: "reservations@mombasacontinental.com",
    website: "https://mombasacontinental.com",
    notes: "Beachfront resort with 157 rooms.",
    rate: "From about USD 127–145 per night on booking platforms.",
  },
  {
    name: "PrideInn Flamingo Beach Resort & Spa",
    proximity: "Dolphin Road / Serena Road, Shanzu Beach. A few minutes’ drive.",
    contacts: ["Mobile: +254 709 837 000", "Central: +254 709 532 000"],
    email: "reservations@flamingobeach.co.ke",
    website: "https://prideinnhotels.com",
    notes:
      "4-star resort with 137 rooms, two outdoor pools, private beach and conference centre. Airport shuttle quoted at KES 4,500 per vehicle, one way.",
  },
  {
    name: "PrideInn Paradise Beach Resort, Convention Centre & Spa",
    proximity: "Serena Road, Shanzu Beach. A few minutes’ drive.",
    contacts: ["+254 709 532 000"],
    email: "callcentre@prideinn.co.ke",
    website: "https://prideinnhotels.com",
    notes: "Five-star leisure and conference resort of the same group as PrideInn Flamingo.",
  },
  {
    name: "Serena Beach Resort & Spa",
    proximity: "Serena Road, Shanzu Beach. A few minutes’ drive.",
    contacts: ["+254 732 125 000", "+254 733 584 500"],
    email: "mombasa@serenahotels.com",
    website: "https://serenahotels.com/serena-beach",
    notes: "Beachfront resort with spa; about 27 km from Moi International Airport.",
    rate: "From about USD 165 per night on booking platforms.",
  },
  {
    name: "Kilua Residences by CityBlue",
    proximity: "Shanzu Beach Road, Shanzu. A few minutes’ drive.",
    contacts: ["+254 790 500 900"],
    email: "reservations.kilua@citybluehotels.com",
    website: "https://citybluehotels.com",
    notes: "Apartment-style beach residences, suited to delegates who prefer self-contained units.",
    rate: "From about USD 100–150 per night on booking platforms.",
  },
  {
    name: "Sarova Whitesands Beach Resort & Spa",
    proximity: "Off Malindi Road, Bamburi Beach. Short drive south of the venue.",
    contacts: ["+254 709 111 000", "+254 719 022 000"],
    email: "centralreservations@sarovahotels.com",
    website: "https://sarovahotels.com/whitesands-mombasa",
    notes: "Large beachfront resort with 340 rooms.",
    rate: "Average of about USD 247 per night on booking platforms.",
  },
  {
    name: "Travellers Beach Hotel & Club",
    proximity: "Malindi Road, Bamburi. Short drive south of the venue.",
    contacts: ["+254 720 648 708", "+254 700 375 575"],
    email: "reservations@travellershtl.com",
    website: "https://travellersbeach.com",
    notes: "Beachfront hotel with a wide range of room options and 288 rooms.",
  },
  {
    name: "Voyager Beach Resort",
    proximity: "Mount Kenya Road, off Links Road, Nyali. About 10 km south of the venue.",
    contacts: ["+254 711 019 900", "+254 720 201 155"],
    email: "hml.reservations@heritagehotels.co.ke",
    website: "https://heritage-eastafrica.com",
    notes: "Beachfront resort closer to Mombasa town.",
    rate: "From about KES 21,200 per night on booking platforms.",
  },
];

function SectionHeading({
  eyebrow,
  title,
  children,
}: {
  eyebrow?: string;
  title: string;
  children?: ReactNode;
}) {
  return (
    <div className="mb-5">
      {eyebrow ? <p className={`${label} mb-1.5`}>{eyebrow}</p> : null}
      <h2 className={sectionTitle}>{title}</h2>
      {children}
    </div>
  );
}

function InfoPage() {
  const { engagement } = usePublicEngagement();

  // Read public event details directly from the LoopBack Engagement model.
  const eventName = engagement?.engagementName || "ISIPPE-3";
  const eventCode = engagement?.engagementCode || "ISIPPE-3";
  const venueName = engagement?.venue || "Mombasa Continental Resort";
  const venueAddress =
    engagement?.venueAddress || "Serena Road, Shanzu Beach, Mombasa";
  const venueCity = [engagement?.city, engagement?.country]
    .filter((value): value is string => Boolean(value?.trim()))
    .join(", ");
  const eventMode =
    engagement?.mode === "in-person" || (engagement?.mode as string) === "in_person"
      ? "In-person"
      : engagement?.mode
        ? engagement.mode.charAt(0).toUpperCase() + engagement.mode.slice(1)
        : "";
  const eventDates = useMemo(() => {
    if (!engagement?.startDate || !engagement?.endDate) return "";

    try {
      const formatter = new Intl.DateTimeFormat("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
        timeZone: engagement.timezone || "Africa/Nairobi",
      });
      const start = formatter.format(new Date(engagement.startDate));
      const end = formatter.format(new Date(engagement.endDate));
      return start === end ? start : `${start} – ${end}`;
    } catch {
      return "";
    }
  }, [engagement]);
  const heroImage =
    engagement?.bannerImage || engagement?.logo || "/assets/about-hero.png";
  const [activeTab, setActiveTab] =
    useState<(typeof tabs)[number]["id"]>("venue");

  const goToTab = (tab: (typeof tabs)[number]) => {
    setActiveTab(tab.id);
    document.getElementById(tab.target)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  useEffect(() => {
    const nodes = tabs
      .map((tab) => document.getElementById(tab.target))
      .filter((node): node is HTMLElement => Boolean(node));

    if (!nodes.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (!visible?.target?.id) return;
        const match = tabs.find((tab) => tab.target === visible.target.id);
        if (match) setActiveTab(match.id);
      },
      { rootMargin: "-25% 0px -60% 0px", threshold: [0.1, 0.25, 0.45] },
    );

    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, []);

  return (
    <PublicEventGate>
      <main className="w-full overflow-x-clip bg-white text-[#111a31]">
        <PageHero
          dark
          breadcrumb="Information"
          title={`${eventCode} Information`}
          description={
            engagement?.shortDescription ||
            `Everything you need to plan your participation at ${eventName}.`
          }
          image={heroImage}
          imageAlt={`${eventName} event banner`}
          combinedLocation
        />

        <nav
          className="sticky top-0 z-20 border-b border-[#dce4ee] bg-white/95 backdrop-blur"
          aria-label="Information sections"
        >
          <div
            className={cn(
              container,
              "flex min-h-[49px] min-w-0 items-center gap-[30px] overflow-x-auto overscroll-x-contain whitespace-nowrap [scrollbar-width:none] [&::-webkit-scrollbar]:hidden max-[900px]:gap-5 max-[760px]:min-h-[45px] max-[760px]:gap-5 max-[760px]:pr-2",
            )}
          >
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => goToTab(tab)}
                aria-current={activeTab === tab.id ? "location" : undefined}
                className={cn(
                  "relative min-h-[49px] shrink-0 whitespace-nowrap bg-transparent px-0 py-1 text-[11px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#075fd8] max-[760px]:min-h-[45px] max-[760px]:text-[11px]",
                  activeTab === tab.id
                    ? "font-extrabold text-[#075fd8] after:absolute after:inset-x-0 after:bottom-0 after:h-[3px] after:bg-[#075fd8] after:content-['']"
                    : "font-medium text-[#56627a] hover:text-[#075fd8]",
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </nav>

        <div className={`${container} py-8 max-[760px]:py-5`}>
          <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_260px] items-start gap-7 max-[1100px]:grid-cols-1 max-[640px]:gap-5">
            <div className="min-w-0 space-y-10 max-[760px]:space-y-8 max-[480px]:space-y-7">
              {/* Venue */}
              <section id="venue" className="scroll-mt-[80px] max-[760px]:scroll-mt-[60px]">
                <SectionHeading eyebrow="Your destination" title="Venue">
                  <p className={sectionIntro}>
                    {eventName} will be held at {venueName}
                    {venueAddress ? `, ${venueAddress}` : ""}
                    {venueCity ? `, ${venueCity}` : ""}. The venue is on
                    Mombasa’s North Coast, approximately 30 minutes by road
                    from Moi International Airport.
                  </p>
                </SectionHeading>
                <div className="grid min-w-0 grid-cols-[1.1fr_.9fr] gap-4 max-[760px]:grid-cols-1">
                  <div className={mutedCard}>
                    <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-[#075fd8]/10 text-[#075fd8]">
                      <MapPin size={21} />
                    </div>
                    <p className={label}>Symposium venue</p>
                    <h3 className="mt-1 text-[17px] font-extrabold text-[#10236f]">
                      {venueName}
                    </h3>
                    <p className={`${bodyText} mt-2`}>
                      {venueAddress}{venueCity ? `, ${venueCity}` : ""}
                    </p>
                    {eventDates ? (
                      <div className="mt-3 flex items-center gap-2 text-[11px] font-bold text-[#10236f]">
                        <CalendarDays size={14} className="text-[#075fd8]" />
                        {eventDates}
                      </div>
                    ) : null}
                    {eventMode ? (
                      <p className="mt-1 text-[10px] text-[#52617c]">{eventMode}</p>
                    ) : null}
                    <div className="mt-4 flex items-center gap-2 text-[11px] font-bold text-[#075fd8]">
                      <Clock3 size={15} />
                      Approximately 30 minutes from Moi International Airport
                    </div>
                    <a
                      className={`${linkClass} mt-4 inline-flex items-center gap-1 text-[11px]`}
                      href="https://mombasacontinental.com"
                      target="_blank"
                      rel="noreferrer"
                    >
                      Visit venue website <ArrowUpRight size={14} />
                    </a>
                  </div>
                  <div className="flex min-h-[205px] min-w-0 flex-col justify-between rounded-[8px] bg-[#10236f] p-5 text-white max-[640px]:min-h-[170px] max-[640px]:p-4">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[.12em] text-white/65">
                        Plan your arrival
                      </p>
                      <h3 className="mt-2 text-[21px] font-black leading-tight">
                        Welcome to the Kenyan Coast
                      </h3>
                    </div>
                    <p className="mt-5 text-[11px] leading-[1.5] text-white/80">
                      Allow sufficient time for your journey from the airport
                      and make your accommodation arrangements early.
                    </p>
                  </div>
                </div>
              </section>

              {/* Accommodation */}
              <section id="accommodation" className="scroll-mt-[80px] max-[760px]:scroll-mt-[60px]">
                <SectionHeading eyebrow="Where to stay" title="Accommodation">
                  <p className={sectionIntro}>
                    Delegates book and pay directly with the hotel of their
                    choice. When booking, please mention that you are attending
                    ISIPPE-3 and ask whether a conference rate is available.
                    November rooms are in high demand — early booking is
                    strongly advised.
                  </p>
                </SectionHeading>

                <div className="mb-4 flex items-start gap-3 rounded-[7px] border border-[#f0d7a8] bg-[#fff8eb] p-3.5">
                  <AlertTriangle className="mt-0.5 shrink-0 text-[#bd7600]" size={18} />
                  <p className="text-[11px] leading-[1.5] text-[#77531b]">
                    Accommodation is arranged independently by each delegate.
                    Contact the hotel directly to confirm availability, rates,
                    room type and any conference offer.
                  </p>
                </div>

                <div className="grid min-w-0 grid-cols-2 gap-3 max-[760px]:grid-cols-1">
                  {hotels.map((hotel, index) => {
                    const isEventVenue =
                      hotel.name.trim().toLowerCase() === venueName.trim().toLowerCase();
                    return (
                    <article
                      key={hotel.name}
                      className={cn(
                        card,
                        isEventVenue && "border-[#075fd8]/40 bg-[#f7faff]",
                      )}
                    >
                      <div className="mb-2 flex items-start justify-between gap-2">
                        <div>
                          {isEventVenue ? (
                            <span className="mb-1.5 inline-flex rounded-full bg-[#075fd8] px-2 py-1 text-[9px] font-extrabold uppercase tracking-wide text-white">
                              Symposium venue
                            </span>
                          ) : null}
                          <h3 className="break-words text-[14px] font-extrabold leading-snug text-[#10236f] max-[480px]:text-[13px]">
                            {hotel.name}
                          </h3>
                        </div>
                        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#e8f1ff] text-[10px] font-extrabold text-[#075fd8]">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                      </div>

                      <div className="mb-2 flex items-start gap-2">
                        <MapPin size={14} className="mt-0.5 shrink-0 text-[#075fd8]" />
                        <p className={bodyText}>{hotel.proximity}</p>
                      </div>
                      <p className={`${bodyText} mb-3`}>{hotel.notes}</p>

                      {hotel.rate ? (
                        <p className="mb-3 rounded-[5px] bg-[#f5f7fb] px-2.5 py-2 text-[10px] font-bold leading-[1.4] text-[#394966]">
                          Indicative rate: {hotel.rate}
                        </p>
                      ) : null}

                      <div className="space-y-1.5 border-t border-[#e8edf4] pt-3">
                        {hotel.contacts.map((contact) => (
                          <p
                            key={contact}
                            className="flex min-w-0 items-start gap-2 break-words text-[10px] leading-relaxed text-[#52617c]"
                          >
                            <Phone size={12} className="shrink-0 text-[#075fd8]" />
                            {contact}
                          </p>
                        ))}
                        {hotel.email ? (
                          <a
                            href={`mailto:${hotel.email}`}
                            className="flex items-center gap-2 break-all text-[10px] text-[#075fd8] no-underline hover:underline"
                          >
                            <Mail size={12} className="shrink-0" />
                            {hotel.email}
                          </a>
                        ) : null}
                        {hotel.website ? (
                          <a
                            href={hotel.website}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 pt-1 text-[10px] font-bold text-[#075fd8] no-underline hover:underline"
                          >
                            Hotel website <ArrowUpRight size={12} />
                          </a>
                        ) : null}
                      </div>
                    </article>
                    );
                  })}
                </div>
                <p className="mt-3 text-[10px] leading-[1.5] text-[#77839a]">
                  Rates shown are indicative prices observed on public booking
                  platforms on 23 October 2026. They are not negotiated
                  ISIPPE-3 rates and will vary with dates, room type and meal
                  plan. Please confirm directly with the hotel.
                </p>
              </section>

              {/* Travel */}
              <section id="travel" className="scroll-mt-[80px] max-[760px]:scroll-mt-[60px]">
                <SectionHeading eyebrow="Before you travel" title="Travel Information">
                  <p className={sectionIntro}>
                    Please review the arrival and entry information below as
                    you prepare for your trip to Mombasa.
                  </p>
                </SectionHeading>
                <div className="grid min-w-0 grid-cols-2 gap-3 max-[760px]:grid-cols-1">
                  <article className={card}>
                    <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-[#e8f1ff] text-[#075fd8]">
                      <Plane size={20} />
                    </div>
                    <h3 className="mb-2 text-[14px] font-extrabold text-[#10236f]">
                      Arrival in Mombasa
                    </h3>
                    <p className={bodyText}>
                      Moi International Airport, Mombasa, is about 30 minutes
                      by road from the venue.
                    </p>
                    <div className="mt-3 rounded-[6px] bg-[#f5f9ff] p-3">
                      <p className="text-[10px] font-extrabold text-[#075fd8]">
                        Important arrival date
                      </p>
                      <p className="mt-1 text-[11px] leading-[1.45] text-[#394966]">
                        Delegates attending the destruction of counterfeit
                        goods on 16 November 2026 should plan to arrive by the
                        evening of 15 November 2026.
                      </p>
                    </div>
                  </article>

                  <article className={card}>
                    <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-[#e8f8ef] text-[#08713f]">
                      <Globe2 size={20} />
                    </div>
                    <h3 className="mb-2 text-[14px] font-extrabold text-[#10236f]">
                      Entry requirements (eTA)
                    </h3>
                    <p className={bodyText}>
                      Nationals of most African countries may enter Kenya
                      without a visa or Electronic Travel Authorisation (eTA).
                      Nationals of Libya and Somalia, and of most non-African
                      countries, require an eTA.
                    </p>
                    <a
                      href="https://etakenya.go.ke"
                      target="_blank"
                      rel="noreferrer"
                      className={`${linkClass} mt-3 inline-flex items-center gap-1 text-[11px]`}
                    >
                      Check current Kenya eTA rules <ArrowUpRight size={13} />
                    </a>
                    <p className="mt-2 text-[10px] leading-[1.45] text-[#77839a]">
                      Please confirm the current rules before travel.
                    </p>
                  </article>
                </div>
              </section>

              {/* Health */}
              <section id="health" className="scroll-mt-[80px] max-[760px]:scroll-mt-[60px]">
                <SectionHeading eyebrow="Health and safety" title="Health Advisory — Ebola Virus Disease (EVD)">
                  <p className={sectionIntro}>
                    Important health information for delegates travelling to
                    Kenya.
                  </p>
                </SectionHeading>
                <div className="rounded-[8px] border border-[#f2c7c7] bg-[#fff8f8] p-4">
                  <div className="flex items-start gap-3">
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#ed1c24]/10 text-[#c91c24]">
                      <HeartPulse size={21} />
                    </div>
                    <div>
                      <h3 className="text-[14px] font-extrabold text-[#92212a]">
                        Delegate health advisory
                      </h3>
                      <p className="mt-2 text-[12px] leading-[1.6] text-[#68464a]">
                        Kenya has recorded cases of Ebola Virus Disease (EVD).
                        All delegates travelling to Kenya are advised to
                        familiarize themselves with the national prevention
                        and response protocols before departure.
                      </p>
                      <p className="mt-2 text-[12px] leading-[1.6] text-[#68464a]">
                        Protocol information is published on the Kenya
                        Ministry of Health website. Delegates should monitor
                        this page for the latest guidance and comply with any
                        screening or reporting requirements on arrival.
                      </p>
                      <a
                        href="https://www.health.go.ke/ebola"
                        target="_blank"
                        rel="noreferrer"
                        className="mt-3 inline-flex items-center gap-1 text-[11px] font-extrabold text-[#b21e28] underline underline-offset-2"
                      >
                        Kenya Ministry of Health — Ebola guidance
                        <ArrowUpRight size={13} />
                      </a>
                    </div>
                  </div>
                </div>
              </section>

              {/* Registration */}
              <section id="registration" className="scroll-mt-[80px] max-[760px]:scroll-mt-[60px]">
                <SectionHeading eyebrow="Join the symposium" title="Registration">
                  <p className={sectionIntro}>
                    Register through the ISIPPE-3 Online Registration Portal.
                    The portal provides the available participation categories
                    and registration process.
                  </p>
                </SectionHeading>
                <div className="grid min-w-0 grid-cols-2 gap-3 max-[760px]:grid-cols-1">
                  <div className="rounded-[8px] bg-[#10236f] p-5 text-white">
                    <div className="flex items-center gap-2 text-white/75">
                      <Ticket size={17} />
                      <span className="text-[10px] font-bold uppercase tracking-[.1em]">
                        Early-bird registration
                      </span>
                    </div>
                    <div className="mt-3 flex items-baseline gap-2">
                      <span className="text-[31px] font-black max-[480px]:text-[27px]">KES 60,000</span>
                    </div>
                    <p className="text-[13px] font-bold text-white/80">or USD 470</p>
                    <div className="mt-4 flex items-center gap-2 rounded-[5px] bg-white/10 px-3 py-2 text-[11px] font-semibold">
                      <CalendarDays size={15} />
                      Available until 31 October 2026
                    </div>
                    <a
                      href="/register"
                      className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-[5px] bg-[#ed1c24] px-4 text-[11px] font-extrabold text-white no-underline transition-colors hover:bg-[#c91820]"
                    >
                      Register for ISIPPE-3 <ArrowUpRight size={15} />
                    </a>
                  </div>
                  <div className={card}>
                    <p className={label}>Participation categories</p>
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      {["Delegate", "Speaker", "Sponsor/Exhibitor", "Virtual Participant"].map(
                        (category) => (
                          <div
                            key={category}
                            className="flex items-center gap-2 rounded-[5px] bg-[#f5f9ff] px-2.5 py-2.5 text-[11px] font-bold text-[#10236f]"
                          >
                            <CheckCircle2 size={14} className="shrink-0 text-[#08713f]" />
                            {category}
                          </div>
                        ),
                      )}
                    </div>
                    <div className="mt-4 border-t border-[#e8edf4] pt-3">
                      <p className={label}>Registration portal</p>
                      <p className="mt-1 text-[12px] font-bold text-[#10236f]">
                        events.aca.go.ke
                      </p>
                    </div>
                  </div>
                </div>

                <div className={`${mutedCard} mt-3`}>
                  <h3 className="mb-2 text-[13px] font-extrabold text-[#10236f]">
                    Registration enquiries
                  </h3>
                  <div className="grid grid-cols-2 gap-3 max-[600px]:grid-cols-1">
                    <div>
                      <p className="text-[10px] font-bold text-[#77839a]">
                        General enquiries
                      </p>
                      <a className={`${linkClass} mt-1 block text-[11px]`} href="mailto:info@aca.go.ke">
                        info@aca.go.ke
                      </a>
                      <p className="mt-1 text-[11px] text-[#52617c]">
                        +254 20 2280000 | +254 717 430 640
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-[#77839a]">
                        Participation confirmation
                      </p>
                      <p className="mt-1 text-[11px] font-bold text-[#10236f]">
                        Joseph Kamau
                      </p>
                      <a className={`${linkClass} mt-1 block text-[11px]`} href="mailto:jkamau@aca.go.ke">
                        jkamau@aca.go.ke
                      </a>
                      <p className="mt-1 text-[11px] text-[#52617c]">
                        +254 769 760 707
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Mombasa */}
              <section id="mombasa" className="scroll-mt-[80px] max-[760px]:scroll-mt-[60px]">
                <SectionHeading eyebrow="Explore the coast" title="The Sights and Sounds of Mombasa">
                  <p className={sectionIntro}>
                    Experience the history, culture and coastal character of
                    Kenya’s historic Indian Ocean port city.
                  </p>
                </SectionHeading>
                <div className="min-w-0 overflow-hidden rounded-[8px] border border-[#e0e8f2]">
                  <div className="grid min-w-0 grid-cols-[.9fr_1.1fr] max-[760px]:grid-cols-1">
                    <div className="min-h-[210px] bg-[linear-gradient(145deg,#10236f,#075fd8)] p-5 text-white">
                      <p className="text-[10px] font-bold uppercase tracking-[.12em] text-white/65">
                        Beyond the symposium
                      </p>
                      <h3 className="mt-2 text-[23px] font-black leading-tight">
                        Discover the spirit of Mombasa
                      </h3>
                      <p className="mt-3 text-[11px] leading-[1.55] text-white/80">
                        A historic port city shaped by centuries of exchange
                        across cultures and continents.
                      </p>
                    </div>
                    <div className="p-5">
                      <p className="text-[12px] leading-[1.65] text-[#53617a]">
                        On the final day, delegates will be hosted to an
                        excursion to witness and feel the sights and sounds of
                        Mombasa, Kenya’s historic Indian Ocean port city, where
                        centuries of African, Arab, Asian and European trade
                        have left a remarkable heritage — from Fort Jesus and
                        the narrow streets of the Old Town to Swahili cuisine
                        and the rhythm of the coast.
                      </p>
                      <p className="mt-3 text-[12px] font-semibold leading-[1.55] text-[#10236f]">
                        It is a fitting setting for a conversation about trade,
                        authenticity and Africa’s shared future.
                      </p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {["Fort Jesus", "Old Town", "Swahili cuisine", "Coastal culture"].map(
                          (item) => (
                            <span
                              key={item}
                              className="rounded-full border border-[#dce7f4] bg-[#f5f9ff] px-3 py-1.5 text-[10px] font-bold text-[#075fd8]"
                            >
                              {item}
                            </span>
                          ),
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </div>

            {/* Sidebar */}
            <aside className="sticky top-[70px] min-w-0 space-y-3 max-[1100px]:static max-[1100px]:grid max-[1100px]:grid-cols-2 max-[640px]:grid-cols-1">
              <div className={mutedCard}>
                <h3 className="mb-3 text-[13px] font-extrabold text-[#10236f]">
                  Quick Information
                </h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-2.5">
                    <CalendarDays size={17} className="mt-0.5 shrink-0 text-[#075fd8]" />
                    <div>
                      <p className="text-[10px] font-bold text-[#77839a]">Early-bird deadline</p>
                      <p className="text-[11px] font-bold text-[#10236f]">31 October 2026</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <MapPin size={17} className="mt-0.5 shrink-0 text-[#075fd8]" />
                    <div>
                      <p className="text-[10px] font-bold text-[#77839a]">Venue</p>
                      <p className="text-[11px] font-bold text-[#10236f]">
                        {venueName}{venueCity ? `, ${venueCity}` : ""}
                      </p>
                    </div>
                  </div>
                  {eventDates ? (
                    <div className="flex items-start gap-2.5">
                      <CalendarDays size={17} className="mt-0.5 shrink-0 text-[#075fd8]" />
                      <div>
                        <p className="text-[10px] font-bold text-[#77839a]">Event dates</p>
                        <p className="text-[11px] font-bold text-[#10236f]">{eventDates}</p>
                      </div>
                    </div>
                  ) : null}
                  <div className="flex items-start gap-2.5">
                    <Plane size={17} className="mt-0.5 shrink-0 text-[#075fd8]" />
                    <div>
                      <p className="text-[10px] font-bold text-[#77839a]">Nearest airport</p>
                      <p className="text-[11px] font-bold text-[#10236f]">
                        Moi International Airport
                      </p>
                    </div>
                  </div>
                  {eventMode ? (
                    <div className="flex items-start gap-2.5">
                      <Globe2 size={17} className="mt-0.5 shrink-0 text-[#075fd8]" />
                      <div>
                        <p className="text-[10px] font-bold text-[#77839a]">Participation mode</p>
                        <p className="text-[11px] font-bold text-[#10236f]">{eventMode}</p>
                      </div>
                    </div>
                  ) : null}
                  <div className="flex items-start gap-2.5">
                    <Users size={17} className="mt-0.5 shrink-0 text-[#075fd8]" />
                    <div>
                      <p className="text-[10px] font-bold text-[#77839a]">Registration categories</p>
                      <p className="text-[11px] font-bold text-[#10236f]">
                        Delegate, Speaker, Sponsor/Exhibitor, Virtual
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className={card}>
                <div className="mb-2 flex items-center gap-2">
                  <ShieldCheck size={17} className="text-[#08713f]" />
                  <h3 className="text-[13px] font-extrabold text-[#10236f]">
                    Before You Travel
                  </h3>
                </div>
                <p className={bodyText}>
                  Check Kenya’s current eTA requirements and review the
                  Ministry of Health travel advisory before departure.
                </p>
                <a
                  href="https://etakenya.go.ke"
                  target="_blank"
                  rel="noreferrer"
                  className={`${linkClass} mt-3 inline-flex text-[10px]`}
                >
                  Kenya eTA information
                </a>
                <a
                  href="https://www.health.go.ke/ebola"
                  target="_blank"
                  rel="noreferrer"
                  className={`${linkClass} mt-2 flex text-[10px]`}
                >
                  Ministry of Health guidance
                </a>
              </div>

              <div className="rounded-[8px] bg-[#10236f] p-4 text-white">
                <p className="text-[10px] font-bold uppercase tracking-[.1em] text-white/65">
                  Need assistance?
                </p>
                <h3 className="mt-1 text-[15px] font-extrabold">
                  Contact the organisers
                </h3>
                <a
                  href="mailto:info@aca.go.ke"
                  className="mt-3 flex items-center gap-2 text-[11px] text-white no-underline hover:underline"
                >
                  <Mail size={14} /> info@aca.go.ke
                </a>
                <p className="mt-2 flex items-center gap-2 text-[11px] text-white/85">
                  <Phone size={14} /> +254 20 2280000
                </p>
                <a
                  href="/register"
                  className="mt-4 inline-flex min-h-11 w-full items-center justify-center rounded-[5px] bg-[#ed1c24] text-[11px] font-extrabold text-white no-underline hover:bg-[#c91820]"
                >
                  Go to Registration
                </a>
              </div>
            </aside>
          </div>
        </div>
      </main>
    </PublicEventGate>
  );
}

export default InfoPage;
