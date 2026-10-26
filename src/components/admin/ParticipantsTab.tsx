import { useCallback, useEffect, useMemo, useState } from "react";
import { Check, Download, Plus, Printer, Search, Timer, Users } from "lucide-react";
import { AddParticipantModal, type AddedParticipant } from "./AddParticipantModal";
import { GrantWaiverModal } from "./GrantWaiverModal";
import { ParticipantDetailModal } from "./ParticipantDetailModal";
import { PaymentProofReviewModal } from "./PaymentProofReviewModal";
import { EventPassPreviewModal } from "../tickets/EventPassPreviewModal";
import { useToast } from "../ui/Toast";
import { ApiError } from "../../lib/api";
import { cn } from "../../lib/cn";
import {
  cancelParticipantTicket,
  createAdminParticipant,
  listEventParticipants,
  toggleParticipantPayment,
} from "../../lib/eventParticipants";
import {
  grantParticipantWaiver,
  waiverReasonLabel,
  type WaiverReason,
} from "../../lib/participantWaiver";
import { fetchEventPassPdfUrl } from "../../lib/printParticipantTicket";

/** Temporarily off until POST /ticketing waiver payload is confirmed with backend. */
const WAIVER_ENABLED = false;

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
  if (status === "Confirmed") return "rounded-md bg-emerald-100 px-2 py-0.5 text-[13px] font-semibold text-emerald-700";
  if (status === "Waived") return "rounded-md bg-sky-100 px-2 py-0.5 text-[13px] font-semibold text-sky-800";
  if (status === "Complimentary") return "rounded-md bg-violet-100 px-2 py-0.5 text-[13px] font-semibold text-violet-800";
  if (status === "Pending verification") {
    return "rounded-md bg-amber-100 px-2 py-0.5 text-[13px] font-semibold text-amber-800";
  }
  if (status === "Draft") {
    return "rounded-md bg-orange-100 px-2 py-0.5 text-[13px] font-semibold text-orange-800";
  }
  if (status === "Registered" || status === "Pending") {
    return "rounded-md bg-slate-100 px-2 py-0.5 text-[13px] font-semibold text-slate-700";
  }
  if (status === "Cancelled") return "rounded-md bg-red-100 px-2 py-0.5 text-[13px] font-semibold text-red-600";
  return "rounded-md bg-slate-100 px-2 py-0.5 text-[13px] font-semibold text-slate-600";
}

function checkInPillClass(checkIn: string) {
  if (checkIn === "Checked In") return "rounded-md bg-emerald-100 px-2 py-0.5 text-[13px] text-emerald-700";
  return "rounded-md bg-slate-100 px-2 py-0.5 text-[13px] text-slate-600";
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
  /** Brief flash when toggle-on fails so the switch snaps back visibly. */
  const [toggleFailedId, setToggleFailedId] = useState<string | null>(null);
  const [waiverTarget, setWaiverTarget] = useState<AddedParticipant | null>(null);
  const [waiverBusy, setWaiverBusy] = useState(false);
  const [addBusy, setAddBusy] = useState(false);
  const [detailTarget, setDetailTarget] = useState<AddedParticipant | null>(null);
  const [proofTarget, setProofTarget] = useState<AddedParticipant | null>(null);
  const [cancelBusyId, setCancelBusyId] = useState<string | null>(null);
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

  const isWaived = (p: AddedParticipant) =>
    p.paymentMode === "waived" ||
    p.paymentMode === "complimentary" ||
    p.status === "Waived" ||
    p.status === "Complimentary";

  const isPaymentPaid = (p: AddedParticipant) => {
    if (isWaived(p)) return true;
    if (p.passAllowed || p.verificationBucket === "confirmed") return true;
    const raw = (p.rawStatus || "").toLowerCase();
    // Backend: issued = confirmed; checked-in = on site.
    if (raw === "issued" || raw === "checked-in" || raw === "checked_in") return true;
    return p.status === "Confirmed";
  };

  /** Keep Paid toggle visible for all non-cancelled participants. */
  const showPaymentToggle = (p: AddedParticipant) => {
    if (p.status === "Cancelled") return false;
    const raw = (p.rawStatus || "").toLowerCase();
    if (raw === "cancelled" || raw === "canceled") return false;
    return true;
  };

  const canGrantWaiver = (p: AddedParticipant) => {
    if (!WAIVER_ENABLED) return false;
    if (isWaived(p) || isPaymentPaid(p)) return false;
    if (p.status === "Cancelled") return false;
    const ticketID = p.ticketID || (p.id && !p.id.startsWith("p-") ? p.id : "");
    return Boolean(ticketID);
  };

  const applyWaiverLocally = (
    p: AddedParticipant,
    patch: {
      paymentMode: "waived" | "complimentary";
      waiverReason: WaiverReason;
      agencyName?: string;
      sponsorTicketID?: string;
      transactionReference?: string;
      rawStatus?: string;
    },
  ) => {
    const status = patch.paymentMode === "complimentary" ? "Complimentary" : "Waived";
    const next = {
      ...p,
      status,
      paymentMode: patch.paymentMode,
      waiverReason: patch.waiverReason,
      agencyName: patch.agencyName,
      sponsorTicketID: patch.sponsorTicketID,
      transactionReference: patch.transactionReference,
      rawStatus: patch.rawStatus || p.rawStatus || "registered",
    };
    setApiRows((prev) => prev.map((row) => (row.id === p.id ? { ...row, ...next } : row)));
    setLocalRows((prev) => prev.map((row) => (row.id === p.id ? { ...row, ...next } : row)));
  };

  const handleGrantWaiver = async (input: {
    reason: WaiverReason;
    agencyName?: string;
    sponsorTicketID?: string;
  }) => {
    const p = waiverTarget;
    if (!p) return;
    const ticketID = p.ticketID || (p.id && !p.id.startsWith("p-") ? p.id : "");
    if (!ticketID) {
      toast.error("No ticket ID on this registration — cannot grant waiver.");
      return;
    }
    setWaiverBusy(true);
    try {
      const { ticket, waiver, message } = await grantParticipantWaiver({
        ticketID,
        engagementID: eventId,
        reason: input.reason,
        agencyName: input.agencyName,
        sponsorTicketID: input.sponsorTicketID,
        fullName: p.name,
        email: p.email,
        phoneNo: p.phone,
        participationType: p.participationType,
        organisation: p.org !== "—" ? p.org : undefined,
        jobTitle: p.jobTitle,
        country: p.country,
        city: p.city,
        title: p.title,
      });
      const mode: "waived" | "complimentary" =
        input.reason === "sponsor_allocation" ? "complimentary" : "waived";
      applyWaiverLocally(p, {
        paymentMode: mode,
        waiverReason: waiver.waiverReason || input.reason,
        agencyName: waiver.agencyName,
        sponsorTicketID: waiver.sponsorTicketID,
        transactionReference: waiver.transactionReference,
        rawStatus: String(ticket.status || "registered").toLowerCase(),
      });
      toast.success(
        message ||
          `${waiverReasonLabel(input.reason)} granted for ${p.name}.`,
      );
      setWaiverTarget(null);
      void reloadParticipants();
    } catch (err) {
      toast.error(
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Could not grant waiver.",
      );
    } finally {
      setWaiverBusy(false);
    }
  };

  const handleTogglePayment = async (p: AddedParticipant) => {
    const ticketID = p.ticketID || (p.id && !p.id.startsWith("p-") ? p.id : "");
    if (!ticketID) {
      toast.error("No ticket ID on this registration — cannot toggle payment.");
      return;
    }
    // Already paid / waived — API cannot unconfirm; keep switch on.
    if (isPaymentPaid(p)) {
      toast.info(
        isWaived(p)
          ? "This registration is waived — payment toggle is not needed."
          : "Payment is already confirmed. Unconfirm is not supported yet.",
      );
      return;
    }
    setToggleFailedId(null);
    setConfirmingId(p.id);
    try {
      const { ticket, message } = await toggleParticipantPayment(ticketID);
      const nextStatus = String(ticket.status || "issued").toLowerCase();
      const patch = {
        status: "Confirmed" as const,
        rawStatus: nextStatus,
        verificationBucket: "confirmed" as const,
        passAllowed: true,
        transactionReference: String(ticket.transactionReference || p.transactionReference || ""),
        displayPaymentReference:
          p.displayPaymentReference || p.transactionReference || undefined,
        checkIn: nextStatus.includes("checked") ? "Checked In" : p.checkIn,
      };
      setApiRows((prev) => prev.map((row) => (row.id === p.id ? { ...row, ...patch } : row)));
      setLocalRows((prev) => prev.map((row) => (row.id === p.id ? { ...row, ...patch } : row)));
      setDetailTarget((prev) => (prev?.id === p.id ? { ...prev, ...patch } : prev));
      setProofTarget((prev) => (prev?.id === p.id ? { ...prev, ...patch } : prev));
      toast.success(message || `Payment verified for ${p.name}. Pass can now be issued.`);
      void reloadParticipants();
      setProofTarget(null);
    } catch (err) {
      // Leave row Pending — switch snaps back off; flash red briefly.
      setToggleFailedId(p.id);
      window.setTimeout(() => {
        setToggleFailedId((id) => (id === p.id ? null : id));
      }, 1200);
      toast.error(
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Payment toggle failed — still pending. Try again.",
      );
      void reloadParticipants();
    } finally {
      setConfirmingId(null);
    }
  };

  const handleCancelTicket = async (p: AddedParticipant) => {
    const ticketID = p.ticketID || (p.id && !p.id.startsWith("p-") ? p.id : "");
    if (!ticketID) {
      toast.error("No ticket ID on this registration — cannot cancel.");
      return;
    }
    if (p.status === "Cancelled") {
      toast.info("This registration is already cancelled.");
      return;
    }
    const ok = window.confirm(
      `Cancel registration for ${p.name}? Their event pass will no longer be valid.`,
    );
    if (!ok) return;

    setCancelBusyId(p.id);
    try {
      await cancelParticipantTicket(ticketID, eventId);
      const patch = {
        status: "Cancelled" as const,
        rawStatus: "cancelled",
        verificationBucket: "cancelled" as const,
        passAllowed: false,
        checkIn: "—",
      };
      setApiRows((prev) => prev.map((row) => (row.id === p.id ? { ...row, ...patch } : row)));
      setLocalRows((prev) => prev.map((row) => (row.id === p.id ? { ...row, ...patch } : row)));
      setDetailTarget((prev) => (prev?.id === p.id ? { ...prev, ...patch } : prev));
      setProofTarget(null);
      toast.success(`Cancelled registration for ${p.name}.`);
      void reloadParticipants();
    } catch (err) {
      toast.error(
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Could not cancel ticket.",
      );
    } finally {
      setCancelBusyId(null);
    }
  };

  const canReviewProof = (p: AddedParticipant) => {
    if (p.status === "Cancelled" || isPaymentPaid(p)) return false;
    if (p.verificationBucket === "pending_verification") return true;
    if (p.status === "Pending verification" || p.status === "Draft" || p.status === "Registered") {
      return true;
    }
    const raw = (p.rawStatus || "").toLowerCase();
    // registered = pending admin; draft = incomplete. issued is confirmed — not review.
    if (raw === "draft" || raw === "registered") return true;
    return Boolean(p.paymentReceiptURL || p.paymentProofUrls?.length || p.displayPaymentReference);
  };

  const openParticipantReview = (p: AddedParticipant) => {
    if (canReviewProof(p) && !isPaymentPaid(p)) {
      setProofTarget(p);
      return;
    }
    setDetailTarget(p);
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

  const registeredCount = source.filter((p) => p.status === "Registered").length;
  const pendingVerificationCount = source.filter(
    (p) => p.status === "Pending verification",
  ).length;
  const confirmedCount = source.filter((p) => p.status === "Confirmed").length;
  const waivedCount = source.filter(
    (p) => p.status === "Waived" || p.status === "Complimentary",
  ).length;
  const listBusy = listLoading || (fromApi && loading);

  const kpis = [
    { label: "Total", value: listBusy ? "…" : String(source.length), Icon: Users, tone: "blue" },
    {
      label: "Registered",
      value: listBusy ? "…" : String(registeredCount),
      Icon: Users,
      tone: "blue",
    },
    {
      label: "Pending verification",
      value: listBusy ? "…" : String(pendingVerificationCount),
      Icon: Timer,
      tone: "amber",
    },
    {
      label: "Confirmed",
      value: listBusy ? "…" : String(confirmedCount),
      Icon: Check,
      tone: "green",
    },
    {
      label: "Waived",
      value: listBusy ? "…" : String(waivedCount),
      Icon: Check,
      tone: "sky",
    },
  ];

  const iconTone: Record<string, string> = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-emerald-50 text-emerald-600",
    amber: "bg-amber-50 text-amber-500",
    red: "bg-red-50 text-red-500",
    purple: "bg-purple-50 text-purple-600",
    sky: "bg-sky-50 text-sky-600",
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
        busy={addBusy}
        participants={source}
        onClose={() => {
          if (!addBusy) setAddOpen(false);
        }}
        onAdd={async (draft) => {
          if (!fromApi || !eventId) {
            throw new Error("Open a live event and sign in to add participants.");
          }
          setAddBusy(true);
          try {
            const created = await createAdminParticipant({
              engagementID: eventId,
              participationType: draft.participationType,
              title: draft.details.title,
              fullName: draft.details.fullName,
              email: draft.details.email,
              phone: draft.details.phone,
              organisation: draft.details.organisation,
              jobTitle: draft.details.jobTitle,
              country: draft.details.country,
              city: draft.details.city,
              dietary: draft.details.dietary,
              accessibility: draft.details.accessibility,
              waiver: draft.waiver,
            });
            setLocalRows((prev) => [created, ...prev]);
            toast.success(
              draft.waiver
                ? `${created.name} added with ${waiverReasonLabel(draft.waiver.reason)}.`
                : `${created.name} added as ${created.type}.`,
            );
            void reloadParticipants();
          } catch (err) {
            const message =
              err instanceof ApiError
                ? err.message
                : err instanceof Error
                  ? err.message
                  : "Could not add participant.";
            toast.error(message);
            throw err instanceof Error ? err : new Error(message);
          } finally {
            setAddBusy(false);
          }
        }}
      />

      <GrantWaiverModal
        open={Boolean(waiverTarget)}
        participant={waiverTarget}
        participants={source}
        busy={waiverBusy}
        onClose={() => {
          if (!waiverBusy) setWaiverTarget(null);
        }}
        onGrant={(input) => {
          void handleGrantWaiver(input);
        }}
      />

      <ParticipantDetailModal
        open={Boolean(detailTarget)}
        participant={detailTarget}
        verifyBusy={confirmingId === detailTarget?.id}
        cancelBusy={cancelBusyId === detailTarget?.id}
        onClose={() => setDetailTarget(null)}
        onVerify={(p) => {
          void handleTogglePayment(p);
        }}
        onCancelTicket={(p) => {
          void handleCancelTicket(p);
        }}
        onViewProof={(p) => {
          setDetailTarget(null);
          setProofTarget(p);
        }}
        onWaiver={
          WAIVER_ENABLED
            ? (p) => {
                setDetailTarget(null);
                setWaiverTarget(p);
              }
            : undefined
        }
      />

      <PaymentProofReviewModal
        open={Boolean(proofTarget)}
        participant={proofTarget}
        approveBusy={confirmingId === proofTarget?.id}
        cancelBusy={cancelBusyId === proofTarget?.id}
        onClose={() => {
          if (!confirmingId && !cancelBusyId) setProofTarget(null);
        }}
        onApprove={(p) => {
          void handleTogglePayment(p);
        }}
        onCancelTicket={(p) => {
          void handleCancelTicket(p);
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

      {pendingVerificationCount > 0 && !listBusy ? (
        <div className="mb-2.5 flex flex-wrap items-center gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-[13px] text-amber-950">
          <Timer size={16} className="shrink-0 text-amber-700" />
          <span className="font-semibold">
            {pendingVerificationCount} registration
            {pendingVerificationCount === 1 ? "" : "s"} awaiting payment verification
          </span>
          <button
            type="button"
            className="ml-auto rounded-md border border-amber-300 bg-white px-2.5 py-1 text-[12px] font-semibold text-amber-900 hover:bg-amber-100"
            onClick={() => setStatusFilter("Pending verification")}
          >
            Review queue
          </button>
        </div>
      ) : null}

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
              <span className="block truncate text-[13px] text-blue-700">{kpi.label}</span>
            </div>
          </article>
        ))}
      </section>

      <div className="overflow-hidden rounded-lg border border-blue-100 bg-white shadow-sm">
        <div className="flex flex-wrap items-center gap-2 border-b border-blue-50 px-2.5 py-2">
          <label className="flex h-8 min-w-[180px] flex-1 items-center gap-2 rounded-md border border-blue-100 px-2">
            <Search size={14} className="shrink-0 text-blue-700" />
            <input
              className="w-full min-w-0 bg-transparent text-[14px] outline-none placeholder:text-blue-400"
              placeholder="Search name, email, org…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>
          <select
            className="h-8 rounded-md border border-blue-100 bg-white px-2 text-[14px]"
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
            className="h-8 rounded-md border border-blue-100 bg-white px-2 text-[14px]"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All status</option>
            <option>Draft</option>
            <option>Registered</option>
            <option>Pending verification</option>
            <option>Confirmed</option>
            <option>Waived</option>
            <option>Complimentary</option>
            <option>Cancelled</option>
          </select>
          <select
            className="h-8 max-w-[160px] rounded-md border border-blue-100 bg-white px-2 text-[14px]"
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
            className="inline-flex h-8 items-center gap-1.5 rounded-md border border-blue-100 px-2.5 text-[14px] font-semibold text-blue-600 hover:bg-blue-50"
          >
            <Download size={13} /> Export
          </button>
          <button
            type="button"
            onClick={() => setAddOpen(true)}
            className="inline-flex h-8 items-center gap-1.5 rounded-md bg-blue-600 px-2.5 text-[14px] font-semibold text-white hover:bg-blue-700"
          >
            <Plus size={13} strokeWidth={3} /> Add
          </button>
        </div>

        <div className="max-h-[min(52vh,520px)] overflow-auto [scrollbar-width:thin]">
          <table className="w-full min-w-[760px] border-separate border-spacing-0 text-[14px] text-blue-900">
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
                            "grid h-6 w-6 place-items-center rounded-full text-[13px] font-bold",
                            avatarToneClass[p.avatarTone] || avatarToneClass.blue,
                          )}
                        >
                          {p.initials}
                        </span>
                        <button
                          type="button"
                          className="text-left font-semibold text-blue-700 hover:underline"
                          onClick={() => openParticipantReview(p)}
                        >
                          {p.name}
                        </button>
                      </div>
                    </td>
                    <td className="border-b border-blue-50 px-2 py-1.5 text-[13px]">{p.email}</td>
                    <td className="border-b border-blue-50 px-2 py-1.5">{p.org}</td>
                    <td className="border-b border-blue-50 px-2 py-1.5">{p.type}</td>
                    <td className="border-b border-blue-50 px-2 py-1.5">
                      <div className="flex flex-col items-start gap-0.5">
                        <span className={statusPillClass(p.status)}>{p.status}</span>
                        {p.waiverReason ? (
                          <span className="text-[12px] text-slate-500">
                            {waiverReasonLabel(p.waiverReason)}
                            {p.agencyName ? ` · ${p.agencyName}` : ""}
                          </span>
                        ) : null}
                      </div>
                    </td>
                    <td className="border-b border-blue-50 px-2 py-1.5 whitespace-nowrap">
                      {p.date}
                      {p.time ? ` · ${p.time}` : ""}
                    </td>
                    <td className="border-b border-blue-50 px-2 py-1.5">
                      {p.checkIn === "—" ? "–" : <span className={checkInPillClass(p.checkIn)}>{p.checkIn}</span>}
                    </td>
                    <td className="border-b border-blue-50 px-2 py-1.5 text-center">
                      <div className="inline-flex flex-wrap items-center justify-center gap-1.5">
                        {showPaymentToggle(p) && !isWaived(p) ? (
                          <label
                            className="inline-flex items-center gap-1.5"
                            title={
                              !(p.ticketID || p.id)
                                ? "No ticket ID on this registration"
                                : toggleFailedId === p.id
                                  ? "Confirm failed — still pending"
                                  : isPaymentPaid(p)
                                    ? "Payment confirmed"
                                    : "Toggle on to confirm payment"
                            }
                          >
                            <span
                              className={cn(
                                "text-[12px] font-semibold",
                                toggleFailedId === p.id
                                  ? "text-red-600"
                                  : isPaymentPaid(p)
                                    ? "text-emerald-700"
                                    : "text-amber-700",
                              )}
                            >
                              Paid
                            </span>
                            <button
                              type="button"
                              role="switch"
                              aria-checked={isPaymentPaid(p) || confirmingId === p.id}
                              aria-label={`Toggle payment for ${p.name}`}
                              disabled={
                                confirmingId === p.id || !(p.ticketID || (p.id && !p.id.startsWith("p-")))
                              }
                              onClick={() => {
                                void handleTogglePayment(p);
                              }}
                              className={cn(
                                "relative h-5 w-9 shrink-0 rounded-full transition-colors disabled:cursor-not-allowed disabled:opacity-50",
                                toggleFailedId === p.id
                                  ? "bg-red-300"
                                  : isPaymentPaid(p) || confirmingId === p.id
                                    ? "bg-emerald-500"
                                    : "bg-slate-300",
                                confirmingId === p.id && "opacity-70",
                              )}
                            >
                              <span
                                className={cn(
                                  "absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform",
                                  (isPaymentPaid(p) || confirmingId === p.id) && "translate-x-4",
                                )}
                              />
                            </button>
                          </label>
                        ) : null}
                        {canGrantWaiver(p) ? (
                          <button
                            type="button"
                            className="inline-flex items-center gap-1 rounded-md border border-sky-200 bg-sky-50 px-2 py-0.5 text-[13px] font-semibold text-sky-800 hover:bg-sky-100"
                            aria-label={`Grant waiver for ${p.name}`}
                            title="Grant staff / gov speaker / sponsor free-seat waiver"
                            onClick={() => setWaiverTarget(p)}
                          >
                            Waiver
                          </button>
                        ) : null}
                        <button
                          type="button"
                          disabled={
                            printingId === p.id ||
                            !p.passCode ||
                            !(p.passAllowed || isPaymentPaid(p))
                          }
                          className="inline-flex items-center gap-1 rounded-md border border-blue-100 px-2 py-0.5 text-[13px] font-semibold text-blue-600 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50"
                          aria-label={`Print ticket for ${p.name}`}
                          title={
                            !(p.passAllowed || isPaymentPaid(p))
                              ? "Verify payment before issuing pass"
                              : p.passCode
                                ? "Open event pass PDF"
                                : "No pass code on this registration"
                          }
                          onClick={() => {
                            void (async () => {
                              if (!(p.passAllowed || isPaymentPaid(p))) {
                                toast.info("Verify payment before printing the event pass.");
                                return;
                              }
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
                        {canReviewProof(p) && !isPaymentPaid(p) ? (
                          <button
                            type="button"
                            className="inline-flex items-center rounded-md border border-amber-200 bg-amber-50 px-2 py-0.5 text-[12px] font-semibold text-amber-900 hover:bg-amber-100"
                            onClick={() => setProofTarget(p)}
                          >
                            Confirm
                          </button>
                        ) : null}
                        <button
                          type="button"
                          className="inline-flex items-center rounded-md border border-blue-100 px-2 py-0.5 text-[12px] font-semibold text-blue-700 hover:bg-blue-50"
                          onClick={() => setDetailTarget(p)}
                        >
                          Details
                        </button>
                        {p.status !== "Cancelled" ? (
                          <button
                            type="button"
                            disabled={
                              cancelBusyId === p.id ||
                              !(p.ticketID || (p.id && !p.id.startsWith("p-")))
                            }
                            className="inline-flex items-center rounded-md border border-red-200 bg-red-50 px-2 py-0.5 text-[12px] font-semibold text-red-700 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                            aria-label={`Cancel ticket for ${p.name}`}
                            title="Cancel this registration"
                            onClick={() => {
                              void handleCancelTicket(p);
                            }}
                          >
                            {cancelBusyId === p.id ? "…" : "Cancel"}
                          </button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap items-center gap-2 border-t border-blue-50 px-2.5 py-2 text-[13px] text-blue-800">
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
            className="h-7 rounded-md border border-blue-100 bg-white px-2 text-[13px]"
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
