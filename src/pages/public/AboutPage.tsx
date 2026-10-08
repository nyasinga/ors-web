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

/** About — structure & CSS adopted from isippe3-about-pure-html-responsive */
export function AboutPage() {
  const { t } = useTranslation("common");
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]["id"]>("overview");

  return (
    <div className="about-page">
      <section className="ab-hero">
        <div className="home-container ab-hero-inner">
          <div className="ab-hero-copy">
            <div className="ab-breadcrumb">
              <Link to="/">Home</Link> <span>›</span> About
            </div>
            <div className="ab-hero-accent" aria-hidden />
            <h1 className="ab-hero-title">About ISIPPE-3</h1>
            <p>
              A global platform for dialogue, collaboration and practical solutions to strengthen
              intellectual property protection and enforcement.
            </p>
            <div className="ab-event-row">
              <div className="ab-event">
                <div className="ab-event-icon">
                  <CalendarDays size={35} strokeWidth={2} />
                </div>
                <strong>{t("event.datesShort")}</strong>
              </div>
              <div className="ab-event-divider" aria-hidden />
              <div className="ab-event">
                <div className="ab-event-icon">
                  <MapPin size={35} strokeWidth={0} fill="currentColor" />
                </div>
                <div>
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
          </div>
        </div>
      </section>

      <nav className="ab-subnav" aria-label="About sections">
        <div className="home-container ab-subnav-inner">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={activeTab === tab.id ? "active" : undefined}
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

      <section className="ab-main">
        <div className="home-container ab-content-grid">
          <div>
            <div className="ab-overview-top" id="overview">
              <div>
                <h2 className="ab-section-title">Overview</h2>
                <div className="ab-overview-text">
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
                className="ab-overview-photo"
                src="/assets/about-overview.jpg"
                alt="ISIPPE conference session"
              />
            </div>

            <div className="ab-features">
              {features.map((item) => (
                <article key={item.title} className="ab-feature">
                  <div className="ab-feature-icon" style={{ color: item.color }}>
                    <item.icon size={44} strokeWidth={1.7} />
                  </div>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </article>
              ))}
            </div>

            <section className="ab-objectives" id="objectives">
              <h2>Objectives</h2>
              <div className="ab-objective-intro">ISIPPE-3 aims to:</div>
              <div className="ab-objective-grid">
                {objectives.map((item, i) => (
                  <div key={item.title} className="ab-objective">
                    <div className="ab-objective-num">{i + 1}</div>
                    <p>
                      <strong>{item.title}</strong>
                      <br />
                      {item.text}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <aside className="ab-side">
            <div className="ab-side-card">
              <h3>Event Details</h3>
              <div className="ab-detail">
                <CalendarDays size={23} strokeWidth={2} />
                <span>{t("event.datesShort")}</span>
              </div>
              <div className="ab-detail">
                <MapPin size={23} strokeWidth={0} fill="currentColor" />
                <span>
                  Kenyatta International Convention Centre (KICC)
                  <br />
                  Nairobi, Kenya
                </span>
              </div>
              <div className="ab-detail">
                <Users size={23} strokeWidth={2} />
                <span>In-person event</span>
              </div>
              <div className="ab-detail">
                <Globe2 size={23} strokeWidth={2} />
                <span>International participation</span>
              </div>
              <Link className="ab-side-register" to="/register">
                Register Now{" "}
                <span className="ab-arrow" aria-hidden>
                  →
                </span>
              </Link>
            </div>

            <div className="ab-side-card ab-logo-box">
              <h3>Organised by</h3>
              <img src="/assets/logo-aca.png" alt={t("brand.aca")} />
            </div>

            <div className="ab-side-card">
              <h3>In Collaboration With</h3>
              <div className="ab-collab-logos">
                <div>
                  🇰🇪
                  <small>REPUBLIC OF KENYA</small>
                </div>
                <div>
                  🌐
                  <small>WIPO</small>
                </div>
                <div className="ab-vision">
                  🇰🇪
                  <small>KENYA VISION 2030</small>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}
