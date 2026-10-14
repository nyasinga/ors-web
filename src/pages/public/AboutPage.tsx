import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  BarChart3,
  CalendarDays,
  Globe2,
  Handshake,
  Lightbulb,
  MapPin,
  Users,
} from "lucide-react";
import { PageHero } from "../../components/public/PageHero";
import { usePublicEngagement } from "../../hooks/usePublicEngagement";
import { cn } from "../../lib/cn";
import { engagementToAboutContent } from "../../lib/publicEvent";

const tabs = [
  { id: "overview", label: "Overview", target: "overview" },
  { id: "objectives", label: "Objectives", target: "objectives" },
  { id: "attend", label: "Who Should Attend", target: "attend" },
  { id: "themes", label: "Key Themes", target: "themes" },
  { id: "venue", label: "Venue", target: "venue" },
] as const;

const features = [
  {
    icon: Users,
    color: "#075fd8",
    title: "Global Dialogue",
    text: "Connect with experts and decision-makers from around the world.",
  },
  {
    icon: Lightbulb,
    color: "#08713f",
    title: "Practical Solutions",
    text: "Address real-world IP enforcement challenges.",
  },
  {
    icon: Handshake,
    color: "#ed1c24",
    title: "Strategic Partnerships",
    text: "Build collaborations across government, industry and civil society.",
  },
  {
    icon: BarChart3,
    color: "#075fd8",
    title: "Innovation & Growth",
    text: "Support a safer and more inclusive marketplace for innovation.",
  },
] as const;

const container =
  "mx-auto box-border w-[min(calc(100%-clamp(28px,5vw,80px)),1440px)] max-w-full max-[1200px]:w-[min(calc(100%-48px),1440px)] max-[640px]:w-[calc(100%-32px)] max-[380px]:!w-[calc(100%-24px)]";

const sideCard =
  "rounded-[7px] border border-[#e0e8f2] bg-[linear-gradient(160deg,#f3f9ff,#fff)] p-[15px] max-[760px]:p-[13px]";
const sideTitle = "mb-[13px] text-sm font-extrabold text-[#10236f]";
const detailRow =
  "my-[9px] flex gap-2.5 text-[11px] leading-[1.35] text-[#10236f] [&_svg]:h-[23px] [&_svg]:w-[23px] [&_svg]:flex-[0_0_23px] [&_svg]:text-[#075fd8]";

const objectiveTone = ["bg-[#075fd8]", "bg-[#08713f]", "bg-[#ed1c24]", "bg-[#075fd8]", "bg-[#08713f]", "bg-[#075fd8]"] as const;
const themeTone = ["bg-[#e8f1ff] text-[#075fd8]", "bg-[#e8f8ef] text-[#08713f]", "bg-[#ffe8ea] text-[#ed1c24]", "bg-[#eef0ff] text-[#4b3fd6]", "bg-[#fff4e5] text-[#c87000]", "bg-[#e8f1ff] text-[#075fd8]"] as const;

function splitObjective(text: string) {
  const trimmed = text.trim();
  const m = /^(.*?)\s+(on|and|to|for|across|towards|from)\s+(.*)$/i.exec(trimmed);
  if (m && m[1].split(" ").length <= 5) {
    return { title: m[1], text: `${m[2]} ${m[3]}` };
  }
  const words = trimmed.split(" ");
  if (words.length <= 4) return { title: trimmed, text: "" };
  return { title: words.slice(0, 3).join(" "), text: words.slice(3).join(" ") };
}

/** About — tabs wired to sections loaded from the public engagement. */
export function AboutPage() {
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]["id"]>("overview");
  const { engagement, loading } = usePublicEngagement();
  const about = useMemo(() => engagementToAboutContent(engagement), [engagement]);

  const goToTab = (tab: (typeof tabs)[number]) => {
    setActiveTab(tab.id);
    document.getElementById(tab.target)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  useEffect(() => {
    const sectionIds = tabs.map((t) => t.target);
    const nodes = sectionIds
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => Boolean(el));
    if (!nodes.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!visible?.target?.id) return;
        const match = tabs.find((t) => t.target === visible.target.id);
        if (match) setActiveTab(match.id);
      },
      { rootMargin: "-30% 0px -55% 0px", threshold: [0.15, 0.35, 0.55] },
    );
    nodes.forEach((n) => observer.observe(n));
    return () => observer.disconnect();
  }, [about]);

  return (
    <div className="bg-white text-[#111a31]">
      <PageHero
        dark
        breadcrumb="About"
        title={`About ${about.name.includes("ISIPPE") ? "ISIPPE-3" : about.name}`}
        description={about.shortDescription}
        image="/assets/about-hero.jpg"
        imageAlt={`About ${about.name}`}
        combinedLocation
      />

      <nav
        className="sticky top-0 z-20 h-[49px] border-b border-[#dce4ee] bg-white/95 backdrop-blur max-[760px]:h-auto max-[760px]:overflow-x-auto"
        aria-label="About sections"
      >
        <div
          className={cn(
            container,
            "flex h-full items-center gap-[35px] max-[900px]:flex-wrap max-[900px]:gap-x-[18px] max-[900px]:gap-y-2.5 max-[760px]:h-[45px] max-[760px]:!w-max",
          )}
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={cn(
                "relative h-full cursor-pointer whitespace-nowrap bg-transparent p-0 text-xs max-[760px]:text-[10px]",
                activeTab === tab.id
                  ? "font-bold text-[#075fd8] after:absolute after:inset-x-0 after:bottom-0 after:h-[3px] after:bg-[#075fd8] after:content-['']"
                  : "text-[#56627a]",
              )}
              onClick={() => goToTab(tab)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </nav>

      {loading ? (
        <p className="px-6 py-3 text-center text-sm text-mute">Loading event details…</p>
      ) : null}

      <section className="pb-[45px] pt-7 max-[760px]:pb-[35px] max-[760px]:pt-[17px]">
        <div
          className={cn(
            container,
            "grid grid-cols-[minmax(0,1fr)_225px] gap-[22px] max-[1100px]:grid-cols-1 max-[760px]:block",
          )}
        >
          <div className="min-w-0">
            <div
              className="scroll-mt-16 grid grid-cols-[1.3fr_0.8fr] gap-[25px] max-[760px]:flex max-[760px]:flex-col max-[760px]:gap-3.5"
              id="overview"
            >
              <div>
                <h2 className="mb-3 text-[31px] font-black leading-none tracking-[-1.2px] text-[#10236f] max-[760px]:text-[26px]">
                  Overview
                </h2>
                <div className="text-[13px] leading-[1.48] text-[#52617c] max-[760px]:text-[11.5px] [&_p]:mb-[13px]">
                  {about.overviewParagraphs.map((p) => (
                    <p key={p.slice(0, 48)}>{p}</p>
                  ))}
                </div>
              </div>
              <img
                className="block h-[198px] w-full rounded-[7px] border border-[#d7e1ed] object-cover max-[760px]:h-[190px]"
                src={about.cover}
                alt={`${about.name} session`}
                onError={(e) => {
                  e.currentTarget.src = "/assets/about-overview.jpg";
                }}
              />
            </div>

            <div className="mt-[17px] grid grid-cols-4 overflow-hidden rounded-lg bg-[linear-gradient(110deg,#f1f8ff,#f8fbff)] max-[760px]:grid-cols-2">
              {features.map((item) => (
                <article
                  key={item.title}
                  className="min-h-[162px] border-r border-[#e2eaf3] px-4 py-[21px] text-center last:border-r-0 max-[760px]:min-h-[145px] max-[760px]:px-2.5 max-[760px]:py-[18px] max-[760px]:[&:nth-child(-n+2)]:border-b max-[760px]:[&:nth-child(2)]:border-r-0"
                >
                  <div
                    className="mx-auto mb-2.5 grid h-11 w-11 place-items-center max-[760px]:h-[38px] max-[760px]:w-[38px] [&_svg]:block [&_svg]:h-11 [&_svg]:w-11 max-[760px]:[&_svg]:h-[38px] max-[760px]:[&_svg]:w-[38px]"
                    style={{ color: item.color }}
                  >
                    <item.icon size={44} strokeWidth={1.7} />
                  </div>
                  <h3 className="mb-[7px] text-[13px] font-extrabold text-[#10236f] max-[760px]:text-[11px]">
                    {item.title}
                  </h3>
                  <p className="text-[11px] leading-[1.45] text-[#53617a] max-[760px]:text-[9.5px]">
                    {item.text}
                  </p>
                </article>
              ))}
            </div>

            <section className="mt-[25px] scroll-mt-16 max-[760px]:mt-[19px]" id="objectives">
              <h2 className="mb-2 text-[28px] font-black text-[#10236f] max-[760px]:text-[24px]">
                Objectives
              </h2>
              <div className="mb-2.5 text-xs font-bold text-[#10236f]">{about.name} aims to:</div>
              <div className="grid grid-cols-4 gap-[15px] max-[900px]:grid-cols-2 max-[760px]:gap-[13px]">
                {about.objectives.map((item, i) => {
                  const split = splitObjective(item);
                  return (
                    <div
                      key={`${item}-${i}`}
                      className="grid grid-cols-[36px_1fr] items-start gap-2 max-[760px]:grid-cols-[31px_1fr]"
                    >
                      <div
                        className={cn(
                          "grid h-8 w-8 place-items-center rounded-full text-sm font-extrabold text-white max-[760px]:h-7 max-[760px]:w-7 max-[760px]:text-xs",
                          objectiveTone[i % objectiveTone.length],
                        )}
                      >
                        {i + 1}
                      </div>
                      <p className="mt-px text-[11px] leading-[1.4] text-[#53617a] max-[760px]:text-[9.5px]">
                        <strong className="text-[#10236f]">{split.title}</strong>
                        {split.text ? (
                          <>
                            <br />
                            {split.text}
                          </>
                        ) : null}
                      </p>
                    </div>
                  );
                })}
              </div>
            </section>

            <section className="mt-[28px] scroll-mt-16 max-[760px]:mt-[22px]" id="attend">
              <h2 className="mb-2 text-[28px] font-black text-[#10236f] max-[760px]:text-[24px]">
                Who Should Attend
              </h2>
              <p className="mb-4 max-w-3xl text-[13px] leading-[1.5] text-[#52617c] max-[760px]:text-[11.5px]">
                {about.attendIntro}
              </p>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[#e8f1ff] px-3 py-1 text-[11px] font-bold text-[#075fd8]">
                <Users size={14} /> Primary audience: {about.audienceLabel}
              </div>
              <div className="grid grid-cols-2 gap-3 max-[640px]:grid-cols-1">
                {about.attendGroups.map((group) => (
                  <article
                    key={group}
                    className="flex items-start gap-3 rounded-[7px] border border-[#e0e8f2] bg-[#f8fbff] p-3.5"
                  >
                    <span className="mt-0.5 grid h-8 w-8 place-items-center rounded-full bg-[#075fd8]/12 text-[#075fd8]">
                      <Users size={16} />
                    </span>
                    <div>
                      <h3 className="text-[13px] font-extrabold text-[#10236f]">{group}</h3>
                      <p className="mt-1 text-[11px] leading-[1.4] text-[#53617a]">
                        Stakeholders engaged in {group.toLowerCase()} within the {about.name} agenda.
                      </p>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <section className="mt-[28px] scroll-mt-16 max-[760px]:mt-[22px]" id="themes">
              <h2 className="mb-2 text-[28px] font-black text-[#10236f] max-[760px]:text-[24px]">
                Key Themes
              </h2>
              <p className="mb-4 max-w-3xl text-[13px] leading-[1.5] text-[#52617c] max-[760px]:text-[11.5px]">
                Programme conversations and sessions are organised around the core themes of{" "}
                {about.name}.
              </p>
              <div className="grid grid-cols-3 gap-3 max-[900px]:grid-cols-2 max-[560px]:grid-cols-1">
                {about.themes.map((theme, i) => (
                  <article
                    key={theme}
                    className={cn(
                      "rounded-[7px] border border-[#e0e8f2] p-4",
                      themeTone[i % themeTone.length],
                    )}
                  >
                    <div className="mb-2 text-[10px] font-bold uppercase tracking-[0.06em] opacity-70">
                      Theme {i + 1}
                    </div>
                    <h3 className="text-[15px] font-extrabold leading-snug">{theme}</h3>
                  </article>
                ))}
              </div>
            </section>

            <section className="mt-[28px] scroll-mt-16 max-[760px]:mt-[22px]" id="venue">
              <h2 className="mb-2 text-[28px] font-black text-[#10236f] max-[760px]:text-[24px]">
                Venue
              </h2>
              <div className="grid grid-cols-[1.2fr_0.8fr] gap-4 max-[760px]:grid-cols-1">
                <div className="rounded-[7px] border border-[#e0e8f2] bg-[linear-gradient(160deg,#f3f9ff,#fff)] p-4">
                  <h3 className="text-[16px] font-extrabold text-[#10236f]">{about.venueTitle}</h3>
                  <p className="mt-2 flex items-start gap-2 text-[12px] leading-[1.45] text-[#52617c]">
                    <MapPin size={16} className="mt-0.5 shrink-0 text-[#075fd8]" />
                    <span>
                      {about.venueCity}
                      {about.venueCountry ? `, ${about.venueCountry}` : ""}
                    </span>
                  </p>
                  <p className="mt-3 text-[12px] text-[#52617c]">
                    {about.modeLabel}. Join us on {about.datesLabel}.
                  </p>
                  <Link
                    to="/venue"
                    className="mt-4 inline-flex h-9 items-center justify-center rounded-[5px] border border-[#075fd8] px-3 text-xs font-bold text-[#075fd8] no-underline hover:bg-[#f3f8ff]"
                  >
                    View venue details →
                  </Link>
                </div>
                <img
                  className="h-full min-h-[160px] w-full rounded-[7px] border border-[#d7e1ed] object-cover"
                  src="/assets/venue-kicc.jpg"
                  alt={about.venueTitle}
                />
              </div>
            </section>
          </div>

          <aside className="flex flex-col gap-2.5 max-[1100px]:grid max-[1100px]:grid-cols-2 max-[760px]:mt-[17px] max-[760px]:flex">
            <div className={sideCard}>
              <h3 className={sideTitle}>Event Details</h3>
              <div className={detailRow}>
                <CalendarDays size={23} strokeWidth={2} />
                <span>{about.datesLabel}</span>
              </div>
              <div className={detailRow}>
                <MapPin size={23} strokeWidth={0} fill="currentColor" />
                <span>
                  {about.venueTitle}
                  <br />
                  {about.venueCity}
                  {about.venueCountry ? `, ${about.venueCountry}` : ""}
                </span>
              </div>
              <div className={detailRow}>
                <Users size={23} strokeWidth={2} />
                <span>{about.modeLabel}</span>
              </div>
              <div className={detailRow}>
                <Globe2 size={23} strokeWidth={2} />
                <span>{about.audienceLabel}</span>
              </div>
              <Link
                className="mt-2 inline-flex h-[41px] w-full items-center justify-center gap-2.5 rounded-[5px] bg-[#075fd8] text-sm font-bold text-white no-underline"
                to="/register"
              >
                Register Now{" "}
                <span className="text-[23px] font-normal leading-none" aria-hidden>
                  →
                </span>
              </Link>
            </div>

            <div className={cn(sideCard, "text-left")}>
              <h3 className={sideTitle}>Organised by</h3>
              <img className="m-auto block w-[170px]" src="/assets/logo-aca.png" alt="Anti-Counterfeit Authority" />
            </div>

            <div className={sideCard}>
              <h3 className={sideTitle}>In Collaboration With</h3>
              <div className="grid grid-cols-2 items-center gap-2.5 text-center text-[11px] font-semibold text-[#10236f]">
                <div>
                  🇰🇪
                  <small className="mt-1 block text-[9px] font-bold tracking-[0.02em]">
                    REPUBLIC OF KENYA
                  </small>
                </div>
                <div>
                  🌐
                  <small className="mt-1 block text-[9px] font-bold tracking-[0.02em]">WIPO</small>
                </div>
                <div className="col-span-full">
                  🇰🇪
                  <small className="mt-1 block text-[9px] font-bold tracking-[0.02em]">
                    KENYA VISION 2030
                  </small>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}
