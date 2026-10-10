import { useState } from "react";
import { Link } from "react-router-dom";
import { PageHero } from "../../components/public/PageHero";
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
const priceColor: Record<PackageId, string> = {
  platinum: "text-[#075fd8]",
  gold: "text-[#b77d00]",
  silver: "text-[#53617b]",
  bronze: "text-[#ad321e]",
};
const headBg = ["bg-[#08713f]", "bg-[#075fd8]", "bg-[#d19700]", "bg-[#7d899e]", "bg-[#b94c2d]"] as const;
const cellBase =
  "h-[25px] border border-[#d5e0eb] px-[9px] py-[7px] text-center align-middle text-[11px] leading-snug text-[#101620] max-[640px]:px-2 max-[640px]:py-2 first:w-[27%] first:min-w-[150px] first:text-left";
const thBase = cn(
  cellBase,
  "h-[48px] text-[13px] font-extrabold leading-[1.15] text-white max-[640px]:text-[11px]",
);
function renderCell(cell: Cell) {
  if (cell === "tick") return <span className="text-[15px] font-black text-[#075fd8]">✓</span>;
  if (cell === "dash") return "-";
  return cell;
}
const arrow = "text-[23px] font-normal leading-none";
/** Sponsorship — Tailwind port of isippe3-sponsorship-pure-html-responsive */
export function SponsorshipPage() {
  const [selected, setSelected] = useState<PackageId>("platinum");
  const pkg = packages[selected];
  return (
    <div className="overflow-x-hidden bg-white text-[#101620]">
      <PageHero
        title="Become a Sponsor"
        subtitle="Partner with ISIPPE-3"
        description="Position your brand as a leader in the fight against counterfeiting and support a premier global platform on intellectual property protection and enforcement."
        image="/assets/sponsor-hero.jpg"
        imageAlt="ISIPPE sponsorship partnership"
      />
      <section className="pt-[15px] pb-6 sm:pb-10" id="sponsorship">
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
          <div className="grid grid-cols-[minmax(0,2.85fr)_minmax(0,1.05fr)] items-start gap-4 max-[960px]:grid-cols-1 max-[640px]:gap-3">
            <div>
              <div className="grid grid-cols-4 gap-2 max-[1100px]:grid-cols-2 max-[640px]:grid-cols-1 max-[640px]:gap-2.5">
                {packageOrder.map((id) => {
                  const item = packages[id];
                  const active = selected === id;
                  return (
                    <article
                      key={id}
                      className={cn(
                        "relative flex min-h-[242px] min-w-0 flex-col rounded-md bg-[linear-gradient(180deg,#fff,#fbfdff)] px-2.5 pb-2.5 pt-[15px] text-center",
                        "max-[640px]:grid max-[640px]:min-h-0 max-[640px]:grid-cols-[56px_minmax(0,1fr)] max-[640px]:grid-rows-[auto_auto] max-[640px]:gap-x-3 max-[640px]:gap-y-1.5 max-[640px]:p-3 max-[640px]:text-left",
                        active
                          ? "border-[1.5px] border-[#075fd8] shadow-[0_0_0_1px_rgba(7,95,216,0.08)]"
                          : "border border-[#d6e0eb]",
                      )}
                    >
                      <span
                        className={cn(
                          "absolute right-2 top-2 h-[22px] w-[22px] items-center justify-center rounded-full bg-[#075fd8] text-[14px] leading-none text-white",
                          active ? "flex" : "hidden",
                        )}
                        aria-hidden
                      >
                        ✓
                      </span>
                      <div className="mb-[3px] flex h-[67px] items-center justify-center max-[640px]:row-span-2 max-[640px]:row-start-1 max-[640px]:mb-0 max-[640px]:h-[64px] max-[640px]:self-center">
                        <img
                          className="block h-[62px] max-w-full w-auto object-contain max-[640px]:h-[54px] max-[640px]:w-[54px]"
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
                          "mt-auto h-[42px] w-full cursor-pointer rounded-[5px] border border-[#075fd8] px-2 text-xs font-extrabold max-[640px]:col-[2] max-[640px]:h-10 max-[640px]:text-[11px]",
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
                <div className="hidden max-[640px]:block">
                  <div className="grid grid-cols-1 gap-3">
                    {packageOrder.map((id, packageIndex) => {
                      const item = packages[id];
                      const active = selected === id;
                      return (
                        <article
                          key={id}
                          className={cn(
                            "min-w-0 overflow-hidden rounded-lg border bg-white",
                            active ? "border-[#075fd8] shadow-[0_0_0_1px_rgba(7,95,216,0.08)]" : "border-[#d5e0eb]",
                          )}
                        >
                          <div className={cn("flex items-center gap-3 px-3 py-3 text-white", headBg[packageIndex + 1])}>
                            <img className="h-11 w-11 shrink-0 object-contain" src={item.medal} alt="" />
                            <div className="min-w-0 flex-1">
                              <h3 className="text-sm font-extrabold leading-tight">{item.name}</h3>
                              <p className="mt-1 text-sm font-bold">{item.price}</p>
                            </div>
                            {active && <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white text-sm font-black text-[#075fd8]">✓</span>}
                          </div>
                          <div className="divide-y divide-[#e5edf5] px-3">
                            {comparisonRows.map((row) => {
                              const value = row.cells[packageIndex];
                              return (
                                <div key={row.label} className="flex items-start justify-between gap-3 py-2.5 text-[12px] leading-snug">
                                  <span className="min-w-0 flex-1 text-[#344256]">{row.label}</span>
                                  <span className="shrink-0 text-right font-semibold text-[#101620]">
                                    {value === "tick" ? <span className="text-[16px] font-black text-[#075fd8]">✓</span> : value === "dash" ? <span className="text-[#9aa6b5]">—</span> : value}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                          <div className="p-3 pt-0">
                            <button
                              type="button"
                              onClick={() => setSelected(id)}
                              className={cn(
                                "mt-3 min-h-10 w-full rounded-md border border-[#075fd8] px-3 text-xs font-extrabold",
                                active ? "bg-[#075fd8] text-white" : "bg-white text-[#075fd8]",
                              )}
                            >
                              {active ? "Selected Package" : "Select Package"}
                            </button>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                </div>
                <div className="max-w-full overflow-x-auto overscroll-x-contain rounded-[5px] border border-[#d5e0eb] [-webkit-overflow-scrolling:touch] max-[640px]:hidden">
                  <table className="w-full min-w-[700px] table-fixed border-collapse text-[11px]">
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
            <aside className="min-w-0 min-h-[500px] rounded-lg bg-[linear-gradient(150deg,#f0f8ff,#f6faff)] px-[19px] pb-[17px] pt-5 max-[960px]:order-2 max-[960px]:min-h-0 max-[640px]:px-4 max-[640px]:py-4">
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
