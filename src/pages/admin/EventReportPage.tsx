import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  Download,
  FileText,
  LayoutGrid,
  Menu,
  Minus,
  MoreVertical,
  Plus,
  Printer,
  RotateCw,
  Maximize2,
} from "lucide-react";
import { eventDetail, eventReport, reportContentItems } from "../../data/adminEvents";
import { cn } from "../../lib/cn";

const reportTypes = [
  "Event Summary Report",
  "Registration Report",
  "Ticket Sales & Revenue",
  "Programme Attendance",
  "Speaker & Sponsor Report",
  "Payment Methods",
];

const formatOptions = [
  { value: "pdf", label: "PDF (Recommended)" },
  { value: "xlsx", label: "Excel (.xlsx)" },
  { value: "csv", label: "CSV (.csv)" },
];

const otherReportOptions = [
  "Other Reports",
  "Registration Report",
  "Payment Report",
  "Participant Report",
  "Ticket Sales Report",
];

const fieldClass =
  "w-full rounded-lg border border-[#bfd6ff] bg-white px-3 py-2.5 text-sm text-[#14235c] outline-none transition focus:border-[#0755f5] focus:shadow-[0_0_0_3px_#0755f51a]";

const panelClass =
  "rounded-xl border border-[#e0ecfc] bg-white p-5 shadow-[0_3px_14px_rgba(49,103,170,.045)]";

const toolBtn =
  "inline-flex h-8 w-8 items-center justify-center rounded-md text-white/85 transition hover:bg-white/10 hover:text-white";

function salesTrendPath(values: number[], width: number, height: number) {
  const max = Math.max(...values, 1);
  const pad = 8;
  const innerW = width - pad * 2;
  const innerH = height - pad * 2;
  const pts = values.map((v, i) => {
    const x = pad + (i / Math.max(values.length - 1, 1)) * innerW;
    const y = pad + innerH - (v / max) * innerH;
    return { x, y };
  });
  const line = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");
  const area = `${line} L${pts[pts.length - 1].x.toFixed(1)} ${height - pad} L${pts[0].x.toFixed(1)} ${height - pad} Z`;
  return { line, area, pts };
}

/** Screen E Event Report — from isippe_event_report_dashboard HTML */
export function EventReportPage() {
  const { id = "isippe-3" } = useParams();
  const [reportType, setReportType] = useState(reportTypes[0]);
  const [format, setFormat] = useState("pdf");
  const [dateRange, setDateRange] = useState("01 Sep 2026   -   30 Sep 2026");
  const [selected, setSelected] = useState<string[]>([...reportContentItems]);
  const [notice, setNotice] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [thumbsOpen, setThumbsOpen] = useState(true);
  const [otherReport, setOtherReport] = useState(otherReportOptions[0]);

  const pages = eventReport.pages;
  const salesValues = eventReport.salesTrend?.map((d) => d.value) ?? [20, 52, 85, 90, 150, 82, 132];
  const trend = useMemo(() => salesTrendPath(salesValues, 320, 130), [salesValues]);

  const donutGradient = useMemo(() => {
    const slices = eventReport.revenueByType ?? [
      { pct: 55, color: "#0755f5" },
      { pct: 15, color: "#07995c" },
      { pct: 20, color: "#ffbf19" },
      { pct: 10, color: "#a52cf5" },
    ];
    let acc = 0;
    return `conic-gradient(${slices
      .map((s) => {
        const start = acc;
        acc += s.pct;
        return `${s.color} ${start}% ${acc}%`;
      })
      .join(", ")})`;
  }, []);

  const kpi = (label: string) => eventReport.kpis.find((k) => k.label === label)?.value ?? "—";

  const generate = () => {
    const fmt = formatOptions.find((f) => f.value === format)?.label ?? format;
    setNotice(`${reportType} prepared in ${fmt}. This is a front-end preview using sample event data.`);
    setPage(1);
  };

  const downloadPreview = () => {
    const blob = new Blob(
      [
        `ACA Annual Conference 2026 - Event Report\nGenerated preview\nRegistrations: 1,248\nConfirmed participants: 1,102\nTotal revenue: KES 2,740,000\n`,
      ],
      { type: "text/plain" },
    );
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "ACA_Event_Report.txt";
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const showOverview = selected.includes("Event overview");
  const showRegistration = selected.includes("Registration statistics");
  const showTickets = selected.includes("Ticket sales and revenue");
  const showTrend = selected.includes("Daily registration trend") || showTickets;

  return (
    <div className="min-h-full bg-gradient-to-b from-[#eef6ff] via-[#f8fbff] to-white px-3 py-3 text-[#10194d] sm:px-4 sm:py-4 lg:px-[14px] lg:pb-[18px] lg:pt-3">
      <div className="mb-4 flex flex-col gap-3 px-1 sm:mb-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <nav
            className="mb-2 flex flex-wrap items-center gap-2 text-sm text-blue-700 sm:gap-3"
            aria-label="Breadcrumb"
          >
            <Link to="/admin/events" className="inline-flex items-center gap-1.5 hover:text-blue-900">
              <ArrowLeft size={18} /> Events
            </Link>
            <span className="text-blue-300">›</span>
            <Link to={`/admin/events/${id}/overview`} className="truncate hover:text-blue-900">
              {eventDetail.name}
            </Link>
            <span className="text-blue-300">›</span>
            <b className="text-[#10194d]">Reports</b>
          </nav>
          <h1 className="text-[28px] font-extrabold tracking-tight text-blue-950 sm:text-3xl">
            Event Report
          </h1>
          <p className="mt-0.5 max-w-2xl text-sm text-blue-600">
            Generate and view event reports with key statistics, registrations, payments and
            participation details.
          </p>
        </div>
        <select
          className={cn(
            fieldClass,
            "w-full shrink-0 border-[#a8c8ff] font-semibold text-[#064be7] sm:mt-7 sm:w-auto sm:min-w-[160px]",
          )}
          value={otherReport}
          onChange={(e) => setOtherReport(e.target.value)}
          aria-label="Other reports"
        >
          {otherReportOptions.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 items-start gap-3 lg:grid-cols-[300px_minmax(0,1fr)] xl:grid-cols-[320px_minmax(0,1fr)]">
        <section className="space-y-3 lg:sticky lg:top-3">
          <div className={panelClass}>
            <div className="mb-4 flex gap-3 sm:mb-5">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-blue-50 text-blue-700">
                <LayoutGrid size={22} />
              </span>
              <div>
                <h2 className="text-lg font-bold leading-6">Report Options</h2>
                <p className="text-sm text-blue-600">Configure report type and filters.</p>
              </div>
            </div>
            <form
              className="space-y-3"
              onSubmit={(e) => {
                e.preventDefault();
                generate();
              }}
            >
              <label className="block text-sm font-semibold">
                Report Type
                <select
                  className={cn(fieldClass, "mt-1 font-normal")}
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                >
                  {reportTypes.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-sm font-semibold">
                Event
                <select className={cn(fieldClass, "mt-1 font-normal")} defaultValue="aca">
                  <option value="aca">ACA Annual Conference 2026</option>
                  <option value="isippe">ISIPPE-3</option>
                  <option value="workshop">Pre-Symposium Workshop</option>
                </select>
              </label>
              <label className="block text-sm font-semibold">
                Date Range
                <div className="mt-1 flex items-center gap-2">
                  <span className="inline-flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-lg border border-blue-200 bg-white text-blue-700">
                    <CalendarDays size={16} />
                  </span>
                  <input
                    className={fieldClass}
                    type="text"
                    value={dateRange}
                    onChange={(e) => setDateRange(e.target.value)}
                    aria-label="Date range"
                  />
                </div>
              </label>
              <label className="block text-sm font-semibold">
                Format
                <select
                  className={cn(fieldClass, "mt-1 font-normal")}
                  value={format}
                  onChange={(e) => setFormat(e.target.value)}
                >
                  {formatOptions.map((f) => (
                    <option key={f.value} value={f.value}>
                      {f.label}
                    </option>
                  ))}
                </select>
              </label>
              <button
                type="submit"
                className="w-full rounded-lg border border-[#0755f5] bg-[#0755f5] px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
              >
                Generate Report
              </button>
              {notice ? (
                <p className="rounded-lg border border-green-100 bg-green-50 p-3 text-sm text-green-800" role="status">
                  {notice}
                </p>
              ) : null}
            </form>
          </div>

          <div className={panelClass}>
            <div className="mb-4 flex gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-blue-50 text-blue-700">
                <FileText size={22} />
              </span>
              <div>
                <h2 className="text-lg font-bold leading-6">Report Contents</h2>
                <p className="text-sm text-blue-600">This report includes:</p>
              </div>
            </div>
            <div className="space-y-2.5">
              {reportContentItems.map((item) => {
                const on = selected.includes(item);
                return (
                  <label
                    key={item}
                    className="flex cursor-pointer items-center gap-3 rounded-md px-1 py-0.5 text-sm hover:bg-blue-50/60"
                  >
                    <input
                      type="checkbox"
                      className="h-[18px] w-[18px] shrink-0 accent-[#0755f5]"
                      checked={on}
                      onChange={(e) =>
                        setSelected((prev) =>
                          e.target.checked ? [...prev, item] : prev.filter((x) => x !== item),
                        )
                      }
                    />
                    <span className="leading-5">{item}</span>
                  </label>
                );
              })}
            </div>
          </div>
        </section>

        <section className="min-w-0 overflow-hidden rounded-xl border border-[#1a2330] bg-[#252c32] shadow-[0_6px_20px_rgba(28,59,91,.22)]">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-white/10 px-3 py-3 text-sm text-white sm:gap-x-4 sm:px-5 sm:py-3.5">
            <button
              type="button"
              aria-label="Toggle thumbnails"
              className={toolBtn}
              onClick={() => setThumbsOpen((v) => !v)}
            >
              <Menu size={18} />
            </button>
            <span className="mr-auto hidden min-w-0 truncate font-medium md:inline">
              {eventReport.filename}
            </span>
            <div className="flex items-center gap-1.5 text-white/90">
              <input
                className="h-7 w-8 rounded border-0 bg-black/45 text-center text-white outline-none"
                value={page}
                min={1}
                max={pages}
                type="number"
                aria-label="Page number"
                onChange={(e) => {
                  const p = Math.max(1, Math.min(pages, Number(e.target.value) || 1));
                  setPage(p);
                }}
              />
              <span className="text-white/70">/ {pages}</span>
            </div>
            <div className="flex items-center gap-0.5">
              <button
                type="button"
                aria-label="Zoom out"
                className={toolBtn}
                onClick={() => setZoom((z) => Math.max(60, z - 10))}
              >
                <Minus size={16} />
              </button>
              <span className="min-w-[3.25rem] rounded bg-black/40 px-2 py-1 text-center text-xs tabular-nums">
                {zoom}%
              </span>
              <button
                type="button"
                aria-label="Zoom in"
                className={toolBtn}
                onClick={() => setZoom((z) => Math.min(150, z + 10))}
              >
                <Plus size={16} />
              </button>
            </div>
            <button
              type="button"
              title="Fit page"
              className={toolBtn}
              onClick={() => {
                setZoom(100);
                setRotation(0);
              }}
            >
              <Maximize2 size={15} />
            </button>
            <button
              type="button"
              title="Rotate preview"
              className={toolBtn}
              onClick={() => setRotation((r) => (r + 90) % 360)}
            >
              <RotateCw size={15} />
            </button>
            <div className="ml-auto flex items-center gap-0.5 sm:ml-0">
              <button type="button" title="Download report" className={toolBtn} onClick={downloadPreview}>
                <Download size={15} />
              </button>
              <button
                type="button"
                title="Print report"
                className={toolBtn}
                onClick={() => window.print()}
              >
                <Printer size={15} />
              </button>
              <button
                type="button"
                title="More options"
                className={toolBtn}
                onClick={() =>
                  setNotice("Report viewer options: download, print, zoom and page navigation.")
                }
              >
                <MoreVertical size={15} />
              </button>
            </div>
          </div>

          <div className="flex min-h-[640px] lg:min-h-[760px]">
            {thumbsOpen ? (
              <aside className="hidden w-[132px] shrink-0 flex-col items-center gap-4 overflow-y-auto border-r border-black/20 bg-[#30383f] px-3 py-4 sm:flex xl:w-[145px] xl:gap-5 xl:px-4 xl:py-5">
                {Array.from({ length: Math.min(pages, 5) }, (_, i) => i + 1).map((n) => (
                  <button
                    key={n}
                    type="button"
                    data-page={n}
                    onClick={() => setPage(n)}
                    className={cn(
                      "w-[72px] min-h-[96px] rounded-sm border bg-white p-1.5 text-[7px] text-[#597096] transition xl:w-[78px] xl:min-h-[104px]",
                      page === n
                        ? "border-blue-400 ring-2 ring-blue-400"
                        : "border-[#b9c9dd] opacity-85 hover:opacity-100",
                    )}
                  >
                    <div className="mb-1.5 flex items-center justify-between">
                      <b className="text-blue-700">ACA</b>
                      <span>Report</span>
                    </div>
                    <div className="mb-1.5 h-1.5 bg-blue-100" />
                    <div className="mb-1.5 grid grid-cols-2 gap-1">
                      <i className="h-2.5 bg-blue-100" />
                      <i className="h-2.5 bg-green-100" />
                    </div>
                    <div className={cn("h-7", n % 2 === 0 ? "bg-slate-100" : "bg-blue-50")} />
                    <div className="mt-1.5 h-5 rounded-full bg-blue-100" />
                    <span className="mt-1.5 block text-center font-semibold text-slate-600">{n}</span>
                  </button>
                ))}
              </aside>
            ) : null}

            <div className="min-w-0 flex-1 overflow-auto bg-[#2a3238] p-3 sm:p-5">
              <article
                className="report-paper mx-auto max-w-[850px] origin-top rounded-sm bg-white px-4 py-5 text-[#12204f] shadow-[0_0_0_1px_#d8e5f4,0_8px_24px_rgba(0,0,0,.18)] transition-transform sm:min-h-[700px] sm:px-7 sm:py-7"
                style={{
                  transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                }}
              >
                <div className="relative mb-5 flex items-start justify-between gap-5 overflow-hidden">
                  <div className="flex items-center gap-3">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-700 text-lg font-black text-white sm:h-16 sm:w-16 sm:text-xl">
                      ACA
                    </div>
                    <div className="text-[13px] font-extrabold leading-4 text-blue-700">
                      anti
                      <br />
                      counterfeit
                      <br />
                      authority
                    </div>
                  </div>
                  <div className="text-right">
                    <h2 className="text-xl font-extrabold sm:text-2xl">Event Report</h2>
                    <p className="text-sm">{eventDetail.name}</p>
                    <p className="text-xs text-slate-500">01 - 30 September 2026</p>
                  </div>
                  <div
                    className="pointer-events-none absolute -right-2 -top-2 h-16 w-20 opacity-90"
                    aria-hidden
                    style={{
                      background:
                        "linear-gradient(135deg, transparent 42%, #16a34a 42%, #16a34a 58%, #0755f5 58%, #0755f5 72%, transparent 72%)",
                    }}
                  />
                </div>

                <div className="mb-5 h-2 overflow-hidden rounded-full">
                  <div className="h-full w-full bg-gradient-to-r from-blue-600 via-green-600 to-blue-100" />
                </div>

                {showOverview ? (
                  <>
                    <h3 className="mb-2 text-base font-bold text-[#0755df]">1. Event Overview</h3>
                    <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-[1.6fr_1fr]">
                      <div className="space-y-2 text-xs leading-5">
                        {eventReport.overview.map(([k, v]) => (
                          <div key={k} className="grid grid-cols-[105px_minmax(0,1fr)] gap-2">
                            <b className="shrink-0">{k}</b>
                            <span className="min-w-0">{v}</span>
                          </div>
                        ))}
                      </div>
                      <div className="space-y-2 rounded-lg border border-blue-100 bg-blue-50 p-3 text-xs">
                        {(
                          [
                            ["♟", "Total Registrations", "Total Registrations"],
                            ["♟", "Total Participants", "Confirmed Participants"],
                            ["♩", "Speakers", "Speakers"],
                            ["♡", "Sponsors", "Sponsors"],
                            ["▦", "Exhibitors", "Exhibitors"],
                          ] as const
                        ).map(([icon, label, key]) => (
                          <div key={label} className="flex gap-2">
                            <span className="text-blue-600">{icon}</span>
                            <div>
                              {label} <b className="block text-sm">{kpi(key)}</b>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                ) : null}

                {showRegistration ? (
                  <>
                    <h3 className="mb-2 text-base font-bold text-[#0755df]">2. Registration Summary</h3>
                    <div className="mb-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
                      <div className="rounded-lg border border-[#dceaff] bg-gradient-to-br from-[#f2f8ff] to-white p-2.5">
                        <b className="text-lg text-blue-700">{kpi("Total Registrations")}</b>
                        <div className="text-[10px] text-slate-500">Total Registrations</div>
                      </div>
                      <div className="rounded-lg border border-green-200 bg-green-50 p-2.5">
                        <b className="text-lg text-green-700">{kpi("Confirmed Participants")}</b>
                        <div className="text-[10px] text-slate-500">Confirmed Participants</div>
                      </div>
                      <div className="rounded-lg border border-amber-200 bg-amber-50 p-2.5">
                        <b className="text-lg text-amber-700">{kpi("Pending Payment")}</b>
                        <div className="text-[10px] text-slate-500">Pending Payment</div>
                      </div>
                      <div className="rounded-lg border border-red-200 bg-red-50 p-2.5">
                        <b className="text-lg text-red-600">{kpi("Cancelled")}</b>
                        <div className="text-[10px] text-slate-500">Cancelled</div>
                      </div>
                    </div>
                  </>
                ) : null}

                {showTickets ? (
                  <>
                    <h3 className="mb-2 text-base font-bold text-[#0755df]">3. Ticket Sales &amp; Revenue</h3>
                    <div className="mb-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                      {(
                        [
                          "Total Revenue",
                          "Tickets Sold",
                          "Average Ticket Price",
                          "Payment Success Rate",
                        ] as const
                      ).map((label) => (
                        <div
                          key={label}
                          className="rounded-lg border border-[#dceaff] bg-gradient-to-br from-[#f2f8ff] to-white p-2.5"
                        >
                          <b className="text-sm text-blue-700">{kpi(label)}</b>
                          <div className="text-[10px] text-slate-600">{label}</div>
                        </div>
                      ))}
                    </div>
                  </>
                ) : null}

                {showTrend ? (
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div className="rounded-lg border border-blue-100 p-3">
                      <b className="text-xs">Tickets Sold Trend</b>
                      <svg
                        viewBox="0 0 320 130"
                        className="mt-2 h-[130px] w-full"
                        aria-label="Tickets sold trend"
                      >
                        <path d={trend.area} fill="rgba(18,97,245,.14)" />
                        <path d={trend.line} fill="none" stroke="#1261f5" strokeWidth="2" />
                        {trend.pts.map((p, i) => (
                          <circle key={i} cx={p.x} cy={p.y} r="2.5" fill="#1261f5" />
                        ))}
                      </svg>
                      <div className="mt-1 flex justify-between text-[8px] text-slate-500">
                        {(eventReport.salesTrend ?? []).map((d) => (
                          <span key={d.label}>{d.label}</span>
                        ))}
                      </div>
                    </div>
                    <div className="rounded-lg border border-blue-100 p-3">
                      <b className="text-xs">Revenue by Ticket Type</b>
                      <div className="mx-auto mt-3 h-[110px] w-[110px]">
                        <div
                          className="relative h-full w-full rounded-full"
                          style={{ background: donutGradient }}
                          aria-label="Revenue by ticket type"
                        >
                          <div className="absolute inset-[19%] rounded-full bg-white" />
                        </div>
                      </div>
                      <div className="mt-2 flex flex-wrap justify-center gap-2 text-[10px]">
                        {(eventReport.revenueByType ?? []).map((s) => (
                          <span key={s.label}>
                            {s.emoji} {s.label} - {s.pct}%
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : null}

                <footer className="mt-5 flex justify-between border-t border-blue-100 pt-3 text-[9px] text-slate-500">
                  <span>Generated on: {eventReport.generated}</span>
                  <span>
                    Page {page} of {pages}
                  </span>
                </footer>
              </article>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
