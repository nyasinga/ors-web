/**
 * Payment verification lifecycle (admin must approve before pass/QR).
 *
 * Backend EngagementTicketStatus:
 *   draft      — incomplete / early
 *   registered — participant supplied info + proof; pending admin approval
 *   issued     — confirmed (admin approved / ticket issued)
 *   checked-in — arrived on site
 *   cancelled  — void
 *
 * Also encoded in transactionReference when helpful:
 *   VERIFIED|<original-ref>  → admin confirmed stamp
 *   WAIVER-…                 → waived / complimentary (see participantWaiver)
 */

import { apiForm } from "./api";
import { getValidAuthToken } from "./auth";
import { parseWaiverFromTicket } from "./participantWaiver";

export const VERIFIED_PREFIX = "VERIFIED|";

export type VerificationBucket =
  | "draft"
  | "registered"
  | "pending_verification"
  | "confirmed"
  | "waived"
  | "complimentary"
  | "cancelled";

export function encodeVerifiedReference(originalRef?: string): string {
  const raw = (originalRef || "").trim();
  if (raw.toUpperCase().startsWith(VERIFIED_PREFIX)) return raw;
  if (raw.toUpperCase().startsWith("WAIVER-")) return raw;
  return `${VERIFIED_PREFIX}${raw || "ADMIN"}`;
}

export function stripVerifiedPrefix(ref?: string): string {
  const raw = (ref || "").trim();
  if (raw.toUpperCase().startsWith(VERIFIED_PREFIX)) {
    return raw.slice(VERIFIED_PREFIX.length).trim();
  }
  return raw;
}

export function isAdminVerifiedReference(ref?: string): boolean {
  return (ref || "").trim().toUpperCase().startsWith(VERIFIED_PREFIX);
}

export function resolveVerificationBucket(ticket: {
  status?: unknown;
  transactionReference?: unknown;
  paymentReceiptURL?: unknown;
  paymentMode?: unknown;
  extraData?: unknown;
}): VerificationBucket {
  const status = String(ticket.status || "").toLowerCase();
  if (status === "cancelled" || status === "canceled") return "cancelled";

  const waiver = parseWaiverFromTicket(ticket);
  if (waiver?.paymentMode === "complimentary") return "complimentary";
  if (waiver?.paymentMode === "waived") return "waived";

  // Canonical backend statuses (source of truth for list display).
  if (status === "checked-in" || status === "checked_in") return "confirmed";
  if (status === "issued") return "confirmed";

  const ref = String(ticket.transactionReference || "").trim();
  const receipt = String(ticket.paymentReceiptURL || "").trim();
  const extra =
    ticket.extraData && typeof ticket.extraData === "object" && !Array.isArray(ticket.extraData)
      ? (ticket.extraData as Record<string, unknown>)
      : null;
  const flagged =
    extra?.paymentVerified === true ||
    String(extra?.paymentVerified || "").toLowerCase() === "true" ||
    Boolean(extra?.verifiedAt);

  // Admin stamp (e.g. admin-add) even if API status has not moved to issued yet.
  if (isAdminVerifiedReference(ref) || flagged) return "confirmed";

  // registered = proof/info complete, awaiting admin approval.
  if (status === "registered") return "pending_verification";

  if (status === "draft") return "draft";

  // Fallback when status is missing.
  if (ref || receipt) return "pending_verification";
  return "draft";
}

export function verificationBucketLabel(bucket: VerificationBucket): string {
  switch (bucket) {
    case "draft":
      return "Draft";
    case "pending_verification":
      return "Pending verification";
    case "confirmed":
      return "Confirmed";
    case "waived":
      return "Waived";
    case "complimentary":
      return "Complimentary";
    case "cancelled":
      return "Cancelled";
    case "registered":
      return "Registered";
    default:
      return "Draft";
  }
}

/** Registrant may download pass / QR only when verified (confirmed or waived). */
export function canIssueEventPass(ticket: {
  status?: unknown;
  transactionReference?: unknown;
  paymentReceiptURL?: unknown;
  paymentMode?: unknown;
  extraData?: unknown;
}): boolean {
  const bucket = resolveVerificationBucket(ticket);
  return (
    bucket === "confirmed" || bucket === "waived" || bucket === "complimentary"
  );
}

/**
 * Stamp ticket as admin-verified after confirm (persists via PATCH reference).
 */
export async function stampTicketVerified(
  ticketID: string,
  currentReference?: string,
): Promise<string> {
  const id = ticketID.trim();
  if (!id) throw new Error("Ticket ID is required.");
  const token = getValidAuthToken();
  if (!token) throw new Error("Sign in as admin to verify payment.");

  const stamped = encodeVerifiedReference(currentReference);
  const formData = new FormData();
  formData.append("transactionReference", stamped);
  formData.append("paymentVerified", "true");

  await apiForm(`/ticketing/${encodeURIComponent(id)}`, {
    method: "PATCH",
    formData,
    token,
  });

  return stamped;
}
