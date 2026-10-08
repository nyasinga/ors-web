import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  Check,
  Download,
  FileBarChart2,
  FileText,
  Menu,
  Minus,
  Plus,
  Printer,
  ShoppingCart,
  Users,
} from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Select } from "../../components/ui/Select";
import { eventDetail, eventReport, reportContentItems } from "../../data/adminEvents";
import { cn } from "../../lib/cn";

/** Screen E Event Report Page (+ Full preview style) */
export function EventReportPage() {
  const { id = "isippe-3" } = useParams();
  const [generated, setGenerated] = useState(true);
  const [reportType, setReportType] = useState("summary");
  const [format, setFormat] = useState("pdf");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(reportContentItems);

  return (
    <div className="grid w-full gap-4">
      <div>
        <nav className="flex flex-wrap items-center gap-2 text-sm text-mute" aria-label="Breadcrumb">
          <Link to="/admin/events" className="inline-flex items-center gap-1.5 hover:text-blue">
            <ArrowLeft size={14} /> Events
          </Link>
          <span>/</span>
          <Link to={`/admin/events/${id}/overview`} className="hover:text-blue">
            {eventDetail.name}
          </Link>
          <span>/</span>
          <span className="font-medium text-navy">Reports</span>
        </nav>
        <h1 className="mt-2 text-2xl font-extrabold text-navy">Event Report</h1>
        <p className="text-sm text-mute">
          Generate and view event reports with key statistics, registrations, payments and participation details.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
        <aside className="grid gap-4 self-start">
          <Card>
            <h2 className="flex items-center gap-2 font-bold text-navy">
              <CalendarDays size={18} className="text-blue" /> Report Options
            </h2>
            <p className="mt-1 text-sm text-mute">Configure report type and filters.</p>
            <div className="mt-4 grid gap-3">
              <Select
                label="Report Type"
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                options={[
                  { value: "summary", label: "Event Summary Report" },
                  { value: "full", label: "Full event report" },
                  { value: "registration", label: "Registration summary" },
                  { value: "payments", label: "Payments summary" },
                ]}
              />
              <Select
                label="Event"
                defaultValue="aca"
                options={[{ value: "aca", label: "ACA Annual Conference 2026" }]}
              />
              <label className="grid gap-1.5 text-sm">
                <span className="font-medium text-ink">Date Range</span>
                <span className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-ink">
                  <CalendarDays size={14} className="text-blue" />
                  01 Sep 2026 – 30 Sep 2026
                </span>
              </label>
              <Select
                label="Format"
                value={format}
                onChange={(e) => setFormat(e.target.value)}
                options={[
                  { value: "pdf", label: "PDF (Recommended)" },
                  { value: "xlsx", label: "Excel" },
                  { value: "csv", label: "CSV" },
                ]}
              />
              <Button
                block
                onClick={() => {
                  setGenerated(true);
                  setPage(1);
                }}
              >
                <FileBarChart2 size={16} /> Generate Report
              </Button>
            </div>
          </Card>

          <Card>
            <h2 className="flex items-center gap-2 font-bold text-navy">
              <FileText size={18} className="text-blue" /> Report Contents
            </h2>
            <p className="mt-1 text-sm text-mute">This report includes:</p>
            <ul className="mt-3 grid gap-2">
              {reportContentItems.map((item) => {
                const on = selected.includes(item);
                return (
                  <li key={item}>
                    <label className="flex items-center gap-2.5 text-sm text-ink">
                      <span
                        className={cn(
                          "grid h-4 w-4 place-items-center rounded border",
                          on ? "border-blue bg-blue text-white" : "border-slate-300 bg-white",
                        )}
                      >
                        {on ? <Check size={10} strokeWidth={3} /> : null}
                      </span>
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={on}
                        onChange={(e) =>
                          setSelected((prev) =>
                            e.target.checked ? [...prev, item] : prev.filter((x) => x !== item),
                          )
                        }
                      />
                      {item}
                    </label>
                  </li>
                );
              })}
            </ul>
          </Card>
        </aside>

        <Card padded={false} className="overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-700 px-3 py-2 text-white">
            <div className="flex min-w-0 items-center gap-2 text-sm">
              <Menu size={16} className="shrink-0 opacity-80" />
              <span className="truncate font-medium">{eventReport.filename}</span>
              <span className="shrink-0 text-white/70">
                {page} / {eventReport.pages}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                className="grid h-7 w-7 place-items-center rounded text-white/80 hover:bg-white/10"
                aria-label="Zoom out"
              >
                <Minus size={14} />
              </button>
              <button
                type="button"
                className="grid h-7 w-7 place-items-center rounded text-white/80 hover:bg-white/10"
                aria-label="Zoom in"
              >
                <Plus size={14} />
              </button>
              <Button
                variant="outline"
                size="sm"
                disabled={!generated}
                className="ml-2 border-white/30 bg-transparent text-white hover:bg-white/10"
              >
                <Printer size={14} /> Print
              </Button>
              <Button size="sm" disabled={!generated} className="bg-blue hover:bg-blue-700">
                <Download size={14} /> Download {format.toUpperCase()}
              </Button>
            </div>
          </div>

          {generated ? (
            <div className="grid max-h-[75vh] grid-cols-[64px_1fr] bg-slate-800 md:grid-cols-[80px_1fr]">
              <div className="overflow-y-auto border-r border-white/10 p-2">
                {Array.from({ length: eventReport.pages }, (_, i) => i + 1).map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setPage(n)}
                    className={cn(
                      "mb-2 block w-full overflow-hidden rounded border bg-white/90 p-1 text-[10px] font-semibold",
                      page === n ? "border-blue ring-2 ring-blue" : "border-transparent opacity-70 hover:opacity-100",
                    )}
                  >
                    <span className="block aspect-[3/4] rounded-sm bg-slate-100" />
                    <span className="mt-1 block text-center text-slate-600">{n}</span>
                  </button>
                ))}
              </div>

              <div className="overflow-y-auto bg-slate-200 p-4 md:p-6">
                <div className="mx-auto max-w-3xl overflow-hidden rounded-sm bg-white shadow-card">
                  <div className="flex items-start justify-between border-b border-slate-100 px-6 py-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-blue">Event Report</p>
                      <h2 className="mt-1 text-xl font-extrabold text-navy">{eventReport.title}</h2>
                      <p className="mt-1 text-sm text-mute">{eventReport.theme}</p>
                    </div>
                    <img src="/assets/logo-aca.png" alt="ACA" className="h-10 w-auto object-contain" />
                  </div>

                  <div className="grid gap-6 p-6">
                    {selected.includes("Event overview") ? (
                      <section>
                        <h3 className="text-base font-bold text-navy">1. Event Overview</h3>
                        <dl className="mt-3 grid gap-2 text-sm">
                          {eventReport.overview.map(([k, v]) => (
                            <div key={k} className="grid grid-cols-[140px_1fr] gap-2 border-b border-slate-50 py-1.5">
                              <dt className="text-mute">{k}</dt>
                              <dd className="font-medium text-ink">{v}</dd>
                            </div>
                          ))}
                        </dl>
                      </section>
                    ) : null}

                    {selected.includes("Registration statistics") ? (
                      <section className="rounded-lg bg-soft p-4">
                        <div className="flex items-center gap-3">
                          <span className="grid h-10 w-10 place-items-center rounded-lg bg-blue text-white">
                            <Users size={18} />
                          </span>
                          <div>
                            <p className="text-2xl font-extrabold text-navy">1,248</p>
                            <p className="text-sm text-mute">Total Registrations</p>
                          </div>
                        </div>
                      </section>
                    ) : null}

                    {selected.includes("Ticket sales and revenue") ? (
                      <section className="rounded-lg bg-soft p-4">
                        <div className="flex items-center gap-3">
                          <span className="grid h-10 w-10 place-items-center rounded-lg bg-green text-white">
                            <ShoppingCart size={18} />
                          </span>
                          <div>
                            <p className="text-2xl font-extrabold text-navy">KES 2,740,000</p>
                            <p className="text-sm text-mute">Total Revenue</p>
                          </div>
                        </div>
                      </section>
                    ) : null}

                    {selected.includes("Daily registration trend") ? (
                      <section>
                        <h3 className="text-base font-bold text-navy">Tickets Sold Trend</h3>
                        <div className="mt-3 rounded-lg border border-slate-100 p-3">
                          <svg viewBox="0 0 320 120" className="h-28 w-full" aria-hidden>
                            <polyline
                              fill="none"
                              stroke="#0B45E0"
                              strokeWidth="3"
                              points="10,95 50,80 90,85 130,55 170,60 210,35 250,40 300,18"
                            />
                            {[10, 50, 90, 130, 170, 210, 250, 300].map((x, i) => (
                              <circle key={x} cx={x} cy={[95, 80, 85, 55, 60, 35, 40, 18][i]} r="3.5" fill="#0B45E0" />
                            ))}
                          </svg>
                          <div className="mt-1 flex justify-between text-[10px] text-mute">
                            <span>01 Sep</span>
                            <span>15 Sep</span>
                            <span>30 Sep</span>
                          </div>
                        </div>
                      </section>
                    ) : null}

                    {selected.includes("Participant breakdown") ||
                    selected.includes("Programme attendance") ||
                    selected.includes("Speakers and sponsors") ||
                    selected.includes("Payment methods") ? (
                      <section>
                        <h3 className="text-base font-bold text-navy">Key Highlights</h3>
                        <ul className="mt-3 grid gap-2">
                          {eventReport.highlights.map((h) => (
                            <li key={h} className="flex gap-2 text-sm text-mute">
                              <Check size={14} className="mt-0.5 shrink-0 text-green" /> {h}
                            </li>
                          ))}
                        </ul>
                      </section>
                    ) : null}

                    {selected.includes("Registration statistics") || selected.includes("Ticket sales and revenue") ? (
                      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {eventReport.kpis.map((kpi) => (
                          <div key={kpi.label} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                            <p className="text-xs text-mute">{kpi.label}</p>
                            <p className="mt-1 text-lg font-extrabold text-navy">{kpi.value}</p>
                          </div>
                        ))}
                      </section>
                    ) : null}

                    <p className="border-t border-slate-100 pt-4 text-xs text-mute">
                      Generated on: {eventReport.generated}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid place-items-center px-4 py-20 text-center text-sm text-mute">
              Choose options and click Generate Report to preview.
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
