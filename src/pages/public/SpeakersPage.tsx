import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { CalendarDays, MapPin, Search } from "lucide-react";
import { SpeakerCardGrid, type SpeakerCardData } from "../../components/speakers/SpeakerCard";
import { speakers, type SpeakerCategory } from "../../data/publicContent";

const filters: { id: "all" | SpeakerCategory; label: string }[] = [
  { id: "all", label: "All Speakers" },
  { id: "keynote", label: "Keynote Speakers" },
  { id: "panelist", label: "Panelists" },
  { id: "moderator", label: "Moderators" },
  { id: "government", label: "Government Representatives" },
];

/** Speakers — structure & CSS adopted from isippe3-speakers-pure-html-responsive */
export function SpeakersPage() {
  const { t } = useTranslation("common");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<(typeof filters)[number]["id"]>("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return speakers
      .filter((s) => {
        const matchFilter = filter === "all" || s.category === filter;
        const haystack = `${s.name} ${s.org} ${s.role} ${s.country}`.toLowerCase();
        return matchFilter && (!q || haystack.includes(q));
      })
      .map(
        (s): SpeakerCardData => ({
          id: s.id,
          name: s.name,
          role: s.role,
          org: s.org,
          roleLines: s.roleLines,
          country: s.country,
          flag: s.flag,
          category: s.category,
          photo: s.photo,
          bio: s.bio,
        }),
      );
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
          <SpeakerCardGrid
            speakers={filtered}
            columns={4}
            emptyMessage="No speakers match your search."
          />
        </div>
      </section>
    </div>
  );
}
