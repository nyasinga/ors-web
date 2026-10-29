import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  CalendarDays,
  ChartColumnIncreasing,
  Cog,
  Globe2,
  Handshake,
  Lightbulb,
  MapPin,
  Mic2,
  Shield,
  Users,
} from "lucide-react";
import { EventCountdown } from "../../components/EventCountdown";
import { PublicEventGate } from "../../components/public/PublicEventGate";
import { usePublicEngagement } from "../../hooks/usePublicEngagement";
import { cn } from "../../lib/cn";
import { engagementToHomeContent } from "../../lib/publicEvent";

const featureIcons = [Globe2, Users, Handshake, ChartColumnIncreasing, Cog] as const;
const featureTones = ["blue", "green", "blue", "blue", "blue"] as const;

const featureFallbackKeys = [
  { titleKey: "features.dialogue.title", textKey: "features.dialogue.text" },
  { titleKey: "features.knowledge.title", textKey: "features.knowledge.text" },
  { titleKey: "features.partnerships.title", textKey: "features.partnerships.text" },
  { titleKey: "features.markets.title", textKey: "features.markets.text" },
  { titleKey: "features.solutions.title", textKey: "features.solutions.text" },
] as const;

const pillarIcons = [Shield, Users, Lightbulb] as const;

const container =
  "mx-auto w-[calc(100%-clamp(32px,5vw,120px))] max-w-[1440px] max-[768px]:w-[calc(100%-40px)] max-[480px]:w-[calc(100%-32px)]";

/** Home — hero and about content from the public engagement API. */
export function HomePage() {
  const { t } = useTranslation(["home", "common"]);
  const { engagement } = usePublicEngagement();
  const home = useMemo(() => engagementToHomeContent(engagement), [engagement]);

  const features = home.themes.slice(0, 5).map((theme, i) => ({
    icon: featureIcons[i] || Globe2,
    tone: featureTones[i] || "blue",
    title: theme,
    text: t(featureFallbackKeys[i]?.textKey || "features.dialogue.text"),
  }));

  const pillars = home.themes.slice(0, 3).map((theme, i) => ({
    icon: pillarIcons[i] || Shield,
    label: theme,
  }));

  const brandLetters = home.brandMark.split("");
  const brandBeforeE = home.showBrandLogo
    ? home.brandMark.replace(/e$/i, "")
    : home.brandMark;
  const brandEndsWithE = home.showBrandLogo && /e$/i.test(home.brandMark);

  return (
    <PublicEventGate variant="home">
    <div className="text-[#0b1016]">
      <section
        className={cn(
          "relative isolate min-h-[516px] overflow-hidden bg-white",
          "max-[960px]:min-h-0",
        )}
      >
        <div
          className="pointer-events-none absolute inset-y-0 left-[min(44%,520px)] right-0 z-0 hidden bg-[url('/assets/hero-home-visual.png')] bg-[length:auto_100%] bg-[-140px_center] bg-no-repeat min-[961px]:block min-[1400px]:left-[min(46%,580px)] min-[1400px]:bg-[-100px_center]"
          aria-hidden
        />

        <div
          className="pointer-events-none absolute inset-0 z-[1] hidden bg-[linear-gradient(90deg,#fff_0%,#fff_38%,rgba(255,255,255,.92)_44%,rgba(255,255,255,.4)_52%,transparent_62%)] min-[961px]:block"
          aria-hidden
        />

        <div
          className={cn(
            container,
            "relative z-[2] box-border",
            "min-[961px]:min-h-[516px] min-[961px]:px-[clamp(24px,3vw,48px)]",
            "max-[960px]:flex max-[960px]:min-h-0 max-[960px]:flex-col max-[960px]:bg-white",
          )}
        >
          <div
            className={cn(
              "relative min-w-0 pt-[43px]",
              "min-[961px]:max-w-[min(40%,460px)] min-[961px]:pb-10",
              "max-[960px]:order-1 max-[960px]:w-full max-[960px]:max-w-none max-[960px]:pt-7",
              "max-[640px]:pt-[0px]",
            )}
          >
            <div
              className={cn(
                "relative z-0 hidden max-[960px]:order-2 max-[960px]:block",
                "max-[960px]:mx-[calc(50%-50vw)] max-[960px]:mt-0",
                "max-[960px]:h-[clamp(100px,20vw,180px)] max-[960px]:w-screen max-[960px]:max-w-none",
                "max-[960px]:bg-[url('/assets/hero-home-visual-mobile.png')]",
                "max-[960px]:bg-[length:100%_auto] max-[960px]:bg-top max-[960px]:bg-no-repeat",
                "max-[640px]:h-[clamp(90px,20vw,140px)]",
                "max-[380px]:h-[76px]",
              )}
            />

            <div
              className="mb-[22px] flex h-1.5 w-[112px] max-[640px]:mb-3.5 max-[640px]:h-1 max-[640px]:w-[68px]"
              aria-hidden
            >
              <i className="block h-full w-1/2 bg-[#ed1c24]" />
              <i className="block h-full w-1/2 bg-[#08713f]" />
            </div>

            <h1
              className={cn(
                "m-0 whitespace-nowrap text-[82px] font-black leading-[0.92] tracking-[-4px] text-[#3F5BA9]",
                "max-[1200px]:text-[68px]",
                "max-[960px]:whitespace-normal max-[960px]:text-[clamp(2.75rem,7vw,3.75rem)] max-[960px]:tracking-[-0.04em]",
                "max-[640px]:text-[clamp(2.35rem,11vw,3.25rem)] max-[640px]:tracking-[-0.045em]",
                "max-[640px]:mt-10",
              )}
            >
              {brandEndsWithE ? (
                <>
                  {brandBeforeE}
                  <span className="relative inline-block">
                    E
                    <img
                      src="/assets/logo-issipe.png"
                      alt=""
                      aria-hidden="true"
                      className="absolute bottom-[90%] left-1/2 h-[0.85em] w-[0.85em] max-w-none -translate-x-1/2 object-contain"
                    />
                  </span>
                </>
              ) : (
                brandLetters.join("")
              )}{" "}
              <span className="text-[#ed1c24]/90">{home.brandYear}</span>
            </h1>

            <div
              className="my-[17px] mb-[13px] flex h-[5px] w-[190px] max-[640px]:my-3 max-[640px]:h-1 max-[640px]:w-[116px]"
              aria-hidden
            >
              <span className="block h-full w-1/4 bg-[#075fd8]" />
              <span className="block h-full w-1/4 bg-[#ed1c24]" />
              <span className="block h-full w-1/4 bg-[#08713f]" />
              <span className="block h-full w-1/4 bg-[#111]" />
            </div>

            <div
              className={cn(
                "mt-2.5 max-w-[450px] text-[25px] font-extrabold leading-[1.17] tracking-[-0.7px] text-[#0b1016]",
                "max-[1200px]:text-[21px]",
                "max-[960px]:max-w-[36rem] max-[960px]:text-[clamp(1.1rem,2.8vw,1.35rem)]",
                "max-[640px]:max-w-none max-[640px]:text-[clamp(1rem,4.2vw,1.15rem)] max-[640px]:leading-[1.2]",
              )}
            >
              {home.subtitle}
            </div>

            <div className="mt-3 flex items-center gap-4 max-[640px]:flex-col max-[640px]:items-start max-[640px]:gap-2.5">
              <div className="flex items-center gap-3 max-[640px]:gap-2.5">
                <div className="w-[31px] shrink-0 text-[#075fd8] max-[640px]:w-7 [&_svg]:block [&_svg]:h-[31px] [&_svg]:w-[31px] max-[640px]:[&_svg]:h-7 max-[640px]:[&_svg]:w-7">
                  <CalendarDays size={27} strokeWidth={1.7} />
                </div>
                <div className="text-[14px] leading-[1.35] text-[#0b1016] max-[640px]:text-[13px]">
                  {home.datesLabel}
                </div>
              </div>

              <div className="flex items-center gap-3 max-[640px]:gap-2.5">
                <div className="w-[31px] shrink-0 text-[#075fd8] max-[640px]:w-7 [&_svg]:block [&_svg]:h-[31px] [&_svg]:w-[31px] max-[640px]:[&_svg]:h-7 max-[640px]:[&_svg]:w-7">
                  <MapPin size={27} strokeWidth={1.7} fill="none" />
                </div>
                <div className="text-[14px] leading-[1.35] text-[#0b1016] max-[640px]:text-[13px] [&>span]:block">
                  <span>{home.cityLine}</span>
                  <span>{home.venueLine}</span>
                </div>
              </div>
            </div>

            <EventCountdown targetIso={engagement?.startDate} />

            <p
              className={cn(
                "mb-[13px] mt-5 w-full min-w-0 max-w-[500px] line-clamp-3 overflow-hidden text-[13.5px] leading-[1.38] text-[#676b71]",
                "max-[960px]:max-w-none",
                "max-[640px]:mb-4 max-[640px]:mt-3.5 max-[640px]:line-clamp-5 max-[640px]:text-[12px] max-[640px]:leading-[1.45]",
              )}
            >
                          {home.intro}
            </p>
            <div
              className={cn(
                "flex flex-wrap gap-3",
                "max-[960px]:gap-3",
                "max-[640px]:grid max-[640px]:grid-cols-1 max-[640px]:gap-2.5",
              )}
            >
              <Link
                className={cn(
                  "inline-flex min-h-[50px] flex-1 items-center justify-center gap-2.5 rounded-[7px] bg-[#075fd8] px-5 text-[14px] font-bold text-white",
                  "max-[960px]:min-w-0 max-[960px]:flex-[1_1_160px]",
                  "max-[640px]:min-h-12 max-[640px]:w-full max-[640px]:flex-none max-[640px]:px-[18px]",
                )}
                to="/register"
              >
                {t("common:actions.registerNow")}
                <span className="text-[22px] leading-none" aria-hidden>
                  →
                </span>
              </Link>

              <Link
                className={cn(
                  "inline-flex min-h-[50px] flex-1 items-center justify-center gap-2.5 rounded-[7px] border border-[#08713f] bg-white px-5 text-[14px] font-bold text-[#08713f]",
                  "max-[960px]:min-w-0 max-[960px]:flex-[1_1_160px]",
                  "max-[640px]:min-h-12 max-[640px]:w-full max-[640px]:flex-none max-[640px]:px-[18px]",
                )}
                to="/programme"
              >
                {t("common:actions.viewProgramme")}
              </Link>
            </div>
          </div>

          <aside
            className={cn(
              "z-[3] flex min-w-0 flex-col text-left",
              "min-[961px]:absolute min-[961px]:bottom-8 min-[961px]:right-[clamp(28px,4vw,64px)] min-[961px]:top-[clamp(56px,10%,88px)] min-[961px]:w-[min(40%,420px)]",
              "max-[960px]:relative max-[960px]:order-3 max-[960px]:z-[2] max-[960px]:mt-0 max-[960px]:w-full max-[960px]:max-w-none max-[960px]:self-stretch",
              "max-[960px]:rounded-xl max-[960px]:border-[1px] max-[960px]:border-dotted max-[960px]:border-[#3F5BA9] max-[960px]:bg-white",
              "max-[960px]:px-4 max-[960px]:pb-4 max-[960px]:pt-5",
              "max-[640px]:mt-4 max-[640px]:mb-6 max-[640px]:rounded-lg max-[640px]:px-3.5 max-[640px]:pb-4 max-[640px]:pt-4",
              "max-[380px]:px-3",
              "max-[380px]:text-[#3F5BA9]",
            )}
          >
            <div className="min-w-0 shrink-0 min-[960px]:mt-[-40px] min-[960px]:ml-[20px]">
              <div className="mb-2.5 h-1 w-10 bg-[#ed1c24] max-[960px]:mb-2" aria-hidden />

              <h2
                className={cn(
                  "m-0 w-full text-[clamp(0.90rem,1.10vw,1.10rem)] font-normal leading-[1.3] text-[#0b1016] [overflow-wrap:anywhere] [text-wrap:pretty]",
                  "max-[960px]:text-[clamp(1rem,4.2vw,1.2rem)]",
                  "max-[640px]:text-[clamp(1.05rem,4.5vw,1.2rem)]",
                )}>
                <span>{home.overallTheme || home.subtitle}</span>
              </h2>
            </div>

            <div
              className={cn(
                "mt-auto flex min-w-0 flex-col",
                "min-[961px]:pt-5",
                "max-[960px]:mt-4 max-[960px]:pt-0 min-[960px]:ml-[-200px]",
              )}
            >
              <div
                className={cn(
                  "grid w-full grid-cols-3 items-start gap-2.5",
                  "max-[960px]:gap-2",
                  "max-[640px]:gap-2.5",
                  "max-[380px]:gap-1.5",
                )}
              >
                {(pillars.length ? pillars : [
                  { icon: Shield, label: t("hero.pillars.enforcement") },
                  { icon: Users, label: t("hero.pillars.collaboration") },
                  { icon: Lightbulb, label: t("hero.pillars.innovation") },
                ]).map((item) => (
                  <div key={item.label} className="min-w-0 text-center">
                    <div
                      className={cn(
                        "mx-auto mb-1.5 grid h-[44px] w-[44px] place-items-center rounded-full border-2 border-[#15191e] bg-white text-[#0b1016]",
                        "max-[960px]:mb-[5px] max-[960px]:h-[38px] max-[960px]:w-[38px]",
                        "max-[640px]:h-[42px] max-[640px]:w-[42px]",
                        "max-[380px]:h-[34px] max-[380px]:w-[34px]",
                        "[&_svg]:h-[24px] [&_svg]:w-[24px] max-[960px]:[&_svg]:h-[21px] max-[960px]:[&_svg]:w-[21px] max-[640px]:[&_svg]:h-[22px] max-[640px]:[&_svg]:w-[22px]",
                      )}
                    >
                      <item.icon size={22} strokeWidth={1.6} />
                    </div>
                    <strong
                      className={cn(
                        "mx-auto block w-fit max-w-full rounded-md border border-gray-200 bg-white px-2 py-1 text-center",
                        "shadow-[0_1px_3px_rgba(0,0,0,0.08)] max-[640px]:border-transparent max-[640px]:bg-transparent max-[640px]:px-0 max-[640px]:py-0 max-[640px]:shadow-none",
                        "text-[10px] font-bold leading-[1.2] text-[#0b1016] [overflow-wrap:anywhere]",
                        "max-[960px]:text-[clamp(0.62rem,2.5vw,0.72rem)]",
                        "max-[640px]:text-[clamp(0.65rem,2.8vw,0.75rem)]",
                      )}>
                      {item.label}
                    </strong>
                  </div>
                ))}
              </div>
              <Link
                to="/register"
                className="block no-underline">
                <div
                  className={cn(
                    "relative mt-10 w-full max-w-[390px] overflow-hidden rounded-xl border border-gray-200 bg-gradient-to-br from-gray-50 via-white to-gray-50 p-4",
                    "shadow-[0_0_0_1px_rgba(107,114,128,0.04),0_4px_16px_rgba(0,0,0,0.06)]",
                    "transition-all duration-300 hover:shadow-[0_0_20px_rgba(107,114,128,0.14)]",
                    "max-[960px]:mt-2.5 max-[960px]:max-w-none max-[640px]:mt-6 min-[961px]:ml-[150px]",
                    "min-[961px]:border-[#ed1c24e6]/30 min-[961px]:bg-gradient-to-br min-[961px]:from-red-50 min-[961px]:via-white min-[961px]:to-red-50",
                    "min-[961px]:shadow-[0_0_0_1px_rgba(237,28,36,0.04),0_4px_16px_rgba(237,28,36,0.10)]",
                    "min-[961px]:hover:shadow-[0_0_20px_rgba(237,28,36,0.18)]",
                    "cursor-pointer",
                  )}
                >
                  <div className="mb-2 flex items-center gap-2">
                    <span className="rounded-full border border-gray-200 bg-gray-100 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-red-700 min-[961px]:border-[#ed1c24e6]/30 min-[961px]:bg-[#ed1c24e6] min-[961px]:text-white">
                      Early Bird Offer
                    </span>
                    <span className="animate-pulse text-[10px] font-bold uppercase tracking-wide text-red-600 min-[961px]:text-[#ed1c24e6]">
                      Limited Time
                    </span>
                  </div>

                  <p className="text-[14px] font-extrabold leading-snug text-black max-[640px]:text-[13px]">
                    Register Early. Save More.
                  </p>

                  <p className="mt-1 text-[12px] leading-relaxed text-black/75 max-[640px]:text-[11px]">
                    {home.earlyBirdNote}
                  </p>
                </div>
              </Link>
            </div>
          </aside>
        </div>
      </section>

      <section className="border-b border-[#edf1f4] bg-white max-[640px]:border-t">
        <div
          className={cn(
            container,
            "grid min-h-[111px] grid-cols-5 items-center",
            "max-[960px]:min-h-0 max-[960px]:grid-cols-2",
            "max-[640px]:grid-cols-1",
          )}
        >
          {features.map((item, i) => (
            <article
              key={`${item.title}-${i}`}
              className={cn(
                "flex min-h-[57px] items-center gap-4 border-r border-[#dfe5ea] px-6",
                i === 0 && "first:pl-5.5",
                i === features.length - 1 && "border-r-0",
                "max-[960px]:min-w-0 max-[960px]:border-b max-[960px]:border-r-0 max-[960px]:px-3.5 max-[960px]:py-4",
                "max-[960px]:odd:border-r max-[960px]:odd:border-[#dfe5ea]",
                "max-[960px]:[&:nth-last-child(-n+2)]:border-b-0",
                "max-[640px]:first:pl-0",
                "max-[640px]:gap-3.5 max-[640px]:border-b max-[640px]:border-r-0 max-[640px]:px-0 max-[640px]:py-3.5 max-[640px]:odd:border-r-0 max-[640px]:[&:nth-last-child(-n+2)]:border-b max-[640px]:last:border-b-0",
              )}
            >
              <div
                className={cn(
                  "w-[45px] shrink-0",
                  item.tone === "green" ? "text-[#08713f]" : "text-[#075fd8]",
                  "max-[640px]:w-10 [&_svg]:block [&_svg]:h-[43px] [&_svg]:w-[43px] max-[640px]:[&_svg]:h-9 max-[640px]:[&_svg]:w-9",
                )}
              >
                <item.icon size={43} strokeWidth={1.6} />
              </div>
              <div className="min-w-0">
                <h3 className="m-0 mb-1 text-[12.5px] font-bold text-[#0b1016] max-[640px]:mb-[3px] max-[640px]:text-[14px]">
                  {item.title}
                </h3>
                <p className="m-0 text-[11.5px] leading-[1.25] text-[#5b6470] max-[640px]:text-[12.5px] max-[640px]:leading-[1.35]">
                  {item.text}
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section
        className="bg-[linear-gradient(90deg,#fbfdff,#f7fafc)] py-[30px] pb-[35px] max-[640px]:py-7 max-[640px]:pb-8"
        id="about"
      >
        <div
          className={cn(
            container,
            "grid grid-cols-[33%_36%_31%] items-stretch",
            "max-[960px]:grid-cols-1 max-[960px]:gap-[18px]",
          )}
        >
          <div>
            <div className="mb-2.5 h-[5px] w-11 bg-[#ed1c24]" aria-hidden />
            <h2 className="mb-1.5 text-[30px] font-extrabold leading-none tracking-[-1px] text-[#0b1016] max-[640px]:text-[clamp(1.45rem,6vw,1.75rem)]">
              {home.aboutTitle}
            </h2>
            <p className="m-0 max-w-[400px] text-[14px] leading-[1.38] text-[#374151] max-[640px]:max-w-none max-[640px]:text-[13.5px] max-[640px]:leading-[1.45]">
              {home.aboutBody}
            </p>
            <Link
              className={cn(
                "mt-3.5 inline-flex h-[39px] items-center gap-3.5 rounded-[5px] border border-[#075fd8] bg-white px-6 text-[13px] font-bold text-[#075fd8]",
                "max-[640px]:mt-4 max-[640px]:h-11 max-[640px]:w-full max-[640px]:justify-center",
              )}
              to="/about"
            >
              {t("common:actions.learnMore")}{" "}
              <span className="text-[23px] leading-none" aria-hidden>
                →
              </span>
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-px px-[18px] max-[960px]:px-0 max-[640px]:gap-2">
            {[
              {
                icon: Users,
                value: home.stats.participants,
                label: t("stats.participants.label"),
                note: t("stats.participants.note"),
              },
              {
                icon: Globe2,
                value: t("stats.countries.value"),
                label: t("stats.countries.label"),
                note: t("stats.countries.note"),
              },
              {
                icon: Mic2,
                value: home.stats.speakers,
                label: t("stats.speakers.label"),
                note: t("stats.speakers.note"),
              },
              {
                icon: CalendarDays,
                value: home.stats.days,
                label: t("stats.dialogue.label"),
                note: t("stats.dialogue.note"),
              },
            ].map((stat) => (
              <article
                key={stat.label}
                className={cn(
                  "flex min-h-[105px] items-center gap-[13px] border border-[#f0f3f6] bg-white px-[19px] py-[15px]",
                  "max-[640px]:min-h-0 max-[640px]:flex-col max-[640px]:items-start max-[640px]:gap-2 max-[640px]:p-3",
                )}
              >
                <div className="w-[41px] shrink-0 text-[#075fd8] max-[640px]:w-[30px] [&_svg]:block [&_svg]:h-[39px] [&_svg]:w-[39px] max-[640px]:[&_svg]:h-7 max-[640px]:[&_svg]:w-7">
                  <stat.icon size={39} strokeWidth={1.5} />
                </div>
                <div>
                  <div className="text-[21px] font-extrabold text-[#075fd8] max-[640px]:text-[18px]">
                    {stat.value}
                  </div>
                  <div className="mt-1 text-[12px] font-extrabold text-[#0b1016] max-[640px]:text-[11px]">
                    {stat.label}
                  </div>
                  <div className="mt-[3px] text-[10.5px] leading-[1.25] text-[#5b6470] max-[640px]:text-[10px]">
                    {stat.note}
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div
            className="relative ml-[7px] min-h-[214px] overflow-hidden rounded-md bg-[#dfe5ea] max-[960px]:ml-0 max-[960px]:min-h-[240px] max-[640px]:min-h-[200px]"
            id="venue"
          >
            <img
              src="/assets/about-hero.png"
              alt={home.venueImageAlt}
              className="absolute inset-0 block h-full w-full object-cover"
            />
            <div
              className="pointer-events-none absolute inset-x-0 top-[45%] bottom-0 bg-gradient-to-b from-transparent to-[#000c]"
              aria-hidden
            />
            <div className="absolute bottom-3 left-[17px] right-3 z-[2] pl-[30px] text-white">
              <MapPin
                className="absolute bottom-[7px] left-0 h-[25px] w-[25px] text-white"
                size={25}
                strokeWidth={2}
              />
              <strong className="block text-[11px] leading-[1.2]">{home.venueName}</strong>
              <span className="mt-0.5 block text-[10.5px]">{home.venueCityCountry}</span>
            </div>
          </div>
        </div>
      </section>
    </div>
    </PublicEventGate>
  );
}
