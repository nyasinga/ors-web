import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  CalendarDays,
  CircleDot,
  Copy,
  Download,
  Eye,
  Layers,
  ListFilter,
  MapPin,
  MoreVertical,
  Pencil,
  Plus,
  Search,
  Star,
  Trash2,
  Users,
} from "lucide-react";
import type { EventStatus, EventType, ManagedEvent } from "../../data/adminEvents";
import {
  deleteEngagement,
  duplicateEngagement,
  listEngagements,
  setFeaturedEngagement,
  toManagedEvent,
} from "../../lib/engagements";
import { ScrollableNav } from "../../components/ui/ScrollableNav";
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

function csvEscape(value: string) {
  if (/[",\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

/** Admin Events — main content from aca-manage-events-tailwind HTML */
export function ManageEventsPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<TabId>("all");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(8);
  const [selected, setSelected] = useState<string[]>([]);
  const [events, setEvents] = useState<ManagedEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [menuId, setMenuId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<EventType | "all">("all");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<ManagedEvent | "bulk" | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const filtersRef = useRef<HTMLDivElement | null>(null);

  const redirectIfUnauthorized = (err: unknown) => {
    if (err instanceof ApiError && err.status === 401) {
      navigate("/admin-login", { replace: true, state: { from: "/admin/events" } });
      return true;
    }
    return false;
  };

  const loadEvents = async () => {
    setLoading(true);
    setError(null);
    try {
      const rows = await listEngagements({
        limit: 200,
        order: ["startDate DESC"],
      });
      setEvents((rows ?? []).map(toManagedEvent).filter((e) => e.id));
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Failed to load events";
      setError(message);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

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

  useEffect(() => {
    if (!menuId && !filtersOpen) return;
    const onPointer = (e: MouseEvent) => {
      const target = e.target as Node;
      if (menuRef.current && !menuRef.current.contains(target)) setMenuId(null);
      if (filtersRef.current && !filtersRef.current.contains(target)) setFiltersOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMenuId(null);
        setFiltersOpen(false);
      }
    };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuId, filtersOpen]);

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
      const matchType = typeFilter === "all" || e.type === typeFilter;
      const q = query.trim().toLowerCase();
      const matchQ =
        !q ||
        e.name.toLowerCase().includes(q) ||
        e.subtitle.toLowerCase().includes(q) ||
        e.venue.toLowerCase().includes(q);
      return matchTab && matchType && matchQ;
    });
  }, [events, tab, query, typeFilter]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / rowsPerPage));
  const safePage = Math.min(page, pageCount);
  const pageRows = filtered.slice((safePage - 1) * rowsPerPage, safePage * rowsPerPage);
  const from = filtered.length === 0 ? 0 : (safePage - 1) * rowsPerPage + 1;
  const to = Math.min(safePage * rowsPerPage, filtered.length);

  const pageButtons = Array.from({ length: Math.min(pageCount, 5) }, (_, i) => {
    if (pageCount <= 5) return i + 1;
    const start = Math.min(Math.max(1, safePage - 2), pageCount - 4);
    return start + i;
  });

  const eventTypes = useMemo(() => {
    const set = new Set<EventType>();
    for (const e of events) set.add(e.type);
    return Array.from(set).sort();
  }, [events]);

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    setActionError(null);
    setMenuId(null);

    if (pendingDelete === "bulk") {
      if (selected.length === 0) {
        setPendingDelete(null);
        return;
      }
      setBusyId("bulk");
      const ids = [...selected];
      const failed: string[] = [];
      let unauthorized = false;
      for (const id of ids) {
        try {
          await deleteEngagement(id);
        } catch (err) {
          if (redirectIfUnauthorized(err)) {
            unauthorized = true;
            break;
          }
          failed.push(id);
        }
      }
      if (unauthorized) {
        setBusyId(null);
        setPendingDelete(null);
        return;
      }
      setEvents((prev) => prev.filter((e) => !ids.includes(e.id) || failed.includes(e.id)));
      setSelected(failed);
      if (failed.length) {
        setActionError(`Could not delete ${failed.length} event${failed.length === 1 ? "" : "s"}.`);
      }
      setBusyId(null);
      setPendingDelete(null);
      return;
    }

    const row = pendingDelete;
    setBusyId(row.id);
    try {
      await deleteEngagement(row.id);
      setEvents((prev) => prev.filter((e) => e.id !== row.id));
      setSelected((prev) => prev.filter((id) => id !== row.id));
      setPendingDelete(null);
    } catch (err) {
      if (redirectIfUnauthorized(err)) return;
      setActionError(
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Failed to delete event",
      );
    } finally {
      setBusyId(null);
    }
  };

  const handleDuplicate = async (row: ManagedEvent) => {
    setBusyId(row.id);
    setActionError(null);
    setMenuId(null);
    try {
      const created = await duplicateEngagement(row.id);
      const newId = created.engagementID;
      await loadEvents();
      if (newId) navigate(`/admin/events/${newId}/edit`);
    } catch (err) {
      if (redirectIfUnauthorized(err)) return;
      setActionError(
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Failed to duplicate event",
      );
    } finally {
      setBusyId(null);
    }
  };

  const handleFeature = async (row: ManagedEvent) => {
    setBusyId(row.id);
    setActionError(null);
    setMenuId(null);
    try {
      await setFeaturedEngagement(row.id, !row.isFeatured);
      await loadEvents();
    } catch (err) {
      if (redirectIfUnauthorized(err)) return;
      setActionError(
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Failed to update homepage feature",
      );
    } finally {
      setBusyId(null);
    }
  };

  const handleExport = () => {
    const header = ["Name", "Subtitle", "Date", "Venue", "Type", "Registered", "Capacity", "Status"];
    const lines = [
      header.join(","),
      ...filtered.map((e) =>
        [
          csvEscape(e.name),
          csvEscape(e.subtitle),
          csvEscape(e.dateLabel),
          csvEscape(e.venue),
          csvEscape(e.type),
          String(e.registered),
          e.capacity > 0 ? String(e.capacity) : "",
          csvEscape(e.status),
        ].join(","),
      ),
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `events-export-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-full space-y-4 bg-[radial-gradient(ellipse_at_12%_0%,#eaf4ff_0,#f8fbff_48%,#eef5ff_100%)] p-3 text-ink sm:space-y-5 sm:p-5 lg:p-6">
      <section className="flex flex-col items-stretch justify-between gap-3 px-1 sm:flex-row sm:items-end sm:px-2">
        <div>
          <h1 className="text-2xl font-extrabold leading-tight tracking-tight text-[#07145b] sm:text-3xl lg:text-[36px]">
            Events
          </h1>
          <p className="mt-1 text-sm text-[#4f5e9a] sm:text-[15px]">
            Manage all events, registrations and activities.
          </p>
        </div>
        <Link
          to="/admin/events/new"
          className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#075cff] px-5 py-3 text-sm font-bold text-white shadow-md shadow-blue-600/15 transition hover:bg-blue-700 sm:w-auto"
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

      {actionError ? (
        <div
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          role="alert"
        >
          {actionError}
        </div>
      ) : null}

      {selected.length > 0 ? (
        <div
          className={cn(
            glass,
            "flex flex-wrap items-center justify-between gap-3 px-4 py-3",
          )}
        >
          <p className="text-[13px] font-semibold text-[#07145b]">
            {selected.length} selected
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              className="rounded-lg border border-blue-100 bg-white px-3 py-2 text-[15px] font-semibold text-slate-600 hover:bg-blue-50"
              onClick={() => setSelected([])}
            >
              Clear
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-lg bg-rose-600 px-3 py-2 text-[15px] font-semibold text-white hover:bg-rose-700 disabled:opacity-60"
              disabled={busyId === "bulk"}
              onClick={() => setPendingDelete("bulk")}
            >
              <Trash2 size={14} strokeWidth={2.25} aria-hidden />
              {busyId === "bulk" ? "Deleting…" : "Delete selected"}
            </button>
          </div>
        </div>
      ) : null}

      <section className={cn(glass, "overflow-visible md:overflow-hidden")}>
        <div className="flex flex-col gap-3 rounded-t-xl border-b border-blue-100 bg-white/80 p-3 sm:p-4 lg:flex-row lg:items-center">
          <ScrollableNav
            activeKey={tab}
            aria-label="Event status"
            className="min-w-0 w-full flex-1 self-stretch text-xs sm:text-[13px]"
            trackClassName="items-center gap-4 self-stretch sm:gap-5"
          >
            {tabs.map((item) => {
              const active = tab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  data-nav-id={item.id}
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
          </ScrollableNav>

          <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center sm:gap-3">
            <label className="col-span-2 flex h-11 w-full min-w-0 items-center gap-2 rounded-xl border border-blue-100 bg-blue-50/70 px-3 text-slate-500 sm:col-span-1 sm:w-[220px]">
              <Search size={16} strokeWidth={2.25} className="shrink-0 text-ink" aria-hidden />
              <span className="sr-only">Search events</span>
              <input
                type="search"
                className="w-full min-w-0 bg-transparent text-[15px] outline-none"
                placeholder="Search events..."
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setPage(1);
                }}
              />
            </label>

            <div className="relative" ref={filtersRef}>
              <button
                type="button"
                className={cn(
                  "flex h-[42px] items-center gap-2 rounded-lg bg-blue-50 px-4 text-[15px] font-semibold",
                  typeFilter !== "all" && "ring-2 ring-[#075cff]/30",
                )}
                aria-expanded={filtersOpen}
                aria-haspopup="listbox"
                onClick={() => setFiltersOpen((v) => !v)}
              >
                <ListFilter size={16} strokeWidth={2.25} aria-hidden />
                Filters{typeFilter !== "all" ? ` · ${typeFilter}` : ""}
              </button>
              {filtersOpen ? (
                <div
                  className="absolute right-0 z-30 mt-1 min-w-[180px] rounded-lg border border-blue-100 bg-white py-1 shadow-lg"
                  role="listbox"
                  aria-label="Filter by type"
                >
                  <button
                    type="button"
                    role="option"
                    aria-selected={typeFilter === "all"}
                    className={cn(
                      "block w-full px-3 py-2 text-left text-[15px] hover:bg-blue-50",
                      typeFilter === "all" && "font-bold text-[#075cff]",
                    )}
                    onClick={() => {
                      setTypeFilter("all");
                      setPage(1);
                      setFiltersOpen(false);
                    }}
                  >
                    All types
                  </button>
                  {eventTypes.map((type) => (
                    <button
                      key={type}
                      type="button"
                      role="option"
                      aria-selected={typeFilter === type}
                      className={cn(
                        "block w-full px-3 py-2 text-left text-[15px] hover:bg-blue-50",
                        typeFilter === type && "font-bold text-[#075cff]",
                      )}
                      onClick={() => {
                        setTypeFilter(type);
                        setPage(1);
                        setFiltersOpen(false);
                      }}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>

            <button
              type="button"
              className="flex h-11 min-w-0 items-center justify-center gap-2 rounded-xl border border-blue-100 bg-blue-50/70 px-3 text-sm font-semibold hover:bg-blue-100 sm:px-4"
              onClick={handleExport}
              disabled={filtered.length === 0}
            >
              <Download size={16} strokeWidth={2.25} aria-hidden />
              Export
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 p-3 md:hidden">
          {loading ? <div className={cn(glass, "px-4 py-10 text-center text-sm text-slate-500")}>Loading events…</div> : pageRows.length === 0 ? <div className={cn(glass, "px-4 py-10 text-center text-sm text-slate-500")}>{error ? "Could not load events." : "No events yet. Create your first event."}</div> : pageRows.map((row) => {
            const pct = row.capacity > 0 ? Math.min(100, Math.round((row.registered / row.capacity) * 100)) : 0;
            const open = menuId === row.id;
            const busy = busyId === row.id;
            return (
              <article key={row.id} className="overflow-visible rounded-2xl border border-blue-100 bg-white p-4 shadow-[0_4px_16px_rgba(48,112,181,.08)]">
                <div className="flex items-start gap-3">
                  <input type="checkbox" className="mt-1 h-5 w-5 shrink-0 accent-blue-600" checked={selected.includes(row.id)} onChange={(e) => setSelected((prev) => e.target.checked ? [...prev, row.id] : prev.filter((id) => id !== row.id))} aria-label={`Select ${row.name}`} />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={cn("rounded-md px-2 py-1 text-[11px] font-bold", statusClass(row.status))}>{row.status}</span>
                      <span className={cn("rounded-md px-2 py-1 text-[11px] font-semibold", typeClass(row.type))}>{row.type}</span>
                      {row.isFeatured ? <span className="inline-flex items-center gap-1 rounded-md bg-amber-100 px-2 py-1 text-[11px] font-semibold text-amber-800"><Star size={11} /> Featured</span> : null}
                    </div>
                    <Link to={`/admin/events/${row.id}/overview`} className="mt-2 block break-words text-base font-extrabold leading-snug text-[#07145b] hover:text-[#075cff]">{row.name}</Link>
                    {row.subtitle ? <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-slate-500">{row.subtitle}</p> : null}
                  </div>
                  <div className="relative shrink-0" ref={open ? menuRef : undefined}>
                    <button type="button" className="grid h-9 w-9 place-items-center rounded-lg border border-blue-100 text-slate-600 hover:bg-blue-50 disabled:opacity-50" aria-label={`More actions for ${row.name}`} aria-expanded={open} aria-haspopup="menu" disabled={busy} onClick={() => setMenuId(open ? null : row.id)}><MoreVertical size={18} /></button>
                    {open ? <div className="absolute right-0 top-10 z-40 w-48 rounded-xl border border-blue-100 bg-white py-1 text-left shadow-xl" role="menu">
                      <Link role="menuitem" to={`/admin/events/${row.id}/overview`} className="flex items-center gap-2 px-3 py-2.5 text-sm text-[#07145b] hover:bg-blue-50" onClick={() => setMenuId(null)}><Eye size={15} /> View</Link>
                      <Link role="menuitem" to={`/admin/events/${row.id}/edit`} className="flex items-center gap-2 px-3 py-2.5 text-sm text-[#07145b] hover:bg-blue-50" onClick={() => setMenuId(null)}><Pencil size={15} /> Edit</Link>
                      <button type="button" role="menuitem" className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-[#07145b] hover:bg-blue-50 disabled:opacity-50" disabled={busy} onClick={() => void handleDuplicate(row)}><Copy size={15} /> Duplicate</button>
                      <button type="button" role="menuitem" className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-[#07145b] hover:bg-blue-50 disabled:opacity-50" disabled={busy} onClick={() => void handleFeature(row)}><Star size={15} className={row.isFeatured ? "fill-amber-400 text-amber-500" : undefined} />{row.isFeatured ? "Deactivate event" : "Activate event"}</button>
                      <button type="button" role="menuitem" className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-rose-600 hover:bg-rose-50 disabled:opacity-50" disabled={busy} onClick={() => { setMenuId(null); setPendingDelete(row); }}><Trash2 size={15} /> Delete</button>
                    </div> : null}
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-1 gap-3 border-t border-blue-50 pt-3 sm:grid-cols-2">
                  <div className="flex min-w-0 items-start gap-2 text-sm text-slate-600"><CalendarDays size={16} className="mt-0.5 shrink-0 text-[#075cff]" /><div className="min-w-0"><p className="font-semibold text-slate-800">{row.dateLabel}</p><p className="text-xs text-slate-500">{row.daysLabel}</p></div></div>
                  <div className="flex min-w-0 items-start gap-2 text-sm text-slate-600"><MapPin size={16} className="mt-0.5 shrink-0 text-[#075cff]" /><span className="break-words">{row.venue || "Venue not specified"}</span></div>
                </div>
                <div className="mt-4 rounded-xl bg-blue-50/70 p-3">
                  <div className="mb-2 flex items-center justify-between gap-3 text-xs"><span className="font-semibold text-slate-700">Registrations</span><span className="font-bold text-[#07145b]">{row.registered} / {row.capacity > 0 ? row.capacity : "—"} <span className="font-medium text-slate-500">({pct}%)</span></span></div>
                  <div className="h-2 overflow-hidden rounded-full bg-blue-100"><div className={cn("h-full rounded-full transition-all", barClass(row.barTone))} style={{ width: `${pct}%` }} /></div>
                </div>
              </article>
            );
          })}
        </div>
        <div className="hidden md:block">
          {loading ? <div className="px-5 py-12 text-center text-sm text-slate-500">Loading events…</div> : pageRows.length === 0 ? <div className="px-5 py-12 text-center text-sm text-slate-500">{error ? "Could not load events." : "No events yet. Create your first event."}</div> : <div className="divide-y divide-blue-100/90">
            {pageRows.map((row) => {
              const pct = row.capacity > 0 ? Math.min(100, Math.round((row.registered / row.capacity) * 100)) : 0;
              const open = menuId === row.id;
              const busy = busyId === row.id;
              return <article key={row.id} className="group px-5 py-3.5 transition-colors hover:bg-blue-50/40">
                <div className="flex min-w-0 items-start gap-3">
                  <input type="checkbox" className="mt-1 h-[18px] w-[18px] shrink-0 accent-blue-600" checked={selected.includes(row.id)} onChange={(e) => setSelected((prev) => e.target.checked ? [...prev, row.id] : prev.filter((id) => id !== row.id))} aria-label={`Select ${row.name}`} />
                  <div className="min-w-0 flex-1">
                    <div className="flex min-w-0 items-center gap-2">
                      <Link to={`/admin/events/${row.id}/overview`} title={row.name} className="min-w-0 flex-1 truncate text-[16px] font-extrabold leading-6 tracking-[-.02em] text-[#10245b] hover:text-[#075cff]">{row.name}</Link>
                      {row.isFeatured ? <span className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-800"><Star size={12} /> Active</span> : null}
                    </div>
                    {row.subtitle ? <p className="mt-0.5 line-clamp-1 text-[12px] leading-4 text-[#596ba6]" title={row.subtitle}>{row.subtitle}</p> : null}
                    <div className="mt-3 grid grid-cols-[minmax(155px,.85fr)_minmax(240px,1.45fr)_minmax(105px,.65fr)_minmax(145px,.9fr)_minmax(105px,.7fr)_52px] items-center gap-4">
                      <div className="min-w-0"><div className="flex items-center gap-1.5 whitespace-nowrap text-[13px] font-bold text-[#18264b]"><CalendarDays size={12} className="shrink-0 text-[#52658f]" />{row.dateLabel}</div><p className="mt-0.5 pl-[18px] text-[11px] text-slate-500">{row.daysLabel}</p></div>
                      <div className="flex min-w-0 items-center gap-1.5 text-[13px] text-[#202e50]" title={row.venue}><MapPin size={12} className="shrink-0 text-[#52658f]" /><span className="truncate">{row.venue || "Venue not specified"}</span></div>
                      <div className="flex flex-col items-start gap-1.5">
                        <span className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.07em] text-slate-400">
                          <Layers size={11} strokeWidth={1.8} />
                          Type
                        </span>
                        <span className={cn("inline-flex whitespace-nowrap rounded-md px-2.5 py-1.5 text-[12px] font-medium", typeClass(row.type))}>
                          {row.type}
                        </span>
                      </div>

                      <div className="min-w-0">
                        <div className="mb-1.5 flex items-center justify-between gap-2">
                          <span className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.07em] text-slate-400">
                            <Users size={11} strokeWidth={1.8} />
                            Registrations
                          </span>
                          <span className="text-[11px] font-medium tabular-nums text-slate-400">
                            {pct}%
                          </span>
                        </div>
                        <div className="flex items-baseline justify-between gap-2 text-[13px] font-semibold tabular-nums text-[#18264b]">
                          <span>{row.registered} <span className="font-normal text-slate-400">/ {row.capacity > 0 ? row.capacity : "—"}</span></span>
                        </div>
                        <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-100">
                          <div className={cn("h-full rounded-full transition-all", barClass(row.barTone))} style={{ width: `${pct}%` }} />
                        </div>
                      </div>

                      <div className="flex flex-col items-start gap-1.5">
                        <span className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.07em] text-slate-400">
                          <CircleDot size={11} strokeWidth={1.8} />
                          Status
                        </span>
                        <span className={cn("inline-flex whitespace-nowrap rounded-md px-2.5 py-1.5 text-[12px] font-medium", statusClass(row.status))}>
                          {row.status}
                        </span>
                      </div>
                      <div className="relative flex items-center justify-end gap-1" ref={open ? menuRef : undefined}>
                        <Link to={`/admin/events/${row.id}/edit`} className="grid h-9 w-9 place-items-center rounded-lg text-[#075cff] hover:bg-blue-100" aria-label={`Edit ${row.name}`} title="Edit"><Pencil size={17} /></Link>
                        <button type="button" className="grid h-9 w-8 place-items-center rounded-lg text-[#075cff] hover:bg-blue-100 disabled:opacity-50" aria-label={`More actions for ${row.name}`} aria-expanded={open} aria-haspopup="menu" disabled={busy} onClick={() => setMenuId(open ? null : row.id)}><MoreVertical size={19} /></button>
                        {open ? <div className="absolute right-0 top-10 z-40 w-52 rounded-xl border border-blue-100 bg-white py-1 text-left shadow-xl" role="menu">
                          <Link role="menuitem" to={`/admin/events/${row.id}/overview`} className="flex items-center gap-2 px-3 py-2.5 text-sm text-[#07145b] hover:bg-blue-50" onClick={() => setMenuId(null)}><Eye size={15} />View</Link>
                          <Link role="menuitem" to={`/admin/events/${row.id}/edit`} className="flex items-center gap-2 px-3 py-2.5 text-sm text-[#07145b] hover:bg-blue-50" onClick={() => setMenuId(null)}><Pencil size={15} />Edit</Link>
                          <button type="button" role="menuitem" className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-[#07145b] hover:bg-blue-50 disabled:opacity-50" disabled={busy} onClick={() => void handleDuplicate(row)}><Copy size={15} />Duplicate</button>
                          <button type="button" role="menuitem" className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-[#07145b] hover:bg-blue-50 disabled:opacity-50" disabled={busy} onClick={() => void handleFeature(row)}><Star size={15} className={row.isFeatured ? "fill-amber-400 text-amber-500" : undefined} />{row.isFeatured ? "Deactivate event" : "Activate event"}</button>
                          <button type="button" role="menuitem" className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-rose-600 hover:bg-rose-50 disabled:opacity-50" disabled={busy} onClick={() => {setMenuId(null);setPendingDelete(row);}}><Trash2 size={15} />Delete</button>
                        </div> : null}
                      </div>
                    </div>
                  </div>
                </div>
              </article>;
            })}
          </div>}
        </div>
        <footer className="flex flex-col items-stretch justify-between gap-3 border-t border-blue-100 px-3 py-4 text-sm text-[#4c5a9c] sm:flex-row sm:flex-wrap sm:items-center sm:px-4">
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

      {pendingDelete ? (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-[rgba(7,20,91,.45)] p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-event-title"
        >
          <div className="w-full max-w-md rounded-xl border border-blue-100 bg-white p-5 shadow-xl">
            <h2 id="delete-event-title" className="text-[18px] font-extrabold text-[#07145b]">
              Delete event?
            </h2>
            <p className="mt-2 text-[13px] leading-[1.45] text-[#4f5e9a]">
              {pendingDelete === "bulk"
                ? `Delete ${selected.length} selected event${selected.length === 1 ? "" : "s"}? This cannot be undone.`
                : `Delete “${pendingDelete.name}”? This cannot be undone.`}
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                className="rounded-lg border border-blue-100 bg-white px-4 py-2 text-[15px] font-semibold text-slate-600 hover:bg-slate-50"
                disabled={Boolean(busyId)}
                onClick={() => setPendingDelete(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="rounded-lg bg-rose-600 px-4 py-2 text-[15px] font-semibold text-white hover:bg-rose-700 disabled:opacity-60"
                disabled={Boolean(busyId)}
                onClick={() => void confirmDelete()}
              >
                {busyId ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
