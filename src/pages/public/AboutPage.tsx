import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
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
import { cn } from "../../lib/cn";

const tabs = [
  { id: "overview", label: "Overview", target: "overview" },
  { id: "objectives", label: "Objectives", target: "objectives" },
  { id: "attend", label: "Who Should Attend" },
  { id: "themes", label: "Key Themes" },
  { id: "why", label: "Why Attend" },
  { id: "organisers", label: "Organisers" },
  { id: "venue", label: "Venue" },
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

const objectives = [
  {
    title: "Facilitate dialogue",
    text: "on emerging IP trends and enforcement challenges.",
  },
  {
    title: "Share best practices",
    text: "and case studies from different jurisdictions.",
  },
  {
    title: "Promote multi-stakeholder",
    text: "collaboration to strengthen IP protection.",
  },
  {
    title: "Support policies and",
    text: "initiatives that foster innovation, trade and economic growth.",
  },
] as const;

const container =
  "mx-auto box-border w-[min(calc(100%-clamp(28px,5vw,80px)),1440px)] max-w-full max-[1200px]:w-[min(calc(100%-48px),1440px)] max-[640px]:w-[calc(100%-32px)] max-[380px]:!w-[calc(100%-24px)]";

const sideCard =
  "rounded-[7px] border border-[#e0e8f2] bg-[linear-gradient(160deg,#f3f9ff,#fff)] p-[15px] max-[760px]:p-[13px]";
const sideTitle = "mb-[13px] text-sm font-extrabold text-[#10236f]";
const detailRow =
  "my-[9px] flex gap-2.5 text-[11px] leading-[1.35] text-[#10236f] [&_svg]:h-[23px] [&_svg]:w-[23px] [&_svg]:flex-[0_0_23px] [&_svg]:text-[#075fd8]";

const objectiveTone = ["bg-[#075fd8]", "bg-[#08713f]", "bg-[#ed1c24]", "bg-[#075fd8]"] as const;

/** About — Tailwind port of isippe3-about-pure-html-responsive */
export function AboutPage() {
  const { t } = useTranslation("common");
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]["id"]>("overview");

  return (
    <div className="bg-white text-[#111a31]">
      <PageHero
        dark
        breadcrumb="About"
        title="About ISIPPE-3"
        description="A global platform for dialogue, collaboration and practical solutions to strengthen intellectual property protection and enforcement."
        image="/assets/about-hero.jpg"
        imageAlt="About ISIPPE-3 symposium"
        combinedLocation
      />

      <nav
        className="h-[49px] border-b border-[#dce4ee] bg-white max-[760px]:h-auto max-[760px]:overflow-x-auto"
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
              onClick={() => {
                setActiveTab(tab.id);
                if ("target" in tab && tab.target) {
                  document
                    .getElementById(tab.target)
                    ?.scrollIntoView({ behavior: "smooth", block: "start" });
                }
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </nav>

      <section className="pb-[45px] pt-7 max-[760px]:pb-[35px] max-[760px]:pt-[17px]">
        <div
          className={cn(
            container,
            "grid grid-cols-[minmax(0,1fr)_225px] gap-[22px] max-[1100px]:grid-cols-1 max-[760px]:block",
          )}
        >
          <div>
            <div
              className="grid grid-cols-[1.3fr_0.8fr] gap-[25px] max-[760px]:flex max-[760px]:flex-col max-[760px]:gap-3.5"
              id="overview"
            >
              <div>
                <h2 className="mb-3 text-[31px] font-black leading-none tracking-[-1.2px] text-[#10236f] max-[760px]:text-[26px]">
                  Overview
                </h2>
                <div className="text-[13px] leading-[1.48] text-[#52617c] max-[760px]:text-[11.5px] [&_p]:mb-[13px]">
                  <p>
                    The 3rd International Symposium on Intellectual Property Protection and
                    Enforcement (ISIPPE-3) brings together policymakers, regulators, industry
                    leaders, academia, and practitioners to advance effective strategies for
                    combating counterfeiting, piracy and other forms of intellectual property (IP)
                    infringement.
                  </p>
                  <p>
                    Hosted by the Anti-Counterfeit Authority (ACA), ISIPPE-3 will provide a unique
                    platform for knowledge sharing, policy dialogue and practical solutions towards
                    a safer, more innovative and inclusive global marketplace.
                  </p>
                </div>
              </div>
              <img
                className="block h-[198px] w-full rounded-[7px] border border-[#d7e1ed] object-cover max-[760px]:h-[190px]"
                src="/assets/about-overview.jpg"
                alt="ISIPPE conference session"
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

            <section className="mt-[25px] max-[760px]:mt-[19px]" id="objectives">
              <h2 className="mb-2 text-[28px] font-black text-[#10236f] max-[760px]:text-[24px]">
                Objectives
              </h2>
              <div className="mb-2.5 text-xs font-bold text-[#10236f]">ISIPPE-3 aims to:</div>
              <div className="grid grid-cols-4 gap-[15px] max-[760px]:grid-cols-2 max-[760px]:gap-[13px]">
                {objectives.map((item, i) => (
                  <div
                    key={item.title}
                    className="grid grid-cols-[36px_1fr] items-start gap-2 max-[760px]:grid-cols-[31px_1fr]"
                  >
                    <div
                      className={cn(
                        "grid h-8 w-8 place-items-center rounded-full text-sm font-extrabold text-white max-[760px]:h-7 max-[760px]:w-7 max-[760px]:text-xs",
                        objectiveTone[i],
                      )}
                    >
                      {i + 1}
                    </div>
                    <p className="mt-px text-[11px] leading-[1.4] text-[#53617a] max-[760px]:text-[9.5px]">
                      <strong className="text-[#10236f]">{item.title}</strong>
                      <br />
                      {item.text}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <aside className="flex flex-col gap-2.5 max-[1100px]:grid max-[1100px]:grid-cols-2 max-[760px]:mt-[17px] max-[760px]:flex">
            <div className={sideCard}>
              <h3 className={sideTitle}>Event Details</h3>
              <div className={detailRow}>
                <CalendarDays size={23} strokeWidth={2} />
                <span>{t("event.datesShort")}</span>
              </div>
              <div className={detailRow}>
                <MapPin size={23} strokeWidth={0} fill="currentColor" />
                <span>
                  Kenyatta International Convention Centre (KICC)
                  <br />
                  Nairobi, Kenya
                </span>
              </div>
              <div className={detailRow}>
                <Users size={23} strokeWidth={2} />
                <span>In-person event</span>
              </div>
              <div className={detailRow}>
                <Globe2 size={23} strokeWidth={2} />
                <span>International participation</span>
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
              <img className="m-auto block w-[170px]" src="/assets/logo-aca.png" alt={t("brand.aca")} />
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
