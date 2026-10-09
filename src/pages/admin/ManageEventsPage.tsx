import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowDownUp,
  CalendarDays,
  Download,
  ListFilter,
  MapPin,
  MoreVertical,
  Plus,
  Search,
} from "lucide-react";
import type { EventStatus, EventType, ManagedEvent } from "../../data/adminEvents";
import { listEngagements, toManagedEvent } from "../../lib/engagements";
import { ApiError } from "../../lib/api";
import { cn } from "../../lib/cn";

type TabId = "all" | EventStatus;

const glass =
  "rounded-xl border border-[#e0edfb] bg-[rgba(255,255,255,.88)] shadow-[0_5px_20px_rgba(48,112,181,.09)]";

const statusClass = (status: EventStatus) => {
  switch (status) {
    case "Upcoming":
      return "bg-emerald-100 text-emerald-700";
    case "Ongoing":
      return "bg-blue-100 text-blue-700";
    case "Draft":
      return "bg-amber-100 text-amber-700";
    default:
      return "bg-slate-100 text-slate-600";
  }
};

const typeClass = (type: EventType) => {
  switch (type) {
    case "Conference":
    case "Forum":
      return "bg-emerald-100 text-emerald-700";
    case "Workshop":
    case "Training":
      return "bg-blue-100 text-blue-700";
    case "Roundtable":
    case "Seminar":
      return "bg-purple-100 text-purple-700";
    case "Exhibition":
      return "bg-amber-100 text-amber-700";
    case "Webinar":
      return "bg-rose-100 text-rose-600";
    case "Summit":
      return "bg-indigo-100 text-indigo-700";
    default:
      return "bg-slate-100 text-slate-600";
  }
};

const barClass = (tone: ManagedEvent["barTone"]) => {
  switch (tone) {
    case "green":
      return "bg-emerald-500";
    case "blue":
      return "bg-blue-600";
    case "purple":
      return "bg-purple-600";
    case "orange":
      return "bg-amber-500";
    case "red":
      return "bg-rose-500";
    default:
      return "bg-blue-600";
  }
};

/** Admin Events — main content from aca-manage-events-tailwind HTML */
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
    ...(counts.Draft > 0
      ? [{ id: "Draft" as const, label: `Draft (${counts.Draft})` }]
      : []),
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
    <div className="space-y-3 bg-[radial-gradient(ellipse_at_12%_10%,#e0f0ff_0,#f4faff_48%,#e4f2ff_100%)] p-3 text-ink sm:p-4">
      <section className="flex flex-col items-start justify-between gap-4 px-2 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-[36px] font-extrabold leading-tight tracking-tight text-[#07145b]">
            Events
          </h1>
          <p className="text-[15px] text-[#4f5e9a]">
            Manage all events, registrations and activities.
          </p>
        </div>
        <Link
          to="/admin/events/new"
          className="inline-flex items-center gap-2 rounded-lg bg-[#075cff] px-5 py-3 text-[13px] font-semibold text-white shadow-sm hover:bg-blue-700"
        >
          <Plus size={18} strokeWidth={2.5} aria-hidden />
          Create Event
        </Link>
      </section>

      {error ? (
        <div
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          role="alert"
        >
          {error}
        </div>
      ) : null}

      <section className={cn(glass, "overflow-hidden")}>
        <div className="flex flex-col gap-3 border-b border-blue-100 px-4 py-3 lg:flex-row lg:items-center">
          <div
            className="flex min-w-0 flex-1 items-center gap-4 self-stretch overflow-x-auto text-[13px] sm:gap-5"
            role="tablist"
            aria-label="Event status"
          >
            {tabs.map((item) => {
              const active = tab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  className={cn(
                    "relative h-[45px] shrink-0 whitespace-nowrap",
                    active ? "font-bold text-[#075cff]" : "text-slate-600",
                  )}
                  onClick={() => {
                    setTab(item.id);
                    setPage(1);
                  }}
                >
                  {item.label}
                  {active ? (
                    <span className="absolute bottom-0 left-0 right-0 h-[3px] rounded-full bg-[#075cff]" />
                  ) : null}
                </button>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <label className="flex h-[42px] w-full min-w-0 items-center gap-2 rounded-lg bg-blue-50 px-3 text-slate-500 sm:w-[182px]">
              <Search size={16} strokeWidth={2.25} className="shrink-0 text-ink" aria-hidden />
              <span className="sr-only">Search events</span>
              <input
                type="search"
                className="w-full min-w-0 bg-transparent text-[12px] outline-none"
                placeholder="Search events..."
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setPage(1);
                }}
              />
            </label>
            <button
              type="button"
              className="flex h-[42px] items-center gap-2 rounded-lg bg-blue-50 px-4 text-[12px] font-semibold"
            >
              <ListFilter size={16} strokeWidth={2.25} aria-hidden />
              Filters
            </button>
            <button
              type="button"
              className="flex h-[42px] items-center gap-2 rounded-lg bg-blue-50 px-4 text-[12px] font-semibold"
            >
              <Download size={16} strokeWidth={2.25} aria-hidden />
              Export
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] border-collapse text-left text-[12px]">
            <thead className="bg-[#eef6ff] text-ink">
              <tr className="h-[43px] border-b border-blue-100">
                <th className="w-12 px-4">
                  <input
                    type="checkbox"
                    className="h-[18px] w-[18px] accent-blue-600"
                    checked={allChecked}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelected((prev) => [
                          ...new Set([...prev, ...pageRows.map((r) => r.id)]),
                        ]);
                      } else {
                        setSelected((prev) =>
                          prev.filter((id) => !pageRows.some((r) => r.id === id)),
                        );
                      }
                    }}
                    aria-label="Select all on page"
                  />
                </th>
                <th className="px-2 font-bold">
                  <span className="inline-flex items-center gap-1">
                    Event <ArrowDownUp size={10} strokeWidth={2.5} aria-hidden />
                  </span>
                </th>
                <th className="px-2 font-bold">
                  <span className="inline-flex items-center gap-1">
                    Date <ArrowDownUp size={10} strokeWidth={2.5} aria-hidden />
                  </span>
                </th>
                <th className="px-2 font-bold">
                  <span className="inline-flex items-center gap-1">
                    Venue <ArrowDownUp size={10} strokeWidth={2.5} aria-hidden />
                  </span>
                </th>
                <th className="px-2 font-bold">
                  <span className="inline-flex items-center gap-1">
                    Type <ArrowDownUp size={10} strokeWidth={2.5} aria-hidden />
                  </span>
                </th>
                <th className="px-2 font-bold">
                  <span className="inline-flex items-center gap-1">
                    Registrations <ArrowDownUp size={10} strokeWidth={2.5} aria-hidden />
                  </span>
                </th>
                <th className="px-2 font-bold">
                  <span className="inline-flex items-center gap-1">
                    Status <ArrowDownUp size={10} strokeWidth={2.5} aria-hidden />
                  </span>
                </th>
                <th className="px-4 text-center font-bold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-slate-500">
                    Loading events…
                  </td>
                </tr>
              ) : pageRows.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-slate-500">
                    {error
                      ? "Could not load events."
                      : "No events yet. Create your first event."}
                  </td>
                </tr>
              ) : (
                pageRows.map((row) => {
                  const pct =
                    row.capacity > 0
                      ? Math.min(100, Math.round((row.registered / row.capacity) * 100))
                      : 0;
                  return (
                    <tr
                      key={row.id}
                      className="h-[77px] border-b border-blue-100/80 hover:bg-blue-50/50"
                    >
                      <td className="px-4">
                        <input
                          type="checkbox"
                          className="h-[18px] w-[18px] accent-blue-600"
                          checked={selected.includes(row.id)}
                          onChange={(e) => {
                            setSelected((prev) =>
                              e.target.checked
                                ? [...prev, row.id]
                                : prev.filter((id) => id !== row.id),
                            );
                          }}
                          aria-label={`Select ${row.name}`}
                        />
                      </td>
                      <td className="px-2">
                        <Link
                          to={`/admin/events/${row.id}/overview`}
                          className="block text-[13px] font-bold text-[#07145b] hover:underline"
                        >
                          {row.name}
                        </Link>
                        <span className="mt-1 block max-w-[205px] leading-[1.45] text-[#4c5a9c]">
                          {row.subtitle}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-2">
                        <b className="inline-flex items-center gap-1.5">
                          <CalendarDays size={12} strokeWidth={2} aria-hidden />
                          {row.dateLabel}
                        </b>
                        <span className="mt-1 block pl-5 text-slate-500">{row.daysLabel}</span>
                      </td>
                      <td className="whitespace-nowrap px-2">
                        <span className="inline-flex items-center gap-1.5">
                          <MapPin size={12} strokeWidth={2} aria-hidden />
                          {row.venue}
                        </span>
                      </td>
                      <td className="px-2">
                        <span
                          className={cn(
                            "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-[7px] text-[11px]",
                            typeClass(row.type),
                          )}
                        >
                          {row.type}
                        </span>
                      </td>
                      <td className="px-2">
                        <b className="block text-[13px]">
                          {row.registered} / {row.capacity > 0 ? row.capacity : "—"}
                        </b>
                        <div className="mt-1 flex items-center gap-2">
                          <span className="inline-block h-[9px] w-[100px] overflow-hidden rounded-full bg-[#e3edf9] align-middle">
                            <span
                              className={cn("block h-full rounded-full", barClass(row.barTone))}
                              style={{ width: `${pct}%` }}
                            />
                          </span>
                          <span className="text-slate-500">{pct}%</span>
                        </div>
                      </td>
                      <td className="px-2">
                        <span
                          className={cn(
                            "inline-flex items-center justify-center whitespace-nowrap rounded-md px-4 py-[7px] text-[11px]",
                            statusClass(row.status),
                          )}
                        >
                          {row.status}
                        </span>
                      </td>
                      <td className="px-4 text-center">
                        <Link
                          to={`/admin/events/${row.id}/overview`}
                          className="inline-flex place-items-center text-[#075cff]"
                          aria-label={`Open ${row.name}`}
                        >
                          <MoreVertical size={20} strokeWidth={2} aria-hidden />
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <footer className="flex flex-wrap items-center justify-between gap-4 px-4 py-4 text-[12px] text-[#4c5a9c]">
          <span>
            Showing {from} to {to} of {filtered.length} events
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="grid h-10 w-10 place-items-center rounded-lg border border-blue-100 bg-white text-xl text-slate-400 disabled:opacity-40"
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
                className={cn(
                  "grid h-10 w-10 place-items-center rounded-lg border border-blue-100",
                  safePage === n
                    ? "border-transparent bg-blue-100 font-bold text-blue-700"
                    : "bg-white",
                )}
                onClick={() => setPage(n)}
              >
                {n}
              </button>
            ))}
            <button
              type="button"
              className="grid h-10 w-10 place-items-center rounded-lg border border-blue-100 bg-white text-xl text-[#075cff] disabled:opacity-40"
              disabled={safePage >= pageCount}
              onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
              aria-label="Next page"
            >
              ›
            </button>
          </div>
          <label className="flex items-center gap-3">
            Rows per page
            <select
              aria-label="Rows per page"
              className="rounded-lg border border-blue-100 bg-white px-3 py-2 text-ink"
              value={rowsPerPage}
              onChange={(e) => {
                setRowsPerPage(Number(e.target.value));
                setPage(1);
              }}
            >
              <option value={8}>8</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
            </select>
          </label>
        </footer>
      </section>
    </div>
  );
}
