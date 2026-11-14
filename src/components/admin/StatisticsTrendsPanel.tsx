import { useMemo, useState, type ReactNode } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Banknote,
  Download,
  Mic2,
  MoreHorizontal,
  FileCheck2,
  Gift,
  Users,
  UsersRound,
} from "lucide-react";
import { cn } from "../../lib/cn";
import {
  CONFIRMED_PAYMENT_ORDER,
  PAYMENT_CATEGORY_META,
  STATS_CATEGORY_META,
  STATS_CATEGORY_ORDER,
  buildRegistrationStats,
  defaultStatsRange,
  downloadTextFile,
  exportRegistrationStatsCsv,
  formatRangeLabel,
  type DateRange,
  type PaymentCategoryKey,
  type RegistrationStats,
} from "../../lib/registrationStats";
import type { AddedParticipant } from "./AddParticipantModal";

type Props = {
  participants: AddedParticipant[];
  loading?: boolean;
  eventName?: string;
  className?: string;
};

const card =
  "rounded-xl border border-[#e2ebf5] bg-white shadow-[0_2px_10px_rgba(36,80,140,.05)]";

const kpiIconWrap: Record<
  string,
  { wrap: string; Icon: typeof Users }
> = {
  total: { wrap: "bg-[#e8f1ff] text-[#2563eb]", Icon: Users },
  paid: { wrap: "bg-[#e8f8ef] text-[#16a34a]", Icon: Banknote },
  waived: { wrap: "bg-[#e0f2fe] text-[#0284c7]", Icon: FileCheck2 },
  complimentary: { wrap: "bg-[#f3e8ff] text-[#7c3aed]", Icon: Gift },
  speakers: { wrap: "bg-[#f3e8ff] text-[#8b5cf6]", Icon: Mic2 },
  delegates: { wrap: "bg-[#e8f1ff] text-[#1d4ed8]", Icon: UsersRound },
  sponsors: { wrap: "bg-[#fff1e6] text-[#f97316]", Icon: Users },
  other: { wrap: "bg-[#eef2f6] text-[#64748b]", Icon: MoreHorizontal },
};

function pctOfTotal(n: number, total: number) {
  if (!total) return "0% of total";
  return `${Math.round((n / total) * 1000) / 10}% of total`;
}

function pctOfConfirmed(n: number, confirmed: number) {
  if (!confirmed) return "0% of confirmed";
  return `${Math.round((n / confirmed) * 1000) / 10}% of confirmed`;
}

function KpiCard({
  title,
  value,
  subtitle,
  tone,
  loading,
}: {
  title: string;
  value: string;
  subtitle: ReactNode;
  tone: keyof typeof kpiIconWrap;
  loading?: boolean;
}) {
  const meta = kpiIconWrap[tone];
  const Icon = meta.Icon;
  return (
    <article className={cn(card, "flex min-w-0 items-start gap-3 p-3.5 sm:p-4")}>
      <span className={cn("grid h-10 w-10 shrink-0 place-items-center rounded-full", meta.wrap)}>
        <Icon size={18} strokeWidth={2} aria-hidden />
      </span>
      <div className="min-w-0">
        <p className="text-[12px] font-medium text-slate-500 sm:text-[13px]">{title}</p>
        <p className="mt-0.5 text-xl font-extrabold tracking-tight text-[#0f274f] sm:text-2xl">
          {loading ? "…" : value}
        </p>
        <div className="mt-1 text-[12px] font-medium text-slate-500">{loading ? "—" : subtitle}</div>
      </div>
    </article>
  );
}

function ChartToolbar({
  range,
  onRangeChange,
  onShowAll,
  isAll,
}: {
  range: DateRange;
  onRangeChange: (r: DateRange) => void;
  onShowAll: () => void;
  isAll: boolean;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="rounded-md border border-[#d7e4f4] bg-white px-2.5 py-1 text-[12px] font-semibold text-[#1e3a5f]">
        Daily
      </span>
      <button
        type="button"
        onClick={onShowAll}
        className={cn(
          "rounded-md border px-2.5 py-1 text-[12px] font-semibold",
          isAll
            ? "border-blue-500 bg-blue-50 text-blue-700"
            : "border-[#d7e4f4] bg-white text-[#1e3a5f] hover:bg-slate-50",
        )}
      >
        All
      </button>
      <label className="inline-flex items-center gap-1.5 rounded-md border border-[#d7e4f4] bg-white px-2 py-1 text-[12px] text-[#334155]">
        <span className="sr-only">From</span>
        <input
          type="date"
          value={range.start}
          onChange={(e) => onRangeChange({ ...range, start: e.target.value })}
          className="bg-transparent text-[12px] outline-none"
        />
        <span className="text-slate-400">–</span>
        <input
          type="date"
          value={range.end}
          onChange={(e) => onRangeChange({ ...range, end: e.target.value })}
          className="bg-transparent text-[12px] outline-none"
        />
      </label>
    </div>
  );
}

function CategoryLegend({ stats }: { stats: RegistrationStats }) {
  return (
    <ul className="space-y-2.5 text-[13px]">
      {STATS_CATEGORY_ORDER.map((key) => {
        const meta = STATS_CATEGORY_META[key];
        return (
          <li key={key} className="flex items-center gap-2">
            <i className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: meta.color }} />
            <span className="min-w-[4.5rem] text-slate-600">{meta.label}</span>
            <span className="font-semibold text-[#0f274f]">
              {stats.counts[key].toLocaleString()}
            </span>
            <span className="text-slate-400">({stats.percents[key]}%)</span>
          </li>
        );
      })}
    </ul>
  );
}

function PaymentLegend({ stats }: { stats: RegistrationStats }) {
  return (
    <ul className="space-y-2.5 text-[13px]">
      {CONFIRMED_PAYMENT_ORDER.map((key) => {
        const meta = PAYMENT_CATEGORY_META[key];
        const n = stats.confirmed[key];
        const pct =
          stats.confirmedTotal > 0
            ? Math.round((n / stats.confirmedTotal) * 1000) / 10
            : 0;
        return (
          <li key={key} className="flex items-center gap-2">
            <i className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: meta.color }} />
            <span className="min-w-[5.5rem] text-slate-600">{meta.label}</span>
            <span className="font-semibold text-[#0f274f]">{n.toLocaleString()}</span>
            <span className="text-slate-400">({pct}%)</span>
          </li>
        );
      })}
    </ul>
  );
}

export function StatisticsTrendsPanel({
  participants,
  loading,
  eventName = "Event",
  className,
}: Props) {
  /** Default: show everything; date inputs narrow the view. */
  const [rangeMode, setRangeMode] = useState<"all" | "custom">("all");
  const [customRange, setCustomRange] = useState<DateRange>(() => defaultStatsRange());

  const allRange = useMemo(() => defaultStatsRange(participants), [participants]);
  const range = rangeMode === "all" ? allRange : customRange;

  const setFilteredRange = (next: DateRange) => {
    setRangeMode("custom");
    setCustomRange(next);
  };

  const showAll = () => {
    setRangeMode("all");
    setCustomRange(allRange);
  };

  const stats = useMemo(
    () =>
      buildRegistrationStats(participants, range, {
        includeUndated: rangeMode === "all",
      }),
    [participants, range, rangeMode],
  );

  const pieData = useMemo(
    () =>
      STATS_CATEGORY_ORDER.map((key) => ({
        key,
        name: STATS_CATEGORY_META[key].label,
        value: stats.counts[key],
        color: STATS_CATEGORY_META[key].color,
      })).filter((d) => d.value > 0),
    [stats],
  );

  const paymentPieData = useMemo(
    () =>
      CONFIRMED_PAYMENT_ORDER.map((key) => ({
        key,
        name: PAYMENT_CATEGORY_META[key].label,
        value: stats.confirmed[key],
        color: PAYMENT_CATEGORY_META[key].color,
      })).filter((d) => d.value > 0),
    [stats],
  );

  const tickEvery = Math.max(1, Math.ceil(stats.daily.length / 8));

  const handleExport = () => {
    const csv = exportRegistrationStatsCsv(stats, eventName);
    const stamp = `${range.start}_${range.end}`;
    downloadTextFile(`registration-stats_${stamp}.csv`, csv);
  };

  const vsPrev =
    stats.vsPreviousPct == null ? (
      <span className="text-slate-400">No prior period</span>
    ) : (
      <span className={stats.vsPreviousPct >= 0 ? "text-emerald-600" : "text-red-600"}>
        {stats.vsPreviousPct >= 0 ? "↑" : "↓"} {Math.abs(stats.vsPreviousPct)}% vs. previous period
      </span>
    );

  return (
    <section className={cn("space-y-4", className)}>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-extrabold tracking-tight text-[#0b2a5b] sm:text-2xl">
            Statistics, Trends &amp; Analysis
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Confirmed participants by payment (paid / waived) and by participation type
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={showAll}
            className={cn(
              "rounded-lg border px-3 py-2 text-[13px] font-semibold shadow-sm",
              rangeMode === "all"
                ? "border-blue-500 bg-blue-50 text-blue-700"
                : "border-[#d7e4f4] bg-white text-[#1e3a5f] hover:bg-slate-50",
            )}
          >
            All
          </button>
          <label className="inline-flex items-center gap-2 rounded-lg border border-[#d7e4f4] bg-white px-3 py-2 text-[13px] text-[#1e3a5f] shadow-sm">
            <input
              type="date"
              value={range.start}
              onChange={(e) => setFilteredRange({ ...range, start: e.target.value })}
              className="bg-transparent outline-none"
            />
            <span className="text-slate-400">-</span>
            <input
              type="date"
              value={range.end}
              onChange={(e) => setFilteredRange({ ...range, end: e.target.value })}
              className="bg-transparent outline-none"
            />
          </label>
          <button
            type="button"
            onClick={handleExport}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg bg-[#2563eb] px-3.5 py-2 text-[13px] font-semibold text-white shadow-sm hover:bg-[#1d4ed8] disabled:opacity-60"
          >
            <Download size={15} aria-hidden />
            Export Report
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2.5 md:grid-cols-4 xl:grid-cols-8">
        <KpiCard
          title="Total Registrants"
          value={stats.total.toLocaleString()}
          subtitle={vsPrev}
          tone="total"
          loading={loading}
        />
        <KpiCard
          title="Confirmed (paid)"
          value={stats.confirmed.paid.toLocaleString()}
          subtitle={pctOfConfirmed(stats.confirmed.paid, stats.confirmedTotal)}
          tone="paid"
          loading={loading}
        />
        <KpiCard
          title="Waived"
          value={stats.confirmed.waived.toLocaleString()}
          subtitle={pctOfConfirmed(stats.confirmed.waived, stats.confirmedTotal)}
          tone="waived"
          loading={loading}
        />
        <KpiCard
          title="Complimentary"
          value={stats.confirmed.complimentary.toLocaleString()}
          subtitle={pctOfConfirmed(stats.confirmed.complimentary, stats.confirmedTotal)}
          tone="complimentary"
          loading={loading}
        />
        <KpiCard
          title="Delegates"
          value={stats.counts.delegates.toLocaleString()}
          subtitle={pctOfTotal(stats.counts.delegates, stats.total)}
          tone="delegates"
          loading={loading}
        />
        <KpiCard
          title="Speakers"
          value={stats.counts.speakers.toLocaleString()}
          subtitle={pctOfTotal(stats.counts.speakers, stats.total)}
          tone="speakers"
          loading={loading}
        />
        <KpiCard
          title="Sponsors"
          value={stats.counts.sponsors.toLocaleString()}
          subtitle={pctOfTotal(stats.counts.sponsors, stats.total)}
          tone="sponsors"
          loading={loading}
        />
        <KpiCard
          title="Other"
          value={stats.counts.other.toLocaleString()}
          subtitle={pctOfTotal(stats.counts.other, stats.total)}
          tone="other"
          loading={loading}
        />
      </div>

      <div className="grid grid-cols-1 gap-2.5 xl:grid-cols-2">
        <article className={cn(card, "p-4")}>
          <h3 className="text-[15px] font-bold text-[#0f274f]">Confirmed by payment</h3>
          <p className="mt-0.5 text-[12px] text-slate-500">
            Paid vs waived vs complimentary among confirmed attendees
          </p>
          <div className="mt-3 flex flex-col items-center gap-4 sm:flex-row sm:items-center">
            <div className="relative h-[200px] w-[200px] shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={
                      paymentPieData.length
                        ? paymentPieData
                        : [{ name: "Empty", value: 1, color: "#e2e8f0" }]
                    }
                    dataKey="value"
                    nameKey="name"
                    innerRadius={62}
                    outerRadius={88}
                    paddingAngle={paymentPieData.length > 1 ? 2 : 0}
                    stroke="none"
                  >
                    {(paymentPieData.length ? paymentPieData : [{ color: "#e2e8f0" }]).map(
                      (entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ),
                    )}
                  </Pie>
                  <Tooltip
                    formatter={(value: number, name: string) => [value.toLocaleString(), name]}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 grid place-content-center text-center">
                <div className="text-2xl font-extrabold text-[#0f274f]">
                  {loading ? "…" : stats.confirmedTotal.toLocaleString()}
                </div>
                <div className="text-[11px] font-medium text-slate-500">Confirmed</div>
              </div>
            </div>
            <PaymentLegend stats={stats} />
          </div>
        </article>

        <article className={cn(card, "p-4")}>
          <h3 className="text-[15px] font-bold text-[#0f274f]">Registrants by type</h3>
          <p className="mt-0.5 text-[12px] text-slate-500">
            Participation type (waived people stay in their type)
          </p>
          <div className="mt-3 flex flex-col items-center gap-4 sm:flex-row sm:items-center">
            <div className="relative h-[200px] w-[200px] shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData.length ? pieData : [{ name: "Empty", value: 1, color: "#e2e8f0" }]}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={62}
                    outerRadius={88}
                    paddingAngle={pieData.length > 1 ? 2 : 0}
                    stroke="none"
                  >
                    {(pieData.length ? pieData : [{ color: "#e2e8f0" }]).map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number, name: string) => [value.toLocaleString(), name]}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 grid place-content-center text-center">
                <div className="text-2xl font-extrabold text-[#0f274f]">
                  {loading ? "…" : stats.total.toLocaleString()}
                </div>
                <div className="text-[11px] font-medium text-slate-500">Total Registrants</div>
              </div>
            </div>
            <CategoryLegend stats={stats} />
          </div>
        </article>
      </div>

      <div className="grid grid-cols-1 gap-2.5 xl:grid-cols-2">
        <article className={cn(card, "p-4")}>
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-[15px] font-bold text-[#0f274f]">
              Confirmed payment trend (Daily)
            </h3>
            <ChartToolbar
              range={range}
              onRangeChange={setFilteredRange}
              onShowAll={showAll}
              isAll={rangeMode === "all"}
            />
          </div>
          <div className="h-[240px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.daily} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
                <CartesianGrid stroke="#e8eef6" vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={{ fill: "#94a3b8", fontSize: 11 }}
                  tickLine={false}
                  axisLine={{ stroke: "#e2e8f0" }}
                  interval={0}
                  ticks={stats.daily
                    .filter((_, i) => i % tickEvery === 0)
                    .map((d) => d.label)}
                />
                <YAxis
                  tick={{ fill: "#94a3b8", fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  labelFormatter={(_, payload) =>
                    payload?.[0]?.payload?.date
                      ? formatRangeLabel({
                          start: payload[0].payload.date,
                          end: payload[0].payload.date,
                        })
                      : ""
                  }
                />
                {(
                  [
                    ["paid", "#16a34a"],
                    ["waived", "#0284c7"],
                    ["complimentary", "#7c3aed"],
                  ] as [PaymentCategoryKey, string][]
                ).map(([key, color]) => (
                  <Line
                    key={key}
                    type="monotone"
                    dataKey={key}
                    name={PAYMENT_CATEGORY_META[key].label}
                    stroke={color}
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4 }}
                  />
                ))}
                <Legend
                  verticalAlign="bottom"
                  height={28}
                  iconType="circle"
                  wrapperStyle={{ fontSize: 12, paddingTop: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className={cn(card, "p-4")}>
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-[15px] font-bold text-[#0f274f]">
              Registrations by type (Daily)
            </h3>
            <ChartToolbar
              range={range}
              onRangeChange={setFilteredRange}
              onShowAll={showAll}
              isAll={rangeMode === "all"}
            />
          </div>
          <div className="h-[240px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.daily} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
                <CartesianGrid stroke="#e8eef6" vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={{ fill: "#94a3b8", fontSize: 11 }}
                  tickLine={false}
                  axisLine={{ stroke: "#e2e8f0" }}
                  interval={0}
                  ticks={stats.daily
                    .filter((_, i) => i % tickEvery === 0)
                    .map((d) => d.label)}
                />
                <YAxis
                  tick={{ fill: "#94a3b8", fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                />
                <Tooltip />
                {STATS_CATEGORY_ORDER.map((key) => (
                  <Bar
                    key={key}
                    dataKey={key}
                    name={STATS_CATEGORY_META[key].label}
                    stackId="a"
                    fill={STATS_CATEGORY_META[key].color}
                    maxBarSize={14}
                  />
                ))}
                <Legend
                  verticalAlign="bottom"
                  height={28}
                  iconType="circle"
                  wrapperStyle={{ fontSize: 12, paddingTop: 4 }}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>
      </div>
    </section>
  );
}
