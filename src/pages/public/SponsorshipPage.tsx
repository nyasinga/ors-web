import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { CalendarDays, MapPin } from "lucide-react";

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

function renderCell(cell: Cell) {
  if (cell === "tick") return <span className="sp-tick">✓</span>;
  if (cell === "dash") return "-";
  return cell;
}

/** Sponsorship — structure & CSS adopted from isippe3-sponsorship-pure-html-responsive */
export function SponsorshipPage() {
  const { t } = useTranslation("common");
  const [selected, setSelected] = useState<PackageId>("platinum");
  const pkg = packages[selected];

  return (
    <div className="sponsorship-page">
      <section className="sp-hero" id="sponsorship">
        <div className="home-container sp-hero-inner">
          <div className="sp-hero-copy">
            <div className="sp-accent" aria-hidden>
              <span />
              <span />
            </div>
            <h1 className="sp-hero-title">Become a Sponsor</h1>
            <div className="sp-hero-subtitle">Partner with ISIPPE-3</div>
            <p className="sp-hero-description">
              Position your brand as a leader in the fight against counterfeiting and support a
              premier global platform on intellectual property protection and enforcement.
            </p>
            <div className="sp-event-row">
              <div className="sp-event-item">
                <div className="sp-event-icon">
                  <CalendarDays size={32} strokeWidth={2} />
                </div>
                <strong>{t("event.datesShort")}</strong>
              </div>
              <div className="sp-event-divider" aria-hidden />
              <div className="sp-event-item">
                <div className="sp-event-icon">
                  <MapPin size={32} strokeWidth={0} fill="currentColor" />
                </div>
                <div>
                  <strong>{t("event.city")}</strong>
                  <span className="sp-venue-line">{t("event.venue")}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="sp-packages">
        <div className="home-container">
          <div className="sp-section-heading">
            <div className="sp-accent" aria-hidden>
              <span />
              <span />
            </div>
            <h2>Sponsorship Packages</h2>
            <p>
              Choose a sponsorship package that aligns with your objectives. Select a package to
              view its benefits and comparison.
            </p>
          </div>

          <div className="sp-package-layout">
            <div>
              <div className="sp-package-cards">
                {packageOrder.map((id) => {
                  const item = packages[id];
                  const active = selected === id;
                  return (
                    <article
                      key={id}
                      className={`sp-package-card ${id}${active ? " selected" : ""}`}
                    >
                      <span className="sp-check" aria-hidden>
                        ✓
                      </span>
                      <div className="sp-medal">
                        <img src={item.medal} alt={item.name} />
                      </div>
                      <div>
                        <h3>{item.name}</h3>
                        <div className="sp-price">{item.price}</div>
                        <p className="sp-package-description">{item.description}</p>
                      </div>
                      <button
                        type="button"
                        className="sp-package-button"
                        onClick={() => setSelected(id)}
                      >
                        Select Package
                      </button>
                    </article>
                  );
                })}
              </div>

              <section className="sp-comparison">
                <h2>Package Comparison</h2>
                <div className="sp-table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Benefits</th>
                        <th>
                          Platinum
                          <br />
                          KES 1,000,000
                        </th>
                        <th>
                          Gold
                          <br />
                          KES 500,000
                        </th>
                        <th>
                          Silver
                          <br />
                          KES 300,000
                        </th>
                        <th>
                          Bronze
                          <br />
                          KES 150,000
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {comparisonRows.map((row) => (
                        <tr key={row.label}>
                          <td>{row.label}</td>
                          {row.cells.map((cell, i) => (
                            <td key={`${row.label}-${i}`}>{renderCell(cell)}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            </div>

            <aside className="sp-selected-panel">
              <h2>Selected Package</h2>
              <div className="sp-selected-heading">
                <img src={pkg.medal} alt={pkg.name} />
                <div>
                  <h3>{pkg.name}</h3>
                  <div className="sp-selected-price">{pkg.price}</div>
                </div>
              </div>
              <p>{pkg.description}</p>
              <ul className="sp-benefit-list">
                {pkg.benefits.map((benefit) => (
                  <li key={benefit}>{benefit}</li>
                ))}
              </ul>
              <Link
                className="sp-select-main"
                to={`/register?type=sponsor&package=${pkg.id}`}
              >
                {pkg.button}{" "}
                <span className="sp-arrow" aria-hidden>
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
