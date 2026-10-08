import { useMemo, useState } from "react";
import {
  Building2,
  CalendarRange,
  ChevronDown,
  Coins,
  CreditCard,
  Download,
  Handshake,
  Landmark,
  MoreVertical,
  Ticket,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Donut } from "../../components/ui/Donut";
import { Pill } from "../../components/ui/Pill";
import { Select } from "../../components/ui/Select";
import { Table } from "../../components/ui/Table";
import { Tabs } from "../../components/ui/Tabs";
import {
  paymentKpis,
  paymentMethodsBars,
  paymentStatusBars,
  recentPayments,
  revenueBreakdown,
  revenueBreakdownTotal,
  revenueBySource,
  revenueTrend,
  revenueTrendSeries,
} from "../../data/adminOps";
import { cn } from "../../lib/cn";

const kpiIcons = [Coins, Ticket, Handshake, Building2];
const kpiTone = {
  green: "bg-green-50 text-green",
  purple: "bg-purple-50 text-purple-600",
  orange: "bg-orange-50 text-orange-600",
  blue: "bg-soft text-blue",
};

const statusTone = {
  Completed: "green" as const,
  Pending: "orange" as const,
  Failed: "red" as const,
};

const methodIcon: Record<string, typeof Wallet> = {
  "M-Pesa": Wallet,
  "Card (Stripe)": CreditCard,
  "Bank Transfer": Landmark,
  PayPal: CreditCard,
};

/** Screen G Payments */
export function PaymentsPage() {
  const [txTab, setTxTab] = useState("recent");

  const rows = useMemo(() => {
    if (txTab === "pending") return recentPayments.filter((p) => p.status === "Pending");
    if (txTab === "failed") return recentPayments.filter((p) => p.status === "Failed");
    if (txTab === "refunds") return [];
    return recentPayments;
  }, [txTab]);

  const chartMax = Math.max(
    ...revenueTrend.flatMap((d) => [d.tickets, d.sponsorships, d.exhibitors]),
    1,
  );
  /* viewBox sized so plot fills width; room for x labels under plot */
  const chartW = 560;
  const chartH = 200;
  const padL = 8;
  const padR = 8;
  const padT = 12;
  const padB = 28;
  const plotW = chartW - padL - padR;
  const plotH = chartH - padT - padB;
  const stepX = plotW / Math.max(revenueTrend.length - 1, 1);

  const seriesPaths = revenueTrendSeries.map((series) => {
    const points = revenueTrend.map((d, i) => {
      const x = padL + i * stepX;
      const y = padT + plotH - (d[series.key] / chartMax) * plotH;
      return `${x},${y}`;
    });
    return { ...series, path: points.join(" ") };
  });

  return (
    <div className="grid w-full gap-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-navy">Payments</h1>
          <p className="mt-1 text-sm text-mute">Track and manage all revenue collections for your event.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-navy"
          >
            <CalendarRange size={16} className="text-blue" />
            15 Nov 2026 – 17 Nov 2026
            <ChevronDown size={14} className="text-mute" />
          </button>
          <Button variant="outline">
            <Download size={16} /> Export <ChevronDown size={14} />
          </Button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {paymentKpis.map((kpi, i) => {
          const Icon = kpiIcons[i];
          return (
            <Card key={kpi.label}>
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm text-mute">{kpi.label}</p>
                <span className={cn("grid h-9 w-9 place-items-center rounded-lg", kpiTone[kpi.tone])}>
                  <Icon size={18} />
                </span>
              </div>
              <p className="mt-2 text-xl font-extrabold text-navy">{kpi.value}</p>
              <p className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-green">
                {kpi.meta.startsWith("+") ? <TrendingUp size={12} /> : null}
                {kpi.meta}
              </p>
            </Card>
          );
        })}
      </div>

      <div className="grid items-stretch gap-4 lg:grid-cols-2">
        <Card className="flex h-full flex-col">
          <h2 className="mb-4 font-bold text-navy">Revenue by Source</h2>
          <div className="flex flex-1 items-center">
            <Donut
              slices={revenueBySource}
              centerValue="KES 4.25M"
              centerLabel="Total Revenue"
              size={168}
              className="w-full"
            />
          </div>
        </Card>
        <Card className="flex h-full flex-col">
          <div className="mb-3 flex items-center justify-between gap-2">
            <h2 className="font-bold text-navy">Revenue Trend</h2>
            <Select
              aria-label="Trend period"
              className="w-28"
              defaultValue="daily"
              options={[{ value: "daily", label: "Daily" }]}
            />
          </div>
          <div className="flex min-h-0 flex-1 flex-col">
            <svg
              viewBox={`0 0 ${chartW} ${chartH}`}
              className="h-full min-h-[11.5rem] w-full"
              preserveAspectRatio="xMidYMid meet"
              role="img"
              aria-label="Revenue trend"
            >
              {[0, 0.25, 0.5, 0.75, 1].map((g) => (
                <line
                  key={g}
                  x1={padL}
                  x2={chartW - padR}
                  y1={padT + plotH - g * plotH}
                  y2={padT + plotH - g * plotH}
                  stroke="#E8EEF7"
                  strokeWidth="1"
                />
              ))}
              {seriesPaths.map((s) => (
                <g key={s.key}>
                  <polyline
                    fill="none"
                    stroke={s.color}
                    strokeWidth="2.75"
                    strokeLinejoin="round"
                    strokeLinecap="round"
                    points={s.path}
                  />
                  {revenueTrend.map((d, i) => {
                    const x = padL + i * stepX;
                    const y = padT + plotH - (d[s.key] / chartMax) * plotH;
                    return <circle key={`${s.key}-${d.day}`} cx={x} cy={y} r="3.25" fill={s.color} />;
                  })}
                </g>
              ))}
              {revenueTrend.map((d, i) => (
                <text
                  key={d.day}
                  x={padL + i * stepX}
                  y={chartH - 8}
                  textAnchor="middle"
                  className="fill-mute"
                  style={{ fontSize: 12 }}
                >
                  {d.day}
                </text>
              ))}
            </svg>
            <ul className="mt-3 flex flex-wrap justify-center gap-x-4 gap-y-1.5 text-xs text-mute">
              {revenueTrendSeries.map((s) => (
                <li key={s.key} className="inline-flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full" style={{ background: s.color }} />
                  {s.label}
                </li>
              ))}
            </ul>
          </div>
        </Card>
      </div>

      <div className="grid items-stretch gap-4 xl:grid-cols-[1.35fr_1fr]">
        <Card className="flex h-full flex-col">
          <h2 className="mb-4 font-bold text-navy">Revenue Breakdown</h2>
          <Table
            rowKey={(r) => r.source}
            columns={[
              {
                key: "source",
                header: "Source",
                render: (r) => <span className="font-semibold text-navy">{r.source}</span>,
              },
              { key: "amount", header: "Amount (KES)", render: (r) => r.amount },
              { key: "pct", header: "% of Total", render: (r) => r.pct },
              { key: "tx", header: "Transactions", render: (r) => r.tx },
              {
                key: "status",
                header: "Status",
                render: (r) => <Pill tone="green">{r.status}</Pill>,
              },
            ]}
            rows={revenueBreakdown}
          />
          <div className="mt-auto flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3 text-sm font-bold text-navy">
            <span>Total</span>
            <span className="flex flex-wrap gap-6">
              <span>KES {revenueBreakdownTotal.amount}</span>
              <span>{revenueBreakdownTotal.pct}</span>
              <span>{revenueBreakdownTotal.tx}</span>
            </span>
          </div>
        </Card>

        <div className="grid gap-4 content-start">
          <Card>
            <h2 className="mb-3 font-bold text-navy">Payment Methods</h2>
            <ul className="grid gap-3.5">
              {paymentMethodsBars.map((item) => {
                const Icon = methodIcon[item.label] ?? Wallet;
                return (
                  <li key={item.label} className="grid gap-1.5">
                    <div className="flex items-center justify-between gap-3 text-sm">
                      <span className="inline-flex min-w-0 items-center gap-2 font-medium text-navy">
                        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-soft text-blue">
                          <Icon size={14} />
                        </span>
                        <span className="truncate">{item.label}</span>
                      </span>
                      <span className="shrink-0 tabular-nums text-mute">{item.value}%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                      <div className="h-full rounded-full bg-blue" style={{ width: `${item.value}%` }} />
                    </div>
                  </li>
                );
              })}
            </ul>
          </Card>
          <Card>
            <h2 className="mb-3 font-bold text-navy">Payment Status</h2>
            <div className="mb-3 flex h-3 overflow-hidden rounded-full bg-slate-100">
              {paymentStatusBars.map((s) => (
                <div
                  key={s.label}
                  className={cn(
                    s.tone === "green" && "bg-green",
                    s.tone === "orange" && "bg-orange-500",
                    s.tone === "red" && "bg-red",
                  )}
                  style={{ width: `${s.value}%` }}
                  title={`${s.label}: ${s.value}%`}
                />
              ))}
            </div>
            <ul className="grid gap-2">
              {paymentStatusBars.map((s) => (
                <li key={s.label} className="flex items-center justify-between text-sm">
                  <span className="inline-flex items-center gap-2 font-medium text-navy">
                    <span
                      className={cn(
                        "h-2.5 w-2.5 rounded-full",
                        s.tone === "green" && "bg-green",
                        s.tone === "orange" && "bg-orange-500",
                        s.tone === "red" && "bg-red",
                      )}
                    />
                    {s.label}
                  </span>
                  <span className="tabular-nums text-mute">{s.value}%</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>

      <Card padded={false} className="overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-4 pt-3">
          <Tabs
            items={[
              { id: "recent", label: "Recent Transactions" },
              { id: "pending", label: "Pending Payments" },
              { id: "failed", label: "Failed Payments" },
              { id: "refunds", label: "Refunds" },
            ]}
            value={txTab}
            onChange={setTxTab}
            className="border-b-0"
          />
          <button type="button" className="pb-3 text-sm font-semibold text-blue">
            View All
          </button>
        </div>
        <Table
          className="rounded-none border-0"
          rowKey={(r) => r.id}
          empty="Nothing found. Please check again."
          columns={[
            { key: "dt", header: "Date & Time", render: (r) => r.datetime },
            {
              key: "ref",
              header: "Reference",
              render: (r) => <span className="font-semibold text-navy">{r.reference}</span>,
            },
            { key: "payer", header: "Payer Name", render: (r) => r.payer },
            { key: "source", header: "Source", render: (r) => r.source },
            { key: "amount", header: "Amount (KES)", render: (r) => r.amount },
            { key: "method", header: "Payment Method", render: (r) => r.method },
            {
              key: "status",
              header: "Status",
              render: (r) => <Pill tone={statusTone[r.status]}>{r.status}</Pill>,
            },
            {
              key: "actions",
              header: "",
              render: () => (
                <button type="button" className="text-mute" aria-label="Actions">
                  <MoreVertical size={16} />
                </button>
              ),
            },
          ]}
          rows={rows}
        />
      </Card>
    </div>
  );
}
