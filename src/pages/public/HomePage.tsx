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

const features = [
  { icon: Globe2, titleKey: "features.dialogue.title", textKey: "features.dialogue.text" },
  { icon: Users, titleKey: "features.knowledge.title", textKey: "features.knowledge.text" },
  { icon: Handshake, titleKey: "features.partnerships.title", textKey: "features.partnerships.text" },
  { icon: ChartColumnIncreasing, titleKey: "features.markets.title", textKey: "features.markets.text" },
  { icon: Cog, titleKey: "features.solutions.title", textKey: "features.solutions.text" },
] as const;

const stats = [
  {
    icon: Users,
    valueKey: "stats.participants.value",
    labelKey: "stats.participants.label",
    noteKey: "stats.participants.note",
  },
  {
    icon: Globe2,
    valueKey: "stats.countries.value",
    labelKey: "stats.countries.label",
    noteKey: "stats.countries.note",
  },
  {
    icon: Mic2,
    valueKey: "stats.speakers.value",
    labelKey: "stats.speakers.label",
    noteKey: "stats.speakers.note",
  },
  {
    icon: CalendarDays,
    valueKey: "stats.dialogue.value",
    labelKey: "stats.dialogue.label",
    noteKey: "stats.dialogue.note",
  },
] as const;

const pillars = [
  { icon: Shield, labelKey: "hero.pillars.enforcement" },
  { icon: Users, labelKey: "hero.pillars.collaboration" },
  { icon: Lightbulb, labelKey: "hero.pillars.innovation" },
] as const;

/** Home — structure & CSS adopted from index 2.html */
export function HomePage() {
  const { t } = useTranslation(["home", "common"]);

  return (
    <div className="home-page">
      <section className="home-hero">
        <div className="home-container home-hero-inner">
          <div className="home-hero-copy">
            <div className="home-accent" aria-hidden>
              <i />
              <i />
            </div>
            <h1 className="home-hero-title">
              ISIPPE-<span>3</span>
            </h1>
            <div className="home-hero-subtitle">{t("common:event.fullName")}</div>
            <div className="home-rule" aria-hidden>
              <span />
              <span />
              <span />
              <span />
            </div>
            <div className="home-meta">
              <div className="home-meta-item">
                <div className="home-meta-icon">
                  <CalendarDays size={31} strokeWidth={2} />
                </div>
                <div className="home-meta-copy">
                  <strong>{t("common:event.datesShort")}</strong>
                </div>
              </div>
              <div className="home-meta-divider" aria-hidden />
              <div className="home-meta-item">
                <div className="home-meta-icon">
                  <MapPin size={31} strokeWidth={0} fill="currentColor" />
                </div>
                <div className="home-meta-copy">
                  <strong>{t("common:event.city")}</strong>
                  {t("common:event.venue")}
                </div>
              </div>
            </div>
            <p className="home-description">{t("hero.intro")}</p>
            <div className="home-actions">
              <Link className="home-btn home-primary" to="/register">
                {t("common:actions.registerNow")}{" "}
                <span className="home-arrow" aria-hidden>
                  →
                </span>
              </Link>
              <Link className="home-btn home-secondary" to="/programme">
                {t("common:actions.viewProgramme")}
              </Link>
            </div>
          </div>

          <div className="home-hero-visual" aria-hidden />

          <aside className="home-theme">
            <div className="home-theme-accent" aria-hidden />
            <h2>{t("common:event.tagline")}</h2>
            <div className="home-theme-items">
              {pillars.map((item) => (
                <div key={item.labelKey} className="home-theme-item">
                  <div className="home-theme-icon">
                    <item.icon size={27} strokeWidth={1.75} />
                  </div>
                  <strong>{t(item.labelKey)}</strong>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </section>

      <section className="home-feature-strip">
        <div className="home-container home-features">
          {features.map((item) => (
            <article key={item.titleKey} className="home-feature">
              <div className="home-feature-icon">
                <item.icon size={43} strokeWidth={1.6} />
              </div>
              <div>
                <h3>{t(item.titleKey)}</h3>
                <p>{t(item.textKey)}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="home-about" id="about">
        <div className="home-container home-about-grid">
          <div className="home-about-copy">
            <div className="home-about-rule" aria-hidden />
            <h2>{t("about.title")}</h2>
            <p>{t("about.body")}</p>
            <Link className="home-learn" to="/about">
              {t("common:actions.learnMore")}{" "}
              <span className="home-arrow" aria-hidden>
                →
              </span>
            </Link>
          </div>

          <div className="home-stats">
            {stats.map((stat) => (
              <article key={stat.labelKey} className="home-stat">
                <div className="home-stat-icon">
                  <stat.icon size={39} strokeWidth={1.5} />
                </div>
                <div>
                  <div className="home-stat-number">{t(stat.valueKey)}</div>
                  <div className="home-stat-title">{t(stat.labelKey)}</div>
                  <div className="home-stat-desc">{t(stat.noteKey)}</div>
                </div>
              </article>
            ))}
          </div>

          <div className="home-venue" id="venue">
            <img src="/assets/home-about-venue.jpg" alt={t("venueImageAlt")} />
            <div className="home-venue-label">
              <MapPin className="home-pin" size={25} strokeWidth={0} fill="currentColor" />
              <strong>{t("common:event.venue")}</strong>
              <span>{t("common:event.city")}</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
