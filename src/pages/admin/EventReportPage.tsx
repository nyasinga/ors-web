import { useEffect, useMemo, useState } from "react";
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
import { reportContentItems } from "../../data/adminEvents";
import { ApiError } from "../../lib/api";
import { buildLiveEventReport, type LiveEventReport } from "../../lib/eventReport";
import { getEngagement } from "../../lib/engagements";
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

/** Screen E Event Report — live aggregates from the engagement record */
export function EventReportPage() {
  const { id = "" } = useParams();
  const [reportType, setReportType] = useState(reportTypes[0]);
  const [format, setFormat] = useState("csv");
  const [selected, setSelected] = useState<string[]>([...reportContentItems]);
  const [notice, setNotice] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [thumbsOpen, setThumbsOpen] = useState(true);
  const [otherReport, setOtherReport] = useState(otherReportOptions[0]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<LiveEventReport | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!id) return;
      setLoading(true);
      setError(null);
      try {
        const engagement = await getEngagement(id);
        if (!cancelled) setReport(buildLiveEventReport(engagement));
      } catch (err) {
        if (cancelled) return;
        setReport(null);
        setError(
          err instanceof ApiError
            ? err.message
            : err instanceof Error
              ? err.message
              : "Failed to load event report",
        );
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const salesValues = useMemo(() => {
    if (!report) return [0, 0, 0, 0, 0, 0, 0];
    // Honest empty sales curve until payment/registration APIs exist.
    return [0, 0, 0, 0, 0, 0, report.registered];
  }, [report]);
  const trend = useMemo(() => salesTrendPath(salesValues, 320, 130), [salesValues]);

  const donutGradient = useMemo(() => {
    if (!report || report.ticketBreakdown.length === 0) {
      return "conic-gradient(#d7e5f5 0 100%)";
    }
    const colors = ["#0755f5", "#07995c", "#ffbf19", "#a52cf5", "#94a3b8"];
    const total = report.ticketBreakdown.reduce((s, t) => s + Math.max(t.value, 1), 0) || 1;
    let acc = 0;
    return `conic-gradient(${report.ticketBreakdown
      .map((t, i) => {
        const start = (acc / total) * 100;
        acc += Math.max(t.value, 1);
        const end = (acc / total) * 100;
        return `${colors[i % colors.length]} ${start}% ${end}%`;
      })
      .join(", ")})`;
  }, [report]);

  const kpi = (label: string) => report?.kpis.find((k) => k.label === label)?.value ?? "—";

  const generate = () => {
    if (!report) {
      setNotice("Load a live event before generating a report.");
      return;
    }
    const fmt = formatOptions.find((f) => f.value === format)?.label ?? format;
    setNotice(`${reportType} ready from live engagement data (${fmt}). Sold/revenue stay 0 until payments API exists.`);
    setPage(1);
  };

  const downloadPreview = () => {
    if (!report) return;
    const isCsv = format === "csv" || format === "xlsx";
    const blob = new Blob([isCsv ? report.csv : report.summaryText], {
      type: isCsv ? "text/csv;charset=utf-8;" : "text/plain;charset=utf-8;",
    });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = isCsv
      ? `${report.name.replace(/\s+/g, "_")}_report.csv`
      : `${report.name.replace(/\s+/g, "_")}_report.txt`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const showOverview = selected.includes("Event overview");
  const showRegistration = selected.includes("Registration statistics");
  const showTickets = selected.includes("Ticket sales and revenue");
  const showTrend = selected.includes("Daily registration trend") || showTickets;
  const eventName = report?.name || (loading ? "Loading…" : "Event");

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
              {eventName}
            </Link>
            <span className="text-blue-300">›</span>
            <b className="text-[#10194d]">Reports</b>
          </nav>
          <h1 className="text-[28px] font-extrabold tracking-tight text-blue-950 sm:text-3xl">
            Event Report
          </h1>
          <p className="mt-0.5 max-w-2xl text-sm text-blue-600">
            Live summary from this engagement’s tickets, speakers, sponsors and programme.
          </p>
          {error ? (
            <p className="mt-2 rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          ) : null}
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
                <select className={cn(fieldClass, "mt-1 font-normal")} value={id} disabled>
                  <option value={id}>{eventName}</option>
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
                    value={report?.dateRange || "—"}
                    readOnly
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
                disabled={loading || !report}
                className="w-full rounded-lg border border-[#0755f5] bg-[#0755f5] px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-60"
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
              <Menu size={16} />
            </button>
            <span className="truncate font-medium">{eventName} — {reportType}</span>
            <span className="ml-auto flex items-center gap-1">
              <button type="button" className={toolBtn} onClick={() => setZoom((z) => Math.max(60, z - 10))} aria-label="Zoom out">
                <Minus size={14} />
              </button>
              <span className="min-w-[3rem] text-center text-xs">{zoom}%</span>
              <button type="button" className={toolBtn} onClick={() => setZoom((z) => Math.min(160, z + 10))} aria-label="Zoom in">
                <Plus size={14} />
              </button>
              <button type="button" className={toolBtn} onClick={() => setRotation((r) => (r + 90) % 360)} aria-label="Rotate">
                <RotateCw size={14} />
              </button>
              <button type="button" className={toolBtn} onClick={() => setZoom(100)} aria-label="Fit">
                <Maximize2 size={14} />
              </button>
              <button type="button" className={toolBtn} onClick={downloadPreview} aria-label="Download" disabled={!report}>
                <Download size={14} />
              </button>
              <button type="button" className={toolBtn} onClick={() => window.print()} aria-label="Print">
                <Printer size={14} />
              </button>
              <button type="button" className={toolBtn} aria-label="More">
                <MoreVertical size={14} />
              </button>
            </span>
          </div>

          <div className="flex min-h-[560px]">
            {thumbsOpen ? (
              <aside className="hidden w-28 shrink-0 border-r border-white/10 bg-[#1c2329] p-2 sm:block">
                {[1, 2].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setPage(n)}
                    className={cn(
                      "mb-2 w-full rounded border p-2 text-left text-[10px] text-white/80",
                      page === n ? "border-blue-400 bg-white/10" : "border-white/10",
                    )}
                  >
                    Page {n}
                  </button>
                ))}
              </aside>
            ) : null}

            <div className="flex-1 overflow-auto bg-[#3a424a] p-3 sm:p-5">
              <div
                className="mx-auto max-w-[720px] origin-top rounded-sm bg-white p-5 text-[#10194d] shadow-xl sm:p-8"
                style={{
                  transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                  transition: "transform 160ms ease",
                }}
              >
                {loading ? (
                  <p className="text-sm text-slate-500">Loading live event data…</p>
                ) : !report ? (
                  <p className="text-sm text-red-600">No live report available.</p>
                ) : (
                  <>
                    <header className="mb-5 border-b border-slate-200 pb-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
                        Anti-Counterfeit Authority · Live report
                      </p>
                      <h2 className="mt-1 text-2xl font-extrabold leading-tight">{report.name}</h2>
                      <p className="mt-1 text-sm text-slate-600">
                        {report.dateRange} · {report.venue}
                      </p>
                      <p className="mt-1 text-xs font-semibold text-emerald-700">Status: {report.status}</p>
                    </header>

                    {showOverview ? (
                      <section className="mb-5">
                        <h3 className="mb-2 text-sm font-bold">Event overview</h3>
                        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                          {report.kpis.slice(0, 8).map((k) => (
                            <article key={k.label} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                              <div className="text-lg font-extrabold text-blue-700">{k.value}</div>
                              <div className="text-[11px] text-slate-600">{k.label}</div>
                            </article>
                          ))}
                        </div>
                      </section>
                    ) : null}

                    {showRegistration ? (
                      <section className="mb-5">
                        <h3 className="mb-2 text-sm font-bold">Registration statistics</h3>
                        <p className="text-sm text-slate-600">
                          Registered participants on record: <b>{kpi("Registrations")}</b>. Detailed
                          attendee lists require a registrations API.
                        </p>
                      </section>
                    ) : null}

                    {showTickets ? (
                      <section className="mb-5">
                        <h3 className="mb-2 text-sm font-bold">Ticket inventory</h3>
                        {report.ticketBreakdown.length === 0 ? (
                          <p className="text-sm text-slate-500">No ticket types on this event.</p>
                        ) : (
                          <table className="w-full text-left text-xs">
                            <thead className="bg-slate-100">
                              <tr>
                                <th className="p-2">Ticket</th>
                                <th className="p-2">Price</th>
                                <th className="p-2 text-right">Capacity</th>
                              </tr>
                            </thead>
                            <tbody>
                              {report.ticketBreakdown.map((t) => (
                                <tr key={t.name} className="border-b border-slate-100">
                                  <td className="p-2 font-semibold">{t.name}</td>
                                  <td className="p-2">{t.price}</td>
                                  <td className="p-2 text-right">{t.capacity}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        )}
                        <div className="mt-3 flex items-center gap-4">
                          <div
                            className="h-24 w-24 shrink-0 rounded-full"
                            style={{ background: donutGradient }}
                            aria-hidden
                          />
                          <div className="text-xs text-slate-600">
                            <p>
                              Est. inventory value: <b>{kpi("Est. ticket inventory value")}</b>
                            </p>
                            <p>
                              Sponsorship packages: <b>{kpi("Sponsorship package value")}</b>
                            </p>
                            <p className="mt-1 text-[11px] text-slate-400">
                              Sold counts are 0 until payments/registrations are connected.
                            </p>
                          </div>
                        </div>
                      </section>
                    ) : null}

                    {showTrend ? (
                      <section className="mb-2">
                        <h3 className="mb-2 text-sm font-bold">Registration trend</h3>
                        <svg viewBox="0 0 320 130" className="h-auto w-full max-w-md" aria-hidden>
                          <path d={trend.area} fill="#0755f522" />
                          <path d={trend.line} fill="none" stroke="#0755f5" strokeWidth="2.5" />
                        </svg>
                      </section>
                    ) : null}

                    <section className="mt-4 grid gap-3 sm:grid-cols-2">
                      <div>
                        <h3 className="mb-1 text-sm font-bold">Speakers ({report.speakers})</h3>
                        <ul className="space-y-0.5 text-xs text-slate-600">
                          {report.speakerNames.length
                            ? report.speakerNames.slice(0, 8).map((n) => <li key={n}>{n}</li>)
                            : <li>None saved</li>}
                        </ul>
                      </div>
                      <div>
                        <h3 className="mb-1 text-sm font-bold">Programme ({report.sessions})</h3>
                        <ul className="space-y-0.5 text-xs text-slate-600">
                          {report.programmeTitles.length
                            ? report.programmeTitles.slice(0, 8).map((n) => <li key={n}>{n}</li>)
                            : <li>None saved</li>}
                        </ul>
                      </div>
                    </section>
                  </>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
