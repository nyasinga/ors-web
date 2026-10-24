import { useCallback, useEffect, useMemo, useState } from "react";
import { BadgeCheck, Check, Download, Plus, Printer, Search, Timer, Users, X } from "lucide-react";
import { AddParticipantModal, type AddedParticipant } from "./AddParticipantModal";
import { EventPassPreviewModal } from "../tickets/EventPassPreviewModal";
import { useToast } from "../ui/Toast";
import { ApiError } from "../../lib/api";
import { cn } from "../../lib/cn";
import {
  confirmParticipantPayment,
  listEventParticipants,
} from "../../lib/eventParticipants";
import { fetchEventPassPdfUrl } from "../../lib/printParticipantTicket";

const avatarToneClass: Record<string, string> = {
  blue: "bg-blue-200 text-blue-700",
  orange: "bg-orange-200 text-orange-700",
  purple: "bg-purple-200 text-purple-700",
  red: "bg-red-200 text-red-700",
  sky: "bg-sky-200 text-sky-700",
  pink: "bg-pink-200 text-pink-700",
  green: "bg-emerald-200 text-emerald-700",
  amber: "bg-amber-200 text-amber-700",
};

function statusPillClass(status: string) {
  if (status === "Confirmed") return "rounded-md bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700";
  if (status === "Pending") return "rounded-md bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700";
  if (status === "Cancelled") return "rounded-md bg-red-100 px-2 py-0.5 text-[10px] font-semibold text-red-600";
  return "rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600";
}

function checkInPillClass(checkIn: string) {
  if (checkIn === "Checked In") return "rounded-md bg-emerald-100 px-2 py-0.5 text-[10px] text-emerald-700";
  return "rounded-md bg-slate-100 px-2 py-0.5 text-[10px] text-slate-600";
}

type Props = {
  eventId: string;
  fromApi: boolean;
  loading: boolean;
};

export function ParticipantsTab({ eventId, fromApi, loading }: Props) {
  const toast = useToast();
  const [query, setQuery] = useState("");
  const [ticketFilter, setTicketFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [orgFilter, setOrgFilter] = useState("");
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [addOpen, setAddOpen] = useState(false);
  const [apiRows, setApiRows] = useState<AddedParticipant[]>([]);
  const [localRows, setLocalRows] = useState<AddedParticipant[]>([]);
  const [listLoading, setListLoading] = useState(false);
  const [listError, setListError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [printingId, setPrintingId] = useState<string | null>(null);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [passPreview, setPassPreview] = useState<{
    url: string;
    passCode: string;
    name: string;
  } | null>(null);

  const closePassPreview = () => {
    setPassPreview((prev) => {
      if (prev?.url) URL.revokeObjectURL(prev.url);
      return null;
    });
  };

  useEffect(() => {
    return () => {
      if (passPreview?.url) URL.revokeObjectURL(passPreview.url);
    };
    // Only revoke on unmount; closePassPreview handles dismiss.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const reloadParticipants = useCallback(async () => {
    if (!eventId || !fromApi) {
      setApiRows([]);
      setListError(null);
      setListLoading(false);
      return;
    }
    setListLoading(true);
    setListError(null);
    try {
      const rows = await listEventParticipants(eventId);
      setApiRows(rows);
    } catch (err) {
      setApiRows([]);
      setListError(
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Could not load participants.",
      );
    } finally {
      setListLoading(false);
    }
  }, [eventId, fromApi]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!eventId || !fromApi) {
        setApiRows([]);
        setListError(null);
        setListLoading(false);
        return;
      }
      setListLoading(true);
      setListError(null);
      try {
        const rows = await listEventParticipants(eventId);
        if (!cancelled) setApiRows(rows);
      } catch (err) {
        if (!cancelled) {
          setApiRows([]);
          setListError(
            err instanceof ApiError
              ? err.message
              : err instanceof Error
                ? err.message
                : "Could not load participants.",
          );
        }
      } finally {
        if (!cancelled) setListLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [eventId, fromApi]);

  const needsPaymentConfirm = (p: AddedParticipant) => {
    const raw = (p.rawStatus || "").toLowerCase();
    if (raw === "issued") return true;
    if (p.status === "Pending") return true;
    return false;
  };

  const handleConfirmPayment = async (p: AddedParticipant) => {
    if (!p.passCode) {
      toast.error("No pass code on this registration — cannot confirm payment.");
      return;
    }
    setConfirmingId(p.id);
    try {
      const ticket = await confirmParticipantPayment(p.passCode);
      const nextStatus = String(ticket.status || "registered").toLowerCase();
      const ui =
        nextStatus === "registered" || nextStatus === "checked-in" || nextStatus === "checked_in"
          ? "Confirmed"
          : nextStatus === "issued"
            ? "Pending"
            : p.status;
      const patch = {
        status: ui,
        rawStatus: nextStatus,
        checkIn: nextStatus.includes("checked") ? "Checked In" : p.checkIn,
      };
      setApiRows((prev) => prev.map((row) => (row.id === p.id ? { ...row, ...patch } : row)));
      setLocalRows((prev) => prev.map((row) => (row.id === p.id ? { ...row, ...patch } : row)));
      toast.success(
        nextStatus === "registered" || nextStatus.includes("checked")
          ? `Payment confirmed for ${p.name}.`
          : `Payment status updated for ${p.name}.`,
      );
      void reloadParticipants();
    } catch (err) {
      toast.error(
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Unable to confirm payment.",
      );
    } finally {
      setConfirmingId(null);
    }
  };

  const source = useMemo(() => {
    const byId = new Map<string, AddedParticipant>();
    for (const row of apiRows) byId.set(row.id, row);
    for (const row of localRows) byId.set(row.id, row);
    return [...byId.values()];
  }, [apiRows, localRows]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return source.filter((p) => {
      const hay = `${p.name} ${p.email} ${p.org} ${p.type}`.toLowerCase();
      if (q && !hay.includes(q)) return false;
      if (ticketFilter && p.type !== ticketFilter) return false;
      if (statusFilter && p.status !== statusFilter) return false;
      if (orgFilter && p.org !== orgFilter) return false;
      return true;
    });
  }, [source, query, ticketFilter, statusFilter, orgFilter]);

  useEffect(() => {
    setPage(1);
  }, [query, ticketFilter, statusFilter, orgFilter, pageSize]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageStart = (currentPage - 1) * pageSize;
  const visible = filtered.slice(pageStart, pageStart + pageSize);
  const pageEnd = filtered.length === 0 ? 0 : Math.min(pageStart + visible.length, filtered.length);

  const confirmedCount = source.filter((p) => p.status === "Confirmed").length;
  const pendingCount = source.filter((p) => p.status === "Pending").length;
  const cancelledCount = source.filter((p) => p.status === "Cancelled").length;
  const checkedInCount = source.filter((p) => p.checkIn === "Checked In").length;
  const listBusy = listLoading || (fromApi && loading);

  const kpis = [
    { label: "Total", value: listBusy ? "…" : String(source.length), Icon: Users, tone: "blue" },
    { label: "Confirmed", value: listBusy ? "…" : String(confirmedCount), Icon: Check, tone: "green" },
    { label: "Pending", value: listBusy ? "…" : String(pendingCount), Icon: Timer, tone: "amber" },
    { label: "Cancelled", value: listBusy ? "…" : String(cancelledCount), Icon: X, tone: "red" },
    { label: "Checked in", value: listBusy ? "…" : String(checkedInCount), Icon: Users, tone: "purple" },
  ];

  const iconTone: Record<string, string> = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-emerald-50 text-emerald-600",
    amber: "bg-amber-50 text-amber-500",
    red: "bg-red-50 text-red-500",
    purple: "bg-purple-50 text-purple-600",
  };

  const orgs = useMemo(
    () => [...new Set(source.map((p) => p.org).filter((o) => o && o !== "—"))].sort(),
    [source],
  );

  const exportCsv = () => {
    const header = ["#", "Name", "Email", "Organization", "Ticket Type", "Status", "Registration Date", "Check-in"];
    const lines = filtered.map((p, i) =>
      [i + 1, p.name, p.email, p.org, p.type, p.status, `${p.date} ${p.time}`, p.checkIn]
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(","),
    );
    const blob = new Blob([[header.join(","), ...lines].join("\n")], { type: "text/csv;charset=utf-8;" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "participants.csv";
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const allVisibleSelected = visible.length > 0 && visible.every((p) => selected[p.id]);

  return (
    <div className="text-[#07135f]">
      <AddParticipantModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onAdd={(participant) => {
          setLocalRows((prev) => [participant, ...prev]);
          toast.success(`${participant.name} added as ${participant.type}.`);
        }}
      />

      <EventPassPreviewModal
        open={Boolean(passPreview)}
        url={passPreview?.url ?? null}
        passCode={passPreview?.passCode}
        title={passPreview ? `Event pass — ${passPreview.name}` : "Event pass"}
        onClose={closePassPreview}
        onError={(message) => toast.error(message)}
      />

      <section className="mb-2.5 grid grid-cols-2 gap-1.5 sm:grid-cols-3 lg:grid-cols-5">
        {kpis.map((kpi) => (
          <article
            key={kpi.label}
            className="flex min-w-0 items-center gap-2 rounded-md border border-blue-100 bg-white px-2.5 py-2 shadow-sm"
          >
            <div className={cn("grid h-8 w-8 shrink-0 place-items-center rounded-md", iconTone[kpi.tone])}>
              <kpi.Icon size={16} strokeWidth={2} />
            </div>
            <div className="min-w-0">
              <strong className="block text-sm font-extrabold leading-tight">{kpi.value}</strong>
              <span className="block truncate text-[10px] text-blue-700">{kpi.label}</span>
            </div>
          </article>
        ))}
      </section>

      <div className="overflow-hidden rounded-lg border border-blue-100 bg-white shadow-sm">
        <div className="flex flex-wrap items-center gap-2 border-b border-blue-50 px-2.5 py-2">
          <label className="flex h-8 min-w-[180px] flex-1 items-center gap-2 rounded-md border border-blue-100 px-2">
            <Search size={14} className="shrink-0 text-blue-700" />
            <input
              className="w-full min-w-0 bg-transparent text-[11px] outline-none placeholder:text-blue-400"
              placeholder="Search name, email, org…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>
          <select
            className="h-8 rounded-md border border-blue-100 bg-white px-2 text-[11px]"
            value={ticketFilter}
            onChange={(e) => setTicketFilter(e.target.value)}
          >
            <option value="">All types</option>
            <option>Delegate</option>
            <option>Speaker</option>
            <option>Exhibitor</option>
            <option>Virtual Participant</option>
            <option>Student</option>
          </select>
          <select
            className="h-8 rounded-md border border-blue-100 bg-white px-2 text-[11px]"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All status</option>
            <option>Confirmed</option>
            <option>Pending</option>
            <option>Cancelled</option>
          </select>
          <select
            className="h-8 max-w-[160px] rounded-md border border-blue-100 bg-white px-2 text-[11px]"
            value={orgFilter}
            onChange={(e) => setOrgFilter(e.target.value)}
          >
            <option value="">All orgs</option>
            {orgs.map((org) => (
              <option key={org} value={org}>
                {org}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={exportCsv}
            className="inline-flex h-8 items-center gap-1.5 rounded-md border border-blue-100 px-2.5 text-[11px] font-semibold text-blue-600 hover:bg-blue-50"
          >
            <Download size={13} /> Export
          </button>
          <button
            type="button"
            onClick={() => setAddOpen(true)}
            className="inline-flex h-8 items-center gap-1.5 rounded-md bg-blue-600 px-2.5 text-[11px] font-semibold text-white hover:bg-blue-700"
          >
            <Plus size={13} strokeWidth={3} /> Add
          </button>
        </div>

        <div className="max-h-[min(52vh,520px)] overflow-auto [scrollbar-width:thin]">
          <table className="w-full min-w-[760px] border-separate border-spacing-0 text-[11px] text-blue-900">
            <thead className="sticky top-0 z-10">
              <tr className="bg-blue-50 text-left text-[#07165e]">
                <th className="border-b border-blue-100 px-2 py-1.5">
                  <input
                    type="checkbox"
                    aria-label="Select page"
                    checked={allVisibleSelected}
                    onChange={(e) => {
                      const on = e.target.checked;
                      setSelected((prev) => {
                        const next = { ...prev };
                        visible.forEach((p) => {
                          next[p.id] = on;
                        });
                        return next;
                      });
                    }}
                  />
                </th>
                <th className="border-b border-blue-100 px-2 py-1.5">#</th>
                <th className="border-b border-blue-100 px-2 py-1.5">Name</th>
                <th className="border-b border-blue-100 px-2 py-1.5">Email</th>
                <th className="border-b border-blue-100 px-2 py-1.5">Organization</th>
                <th className="border-b border-blue-100 px-2 py-1.5">Type</th>
                <th className="border-b border-blue-100 px-2 py-1.5">Status</th>
                <th className="border-b border-blue-100 px-2 py-1.5">Registered</th>
                <th className="border-b border-blue-100 px-2 py-1.5">Check-in</th>
                <th className="border-b border-blue-100 px-2 py-1.5 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {visible.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-2 py-8 text-center text-slate-400">
                    {listBusy
                      ? "Loading participants…"
                      : listError
                        ? listError
                        : source.length === 0
                          ? "No participants registered for this event yet."
                          : "No participants match your filters."}
                  </td>
                </tr>
              ) : (
                visible.map((p, i) => (
                  <tr key={p.id} className="hover:bg-blue-50/40">
                    <td className="border-b border-blue-50 px-2 py-1.5 text-center">
                      <input
                        type="checkbox"
                        checked={Boolean(selected[p.id])}
                        onChange={(e) =>
                          setSelected((prev) => ({ ...prev, [p.id]: e.target.checked }))
                        }
                      />
                    </td>
                    <td className="border-b border-blue-50 px-2 py-1.5 text-slate-500">
                      {pageStart + i + 1}
                    </td>
                    <td className="border-b border-blue-50 px-2 py-1.5">
                      <div className="flex items-center gap-2 whitespace-nowrap">
                        <span
                          className={cn(
                            "grid h-6 w-6 place-items-center rounded-full text-[10px] font-bold",
                            avatarToneClass[p.avatarTone] || avatarToneClass.blue,
                          )}
                        >
                          {p.initials}
                        </span>
                        {p.name}
                      </div>
                    </td>
                    <td className="border-b border-blue-50 px-2 py-1.5 text-[10px]">{p.email}</td>
                    <td className="border-b border-blue-50 px-2 py-1.5">{p.org}</td>
                    <td className="border-b border-blue-50 px-2 py-1.5">{p.type}</td>
                    <td className="border-b border-blue-50 px-2 py-1.5">
                      <span className={statusPillClass(p.status)}>{p.status}</span>
                    </td>
                    <td className="border-b border-blue-50 px-2 py-1.5 whitespace-nowrap">
                      {p.date}
                      {p.time ? ` · ${p.time}` : ""}
                    </td>
                    <td className="border-b border-blue-50 px-2 py-1.5">
                      {p.checkIn === "—" ? "–" : <span className={checkInPillClass(p.checkIn)}>{p.checkIn}</span>}
                    </td>
                    <td className="border-b border-blue-50 px-2 py-1.5 text-center">
                      <div className="inline-flex flex-wrap items-center justify-center gap-1">
                        {needsPaymentConfirm(p) ? (
                          <button
                            type="button"
                            disabled={confirmingId === p.id || !p.passCode}
                            className="inline-flex items-center gap-1 rounded-md border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-50"
                            aria-label={`Confirm payment for ${p.name}`}
                            title={
                              p.passCode
                                ? "Confirm payment (toggle payment status)"
                                : "No pass code on this registration"
                            }
                            onClick={() => {
                              void handleConfirmPayment(p);
                            }}
                          >
                            <BadgeCheck size={12} />
                            {confirmingId === p.id ? "…" : "Confirm Payment"}
                          </button>
                        ) : null}
                        <button
                          type="button"
                          disabled={printingId === p.id || !p.passCode}
                          className="inline-flex items-center gap-1 rounded-md border border-blue-100 px-2 py-0.5 text-[10px] font-semibold text-blue-600 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50"
                          aria-label={`Print ticket for ${p.name}`}
                          title={p.passCode ? "Open event pass PDF" : "No pass code on this registration"}
                          onClick={() => {
                            void (async () => {
                              setPrintingId(p.id);
                              try {
                                closePassPreview();
                                const { url, passCode } = await fetchEventPassPdfUrl(p.passCode || "");
                                setPassPreview({ url, passCode, name: p.name });
                              } catch (err) {
                                toast.error(
                                  err instanceof Error ? err.message : "Unable to load event pass.",
                                );
                              } finally {
                                setPrintingId(null);
                              }
                            })();
                          }}
                        >
                          <Printer size={12} />
                          {printingId === p.id ? "…" : "Print"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap items-center gap-2 border-t border-blue-50 px-2.5 py-2 text-[10px] text-blue-800">
          <span>
            {filtered.length === 0
              ? "0 participants"
              : `Showing ${pageStart + 1}–${pageEnd} of ${filtered.length.toLocaleString()}`}
            {source.length !== filtered.length ? ` (filtered from ${source.length})` : ""}
          </span>
          <span className="flex-1" />
          <button
            type="button"
            disabled={currentPage <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="grid h-7 w-7 place-items-center rounded-md border border-blue-100 disabled:opacity-40"
          >
            ‹
          </button>
          <span className="min-w-[4.5rem] text-center font-semibold">
            {currentPage} / {totalPages}
          </span>
          <button
            type="button"
            disabled={currentPage >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="grid h-7 w-7 place-items-center rounded-md border border-blue-100 disabled:opacity-40"
          >
            ›
          </button>
          <select
            className="h-7 rounded-md border border-blue-100 bg-white px-2 text-[10px]"
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
          >
            <option value={10}>10 / page</option>
            <option value={25}>25 / page</option>
            <option value={50}>50 / page</option>
          </select>
        </div>
      </div>
    </div>
  );
}
