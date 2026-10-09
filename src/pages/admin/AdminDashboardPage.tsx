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
import {
  adminKpis,
  paymentSummary,
  recentRegistrations,
  topCountries,
  upcomingEvents,
} from "../../data/dashboards";
import { useAuthUser } from "../../hooks/useAuthUser";
import { useEventCopy } from "../../i18n/useEventCopy";
import { displayName } from "../../lib/auth";
import { cn } from "../../lib/cn";

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

const chartHeights = [
  24, 30, 38, 54, 43, 35, 46, 61, 52, 48, 43, 68, 59, 80, 72, 62, 82, 92, 76, 88, 98,
];

const countryWidths = [100, 29, 26, 21, 19, 16, 11, 10, 48];

const payMetricMeta = [
  {
    wrap: "bg-blue-50",
    iconWrap: "rounded-lg bg-blue-100 text-blue-600",
    Icon: CreditCard,
    trend: "text-green-600",
  },
  {
    wrap: "bg-green-50",
    iconWrap: "rounded-full bg-green-600 text-white",
    Icon: Check,
    trend: "text-green-600",
  },
  {
    wrap: "bg-amber-50",
    iconWrap: "rounded-full bg-amber-100 text-amber-600",
    Icon: Clock3,
    trend: "text-amber-600",
  },
  {
    wrap: "bg-red-50",
    iconWrap: "rounded-full bg-red-500 text-white",
    Icon: X,
    trend: "text-red-600",
  },
] as const;

/** Admin dashboard — main content from aca-admin-dashboard-tailwind HTML */
export function AdminDashboardPage() {
  const event = useEventCopy();
  const user = useAuthUser();
  const welcome =
    displayName(user, "there").split(/\s+/).filter(Boolean)[0] ?? "there";

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
              Event registration and key activities at a glance.
            </p>
          </div>

          <div className="flex items-center gap-4 border-white/70 text-white sm:border-l sm:pl-6">
            <CalendarDays size={28} strokeWidth={1.8} className="shrink-0 opacity-95" aria-hidden />
            <div className="text-[12px] leading-[1.6]">
              <b className="text-[13px]">{event.dates}</b>
              <br />
              Kenyatta International
              <br />
              Convention Centre (KICC)
              <br />
              Nairobi, Kenya
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

      {/* KPI cards */}
      <section className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
        {adminKpis.map((kpi, i) => {
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

      {/* Payments overview */}
      <section className="grid grid-cols-1 gap-2.5 lg:grid-cols-[1.65fr_1fr]">
        <article className={cn(glass, "p-3 shadow-card")}>
          <div className="flex items-center justify-between gap-2">
            <h2 className="flex items-center gap-2 text-[15px] font-extrabold">
              <CreditCard size={18} strokeWidth={2} className="text-blue-600" aria-hidden />
              Payments Overview
            </h2>
            <button
              type="button"
              className="rounded-lg border border-blue-100 bg-white px-3 py-1.5 text-[10px]"
            >
              Last 30 Days ⌄
            </button>
          </div>

          <div className="mt-2 grid grid-cols-2 gap-2 md:grid-cols-4">
            {paymentSummary.map((item, i) => {
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
              <span>400K</span>
              <span>300K</span>
              <span>200K</span>
              <span>100K</span>
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
              {chartHeights.map((h, i) => (
                <i
                  key={i}
                  className="min-w-[4px] flex-1 rounded-t-[3px]"
                  style={{
                    height: `${h}%`,
                    background: "linear-gradient(to top, #0870ed 0 56%, #80bdff 56% 100%)",
                  }}
                />
              ))}
            </div>
            <div className="flex flex-col justify-center gap-3 text-[10px]">
              <span>
                <i className="mr-2 inline-block h-3 w-3 rounded bg-blue-600" />
                Completed
              </span>
              <span>
                <i className="mr-2 inline-block h-3 w-3 rounded bg-blue-300" />
                Pending
              </span>
            </div>
          </div>
          <div className="ml-10 mr-[88px] mt-1 flex justify-between text-[9px] text-slate-500">
            <span>Sep 01</span>
            <span>Sep 05</span>
            <span>Sep 10</span>
            <span>Sep 15</span>
            <span>Sep 20</span>
            <span>Sep 25</span>
            <span>Sep 30</span>
          </div>
        </article>

        <article className={cn(glass, "p-3 shadow-card")}>
          <h2 className="text-[15px] font-extrabold">Payments by Method</h2>
          <div className="flex h-[205px] items-center justify-center gap-4">
            <div className="relative">
              <div
                className="relative h-[162px] w-[162px] shrink-0 rounded-full max-[760px]:h-[125px] max-[760px]:w-[125px]"
                style={{
                  background:
                    "conic-gradient(#0874ed 0 55%, #13a457 55% 80%, #ffad1b 80% 92%, #a56bfa 92% 100%)",
                }}
              >
                <span className="absolute inset-[22%] rounded-full bg-white" aria-hidden />
              </div>
              <div className="absolute inset-0 z-[1] grid place-content-center text-center text-[11px] font-bold leading-[1.25]">
                KES
                <br />
                <span className="text-[17px]">1.25M</span>
                <span>Total</span>
              </div>
            </div>
            <div className="space-y-3 text-[11px]">
              <div className="flex items-center gap-2">
                <i className="h-3 w-3 rounded-full bg-blue-600" />
                <span className="min-w-[64px]">M-Pesa</span>
                <b>55%</b>
              </div>
              <div className="flex items-center gap-2">
                <i className="h-3 w-3 rounded-full bg-green-600" />
                <span className="min-w-[64px]">Card</span>
                <b>25%</b>
              </div>
              <div className="flex items-center gap-2">
                <i className="h-3 w-3 rounded-full bg-amber-400" />
                <span className="min-w-[64px]">Bank Transfer</span>
                <b>12%</b>
              </div>
              <div className="flex items-center gap-2">
                <i className="h-3 w-3 rounded-full bg-violet-400" />
                <span className="min-w-[64px]">Other</span>
                <b>8%</b>
              </div>
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
            {upcomingEvents.map((ev) => (
              <div
                key={`${ev.day}-${ev.title}`}
                className="flex items-center gap-2 border-b border-blue-50 pb-2 last:border-0 last:pb-0"
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
              </div>
            ))}
          </div>
        </article>

        <article className={cn(glass, "min-w-0 p-3 shadow-card")}>
          <div className="mb-2 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-[13px] font-extrabold">
              <Users size={14} strokeWidth={2} className="text-blue-600" aria-hidden />
              Recent Registrations
            </h2>
            <Link
              to="/admin/events/isippe-3/participants"
              className="text-[10px] font-semibold text-blue-600"
            >
              View All →
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-[9px]">
              <thead>
                <tr className="bg-blue-50 text-slate-600">
                  <th className="p-2 font-medium">Name</th>
                  <th className="p-2 font-medium">Organization</th>
                  <th className="p-2 font-medium">Type</th>
                  <th className="p-2 font-medium">Status</th>
                  <th className="p-2 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {recentRegistrations.map((r) => (
                  <tr key={r.name} className="border-b border-blue-50 last:border-0">
                    <td className="whitespace-nowrap p-2">
                      <span className="mr-1 inline-grid h-6 w-6 place-items-center rounded-full bg-blue-100 font-bold text-blue-700">
                        {r.initials}
                      </span>
                      {r.name}
                    </td>
                    <td className="whitespace-nowrap p-2">{r.org}</td>
                    <td className="p-2">{r.type}</td>
                    <td className="p-2">
                      <span
                        className={cn(
                          "rounded-full px-2 py-1",
                          r.status === "Confirmed"
                            ? "bg-green-100 text-green-700"
                            : "bg-amber-100 text-amber-700",
                        )}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td className="p-2">{r.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>

        <article className={cn(glass, "p-3 shadow-card")}>
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-[13px] font-extrabold">
              <span className="mr-2 text-blue-600">◉</span>
              Top Countries
            </h2>
            <Link
              to="/admin/events/isippe-3/participants"
              className="text-[10px] font-semibold text-blue-600"
            >
              View All
            </Link>
          </div>
          <div className="space-y-2 text-[10px]">
            {topCountries.map((c, i) => (
              <div
                key={c.name}
                className="grid grid-cols-[22px_1fr_72px_25px] items-center gap-1"
              >
                <span>{c.flag}</span>
                <span className="truncate">{c.name}</span>
                <div className="h-3 rounded bg-slate-100">
                  <i
                    className={cn(
                      "block h-full rounded",
                      c.name === "Other" ? "bg-slate-400" : "bg-blue-400",
                    )}
                    style={{ width: `${countryWidths[i] ?? 20}%` }}
                  />
                </div>
                <b>{c.count}</b>
              </div>
            ))}
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
          to="/admin/events/isippe-3/reports"
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
