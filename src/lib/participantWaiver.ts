/**
 * Admin-only registration waivers.
 *
 * Backend has no dedicated waiver route yet. We persist intent via:
 *   PATCH /ticketing/{ticketID}/reference  (transactionReference = WAIVER-…)
 *   GET   /ticketing/{ticketID}/confirm
 * and re-hydrate from transactionReference / extraData on list.
 */

import { apiForm, apiRequest } from "./api";
import { getValidAuthToken } from "./auth";
import type { EngagementParticipantTicket } from "./eventParticipants";

export type WaiverReason = "staff" | "gov_speaker" | "sponsor_allocation";
export type PaymentMode = "payable" | "waived" | "complimentary";

export const SPONSOR_COMPLIMENTARY_SEATS = 3;

export type WaiverInfo = {
  paymentMode: PaymentMode;
  waiverReason?: WaiverReason;
  agencyName?: string;
  sponsorTicketID?: string;
  /** Encoded value written to transactionReference */
  transactionReference: string;
};

export type GrantWaiverInput = {
  ticketID: string;
  reason: WaiverReason;
  /** Required when reason is gov_speaker */
  agencyName?: string;
  /** Required when reason is sponsor_allocation — the paid sponsor ticket */
  sponsorTicketID?: string;
};

export type GrantWaiverResult = {
  ticket: EngagementParticipantTicket;
  waiver: WaiverInfo;
  message?: string;
};

const WAIVER_PREFIX = "WAIVER";

export function waiverReasonLabel(reason: WaiverReason): string {
  if (reason === "staff") return "Staff waiver";
  if (reason === "gov_speaker") return "Speaker — Government Agency";
  return "Sponsor complimentary seat";
}

export function encodeWaiverReference(input: {
  reason: WaiverReason;
  agencyName?: string;
  sponsorTicketID?: string;
}): string {
  if (input.reason === "staff") return `${WAIVER_PREFIX}-STAFF`;
  if (input.reason === "gov_speaker") {
    const agency = (input.agencyName || "").trim().replace(/\|/g, " ").slice(0, 80);
    return agency ? `${WAIVER_PREFIX}-GOV-SPEAKER|${agency}` : `${WAIVER_PREFIX}-GOV-SPEAKER`;
  }
  const sponsorId = (input.sponsorTicketID || "").trim();
  if (!sponsorId) throw new Error("Select the sponsor package this free seat belongs to.");
  return `${WAIVER_PREFIX}-SPONSOR:${sponsorId}`;
}

export function parseWaiverFromTicket(ticket: {
  transactionReference?: unknown;
  extraData?: unknown;
  ticketPrice?: unknown;
}): WaiverInfo | null {
  const extra =
    ticket.extraData && typeof ticket.extraData === "object" && !Array.isArray(ticket.extraData)
      ? (ticket.extraData as Record<string, unknown>)
      : null;

  const modeRaw = String(extra?.paymentMode || extra?.payment_mode || "").toLowerCase();
  const reasonRaw = String(extra?.waiverReason || extra?.waiver_reason || "").toLowerCase();
  const ref = String(ticket.transactionReference || extra?.waiverReference || "").trim();

  if (modeRaw === "waived" || modeRaw === "complimentary") {
    const reason = normalizeReason(reasonRaw) || (modeRaw === "complimentary" ? "sponsor_allocation" : "staff");
    return {
      paymentMode: modeRaw === "complimentary" ? "complimentary" : "waived",
      waiverReason: reason,
      agencyName: String(extra?.agencyName || extra?.agency || "").trim() || undefined,
      sponsorTicketID: String(extra?.sponsorTicketID || extra?.sponsor_ticket_id || "").trim() || undefined,
      transactionReference: ref || encodeWaiverReference({ reason }),
    };
  }

  if (!ref.toUpperCase().startsWith(`${WAIVER_PREFIX}-`)) return null;

  const upper = ref.toUpperCase();
  if (upper.startsWith(`${WAIVER_PREFIX}-STAFF`)) {
    return { paymentMode: "waived", waiverReason: "staff", transactionReference: ref };
  }
  if (upper.startsWith(`${WAIVER_PREFIX}-GOV-SPEAKER`)) {
    const agency = ref.includes("|") ? ref.split("|").slice(1).join("|").trim() : "";
    return {
      paymentMode: "waived",
      waiverReason: "gov_speaker",
      agencyName: agency || undefined,
      transactionReference: ref,
    };
  }
  if (upper.startsWith(`${WAIVER_PREFIX}-SPONSOR:`)) {
    const sponsorTicketID = ref.slice(ref.indexOf(":") + 1).trim();
    return {
      paymentMode: "complimentary",
      waiverReason: "sponsor_allocation",
      sponsorTicketID: sponsorTicketID || undefined,
      transactionReference: ref,
    };
  }

  // Generic WAIVER-* → treated as staff waiver
  if (upper.startsWith(WAIVER_PREFIX)) {
    return { paymentMode: "waived", waiverReason: "staff", transactionReference: ref };
  }

  return null;
}

function normalizeReason(raw: string): WaiverReason | undefined {
  if (raw === "staff") return "staff";
  if (raw === "gov_speaker" || raw === "gov-speaker" || raw === "government_speaker") return "gov_speaker";
  if (raw === "sponsor_allocation" || raw === "sponsor" || raw === "complimentary") return "sponsor_allocation";
  return undefined;
}

function pickTicket(result: Record<string, unknown>, fallbackId: string): EngagementParticipantTicket {
  const ticket = (result.ticket || result) as EngagementParticipantTicket;
  return {
    ...ticket,
    ticketID: String(ticket.ticketID || fallbackId),
  };
}

/**
 * Admin grant: write waiver reference, then confirm ticket (marks registration complete).
 */
export async function grantParticipantWaiver(input: GrantWaiverInput): Promise<GrantWaiverResult> {
  const ticketID = input.ticketID.trim();
  if (!ticketID) throw new Error("A ticket ID is required to grant a waiver.");

  if (input.reason === "gov_speaker" && !input.agencyName?.trim()) {
    throw new Error("Enter the government agency for this speaker waiver.");
  }
  if (input.reason === "sponsor_allocation" && !input.sponsorTicketID?.trim()) {
    throw new Error("Select which sponsor this complimentary seat belongs to.");
  }

  const token = getValidAuthToken();
  if (!token) throw new Error("Sign in as admin to grant a waiver.");

  const waiver: WaiverInfo = {
    paymentMode: input.reason === "sponsor_allocation" ? "complimentary" : "waived",
    waiverReason: input.reason,
    agencyName: input.agencyName?.trim() || undefined,
    sponsorTicketID: input.sponsorTicketID?.trim() || undefined,
    transactionReference: encodeWaiverReference({
      reason: input.reason,
      agencyName: input.agencyName,
      sponsorTicketID: input.sponsorTicketID,
    }),
  };

  const formData = new FormData();
  formData.append("transactionReference", waiver.transactionReference);
  // Hint for backends that accept extra fields on the same multipart
  formData.append("paymentMode", waiver.paymentMode);
  formData.append("waiverReason", waiver.waiverReason || "");
  if (waiver.agencyName) formData.append("agencyName", waiver.agencyName);
  if (waiver.sponsorTicketID) formData.append("sponsorTicketID", waiver.sponsorTicketID);

  await apiForm<Record<string, unknown>>(`/ticketing/${encodeURIComponent(ticketID)}/reference`, {
    method: "PATCH",
    formData,
    token,
  });

  const confirmResult = await apiRequest<Record<string, unknown>>(
    `/ticketing/confirm/${encodeURIComponent(ticketID)}`,
    { method: "GET", token },
  );

  const ticket = pickTicket(confirmResult, ticketID);
  const message =
    typeof confirmResult.message === "string" && confirmResult.message.trim()
      ? confirmResult.message.trim()
      : undefined;

  return { ticket, waiver, message };
}

export function countSponsorComplimentaryUsed(
  participants: Array<{ paymentMode?: PaymentMode; waiverReason?: WaiverReason; sponsorTicketID?: string }>,
  sponsorTicketID: string,
): number {
  const id = sponsorTicketID.trim();
  if (!id) return 0;
  return participants.filter(
    (p) =>
      p.paymentMode === "complimentary" &&
      p.waiverReason === "sponsor_allocation" &&
      (p.sponsorTicketID || "") === id,
  ).length;
}

export function sponsorSeatsRemaining(
  participants: Array<{ paymentMode?: PaymentMode; waiverReason?: WaiverReason; sponsorTicketID?: string }>,
  sponsorTicketID: string,
  limit = SPONSOR_COMPLIMENTARY_SEATS,
): number {
  return Math.max(0, limit - countSponsorComplimentaryUsed(participants, sponsorTicketID));
}
