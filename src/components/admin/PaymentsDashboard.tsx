import { useMemo, useState } from "react";
import {
  Building2,
  CalendarRange,
  ChevronDown,
  Coins,
  Download,
  Handshake,
  MoreHorizontal,
  Ticket,
} from "lucide-react";
import {
  paymentKpis,
  paymentMethodsBars,
  paymentStatusBars,
  paymentTransactions,
  revenueBreakdown,
  revenueBreakdownTotal,
  revenueBySource,
  revenueTrendPeriods,
  revenueTrendSeries,
} from "../../data/adminOps";
import { cn } from "../../lib/cn";

type TxTab = "recent" | "pending" | "failed" | "refunds";
type TrendPeriod = keyof typeof revenueTrendPeriods;

const kpiIcons = [Coins, Ticket, Handshake, Building2];
const kpiIconTone = {
  green: "bg-emerald-50 text-emerald-600",
  purple: "bg-purple-50 text-purple-600",
  orange: "bg-orange-50 text-orange-500",
  blue: "bg-sky-50 text-blue-600",
} as const;

const panel =
  "rounded-[10px] border border-[#e1edfc] bg-white shadow-[0_3px_12px_rgba(57,118,188,.04)]";

const field =
  "rounded-[7px] border border-[#c9ddff] bg-white px-2.5 py-2 text-[#101b61] outline-none focus:border-[#0755f5]";

const txTabs: { id: TxTab; label: string }[] = [
  { id: "recent", label: "Recent Transactions" },
  { id: "pending", label: "Pending Payments" },
  { id: "failed", label: "Failed Payments" },
  { id: "refunds", label: "Refunds" },
];

function statusPill(status: string) {
  if (status === "Completed") return "bg-emerald-100 text-emerald-700";
  if (status === "Pending") return "bg-amber-100 text-amber-700";
  if (status === "Failed") return "bg-red-100 text-red-700";
  return "bg-purple-100 text-purple-700";
}

function formatAxis(v: number) {
  if (v >= 1_000_000) return `${v / 1_000_000}M`;
  if (v >= 1_000) return `${v / 1_000}K`;
  return String(v);
}

function buildLinePaths(
  datasets: readonly (readonly number[])[],
  width: number,
  height: number,
) {
  const flat = datasets.flatMap((d) => [...d]);
  const max = Math.max(...flat, 1);
  const padL = 28;
  const padR = 8;
  const padT = 10;
  const padB = 22;
  const plotW = width - padL - padR;
  const plotH = height - padT - padB;
  return datasets.map((values) => {
    const pts = values.map((v, i) => {
      const x = padL + (i / Math.max(values.length - 1, 1)) * plotW;
      const y = padT + plotH - (v / max) * plotH;
      return { x, y };
    });
    const path = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");
    return { pts, path, max };
  });
}

type PaymentsDashboardProps = {
  /** Page hub shows title; event-details tab hides it (chrome already has event header). */
  showTitle?: boolean;
  /** Live engagement: honest zeros / empty tables instead of design mock. */
  live?: boolean;
};

/** Screen G Payments dashboard — from aca_payments_dashboard HTML */
export function PaymentsDashboard({ showTitle = true, live = false }: PaymentsDashboardProps) {
  const [txTab, setTxTab] = useState<TxTab>("recent");
  const [trendPeriod, setTrendPeriod] = useState<TrendPeriod>("Daily");
  const [dateRange, setDateRange] = useState("15 Nov 2026 - 17 Nov 2026");
  const [notice, setNotice] = useState<string | null>(null);

  const rows = live ? [] : paymentTransactions[txTab];

  const kpis = live
    ? paymentKpis.map((k) => ({
        ...k,
        value: "KES 0",
        meta: "—",
        metaSub: "",
      }))
    : paymentKpis;

  const sources = live
    ? revenueBySource.map((s) => ({ ...s, value: 0, amount: "0" }))
    : revenueBySource;

  const breakdown = live
    ? revenueBreakdown.map((r) => ({ ...r, amount: "0", pct: "0%", tx: 0 }))
    : revenueBreakdown;

  const breakdownTotal = live
    ? { amount: "0", pct: "0%", tx: 0 }
    : revenueBreakdownTotal;

  const methods = live
    ? paymentMethodsBars.map((m) => ({ ...m, value: 0, amount: "0" }))
    : paymentMethodsBars;

  const statuses = live
    ? paymentStatusBars.map((s) => ({ ...s, value: 0 }))
    : paymentStatusBars;

  const donutGradient = useMemo(() => {
    if (live) return "conic-gradient(#d7e5f5 0 100%)";
    let acc = 0;
    return `conic-gradient(${revenueBySource
      .map((s) => {
        const start = acc;
        acc += s.value;
        return `${s.color} ${start}% ${acc}%`;
      })
      .join(", ")})`;
  }, [live]);

  const trend = revenueTrendPeriods[trendPeriod];
  const trendLabels = trend.labels;
  const lineGeom = useMemo(() => {
    const datasets = live
      ? trend.datasets.map((d) => d.map(() => 0))
      : trend.datasets;
    return buildLinePaths(datasets, 420, 160);
  }, [live, trend]);
  const yMax = live ? 1 : (lineGeom[0]?.max ?? 1);

  const exportCsv = () => {
    if (live) {
      setNotice("No payment records available for this event yet.");
      return;
    }
    const header = [
      "Date & Time",
      "Reference",
      "Payer Name",
      "Source",
      "Amount (KES)",
      "Payment Method",
      "Status",
    ];
    const body = paymentTransactions.recent.map((r) => [
      r.datetime,
      r.reference,
      r.payer,
      r.source,
      r.amount,
      r.method,
      r.status,
    ]);
    const csv = [header, ...body]
      .map((row) => row.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.download = "ACA_Payments_Transactions.csv";
    a.click();
    URL.revokeObjectURL(a.href);
    setNotice("Recent transactions exported as CSV sample data.");
  };

  return (
    <div className="text-[#101b61]">
      <div
        className={cn(
          "mb-3 flex flex-wrap items-end justify-between gap-3",
          showTitle ? "mb-4" : "mb-3",
        )}
      >
        {showTitle ? (
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-blue-950">Payments</h1>
            <p className="text-sm text-blue-600">
              Track and manage all revenue collections for your event.
            </p>
          </div>
        ) : (
          <div>
            <h2 className="text-lg font-extrabold text-blue-950">Event Payments</h2>
            <p className="text-sm text-blue-600">
              Event-scoped ledger for ticket, sponsorship and exhibitor payments.
            </p>
          </div>
        )}
        <div className="flex flex-wrap gap-2">
          <label className="flex items-center gap-2">
            <CalendarRange size={16} className="text-blue-600" />
            <select
              className={cn(field, "text-sm")}
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              aria-label="Date range"
            >
              <option>15 Nov 2026 - 17 Nov 2026</option>
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
              <option>This Year</option>
            </select>
          </label>
          <button
            type="button"
            onClick={exportCsv}
            className="inline-flex items-center gap-2 rounded-[7px] border border-[#a9caff] bg-white px-3.5 py-2 text-sm font-semibold text-[#0755f5] hover:bg-blue-50"
          >
            <Download size={15} /> Export <ChevronDown size={14} />
          </button>
        </div>
      </div>

      <section className="mb-3 grid grid-cols-2 gap-3 xl:grid-cols-4">
        {kpis.map((kpi, i) => {
          const Icon = kpiIcons[i];
          return (
            <article
              key={kpi.label}
              className={cn(panel, "flex min-w-0 items-center gap-3 px-3.5 py-3 sm:px-4")}
            >
              <div
                className={cn(
                  "flex h-[51px] w-[51px] shrink-0 items-center justify-center rounded-xl",
                  kpiIconTone[kpi.tone],
                )}
              >
                <Icon size={24} strokeWidth={2} />
              </div>
              <div className="min-w-0">
                <div className="text-xs text-slate-600">{kpi.label}</div>
                <b className="block truncate text-base font-extrabold text-blue-950 sm:text-lg">
                  {kpi.value}
                </b>
                <span
                  className={cn(
                    "text-xs",
                    live
                      ? "font-semibold text-slate-400"
                      : kpi.tone === "green"
                        ? "text-emerald-600"
                        : "text-slate-500",
                  )}
                >
                  {kpi.meta}
                  {kpi.metaSub ? (
                    <span className="text-slate-500"> {kpi.metaSub}</span>
                  ) : null}
                </span>
              </div>
            </article>
          );
        })}
      </section>

      <section className="mb-3 grid grid-cols-1 gap-3 lg:grid-cols-[1.05fr_1fr]">
        <div className={cn(panel, "p-4")}>
          <h2 className="mb-2 text-sm font-extrabold text-blue-950">Revenue by Source</h2>
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative mx-auto h-[165px] w-[165px] shrink-0">
              <div
                className="h-full w-full rounded-full"
                style={{ background: donutGradient }}
                aria-label="Revenue by source"
              />
              <div className="absolute inset-[19%] flex flex-col items-center justify-center rounded-full bg-white text-center">
                <span className="text-[10px] text-slate-500">KES</span>
                <strong className="text-sm font-extrabold leading-4 text-blue-950">
                  {live ? "0" : "4.25M"}
                </strong>
                <span className="text-[9px] text-slate-500">Total</span>
              </div>
            </div>
            <div className="min-w-[200px] flex-[1.2] space-y-3 text-xs">
              {sources.map((s) => (
                <div key={s.label} className="flex items-center gap-2">
                  <i className="h-3 w-3 shrink-0 rounded-full" style={{ background: s.color }} />
                  <span className="min-w-0 flex-1 truncate">{s.label}</span>
                  <b>{s.value}%</b>
                  <span className="tabular-nums text-slate-600">{s.amount}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className={cn(panel, "p-4")}>
          <div className="mb-1 flex items-center justify-between gap-2">
            <h2 className="text-sm font-extrabold text-blue-950">Revenue Trend</h2>
            <select
              className={cn(field, "!py-1.5 !text-xs")}
              value={trendPeriod}
              onChange={(e) => setTrendPeriod(e.target.value as TrendPeriod)}
              aria-label="Trend period"
            >
              <option>Daily</option>
              <option>Weekly</option>
              <option>Monthly</option>
            </select>
          </div>
          <svg
            viewBox="0 0 420 160"
            className={cn("mt-1 h-[160px] w-full", live && "opacity-40")}
            role="img"
            aria-label="Revenue trend"
          >
            {[0, 0.25, 0.5, 0.75, 1].map((g) => (
              <line
                key={g}
                x1={28}
                x2={412}
                y1={10 + 128 - g * 128}
                y2={10 + 128 - g * 128}
                stroke="#e8eef7"
                strokeWidth="1"
              />
            ))}
            {[0, 0.5, 1].map((g) => (
              <text
                key={`y-${g}`}
                x={2}
                y={10 + 128 - g * 128 + 3}
                className="fill-slate-400"
                style={{ fontSize: 9 }}
              >
                {formatAxis(yMax * g)}
              </text>
            ))}
            {lineGeom.map((series, si) => (
              <g key={revenueTrendSeries[si].key}>
                <path
                  d={series.path}
                  fill="none"
                  stroke={revenueTrendSeries[si].color}
                  strokeWidth="2"
                  strokeLinejoin="round"
                />
                {series.pts.map((p, i) => (
                  <circle
                    key={i}
                    cx={p.x}
                    cy={p.y}
                    r="2.5"
                    fill={revenueTrendSeries[si].color}
                  />
                ))}
              </g>
            ))}
            {trendLabels.map((label, i) => {
              const x = 28 + (i / Math.max(trendLabels.length - 1, 1)) * 384;
              return (
                <text
                  key={label}
                  x={x}
                  y={154}
                  textAnchor="middle"
                  className="fill-slate-500"
                  style={{ fontSize: 9 }}
                >
                  {label}
                </text>
              );
            })}
          </svg>
          <div className="mt-2 flex flex-wrap justify-center gap-3 text-[11px]">
            {revenueTrendSeries.map((s) => (
              <span key={s.key} style={{ color: s.color }}>
                ● {s.label}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="mb-3 grid grid-cols-1 gap-3 xl:grid-cols-[1.3fr_1fr]">
        <div className={cn(panel, "p-4")}>
          <h2 className="mb-2 text-sm font-extrabold text-blue-950">Revenue Breakdown</h2>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] border-collapse text-left text-[11px]">
              <thead>
                <tr className="bg-[#f4f8ff] text-[#0b176d]">
                  <th className="px-2.5 py-2.5 font-bold">Source</th>
                  <th className="px-2.5 py-2.5 font-bold">Amount (KES)</th>
                  <th className="px-2.5 py-2.5 font-bold">% of Total</th>
                  <th className="px-2.5 py-2.5 font-bold">Transactions</th>
                  <th className="px-2.5 py-2.5 font-bold">Status</th>
                </tr>
              </thead>
              <tbody>
                {breakdown.map((r) => (
                  <tr key={r.source} className="border-b border-[#e6effb] hover:bg-[#f8fbff]">
                    <td className="px-2.5 py-2.5">
                      <span className={cn("mr-2", r.iconTone)}>▣</span>
                      {r.source}
                    </td>
                    <td className="px-2.5 py-2.5 tabular-nums">{r.amount}</td>
                    <td className="px-2.5 py-2.5">{r.pct}</td>
                    <td className="px-2.5 py-2.5">{r.tx}</td>
                    <td className="px-2.5 py-2.5">
                      {live ? (
                        <span className="text-slate-400">—</span>
                      ) : (
                        <span className="rounded-md bg-[#d8f9e8] px-2.5 py-1 text-[11px] font-semibold text-[#05844c]">
                          {r.status}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
                <tr className="bg-blue-50 font-bold">
                  <td className="px-2.5 py-2.5">Total</td>
                  <td className="px-2.5 py-2.5 tabular-nums">{breakdownTotal.amount}</td>
                  <td className="px-2.5 py-2.5">{breakdownTotal.pct}</td>
                  <td className="px-2.5 py-2.5">{breakdownTotal.tx}</td>
                  <td className="px-2.5 py-2.5" />
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-3">
          <div className={cn(panel, "p-4")}>
            <h2 className="mb-3 text-sm font-extrabold text-blue-950">Payment Methods</h2>
            <div className="space-y-3 text-xs">
              {methods.map((m) => (
                <div key={m.label} className="flex items-center gap-3">
                  <span className="w-5 text-lg" style={{ color: m.color }}>
                    ▣
                  </span>
                  <span className="w-20 shrink-0">{m.label}</span>
                  <div className="h-3 flex-1 overflow-hidden rounded-full bg-blue-50">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${m.value}%`, background: m.color }}
                    />
                  </div>
                  <span>{m.value}%</span>
                  <span className="w-16 text-right tabular-nums">{m.amount}</span>
                </div>
              ))}
            </div>
          </div>
          <div className={cn(panel, "p-4")}>
            <h2 className="mb-3 text-sm font-extrabold text-blue-950">Payment Status</h2>
            <div className="space-y-2 text-xs">
              {statuses.map((s) => (
                <div key={s.label} className="flex items-center gap-3">
                  <span style={{ color: s.color }}>●</span>
                  <span className="w-16 shrink-0">{s.label}</span>
                  <div className="h-2.5 flex-1 rounded-full bg-blue-50">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${s.value}%`, background: s.color }}
                    />
                  </div>
                  <b>{s.value}%</b>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className={cn(panel, "overflow-hidden p-0")}>
        <div className="flex flex-wrap items-center gap-1 border-b border-blue-100 px-3 pt-2">
          {txTabs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTxTab(t.id)}
              className={cn(
                "px-3 py-2 text-sm transition",
                txTab === t.id
                  ? "border-b-2 border-blue-600 font-semibold text-blue-600"
                  : "text-slate-500 hover:text-blue-700",
              )}
            >
              {t.label}
            </button>
          ))}
          <button
            type="button"
            className="ml-auto mb-1 rounded-[7px] border border-[#a9caff] bg-white px-3 py-1.5 text-sm font-semibold text-[#0755f5] hover:bg-blue-50"
            onClick={() =>
              setNotice(
                live
                  ? "No payment records available for this event yet."
                  : "Showing transactions for the selected tab. Connect this view to your payments API to load all records.",
              )
            }
          >
            View All
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] border-collapse whitespace-nowrap text-left text-[11px]">
            <thead>
              <tr className="bg-[#f4f8ff] text-[#0b176d]">
                <th className="px-2.5 py-2.5 font-bold">Date &amp; Time</th>
                <th className="px-2.5 py-2.5 font-bold">Reference</th>
                <th className="px-2.5 py-2.5 font-bold">Payer Name</th>
                <th className="px-2.5 py-2.5 font-bold">Source</th>
                <th className="px-2.5 py-2.5 font-bold">Amount (KES)</th>
                <th className="px-2.5 py-2.5 font-bold">Payment Method</th>
                <th className="px-2.5 py-2.5 font-bold">Status</th>
                <th className="px-2.5 py-2.5 font-bold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-2.5 py-8 text-center text-slate-500">
                    {live
                      ? "No payment records for this event yet."
                      : "Nothing found for this tab."}
                  </td>
                </tr>
              ) : (
                rows.map((r) => (
                  <tr key={r.id} className="border-b border-[#e6effb] hover:bg-[#f8fbff]">
                    <td className="px-2.5 py-2.5">{r.datetime}</td>
                    <td className="px-2.5 py-2.5 font-semibold">{r.reference}</td>
                    <td className="px-2.5 py-2.5">{r.payer}</td>
                    <td className="px-2.5 py-2.5">{r.source}</td>
                    <td className="px-2.5 py-2.5 tabular-nums">{r.amount}</td>
                    <td className="px-2.5 py-2.5">{r.method}</td>
                    <td className="px-2.5 py-2.5">
                      <span
                        className={cn(
                          "rounded-md px-2 py-1 text-[11px] font-semibold",
                          statusPill(r.status),
                        )}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td className="px-2.5 py-2.5">
                      <button
                        type="button"
                        className="text-blue-700"
                        aria-label="Transaction actions"
                      >
                        <MoreHorizontal size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {notice ? (
        <p
          className="mt-3 rounded-lg border border-blue-100 bg-white p-3 text-sm text-blue-800"
          role="status"
        >
          {notice}
        </p>
      ) : null}
    </div>
  );
}
