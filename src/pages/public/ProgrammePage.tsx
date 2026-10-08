import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { CalendarDays, MapPin, Search } from "lucide-react";
import { programmeDays, programmeSessions } from "../../data/publicContent";

const dayMeta: Record<1 | 2 | 3, { date: string; weekday: string }> = {
  1: { date: "12 November 2026", weekday: "Thursday" },
  2: { date: "13 November 2026", weekday: "Friday" },
  3: { date: "14 November 2026", weekday: "Saturday" },
};

function tagClass(tone: (typeof programmeSessions)[number]["tone"]) {
  if (tone === "red") return "pg-tag red";
  if (tone === "green") return "pg-tag green";
  if (tone === "purple") return "pg-tag purple";
  if (tone === "orange") return "pg-tag orange";
  return "pg-tag";
}

/** Programme — structure & CSS adopted from isippe3-programme-pure-html-responsive */
export function ProgrammePage() {
  const { t } = useTranslation("common");
  const [dayFilter, setDayFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [openDays, setOpenDays] = useState<Record<1 | 2 | 3, boolean>>({
    1: true,
    2: false,
    3: false,
  });

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return programmeSessions.filter((s) => {
      const dayOk = dayFilter === "all" || String(s.day) === dayFilter;
      const haystack = `${s.title} ${s.speakers} ${s.type} ${s.venue}`.toLowerCase();
      return dayOk && (!q || haystack.includes(q));
    });
  }, [dayFilter, query]);

  const byDay = ([1, 2, 3] as const)
    .filter((d) => dayFilter === "all" || dayFilter === String(d))
    .map((d) => ({
      day: d,
      sessions: filtered.filter((s) => s.day === d),
    }));

  return (
    <div className="programme-page">
      <section className="pg-hero">
        <div className="home-container pg-hero-inner">
          <div className="pg-accent" aria-hidden>
            <i />
            <i />
          </div>
          <h1 className="pg-hero-title">Programme</h1>
          <div className="pg-subtitle">
            ISIPPE-3 International Symposium on
            <br />
            Intellectual Property Protection and Enforcement
          </div>
          <div className="pg-event-row">
            <div className="pg-event">
              <CalendarDays size={32} strokeWidth={2} />
              <strong>{t("event.datesShort")}</strong>
            </div>
            <div className="pg-event-divider" aria-hidden />
            <div className="pg-event">
              <MapPin size={32} strokeWidth={0} fill="currentColor" />
              <div>
                <strong>{t("event.city")}</strong>
                <small>{t("event.venue")}</small>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="pg-controls">
        <div className="home-container">
          <div className="pg-control-row">
            {programmeDays.map((d) => {
              const active = dayFilter === d.id;
              return (
                <button
                  key={d.id}
                  type="button"
                  className={`pg-day-btn${active ? " active" : ""}`}
                  onClick={() => {
                    setDayFilter(d.id);
                    if (d.id === "all") setOpenDays({ 1: true, 2: false, 3: false });
                    else
                      setOpenDays({
                        1: d.id === "1",
                        2: d.id === "2",
                        3: d.id === "3",
                      });
                  }}
                >
                  {d.sub ? (
                    <>
                      <strong>{d.label}</strong>
                      {d.sub}
                    </>
                  ) : (
                    d.label
                  )}
                </button>
              );
            })}
            <label className="pg-search">
              <Search size={18} strokeWidth={2} aria-hidden />
              <span className="sr-only">Search sessions</span>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search sessions, topics or speakers..."
              />
            </label>
          </div>
        </div>
      </section>

      <main className="pg-schedule">
        <div className="home-container">
          {byDay.map(({ day, sessions }) => {
            const open = openDays[day];
            const meta = dayMeta[day];
            return (
              <section
                key={day}
                className={`pg-day-panel${open ? "" : " collapsed"}`}
              >
                <button
                  type="button"
                  className="pg-day-head"
                  aria-expanded={open}
                  onClick={() => setOpenDays((s) => ({ ...s, [day]: !s[day] }))}
                >
                  <div className="pg-day-title">Day {day}</div>
                  <div className="pg-day-date">
                    {meta.date}, {meta.weekday}
                  </div>
                  <div className="pg-location">
                    <MapPin size={19} strokeWidth={0} fill="currentColor" />
                    Kenyatta International Convention Centre (KICC), Nairobi
                  </div>
                  <span className="pg-chev" aria-hidden>
                    {open ? "⌃" : "⌄"}
                  </span>
                </button>

                {open ? (
                  sessions.length === 0 ? (
                    <p className="pg-empty">No sessions match your filters.</p>
                  ) : (
                    <table className="pg-table">
                      <thead>
                        <tr>
                          <th className="pg-time">Time</th>
                          <th className="pg-session">Session</th>
                          <th className="pg-type">Type</th>
                          <th className="pg-speakers">Speakers</th>
                          <th className="pg-venue">Venue</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sessions.map((s) => (
                          <tr key={s.id}>
                            <td className="pg-time">{s.time}</td>
                            <td className="pg-session">{s.title}</td>
                            <td className="pg-type">
                              <span className={tagClass(s.tone)}>{s.type}</span>
                            </td>
                            <td className="pg-speakers">
                              {s.speakerLines
                                ? s.speakerLines.map((line) => (
                                    <span key={line}>
                                      {line}
                                      <br />
                                    </span>
                                  ))
                                : s.speakers}
                            </td>
                            <td className="pg-venue">
                              <div className="pg-venue-cell">
                                <img src={s.venueImage} alt="" />
                                <div className="pg-venue-name">
                                  {s.venue}
                                  <br />
                                  <span>{s.venueSub ?? "KICC"}</span>
                                </div>
                                <span className="pg-row-arrow" aria-hidden>
                                  ›
                                </span>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )
                ) : null}
              </section>
            );
          })}
        </div>
      </main>
    </div>
  );
}
