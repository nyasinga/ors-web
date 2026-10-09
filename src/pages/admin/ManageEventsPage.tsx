import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowDownUp,
  CalendarDays,
  Download,
  ListFilter,
  MapPin,
  Plus,
  Search,
} from "lucide-react";
import type { EventType, ManagedEvent } from "../../data/adminEvents";
import { listEngagements, toManagedEvent } from "../../lib/engagements";
import { ApiError } from "../../lib/api";

type TabId = "all" | "Upcoming" | "Ongoing" | "Past" | "Draft";

const typeClass = (type: EventType) => {
  if (type === "Roundtable") return "round";
  return type.toLowerCase();
};

const barClass = (tone: ManagedEvent["barTone"]) =>
  tone === "green" ? "" : tone;

/** Admin Events — structure & CSS from isippe3-manage-events HTML package */
export function ManageEventsPage() {
  const [tab, setTab] = useState<TabId>("all");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(8);
  const [selected, setSelected] = useState<string[]>([]);
  const [events, setEvents] = useState<ManagedEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const rows = await listEngagements({
          limit: 200,
          order: ["startDate DESC"],
        });
        if (cancelled) return;
        setEvents((rows ?? []).map(toManagedEvent).filter((e) => e.id));
      } catch (err) {
        if (cancelled) return;
        const message =
          err instanceof ApiError
            ? err.message
            : err instanceof Error
              ? err.message
              : "Failed to load events";
        setError(message);
        setEvents([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const counts = useMemo(() => {
    const base = { all: events.length, Upcoming: 0, Ongoing: 0, Past: 0, Draft: 0 };
    for (const e of events) {
      if (e.status === "Upcoming") base.Upcoming += 1;
      else if (e.status === "Ongoing") base.Ongoing += 1;
      else if (e.status === "Past") base.Past += 1;
      else if (e.status === "Draft") base.Draft += 1;
    }
    return base;
  }, [events]);

  const tabs: { id: TabId; label: string }[] = [
    { id: "all", label: `All Events (${counts.all})` },
    { id: "Upcoming", label: `Upcoming (${counts.Upcoming})` },
    { id: "Ongoing", label: `Ongoing (${counts.Ongoing})` },
    { id: "Past", label: `Past (${counts.Past})` },
    { id: "Draft", label: `Draft (${counts.Draft})` },
  ];

  const filtered = useMemo(() => {
    return events.filter((e) => {
      const matchTab = tab === "all" || e.status === tab;
      const q = query.trim().toLowerCase();
      const matchQ =
        !q ||
        e.name.toLowerCase().includes(q) ||
        e.subtitle.toLowerCase().includes(q) ||
        e.venue.toLowerCase().includes(q);
      return matchTab && matchQ;
    });
  }, [events, tab, query]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / rowsPerPage));
  const safePage = Math.min(page, pageCount);
  const pageRows = filtered.slice((safePage - 1) * rowsPerPage, safePage * rowsPerPage);
  const allChecked = pageRows.length > 0 && pageRows.every((r) => selected.includes(r.id));
  const from = filtered.length === 0 ? 0 : (safePage - 1) * rowsPerPage + 1;
  const to = Math.min(safePage * rowsPerPage, filtered.length);

  const pageButtons = Array.from({ length: Math.min(pageCount, 5) }, (_, i) => {
    if (pageCount <= 5) return i + 1;
    const start = Math.min(Math.max(1, safePage - 2), pageCount - 4);
    return start + i;
  });

  return (
    <section className="ae-page">
      <div className="ae-pagehead">
        <div>
          <h1>Events</h1>
          <p>Manage all events, registrations and activities.</p>
        </div>
        <Link className="ae-create" to="/admin/events/new">
          <Plus size={18} strokeWidth={2.5} aria-hidden />
          Create Event
        </Link>
      </div>

      {error ? (
        <div
          className="mb-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          role="alert"
        >
          {error}
        </div>
      ) : null}

      <section className="ae-panel">
        <div className="ae-tabs-tools">
          <div className="ae-tabs" role="tablist" aria-label="Event status">
            {tabs.map((item) => (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={tab === item.id}
                className={`ae-tab${tab === item.id ? " active" : ""}`}
                onClick={() => {
                  setTab(item.id);
                  setPage(1);
                }}
              >
                {item.label}
              </button>
            ))}
          </div>
          <div className="ae-tools">
            <label className="ae-tool-search">
              <Search size={16} strokeWidth={2.25} aria-hidden />
              <span className="sr-only">Search events</span>
              <input
                type="search"
                placeholder="Search events..."
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setPage(1);
                }}
              />
            </label>
            <button type="button" className="ae-tool-btn">
              <ListFilter size={16} strokeWidth={2.25} aria-hidden />
              Filters
            </button>
            <button type="button" className="ae-tool-btn">
              <Download size={16} strokeWidth={2.25} aria-hidden />
              Export
            </button>
          </div>
        </div>

        <div className="ae-table-wrap">
          <table className="ae-table">
            <thead>
              <tr>
                <th>
                  <input
                    type="checkbox"
                    className="ae-check"
                    checked={allChecked}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelected((prev) => [...new Set([...prev, ...pageRows.map((r) => r.id)])]);
                      } else {
                        setSelected((prev) => prev.filter((id) => !pageRows.some((r) => r.id === id)));
                      }
                    }}
                    aria-label="Select all on page"
                  />
                </th>
                <th>
                  Event <ArrowDownUp size={10} strokeWidth={2.5} aria-hidden />
                </th>
                <th>
                  Date <ArrowDownUp size={10} strokeWidth={2.5} aria-hidden />
                </th>
                <th>
                  Venue <ArrowDownUp size={10} strokeWidth={2.5} aria-hidden />
                </th>
                <th>
                  Type <ArrowDownUp size={10} strokeWidth={2.5} aria-hidden />
                </th>
                <th>
                  Registrations <ArrowDownUp size={10} strokeWidth={2.5} aria-hidden />
                </th>
                <th>
                  Status <ArrowDownUp size={10} strokeWidth={2.5} aria-hidden />
                </th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8}>
                    <div className="ae-empty">Loading events…</div>
                  </td>
                </tr>
              ) : pageRows.length === 0 ? (
                <tr>
                  <td colSpan={8}>
                    <div className="ae-empty">
                      {error
                        ? "Could not load events."
                        : "No events yet. Create your first event."}
                    </div>
                  </td>
                </tr>
              ) : (
                pageRows.map((row) => {
                  const pct =
                    row.capacity > 0 ? Math.min(100, Math.round((row.registered / row.capacity) * 100)) : 0;
                  const tone = barClass(row.barTone);
                  return (
                    <tr key={row.id}>
                      <td>
                        <input
                          type="checkbox"
                          className="ae-check"
                          checked={selected.includes(row.id)}
                          onChange={(e) => {
                            setSelected((prev) =>
                              e.target.checked ? [...prev, row.id] : prev.filter((id) => id !== row.id),
                            );
                          }}
                          aria-label={`Select ${row.name}`}
                        />
                      </td>
                      <td>
                        <div className="ae-event-name">
                          <Link to={`/admin/events/${row.id}/overview`}>{row.name}</Link>
                        </div>
                        <div className="ae-event-desc">{row.subtitle}</div>
                      </td>
                      <td>
                        <div className="ae-date-main">
                          <CalendarDays size={12} strokeWidth={2} aria-hidden />
                          {row.dateLabel}
                        </div>
                        <div className="ae-date-sub">{row.daysLabel}</div>
                      </td>
                      <td>
                        <div className="ae-venue">
                          <MapPin size={12} strokeWidth={2} aria-hidden />
                          {row.venue}
                        </div>
                      </td>
                      <td>
                        <span className={`ae-type ${typeClass(row.type)}`}>{row.type}</span>
                      </td>
                      <td>
                        <div className="ae-reg">
                          {row.registered} / {row.capacity}
                        </div>
                        <div className="ae-progressline">
                          <div className="ae-barbg">
                            <div
                              className={`ae-bar${tone ? ` ${tone}` : ""}`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="ae-pct">{pct}%</span>
                        </div>
                      </td>
                      <td>
                        <span className={`ae-status ${row.status.toLowerCase()}`}>{row.status}</span>
                      </td>
                      <td>
                        <Link
                          className="ae-dots"
                          to={`/admin/events/${row.id}/overview`}
                          aria-label={`Open ${row.name}`}
                        >
                          ⋮
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="ae-footer">
          <span>
            Showing {from} to {to} of {filtered.length} events
          </span>
          <div className="ae-pagination">
            <button
              type="button"
              className="ae-pagebtn"
              disabled={safePage <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              aria-label="Previous page"
            >
              ‹
            </button>
            {pageButtons.map((n) => (
              <button
                key={n}
                type="button"
                className={`ae-pagebtn${safePage === n ? " active" : ""}`}
                onClick={() => setPage(n)}
              >
                {n}
              </button>
            ))}
            <button
              type="button"
              className="ae-pagebtn"
              disabled={safePage >= pageCount}
              onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
              aria-label="Next page"
            >
              ›
            </button>
          </div>
          <div className="ae-rows">
            Rows per page{" "}
            <select
              aria-label="Rows per page"
              value={rowsPerPage}
              onChange={(e) => {
                setRowsPerPage(Number(e.target.value));
                setPage(1);
              }}
            >
              <option value={8}>8</option>
              <option value={16}>16</option>
              <option value={24}>24</option>
            </select>
          </div>
        </div>
      </section>
    </section>
  );
}
