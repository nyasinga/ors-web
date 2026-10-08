import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { CalendarDays, MapPin, Search } from "lucide-react";
import { speakers, type SpeakerCategory } from "../../data/publicContent";

const filters: { id: "all" | SpeakerCategory; label: string }[] = [
  { id: "all", label: "All Speakers" },
  { id: "keynote", label: "Keynote Speakers" },
  { id: "panelist", label: "Panelists" },
  { id: "moderator", label: "Moderators" },
  { id: "government", label: "Government Representatives" },
];

const categoryLabel: Record<SpeakerCategory, string> = {
  keynote: "Keynote Speaker",
  panelist: "Panelist",
  moderator: "Moderator",
  government: "Government Representative",
};

/** Speakers — structure & CSS adopted from isippe3-speakers-pure-html-responsive */
export function SpeakersPage() {
  const { t } = useTranslation("common");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<(typeof filters)[number]["id"]>("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return speakers.filter((s) => {
      const matchFilter = filter === "all" || s.category === filter;
      const haystack = `${s.name} ${s.org} ${s.role} ${s.country}`.toLowerCase();
      return matchFilter && (!q || haystack.includes(q));
    });
  }, [query, filter]);

  return (
    <div className="speakers-page">
      <section className="sk-hero" id="speakers">
        <div className="home-container sk-hero-inner">
          <div className="sk-hero-copy">
            <div className="sk-accent" aria-hidden>
              <span />
              <span />
            </div>
            <h1 className="sk-hero-title">Speakers</h1>
            <div className="sk-hero-subtitle">
              ISIPPE-3 International Symposium on
              <br />
              Intellectual Property Protection and Enforcement
            </div>
            <div className="sk-event-row">
              <div className="sk-event-item">
                <div className="sk-event-icon">
                  <CalendarDays size={32} strokeWidth={2} />
                </div>
                <strong>{t("event.datesShort")}</strong>
              </div>
              <div className="sk-event-divider" aria-hidden />
              <div className="sk-event-item">
                <div className="sk-event-icon">
                  <MapPin size={32} strokeWidth={0} fill="currentColor" />
                </div>
                <div>
                  <strong>{t("event.city")}</strong>
                  <span>{t("event.venue")}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="sk-filters">
        <div className="home-container">
          <div className="sk-filter-row">
            {filters.map((f) => {
              const count =
                f.id === "all"
                  ? speakers.length
                  : speakers.filter((s) => s.category === f.id).length;
              return (
                <button
                  key={f.id}
                  type="button"
                  className={`sk-filter-button${filter === f.id ? " active" : ""}`}
                  onClick={() => setFilter(f.id)}
                >
                  {f.label} ({count})
                </button>
              );
            })}
            <label className="sk-search">
              <Search size={18} strokeWidth={2} aria-hidden />
              <span className="sr-only">Search speakers</span>
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search speakers..."
              />
            </label>
          </div>
        </div>
      </section>

      <section className="sk-speakers">
        <div className="home-container">
          <div className="sk-speaker-grid">
            {filtered.map((speaker) => (
              <article key={speaker.id} className="sk-speaker-card">
                <img
                  className="sk-speaker-photo"
                  src={speaker.photo}
                  alt={speaker.name}
                />
                <div className="sk-speaker-info">
                  <span className={`sk-badge ${speaker.category}`}>
                    {categoryLabel[speaker.category]}
                  </span>
                  <h2 className="sk-speaker-name">{speaker.name}</h2>
                  <div className="sk-speaker-role">
                    {speaker.roleLines.map((line) => (
                      <span key={line}>
                        {line}
                        <br />
                      </span>
                    ))}
                  </div>
                  <div className="sk-country">
                    <span className="sk-flag" aria-hidden>
                      {speaker.flag}
                    </span>
                    {speaker.country}
                  </div>
                  <button type="button" className="sk-profile">
                    View Profile{" "}
                    <span className="sk-arrow" aria-hidden>
                      →
                    </span>
                  </button>
                </div>
              </article>
            ))}
            {filtered.length === 0 ? (
              <p className="sk-empty">No speakers match your search.</p>
            ) : null}
          </div>
        </div>
      </section>
    </div>
  );
}
