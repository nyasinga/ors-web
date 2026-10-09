import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { CalendarDays, MapPin } from "lucide-react";
import { cn } from "../../lib/cn";

type PackageId = "platinum" | "gold" | "silver" | "bronze";

const packages: Record<
  PackageId,
  {
    id: PackageId;
    name: string;
    price: string;
    medal: string;
    description: string;
    button: string;
    benefits: string[];
  }
> = {
  platinum: {
    id: "platinum",
    name: "Platinum Sponsor",
    price: "KES 1,000,000",
    medal: "/assets/sponsor-platinum.png",
    description: "Maximum visibility and strategic engagement opportunities.",
    button: "Select Platinum Package",
    benefits: [
      "Prime exhibition space",
      "Keynote speaking opportunity",
      "Branding across all event materials",
      "Multiple delegate passes (5)",
      "Dedicated networking opportunities",
      "Acknowledgement during event",
    ],
  },
  gold: {
    id: "gold",
    name: "Gold Sponsor",
    price: "KES 500,000",
    medal: "/assets/sponsor-gold.png",
    description: "High visibility and extensive engagement opportunities.",
    button: "Select Gold Package",
    benefits: [
      "Prime exhibition space",
      "Keynote speaking opportunity",
      "Panel participation opportunity",
      "Branding across all event materials",
      "Multiple delegate passes (4)",
      "Dedicated networking opportunities",
    ],
  },
  silver: {
    id: "silver",
    name: "Silver Sponsor",
    price: "KES 300,000",
    medal: "/assets/sponsor-silver.png",
    description: "Enhanced visibility and engagement opportunities.",
    button: "Select Silver Package",
    benefits: [
      "Prime exhibition space",
      "Panel participation opportunity",
      "Branding across all event materials",
      "Multiple delegate passes (3)",
      "Dedicated networking opportunities",
    ],
  },
  bronze: {
    id: "bronze",
    name: "Bronze Sponsor",
    price: "KES 150,000",
    medal: "/assets/sponsor-bronze.png",
    description: "Brand exposure and networking opportunities.",
    button: "Select Bronze Package",
    benefits: [
      "Branding across website",
      "Multiple delegate passes (2)",
      "Delegate passes to social events",
      "Dedicated networking opportunities",
      "Acknowledgement during event",
    ],
  },
};

const packageOrder: PackageId[] = ["platinum", "gold", "silver", "bronze"];

type Cell = "tick" | "dash" | string;

const comparisonRows: { label: string; cells: Cell[] }[] = [
  { label: "Prime exhibition space", cells: ["tick", "tick", "tick", "dash"] },
  { label: "Keynote speaking opportunity", cells: ["tick", "tick", "dash", "dash"] },
  { label: "Panel participation opportunity", cells: ["tick", "tick", "tick", "dash"] },
  {
    label: "Branding across all event materials",
    cells: ["tick", "tick", "tick", "Website only"],
  },
  { label: "Multiple delegate passes", cells: ["5", "4", "3", "2"] },
  { label: "Delegate passes to social events", cells: ["tick", "tick", "tick", "tick"] },
  { label: "Dedicated networking opportunities", cells: ["tick", "tick", "tick", "tick"] },
  { label: "Acknowledgement during event", cells: ["tick", "tick", "tick", "tick"] },
];

const container =
  "mx-auto box-border w-[min(calc(100%-clamp(28px,5vw,80px)),1440px)] max-w-full max-[1200px]:w-[min(calc(100%-48px),1440px)] max-[640px]:w-[calc(100%-32px)] max-[380px]:!w-[calc(100%-24px)]";

const heroBg =
  "[background:linear-gradient(90deg,#fff_0%,#fff_28%,rgba(255,255,255,0.92)_40%,rgba(255,255,255,0.28)_58%,rgba(255,255,255,0)_72%),url('/assets/sponsor-hero.jpg')_96%_center/auto_108%_no-repeat]";
const heroBgTablet =
  "max-[960px]:[background:linear-gradient(180deg,#fff_0%,rgba(255,255,255,0.94)_48%,rgba(255,255,255,0.12)_100%),url('/assets/sponsor-hero.jpg')_center_bottom/auto_65%_no-repeat]";
const heroBgMobile =
  "max-[640px]:[background:linear-gradient(180deg,#fff_0%,#fff_53%,rgba(255,255,255,0.08)_100%),url('/assets/sponsor-hero.jpg')_center_bottom/auto_42%_no-repeat]";

const eventItem =
  "flex items-center gap-2.5 text-[13px] text-[#101620] max-[640px]:mb-2 max-[640px]:gap-[9px] max-[640px]:text-[11px]";
const eventStrong = "text-[14px] font-extrabold max-[640px]:text-xs";
const eventIcon =
  "h-8 w-8 shrink-0 grow-0 basis-8 text-[#075fd8] max-[640px]:h-[27px] max-[640px]:w-[27px] [&_svg]:block [&_svg]:h-8 [&_svg]:w-8 max-[640px]:[&_svg]:h-[27px] max-[640px]:[&_svg]:w-[27px]";

const priceColor: Record<PackageId, string> = {
  platinum: "text-[#075fd8]",
  gold: "text-[#b77d00]",
  silver: "text-[#53617b]",
  bronze: "text-[#ad321e]",
};

const headBg = ["bg-[#08713f]", "bg-[#075fd8]", "bg-[#d19700]", "bg-[#7d899e]", "bg-[#b94c2d]"] as const;

const cellBase =
  "h-[25px] border border-[#d5e0eb] px-[9px] py-[5px] text-center text-[#101620] max-[640px]:px-[7px] first:w-[27%] first:text-left";
const thBase = cn(
  cellBase,
  "h-[48px] text-[13px] font-extrabold leading-[1.05] text-white max-[640px]:text-[11px]",
);

function renderCell(cell: Cell) {
  if (cell === "tick") return <span className="text-[15px] font-black text-[#075fd8]">✓</span>;
  if (cell === "dash") return "-";
  return cell;
}

const arrow = "text-[23px] font-normal leading-none";

/** Sponsorship — Tailwind port of isippe3-sponsorship-pure-html-responsive */
export function SponsorshipPage() {
  const { t } = useTranslation("common");
  const [selected, setSelected] = useState<PackageId>("platinum");
  const pkg = packages[selected];

  return (
    <div className="bg-white text-[#101620]">
      <section className="relative min-h-[274px] overflow-hidden bg-white max-[960px]:min-h-0" id="sponsorship">
        <div
          className={cn(
            container,
            "grid min-h-[274px] grid-cols-[44%_56%] max-[960px]:block max-[960px]:min-h-[410px] max-[640px]:min-h-[435px] max-[380px]:min-h-[425px]",
            heroBg,
            heroBgTablet,
            heroBgMobile,
            "min-[1600px]:[background-size:auto,auto_110%]",
          )}
        >
          <div className="relative z-[2] pt-[25px] max-[960px]:pt-[26px] max-[640px]:pt-[23px]">
            <div
              className="mb-[18px] flex h-1.5 w-[132px] max-[640px]:mb-3.5 max-[640px]:h-1 max-[640px]:w-[68px]"
              aria-hidden
            >
              <span className="block h-full w-1/2 bg-[#ed1c24]" />
              <span className="block h-full w-1/2 bg-[#08713f]" />
            </div>
            <h1 className="text-[51px] font-black leading-[0.98] tracking-[-2.6px] text-[#101620] max-[1200px]:text-[45px] max-[960px]:text-[43px] max-[640px]:text-[clamp(1.85rem,8vw,2.75rem)] max-[640px]:leading-[1.05] max-[640px]:tracking-[-0.04em]">
              Become a Sponsor
            </h1>
            <div className="mb-1.5 mt-[7px] text-[25px] font-extrabold leading-[1.05] text-[#101620] max-[1200px]:text-[22px] max-[960px]:text-[21px] max-[640px]:text-[19px]">
              Partner with ISIPPE-3
            </div>
            <p className="mb-3 max-w-[570px] text-base leading-[1.32] text-[#344256] max-[1200px]:text-sm max-[960px]:max-w-[650px] max-[640px]:mb-[13px] max-[640px]:mt-2 max-[640px]:max-w-[370px] max-[640px]:text-[12.5px] max-[640px]:leading-[1.34]">
              Position your brand as a leader in the fight against counterfeiting and support a
              premier global platform on intellectual property protection and enforcement.
            </p>
            <div className="flex items-center gap-4 max-[640px]:block">
              <div className={eventItem}>
                <div className={eventIcon}>
                  <CalendarDays size={32} strokeWidth={2} />
                </div>
                <strong className={eventStrong}>{t("event.datesShort")}</strong>
              </div>
              <div className="h-[39px] w-px bg-[#b8c2cc] max-[640px]:hidden" aria-hidden />
              <div className={eventItem}>
                <div className={eventIcon}>
                  <MapPin size={32} strokeWidth={0} fill="currentColor" />
                </div>
                <div>
                  <strong className={eventStrong}>{t("event.city")}</strong>
                  <span className="block text-[11px]">{t("event.venue")}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="pt-[15px]">
        <div className={container}>
          <div>
            <div className="mb-2 flex h-[5px] w-[102px] max-[640px]:h-1 max-[640px]:w-[67px]" aria-hidden>
              <span className="block h-full w-1/2 bg-[#ed1c24]" />
              <span className="block h-full w-1/2 bg-[#08713f]" />
            </div>
            <h2 className="text-[25px] font-black leading-none tracking-[-1px] text-[#101620] max-[640px]:text-[22px]">
              Sponsorship Packages
            </h2>
            <p className="mb-[11px] mt-[5px] text-sm leading-[1.25] text-[#344256] max-[640px]:text-[11.5px] max-[640px]:leading-[1.3]">
              Choose a sponsorship package that aligns with your objectives. Select a package to
              view its benefits and comparison.
            </p>
          </div>

          <div className="grid grid-cols-[minmax(0,2.85fr)_minmax(285px,1.05fr)] items-start gap-[15px] max-[960px]:grid-cols-[1fr] max-[640px]:gap-3">
            <div>
              <div className="grid grid-cols-[repeat(4,1fr)] gap-1.5 max-[960px]:grid-cols-[repeat(2,1fr)] max-[640px]:grid-cols-[1fr] max-[640px]:gap-2">
                {packageOrder.map((id) => {
                  const item = packages[id];
                  const active = selected === id;
                  return (
                    <article
                      key={id}
                      className={cn(
                        "relative flex min-h-[242px] flex-col rounded-md bg-[linear-gradient(180deg,#fff,#fbfdff)] px-2.5 pb-2.5 pt-[15px] text-center",
                        "max-[640px]:grid max-[640px]:min-h-0 max-[640px]:grid-cols-[66px_1fr_auto] max-[640px]:grid-rows-[auto_auto_auto] max-[640px]:gap-x-2.5 max-[640px]:p-[11px] max-[640px]:text-left",
                        active
                          ? "border-[1.5px] border-[#075fd8] shadow-[0_0_0_1px_rgba(7,95,216,0.08)]"
                          : "border border-[#d6e0eb]",
                      )}
                    >
                      <span
                        className={cn(
                          "absolute right-[7px] top-[7px] h-[22px] w-[22px] items-center justify-center rounded-full bg-[#075fd8] text-[14px] leading-none text-white max-[640px]:right-1.5 max-[640px]:top-1.5",
                          active ? "flex" : "hidden",
                        )}
                        aria-hidden
                      >
                        ✓
                      </span>
                      <div className="mb-[3px] flex h-[67px] items-center justify-center max-[640px]:row-span-3 max-[640px]:row-start-1 max-[640px]:mb-0 max-[640px]:h-[70px] max-[640px]:self-center">
                        <img
                          className="block h-[62px] w-auto max-[640px]:h-[61px] max-[640px]:w-[61px]"
                          src={item.medal}
                          alt={item.name}
                        />
                      </div>
                      <div>
                        <h3 className="text-[15px] font-extrabold leading-[1.1] text-[#101620] max-[640px]:text-[13px]">
                          {item.name}
                        </h3>
                        <div
                          className={cn(
                            "mt-1 text-[19px] font-black leading-none max-[640px]:mt-[3px] max-[640px]:text-[17px]",
                            priceColor[id],
                          )}
                        >
                          {item.price}
                        </div>
                        <p className="mx-[5px] mb-[9px] mt-3 min-h-[52px] text-left text-xs leading-[1.25] text-[#344256] max-[640px]:mx-0 max-[640px]:mb-1.5 max-[640px]:mt-1 max-[640px]:min-h-0 max-[640px]:text-[10.5px]">
                          {item.description}
                        </p>
                      </div>
                      <button
                        type="button"
                        className={cn(
                          "h-[39px] w-full cursor-pointer rounded-[5px] border border-[#075fd8] text-xs font-extrabold max-[640px]:col-[2/4] max-[640px]:h-9 max-[640px]:text-[11px]",
                          active ? "bg-[#075fd8] text-white" : "bg-white text-[#075fd8]",
                        )}
                        onClick={() => setSelected(id)}
                      >
                        Select Package
                      </button>
                    </article>
                  );
                })}
              </div>

              <section className="mt-[13px] pb-[25px] max-[640px]:mt-3.5">
                <h2 className="mb-2 text-[21px] font-black leading-none text-[#101620] max-[640px]:text-[19px]">
                  Package Comparison
                </h2>
                <div className="overflow-x-auto rounded-[5px] border border-[#d5e0eb]">
                  <table className="w-full min-w-[700px] table-fixed border-collapse text-[11px] max-[640px]:text-[10px]">
                    <thead>
                      <tr>
                        <th className={cn(thBase, headBg[0])}>Benefits</th>
                        <th className={cn(thBase, headBg[1])}>
                          Platinum
                          <br />
                          KES 1,000,000
                        </th>
                        <th className={cn(thBase, headBg[2])}>
                          Gold
                          <br />
                          KES 500,000
                        </th>
                        <th className={cn(thBase, headBg[3])}>
                          Silver
                          <br />
                          KES 300,000
                        </th>
                        <th className={cn(thBase, headBg[4])}>
                          Bronze
                          <br />
                          KES 150,000
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {comparisonRows.map((row) => (
                        <tr key={row.label}>
                          <td className={cellBase}>{row.label}</td>
                          {row.cells.map((cell, i) => (
                            <td key={`${row.label}-${i}`} className={cellBase}>
                              {renderCell(cell)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            </div>

            <aside className="min-h-[500px] rounded-lg bg-[linear-gradient(150deg,#f0f8ff,#f6faff)] px-[19px] pb-[17px] pt-5 max-[960px]:order-2 max-[960px]:min-h-0 max-[640px]:px-3.5 max-[640px]:py-4">
              <h2 className="border-b border-[#cbdced] pb-[13px] text-[21px] font-black leading-none text-[#101620] max-[640px]:text-[18px]">
                Selected Package
              </h2>
              <div className="mt-[17px] flex items-center gap-3">
                <img
                  className="block h-[52px] w-[65px] object-contain max-[640px]:w-[58px]"
                  src={pkg.medal}
                  alt={pkg.name}
                />
                <div>
                  <h3 className="text-base font-extrabold leading-[1.2] text-[#101620] max-[640px]:text-sm">
                    {pkg.name}
                  </h3>
                  <div className="mt-[5px] text-[21px] font-black text-[#075fd8] max-[640px]:text-[18px]">
                    {pkg.price}
                  </div>
                </div>
              </div>
              <p className="mb-[11px] mt-3.5 text-[13px] leading-[1.4] text-[#344256] max-[640px]:text-[11.5px]">
                {pkg.description}
              </p>
              <ul className="m-0 list-none p-0">
                {pkg.benefits.map((benefit) => (
                  <li
                    key={benefit}
                    className="my-[9px] flex items-center gap-2.5 text-xs text-[#344256] before:grid before:h-[17px] before:w-[17px] before:flex-[0_0_17px] before:place-items-center before:rounded-full before:bg-[#075fd8] before:text-[10px] before:font-extrabold before:text-white before:content-['✓'] max-[640px]:my-2 max-[640px]:text-[10.5px]"
                  >
                    {benefit}
                  </li>
                ))}
              </ul>
              <Link
                className="mt-4 inline-flex min-h-[51px] w-full cursor-pointer items-center justify-center gap-3 rounded-md bg-[#075fd8] text-sm font-extrabold text-white no-underline max-[640px]:min-h-[46px] max-[640px]:text-xs"
                to={`/register?type=sponsor&package=${pkg.id}`}
              >
                {pkg.button}{" "}
                <span className={arrow} aria-hidden>
                  →
                </span>
              </Link>
            </aside>
          </div>
        </div>
      </section>
    </div>
  );
}
