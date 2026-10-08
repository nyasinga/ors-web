import { Link } from "react-router-dom";
import { CalendarDays, MapPin } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useEventCopy } from "../../i18n/useEventCopy";

const stepLabels = ["Participation", "Details", "Payment", "Confirmation"] as const;

type HeroProps = {
  current: number;
  title?: string;
  subtitle?: string;
  crumb?: string;
};

/** Registration hero + step bar — adopted from HTML package */
export function RegisterHero({
  current,
  title = "Register for ISIPPE-3",
  subtitle = "Join global experts, policymakers and industry leaders to advance intellectual property protection and enforcement.",
  crumb = "Register",
}: HeroProps) {
  const { t } = useTranslation("common");
  const event = useEventCopy();

  return (
    <>
      <section className="rg-hero">
        <div className="home-container rg-hero-inner">
          <div className="rg-breadcrumb">
            <Link to="/">{t("nav.home")}</Link> <span>›</span> {crumb}
          </div>
          <div className="rg-redline" aria-hidden />
          <h1 className="rg-hero-title">{title}</h1>
          <p>{subtitle}</p>
          <div className="rg-event-row">
            <div className="rg-event">
              <div className="rg-event-icon">
                <CalendarDays size={34} strokeWidth={2} />
              </div>
              <strong>{event.dates}</strong>
            </div>
            <div className="rg-event-divider" aria-hidden />
            <div className="rg-event">
              <div className="rg-event-icon">
                <MapPin size={34} strokeWidth={0} fill="currentColor" />
              </div>
              <strong>
                Kenyatta International
                <br />
                Convention Centre (KICC)
                <br />
                Nairobi, Kenya
              </strong>
            </div>
          </div>
        </div>
      </section>

      <div className="rg-stepbar">
        <div className="home-container rg-steps" aria-label="Registration steps">
          {stepLabels.flatMap((label, i) => {
            const n = i + 1;
            const state = n < current ? "done" : n === current ? "active" : "";
            const circle = n < current ? "✓" : String(n);
            const nodes = [
              <div key={label} className={`rg-step ${state}`.trim()}>
                <span className="rg-step-circle">{circle}</span>
                <span>{label}</span>
              </div>,
            ];
            if (i < stepLabels.length - 1) {
              nodes.push(<span key={`c-${label}`} className="rg-connector" aria-hidden />);
            }
            return nodes;
          })}
        </div>
      </div>
    </>
  );
}

export function PrivacyBar() {
  return (
    <div className="home-container rg-privacy">
      <div>
        <strong>Data Privacy</strong>
        <br />
        <span>
          Your personal information will be used only for ISIPPE-3 registration and event
          communications.
        </span>
      </div>
      <a href="#privacy">Read our Privacy Policy →</a>
    </div>
  );
}
