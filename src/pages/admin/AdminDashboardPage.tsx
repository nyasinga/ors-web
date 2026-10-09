import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Building2,
  CalendarDays,
  Check,
  Clock3,
  CreditCard,
  FileBarChart,
  IdCard,
  MessageSquare,
  Mic2,
  Users,
  X,
  Zap,
} from "lucide-react";
import { useAuthUser } from "../../hooks/useAuthUser";
import { useEventCopy } from "../../i18n/useEventCopy";
import { displayName } from "../../lib/auth";
import { cn } from "../../lib/cn";
import {
  buildDashboardSnapshot,
  listEngagements,
  toDashboardUpcoming,
  toUiListStatus,
  type DashboardUpcomingItem,
} from "../../lib/engagements";
import type { Engagement } from "../../types/engagement";

const glass =
  "rounded-xl border border-[rgba(215,231,248,.95)] bg-[rgba(255,255,255,.86)] shadow-[0_5px_22px_rgba(56,126,190,.09)]";

const kpiMeta = [
  {
    Icon: Users,
    iconWrap: "bg-blue-100 text-blue-600",
    spark:
      "M2 30 C25 24 29 34 48 26 S70 25 88 17 S106 24 126 12 S152 14 178 3",
    stroke: "#0874ed",
  },
  {
    Icon: IdCard,
    iconWrap: "bg-green-100 text-green-600",
    spark:
      "M2 31 C25 27 28 30 48 22 S70 27 88 17 S111 21 127 10 S152 12 178 2",
    stroke: "#05a650",
  },
  {
    Icon: Mic2,
    iconWrap: "bg-violet-100 text-violet-600",
    spark:
      "M2 31 C24 31 32 23 50 26 S71 20 90 20 S113 11 131 15 S153 7 178 2",
    stroke: "#8b35f4",
  },
  {
    Icon: Building2,
    iconWrap: "bg-orange-100 text-orange-500",
    spark:
      "M2 31 C24 29 34 23 51 26 S72 17 91 21 S112 12 130 15 S154 6 178 3",
    stroke: "#ff8700",
  },
] as const;

const payMetricMeta = [
  {
    wrap: "bg-blue-50",
    iconWrap: "rounded-lg bg-blue-100 text-blue-600",
    Icon: CreditCard,
    trend: "text-slate-500",
  },
  {
    wrap: "bg-green-50",
    iconWrap: "rounded-full bg-green-600 text-white",
    Icon: Check,
    trend: "text-slate-500",
  },
  {
    wrap: "bg-amber-50",
    iconWrap: "rounded-full bg-amber-100 text-amber-600",
    Icon: Clock3,
    trend: "text-slate-500",
  },
  {
    wrap: "bg-red-50",
    iconWrap: "rounded-full bg-red-500 text-white",
    Icon: X,
    trend: "text-slate-500",
  },
] as const;

function formatHeroDates(engagement: Engagement | null, fallback: string) {
  if (!engagement?.startDate) return fallback;
  const start = new Date(engagement.startDate);
  const end = engagement.endDate ? new Date(engagement.endDate) : start;
  if (Number.isNaN(start.getTime())) return fallback;
  const opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "short", year: "numeric" };
  if (Number.isNaN(end.getTime()) || start.toDateString() === end.toDateString()) {
    return start.toLocaleDateString("en-GB", opts);
  }
  const sameMonth =
    start.getFullYear() === end.getFullYear() && start.getMonth() === end.getMonth();
  if (sameMonth) {
    return `${start.getDate()}–${end.getDate()} ${start.toLocaleDateString("en-GB", {
      month: "short",
      year: "numeric",
    })}`;
  }
  return `${start.toLocaleDateString("en-GB", opts)} – ${end.toLocaleDateString("en-GB", opts)}`;
}

function formatMoney(amount: number, currency: string) {
  if (!amount) return `${currency} 0`;
  if (amount >= 1_000_000) return `${currency} ${(amount / 1_000_000).toFixed(2)}M`;
  if (amount >= 1_000) return `${currency} ${Math.round(amount).toLocaleString()}`;
  return `${currency} ${amount.toLocaleString()}`;
}

function statusTone(status: string) {
  switch (status) {
    case "Upcoming":
    case "Published":
      return "bg-green-100 text-green-700";
    case "Ongoing":
      return "bg-blue-100 text-blue-700";
    case "Draft":
      return "bg-amber-100 text-amber-700";
    default:
      return "bg-slate-100 text-slate-600";
  }
}

/** Admin dashboard — live engagement aggregates from the API */
export function AdminDashboardPage() {
  const event = useEventCopy();
  const user = useAuthUser();
  const welcome =
    displayName(user, "there").split(/\s+/).filter(Boolean)[0] ?? "there";

  const [engagements, setEngagements] = useState<Engagement[]>([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setEventsLoading(true);
      setLoadError(null);
      try {
        const rows = await listEngagements({
          limit: 200,
          order: ["startDate ASC"],
        });
        if (!cancelled) setEngagements(rows ?? []);
      } catch (err) {
        if (!cancelled) {
          setEngagements([]);
          setLoadError(err instanceof Error ? err.message : "Failed to load dashboard data");
        }
      } finally {
        if (!cancelled) setEventsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const snapshot = useMemo(() => buildDashboardSnapshot(engagements), [engagements]);

  const kpis = useMemo(() => {
    const s = snapshot.kpis;
    return [
      {
        label: "Total Events",
        value: eventsLoading ? "…" : s.totalEvents.toLocaleString(),
        trend: eventsLoading ? "—" : `${s.publishedEvents} published`,
      },
      {
        label: "Upcoming Events",
        value: eventsLoading ? "…" : s.upcomingEvents.toLocaleString(),
        trend: eventsLoading ? "—" : `${s.draftEvents} drafts`,
      },
      {
        label: "Speakers",
        value: eventsLoading ? "…" : s.speakers.toLocaleString(),
        trend: eventsLoading ? "—" : "Across all events",
      },
      {
        label: "Sponsors & Exhibitors",
        value: eventsLoading ? "…" : s.sponsors.toLocaleString(),
        trend: eventsLoading ? "—" : "Across all events",
      },
    ];
  }, [snapshot, eventsLoading]);

  const paymentCards = useMemo(() => {
    const s = snapshot.kpis;
    return [
      {
        label: "Ticket Inventory Value",
        value: eventsLoading ? "…" : formatMoney(snapshot.estimatedTicketValue, s.currency),
        trend: "From ticket capacities",
      },
      {
        label: "Total Capacity",
        value: eventsLoading ? "…" : s.totalCapacity.toLocaleString(),
        trend: `${s.ticketTypes} ticket types`,
      },
      {
        label: "Payments Enabled",
        value: eventsLoading ? "…" : s.paymentEnabledEvents.toLocaleString(),
        trend: "Events accepting pay",
      },
      {
        label: "Registrations",
        value: eventsLoading ? "…" : s.totalRegistrations.toLocaleString(),
        trend: s.totalRegistrations ? "Recorded on events" : "No registrant feed yet",
      },
    ];
  }, [snapshot, eventsLoading]);

  const upcomingEvents = useMemo(() => {
    const items: DashboardUpcomingItem[] = [];
    const sorted = [...engagements].sort((a, b) => {
      const aT = a.startDate ? new Date(a.startDate).getTime() : Number.POSITIVE_INFINITY;
      const bT = b.startDate ? new Date(b.startDate).getTime() : Number.POSITIVE_INFINITY;
      return aT - bT;
    });
    for (const row of sorted) {
      const status = toUiListStatus(row);
      if (status !== "Upcoming" && status !== "Ongoing") continue;
      const item = toDashboardUpcoming(row);
      if (item) items.push(item);
      if (items.length >= 4) break;
    }
    return items;
  }, [engagements]);

  const featured = useMemo(() => {
    const published = engagements.find(
      (e) => e.isPublished || e.status === "published" || e.status === "ongoing",
    );
    return published ?? engagements[0] ?? null;
  }, [engagements]);

  const heroDates = formatHeroDates(featured, event.dates);
  const heroVenue = featured?.venue?.trim() || "Kenyatta International Convention Centre (KICC)";
  const heroCity = [featured?.city, featured?.country === "KE" ? "Kenya" : featured?.country]
    .filter(Boolean)
    .join(", ") || "Nairobi, Kenya";

  const methodGradient = useMemo(() => {
    if (snapshot.paymentMethods.length === 0) {
      return "conic-gradient(#e2e8f0 0 100%)";
    }
    let cursor = 0;
    const stops = snapshot.paymentMethods.map((m) => {
      const start = cursor;
      cursor += m.value;
      return `${m.color} ${start}% ${cursor}%`;
    });
    if (cursor < 100) stops.push(`#e2e8f0 ${cursor}% 100%`);
    return `conic-gradient(${stops.join(", ")})`;
  }, [snapshot.paymentMethods]);

  const participantsLink = featured?.engagementID
    ? `/admin/events/${featured.engagementID}/participants`
    : "/admin/events";

  return (
    <div className="space-y-3 bg-[radial-gradient(ellipse_at_4%_10%,#dcefff_0,#eef7ff_45%,#e4f2ff_100%)] p-3 text-ink sm:p-4">
      {/* Hero */}
      <section
        className="relative min-h-[170px] overflow-hidden rounded-xl shadow-[0_8px_28px_rgba(36,105,180,.10)]"
        style={{
          background:
            "linear-gradient(90deg, rgba(2,68,145,.98) 0%, rgba(5,91,177,.92) 37%, rgba(6,100,191,.48) 65%, rgba(4,85,170,.2) 100%), linear-gradient(180deg, #5aa9f7, #0755a9)",
        }}
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-50"
          aria-hidden
          style={{
            background:
              "linear-gradient(to top, rgba(5,38,79,.9) 0 10%, transparent 10%), linear-gradient(to top, #183f6a 0 23%, transparent 23%) 68% 100% / 4% 100% no-repeat, linear-gradient(to top, #1d4d7a 0 38%, transparent 38%) 73% 100% / 5% 100% no-repeat, linear-gradient(to top, #1b4975 0 28%, transparent 28%) 79% 100% / 4% 100% no-repeat, linear-gradient(to top, #16436f 0 52%, transparent 52%) 84% 100% / 6% 100% no-repeat, linear-gradient(to top, #174674 0 32%, transparent 32%) 91% 100% / 4% 100% no-repeat, linear-gradient(to top, #153e68 0 25%, transparent 25%) 96% 100% / 5% 100% no-repeat",
          }}
        />
        <div
          className="pointer-events-none absolute inset-x-[-4%] bottom-0 h-[33%]"
          aria-hidden
          style={{
            background: "linear-gradient(180deg, transparent, rgba(4,44,82,.55))",
            clipPath:
              "polygon(0 80%, 12% 40%, 25% 72%, 40% 22%, 56% 75%, 68% 38%, 81% 68%, 100% 18%, 100% 100%, 0 100%)",
          }}
        />
        <div className="relative z-[1] flex h-full min-h-[170px] flex-col items-start gap-4 px-5 py-5 sm:flex-row sm:items-center sm:gap-6 sm:px-7">
          <div className="min-w-0 flex-1 text-white">
            <div className="text-[14px]">Welcome back,</div>
            <h1 className="mt-0.5 text-4xl font-extrabold leading-none tracking-tight sm:text-[44px]">
              {welcome}
            </h1>
            <p className="mt-2 text-[12px] text-blue-50">
              Live event activity from your engagements database.
            </p>
          </div>

          <div className="flex items-center gap-4 border-white/70 text-white sm:border-l sm:pl-6">
            <CalendarDays size={28} strokeWidth={1.8} className="shrink-0 opacity-95" aria-hidden />
            <div className="text-[12px] leading-[1.6]">
              <b className="text-[13px]">{heroDates}</b>
              <br />
              {heroVenue}
              <br />
              {heroCity}
            </div>
          </div>

          <div className="absolute right-3 top-3 rounded-lg bg-white/10 px-3 py-2 sm:static sm:self-start">
            <img
              src="/assets/logo-isippe.png"
              alt="ISIPPE 2026"
              className="h-14 w-auto object-contain drop-shadow-md sm:h-16"
            />
          </div>
        </div>
      </section>

      {loadError ? (
        <div
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          role="alert"
        >
          {loadError}
        </div>
      ) : null}

      {/* KPI cards */}
      <section className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
        {kpis.map((kpi, i) => {
          const meta = kpiMeta[i];
          const Icon = meta.Icon;
          return (
            <article
              key={kpi.label}
              className={cn(glass, "relative min-w-0 overflow-hidden p-3 shadow-card")}
            >
              <div className="flex gap-3">
                <div
                  className={cn(
                    "grid h-14 w-14 shrink-0 place-items-center rounded-xl",
                    meta.iconWrap,
                  )}
                >
                  <Icon size={26} strokeWidth={1.8} aria-hidden />
                </div>
                <div>
                  <div className="text-[21px] font-extrabold">{kpi.value}</div>
                  <div className="text-[11px] text-slate-600">{kpi.label}</div>
                  <div className="mt-1 text-[12px] font-bold text-green-600">{kpi.trend}</div>
                </div>
              </div>
              <svg
                className="absolute bottom-1 right-2 block h-[34px] w-[70%]"
                viewBox="0 0 180 35"
                aria-hidden
              >
                <path
                  d={meta.spark}
                  fill="none"
                  stroke={meta.stroke}
                  strokeWidth={2}
                  strokeLinecap="round"
                />
              </svg>
            </article>
          );
        })}
      </section>

      {/* Capacity / payments overview from engagement ticket data */}
      <section className="grid grid-cols-1 gap-2.5 lg:grid-cols-[1.65fr_1fr]">
        <article className={cn(glass, "p-3 shadow-card")}>
          <div className="flex items-center justify-between gap-2">
            <h2 className="flex items-center gap-2 text-[15px] font-extrabold">
              <CreditCard size={18} strokeWidth={2} className="text-blue-600" aria-hidden />
              Event Capacity Overview
            </h2>
            <span className="rounded-lg border border-blue-100 bg-white px-3 py-1.5 text-[10px] text-slate-500">
              From engagements
            </span>
          </div>

          <div className="mt-2 grid grid-cols-2 gap-2 md:grid-cols-4">
            {paymentCards.map((item, i) => {
              const meta = payMetricMeta[i];
              const Icon = meta.Icon;
              return (
                <div key={item.label} className={cn("rounded-lg p-2", meta.wrap)}>
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "grid h-9 w-9 place-items-center text-xl",
                        meta.iconWrap,
                      )}
                    >
                      <Icon size={16} strokeWidth={2.25} aria-hidden />
                    </span>
                    <div>
                      <b className="text-[12px]">{item.value}</b>
                      <div className="text-[10px] text-slate-500">{item.label}</div>
                    </div>
                  </div>
                  <div className={cn("mt-1 pl-11 text-[11px] font-bold", meta.trend)}>
                    {item.trend}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-3 grid grid-cols-[35px_minmax(0,1fr)_86px] gap-2">
            <div className="flex h-[126px] flex-col justify-between pb-0.5 text-[10px] text-slate-500">
              <span>Max</span>
              <span>—</span>
              <span>—</span>
              <span>—</span>
              <span>0</span>
            </div>
            <div
              className="flex h-[126px] items-end gap-[5px] border-b border-[#dbe8f6] px-2.5"
              style={{
                background:
                  "repeating-linear-gradient(to bottom, transparent 0, transparent 28px, #e4eef9 29px)",
              }}
              aria-hidden
            >
              {eventsLoading ? (
                <span className="w-full self-center text-center text-[11px] text-slate-400">
                  Loading…
                </span>
              ) : snapshot.capacityBars.length === 0 ? (
                <span className="w-full self-center text-center text-[11px] text-slate-400">
                  No capacity data yet
                </span>
              ) : (
                snapshot.capacityBars.map((h, i) => (
                  <i
                    key={i}
                    className="min-w-[4px] flex-1 rounded-t-[3px]"
                    style={{
                      height: `${h}%`,
                      background: "linear-gradient(to top, #0870ed 0 56%, #80bdff 56% 100%)",
                    }}
                  />
                ))
              )}
            </div>
            <div className="flex flex-col justify-center gap-3 text-[10px]">
              <span>
                <i className="mr-2 inline-block h-3 w-3 rounded bg-blue-600" />
                Capacity
              </span>
              <span className="text-slate-500">Per event</span>
            </div>
          </div>
        </article>

        <article className={cn(glass, "p-3 shadow-card")}>
          <h2 className="text-[15px] font-extrabold">Payment Methods Enabled</h2>
          <div className="flex h-[205px] items-center justify-center gap-4">
            <div className="relative">
              <div
                className="relative h-[162px] w-[162px] shrink-0 rounded-full max-[760px]:h-[125px] max-[760px]:w-[125px]"
                style={{ background: methodGradient }}
              >
                <span className="absolute inset-[22%] rounded-full bg-white" aria-hidden />
              </div>
              <div className="absolute inset-0 z-[1] grid place-content-center text-center text-[11px] font-bold leading-[1.25]">
                {snapshot.kpis.currency}
                <br />
                <span className="text-[17px]">{snapshot.paymentMethods.length || 0}</span>
                <span>Methods</span>
              </div>
            </div>
            <div className="space-y-3 text-[11px]">
              {eventsLoading ? (
                <span className="text-slate-400">Loading…</span>
              ) : snapshot.paymentMethods.length === 0 ? (
                <span className="text-slate-400">No payment methods on events yet</span>
              ) : (
                snapshot.paymentMethods.map((m) => (
                  <div key={m.label} className="flex items-center gap-2">
                    <i className="h-3 w-3 rounded-full" style={{ background: m.color }} />
                    <span className="min-w-[88px]">{m.label}</span>
                    <b>{m.value}%</b>
                  </div>
                ))
              )}
            </div>
          </div>
        </article>
      </section>

      {/* Bottom panels */}
      <section className="grid grid-cols-1 gap-2.5 lg:grid-cols-[1.2fr_1.2fr_.8fr]">
        <article className={cn(glass, "p-3 shadow-card")}>
          <div className="mb-2 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-[13px] font-extrabold">
              <CalendarDays size={14} strokeWidth={2} className="text-blue-600" aria-hidden />
              Upcoming Events
            </h2>
            <Link to="/admin/events" className="text-[10px] font-semibold text-blue-600">
              View All →
            </Link>
          </div>
          <div className="space-y-1.5">
            {eventsLoading ? (
              <p className="py-4 text-center text-[11px] text-slate-500">Loading events…</p>
            ) : upcomingEvents.length === 0 ? (
              <p className="py-4 text-center text-[11px] text-slate-500">
                No upcoming events yet.{" "}
                <Link to="/admin/events/new" className="font-semibold text-blue-600">
                  Create one
                </Link>
              </p>
            ) : (
              upcomingEvents.map((ev) => (
                <Link
                  key={ev.id}
                  to={`/admin/events/${ev.id}/overview`}
                  className="flex items-center gap-2 border-b border-blue-50 pb-2 last:border-0 last:pb-0 hover:bg-blue-50/40"
                >
                  <div className="w-12 rounded-lg bg-blue-50 py-1 text-center">
                    <small className="block text-[9px] text-blue-700">{ev.month}</small>
                    <b className="text-lg">{ev.day}</b>
                  </div>
                  <div className="h-9 w-3 border-l-2 border-blue-500" />
                  <div className="min-w-0 flex-1">
                    <b className="block truncate text-[10px]">{ev.title}</b>
                    <span className="text-[9px] text-slate-500">
                      ⌖ {ev.time}　|　{ev.place}
                    </span>
                  </div>
                  <span
                    className={cn(
                      "rounded-full px-2 py-1 text-[8px] font-bold",
                      ev.status === "Published"
                        ? "bg-green-100 text-green-700"
                        : "bg-slate-100 text-slate-600",
                    )}
                  >
                    {ev.status === "Published" ? "✓ Published" : "⌄ Draft"}
                  </span>
                  <b className="text-blue-600" aria-hidden>
                    ›
                  </b>
                </Link>
              ))
            )}
          </div>
        </article>

        <article className={cn(glass, "min-w-0 p-3 shadow-card")}>
          <div className="mb-2 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-[13px] font-extrabold">
              <Users size={14} strokeWidth={2} className="text-blue-600" aria-hidden />
              Recent Events
            </h2>
            <Link to="/admin/events" className="text-[10px] font-semibold text-blue-600">
              View All →
            </Link>
          </div>
          <div className="overflow-x-auto">
            {eventsLoading ? (
              <p className="py-6 text-center text-[11px] text-slate-500">Loading…</p>
            ) : snapshot.recentEvents.length === 0 ? (
              <p className="py-6 text-center text-[11px] text-slate-500">
                No events in the database yet.
              </p>
            ) : (
              <table className="w-full border-collapse text-left text-[9px]">
                <thead>
                  <tr className="bg-blue-50 text-slate-600">
                    <th className="p-2 font-medium">Name</th>
                    <th className="p-2 font-medium">Venue</th>
                    <th className="p-2 font-medium">Type</th>
                    <th className="p-2 font-medium">Status</th>
                    <th className="p-2 font-medium">Updated</th>
                  </tr>
                </thead>
                <tbody>
                  {snapshot.recentEvents.map((r) => (
                    <tr key={r.id} className="border-b border-blue-50 last:border-0">
                      <td className="whitespace-nowrap p-2">
                        <Link
                          to={`/admin/events/${r.id}/overview`}
                          className="inline-flex items-center text-[#07145b] hover:underline"
                        >
                          <span className="mr-1 inline-grid h-6 w-6 place-items-center rounded-full bg-blue-100 font-bold text-blue-700">
                            {r.initials}
                          </span>
                          {r.name}
                        </Link>
                      </td>
                      <td className="whitespace-nowrap p-2">{r.org}</td>
                      <td className="p-2">{r.type}</td>
                      <td className="p-2">
                        <span className={cn("rounded-full px-2 py-1", statusTone(r.status))}>
                          {r.status}
                        </span>
                      </td>
                      <td className="p-2">{r.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </article>

        <article className={cn(glass, "p-3 shadow-card")}>
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-[13px] font-extrabold">
              <span className="mr-2 text-blue-600">◉</span>
              Event Countries
            </h2>
            <Link to={participantsLink} className="text-[10px] font-semibold text-blue-600">
              View All
            </Link>
          </div>
          <div className="space-y-2 text-[10px]">
            {eventsLoading ? (
              <p className="py-4 text-center text-slate-500">Loading…</p>
            ) : snapshot.countries.length === 0 ? (
              <p className="py-4 text-center text-slate-500">No country data on events yet.</p>
            ) : (
              snapshot.countries.map((c) => (
                <div
                  key={c.name}
                  className="grid grid-cols-[22px_1fr_72px_25px] items-center gap-1"
                >
                  <span>{c.flag}</span>
                  <span className="truncate">{c.name}</span>
                  <div className="h-3 rounded bg-slate-100">
                    <i
                      className="block h-full rounded bg-blue-400"
                      style={{ width: `${c.pct}%` }}
                    />
                  </div>
                  <b>{c.count}</b>
                </div>
              ))
            )}
          </div>
        </article>
      </section>

      {/* Quick actions */}
      <section className="grid grid-cols-2 gap-2 rounded-xl border border-blue-100 bg-white/80 p-2 shadow-card sm:grid-cols-[130px_repeat(4,minmax(0,1fr))]">
        <div className="col-span-2 flex items-center gap-2 px-2 text-[13px] font-extrabold sm:col-span-1">
          <Zap size={22} strokeWidth={2.25} aria-hidden />
          Quick Actions
        </div>
        <Link
          to="/admin/events"
          className="flex min-h-[54px] items-center gap-3 rounded-xl bg-blue-50 px-3 text-[11px] font-bold text-blue-800"
        >
          <CalendarDays size={18} strokeWidth={2} className="text-blue-600" aria-hidden />
          <span>Manage Event</span>
          <b className="ml-auto text-xl" aria-hidden>
            ›
          </b>
        </Link>
        <Link
          to="/admin/payments"
          className="flex min-h-[54px] items-center gap-3 rounded-xl bg-green-50 px-3 text-[11px] font-bold text-green-800"
        >
          <CreditCard size={18} strokeWidth={2} className="text-green-600" aria-hidden />
          <span>View Payments</span>
          <b className="ml-auto text-xl" aria-hidden>
            ›
          </b>
        </Link>
        <Link
          to="/admin/messages"
          className="flex min-h-[54px] items-center gap-3 rounded-xl bg-violet-50 px-3 text-[11px] font-bold text-violet-800"
        >
          <MessageSquare size={18} strokeWidth={2} className="text-violet-600" aria-hidden />
          <span>Send Message</span>
          <b className="ml-auto text-xl" aria-hidden>
            ›
          </b>
        </Link>
        <Link
          to={
            featured?.engagementID
              ? `/admin/events/${featured.engagementID}/reports`
              : "/admin/events"
          }
          className="flex min-h-[54px] items-center gap-3 rounded-xl bg-sky-50 px-3 text-[11px] font-bold text-blue-800"
        >
          <FileBarChart size={18} strokeWidth={2} className="text-blue-600" aria-hidden />
          <span>View Reports</span>
          <b className="ml-auto text-xl" aria-hidden>
            ›
          </b>
        </Link>
      </section>
    </div>
  );
}
